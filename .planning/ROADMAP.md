# CivicPulse — Phase Roadmap & Execution Gateways

This roadmap sets the strict execution sequence across 9 phases. Each phase has explicit entry criteria, core deliverables, and verification gates. No phase proceeds until the prior phase's verification gate is fully satisfied.

---

## Roadmap Overview

```
Phase 0: Repository Audit & Architecture Plan (Current)
   ↓
Phase 1: Foundation, Neon Database & PostGIS Setup
   ↓
Phase 2: Authentication, RBAC, Users & Departments
   ↓
Phase 3: Citizen Complaint Submission & Public Tracking
   ↓
Phase 4: Supervisor Assignment & Worker Field Workflow
   ↓
Phase 5: Real-Time Worker Tracking & Authority Live Map
   ↓
Phase 6: Resolution Evidence, Verification & Lifecycle Closure
   ↓
Phase 7: Smart-City Alerts (Weather, Traffic, Disasters) & Operations Dashboard
   ↓
Phase 8: Retention Jobs, Audit Logging, Hardening & Deployment Verification
```

---

## Detailed Phase Breakdown

### Phase 0: Repository Audit & Architecture Plan (CURRENT)
- **Goal:** Audit workspace, establish architecture, define schemas, create 3-file root layout plan.
- **Deliverables:**
  - Complete PRD audit and alignment review.
  - `.planning/` directory structure with PROJECT, CONFIG, REQUIREMENTS, ROADMAP, STATE.
  - Phase 0 Plan (`.planning/phases/0/PLAN.md`).
  - System Architecture & Clean Root Design specification.
- **Verification Gate:**
  - Architecture strictly abides by the 3-file root constraint (`frontend/`, `backend/`, `.gitignore`).
  - User review and acceptance before any application code execution.

### Phase 1: Foundation, Neon Database & PostGIS Setup
- **Goal:** Initialize isolated `frontend/` and `backend/` monorepo workspaces, setup database connection, migrations, and health checks.
- **Deliverables:**
  - `frontend/` package setup with React 18, Vite, Tailwind CSS, TypeScript.
  - `backend/` package setup with Express, TypeScript, Drizzle ORM, Pino logger.
  - PostGIS preflight migration (`CREATE EXTENSION IF NOT EXISTS postgis;`).
  - Drizzle schema definition for 14 entities and initial migration generation.
  - Healthcheck API (`GET /api/v1/health`) with DB connectivity verification.
- **Verification Gate:**
  - Migrations successfully apply to Neon dev database.
  - Smoke test query verifying `ST_Point` and PostGIS extension functionality.

### Phase 2: Authentication, RBAC, Users & Departments
- **Goal:** Implement secure auth flow and seed foundational entities.
- **Deliverables:**
  - User model with bcrypt password hashing and email normalization.
  - JWT access token (15m) + refresh token (7d) strategy with HttpOnly cookies.
  - Auth routes: `/register`, `/login`, `/refresh`, `/logout`, `/me`.
  - RBAC middleware enforcing `CITIZEN`, `WORKER`, `SUPERVISOR`, `ADMIN`.
  - Database seeds for initial departments and complaint categories.
- **Verification Gate:**
  - Integration tests for auth flows.
  - Negative security tests ensuring citizens cannot access admin endpoints.

### Phase 3: Citizen Complaint Submission & Public Tracking
- **Goal:** Complete end-to-end citizen reporting workflow.
- **Deliverables:**
  - Citizen complaint submission form with category selection, description, and Leaflet location picker.
  - Human-readable unique complaint number generator (`CP-YYYY-XXXXX`).
  - Deterministic category-to-department routing engine.
  - Cloudinary upload signature generation and media metadata storage.
  - Citizen complaint status timeline view (`GET /api/v1/complaints/mine`).
- **Verification Gate:**
  - Citizen can submit complaints with coordinates and images.
  - Multi-tenant privacy verification: Citizen A cannot view Citizen B's complaint.

### Phase 4: Supervisor Assignment & Worker Field Workflow
- **Goal:** Connect supervisor oversight with worker task execution.
- **Deliverables:**
  - Supervisor department complaint queue with status/priority filtering.
  - Manual and rule-assisted assignment/reassignment API and UI drawer.
  - Worker mobile-first dashboard and assigned task queue.
  - Worker task state machine: `ASSIGNED` -> `ACCEPTED` -> `ON_THE_WAY` -> `ARRIVED` -> `IN_PROGRESS`.
  - In-app notification creation upon assignment and status updates.
- **Verification Gate:**
  - Task transitions strictly follow state machine rules.
  - Worker cannot update unassigned complaints.

### Phase 5: Real-Time Worker Tracking & Authority Live Map
- **Goal:** Real-time spatial tracking without database bloat.
- **Deliverables:**
  - Browser Geolocation integration on worker mobile view with explicit start/stop consent.
  - Authenticated Socket.IO server with handshake JWT verification and room access control.
  - In-memory latest-position store in Node.js backend.
  - Throttled persistence worker: saves point only if >=30s elapsed OR distance >=25m.
  - Supervisor live Leaflet map streaming active workers and complaint markers with stale indicators.
- **Verification Gate:**
  - Raw socket pings every 5s do NOT write to database.
  - Database row count increases only under throttle constraints.
  - Disconnect or task completion immediately cleans up active tracking state.

### Phase 6: Resolution Evidence, Verification & Lifecycle Closure
- **Goal:** Robust proof-of-work and supervisory approval cycle.
- **Deliverables:**
  - Worker completion flow requiring resolution notes and Cloudinary after-work evidence photo.
  - Transition to `SUBMITTED_FOR_VERIFICATION`.
  - Supervisor verification modal showing side-by-side Before/After evidence.
  - Actions: Approve (`RESOLVED`), Reject with reason (`IN_PROGRESS`), Reopen.
  - In-app citizen notification upon complaint resolution.
- **Verification Gate:**
  - Complaint cannot be marked `RESOLVED` without supervisor role and uploaded evidence.
  - Rejection properly resets worker task state with supervisor comments.

### Phase 7: Smart-City Alerts & Operations Dashboard
- **Goal:** Situational environmental layers and operational KPIs.
- **Deliverables:**
  - Open-Meteo weather integration with in-memory 10-minute cache.
  - Traffic and disaster alerts adapter with tagged demo fixtures.
  - Supervisor map overlay toggles for weather alerts, traffic bottlenecks, and flood/fire zones.
  - Authority KPI dashboard: count of open, in-progress, overdue, and resolved complaints using Recharts.
- **Verification Gate:**
  - External weather API timeouts or downtime do not degrade core complaint operations.
  - Alert expiration cron correctly purges expired records.

### Phase 8: Retention Jobs, Audit Logging, Hardening & Deployment
- **Goal:** Storage optimization, regulatory compliance, and production readiness.
- **Deliverables:**
  - Automated GPS breadcrumb retention job: packages raw points into simplified GeoJSON, uploads to Cloudflare R2, verifies upload, and purges Neon database rows.
  - Audit log table tracking administrative actions and supervisor inspections.
  - Comprehensive security audit: Helmet headers, rate limits, CORS whitelist, input sanitization.
  - Production build scripts and Docker / deployment runbooks.
- **Verification Gate:**
  - Retention job test verifies S3/R2 upload before deleting local DB rows.
  - Zero high/critical vulnerabilities in automated lint and security checks.
  - Frontend and backend production builds pass without errors.
