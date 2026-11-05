/* Scenes: the illustrated, animated pieces of the page.
   Each builder returns markup; mount functions start its animation.
   An animation only runs while its scene is on screen. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f = (n) => +n.toFixed(2);
  const circ = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
  const rng = (seed) => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const YEL = ' style="--m1:#F2B318;--m2:#FAD04A;--m3:#C98A06"';

  /* ---------------- animation loop (only for visible scenes) ---------------- */
  const items = [];
  let raf = 0;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    es.forEach((e) => { items.forEach((it) => { if (it.el === e.target) it.on = e.isIntersecting; }); });
    kick();
  }, { rootMargin: '80px' }) : null;
  function animate(el, fn) {
    const it = { el, fn, on: !io, t0: performance.now() };
    items.push(it);
    if (io) io.observe(el);
    fn(0, 0);
    kick();
    return it;
  }
  // The scenes are decoration, so they move at about 30 frames a second: half the work of the
  // screen's full rate, which leaves the phone free to keep the scroll itself smooth.
  // The page's scroll and size are read once at the start of each frame, before anything is
  // drawn, so no scene has to measure the page while others are changing it.
  const STEP = 1000 / 30 - 4;
  const view = { y: 0, w: 0, h: 0 };
  function kick() {
    if (reduce || raf) return;
    let last = 0;
    const loop = (now) => {
      raf = 0;
      if (!items.some((it) => it.on)) return;
      raf = requestAnimationFrame(loop);
      if (last && now - last < STEP) return;
      const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 30;
      last = now;
      view.y = scrollY; view.w = innerWidth; view.h = innerHeight;
      items.forEach((it) => { if (it.on) it.fn((now - it.t0) / 1000, dt); });
    };
    raf = requestAnimationFrame(loop);
  }

  // A canvas's size, kept up to date by the browser instead of measured on every frame.
  // Soft drifting things don't need the screen's full sharpness: 1.5x is plenty, and it
  // keeps the canvas small enough for a phone to redraw cheaply.
  function canvasBox(canvas, ctx) {
    const box = { width: 0, height: 0 };
    const set = (w, h) => {
      const d = Math.min(1.5, devicePixelRatio || 1), W = Math.round(w * d), H = Math.round(h * d);
      box.width = w; box.height = h;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; ctx.setTransform(d, 0, 0, d, 0, 0); }
    };
    const r = canvas.getBoundingClientRect();
    set(r.width, r.height);
    if ('ResizeObserver' in window) new ResizeObserver((es) => { const c = es[es.length - 1].contentRect; set(c.width, c.height); }).observe(canvas);
    else addEventListener('resize', () => { const q = canvas.getBoundingClientRect(); set(q.width, q.height); });
    return box;
  }

  /* ---------------- toran ---------------- */
  function toran(el, opts = {}) {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h || el._w === w) return;
    el._w = w;
    const H = 100, W = w / (h / H), unit = 40;
    const n = Math.ceil(W / unit) + 1, off = (n * unit - W) / 2;
    const R = rng(11);
    let items = '';
    for (let i = 0; i < n; i++) {
      const x = f(i * unit + unit / 2 - off);
      const anim = `--dur:${(4 + R() * 3).toFixed(2)}s;--delay:${(-R() * 6).toFixed(2)}s;--a:${(1.5 + R() * 3).toFixed(1)}deg`;
      let g;
      if (i % 2 === 0) {
        const len = i % 4 === 0 ? 4 : 3;
        g = `<path d="M0 6V${14 + len * 16}" stroke="#4A220E" stroke-width="1.1"/>`;
        for (let k = 0; k < len; k++) g += `<use href="#marigold" x="-9" y="${9 + k * 16}" width="18" height="18"${(k + i / 2) % 2 ? YEL : ''}/>`;
        g += `<use href="#leaf" x="-5" y="${12 + len * 16}" width="10" height="22" style="--leaf:#3E6B2A"/>`;
      } else {
        g = `<use href="#leaf" x="-11" y="3" width="22" height="72" style="--leaf:${R() > .5 ? '#3E6B2A' : '#55843A'}"/>`;
      }
      items += `<g transform="translate(${x} 0)"><g class="sway" style="${anim}">${g}</g></g>`;
    }
    el.innerHTML = `<svg viewBox="0 0 ${f(W)} ${H}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${items}` +
      `<path d="M0 6H${f(W)}" stroke="#B8281A" stroke-width="7"/><path d="M0 6H${f(W)}" stroke="#EDB51C" stroke-width="7" stroke-dasharray="4 7"/></svg>`;
  }

  /* ---------------- distant palace with wedding lights ---------------- */
  function palace(seed = 1559, opts = {}) {
    const R = rng(seed);
    const W = 3000, HZ = 220, SIL = opts.sil || '#0E1433', LIT = '#FFC65C';
    let body = '', lit = '', lights = '';
    const rect = (x, y, w, h) => { body += `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`; };
    const win = (x, y, w, h) => { const r = w / 2; return `M${f(x)} ${f(y + h)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h)}Z`; };
    const windows = (x0, x1, y0, y1, p) => {
      const cols = Math.floor((x1 - x0 - 6) / 16), sx = x0 + (x1 - x0 - (cols - 1) * 16 - 5) / 2;
      for (let y = y0 + 7; y + 10 <= y1 - 3; y += 22) for (let c = 0; c < cols; c++) if (R() < p) lit += win(sx + c * 16, y, 5, 10);
    };
    const dome = (cx, y, w, h) => {
      body += `M${f(cx - w / 2)} ${f(y)}C${f(cx - w / 2)} ${f(y - h * 1.3)} ${f(cx + w / 2)} ${f(y - h * 1.3)} ${f(cx + w / 2)} ${f(y)}Z`;
      rect(cx - .9, y - h * 1.02 - 7, 1.8, 8); body += circ(cx, y - h * 1.02 - 8, 2.2);
    };
    const chhatri = (cx, y, w, ph) => {
      rect(cx - w / 2 - 3, y - 4, w + 6, 4);
      [-w / 2, -w / 6, w / 6 - 2.6, w / 2 - 2.6].forEach((dx) => rect(cx + dx, y - 4 - ph, 2.6, ph));
      rect(cx - w / 2 - 2, y - 7 - ph, w + 4, 3); dome(cx, y - 7 - ph, w, w * .5);
    };
    for (let x = 0; x < W;) {
      const w = 44 + R() * 92;
      if (x + w > 1110 && x < 1890) { x = 1890; continue; }
      const h = 26 + R() * 70, top = HZ - h;
      rect(x, top, w, h); windows(x, x + w, top, HZ, .22);
      const roof = R();
      if (roof < .26) chhatri(x + w / 2, top, 16 + R() * 8, 10 + R() * 6);
      else if (roof < .46) dome(x + w / 2, top, Math.min(34, w * .4), 12);
      if (R() < .35) lights += `M${f(x)} ${f(top + 2)}H${f(x + w)}`;
      x += w + R() * 10;
    }
    const P0 = 1130, P1 = 1870;
    rect(P0, HZ - 66, P1 - P0, 66); windows(P0, P1, HZ - 66, HZ, .3);
    rect(P0 + 40, HZ - 110, P1 - P0 - 80, 44); windows(P0 + 40, P1 - 40, HZ - 110, HZ - 66, .34);
    rect(1370, HZ - 148, 260, 38); windows(1370, 1630, HZ - 148, HZ - 110, .5);
    rect(1338, HZ - 166, 30, 56); rect(1632, HZ - 166, 30, 56);
    dome(1353, HZ - 166, 34, 17); dome(1647, HZ - 166, 34, 17); rect(1484, HZ - 162, 32, 14); dome(1500, HZ - 162, 30, 14);
    [P0 + 70, P0 + 140, P1 - 140, P1 - 70].forEach((cx) => chhatri(cx, HZ - 110, 22, 14));
    lights += `M${P0} ${HZ - 64}H${P1}M${P0 + 40} ${HZ - 108}H${P1 - 40}M1370 ${HZ - 146}H1630`;
    lights += `M1353 ${HZ - 186}Q1426 ${HZ - 140} 1500 ${HZ - 182}Q1574 ${HZ - 140} 1647 ${HZ - 186}`;
    return `<path d="${body}" fill="${SIL}"/><path d="${lit}" fill="${LIT}" opacity=".85"/>` +
      `<path class="twinkle-lights" d="${lights}" fill="none" stroke="#FFE2A0" stroke-width="2.2" stroke-dasharray="0 6.5" stroke-linecap="round"/>`;
  }

  /* ---------------- fairy lights (string of bulbs along a sag) ---------------- */
  function fairy(x1, y1, x2, y2, sag, n, cls = 'bulbs') {
    let d = `M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.max(y1, y2) + sag * 2} ${x2} ${y2}`;
    let s = `<path d="${d}" fill="none" stroke="#2A1E16" stroke-width="1" opacity=".6"/>`;
    // every third bulb belongs to the same set; the three sets blink in turn
    const sets = ['', '', ''];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * (x1 + x2) / 2 + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag * 2) + t * t * y2;
      sets[i % 3] += `<circle cx="${f(x)}" cy="${f(y + 3)}" r="2.6"/>`;
    }
    return s + `<g class="${cls}">` + sets.map((b) => `<g>${b}</g>`).join('') + '</g>';
  }

  /* ---------------- fireworks on a canvas ---------------- */
  function fireworks(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parts = [];
    let next = .4;
    const cols = opts.colors || ['#FFD36B', '#FF8DB6', '#FFFFFF', '#9BE36B', '#FFB443', '#8FD3FF'];
    const r = canvasBox(canvas, ctx);
    const burst = (w, h) => {
      const x = w * (.15 + Math.random() * .7), y = h * (.1 + Math.random() * (opts.maxY || .35));
      const c = cols[(Math.random() * cols.length) | 0], n = 46 + (Math.random() * 30 | 0), sp = 1.4 + Math.random() * 1.2;
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2, v = sp * (.7 + Math.random() * .5);
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c, r: 1.5 + Math.random() });
      }
    };
    animate(canvas, (t, dt) => {
      ctx.clearRect(0, 0, r.width, r.height);
      next -= dt;
      if (next <= 0) { burst(r.width, r.height); next = (opts.every || 1.6) * (.6 + Math.random() * .8); }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt; p.vy += .025 * 60 * dt; p.vx *= .985; p.life -= dt * .8;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ---------------- little shapes for the falling-things canvases ---------------- */
  function drawStar(ctx, r, c) {
    ctx.fillStyle = c; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function drawEnvelope(ctx, w, body, flap, seal) {
    const h = w * .66;
    ctx.fillStyle = body; ctx.strokeStyle = 'rgba(70, 40, 90, .35)'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); ctx.stroke();
    ctx.fillStyle = flap; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, h * .12); ctx.lineTo(w / 2, -h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(70, 40, 90, .22)'; ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w * .1, 0); ctx.moveTo(w / 2, h / 2); ctx.lineTo(w * .1, 0); ctx.stroke();
    ctx.fillStyle = seal; ctx.beginPath(); ctx.arc(0, h * .08, w * .1, 0, 6.283); ctx.fill();
  }

  /* ---------------- stars falling softly through the night sky (hero) ---------------- */
  function starsLoop(canvas, n = 30) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cols = ['#FFF6D6', '#FFE7A8', '#F6D58A', '#FFFFFF', '#E9C26A'];
    let ps = [], shoot = null, nextShoot = 2.5;
    const r = canvasBox(canvas, ctx);
    animate(canvas, (t, dt) => {
      if (!r.width) return;
      if (!ps.length) ps = Array.from({ length: n }, () => ({ x: Math.random() * r.width, y: Math.random() * r.height, s: 2.2 + Math.random() * 3.6, v: 8 + Math.random() * 16, a: Math.random() * 6, w: Math.random() * 6, tw: 1.5 + Math.random() * 2.5, c: cols[(Math.random() * cols.length) | 0] }));
      ctx.clearRect(0, 0, r.width, r.height);
      ps.forEach((p) => {
        p.y += p.v * dt; p.w += dt; p.x += Math.sin(p.w) * 6 * dt; p.a += dt * .6;
        if (p.y > r.height + 10) { p.y = -10; p.x = Math.random() * r.width; }
        const glow = .55 + .45 * Math.sin(t * p.tw + p.w * 3);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.globalAlpha = .18 * glow; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(0, 0, p.s * 2.2, 0, 6.283); ctx.fill();
        ctx.globalAlpha = .55 + .45 * glow; drawStar(ctx, p.s, p.c); ctx.restore();
      });
      // now and then, a shooting star across the top of the sky
      if (!shoot && t > nextShoot) { shoot = { x: Math.random() * r.width * .7, y: Math.random() * r.height * .3, life: 0 }; nextShoot = t + 5 + Math.random() * 6; }
      if (shoot) {
        shoot.life += dt;
        const k = shoot.life / .9, x = shoot.x + k * 260, y = shoot.y + k * 90;
        const g = ctx.createLinearGradient(x - 90, y - 31, x, y);
        g.addColorStop(0, 'rgba(255, 246, 214, 0)'); g.addColorStop(1, `rgba(255, 246, 214, ${f(Math.max(0, 1 - k))})`);
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 90, y - 31); ctx.lineTo(x, y); ctx.stroke();
        if (k >= 1) shoot = null;
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ---------------- little envelopes drifting down (the invitation) ---------------- */
  function envelopesLoop(canvas, n = 14) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const kinds = [['#FFFDF8', '#E8DDF4', '#B8281A'], ['#EADCF7', '#D4C0EC', '#C9973A'], ['#FCE8EF', '#F3CADA', '#B8281A'], ['#FFF4D6', '#F2DFA8', '#8E44AD']];
    let ps = [];
    const r = canvasBox(canvas, ctx);
    animate(canvas, (t, dt) => {
      if (!r.width) return;
      if (!ps.length) ps = Array.from({ length: n }, () => ({ x: Math.random() * r.width, y: Math.random() * r.height, s: 20 + Math.random() * 10, v: 16 + Math.random() * 20, a: (Math.random() - .5) * .8, w: Math.random() * 6, k: kinds[(Math.random() * kinds.length) | 0] }));
      ctx.clearRect(0, 0, r.width, r.height);
      ps.forEach((p) => {
        p.y += p.v * dt; p.w += dt * 1.3; p.x += Math.sin(p.w) * 14 * dt;
        if (p.y > r.height + 20) { p.y = -20; p.x = Math.random() * r.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a + Math.sin(p.w) * .35); ctx.scale(1, .75 + .25 * Math.abs(Math.cos(p.w)));
        ctx.globalAlpha = view.w < 640 ? .5 : .85; drawEnvelope(ctx, p.s, p.k[0], p.k[1], p.k[2]); ctx.restore();
      });
      ctx.globalAlpha = 1;
    });
  }

  /* ---------------- petals drifting on a canvas (hero) ---------------- */
  function petalsLoop(canvas, n = 28) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cols = ['#E8731A', '#F2B318', '#F6A32B', '#C2301C', '#E0337A'];
    let ps = [];
    const r = canvasBox(canvas, ctx);
    animate(canvas, (t, dt) => {
      if (!r.width) return;
      if (!ps.length) ps = Array.from({ length: n }, () => ({ x: Math.random() * r.width, y: Math.random() * r.height, s: 3 + Math.random() * 5, v: 12 + Math.random() * 22, a: Math.random() * 6, w: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] }));
      ctx.clearRect(0, 0, r.width, r.height);
      ps.forEach((p) => {
        p.y += p.v * dt; p.w += dt * 1.6; p.x += Math.sin(p.w) * 12 * dt; p.a += dt;
        if (p.y > r.height + 10) { p.y = -10; p.x = Math.random() * r.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, .5 + .5 * Math.abs(Math.sin(p.w)));
        ctx.globalAlpha = .85; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .6, 0, 0, 6.283); ctx.fill(); ctx.restore();
      });
    });
  }

  /* ---------------- burst of petals over the whole page ---------------- */
  let showering = false;
  function shower(n = 120, kind = 'petals') {
    if (reduce || showering) return;
    const cv = document.getElementById('petals');
    const ctx = cv && cv.getContext('2d');
    if (!ctx) return;
    showering = true;
    const W = innerWidth, H = innerHeight, d = Math.min(2, devicePixelRatio || 1);
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    cv.classList.add('is-on');
    const cols = kind === 'stars' ? ['#FFF6D6', '#FFE7A8', '#F6D58A', '#FFFFFF', '#E9C26A'] : ['#E8731A', '#F2B318', '#F6A32B', '#FAD04A', '#C2301C', '#B3123A', '#E0337A'];
    const count = W < 640 ? Math.round(n * .55) : n;
    const ps = Array.from({ length: count }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * .9, vy: 1.5 + Math.random() * 2.4, vx: -.5 + Math.random(), r: 4 + Math.random() * 6, a: Math.random() * 6.28, va: -.08 + Math.random() * .16, sw: Math.random() * 6.28, c: cols[(Math.random() * cols.length) | 0] }));
    const t0 = performance.now();
    const frame = (t) => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of ps) {
        p.sw += .035; p.x += p.vx + Math.sin(p.sw) * .9; p.y += p.vy; p.a += p.va;
        if (p.y > H + 20) continue;
        alive++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); if (kind !== 'stars') ctx.scale(1, .45 + .55 * Math.abs(Math.sin(p.sw * 1.3)));
        if (kind === 'stars') { ctx.globalAlpha = .9; drawStar(ctx, p.r * .8, p.c); ctx.globalAlpha = 1; } else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .62, 0, 0, 6.283); ctx.fill(); }
        ctx.restore();
      }
      if (alive && t - t0 < 10000) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, W, H); cv.classList.remove('is-on'); showering = false; }
    };
    requestAnimationFrame(frame);
  }

  /* ---------------- paper-craft artwork (images from config.art) ----------------
     When an image is set for a slot, it replaces the built-in drawing and moves
     like a paper puppet: it sways from its feet, breathes, hops, and swaps
     between poses. */
  let ART = {};
  const setArt = (a) => { ART = a || {}; };
  const art = (k, i) => { const v = ART[k]; return (Array.isArray(v) ? v[i || 0] : v) || ''; };
  const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  // a cut-out standing on 0,0, fitted into a w×h box (bottom-centred by default)
  const cut = (src, w, h, cls = '', align = 'xMidYMax') =>
    `<image class="cut ${cls}" href="${attr(src)}" x="${f(-w / 2)}" y="${-h}" width="${w}" height="${h}" preserveAspectRatio="${align} meet" filter="url(#paper-lift)"/>`;
  // an image's natural size, and where it lands inside its box
  const natural = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res([im.naturalWidth, im.naturalHeight]); im.onerror = () => res(null); im.src = src; });
  const fitRect = (bx, by, bw, bh, nw, nh, ax = .5, ay = 1) => { const k = Math.min(bw / nw, bh / nh), w = nw * k, h = nh * k; return { x: bx + (bw - w) * ax, y: by + (bh - h) * ay, w, h }; };
  // show one pose of a cut-out and hide the rest
  const showPose = (imgs, i) => imgs.forEach((im, j) => im.setAttribute('opacity', j === i % imgs.length ? '1' : '0'));

  /* ---------------- people in a scene ---------------- */
  const P = window.WIPeople, HD = window.WIHand;
  const place = (svg, x, y, s = 1, cls = '') => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;
  const ROSE = ' style="--m1:#C8102E;--m2:#E8354A;--m3:#7A0A16"';
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); };
  // where a rigged arm's hand is, for a pose (figure coordinates)
  function gripAt(side, a, male) {
    const sx = (male ? 24 : 22) * (side === 'L' ? -1 : 1), sy = male ? -222 : -220, L1 = male ? 40 : 38, L2 = male ? 36 : 34;
    const d = (deg) => [Math.sin(deg * Math.PI / 180), Math.cos(deg * Math.PI / 180)];
    const u = d(a[0]), w = d(a[0] + a[1]);
    return [sx + u[0] * L1 + w[0] * (L2 + 9), sy + u[1] * L1 + w[1] * (L2 + 9)];
  }
  // a varmala: a thick loop of marigolds and roses hanging between two hands
  function varmala(a, b, drop, size = 10.5) {
    const m = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + drop], spread = drop * .42;
    const halves = [[a, [a[0] - spread, a[1] + drop * .6], [m[0] - spread * .9, m[1]], m], [m, [m[0] + spread * .9, m[1]], [b[0] + spread, b[1] + drop * .6], b]];
    let s = '';
    let i = 0;
    halves.forEach((hv) => {
      for (let k = 0; k <= 11; k++) {
        const [x, y] = bez(hv[0], hv[1], hv[2], hv[3], k / 11);
        const st = i % 4 === 3 ? ROSE : i % 2 ? YEL : '';
        s += `<use href="#marigold" x="${f(x - size / 2)}" y="${f(y - size / 2)}" width="${size}" height="${size}"${st}/>`;
        i++;
      }
    });
    s += `<path d="M${f(m[0])} ${f(m[1] + 4)}v14" stroke="#B8281A" stroke-width="2"/><use href="#marigold" x="${f(m[0] - 5)}" y="${f(m[1] + 14)}" width="10" height="10"${ROSE}/>`;
    return `<g class="varmala">${s}</g>`;
  }
  // a guest's arm reaching in from the left, fingertips at 0,0 (for haldi)
  function reachArm(id, sleeve, skin, bangle) {
    const sh = (c, k) => P.shade(c, k);
    let s = `<defs><linearGradient id="${id}-sl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${sh(sleeve, .25)}"/><stop offset=".45" stop-color="${sleeve}"/><stop offset="1" stop-color="${sh(sleeve, -.4)}"/></linearGradient>` +
      `<linearGradient id="${id}-sk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${sh(skin, .22)}"/><stop offset=".5" stop-color="${skin}"/><stop offset="1" stop-color="${sh(skin, -.3)}"/></linearGradient>` +
      `<radialGradient id="${id}-hy" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFE27A"/><stop offset=".6" stop-color="#F2B318"/><stop offset="1" stop-color="#C98A06"/></radialGradient></defs>`;
    // sleeve and cuff
    s += `<path d="M-340 -19L-150 -15C-146 -8 -146 8 -150 15L-340 19Z" fill="url(#${id}-sl)"/>`;
    s += `<path d="M-160 -15.4C-156 -8 -156 8 -160 15.4L-150 15C-146 8 -146 -8 -150 -15Z" fill="#F2C76A"/><path d="M-157 -13V13" stroke="#B8281A" stroke-width="1.4" stroke-dasharray="0 3.4" stroke-linecap="round"/>`;
    // forearm
    s += `<path d="M-150 -13C-120 -12.4 -90 -11.6 -62 -10.4L-62 10.4C-90 11.6 -120 12.4 -150 13Z" fill="url(#${id}-sk)"/>`;
    // bangles (rings round the wrist)
    [-84, -79, -74, -69].forEach((x, i) => { s += `<ellipse cx="${x}" cy="0" rx="3" ry="12.6" fill="none" stroke="${i % 2 ? '#F2C76A' : bangle}" stroke-width="3.4"/>`; });
    // the hand: back of the hand, fingers together, thumb tucked below
    s += `<path d="M-46 4C-38 6.4 -30 9.4 -24 12C-19.6 13.8 -20.4 17.6 -25 17.4C-32 17 -40 14.6 -50 11Z" fill="url(#${id}-sk)"/>`;
    s += `<path d="M-64 -10.6C-50 -12.8 -38 -13.2 -28 -11.8C-18 -10.6 -8 -8.6 -2.6 -6.2C1.2 -4.6 1.6 -.6 -1 1.2C-8 3.6 -18 4.2 -26 4.8C-31 6.8 -36 9.2 -42 10.8C-50 12.6 -57 12.4 -64 10.6Z" fill="url(#${id}-sk)"/>`;
    s += `<path d="M-28 -6.4C-19 -5.6 -11 -4.2 -4.6 -2.4M-28 -1.6C-20 -1.2 -13 -.2 -7 1" fill="none" stroke="${sh(skin, -.35)}" stroke-width=".9" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M-56 -9C-46 -10.6 -36 -10.8 -28 -9.6" fill="none" stroke="#fff" stroke-width="2" opacity=".2" stroke-linecap="round"/>`;
    s += `<ellipse cx="-4.4" cy="-3.6" rx="2.6" ry="1.5" fill="${sh(skin, .45)}" opacity=".8"/>`;
    // turmeric paste on the fingertips
    s += `<path d="M-14 -7.6C-8 -9 -1 -7.4 1.4 -3.4C3 0 0 3.6 -5 3.8C-10 4 -15 2.6 -16.4 -1C-17.4 -4 -16.6 -6.8 -14 -7.6Z" fill="url(#${id}-hy)" opacity=".95"/>`;
    s += `<circle cx="-9" cy="-3" r="1.2" fill="#FFF3B0" opacity=".8"/><circle cx="-4" cy="0" r=".9" fill="#C98A06" opacity=".7"/>`;
    return s;
  }

  // a small rangoli of petals for one of the couple to stand on
  function pedestal(who) {
    const c = who === 'bride' ? ['#C8235F', '#F2B318', '#2E9D5B'] : ['#E8792B', '#F2B318', '#1F6F8B'];
    let s = `<ellipse cx="0" cy="4" rx="120" ry="16" fill="${c[0]}" opacity=".16"/><ellipse cx="0" cy="4" rx="104" ry="12" fill="none" stroke="${c[1]}" stroke-width="2.4" stroke-dasharray="0 7" stroke-linecap="round"/>`;
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2, x = Math.cos(a) * 88, y = 4 + Math.sin(a) * 10;
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="7" ry="3.2" fill="${c[i % 3]}" opacity=".85"/>`;
    }
    return `<g class="pedestal">${s}</g>`;
  }

  /* ==========================================================
     HERO — the couple under a mandap, holding their varmalas
     ========================================================== */
  const HERO_POSE = { b: { armL: [5, 18], armR: [-5, -18] }, g: { armL: [-3, 26], armR: [3, -26] } };
  function hero() {
    let s = '';
    // ground and palace far away
    s += `<g transform="translate(-900 330) scale(1)" opacity=".75">${palace(1559, { sil: '#151B44' })}</g>`;
    s += `<rect x="-3000" y="548" width="7200" height="400" fill="#0B1029"/>`;
    s += `<defs><radialGradient id="hero-glow" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#FFC65C" stop-opacity=".42"/><stop offset="1" stop-color="#FFC65C" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="hero-pillar" x1="0" x2="1"><stop offset="0" stop-color="#3A1A0C"/><stop offset=".35" stop-color="#8A4A22"/><stop offset=".7" stop-color="#5A2A14"/><stop offset="1" stop-color="#2A1208"/></linearGradient>` +
      `<linearGradient id="hero-canopy" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9E2A1A"/><stop offset="1" stop-color="#5E120C"/></linearGradient></defs>`;
    s += `<ellipse cx="600" cy="420" rx="360" ry="260" fill="url(#hero-glow)"/>`;
    // stage
    s += `<path d="M180 600H1020L1060 640H140Z" fill="#3A1A10"/><path d="M180 600H1020" stroke="#E2B655" stroke-width="3"/>`;
    s += `<path d="M150 630H1050" stroke="#E2B655" stroke-width="3" stroke-dasharray="0 14" stroke-linecap="round"/>`;
    for (let x = 196; x < 1010; x += 22) s += `<use href="#marigold" x="${x - 9}" y="591" width="18" height="18"${(x / 22) % 2 < 1 ? YEL : ''}/>`;
    // pillars wrapped in marigolds
    [300, 900].forEach((x) => {
      s += `<rect x="${x - 14}" y="210" width="28" height="392" fill="url(#hero-pillar)"/><rect x="${x - 20}" y="580" width="40" height="22" fill="#6E3418"/><rect x="${x - 20}" y="204" width="40" height="14" fill="#6E3418"/>`;
      s += `<path d="M${x - 14} 210V602M${x + 14} 210V602" stroke="#E2B655" stroke-width="2"/>`;
      for (let y = 230; y < 580; y += 18) s += `<use href="#marigold" x="${x - 9}" y="${y}" width="18" height="18"${(y / 18) % 2 < 1 ? YEL : ''}/>`;
    });
    // canopy (cusped arch) with toran strings
    s += `<path d="M268 214C300 150 360 120 420 118C470 80 530 66 600 64C670 66 730 80 780 118C840 120 900 150 932 214Z" fill="url(#hero-canopy)"/>`;
    s += `<path d="M268 214C300 150 360 120 420 118C470 80 530 66 600 64C670 66 730 80 780 118C840 120 900 150 932 214" fill="none" stroke="#E2B655" stroke-width="4"/>`;
    s += `<path d="M300 206C330 160 380 136 428 134C476 100 536 88 600 86C664 88 724 100 772 134C820 136 870 160 900 206" fill="none" stroke="#E2B655" stroke-width="2" stroke-dasharray="0 9" stroke-linecap="round"/>`;
    s += `<path d="M600 64V30" stroke="#E2B655" stroke-width="3"/><path d="M590 34h20l-10 -22z" fill="#E2B655"/>`;
    let strands = '';
    const R = rng(5);
    for (let x = 290; x <= 910; x += 26) {
      const len = 3 + ((x / 26) % 3 | 0);
      let g = `<path d="M0 0V${len * 16}" stroke="#4A220E" stroke-width="1"/>`;
      for (let k = 0; k < len; k++) g += `<use href="#marigold" x="-8" y="${4 + k * 16}" width="16" height="16"${(k + x / 26) % 2 < 1 ? YEL : ''}/>`;
      strands += `<g transform="translate(${x} 212)"><g class="sway" style="--dur:${(4 + R() * 3).toFixed(1)}s;--delay:${(-R() * 4).toFixed(1)}s;--a:2deg">${g}</g></g>`;
    }
    s += strands;
    s += fairy(300, 236, 900, 236, 30, 28);
    // the couple, each holding a varmala
    const groom = P.man({ kind: 'groom', pose: HERO_POSE.g });
    const bride = P.bride({ pose: HERO_POSE.b });
    const gm = varmala(gripAt('L', HERO_POSE.g.armL, true), gripAt('R', HERO_POSE.g.armR, true), 74);
    const bm = varmala(gripAt('L', HERO_POSE.b.armL), gripAt('R', HERO_POSE.b.armR), 70);
    s += `<ellipse cx="600" cy="600" rx="200" ry="10" fill="#000" opacity=".35"/>`;
    if (art('coupleVarmala')) s += place(cut(art('coupleVarmala'), 460, 388), 600, 602, 1, 'hero-couple');
    else if (art('bride') && art('groom')) s += place(cut(art('groom'), 220, 392), 525, 602, 1, 'hero-groom') + place(cut(art('bride'), 220, 392), 675, 602, 1, 'hero-bride');
    else s += place(groom.svg + gm, 522, 600, 1.06, 'hero-groom') + place(bride.svg + bm, 680, 600, 1.06, 'hero-bride');
    // diyas along the front
    [210, 330, 870, 990].forEach((x, i) => { s += `<use href="#diya" x="${x - 22}" y="604" width="44" height="37" style="--fd:${-i * .4}s"/>`; });
    // kalash on either side
    [[214, 600], [986, 600]].forEach(([x, y]) => { s += `<g transform="translate(${x - 26} ${y - 66}) scale(.36)">${kalash()}</g>`; });
    return `<svg class="hero-scene" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax meet" aria-hidden="true" overflow="visible">${s}</svg>`;
  }

  function kalash() {
    return `<g transform="translate(80 70)">` +
      [-74, 74, -46, 46, -18, 18].map((a, i) => `<g transform="rotate(${a})"><use href="#leaf" x="-12" y="-86" width="24" height="86" transform="rotate(180 0 -43)" style="--leaf:${i < 2 ? '#2F5A22' : i < 4 ? '#4A7A30' : '#3E6B2A'}"/></g>`).join('') + `</g>` +
      `<ellipse cx="80" cy="50" rx="20" ry="24" fill="#6E3F1E" stroke="#1D1411" stroke-width="1.4"/>` +
      `<path d="M57 60C65 76 95 76 103 60L110 72C98 90 62 90 50 72Z" fill="#C2301C" stroke="#1D1411" stroke-width="1.4"/>` +
      `<ellipse cx="80" cy="86" rx="31" ry="7" fill="#E9B655" stroke="#1D1411" stroke-width="1.4"/>` +
      `<path d="M57 88L62 101H98L103 88Z" fill="#C88A2E" stroke="#1D1411" stroke-width="1.4"/>` +
      `<path d="M62 101C18 109 16 172 80 176C144 172 142 109 98 101Z" fill="url(#g-brass)" stroke="#1D1411" stroke-width="1.5"/>` +
      `<g transform="translate(80 140)"><circle r="4" fill="#EDB51C"/>${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${f(Math.cos(a * Math.PI / 180) * 8)}" cy="${f(Math.sin(a * Math.PI / 180) * 8)}" r="3.4" fill="#C2301C"/>`).join('')}</g>` +
      `<ellipse cx="80" cy="178" rx="22" ry="5" fill="#9C6420" stroke="#1D1411" stroke-width="1.3"/>`;
  }

  function mountHero(root) {
    const svg = root.querySelector('.hero-scene');
    if (!svg) {
      // the photo hero: a few gold sparkles and a gently swaying couple
      const cv = root.querySelector('.hero-petals');
      if (cv) starsLoop(cv, innerWidth < 640 ? 10 : 18);
      const pair = root.querySelector('.hero__couple');
      if (pair && !reduce) animate(pair, (t) => { pair.style.transform = `translateX(-50%) rotate(${f(Math.sin(t * .8) * .5)}deg) scaleY(${f(1 + Math.sin(t * 1.6) * .004)})`; });
      return;
    }
    const fit = () => {
      const r = svg.getBoundingClientRect();
      svg.setAttribute('preserveAspectRatio', r.width / r.height < 1200 / 640 ? 'xMidYMax slice' : 'xMidYMax meet');
    };
    fit(); addEventListener('resize', fit);
    const cv = root.querySelector('.hero-petals');
    if (cv) starsLoop(cv, innerWidth < 640 ? 18 : 34);
    // they breathe, blink, and every so often steal a glance at each other
    const pair = svg.querySelector('.hero-couple');
    if (pair) {
      const T0 = pair.getAttribute('transform');
      animate(svg, (t) => pair.setAttribute('transform', `${T0} rotate(${f(Math.sin(t * .8) * .5)}) scale(1 ${f(1 + Math.sin(t * 1.6) * .004)})`));
      return;
    }
    const g = svg.querySelector('.hero-groom'), b = svg.querySelector('.hero-bride');
    const gT = g.getAttribute('transform'), bT = b.getAttribute('transform');
    const gLife = P.alive(g, 1), bLife = P.alive(b, 4);
    animate(svg, (t) => {
      const glance = Math.sin(t * .42) > .6;
      g.setAttribute('transform', `${gT} rotate(${f(Math.sin(t * .9) * .5)})`);
      b.setAttribute('transform', `${bT} rotate(${f(Math.sin(t * .9 + 1) * .5)})`);
      gLife(t, glance ? { look: 1.5, tilt: 2 } : {});
      bLife(t, glance ? { look: -1.5, tilt: -4 } : { tilt: -1 });
    });
  }

  /* ==========================================================
     HALDI — the bride on a chowki in flower jewellery, and the
     family's hands coming in to put turmeric on her cheeks
     ========================================================== */
  function haldi() {
    let s = `<defs>
      <linearGradient id="hd-wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F7B733"/><stop offset=".7" stop-color="#F59E1E"/><stop offset="1" stop-color="#E07B12"/></linearGradient>
      <linearGradient id="hd-drape" x1="0" x2="1"><stop offset="0" stop-color="#E8792B"/><stop offset=".5" stop-color="#F4A13B"/><stop offset="1" stop-color="#D9661E"/></linearGradient>
      <linearGradient id="hd-pink" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F0609A"/><stop offset="1" stop-color="#C8235F"/></linearGradient>
      <linearGradient id="hd-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C47A3A"/><stop offset=".25" stop-color="#9A5424"/><stop offset="1" stop-color="#5A2A0E"/></linearGradient>
      <linearGradient id="hd-top" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E0A060"/><stop offset="1" stop-color="#A8622C"/></linearGradient>
      <radialGradient id="hd-paste" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#FFD23F"/><stop offset=".7" stop-color="#F2A900"/><stop offset="1" stop-color="#C98000"/></radialGradient>
      <radialGradient id="hd-dab"><stop offset="0" stop-color="#F7C21C" stop-opacity=".95"/><stop offset=".7" stop-color="#F2B318" stop-opacity=".75"/><stop offset="1" stop-color="#F2B318" stop-opacity="0"/></radialGradient>
      <radialGradient id="hd-light" cx=".5" cy=".4" r=".55"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".75"/><stop offset="1" stop-color="#FFF4C8" stop-opacity="0"/></radialGradient>
      <filter id="hd-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>`;
    // a draped backdrop with a soft light behind her
    s += `<rect width="600" height="450" fill="url(#hd-wall)"/>`;
    for (let x = 0; x < 600; x += 40) s += `<path d="M${x + 20} 0V450" stroke="#B85A0E" stroke-width="14" opacity=".08"/><path d="M${x + 6} 0V450" stroke="#FFF2C0" stroke-width="5" opacity=".14"/>`;
    s += `<ellipse cx="300" cy="230" rx="230" ry="190" fill="url(#hd-light)"/>`;
    // swags across the top: orange and pink fabric, with gota borders
    [[0, 'url(#hd-drape)'], [1, 'url(#hd-pink)']].forEach(([k, fill]) => {
      for (let i = 0; i < 4; i++) {
        const x0 = -40 + i * 170 + k * 85, x1 = x0 + 170, y = 0 + k * 6;
        s += `<path d="M${x0} ${y}C${x0 + 40} ${y + 70} ${x1 - 40} ${y + 70} ${x1} ${y}L${x1} ${y - 10}H${x0}Z" fill="${fill}"/>`;
        s += `<path d="M${x0} ${y}C${x0 + 40} ${y + 70} ${x1 - 40} ${y + 70} ${x1} ${y}" fill="none" stroke="#FFE27A" stroke-width="3"/><path d="M${x0 + 10} ${y + 4}C${x0 + 46} ${y + 62} ${x1 - 46} ${y + 62} ${x1 - 10} ${y + 4}" fill="none" stroke="#FFF6D0" stroke-width="1.2" stroke-dasharray="0 6" stroke-linecap="round"/>`;
      }
    });
    // marigold strings on either side of her
    const R = rng(21);
    [[40, 150], [450, 560]].forEach(([a, b]) => {
      for (let x = a; x <= b; x += 22) {
        const len = 8 + Math.floor(R() * 5);
        let g = `<path d="M0 0V${len * 16}" stroke="#7A3E1A" stroke-width="1"/>`;
        for (let k = 0; k < len; k++) g += `<use href="#marigold" x="-8.5" y="${2 + k * 16}" width="17" height="17"${(k + x / 22) % 3 < 1 ? YEL : (k + x / 22) % 3 < 2 ? '' : ' style="--m1:#FFFDF5;--m2:#FFFFFF;--m3:#E9DDC0"'}/>`;
        s += `<g transform="translate(${x} 30)"><g class="sway" style="--dur:${(4 + R() * 3).toFixed(1)}s;--delay:${(-R() * 5).toFixed(1)}s;--a:1.6deg">${g}</g></g>`;
      }
    });
    // floor
    s += `<path d="M0 404H600V450H0Z" fill="#C8601A"/><path d="M0 404H600" stroke="#FFE27A" stroke-width="2"/>`;
    s += `<path d="M30 414H570L590 450H10Z" fill="#9E1F14" opacity=".55"/><path d="M40 420H560" stroke="#F2C76A" stroke-width="2" stroke-dasharray="0 10" stroke-linecap="round"/>`;
    if (art('haldiBride')) {
      // the bride (with her chowki) as a paper cut-out
      s += `<ellipse cx="300" cy="442" rx="170" ry="9" fill="#000" opacity=".25" filter="url(#hd-soft)"/>`;
      s += place(cut(art('haldiBride'), 420, 340, 'hd-img'), 300, 444, 1, 'hd-bride hd-bride--art');
    } else {
      // the chowki
      s += `<ellipse cx="300" cy="442" rx="170" ry="9" fill="#000" opacity=".25" filter="url(#hd-soft)"/>`;
      s += `<path d="M160 388H440L446 400H154Z" fill="url(#hd-top)"/><path d="M154 400H446V420H154Z" fill="url(#hd-wood)"/>`;
      s += `<path d="M164 405H436M164 415H436" stroke="#F2C76A" stroke-width="1.2" opacity=".6"/>`;
      for (let x = 180; x < 430; x += 26) s += `<circle cx="${x}" cy="410" r="2.2" fill="#F2C76A" opacity=".8"/>`;
      [168, 432].forEach((x) => { s += `<path d="M${x - 8} 420H${x + 8}L${x + 5} 440H${x - 5}Z" fill="url(#hd-wood)"/>`; });
      // the bride, in yellow, flower jewellery
      const bride = P.bride({ seated: true, floral: true, pose: { armL: [6, 36], armR: [-6, -36] }, palette: { cloth: '#F2B318', sleeve: '#F2B318', veil: '#2E9D5B', zari: '#C8235F', skin: P.SKIN.mid } });
      s += place(bride.svg, 300, 392, 1.12, 'hd-bride');
    }
    // haldi in a brass urli, and a thali of flowers
    s += `<g transform="translate(118 412)"><ellipse cx="0" cy="18" rx="56" ry="8" fill="#000" opacity=".25" filter="url(#hd-soft)"/><path d="M-54 0C-50 22 50 22 54 0Z" fill="url(#g-brass)"/><ellipse cx="0" cy="0" rx="54" ry="11" fill="#E9C46A"/><ellipse cx="0" cy="1" rx="47" ry="8" fill="url(#hd-paste)"/>` +
      `<path d="M-30 0C-20 -4 -6 -3 4 0M10 2C18 -1 28 -1 34 2" stroke="#FFE680" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>` +
      `<use href="#marigold" x="-20" y="-12" width="18" height="18"/><use href="#marigold" x="12" y="-10" width="15" height="15"${YEL}/><use href="#leaf" x="24" y="-26" width="10" height="26" style="--leaf:#3E6B2A" transform="rotate(50 29 -13)"/></g>`;
    s += `<g transform="translate(486 418)"><ellipse cx="0" cy="12" rx="52" ry="7" fill="#000" opacity=".25" filter="url(#hd-soft)"/><ellipse cx="0" cy="4" rx="50" ry="11" fill="url(#g-brass)"/><ellipse cx="0" cy="2" rx="42" ry="8" fill="#E9C46A"/>` +
      [[-24, -6], [-8, -9], [8, -8], [24, -5]].map(([x, y], i) => `<use href="#marigold" x="${x - 9}" y="${y - 9}" width="18" height="18"${i % 2 ? YEL : ROSE}/>`).join('') +
      `<use href="#diya" x="-14" y="-30" width="28" height="24"/></g>`;
    s += '<g class="hd-fx"></g>';
    // the family's hands
    const hh = art('haldiHand');
    // a hand image reaches in from the left: its fingertips are at the right-hand edge, half-way down
    const handImg = hh ? `<image href="${attr(hh)}" x="-290" y="-55" width="290" height="110" preserveAspectRatio="xMaxYMid meet" filter="url(#paper-lift)"/>` : '';
    s += `<g class="hd-arm hd-arm--l">${hh ? handImg : reachArm('hal', '#C8235F', P.SKIN.wheat, '#2E9D5B')}</g>`;
    s += `<g class="hd-arm hd-arm--r"><g transform="scale(-1 1)">${hh ? handImg : reachArm('har', '#2E7D6B', P.SKIN.light, '#C8102E')}</g></g>`;
    return `<svg class="scene scene--haldi" viewBox="0 0 600 450" aria-hidden="true">${s}</svg>`;
  }
  function mountHaldi(root) {
    const svg = root.querySelector('.scene--haldi');
    const brideEl = svg.querySelector('.hd-bride'), isArt = brideEl.classList.contains('hd-bride--art');
    const head = isArt ? brideEl : brideEl.querySelector('.head-rig > g');
    const armL = isArt ? brideEl : brideEl.querySelector('[data-r2="armL"]'), armR = isArt ? brideEl : brideEl.querySelector('[data-r2="armR"]');
    const life = P.alive(brideEl, 2), T0 = brideEl.getAttribute('transform');
    const fx = svg.querySelector('.hd-fx');
    const arms = [svg.querySelector('.hd-arm--l'), svg.querySelector('.hd-arm--r')];
    // marks: haldi smudges that build up on her cheeks and arms (in their own coordinates)
    const marks = (el) => { const g = document.createElementNS(NS, 'g'); el.appendChild(g); return g; };
    const mHead = marks(head), mL = isArt ? mHead : marks(armL), mR = isArt ? mHead : marks(armR);
    const toScene = (el, x, y) => {
      const m = svg.getScreenCTM(), e = el.getScreenCTM();
      if (!m || !e) return { x: 300, y: 220 };
      return new DOMPoint(x, y).matrixTransform(m.inverse().multiply(e));
    };
    // where each hand goes: [which arm, target element, local point, dab size]
    let plan = [[0, head, [-10.6, -256], 4.2], [1, head, [10.6, -256], 4.2], [0, armL, [0, 18], 4], [1, armR, [0, 18], 4], [0, head, [-8, -262], 3.4], [1, head, [9, -250], 3.4]];
    if (isArt) {
      // with a paper cut-out, the hands go to the cheeks set in config (fractions of the image)
      plan = null;
      natural(art('haldiBride')).then((n) => {
        if (!n) return;
        const r = fitRect(-210, -340, 420, 340, n[0], n[1]), ch = ART.haldiCheeks || [[.43, .2], [.57, .2]];
        const at = (c, dx = 0, dy = 0) => [r.x + (c[0] + dx) * r.w, r.y + (c[1] + dy) * r.h], rad = r.w * .028;
        plan = [[0, head, at(ch[0]), rad], [1, head, at(ch[1]), rad], [0, head, at(ch[0], -.012, .025), rad * .8], [1, head, at(ch[1], .012, .025), rad * .8]];
      });
    }
    const dab = (g, x, y, r) => {
      const c = document.createElementNS(NS, 'ellipse');
      c.setAttribute('cx', f(x + (Math.random() - .5) * 3)); c.setAttribute('cy', f(y + (Math.random() - .5) * 3));
      c.setAttribute('rx', f(r * (1 + Math.random() * .3))); c.setAttribute('ry', f(r * (.7 + Math.random() * .2)));
      c.setAttribute('fill', 'url(#hd-dab)'); c.setAttribute('class', 'dab');
      g.appendChild(c);
      if (g.children.length > 14) g.firstChild.remove();
    };
    const splash = (p) => {
      for (let k = 0; k < 6; k++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', f(p.x)); c.setAttribute('cy', f(p.y)); c.setAttribute('r', f(1 + Math.random() * 1.8)); c.setAttribute('fill', '#F7C21C');
        c._v = [(Math.random() - .5) * 60, -20 - Math.random() * 40]; c._life = 0;
        fx.appendChild(c);
      }
    };
    let step = 0, phase = 0, cur = null, giggle = 0;
    // the hands come down at an angle, from relatives standing either side of her
    const ANG = (ART.haldiReach || 62) * Math.PI / 180, REACH = 330;
    const dirOf = (who) => [Math.cos(ANG) * (who ? -1 : 1), Math.sin(ANG)];
    const restOf = (who, p) => { const d = dirOf(who); return [p.x - d[0] * REACH, p.y - d[1] * REACH]; };
    const tilt = (who) => (who ? -1 : 1) * ANG * 180 / Math.PI;
    arms.forEach((a, i) => { const r = restOf(i, { x: i ? 330 : 270, y: 200 }); a.setAttribute('transform', `translate(${f(r[0])} ${f(r[1])}) rotate(${f(tilt(i))})`); });
    animate(svg, (t, dt) => {
      // one hand at a time: reach in (0.9 s), dab (0.35 s), pull back (0.8 s), pause
      phase += dt;
      if (!plan) return;
      if (!cur) {
        const [who, el, pt, r] = plan[step % plan.length];
        const p = toScene(el, pt[0], pt[1]);
        cur = { who, el, pt, r, p, done: false };
      }
      const { who, p } = cur;
      const a = arms[who], [rx, ry] = restOf(who, p);
      let k;
      if (phase < .9) k = 1 - Math.pow(1 - phase / .9, 3);
      else if (phase < 1.25) { k = 1 + Math.sin((phase - .9) / .35 * Math.PI * 2) * .015; if (!cur.done && phase > 1) { cur.done = true; dab(cur.el === head ? mHead : cur.el === armL ? mL : mR, cur.pt[0], cur.pt[1], cur.r); splash(p); giggle = 1; } }
      else if (phase < 2.05) k = 1 - Math.pow((phase - 1.25) / .8, 2);
      else k = 0;
      const x = rx + (p.x - rx) * k, y = ry + (p.y - ry) * k;
      a.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(tilt(who) + (who ? 1 : -1) * (1 - k) * 8)})`);
      if (phase > 2.6) { phase = 0; step++; cur = null; }
      // she giggles and leans away from the hand
      giggle = Math.max(0, giggle - dt * 1.6);
      if (isArt) brideEl.setAttribute('transform', `${T0} rotate(${f((who ? -1 : 1) * giggle * 2.4 + Math.sin(t * .9) * .4)}) scale(1 ${f(1 + Math.sin(t * 1.7) * .004)})`);
      else life(t, { tilt: (who ? -1 : 1) * giggle * 7, look: giggle > .2 ? (who ? -1.2 : 1.2) : null, sway: 1.2 });
      // falling turmeric specks
      [...fx.children].forEach((c) => {
        c._life += dt; c._v[1] += 160 * dt;
        c.setAttribute('cx', f(+c.getAttribute('cx') + c._v[0] * dt)); c.setAttribute('cy', f(+c.getAttribute('cy') + c._v[1] * dt));
        c.setAttribute('opacity', f(Math.max(0, 1 - c._life / .7)));
        if (c._life > .7) c.remove();
      });
    });
  }

  /* ==========================================================
     MEHENDI — the bride's hand, an artist's cone drawing the
     design onto it, and the groom's name hidden in a paisley
     ========================================================== */
  function mehendi(c) {
    const d = HD.design();
    const INK = '#4A1E0C';
    let s = `<defs><radialGradient id="mh-glow" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#FFF6D8" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="mh-cone" x1="0" x2="1"><stop offset="0" stop-color="#C9B48A"/><stop offset=".4" stop-color="#F6EAD0"/><stop offset="1" stop-color="#B39A6C"/></linearGradient>` +
      `<linearGradient id="mh-ask" x1="0" x2="1"><stop offset="0" stop-color="#9A6440"/><stop offset=".4" stop-color="#D59A6E"/><stop offset=".75" stop-color="#C08456"/><stop offset="1" stop-color="#8A5434"/></linearGradient></defs>`;
    s += `<ellipse cx="210" cy="380" rx="230" ry="300" fill="url(#mh-glow)"/>`;
    // scattered rose petals
    const R = rng(8);
    for (let i = 0; i < 16; i++) {
      const x = -10 + R() * 440, y = 120 + R() * 540;
      if (x > 120 && x < 320) continue;
      s += `<path d="M0 0C6 -8 16 -6 16 2C16 10 6 12 0 0Z" fill="${R() > .5 ? '#C8102E' : '#E8354A'}" opacity=".85" transform="translate(${f(x)} ${f(y)}) rotate(${f(R() * 360)}) scale(${f(.8 + R() * .6)})"/>`;
    }
    // the cone, held in the mehendi artist's hand (tip at 0,0)
    let cone = `<g transform="rotate(32)">`;
    cone += `<path d="M-2 -70C2 -120 8 -170 16 -236L54 -230C46 -170 40 -118 36 -66Z" fill="url(#mh-ask)"/>`;
    cone += `<path d="M10 -150L46 -146" stroke="#C8102E" stroke-width="7"/><path d="M10 -150L46 -146" stroke="#F2C76A" stroke-width="2" stroke-dasharray="0 4" stroke-linecap="round"/>`;
    cone += `<path d="M-16 -52C-20 -76 0 -92 20 -90C40 -88 47 -68 40 -48C34 -32 16 -27 2 -31C-7 -34 -14 -42 -16 -52Z" fill="url(#mh-ask)"/>`;
    cone += `<path d="M0 0L-9 -64C-6 -68 6 -68 9 -64Z" fill="url(#mh-cone)"/><path d="M-4 -20L3 -23" stroke="#9A8460" stroke-width=".8"/><circle r="2.2" fill="${INK}"/>`;
    // fingers curled round the cone, in front of it, and the thumb pressing down
    [[-34, 5.4], [-44, 5.6], [-54, 5.4], [-63, 4.8]].forEach(([y, r]) => { cone += `<rect x="-15" y="${y - r}" width="${f(26 + r)}" height="${f(r * 2)}" rx="${r}" fill="url(#mh-ask)" stroke="#8A5434" stroke-width=".7"/><ellipse cx="-11" cy="${y}" rx="2.4" ry="${f(r * .55)}" fill="#F3C9A6" opacity=".8"/>`; });
    cone += `<path d="M-12 -70C-22 -56 -24 -38 -18 -26C-15 -20 -8 -21 -8 -28C-10 -40 -8 -52 -2 -62Z" fill="url(#mh-ask)" stroke="#8A5434" stroke-width=".7"/><ellipse cx="-14.6" cy="-28" rx="2.6" ry="3.4" fill="#F3C9A6" opacity=".85"/>`;
    cone += '</g>';
    if (art('mehendiHand')) return mehendiArt(c, s, cone);
    s += `<g class="mh-hand">${HD.defs('mh')}${HD.hand('mh')}`;
    s += `<g clip-path="url(#mh-clip)"><g class="mh-ink" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">${d.lines.map((l) => `<path d="${l.d}" stroke-width="${l.w}"/>`).join('')}</g>`;
    s += `<path class="mh-fill" d="${d.fills.join('')}" fill="${INK}"/>`;
    const n = d.nameAt;
    s += `<text class="mh-name" x="${f(n.x)}" y="${f(n.y)}" transform="rotate(${f(n.deg)} ${f(n.x)} ${f(n.y)}) translate(-2 3.6)" font-size="10">${c.hiddenName}</text></g>`;
    s += `<circle class="mh-ring" cx="${f(n.x + 12 * Math.cos(n.deg * Math.PI / 180))}" cy="${f(n.y + 12 * Math.sin(n.deg * Math.PI / 180))}" r="40"/></g>`;
    return `<svg class="scene scene--mehendi" viewBox="-20 70 460 600" role="group" aria-label="${c.label}">${s}<g class="mh-cone">${cone}</g></svg>`;
  }

  // the mehendi with paper-craft images: the bare hand, and the same hand with
  // mehendi revealed under the cone as it moves (needs both images to line up)
  const MH_BOX = [-20, 72, 460, 630];
  function mehendiArt(c, s, vectorCone) {
    const [bx, by, bw, bh] = MH_BOX, plain = art('mehendiHandPlain'), coneSrc = art('mehendiCone');
    const img = (src, cls) => `<image class="${cls}" href="${attr(src)}" x="${bx}" y="${by}" width="${bw}" height="${bh}" preserveAspectRatio="xMidYMax meet"/>`;
    s += `<defs><filter id="mh-soften" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter></defs>`;
    if (plain) s += `<mask id="mh-reveal" maskUnits="userSpaceOnUse" x="-20" y="70" width="460" height="600"><path class="mh-brush" fill="none" stroke="#fff" stroke-width="64" stroke-linecap="round" stroke-linejoin="round" filter="url(#mh-soften)"/><rect class="mh-all" x="-20" y="70" width="460" height="600" fill="#fff" style="opacity:0"/></mask>`;
    s += `<g filter="url(#paper-lift)">${plain ? img(plain, 'mh-plain') : ''}<g class="mh-art"${plain ? ' mask="url(#mh-reveal)"' : ''}>${img(art('mehendiHand'), 'mh-hand-img')}<text class="mh-name" text-anchor="middle" x="0" y="0">${c.hiddenName}</text></g></g>`;
    s += `<circle class="mh-ring" cx="0" cy="0" r="40"/>`;
    const coneArt = coneSrc ? `<g transform="rotate(${+(ART.mehendiConeTurn || 0)})"><image href="${attr(coneSrc)}" x="0" y="-360" width="360" height="360" preserveAspectRatio="xMinYMax meet" filter="url(#paper-lift)"/></g>` : vectorCone;
    return `<svg class="scene scene--mehendi scene--mehendi-art" viewBox="-20 70 460 600" role="group" aria-label="${c.label}">${s}<g class="mh-cone"${plain ? '' : ' style="opacity:0"'}>${coneArt}</g></svg>`;
  }
  function drawMehendiArt(svg, cone, name, ring) {
    const brush = svg.querySelector('.mh-brush'), all = svg.querySelector('.mh-all');
    let done = false, ready = false, len = 0, start = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (all) { all.style.transition = 'opacity 1s'; all.style.opacity = 1; }
      cone.style.transition = 'transform 1.2s ease, opacity .9s'; cone.setAttribute('transform', 'translate(470 160)'); cone.style.opacity = 0;
    };
    natural(art('mehendiHand')).then((n) => {
      if (!n) return;
      const [bx, by, bw, bh] = MH_BOX, r = fitRect(bx, by, bw, bh, n[0], n[1]);
      // the groom's name, hidden in the design
      const nm = Object.assign({ x: .58, y: .4, rotate: -30, size: .05 }, ART.mehendiName || {});
      const x = r.x + nm.x * r.w, y = r.y + nm.y * r.h;
      name.setAttribute('x', f(x)); name.setAttribute('y', f(y)); name.setAttribute('font-size', f(nm.size * r.w));
      name.setAttribute('transform', `rotate(${nm.rotate} ${f(x)} ${f(y)})`); name.setAttribute('dominant-baseline', 'middle');
      ring.setAttribute('cx', f(x)); ring.setAttribute('cy', f(y)); ring.setAttribute('r', f(r.w * .13));
      ring.style.transformOrigin = `${f(x)}px ${f(y)}px`;
      if (!brush) { done = true; return; }
      // the cone colours the hand in, row by row, from the fingertips down
      const z = ART.mehendiZone || [.2, .05, .84, .86], row = 40;
      const x0 = r.x + z[0] * r.w, x1 = r.x + z[2] * r.w, y0 = r.y + z[1] * r.h, y1 = r.y + z[3] * r.h;
      const pts = [];
      for (let yy = y0, k = 0; yy < y1 + row; yy += row, k++) { const y2 = Math.min(yy, y1); pts.push(k % 2 ? [x1, y2] : [x0, y2], k % 2 ? [x0, y2] : [x1, y2]); }
      brush.setAttribute('d', 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L'));
      len = brush.getTotalLength();
      brush.style.strokeDasharray = `${f(len)} ${f(len)}`; brush.style.strokeDashoffset = f(len);
      ready = true;
      if (reduce) finish();
    });
    animate(svg, (t) => {
      if (done || !ready) return;
      if (start === null) start = t;
      const dist = (t - start) * Math.max(300, len / 10);
      if (dist >= len) { brush.style.strokeDashoffset = 0; return finish(); }
      brush.style.strokeDashoffset = f(len - dist);
      const p = brush.getPointAtLength(dist);
      cone.setAttribute('transform', `translate(${f(p.x)} ${f(p.y)})`);
    });
    return finish;
  }

  function mountMehendi(root, c) {
    const svg = root.querySelector('.scene--mehendi');
    const cone = svg.querySelector('.mh-cone'), name = svg.querySelector('.mh-name'), ring = svg.querySelector('.mh-ring');
    const finish = svg.classList.contains('scene--mehendi-art') ? drawMehendiArt(svg, cone, name, ring) : drawMehendi(svg, cone, name);
    mehendiGame(root, svg, c, finish, name, ring);
  }
  function drawMehendi(svg, cone, name) {
    const paths = [...svg.querySelectorAll('.mh-ink path')];
    const fill = svg.querySelector('.mh-fill');
    const lens = paths.map((p) => p.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0);
    paths.forEach((p, i) => { p.style.strokeDasharray = `${lens[i]} ${lens[i]}`; p.style.strokeDashoffset = lens[i]; });
    fill.style.opacity = 0; name.style.opacity = 0;
    const speed = Math.max(380, total / 10); // about ten seconds to draw it all
    let done = false;
    cone.setAttribute('transform', 'translate(380 230)');
    const finish = () => {
      done = true;
      paths.forEach((p) => { p.style.strokeDashoffset = 0; });
      fill.style.transition = 'opacity .8s'; fill.style.opacity = 1; name.style.transition = 'opacity .8s'; name.style.opacity = 1;
      cone.style.transition = 'transform 1.2s ease, opacity .9s'; cone.setAttribute('transform', 'translate(470 160)'); cone.style.opacity = 0;
    };
    if (reduce) finish();
    else {
      let start = null;
      animate(svg, (t) => {
        if (done) return;
        if (start === null) start = t;
        let dist = (t - start) * speed;
        if (dist >= total) { finish(); return; }
        let i = 0;
        while (i < paths.length && dist > lens[i]) { paths[i].style.strokeDashoffset = 0; dist -= lens[i]; i++; }
        if (i < paths.length) {
          paths[i].style.strokeDashoffset = f(lens[i] - dist);
          const pt = paths[i].getPointAtLength(dist);
          cone.setAttribute('transform', `translate(${f(pt.x)} ${f(pt.y)})`);
        }
        fill.style.opacity = Math.max(0, Math.min(1, (t - start) * speed / total * 1.4 - .4));
        name.style.opacity = (t - start) * speed / total > .55 ? 1 : 0;
      });
    }

    return finish;
  }
  // find-the-name game
  function mehendiGame(root, svg, c, finish, name, ring) {
    const status = root.querySelector('[data-mh-status]'), reveal = root.querySelector('[data-mh-reveal]');
    let tries = 0, found = false;
    const nb = () => { const b = name.getBBox(); const m = name.getCTM(), sm = svg.getCTM().inverse(); return new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(sm.multiply(m)); };
    const win = (byReveal) => {
      found = true; finish();
      svg.classList.add('is-found');
      status.innerHTML = byReveal ? c.revealed() : c.found();
      reveal.hidden = true;
      if (!byReveal) { shower(60); if (window.WIAudio) WIAudio.hit('bell'); }
    };
    svg.addEventListener('click', (e) => {
      if (found) return;
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      const n = nb();
      tries++;
      const dd = Math.hypot(pt.x - n.x, pt.y - n.y);
      if (dd < 26) return win(false);
      const ring2 = document.createElementNS(NS, 'circle');
      ring2.setAttribute('class', 'mh-miss'); ring2.setAttribute('cx', f(pt.x)); ring2.setAttribute('cy', f(pt.y)); ring2.setAttribute('r', 18);
      svg.appendChild(ring2); setTimeout(() => ring2.remove(), 800);
      status.innerHTML = tries >= 3 && dd > 60 ? c.hint() : dd < 60 ? c.warm() : c.cold();
    });
    reveal.addEventListener('click', () => win(true));
    if (!svg.classList.contains('scene--mehendi-art')) ring.style.transformOrigin = `${ring.getAttribute('cx')}px ${ring.getAttribute('cy')}px`;
  }

  /* ==========================================================
     DHOL — playable, with sticks
     ========================================================== */
  function dhol() {
    const cy = 150, lx = 78, rx = 382;
    let s = '';
    // strap
    s += `<path d="M84 64C140 -4 320 -4 376 72" fill="none" stroke="#B8281A" stroke-width="9"/><path d="M84 64C140 -4 320 -4 376 72" fill="none" stroke="#FFD36B" stroke-width="2" stroke-dasharray="6 6"/>`;
    // barrel
    s += `<defs><linearGradient id="g-dhol" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7A3212"/><stop offset=".3" stop-color="#B0562A"/><stop offset=".65" stop-color="#7E3414"/><stop offset="1" stop-color="#4A1C08"/></linearGradient></defs>`;
    s += `<path d="M${lx} ${cy - 96}C160 ${cy - 118} 300 ${cy - 116} ${rx} ${cy - 88}V${cy + 88}C300 ${cy + 116} 160 ${cy + 118} ${lx} ${cy + 96}Z" fill="url(#g-dhol)"/>`;
    // painted bands
    s += `<path d="M122 ${cy - 104}C114 ${cy - 40} 114 ${cy + 40} 122 ${cy + 104}M338 ${cy - 100}C346 ${cy - 40} 346 ${cy + 40} 338 ${cy + 100}" fill="none" stroke="#F2B318" stroke-width="10"/>`;
    s += `<path d="M138 ${cy - 106}C130 ${cy - 40} 130 ${cy + 40} 138 ${cy + 106}M322 ${cy - 104}C330 ${cy - 40} 330 ${cy + 40} 322 ${cy + 104}" fill="none" stroke="#2F6B3A" stroke-width="4"/>`;
    // rope lacing between the hoops, with rings
    const N = 9;
    const Lp = [], Rp = [];
    for (let i = 0; i <= N; i++) {
      const a = (-78 + 156 * i / N) * Math.PI / 180;
      Lp.push([lx + 14 * Math.cos(a), cy + 96 * Math.sin(a)]);
      Rp.push([rx - 12 * Math.cos(a), cy + 88 * Math.sin(a)]);
    }
    let rope = `M${f(Lp[0][0])} ${f(Lp[0][1])}`, rings = '';
    for (let i = 0; i < N; i++) {
      const rmid = [(Rp[i][0] + Rp[i + 1][0]) / 2, (Rp[i][1] + Rp[i + 1][1]) / 2];
      rope += `L${f(rmid[0])} ${f(rmid[1])}L${f(Lp[i + 1][0])} ${f(Lp[i + 1][1])}`;
      const t = .78, ax = Lp[i][0] + (rmid[0] - Lp[i][0]) * t, ay = Lp[i][1] + (rmid[1] - Lp[i][1]) * t;
      const bx = Lp[i + 1][0] + (rmid[0] - Lp[i + 1][0]) * t, by = Lp[i + 1][1] + (rmid[1] - Lp[i + 1][1]) * t;
      rings += `<ellipse cx="${f((ax + bx) / 2)}" cy="${f((ay + by) / 2)}" rx="4" ry="${f(Math.abs(by - ay) / 2 + 3)}" fill="none" stroke="#D9D9D9" stroke-width="2.2"/>`;
    }
    s += `<path d="${rope}" fill="none" stroke="#F3E3C0" stroke-width="3" stroke-linejoin="round"/>` + rings;
    // heads
    s += `<g class="dhol-head dhol-head--dagga" data-drum="dagga" role="button" tabindex="0"><ellipse cx="${lx - 6}" cy="${cy}" rx="30" ry="100" fill="#E7D3A8" stroke="#3A1606" stroke-width="7"/><ellipse class="ripple" cx="${lx - 6}" cy="${cy}" rx="18" ry="60" fill="none" stroke="#B89A66" stroke-width="2"/></g>`;
    s += `<g class="dhol-head dhol-head--tilli" data-drum="tilli" role="button" tabindex="0"><ellipse cx="${rx + 6}" cy="${cy}" rx="24" ry="90" fill="#F6ECD6" stroke="#3A1606" stroke-width="6"/><ellipse class="ripple" cx="${rx + 6}" cy="${cy}" rx="14" ry="52" fill="none" stroke="#C9B48A" stroke-width="2"/></g>`;
    // sticks (pivot at the player's hand, outside the drum)
    s += `<g class="dhol-stick dhol-stick--dagga" transform="translate(${lx - 70} ${cy - 120})"><g class="stick"><path d="M0 0C10 30 30 70 52 104C58 112 64 112 66 104" fill="none" stroke="#6B3E1A" stroke-width="7" stroke-linecap="round"/></g></g>`;
    s += `<g class="dhol-stick dhol-stick--tilli" transform="translate(${rx + 70} ${cy - 120})"><g class="stick"><path d="M0 0L-56 112" stroke="#E9D9B4" stroke-width="4" stroke-linecap="round"/></g></g>`;
    return `<svg class="dhol" viewBox="-20 -10 500 300" aria-hidden="false">${s}</svg>`;
  }

  /* ==========================================================
     SANGEET — the couple dancing on stage, a dhol in front.
     The dancers move with every stroke of the dhol.
     ========================================================== */
  function sangeet() {
    let s = `<defs><radialGradient id="sg-spot" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#FFE2A0" stop-opacity=".45"/><stop offset="1" stop-color="#FFE2A0" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="sg-floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A0E2A"/><stop offset="1" stop-color="#14040E"/></linearGradient></defs>`;
    s += `<g class="beams"><path d="M110 -10L30 382H210Z" fill="#FFE2A0" opacity=".14"/><path d="M490 -10L390 382H570Z" fill="#FFE2A0" opacity=".14"/><path d="M300 -10L200 382H400Z" fill="#FFFFFF" opacity=".08"/></g>`;
    s += fairy(0, 30, 600, 30, 26, 30) + fairy(0, 10, 600, 10, 40, 34);
    s += `<path d="M0 378H600V420H0Z" fill="url(#sg-floor)"/><path d="M0 378H600" stroke="#FFD36B" stroke-width="2" opacity=".6"/>`;
    s += `<ellipse cx="300" cy="384" rx="240" ry="16" fill="url(#sg-spot)"/>`;
    const g = P.man({ kind: 'baraati', who: 'groom', bare: true, kurta: '#F4E3C3', jacket: '#7A1E4E' });
    const b = P.bride({ veil: false, palette: { cloth: '#D6246E', sleeve: '#D6246E', veil: '#F2B318', zari: '#FFE7A8' } });
    // paper cut-outs (two poses each, swapped on the beat), or the drawn dancers
    const poses = (k) => [art(k, 0), art(k, 1)].filter(Boolean).map((src, i) => cut(src, 250, 360, 'pose', 'xMidYMax').replace('<image ', `<image opacity="${i ? 0 : 1}" `)).join('');
    const b1 = art('sangeetBride', 0), b2 = art('sangeetBride', 1);
    if (b1 && b2) {
      // two dancing images of her look like two different people, so they dance as a trio with the groom
      s += place(cut(b1, 330, 360), 132, 382, .8, 'sg-bride');
      s += place(cut(b2, 330, 360), 470, 382, .8, 'sg-friend');
      s += place(poses('sangeetGroom') || g.svg, 300, 386, poses('sangeetGroom') ? .8 : .9, 'sg-groom');
    } else {
      s += place(poses('sangeetGroom') || g.svg, 215, 380, .94, 'sg-groom');
      s += place(poses('sangeetBride') || b.svg, 392, 380, .94, 'sg-bride');
    }
    return `<svg class="scene scene--sangeet" viewBox="0 0 600 420" aria-hidden="true">${s}</svg>`;
  }
  function mountSangeet(root) {
    const svg = root.querySelector('.scene--sangeet');
    const gEl = svg.querySelector('.sg-groom'), bEl = svg.querySelector('.sg-bride');
    const skirt = bEl.querySelector('.skirt');
    const gT = gEl.getAttribute('transform'), bT = bEl.getAttribute('transform');
    const gLife = P.alive(gEl, 3), bLife = P.alive(bEl, 6);
    const beams = svg.querySelector('.beams');
    let energy = 0, beat = 0, lastHit = -9; // energy jumps on each dhol stroke
    const dholEl = root.querySelector('.dhol');
    const hitAnim = (kind) => {
      energy = Math.min(1.3, energy + (kind === 'dagga' ? .9 : .45));
      if (kind === 'dagga') beat++;
      const stick = dholEl.querySelector(`.dhol-stick--${kind} .stick`), head = dholEl.querySelector(`.dhol-head--${kind}`);
      stick.classList.remove('hit'); head.classList.remove('hit');
      void stick.getBoundingClientRect();
      stick.classList.add('hit'); head.classList.add('hit');
    };
    const play = (kind) => { if (window.WIAudio) { WIAudio.ensure(); WIAudio.hit(kind); } hitAnim(kind); };
    dholEl.querySelectorAll('[data-drum]').forEach((h) => {
      h.addEventListener('pointerdown', (e) => { e.preventDefault(); play(h.dataset.drum); });
      h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(h.dataset.drum); } });
    });
    const btn = root.querySelector('[data-dhol-play]');
    let playing = false;
    const setBtn = () => { btn.classList.toggle('is-playing', playing); btn.setAttribute('aria-pressed', String(playing)); btn.querySelector('[data-label]').innerHTML = playing ? btn.dataset.stop : btn.dataset.play; };
    const stop = () => { if (window.WIAudio) WIAudio.stopDhol(); playing = false; setBtn(); };
    btn.addEventListener('click', () => {
      if (!window.WIAudio) return;
      if (playing) return stop();
      if (!WIAudio.isEnabled()) WIAudio.setEnabled(true);
      playing = true; setBtn();
      WIAudio.startDhol(hitAnim).then((ok) => { if (!ok) { playing = false; setBtn(); } });
    });
    if (window.WIAudio) WIAudio.onChange((on) => { if (!on && playing) { playing = false; setBtn(); } });
    // stop when scrolled away
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) stop(); }).observe(root);

    let ph = 0;
    const gPoses = [...gEl.querySelectorAll('.pose')], bPoses = [...bEl.querySelectorAll('.pose')];
    const friend = svg.querySelector('.sg-friend'), fT = friend && friend.getAttribute('transform');
    animate(svg, (t, dt) => {
      // cut-outs change pose on every big stroke while the dhol plays, and now and then when it doesn't
      const k = playing ? beat : Math.floor(t / 1.4);
      if (gPoses.length > 1) showPose(gPoses, k);
      if (bPoses.length > 1) showPose(bPoses, k + 1);
      energy = Math.max(0, energy - dt * 2.4);
      const e = playing ? Math.min(1, .55 + energy * .6) : .4 + energy * .5;
      ph += dt * (playing ? 4.2 : 1.6);
      const w = ph;
      const lift = Math.max(0, Math.sin(w)), lift2 = Math.max(0, -Math.sin(w));
      // groom: bhangra — arms up, shoulders bouncing, a knee up on alternate beats
      const bounce = (Math.abs(Math.sin(w)) * 5 + energy * 5) * e;
      gEl.setAttribute('transform', `${gT} translate(0 ${f(-bounce)}) rotate(${f(Math.sin(w * .5) * 3 * e)})`);
      P.pose(gEl, {
        armL: [-128 + Math.sin(w) * 12 * e, -40 + Math.sin(w * 2) * 22 * e], armR: [128 + Math.sin(w + .6) * 12 * e, 40 - Math.sin(w * 2 + .6) * 22 * e],
        legL: [-lift * 40 * e, lift * 52 * e], legR: [lift2 * 40 * e, -lift2 * 52 * e]
      });
      gLife(t, { look: 1.3, sway: 3 * e });
      // bride: a twirl of the lehenga, arms flowing from side to side
      const sw = Math.sin(w * .5);
      bEl.setAttribute('transform', `${bT} translate(0 ${f(-bounce * .45)}) rotate(${f(sw * 2.4 * e)})`);
      // the second dancer sways her hips on the off-beat
      if (friend) friend.setAttribute('transform', `${fT} translate(0 ${f(-Math.abs(Math.sin(w + 1.2)) * 4 * e)}) rotate(${f(-Math.sin(w * .5 + 1.2) * 3 * e)})`);
      P.pose(bEl, {
        armL: [-150 + sw * 34 * e, -28 + Math.sin(w) * 26 * e], armR: [60 + sw * 40 * e, 70 - Math.sin(w + 1) * 30 * e]
      });
      if (skirt) skirt.setAttribute('transform', `translate(0 -192) scale(${f(1 + Math.abs(sw) * .07 * e + energy * .06)} 1) skewX(${f(sw * 5 * e)}) translate(0 192)`);
      bLife(t, { look: -1.3, tilt: -sw * 6 * e });
      if (beams) beams.setAttribute('opacity', f(.7 + energy * .5 + Math.sin(t * 1.3) * .15));
    });
  }

  /* ==========================================================
     BARAAT — the procession: lights, the dholi, dancing guests,
     and the groom on his mare. It moves along as you scroll.
     ========================================================== */
  function baraat() {
    let s = '';
    s += `<g opacity=".8" transform="translate(-1100 150) scale(1)">${palace(77, { sil: '#5E140C' })}</g>`;
    s += `<rect x="-200" y="394" width="1400" height="60" fill="#000" opacity=".25"/>`;
    s += fairy(-100, 40, 450, 40, 30, 26) + fairy(450, 40, 1000, 40, 30, 26);
    const lampArms = { armL: [-160, -12], armR: [160, 12] };
    // a roshni (lamp stand) carried on the head
    const lamp = `<g transform="translate(0 -350)"><path d="M0 0V-40" stroke="#C9973A" stroke-width="3"/><path d="M-28 -36H28" stroke="#C9973A" stroke-width="3"/>` +
      [[-26, -42], [26, -42], [0, -48], [-13, -40], [13, -40]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="6" fill="#FFE7A8" class="glow"/><circle cx="${dx}" cy="${dy}" r="2.4" fill="#fff"/>`).join('') + `</g>`;
    let people = [
      ['bt-lamp1', P.man({ kind: 'baraati', kurta: '#4D3A8A', turban: '#F2B318', pose: lampArms }).svg + lamp, 0, 0.62],
      ['bt-dholi', P.man({ kind: 'dhol', kurta: '#B8281A', turban: '#2E9D5B', skin: P.SKIN.wheat }).svg, 88, 0.66],
      ['bt-d1', P.man({ kind: 'baraati', kurta: '#1F6F8B', turban: '#E0337A', sash: '#F2B318', skin: P.SKIN.deep }).svg, 168, 0.64],
      ['bt-w1', P.bride({ guest: true, palette: { cloth: '#2E9D5B', veil: '#F2B318', skin: P.SKIN.light }, bunSide: 'r' }).svg, 239, 0.62],
      ['bt-d2', P.man({ kind: 'baraati', bare: true, kurta: '#F4E3C3', jacket: '#B8281A' }).svg, 302, 0.64],
      ['bt-horse', P.mare({}).svg, 437, 0.77],
      ['bt-w2', P.bride({ guest: true, palette: { cloth: '#E0337A', veil: '#8FD3FF', skin: P.SKIN.wheat } }).svg, 571, 0.62],
      ['bt-lamp2', P.man({ kind: 'baraati', kurta: '#2E7D6B', turban: '#E8792B', pose: lampArms, skin: P.SKIN.deep }).svg + lamp, 638, 0.62]
    ];
    if (art('baraatGroom')) {
      // paper cut-outs. Front row: the dholi, the groom on his mare, the dancers.
      // Back row, a step behind: the sangeet dancers, joining the procession.
      const twoPoses = (k) => [art(k, 0), art(k, 1)].filter(Boolean).map((src, i) => cut(src, 260, 380, 'pose').replace('<image ', `<image opacity="${i ? 0 : 1}" `)).join('');
      const back = ART.baraatSangeetDancers === false ? [] : [
        art('sangeetGroom', 0) && ['bt-s0', twoPoses('sangeetGroom')],
        art('sangeetBride', 1) && ['bt-s1', cut(art('sangeetBride', 1), 300, 380)],
        art('sangeetBride', 0) && ['bt-s2', cut(art('sangeetBride', 0), 330, 380)]
      ].filter(Boolean);
      const front = [
        art('baraatDholi') && ['bt-dholi', cut(art('baraatDholi'), 260, 380)],
        art('baraatDancers', 0) && ['bt-d1', cut(art('baraatDancers', 0), 260, 380)],
        ['bt-horse', cut(art('baraatGroom'), 480, 380)],
        art('baraatDancers', 1) && ['bt-w2', cut(art('baraatDancers', 1), 300, 380)]
      ].filter(Boolean);
      // where everyone walks: the back row fills the gaps between the front row
      const FRONT_X = { 1: [445], 2: [250, 640], 3: [90, 445, 800], 4: [80, 235, 480, 800] }[front.length];
      const BACK_X = front.length > 3 ? [150, 340, 690] : [215, 325, 650];
      people = [
        ...back.map(([cls, svg], i) => [cls, svg, BACK_X[i], .5, -18]),
        ...front.map(([cls, svg], i) => [cls, svg, FRONT_X[i], cls === 'bt-horse' ? .78 : .56, 0])
      ];
    }
    const crowd = people.map(([cls, svg, x, sc, y]) => place(svg, x, y || 0, sc, cls)).join('');
    s += `<g class="bt-crowd" transform="translate(0 404)">${crowd}</g>`;
    return `<div class="scene-wrap"><canvas class="scene-fx" aria-hidden="true"></canvas><svg class="scene scene--baraat" viewBox="0 0 900 450" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${s}</svg></div>`;
  }
  function mountBaraat(root) {
    const svg = root.querySelector('.scene--baraat');
    const cv = root.querySelector('.scene-fx');
    if (cv) fireworks(cv, { every: 1.2, maxY: .3 });
    const crowd = svg.querySelector('.bt-crowd');
    // everyone in the procession, and how they move (drawn figures or paper cut-outs)
    const ROLES = [['bt-lamp1', 'lamp'], ['bt-dholi', 'dholi'], ['bt-d1', 'bhangra'], ['bt-w1', 'dance'], ['bt-d2', 'bhangra'], ['bt-horse', 'horse'], ['bt-w2', 'dance'], ['bt-lamp2', 'lamp'], ['bt-s0', 'bhangra'], ['bt-s1', 'dance'], ['bt-s2', 'dance']];
    const actors = ROLES.map(([cls, role], i) => {
      const el = svg.querySelector('.' + cls);
      if (!el) return null;
      const rider = el.querySelector('.rider');
      return { el, role, i, T: el.getAttribute('transform'), life: P.alive(el, i * 1.7), rider, rT: rider && rider.getAttribute('transform'), rLife: rider && P.alive(rider, 9), poses: [...el.querySelectorAll('.pose')] };
    }).filter(Boolean);
    const sec = root.closest('section, article') || root;
    // where the section sits on the page, re-read only when the page's layout changes
    let secTop = 0, secH = 0;
    const place = () => { const q = sec.getBoundingClientRect(); secTop = q.top + scrollY; secH = q.height; };
    place(); addEventListener('resize', place);
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(document.body);
    animate(svg, (t) => {
      // the procession advances as the section scrolls through the viewport
      const top = secTop - (view.y || scrollY), vh = view.h || innerHeight;
      const prog = Math.min(1, Math.max(0, 1 - (top + secH * .5) / (vh + secH * .5)));
      crowd.setAttribute('transform', `translate(${f(-150 + prog * 300 + Math.sin(t * .7) * 4)} 404)`);
      const w = t * 2.4 * Math.PI;
      actors.forEach((a) => {
        const ph = a.i * .85;
        if (a.poses.length > 1) showPose(a.poses, Math.floor(t * 1.6 + a.i));
        if (a.role === 'dholi') {
          // alternate strokes, a bob on each
          P.pose(a.el, { armL: [24 + Math.sin(w) * 14, 70 + Math.sin(w) * 22], armR: [-24 - Math.sin(w * 2) * 14, -70 - Math.sin(w * 2) * 22], legL: [-4, 0], legR: [4, 0] });
          a.el.setAttribute('transform', `${a.T} translate(0 ${f(-Math.abs(Math.sin(w)) * 4)}) rotate(${f(Math.sin(w) * 1.5)})`);
          a.life(t, { sway: 3 });
        } else if (a.role === 'bhangra') {
          const k = Math.sin(w * .5 + ph);
          P.pose(a.el, { armL: [-132 + k * 16, -36 + k * 26], armR: [132 + k * 16, 36 + k * 26], legL: [-Math.max(0, k) * 40, Math.max(0, k) * 52], legR: [Math.max(0, -k) * 40, -Math.max(0, -k) * 52] });
          a.el.setAttribute('transform', `${a.T} translate(0 ${f(-Math.abs(k) * 8)}) rotate(${f(k * 3)})`);
          a.life(t, { sway: 4 });
        } else if (a.role === 'dance') {
          const k = Math.sin(w * .5 + ph);
          P.pose(a.el, { armL: [-150 + k * 20, -30 + Math.sin(w + ph) * 30], armR: [150 + k * 20, 30 + Math.sin(w + ph + 1) * 30] });
          a.el.setAttribute('transform', `${a.T} translate(0 ${f(-Math.abs(k) * 5)}) rotate(${f(k * 4)})`);
          a.life(t, { sway: 3 });
        } else if (a.role === 'lamp') {
          P.pose(a.el, { legL: [Math.sin(t * 3 + a.i) * 10, 0], legR: [-Math.sin(t * 3 + a.i) * 10, 0] });
          a.el.setAttribute('transform', `${a.T} translate(0 ${f(-Math.abs(Math.sin(t * 3 + a.i)) * 2)})`);
          a.life(t);
        } else if (a.role === 'horse') {
          // the mare walks; the groom sways in the saddle
          const hw = t * 3.2;
          P.pose(a.el, {
            legFN: [Math.sin(hw) * 18, -Math.max(0, Math.sin(hw + 1)) * 40], legFF: [Math.sin(hw + Math.PI) * 18, -Math.max(0, Math.sin(hw + Math.PI + 1)) * 40],
            legHN: [Math.sin(hw + Math.PI * .5) * 16, Math.max(0, Math.sin(hw + 2)) * 30], legHF: [Math.sin(hw + Math.PI * 1.5) * 16, Math.max(0, Math.sin(hw + Math.PI + 2)) * 30]
          });
          a.el.setAttribute('transform', `${a.T} translate(0 ${f(-Math.abs(Math.sin(hw)) * 3)}) rotate(${f(Math.sin(hw) * .8)})`);
          if (a.rider) { a.rider.setAttribute('transform', `${a.rT} rotate(${f(Math.sin(hw) * 1.5)})`); a.rLife(t); }
        }
      });
    });
  }

  /* ==========================================================
     RECEPTION — the couple greeting guests with a namaste
     ========================================================== */
  function reception(e = {}) {
    let s = '';
    s += fairy(-20, 20, 620, 20, 30, 30) + fairy(-20, 60, 620, 60, 26, 28);
    // floral ring behind the couple
    let ring = '';
    for (let i = 0; i < 46; i++) {
      const a = i / 46 * Math.PI * 2, x = 300 + Math.cos(a) * 160, y = 230 + Math.sin(a) * 160;
      if (y > 366) continue;
      ring += `<use href="#marigold" x="${f(x - 10)}" y="${f(y - 10)}" width="20" height="20"${i % 3 === 0 ? ROSE : i % 2 ? YEL : ''}/>`;
    }
    s += `<defs><radialGradient id="rc-glow"><stop offset="0" stop-color="#FFF4D0" stop-opacity=".22"/><stop offset="1" stop-color="#FFF4D0" stop-opacity="0"/></radialGradient></defs>`;
    s += `<circle cx="300" cy="230" r="170" fill="url(#rc-glow)"/>` + ring;
    s += `<path d="M110 382H490" stroke="#E9D7A6" stroke-width="2"/>`;
    const pic = e.image || art('coupleNamaste');
    if (pic) s += place(cut(pic, 330, 350), 300, 382, 1, 'rc-couple');
    else {
      s += place(P.man({ kind: 'groom', pose: P.POSES.namaste, palette: { cloth: '#1F2A4A', stole: '#B89A5A', turban: '#E9D7A6' } }).svg, 248, 380, .98, 'rc-groom');
      s += place(P.bride({ pose: { armL: [-20, 126], armR: [20, -126] }, palette: { cloth: '#6E1E5A', sleeve: '#6E1E5A', veil: '#B8336A' } }).svg, 352, 380, .98, 'rc-bride');
    }
    return `<div class="scene-wrap"><canvas class="scene-fx" aria-hidden="true"></canvas><svg class="scene scene--reception" viewBox="0 0 600 420" aria-hidden="true">${s}</svg></div>`;
  }
  function mountReception(root) {
    const cv = root.querySelector('.scene-fx');
    if (cv) fireworks(cv, { every: 1.4, maxY: .35, colors: ['#FFFFFF', '#E9D7A6', '#FF8DB6', '#8FD3FF', '#FFD36B'] });
    const svg = root.querySelector('.scene--reception');
    const pair = svg.querySelector('.rc-couple');
    if (pair) {
      const T0 = pair.getAttribute('transform');
      animate(svg, (t) => { const bow = Math.max(0, Math.sin(t * .9)) ** 6; pair.setAttribute('transform', `${T0} rotate(${f(Math.sin(t * .8) * .4)}) scale(1 ${f(1 - bow * .012)})`); });
      return;
    }
    const g = svg.querySelector('.rc-groom'), b = svg.querySelector('.rc-bride');
    const gT = g.getAttribute('transform'), bT = b.getAttribute('transform');
    const gl = P.alive(g, 2), bl = P.alive(b, 5);
    animate(svg, (t) => {
      // a little bow of the namaste every few seconds
      const bow = Math.max(0, Math.sin(t * .9)) ** 6;
      g.setAttribute('transform', `${gT} rotate(${f(Math.sin(t * .8) * .4)})`);
      b.setAttribute('transform', `${bT} rotate(${f(Math.sin(t * .8 + 1) * .4)})`);
      gl(t, { tilt: bow * 7 });
      bl(t, { tilt: -bow * 7 });
    });
  }
  /* ==========================================================
     RANGOLI — drawn, then filled with colour, for the RSVP
     ========================================================== */
  function rangoli() {
    const c = 200, P = (a, r) => [c + r * Math.cos(a), c + r * Math.sin(a)];
    const petal = (a, r0, r1, w) => {
      const [x0, y0] = P(a, r0), [x1, y1] = P(a, r1), [mx, my] = P(a, (r0 + r1) / 2);
      const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
      return `M${f(x0)} ${f(y0)}Q${f(mx + nx)} ${f(my + ny)} ${f(x1)} ${f(y1)}Q${f(mx - nx)} ${f(my - ny)} ${f(x0)} ${f(y0)}Z`;
    };
    const layers = [
      { n: 8, r0: 10, r1: 52, w: 18, col: '#F2B318' },
      { n: 8, r0: 30, r1: 70, w: 16, col: '#E0337A', off: Math.PI / 8 },
      { n: 16, r0: 74, r1: 112, w: 11, col: '#2F8A5A' },
      { n: 16, r0: 96, r1: 140, w: 10, col: '#E8792B', off: Math.PI / 16 },
      { n: 24, r0: 146, r1: 176, w: 8, col: '#4161C8' }
    ];
    let s = '';
    s += `<circle class="rg-fill" cx="${c}" cy="${c}" r="186" fill="#8E1F12" style="--d:0s"/>`;
    layers.forEach((L, li) => {
      let d = '';
      for (let i = 0; i < L.n; i++) d += petal(i / L.n * Math.PI * 2 + (L.off || 0), L.r0, L.r1, L.w);
      s += `<path class="rg-fill" d="${d}" fill="${L.col}" style="--d:${1.2 + (layers.length - li) * .35}s"/>`;
      s += `<path class="rg-line" d="${d}" style="--d:${li * .3}s"/>`;
    });
    s += `<circle class="rg-fill" cx="${c}" cy="${c}" r="10" fill="#F6EFE3" style="--d:3s"/>`;
    let dots = '';
    for (let i = 0; i < 48; i++) { const [x, y] = P(i / 48 * Math.PI * 2, 190); dots += circ(x, y, 3); }
    s += `<path class="rg-fill" d="${dots}" fill="#F6EFE3" style="--d:3.2s"/>`;
    s += `<circle class="rg-line" cx="${c}" cy="${c}" r="182" style="--d:1.4s"/>`;
    [[c, 6], [394, c], [c, 394], [6, c]].forEach(([x, y], i) => { s += `<use class="rg-fill" href="#diya" x="${x - 22}" y="${y - 22}" width="44" height="37" style="--d:${3.4 + i * .15}s;--fd:${-i * .3}s"/>`; });
    return `<svg class="rangoli" viewBox="-20 -20 440 440" aria-hidden="true">${s}</svg>`;
  }

  /* ==========================================================
     The gate — carved doors that swing open
     ========================================================== */
  /* ==========================================================
     GATE — a carved archway with two doors (olive panels, brass
     studs, a sunburst under the arch), a marigold garland, and a
     plaque hung on the doors. The doors swing open on a tap.
     Geometry is in a 620 × 1000 box; the doors fill the opening.
     ========================================================== */
  // a five-lobed (cusped) Mughal arch: top-left at x,y, width w, sides down to y+h
  const CUSP = [[7, 50], [12.73, 28.29], [28.42, 12.23], [50, 6], [71.58, 12.23], [87.27, 28.29], [93, 50]];
  function cuspArch(x, y, w, h, close = true) {
    const k = w / 86, P = (q) => `${f(x + (q[0] - 7) * k)} ${f(y + (q[1] - 6) * k)}`, r = f(12.58 * k);
    let d = `M${f(x)} ${f(y + h)}L${P(CUSP[0])}`;
    for (let i = 1; i < CUSP.length; i++) d += `A${r} ${r} 0 0 1 ${P(CUSP[i])}`;
    return d + (close ? `L${f(x + w)} ${f(y + h)}Z` : `L${f(x + w)} ${f(y + h)}`);
  }
  const GATE = { W: 620, H: 1000, ox: 60, oy: 110, ow: 500 };
  function gateDoor(side) {
    const W = 250, H = 890, id = 'gd' + side, G = `url(#${id}-gold)`;
    let s = `<defs>
      <linearGradient id="${id}-wood" x1="0" x2="1"><stop offset="0" stop-color="#4A1906"/><stop offset=".5" stop-color="#7A3313"/><stop offset="1" stop-color="#521D08"/></linearGradient>
      <linearGradient id="${id}-olive" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#86943B"/><stop offset=".55" stop-color="#5E6A24"/><stop offset="1" stop-color="#48521A"/></linearGradient>
      <linearGradient id="${id}-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE9A6"/><stop offset=".5" stop-color="#D9A63E"/><stop offset="1" stop-color="#8A5F18"/></linearGradient>
      <radialGradient id="${id}-stud" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFF4C6"/><stop offset=".45" stop-color="#E0AE48"/><stop offset="1" stop-color="#6E4A12"/></radialGradient>
      <filter id="${id}-lift" x="-10%" y="-10%" width="125%" height="125%"><feDropShadow dx="1.5" dy="3" stdDeviation="2.2" flood-color="#1A0802" flood-opacity=".55"/></filter>
      <filter id="${id}-sink" x="0" y="0" width="100%" height="100%"><feFlood flood-color="#1A0802"/><feComposite in2="SourceAlpha" operator="out"/><feGaussianBlur stdDeviation="5"/><feComposite in2="SourceAlpha" operator="in" result="s"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
    </defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#${id}-wood)"/>`;
    for (let x = 8; x < W; x += 13) s += `<path d="M${x} 0C${x + 3} 300 ${x - 3} 600 ${x + 1} ${H}" stroke="#000" stroke-opacity=".07" stroke-width="2" fill="none"/>`;
    s += `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none" stroke="#2E0F03" stroke-width="3"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" fill="none" stroke="#C9973A" stroke-width="1.2" stroke-opacity=".6"/>`;
    // the sunburst carved into the arch, half on each door (its centre is on the seam)
    const cx = W, cy = 330;
    let rays = '';
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i * Math.PI / 24; rays += `M${f(cx + Math.cos(a) * 46)} ${f(cy + Math.sin(a) * 46)}L${f(cx + Math.cos(a) * 205)} ${f(cy + Math.sin(a) * 205)}`; }
    s += `<g filter="url(#${id}-lift)"><path d="M${cx - 215} ${cy}A215 215 0 0 1 ${cx} ${cy - 215}V${cy}Z" fill="url(#${id}-olive)"/><path d="${rays}" stroke="${G}" stroke-width="2.4"/>`;
    s += `<path d="M${cx - 215} ${cy}A215 215 0 0 1 ${cx} ${cy - 215}" fill="none" stroke="${G}" stroke-width="4"/><path d="M${cx - 46} ${cy}A46 46 0 0 1 ${cx} ${cy - 46}V${cy}Z" fill="${G}"/><path d="M${cx - 30} ${cy}A30 30 0 0 1 ${cx} ${cy - 30}" fill="none" stroke="#7A3313" stroke-width="2"/></g>`;
    s += `<rect x="12" y="${cy}" width="${W - 12}" height="16" fill="#4A1906"/><path d="M12 ${cy + 8}H${W}" stroke="${G}" stroke-width="3" stroke-dasharray="0 12" stroke-linecap="round"/>`;
    // the three olive panels: an arched niche, a band, a lattice
    const panel = (d, deco) => `<g filter="url(#${id}-lift)"><path d="${d}" fill="url(#${id}-olive)" filter="url(#${id}-sink)"/><path d="${d}" fill="none" stroke="${G}" stroke-width="3"/>${deco}</g>`;
    const nx = 34, nw = 182;
    let lotus = '';
    [[-60, 1], [-30, 1.06], [0, 1.12], [30, 1.06], [60, 1]].forEach(([a, k]) => { lotus += `<path d="M0 0C-13 -20 -11 -46 0 -${f(60 * k)}C11 -46 13 -20 0 0Z" transform="rotate(${a})"/>`; });
    const nCx = nx + nw / 2;
    s += panel(cuspArch(nx, 372, nw, 226), `<g transform="translate(${nCx} 540)" fill="none" stroke="${G}" stroke-width="2.4">${lotus}<path d="M-46 8H46" stroke-width="3"/><circle cy="18" r="5" fill="${G}"/></g>` +
      `<path d="${cuspArch(nx + 14, 388, nw - 28, 196, false)}" fill="none" stroke="#E9C26A" stroke-width="1.2" stroke-dasharray="1 6" stroke-linecap="round"/>`);
    let ros = '';
    for (let i = 0; i < 8; i++) ros += `<ellipse cy="-15" rx="6" ry="13" transform="rotate(${i * 45})"/>`;
    s += panel(`M${nx} 622H${nx + nw}V722H${nx}Z`, `<g transform="translate(${nCx} 672)" fill="none" stroke="${G}" stroke-width="2.2">${ros}<circle r="5" fill="${G}"/></g>` +
      [-62, 62].map((dx) => `<path d="M${nCx + dx} 656l10 16l-10 16l-10 -16Z" fill="${G}"/>`).join(''));
    let jaal = '';
    for (let k = -4; k <= 4; k++) jaal += `M${nx + nw / 2 + k * 30 - 90} 746l90 120M${nx + nw / 2 + k * 30 + 90} 746l-90 120`;
    s += panel(`M${nx} 746H${nx + nw}V866H${nx}Z`, `<clipPath id="${id}-jc"><path d="M${nx + 8} 754H${nx + nw - 8}V858H${nx + 8}Z"/></clipPath><path d="${jaal}" clip-path="url(#${id}-jc)" stroke="${G}" stroke-width="1.6"/>`);
    // brass studs down the edges and across the rails, and a ring knocker by the seam
    let studs = '';
    for (let y = 40; y < H - 20; y += 40) studs += `<circle cx="20" cy="${y}" r="5.5"/><circle cx="${W - 12}" cy="${y}" r="5.5"/>`;
    [608, 734].forEach((y) => { for (let x = 50; x < W - 20; x += 34) studs += `<circle cx="${x}" cy="${y}" r="4.5"/>`; });
    s += `<g fill="url(#${id}-stud)" filter="url(#${id}-lift)">${studs}</g>`;
    s += `<g filter="url(#${id}-lift)"><path d="M${W - 30} 560l14 -10l14 10l-14 10Z" fill="${G}"/><circle cx="${W - 30}" cy="596" r="26" fill="none" stroke="${G}" stroke-width="7"/><circle cx="${W - 30}" cy="596" r="26" fill="none" stroke="#FFF2C0" stroke-width="1.4" stroke-dasharray="6 18" opacity=".7"/></g>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"${side === 'r' ? ' style="transform:scale(-1,1)"' : ''}>${s}</svg>`;
  }
  function gateFrame() {
    const { W, H, ox, oy, ow } = GATE;
    const outer = cuspArch(0, 26, W, H - 26), open = cuspArch(ox, oy, ow, H - oy);
    let s = `<defs>
      <linearGradient id="gf-stone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9E2A16"/><stop offset="1" stop-color="#6A160A"/></linearGradient>
      <linearGradient id="gf-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE9A6"/><stop offset=".5" stop-color="#D9A63E"/><stop offset="1" stop-color="#8A5F18"/></linearGradient>
      <filter id="gf-lift" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#1A0802" flood-opacity=".6"/></filter>
    </defs>`;
    // layered paper bands round the opening: maroon, gold, ivory, maroon
    s += `<path d="${outer}${open}" fill="url(#gf-stone)" fill-rule="evenodd" filter="url(#gf-lift)"/>`;
    [[12, '#F3E3C0', 5], [24, 'url(#gf-gold)', 4], [36, '#C2301C', 3]].forEach(([g, c, w]) => {
      s += `<path d="${cuspArch(g, 26 + g, W - g * 2, H - 26 - g)}" fill="none" stroke="${c}" stroke-width="${w}" filter="url(#gf-lift)"/>`;
    });
    s += `<path d="${cuspArch(ox - 8, oy - 8, ow + 16, H - oy + 8)}" fill="none" stroke="url(#gf-gold)" stroke-width="6" filter="url(#gf-lift)"/>`;
    s += `<path d="${cuspArch(ox - 20, oy - 20, ow + 40, H - oy + 20)}" fill="none" stroke="#FFE7A8" stroke-width="2.4" stroke-dasharray="0 11" stroke-linecap="round"/>`;
    // the garland over the arch is added once the frame is on the page (it follows the path)
    s += `<path class="gate__garland-path" d="${cuspArch(ox - 6, oy - 4, ow + 12, 260, false)}" fill="none"/><g class="gate__garland"></g>`;
    return `<svg class="gate__frame" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
  }
  function gate(inner = '') {
    const { W, H, ox, oy, ow } = GATE;
    // the doors are clipped to the arch (a clip path in the doors' own 0–1 box)
    const k = 1 / ow, ky = 1 / (H - oy);
    const clip = cuspArch(0, 0, ow, H - oy).replace(/-?\d+(\.\d+)?/g, (n, _, i, str) => n);
    const box = `left:${f(ox / W * 100)}%;width:${f(ow / W * 100)}%;top:${f(oy / H * 100)}%;height:${f((H - oy) / H * 100)}%;clip-path:url(#gate-clip)`;
    const clipSvg = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="gate-clip" clipPathUnits="objectBoundingBox"><path transform="scale(${f(k * 1e4) / 1e4} ${f(ky * 1e4) / 1e4})" d="${clip}"/></clipPath></svg>`;
    return `<div class="gate__wall" aria-hidden="true"></div>
      <div class="gate__arch">${clipSvg}<div class="gate__doors" aria-hidden="true" style="${box}"><div class="gate__door gate__door--l">${gateDoor('l')}</div><div class="gate__door gate__door--r">${gateDoor('r')}</div></div>${gateFrame()}${inner}</div>`;
  }
  // string marigolds along the arch once it's in the page
  function mountGate(root) {
    const path = root.querySelector('.gate__garland-path'), g = root.querySelector('.gate__garland');
    if (!path || !g) return;
    const L = path.getTotalLength();
    let s = '';
    for (let i = 0; i <= 34; i++) {
      const p = path.getPointAtLength(L * i / 34), sz = 22;
      s += `<use href="#marigold" x="${f(p.x - sz / 2)}" y="${f(p.y - sz / 2)}" width="${sz}" height="${sz}"${i % 3 === 1 ? YEL : i % 3 === 2 ? ' style="--m1:#C8102E;--m2:#E8354A;--m3:#7A0A16"' : ''}/>`;
    }
    // strings of flowers hanging down either side of the opening
    [GATE.ox - 6, GATE.ox + GATE.ow + 6].forEach((x) => {
      for (let k = 0; k < 9; k++) s += `<use href="#marigold" x="${f(x - 10)}" y="${f(372 + k * 19)}" width="20" height="20"${k % 2 ? YEL : ''}/>`;
      s += `<use href="#leaf" x="${f(x - 6)}" y="${f(372 + 9 * 19)}" width="12" height="30" style="--leaf:#3E6B2A"/>`;
    });
    g.innerHTML = s;
  }

  window.WIScenes = { setArt, art, cut, pedestal, animate, toran, palace, fairy, fireworks, petalsLoop, starsLoop, envelopesLoop, shower, hero, mountHero, haldi, mountHaldi, mehendi, mountMehendi, dhol, sangeet, mountSangeet, baraat, mountBaraat, reception, mountReception, rangoli, gate, mountGate, kalash, reduce };
})();
