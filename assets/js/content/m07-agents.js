(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm7', num: 7, title: 'AI agents: the loop, the tools and the harness',
    summary: 'What turns a language model into an agent: tools, the agent loop, memory and guardrails. Agent types and workflow patterns, MCP, the harness around the model, frameworks and governance.',
    deck: [27, 37, 38, 44, 45, 46, 47],
    outcomes: ['Define an agent as model + tools + loop + memory + guardrails', 'Trace a think-act-observe loop and spot where a human must approve', 'Explain function calling and the Model Context Protocol (MCP)', 'Describe what a harness does and name its components', 'Choose between code-first frameworks, low-code platforms and agent assistants'],
    lessons: [
      {
        id: 'm7-1', title: 'From LLM to agent', mins: 15, deck: [37, 45],
        slides: [
          {
            t: 'An LLM alone cannot act',
            b: H.split(
              H.prose(
                'A language model only produces text. It cannot ping a host, read a log or open a ticket. Ask it whether FS-02 is up and it can only guess.',
                'An <b>agent</b> gives the model a <b>brain-and-hands</b> setup: the LLM is the brain that decides; <b>tools</b> are the actuators that act; a <b>loop</b> feeds the results back until the goal is reached.',
                H.quote('Agent = LLM (brain) + tools (actuators) + loop + memory + guardrails')
              ),
              H.fig(D.hub({ t: 'LLM', s: 'reasoning engine', c: 'ink' }, [
                { t: 'Tools', s: 'terminal, APIs, MCP', c: 'tl' },
                { t: 'Memory', s: 'facts, skills, history' },
                { t: 'Guardrails', s: 'approvals, sandbox', c: 'acc' },
                { t: 'Goal', s: 'from user / ticket' },
                { t: 'Environment', s: 'servers, network, ITSM', c: 'tl' },
              ], { h: 420, rx: 320, ry: 150, bw: 190 }))
            ),
          },
          {
            t: 'The spectrum of agency',
            b: H.fig(D.flow([
              { t: 'Chatbot', s: 'answers questions' },
              { t: 'RAG assistant', s: 'answers from our docs' },
              { t: 'Tool-using assistant', s: 'one tool call\nper request', c: 'tl' },
              { t: 'Agent', s: 'loops over many tools\ntowards a goal', c: 'acc' },
              { t: 'Multi-agent team', s: 'agents delegate\nto agents', c: 'ink' },
            ], { h: 104 }), 'Moving right adds capability and risk. Pick the least agency that solves the problem.') +
              H.note('key', 'Anthropic\'s advice in “Building effective agents” (2024) still holds: start with the simplest thing that works, a single prompt or a fixed workflow, and only add agent autonomy when the task needs flexibility.'),
          },
        ],
      },
      {
        id: 'm7-2', title: 'The agent loop', mins: 25, deck: [45],
        slides: [
          {
            t: 'Think → act → observe (ReAct)',
            b: H.split(
              H.fig(D.cycle([
                { t: 'Think', s: 'plan the next step', c: 'tl' },
                { t: 'Act', s: 'call a tool', c: 'acc' },
                { t: 'Observe', s: 'read the result' },
                { t: 'Check', s: 'done? safe? stuck?' },
              ], { t: 'Goal', s: 'until done or stopped' })),
              H.prose(
                'This loop is called <b>ReAct</b> (Reason + Act, 2022). Every turn of the loop is one model call: the model sees the goal, the history and the latest tool result, and decides what to do next.',
                'The loop stops when the model gives a final answer, when it hits a step or budget limit, when a human denies an action, or when you interrupt it.',
                'Good harnesses add a <b>plan</b> (a todo list), <b>reflection</b> (did that work?) and <b>stop conditions</b> (max steps, max cost).'
              )
            ),
          },
          {
            t: 'Watch an agent work a real ticket',
            b: H.widget('agentLoop', { scenario: 'intranet' }),
            n: 'Step through slowly. Ask the room to predict the next action before you click. At the approval step, deny it first to show the escalation path, then reset and approve. Point out that context grows with every step.',
          },
          {
            t: 'Where agent loops go wrong',
            b: H.cards([
              ['Looping', 'Retries the same failing command forever. Fix: step limits, “if it failed twice, change approach”.', 'stuck'],
              ['Goal drift', 'Starts “improving” things nobody asked for. Fix: narrow goal and explicit scope.', 'scope'],
              ['Fake success', 'Claims it fixed something it did not verify. Fix: require a verification step, as in every SKILL.md.', 'trust'],
              ['Over-reach', 'Uses a powerful tool where a read-only one would do. Fix: least privilege and approvals.', 'safety'],
              ['Context bloat', 'Huge tool outputs push out the goal. Fix: filtered tools, subagents, compression.', 'cost'],
              ['Injection', 'Obeys instructions hidden in data it read. Fix: Module 11.', 'security'],
            ]),
          },
        ],
      },
      {
        id: 'm7-3', title: 'Types of agents and workflow patterns', mins: 20, deck: [45],
        slides: [
          {
            t: 'Classic agent types',
            b: H.table(['Type', 'Decides by', 'IT analogy'], [
              ['Simple reflex', 'If-then rules on the current input', 'A monitoring rule: CPU > 90% → page'],
              ['Model-based reflex', 'Rules plus an internal picture of the world', 'Alert correlation that knows topology'],
              ['Goal-based', 'Planning actions that reach a goal', '“Restore Branch-2 connectivity”'],
              ['Utility-based', 'Choosing the best of several ways to reach the goal (cost, risk, time)', 'Pick the least disruptive fix'],
              ['Learning agent', 'Improves its behaviour from experience', 'Hermes writing a new skill after solving a ticket'],
            ]) + H.note('tip', 'LLM agents are mostly goal-based with some learning: they plan towards a goal, and harnesses like Hermes let them save what worked as skills and memory.'),
          },
          {
            t: 'Workflow patterns before full autonomy',
            b: H.cards([
              ['Prompt chaining', 'Fixed sequence of LLM steps: summarise → classify → draft reply.', 'workflow'],
              ['Routing', 'Classify the input, send it to a specialised prompt or agent.', 'workflow'],
              ['Parallelisation', 'Run checks side by side (security, style, policy), then combine.', 'workflow'],
              ['Orchestrator–workers', 'One LLM breaks the task down and delegates to workers.', 'agentic'],
              ['Evaluator–optimiser', 'One drafts, another critiques, loop until good enough.', 'agentic'],
              ['Autonomous agent', 'Open-ended loop with tools until the goal is met.', 'agentic'],
            ]) + H.note('it', 'Ticket routing is a <b>routing workflow</b>, not an autonomous agent. Diagnosing an unknown outage is where an <b>agent</b> earns its cost.'),
          },
          {
            t: 'How much autonomy?',
            b: H.widget('autonomy'),
            n: 'Map a few of our real tasks to levels. Most of our first agents should live at L1–L2; L3 is for proven runbooks on a schedule.',
          },
        ],
      },
      {
        id: 'm7-4', title: 'Tools, function calling and MCP', mins: 25, deck: [37],
        slides: [
          {
            t: 'Function calling: how a model “uses” a tool',
            b: H.split(
              H.prose(
                'The harness tells the model which tools exist: a <b>name</b>, a <b>description</b> and a <b>JSON Schema</b> for the arguments.',
                'When the model wants a tool, it replies with a structured <b>tool call</b> instead of prose. The <b>harness</b>, not the model, runs it, checks permissions and returns the result.',
                'This is why tool descriptions matter as much as code: the model chooses tools by reading them.'
              ),
              H.code('{\n  "name": "check_tunnel",\n  "description": "Return the status of a site-to-site IPsec tunnel. Read-only.",\n  "input_schema": {\n    "type": "object",\n    "properties": {\n      "tunnel": {"type": "string", "description": "e.g. branch2-hq"}\n    },\n    "required": ["tunnel"]\n  }\n}\n\n// model replies with:\n{"type": "tool_use", "name": "check_tunnel",\n "input": {"tunnel": "branch2-hq"}}', 'json', 'tool definition + tool call')
            ),
          },
          {
            t: 'MCP: one standard plug for every tool',
            b: H.split(
              H.prose(
                'Before MCP, every agent framework needed its own connector for every system: M agents × N systems integrations.',
                'The <b>Model Context Protocol</b> (Anthropic, Nov 2024; now an open standard used by most agent tools) defines one way for an agent (client) to discover and call tools on a <b>server</b>. Write one MCP server for ServiceNow and every MCP-capable agent can use it: Hermes, Claude Code, Copilot, Cursor and others.',
                'Servers run locally (stdio) or remotely (HTTP), and expose <b>tools</b>, <b>resources</b> (readable data) and <b>prompts</b>.'
              ),
              H.fig(D.columns([
                { h: 'MCP clients', items: ['Hermes Agent', 'Claude Code', 'GitHub Copilot', 'Cursor / IDEs'] },
                { h: 'MCP servers', c: 'acc', items: ['ITSM (tickets, KB)', 'Monitoring / SIEM', 'Network (NetBox, IPAM)', 'Filesystem, GitHub, DB'] },
              ], { bh: 40 }))
            ),
          },
          {
            t: 'Follow one MCP conversation',
            b: H.widget('mcpFlow'),
            n: 'Highlight message 8: the MCP server holds the ServiceNow credential, not the model. The model never sees the token. That is the right place to enforce least privilege.',
          },
          {
            t: 'Making our systems agent-ready is the IT team\'s job',
            b: H.split(
              H.steps([
                ['Inventory', 'Which systems would agents need? ITSM, AD, monitoring, IPAM/NetBox, backup, SIEM, CMDB.'],
                ['Expose safely', 'Wrap each as an MCP server or CLI with read-only tools first. Write tools come later, behind approvals.'],
                ['Describe well', 'Clear tool names and descriptions; return concise, filtered output.'],
                ['Authenticate properly', 'A dedicated service account per agent; scoped tokens; secrets in a vault, not in prompts.'],
                ['Log everything', 'Every tool call with who, what, when and the result, sent to the SIEM.'],
              ]),
              H.note('key', 'From the deck: <i>“This is the main IT team job: make tools and apps accessible to agents.”</i> Models are commodity. Well-built, secure tools on top of our systems are our advantage.', 'Our role')
            ),
          },
        ],
      },
      {
        id: 'm7-5', title: 'The harness: everything around the model', mins: 20, deck: [2],
        slides: [
          {
            t: 'What is an agent harness?',
            b: H.split(
              H.fig(D.stack([
                { t: 'Interfaces', s: 'CLI, TUI, desktop, Slack/Teams/Telegram gateway, API', c: 'ink' },
                { t: 'Session + context manager', s: 'history, compression, prompt caching' },
                { t: 'Agent loop + planner', s: 'think → act → observe, todo list, step limits', c: 'acc' },
                { t: 'Tool registry + toolsets', s: 'terminal, files, web, MCP, delegation', c: 'tl' },
                { t: 'Knowledge', s: 'memory, skills, context files, RAG' },
                { t: 'Guardrails', s: 'approvals, sandbox backend, allowlists, redaction', c: 'crit' },
                { t: 'Model adapter', s: 'any provider: API or local OpenAI-compatible' },
              ], { h: 46 })),
              H.prose(
                'The model is the engine; the <b>harness</b> is the rest of the car: steering, brakes, dashboard and seatbelts.',
                'Two agents using the <b>same model</b> can behave very differently because of their harness: which tools they get, how context is managed, and what safety checks run.',
                'Claude Code, Codex, Cursor and Hermes Agent are all harnesses. In Module 9 we install Hermes and configure each layer.'
              )
            ),
            n: 'The deck lists “Agents and their harnesses or concepts” as a key goal. This is the slide to pause on. Ask: which layer would you, as an infrastructure engineer, own? (Guardrails, tools, interfaces.)',
          },
          {
            t: 'Harness concepts you will configure',
            b: H.table(['Concept', 'What it is', 'In Hermes'], [
              ['System prompt / persona', 'Standing instructions and identity', '<code>SOUL.md</code>, <code>AGENTS.md</code>'],
              ['Toolsets', 'Groups of tools enabled per platform', '<code>hermes tools</code>'],
              ['Skills', 'On-demand procedures', '<code>~/.hermes/skills/*/SKILL.md</code>'],
              ['Memory', 'Durable facts across sessions', '<code>MEMORY.md</code>, <code>USER.md</code>'],
              ['Terminal backend', 'Where commands run', 'local, docker, ssh, …'],
              ['Approvals', 'Human-in-the-loop for dangerous commands', '<code>approvals.mode</code>'],
              ['Sessions', 'Conversations you can resume and search', '<code>hermes -c</code>, <code>/resume</code>'],
              ['Subagents', 'Isolated child agents for subtasks', '<code>delegate_task</code>'],
              ['Scheduler', 'Unattended runs', '<code>hermes cron</code>'],
              ['Gateway', 'Chat platforms', '<code>hermes gateway</code>'],
            ]),
          },
        ],
      },
      {
        id: 'm7-6', title: 'Frameworks and platforms', mins: 20, deck: [27, 44, 46],
        slides: [
          {
            t: 'Three ways to get an agent',
            b: H.fig(D.columns([
              { h: 'Code-first frameworks', items: ['LangChain / LangGraph', 'LlamaIndex', 'AutoGen / AG2', 'CrewAI', 'Haystack', 'OpenAI / Claude Agent SDKs'] },
              { h: 'Low-code SaaS', c: 'tl', items: ['Microsoft Copilot Studio', 'Gemini Enterprise agents', 'ServiceNow AI Agents', 'n8n, Power Automate + AI'] },
              { h: 'Ready-made agent harnesses', c: 'acc', items: ['Hermes Agent', 'Claude Code', 'Codex CLI', 'Gemini CLI'] },
            ], { bh: 38 })) + H.table(['', 'Choose when…'], [
              ['Code-first', 'You are building a product or a very specific pipeline and have developers. Full control, full responsibility.'],
              ['Low-code SaaS', 'You live in Microsoft 365 or Google Workspace and need governed business agents fast. Microsoft has done the heavy lifting.'],
              ['Agent harness', 'You want a capable general agent today, extended with skills and MCP. Ideal for IT operations teams. <b>This course.</b>'],
            ]),
          },
          {
            t: 'The code-first frameworks in one line each',
            b: H.table(['Framework', 'Idea', 'Good for'], [
              ['LangChain', 'Building blocks: models, prompts, tools, retrievers, chains', 'Quick prototypes, RAG'],
              ['LangGraph', 'Agents as explicit state graphs with checkpoints and human-in-the-loop nodes', 'Reliable, controllable production agents'],
              ['LlamaIndex', 'Data framework: ingestion, indexing, query engines', 'RAG over many document sources'],
              ['AutoGen / AG2', 'Conversations between multiple agents', 'Multi-agent research and experiments'],
              ['CrewAI', 'Role-based “crews” of agents with tasks', 'Readable multi-agent workflows'],
              ['Haystack', 'Pipelines for search, RAG and agents', 'Production search and RAG'],
              ['Streamlit', 'Not an agent framework: quick Python web UIs', 'A front end for your agent demo'],
            ]) + H.note('tip', 'All of these can use an <b>API token</b> (cloud model) or a <b>local</b> OpenAI-compatible endpoint (Ollama, vLLM) by changing the base URL.'),
          },
        ],
      },
      {
        id: 'm7-7', title: 'Governing agents at scale', mins: 10, deck: [47],
        slides: [
          {
            t: 'Agents need the same governance as users and servers',
            b: H.split(
              H.prose(
                'As agents spread, organisations face <b>shadow AI</b>: agents built in SaaS tools, local agents on laptops, agents in AWS and Google Cloud, all with credentials and nobody tracking them.',
                'Microsoft\'s answer is <b>Agent 365</b>, a control plane that treats agents like identities: discover shadow and local agents, govern and secure their access, sync with agents in AWS and Google Cloud, and manage SaaS agents from one place.',
                'Whatever product we use, the principles are the ones we already apply to service accounts.'
              ),
              H.table(['Control', 'For agents'], [
                ['Inventory', 'A registry of every agent: owner, purpose, model, tools'],
                ['Identity', 'Each agent has its own identity, never a shared admin account'],
                ['Access', 'Least privilege, scoped tokens, time-bound elevation'],
                ['Monitoring', 'Tool calls and actions logged to the SIEM'],
                ['Lifecycle', 'Review, re-certify, decommission'],
              ])
            ),
          },
        ],
      },
    ],
    quiz: [
      { q: 'Which combination best defines an AI agent?', a: ['A large model with a big context window', 'LLM + tools + a loop + memory + guardrails', 'A chatbot with a nice UI', 'A cron job that calls an API'], c: 1, why: 'The model reasons, tools act, the loop iterates towards a goal, memory carries knowledge, guardrails keep it safe.' },
      { q: 'In function calling, who actually executes the tool?', a: ['The LLM itself', 'The harness, after its permission and approval checks', 'The user, manually', 'The model vendor\'s cloud'], c: 1, why: 'The model only emits a structured request; the harness runs the tool and returns the result.' },
      { q: 'What problem does MCP solve?', a: ['It makes models smarter', 'It standardises how agents discover and call tools, so one server works with many agents', 'It replaces authentication', 'It compresses context'], c: 1, why: 'MCP turns M×N custom integrations into one standard protocol between clients and servers.' },
      { q: 'You need to route tickets to 5 queues. Which pattern fits best?', a: ['Fully autonomous agent', 'Routing workflow (classify, then dispatch)', 'Multi-agent debate', 'Evaluator-optimiser loop'], c: 1, why: 'Use the simplest pattern that works. Routing is a fixed workflow and needs no autonomy.' },
      { q: 'In an MCP setup, where should the ServiceNow API credential live?', a: ['In the system prompt', 'In the MCP server\'s configuration / secret store, never shown to the model', 'In the user\'s chat message', 'In MEMORY.md'], c: 1, why: 'The server holds the credential and enforces scope. The model only sees tool results.' },
      { q: 'What is an agent harness?', a: ['The GPU rack', 'The software around the model: loop, tools, context, memory, guardrails, interfaces', 'A type of fine-tuning', 'A prompt template'], c: 1, why: 'The harness turns a model into a usable, safe agent. The same model behaves differently in different harnesses.' },
    ],
  });
})();
