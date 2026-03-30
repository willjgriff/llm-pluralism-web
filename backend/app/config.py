"""Configuration helpers for environment-driven app settings."""

from functools import lru_cache
import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    """Application settings resolved from environment variables."""

    def __init__(self) -> None:
        """Initialize settings with defaults for local development."""
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./pluralistic_eval.db")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()
