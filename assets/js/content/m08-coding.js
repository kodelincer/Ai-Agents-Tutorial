(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm8', num: 8, title: 'Coding agents: Claude Code, Copilot and friends',
    summary: 'How coding agents work, a hands-on start with Claude Code, and how infrastructure teams use them for scripts, IaC and safe, test-driven changes.',
    deck: [26, 48, 51, 52],
    outcomes: ['Explain how a coding agent plans, edits, runs and verifies code', 'Install Claude Code and use CLAUDE.md, permissions, MCP and skills', 'Apply coding agents to PowerShell, Ansible and Terraform work with tests and reviews', 'Describe team rules for using coding agents safely'],
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
                '<b>Brain:</b> a strong coding model: Claude Opus/Sonnet, GPT-5 Codex models, Gemini, or open ones like Qwen3-Coder, GLM, Kimi or DeepSeek.',
                '<b>Tools:</b> read and search files, edit with precise patches, run shell commands, run tests, use git, browse docs, MCP servers.',
                '<b>Loop:</b> the same think-act-observe loop, with tests as the main way to observe whether it worked.'
              )
            ),
          },
          {
            t: 'The leading coding agents',
            b: H.table(['Tool', 'Where it runs', 'Notes'], [
              ['Claude Code', 'Terminal, IDE extensions, desktop, web (cloud sessions)', 'Anthropic. Strong agentic coding; skills, subagents, hooks, MCP'],
              ['OpenAI Codex', 'CLI, IDE, cloud tasks', 'OpenAI\'s coding agent with sandboxed cloud runs'],
              ['Cursor', 'VS Code-based IDE', 'Agent mode inside the editor; many model choices'],
              ['GitHub Copilot', 'IDE agent mode + cloud coding agent on issues/PRs', 'Assign a GitHub issue to Copilot and get a PR'],
              ['Gemini CLI', 'Terminal', 'Google, open source, large context'],
            ]) + H.note('tip', 'They all read a project instruction file: <code>CLAUDE.md</code>, <code>AGENTS.md</code> or similar. Hermes reads these too. One well-written <code>AGENTS.md</code> per repo helps every agent.'),
          },
        ],
      },
      {
        id: 'm8-2', title: 'Hands-on: Claude Code', mins: 30, deck: [48, 51], lab: true,
        slides: [
          {
            t: 'Install and first run',
            b: H.split(
              H.code('# macOS / Linux / WSL (native installer)\ncurl -fsSL https://claude.ai/install.sh | bash\n\n# Windows PowerShell\nirm https://claude.ai/install.ps1 | iex\n\n# or with npm (Node 18+)\nnpm install -g @anthropic-ai/claude-code\n\n# start in a repo and sign in (Claude subscription or API key)\ncd ~/repos/infra-scripts\nclaude\n\n# inside the session\n/init      # writes a CLAUDE.md describing the repo\n/help', 'bash', 'install'),
              H.prose(
                'Work in a <b>git repository</b> so every change is a diff you can review and revert.',
                'Start with a read-only question: <i>“Explain what this repo does and list scripts that touch Active Directory.”</i>',
                'Then a small, testable change: <i>“Add a -WhatIf switch to Disable-StaleAccounts.ps1 and a Pester test for it.”</i>'
              )
            ),
          },
          {
            t: 'The pieces that make it safe and useful',
            b: H.table(['Feature', 'What it does', 'Where'], [
              ['CLAUDE.md', 'Project memory: conventions, how to test, what not to touch', 'repo root (+ subfolders), <code>~/.claude/CLAUDE.md</code>'],
              ['Permissions', 'Allow/deny rules for tools and commands; modes such as plan and accept-edits', '<code>.claude/settings.json</code>, <code>/permissions</code>'],
              ['MCP servers', 'Connect GitHub, Jira, databases, internal APIs', '<code>claude mcp add</code>'],
              ['Skills', 'SKILL.md procedures loaded on demand (same open standard as Hermes)', '<code>.claude/skills/</code>'],
              ['Subagents', 'Specialised helpers with their own context and tools', '<code>.claude/agents/</code>'],
              ['Hooks', 'Your scripts run before or after tool calls, e.g. block edits to prod configs or run a linter', 'settings.json'],
              ['Headless mode', 'Run non-interactively in CI or cron: <code>claude -p "…"</code>', 'pipelines'],
            ]),
          },
          {
            t: 'Example: guardrails for an infrastructure repo',
            b: H.split(
              H.code('{\n  "permissions": {\n    "allow": [\n      "Bash(git diff:*)", "Bash(git status)",\n      "Bash(ansible-lint:*)", "Bash(terraform validate)",\n      "Bash(terraform plan:*)", "Bash(Invoke-Pester:*)"\n    ],\n    "deny": [\n      "Bash(terraform apply:*)", "Bash(ansible-playbook:*)",\n      "Read(./.env)", "Read(./secrets/**)"\n    ]\n  }\n}', 'json', '.claude/settings.json'),
              H.code('# CLAUDE.md\n## Repo: infra-scripts\n- PowerShell 7 scripts for AD and file servers; Ansible in /ansible\n- Run tests: `Invoke-Pester ./tests` and `ansible-lint ansible/`\n- Every script MUST support -WhatIf and write a log to C:\\Logs\\scripts\n- NEVER run terraform apply or ansible-playbook; humans apply after review\n- Hostnames: *.lab.acme.local only in examples, never production names', 'markdown', 'CLAUDE.md')
            ) + H.note('key', 'The agent writes and tests code. <b>Humans review the diff and apply it to production</b> through the normal change process.'),
          },
        ],
      },
      {
        id: 'm8-3', title: 'Coding agents for infrastructure teams', mins: 20, deck: [52],
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
          },
          {
            t: 'Team rules (our “contract” with coding agents)',
            b: H.split(
              H.steps([
                ['Use coding agents for new code and maintenance', 'Agents draft; engineers own and review every line.'],
                ['Test-driven development', 'Ask for the test first, see it fail, then the implementation. Tests are how the agent observes success.'],
                ['Everything through git and PRs', 'No agent pushes to main or applies to production.'],
                ['Regular security checks', 'Scheduled scans (secrets, dependencies, SAST) and a periodic benchmark/report on agent output quality.'],
                ['Least privilege', 'Agents work on lab hosts with lab credentials; deny-rules for apply/deploy commands.'],
              ]),
              H.note('it', 'This mirrors the deck\'s “Contracts” slide: require coding agents for development and maintenance, run interval security checks with reports, and practise test-driven development.')
            ),
          },
        ],
      },
    ],
    quiz: [
      { q: 'What is the main way a coding agent “observes” whether its change worked?', a: ['It asks the user every time', 'It runs tests, linters and the code itself', 'It trusts its first answer', 'It reads the model card'], c: 1, why: 'Tests and tools give real feedback in the loop. That is why TDD works so well with agents.' },
      { q: 'Which file gives Claude Code project-specific instructions?', a: ['README.txt', 'CLAUDE.md', '.gitignore', 'package.json'], c: 1, why: 'CLAUDE.md (and AGENTS.md in other tools) is the project memory the agent loads at start.' },
      { q: 'How should a coding agent touch production infrastructure?', a: ['Directly with terraform apply', 'It should not: it writes and tests code, humans review and apply through change management', 'Only at night', 'Through a shared admin account'], c: 1, why: 'Deny apply/deploy commands; production changes go through review and the change process.' },
      { q: 'Which Claude Code feature runs your own script before or after tool calls, e.g. to block edits to production configs?', a: ['Skills', 'Hooks', 'Subagents', 'Plan mode'], c: 1, why: 'Hooks run your commands at defined points in the tool lifecycle and can block actions.' },
    ],
  });
})();
