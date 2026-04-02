import pytest

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

def test_collectivist_gets_economic_questions(client):
    # answers[1] - answers[0] = 2 - 4 = -2 -> Collectivist dominant
    response = create_session(client, answers=[4, 2, 3, 3, 3, 3, 3, 3])
    data = response.json()
    economic_question_ids = [1, 2, 3, 4, 5, 6]
    for r in data["responses"]:
        assert r["question_id"] in economic_question_ids

def test_libertarian_gets_economic_questions(client):
    # answers[1] - answers[0] = 5 - 1 = +4 -> Libertarian dominant
    response = create_session(client, answers=[1, 5, 3, 3, 3, 3, 3, 3])
    data = response.json()
    economic_question_ids = [1, 2, 3, 4, 5, 6]
    for r in data["responses"]:
        assert r["question_id"] in economic_question_ids

def test_nationalist_gets_identity_questions(client):
    # answers[2] - answers[3] = 5 - 1 = +4 -> Nationalist dominant
    response = create_session(client, answers=[3, 3, 5, 1, 3, 3, 3, 3])
    data = response.json()
    identity_question_ids = [5, 7, 13, 14, 15, 16]
    for r in data["responses"]:
        assert r["question_id"] in identity_question_ids

def test_globalist_gets_identity_questions(client):
    # answers[2] - answers[3] = 1 - 5 = -4 -> Globalist dominant
    response = create_session(client, answers=[3, 3, 1, 5, 3, 3, 3, 3])
    data = response.json()
    identity_question_ids = [5, 7, 13, 14, 15, 16]
    for r in data["responses"]:
        assert r["question_id"] in identity_question_ids

def test_tech_optimist_gets_technology_questions(client):
    # answers[5] - answers[4] = 5 - 1 = +4 -> Tech Optimist dominant
    response = create_session(client, answers=[3, 3, 3, 3, 1, 5, 3, 3])
    data = response.json()
    technology_question_ids = [10, 11, 12, 16, 17, 18]
    for r in data["responses"]:
        assert r["question_id"] in technology_question_ids

def test_tech_sceptic_gets_technology_questions(client):
    # answers[5] - answers[4] = 1 - 5 = -4 -> Tech Sceptic dominant
    response = create_session(client, answers=[3, 3, 3, 3, 5, 1, 3, 3])
    data = response.json()
    technology_question_ids = [10, 11, 12, 16, 17, 18]
    for r in data["responses"]:
        assert r["question_id"] in technology_question_ids

def test_religious_gets_society_questions(client):
    # answers[6] - answers[7] = 5 - 1 = +4 -> Religious dominant
    response = create_session(client, answers=[3, 3, 3, 3, 3, 3, 5, 1])
    data = response.json()
    society_question_ids = [4, 5, 7, 8, 9, 12]
    for r in data["responses"]:
        assert r["question_id"] in society_question_ids

def test_secularist_gets_society_questions(client):
    # answers[6] - answers[7] = 1 - 5 = -4 -> Secularist dominant
    response = create_session(client, answers=[3, 3, 3, 3, 3, 3, 1, 5])
    data = response.json()
    society_question_ids = [4, 5, 7, 8, 9, 12]
    for r in data["responses"]:
        assert r["question_id"] in society_question_ids

def test_centrist_gets_mixed_questions(client):
    # all neutral scores -> Centrist
    response = create_session(client, answers=[3, 3, 3, 3, 3, 3, 3, 3])
    data = response.json()
    assert response.status_code == 200
    assert len(data["responses"]) == 6

def test_tie_breaking_picks_economic_first(client):
    # economic and identity both score abs=4, economic should win
    response = create_session(client, answers=[5, 1, 1, 5, 3, 3, 3, 3])
    data = response.json()
    economic_question_ids = [1, 2, 3, 4, 5, 6]
    for r in data["responses"]:
        assert r["question_id"] in economic_question_ids

def test_repeat_session_flag_stored(client):
    response = create_session(client, is_repeat=True)
    assert response.status_code == 200

def test_response_has_required_fields(client):
    response = create_session(client)
    data = response.json()
    for r in data["responses"]:
        assert "question_id" in r
        assert "prompt" in r
        assert "model" in r
        assert "model_display_name" in r
        assert "response_text" in r

