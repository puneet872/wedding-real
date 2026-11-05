/* People: shaded, front-facing characters with faces, in the caricature style
   of Indian e-invites — the bride, the groom, guests, the dholi, and the
   groom's mare. Every figure is built from soft gradients for volume and has
   a simple rig (shoulder/elbow, hip/knee) so the scenes can make it dance.
   Feet stand on y = 0 and the figure faces the viewer. */
(function () {
  'use strict';
  const f = (n) => +n.toFixed(2);
  let uid = 0;

  /* ---------------- colour helpers ---------------- */
  const hex = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, k) => { const [r, g, b] = hex(h); return k >= 0 ? toHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k) : toHex(r * (1 + k), g * (1 + k), b * (1 + k)); };
  // cylinder shading across x (limbs, skirts, coats)
  const cyl = (id, c, light = .22, dark = -.38) => `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${shade(c, dark)}"/><stop offset=".3" stop-color="${shade(c, light)}"/><stop offset=".62" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, dark - .08)}"/></linearGradient>`;
  const vert = (id, c, top = .15, bot = -.3) => `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${shade(c, top)}"/><stop offset="1" stop-color="${shade(c, bot)}"/></linearGradient>`;
  const ball = (id, c) => `<radialGradient id="${id}" cx=".4" cy=".34" r=".78"><stop offset="0" stop-color="${shade(c, .3)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -.32)}"/></radialGradient>`;
  const GOLD = (id) => `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF0B0"/><stop offset=".45" stop-color="#E2B24C"/><stop offset="1" stop-color="#9A6A1E"/></linearGradient>`;

  const SKIN = { light: '#EDC29A', mid: '#D9A178', wheat: '#C98D62', deep: '#A86A42' };
  const skinOf = (v) => SKIN[v] || (/^#[0-9a-f]{6}$/i.test(v || '') ? v : null);

  /* the couple's look, from config (skin tone, outfit colours); applied to the
     bride and groom wherever they appear */
  const LOOK = { bride: {}, groom: {} };
  function setLook(o = {}) {
    const b = o.bride || {}, g = o.groom || {};
    LOOK.bride = { skin: skinOf(b.skin), cloth: b.lehenga, sleeve: b.lehenga, veil: b.dupatta };
    LOOK.groom = { skin: skinOf(g.skin), cloth: g.sherwani, sleeve: g.sherwani, turban: g.safa };
  }
  // what to take from LOOK: always the skin; the outfit only in the wedding clothes
  const lookFor = (who, outfit) => {
    const L = LOOK[who], r = {};
    if (L.skin) r.skin = L.skin;
    if (outfit) ['cloth', 'sleeve', 'veil', 'turban'].forEach((k) => { if (L[k]) r[k] = L[k]; });
    return r;
  };

  /* ---------------- limb shapes (drawn pointing down from 0,0) ---------------- */
  const seg = (L, w0, w1) => `M${f(-w0 / 2)} 0C${f(-w0 / 2 - .6)} ${f(L * .35)} ${f(-w1 / 2 - .4)} ${f(L * .75)} ${f(-w1 / 2)} ${f(L)}` +
    `C${f(-w1 / 2)} ${f(L + w1 * .55)} ${f(w1 / 2)} ${f(L + w1 * .55)} ${f(w1 / 2)} ${f(L)}` +
    `C${f(w1 / 2 + .4)} ${f(L * .75)} ${f(w0 / 2 + .6)} ${f(L * .35)} ${f(w0 / 2)} 0C${f(w0 / 2)} ${f(-w0 * .55)} ${f(-w0 / 2)} ${f(-w0 * .55)} ${f(-w0 / 2)} 0Z`;
  // a hand hanging from the wrist: palm, fingers together, thumb on the inside
  const HAND = 'M-5 -1C-6.2 4-6.4 9-6 12.6L-5.6 18.4C-5.2 21.2-2.4 22.4-.2 21.6L3.2 19.6C4.9 18.4 5.5 16.2 5.6 13.2C7.4 12.2 9.2 9.8 9 7.2C8.8 5.6 7.2 5.2 5.9 6.4C5.6 4 5.4 2 5.2 -1C3 -2.6-3 -2.6-5 -1Z';
  const handSVG = (skin, extra = '') => `<path d="${HAND}" fill="${skin}"/><path d="M-3.4 12.6C-1.6 13.6.6 13.6 2.6 12.8" fill="none" stroke="${shade(skin, -.3)}" stroke-width=".7" opacity=".7"/><path d="M-4.4 4C-4.4 9-4 13-3.6 16" fill="none" stroke="#fff" stroke-width="1.4" opacity=".16" stroke-linecap="round"/>${extra}`;

  /* rig: limbs live in nested groups; pose() sets their rotations.
     An angle of 0 points straight down; positive swings toward +x. */
  function limbSVG(name, sx, sy, L1, L2, upper, lower, end, a = [0, 0], flip) {
    return `<g data-j="${name}" transform="translate(${sx} ${sy})"><g data-r="${name}" transform="rotate(${f(-a[0])})">${upper}` +
      `<g data-j2="${name}" transform="translate(0 ${L1})"><g data-r2="${name}" transform="rotate(${f(-a[1])})">${lower}<g transform="translate(0 ${L2})${flip ? ' scale(-1 1)' : ''}">${end}</g></g></g></g></g>`;
  }
  function pose(el, angles) {
    Object.keys(angles).forEach((k) => {
      const a = angles[k];
      const r1 = el.querySelector(`[data-r="${k}"]`), r2 = el.querySelector(`[data-r2="${k}"]`);
      if (r1) r1.setAttribute('transform', `rotate(${f(-a[0])})`);
      if (r2) r2.setAttribute('transform', `rotate(${f(-a[1])})`);
    });
  }
  // ready-made poses (angles for [upper, lower])
  const POSES = {
    brideRest: { armL: [3, 27], armR: [-3, -27] },
    manRest: { armL: [-4, 8], armR: [4, -8], legL: [-1, 0], legR: [1, 0] },
    namaste: { armL: [-20, 128], armR: [20, -128] },
    bhangra: { armL: [-132, -36], armR: [132, 36], legL: [-38, 46], legR: [2, 0] },
    wave: { armR: [62, 96] }
  };

  /* ---------------- heads ---------------- */
  // heads are drawn at life size, then enlarged around the neck for the caricature look
  const HS = 1.32, NECK = -242;
  const headWrap = (inner) => `<g class="head-rig"><g transform="translate(0 ${NECK}) scale(${HS}) translate(0 ${-NECK})">${inner}</g></g>`;

  function eye(id, x, o, female, skin) {
    // o: which way is "outward" (-1 = viewer's left, +1 = viewer's right)
    const y = -266.2, top = female ? 5.6 : 4.6, bot = female ? 3.6 : 3.1;
    const xi = x - o * 5.2, xo = x + o * 5.6;
    const white = `M${f(xi)} ${y}C${f(x - o * 2.6)} ${f(y - top)} ${f(x + o * 3)} ${f(y - top)} ${f(xo)} ${f(y - .8)}C${f(x + o * 2.6)} ${f(y + bot)} ${f(x - o * 2.4)} ${f(y + bot)} ${f(xi)} ${y}Z`;
    const cid = `${id}-eye${o < 0 ? 'l' : 'r'}`;
    const ix = x + o * .1, iy = y - .9, ir = female ? 3.25 : 2.9;
    let s = `<clipPath id="${cid}"><path d="${white}"/></clipPath>`;
    s += `<path d="${white}" fill="#FFF9F2"/>`;
    s += `<g clip-path="url(#${cid})"><g class="look"><circle cx="${f(ix)}" cy="${f(iy)}" r="${ir}" fill="url(#${id}-iris)"/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir * .46)}" fill="#120804"/>` +
      `<circle cx="${f(ix + 1.1)}" cy="${f(iy - 1.2)}" r="1.05" fill="#fff"/><circle cx="${f(ix - .9)}" cy="${f(iy + 1.1)}" r=".45" fill="#fff" opacity=".85"/></g>` +
      `<path d="M${f(xi)} ${f(y - 1.4)}C${f(x - o * 2.6)} ${f(y - top - 1)} ${f(x + o * 3)} ${f(y - top - 1)} ${f(xo)} ${f(y - 2.2)}" fill="none" stroke="#3A1A10" stroke-opacity=".28" stroke-width="2.6"/></g>`;
    // the lid that blinks (hidden until a blink)
    s += `<path class="lid" d="M${f(xi - o * .2)} ${f(y + .2)}C${f(x - o * 2.6)} ${f(y - top - .4)} ${f(x + o * 3)} ${f(y - top - .4)} ${f(xo + o * .2)} ${f(y - .8)}C${f(x + o * 2.6)} ${f(y + bot + .6)} ${f(x - o * 2.4)} ${f(y + bot + .6)} ${f(xi - o * .2)} ${f(y + .2)}Z" fill="${shade(skin, -.06)}" opacity="0"/>`;
    // lash line, wing, lower lid
    s += `<path d="M${f(xi - o * .3)} ${f(y + .3)}C${f(x - o * 2.6)} ${f(y - top - .3)} ${f(x + o * 3)} ${f(y - top - .3)} ${f(xo + o * .5)} ${f(y - 1)}" fill="none" stroke="#1A0D08" stroke-width="${female ? 1.8 : 1.3}" stroke-linecap="round"/>`;
    if (female) s += `<path d="M${f(xo + o * .3)} ${f(y - 1)}L${f(xo + o * 2.2)} ${f(y - 2.8)}" stroke="#1A0D08" stroke-width="1.2" stroke-linecap="round"/>`;
    s += `<path d="M${f(xi + o * .8)} ${f(y + .9)}C${f(x - o * 1.6)} ${f(y + bot + .4)} ${f(x + o * 2.2)} ${f(y + bot + .3)} ${f(xo - o * .4)} ${f(y - .1)}" fill="none" stroke="${shade(skin, -.4)}" stroke-width=".7" opacity=".55"/>`;
    // brow, raised a little (happy)
    s += `<path d="M${f(x - o * 5.2)} ${f(y - 7.4)}C${f(x - o * 1.8)} ${f(y - 11)} ${f(x + o * 2.6)} ${f(y - 11.2)} ${f(x + o * 6.2)} ${f(y - 8)}" fill="none" stroke="#2A160C" stroke-width="${female ? 1.35 : 1.8}" stroke-linecap="round"/>`;
    return s;
  }

  function face(p, female, id) {
    const shape = female
      ? 'M0 -289C10.8 -289 17.6 -282 17.6 -270C17.6 -258.4 14.6 -250.4 9.6 -245.4C6.4 -242.2 3.2 -240.8 0 -240.8C-3.2 -240.8 -6.4 -242.2 -9.6 -245.4C-14.6 -250.4 -17.6 -258.4 -17.6 -270C-17.6 -282 -10.8 -289 0 -289Z'
      : 'M0 -291C11.6 -291 18.6 -283.6 18.6 -271C18.6 -258.4 16 -249.6 10.4 -244.2C7 -241 3.4 -239.6 0 -239.6C-3.4 -239.6 -7 -241 -10.4 -244.2C-16 -249.6 -18.6 -258.4 -18.6 -271C-18.6 -283.6 -11.6 -291 0 -291Z';
    let s = '';
    // ears
    [-1, 1].forEach((o) => { s += `<path d="M${17 * o} -270C${21.6 * o} -272 ${22.4 * o} -264 ${21 * o} -260C${20 * o} -257 ${18 * o} -256.4 ${16.4 * o} -258Z" fill="url(#${id}-skinF)"/><path d="M${18.4 * o} -266.6C${20 * o} -266 ${20.2 * o} -262.6 ${19 * o} -260.6" fill="none" stroke="${shade(p.skin, -.35)}" stroke-width=".7"/>`; });
    s += `<path d="${shape}" fill="url(#${id}-skinF)" stroke="${shade(p.skin, -.32)}" stroke-width=".6" stroke-opacity=".7"/>`;
    // shading under the hairline and along the jaw
    s += `<path d="M-14 -246.6C-8 -241 8 -241 14 -246.6C10 -242.6 4 -240.8 0 -240.8C-4 -240.8 -10 -242.6 -14 -246.6Z" fill="${shade(p.skin, -.25)}" opacity=".35"/>`;
    // blush
    s += `<ellipse cx="-10.4" cy="-256.6" rx="4.6" ry="2.8" fill="url(#${id}-blush)"/><ellipse cx="10.4" cy="-256.6" rx="4.6" ry="2.8" fill="url(#${id}-blush)"/>`;
    s += `<g class="eyes">${eye(id, -7.4, -1, female, p.skin)}${eye(id, 7.4, 1, female, p.skin)}</g>`;
    // nose: bridge shadow, nostrils, a highlight on the tip
    s += `<path d="M-1.2 -262.4C-1.8 -259.4 -3 -257.2 -2.4 -255.6C-1.4 -254.4 1.4 -254.4 2.6 -255.4" fill="none" stroke="${shade(p.skin, -.36)}" stroke-width="1" stroke-linecap="round"/>`;
    s += `<ellipse cx=".4" cy="-256.8" rx="1.3" ry=".9" fill="#fff" opacity=".28"/>`;
    if (female) {
      s += `<path d="M-5 -250.4C-2 -249.6 2 -249.6 5 -250.4C3.6 -246.6 -3.6 -246.6 -5 -250.4Z" fill="#6A1420"/>`;
      s += `<path d="M-3.8 -250C-1.4 -249.5 1.4 -249.5 3.8 -250C2.6 -249 -2.6 -249 -3.8 -250Z" fill="#FFF8F0"/>`;
      s += `<path d="M-5.4 -250.4C-3.4 -252.4 -1.2 -252.2 0 -251.3C1.2 -252.2 3.4 -252.4 5.4 -250.4C2 -249.7 -2 -249.7 -5.4 -250.4Z" fill="url(#${id}-lip)"/>`;
      s += `<path d="M-4 -248.6C-2.2 -245.8 2.2 -245.8 4 -248.6C2.4 -247.2 -2.4 -247.2 -4 -248.6Z" fill="url(#${id}-lip)"/><path d="M-1.4 -247h2.6" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".45"/>`;
      s += `<path d="M-5.8 -250.4l-.8 -.9M5.8 -250.4l.8 -.9" stroke="${shade(p.skin, -.35)}" stroke-width=".7" stroke-linecap="round"/>`;
    } else {
      s += `<path d="M-5.2 -249C-2 -248.2 2 -248.2 5.2 -249C3.4 -244.6 -3.4 -244.6 -5.2 -249Z" fill="#5A1A16"/>`;
      s += `<path d="M-4.2 -248.7C-1.4 -248.1 1.4 -248.1 4.2 -248.7C2.8 -247.3 -2.8 -247.3 -4.2 -248.7Z" fill="#FFF8F0"/>`;
      s += `<path d="M-3.6 -245.9C-1.2 -244.8 1.2 -244.8 3.6 -245.9" fill="none" stroke="${shade(p.skin, -.3)}" stroke-width=".8" stroke-linecap="round"/>`;
      // moustache that curls up at the ends
      s += `<path d="M-8.4 -251.4C-6.6 -250.6 -5.6 -251.2 -4.6 -252.6C-3 -254.4 -1 -253.8 0 -252.6C1 -253.8 3 -254.4 4.6 -252.6C5.6 -251.2 6.6 -250.6 8.4 -251.4C8 -249.8 5.8 -249 3.8 -249.6C2.2 -250.2 1 -250.4 0 -250.2C-1 -250.4 -2.2 -250.2 -3.8 -249.6C-5.8 -249 -8 -249.8 -8.4 -251.4Z" fill="#1E120C"/>`;
      s += `<path d="M-9.4 -244C-5 -239.2 5 -239.2 9.4 -244" fill="none" stroke="${shade(p.skin, -.22)}" stroke-width="1.2" opacity=".35"/>`;
    }
    return s;
  }

  /* ---------------- shared defs per character ---------------- */
  function defs(id, p) {
    return `<defs>
      <radialGradient id="${id}-skinF" cx=".42" cy=".36" r=".72"><stop offset="0" stop-color="${shade(p.skin, .2)}"/><stop offset=".62" stop-color="${p.skin}"/><stop offset="1" stop-color="${shade(p.skin, -.2)}"/></radialGradient>
      <radialGradient id="${id}-blush"><stop offset="0" stop-color="#E8645A" stop-opacity=".55"/><stop offset="1" stop-color="#E8645A" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}-iris" cx=".45" cy=".3" r=".75"><stop offset="0" stop-color="#9A6234"/><stop offset=".55" stop-color="#4E2A12"/><stop offset="1" stop-color="#1E0E06"/></radialGradient>
      <linearGradient id="${id}-lip" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C83A4A"/><stop offset="1" stop-color="#8E1A2C"/></linearGradient>
      ${cyl(id + '-skinC', p.skin, .15, -.25)}
      ${cyl(id + '-cloth', p.cloth)}
      ${cyl(id + '-sleeve', p.sleeve || p.cloth)}
      ${cyl(id + '-pants', p.pants || '#EFE3C8', .2, -.3)}
      ${vert(id + '-veil', p.veil || '#C8235F', .12, -.22)}
      ${cyl(id + '-veilC', p.veil || '#C8235F', .14, -.3)}
      ${ball(id + '-turban', p.turban || '#E8792B')}
      ${GOLD(id + '-gold')}
      ${cyl(id + '-stole', p.stole || '#7A1E2E')}
      <radialGradient id="${id}-hair" cx=".45" cy=".25" r=".8"><stop offset="0" stop-color="#4A2E22"/><stop offset=".5" stop-color="#1F120D"/><stop offset="1" stop-color="#0E0806"/></radialGradient>
      <pattern id="${id}-buti" width="14" height="16" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.1" fill="${p.zari || '#F2C76A'}"/><circle cx="10" cy="12" r="1.2" fill="${p.zari || '#F2C76A'}"/><circle cx="10" cy="12" r=".45" fill="${p.cloth}"/></pattern>
      <pattern id="${id}-bandhani" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".7" fill="#fff" opacity=".7"/><circle cx="4.5" cy="4.5" r=".7" fill="#fff" opacity=".5"/></pattern>
      <filter id="${id}-shadow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>`;
  }

  const ground = (id, w) => `<ellipse cx="0" cy="1" rx="${w}" ry="7" fill="#000" opacity=".25" filter="url(#${id}-shadow)"/>`;
  const flowerString = (d, n, a, b) => `<path d="${d}" fill="none" stroke="${a}" stroke-width="3.4" stroke-dasharray="0 3.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${b}" stroke-width="2.6" stroke-dasharray="0 7.2" stroke-dashoffset="3.6" stroke-linecap="round"/>`;

  /* ==========================================================
     BRIDE (and women guests: { guest: true })
     options: palette, seated, floral (haldi flower jewellery), pose
     ========================================================== */
  function bride(o = {}) {
    const id = 'br' + (++uid);
    const guest = !!o.guest, seated = !!o.seated, floral = !!o.floral;
    const veiled = !guest && o.veil !== false; // a dupatta over the head and a cape behind
    const isBride = !guest || o.who === 'bride';
    const pal = Object.assign({}, o.palette || {});
    if (isBride) { const L = lookFor('bride', !o.palette); Object.assign(pal, L.skin ? { skin: L.skin } : {}, o.palette ? {} : L); }
    const p = Object.assign({ skin: SKIN.mid, cloth: '#B3172C', sleeve: null, veil: '#D62E4C' }, pal);
    p.sleeve = p.sleeve || p.cloth;
    const SH = seated ? 96 : 0;
    const a = Object.assign({}, POSES.brideRest, o.pose || {});
    const G = `url(#${id}-gold)`;
    let s = defs(id, p) + ground(id, seated ? 100 : guest ? 52 : 80);

    // dupatta behind: a translucent cape that falls to the floor
    if (veiled) {
      const cape = seated
        ? 'M-36 -136C-50 -100 -78 -44 -102 -2H102C78 -44 50 -100 36 -136C32 -236 -32 -236 -36 -136Z'
        : 'M-36 -232C-44 -190 -52 -130 -64 -70C-70 -40 -76 -16 -80 0H80C76 -16 70 -40 64 -70C52 -130 44 -190 36 -232C32 -330 -32 -330 -36 -232Z';
      const edge = seated ? 'M-102 -2C-78 -44 -50 -100 -36 -136M102 -2C78 -44 50 -100 36 -136' : 'M-80 0C-76 -16 -70 -40 -64 -70C-52 -130 -44 -190 -36 -232M80 0C76 -16 70 -40 64 -70C52 -130 44 -190 36 -232';
      s += `<g class="cape"><path d="${cape}" fill="url(#${id}-veil)" opacity=".8"/><path d="${cape}" fill="url(#${id}-buti)" opacity=".35"/><path d="${edge}" fill="none" stroke="${G}" stroke-width="3.4"/><path d="${edge}" fill="none" stroke="#FFE7A8" stroke-width="1" stroke-dasharray="0 5" stroke-linecap="round" transform="translate(0 -3)"/></g>`;
    }

    // lehenga (standing) or a lap spread on the floor (seated)
    if (seated) {
      const lap = 'M-17 -94C-40 -90 -74 -70 -92 -38C-100 -22 -100 -6 -88 0H88C100 -6 100 -22 92 -38C74 -70 40 -90 17 -94Z';
      s += `<g class="skirt"><path d="${lap}" fill="url(#${id}-cloth)"/><path d="${lap}" fill="url(#${id}-buti)" opacity=".8"/>`;
      [-62, -30, 0, 30, 62].forEach((x) => { s += `<path d="M${f(x * .2)} -90L${x} -6" stroke="#000" stroke-opacity=".14" stroke-width="3"/>`; });
      s += `<ellipse cx="-44" cy="-34" rx="30" ry="16" fill="#fff" opacity=".1"/><ellipse cx="44" cy="-34" rx="30" ry="16" fill="#fff" opacity=".1"/>`;
      s += `<path d="M-93 -18C-40 -8 40 -8 93 -18L88 0H-88Z" fill="${G}"/><path d="M-88 -10C-40 -2 40 -2 88 -10" fill="none" stroke="${p.cloth}" stroke-width="2" stroke-dasharray="0 6" stroke-linecap="round"/></g>`;
    } else {
      const hw = guest ? 54 : 86;
      const skirt = `M-16 -192C-30 -152 ${-hw * .67} -72 ${-hw} -6C${-hw * .67} 4 ${hw * .67} 4 ${hw} -6C${hw * .67} -72 30 -152 16 -192Z`;
      s += `<g class="skirt"><path d="${skirt}" fill="url(#${id}-cloth)"/><path d="${skirt}" fill="url(#${id}-buti)" opacity=".85"/>`;
      [-.6, -.3, 0, .3, .6].forEach((k) => { const x = k * hw; s += `<path d="M${f(x * .18)} -188L${f(x)} -10" stroke="#000" stroke-opacity=".17" stroke-width="3"/><path d="M${f(x * .18 + 2)} -188L${f(x + 5)} -10" stroke="#fff" stroke-opacity=".1" stroke-width="2"/>`; });
      s += `<path d="M${-hw + 5} -18C-40 -10 40 -10 ${hw - 5} -18L${hw} -6C${hw * .67} 4 ${-hw * .67} 4 ${-hw} -6Z" fill="${G}"/>`;
      s += `<path d="M${-hw + 8} -12C-40 -4 40 -4 ${hw - 8} -12" fill="none" stroke="${p.cloth}" stroke-width="2" stroke-dasharray="0 6" stroke-linecap="round"/>`;
      if (!guest) s += `<path d="M-72 -32C-36 -25 36 -25 72 -32" fill="none" stroke="${G}" stroke-width="3"/><path d="M-66 -44C-33 -38 33 -38 66 -44" fill="none" stroke="#F2C76A" stroke-width="1.6" stroke-dasharray="1 5" stroke-linecap="round"/>`;
      // feet with alta peeking out
      s += `<path d="M-14 -2C-14 -6 -6 -6 -4 -3C-4 0 -12 1 -14 -2ZM14 -2C14 -6 6 -6 4 -3C4 0 12 1 14 -2Z" fill="#B8281A"/>`;
      s += '</g>';
    }

    // upper body (shifted down when seated)
    let u = '';
    u += `<path d="M-7 -246L-7.5 -228C-14 -227 -21 -225 -25 -222L-20 -210C-10 -205 10 -205 20 -210L25 -222C21 -225 14 -227 7.5 -228L7 -246Z" fill="url(#${id}-skinC)"/>`;
    u += `<ellipse cx="0" cy="-240" rx="7" ry="3" fill="#000" opacity=".12"/>`;
    u += `<path d="M-25 -223C-28.5 -219 -29 -210 -27 -203C-24 -197 -20 -193 -16 -190L16 -190C20 -193 24 -197 27 -203C29 -210 28.5 -219 25 -223C19 -212 10 -207 0 -207C-10 -207 -19 -212 -25 -223Z" fill="url(#${id}-cloth)"/>`;
    u += `<path d="M-25 -223C-19 -212 -10 -207 0 -207C10 -207 19 -212 25 -223" fill="none" stroke="${G}" stroke-width="2.6"/><path d="M-16 -191H16" stroke="${G}" stroke-width="3"/>`;
    // dupatta drape across the front, shoulder to hip
    u += `<path d="M14 -226C24 -216 30 -196 32 -170C30 -150 26 -128 22 -112L10 -114C14 -134 18 -156 18 -172C16 -190 8 -204 -2 -212Z" fill="url(#${id}-veilC)" opacity=".94"/>`;
    u += `<path d="M14 -226C24 -216 30 -196 32 -170C30 -150 26 -128 22 -112" fill="none" stroke="${G}" stroke-width="2.4"/>`;
    // necklaces
    if (floral) {
      u += flowerString('M-7.4 -232C-4 -228.5 4 -228.5 7.4 -232', 0, '#FFFDF5', '#F06A9A');
      u += flowerString('M-13 -226C-11 -212 11 -212 13 -226', 0, '#FFFDF5', '#F2B318');
    } else {
      u += `<path d="M-7.4 -232C-4 -228.5 4 -228.5 7.4 -232" fill="none" stroke="${G}" stroke-width="3.6"/><g fill="#C8102E"><circle cx="-4" cy="-229.6" r="1"/><circle cx="0" cy="-228.8" r="1.1"/><circle cx="4" cy="-229.6" r="1"/></g>`;
      if (!guest) u += `<path d="M-12 -226C-10 -213 10 -213 12 -226" fill="none" stroke="${G}" stroke-width="2"/><path d="M-12 -226C-10 -210 10 -210 12 -226" fill="none" stroke="#FFF8E8" stroke-width="1.6" stroke-dasharray="0 3" stroke-linecap="round"/><path d="M-2.2 -215.6h4.4l-2.2 5.2z" fill="#1E8A4E"/>`;
    }
    // arms (rigged)
    const upper = `<path d="${seg(38, 13, 11)}" fill="url(#${id}-sleeve)"/><path d="M-5.6 36C-2 38.4 2 38.4 5.6 36" fill="none" stroke="${G}" stroke-width="2.4"/>`;
    const bangles = floral
      ? [24, 28.4].map((y) => `<path d="M-4.8 ${y}C-2 ${y + 1.4} 2 ${y + 1.4} 4.8 ${y}" fill="none" stroke="#FFFDF5" stroke-width="3" stroke-dasharray="0 2.6" stroke-linecap="round"/>`).join('')
      : (guest ? [26, 29] : [20, 22.6, 25.2, 27.8, 30.4, 33]).map((y, i) => `<path d="M-4.6 ${y}C-2 ${y + 1.4} 2 ${y + 1.4} 4.6 ${y}" fill="none" stroke="${i % 2 ? '#F2C76A' : (guest ? '#F2C76A' : '#C8102E')}" stroke-width="2.2"/>`).join('');
    const lower = `<path d="${seg(34, 10, 8)}" fill="url(#${id}-skinC)"/>${bangles}`;
    const mehndi = guest ? '' : `<path d="M-2.6 6C-1 9 1 9 2.6 6M-3 12.6L2 18M-.4 9.8L3.6 13" stroke="#7A2E10" stroke-width=".9" fill="none" opacity=".7"/>`;
    const hand = handSVG(shade(p.skin, -.04), mehndi);
    u += limbSVG('armL', -22, -220, 38, 34, upper, lower, hand, a.armL, false);
    u += limbSVG('armR', 22, -220, 38, 34, upper, lower, hand, a.armR, true);

    // head
    let h = '';
    // hair volume behind the face
    h += `<path d="M-19.4 -262C-21.4 -284 -12 -294 0 -294C12 -294 21.4 -284 19.4 -262C19.8 -256 19 -251 17 -247H-17C-19 -251 -19.8 -256 -19.4 -262Z" fill="url(#${id}-hair)"/>`;
    if (!veiled) h += `<circle cx="${o.bunSide === 'r' ? 20 : -20}" cy="-246" r="9" fill="url(#${id}-hair)"/><path d="M${o.bunSide === 'r' ? 13 : -27} -250C${o.bunSide === 'r' ? 18 : -22} -254 ${o.bunSide === 'r' ? 24 : -16} -254 ${o.bunSide === 'r' ? 27 : -13} -250" fill="none" stroke="#FFFDF5" stroke-width="2.6" stroke-dasharray="0 3" stroke-linecap="round"/>`;
    h += face(p, true, id);
    // hair in front, centre parting
    h += `<path d="M-17.8 -262C-18.8 -279.4 -10.4 -290.4 0 -290.4C10.4 -290.4 18.8 -279.4 17.8 -262C15.8 -272 9.8 -279.4 1.4 -280.8L0 -278.6L-1.4 -280.8C-9.8 -279.4 -15.8 -272 -17.8 -262Z" fill="url(#${id}-hair)"/>`;
    h += `<path d="M-12 -283C-7 -286.6 -3 -287.4 -.6 -287" fill="none" stroke="#7A5A48" stroke-width="1" opacity=".6"/><path d="M12 -283C7 -286.6 3 -287.4 .6 -287" fill="none" stroke="#7A5A48" stroke-width="1" opacity=".4"/>`;
    // sindoor-free parting (she is not married yet), tikka, bindi
    if (floral) h += `<circle cx="0" cy="-282" r="2.6" fill="#FFFDF5"/><circle cx="0" cy="-282" r="1.2" fill="#F2B318"/>`;
    else if (!guest) h += `<path d="M0 -289V-284" stroke="${G}" stroke-width="1"/><circle cx="0" cy="-282.4" r="2.4" fill="${G}"/><circle cx="0" cy="-282.4" r="1.1" fill="#C8102E"/><path d="M-1.6 -280.4l1.6 2.6 1.6-2.6" fill="${G}"/>`;
    h += `<circle cx="0" cy="-275.4" r="1.25" fill="#C8102E"/>`;
    // earrings
    [-18, 18].forEach((x) => {
      if (floral) h += `<circle cx="${x}" cy="-257" r="2.2" fill="#FFFDF5"/><circle cx="${x}" cy="-252.6" r="1.8" fill="#F06A9A"/>`;
      else h += `<path d="M${x} -260v3" stroke="${G}" stroke-width="1"/><path d="M${x - 4} -250.4C${x - 4} -256.4 ${x + 4} -256.4 ${x + 4} -250.4Z" fill="${G}"/><path d="M${x - 4} -249.4h8" stroke="#F6EFE3" stroke-width="1.4" stroke-dasharray="0 2.6" stroke-linecap="round"/>`;
    });
    if (!guest && !floral) h += `<circle cx="4.4" cy="-254.4" r="2.6" fill="none" stroke="${G}" stroke-width=".85"/><circle cx="4.4" cy="-251.8" r=".7" fill="#F6EFE3"/><path d="M6.9 -255.4C10.6 -258 13.6 -263 15.2 -268" fill="none" stroke="${G}" stroke-width=".7" stroke-dasharray="1 1.4"/>`;
    // dupatta over the head, framing the face
    if (veiled) {
      h += `<path d="M-27 -232C-29 -262 -22 -292 0 -300C22 -292 29 -262 27 -232L19.6 -236C21.6 -258 17.6 -284 0 -291C-17.6 -284 -21.6 -258 -19.6 -236Z" fill="url(#${id}-veil)"/>`;
      h += `<path d="M-27 -232C-29 -262 -22 -292 0 -300C22 -292 29 -262 27 -232" fill="none" stroke="${G}" stroke-width="2.6"/>`;
      h += `<path d="M-19.6 -236C-21.6 -258 -17.6 -284 0 -291C17.6 -284 21.6 -258 19.6 -236" fill="none" stroke="${G}" stroke-width="1.6"/>`;
      h += `<path d="M-23.6 -234C-25 -260 -19 -288 0 -295.4C19 -288 25 -260 23.6 -234" fill="none" stroke="#FFE7A8" stroke-width="1.2" stroke-dasharray="0 4" stroke-linecap="round"/>`;
    }
    u += headWrap(h);
    s += SH ? `<g transform="translate(0 ${SH})">${u}</g>` : u;
    return { svg: `<g class="person person--${guest ? 'guest' : 'bride'}">${s}</g>`, id };
  }

  /* ==========================================================
     GROOM and MEN (baraatis, the dholi)
     options: kind (groom | baraati | dhol), palette, kurta, turban, sash,
              sehra, bare (hair, no safa), noLegs, pose
     ========================================================== */
  function man(o = {}) {
    const id = 'mn' + (++uid);
    const kind = o.kind || 'groom';
    const groomish = kind === 'groom';
    const look = (groomish || o.who === 'groom') ? lookFor('groom', groomish && !o.palette) : {};
    const p = Object.assign({
      skin: o.skin || SKIN.mid, cloth: groomish ? '#EFDDB4' : (o.kurta || '#2F6B8A'),
      sleeve: null, pants: groomish ? '#F3E8D2' : '#F1E6CF',
      turban: o.turban || (groomish ? '#D9356A' : '#E8792B'), stole: '#7A1E2E'
    }, look, o.palette || {}, look.skin ? { skin: look.skin } : {});
    p.sleeve = p.sleeve || p.cloth;
    const a = Object.assign({}, POSES.manRest, o.pose || {});
    const G = `url(#${id}-gold)`;
    const hem = groomish ? -86 : -106;
    let s = defs(id, p) + (o.noLegs ? '' : ground(id, 46));
    // legs (rigged): churidar with gathers, mojari
    if (!o.noLegs) {
      const thigh = `<path d="${seg(52, 15, 12)}" fill="url(#${id}-pants)"/>`;
      const shin = `<path d="${seg(48, 12, 9.4)}" fill="url(#${id}-pants)"/>` + [32, 36, 40, 44].map((y) => `<path d="M-4.8 ${y}C-2 ${y + 1.6} 2 ${y + 1.6} 4.8 ${y}" fill="none" stroke="${shade(p.pants, -.25)}" stroke-width=".9"/>`).join('');
      const shoe = `<path d="M-6 2C-7 -1 -4 -3 0 -3C4 -3 6 0 9 1C12 2 14 0 15 -2C16 3 12 6 6 6H-4C-6 6 -6.6 4 -6 2Z" fill="${G}"/><path d="M-4 1.6C0 .6 6 1.6 10 3.4" fill="none" stroke="#9A2A1E" stroke-width="1" stroke-dasharray="0 2.4" stroke-linecap="round"/>`;
      s += limbSVG('legL', -9, -104, 52, 48, thigh, shin, `<g transform="scale(-1 1)">${shoe}</g>`, a.legL);
      s += limbSVG('legR', 9, -104, 52, 48, thigh, shin, shoe, a.legR);
    }
    // coat (sherwani / kurta)
    const coat = `M-8 -234C-16 -232 -24 -230 -27.5 -226C-30 -200 -29 -160 -31 -122C-32 -108 -33 ${hem + 6} -35 ${hem}C-12 ${hem + 6} 12 ${hem + 6} 35 ${hem}C33 ${hem + 6} 32 -108 31 -122C29 -160 30 -200 27.5 -226C24 -230 16 -232 8 -234Z`;
    s += `<path d="${coat}" fill="url(#${id}-cloth)"/>`;
    if (groomish) {
      s += `<path d="${coat}" fill="url(#${id}-buti)" opacity=".5"/>`;
      s += `<path d="M-35 ${hem}C-12 ${hem + 6} 12 ${hem + 6} 35 ${hem}" fill="none" stroke="${G}" stroke-width="4"/>`;
      s += `<path d="M-33 ${hem - 8}C-12 ${hem - 2} 12 ${hem - 2} 33 ${hem - 8}" fill="none" stroke="#C9973A" stroke-width="1.4" stroke-dasharray="1 4" stroke-linecap="round"/>`;
      s += `<path d="M0 -228V${hem + 2}" stroke="#C9973A" stroke-width="1.2" opacity=".7"/>`;
      for (let y = -222; y < hem - 6; y += 13) s += `<circle cx="1.8" cy="${y}" r="1.8" fill="${G}"/>`;
      s += `<path d="M-20 -224C-16 -200 -10 -186 0 -176C10 -186 16 -200 20 -224" fill="none" stroke="#C9973A" stroke-width="1.6"/>`;
      s += `<path d="M-16 -222C-12 -204 -7 -194 0 -186C7 -194 12 -204 16 -222" fill="none" stroke="#C9973A" stroke-width="1" stroke-dasharray="1 3" stroke-linecap="round"/>`;
      // stole draped over the shoulder
      s += `<path d="M-22 -228C-14 -230 -6 -226 4 -212C14 -196 22 -176 30 -150L22 -146C14 -170 4 -192 -6 -206C-12 -214 -18 -220 -24 -222Z" fill="url(#${id}-stole)"/>`;
      s += `<path d="M-22 -228C-14 -230 -6 -226 4 -212C14 -196 22 -176 30 -150" fill="none" stroke="${G}" stroke-width="2"/>`;
      // layered pearl malas
      s += `<path d="M-9 -231C-12 -206 -4 -186 0 -182C4 -186 12 -206 9 -231" fill="none" stroke="#FFF8E8" stroke-width="2.6" stroke-dasharray="0 4" stroke-linecap="round"/>`;
      s += `<path d="M-8 -231C-10 -214 -4 -200 0 -197C4 -200 10 -214 8 -231" fill="none" stroke="#E9C46A" stroke-width="2" stroke-dasharray="0 3.4" stroke-linecap="round"/><circle cx="0" cy="-180" r="2.6" fill="#1E8A4E" stroke="${G}" stroke-width="1"/>`;
    } else {
      s += `<path d="M0 -230V-196" stroke="${G}" stroke-width="1.6"/>`;
      s += `<path d="M-35 ${hem}C-12 ${hem + 6} 12 ${hem + 6} 35 ${hem}" fill="none" stroke="${G}" stroke-width="2.6"/>`;
      if (o.jacket) s += `<path d="M-8 -232C-18 -230 -25 -228 -27 -224C-28 -200 -27 -170 -26 -150H-6L0 -196L6 -150H26C27 -170 28 -200 27 -224C25 -228 18 -230 8 -232L0 -214Z" fill="${o.jacket}"/><path d="M-26 -150H-6L0 -196L6 -150H26" fill="none" stroke="${G}" stroke-width="1.6"/>`;
      if (o.sash) s += `<path d="M-24 -226L28 -150" stroke="${o.sash}" stroke-width="9" stroke-linecap="round" opacity=".95"/>`;
    }
    // collar + neck
    s += `<path d="M-6.8 -248L-7.4 -230L7.4 -230L6.8 -248Z" fill="url(#${id}-skinC)"/><ellipse cx="0" cy="-241" rx="7" ry="3" fill="#000" opacity=".12"/>`;
    s += `<path d="M-8.6 -234H8.6V-227.6C3 -225.6 -3 -225.6 -8.6 -227.6Z" fill="url(#${id}-cloth)" stroke="${G}" stroke-width="1.6"/>`;
    // head
    let h = face(p, false, id);
    if (o.bare) {
      h += `<path d="M-18.8 -266C-20.6 -286 -10.6 -295 1 -295C12.6 -295 20.8 -286 18.8 -266C17.4 -276 13 -282 6 -283.4C1 -280 -8 -279.4 -14 -280C-16.8 -276 -18 -271 -18.8 -266Z" fill="url(#${id}-hair)"/>`;
    } else {
      h += `<path d="M-18.6 -270C-18.8 -262 -17.8 -256 -16.6 -253L-14.8 -262L-18 -278Z" fill="#1C100C"/><path d="M18.6 -270C18.8 -262 17.8 -256 16.6 -253L14.8 -262L18 -278Z" fill="#1C100C"/>`;
      // safa: a dome of wrapped folds with a tail at the back
      const dome = 'M-22 -276C-28 -292 -25 -312 -12 -320C-4 -325 4 -325 12 -320C25 -312 28 -292 22 -276C13 -282 6 -283 0 -283C-6 -283 -13 -282 -22 -276Z';
      h += `<clipPath id="${id}-dome"><path d="${dome}"/></clipPath><path d="${dome}" fill="url(#${id}-turban)"/><g clip-path="url(#${id}-dome)">`;
      for (let k = -3; k <= 3; k++) h += `<path d="M${-34 + k * 9} -270L${18 + k * 9} -330" stroke="${shade(p.turban, -.3)}" stroke-width="3.4" opacity=".5"/><path d="M${-31 + k * 9} -270L${21 + k * 9} -330" stroke="${shade(p.turban, .4)}" stroke-width="1.4" opacity=".5"/>`;
      if (groomish || o.bandhani) h += `<rect x="-30" y="-330" width="60" height="60" fill="url(#${id}-bandhani)"/>`;
      h += `<ellipse cx="-8" cy="-308" rx="9" ry="6" fill="#fff" opacity=".16"/></g>`;
      h += `<path d="M-22 -276C-13 -282 -6 -283 0 -283C6 -283 13 -282 22 -276" fill="none" stroke="${shade(p.turban, -.38)}" stroke-width="2.4"/>`;
      if (groomish) {
        h += `<path d="M-19 -284C-10 -292 10 -292 19 -284" fill="none" stroke="#FFF8E8" stroke-width="2" stroke-dasharray="0 3.4" stroke-linecap="round"/>`;
        h += `<path d="M0 -298C-3 -312 2 -328 12 -338C9 -324 6 -310 4 -298Z" fill="#FFFDF5"/><path d="M1 -300C2 -314 6 -326 11 -334" fill="none" stroke="#E2B24C" stroke-width=".8"/>`;
        h += `<ellipse cx="0" cy="-293" rx="4.6" ry="5.6" fill="${G}"/><circle cx="0" cy="-293.4" r="2.2" fill="#C8102E"/><path d="M-3 -287.6l3 5l3 -5" fill="none" stroke="${G}" stroke-width="1.2"/>`;
        if (o.sehra) {
          let sh = '';
          [-19.5, -16.5, -13.5, 13.5, 16.5, 19.5].forEach((x) => { sh += `M${x} -281V${f(-236 - (19.5 - Math.abs(x)) * 1.6)}`; });
          for (let x = -10.5; x <= 10.6; x += 3) sh += `M${f(x)} -281V-276`;
          h += `<path d="${sh}" stroke="#FFFDF5" stroke-width="2" stroke-dasharray="0 4.4" stroke-linecap="round" opacity=".95"/>`;
          h += `<path d="${sh}" stroke="#F2C76A" stroke-width="1.4" stroke-dasharray="0 4.4" stroke-dashoffset="2.2" stroke-linecap="round" opacity=".9"/>`;
        }
      } else {
        h += `<path d="M18 -300C26 -296 30 -286 28 -272C26 -280 22 -288 16 -292Z" fill="${shade(p.turban, -.15)}"/>`;
      }
    }
    // arms (rigged): long sleeves
    const upper = `<path d="${seg(40, 15, 12.6)}" fill="url(#${id}-sleeve)"/>`;
    const lower = `<path d="${seg(36, 12.4, 10)}" fill="url(#${id}-sleeve)"/><path d="M-5.4 32C-2 33.6 2 33.6 5.4 32" fill="none" stroke="${G}" stroke-width="2.6"/>`;
    let handL = handSVG(p.skin), handR = handL;
    if (kind === 'dhol') {
      handL += `<path d="M2 14C10 22 16 32 18 44" fill="none" stroke="#7A4A1E" stroke-width="3.2" stroke-linecap="round"/>`;
      handR += `<path d="M1 14L4 50" stroke="#EAD9B0" stroke-width="2" stroke-linecap="round"/>`;
    }
    if (o.holds) handR += o.holds;
    if (kind === 'dhol') s += `<path d="M-30 -150L-8 -232M30 -150L8 -232" stroke="#C8235F" stroke-width="3"/>`;
    s += headWrap(h);
    if (kind === 'dhol') s += dholSmall(id);
    s += limbSVG('armL', -24, -222, 40, 36, upper, lower, handL, a.armL, false);
    s += limbSVG('armR', 24, -222, 40, 36, upper, lower, handR, a.armR, true);
    return { svg: `<g class="person person--${kind}">${s}</g>`, id };
  }

  function dholSmall(id) {
    const cy = -132, w = 50, h = 25;
    let s = `<defs><linearGradient id="${id}-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9A4A1E"/><stop offset=".3" stop-color="#D27A3E"/><stop offset=".55" stop-color="#A4501F"/><stop offset="1" stop-color="#4E1C06"/></linearGradient></defs>`;
    s += `<path d="M${-w} ${cy - h}C${-w * .4} ${cy - h * 1.3} ${w * .4} ${cy - h * 1.3} ${w} ${cy - h}V${cy + h}C${w * .4} ${cy + h * 1.3} ${-w * .4} ${cy + h * 1.3} ${-w} ${cy + h}Z" fill="url(#${id}-wood)"/>`;
    let z = `M${-w + 4} ${cy - h + 3}`;
    for (let i = 1; i <= 8; i++) z += `L${f(-w + 4 + (2 * w - 8) * i / 8)} ${i % 2 ? cy + h - 3 : cy - h + 3}`;
    s += `<path d="${z}" fill="none" stroke="#F3E3C0" stroke-width="1.8"/>`;
    s += `<path d="M${-w + 8} ${cy - h * 1.08}C${-w * .3} ${cy - h * 1.3} ${w * .3} ${cy - h * 1.3} ${w - 8} ${cy - h * 1.08}" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/>`;
    s += `<ellipse cx="${-w}" cy="${cy}" rx="7" ry="${h + 1}" fill="#EAD7AE" stroke="#3A1606" stroke-width="2.4"/><ellipse cx="${w}" cy="${cy}" rx="6" ry="${h}" fill="#F6ECD6" stroke="#3A1606" stroke-width="2.2"/>`;
    return s;
  }

  /* ==========================================================
     THE MARE — a white horse in wedding finery, side view, with
     the groom riding (front-facing, sehra on). Legs are rigged.
     ========================================================== */
  function mare(o = {}) {
    const id = 'hr' + (++uid);
    const H = o.coat || '#F7F1E6', veil = o.veil || '#C8235F', G = `url(#${id}-gold)`;
    let s = `<defs>${GOLD(id + '-gold')}
      <linearGradient id="${id}-body" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="${H}"/><stop offset="1" stop-color="${shade(H, -.22)}"/></linearGradient>
      <linearGradient id="${id}-far" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${shade(H, -.16)}"/><stop offset="1" stop-color="${shade(H, -.32)}"/></linearGradient>
      ${cyl(id + '-leg', H, .2, -.25)}${cyl(id + '-legF', shade(H, -.18), .1, -.25)}
      ${vert(id + '-jhool', veil, .1, -.25)}
      <radialGradient id="${id}-mane" cx=".3" cy=".3" r=".9"><stop offset="0" stop-color="#6A5A50"/><stop offset="1" stop-color="#2A201C"/></radialGradient>
      <filter id="${id}-shadow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>`;
    s += `<ellipse cx="0" cy="2" rx="120" ry="9" fill="#000" opacity=".25" filter="url(#${id}-shadow)"/>`;
    const hoof = `<path d="M-6 -2H6L7.4 6H-7.4Z" fill="#3A2A1E"/><path d="M-6.4 -4H6.4" stroke="${G}" stroke-width="3"/>`;
    const legU = (far) => `<path d="${seg(48, 22, 10)}" fill="url(#${id}-${far ? 'legF' : 'leg'})"/><ellipse cx="0" cy="47" rx="6.4" ry="7" fill="url(#${id}-${far ? 'legF' : 'leg'})"/>`;
    const legL = (far) => `<path d="${seg(62, 8.6, 7.6)}" fill="url(#${id}-${far ? 'legF' : 'leg'})"/><ellipse cx="0" cy="52" rx="5.6" ry="6" fill="url(#${id}-${far ? 'legF' : 'leg'})"/><path d="M-5 40C-2 41.6 2 41.6 5 40" fill="none" stroke="${G}" stroke-width="2.6" stroke-dasharray="0 3" stroke-linecap="round"/>`;
    // far legs
    s += limbSVG('legFF', 46, -116, 48, 62, legU(true), legL(true), hoof);
    s += limbSVG('legHF', -58, -120, 48, 62, legU(true), legL(true), hoof);
    // tail
    s += `<g class="tail"><path d="M-84 -158C-108 -150 -116 -116 -108 -70C-106 -60 -96 -58 -94 -68C-98 -100 -92 -132 -78 -146Z" fill="url(#${id}-mane)"/></g>`;
    // body, neck and head
    s += `<path d="M66 -164C78 -150 78 -124 64 -112C44 -98 -24 -96 -56 -104C-84 -110 -94 -132 -92 -152C-90 -172 -70 -180 -46 -178C-14 -176 18 -178 40 -182C52 -184 60 -174 66 -164Z" fill="url(#${id}-body)"/>`;
    s += `<path d="M30 -176C40 -206 56 -236 78 -252C86 -258 94 -258 98 -252L104 -238C92 -222 84 -200 76 -176C72 -164 70 -154 64 -146Z" fill="url(#${id}-body)"/>`;
    s += `<path d="M84 -256C90 -262 100 -260 106 -252L134 -214C140 -206 138 -196 130 -194C122 -192 114 -194 108 -198C102 -202 98 -208 94 -216C88 -228 80 -246 84 -256Z" fill="url(#${id}-body)"/>`;
    s += `<path d="M110 -200C116 -198 124 -198 130 -200" fill="none" stroke="${shade(H, -.3)}" stroke-width="1.4"/><ellipse cx="128" cy="-205" rx="2" ry="1.4" fill="${shade(H, -.4)}"/>`;
    s += `<path d="M88 -258L90 -275L97 -258Z" fill="${H}"/><path d="M96 -258L100 -273L104 -256Z" fill="${shade(H, -.15)}"/>`;
    // eye with lashes
    s += `<ellipse cx="104" cy="-236" rx="3.4" ry="2.8" fill="#2A1E16"/><circle cx="105" cy="-237" r="1" fill="#fff"/><path d="M100.6 -238.6l-1.6-2M103 -239.6l-.6-2.4" stroke="#2A1E16" stroke-width=".9" stroke-linecap="round"/>`;
    // belly shading
    s += `<path d="M-56 -104C-24 -96 44 -98 64 -112C56 -104 30 -100 0 -100C-24 -100 -44 -100 -56 -104Z" fill="${shade(H, -.3)}" opacity=".5"/>`;
    // mane
    s += `<path d="M28 -178C36 -206 52 -236 76 -254C82 -258 88 -260 92 -258C88 -250 80 -246 76 -240C70 -232 66 -224 60 -216C56 -206 50 -200 46 -190C40 -182 34 -178 28 -178Z" fill="url(#${id}-mane)"/>`;
    // bridle, kalgi plume and forehead ornament
    s += `<path d="M90 -252C98 -236 112 -218 128 -202M98 -244L124 -218M112 -228L114 -206" fill="none" stroke="${G}" stroke-width="2.2"/>`;
    s += `<path d="M90 -258C86 -282 96 -300 112 -308C104 -292 100 -276 97 -258Z" fill="${veil}"/><path d="M92 -260C90 -280 98 -294 108 -302" fill="none" stroke="#FFE7A8" stroke-width="1" opacity=".7"/><circle cx="93" cy="-258" r="4" fill="${G}"/>`;
    s += `<path d="M96 -250l-4 12l8 0z" fill="${G}"/>`;
    // flower garland on the neck
    s += flowerString('M42 -182C52 -168 74 -170 92 -214', 0, '#F28C1A', '#FFFDF5');
    // jhool: the embroidered saddle cloth with a scalloped, tasselled edge
    s += `<path d="M-62 -176C-30 -180 10 -180 36 -178V-122H-62Z" fill="url(#${id}-jhool)"/>`;
    let sc = 'M-62 -122';
    for (let x = -62; x < 36; x += 9.8) sc += 'q4.9 10 9.8 0';
    s += `<path d="${sc}" fill="url(#${id}-jhool)" stroke="${G}" stroke-width="2.2"/>`;
    for (let x = -57.1; x < 36; x += 9.8) s += `<path d="M${f(x)} -114V-106" stroke="${G}" stroke-width="1.6"/><circle cx="${f(x)}" cy="-105" r="1.8" fill="${G}"/>`;
    s += `<path d="M-58 -170H32M-58 -130H32" stroke="${G}" stroke-width="2.4" stroke-dasharray="0 6" stroke-linecap="round"/>`;
    s += `<rect x="-34" y="-162" width="44" height="26" rx="3" fill="none" stroke="${G}" stroke-width="1.6"/><circle cx="-12" cy="-149" r="6" fill="none" stroke="${G}" stroke-width="1.4"/><circle cx="-12" cy="-149" r="2" fill="${G}"/>`;
    // near legs
    s += limbSVG('legFN', 54, -116, 48, 62, legU(false), legL(false), hoof);
    s += limbSVG('legHN', -48, -120, 48, 62, legU(false), legL(false), hoof);
    // rider
    if (o.rider !== false) {
      const g = man({ kind: 'groom', noLegs: true, sehra: true, palette: o.palette, pose: { armL: [-30, 70], armR: [26, -66] } });
      const sc2 = .64, hipY = -176;
      const pants = (o.palette && o.palette.pants) || '#F3E8D2';
      s += `<defs>${cyl(id + '-pants', pants, .2, -.3)}</defs>`;
      // the near leg hangs down the mare's side, foot in a gold stirrup
      s += `<g transform="translate(-8 ${hipY + 4})"><path d="M-10 -4C2 -6 12 0 14 12C16 26 15 42 13 56L1 56C2 42 2 30 0 20C-2 14 -8 10 -14 8Z" fill="url(#${id}-pants)"/>` +
        `<path d="M-1 56C-1 51 4 49 10 49C16 49 20 53 25 53C27 58 22 62 16 62H3C-1 62 -2 59 -1 56Z" fill="${G}"/><path d="M4 30C6 40 8 50 6 66" fill="none" stroke="${G}" stroke-width="1.2"/></g>`;
      s += `<g class="rider" transform="translate(-14 ${f(hipY + 92 * sc2)}) scale(${sc2})">${g.svg}</g>`;
    }
    return { svg: `<g class="mare">${s}</g>`, id };
  }

  /* life: blinking, glancing and a little head movement, driven by a scene's
     animation clock. alive(el) returns tick(t, opts) to call every frame. */
  function alive(el, seed = Math.random() * 10) {
    const lids = [...el.querySelectorAll('.lid')], looks = [...el.querySelectorAll('.look')];
    const head = el.querySelector('.head-rig');
    let nextBlink = 1 + seed % 3, closedUntil = 0, lookX = 0, lookTarget = 0, nextLook = 2 + seed % 4;
    return function tick(t, o = {}) {
      if (t > nextBlink) { closedUntil = t + .13; nextBlink = t + 2.4 + Math.random() * 3.6; }
      const shut = t < closedUntil;
      lids.forEach((l) => l.setAttribute('opacity', shut ? '1' : '0'));
      if (o.look != null) lookTarget = o.look;
      else if (t > nextLook) { lookTarget = [0, 0, 1, -1, .6][Math.floor(Math.random() * 5)] * (o.lookRange || 1.4); nextLook = t + 1.6 + Math.random() * 3; }
      lookX += (lookTarget - lookX) * .12;
      looks.forEach((g) => g.setAttribute('transform', `translate(${f(lookX)} 0)`));
      if (head) head.setAttribute('transform', `rotate(${f((o.tilt || 0) + Math.sin(t * .8 + seed) * (o.sway == null ? 1.6 : o.sway))} 0 ${NECK})`);
    };
  }

  window.WIPeople = { bride, man, mare, pose, alive, setLook, shade, SKIN, POSES, NECK };
})();
