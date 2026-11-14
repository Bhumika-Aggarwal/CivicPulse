import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../../db/client.js';
import { users } from '../../db/schema/users.js';
import { refreshTokens } from '../../db/schema/tokens.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './auth.utils.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
};

export async function register(req: Request, res: Response): Promise<void> {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid registration details.',
        details: parseResult.error.errors,
      },
    });
    return;
  }

  const { fullName, email, password } = parseResult.data;

  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      // Generic error to prevent email enumeration
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'An account with this email address cannot be created.',
        },
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    // Initial self-registration is strictly CITIZEN per PRD Rule §4.1 / §6.1
    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email,
        passwordHash,
        role: 'CITIZEN',
        isActive: true,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as 'CITIZEN' | 'WORKER' | 'SUPERVISOR' | 'ADMIN',
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Save refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db.insert(refreshTokens).values({
      userId: newUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        accessToken,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Registration error');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed unexpectedly.' },
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email or password format.',
      },
    });
    return;
  }

  const { email, password } = parseResult.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'CITIZEN' | 'WORKER' | 'SUPERVISOR' | 'ADMIN',
      departmentId: user.departmentId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId,
        },
        accessToken,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Login error');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed unexpectedly.' },
    });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token missing.' },
    });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Session expired. Please log in.' },
    });
    return;
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const [savedToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!savedToken || savedToken.isRevoked || new Date(savedToken.expiresAt) < new Date()) {
      res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REVOKED', message: 'Session invalidated. Please log in.' },
      });
      return;
    }

    // Revoke old refresh token for rotation
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, savedToken.id));

    // Issue new pair
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'Account is deactivated.' },
      });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'CITIZEN' | 'WORKER' | 'SUPERVISOR' | 'ADMIN',
      departmentId: user.departmentId,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('access_token', newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Refresh token error');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to refresh token.' },
    });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .catch(() => {});
  }

  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);

  res.json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        departmentId: users.departmentId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve profile.' },
    });
  }
}
