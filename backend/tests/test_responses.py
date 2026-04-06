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
    return f"{r['question_id']}:{r['model']}"

def test_more_responses_returns_six(client):
    session_id, _ = create_session(client)
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_response_keys": [],
    })
    assert response.status_code == 200
    assert len(response.json()) == 6

def test_more_responses_excludes_seen(client):
    session_id, initial_responses = create_session(client)
    seen_keys = [response_key(r) for r in initial_responses]
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_response_keys": seen_keys,
    })
    assert response.status_code == 200
    new_responses = response.json()
    new_keys = [response_key(r) for r in new_responses]
    for key in new_keys:
        assert key not in seen_keys

def test_more_responses_no_duplicates_within_batch(client):
    session_id, _ = create_session(client)
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_response_keys": [],
    })
    keys = [response_key(r) for r in response.json()]
    assert len(keys) == len(set(keys))

def test_more_responses_returns_empty_when_max_seen_reached(client):
    session_id, _ = create_session(client)
    responses_path = Path(__file__).parent.parent / "app" / "data" / "web_formatted_responses.json"
    with open(responses_path) as f:
        all_responses = json.load(f)
    all_keys = [response_key(r) for r in all_responses]
    seen_keys = all_keys[:30]
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_response_keys": seen_keys,
    })
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_more_responses_returns_empty_when_all_seen(client):
    session_id, _ = create_session(client)
    responses_path = Path(__file__).parent.parent / "app" / "data" / "web_formatted_responses.json"
    with open(responses_path) as f:
        all_responses = json.load(f)
    all_keys = [response_key(r) for r in all_responses]
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_response_keys": all_keys,
    })
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_more_responses_has_required_fields(client):
    session_id, _ = create_session(client)
    response = client.post("/responses/more", json={
        "session_id": session_id,
        "seen_response_keys": [],
    })
    for r in response.json():
        assert "question_id" in r
        assert "prompt" in r
        assert "model" in r
        assert "model_display_name" in r
        assert "response_text" in r
