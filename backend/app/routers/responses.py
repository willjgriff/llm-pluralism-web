import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models.database import Session
from app.routers.session import response_selection_axis, select_responses

router = APIRouter()

class MoreResponsesRequest(BaseModel):
    session_id: str
    seen_question_ids: list[int]

@router.post("/responses/more")
def get_more_responses(request: MoreResponsesRequest, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    seen_question_ids = set(request.seen_question_ids)
    answers = json.loads(session.questionnaire_answers)
    axis = response_selection_axis(answers)
    return select_responses(axis, seen_question_ids)
