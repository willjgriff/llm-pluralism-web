"""Session creation endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as SqlAlchemySession

from app.database import get_database_session
from app.models.questionnaire_response import QuestionnaireResponse
from app.models.session import Session
from app.schemas.session import SessionCreateRequest, SessionCreateResponse
from app.services.personas import assign_personas, compute_axis_scores
from app.services.selection import select_stratified_responses


router = APIRouter()


@router.post("/session", response_model=SessionCreateResponse)
def create_session(
    payload: SessionCreateRequest,
    database_session: SqlAlchemySession = Depends(get_database_session),
) -> SessionCreateResponse:
    """Create a new session, persist questionnaire answers, and select responses."""
    axis_scores = compute_axis_scores(payload.answers)
    personas = assign_personas(axis_scores)

    participant_session = Session(
        economic_score=axis_scores["economic"],
        identity_score=axis_scores["identity"],
        technology_score=axis_scores["technology"],
        economic_persona=personas["economic"],
        identity_persona=personas["identity"],
        technology_persona=personas["technology"],
    )
    database_session.add(participant_session)
    database_session.flush()

    questionnaire_records = [
        QuestionnaireResponse(
            session_id=participant_session.id,
            question_index=question_index,
            answer=answer_value,
        )
        for question_index, answer_value in enumerate(payload.answers)
    ]
    database_session.add_all(questionnaire_records)

    selected_responses = select_stratified_responses(axis_scores)
    database_session.commit()

    return SessionCreateResponse(
        session_id=participant_session.id,
        economic_persona=personas["economic"],
        identity_persona=personas["identity"],
        technology_persona=personas["technology"],
        responses=selected_responses,
    )
