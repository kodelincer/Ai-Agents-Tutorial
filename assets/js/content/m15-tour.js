(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm15', num: 15, title: 'A tour of the wider agent toolbox',
    summary: 'A short introduction, with no labs, to tools for building your own agent (Open WebUI, LangChain, LangGraph, LlamaIndex), to Honcho for memory and to Multica for managing agent teammates.',
    outcomes: ['Say what Open WebUI, LangChain, LangGraph and LlamaIndex are for, and when you would reach for each', 'Explain what Honcho adds on top of an agent\'s built-in memory', 'Explain what Multica does and how it differs from Hermes kanban and CI agents'],
    lessons: [
      {
        id: 'm15-1', title: 'Build your own agent: the options', mins: 25,
        slides: [
          {
            t: 'Four names you will hear',
            b: H.cards([
              ['Open WebUI', 'A self-hosted AI platform with a chat interface. It works with Ollama and any OpenAI-compatible API, including OpenRouter, and adds document chat (RAG), tools and custom assistants. No code needed.', 'no code'],
              ['LangChain', 'A framework of building blocks for LLM applications and agents: models, tools and retrievers behind one interface, so you can swap providers.', 'code'],
              ['LangGraph', 'A low-level framework for long-running, stateful agents written as graphs. Offers durable execution, human-in-the-loop pauses and memory.', 'code · control'],
              ['LlamaIndex', 'An open-source framework for agentic applications over your own documents: load, index and query data (RAG), plus agents.', 'code · data'],
            ], 2) + H.note('key', 'This is an introduction. We do not build with these in class. The goal is that when a colleague says “we could do that in LangGraph” you know what it is and when it makes sense.'),
            n: 'Keep this to ten minutes. Ask who has seen any of these names. The pitch for each is one sentence. Say clearly: Hermes and the coding agents already give you a working harness, so building your own is for products and special workflows, not for daily use.',
          },
          {
            t: 'A ladder from ready-made to build-it-yourself',
            b: H.fig(D.stack([
              { t: 'Hermes Agent · Claude Code · Codex', s: 'a ready-made harness: install and use', c: 'ok' },
              { t: 'Open WebUI', s: 'a ready-made chat app: configure and use', c: 'ok' },
              { t: 'LlamaIndex', s: 'a toolkit for your data and RAG: write code' },
              { t: 'LangChain', s: 'components for apps and agents: write code' },
              { t: 'LangGraph', s: 'a runtime for stateful graphs: write more code, get more control', c: 'tl' },
              { t: 'The model API directly', s: 'everything yourself: the lab in session 3', c: 'acc' },
            ], { h: 52 }), 'Going down the ladder you get more control and write more code.'),
            n: 'Walk down the ladder from the top. The point: start at the top. Move down only when the tool above cannot do what you need. Most IT automation never needs to go below Hermes.',
          },
          {
            t: 'A taste of each',
            b: H.split(
              H.code('docker run -d -p 3000:8080 \\\n  --add-host=host.docker.internal:host-gateway \\\n  -v open-webui:/app/backend/data \\\n  --name open-webui --restart always \\\n  ghcr.io/open-webui/open-webui:main\n# then open http://localhost:3000', 'bash', 'Open WebUI (from its README)') +
              H.code('import os\nfrom langchain_openai import ChatOpenAI\n\nmodel = ChatOpenAI(\n    base_url=os.environ["BASE_URL"],\n    api_key=os.environ["API_KEY"],\n    model=os.environ["MODEL"],\n)\nprint(model.invoke("Explain DHCP in two sentences.").content)', 'python', 'LangChain on any gateway'),
              H.code('from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    ticket: str\n    team: str\n\ndef route(state: State) -> dict:\n    team = "network" if "vpn" in state["ticket"].lower() else "helpdesk"\n    return {"team": team}\n\ngraph = StateGraph(State)\ngraph.add_node("route", route)\ngraph.add_edge(START, "route")\ngraph.add_edge("route", END)\napp = graph.compile()\nprint(app.invoke({"ticket": "VPN drops every hour"}))', 'python', 'LangGraph: a two-node graph') +
              H.code('from llama_index.core import VectorStoreIndex, SimpleDirectoryReader\n\ndocuments = SimpleDirectoryReader("my_runbooks").load_data()\nindex = VectorStoreIndex.from_documents(documents)\nprint(index.as_query_engine().query("How do we renew the VPN certificate?"))', 'python', 'LlamaIndex (from its README)')
            ),
            n: 'Do not run these. Point at the shape of each. Open WebUI is one command and a browser. LangChain is a model object you can call. LangGraph is nodes and edges: a graph you control, which is why people choose it when they need approvals and state. LlamaIndex is three lines from a folder of documents to a question. The LangChain and LangGraph snippets were run against a test gateway; LlamaIndex needs an embedding model and key as its README explains.',
          },
          {
            t: 'Which one for which job',
            b: H.table(['You need…', 'Reach for'], [
              ['A team chat page on your own server, with your documents and several models', 'Open WebUI'],
              ['An agent that works on your servers, repos and tickets starting today', 'Hermes Agent or a coding agent'],
              ['Questions answered from your runbooks inside your own application', 'LlamaIndex'],
              ['A quick prototype with many integrations', 'LangChain'],
              ['An agent with explicit steps, saved state and human approval gates', 'LangGraph'],
            ]) + H.note('warn', 'These projects change quickly and their APIs move between versions. Read the current documentation before you build anything, and pin the versions you use.'),
            n: 'Invite one real use case from the room and place it on the table. Most will land on Hermes, the coding agents or Open WebUI. That is a good outcome.',
          },
        ],
      },
      {
        id: 'm15-2', title: 'Honcho: memory that models the user', mins: 20,
        slides: [
          {
            t: 'What Honcho is',
            b: H.split(
              H.prose(
                'Honcho, from Plastic Labs, is open-source <b>memory infrastructure for stateful agents</b>. It is meant to help an agent understand changing people, agents, groups and projects over time, not just search old text.',
                'You <b>store</b> messages and events, Honcho <b>reasons</b> over them in the background, and you <b>query</b> what it learned from any model or framework.'
              ),
              H.fig(D.flow([
                { t: 'Store', s: 'messages and events' },
                { t: 'Reason', s: 'in the background', c: 'acc' },
                { t: 'Query', s: 'context · search · chat' },
              ], { h: 96 }))
            ) + H.note('tip', 'You can use the managed service at api.honcho.dev or run it yourself with the Honcho CLI or Docker. It is open source under AGPL-3.0, so read the licence before you embed or modify it.'),
            n: 'Keep it conceptual. The one sentence to remember: Honcho does not just save what was said, it builds a model of the person and answers questions about them. Compare it with the MEMORY.md file in Hermes, which is a short list of notes the agent writes itself.',
          },
          {
            t: 'Peers, sessions and what it builds',
            b: H.table(['Concept', 'What it is'], [
              ['Workspace', 'The top-level container. It keeps data for different assistants or products apart.'],
              ['Peer', 'Any participant: a human user or an AI agent. Both are first-class.'],
              ['Session', 'A conversation context. Many peers can take part, and a peer can be in many sessions.'],
              ['Message', 'One unit of data on a session, labelled by the peer who produced it.'],
              ['Conclusions', 'What Honcho extracted about a peer from the conversations.'],
              ['Representation and peer card', 'A snapshot of what it knows about a peer, and a compact identity summary.'],
              ['Session context', 'A prompt-ready bundle for long conversations that you hand to the model.'],
            ]),
            n: 'Peers are the idea that matters: the agent is a peer too, so Honcho can keep what it knows about the user and what the agent itself has done, and even what one peer knows about another.',
          },
          {
            t: 'A small taste of the API',
            b: H.code('import os\nfrom honcho import Honcho\n\nhoncho = Honcho(workspace_id="it-helpdesk", api_key=os.environ["HONCHO_API_KEY"])\n\nuser = honcho.peer("alice")\nagent = honcho.peer("triage-agent")\nsession = honcho.session("ticket-4821")\n\nsession.add_messages([\n    user.message("My VPN drops every hour since the laptop swap."),\n    agent.message("Noted. Let me check the client version and the lease time."),\n])\n\n# the reasoning happens in the background; later:\nprint(user.chat("What do we know about this user\'s setup and problems?"))\ncontext = session.context(summary=True, tokens=2000)   # prompt-ready history', 'python', 'adapted from the Honcho README') +
              H.note('warn', 'Reasoning is asynchronous: new messages may take a moment to show up in answers. Sign in at app.honcho.dev for an API key, or run it locally with the CLI.'),
            n: 'This is adapted from the README, with the method names checked against the Python package. Do not run it in class. Show the three calls: add_messages stores, chat asks, context returns something you can paste into a prompt.',
          },
          {
            t: 'Where it meets Hermes and the coding agents',
            b: H.code('# Hermes: pick Honcho as an external memory provider\nhermes memory setup      # choose "honcho", point at api.honcho.dev or your local server\nhermes memory status\n\n# Claude Code (plugin) and Codex (npm package), from the Honcho README\n/plugin marketplace add plastic-labs/claude-honcho\nnpm install -g @honcho-ai/codex-honcho\n\n# one key for all of them\nhoncho init              # writes ~/.honcho/config.json', 'bash', 'integrations') +
              H.cards([
                ['Alongside, not instead', 'In Hermes an external provider runs next to the built-in MEMORY.md and USER.md.', 'Hermes'],
                ['Shared memory', 'Two tools pointed at the same Honcho workspace share one memory.', 'cross-tool'],
                ['Personal data', 'Memory about people is sensitive. Decide who may be remembered, where it is stored, and who can read it.', 'policy'],
              ]),
            n: 'Ask whether the built-in memory is enough for them. For one engineer and one agent it usually is. Honcho earns its place with many users, long histories and several agents that should share what they know. Raise the data-protection point: a profile of each helpdesk caller is personal data.',
          },
        ],
      },
      {
        id: 'm15-3', title: 'Multica: a task board for agent teammates', mins: 20,
        slides: [
          {
            t: 'Agents that show up on the board',
            b: H.split(
              H.prose(
                'Multica is a source-available workspace where you <b>assign work to AI coding agents the way you would assign it to a teammate</b>. They pick up the issue, report progress, raise blockers and hand it back for review.',
                'It does not ship a model. It drives the agent command-line tools you already have installed and signed in, such as Claude Code, Codex and Hermes. Its README lists 26 supported today.'
              ),
              H.fig(D.flow([
                { t: 'Board', s: 'web · desktop · mobile' },
                { t: 'Server', s: 'Go + PostgreSQL' },
                { t: 'Daemon', s: 'on your machine', c: 'acc' },
                { t: 'Agent CLI', s: 'Claude Code · Codex · Hermes …' },
              ], { h: 100 }), 'The daemon runs next to your code; the server coordinates.')
            ),
            n: 'The design choice to underline: the agent runs on a machine you control, using the CLI you already pay for. Multica is the coordination layer, not another model.',
          },
          {
            t: 'The ideas to know',
            b: H.cards([
              ['Runtimes', 'A machine where agents work: a laptop or a server with the agent CLIs installed.', 'where'],
              ['Agents as teammates', 'Each has a name, a provider and a runtime, and appears on the board like a person.', 'who'],
              ['Issues and assignment', 'Assign an issue to an agent. It works, comments, and moves it to review.', 'what'],
              ['Squads', 'Agents and people on one team; the leader routes the work.', 'teams'],
              ['Skills', 'A solved problem saved as a playbook every agent can reuse.', 'reuse'],
              ['Autopilots', 'Recurring jobs such as standups and audits on a schedule.', 'cron'],
              ['Review gates', 'Work lands in review, not in main. A human decides what ships.', 'control'],
              ['Execution log and usage', 'Replay every tool call and see what each run cost.', 'audit'],
            ], 4),
            n: 'Map each card to something they already know: runtime is the lab VM, squad is the Hermes team in session 23, skills are the SKILL.md files from sessions 14 and 18, autopilots are cron, review gates are the human approval step. The new thing is the shared board.',
          },
          {
            t: 'Multica next to what we already use',
            b: H.table(['', 'Hermes kanban', 'Agents in GitHub (@claude)', 'Multica'], [
              ['Where tasks live', 'Hermes board on your machine', 'GitHub issues and pull requests', 'Its own board, with your Git host connected'],
              ['Which agents', 'Hermes profiles', 'Claude Code (and Codex actions)', 'Many CLIs through one board'],
              ['Who runs the agent', 'Your machine', 'A CI runner', 'A daemon on a machine you choose'],
              ['Best for', 'A team of Hermes agents (session 23)', 'Code review and fixes inside GitHub', 'Mixed agents and people on one board'],
            ]),
            n: 'Be even-handed: none of these replaces the others. If a team already lives in GitHub issues and uses Claude Code, the GitHub action may be all they need. Multica starts to pay off when several agents of different kinds and several people share work.',
          },
          {
            t: 'Before you adopt it',
            b: H.steps([
              ['Agents act with the daemon machine\'s permissions', 'Everything from sessions 24 and 25 applies: sandbox, least privilege, read-only first.'],
              ['Pilot on a sandbox repository', 'Not on production infrastructure code.'],
              ['Read the licence', 'The Multica License is Apache 2.0 plus extra conditions on hosted services, commercial embedding and branding.'],
              ['Expect change', 'Its README says it releases most weekdays. Pin a version and read the release notes.'],
              ['Read its security model', 'What an agent can reach and what it cannot is documented on its website.'],
            ]) + H.note('key', 'Multica is a coordination tool. The safety still comes from your guardrail policy and from who is allowed to assign work to which agent.'),
            n: 'This is the same adoption checklist we use for any agent tool. Close the tour by asking each person to name one of the six tools in this module they would try first, and why.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'Which tool gives a team a self-hosted chat page that works with Ollama and any OpenAI-compatible API, with no code?', a: ['LangGraph', 'Open WebUI', 'LlamaIndex', 'Multica'], c: 1, why: 'Open WebUI is a ready-made, self-hosted AI platform with a chat interface; the others are frameworks or coordination tools.' },
      { q: 'You need an agent with explicit steps, saved state and a human approval gate. Which framework fits best?', a: ['LangGraph', 'Open WebUI', 'A bigger model', 'Honcho'], c: 0, why: 'LangGraph is built for stateful, long-running agents as graphs, with durable execution and human-in-the-loop pauses.' },
      { q: 'What does Honcho add to an agent that already has a MEMORY.md file?', a: ['A faster model', 'A service that reasons over conversations to model users and agents over time, and can be queried', 'A vector database only', 'Free hosting'], c: 1, why: 'Honcho stores messages, reasons in the background and lets you query what it learned about each peer; external providers in Hermes run alongside built-in memory.' },
      { q: 'What does Multica provide?', a: ['A new language model', 'A board where agents and people share work, driving agent CLIs that run on machines you control', 'A replacement for Git', 'A GPU cluster'], c: 1, why: 'Multica coordinates agents like teammates; it does not ship a model and it runs agents through the CLIs you already installed.' },
    ],
  });
})();
