"""Response selection logic for stratified session sampling."""

import json
import random
from pathlib import Path
from typing import Dict, List


AXIS_QUESTIONS = {
    "economic": [1, 2, 3, 4, 5, 6],
    "identity": [13, 14, 15],
    "technology": [10, 11, 12, 16, 17, 18],
}
CULTURAL_QUESTIONS = [7, 8, 9]
MODEL_NAMES = [
    "openrouter:anthropic/claude-3.5-haiku",
    "openrouter:openai/gpt-4.1-mini",
    "openrouter:x-ai/grok-4-fast",
]


def load_response_pool() -> List[dict]:
    """Load static response candidates from the data directory."""
    data_path = Path(__file__).resolve().parent.parent / "data" / "responses.json"
    with data_path.open("r", encoding="utf-8") as response_file:
        return json.load(response_file)


def determine_primary_axis(axis_scores: Dict[str, int]) -> str:
    """Determine the axis with greatest absolute deviation from neutral."""
    return max(axis_scores.keys(), key=lambda axis_name: abs(axis_scores[axis_name]))


def select_stratified_responses(axis_scores: Dict[str, int]) -> List[dict]:
    """Select seven responses based on axis-focused stratification.

    Args:
        axis_scores: Participant axis scores keyed by axis.

    Returns:
        List[dict]: Seven selected responses shuffled into random order.
    """
    response_pool = load_response_pool()
    primary_axis = determine_primary_axis(axis_scores)
    primary_question_ids = AXIS_QUESTIONS[primary_axis]

    selected_responses: List[dict] = []
    for model_name in MODEL_NAMES:
        model_axis_responses = [
            response
            for response in response_pool
            if response["response_model"] == model_name and response["question_id"] in primary_question_ids
        ]
        selected_responses.extend(random.sample(model_axis_responses, k=2))

    cultural_candidates = [
        response for response in response_pool if response["question_id"] in CULTURAL_QUESTIONS
    ]
    selected_responses.append(random.choice(cultural_candidates))

    random.shuffle(selected_responses)
    return selected_responses
