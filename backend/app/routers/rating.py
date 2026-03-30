"""Rating submission endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as SqlAlchemySession

from app.database import get_database_session
from app.models.rating import Rating
from app.schemas.rating import RatingCreateRequest, RatingCreateResponse


router = APIRouter()


@router.post("/rating", response_model=RatingCreateResponse)
def create_rating(
    payload: RatingCreateRequest,
    database_session: SqlAlchemySession = Depends(get_database_session),
) -> RatingCreateResponse:
    """Persist a rating for one selected model response."""
    rating_record = Rating(
        session_id=payload.session_id,
        question_id=payload.question_id,
        response_model=payload.response_model,
        score=payload.score,
        reasoning=payload.reasoning,
    )
    database_session.add(rating_record)
    database_session.commit()
    return RatingCreateResponse(success=True)
