Advance exactly one task, validate it, report on it, and notify the user. No hand-holding. No unnecessary questions. Just execute.

---

## Step 1 — Read the task list

Read `docs/TASKS.md` in full. Identify every task section and which subtasks are unchecked (`[ ]`) vs completed (`[x]`).

## Step 2 — Select one subtask to work on

Apply these rules in order:
1. Start from the earliest task (lowest number) that has at least one `[ ]` subtask.
2. If a task is blocked, skip it and continue scanning downward until you find the next unfinished, independently actionable subtask.
3. Within the chosen task, pick the **first unchecked subtask** only.
4. If that single subtask is still too large to complete confidently in one run, scope it down to the smallest meaningful unit of progress and note what you're doing in the report.

Commit to one subtask. Do not attempt multiple tasks in one run unless a tiny follow-up (e.g., marking a checkbox, running a single lint fix) is required to fully validate what was just done.

## Step 3 — Identify relevant files

Before writing any code, briefly list the files you expect to touch and why. One sentence per file is enough. This is a thinking step — don't ask the user to confirm it.

## Step 4 — Implement

Make the change. Follow these constraints:
- Modify existing files instead of creating new ones wherever possible.
- Do not add error handling, abstractions, or features beyond what the subtask explicitly requires.
- Do not reformat, renumber, or restructure `docs/TASKS.md` — Only mark a checkbox as completed (`[x]`) if the subtask was fully completed and validated in this run. If only partial progress was made, do not change the checkbox.

## Step 5 — Validate

After implementation, run:

```bash
uv run make test
```

If any tests fail, fix them before proceeding.
If Python, frontend, or config files were modified in ways that may affect formatting or lint checks, also run:

```bash
uv run make lint
```

Capture the output. You will need it for the report.
Even if validation fails and cannot be fully resolved within this run, you must still write the report with the exact failure details and current status.

## Step 6 — Write the report

### 6a — Get the timestamp

Run this to get the current timestamp for the archive filename:

```bash
date '+%Y-%m-%dT%H:%M'
```

### 6b — Scan existing archived reports for the history list

Run this to list all timestamped archives, newest-first:

```bash
ls -t reports/20*.html 2>/dev/null
```

### 6c — Write the report HTML

Write the **same HTML content** to **two files**:
1. `reports/latest.html` — always overwritten; the entry point.
2. `reports/<TIMESTAMP>.html` — permanent archive, never overwritten.

Use the timestamp from Step 6a for the archive filename (e.g. `reports/2026-04-09T21:22.html`).

**Style: Cyberpunk terminal aesthetic. Tone: Elon Musk — direct, confident, punchy. No filler.**

Visual requirements:
- Dark background (`#07080d`), neon cyan/green/magenta accents, monospace font throughout.
- Glowing neon border on the container (`box-shadow` with cyan).
- Scanline overlay effect using a CSS `repeating-linear-gradient`.
- Status badge: neon green `#00ff9f` text on dark for PASS; neon red `#ff003c` for FAIL.
- Each section separated by a dim horizontal rule.
- `max-width: 820px`, centered, `padding: 40px`.
- Use `<ul>` and `<code>` blocks where appropriate; code blocks styled as dark terminal panes.
- A **Mission Log** section at the bottom listing links to all archived reports (newest first), pulled from the `ls` output in Step 6b. Each link opens the archive file. Show the timestamp as the link text.

Required content sections (inside the HTML):

```
1. MISSION BRIEFING   — task number, subtask, why it was selected
2. DELTA              — files modified and what each change does
3. SYSTEMS CHECK      — exact command(s) executed
4. TELEMETRY          — pass/fail counts, errors; be specific and ruthless
5. NEXT TARGET        — the single most logical next move
6. MISSION LOG        — linked history of all archived reports, newest first
```

Header area must include:
- A bold title: `AUTOPILOT // WEEK 4`
- The timestamp of this run
- The status badge

## Step 7 — Notify the user

After the report files are written, run this exact command:

```bash
osascript -e 'display notification "Telemetry uploaded. Opening latest report..." with title "AUTOPILOT // WEEK 4"' && open "$(pwd)/reports/latest.html"
```

---

One task. One report. Archived. Notified. Move fast.
