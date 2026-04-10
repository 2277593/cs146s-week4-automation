# API Reference

Base URL: `http://127.0.0.1:8000`

Interactive docs: `/docs` (Swagger UI), `/redoc` (ReDoc), `/openapi.json` (raw schema)

---

## Notes

### `GET /notes/`
List all notes.

**Response 200**
```json
[{ "id": 1, "title": "string", "content": "string" }]
```

---

### `POST /notes/`
Create a note.

**Request body**
```json
{ "title": "string (min 1)", "content": "string (min 1)" }
```

**Response 201** — created note
**Response 422** — validation error (empty fields)

---

### `GET /notes/search/?q=`
Search notes by title or content (case-insensitive). Returns all notes if `q` is empty.

**Query params**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q`   | string | no | Search term |

**Response 200** — matching notes array

---

### `GET /notes/{id}`
Get a single note by ID.

**Response 200** — note object
**Response 404** `{"detail": "Note not found"}`

---

### `PUT /notes/{id}`
Partially update a note. Omitted fields are unchanged.

**Request body** (all fields optional)
```json
{ "title": "string", "content": "string" }
```

**Response 200** — updated note
**Response 404** `{"detail": "Note not found"}`

---

### `DELETE /notes/{id}`
Delete a note.

**Response 204** — no content
**Response 404** `{"detail": "Note not found"}`

---

### `POST /notes/{id}/extract`
Extract action items from a note's content (lines ending `!` or starting `todo:`). Creates and persists them as action items.

**Response 201** — array of created action items
**Response 404** `{"detail": "Note not found"}`

---

## Action Items

### `GET /action-items/`
List all action items.

**Response 200**
```json
[{ "id": 1, "description": "string", "completed": false }]
```

---

### `POST /action-items/`
Create an action item.

**Request body**
```json
{ "description": "string (min 1)" }
```

**Response 201** — created action item
**Response 422** — validation error (empty description)

---

### `PUT /action-items/{id}/complete`
Mark an action item as completed. Idempotent.

**Response 200** — updated action item with `completed: true`
**Response 404** `{"detail": "Action item not found"}`
