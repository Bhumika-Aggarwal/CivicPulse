# CivicPulse — Requirements Traceability Matrix

This document maps all functional, security, geospatial, and operational requirements from the PRD to the target architecture and delivery phases.

## 1. Functional Requirements Matrix

| ID | Requirement Category | Detailed Requirement | Target Phase | Implementation Scope |
|---|---|---|---|---|
| **REQ-AUTH-01** | Authentication | Citizen registration with email verification & bcrypt | Phase 2 | `backend/src/modules/auth`, `frontend/src/features/auth` |
| **REQ-AUTH-02** | Authentication | Login with JWT access (15m) + refresh (7d) tokens | Phase 2 | HttpOnly Secure cookies, token rotation |
| **REQ-AUTH-03** | Authentication | Password policy & rate limiting (anti-brute-force) | Phase 2 | `express-rate-limit`, Zod schema rules |
| **REQ-AUTH-04** | RBAC | 4 Roles: `CITIZEN`, `WORKER`, `SUPERVISOR`, `ADMIN` | Phase 2 | Domain middleware `authorize([roles])` |
| **REQ-AUTH-05** | Privileged Access | No public self-registration for privileged roles | Phase 2 | Admin-only invite/role assignment endpoint |
| **REQ-COMP-01** | Complaints | Submit with category, title, description, lat/lng | Phase 3 | `POST /api/v1/complaints` + Leaflet pin picker |
| **REQ-COMP-02** | Complaints | Human-readable unique ID (e.g. `CP-2026-00125`) | Phase 3 | Database sequence generator / transaction lock |
| **REQ-COMP-03** | Complaints | Deterministic routing by category default department | Phase 3 | Backend rule engine in `complaints.service.ts` |
| **REQ-COMP-04** | Complaints | Image upload to Cloudinary (zero binary in DB) | Phase 3 | Cloudinary signature & upload confirmation |
| **REQ-COMP-05** | Complaints | Citizen complaint detail & status timeline view | Phase 3 | Scoped `GET /api/v1/complaints/mine` |
| **REQ-TASK-01** | Worker Workflow | Assigned task queue with priority & SLA indicators | Phase 4 | `GET /api/v1/worker/tasks` |
| **REQ-TASK-02** | Worker Workflow | Accept or reject task (rejection requires reason) | Phase 4 | Task transition state machine |
| **REQ-TASK-03** | Worker Workflow | Task status updates (`ACCEPTED` -> `ON_THE_WAY` -> `ARRIVED` -> `IN_PROGRESS`) | Phase 4 | Validated transitions & status history logging |
| **REQ-TASK-04** | Worker Workflow | In-app notifications on assignment & status updates | Phase 4 | `notifications` table + UI notification bell |
| **REQ-TRACK-01** | Live Tracking | Worker location sharing via browser Geolocation API | Phase 5 | Active-only worker location consent toggle |
| **REQ-TRACK-02** | Live Tracking | Real-time transmission over Socket.IO (~5s cadence) | Phase 5 | Handshake auth + room authorization check |
| **REQ-TRACK-03** | Live Tracking | Server-side in-memory latest position map | Phase 5 | Zero DB write on raw 5s socket pings |
| **REQ-TRACK-04** | Live Tracking | Throttled persistence: >=30-60s OR >=25m displacement | Phase 5 | Spatial distance calculation in Node memory |
| **REQ-TRACK-05** | Live Tracking | Authority live map with active worker pins & stale indicators | Phase 5 | Leaflet live markers with timestamp decay |
| **REQ-EVID-01** | Resolution | Mandatory resolution notes & after-work evidence photo | Phase 6 | Form validation before `SUBMITTED_FOR_VERIFICATION` |
| **REQ-EVID-02** | Resolution | Supervisor verification queue with side-by-side comparison | Phase 6 | Before vs After media display drawer |
| **REQ-EVID-03** | Resolution | Verification actions: Approve (`RESOLVED`), Reject, Reopen | Phase 6 | Supervisor reason notes, immutable history |
| **REQ-ALERT-01** | Alerts & Context | Weather integration via Open-Meteo with 5-10m memory cache | Phase 7 | `integrations/weather` client with TTL cache |
| **REQ-ALERT-02** | Alerts & Context | Traffic incidents layer (demo dataset / provider) | Phase 7 | GeoJSON map layer with toggle controls |
| **REQ-ALERT-03** | Alerts & Context | Disaster alerts display with expiry tracking | Phase 7 | `alerts` entity + active layer polygon rendering |
| **REQ-ALERT-04** | Fault Tolerance | External provider outage must never block complaint lifecycle | Phase 7 | Circuit breaker / fallback to empty state |
| **REQ-OPS-01** | Storage & DB | Neon PostgreSQL with PostGIS extension for spatial queries | Phase 1 | Drizzle ORM + GiST spatial indexes |
| **REQ-OPS-02** | Retention | Automated retention job: archive GPS tracks to R2 before deletion | Phase 8 | Daily cron, GeoJSON simplify, S3 upload verify |
| **REQ-OPS-03** | Audit & Security | Immutable audit logs for sensitive supervisor/admin actions | Phase 8 | `audit_logs` entity, security log redaction |

---

## 2. Security & Privacy Constraints

1. **Worker Privacy Boundary:** Worker coordinates are recorded and broadcast **only** while in active `ON_THE_WAY`, `ARRIVED`, or `IN_PROGRESS` status on an accepted task. Citizens are strictly forbidden from viewing exact worker coordinates.
2. **Zero Storage of Binaries:** Neon PostgreSQL stores only Cloudinary public IDs, URLs, and metadata. No base64 or blob data in PostgreSQL.
3. **Database Write Throttling:** Direct GPS points are never inserted raw from the socket. Buffer and throttle filter enforces minimum 30s/25m delta.
4. **Room Authorization on Socket.IO:** A worker can only emit to their assigned session. Supervisors can only listen to rooms matching their jurisdictional department.
5. **No AI in MVP:** Rule-based routing only. Machine learning modules deferred to Phase 9.
