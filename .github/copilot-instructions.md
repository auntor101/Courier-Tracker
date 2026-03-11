# Copilot Instructions for Courier Tracker

## 1) Big picture (what lives where)
- This is a 2-app monorepo:
  - `backend/`: FastAPI + async SQLAlchemy + PostgreSQL
  - `frontend/`: React + Vite + Tailwind
- API entrypoint: `backend/main.py` (all routes under `/api/*`).
- Backend structure is strict and should stay consistent:
  - `app/models/*` DB entities + enums/business constants
  - `app/schemas/*` request/response contracts
  - `app/api/*` route handlers + business logic
  - `app/core/*` auth/config/dependencies
  - `app/services/*` shared domain utilities

## 2) Critical contracts between frontend and backend
- Use snake_case API fields everywhere (`full_name`, `origin_branch_id`, etc.).
- Frontend API client is `frontend/src/services/api.ts`:
  - sends `Authorization: Bearer <access_token>`
  - auto-refreshes on 401 via `/auth/refresh`
  - stores tokens in `localStorage` as `access_token` and `refresh_token`
- Frontend types in `frontend/src/types/index.ts` are the contract mirror of backend schemas.

## 3) Parcel rules (do not break)
- Status flow is enforced by `VALID_TRANSITIONS` in `backend/app/models/parcel.py`.
- Any parcel mutation that changes workflow state must add a timeline row via `_add_timeline(...)` in `backend/app/api/parcels.py`.
  - Includes status updates, rider assignment, branch transfer, and COD collection.
- Tracking code format comes from `backend/app/services/tracking.py`: `CT-YYMMDD-####`.
- COD collection in `backend/app/api/parcels.py` is allowed once, and only by assigned rider (or admin).

## 4) Role/authorization behavior
- Server-side role checks are source of truth:
  - dependencies in `backend/app/core/deps.py` (`get_current_user`, `require_admin`, `require_staff`, `require_rider`)
  - query scoping in `backend/app/api/parcels.py` and `backend/app/api/dashboard.py`
- Frontend `ProtectedRoute` is UX-only; never rely on it for real security.

## 5) How to implement changes in this repo
- New backend feature:
  1. update/create schema in `backend/app/schemas/*`
  2. add/modify route in `backend/app/api/*`
  3. if parcel workflow touched, update timeline + transitions
  4. keep response model `from_attributes` pattern
- New frontend data usage:
  1. call API through `frontend/src/services/api.ts`
  2. keep payload/response keys snake_case
  3. update `frontend/src/types/index.ts` when API shape changes

## 6) Local workflow that actually works here
- Preferred: Docker Compose
  - `docker-compose up --build`
  - `docker-compose exec backend python seed.py`
- Useful URLs:
  - frontend `http://localhost:3000`
  - API docs `http://localhost:8000/docs`
  - health `http://localhost:8000/api/health`
- Migrations are Alembic async in `backend/alembic/env.py`.

## 7) Current repo reality
- `README.md` is the only existing convention source.
- `backend/tests/` is empty (no established test pattern yet).
- If local manifests are missing or drifted, follow Docker flow first.
