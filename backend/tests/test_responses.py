import pytest
import json
from pathlib import Path

VALID_ANSWERS = [4, 2, 3, 4, 2, 4, 2, 4]
MODELS = [
    "openrouter:anthropic/claude-3.5-haiku",
    "openai:gpt-4.1-mini",
    "openrouter:x-ai/grok-4-fast",
]

def create_session(client):
    response = client.post("/session", json={
        "answers": VALID_ANSWERS,
        "is_repeat": False,
    })
    data = response.json()
    return data["session_id"], data["responses"]

def response_key(r):
    return r["question_id"]

def test_more_responses_returns_six(client):
    session_id, _ = create_session(client)
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_question_ids": [],
    })
    assert response.status_code == 200
    assert len(response.json()) == 6

def test_more_responses_excludes_seen(client):
    session_id, initial_responses = create_session(client)
    seen_keys = [response_key(r) for r in initial_responses]
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_question_ids": seen_keys,
    })
    assert response.status_code == 200
    new_responses = response.json()
    new_question_ids = [response_key(r) for r in new_responses]
    for question_id in new_question_ids:
        assert question_id not in seen_keys

def test_more_responses_no_duplicates_within_batch(client):
    session_id, _ = create_session(client)
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_question_ids": [],
    })
    question_ids = [response_key(r) for r in response.json()]
    assert len(question_ids) == len(set(question_ids))

def test_more_responses_uses_question_level_seen_ids(client):
    session_id, _ = create_session(client)
    responses_path = Path(__file__).parent.parent / "app" / "data" / "responses_ordered.json"
    with open(responses_path) as f:
        ordered = json.load(f)
    all_question_ids = set()
    for axis_data in ordered.values():
        for row in axis_data["ordered_by_std"]:
            all_question_ids.add(row["question_id"])
    seen_keys = list(all_question_ids)[:6]
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_question_ids": seen_keys,
    })
    assert response.status_code == 200
    for row in response.json():
        assert row["question_id"] not in seen_keys

def test_more_responses_returns_empty_when_all_seen(client):
    session_id, _ = create_session(client)
    responses_path = Path(__file__).parent.parent / "app" / "data" / "responses_ordered.json"
    with open(responses_path) as f:
        ordered = json.load(f)
    all_question_ids = set()
    for axis_data in ordered.values():
        for row in axis_data["ordered_by_std"]:
            all_question_ids.add(row["question_id"])
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_question_ids": list(all_question_ids),
    })
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_more_responses_has_required_fields(client):
    session_id, _ = create_session(client)
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_question_ids": [],
    })
    for r in response.json():
        assert "question_id" in r
        assert "prompt_text" in r
        assert "group_id" in r
        assert "model" in r
        assert "model_display_name" in r
        assert "response_text" in r
