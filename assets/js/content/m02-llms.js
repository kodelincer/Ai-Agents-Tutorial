(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm2', num: 2, title: 'How large language models think',
    summary: 'Tokens, embeddings, attention and transformers; why output is probabilistic; context windows, reasoning, and the two kinds of language model.',
    deck: [9, 10, 11, 13, 20, 24, 38],
    outcomes: ['Explain tokens and estimate the token cost of an agent workload', 'Explain embeddings and why semantic search finds meaning, not keywords', 'Describe attention and the transformer at a whiteboard level', 'Explain why the same prompt gives different answers, and where hallucination comes from', 'Choose between an embedding model and a generative model for a task'],
    lessons: [
      {
        id: 'm2-1', title: 'Tokens: the unit of everything', mins: 20, deck: [9],
        slides: [
          {
            t: 'Models read tokens, not words',
            b: H.split(
              H.prose(
                'Before a model sees your text, a <b>tokenizer</b> cuts it into pieces called <b>tokens</b>: whole common words, word fragments, digits, punctuation. Each token has a number, its <b>token ID</b>, from a fixed vocabulary of roughly 32,000 to 200,000 entries.',
                'Rule of thumb for English: <b>1 token ≈ 4 characters ≈ ¾ of a word</b>. Persian, code and log files usually take more tokens per word.',
                'Tokens are the <b>usage meter</b>: pricing, speed, rate limits and context size are all counted in tokens.'
              ),
              H.fig(D.flow([{ t: '“VPN disconnects”', s: 'your text' }, { t: '[" VPN", " disconn", "ects"]', s: 'tokens', c: 'tl' }, { t: '[31745, 41018, 7234]', s: 'token IDs', c: 'acc' }, { t: 'Model', s: 'sees only numbers', c: 'ink' }]), 'Illustrative token IDs.')
            ),
          },
          {
            t: 'Try the tokenizer',
            b: H.widget('tokenizer'),
            n: 'Click the Persian sample. The same sentence costs noticeably more tokens. Then change the price to a cheap model (0.15) and an expensive one (15) and show the monthly difference. This is the cost conversation management will want to have.',
          },
          {
            t: 'Why tokens matter for agents',
            b: H.cards([
              ['Cost', 'You pay per input and output token. An agent re-sends its whole context on <b>every step</b> of its loop, so a 10-step task costs about 10 times one chat.', '$'],
              ['Context limit', 'Every model has a maximum number of tokens it can see at once (its context window). Long logs must be filtered or summarised first.', 'size'],
              ['Speed', 'Output is generated one token at a time. Tokens per second is the speed metric for local models.', 'tok/s'],
              ['Odd failures', 'Models are bad at counting letters or reversing strings because they never see letters, only tokens.', 'quirks'],
            ], 4) + H.note('tip', 'Before you paste a 50 MB log into an agent: <code>grep</code>, <code>tail</code> or <code>jq</code> it down to the relevant lines. Pre-filtering is the cheapest optimisation you have.'),
          },
        ],
      },
      {
        id: 'm2-2', title: 'Embeddings: meaning as numbers', mins: 20, deck: [10],
        slides: [
          {
            t: 'Word embeddings and positional embeddings',
            b: H.split(
              H.prose(
                'Each token ID is looked up in a giant table and turned into a <b>vector</b>: a list of hundreds or thousands of numbers. Similar meanings end up as nearby vectors. That vector is an <b>embedding</b>.',
                'Famous example: <i>king − man + woman ≈ queen</i>. In our world, the vectors for <i>switch</i>, <i>router</i> and <i>firewall</i> sit close together, far from <i>invoice</i>.',
                'Transformers look at all tokens at once, so they also add a <b>positional embedding</b>, a signal for “this is token 1, 2, 3…”. Without it, “user locked admin” and “admin locked user” would look identical.'
              ),
              H.fig(D.stack([
                { t: 'token embedding', s: 'what the token means', c: 'tl' },
                { t: '+ positional embedding', s: 'where it sits in the sequence' },
                { t: '= input vector to the transformer', s: '[0.12, -0.83, 0.44, … 4,096 numbers]', c: 'acc' },
              ], { h: 60 }))
            ),
          },
          {
            t: 'Sentence embeddings and semantic search',
            b: H.widget('embeddings'),
            n: 'Type “the storage box is beeping”. It lands near RAID degraded even though no words match. That is the whole idea behind semantic search and RAG (Module 4).',
          },
          {
            t: 'Text and vision embedding models',
            b: H.table(['Model type', 'Input', 'Output', 'Use in IT'], [
              ['Text embedding model', 'A sentence or document chunk', 'One vector (e.g. 384–3,072 numbers)', 'Search runbooks, find duplicate tickets, cluster incidents'],
              ['Vision embedding model (CLIP-style)', 'An image, or text', 'A vector in a shared image-text space', 'Search rack photos by description: “switch with a red port LED”'],
              ['Multilingual embedding model', 'Text in many languages', 'Language-independent vectors', 'Match a Persian ticket to an English KB article'],
            ]) + H.note('tip', 'Open embedding models (bge-m3, multilingual-e5, nomic-embed) are small enough to run on a CPU on-prem, so ticket text never leaves the building.'),
          },
        ],
      },
      {
        id: 'm2-3', title: 'Attention and the transformer', mins: 20, deck: [2],
        slides: [
          {
            t: 'Attention: every token looks at every other token',
            b: H.widget('attention'),
            n: 'In “the switch rebooted because it overheated”, the word “it” must borrow meaning from “switch”. Attention is the mechanism that lets it. Click other words to show that attention is computed for every token.',
          },
          {
            t: 'Inside a transformer block',
            b: H.split(
              H.fig(D.stack([
                { t: 'Next-token probabilities', s: 'softmax over the vocabulary', c: 'acc' },
                { t: 'Output layer', s: 'vector → score per token' },
                { t: '× N transformer blocks', s: '32–100+ layers', c: 'ink' },
                { t: 'Feed-forward network', s: 'stores much of the “knowledge”', c: 'tl' },
                { t: 'Multi-head self-attention', s: 'mixes information between tokens', c: 'tl' },
                { t: 'Token + position embeddings', s: 'input vectors' },
              ], { h: 52 })),
              H.prose(
                'A transformer is a stack of identical <b>blocks</b>. Each block does two things: <b>attention</b> (tokens exchange information) and a <b>feed-forward</b> layer (each token is processed on its own).',
                '<b>Multi-head</b> means several attention patterns run in parallel: one may track grammar, another which device a pronoun refers to, another the overall topic.',
                'The 2017 paper that introduced it was called “Attention Is All You Need”. Every model in this course is built on it.'
              )
            ),
          },
          {
            t: 'Encoders, decoders and both',
            b: H.table(['Architecture', 'How it reads', 'Good at', 'Examples'], [
              ['Encoder-only', 'Sees the whole text in both directions', 'Understanding: classification, embeddings, search', 'BERT, RoBERTa, most embedding models'],
              ['Decoder-only', 'Left to right, predicts the next token', 'Generation: chat, code, agents', 'GPT, Claude, Llama, Qwen, Gemma, Mistral'],
              ['Encoder-decoder', 'Encode input, then decode output', 'Translation, summarisation', 'T5, BART, Whisper (speech)'],
            ]) + H.note('it', 'Classic exercise from the deck: fine-tune a small encoder to classify emails <b>spam / not spam</b>. It costs a fraction of calling a large LLM for each email, and for a fixed, high-volume task it is often more accurate too.'),
          },
        ],
      },
      {
        id: 'm2-4', title: 'The probabilistic nature of AI', mins: 20, deck: [2],
        slides: [
          {
            t: 'An LLM predicts the next token, then the next…',
            b: H.split(
              H.prose(
                'For each step, the model outputs a <b>probability for every token in its vocabulary</b>. The runtime picks one, appends it, and runs the model again. That is all generation is.',
                '<b>Temperature</b> controls how adventurous the pick is. 0 = always the most likely token (repeatable). Higher = more varied (creative, less reliable).',
                '<b>Top-k / top-p</b> cut off the unlikely tail so the model never picks “coffee” as the first thing to check on a slow network.'
              ),
              H.fig(D.flow([{ t: 'Prompt', s: 'tokens so far' }, { t: 'Model', s: 'one forward pass', c: 'ink' }, { t: 'Probabilities', s: 'over ~150K tokens', c: 'tl' }, { t: 'Sample', s: 'temp, top-p', c: 'acc' }], { loop: 'append token and repeat until done' }))
            ),
          },
          {
            t: 'Play with temperature',
            b: H.widget('nextToken'),
            n: 'Set temperature to 0 and sample 10 times: identical every time. Set it to 1.5: you will see “cable”, “DNS”, even “switch”. For agents running tools we want low temperature. For naming a bot, higher is fine.',
          },
          {
            t: 'Hallucination: fluent, confident and wrong',
            b: H.split(
              H.prose(
                'The model is trained to produce <b>plausible</b> text, not <b>true</b> text. When it lacks the facts it still produces the most plausible continuation: an invented KB number, a PowerShell parameter that does not exist, a firmware version that was never released.',
                'Hallucination is not a bug that will be patched away. It is how the system works. We <b>design around it</b>.'
              ),
              H.note('key', H.list([
                '<b>Ground it</b>: give it the facts (RAG, tools) instead of relying on memory.',
                '<b>Let it check</b>: an agent that can run <code>Get-Help</code> or <code>--help</code> verifies before it acts.',
                '<b>Ask for sources</b>: “cite the runbook ID”; no citation, no trust.',
                '<b>Allow “I don\'t know”</b>: say so in the prompt, and reward it in evals.',
                '<b>Keep humans on risky actions</b>: approvals for anything destructive.',
              ]), 'How we handle it')
            ),
          },
        ],
      },
      {
        id: 'm2-5', title: 'What makes a model “large”: context, emergence, reasoning', mins: 15, deck: [11, 38],
        slides: [
          {
            t: 'Emergent behaviour and the context window',
            b: H.cards([
              ['Emergent behaviours', 'Abilities nobody trained for directly (following instructions, writing code, using tools, reasoning step by step) appear once models and data get big enough.', 'scale'],
              ['Context window', 'The maximum number of tokens the model sees at once: prompt + documents + conversation + its answer. Today typically 128K–1M tokens. Hermes requires at least 64K.', 'memory'],
              ['Lost in the middle', 'Bigger context is not perfect memory. Facts buried in the middle of a long context are recalled less reliably than those at the start or end.', 'limits'],
            ]) + H.note('it', '128K tokens is roughly a 300-page book, or about 2 MB of plain logs. Plenty for a ticket and its runbook. Far too little for a raw week of firewall logs.'),
          },
          {
            t: 'Chain-of-thought and “thinking” models',
            b: H.split(
              H.prose(
                'Asking a model to “think step by step” (<b>chain-of-thought</b>) improves its answers on multi-step problems: it writes out intermediate steps and each step conditions the next.',
                '<b>Reasoning models</b> (OpenAI o-series and GPT-5 thinking, Claude with extended thinking, DeepSeek-R1, Qwen3 thinking mode) are trained to do this internally before answering. They spend extra tokens “thinking”.',
                'Trade-off: better on troubleshooting, planning and code; slower and more expensive. Hermes lets you set <code>reasoning_effort</code> per task or cron job.'
              ),
              H.code('User: Users at Branch-2 cannot reach intranet; HQ can.\n\nModel (thinking):\n 1. DNS answers the same at both sites → not DNS.\n 2. Server answers from HQ → server is up.\n 3. Only Branch-2 fails → path between sites.\n 4. Branch-2 → HQ uses the IPsec tunnel → check tunnel first.\nAnswer: Check the site-to-site tunnel status before anything else.', 'text', 'what “thinking” looks like')
            ),
          },
          {
            t: 'Chatbot vs reasoning engine',
            b: H.split(
              H.fig(D.columns([
                { h: 'LLM as chatbot', items: ['Answers questions', 'Knowledge from training', 'You copy-paste results', 'Text in, text out'] },
                { h: 'LLM as reasoning engine', c: 'acc', items: ['Plans and decides', 'Knowledge from tools + RAG', 'Calls tools itself', 'Goal in, outcome out'] },
              ], { bh: 42 })),
              H.prose(
                'The big mental shift of this course: stop treating the LLM as an <b>encyclopedia</b> and start treating it as a <b>reasoning engine</b> (a CPU for language) that you connect to real data and real tools.',
                'An encyclopedia that is sometimes wrong is dangerous. A reasoning engine that checks facts with tools, and asks before risky actions, is useful.'
              )
            ),
            n: 'This slide is the bridge to Module 7. Repeat the phrase “reasoning engine, not encyclopedia” a few times.',
          },
        ],
      },
      {
        id: 'm2-6', title: 'Two kinds of language model, and two kinds of task', mins: 15, deck: [13, 20, 24],
        slides: [
          {
            t: 'Representation models vs generative models',
            b: H.split(
              H.table(['', 'Representation (embedding) models', 'Generative models'], [
                ['Output', 'A vector', 'New text'],
                ['Architecture', 'Usually encoder-only', 'Usually decoder-only'],
                ['Size', 'Small (100M–1B), runs on CPU', 'Large (1B–1T), wants GPUs'],
                ['Used for', 'Search, clustering, classification, RAG retrieval', 'Chat, summarising, writing, tool use, agents'],
              ]),
              H.note('it', 'A good RAG system uses <b>both</b>: a small embedding model to find the right runbook chunks, and a generative model to write the answer.')
            ),
          },
          {
            t: 'Text classification, two ways',
            b: H.split(
              H.prose(
                '<b>With a representation model:</b> embed each ticket, then train a small classifier (logistic regression) on top. Fast, cheap, very accurate with a few thousand labelled examples. Needs labelled data.',
                '<b>With a generative model:</b> prompt it: “Classify this ticket as Network, Identity, Hardware, Application or Security. Reply with one word.” Zero training data, flexible, but slower and pricier per item.',
                'The book example is movie-review sentiment; our version is ticket routing. Same technique.'
              ),
              H.code('# representation route (sketch)\nvecs = embed(ticket_texts)                  # small embedding model\nclf  = LogisticRegression().fit(vecs, labels)\nclf.predict(embed(["VPN drops every 15 min"]))  # → "Network"\n\n# generative route\nllm("Classify the ticket into Network|Identity|Hardware|"\n    "Application|Security. Ticket: VPN drops every 15 min")  # → "Network"', 'python', 'same task, two approaches')
            ),
          },
          {
            t: 'Closed-ended vs open-ended tasks',
            b: H.split(
              H.table(['', 'Closed-ended', 'Open-ended'], [
                ['Answer space', 'Fixed set of valid answers', 'Many valid answers'],
                ['Examples', 'Category, priority, yes/no, extract the IP address', 'Write a reply, summarise an incident, plan a migration'],
                ['How to evaluate', 'Exact match, accuracy, F1', 'Rubrics, human review, LLM-as-a-judge'],
                ['Settings', 'Temperature 0, strict output format', 'Some creativity allowed'],
              ]),
              H.note('tip', 'Turn open-ended work into closed-ended pieces wherever you can. “Is this ticket a P1? yes/no” is far easier to automate, test and trust than “Handle this ticket”.')
            ),
            n: 'This is the deck\'s “open-ended vs closed-ended” concept. It is also how we will design evals in Module 5.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'Roughly how many tokens is 4,000 characters of English text?', a: ['About 100', 'About 1,000', 'About 4,000', 'About 16,000'], c: 1, why: 'Rule of thumb: 1 token ≈ 4 characters of English, so about 1,000 tokens.' },
      { q: 'Why does an agent cost much more than a single chat answer for the same question?', a: ['Agents use a more expensive model', 'The full context is re-sent on every step of the agent loop', 'Tools are billed per call by the model vendor', 'Agents always use reasoning mode'], c: 1, why: 'Each think-act-observe step is a new model call carrying the system prompt, tool schemas and growing history.' },
      { q: '“The storage box is beeping” finds the runbook “RAID array degraded”. Which technology made that possible?', a: ['Keyword search', 'Regular expressions', 'Embeddings / semantic search', 'Tokenization'], c: 2, why: 'Embeddings place texts with similar meaning close together even when they share no words.' },
      { q: 'For a tool-using agent you want consistent, repeatable decisions. Which temperature is the better default?', a: ['Low (0–0.3)', 'High (1.5–2)', 'It makes no difference', 'Exactly 1.0 always'], c: 0, why: 'Low temperature makes the model pick the most likely tokens, giving more consistent tool calls and answers.' },
      { q: 'Which statement about hallucination is true?', a: ['Bigger models never hallucinate', 'It is a temporary bug that will be fixed soon', 'It follows from generating plausible text; we design around it with grounding, tools, citations and approvals', 'Only happens at temperature 2'], c: 2, why: 'Models generate plausible continuations, so we ground them with facts and verify before acting.' },
      { q: 'You need to route 50,000 tickets a day into 5 fixed queues, and you have 20,000 labelled historic tickets. What is the most cost-effective first approach?', a: ['A large generative LLM on every ticket', 'Embedding model + small trained classifier', 'A diffusion model', 'Manual routing'], c: 1, why: 'A closed-ended, high-volume task with lots of labels suits embeddings plus a light classifier: cheap, fast and accurate.' },
    ],
  });
})();
