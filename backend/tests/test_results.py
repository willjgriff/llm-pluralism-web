import pytest

VALID_ANSWERS = [4, 2, 3, 4, 2, 4, 2, 4]

MODELS = [
    "openrouter:anthropic/claude-3.5-haiku",
    "openai:gpt-4.1-mini",
    "openrouter:x-ai/grok-4-fast",
]

def create_session(client, answers=None, is_repeat=False):
    response = client.post("/session", json={
        "answers": answers or VALID_ANSWERS,
        "is_repeat": is_repeat,
    })
    return response.json()["session_id"]

def submit_rating(client, session_id, question_id, model, score):
    return client.post("/rating", json={
        "session_id": session_id,
        "question_id": question_id,
        "model": model,
        "score": score,
    })

def create_session_with_ratings(client, scores_by_model, is_repeat=False, answers=None):
    session_id = create_session(client, answers=answers, is_repeat=is_repeat)
    question_id = 1
    for model, scores in scores_by_model.items():
        for score in scores:
            submit_rating(client, session_id, question_id, model, score)
            question_id += 1
    return session_id

def test_results_not_found_for_invalid_session(client):
    response = client.get("/results/fake-session-id")
    assert response.status_code == 404

def test_results_not_found_with_no_ratings(client):
    session_id = create_session(client)
    response = client.get(f"/results/{session_id}")
    assert response.status_code == 404

def test_results_returns_correct_structure(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [4, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [2, 1],
    })
    response = client.get(f"/results/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "model_scores" in data
    assert "best_match" in data
    assert "aggregate_by_persona" in data
    assert "total_participants" in data
    assert "ratings_count" in data
    assert "use_live_data" in data

def test_best_match_is_highest_scoring_model(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [5, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [1, 1],
    })
    response = client.get(f"/results/{session_id}")
    data = response.json()
    assert data["best_match"]["model"] == MODELS[0]
    assert data["best_match"]["mean_score"] == 5.0

def test_model_scores_sorted_descending(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [5, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [1, 1],
    })
    response = client.get(f"/results/{session_id}")
    data = response.json()
    scores = [m["mean_score"] for m in data["model_scores"]]
    assert scores == sorted(scores, reverse=True)

def test_mean_scores_calculated_correctly(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [4, 2],
        MODELS[1]: [3, 3],
        MODELS[2]: [5, 1],
    })
    response = client.get(f"/results/{session_id}")
    data = response.json()
    scores_by_model = {m["model"]: m["mean_score"] for m in data["model_scores"]}
    assert scores_by_model[MODELS[0]] == 3.0
    assert scores_by_model[MODELS[1]] == 3.0
    assert scores_by_model[MODELS[2]] == 3.0

def test_ratings_count_is_correct(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [4, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [2, 1],
    })
    response = client.get(f"/results/{session_id}")
    data = response.json()
    assert data["ratings_count"] == 6

def test_use_live_data_false_below_threshold(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [4, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [2, 1],
    })
    response = client.get(f"/results/{session_id}")
    data = response.json()
    assert data["use_live_data"] == False

def test_static_persona_data_returned_below_threshold(client):
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [4, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [2, 1],
    })
    response = client.get(f"/results/{session_id}")
    data = response.json()
    personas = [p["persona"] for p in data["aggregate_by_persona"]]
    assert "Libertarian" in personas
    assert "Collectivist" in personas
    assert "Globalist" in personas

def test_repeat_sessions_excluded_from_participant_count(client):
    create_session_with_ratings(client, {
        MODELS[0]: [4, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [2, 1],
    }, is_repeat=True)
    session_id = create_session_with_ratings(client, {
        MODELS[0]: [4, 5],
        MODELS[1]: [3, 3],
        MODELS[2]: [2, 1],
    }, is_repeat=False)
    response = client.get(f"/results/{session_id}")
    data = response.json()
    assert data["total_participants"] == 1

def test_use_live_data_true_at_threshold(client):
    persona_answer_profiles = [
        [4, 2, 3, 3, 3, 3, 3, 3],
        [1, 5, 3, 3, 3, 3, 3, 3],
        [3, 3, 5, 1, 3, 3, 3, 3],
        [3, 3, 1, 5, 3, 3, 3, 3],
        [3, 3, 3, 3, 1, 5, 3, 3],
        [3, 3, 3, 3, 5, 1, 3, 3],
        [3, 3, 3, 3, 3, 3, 5, 1],
        [3, 3, 3, 3, 3, 3, 1, 5],
    ]
    for _ in range(3):
        for answers in persona_answer_profiles:
            create_session_with_ratings(
                client,
                {
                    MODELS[0]: [4, 5],
                    MODELS[1]: [3, 3],
                    MODELS[2]: [2, 1],
                },
                is_repeat=False,
                answers=answers,
            )
    session_id = create_session_with_ratings(
        client,
        {
            MODELS[0]: [4, 5],
            MODELS[1]: [3, 3],
            MODELS[2]: [2, 1],
        },
        answers=VALID_ANSWERS,
    )
    response = client.get(f"/results/{session_id}")
    data = response.json()
    assert data["use_live_data"] == True
    for p in data["aggregate_by_persona"]:
        assert p["participant_count"] > 0
