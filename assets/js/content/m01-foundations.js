(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm1', num: 1, title: 'AI foundations: from machine learning to neural networks',
    summary: 'The layers of AI, how machines learn from data, the families of neural networks, the ML pipeline, and the roles and “Ops” around them.',
    deck: [4, 5, 6, 7, 8, 29, 39],
    outcomes: ['Place AI, ML, deep learning, generative AI, LLMs and agents in one picture', 'Tell supervised, unsupervised, self-supervised and reinforcement learning apart, with an IT example of each', 'Name the main neural network families and what each is good at', 'Describe the ML pipeline and how DevOps, MLOps and LLMOps differ'],
    lessons: [
      {
        id: 'm1-1', title: 'The layers of AI', mins: 10, deck: [4],
        slides: [
          {
            t: 'AI is a set of nested ideas',
            b: H.stack(
              H.fig(D.nested([
                { t: 'Artificial Intelligence', s: 'any technique that makes machines act “smart”, including rules and search' },
                { t: 'Machine Learning', s: 'learns patterns from data instead of hand-written rules' },
                { t: 'Deep Learning', s: 'ML with many-layered neural networks' },
                { t: 'Generative AI', s: 'creates new text, images, audio, code' },
                { t: 'Large Language Models', s: 'transformers trained on huge text corpora' },
                { t: 'AI Agents', s: 'an LLM + tools + a loop + memory + guardrails' },
              ]), 'Each ring is a subset of the one around it. Agents are the newest, innermost layer, and depend on everything outside them.'),
              H.note('it', 'Your spam filter is ML. Your ticket auto-categoriser might be deep learning. ChatGPT is a generative LLM. A system that reads a ticket, pings the server and restarts the service is an <b>agent</b>.')
            ),
            n: 'The deck had “picture in mobile” here. This nested diagram is that picture. Ask: where does a rule-based firewall IDS sit? (AI, but not ML, unless it learns from traffic.)',
          },
          {
            t: 'Rules vs learning: the core shift',
            b: H.split(
              H.prose(
                '<b>Classic programming:</b> you write the rules, the computer applies them to data. <code>if failed_logins &gt; 5: lock_account()</code>',
                '<b>Machine learning:</b> you give the computer data <i>and</i> the answers, and it learns the rules. Show it 100,000 logins labelled “normal” or “attack” and it learns what an attack looks like, including patterns nobody wrote down.',
                '<b>LLMs</b> take this further: they learned from so much text that you can now “program” them with plain-language instructions.'
              ),
              H.fig(D.columns([
                { h: 'Programming', items: ['Rules + Data', '↓', 'Answers'] },
                { h: 'Machine learning', c: 'tl', items: ['Data + Answers', '↓', 'Rules (a model)'] },
                { h: 'Prompting an LLM', c: 'acc', items: ['Instructions + Data', '↓', 'Answers'] },
              ], { bh: 40 }))
            ),
          },
        ],
      },
      {
        id: 'm1-2', title: 'How machines learn', mins: 20, deck: [5],
        slides: [
          {
            t: 'Four ways to learn from data',
            b: H.cards([
              ['Supervised', 'Learns from <b>labelled</b> examples: input → correct answer. <br><i>IT: tickets labelled with their category → auto-categorise new tickets.</i>', 'labels'],
              ['Unsupervised', 'Finds structure in <b>unlabelled</b> data: groups and outliers. <br><i>IT: cluster syslog lines to find unusual patterns nobody has seen before.</i>', 'no labels'],
              ['Self-supervised', 'Creates its own labels from the data: hide a word, predict it. <br><i>This is how LLMs are pre-trained on the internet.</i>', 'auto labels'],
              ['Semi-supervised', 'A few labels plus lots of unlabelled data. <br><i>IT: 500 labelled phishing emails + 50,000 unlabelled ones.</i>', 'some labels'],
            ], 4) + H.note('key', '<b>Reinforcement learning</b> is the fifth way: an agent takes actions, gets rewards or penalties, and learns a policy. It is how LLMs are aligned with human preferences (RLHF, Module 3).'),
          },
          {
            t: 'Classical machine learning, the toolbox',
            b: H.table(['Technique', 'Output', 'IT operations example'], [
              ['<b>Regression</b>', 'A real number', 'Predict when a volume will be 100% full from its growth curve'],
              ['<b>Classification</b>', 'A category', 'Is this email phishing or not? Which queue does this ticket go to?'],
              ['<b>Support Vector Machine (SVM)</b>', 'A category, via the widest boundary between classes', 'Separate normal vs abnormal NetFlow records'],
              ['<b>Decision tree / random forest</b>', 'A category or number, via if/else splits', 'Predict disk failure from SMART attributes (readable “why”)'],
              ['<b>Clustering (k-means, DBSCAN)</b>', 'Groups', 'Group similar incidents to find a hidden common root cause'],
              ['<b>Reinforcement learning</b>', 'A policy (what to do next)', 'Tune cooling setpoints in a datacenter to cut power use'],
            ]) + H.note('tip', 'Classical ML is still the right tool for many structured-data problems: cheaper, faster and more explainable than an LLM. Do not use an LLM to predict disk growth.'),
            n: 'Good discussion: which of our monitoring problems are regression (forecasting) vs classification (alerting)? Most capacity planning is regression.',
          },
          {
            t: 'Training, validation, test: why we split data',
            b: H.split(
              H.prose(
                'A model that memorises its training data is useless on new data. That is <b>overfitting</b>, like a junior engineer who memorised last year\'s incidents but cannot debug a new one.',
                'So we split the data: <b>train</b> (learn), <b>validation</b> (tune settings), <b>test</b> (final exam, touched once).',
                'The same idea comes back when we evaluate agents: keep a set of real tickets the agent has never seen, and grade it on those.'
              ),
              H.fig(D.flow([{ t: 'Train', s: '~70%', c: 'tl' }, { t: 'Validate', s: '~15%' }, { t: 'Test', s: '~15%', c: 'acc' }]))
            ),
          },
        ],
      },
      {
        id: 'm1-3', title: 'The maths, and how much you actually need', mins: 10, deck: [6],
        slides: [
          {
            t: 'The mathematics behind it',
            b: H.split(
              H.table(['Area', 'Where it shows up'], [
                ['Linear algebra', 'Vectors, matrices, embeddings, attention. A model is mostly matrix multiplication.'],
                ['Probability', 'Every LLM output is a probability distribution over the next token.'],
                ['Statistics', 'Evaluation, confidence, sampling, A/B testing of prompts.'],
                ['Calculus', 'Gradients: how training nudges each weight to reduce the error.'],
                ['Differential equations', 'Diffusion models (image generation) and some optimisers.'],
                ['Information theory', 'Cross-entropy loss, perplexity, compression, tokenization.'],
                ['Signals and systems', 'Audio models (speech-to-text), convolutions in vision models.'],
              ]),
              H.note('key', 'For <b>using</b> and <b>operating</b> agents you need none of this in depth. You need intuition: models are probabilistic, sizes are about memory, and context is a budget.', 'Good news') +
              H.note('tip', 'If you want depth later: 3Blue1Brown\'s “Neural networks” video series gives the intuition for linear algebra and gradients in a few hours.')
            ),
            n: 'This slide reassures the audience. The deck says “if you need deep understanding, which is not required for most engineers”. Keep it light and move on.',
          },
        ],
      },
      {
        id: 'm1-4', title: 'Neural networks and their families', mins: 20, deck: [7],
        slides: [
          {
            t: 'A neural network in one picture',
            b: H.split(
              H.fig(D.raw('0 0 1000 420', (function () {
                const L = [[3, 140], [5, 380], [5, 620], [2, 860]];
                let s = '';
                const pos = L.map(([n, x]) => Array.from({ length: n }, (_, i) => [x, 210 + (i - (n - 1) / 2) * 70]));
                for (let l = 0; l < pos.length - 1; l++) pos[l].forEach((a) => pos[l + 1].forEach((c) => (s += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" class="ln" style="opacity:.35"/>`)));
                pos.forEach((layer, l) => layer.forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="20" class="${l === 0 ? 'box-tl' : l === pos.length - 1 ? 'box-acc' : 'box'}"/>`)));
                const tr = window.ACADEMY.tr, dir = window.ACADEMY.D.dirAttr;
                ['Inputs', 'Hidden layer', 'Hidden layer', 'Outputs'].forEach((t, i) => (s += `<text x="${L[i][1]}" y="400" class="m" text-anchor="middle"${dir}>${tr(t).toUpperCase()}</text>`));
                s += `<text x="140" y="40" class="s" text-anchor="middle"${dir}>${tr('CPU %, errors/min, latency')}</text><text x="860" y="70" class="s" text-anchor="middle"${dir}>${tr('P(incident) · P(normal)')}</text>`;
                return s;
              })(), window.ACADEMY.tr('A small feed-forward neural network'))),
              H.prose(
                'Each circle is a <b>neuron</b>: it multiplies its inputs by <b>weights</b>, adds them up and passes the result through a simple non-linear function.',
                '<b>Training</b> adjusts millions or billions of weights so the outputs match the right answers (backpropagation + gradient descent).',
                '“Deep” learning just means many hidden layers. A modern LLM has dozens of layers and billions of weights. Those weights <i>are</i> the model file you download.'
              )
            ),
          },
          {
            t: 'Families of neural networks',
            b: H.cards([
              ['CNN', 'Convolutional nets slide small filters over images. <i>Read rack photos, recognise LEDs or cable labels, OCR.</i>', 'vision'],
              ['RNN / LSTM', 'Process sequences step by step with a memory. <i>Older time-series and text models.</i> Slow, forgets long contexts.', 'sequences'],
              ['Transformer', 'Looks at all tokens at once with <b>attention</b>. The engine of every modern LLM. <i>Module 2.</i>', 'LLMs'],
              ['Autoencoder', 'Compresses input then rebuilds it. Bad reconstruction means “unusual”. <i>Anomaly detection on metrics.</i>', 'anomalies'],
              ['GAN', 'Two nets compete: a generator and a discriminator. <i>Synthetic data, early image generation.</i>', 'generation'],
              ['Diffusion model', 'Learns to remove noise step by step. <i>Image and video generation (Stable Diffusion, FLUX).</i>', 'generation'],
            ]),
          },
          {
            t: 'Computer vision tasks you will meet',
            b: H.table(['Task', 'Question it answers', 'IT example'], [
              ['Classification', 'What is in this image?', '“Is this a photo of a server or a switch?”'],
              ['Regression', 'Which number fits this image?', 'Estimate rack fill % from a photo'],
              ['Detection', 'Where are the objects?', 'Find every amber LED in a photo of a rack'],
              ['OCR / document AI', 'What does the text say?', 'Read serial numbers from asset labels, digitise scanned contracts'],
            ]) + H.note('it', 'Modern <b>vision-language models</b> (Module 5) do most of these from a prompt: “List every device in this rack photo with its status LEDs.”'),
          },
        ],
      },
      {
        id: 'm1-5', title: 'Frameworks and the ML pipeline', mins: 15, deck: [8, 39],
        slides: [
          {
            t: 'The frameworks',
            b: H.cards([
              ['scikit-learn', 'Classical ML in Python: regression, trees, SVM, clustering. Start here for tabular data such as metrics or CMDB exports.', 'classic ML'],
              ['PyTorch', 'The dominant deep-learning framework. Most open LLMs are trained and fine-tuned with it. Hugging Face Transformers builds on it.', 'deep learning'],
              ['TensorFlow / Keras', 'Google\'s deep-learning framework. Still common in production vision and mobile models.', 'deep learning'],
            ]) + H.note('tip', 'As agent builders we rarely touch these directly. We consume trained models through an API (OpenAI-compatible) or a runtime such as Ollama, vLLM or llama.cpp.'),
          },
          {
            t: 'The ML pipeline',
            b: H.stack(
              H.fig(D.flow([
                { t: 'Gather', s: 'logs, tickets, metrics' },
                { t: 'Curate', s: 'select, label, dedupe' },
                { t: 'Clean', s: 'fix, normalise, redact PII', c: 'tl' },
                { t: 'Train', s: 'fit the model' },
                { t: 'Validate', s: 'tune, compare' },
                { t: 'Test', s: 'unseen data', c: 'acc' },
                { t: 'Inference', s: 'serve in production', c: 'ok' },
              ], { loop: 'monitor → collect new data → retrain' })),
              H.note('key', '“Garbage in, garbage out” applies doubly. Most ML projects fail at the data steps, not the model step. For our ticket data: duplicates, “see previous email” tickets and wrong categories are the real enemy.')
            ),
            n: 'Map this to an ITIL-style lifecycle: data gathering ≈ discovery, train/validate/test ≈ build and test, inference ≈ operate. Retraining is like patch management.',
          },
        ],
      },
      {
        id: 'm1-6', title: 'Roles and Ops: ML engineer, AI engineer, MLOps, LLMOps', mins: 15, deck: [29],
        slides: [
          {
            t: 'ML engineer vs AI engineer',
            b: H.split(
              H.table(['', 'ML engineer', 'AI engineer'], [
                ['Starts from', 'Data', 'A product idea plus an existing foundation model'],
                ['Main work', 'Feature engineering, training, tuning models', 'Prompts, RAG, tools, agents, evaluation, guardrails'],
                ['Needs', 'Statistics, ML maths, GPUs for training', 'Software engineering, APIs, system design, evals'],
                ['Typical output', 'A trained model', 'An application or agent that uses models'],
              ]),
              H.note('key', 'This course makes you an <b>AI engineer for IT operations</b>. You will build on foundation models, not train them from scratch, and that is where most of the value is today.')
            ),
          },
          {
            t: 'DevOps vs MLOps vs LLMOps',
            b: H.stack(
              H.fig(D.columns([
                { h: 'DevOps', items: ['Code is the artefact', 'CI/CD, IaC, monitoring', 'Tests are deterministic', 'Rollback = redeploy'] },
                { h: 'MLOps', c: 'tl', items: ['Code + data + model', 'Data versioning, training pipelines', 'Drift monitoring', 'Retrain on new data'] },
                { h: 'LLMOps / AgentOps', c: 'acc', items: ['Prompts, tools, skills, models', 'Evals with test sets + LLM judges', 'Cost, latency and safety monitoring', 'Trace every tool call'] },
              ], { bh: 40 })),
              H.note('it', 'You already run DevOps for infrastructure. LLMOps adds new things to version (prompts, skills, model choice) and new things to monitor (token cost, hallucination rate, unsafe actions). Module 13 turns this into our operating model.')
            ),
          },
        ],
      },
    ],
    quiz: [
      { q: 'You want to forecast when a SAN volume will reach 100%. Which ML technique fits best?', a: ['Clustering', 'Regression', 'Classification', 'A GAN'], c: 1, why: 'Forecasting a real-valued number over time is a regression problem.' },
      { q: 'How are LLMs mainly pre-trained?', a: ['Supervised, with human-labelled answers', 'Self-supervised, predicting hidden or next tokens in huge amounts of text', 'Unsupervised clustering', 'Reinforcement learning only'], c: 1, why: 'Pre-training is self-supervised: the text itself supplies the label (the next token). Human labels come later, in post-training.' },
      { q: 'Which network family powers modern LLMs?', a: ['CNN', 'RNN', 'Transformer', 'Autoencoder'], c: 2, why: 'Transformers, with their attention mechanism, are the architecture behind GPT, Claude, Llama, Qwen and the rest.' },
      { q: 'What is overfitting?', a: ['The model is too small', 'The model memorises training data and does badly on new data', 'The GPU runs out of memory', 'The model is trained for too short a time'], c: 1, why: 'An overfitted model looks great on training data and fails on unseen data. That is why we keep a separate test set.' },
      { q: 'What does LLMOps add on top of DevOps?', a: ['Nothing new', 'Versioning prompts, skills and models; evaluating outputs; monitoring cost, quality and safety', 'Only GPU drivers', 'Only Kubernetes'], c: 1, why: 'LLM systems are probabilistic, so they need evals, prompt and model versioning, and monitoring of quality, cost and unsafe behaviour.' },
    ],
  });
})();
