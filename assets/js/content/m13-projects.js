(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm13', num: 13, title: 'Projects, capstone and roadmap',
    summary: 'Agentic projects for our organisation, a capstone that builds a human-in-the-loop helpdesk agent, the adoption roadmap, and a closing look at machine vs human intelligence.',
    deck: [42, 52, 53],
    outcomes: ['Pick and scope a first agent project with clear success metrics', 'Build and demo a human-in-the-loop helpdesk triage agent with Hermes', 'Explain the crawl-walk-run roadmap and how we measure value', 'Discuss the limits of machine intelligence with colleagues and management'],
    lessons: [
      {
        id: 'm13-1', title: 'Agentic projects for our organisation', mins: 20, deck: [53, 52],
        slides: [
          {
            t: 'Project portfolio',
            b: H.table(['Project', 'What it does', 'Autonomy', 'First step'], [
              ['HL automated helpdesk', 'Triages tickets, answers known issues from the KB, gathers diagnostics, drafts replies; humans approve fixes', 'L1–L2', 'Read-only triage on one queue'],
              ['Fully automated helpdesk & IT orchestrator', 'Orchestrator routes work to specialist agents end-to-end for proven runbooks', 'L2–L3', 'Only after the HL helpdesk has months of good evals'],
              ['Network & security HL agents', 'Reachability triage, config diffing, phishing triage, alert enrichment; changes drafted for approval', 'L1–L2', 'Read-only probes + SIEM read access'],
              ['Research assistant', 'Reads vendor advisories, CVEs and release notes; summarises impact on our estate', 'L0–L1', 'Weekly CVE digest via cron'],
              ['Document organiser', 'Vision + embedding models classify and index scanned contracts, municipal integration docs and archives', 'L1', 'Pilot on one archive folder'],
              ['Coding-agent contracts', 'Coding agents for scripts and IaC, with TDD and periodic security reports', 'L1', 'One repo, one team'],
            ]),
          },
          {
            t: 'How to choose the first one',
            b: H.split(
              H.fig(D.quad('Risk if the agent gets it wrong', 'Volume × time saved', [
                { t: 'Ticket triage (read-only)', x: 0.15, y: 0.85, c: 'tl' },
                { t: 'CVE digest', x: 0.1, y: 0.45, c: 'tl' },
                { t: 'Account unlocks', x: 0.45, y: 0.75 },
                { t: 'Disk hygiene reports', x: 0.2, y: 0.55, c: 'tl' },
                { t: 'Firewall changes', x: 0.88, y: 0.4 },
                { t: 'Auto-patching prod', x: 0.92, y: 0.7 },
              ], ['quick wins', 'later, with strong controls', 'nice to have', 'avoid'])),
              H.note('key', 'Start top-left: high volume, low risk, read-only. Prove value and safety there, then move right one step at a time.')
            ),
          },
        ],
      },
      {
        id: 'm13-2', title: 'Capstone: a human-in-the-loop helpdesk agent', mins: 120, lab: true,
        slides: [
          {
            t: 'The brief',
            b: H.split(
              H.prose(
                '<b>Goal:</b> a Hermes agent that watches a lab ticket queue, triages each new ticket, gathers read-only diagnostics, drafts a reply and a work note, and asks a human before any change.',
                '<b>Team size:</b> 2–3 engineers, mixed helpdesk / network / datacenter.',
                '<b>Time:</b> two sessions of about two hours, plus a 10-minute demo.',
                'Network, datacenter, web and security groups may instead extend their <a href="#m12-7">Module 12 playbook</a> into the capstone. Keep the same rubric and the injection test.'
              ),
              H.fig(D.flow([
                { t: 'Lab ticket', s: 'tickets.csv / ITSM' },
                { t: 'Triage', s: 'skill + JSON output', c: 'tl' },
                { t: 'Diagnose', s: 'read-only tools', c: 'tl' },
                { t: 'Approve?', s: 'human in Slack', c: 'acc' },
                { t: 'Note + KB', s: 'work note, skill', c: 'ok' },
              ]))
            ),
          },
          {
            t: 'Build steps',
            b: H.steps([
              ['Environment', 'Lab VM, Hermes installed, Docker backend, approvals smart, Blank Slate + needed toolsets (Labs 1–4).'],
              ['Persona', 'SOUL.md for “Atlas, ACME IT triage” and an AGENTS.md describing the lab (Lab 6).'],
              ['Data access', 'The <code>itsm_lab</code> MCP server from Lab 7, extended with <code>add_work_note</code> (writes to a local file).'],
              ['Skills', 'One triage skill (JSON output: category, priority, summary, reply, needs_human) and one diagnosis skill from your team\'s runbook (Lab 5).'],
              ['Automation', 'A cron job every 15 minutes: “Triage new tickets in the lab queue” (Lab 8).'],
              ['Human loop', 'Gateway to a private Slack/Teams channel with an allowlist; approvals arrive there (Lab 9).'],
              ['Evaluate', 'Run your 10–20 anonymised tickets through it. Record accuracy, wrong-category cases, unsafe attempts, cost.'],
              ['Harden', 'Complete the Lab 10 checklist.'],
            ]),
          },
          {
            t: 'Deliverables and rubric',
            b: H.split(
              H.list(['Working demo on two tickets: one auto-answered, one needing approval', 'The SOUL.md, AGENTS.md, skills and config.yaml (secrets removed) in the team git repo', 'Eval results table and a short cost estimate per 1,000 tickets', 'Completed hardening checklist with a named owner']),
              H.table(['Criterion', 'Weight'], [
                ['Correct triage on the eval set', '25%'],
                ['Safety: no unapproved changes, injection test case handled', '25%'],
                ['Quality of skills (procedure, pitfalls, verification)', '20%'],
                ['Evidence in work notes', '15%'],
                ['Demo and documentation', '15%'],
              ])
            ),
            n: 'Include one malicious ticket in every team\'s eval set (from Module 11). Handling it safely is a pass/fail item.',
          },
        ],
      },
      {
        id: 'm13-3', title: 'Adoption roadmap and measuring value', mins: 15,
        slides: [
          {
            t: 'Crawl, walk, run',
            b: H.fig(D.columns([
              { h: 'Crawl · 0–3 months', items: ['This course for all teams', 'Lab VMs + sandbox', 'Read-only triage + reports', 'Eval set of real tickets', 'Agent registry started'] },
              { h: 'Walk · 3–9 months', c: 'tl', items: ['MCP servers for ITSM, AD, monitoring', 'L1–L2 agents in one queue', 'Approvals in Slack/Teams', 'Skills repo with review', 'Cost and quality dashboard'] },
              { h: 'Run · 9+ months', c: 'acc', items: ['Agent team with kanban', 'L3 runbooks on schedule', 'On-prem model for sensitive data', 'Agents in change process', 'Quarterly agent access review'] },
            ], { bh: 36 })),
          },
          {
            t: 'Metrics that matter',
            b: H.table(['Metric', 'Why'], [
              ['Mean time to triage / to resolve', 'The headline value for users'],
              ['% tickets handled without human edits', 'True automation rate'],
              ['Agent accuracy on the eval set', 'Quality over time, per model or prompt change'],
              ['Unsafe-action attempts blocked', 'Are the guardrails being tested and holding?'],
              ['Cost per ticket (tokens + hardware)', 'Compare with engineer time saved'],
              ['Engineer satisfaction', 'Agents should remove drudgery, not add review burden'],
            ]),
          },
        ],
      },
      {
        id: 'm13-4', title: 'Philosophy: machine inference vs human intelligence', mins: 15, deck: [42],
        slides: [
          {
            t: 'What these systems are, and are not',
            b: H.split(
              H.table(['', 'Machine inference (today\'s LLMs)', 'Human intelligence', 'Human-level intelligence (AGI)'], [
                ['Learns from', 'Massive text, frozen after training', 'Few examples, continuously, from the world', 'A goal, not yet a reality'],
                ['Strength', 'Breadth, speed, tirelessness, language', 'Judgement, grounding, accountability', 'Would match humans across most tasks'],
                ['Weakness', 'No real-world grounding; confident errors', 'Slow, gets tired, limited memory', 'Timelines and definitions are debated'],
              ]),
              H.prose(
                'Today\'s agents are powerful <b>inference machines</b>: they predict and plan remarkably well within the context we give them. They do not carry responsibility.',
                'Our job is to combine both: let machines do the breadth and the legwork, keep humans for judgement and accountability, and keep learning as the technology moves.',
                H.quote('With great power comes great responsibility.', 'Deck slide 40')
              )
            ),
            n: 'Close with an open discussion. Ask what people now see differently about their daily work, and collect ideas for the next round of projects.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'Which is the best first agent project?', a: ['Auto-patching production servers', 'Read-only ticket triage on one queue', 'Autonomous firewall changes', 'Replacing the service desk'], c: 1, why: 'High volume, low risk, read-only: it proves value and safety before anything riskier.' },
      { q: 'Which capstone item is pass/fail?', a: ['A pretty demo', 'Handling the malicious (prompt-injection) ticket safely', 'Using the largest model', 'Finishing first'], c: 1, why: 'Safety is not optional. Every team\'s eval set includes an injection case.' },
      { q: 'Which metric best shows true automation value?', a: ['Number of agents', 'Percentage of tickets handled without human edits, alongside accuracy and safety', 'Tokens used', 'Model size'], c: 1, why: 'Measure outcomes (time, quality, safety, cost), not activity.' },
    ],
  });
})();
