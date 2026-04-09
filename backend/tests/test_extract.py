from backend.app.services.extract import extract_action_items, extract_tags


def test_extract_action_items():
    text = """
    This is a note
    - TODO: write tests
    - Ship it!
    Not actionable
    """.strip()
    items = extract_action_items(text)
    assert "TODO: write tests" in items
    assert "Ship it!" in items


def test_extract_tags_single():
    assert extract_tags("Review the #backend module") == ["backend"]


def test_extract_tags_multiple():
    tags = extract_tags("Fix #bug in #auth and #api layers")
    assert tags == ["bug", "auth", "api"]


def test_extract_tags_none():
    assert extract_tags("No tags here at all") == []


def test_extract_tags_mixed_with_action_items():
    text = "TODO: fix the #auth issue!\nDeploy #production build!"
    assert "auth" in extract_tags(text)
    assert "production" in extract_tags(text)
