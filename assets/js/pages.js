/* Reference pages: glossary, Hermes cheat sheet, instructor guide, deck-to-lesson map. */
(function () {
  const A = window.ACADEMY, H = A.H, esc = A.esc;

  A.glossary = [
    ['Agent', 'Software where an LLM decides which tools to call, in a loop, to reach a goal. LLM + tools + loop + memory + guardrails.'],
    ['Agentic RAG', 'RAG where the agent decides when and what to search, using a search tool, and can search again.'],
    ['AGENTS.md', 'Project instruction file read by many agents (Hermes, Codex, Copilot and others) at session start.'],
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
    ['Policy tiers (T0–T3)', 'Our guardrail policy: T0 read/diagnose, T1 low-risk runbook actions, T2 changes needing human approval, T3 forbidden for agents.'],
    ['JEA', 'Just Enough Administration: a PowerShell endpoint that exposes only selected cmdlets and parameters to an account.'],
    ['TACACS+ command authorization', 'AAA feature that permits or denies each CLI command per user on network devices; our read-only agent account may run show commands only.'],
    ['Jump host', 'A hardened server in the management network through which agents (via the ssh backend) reach devices and servers.'],
    ['Change package', 'What an agent hands to CAB: config, rollback, pre/post checks, risk and impact. Humans approve; the pipeline applies.'],
    ['VRAM', 'GPU memory. Model weights + KV cache must fit here (or in unified memory) to run fast.'],
  ];

  A.pages.glossary = {
    title: 'Glossary', eyebrow: 'Reference', lead: `${A.glossary.length} terms used in the course. Type to filter.`,
    render: () => `<input class="searchbox" id="gq" type="search" placeholder="Filter terms…" oninput="(function(v){document.querySelectorAll('.gitem').forEach(function(e){e.hidden=v&&e.textContent.toLowerCase().indexOf(v)<0})})(this.value.toLowerCase())">
      <div class="gloss">${A.glossary.slice().sort((a, b) => a[0].localeCompare(b[0])).map((g) => `<div class="gitem"><b>${esc(g[0])}</b><p>${g[1]}</p></div>`).join('')}</div>`,
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
      H.code('hermes gateway setup | start | status\nhermes pairing          # approve DM pairing codes\nhermes send …           # one-shot message to a platform', 'bash', 'gateway') +
      H.code('hermes profile create <name> --description "…"\n<name> setup | chat | gateway start\nhermes profile list\nhermes kanban boards create <slug> --name "…" --switch\nhermes kanban create "…" --assignee <profile>\nhermes kanban list | show <id> | tail <id>', 'bash', 'teams') +
      H.code('/help /tools /model /new /retry /undo /compress\n/usage /skills /<skill> /plan /learn /cron\n/approve /deny /stop /sethome /status   # in chat platforms', 'text', 'slash commands') +
      H.code('~/.hermes/config.yaml    settings\n~/.hermes/.env           secrets\n~/.hermes/SOUL.md        persona\n~/.hermes/memories/      MEMORY.md, USER.md\n~/.hermes/skills/        skills\n~/.hermes/profiles/      other agents\n~/.hermes/logs/          logs', 'text', 'files')
    ),
  };

  A.pages.instructor = {
    title: 'Instructor guide', eyebrow: 'For whoever runs the course',
    lead: 'How to run this course for the IT infrastructure team: schedule, lab setup, and how to update the content.',
    render: () =>
      H.note('key', 'Teach it in two parts. <b>Part 1 · Fundamentals</b> (Modules 0–8) gives everyone the same mental model: what LLMs are, why they hallucinate, what an agent and a harness are. <b>Part 2 · Hands-on</b> (Modules 9–13) builds real agents for each team\'s daily work inside our guardrail policy. Do not skip Part 1: engineers who skip it over-trust agents.', 'Course design') +
      H.table(['Session', 'Part', 'Modules', 'Format', 'Time'], [
        ['1', '1', '0 Welcome · 1 Foundations', 'Talk + discussion', '2 h'],
        ['2', '1', '2 How LLMs think · 3 Training', 'Talk + exercises', '2.5 h'],
        ['3', '1', '4 Knowledge/RAG · 5 Models & hardware', 'Talk + Ollama demo', '3 h'],
        ['4', '1', '6 Prompting · 7 Agents · 8 Coding agents', 'Talk + exercises', '3 h'],
        ['5', '2', '9 Hermes labs 1–5 (install → skills)', 'Hands-on', '3 h'],
        ['6', '2', '9 Hermes labs 6–10 (memory → hardening)', 'Hands-on', '3 h'],
        ['7', '2', '10 Teams · 11 Security', 'Exercises + red team', '2.5 h'],
        ['8', '2', '12 Role playbooks: guardrail policy + your team\'s scenarios', 'Hands-on by role group', '3 h'],
        ['9', '2', '12 Workshop + 13 Capstone build', 'Team project', '3 h'],
        ['10', '2', '13 Demos, roadmap, closing', 'Demos + discussion', '2 h'],
      ]) +
      H.split(
        H.prose('<h3>Before the course</h3>', H.list([
          'One lab VM per pair (Ubuntu 24.04, 4 vCPU, 8 GB RAM, Docker) on an isolated lab VLAN.',
          'For Module 12: a lab jump host per role group, two virtual switches (containerlab, EVE-NG or CML), a lab AD with a JEA endpoint, a lab web server, and a read-only TACACS+ account. Agree the T0–T3 policy tiers with the CISO and change manager beforehand.',
          'Model access: a shared OpenRouter or company API key in the vault with a spending limit, and/or a GPU host running Ollama with 64K context.',
          'A lab Slack/Teams workspace or private channel for gateway labs.',
          'Ask each team for 10 anonymised tickets and one runbook. They become the eval set and the skills.',
        ])),
        H.prose('<h3>Presenting</h3>', H.list([
          'Open a lesson and press <kbd>P</kbd>. Arrow keys move through slides and continue into the next lesson.',
          'Press <kbd>S</kbd> (or “Speaker view”) to open a second window with notes, the next slide and a timer. It follows the main window and its Prev/Next buttons drive it: put it on your laptop screen and the presentation on the projector.',
          'Press <kbd>N</kbd> to show notes under the slide instead.',
          'Every “Try it” panel works offline in the browser: let people drive them.',
          'End each module with its checkpoint quiz; discuss the wrong answers.',
        ]))
      ) +
      H.prose('<h3>Updating the content</h3>', 'Lessons live in <code>assets/js/content/mNN-*.js</code>. Each slide is <code>{ t: title, b: html, n: notes }</code>. Use the helpers in <code>assets/js/core.js</code> (<code>H.cards</code>, <code>H.code</code>, <code>H.table</code>, <code>D.flow</code>, <code>D.hub</code>…) and the widgets in <code>widgets.js</code>. See <code>README.md</code> in the repository for the full guide. Push to the main branch and GitHub Pages republishes the site.'),
  };

  // Original deck slide titles (Ai_Agents.pptx) → lessons that teach them
  const DECK = ['Title: AI Agent Automation', 'Course topics overview', 'References and websites', 'Layers of AI', 'Fundamentals of machine learning', 'Mathematics requirements', 'Fundamentals of neural networks', 'ML frameworks', 'Tokens and embeddings', 'Text/vision embedding models', 'Large language models', 'How they train', 'Text classification', 'Cost of training', 'Training dataset and samples', 'Best practices', 'Domain-specific vs general-purpose model', 'Knowledge: internal vs external', 'Semantic search & RAG', 'LLM types: embeddings vs generative', 'Interface: TTS and STT', 'Multimodal models', 'Popular LLM providers', 'Generative AI: closed vs open-ended', 'Open-source LLMs', 'Coding agents', 'Agent frameworks & tools', 'Local LLM apps', 'ML engineer vs AI engineer', 'Prompt/context engineering', 'Prompting vs RAG vs fine-tuning', 'LLM naming conventions', 'RAG and reranking', 'Fine-tuning techniques', 'Inference optimization', 'Benchmarks and evaluations', 'MCP protocol / servers', 'LLM: chatbot vs reasoning engine', 'ML pipelines', 'Security', 'Memory', 'Philosophy', 'Hardware as backend infra', 'AI agent factory', 'Introduction to AI agents', 'Building generative AI agents', 'Microsoft Agent 365', 'Coding agent intro: Claude Code, Copilot', 'OpenClaw: AI agents collaboration', 'Fundamental components', 'Claude Code', 'Contracts', 'AI agentic projects', 'Figures from AI Engineering (pp. 79, 82)'];
  A.pages.deckmap = {
    title: 'Deck-to-lesson map', eyebrow: 'Reference',
    lead: 'Every slide of the original <i>Ai_Agents.pptx</i> deck (kept in the repository under <code>source/</code>) and the lessons that teach it.',
    render: () => {
      const map = {};
      A.modules.forEach((m) => m.lessons.forEach((l) => (l.deck || []).forEach((d) => (map[d] = map[d] || []).push(l))));
      A.modules.forEach((m) => (m.deck || []).forEach((d) => { if (!map[d]) map[d] = [m.lessons[0]]; }));
      return H.table(['Deck slide', 'Topic', 'Taught in'], DECK.map((t, i) => [
        `<span class="label">${String(i + 1).padStart(2, '0')}</span>`, esc(t),
        (map[i + 1] || []).map((l) => `<a href="#${l.id}">M${String(l.module ? l.module.num : '').padStart(2, '0')} · ${esc(l.title)}</a>`).join('<br>') || '<span class="muted">—</span>',
      ]));
    },
  };
})();
