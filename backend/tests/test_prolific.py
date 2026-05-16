from app.prolific import normalize_prolific_param


def test_valid_prolific_param_trimmed():
    assert normalize_prolific_param("  abc123  ") == "abc123"


def test_template_placeholder_rejected():
    assert normalize_prolific_param("{{%PROLIFIC_PID%}}") is None


def test_empty_rejected():
    assert normalize_prolific_param("") is None
    assert normalize_prolific_param(None) is None


def test_too_long_rejected():
    assert normalize_prolific_param("x" * 129) is None
