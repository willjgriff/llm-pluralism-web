"""Apply lightweight schema updates for columns added after initial table creation."""

import json
import time
from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

_DEBUG_LOG_PATH = Path(__file__).resolve().parents[2] / ".cursor" / "debug-0d397f.log"

PROLIFIC_COLUMNS = (
    ("prolific_pid", "VARCHAR(128)"),
    ("prolific_study_id", "VARCHAR(128)"),
    ("prolific_session_id", "VARCHAR(128)"),
)


def _debug_log(message: str, data: dict, hypothesis_id: str) -> None:
    """Append one NDJSON debug line for this session (debug mode)."""
    # #region agent log
    try:
        payload = {
            "sessionId": "0d397f",
            "timestamp": int(time.time() * 1000),
            "location": "schema_migrations.py",
            "message": message,
            "data": data,
            "hypothesisId": hypothesis_id,
        }
        _DEBUG_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with _DEBUG_LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload) + "\n")
    except OSError:
        pass
    # #endregion


def ensure_prolific_columns(engine: Engine) -> None:
    """Add Prolific attribution columns to ``sessions`` when missing (SQLite/Postgres).

    ``Base.metadata.create_all`` does not alter existing tables; this runs on startup so
    local DB files and production DBs pick up new nullable columns without manual steps.

    Parameters:
        engine: SQLAlchemy engine bound to the application database.
    """
    inspector = inspect(engine)
    if "sessions" not in inspector.get_table_names():
        _debug_log("sessions table missing; create_all will create it", {}, "H1")
        return

    existing = {column["name"] for column in inspector.get_columns("sessions")}
    _debug_log(
        "sessions columns before migration",
        {"columns": sorted(existing)},
        "H1",
    )

    added: list[str] = []
    with engine.begin() as connection:
        for column_name, column_type in PROLIFIC_COLUMNS:
            if column_name in existing:
                continue
            connection.execute(
                text(f"ALTER TABLE sessions ADD COLUMN {column_name} {column_type}")
            )
            added.append(column_name)

    if added:
        _debug_log("added prolific columns", {"added": added}, "H1")
    else:
        _debug_log("prolific columns already present", {}, "H1")
