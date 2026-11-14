# Phase 3 — Complaint Submission & Citizen Tracking

**Phase:** 3  
**Status:** In Progress  
**Objective:** Implement complete citizen complaint submission with Leaflet interactive pin picker, Cloudinary media upload integration, human-readable ID generation (`CP-YYYY-XXXXX`), deterministic category-to-department routing, database persistence, and citizen "My Complaints" tracking timeline view.

---

## 1. Scope & Deliverables

- [x] **Task 3.1: Database Schemas for Complaints (`backend/src/db/schema/`)**
  - Define `complaints` table (with status enum: `SUBMITTED`, `ASSIGNED`, `ACCEPTED`, `ON_THE_WAY`, `ARRIVED`, `IN_PROGRESS`, `SUBMITTED_FOR_VERIFICATION`, `RESOLVED`, `REJECTED`, `REOPENED`, `CANCELLED`, priority enum, PostGIS/coordinate fields).
  - Define `complaint_media` table for Cloudinary metadata (URLs, public IDs, file sizes, format — zero image bytes in DB).
  - Define `complaint_status_history` table for immutable timeline audit trails.
  - Export all schemas in `schema/index.ts`.
- [x] **Task 3.2: Complaint Backend Module (`backend/src/modules/complaints/`)**
  - Zod validation schemas for complaint creation and query filters.
  - Human-readable ID generator utility (`CP-2026-00001` sequential format).
  - Deterministic category-to-department router (fetches category default department).
  - Controller & endpoints:
    - `POST /api/v1/complaints`: Create complaint with coordinates, category, title, description, and optional photo URLs.
    - `GET /api/v1/complaints/mine`: Get logged-in citizen's complaints with status and timeline.
    - `GET /api/v1/complaints/categories`: Public list of active complaint categories for the form.
    - `GET /api/v1/complaints/:id`: Get detailed single complaint with history and media.
  - Media upload signature endpoint: `POST /api/v1/media/upload-signature` for secure direct Cloudinary uploads.
- [x] **Task 3.3: Frontend Complaint Submission & Tracking UI (`frontend/src/features/complaints/`)**
  - Interactive Leaflet map location picker (click to set pin, reverse geocoding fallback coordinates).
  - Citizen complaint submission form with category selection, title, description, image upload, and map preview.
  - "My Complaints" dashboard tab with status badges, filters, and complaint detail timeline modal.
  - Category loading hook and TanStack Query integration.
- [x] **Task 3.4: Verification Gate & State Update**
  - Verify strict 3-file root constraint remains intact.
  - Verify clean TypeScript build on both frontend and backend.
  - Update `.planning/STATE.md` and commit Phase 3 artifacts to GitHub.
