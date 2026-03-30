"""Session ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Session(Base):
    """Participant session storing persona assignment and axis scores."""

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    economic_score: Mapped[int] = mapped_column(Integer, nullable=False)
    identity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    technology_score: Mapped[int] = mapped_column(Integer, nullable=False)
    economic_persona: Mapped[str] = mapped_column(String, nullable=False)
    identity_persona: Mapped[str] = mapped_column(String, nullable=False)
    technology_persona: Mapped[str] = mapped_column(String, nullable=False)

    ratings = relationship("Rating", back_populates="session", cascade="all, delete-orphan")
    questionnaire_responses = relationship(
        "QuestionnaireResponse", back_populates="session", cascade="all, delete-orphan"
    )
