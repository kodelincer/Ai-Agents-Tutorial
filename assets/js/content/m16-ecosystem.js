(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm16', num: 16, title: 'The agent ecosystem: harnesses, orchestrators and AI gateways',
    summary: 'A map of the fast-moving agent world: DeepSeek Harness, OpenCode, Multica and Orca, model providers and OpenRouter, self-hosted gateways such as OmniRoute and 9router, how to find free models safely, and how to connect Claude Code, OpenCode and other harnesses to a router.',
    deck: [27, 44],
    outcomes: [
      'Place any new agent tool in one of four layers: model, gateway, harness or orchestrator',
      'Install and compare DeepSeek Harness and OpenCode, and read their sandbox and permission settings',
      'Explain what Multica and Orca add, and what running agents in parallel really costs',
      'Use provider routing (sort, only, ignore, data_collection) to control cost, speed and where prompts go',
      'Find free models and tiers, and decide what data may ever be sent to them',
      'Connect Claude Code, OpenCode, Codex and Hermes to OpenRouter, OmniRoute or 9router, and audit a gateway before anyone depends on it',
    ],
    lessons: [
      {
        id: 'm16-1', title: 'A map of the agent ecosystem', mins: 20, deck: [27, 44],
        slides: [
          {
            t: 'Every tool in this module lives in one of four layers',
            b: H.split(
              H.fig(D.stack([
                { t: 'Orchestrators', s: 'Multica · Orca · Hermes kanban', c: 'acc' },
                { t: 'Harnesses (agent runtimes)', s: 'Hermes · Claude Code · Codex · OpenCode · DeepSeek Harness', c: 'tl' },
                { t: 'Gateways and routers', s: 'OpenRouter · OmniRoute · 9router · cloud platforms' },
                { t: 'Models and providers', s: 'Claude · GPT · DeepSeek · Qwen · local models', c: 'ink' },
              ], { h: 66 })),
              H.prose(
                'A model alone only produces text (Module 2). Each layer adds something, and you can swap one layer without touching the others.',
                '<b>Models and providers</b> are the brains and the companies or servers that run them behind an API.',
                '<b>Gateways</b> sit between harness and provider: one endpoint, routing, fallback, keys, logging.',
                '<b>Harnesses</b> are the agent itself: the loop, tools, context, memory and permissions (Module 7).',
                '<b>Orchestrators</b> manage many agent runs as work: boards, parallel worktrees, schedules and reviews.'
              )
            ),
            n: 'Draw this on the board and keep it there for the whole module. Every time a new tool name comes up, ask the room which layer it belongs to. Most confusion about AI tools comes from mixing layers, for example comparing a gateway with a harness.',
          },
          {
            t: 'Who is who (a snapshot of October 2026)',
            b: H.table(['Tool', 'Layer', 'What it is', 'Licence in its repository'], [
              ['Hermes Agent', 'Harness (+ kanban)', 'Self-hosted agent with memory, skills, cron, chat gateway and profiles', 'MIT'],
              ['Claude Code', 'Harness', 'Anthropic\'s coding agent: terminal, desktop, IDE, web', 'Anthropic commercial terms'],
              ['Codex', 'Harness', 'OpenAI\'s coding agent: CLI, desktop app, cloud', 'Apache-2.0 (CLI)'],
              ['OpenCode', 'Harness', 'Open-source terminal coding agent for 75+ providers', 'MIT'],
              ['DeepSeek Harness (dsh)', 'Harness', 'DeepSeek\'s plugin-based agent runtime, developer preview', 'MIT'],
              ['Codewhale (was DeepSeek-TUI)', 'Harness', 'Community terminal coding agent, DeepSeek by default', 'MIT'],
              ['Multica', 'Orchestrator', 'A board where agents are teammates and run on your machines', 'Apache-2.0 plus extra conditions'],
              ['Orca', 'Orchestrator', 'Desktop app running many agents in parallel git worktrees', 'MIT'],
              ['OpenRouter', 'Gateway (hosted)', 'One API and key for many models and providers', 'Commercial service'],
              ['OmniRoute', 'Gateway (self-hosted)', 'Local OpenAI-compatible gateway with combos and fallback', 'MIT'],
              ['9router', 'Gateway (self-hosted)', 'Local router with tiered fallback and a token saver', 'MIT'],
            ]) + H.note('warn', 'These projects ship daily. Star counts, provider counts and feature lists in their READMEs change weekly: treat every number as a snapshot, and read the repository before a class.'),
            n: 'Do not read the table row by row. Ask which rows surprise people. Point out the licence column: Multica is “source-available” with extra conditions, so legal should read it before a company adopts it. Claude Code is a commercial product; the others in the harness row are open source.',
          },
          {
            t: 'Sort the tools into layers',
            b: H.widget('layers'),
            n: 'Let people answer alone first, then discuss the misses. The two that trip people up are Hermes kanban (orchestration built into a harness) and OpenCode (a harness that can use any provider or gateway).',
          },
          {
            t: 'One request, end to end',
            b: H.fig(D.seq(['You', 'Orchestrator (Multica)', 'Harness (OpenCode)', 'Gateway (OmniRoute)', 'Provider (DeepSeek API)'], [
              [0, 1, 'assign issue', 'acc'],
              [1, 2, 'start a run on your machine'],
              [2, 3, 'POST /v1/chat/completions'],
              [3, 4, 'pick a route, apply fallback'],
              [4, 3, 'tokens'],
              [3, 2, 'stream the reply'],
              [2, 1, 'diff + execution log'],
              [1, 0, 'ready for review', 'acc'],
            ], { step: 42, focus: 3 }), 'Example only: any orchestrator, harness, gateway and provider can sit in these four lanes.') +
              H.note('it', 'Every arrow is a place to <b>log, limit and approve</b>. The harness enforces tool permissions, the gateway enforces which providers and budgets are allowed, the orchestrator enforces review, and you decide what merges.'),
            n: 'Walk the arrows top to bottom. Then ask: if one agent leaks a secret, where would we see it? In the gateway request log, the orchestrator execution log, and the harness session. That is why we want logs at every layer.',
          },
        ],
      },
      {
        id: 'm16-2', title: 'DeepSeek Harness: everything is a plugin', mins: 25, deck: [27, 44], lab: true,
        slides: [
          {
            t: 'What DeepSeek Harness is',
            b: H.split(
              H.prose(
                '<b>DeepSeek Harness</b> (<code>dsh</code>) is an open-source agent harness from DeepSeek AI, under the MIT licence.',
                'Its idea is <b>everything is a plugin</b>. The model adapter, the tool registry, the session log and even the agent loop are plugins on a shared framework (Cordis). To change a part you mount another plugin beside it; nothing in the core has to be patched.',
                'It is a <b>developer preview</b>. The README warns that compatibility-breaking changes will happen, and its safety notice says it has not had a security audit and must not be treated as production-ready.'
              ),
              H.fig(D.hub({ t: 'Cordis', s: 'plugin framework', c: 'acc' }, [
                { t: 'Model adapter' },
                { t: 'Tool registry', c: 'tl' },
                { t: 'Session log' },
                { t: 'Agent loop', c: 'tl' },
                { t: 'Sandbox + approvals', c: 'crit' },
                { t: 'Your plugin', c: 'ok' },
              ], { h: 420, rx: 290, ry: 150, bw: 170, bh: 54, r: 70 }))
            ),
            n: 'The architecture matters more than the product today. Compare with Hermes: Hermes is batteries included and opinionated, dsh is a kit where even the loop can be replaced. A kit is powerful for platform teams and risky for everyone else, which is why it is labelled a developer preview.',
          },
          {
            t: 'One engine, several surfaces: profiles',
            b: H.split(
              H.table(['Profile', 'What it is for'], [
                ['<code>web</code>', 'The browser interface, served locally (default <code>http://127.0.0.1:3080</code>)'],
                ['<code>headless</code>', 'Scripts and CI: run one task and exit'],
                ['<code>sdk</code>, <code>sdk-minimal</code>', 'Embed it in Python or TypeScript programs'],
                ['<code>acp</code>', 'For editors and other ACP-compatible clients'],
                ['Desktop app', 'An Electron app that ships its own runtime'],
              ]),
              H.code('# see the plugin tree your machine would boot\nnpx @deepseek-ai/dsh --profile web --dump-config\n\n# a profile is a named stack of bundles, plus your own patch file\n#   <harness home>/profiles/<name>/cordis.patch.yml   (replace a row by id, or insert new rows)\n\n# add a plugin to a profile\ndsh plugin --profile <name> add <package>', 'bash', 'profiles and patches')
            ) + H.note('tip', 'A <b>profile</b> is composed from ordered layers: shipped bundles, your profile patch, a home patch, then <code>--patch</code> overlays. Any row printed by <code>--dump-config</code> can be replaced by a patch of your own.'),
            n: 'Show --dump-config live and scroll through it. The point is that the sandbox and approval policy are rows in a file, not hard-coded behaviour. The exact location of the Harness home can differ by version; use the docs shipped with your version.',
          },
          {
            t: 'Sandbox and approvals',
            b: H.split(
              H.table(['Sandbox mode', 'Meaning'], [
                ['<code>read-only</code>', 'The agent can read; writes are denied'],
                ['<code>workspace-write</code>', 'Writes allowed in the workspace and a private temp area'],
                ['<code>danger-full-access</code>', 'No confinement: the command runs as is'],
              ]),
              H.prose(
                'Confinement uses operating-system features: <b>bwrap or Landlock</b> on Linux, <b>Seatbelt</b> on macOS and a <b>restricted-token ACL runner</b> on Windows.',
                'Enforcement is reported as <b>full or partial</b>. An older kernel or the Windows runner may govern only part of what the mode promises, so code that needs an absolute boundary must check.',
                'By default, file writes are confined to your workspace and risky actions ask first.'
              )
            ) + H.note('warn', 'The sandbox mode governs <b>file effects only</b>. Network access and process visibility are outside it. The project\'s own safety notice says: run it with the least privilege, prefer a disposable VM or container, keep backups, and do not use it as the only security control.') +
              H.note('key', 'Notice the names: <code>read-only</code>, <code>workspace-write</code>, <code>danger-full-access</code> are the same three sandbox modes you met in Codex (Module 8). Good ideas converge on the same vocabulary.'),
            n: 'Ask the security people to read the “file effects only” sentence aloud. Network egress is the part of the sandbox most people forget: a confined process can still send data out, so containers and egress rules from Module 11 still apply.',
          },
          {
            t: 'Lab: run it in a disposable VM',
            b: H.split(
              H.code('# on a throwaway lab VM, never your workstation\nnode --version                            # Node.js is required\nnpx @deepseek-ai/dsh web                  # Web UI on http://127.0.0.1:3080\nnpx @deepseek-ai/dsh web --no-open        # server only (for example over SSH)\n\n# from source\ngit clone https://github.com/deepseek-ai/deepseek-harness.git\ncd deepseek-harness && pnpm install && pnpm run build && pnpm dsh web', 'bash', 'start dsh'),
              H.steps([
                ['Snapshot the VM', 'You can always roll back.'],
                ['Open the Web UI', 'Choose a model provider in settings and add a spend-limited key from the vault.'],
                ['Ask a read-only question', '“List the files in the working directory and explain what this folder is.”'],
                ['Try to write outside the workspace', 'Watch the sandbox or an approval stop it.'],
                ['Dump the config', 'Find the sandbox and approval rows in the tree.'],
              ])
            ) + H.note('warn', 'Check the name before you install. The official package scope is <code>@deepseek-ai</code> and the official repository is <code>deepseek-ai/deepseek-harness</code>. Look-alike projects with similar names exist (for example, a separate community Python project). A matching name is not provenance.'),
            n: 'This is a supply-chain lesson as much as a tool lesson. Make everyone open the official repository, find the npm scope and compare. Ten minutes. Remind them that the lab VM has no production credentials.',
          },
          {
            t: 'DeepSeek models, and community tools around them',
            b: H.table(['What', 'Notes'], [
              ['DeepSeek as a provider', 'Built in to Hermes (<code>provider: deepseek</code>, key in <code>DEEPSEEK_API_KEY</code>) and listed in OpenCode\'s providers. Reachable through gateways and OpenRouter as well.'],
              ['Codewhale (was DeepSeek-TUI)', 'A community terminal coding agent, not an official DeepSeek product. MIT. Defaults to DeepSeek but supports 40+ providers and local models. Modes: Plan, Work, Operate. Permissions: Ask, Auto-Review, Full Access. <code>/receipts</code> lists files changed, commands run and web or MCP calls; <code>/undo</code> reverts the last request.'],
              ['Scripted use', '<code>codewhale exec --auto --sandbox workspace-write "…"</code> runs one task without the interface and keeps the shell sandbox on.'],
            ]) + H.note('it', 'Approval is <b>per provider</b>, not per tool. Before company data goes to any model provider, legal and security must know where it is hosted and what its terms say about prompts. A cheap, strong model is not a reason to skip that review.'),
            n: 'Be even-handed here: the models are interesting for cost and capability, and the policy question is the same as for any provider. Ask who in the organisation decides which providers are approved, and write the name down.',
          },
          {
            t: 'A look at a community DeepSeek terminal agent',
            b: H.shot('codewhale-tui', 'Codewhale: a checklist, a result and the Full Access mode shown in the status line.'),
            n: 'Zoom into the bottom line of the picture. The mode is always on screen: Full Access. Ask what the safe default should be on a lab VM and why we would never leave a full-access agent on a production host.',
          },
        ],
      },
      {
        id: 'm16-3', title: 'OpenCode: an open-source coding agent for any model', mins: 25, deck: [26, 27], lab: true,
        slides: [
          {
            t: 'OpenCode in one page',
            b: H.split(
              H.prose(
                '<b>OpenCode</b> is an open-source (MIT) coding agent for the terminal, with a desktop app in beta.',
                'It talks to <b>75+ model providers</b> through the AI SDK and the Models.dev catalog, including local models, so you can change the model without changing the tool.',
                'Two <b>primary agents</b>, switched with <kbd>Tab</kbd>: <b>build</b> (full tools) and <b>plan</b> (read-only analysis). Subagents such as <b>general</b> and <b>explore</b> are invoked with <code>@</code>.',
                'Project rules go in <code>AGENTS.md</code>, the same file Codex and Hermes read.'
              ),
              H.code('# macOS and Linux (other options on opencode.ai/download)\nbrew install opencode\n\ncd ~/repos/infra-scripts\nopencode          # start in a git repository\n/connect          # add a provider key (stored in ~/.local/share/opencode/auth.json)\n/models           # choose a model', 'bash', 'install and first run')
            ),
            n: 'The project is moving fast and the README now describes a v2 line, so ask students to run opencode --version and read the docs for the version they installed. Show the Tab switch between build and plan live.',
          },
          {
            t: 'Three tools, one idea: how much may the agent do alone?',
            b: H.table(['Situation', 'Claude Code', 'Codex', 'OpenCode'], [
              ['Explore, change nothing', 'plan mode', '<code>-s read-only</code>', 'plan agent'],
              ['Ask before risky steps', 'Manual (<code>default</code>)', '<code>-a on-request</code>', '<code>"ask"</code> rules'],
              ['Edit files, review the diff', '<code>acceptEdits</code>', '<code>-s workspace-write</code>', '<code>edit: allow</code>, <code>bash: ask</code>'],
              ['Unattended, exact allowlist', '<code>dontAsk</code> + allowedTools', '<code>-a never</code> + sandbox', '<code>--auto</code> with explicit <code>deny</code> rules'],
              ['No limits (container only)', '<code>bypassPermissions</code>', '<code>--yolo</code>', '<code>"permission": "allow"</code>'],
            ]),
            n: 'Make this the take-away table. Once people know the five situations, they can configure any new coding agent in minutes. In OpenCode, --auto approves everything that is not explicitly denied, so deny rules still matter.',
          },
          {
            t: 'Permissions: allow, ask, deny',
            b: H.split(
              H.code('{\n  "$schema": "https://opencode.ai/config.json",\n  "permission": {\n    "*": "ask",\n    "bash": {\n      "*": "ask",\n      "git status*": "allow",\n      "git diff*": "allow",\n      "terraform plan*": "allow",\n      "terraform apply*": "deny",\n      "ansible-playbook*": "deny",\n      "rm *": "deny"\n    },\n    "read": { "*": "allow", "*.env": "deny", "secrets/**": "deny" }\n  }\n}', 'json', 'opencode.json'),
              H.prose(
                'Every rule resolves to <b>allow</b> (run), <b>ask</b> (prompt) or <b>deny</b> (block).',
                'Patterns use <code>*</code> and <code>?</code>. The <b>last matching rule wins</b>, so put the catch-all <code>"*"</code> first and the specific rules after it.',
                'Other keys include <code>edit</code>, <code>webfetch</code>, <code>task</code> (subagents) and <code>external_directory</code> (paths outside the project). By default most permissions are <code>allow</code>, and <code>.env</code> reads ask: start stricter than the default.',
                'Per-agent overrides go under <code>agent.&lt;name&gt;.permission</code>.'
              )
            ),
            n: 'Stress “most permissions default to allow”. A fresh OpenCode install is more permissive than a fresh Claude Code or Codex install, so the first thing we do is write this file. Order matters: last match wins.',
          },
          {
            t: 'Providers: /connect, and any OpenAI-compatible endpoint',
            b: H.split(
              H.code('{\n  "$schema": "https://opencode.ai/config.json",\n  "provider": {\n    "company-gw": {\n      "npm": "@ai-sdk/openai-compatible",\n      "name": "Company AI gateway",\n      "options": { "baseURL": "http://127.0.0.1:20128/v1" },\n      "models": { "auto": { "name": "auto (gateway chooses)" } }\n    }\n  }\n}', 'json', 'a custom provider pointing at a gateway'),
              H.code('{\n  "$schema": "https://opencode.ai/config.json",\n  "provider": {\n    "openrouter": {\n      "models": {\n        "moonshotai/kimi-k2": {\n          "options": {\n            "provider": { "order": ["baseten"], "allow_fallbacks": false }\n          }\n        }\n      }\n    }\n  }\n}', 'json', 'OpenRouter provider preferences')
            ) + H.note('tip', 'Add the key with <code>/connect</code> (choose <b>Other</b> for a custom provider and give it the same id). Use <code>@ai-sdk/openai-compatible</code> for <code>/v1/chat/completions</code> endpoints and <code>@ai-sdk/openai</code> for <code>/v1/responses</code>. Keys live in <code>auth.json</code>: treat that file like a password store.'),
            n: 'The left block is the bridge to lessons 6 to 8: a gateway is just another OpenAI-compatible provider to OpenCode. The right block shows a harness passing routing preferences through to OpenRouter.',
          },
          {
            t: 'Your own agents, rules and tools',
            b: H.split(
              H.code('---\ndescription: Reviews network config changes for risk and a missing rollback plan\nmode: subagent\ntemperature: 0.1\npermission:\n  edit: deny\n  bash: deny\n---\n\nYou review proposed switch and firewall configuration changes.\nCheck scope, blast radius, rollback, pre- and post-checks and the\nmaintenance window. Report findings as a table. Never change files.', 'markdown', '.opencode/agents/net-review.md'),
              H.prose(
                'A Markdown file in <code>.opencode/agents/</code> (or <code>~/.config/opencode/agents/</code>) becomes an agent; the file name is its name. Use it with <code>@net-review</code>.',
                'Extra instruction files: <code>"instructions": ["docs/network-standards.md"]</code> in the config.',
                'Tools: <code>mcp</code> servers in the config (Module 7), and plugins from <code>.opencode/plugins/</code> or npm.',
                'Context control: <code>steps</code> limits how many steps an agent may take, and <code>hidden: true</code> keeps a subagent out of the <code>@</code> menu.'
              )
            ),
            n: 'Same pattern as Claude Code subagents from Module 8 and Hermes profiles from Module 10. Let the network engineers write a net-review agent for their own change template as an exercise.',
          },
          {
            t: 'OpenCode in pictures',
            b: H.shots([
              ['opencode-home', 'The start screen. It tells you to run /connect to add a provider.'],
              ['opencode-session', 'A session: search tools, the build agent and the running token cost.'],
              ['opencode-vscode', 'Inside VS Code, next to the file being edited.'],
              ['opencode-github', 'As a bot on a GitHub pull request.'],
            ]),
            n: 'Four faces of the same agent. Ask students to find the cost and the active agent on the session picture. OpenCode also has a desktop app in beta (downloads on opencode.ai/download); check the version you install.',
          },
        ],
      },
      {
        id: 'm16-4', title: 'Orchestrators: Multica and Orca', mins: 25, deck: [49, 50],
        slides: [
          {
            t: 'When agents multiply, you need to manage them',
            b: H.table(['Approach', 'Example', 'Shape', 'Best when'], [
              ['A board inside the harness', 'Hermes kanban + profiles (Module 10)', 'Agents are profiles; tasks move across columns', 'You already run Hermes and want one tool'],
              ['A team board for mixed agents', 'Multica', 'Issues assigned to agents (and people) on a shared board; agents run on your machines', 'A team wants agents as visible teammates with review gates'],
              ['A desktop for parallel runs', 'Orca', 'One window, many agents, each in its own git worktree', 'One engineer fans work out and compares results'],
            ]) + H.note('key', 'None of these is a model or a harness. They <b>drive the harnesses you already have</b>: Claude Code, Codex, OpenCode, Hermes and others. Their value is visibility, parallelism and review, not smarter agents.'),
            n: 'Ask how many people already keep five terminal tabs of agents open. That is the pain. The three options differ in who the user is: the whole team (Multica), one engineer (Orca), or a Hermes operator (kanban).',
          },
          {
            t: 'Multica: agents that show up on the board',
            b: H.split(
              H.fig(D.flow([
                { t: 'Issue', s: 'assigned to an agent', c: 'acc' },
                { t: 'Daemon', s: 'on your machine', c: 'tl' },
                { t: 'Agent CLI', s: 'Claude Code, Codex, OpenCode, Hermes…' },
                { t: 'Review', s: 'a human decides', c: 'ok' },
              ], { h: 96 }), 'Multica does not ship a model. It drives the agent CLIs you have installed.'),
              H.prose(
                'You file an issue and assign it to an agent like a colleague. The agent picks it up, runs on a <b>runtime you control</b> (a daemon on your laptop or a server), comments as it goes and hands the result back for review.',
                '<b>Squads</b> group agents and people behind a leader that routes work. <b>Skills</b> turn a solved problem into a playbook all agents reuse. <b>Autopilots</b> run recurring jobs on a schedule.',
                'The execution log records every tool call, command and error, and usage analytics show what each run cost.',
                'It supports 26 agent CLIs, including Claude Code, Codex, OpenCode, Hermes and DeepSeek Harness. You can self-host it with Docker Compose or Helm (Go backend, PostgreSQL).'
              )
            ) + H.note('warn', '<b>Read the licence.</b> Multica is under the Apache-2.0 text <i>plus additional conditions</i> covering hosted services, commercial embedding and branding. That is source-available, not plain open source: send it to legal before the company builds on it.'),
            n: 'The most important design point is where code runs: on your own machine through the daemon, not in a vendor cloud. Ask what that means for secrets in the repo and for the network access of that daemon. It needs the same least-privilege treatment as any service account.',
          },
          {
            t: 'Orca: many agents, one window, separate worktrees',
            b: H.split(
              H.prose(
                '<b>Orca</b> is a free, MIT-licensed desktop app (macOS, Windows, Linux) that runs Codex, Claude Code, OpenCode, Pi and other CLIs side by side.',
                'A <b>git worktree</b> is a second checkout of the same repository in another folder. Each agent gets its own, so five agents can edit at once without overwriting each other. You compare the results and merge the winner.',
                'Also: terminal splits, GitHub and Linear tasks, annotating AI diffs, SSH worktrees for a remote machine, a mobile companion that notifies you when an agent finishes, and usage tracking for Claude and Codex.'
              ),
              H.code('# what Orca automates, by hand\ngit worktree add ../infra-a -b try/agent-a\ngit worktree add ../infra-b -b try/agent-b\n\n# run one agent in each folder, then compare\ngit -C ../infra-a diff main --stat\ngit -C ../infra-b diff main --stat\n\n# keep the winner, clean up\ngit merge try/agent-a\ngit worktree remove ../infra-a ../infra-b', 'bash', 'worktrees in four commands')
            ),
            n: 'Teach the worktree idea with the four commands first; Orca then looks like a convenience layer rather than magic. This is the same “agents propose, humans merge” pattern we use everywhere.',
          },
          {
            t: 'What does fan-out really cost?',
            b: H.widget('fanout'),
            n: 'Move the success chance down to 20 percent and watch the best N change. Then move review minutes up. The lesson: parallel agents trade model money for a better chance, but your review time is the scarce resource.',
          },
          {
            t: 'Orchestrators and our guardrail policy',
            b: H.table(['Question', 'What to check', 'Our rule'], [
              ['Where does the agent run?', 'Multica daemon or Orca worktree: it is a process on a real machine with real credentials', 'Dedicated runtime with least privilege; no admin credentials'],
              ['Who can assign work?', 'Roles and access scopes (Multica), or just the person at the desktop (Orca)', 'Only named engineers; agents never assign production changes'],
              ['What stops a bad change?', 'Review gates: work lands in review, not in main', 'Branch protection and a human merge stay mandatory (T2)'],
              ['Can we see what happened?', 'Execution log, usage analytics', 'Ship logs to the SIEM; keep them with the ticket'],
              ['What about cost and runaway loops?', 'Retries and timeouts, per-run cost', 'Spend limits at the gateway as well (lesson 6)'],
            ]) + H.note('key', 'An orchestrator <b>multiplies</b> whatever policy you have. With good guardrails you get ten careful teammates; without them you get ten fast ways to make the same mistake.'),
            n: 'Tie back to the T0 to T3 tiers in Module 12. Orchestrators do not change the tier of an action; they only make it easier to start many actions at once, so approvals and review gates matter more, not less.',
          },
          {
            t: 'Orchestrators in pictures',
            b: H.shots([
              ['multica-board', 'Multica: a board where issues are assigned to agents.'],
              ['orca-hero', 'Orca: Claude Code and Codex in separate worktrees, with its phone app.'],
              ['orca-split', 'Orca: an editor and a browser side by side in one workspace.'],
              ['orca-mobile', 'Orca\'s companion app on a phone.'],
            ]),
            n: 'Multica is a board for a team; Orca is a window for one engineer. In the Orca picture the left list is workspaces, one per worktree, and each terminal runs a different agent. Ask what the phone app means for our policy: an agent you can steer from a phone is an agent that can be steered from a lost phone.',
          },
        ],
      },
      {
        id: 'm16-5', title: 'Model providers and OpenRouter', mins: 25, deck: [23, 24],
        slides: [
          {
            t: 'Five ways to get a model',
            b: H.table(['Path', 'Example', 'Strength', 'Watch out for'], [
              ['Direct vendor API', 'Anthropic, OpenAI, DeepSeek', 'Newest models, clear contract', 'One account and key per vendor'],
              ['Cloud platform', 'Amazon Bedrock, Azure, Google Vertex', 'Your existing cloud contract, IAM and region control', 'Model list lags the vendors'],
              ['Hosted aggregator', 'OpenRouter', 'One key and API for hundreds of models, easy comparison', 'One more party sees your prompts'],
              ['Self-hosted gateway', 'LiteLLM-style proxies, OmniRoute, 9router', 'Your policy, logs and keys in one place', 'You now operate a security-critical service'],
              ['Local model', 'Ollama, vLLM, LM Studio', 'Data never leaves; no per-token fee', 'Needs hardware; smaller models (Module 5)'],
            ]),
            n: 'Ask which row the organisation uses today for AI. Most teams use several without noticing. The slide is also a decision aid: the more sensitive the data, the further down the table you go.',
          },
          {
            t: 'OpenRouter: one API, many providers',
            b: H.split(
              H.prose(
                '<b>OpenRouter</b> is a hosted service with one OpenAI-compatible API and one key in front of many models and the providers that serve them. The same model is often offered by several providers at different prices and speeds.',
                'By default it balances requests across providers that have not had recent outages, favouring lower prices. If a provider fails it can try the next one.',
                'You keep the harness (OpenCode, Hermes, Claude Code through a compatible route) and change <b>which model</b> with a string, such as <code>vendor/model-name</code>.'
              ),
              H.code('# any OpenAI-compatible client\nexport OPENAI_BASE_URL="https://openrouter.ai/api/v1"\nexport OPENAI_API_KEY="sk-or-..."     # from a vault, with a spending limit\n\ncurl "$OPENAI_BASE_URL/chat/completions" \\\n  -H "Authorization: Bearer $OPENAI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model":"anthropic/claude-sonnet-4","messages":[{"role":"user","content":"ping"}]}\'', 'bash', 'a first call')
            ) + H.note('warn', 'Model ids and prices change constantly. Look up the exact id on the provider\'s model page before you copy an example; the one above only shows the shape.'),
            n: 'Keep this practical. The big idea is separation: harness, gateway and model are chosen independently. OpenRouter is the easiest gateway to start with because there is nothing to host.',
          },
          {
            t: 'Provider routing: sort, only, ignore, order',
            b: H.table(['Setting', 'What it does'], [
              ['<code>sort</code>', '<code>price</code>, <code>throughput</code> or <code>latency</code>: rank providers by that. Setting it turns load balancing off.'],
              ['<code>only</code>', 'Allow-list: use only these providers.'],
              ['<code>ignore</code>', 'Deny-list: never use these providers, even if cheapest.'],
              ['<code>order</code>', 'Explicit priority; unlisted providers are fallbacks.'],
              ['<code>allow_fallbacks</code>', 'Whether to try other providers when the first fails.'],
              ['<code>require_parameters</code>', 'Only providers that support every parameter in your request (avoids silently dropped settings).'],
              ['<code>data_collection</code>', '<code>deny</code> excludes providers that may keep or train on your prompts.'],
            ]) + H.code('# Hermes: ~/.hermes/config.yaml (only applies when OpenRouter is the provider)\nprovider_routing:\n  sort: "price"\n  data_collection: "deny"\n  only: ["anthropic", "google"]\n  models:\n    "moonshotai/kimi-k2.6":\n      order: ["moonshotai", "together"]\n      sort: "throughput"', 'yaml', 'the same ideas in Hermes'),
            n: 'These names come from OpenRouter\'s provider preferences; Hermes and OpenCode pass them through. The two that matter most for us are data_collection and only: they decide where a prompt may go at all.',
          },
          {
            t: 'Try routing yourself',
            b: H.widget('routeSim'),
            n: 'Three experiments. First, switch on data_collection deny and watch B and D disappear. Second, untick everything except C and turn on the outage: with fallbacks off the request fails, and that is correct for sensitive work. Third, compare sort by price with sort by latency.',
          },
          {
            t: 'Resilience in the harness itself, and the data question',
            b: H.split(
              H.prose(
                '<b>Fallbacks in the harness:</b> Hermes can switch to another provider and model when the main one fails (<code>hermes fallback</code>, or <code>fallback_providers</code> in the config), and it can rotate several keys for the same provider (credential pools).',
                'A gateway gives you the same thing once, for every tool.',
                '<b>Two or three parties see each prompt:</b> your harness, the router, and the provider that finally runs it. Every extra hop needs terms and a reason.'
              ),
              H.steps([
                ['Per-team keys with spend limits', 'A leaked or looping key then has a ceiling.'],
                ['<code>data_collection: deny</code> by default', 'Allow collection only for public work.'],
                ['An <code>only</code> list for internal data', 'Pin it to providers legal approved.'],
                ['Log which provider served each request', 'You need that for an incident or an audit.'],
              ])
            ),
            n: 'Close the lesson with the data question. A router does not make data safe; it makes it easy to choose where data goes. That choice belongs to policy, not to whoever configured the tool.',
          },
        ],
      },
      {
        id: 'm16-6', title: 'Self-hosted AI gateways: OmniRoute and 9router', mins: 30, deck: [23, 27], lab: true,
        slides: [
          {
            t: 'A gateway on your own machine',
            b: H.split(
              H.fig(D.flow([
                { t: 'Your tools', s: 'Claude Code · OpenCode · Codex', c: 'tl' },
                { t: 'Local gateway', s: 'localhost:20128/v1', c: 'acc' },
                { t: 'Providers', s: 'paid · cheap · free · local' },
              ], { h: 100, anim: true }), 'OmniRoute and 9router both default to port 20128.'),
              H.prose(
                'Both projects run a <b>local OpenAI-compatible endpoint</b> with a dashboard. You connect providers once; every tool points at <code>http://localhost:20128/v1</code> with a gateway key.',
                'They <b>translate formats</b> (OpenAI, Claude, Gemini and others), so a tool that speaks one format can use a model that speaks another.',
                'They add <b>fallback</b>: when a quota runs out or a provider fails, the next target takes over. And they log usage and cost per provider and model.',
                'Both are MIT-licensed and installable with npm or Docker.'
              )
            ),
            n: 'Both default to 20128, which is a funny trap: if you try both on one laptop, one will not start. Say that the gateway is a new service you run, with all the duties that implies.',
          },
          {
            t: 'OmniRoute and 9router side by side',
            b: H.table(['', 'OmniRoute', '9router'], [
              ['Install', '<code>npm install -g omniroute</code> or Docker', '<code>npm install -g 9router</code> or Docker'],
              ['Routing', '“Combos” with 20 strategies (priority, weighted, cost-optimized, round-robin, fusion…) and virtual models such as <code>auto</code>, <code>auto/coding</code>, <code>auto/cheap</code>, <code>auto/fast</code>', 'Combos and a 3-tier fallback: subscription, then cheap, then free'],
              ['Resilience', 'Circuit breakers, quota tracking, three self-healing layers', 'Quota tracking with reset countdowns, auto token refresh, multi-account round-robin'],
              ['Token saving', 'A stack of compression engines (the README claims 15 to 95 percent on eligible workloads)', 'RTK compresses tool output (the README claims 20 to 40 percent); optional extras'],
              ['Tool setup', '<code>omniroute run claude</code>, <code>omniroute configure opencode</code>, MCP and A2A interfaces', 'Dashboard “CLI Tools” page and per-tool setup guide'],
              ['Reach', 'Hundreds of providers in its catalog, many flagged as free', '40+ providers: OAuth, free, API-key and self-hosted'],
            ]) + H.note('warn', 'Claims such as “375 providers”, “save 95 percent” or “free forever” come from the projects\' own READMEs and change between releases. Measure on your own work before you believe a number.'),
            n: 'Use the table to show the two design philosophies, not to pick a winner. Both are young, fast-moving open-source projects. Ask students what they would need to see before they trusted either with real work: that is the audit later in this lesson.',
          },
          {
            t: 'Combos and fallback tiers',
            b: H.split(
              H.fig(D.flow([
                { t: 'Tier 1', s: 'your paid plan or API', c: 'ok' },
                { t: 'Tier 2', s: 'cheap provider', c: 'tl' },
                { t: 'Tier 3', s: 'free or local model' },
              ], { h: 92, anim: true, loop: 'quota exhausted or error: next tier' })),
              H.code('# 9router combo (conceptual)\n"my-coding-stack"\n  1. subscription model     (your plan)\n  2. cheap hosted model     ($ per M tokens)\n  3. free or local model    (last resort)\n\n# OmniRoute: pick a built-in virtual model\nmodel = "auto/cheap"      # cheapest first\nmodel = "auto/coding"     # quality-first for code\nmodel = "auto/subscription"  # only quota you already pay for; fails closed', 'text', 'fallback as a recipe')
            ) + H.note('tip', 'Fallback is a <b>behaviour change you cannot always see</b>: a cheaper, weaker model may answer when the first one is out of quota. Keep request logs, and name the model in the log, so “the agent got worse today” has an answer.'),
            n: 'This is the same idea as fallback_providers in Hermes. The gateway gives it to every tool at once, which is convenient and also means one config error affects everyone.',
          },
          {
            t: 'Token savers: how they work, and the catch',
            b: H.split(
              H.prose(
                'Agents re-send tool output on every step: <code>git diff</code>, <code>grep</code>, log dumps and directory listings often fill a third or more of the prompt.',
                'A <b>token saver</b> compresses that output before it reaches the model. Some compress without loss (removing noise, repeated lines), others summarise or rewrite and can be lossy. Some also inject a terse-style instruction to shorten the model\'s <i>output</i>.',
                'That saves money and context, but the model now sees <b>a different text than your tool produced</b>.'
              ),
              H.steps([
                ['Test on your real diffs and logs', 'Run the same task with the saver on and off.'],
                ['Keep a bypass', '9router honours a request header to turn its savers off for one call (<code>X-9Router-Token-Saver: off</code>).'],
                ['Never rely on it for security reviews', 'A lossy summary of a diff can hide the one line that matters.'],
                ['Measure savings yourself', 'Compare tokens per task in the usage dashboard.'],
              ])
            ),
            n: 'Show the bypass header, then ask the security people why a compressed diff is a risk for review work. Savings are real, but never silently change what a reviewer or an agent reads.',
          },
          {
            t: 'The enterprise reality check',
            b: H.table(['Risk', 'Why it matters', 'Control'], [
              ['Provider terms', 'Many providers forbid sharing an account or routing a consumer subscription through a proxy. The gateways themselves flag some providers as “avoid” for this reason.', 'Use contract API keys; never pool personal or consumer subscriptions for company work'],
              ['Free tiers and data', 'Free access can mean prompts are logged or used for research or training. One catalogued free provider states that every request is logged.', 'Free tiers for public data only (see lesson 7)'],
              ['All keys in one place', 'The gateway holds every provider key and OAuth token.', 'Treat it like a secrets service: private network, SSO or strong password, encryption, key rotation'],
              ['Default credentials', '9router\'s first-login password falls back to <code>123456</code> if you do not set <code>INITIAL_PASSWORD</code>.', 'Set a unique password before first start'],
              ['A control plane an agent can drive', 'OmniRoute exposes MCP and A2A interfaces; an agent connected to them can change routing and providers.', 'Scope the tokens; do not hand the admin tools to a general agent'],
              ['Supply chain', 'Global npm installs run lifecycle scripts; the projects release most days; <code>latest</code> and <code>next</code> tags move.', 'Container or VM, pinned version, review the changelog before upgrading'],
              ['Network exposure', 'A reachable gateway is an open spending account.', 'Bind to <code>127.0.0.1</code> or a management VLAN (OmniRoute\'s Docker example publishes only on 127.0.0.1)'],
            ]),
            n: 'This is the slide to spend time on. None of these gateways is “bad”; they are powerful hobbyist-grade tools. Our job is to know exactly which duties come with running one: network, passwords, keys, versions, terms, data.',
          },
          {
            t: 'Audit a gateway before anyone depends on it',
            b: H.widget('gwAudit'),
            n: 'Tick the boxes as if you were auditing the lab gateway from the next slide. Required items gate the verdict: miss one and the result is lab only. Ask who in the organisation would own the remaining items.',
          },
          {
            t: 'Lab: a gateway in an isolated lab',
            b: H.split(
              H.code('# 1. an isolated lab VM with no production credentials\n# 2. start the gateway bound to loopback, version pinned\ndocker run -d --name omniroute --restart unless-stopped \\\n  -p 127.0.0.1:20128:20128 -v omniroute-data:/app/data \\\n  diegosouzapw/omniroute:<pinned-version>\n\n# 3. open http://localhost:20128, set an admin password, connect ONE provider\n#    whose terms you have read, using a spend-limited key\n\n# 4. check the endpoint\ncurl http://localhost:20128/v1/models \\\n  -H "Authorization: Bearer $GATEWAY_KEY"', 'bash', 'OmniRoute in Docker'),
              H.steps([
                ['Pin the version', 'Replace <code>&lt;pinned-version&gt;</code> with a tag you have read the changelog for; never <code>latest</code> or <code>next</code> for real use.'],
                ['Set the password first', 'Before you connect any key.'],
                ['Connect one provider', 'One key, with a spending limit.'],
                ['Run the audit widget', 'Be honest about which boxes you can tick.'],
                ['Delete the lab when done', 'Remove the container and volume: they hold your keys.'],
              ])
            ) + H.note('tip', 'For 9router the same lab uses <code>npm install -g 9router</code> inside the VM, or Docker, and <code>INITIAL_PASSWORD</code> and <code>JWT_SECRET</code> set in the environment before the first start.'),
            n: 'Keep this to one provider. The goal is the shape of a gateway deployment and the habits (loopback, pin, password, limit, delete), not collecting as many providers as possible.',
          },
          {
            t: 'The two dashboards',
            b: H.shots([
              ['9router-providers', '9router: providers grouped as OAuth (accounts), free and API-key. Look at the first group.'],
              ['omniroute-providers', 'OmniRoute: filters, a free-tier group and API-key providers.'],
            ]),
            n: 'The first group in the 9router picture is OAuth providers: those are consumer subscriptions such as coding-assistant plans. Pooling them behind one gateway usually breaks their terms and puts one person\'s account behind a shared service. Ask the class which groups our policy allows. In OmniRoute point at the counters in the filter bar: they show how many providers are configured out of how many exist.',
          },
        ],
      },
      {
        id: 'm16-7', title: 'Finding free models, and using them safely', mins: 25, deck: [23, 25],
        slides: [
          {
            t: 'Why free exists, and what it usually costs you',
            b: H.cards([
              ['Recurring free tier', 'A monthly quota or rate limit that renews. Good for learning and public work. Limits and terms change without much notice.', 'quota'],
              ['Signup grant or credit', 'A one-time credit, sometimes needing a card or identity check, and often expiring. Do not build a team workflow on it.', 'one-time'],
              ['Free model on a router', 'A model offered at no price through an aggregator such as OpenRouter, usually with strict shared rate limits.', 'shared'],
              ['Keyless or community access', 'No account at all. Capacity, privacy and uptime are whatever the operator gives you.', 'keyless'],
              ['Local models', 'Free to use after you own the hardware, and the only option that keeps data inside (Module 5).', 'local'],
              ['“Free” with a catch', 'Some free providers log every request for research. Always read what happens to your prompts.', 'check'],
            ]),
            n: 'Start by demystifying “free”. Someone pays: with data, with limits, with a promotion budget, or with their own hardware. Ask which of the six they have already used.',
          },
          {
            t: 'How to find what is free right now',
            b: H.steps([
              ['Start from catalogs, not blogs', 'The Models.dev catalog (used by OpenCode) lists models with their prices; OpenRouter\'s model list can be filtered to free models; a router\'s own dashboard flags providers that have a free tier.'],
              ['Open the provider\'s pricing and limits page', 'Free quotas change monthly. Note the date and the exact limit (requests per minute, tokens per month).'],
              ['Read the privacy and data terms', 'Does the provider log, keep or train on prompts? Where is data processed?'],
              ['Check availability for your country and company', 'A provider may not serve your region or your organisation. Respect that: see the next slide.'],
              ['Test with a throwaway key and a small prompt', 'Confirm the model name, rate limits and tool-calling support before you wire it into a tool.'],
              ['Write it in the provider inventory', 'Name, date checked, limits, data terms, owner.'],
            ]) + H.note('tip', 'Routers help here: OmniRoute\'s catalog marks which providers have a free path, and separates recurring pools, keyless access, signup credits and discontinued entries. Its Free Tiers guide is dated and cites provider pricing pages: read the date.'),
            n: 'The method is what lasts; the list of free providers goes stale within weeks. Make each student run steps one to three for one provider and report back in two minutes.',
          },
          {
            t: 'A snapshot (verified in October 2026; check it yourself)',
            b: H.table(['Provider type', 'Typical free offer', 'The catch'], [
              ['Google AI Studio (Gemini Flash family)', 'Recurring API-key quota with rate limits', 'Limits vary by model and project; read the data terms'],
              ['Groq', 'Recurring quota on open models', 'Rate limits; models change'],
              ['Cloudflare Workers AI', 'A free allowance of usage units, published by Cloudflare', 'Requires a Cloudflare account; model list is its own'],
              ['GitHub Models', 'Free access for evaluating models', 'Meant for evaluation; shared limits'],
              ['OpenRouter free models', 'Shared, request-limited pool of free models', 'Strict limits; models rotate'],
              ['DeepSeek', 'A signup grant of free tokens', 'One-time; billing starts after it'],
              ['Cerebras', 'One-time promotional credit', 'Needs a payment method; expires in about a month'],
              ['A research-logged free API', 'Free key, no card', 'Every request is logged for research'],
            ]) + H.note('warn', 'This table is a <b>summary of a third-party guide dated October 2026</b>, not a promise. Providers remove or change free tiers constantly (one popular free OAuth tier was discontinued in April 2026). Always check the provider\'s own page, and never put a free tier on a critical path.'),
            n: 'Say clearly that this slide will be out of date. The skill is checking, not memorising. Point at the last row: it is an honest example of why reading terms matters.',
          },
          {
            t: 'May this data go to this free tier?',
            b: H.widget('freeCheck'),
            n: 'Try three combinations. Public data on a logged free API: allowed with a warning. Internal ticket text on an email-signup free tier: not allowed. Confidential data anywhere free: never. Ask what the approved path for the second case is: a contract provider or a local model.',
          },
          {
            t: 'Provider availability and region rules',
            b: H.split(
              H.prose(
                'Some providers do not serve certain countries or organisations. The reasons are legal: export controls, sanctions, licensing and local law. That is the provider\'s access control, and it applies to us too.',
                'Do <b>not</b> route around it with proxies, VPNs or borrowed accounts. Doing so can breach the provider\'s terms and the law, it can get an account closed, and it moves company data through a path nobody reviewed.',
                'If the best-known providers are not available to you, there are legitimate ways to keep working:'
              ),
              H.list([
                '<b>Local models</b> (Ollama, vLLM, LM Studio) on your own hardware: Module 5. Data stays inside and nobody can switch you off.',
                '<b>Providers that do serve your region</b>, including open-model hosts and regional providers: check their terms, data location and contract.',
                '<b>A cloud platform your organisation already uses</b>, in a region you are allowed to use.',
                '<b>Ask legal and the vendor.</b> Enterprise agreements can answer questions a free tier cannot.',
              ])
            ) + H.note('it', 'Outbound traffic from a gateway should leave through <b>the company\'s approved egress path</b> (the normal proxy and firewall rules), allowed only to approved provider domains. That is egress control, not a way around policy.'),
            n: 'Be matter-of-fact. This is a course inside a company, so the policy answer is compliance plus real alternatives. Local models are the strongest alternative, and Module 5 already showed how to run them.',
          },
          {
            t: 'Where free providers show up in a router',
            b: H.shot('omniroute-providers', 'The Free Tier Providers group in OmniRoute. Some need only an account, others no credentials at all. That is exactly why you read their terms first.'),
            n: 'Show that a router makes free tiers easy to switch on, which is the danger as much as the benefit. Pick one provider in the picture and run the five steps from the earlier slide on it in two minutes: terms, limits, data handling, availability for our region, and who owns it in the provider register.',
          },
        ],
      },
      {
        id: 'm16-8', title: 'Connect your tools to a router', mins: 30, deck: [26, 27], lab: true,
        slides: [
          {
            t: 'The two things every tool needs',
            b: H.split(
              H.prose(
                'To use a router or gateway, every tool needs just two facts: <b>a base URL</b> and <b>a key</b>.',
                'The other detail is the <b>API format</b> the tool speaks:',
                '<ul class="list"><li><b>OpenAI-compatible</b> (<code>/v1/chat/completions</code> or <code>/v1/responses</code>): OpenCode, Codex, Hermes custom endpoints, Cline, Aider.</li><li><b>Anthropic Messages</b> (<code>/v1/messages</code>): Claude Code.</li></ul>',
                'A gateway that <b>translates formats</b> lets either kind of tool use any model it can reach.'
              ),
              H.table(['Tool', 'Base URL', 'Key'], [
                ['Claude Code', '<code>ANTHROPIC_BASE_URL</code> (no <code>/v1</code>)', '<code>ANTHROPIC_AUTH_TOKEN</code> or <code>ANTHROPIC_API_KEY</code>'],
                ['OpenCode', '<code>options.baseURL</code> in <code>opencode.json</code>', '<code>/connect</code> or <code>options.apiKey</code>'],
                ['Codex', '<code>base_url</code> in a <code>[model_providers.&lt;id&gt;]</code> table', '<code>env_key</code> names a variable'],
                ['Hermes', '<code>model.base_url</code> with <code>provider: custom</code>', '<code>~/.hermes/.env</code>'],
              ])
            ),
            n: 'Once students see that every tool needs only a URL and a key, the individual recipes on the next slides feel routine. Claude Code is the odd one: it speaks the Anthropic format, so it needs a gateway that exposes that route.',
          },
          {
            t: 'Claude Code through a gateway',
            b: H.split(
              H.code('# Anthropic documents this for any LLM gateway\nexport ANTHROPIC_BASE_URL=http://127.0.0.1:20128      # the gateway root\nexport ANTHROPIC_AUTH_TOKEN=gw-key-from-the-dashboard\nexport ANTHROPIC_MODEL=auto                           # a model id the gateway knows\n\nclaude\n# inside the session:\n/status        # shows "Anthropic base URL" and the credential source\n\n# or use the router\'s own launcher (OmniRoute)\nomniroute run claude --model auto/coding', 'bash', 'Claude Code'),
              H.prose(
                'Claude Code sends requests to <code>$ANTHROPIC_BASE_URL/v1/messages</code>, so set the base URL <b>without</b> <code>/v1</code>.',
                '<code>ANTHROPIC_AUTH_TOKEN</code> sends a bearer token; use <code>ANTHROPIC_API_KEY</code> if the gateway wants an <code>x-api-key</code> header.',
                'Put the variables in your shell first and test. When they work, move them to the <code>env</code> block of <code>~/.claude/settings.json</code>, <b>never</b> into a project\'s committed <code>.claude/settings.json</code>.',
                'Pin the model names the gateway should use with <code>ANTHROPIC_DEFAULT_SONNET_MODEL</code> and its siblings.'
              )
            ) + H.note('warn', 'Some router READMEs show other ways to set this up (for example a config file with <code>anthropic_api_base</code>). Follow <b>Anthropic\'s gateway documentation</b> for Claude Code and use <code>/status</code> to confirm what it really uses.'),
            n: 'Make them run /status and read the base URL line aloud. It is the quickest way to prove which endpoint Claude Code is actually using. Note that a gateway can only serve what its upstream models can do: tool use and long context need models that support them.',
          },
          {
            t: 'OpenCode, Codex and Hermes through a gateway',
            b: H.code('# OpenCode: ~/.config/opencode/opencode.json\n{\n  "provider": {\n    "gw": {\n      "npm": "@ai-sdk/openai-compatible",\n      "name": "Gateway",\n      "options": { "baseURL": "http://127.0.0.1:20128/v1" },\n      "models": { "auto": { "name": "auto" } }\n    }\n  }\n}\n#   then: /connect → Other → id "gw" → paste the gateway key;  /models → gw/auto\n\n# Codex: ~/.codex/config.toml\nmodel_provider = "gw"\nmodel = "auto"\n[model_providers.gw]\nname = "Gateway"\nbase_url = "http://127.0.0.1:20128/v1"\nenv_key = "GATEWAY_API_KEY"        # the variable that holds the key\nwire_api = "responses"             # recent Codex versions expect the Responses format\n\n# Hermes: ~/.hermes/config.yaml  (key in ~/.hermes/.env)\nmodel:\n  provider: custom\n  base_url: http://127.0.0.1:20128/v1\n  default: auto\n  context_length: 65536            # Hermes needs at least 64K', 'bash', 'three tools, one gateway') +
              H.note('tip', 'OmniRoute can write these files for you: <code>omniroute configure opencode</code>, <code>omniroute configure codex</code>, or launch a tool with the right environment in one command: <code>omniroute run opencode --model auto</code>. <code>--dry-run</code> prints what it would change. 9router has a CLI Tools page in its dashboard.'),
            n: 'Codex\'s provider format has changed between versions, so check with codex --version and the current docs. The example reflects recent releases. Hermes needs a 64K context, so make sure the model the gateway picks supports it.',
          },
          {
            t: 'Orchestrators and the router',
            b: H.split(
              H.prose(
                'Orchestrators drive the same agent CLIs, so there is nothing special to configure in the orchestrator itself: set the environment on the <b>runtime machine</b> (the daemon host, or the shell Orca starts agents from).',
                '<b>Multica:</b> install the agent CLIs on the runtime machine and point each at the gateway as above. The orchestrator then runs them as it would run any installed CLI.',
                '<b>Orca:</b> it launches your installed agents in terminals, so the same variables and config files apply, one worktree at a time.'
              ),
              H.steps([
                ['One gateway key per runtime', 'So usage and revocation are per machine.'],
                ['A per-key spend limit', 'Parallel agents multiply token use.'],
                ['Pin the model', 'Avoid <code>auto</code> for review work; choose a named model.'],
                ['Log model and provider per run', 'Match the orchestrator\'s execution log with the gateway log.'],
              ])
            ),
            n: 'This slide is deliberately short. The orchestrator is not where routing is decided. If students ask how to make Multica use a cheap model, the answer is: configure the underlying CLI.',
          },
          {
            t: 'Lab: one gateway, three tools, one verified path',
            b: H.steps([
              ['Start from the lab gateway', 'Lesson 6 lab: loopback, pinned version, password set, one provider connected.'],
              ['Verify the endpoint', '<code>curl …/v1/models</code> with the gateway key lists your models.'],
              ['Connect OpenCode', 'Custom provider block, then <code>/models</code> and run a read-only prompt in plan mode.'],
              ['Connect Claude Code', 'The three environment variables, then <code>/status</code> to confirm the base URL.'],
              ['Connect Hermes or Codex', 'Whichever your team uses.'],
              ['Read the gateway log', 'Find the three requests: which tool, which model, which provider, how many tokens.'],
              ['Cut the connection', 'Stop the gateway and watch each tool fail clearly. Then restart it.'],
            ]) + H.note('key', 'Success is not “it answered”. Success is: you can say <b>which request went where</b>, you can stop it, and nothing outside the approved providers was contacted.'),
            n: 'Give this 30 minutes. The last two steps matter most: reading the log proves visibility, and cutting the connection proves you have a kill switch. Both are things we will want in any real deployment.',
          },
          {
            t: 'A decision table for our team',
            b: H.table(['Data and use', 'Where may it go?', 'Typical path'], [
              ['Public or learning work', 'Free tiers and shared gateways, with a throwaway key', 'Lab gateway or free provider'],
              ['Internal code, tickets, runbooks', 'Providers with a contract and approved terms; no logging or training', 'Cloud platform, direct vendor API or a company gateway with an <code>only</code> list'],
              ['Customer data, credentials, regulated data', 'Local models or the strictest approved provider; never a free tier or a shared gateway', 'Self-hosted model on our hardware (Module 5)'],
              ['Unattended agents (cron, CI)', 'Same rules plus spend limits and a deny-by-default tool policy', 'Dedicated key per job, logs in the SIEM'],
            ]) + H.note('it', 'Add the gateways, providers and free tiers your team actually uses to the <b>provider inventory</b> with an owner and a review date. That list is what lets us answer “where did that prompt go?”.'),
            n: 'Finish by making the decision table ours: agree on three rows with the policy owner. It connects this optional module back to the T0 to T3 tiers and the capstone in Module 13.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'OpenRouter, OmniRoute and 9router all sit in which layer?', a: ['Harness', 'Gateway / router', 'Orchestrator', 'Model'], c: 1, why: 'They sit between a harness and the providers: one endpoint, routing, fallback, keys and logs.' },
      { q: 'What does it mean that DeepSeek Harness is built on “everything is a plugin”?', a: ['It only runs inside a browser', 'The model adapter, tools, session log and even the agent loop are replaceable plugins', 'It has no sandbox', 'It cannot call tools'], c: 1, why: 'There is no privileged core to patch: you mount another plugin beside the one you want to change.' },
      { q: 'DeepSeek Harness is labelled a developer preview. What follows for us?', a: ['Use it on production servers', 'Try it only in a disposable VM and do not treat it as the only security control', 'It is the same as a stable release', 'Disable the sandbox'], c: 1, why: 'Its own safety notice says it has not been audited: use least privilege, a disposable environment and backups.' },
      { q: 'In OpenCode permission rules, which rule wins when several match?', a: ['The first match', 'The most permissive match', 'The last matching rule', 'A random one'], c: 2, why: 'Rules are evaluated by pattern and the last matching rule wins, so put the catch-all first and specific rules after it.' },
      { q: 'What does Orca add by giving each agent its own git worktree?', a: ['Faster models', 'Parallel agents can edit the same repository without overwriting each other', 'Automatic approval of every change', 'Free tokens'], c: 1, why: 'A worktree is a separate checkout, so agents work in parallel and you compare and merge the winner.' },
      { q: 'You fan a task out to six agents. What is the main cost that grows linearly with N?', a: ['The gateway port', 'Model spend and, above all, your review time', 'The number of providers', 'Nothing'], c: 1, why: 'The chance of a good result grows with diminishing returns, while spend and review time grow with every extra run.' },
      { q: 'You must make sure internal data is never sent to a provider that keeps or trains on prompts. Which routing setting helps most?', a: ['sort: latency', 'data_collection: deny, plus an only list of approved providers', 'allow_fallbacks: true', 'order: []'], c: 1, why: 'These decide where a prompt may go at all. If nothing matches, the request fails instead of going somewhere unapproved.' },
      { q: 'You point Claude Code at a local gateway. How do you set the base URL?', a: ['http://127.0.0.1:20128/v1 in ANTHROPIC_BASE_URL', 'http://127.0.0.1:20128 in ANTHROPIC_BASE_URL (Claude Code adds /v1/messages)', 'In the committed .claude/settings.json with the key', 'You cannot use a gateway'], c: 1, why: 'Claude Code appends /v1/messages itself, and the credential belongs in your shell or user settings, never in a committed project file.' },
      { q: 'Which is the biggest problem with running a shared gateway that pools personal subscriptions and free tiers for company work?', a: ['It is too fast', 'Provider terms usually forbid it, data may be logged or trained on, and every key sits in one unreviewed service', 'It uses too little memory', 'It needs a GPU'], c: 1, why: 'Terms, data handling and key concentration are policy and security problems that a convenient endpoint does not remove.' },
      { q: 'A provider does not serve your country. What should the course policy be?', a: ['Route around it with any proxy that works', 'Use local models, providers that serve your region, or an approved cloud platform, and ask legal', 'Borrow someone else\'s account', 'Ignore the terms'], c: 1, why: 'Region limits are the provider\'s access control, often legal. Legitimate alternatives exist and keep company data on reviewed paths.' },
    ],
  });
})();
