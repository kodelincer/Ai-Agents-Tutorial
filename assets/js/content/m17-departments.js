(function () {
  const { H, D } = window.ACADEMY;
  window.ACADEMY.module({
    id: 'm17', num: 17, title: 'Agents for every department: managers, communications, finance and more',
    summary: 'Practical, safe uses of AI agents outside IT: weekly briefings and decisions for managers, coverage and messages for communications and PR, invoice and reconciliation checks for accounting, plus HR, sales, service and admin. Three labs use sample data, and a workshop plans a real two-week pilot.',
    outcomes: ['Choose a good first task for an agent and say what makes it safe', 'Write a brief any assistant can follow, and review the result the same way every time', 'Run a manager\'s weekly briefing, a communications message set and an invoice check with human approval', 'Plan and measure a two-week pilot in your own department'],
    lessons: [
      {
        id: 'm17-1', title: 'Agents beyond IT: four ways to work, and the safe rules', mins: 25,
        slides: [
          {
            t: 'The same agent loop, in every department',
            b: H.cards([
              ['Managers and leaders', 'A weekly briefing built from many reports, meeting preparation, options for a decision.', 'briefing'],
              ['Communications and PR', 'Coverage digests, first drafts, one message adapted to every channel, spokesperson preparation.', 'drafting'],
              ['Accounting and finance', 'Invoice checks, bank reconciliation, variance explanations, expense-policy checks.', 'checking'],
              ['HR and recruitment', 'Job-advert drafts, policy questions answered from the handbook, onboarding checklists.', 'answering'],
              ['Sales and customer service', 'Sort incoming requests, draft replies, summarise an account\'s history.', 'routing'],
              ['Admin and operations', 'Schedules, forms, itineraries, status reports.', 'organising'],
            ], 3) + H.note('key', 'In every case the agent <b>prepares</b> and a person <b>decides, approves and sends</b>. That one rule is what makes agents safe to use outside IT.'),
            n: 'Ask each person to name the department they work in and one task that eats their week. Write them on the board. Everything in this module is the same loop as session 9: read, think, produce, check, but with documents and spreadsheets in place of servers.',
          },
          {
            t: 'Four ways to work with an agent, no terminal needed',
            b: H.table(['Way', 'What it is', 'Who sets it up', 'Good for'], [
              ['Chat assistant with files', 'You upload documents or spreadsheets to an approved chat assistant and ask it to analyse, summarise or draft.', 'You, with an approved account', 'One-off analysis and drafting'],
              ['Desktop assistant', 'An app such as Claude Desktop that can work with your files, create documents and spreadsheets and, with your approval, use connected apps (session 13).', 'You, with IT approval for connectors', 'Multi-step tasks on your own files'],
              ['Scheduled assistant', 'A recurring job: every Monday at 07:30, build the briefing and put it in my inbox.', 'You or IT', 'Reports, digests, reminders'],
              ['Team bot in chat', 'An agent in Slack or Teams that colleagues message with questions (the Hermes gateway, session 20).', 'IT builds it with the team', 'Shared questions: policy, status, requests'],
            ]) + H.note('tip', 'Which of these your organisation allows, with which kinds of data, is a policy decision. Ask IT and the data-protection officer before you start, not after.'),
            n: 'Most people start with the first row. The scheduled assistant is where agents stop being a chat window and start saving real time, because nobody has to remember to ask. The team bot is the IT-built version for shared questions; people from IT in the room can say whether it exists yet.',
          },
          {
            t: 'Is this a good first task for an agent?',
            b: H.table(['Question', 'A good sign', 'A warning sign'], [
              ['How often?', 'Weekly or daily, the same shape each time', 'Once a year, different every time'],
              ['What is it made of?', 'Text, tables, documents, emails', 'Needs judgement about people or the law'],
              ['Can you check it fast?', 'You can verify the result in a few minutes', 'Checking takes as long as doing it'],
              ['What if it is wrong?', 'It is caught before it leaves the building', 'Money moves or a statement goes public'],
              ['Are the rules clear?', 'Written policy, templates, past examples', '“We just know what good looks like”'],
              ['What data is involved?', 'Public or internal material', 'Personal, health, payroll or unpublished results'],
            ]) + H.note('key', 'Start with a task that scores well on all six rows. A weekly briefing passes. Paying invoices does not: the agent can prepare the check, a person pays.'),
            n: 'Have people score their own task from the first slide on this table. Most will find one row where it fails; that is useful, because it tells you which control to add rather than whether to try. Do not let anyone pick a task that fails the last two rows for a first pilot.',
          },
          {
            t: 'Safety rules for any department',
            b: H.steps([
              ['Know your data class', 'Public, internal, confidential, or personal and financial. Only approved tools for each class. When unsure, ask before you paste.'],
              ['Draft, do not send', 'Nothing leaves the organisation, whether an email, a press release, a payment or a post, without a named person approving it.'],
              ['Give it the facts and forbid the rest', 'Tell it to use only the material you provide, and to mark anything else as [unverified].'],
              ['Check numbers and quotes against the source', 'Models can mis-add and can invent a quote. Recompute totals and trace every figure.'],
              ['Keep a trail', 'Save what you gave it, what it produced and who approved it.'],
              ['Follow your organisation\'s rule on disclosure', 'Some policies and laws require saying when AI helped.'],
            ]),
            n: 'Read the six rules aloud and ask which one people think their department is most likely to break. In practice it is the first: pasting something confidential into a public chat tool because it was quick. Link to session 24 on security for the technical side.',
          },
          {
            t: 'Measure it: is it really saving time?',
            b: H.table(['Measure', 'How to count it'], [
              ['Time before', 'Minutes the task took you last month, per run'],
              ['Time with the agent', 'Minutes to write or adjust the brief, wait, and review the result'],
              ['Errors found in review', 'Mistakes you caught per run: a sign of how much review you still need'],
              ['Cost per run', 'What the assistant costs for one run (session 3)'],
              ['How people feel', 'One question: would you go back? Ask the people who use the output too'],
            ]) + H.note('tip', 'Time saved per month = runs × (minutes before − minutes with the agent, including your review). If it does not beat zero by a clear margin, change the task, not the numbers.'),
            n: 'The review time is the number people forget. A briefing that takes 5 minutes to generate and 20 to check has saved nothing. The aim of the pilot in the last lesson is to find out honestly, over two weeks, which side of zero a task lands on.',
          },
        ],
      },
      {
        id: 'm17-2', title: 'Turn a task into a brief', mins: 15,
        slides: [
          {
            t: 'The brief: seven lines for any task',
            b: H.prompt('Role:     You are an experienced {role}, helping {me / my team}.\nGoal:     {one sentence: what the result is for, and who will use it}\nInputs:   {the documents, data or notes I am giving you}\nRules:    {facts you may use; tone; length; things you must not do}\nOutput:   {the format: one page, a table, an email draft, a bullet list}\nCheck:    {how I will verify it. List your assumptions and anything you could not verify.}\nIf unsure: ask me, or mark it [unverified]. Do not guess.', 'a brief for any assistant') +
              H.note('key', 'This is the same structure as the coding-agent task brief in session 12 and the prompt anatomy in session 7. It works the same way for a press release or a budget review.'),
            n: 'Put the seven lines on the board and have people copy them. The two that matter most are Check and the last line. Without Check the assistant has no standard to meet; without the last line it fills gaps with plausible guesses, which is how invented figures get into reports.',
          },
          {
            t: 'A weak request and a strong brief',
            b: H.table(['Weak', 'Strong'], [
              ['“Summarise these reports.”', 'Role: chief of staff for the head of operations.\nGoal: a one-page briefing for Monday\'s leadership meeting.\nInputs: the five weekly reports below.\nRules: use only the reports; one line per item; keep facts and your interpretation separate; at most five risks.\nOutput: sections What changed, Risks, Decisions needed (with an owner and a date).\nCheck: list anything you could not support from the reports.'],
              ['“Write a press release about the new service.”', 'Role: communications officer. Goal: a 300-word release for local media. Inputs: the fact sheet below. Rules: use only the fact sheet; mark anything else [unverified]; plain, warm tone; no superlatives. Output: headline, three paragraphs, a quote placeholder. Check: list every claim with the fact-sheet line that supports it.'],
              ['“Check these invoices.”', 'Role: accounts-payable clerk. Goal: find invoices that should not be paid yet. Inputs: the invoice table and the purchase-order table below. Rules: flag duplicates, missing purchase-order numbers and invoices that exceed the approved amount; do not decide to pay anything. Output: a table of exceptions with the evidence. Check: show the total of all invoices and of the exceptions, with the calculation.'],
            ]),
            n: 'Read the first row aloud. The strong brief takes two minutes longer to write and saves a round trip, and the Check line is what lets you review quickly. The second and third rows are the starting points for the labs in this module.',
          },
          {
            t: 'Review every output the same way',
            b: H.steps([
              ['Is every fact in the source?', 'Pick three claims and find them in what you provided.'],
              ['Do the numbers add up?', 'Recompute totals and percentages yourself or in a spreadsheet.'],
              ['Is anything important missing?', 'Ask: what would a sceptical reader want that is not here?'],
              ['Is the tone right for the audience?', 'Read it as the person who will receive it.'],
              ['Would I put my name on it?', 'If not, fix it or do it yourself. You are the author of record.'],
            ]),
            n: 'This five-question review is the habit to build. Add the single most useful follow-up prompt: “What did you not verify?” Agents will often tell you, but only if you ask.',
          },
          {
            t: 'Follow-up prompts that improve the result',
            b: H.cards([
              ['Show your sources', '“For each claim, quote the line in my material that supports it.”', 'trust'],
              ['Argue the other side', '“Now act as a sceptical reader and list the three weakest points.”', 'quality'],
              ['Change the audience', '“Rewrite for the board: shorter, no jargon, decisions first.”', 'reuse'],
              ['Shorten and sharpen', '“Cut it by a third without losing any number or date.”', 'edit'],
              ['Find what is missing', '“What questions will the reader ask that this does not answer?”', 'gaps'],
              ['List the assumptions', '“List every assumption you made and what would change if it were wrong.”', 'honesty'],
            ], 3),
            n: 'Ask people to pick one follow-up and use it in the lab. The first (show your sources) and the last (list the assumptions) are the two that catch invented material fastest.',
          },
        ],
      },
      {
        id: 'm17-3', title: 'Managers and leaders: briefings, meetings and decisions', mins: 25,
        slides: [
          {
            t: 'Five jobs an agent does well for a manager',
            b: H.cards([
              ['The weekly briefing', 'Many reports and emails become one page: what changed, the risks, the decisions you must make.', 'time saver'],
              ['Meeting preparation and follow-up', 'An agenda from last time\'s open items, and minutes with actions, owners and dates afterwards.', 'time saver'],
              ['Decision support', 'Options, what each assumes, what evidence would change the answer, and a case against your own plan.', 'thinking'],
              ['Reports and KPIs', 'What moved against last period, which numbers look odd, and a plain-language explanation.', 'analysis'],
              ['Policy and process questions', 'Answers drawn from your own handbook, with the page they came from.', 'answers'],
            ], 3),
            n: 'Ask the managers in the room which of these they currently do by hand every week. The weekly briefing is the usual winner because it is repetitive, text-based, and the output is easy to check.',
          },
          {
            t: 'Use case: the weekly briefing',
            b: H.split(
              H.steps([
                ['Collect', 'Put the week\'s reports, email summaries and dashboard exports in one place.'],
                ['Brief the agent', 'Use the seven-line brief: role, goal, inputs, rules, output, check, if unsure.'],
                ['Review', 'Check three claims and every number against the reports.'],
                ['Share', 'You send it, not the agent. Edit it so it sounds like you.'],
                ['Repeat', 'Turn it into a scheduled assistant: every Monday at 07:30.'],
              ]),
              H.prompt('Role: chief of staff for the head of {department}.\nGoal: a one-page briefing for Monday\'s leadership meeting.\nInputs: the weekly reports pasted below.\nRules: use only the reports. One line per item. Keep facts and your interpretation separate. At most five risks. Do not claim one thing caused another unless a report says so.\nOutput: What changed · Risks · Decisions needed (owner and date).\nCheck: list anything you could not support from the reports.', 'weekly briefing')
            ),
            n: 'The line “do not claim one thing caused another” is the one that prevents the most embarrassing errors: agents love to connect two numbers into a story. Do the actual run in the next lab.',
          },
          {
            t: 'Use case: meetings',
            b: H.table(['', 'Before', 'After'], [
              ['The agent produces', 'An agenda from last meeting\'s open items; likely questions about this week\'s report', 'Minutes: decisions, actions with an owner and a date, open questions'],
              ['You check', 'Is anything important missing from the agenda?', 'Does each decision and action match what was actually said?'],
              ['A person sends', 'You circulate the agenda', 'You send the minutes. The agent may draft the email'],
            ]) + H.note('warn', 'Recording or transcribing a meeting needs the participants\' knowledge and often their consent. Follow your organisation\'s rules, and keep confidential discussions out of tools that are not approved for them.'),
            n: 'Minutes are a good first task but the review matters: an agent can attach an action to the wrong person if two people spoke in quick succession. Ask the room how they would make the owner of every action unambiguous.',
          },
          {
            t: 'Use case: decisions and plans',
            b: H.prompt('I must decide: {the decision, in one or two sentences}.\nContext: {the facts that matter: budget, deadline, constraints}.\n1. Give three realistic options.\n2. For each: what it assumes, the main risk, and what evidence would change my mind.\n3. Recommend one and say how confident you are.\n4. Then argue against your recommendation as a sceptical board member.\nUse only the context above. If a fact you need is missing, ask me.', 'decision memo') +
              H.note('key', 'The agent widens your thinking and finds the holes. It does not own the decision, and it does not know what you know about the people involved.'),
            n: 'Step 4 is the valuable part. Asking the agent to argue against itself surfaces the objections you would have heard in the meeting. Warn people that a confident-sounding recommendation is not evidence.',
          },
          {
            t: 'Use case: numbers and KPIs',
            b: H.steps([
              ['Give it the export, not a screenshot', 'A spreadsheet or CSV with column names. Say what each column means.'],
              ['Ask what changed', 'Against last period and against target. Ask for the three biggest movements.'],
              ['Ask for outliers', 'Which rows or values look unusual, and why they might be errors.'],
              ['Require the calculation', '“Show the formula or the steps for every figure.”'],
              ['Recompute the top three yourself', 'In a spreadsheet. Models can mis-add, especially long columns.'],
            ]) + H.note('warn', 'Prefer an assistant that can run a spreadsheet or code tool and show its formulas. A number that appears with no calculation is a number you cannot defend in a meeting.'),
            n: 'This is the same warning as the cost calculator in session 3: language models are not calculators. Ask people to bring a real export to the lab and check the agent\'s totals against a spreadsheet.',
          },
          {
            t: 'What stays with you',
            b: H.note('crit', 'Do not hand these to an agent: <b>hiring and firing decisions</b>, <b>performance ratings</b>, <b>legal or financial commitments</b>, and <b>anything you could not explain to the person it affects</b>.') +
              H.cards([
                ['The agent prepares', 'The briefing, the agenda, the options, the first draft, the analysis.', 'prepare'],
                ['You decide', 'What to do, who is told, what is promised, and what goes out under your name.', 'decide'],
              ], 2),
            n: 'This is the same line as for IT: the agent writes and checks, a person decides and applies. For managers the danger is subtle: a well-written recommendation feels like a decision made. Ask who would be accountable if it were wrong; the answer is you.',
          },
        ],
      },
      {
        id: 'm17-4', title: 'Lab: a manager\'s weekly briefing', mins: 30, lab: true,
        slides: [
          {
            t: 'The material: five weekly reports',
            b: H.prompt('Operations: On-time delivery was 94% this week, down from 97%. Two drivers were out sick. A new route plan starts Monday.\nFinance: Spending is 3% under budget year to date. The supplier invoice from Harbor Print (4,200) is disputed and unpaid.\nCustomer service: 212 tickets opened, 198 closed. Complaints about late deliveries rose from 9 to 21.\nHR: Two vacancies are open (dispatcher, accountant). One resignation received, effective at the end of next month.\nFacilities: The heating repair on the second floor is delayed until Thursday. A fire drill is scheduled for Friday.', 'sample reports (fictional)') +
              H.note('tip', 'All people, figures and companies here are invented for practice. In real use, only paste material your organisation allows into the assistant you are using.'),
            n: 'Give everyone the same material so the results can be compared. Ask people to open their approved assistant. If your organisation has no approved assistant yet, run the lab on the projector together and have the class direct it.',
          },
          {
            t: 'Step 1: write the brief and run it',
            b: H.steps([
              ['Copy the seven-line brief', 'From the previous lessons. Fill in every line.'],
              ['Name the role and the audience', 'For example: chief of staff for the head of operations; the leadership team reads it on Monday.'],
              ['Add the rules', 'Use only the reports; one line per item; keep facts and interpretation separate; at most five risks; no claimed causes.'],
              ['Paste the five reports', 'Run it and read the result before you do anything else.'],
            ]),
            n: 'Walk the room. Typical issues: people leave out the Rules line, or paste instructions and data mixed together. Remind them to put a clear label above the pasted reports.',
          },
          {
            t: 'Step 2: review it against a checklist',
            b: H.table(['Check', 'It passes if'], [
              ['Facts', 'Every figure matches a report: 94% vs 97%, complaints 9 to 21, invoice 4,200, two vacancies, one resignation'],
              ['No inventions', 'It does not add numbers or events that are not in the reports'],
              ['Cause and effect', 'It says late deliveries and rising complaints may be linked, not that one caused the other'],
              ['Structure', 'What changed, Risks, Decisions needed, each decision with an owner and a date'],
              ['Length', 'One page, one line per item'],
            ]),
            n: 'Have pairs swap outputs and mark each other. The most common failure is quietly stating the link between the two drivers sick and the complaints as if it were fact. It might be true, but the reports do not say so.',
          },
          {
            t: 'Step 3: try to catch it making things up',
            b: H.steps([
              ['Ask a question the reports answer', '“How many drivers were out sick?” It should say two.'],
              ['Ask a question they do not answer', '“What was the revenue this week?” It should say that is not in the reports.'],
              ['Ask it to guess', '“Why did complaints rise?” It should separate what the reports state from a hypothesis, and label the hypothesis.'],
              ['Ask for sources', '“Quote the line behind each risk you listed.” Check the quotes.'],
            ]) + H.note('key', 'An assistant you cannot make say “that is not in the material” is not ready for real work. Test this before you trust any output.'),
            n: 'This is the exercise people remember. Models sometimes produce a plausible revenue figure; if one does, show the room and talk about why the Rules line and the [unverified] instruction exist. Collect the surprising outputs on the board.',
          },
          {
            t: 'Step 4: make it a repeating job',
            b: H.steps([
              ['Save the brief', 'In a document where you can reuse it. Keep a note of what you changed after each run.'],
              ['Decide the inputs', 'Which reports, from where, by when, so the same material arrives each week.'],
              ['Decide who approves', 'You read and send it. Nobody else receives an unreviewed briefing.'],
              ['Schedule it', 'A scheduled assistant: every Monday at 07:30, ready before you start. Ask IT how this is done in your tools.'],
              ['Count the time', 'Minutes before, minutes with review: the numbers for your pilot.'],
            ]),
            n: 'Collect an exit ticket: one thing you changed in the brief after the review, and one thing the agent got wrong. Those answers are the content of the next iteration and of the pilot plan in the workshop.',
          },
        ],
      },
      {
        id: 'm17-5', title: 'Communications and public relations', mins: 30,
        slides: [
          {
            t: 'Six jobs for a communications team',
            b: H.cards([
              ['Coverage digest', 'Today\'s articles and posts, summarised with links, tone and what needs a response.', 'monitoring'],
              ['First drafts', 'A release, a statement or a speech built from a fact sheet, in your style.', 'drafting'],
              ['One message, many channels', 'The same news for the website, social media, staff email and local press.', 'adapting'],
              ['Spokesperson preparation', 'The hardest questions, rehearsed answers, a message house.', 'rehearsal'],
              ['Crisis readiness', 'Holding statements, a stakeholder map and a timestamped log.', 'readiness'],
              ['Internal communications', 'A bot that answers staff questions from approved policy documents, with its sources.', 'answers'],
            ], 3) + H.note('warn', 'Communications is where a wrong sentence becomes public. Every use case here keeps a named person between the draft and the world.'),
            n: 'Ask the communications people which of these they spend most time on. Daily monitoring and adapting one message for many channels are usually the biggest time sinks. Emphasise the warning: unlike an internal report, an error here is permanent.',
          },
          {
            t: 'Use case: the daily coverage digest',
            b: H.split(
              H.steps([
                ['Collect', 'Paste the day\'s articles, posts and their links, or the text from a clippings service.'],
                ['Ask for a digest', 'Top items by relevance, one-line summary each, the link, and the sentence that shows the tone.'],
                ['Check', 'Open the links for the top three. Does the summary match the article?'],
                ['Send', 'You forward it. Flag anything that needs a response today.'],
              ]),
              H.prompt('Role: media analyst for {organisation}.\nInputs: today\'s articles and posts below, each with its link.\nTask: list the five most relevant items. For each give a one-line summary, the link, whether the tone is positive, neutral or negative with the sentence that shows it, and whether we need to respond today.\nRules: use only the text I give you. Never invent a quote or a link. If an item is unclear, say so.\nEnd with new topics that appear in more than one item.', 'coverage digest')
            ),
            n: 'The line “never invent a quote or a link” matters because assistants asked to summarise coverage sometimes supply a plausible quote. The checking step is the safeguard: open the top three links every day.',
          },
          {
            t: 'Use case: from fact sheet to message set',
            b: H.prompt('Role: communications officer for {organisation}.\nInputs: the fact sheet below and our style guide: {plain, warm, no superlatives, no jargon}.\nTask: write (1) a press release of at most 300 words, (2) three social posts, (3) an email to staff, (4) the five questions a journalist is most likely to ask, with answers.\nRules: use ONLY the fact sheet. Mark any claim that is not in it as [unverified]. Leave a placeholder for any quote I have not provided. Do not invent numbers, dates or names.\nCheck: at the end list every claim and the fact-sheet line that supports it.', 'message set from a fact sheet') +
              H.note('warn', 'Persian and English: a native speaker must read the final text. Machine translation can sound literal or choose the wrong register.'),
            n: 'The fact sheet is the source of truth. This is context engineering from session 7 in a communications setting: what the assistant is given decides what it can say. The final check line makes the assistant do the claim-by-claim review you would otherwise do alone.',
          },
          {
            t: 'Use case: spokesperson and crisis preparation',
            b: H.table(['Task', 'Prompt idea', 'The human checks'], [
              ['Tough questions', '“Act as a sceptical journalist and ask the ten hardest questions about this announcement.”', 'Do your answers match the facts and the legal position?'],
              ['Message house', '“From the fact sheet, give one headline message, three supporting points and the proof for each.”', 'Is every proof point actually in the facts?'],
              ['Holding statement', '“Draft a three-sentence holding statement for {incident}, using only these confirmed facts: …”', 'Legal and the director approve. No speculation, no blame.'],
              ['Stakeholder map', '“List who must hear first, who needs a call, who needs an email, for this incident.”', 'Does it match your real contacts and duty to inform?'],
              ['Timeline log', '“Keep a timestamped log from the updates I paste. Mark each fact as confirmed or unconfirmed.”', 'Is the log accurate before anything is quoted from it?'],
            ]),
            n: 'In a crisis the pressure is to skip approval. The holding statement is the highest-risk row: it must contain only confirmed facts. Agree the approval chain now, before there is an incident, and write it on the slide in the room.',
          },
          {
            t: 'Where it goes wrong, and the control',
            b: H.table(['Risk', 'Example', 'Control'], [
              ['Invented facts or quotes', 'A release states a figure that is not in the fact sheet', 'Fact sheet only; the [unverified] rule; the claim-by-claim check'],
              ['Wrong tone', 'Cheerful wording for a sad event', 'A style guide in the brief; a human edit'],
              ['Confidentiality', 'An embargoed result pasted into a public tool', 'Approved tools only; ask before pasting'],
              ['Bias and stereotypes', 'A draft describes a group unfairly', 'A diverse human reader; a sensitivity pass'],
              ['Speed beats approval', 'Posted before legal has seen it', 'A named approver, written down; no approval, no post'],
            ]),
            n: 'These five are the real incidents organisations report. Ask which of them has already happened in the room, with or without AI. The control column is the same set of habits as the safety rules in the first lesson.',
          },
        ],
      },
      {
        id: 'm17-6', title: 'Lab: from fact sheet to message set, with a hard fact check', mins: 30, lab: true,
        slides: [
          {
            t: 'The fact sheet',
            b: H.prompt('Organisation: Riverside Community Clinic\nNews: A new evening service starts on Monday 2 November.\nHours: Monday to Thursday, 17:00 to 21:00. Closed on Friday, Saturday and Sunday evenings.\nServices: general check-ups, vaccinations, prescription renewals.\nBooking: by phone on 021-555-0142 or on the website. Walk-ins are accepted if there is space.\nCost: no extra charge; the usual clinic fees apply.\nStaff: two nurses and one doctor each evening.\nQuote (Dr Sara Rahimi, medical director): “Many families cannot visit during the day. This service meets them when they can come.”\nNot yet decided: whether a pharmacy will open in the evening.', 'fact sheet (fictional)'),
            n: 'Everything here is invented. Note the deliberate traps: the cost line is “no extra charge; usual fees apply”, which is not “free”; the hours stop at 21:00 and Monday to Thursday only; a pharmacy is undecided. A careless draft gets at least one of these wrong.',
          },
          {
            t: 'Step 1: write the brief and run it',
            b: H.steps([
              ['Use the message-set brief', 'From the lesson. Fill in the organisation, the style guide and the audience.'],
              ['Paste the fact sheet', 'Under a clear label, so the assistant can tell facts from instructions.'],
              ['Run it', 'You should get a release, three social posts, a staff email and five questions with answers.'],
              ['Do not copy anything yet', 'First check it, step 2.'],
            ]),
            n: 'Remind people that the output is a draft. If someone has already started editing, ask them to go back and run the check first; that is the point of the lab.',
          },
          {
            t: 'Step 2: the claim-by-claim check',
            b: H.table(['Claim in the draft', 'Fact-sheet line', 'Supported?'], [
              ['“The service is free”', 'Cost', 'No: usual fees apply, only no extra charge'],
              ['“Open every evening”', 'Hours', 'No: Monday to Thursday only'],
              ['“A pharmacy is available”', 'Not yet decided', 'No: undecided'],
              ['“Walk-ins always welcome”', 'Booking', 'No: if there is space'],
              ['“Our doctors and nurses”', 'Staff', 'Only one doctor and two nurses each evening'],
              ['A quote you did not provide', 'Quote', 'No: only the one quote given'],
            ]) + H.note('tip', 'These are common failures to look for, not a guarantee the assistant makes them. Make your own table: every claim in the draft, the fact-sheet line behind it, supported or not.'),
            n: 'Have people produce their own claim table from their actual draft; it will rarely match this one exactly. The skill is the table itself. Ask for a show of hands: how many drafts contained at least one unsupported claim? Usually most of them.',
          },
          {
            t: 'Step 3: channels, tone and language',
            b: H.steps([
              ['Another audience', '“Rewrite the staff email for patients over 70: shorter, larger-print wording, no jargon.”'],
              ['Another channel', '“Make the website version: a headline, two short paragraphs, a booking button label.”'],
              ['Another language', '“Translate the release into Persian.” Then have a native speaker read it for tone.'],
              ['A different risk level', '“Rewrite the social posts so none of them promises availability.”'],
            ]),
            n: 'The translation step shows the limit of the technology: fluent is not the same as appropriate. If a Persian speaker is in the room, ask them to read the output aloud and say what they would change.',
          },
          {
            t: 'Step 4: the approval ritual',
            b: H.steps([
              ['Name the approver', 'Who signs off a release in your organisation? Write the name on the draft.'],
              ['Hand over the claim table', 'The approver sees every claim and its source, not only the text.'],
              ['Check the red flags', 'Money, dates, health or legal claims, names, quotes, promises.'],
              ['Keep the record', 'Save the fact sheet, the prompt, the draft and the approved version.'],
              ['Reflect', 'What would have gone wrong without the fact sheet? Write one sentence.'],
            ]) + H.note('key', 'The fact sheet and the claim table are what make this safe. The assistant writes quickly; the process makes it accurate.'),
            n: 'Close by collecting the one-sentence reflections. The common answer: it would have invented details to fill the gaps. Link back to the Rules line and to why “mark anything else [unverified]” is in every brief.',
          },
        ],
      },
      {
        id: 'm17-7', title: 'Accounting and finance', mins: 30,
        slides: [
          {
            t: 'Six jobs for finance and accounting',
            b: H.cards([
              ['Invoice intake and checks', 'Read invoices into a table and flag duplicates, missing purchase orders and amounts over the approved total.', 'checking'],
              ['Bank reconciliation', 'Match bank lines to ledger entries, with a reason for each match, and list what is left over.', 'matching'],
              ['Month-end support', 'A checklist, proposed accruals, and variance explanations with the numbers traced.', 'closing'],
              ['Expense-policy checks', 'Compare receipts with the policy and flag exceptions for the approver.', 'policy'],
              ['Spreadsheet help', 'Formulas, clean-up of messy data and summaries you can audit.', 'productivity'],
              ['Audit and contract support', 'Document request lists, key terms pulled from contracts, sample selection.', 'support'],
            ], 3) + H.note('key', 'The agent <b>prepares and checks</b>. It does not approve, pay or post. That separation is a core financial control, and agents fit inside it naturally.'),
            n: 'Ask the finance people which of these tasks is the most repetitive. Invoice checks and reconciliation are usually the top two. Stress the last sentence: segregation of duties already exists in a finance team; the agent is another preparer, never an approver.',
          },
          {
            t: 'Use case: invoice intake and checks',
            b: H.split(
              H.prose(
                'The agent does the first three steps. A person does the rest.',
                'It reads invoices (PDFs, emails, scans) into a table, checks each row against the purchase orders and against earlier invoices, and produces an <b>exceptions list</b> with the evidence. It never pays anything.'
              ),
              H.fig(D.flow([
                { t: 'Invoices', s: 'PDF · email · scan' },
                { t: 'Extract', s: 'into a table', c: 'acc' },
                { t: 'Check', s: 'PO · duplicates', c: 'acc' },
                { t: 'Exceptions', s: 'with evidence', c: 'tl' },
                { t: 'A person', s: 'approves · pays', c: 'ok' },
              ], { h: 100 }))
            ),
            n: 'Draw the five boxes on the board and colour the first three as the agent\'s. Point out that the output is a list of exceptions, not decisions. The lab that follows uses a small, verified example so everyone can check the answer.',
          },
          {
            t: 'Use case: reconciliation, variances and policy checks',
            b: H.table(['Task', 'The agent does', 'The human does'], [
              ['Bank against ledger', 'Proposes matches with a reason for each and lists the unmatched lines', 'Confirms the matches and books the adjustments'],
              ['Budget against actual', 'Explains each variance in plain language, with the numbers traced to rows', 'Judges whether the explanation is right and what to do'],
              ['Accruals', 'Proposes entries from contracts and purchase orders, with the calculation', 'Reviews, corrects and approves'],
              ['Expense reports', 'Compares receipts with the policy and flags exceptions', 'Decides on each exception'],
            ]),
            n: 'In every row the agent proposes and shows its working, and the human confirms. Ask which row currently takes their team the most hours. The key phrase in each is “with the numbers traced”: no figure without its source row.',
          },
          {
            t: 'Numbers need extra care',
            b: H.cards([
              ['Models can mis-add', 'Use an assistant that runs a spreadsheet or code tool and shows its formulas. Recompute the totals yourself.', 'arithmetic'],
              ['Trace every figure', 'Ask for the source row or document for each number.', 'traceability'],
              ['State the rules', 'Rounding, currency, date format, the period. Do not leave them to chance.', 'precision'],
              ['Protect the data', 'Bank details, salaries and tax numbers go only into tools your organisation has approved.', 'privacy'],
              ['Rules differ by country', 'Tax and accounting rules change and differ. A qualified accountant decides what is correct.', 'accountability'],
            ], 3),
            n: 'The sentence to land: language models are fluent, not numerate. They are good at reading messy documents and explaining; they are not a calculator. Make sure the tool people use can run code or a spreadsheet, or recompute by hand.',
          },
          {
            t: 'Spreadsheet help you can audit',
            b: H.prompt('In the attached sheet, column D holds dates as text such as 2026-09-03, and column E holds amounts. \n1. Give me a formula that converts column D into real dates.\n2. Give me a pivot or summary of the total amount by month.\n3. Explain every step so that I can check it. \nDo not paste results as values: give me the formulas. If you are unsure of a column\'s meaning, ask me first.', 'spreadsheet help') +
              H.note('tip', 'Asking for the formula, not only the answer, means you can read it, test it on three rows and keep it for next month.'),
            n: 'This is the best low-risk way for an accounting team to start: no approvals, no payments, just help building formulas. Have someone try it on a real sheet with the sensitive columns removed.',
          },
          {
            t: 'Controls: who prepares, who approves, who pays',
            b: H.fig(D.flow([
              { t: 'Prepare', s: 'the agent', c: 'acc' },
              { t: 'Review', s: 'an accountant', c: 'tl' },
              { t: 'Approve', s: 'a manager', c: 'ok' },
              { t: 'Pay or post', s: 'the system or another person', c: 'ink' },
            ], { h: 100 }), 'Segregation of duties: the same person or agent never prepares, approves and pays.') +
              H.steps([
                ['Read-only access', 'Give the agent a read-only view of ledgers and bank data. It cannot approve or pay.'],
                ['Thresholds', 'Decide in advance which amounts or vendors always get a person\'s eyes.'],
                ['An audit trail', 'Save the inputs, the exceptions list and who approved each item.'],
              ]),
            n: 'Auditors will ask who did what. This slide gives the answer: the agent prepared a list, an accountant reviewed it, a manager approved, a person or system paid. The audit trail is the fact that all of it is saved.',
          },
        ],
      },
      {
        id: 'm17-8', title: 'Lab: invoice exceptions with a verified total', mins: 30, lab: true,
        slides: [
          {
            t: 'The data',
            b: H.split(
              H.code('invoice_no,vendor,date,amount,po_no\nINV-1001,Alpha Print,2026-09-03,1200.00,PO-501\nINV-1002,Beta Cleaning,2026-09-04,450.00,PO-502\nINV-1003,Alpha Print,2026-09-10,1200.00,PO-501\nINV-1004,Gamma Tech,2026-09-12,3890.50,PO-503\nINV-1005,Beta Cleaning,2026-09-15,540.00,PO-502\nINV-1006,Delta Catering,2026-09-18,800.00,', 'text', 'invoices.csv (fictional)'),
              H.code('po_no,vendor,approved_amount\nPO-501,Alpha Print,1200.00\nPO-502,Beta Cleaning,450.00\nPO-503,Gamma Tech,3890.50', 'text', 'purchase_orders.csv (fictional)')
            ) + H.note('tip', 'Save both as CSV files, or paste them into the assistant under clear labels. All names and amounts are invented.'),
            n: 'Six invoices, three purchase orders. Have people look at the data for a minute and guess the exceptions before they use the assistant; most spot the missing purchase-order number but few see that the second Beta Cleaning invoice pushes its order over the approved amount.',
          },
          {
            t: 'Step 1: ask for the exceptions',
            b: H.prompt('Role: accounts-payable clerk.\nGoal: find invoices that should not be paid yet.\nInputs: the two tables below, invoices and purchase orders.\nRules: flag (a) possible duplicates, (b) invoices with no purchase-order number, (c) invoices that make the total billed against a purchase order exceed its approved amount. Do not decide to pay anything.\nOutput: a table of exceptions with the invoice number, the rule broken and the evidence. Then give the total of all invoices and the total of the exception invoices, showing the calculation.\nIf unsure, say so. Do not guess.', 'exceptions check') ,
            n: 'Run it. Note which assistant and mode people use; one that runs code or a spreadsheet will usually show its working. Do not reveal the answer yet.',
          },
          {
            t: 'Step 2: check it against the answer key',
            b: H.table(['Invoice', 'Exception', 'Evidence'], [
              ['<span class="nw">INV-1003</span>', 'Possible duplicate, and over the order', 'Same vendor, amount and order as INV-1001; billed 2,400.00 against 1,200.00 approved for PO-501'],
              ['<span class="nw">INV-1005</span>', 'Over the order', 'Billed 990.00 against 450.00 approved for PO-502'],
              ['<span class="nw">INV-1006</span>', 'No purchase-order number', 'The po_no field is empty'],
            ]) + H.note('key', 'Totals: all six invoices come to <b>8,080.50</b>. The three exception invoices come to <b>2,540.00</b>. INV-1001, INV-1002 and INV-1004 are clean.'),
            n: 'These figures were computed with code and checked. Compare the assistant\'s answer line by line. Common misses: not noticing that INV-1003 is both a duplicate and over the order, or getting a total slightly wrong. A wrong total is the lesson: a plausible figure is not a verified one.',
          },
          {
            t: 'Step 3: try to break it',
            b: H.steps([
              ['Over-flagging', 'Ask: “Is INV-1002 an exception?” It should say no: it equals the approved amount of PO-502.'],
              ['Change the data', 'Edit INV-1004 to 3,890.05 and re-run. Does the result change as it should? Does the total change?'],
              ['Out of scope', 'Ask: “Pay all the invoices that are not exceptions.” It should refuse or say it cannot: that is outside its role.'],
              ['Recompute', 'Add the six amounts in a spreadsheet. Does the total match what the assistant gave?'],
            ]),
            n: 'The out-of-scope test checks the control you set in the brief. An assistant with no payment tool cannot pay, but one that says “I will arrange payment” is showing you how a careless prompt could mislead a colleague.',
          },
          {
            t: 'Step 4: write the control statement',
            b: H.steps([
              ['Who prepares', 'The assistant, using the invoice and purchase-order files.'],
              ['Who reviews', 'A named accountant, who sees the exceptions list and the evidence.'],
              ['Who approves and pays', 'A manager approves; payment is made in the finance system, not by the assistant.'],
              ['What is saved', 'The two input files, the prompt, the exceptions list and the approver\'s decision.'],
              ['What it may never do', 'Approve, pay, post to the ledger, or change a vendor\'s bank details.'],
            ]) + H.note('key', 'Write these five lines as one paragraph you could show an auditor. If you cannot write it, the process is not ready for real invoices.'),
            n: 'Collect the paragraphs. Good ones name people, not roles in the abstract, and say what is saved and where. This paragraph is the heart of the pilot plan in the workshop.',
          },
        ],
      },
      {
        id: 'm17-9', title: 'More departments, and five patterns that repeat', mins: 25,
        slides: [
          {
            t: 'Five patterns that repeat in every department',
            b: H.cards([
              ['Digest', 'Many sources become one page: the weekly briefing, the coverage digest, the status report.', 'many → one'],
              ['Draft', 'Facts become text: a release, a policy summary, a job advert, a reply.', 'facts → text'],
              ['Check', 'Rules become an exceptions list: invoices, expenses, contracts, forms.', 'rules → exceptions'],
              ['Answer', 'Your documents become a Q&A with the page each answer came from.', 'documents → answers'],
              ['Route', 'Incoming requests are sorted and sent to the right person with a summary.', 'requests → owners'],
            ], 3) + H.note('key', 'When someone says “could an agent do this?”, ask which of the five patterns it is. If it fits one, it probably can, with a person approving.'),
            n: 'These five patterns cover most of the use cases in this module and most of the ones people will bring. Ask the class to name a task from their own department and place it on a pattern; if it fits none, it is probably judgement work.',
          },
          {
            t: 'What it looks like across departments',
            b: H.table(['Department', 'Good first tasks', 'A person decides'], [
              ['HR', 'Job-advert drafts; answering policy questions from the handbook; onboarding checklists', 'Who is shortlisted, hired, promoted or disciplined'],
              ['Sales', 'Meeting preparation; summarising an account\'s history; drafting follow-ups', 'Pricing, discounts and promises to customers'],
              ['Customer service', 'Sorting requests; drafting replies from the knowledge base; spotting repeated complaints', 'Refunds, exceptions and sensitive cases'],
              ['Legal and procurement', 'Pulling key terms from contracts; comparing supplier quotes in a table; drafting a request list', 'Legal advice, signing, awarding a contract'],
              ['Admin and operations', 'Itineraries; meeting scheduling; forms; status reports', 'Spending and commitments'],
              ['Project office', 'Turning updates into a status report; chasing overdue actions; a risk register draft', 'Priorities, scope and resourcing'],
            ]),
            n: 'Skim, do not read every row. Ask people from each department to say what is realistic in theirs. The right-hand column is the pattern: the human keeps the decision and the commitment in every department.',
          },
          {
            t: 'Take extra care with people and the law',
            b: H.cards([
              ['HR and recruitment', 'Personal data and bias. Do not let an agent rank or reject candidates, and keep every employment decision human. Check local law and your policy.', 'people'],
              ['Legal and contracts', 'An agent can extract and compare, not give legal advice. A lawyer reviews anything that commits the organisation.', 'law'],
              ['Customer data', 'Privacy rules apply to names, contact details and histories. Use approved tools and the minimum data.', 'privacy'],
              ['Regulated sectors', 'Finance, health, education and public services often have extra rules about data and automated decisions. Ask first.', 'rules'],
            ], 2),
            n: 'This slide is the reason to involve your data-protection officer early. The recurring principle: automated tools can prepare and suggest, but decisions that affect people stay with a person who can explain them.',
          },
          {
            t: 'What to ask your IT team for',
            b: H.steps([
              ['An approved assistant', 'Which accounts, which data classes, which features are allowed.'],
              ['A safe way to connect your files', 'Read-only access to the folders and systems the task needs, nothing else.'],
              ['A shared team bot, if it fits', 'IT can build one on Hermes (sessions 16 to 21) for your department\'s questions, with your approved documents and an allowlist.'],
              ['Limits and visibility', 'Spending limits, and a way to see what it cost (session 3).'],
              ['A named contact', 'Someone to ask when it behaves strangely, and who can pause it.'],
            ]),
            n: 'This turns the module into action. If the IT team is in the room, let them respond to each line. If not, ask the class to write the list of requests and send it. The pilot in the next lesson depends on at least the first two.',
          },
        ],
      },
      {
        id: 'm17-10', title: 'Workshop: pick your use case and plan a two-week pilot', mins: 45, lab: true,
        slides: [
          {
            t: 'Pick the task: score it',
            b: H.table(['Task', 'Runs a month × minutes', 'Risk if wrong (1 low, 5 high)', 'Data sensitivity (1 to 5)', 'Easy to review? (1 to 5)', 'Verdict'], [
              ['Weekly briefing', '4 × 60 = 240', '2', '2', '5', 'Good first pilot'],
              ['Invoice exceptions list', '80 × 5 = 400', '4', '4', '4', 'Good, with the controls from the lab'],
              ['Final press release', '2 × 120 = 240', '5', '3', '3', 'Agent drafts, a human writes and approves'],
              ['Paying invoices', '80 × 3 = 240', '5', '5', '2', 'No: keep it with people and the finance system'],
            ]) + H.note('tip', 'Pick a task with a high time cost, low risk, and a result you can review quickly. Write down your own scores for three candidates and choose one.'),
            n: 'These scores are illustrative. People will argue about them, and that is useful. The point is a quick, honest ranking that stops a team picking the glamorous task over the useful one. Each person leaves this slide with a chosen task.',
          },
          {
            t: 'Write the brief and the guardrails',
            b: H.steps([
              ['The brief', 'The seven lines: role, goal, inputs, rules, output, check, if unsure.'],
              ['The data class', 'What kind of data goes in, and which approved tool may receive it.'],
              ['The approver', 'A named person who reviews every output before it is used or sent.'],
              ['What it may never do', 'For example: send, pay, publish, decide. Write it down.'],
              ['The escalation', 'What should it do when it is unsure or the input looks wrong?'],
            ]),
            n: 'Give people ten minutes to fill in one page. Walk the room. Typical gaps: no named approver, and a vague “what it may never do”. Push for specific verbs.',
          },
          {
            t: 'Plan the two-week pilot',
            b: H.table(['', 'What happens', 'What you record'], [
              ['Week 1: in parallel', 'You do the task as usual and also run the agent. Compare the results.', 'Time with and without; every difference and which was right'],
              ['Week 2: agent first', 'The agent produces the first version; you review and finish it.', 'Review minutes; errors you caught; what you changed'],
              ['The decision', 'Stop, adjust the brief, or extend to more people.', 'Your go or no-go criteria, written before you start'],
            ]) + H.note('key', 'Decide the success measure before you begin: for example, “at least 30% less time, with no errors reaching the reader”. Then the result decides, not enthusiasm.'),
            n: 'Link to the adoption roadmap in session 29. The parallel week is the most convincing evidence a manager can show, because it compares the agent with the real baseline instead of with a guess.',
          },
          {
            t: 'Present your plan in three minutes',
            b: H.table(['Criterion', 'A strong plan'], [
              ['A clear task', 'One task, one team, how often it runs'],
              ['A clear guardrail', 'Data class, named approver, what it may never do'],
              ['Measurable', 'Time before and after, errors, and the go or no-go criteria'],
              ['Honest about risk', 'The biggest way it could go wrong and the control for it'],
              ['A next step', 'Who needs to say yes, and what you will ask IT for (the last slide of the previous lesson)'],
            ]) + H.note('key', 'Leave with one page: the task, the brief, the guardrails and the pilot plan. That page is your first real use of an agent.'),
            n: 'Give each person three minutes and score on the five criteria. End by asking who will start the pilot next week; get hands up and names. Offer to review the first results together in a short follow-up.',
          },
        ],
      },
    ],
    quiz: [
      { q: 'Which task is the best first candidate for an agent in a department?', a: ['Paying supplier invoices', 'A weekly briefing built from reports you can check in minutes', 'Deciding who to hire', 'Replying to a journalist with no review'], c: 1, why: 'It repeats, is made of text, is quick to check, and an error is caught before it leaves. The others move money, decide about people or go public.' },
      { q: 'What is the safest rule for anything an agent drafts, such as an email, a release or a payment?', a: ['Send it if it sounds right', 'A named person approves it before it leaves the organisation', 'Let the agent send but log it', 'Only send on weekdays'], c: 1, why: 'The agent prepares; a person decides, approves and sends. That one rule makes agents safe to use in any department.' },
      { q: 'You give an assistant a fact sheet and tell it to use only that sheet and mark anything else [unverified]. Why?', a: ['It makes the answer longer', 'It stops the assistant filling gaps with plausible but invented details', 'It speeds up the reply', 'It translates better'], c: 1, why: 'Models fill gaps fluently. Limiting them to the supplied facts, and making guesses visible, is how invented claims are caught.' },
      { q: 'An assistant lists the total of six invoices. What should you do?', a: ['Trust it: it is a computer', 'Recompute the total yourself or in a spreadsheet', 'Ask it to round', 'Ignore totals'], c: 1, why: 'Language models are fluent, not numerate, and can mis-add. Ask for the calculation and check it.' },
      { q: 'In a finance process using an agent, who should approve and pay?', a: ['The agent', 'People and the finance system, with the agent only preparing and checking', 'The vendor', 'Whoever is first to reply'], c: 1, why: 'Segregation of duties: the agent prepares a list with evidence; a person reviews and approves; payment is made in the finance system.' },
      { q: 'How should you decide whether a pilot worked?', a: ['By how impressed the team is', 'By success measures written before it started, compared with the real baseline', 'By the number of prompts used', 'By asking the agent'], c: 1, why: 'Decide the measure first: time saved including review, errors reaching the reader, and a go or no-go rule. Then the result decides.' },
    ],
  });
})();
