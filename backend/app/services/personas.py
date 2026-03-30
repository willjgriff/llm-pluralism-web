"""Persona scoring and assignment functions."""

from typing import Dict


def compute_axis_scores(answers: list) -> Dict[str, int]:
    """Compute axis scores from six questionnaire answers.

    Args:
        answers: Six integers in questionnaire order, each from 1 to 5.

    Returns:
        Dict[str, int]: Economic, identity, and technology axis scores.
    """
    economic_score = answers[1] - answers[0]
    identity_score = answers[2] - answers[3]
    technology_score = answers[5] - answers[4]
    return {
        "economic": economic_score,
        "identity": identity_score,
        "technology": technology_score,
    }


def assign_personas(axis_scores: Dict[str, int]) -> Dict[str, str]:
    """Assign a persona on each axis based on score sign.

    Args:
        axis_scores: Axis scores keyed by axis name.

    Returns:
        Dict[str, str]: Persona labels keyed by axis.
    """
    return {
        "economic": "Libertarian" if axis_scores["economic"] >= 0 else "Collectivist",
        "identity": "Nationalist" if axis_scores["identity"] >= 0 else "Globalist",
        "technology": "Tech Optimist" if axis_scores["technology"] >= 0 else "Tech Sceptic",
    }
