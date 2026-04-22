from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.database import Rating, Session

router = APIRouter()
MAX_REASONING_CHARACTERS = 600


class RatingRequest(BaseModel):
    session_id: str
    question_id: int
    model: str
    score: int
    reasoning: str | None = None


@router.post("/rating")
def submit_rating(request: RatingRequest, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if request.score < 1 or request.score > 5:
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5")

    normalized_reasoning = request.reasoning.strip() if request.reasoning else None
    if normalized_reasoning and len(normalized_reasoning) > MAX_REASONING_CHARACTERS:
        raise HTTPException(
            status_code=400,
            detail=f"Reasoning must be {MAX_REASONING_CHARACTERS} characters or fewer",
        )

    existing = db.query(Rating).filter(
        Rating.session_id == request.session_id,
        Rating.question_id == request.question_id,
        Rating.model == request.model,
    ).first()

    if existing:
        existing.score = request.score
        existing.reasoning = normalized_reasoning
        db.commit()
        db.refresh(existing)
        return {"success": True, "rating_id": existing.id}

    rating = Rating(
        session_id=request.session_id,
        question_id=request.question_id,
        model=request.model,
        score=request.score,
        reasoning=normalized_reasoning,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    return {"success": True, "rating_id": rating.id}

