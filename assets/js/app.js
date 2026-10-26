/* App shell: routing, rendering, progress, presenter mode, search, quizzes. */
(function () {
  const A = window.ACADEMY;
  const { esc, store, L, tr } = A;
  const NEXT = L('Next →', 'بعدی ←'), PREV = L('← Prev', '→ قبلی');
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const main = $('#main');
  const pad = (n) => String(n).padStart(2, '0');

  // ---------- index ----------
  const lessons = [];
  A.modules.sort((a, b) => a.num - b.num);
  A.modules.forEach((m) => {
    m.lessons.forEach((l, i) => { l.module = m; l.index = i; lessons.push(l); });
  });
  lessons.forEach((l, i) => { l.prev = lessons[i - 1]; l.next = lessons[i + 1]; });
  const byLesson = Object.fromEntries(lessons.map((l) => [l.id, l]));
  const byModule = Object.fromEntries(A.modules.map((m) => [m.id, m]));
  // Persian: translate module, lesson, slide-title, note and quiz text (slide bodies were translated as they were built).
  if (A.lang === 'fa') A.modules.forEach((m) => {
    m.title = tr(m.title); m.summary = tr(m.summary); if (m.outcomes) m.outcomes = m.outcomes.map(tr);
    m.lessons.forEach((l) => { l.title = tr(l.title); l.slides.forEach((s) => { s.t = tr(s.t); if (s.n) s.n = tr(s.n); }); });
    if (m.quiz) m.quiz = m.quiz.map((q) => Object.assign({}, q, { q: tr(q.q), a: q.a.map(tr), why: tr(q.why) }));
  });
  // The course is taught in two parts: fundamentals first, then hands-on agent work.
  const PARTS = [
    { key: 'fund', label: L('Part 1 · Fundamentals', 'بخش 1 · مبانی'), test: (m) => m.num <= 8, desc: L('How AI, LLMs and agents work: the knowledge every colleague needs before touching a real agent.', 'هوش مصنوعی، مدل‌های زبانی بزرگ و ایجنت‌ها چطور کار می‌کنند: دانشی که هر همکار پیش از کار با یک ایجنت واقعی لازم دارد.') },
    { key: 'prac', label: L('Part 2 · Hands-on with agents', 'بخش 2 · کار عملی با ایجنت‌ها'), test: (m) => m.num >= 9 && m.num <= 13, desc: L('Install Hermes Agent, build skills, teams and role playbooks for our daily work, inside our security guardrails.', 'نصب Hermes Agent و ساختن مهارت‌ها، تیم‌های ایجنت و دستورالعمل‌های نقش‌محور برای کارهای روزانه‌ی ما، در چارچوب سیاست‌های امنیتی سازمان.') },
    { key: 'ext', label: L('Part 3 · Going further', 'بخش 3 · گام‌های بعدی'), test: (m) => m.num >= 14, desc: L('The wider agent ecosystem: other harnesses, orchestrators, model providers and AI gateways, and how to use free models safely.', 'اکوسیستم گسترده‌ی ایجنت‌ها: هارنس‌های دیگر، هماهنگ‌کننده‌ها، ارائه‌دهندگان مدل و دروازه‌های هوش مصنوعی، و استفاده‌ی امن از مدل‌های رایگان.') },
  ];
  A.modules.forEach((m) => (m.part = PARTS.find((p) => p.test(m))));

  // ---------- progress ----------
  const seen = store.get('seen', {});
  const quiz = store.get('quiz', {});
  const markSeen = (l, i) => {
    const s = new Set(seen[l.id] || []);
    if (!s.has(i)) { s.add(i); seen[l.id] = [...s]; store.set('seen', seen); }
  };
  const lessonDone = (l) => (seen[l.id] || []).length >= l.slides.length;
  const modStats = (m) => {
    const total = m.lessons.reduce((a, l) => a + l.slides.length, 0);
    const got = m.lessons.reduce((a, l) => a + Math.min((seen[l.id] || []).length, l.slides.length), 0);
    return { total, got, pct: total ? Math.round((100 * got) / total) : 0, quiz: quiz[m.id] };
  };

  // ---------- theme ----------
  const root = document.documentElement;
  const applyTheme = (t) => { if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme'); };
  let theme = store.get('theme', 'system');
  applyTheme(theme);
  $('#themeBtn').addEventListener('click', () => {
    theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    applyTheme(theme); store.set('theme', theme);
    toast(L('Theme: ', 'پوسته: ') + { system: L('system', 'سیستم'), light: L('light', 'روشن'), dark: L('dark', 'تیره') }[theme]);
  });

  // ---------- language ----------
  const langBtn = $('#langBtn');
  if (langBtn) {
    langBtn.textContent = A.lang === 'fa' ? 'EN' : 'فا';
    langBtn.title = A.lang === 'fa' ? 'English' : 'فارسی';
    langBtn.setAttribute('aria-label', A.lang === 'fa' ? 'Switch to English' : 'تغییر زبان به فارسی');
    langBtn.addEventListener('click', () => {
      const next = A.lang === 'fa' ? 'en' : 'fa';
      let ok = false;
      try { localStorage.setItem('aaa:lang', JSON.stringify(next)); ok = JSON.parse(localStorage.getItem('aaa:lang')) === next; } catch (e) { /* storage blocked */ }
      if (!ok) location.hash = next;
      location.reload();
    });
  }
  $('#searchIn').placeholder = L('Search lessons, e.g. RAG, MCP, cron, VRAM', 'جستجو در درس‌ها، مثلاً RAG، MCP، cron، VRAM');
  const sbLabel = $('.search-btn .hide-sm'); if (sbLabel) sbLabel.textContent = L('Search', 'جستجو');
  $('#searchBtn').setAttribute('aria-label', L('Search the course', 'جستجو در دوره'));
  $('#themeBtn').setAttribute('aria-label', L('Switch theme (system, light, dark)', 'تغییر پوسته (سیستم، روشن، تیره)'));
  $('#menuBtn').setAttribute('aria-label', L('Open course menu', 'باز کردن فهرست دوره'));

  // ---------- toast ----------
  let tt;
  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => (t.hidden = true), 1600);
  }
  A.toast = toast;

  // ---------- copy buttons (delegated) ----------
  A.copy = function (text, node) {
    const done = () => toast(L('Copied to clipboard', 'کپی شد'));
    const fallback = () => {
      if (!node) return toast(L('Select the text and copy it manually', 'متن را انتخاب و دستی کپی کنید'));
      const r = document.createRange(); r.selectNodeContents(node);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      toast(L('Selected — press Ctrl+C / ⌘C', 'انتخاب شد؛ Ctrl+C یا ⌘C را بزنید'));
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.copy');
    if (!b) return;
    const code = b.closest('.code').querySelector('pre code');
    A.copy(code.textContent, code);
  });

  // ---------- sidebar ----------
  function renderNav(cur) {
    const curMod = cur && (cur.module || cur.mod);
    let h = `<div class="nav-group"><span class="label">${L('Start here', 'شروع')}</span>
      <a class="nav-link ${cur === 'home' ? 'active' : ''}" href="#home"><span class="num">··</span>${L('Course home', 'صفحه‌ی اصلی دوره')}</a>
      <a class="nav-link ${cur === 'instructor' ? 'active' : ''}" href="#instructor"><span class="num">··</span>${L('Instructor guide', 'راهنمای مدرس')}</a></div>
      <div class="nav-group">`;
    A.modules.forEach((m, i) => {
      const st = modStats(m);
      if (i === 0 || A.modules[i - 1].part !== m.part) h += `${i ? '</div><div class="nav-group">' : ''}<span class="label">${esc(m.part.label)}</span>`;
      const open = curMod === m;
      h += `<a class="nav-link ${open ? 'active' : ''}" href="#${m.id}"><span class="num">M${pad(m.num)}</span><span>${esc(m.title)}</span><span class="meter ${st.pct === 100 ? 'done' : ''}">${st.pct}%</span></a>`;
      if (open) {
        h += `<div class="nav-lessons">${m.lessons
          .map((l) => `<a href="#${l.id}" class="${cur === l ? 'active' : ''} ${lessonDone(l) ? 'seen' : ''}"><span class="dot"></span>${esc(l.title)}</a>`)
          .join('')}${m.quiz ? `<a href="#${m.id}-quiz" class="quizlink ${cur && cur.quizOf === m ? 'active' : ''} ${quiz[m.id] ? 'seen' : ''}"><span class="dot"></span>${L('Checkpoint quiz', 'آزمونک پایان ماژول')}</a>` : ''}</div>`;
      }
    });
    h += `</div><div class="nav-group"><span class="label">${L('Reference', 'مرجع')}</span>
      <a class="nav-link ${cur === 'cheatsheet' ? 'active' : ''}" href="#cheatsheet"><span class="num">··</span>${L('Hermes cheat sheet', 'خلاصه‌ی دستورات Hermes')}</a>
      <a class="nav-link ${cur === 'codingsheet' ? 'active' : ''}" href="#codingsheet"><span class="num">··</span>${L('Claude Code & Codex cheat sheet', 'خلاصه‌ی دستورات Claude Code و Codex')}</a>
      <a class="nav-link ${cur === 'ecosheet' ? 'active' : ''}" href="#ecosheet"><span class="num">··</span>${L('Ecosystem & gateway cheat sheet', 'خلاصه‌ی اکوسیستم و دروازه‌ها')}</a>
      <a class="nav-link ${cur === 'glossary' ? 'active' : ''}" href="#glossary"><span class="num">··</span>${L('Glossary', 'واژه‌نامه')}</a>
      <a class="nav-link ${cur === 'deckmap' ? 'active' : ''}" href="#deckmap"><span class="num">··</span>${L('Deck-to-lesson map', 'نقشه‌ی اسلاید به درس')}</a></div>`;
    $('#sidebar').innerHTML = h;
  }

  // ---------- widgets ----------
  function mountWidgets(scope) {
    $$('[data-widget]', scope).forEach((el) => {
      if (el.dataset.mounted) return;
      const fn = A.widgets[el.dataset.widget];
      let opts = {};
      try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { /* ignore */ }
      el.dataset.mounted = '1';
      if (fn) {
        try { fn(el, opts); } catch (err) { el.innerHTML = `<div class="w-body"><p class="muted">${L('This exercise failed to load', 'این تمرین بارگذاری نشد')} (${esc(err.message)}).</p></div>`; console.error(err); }
      }
    });
  }
  A.mountWidgets = mountWidgets;
  // Widget frame helper used by widgets.js
  A.frame = function (el, title, label) {
    el.innerHTML = `<div class="w-head"><span class="label">${esc(label || L('Try it', 'امتحان کنید'))}</span><span class="t">${esc(title)}</span></div><div class="w-body"></div>`;
    return el.querySelector('.w-body');
  };

  // ---------- views ----------
  function viewHome() {
    const totalSlides = lessons.reduce((a, l) => a + l.slides.length, 0);
    const totalMins = lessons.reduce((a, l) => a + (l.mins || 10), 0);
    const first = lessons.find((l) => !lessonDone(l)) || lessons[0];
    const started = Object.keys(seen).length > 0;
    return `<div class="wrap">
      <section class="hero">
        <div>
          <div class="eyebrow">${L('IT Infrastructure Academy · Course 01', 'آکادمی زیرساخت IT · دوره‌ی 01')}</div>
          <h1>${L('Put <em>AI agents</em> to work in IT operations', 'به‌کارگیری <em>ایجنت‌های هوش مصنوعی</em> در عملیات IT')}</h1>
          <p class="lead">${L('An instructor-led course for network, helpdesk, datacenter, web and security engineers. Part 1 teaches how LLMs and agents work. Part 2 puts it into practice: install Hermes Agent, then build agents that take over daily tasks inside our security guardrails, with a human in the loop.', 'دوره‌ای با مدرس برای مهندسان شبکه، هلپ‌دسک، دیتاسنتر، وب و امنیت. بخش اول یاد می‌دهد مدل‌های زبانی بزرگ و ایجنت‌ها چطور کار می‌کنند. بخش دوم آن را عملی می‌کند: Hermes Agent را نصب می‌کنیم و ایجنت‌هایی می‌سازیم که کارهای روزانه را در چارچوب سیاست‌های امنیتی سازمان و با نظارت انسان انجام می‌دهند.')}</p>
          <p class="fa">${L('خودکار سازی فرآیندها با ایجنت‌های هوش مصنوعی', 'AI agent process automation')}</p>
          <div class="hero-actions">
            <a class="btn primary" href="#${first.id}">${started ? L('Continue: ', 'ادامه: ') + esc(first.title) : L('Start the course', 'شروع دوره')} ${A.rtl ? '←' : '→'}</a>
            <a class="btn" href="#m9">${L('Jump to Part 2: hands-on', 'رفتن به بخش 2: کار عملی')}</a>
            <a class="btn" href="#m14">${L('Part 3: agent ecosystem', 'بخش 3: اکوسیستم ایجنت‌ها')}</a>
          </div>
        </div>
        <div class="hero-art">${heroArt()}</div>
      </section>

      <section class="stats" aria-label="${L('Course size', 'اندازه‌ی دوره')}">
        <div class="stat"><b>${A.modules.length}</b><span>${L('modules', 'ماژول')}</span></div>
        <div class="stat"><b>${lessons.length}</b><span>${L('lessons', 'درس')}</span></div>
        <div class="stat"><b>${totalSlides}</b><span>${L('slides', 'اسلاید')}</span></div>
        <div class="stat"><b>${Math.round(totalMins / 60)} ${L('h', 'ساعت')}</b><span>${L('guided time', 'زمان آموزش')}</span></div>
        <div class="stat"><b>${Object.keys(A.widgets).length}</b><span>${L('interactive labs', 'تمرین تعاملی')}</span></div>
      </section>

      <section class="wrap" style="gap:var(--s-3)">
        <div class="section-h"><h2>${L('Who this course is for', 'این دوره برای چه کسانی است')}</h2><span class="label">${L('Entry requirements', 'پیش‌نیازها')}</span></div>
        <div class="prereq">
          <div><h4>${L('Networking', 'شبکه')}</h4><p>${L('You can read an IP plan, explain DNS, DHCP, VLANs and routing, and you have used ping, traceroute and nslookup in anger.', 'می‌توانید یک طرح IP را بخوانید، DNS، DHCP، VLAN و مسیریابی را توضیح دهید و در عمل با ping، traceroute و nslookup عیب‌یابی کرده‌اید.')}</p></div>
          <div><h4>${L('Security', 'امنیت')}</h4><p>${L('You know least privilege, MFA, phishing, firewall rules and why service accounts need guarding.', 'با اصل کمترین دسترسی، MFA، فیشینگ و قوانین فایروال آشنا هستید و می‌دانید چرا حساب‌های سرویس باید محافظت شوند.')}</p></div>
          <div><h4>${L('Programming', 'برنامه‌نویسی')}</h4><p>${L('You can read a short Python or PowerShell script, edit YAML and JSON, and work in a Linux shell.', 'می‌توانید یک اسکریپت کوتاه Python یا PowerShell را بخوانید، فایل‌های YAML و JSON را ویرایش کنید و در شل لینوکس کار کنید.')}</p></div>
          <div><h4>${L('Operations', 'عملیات')}</h4><p>${L('You have worked helpdesk, datacenter or network maintenance and handle tickets, alerts and changes every day.', 'در هلپ‌دسک، دیتاسنتر یا نگهداری شبکه کار کرده‌اید و هر روز با تیکت، هشدار و تغییرات سروکار دارید.')}</p></div>
        </div>
      </section>

      <section class="wrap" style="gap:var(--s-3)">
        <div class="section-h"><h2>${L('Course map', 'نقشه‌ی دوره')}</h2><span class="label">${L('Lit ports = slides you have opened', 'پورت‌های روشن = اسلایدهایی که دیده‌اید')}</span></div>
        ${PARTS.map((p) => { const ms = A.modules.filter((m) => m.part === p); const mins = ms.reduce((a, m) => a + m.lessons.reduce((b, l) => b + (l.mins || 10), 0), 0);
          return `<div class="part-h"><h3>${esc(p.label)}</h3><span class="chip">${ms.length} ${L('modules', 'ماژول')} · ~${Math.round(mins / 60)} ${L('h', 'ساعت')}</span><p class="muted">${esc(p.desc)}</p></div><div class="modgrid">${ms
          .map((m) => {
            const st = modStats(m);
            const ports = m.lessons.map((l) => `<i class="${lessonDone(l) ? 'ok' : (seen[l.id] || []).length ? 'on' : ''}"></i>`).join('');
            return `<a class="modcard" href="#${m.id}"><span class="eyebrow"><span>${L('Module', 'ماژول')} ${pad(m.num)}</span><span>${st.quiz ? L('Quiz', 'آزمونک') + ' ' + st.quiz.score + '/' + st.quiz.total : m.lessons.length + ' ' + L('lessons', 'درس')}</span></span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="ports" aria-label="${st.pct}%">${ports}</div></a>`;
          })
          .join('')}</div>`; }).join('')}
      </section>

      <section class="split">
        <div class="prose"><h3>${L('Presenting this course', 'ارائه‌ی این دوره')}</h3>
          <p>${L('Every lesson is a deck. Open it, press <kbd>P</kbd> to go full-stage, and use <kbd>→</kbd> / <kbd>←</kbd> to move. <kbd>N</kbd> shows speaker notes, <kbd>S</kbd> opens the speaker view, <kbd>/</kbd> searches the whole course, and <kbd>Esc</kbd> leaves presenter mode.', 'هر درس یک ارائه است. آن را باز کنید، با <kbd>P</kbd> به حالت ارائه بروید و با <kbd>→</kbd> / <kbd>←</kbd> جابه‌جا شوید. <kbd>N</kbd> یادداشت‌های ارائه‌دهنده را نشان می‌دهد، <kbd>S</kbd> نمای ارائه‌دهنده را باز می‌کند، <kbd>/</kbd> در کل دوره جستجو می‌کند و <kbd>Esc</kbd> از حالت ارائه خارج می‌شود.')}</p>
          <p>${L('Progress is saved in this browser only. Your colleagues each get their own. The <b>فا / EN</b> button switches between Persian and English.', 'پیشرفت فقط در همین مرورگر ذخیره می‌شود و هر همکار پیشرفت خودش را دارد. دکمه‌ی <b>EN / فا</b> زبان را بین فارسی و انگلیسی عوض می‌کند.')}</p></div>
        <div class="prose"><h3>${L('Where the content came from', 'منبع محتوا')}</h3>
          <p>${L('The course expands the original <i>AI Agent Automation</i> deck (54 slides). The <a href="#deckmap">deck-to-lesson map</a> shows where every original slide lives. Hermes Agent commands were checked against the official Nous Research docs in October 2026.', 'این دوره نسخه‌ی گسترش‌یافته‌ی ارائه‌ی اصلی <i>AI Agent Automation</i> (54 اسلاید) است. <a href="#deckmap">نقشه‌ی اسلاید به درس</a> نشان می‌دهد هر اسلاید اصلی کجا تدریس می‌شود. دستورات Hermes Agent در مهر 1405 (اکتبر 2026) با مستندات رسمی Nous Research بررسی شده‌اند.')}</p></div>
      </section>
    </div>`;
  }

  function heroArt() {
    const D = A.D;
    return D.hub({ t: L('Orchestrator', 'هماهنگ‌کننده'), s: L('Hermes profile', 'پروفایل Hermes'), c: 'ink' }, [
      { t: L('Triage agent', 'ایجنت تریاژ'), s: L('reads tickets', 'تیکت‌ها را می‌خواند') },
      { t: L('Network agent', 'ایجنت شبکه'), s: 'ping · traceroute · SNMP', c: 'tl' },
      { t: L('You (L2 engineer)', 'شما (مهندس سطح 2)'), s: L('approve risky steps', 'تأیید گام‌های پرخطر'), c: 'acc' },
      { t: L('Security agent', 'ایجنت امنیت'), s: L('SIEM · phishing', 'SIEM · فیشینگ'), c: 'tl' },
      { t: L('KB writer', 'نویسنده‌ی پایگاه دانش'), s: L('turns fixes into skills', 'راه‌حل‌ها را به مهارت تبدیل می‌کند') },
    ], { h: 470, rx: 320, ry: 165, bw: 270, bh: 86, r: 92, anim: true });
  }

  function viewModule(m) {
    const st = modStats(m);
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow">${L('Module', 'ماژول')} ${pad(m.num)} · ${m.lessons.length} ${L('lessons', 'درس')} · ${st.pct}% ${L('opened', 'دیده‌شده')}</span><h1>${esc(m.title)}</h1>
      <p class="lead muted">${esc(m.summary)}</p>
      <div class="meta">${m.deck ? `<span class="chip amber">${L('Deck slides', 'اسلایدهای ارائه‌ی اصلی')} ${m.deck.join(', ')}</span>` : ''}${st.quiz ? `<span class="chip">${L('Best quiz score', 'بهترین نمره‌ی آزمونک')} ${st.quiz.score}/${st.quiz.total}</span>` : ''}</div></div>
      ${m.outcomes ? `<div class="callout key"><span class="label">${L('After this module you can', 'پس از این ماژول می‌توانید')}</span>${H_list(m.outcomes)}</div>` : ''}
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>${L('Lesson', 'درس')}</th><th>${L('Slides', 'اسلاید')}</th><th>${L('Time', 'زمان')}</th><th>${L('Progress', 'پیشرفت')}</th></tr></thead><tbody>
      ${m.lessons
        .map((l, i) => `<tr><td class="label">${pad(m.num)}.${i + 1}</td><td><a href="#${l.id}">${esc(l.title)}</a>${l.lab ? ` <span class="chip amber">${L('Lab', 'آزمایشگاه')}</span>` : ''}</td><td>${l.slides.length}</td><td>${l.mins || 10} ${L('min', 'دقیقه')}</td><td><div class="ports">${l.slides.map((_, j) => `<i class="${(seen[l.id] || []).includes(j) ? 'on' : ''}"></i>`).join('')}</div></td></tr>`)
        .join('')}
      ${m.quiz ? `<tr><td class="label">✓</td><td><a href="#${m.id}-quiz">${L('Checkpoint quiz', 'آزمونک پایان ماژول')}</a></td><td>${m.quiz.length} ${L('q', 'سؤال')}</td><td>10 ${L('min', 'دقیقه')}</td><td>${st.quiz ? st.quiz.score + '/' + st.quiz.total : '—'}</td></tr>` : ''}
      </tbody></table></div>
      <div><a class="btn primary" href="#${m.lessons[0].id}">${L('Start module', 'شروع ماژول')} ${pad(m.num)} ${A.rtl ? '←' : '→'}</a></div>
    </div>`;
  }
  const H_list = (items) => `<ul class="list">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

  // ---------- lesson ----------
  let cur = { lesson: null, i: 0, notes: store.get('notes', false), all: false };
  function viewLesson(l) {
    const m = l.module;
    return `<div class="wrap">
      <div class="lesson-head">
        <span class="eyebrow"><a href="#${m.id}" style="color:inherit">${L('Module', 'ماژول')} ${pad(m.num)} · ${esc(m.title)}</a> — ${L('lesson {0} of {1}', 'درس {0} از {1}', l.index + 1, m.lessons.length)}</span>
        <h1>${esc(l.title)}</h1>
        <div class="meta"><span class="chip">~${l.mins || 10} ${L('min', 'دقیقه')}</span>${l.deck && l.deck.length ? `<span class="chip amber">${L('Deck slides', 'اسلایدهای ارائه‌ی اصلی')} ${l.deck.join(', ')}</span>` : ''}${l.lab ? `<span class="chip amber">${L('Hands-on lab', 'آزمایشگاه عملی')}</span>` : ''}</div>
      </div>
      <div class="patch" id="patch"></div>
      <div class="stage">
        <div id="slideHost"></div>
        <div class="notes" id="notes" hidden></div>
        <div class="controls">
          <button class="btn small" id="prevBtn" type="button">${PREV}</button>
          <span class="label" id="counter"></span>
          <span class="spacer"></span>
          <button class="btn small" id="notesBtn" type="button" aria-pressed="false">${L('Notes', 'یادداشت‌ها')} <kbd>N</kbd></button>
          <button class="btn small" id="allBtn" type="button" aria-pressed="false">${L('All slides', 'همه‌ی اسلایدها')}</button>
          <button class="btn small" id="speakerBtn" type="button" title="${L('Open speaker notes in a second window', 'باز کردن یادداشت‌های ارائه‌دهنده در پنجره‌ی دوم')}">${L('Speaker view', 'نمای ارائه‌دهنده')} <kbd>S</kbd></button>
          <button class="btn small" id="presentBtn" type="button">${L('Present', 'ارائه')} <kbd>P</kbd></button>
          <button class="btn small primary" id="nextBtn" type="button">${NEXT}</button>
        </div>
      </div>
      <div class="lesson-foot">
        ${l.prev ? `<a class="btn" href="#${l.prev.id}">${A.rtl ? '→' : '←'} ${esc(l.prev.title)}</a>` : '<span></span>'}
        ${l.index === m.lessons.length - 1 && m.quiz ? `<a class="btn primary" href="#${m.id}-quiz">${L('Module checkpoint quiz', 'آزمونک پایان ماژول')} ${A.rtl ? '←' : '→'}</a>` : l.next ? `<a class="btn" href="#${l.next.id}">${esc(l.next.title)} ${A.rtl ? '←' : '→'}</a>` : ''}
      </div>
    </div>`;
  }
  function slideHTML(l, i) {
    const s = l.slides[i];
    return `<article class="slide" aria-label="${L('Slide', 'اسلاید')} ${i + 1}"><h2><span class="sn">${pad(i + 1)}/${pad(l.slides.length)}</span><span>${s.t}</span></h2><div class="body">${s.b}</div></article>`;
  }
  function drawSlide() {
    const l = cur.lesson, i = cur.i, host = $('#slideHost');
    if (!host) return;
    if (cur.all) {
      host.innerHTML = `<div class="allslides">${l.slides.map((_, j) => slideHTML(l, j)).join('')}</div>`;
      l.slides.forEach((_, j) => markSeen(l, j));
    } else {
      host.innerHTML = slideHTML(l, i);
      markSeen(l, i);
    }
    mountWidgets(host);
    const s = l.slides[i];
    const notes = $('#notes');
    notes.innerHTML = `<span class="label">${L('Speaker notes', 'یادداشت‌های ارائه‌دهنده')}</span>${s.n ? s.n : `<span class="muted">${L('No notes for this slide.', 'این اسلاید یادداشتی ندارد.')}</span>`}`;
    notes.hidden = !cur.notes || cur.all;
    $('#notesBtn').setAttribute('aria-pressed', cur.notes);
    $('#allBtn').setAttribute('aria-pressed', cur.all);
    $('#allBtn').textContent = cur.all ? L('One at a time', 'یکی‌یکی') : L('All slides', 'همه‌ی اسلایدها');
    $('#counter').textContent = cur.all ? `${l.slides.length} ${L('slides', 'اسلاید')}` : L('Slide {0} of {1}', 'اسلاید {0} از {1}', i + 1, l.slides.length);
    $('#prevBtn').disabled = !cur.all && i === 0 && !l.prev;
    $('#nextBtn').textContent = !cur.all && i < l.slides.length - 1 ? NEXT : L('Next lesson →', 'درس بعدی ←');
    broadcast();
    $('#patch').innerHTML = `<span class="label">${L('Slides', 'اسلایدها')}</span>${l.slides
      .map((_, j) => `<button type="button" class="port ${(seen[l.id] || []).includes(j) ? 'seen' : ''} ${j === i && !cur.all ? 'current' : ''}" data-go="${j}" title="${esc(stripTags(l.slides[j].t))}" aria-label="${L('Go to slide', 'رفتن به اسلاید')} ${j + 1}">${j + 1}</button>`)
      .join('')}`;
    renderNav(l);
  }
  function go(delta) {
    const l = cur.lesson;
    if (!l) return;
    if (cur.all) { if (delta > 0 && l.next) location.hash = l.next.id; return; }
    const n = cur.i + delta;
    if (n >= 0 && n < l.slides.length) { cur.i = n; drawSlide(); scrollStage(); }
    else if (n >= l.slides.length) {
      if (l.index === l.module.lessons.length - 1 && l.module.quiz && !document.body.classList.contains('presenting')) location.hash = l.module.id + '-quiz';
      else if (l.next) { pendingSlide = 0; location.hash = l.next.id; }
    } else if (n < 0 && l.prev) { pendingSlide = l.prev.slides.length - 1; location.hash = l.prev.id; }
  }
  let pendingSlide = null;
  function scrollStage() {
    const h = $('#slideHost');
    if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start' });
  }
  main.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || !cur.lesson) return;
    if (t.id === 'prevBtn') go(-1);
    else if (t.id === 'nextBtn') go(1);
    else if (t.id === 'notesBtn') { cur.notes = !cur.notes; store.set('notes', cur.notes); drawSlide(); }
    else if (t.id === 'allBtn') { cur.all = !cur.all; drawSlide(); }
    else if (t.id === 'presentBtn') present(true);
    else if (t.id === 'speakerBtn') openSpeaker();
    else if (t.dataset.go) { cur.i = +t.dataset.go; cur.all = false; drawSlide(); }
  });
  function present(on) {
    document.body.classList.toggle('presenting', on);
    if (on) {
      cur.all = false; drawSlide();
      try { const p = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* optional */ }
      toast(L('Presenter mode — Esc to exit', 'حالت ارائه؛ برای خروج Esc'));
    } else if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) { /* ignore */ } }
    $('#presentBtn') && ($('#presentBtn').innerHTML = on ? `${L('Exit', 'خروج')} <kbd>Esc</kbd>` : `${L('Present', 'ارائه')} <kbd>P</kbd>`);
  }
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('presenting')) present(false); });

  // ---------- quiz ----------
  function viewQuiz(m) {
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow"><a href="#${m.id}" style="color:inherit">${L('Module', 'ماژول')} ${pad(m.num)} · ${esc(m.title)}</a> — ${L('checkpoint', 'جمع‌بندی')}</span><h1>${L('Checkpoint quiz', 'آزمونک پایان ماژول')}</h1>
      <p class="lead muted">${L('{0} questions. Pick an answer to see the explanation. Your best score is saved in this browser.', '{0} سؤال. یک گزینه را انتخاب کنید تا توضیح آن را ببینید. بهترین نمره‌ی شما در همین مرورگر ذخیره می‌شود.', m.quiz.length)}</p></div>
      <div id="quizHost" class="wrap" style="gap:var(--s-3)"></div>
      <div class="score" id="scoreBox"></div>
      <div class="lesson-foot"><a class="btn" href="#${m.lessons[m.lessons.length - 1].id}">${L('← Back to the last lesson', '→ بازگشت به درس آخر')}</a>${(() => { const nm = A.modules[A.modules.indexOf(m) + 1]; return nm ? `<a class="btn primary" href="#${nm.id}">${L('Next: Module {0} →', 'بعدی: ماژول {0} ←', pad(nm.num))}</a>` : `<a class="btn primary" href="#home">${L('Back to course home', 'بازگشت به صفحه‌ی اصلی')}</a>`; })()}</div>
    </div>`;
  }
  function runQuiz(m) {
    const host = $('#quizHost'); let answered = 0, right = 0;
    host.innerHTML = m.quiz
      .map((q, qi) => `<div class="qcard" data-q="${qi}"><span class="label">${L('Question {0} of {1}', 'سؤال {0} از {1}', qi + 1, m.quiz.length)}</span><h3 style="font-stretch:95%">${q.q}</h3><div class="choice">${q.a
        .map((a, ai) => `<button type="button" class="opt" data-a="${ai}"><span class="mk">${(A.rtl ? ['الف', 'ب', 'ج', 'د', 'ه'] : ['A', 'B', 'C', 'D', 'E'])[ai]}</span><span>${a}</span></button>`)
        .join('')}</div><div class="why" hidden></div></div>`)
      .join('');
    const score = () => {
      const best = quiz[m.id];
      $('#scoreBox').innerHTML = `<div class="stat"><b>${right}/${m.quiz.length}</b><span>${L('this attempt ({0} answered)', 'این دور ({0} پاسخ)', answered)}</span></div>${best ? `<div class="stat"><b>${best.score}/${best.total}</b><span>${L('best saved score', 'بهترین نمره‌ی ذخیره‌شده')}</span></div>` : ''}<span class="spacer" style="flex:1"></span><button class="btn small" type="button" id="retake">${L('Retake quiz', 'دوباره امتحان کنید')}</button>`;
      $('#retake').onclick = () => runQuiz(m);
    };
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b || b.disabled) return;
      const card = b.closest('.qcard'), q = m.quiz[+card.dataset.q], ai = +b.dataset.a;
      $$('.opt', card).forEach((o) => { o.disabled = true; if (+o.dataset.a === q.c) o.classList.add('right'); });
      if (ai !== q.c) b.classList.add('wrong'); else right++;
      answered++;
      const w = $('.why', card); w.innerHTML = (ai === q.c ? `<b>${L('Correct.', 'درست است.')}</b> ` : `<b>${L('Not quite.', 'نه دقیقاً.')}</b> `) + q.why; w.hidden = false;
      if (answered === m.quiz.length) {
        const prev = quiz[m.id];
        if (!prev || right > prev.score) { quiz[m.id] = { score: right, total: m.quiz.length }; store.set('quiz', quiz); }
        toast(`${L('Score', 'نمره')} ${right}/${m.quiz.length}`);
        renderNav({ quizOf: m, module: m });
      }
      score();
    });
    score();
  }

  // ---------- speaker view (second window, synced with BroadcastChannel) ----------
  let chan = null;
  try { chan = new BroadcastChannel('ai-agents-academy'); } catch (e) { /* not supported */ }
  function broadcast() {
    const l = cur.lesson; if (!chan || !l) return;
    const nxt = l.slides[cur.i + 1] ? stripTags(l.slides[cur.i + 1].t) : l.next ? L('Next lesson: ', 'درس بعدی: ') + l.next.title : L('End of course', 'پایان دوره');
    chan.postMessage({ type: 'state', module: `${L('Module', 'ماژول')} ${pad(l.module.num)} · ${l.module.title}`, lesson: l.title, i: cur.i, n: l.slides.length, title: stripTags(l.slides[cur.i].t), notes: l.slides[cur.i].n || '', next: nxt, mins: l.mins || 10 });
  }
  if (chan) chan.onmessage = (e) => {
    const d = e.data || {};
    if (d.type === 'go' && cur.lesson) go(d.delta);
    if (d.type === 'hello' && cur.lesson) broadcast();
  };
  function openSpeaker() {
    let w = null;
    try { w = window.open(location.pathname + location.search + '#speaker', 'aaa-speaker', 'width=760,height=640'); } catch (e) { /* blocked */ }
    if (!w) toast(L('Pop-up blocked: open this page in a second window and add #speaker to the address', 'پنجره‌ی بازشو مسدود شد: این صفحه را در پنجره‌ی دیگری باز کنید و ‎#speaker‎ را به انتهای نشانی اضافه کنید'));
  }
  function viewSpeaker() {
    return `<div class="wrap speaker-view"><div class="section-h"><h2>${L('Speaker view', 'نمای ارائه‌دهنده')}</h2><span class="label" id="spClock">00:00</span></div>
      <div class="w-row"><button class="btn small" type="button" id="spPrev">${PREV}</button><button class="btn small primary" type="button" id="spNext">${NEXT}</button><button class="btn small" type="button" id="spReset">${L('Reset timer', 'صفر کردن زمان‌سنج')}</button></div>
      <div id="spBody" class="prose"><p class="muted">${L('Waiting for the presentation window. Open a lesson in the other window; this view follows it.', 'در انتظار پنجره‌ی ارائه. یک درس را در پنجره‌ی دیگر باز کنید؛ این نما آن را دنبال می‌کند.')}</p></div></div>`;
  }
  function startSpeaker() {
    let t0 = Date.now();
    const tick = () => { const s = Math.floor((Date.now() - t0) / 1000); const el = $('#spClock'); if (el) el.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)} ${L('elapsed', 'گذشته')}`; };
    setInterval(tick, 1000);
    $('#spPrev').onclick = () => chan && chan.postMessage({ type: 'go', delta: -1 });
    $('#spNext').onclick = () => chan && chan.postMessage({ type: 'go', delta: 1 });
    $('#spReset').onclick = () => { t0 = Date.now(); tick(); };
    if (!chan) { $('#spBody').innerHTML = `<p>${L('This browser does not support synced windows. Use <kbd>N</kbd> in the main window instead.', 'این مرورگر از پنجره‌های همگام پشتیبانی نمی‌کند. به‌جای آن در پنجره‌ی اصلی <kbd>N</kbd> را بزنید.')}</p>`; return; }
    chan.onmessage = (e) => {
      const d = e.data || {}; if (d.type !== 'state') return;
      $('#spBody').innerHTML = `<span class="label">${esc(d.module)}</span><h3>${esc(d.lesson)} <span class="chip">~${d.mins} ${L('min', 'دقیقه')}</span></h3>
        <div class="callout key"><span class="label">${L('Slide {0} of {1}', 'اسلاید {0} از {1}', d.i + 1, d.n)}</span><b style="font-size:1.25rem">${esc(d.title)}</b></div>
        <div class="notes" style="font-size:1.1rem"><span class="label">${L('Speaker notes', 'یادداشت‌های ارائه‌دهنده')}</span>${d.notes || `<span class="muted">${L('No notes for this slide.', 'این اسلاید یادداشتی ندارد.')}</span>`}</div>
        <p class="muted">${L('Up next: ', 'بعدی: ')}${esc(d.next)}</p>`;
    };
    chan.postMessage({ type: 'hello' });
    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') chan.postMessage({ type: 'go', delta: 1 }); if (e.key === 'ArrowLeft') chan.postMessage({ type: 'go', delta: -1 }); });
  }

  // ---------- simple pages ----------
  function viewPage(name) {
    const p = A.pages[name];
    return `<div class="wrap"><div class="lesson-head"><span class="eyebrow">${esc(p.eyebrow ? tr(p.eyebrow) : L('Reference', 'مرجع'))}</span><h1>${esc(tr(p.title))}</h1>${p.lead ? `<p class="lead muted">${tr(p.lead)}</p>` : ''}</div>${p.render()}</div>`;
  }

  // ---------- router ----------
  const stripTags = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
    document.body.classList.remove('nav-open', 'speaker');
    const wasPresenting = document.body.classList.contains('presenting');
    cur.lesson = null;
    const APP = L('AI Agents Academy', 'آکادمی ایجنت‌های هوش مصنوعی');
    let title = APP;
    if (byLesson[h]) {
      const l = byLesson[h];
      cur.lesson = l; cur.i = pendingSlide != null ? Math.min(pendingSlide, l.slides.length - 1) : 0; pendingSlide = null; cur.all = false;
      main.innerHTML = viewLesson(l); drawSlide(); title = l.title + ' · ' + APP;
      if (wasPresenting) present(true);
    } else {
      if (wasPresenting) present(false);
      if (h.endsWith('-quiz') && byModule[h.slice(0, -5)] && byModule[h.slice(0, -5)].quiz) {
        const m = byModule[h.slice(0, -5)];
        main.innerHTML = viewQuiz(m); runQuiz(m); renderNav({ quizOf: m, module: m }); title = L('Quiz', 'آزمونک') + ' · ' + m.title;
      } else if (byModule[h]) {
        main.innerHTML = viewModule(byModule[h]); renderNav({ mod: byModule[h] }); title = byModule[h].title + ' · ' + APP;
      } else if (h === 'speaker') {
        main.innerHTML = viewSpeaker(); document.body.classList.add('speaker'); startSpeaker(); title = L('Speaker view', 'نمای ارائه‌دهنده') + ' · ' + APP;
      } else if (A.pages[h]) {
        main.innerHTML = viewPage(h); renderNav(h); title = tr(A.pages[h].title) + ' · ' + APP;
      } else {
        main.innerHTML = viewHome(); renderNav('home');
      }
      mountWidgets(main);
    }
    document.title = title;
    if (!wasPresenting) window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', route);

  // ---------- search ----------
  const idx = lessons.map((l) => ({ l, text: (l.title + ' ' + l.module.title + ' ' + l.slides.map((s) => stripTags(s.t + ' ' + s.b)).join(' ')).toLowerCase() }));
  const dlg = $('#searchDlg'), sIn = $('#searchIn'), sRes = $('#searchRes');
  function openSearch() { if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } } sIn.value = ''; doSearch(); sIn.focus(); }
  function doSearch() {
    const q = sIn.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    let res = q ? idx.filter((r) => terms.every((t) => r.text.includes(t))) : idx.slice(0, 12);
    res = res.slice(0, 30);
    const gl = q ? A.glossary.map((g) => [tr(g[0]) + (tr(g[0]) !== g[0] ? ' · ' + g[0] : ''), tr(g[1])]).filter((g) => (g[0] + ' ' + g[1]).toLowerCase().includes(q)).slice(0, 5) : [];
    sRes.innerHTML = res
      .map((r, i) => {
        let snip = '';
        if (q) { const p = r.text.indexOf(terms[0]); snip = r.text.slice(Math.max(0, p - 50), p + 90); }
        return `<a href="#${r.l.id}" class="${i === 0 ? 'sel' : ''}"><span><span class="label">M${pad(r.l.module.num)}</span> ${esc(r.l.title)}</span>${snip ? `<small>…${esc(snip)}…</small>` : `<small>${esc(r.l.module.title)}</small>`}</a>`;
      })
      .join('') + gl.map((g) => `<a href="#glossary"><span><span class="label">${L('Glossary', 'واژه‌نامه')}</span> ${esc(g[0])}</span><small>${esc(stripTags(g[1]).slice(0, 120))}</small></a>`).join('') || `<p class="muted" style="padding:10px">${L('No lessons match. Try a shorter word.', 'درسی پیدا نشد. واژه‌ی کوتاه‌تری را امتحان کنید.')}</p>`;
  }
  sIn.addEventListener('input', doSearch);
  sIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = $('a', sRes); if (a) { location.hash = a.getAttribute('href'); dlg.close(); } } });
  sRes.addEventListener('click', (e) => { if (e.target.closest('a')) dlg.close(); });
  $('#searchBtn').addEventListener('click', openSearch);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  // ---------- keyboard ----------
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); openSearch(); return; }
    if (!cur.lesson) return;
    if (['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && document.body.classList.contains('presenting'))) { e.preventDefault(); go(1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
    else if (e.key === 'n' || e.key === 'N') { cur.notes = !cur.notes; store.set('notes', cur.notes); drawSlide(); }
    else if (e.key === 'p' || e.key === 'P') present(!document.body.classList.contains('presenting'));
    else if (e.key === 's' || e.key === 'S') openSpeaker();
    else if (e.key === 'f' || e.key === 'F') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); } catch (err) { /* optional */ } }
    else if (e.key === 'Escape' && document.body.classList.contains('presenting')) present(false);
  });

  // ---------- mobile nav ----------
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  A.lessons = lessons; A.byLesson = byLesson;
  route();
})();
