"""Results endpoint for session and aggregate persona data."""

from typing import Dict, Tuple

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session as SqlAlchemySession

from app.database import get_database_session
from app.models.rating import Rating
from app.models.session import Session
from app.schemas.results import ResultsResponse, SessionSummary


router = APIRouter()


@router.get("/results/{session_id}", response_model=ResultsResponse)
def get_results(
    session_id: str,
    database_session: SqlAlchemySession = Depends(get_database_session),
) -> ResultsResponse:
    """Fetch session results and aggregate means by persona cluster."""
    session_record = database_session.query(Session).filter(Session.id == session_id).one()

    session_mean_score = (
        database_session.query(func.avg(Rating.score)).filter(Rating.session_id == session_id).scalar() or 0
    )

    cluster_rows = (
        database_session.query(
            Session.economic_persona,
            Session.identity_persona,
            Session.technology_persona,
            func.avg(Rating.score),
        )
        .join(Rating, Rating.session_id == Session.id)
        .group_by(
            Session.economic_persona,
            Session.identity_persona,
            Session.technology_persona,
        )
        .all()
    )

    aggregate_by_persona: Dict[str, float] = {}
    for economic_persona, identity_persona, technology_persona, mean_score in cluster_rows:
        cluster_key = f"{economic_persona} | {identity_persona} | {technology_persona}"
        aggregate_by_persona[cluster_key] = round(float(mean_score), 2)

    return ResultsResponse(
        session=SessionSummary(
            id=session_record.id,
            economic_persona=session_record.economic_persona,
            identity_persona=session_record.identity_persona,
            technology_persona=session_record.technology_persona,
        ),
        mean_score=round(float(session_mean_score), 2),
        persona_profiles={
            "economic": session_record.economic_persona,
            "identity": session_record.identity_persona,
            "technology": session_record.technology_persona,
        },
        aggregate_by_persona=aggregate_by_persona,
    )
