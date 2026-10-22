(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm8', num: 8, title: 'Coding agents: Claude Code and Codex',
    summary: 'Claude Code and OpenAI Codex on the desktop and in the terminal: install, fundamentals, safety modes, building your own agents, automation, computer use, and how infrastructure teams use them.',
    deck: [26, 48, 51, 52],
    outcomes: [
      'Explain how a coding agent plans, edits, runs and verifies code',
      'Install Claude Code and Codex (desktop app and CLI) and run a first safe session',
      'Choose the right permission mode, sandbox and approval settings for a task',
      'Extend both tools with project instructions, skills, MCP servers and subagents',
      'Build a small custom agent with the Claude Agent SDK and automate runs with headless mode, CI and schedules',
      'Describe how computer use and browser control work and when to allow them',
    ],
    lessons: [
      {
        id: 'm8-1', title: 'How coding agents work', mins: 15, deck: [26],
        slides: [
          {
            t: 'A coding agent is an agent whose environment is a repository',
            b: H.split(
              H.fig(D.cycle([
                { t: 'Read', s: 'search files, docs', c: 'tl' },
                { t: 'Plan', s: 'todo list' },
                { t: 'Edit', s: 'patch files', c: 'acc' },
                { t: 'Run', s: 'tests, linters', c: 'tl' },
                { t: 'Fix', s: 'until green' },
              ], { t: 'Task', s: 'issue or request' })),
              H.prose(
                '<b>Brain:</b> a strong coding model: Claude (Opus, Sonnet), OpenAI GPT Codex models, Gemini, or open models such as Qwen3-Coder, GLM, Kimi or DeepSeek.',
                '<b>Tools:</b> read and search files, edit with precise patches, run shell commands, run tests, use git, browse docs, MCP servers.',
                '<b>Loop:</b> the same think-act-observe loop, with tests as the main way to observe whether it worked.'
              )
            ),
            n: 'The key line: tests are how a coding agent sees whether it worked. That is why test-driven development fits agents so well. Ask the developers in the room how much of their code has tests today.',
          },
          {
            t: 'The leading coding agents',
            b: H.table(['Tool', 'Where it runs', 'Notes'], [
              ['Claude Code', 'Terminal (CLI), desktop app, VS Code and JetBrains, web (cloud sessions)', 'Anthropic. Permission modes, skills, subagents, hooks, MCP, plugins, Agent SDK'],
              ['OpenAI Codex', 'Terminal (CLI), Codex app (macOS, Windows), IDE extension, Codex Cloud', 'OpenAI. Sandbox plus approval policy, AGENTS.md, skills, MCP, automations'],
              ['Cursor', 'VS Code-based IDE', 'Agent mode inside the editor; many model choices'],
              ['GitHub Copilot', 'IDE agent mode + cloud coding agent on issues/PRs', 'Assign a GitHub issue to Copilot and get a PR'],
              ['Gemini CLI', 'Terminal', 'Google, open source, large context'],
            ]) + H.note('tip', 'They all read a project instruction file: <code>CLAUDE.md</code> for Claude Code, <code>AGENTS.md</code> for Codex and most others. Hermes reads these too. One well-written instruction file per repo helps every agent.'),
            n: 'Do not compare features in detail; they change monthly. This module goes deep on the two we use: Claude Code and Codex. Point out the shared idea: they all read a project instruction file.',
          },
          {
            t: 'Claude Code and Codex side by side',
            b: H.table(['Concept', 'Claude Code', 'Codex'], [
              ['Project instructions', '<code>CLAUDE.md</code> (repo, subfolders, <code>~/.claude/CLAUDE.md</code>)', '<code>AGENTS.md</code> (repo, subfolders, <code>~/.codex/AGENTS.md</code>)'],
              ['Settings file', '<code>.claude/settings.json</code>, <code>~/.claude/settings.json</code>', '<code>~/.codex/config.toml</code> (+ profiles)'],
              ['Safety controls', 'Permission modes + allow/ask/deny rules + optional Bash sandbox', 'Sandbox mode + approval policy'],
              ['Skills', '<code>.claude/skills/&lt;name&gt;/SKILL.md</code>', '<code>.agents/skills/&lt;name&gt;/SKILL.md</code>'],
              ['MCP servers', '<code>claude mcp add</code>, <code>.mcp.json</code>', '<code>codex mcp add</code>, <code>[mcp_servers]</code> in config.toml'],
              ['Non-interactive', '<code>claude -p "…"</code>', '<code>codex exec "…"</code>'],
              ['Desktop app', 'Claude Desktop, Code tab', 'Codex app (<code>codex app</code>)'],
              ['Scheduling', 'Cloud scheduled tasks, Desktop scheduled tasks, <code>/loop</code>', 'Automations in the Codex app'],
              ['Computer use', 'Desktop (macOS, Windows) and CLI (macOS), research preview', 'Computer Use plugin in the Codex app (macOS)'],
            ]),
            n: 'Use this table as the map for the whole module. The concepts are the same; only the file names and flags differ. If people learn one tool well, the second takes an hour.',
          },
        ],
      },
      {
        id: 'm8-2', title: 'Claude Code: install, desktop and CLI', mins: 25, deck: [48, 51], lab: true,
        slides: [
          {
            t: 'Install Claude Code',
            b: H.split(
              H.code('# macOS / Linux / WSL (native installer, auto-updates)\ncurl -fsSL https://claude.ai/install.sh | bash\n\n# Windows PowerShell\nirm https://claude.ai/install.ps1 | iex\n\n# or a package manager\nbrew install --cask claude-code        # macOS\nwinget install Anthropic.ClaudeCode    # Windows\n\n# start in a repo and sign in\ncd ~/repos/infra-scripts\nclaude', 'bash', 'CLI install'),
              H.prose(
                '<b>Sign-in:</b> a Claude subscription (Pro, Max, Team, Enterprise) or an Anthropic Console API key. Organisations can also route through Amazon Bedrock, Google Vertex AI or Microsoft Foundry.',
                '<b>Desktop:</b> install the Claude desktop app (macOS, Windows) and open the <b>Code</b> tab. It runs the same engine with a graphical interface: diffs, a mode selector, parallel sessions and scheduled tasks.',
                '<b>IDE:</b> VS Code and JetBrains extensions show diffs inline. <b>Web:</b> cloud sessions at <code>claude.ai/code</code> run in a managed container on a GitHub repo.'
              )
            ),
            n: 'Install it live on your own machine. Point out that the native installer auto-updates. If the room has Windows users, show the PowerShell line; WSL also works.',
          },
          {
            t: 'One engine, four surfaces',
            b: H.fig(D.hub({ t: 'Claude Code', s: 'same agent loop', c: 'acc' }, [
              { t: 'Terminal CLI', s: 'claude', c: 'tl' },
              { t: 'Desktop app', s: 'Code tab' },
              { t: 'IDE extension', s: 'VS Code, JetBrains', c: 'tl' },
              { t: 'Web / cloud', s: 'claude.ai/code' },
              { t: 'CI / scripts', s: 'claude -p, Agent SDK', c: 'ok' },
            ])) + H.note('tip', 'The desktop app can run a session on your machine (Local), in a cloud container (Cloud), on a remote host over SSH, or in WSL. Pick SSH to work on a lab jump host without installing anything there yourself.'),
            n: 'Settings, CLAUDE.md, skills and MCP servers are shared between the CLI, the IDE and the desktop app on the same machine. Learn once, use everywhere.',
          },
          {
            t: 'Your first session',
            b: H.split(
              H.code('/init            # writes a CLAUDE.md describing the repo\n/help            # all commands\n/permissions     # see and edit allow / deny rules\n/model           # choose the model\n/mcp             # connect and manage MCP servers\n/agents          # create and manage subagents\n/memory          # edit CLAUDE.md files\n/compact         # summarise a long conversation\n/clear           # start fresh\n\nShift+Tab        # cycle permission modes\nEsc              # stop the current action\nEsc Esc          # rewind to an earlier point\n@path/file       # attach a file to the prompt\n!command         # run a shell command yourself', 'text', 'commands and keys'),
              H.prose(
                'Work in a <b>git repository</b> so every change is a diff you can review and revert.',
                'Start read-only: <i>“Explain what this repo does and list scripts that touch Active Directory.”</i>',
                'Then a small, testable change: <i>“Add a -WhatIf switch to Disable-StaleAccounts.ps1 and a Pester test for it.”</i>',
                'Review the diff, run the tests yourself, commit.'
              )
            ),
            n: 'Demo live: run /init, ask it to explain the repo, then make one small change with a test. Keep it under 10 minutes. Show Esc to stop and Shift+Tab to change modes.',
          },
        ],
      },
      {
        id: 'm8-3', title: 'Claude Code fundamentals: memory, modes and permissions', mins: 25, deck: [48, 51],
        slides: [
          {
            t: 'CLAUDE.md: the project memory',
            b: H.split(
              H.code('# CLAUDE.md\n## Repo: infra-scripts\n- PowerShell 7 scripts for AD and file servers; Ansible in /ansible\n- Run tests: `Invoke-Pester ./tests` and `ansible-lint ansible/`\n- Every script MUST support -WhatIf and write a log to C:\\Logs\\scripts\n- NEVER run terraform apply or ansible-playbook; humans apply after review\n- Hostnames: *.lab.acme.local only in examples, never production names\n\n@docs/naming-standard.md', 'markdown', 'CLAUDE.md'),
              H.prose(
                'Loaded at the start of every session. Keep it short and specific: how to build and test, conventions, what never to touch.',
                '<b>Levels:</b> organisation-managed policy, your user file <code>~/.claude/CLAUDE.md</code>, the project file in the repo, and files in subfolders that load when the agent works there.',
                '<code>@path</code> imports another file. <b>Auto memory</b> also lets Claude save its own notes (build commands, debugging insights) across sessions; manage both with <code>/memory</code>.'
              )
            ),
            n: 'Ask: what would you tell a new colleague on day one about this repo? That is the CLAUDE.md. Commit it so the whole team shares it.',
          },
          {
            t: 'Permission modes: how much the agent may do without asking',
            b: H.table(['Mode', 'Runs without asking', 'Use it for'], [
              ['Manual (<code>default</code>)', 'Reads only', 'Sensitive work, unfamiliar code'],
              ['<code>acceptEdits</code>', 'Reads, file edits and common filesystem commands', 'Iterating on code you review as a diff'],
              ['<code>plan</code>', 'Reads; edits blocked until you approve a plan', 'Exploring before changing anything'],
              ['<code>auto</code>', 'Everything, with background safety checks by a classifier', 'Long tasks, fewer prompts (if your organisation allows it)'],
              ['<code>dontAsk</code>', 'Only pre-approved tools; everything else is denied', 'Locked-down CI and scripts'],
              ['<code>bypassPermissions</code>', 'Everything', 'Isolated containers and VMs only'],
            ]) + H.note('warn', 'Switch with <kbd>Shift+Tab</kbd>, the mode selector in the desktop app, or <code>claude --permission-mode plan</code>. <code>bypassPermissions</code> (<code>--dangerously-skip-permissions</code>) belongs only in a disposable container or VM, never on your workstation or a server.'),
            n: 'Walk the table from top to bottom: each row trades oversight for speed. Plan mode is the best default for infrastructure repos you do not know yet.',
          },
          {
            t: 'Pick the right mode',
            b: H.widget('modes'),
            n: 'Click through each situation and ask the room to guess before revealing. The point: the mode follows the risk of the task and where it runs, not personal preference.',
          },
          {
            t: 'Rules, sandbox and guardrails for an infrastructure repo',
            b: H.split(
              H.code('{\n  "permissions": {\n    "allow": [\n      "Bash(git diff *)", "Bash(git status)",\n      "Bash(ansible-lint *)", "Bash(terraform validate)",\n      "Bash(terraform plan *)", "Bash(Invoke-Pester *)"\n    ],\n    "ask": [ "Bash(git push *)" ],\n    "deny": [\n      "Bash(terraform apply *)", "Bash(ansible-playbook *)",\n      "Read(./.env)", "Read(./secrets/**)"\n    ]\n  },\n  "sandbox": { "enabled": true }\n}', 'json', '.claude/settings.json'),
              H.prose(
                '<b>Rules</b> are checked in order: deny wins over ask, ask wins over allow. Commit the project file so the team shares the guardrails; personal overrides go in <code>.claude/settings.local.json</code>.',
                '<b>Sandbox:</b> <code>/sandbox</code> runs Bash commands with operating-system isolation (macOS, Linux, WSL2): writes only inside the project, network only to allowed domains.',
                '<b>Managed settings</b> let IT enforce rules for every user on a machine; users cannot override them.'
              )
            ) + H.note('key', 'The agent writes and tests code. <b>Humans review the diff and apply it to production</b> through the normal change process.'),
            n: 'Read the deny list aloud: terraform apply, ansible-playbook. The agent writes and tests; humans apply. This is the same “agent proposes, pipeline disposes” pattern we use for network changes in Module 12.',
          },
        ],
      },
      {
        id: 'm8-4', title: 'Codex: install, desktop app and CLI', mins: 25, deck: [48, 51], lab: true,
        slides: [
          {
            t: 'Install Codex',
            b: H.split(
              H.code('# macOS / Linux\ncurl -fsSL https://chatgpt.com/codex/install.sh | sh\n\n# Windows PowerShell\npowershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"\n\n# or a package manager\nnpm install -g @openai/codex\nbrew install --cask codex\n\n# first run: choose "Sign in with ChatGPT" (or an API key)\ncd ~/repos/infra-scripts\ncodex\n\ncodex app        # open the desktop app\ncodex doctor     # check install, config and auth', 'bash', 'CLI install'),
              H.prose(
                '<b>Sign-in:</b> a ChatGPT plan (Plus, Pro, Business, Edu, Enterprise) or an OpenAI API key.',
                '<b>Codex app</b> (macOS and Windows): a desktop command centre for several agents at once. Each thread runs <b>Local</b> (your folder), in a <b>Worktree</b> (an isolated git worktree) or in <b>Cloud</b>.',
                '<b>Also:</b> an IDE extension for VS Code, Cursor and Windsurf, and Codex Cloud at <code>chatgpt.com/codex</code> for tasks that run in OpenAI-hosted containers.'
              )
            ),
            n: 'Same story as Claude Code: one engine, many surfaces. Worktree mode is worth explaining: each agent works on its own copy of the branch, so parallel agents do not overwrite each other.',
          },
          {
            t: 'Your first Codex session',
            b: H.split(
              H.code('/init            # writes an AGENTS.md for the repo\n/permissions     # choose what Codex may do\n/plan            # switch to Plan mode\n/model          # model and reasoning effort\n/diff            # show the git diff\n/review          # review your current changes\n/skills          # list and use skills\n/mcp             # list MCP tools, /mcp login <name>\n/compact         # summarise a long conversation\n/status          # config and token usage\n/resume          # continue a saved chat\n\n@file            # mention a file\n$skill-name      # use a skill', 'text', 'commands'),
              H.prose(
                'The flow is the same as in Claude Code: start in a git repo, ask a read-only question first, then a small change with a test.',
                '<b>In the app:</b> choose the project folder, pick Local or Worktree, type the task. Review the diff in the app and commit, or open a PR.',
                '<code>codex resume --last</code> continues your latest session; <code>codex review --base main</code> reviews a branch without an interactive session.'
              )
            ),
            n: 'Do the same live demo as for Claude Code, on the same repo: /init, explain the repo, one small change with a test. The class sees that the habits transfer.',
          },
          {
            t: 'Codex safety: sandbox mode + approval policy',
            b: H.split(
              H.table(['Setting', 'Values', 'Meaning'], [
                ['Sandbox <code>-s</code>', '<code>read-only</code>', 'Can read; cannot write files or use the network'],
                ['', '<code>workspace-write</code>', 'Can edit inside the workspace; network off unless enabled'],
                ['', '<code>danger-full-access</code>', 'No sandbox. Only inside an isolated container or VM'],
                ['Approval <code>-a</code>', '<code>on-request</code>', 'The model asks you when it needs to go beyond the sandbox'],
                ['', '<code>never</code>', 'Never asks; failures go back to the model. For automation'],
                ['', '<code>untrusted</code>', 'Asks before commands that are not known to be safe'],
              ]),
              H.prose(
                'Codex separates <b>what is technically possible</b> (the operating-system sandbox) from <b>when it asks you</b> (the approval policy). Both matter.',
                'Switch in a session with <code>/permissions</code>, or start with flags: <code>codex -s workspace-write -a on-request</code>.',
                '<code>--yolo</code> (<code>--dangerously-bypass-approvals-and-sandbox</code>) removes both. Treat it exactly like Claude Code\'s bypass mode: containers only.'
              )
            ),
            n: 'Map it to Claude Code: read-only + on-request is like plan or Manual; workspace-write + on-request is like acceptEdits with a sandbox; never + workspace-write is like dontAsk for CI.',
          },
          {
            t: 'config.toml and AGENTS.md',
            b: H.split(
              H.code('# ~/.codex/config.toml\n# model = "…"   (choose with /model)\nsandbox_mode = "workspace-write"\napproval_policy = "on-request"\n\n[sandbox_workspace_write]\nnetwork_access = false\n\n# a stricter profile: codex -p review\n[profiles.review]\nsandbox_mode = "read-only"\n\n[mcp_servers.netbox]\ncommand = "netbox-mcp"\nargs = ["--read-only"]\nenv = { NETBOX_URL = "https://netbox.lab.acme.local" }', 'toml', '~/.codex/config.toml'),
              H.code('# AGENTS.md\n## Repo: infra-scripts\n- Tests: `Invoke-Pester ./tests`, `ansible-lint ansible/`\n- Every script supports -WhatIf and logs to C:\\Logs\\scripts\n- NEVER run terraform apply or ansible-playbook\n- Use *.lab.acme.local in examples, never production names\n- Done means: tests pass, lint clean, diff explained', 'markdown', 'AGENTS.md')
            ) + H.note('tip', 'Codex reads <code>AGENTS.md</code> from <code>~/.codex/</code>, the repo root and the folders down to where it works; closer files win. Keep <code>CLAUDE.md</code> and <code>AGENTS.md</code> in sync, or make one import the other, so every agent gets the same rules.'),
            n: 'Model names change often, so the model line is left as a comment; choose it with /model. The important lines are sandbox_mode and approval_policy: these are your defaults for every session.',
          },
        ],
      },
      {
        id: 'm8-5', title: 'Extend them: skills, MCP, subagents and plugins', mins: 25, deck: [51],
        slides: [
          {
            t: 'Four ways to extend a coding agent',
            b: H.cards([
              ['Skills', 'A folder with <code>SKILL.md</code>: instructions, scripts and templates loaded only when relevant. Same open format in Claude Code, Codex and Hermes.', 'procedures'],
              ['MCP servers', 'Connect GitHub, Jira, NetBox, databases and internal APIs as tools. Enable only what a task needs.', 'tools'],
              ['Subagents', 'Specialist helpers with their own context window, tools and prompt. Only their summary returns.', 'delegation'],
              ['Plugins', 'A bundle of skills, subagents, hooks and MCP servers that a team installs in one step from a marketplace.', 'sharing'],
            ]),
            n: 'Connect each card to earlier modules: skills (Module 9), MCP (Module 7), subagents (Module 10). Plugins are how a platform team ships the whole package to everyone.',
          },
          {
            t: 'One skill, two agents',
            b: H.split(
              H.code('---\nname: change-request\ndescription: Draft a change request for an infrastructure\n  change. Use when the user asks for a CHG, CAB entry or\n  maintenance plan.\n---\n\n# Change request\n1. Collect: scope, affected CIs, window, owner.\n2. Fill templates/chg.md. Risk rating: use risk-matrix.md.\n3. Rollback plan is mandatory; refuse to finish without one.\n4. Output the CHG text and a checklist for the CAB.', 'markdown', 'SKILL.md'),
              H.prose(
                '<b>Claude Code:</b> save as <code>.claude/skills/change-request/SKILL.md</code> (project) or <code>~/.claude/skills/</code> (personal). Run it with <code>/change-request</code> or let Claude pick it from the description.',
                '<b>Codex:</b> save as <code>.agents/skills/change-request/SKILL.md</code> in the repo. Invoke it with <code>$change-request</code> or let Codex pick it.',
                'Only the name and description sit in the context until the skill is needed: dozens of skills cost almost nothing.'
              )
            ),
            n: 'This is the reuse story: write a skill once for the team\'s procedure and every agent can use it. The description is what triggers it, so write it like a search query.',
          },
          {
            t: 'Add MCP servers',
            b: H.split(
              H.code('# Claude Code\nclaude mcp add --transport http github https://api.githubcopilot.com/mcp/\nclaude mcp add netbox -- netbox-mcp --read-only\nclaude mcp list\n# share with the team: --scope project writes .mcp.json\n\n# Codex\ncodex mcp add netbox -- netbox-mcp --read-only\ncodex mcp add docs --url https://mcp.acme.local/docs\ncodex mcp list', 'bash', 'MCP'),
              H.prose(
                'The syntax is almost identical: a name, then the command that starts the server after <code>--</code>, or a URL for a remote server.',
                'Prefer <b>read-only</b> servers and accounts. Every tool you add is also a new path for prompt injection (Module 11).',
                'Inside a session: <code>/mcp</code> in both tools shows status and handles OAuth sign-in.'
              )
            ),
            n: 'Show /mcp live. Then point at the read-only flag: our rule is that MCP servers for production systems start read-only, and write tools are added later through review.',
          },
          {
            t: 'Make your own subagents',
            b: H.split(
              H.code('---\nname: log-analyst\ndescription: Analyses large log files and returns a short\n  summary of errors and likely causes. Use for any log\n  over 500 lines.\ntools: Read, Grep, Glob\nmodel: haiku\n---\n\nYou are a log analyst for an IT operations team.\nFind distinct errors, count them, give first and last\ntimestamps, and group them by likely root cause.\nReturn at most 15 lines. Never suggest changes.', 'markdown', '.claude/agents/log-analyst.md'),
              H.prose(
                'A subagent is a Markdown file: frontmatter for <b>name, description, tools, model</b>; the body is its system prompt.',
                'Claude delegates automatically when the description matches, or you ask: <i>“Use the log-analyst on /var/log/nginx/error.log.”</i>',
                'Why: the noisy work happens in the subagent\'s own context window; only the summary comes back. Restrict <code>tools</code> to keep it read-only.',
                'Create them interactively with <code>/agents</code>. Codex can spawn subagents too, and its app runs several agents in parallel worktrees.'
              )
            ),
            n: 'Build one live with /agents. Restricting tools to Read, Grep, Glob is the important habit: an analyst never needs Edit or Bash.',
          },
        ],
      },
      {
        id: 'm8-6', title: 'Build agents with the Claude Agent SDK', mins: 25, deck: [51], lab: true,
        slides: [
          {
            t: 'The Agent SDK: Claude Code as a library',
            b: H.split(
              H.prose(
                'The <b>Claude Agent SDK</b> (Python and TypeScript) gives your own programs the same agent loop, tools, context management, permissions, MCP, skills and subagents that power Claude Code.',
                'Use it when a chat session is not the right shape: an internal bot, a scheduled report generator, a triage service, a tool inside your own portal.',
                'Install: <code>pip install claude-agent-sdk</code> or <code>npm install @anthropic-ai/claude-agent-sdk</code>. Authenticate with <code>ANTHROPIC_API_KEY</code>.'
              ),
              H.fig(D.flow([
                { t: 'Your program', s: 'trigger, input', c: 'tl' },
                { t: 'query()', s: 'agent loop', c: 'acc' },
                { t: 'Tools', s: 'Read, Bash, MCP' },
                { t: 'Result', s: 'report, PR, ticket', c: 'ok' },
              ]))
            ),
            n: 'This is the bridge from “using an agent” to “building an agent”. Everything they learned in Claude Code (allowed tools, modes, MCP) appears again as options in code.',
          },
          {
            t: 'A minimal disk-report agent',
            b: H.split(
              H.code('import asyncio\nfrom claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage\n\nPROMPT = """Read reports/disk-*.csv. List servers above 85% on any\nvolume, sorted by usage. For each, suggest one safe cleanup step.\nWrite the result to reports/disk-summary.md. Do not run commands."""\n\nasync def main():\n    async for msg in query(\n        prompt=PROMPT,\n        options=ClaudeAgentOptions(\n            allowed_tools=["Read", "Glob", "Write"],\n            permission_mode="acceptEdits",\n            cwd="/srv/ops",\n        ),\n    ):\n        if isinstance(msg, ResultMessage):\n            print("Done:", msg.subtype)\n\nasyncio.run(main())', 'python', 'disk_agent.py'),
              H.prose(
                '<code>allowed_tools</code> is the agent\'s whole toolbox: here it can read and write files but has no shell.',
                '<code>permission_mode="acceptEdits"</code> lets it write the report without prompting, because nobody is watching.',
                'Add MCP servers, subagents and a system prompt through the same options object. The TypeScript SDK has the same shape.'
              )
            ),
            n: 'Run it on sample CSV files if you have time. Ask: what would you change to let it open a ticket? Answer: add a ticketing MCP server, not Bash.',
          },
          {
            t: 'Codex as a building block',
            b: H.split(
              H.code('# one-shot, read-only, machine-readable\ncodex exec -s read-only \\\n  --output-schema schema.json \\\n  -o result.json \\\n  "Classify the tickets in tickets.csv by team and urgency"\n\n# stream every event as JSON lines\ncodex exec --json "Summarise the failing tests" > events.jsonl\n\n# code review without a person at the keyboard\ncodex review --base main', 'bash', 'codex exec'),
              H.prose(
                '<code>codex exec</code> runs one task non-interactively and exits: ideal inside scripts and pipelines.',
                '<code>--output-schema</code> forces the final answer into your JSON Schema, so the next script can parse it. <code>-o</code> writes the final message to a file.',
                'For deeper integration OpenAI offers a Codex SDK; check the current Codex docs before you build on it.'
              )
            ),
            n: 'Structured output is the key to automation. A script cannot read “Sure! Here are the results…”; it can read JSON that matches a schema.',
          },
        ],
      },
      {
        id: 'm8-7', title: 'Automate: headless runs, hooks, CI and schedules', mins: 30, deck: [52],
        slides: [
          {
            t: 'Headless mode: agents in scripts',
            b: H.split(
              H.code('# Claude Code\nclaude -p "Summarise today\'s failed backups from backup.log" \\\n  --allowedTools "Read" \\\n  --output-format json\n\n# exact allowlist, everything else denied (CI)\nclaude -p "Run the Pester tests and fix failures" \\\n  --permission-mode dontAsk \\\n  --allowedTools "Read" "Edit" "Bash(Invoke-Pester *)"\n\n# pipe data in\ncat audit.log | claude -p "List failed sudo attempts by user"\n\n# Codex\ncodex exec -s read-only "Summarise today\'s failed backups"', 'bash', 'non-interactive'),
              H.prose(
                '<code>-p</code> (print) runs one prompt and exits. Combine it with cron, a CI job, a monitoring webhook or a PowerShell scheduled task.',
                'Always pass an explicit <b>allowlist</b>. Nobody is there to answer a prompt, so anything not allowed is refused.',
                '<code>--output-format json</code> or <code>stream-json</code> give machine-readable output. <code>--bare</code> skips loading local hooks, skills and MCP for faster, reproducible CI runs.'
              )
            ),
            n: 'Ask each team to name one report they build by hand every week. That is their first headless job.',
          },
          {
            t: 'Hooks: your rules, enforced by code',
            b: H.split(
              H.code('{\n  "hooks": {\n    "PreToolUse": [{\n      "matcher": "Edit|Write",\n      "hooks": [{ "type": "command",\n        "command": "\\"$CLAUDE_PROJECT_DIR\\"/.claude/hooks/protect-prod.sh" }]\n    }],\n    "PostToolUse": [{\n      "matcher": "Edit|Write",\n      "hooks": [{ "type": "command",\n        "command": "npx prettier --write \\"$(jq -r .tool_input.file_path)\\"" }]\n    }]\n  }\n}', 'json', '.claude/settings.json'),
              H.code('#!/bin/bash\n# protect-prod.sh: block edits to production inventories\nfile=$(jq -r \'.tool_input.file_path // empty\')\ncase "$file" in\n  *inventories/prod/*|*.env|*secrets/*)\n    echo "Blocked: $file is protected. Change it through a CHG." >&2\n    exit 2 ;;\nesac\nexit 0', 'bash', '.claude/hooks/protect-prod.sh')
            ) + H.note('key', 'A hook is <b>deterministic</b>: it runs every time, whatever the model decides. Exit code 2 from a <code>PreToolUse</code> hook blocks the action and sends your message back to Claude. Codex has lifecycle hooks too, and admins can allow managed hooks only.'),
            n: 'Instructions in CLAUDE.md are requests; hooks are enforcement. Security people in the room will like this slide: it is a policy enforcement point you write yourself.',
          },
          {
            t: 'Agents in GitHub: @claude and automatic reviews',
            b: H.split(
              H.code('name: Claude\non:\n  issue_comment: { types: [created] }\n  pull_request_review_comment: { types: [created] }\npermissions:\n  contents: write\n  pull-requests: write\n  issues: write\n  id-token: write\n  actions: read\njobs:\n  claude:\n    if: contains(github.event.comment.body, \'@claude\')\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: anthropics/claude-code-action@v1\n        with:\n          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}', 'yaml', '.github/workflows/claude.yml'),
              H.prose(
                'Fastest setup: run <code>/install-github-app</code> inside Claude Code. It installs the GitHub app and adds the workflow and secret.',
                'Then write <i>“@claude fix the failing Pester test”</i> in an issue or PR comment and Claude pushes a commit or opens a PR.',
                'The same action can review every new PR automatically. Codex offers GitHub code review and an action for <code>codex exec</code> as well.',
                'The agent proposes through a PR; <b>branch protection and human review</b> still decide what merges.'
              )
            ),
            n: 'This is “agent proposes, pipeline disposes” in practice. Point out the permissions block: give the workflow only what it needs.',
          },
          {
            t: 'Scheduled agents: which option where',
            b: H.table(['Option', 'Runs on', 'Machine on?', 'Good for'], [
              ['Claude cloud scheduled tasks (<code>/schedule</code>, <code>claude.ai/code/routines</code>)', 'Anthropic cloud, fresh clone of your repo', 'No', 'Nightly backlog triage, PR review on every PR, API or GitHub-event triggers'],
              ['Claude Desktop scheduled tasks', 'Your machine', 'Yes, app open', 'Jobs that need local files and tools: daily report from a share'],
              ['<code>/loop 10m …</code>', 'Your open session', 'Yes, session open', 'Polling a deploy or a long job while you work'],
              ['Codex app automations', 'Your machine (local folder or background worktree)', 'Yes', 'Recurring tasks with a prompt + skills; results land in a review queue'],
              ['cron / Task Scheduler + <code>claude -p</code> or <code>codex exec</code>', 'Any server you control', 'Yes', 'Full control, your own logging and secrets'],
            ]) + H.note('warn', 'Unattended runs have nobody to approve a risky step. Give them read-only tools, an explicit allowlist, and an output that a person reviews: a report, a draft ticket or a PR.'),
            n: 'Match the option to where the data lives. Cloud tasks cannot see your laptop; desktop tasks stop when your laptop sleeps; cron on a jump host is the most controllable for our infrastructure.',
          },
        ],
      },
      {
        id: 'm8-8', title: 'Computer use: agents that see and click', mins: 20, deck: [52],
        slides: [
          {
            t: 'How an agent uses your computer',
            b: H.split(
              H.fig(D.cycle([
                { t: 'Screenshot', s: 'see the screen', c: 'tl' },
                { t: 'Decide', s: 'model reasons' },
                { t: 'Act', s: 'click, type, scroll', c: 'acc' },
                { t: 'Check', s: 'new screenshot' },
              ], { t: 'Computer use', s: 'GUI agent loop' })),
              H.prose(
                'The model receives screenshots and returns mouse and keyboard actions. It is the same agent loop, with the screen as the environment.',
                'Use it for things nothing else can reach: <b>GUI-only tools</b>, vendor consoles without an API, desktop apps, simulators, visual checks.',
                'It is the <b>slowest and broadest</b> tool. Agents prefer an MCP server first, then the shell, then the browser, and use the screen last.'
              )
            ),
            n: 'Stress the order of preference: API or MCP, then shell, then browser, then screen. Screen control is powerful but slow and the easiest to mislead.',
          },
          {
            t: 'Turn it on: Claude and Codex',
            b: H.table(['Where', 'How to enable', 'Platforms'], [
              ['Claude Desktop', 'Settings → enable computer use; grant permissions; approve each app', 'macOS, Windows (research preview, Pro and Max plans)'],
              ['Claude Code CLI', '<code>/mcp</code> → enable the built-in <code>computer-use</code> server; grant Accessibility and Screen Recording', 'macOS (research preview, Pro and Max plans; interactive sessions only)'],
              ['Claude in Chrome', 'Install the Chrome extension; Claude Code connects to it for browser tasks with your logins', 'Chrome, Edge and other Chromium browsers'],
              ['Codex app', 'Install the Computer Use plugin in Codex settings; grant Screen Recording and Accessibility', 'macOS (not in the EEA, UK or Switzerland at launch)'],
            ]) + H.note('tip', 'Availability changes quickly. Check the current Claude and Codex docs before you plan a lab around computer use.'),
            n: 'Do not promise features to the class; show what works on the demo machine today. Browser control is usually the most useful part for helpdesk and web teams.',
          },
          {
            t: 'Guardrails for computer use',
            b: H.split(
              H.steps([
                ['Approve per app, per session', 'Claude asks which apps it may control. Terminals and IDEs are flagged as “equivalent to shell access”, Finder as “can read or write any file”.'],
                ['Watch, and stop with Esc', 'Press Esc anywhere to stop at once. Only one session can control the machine at a time.'],
                ['Treat the screen as untrusted input', 'Web pages, emails and documents on screen can carry prompt injection. Never let it act on a page you would not trust a stranger to read to you.'],
                ['Use a separate account or VM', 'No password manager, no admin consoles for production, no banking in the session it controls.'],
                ['Prefer APIs when they exist', 'An MCP server or CLI is faster, auditable and far harder to mislead than clicking.'],
              ]),
              H.note('warn', 'Computer use runs on your <b>real desktop</b>, outside the Bash sandbox. Our policy: allowed on lab machines and test VMs; not on machines with production admin sessions.')
            ),
            n: 'Connect to Module 11: the screen is just another untrusted input channel. The safe pattern is a dedicated test VM with nothing valuable signed in.',
          },
        ],
      },
      {
        id: 'm8-9', title: 'Coding agents for infrastructure teams', mins: 20, deck: [52],
        slides: [
          {
            t: 'Where coding agents pay off for us',
            b: H.cards([
              ['Scripts', 'PowerShell, Bash and Python for AD hygiene, reports and bulk changes, with -WhatIf and logging.', 'daily'],
              ['Infrastructure as code', 'Ansible roles, Terraform modules, network config templates (Jinja), with lint and plan in the loop.', 'IaC'],
              ['Agent tools', 'Write the MCP servers and CLIs that expose our systems to agents (Module 7).', 'platform'],
              ['Reviews', 'Review a colleague\'s PR, explain a legacy script, find hard-coded credentials.', 'quality'],
              ['Docs', 'Generate runbooks and READMEs from code, then turn them into skills.', 'docs'],
              ['Migration', 'Port VBScript or batch files to PowerShell 7 with tests.', 'debt'],
            ]),
            n: 'Ask each team for one script they have wanted to rewrite for years. That is the first coding-agent task. The “agent tools” card links back to Module 7.',
          },
          {
            t: 'Recipes by team',
            b: H.table(['Team', 'Task for Claude Code or Codex', 'Safe setup'], [
              ['Helpdesk', 'Turn the 20 most common tickets into KB articles and a triage skill', 'Plan mode, read-only ticket export, output as Markdown for review'],
              ['Network', 'Generate Jinja templates and a pre-check script from the standard config; diff against running configs', 'workspace-write, no device credentials, show commands only through the read-only wrapper'],
              ['Datacenter', 'Nightly capacity report from CSV exports (disk, power, rack space)', 'Headless run with Read + Write only, scheduled, report reviewed in the morning'],
              ['Web / dev', 'Fix a failing test, upgrade a dependency, review every PR', 'acceptEdits in a branch, GitHub Action, branch protection'],
              ['Security', 'Scan repos for secrets and risky patterns; draft the findings report', 'Read-only sandbox, results as a draft ticket, no auto-fix on production code'],
            ]),
            n: 'Let each team pick one row and write the first prompt together. These map to the playbooks in Module 12, which use Hermes for the operational side.',
          },
          {
            t: 'Team rules (our “contract” with coding agents)',
            b: H.split(
              H.steps([
                ['Use coding agents for new code and maintenance', 'Agents draft; engineers own and review every line.'],
                ['Test-driven development', 'Ask for the test first, see it fail, then the implementation. Tests are how the agent observes success.'],
                ['Everything through git and PRs', 'No agent pushes to main or applies to production.'],
                ['Least privilege by default', 'Plan or read-only to start; deny rules for apply and deploy; bypass modes only in disposable containers.'],
                ['Regular security checks', 'Scheduled scans (secrets, dependencies, SAST) and a periodic report on agent output quality.'],
                ['Shared instructions', 'One CLAUDE.md / AGENTS.md and team skills in the repo, reviewed like code.'],
              ]),
              H.note('it', 'This mirrors the deck\'s “Contracts” slide: require coding agents for development and maintenance, run interval security checks with reports, and practise test-driven development.')
            ),
            n: 'Present these as the proposed team rules from the original deck\'s Contracts slide. Ask whether anything is missing for our organisation and note it for the policy owner.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'What is the main way a coding agent “observes” whether its change worked?', a: ['It asks the user every time', 'It runs tests, linters and the code itself', 'It trusts its first answer', 'It reads the model card'], c: 1, why: 'Tests and tools give real feedback in the loop. That is why TDD works so well with agents.' },
      { q: 'Which files give Claude Code and Codex their project instructions?', a: ['README.txt and Makefile', 'CLAUDE.md for Claude Code, AGENTS.md for Codex', '.gitignore and package.json', 'settings.json for both'], c: 1, why: 'Both load a Markdown instruction file at start. Keep them in sync so every agent follows the same rules.' },
      { q: 'You open an unfamiliar infrastructure repo and want the agent to investigate before changing anything. Which setting fits?', a: ['bypassPermissions / --yolo', 'Plan mode in Claude Code, or read-only sandbox in Codex', 'auto mode with no rules', 'dontAsk with every tool allowed'], c: 1, why: 'Plan mode and the read-only sandbox let the agent read and propose without editing.' },
      { q: 'When is --dangerously-skip-permissions (or Codex --yolo) acceptable?', a: ['On your laptop to save time', 'On a production jump host', 'Only inside an isolated, disposable container or VM', 'Never in any situation'], c: 2, why: 'It removes every check. Isolation must then come from the container or VM itself.' },
      { q: 'Which Claude Code feature runs your own script before a tool call and can block it?', a: ['Skills', 'A PreToolUse hook', 'Subagents', 'Plan mode'], c: 1, why: 'Hooks are deterministic. Exit code 2 from a PreToolUse hook blocks the action.' },
      { q: 'A nightly job must read a local file share and write a report. Which scheduling option fits?', a: ['A cloud scheduled task, which runs on a fresh clone in the cloud', 'A Desktop scheduled task or cron with claude -p / codex exec on a machine that can reach the share', '/loop in a session you close at 6 pm', 'A GitHub issue comment'], c: 1, why: 'Cloud tasks cannot see local files. Desktop tasks or cron on a reachable machine can.' },
      { q: 'What is the safest first choice when an agent needs data from a system?', a: ['Computer use, clicking through the GUI', 'An API or MCP server with a read-only account', 'Sharing your admin password', 'Copying screenshots into the chat'], c: 1, why: 'APIs and MCP are faster, auditable and harder to mislead. Computer use is for GUI-only tools.' },
      { q: 'How should a coding agent touch production infrastructure?', a: ['Directly with terraform apply', 'It should not: it writes and tests code, humans review and apply through change management', 'Only at night', 'Through a shared admin account'], c: 1, why: 'Deny apply/deploy commands; production changes go through review and the change process.' },
    ],
  });
})();
