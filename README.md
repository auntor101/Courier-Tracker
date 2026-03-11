# Courier Tracker

Parcel and courier management system for booking, tracking, and delivering parcels across branches.

## Stack

- Python 3.12 / FastAPI / SQLAlchemy 2.0 (async) / PostgreSQL
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

### Manual Setup

**Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# create .env from .env.example
alembic upgrade head
python seed.py
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Demo Accounts

All seed accounts use the password from `SEED_PASSWORD` in `.env` (default: `changeme123`).

| Email | Role |
|---|---|
| admin@courier.local | Admin |
| staff.dhaka@courier.local | Staff (Dhaka Hub) |
| staff.ctg@courier.local | Staff (Chittagong) |
| rider1@courier.local | Rider |
| rider2@courier.local | Rider |
| customer1@example.com | Customer |
| customer2@example.com | Customer |

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
