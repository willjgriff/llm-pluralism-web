"""Pydantic schemas for results endpoint."""

from typing import Dict

from pydantic import BaseModel


class SessionSummary(BaseModel):
    """Session data shown on results screen."""

    id: str
    economic_persona: str
    identity_persona: str
    technology_persona: str


class ResultsResponse(BaseModel):
    """Computed score summary for a session and persona aggregates."""

    session: SessionSummary
    mean_score: float
    persona_profiles: Dict[str, str]
    aggregate_by_persona: Dict[str, float]
