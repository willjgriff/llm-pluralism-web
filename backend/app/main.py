"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers.rating import router as rating_router
from app.routers.results import router as results_router
from app.routers.session import router as session_router


settings = get_settings()

app = FastAPI(title="llm-pluralism-web backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Create database tables at application startup."""
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def get_health():
    """Return backend health status."""
    return {"status": "ok"}


app.include_router(session_router)
app.include_router(rating_router)
app.include_router(results_router)
