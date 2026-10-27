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
                { t: 'I · Agents for every department', s: 'sessions 32–35: managers, communications, finance, HR and more; a pilot plan', c: 'acc' },
                { t: 'H · Going further (optional)', s: 'sessions 30–31: the agent ecosystem, gateways and free models' },
                { t: 'G · Playbooks, workshop, capstone', s: 'sessions 26–29: your team\'s playbook and a helpdesk agent', c: 'acc' },
                { t: 'F · Beyond one agent', s: 'sessions 22–25: frameworks, Honcho, Multica, teams, security, guardrails' },
                { t: 'E · Hermes Agent', s: 'sessions 16–21: install, tools, skills, memory, MCP, cron, gateway, project', c: 'tl' },
                { t: 'D · Coding agents', s: 'sessions 11–15: Claude Code, Codex, Claude Desktop, automation, project', c: 'tl' },
                { t: 'C · AI agents', s: 'sessions 9–10: the loop, tools, MCP, the harness' },
                { t: 'B · Understanding the machine', s: 'sessions 4–8: ML, inside an LLM, training, prompting, RAG, local models' },
                { t: 'A · Big picture and using LLMs', s: 'sessions 1–3: AI, ML, LLMs, agents, pricing, caching, gateways', c: 'ink' },
              ], { h: 50 }), 'Each phase builds on the one below it. Phase B is optional depth in places; the hands-on phases D and E get the most time.')
            ),
            n: 'Read the stack from the bottom. Phase A gets everyone to the same vocabulary and shows how to use and pay for models. Phase B explains how the brain works; the optional sessions can be dropped. Phases D and E are where we spend most of the course: real coding agents and Hermes. The session plan page lists every session and lets the class decide how many to take.',
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
              H.prose('The row of <b>ports</b> above each slide is your patch panel: a lit port means you have opened that slide. Session cards on the home page light up as you go.', 'Panels marked <span class="label" style="color:var(--amber)">Try it</span> are live exercises. Change the inputs and watch what happens. They run entirely in your browser.', 'Each module ends with a checkpoint quiz. Best scores are saved in this browser.')
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
      {
        id: 'm0-4', title: 'AI, ML, LLMs and agents in one picture', mins: 20,
        slides: [
          {
            t: 'From data to delegation: the whole course in one picture',
            b: H.fig(D.flow([
              { t: 'Data', s: 'examples, text, logs' },
              { t: 'Machine learning', s: 'finds patterns', c: 'tl' },
              { t: 'LLM', s: 'predicts the next word' },
              { t: 'Agent', s: 'LLM + tools + a loop', c: 'acc' },
              { t: 'Your work', s: 'delegated, with approvals', c: 'ok' },
            ], { h: 110 }), 'Sessions 1–8 cover the left half. Sessions 9–29 spend their time on the right half.') + H.note('key', 'This course ends with you delegating real tasks to agents. Everything before that exists so that you know what is on the other end, and when not to trust it.'),
            n: 'Say the whole story in 90 seconds, pointing along the arrow. We start with examples, a machine learns patterns from them, a very large model of language learns to predict the next word, an agent wraps that model in a loop with tools, and you hand it real work. Tell people not to worry about any word yet; each one gets a slide.',
          },
          {
            t: 'Machine learning: examples in, rules out',
            b: H.fig(D.columns([
              { h: 'Classic program', c: 'ink', items: ['You write the rules', 'Rules + data go in', 'Answers come out', 'Firewall rule: block port 23'] },
              { h: 'Machine learning', c: 'acc', items: ['You supply examples with answers', 'Examples go in', 'The machine finds the rules', 'Spam filter learned from emails'] },
            ], { bh: 44 })) + H.note('it', 'A firewall rule is a program you wrote. A mail filter trained on last month\'s spam is machine learning: nobody wrote its rules, so you test it instead of reading it.'),
            n: 'Ask each person to name one tool at work that is a rule and one that learned from data. Anomaly detection in monitoring and spam filters are the usual learned ones. The takeaway: with learned systems you measure accuracy, you do not read the source.',
          },
          {
            t: 'An LLM is a next-word predictor trained on a huge amount of text',
            b: H.split(
              H.prose(
                'A <b>large language model</b> reads text as small pieces called <b>tokens</b> and, at every step, scores which token is likely to come next. It picks one, appends it, and repeats.',
                'That one skill, done at enormous scale, gives you summaries, translation, code, and answers. It also explains why the model can sound sure and be wrong.'
              ),
              H.fig(D.flow([
                { t: 'To fix a slow network, first check the …' },
                { t: 'Scores', s: 'latency 31% · DNS 22% · cable 14% …', c: 'acc' },
                { t: 'Pick one', s: '“latency”' },
              ], { h: 100 }))
            ),
            n: 'Keep it plain. The model does not look things up and does not know that it knows. It continues text plausibly. Session 5 opens this up; for now just plant the idea that answers are generated, not retrieved, which is why we verify them.',
          },
          {
            t: 'An agent is an LLM with tools, in a loop',
            b: H.fig(D.cycle([
              { t: 'Think', s: 'what is the next step?' },
              { t: 'Act', s: 'call a tool', c: 'acc' },
              { t: 'Observe', s: 'read the result', c: 'tl' },
              { t: 'Decide', s: 'done, or loop again' },
            ], { t: 'Goal', s: 'from you' }, { h: 400 }), 'A chatbot answers once. An agent keeps going until the goal is met or it needs you.') + H.note('warn', 'A model with tools can change real systems. That is the whole reason this course spends so long on guardrails and approvals.'),
            n: 'Contrast with the chat window they already know. A chatbot gives one answer. An agent plans, runs a command, reads the output, and decides again. Sessions 9 and 10 take the loop apart; sessions 11 to 21 let you use agents that already exist.',
          },
          {
            t: 'Not only for IT: the same loop in every department',
            b: H.cards([
              ['Managers', 'A weekly briefing from many reports; meeting preparation; options for a decision.', 'briefing'],
              ['Communications and PR', 'Coverage digests; drafts from a fact sheet; one message for every channel.', 'drafting'],
              ['Accounting and finance', 'Invoice checks; reconciliation; variance explanations.', 'checking'],
              ['HR, sales, service, admin', 'Policy answers; reply drafts; schedules and status reports.', 'and more'],
              ['IT', 'Tickets, monitoring, changes and coding, the rest of this course.', 'operations'],
            ], 3) + H.note('key', 'Everywhere the pattern is the same: the agent prepares, a person approves. Sessions 32 to 35 are written for people outside IT.'),
            n: 'Say this early, so people from every department know the course is for them. Ask each person to name the department they work in. IT colleagues will go deep on coding agents and Hermes; everyone else has a track of sessions with the same ideas applied to briefings, messages, invoices and policies.',
          },
          {
            t: 'By the end you can…',
            b: H.cards([
              ['Use models well', 'Choose a model, set it up, read its price and control its cost.', 'sessions 2–3'],
              ['Delegate to a coding agent', 'Run Claude Code or Codex on a repository, with a brief and a review.', 'sessions 11–15'],
              ['Run Hermes Agent', 'Install it, give it skills, memory, a schedule and a chat gateway.', 'sessions 16–21'],
              ['Know the wider toolbox', 'Recognise Open WebUI, LangChain, LangGraph, LlamaIndex, Honcho and Multica.', 'session 22'],
              ['Keep it safe', 'Apply guardrails, approvals and defences against prompt injection.', 'sessions 24–25'],
              ['Put it to work', 'Write your team\'s playbook and demo a helpdesk agent.', 'sessions 26–29'],
              ['Use it in your department', 'Briefings, drafts and checks with a person approving, and a pilot plan.', 'sessions 32–35'],
            ], 3),
            n: 'Read the six cards and ask each person which one they care about most. Use the answers to decide with the class which optional sessions to keep. The session plan page shows all of them.',
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
