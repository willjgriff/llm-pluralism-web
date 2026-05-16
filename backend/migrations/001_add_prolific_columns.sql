-- Run against production Postgres after deploying code that reads these columns.
-- Safe to run multiple times only if your DB supports IF NOT EXISTS (Postgres 9.1+).

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS prolific_pid VARCHAR(128);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS prolific_study_id VARCHAR(128);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS prolific_session_id VARCHAR(128);
