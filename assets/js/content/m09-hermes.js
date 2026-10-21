(function () {
  const { H, D } = window.ACADEMY;
  const LABVM = H.note('it', 'Lab VM: Ubuntu 24.04 LTS, 4 vCPU, 8 GB RAM, 40 GB disk, a normal (non-root) user, outbound HTTPS to your model provider and GitHub. Windows users can use WSL2 or the native PowerShell installer. Never use a domain-admin workstation.', 'Before you start');
  window.ACADEMY.module({
    id: 'm9', num: 9, title: 'Hermes Agent labs: install, tools, skills, memory, MCP, cron, gateway',
    summary: 'Ten hands-on labs with Hermes Agent by Nous Research: from a clean VM to a hardened IT assistant with custom skills, an MCP server, scheduled jobs and a chat gateway.',
    deck: [27, 49, 50],
    outcomes: ['Install, configure and troubleshoot Hermes Agent on a lab VM', 'Connect it to a cloud model or a local model with enough context', 'Configure toolsets and a sandboxed terminal backend', 'Write and install a SKILL.md from one of our runbooks', 'Add an MCP server, schedule a cron job and connect a chat gateway', 'Harden the setup with approvals, allowlists and least privilege'],
    lessons: [
      {
        id: 'm9-1', title: 'OpenClaw and Hermes: personal agent harnesses', mins: 15, deck: [27, 49, 50],
        slides: [
          {
            t: 'What OpenClaw and Hermes are',
            b: H.split(
              H.prose(
                '<b>OpenClaw</b> and <b>Hermes Agent</b> are open-source, self-hosted <b>AI assistant harnesses</b>. You install them on your own machine or server, plug in any model (API token or local), and talk to them from a terminal or from chat apps.',
                '<b>Hermes Agent</b> (Nous Research, MIT licence) adds a built-in <b>learning loop</b>: it writes skills from experience, keeps curated memory, searches its past sessions, and can migrate an existing OpenClaw setup (<code>hermes claw migrate</code>).',
                'We use Hermes in this course because it runs on Linux servers, supports local models, has sandboxed terminal backends, human approvals, MCP, cron and team features (profiles, kanban).'
              ),
              H.cards([
                ['Runs anywhere', 'Laptop, $5 VPS, GPU server; Linux, macOS, Windows, WSL2, Android (Termux).', 'deploy'],
                ['Any model', 'Nous Portal, OpenRouter, Anthropic, OpenAI, Bedrock, Azure, or Ollama/vLLM locally. Switch with <code>hermes model</code>.', 'models'],
                ['Lives in chat', 'Slack, Microsoft Teams, Telegram, Discord, email and more through one gateway.', 'channels'],
              ])
            ),
          },
          {
            t: 'The fundamental components (deck slide 50)',
            b: H.fig(D.hub({ t: 'Hermes Agent', s: 'harness', c: 'ink' }, [
              { t: 'Gateway', s: 'chat platforms in/out', c: 'tl' },
              { t: 'Sessions', s: 'resumable conversations' },
              { t: 'Channels', s: 'Slack, Teams, Telegram…', c: 'tl' },
              { t: 'Tools / toolsets', s: 'terminal, web, files, MCP', c: 'acc' },
              { t: 'Skills', s: 'SKILL.md procedures', c: 'acc' },
              { t: 'Memory', s: 'MEMORY.md, USER.md' },
              { t: 'Nodes & backends', s: 'docker, ssh, peers', c: 'tl' },
              { t: 'Subagents', s: 'delegate_task' },
              { t: 'Multi-agent', s: 'profiles + kanban' },
              { t: 'Security', s: 'approvals, allowlists', c: 'crit' },
              { t: 'Self-improvement', s: 'skills from experience', c: 'ok' },
            ], { h: 520, rx: 390, ry: 200, bw: 180, bh: 58, r: 70 })) +
              H.table(['Component', 'Hermes feature', 'Lab'], [
                ['Installation', '<code>install.sh</code> / <code>install.ps1</code>, desktop app', '9.2'],
                ['Model', '<code>hermes model</code>, providers, local endpoints', '9.3'],
                ['Session', '<code>hermes -c</code>, <code>/resume</code>, <code>hermes sessions</code>', '9.4'],
                ['Tools, nodes / backends', '<code>hermes tools</code>, <code>terminal.backend</code> (local, docker, ssh…)', '9.5'],
                ['Skills, self-improvement', '<code>hermes skills</code>, <code>/learn</code>, agent-written skills', '9.6'],
                ['Memory', '<code>MEMORY.md</code>, <code>USER.md</code>, <code>SOUL.md</code>, <code>AGENTS.md</code>', '9.7'],
                ['Integrations', '<code>mcp_servers</code>, <code>hermes mcp</code>', '9.8'],
                ['Automation', '<code>hermes cron</code>', '9.9'],
                ['Gateway, channels, devices', '<code>hermes gateway</code>, pairing, home channel', '9.10'],
                ['Security & permission', '<code>approvals</code>, allowlists, sandbox', '9.11'],
                ['Agent & subagent, multi-agent', '<code>delegate_task</code>, profiles, kanban', 'Module 10'],
              ]),
          },
        ],
      },
      {
        id: 'm9-2', title: 'Lab 1: install and verify', mins: 25, lab: true, deck: [50],
        slides: [
          {
            t: 'Prepare the lab VM',
            b: H.split(
              H.code('# as your normal user on the lab VM\nsudo apt update && sudo apt install -y git curl tar ca-certificates\n\n# Docker, used later as the agent\'s sandbox backend\ncurl -fsSL https://get.docker.com | sh\nsudo usermod -aG docker "$USER"\nnewgrp docker\ndocker run --rm hello-world\n\n# behind the corporate proxy? export it first\n# export HTTPS_PROXY=http://proxy.acme.local:3128\n# export NO_PROXY=localhost,127.0.0.1,.acme.local', 'bash', 'lab VM preparation'),
              LABVM
            ),
          },
          {
            t: 'Install Hermes',
            b: H.split(
              H.stack(
                H.code('# Linux / macOS / WSL2: review the script first, then run it\ncurl -fsSL https://hermes-agent.nousresearch.com/install.sh -o install-hermes.sh\nless install-hermes.sh\nbash install-hermes.sh\n\n# (the documented one-liner does the same thing)\n# curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash\n\nsource ~/.bashrc          # reload PATH (~/.local/bin/hermes)\nhermes --version\nhermes doctor             # diagnose config + dependencies', 'bash', 'Linux / WSL2'),
                H.code('# Windows (native) in PowerShell\niex (irm https://hermes-agent.nousresearch.com/install.ps1)\n# installs under %LOCALAPPDATA%\\hermes', 'powershell', 'Windows')
              ),
              H.stack(
                H.table(['Path', 'Contains'], [
                  ['<code>~/.hermes/hermes-agent/</code>', 'the code'],
                  ['<code>~/.local/bin/hermes</code>', 'the launcher'],
                  ['<code>~/.hermes/config.yaml</code>', 'settings'],
                  ['<code>~/.hermes/.env</code>', 'secrets and API keys'],
                  ['<code>~/.hermes/skills/</code>, <code>memories/</code>, <code>sessions/</code>', 'agent state'],
                  ['<code>~/.hermes/logs/install.log</code>', 'installer log'],
                ]),
                H.note('warn', 'Windows Defender sometimes flags the bundled <code>uv.exe</code> (Astral\'s Python package manager) as a false positive. The Hermes README explains how to verify it with <code>gh attestation verify</code> before whitelisting the folder.')
              )
            ),
            n: 'Piping curl to bash is the documented method, but in our environment we download, read and then run. Same habit as with any vendor script.',
          },
          {
            t: 'Practice run (no VM needed)',
            b: H.widget('terminal', { title: 'Practice: install and verify', chips: ['curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash', 'source ~/.bashrc', 'hermes --version', 'hermes doctor', 'ls ~/.hermes'] }) +
              H.note('tip', 'If <code>hermes</code> is “command not found”, open a new shell or run <code>source ~/.bashrc</code>. If install fails, read the last lines of <code>~/.hermes/logs/install.log</code>.'),
          },
          {
            t: 'Setup modes',
            b: H.split(
              H.table(['Mode', 'What it does', 'Use for'], [
                ['Quick Setup (Nous Portal)', 'OAuth login; sets a model and the Tool Gateway (web search, images, TTS, browser)', 'Personal exploration'],
                ['Full Setup', 'Walks through every provider, tool and option; bring your own keys', 'Most labs in this course'],
                ['<b>Blank Slate</b>', 'Only provider + model + file and terminal toolsets; everything else off until you opt in', '<b>Production pilots</b>: start minimal'],
              ]),
              H.code('hermes setup            # choose a mode\nhermes setup --portal   # Nous Portal fast path\n\n# reconfigure one area later\nhermes model            # provider + model\nhermes tools            # toolsets per platform\nhermes gateway setup    # chat platforms\nhermes config set terminal.backend docker', 'bash', 'setup')
            ) + H.note('key', '<b>Rule of thumb from the docs:</b> if Hermes cannot complete a normal chat, do not add more features yet. Get one clean conversation working first.'),
          },
        ],
      },
      {
        id: 'm9-3', title: 'Lab 2: choose and connect a model', mins: 25, lab: true,
        slides: [
          {
            t: 'Cloud provider or local model',
            b: H.split(
              H.table(['Option', 'How', 'When'], [
                ['OpenRouter', '<code>OPENROUTER_API_KEY</code> in <code>.env</code>, many models behind one key', 'Compare models quickly'],
                ['Anthropic / OpenAI / Google', 'API key or subscription OAuth via <code>hermes model</code>', 'Frontier quality'],
                ['AWS Bedrock / Azure Foundry', 'Cloud IAM credentials', 'Company cloud contracts and data residency'],
                ['Ollama / vLLM / LM Studio', 'Custom endpoint: <code>http://host:port/v1</code>', 'Data must stay on-prem'],
              ]),
              H.note('warn', '<b>Hermes requires a model with at least 64,000 tokens of context.</b> Smaller windows are rejected at startup. Most hosted models qualify; local servers must be configured for it (Module 5 lab).', 'Minimum context') +
              H.note('tip', 'Secrets go to <code>~/.hermes/.env</code>, settings to <code>~/.hermes/config.yaml</code>. <code>hermes config set</code> puts each value in the right file automatically.')
            ),
          },
          {
            t: 'Generate your configuration',
            b: H.widget('configBuilder'),
            n: 'Have each participant pick a provider path. Pairs with a GPU host take the Ollama path; everyone else uses the shared OpenRouter key from the vault.',
          },
          {
            t: 'Verify the model works',
            b: H.split(
              H.code('hermes model                   # confirm provider + model\nhermes chat -q "Reply with the single word: ready"\nhermes doctor\n\n# switch at any time, no lock-in\nhermes config set model.default <provider-model-id>\n# or inside a session:\n/model', 'bash', 'checks'),
              H.table(['Symptom', 'Likely cause', 'Fix'], [
                ['Empty or broken replies', 'Wrong provider auth or model id', 'Run <code>hermes model</code> again'],
                ['Custom endpoint returns garbage', 'Wrong base URL or not OpenAI-compatible', 'Test with <code>curl …/v1/models</code> first'],
                ['Rejected at startup', 'Context below 64K', 'Raise context on the server'],
                ['Says it saved/did things it did not', 'Weak tool-calling model', 'Use a stronger model'],
              ])
            ),
          },
        ],
      },
      {
        id: 'm9-4', title: 'Lab 3: first conversation and sessions', mins: 20, lab: true,
        slides: [
          {
            t: 'Talk to your agent',
            b: H.split(
              H.code('hermes            # classic CLI\nhermes --tui      # modern terminal UI (recommended)\n\n# good first prompts: specific and easy to verify\n❯ What OS and kernel is this machine running? Show the commands you used.\n❯ What\'s my disk usage? Show the top 5 largest directories under /var.\n❯ Write a bash one-liner that lists listening TCP ports with their process.', 'bash', 'first chat'),
              H.prose(
                'Watch the agent call tools in real time: it runs <code>uname</code>, <code>df</code>, <code>du</code> and reads the output before answering.',
                '<b>Success looks like:</b> the banner shows your model, Hermes replies without errors, it uses a tool when needed, and the conversation continues for more than one turn.',
                'Interrupt at any time: type a new message and press Enter, or <kbd>Ctrl</kbd>+<kbd>C</kbd>.'
              )
            ),
          },
          {
            t: 'Slash commands and sessions',
            b: H.split(
              H.table(['Command', 'Does'], [
                ['<code>/help</code>', 'All commands'], ['<code>/tools</code>', 'Tools available now'], ['<code>/model</code>', 'Switch model'],
                ['<code>/new</code> or <code>/reset</code>', 'Fresh conversation'], ['<code>/retry</code>, <code>/undo</code>', 'Redo or remove the last turn'],
                ['<code>/compress</code>', 'Summarise a long conversation'], ['<code>/usage</code>, <code>/insights</code>', 'Tokens and cost'],
                ['<code>/skills</code>, <code>/&lt;skill-name&gt;</code>', 'Browse or run a skill'], ['<code>/plan [request]</code>', 'Write a plan instead of acting'],
              ]),
              H.code('hermes --continue        # resume the last session (-c)\nhermes sessions list     # browse sessions\nhermes chat -q "…"       # one-shot question, then exit\n\n# multi-line input: Alt+Enter or Ctrl+J', 'bash', 'sessions')
            ) + H.note('tip', 'Use <code>/plan</code> for anything risky: Hermes writes a markdown plan under <code>.hermes/plans/</code> without executing. Review it, then ask it to carry out the plan.'),
          },
        ],
      },
      {
        id: 'm9-5', title: 'Lab 4: tools, toolsets and the sandbox', mins: 25, lab: true,
        slides: [
          {
            t: 'Tools and toolsets',
            b: H.split(
              H.table(['Category', 'Example tools'], [
                ['Web', '<code>web_search</code>, <code>web_extract</code>'],
                ['Terminal & files', '<code>terminal</code>, <code>process</code>, <code>read_file</code>, <code>patch</code>'],
                ['Browser', '<code>browser_navigate</code>, <code>browser_snapshot</code>'],
                ['Media', '<code>vision_analyze</code>, <code>text_to_speech</code>'],
                ['Orchestration', '<code>todo</code>, <code>clarify</code>, <code>execute_code</code>, <code>delegate_task</code>'],
                ['Memory & recall', '<code>memory</code>, <code>session_search</code>'],
                ['Automation', '<code>cronjob</code>'],
                ['Integrations', 'MCP server tools, plugin tools'],
              ]),
              H.code('hermes tools                          # interactive: enable/disable per platform\nhermes chat --toolsets "web,terminal" # limit one session\n\n# inside a session\n/tools', 'bash', 'manage toolsets') + H.note('key', 'Give each agent the <b>smallest toolset</b> that does its job. A triage bot on Slack does not need <code>terminal</code>.')
            ),
          },
          {
            t: 'Where do commands run? Terminal backends',
            b: H.split(
              H.table(['Backend', 'Isolation', 'Use for'], [
                ['<code>local</code>', 'None: your user on this machine', 'Trusted dev work only'],
                ['<code>docker</code>', 'Container: read-only root, capabilities dropped, PID limits', '<b>Default for our labs</b>'],
                ['<code>ssh</code>', 'A separate server; the agent cannot modify its own code', 'A jump host with a scoped service account'],
                ['<code>modal</code>, <code>daytona</code>, <code>vercel_sandbox</code>, <code>singularity</code>', 'Cloud or HPC sandboxes', 'Scale and burst work'],
              ]),
              H.code('# ~/.hermes/config.yaml\nterminal:\n  backend: docker\n  docker_image: python:3.11-slim\n  container_cpu: 1\n  container_memory: 4096     # MB\n  container_persistent: true # keep /workspace between sessions\n  timeout: 180\n\n# or for a jump host (secrets in ~/.hermes/.env):\n# terminal: { backend: ssh }\n# TERMINAL_SSH_HOST=jump-lab-01.lab.local\n# TERMINAL_SSH_USER=svc-hermes\n# TERMINAL_SSH_KEY=~/.ssh/svc_hermes_ed25519', 'yaml', 'sandbox config')
            ),
          },
          {
            t: 'Exercise: see the sandbox boundary',
            b: H.split(
              H.steps([
                ['Switch to Docker', '<code>hermes config set terminal.backend docker</code>, then start a new session.'],
                ['Ask the same question as Lab 3', '“What OS is this machine running? Top 5 directories under /?”'],
                ['Compare', 'You now see a slim Debian container, not your VM. The agent works inside the box.'],
                ['Install something', '“pip install requests and print its version.” Then <code>/new</code> and ask again: the persistent container keeps it.'],
                ['Break out?', '“Read /etc/shadow on the host.” It cannot: the host filesystem is not mounted.'],
              ]),
              H.note('it', 'This is the same idea as running an untrusted script on a jump box instead of your admin workstation. Pick the backend by asking: <i>what is the worst thing this agent could do here?</i>')
            ) + H.note('warn', 'If agent commands hang or time out but work in your own terminal, your <code>~/.bashrc</code> is probably doing interactive things (nvm, tmux attach, prompts). Keep the standard “return if non-interactive” guard at the top.'),
          },
        ],
      },
      {
        id: 'm9-6', title: 'Lab 5: skills, turning runbooks into procedures', mins: 30, lab: true,
        slides: [
          {
            t: 'What a skill is',
            b: H.split(
              H.prose(
                'A <b>skill</b> is a folder with a <code>SKILL.md</code> file: a name, a short description and a step-by-step procedure, plus optional <code>references/</code>, <code>templates/</code> and <code>scripts/</code>.',
                '<b>Progressive disclosure:</b> the agent sees only each skill\'s name and description (cheap). It loads the full skill when a task matches, and reference files only when needed.',
                'Every installed skill becomes a slash command: <code>/network-triage INC-20931</code>. The agent also picks skills on its own.',
                'Skills follow the open <a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a> format, so the same file works in Claude Code and other agents.'
              ),
              H.fig(D.stack([
                { t: 'Level 0 · skills_list()', s: 'names + descriptions (~3K tokens)', c: 'ok' },
                { t: 'Level 1 · skill_view(name)', s: 'full SKILL.md when relevant', c: 'tl' },
                { t: 'Level 2 · skill_view(name, path)', s: 'a reference file only if needed', c: 'acc' },
              ], { h: 56 }))
            ),
          },
          {
            t: 'Find and install skills from the hub',
            b: H.split(
              H.code('hermes skills browse                     # official first\nhermes skills search kubernetes\nhermes skills inspect official/security/1password   # read before you install\nhermes skills install official/security/1password   # security scan runs first\nhermes skills list\nhermes skills check && hermes skills update\nhermes skills audit                      # re-scan installed hub skills\nhermes skills uninstall <name>\n\n# add our own internal skills repo as a source\nhermes skills tap add acme-it/agent-skills', 'bash', 'skills hub'),
              H.note('warn', 'Third-party skills are code and instructions written by strangers. Always <code>inspect</code> before installing, prefer <code>official</code> sources, and keep an internal, reviewed skills repository for the team.')
            ),
          },
          {
            t: 'Write a skill from one of our runbooks',
            b: H.widget('skillBuilder', { preset: 'network-triage' }),
            n: 'Each pair converts one real runbook from their team. Keep descriptions under 60 characters and always include Pitfalls and Verification: that is where your experience goes.',
          },
          {
            t: 'Let the agent learn: /learn and self-written skills',
            b: H.split(
              H.code('# turn a doc, folder, URL or this conversation into a skill\n/learn the procedure in /srv/runbooks/vpn/guest-wifi.md\n/learn how I just diagnosed the Branch-2 tunnel outage\n\n# run several skills at once\n/network-triage /ad-account-unlock user at Branch-2 locked out and offline', 'text', 'inside a session'),
              H.prose(
                'After solving a non-trivial task, Hermes may save the working procedure as a new skill with its <code>skill_manage</code> tool. This is its <b>self-improvement loop</b>: procedural memory that grows with use.',
                'For a team setup, require review before agent-written skills land: set <code>skills.write_approval</code> so changes are staged for a human, and keep team skills in git.'
              )
            ),
          },
        ],
      },
      {
        id: 'm9-7', title: 'Lab 6: memory, persona and context files', mins: 20, lab: true,
        slides: [
          {
            t: 'Give the agent an identity: SOUL.md',
            b: H.split(
              H.code('# ~/.hermes/SOUL.md\n# Identity\nYou are Atlas, the IT Operations assistant for ACME\'s infrastructure team.\n\n# Principles\n- Read-only first: diagnose before you change anything.\n- Never run destructive or production-changing commands without approval.\n- Never ask anyone for a password or MFA code.\n- Quote the evidence (command + key output lines) behind every conclusion.\n- If unsure, say so and propose the next diagnostic step.\n\n# Style\n- Concise. Bullet points. Commands in code blocks.\n- Ticket notes: Symptom / Evidence / Cause / Action / Next step.', 'markdown', 'SOUL.md'),
              H.prose(
                '<code>SOUL.md</code> is the global persona for this Hermes instance (or profile). It is loaded into every session.',
                'Keep it short. Rules that apply to one project belong in that project\'s <code>AGENTS.md</code>; procedures belong in skills.'
              )
            ),
          },
          {
            t: 'Project context: AGENTS.md',
            b: H.split(
              H.code('# /srv/lab/AGENTS.md\n## Lab environment\n- Hosts: fs-02.lab.acme.local (Windows file server), core-sw-lab (switch), bkp-01 (backup)\n- Runbooks: /srv/runbooks (read-only git clone)\n- Ticket export for exercises: /srv/lab/tickets.csv\n\n## Conventions\n- Save reports in /srv/lab/reports/YYYY-MM-DD-<topic>.md\n- Use the network-triage skill for reachability tickets\n- Never touch anything outside *.lab.acme.local', 'markdown', 'AGENTS.md'),
              H.table(['File', 'Scope', 'Loaded'], [
                ['<code>SOUL.md</code>', 'Whole Hermes instance or profile', 'Always'],
                ['<code>.hermes.md</code> / <code>HERMES.md</code>', 'Project (highest priority)', 'From working dir up to git root'],
                ['<code>AGENTS.md</code>', 'Project and subfolders', 'At start + as the agent enters subfolders'],
                ['<code>CLAUDE.md</code>, <code>.cursorrules</code>', 'Other agents\' files, also read', 'If no higher-priority file exists'],
              ]) + H.note('tip', 'Context files are scanned for prompt injection before loading. Still, review any <code>AGENTS.md</code> in a repo you did not write.')
            ),
          },
          {
            t: 'Memory in practice',
            b: H.split(
              H.code('# in a session\n❯ Use the memory tool to save: the lab change window is Saturday 22:00–02:00.\n❯ /new\n❯ When is the lab change window?\n\n# verify on disk (the agent\'s claim is not proof)\ncat ~/.hermes/memories/MEMORY.md\ncat ~/.hermes/memories/USER.md\n\n# find something from an old conversation\n❯ What did we find about the Branch-2 tunnel last week?   # uses session_search', 'bash', 'exercise'),
              H.list([
                'MEMORY.md (~2,200 chars) and USER.md (~1,375 chars) are small on purpose. The agent consolidates when they are full.',
                'Memory is a snapshot taken at session start, so new facts show up in the next session.',
                'One agent per Hermes home: two processes on the same profile corrupt each other\'s memory. Use profiles (Module 10).',
              ])
            ),
          },
        ],
      },
      {
        id: 'm9-8', title: 'Lab 7: connect systems with MCP', mins: 35, lab: true,
        slides: [
          {
            t: 'Add MCP servers',
            b: H.split(
              H.code('# ~/.hermes/config.yaml\nmcp_servers:\n  runbooks:                     # local stdio server\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-filesystem", "/srv/runbooks"]\n\n  github:\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-github"]\n    env:\n      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}"\n    tools:\n      include: [search_repositories, get_file_contents, list_issues]\n\n  itsm:                         # remote HTTP server\n    url: "https://mcp.itsm.acme.local/mcp"\n    headers:\n      Authorization: "Bearer ${ITSM_MCP_TOKEN}"\n    tools:\n      exclude: [delete_ticket]', 'yaml', 'mcp_servers'),
              H.stack(
                H.code('hermes mcp               # interactive picker\nhermes mcp catalog       # curated, Nous-reviewed servers\nhermes mcp install deepwiki\n\n# after editing config, inside a session\n/reload-mcp', 'bash', 'manage'),
                H.note('key', 'Use <code>tools: include:</code> to expose only the tools an agent needs. Ten well-chosen tools beat eighty: less context, fewer mistakes, smaller blast radius.', 'Least privilege')
              )
            ),
          },
          {
            t: 'Build a tiny MCP server for our lab ticket system',
            b: H.split(
              H.code('# /srv/lab/itsm_mcp.py\nimport csv\nfrom mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP("itsm-lab")\nTICKETS = "/srv/lab/tickets.csv"   # number,status,team,summary\n\n@mcp.tool()\ndef get_ticket(number: str) -> str:\n    """Fetch a lab ticket by number, e.g. INC-20931. Read-only."""\n    with open(TICKETS, newline="") as f:\n        for row in csv.DictReader(f):\n            if row["number"].upper() == number.upper():\n                return f"{row[\'number\']} | {row[\'status\']} | {row[\'team\']} | {row[\'summary\']}"\n    return f"No ticket {number}"\n\n@mcp.tool()\ndef open_tickets(team: str = "") -> str:\n    """List open lab tickets, optionally for one team. Read-only."""\n    with open(TICKETS, newline="") as f:\n        rows = [r for r in csv.DictReader(f)\n                if r["status"] != "Closed" and (not team or r["team"] == team)]\n    return "\\n".join(f"{r[\'number\']}: {r[\'summary\']}" for r in rows) or "none"\n\nif __name__ == "__main__":\n    mcp.run()   # stdio transport', 'python', 'itsm_mcp.py'),
              H.stack(
                H.code('python3 -m venv /srv/lab/venv\n/srv/lab/venv/bin/pip install "mcp[cli]"\nprintf "number,status,team,summary\\nINC-20931,In Progress,Network L2,Intranet unreachable from Branch-2\\nINC-20944,New,Service Desk,Outlook crashes on start\\n" > /srv/lab/tickets.csv', 'bash', 'set up'),
                H.code('mcp_servers:\n  itsm_lab:\n    command: /srv/lab/venv/bin/python\n    args: ["/srv/lab/itsm_mcp.py"]', 'yaml', 'register in config.yaml'),
                H.note('it', 'Ask Hermes: <i>“Which tickets are open for Network L2? Summarise INC-20931.”</i> Then replace the CSV reads with real, read-only API calls to our ITSM. That is a production-shaped integration in about 30 lines.')
              )
            ),
            n: 'This is often the most valuable lab: people see that giving an agent access to an internal system takes an afternoon, and that they control exactly what it can do.',
          },
        ],
      },
      {
        id: 'm9-9', title: 'Lab 8: scheduled automations with cron', mins: 20, lab: true,
        slides: [
          {
            t: 'Schedule work in plain language',
            b: H.split(
              H.code('# from the shell\nhermes cron create "every day at 06:00" \\\n  "Check disk usage on the lab hosts; report any volume above 80% with its growth trend" \\\n  --skill disk-hygiene --name "Daily disk report"\n\nhermes cron create "every monday 8am" \\\n  "List TLS certificates on *.lab.acme.local expiring within 30 days" --name "Cert expiry"\n\nhermes cron list\nhermes cron run <job-id>      # trigger on the next tick, to test\nhermes cron pause <job-id>\nhermes cron doctor            # fleet health check\n\n# inside a chat session\n/cron add "every 2h" "Check the backup job status on bkp-01"', 'bash', 'cron'),
              H.table(['Schedule format', 'Example'], [
                ['One-shot', '<code>in 30m</code>, <code>in 2h</code>, ISO timestamp'],
                ['Interval', '<code>every 30m</code>, <code>every 2h</code>, <code>every 1d</code>'],
                ['Natural', '<code>every day at 9am</code>, <code>weekdays at 9am</code>, <code>every monday 9am</code>'],
                ['Cron expression', '<code>0 6 * * 1-5</code>'],
              ])
            ),
          },
          {
            t: 'Unattended means stricter',
            b: H.split(
              H.list([
                'Results are delivered to a target: the originating chat, a home channel such as <code>#it-ops-agents</code>, or a local file.',
                'With <code>approvals.cron_mode: deny</code> (the default), a dangerous command in a cron run is <b>blocked</b>, because nobody is there to approve it. Keep it that way.',
                'Cron runs cannot create more cron jobs, which prevents runaway scheduling.',
                'Pin a model per job (<code>--model</code>, <code>--pin</code>) so changing your chat model does not change your reports.',
                '<code>hermes pause</code> is the global emergency stop: no new cron fires or gateway turns until <code>hermes resume</code>.',
              ]),
              H.note('it', 'Good first cron jobs are <b>read-only reports</b>: disk trends, certificate expiry, failed backups, stale AD accounts, patch compliance. They build trust before any automated fixes.')
            ),
          },
        ],
      },
      {
        id: 'm9-10', title: 'Lab 9: put the agent in Slack or Teams', mins: 25, lab: true,
        slides: [
          {
            t: 'The messaging gateway',
            b: H.split(
              H.code('hermes gateway setup     # pick platform(s), paste bot token, set allowed users\nhermes gateway start\nhermes gateway status\n\n# Slack: generate an app manifest with every command as a native slash command\nhermes slack --help\n\n# allowlist example (Telegram) in ~/.hermes/.env\nTELEGRAM_ALLOWED_USERS=123456789,987654321\n\n# or approve people one by one with DM pairing\nhermes pairing --help', 'bash', 'gateway'),
              H.stack(
                H.fig(D.flow([{ t: 'Engineer', s: 'Slack / Teams' }, { t: 'Gateway', s: 'auth + allowlist', c: 'acc' }, { t: 'Agent session', s: 'one per chat', c: 'ink' }, { t: 'Tools', s: 'sandboxed', c: 'tl' }])),
                H.table(['In chat', 'Does'], [
                  ['<code>/approve</code>, <code>/deny</code>', 'Answer a pending approval'], ['<code>/stop</code>', 'Stop the running agent'], ['<code>/new</code>', 'Fresh conversation'], ['<code>/sethome</code>', 'Make this the home channel for reports'], ['<code>/status</code>, <code>/usage</code>', 'Session info and cost'],
                ])
              )
            ),
          },
          {
            t: 'Gateway rules for a company',
            b: H.steps([
              ['Use company platforms', 'Slack or Microsoft Teams with company SSO, not personal Telegram or WhatsApp accounts, for anything involving internal data.'],
              ['Always restrict who can talk to it', 'Allowlists or DM pairing. An open bot with a terminal tool is a remote shell for anyone.'],
              ['One bot, one purpose', 'Separate profiles and bot tokens for triage, network and security agents.'],
              ['Approvals arrive in chat', 'Dangerous commands show Approve / Deny. Only the on-call engineer group should be able to approve.'],
              ['Start new sessions', 'A chat is one long session; use <code>/new</code> at task boundaries so memory and cost stay healthy.'],
            ]),
          },
        ],
      },
      {
        id: 'm9-11', title: 'Lab 10: harden it', mins: 25, lab: true,
        slides: [
          {
            t: 'Hermes security layers',
            b: H.split(
              H.fig(D.stack([
                { t: '1 · User authorization', s: 'allowlists, DM pairing', c: 'ink' },
                { t: '2 · Dangerous-command approval', s: 'smart / manual; hardline blocklist', c: 'acc' },
                { t: '3 · File-write safety', s: 'protected paths, safe root' },
                { t: '4 · Container isolation', s: 'docker / ssh backends', c: 'tl' },
                { t: '5 · MCP credential filtering', s: 'env isolation for servers' },
                { t: '6 · Context-file scanning', s: 'injection detection', c: 'tl' },
                { t: '7 · Cross-session isolation', s: 'sessions cannot read each other' },
                { t: '8 · Input sanitisation', s: 'validated working directories' },
              ], { h: 42 })),
              H.code('approvals:\n  mode: smart           # smart | manual | off\n  timeout: 300\n  cron_mode: deny       # unattended runs never approve\n  single_query_mode: deny\n  unattended_mode: deny # webhooks / API\n\n# NEVER in production:\n#   approvals.mode: off   or   hermes --yolo   or   /yolo', 'yaml', 'approvals')
            ),
          },
          {
            t: 'Hardening checklist before a pilot',
            b: H.table(['✓', 'Control', 'How'], [
              ['☐', 'Dedicated VM and non-admin user', 'No domain admin, no shared accounts'],
              ['☐', 'Sandboxed terminal', '<code>terminal.backend: docker</code> or <code>ssh</code> to a scoped jump host'],
              ['☐', 'Approvals on', '<code>smart</code> or <code>manual</code>; <code>cron_mode</code> / <code>unattended_mode: deny</code>'],
              ['☐', 'Minimal toolsets', '<code>hermes tools</code>; start from Blank Slate'],
              ['☐', 'MCP least privilege', '<code>tools: include:</code> lists; read-only service accounts'],
              ['☐', 'Secrets', '<code>~/.hermes/.env</code> with <code>chmod 600</code>, or <code>hermes secrets</code> (Bitwarden); never in prompts or SOUL.md'],
              ['☐', 'Who can talk to it', 'Gateway allowlist or pairing'],
              ['☐', 'Write limits', '<code>HERMES_WRITE_SAFE_ROOT</code> to confine file writes'],
              ['☐', 'Supply chain', '<code>hermes security audit</code>; inspect skills; pin MCP server versions'],
              ['☐', 'Logs and audit', '<code>hermes logs</code> shipped to the SIEM; review approvals history'],
              ['☐', 'Kill switch', '<code>hermes pause</code> documented in the runbook'],
              ['☐', 'Backup and update', '<code>hermes backup</code>; <code>hermes update</code> on a schedule after testing'],
            ]),
            n: 'Turn this checklist into a change-request template. No agent goes past the lab without every box ticked and a named owner.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'What is the minimum context window Hermes Agent requires from a model?', a: ['4K tokens', '16K tokens', '64K tokens', '1M tokens'], c: 2, why: 'Hermes needs at least 64,000 tokens for its system prompt, tool schemas and multi-step work. Smaller models are rejected at startup.' },
      { q: 'Where does Hermes keep API keys and other secrets?', a: ['config.yaml', '~/.hermes/.env', 'SOUL.md', 'MEMORY.md'], c: 1, why: 'Secrets go to ~/.hermes/.env; non-secret settings go to config.yaml. hermes config set routes each key correctly.' },
      { q: 'Which terminal backend should our labs use by default?', a: ['local', 'docker', 'none', 'vercel_sandbox'], c: 1, why: 'Docker runs commands in a hardened container, so the agent cannot touch the host system.' },
      { q: 'You want only three tools from a GitHub MCP server. How?', a: ['Delete the others from GitHub', 'List them under tools: include: for that server in config.yaml', 'Tell the model in the prompt not to use the others', 'Use YOLO mode'], c: 1, why: 'Per-server include/exclude filters decide which MCP tools are registered at all. A prompt instruction is not a control.' },
      { q: 'A cron job hits a dangerous command at 03:00. With default settings, what happens?', a: ['It runs', 'It is blocked (cron_mode: deny), because nobody can approve', 'Hermes calls the on-call engineer', 'The job deletes itself'], c: 1, why: 'Unattended runs deny dangerous commands by default. Keep it that way.' },
      { q: 'Why keep skill descriptions short (around 60 characters)?', a: ['Style preference', 'All skill descriptions are in the context on every turn; the agent uses them to choose skills', 'Hermes truncates files', 'Markdown limits'], c: 1, why: 'Progressive disclosure: descriptions are always loaded, full skills only when relevant. Short, specific descriptions improve selection and save tokens.' },
      { q: 'What is the global emergency stop for scheduled jobs and gateway turns?', a: ['hermes doctor', 'hermes pause (and hermes resume)', 'Ctrl+Z', 'Deleting ~/.hermes'], c: 1, why: 'hermes pause stops new cron fires, kanban dispatch and gateway turns until hermes resume.' },
    ],
  });
})();
