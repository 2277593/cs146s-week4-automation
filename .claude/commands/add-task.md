Adding a new task to `docs/TASKS.md` for automation workflow. The task will be picked up by the `do-next-task` command in a future run, so every subtask must be small enough for an agent to complete and validate in a single pass.

---

## Step 1 — Read the task list

Read `docs/TASKS.md` in full. Note:
- The total number of existing tasks (to determine the next task number).
- The exact formatting style: heading pattern, checkbox style, subtask phrasing conventions.

## Step 2 — Understand the user's request

The user's task description is: **$ARGUMENTS**

If the description is clear enough to derive 2–5 concrete subtasks, proceed without asking questions.

If the description is genuinely too ambiguous to produce actionable subtasks (e.g., a single word with no context), ask one focused clarifying question: "What specific change or outcome should this task produce?" Then stop and wait.

## Step 3 — Draft the new task

Assign it the next sequential number. Write a concise main task title — imperative phrasing, no filler.

Write 2–5 subtasks. Each subtask must be:
- **Specific** — names the file, endpoint, function, or command involved.
- **Independently actionable** — an agent can complete it in one run without waiting on another subtask from the same task.
- **Testable** — implies a clear way to verify it worked (a test, a lint pass, a visible UI change, a curl response, etc.).

Avoid subtasks like "improve X", "handle edge cases", or "update as needed". Instead: "Add `min_length=1` validator to `NoteCreate.title` in `backend/app/schemas.py`".

Format exactly:
```
## N) Task title
[ ] Subtask one — specific file or command
[ ] Subtask two — specific file or command
[ ] Subtask three — specific file or command
```

Match the spacing and punctuation style of the existing tasks in the file.

## Step 4 — Append to docs/TASKS.md

Append the new task block to the end of `docs/TASKS.md`. Add one blank line between the last existing task and the new one.

Do not touch any existing task content. Do not renumber, reformat, or reorganize anything above the new entry.

## Step 5 — Confirm

Print a short confirmation: the task number, title, and the subtasks that were added. One line each. No extra commentary.
