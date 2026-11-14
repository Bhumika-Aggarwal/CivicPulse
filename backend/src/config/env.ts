import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_UNPOOLED: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  LOCATION_CLIENT_INTERVAL_MS: z.coerce.number().default(5000),
  LOCATION_PERSIST_INTERVAL_MS: z.coerce.number().default(60000),
  LOCATION_PERSIST_DISTANCE_METERS: z.coerce.number().default(25),
  LOCATION_RETENTION_DAYS: z.coerce.number().default(30),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    console.error('❌ Environment validation failed:\n', missing.join('\n'));
    // In dev mode provide fallback notice instead of crashing abruptly if DB is not configured yet
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running in development with partial env config.');
    }
  }
  return parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof envSchema>);
};

export const env = parseEnv();
