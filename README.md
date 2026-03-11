<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&pause=1000&color=6366F1&center=true&vCenter=true&width=500&lines=Courier+Tracker;Book.+Track.+Deliver." alt="Courier Tracker" />

<p>Multi-role parcel management — book, track, and deliver across branches.</p>

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

## Stack

- **Backend** — FastAPI · SQLAlchemy 2 · PostgreSQL · JWT auth
- **Frontend** — React 18 · TypeScript · Vite · Tailwind CSS
- **Hosting** — Render (backend) · Netlify (frontend)

---

## Development

**Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://courier:courier_pass@localhost:5432/courier_db
SECRET_KEY=change-me
CORS_ORIGINS=http://localhost:3000
SEED_PASSWORD=courier_demo_123
```

```bash
python seed.py
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## Docker

```bash
docker-compose up --build
docker-compose exec backend python seed.py
```

---

## Deploy

**Backend — [Render](https://render.com)**

1. New **Web Service** — root dir: `backend`
2. Build: `pip install -r requirements.txt` · Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add a **PostgreSQL** database from the Render dashboard
4. Environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Render Postgres internal URL (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | Random 32+ character string |
| `CORS_ORIGINS` | Your Netlify URL |
| `SEED_PASSWORD` | Password for seeded accounts |

5. Shell tab → `python seed.py`

**Frontend — [Netlify](https://www.netlify.com)**

1. Import repo · Base dir: `frontend` · Build: `npm run build` · Publish: `dist`
2. Add environment variable: `VITE_API_URL` = `https://<your-render-app>.onrender.com/api`

---

## Accounts

Password for all accounts: `courier_demo_123`

| Email | Role |
|---|---|
| ct.admin@gmail.com | Admin |
| ct.staff.dhaka@gmail.com | Staff |
| ct.staff.ctg@gmail.com | Staff |
| ct.rider1@gmail.com | Rider |
| ct.rider2@gmail.com | Rider |
| ct.customer1@gmail.com | Customer |
| ct.customer2@gmail.com | Customer |

---

## Status Flow

```
booked → received_at_branch → in_transit → at_destination_branch → out_for_delivery → delivered
                                                                                      ↘ returned
```

---

## License

MIT
