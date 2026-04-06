import json
import random
from pathlib import Path
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models.database import Session

router = APIRouter()

RESPONSES_PATH = Path(__file__).parent.parent / "data" / "web_formatted_responses.json"

AXIS_QUESTIONS = {
    "economic": [1, 2, 3, 4, 5, 6],
    "identity": [5, 7, 13, 14, 15, 16],
    "technology": [10, 11, 12, 16, 17, 18],
    "society": [4, 5, 7, 8, 9, 12],
}

MODELS = [
    "openrouter:anthropic/claude-3.5-haiku",
    "openai:gpt-4.1-mini",
    "openrouter:x-ai/grok-4-fast",
]

class SessionRequest(BaseModel):
    answers: list[int]
    is_repeat: bool = False

def assign_personas(answers: list[int]) -> dict:
    economic_score = answers[1] - answers[0]
    identity_score = answers[2] - answers[3]
    technology_score = answers[5] - answers[4]
    society_score = answers[6] - answers[7]

    axis_scores = [
        {"axis": "economic", "score": abs(economic_score)},
        {"axis": "identity", "score": abs(identity_score)},
        {"axis": "technology", "score": abs(technology_score)},
        {"axis": "society", "score": abs(society_score)},
    ]

    dominant = max(axis_scores, key=lambda x: x["score"])
    is_centrist = dominant["score"] < 2

    primary_persona = "Centrist"
    primary_axis = "centrist"

    if not is_centrist:
        primary_axis = dominant["axis"]
        if dominant["axis"] == "economic":
            primary_persona = "Libertarian" if economic_score > 0 else "Collectivist"
        elif dominant["axis"] == "identity":
            primary_persona = "Nationalist" if identity_score > 0 else "Globalist"
        elif dominant["axis"] == "technology":
            primary_persona = "Tech Optimist" if technology_score > 0 else "Tech Sceptic"
        elif dominant["axis"] == "society":
            primary_persona = "Religious" if society_score > 0 else "Secularist"

    return {
        "economic_score": economic_score,
        "identity_score": identity_score,
        "technology_score": technology_score,
        "society_score": society_score,
        "economic_persona": "Libertarian" if economic_score > 0 else "Collectivist" if economic_score < 0 else "Neutral",
        "identity_persona": "Nationalist" if identity_score > 0 else "Globalist" if identity_score < 0 else "Neutral",
        "technology_persona": "Tech Optimist" if technology_score > 0 else "Tech Sceptic" if technology_score < 0 else "Neutral",
        "society_persona": "Religious" if society_score > 0 else "Secularist" if society_score < 0 else "Neutral",
        "primary_persona": primary_persona,
        "primary_axis": primary_axis,
    }

def select_responses(primary_axis: str) -> list[dict]:
    with open(RESPONSES_PATH) as f:
        all_responses = json.load(f)

    question_ids = AXIS_QUESTIONS.get(primary_axis, [])
    if not question_ids:
        question_ids = [r["question_id"] for r in all_responses]

    primary_responses = [r for r in all_responses if r["question_id"] in question_ids]

    selected = []
    for model in MODELS:
        model_responses = [r for r in primary_responses if r["model"] == model]
        chosen = random.sample(model_responses, min(2, len(model_responses)))
        selected.extend(chosen)

    if len(selected) < 6:
        remaining = [r for r in all_responses if r not in selected]
        needed = 6 - len(selected)
        selected.extend(random.sample(remaining, min(needed, len(remaining))))

    random.shuffle(selected)
    return selected[:6]

@router.post("/session")
def create_session(request: SessionRequest, db: DBSession = Depends(get_db)):
    personas = assign_personas(request.answers)
    responses = select_responses(personas["primary_axis"])

    session = Session(
        is_repeat=request.is_repeat,
        questionnaire_answers=json.dumps(request.answers),
        **personas,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "responses": responses,
    }
