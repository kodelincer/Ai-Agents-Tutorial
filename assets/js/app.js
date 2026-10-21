/* App shell: routing, rendering, progress, presenter mode, search, quizzes. */
(function () {
  const A = window.ACADEMY;
  const { esc, store } = A;
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
    applyTheme(theme); store.set('theme', theme); toast('Theme: ' + theme);
  });

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
    const done = () => toast('Copied to clipboard');
    const fallback = () => {
      if (!node) return toast('Select the text and copy it manually');
      const r = document.createRange(); r.selectNodeContents(node);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      toast('Selected — press Ctrl+C / ⌘C');
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
    let h = `<div class="nav-group"><span class="label">Start here</span>
      <a class="nav-link ${cur === 'home' ? 'active' : ''}" href="#home"><span class="num">··</span>Course home</a>
      <a class="nav-link ${cur === 'instructor' ? 'active' : ''}" href="#instructor"><span class="num">··</span>Instructor guide</a></div>
      <div class="nav-group"><span class="label">Modules</span>`;
    A.modules.forEach((m) => {
      const st = modStats(m);
      const open = curMod === m;
      h += `<a class="nav-link ${open ? 'active' : ''}" href="#${m.id}"><span class="num">M${pad(m.num)}</span><span>${esc(m.title)}</span><span class="meter ${st.pct === 100 ? 'done' : ''}">${st.pct}%</span></a>`;
      if (open) {
        h += `<div class="nav-lessons">${m.lessons
          .map((l) => `<a href="#${l.id}" class="${cur === l ? 'active' : ''} ${lessonDone(l) ? 'seen' : ''}"><span class="dot"></span>${esc(l.title)}</a>`)
          .join('')}${m.quiz ? `<a href="#${m.id}-quiz" class="quizlink ${cur && cur.quizOf === m ? 'active' : ''} ${quiz[m.id] ? 'seen' : ''}"><span class="dot"></span>Checkpoint quiz</a>` : ''}</div>`;
      }
    });
    h += `</div><div class="nav-group"><span class="label">Reference</span>
      <a class="nav-link ${cur === 'cheatsheet' ? 'active' : ''}" href="#cheatsheet"><span class="num">··</span>Hermes cheat sheet</a>
      <a class="nav-link ${cur === 'glossary' ? 'active' : ''}" href="#glossary"><span class="num">··</span>Glossary</a>
      <a class="nav-link ${cur === 'deckmap' ? 'active' : ''}" href="#deckmap"><span class="num">··</span>Deck-to-lesson map</a></div>`;
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
        try { fn(el, opts); } catch (err) { el.innerHTML = `<div class="w-body"><p class="muted">This exercise failed to load (${esc(err.message)}).</p></div>`; console.error(err); }
      }
    });
  }
  A.mountWidgets = mountWidgets;
  // Widget frame helper used by widgets.js
  A.frame = function (el, title, label) {
    el.innerHTML = `<div class="w-head"><span class="label">${esc(label || 'Try it')}</span><span class="t">${esc(title)}</span></div><div class="w-body"></div>`;
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
          <div class="eyebrow">IT Infrastructure Academy · Course 01</div>
          <h1>Put <em>AI agents</em> to work in IT operations</h1>
          <p class="lead">A hands-on course for helpdesk, datacenter and network engineers. Learn how LLMs work and what an agent harness is, then install Hermes Agent and build a team of agents you can delegate real tickets to, with a human in the loop.</p>
          <p class="fa">خودکار سازی فرآیندها با ایجنت‌های هوش مصنوعی</p>
          <div class="hero-actions">
            <a class="btn primary" href="#${first.id}">${started ? 'Continue: ' + esc(first.title) : 'Start the course'} →</a>
            <a class="btn" href="#m9">Jump to the Hermes labs</a>
          </div>
        </div>
        <div class="hero-art">${heroArt()}</div>
      </section>

      <section class="stats" aria-label="Course size">
        <div class="stat"><b>${A.modules.length}</b><span>modules</span></div>
        <div class="stat"><b>${lessons.length}</b><span>lessons</span></div>
        <div class="stat"><b>${totalSlides}</b><span>slides</span></div>
        <div class="stat"><b>${Math.round(totalMins / 60)} h</b><span>guided time</span></div>
        <div class="stat"><b>${Object.keys(A.widgets).length}</b><span>interactive labs</span></div>
      </section>

      <section class="wrap" style="gap:var(--s-3)">
        <div class="section-h"><h2>Who this course is for</h2><span class="label">Entry requirements</span></div>
        <div class="prereq">
          <div><h4>Networking</h4><p>You can read an IP plan, explain DNS, DHCP, VLANs and routing, and you have used ping, traceroute and nslookup in anger.</p></div>
          <div><h4>Security</h4><p>You know least privilege, MFA, phishing, firewall rules and why service accounts need guarding.</p></div>
          <div><h4>Programming</h4><p>You can read a short Python or PowerShell script, edit YAML and JSON, and work in a Linux shell.</p></div>
          <div><h4>Operations</h4><p>You have worked helpdesk, datacenter or network maintenance and handle tickets, alerts and changes every day.</p></div>
        </div>
      </section>

      <section class="wrap" style="gap:var(--s-3)">
        <div class="section-h"><h2>Course map</h2><span class="label">Lit ports = slides you have opened</span></div>
        <div class="modgrid">${A.modules
          .map((m) => {
            const st = modStats(m);
            const ports = m.lessons.map((l) => `<i class="${lessonDone(l) ? 'ok' : (seen[l.id] || []).length ? 'on' : ''}"></i>`).join('');
            return `<a class="modcard" href="#${m.id}"><span class="eyebrow"><span>Module ${pad(m.num)}</span><span>${st.quiz ? 'Quiz ' + st.quiz.score + '/' + st.quiz.total : m.lessons.length + ' lessons'}</span></span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="ports" aria-label="${st.pct}% opened">${ports}</div></a>`;
          })
          .join('')}</div>
      </section>

      <section class="split">
        <div class="prose"><h3>Presenting this course</h3>
          <p>Every lesson is a deck. Open it, press <kbd>P</kbd> to go full-stage, and use <kbd>→</kbd> / <kbd>←</kbd> to move. <kbd>N</kbd> shows speaker notes, <kbd>/</kbd> searches the whole course, and <kbd>Esc</kbd> leaves presenter mode.</p>
          <p>Progress is saved in this browser only. Your colleagues each get their own.</p></div>
        <div class="prose"><h3>Where the content came from</h3>
          <p>The course expands the original <i>AI Agent Automation</i> deck (54 slides). The <a href="#deckmap">deck-to-lesson map</a> shows where every original slide lives. Hermes Agent commands were checked against the official Nous Research docs in October 2026.</p></div>
      </section>
    </div>`;
  }

  function heroArt() {
    const D = A.D;
    return D.hub({ t: 'Orchestrator', s: 'Hermes profile', c: 'ink' }, [
      { t: 'Triage agent', s: 'reads tickets' },
      { t: 'Network agent', s: 'ping · traceroute · SNMP', c: 'tl' },
      { t: 'You (L2 engineer)', s: 'approve risky steps', c: 'acc' },
      { t: 'Security agent', s: 'SIEM · phishing', c: 'tl' },
      { t: 'KB writer', s: 'turns fixes into skills' },
    ], { h: 470, rx: 320, ry: 165, bw: 270, bh: 86, r: 92, anim: true });
  }

  function viewModule(m) {
    const st = modStats(m);
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow">Module ${pad(m.num)} · ${m.lessons.length} lessons · ${st.pct}% opened</span><h1>${esc(m.title)}</h1>
      <p class="lead muted">${esc(m.summary)}</p>
      <div class="meta">${m.deck ? `<span class="chip amber">Deck slides ${m.deck.join(', ')}</span>` : ''}${st.quiz ? `<span class="chip">Best quiz score ${st.quiz.score}/${st.quiz.total}</span>` : ''}</div></div>
      ${m.outcomes ? `<div class="callout key"><span class="label">After this module you can</span>${H_list(m.outcomes)}</div>` : ''}
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Lesson</th><th>Slides</th><th>Time</th><th>Progress</th></tr></thead><tbody>
      ${m.lessons
        .map((l, i) => `<tr><td class="label">${pad(m.num)}.${i + 1}</td><td><a href="#${l.id}">${esc(l.title)}</a>${l.lab ? ' <span class="chip amber">Lab</span>' : ''}</td><td>${l.slides.length}</td><td>${l.mins || 10} min</td><td><div class="ports">${l.slides.map((_, j) => `<i class="${(seen[l.id] || []).includes(j) ? 'on' : ''}"></i>`).join('')}</div></td></tr>`)
        .join('')}
      ${m.quiz ? `<tr><td class="label">✓</td><td><a href="#${m.id}-quiz">Checkpoint quiz</a></td><td>${m.quiz.length} q</td><td>10 min</td><td>${st.quiz ? st.quiz.score + '/' + st.quiz.total : '—'}</td></tr>` : ''}
      </tbody></table></div>
      <div><a class="btn primary" href="#${m.lessons[0].id}">Start module ${pad(m.num)} →</a></div>
    </div>`;
  }
  const H_list = (items) => `<ul class="list">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

  // ---------- lesson ----------
  let cur = { lesson: null, i: 0, notes: store.get('notes', false), all: false };
  function viewLesson(l) {
    const m = l.module;
    return `<div class="wrap">
      <div class="lesson-head">
        <span class="eyebrow"><a href="#${m.id}" style="color:inherit">Module ${pad(m.num)} · ${esc(m.title)}</a> — lesson ${l.index + 1} of ${m.lessons.length}</span>
        <h1>${esc(l.title)}</h1>
        <div class="meta"><span class="chip">~${l.mins || 10} min</span>${l.deck && l.deck.length ? `<span class="chip amber">Deck slide${l.deck.length > 1 ? 's' : ''} ${l.deck.join(', ')}</span>` : ''}${l.lab ? '<span class="chip amber">Hands-on lab</span>' : ''}</div>
      </div>
      <div class="patch" id="patch"></div>
      <div class="stage">
        <div id="slideHost"></div>
        <div class="notes" id="notes" hidden></div>
        <div class="controls">
          <button class="btn small" id="prevBtn" type="button">← Prev</button>
          <span class="label" id="counter"></span>
          <span class="spacer"></span>
          <button class="btn small" id="notesBtn" type="button" aria-pressed="false">Notes <kbd>N</kbd></button>
          <button class="btn small" id="allBtn" type="button" aria-pressed="false">All slides</button>
          <button class="btn small" id="presentBtn" type="button">Present <kbd>P</kbd></button>
          <button class="btn small primary" id="nextBtn" type="button">Next →</button>
        </div>
      </div>
      <div class="lesson-foot">
        ${l.prev ? `<a class="btn" href="#${l.prev.id}">← ${esc(l.prev.title)}</a>` : '<span></span>'}
        ${l.index === m.lessons.length - 1 && m.quiz ? `<a class="btn primary" href="#${m.id}-quiz">Module checkpoint quiz →</a>` : l.next ? `<a class="btn" href="#${l.next.id}">${esc(l.next.title)} →</a>` : ''}
      </div>
    </div>`;
  }
  function slideHTML(l, i) {
    const s = l.slides[i];
    return `<article class="slide" aria-label="Slide ${i + 1}"><h2><span class="sn">${pad(i + 1)}/${pad(l.slides.length)}</span><span>${s.t}</span></h2><div class="body">${s.b}</div></article>`;
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
    notes.innerHTML = `<span class="label">Speaker notes</span>${s.n ? s.n : '<span class="muted">No notes for this slide.</span>'}`;
    notes.hidden = !cur.notes || cur.all;
    $('#notesBtn').setAttribute('aria-pressed', cur.notes);
    $('#allBtn').setAttribute('aria-pressed', cur.all);
    $('#allBtn').textContent = cur.all ? 'One at a time' : 'All slides';
    $('#counter').textContent = cur.all ? `${l.slides.length} slides` : `Slide ${i + 1} of ${l.slides.length}`;
    $('#prevBtn').disabled = !cur.all && i === 0 && !l.prev;
    $('#nextBtn').textContent = !cur.all && i < l.slides.length - 1 ? 'Next →' : 'Next lesson →';
    $('#patch').innerHTML = `<span class="label">Slides</span>${l.slides
      .map((_, j) => `<button type="button" class="port ${(seen[l.id] || []).includes(j) ? 'seen' : ''} ${j === i && !cur.all ? 'current' : ''}" data-go="${j}" title="${esc(stripTags(l.slides[j].t))}" aria-label="Go to slide ${j + 1}">${j + 1}</button>`)
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
    else if (t.dataset.go) { cur.i = +t.dataset.go; cur.all = false; drawSlide(); }
  });
  function present(on) {
    document.body.classList.toggle('presenting', on);
    if (on) {
      cur.all = false; drawSlide();
      try { const p = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* optional */ }
      toast('Presenter mode — Esc to exit');
    } else if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) { /* ignore */ } }
    $('#presentBtn') && ($('#presentBtn').innerHTML = on ? 'Exit <kbd>Esc</kbd>' : 'Present <kbd>P</kbd>');
  }
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('presenting')) present(false); });

  // ---------- quiz ----------
  function viewQuiz(m) {
    return `<div class="wrap">
      <div class="lesson-head"><span class="eyebrow"><a href="#${m.id}" style="color:inherit">Module ${pad(m.num)} · ${esc(m.title)}</a> — checkpoint</span><h1>Checkpoint quiz</h1>
      <p class="lead muted">${m.quiz.length} questions. Pick an answer to see the explanation. Your best score is saved in this browser.</p></div>
      <div id="quizHost" class="wrap" style="gap:var(--s-3)"></div>
      <div class="score" id="scoreBox"></div>
      <div class="lesson-foot"><a class="btn" href="#${m.lessons[m.lessons.length - 1].id}">← Back to the last lesson</a>${(() => { const nm = A.modules[A.modules.indexOf(m) + 1]; return nm ? `<a class="btn primary" href="#${nm.id}">Next: Module ${pad(nm.num)} →</a>` : '<a class="btn primary" href="#home">Back to course home</a>'; })()}</div>
    </div>`;
  }
  function runQuiz(m) {
    const host = $('#quizHost'); let answered = 0, right = 0;
    host.innerHTML = m.quiz
      .map((q, qi) => `<div class="qcard" data-q="${qi}"><span class="label">Question ${qi + 1} of ${m.quiz.length}</span><h3 style="font-stretch:95%">${q.q}</h3><div class="choice">${q.a
        .map((a, ai) => `<button type="button" class="opt" data-a="${ai}"><span class="mk">${'ABCDE'[ai]}</span><span>${a}</span></button>`)
        .join('')}</div><div class="why" hidden></div></div>`)
      .join('');
    const score = () => {
      const best = quiz[m.id];
      $('#scoreBox').innerHTML = `<div class="stat"><b>${right}/${m.quiz.length}</b><span>this attempt (${answered} answered)</span></div>${best ? `<div class="stat"><b>${best.score}/${best.total}</b><span>best saved score</span></div>` : ''}<span class="spacer" style="flex:1"></span><button class="btn small" type="button" id="retake">Retake quiz</button>`;
      $('#retake').onclick = () => runQuiz(m);
    };
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b || b.disabled) return;
      const card = b.closest('.qcard'), q = m.quiz[+card.dataset.q], ai = +b.dataset.a;
      $$('.opt', card).forEach((o) => { o.disabled = true; if (+o.dataset.a === q.c) o.classList.add('right'); });
      if (ai !== q.c) b.classList.add('wrong'); else right++;
      answered++;
      const w = $('.why', card); w.innerHTML = (ai === q.c ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.why; w.hidden = false;
      if (answered === m.quiz.length) {
        const prev = quiz[m.id];
        if (!prev || right > prev.score) { quiz[m.id] = { score: right, total: m.quiz.length }; store.set('quiz', quiz); }
        toast(`Score ${right}/${m.quiz.length}`);
        renderNav({ quizOf: m, module: m });
      }
      score();
    });
    score();
  }

  // ---------- simple pages ----------
  function viewPage(name) {
    const p = A.pages[name];
    return `<div class="wrap"><div class="lesson-head"><span class="eyebrow">${esc(p.eyebrow || 'Reference')}</span><h1>${esc(p.title)}</h1>${p.lead ? `<p class="lead muted">${p.lead}</p>` : ''}</div>${p.render()}</div>`;
  }

  // ---------- router ----------
  const stripTags = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
    document.body.classList.remove('nav-open');
    const wasPresenting = document.body.classList.contains('presenting');
    cur.lesson = null;
    let title = 'AI Agents Academy';
    if (byLesson[h]) {
      const l = byLesson[h];
      cur.lesson = l; cur.i = pendingSlide != null ? Math.min(pendingSlide, l.slides.length - 1) : 0; pendingSlide = null; cur.all = false;
      main.innerHTML = viewLesson(l); drawSlide(); title = l.title + ' · AI Agents Academy';
      if (wasPresenting) present(true);
    } else {
      if (wasPresenting) present(false);
      if (h.endsWith('-quiz') && byModule[h.slice(0, -5)] && byModule[h.slice(0, -5)].quiz) {
        const m = byModule[h.slice(0, -5)];
        main.innerHTML = viewQuiz(m); runQuiz(m); renderNav({ quizOf: m, module: m }); title = 'Quiz · ' + m.title;
      } else if (byModule[h]) {
        main.innerHTML = viewModule(byModule[h]); renderNav({ mod: byModule[h] }); title = byModule[h].title + ' · AI Agents Academy';
      } else if (A.pages[h]) {
        main.innerHTML = viewPage(h); renderNav(h); title = A.pages[h].title + ' · AI Agents Academy';
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
    const gl = q ? A.glossary.filter((g) => (g[0] + ' ' + g[1]).toLowerCase().includes(q)).slice(0, 5) : [];
    sRes.innerHTML = res
      .map((r, i) => {
        let snip = '';
        if (q) { const p = r.text.indexOf(terms[0]); snip = r.text.slice(Math.max(0, p - 50), p + 90); }
        return `<a href="#${r.l.id}" class="${i === 0 ? 'sel' : ''}"><span><span class="label">M${pad(r.l.module.num)}</span> ${esc(r.l.title)}</span>${snip ? `<small>…${esc(snip)}…</small>` : `<small>${esc(r.l.module.title)}</small>`}</a>`;
      })
      .join('') + gl.map((g) => `<a href="#glossary"><span><span class="label">Glossary</span> ${esc(g[0])}</span><small>${esc(stripTags(g[1]).slice(0, 120))}</small></a>`).join('') || '<p class="muted" style="padding:10px">No lessons match. Try a shorter word.</p>';
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
    else if (e.key === 'f' || e.key === 'F') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); } catch (err) { /* optional */ } }
    else if (e.key === 'Escape' && document.body.classList.contains('presenting')) present(false);
  });

  // ---------- mobile nav ----------
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  A.lessons = lessons; A.byLesson = byLesson;
  route();
})();
