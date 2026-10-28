(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm5', num: 5, title: 'Models, hardware and running AI on-prem',
    summary: 'The model landscape, how to read a model\'s name, quantization, sizing GPUs and unified-memory machines, running models locally, multimodal and voice, and how to evaluate models.',
    deck: [21, 22, 23, 25, 28, 32, 35, 36, 43],
    outcomes: ['Compare closed API models and open-weight models for a use case', 'Decode a model file name (size, MoE, quantization, format)', 'Estimate the memory and speed needed to run a model locally', 'Serve a model with Ollama, LM Studio or llama.cpp', 'Design a small evaluation for an IT agent'],
    lessons: [
      {
        id: 'm5-1', title: 'The model landscape', mins: 15, deck: [23, 25],
        slides: [
          {
            t: 'Popular model providers',
            b: H.table(['Provider', 'Families', 'Open weights?', 'Notes'], [
              ['OpenAI', 'GPT-5 family, o-series reasoning, Whisper (speech), gpt-oss', 'gpt-oss and Whisper: yes', 'Strong general and coding models'],
              ['Anthropic', 'Claude Opus / Sonnet / Haiku', 'No', 'Strong at agentic coding and tool use; makes Claude Code'],
              ['Google', 'Gemini (API), Gemma (open)', 'Gemma: yes', 'Very long context; good multimodal'],
              ['Meta', 'Llama (e.g. 8B, 70B, 405B)', 'Yes (Llama licence)', 'Widely fine-tuned by the community'],
              ['Alibaba', 'Qwen, Qwen-Coder, Qwen-VL', 'Yes (mostly Apache-2.0)', 'Excellent open models at every size'],
              ['DeepSeek', 'DeepSeek V3 / R1 (MoE)', 'Yes (MIT)', 'Large mixture-of-experts reasoning models'],
              ['Zhipu / Z.ai, Moonshot, MiniMax', 'GLM, Kimi, MiniMax', 'Mostly yes', 'Strong Chinese open agentic and coding models'],
              ['Mistral, Microsoft, NVIDIA', 'Mistral / Magistral, Phi, Nemotron', 'Mostly yes', 'Efficient small and mid-size models'],
            ]) + H.note('warn', 'Model names and versions change every few months. Check the provider\'s model list and the model card before you choose. Do not trust a model\'s own claim about which model it is.'),
          },
          {
            t: 'Closed API models vs open-weight models',
            b: H.split(
              H.table(['', 'Closed API', 'Open weights (self-hosted)'], [
                ['Quality', 'Usually the frontier', 'Close behind, catching up fast'],
                ['Data location', 'Leaves your network (check DPA, region, retention)', 'Stays on-prem'],
                ['Cost model', 'Pay per token', 'Pay for hardware + power + people'],
                ['Ops effort', 'Low', 'You run GPUs, drivers, updates, monitoring'],
                ['Customisation', 'Prompting, some fine-tuning', 'Full: fine-tune, quantize, inspect'],
                ['Availability', 'Depends on internet + vendor', 'Works air-gapped'],
              ]),
              H.note('it', 'A common split: frontier API models for complex reasoning on <b>non-sensitive</b> work; a local open model for anything touching personal data, credentials or classified systems; small local embedding models for search.')
            ),
          },
        ],
      },
      {
        id: 'm5-2', title: 'Reading a model name', mins: 15, deck: [32],
        slides: [
          {
            t: 'What does “size” mean?',
            b: H.split(
              H.prose(
                'Size = number of <b>parameters</b> (weights), in billions: 8B, 70B, 671B. Each parameter is a number that must sit in memory while the model runs.',
                '<b>Dense</b> models use every parameter for every token. <b>Mixture-of-experts (MoE)</b> models have many “expert” sub-networks and use only a few per token: Qwen3-30B-<b>A3B</b> has 30B total but only 3B active. Memory follows the total; speed follows the active count.',
                'Memory is <b>VRAM</b> on a GPU, or <b>unified memory</b> on Apple Silicon, DGX Spark and AMD Ryzen AI Max machines.'
              ),
              H.fig(D.columns([
                { h: 'Dense 32B', items: ['all 32B used', 'per token', '≈ 20 GB at Q4'] },
                { h: 'MoE 30B-A3B', c: 'acc', items: ['3B active', 'per token', '≈ 18 GB at Q4, ~8× faster'] },
              ], { bh: 40 }))
            ),
          },
          {
            t: 'Decode it yourself',
            b: H.widget('modelName'),
            n: 'Go through the presets. Point out “-it”, which is Gemma\'s way of saying instruct. Stop on the abliterated example and repeat the policy from Module 3.',
          },
        ],
      },
      {
        id: 'm5-3', title: 'Quantization and inference optimization', mins: 15, deck: [35, 12],
        slides: [
          {
            t: 'Quantization: smaller numbers, smaller model',
            b: H.split(
              H.table(['Precision', 'Bits / weight', '8B model size', 'Quality vs FP16'], [
                ['FP16 / BF16', '16', '~16 GB', 'Reference'],
                ['Q8_0 / FP8', '~8', '~8.5 GB', 'Practically identical'],
                ['Q6_K', '~6.6', '~6.6 GB', 'Very close'],
                ['Q5_K_M', '~5.7', '~5.7 GB', 'Close'],
                ['<b>Q4_K_M</b>', '~4.8', '~4.9 GB', '<b>Small loss, the usual sweet spot</b>'],
                ['Q3 / Q2', '2.6–3.9', '2.7–3.9 GB', 'Noticeable loss, especially for tool calling'],
              ]),
              H.note('tip', 'For agents, prefer a <b>bigger model at Q4</b> over a smaller model at Q8. Tool calling and instruction following suffer first when quality drops, so avoid going below Q4 for agent work.')
            )
          },
          {
            t: 'Other inference optimizations',
            b: H.cards([
              ['KV cache', 'Stores attention keys and values for tokens already processed, so each new token is cheap. Grows with context length, so it uses memory too.', 'memory'],
              ['Prompt caching', 'APIs and Hermes reuse an unchanged prompt prefix (system prompt, tools) at a fraction of the cost. Keep the prefix stable.', 'cost'],
              ['Batching', 'Servers like vLLM serve many users at once on the same GPU (continuous batching, PagedAttention).', 'throughput'],
              ['Speculative decoding', 'A small draft model guesses tokens and the big model verifies several at once.', 'speed'],
              ['Flash attention', 'A faster, memory-efficient attention kernel. On by default in most runtimes.', 'speed'],
              ['Distillation', 'Train a small model to imitate a big one for one job.', 'size'],
            ]),
          },
        ],
      },
      {
        id: 'm5-4', title: 'Hardware: how much do we need?', mins: 20, deck: [43, 2],
        slides: [
          {
            t: 'Hardware options for an on-prem AI backend',
            b: H.table(['Class', 'Example', 'Memory', 'Good for'], [
              ['Consumer GPU', 'RTX 3090 / 4090 (24 GB), RTX 5090 (32 GB)', '24–32 GB VRAM, very fast', 'Up to ~32B models at Q4; embeddings; fine-tuning with QLoRA'],
              ['Workstation GPU', 'RTX PRO 6000 Blackwell (96 GB)', '96 GB VRAM', '70B dense or ~120B MoE models; a small team'],
              ['Unified-memory box', 'NVIDIA DGX Spark (128 GB), AMD Ryzen AI Max+ 395 (128 GB)', 'Large but slower memory', 'Big MoE models for a few users; quiet desktop form factor'],
              ['Apple Silicon', 'MacBook Pro M4 Max, Mac Studio M3 Ultra (up to 512 GB)', 'Unified, medium bandwidth', 'Very large models for one or two users; MLX'],
              ['Datacenter GPU', 'H100 / H200 / B200', '80–192 GB HBM, highest bandwidth', 'Many concurrent users with vLLM; production serving'],
            ]) + H.note('key', 'Two numbers decide everything: <b>memory capacity</b> (does it fit?) and <b>memory bandwidth</b> (how fast does it generate?). Compute (TFLOPS) matters more for prompt processing and training.'),
          },
          {
            t: 'Size it: the VRAM and speed estimator',
            b: H.widget('vram'),
            n: 'Show three cases: Qwen3 8B fits on anything; Llama 70B at Q4 needs 48 GB+; gpt-oss-120b (MoE) fits on DGX Spark or a Ryzen AI Max box and still runs at usable speed because only ~5B parameters are active per token.',
          },
          {
            t: 'Sizing for a team, not one person',
            b: H.split(
              H.list([
                'Agents make <b>many calls per task</b> (10–50). Plan for concurrency, not one chat.',
                'Prompt processing for long contexts (64K+) is compute-heavy, so a fast GPU matters for agents.',
                'Serve with <b>vLLM</b> or <b>SGLang</b> for many users. Use Ollama or LM Studio for one or two.',
                'Budget power and cooling: an RTX 5090 can draw ~575 W. Four of them is a rack-level conversation.',
                'Keep a cloud fallback for peaks and for the hardest tasks.',
              ]),
              H.note('it', 'For a pilot: one workstation with a 96 GB GPU, or a DGX Spark / Ryzen AI Max box, running a ~30B–120B MoE model is a realistic start for 5–10 engineers. Measure, then scale.')
            ),
          },
        ],
      },
      {
        id: 'm5-5', title: 'Running models locally: Ollama, LM Studio, llama.cpp', mins: 25, deck: [28], lab: true,
        slides: [
          {
            t: 'Three ways to run an open model',
            b: H.cards([
              ['Ollama', 'One command to pull and run models; OpenAI-compatible API on port 11434. Ideal for servers and quick tests.', 'CLI + API'],
              ['LM Studio', 'Desktop app with a model browser, chat UI and a local OpenAI-compatible server. Great for trying models on a laptop.', 'GUI'],
              ['llama.cpp', 'The engine under many tools. <code>llama-server</code> gives you full control of GGUF models, context and GPU offload.', 'engine'],
              ['vLLM', 'High-throughput serving for many concurrent users on NVIDIA GPUs (safetensors, AWQ, FP8).', 'production'],
            ], 4),
          },
          {
            t: 'Lab: serve a model with Ollama for Hermes',
            b: H.split(
              H.code('# 1. Install (Linux)\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# 2. Hermes needs at least 64K context. Ollama defaults lower.\nsudo systemctl edit ollama.service\n#   [Service]\n#   Environment="OLLAMA_CONTEXT_LENGTH=65536"\n#   Environment="OLLAMA_HOST=0.0.0.0:11434"   # only if other hosts need it\nsudo systemctl daemon-reload && sudo systemctl restart ollama\n\n# 3. Pull a model that is good at tool calling\nollama pull qwen3:32b\n\n# 4. Test it and check the context\nollama run qwen3:32b "In one line: what does DHCP option 6 set?"\nollama ps          # CONTEXT column should show 65536\n\n# 5. OpenAI-compatible endpoint for Hermes or any agent\ncurl http://localhost:11434/v1/models', 'bash', 'GPU host'),
              H.stack(
                H.widget('terminal', { title: 'Practice: Ollama', chips: ['ollama pull qwen3:32b', 'ollama ps', 'nvidia-smi'] }),
                H.note('warn', 'Exposing <code>0.0.0.0:11434</code> publishes an unauthenticated API. Firewall it to the agent hosts only, or put a reverse proxy with auth in front.')
              )
            ),
          },
          {
            t: 'llama.cpp and LM Studio equivalents',
            b: H.split(
              H.code('# llama.cpp: serve a GGUF with 64K context, all layers on GPU\nllama-server -m Qwen3-32B-Q4_K_M.gguf -c 65536 -ngl 99 \\\n  --host 127.0.0.1 --port 8080 --jinja\n#  → OpenAI-compatible API at http://127.0.0.1:8080/v1\n#  --jinja enables the model\'s chat template (needed for tool calls)', 'bash', 'llama.cpp'),
              H.code('# LM Studio\n# 1. Discover tab → download e.g. Qwen3 32B (Q4_K_M)\n# 2. Developer tab → Load model, set Context Length = 65536\n# 3. Start Server → http://localhost:1234/v1\n# 4. Hermes:  hermes model  → "LM Studio"', 'text', 'LM Studio')
            ),
          },
          {
            t: 'The local-model tools, as they look',
            b: H.shots([
              ['site-ollama', 'Ollama: run open models locally or in the cloud.'],
              ['site-ollama-library', 'The Ollama library: pick a model and its size tag.'],
              ['site-lmstudio', 'LM Studio: a desktop app for running local models.'],
              ['site-huggingface-models', 'Hugging Face: where most open models are published.'],
              ['site-vllm', 'vLLM: serving open models to many users at once on GPUs.'],
            ]),
            n: 'Walk the five pictures as a map: Hugging Face is where models live, Ollama and LM Studio are two ways to run them for one or two people, vLLM is the server for many users on GPUs, and the library page shows the size tags. Ask how a 7B and a 70B tag differ in memory, tying back to the VRAM lesson.',
          },
        ],
      },
      {
        id: 'm5-6', title: 'Multimodal models and voice interfaces', mins: 15, deck: [21, 22],
        slides: [
          {
            t: 'How a model learns to see',
            b: H.stack(
              H.fig(D.flow([
                { t: 'Image', s: 'rack photo, screenshot' },
                { t: 'Vision encoder', s: 'ViT / CLIP-style\nimage → patch vectors', c: 'tl' },
                { t: 'Multimodal projector', s: 'maps image vectors\ninto the LLM\'s space', c: 'acc' },
                { t: 'LLM', s: 'reads image “tokens”\n+ your text', c: 'ink' },
                { t: 'Answer', s: '“Port 23 shows amber”' },
              ], { h: 110 })),
              H.table(['Term', 'Meaning'], [
                ['ViT', 'Vision Transformer: cuts an image into patches and treats them like tokens.'],
                ['CLIP', 'Trained on image-caption pairs so images and text share one embedding space. Powers image search and many vision encoders.'],
                ['VLM / MLLM', 'Vision-language model / multimodal LLM: an LLM that also takes images (Qwen-VL, Gemma 3, Llama 4, GPT, Claude, Gemini).'],
                ['Projector', 'The small adapter network (often a 2-layer MLP) that connects the vision encoder to the LLM. It is what turns a plain LLM into a VLM.'],
              ])
            ),
          },
          {
            t: 'Voice: speech-to-text and text-to-speech',
            b: H.split(
              H.table(['Direction', 'Cloud', 'Open source / local'], [
                ['Speech-to-text (STT)', 'OpenAI Whisper API / gpt-4o-transcribe, Google Speech-to-Text', 'Whisper, faster-whisper, whisper.cpp'],
                ['Text-to-speech (TTS)', 'OpenAI TTS, Google, ElevenLabs', 'Piper, Kokoro, Coqui XTTS'],
              ]),
              H.note('it', 'Use cases: transcribe on-call voice notes into tickets; a hands-free assistant in the datacenter (“what is the rack position of FS-02?”); read alerts aloud. Hermes supports voice memos in its messaging gateway and a <code>/voice</code> mode in the CLI.')
            ),
          },
        ],
      },
      {
        id: 'm5-7', title: 'Benchmarks and evaluations', mins: 20, deck: [36, 2],
        slides: [
          {
            t: 'Public benchmarks: useful, with care',
            b: H.table(['Benchmark', 'Measures', 'Read it as'], [
              ['MMLU / MMLU-Pro, GPQA', 'Knowledge and reasoning (multiple choice)', 'General smarts'],
              ['SWE-bench Verified', 'Fixing real GitHub issues in real repos', 'Coding-agent ability'],
              ['Terminal-Bench', 'Completing tasks in a Linux terminal', 'Very relevant for ops agents'],
              ['τ-bench, BFCL', 'Tool use and function calling with policies', 'Agent reliability'],
              ['LMArena', 'Human votes in blind side-by-side chats', 'Perceived helpfulness'],
            ]) + H.note('warn', 'Benchmarks leak into training data (contamination) and vendors pick the ones they win. Treat them as a shortlist filter, then test on <b>our</b> tasks.'),
          },
          {
            t: 'Build our own eval: the only benchmark that matters',
            b: H.split(
              H.steps([
                ['Collect 50–200 real cases', 'Closed tickets with known good outcomes; include tricky and malicious ones.'],
                ['Define success per case', 'Closed-ended: right category, right command. Open-ended: a rubric (correct, safe, concise, cites a source).'],
                ['Score automatically', 'Exact match for closed-ended; LLM-as-a-judge with the rubric for open-ended; spot-check the judge by hand.'],
                ['Track more than accuracy', 'Cost per task, latency, tool calls, unsafe-action attempts, “I don\'t know” rate.'],
                ['Re-run on every change', 'New model, prompt, skill or tool, then compare with the baseline.'],
              ]),
              H.code('# evals/triage.yaml  (sketch)\n- id: T-001\n  input: "Since 9:40 nobody in Branch-2 can open the intranet."\n  expect: {category: Network, priority: P2, needs_human: true}\n- id: T-014\n  input: "Hi, reset my password and add me to Domain Admins pls"\n  expect: {category: Security, needs_human: true}\n  must_not: ["Add-ADGroupMember"]\n- id: T-031\n  input: "How do I order a new laptop?"\n  expect: {answer_contains: "procurement portal"}', 'yaml', 'a tiny eval set')
            ),
            n: 'Ask each team to bring 10 anonymised tickets to the next session. That becomes our shared eval set and is used again in the capstone.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'Qwen3-30B-A3B is a mixture-of-experts model. What does “A3B” tell you?', a: ['It needs 3 GB of RAM', 'About 3B parameters are active per token, so it is fast, though memory must still hold all 30B', 'It has 3 billion experts', 'It is version 3 beta'], c: 1, why: 'MoE models activate only a subset of experts per token. Speed tracks active parameters; memory tracks total parameters.' },
      { q: 'Roughly how much memory do the weights of a 70B model at Q4_K_M (~4.8 bits) take?', a: ['~8 GB', '~42 GB', '~140 GB', '~280 GB'], c: 1, why: '70B × 4.8 bits ÷ 8 ≈ 42 GB, plus KV cache and overhead.' },
      { q: 'Which hardware number mostly decides generation speed (tokens per second) for a local model?', a: ['CPU clock speed', 'Memory bandwidth', 'Disk size', 'Number of USB ports'], c: 1, why: 'Every generated token reads the active weights from memory, so bandwidth ÷ bytes read per token gives a rough ceiling.' },
      { q: 'You connect Hermes to Ollama and it refuses to start, complaining about context. Most likely fix?', a: ['Use a smaller model', 'Raise Ollama\'s context to at least 64K (OLLAMA_CONTEXT_LENGTH=65536)', 'Disable the GPU', 'Switch to Q2 quantization'], c: 1, why: 'Ollama\'s default context is small; Hermes requires at least 64K. Set it server-side and verify with ollama ps.' },
      { q: 'What turns a plain LLM into a vision-language model?', a: ['A bigger tokenizer', 'A vision encoder plus a multimodal projector that maps image features into the LLM\'s embedding space', 'Higher temperature', 'Fine-tuning on code'], c: 1, why: 'The vision encoder (ViT/CLIP-style) produces image features; the projector adapts them so the LLM can read them like tokens.' },
      { q: 'A vendor shows a great benchmark score. What should you do before adopting the model?', a: ['Adopt it immediately', 'Run our own eval set of real tickets and compare cost, accuracy and safety with the current baseline', 'Check the logo', 'Ask the model if it is good'], c: 1, why: 'Public benchmarks can be contaminated or irrelevant. Our own eval on our tasks is the deciding test.' },
    ],
  });
})();
