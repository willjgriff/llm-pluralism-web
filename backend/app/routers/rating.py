from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.database import Rating, Session

router = APIRouter()


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

    rating = Rating(
        session_id=request.session_id,
        question_id=request.question_id,
        model=request.model,
        score=request.score,
        reasoning=request.reasoning,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    return {"success": True, "rating_id": rating.id}

