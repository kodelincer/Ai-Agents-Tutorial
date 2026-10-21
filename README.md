# AI Agents Academy

A presentable, interactive web course that teaches IT infrastructure colleagues
(helpdesk, datacenter and network teams) how large language models and AI agents
work, and how to install, configure and safely delegate work to
[Hermes Agent](https://github.com/NousResearch/hermes-agent).

It expands the original deck in [`source/Ai_Agents.pptx`](source/Ai_Agents.pptx)
(54 slides) into 14 modules, 75 lessons and 195 slides in two parts
(Fundamentals, then Hands-on with agents), with diagrams, speaker notes on every
slide, a synced speaker view, checkpoint quizzes and 19 in-browser exercises.

## Audience

Engineers who already know networking, security and basic programming and work
helpdesk, datacenter or network maintenance. No machine-learning background is needed.

## Course map

| # | Module | Original deck slides |
|---|--------|----------------------|
| **Part 1** | **Fundamentals** | |
| 0 | Welcome and course map | 1–3 |
| 1 | AI foundations: ML, neural networks, pipelines, roles and Ops | 4–8, 29, 39 |
| 2 | How LLMs think: tokens, embeddings, attention, probability, reasoning | 9–11, 13, 20, 24, 38 |
| 3 | How LLMs are built: pre-training, SFT, RLHF, fine-tuning | 12, 14–17, 34, 54 |
| 4 | Knowledge: RAG, vector databases, memory | 18, 19, 31, 33, 41 |
| 5 | Models, hardware, quantization, local LLMs, multimodal, evals | 21–23, 25, 28, 32, 35, 36, 43 |
| 6 | Prompt and context engineering | 30 |
| 7 | AI agents: loop, tools, MCP, harness, frameworks, governance | 27, 37, 38, 44–47 |
| 8 | Coding agents: Claude Code, Copilot | 26, 48, 51, 52 |
| **Part 2** | **Hands-on with agents** | |
| 9 | Hermes Agent labs 1–10: install → tools → skills → memory → MCP → cron → gateway → hardening | 27, 49, 50 |
| 10 | Multi-agent teams: delegation, profiles, kanban, human-in-the-loop | 50, 53 |
| 11 | Security: prompt injection, defences, unlearning | 40 |
| 12 | Role playbooks: guardrail policy as code + scenarios for network, helpdesk, datacenter, web/dev and security teams | 52, 53 |
| 13 | Projects, capstone, roadmap, philosophy | 42, 52, 53 |

The in-app **Deck-to-lesson map** page lists every original slide and where it is taught.

## Interactive exercises

Tokenizer and cost estimator · next-token sampler (temperature, top-k) · embedding
map with semantic search · attention explorer · RAG pipeline step-through ·
VRAM/hardware estimator · model-name decoder · prompt builder · context-window
budget · prompting vs RAG vs fine-tuning chooser · autonomy levels · prompt-injection
spotting game · agent-loop simulator with human approval · MCP message walkthrough ·
practice Hermes terminal · SKILL.md builder · Hermes config builder · multi-agent
team designer · policy-tier game for each role (network, helpdesk, datacenter,
web/dev, security).

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

One self-contained HTML file (about 370 KB) for a laptop without network access,
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
assets/js/content/mNN-*.js    one file per module
assets/js/notes.js            speaker notes (one place to edit what you say per slide)
assets/js/pages.js            glossary, cheat sheet, instructor guide, deck map
assets/js/app.js              routing, presenter mode, progress, quizzes, search
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

To add a module, create `assets/js/content/m13-*.js` and add a `<script>` tag for it
in `index.html` between the `BUNDLE` markers.

## Sources

Hermes Agent commands and configuration were checked against the official
documentation at <https://hermes-agent.nousresearch.com/docs/> and the
[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) repository
in October 2026. Hermes changes quickly: check `hermes <command> --help` and the
docs before a session. Training-pipeline material follows Chip Huyen's
*AI Engineering* (O'Reilly), as referenced in the original deck.
