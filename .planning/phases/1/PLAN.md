# Phase 1 — Foundation, Neon Database & PostGIS Setup

**Phase:** 1  
**Status:** In Progress  
**Objective:** Scaffold `frontend/` and `backend/` monorepo workspaces under the 3-file root constraint, establish environment validation, configure Neon PostgreSQL with Drizzle ORM, verify PostGIS extension capability, and implement health check endpoint with database smoke tests.

---

## 1. Scope & Deliverables

- [x] **Task 1.1: Frontend Scaffolding (`frontend/`)**
  - Initialize Vite React + TypeScript template.
  - Setup Tailwind CSS, PostCSS, Lucide React, React Router, TanStack Query.
  - Setup TypeScript configuration (strict mode).
  - Setup `.env.example` and basic app entry point.
- [x] **Task 1.2: Backend Scaffolding (`backend/`)**
  - Initialize Node.js + TypeScript workspace.
  - Setup Express, CORS, Helmet, Pino logger, Zod, Drizzle ORM, `pg` driver.
  - Setup environment variable validation schema with Zod.
  - Setup `.env.example` with Neon connection strings and operational variables.
- [x] **Task 1.3: Database & PostGIS Foundation (`backend/src/db`)**
  - Setup Neon pooled (`DATABASE_URL`) and direct (`DATABASE_URL_UNPOOLED`) client configuration.
  - Write PostGIS preflight migration (`0000_postgis_preflight.sql`).
  - Define Drizzle schema for foundational entities: `departments`, `complaint_categories`, `users`.
  - Configure `drizzle.config.ts`.
- [x] **Task 1.4: Healthcheck API & Verification**
  - Implement `GET /api/v1/health` verifying server uptime, memory, and database connectivity.
  - Implement PostGIS smoke test helper (`check-postgis.ts`).
- [x] **Task 1.5: Verification Gate & State Update**
  - Verify strict 3-file root constraint is preserved.
  - Verify build/type-check passes on both frontend and backend.
  - Update `.planning/STATE.md` and commit Phase 1 artifacts.
