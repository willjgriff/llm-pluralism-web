from app.traffic_source import resolve_traffic_source


def test_allowlisted_src_normalized_to_lowercase(monkeypatch):
    monkeypatch.delenv("SURVEY_TRUSTED_TOKEN", raising=False)
    assert resolve_traffic_source(src="X", trusted_token=None) == "x"


def test_unknown_src_returns_none(monkeypatch):
    monkeypatch.delenv("SURVEY_TRUSTED_TOKEN", raising=False)
    assert resolve_traffic_source(src="not_a_channel", trusted_token=None) is None


def test_matching_trusted_token_returns_trusted(monkeypatch):
    monkeypatch.setenv("SURVEY_TRUSTED_TOKEN", "secret-token")
    assert resolve_traffic_source(src="x", trusted_token="secret-token") == "trusted"


def test_wrong_trusted_token_falls_through_to_allowlisted_src(monkeypatch):
    monkeypatch.setenv("SURVEY_TRUSTED_TOKEN", "secret-token")
    assert resolve_traffic_source(src="reddit", trusted_token="wrong") == "reddit"


def test_no_env_trusted_token_ignores_t_param(monkeypatch):
    monkeypatch.delenv("SURVEY_TRUSTED_TOKEN", raising=False)
    assert resolve_traffic_source(src=None, trusted_token="anything") is None
