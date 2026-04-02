import pytest

def create_session(client):
    response = client.post("/session", json={
        "answers": [4, 2, 3, 4, 2, 4, 2, 4],
        "is_repeat": False
    })
    return response.json()["session_id"]

def test_valid_rating_succeeds(client):
    session_id = create_session(client)
    response = client.post("/rating", json={
        "session_id": session_id,
        "question_id": 1,
        "model": "openrouter:anthropic/claude-3.5-haiku",
        "score": 4,
        "reasoning": "Balanced response"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "rating_id" in data

def test_rating_without_reasoning_succeeds(client):
    session_id = create_session(client)
    response = client.post("/rating", json={
        "session_id": session_id,
        "question_id": 1,
        "model": "openrouter:anthropic/claude-3.5-haiku",
        "score": 3
    })
    assert response.status_code == 200

def test_score_too_high_returns_400(client):
    session_id = create_session(client)
    response = client.post("/rating", json={
        "session_id": session_id,
        "question_id": 1,
        "model": "openrouter:anthropic/claude-3.5-haiku",
        "score": 6
    })
    assert response.status_code == 400

def test_score_too_low_returns_400(client):
    session_id = create_session(client)
    response = client.post("/rating", json={
        "session_id": session_id,
        "question_id": 1,
        "model": "openrouter:anthropic/claude-3.5-haiku",
        "score": 0
    })
    assert response.status_code == 400

def test_invalid_session_id_returns_404(client):
    response = client.post("/rating", json={
        "session_id": "fake-session-id",
        "question_id": 1,
        "model": "openrouter:anthropic/claude-3.5-haiku",
        "score": 3
    })
    assert response.status_code == 404

def test_multiple_ratings_for_same_session(client):
    session_id = create_session(client)
    for i in range(1, 4):
        response = client.post("/rating", json={
            "session_id": session_id,
            "question_id": i,
            "model": "openrouter:anthropic/claude-3.5-haiku",
            "score": i + 1
        })
        assert response.status_code == 200

def test_all_valid_scores_accepted(client):
    session_id = create_session(client)
    for score in [1, 2, 3, 4, 5]:
        response = client.post("/rating", json={
            "session_id": session_id,
            "question_id": score,
            "model": "openrouter:anthropic/claude-3.5-haiku",
            "score": score
        })
        assert response.status_code == 200

