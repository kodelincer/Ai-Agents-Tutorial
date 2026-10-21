(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm10', num: 10, title: 'Multi-agent teams and delegation',
    summary: 'Why and when to split work across agents, how to delegate well, how to build a persistent team with Hermes profiles and a kanban board, and where humans fit.',
    deck: [50, 53],
    outcomes: ['Choose a multi-agent pattern for an IT workflow', 'Write a delegation brief a subagent can act on', 'Build a team of Hermes profiles coordinated through kanban', 'Design human-in-the-loop checkpoints and responsibilities'],
    lessons: [
      {
        id: 'm10-1', title: 'Why agents work in teams', mins: 15,
        slides: [
          {
            t: 'Reasons to split the work',
            b: H.split(
              H.cards([
                ['Focus', 'Each agent gets a short prompt, few tools and one job, so it makes fewer mistakes.', 'specialists'],
                ['Context isolation', 'A noisy investigation runs in a child agent; only its summary returns to the parent.', 'clean context'],
                ['Parallelism', 'Check five branch offices at once instead of one after another.', 'speed'],
                ['Least privilege', 'The security agent can read the SIEM; the network agent can reach the jump host; neither can do both.', 'safety'],
              ], 2),
              H.note('warn', 'Teams cost more tokens and add coordination failures. Do not build a team where a single agent with good skills would do. Start with one agent; split when it is overloaded or needs different permissions.', 'But…')
            ),
          },
          {
            t: 'Team patterns',
            b: H.table(['Pattern', 'Shape', 'IT example'], [
              ['Orchestrator–workers', 'A lead plans and delegates; workers report back', 'Major incident: lead coordinates network, server and comms agents'],
              ['Pipeline', 'Each agent hands its output to the next', 'Triage → diagnose → fix → document'],
              ['Reviewer / critic', 'One produces, another checks against policy', 'Agent drafts a firewall change; a policy agent reviews it before a human sees it'],
              ['Parallel fan-out', 'The same task across many targets', 'Patch-compliance check on 40 servers'],
              ['Mixture of agents', 'Several models answer; one synthesises', 'Hard root-cause analysis (Hermes: <code>hermes moa</code>)'],
            ]),
          },
        ],
      },
      {
        id: 'm10-2', title: 'Delegation with subagents', mins: 20,
        slides: [
          {
            t: 'delegate_task in Hermes',
            b: H.split(
              H.code('# one task\ndelegate_task(\n    goal="Find why BK-NIGHTLY failed on 2026-10-20",\n    context="bkp-01, logs in /var/log/bk/nightly.log, NFS target nas-02:/backup. Read-only."\n)\n\n# parallel batch (up to 10 by default)\ndelegate_task(tasks=[\n    {"goal": "Check VPN tunnel status for Branch-1", "context": "..."},\n    {"goal": "Check VPN tunnel status for Branch-2", "context": "..."},\n    {"goal": "Check VPN tunnel status for Branch-3", "context": "..."},\n])', 'python', 'what the agent calls'),
              H.prose(
                'The agent calls <code>delegate_task</code> itself when work splits naturally. You can also ask: <i>“Use subagents to check all three branch tunnels in parallel.”</i>',
                'Each child gets a <b>fresh conversation</b>, the parent\'s tools and its own terminal session. Only its final summary enters the parent\'s context.',
                'With <code>output_schema</code>, the child must return JSON that matches a schema, so the parent can merge results reliably.'
              )
            ),
          },
          {
            t: 'Subagents know nothing: write a real brief',
            b: H.stack(
              H.note('crit', 'A subagent starts with <b>zero knowledge</b> of the parent conversation. “Fix the error” means nothing to it. Everything it needs must be in <code>goal</code> and <code>context</code>, just like a ticket handed to another team.', 'The #1 delegation mistake'),
              H.widget('builder', { preset: 'delegate' })
            ),
            n: 'Untick Context and look at the generated call. Ask the room: would you accept a ticket like that from another team? This is the same skill as writing a good escalation.',
          },
        ],
      },
      {
        id: 'm10-3', title: 'A persistent team: profiles and kanban', mins: 30, lab: true,
        slides: [
          {
            t: 'Profiles: one home per agent',
            b: H.split(
              H.code('hermes profile create network --description "Diagnoses reachability, VPN and Wi-Fi issues with read-only probes"\nnetwork setup          # its own model, keys, toolsets\nnetwork chat           # talk to it directly\nnetwork gateway start  # its own bot in Slack/Teams\n\nhermes profile list', 'bash', 'profiles'),
              H.prose(
                'A <b>profile</b> is a separate Hermes home: its own <code>config.yaml</code>, <code>.env</code>, <code>SOUL.md</code>, memory, skills, sessions and cron jobs. Creating one also creates a command with its name.',
                'Give every agent its own profile. Never point two agent processes at the same home, because their memories would merge.',
                'The <code>--description</code> tells an orchestrator what this agent is good at.'
              )
            ),
          },
          {
            t: 'Kanban: the team\'s shared ticket board',
            b: H.split(
              H.fig(D.flow([
                { t: 'triage', s: 'new work' },
                { t: 'todo', s: 'specified' },
                { t: 'ready', s: 'deps done' },
                { t: 'running', s: 'worker claims', c: 'acc' },
                { t: 'review', s: 'reviewer / human', c: 'tl' },
                { t: 'done', c: 'ok' },
              ])),
              H.code('hermes kanban boards create it-ops --name "IT Ops" --switch\nhermes kanban create "INC-20931 Branch-2 intranet down" \\\n  --assignee network --priority 1 --skill network-triage\nhermes kanban link <parent-id> <child-id>   # dependencies\nhermes kanban list\nhermes kanban show <id>\nhermes kanban tail <id>                    # follow events\nhermes kanban block <id> "need L2 approval for tunnel restart"', 'bash', 'kanban')
            ) + H.note('it', 'This works like our ITSM queues: tasks have assignees, dependencies, comments and a review step. The gateway\'s dispatcher hands ready tasks to the assigned profile; workers use <code>kanban_*</code> tools to comment, complete, block or request review.'),
          },
          {
            t: 'Design your team',
            b: H.widget('teamDesigner'),
            n: 'Untick the Network engineer and route the Branch-2 ticket: the path shows a gap that falls back to humans. Good discussion of which roles we would build first.',
          },
        ],
      },
      {
        id: 'm10-4', title: 'Humans in the loop', mins: 15,
        slides: [
          {
            t: 'Where people stay in charge',
            b: H.split(
              H.table(['Checkpoint', 'Human role'], [
                ['Before risky actions', 'Approve or deny (gateway <code>/approve</code>, <code>/deny</code>)'],
                ['Before production changes', 'Normal CAB / change process; the agent drafts the CR'],
                ['Review column on the board', 'Spot-check agent work; send it back with comments'],
                ['New or changed skills', 'Review agent-written skills before they are used (<code>skills.write_approval</code>)'],
                ['Weekly', 'Read the eval scores, cost report and a sample of transcripts'],
              ]),
              H.table(['Activity', 'Agent', 'Engineer', 'Team lead'], [
                ['Diagnose a ticket', 'R', 'A', 'I'],
                ['Restart a production service', 'R (proposes)', 'A (approves)', 'I'],
                ['Change a firewall rule', 'C (drafts CR)', 'R', 'A (CAB)'],
                ['Write a new skill', 'R', 'A (reviews)', 'I'],
                ['Grant agent new permissions', '—', 'R', 'A'],
              ])
            ) + H.note('key', 'R = responsible, A = accountable, C = consulted, I = informed. An agent can be responsible for doing work, but a <b>named human is always accountable</b>.'),
          },
        ],
      },
    ],
    quiz: [
      { q: 'When should you split one agent into a team?', a: ['Always, more agents means better results', 'When one agent is overloaded with tools or context, or parts of the work need different permissions', 'Only for coding', 'Never'], c: 1, why: 'Teams add cost and coordination. Split for focus, context isolation, parallelism or least privilege.' },
      { q: 'What does a Hermes subagent know when it starts?', a: ['The full parent conversation', 'Only what is in goal and context (plus project context files)', 'Everything in MEMORY.md of all profiles', 'The user\'s password'], c: 1, why: 'Subagents start fresh. The parent must pass everything needed in the brief.' },
      { q: 'Why should two agents never share one Hermes profile?', a: ['It is slower', 'They write memory automatically and would pollute each other\'s state', 'Licensing', 'It is not possible'], c: 1, why: 'Each profile has its own memory and sessions. Separate agents need separate profiles.' },
      { q: 'In the RACI for “restart a production service”, who is accountable?', a: ['The agent', 'The approving engineer', 'The model vendor', 'Nobody'], c: 1, why: 'The agent may propose and perform, but a named human approves and is accountable.' },
    ],
  });
})();
