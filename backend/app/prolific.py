"""Normalize and validate Prolific query parameters for session storage."""

from typing import Optional

MAX_PROLIFIC_PARAM_LENGTH = 128


def normalize_prolific_param(value: Optional[str]) -> Optional[str]:
    """Return a trimmed Prolific ID string, or None if missing or invalid.

    Rejects empty values, unsubstituted Prolific template placeholders (``{{%...%}}``),
    and strings longer than ``MAX_PROLIFIC_PARAM_LENGTH``.

    Parameters:
        value: Raw query value from the client, or None if absent.

    Returns:
        A non-empty string suitable for persistence, or None.
    """
    if value is None:
        return None
    trimmed = value.strip()
    if not trimmed:
        return None
    if "{{" in trimmed or "}}" in trimmed:
        return None
    if len(trimmed) > MAX_PROLIFIC_PARAM_LENGTH:
        return None
    return trimmed
