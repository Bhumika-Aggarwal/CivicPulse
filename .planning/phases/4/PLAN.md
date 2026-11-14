# Phase 4 — Supervisor Assignment & Worker Field Workflow

**Phase:** 4  
**Status:** In Progress  
**Objective:** Implement complaint assignment/reassignment system, worker field task lifecycle (`ASSIGNED` -> `ACCEPTED` -> `ON_THE_WAY` -> `ARRIVED` -> `IN_PROGRESS`), in-app notifications, and role-specific UI views for Supervisors and Field Workers while maintaining the strict 3-file root constraint.

---

## 1. Scope & Deliverables

- [x] **Task 4.1: Database Schemas (`backend/src/db/schema/`)**
  - Create `assignments` table (`id`, `complaint_id`, `worker_id`, `assigned_by`, `status`: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`, `assigned_at`, `accepted_at`, `reason`).
  - Create `notifications` table (`id`, `recipient_id`, `type`, `title`, `message`, `resource_type`, `resource_id`, `read_at`, `created_at`).
  - Export in `backend/src/db/schema/index.ts`.
- [x] **Task 4.2: Authority & Worker Backend Modules (`backend/src/modules/`)**
  - **Authority Endpoints (`/api/v1/authority/`)**:
    - `GET /complaints`: Scoped by supervisor department with priority/status filtering.
    - `POST /complaints/:id/assign`: Assign eligible worker, update complaint status to `ASSIGNED`, log status history, and notify worker.
    - `POST /complaints/:id/reassign`: Reassign with mandatory reason, preserving assignment history.
    - `GET /workers`: List active workers in supervisor's department.
  - **Worker Endpoints (`/api/v1/worker/`)**:
    - `GET /tasks`: List assigned tasks with status, location, and priority.
    - `POST /tasks/:taskId/accept`: Worker accepts task -> moves to `ACCEPTED`.
    - `POST /tasks/:taskId/reject`: Worker rejects task with reason -> moves complaint back to unassigned queue.
    - `POST /tasks/:taskId/status`: Transition between `ON_THE_WAY`, `ARRIVED`, and `IN_PROGRESS`.
- [x] **Task 4.3: Frontend Role Views (`frontend/src/features/`)**
  - **Supervisor Authority Dashboard (`AuthorityDashboard.tsx`)**:
    - Department queue with filter badges.
    - Worker assignment modal with worker selection and notes.
  - **Worker Field Portal (`WorkerPortal.tsx`)**:
    - Mobile-friendly task card view.
    - Accept / Reject action buttons.
    - Step-by-step field status progression tracker.
  - Role switcher and navigation tabs in `App.tsx`.
- [x] **Task 4.4: Verification Gate & State Update**
  - Verify clean TypeScript build on frontend and backend.
  - Verify strict 3-file root constraint.
  - Commit Phase 4 to Git and push to GitHub.
