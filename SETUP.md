# Setup and run

## Frontend (Next.js)

```bash
pnpm install
pnpm dev
```

Frontend runs at:
- `http://localhost:3000`

Set the backend URL via:
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
  (create/update `.env.local` in this project root if needed)

## Backend (FastAPI)

```bash
cd backend/
uv sync
uv run uvicorn app.main:app --reload
```

Backend runs at:
- `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

Environment variables:
- Copy `backend/.env.example` to `backend/.env` (or otherwise set `DATABASE_URL` and `FRONTEND_URL`).
- Optional: `SURVEY_TRUSTED_TOKEN` — if set, links with `?t=<that value>` store `traffic_source=trusted` on the session. Public sources use `?src=` with values allowlisted in `backend/app/traffic_source.py`.

Prolific study links should include `src=prolific` plus Prolific’s substituted query params, for example:

`https://makesafeai.org/?PROLIFIC_PID=1234&STUDY_ID=1234&SESSION_ID=1234&src=prolific`

Frontend: toggle stripping from the address bar after capture in `lib/traffic-attribution.ts` via `STRIP_SRC_PARAM_FROM_URL` and `STRIP_T_PARAM_FROM_URL` (Prolific params are left in the URL by default).

## Tests (backend)

```bash
cd backend/
uv run pytest tests/ -v
```