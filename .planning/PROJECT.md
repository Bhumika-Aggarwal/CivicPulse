# CivicPulse — Project Context

## Identity
- **Name:** CivicPulse
- **Type:** Smart City Complaint Management Platform
- **Version:** 2.0 (PRD)
- **Status:** Phase 0 — Planning & Architecture

## Vision
CivicPulse connects citizens, field workers, and municipal authorities through a transparent, traceable civic complaint lifecycle. Citizens report issues, the system routes them to responsible departments, supervisors assign workers, workers share location during active tasks, and authorities verify resolution evidence before closure.

## Core Lifecycle
```
Report → Register → Assign → Accept → Track → Reach → Work → Submit Evidence → Verify → Resolve
```

## Architecture Constraint
**3-file root structure:**
- `frontend/` — React + TypeScript + Vite SPA (all frontend source, config, and assets)
- `backend/` — Node.js + TypeScript + Express API server (all server source, config, migrations)
- `.gitignore` — Version control exclusions

## Technical Stack
| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18+ + TypeScript (strict) |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Icons | Lucide React |
| Real-time (client) | Socket.IO Client |
| Backend Runtime | Node.js LTS |
| HTTP Framework | Express.js |
| Real-time (server) | Socket.IO |
| Validation | Zod |
| Auth | JWT (access + refresh) + bcrypt |
| ORM | Drizzle ORM |
| DB Driver | pg (node-postgres) |
| Logging | Pino |
| Security | Helmet, CORS, express-rate-limit |
| Database | Neon PostgreSQL + PostGIS |
| Image Storage | Cloudinary |
| Archive Storage | Cloudflare R2 (S3-compatible) |
| Weather | Open-Meteo |
| Traffic | Demo fixtures (provider TBD) |
| Disasters | Official source TBD / demo fixtures |
| CI/CD | GitHub Actions |
| Testing | Vitest + Supertest |

## Roles (RBAC)
1. **CITIZEN** — Report complaints, track own complaints, view public alerts
2. **WORKER** — Accept tasks, update status, share location during active tasks, submit evidence
3. **SUPERVISOR** — Manage department complaints, assign workers, verify resolutions, monitor operations
4. **ADMIN** — Full platform management, user/role/department/category CRUD, audit, retention

## Mandatory Rules
1. Inspect before changing
2. Build in small, verifiable phases
3. Never put secrets in frontend code
4. No AI features in MVP
5. No Redis/microservices/Kubernetes without demonstrated need
6. Use strict TypeScript
7. Validate all untrusted data at runtime
8. Use database migrations in version control
9. External services must fail gracefully

## PRD Reference
`C:/Users/bhumika/.gemini/antigravity/brain/5738287c-1125-4423-81c1-2af8845d5d8b/.user_uploaded/media_1794597261000_e22fb1b3.md`

## Created
2026-11-14
