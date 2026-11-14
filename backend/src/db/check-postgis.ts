import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const { Client } = pg;

export async function checkPostgisCapability(): Promise<{ success: boolean; version?: string; error?: string }> {
  const connectionString = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!connectionString) {
    return { success: false, error: 'No database connection string configured.' };
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    logger.info('Connected to PostgreSQL for PostGIS preflight check.');

    // 1. Enable extension if permitted
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    // 2. Query PostGIS version
    const res = await client.query('SELECT PostGIS_Full_Version() as version;');
    const version = res.rows[0]?.version;
    logger.info({ version }, 'PostGIS verified successfully.');

    // 3. Smoke test geometry operation
    const smoke = await client.query(`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
        ST_SetSRID(ST_MakePoint(77.6000, 12.9750), 4326)::geography
      ) AS distance_meters;
    `);
    logger.info({ distance: smoke.rows[0]?.distance_meters }, 'PostGIS ST_Distance smoke test passed.');

    return { success: true, version };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ error: errorMsg }, 'PostGIS capability check failed.');
    return { success: false, error: errorMsg };
  } finally {
    await client.end().catch(() => {});
  }
}

// Allow CLI execution via `npm run db:check`
if (process.argv[1]?.endsWith('check-postgis.ts')) {
  checkPostgisCapability()
    .then((result) => {
      console.log('Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
