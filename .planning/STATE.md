# CivicPulse — Project State

## Current Phase
**Phase 4** — Supervisor Assignment & Worker Field Workflow

## Phase Status
| Phase | Name | Status |
|-------|------|--------|
| 0 | Repository Audit & Plan | 🟢 Completed |
| 1 | Foundation & Neon | 🟢 Completed |
| 2 | Authentication & RBAC | 🟢 Completed |
| 3 | Complaint Management | 🟢 Completed |
| 4 | Assignment & Worker Workflow | 🟢 Completed |
| 5 | Tracking & Maps | ⬜ Ready to Start |
| 3 | Complaint Management | ⬜ Not Started |
| 4 | Assignment & Worker Workflow | ⬜ Not Started |
| 5 | Tracking & Maps | ⬜ Not Started |
| 6 | Evidence & Verification | ⬜ Not Started |
| 7 | Alerts & Dashboard | ⬜ Not Started |
| 8 | Retention, Audit & Deployment | ⬜ Not Started |

## Decisions Log
| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | 3-file root: `frontend/`, `backend/`, `.gitignore` | User requirement for clean root; directories contain full substructure | 2026-11-14 |
| 2 | Monorepo with separate `package.json` per side | Each side has independent deps, build, and deploy | 2026-11-14 |
| 3 | No shared `packages/` or workspace hoisting | Simplicity for academic prototype | 2026-11-14 |
| 4 | Vitest over Jest | Vite-native, faster, better TypeScript support | 2026-11-14 |
| 5 | Drizzle ORM over Prisma | Lighter, SQL-close, better PostGIS control | 2026-11-14 |

## Open Questions
1. Target city/jurisdiction for demo data and map bounds
2. Traffic data provider selection
3. Disaster alert provider selection
4. Neon PostgreSQL version / PostGIS compatibility verification
5. Image upload limits (file count, size, MIME types)
6. Complaint priority rules (deterministic defaults)
7. Overdue SLA thresholds per category/department
8. Supervisor scope: department-only vs geographic jurisdiction
9. Worker assignment rejection: enabled? allowed reasons?

## Last Updated
2026-11-14
