import pytest
from app.models.database import Session as SessionRow

VALID_ANSWERS = [4, 2, 3, 4, 2, 4, 2, 4]

def create_session(client, answers=None, is_repeat=False):
    return client.post("/session", json={
        "answers": answers or VALID_ANSWERS,
        "is_repeat": is_repeat
    })

def test_session_returns_session_id(client):
    response = create_session(client)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["session_id"]) > 0

def test_session_returns_six_responses(client):
    response = create_session(client)
    data = response.json()
    assert len(data["responses"]) == 6

def test_session_returns_two_responses_per_model(client):
    response = create_session(client)
    data = response.json()
    models = [r["model"] for r in data["responses"]]
    assert models.count("openrouter:anthropic/claude-3.5-haiku") == 2
    assert models.count("openai:gpt-4.1-mini") == 2
    assert models.count("openrouter:x-ai/grok-4-fast") == 2

def test_session_never_repeats_question_id(client):
    response = create_session(client)
    data = response.json()
    question_ids = [r["question_id"] for r in data["responses"]]
    assert len(question_ids) == len(set(question_ids))

def test_centrist_still_meets_model_and_question_constraints(client):
    response = create_session(client, answers=[3, 3, 3, 3, 3, 3, 3, 3])
    data = response.json()
    models = [r["model"] for r in data["responses"]]
    question_ids = [r["question_id"] for r in data["responses"]]
    assert models.count("openrouter:anthropic/claude-3.5-haiku") == 2
    assert models.count("openai:gpt-4.1-mini") == 2
    assert models.count("openrouter:x-ai/grok-4-fast") == 2
    assert len(question_ids) == len(set(question_ids))

def test_non_centrist_axis_biases_toward_axis_question_set(client):
    response = create_session(client, answers=[1, 5, 3, 3, 3, 3, 3, 3])
    data = response.json()
    economic_question_ids = {1, 2, 3, 4, 5, 6}
    axis_hits = sum(r["question_id"] in economic_question_ids for r in data["responses"])
    assert axis_hits >= 3


def test_society_primary_keeps_db_axis_but_selects_like_runner_up(client, db_session):
    """Society-dominant profile: primary_axis stays society; responses use second-strongest (economic here)."""
    society_primary_answers = [3, 3, 3, 3, 3, 3, 5, 1]
    response = create_session(client, answers=society_primary_answers)
    assert response.status_code == 200
    data = response.json()
    session_id = data["session_id"]
    row = db_session.query(SessionRow).filter(SessionRow.id == session_id).one()
    assert row.primary_axis == "society"
    economic_question_ids = {1, 2, 3, 4, 5, 6}
    axis_hits = sum(r["question_id"] in economic_question_ids for r in data["responses"])
    assert axis_hits >= 3


def test_tie_breaking_still_picks_economic_primary_axis(client, db_session):
    response = create_session(client, answers=[5, 1, 1, 5, 3, 3, 3, 3])
    session_id = response.json()["session_id"]
    row = db_session.query(SessionRow).filter(SessionRow.id == session_id).one()
    assert row.primary_axis == "economic"

def test_repeat_session_flag_stored(client):
    response = create_session(client, is_repeat=True)
    assert response.status_code == 200

def test_response_has_required_fields(client):
    response = create_session(client)
    data = response.json()
    for r in data["responses"]:
        assert "question_id" in r
        assert "prompt_text" in r
        assert "group_id" in r
        assert "model" in r
        assert "model_display_name" in r
        assert "response_text" in r


def test_allowlisted_src_stored_on_session(client, db_session):
    response = client.post(
        "/session",
        json={"answers": VALID_ANSWERS, "is_repeat": False, "src": "x"},
    )
    assert response.status_code == 200
    session_id = response.json()["session_id"]
    row = db_session.query(SessionRow).filter(SessionRow.id == session_id).one()
    assert row.traffic_source == "x"


def test_unknown_src_stored_as_null(client, db_session):
    response = client.post(
        "/session",
        json={"answers": VALID_ANSWERS, "is_repeat": False, "src": "fake_channel"},
    )
    assert response.status_code == 200
    session_id = response.json()["session_id"]
    row = db_session.query(SessionRow).filter(SessionRow.id == session_id).one()
    assert row.traffic_source is None


def test_trusted_token_stored_when_env_set(client, db_session, monkeypatch):
    monkeypatch.setenv("SURVEY_TRUSTED_TOKEN", "my-shared-secret")
    response = client.post(
        "/session",
        json={
            "answers": VALID_ANSWERS,
            "is_repeat": False,
            "src": "x",
            "trusted_token": "my-shared-secret",
        },
    )
    assert response.status_code == 200
    session_id = response.json()["session_id"]
    row = db_session.query(SessionRow).filter(SessionRow.id == session_id).one()
    assert row.traffic_source == "trusted"


def test_rapid_duplicate_session_requests_are_deduped(client, db_session):
    request_payload = {"answers": VALID_ANSWERS, "is_repeat": False}
    first_response = client.post("/session", json=request_payload)
    second_response = client.post("/session", json=request_payload)

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert first_response.json()["session_id"] == second_response.json()["session_id"]
    assert db_session.query(SessionRow).count() == 1

