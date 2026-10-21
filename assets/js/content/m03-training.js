(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm3', num: 3, title: 'How LLMs are built: training, fine-tuning, alignment',
    summary: 'Pre-training a foundation model, post-training it into an assistant with SFT and preference tuning, what that costs, and how fine-tuning techniques work.',
    deck: [12, 14, 15, 16, 17, 34, 54],
    outcomes: ['Explain the difference between a base model and an instruct/chat model', 'Describe SFT, RLHF, RLAIF and reward models', 'Explain why training data quality and labelling are expensive', 'Compare full fine-tuning, LoRA/QLoRA and distillation, and know when not to fine-tune'],
    lessons: [
      {
        id: 'm3-1', title: 'Pre-training: making a foundation model', mins: 15, deck: [12],
        slides: [
          {
            t: 'From the internet to a foundation model',
            b: H.stack(
              H.fig(D.flow([
                { t: 'Trillions of tokens', s: 'web, books, code, papers' },
                { t: 'Self-supervised', s: 'predict the next token' },
                { t: 'Weeks on 1,000s of GPUs', s: '$ millions', c: 'crit' },
                { t: 'Foundation / base model', s: 'knows language + facts', c: 'acc' },
              ], { anim: true })),
              H.split(
                H.prose('<b>Pre-training</b> uses self-supervision: the text is its own label. Hide the next token, predict it, measure the error, adjust the weights, repeat trillions of times.', 'The result is a <b>foundation model</b> (or <b>base model</b>): it has absorbed grammar, facts, code and reasoning patterns.'),
                H.note('warn', 'A base model is good at <b>text completion</b> only. Ask it “How do I reset a password?” and it may continue with three more forum-style questions. It does not yet know it is supposed to answer you.', 'Base ≠ assistant')
              )
            ),
            n: 'If you can, demo a base model in LM Studio next to its instruct version. The difference is striking and makes post-training concrete.',
          },
        ],
      },
      {
        id: 'm3-2', title: 'Post-training: SFT and preference tuning', mins: 25, deck: [12, 54],
        slides: [
          {
            t: 'The three stages (after AI Engineering, fig. 2-10)',
            b: H.stack(
              H.fig(D.flow([
                { t: '1. Pre-training', s: 'self-supervised\non internet-scale text', c: 'ink' },
                { t: '2. Supervised fine-tuning', s: 'SFT on (prompt, ideal answer)\ndemonstrations', c: 'tl' },
                { t: '3. Preference fine-tuning', s: 'RLHF / RLAIF / DPO\nwith a reward signal', c: 'acc' },
                { t: 'Chat / instruct model', s: 'helpful, follows\ninstructions, safer', c: 'ok' },
              ], { h: 112 }), 'Pre-training gives knowledge. SFT teaches the format of a helpful answer. Preference tuning teaches which answers people prefer.'),
              H.note('tip', 'A popular meme (also used in AI Engineering) puts it this way: pre-training makes a monster that has read the whole internet; SFT gives it a socially acceptable face; preference tuning puts the final smiley face on it.')
            ),
          },
          {
            t: 'Step 2: supervised fine-tuning on demonstrations',
            b: H.split(
              H.prose('Humans write high-quality examples of prompts and ideal responses (<b>demonstration data</b>). The base model is fine-tuned on tens of thousands of them, called <b>instruction tuning</b>.', 'This is where the model learns to answer instead of continue, to follow formats, and to refuse some requests.'),
              H.table(['Prompt (example)', 'Labeller writes the ideal answer'], [
                ['Summarise this incident for the CIO in 3 bullets: …', 'A precise, 3-bullet summary in plain language'],
                ['Write a PowerShell one-liner to list locked AD accounts.', '<code>Search-ADAccount -LockedOut | Select Name,SamAccountName</code> + one-line explanation'],
                ['Is it safe to run rm -rf / --no-preserve-root?', 'A clear warning, what it does, and safer alternatives'],
              ])
            ) + H.note('key', 'In InstructGPT\'s demonstration data (AI Engineering, table 2-6), labellers needed real critical thinking: brainstorming, rewriting, classification, open QA. That is why labelling is slow and expensive.'),
          },
          {
            t: 'Step 3: preference tuning, RLHF and friends',
            b: H.split(
              H.steps([
                ['Collect comparisons', 'For one prompt, the model writes 2+ answers; humans pick the better one. This is the preference dataset.'],
                ['Train a reward model', 'A model learns to predict the score a human would give an answer.'],
                ['Optimise the LLM', 'Reinforcement learning (e.g. PPO) pushes the LLM towards high-reward answers. This is RLHF.'],
                ['Or skip the reward model', 'DPO and similar methods learn directly from the preference pairs. Simpler, now very common.'],
              ]),
              H.cards([
                ['RLHF', 'RL from <b>human</b> feedback. Expensive, high quality.', 'humans'],
                ['RLAIF', 'RL from <b>AI</b> feedback: a strong model (LLM-as-a-judge) labels the preferences, guided by a written constitution.', 'AI judges'],
                ['Alignment datasets', 'Preference data focused on safety and policy: what to refuse, how to stay honest.', 'safety'],
              ])
            ),
            n: 'Connect this to our world: a “reward model” is like a QA reviewer scoring ticket replies. We will use the same idea, LLM-as-a-judge, to evaluate our agents in Module 5.',
          },
        ],
      },
      {
        id: 'm3-3', title: 'The real cost of training data', mins: 15, deck: [14, 15],
        slides: [
          {
            t: 'Why data is the expensive part',
            b: H.cards([
              ['Recruiting labellers', 'You need domain experts (doctors, lawyers, network engineers) for specialised data, not crowd workers.', 'people'],
              ['Quality control', 'Two labellers often disagree. You need guidelines, double review and agreement metrics.', 'QA'],
              ['Critical thinking', 'Writing a great demonstration answer takes 5–30 minutes. Tens of thousands of them adds up to years of work.', 'time'],
              ['Synthetic data', 'Strong models now generate much of the training data; humans review samples. Cheaper, but can copy the generator\'s mistakes.', 'LLM-made'],
            ], 4) + H.note('it', 'If we ever fine-tune on our own tickets, <b>we</b> are the labellers. 2,000 clean, reviewed examples beat 50,000 messy ones every time.'),
          },
          {
            t: 'What a training sample looks like',
            b: H.split(
              H.code('{"messages": [\n  {"role": "system", "content": "You are ACME\'s IT triage assistant."},\n  {"role": "user", "content": "Since 9:40 nobody in Branch-2 can open the intranet. Internet works."},\n  {"role": "assistant", "content": "{\\"category\\": \\"Network\\", \\"priority\\": \\"P2\\", \\"summary\\": \\"Branch-2 cannot reach HQ services\\", \\"needs_human\\": true}"}\n]}', 'json', 'one SFT example (chat JSONL)'),
              H.code('{"prompt": "Write a reply to a user whose account is locked.",\n "chosen":   "Your account is locked after several failed sign-ins. I have unlocked it; if it locks again, check the password saved on your phone\'s mail app.",\n "rejected": "Account unlocked. Please send me your new password so I can test it."}', 'json', 'one preference pair (DPO)')
            ) + H.note('warn', 'Clean before you train: remove passwords, personal data and secrets from tickets. A model can memorise and repeat its training data.'),
          },
        ],
      },
      {
        id: 'm3-4', title: 'Fine-tuning techniques', mins: 20, deck: [34, 17],
        slides: [
          {
            t: 'Ways to adapt a model',
            b: H.table(['Technique', 'What changes', 'Hardware', 'When to use'], [
              ['<b>Full fine-tuning</b>', 'All weights', 'Many large GPUs', 'Rarely: big labs, big budgets'],
              ['<b>LoRA</b> (low-rank adaptation)', 'Small adapter matrices beside frozen weights (~0.1–1% of parameters)', 'One good GPU for 7–14B models', 'The default way to fine-tune open models'],
              ['<b>QLoRA</b>', 'LoRA on a 4-bit quantized base model', 'One consumer GPU (24 GB) for ~30B', 'Budget fine-tuning'],
              ['<b>Distillation</b>', 'A small student model learns from a big teacher\'s outputs', 'Moderate', 'Make a cheap, fast model for one task'],
              ['<b>Classification head</b>', 'A small layer on top of an encoder', 'CPU/GPU, minutes', 'Spam/not-spam, ticket routing'],
            ]) + H.note('tip', 'Tools: Hugging Face TRL and PEFT, Unsloth, Axolotl (there is a Hermes skill for it). Expect to iterate: data, train, evaluate, repeat.'),
          },
          {
            t: 'Domain-specific vs general-purpose models',
            b: H.split(
              H.table(['', 'Domain-specific', 'General-purpose'], [
                ['Examples', 'Coding models (Qwen3-Coder), medical, legal, security models', 'GPT, Claude, Gemini, Llama, Qwen'],
                ['Strength', 'Better and cheaper inside its niche', 'Handles anything, follows instructions well'],
                ['Weakness', 'Brittle outside its niche', 'May lack deep or private domain knowledge'],
                ['For agents', 'Good as a specialist sub-agent', 'Good as the orchestrator / planner'],
              ]),
              H.note('key', 'A strong pattern for IT: a <b>general model</b> plans and talks to people, and <b>specialist</b> models or small fine-tuned classifiers handle narrow, high-volume steps.')
            ),
          },
          {
            t: 'Uncensored, “obliterated”, quantized: what you will see on Hugging Face',
            b: H.cards([
              ['Abliterated / “obliterated”', 'A technique that finds the “refusal direction” in a model\'s activations and removes it. The model stops refusing anything.', 'removed safety'],
              ['Uncensored fine-tunes', 'Re-trained on data without refusals. Same effect, different method.', 'removed safety'],
              ['Quantized', 'Weights stored at 8, 5 or 4 bits instead of 16. Smaller, faster, slightly less accurate. Covered in Module 5.', 'compressed'],
            ]) + H.note('crit', 'Never connect an abliterated or uncensored model to real tools, credentials or company data. Its refusals are part of your defence against prompt injection and misuse.', 'Policy'),
          },
          {
            t: 'Do we even need to fine-tune?',
            b: H.widget('chooser'),
            n: 'Walk the group through one real use case, for example “answer questions about our VPN runbooks”. The answer is almost always RAG plus a good prompt, not fine-tuning. Fine-tuning is for behaviour and format at scale.',
          },
        ],
      },
      {
        id: 'm3-5', title: 'Best practices for adapting models', mins: 10, deck: [16],
        slides: [
          {
            t: 'Best practices',
            b: H.split(
              H.steps([
                ['Start with the strongest model + a good prompt', 'Establish a baseline quality and cost.'],
                ['Build an eval set first', '50–200 real examples with expected answers, before you change anything.'],
                ['Add RAG for knowledge gaps', 'Facts change; prompts and retrieval can change with them.'],
                ['Fine-tune only for behaviour, format or cost', 'And only with clean, reviewed, de-identified data.'],
                ['Re-run the eval after every change', 'Prompts, models and data are versioned like code.'],
              ]),
              H.note('it', 'Treat a prompt or model change like a firmware change: test in the lab against a known set of cases, compare with the baseline, then roll out gradually with a rollback plan.')
            ),
          },
        ],
      },
    ],
    quiz: [
      { q: 'A base (pre-trained only) model is mainly good at…', a: ['Following instructions in chat', 'Continuing text', 'Calling tools', 'Refusing harmful requests'], c: 1, why: 'Base models complete text. Instruction-following comes from post-training (SFT and preference tuning).' },
      { q: 'What does the reward model in RLHF do?', a: ['Pays the labellers', 'Predicts how much humans would prefer an answer, guiding RL optimisation', 'Generates training data', 'Compresses the model'], c: 1, why: 'It learns human preference from comparisons and scores candidate answers during reinforcement learning.' },
      { q: 'RLAIF differs from RLHF because…', a: ['It uses no data', 'Preferences come from an AI judge instead of humans', 'It only works on images', 'It skips pre-training'], c: 1, why: 'RL from AI Feedback uses a strong model (LLM-as-a-judge) to produce the preference labels.' },
      { q: 'You want to fine-tune a 14B open model on one 24 GB GPU. Which technique fits?', a: ['Full fine-tuning in FP32', 'QLoRA', 'Pre-training from scratch', 'RLHF with human labellers'], c: 1, why: 'QLoRA trains small LoRA adapters on a 4-bit quantized base model, so it fits on a single consumer GPU.' },
      { q: 'Which model should never be connected to production tools and data?', a: ['A quantized Q4 model', 'An abliterated / uncensored model', 'A distilled model', 'A domain-specific coding model'], c: 1, why: 'Abliterated and uncensored models have their safety refusals removed, which takes away a defence layer against misuse and injection.' },
    ],
  });
})();
