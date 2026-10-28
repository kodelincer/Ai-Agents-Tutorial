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
  A.modules.sort((a, b) => a.num - b.num);
  const allLessons = [];
  A.modules.forEach((m) => {
    m.lessons.forEach((l, i) => { l.module = m; l.index = i; allLessons.push(l); });
  });
  const byLesson = Object.fromEntries(allLessons.map((l) => [l.id, l]));
  const byModule = Object.fromEntries(A.modules.map((m) => [m.id, m]));
  // Teaching order: sessions list lesson ids, lessons keep their module and route (#m8-3).
  const sessions = A.sessions || [];
  const bySession = Object.fromEntries(sessions.map((s) => [`s${s.n}`, s]));
  const lessons = [];
  sessions.forEach((s) => {
    s.id = `s${s.n}`;
    s.phaseObj = A.phases.find((p) => p.key === s.phase);
    s.list = s.lessons.map((id) => byLesson[id]).filter(Boolean);
    s.list.forEach((l) => { l.session = s; lessons.push(l); });
  });
  allLessons.forEach((l) => { if (!l.session) lessons.push(l); }); // never lose a lesson that no session lists
  lessons.forEach((l, i) => { l.prev = lessons[i - 1]; l.next = lessons[i + 1]; });
  // A module's checkpoint quiz is offered after its last lesson in teaching order.
  A.modules.forEach((m) => { m.lastLesson = m.lessons.reduce((a, l) => (lessons.indexOf(l) > lessons.indexOf(a) ? l : a), m.lessons[0]); });
  // Persian: translate module, lesson, slide-title, note and quiz text (slide bodies were translated as they were built).
  if (A.lang === 'fa') {
    A.modules.forEach((m) => {
      m.title = tr(m.title); m.summary = tr(m.summary); if (m.outcomes) m.outcomes = m.outcomes.map(tr);
      m.lessons.forEach((l) => { l.title = tr(l.title); l.slides.forEach((s) => { s.t = tr(s.t); if (s.n) s.n = tr(s.n); }); });
      if (m.quiz) m.quiz = m.quiz.map((q) => Object.assign({}, q, { q: tr(q.q), a: q.a.map(tr), why: tr(q.why) }));
    });
    sessions.forEach((s) => { s.title = tr(s.title); s.summary = tr(s.summary); s.goals = s.goals.map(tr); });
  }
  // The modules page groups the content in two parts: fundamentals, then hands-on agent work.
  const PARTS = [
    { key: 'fund', label: L('Part 1 · Fundamentals', 'بخش 1 · مبانی'), test: (m) => m.num <= 8 || m.num === 14, desc: L('How AI, LLMs and agents work: the knowledge every colleague needs before touching a real agent.', 'هوش مصنوعی، مدل‌های زبانی بزرگ و ایجنت‌ها چطور کار می‌کنند: دانشی که هر همکار پیش از کار با یک ایجنت واقعی لازم دارد.') },
    { key: 'prac', label: L('Part 2 · Hands-on with agents', 'بخش 2 · کار عملی با ایجنت‌ها'), test: (m) => m.num >= 9 && m.num <= 15 && m.num !== 14, desc: L('Install Hermes Agent, build skills, teams and role playbooks for our daily work, inside our security guardrails.', 'نصب Hermes Agent و ساختن مهارت‌ها، تیم‌های ایجنت و دستورالعمل‌های نقش‌محور برای کارهای روزانه‌ی ما، در چارچوب سیاست‌های امنیتی سازمان.') },
    { key: 'ext', label: L('Part 3 · Going further', 'بخش 3 · گام‌های بعدی'), test: (m) => m.num === 16 || m.num === 17 || m.num === 19, desc: L('The wider agent ecosystem: other harnesses, orchestrators, model providers and AI gateways, and how to use free models safely.', 'اکوسیستم گسترده‌ی ایجنت‌ها: هارنس‌های دیگر، هماهنگ‌کننده‌ها، ارائه‌دهندگان مدل و دروازه‌های هوش مصنوعی، و استفاده‌ی امن از مدل‌های رایگان.') },
    { key: 'biz', label: L('Part 4 · Agents for every department', 'بخش 4 · ایجنت‌ها برای همه‌ی بخش‌های سازمان'), test: (m) => m.num === 18, desc: L('Practical, safe uses of agents for managers, communications, finance and other departments, with labs on sample data and a pilot plan.', 'کاربردهای عملی و ایمن ایجنت‌ها برای مدیران، ارتباطات، مالی و بخش‌های دیگر، با آزمایشگاه روی داده‌ی نمونه و یک برنامه‌ی پایلوت.') },
  ];
  A.modules.forEach((m) => (m.part = PARTS.find((p) => p.test(m))));
  const lessonMins = (l) => l.mins || 10;
  const sessionMins = (s) => s.list.reduce((a, l) => a + lessonMins(l), 0);

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
  const sessStats = (s) => {
    const total = s.list.reduce((a, l) => a + l.slides.length, 0);
    const got = s.list.reduce((a, l) => a + Math.min((seen[l.id] || []).length, l.slides.length), 0);
    return { total, got, pct: total ? Math.round((100 * got) / total) : 0 };
  };
  const quizzesIn = (s) => A.modules.filter((m) => m.quiz && m.lastLesson && m.lastLesson.session === s);

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

  // ---------- picture zoom (H.shot) ----------
  let zoomDlg;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-zoom]');
    if (!b) return;
    const fig = b.closest('figure');
    if (!zoomDlg) {
      zoomDlg = document.createElement('dialog');
      zoomDlg.className = 'zoom';
      zoomDlg.addEventListener('click', () => zoomDlg.close());
      document.body.appendChild(zoomDlg);
    }
    const img = b.querySelector('img');
    const cap = fig && fig.querySelector('figcaption');
    zoomDlg.innerHTML = `<img src="${img.src}" alt="${esc(img.alt)}"><p>${cap ? cap.innerHTML : ''}</p>`;
    if (zoomDlg.showModal) zoomDlg.showModal(); else zoomDlg.setAttribute('open', '');
  });

  // ---------- sidebar ----------
  function renderNav(cur) {
    const obj = cur && typeof cur === 'object';
    const curSess = obj ? cur.sess || cur.session || (cur.quizOf && cur.quizOf.lastLesson && cur.quizOf.lastLesson.session) : null;
    let h = `<div class="nav-group"><span class="label">${L('Start here', 'شروع')}</span>
      <a class="nav-link ${cur === 'home' ? 'active' : ''}" href="#home"><span class="num">··</span>${L('Course home', 'صفحه‌ی اصلی دوره')}</a>
      <a class="nav-link ${cur === 'sessions' ? 'active' : ''}" href="#sessions"><span class="num">··</span>${L('Session plan', 'برنامه‌ی جلسه‌ها')}</a>
      <a class="nav-link ${cur === 'instructor' ? 'active' : ''}" href="#instructor"><span class="num">··</span>${L('Instructor guide', 'راهنمای مدرس')}</a></div>
      <div class="nav-group">`;
    sessions.forEach((s, i) => {
      const st = sessStats(s);
      if (i === 0 || sessions[i - 1].phase !== s.phase) h += `${i ? '</div><div class="nav-group">' : ''}<span class="label">${esc(s.phaseObj.label)}</span>`;
      const open = curSess === s;
      h += `<a class="nav-link ${open ? 'active' : ''}" href="#${s.id}"><span class="num">S${pad(s.n)}</span><span>${esc(s.title)}${s.optional ? ` <small class="muted">· ${L('optional', 'اختیاری')}</small>` : ''}</span><span class="meter ${st.pct === 100 ? 'done' : ''}">${st.pct}%</span></a>`;
      if (open) {
        h += `<div class="nav-lessons">${s.list
          .map((l) => `<a href="#${l.id}" class="${cur === l ? 'active' : ''} ${lessonDone(l) ? 'seen' : ''}"><span class="dot"></span>${esc(l.title)}</a>`)
          .join('')}${quizzesIn(s).map((m) => `<a href="#${m.id}-quiz" class="quizlink ${obj && cur.quizOf === m ? 'active' : ''} ${quiz[m.id] ? 'seen' : ''}"><span class="dot"></span>${L('Quiz: ', 'آزمونک: ')}${esc(m.title)}</a>`).join('')}</div>`;
      }
    });
    h += `</div><div class="nav-group"><span class="label">${L('Reference', 'مرجع')}</span>
      <a class="nav-link ${cur === 'modules' || (obj && cur.mod) ? 'active' : ''}" href="#modules"><span class="num">··</span>${L('Browse by module', 'مرور بر پایه‌ی ماژول')}</a>
      <a class="nav-link ${cur === 'cheatsheet' ? 'active' : ''}" href="#cheatsheet"><span class="num">··</span>${L('Hermes cheat sheet', 'خلاصه‌ی دستورات Hermes')}</a>
      <a class="nav-link ${cur === 'codingsheet' ? 'active' : ''}" href="#codingsheet"><span class="num">··</span>${L('Claude Code & Codex cheat sheet', 'خلاصه‌ی دستورات Claude Code و Codex')}</a>
      <a class="nav-link ${cur === 'ecosheet' ? 'active' : ''}" href="#ecosheet"><span class="num">··</span>${L('Ecosystem & gateway cheat sheet', 'خلاصه‌ی اکوسیستم و دروازه‌ها')}</a>
      <a class="nav-link ${cur === 'credits' ? 'active' : ''}" href="#credits"><span class="num">··</span>${L('Image credits', 'منابع تصاویر')}</a>
      <a class="nav-link ${cur === 'opencodesheet' ? 'active' : ''}" href="#opencodesheet"><span class="num">··</span>${L('OpenCode cheat sheet', 'خلاصه‌ی دستورات OpenCode')}</a>
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
    const totalMins = lessons.reduce((a, l) => a + lessonMins(l), 0);
    const first = lessons.find((l) => !lessonDone(l)) || lessons[0];
    const started = Object.keys(seen).length > 0;
    return `<div class="wrap">
      <section class="hero">
        <div>
          <div class="eyebrow">${L('AI Agents Academy · Course 01', 'آکادمی ایجنت‌های هوش مصنوعی · دوره‌ی 01')}</div>
          <h1>${L('Put <em>AI agents</em> to work in your organisation', 'به‌کارگیری <em>ایجنت‌های هوش مصنوعی</em> در سازمان شما')}</h1>
          <p class="lead">${L('An instructor-led course in {0} two-hour sessions, for every part of an organisation. Everyone starts with the big picture of AI, language models and agents, and how to use models and pay for them. The IT track then goes deep on coding agents and Hermes Agent. The business track covers managers, communications, finance and other departments with practical, safe use cases. On both tracks, an agent prepares and a person approves.', 'دوره‌ای با مدرس در {0} جلسه‌ی دوساعته، برای همه‌ی بخش‌های یک سازمان. همه با تصویر کلی هوش مصنوعی، مدل‌های زبانی و ایجنت‌ها و با نحوه‌ی استفاده از مدل‌ها و مدیریت هزینه‌شان شروع می‌کنند. مسیر IT سپس عمیقاً به ایجنت‌های کدنویسی و Hermes Agent می‌پردازد. مسیر کسب‌وکار، مدیران، ارتباطات، مالی و بخش‌های دیگر را با کاربردهای عملی و ایمن پوشش می‌دهد. در هر دو مسیر، ایجنت آماده می‌کند و یک انسان تأیید می‌کند.', sessions.length)}</p>
          <p class="fa">${L('خودکار سازی فرآیندها با ایجنت‌های هوش مصنوعی', 'AI agent process automation')}</p>
          <div class="hero-actions">
            <a class="btn primary" href="#${first.id}">${started ? L('Continue: ', 'ادامه: ') + esc(first.title) : L('Start with session 1', 'شروع با جلسه‌ی 1')} ${A.rtl ? '←' : '→'}</a>
            <a class="btn" href="#sessions">${L('See the session plan', 'دیدن برنامه‌ی جلسه‌ها')}</a>
          </div>
        </div>
        <div class="hero-art">${heroArt()}</div>
      </section>

      <section class="stats" aria-label="${L('Course size', 'اندازه‌ی دوره')}">
        <div class="stat"><b>${sessions.length}</b><span>${L('sessions', 'جلسه')}</span></div>
        <div class="stat"><b>${lessons.length}</b><span>${L('lessons', 'درس')}</span></div>
        <div class="stat"><b>${totalSlides}</b><span>${L('slides', 'اسلاید')}</span></div>
        <div class="stat"><b>${Math.round(totalMins / 60)} ${L('h', 'ساعت')}</b><span>${L('guided time', 'زمان آموزش')}</span></div>
        <div class="stat"><b>${Object.keys(A.widgets).length}</b><span>${L('interactive labs', 'تمرین تعاملی')}</span></div>
      </section>

      <section class="wrap" style="gap:var(--s-3)">
        <div class="section-h"><h2>${L('Who this course is for', 'این دوره برای چه کسانی است')}</h2><span class="label">${L('Entry requirements', 'پیش‌نیازها')}</span></div>
        <div class="prereq">
          <div><h4>${L('Business track', 'مسیر کسب‌وکار')}</h4><p>${L('No technical background. You can use email, documents and spreadsheets, and you handle sensitive information carefully.', 'بدون پیش‌زمینه‌ی فنی. می‌توانید از ایمیل، سند و صفحه‌گسترده استفاده کنید و با اطلاعات حساس با دقت رفتار می‌کنید.')}</p></div>
          <div><h4>${L('IT track · networking and security', 'مسیر IT · شبکه و امنیت')}</h4><p>${L('You can read an IP plan, explain DNS, DHCP, VLANs and routing, and you know least privilege, MFA and why service accounts need guarding.', 'می‌توانید یک طرح IP را بخوانید، DNS، DHCP، VLAN و مسیریابی را توضیح دهید و با اصل کمترین دسترسی، MFA و دلیل نیاز حساب‌های سرویس به محافظت آشنا هستید.')}</p></div>
          <div><h4>${L('IT track · programming', 'مسیر IT · برنامه‌نویسی')}</h4><p>${L('You can read a short Python or PowerShell script, edit YAML and JSON, and work in a Linux shell.', 'می‌توانید یک اسکریپت کوتاه Python یا PowerShell را بخوانید، فایل‌های YAML و JSON را ویرایش کنید و در شل لینوکس کار کنید.')}</p></div>
          <div><h4>${L('IT track · operations', 'مسیر IT · عملیات')}</h4><p>${L('You have worked helpdesk, datacenter or network maintenance and handle tickets, alerts and changes every day.', 'در هلپ‌دسک، دیتاسنتر یا نگهداری شبکه کار کرده‌اید و هر روز با تیکت، هشدار و تغییرات سروکار دارید.')}</p></div>
        </div>
      </section>

      <section class="wrap" style="gap:var(--s-3)">
        <div class="section-h"><h2>${L('Session plan', 'برنامه‌ی جلسه‌ها')}</h2><span class="label">${L('Lit ports = lessons you have opened', 'پورت‌های روشن = درس‌هایی که دیده‌اید')}</span></div>
        ${sessionGrid()}
        <p class="muted">${L('Sessions marked optional can be dropped when time is short. <a href="#modules">Browse by module</a> if you prefer the content grouped by topic.', 'جلسه‌های اختیاری را می‌توان در صورت کمبود وقت حذف کرد. اگر ترجیح می‌دهید محتوا بر پایه‌ی موضوع گروه‌بندی شود، <a href="#modules">مرور بر پایه‌ی ماژول</a> را ببینید.')}</p>
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

  function hours(mins) { return Math.round((mins / 60) * 10) / 10; }
  function sessionGrid() {
    return A.phases.map((p) => {
      const ss = sessions.filter((s) => s.phase === p.key);
      if (!ss.length) return '';
      const mins = ss.reduce((a, s) => a + sessionMins(s), 0);
      return `<div class="part-h"><h3>${esc(p.label)}</h3><span class="chip">${ss.length} ${L('sessions', 'جلسه')} · ~${hours(mins)} ${L('h of lessons', 'ساعت درس')}</span></div><div class="modgrid">${ss
        .map((s) => {
          const ports = s.list.map((l) => `<i class="${lessonDone(l) ? 'ok' : (seen[l.id] || []).length ? 'on' : ''}"></i>`).join('');
          return `<a class="modcard" href="#${s.id}"><span class="eyebrow"><span>${L('Session', 'جلسه')} ${pad(s.n)}</span><span>${s.biz ? L('Business', 'کسب‌وکار') + ' · ' : ''}${s.optional ? L('Optional', 'اختیاری') + ' · ' : ''}${s.list.length} ${L('lessons', 'درس')}</span></span><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p><div class="ports" aria-label="${sessStats(s).pct}%">${ports}</div></a>`;
        })
        .join('')}</div>`;
    }).join('');
  }

  function viewSessions() {
    const core = sessions.filter((s) => !s.optional), opt = sessions.filter((s) => s.optional);
    const coreMins = core.reduce((a, s) => a + sessionMins(s), 0);
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow">${L('Teaching plan', 'برنامه‌ی تدریس')}</span><h1>${L('Session plan', 'برنامه‌ی جلسه‌ها')}</h1>
      <p class="lead muted">${L('{0} two-hour sessions. Each lists its lessons in teaching order. The lesson times add up to roughly an hour and a half; the rest of each session is for exercises, questions and a break.', '{0} جلسه‌ی دوساعته. هر جلسه درس‌هایش را به ترتیب تدریس فهرست می‌کند. زمان درس‌ها روی هم حدود یک ساعت و نیم است؛ بقیه‌ی هر جلسه برای تمرین، پرسش و استراحت است.', sessions.length)}</p></div>
      <div class="callout key"><span class="label">${L('Choosing how many sessions', 'انتخاب تعداد جلسه‌ها')}</span><div>${L('All {0} sessions are the full course. Dropping the {1} optional ones ({2}) leaves a core of {3} sessions. Decide with the class after session 3.', 'هر {0} جلسه، دوره‌ی کامل است. با حذف {1} جلسه‌ی اختیاری ({2}) یک هسته‌ی {3} جلسه‌ای می‌ماند. پس از جلسه‌ی 3 همراه با کلاس تصمیم بگیرید.', sessions.length, opt.length, opt.map((s) => pad(s.n)).join(', '), core.length)}</div></div>
      <div class="callout tip"><span class="label">${L('Two tracks', 'دو مسیر')}</span><div>${L('<b>IT track:</b> sessions 1 to 34, from the big picture through coding agents and Hermes, plus the optional agent-skills sessions 39 and 40. <b>Business track:</b> {1} sessions ({0}), no technical background needed, ending with a pilot plan for your own department. In the business track, skip the API lab in session 3.', '<b>مسیر IT:</b> جلسه‌های 1 تا 34، از تصویر کلی تا ایجنت‌های کدنویسی و Hermes، به‌علاوه‌ی جلسه‌های اختیاری مهارت‌های ایجنت یعنی 39 و 40. <b>مسیر کسب‌وکار:</b> {1} جلسه ({0})، بدون نیاز به پیش‌زمینه‌ی فنی، که با یک برنامه‌ی پایلوت برای بخش خودتان تمام می‌شود. در مسیر کسب‌وکار، آزمایشگاه API در جلسه‌ی 3 را رد کنید.', sessions.filter((x) => x.biz).map((x) => x.n).join(', '), sessions.filter((x) => x.biz).length)}</div></div>
      ${A.phases.map((p) => {
        const ss = sessions.filter((s) => s.phase === p.key);
        return `<section class="wrap" style="gap:var(--s-2)"><div class="section-h"><h2>${esc(p.label)}</h2></div><div class="tbl-wrap"><table><thead><tr><th>#</th><th>${L('Session', 'جلسه')}</th><th>${L('Lessons', 'درس‌ها')}</th><th>${L('Lesson time', 'زمان درس‌ها')}</th><th>${L('Progress', 'پیشرفت')}</th></tr></thead><tbody>${ss
          .map((s) => `<tr><td class="label">${pad(s.n)}</td><td><a href="#${s.id}">${esc(s.title)}</a>${s.optional ? ` <span class="chip">${L('Optional', 'اختیاری')}</span>` : ''}</td><td>${s.list.length}</td><td>${sessionMins(s)} ${L('min', 'دقیقه')}</td><td><div class="ports">${s.list.map((l) => `<i class="${lessonDone(l) ? 'ok' : (seen[l.id] || []).length ? 'on' : ''}"></i>`).join('')}</div></td></tr>`)
          .join('')}</tbody></table></div></section>`;
      }).join('')}
      <p class="muted">${L('Core path lesson time: about {0} hours.', 'زمان درس‌های مسیر اصلی: حدود {0} ساعت.', hours(coreMins))}</p>
    </div>`;
  }

  function viewSession(s) {
    const st = sessStats(s);
    const prev = sessions[s.n - 2], next = sessions[s.n];
    const qs = quizzesIn(s);
    const first = s.list.find((l) => !lessonDone(l)) || s.list[0];
    const done = s.list.length && s.list.every(lessonDone);
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow">${esc(s.phaseObj.label)} — ${L('session {0} of {1}', 'جلسه‌ی {0} از {1}', s.n, sessions.length)}${s.optional ? ' · ' + L('optional', 'اختیاری') : ''}</span><h1>${esc(s.title)}</h1>
      <p class="lead muted">${esc(s.summary)}</p>
      <div class="meta"><span class="chip">~${sessionMins(s)} ${L('min of lessons', 'دقیقه درس')}</span><span class="chip">${s.list.length} ${L('lessons', 'درس')}</span>${s.biz ? `<span class="chip amber">${L('Business track', 'مسیر کسب‌وکار')}</span>` : ''}<span class="chip">${st.pct}% ${L('opened', 'دیده‌شده')}</span></div></div>
      <div class="callout key"><span class="label">${L('After this session you can', 'پس از این جلسه می‌توانید')}</span>${H_list(s.goals.map(esc))}</div>
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>${L('Lesson', 'درس')}</th><th>${L('Module', 'ماژول')}</th><th>${L('Slides', 'اسلاید')}</th><th>${L('Time', 'زمان')}</th><th>${L('Progress', 'پیشرفت')}</th></tr></thead><tbody>
      ${s.list.map((l, i) => `<tr><td class="label">${i + 1}</td><td><a href="#${l.id}">${esc(l.title)}</a>${l.lab ? ` <span class="chip amber">${L('Lab', 'آزمایشگاه')}</span>` : ''}</td><td><a href="#${l.module.id}">M${pad(l.module.num)}</a></td><td>${l.slides.length}</td><td>${lessonMins(l)} ${L('min', 'دقیقه')}</td><td><div class="ports">${l.slides.map((_, j) => `<i class="${(seen[l.id] || []).includes(j) ? 'on' : ''}"></i>`).join('')}</div></td></tr>`).join('')}
      ${qs.map((m) => `<tr><td class="label">✓</td><td><a href="#${m.id}-quiz">${L('Checkpoint quiz', 'آزمونک پایان ماژول')}: ${esc(m.title)}</a></td><td><a href="#${m.id}">M${pad(m.num)}</a></td><td>${m.quiz.length} ${L('q', 'سؤال')}</td><td>10 ${L('min', 'دقیقه')}</td><td>${quiz[m.id] ? quiz[m.id].score + '/' + quiz[m.id].total : '—'}</td></tr>`).join('')}
      </tbody></table></div>
      ${done ? `<div class="callout tip"><span class="label">${L('Session complete', 'جلسه تمام شد')}</span><div>${next ? L('Every lesson in this session has been opened. Next up: {0}.', 'همه‌ی درس‌های این جلسه دیده شده‌اند. بعدی: {0}.', esc(next.title)) : L('You have reached the end of the course.', 'به پایان دوره رسیده‌اید.')}</div></div>` : ''}
      <div class="lesson-foot">
        ${prev ? `<a class="btn" href="#${prev.id}">${A.rtl ? '→' : '←'} ${L('Session {0}', 'جلسه‌ی {0}', prev.n)}: ${esc(prev.title)}</a>` : '<span></span>'}
        <a class="btn primary" href="#${first.id}">${done ? L('Review the session', 'مرور جلسه') : L('Start session {0}', 'شروع جلسه‌ی {0}', s.n)} ${A.rtl ? '←' : '→'}</a>
        ${next ? `<a class="btn" href="#${next.id}">${L('Session {0}', 'جلسه‌ی {0}', next.n)}: ${esc(next.title)} ${A.rtl ? '←' : '→'}</a>` : ''}
      </div>
    </div>`;
  }

  function viewModules() {
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow">${L('Reference', 'مرجع')}</span><h1>${L('Browse by module', 'مرور بر پایه‌ی ماژول')}</h1>
      <p class="lead muted">${L('The same lessons grouped by topic. The <a href="#sessions">session plan</a> decides the order they are taught in.', 'همان درس‌ها بر پایه‌ی موضوع گروه‌بندی شده‌اند. ترتیب تدریس را <a href="#sessions">برنامه‌ی جلسه‌ها</a> تعیین می‌کند.')}</p></div>
      ${PARTS.map((p) => { const ms = A.modules.filter((m) => m.part === p); const mins = ms.reduce((a, m) => a + m.lessons.reduce((b, l) => b + lessonMins(l), 0), 0);
        return `<div class="part-h"><h3>${esc(p.label)}</h3><span class="chip">${ms.length} ${L('modules', 'ماژول')} · ~${Math.round(mins / 60)} ${L('h', 'ساعت')}</span><p class="muted">${esc(p.desc)}</p></div><div class="modgrid">${ms
        .map((m) => {
          const st = modStats(m);
          const ports = m.lessons.map((l) => `<i class="${lessonDone(l) ? 'ok' : (seen[l.id] || []).length ? 'on' : ''}"></i>`).join('');
          return `<a class="modcard" href="#${m.id}"><span class="eyebrow"><span>${L('Module', 'ماژول')} ${pad(m.num)}</span><span>${st.quiz ? L('Quiz', 'آزمونک') + ' ' + st.quiz.score + '/' + st.quiz.total : m.lessons.length + ' ' + L('lessons', 'درس')}</span></span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="ports" aria-label="${st.pct}%">${ports}</div></a>`;
        })
        .join('')}</div>`; }).join('')}
    </div>`;
  }

  function heroArt() {
    const D = A.D;
    return D.hub({ t: L('Your assistant', 'دستیار شما'), s: L('prepares, you approve', 'آماده می‌کند، شما تأیید می‌کنید'), c: 'ink' }, [
      { t: L('Briefing agent', 'ایجنت گزارش'), s: L('turns reports into one page', 'گزارش‌ها را به یک صفحه تبدیل می‌کند') },
      { t: L('Comms agent', 'ایجنت ارتباطات'), s: L('drafts from the fact sheet', 'از برگه‌ی واقعیت‌ها پیش‌نویس می‌نویسد'), c: 'tl' },
      { t: L('You', 'شما'), s: L('approve what goes out', 'آنچه بیرون می‌رود را تأیید می‌کنید'), c: 'acc' },
      { t: L('Finance agent', 'ایجنت مالی'), s: L('checks invoices', 'فاکتورها را بررسی می‌کند'), c: 'tl' },
      { t: L('IT agent', 'ایجنت IT'), s: L('triages tickets', 'تیکت‌ها را تریاژ می‌کند') },
    ], { h: 470, rx: 320, ry: 165, bw: 270, bh: 86, r: 92, anim: true });
  }


  function viewModule(m) {
    const st = modStats(m);
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow">${L('Module', 'ماژول')} ${pad(m.num)} · ${m.lessons.length} ${L('lessons', 'درس')} · ${st.pct}% ${L('opened', 'دیده‌شده')}</span><h1>${esc(m.title)}</h1>
      <p class="lead muted">${esc(m.summary)}</p>
      <div class="meta">${m.deck ? `<span class="chip amber">${L('Deck slides', 'اسلایدهای ارائه‌ی اصلی')} ${m.deck.join(', ')}</span>` : ''}${st.quiz ? `<span class="chip">${L('Best quiz score', 'بهترین نمره‌ی آزمونک')} ${st.quiz.score}/${st.quiz.total}</span>` : ''}</div></div>
      ${m.outcomes ? `<div class="callout key"><span class="label">${L('After this module you can', 'پس از این ماژول می‌توانید')}</span>${H_list(m.outcomes)}</div>` : ''}
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>${L('Lesson', 'درس')}</th><th>${L('Session', 'جلسه')}</th><th>${L('Slides', 'اسلاید')}</th><th>${L('Time', 'زمان')}</th><th>${L('Progress', 'پیشرفت')}</th></tr></thead><tbody>
      ${m.lessons
        .map((l, i) => `<tr><td class="label">${pad(m.num)}.${i + 1}</td><td><a href="#${l.id}">${esc(l.title)}</a>${l.lab ? ` <span class="chip amber">${L('Lab', 'آزمایشگاه')}</span>` : ''}</td><td>${l.session ? `<a href="#${l.session.id}">S${pad(l.session.n)}</a>` : '—'}</td><td>${l.slides.length}</td><td>${lessonMins(l)} ${L('min', 'دقیقه')}</td><td><div class="ports">${l.slides.map((_, j) => `<i class="${(seen[l.id] || []).includes(j) ? 'on' : ''}"></i>`).join('')}</div></td></tr>`)
        .join('')}
      ${m.quiz ? `<tr><td class="label">✓</td><td><a href="#${m.id}-quiz">${L('Checkpoint quiz', 'آزمونک پایان ماژول')}</a></td><td>${m.quiz.length} ${L('q', 'سؤال')}</td><td>10 ${L('min', 'دقیقه')}</td><td>${st.quiz ? st.quiz.score + '/' + st.quiz.total : '—'}</td></tr>` : ''}
      </tbody></table></div>
      <div><a class="btn primary" href="#${m.lessons[0].id}">${L('Start module', 'شروع ماژول')} ${pad(m.num)} ${A.rtl ? '←' : '→'}</a></div>
    </div>`;
  }
  const H_list = (items) => `<ul class="list">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

  // ---------- lesson ----------
  let cur = { lesson: null, i: 0, notes: store.get('notes', false), all: false };
  // Where to go when a lesson ends: the module quiz if this closes the module, the next lesson in the
  // same session, or the session page (the natural place to stop and recap).
  function afterLesson(l, presenting) {
    const m = l.module;
    if (l === m.lastLesson && m.quiz && !presenting) return `${m.id}-quiz`;
    if (l.next && l.next.session === l.session) return l.next.id;
    return l.session ? l.session.id : l.next ? l.next.id : null;
  }
  function viewLesson(l) {
    const m = l.module, s = l.session;
    const dest = afterLesson(l, false);
    const footNext = dest === `${m.id}-quiz`
      ? `<a class="btn primary" href="#${dest}">${L('Module checkpoint quiz', 'آزمونک پایان ماژول')} ${A.rtl ? '←' : '→'}</a>`
      : s && dest === s.id ? `<a class="btn primary" href="#${dest}">${L('Finish session {0}', 'پایان جلسه‌ی {0}', s.n)} ${A.rtl ? '←' : '→'}</a>`
      : l.next ? `<a class="btn" href="#${l.next.id}">${esc(l.next.title)} ${A.rtl ? '←' : '→'}</a>` : '';
    return `<div class="wrap">
      <div class="lesson-head">
        <span class="eyebrow">${s
          ? `<a href="#${s.id}" style="color:inherit">${L('Session', 'جلسه')} ${pad(s.n)} · ${esc(s.title)}</a> — ${L('lesson {0} of {1}', 'درس {0} از {1}', s.list.indexOf(l) + 1, s.list.length)}`
          : `<a href="#${m.id}" style="color:inherit">${L('Module', 'ماژول')} ${pad(m.num)} · ${esc(m.title)}</a> — ${L('lesson {0} of {1}', 'درس {0} از {1}', l.index + 1, m.lessons.length)}`}</span>
        <h1>${esc(l.title)}</h1>
        <div class="meta"><span class="chip">~${l.mins || 10} ${L('min', 'دقیقه')}</span><a class="chip" href="#${m.id}">${L('Module', 'ماژول')} ${pad(m.num)}</a>${l.deck && l.deck.length ? `<span class="chip amber">${L('Deck slides', 'اسلایدهای ارائه‌ی اصلی')} ${l.deck.join(', ')}</span>` : ''}${l.lab ? `<span class="chip amber">${L('Hands-on lab', 'آزمایشگاه عملی')}</span>` : ''}</div>
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
        ${footNext}
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
    const endDest = afterLesson(l, document.body.classList.contains('presenting'));
    $('#nextBtn').textContent = !cur.all && i < l.slides.length - 1 ? NEXT : endDest === `${l.module.id}-quiz` ? L('Quiz →', 'آزمونک ←') : l.session && endDest === l.session.id ? L('Finish session →', 'پایان جلسه ←') : L('Next lesson →', 'درس بعدی ←');
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
      const dest = afterLesson(l, document.body.classList.contains('presenting'));
      if (dest) { pendingSlide = 0; location.hash = dest; }
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
      <div class="lesson-foot"><a class="btn" href="#${m.lastLesson.id}">${L('← Back to the last lesson', '→ بازگشت به درس آخر')}</a>${(() => { const ll = m.lastLesson, d = afterLesson(ll, true), s = ll.session; return d ? `<a class="btn primary" href="#${d}">${d === (s && s.id) ? L('Finish session {0} →', 'پایان جلسه‌ی {0} ←', s.n) : L('Next lesson →', 'درس بعدی ←')}</a>` : `<a class="btn primary" href="#home">${L('Back to course home', 'بازگشت به صفحه‌ی اصلی')}</a>`; })()}</div>
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
    chan.postMessage({ type: 'state', module: l.session ? `${L('Session', 'جلسه')} ${pad(l.session.n)} · ${l.session.title}` : `${L('Module', 'ماژول')} ${pad(l.module.num)} · ${l.module.title}`, lesson: l.title, i: cur.i, n: l.slides.length, title: stripTags(l.slides[cur.i].t), notes: l.slides[cur.i].n || '', next: nxt, mins: l.mins || 10 });
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
      } else if (bySession[h]) {
        main.innerHTML = viewSession(bySession[h]); renderNav({ sess: bySession[h] }); title = bySession[h].title + ' · ' + APP;
      } else if (h === 'sessions') {
        main.innerHTML = viewSessions(); renderNav('sessions'); title = L('Session plan', 'برنامه‌ی جلسه‌ها') + ' · ' + APP;
      } else if (h === 'modules') {
        main.innerHTML = viewModules(); renderNav('modules'); title = L('Browse by module', 'مرور بر پایه‌ی ماژول') + ' · ' + APP;
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
  const idx = lessons.map((l) => ({ l, text: (l.title + ' ' + l.module.title + ' ' + (l.session ? l.session.title + ' ' : '') + l.slides.map((s) => stripTags(s.t + ' ' + s.b)).join(' ')).toLowerCase() }));
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
        return `<a href="#${r.l.id}" class="${i === 0 ? 'sel' : ''}"><span><span class="label">${r.l.session ? 'S' + pad(r.l.session.n) : 'M' + pad(r.l.module.num)}</span> ${esc(r.l.title)}</span>${snip ? `<small>…${esc(snip)}…</small>` : `<small>${esc(r.l.module.title)}</small>`}</a>`;
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
