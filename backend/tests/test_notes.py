def test_create_and_list_notes(client):
    payload = {"title": "Test", "content": "Hello world"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["title"] == "Test"

    r = client.get("/notes/")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1

    r = client.get("/notes/search/")
    assert r.status_code == 200

    r = client.get("/notes/search/", params={"q": "Hello"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1


def test_search_case_insensitive(client):
    client.post(
        "/notes/", json={"title": "Meeting Notes", "content": "Discuss roadmap"}
    )
    r = client.get("/notes/search/", params={"q": "meeting"})
    assert r.status_code == 200
    titles = [n["title"] for n in r.json()]
    assert "Meeting Notes" in titles


def test_search_matches_content(client):
    client.post("/notes/", json={"title": "Standup", "content": "Deploy to production"})
    r = client.get("/notes/search/", params={"q": "PRODUCTION"})
    assert r.status_code == 200
    assert any("Standup" == n["title"] for n in r.json())


def test_search_no_results(client):
    client.post("/notes/", json={"title": "Alpha", "content": "Beta"})
    r = client.get("/notes/search/", params={"q": "zzznomatch"})
    assert r.status_code == 200
    assert r.json() == []


def test_search_empty_query_returns_all(client):
    client.post("/notes/", json={"title": "One", "content": "first"})
    client.post("/notes/", json={"title": "Two", "content": "second"})
    r = client.get("/notes/search/", params={"q": ""})
    assert r.status_code == 200
    assert len(r.json()) >= 2


def test_extract_note_creates_action_items(client):
    r = client.post(
        "/notes/",
        json={"title": "Sprint", "content": "TODO: write docs\nShip it!\nJust a note"},
    )
    note_id = r.json()["id"]
    r = client.post(f"/notes/{note_id}/extract")
    assert r.status_code == 201
    items = r.json()
    descriptions = [i["description"] for i in items]
    assert "TODO: write docs" in descriptions
    assert "Ship it!" in descriptions
    assert len(items) == 2


def test_extract_note_404(client):
    r = client.post("/notes/99999/extract")
    assert r.status_code == 404
