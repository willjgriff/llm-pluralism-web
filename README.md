# llm-pluralism-web

Full-stack web application for human validation of AI pluralism evaluations.
Participants complete a short values questionnaire, receive persona assignments,
rate seven selected model responses, and view score summaries with persona cluster comparisons.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend**: FastAPI + SQLAlchemy ORM
- **Database**: SQLite (development)

## Quick Start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API runs on `http://localhost:8000`. Visit `/docs` for the interactive OpenAPI explorer.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs on `http://localhost:5173`.

## Populating Responses

Edit `backend/app/data/responses.json` to replace the `"placeholder"` values with
real model responses from your run_1 dataset. Each record has:

```json
{
  "question_id": 1,
  "prompt": "...",
  "response_model": "openrouter:anthropic/claude-3.5-haiku",
  "response_text": "The actual model response goes here."
}
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Liveness check |
| `POST` | `/session` | Create session from questionnaire answers |
| `POST` | `/rating` | Submit a rating for one response |
| `GET`  | `/results/{session_id}` | Fetch results and aggregate persona scores |

## Flow

1. **Landing** — headline and start CTA
2. **Questionnaire** — 6-question Likert scale; personas computed client-side for preview
3. **Transition** — visualises persona assignments; triggers `POST /session`
4. **Rating** — 7 stratified responses rated 1–5 with optional reasoning
5. **Results** — value profile, mean score, persona cluster bar chart, shareable card
