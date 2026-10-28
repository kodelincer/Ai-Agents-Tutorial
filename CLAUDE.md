# AI Agents Academy

Static, bilingual (English + Persian) course web app. No build step; `index.html` loads
plain scripts in the order listed between the `BUNDLE` markers.

## Rule: everything in both languages

Whenever you add or change any visible text, add the Persian at the same time.

- Lesson content, speaker notes, quizzes and reference pages: write English in
  `assets/js/content/*.js`, `notes.js` or `pages.js`, then add Persian to
  `assets/i18n/fa/<group>.js` (groups: `m00`…`m19`, `sessions`, `pages`).
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

- The teaching order is `assets/js/sessions.js` (40 two-hour sessions). Lessons stay in their
  modules and keep their routes; every lesson id must be in exactly one session
  (`node tools/i18n.js check` enforces it). A new lesson needs a session.
- The course covers Hermes Agent as the agent harness, and Claude Code and Codex as
  coding agents. Do not add OpenClaw.
- Verify product facts (commands, flags, file paths) against official docs or source
  before adding them; these tools change monthly.
- Diagrams use `D.*` generators and theme tokens so they work in light, dark and RTL.
- Routes are bare hash tokens (`#m8-3`, `#glossary`, `#fa`), so the app also works
  inside the claude.ai artifact sandbox.
- Module 17 is the OpenCode tutorial. It teaches OpenCode 2 (what opencode.ai serves by default) and marks OpenCode 1 differences; check
  opencode.ai/docs (V1) and the V2 docs before changing commands, config fields or defaults.
- Module 19 teaches agent skills (progressive disclosure, important skills, building and trusting them). Check the Claude Code
  skills reference and Anthropic's authoring guide before changing field names, limits or paths.
- Open WebUI, LangChain, LangGraph, LlamaIndex, Honcho and Multica are short introductions in
  module 15 (no labs). The depth of the course is in coding agents (module 8) and Hermes (module 9).
- Gateway details (OpenRouter and AvalAI base URLs, model names, prices, cache rules) change often.
  Slides teach the pattern and tell the reader to confirm in the gateway's own documentation.
- Interface pictures: register each in `assets/js/shots.js` (source URL, licence or captured version),
  store it as WebP in `assets/img/shots/`, and draw it with `H.shot(id, caption)`. Use only pictures from a
  project's own repository (check its licence) or captures of the real tool; never mock up an interface.
  Reference images by literal `assets/img/shots/<name>.webp` paths so the single-file build can inline them.
- The course serves every department, not only IT. Sessions with `biz: true` form the business track
  (sessions 35 to 38 are written for non-technical learners). In module 18, prompts and sample material that
  learners paste into their own assistant use `H.prompt` (translated, so Persian readers get Persian prompts);
  commands, code and data files use `H.code` (not translated). Sample data is fictional, and any figure in an
  answer key must be computed and checked, not estimated.
