"""Pydantic schemas for rating endpoints."""

from typing import Optional

from pydantic import BaseModel


class RatingCreateRequest(BaseModel):
    """Payload used to submit a rating for a model response."""

    session_id: str
    question_id: int
    response_model: str
    score: int
    reasoning: Optional[str] = None


class RatingCreateResponse(BaseModel):
    """Response confirming rating persistence."""

    success: bool
