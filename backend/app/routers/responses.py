import json
import random
from pathlib import Path
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from app.database import get_db

router = APIRouter()

RESPONSES_PATH = Path(__file__).parent.parent / "data" / "web_formatted_responses.json"
MAX_RATEABLE_RESPONSES = 30

class MoreResponsesRequest(BaseModel):
    session_id: str
    seen_response_keys: list[str]

@router.post("/responses/more")
def get_more_responses(request: MoreResponsesRequest, db: DBSession = Depends(get_db)):
    seen_response_keys = set(request.seen_response_keys)
    if len(seen_response_keys) >= MAX_RATEABLE_RESPONSES:
        return []

    with open(RESPONSES_PATH) as f:
        all_responses = json.load(f)

    unseen = [
        r for r in all_responses
        if f"{r['question_id']}:{r['model']}" not in seen_response_keys
    ]

    remaining_responses = MAX_RATEABLE_RESPONSES - len(seen_response_keys)
    selected = random.sample(unseen, min(6, len(unseen), remaining_responses))
    random.shuffle(selected)
    return selected
