# LLM Pluralism Web

Website for the llm-pluralism repo to capture human data.

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

## Tests (backend)

```bash
cd backend/
uv run pytest tests/ -v
```