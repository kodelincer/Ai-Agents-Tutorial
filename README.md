# AI Agents Academy

A presentable, interactive web course that teaches IT infrastructure colleagues
(helpdesk, datacenter and network teams) how large language models and AI agents
work, how to use and pay for models through gateways such as OpenRouter and AvalAI,
how to use the coding agents Claude Code and Codex, and how to install, configure and
safely delegate work to [Hermes Agent](https://github.com/NousResearch/hermes-agent).
It closes with a short tour of Open WebUI, LangChain, LangGraph, LlamaIndex, Honcho and Multica.

**Bilingual: English and Persian (فارسی).** The language button in the top bar
switches the whole course, including diagrams and exercises, and Persian is shown
right-to-left. Add `#fa` or `#en` to a link to open it in a given language.

It expands the original deck in [`source/Ai_Agents.pptx`](source/Ai_Agents.pptx)
(54 slides) into **31 two-hour sessions** (29 core, plus an optional phase H) made of 17 modules, 109 lessons and 353 slides,
with diagrams, speaker notes on every slide, a synced speaker view, checkpoint quizzes
and 26 in-browser exercises.

## Audience

Engineers who already know networking, security and basic programming and work
helpdesk, datacenter or network maintenance. No machine-learning background is needed.

## Session plan

The teaching order lives in [`assets/js/sessions.js`](assets/js/sessions.js). Each session is two hours
(about an hour and a half of lessons plus exercises, questions and a break). Sessions marked
*optional* can be dropped when time is short, which leaves a core of 24 (the optional phase H adds two more).

| Phase | Sessions | Content |
|-------|----------|---------|
| **A · Big picture and using LLMs** | 1–3 | 1 AI, ML, LLMs and agents in figures · 2 LLM vocabulary and controls · 3 Pricing, prompt caching and gateways (OpenRouter, AvalAI) |
| **B · Understanding the machine** | 4–8 | 4 ML and neural networks *(optional)* · 5 Inside an LLM · 6 How LLMs are built *(optional)* · 7 Prompt and context engineering · 8 RAG and local models |
| **C · AI agents** | 9–10 | 9 The loop, patterns, tools, MCP · 10 Harness, memory, platforms, governance |
| **D · Coding agents** | 11–15 | 11 Claude Code first steps · 12 Safe daily workflow and task briefs · 13 Codex, Claude Desktop and computer use · 14 Extend and automate · 15 Project lab *(optional)* |
| **E · Hermes Agent** | 16–21 | 16 Install and connect a model · 17 Conversations, tools, operation · 18 Skills, memory, persona · 19 MCP, cron, cost-aware automation · 20 Gateway and hardening · 21 Project lab |
| **F · Beyond one agent** | 22–25 | 22 Tour: Open WebUI, LangChain, LangGraph, LlamaIndex, Honcho, Multica · 23 Agent teams · 24 Security · 25 Guardrail policy and the network playbook |
| **G · Playbooks, workshop, capstone** | 26–29 | 26 Role playbooks *(optional)* · 27 Workshop · 28 Capstone · 29 Roadmap and further learning *(optional)* |
| **H · Going further (optional)** | 30–31 | 30 The agent ecosystem: DeepSeek Harness, OpenCode, Multica, Orca · 31 Providers, AI gateways (OpenRouter, OmniRoute, 9router), free models and connecting your tools |

Every lesson stays in its module and keeps its route (for example `#m8-3`); sessions only decide the
order. `node tools/i18n.js check` fails if a lesson is in no session or in two.

## Modules

| # | Module | Original deck slides |
|---|--------|----------------------|
| 0 | Welcome, course map and the big picture | 1–3 |
| 1 | AI foundations: ML, neural networks, pipelines, roles and Ops | 4–8, 29, 39 |
| 2 | How LLMs think: tokens, embeddings, attention, probability, reasoning | 9–11, 13, 20, 24, 38 |
| 3 | How LLMs are built: pre-training, SFT, RLHF, fine-tuning | 12, 14–17, 34, 54 |
| 4 | Knowledge: RAG, vector databases, memory | 18, 19, 31, 33, 41 |
| 5 | Models, hardware, quantization, local LLMs, multimodal, evals | 21–23, 25, 28, 32, 35, 36, 43 |
| 6 | Prompt and context engineering | 30 |
| 7 | AI agents: loop, tools, MCP, harness, frameworks, governance | 27, 37, 38, 44–47 |
| 8 | Coding agents: Claude Code and Codex, a guided first session, daily workflow, task briefs, choosing agents, Claude Desktop (including a real MikroTik repair story), skills, MCP, subagents, Agent SDK, headless runs, hooks, CI, schedules, computer use, a project lab | 26, 48, 51, 52 |
| 9 | Hermes Agent labs 1–14: install → model → sessions → tools → skills → memory → MCP → cron → gateway → hardening → operations → memory control → cost-aware automation → project | 27, 49, 50 |
| 10 | Multi-agent teams: delegation, profiles, kanban, human-in-the-loop | 50, 53 |
| 11 | Security: prompt injection, defences, unlearning | 40 |
| 12 | Role playbooks: guardrail policy as code + scenarios for network, helpdesk, datacenter, web/dev, security teams | 52, 53 |
| 13 | Projects, capstone, roadmap, philosophy | 42, 52, 53 |
| 14 | Working with LLMs: vocabulary, sampling controls, capabilities, pricing, prompt caching, OpenRouter and AvalAI, first API calls | new |
| 15 | A tour of the wider toolbox: Open WebUI, LangChain, LangGraph, LlamaIndex, Honcho, Multica (introductions, no labs) | new |
| 16 | The agent ecosystem: four layers, DeepSeek Harness, OpenCode, Multica and Orca, OpenRouter provider routing, self-hosted gateways (OmniRoute, 9router), finding free models safely, connecting Claude Code / OpenCode / Codex / Hermes to a gateway | new |

The in-app **Deck-to-lesson map** page lists every original slide and where it is taught.
**Browse by module** shows the same lessons grouped by topic.

## Interactive exercises

Tokenizer and cost estimator · next-token sampler (temperature, top-k) · embedding
map with semantic search · attention explorer · RAG pipeline step-through ·
VRAM/hardware estimator · model-name decoder · prompt builder · context-window
budget · prompting vs RAG vs fine-tuning chooser · autonomy levels · prompt-injection
spotting game · agent-loop simulator with human approval · MCP message walkthrough ·
prompt-cache cost calculator · practice Hermes terminal · SKILL.md builder · Hermes config builder · multi-agent
team designer · policy-tier game for each role (network, helpdesk, datacenter,
web/dev, security) · Claude Code / Codex safety-mode chooser · ecosystem layer sorter ·
parallel-agents cost model · provider-routing simulator · AI-gateway audit checklist ·
free-tier data-risk checker.

All of them run in the browser with no backend and no API keys.

## Presenting

Open the site, pick a lesson, then:

| Key | Action |
|-----|--------|
| `→` / `←` | Next / previous slide (continues into the next lesson) |
| `P` | Presenter mode |
| `N` | Speaker notes |
| `F` | Full screen |
| `/` | Search lessons and glossary |
| `S` | Speaker view: second window with notes, next slide and timer, synced |
| `Esc` | Leave presenter mode |

Progress and quiz scores are stored in each viewer's own browser (localStorage).

## Running it

No build step is needed.

```bash
# any static web server works
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk also works.

### Single-file offline edition

```bash
python3 tools/build_single.py        # → dist/ai-agents-academy.html
```

One self-contained HTML file (about 1 MB, both languages) for a laptop without network access,
email, or a USB stick. Fonts fall back to system fonts when offline.

### Publishing on GitHub Pages

`.github/workflows/pages.yml` publishes the site on every push to `main`
(or when run manually from the Actions tab).

1. Merge your work into `main`.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The site appears at `https://<owner>.github.io/<repo>/`, with the offline
   edition at `…/dist/ai-agents-academy.html`.

## Editing the content

```
index.html                    app shell
assets/css/academy.css        design tokens (light/dark) and components
assets/js/core.js             H.* HTML helpers and D.* SVG diagram generators
assets/js/widgets.js          concept exercises
assets/js/widgets-labs.js     agent and Hermes lab exercises
assets/js/widgets-eco.js      ecosystem and gateway exercises (Module 16)
assets/js/content/mNN-*.js    one file per module
assets/js/sessions.js         the session plan: which lessons are taught in which session
assets/js/notes.js            speaker notes (one place to edit what you say per slide)
assets/js/pages.js            glossary, cheat sheets, instructor guide, deck map
assets/js/app.js              routing, presenter mode, progress, quizzes, search
assets/i18n/fa/*.js           Persian translations of the content, one file per module
tools/i18n.js                 bilingual checker (CI fails if a Persian translation is missing)
tools/build_single.py         single-file bundler
source/Ai_Agents.pptx         the original deck
```

A module file looks like this:

```js
ACADEMY.module({
  id: 'm4', num: 4, title: 'Knowledge: RAG…', summary: '…', deck: [18, 19],
  outcomes: ['…'],
  lessons: [{
    id: 'm4-3', title: 'RAG', mins: 25, deck: [33],
    slides: [
      { t: 'Slide title', b: H.split(H.prose('…'), H.fig(D.flow(['Embed', 'Retrieve', 'Generate']))), n: 'speaker notes' },
      { t: 'Try it', b: H.widget('rag') },
    ],
  }],
  quiz: [{ q: 'Question?', a: ['A', 'B', 'C'], c: 1, why: 'Explanation' }],
});
```

Useful helpers: `H.lead`, `H.prose`, `H.list`, `H.steps`, `H.cards`, `H.table`,
`H.code(text, lang, title)`, `H.note('tip'|'warn'|'crit'|'it'|'key', html)`,
`H.split(left, right)`, `H.fig(svg, caption)`, `H.widget(name, opts)`; diagrams
`D.flow`, `D.stack`, `D.nested`, `D.hub`, `D.cycle`, `D.columns`, `D.seq`, `D.quad`.
Diagrams use theme tokens, so they work in light and dark mode.

To add a module, create `assets/js/content/m17-*.js` and `assets/i18n/fa/m17.js`,
and add `<script>` tags for both in `index.html` between the `BUNDLE` markers.

### Both languages, always

Every visible text must exist in English and Persian.

- **Lesson content, notes, quizzes and pages** are written in English in the module
  files. Their Persian lives in `assets/i18n/fa/<module>.js`, keyed by a hash of the
  English text. After adding or changing English text:

  ```bash
  node tools/i18n.js missing m08     # list strings without Persian (JSON)
  # add the translations to assets/i18n/fa/m08.js
  node tools/i18n.js check           # must report missing: 0
  ```

  Keep HTML tags, `<code>` contents, `\n` line breaks and product names unchanged.
  Use `'='` when the Persian is identical (a product name, a command).
- **Interface and widget strings** are written inline as `L('English', 'فارسی')`.
- `node tools/i18n.js review` writes `docs/i18n-review.md` with both languages side by
  side for proofreading.

The Pages workflow runs `node tools/i18n.js check` and refuses to publish if anything
is missing.

## Sources

Claude Code facts were checked against <https://code.claude.com/docs> and Codex facts
against the [openai/codex](https://github.com/openai/codex) repository in October 2026;
both tools change monthly, so check the official docs before a session.
Hermes Agent commands and configuration were checked against the official
documentation at <https://hermes-agent.nousresearch.com/docs/> and the
[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) repository
in October 2026. Hermes changes quickly: check `hermes <command> --help` and the
docs before a session. Training-pipeline material follows Chip Huyen's
*AI Engineering* (O'Reilly), as referenced in the original deck.
