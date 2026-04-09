You are running the Week 4 automation workflow. Your job is to advance exactly one task, validate it, report on it, and notify the user. No hand-holding. No unnecessary questions. Just execute.

---

## Step 1 — Read the task list

Read `docs/TASKS.md` in full. Identify every task section and which subtasks are unchecked (`[ ]`) vs completed (`[x]`).

## Step 2 — Select one subtask to work on

Apply these rules in order:
1. Start from the earliest task (lowest number) that has at least one `[ ]` subtask.
2. Skip any task that is clearly blocked by an unfinished external dependency — note why in the report.
3. Within the chosen task, pick the **first unchecked subtask** only.
4. If that single subtask is still too large to complete confidently in one run, scope it down to the smallest meaningful unit of progress and note what you're doing in the report.

Commit to one subtask. Do not attempt multiple tasks in one run unless a tiny follow-up (e.g., marking a checkbox, running a single lint fix) is required to fully validate what was just done.

## Step 3 — Identify relevant files

Before writing any code, briefly list the files you expect to touch and why. One sentence per file is enough. This is a thinking step — don't ask the user to confirm it.

## Step 4 — Implement

Make the change. Follow these constraints:
- Modify existing files instead of creating new ones wherever possible.
- Do not add error handling, abstractions, or features beyond what the subtask explicitly requires.
- Do not reformat, renumber, or restructure `docs/TASKS.md` — only update the specific checkbox(es) you completed: change `[ ]` to `[x]`.

## Step 5 — Validate

After implementation, run:

```bash
uv run make test
```

If any tests fail, fix them before proceeding. If you touched formatting-sensitive code, also run:

```bash
uv run make lint
```

Capture the output. You will need it for the report.

## Step 6 — Write the report

Write `reports/latest.html`. Overwrite it every run. No external CSS or JS — inline styles only.

The report should read like it was filed by someone who gets things done and has no patience for vague status updates. Crisp. Direct. Structured. A little personality is good; filler is not.

Required sections:

```
1. Task Selected        — task number, subtask text, why it was chosen
2. What Changed         — files modified, a sentence on what each change does
3. Validation Run       — exact command(s) executed
4. Result / Status      — pass/fail counts, any errors; be specific
5. Recommended Next     — the single most logical next step for the next run
```

Visual requirements:
- White background, clean sans-serif font, `max-width: 760px`, centered.
- Each section has a bold heading and a thin `1px` bottom border.
- A status badge near the top: green background + white text for pass, red for fail.
- No walls of unbroken text. Use `<ul>` or `<code>` blocks where appropriate.

## Step 7 — Notify the user

After the report file is written, run this exact command:

```bash
osascript -e 'display notification "Your latest report is ready — open reports/latest.html" with title "Claude Code · Week 4"'
```

---

That's the full run. One task advanced. Report written. User notified. Done.
