(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm0', num: 0, title: 'Welcome and course map',
    summary: 'Why AI agents matter for an IT infrastructure team, what you will build, and how this academy works.',
    deck: [1, 2, 3],
    outcomes: ['Explain what this course covers and what you will build by the end', 'Describe the difference between automation you script and automation you delegate', 'Find the reference books and websites used throughout the course'],
    lessons: [
      {
        id: 'm0-1', title: 'Why AI agents, why now, why us', mins: 15, deck: [1],
        slides: [
          {
            t: 'AI agent automation for IT operations',
            b: H.split(
              H.prose(
                H.lead('Every day our teams close tickets, chase alerts, check backups, unlock accounts and write the same reports. Most of that work follows a runbook someone already wrote.'),
                'An <b>AI agent</b> is software that reads a goal in plain language, decides which tools to use, runs them, looks at the results and keeps going until the job is done. It is the first kind of automation that can handle the messy middle: a vague ticket, an unexpected error, a log that needs reading.',
                'This course teaches you how agents work under the hood, so you can delegate work to them safely and design teams of agents that work alongside us.'
              ),
              H.cards([
                ['Scripted automation', 'You write every step. Brittle when the input changes. <b>Cron + PowerShell + Ansible.</b>', 'Yesterday'],
                ['Delegated automation', 'You state the goal and the guardrails. The agent works out the steps. <b>Agent + tools + approvals.</b>', 'This course'],
              ], 2)
            ),
            n: 'Open with a show of hands: who closed a password-reset ticket this week? Who ran the same diagnostic three times? That repetitive middle layer is what agents take over. Stress that this is not about replacing engineers. It is about engineers becoming the people who design, supervise and improve the agents.',
          },
          {
            t: 'What changes for an IT team',
            b: H.stack(
              H.fig(D.flow([
                { t: 'Ticket / alert', s: 'ITSM, monitoring, chat' },
                { t: 'Agent triages', s: 'reads, classifies, asks' },
                { t: 'Agent diagnoses', s: 'ping, logs, AD, SNMP', c: 'tl' },
                { t: 'Human approves', s: 'only risky steps', c: 'acc' },
                { t: 'Agent fixes + documents', s: 'work notes, KB, skill', c: 'ok' },
              ], { anim: true }), 'The target workflow: agents do the legwork and humans keep the decisions that matter.'),
              H.cards([
                ['Helpdesk', 'Triage, first replies, known-issue fixes, account unlocks after identity checks.', 'L1'],
                ['Datacenter', 'Disk, backup, certificate and patch hygiene; reading iDRAC/iLO and vendor logs.', 'Ops'],
                ['Network', 'Reachability triage, config diffing, change-request drafting, capacity reports.', 'NetOps'],
                ['Security', 'Phishing triage, alert enrichment, drafting containment steps for approval.', 'SecOps'],
              ], 4)
            ),
            n: 'Ask each team what they would delegate first. Write the answers down: we use them again in Module 12 (role playbooks) and Module 13 (capstone).',
          },
          {
            t: 'What you will be able to do',
            b: H.split(
              H.steps([
                ['Explain the stack', 'From machine learning to LLMs to agents, in words your manager understands.'],
                ['Choose a model', 'Cloud API or local GPU, size and quantization, cost per month.'],
                ['Feed it knowledge', 'Prompting, RAG and memory, and when fine-tuning is worth it.'],
                ['Install and harden Hermes Agent', 'Tools, skills, MCP servers, cron jobs and a chat gateway.'],
                ['Build a team of agents', 'Profiles, delegation and a kanban board, with humans approving the risky steps.'],
                ['Automate your own daily work', 'Role playbooks for network, helpdesk, datacenter, web/dev and security, inside our guardrail policy.'],
                ['Keep it safe', 'Prompt injection, least privilege, sandboxes and audit trails.'],
              ]),
              H.note('key', 'By the end you will have a working <b>helpdesk triage agent</b> on a lab VM, a <b>skill</b> written from one of our real runbooks, and a <b>design</b> for a multi-agent IT team.', 'Capstone') +
              H.note('it', 'Everything in this course runs on a lab VM or in a Docker sandbox first. Nothing touches production until it has passed the security checklist in Module 11.')
            ),
          },
        ],
      },
      {
        id: 'm0-2', title: 'Course map: from neurons to agent teams', mins: 10, deck: [2],
        slides: [
          {
            t: 'The learning path',
            b: H.stack(
              H.fig(D.stack([
                { t: '13 · Projects and roadmap', s: 'capstone, IT orchestrator, adoption plan', c: 'acc' },
                { t: '12 · Role playbooks', s: 'network, helpdesk, datacenter, web/dev, security scenarios + guardrail policy', c: 'acc' },
                { t: '10–11 · Agent teams and security', s: 'delegation, human-in-the-loop, prompt injection' },
                { t: '9 · Hermes Agent labs', s: 'install, tools, skills, memory, MCP, cron, gateway', c: 'tl' },
                { t: '7–8 · Agents and coding agents', s: 'agent loop, harness, MCP, Claude Code' },
                { t: '4–6 · Knowledge, models, prompting', s: 'RAG, hardware, quantization, context engineering' },
                { t: '1–3 · Foundations', s: 'ML, neural networks, tokens, transformers, training', c: 'ink' },
              ], { h: 50 }), 'Each layer builds on the one below it. You can jump straight to the labs, but the agents make more sense once you know what the model inside them is doing.')
            ),
            n: 'Explain that Modules 1–6 are “how the brain works” and Modules 7–13 are “how to give the brain hands and a job”. Engineers who skip the foundations tend to over-trust agents.',
          },
          {
            t: 'Topics from the original deck',
            b: H.split(
              H.list(['Fundamentals of machine learning and neural networks', 'Data science and data mining basics', 'Transformers, attention, large language models', 'The probabilistic nature of AI and hallucination', 'Foundation models, fine-tuning, instruction and preference tuning', 'Prompt engineering and generative AI', 'Tokenization, token IDs and the usage meter', 'Word and positional embeddings', 'Encoders, decoders and classification fine-tuning']),
              H.list(['Internal vs external knowledge, vector databases, RAG', 'Validation and benchmarks', 'DevOps vs MLOps vs LLMOps', 'LLMs as reasoning engines', 'Hardware: how much compute a model needs', 'Agentic systems, agents, coding agents, Claude Code', 'Hermes Agent', 'Open-ended vs closed-ended tasks'])
            ) + H.note('tip', 'The <a href="#deckmap">deck-to-lesson map</a> lists every original slide and the lesson that teaches it.'),
          },
          {
            t: 'How to use this academy',
            b: H.split(
              H.table(['Key', 'Action'], [['<kbd>→</kbd> <kbd>←</kbd>', 'Next or previous slide (continues into the next lesson)'], ['<kbd>P</kbd>', 'Presenter mode (full stage)'], ['<kbd>N</kbd>', 'Show or hide speaker notes'], ['<kbd>F</kbd>', 'Full screen'], ['<kbd>/</kbd>', 'Search every lesson and the glossary'], ['<kbd>Esc</kbd>', 'Leave presenter mode']]),
              H.prose('The row of <b>ports</b> above each slide is your patch panel: a lit port means you have opened that slide. Module cards on the home page light up as you go.', 'Panels marked <span class="label" style="color:var(--amber)">Try it</span> are live exercises. Change the inputs and watch what happens. They run entirely in your browser.', 'Each module ends with a checkpoint quiz. Best scores are saved in this browser.')
            ),
          },
        ],
      },
      {
        id: 'm0-3', title: 'References and where to keep learning', mins: 10, deck: [3],
        slides: [
          {
            t: 'Books behind this course',
            b: H.cards([
              ['AI Engineering', 'Chip Huyen (O\'Reilly, 2025). Building applications on foundation models: evaluation, prompt engineering, RAG, agents, fine-tuning. The deck\'s training slides follow its chapter 2 (pp. 78–82).', 'Book'],
              ['Hands-On Large Language Models', 'Jay Alammar and Maarten Grootendorst (O\'Reilly, 2024). Very visual. Tokens, embeddings, text classification with representation vs generative models, semantic search and RAG.', 'Book'],
              ['Build a Large Language Model (From Scratch)', 'Sebastian Raschka (Manning, 2024). Builds a GPT in PyTorch, including fine-tuning it as a spam classifier.', 'Book'],
              ['A practical agents book', 'For example <i>AI Agents in Action</i> (Micheal Lanham, Manning). Any recent hands-on agents book works: the patterns in Module 7 (ReAct, tool use, planning, multi-agent) are the common core.', 'Book'],
            ], 2),
          },
          {
            t: 'Websites the team should bookmark',
            b: H.table(['Site', 'Use it for'], [
              ['<a href="https://huggingface.co" target="_blank" rel="noopener">huggingface.co</a>', 'Open models, datasets and model cards. The “GitHub of AI”. Check licence and size before you download.'],
              ['<a href="https://hermes-agent.nousresearch.com/docs/" target="_blank" rel="noopener">hermes-agent.nousresearch.com/docs</a>', 'Official Hermes Agent documentation used in Module 9.'],
              ['<a href="https://github.com/NousResearch/hermes-agent" target="_blank" rel="noopener">github.com/NousResearch/hermes-agent</a>', 'Source, issues and release notes for Hermes.'],
              ['<a href="https://modelcontextprotocol.io" target="_blank" rel="noopener">modelcontextprotocol.io</a>', 'The MCP specification and the list of reference servers.'],
              ['<a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a>', 'The open SKILL.md standard shared by Hermes, Claude Code and others.'],
              ['<a href="https://code.claude.com/docs/en/overview" target="_blank" rel="noopener">Claude Code docs</a>', 'Coding agent used in Module 8.'],
              ['<a href="https://ollama.com" target="_blank" rel="noopener">ollama.com</a> · <a href="https://lmstudio.ai" target="_blank" rel="noopener">lmstudio.ai</a>', 'Running open models on our own hardware.'],
              ['<a href="https://genai.owasp.org" target="_blank" rel="noopener">OWASP GenAI Security Project</a>', 'Top 10 risks for LLM applications and agents (Module 11).'],
            ]),
            n: 'Remind people that AI tooling changes monthly. Teach them to check the official docs for commands, the way we check vendor docs before a firmware upgrade.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'What makes an AI agent different from a classic automation script?', a: ['It runs faster', 'It decides its own next step from a goal and from the results it observes', 'It never needs credentials', 'It only works in the cloud'], c: 1, why: 'A script follows fixed steps you wrote. An agent chooses actions in a loop (think, act, observe) towards a goal, within the guardrails you set.' },
      { q: 'Where should your first agent experiments run?', a: ['On a domain controller', 'On your admin laptop with your own credentials', 'On a lab VM or in a Docker sandbox with no production credentials', 'Directly in production, with logging on'], c: 2, why: 'Start in an isolated environment. Production access comes later, after the security checklist in Module 11.' },
      { q: 'In this course, who approves risky actions such as restarting a production tunnel?', a: ['The agent itself', 'A human engineer (human-in-the-loop)', 'Nobody, it is automated', 'The vendor'], c: 1, why: 'Human-in-the-loop approval for risky actions is a core design principle of every agent we build.' },
    ],
  });
})();
