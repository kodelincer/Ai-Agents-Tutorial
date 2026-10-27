/* Registry of interface screenshots and images used in the lessons.
   H.shot('<id>', 'caption') draws one; the Image credits page lists them all.
   `src` names where the picture comes from: a project's own repository (its licence is shown),
   or a capture of the real tool made for this course (`cap`: the version that was captured).
   Images live in assets/img/shots and are inlined as data: URIs by tools/build_single.py. */
(function () {
  const A = window.ACADEMY;
  const repo = (name, url, license) => ({ name, url, license });
  A.shots = {
    'claude-first-run': { img: 'assets/img/shots/claude-first-run.webp', alt: 'Claude Code first-run screen asking you to choose a text style', w: 1100, src: { name: 'Claude Code', url: 'https://code.claude.com/docs/en/quickstart', cap: '2.1.310', license: '© Anthropic' } },
    'codex-first-run': { img: 'assets/img/shots/codex-first-run.webp', alt: 'Codex first-run screen with the sign-in choices', w: 1100, src: { name: 'Codex CLI', url: 'https://github.com/openai/codex', cap: '0.164.0', license: 'Apache-2.0' } },
    'codex-session': { img: 'assets/img/shots/codex-session.webp', alt: 'A Codex session making a plan and exploring a repository', w: 1200, src: repo('openai/codex', 'https://github.com/openai/codex', 'Apache-2.0') },
    'opencode-home': { img: 'assets/img/shots/opencode-home.webp', alt: 'The OpenCode start screen with its prompt box and the /connect tip', w: 1100, src: { name: 'OpenCode', url: 'https://github.com/anomalyco/opencode', cap: '1.19.4', license: 'MIT' } },
    'opencode-session': { img: 'assets/img/shots/opencode-session.webp', alt: 'An OpenCode session searching a codebase, with the build agent and token cost shown', w: 1100, src: repo('anomalyco/opencode', 'https://github.com/anomalyco/opencode', 'MIT') },
    'opencode-vscode': { img: 'assets/img/shots/opencode-vscode.webp', alt: 'OpenCode running in a terminal pane inside VS Code next to the file it is editing', w: 1400, src: repo('anomalyco/opencode', 'https://github.com/anomalyco/opencode', 'MIT') },
    'opencode-github': { img: 'assets/img/shots/opencode-github.webp', alt: 'A GitHub pull request opened and explained by the OpenCode bot', w: 1400, src: repo('anomalyco/opencode', 'https://github.com/anomalyco/opencode', 'MIT') },
    'codewhale-tui': { img: 'assets/img/shots/codewhale-tui.webp', alt: 'Codewhale terminal interface showing a checklist, a result and the Full Access mode', w: 1000, src: repo('codewhale-hq/CodeWhale', 'https://github.com/codewhale-hq/CodeWhale', 'MIT') },
    'hermes-banner': { img: 'assets/img/shots/hermes-banner.webp', alt: 'Hermes Agent banner', w: 1145, src: repo('NousResearch/hermes-agent', 'https://github.com/NousResearch/hermes-agent', 'MIT') },
    'multica-board': { img: 'assets/img/shots/multica-board.webp', alt: 'The Multica issue board with agents working on tickets', w: 1600, src: repo('multica-ai/multica', 'https://github.com/multica-ai/multica', 'Apache-2.0'), edit: 'One agent label was blurred to keep to the scope of this course.' },
    'orca-hero': { img: 'assets/img/shots/orca-hero.webp', alt: 'Orca showing Claude Code and Codex side by side in separate worktrees, with its phone app', w: 1500, src: repo('stablyai/orca', 'https://github.com/stablyai/orca', 'MIT') },
    'orca-mobile': { img: 'assets/img/shots/orca-mobile.webp', alt: 'Orca\'s companion app on a phone', w: 960, src: repo('stablyai/orca', 'https://github.com/stablyai/orca', 'MIT') },
    'orca-split': { img: 'assets/img/shots/orca-split.webp', alt: 'An Orca workspace with an editor tab and a browser tab split side by side', w: 960, src: repo('stablyai/orca', 'https://github.com/stablyai/orca', 'MIT') },
    '9router-providers': { img: 'assets/img/shots/9router-providers.webp', alt: '9router dashboard listing OAuth, free and API-key providers', w: 1200, src: repo('decolua/9router', 'https://github.com/decolua/9router', 'MIT') },
    'omniroute-providers': { img: 'assets/img/shots/omniroute-providers.webp', alt: 'OmniRoute dashboard with free-tier providers, API-key providers and filters', w: 1279, src: repo('diegosouzapw/OmniRoute', 'https://github.com/diegosouzapw/OmniRoute', 'MIT') },
    'site-claude-code': { img: 'assets/img/shots/site-claude-code.webp', alt: 'The Claude Code product page, showing the desktop app and the other ways to use it', w: 1280, src: { name: 'claude.com/product/claude-code', url: 'https://claude.com/product/claude-code', date: '2026-10-27', license: '© Anthropic' } },
    'site-claude-download': { img: 'assets/img/shots/site-claude-download.webp', alt: 'The Claude download page with the desktop and mobile apps', w: 1280, src: { name: 'claude.com/download', url: 'https://claude.com/download', date: '2026-10-27', license: '© Anthropic' } },
    'site-claude-docs': { img: 'assets/img/shots/site-claude-docs.webp', alt: 'The Claude Code documentation home page', w: 1280, src: { name: 'code.claude.com/docs', url: 'https://code.claude.com/docs/en/overview', date: '2026-10-27', license: '© Anthropic' } },
    'site-opencode': { img: 'assets/img/shots/site-opencode.webp', alt: 'The OpenCode home page', w: 1280, src: { name: 'opencode.ai', url: 'https://opencode.ai', date: '2026-10-27', license: '© OpenCode' } },
    'site-opencode-download': { img: 'assets/img/shots/site-opencode-download.webp', alt: 'The OpenCode download page with the terminal and desktop installs', w: 1280, src: { name: 'opencode.ai/download', url: 'https://opencode.ai/download', date: '2026-10-27', license: '© OpenCode' } },
    'site-openrouter': { img: 'assets/img/shots/site-openrouter.webp', alt: 'The OpenRouter home page', w: 1280, src: { name: 'openrouter.ai', url: 'https://openrouter.ai', date: '2026-10-27', license: '© OpenRouter' } },
    'site-openrouter-models': { img: 'assets/img/shots/site-openrouter-models.webp', alt: 'The OpenRouter model list, where free models are marked', w: 1280, src: { name: 'openrouter.ai/models', url: 'https://openrouter.ai/models', date: '2026-10-27', license: '© OpenRouter' } },
    'site-openrouter-docs': { img: 'assets/img/shots/site-openrouter-docs.webp', alt: 'The OpenRouter quickstart in its documentation', w: 1280, src: { name: 'openrouter.ai/docs', url: 'https://openrouter.ai/docs/quickstart', date: '2026-10-27', license: '© OpenRouter' } },
    'site-ollama': { img: 'assets/img/shots/site-ollama.webp', alt: 'The Ollama home page', w: 1280, src: { name: 'ollama.com', url: 'https://ollama.com', date: '2026-10-27', license: '© Ollama' } },
    'site-ollama-library': { img: 'assets/img/shots/site-ollama-library.webp', alt: 'The Ollama model library', w: 1280, src: { name: 'ollama.com/library', url: 'https://ollama.com/library', date: '2026-10-27', license: '© Ollama' } },
    'site-lmstudio': { img: 'assets/img/shots/site-lmstudio.webp', alt: 'The LM Studio home page', w: 1280, src: { name: 'lmstudio.ai', url: 'https://lmstudio.ai', date: '2026-10-27', license: '© LM Studio' } },
    'site-huggingface': { img: 'assets/img/shots/site-huggingface.webp', alt: 'The Hugging Face home page', w: 1280, src: { name: 'huggingface.co', url: 'https://huggingface.co', date: '2026-10-27', license: '© Hugging Face' } },
    'site-huggingface-models': { img: 'assets/img/shots/site-huggingface-models.webp', alt: 'The Hugging Face model list', w: 1280, src: { name: 'huggingface.co/models', url: 'https://huggingface.co/models', date: '2026-10-27', license: '© Hugging Face' } },
    'site-openwebui-docs': { img: 'assets/img/shots/site-openwebui-docs.webp', alt: 'The Open WebUI documentation home page', w: 1280, src: { name: 'docs.openwebui.com', url: 'https://docs.openwebui.com', date: '2026-10-27', license: '© Open WebUI' } },
    'site-mcp': { img: 'assets/img/shots/site-mcp.webp', alt: 'The Model Context Protocol home page', w: 1280, src: { name: 'modelcontextprotocol.io', url: 'https://modelcontextprotocol.io', date: '2026-10-27', license: '© Model Context Protocol' } },
  };
})();
