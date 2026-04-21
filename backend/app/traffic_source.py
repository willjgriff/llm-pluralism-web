"""Resolve and validate survey traffic attribution from client-supplied parameters.

Public links use ``?src=<value>`` where ``<value>`` must appear in ``ALLOWED_TRAFFIC_SOURCES``.
Trusted circles use ``?t=<secret>`` matching the ``SURVEY_TRUSTED_TOKEN`` environment variable;
when it matches, stored source is ``trusted`` (the ``src`` parameter is ignored).
"""

import os
import secrets
from typing import Optional

ALLOWED_TRAFFIC_SOURCES = frozenset(
    {
        "x",
        "bluedot",
        "slack",
        "github",
        "reddit",
        "reddit-liberal",
        "reddit-sample",
        "ea",
        "discord",
        "other",
    }
)


def resolve_traffic_source(
    *,
    src: Optional[str],
    trusted_token: Optional[str],
) -> Optional[str]:
    """Return a stored traffic label, or None if nothing valid was provided.

    If ``SURVEY_TRUSTED_TOKEN`` is set and ``trusted_token`` matches it, returns
    ``"trusted"``. Otherwise, if ``src`` normalizes to a member of
    ``ALLOWED_TRAFFIC_SOURCES``, returns that lowercase token. Unknown ``src``
    values are rejected (returns None).

    Parameters:
        src: Raw ``src`` query value from the client, or None if absent.
        trusted_token: Raw ``t`` query value from the client, or None if absent.

    Returns:
        ``"trusted"``, an allowlisted source string, or None.
    """
    expected_trusted = os.getenv("SURVEY_TRUSTED_TOKEN")
    if expected_trusted and trusted_token:
        if secrets.compare_digest(trusted_token, expected_trusted):
            return "trusted"
    if src is None:
        return None
    normalized = src.strip().lower()
    if normalized in ALLOWED_TRAFFIC_SOURCES:
        return normalized
    return None
