"""Pydantic schemas for session lifecycle endpoints."""

from typing import Any, Dict, List

from pydantic import BaseModel


class SessionCreateRequest(BaseModel):
    """Payload used to create a new participant session."""

    answers: List[int]


class SessionCreateResponse(BaseModel):
    """Response returned after session creation and response selection."""

    session_id: str
    economic_persona: str
    identity_persona: str
    technology_persona: str
    responses: List[Dict[str, Any]]
