/* Ecosystem widgets (Module 14): layer sorting game, parallel-agent economics, OpenRouter-style
   routing simulator, gateway readiness audit, free-tier data checker.
   Every visible string is bilingual: L('English', 'فارسی'). Provider names and numbers in the
   simulators are fictional and only illustrate how routing behaves. */
(function () {
  const A = window.ACADEMY, W = A.widgets, esc = A.esc, L = A.L;
  const { uid, fmt } = A.util;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));

  /* ---------------- Which layer is it? ---------------- */
  W.layers = function (el) {
    const b = A.frame(el, L('Which layer is it?', 'در کدام لایه است؟'), L('Exercise', 'تمرین'));
    const id = uid('ly');
    const LAY = [L('Model / provider', 'مدل / ارائه‌دهنده'), L('Gateway / router', 'دروازه / مسیریاب'), L('Harness', 'هارنس'), L('Orchestrator', 'هماهنگ‌کننده')];
    // [name, layer, why]
    const I = [
      ['DeepSeek API', 0, L('It serves models behind an API. It has no agent loop of its own.', 'مدل‌ها را پشت یک API ارائه می‌کند و حلقه‌ی ایجنت خودش را ندارد.')],
      ['Ollama', 0, L('It runs models on your own hardware and exposes them over an API: a local provider.', 'مدل‌ها را روی سخت‌افزار خودتان اجرا و از طریق API ارائه می‌کند: یک ارائه‌دهنده‌ی محلی.')],
      ['OpenRouter', 1, L('One API and key in front of many providers, with routing and fallback.', 'یک API و یک کلید در جلوی ارائه‌دهندگان متعدد، با مسیریابی و fallback.')],
      ['OmniRoute', 1, L('A self-hosted gateway: tools talk to one local endpoint, it routes to providers.', 'یک دروازه‌ی خودمیزبان: ابزارها با یک endpoint محلی حرف می‌زنند و آن به ارائه‌دهندگان مسیریابی می‌کند.')],
      ['9router', 1, L('A local router with tiered fallback and token saving between your tools and providers.', 'یک مسیریاب محلی با fallback چندلایه و صرفه‌جویی توکن، بین ابزارهای شما و ارائه‌دهندگان.')],
      ['Hermes Agent', 2, L('It runs the agent loop with tools, memory, skills and approvals.', 'حلقه‌ی ایجنت را با ابزارها، حافظه، مهارت‌ها و تأییدها اجرا می‌کند.')],
      ['OpenCode', 2, L('A coding agent: loop, tools, permissions. It talks to a model through a provider or a gateway.', 'یک ایجنت برنامه‌نویسی: حلقه، ابزارها، مجوزها. از طریق یک ارائه‌دهنده یا دروازه با مدل حرف می‌زند.')],
      ['DeepSeek Harness (dsh)', 2, L('An agent runtime built from plugins: loop, tools, sandbox and approvals.', 'یک محیط اجرای ایجنت ساخته‌شده از پلاگین‌ها: حلقه، ابزارها، سندباکس و تأییدها.')],
      ['Multica', 3, L('It assigns issues to agent CLIs on your machines and tracks the work on a board.', 'issueها را به CLIهای ایجنت روی دستگاه‌های شما می‌سپارد و کار را روی یک برد دنبال می‌کند.')],
      ['Orca', 3, L('It runs several agents side by side, each in its own git worktree.', 'چند ایجنت را کنار هم اجرا می‌کند، هر کدام در git worktree خودش.')],
      [L('Hermes kanban + profiles', 'کانبان + پروفایل‌های Hermes'), 3, L('Orchestration built into a harness: a shared board that dispatches work to agent profiles.', 'هماهنگ‌سازی داخل یک هارنس: یک برد مشترک که کار را به پروفایل‌های ایجنت می‌سپارد.')],
    ];
    const ans = I.map(() => null);
    b.innerHTML = `<div id="${id}-l" style="display:grid;gap:8px">${I.map((x, i) => `<div class="inj" data-i="${i}"><div class="w-row" style="justify-content:space-between"><b>${esc(x[0])}</b><span class="seg">${LAY.map((n, j) => `<button type="button" data-v="${j}">${esc(n)}</button>`).join('')}</span></div><div class="why" hidden></div></div>`).join('')}</div>
      <div class="w-row"><button type="button" class="btn small primary" id="${id}-c">${L('Check', 'بررسی')}</button><span class="label" id="${id}-s"></span></div>`;
    b.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-v]');
      if (btn) { const c = btn.closest('[data-i]'); ans[+c.dataset.i] = +btn.dataset.v; $$('.seg button', c).forEach((x) => x.classList.toggle('on', x === btn)); }
      if (e.target.id === id + '-c') {
        let ok = 0;
        I.forEach((x, i) => { const w = $(`[data-i="${i}"] .why`, b), r = ans[i] === x[1]; if (r) ok++; w.hidden = false; w.innerHTML = `<span class="pill ${r ? 'ok' : ans[i] == null ? 'mut' : 'crit'}">${ans[i] == null ? L('Not answered', 'بی‌پاسخ') : r ? L('Correct', 'درست') : L('Missed', 'نادرست')}</span> <b>${esc(LAY[x[1]])}.</b> ${x[2]}`; });
        $('#' + id + '-s', b).textContent = L('{0} / {1} correct', '{0} از {1} درست', ok, I.length);
      }
    });
  };

  /* ---------------- Parallel agents: what does fan-out cost? ---------------- */
  W.fanout = function (el) {
    const b = A.frame(el, L('Fan one task out to N agents: what does it cost?', 'یک کار را بین N ایجنت پخش کنید: چقدر هزینه دارد؟'), L('Simulation', 'شبیه‌سازی'));
    const id = uid('fo');
    b.innerHTML = `<div class="w-row">
      <label>${L('Chance one run is mergeable (%)', 'احتمال قابل‌ادغام بودن یک اجرا (٪)')} <input type="range" id="${id}-p" min="10" max="95" value="50"> <b id="${id}-pv">50</b></label>
      <label>${L('Model cost per run ($)', 'هزینه‌ی مدل برای هر اجرا ($)')} <input type="number" id="${id}-c" value="1.5" min="0" step="0.1" style="width:5.5em"></label>
      <label>${L('Minutes to review one diff', 'دقیقه برای بازبینی یک diff')} <input type="number" id="${id}-m" value="12" min="1" step="1" style="width:5em"></label>
      <label>${L('Engineer cost per hour ($)', 'هزینه‌ی ساعتی مهندس ($)')} <input type="number" id="${id}-h" value="60" min="0" step="5" style="width:5.5em"></label></div>
      <div class="tbl-wrap"><table><thead><tr><th>N</th><th>${L('P(at least one good)', 'احتمال دست‌کم یک نتیجه‌ی خوب')}</th><th>${L('Model cost', 'هزینه‌ی مدل')}</th><th>${L('Review time', 'زمان بازبینی')}</th><th>${L('Cost per good result', 'هزینه‌ی هر نتیجه‌ی خوب')}</th></tr></thead><tbody id="${id}-t"></tbody></table></div>
      <div id="${id}-x"></div>`;
    const run = () => {
      const p = +$('#' + id + '-p', b).value / 100, c = +$('#' + id + '-c', b).value || 0, m = +$('#' + id + '-m', b).value || 0, h = +$('#' + id + '-h', b).value || 0;
      $('#' + id + '-pv', b).textContent = Math.round(p * 100);
      const rows = [1, 2, 3, 4, 5, 6, 8].map((n) => {
        const pg = 1 - Math.pow(1 - p, n), model = c * n, revMin = m * n, total = model + (revMin / 60) * h;
        return { n, pg, model, revMin, per: total / pg };
      });
      const best = rows.reduce((a, r) => (r.per < a.per ? r : a));
      $('#' + id + '-t', b).innerHTML = rows.map((r) => `<tr style="${r === best ? 'background:var(--amber-soft)' : ''}"><td><b>${r.n}</b></td><td>${(r.pg * 100).toFixed(0)}%</td><td>$${fmt(r.model, 2)}</td><td>${fmt(r.revMin)} ${L('min', 'دقیقه')}</td><td>$${fmt(r.per, 2)}</td></tr>`).join('');
      $('#' + id + '-x', b).innerHTML = `<div class="callout tip"><span class="label">${L('Cheapest per good result: N = {0}', 'ارزان‌ترین هزینه برای هر نتیجه‌ی خوب: N = {0}', best.n)}</span>${L('More agents raise the chance that one result is good, but the gain shrinks quickly while model cost and <b>review time grow linearly</b>. Reviewing is the bottleneck, not generating. Real runs fail together more often than this model assumes (same prompt, same model), so treat the table as optimistic.', 'ایجنت بیشتر شانس یک نتیجه‌ی خوب را بالا می‌برد، اما سود به‌سرعت کم می‌شود در حالی که هزینه‌ی مدل و <b>زمان بازبینی خطی رشد می‌کنند</b>. گلوگاه بازبینی است، نه تولید. اجراهای واقعی بیشتر از فرض این مدل با هم شکست می‌خورند (همان پرامپت، همان مدل)، پس جدول را خوش‌بینانه بدانید.')}</div>`;
    };
    b.addEventListener('input', run);
    run();
  };

  /* ---------------- Routing simulator (OpenRouter-style provider preferences) ---------------- */
  W.routeSim = function (el) {
    const b = A.frame(el, L('Routing simulator: provider preferences', 'شبیه‌ساز مسیریابی: ترجیحات ارائه‌دهنده'), L('Simulation', 'شبیه‌سازی'));
    const id = uid('rs');
    // Fictional providers: price $/M tokens (blended), time-to-first-token s, tokens/s, keeps/trains on prompts
    const P = [
      { k: 'a', n: L('Provider A (hyperscaler)', 'ارائه‌دهنده A (ابرمقیاس)'), price: 3.0, lat: 0.6, tps: 60, train: false },
      { k: 'b', n: L('Provider B (budget host)', 'ارائه‌دهنده B (میزبان ارزان)'), price: 0.9, lat: 1.4, tps: 40, train: true },
      { k: 'c', n: L('Provider C (fast inference)', 'ارائه‌دهنده C (استنتاج سریع)'), price: 2.2, lat: 0.3, tps: 180, train: false },
      { k: 'd', n: L('Provider D (reseller)', 'ارائه‌دهنده D (فروشنده‌ی واسط)'), price: 1.5, lat: 0.9, tps: 70, train: true },
      { k: 'e', n: L('Provider E (model vendor)', 'ارائه‌دهنده E (سازنده‌ی مدل)'), price: 2.8, lat: 0.5, tps: 90, train: false },
    ];
    b.innerHTML = `<div class="w-row">
      <label>sort <select id="${id}-s"><option value="">${L('(default: balance by price, avoid outages)', '(پیش‌فرض: توازن بر اساس قیمت، پرهیز از قطعی)')}</option><option value="price">price</option><option value="latency">latency</option><option value="throughput">throughput</option></select></label>
      <label><input type="checkbox" id="${id}-d"> data_collection: deny</label>
      <label><input type="checkbox" id="${id}-f" checked> allow_fallbacks</label>
      <label><input type="checkbox" id="${id}-o"> ${L('Provider C has an outage', 'ارائه‌دهنده‌ی C قطعی دارد')}</label></div>
      <div class="w-row"><span class="label">only</span>${P.map((p) => `<label><input type="checkbox" data-only="${p.k}" checked> ${p.k.toUpperCase()}</label>`).join('')}</div>
      <div class="tbl-wrap"><table><thead><tr><th>${L('Provider', 'ارائه‌دهنده')}</th><th>$ / M</th><th>TTFT (s)</th><th>tok/s</th><th>${L('Trains on prompts', 'آموزش روی پرامپت‌ها')}</th></tr></thead><tbody>${P.map((p) => `<tr><td>${p.n}</td><td>${p.price.toFixed(1)}</td><td>${p.lat}</td><td>${p.tps}</td><td>${p.train ? L('yes', 'بله') : L('no', 'خیر')}</td></tr>`).join('')}</tbody></table></div>
      <div id="${id}-o2" style="display:grid;gap:8px"></div><div id="${id}-y"></div>
      <p class="muted" style="font-size:.82rem">${L('Illustrative numbers. Real OpenRouter routing works the same way: the default balances load across stable providers weighted towards lower price; setting <code>sort</code> or <code>order</code> turns load balancing off and tries providers in that order. Check openrouter.ai/docs for the current rules.', 'اعداد نمایشی‌اند. مسیریابی واقعی OpenRouter به همین شکل کار می‌کند: پیش‌فرض بار را میان ارائه‌دهندگان پایدار و با وزن بیشتر برای قیمت کمتر تقسیم می‌کند؛ تنظیم <code>sort</code> یا <code>order</code> توازن بار را خاموش می‌کند و ارائه‌دهندگان را به همان ترتیب امتحان می‌کند. قواعد فعلی را در openrouter.ai/docs ببینید.')}</p>`;
    const run = () => {
      const sort = $('#' + id + '-s', b).value, deny = $('#' + id + '-d', b).checked, fb = $('#' + id + '-f', b).checked, out = $('#' + id + '-o', b).checked;
      const only = $$('[data-only]', b).filter((x) => x.checked).map((x) => x.dataset.only);
      let pool = P.filter((p) => only.includes(p.k) && !(deny && p.train));
      const down = (p) => out && p.k === 'c';
      let order, mode;
      if (sort) {
        mode = 'sorted';
        const key = { price: (p) => p.price, latency: (p) => p.lat, throughput: (p) => -p.tps }[sort];
        order = pool.slice().sort((x, y) => key(x) - key(y));
      } else {
        mode = 'balanced';
        const up = pool.filter((p) => !down(p)), dn = pool.filter(down);
        const w = up.map((p) => 1 / (p.price * p.price)), Z = w.reduce((a, c) => a + c, 0) || 1;
        order = up.map((p, i) => ({ p, w: w[i] / Z })).sort((x, y) => y.w - x.w).map((x) => Object.assign({}, x.p, { w: x.w })).concat(dn);
      }
      const o2 = $('#' + id + '-o2', b);
      if (!order.length) {
        o2.innerHTML = `<div class="callout crit"><span class="label">${L('No provider matches', 'هیچ ارائه‌دهنده‌ای منطبق نیست')}</span>${L('Your filters exclude every provider, so the request fails with an error instead of going somewhere you did not allow. This is the safe failure mode for sensitive data.', 'فیلترهای شما همه‌ی ارائه‌دهندگان را حذف کرده‌اند، پس درخواست به‌جای رفتن به جایی که اجازه نداده‌اید با خطا شکست می‌خورد. این برای داده‌ی حساس حالت شکست امن است.')}</div>`;
      } else {
        const tries = fb ? order : order.slice(0, 1);
        const first = tries.find((p) => !down(p));
        o2.innerHTML = `<span class="label">${mode === 'sorted' ? L('Attempt order', 'ترتیب تلاش') : L('Share of traffic among healthy providers', 'سهم ترافیک میان ارائه‌دهندگان سالم')}</span><div class="hbars">${tries.map((p) => `<div class="hbar ${first === p ? 'pick' : ''}"><span class="k">${esc(p.n)}${down(p) ? ' ⚠' : ''}</span><div class="bar"><i style="width:${mode === 'balanced' && !down(p) ? Math.round(p.w * 100) : first === p ? 100 : 0}%"></i></div><span class="n">${mode === 'balanced' && !down(p) ? Math.round(p.w * 100) + '%' : down(p) ? L('down', 'قطع') : '·'}</span></div>`).join('')}</div>` +
          (first ? '' : `<div class="callout crit"><span class="label">${L('Request fails', 'درخواست شکست می‌خورد')}</span>${L('The only provider your settings allow is down and fallbacks are off. Failing is correct when you must not use anyone else.', 'تنها ارائه‌دهنده‌ی مجاز در تنظیمات شما قطع است و fallback خاموش است. وقتی نباید از کس دیگری استفاده کنید، شکست درست است.')}</div>`);
      }
      const y = ['provider_routing:'];
      if (sort) y.push(`  sort: "${sort}"`);
      if (deny) y.push('  data_collection: "deny"');
      if (only.length < P.length) y.push(`  only: [${only.map((k) => `"provider-${k}"`).join(', ')}]`);
      if (y.length === 1) y.push('  # defaults: balanced by price, outage-aware');
      $('#' + id + '-y', b).innerHTML = A.H.code(y.join('\n') + (fb ? '' : '\n# allow_fallbacks: false is sent to OpenRouter by the client you use'), 'yaml', L('~/.hermes/config.yaml (same idea in OpenCode and others)', '~/.hermes/config.yaml (همین ایده در OpenCode و ابزارهای دیگر)'));
    };
    b.addEventListener('input', run); b.addEventListener('change', run);
    run();
  };

  /* ---------------- Gateway readiness audit ---------------- */
  W.gwAudit = function (el) {
    const b = A.frame(el, L('Is this AI gateway ready for company data?', 'آیا این دروازه‌ی هوش مصنوعی برای داده‌ی شرکت آماده است؟'), L('Exercise', 'تمرین'));
    const id = uid('ga');
    // [text, weight, critical, why]
    const C = [
      [L('Listens on localhost or a private management VLAN only, never on a public or user LAN address', 'فقط روی localhost یا VLAN مدیریت خصوصی گوش می‌دهد، نه روی آدرس عمومی یا شبکه‌ی کاربران'), 3, true, L('A gateway holds every provider key. Anyone who can reach an open port can spend your money and read your prompts.', 'دروازه همه‌ی کلیدهای ارائه‌دهندگان را نگه می‌دارد. هر کسی که به یک پورت باز برسد می‌تواند پول شما را خرج کند و پرامپت‌هایتان را بخواند.')],
      [L('Dashboard and admin API use a strong, unique password or SSO (no default or example password)', 'داشبورد و API مدیریتی رمز قوی و یکتا یا SSO دارند (بدون رمز پیش‌فرض یا نمونه)'), 3, true, L('Some gateways ship a default first-login password. Attackers try those first.', 'برخی دروازه‌ها رمز پیش‌فرض اولین ورود دارند. مهاجمان اول همان‌ها را امتحان می‌کنند.')],
      [L('Runs in a container or VM, with the version pinned (no :latest, no :next)', 'در کانتینر یا VM اجرا می‌شود و نسخه ثابت شده است (نه :latest و نه :next)'), 2, false, L('The install may run npm lifecycle scripts, and fast-moving projects change daily. Pin, review, then upgrade on purpose.', 'نصب ممکن است اسکریپت‌های چرخه‌ی حیات npm را اجرا کند و پروژه‌های پرتحرک هر روز تغییر می‌کنند. ثابت کنید، بازبینی کنید، سپس عمداً ارتقا دهید.')],
      [L('Only providers with a contract and terms approved by legal and security are connected', 'فقط ارائه‌دهندگانی وصل شده‌اند که قرارداد و شرایطشان را حقوقی و امنیت تأیید کرده‌اند'), 3, true, L('A gateway does not change where the data goes. It only makes it easy to send it to many places.', 'دروازه مقصد داده را عوض نمی‌کند، فقط فرستادن آن به جاهای زیاد را آسان می‌کند.')],
      [L('No personal or shared consumer subscriptions, and no pooled free-tier accounts, are used for company work', 'هیچ اشتراک مصرفی شخصی یا مشترک و هیچ حساب رایگان ترکیب‌شده‌ای برای کار شرکت استفاده نمی‌شود'), 3, true, L('Provider terms usually forbid sharing or reselling an account, and a banned account takes your workflow with it.', 'شرایط ارائه‌دهندگان معمولاً اشتراک‌گذاری یا فروش مجدد حساب را ممنوع می‌کند و حساب مسدودشده کار شما را هم با خودش می‌برد.')],
      [L('Provider keys are stored encrypted, scoped, and rotated; each user or tool has its own gateway key', 'کلیدهای ارائه‌دهندگان رمزگذاری‌شده، با دامنه‌ی محدود و چرخشی نگه داشته می‌شوند؛ هر کاربر یا ابزار کلید دروازه‌ی خودش را دارد'), 2, false, L('Per-key limits let you revoke one tool without breaking everyone, and show who spent what.', 'محدودیت برای هر کلید اجازه می‌دهد یک ابزار را بدون خراب کردن کار بقیه لغو کنید و نشان می‌دهد چه کسی چقدر خرج کرده.')],
      [L('Request logs go to the SIEM, with secrets redacted, and spend and rate limits are set', 'لاگ درخواست‌ها به SIEM می‌رود، secretها پوشانده می‌شوند و سقف هزینه و نرخ تنظیم شده است'), 2, false, L('Without logs you cannot investigate a leak. Without limits a looping agent burns the budget overnight.', 'بدون لاگ نمی‌توانید نشت را بررسی کنید. بدون سقف، یک ایجنت در حلقه بودجه را یک شبه می‌سوزاند.')],
      [L('Traffic leaves only through the company egress path, allowed to the approved provider domains', 'ترافیک فقط از مسیر خروجی شرکت و به دامنه‌های ارائه‌دهندگان تأییدشده خارج می‌شود'), 2, false, L('Egress control is how you know the gateway talks only to the providers you approved.', 'کنترل ترافیک خروجی راهی است که می‌فهمید دروازه فقط با ارائه‌دهندگان تأییدشده حرف می‌زند.')],
      [L('Token compression or prompt rewriting is tested on real tool output, with a way to switch it off per request', 'فشرده‌سازی توکن یا بازنویسی پرامپت روی خروجی واقعی ابزارها آزموده شده و راهی برای خاموش کردن آن در هر درخواست هست'), 1, false, L('Compression changes what the model sees. Check that diffs and logs stay accurate before you trust it.', 'فشرده‌سازی چیزی را که مدل می‌بیند عوض می‌کند. پیش از اعتماد، بررسی کنید diffها و لاگ‌ها دقیق می‌مانند.')],
      [L('A named owner, an inventory entry and a kill switch (stop the service, revoke keys) are documented', 'مالک مشخص، ثبت در فهرست دارایی‌ها و کلید توقف (توقف سرویس، لغو کلیدها) مستند شده است'), 2, false, L('Shadow gateways are shadow IT with all your API keys inside.', 'دروازه‌های پنهان، shadow IT با همه‌ی کلیدهای API شما درونش هستند.')],
    ];
    b.innerHTML = `<div style="display:grid;gap:6px">${C.map((c, i) => `<label style="display:flex;gap:8px;align-items:flex-start;font-size:.9rem"><input type="checkbox" data-i="${i}"><span>${c[0]}${c[2] ? ` <span class="pill crit">${L('required', 'الزامی')}</span>` : ''}</span></label>`).join('')}</div>
      <div class="bar" style="height:14px"><i id="${id}-m"></i></div><div id="${id}-v"></div>`;
    const run = () => {
      const on = $$('[data-i]', b).map((x) => x.checked);
      const max = C.reduce((a, c) => a + c[1], 0), got = C.reduce((a, c, i) => a + (on[i] ? c[1] : 0), 0);
      const pct = Math.round((100 * got) / max);
      $('#' + id + '-m', b).style.width = pct + '%';
      const missCrit = C.filter((c, i) => c[2] && !on[i]);
      const miss = C.filter((c, i) => !on[i]);
      let v;
      if (missCrit.length) v = `<div class="callout crit"><span class="label">${L('{0}%: lab only, no company data', '{0}٪: فقط آزمایشگاه، بدون داده‌ی شرکت', pct)}</span>${L('A required control is missing:', 'یک کنترل الزامی کم است:')}<ul class="list">${missCrit.slice(0, 3).map((c) => `<li><b>${c[0]}</b><br>${c[3]}</li>`).join('')}</ul></div>`;
      else if (pct < 85) v = `<div class="callout warn"><span class="label">${L('{0}%: internal, non-sensitive work with owner sign-off', '{0}٪: کار داخلی و غیرحساس با امضای مالک', pct)}</span>${L('Required controls are in place. Close the remaining gaps before more teams depend on it:', 'کنترل‌های الزامی برقرارند. پیش از وابسته شدن تیم‌های بیشتر، شکاف‌های باقی‌مانده را ببندید:')}<ul class="list">${miss.slice(0, 3).map((c) => `<li>${c[0]}</li>`).join('')}</ul></div>`;
      else v = `<div class="callout tip"><span class="label">${L('{0}%: candidate for an approved platform service', '{0}٪: نامزد یک سرویس پلتفرمی تأییدشده', pct)}</span>${L('Treat it like any other platform service: change management, patching, access reviews, and a security review before it carries confidential data.', 'مثل هر سرویس پلتفرمی دیگر با آن رفتار کنید: مدیریت تغییر، وصله‌گذاری، بازبینی دسترسی و بازبینی امنیتی پیش از عبور داده‌ی محرمانه.')}</div>`;
      $('#' + id + '-v', b).innerHTML = v;
    };
    b.addEventListener('change', run);
    run();
  };

  /* ---------------- Free-tier data checker ---------------- */
  W.freeCheck = function (el) {
    const b = A.frame(el, L('May this data go to this free tier?', 'آیا این داده می‌تواند به این سطح رایگان برود؟'), L('Exercise', 'تمرین'));
    const id = uid('fc');
    const CLS = [
      ['public', L('Public (docs, open-source code)', 'عمومی (مستندات، کد متن‌باز)')],
      ['internal', L('Internal (runbooks, scripts, ticket text)', 'داخلی (runbookها، اسکریپت‌ها، متن تیکت)')],
      ['conf', L('Confidential (customer data, credentials, configs with secrets)', 'محرمانه (داده‌ی مشتری، اعتبارنامه‌ها، پیکربندی‌های دارای secret)')],
    ];
    const Q = [
      ['train', L('The provider logs prompts or may use them for training or research', 'ارائه‌دهنده پرامپت‌ها را ثبت می‌کند یا ممکن است برای آموزش یا پژوهش استفاده کند')],
      ['nocontract', L('Only an email or personal sign-up: no company contract, no data-processing terms', 'فقط ثبت‌نام با ایمیل یا شخصی: بدون قرارداد شرکتی و بدون شرایط پردازش داده')],
      ['tos', L('Its terms forbid sharing the key or routing through a third-party proxy', 'شرایطش اشتراک کلید یا عبور از یک پراکسی شخص ثالث را ممنوع می‌کند')],
      ['unreviewed', L('Legal has not reviewed where the data is processed and stored', 'حقوقی بررسی نکرده که داده کجا پردازش و نگهداری می‌شود')],
      ['expiring', L('The quota is a one-time grant or a promotion that can end without notice', 'سهمیه یک اعتبار یک‌باره یا یک تبلیغ است که می‌تواند بی‌خبر تمام شود')],
    ];
    b.innerHTML = `<div class="w-row"><label>${L('Data class', 'طبقه‌ی داده')} <select id="${id}-d">${CLS.map((c) => `<option value="${c[0]}">${c[1]}</option>`).join('')}</select></label></div>
      <div style="display:grid;gap:6px">${Q.map((q) => `<label style="display:flex;gap:8px;font-size:.9rem"><input type="checkbox" data-q="${q[0]}"> ${q[1]}</label>`).join('')}</div><div id="${id}-v"></div>`;
    const run = () => {
      const d = $('#' + id + '-d', b).value, f = Object.fromEntries($$('[data-q]', b).map((x) => [x.dataset.q, x.checked]));
      const why = [];
      let level = 'ok';
      const bad = (t) => { why.push(t); level = 'crit'; };
      const warn = (t) => { why.push(t); if (level !== 'crit') level = 'warn'; };
      if (d === 'conf') bad(L('Confidential data never goes to a free tier or a shared gateway. Use an approved contract provider or a local model.', 'داده‌ی محرمانه هرگز به سطح رایگان یا دروازه‌ی مشترک نمی‌رود. از یک ارائه‌دهنده‌ی قراردادی تأییدشده یا مدل محلی استفاده کنید.'));
      if (f.tos) bad(L('Do not use a provider through a route its terms forbid. A banned account is the least of it.', 'از ارائه‌دهنده‌ای از مسیری که شرایطش ممنوع کرده استفاده نکنید. مسدود شدن حساب کمترین مشکل است.'));
      if (d === 'internal') {
        if (f.train) bad(L('Internal data must not go where prompts are logged or used for training.', 'داده‌ی داخلی نباید به جایی برود که پرامپت‌ها ثبت یا برای آموزش استفاده می‌شوند.'));
        if (f.nocontract) bad(L('Internal data needs a contract with data-processing terms.', 'داده‌ی داخلی قرارداد با شرایط پردازش داده لازم دارد.'));
        if (f.unreviewed) warn(L('Ask legal where the data is processed before you send internal data.', 'پیش از فرستادن داده‌ی داخلی از حقوقی بپرسید داده کجا پردازش می‌شود.'));
      } else if (d === 'public') {
        if (f.train) warn(L('Fine for public data, but remember the prompt itself can reveal what you are working on.', 'برای داده‌ی عمومی اشکالی ندارد، اما یادتان باشد خود پرامپت می‌تواند نشان دهد روی چه کاری کار می‌کنید.'));
        if (f.unreviewed) warn(L('Acceptable for public data. Note it for the provider inventory.', 'برای داده‌ی عمومی قابل‌قبول است. آن را در فهرست ارائه‌دهندگان ثبت کنید.'));
      }
      if (f.expiring) warn(L('Do not build a team workflow on a quota that can vanish. Keep a paid or local fallback.', 'روی سهمیه‌ای که می‌تواند ناپدید شود جریان کاری تیم نسازید. یک جایگزین پولی یا محلی نگه دارید.'));
      const head = { ok: L('Allowed for learning and public work', 'مجاز برای یادگیری و کار عمومی'), warn: L('Allowed with conditions', 'مجاز با شرایط'), crit: L('Not allowed', 'مجاز نیست') }[level];
      $('#' + id + '-v', b).innerHTML = `<div class="callout ${level === 'ok' ? 'tip' : level}"><span class="label">${head}</span>${why.length ? `<ul class="list">${why.map((w) => `<li>${w}</li>`).join('')}</ul>` : L('No risk flagged for this data class. Still log which provider you used.', 'برای این طبقه‌ی داده ریسکی علامت نخورده است. باز هم ثبت کنید از کدام ارائه‌دهنده استفاده کرده‌اید.')}</div>`;
    };
    b.addEventListener('change', run);
    run();
  };
})();
