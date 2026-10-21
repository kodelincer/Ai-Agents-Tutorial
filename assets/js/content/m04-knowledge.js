(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm4', num: 4, title: 'Knowledge: RAG, vector databases and memory',
    summary: 'Where a model\'s knowledge comes from, how to give it ours safely with retrieval-augmented generation, and how agents remember between sessions.',
    deck: [18, 19, 31, 33, 41],
    outcomes: ['Explain internal (parametric) vs external knowledge and the knowledge cut-off', 'Describe each stage of a RAG pipeline including chunking and reranking', 'Pick prompting, RAG or fine-tuning for a use case', 'Explain the kinds of agent memory and how Hermes implements them'],
    lessons: [
      {
        id: 'm4-1', title: 'Internal vs external knowledge', mins: 10, deck: [18],
        slides: [
          {
            t: 'Two places knowledge can live',
            b: H.split(
              H.table(['', 'Internal (in the weights)', 'External (given at run time)'], [
                ['How it gets there', 'Learned during training', 'Retrieved and placed in the prompt: RAG, tool results, files'],
                ['Freshness', 'Frozen at the training cut-off date', 'As fresh as the source system'],
                ['Private data', 'Knows nothing about ACME', 'Can use our runbooks, CMDB, tickets'],
                ['Traceability', 'Cannot cite where a fact came from', 'Can cite the exact document and line'],
                ['Updating', 'Re-train (expensive)', 'Update the document (cheap)'],
              ]),
              H.note('key', 'Use <b>internal knowledge</b> for general skills: language, reasoning, how DNS works, how to write PowerShell. Use <b>external knowledge</b> for anything specific to us or anything that changes: IP plans, contacts, current incidents, firmware versions.')
            ),
            n: 'Ask: “Which model knows our VLAN plan?” None of them, and none should. That knowledge belongs in a system the agent queries with permissions.',
          },
        ],
      },
      {
        id: 'm4-2', title: 'Vector databases and semantic search', mins: 15, deck: [19],
        slides: [
          {
            t: 'Indexing our documents',
            b: H.stack(
              H.fig(D.flow([
                { t: 'Sources', s: 'runbooks, KB, Confluence,\nclosed tickets, PDFs' },
                { t: 'Chunk', s: 'split into ~300–800\ntoken pieces' },
                { t: 'Embed', s: 'embedding model →\none vector per chunk', c: 'tl' },
                { t: 'Vector database', s: 'vectors + text +\nmetadata (ACLs!)', c: 'acc' },
              ], { h: 110 }), 'Indexing runs once, then incrementally whenever a document changes.'),
              H.cards([
                ['Vector DB options', 'pgvector (PostgreSQL extension), Qdrant, Weaviate, Milvus, Chroma, OpenSearch / Elasticsearch k-NN. Start with pgvector if you already run PostgreSQL.', 'tools'],
                ['Chunking matters', 'Too small loses context, too big dilutes meaning. Split on headings, keep the title in every chunk, overlap a little.', 'quality'],
                ['Metadata', 'Store source, date, owner, team and <b>who may read it</b>. Filter by permissions at query time.', 'security'],
              ])
            ),
          },
          {
            t: 'Keyword vs semantic vs hybrid search',
            b: H.table(['Search type', 'Finds', 'Misses', 'Best for'], [
              ['Keyword (BM25)', 'Exact terms: error codes, hostnames, KB IDs', 'Synonyms: “storage beeping” ≠ “RAID degraded”', 'Event IDs, part numbers, hostnames'],
              ['Semantic (vectors)', 'Meaning, paraphrases, other languages', 'Exact rare tokens like <code>0x8007052E</code>', 'Natural-language questions'],
              ['Hybrid', 'Both, merged', 'Little', 'Production RAG over IT docs (recommended)'],
            ]) + H.note('it', 'IT text is full of exact identifiers (Event 4740, CVE-2024-3400, FS-02). Use hybrid search so “error 0x80070005 on FS-02” finds the right article.'),
          },
        ],
      },
      {
        id: 'm4-3', title: 'RAG: retrieval-augmented generation', mins: 25, deck: [33, 19],
        slides: [
          {
            t: 'The RAG pipeline at query time',
            b: H.fig(D.flow([
              { t: 'Question', s: 'from user or agent' },
              { t: 'Embed', s: 'same embedding model' },
              { t: 'Retrieve', s: 'top-k nearest chunks', c: 'tl' },
              { t: 'Rerank', s: 'cross-encoder\nre-scores top-k', c: 'tl' },
              { t: 'Augment', s: 'chunks + question\ninto the prompt', c: 'acc' },
              { t: 'Generate', s: 'answer with\ncitations', c: 'ok' },
            ], { h: 104 }), 'Retrieval finds candidates fast; the reranker reads question and chunk together to put the best ones first; the LLM only sees the winners.'),
          },
          {
            t: 'Run the pipeline yourself',
            b: H.widget('rag'),
            n: 'Step through each stage with the first question. Then tick “Turn RAG off”: fluent but generic. Then ask “How do I order a new laptop?”: no runbook, so a well-built system declines instead of guessing.',
          },
          {
            t: 'Reranking and other quality levers',
            b: H.cards([
              ['Reranking', 'A cross-encoder reads (question, chunk) pairs together. Slower than vector search, so run it only on the top 20–50. Often the single biggest quality gain.', '+ precision'],
              ['Query rewriting', 'Let the LLM rewrite “it’s broken again” into a self-contained query using the conversation.', '+ recall'],
              ['Similarity threshold', 'If nothing scores high enough, say “I don\'t know”. Never stuff irrelevant chunks into the prompt.', '− hallucination'],
              ['Citations', 'Make the model cite chunk IDs. Show them to users. Check them in evals.', '+ trust'],
              ['Agentic RAG', 'Give the agent a <code>search_kb</code> tool so it decides when and what to search, and can search again.', 'agents'],
              ['Freshness', 'Re-index on change; store dates; prefer newer docs when they conflict.', 'ops'],
            ]),
          },
          {
            t: 'RAG security: the index is a copy of your data',
            b: H.split(
              H.list([
                '<b>Permissions</b>: if HR documents are indexed, a helpdesk agent must not retrieve them. Enforce ACLs at query time with metadata filters.',
                '<b>Secrets</b>: scan and redact passwords, keys and connection strings before indexing.',
                '<b>Poisoning</b>: anyone who can edit a wiki page can plant instructions for your agent (Module 11). Treat retrieved text as data, never as instructions.',
                '<b>Deletion</b>: “forget this document” means deleting its chunks and vectors, not just the source file.',
              ]),
              H.note('it', 'Map it to what you know: the vector DB is like a file server holding copies of everything. It needs the same backups, ACLs, audit logging and data-classification labels.')
            ),
          },
        ],
      },
      {
        id: 'm4-4', title: 'Prompting vs RAG vs fine-tuning', mins: 10, deck: [31],
        slides: [
          {
            t: 'Three levers, in the order you should pull them',
            b: H.stack(
              H.fig(D.quad('Effort and cost to build and maintain', 'Need for private or fresh knowledge', [
                { t: 'Prompt engineering', x: 0.12, y: 0.15 },
                { t: 'RAG', x: 0.42, y: 0.85, c: 'tl' },
                { t: 'Agentic RAG + tools', x: 0.62, y: 0.92, c: 'tl' },
                { t: 'Fine-tuning', x: 0.78, y: 0.3 },
                { t: 'Pre-training', x: 0.97, y: 0.5 },
              ], ['cheap · general knowledge', 'costly · general knowledge', '', ''])),
              H.table(['', 'Prompting', 'RAG', 'Fine-tuning'], [
                ['Adds knowledge', 'A little (fits in the prompt)', 'Yes, large and fresh', 'Poorly, and it goes stale'],
                ['Changes behaviour or format', 'Yes', 'No', 'Yes, strongly'],
                ['Time to first result', 'Minutes', 'Days', 'Weeks'],
                ['Cites sources', 'No', 'Yes', 'No'],
              ])
            ),
          },
        ],
      },
      {
        id: 'm4-5', title: 'Memory: how agents remember', mins: 20, deck: [41],
        slides: [
          {
            t: 'Four kinds of memory',
            b: H.cards([
              ['Working memory', 'The context window: this conversation, tool outputs, retrieved docs. Gone when the session ends or is compressed.', 'short-term'],
              ['Semantic memory', 'Durable facts: “FS-02 is the finance file server”, “Reza prefers short answers”. In Hermes: <code>MEMORY.md</code> and <code>USER.md</code>.', 'facts'],
              ['Episodic memory', 'What happened before: past sessions and tickets, searchable. In Hermes: <code>session_search</code> over past conversations.', 'history'],
              ['Procedural memory', 'How to do things: step-by-step procedures. In Hermes: <b>skills</b> (<code>SKILL.md</code>), which the agent can write itself.', 'skills'],
            ], 4),
          },
          {
            t: 'Memory in Hermes, concretely',
            b: H.split(
              H.code('~/.hermes/memories/MEMORY.md   (~2,200 chars, agent\'s own notes)\n══════════════════════════════════════\nLab VM runs Ubuntu 24.04 with Docker; agent works in /srv/lab\n§\nRunbooks live in /srv/runbooks (git repo, read-only)\n§\nNever restart network devices without L2 approval\n\n~/.hermes/memories/USER.md     (~1,375 chars, about you)\n══════════════════════════════════════\nUser is a network engineer at ACME; prefers concise answers\n§\nTime zone Asia/Tehran; works Sat–Wed', 'text', 'what gets injected at session start'),
              H.prose(
                'Memory is deliberately <b>small</b>. It is loaded into the system prompt at the start of every session, so it must hold only what is worth paying for on every call.',
                'It is a <b>frozen snapshot</b>: facts saved during a session appear in the <i>next</i> session. Start a new session (<code>/new</code>) at natural boundaries.',
                'Longer procedures belong in <b>skills</b>, which load only when relevant. Large reference material belongs in <b>RAG</b>.'
              )
            ) + H.note('warn', 'A model saying “I\'ll remember that” is just text. Memory only persists if it actually called the <code>memory</code> tool. Check with <code>cat ~/.hermes/memories/MEMORY.md</code>. Small local models often fake this.'),
            n: 'This is a common confusion in pilots. Show the file on disk during the lab.',
          },
          {
            t: 'Storing knowledge: decision guide',
            b: H.table(['You want the agent to…', 'Put it in', 'Why'], [
              ['Always know a short fact (“prod change window is Sat 22:00”)', '<code>MEMORY.md</code> or <code>AGENTS.md</code>', 'Small, needed every session'],
              ['Follow a procedure when a matching task appears', 'A <b>skill</b> (<code>SKILL.md</code>)', 'Loaded only when relevant'],
              ['Answer from hundreds of documents', '<b>RAG</b> / MCP search tool', 'Too big for the prompt'],
              ['Know project conventions in one repo or folder', '<code>AGENTS.md</code> in that folder', 'Loaded by working directory'],
              ['Recall what happened last Tuesday', '<code>session_search</code>', 'Episodic history'],
              ['Know live state (is the tunnel up?)', 'A <b>tool</b> call', 'Never cache live state as memory'],
            ]),
          },
        ],
      },
    ],
    quiz: [
      { q: 'Why can\'t a model answer “what is our VPN split-DNS suffix list?” from its own weights?', a: ['The question is too long', 'That private, changing fact was never in its training data; it must come from external knowledge', 'Models cannot talk about DNS', 'It needs a higher temperature'], c: 1, why: 'Internal knowledge is frozen at training time and contains no private ACME data. Retrieve it at run time.' },
      { q: 'What does a reranker do in a RAG pipeline?', a: ['Splits documents into chunks', 'Re-scores retrieved chunks by reading question and chunk together, putting the best first', 'Generates the final answer', 'Encrypts the vector DB'], c: 1, why: 'A cross-encoder reranker is slower but more accurate than vector similarity, so it runs on the top few dozen candidates.' },
      { q: 'IT documents contain exact identifiers like Event ID 4740 or CVE numbers. Which search approach is best?', a: ['Pure semantic search', 'Pure keyword search', 'Hybrid (keyword + semantic)', 'No search, just a bigger model'], c: 2, why: 'Hybrid search catches exact identifiers (keyword) and paraphrases (semantic).' },
      { q: 'Where should a 12-step “unlock AD account safely” procedure live in Hermes?', a: ['MEMORY.md', 'A skill (SKILL.md)', 'The .env file', 'The model weights'], c: 1, why: 'Procedures are procedural memory: skills load only when relevant and do not use up the small always-on memory budget.' },
      { q: 'The agent said “Saved to memory”, but the next session it forgot. What do you check first?', a: ['Restart the server', 'Whether the fact is actually in ~/.hermes/memories/MEMORY.md (did it call the memory tool?)', 'Increase temperature', 'Reinstall Hermes'], c: 1, why: 'Models, especially small ones, sometimes claim a save without calling the tool. Verify the file.' },
    ],
  });
})();
