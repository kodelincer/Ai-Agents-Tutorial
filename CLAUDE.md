# AI Agents Academy

Static, bilingual (English + Persian) course web app. No build step; `index.html` loads
plain scripts in the order listed between the `BUNDLE` markers.

## Rule: everything in both languages

Whenever you add or change any visible text, add the Persian at the same time.

- Lesson content, speaker notes, quizzes and reference pages: write English in
  `assets/js/content/*.js`, `notes.js` or `pages.js`, then add Persian to
  `assets/i18n/fa/<group>.js` (groups: `m00`…`m16`, `sessions`, `pages`).
  `node tools/i18n.js missing <group>` lists what is missing.
- UI and widget strings (`app.js`, `core.js`, `widgets*.js`): write `L('English', 'فارسی')`
  inline; for data arrays use `[en, fa]` pairs read with `T()`.
- Keep HTML tags, `<code>` contents, `\n` and product or command names unchanged in
  translations. Use `'='` when the Persian is identical.
- Persian terms used throughout: ایجنت (agent), هارنس (harness), مهارت (skill),
  سندباکس (sandbox), زیرایجنت (subagent), پرامپت (prompt), پنجره‌ی زمینه (context window),
  تزریق پرامپت (prompt injection), حفاظ (guardrail).

## Before committing

```bash
for f in assets/js/*.js assets/js/content/*.js assets/i18n/fa/*.js; do node --check "$f"; done
node tools/i18n.js check            # must report missing: 0 (CI enforces it)
python3 tools/build_single.py       # dist/ai-agents-academy.html (dist/ is gitignored)
```

## Content conventions

- The teaching order is `assets/js/sessions.js` (31 two-hour sessions). Lessons stay in their
  modules and keep their routes; every lesson id must be in exactly one session
  (`node tools/i18n.js check` enforces it). A new lesson needs a session.
- The course covers Hermes Agent as the agent harness, and Claude Code and Codex as
  coding agents. Do not add OpenClaw.
- Verify product facts (commands, flags, file paths) against official docs or source
  before adding them; these tools change monthly.
- Diagrams use `D.*` generators and theme tokens so they work in light, dark and RTL.
- Routes are bare hash tokens (`#m8-3`, `#glossary`, `#fa`), so the app also works
  inside the claude.ai artifact sandbox.
- Open WebUI, LangChain, LangGraph, LlamaIndex, Honcho and Multica are short introductions in
  module 15 (no labs). The depth of the course is in coding agents (module 8) and Hermes (module 9).
- Gateway details (OpenRouter and AvalAI base URLs, model names, prices, cache rules) change often.
  Slides teach the pattern and tell the reader to confirm in the gateway's own documentation.
