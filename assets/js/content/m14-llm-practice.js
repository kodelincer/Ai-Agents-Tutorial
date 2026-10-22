(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm14', num: 14, title: 'Working with LLMs: vocabulary, pricing and gateways',
    summary: 'The words, controls and costs every user of a language model must know, and how to use many models through one key with a gateway such as OpenRouter or AvalAI.',
    outcomes: ['Read a model card and a model name and know what they promise', 'Choose temperature, top-p and max tokens for a job', 'Estimate the cost of a call or an agent task, including cache reads and writes', 'Make API calls through a gateway and read the usage block'],
    lessons: [
      {
        id: 'm14-1', title: 'The vocabulary of LLMs', mins: 15,
        slides: [
          {
            t: 'Twelve words you will meet in the first hour',
            b: H.table(['Word', 'What it means in practice'], [
              ['Model', 'The trained system you call. Names such as “gpt-…”, “claude-…” or “qwen…” identify it.'],
              ['Parameters (weights)', 'The numbers learned in training. “7B” means 7 billion of them. More usually means more capable and more expensive to run.'],
              ['Inference', 'Using a trained model to produce an answer. The lab trains once; you pay for inference.'],
              ['Prompt', 'Everything you send in: instructions, documents, history and the question.'],
              ['System prompt', 'Standing instructions placed first: role, rules, format. The end user does not see it.'],
              ['Completion (response)', 'What the model sends back.'],
              ['Token', 'The unit models read and write, roughly three quarters of an English word. Also the billing unit.'],
              ['Context window', 'The most tokens (prompt plus answer) a model can handle in one call.'],
              ['Hallucination', 'A fluent answer that is false.'],
              ['Multimodal', 'Accepts or produces more than text: images, audio, video.'],
              ['Open weights vs closed', 'Open-weights models can be downloaded and run by you. Closed models are only reachable through the owner\'s API.'],
              ['API endpoint', 'The web address your code calls to talk to a model.'],
            ]),
            n: 'Do not read the table row by row. Ask who has used a chat model and let them name words they have heard; point at those rows. The two to dwell on are token (it is the bill) and context window (it is the limit). Everything else in this module hangs off those two.',
          },
          {
            t: 'One request, drawn',
            b: H.split(
              H.prose(
                'Every call is the same shape: your code sends a list of <b>messages</b>, each with a <b>role</b>, and the model replies with one more message.',
                '<b>system</b> sets the rules, <b>user</b> is the person or program asking, <b>assistant</b> is the model\'s earlier answers, <b>tool</b> carries the result of a tool call (Module 7).'
              ),
              H.code('{\n  "model": "vendor/model-name",\n  "messages": [\n    { "role": "system", "content": "You are a concise IT assistant." },\n    { "role": "user",   "content": "Explain DHCP in two sentences." }\n  ],\n  "temperature": 0.2,\n  "max_tokens": 120\n}', 'json', 'chat request (OpenAI-compatible)')
            ),
            n: 'This JSON is the lingua franca. OpenAI invented the shape, and almost every gateway, local server (Ollama, LM Studio) and framework copies it. Learn it once and you can talk to any of them by changing only the base URL, the key and the model name.',
          },
          {
            t: 'The model remembers nothing between calls',
            b: H.split(
              H.prose(
                'A model is <b>stateless</b>. The “conversation” you see in a chat app is the app resending the whole history with every new question.',
                'That has three consequences you will meet again and again: the prompt grows with every turn, cost grows with it, and anything you want the model to know must be in the messages you send.'
              ),
              H.fig(D.seq(['Your app', 'Model'], [
                [0, 1, 'system + question 1'],
                [1, 0, 'answer 1'],
                [0, 1, 'system + Q1 + A1 + question 2', 'acc'],
                [1, 0, 'answer 2'],
              ], { step: 52 }))
            ) + H.note('key', 'Agents are the extreme case: every tool call and its output is appended and resent. This is why session 3 spends time on cost and caching.'),
            n: 'Ask: if the model is stateless, how does ChatGPT remember my name? Answer: the app resends it. Then ask how an agent remembers across days. Answer: memory files and databases the harness loads into the prompt; we meet that in sessions 10 and 18.',
          },
        ],
      },
      {
        id: 'm14-2', title: 'Controls: sampling parameters and output limits', mins: 20,
        slides: [
          {
            t: 'The dials on every API call',
            b: H.table(['Parameter', 'What it does', 'Rule of thumb'], [
              ['temperature', 'Randomness when picking the next token. 0 = the most likely token every time.', 'Low for facts, code and extraction; higher for ideas.'],
              ['top_p', 'Sample only from the smallest set of tokens whose probabilities add up to p.', 'Change temperature or top_p, not both.'],
              ['top_k', 'Sample only from the k most likely tokens. Not every API offers it.', 'Leave it unless a model card recommends a value.'],
              ['max_tokens', 'A hard cap on the length of the answer. Newer OpenAI models call it max_completion_tokens.', 'Always set one. It is your cost ceiling.'],
              ['stop', 'Strings that end the output as soon as they appear.', 'Useful for structured output and chat templates.'],
              ['seed', 'Best-effort repeatability.', 'Helps tests; not a guarantee.'],
              ['frequency / presence penalty', 'Discourage repeated words or topics.', 'Rarely needed with modern models.'],
              ['stream', 'Send tokens as they are produced instead of waiting for the end.', 'Use it for anything a person watches.'],
            ]) + H.note('warn', 'Names and support differ by provider and by model. A gateway forwards only the parameters the chosen model supports, so a setting can be silently ignored. Check the model\'s page.'),
            n: 'Spend the time on temperature and max_tokens. Those two matter for every student. The others are good to have heard of. Stress the warning: a parameter that is ignored does not raise an error, it just does nothing.',
          },
          {
            t: 'See temperature working',
            b: H.widget('nextToken'),
            n: 'Slide it to 0, sample ten times, then to 1.5 and sample again. At 0 the answer is the same every time; at high temperature odd words appear. Then lower top-k to 2 and show how it trims the tail. This is the same exercise as Module 2, now with the API names attached.',
          },
          {
            t: 'Settings by job',
            b: H.table(['Job', 'Temperature', 'Also set'], [
              ['Classify a ticket, extract fields, route a request', '0 to 0.2', 'JSON output and a small max_tokens'],
              ['Write or explain a command or script', '0 to 0.3', 'A stop sequence if you parse the output; always run the result in a lab first'],
              ['Summarise a log or incident', '0.2 to 0.5', 'Say the audience and the length'],
              ['Draft an email or brainstorm names', '0.7 to 1.0', 'Ask for several options'],
              ['Agent with tools', 'The provider default or lower', 'A reasoning-effort setting where offered'],
            ]) + H.note('tip', 'Many reasoning models fix the temperature or ignore it, and offer a “reasoning effort” control instead. More effort means more hidden thinking tokens, and you pay for those.'),
            n: 'The agent row is the one people get wrong: they set temperature 1 for creativity and then wonder why the agent picks odd commands. Low and boring is what you want from something that holds tools.',
          },
          {
            t: 'Why an answer stopped: finish reasons and streaming',
            b: H.split(
              H.prose(
                'Every response says <b>why it ended</b>. Read it before you trust the text.',
                '<b>stop</b>: the model finished (or hit a stop string). <b>length</b>: it hit max_tokens, so the answer is cut off, perhaps in the middle of JSON. <b>tool_calls</b>: it wants you to run a tool and call it again.',
                'With <b>stream</b> on, the reply arrives as many small chunks. The first token shows up sooner, but the total time and cost are the same.'
              ),
              H.code('{\n  "choices": [{\n    "finish_reason": "length",\n    "message": { "role": "assistant",\n                 "content": "{\\"servers\\": [{\\"name\\": \\"dc-02\\", \\"disk\\": 91" }\n  }]\n}', 'json', 'a truncated answer')
            ),
            n: 'Show the truncated JSON and ask what a script parsing it would do. It crashes, or worse, treats a half answer as complete. Rule: when finish_reason is length, raise max_tokens or ask for a shorter answer; never use the text.',
          },
        ],
      },
      {
        id: 'm14-3', title: 'Capabilities: reading a model card', mins: 20,
        slides: [
          {
            t: 'What a model can do',
            b: H.cards([
              ['Text in, text out', 'Every model. Quality, speed and price are what differ.', 'basic'],
              ['Vision', 'Accepts images: screenshots, rack photos, diagrams, scanned forms.', 'input'],
              ['Audio and video', 'Speech in or out, sometimes video. Often a separate model.', 'input'],
              ['Tool calling', 'Can ask your code to run a function and use the result. Agents need this.', 'agents'],
              ['Structured output', 'Can be held to a JSON schema so a script can parse the answer.', 'automation'],
              ['Reasoning', 'Thinks before answering. Better on hard problems, slower, more tokens.', 'quality'],
              ['Long context', 'Handles very large prompts. Large is not perfect: details in the middle get lost.', 'size'],
              ['Fine-tunable', 'The provider lets you train an adapted copy on your data.', 'custom'],
            ], 4),
            n: 'Ask people which of these they have already used without knowing the word. Vision (paste a screenshot) and structured output (ask for a table) are common. Tool calling is the one that turns a model into an agent, so mark it.',
          },
          {
            t: 'Reading a model listing',
            b: H.split(
              H.table(['Field', 'Why you care'], [
                ['Context length', 'Does your prompt plus the answer fit?'],
                ['Max output', 'The longest single answer you can get.'],
                ['Input and output modalities', 'Can it see images? Can it speak?'],
                ['Supported parameters', 'Tools, structured output, reasoning, temperature.'],
                ['Price', 'Input, output and, if offered, cache read and write.'],
                ['Provider and region', 'Where your data goes.'],
                ['Open weights and licence', 'Can you run it yourself, and for what?'],
              ]),
              H.code('vendor/model-name        (illustrative numbers)\ncontext length : 200,000 tokens\nmax output     : 32,000 tokens\nmodalities     : text, image  ->  text\nsupports       : tools · structured output · reasoning\nprice (per 1M) : $3.00 in · $15.00 out · $0.30 cache read', 'text', 'a typical listing')
            ),
            n: 'Gateways show this card for every model. Have students open one now and find all seven fields for one model. The most common mistake is reading the headline price and ignoring that the output price is several times higher.',
          },
          {
            t: 'Pick by job, not by hype',
            b: H.table(['Job', 'What to look for', 'Typical tier'], [
              ['Route, tag or classify thousands of tickets', 'Low price, fast, structured output', 'Small, cheap model'],
              ['Daily agent work (Hermes, coding agents)', 'Reliable tool calling, long context, good price/quality', 'Balanced mid-range model'],
              ['Hard debugging, design review, planning', 'Reasoning, strong coding', 'Top-tier or reasoning model, used sparingly'],
              ['Sensitive data that must not leave', 'Open weights you can host', 'Local model (session 8)'],
              ['Read screenshots or photos', 'Vision input', 'A vision-capable model'],
            ]) + H.note('key', 'Use two models: a cheap one for the easy, high-volume steps and a strong one for the few hard steps. Gateways make switching a one-word change.'),
            n: 'Make the two-model rule concrete: a triage agent that classifies with the cheap model and only escalates to the expensive one when confidence is low can cost a tenth as much. We build exactly this idea in the later sessions.',
          },
          {
            t: 'Check tool calling before you commit',
            b: H.split(
              H.prose(
                'A model that <i>talks about</i> using a tool is not a model that <i>calls</i> it. Hermes documents a common failure: small local models (roughly under 30B parameters) often answer “Done, I will remember that” without ever calling the memory tool.',
                'Test any new model before you build on it:'
              ) + H.steps([
                ['Ask for a harmless tool action', 'For example: read this file, or save this note.'],
                ['Check the evidence', 'Look at the file or the tool log, not at the model\'s claim.'],
                ['Repeat five times', 'Reliability matters more than one good run.'],
              ]),
              H.cards([
                ['Context length', 'Hermes needs at least 64K tokens of context to work well.', 'minimum'],
                ['Tool calling', 'Listed under “supported parameters”. Verify by testing.', 'must work'],
                ['Cost', 'Agents resend context on every step. Price it before you run it.', 'check'],
              ])
            ),
            n: 'This links the module back to Hermes. When a student says the agent forgot something, the first question is always: did the tool actually run? Teach them to look at evidence rather than trust the model\'s sentence.',
          },
        ],
      },
      {
        id: 'm14-4', title: 'Tokens, pricing and prompt caching', mins: 25,
        slides: [
          {
            t: 'What you pay for',
            b: H.split(
              H.prose(
                'Providers charge per <b>million tokens</b>, with separate prices for what you send (<b>input</b>) and what the model writes (<b>output</b>). Output usually costs several times more per token.',
                'Hidden “thinking” tokens of reasoning models are billed as output even though you never see them.'
              ) + H.code('cost = input_tokens  × input_price  / 1,000,000\n     + output_tokens × output_price / 1,000,000\n\n# example prices: $3 in, $15 out per 1M tokens\nticket triage: 2,000 in + 300 out\n  = 0.0060 + 0.0045 = $0.0105 per ticket\n  × 5,000 tickets a day = $52.50 a day', 'text', 'worked example'),
              H.widget('tokenizer')
            ),
            n: 'Use the tokenizer on the right with a real anonymised ticket to count tokens. Then do the arithmetic on the board with the example prices. People are usually surprised that a cheap-looking call becomes a real budget line at ticket volume.',
          },
          {
            t: 'Why an agent task costs more than a chat',
            b: H.split(
              H.prose(
                'Each step of an agent resends the system prompt, the tools, and everything said so far. The input grows with every step, so the total grows much faster than the number of steps.'
              ) + H.note('warn', 'A 10-step task with an 8,000-token prefix that adds 1,500 tokens a step sends <b>162,500 input tokens</b> in total, about $0.55 at $3 and $15, for what looks like one request.'),
              H.table(['Step', 'Input tokens sent'], [
                ['1', '9,500'],
                ['2', '11,000'],
                ['5', '15,500'],
                ['10', '23,000'],
                ['All 10 steps', '162,500'],
              ])
            ),
            n: 'The numbers are 8,000 + 1,500 × step. Step 1 is 9,500, step 10 is 23,000, and the ten steps add up to 162,500. The cache calculator two slides later starts from exactly these defaults, so students can see the saving on the same task.',
          },
          {
            t: 'Prompt caching in one picture',
            b: H.split(
              H.fig(D.stack([
                { t: 'System prompt + tool definitions', s: 'identical every call: cached', c: 'ok' },
                { t: 'Reference documents', s: 'identical: cached', c: 'ok' },
                { t: 'Conversation so far', s: 'cached after the first time it is sent', c: 'tl' },
                { t: 'Newest message and tool output', s: 'new: full price', c: 'acc' },
              ], { h: 52 })),
              H.cards([
                ['Cache write', 'The first time a prefix is seen. Some providers charge a premium for it; others charge nothing extra.'],
                ['Cache read', 'A later call that starts with the same prefix pays a discounted price for it.'],
                ['Lifetime (TTL)', 'The cache expires after minutes without use. The length differs by provider.'],
                ['Exact prefix', 'One changed character early in the prompt breaks the match from that point on.'],
                ['Minimum size', 'Very short prompts are not cached. The limit differs by provider.'],
              ], 1)
            ),
            n: 'Say it in one sentence: caching lets the provider skip re-reading the part of the prompt it has already seen, and it passes some of that saving on to you. Then ask: which part of an agent prompt never changes? The system prompt and the tools. That is why harnesses keep the front of the prompt stable.',
          },
          {
            t: 'What the discounts look like',
            b: H.table(['Provider family', 'Cache read', 'Cache write'], [
              ['Anthropic Claude 4.x', '0.10× the input price', '1.25× the input price'],
              ['OpenAI GPT-5 to 5.5', '0.10×', 'no extra charge'],
              ['OpenAI GPT-5.6 family', '0.10×', '1.25×'],
              ['OpenAI GPT-4.1', '0.25×', 'no extra charge'],
              ['Google Gemini 2.5', '0.10×', 'none listed'],
              ['DeepSeek chat', 'about 0.10×', 'none listed'],
              ['Alibaba Qwen (flagship)', '0.20×', '1.25×'],
            ]) + H.note('warn', 'These multipliers come from the open LiteLLM price registry, read on 22 October 2026. Providers change them often and gateways can differ. The price on your gateway\'s model page is the truth: teach the formula, look up the number.'),
            n: 'Do not ask students to memorise the table. The pattern is the lesson: reads are cheap (a tenth to a quarter), writes are either free or a small premium. Then the real question is whether your agent reads more than it writes, which the calculator answers.',
          },
          {
            t: 'Try it: what does caching save on a task?',
            b: H.widget('cacheCost'),
            n: 'Start with the defaults (they match the 10-step task from two slides ago) and note the saving. Then tick “cache expires between steps” and read the warning aloud: with a write premium and no reads, caching costs more. Then raise the steps to 40 and watch the saving grow. Ask what a scheduled job that runs once an hour would see.',
          },
          {
            t: 'Where the cache shows up in the response',
            b: H.split(
              H.code('"usage": {\n  "prompt_tokens": 12400,\n  "completion_tokens": 310,\n  "prompt_tokens_details": {\n    "cached_tokens": 12288,\n    "cache_write_tokens": 0\n  },\n  "completion_tokens_details": {\n    "reasoning_tokens": 0\n  }\n}', 'json', 'usage block'),
              H.prose(
                '<b>prompt_tokens</b> is everything you sent. <b>cached_tokens</b> is the part that was read from the cache: bill it at the cache-read price. <b>cache_write_tokens</b> appears on the call that created a new cache entry.',
                '<b>reasoning_tokens</b> are the hidden thinking tokens, billed as output.',
                'The OpenAI SDK defines these fields, and OpenRouter documents <code>cached_tokens</code> and <code>cache_write_tokens</code>. Other gateways may name or omit them, so print the whole usage block the first time you try one.'
              )
            ),
            n: 'This is the “where do I see it” slide. The lab at the end of the session has them print the usage block twice with a long prompt, so they see cached_tokens go from zero to most of the prompt on the second call. If a gateway shows zero both times, that model or route simply does not cache.',
          },
          {
            t: 'Seven ways to cut the bill',
            b: H.steps([
              ['Keep the front of the prompt stable', 'Put fixed instructions and tools first and anything that changes last, so the cache keeps matching.'],
              ['Use a cheap model for easy steps', 'Classification and routing do not need a frontier model.'],
              ['Always set max_tokens', 'It caps a runaway answer.'],
              ['Enable fewer tools', 'Every tool definition is sent on every call (Module 6).'],
              ['Trim tool output', 'Return the 20 relevant log lines, not 20,000.'],
              ['Lower reasoning effort', 'Use high effort only where it pays.'],
              ['Start a new session at task boundaries', 'A short context is cheap context.'],
            ]),
            n: 'Ask students to rank these by how much they would save on their own use case. For agents, the stable prefix and the tool count usually win. For batch classification, the cheap model wins.',
          },
        ],
      },
      {
        id: 'm14-5', title: 'Gateways: OpenRouter and AvalAI', mins: 20,
        slides: [
          {
            t: 'One key, many models',
            b: H.split(
              H.prose(
                'A <b>gateway</b> sits between your code and many model providers. You hold one account and one key, and choose the model with a name.',
                'Most gateways copy the OpenAI request shape from the first lesson, so your code, a framework or an agent like Hermes changes only three things: the <b>base URL</b>, the <b>key</b> and the <b>model name</b>.'
              ),
              H.fig(D.flow([
                { t: 'Your app / agent', s: 'base URL + key' },
                { t: 'Gateway', s: 'routes, bills', c: 'acc' },
                { t: 'Provider', s: 'OpenAI · Anthropic · Google · open-weights hosts' },
              ], { h: 100 }))
            ) + H.table(['', 'Direct from the provider', 'Through a gateway'], [
              ['Accounts and keys', 'One per provider', 'One'],
              ['Switching models', 'New SDK, key and billing', 'Change the model name'],
              ['Price', 'The provider\'s price', 'Usually the same per token, plus any gateway fee: check'],
              ['Outages', 'Your problem', 'Some gateways can fall back to another provider'],
              ['Data', 'Goes to one provider', 'Goes to the gateway and the chosen provider'],
            ]),
            n: 'The key sentence is “only three things change”. If students remember nothing else, they can move any OpenAI-style client between providers. Mention the data row last; we come back to it two slides on.',
          },
          {
            t: 'OpenRouter: what to know',
            b: H.split(
              H.table(['Item', 'Detail'], [
                ['Base URL', 'https://openrouter.ai/api/v1'],
                ['Model names', 'vendor/model, for example anthropic/claude-sonnet-4'],
                ['Keys', 'Start with sk-or-. Create one per project.'],
                ['Provider routing', 'A provider object in the request lets you set preferences for which hosts serve the model.'],
                ['Usage and cost', 'The response carries a usage block; cache fields as on the previous slide.'],
              ]),
              H.code('curl https://openrouter.ai/api/v1/chat/completions \\\n  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "anthropic/claude-sonnet-4",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }\'', 'bash', 'a first call')
            ) + H.note('tip', 'Before you rely on any gateway detail, confirm it on the gateway\'s own documentation: base URLs, field names and prices change. This course teaches the pattern.'),
            n: 'Show the OpenRouter models page live: filter by tools, sort by price, open one model and find the seven fields. Remind people that the model list changes every week, so any name on a slide is an example.',
          },
          {
            t: 'AvalAI and local gateways',
            b: H.split(
              H.prose(
                '<b>AvalAI</b> (avalai.ir) is a gateway used from Iran. It is reported to offer an OpenAI-style API at <code>https://api.avalai.ir/v1</code> with models from several vendors, and its documentation is at <code>docs.avalai.ir</code>.',
                'The pattern is identical to OpenRouter: set the base URL, put the key in an environment variable, and use the model name from its list. Everything in this module applies unchanged.'
              ),
              H.steps([
                ['Find the base URL and the model names', 'On the gateway\'s documentation and model list.'],
                ['Read the pricing page', 'Per-token prices, the currency, any markup, and whether cache reads are discounted.'],
                ['Check payment and limits', 'How you top up, spending limits per key, rate limits.'],
                ['Test with the lab script', 'Same code, different base URL. Print the usage block.'],
                ['Decide what may go through it', 'Prompts leave your network: classify the data first.'],
              ])
            ) + H.note('warn', 'The AvalAI details above come from public listings, not from its documentation, so confirm the base URL, models and prices there before the class uses it.'),
            n: 'Instructor: open docs.avalai.ir before this session and replace the reported details with what you see. Compare one model\'s price there with the same model on OpenRouter so students see the difference in price and currency. Keep the point practical: same code, different base URL.',
          },
          {
            t: 'Use a gateway from Hermes and other tools',
            b: H.code('# Hermes with OpenRouter\nhermes config set OPENROUTER_API_KEY sk-or-...      # goes to ~/.hermes/.env\nhermes config set model anthropic/claude-opus-4.6\nhermes model                                          # or pick the provider interactively\n\n# Hermes with any OpenAI-style gateway: choose "Custom endpoint" in\n#   hermes model\n# and give it the base URL, the key and the model name.', 'bash', 'Hermes') +
              H.cards([
                ['Your own scripts', 'The OpenAI SDK with base_url and api_key set. The lab does this.', 'python'],
                ['Frameworks', 'LangChain, LlamaIndex and Open WebUI all accept an OpenAI-compatible base URL (session 22).', 'tour'],
                ['Coding agents', 'Check each tool\'s documentation for custom endpoints before relying on one.', 'verify'],
              ]),
            n: 'The Hermes commands are in the official quickstart. Walk through hermes model live and show where Custom endpoint appears. For Claude Code and Codex, say plainly that endpoint support differs and must be checked in their documentation.',
          },
          {
            t: 'Keys, limits and data',
            b: H.cards([
              ['Never put a key in a repo, a ticket or a chat', 'Use environment variables or a secrets manager. Treat a leaked key as spent money.', 'secrets'],
              ['One key per project', 'So you can see who spent what and revoke one without breaking the rest.', 'hygiene'],
              ['Set spending limits', 'If the gateway offers per-key or per-account limits, set them before the first agent runs unattended.', 'cost'],
              ['Know the rate limits', 'Too many calls too fast get an error. Agents and loops hit this first.', 'limits'],
              ['Classify what you send', 'Prompts leave your network. Check the gateway\'s and the provider\'s data retention and training policy. Sensitive data stays local or goes only to approved routes.', 'privacy'],
              ['Log cost per task', 'Print the usage block in your scripts so a surprise shows up the day it happens.', 'visibility'],
            ], 3),
            n: 'Tie to the guardrail policy in session 25: the model route is part of the policy. Ask the class which of their real data is allowed to go to a foreign gateway. Expect the answer to be “less than we thought”.',
          },
        ],
      },
      {
        id: 'm14-6', title: 'Lab: your first API calls', mins: 30, lab: true,
        slides: [
          {
            t: 'Set up: three variables',
            b: H.prose(
              'Pick a gateway (OpenRouter or AvalAI), create a key with a small spending limit, and choose a cheap model from its list. Then put the three values into environment variables. <b>Do not paste the key into the slides, a chat or a file in a repository.</b>'
            ) + H.code('export BASE_URL="https://openrouter.ai/api/v1"     # or your gateway\'s base URL\nexport API_KEY="..."                              # from your secrets manager\nexport MODEL="vendor/model-name"                  # copy it from the model page', 'bash', 'Linux, macOS, WSL') +
              H.code('$env:BASE_URL = "https://openrouter.ai/api/v1"\n$env:API_KEY  = "..."\n$env:MODEL    = "vendor/model-name"', 'powershell', 'Windows PowerShell'),
            n: 'Give them 5 minutes. The most common problems are a trailing space in the key, a base URL without /v1, and a model name copied with the wrong vendor prefix. Walk the room.',
          },
          {
            t: 'Call 1: curl',
            b: H.code('curl -s "$BASE_URL/chat/completions" \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model": "\'"$MODEL"\'",\n       "messages": [\n         {"role": "system", "content": "You are a concise IT assistant."},\n         {"role": "user", "content": "Explain DHCP in two sentences."}],\n       "temperature": 0.2, "max_tokens": 120}\'', 'bash', 'chat completion') +
              H.note('tip', 'Pipe the output through <code>python3 -m json.tool</code> or <code>jq</code> to read it. Find three things: the answer, <code>finish_reason</code> and the <code>usage</code> block.'),
            n: 'Expected: a JSON object with choices[0].message.content and a usage block. Errors: 401 means the key is wrong, 404 usually a wrong base URL or model name, 402 or 429 means credit or rate limit.',
          },
          {
            t: 'Call 2: the same thing in Python',
            b: H.code('import os\nfrom openai import OpenAI\n\nclient = OpenAI(base_url=os.environ["BASE_URL"], api_key=os.environ["API_KEY"])\n\nresp = client.chat.completions.create(\n    model=os.environ["MODEL"],\n    messages=[\n        {"role": "system", "content": "You are a concise IT assistant."},\n        {"role": "user", "content": "Explain DHCP in two sentences."},\n    ],\n    temperature=0.2,\n    max_tokens=120,\n)\n\nprint(resp.choices[0].message.content)\nprint("finish_reason:", resp.choices[0].finish_reason)\nprint("usage:", resp.usage)', 'python', 'ask.py') +
              H.p('Install the library with <code>pip install openai</code>. Only the three variables decide which gateway and model you talk to.'),
            n: 'Change MODEL to a second model and run it again to show the point: same code, different model. Ask someone to switch the base URL to the other gateway if the class has both.',
          },
          {
            t: 'Call 3: count the cost, and watch the cache',
            b: H.code('import os\nfrom openai import OpenAI\n\n# Dollars per 1M tokens: copy them from the gateway\'s model page.\nPRICE_IN = float(os.environ.get("PRICE_IN", "3"))\nPRICE_OUT = float(os.environ.get("PRICE_OUT", "15"))\nPRICE_CACHED = float(os.environ.get("PRICE_CACHED", str(PRICE_IN)))  # cache-read price\n\nclient = OpenAI(base_url=os.environ["BASE_URL"], api_key=os.environ["API_KEY"])\nmessages = [\n    {"role": "system", "content": "You are a concise IT assistant. " * 200},  # long, stable prefix\n    {"role": "user", "content": "Explain DHCP in two sentences."},\n]\n\nfor attempt in (1, 2):\n    r = client.chat.completions.create(model=os.environ["MODEL"], messages=messages, max_tokens=120)\n    u = r.usage\n    details = u.prompt_tokens_details\n    cached = (details.cached_tokens or 0) if details else 0\n    fresh = u.prompt_tokens - cached\n    cost = (fresh * PRICE_IN + cached * PRICE_CACHED + u.completion_tokens * PRICE_OUT) / 1e6\n    print(f"call {attempt}: prompt={u.prompt_tokens} cached={cached} output={u.completion_tokens} cost=${cost:.6f}")', 'python', 'cost.py'),
            n: 'Run it twice in a row. On a model and route that cache, call 2 shows a large cached count and a lower cost. If both show cached=0, the model or the route does not cache, or the prompt is under the provider\'s minimum size: that is a finding, not a failure. Some providers only cache above a minimum length, so try making the prefix longer.',
          },
          {
            t: 'Experiments and a checklist',
            b: H.steps([
              ['Temperature', 'Run Call 2 five times at 0 and five times at 1.2. Compare the answers.'],
              ['max_tokens', 'Set it to 10. What does finish_reason say?'],
              ['Streaming', 'Add <code>stream=True</code> and print the chunks as they arrive.'],
              ['Two models', 'Run the same prompt on a cheap and a strong model. Compare quality and cost.'],
              ['The cache', 'Change one word at the start of the system prompt and run Call 3 again. What happens to cached tokens?'],
            ]) + H.note('key', 'Write down for your own use case: the model you would pick, its context length, its price in, out and cached, and one data rule for what may be sent through the gateway.'),
            n: 'The last experiment is the memorable one: changing the first word of the prompt throws away the whole cache, which proves the exact-prefix rule from earlier. Collect the final checklist as the exit ticket.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'An API call sends 2,000 input tokens and gets 300 output tokens back. Input costs $3 and output $15 per million tokens. About what does the call cost?', a: ['$0.0105', '$0.105', '$1.05', '$0.0006'], c: 0, why: '2,000 × $3 / 1M = $0.006, plus 300 × $15 / 1M = $0.0045. Total $0.0105.' },
      { q: 'Why does a 10-step agent task send far more input tokens than ten separate chat questions?', a: ['Agents use bigger models', 'Every step resends the system prompt, the tools and the whole history so far', 'Output tokens are counted twice', 'Gateways add extra tokens'], c: 1, why: 'The model is stateless, so each step carries everything again, and the input grows with every step.' },
      { q: 'What makes a prompt-cache read possible?', a: ['A higher temperature', 'A later call that starts with exactly the same prefix, before the cache expires', 'Using streaming', 'Setting max_tokens'], c: 1, why: 'Caches match on an exact prefix and expire after a while without use. A changed early character breaks the match.' },
      { q: 'When can prompt caching make a job cost more?', a: ['Never', 'When the provider charges a premium to write the cache and the cache expires before it is read again', 'When max_tokens is low', 'When streaming is on'], c: 1, why: 'You pay the write price each time and never get the read discount, for example with slow, infrequent jobs.' },
      { q: 'A response has finish_reason "length". What should you do?', a: ['Trust the text', 'Treat the answer as cut off: raise max_tokens or ask for a shorter answer', 'Lower the temperature', 'Switch gateways'], c: 1, why: '"length" means the model hit the output cap, so the text may be incomplete, even in the middle of JSON.' },
      { q: 'You move a script from OpenRouter to another OpenAI-compatible gateway. What normally has to change?', a: ['The whole program', 'The base URL, the API key and the model name', 'The prompt language', 'Nothing'], c: 1, why: 'The request shape is shared, so only those three values differ.' },
    ],
  });
})();
