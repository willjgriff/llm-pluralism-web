"""Unit tests for the current responses_ordered-based response selection."""

from app.routers.session import MODELS, select_responses


def test_axis_selection_returns_six_unique_questions_and_two_per_model():
    responses = select_responses("economic")
    assert len(responses) == 6
    question_ids = [response["question_id"] for response in responses]
    assert len(question_ids) == len(set(question_ids))
    models = [response["model"] for response in responses]
    for model in MODELS:
        assert models.count(model) == 2


def test_centrist_selection_uses_global_pool_with_same_constraints():
    responses = select_responses("centrist")
    assert len(responses) == 6
    question_ids = [response["question_id"] for response in responses]
    assert len(question_ids) == len(set(question_ids))
    models = [response["model"] for response in responses]
    for model in MODELS:
        assert models.count(model) == 2


def test_seen_question_ids_are_excluded():
    first_batch = select_responses("technology")
    seen_question_ids = {response["question_id"] for response in first_batch}
    second_batch = select_responses("technology", seen_question_ids=seen_question_ids)
    second_question_ids = {response["question_id"] for response in second_batch}
    assert second_question_ids.isdisjoint(seen_question_ids)
