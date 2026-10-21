/* Core namespace, HTML helpers (H) and diagram generators (D).
   Content files call ACADEMY.module({...}) and use H/D to keep lessons short and consistent. */
(function () {
  const A = (window.ACADEMY = window.ACADEMY || { modules: [], widgets: {}, glossary: [], pages: {} });
  A.module = (m) => A.modules.push(m);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  A.esc = esc;

  // Store wrapper: progress lives in the viewer's browser only, and the app must work without it.
  A.store = {
    get(k, d) { try { const v = localStorage.getItem('aaa:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('aaa:' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };

  // ---------- HTML helpers ----------
  const H = (A.H = {
    lead: (t) => `<p class="lead">${t}</p>`,
    p: (t) => `<p>${t}</p>`,
    prose: (...ps) => `<div class="prose">${ps.map((p) => (p.startsWith('<') ? p : `<p>${p}</p>`)).join('')}</div>`,
    list: (items) => `<ul class="list">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`,
    steps: (items) => `<ol class="steps">${items.map((i) => (Array.isArray(i) ? `<li><b>${i[0]}</b>${i[1] ? `<span>${i[1]}</span>` : ''}</li>` : `<li><b>${i}</b></li>`)).join('')}</ol>`,
    cards: (items, cols) =>
      `<div class="cards ${cols ? 'c' + cols : ''}">${items
        .map(([t, b, tag]) => `<div class="card">${tag ? `<span class="tag">${tag}</span>` : ''}<h4>${t}</h4>${b ? `<div>${b}</div>` : ''}</div>`)
        .join('')}</div>`,
    note: (type, html, label) => {
      const L = { tip: 'Tip', warn: 'Watch out', crit: 'Danger', it: 'In our IT world', key: 'Key idea' };
      return `<div class="callout ${type}"><span class="label">${label || L[type] || 'Note'}</span><div>${html}</div></div>`;
    },
    code: (text, lang, title) =>
      `<div class="code" data-lang="${lang || 'bash'}"><div class="code-h"><span class="t">${esc(title || lang || 'bash')}</span><button type="button" class="copy">Copy</button></div><pre><code>${esc(text.replace(/^\n/, '').replace(/\s+$/, ''))}</code></pre></div>`,
    table: (head, rows) =>
      `<div class="tbl-wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`,
    split: (l, r, cls) => `<div class="split ${cls || ''}"><div class="prose-col">${l}</div><div>${r}</div></div>`,
    fig: (svg, cap) => `<figure class="fig"><div class="fig-scroll">${svg}</div>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`,
    widget: (name, opts) => `<div class="widget" data-widget="${name}" data-opts="${esc(JSON.stringify(opts || {}))}"></div>`,
    quote: (t, who) => `<div class="quote">${t}${who ? `<div class="label" style="margin-top:6px;font-style:normal">${who}</div>` : ''}</div>`,
    chips: (items) => `<div class="w-row">${items.map((i) => `<span class="chip">${i}</span>`).join('')}</div>`,
    stack: (...parts) => parts.join(''),
  });

  // ---------- SVG diagram generators ----------
  const lines = (txt) => String(txt).split('\n');
  function text(x, y, txt, cls, anchor, lh) {
    const ls = lines(txt);
    lh = lh || 19;
    const y0 = y - ((ls.length - 1) * lh) / 2;
    return `<text x="${x}" y="${y0}" class="${cls}" text-anchor="${anchor || 'middle'}" dominant-baseline="middle">${ls
      .map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`)
      .join('')}</text>`;
  }
  const norm = (it) => (typeof it === 'string' ? { t: it } : it);
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
      s += text(x + w / 2, y + h / 2 - 11, it.t, inv ? 't-inv' : 't');
      s += text(x + w / 2, y + h / 2 + 14 + (lines(it.t).length - 1) * 9, it.s, 's', 'middle', 16);
    } else s += text(x + w / 2, y + h / 2, it.t, inv ? 't-inv' : 't');
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
      items.forEach((it, i) => {
        const x = 20 + i * (w + gap);
        s += box(x, top, w, h, it);
        if (i < n - 1) s += `<line x1="${x + w + 3}" y1="${top + h / 2}" x2="${x + w + gap - 3}" y2="${top + h / 2}" class="${opts.anim ? 'ln-acc anim' : 'ln'}" marker-end="url(#${id}${opts.anim ? 'a' : ''})"/>`;
      });
      let H2 = top + h + 20;
      if (opts.loop) {
        const y = top + h + 18, x1 = 20 + (n - 1) * (w + gap) + w / 2, x0 = 20 + w / 2;
        s += `<path d="M${x1},${top + h + 2} L${x1},${y + 20} L${x0},${y + 20} L${x0},${top + h + 6}" class="ln-acc dash" marker-end="url(#${id}a)"/>`;
        s += `<rect x="${W / 2 - 150}" y="${y + 8}" width="300" height="24" rx="12" class="box"/>` + text(W / 2, y + 20, opts.loop, 'm');
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
        else s += `<text x="${x + 16}" y="${y + 22}" class="t" style="font-size:15px">${esc(it.t)}</text>` + (it.s ? `<text x="${x + 16 + it.t.length * 8.6 + 14}" y="${y + 22}" class="s">${esc(it.s)}</text>` : '');
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
        s += `<text x="44" y="${y + h / 2}" class="${it.c === 'ink' ? 't-inv' : 't'}" dominant-baseline="middle">${esc(it.t)}</text>`;
        if (it.s) s += `<text x="${W - 44}" y="${y + h / 2}" class="s" text-anchor="end" dominant-baseline="middle">${esc(it.s)}</text>`;
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
      s += text(cx, cy - (c.s ? 9 : 0), c.t, c.c === 'acc' ? 't' : 't-inv') + (c.s ? text(cx, cy + 16, c.s, c.c === 'acc' ? 's' : 'm') : '');
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
        const x = 20 + i * (w + gap);
        s += `<rect x="${x}" y="10" width="${w}" height="${Hh - 20}" rx="10" class="box" style="fill-opacity:.5"/>`;
        s += `<rect x="${x}" y="10" width="${w}" height="${hh}" rx="10" class="${boxCls(col.c || 'ink')}"/>`;
        s += text(x + w / 2, 10 + hh / 2, col.h, (col.c || 'ink') === 'ink' ? 't-inv' : 't');
        col.items.forEach((it, j) => {
          const y = 20 + hh + j * (bh + 8);
          s += `<rect x="${x + 10}" y="${y}" width="${w - 20}" height="${bh}" rx="6" class="${boxCls(norm(it).c)}"/>`;
          s += text(x + w / 2, y + bh / 2, norm(it).t, 's');
        });
      });
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(cols.map((c) => c.h).join(', '))}">${s}</svg>`;
    },
    // Swimlane sequence: lanes:[names], msgs:[[from,to,label,cls]]
    seq(lanes, msgs, opts) {
      opts = opts || {};
      const W = 1000, n = lanes.length, lw = (W - 40) / n, top = 64, step = opts.step || 46;
      const Hh = top + msgs.length * step + 24;
      const id = nid();
      let s = arrowDefs(id);
      lanes.forEach((l, i) => {
        const x = 20 + lw * i + lw / 2;
        s += `<rect x="${x - lw / 2 + 10}" y="8" width="${lw - 20}" height="40" rx="8" class="${i === (opts.focus ?? -1) ? 'box-acc' : 'box'}"/>` + text(x, 28, l, 't');
        s += `<line x1="${x}" y1="48" x2="${x}" y2="${Hh - 8}" class="ln dash"/>`;
      });
      msgs.forEach(([f, t, label, cls], j) => {
        const y = top + j * step + 18, x1 = 20 + lw * f + lw / 2, x2 = 20 + lw * t + lw / 2;
        const acc = cls === 'acc';
        if (f === t) {
          s += `<path d="M${x1},${y - 8} h40 v16 h-36" class="${acc ? 'ln-acc' : 'ln'}" marker-end="url(#${id}${acc ? 'a' : ''})"/>`;
          s += `<text x="${x1 + 48}" y="${y}" class="s" dominant-baseline="middle">${esc(label)}</text>`;
        } else {
          s += `<line x1="${x1}" y1="${y}" x2="${x2 + (x2 > x1 ? -4 : 4)}" y2="${y}" class="${acc ? 'ln-acc' : 'ln'} ${cls === 'dash' ? 'dash' : ''}" marker-end="url(#${id}${acc ? 'a' : ''})"/>`;
          s += `<text x="${(x1 + x2) / 2}" y="${y - 9}" class="s" text-anchor="middle">${esc(label)}</text>`;
        }
      });
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc('Sequence: ' + lanes.join(', '))}">${s}</svg>`;
    },
    // 2x2 quadrant: axes labels + items [{t,x:0..1,y:0..1,c}]
    quad(xl, yl, items, qlabels) {
      const W = 1000, Hh = 520, L = 90, T = 20, R = W - 30, B = Hh - 60;
      let s = `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" class="box" style="fill-opacity:.4"/>`;
      s += `<line x1="${(L + R) / 2}" y1="${T}" x2="${(L + R) / 2}" y2="${B}" class="ln dash"/><line x1="${L}" y1="${(T + B) / 2}" x2="${R}" y2="${(T + B) / 2}" class="ln dash"/>`;
      s += `<text x="${(L + R) / 2}" y="${Hh - 20}" class="m" text-anchor="middle">${esc(xl)} →</text>`;
      s += `<text x="30" y="${(T + B) / 2}" class="m" text-anchor="middle" transform="rotate(-90 30 ${(T + B) / 2})">${esc(yl)} →</text>`;
      (qlabels || []).forEach((q, i) => {
        const qx = i % 2 ? R - 14 : L + 14, qy = i < 2 ? T + 24 : B - 14;
        s += `<text x="${qx}" y="${qy}" class="m" text-anchor="${i % 2 ? 'end' : 'start'}">${esc(q)}</text>`;
      });
      items.forEach((it) => {
        const x = L + it.x * (R - L), y = B - it.y * (B - T);
        s += `<circle cx="${x}" cy="${y}" r="7" class="${it.c === 'tl' ? 'dot-tl' : 'dot-acc'}"/>`;
        s += `<text x="${x + 12}" y="${y}" class="s" style="font-weight:600;fill:var(--ink)" dominant-baseline="middle">${esc(it.t)}</text>`;
      });
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(xl + ' vs ' + yl)}">${s}</svg>`;
    },
    raw: (vb, inner, label) => `<svg viewBox="${vb}" role="img" aria-label="${esc(label || '')}">${inner}</svg>`,
    text, box, arrowDefs, nid,
  });
})();
