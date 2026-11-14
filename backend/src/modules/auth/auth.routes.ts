import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, getMe } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export const authRouter = Router();

// Anti-brute force rate limiting (5 attempts per minute on auth endpoints)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 1 minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, getMe);
