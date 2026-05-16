import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db
from app.models.database import Rating, Session
from pathlib import Path
import json

PERSONA_SCORES_PATH = Path(__file__).parent.parent / "data" / "persona_score_means.json"

with open(PERSONA_SCORES_PATH) as f:
    STATIC_PERSONA_DATA = json.load(f)

router = APIRouter()
security = HTTPBasic()


def _session_row_to_export_dict(session: Session) -> dict:
    """Map a Session ORM row to the flat dict shape used by /export/all."""
    return {
        "id": session.id,
        "created_at": str(session.created_at),
        "is_repeat": session.is_repeat,
        "primary_persona": session.primary_persona,
        "primary_axis": session.primary_axis,
        "economic_score": session.economic_score,
        "identity_score": session.identity_score,
        "technology_score": session.technology_score,
        "society_score": session.society_score,
        "economic_persona": session.economic_persona,
        "identity_persona": session.identity_persona,
        "technology_persona": session.technology_persona,
        "society_persona": session.society_persona,
        "questionnaire_answers": session.questionnaire_answers,
        "traffic_source": session.traffic_source,
        "prolific_pid": session.prolific_pid,
        "prolific_study_id": session.prolific_study_id,
        "prolific_session_id": session.prolific_session_id,
    }


def _rating_row_to_export_dict(rating: Rating) -> dict:
    """Map a Rating ORM row to the flat dict shape used by /export/all."""
    return {
        "id": rating.id,
        "session_id": rating.session_id,
        "question_id": rating.question_id,
        "model": rating.model,
        "score": rating.score,
        "reasoning": rating.reasoning,
        "created_at": str(rating.created_at),
    }


@router.get("/export/all")
def export_all(
    credentials: HTTPBasicCredentials = Depends(security),
    db: DBSession = Depends(get_db),
):
    """Return all rows from sessions and ratings as JSON (datetimes as str)."""
    expected_user = os.getenv("EXPORT_USER", "admin")
    expected_password = os.getenv("EXPORT_PASSWORD")
    if (
        credentials.username != expected_user
        or credentials.password != expected_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    sessions = db.query(Session).all()
    ratings = db.query(Rating).all()
    return {
        "sessions": [_session_row_to_export_dict(s) for s in sessions],
        "ratings": [_rating_row_to_export_dict(r) for r in ratings],
    }


MODEL_DISPLAY_NAMES = {
    "openrouter:anthropic/claude-3.5-haiku": "Claude 3.5 Haiku",
    "openai:gpt-4.1-mini": "GPT-4.1 Mini",
    "openrouter:x-ai/grok-4-fast": "Grok 4 Fast",
}

@router.get("/results/{session_id}")
def get_results(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ratings = db.query(Rating).filter(Rating.session_id == session_id).all()
    if not ratings:
        raise HTTPException(status_code=404, detail="No ratings found for this session")

    model_scores_raw = {}
    for rating in ratings:
        if rating.model not in model_scores_raw:
            model_scores_raw[rating.model] = []
        model_scores_raw[rating.model].append(rating.score)

    model_scores = []
    for model, scores in model_scores_raw.items():
        mean_score = round(sum(scores) / len(scores), 2)
        model_scores.append({
            "model": model,
            "model_display_name": MODEL_DISPLAY_NAMES.get(model, model),
            "mean_score": mean_score,
        })

    model_scores.sort(key=lambda x: x["mean_score"], reverse=True)
    best_match = model_scores[0]

    total_participants = (
        db.query(Session)
        .join(Rating, Rating.session_id == Session.id)
        .filter(Session.is_repeat == False)
        .distinct()
        .count()
    )

    if total_participants >= 3:
        persona_counts = (
            db.query(Session.primary_persona, func.count(func.distinct(Session.id)).label("count"))
            .join(Rating, Rating.session_id == Session.id)
            .filter(Session.is_repeat == False)
            .group_by(Session.primary_persona)
            .all()
        )
        REQUIRED_PERSONAS = {
            "Libertarian", "Collectivist", "Nationalist", "Globalist",
            "Tech Optimist", "Tech Sceptic", "Religious", "Secularist"
        }
        persona_count_map = {row.primary_persona: row.count for row in persona_counts}
        use_live_data = (
            all(persona in persona_count_map for persona in REQUIRED_PERSONAS) and
            all(persona_count_map[persona] >= 3 for persona in REQUIRED_PERSONAS)
        )
    else:
        use_live_data = False

    if use_live_data:
        live_data = (
            db.query(
                Session.primary_persona,
                func.avg(Rating.score).label("mean_score"),
                func.count(func.distinct(Session.id)).label("participant_count"),
            )
            .join(Rating, Rating.session_id == Session.id)
            .filter(Session.is_repeat == False)
            .group_by(Session.primary_persona)
            .all()
        )
        aggregate_by_persona = [
            {
                "persona": row.primary_persona,
                "mean_score": round(row.mean_score, 2),
                "participant_count": row.participant_count,
            }
            for row in live_data
        ]
    else:
        aggregate_by_persona = [
            {**entry, "participant_count": 0}
            for entry in STATIC_PERSONA_DATA
        ]

    return {
        "session_id": session_id,
        "model_scores": model_scores,
        "best_match": best_match,
        "aggregate_by_persona": aggregate_by_persona,
        "total_participants": total_participants,
        "ratings_count": len(ratings),
        "use_live_data": use_live_data,
    }
