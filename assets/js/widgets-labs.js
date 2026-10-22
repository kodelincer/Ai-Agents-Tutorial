/* Agent & lab widgets: agent loop simulator, MCP message flow, simulated Hermes terminal,
   SKILL.md builder, Hermes config builder, multi-agent team designer. */
(function () {
  const A = window.ACADEMY, W = A.widgets, esc = A.esc;
  const { uid, fmt } = A.util;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));

  /* ---------------- Agent loop (ReAct) simulator ---------------- */
  const SCEN = {
    intranet: {
      title: 'INC-20931 · “Intranet is down for me” (user at Branch-2)',
      tools: ['lookup_user', 'nslookup', 'ping', 'check_tunnel', 'restart_tunnel*', 'add_work_note', 'escalate'],
      steps: [
        ['thought', 'Before testing anything I need to know who the user is and where they sit.'],
        ['action', 'lookup_user', 'lookup_user(email="s.karimi@acme.local")', '{"site": "Branch-2", "device": "LT-2231", "on_vpn": false}'],
        ['thought', 'Branch-2 reaches HQ services over a site-to-site tunnel. Check name resolution from the branch probe first.'],
        ['action', 'nslookup', 'nslookup("intranet.acme.local", probe="branch2")', 'intranet.acme.local → 10.10.5.20  (answered by 10.0.0.10)'],
        ['action', 'ping', 'ping("10.10.5.20", probe="branch2", count=4)', '4 packets sent, 0 received (100% loss)'],
        ['action', 'ping', 'ping("10.10.5.20", probe="hq", count=4)', '4 packets sent, 4 received, avg 2 ms'],
        ['thought', 'DNS works and the server answers from HQ, so the break is between Branch-2 and HQ. Check the tunnel.'],
        ['action', 'check_tunnel', 'check_tunnel("branch2-hq")', 'state=DOWN since 09:41 · phase-2 rekey failed · 38 users at site'],
        ['thought', 'Restarting the tunnel changes a production firewall. Policy says that needs a human, so I ask.'],
        ['approval', 'restart_tunnel', 'restart_tunnel("branch2-hq")', 'Risk: medium. The 38 users at Branch-2 are already offline.',
          [['action', 'restart_tunnel', 'restart_tunnel("branch2-hq")', 'phase-1 OK · phase-2 established · state=UP'],
            ['action', 'ping', 'ping("10.10.5.20", probe="branch2", count=4)', '4 packets sent, 4 received, avg 11 ms'],
            ['action', 'add_work_note', 'add_work_note("INC-20931", ...)', 'note saved'],
            ['final', 'Resolved. The Branch-2 ↔ HQ tunnel was down after a failed phase-2 rekey. Restarted it with L2 approval and confirmed reachability. Suggested a problem ticket to investigate the rekey failures.']],
          [['thought', 'Not approved. Hand over to network on-call with all the evidence so nobody repeats the diagnosis.'],
            ['action', 'escalate', 'escalate(team="Network L2", ticket="INC-20931", evidence=[...])', 'assigned to Network L2 on-call'],
            ['final', 'Escalated to Network L2 with diagnosis: DNS OK, server up from HQ, tunnel branch2-hq DOWN since 09:41 (phase-2 rekey failed). No changes made.']]],
      ],
    },
    disk: {
      title: 'ALERT · Disk D: on FS-02 is 94% full',
      tools: ['get_disk_usage', 'list_large_files', 'compress_logs', 'delete_file*', 'notify_owner', 'create_ticket'],
      steps: [
        ['action', 'get_disk_usage', 'get_disk_usage(host="FS-02", volume="D:")', '{"size_gb": 2000, "used_gb": 1880, "growth_gb_per_day": 14}'],
        ['thought', 'At 14 GB a day it is full in about 8 days. Find out what grew.'],
        ['action', 'list_large_files', 'list_large_files(host="FS-02", path="D:\\\\", top=5)', 'D:\\Logs\\IIS\\  412 GB (files older than 30 days: 380 GB)\nD:\\Shares\\Public\\win11_23h2.iso  6 GB (owner: m.rahimi)\n…'],
        ['thought', 'Retention policy RET-03 lets me compress IIS logs older than 30 days. That is in my runbook and reversible.'],
        ['action', 'compress_logs', 'compress_logs(path="D:\\\\Logs\\\\IIS", older_than_days=30)', 'compressed 380 GB → 41 GB · freed 339 GB'],
        ['thought', 'The ISO belongs to a user. Deleting user files is not in my runbook, so I ask.'],
        ['approval', 'delete_file', 'delete_file("D:\\\\Shares\\\\Public\\\\win11_23h2.iso")', 'Risk: low, but it is a user file. Not covered by policy RET-03.',
          [['action', 'delete_file', 'delete_file("D:\\\\Shares\\\\Public\\\\win11_23h2.iso")', 'deleted (recycle bin, 30-day restore)'],
            ['final', 'D: is down to 76%. Compressed old IIS logs under RET-03 and deleted an approved 6 GB ISO. Opened a ticket to add IIS log rotation so this does not come back.']],
          [['action', 'notify_owner', 'notify_owner(user="m.rahimi", file="win11_23h2.iso")', 'message sent'],
            ['final', 'D: is down to 77% after compressing old IIS logs under RET-03. Asked the ISO\'s owner to move it. Opened a ticket to add IIS log rotation.']]],
      ],
    },
  };
  Object.assign(SCEN, {
    netdrift: {
      title: 'CRON 02:00 · Nightly config backup found drift on dist-sw-03',
      tools: ['net_backup', 'git_diff', 'net_show', 'netbox_lookup', 'itsm_search_changes', 'create_ticket', 'notify_channel', 'net_config*'],
      steps: [
        ['action', 'net_backup', 'net_backup(group="distribution")', '12/12 devices backed up (read-only account svc-hermes-ro) · 1 device changed: dist-sw-03'],
        ['action', 'git_diff', 'git_diff("configs/dist-sw-03.cfg", since="yesterday")', '+ interface Gi1/0/24\n+  switchport access vlan 999\n+  description TEMP-VENDOR\n- interface Gi1/0/24\n-  shutdown'],
        ['thought', 'An unused port was enabled in VLAN 999. I need to know whether an approved change covers it.'],
        ['action', 'itsm_search_changes', 'itsm_search_changes(ci="dist-sw-03", window="last 24h")', 'no approved change for dist-sw-03 in the last 24 h'],
        ['action', 'net_show', 'net_show("dist-sw-03", "show mac address-table interface Gi1/0/24")', '999  a4:5e:60:12:9c:01  DYNAMIC  Gi1/0/24'],
        ['action', 'netbox_lookup', 'netbox_lookup(mac="a4:5e:60:12:9c:01")', 'not in inventory'],
        ['thought', 'Unapproved change plus an unknown device. Policy: report to network on-call and security. Do not shut the port myself; that is a change and my account is read-only anyway.'],
        ['approval', 'net_config', 'net_config("dist-sw-03", "interface Gi1/0/24 / shutdown")', 'Not allowed by policy tier 3 (production change outside a change window). Hermes asks; the right answer is Deny.',
          [['thought', 'Even if approved here, the device account is read-only, so the command would be rejected by TACACS+. The change belongs in the change process.'],
            ['action', 'create_ticket', 'create_ticket(queue="Network L2", priority="P2", ...)', 'INC-21307 created'],
            ['final', 'Unapproved config change on dist-sw-03 Gi1/0/24 (VLAN 999, unknown MAC). Evidence and diff attached to INC-21307; network on-call and SOC notified. No changes made by the agent.']],
          [['action', 'create_ticket', 'create_ticket(queue="Network L2", priority="P2", summary="Unapproved change on dist-sw-03 Gi1/0/24", evidence=[diff, mac, no CR])', 'INC-21307 created'],
            ['action', 'notify_channel', 'notify_channel("#net-oncall", "INC-21307 …") · notify_channel("#soc", "INC-21307 …")', 'sent'],
            ['final', 'Drift reported: dist-sw-03 Gi1/0/24 enabled in VLAN 999 without a change, unknown device attached. INC-21307 raised for Network L2 and SOC with the diff and MAC evidence. No changes made.']]],
      ],
    },
    web5xx: {
      title: 'ALERT · portal.acme.local 5xx rate 18% (threshold 2%)',
      tools: ['http_probe', 'tail_log', 'journalctl', 'systemctl_status', 'db_ping', 'systemctl_restart*', 'notify_channel'],
      steps: [
        ['action', 'http_probe', 'http_probe("https://portal.acme.local/health", count=5)', '502 502 200 502 502 · avg 3.1 s'],
        ['action', 'tail_log', 'tail_log("/var/log/nginx/portal_error.log", lines=200, grep="upstream")', '148 × "connect() failed (111: Connection refused) while connecting to upstream 127.0.0.1:8081"'],
        ['action', 'systemctl_status', 'systemctl_status("portal-api")', 'active (running) · restarted 9 times in 20 min · Main PID changes'],
        ['action', 'journalctl', 'journalctl("portal-api", since="30 min ago", grep="Error")', 'OutOfMemoryError: Java heap space (×9) · heap max 512m'],
        ['thought', 'The API is crash-looping on heap exhaustion. A restart alone will not help. The fix is a heap or config change, which is a change. Gather evidence and ask for a short-term mitigation.'],
        ['action', 'db_ping', 'db_ping("portal-db")', 'OK 3 ms (rules out the database)'],
        ['approval', 'systemctl_restart', 'systemctl_restart("portal-api")', 'Restarting a production service needs approval (tier 2). It may give ~15 minutes until the heap fills again.',
          [['action', 'systemctl_restart', 'systemctl_restart("portal-api")', 'restarted · /health 200 in 0.4 s'],
            ['action', 'notify_channel', 'notify_channel("#web-oncall", "…")', 'sent'],
            ['final', 'Mitigated: portal-api restarted with approval; 5xx back to 0%. Root cause: Java heap exhaustion (512m) since 10:40 deploy. Drafted a change to raise -Xmx to 1g and asked dev to check the memory leak in release 4.12.']],
          [['action', 'notify_channel', 'notify_channel("#web-oncall", "portal-api OOM crash loop, evidence attached")', 'sent'],
            ['final', 'Diagnosis sent to web on-call: portal-api crash-looping on Java heap exhaustion since the 10:40 deploy; database healthy. No restart performed (denied). Suggested rollback to release 4.11 or a heap increase via change.']]],
      ],
    },
    phish: {
      title: 'REPORT · user forwarded “Your mailbox is 98% full”',
      tools: ['parse_eml', 'check_auth_results', 'url_reputation', 'hash_lookup', 'search_mail_logs', 'draft_block_rule*', 'create_ticket'],
      steps: [
        ['action', 'parse_eml', 'parse_eml("report-55812.eml")', 'From: "IT Support" <it-support@acme-helpdesk.co> · Reply-To: …@mail.ru · 1 URL · no attachments'],
        ['action', 'check_auth_results', 'check_auth_results("report-55812.eml")', 'SPF: fail · DKIM: none · DMARC: fail (lookalike domain acme-helpdesk.co, registered 3 days ago)'],
        ['thought', 'Display name imitates IT, lookalike domain, auth fails. Check the URL by reputation only. Policy: never open it and never upload company content to public scanners.'],
        ['action', 'url_reputation', 'url_reputation("hxxps://acme-helpdesk.co/owa/login")', 'known credential-phishing kit · first seen 2 days ago'],
        ['action', 'search_mail_logs', 'search_mail_logs(sender_domain="acme-helpdesk.co", last="72h")', '41 recipients · 3 clicked (proxy logs)'],
        ['thought', 'Confirmed phishing campaign; 3 users clicked. Blocking the domain is a change to the mail gateway, so it needs approval. Password resets for clickers are handled by the identity team, not by me.'],
        ['approval', 'draft_block_rule', 'apply_block_rule(domain="acme-helpdesk.co", scope="mail + web proxy")', 'Tier 2: security control change. Approve to apply via the security-gateway API.',
          [['action', 'draft_block_rule', 'apply_block_rule(domain="acme-helpdesk.co")', 'blocked on mail gateway and web proxy'],
            ['action', 'create_ticket', 'create_ticket(queue="SOC", priority="P2", ...)', 'SEC-3381 created with IOCs; identity team tasked to reset 3 users'],
            ['final', 'Confirmed phishing (lookalike domain, SPF/DMARC fail, known kit). Domain blocked with approval. 41 recipients, 3 clicks → SEC-3381 with IOCs; identity team resetting the 3 accounts.']],
          [['action', 'create_ticket', 'create_ticket(queue="SOC", priority="P2", iocs=[...], recommended="block domain")', 'SEC-3381 created'],
            ['final', 'Confirmed phishing campaign; 41 recipients, 3 clicks. Block not applied (denied). SEC-3381 holds IOCs and the recommended block for the SOC analyst on duty.']]],
      ],
    },
  });

  /* ---------------- Policy tier game ---------------- */
  const TIERS = [['T0', 'Auto: read / diagnose'], ['T1', 'Auto: low-risk, in runbook'], ['T2', 'Needs human approval'], ['T3', 'Forbidden for agents']];
  const ACTS = {
    network: [
      ['show interfaces counters errors on all access switches', 0, 'Read-only show command through the net-show wrapper with the read-only TACACS account.'],
      ['Nightly backup of running configs to git', 0, 'Read-only; the backup script uses the read-only account and only writes to the configs repo.'],
      ['Clear interface counters on a user access port', 1, 'Low impact and reversible, and listed in the runbook. Some teams still treat it as T2: decide it in the policy, not in the moment.'],
      ['Shut down an access port with an unknown device in VLAN 999', 2, 'A production change. The agent drafts it with evidence; the on-call engineer approves and applies it.'],
      ['Add VLAN 210 to the trunk on core-sw-02', 2, 'A planned change: CR, CAB approval, change window. The agent prepares config, rollback and checks; the pipeline or a human applies.'],
      ['reload / write erase / change AAA or SNMP community', 3, 'Never by an agent. Denied by approvals.deny and by TACACS+ command authorization.'],
    ],
    helpdesk: [
      ['Look up a user’s lockout status and lockout source', 0, 'Read-only queries through the JEA endpoint.'],
      ['Unlock a standard user account after the callback identity check', 1, 'In the runbook; JEA only exposes Unlock-ADAccount, and AD delegation limits it to the Users OU.'],
      ['Reset a user’s password', 2, 'Identity-sensitive. A human verifies identity and approves; never through chat alone.'],
      ['Add a user to a file-share security group', 2, 'Access change. Needs the data owner’s approval in the ticket.'],
      ['Add someone to Domain Admins', 3, 'Never. The agent’s account has no rights on admin groups, and privileged access goes through PAM.'],
      ['Draft a reply to a ticket from the KB', 0, 'Text only. A human or a rule decides whether it is sent.'],
    ],
    datacenter: [
      ['Read hardware health from iDRAC/iLO over Redfish', 0, 'BMC account with the ReadOnly role.'],
      ['Compress IIS logs older than 30 days under policy RET-03', 1, 'Reversible and covered by a written retention policy.'],
      ['Restart a production VM that is hung', 2, 'Service impact. Approval by the on-call engineer.'],
      ['Run a test restore of last night’s backup into the isolated restore lab', 1, 'Writes only to the restore lab. Proves backups work.'],
      ['Delete old VM snapshots on the production cluster', 2, 'Destructive; needs approval and an owner check.'],
      ['Power-cycle a host through the BMC', 3, 'Not for agents in production. BMC account is ReadOnly.'],
    ],
    web: [
      ['curl the health endpoints and read nginx error logs', 0, 'Read-only. Log access via the adm group.'],
      ['Check TLS certificate expiry dates', 0, 'openssl against public endpoints; read-only.'],
      ['certbot renew --dry-run', 1, 'A dry run changes nothing.'],
      ['Restart the portal-api service', 2, 'systemctl restart triggers a Hermes approval on the ssh backend.'],
      ['Open a pull request that bumps a vulnerable dependency', 1, 'A PR changes nothing until a human reviews and merges it.'],
      ['Push directly to main or deploy to production', 3, 'Denied: branch protection plus approvals.deny on deploy commands.'],
    ],
    security: [
      ['Parse a reported phishing email and check SPF/DKIM/DMARC', 0, 'Analysis of a copy; nothing leaves the building.'],
      ['Look up a URL or file hash in a reputation service', 0, 'Hash and URL lookups only; never upload company files to public scanners.'],
      ['Diff Domain Admins membership against the approved baseline', 0, 'Read-only, daily.'],
      ['Block a phishing domain on the mail gateway', 2, 'A security control change, approved by the SOC analyst on duty.'],
      ['Isolate an endpoint in EDR', 2, 'High impact on the user. Approval required; for a confirmed ransomware playbook some SOCs pre-approve it, and that is written policy.'],
      ['Disable EDR, logging or an alert rule to reduce noise', 3, 'Never. Defence-impairment is forbidden for agents.'],
    ],
  };
  W.policyGame = function (el, o) {
    const b = A.frame(el, 'Which policy tier is this action?', 'Exercise');
    const id = uid('pg');
    const role = o.role || 'network';
    b.innerHTML = `<div class="w-row"><label>Team <select id="${id}-r">${Object.keys(ACTS).map((k) => `<option value="${k}" ${k === role ? 'selected' : ''}>${k}</option>`).join('')}</select></label></div><div id="${id}-l" style="display:grid;gap:8px"></div><div class="w-row"><button type="button" class="btn small primary" id="${id}-c">Check</button><span class="label" id="${id}-s"></span></div>`;
    let ans = [];
    const draw = () => {
      const L = ACTS[$('#' + id + '-r', b).value]; ans = L.map(() => null);
      $('#' + id + '-l', b).innerHTML = L.map((x, i) => `<div class="inj" data-i="${i}"><div class="txt"><b>${esc(x[0])}</b></div><span class="seg">${TIERS.map((t, j) => `<button type="button" data-v="${j}" title="${esc(t[1])}">${t[0]}</button>`).join('')}</span><div class="why" hidden></div></div>`).join('');
      $('#' + id + '-s', b).textContent = 'T0 read · T1 low-risk auto · T2 approval · T3 forbidden';
    };
    $('#' + id + '-r', b).onchange = draw;
    b.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-v]');
      if (btn) { const c = btn.closest('[data-i]'); ans[+c.dataset.i] = +btn.dataset.v; $$('.seg button', c).forEach((x) => x.classList.toggle('on', x === btn)); }
      if (e.target.id === id + '-c') {
        const L = ACTS[$('#' + id + '-r', b).value]; let ok = 0;
        L.forEach((x, i) => { const w = $(`[data-i="${i}"] .why`, b), r = ans[i] === x[1]; if (r) ok++; w.hidden = false; w.innerHTML = `<span class="pill ${r ? 'ok' : ans[i] == null ? 'mut' : 'crit'}">${ans[i] == null ? 'Not answered' : r ? 'Matches policy' : 'Policy says ' + TIERS[x[1]][0]}</span> <b>${TIERS[x[1]][0]} · ${TIERS[x[1]][1]}.</b> ${x[2]}`; });
        $('#' + id + '-s', b).textContent = `${ok} / ${L.length} match the policy`;
      }
    });
    draw();
  };

  W.agentLoop = function (el, o) {
    const b = A.frame(el, 'Agent loop simulator: think → act → observe', 'Simulation');
    const id = uid('al');
    b.innerHTML = `<div class="w-row"><label>Scenario <select id="${id}-s">${Object.keys(SCEN).map((k) => `<option value="${k}" ${k === (o.scenario || 'intranet') ? 'selected' : ''}>${esc(SCEN[k].title)}</option>`).join('')}</select></label></div>
      <div class="w-row"><span class="label">Tools the harness gives this agent</span><div class="toolchips" id="${id}-t"></div></div>
      <div class="w-row"><button type="button" class="btn small primary" id="${id}-n">Next step</button><button type="button" class="btn small" id="${id}-p">Auto-play</button><button type="button" class="btn small" id="${id}-r">Reset</button>
      <span class="spacer" style="flex:1"></span><span class="chip" id="${id}-c"></span></div>
      <div class="trace" id="${id}-l" aria-live="polite"></div>`;
    let S, queue, iter, tokens, timer, waiting;
    const reset = () => {
      clearInterval(timer); timer = null; $('#' + id + '-p', b).textContent = 'Auto-play';
      S = SCEN[$('#' + id + '-s', b).value]; queue = S.steps.slice(); iter = 0; tokens = 2400; waiting = false;
      $('#' + id + '-l', b).innerHTML = `<div class="tr obs"><span class="k">Goal</span><div>${esc(S.title)}</div></div>`;
      tools(); stat();
    };
    const tools = (hot) => { $('#' + id + '-t', b).innerHTML = S.tools.map((t) => { const nm = t.replace('*', ''); return `<span class="toolchip ${t.endsWith('*') ? 'risky' : ''} ${nm === hot ? 'hot' : ''}">${nm}</span>`; }).join(''); };
    const stat = () => { $('#' + id + '-c', b).textContent = `LLM calls: ${iter} · context ≈ ${fmt(tokens)} tokens`; };
    const add = (cls, k, html) => { const d = document.createElement('div'); d.className = `tr ${cls} new`; d.innerHTML = `<span class="k">${k}</span><div>${html}</div>`; const l = $('#' + id + '-l', b); l.appendChild(d); l.scrollTop = l.scrollHeight; return d; };
    const step = () => {
      if (waiting) return;
      const s = queue.shift();
      if (!s) { clearInterval(timer); timer = null; $('#' + id + '-p', b).textContent = 'Auto-play'; return; }
      if (s[0] === 'thought') { iter++; tokens += 180; add('thought', 'Thought', esc(s[1])); tools(); }
      else if (s[0] === 'action') { tokens += 260; tools(s[1]); add('action', 'Action', `<code>${esc(s[2])}</code><pre>${esc(s[3])}</pre>`); }
      else if (s[0] === 'final') { iter++; add('final', 'Answer', esc(s[1])); tools(); clearInterval(timer); timer = null; $('#' + id + '-p', b).textContent = 'Auto-play'; }
      else if (s[0] === 'approval') {
        waiting = true; clearInterval(timer); timer = null; $('#' + id + '-p', b).textContent = 'Auto-play';
        tools(s[1]);
        const d = add('approval', 'Approval', `The agent wants to run <code>${esc(s[2])}</code><br>${esc(s[3])}<div class="w-row" style="margin-top:8px"><button type="button" class="btn small primary" data-ap="1">Approve once</button><button type="button" class="btn small" data-ap="0">Deny</button></div>`);
        d.addEventListener('click', (e) => {
          const x = e.target.closest('[data-ap]'); if (!x) return;
          waiting = false; $$('[data-ap]', d).forEach((q) => (q.disabled = true));
          x.textContent = x.dataset.ap === '1' ? 'Approved ✓' : 'Denied ✗';
          queue.unshift(...(x.dataset.ap === '1' ? s[4] : s[5])); step();
        });
      }
      stat();
    };
    $('#' + id + '-n', b).onclick = step;
    $('#' + id + '-r', b).onclick = reset;
    $('#' + id + '-s', b).onchange = reset;
    $('#' + id + '-p', b).onclick = (e) => { if (timer) { clearInterval(timer); timer = null; e.target.textContent = 'Auto-play'; } else { e.target.textContent = 'Pause'; step(); timer = setInterval(step, 1300); } };
    reset();
  };

  /* ---------------- MCP message flow ---------------- */
  W.mcpFlow = function (el) {
    const b = A.frame(el, 'MCP step by step: an agent asks ServiceNow for a ticket', 'Walkthrough');
    const id = uid('mc');
    const lanes = ['You', 'Hermes (host + client)', 'itsm-mcp server', 'ServiceNow API'];
    const M = [
      [1, 2, 'initialize', 'Hermes starts the MCP server from config.yaml (stdio) and says hello.', '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","clientInfo":{"name":"hermes"}}}'],
      [2, 1, 'capabilities', 'The server answers with what it supports: tools, maybe resources and prompts.', '{"jsonrpc":"2.0","id":1,"result":{"capabilities":{"tools":{}},"serverInfo":{"name":"itsm-mcp","version":"0.3.0"}}}'],
      [1, 2, 'tools/list', 'Hermes asks which tools exist.', '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'],
      [2, 1, 'tool schemas', 'Each tool comes with a name, a description and a JSON Schema for its inputs. These go into the LLM\'s context.', '{"result":{"tools":[\n {"name":"get_ticket","description":"Fetch an incident by number","inputSchema":{"type":"object","properties":{"number":{"type":"string"}},"required":["number"]}},\n {"name":"add_work_note", ...},\n {"name":"search_kb", ...}]}}'],
      [0, 1, '“Status of INC-20931?”', 'You ask a question in plain language.', 'What is the status of INC-20931 and who has it?'],
      [1, 1, 'LLM picks a tool', 'The model sees the tool list and answers with a structured tool call instead of text.', '{"type":"tool_use","name":"get_ticket","input":{"number":"INC-20931"}}'],
      [1, 2, 'tools/call', 'Hermes forwards the call to the right server, after its own approval and allowlist checks.', '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_ticket","arguments":{"number":"INC-20931"}}}'],
      [2, 3, 'GET /incident', 'The server translates the call into the real API request, using its own service-account token.', 'GET /api/now/table/incident?sysparm_query=number=INC-20931\nAuthorization: Bearer ****'],
      [3, 2, '200 OK', 'ServiceNow returns JSON.', '{"number":"INC-20931","state":"In Progress","assigned_to":"Network L2","short_description":"Intranet unreachable from Branch-2"}'],
      [2, 1, 'tool result', 'The server returns the result to Hermes, which adds it to the context.', '{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"INC-20931 · In Progress · Network L2 · Intranet unreachable from Branch-2"}]}}'],
      [1, 0, 'answer', 'The LLM writes the final answer from the tool result.', 'INC-20931 is In Progress and assigned to Network L2. It is about the intranet being unreachable from Branch-2.'],
    ];
    b.innerHTML = `<div class="fig-scroll" id="${id}-d"></div><div class="w-row"><button type="button" class="btn small" id="${id}-p">← Back</button><button type="button" class="btn small primary" id="${id}-n">Next message →</button><span class="label" id="${id}-c"></span></div><div id="${id}-x"></div>`;
    let i = 0;
    const draw = () => {
      $('#' + id + '-d', b).innerHTML = A.D.seq(lanes, M.map((m, j) => [m[0], m[1], m[2], j === i ? 'acc' : j < i ? '' : 'dash']), { focus: M[i][1] });
      $('#' + id + '-c', b).textContent = `Message ${i + 1} of ${M.length}`;
      $('#' + id + '-x', b).innerHTML = `<p style="margin-bottom:8px">${esc(M[i][3])}</p>${A.H.code(M[i][4], 'json', M[i][2])}`;
      $('#' + id + '-p', b).disabled = i === 0; $('#' + id + '-n', b).disabled = i === M.length - 1;
    };
    $('#' + id + '-n', b).onclick = () => { i = Math.min(M.length - 1, i + 1); draw(); };
    $('#' + id + '-p', b).onclick = () => { i = Math.max(0, i - 1); draw(); };
    draw();
  };

  /* ---------------- Simulated Hermes terminal ---------------- */
  const OUT = {
    'help': 'Simulated commands you can try:\n  curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash\n  source ~/.bashrc · hermes --version · hermes doctor · hermes model · hermes setup\n  hermes · hermes tools · hermes skills browse · hermes skills search <word>\n  hermes skills install <slug> · hermes skills list · hermes mcp catalog\n  hermes cron list · hermes gateway status · hermes profile list\n  hermes profile create <name> · ls ~/.hermes · cat ~/.hermes/config.yaml\n  ollama pull qwen3:32b · ollama ps · nvidia-smi · clear',
    'curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash': '<span class="hl">☤ Hermes Agent installer</span>\n✓ git, curl, tar found\n✓ downloaded verified uv\n✓ cloned hermes-agent → ~/.hermes/hermes-agent\n✓ PM: Python 3.14, Node.js, ripgrep, FFmpeg\n✓ browser tools (agent-browser + Chromium)\n✓ launcher → ~/.local/bin/hermes\n<span class="dim">  full log: ~/.hermes/logs/install.log</span>\n\nNext: reload your shell, then run  <span class="hl">hermes setup</span>',
    'source ~/.bashrc': '',
    'hermes --version': 'Hermes Agent  <span class="dim">(stable channel; your version will differ)</span>',
    'hermes doctor': '<span class="hl">Hermes doctor</span>\n✓ Python environment OK\n✓ config.yaml parsed\n✓ provider credentials found\n✓ model context ≥ 64K\n<span class="er">✗ terminal backend docker: docker daemon not reachable</span>\n  fix: start Docker, or  hermes config set terminal.backend local\n✓ skills directory OK',
    'hermes model': '<span class="hl">Select provider</span>\n  ❯ Nous Portal (OAuth)\n    OpenRouter\n    Anthropic\n    OpenAI Codex (ChatGPT subscription)\n    AWS Bedrock · Azure Foundry · Google AI Studio\n    LM Studio · Ollama Cloud\n    Custom endpoint (vLLM / Ollama / llama.cpp)\n<span class="dim">  (interactive menu; arrow keys + Enter in the real CLI)</span>',
    'hermes setup': '<span class="hl">Hermes setup</span>\n  ❯ Quick Setup (Nous Portal)   OAuth, model + Tool Gateway\n    Full Setup                  bring your own keys, walk through everything\n    Blank Slate                 minimal: provider, file + terminal toolsets only\n<span class="dim">  Tip for production pilots: Blank Slate, then enable only what you need.</span>',
    'hermes': '<span class="hl">☤ Hermes Agent</span>   model: your-provider/your-model   profile: default\n  tools: terminal, file, web, memory, skills, delegation, cronjob …\n  skills: 80+ installed · type / for commands\n\n<span class="pr">❯</span> <span class="dim">(interactive session; type /help, /tools, /model, /skills, /new …)</span>',
    'hermes tools': '<span class="dim">Opens an interactive picker to enable or disable toolsets per platform (cli, telegram, slack …).</span>\n  [x] terminal   [x] file   [x] web   [ ] browser   [x] memory\n  [x] skills     [x] todo   [x] delegation   [ ] image_gen   [x] cronjob',
    'hermes skills browse': '<span class="hl">Skills Hub</span>  (official first)\n  official/security/1password        Use 1Password CLI for secrets\n  official/devops/…                  …\n  skills-sh/…                        …\n<span class="dim">  use: hermes skills inspect <slug>  then  hermes skills install <slug></span>',
    'hermes skills list': 'NAME                    SOURCE     CATEGORY\ngithub-pr-workflow      bundled    devops\ntest-driven-development bundled    software\nocr-and-documents       bundled    productivity\nnetwork-triage          local      it-ops   <span class="hl">← the one you wrote in Lab 5</span>\n…',
    'hermes mcp catalog': 'deepwiki     available              Ask questions about public GitHub repositories\nlinear       available              Linear issue/project management (remote OAuth)\ngithub       available              GitHub repo + PR tools\n<span class="dim">  install: hermes mcp install <name></span>',
    'hermes cron list': 'ID        SCHEDULE            NAME                    NEXT RUN\njob_7f2a  every day 06:00     Daily infra health      tomorrow 06:00\njob_91c3  every monday 08:00  Cert expiry report      Mon 08:00',
    'hermes gateway status': 'gateway: running (pid 4127)\n  slack     connected   home channel #it-ops-agents\n  telegram  not configured',
    'hermes profile list': 'PROFILE        MODEL                     GATEWAY\ndefault        your-provider/your-model  —\ntriage         your-provider/your-model  slack\nnetwork        local/qwen3:32b           —',
    'ls ~/.hermes': 'config.yaml  .env  SOUL.md  memories/  skills/  sessions/  cron/  logs/  profiles/  hermes-agent/',
    'cat ~/.hermes/config.yaml': 'model:\n  provider: openrouter\n  default: anthropic/claude-opus-4.6\nterminal:\n  backend: docker\n  docker_image: python:3.11-slim\napprovals:\n  mode: smart\n  cron_mode: deny\nmcp_servers:\n  filesystem:\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-filesystem", "/srv/runbooks"]',
    'ollama pull qwen3:32b': 'pulling manifest\npulling 3291abe70f16… 100% ▕████████████████▏  20 GB\nverifying sha256 digest\nsuccess',
    'ollama ps': 'NAME         ID            SIZE     PROCESSOR    CONTEXT   UNTIL\nqwen3:32b    030ee887880f  27 GB    100% GPU     65536     4 minutes from now',
    'nvidia-smi': '+-----------------------------------------------+\n| GPU  Name            | Memory-Usage   | Util  |\n|   0  RTX 5090        | 27012MiB/32607MiB |  94%  |\n+-----------------------------------------------+',
  };
  W.terminal = function (el, o) {
    const b = A.frame(el, o.title || 'Practice terminal', 'Simulated');
    const id = uid('tm');
    const chips = o.chips || ['hermes --version', 'hermes doctor', 'help'];
    b.innerHTML = `<div class="term" id="${id}-o" aria-live="polite"><span class="dim">Practice terminal. Outputs are illustrative; run the real commands on your lab VM.\nType a command or click one below. Type "help" for the list.</span>\n</div>
      <form class="term-in" id="${id}-f"><span class="label">$</span><input type="text" id="${id}-i" autocomplete="off" spellcheck="false" aria-label="Command"><button class="btn small" type="submit">Run</button></form>
      <div class="cmdchips">${chips.map((c) => `<button type="button" class="cmdchip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
    const out = $('#' + id + '-o', b);
    const run = (cmd) => {
      cmd = cmd.trim(); if (!cmd) return;
      if (cmd === 'clear') { out.innerHTML = ''; return; }
      let r = OUT[cmd];
      if (r == null) {
        if (/^hermes skills search /.test(cmd)) r = `Searching hub for "${esc(cmd.slice(21))}" …\n  <span class="dim">(results come from official, skills.sh, ClawHub, LobeHub and well-known sources)</span>`;
        else if (/^hermes skills (install|inspect) /.test(cmd)) r = `Fetching ${esc(cmd.split(' ').pop())} into quarantine …\n✓ security scan: no findings\n✓ installed → ~/.hermes/skills/  <span class="dim">(now available as /&lt;skill-name&gt;)</span>`;
        else if (/^hermes profile create /.test(cmd)) { const nm = esc(cmd.split(/\s+/)[3] || 'agent'); r = `✓ created profile ${nm} → ~/.hermes/profiles/${nm}\n✓ alias command: <span class="hl">${nm}</span>  (try: ${nm} setup, ${nm} chat)`; }
        else if (/^hermes cron create /.test(cmd)) r = '✓ job created  <span class="dim">(see: hermes cron list)</span>';
        else if (/^hermes config set /.test(cmd)) r = '✓ saved  <span class="dim">(secrets → ~/.hermes/.env, settings → config.yaml)</span>';
        else r = `<span class="er">not simulated:</span> ${esc(cmd)}\n<span class="dim">type "help" for commands this practice terminal knows</span>`;
      }
      out.innerHTML += `<span class="pr">you@it-lab</span>:<span class="hl">~</span>$ ${esc(cmd)}\n${r}${r ? '\n' : ''}`;
      out.scrollTop = out.scrollHeight;
    };
    $('#' + id + '-f', b).addEventListener('submit', (e) => { e.preventDefault(); const i = $('#' + id + '-i', b); run(i.value); i.value = ''; });
    b.addEventListener('click', (e) => { const c = e.target.closest('[data-c]'); if (c) run(c.dataset.c); });
  };

  /* ---------------- SKILL.md builder ---------------- */
  const SK = {
    'network-triage': { d: 'Diagnose “site X cannot reach service Y” network tickets', cat: 'it-ops', ts: 'terminal', when: 'A ticket or alert says users at one site cannot reach an internal service, but other sites can.', proc: 'Identify the user\'s site and device from the ticket.\nResolve the service name from the site probe (nslookup).\nPing the service IP from the site probe and from the HQ probe.\nIf only the site fails, check the site-to-site tunnel status.\nCollect evidence and propose the fix. Never restart network devices without approval.', pit: 'ICMP may be blocked by policy, so also test TCP 443 with nc -zv before concluding.\nDNS answers from cache can hide a broken resolver, so query the resolver IP directly.', ver: 'The user\'s site probe reaches the service on its real port, and evidence is in the ticket work notes.' },
    'ad-account-unlock': { d: 'Unlock an AD account safely after identity check', cat: 'identity', ts: 'terminal', when: 'A user reports “account locked” or a 4740 lockout alert fires for a named account.', proc: 'Confirm the requester\'s identity through the approved callback procedure. Never by chat alone.\nQuery lockout status: Get-ADUser <sam> -Properties LockedOut,BadLogonCount.\nFind the lockout source in Event 4740 on the PDC emulator.\nUnlock: Unlock-ADAccount -Identity <sam>.\nIf the source is a device with stale credentials, tell the user which device.', pit: 'Repeated lockouts within minutes usually mean a phone or mapped drive with an old password. Unlocking again will not fix it.\nNever reset passwords in this skill. That is a separate, approved process.', ver: 'LockedOut is False and there is no new 4740 event for 15 minutes.' },
    'disk-hygiene': { d: 'Free space on Windows file servers within policy RET-03', cat: 'it-ops', ts: 'terminal', when: 'A disk-usage alert above 90% fires on a file server, or a scheduled weekly run.', proc: 'Report volume usage and growth per day.\nList the top 10 largest folders.\nCompress IIS and application logs older than 30 days (policy RET-03).\nList user files over 5 GB and notify the owners. Never delete user files.\nPost a summary with before and after usage.', pit: 'Compressing open log files fails, so skip files modified in the last hour.\nVSS snapshots can hold space; report them but do not delete them.', ver: 'Usage is under 85%, or a ticket explains why it could not be.' },
  };
  W.skillBuilder = function (el, o) {
    const b = A.frame(el, 'SKILL.md builder for your IT runbooks');
    const id = uid('sk');
    const f = (k, l, v, ta) => `<label style="display:grid;gap:3px;font-size:.85rem"><span class="label">${l}</span>${ta ? `<textarea data-k="${k}" rows="4">${esc(v)}</textarea>` : `<input type="text" data-k="${k}" value="${esc(v)}">`}</label>`;
    const fill = (name) => {
      const s = SK[name];
      b.querySelector('#' + id + '-form').innerHTML = f('name', 'name (lower-case, dashes)', name) + f('d', 'description (max ~60 chars, says WHEN to use it)', s.d) + `<div class="w-row">${f('cat', 'category', s.cat)}${f('ts', 'requires toolsets', s.ts)}</div>` + f('when', 'When to use', s.when, 1) + f('proc', 'Procedure (one step per line)', s.proc, 1) + f('pit', 'Pitfalls (one per line)', s.pit, 1) + f('ver', 'Verification', s.ver, 1);
      run();
    };
    b.innerHTML = `<div class="w-row"><span class="label">Start from</span>${Object.keys(SK).map((k) => `<button type="button" class="cmdchip" data-p="${k}">${k}</button>`).join('')}</div>
      <div class="w-grid2"><div id="${id}-form" style="display:grid;gap:8px"></div><div style="display:grid;gap:8px;align-content:start"><div id="${id}-o"></div><div id="${id}-i"></div><div id="${id}-w"></div></div></div>`;
    const run = () => {
      const v = Object.fromEntries($$('[data-k]', b).map((x) => [x.dataset.k, x.value.trim()]));
      const name = (v.name || 'my-skill').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);
      const md = `---\nname: ${name}\ndescription: ${v.d}\nversion: 1.0.0\nmetadata:\n  hermes:\n    tags: [it-ops, ${v.cat}]\n    category: ${v.cat}\n    requires_toolsets: [${v.ts}]\n---\n\n# ${name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}\n\n## When to Use\n${v.when}\n\n## Procedure\n${lines(v.proc).map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n## Pitfalls\n${lines(v.pit).map((x) => `- ${x}`).join('\n')}\n\n## Verification\n${v.ver}\n`;
      $('#' + id + '-o', b).innerHTML = A.H.code(md, 'markdown', `~/.hermes/skills/${v.cat}/${name}/SKILL.md`);
      $('#' + id + '-i', b).innerHTML = A.H.code(`mkdir -p ~/.hermes/skills/${v.cat}/${name}\nnano ~/.hermes/skills/${v.cat}/${name}/SKILL.md   # paste the file above\nhermes          # then, inside the session:\n/${name} INC-20931 users at Branch-2 cannot reach intranet`, 'bash', 'install and use it');
      $('#' + id + '-w', b).innerHTML = v.d.length > 60 ? `<div class="callout warn"><span class="label">Description is ${v.d.length} chars</span>Keep it short. The agent reads every skill's description on every turn to decide which skill to load.</div>` : '';
    };
    b.addEventListener('input', run);
    b.addEventListener('click', (e) => { const p = e.target.closest('[data-p]'); if (p) fill(p.dataset.p); });
    fill(o.preset || 'network-triage');
  };

  /* ---------------- Hermes config builder ---------------- */
  W.configBuilder = function (el) {
    const b = A.frame(el, 'Hermes configuration builder for a lab VM');
    const id = uid('cb');
    const sel = (k, l, opts) => `<label style="display:grid;gap:3px;font-size:.85rem"><span class="label">${l}</span><select data-k="${k}">${opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
    b.innerHTML = `<div class="w-grid2"><div style="display:grid;gap:10px">
      ${sel('prov', 'Model provider', [['openrouter', 'OpenRouter (API key, many models)'], ['anthropic', 'Anthropic API key'], ['portal', 'Nous Portal (OAuth subscription)'], ['ollama', 'Local: Ollama on this machine'], ['vllm', 'Local: vLLM / LM Studio server on the LAN']])}
      ${sel('term', 'Where agent commands run', [['docker', 'Docker sandbox (recommended)'], ['local', 'Local shell (trusted lab only)'], ['ssh', 'SSH to a jump/lab server']])}
      ${sel('appr', 'Dangerous-command approvals', [['manual', 'manual: always ask me'], ['smart', 'smart: auto-approve low risk, ask on uncertain'], ['off', 'off / YOLO (disposable sandbox only)']])}
      <fieldset style="border:1px solid var(--line);border-radius:6px;padding:8px 12px"><legend class="label">MCP servers</legend>
      <label style="display:flex;gap:6px;font-size:.88rem"><input type="checkbox" data-k="mcp_fs" checked> filesystem (read our runbooks folder)</label>
      <label style="display:flex;gap:6px;font-size:.88rem"><input type="checkbox" data-k="mcp_gh"> GitHub (repos, issues, PRs)</label>
      <label style="display:flex;gap:6px;font-size:.88rem"><input type="checkbox" data-k="mcp_itsm" checked> internal ITSM MCP over HTTPS (read-only tools)</label></fieldset>
      ${sel('gw', 'Chat gateway', [['none', 'None (CLI only)'], ['slack', 'Slack'], ['teams', 'Microsoft Teams'], ['telegram', 'Telegram']])}
      </div><div id="${id}-o" style="display:grid;gap:10px;align-content:start"></div></div>`;
    const run = () => {
      const v = Object.fromEntries($$('[data-k]', b).map((x) => [x.dataset.k, x.type === 'checkbox' ? x.checked : x.value]));
      let yaml = '', env = '', cmds = ['curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash', 'source ~/.bashrc'];
      const notes = [];
      if (v.prov === 'openrouter') { yaml += 'model:\n  provider: openrouter\n  default: anthropic/claude-opus-4.6   # example; pick yours with `hermes model`\n'; env += 'OPENROUTER_API_KEY=sk-or-...\n'; }
      if (v.prov === 'anthropic') { yaml += 'model:\n  provider: anthropic\n  default: claude-sonnet-4-6           # example; pick yours with `hermes model`\n'; env += 'ANTHROPIC_API_KEY=sk-ant-...\n'; }
      if (v.prov === 'portal') { cmds.push('hermes setup --portal        # OAuth login, sets model + Tool Gateway'); yaml += '# model section is written by `hermes setup --portal`\n'; }
      if (v.prov === 'ollama') {
        cmds.splice(0, 0, '# GPU host: give Ollama a 64K context window (Hermes minimum)', 'sudo systemctl edit ollama.service   # add: Environment="OLLAMA_CONTEXT_LENGTH=65536"', 'sudo systemctl daemon-reload && sudo systemctl restart ollama', 'ollama pull qwen3:32b', 'ollama ps                    # CONTEXT column must show 65536');
        yaml += 'model:\n  provider: custom\n  base_url: http://localhost:11434/v1\n  default: qwen3:32b\n  context_length: 65536\n';
        notes.push('Small local models (under ~30B) often fake tool calls. Use a strong model for setup and testing, then try local.');
      }
      if (v.prov === 'vllm') { yaml += 'model:\n  provider: custom\n  base_url: http://gpu-01.lab.local:8000/v1   # vLLM / LM Studio OpenAI-compatible URL\n  default: Qwen/Qwen3-32B\n  context_length: 65536\n'; notes.push('Serve with at least a 64K context, e.g. vllm serve Qwen/Qwen3-32B --max-model-len 65536 --enable-auto-tool-choice'); }
      if (v.term === 'docker') yaml += 'terminal:\n  backend: docker\n  docker_image: python:3.11-slim\n  container_memory: 4096\n  container_persistent: true\n';
      if (v.term === 'local') { yaml += 'terminal:\n  backend: local\n  timeout: 180\n'; notes.push('Local backend runs commands as your user on this machine. Use a dedicated lab VM, never your admin workstation.'); }
      if (v.term === 'ssh') { yaml += 'terminal:\n  backend: ssh\n'; env += 'TERMINAL_SSH_HOST=jump-lab-01.lab.local\nTERMINAL_SSH_USER=svc-hermes\nTERMINAL_SSH_KEY=~/.ssh/svc_hermes_ed25519\n'; }
      yaml += `approvals:\n  mode: ${v.appr}\n  timeout: 300\n  cron_mode: deny\n  unattended_mode: deny\n`;
      if (v.appr === 'off') notes.push('approvals.mode: off disables every safety prompt. Only in a throwaway container with no production credentials.');
      if (v.mcp_fs || v.mcp_gh || v.mcp_itsm) {
        yaml += 'mcp_servers:\n';
        if (v.mcp_fs) yaml += '  runbooks:\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-filesystem", "/srv/runbooks"]\n';
        if (v.mcp_gh) { yaml += '  github:\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-github"]\n    env:\n      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}"\n'; env += 'GITHUB_TOKEN=github_pat_...   # fine-grained, read-only to start\n'; }
        if (v.mcp_itsm) { yaml += '  itsm:\n    url: "https://mcp.itsm.acme.local/mcp"\n    headers:\n      Authorization: "Bearer ${ITSM_MCP_TOKEN}"\n    tools:\n      include: [get_ticket, search_kb, add_work_note]   # least privilege\n'; env += 'ITSM_MCP_TOKEN=...\n'; }
      }
      if (v.gw !== 'none') { cmds.push('hermes gateway setup         # pick ' + v.gw + ', paste bot token, set allowed users', 'hermes gateway start', 'hermes gateway status'); notes.push('Always restrict who may talk to the bot (allowlist or DM pairing). An open bot with a terminal is a remote shell.'); }
      cmds.push('hermes config edit           # paste the YAML below (or use: hermes config set <key> <value>)', 'hermes doctor', 'hermes');
      $('#' + id + '-o', b).innerHTML = A.H.code(cmds.join('\n'), 'bash', 'commands, in order') + A.H.code(yaml, 'yaml', '~/.hermes/config.yaml') + (env ? A.H.code(env, 'bash', '~/.hermes/.env (secrets, chmod 600, never commit)') : '') + (notes.length ? `<div class="callout warn"><span class="label">Check before you go live</span>${A.H.list(notes)}</div>` : '');
    };
    b.addEventListener('input', run); b.addEventListener('change', run);
    run();
  };

  /* ---------------- Multi-agent team designer ---------------- */
  const ROLES = [
    ['orchestrator', 'Orchestrator', 'Reads the board, splits work, routes tasks to specialists, reviews their results.', 'ink', 'delegation, todo, kanban', true],
    ['triage', 'Helpdesk triage', 'Classifies new tickets, asks users for missing info, answers known issues from the KB.', '', 'web, file, session_search, MCP: itsm (read)'],
    ['network', 'Network engineer', 'Diagnoses reachability, VPN and Wi-Fi issues with read-only probes and SNMP.', 'tl', 'terminal (ssh to jump host), skill: network-triage'],
    ['identity', 'Identity & access', 'Handles lockouts and access requests within the AD runbooks.', 'tl', 'terminal (PowerShell via jump host), skill: ad-account-unlock'],
    ['security', 'Security analyst', 'Triages phishing reports and EDR alerts, enriches IOCs, drafts containment steps.', 'tl', 'web, MCP: siem (read), no write access'],
    ['sysadmin', 'Server & storage', 'Disk, backup and patch hygiene on Windows/Linux servers.', 'tl', 'terminal (docker or ssh), skill: disk-hygiene'],
    ['kb', 'KB writer', 'Turns every resolved incident into a KB article and an updated skill.', '', 'file, skills, MCP: itsm (write KB only)'],
  ];
  const TICKETS = [
    ['Branch-2 cannot reach the intranet', ['triage', 'network', 'human', 'kb'], 'Network fix needs a tunnel restart, so a human approves it.'],
    ['“Your mailbox is full, click here” email reported', ['triage', 'security', 'kb'], 'Security analyst checks headers and URLs, blocks the sender (drafted for approval), and the KB writer adds the sample to the phishing article.'],
    ['Account locked again after password change', ['triage', 'identity', 'kb'], 'Identity agent finds the stale-credential device. Unlocking is inside its runbook, so no human is needed.'],
    ['FS-02 disk at 94%', ['sysadmin', 'human', 'kb'], 'Comes from monitoring straight to the sysadmin agent. Deleting user files needs a human.'],
  ];
  W.teamDesigner = function (el) {
    const b = A.frame(el, 'Design your IT agent team');
    const id = uid('td');
    b.innerHTML = `<div class="w-row">${ROLES.map((r) => `<label class="chip" style="cursor:pointer;font-size:.8rem"><input type="checkbox" data-r="${r[0]}" ${['orchestrator', 'triage', 'network', 'security', 'kb'].includes(r[0]) ? 'checked' : ''} ${r[5] ? 'disabled' : ''}> ${r[1]}</label>`).join('')}</div>
      <div class="fig-scroll" id="${id}-g"></div>
      <div class="w-row"><label>Route a ticket <select id="${id}-t">${TICKETS.map((t, i) => `<option value="${i}">${esc(t[0])}</option>`).join('')}</select></label></div>
      <div id="${id}-r"></div>
      <div id="${id}-c"></div>`;
    const run = () => {
      const on = new Set(['orchestrator', ...$$('[data-r]:checked', b).map((x) => x.dataset.r)]);
      const sel = ROLES.filter((r) => on.has(r[0]) && r[0] !== 'orchestrator');
      $('#' + id + '-g', b).innerHTML = A.D.hub({ t: 'Orchestrator', s: 'kanban dispatcher', c: 'ink' }, [...sel.map((r) => ({ t: r[1], s: r[4].split(',')[0], c: r[3] })), { t: 'Human L2 on-call', s: 'approves risky steps', c: 'acc' }], { h: 440, rx: 350, ry: 160, bw: 210, bh: 64, anim: true });
      const t = TICKETS[+$('#' + id + '-t', b).value];
      const names = { human: 'Human approval' }; ROLES.forEach((r) => (names[r[0]] = r[1]));
      const path = t[1].map((p) => ({ p, ok: p === 'human' || on.has(p) }));
      $('#' + id + '-r', b).innerHTML = A.H.fig(A.D.flow([{ t: 'New ticket', s: 'ITSM / monitoring' }, ...path.map((x) => ({ t: names[x.p], s: x.ok ? (x.p === 'human' ? 'approve / deny' : 'agent') : 'MISSING: falls back to humans', c: x.p === 'human' ? 'acc' : x.ok ? 'tl' : 'crit' }))], { anim: true }), esc(t[2]));
      const cmds = ['# 1. One profile per agent: own memory, skills, credentials and model'];
      ROLES.filter((r) => on.has(r[0])).forEach((r) => cmds.push(`hermes profile create ${r[0]} --description "${r[2]}"`));
      cmds.push('', '# 2. Configure each profile (model, toolsets, MCP) with least privilege', ...ROLES.filter((r) => on.has(r[0]) && r[0] !== 'orchestrator').map((r) => `${r[0]} setup        # toolsets: ${r[4]}`), '', '# 3. A shared board the orchestrator dispatches from', 'hermes kanban boards create it-ops --name "IT Ops" --switch', `hermes kanban create "${t[0]}" --assignee ${t[1].find((p) => p !== 'human' && on.has(p)) || 'orchestrator'} --body "See ticket in ITSM"`, 'hermes kanban list');
      $('#' + id + '-c', b).innerHTML = A.H.code(cmds.join('\n'), 'bash', 'build this team with Hermes profiles + kanban');
    };
    b.addEventListener('change', run);
    run();
  };

  /* ---------------- Coding-agent safety modes (Claude Code + Codex) ---------------- */
  W.modes = function (el) {
    const L = A.L;
    const b = A.frame(el, L('Which mode for this task?', 'برای این کار کدام حالت؟'), L('Exercise', 'تمرین'));
    const id = uid('md');
    const S = [
      [L('Explore an unfamiliar repo', 'بررسی یک مخزن ناآشنا'), 'ok', L('Read-only', 'فقط خواندنی'),
        'claude --permission-mode plan', 'codex -s read-only -a on-request',
        L('The agent reads and proposes a plan; nothing changes until you approve. The best start for any infrastructure repo.', 'ایجنت می‌خواند و برنامه پیشنهاد می‌دهد؛ تا شما تأیید نکنید چیزی تغییر نمی‌کند. بهترین شروع برای هر مخزن زیرساختی.')],
      [L('Iterate on a script in a branch', 'تکرار روی یک اسکریپت در یک شاخه'), 'ok', L('Edits, you review the diff', 'ویرایش، شما diff را بازبینی می‌کنید'),
        'claude --permission-mode acceptEdits\n/sandbox   # Bash in an OS sandbox', 'codex -s workspace-write -a on-request',
        L('File edits run without prompts, commands still ask (or run inside the sandbox). Git makes every change reviewable and revertible.', 'ویرایش فایل‌ها بدون پرسش انجام می‌شود و فرمان‌ها همچنان سؤال می‌شوند (یا داخل sandbox اجرا می‌شوند). Git هر تغییر را قابل بازبینی و بازگشت می‌کند.')],
      [L('Long refactor, fewer prompts', 'بازسازی طولانی، پرسش کمتر'), 'warn', L('Needs guardrails', 'نیازمند حفاظ'),
        'claude --permission-mode auto\n# + deny rules for apply/deploy', 'codex -s workspace-write -a on-request\n# network off in the sandbox',
        L('A classifier or the sandbox replaces most prompts. Keep deny rules for dangerous commands and work in a branch.', 'یک طبقه‌بند یا sandbox جای بیشتر پرسش‌ها را می‌گیرد. قواعد deny را برای فرمان‌های خطرناک نگه دارید و در یک شاخه کار کنید.')],
      [L('Nightly CI job: lint and tests', 'کار شبانه CI: lint و تست'), 'ok', L('Exact allowlist', 'فهرست مجاز دقیق'),
        'claude -p "Run the tests and report" \\\n  --permission-mode dontAsk \\\n  --allowedTools "Read" "Bash(npm test)"', 'codex exec -s workspace-write -a never \\\n  "Run the tests and report"',
        L('Nobody is there to answer a prompt, so only pre-approved tools run and everything else is refused.', 'کسی برای پاسخ به پرسش حاضر نیست؛ پس فقط ابزارهای از پیش مجاز اجرا می‌شوند و بقیه رد می‌شوند.')],
      [L('Fully unattended in a throwaway container', 'کاملاً بدون ناظر در یک کانتینر یک‌بارمصرف'), 'crit', L('Container or VM only', 'فقط کانتینر یا VM'),
        'claude -p "…" --dangerously-skip-permissions\n# non-root user, no secrets, no prod network', 'codex exec --yolo "…"\n# = --dangerously-bypass-approvals-and-sandbox',
        L('All checks are off. The isolation must come from the disposable container or VM itself, never from your workstation.', 'همه بررسی‌ها خاموش است. جداسازی باید از خود کانتینر یا VM یک‌بارمصرف بیاید، هرگز از ایستگاه کاری شما.')],
      [L('Change a production server or device', 'تغییر یک سرور یا دستگاه عملیاتی'), 'crit', L('Agent drafts, humans apply', 'ایجنت پیش‌نویس می‌کند، انسان اعمال می‌کند'),
        'claude --permission-mode plan\n# deny: terraform apply, ansible-playbook', 'codex -s read-only\n# output: change request + diff',
        L('No mode is right for direct production changes. The agent writes and tests the change; it goes through review and the change process.', 'هیچ حالتی برای تغییر مستقیم در محیط عملیاتی مناسب نیست. ایجنت تغییر را می‌نویسد و تست می‌کند؛ تغییر از مسیر بازبینی و فرایند تغییر می‌گذرد.')],
    ];
    b.innerHTML = `<div class="w-row" id="${id}-s" style="flex-wrap:wrap;gap:6px">${S.map((x, i) => `<button type="button" data-i="${i}" class="btn small">${esc(x[0])}</button>`).join('')}</div><div id="${id}-o" style="display:grid;gap:10px"></div>`;
    const show = (i) => {
      const x = S[i];
      $$('#' + id + '-s button', b).forEach((btn) => btn.classList.toggle('primary', +btn.dataset.i === i));
      $('#' + id + '-o', b).innerHTML = `<div class="w-row"><h3 style="margin:0">${esc(x[0])}</h3><span class="pill ${x[1]}">${esc(x[2])}</span></div><p>${esc(x[5])}</p><div class="w-grid2"><div>${A.H.code(x[3], 'bash', 'Claude Code')}</div><div>${A.H.code(x[4], 'bash', 'Codex')}</div></div>`;
    };
    b.addEventListener('click', (e) => { const btn = e.target.closest('[data-i]'); if (btn) show(+btn.dataset.i); });
    show(0);
  };
})();
