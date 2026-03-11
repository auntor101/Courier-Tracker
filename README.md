# Courier Tracker

Parcel and courier management system for booking, tracking, and delivering parcels across branches.

## Stack

- Python 3.12+ / FastAPI / SQLAlchemy 2.0 (async) / PostgreSQL (or SQLite for local dev)
- React 18 / TypeScript / Vite / Tailwind CSS
- JWT authentication with role-based access control
- Docker Compose for local development

## Features

- Parcel booking with auto-generated tracking codes
- Status tracking with full timeline history
- Branch-to-branch transfers
- Rider assignment and delivery confirmation
- Cash on delivery (COD) collection
- Role-based dashboards: Admin, Staff, Rider, Customer
- Public parcel tracking by code
- Search, filter, and pagination
- Mobile-responsive design

## Quick Start

### Docker

```bash
cp backend/.env.example backend/.env
# edit backend/.env with your values

docker-compose up --build
docker-compose exec backend python seed.py
```

Frontend: http://localhost:3000
API docs: http://localhost:8000/docs

### Manual Setup (no Docker needed)

**Backend**

```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Create .env from the example
cp .env.example .env
# Edit .env — for local dev without PostgreSQL, use:
# DATABASE_URL=sqlite+aiosqlite:///./courier_app.db

python seed.py
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000 with API proxy to http://localhost:8000.

## Demo Accounts

All seed accounts use the password from `SEED_PASSWORD` in `.env`.

| Email | Role |
|---|---|
| ct.admin@gmail.com | Admin |
| ct.staff.dhaka@gmail.com | Staff (Dhaka Hub) |
| ct.staff.ctg@gmail.com | Staff (Chittagong) |
| ct.rider1@gmail.com | Rider |
| ct.rider2@gmail.com | Rider |
| ct.customer1@gmail.com | Customer |
| ct.customer2@gmail.com | Customer |

## Backend Verification

Use these checks to confirm the backend code is healthy.

```bash
cd backend
.venv\Scripts\python -m compileall app main.py seed.py
.venv\Scripts\python -m uvicorn main:app --reload
```

Open `http://127.0.0.1:8000/api/health` and expect:

```json
{"status":"ok"}
```

Do not run route modules directly (for example `app/api/branches.py`).
They are imported by FastAPI through `main.py`.

## Deployment

### Backend (Render)

1. Create a new Web Service on Render, connect your GitHub repo
2. Set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add a PostgreSQL database from the Render dashboard
6. Set environment variables:
   - `DATABASE_URL` from the Render Postgres connection string (change `postgres://` to `postgresql+asyncpg://`)
   - `SECRET_KEY` (generate a random string)
   - `CORS_ORIGINS` (your Vercel frontend URL)
   - `SEED_PASSWORD` (your preferred demo password)
7. After deploy, open the shell tab and run `python seed.py`

### Frontend (Vercel)

1. Import the repo on Vercel
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`
4. Deploy

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Customer registration |
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/refresh | Public | Refresh token |
| GET | /api/auth/me | User | Current user |
| GET | /api/users | Admin/Staff | List users |
| POST | /api/users | Admin | Create user |
| PATCH | /api/users/:id | Admin | Update user |
| GET | /api/branches | User | List branches |
| POST | /api/branches | Admin | Create branch |
| PATCH | /api/branches/:id | Admin | Update branch |
| POST | /api/parcels | User | Book parcel |
| GET | /api/parcels | User | List parcels (role-scoped) |
| GET | /api/parcels/track/:code | Public | Track by code |
| GET | /api/parcels/track/:code/timeline | Public | Parcel timeline |
| PATCH | /api/parcels/:id/status | Staff | Update status |
| PATCH | /api/parcels/:id/assign | Staff | Assign rider |
| PATCH | /api/parcels/:id/transfer | Staff | Transfer branch |
| PATCH | /api/parcels/:id/cod | Rider | Collect COD |
| GET | /api/dashboard/stats | User | Dashboard stats |

## Status Flow

```
booked -> received_at_branch -> in_transit -> at_destination_branch -> out_for_delivery -> delivered
                                                                   \-> returned
                                                out_for_delivery -----> returned
```

## License

MIT
