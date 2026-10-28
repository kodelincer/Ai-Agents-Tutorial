/* Reference pages: glossary, Hermes cheat sheet, instructor guide, deck-to-lesson map. */
(function () {
  const A = window.ACADEMY, H = A.H, esc = A.esc, tr = A.tr, L = A.L;

  A.glossary = [
    ['Agent', 'Software where an LLM decides which tools to call, in a loop, to reach a goal. LLM + tools + loop + memory + guardrails.'],
    ['Agentic RAG', 'RAG where the agent decides when and what to search, using a search tool, and can search again.'],
    ['AGENTS.md', 'Project instruction file read by many agents (Hermes, Codex, Copilot and others) at session start.'],
    ['AI gateway / router', 'A service between harnesses and model providers: one endpoint and key, routing, fallback, budgets and logs. OpenRouter is hosted; OmniRoute and 9router run on your own machine.'],
    ['Combo (gateway)', 'A named chain of models that a gateway tries in order or by a strategy, moving on when a quota runs out or a provider fails.'],
    ['DeepSeek Harness (dsh)', 'DeepSeek\'s open-source, plugin-based agent runtime. In developer preview: use it only in disposable environments.'],
    ['Fallback', 'Automatically using another provider or model when the first fails or is out of quota. Convenient, but it can silently change which model answers.'],
    ['Free tier', 'Free model access with limits: a recurring quota, a one-time credit, shared rate limits or keyless access. Check what happens to prompts before using company data.'],
    ['OpenAI-compatible API', 'An API that accepts the same requests as OpenAI\'s chat endpoints, so one client can talk to many providers and gateways by changing a base URL and key.'],
    ['Orchestrator', 'Software that manages many agent runs as work: a board of issues (Multica), parallel worktrees (Orca) or a kanban board in the harness (Hermes).'],
    ['Provider routing', 'Settings such as sort, only, ignore, order and data_collection that decide which provider serves a request on a router like OpenRouter.'],
    ['Token saver', 'A gateway feature that compresses tool output or shortens replies to save tokens. It changes what the model sees, so test it on real work.'],
    ['Agent SDK (Claude)', 'Python and TypeScript library that gives your own programs the agent loop, tools, permissions and MCP support that power Claude Code.'],
    ['Always-on agent', 'An agent with a persistent identity that runs on a cloud computer, keeps working when you are away and comes back with a brief or an approval request. Examples launched in 2026: Grok Bot, OpenAI dots, Meta Muse and Claude Duet.'],
    ['Remote Control (Claude Code)', 'Lets the Claude app or claude.ai/code steer a Claude Code session that keeps running on your own machine. Needs a claude.ai login; not available with API keys, cloud-provider logins or an LLM gateway.'],
    ['Channel (Claude Code)', 'An MCP-server plugin, in research preview, that pushes Telegram, Discord or iMessage messages into a running session. Pair it and lock it to an allowlist.'],
    ['Effort level', 'How hard a model thinks on each step: low, medium, high, xhigh or max, depending on the model. Higher is slower and costs more.'],
    ['PRD', 'Product requirements document: what to build, why and for whom. In agent-driven development the plan is split into small tickets, one per agent.'],
    ['Policy (OpenCode)', 'An organization rule such as provider.use, tool.use or integration.use that can only tighten what permissions allow. It outranks project settings and never prompts.'],
    ['Variant (model)', 'A named option of one model, written after # in OpenCode, such as provider/model#high. Often sets reasoning effort.'],
    ['Code Mode', 'In OpenCode 2, the agent writes a small JavaScript program with the execute tool that calls MCP tools together, which keeps the context small.'],
    ['Git worktree', 'A second checkout of the same repository in another folder, so two agents can edit at once without overwriting each other.'],
    ['ACP (Agent Client Protocol)', 'A protocol that lets an editor use a coding agent as its assistant. opencode acp serves it over standard input and output.'],
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
    ['Autonomy ladder', 'Five levels of how much an agent may do on its own, from 0 (people do it) to 4 (runs end to end, monitored). A task moves up one level at a time, with evidence, and decisions about a person\'s rights or money stay at level 2 or below.'],
    ['Automation policy', 'A one-page document that says what may be automated, at what autonomy level, who is accountable, how people can challenge a result, and how to stop it.'],
    ['Service catalogue', 'The list of what an organisation does for people (permits, benefits, certificates, complaints), with the processes and tasks behind each. The starting point for choosing what to automate.'],
    ['Progressive disclosure', 'Loading a skill in levels: only its name and description are always in context, the body loads when it matches, and files or script output load when the steps need them.'],
    ['Skill description', 'The frontmatter text that says what a skill does and when to use it. The agent matches your request against it, so it decides whether the skill loads at all.'],
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
    ['Business track', 'The sessions written for people outside IT: managers, communications, finance and other departments. No technical background is needed.'],
    ['Segregation of duties', 'A control that keeps the person or agent that prepares a payment from also approving and making it.'],
    ['Reconciliation', 'Matching two records, such as bank lines and ledger entries, and listing what does not match.'],
    ['Fact sheet', 'The confirmed facts an assistant may use for a message. Anything outside it must be marked [unverified].'],
    ['Holding statement', 'A short, confirmed-facts-only statement issued while a situation is still unfolding.'],
    ['Pilot', 'A short, measured trial of one task with an agent, with success criteria written before it starts.'],
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
      H.code('CLAUDE.md, ~/.claude/CLAUDE.md          instructions\n.claude/settings.json                   team rules, hooks\n.claude/settings.local.json             personal overrides\n.claude/skills/<name>/SKILL.md          skills\n.claude/agents/<name>.md                subagents\n.mcp.json                               team MCP servers', 'text', 'Claude Code: files') +
      H.code('claude remote-control          steer a local session from phone or browser\n/remote-control                in the desktop app or VS Code\nclaude agents                  many background sessions, one screen (preview)\n/effort  /effort status        low | medium | high | xhigh | max\nclaude --effort high           start at an effort level\nclaude --channels plugin:telegram@claude-plugins-official\n                               chat-app channel (research preview)\n\nbypassPermissions: containers and VMs only', 'text', 'Claude Code: reach, scale and effort'),
      H.code('# install\ncurl -fsSL https://chatgpt.com/codex/install.sh | sh  # macOS, Linux\nnpm install -g @openai/codex\n\ncodex                      # interactive session\ncodex app                  # desktop app\ncodex -s read-only -a on-request\ncodex exec "…"             # non-interactive\ncodex exec --json "…"      # JSONL events\ncodex exec --output-schema s.json -o out.json "…"\ncodex review --base main\ncodex resume --last\ncodex mcp add <name> -- <command>\ncodex doctor', 'bash', 'Codex: CLI') +
      H.code('/init /permissions /plan /model /diff /review\n/skills /mcp /agents /compact /status /resume\n\n@file        mention a file\n$skill-name  use a skill', 'text', 'Codex: in a session') +
      H.code('~/.codex/config.toml                    settings, profiles, MCP\nAGENTS.md, ~/.codex/AGENTS.md           instructions\n.agents/skills/<name>/SKILL.md          skills\n\nsandbox:  read-only | workspace-write | danger-full-access\napproval: untrusted | on-request | never', 'text', 'Codex: files and modes')
    ),
  };

  A.pages.ecosheet = {
    title: 'Agent ecosystem and gateway cheat sheet', eyebrow: 'Reference', lead: 'Commands and settings from Module 16 on one page. Facts checked against the projects\' own repositories in October 2026; these projects change daily, so run <code>--help</code> and read the current README first.',
    render: () => H.split(
      H.code('# OpenCode\nbrew install opencode\nopencode                  # start in a git repo\n/connect  /models         # add a provider key, pick a model\nTab                       # switch build and plan agents\n@general  @explore        # invoke a subagent\n\n# ~/.config/opencode/opencode.json  (or ./opencode.json)\n"permission": { "*": "ask", "bash": { "terraform apply*": "deny" } }\n"provider": { "gw": { "npm": "@ai-sdk/openai-compatible",\n  "options": { "baseURL": "http://127.0.0.1:20128/v1" } } }\n.opencode/agents/<name>.md   # custom agents', 'bash', 'OpenCode') +
      H.code('# DeepSeek Harness (developer preview: disposable VM only)\nnpx @deepseek-ai/dsh web                       # UI on 127.0.0.1:3080\nnpx @deepseek-ai/dsh web --no-open\nnpx @deepseek-ai/dsh --profile web --dump-config\ndsh plugin --profile <name> add <package>\n# profiles: web, headless, sdk, sdk-minimal, acp\n# sandbox: read-only | workspace-write | danger-full-access', 'bash', 'DeepSeek Harness') +
      H.code('# git worktrees (what Orca automates)\ngit worktree add ../try-a -b try/agent-a\ngit worktree list\ngit worktree remove ../try-a\n\n# Multica: self-host\ncurl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash -s -- --with-server\nmultica setup self-host', 'bash', 'Orca and Multica'),
      H.code('# every tool needs a base URL and a key\nClaude Code : ANTHROPIC_BASE_URL=http://127.0.0.1:20128   (no /v1)\n              ANTHROPIC_AUTH_TOKEN=<gateway key>   /status to verify\nOpenCode    : provider.<id>.options.baseURL = .../v1   + /connect\nCodex       : [model_providers.<id>] base_url, env_key, wire_api\nHermes      : model: {provider: custom, base_url: .../v1, default: <model>}\nAny OpenAI  : OPENAI_BASE_URL / OPENAI_API_KEY', 'text', 'connect a tool to a gateway') +
      H.code('# OmniRoute (port 20128)\nnpm install -g omniroute && omniroute\ndocker run -d -p 127.0.0.1:20128:20128 -v omniroute-data:/app/data diegosouzapw/omniroute:<pinned>\nomniroute run claude --model auto/coding\nomniroute configure opencode\n# model: auto | auto/coding | auto/cheap | auto/fast | auto/subscription\n\n# 9router (port 20128)\nnpm install -g 9router && 9router\n# set INITIAL_PASSWORD and JWT_SECRET before first start\n# header X-9Router-Token-Saver: off  bypasses token savers for one call', 'bash', 'OmniRoute and 9router') +
      H.code('# OpenRouter provider preferences\nsort: price | throughput | latency      # turns load balancing off\nonly: [..]  ignore: [..]  order: [..]\nallow_fallbacks: true | false\nrequire_parameters: true\ndata_collection: deny\n# Hermes: provider_routing: in ~/.hermes/config.yaml', 'text', 'routing keys')
    ),
  };

  A.pages.credits = {
    title: 'Image credits', eyebrow: 'Reference', lead: 'Every interface picture in the lessons, where it comes from and under what terms. Click a picture to enlarge it.',
    render: () =>
      H.note('key', 'Product names, logos and interfaces belong to their owners and are shown here to teach how the tools work. Pictures taken from a project\'s repository carry the licence of that repository. The other pictures were captured from the real tools, or from their public websites on the date shown, while preparing this course. Interfaces change often, so what you see after installing may differ.', 'About these pictures') +
      `<div class="credit-list">${Object.keys(A.shots).map((id) => {
        const r = A.shots[id], sr = r.src;
        return `<div class="credit-row"><img src="${r.img}" alt="${A.esc(A.tr(r.alt))}"><div><b>${A.tr(r.alt)}</b><br><span class="muted">${L('Source: ', 'منبع: ')}<a href="${A.esc(sr.url)}" target="_blank" rel="noopener">${A.esc(sr.name)}</a> · ${A.shotNote(sr)}${r.edit ? '<br>' + A.tr(r.edit) : ''}</span></div></div>`;
      }).join('')}</div>`,
  };

  A.pages.opencodesheet = {
    title: 'OpenCode cheat sheet', eyebrow: 'Reference', lead: 'The OpenCode commands, keys and settings from Module 17 on one page. Checked against the OpenCode 2 documentation in October 2026; OpenCode 1 differences are marked. Run <code>opencode --help</code> first.',
    render: () => H.split(
      H.code('# install (OpenCode 2)\ncurl -fsSL https://opencode.ai/v2/install | bash\nbrew install anomalyco/tap/opencode-v2\nnpm install -g @opencode/cli\n# OpenCode 1: npm install -g opencode-ai\n\nopencode                    # terminal interface\nopencode ~/code/project     # another folder\nopencode mini               # minimal interface\nopencode run "..."          # headless\nopencode pair               # one-time web link', 'bash', 'Start') +
      H.code('/connect  /models  /agents  /sessions  /new\n/init  /undo  /redo  /editor  /mcps  /btw  /help\n\n@file#20-45   attach a line range\n!cmd          run a shell command\n\nShift+Tab  cycle agents (V1: Tab)\nCtrl+X     leader: M models, A agents, N new, L sessions,\n           U undo, R redo, E editor, W close tab\nCtrl+P     command palette   F2  recent models\nCtrl+X Enter   queue a prompt', 'text', 'In the interface') +
      H.code('opencode run --agent plan --model provider/model#high --format json "..."\nopencode run --continue "..."     --file a.ts --standalone\nopencode run --auto "..."         # approves all not denied: containers only\nopencode auth login|list|logout|switch|export\nopencode mcp add|list|auth|logout\nopencode plugin add|list|check|update|remove\nopencode stats --days 7 --cost --models\nopencode session list|export --sanitize|import|delete', 'bash', 'Commands'),
      H.code('opencode.jsonc  (project)   ~/.config/opencode/opencode.json(c)  (global)\n/etc/opencode/  (system, managed)\ncli.json  terminal settings, global only\n\nAGENTS.md                                  instructions (AGENTS.md only in V2)\n.opencode/agents/<name>.md                 agents\n.opencode/commands/<name>.md               commands\n.opencode/skills/<id>/SKILL.md             skills (.claude/skills and .agents/skills too)\n.opencode/plugins/                         plugins', 'text', 'Files') +
      H.code('{\n  "$schema": "https://opencode.ai/config.json",\n  "model": "provider/model",\n  "default_agent": "plan",\n  "permissions": [\n    { "action": "shell", "resource": "*", "effect": "ask" },\n    { "action": "shell", "resource": "git push *", "effect": "deny" },\n    { "action": "external_directory", "resource": "*", "effect": "ask" }\n  ],\n  "policies": [\n    { "action": "provider.use", "resource": "*", "effect": "deny" },\n    { "action": "provider.use", "resource": "company-ai", "effect": "allow" }\n  ],\n  "mcp": { "servers": {} },\n  "instructions": ["CONTRIBUTING.md"]\n}', 'jsonc', 'Config skeleton (V2)') +
      H.code('opencode service status|start|stop|restart\nopencode service set hostname|port|password|cors|env <value>\nopencode reload                 # reload configuration\nopencode debug config|paths     # sources and locations\nopencode api get /api/info\n~/.local/share/opencode/log/opencode.log', 'bash', 'Service and troubleshooting')
    ),
  };

  A.pages.instructor = {
    title: 'Instructor guide', eyebrow: 'For whoever runs the course',
    lead: 'How to run this course for IT teams and for managers, communications, finance and other departments: schedule, tracks, lab setup, and how to update the content.',
    render: () =>
      H.note('key', 'The course is 42 two-hour sessions in nine phases, with two tracks: an IT track (sessions 1 to 34, plus the optional agent-skills sessions 39 and 40) and a business track (sessions 1, 2, 3, 5, 7, 10, 24, 35 to 38 and 41 to 42, written for people with no technical background). Phase A gives everyone the same vocabulary and shows how to use and pay for models. Phase B explains how the machine works; its deeper sessions are optional. Phases D and E, coding agents and Hermes Agent, get most of the time. Phases F and G cover teams, security and your own playbooks. Do not skip session 24 on security. An optional phase H (sessions 30–34, and 39–40) covers the wider ecosystem of harnesses, orchestrators and AI gateways (30–31), a three-session OpenCode tutorial (32–34) and a two-session agent-skills course (39–40), and is best taught after the labs, when people have real questions about cost, free models and other tools. Phase I, sessions 35 to 38 and 41 to 42, is the business track: managers, communications, finance and other departments, and a two-session module on government and public organisations, with labs on sample data and pilot workshops. The <a href="#sessions">session plan</a> lists every lesson, and you can drop the optional sessions when time is short.', 'Course design') +
      H.table(['Phase', 'Sessions', 'Format', 'What to prepare'], [
        ['A · Big picture and using LLMs', '1–3', 'Talk, figures, a short lab', 'A gateway account (OpenRouter or AvalAI) with a small spending limit; one key per pair'],
        ['B · Understanding the machine', '4–8', 'Talk + exercises (4 and 6 optional)', 'An Ollama host for the local-models lab'],
        ['C · AI agents', '9–10', 'Talk + simulators', 'Nothing special'],
        ['D · Coding agents', '11–15', 'Hands-on labs, a project lab', 'Claude Code and Codex accounts; Python 3 and git; the practice repository from session 11; a lab VM or spare router for session 13'],
        ['E · Hermes Agent', '16–21', 'Hands-on labs, a project lab', 'One lab VM per pair with Docker; a lab chat workspace for the gateway'],
        ['F · Beyond one agent', '22–25', 'Talk + exercises + red team', 'Session 22 is a talk only; the guardrail policy agreed with your security team'],
        ['G · Playbooks, workshop, capstone', '26–29', 'Team project', 'Anonymised tickets and one runbook from each team'],
        ['H · Going further (optional)', '30–34, 39–40', 'Talk + gateway lab; OpenCode and skills labs', 'A disposable VM with Docker or Node; no company keys or data; OpenCode 2 on the lab VM (sessions 32–34); a coding agent and a fake repository for the skills labs (39–40)'],
        ['I · Agents for every department', '35–38', 'Talk + three labs on sample data + a pilot workshop', 'An approved assistant account for each learner, and the data-protection officer\'s rules on what may be pasted; ask each learner to bring one real weekly task'],
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
