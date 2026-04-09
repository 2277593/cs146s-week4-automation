# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stanford CS146S Week 4 assignment — a FastAPI + SQLite notes app with a vanilla JS frontend. The primary goal is an **automated agent workflow**: pick the next task, implement it, validate, report, notify. The writeup template is `writeup.md`.

## Commands

```bash
uv run make run        # FastAPI dev server at http://127.0.0.1:8000
uv run make test       # Run all tests
uv run make lint       # Ruff check
uv run make format     # Black + ruff --fix
uv run make seed       # Manually seed the DB
PYTHONPATH=. uv run pytest -q backend/tests/test_notes.py        # Single file
PYTHONPATH=. uv run pytest -q -k "test_name"                     # Single test
```

## Architecture

```
backend/app/
  main.py           # FastAPI app; mounts /static → frontend/; registers routers
  db.py             # SQLite via DATABASE_PATH env (default ./data/app.db)
                    # get_db() for DI, get_session() as context manager
                    # apply_seed_if_needed() runs only on first DB creation
  models.py         # Note(id, title, content), ActionItem(id, description, completed)
  schemas.py        # Pydantic: NoteCreate/NoteRead, ActionItemCreate/ActionItemRead
  routers/
    notes.py        # GET/POST /notes/, GET /notes/search/?q=, GET /notes/{id}
    action_items.py # GET/POST /action-items/, PUT /action-items/{id}/complete
  services/
    extract.py      # extract_action_items(text) — lines ending "!" or starting "todo:"
frontend/           # Vanilla JS SPA served at /
backend/tests/
  conftest.py       # client fixture: TestClient + temp SQLite, overrides get_db via app.dependency_overrides
```

No Alembic — schema is created via `Base.metadata.create_all` on startup. Model changes require manually dropping or migrating `./data/app.db`. `dotenv` is a runtime dep pulled in by `fastapi[standard]`, not listed explicitly in `pyproject.toml`.

---

## Agent Workflow

Every run follows these steps in order. Minimize user questions — prefer acting.

### 1. Select the task

- Read `docs/TASKS.md`.
- Choose the **earliest task with an unchecked `[ ]` subtask** that is independently actionable.
- If a task is clearly blocked by something external, skip it and note why in the report.
- If a task is large, only complete **one smallest meaningful subtask** per run.

### 2. Identify relevant files

Before touching code, briefly state which files are likely affected. No need to be exhaustive — just enough to avoid surprise edits.

### 3. Implement

- Modify existing files rather than creating new ones when possible.
- Do not add files, abstractions, or error handling beyond what the subtask requires.
- Mark each completed subtask `[x]` in `docs/TASKS.md` immediately after it's done. Do not reformat or renumber anything else in the file.

### 4. Validate

Run tests after any code change:
```bash
uv run make test
```
If tests fail, fix before proceeding. Run lint if formatting was touched:
```bash
uv run make lint
```

### 5. Generate the report

Write `reports/latest.html` — overwrite every run. No external CSS or JS dependencies.

The report should feel like it was written by a sharp, efficient assistant — crisp sentences, no fluff, but with personality. Structure:

```
1. Task Selected       — which task + subtask was worked on
2. What Changed        — files modified and what was done
3. Validation Run      — which tests/commands were executed
4. Result / Status     — pass counts, failures, current state
5. Recommended Next    — the single most logical next step
```

Use clean HTML with inline styles: white background, readable font, subtle section dividers, a status badge (green = pass, red = fail). No walls of text.

### 6. Notify

After writing the report, always run:
```bash
osascript -e 'display notification "Your latest report is ready — open reports/latest.html" with title "Claude Code · Week 4"'
```

---

## Adding a New Task

Append to `docs/TASKS.md` using the existing format exactly — preserve numbering style and spacing:

```markdown
## N) Task title
[ ] Subtask one — specific file or command
[ ] Subtask two — specific file or command
```

Edit the file directly. Do not use a helper script.
