/* Reference pages: glossary, Hermes cheat sheet, instructor guide, deck-to-lesson map. */
(function () {
  const A = window.ACADEMY, H = A.H, esc = A.esc, tr = A.tr, L = A.L;

  A.glossary = [
    ['Agent', 'Software where an LLM decides which tools to call, in a loop, to reach a goal. LLM + tools + loop + memory + guardrails.'],
    ['Agentic RAG', 'RAG where the agent decides when and what to search, using a search tool, and can search again.'],
    ['AGENTS.md', 'Project instruction file read by many agents (Hermes, Codex, Copilot and others) at session start.'],
    ['Agent SDK (Claude)', 'Python and TypeScript library that gives your own programs the agent loop, tools, permissions and MCP support that power Claude Code.'],
    ['Approval policy (Codex)', 'When Codex asks you before acting: untrusted, on-request or never. Works together with the sandbox mode.'],
    ['CLAUDE.md', 'Project instruction file that Claude Code loads at session start: conventions, how to test, what never to touch.'],
    ['Claude Code', 'Anthropic\'s coding agent. Runs in the terminal, the Claude desktop app, IDEs, the web and CI.'],
    ['Codex', 'OpenAI\'s coding agent. Runs in the terminal, the Codex desktop app, IDEs and Codex Cloud.'],
    ['Computer use', 'An agent controlling a real desktop through screenshots, mouse and keyboard. For GUI-only tools; the slowest and riskiest way to act.'],
    ['Headless mode', 'Running a coding agent non-interactively from a script or pipeline: claude -p or codex exec.'],
    ['Hook', 'Your own script that the harness runs at a fixed point, for example before a tool call. It can block the action, so it enforces rules deterministically.'],
    ['Permission mode', 'Claude Code setting for how much runs without asking: Manual, acceptEdits, plan, auto, dontAsk, bypassPermissions.'],
    ['Plan mode', 'A mode in which the agent may read and investigate but must present a plan for approval before it edits anything.'],
    ['Sandbox mode (Codex)', 'Operating-system limit on what Codex commands can touch: read-only, workspace-write or danger-full-access.'],
    ['Worktree', 'A separate git working copy of the same repository, so parallel agents do not overwrite each other\'s files.'],
    ['Approval (human-in-the-loop)', 'The harness pauses a risky action until a person approves or denies it.'],
    ['Attention', 'The transformer mechanism that lets each token weigh and mix in information from other tokens.'],
    ['Base / foundation model', 'A model after pre-training only. Good at continuing text, not at following instructions.'],
    ['Context engineering', 'Deciding what the harness puts into the model\'s context window on each step, and what stays out.'],
    ['Context window', 'Maximum number of tokens a model can see at once (prompt + history + answer). Hermes needs at least 64K.'],
    ['Chain-of-thought (CoT)', 'The model writes or internally produces intermediate reasoning steps before the answer.'],
    ['Cron (Hermes)', 'Hermes\' scheduler for unattended agent runs, e.g. “every day at 06:00”.'],
    ['delegate_task', 'Hermes tool that spawns subagents with a fresh context for a subtask; only their summary returns.'],
    ['DPO', 'Direct Preference Optimization: preference tuning from chosen/rejected pairs without a separate reward model.'],
    ['Embedding', 'A vector of numbers representing meaning. Similar meanings give nearby vectors.'],
    ['Eval', 'A test set plus scoring method to measure an AI system\'s quality on your own tasks.'],
    ['Fine-tuning', 'Further training a pre-trained model on specific data to change its behaviour or format.'],
    ['Function / tool calling', 'The model outputs a structured request to call a named tool with JSON arguments; the harness runs it.'],
    ['Gateway (Hermes)', 'The process that connects Hermes to Slack, Teams, Telegram, Discord, email and other chat platforms.'],
    ['GGUF', 'Single-file model format for llama.cpp, Ollama and LM Studio.'],
    ['Hallucination', 'Fluent, confident output that is false. A consequence of generating plausible text.'],
    ['Harness', 'Everything around the model that makes it an agent: loop, tools, context, memory, guardrails, interfaces.'],
    ['Indirect prompt injection', 'Malicious instructions hidden in content the agent reads (email, web page, log, document).'],
    ['KV cache', 'Stored attention keys/values for processed tokens. Speeds up generation; grows with context and uses memory.'],
    ['LLM-as-a-judge', 'Using a strong model with a rubric to grade another model\'s outputs.'],
    ['LoRA / QLoRA', 'Fine-tuning small adapter matrices instead of all weights; QLoRA does it on a 4-bit quantized base.'],
    ['MCP', 'Model Context Protocol: an open standard for agents (clients) to discover and call tools on servers.'],
    ['MEMORY.md / USER.md', 'Hermes\' small, always-loaded memory files: agent notes and user profile.'],
    ['Mixture of experts (MoE)', 'A model with many expert sub-networks, using only a few per token. “30B-A3B” = 30B total, 3B active.'],
    ['Multimodal projector', 'Adapter that maps a vision encoder\'s output into an LLM\'s embedding space, making a VLM.'],
    ['Ollama', 'Tool to download and serve open models locally with an OpenAI-compatible API on port 11434.'],
    ['Positional embedding', 'Signal added to token embeddings so the transformer knows token order.'],
    ['Profile (Hermes)', 'A separate Hermes home with its own config, keys, memory, skills and sessions. One per agent.'],
    ['Quantization', 'Storing weights with fewer bits (8, 5, 4) to save memory and speed up inference, with some quality loss.'],
    ['RAG', 'Retrieval-augmented generation: retrieve relevant documents and put them in the prompt before generating.'],
    ['ReAct', 'Reason + Act: the think → act → observe loop most agents use.'],
    ['Reranker', 'A cross-encoder that re-scores retrieved chunks against the question for better ordering.'],
    ['RLHF / RLAIF', 'Reinforcement learning from human (or AI) feedback: aligns a model with preferences via a reward signal.'],
    ['SFT', 'Supervised fine-tuning on (prompt, ideal response) demonstrations: instruction tuning.'],
    ['Skill (SKILL.md)', 'A folder with a SKILL.md procedure an agent loads on demand. Open standard (agentskills.io).'],
    ['SOUL.md', 'Hermes\' global persona and principles file for an instance or profile.'],
    ['Subagent', 'A child agent started for a subtask with a fresh conversation; it knows only what its brief says.'],
    ['Temperature', 'Sampling setting: 0 = most likely token every time; higher = more varied output.'],
    ['Terminal backend', 'Where Hermes runs commands: local, docker, ssh, modal, daytona, singularity, vercel_sandbox.'],
    ['Token', 'The unit models read and write: a word, part of a word, or a symbol. Also the billing unit.'],
    ['Toolset', 'A named group of tools enabled or disabled together per platform in Hermes.'],
    ['Transformer', 'The neural network architecture behind modern LLMs, built from attention and feed-forward blocks.'],
    ['Vector database', 'A database that stores embeddings and finds the nearest ones quickly (pgvector, Qdrant, Milvus…).'],
    ['VLM', 'Vision-language model: an LLM that also accepts images.'],
    ['Prompt caching', 'The provider remembers the front of a prompt it has already processed, so later calls that start with the same text are cheaper and faster.'],
    ['Cache read / cache write', 'A cache read is a discounted charge for prompt text found in the cache. A cache write is the charge, sometimes a premium, for storing new text in it.'],
    ['Cache lifetime (TTL)', 'How long a cached prefix is kept without use. After it expires the next call pays the write price again.'],
    ['Gateway (LLM)', 'A service that gives one key and one OpenAI-style API for many models and providers, for example OpenRouter or AvalAI.'],
    ['OpenRouter', 'An LLM gateway: one account and key, model names like vendor/model, and a usage block with cost on every response.'],
    ['AvalAI', 'An LLM gateway used from Iran with an OpenAI-style API. Check its own documentation for the current base URL, models and prices.'],
    ['Base URL', 'The address a client sends API calls to. With an OpenAI-compatible gateway you change only the base URL, the key and the model name.'],
    ['finish_reason', 'The field that says why a reply ended: stop (finished), length (hit max tokens, so it is cut off) or tool_calls (wants a tool run).'],
    ['max_tokens', 'A cap on how long the answer may be. Always set one: it is your cost ceiling.'],
    ['top_p / top_k', 'Sampling limits that restrict the next-token choice to the most likely tokens. Change temperature or top_p, not both.'],
    ['Stateless', 'The model remembers nothing between calls. The app resends the history every time, which is why cost grows with length.'],
    ['Reasoning tokens', 'Hidden thinking tokens of a reasoning model. You do not see them but they are billed as output.'],
    ['Task brief', 'A written instruction for a coding agent: goal, context, constraints, checks, out-of-scope and what to report.'],
    ['Claude Desktop', 'Anthropic\'s desktop app: chat, the Code tab, computer use, browsers, connectors and scheduled tasks.'],
    ['Open WebUI', 'A self-hosted chat platform that works with Ollama and OpenAI-compatible APIs and adds document chat, tools and custom assistants.'],
    ['LangChain', 'A framework of building blocks for LLM applications and agents, with one interface for many model providers.'],
    ['LangGraph', 'A low-level framework for stateful, long-running agents written as graphs, with human-in-the-loop pauses and durable execution.'],
    ['LlamaIndex', 'An open-source framework for agentic applications over your own documents (loading, indexing, querying).'],
    ['Honcho', 'Open-source memory service that stores conversations, reasons over them and builds a model of each user or agent that you can query.'],
    ['Multica', 'A source-available board where AI coding agents take issues like teammates, running through agent CLIs on machines you control.'],
    ['Policy tiers (T0–T3)', 'Our guardrail policy: T0 read/diagnose, T1 low-risk runbook actions, T2 changes needing human approval, T3 forbidden for agents.'],
    ['JEA', 'Just Enough Administration: a PowerShell endpoint that exposes only selected cmdlets and parameters to an account.'],
    ['TACACS+ command authorization', 'AAA feature that permits or denies each CLI command per user on network devices; our read-only agent account may run show commands only.'],
    ['Jump host', 'A hardened server in the management network through which agents (via the ssh backend) reach devices and servers.'],
    ['Change package', 'What an agent hands to CAB: config, rollback, pre/post checks, risk and impact. Humans approve; the pipeline applies.'],
    ['VRAM', 'GPU memory. Model weights + KV cache must fit here (or in unified memory) to run fast.'],
  ];

  A.pages.glossary = {
    title: 'Glossary', eyebrow: 'Reference', get lead() { return L('{0} terms used in the course. Type to filter.', '{0} اصطلاح به‌کاررفته در دوره. برای فیلتر کردن تایپ کنید.', A.glossary.length); },
    render: () => `<input class="searchbox" id="gq" type="search" placeholder="${L('Filter terms…', 'فیلتر اصطلاحات…')}" oninput="(function(v){document.querySelectorAll('.gitem').forEach(function(e){e.hidden=v&&e.textContent.toLowerCase().indexOf(v)<0})})(this.value.toLowerCase())">
      <div class="gloss">${A.glossary.slice().sort((a, b) => a[0].localeCompare(b[0])).map((g) => { const t = tr(g[0]); return `<div class="gitem"><b>${esc(t)}${t !== g[0] ? `<br><small class="muted" dir="ltr">${esc(g[0])}</small>` : ''}</b><p>${tr(g[1])}</p></div>`; }).join('')}</div>`,
  };

  A.pages.cheatsheet = {
    title: 'Hermes Agent cheat sheet', eyebrow: 'Reference', lead: 'The commands used in the labs, on one page. Checked against the official docs (hermes-agent.nousresearch.com/docs) in October 2026. Run <code>hermes &lt;command&gt; --help</code> for the flags in your version.',
    render: () => H.split(
      H.code('# install (Linux / macOS / WSL2)\ncurl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash\nsource ~/.bashrc\n# install (Windows PowerShell)\niex (irm https://hermes-agent.nousresearch.com/install.ps1)\n\nhermes setup            # wizard: Quick / Full / Blank Slate\nhermes model            # provider + model\nhermes tools            # toolsets per platform\nhermes doctor           # diagnose\nhermes update           # update\nhermes backup           # zip ~/.hermes', 'bash', 'install and set up') +
      H.code('hermes                  # chat (classic CLI)\nhermes --tui            # chat (modern TUI)\nhermes -c               # continue last session\nhermes chat -q "…"      # one-shot\nhermes sessions list\nhermes insights         # usage and cost', 'bash', 'chat and sessions') +
      H.code('hermes config show | edit | path\nhermes config get model.default\nhermes config set terminal.backend docker\nhermes config set OPENROUTER_API_KEY sk-or-...   # goes to .env', 'bash', 'configuration') +
      H.code('hermes skills browse | search <q> | inspect <slug>\nhermes skills install <slug>\nhermes skills list | check | update | audit\nhermes skills uninstall <name>\nhermes skills tap add <org/repo>', 'bash', 'skills'),
      H.code('hermes mcp              # picker\nhermes mcp catalog\nhermes mcp install <name>\n/reload-mcp             # in a session', 'bash', 'MCP') +
      H.code('hermes cron create "every day at 06:00" "…" --skill <name> --name "…"\nhermes cron list | run <id> | pause <id> | resume <id> | remove <id>\nhermes cron doctor\nhermes pause / hermes resume     # global emergency stop', 'bash', 'cron') +
      H.code('hermes memory setup | status        # external memory provider\n/memory pending | approve <id> | reject <id> | approval on\n/skills pending | diff <id> | approve <id> | reject <id>\nhermes cron edit <id> --pin | --unpin | --reasoning-effort low\nhermes cron edit <id> --add-skill <name>\nhermes backup           # export your whole setup', 'bash', 'memory, approvals, cost') +
      H.code('hermes gateway setup | start | status\nhermes pairing          # approve DM pairing codes\nhermes send …           # one-shot message to a platform', 'bash', 'gateway') +
      H.code('hermes profile create <name> --description "…"\n<name> setup | chat | gateway start\nhermes profile list\nhermes kanban boards create <slug> --name "…" --switch\nhermes kanban create "…" --assignee <profile>\nhermes kanban list | show <id> | tail <id>', 'bash', 'teams') +
      H.code('/help /tools /model /new /retry /undo /compress\n/usage /skills /<skill> /plan /learn /cron\n/approve /deny /stop /sethome /status   # in chat platforms', 'text', 'slash commands') +
      H.code('~/.hermes/config.yaml    settings\n~/.hermes/.env           secrets\n~/.hermes/SOUL.md        persona\n~/.hermes/memories/      MEMORY.md, USER.md\n~/.hermes/skills/        skills\n~/.hermes/profiles/      other agents\n~/.hermes/logs/          logs', 'text', 'files')
    ),
  };

  A.pages.codingsheet = {
    title: 'Claude Code and Codex cheat sheet', eyebrow: 'Reference', lead: 'The coding-agent commands from Module 8 on one page. Checked against the official Claude Code docs and the Codex source in October 2026. Run <code>claude --help</code> or <code>codex --help</code> for your version.',
    render: () => H.split(
      H.code('# install\ncurl -fsSL https://claude.ai/install.sh | bash      # macOS, Linux, WSL\nirm https://claude.ai/install.ps1 | iex             # Windows\n\nclaude                     # interactive session\nclaude "explain this repo" # start with a prompt\nclaude -c                  # continue the last session\nclaude -r                  # pick a session to resume\nclaude --permission-mode plan\nclaude -p "…" --allowedTools "Read" --output-format json\nclaude mcp add <name> -- <command>\nclaude mcp add --transport http <name> <url>', 'bash', 'Claude Code: CLI') +
      H.code('/init /memory /permissions /model /mcp /agents\n/compact /clear /resume /sandbox /schedule /loop\n/install-github-app /help\n\nShift+Tab   cycle permission modes\nEsc         stop    ·  Esc Esc  rewind\n@file       attach  ·  !cmd     run a shell command', 'text', 'Claude Code: in a session') +
      H.code('CLAUDE.md, ~/.claude/CLAUDE.md          instructions\n.claude/settings.json                   team rules, hooks\n.claude/settings.local.json             personal overrides\n.claude/skills/<name>/SKILL.md          skills\n.claude/agents/<name>.md                subagents\n.mcp.json                               team MCP servers', 'text', 'Claude Code: files'),
      H.code('# install\ncurl -fsSL https://chatgpt.com/codex/install.sh | sh  # macOS, Linux\nnpm install -g @openai/codex\n\ncodex                      # interactive session\ncodex app                  # desktop app\ncodex -s read-only -a on-request\ncodex exec "…"             # non-interactive\ncodex exec --json "…"      # JSONL events\ncodex exec --output-schema s.json -o out.json "…"\ncodex review --base main\ncodex resume --last\ncodex mcp add <name> -- <command>\ncodex doctor', 'bash', 'Codex: CLI') +
      H.code('/init /permissions /plan /model /diff /review\n/skills /mcp /agents /compact /status /resume\n\n@file        mention a file\n$skill-name  use a skill', 'text', 'Codex: in a session') +
      H.code('~/.codex/config.toml                    settings, profiles, MCP\nAGENTS.md, ~/.codex/AGENTS.md           instructions\n.agents/skills/<name>/SKILL.md          skills\n\nsandbox:  read-only | workspace-write | danger-full-access\napproval: untrusted | on-request | never', 'text', 'Codex: files and modes')
    ),
  };

  A.pages.instructor = {
    title: 'Instructor guide', eyebrow: 'For whoever runs the course',
    lead: 'How to run this course for the IT infrastructure team: schedule, lab setup, and how to update the content.',
    render: () =>
      H.note('key', 'The course is 29 two-hour sessions in seven phases. Phase A gives everyone the same vocabulary and shows how to use and pay for models. Phase B explains how the machine works; its deeper sessions are optional. Phases D and E, coding agents and Hermes Agent, get most of the time. Phases F and G cover teams, security and your own playbooks. Do not skip session 24 on security. The <a href="#sessions">session plan</a> lists every lesson, and you can drop the optional sessions when time is short.', 'Course design') +
      H.table(['Phase', 'Sessions', 'Format', 'What to prepare'], [
        ['A · Big picture and using LLMs', '1–3', 'Talk, figures, a short lab', 'A gateway account (OpenRouter or AvalAI) with a small spending limit; one key per pair'],
        ['B · Understanding the machine', '4–8', 'Talk + exercises (4 and 6 optional)', 'An Ollama host for the local-models lab'],
        ['C · AI agents', '9–10', 'Talk + simulators', 'Nothing special'],
        ['D · Coding agents', '11–15', 'Hands-on labs, a project lab', 'Claude Code and Codex accounts; Python 3 and git; the practice repository from session 11; a lab VM or spare router for session 13'],
        ['E · Hermes Agent', '16–21', 'Hands-on labs, a project lab', 'One lab VM per pair with Docker; a lab chat workspace for the gateway'],
        ['F · Beyond one agent', '22–25', 'Talk + exercises + red team', 'Session 22 is a talk only; the guardrail policy agreed with your security team'],
        ['G · Playbooks, workshop, capstone', '26–29', 'Team project', 'Anonymised tickets and one runbook from each team'],
      ]) +
      H.split(
        H.prose('<h3>Before the course</h3>', H.list([
          'One lab VM per pair (Ubuntu 24.04, 4 vCPU, 8 GB RAM, Docker) on an isolated lab VLAN.',
          'For Module 12: a lab jump host per role group, two virtual switches (containerlab, EVE-NG or CML), a lab AD with a JEA endpoint, a lab web server, and a read-only TACACS+ account. Agree the T0–T3 policy tiers with the CISO and change manager beforehand.',
          'Model access: a shared OpenRouter, AvalAI or company API key in the vault with a spending limit, and/or a GPU host running Ollama with 64K context. Before session 3, open the gateway\'s own documentation and check the base URL, model names and prices shown in the slides.',
          'A lab Slack/Teams workspace or private channel for gateway labs.',
          'Ask each team for 10 anonymised tickets and one runbook. They become the eval set and the skills.',
        ])),
        H.prose('<h3>Presenting</h3>', H.list([
          'Open a lesson and press <kbd>P</kbd>. Arrow keys move through slides and continue into the next lesson.',
          'Press <kbd>S</kbd> (or “Speaker view”) to open a second window with notes, the next slide and a timer. It follows the main window and its Prev/Next buttons drive it: put it on your laptop screen and the presentation on the projector.',
          'Press <kbd>N</kbd> to show notes under the slide instead.',
          'Every “Try it” panel works offline in the browser: let people drive them.',
          'The last lesson of each session ends on the session page; module quizzes appear in the session where a module ends. Discuss the wrong answers.',
        ]))
      ) +
      H.prose('<h3>Updating the content</h3>', 'Lessons live in <code>assets/js/content/mNN-*.js</code> and the teaching order lives in <code>assets/js/sessions.js</code>: every lesson id must appear in exactly one session. Each slide is <code>{ t: title, b: html, n: notes }</code>. Use the helpers in <code>assets/js/core.js</code> (<code>H.cards</code>, <code>H.code</code>, <code>H.table</code>, <code>D.flow</code>, <code>D.hub</code>…) and the widgets in <code>widgets.js</code>. Every new text must exist in both languages: add the Persian translation in <code>assets/i18n/fa/</code> and run <code>node tools/i18n.js check</code>. See <code>README.md</code> in the repository for the full guide. Push to the main branch and GitHub Pages republishes the site.'),
  };

  // Original deck slide titles (Ai_Agents.pptx) → lessons that teach them
  const DECK = ['Title: AI Agent Automation', 'Course topics overview', 'References and websites', 'Layers of AI', 'Fundamentals of machine learning', 'Mathematics requirements', 'Fundamentals of neural networks', 'ML frameworks', 'Tokens and embeddings', 'Text/vision embedding models', 'Large language models', 'How they train', 'Text classification', 'Cost of training', 'Training dataset and samples', 'Best practices', 'Domain-specific vs general-purpose model', 'Knowledge: internal vs external', 'Semantic search & RAG', 'LLM types: embeddings vs generative', 'Interface: TTS and STT', 'Multimodal models', 'Popular LLM providers', 'Generative AI: closed vs open-ended', 'Open-source LLMs', 'Coding agents', 'Agent frameworks & tools', 'Local LLM apps', 'ML engineer vs AI engineer', 'Prompt/context engineering', 'Prompting vs RAG vs fine-tuning', 'LLM naming conventions', 'RAG and reranking', 'Fine-tuning techniques', 'Inference optimization', 'Benchmarks and evaluations', 'MCP protocol / servers', 'LLM: chatbot vs reasoning engine', 'ML pipelines', 'Security', 'Memory', 'Philosophy', 'Hardware as backend infra', 'AI agent factory', 'Introduction to AI agents', 'Building generative AI agents', 'Microsoft Agent 365', 'Coding agent intro: Claude Code, Copilot', 'AI agents collaboration (Hermes)', 'Fundamental components', 'Claude Code', 'Contracts', 'AI agentic projects', 'Figures from AI Engineering (pp. 79, 82)'];
  A.pages.deckmap = {
    title: 'Deck-to-lesson map', eyebrow: 'Reference',
    lead: 'Every slide of the original <i>Ai_Agents.pptx</i> deck (kept in the repository under <code>source/</code>) and the lessons that teach it.',
    render: () => {
      const map = {};
      A.modules.forEach((m) => m.lessons.forEach((l) => (l.deck || []).forEach((d) => (map[d] = map[d] || []).push([m, l]))));
      A.modules.forEach((m) => (m.deck || []).forEach((d) => { if (!map[d]) map[d] = [[m, m.lessons[0]]]; }));
      return H.table(['Deck slide', 'Topic', 'Taught in'], DECK.map((t, i) => [
        A.out(`<span class="label">${String(i + 1).padStart(2, '0')}</span>`), A.out(esc(tr(t))),
        A.out((map[i + 1] || []).map(([m, l]) => `<a href="#${l.id}">M${String(m.num).padStart(2, '0')} · ${esc(tr(l.title))}</a>`).join('<br>') || '<span class="muted">—</span>'),
      ]));
    },
  };
})();
