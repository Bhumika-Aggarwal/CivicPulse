-- PostGIS Extension Preflight Migration
-- PRD Rule §11.4: Enable PostGIS and verify spatial capability

CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS version in schema log or queryable comment
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    RAISE EXCEPTION 'PostGIS extension could not be installed. Check Neon compute capabilities.';
  END IF;
END $$;
