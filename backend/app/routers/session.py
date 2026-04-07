import json
import random
from pathlib import Path
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models.database import Session
from app.traffic_source import resolve_traffic_source

router = APIRouter()

RESPONSES_ORDERED_PATH = Path(__file__).parent.parent / "data" / "responses_ordered.json"

AXIS_QUESTIONS = {
    "economic": [1, 2, 3, 4, 5, 6],
    "identity": [13, 14, 15],
    "technology": [10, 11, 12, 16, 17, 18],
    "society": [7, 8, 9],
}

MODELS = [
    "openrouter:anthropic/claude-3.5-haiku",
    "openai:gpt-4.1-mini",
    "openrouter:x-ai/grok-4-fast",
]
TOP_WINDOW_SIZE = 6
TOP_WEIGHTS = [5, 4, 3, 2, 1, 1]

class SessionRequest(BaseModel):
    answers: list[int]
    is_repeat: bool = False
    src: str | None = None
    trusted_token: str | None = None

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

def _response_key(response: dict) -> tuple[int, str]:
    """Returns a unique key for a response."""
    return (response["question_id"], response["model"])


def _question_key(response: dict) -> int:
    """Returns the question id used for question-level deduplication."""
    return response["question_id"]


def _normalize_response(response: dict) -> dict:
    """Maps rows from the ordered response source file to the API response contract."""
    return {
        "question_id": response["question_id"],
        "group_id": response.get("group_id"),
        "group_name": response.get("group_name"),
        "prompt_text": response["prompt_text"],
        "model": response["model"],
        "model_display_name": response["model_display_name"],
        "response_text": response["response_text"],
    }


def _load_responses_ordered() -> dict:
    """Loads the axis-ordered response source file."""
    with open(RESPONSES_ORDERED_PATH) as file:
        return json.load(file)


def _collect_all_unique_responses(responses_ordered: dict) -> list[dict]:
    """Builds a unique list of responses from all axis ranking lists."""
    unique = {}
    for axis_data in responses_ordered.values():
        for list_key in ("ordered_by_std", "ordered_by_bridging_score"):
            for response in axis_data[list_key]:
                unique[_response_key(response)] = response
    return list(unique.values())


def _weighted_pick_from_ranked(
    ranked_responses: list[dict],
    selected_question_ids: set[int],
    selected_response_keys: set[tuple[int, str]],
    model_counts: dict[str, int],
    picks_needed: int,
) -> list[dict]:
    """Selects weighted responses from ranked rows, widening window as needed."""
    picked = []
    window_end = TOP_WINDOW_SIZE

    while len(picked) < picks_needed and window_end <= len(ranked_responses):
        window = ranked_responses[:window_end]
        eligible = [
            response
            for response in window
            if _question_key(response) not in selected_question_ids
            and _response_key(response) not in selected_response_keys
            and model_counts.get(response["model"], 0) < 2
        ]
        if not eligible:
            window_end += 1
            continue

        weighted_candidates = []
        for response in eligible:
            index = window.index(response)
            weight = TOP_WEIGHTS[index] if index < len(TOP_WEIGHTS) else 1
            weighted_candidates.append((response, weight))
        choices = [candidate for candidate, _ in weighted_candidates]
        weights = [weight for _, weight in weighted_candidates]
        selected = random.choices(choices, weights=weights, k=1)[0]

        picked.append(selected)
        selected_question_ids.add(_question_key(selected))
        selected_response_keys.add(_response_key(selected))
        model_counts[selected["model"]] = model_counts.get(selected["model"], 0) + 1

    return picked


def _fill_random(
    pool: list[dict],
    selected_question_ids: set[int],
    selected_response_keys: set[tuple[int, str]],
    model_counts: dict[str, int],
    total_needed: int,
) -> list[dict]:
    """Fills selection from a pool while preserving question and model constraints."""
    picked = []
    while len(picked) < total_needed:
        eligible = [
            response
            for response in pool
            if _question_key(response) not in selected_question_ids
            and _response_key(response) not in selected_response_keys
            and model_counts.get(response["model"], 0) < 2
        ]
        if not eligible:
            break
        selected = random.choice(eligible)
        picked.append(selected)
        selected_question_ids.add(_question_key(selected))
        selected_response_keys.add(_response_key(selected))
        model_counts[selected["model"]] = model_counts.get(selected["model"], 0) + 1
    return picked


def select_responses(primary_axis: str, seen_question_ids: set[int] | None = None) -> list[dict]:
    """Selects six responses with axis-aware weighting and global constraints."""
    seen_question_ids = seen_question_ids or set()
    responses_ordered = _load_responses_ordered()
    all_responses = _collect_all_unique_responses(responses_ordered)
    axis_data = responses_ordered.get(primary_axis)

    selected_question_ids = set(seen_question_ids)
    selected_response_keys = set()
    model_counts = {model: 0 for model in MODELS}
    selected = []

    if primary_axis == "centrist" or not axis_data:
        selected.extend(
            _fill_random(
                all_responses,
                selected_question_ids,
                selected_response_keys,
                model_counts,
                6,
            )
        )
    else:
        selected.extend(
            _weighted_pick_from_ranked(
                axis_data["ordered_by_std"],
                selected_question_ids,
                selected_response_keys,
                model_counts,
                2,
            )
        )
        selected.extend(
            _weighted_pick_from_ranked(
                axis_data["ordered_by_bridging_score"],
                selected_question_ids,
                selected_response_keys,
                model_counts,
                2,
            )
        )
        selected.extend(
            _fill_random(
                all_responses,
                selected_question_ids,
                selected_response_keys,
                model_counts,
                6 - len(selected),
            )
        )

    if len(selected) < 6 or any(model_counts.get(model, 0) != 2 for model in MODELS):
        for _ in range(300):
            selected_question_ids = set(seen_question_ids)
            selected_response_keys = set()
            model_counts = {model: 0 for model in MODELS}
            selected = _fill_random(
                all_responses,
                selected_question_ids,
                selected_response_keys,
                model_counts,
                6,
            )
            if len(selected) == 6 and all(model_counts.get(model, 0) == 2 for model in MODELS):
                break

    random.shuffle(selected)
    return [_normalize_response(response) for response in selected[:6]]

@router.post("/session")
def create_session(request: SessionRequest, db: DBSession = Depends(get_db)):
    personas = assign_personas(request.answers)
    responses = select_responses(personas["primary_axis"])
    traffic_source = resolve_traffic_source(
        src=request.src,
        trusted_token=request.trusted_token,
    )

    session = Session(
        is_repeat=request.is_repeat,
        questionnaire_answers=json.dumps(request.answers),
        traffic_source=traffic_source,
        **personas,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "responses": responses,
    }
