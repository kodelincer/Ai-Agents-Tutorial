/* Core namespace, HTML helpers (H) and diagram generators (D).
   Content files call ACADEMY.module({...}) and use H/D to keep lessons short and consistent. */
(function () {
  const A = (window.ACADEMY = window.ACADEMY || { modules: [], widgets: {}, glossary: [], pages: {} });
  A.module = (m) => A.modules.push(m);

  // ---------- language (English / Persian) ----------
  // Every visible string exists in both languages. Content strings are translated through
  // dictionaries in assets/i18n/fa/*.js (keyed by A.key(english)); UI and widget strings use L(en, fa).
  A.lang = (function () {
    let l = null;
    try { const h = (location.hash || '').slice(1); if (h === 'fa' || h === 'en') { l = h; localStorage.setItem('aaa:lang', JSON.stringify(h)); } } catch (e) { /* no storage */ }
    try { if (!l) l = JSON.parse(localStorage.getItem('aaa:lang')); } catch (e) { /* no storage */ }
    if (!l && typeof navigator !== 'undefined') l = (navigator.language || '').toLowerCase().startsWith('fa') ? 'fa' : 'en';
    return l === 'fa' ? 'fa' : 'en';
  })();
  A.rtl = A.lang === 'fa';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = A.lang;
    document.documentElement.dir = A.rtl ? 'rtl' : 'ltr';
  }
  A.dicts = { fa: {} };
  A.i18n = (lang, obj) => { A.dicts[lang] = Object.assign(A.dicts[lang] || {}, obj); };
  const normKey = (s) => String(s).replace(/\s+/g, ' ').trim();
  A.key = function (s) {
    s = normKey(s);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36) + s.length.toString(36);
  };
  // Translate a content string (HTML allowed). '=' in a dictionary means "same as English".
  A.tr = function (s) {
    if (typeof s !== 'string' || !s) return s;
    if (A.collect) A.collect(s);
    if (A.lang === 'en') return s;
    const v = A.dicts.fa[A.key(s)];
    return v == null || v === '=' ? s : v;
  };
  // Inline pair for UI and widget strings: L('Next', 'بعدی'). Extra args fill {0}, {1}…
  A.L = function (en, fa, ...args) {
    let s = A.lang === 'fa' && fa != null ? fa : en;
    args.forEach((a, i) => { s = s.split('{' + i + '}').join(a); });
    return s;
  };
  const tr = A.tr, L = A.L;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  A.esc = esc;

  // Store wrapper: progress lives in the viewer's browser only, and the app must work without it.
  A.store = {
    get(k, d) { try { const v = localStorage.getItem('aaa:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('aaa:' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };

  // Helper output is remembered while collecting strings, so only leaf text is extracted.
  const out = (html) => { if (A.collect) A.produced.add(html); return html; };
  A.produced = new Set();
  A.out = out;

  // ---------- HTML helpers ----------
  const H = (A.H = {
    lead: (t) => out(`<p class="lead">${tr(t)}</p>`),
    p: (t) => out(`<p>${tr(t)}</p>`),
    prose: (...ps) => out(`<div class="prose">${ps.map((p) => { p = tr(p); return p.startsWith('<') ? p : `<p>${p}</p>`; }).join('')}</div>`),
    list: (items) => out(`<ul class="list">${items.map((i) => `<li>${tr(i)}</li>`).join('')}</ul>`),
    steps: (items) => out(`<ol class="steps">${items.map((i) => (Array.isArray(i) ? `<li><b>${tr(i[0])}</b>${i[1] ? `<span>${tr(i[1])}</span>` : ''}</li>` : `<li><b>${tr(i)}</b></li>`)).join('')}</ol>`),
    cards: (items, cols) =>
      out(`<div class="cards ${cols ? 'c' + cols : ''}">${items
        .map(([t, b, tag]) => `<div class="card">${tag ? `<span class="tag">${tr(tag)}</span>` : ''}<h4>${tr(t)}</h4>${b ? `<div>${tr(b)}</div>` : ''}</div>`)
        .join('')}</div>`),
    note: (type, html, label) => {
      const N = { tip: L('Tip', 'نکته'), warn: L('Watch out', 'هشدار'), crit: L('Danger', 'خطر'), it: L('In our IT world', 'در دنیای IT ما'), key: L('Key idea', 'ایده‌ی کلیدی') };
      return out(`<div class="callout ${type}"><span class="label">${label ? tr(label) : N[type] || L('Note', 'یادداشت')}</span><div>${tr(html)}</div></div>`);
    },
    code: (text, lang, title) =>
      out(`<div class="code" data-lang="${lang || 'bash'}"><div class="code-h"><span class="t">${esc(title ? tr(title) : lang || 'bash')}</span><button type="button" class="copy">${L('Copy', 'کپی')}</button></div><pre><code>${esc(text.replace(/^\n/, '').replace(/\s+$/, ''))}</code></pre></div>`),
    table: (head, rows) =>
      out(`<div class="tbl-wrap"><table><thead><tr>${head.map((h) => `<th>${tr(h)}</th>`).join('')}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${tr(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`),
    split: (l, r, cls) => out(`<div class="split ${cls || ''}"><div class="prose-col">${tr(l)}</div><div>${tr(r)}</div></div>`),
    fig: (svg, cap) => out(`<figure class="fig"><div class="fig-scroll">${svg}</div>${cap ? `<figcaption>${tr(cap)}</figcaption>` : ''}</figure>`),
    // Interface screenshot from the registry in shots.js: framed, zoomable on click, with a credit line.
    shot: (id, cap, o) => {
      const r = A.shots && A.shots[id];
      if (!r) return out('');
      o = o || {};
      const s = r.src, src = r.img;
      const credit = `${L('Source: ', 'منبع: ')}<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> · ${s.cap ? L('captured from version {0}', 'ثبت‌شده از نسخه‌ی {0}', s.cap) + ' · ' : ''}${esc(s.license)}`;
      return out(`<figure class="shot${o.small ? ' small' : ''}"><button type="button" class="shot-img" data-zoom aria-label="${L('Enlarge picture', 'بزرگ‌نمایی تصویر')}"><img src="${src}" alt="${esc(tr(r.alt))}" width="${r.w}" decoding="async"</button><figcaption>${cap ? tr(cap) + '<br>' : ''}<span class="shot-credit">${credit}</span></figcaption></figure>`);
    },
    shots: (items) => out(`<div class="shot-grid">${items.map((i) => (Array.isArray(i) ? H.shot(i[0], i[1], i[2]) : H.shot(i))).join('')}</div>`),
    widget: (name, opts) => { if (opts && opts.title) tr(opts.title); return out(`<div class="widget" data-widget="${name}" data-opts="${esc(JSON.stringify(opts || {}))}"></div>`); },
    quote: (t, who) => out(`<div class="quote">${tr(t)}${who ? `<div class="label" style="margin-top:6px;font-style:normal">${tr(who)}</div>` : ''}</div>`),
    chips: (items) => out(`<div class="w-row">${items.map((i) => `<span class="chip">${tr(i)}</span>`).join('')}</div>`),
    stack: (...parts) => out(parts.map(tr).join('')),
  });

  // ---------- SVG diagram generators ----------
  const lines = (txt) => String(txt).split('\n');
  // Visual anchors: 'start' = left edge, 'end' = right edge, in both directions.
  const R = A.rtl;
  const dirAttr = R ? ' direction="rtl"' : '';
  const ta = (a) => (R ? { start: 'end', end: 'start' }[a] || a : a);
  const mx = (x, W) => (R ? W - x : x); // mirror an x position for right-to-left layouts
  // maxW: shrink the font so the longest line fits (labels differ in length between languages)
  function text(x, y, txt, cls, anchor, lh, maxW) {
    const ls = lines(txt);
    lh = lh || 19;
    const y0 = y - ((ls.length - 1) * lh) / 2;
    let fit = '';
    if (maxW) {
      const base = /^t/.test(cls) ? (R ? 16 : 17) : /^m/.test(cls) ? (R ? 12 : 11) : 13;
      const longest = Math.max(...ls.map((l) => l.length));
      const need = longest * base * (R ? 0.5 : 0.55);
      if (need > maxW) fit = ` style="font-size:${Math.max(9, (base * maxW) / need).toFixed(1)}px"`;
    }
    return `<text x="${x}" y="${y0}" class="${cls}"${fit} text-anchor="${ta(anchor || 'middle')}"${dirAttr} dominant-baseline="middle">${ls
      .map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`)
      .join('')}</text>`;
  }
  const norm = (it) => (typeof it === 'string' ? { t: tr(it) } : it.__tr ? it : Object.assign({}, it, { t: tr(it.t), s: it.s ? tr(it.s) : it.s, __tr: 1 }));
  const boxCls = (c) => ({ acc: 'box-acc', tl: 'box-tl', ink: 'box-ink', crit: 'box-crit', ok: 'box-ok' }[c] || 'box');
  const arrowDefs = (id) =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker><marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-acc"/></marker></defs>`;
  let uid = 0;
  const nid = () => 'm' + ++uid;
  function box(x, y, w, h, it) {
    it = norm(it);
    const inv = it.c === 'ink';
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${boxCls(it.c)}"/>`;
    if (it.s) {
      s += text(x + w / 2, y + h / 2 - 11, it.t, inv ? 't-inv' : 't', 'middle', 19, w - 14);
      s += text(x + w / 2, y + h / 2 + 14 + (lines(it.t).length - 1) * 9, it.s, 's', 'middle', 16, w - 12);
    } else s += text(x + w / 2, y + h / 2, it.t, inv ? 't-inv' : 't', 'middle', 19, w - 14);
    return s;
  }

  const D = (A.D = {
    // Horizontal pipeline. opts: {h, loop:'label', anim:true}
    flow(items, opts) {
      opts = opts || {};
      const n = items.length, W = 1000, gap = 34, h = opts.h || 96, top = 20;
      const w = (W - 40 - gap * (n - 1)) / n;
      const id = nid();
      let s = '';
      const bx = (i) => (R ? W - 20 - w - i * (w + gap) : 20 + i * (w + gap));
      items.forEach((it, i) => {
        const x = bx(i);
        s += box(x, top, w, h, it);
        if (i < n - 1) {
          const a1 = R ? x - 3 : x + w + 3, a2 = R ? x - gap + 3 : x + w + gap - 3;
          s += `<line x1="${a1}" y1="${top + h / 2}" x2="${a2}" y2="${top + h / 2}" class="${opts.anim ? 'ln-acc anim' : 'ln'}" marker-end="url(#${id}${opts.anim ? 'a' : ''})"/>`;
        }
      });
      let H2 = top + h + 20;
      if (opts.loop) {
        const y = top + h + 18, x1 = bx(n - 1) + w / 2, x0 = bx(0) + w / 2;
        s += `<path d="M${x1},${top + h + 2} L${x1},${y + 20} L${x0},${y + 20} L${x0},${top + h + 6}" class="ln-acc dash" marker-end="url(#${id}a)"/>`;
        s += `<rect x="${W / 2 - 150}" y="${y + 8}" width="300" height="24" rx="12" class="box"/>` + text(W / 2, y + 20, tr(opts.loop), 'm');
        H2 = y + 44;
      }
      return `<svg viewBox="0 0 ${W} ${H2}" role="img" aria-label="${esc(items.map((i) => norm(i).t.replace(/\n/g, ' ')).join(' → '))}">${arrowDefs(id)}${s}</svg>`;
    },
    // Concentric "Russian doll" sets, outermost first.
    nested(items) {
      const W = 1000, step = 34, n = items.length, Hh = 2 * (14 + (n - 1) * step) + 90;
      let s = '';
      items.forEach((it, i) => {
        it = norm(it);
        const x = 20 + i * step * 1.6, y = 14 + i * step, w = W - 2 * x, h = Hh - 2 * y + 10;
        const cls = i === n - 1 ? 'box-acc' : i % 2 ? 'box' : 'box-tl';
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="${cls}" style="fill-opacity:${i === n - 1 ? 1 : 0.55}"/>`;
        if (i === n - 1) s += text(W / 2, y + h / 2 - (it.s ? 8 : 0), it.t, 't') + (it.s ? text(W / 2, y + h / 2 + 16, it.s, 's') : '');
        else {
          const tw = it.t.length * (R ? 7.5 : 8.6) + 14;
          s += `<text x="${mx(x + 16, W)}" y="${y + 22}" class="t" style="font-size:15px" text-anchor="start"${dirAttr}>${esc(it.t)}</text>` + (it.s ? `<text x="${mx(x + 16 + tw, W)}" y="${y + 22}" class="s" text-anchor="start"${dirAttr}>${esc(it.s)}</text>` : '');
        }
      });
      return `<svg viewBox="0 0 ${W} ${Hh + 4}" role="img" aria-label="${esc(items.map((i) => norm(i).t).join(' ⊃ '))}">${s}</svg>`;
    },
    // Vertical stack of horizontal layers (top = closest to the user).
    stack(items, opts) {
      opts = opts || {};
      const W = 1000, h = opts.h || 54, gap = 8, n = items.length;
      let s = '';
      items.forEach((it, i) => {
        it = norm(it);
        const y = 10 + i * (h + gap);
        s += `<rect x="20" y="${y}" width="${W - 40}" height="${h}" rx="8" class="${boxCls(it.c)}"/>`;
        s += `<text x="${mx(44, W)}" y="${y + h / 2}" class="${it.c === 'ink' ? 't-inv' : 't'}" text-anchor="start"${dirAttr} dominant-baseline="middle">${esc(it.t)}</text>`;
        if (it.s) s += `<text x="${mx(W - 44, W)}" y="${y + h / 2}" class="s" text-anchor="end"${dirAttr} dominant-baseline="middle">${esc(it.s)}</text>`;
      });
      return `<svg viewBox="0 0 ${W} ${20 + n * (h + gap)}" role="img" aria-label="${esc(items.map((i) => norm(i).t).join(', '))}">${s}</svg>`;
    },
    // Centre node with spokes.
    hub(center, spokes, opts) {
      opts = opts || {};
      const W = 1000, Hh = opts.h || 460, cx = W / 2, cy = Hh / 2, rx = opts.rx || 360, ry = opts.ry || 168, n = spokes.length;
      const bw = opts.bw || 190, bh = opts.bh || 62;
      let s = '';
      spokes.forEach((it, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
        s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ln-tl ${opts.anim ? 'anim' : 'dash'}"/>`;
      });
      spokes.forEach((it, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
        s += box(x - bw / 2, y - bh / 2, bw, bh, it);
      });
      const c = norm(center);
      s += `<circle cx="${cx}" cy="${cy}" r="${opts.r || 78}" class="${c.c === 'acc' ? 'box-acc' : 'box-ink'}"/>`;
      const cr = opts.r || 78;
      s += text(cx, cy - (c.s ? 9 : 0), c.t, c.c === 'acc' ? 't' : 't-inv', 'middle', 19, 2 * cr - 16) + (c.s ? text(cx, cy + 16, c.s, c.c === 'acc' ? 's' : 'm', 'middle', 16, 2 * cr - 24) : '');
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(c.t + ': ' + spokes.map((i) => norm(i).t).join(', '))}">${s}</svg>`;
    },
    // Items on a loop (e.g. agent loop).
    cycle(items, center, opts) {
      opts = opts || {};
      const W = 1000, Hh = opts.h || 440, cx = W / 2, cy = Hh / 2, rx = 330, ry = 160, n = items.length, bw = 200, bh = 70;
      const id = nid();
      let s = arrowDefs(id);
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="ln-acc anim" />`;
      items.forEach((it, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        s += box(cx + rx * Math.cos(a) - bw / 2, cy + ry * Math.sin(a) - bh / 2, bw, bh, it);
      });
      if (center) { const c = norm(center); s += text(cx, cy - 10, c.t, 't') + (c.s ? text(cx, cy + 16, c.s, 's') : ''); }
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(items.map((i) => norm(i).t.replace(/\n/g, ' ')).join(' → '))}">${s}</svg>`;
    },
    // Columns of boxes, e.g. comparison of tiers. cols: [{h:'Header', items:[...] , c}]
    columns(cols, opts) {
      opts = opts || {};
      const W = 1000, n = cols.length, gap = 18, w = (W - 40 - gap * (n - 1)) / n, bh = opts.bh || 44, hh = 50;
      const rows = Math.max(...cols.map((c) => c.items.length));
      const Hh = 20 + hh + rows * (bh + 8) + 16;
      let s = '';
      cols.forEach((col, i) => {
        const x = R ? W - 20 - w - i * (w + gap) : 20 + i * (w + gap);
        s += `<rect x="${x}" y="10" width="${w}" height="${Hh - 20}" rx="10" class="box" style="fill-opacity:.5"/>`;
        s += `<rect x="${x}" y="10" width="${w}" height="${hh}" rx="10" class="${boxCls(col.c || 'ink')}"/>`;
        s += text(x + w / 2, 10 + hh / 2, tr(col.h), (col.c || 'ink') === 'ink' ? 't-inv' : 't', 'middle', 19, w - 20);
        col.items.forEach((it, j) => {
          const y = 20 + hh + j * (bh + 8);
          s += `<rect x="${x + 10}" y="${y}" width="${w - 20}" height="${bh}" rx="6" class="${boxCls(norm(it).c)}"/>`;
          s += text(x + w / 2, y + bh / 2, norm(it).t, 's', 'middle', 16, w - 34);
        });
      });
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(cols.map((c) => tr(c.h)).join(', '))}">${s}</svg>`;
    },
    // Swimlane sequence: lanes:[names], msgs:[[from,to,label,cls]]
    seq(lanes, msgs, opts) {
      opts = opts || {};
      const W = 1000, n = lanes.length, lw = (W - 40) / n, top = 64, step = opts.step || 46;
      const Hh = top + msgs.length * step + 24;
      const id = nid();
      let s = arrowDefs(id);
      const lx = (i) => 20 + lw * (R ? n - 1 - i : i) + lw / 2;
      lanes.forEach((l, i) => {
        const x = lx(i);
        s += `<rect x="${x - lw / 2 + 10}" y="8" width="${lw - 20}" height="40" rx="8" class="${i === (opts.focus ?? -1) ? 'box-acc' : 'box'}"/>` + text(x, 28, tr(l), 't', 'middle', 19, lw - 30);
        s += `<line x1="${x}" y1="48" x2="${x}" y2="${Hh - 8}" class="ln dash"/>`;
      });
      msgs.forEach(([f, t, label, cls], j) => {
        const y = top + j * step + 18, x1 = lx(f), x2 = lx(t);
        label = tr(label);
        const acc = cls === 'acc';
        if (f === t) {
          const d = R ? -1 : 1;
          s += `<path d="M${x1},${y - 8} h${40 * d} v16 h${-36 * d}" class="${acc ? 'ln-acc' : 'ln'}" marker-end="url(#${id}${acc ? 'a' : ''})"/>`;
          s += `<text x="${x1 + 48 * d}" y="${y}" class="s" text-anchor="${R ? ta('end') : 'start'}"${dirAttr} dominant-baseline="middle">${esc(label)}</text>`;
        } else {
          s += `<line x1="${x1}" y1="${y}" x2="${x2 + (x2 > x1 ? -4 : 4)}" y2="${y}" class="${acc ? 'ln-acc' : 'ln'} ${cls === 'dash' ? 'dash' : ''}" marker-end="url(#${id}${acc ? 'a' : ''})"/>`;
          s += `<text x="${(x1 + x2) / 2}" y="${y - 9}" class="s" text-anchor="middle"${dirAttr}>${esc(label)}</text>`;
        }
      });
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(lanes.map(tr).join(' · '))}">${s}</svg>`;
    },
    // 2x2 quadrant: axes labels + items [{t,x:0..1,y:0..1,c}]
    quad(xl, yl, items, qlabels) {
      xl = tr(xl); yl = tr(yl); qlabels = (qlabels || []).map((q) => (q ? tr(q) : q)); items = items.map((it) => Object.assign({}, it, { t: tr(it.t) }));
      const W = 1000, Hh = 520, L = 90, T = 20, R = W - 30, B = Hh - 60;
      let s = `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" class="box" style="fill-opacity:.4"/>`;
      s += `<line x1="${(L + R) / 2}" y1="${T}" x2="${(L + R) / 2}" y2="${B}" class="ln dash"/><line x1="${L}" y1="${(T + B) / 2}" x2="${R}" y2="${(T + B) / 2}" class="ln dash"/>`;
      s += `<text x="${(L + R) / 2}" y="${Hh - 20}" class="m" text-anchor="middle"${dirAttr}>${esc(xl)} →</text>`;
      s += `<text x="30" y="${(T + B) / 2}" class="m" text-anchor="middle"${dirAttr} transform="rotate(-90 30 ${(T + B) / 2})">${esc(yl)} →</text>`;
      (qlabels || []).forEach((q, i) => {
        const qx = i % 2 ? R - 14 : L + 14, qy = i < 2 ? T + 24 : B - 14;
        s += `<text x="${qx}" y="${qy}" class="m" text-anchor="${ta(i % 2 ? 'end' : 'start')}"${dirAttr}>${esc(q)}</text>`;
      });
      items.forEach((it) => {
        const x = L + it.x * (R - L), y = B - it.y * (B - T);
        s += `<circle cx="${x}" cy="${y}" r="7" class="${it.c === 'tl' ? 'dot-tl' : 'dot-acc'}"/>`;
        s += `<text x="${x + 12}" y="${y}" class="s" style="font-weight:600;fill:var(--ink)" text-anchor="${ta('start')}"${dirAttr} dominant-baseline="middle">${esc(it.t)}</text>`;
      });
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(xl + ' vs ' + yl)}">${s}</svg>`;
    },
    raw: (vb, inner, label) => `<svg viewBox="${vb}" role="img" aria-label="${esc(label || '')}">${inner}</svg>`,
    text, box, arrowDefs, nid, ta, dirAttr,
  });
})();
