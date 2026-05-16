from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.database import engine, Base
from app.schema_migrations import ensure_prolific_columns
from app.routers import session
from app.routers import rating
from app.routers import results
from app.routers import responses

Base.metadata.create_all(bind=engine)
ensure_prolific_columns(engine)

app = FastAPI(title="LLM Pluralism API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(rating.router)
app.include_router(results.router)
app.include_router(responses.router)

@app.get("/health")
def health():
    return {"status": "ok"}
