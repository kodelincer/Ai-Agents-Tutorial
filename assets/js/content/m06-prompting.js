(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm6', num: 6, title: 'Prompt and context engineering',
    summary: 'Writing instructions models follow reliably, managing what goes into the context window, and reusable prompt patterns for IT operations.',
    deck: [30],
    outcomes: ['Write a structured prompt with role, context, task, constraints and output format', 'Explain context engineering and budget a context window', 'Reuse proven prompt patterns for triage, log analysis and change reviews'],
    lessons: [
      {
        id: 'm6-1', title: 'Anatomy of a good prompt', mins: 20, deck: [30],
        slides: [
          {
            t: 'Write prompts like you write a ticket for a new colleague',
            b: H.split(
              H.prose(
                'A model is a brilliant new hire with no context about ACME. Vague requests get generic results. The fix is the same one you use for people: <b>say who they are, what they need to know, what to do, what not to do, and what “done” looks like</b>.',
                'Bad: <i>“look at this ticket”</i>.<br>Good: role + context + task + constraints + output format + an example.'
              ),
              H.table(['Part', 'Purpose'], [
                ['Role', 'Sets expertise and tone'],
                ['Context', 'Facts it cannot know: systems, policies, definitions'],
                ['Task', 'One clear instruction'],
                ['Constraints', 'What is forbidden or required'],
                ['Output format', 'Something a person or a script can use (JSON, table, template)'],
                ['Examples', 'Show, don\'t tell: one or two input → output pairs'],
              ])
            ),
          },
          {
            t: 'Build one: ticket triage',
            b: H.widget('builder', { preset: 'prompt' }),
            n: 'Untick “Context”, then “Output format”, and read the warnings out loud. Then paste the assembled prompt into any chat model and run it on a real anonymised ticket.',
          },
          {
            t: 'Techniques that work',
            b: H.cards([
              ['Be specific', '“Summarise in 3 bullets for a non-technical manager” beats “summarise”.', 'clarity'],
              ['Delimit the data', 'Wrap pasted logs and tickets in tags such as <code>&lt;ticket&gt;…&lt;/ticket&gt;</code> so data is not confused with instructions.', 'structure'],
              ['Few-shot examples', 'One or two worked examples fix format problems faster than paragraphs of rules.', 'examples'],
              ['Let it think', 'For diagnosis: “reason step by step, then give the answer”. Or use a reasoning model.', 'reasoning'],
              ['Allow uncertainty', '“If the information is not in the context, say ‘not enough information’.”', 'honesty'],
              ['Positive instructions', '“Reply in plain English” works better than a long list of “don\'t”s.', 'phrasing'],
            ]),
          },
        ],
      },
      {
        id: 'm6-2', title: 'Context engineering', mins: 20, deck: [30],
        slides: [
          {
            t: 'From prompt engineering to context engineering',
            b: H.split(
              H.prose(
                'For agents, the user\'s prompt is a small part of what the model sees. The <b>harness</b> assembles the whole context on every step: system prompt, persona, memory, the skills index, tool schemas, retrieved documents, conversation history and tool outputs.',
                '<b>Context engineering</b> is the discipline of deciding what goes in, in what order, and what stays out, so the model has exactly what it needs and nothing that distracts or costs.'
              ),
              H.fig(D.stack([
                { t: 'System prompt + SOUL.md', s: 'identity, rules', c: 'ink' },
                { t: 'AGENTS.md / project context', s: 'conventions' },
                { t: 'Memory + skills index', s: 'small, always on', c: 'ok' },
                { t: 'Tool schemas', s: 'grows with every tool', c: 'tl' },
                { t: 'Retrieved docs / skill bodies', s: 'only when relevant', c: 'acc' },
                { t: 'Conversation + tool outputs', s: 'grows every step' },
              ], { h: 46 }))
            ),
          },
          {
            t: 'Budget the context window',
            b: H.widget('context'),
            n: 'Push the tools slider to 120: that is what happens when someone enables every MCP server “just in case”. Every tool schema is paid for on every call.',
          },
          {
            t: 'Context hygiene rules',
            b: H.steps([
              ['Load less, on demand', 'Skills and RAG instead of giant system prompts. Enable only the toolsets an agent needs.'],
              ['Filter tool output', 'Return the 20 relevant log lines, not 20,000. Write tools that summarise.'],
              ['Keep the prefix stable', 'Unchanging system prompt and tools mean prompt-cache hits: cheaper and faster.'],
              ['Start fresh at boundaries', '<code>/new</code> after a finished task; compress long sessions (<code>/compress</code>).'],
              ['Isolate with subagents', 'Delegate a noisy investigation to a subagent; only its summary returns to the parent (Module 10).'],
            ]),
          },
        ],
      },
      {
        id: 'm6-3', title: 'Prompt patterns for IT operations', mins: 15, deck: [30],
        slides: [
          {
            t: 'Reusable patterns',
            b: H.split(
              H.code('You are a senior network engineer.\nAnalyse the log excerpt between <log> tags.\n1. List distinct errors with first/last timestamp and count.\n2. Group them by likely root cause.\n3. Rank root causes by impact.\n4. For the top one, give 3 diagnostic commands (read-only).\nIf the log is insufficient, say what else you need.\n<log>\n{paste filtered lines here}\n</log>', 'text', 'log analysis'),
              H.code('Review this change request as a CAB member.\nCheck: scope, risk rating, rollback plan, test plan,\nmaintenance window, affected services, communication.\nOutput a table: item | status (ok/missing/weak) | comment.\nThen one line: APPROVE / REQUEST CHANGES, with the reason.\nBe strict about rollback plans.\n<change>\n{paste CHG text}\n</change>', 'text', 'change-request review')
            ) + H.code('Write a post-incident summary for {audience: management | engineers}.\nSections: What happened · Impact (users, duration) · Root cause ·\nWhat we did · What we will change (owner + date).\nUse only facts from the timeline below; mark assumptions as [assumption].\n<timeline>\n{paste}\n</timeline>', 'text', 'incident summary'),
          },
        ],
      },
    ],
    quiz: [
      { q: 'Which addition most improves a vague prompt like “look at this ticket”?', a: ['Adding “please”', 'Adding role, context, a clear task, constraints and an output format', 'Writing it in capitals', 'Making it shorter'], c: 1, why: 'Structured prompts give the model the context and success criteria it cannot guess.' },
      { q: 'Why wrap pasted logs or emails in tags such as &lt;log&gt;…&lt;/log&gt;?', a: ['It looks nicer', 'It separates data from instructions, which helps accuracy and reduces prompt-injection risk', 'Models require XML', 'It reduces tokens'], c: 1, why: 'Clear delimiters tell the model “this is data to analyse, not instructions to follow”.' },
      { q: 'An agent has 120 MCP tools enabled. What is the main cost?', a: ['None, tools are free', 'Every tool schema is sent in the context on every call: more tokens, more cost, more confusion', 'The GPU overheats', 'The tools run slower'], c: 1, why: 'Tool definitions live in the context. Enable only what the agent needs.' },
      { q: 'What is context engineering?', a: ['Writing longer prompts', 'Deciding what the harness puts into the context window (memory, tools, docs, history), in what order, and what stays out', 'Training a model on context', 'Increasing the context window size'], c: 1, why: 'For agents, curating the whole context matters more than wording one prompt.' },
    ],
  });
})();
