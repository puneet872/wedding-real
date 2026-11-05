/* A realistic open hand (palm facing us, fingers up) for the mehendi scene,
   with soft 3D shading, creases, and a mehendi design that follows the anatomy. */
(function () {
  'use strict';
  const f = (n) => +n.toFixed(2);
  const rad = (d) => d * Math.PI / 180;

  // finger outline pointing up from (0,0)
  function fingerPath(L, wb, wt) {
    const r = wt / 2;
    return `M${f(-wb / 2)} 0C${f(-wb / 2 - 1)} ${f(-L * .35)} ${f(-wt / 2 - 1.5)} ${f(-L * .62)} ${f(-r)} ${f(-(L - r))}` +
      `C${f(-r)} ${f(-L - r * .25)} ${f(r)} ${f(-L - r * .25)} ${f(r)} ${f(-(L - r))}` +
      `C${f(wt / 2 + 1.5)} ${f(-L * .62)} ${f(wb / 2 + 1)} ${f(-L * .35)} ${f(wb / 2)} 0Z`;
  }
  // finger anatomy (left hand, palm towards viewer: little finger on the left, thumb on the right)
  const FINGERS = [
    { k: 'little', x: 151, y: 304, a: -7, L: 116, wb: 30, wt: 23 },
    { k: 'ring', x: 181, y: 282, a: -2.5, L: 152, wb: 31, wt: 25 },
    { k: 'middle', x: 212, y: 276, a: 1, L: 168, wb: 32, wt: 26 },
    { k: 'index', x: 243, y: 284, a: 5, L: 150, wb: 31, wt: 25 }
  ];
  const THUMB = { x: 283, y: 396, a: 16, L: 140, wb: 42, wt: 28 };
  // point in a finger's local coords -> hand coords
  const T = (F, px, py) => { const a = rad(F.a), c = Math.cos(a), s = Math.sin(a); return [F.x + px * c - py * s, F.y + px * s + py * c]; };

  function defs(id) {
    return `<defs>
      <radialGradient id="${id}-skin" cx=".55" cy=".55" r=".7"><stop offset="0" stop-color="#F0C7A0"/><stop offset=".6" stop-color="#DDA47A"/><stop offset="1" stop-color="#C08156"/></radialGradient>
      <linearGradient id="${id}-fing" x1="0" x2="1"><stop offset="0" stop-color="#C58A60"/><stop offset=".35" stop-color="#EBBE96"/><stop offset=".7" stop-color="#DCA47B"/><stop offset="1" stop-color="#B97B52"/></linearGradient>
      <filter id="${id}-in" x="-10%" y="-10%" width="120%" height="120%">
        <feFlood flood-color="#7A3E22" result="c"/>
        <feComposite in="c" in2="SourceAlpha" operator="out" result="o"/>
        <feGaussianBlur in="o" stdDeviation="7" result="b"/>
        <feComposite in="b" in2="SourceAlpha" operator="in" result="s"/>
        <feComponentTransfer in="s" result="s2"><feFuncA type="linear" slope=".75"/></feComponentTransfer>
        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s2"/></feMerge>
      </filter>
      <filter id="${id}-soft"><feGaussianBlur stdDeviation="2"/></filter>
      <filter id="${id}-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="${id}-drop" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="10"/><feOffset dx="10" dy="14"/><feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="${id}-red" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E0453A"/><stop offset=".5" stop-color="#A3121E"/><stop offset="1" stop-color="#6E0A12"/></linearGradient>
      <linearGradient id="${id}-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE7A0"/><stop offset=".45" stop-color="#D9A63E"/><stop offset="1" stop-color="#8A5F18"/></linearGradient>
      <linearGradient id="${id}-ivory" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFDF5"/><stop offset=".5" stop-color="#EDE2CC"/><stop offset="1" stop-color="#B8A88A"/></linearGradient>
    </defs>`;
  }

  // the hand itself (skin, creases, bangles)
  function outline() {
    const pt = (F, px, py) => T(F, px, py);
    const P2 = (p) => `${f(p[0])} ${f(p[1])}`;
    let d = 'M162 660L162 524C150 488 138 450 134 410C130 372 132 340 ' + P2(pt(FINGERS[0], -FINGERS[0].wb / 2, 6));
    FINGERS.forEach((F, i) => {
      const r = F.wt / 2;
      const lb = pt(F, -F.wb / 2, 0), lm = pt(F, -F.wb / 2 - .6, -F.L * .45), lu = pt(F, -r, -(F.L - r));
      const rb = pt(F, F.wb / 2, 0), rm = pt(F, F.wb / 2 + .6, -F.L * .45), ru = pt(F, r, -(F.L - r));
      const c1 = pt(F, -r, -F.L - r * .32), c2 = pt(F, r, -F.L - r * .32);
      if (i > 0) d += `Q${P2(pt(F, -F.wb / 2 - 3, 8))} ${P2(lb)}`;
      d += `C${P2(lm)} ${P2(pt(F, -r - .5, -F.L * .78))} ${P2(lu)}`;
      d += `C${P2(c1)} ${P2(c2)} ${P2(ru)}`;
      d += `C${P2(pt(F, r + .5, -F.L * .78))} ${P2(rm)} ${P2(rb)}`;
    });
    // web between index and thumb, the thumb, then the thenar mound to the wrist
    const Th = THUMB, r = Th.wt / 2;
    d += `C${P2(pt(FINGERS[3], FINGERS[3].wb / 2, 18))} 262 330 ${P2(pt(Th, -Th.wb / 2 + 4, -Th.L * .32))}`;
    d += `C${P2(pt(Th, -r - 1, -Th.L * .62))} ${P2(pt(Th, -r, -Th.L * .82))} ${P2(pt(Th, -r, -(Th.L - r)))}`;
    d += `C${P2(pt(Th, -r, -Th.L - r * .35))} ${P2(pt(Th, r, -Th.L - r * .35))} ${P2(pt(Th, r, -(Th.L - r)))}`;
    d += `C${P2(pt(Th, r + 2, -Th.L * .7))} ${P2(pt(Th, Th.wb / 2 + 2, -Th.L * .35))} ${P2(pt(Th, Th.wb / 2 + 1, -Th.L * .08))}`;
    d += 'C298 430 288 470 268 500C262 510 258 516 256 524L256 660Z';
    return d;
  }

  // the hand itself (skin, creases, bangles)
  function hand(id) {
    const o = outline();
    let skin = `<clipPath id="${id}-clip"><path d="${o}"/></clipPath><path d="${o}" fill="url(#${id}-skin)"/>`;
    // soft highlights on the thenar pad, the outer palm and the finger roots (kept inside the outline)
    skin += `<g clip-path="url(#${id}-clip)"><g filter="url(#${id}-blur)"><ellipse cx="262" cy="430" rx="22" ry="40" transform="rotate(-14 262 430)" fill="#F6D4B2" opacity=".55"/><ellipse cx="152" cy="420" rx="12" ry="44" fill="#F6D4B2" opacity=".35"/><ellipse cx="212" cy="330" rx="50" ry="14" fill="#F6D4B2" opacity=".3"/></g></g>`;
    let creases = '';
    for (let i = 0; i < 3; i++) {
      const A = FINGERS[i], B = FINGERS[i + 1];
      const p0 = T(A, A.wb / 2, 4), p1 = T(A, A.wb / 2 - 1, -A.L * .18);
      creases += `<path d="M${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}" stroke-width="2.4" opacity=".7"/>`;
    }
    // finger joint creases
    FINGERS.forEach((F) => {
      [.33, .62].forEach((k, i) => {
        const w = F.wb - (F.wb - F.wt) * k - 6;
        const [ax, ay] = T(F, -w / 2, -F.L * k), [bx, by] = T(F, w / 2, -F.L * k), [cx, cy] = T(F, 0, -F.L * k + 3);
        creases += `<path d="M${f(ax)} ${f(ay)}Q${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}" />`;
        if (i === 0) { const [a2x, a2y] = T(F, -w / 2 + 2, -F.L * k - 4), [b2x, b2y] = T(F, w / 2 - 2, -F.L * k - 4), [c2x, c2y] = T(F, 0, -F.L * k - 1); creases += `<path d="M${f(a2x)} ${f(a2y)}Q${f(c2x)} ${f(c2y)} ${f(b2x)} ${f(b2y)}" opacity=".6"/>`; }
      });
    });
    // palm lines
    creases += '<path d="M140 326C178 312 226 312 258 324"/><path d="M136 356C168 352 210 358 244 382"/><path d="M258 340C236 372 224 430 230 510" opacity=".8"/>';
    const shading = `<g filter="url(#${id}-in)">${skin}</g>` +
      `<g fill="none" stroke="#9A5E3A" stroke-width="1.6" stroke-linecap="round" opacity=".55" filter="url(#${id}-soft)">${creases}</g>`;
    // bangles (chooda): red and ivory with gold, drawn as rings around the wrist
    let bangles = '';
    const cols = ['red', 'red', 'ivory', 'red', 'gold', 'red', 'red', 'ivory', 'red', 'gold'];
    cols.forEach((c, i) => {
      const y = 562 + i * 8.2, rx = 51 + i * .6;
      bangles += `<path d="M${f(207 - rx)} ${f(y)}A${f(rx)} 9 0 0 0 ${f(207 + rx)} ${f(y)}" fill="none" stroke="url(#${id}-${c})" stroke-width="${c === 'gold' ? 5 : 7.5}" stroke-linecap="round"/>`;
      if (c === 'red') bangles += `<path d="M${f(207 - rx + 8)} ${f(y + 3)}A${f(rx - 8)} 7 0 0 0 ${f(207 + rx - 30)} ${f(y + 7)}" fill="none" stroke="#FFFFFF" stroke-width="1" opacity=".35"/>`;
      if (c === 'gold') bangles += `<path d="M${f(207 - rx)} ${f(y)}A${f(rx)} 9 0 0 0 ${f(207 + rx)} ${f(y)}" fill="none" stroke="#FFF3C4" stroke-width="1.6" stroke-dasharray="0 6" stroke-linecap="round"/>`;
    });
    return `<g class="hand-skin" filter="url(#${id}-drop)">${shading}</g>${bangles}`;
  }

  // mehendi lines + fills, following the hand
  function design() {
    const lines = [], fills = [];
    const L = (d, w = 1.8) => lines.push({ d, w });
    const C = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
    const circ = C;
    // palm mandala
    const cx = 209, cy = 412;
    const P = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const petal = (a, r0, r1, w) => { const [x0, y0] = P(a, r0), [x1, y1] = P(a, r1), [mx, my] = P(a, (r0 + r1) / 2); const nx = -Math.sin(a) * w, ny = Math.cos(a) * w; return `M${f(x0)} ${f(y0)}Q${f(mx + nx)} ${f(my + ny)} ${f(x1)} ${f(y1)}Q${f(mx - nx)} ${f(my - ny)} ${f(x0)} ${f(y0)}`; };
    fills.push(circ(cx, cy, 4));
    L(circ(cx, cy, 8), 1.6);
    for (let i = 0; i < 8; i++) L(petal(i * Math.PI / 4, 9, 30, 9), 1.7);
    for (let i = 0; i < 8; i++) L(petal(i * Math.PI / 4, 12, 25, 3.4), 1);
    L(circ(cx, cy, 36), 1.9); L(circ(cx, cy, 40), 1.2);
    for (let i = 0; i < 24; i++) { const [x, y] = P(i / 24 * Math.PI * 2, 44.5); fills.push(circ(x, y, 1.5)); }
    for (let i = 0; i < 16; i++) { const a0 = i / 16 * Math.PI * 2, a1 = (i + 1) / 16 * Math.PI * 2, [x0, y0] = P(a0, 47), [x1, y1] = P(a1, 47); L(`M${f(x0)} ${f(y0)}A9.5 9.5 0 0 1 ${f(x1)} ${f(y1)}`, 1.6); }
    for (let i = 0; i < 16; i++) { const [x, y] = P((i + .5) / 16 * Math.PI * 2, 58); fills.push(circ(x, y, 1.6)); }
    // paisleys (kairi) around — one carries the name
    let nameAt = null;
    // five paisleys fanning above the mandala, pointing outwards
    for (let i = 0; i < 5; i++) {
      const a = (-150 + i * 30) * Math.PI / 180, [x, y] = P(a, 68), deg = a * 180 / Math.PI;
      const tr = (px, py) => { const c = Math.cos(a), s = Math.sin(a), k = .78; return [x + (px * c - py * s) * k, y + (px * s + py * c) * k]; };
      const pts = [[-9, 0], [-9, -13], [9, -15], [19, -8], [29, -2], [35, -2], [43, -9], [37, 4], [25, 13], [11, 13], [-2, 13], [-9, 9], [-9, 0]].map(([px, py]) => tr(px, py));
      let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
      for (let k = 1; k + 2 < pts.length; k += 3) d += `C${f(pts[k][0])} ${f(pts[k][1])} ${f(pts[k + 1][0])} ${f(pts[k + 1][1])} ${f(pts[k + 2][0])} ${f(pts[k + 2][1])}`;
      L(d, 1.7);
      if (i === 3) nameAt = { x, y, deg };
      else { const q = [[3, 5], [9, -2], [15, 5], [21, -2], [27, 4]].map(([px, py]) => tr(px, py)); L('M' + q.map((p) => `${f(p[0])} ${f(p[1])}`).join('L'), 1.1); }
      const [dx, dy] = P(a + Math.PI / 10, 66); if (i < 4) fills.push(circ(dx, dy, 2));
    }
    // a jaali (net) on the heel of the palm
    for (let k = 0; k < 6; k++) {
      const x0 = 172 + k * 14;
      L(`M${x0} 478L${x0 + 14} 498L${x0 + 28} 478`, 1.1);
    }
    L('M170 476C196 470 222 470 252 476', 1.5); L('M170 500C196 494 222 494 252 500', 1.5);
    for (let i = 0; i < 8; i++) L(petal(i * Math.PI / 4 + Math.PI / 8, 52, 62, 3.2), 1.1);
    // leaves on the heel of the palm
    [[-30, 1], [30, -1]].forEach(([dx, dir]) => {
      const x0 = cx + dx * .3, y0 = cy + 58, x1 = cx + dx * 1.15, y1 = cy + 64;
      L(`M${f(x0)} ${f(y0)}Q${f((x0 + x1) / 2 + dir * 10)} ${f((y0 + y1) / 2 - 12)} ${f(x1)} ${f(y1)}Q${f((x0 + x1) / 2 - dir * 4)} ${f((y0 + y1) / 2 + 8)} ${f(x0)} ${f(y0)}`, 1.5);
    });
    // fingers: filled tips, bands, a little vine
    FINGERS.concat([Object.assign({ k: 'thumb' }, THUMB)]).forEach((F) => {
      const w = (k) => F.wb - (F.wb - F.wt) * k;
      // tip cap
      const k0 = .8, hw = w(k0) / 2 - 1;
      const [a0x, a0y] = T(F, -hw, -F.L * k0), [a1x, a1y] = T(F, hw, -F.L * k0);
      const [t0x, t0y] = T(F, -hw, -F.L + F.wt / 2), [t1x, t1y] = T(F, hw, -F.L + F.wt / 2), [tcx, tcy] = T(F, 0, -F.L - F.wt * .18);
      fills.push(`M${f(a0x)} ${f(a0y)}L${f(t0x)} ${f(t0y)}Q${f(tcx)} ${f(tcy)} ${f(t1x)} ${f(t1y)}L${f(a1x)} ${f(a1y)}Q${f(T(F, 0, -F.L * k0 + 4)[0])} ${f(T(F, 0, -F.L * k0 + 4)[1])} ${f(a0x)} ${f(a0y)}Z`);
      // bands near the joints
      [.6, .33].forEach((k) => {
        const hw2 = w(k) / 2 - 2;
        [-4, 4].forEach((o) => { const [ax, ay] = T(F, -hw2, -F.L * k + o), [bx, by] = T(F, hw2, -F.L * k + o), [mx, my] = T(F, 0, -F.L * k + o + 3); L(`M${f(ax)} ${f(ay)}Q${f(mx)} ${f(my)} ${f(bx)} ${f(by)}`, 1.5); });
        for (let j = -1; j <= 1; j++) { const [dx, dy] = T(F, j * hw2 * .55, -F.L * k); fills.push(circ(dx, dy, 1.3)); }
      });
      // leaf vine between the bands
      const [v0x, v0y] = T(F, 0, -F.L * .38), [v1x, v1y] = T(F, -5, -F.L * .47), [v2x, v2y] = T(F, 4, -F.L * .55);
      L(`M${f(v0x)} ${f(v0y)}Q${f(v1x)} ${f(v1y)} ${f(v2x)} ${f(v2y)}`, 1.2);
      const [lx, ly] = T(F, 4, -F.L * .45);
      fills.push(circ(lx, ly, 1.6));
    });
    // a vine with leaves up the outer edge of the palm
    L('M156 470C150 440 152 400 158 368C162 350 164 336 162 322', 1.4);
    [[154, 452, -1], [154, 424, 1], [156, 396, -1], [159, 370, 1], [162, 344, -1]].forEach(([x, y, dir]) => {
      const x1 = x + dir * 13, y1 = y - 9;
      L(`M${x} ${y}Q${f((x + x1) / 2 + dir * 2)} ${f(y - 12)} ${f(x1)} ${f(y1)}Q${f((x + x1) / 2)} ${f(y + 2)} ${x} ${y}`, 1.1);
    });
    // lattice (jaal) on the lowest segment of each finger
    FINGERS.forEach((F) => {
      const w = (k) => F.wb - (F.wb - F.wt) * k, hw = w(.15) / 2 - 3;
      for (let j = 0; j < 3; j++) {
        const y0 = -F.L * (.06 + j * .085), y1 = y0 - F.L * .085;
        const [ax, ay] = T(F, -hw, y0), [bx, by] = T(F, hw, y1), [cx2, cy2] = T(F, hw, y0), [ex, ey] = T(F, -hw, y1);
        L(`M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}M${f(cx2)} ${f(cy2)}L${f(ex)} ${f(ey)}`, .9);
      }
    });
    // wrist bands
    L('M164 512C196 504 226 504 256 512', 2); L('M164 522C196 514 226 514 256 522', 1.3);
    for (let x = 170; x < 254; x += 9) fills.push(circ(x, 517 - Math.sin((x - 164) / 92 * Math.PI) * 4.5, 1.6));
    L('M168 536C190 548 230 548 252 536', 1.5);
    return { lines, fills, nameAt };
  }

  window.WIHand = { defs, hand, design, FINGERS, THUMB };
})();
