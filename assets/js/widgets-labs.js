/* Agent & lab widgets: agent loop simulator, MCP message flow, simulated Hermes terminal,
   SKILL.md builder, Hermes config builder, multi-agent team designer, policy tiers, coding-agent modes.
   Every visible string is bilingual: L('English', 'فارسی') or an [en, fa] pair read with T().
   Commands, JSON and tool output stay in English, as they appear on a real system. */
(function () {
  const A = window.ACADEMY, W = A.widgets, esc = A.esc, L = A.L, FA = A.lang === 'fa';
  const { uid, fmt } = A.util;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const T = (p) => (Array.isArray(p) ? (FA ? p[1] : p[0]) : p);

  /* ---------------- Agent loop (ReAct) simulator ---------------- */
  // Steps: ['thought', [en, fa]] · ['action', tool, call, output] · ['final', [en, fa]]
  //        ['approval', tool, call, [en, fa], stepsIfApproved, stepsIfDenied]
  const SCEN = {
    intranet: {
      title: ['INC-20931 · “Intranet is down for me” (user at Branch-2)', 'INC-20931 · «اینترانت برای من قطع است» (کاربر در Branch-2)'],
      tools: ['lookup_user', 'nslookup', 'ping', 'check_tunnel', 'restart_tunnel*', 'add_work_note', 'escalate'],
      steps: [
        ['thought', ['Before testing anything I need to know who the user is and where they sit.', 'پیش از هر آزمایشی باید بدانم کاربر کیست و کجا می‌نشیند.']],
        ['action', 'lookup_user', 'lookup_user(email="s.karimi@acme.local")', '{"site": "Branch-2", "device": "LT-2231", "on_vpn": false}'],
        ['thought', ['Branch-2 reaches HQ services over a site-to-site tunnel. Check name resolution from the branch probe first.', 'Branch-2 از طریق یک تونل site-to-site به سرویس‌های دفتر مرکزی می‌رسد. اول resolve نام را از probe شعبه بررسی می‌کنم.']],
        ['action', 'nslookup', 'nslookup("intranet.acme.local", probe="branch2")', 'intranet.acme.local → 10.10.5.20  (answered by 10.0.0.10)'],
        ['action', 'ping', 'ping("10.10.5.20", probe="branch2", count=4)', '4 packets sent, 0 received (100% loss)'],
        ['action', 'ping', 'ping("10.10.5.20", probe="hq", count=4)', '4 packets sent, 4 received, avg 2 ms'],
        ['thought', ['DNS works and the server answers from HQ, so the break is between Branch-2 and HQ. Check the tunnel.', 'DNS کار می‌کند و سرور از دفتر مرکزی پاسخ می‌دهد، پس قطعی بین Branch-2 و دفتر مرکزی است. تونل را بررسی می‌کنم.']],
        ['action', 'check_tunnel', 'check_tunnel("branch2-hq")', 'state=DOWN since 09:41 · phase-2 rekey failed · 38 users at site'],
        ['thought', ['Restarting the tunnel changes a production firewall. Policy says that needs a human, so I ask.', 'راه‌اندازی مجدد تونل یک فایروال عملیاتی را تغییر می‌دهد. طبق سیاست این کار انسان لازم دارد، پس می‌پرسم.']],
        ['approval', 'restart_tunnel', 'restart_tunnel("branch2-hq")', ['Risk: medium. The 38 users at Branch-2 are already offline.', 'ریسک: متوسط. ۳۸ کاربر Branch-2 از قبل قطع هستند.'],
          [['action', 'restart_tunnel', 'restart_tunnel("branch2-hq")', 'phase-1 OK · phase-2 established · state=UP'],
            ['action', 'ping', 'ping("10.10.5.20", probe="branch2", count=4)', '4 packets sent, 4 received, avg 11 ms'],
            ['action', 'add_work_note', 'add_work_note("INC-20931", ...)', 'note saved'],
            ['final', ['Resolved. The Branch-2 ↔ HQ tunnel was down after a failed phase-2 rekey. Restarted it with L2 approval and confirmed reachability. Suggested a problem ticket to investigate the rekey failures.', 'حل شد. تونل Branch-2 ↔ دفتر مرکزی پس از شکست rekey فاز ۲ قطع بود. با تأیید L2 دوباره راه‌اندازی و دسترس‌پذیری تأیید شد. یک تیکت problem برای بررسی شکست‌های rekey پیشنهاد شد.']]],
          [['thought', ['Not approved. Hand over to network on-call with all the evidence so nobody repeats the diagnosis.', 'تأیید نشد. با همه‌ی شواهد به on-call شبکه می‌سپارم تا کسی تشخیص را تکرار نکند.']],
            ['action', 'escalate', 'escalate(team="Network L2", ticket="INC-20931", evidence=[...])', 'assigned to Network L2 on-call'],
            ['final', ['Escalated to Network L2 with diagnosis: DNS OK, server up from HQ, tunnel branch2-hq DOWN since 09:41 (phase-2 rekey failed). No changes made.', 'با تشخیص به Network L2 ارجاع شد: DNS سالم، سرور از دفتر مرکزی در دسترس، تونل branch2-hq از ۰۹:۴۱ قطع (شکست rekey فاز ۲). هیچ تغییری انجام نشد.']]]],
      ],
    },
    disk: {
      title: ['ALERT · Disk D: on FS-02 is 94% full', 'هشدار · دیسک D: روی FS-02 ۹۴٪ پر است'],
      tools: ['get_disk_usage', 'list_large_files', 'compress_logs', 'delete_file*', 'notify_owner', 'create_ticket'],
      steps: [
        ['action', 'get_disk_usage', 'get_disk_usage(host="FS-02", volume="D:")', '{"size_gb": 2000, "used_gb": 1880, "growth_gb_per_day": 14}'],
        ['thought', ['At 14 GB a day it is full in about 8 days. Find out what grew.', 'با روزی ۱۴ گیگابایت، حدود ۸ روز دیگر پر می‌شود. پیدا کنم چه چیزی بزرگ شده.']],
        ['action', 'list_large_files', 'list_large_files(host="FS-02", path="D:\\\\", top=5)', 'D:\\Logs\\IIS\\  412 GB (files older than 30 days: 380 GB)\nD:\\Shares\\Public\\win11_23h2.iso  6 GB (owner: m.rahimi)\n…'],
        ['thought', ['Retention policy RET-03 lets me compress IIS logs older than 30 days. That is in my runbook and reversible.', 'سیاست نگهداری RET-03 اجازه می‌دهد لاگ‌های IIS قدیمی‌تر از ۳۰ روز را فشرده کنم. این در runbook من است و برگشت‌پذیر است.']],
        ['action', 'compress_logs', 'compress_logs(path="D:\\\\Logs\\\\IIS", older_than_days=30)', 'compressed 380 GB → 41 GB · freed 339 GB'],
        ['thought', ['The ISO belongs to a user. Deleting user files is not in my runbook, so I ask.', 'فایل ISO متعلق به یک کاربر است. حذف فایل‌های کاربر در runbook من نیست، پس می‌پرسم.']],
        ['approval', 'delete_file', 'delete_file("D:\\\\Shares\\\\Public\\\\win11_23h2.iso")', ['Risk: low, but it is a user file. Not covered by policy RET-03.', 'ریسک: کم، اما فایل کاربر است. سیاست RET-03 آن را پوشش نمی‌دهد.'],
          [['action', 'delete_file', 'delete_file("D:\\\\Shares\\\\Public\\\\win11_23h2.iso")', 'deleted (recycle bin, 30-day restore)'],
            ['final', ['D: is down to 76%. Compressed old IIS logs under RET-03 and deleted an approved 6 GB ISO. Opened a ticket to add IIS log rotation so this does not come back.', 'D: به ۷۶٪ رسید. لاگ‌های قدیمی IIS طبق RET-03 فشرده و یک ISO شش‌گیگابایتی با تأیید حذف شد. برای افزودن چرخش لاگ IIS تیکت باز شد تا مشکل تکرار نشود.']]],
          [['action', 'notify_owner', 'notify_owner(user="m.rahimi", file="win11_23h2.iso")', 'message sent'],
            ['final', ["D: is down to 77% after compressing old IIS logs under RET-03. Asked the ISO's owner to move it. Opened a ticket to add IIS log rotation.", 'پس از فشرده‌سازی لاگ‌های قدیمی IIS طبق RET-03، D: به ۷۷٪ رسید. از مالک ISO خواسته شد آن را جابه‌جا کند. برای افزودن چرخش لاگ IIS تیکت باز شد.']]]],
      ],
    },
    netdrift: {
      title: ['CRON 02:00 · Nightly config backup found drift on dist-sw-03', 'CRON 02:00 · پشتیبان‌گیری شبانه‌ی پیکربندی روی dist-sw-03 انحراف یافت'],
      tools: ['net_backup', 'git_diff', 'net_show', 'netbox_lookup', 'itsm_search_changes', 'create_ticket', 'notify_channel', 'net_config*'],
      steps: [
        ['action', 'net_backup', 'net_backup(group="distribution")', '12/12 devices backed up (read-only account svc-hermes-ro) · 1 device changed: dist-sw-03'],
        ['action', 'git_diff', 'git_diff("configs/dist-sw-03.cfg", since="yesterday")', '+ interface Gi1/0/24\n+  switchport access vlan 999\n+  description TEMP-VENDOR\n- interface Gi1/0/24\n-  shutdown'],
        ['thought', ['An unused port was enabled in VLAN 999. I need to know whether an approved change covers it.', 'یک پورت بلااستفاده در VLAN 999 فعال شده. باید بدانم آیا یک تغییر تأییدشده آن را پوشش می‌دهد.']],
        ['action', 'itsm_search_changes', 'itsm_search_changes(ci="dist-sw-03", window="last 24h")', 'no approved change for dist-sw-03 in the last 24 h'],
        ['action', 'net_show', 'net_show("dist-sw-03", "show mac address-table interface Gi1/0/24")', '999  a4:5e:60:12:9c:01  DYNAMIC  Gi1/0/24'],
        ['action', 'netbox_lookup', 'netbox_lookup(mac="a4:5e:60:12:9c:01")', 'not in inventory'],
        ['thought', ['Unapproved change plus an unknown device. Policy: report to network on-call and security. Do not shut the port myself; that is a change and my account is read-only anyway.', 'تغییر تأییدنشده به‌علاوه‌ی یک دستگاه ناشناس. سیاست: گزارش به on-call شبکه و امنیت. پورت را خودم نمی‌بندم؛ این یک تغییر است و حساب من به هر حال فقط‌خواندنی است.']],
        ['approval', 'net_config', 'net_config("dist-sw-03", "interface Gi1/0/24 / shutdown")', ['Not allowed by policy tier 3 (production change outside a change window). Hermes asks; the right answer is Deny.', 'طبق سطح ۳ سیاست مجاز نیست (تغییر عملیاتی بیرون از پنجره‌ی تغییر). Hermes می‌پرسد؛ پاسخ درست Deny است.'],
          [['thought', ['Even if approved here, the device account is read-only, so the command would be rejected by TACACS+. The change belongs in the change process.', 'حتی اگر اینجا تأیید شود، حساب دستگاه فقط‌خواندنی است و TACACS+ فرمان را رد می‌کند. جای این تغییر در فرایند تغییر است.']],
            ['action', 'create_ticket', 'create_ticket(queue="Network L2", priority="P2", ...)', 'INC-21307 created'],
            ['final', ['Unapproved config change on dist-sw-03 Gi1/0/24 (VLAN 999, unknown MAC). Evidence and diff attached to INC-21307; network on-call and SOC notified. No changes made by the agent.', 'تغییر پیکربندی تأییدنشده روی dist-sw-03 Gi1/0/24 (VLAN 999، MAC ناشناس). شواهد و diff به INC-21307 پیوست شد؛ on-call شبکه و SOC مطلع شدند. ایجنت هیچ تغییری انجام نداد.']]],
          [['action', 'create_ticket', 'create_ticket(queue="Network L2", priority="P2", summary="Unapproved change on dist-sw-03 Gi1/0/24", evidence=[diff, mac, no CR])', 'INC-21307 created'],
            ['action', 'notify_channel', 'notify_channel("#net-oncall", "INC-21307 …") · notify_channel("#soc", "INC-21307 …")', 'sent'],
            ['final', ['Drift reported: dist-sw-03 Gi1/0/24 enabled in VLAN 999 without a change, unknown device attached. INC-21307 raised for Network L2 and SOC with the diff and MAC evidence. No changes made.', 'انحراف گزارش شد: dist-sw-03 Gi1/0/24 بدون تغییر تأییدشده در VLAN 999 فعال شده و یک دستگاه ناشناس وصل است. INC-21307 با diff و شواهد MAC برای Network L2 و SOC ثبت شد. هیچ تغییری انجام نشد.']]]],
      ],
    },
    web5xx: {
      title: ['ALERT · portal.acme.local 5xx rate 18% (threshold 2%)', 'هشدار · نرخ 5xx در portal.acme.local برابر ۱۸٪ (آستانه ۲٪)'],
      tools: ['http_probe', 'tail_log', 'journalctl', 'systemctl_status', 'db_ping', 'systemctl_restart*', 'notify_channel'],
      steps: [
        ['action', 'http_probe', 'http_probe("https://portal.acme.local/health", count=5)', '502 502 200 502 502 · avg 3.1 s'],
        ['action', 'tail_log', 'tail_log("/var/log/nginx/portal_error.log", lines=200, grep="upstream")', '148 × "connect() failed (111: Connection refused) while connecting to upstream 127.0.0.1:8081"'],
        ['action', 'systemctl_status', 'systemctl_status("portal-api")', 'active (running) · restarted 9 times in 20 min · Main PID changes'],
        ['action', 'journalctl', 'journalctl("portal-api", since="30 min ago", grep="Error")', 'OutOfMemoryError: Java heap space (×9) · heap max 512m'],
        ['thought', ['The API is crash-looping on heap exhaustion. A restart alone will not help. The fix is a heap or config change, which is a change. Gather evidence and ask for a short-term mitigation.', 'API به‌خاطر تمام شدن heap در حلقه‌ی کرش است. ری‌استارت به‌تنهایی کمکی نمی‌کند. راه‌حل تغییر heap یا پیکربندی است، که یک تغییر محسوب می‌شود. شواهد را جمع می‌کنم و برای تسکین کوتاه‌مدت اجازه می‌گیرم.']],
        ['action', 'db_ping', 'db_ping("portal-db")', 'OK 3 ms (rules out the database)'],
        ['approval', 'systemctl_restart', 'systemctl_restart("portal-api")', ['Restarting a production service needs approval (tier 2). It may give ~15 minutes until the heap fills again.', 'ری‌استارت یک سرویس عملیاتی تأیید لازم دارد (سطح ۲). شاید حدود ۱۵ دقیقه تا پر شدن دوباره‌ی heap فرصت بدهد.'],
          [['action', 'systemctl_restart', 'systemctl_restart("portal-api")', 'restarted · /health 200 in 0.4 s'],
            ['action', 'notify_channel', 'notify_channel("#web-oncall", "…")', 'sent'],
            ['final', ['Mitigated: portal-api restarted with approval; 5xx back to 0%. Root cause: Java heap exhaustion (512m) since 10:40 deploy. Drafted a change to raise -Xmx to 1g and asked dev to check the memory leak in release 4.12.', 'تسکین داده شد: portal-api با تأیید ری‌استارت شد؛ 5xx به ۰٪ برگشت. علت ریشه‌ای: تمام شدن heap جاوا (512m) از استقرار ساعت ۱۰:۴۰. یک تغییر برای افزایش -Xmx به 1g پیش‌نویس شد و از تیم توسعه خواسته شد نشت حافظه در نسخه‌ی 4.12 را بررسی کند.']]],
          [['action', 'notify_channel', 'notify_channel("#web-oncall", "portal-api OOM crash loop, evidence attached")', 'sent'],
            ['final', ['Diagnosis sent to web on-call: portal-api crash-looping on Java heap exhaustion since the 10:40 deploy; database healthy. No restart performed (denied). Suggested rollback to release 4.11 or a heap increase via change.', 'تشخیص به on-call وب فرستاده شد: portal-api از استقرار ساعت ۱۰:۴۰ به‌خاطر تمام شدن heap جاوا در حلقه‌ی کرش است؛ پایگاه‌داده سالم است. ری‌استارت انجام نشد (رد شد). بازگشت به نسخه‌ی 4.11 یا افزایش heap از طریق تغییر پیشنهاد شد.']]]],
      ],
    },
    phish: {
      title: ['REPORT · user forwarded “Your mailbox is 98% full”', 'گزارش · کاربر «صندوق پست شما ۹۸٪ پر است» را فوروارد کرد'],
      tools: ['parse_eml', 'check_auth_results', 'url_reputation', 'hash_lookup', 'search_mail_logs', 'draft_block_rule*', 'create_ticket'],
      steps: [
        ['action', 'parse_eml', 'parse_eml("report-55812.eml")', 'From: "IT Support" <it-support@acme-helpdesk.co> · Reply-To: …@mail.ru · 1 URL · no attachments'],
        ['action', 'check_auth_results', 'check_auth_results("report-55812.eml")', 'SPF: fail · DKIM: none · DMARC: fail (lookalike domain acme-helpdesk.co, registered 3 days ago)'],
        ['thought', ['Display name imitates IT, lookalike domain, auth fails. Check the URL by reputation only. Policy: never open it and never upload company content to public scanners.', 'نام نمایشی از IT تقلید می‌کند، دامنه شبیه‌سازی‌شده است و احراز هویت شکست خورده. URL را فقط از نظر اعتبار بررسی می‌کنم. سیاست: هرگز بازش نکن و هرگز محتوای شرکت را در اسکنرهای عمومی بارگذاری نکن.']],
        ['action', 'url_reputation', 'url_reputation("hxxps://acme-helpdesk.co/owa/login")', 'known credential-phishing kit · first seen 2 days ago'],
        ['action', 'search_mail_logs', 'search_mail_logs(sender_domain="acme-helpdesk.co", last="72h")', '41 recipients · 3 clicked (proxy logs)'],
        ['thought', ['Confirmed phishing campaign; 3 users clicked. Blocking the domain is a change to the mail gateway, so it needs approval. Password resets for clickers are handled by the identity team, not by me.', 'کارزار فیشینگ تأیید شد؛ ۳ کاربر کلیک کرده‌اند. مسدود کردن دامنه تغییری در mail gateway است، پس تأیید لازم دارد. بازنشانی رمز کلیک‌کنندگان با تیم هویت است، نه با من.']],
        ['approval', 'draft_block_rule', 'apply_block_rule(domain="acme-helpdesk.co", scope="mail + web proxy")', ['Tier 2: security control change. Approve to apply via the security-gateway API.', 'سطح ۲: تغییر کنترل امنیتی. برای اعمال از طریق API گیت‌وی امنیتی تأیید کنید.'],
          [['action', 'draft_block_rule', 'apply_block_rule(domain="acme-helpdesk.co")', 'blocked on mail gateway and web proxy'],
            ['action', 'create_ticket', 'create_ticket(queue="SOC", priority="P2", ...)', 'SEC-3381 created with IOCs; identity team tasked to reset 3 users'],
            ['final', ['Confirmed phishing (lookalike domain, SPF/DMARC fail, known kit). Domain blocked with approval. 41 recipients, 3 clicks → SEC-3381 with IOCs; identity team resetting the 3 accounts.', 'فیشینگ تأیید شد (دامنه‌ی شبیه‌سازی‌شده، شکست SPF/DMARC، کیت شناخته‌شده). دامنه با تأیید مسدود شد. ۴۱ گیرنده، ۳ کلیک ← SEC-3381 با نشانگرهای نفوذ؛ تیم هویت ۳ حساب را بازنشانی می‌کند.']]],
          [['action', 'create_ticket', 'create_ticket(queue="SOC", priority="P2", iocs=[...], recommended="block domain")', 'SEC-3381 created'],
            ['final', ['Confirmed phishing campaign; 41 recipients, 3 clicks. Block not applied (denied). SEC-3381 holds IOCs and the recommended block for the SOC analyst on duty.', 'کارزار فیشینگ تأیید شد؛ ۴۱ گیرنده، ۳ کلیک. مسدودسازی اعمال نشد (رد شد). SEC-3381 نشانگرهای نفوذ و مسدودسازی پیشنهادی را برای تحلیلگر SOC کشیک نگه می‌دارد.']]]],
      ],
    },
  };

  /* ---------------- Policy tier game ---------------- */
  const TIERS = [['T0', L('Auto: read / diagnose', 'خودکار: خواندن / تشخیص')], ['T1', L('Auto: low-risk, in runbook', 'خودکار: کم‌خطر، در runbook')], ['T2', L('Needs human approval', 'نیازمند تأیید انسانی')], ['T3', L('Forbidden for agents', 'ممنوع برای ایجنت‌ها')]];
  const TEAMS = { network: L('Network', 'شبکه'), helpdesk: 'Helpdesk', datacenter: L('Datacenter', 'دیتاسنتر'), web: L('Web / dev', 'وب / توسعه'), security: L('Security', 'امنیت') };
  // [action, tier, why]
  const ACTS = {
    network: [
      [L('show interfaces counters errors on all access switches', 'اجرای show interfaces counters errors روی همه‌ی سوییچ‌های دسترسی'), 0, L('Read-only show command through the net-show wrapper with the read-only TACACS account.', 'فرمان show فقط‌خواندنی از طریق wrapper نت‌شو با حساب TACACS فقط‌خواندنی.')],
      [L('Nightly backup of running configs to git', 'پشتیبان‌گیری شبانه‌ی پیکربندی‌های در حال اجرا در git'), 0, L('Read-only; the backup script uses the read-only account and only writes to the configs repo.', 'فقط‌خواندنی؛ اسکریپت پشتیبان از حساب فقط‌خواندنی استفاده می‌کند و فقط در مخزن پیکربندی‌ها می‌نویسد.')],
      [L('Clear interface counters on a user access port', 'پاک کردن شمارنده‌های اینترفیس روی پورت دسترسی کاربر'), 1, L('Low impact and reversible, and listed in the runbook. Some teams still treat it as T2: decide it in the policy, not in the moment.', 'اثر کم و برگشت‌پذیر، و در runbook آمده. برخی تیم‌ها هنوز آن را T2 می‌دانند: در سیاست تصمیم بگیرید، نه در لحظه.')],
      [L('Shut down an access port with an unknown device in VLAN 999', 'بستن یک پورت دسترسی با دستگاه ناشناس در VLAN 999'), 2, L('A production change. The agent drafts it with evidence; the on-call engineer approves and applies it.', 'یک تغییر عملیاتی. ایجنت آن را با شواهد پیش‌نویس می‌کند؛ مهندس on-call تأیید و اعمال می‌کند.')],
      [L('Add VLAN 210 to the trunk on core-sw-02', 'افزودن VLAN 210 به trunk روی core-sw-02'), 2, L('A planned change: CR, CAB approval, change window. The agent prepares config, rollback and checks; the pipeline or a human applies.', 'یک تغییر برنامه‌ریزی‌شده: CR، تأیید CAB، پنجره‌ی تغییر. ایجنت پیکربندی، بازگشت و بررسی‌ها را آماده می‌کند؛ خط لوله یا یک انسان اعمال می‌کند.')],
      [L('reload / write erase / change AAA or SNMP community', 'reload / write erase / تغییر AAA یا SNMP community'), 3, L('Never by an agent. Denied by approvals.deny and by TACACS+ command authorization.', 'هرگز توسط ایجنت. با approvals.deny و مجوزدهی فرمان TACACS+ رد می‌شود.')],
    ],
    helpdesk: [
      [L('Look up a user’s lockout status and lockout source', 'جست‌وجوی وضعیت و منبع قفل شدن حساب یک کاربر'), 0, L('Read-only queries through the JEA endpoint.', 'پرس‌وجوهای فقط‌خواندنی از طریق نقطه‌ی پایانی JEA.')],
      [L('Unlock a standard user account after the callback identity check', 'باز کردن قفل حساب یک کاربر عادی پس از بررسی هویت با تماس برگشتی'), 1, L('In the runbook; JEA only exposes Unlock-ADAccount, and AD delegation limits it to the Users OU.', 'در runbook است؛ JEA فقط Unlock-ADAccount را در اختیار می‌گذارد و واگذاری AD آن را به OU کاربران محدود می‌کند.')],
      [L('Reset a user’s password', 'بازنشانی رمز عبور یک کاربر'), 2, L('Identity-sensitive. A human verifies identity and approves; never through chat alone.', 'حساس به هویت. یک انسان هویت را بررسی و تأیید می‌کند؛ هرگز فقط از طریق گفت‌وگو.')],
      [L('Add a user to a file-share security group', 'افزودن کاربر به گروه امنیتی یک پوشه‌ی اشتراکی'), 2, L('Access change. Needs the data owner’s approval in the ticket.', 'تغییر دسترسی. تأیید مالک داده در تیکت لازم است.')],
      [L('Add someone to Domain Admins', 'افزودن کسی به Domain Admins'), 3, L('Never. The agent’s account has no rights on admin groups, and privileged access goes through PAM.', 'هرگز. حساب ایجنت هیچ حقی روی گروه‌های مدیر ندارد و دسترسی ممتاز از مسیر PAM می‌گذرد.')],
      [L('Draft a reply to a ticket from the KB', 'پیش‌نویس پاسخ یک تیکت از روی KB'), 0, L('Text only. A human or a rule decides whether it is sent.', 'فقط متن. یک انسان یا یک قاعده تصمیم می‌گیرد ارسال شود یا نه.')],
    ],
    datacenter: [
      [L('Read hardware health from iDRAC/iLO over Redfish', 'خواندن سلامت سخت‌افزار از iDRAC/iLO با Redfish'), 0, L('BMC account with the ReadOnly role.', 'حساب BMC با نقش ReadOnly.')],
      [L('Compress IIS logs older than 30 days under policy RET-03', 'فشرده‌سازی لاگ‌های IIS قدیمی‌تر از ۳۰ روز طبق سیاست RET-03'), 1, L('Reversible and covered by a written retention policy.', 'برگشت‌پذیر و تحت پوشش یک سیاست نگهداری مکتوب.')],
      [L('Restart a production VM that is hung', 'ری‌استارت یک VM عملیاتی که هنگ کرده'), 2, L('Service impact. Approval by the on-call engineer.', 'اثر بر سرویس. با تأیید مهندس on-call.')],
      [L('Run a test restore of last night’s backup into the isolated restore lab', 'بازیابی آزمایشی پشتیبان دیشب در آزمایشگاه بازیابی ایزوله'), 1, L('Writes only to the restore lab. Proves backups work.', 'فقط در آزمایشگاه بازیابی می‌نویسد. ثابت می‌کند پشتیبان‌ها کار می‌کنند.')],
      [L('Delete old VM snapshots on the production cluster', 'حذف snapshotهای قدیمی VM روی کلاستر عملیاتی'), 2, L('Destructive; needs approval and an owner check.', 'مخرب؛ تأیید و بررسی مالک لازم دارد.')],
      [L('Power-cycle a host through the BMC', 'خاموش/روشن کردن یک میزبان از طریق BMC'), 3, L('Not for agents in production. BMC account is ReadOnly.', 'در محیط عملیاتی برای ایجنت‌ها نیست. حساب BMC فقط ReadOnly است.')],
    ],
    web: [
      [L('curl the health endpoints and read nginx error logs', 'curl روی endpointهای سلامت و خواندن لاگ خطای nginx'), 0, L('Read-only. Log access via the adm group.', 'فقط‌خواندنی. دسترسی به لاگ از طریق گروه adm.')],
      [L('Check TLS certificate expiry dates', 'بررسی تاریخ انقضای گواهی‌های TLS'), 0, L('openssl against public endpoints; read-only.', 'openssl روی endpointهای عمومی؛ فقط‌خواندنی.')],
      ['certbot renew --dry-run', 1, L('A dry run changes nothing.', 'اجرای آزمایشی چیزی را تغییر نمی‌دهد.')],
      [L('Restart the portal-api service', 'ری‌استارت سرویس portal-api'), 2, L('systemctl restart triggers a Hermes approval on the ssh backend.', 'systemctl restart روی backend ssh تأیید Hermes را فعال می‌کند.')],
      [L('Open a pull request that bumps a vulnerable dependency', 'باز کردن یک PR برای ارتقای یک وابستگی آسیب‌پذیر'), 1, L('A PR changes nothing until a human reviews and merges it.', 'PR تا وقتی انسان بازبینی و merge نکند چیزی را تغییر نمی‌دهد.')],
      [L('Push directly to main or deploy to production', 'push مستقیم به main یا استقرار در محیط عملیاتی'), 3, L('Denied: branch protection plus approvals.deny on deploy commands.', 'ممنوع: محافظت شاخه به‌علاوه‌ی approvals.deny روی فرمان‌های استقرار.')],
    ],
    security: [
      [L('Parse a reported phishing email and check SPF/DKIM/DMARC', 'تحلیل یک ایمیل فیشینگ گزارش‌شده و بررسی SPF/DKIM/DMARC'), 0, L('Analysis of a copy; nothing leaves the building.', 'تحلیل یک نسخه؛ هیچ چیز از سازمان خارج نمی‌شود.')],
      [L('Look up a URL or file hash in a reputation service', 'جست‌وجوی یک URL یا hash فایل در یک سرویس اعتبار'), 0, L('Hash and URL lookups only; never upload company files to public scanners.', 'فقط جست‌وجوی hash و URL؛ هرگز فایل‌های شرکت را در اسکنرهای عمومی بارگذاری نکنید.')],
      [L('Diff Domain Admins membership against the approved baseline', 'مقایسه‌ی عضویت Domain Admins با خط مبنای تأییدشده'), 0, L('Read-only, daily.', 'فقط‌خواندنی، روزانه.')],
      [L('Block a phishing domain on the mail gateway', 'مسدود کردن یک دامنه‌ی فیشینگ روی mail gateway'), 2, L('A security control change, approved by the SOC analyst on duty.', 'تغییر یک کنترل امنیتی، با تأیید تحلیلگر SOC کشیک.')],
      [L('Isolate an endpoint in EDR', 'ایزوله کردن یک endpoint در EDR'), 2, L('High impact on the user. Approval required; for a confirmed ransomware playbook some SOCs pre-approve it, and that is written policy.', 'اثر زیاد بر کاربر. تأیید لازم است؛ برخی SOCها برای playbook باج‌افزار تأییدشده از پیش مجازش می‌کنند، و این سیاست مکتوب است.')],
      [L('Disable EDR, logging or an alert rule to reduce noise', 'غیرفعال کردن EDR، لاگ یا یک قاعده‌ی هشدار برای کاهش نویز'), 3, L('Never. Defence-impairment is forbidden for agents.', 'هرگز. تضعیف دفاع برای ایجنت‌ها ممنوع است.')],
    ],
  };
  W.policyGame = function (el, o) {
    const b = A.frame(el, L('Which policy tier is this action?', 'این اقدام در کدام سطح سیاست است؟'), L('Exercise', 'تمرین'));
    const id = uid('pg');
    const role = o.role || 'network';
    b.innerHTML = `<div class="w-row"><label>${L('Team', 'تیم')} <select id="${id}-r">${Object.keys(ACTS).map((k) => `<option value="${k}" ${k === role ? 'selected' : ''}>${TEAMS[k]}</option>`).join('')}</select></label></div><div id="${id}-l" style="display:grid;gap:8px"></div><div class="w-row"><button type="button" class="btn small primary" id="${id}-c">${L('Check', 'بررسی')}</button><span class="label" id="${id}-s"></span></div>`;
    let ans = [];
    const draw = () => {
      const list = ACTS[$('#' + id + '-r', b).value]; ans = list.map(() => null);
      $('#' + id + '-l', b).innerHTML = list.map((x, i) => `<div class="inj" data-i="${i}"><div class="txt bidi"><b>${esc(x[0])}</b></div><span class="seg">${TIERS.map((t, j) => `<button type="button" data-v="${j}" title="${esc(t[1])}">${t[0]}</button>`).join('')}</span><div class="why" hidden></div></div>`).join('');
      $('#' + id + '-s', b).textContent = L('T0 read · T1 low-risk auto · T2 approval · T3 forbidden', 'T0 خواندن · T1 خودکار کم‌خطر · T2 تأیید · T3 ممنوع');
    };
    $('#' + id + '-r', b).onchange = draw;
    b.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-v]');
      if (btn) { const c = btn.closest('[data-i]'); ans[+c.dataset.i] = +btn.dataset.v; $$('.seg button', c).forEach((x) => x.classList.toggle('on', x === btn)); }
      if (e.target.id === id + '-c') {
        const list = ACTS[$('#' + id + '-r', b).value]; let ok = 0;
        list.forEach((x, i) => { const w = $(`[data-i="${i}"] .why`, b), r = ans[i] === x[1]; if (r) ok++; w.hidden = false; w.innerHTML = `<span class="pill ${r ? 'ok' : ans[i] == null ? 'mut' : 'crit'}">${ans[i] == null ? L('Not answered', 'بی‌پاسخ') : r ? L('Matches policy', 'منطبق با سیاست') : L('Policy says {0}', 'سیاست می‌گوید {0}', TIERS[x[1]][0])}</span> <b>${TIERS[x[1]][0]} · ${TIERS[x[1]][1]}.</b> ${x[2]}`; });
        $('#' + id + '-s', b).textContent = L('{0} / {1} match the policy', '{0} از {1} منطبق با سیاست', ok, list.length);
      }
    });
    draw();
  };

  W.agentLoop = function (el, o) {
    const b = A.frame(el, L('Agent loop simulator: think → act → observe', 'شبیه‌ساز حلقه‌ی ایجنت: فکر ← اقدام ← مشاهده'), L('Simulation', 'شبیه‌سازی'));
    const id = uid('al');
    const autoTxt = L('Auto-play', 'پخش خودکار');
    b.innerHTML = `<div class="w-row"><label>${L('Scenario', 'سناریو')} <select id="${id}-s">${Object.keys(SCEN).map((k) => `<option value="${k}" ${k === (o.scenario || 'intranet') ? 'selected' : ''}>${esc(T(SCEN[k].title))}</option>`).join('')}</select></label></div>
      <div class="w-row"><span class="label">${L('Tools the harness gives this agent', 'ابزارهایی که هارنس به این ایجنت می‌دهد')}</span><div class="toolchips" id="${id}-t"></div></div>
      <div class="w-row"><button type="button" class="btn small primary" id="${id}-n">${L('Next step', 'گام بعد')}</button><button type="button" class="btn small" id="${id}-p">${autoTxt}</button><button type="button" class="btn small" id="${id}-r">${L('Reset', 'از نو')}</button>
      <span class="spacer" style="flex:1"></span><span class="chip" id="${id}-c"></span></div>
      <div class="trace" id="${id}-l" aria-live="polite"></div>`;
    let S, queue, iter, tokens, timer, waiting;
    const reset = () => {
      clearInterval(timer); timer = null; $('#' + id + '-p', b).textContent = autoTxt;
      S = SCEN[$('#' + id + '-s', b).value]; queue = S.steps.slice(); iter = 0; tokens = 2400; waiting = false;
      $('#' + id + '-l', b).innerHTML = `<div class="tr obs"><span class="k">${L('Goal', 'هدف')}</span><div>${esc(T(S.title))}</div></div>`;
      tools(); stat();
    };
    const tools = (hot) => { $('#' + id + '-t', b).innerHTML = S.tools.map((t) => { const nm = t.replace('*', ''); return `<span class="toolchip ${t.endsWith('*') ? 'risky' : ''} ${nm === hot ? 'hot' : ''}">${nm}</span>`; }).join(''); };
    const stat = () => { $('#' + id + '-c', b).textContent = L('LLM calls: {0} · context ≈ {1} tokens', 'فراخوانی LLM: {0} · زمینه ≈ {1} توکن', iter, fmt(tokens)); };
    const add = (cls, k, html) => { const d = document.createElement('div'); d.className = `tr ${cls} new`; d.innerHTML = `<span class="k">${k}</span><div>${html}</div>`; const l = $('#' + id + '-l', b); l.appendChild(d); l.scrollTop = l.scrollHeight; return d; };
    const stop = () => { clearInterval(timer); timer = null; $('#' + id + '-p', b).textContent = autoTxt; };
    const step = () => {
      if (waiting) return;
      const s = queue.shift();
      if (!s) { stop(); return; }
      if (s[0] === 'thought') { iter++; tokens += 180; add('thought', L('Thought', 'فکر'), esc(T(s[1]))); tools(); }
      else if (s[0] === 'action') { tokens += 260; tools(s[1]); add('action', L('Action', 'اقدام'), `<code>${esc(s[2])}</code><pre>${esc(s[3])}</pre>`); }
      else if (s[0] === 'final') { iter++; add('final', L('Answer', 'پاسخ'), esc(T(s[1]))); tools(); stop(); }
      else if (s[0] === 'approval') {
        waiting = true; stop();
        tools(s[1]);
        const d = add('approval', L('Approval', 'تأیید'), `${L('The agent wants to run', 'ایجنت می‌خواهد اجرا کند:')} <code>${esc(s[2])}</code><br>${esc(T(s[3]))}<div class="w-row" style="margin-top:8px"><button type="button" class="btn small primary" data-ap="1">${L('Approve once', 'یک بار تأیید')}</button><button type="button" class="btn small" data-ap="0">${L('Deny', 'رد')}</button></div>`);
        d.addEventListener('click', (e) => {
          const x = e.target.closest('[data-ap]'); if (!x) return;
          waiting = false; $$('[data-ap]', d).forEach((q) => (q.disabled = true));
          x.textContent = x.dataset.ap === '1' ? L('Approved ✓', 'تأیید شد ✓') : L('Denied ✗', 'رد شد ✗');
          queue.unshift(...(x.dataset.ap === '1' ? s[4] : s[5])); step();
        });
      }
      stat();
    };
    $('#' + id + '-n', b).onclick = step;
    $('#' + id + '-r', b).onclick = reset;
    $('#' + id + '-s', b).onchange = reset;
    $('#' + id + '-p', b).onclick = (e) => { if (timer) stop(); else { e.target.textContent = L('Pause', 'توقف'); step(); timer = setInterval(step, 1300); } };
    reset();
  };

  /* ---------------- MCP message flow ---------------- */
  W.mcpFlow = function (el) {
    const b = A.frame(el, L('MCP step by step: an agent asks ServiceNow for a ticket', 'MCP گام‌به‌گام: یک ایجنت تیکتی را از ServiceNow می‌خواهد'), L('Walkthrough', 'گام‌به‌گام'));
    const id = uid('mc');
    const lanes = [L('You', 'شما'), L('Hermes (host + client)', 'Hermes (میزبان + کلاینت)'), L('itsm-mcp server', 'سرور itsm-mcp'), 'ServiceNow API'];
    // [from, to, label, explanation, payload]
    const M = [
      [1, 2, 'initialize', L('Hermes starts the MCP server from config.yaml (stdio) and says hello.', 'Hermes سرور MCP را از روی config.yaml (stdio) اجرا می‌کند و سلام می‌دهد.'), '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","clientInfo":{"name":"hermes"}}}'],
      [2, 1, 'capabilities', L('The server answers with what it supports: tools, maybe resources and prompts.', 'سرور با آنچه پشتیبانی می‌کند پاسخ می‌دهد: ابزارها، و شاید منابع و پرامپت‌ها.'), '{"jsonrpc":"2.0","id":1,"result":{"capabilities":{"tools":{}},"serverInfo":{"name":"itsm-mcp","version":"0.3.0"}}}'],
      [1, 2, 'tools/list', L('Hermes asks which tools exist.', 'Hermes می‌پرسد چه ابزارهایی وجود دارد.'), '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'],
      [2, 1, L('tool schemas', 'schemaهای ابزار'), L("Each tool comes with a name, a description and a JSON Schema for its inputs. These go into the LLM's context.", 'هر ابزار یک نام، یک توضیح و یک JSON Schema برای ورودی‌هایش دارد. این‌ها وارد زمینه‌ی LLM می‌شوند.'), '{"result":{"tools":[\n {"name":"get_ticket","description":"Fetch an incident by number","inputSchema":{"type":"object","properties":{"number":{"type":"string"}},"required":["number"]}},\n {"name":"add_work_note", ...},\n {"name":"search_kb", ...}]}}'],
      [0, 1, L('“Status of INC-20931?”', '«وضعیت INC-20931؟»'), L('You ask a question in plain language.', 'شما به زبان ساده سؤالی می‌پرسید.'), L('What is the status of INC-20931 and who has it?', 'وضعیت INC-20931 چیست و دست چه کسی است؟')],
      [1, 1, L('LLM picks a tool', 'LLM ابزاری انتخاب می‌کند'), L('The model sees the tool list and answers with a structured tool call instead of text.', 'مدل فهرست ابزارها را می‌بیند و به‌جای متن، با یک فراخوانی ساختاریافته‌ی ابزار پاسخ می‌دهد.'), '{"type":"tool_use","name":"get_ticket","input":{"number":"INC-20931"}}'],
      [1, 2, 'tools/call', L('Hermes forwards the call to the right server, after its own approval and allowlist checks.', 'Hermes پس از بررسی‌های تأیید و فهرست مجاز خودش، فراخوانی را به سرور درست می‌فرستد.'), '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_ticket","arguments":{"number":"INC-20931"}}}'],
      [2, 3, 'GET /incident', L('The server translates the call into the real API request, using its own service-account token.', 'سرور فراخوانی را با توکن حساب سرویس خودش به درخواست واقعی API ترجمه می‌کند.'), 'GET /api/now/table/incident?sysparm_query=number=INC-20931\nAuthorization: Bearer ****'],
      [3, 2, '200 OK', L('ServiceNow returns JSON.', 'ServiceNow یک JSON برمی‌گرداند.'), '{"number":"INC-20931","state":"In Progress","assigned_to":"Network L2","short_description":"Intranet unreachable from Branch-2"}'],
      [2, 1, L('tool result', 'نتیجه‌ی ابزار'), L('The server returns the result to Hermes, which adds it to the context.', 'سرور نتیجه را به Hermes برمی‌گرداند و Hermes آن را به زمینه اضافه می‌کند.'), '{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"INC-20931 · In Progress · Network L2 · Intranet unreachable from Branch-2"}]}}'],
      [1, 0, L('answer', 'پاسخ'), L('The LLM writes the final answer from the tool result.', 'LLM پاسخ نهایی را از روی نتیجه‌ی ابزار می‌نویسد.'), L('INC-20931 is In Progress and assigned to Network L2. It is about the intranet being unreachable from Branch-2.', 'INC-20931 در حال انجام است و به Network L2 سپرده شده. موضوعش دسترسی‌ناپذیری اینترانت از Branch-2 است.')],
    ];
    b.innerHTML = `<div class="fig-scroll" id="${id}-d"></div><div class="w-row"><button type="button" class="btn small" id="${id}-p">${L('← Back', 'قبلی')}</button><button type="button" class="btn small primary" id="${id}-n">${L('Next message →', 'پیام بعد')}</button><span class="label" id="${id}-c"></span></div><div id="${id}-x"></div>`;
    let i = 0;
    const draw = () => {
      $('#' + id + '-d', b).innerHTML = A.D.seq(lanes, M.map((m, j) => [m[0], m[1], m[2], j === i ? 'acc' : j < i ? '' : 'dash']), { focus: M[i][1] });
      $('#' + id + '-c', b).textContent = L('Message {0} of {1}', 'پیام {0} از {1}', i + 1, M.length);
      $('#' + id + '-x', b).innerHTML = `<p style="margin-bottom:8px">${esc(M[i][3])}</p>${A.H.code(M[i][4], 'json', M[i][2])}`;
      $('#' + id + '-p', b).disabled = i === 0; $('#' + id + '-n', b).disabled = i === M.length - 1;
    };
    $('#' + id + '-n', b).onclick = () => { i = Math.min(M.length - 1, i + 1); draw(); };
    $('#' + id + '-p', b).onclick = () => { i = Math.max(0, i - 1); draw(); };
    draw();
  };

  /* ---------------- Simulated Hermes terminal ---------------- */
  const OUT = {
    'help': L('Simulated commands you can try:', 'فرمان‌های شبیه‌سازی‌شده که می‌توانید امتحان کنید:') + '\n  curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash\n  source ~/.bashrc · hermes --version · hermes doctor · hermes model · hermes setup\n  hermes · hermes tools · hermes skills browse · hermes skills search <word>\n  hermes skills install <slug> · hermes skills list · hermes mcp catalog\n  hermes cron list · hermes gateway status · hermes profile list\n  hermes profile create <name> · ls ~/.hermes · cat ~/.hermes/config.yaml\n  ollama pull qwen3:32b · ollama ps · nvidia-smi · clear',
    'curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash': '<span class="hl">☤ Hermes Agent installer</span>\n✓ git, curl, tar found\n✓ downloaded verified uv\n✓ cloned hermes-agent → ~/.hermes/hermes-agent\n✓ PM: Python 3.14, Node.js, ripgrep, FFmpeg\n✓ browser tools (agent-browser + Chromium)\n✓ launcher → ~/.local/bin/hermes\n<span class="dim">  full log: ~/.hermes/logs/install.log</span>\n\nNext: reload your shell, then run  <span class="hl">hermes setup</span>',
    'source ~/.bashrc': '',
    'hermes --version': `Hermes Agent  <span class="dim">${L('(stable channel; your version will differ)', '(کانال stable؛ نسخه‌ی شما متفاوت خواهد بود)')}</span>`,
    'hermes doctor': '<span class="hl">Hermes doctor</span>\n✓ Python environment OK\n✓ config.yaml parsed\n✓ provider credentials found\n✓ model context ≥ 64K\n<span class="er">✗ terminal backend docker: docker daemon not reachable</span>\n  fix: start Docker, or  hermes config set terminal.backend local\n✓ skills directory OK',
    'hermes model': `<span class="hl">Select provider</span>\n  ❯ Nous Portal (OAuth)\n    OpenRouter\n    Anthropic\n    OpenAI Codex (ChatGPT subscription)\n    AWS Bedrock · Azure Foundry · Google AI Studio\n    LM Studio · Ollama Cloud\n    Custom endpoint (vLLM / Ollama / llama.cpp)\n<span class="dim">  ${L('(interactive menu; arrow keys + Enter in the real CLI)', '(منوی تعاملی؛ در CLI واقعی با کلیدهای جهت + Enter)')}</span>`,
    'hermes setup': `<span class="hl">Hermes setup</span>\n  ❯ Quick Setup (Nous Portal)   OAuth, model + Tool Gateway\n    Full Setup                  bring your own keys, walk through everything\n    Blank Slate                 minimal: provider, file + terminal toolsets only\n<span class="dim">  ${L('Tip for production pilots: Blank Slate, then enable only what you need.', 'نکته برای پایلوت‌های عملیاتی: Blank Slate، سپس فقط آنچه لازم دارید را فعال کنید.')}</span>`,
    'hermes': `<span class="hl">☤ Hermes Agent</span>   model: your-provider/your-model   profile: default\n  tools: terminal, file, web, memory, skills, delegation, cronjob …\n  skills: 80+ installed · type / for commands\n\n<span class="pr">❯</span> <span class="dim">${L('(interactive session; type /help, /tools, /model, /skills, /new …)', '(نشست تعاملی؛ /help، /tools، /model، /skills، /new … را تایپ کنید)')}</span>`,
    'hermes tools': `<span class="dim">${L('Opens an interactive picker to enable or disable toolsets per platform (cli, telegram, slack …).', 'یک انتخابگر تعاملی باز می‌کند تا toolsetها را برای هر سکو (cli، telegram، slack …) فعال یا غیرفعال کنید.')}</span>\n  [x] terminal   [x] file   [x] web   [ ] browser   [x] memory\n  [x] skills     [x] todo   [x] delegation   [ ] image_gen   [x] cronjob`,
    'hermes skills browse': '<span class="hl">Skills Hub</span>  (official first)\n  official/security/1password        Use 1Password CLI for secrets\n  official/devops/…                  …\n  skills-sh/…                        …\n<span class="dim">  use: hermes skills inspect <slug>  then  hermes skills install <slug></span>',
    'hermes skills list': `NAME                    SOURCE     CATEGORY\ngithub-pr-workflow      bundled    devops\ntest-driven-development bundled    software\nocr-and-documents       bundled    productivity\nnetwork-triage          local      it-ops   <span class="hl">${L('← the one you wrote in Lab 5', '← همانی که در آزمایشگاه ۵ نوشتید')}</span>\n…`,
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
    const b = A.frame(el, o.title ? A.tr(o.title) : L('Practice terminal', 'ترمینال تمرینی'), L('Simulated', 'شبیه‌سازی‌شده'));
    const id = uid('tm');
    const chips = o.chips || ['hermes --version', 'hermes doctor', 'help'];
    b.innerHTML = `<div class="term bidi" id="${id}-o" aria-live="polite"><span class="dim">${L('Practice terminal. Outputs are illustrative; run the real commands on your lab VM.\nType a command or click one below. Type "help" for the list.', 'ترمینال تمرینی. خروجی‌ها نمایشی‌اند؛ فرمان‌های واقعی را روی VM آزمایشگاه اجرا کنید.\nیک فرمان تایپ کنید یا روی یکی از فرمان‌های زیر کلیک کنید. برای فهرست، "help" را تایپ کنید.')}</span>\n</div>
      <form class="term-in" id="${id}-f"><span class="label">$</span><input type="text" id="${id}-i" autocomplete="off" spellcheck="false" aria-label="${L('Command', 'فرمان')}"><button class="btn small" type="submit">${L('Run', 'اجرا')}</button></form>
      <div class="cmdchips">${chips.map((c) => `<button type="button" class="cmdchip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
    const out = $('#' + id + '-o', b);
    const run = (cmd) => {
      cmd = cmd.trim(); if (!cmd) return;
      if (cmd === 'clear') { out.innerHTML = ''; return; }
      let r = OUT[cmd];
      if (r == null) {
        if (/^hermes skills search /.test(cmd)) r = `Searching hub for "${esc(cmd.slice(21))}" …\n  <span class="dim">${L('(results come from the official hub, skills.sh and other well-known sources)', '(نتایج از هاب رسمی، skills.sh و دیگر منابع شناخته‌شده می‌آیند)')}</span>`;
        else if (/^hermes skills (install|inspect) /.test(cmd)) r = `Fetching ${esc(cmd.split(' ').pop())} into quarantine …\n✓ security scan: no findings\n✓ installed → ~/.hermes/skills/  <span class="dim">${L('(now available as /&lt;skill-name&gt;)', '(اکنون به‌صورت /&lt;skill-name&gt; در دسترس است)')}</span>`;
        else if (/^hermes profile create /.test(cmd)) { const nm = esc(cmd.split(/\s+/)[3] || 'agent'); r = `✓ created profile ${nm} → ~/.hermes/profiles/${nm}\n✓ alias command: <span class="hl">${nm}</span>  (try: ${nm} setup, ${nm} chat)`; }
        else if (/^hermes cron create /.test(cmd)) r = '✓ job created  <span class="dim">(see: hermes cron list)</span>';
        else if (/^hermes config set /.test(cmd)) r = `✓ saved  <span class="dim">${L('(secrets → ~/.hermes/.env, settings → config.yaml)', '(secretها ← ~/.hermes/.env، تنظیمات ← config.yaml)')}</span>`;
        else r = `<span class="er">${L('not simulated:', 'شبیه‌سازی نشده:')}</span> ${esc(cmd)}\n<span class="dim">${L('type "help" for commands this practice terminal knows', 'برای فرمان‌هایی که این ترمینال تمرینی می‌شناسد "help" را تایپ کنید')}</span>`;
      }
      out.innerHTML += `<span class="pr">you@it-lab</span>:<span class="hl">~</span>$ ${esc(cmd)}\n${r}${r ? '\n' : ''}`;
      out.scrollTop = out.scrollHeight;
    };
    $('#' + id + '-f', b).addEventListener('submit', (e) => { e.preventDefault(); const i = $('#' + id + '-i', b); run(i.value); i.value = ''; });
    b.addEventListener('click', (e) => { const c = e.target.closest('[data-c]'); if (c) run(c.dataset.c); });
  };

  /* ---------------- SKILL.md builder ---------------- */
  // Each text field is an [en, fa] pair; a skill can be written in either language.
  const SK = {
    'network-triage': {
      d: ['Diagnose “site X cannot reach service Y” network tickets', 'تشخیص تیکت‌های شبکه‌ی «سایت X به سرویس Y نمی‌رسد»'], cat: 'it-ops', ts: 'terminal',
      when: ['A ticket or alert says users at one site cannot reach an internal service, but other sites can.', 'یک تیکت یا هشدار می‌گوید کاربران یک سایت به یک سرویس داخلی نمی‌رسند، اما سایت‌های دیگر می‌رسند.'],
      proc: ["Identify the user's site and device from the ticket.\nResolve the service name from the site probe (nslookup).\nPing the service IP from the site probe and from the HQ probe.\nIf only the site fails, check the site-to-site tunnel status.\nCollect evidence and propose the fix. Never restart network devices without approval.", 'سایت و دستگاه کاربر را از تیکت مشخص کن.\nنام سرویس را از probe سایت resolve کن (nslookup).\nIP سرویس را از probe سایت و از probe دفتر مرکزی ping کن.\nاگر فقط سایت شکست می‌خورد، وضعیت تونل site-to-site را بررسی کن.\nشواهد را جمع کن و راه‌حل پیشنهاد بده. هرگز بدون تأیید دستگاه شبکه را ری‌استارت نکن.'],
      pit: ['ICMP may be blocked by policy, so also test TCP 443 with nc -zv before concluding.\nDNS answers from cache can hide a broken resolver, so query the resolver IP directly.', 'ممکن است ICMP طبق سیاست مسدود باشد، پس پیش از نتیجه‌گیری TCP 443 را هم با nc -zv آزمایش کن.\nپاسخ‌های DNS از cache می‌توانند خرابی resolver را پنهان کنند، پس مستقیم از IP خود resolver بپرس.'],
      ver: ["The user's site probe reaches the service on its real port, and evidence is in the ticket work notes.", 'probe سایت کاربر روی پورت واقعی به سرویس می‌رسد و شواهد در یادداشت‌های کاری تیکت ثبت شده است.'],
    },
    'ad-account-unlock': {
      d: ['Unlock an AD account safely after identity check', 'باز کردن امن قفل حساب AD پس از بررسی هویت'], cat: 'identity', ts: 'terminal',
      when: ['A user reports “account locked” or a 4740 lockout alert fires for a named account.', 'کاربری «قفل شدن حساب» را گزارش می‌دهد یا هشدار قفل 4740 برای یک حساب مشخص فعال می‌شود.'],
      proc: ["Confirm the requester's identity through the approved callback procedure. Never by chat alone.\nQuery lockout status: Get-ADUser <sam> -Properties LockedOut,BadLogonCount.\nFind the lockout source in Event 4740 on the PDC emulator.\nUnlock: Unlock-ADAccount -Identity <sam>.\nIf the source is a device with stale credentials, tell the user which device.", 'هویت درخواست‌کننده را با رویه‌ی تأییدشده‌ی تماس برگشتی تأیید کن. هرگز فقط از طریق گفت‌وگو.\nوضعیت قفل را پرس‌وجو کن: Get-ADUser <sam> -Properties LockedOut,BadLogonCount.\nمنبع قفل را در رویداد 4740 روی PDC emulator پیدا کن.\nباز کردن قفل: Unlock-ADAccount -Identity <sam>.\nاگر منبع دستگاهی با اعتبارنامه‌ی قدیمی است، به کاربر بگو کدام دستگاه.'],
      pit: ['Repeated lockouts within minutes usually mean a phone or mapped drive with an old password. Unlocking again will not fix it.\nNever reset passwords in this skill. That is a separate, approved process.', 'قفل شدن‌های مکرر در چند دقیقه معمولاً یعنی گوشی یا درایو map‌شده با رمز قدیمی. باز کردن دوباره مشکل را حل نمی‌کند.\nهرگز در این مهارت رمز را بازنشانی نکن. آن یک فرایند جداگانه و تأییدشده است.'],
      ver: ['LockedOut is False and there is no new 4740 event for 15 minutes.', 'LockedOut برابر False است و تا ۱۵ دقیقه رویداد 4740 تازه‌ای نیست.'],
    },
    'disk-hygiene': {
      d: ['Free space on Windows file servers within policy RET-03', 'آزادسازی فضا روی فایل‌سرورهای Windows طبق سیاست RET-03'], cat: 'it-ops', ts: 'terminal',
      when: ['A disk-usage alert above 90% fires on a file server, or a scheduled weekly run.', 'هشدار مصرف دیسک بالای ۹۰٪ روی یک فایل‌سرور فعال می‌شود، یا اجرای زمان‌بندی‌شده‌ی هفتگی.'],
      proc: ['Report volume usage and growth per day.\nList the top 10 largest folders.\nCompress IIS and application logs older than 30 days (policy RET-03).\nList user files over 5 GB and notify the owners. Never delete user files.\nPost a summary with before and after usage.', 'مصرف volume و رشد روزانه را گزارش کن.\n۱۰ پوشه‌ی بزرگ‌تر را فهرست کن.\nلاگ‌های IIS و برنامه‌ها را که قدیمی‌تر از ۳۰ روزند فشرده کن (سیاست RET-03).\nفایل‌های کاربر بالای ۵ گیگابایت را فهرست کن و به مالکان خبر بده. هرگز فایل کاربر را حذف نکن.\nخلاصه‌ای با مصرف پیش و پس منتشر کن.'],
      pit: ['Compressing open log files fails, so skip files modified in the last hour.\nVSS snapshots can hold space; report them but do not delete them.', 'فشرده کردن فایل‌های لاگ باز شکست می‌خورد، پس فایل‌هایی را که در یک ساعت گذشته تغییر کرده‌اند رد کن.\nsnapshotهای VSS ممکن است فضا نگه دارند؛ گزارششان کن اما حذفشان نکن.'],
      ver: ['Usage is under 85%, or a ticket explains why it could not be.', 'مصرف زیر ۸۵٪ است، یا یک تیکت توضیح می‌دهد چرا نشد.'],
    },
  };
  W.skillBuilder = function (el, o) {
    const b = A.frame(el, L('SKILL.md builder for your IT runbooks', 'سازنده‌ی SKILL.md برای runbookهای IT شما'));
    const id = uid('sk');
    const f = (k, l, v, ta) => `<label style="display:grid;gap:3px;font-size:.85rem"><span class="label">${l}</span>${ta ? `<textarea data-k="${k}" rows="4" class="bidi">${esc(v)}</textarea>` : `<input type="text" data-k="${k}" dir="auto" value="${esc(v)}">`}</label>`;
    const fill = (name) => {
      const s = SK[name];
      b.querySelector('#' + id + '-form').innerHTML = f('name', L('name (lower-case, dashes)', 'name (حروف کوچک، با خط تیره)'), name) + f('d', L('description (max ~60 chars, says WHEN to use it)', 'description (حداکثر حدود ۶۰ نویسه، بگوید چه زمانی استفاده شود)'), T(s.d)) + `<div class="w-row">${f('cat', L('category', 'دسته'), s.cat)}${f('ts', L('requires toolsets', 'toolsetهای لازم'), s.ts)}</div>` + f('when', L('When to use', 'چه زمانی استفاده شود'), T(s.when), 1) + f('proc', L('Procedure (one step per line)', 'رویه (هر گام در یک خط)'), T(s.proc), 1) + f('pit', L('Pitfalls (one per line)', 'دام‌ها (هر کدام در یک خط)'), T(s.pit), 1) + f('ver', L('Verification', 'درستی‌سنجی'), T(s.ver), 1);
      run();
    };
    b.innerHTML = `<div class="w-row"><span class="label">${L('Start from', 'شروع از')}</span>${Object.keys(SK).map((k) => `<button type="button" class="cmdchip" data-p="${k}">${k}</button>`).join('')}</div>
      <div class="w-grid2"><div id="${id}-form" style="display:grid;gap:8px"></div><div style="display:grid;gap:8px;align-content:start"><div id="${id}-o"></div><div id="${id}-i"></div><div id="${id}-w"></div></div></div>`;
    const run = () => {
      const v = Object.fromEntries($$('[data-k]', b).map((x) => [x.dataset.k, x.value.trim()]));
      const name = (v.name || 'my-skill').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);
      const md = `---\nname: ${name}\ndescription: ${v.d}\nversion: 1.0.0\nmetadata:\n  hermes:\n    tags: [it-ops, ${v.cat}]\n    category: ${v.cat}\n    requires_toolsets: [${v.ts}]\n---\n\n# ${name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}\n\n## When to Use\n${v.when}\n\n## Procedure\n${lines(v.proc).map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n## Pitfalls\n${lines(v.pit).map((x) => `- ${x}`).join('\n')}\n\n## Verification\n${v.ver}\n`;
      $('#' + id + '-o', b).innerHTML = A.H.code(md, 'markdown', `~/.hermes/skills/${v.cat}/${name}/SKILL.md`);
      $('#' + id + '-i', b).innerHTML = A.H.code(`mkdir -p ~/.hermes/skills/${v.cat}/${name}\nnano ~/.hermes/skills/${v.cat}/${name}/SKILL.md   # paste the file above\nhermes          # then, inside the session:\n/${name} INC-20931 users at Branch-2 cannot reach intranet`, 'bash', L('install and use it', 'نصب و استفاده'));
      $('#' + id + '-w', b).innerHTML = v.d.length > 60 ? `<div class="callout warn"><span class="label">${L('Description is {0} chars', 'توضیح {0} نویسه است', v.d.length)}</span>${L("Keep it short. The agent reads every skill's description on every turn to decide which skill to load.", 'کوتاهش نگه دارید. ایجنت در هر نوبت توضیح همه‌ی مهارت‌ها را می‌خواند تا تصمیم بگیرد کدام را بارگذاری کند.')}</div>` : '';
    };
    b.addEventListener('input', run);
    b.addEventListener('click', (e) => { const p = e.target.closest('[data-p]'); if (p) fill(p.dataset.p); });
    fill(o.preset || 'network-triage');
  };

  /* ---------------- Hermes config builder ---------------- */
  W.configBuilder = function (el) {
    const b = A.frame(el, L('Hermes configuration builder for a lab VM', 'سازنده‌ی پیکربندی Hermes برای VM آزمایشگاه'));
    const id = uid('cb');
    const sel = (k, l, opts) => `<label style="display:grid;gap:3px;font-size:.85rem"><span class="label">${l}</span><select data-k="${k}">${opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
    const chk = (k, on, t) => `<label style="display:flex;gap:6px;font-size:.88rem"><input type="checkbox" data-k="${k}" ${on ? 'checked' : ''}> ${t}</label>`;
    b.innerHTML = `<div class="w-grid2"><div style="display:grid;gap:10px">
      ${sel('prov', L('Model provider', 'ارائه‌دهنده‌ی مدل'), [['openrouter', L('OpenRouter (API key, many models)', 'OpenRouter (کلید API، مدل‌های بسیار)')], ['anthropic', L('Anthropic API key', 'کلید API از Anthropic')], ['portal', L('Nous Portal (OAuth subscription)', 'Nous Portal (اشتراک OAuth)')], ['ollama', L('Local: Ollama on this machine', 'محلی: Ollama روی همین دستگاه')], ['vllm', L('Local: vLLM / LM Studio server on the LAN', 'محلی: سرور vLLM / LM Studio در شبکه‌ی داخلی')]])}
      ${sel('term', L('Where agent commands run', 'فرمان‌های ایجنت کجا اجرا شوند'), [['docker', L('Docker sandbox (recommended)', 'سندباکس Docker (توصیه‌شده)')], ['local', L('Local shell (trusted lab only)', 'shell محلی (فقط آزمایشگاه مورد اعتماد)')], ['ssh', L('SSH to a jump/lab server', 'SSH به یک jump host / سرور آزمایشگاه')]])}
      ${sel('appr', L('Dangerous-command approvals', 'تأیید فرمان‌های خطرناک'), [['manual', L('manual: always ask me', 'manual: همیشه از من بپرس')], ['smart', L('smart: auto-approve low risk, ask on uncertain', 'smart: کم‌خطرها خودکار، موارد نامطمئن پرسیده شوند')], ['off', L('off / YOLO (disposable sandbox only)', 'off / YOLO (فقط سندباکس یک‌بارمصرف)')]])}
      <fieldset style="border:1px solid var(--line);border-radius:6px;padding:8px 12px"><legend class="label">${L('MCP servers', 'سرورهای MCP')}</legend>
      ${chk('mcp_fs', true, L('filesystem (read our runbooks folder)', 'filesystem (خواندن پوشه‌ی runbookهای ما)'))}
      ${chk('mcp_gh', false, L('GitHub (repos, issues, PRs)', 'GitHub (مخزن‌ها، issueها، PRها)'))}
      ${chk('mcp_itsm', true, L('internal ITSM MCP over HTTPS (read-only tools)', 'MCP داخلی ITSM روی HTTPS (ابزارهای فقط‌خواندنی)'))}</fieldset>
      ${sel('gw', L('Chat gateway', 'gateway گفت‌وگو'), [['none', L('None (CLI only)', 'هیچ (فقط CLI)')], ['slack', 'Slack'], ['teams', 'Microsoft Teams'], ['telegram', 'Telegram']])}
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
        notes.push(L('Small local models (under ~30B) often fake tool calls. Use a strong model for setup and testing, then try local.', 'مدل‌های محلی کوچک (زیر حدود ۳۰ میلیارد) اغلب فراخوانی ابزار را جعل می‌کنند. برای راه‌اندازی و تست از یک مدل قوی استفاده کنید، سپس محلی را امتحان کنید.'));
      }
      if (v.prov === 'vllm') { yaml += 'model:\n  provider: custom\n  base_url: http://gpu-01.lab.local:8000/v1   # vLLM / LM Studio OpenAI-compatible URL\n  default: Qwen/Qwen3-32B\n  context_length: 65536\n'; notes.push(L('Serve with at least a 64K context, e.g. vllm serve Qwen/Qwen3-32B --max-model-len 65536 --enable-auto-tool-choice', 'با زمینه‌ی دست‌کم 64K اجرا کنید، مثلاً vllm serve Qwen/Qwen3-32B --max-model-len 65536 --enable-auto-tool-choice')); }
      if (v.term === 'docker') yaml += 'terminal:\n  backend: docker\n  docker_image: python:3.11-slim\n  container_memory: 4096\n  container_persistent: true\n';
      if (v.term === 'local') { yaml += 'terminal:\n  backend: local\n  timeout: 180\n'; notes.push(L('Local backend runs commands as your user on this machine. Use a dedicated lab VM, never your admin workstation.', 'backend محلی فرمان‌ها را با کاربر شما روی همین دستگاه اجرا می‌کند. از یک VM آزمایشگاهی اختصاصی استفاده کنید، هرگز ایستگاه کاری مدیریتی خودتان.')); }
      if (v.term === 'ssh') { yaml += 'terminal:\n  backend: ssh\n'; env += 'TERMINAL_SSH_HOST=jump-lab-01.lab.local\nTERMINAL_SSH_USER=svc-hermes\nTERMINAL_SSH_KEY=~/.ssh/svc_hermes_ed25519\n'; }
      yaml += `approvals:\n  mode: ${v.appr}\n  timeout: 300\n  cron_mode: deny\n  unattended_mode: deny\n`;
      if (v.appr === 'off') notes.push(L('approvals.mode: off disables every safety prompt. Only in a throwaway container with no production credentials.', 'approvals.mode: off همه‌ی پرسش‌های ایمنی را غیرفعال می‌کند. فقط در یک کانتینر یک‌بارمصرف بدون اعتبارنامه‌ی عملیاتی.'));
      if (v.mcp_fs || v.mcp_gh || v.mcp_itsm) {
        yaml += 'mcp_servers:\n';
        if (v.mcp_fs) yaml += '  runbooks:\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-filesystem", "/srv/runbooks"]\n';
        if (v.mcp_gh) { yaml += '  github:\n    command: npx\n    args: ["-y", "@modelcontextprotocol/server-github"]\n    env:\n      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}"\n'; env += 'GITHUB_TOKEN=github_pat_...   # fine-grained, read-only to start\n'; }
        if (v.mcp_itsm) { yaml += '  itsm:\n    url: "https://mcp.itsm.acme.local/mcp"\n    headers:\n      Authorization: "Bearer ${ITSM_MCP_TOKEN}"\n    tools:\n      include: [get_ticket, search_kb, add_work_note]   # least privilege\n'; env += 'ITSM_MCP_TOKEN=...\n'; }
      }
      if (v.gw !== 'none') { cmds.push('hermes gateway setup         # pick ' + v.gw + ', paste bot token, set allowed users', 'hermes gateway start', 'hermes gateway status'); notes.push(L('Always restrict who may talk to the bot (allowlist or DM pairing). An open bot with a terminal is a remote shell.', 'همیشه محدود کنید چه کسی با بات حرف بزند (فهرست مجاز یا جفت‌سازی DM). یک بات باز با ترمینال یعنی shell راه دور.')); }
      cmds.push('hermes config edit           # paste the YAML below (or use: hermes config set <key> <value>)', 'hermes doctor', 'hermes');
      $('#' + id + '-o', b).innerHTML = A.H.code(cmds.join('\n'), 'bash', L('commands, in order', 'فرمان‌ها، به ترتیب')) + A.H.code(yaml, 'yaml', '~/.hermes/config.yaml') + (env ? A.H.code(env, 'bash', L('~/.hermes/.env (secrets, chmod 600, never commit)', '~/.hermes/.env (secretها، chmod 600، هرگز commit نکنید)')) : '') + (notes.length ? `<div class="callout warn"><span class="label">${L('Check before you go live', 'پیش از عملیاتی شدن بررسی کنید')}</span>${A.H.list(notes)}</div>` : '');
    };
    b.addEventListener('input', run); b.addEventListener('change', run);
    run();
  };

  /* ---------------- Multi-agent team designer ---------------- */
  // [id, name, description, colour, toolsets, always on]
  const ROLES = [
    ['orchestrator', L('Orchestrator', 'هماهنگ‌کننده'), L('Reads the board, splits work, routes tasks to specialists, reviews their results.', 'برد را می‌خواند، کار را تقسیم می‌کند، کارها را به متخصص‌ها می‌سپارد و نتایجشان را بازبینی می‌کند.'), 'ink', 'delegation, todo, kanban', true],
    ['triage', L('Helpdesk triage', 'triage helpdesk'), L('Classifies new tickets, asks users for missing info, answers known issues from the KB.', 'تیکت‌های تازه را دسته‌بندی می‌کند، اطلاعات ناقص را از کاربر می‌پرسد و به مشکلات شناخته‌شده از KB پاسخ می‌دهد.'), '', 'web, file, session_search, MCP: itsm (read)'],
    ['network', L('Network engineer', 'مهندس شبکه'), L('Diagnoses reachability, VPN and Wi-Fi issues with read-only probes and SNMP.', 'مشکلات دسترس‌پذیری، VPN و Wi-Fi را با probeهای فقط‌خواندنی و SNMP تشخیص می‌دهد.'), 'tl', 'terminal (ssh to jump host), skill: network-triage'],
    ['identity', L('Identity & access', 'هویت و دسترسی'), L('Handles lockouts and access requests within the AD runbooks.', 'قفل شدن حساب‌ها و درخواست‌های دسترسی را درون runbookهای AD رسیدگی می‌کند.'), 'tl', 'terminal (PowerShell via jump host), skill: ad-account-unlock'],
    ['security', L('Security analyst', 'تحلیلگر امنیت'), L('Triages phishing reports and EDR alerts, enriches IOCs, drafts containment steps.', 'گزارش‌های فیشینگ و هشدارهای EDR را triage می‌کند، نشانگرهای نفوذ را غنی می‌کند و گام‌های مهار را پیش‌نویس می‌کند.'), 'tl', 'web, MCP: siem (read), no write access'],
    ['sysadmin', L('Server & storage', 'سرور و ذخیره‌سازی'), L('Disk, backup and patch hygiene on Windows/Linux servers.', 'بهداشت دیسک، پشتیبان و وصله روی سرورهای Windows/Linux.'), 'tl', 'terminal (docker or ssh), skill: disk-hygiene'],
    ['kb', L('KB writer', 'نویسنده‌ی KB'), L('Turns every resolved incident into a KB article and an updated skill.', 'هر رخداد حل‌شده را به یک مقاله‌ی KB و یک مهارت به‌روزشده تبدیل می‌کند.'), '', 'file, skills, MCP: itsm (write KB only)'],
  ];
  const TICKETS = [
    [L('Branch-2 cannot reach the intranet', 'Branch-2 به اینترانت نمی‌رسد'), ['triage', 'network', 'human', 'kb'], L('Network fix needs a tunnel restart, so a human approves it.', 'اصلاح شبکه ری‌استارت تونل لازم دارد، پس یک انسان تأییدش می‌کند.')],
    [L('“Your mailbox is full, click here” email reported', 'ایمیل «صندوق پست شما پر است، اینجا کلیک کنید» گزارش شد'), ['triage', 'security', 'kb'], L('Security analyst checks headers and URLs, blocks the sender (drafted for approval), and the KB writer adds the sample to the phishing article.', 'تحلیلگر امنیت هدرها و URLها را بررسی و فرستنده را مسدود می‌کند (پیش‌نویس برای تأیید)، و نویسنده‌ی KB نمونه را به مقاله‌ی فیشینگ اضافه می‌کند.')],
    [L('Account locked again after password change', 'حساب پس از تغییر رمز دوباره قفل شد'), ['triage', 'identity', 'kb'], L('Identity agent finds the stale-credential device. Unlocking is inside its runbook, so no human is needed.', 'ایجنت هویت دستگاهی با اعتبارنامه‌ی قدیمی را پیدا می‌کند. باز کردن قفل درون runbook آن است، پس انسان لازم نیست.')],
    [L('FS-02 disk at 94%', 'دیسک FS-02 در ۹۴٪'), ['sysadmin', 'human', 'kb'], L('Comes from monitoring straight to the sysadmin agent. Deleting user files needs a human.', 'از سامانه‌ی پایش مستقیم به ایجنت مدیر سیستم می‌رسد. حذف فایل‌های کاربر انسان لازم دارد.')],
  ];
  W.teamDesigner = function (el) {
    const b = A.frame(el, L('Design your IT agent team', 'تیم ایجنت‌های IT خود را طراحی کنید'));
    const id = uid('td');
    b.innerHTML = `<div class="w-row">${ROLES.map((r) => `<label class="chip" style="cursor:pointer;font-size:.8rem"><input type="checkbox" data-r="${r[0]}" ${['orchestrator', 'triage', 'network', 'security', 'kb'].includes(r[0]) ? 'checked' : ''} ${r[5] ? 'disabled' : ''}> ${r[1]}</label>`).join('')}</div>
      <div class="fig-scroll" id="${id}-g"></div>
      <div class="w-row"><label>${L('Route a ticket', 'مسیریابی یک تیکت')} <select id="${id}-t">${TICKETS.map((t, i) => `<option value="${i}">${esc(t[0])}</option>`).join('')}</select></label></div>
      <div id="${id}-r"></div>
      <div id="${id}-c"></div>`;
    const run = () => {
      const on = new Set(['orchestrator', ...$$('[data-r]:checked', b).map((x) => x.dataset.r)]);
      const sel = ROLES.filter((r) => on.has(r[0]) && r[0] !== 'orchestrator');
      $('#' + id + '-g', b).innerHTML = A.D.hub({ t: L('Orchestrator', 'هماهنگ‌کننده'), s: L('kanban dispatcher', 'توزیع‌کننده‌ی کانبان'), c: 'ink' }, [...sel.map((r) => ({ t: r[1], s: r[4].split(',')[0], c: r[3] })), { t: L('Human L2 on-call', 'انسان on-call سطح L2'), s: L('approves risky steps', 'گام‌های پرخطر را تأیید می‌کند'), c: 'acc' }], { h: 440, rx: 350, ry: 160, bw: 210, bh: 64, anim: true });
      const t = TICKETS[+$('#' + id + '-t', b).value];
      const names = { human: L('Human approval', 'تأیید انسانی') }; ROLES.forEach((r) => (names[r[0]] = r[1]));
      const path = t[1].map((p) => ({ p, ok: p === 'human' || on.has(p) }));
      $('#' + id + '-r', b).innerHTML = A.H.fig(A.D.flow([{ t: L('New ticket', 'تیکت تازه'), s: L('ITSM / monitoring', 'ITSM / پایش') }, ...path.map((x) => ({ t: names[x.p], s: x.ok ? (x.p === 'human' ? L('approve / deny', 'تأیید / رد') : L('agent', 'ایجنت')) : L('MISSING: falls back to humans', 'جاافتاده: به انسان‌ها برمی‌گردد'), c: x.p === 'human' ? 'acc' : x.ok ? 'tl' : 'crit' }))], { anim: true }), esc(t[2]));
      const cmds = ['# 1. One profile per agent: own memory, skills, credentials and model'];
      ROLES.filter((r) => on.has(r[0])).forEach((r) => cmds.push(`hermes profile create ${r[0]} --description "${r[2]}"`));
      cmds.push('', '# 2. Configure each profile (model, toolsets, MCP) with least privilege', ...ROLES.filter((r) => on.has(r[0]) && r[0] !== 'orchestrator').map((r) => `${r[0]} setup        # toolsets: ${r[4]}`), '', '# 3. A shared board the orchestrator dispatches from', 'hermes kanban boards create it-ops --name "IT Ops" --switch', `hermes kanban create "${t[0]}" --assignee ${t[1].find((p) => p !== 'human' && on.has(p)) || 'orchestrator'} --body "See ticket in ITSM"`, 'hermes kanban list');
      $('#' + id + '-c', b).innerHTML = A.H.code(cmds.join('\n'), 'bash', L('build this team with Hermes profiles + kanban', 'ساختن این تیم با پروفایل‌های Hermes + کانبان'));
    };
    b.addEventListener('change', run);
    run();
  };

  /* ---------------- Coding-agent safety modes (Claude Code + Codex) ---------------- */
  W.modes = function (el) {
    const b = A.frame(el, L('Which mode for this task?', 'برای این کار کدام حالت؟'), L('Exercise', 'تمرین'));
    const id = uid('md');
    // [situation, pill colour, pill text, Claude Code, Codex, why]
    const S = [
      [L('Explore an unfamiliar repo', 'بررسی یک مخزن ناآشنا'), 'ok', L('Read-only', 'فقط‌خواندنی'),
        'claude --permission-mode plan', 'codex -s read-only -a on-request',
        L('The agent reads and proposes a plan; nothing changes until you approve. The best start for any infrastructure repo.', 'ایجنت می‌خواند و برنامه پیشنهاد می‌دهد؛ تا شما تأیید نکنید چیزی تغییر نمی‌کند. بهترین شروع برای هر مخزن زیرساختی.')],
      [L('Iterate on a script in a branch', 'تکرار روی یک اسکریپت در یک شاخه'), 'ok', L('Edits, you review the diff', 'ویرایش، شما diff را بازبینی می‌کنید'),
        'claude --permission-mode acceptEdits\n/sandbox   # Bash in an OS sandbox', 'codex -s workspace-write -a on-request',
        L('File edits run without prompts, commands still ask (or run inside the sandbox). Git makes every change reviewable and revertible.', 'ویرایش فایل‌ها بدون پرسش انجام می‌شود و فرمان‌ها همچنان پرسیده می‌شوند (یا داخل سندباکس اجرا می‌شوند). Git هر تغییر را قابل بازبینی و بازگشت می‌کند.')],
      [L('Long refactor, fewer prompts', 'بازسازی طولانی، پرسش کمتر'), 'warn', L('Needs guardrails', 'نیازمند حفاظ'),
        'claude --permission-mode auto\n# + deny rules for apply/deploy', 'codex -s workspace-write -a on-request\n# network off in the sandbox',
        L('A classifier or the sandbox replaces most prompts. Keep deny rules for dangerous commands and work in a branch.', 'یک طبقه‌بند یا سندباکس جای بیشتر پرسش‌ها را می‌گیرد. قواعد deny را برای فرمان‌های خطرناک نگه دارید و در یک شاخه کار کنید.')],
      [L('Nightly CI job: lint and tests', 'کار شبانه‌ی CI: lint و تست'), 'ok', L('Exact allowlist', 'فهرست مجاز دقیق'),
        'claude -p "Run the tests and report" \\\n  --permission-mode dontAsk \\\n  --allowedTools "Read" "Bash(npm test)"', 'codex exec -s workspace-write -a never \\\n  "Run the tests and report"',
        L('Nobody is there to answer a prompt, so only pre-approved tools run and everything else is refused.', 'کسی برای پاسخ به پرسش حاضر نیست؛ پس فقط ابزارهای از پیش مجاز اجرا می‌شوند و بقیه رد می‌شوند.')],
      [L('Fully unattended in a throwaway container', 'کاملاً بدون ناظر در یک کانتینر یک‌بارمصرف'), 'crit', L('Container or VM only', 'فقط کانتینر یا VM'),
        'claude -p "…" --dangerously-skip-permissions\n# non-root user, no secrets, no prod network', 'codex exec --yolo "…"\n# = --dangerously-bypass-approvals-and-sandbox',
        L('All checks are off. The isolation must come from the disposable container or VM itself, never from your workstation.', 'همه‌ی بررسی‌ها خاموش است. جداسازی باید از خود کانتینر یا VM یک‌بارمصرف بیاید، هرگز از ایستگاه کاری شما.')],
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
