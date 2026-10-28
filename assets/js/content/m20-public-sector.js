(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm20', num: 20, title: 'Agents in government and public organisations',
    summary: 'Why public organisations look at agents that work around the clock, how to find out what the organisation really does for people before automating anything, how to migrate little by little under an automation policy, the standards and laws that matter in 2026, and creative patterns that stay safe.',
    outcomes: [
      'Explain the real benefits of agents for a public organisation, including safe night-time work, and their limits',
      'Build a service catalogue and break services into tasks that can be scored',
      'Choose a first wave of tasks and set how much autonomy each may have',
      'Write a one-page automation policy and a migration roadmap with gates',
      'Name the main standards, frameworks and laws (NIST, ISO/IEC 42001, EU AI Act, OWASP and others) and use them as a checklist',
      'Pick safe, creative patterns, and run a workshop that ends with a pilot plan',
    ],
    lessons: [
      {
        id: 'm20-1', title: 'Why public organisations look at agents that work around the clock', mins: 25,
        slides: [
          {
            t: 'The queue does not sleep: a night in a public office',
            b: H.fig(D.flow([
              { t: '17:30 Hand over', s: 'staff leave; rules and queue are set', c: 'tl' },
              { t: '20:00 Triage', s: 'new requests classified and checked', c: 'acc' },
              { t: '02:00 Night watch', s: 'alerts and failed jobs checked', c: 'acc' },
              { t: '06:30 Morning brief', s: 'a short list for people', c: 'tl' },
              { t: '08:30 People decide', s: 'approve, edit or reject', c: 'ok' },
            ], { h: 104 }), 'Overnight the agent prepares. In the morning people decide.') +
              H.prose(
                'A person writes to the office at 23:10 about a permit. A server job fails at 02:00. A report arrives at 05:00 that someone must read before the 09:00 meeting.',
                'An agent can work <b>through the night</b>: sort the requests, check them against the rules, draft replies, watch the systems, and leave a clear list for the morning. You can go home and sleep.'
              ) + H.note('key', 'The safe version of “works 24/7” is <b>prepare at night, decide in the morning</b>. The agent does reading, checking and drafting; people keep decisions that affect rights, money and safety.'),
            n: 'Open with the picture and ask who has been woken at night by a failed job or a flood of messages. Then place the line between preparing and deciding: this line is the whole module. The agent is a night shift that hands over a tidy desk, not a night manager.',
          },
          {
            t: 'Where the benefit really comes from',
            b: H.table(['Benefit', 'In a public organisation', 'Watch out'], [
              ['<b>Always available</b>', 'People can ask what a form needs or where an application stands at any hour, and get a first useful answer', 'Say clearly it is an AI, and give a way to reach a person'],
              ['<b>Backlogs shrink</b>', 'Checking each file for missing documents or sorting requests by urgency happens overnight', 'Measure on real cases; most published figures come from vendors'],
              ['<b>Same checklist every time</b>', 'Every file is checked against the same rules, not by who is on shift', 'Consistent is not the same as correct: test the checklist'],
              ['<b>Staff time returns</b>', 'Less time copying, summarising and drafting; more for the person who needs help', 'Plan the freed time, or it disappears into more work'],
              ['<b>More languages, plainer words</b>', 'Notices rewritten in simple language and other languages for the people who need them', 'A person checks important texts before they go out'],
              ['<b>Better records</b>', 'Every step logged: what was read, what was suggested, who approved', 'Logs hold personal data: protect and limit them'],
            ]) + H.note('warn', 'We do not promise savings. Show the benefit with <b>your own numbers</b> from a small pilot, measured against how the work is done today.'),
            n: 'Take the right-hand column as seriously as the middle one. Public organisations carry public trust, so promising a number before measuring one is the usual way a pilot loses credibility. Ask which benefit the class would try to measure first, and how.',
          },
          {
            t: 'A script, a chatbot and an agent are not the same tool',
            b: H.fig(D.columns([
              { h: 'Script or RPA', c: 'tl', items: ['Same steps every time', 'Fast and cheap', 'Breaks when a form changes', 'Cannot read a messy letter'] },
              { h: 'Chatbot', c: 'ink', items: ['Answers questions', 'Reads our documents', 'Does not act on systems', 'Needs a person for the rest'] },
              { h: 'Agent', c: 'acc', items: ['Plans the steps', 'Uses tools and systems', 'Copes with variation', 'Needs limits and approvals'] },
            ], { bh: 40 }), 'Choose the simplest tool that works. Use an agent where the work varies and a script cannot cope.') +
              H.note('tip', 'If a fixed script solves the task, keep the script: it is cheaper, faster and easier to audit. Use an agent for the part that needs <b>reading, judgement of format, or a few steps that change</b>.'),
            n: 'This is the honest slide: many tasks need a script, not an agent. Ask for one task in their office that is a script and one that needs an agent. The Module 7 loop and tools lessons explain what the agent adds.',
          },
          {
            t: 'Working at night, safely: seven rules',
            b: H.steps([
              ['Read-only by default', 'At night the agent looks, checks and drafts. It does not change records, send decisions or move money.'],
              ['A queue and a morning approval', 'Everything it prepares waits for a named person. Urgent items go to the on-call person by a defined route.'],
              ['A budget and a time box', 'A spending cap on the model key and a run limit, so a loop cannot run all night.'],
              ['A kill switch', 'One documented way to stop it, tested, that anyone on duty can use.'],
              ['Alerts when it fails', 'A failed night run tells a person. Silence is not success.'],
              ['Logs a person can read', 'What it read, what it did, what it suggested, and which rules applied.'],
              ['A written runbook', 'What it may do, what it may never do, who to call. Part of the automation policy (lesson 3).'],
            ]) + H.code('# a nightly job, as a schedule (Hermes cron; the same idea works with\n# claude -p, codex exec, opencode run in CI, or a scheduled task)\nschedule: "0 2 * * *"\nprompt:   "Read the overnight alert export. Group by service. For each group\n           write cause, evidence and a suggested next step. Do not change anything."\ntools:    read-only\nbudget:   "stop after 20 minutes or 2 USD"\noutput:   "morning-brief.md, then notify the on-call person"', 'text', 'Night-shift job (sketch)'),
            n: 'These seven rules turn “runs while you sleep” into something a security officer can accept. Tie them to the course: Hermes cron and approvals (Module 9), headless runs and CI (Module 8), the T0 to T3 tiers (Module 12), and the always-on products in the ecosystem module. The sketch is deliberately not tied to one tool.',
          },
          {
            t: 'Trust is the scarce resource',
            b: H.table(['What people tell surveys and what they need', 'What we do about it'], [
              ['In the OECD Trust Survey, fewer than four in ten people were confident that government use of AI would treat them fairly, be transparent or keep humans in charge of critical decisions', 'Say when AI is used, keep a human in charge of decisions, and publish a short record of each system'],
              ['“Am I talking to a machine?”', 'Always disclose. In the EU the chatbot-disclosure duty of the AI Act applies from August 2026'],
              ['“Can I reach a person?”', 'A visible route to a human at every step, with a service-level promise'],
              ['“Why did this happen?”', 'Give the reason in plain words and the facts used; keep the case file'],
              ['“It is wrong. How do I fix it?”', 'A simple way to challenge, with a person who can change the outcome'],
            ]) + H.note('it', 'Automation succeeds in public service when it makes the service <b>faster and more understandable</b> for the person, and fails when it only makes it cheaper for the office.'),
            n: 'The survey figure is from the OECD material on governing with agentic AI (see the standards lesson). The disclosure rule is Article 50 of the EU AI Act, which sources report as still applying from 2 August 2026; confirm the date for your jurisdiction. Ask students which of the five questions their own service answers badly today.',
          },
        ],
      },
      {
        id: 'm20-2', title: 'Know your processes first: from services to scored tasks', mins: 30, lab: true,
        slides: [
          {
            t: 'Start with what the organisation does for people, not with a tool',
            b: H.fig(D.nested([
              { t: 'Mission', s: 'why we exist' },
              { t: 'Services', s: 'permits, benefits, certificates, complaints, information' },
              { t: 'Processes', s: 'the steps behind each service' },
              { t: 'Tasks', s: 'read, check, draft, decide, notify' },
              { t: 'One task an agent could do', s: 'check an application for missing documents' },
            ]), 'Work from the outside in. Automate at the level of tasks.') +
              H.note('key', 'Do not ask “where can we use AI?”. Ask <b>“what do we do for people, and which small tasks inside it are slow, repetitive or hard to staff at night?”</b> Tools come after the answer.'),
            n: 'The nested picture is the whole method: services, then processes, then tasks. Agents work well at the task level. Ask the room to name three services of their own organisation and put them on the first ring before anyone mentions a product.',
          },
          {
            t: 'Map each service on one page',
            b: H.table(['Field', 'What to write', 'Example: residential parking permit'], [
              ['Who asks, and how', 'The person, the channel, the trigger', 'Resident; web form, email, counter'],
              ['Inputs', 'Documents and data needed', 'Proof of address, vehicle registration, ID'],
              ['Steps', 'What happens, in order, and who does each', 'Check documents, check address, calculate fee, approve, issue'],
              ['Systems', 'Where the data lives', 'Registry, payment system, case system'],
              ['Data classes', 'Personal, sensitive, public', 'Personal (name, address, plate)'],
              ['Decision type', 'Rule-based, judgement, discretion', 'Rule-based, with exceptions for disability permits'],
              ['Volume and time', 'Per month, minutes per case', '2,400 a month, 12 minutes'],
              ['If it goes wrong', 'Who is harmed, how, how to undo', 'A wrongly refused permit: fixed on appeal'],
              ['Legal basis and owner', 'The law or rule, and the service owner', 'Local traffic regulation; head of parking services'],
            ]) + H.note('tip', 'Get the facts from <b>three sources</b>: the people who do the work, the logs (tickets, emails, case records) and the complaints. The three often disagree, and the gaps are the findings.'),
            n: 'Use an example the class knows. The fictional numbers show the level of detail; the real value is in the “if it goes wrong” and “decision type” rows, which decide how much autonomy is safe. Ask who would own filling this page in for each of their services.',
          },
          {
            t: 'Let an agent help you map, read-only',
            b: H.steps([
              ['Export a sample of closed cases', 'Remove names, ID numbers and contact details first, or use only an approved, access-controlled copy.'],
              ['Ask the agent to find the categories', '“Group these 500 requests into types. For each type: example, typical steps, how often.” Read-only, no system access.'],
              ['Check its map with the people who do the work', 'They know the exceptions that never reach the logs.'],
              ['Mark each task type', 'Retrieve, check, draft, summarise, classify, calculate, decide, notify, monitor (next slide).'],
              ['Keep the map as a living document', 'A service owner updates it. It becomes the base of the automation policy.'],
            ]) + H.note('warn', 'Even a mapping exercise uses real data. Apply the course rules: approved provider only, no personal data in a free tier, a lab or approved environment, and a person reads the result.'),
            n: 'This is the safest first use of an agent in the organisation: analysis of past work with no action on live systems (tier T0). It also teaches the team how the agent behaves. Warn about personal data: anonymise first, or use an approved internal setup.',
          },
          {
            t: 'Break services into tasks, and label them',
            b: H.table(['Task type', 'Agent fit', 'Who decides', 'Example'], [
              ['Retrieve information', 'High', 'The agent can answer, with the source shown', 'What documents does this permit need?'],
              ['Check completeness against rules', 'High', 'A person confirms the result at first', 'Is anything missing from this application?'],
              ['Summarise or translate', 'High', 'A person checks important texts', 'A 60-page case file in half a page'],
              ['Classify and route', 'High', 'Low-risk routing can be automatic', 'Send this complaint to the right team'],
              ['Draft a reply or a document', 'Medium to high', 'A person reviews and sends', 'First draft of an information-request reply'],
              ['Calculate', 'Medium', 'Prefer a tested program; the agent calls it', 'Fee, tax, entitlement amount'],
              ['Monitor and alert', 'High', 'The agent prepares; a person acts', 'Overnight system alerts'],
              ['<b>Decide a person\'s rights or money</b>', '<b>Low</b>', '<b>A person decides</b>', 'Grant, deny, fine, remove a benefit'],
            ]),
            n: 'The last row is the line that does not move. Many laws and frameworks treat decisions about people\'s rights, benefits and safety as high-impact: human oversight and the ability to challenge are expected. The agent can prepare the file; it should not be the decision-maker. We keep this line in the course rules.',
          },
          {
            t: 'Score your tasks and choose a first wave',
            b: H.widget('govTriage', { title: 'Which tasks first, and how much autonomy?' }) +
              H.note('it', 'Replace the sample tasks with your own services. Look at what rises to the top, and at the tasks flagged <b>a person decides</b>. Argue about the scores: the argument is the learning.'),
            n: 'Give fifteen minutes in small groups. Each group adds two tasks from its own organisation, changes scores, and defends its first wave. Collect disagreements about the impact and undo scores: they reveal what people fear. The scorecard is our own teaching tool, a conversation starter and not a standard.',
          },
          {
            t: 'What not to automate first',
            b: H.table(['Red flag', 'Why', 'Better first step'], [
              ['A decision about a person\'s rights, benefits, enforcement or employment', 'Highest impact; legal and ethical duties; hard to undo', 'Agent prepares the file; a person decides and signs'],
              ['A broken or unclear process', 'Automation makes a bad process faster', 'Fix and simplify first, then automate'],
              ['Nobody owns the data or the rule', 'Nobody can say what is correct', 'Name an owner and write the rule down'],
              ['No way to test or measure it', 'You cannot tell if it works', 'Build a small test set from past cases'],
              ['It needs access to everything', 'A large blast radius', 'Narrow the task, or give it a dedicated read-only account'],
              ['Politically sensitive or high-visibility', 'One error becomes a headline', 'Start internally; publish after you have evidence'],
            ]),
            n: 'Finish on prudence. The two red flags that surprise people are “a broken process” and “nobody owns the rule”: both come up in almost every public organisation. Ask students to put one of their own tasks under a red flag and say the better first step.',
          },
        ],
      },
      {
        id: 'm20-3', title: 'From pilot to policy: migrating little by little', mins: 30,
        slides: [
          {
            t: 'The autonomy ladder: five levels, one step at a time',
            b: H.fig(D.stack([
              { t: 'Level 4 · Runs end to end', s: 'narrow, low-impact, easy to undo; monitored', c: 'ok' },
              { t: 'Level 3 · Acts within limits', s: 'low-risk actions allowed; people review samples and every exception', c: 'ok' },
              { t: 'Level 2 · Prepares, a person approves', s: 'each outcome waits for a named person', c: 'acc' },
              { t: 'Level 1 · Assists', s: 'drafts, summarises, answers; a person does the work', c: 'tl' },
              { t: 'Level 0 · People do it', s: 'no agent involved', c: 'ink' },
            ], { h: 60 }), 'Start at the bottom. Move up one level at a time, only with evidence.') +
              H.note('key', 'Decisions about a person\'s rights or money stay at <b>level 2 or below</b>. Level 3 and 4 are for narrow, reversible tasks. This matches the T0 to T3 tiers of Module 12: levels 1 and 2 are mostly T0 and T2; level 3 uses T1 with narrow wrappers.'),
            n: 'Draw the ladder and ask where each of last lesson\'s first-wave tasks starts. Most should start at level 1 or 2. Stress that the ladder is per task, not per organisation: one service can have a level 3 triage step and a level 0 decision step.',
          },
          {
            t: 'Rules for moving up a level',
            b: H.table(['Move', 'Evidence you need first', 'What stays'], [
              ['0 → 1', 'A named owner, an approved tool and data rules; staff trained', 'A person does the work and owns the result'],
              ['1 → 2', 'The assistant\'s drafts or checks match a human baseline on a set of real past cases (the target is set in the pilot plan)', 'A person approves every outcome'],
              ['2 → 3', 'Low error rate over a stated period; every error caught and reviewed; the action is narrow and reversible', 'Sampling reviews, every exception escalated, a rollback'],
              ['3 → 4', 'Stable results, monitoring, an incident record, a re-approval date; legal and security sign-off', 'A kill switch, regular audit, a person responsible'],
              ['Any → down', 'A spike in errors, a complaint pattern, an incident, or a rule change', 'Drop one level at once and review'],
            ]) + H.note('tip', 'Set the numbers <b>before</b> the pilot, with the service owner, not after. “Good enough” chosen afterwards is how projects talk themselves into trouble.'),
            n: 'We deliberately give no universal percentages: the right threshold depends on the harm. Ask each group what accuracy against a human baseline they would require before moving a complaint-routing step from level 2 to level 3, and why. The last row matters: the ladder must go down as easily as up.',
          },
          {
            t: 'A migration roadmap with gates',
            b: H.fig(D.flow([
              { t: '1 · Foundations', s: 'service map, owner, policy, training', c: 'tl' },
              { t: '2 · Assist staff', s: 'drafting, summaries, answers (level 1)', c: 'tl' },
              { t: '3 · Prepare with approvals', s: 'night triage and queues (level 2)', c: 'acc' },
              { t: '4 · Limited autonomy', s: 'narrow, reversible tasks (level 3)', c: 'acc' },
              { t: '5 · Review and scale', s: 'audit, re-approve, extend', c: 'ok' },
            ], { h: 104, loop: 'Each phase ends with a gate: evidence, review, decision' }), 'Migrate task by task, not department by department.') +
              H.list([
                '<b>Gate</b> = a written decision by the service owner, security and legal, with the evidence attached.',
                'Run <b>one</b> service through the whole ladder before you copy the method to a second.',
                'Keep the old way working in parallel until the new way has earned trust.',
              ]),
            n: 'The loop under the flow is the point: the cycle repeats for each new task. Resist the pressure to roll out to many services at once; the first pilot teaches you which gates are missing. Parallel running is expensive but it is what protects the public.',
          },
          {
            t: 'The automation policy: one page everyone signs',
            b: H.code('# Automation policy (one page, version, owner, review date)\n1. Purpose and scope      what we automate, for whom, and what is out of scope\n2. Autonomy levels         levels 0-4 and the tasks allowed at each\n3. Rights and decisions    decisions about rights, money, safety: a person decides\n4. Data rules              classes of data, approved providers, no personal data in free tiers\n5. Human oversight         who approves, who reviews samples, who is on call\n6. Transparency            public record of each system; AI disclosure to the public\n7. Challenge and appeal    how a person reaches a human and fixes an error\n8. Security                least privilege, read-only by default, secrets handling, logging\n9. Testing and monitoring  baseline, test set, metrics, incident process\n10. Suppliers              contract terms: data use, logs, audit, exit\n11. Skills and training    who must be trained before use\n12. Review and retirement  review cadence; kill switch; how a system is retired', 'text', 'Automation policy: the twelve headings') +
              H.note('it', 'Short beats thorough. A one-page policy that people read is better than a forty-page one that sits in a folder. Put the details in a runbook per system.'),
            n: 'Walk through the twelve headings quickly and ask which already exist in the organisation as separate documents (data protection, information security, procurement). The policy ties them together for agents. Compare with the guardrail policy of Module 12: this is its public-organisation version.',
          },
          {
            t: 'Who owns what',
            b: H.fig(D.hub({ t: 'Automation policy', s: 'one owner', c: 'acc' }, [
              { t: 'Service owner', s: 'accountable for the outcome', c: 'tl' },
              { t: 'Security', s: 'controls, logs, incidents', c: 'tl' },
              { t: 'Data protection', s: 'personal data, impact assessment', c: 'tl' },
              { t: 'Legal', s: 'basis, rights, contracts', c: 'tl' },
              { t: 'IT and platform', s: 'accounts, runtime, monitoring', c: 'tl' },
              { t: 'Staff and unions', s: 'roles, training, concerns', c: 'tl' },
              { t: 'The people served', s: 'feedback, complaints, ombudsman', c: 'ok' },
            ], { h: 430, bw: 200 }), 'A small standing group decides gates. One name is accountable for each system.') +
              H.note('key', 'Humans stay accountable. An agent can never be the answer to “who is responsible?”. Name a person for every system and every night run.'),
            n: 'Include staff early: automation without staff is the quickest way to lose the pilot. Ask who in the room sits in which spoke today, and which spoke is missing. The last spoke is the one organisations forget; a feedback route from the people served is part of the control system.',
          },
          {
            t: 'What to measure, and the switch-off drill',
            b: H.table(['Measure', 'Why', 'Who looks'], [
              ['Quality against the human baseline', 'Is it right, on real cases?', 'Service owner, monthly'],
              ['Escalation and override rate', 'How often people change what the agent prepared', 'Service owner'],
              ['Time and queue length', 'Is the service actually faster?', 'Service owner'],
              ['Complaints and corrections', 'What do the people served say?', 'Service owner and ombudsman liaison'],
              ['Incidents and near misses', 'What went wrong, even if no harm followed', 'Security'],
              ['Cost per case and model spend', 'Is it worth it, and is a loop running?', 'IT and finance'],
              ['Time to stop it', 'The switch-off drill: how fast can we turn it off?', 'IT, tested quarterly'],
            ]) + H.note('warn', 'Run the <b>switch-off drill</b> before you need it: turn the agent off, check the old process takes over, and time it. An untested kill switch is a hope.'),
            n: 'The override rate is the most useful early signal: if people change half of what the agent prepares, the agent is not saving time. The switch-off drill echoes the gateway lab of the ecosystem module. Ask who has ever tested the failover of a system that nobody wanted to turn off.',
          },
        ],
      },
      {
        id: 'm20-4', title: 'Standards, laws and frameworks that matter in 2026', mins: 30,
        slides: [
          {
            t: 'Three layers: law, management, security',
            b: H.fig(D.columns([
              { h: 'Law and national policy', c: 'ink', items: ['EU AI Act', 'US OMB M-25-21 for federal agencies', 'National and local rules', 'Binding'] },
              { h: 'Management and risk', c: 'acc', items: ['ISO/IEC 42001', 'NIST AI RMF and GenAI profile', 'OECD AI principles', 'Voluntary, auditable'] },
              { h: 'Security and practice', c: 'tl', items: ['OWASP Top 10 for Agentic Applications', 'UK AI Playbook', 'Singapore agentic framework', 'Guidance'] },
            ], { bh: 42 }), 'Law says what you must do. Management standards say how to organise it. Security guides say what to build and test.') +
              H.note('warn', 'This is a snapshot of October 2026, from the publishers\' own pages as reported by search. Laws and drafts change: <b>check the current text and your own jurisdiction</b> with legal before you rely on any date.'),
            n: 'Use the three columns to sort every framework a student mentions. A common mistake is treating a voluntary framework as law or a law as a how-to. We could not open the publishers\' sites from the course environment, so every fact here comes from their published descriptions as returned by search; verify before a class.',
          },
          {
            t: 'What each one gives you',
            b: H.table(['Framework', 'What it is', 'How we use it', 'Binding?'], [
              ['<b>NIST AI RMF 1.0</b> and the <b>Generative AI Profile</b> (NIST AI 600-1, July 2024)', 'A risk framework with four functions: Govern, Map, Measure, Manage. The profile lists 13 generative-AI risks and more than 400 suggested actions, including prompt injection and confabulation', 'A checklist of risks and actions for each agent', 'Voluntary'],
              ['<b>ISO/IEC 42001:2023</b>', 'The first management-system standard for AI (clauses 4 to 10 and 38 controls in Annex A). Certifiable. A companion, ISO/IEC 42005, covers impact assessment', 'The skeleton of an organisation-wide AI management system; audit evidence', 'Voluntary, certifiable'],
              ['<b>EU AI Act</b>', 'Risk-based law: banned practices, high-risk systems, transparency duties for chatbots and synthetic content', 'Classify each use; plan disclosure and human oversight', 'Binding in the EU'],
              ['<b>US OMB M-25-21</b> (April 2025)', 'Rules for US federal agencies: a “high-impact AI” category with minimum practices (pre-deployment testing, impact assessment, ongoing monitoring, human oversight) and the duty to stop non-compliant uses. A companion, M-25-22, covers buying AI', 'A model for what “high impact” practices look like', 'Binding for US federal agencies'],
              ['<b>UK AI Playbook</b> (February 2025)', 'Ten principles for civil servants, including human control, and a mapping for agentic AI; departments record tools under the Algorithmic Transparency Recording Standard', 'Principles and a public transparency record', 'Guidance; the recording standard is required for central government bodies in scope'],
              ['<b>Singapore Model AI Governance Framework for Agentic AI</b> (January 2026, updated 2026)', 'Guidance on managing the risk of agents that act, stressing that humans remain accountable', 'Controls for autonomy and third-party agents', 'Voluntary'],
              ['<b>OWASP Top 10 for Agentic Applications</b> (December 2025)', 'The ten most critical security risks for agents that plan and use tools', 'A security test list (next slides)', 'Guidance'],
            ]),
            n: 'Do not read this table. Ask students to find the one thing in each row that applies to their organisation within a year. The facts are from the publishers\' own descriptions: NIST for the profile, ISO for 42001, the OMB memo and the UK playbook pages, IMDA and OWASP. The Singapore update date and the OMB deadline are given differently by different sources, so we do not rely on them.',
          },
          {
            t: 'EU AI Act: dates moved, duties did not disappear',
            b: H.table(['What', 'When (as reported, October 2026)', 'Meaning for a public body'], [
              ['Banned practices and the AI-literacy duty', 'Applied from February 2025; the Omnibus added new banned practices and changed some duties, so check the text', 'Avoid banned uses; train staff who use AI'],
              ['Transparency (for example telling people they are talking to an AI)', 'Applies from 2 August 2026', 'Disclose chatbots and label synthetic content'],
              ['Stand-alone high-risk systems (Annex III: for example access to essential services and benefits)', 'Delayed to 2 December 2027 by the Digital Omnibus on AI', 'Prepare now: risk management, data governance, logging, human oversight'],
              ['High-risk AI inside regulated products (Annex I)', 'Delayed to 2 August 2028', 'Mostly for product makers'],
              ['Date for systems used by public authorities', 'Sources disagree', 'Check the Official Journal and ask legal'],
            ]) + H.note('key', 'A delayed deadline is time to <b>prepare</b>, not time to wait. The requirements (risk management, logging, human oversight, records) are the same ones a good automation policy already asks for.'),
            n: 'The Digital Omnibus on AI (Regulation (EU) 2026/1744) entered into force on 27 July 2026 according to the law-firm summaries we read; they agree on the core dates and disagree on public-authority timing, so we say so. Students outside the EU can still use it: it is a clear picture of what a risk-based regime asks for.',
          },
          {
            t: 'Security: the OWASP list and how our controls answer it',
            b: H.table(['Risk (as published)', 'What it looks like at night', 'Our control'], [
              ['Goal hijack', 'A letter or web page tells the agent to do something else', 'Treat all text as data; narrow tools; approvals'],
              ['Tool misuse', 'It uses a tool in a way nobody intended', 'Narrow permissions; deny rules'],
              ['Identity and privilege abuse', 'It holds a powerful account', 'Read-only or least-privilege accounts, one per agent'],
              ['Supply chain', 'A skill, plugin or model that is not what it claims', 'Review and pin everything (Module 19)'],
              ['Unexpected code execution', 'It runs code it wrote', 'Sandbox; no network by default'],
              ['Memory and context poisoning', 'Bad data stays in its memory', 'Gate what it remembers; review memory'],
              ['Insecure agent-to-agent communication', 'One agent trusts another', 'Authenticate; treat messages as untrusted'],
              ['Cascading failures', 'One error repeats a thousand times', 'Budgets, rate limits, kill switch'],
              ['Human-agent trust exploitation', 'A person approves without reading', 'Short, clear approvals; sampling; rotation'],
              ['Rogue agents', 'An agent acts outside its remit', 'Inventory, monitoring, owner per agent'],
            ]) + H.note('tip', 'We list the categories as summarised from the published OWASP list. Read the official page for exact names and definitions, and map each one to a test in your pilot.'),
            n: 'Students will recognise most of these from earlier modules (prompt injection, guardrails, permissions). The last row is the governance one: an inventory of agents with an owner for each. The most useful exercise is to take one night-shift job and walk it through all ten rows.',
          },
          {
            t: 'A public record for each agent',
            b: H.code('System:        Overnight request triage\nOwner:         Head of Parking Services (name, contact)\nPurpose:       Sort new permit requests, check for missing documents, draft a reply\nAutonomy:      Level 2: a person approves every outcome\nDecisions:     None. Eligibility and fees are decided by staff\nData used:     Request text and attachments; no special-category data\nModel/vendor:  [approved provider], hosted in [region]\nHuman oversight: Morning queue, reviewed by two officers; sample audit weekly\nHow to reach a person: phone and counter, shown on every reply\nHow to challenge:      reply to the same address; a person answers within 5 working days\nTested:        Against 300 past cases; results on file\nLast review:   2026-10-28   Next review: 2027-01-28', 'text', 'A short public record (sketch)') +
              H.note('it', 'The UK publishes such records under its Algorithmic Transparency Recording Standard. You can copy the idea whatever the country: <b>one short page per agent</b>, public if possible, that anyone can read.'),
            n: 'This is the most “creative” cheap measure in the module: it forces the team to be clear and it builds trust. Ask students to fill one in for a real system; they will find the empty lines (who is the owner, where is it hosted) quickly. The format is our sketch, inspired by the idea of public algorithm registers.',
          },
          {
            t: 'NIST in four verbs: a loop for every agent',
            b: H.fig(D.cycle([
              { t: '1 · Govern', s: 'policy, owner, roles', c: 'ink' },
              { t: '2 · Map', s: 'purpose, people affected, data', c: 'tl' },
              { t: '3 · Measure', s: 'test, baseline, monitor', c: 'acc' },
              { t: '4 · Manage', s: 'limits, incidents, retire', c: 'ok' },
            ], { t: 'Each agent', s: 'repeat every review' }, { h: 420 }), 'The four functions of the NIST AI RMF, used as a repeating loop.') +
              H.list([
                '<b>Govern:</b> the automation policy and the owner (lesson 3).',
                '<b>Map:</b> the service map and the people affected (lesson 2).',
                '<b>Measure:</b> baseline, test set and the measures table (lesson 3).',
                '<b>Manage:</b> autonomy limits, kill switch, incidents and retirement.',
              ]),
            n: 'End by showing students that they already did all four. The framework adds a shared vocabulary for auditors and partners. ISO/IEC 42001 asks for the same cycle as a management system (plan, do, check, act) that can be certified.',
          },
        ],
      },
      {
        id: 'm20-5', title: 'Trends and creative patterns that stay safe', mins: 30,
        slides: [
          {
            t: 'What is happening in 2026, and how much to trust the sources',
            b: H.table(['Signal', 'What it says', 'How reliable'], [
              ['Agents with their own computer', 'Vendors launched always-on agents for individuals and teams; government-focused agent products followed (for example Google Public Sector announced an agentic offering for government services on 20 October 2026)', 'Vendor announcements: real products, claims unproven'],
              ['Government-grade clouds', 'Several enterprise agent platforms report FedRAMP High authorisation', 'Vendor statements; check the authorisation list'],
              ['Governance catching up', 'In 2026 Singapore published an agentic-AI governance framework; the UK playbook maps agentic AI to its principles; OWASP published an agentic top ten', 'Official or community publications'],
              ['Trust gap', 'OECD: fewer than four in ten people were confident that government AI would be fair, transparent and keep humans in charge', 'OECD survey'],
              ['Early practice', 'An OECD paper (September 2026) draws on interviews with 25 organisations, including government agencies', 'Interview-based, early'],
              ['Adoption numbers', 'Many articles quote percentages of agencies adopting agents', 'Mostly vendor surveys; methods unclear'],
            ]) + H.note('warn', 'Most public stories about agents in government are written by the companies that sell them. Prefer <b>OECD, audit-office and agency reports</b>, and ask for the measured result before the headline.'),
            n: 'Be generous and sceptical at once. Show how to read a source: who wrote it, who pays, what was measured. The Google item is a launch announcement, not evidence of results. The OECD points are the best-quality sources we found; read them in full before relying on them.',
          },
          {
            t: 'Twelve patterns, with the level they start at',
            b: H.cards([
              ['Night-shift desk', 'Sorts overnight requests, checks them, drafts replies; staff approve in the morning.', 'level 2'],
              ['Explain my letter', 'Rewrites an official letter in plain words and in the person\'s language, with the original beside it.', 'level 1'],
              ['Complete before you submit', 'Tells an applicant what is missing before the form goes in. Eligibility stays with staff.', 'level 2'],
              ['Case-file summary', 'A half-page summary of a long file, with links to the page each fact came from.', 'level 1'],
              ['Information-request helper', 'Finds relevant records and marks personal data to redact; a person releases.', 'level 2'],
              ['Consultation analyst', 'Groups thousands of public comments into themes with sample quotes.', 'level 1'],
              ['Rulebook Q&A', 'Answers staff questions from our own rules, with citations and “I do not know”.', 'level 1'],
              ['Night watch for IT', 'Reads alerts and logs, groups them, suggests next steps. No changes.', 'level 2'],
              ['Procurement checker', 'Compares bids against criteria and flags inconsistencies; people score.', 'level 1'],
              ['Knowledge keeper', 'Turns a retiring expert\'s procedures into reviewed skills (Module 19).', 'level 1'],
              ['Service tester', 'Plays an applicant, walks the form in a test environment, lists confusing steps.', 'level 3'],
              ['Crisis drafts', 'First drafts of updates during an emergency, with a fact check against official data.', 'level 1'],
            ], 3),
            n: 'Give each pair two cards: where would it start in their organisation, and what is the first thing that could go wrong? The levels are starting points. Note that the one level 3 pattern works in a test environment with no live data. Pick two cards for the workshop.',
          },
          {
            t: 'Pattern: the night-shift desk, step by step',
            b: H.fig(D.seq(['Person', 'Agent', 'Systems', 'Staff'], [
              [0, 1, '23:10 sends a request', 'acc'],
              [1, 2, 'reads the rules and records (read-only)'],
              [1, 1, 'classifies, finds missing items, drafts'],
              [1, 0, 'tells them it is an AI, what happens next'],
              [1, 3, 'urgent case: call the on-call person', 'acc'],
              [1, 3, '06:30 morning queue with drafts'],
              [3, 1, '08:45 approve, edit or reject', 'acc'],
              [3, 0, 'a person sends the final reply', 'acc'],
            ], { step: 44, focus: 1 }), 'The agent reads and drafts at night. A person sends the final answer.') +
              H.note('tip', 'Three rules make it safe: <b>read-only access</b>, <b>nothing sent without a person</b>, and a <b>defined route for urgent cases</b> so an emergency never waits for the morning queue.'),
            n: 'Walk the arrows. Ask what happens at 03:00 when the message says “I am going to hurt myself” or “my pipe has burst”. The urgent route is the part that is most often forgotten, and it needs a human on call. This pattern is the Hermes helpdesk playbook of Module 12, applied to a public service.',
          },
          {
            t: 'Pattern: keep the knowledge when people leave',
            b: H.fig(D.flow([
              { t: 'An expert\'s procedure', s: 'the permit exceptions they know', c: 'tl' },
              { t: 'Capture it', s: 'interview, /learn, SKILL.md', c: 'acc' },
              { t: 'Review it', s: 'owner and legal read it', c: 'ink' },
              { t: 'Skill library', s: 'versioned, in the repository', c: 'ok' },
              { t: 'Agents and new staff', s: 'use the same procedure', c: 'tl' },
            ], { h: 104 }), 'A public body loses knowledge every time an experienced person retires. Skills keep it.') +
              H.note('it', 'This links to <b>Module 19</b>: write the procedure as a skill, review it like code, keep it in a repository with an owner, and the agent and the newcomer follow the same steps.'),
            n: 'Public organisations hold huge amounts of knowledge that lives in people\'s heads. This is a creative and low-risk use of agents: the agent helps capture, people review. Ask which retirement in the room worries them most.',
          },
          {
            t: 'Make the service agent-ready',
            b: H.steps([
              ['Say the rules once, in plain language', 'A clear rulebook beats a hundred exceptions. Agents and people both benefit.'],
              ['Ask for data once (the once-only idea)', 'Use data the organisation already holds instead of asking people again.'],
              ['Offer structured access', 'APIs and clean data let agents act without scraping screens.'],
              ['Write the decision criteria down', 'What makes a case eligible. Testable by examples.'],
              ['Keep a test set of past cases', 'The base of every pilot, and of every later review.'],
              ['Design the human route first', 'Where a person takes over, how, and what they see.'],
            ]) + H.note('key', 'The best preparation for agents is <b>better services</b>: clearer rules, cleaner data and a visible human route. That is useful even if you never deploy an agent.'),
            n: 'This slide changes the conversation from buying a tool to improving the service. Ask which of the six is weakest in their organisation. Often the answer is “the rules are in someone\'s head”, which sends us back to the knowledge-keeper pattern.',
          },
        ],
      },
      {
        id: 'm20-6', title: 'Workshop: map, score, plan and write the policy', mins: 45, lab: true,
        slides: [
          {
            t: 'The project: a pilot plan for one real service',
            b: H.table(['Step', 'What you produce', 'Done when'], [
              ['1 · Choose a service', 'One service of your own organisation, with an owner', 'You can describe it in one sentence'],
              ['2 · Map it', 'The one-page service map (lesson 2)', 'Steps, data classes, decision type, volume filled in'],
              ['3 · Score the tasks', 'The scorecard: benefit, risk and suggested level per task', 'A first wave of up to three tasks'],
              ['4 · Design the night shift', 'A one-page runbook: what runs, with what access, who approves, urgent route, stop switch', 'Another person can run it'],
              ['5 · Write the policy extract', 'The autonomy levels, the human-decides line and the review dates for your service', 'A page the service owner would sign'],
              ['6 · Plan the migration', 'Phases and gates with the evidence you will collect', 'A table of gates and who decides'],
              ['7 · Prepare the public record', 'The short record for the system (lesson 4)', 'A page a citizen could read'],
            ]) + H.note('warn', 'Use <b>fake or published information only</b>. Do not use real cases or personal data in the workshop.'),
            n: 'Give 45 minutes in groups of three or four; a mix of IT, service and legal roles works best. Collect the pilot plans on one page at the end. Walk the room for two mistakes: automating a decision, and an unowned system.',
          },
          {
            t: 'A worked example: business-licence renewals',
            b: H.table(['Part', 'Example answer'], [
              ['Service', 'Renewing a small-business licence (fictional)'],
              ['First-wave tasks', 'Answer status questions (level 1); check renewals for missing documents (level 2); draft reminder letters (level 1)'],
              ['Stays with a person', 'Granting, refusing or suspending a licence'],
              ['Night shift', '02:00 run: read new renewals, list missing documents, draft replies; read-only; stops after 20 minutes or a small spending cap; 06:30 queue to two officers'],
              ['Urgent route', 'A safety or fraud report is sent by phone to the officer on call'],
              ['Evidence before level 3', '300 past cases checked against officer results; override rate and complaints tracked for a quarter'],
              ['Gate', 'Service owner, security and legal sign a short decision; the old process continues in parallel'],
              ['Switch-off', 'One documented step; tested before the pilot starts'],
            ]),
            n: 'Show this example last, after groups have tried. It shows the level of detail we expect, and the way the decision stays with people. Compare the group answers against it and ask what they did differently.',
          },
          {
            t: 'The review panel',
            b: H.table(['Role', 'The question they ask'], [
              ['A person who uses the service', 'How will I know it is an AI? Can I reach a person? How do I fix a mistake?'],
              ['An auditor', 'Where is the evidence? Who approved the move to this level, and when?'],
              ['Security', 'What can it access? What happens if a letter tells it to do something else?'],
              ['Data protection', 'What personal data does it see? Where is it processed? How long is it kept?'],
              ['A union or staff representative', 'What happens to our jobs and our responsibility? Who is accountable?'],
              ['Finance', 'What does it cost per case, and who stops a runaway bill?'],
            ]) + H.note('it', 'Rotate the roles. Each group presents its plan for five minutes and answers the panel. The best plans make the panel\'s questions easy to answer.'),
            n: 'Role-play makes the compliance material feel real. Appoint the panel from other groups. Score on clarity and evidence, not on how impressive the technology sounds. The staff representative question is the one most groups do not prepare for.',
          },
          {
            t: 'How we mark it',
            b: H.table(['Good looks like', 'Evidence'], [
              ['<b>Starts from people</b>', 'The map begins with what the service does for people, not with a tool'],
              ['<b>Right-sized autonomy</b>', 'Every task has a level; decisions about rights or money stay with a person'],
              ['<b>Safe at night</b>', 'Read-only, a queue, a budget, an urgent route and a tested stop'],
              ['<b>Measured</b>', 'A baseline, a test set and thresholds written before the pilot'],
              ['<b>Owned and transparent</b>', 'An owner, a one-page policy extract and a short public record'],
              ['<b>Honest about sources</b>', 'Standards are cited with dates; unverified claims are flagged'],
            ]) + H.note('key', 'Close with one sentence from each group: <b>what will we stop, what will we start, and who decides?</b>'),
            n: 'Collect the one-sentence answers on the board. Those become the pilot backlog of the organisation. Remind them that every pilot ends with a gate decision, and that “not yet” is a valid decision.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'What is the safest meaning of “an agent that works 24/7” in a public organisation?', a: ['It decides cases at night so staff do not have to', 'It prepares work at night, and people decide in the morning', 'It runs without logs to save cost', 'It replaces the night staff'], c: 1, why: 'The agent reads, checks and drafts. A queue, an approval and a route for urgent cases keep decisions with people.' },
      { q: 'Where should an organisation start when it wants to use agents?', a: ['Pick the most advanced tool', 'Map what it does for people and score the tasks', 'Automate the hardest decisions first', 'Give the agent admin access'], c: 1, why: 'Services, processes and tasks come first; tools come after. A scored task list shows where an agent fits.' },
      { q: 'A task decides whether a person receives a benefit. What is the highest autonomy level the course allows?', a: ['Level 4', 'Level 3', 'Level 2: the agent prepares and a person decides', 'Level 0 is not allowed'], c: 2, why: 'Decisions about a person\'s rights or money keep a person in charge; the agent may prepare the file.' },
      { q: 'Your pilot works well at level 2. What should you do before moving a step to level 3?', a: ['Just switch it on', 'Collect the evidence agreed in the pilot plan, then get a written gate decision', 'Remove the logs', 'Wait for a vendor survey'], c: 1, why: 'Move up only with evidence against a human baseline and a written decision; keep a rollback.' },
      { q: 'What does the automation policy mainly do?', a: ['Chooses the model vendor', 'Sets what may be automated, at what level, who is accountable and how to stop it', 'Replaces data protection law', 'Lists staff salaries'], c: 1, why: 'It ties scope, levels, oversight, transparency, challenge, security and review into one page that people sign.' },
      { q: 'Which pair is correct?', a: ['ISO/IEC 42001 is a binding law', 'The EU AI Act is a binding law; ISO/IEC 42001 is a certifiable management standard', 'OWASP agentic top ten is a law', 'NIST AI RMF is mandatory everywhere'], c: 1, why: 'Laws bind; ISO 42001 is voluntary but certifiable; NIST and OWASP are voluntary guidance.' },
      { q: 'The EU AI Act high-risk deadline for Annex III systems was delayed. What is the right response?', a: ['Ignore it', 'Use the time to prepare risk management, logging and human oversight, and check dates with legal', 'Switch off all agents', 'Assume nothing applies'], c: 1, why: 'A delay is time to prepare; the transparency duties and AI literacy already apply and dates can change again.' },
      { q: 'Why publish a short record for each agent?', a: ['It is decoration', 'It builds trust: people can see purpose, owner, oversight and how to challenge', 'It hides the vendor', 'It replaces testing'], c: 1, why: 'Transparency records (for example the UK Algorithmic Transparency Recording Standard) show the purpose, owner, oversight and route to a human.' },
      { q: 'An article claims agents cut government backlogs from weeks to days. How should you read it?', a: ['As proof', 'Check who wrote it and what was measured, and test on your own cases', 'Ignore all numbers', 'Copy the number into your plan'], c: 1, why: 'Many figures come from vendors. Measure against your own baseline in a small pilot.' },
      { q: 'Which control best answers “a person approves without reading”?', a: ['More approvals', 'Short, clear approvals with sampling, review and rotation, and logs of what was approved', 'Remove approvals', 'Longer prompts'], c: 1, why: 'Human-agent trust exploitation is real: design approvals that people can actually read and check.' },
    ],
  });
})();
