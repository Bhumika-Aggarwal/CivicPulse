# Phase 2 — Authentication, RBAC, Users & Departments

**Phase:** 2  
**Status:** In Progress  
**Objective:** Implement complete authentication lifecycle with JWT access and rotating refresh tokens, backend RBAC middleware protecting the 4 user roles (`CITIZEN`, `WORKER`, `SUPERVISOR`, `ADMIN`), seed foundational municipal departments and categories, and build frontend login/register forms and session state.

---

## 1. Scope & Deliverables

- [x] **Task 2.1: Refresh Token Schema & Migrations (`backend/src/db/schema/tokens.ts`)**
  - Create `refresh_tokens` entity for secure rotation and revocation.
  - Export in schema index.
- [x] **Task 2.2: Department & Category Seeds (`backend/src/db/seed.ts`)**
  - Create seed script for standard smart-city departments (Roads & Infrastructure, Public Health & Sanitation, Water & Sewage, Electrical & Lighting, Traffic Management).
  - Create seed script for corresponding default complaint categories.
- [x] **Task 2.3: Auth & RBAC Backend Engine (`backend/src/modules/auth/`, `backend/src/middleware/`)**
  - Password hashing & verification with `bcrypt`.
  - JWT creation & verification utilities (`signAccessToken`, `signRefreshToken`, `verifyToken`).
  - Auth middleware: `authenticate` & `authorize(roles)`.
  - Controllers: `/register`, `/login`, `/refresh`, `/logout`, `/me`.
  - Rate limiting on `/register` and `/login`.
- [x] **Task 2.4: Frontend Auth Integration (`frontend/src/`)**
  - Auth API client & context provider (`AuthContext`, `useAuth`).
  - Login modal / page and Register page with validation.
  - Role-aware header displaying active user role and logout button.
- [x] **Task 2.5: Build, Test & Verification Gate**
  - Verify clean TypeScript compilation on both frontend and backend.
  - Verify 3-file root constraint remains intact.
  - Commit Phase 2 and push to GitHub.
