/* Builds the whole page from window.WEDDING (assets/config.js), handles the
   Hindi / English switch, and wires up every interaction.
   You shouldn't need to edit this file to make a new invitation. */
(function () {
  'use strict';
  const C = window.WEDDING, S = window.WIScenes, P = window.WIPeople, A = window.WIAudio;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  /* ------------------------------------------------------------------
     Language
     ------------------------------------------------------------------ */
  const LANGS = ['en', 'hi'];
  let lang = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) return q;
    try { const s = localStorage.getItem('wi-lang'); if (LANGS.includes(s)) return s; } catch (e) {}
    return LANGS.includes(C.defaultLang) ? C.defaultLang : 'en';
  })();
  const store = [];
  const t = (v, l = lang) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (Array.isArray(v)) return v;
    const o = v[l];
    return o != null && o !== '' ? o : (v.en != null ? v.en : (v.hi != null ? v.hi : ''));
  };
  // T(): language-bound text; TA(): language-bound attribute
  const T = (v, tag = 'span', attrs = '') => `<${tag} data-t="${store.push(v) - 1}"${attrs}>${t(v)}</${tag}>`;
  // TA('placeholder', v) or TA(['data-a', v1], ['data-b', v2]) for several attributes at once
  const TA = (...args) => {
    const pairs = typeof args[0] === 'string' ? [[args[0], args[1]]] : args;
    return pairs.map(([a, v]) => ` ${a}="${esc(t(v))}"`).join('') + ` data-ta="${pairs.map(([a, v]) => `${a}:${store.push(v) - 1}`).join(';')}"`;
  };
  const U = C.ui;
  const DEV = '०१२३४५६७८९';
  const num = (n) => (lang === 'hi' ? String(n).replace(/\d/g, (d) => DEV[d]) : String(n));

  function applyLang(l) {
    lang = l;
    try { localStorage.setItem('wi-lang', l); } catch (e) {}
    document.documentElement.lang = l === 'hi' ? 'hi' : 'en';
    $$('[data-t]').forEach((el) => { el.innerHTML = t(store[+el.dataset.t]); });
    $$('[data-ta]').forEach((el) => {
      el.dataset.ta.split(';').forEach((pair) => { const [a, id] = pair.split(':'); el.setAttribute(a, t(store[+id])); });
    });
    $$('[data-lang-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langBtn === l)));
    document.title = `${t(C.couple.bride.first)} ${t(C.couple.joiner)} ${t(C.couple.groom.first)} · ${t(U.shubhVivah)}`;
    document.dispatchEvent(new CustomEvent('wi:lang', { detail: l }));
  }

  /* ------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------ */
  if (C.theme) {
    const r = document.documentElement.style;
    const map = { night: '--night', paper: '--paper', primary: '--primary', gold: '--gold', ink: '--ink' };
    Object.keys(map).forEach((k) => { if (C.theme[k]) r.setProperty(map[k], C.theme[k]); });
  }

  /* ------------------------------------------------------------------
     Pieces
     ------------------------------------------------------------------ */
  const B = C.couple.bride, G = C.couple.groom;
  // whose name comes first: the bride's (default) or, on a groom's-side invitation, the groom's
  const groomFirst = C.couple.first === 'groom';
  const [N1, N2] = groomFirst ? [G, B] : [B, G];
  // which sections to show (config.sections); anything not listed stays on
  const ON = Object.assign({ couple: true, events: true, vows: true, family: true, travel: true, rsvp: true }, C.sections || {});
  const MONO = C.couple.monogramImage || '';
  P.setLook({ bride: B.look, groom: G.look });
  S.setArt(C.art);
  const icon = {
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="ic-wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="ic-mute" d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="currentColor"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z" fill="currentColor"/></svg>'
  };

  function header() {
    const nav = ['invite', 'couple', 'events', 'family', 'travel'].filter((k) => k === 'invite' || ON[k]);
    return `<header class="hdr" id="hdr">
      <a class="brand" href="#home">${T(C.couple.monogram, 'span', ' class="brand__seal"')}<span class="brand__names">${T(N1.first)} ${T(C.couple.joiner, 'i')} ${T(N2.first)}</span></a>
      <nav class="nav" id="nav"${TA('aria-label', U.menu)}><ul>${nav.map((k) => `<li><a href="#${k}">${T(U.nav[k])}</a></li>`).join('')}</ul></nav>
      <div class="hdr__tools">
        <div class="lang" role="group"${TA('aria-label', U.language)}><button type="button" data-lang-btn="en" aria-pressed="false">EN</button><button type="button" data-lang-btn="hi" aria-pressed="false" lang="hi">हिं</button></div>
        <button class="icon-btn sound-btn" type="button" data-sound${TA('aria-label', U.sound)} aria-pressed="false">${icon.sound}</button>
        ${ON.rsvp ? `<a class="btn btn--primary btn--sm hdr__rsvp" href="#rsvp">${T(U.nav.rsvp)}</a>` : ''}
        <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="nav"${TA('aria-label', U.menu)}><span></span></button>
      </div>
    </header>`;
  }

  function gate() {
    const plaque = `<div class="gate__center">
        ${C.invocation ? T(C.invocation, 'p', ' class="gate__invocation"') : ''}
        ${MONO ? `<img class="gate__mono" src="${esc(MONO)}" alt="">` : `<div class="gate__seal">${T(C.couple.monogram)}</div>`}
        ${T(U.gateTitle, 'p', ' class="gate__title"')}
        <p class="gate__names">${T(N1.first)} <i>${T(C.couple.joiner)}</i> ${T(N2.first)}</p>
        <button class="btn btn--gold gate__open" type="button" data-open>${T(U.gateOpen)}</button>
        <p class="gate__hint">${icon.sound}${T(U.gateHint)}</p>
        <div class="lang lang--gate" role="group"${TA('aria-label', U.language)}><button type="button" data-lang-btn="en" aria-pressed="false">English</button><button type="button" data-lang-btn="hi" aria-pressed="false" lang="hi">हिंदी</button></div>
      </div>`;
    if (photoGate) return photoGateHTML();
    return `<div class="gate" id="gate" role="dialog" aria-modal="true"${TA('aria-label', U.gateTitle)}>
      ${S.gate(plaque)}
      <div class="gate__toran" data-toran></div>
    </div>`;
  }

  /* A realistic door (config.gate): the closed door as a still, and a short clip
     of the doors opening onto the venue that plays when the guest taps. On a
     wide screen a landscape clip is used if there is one; otherwise the portrait
     clip sits in the middle over a soft, blurred copy of the door. */
  const GT = C.gate || {};
  const list = (v) => (Array.isArray(v) ? v : [v]).filter(Boolean);
  const wide = innerWidth / innerHeight > 1.05;
  const gateClip = list(wide && GT.videoWide ? GT.videoWide : GT.video);
  const gatePoster = (wide && GT.posterWide) || GT.poster || '';
  const photoGate = !!(gateClip.length || gatePoster);
  function photoGateHTML() {
    const fit = wide && !GT.videoWide && !GT.posterWide ? ' gate--contain' : '';
    const type = (src) => (/\.webm($|\?)/i.test(src) ? 'video/webm' : /\.mov($|\?)/i.test(src) ? 'video/quicktime' : 'video/mp4');
    const video = gateClip.length ? `<video class="gate__video" muted playsinline preload="auto"${gatePoster ? ` poster="${esc(gatePoster)}"` : ''}>${gateClip.map((src) => `<source src="${esc(src)}" type="${type(src)}">`).join('')}</video>` : '';
    return `<div class="gate gate--photo${fit}" id="gate" role="dialog" aria-modal="true"${TA('aria-label', U.gateTitle)}>
      <div class="gate__media" data-open-area>
        ${gatePoster ? `<div class="gate__blur" style="background-image:url('${esc(gatePoster)}')" aria-hidden="true"></div><img class="gate__poster" src="${esc(gatePoster)}" alt="">` : ''}
        ${video}
      </div>
      <div class="gate__top">
        ${C.invocation ? T(C.invocation, 'p', ' class="gate__invocation"') : ''}
        ${T(U.gateTitle, 'p', ' class="gate__title"')}
        <p class="gate__names">${T(N1.first)} <i>${T(C.couple.joiner)}</i> ${T(N2.first)}</p>
      </div>
      <div class="gate__bottom">
        <button class="gate__key" type="button" data-open><span class="gate__keyhole" aria-hidden="true"></span><span>${T(U.gateOpen)}</span></button>
        <p class="gate__hint">${icon.sound}${T(U.gateHint)}</p>
        <div class="lang lang--gate" role="group"${TA('aria-label', U.language)}><button type="button" data-lang-btn="en" aria-pressed="false">English</button><button type="button" data-lang-btn="hi" aria-pressed="false" lang="hi">हिंदी</button></div>
      </div>
      <button class="gate__skip" type="button" data-skip hidden>${T(U.skip)}</button>
    </div>`;
  }

  // the hero: the names, the date and the place. With config.hero photos it
  // continues straight on from the door clip (the same courtyard, the couple in front).
  const HP = C.hero || {};
  const photoHero = !!(HP.photo || HP.photoWide);
  function hero() {
    const text = `<div class="hero__text">
        <h1 class="hero__names">${T(N1.first, 'span', ' class="hero__name"')}${T(C.couple.joiner, 'span', ' class="hero__amp"')}${T(N2.first, 'span', ' class="hero__name"')}</h1>
        <p class="hero__date">${T(C.wedding.dateLabel)}</p>
        <p class="hero__place">${icon.pin}${T(C.wedding.place)}</p>
      </div>`;
    const cue = `<a class="hero__cue" href="#invite">${T(U.scroll)}<i aria-hidden="true"></i></a>`;
    if (photoHero) {
      const couple = S.art('coupleVarmala');
      return `<section class="hero hero--photo" id="home"${TA('aria-label', U.shubhVivah)}>
      <picture class="hero__photo" aria-hidden="true">${HP.photoWide ? `<source media="(min-aspect-ratio: 1/1)" srcset="${esc(HP.photoWide)}">` : ''}<img src="${esc(HP.photo || HP.photoWide)}" alt=""></picture>
      ${text}
      ${couple ? `<img class="hero__couple" src="${esc(couple)}" alt="">` : ''}
      <canvas class="hero-petals" aria-hidden="true"></canvas>
      ${cue}
    </section>`;
    }
    return `<section class="hero" id="home"${TA('aria-label', U.shubhVivah)}>
      <svg class="hero__stars" aria-hidden="true"></svg>
      <div class="hero__moon" aria-hidden="true"></div>
      ${text}
      <div class="hero__stage">${S.hero()}</div>
      <canvas class="hero-petals" aria-hidden="true"></canvas>
      ${cue}
    </section>`;
  }

  function secTitle(label, id, cls = '') {
    return `<h2 class="sec-title ${cls}" id="${id}">${T(label)}</h2>`;
  }

  function invite() {
    const lines = C.invitation.map((ln) => {
      if (ln.style === 'name') {
        const p = ln.who === 'groom' ? G : B;
        const hon = t(p.honorific, 'hi') || t(p.honorific, 'en') ? T(p.honorific, 'small') : '';
        return `<p class="inv__name">${hon} ${T(ln.full ? p.full : p.first)}</p>`;
      }
      return T(ln.text, 'p', ` class="inv__${ln.style}"`);
    }).join('');
    return `<section class="invite" id="invite" aria-labelledby="invite-t">
      <canvas class="invite-fx" aria-hidden="true"></canvas>
      <div class="card" data-reveal>
        <div class="hashiya" aria-hidden="true"></div>
        <svg class="card__kalash" viewBox="0 -10 160 200" aria-hidden="true">${S.kalash()}</svg>
        ${C.shloka ? `<p class="shloka" lang="sa">${C.shloka.text}</p>${C.shloka.meaning ? T(C.shloka.meaning, 'p', ' class="shloka__meaning"') : ''}` : ''}
        ${secTitle(U.sec.invite, 'invite-t', 'sec-title--center')}
        <div class="inv">${lines}</div>
        <div class="card__foot">
          ${C.kidNote ? `<aside class="kid">${C.kidNote.label ? T(C.kidNote.label, 'p', ' class="kid__label"') : ''}${T(C.kidNote.text, 'p', ' class="kid__text"')}${T(C.kidNote.sign, 'p', ' class="kid__sign"')}</aside>` : '<span></span>'}
          ${MONO ? `<img class="seal seal--img" src="${esc(MONO)}" alt="" aria-hidden="true">` : `<div class="seal" aria-hidden="true"><span>${T(C.couple.monogram)}</span></div>`}
        </div>
        <div class="hashiya" aria-hidden="true"></div>
      </div>
    </section>`;
  }

  // the couple: each one standing on a little rangoli, alive (they blink, look
  // around, and wave or fold their hands in namaste when you tap them).
  // With a photo, the photo is shown instead, as a print with a soft shadow.
  function person(p, who) {
    let art;
    const cutout = S.art(who), greet = S.art(who + 'Greet');
    if (p.photo) art = `<div class="person__photo"><img src="${esc(p.photo)}" alt="" loading="lazy"></div>`;
    else if (cutout) {
      // a paper-craft image; with a greeting pose, the two swap when tapped
      art = `<svg class="person__fig" viewBox="-130 -392 260 412" aria-hidden="true">${S.pedestal(who)}<g class="person__body">${S.cut(cutout, 250, 392, 'pose')}${greet ? S.cut(greet, 250, 392, 'pose').replace('<image ', '<image opacity="0" ') : ''}</g></svg>`;
    } else {
      const fig = who === 'bride' ? P.bride() : P.man({ kind: 'groom' });
      art = `<svg class="person__fig" viewBox="-130 -392 260 412" aria-hidden="true">${S.pedestal(who)}<g class="person__body">${fig.svg}</g></svg>`;
    }
    return `<figure class="person person--${who}" data-reveal>
      <div class="person__stage"${p.photo ? '' : ` role="button" tabindex="0" data-greet="${who}"${TA('aria-label', U.greet)}`}>${art}</div>
      <figcaption>
        ${T(U[who], 'p', ' class="person__role"')}
        <h3 class="person__name">${T(p.full)}</h3>
        ${T(p.about, 'p', ' class="person__about"')}
      </figcaption>
    </figure>`;
  }
  function couple() {
    return `<section class="couple" id="couple" aria-labelledby="couple-t">
      <div class="wrap">
        ${secTitle(U.sec.couple, 'couple-t', 'sec-title--center')}
        <div class="couple__grid">${groomFirst ? person(G, 'groom') : person(B, 'bride')}<div class="couple__join" aria-hidden="true">${T(C.couple.joiner)}</div>${groomFirst ? person(B, 'bride') : person(G, 'groom')}</div>
      </div>
    </section>`;
  }

  const days = [...new Set(C.events.map((e) => e.start.slice(0, 10)))].sort();
  function eventArt(e) {
    switch (e.scene) {
      case 'haldi': return S.haldi();
      // the groom's name hides on the bride's hand, or (art.mehendiHides: 'bride') the bride's on the groom's
      case 'mehendi': return S.mehendi({ hiddenName: esc(t(((C.art || {}).mehendiHides === 'bride' ? B : G).first, 'en')), label: esc(t(U.findName)) }) +
        `<div class="mh-caption"><p>${T(U.findName, 'b')} ${T(U.findNameText)}</p><p class="mh-status" data-mh-status aria-live="polite">${T(U.findTap)}</p><button class="text-btn" type="button" data-mh-reveal>${T(U.findGiveUp)}</button></div>`;
      case 'sangeet': return S.sangeet() + `<div class="dhol-wrap">${S.dhol()}<div class="dhol-ctrl"><button class="btn btn--gold" type="button" data-dhol-play aria-pressed="false"${TA(['data-play', U.playDhol], ['data-stop', U.stopDhol])}><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span data-label>${t(U.playDhol)}</span></button>${T(U.tapDhol, 'p', ' class="dhol-hint"')}</div></div>`;
      case 'baraat': return S.baraat();
      case 'pheras': case 'reception': case 'engagement': default: return S.reception(e);
    }
  }
  function eventCard(e, i) {
    const dayN = days.indexOf(e.start.slice(0, 10)) + 1;
    const tl = e.timeline ? `<ol class="tl">${e.timeline.map((x) => `<li>${T(x.time, 'b')}${T(x.text)}</li>`).join('')}</ol>` : '';
    return `<article class="ev ev--${e.scene}${i % 2 ? ' ev--flip' : ''}" id="ev-${e.id}" style="--dye:${e.color};--ink:${e.ink};--accent:${e.accent}" aria-labelledby="ev-${e.id}-t">
      <div class="wrap ev__grid">
        <div class="ev__art">${eventArt(e)}</div>
        <div class="ev__info" data-reveal>
          <p class="ev__day">${T(U.day)} <b>${String(dayN).padStart(2, '0')}</b> · ${T(e.day)}</p>
          <h3 class="ev__name" id="ev-${e.id}-t">${T(e.name)}</h3>
          ${T(e.about, 'p', ' class="ev__about"')}
          <dl class="facts">
            ${e.time ? `<div><dt>${T(U.when)}</dt><dd>${T(e.time)}</dd></div>` : ''}
            <div><dt>${T(U.where)}</dt><dd>${T(e.venue)}</dd></div>
          </dl>
          ${tl}
          ${e.wear ? `<div class="wear"><p class="wear__label">${T(U.wear)}</p><ul class="chips">${e.wear.colors.map((x) => `<li style="--c:${x.c}">${T(x.name)}</li>`).join('')}</ul>${e.wear.text ? T(e.wear.text, 'p') : ''}</div>` : ''}
          <div class="ev__actions"><button class="btn btn--ghost btn--sm" type="button" data-cal="${e.id}">${icon.cal}${T(U.addCal)}</button>${e.map ? `<a class="btn btn--ghost btn--sm" href="${esc(e.map)}" target="_blank" rel="noopener">${icon.pin}${T(U.map)}</a>` : ''}</div>
        </div>
      </div>
    </article>`;
  }
  function events() {
    const mounds = C.events.map((e) => `<li><a href="#ev-${e.id}" style="color:${e.color}"><svg viewBox="0 0 120 80" aria-hidden="true"><use href="#mound"/></svg>${T(e.name, 'span')}<small>${T(e.day)}</small></a></li>`).join('');
    return `<section class="events" id="events" aria-labelledby="events-t">
      <div class="wrap events__intro">
        ${secTitle(U.sec.events, 'events-t')}
        <ul class="gulal">${mounds}</ul>
        <button class="btn btn--ghost" type="button" data-ics="all">${icon.cal}${T(U.allCal)}</button>
      </div>
      ${eventsWithVows()}
    </section>`;
  }
  // the seven pheras belong to the wedding itself, so they come straight after it
  // (before the reception). vows.after names the event; by default it's the baraat/wedding.
  function eventsWithVows() {
    const cards = C.events.map(eventCard);
    if (!C.vows || !ON.vows) return cards.join('');
    let at = C.events.findIndex((e) => e.id === C.vows.after);
    if (at < 0) at = C.events.findIndex((e) => e.scene === 'baraat');
    if (at < 0) at = cards.length - 1;
    cards.splice(at + 1, 0, vows());
    return cards.join('');
  }

  function vows() {
    if (!C.vows) return '';
    return `<section class="vows" id="vows" aria-labelledby="vows-t">
      <div class="wrap">
        <h2 class="sec-title" id="vows-t">${T(C.vows.title)}</h2>
        ${T(C.vows.intro, 'p', ' class="lede"')}
        <div class="vows__stage">
          <div class="vows__diagram"><svg id="phere-svg" viewBox="0 0 520 520" aria-hidden="true">
            <g id="phere-garland"></g>
            <circle cx="260" cy="260" r="190" fill="none" stroke="#F6EFE3" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="2 7"/>
            <g id="phere-feet" style="color:#E2452B"></g>
            <g transform="translate(260 292)">
              <circle class="agni-glow" cx="0" cy="-30" r="110" fill="url(#g-glow)"/>
              <g class="agni-flames">
                <path class="flame flame--1" d="M0 -110C26 -72 44 -42 32 -12C24 4 -24 4 -32 -12C-44 -42 -20 -58 0 -110Z" fill="#E8592A"/>
                <path class="flame flame--2" d="M2 -84C20 -58 30 -36 22 -14C16 -2 -16 -2 -22 -14C-30 -36 -12 -48 2 -84Z" fill="#F49B25"/>
                <path class="flame flame--3" d="M0 -58C12 -40 18 -26 12 -12C8 -4 -8 -4 -12 -12C-18 -26 -8 -34 0 -58Z" fill="#FFE07A"/>
              </g>
              <g class="agni-sparks" fill="#FFD36B"><circle cx="-10" cy="-60" r="1.6"/><circle cx="12" cy="-70" r="1.3"/><circle cx="2" cy="-80" r="1.1"/><circle cx="-18" cy="-74" r="1.2"/><circle cx="20" cy="-56" r="1.4"/></g>
              <path d="M-34 -6L30 -16M-30 -16L34 -6" stroke="#5A2A12" stroke-width="5" stroke-linecap="round"/>
              <path d="M-50 -4H50V10H-50Z" fill="#C46A35" stroke="#1D1411" stroke-width="1.4"/><path d="M-62 10H62V26H-62Z" fill="#A9522A" stroke="#1D1411" stroke-width="1.4"/><path d="M-76 26H76V44H-76Z" fill="#8A3F1C" stroke="#1D1411" stroke-width="1.4"/>
              <path d="M-44 3H44M-56 18H56M-70 35H70" stroke="#F6EFE3" stroke-width="2.6" stroke-dasharray="0 7" stroke-linecap="round"/>
            </g>
            <g id="phere-nodes"></g>
            <g id="phere-couple" class="phere__couple"></g>
          </svg></div>
          <div class="pothi" id="pothi" aria-live="polite">
            <p class="pothi__count"><span data-ph="ord"></span> · <span data-ph="of"></span></p>
            <p class="pothi__sa" lang="sa" data-ph="sa"></p>
            <p class="pothi__tr" data-ph="tr"></p>
            <p class="pothi__lit" data-ph="lit"></p>
            <p class="pothi__ours" data-ph="ours"></p>
            <div class="pothi__nav"><button class="round-btn" type="button" data-ph-prev${TA('aria-label', U.prev)}>←</button><button class="btn btn--gold" type="button" data-ph-next></button></div>
            ${T(C.vows.source, 'p', ' class="pothi__src"')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function family() {
    const side = (s, cls) => `<div class="paksh ${cls}" data-reveal>
      <h3 class="paksh__title">${T(s.title)}${s.place ? T(s.place, 'small') : ''}</h3>
      ${s.members ? `<ul class="paksh__list">${s.members.map((m) => `<li>${T(m.rel, 'span', ' class="rel"')}<span class="who">${T(m.name)}${m.note ? T(m.note, 'small') : ''}</span></li>`).join('')}</ul>` : ''}
      ${s.names ? `<p class="paksh__names">${s.names.map((n) => T(n, 'span', ' class="nm"')).join(' ')}</p>` : ''}
      ${s.after ? T(s.after, 'p', ' class="paksh__after"') : ''}
    </div>`;
    return `<section class="family" id="family" aria-labelledby="family-t">
      <div class="wrap">
        ${secTitle(U.sec.family, 'family-t', 'sec-title--center')}
        ${C.families.closing ? T(C.families.closing, 'p', ' class="family__closing"') : ''}
        <div class="family__grid">${side(C.families.bride, 'paksh--b')}
          <figure class="knot" data-reveal aria-hidden="true"><svg viewBox="-110 -110 220 220">${medallionSVG()}</svg>${T(C.couple.monogram)}</figure>
          ${side(C.families.groom, 'paksh--g')}</div>
      </div>
    </section>`;
  }
  function medallionSVG() {
    let g = '<circle r="100" fill="none" stroke="#C9973A" stroke-width="1.5" stroke-dasharray="2 6"/>';
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2, x = Math.cos(a) * 84, y = Math.sin(a) * 84;
      g += `<use href="#marigold" x="${(x - 11).toFixed(1)}" y="${(y - 11).toFixed(1)}" width="22" height="22"${i % 2 ? ' style="--m1:#F2B318;--m2:#FAD04A;--m3:#C98A06"' : ''}/>`;
      if (i % 3 === 0) g += `<g transform="rotate(${i * 15 + 7.5})"><use href="#leaf" x="-6" y="62" width="12" height="30" style="--leaf:#3E6B2A"/></g>`;
    }
    return g;
  }

  function travel() {
    const tv = C.travel;
    const tickets = tv.ways.map((w, i) => `<article class="ticket ticket--${i % 3}" data-reveal>
      <div class="ticket__stub"><span class="ticket__code">${esc(w.code)}</span>${T(w.kind, 'span', ' class="ticket__kind"')}</div>
      <div class="ticket__body">${T(w.title, 'h3')}${T(w.text, 'p')}</div>
    </article>`).join('');
    const contacts = C.contacts.map((p) => `<li>${T(p.role, 'span')}${T(p.name, 'b')}<a href="https://wa.me/${esc(p.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon.wa}</a></li>`).join('');
    return `<section class="travel" id="travel" aria-labelledby="travel-t">
      <div class="wrap">
        ${secTitle(U.sec.travel, 'travel-t')}
        ${tv.intro ? T(tv.intro, 'p', ' class="lede"') : ''}
        <div class="tickets">${tickets}</div>
        <div class="info">
          <div class="info__block" data-reveal>${T(tv.stay.title, 'h3')}${T(tv.stay.text, 'p')}<a class="btn btn--ink btn--sm" href="${esc(tv.map)}" target="_blank" rel="noopener">${icon.pin}${T(U.openMap)}</a></div>
          <div class="info__block" data-reveal>${T(tv.weather.title, 'h3')}<p class="weather"><b>${esc(tv.weather.day)}</b> ${T(U.byDay)} <b>${esc(tv.weather.night)}</b> ${T(U.byNight)}</p>${T(tv.weather.text, 'p')}</div>
          <div class="info__block" data-reveal>${T(U.ask, 'h3')}<ul class="ask">${contacts}</ul></div>
        </div>
      </div>
    </section>`;
  }

  function rsvp() {
    const evChecks = C.events.map((e) => `<label style="--c:${e.color}"><input type="checkbox" name="events" value="${esc(e.id)}" checked><span>${T(e.name)}</span></label>`).join('');
    const modes = () => (t(U.modes) || []).map((m, i) => `<option value="${i}">${m}</option>`).join('');
    return `<section class="rsvp" id="rsvp" aria-labelledby="rsvp-t">
      <div class="rsvp__art">${S.rangoli()}</div>
      <div class="rsvp__panel">
        <div class="rsvp-card">
          <h2 class="rsvp-card__title" id="rsvp-t">${T(U.sec.rsvp)}<small>${T(C.rsvp.deadline)}</small></h2>
          <form class="form" id="rsvp-form" novalidate>
            <fieldset class="form__attend"><legend class="sr-only">RSVP</legend>
              <label class="pill"><input type="radio" name="attending" value="yes" checked><span>${T(U.rsvpYes)}</span></label>
              <label class="pill"><input type="radio" name="attending" value="no"><span>${T(U.rsvpNo)}</span></label>
            </fieldset>
            <div class="form__row">
              <label class="field"><span>${T(U.name)}</span><input type="text" name="name" autocomplete="name" required${TA('placeholder', U.namePh)}></label>
              <label class="field"><span>${T(U.phone)}</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="+91"></label>
            </div>
            <div class="form__yes">
              <div class="field"><span id="cnt-l">${T(U.howMany)}</span><div class="stepper" role="group" aria-labelledby="cnt-l"><button type="button" data-step="-1" aria-label="−">−</button><output id="guest-count">2</output><button type="button" data-step="1" aria-label="+">+</button></div></div>
              <fieldset class="field"><legend>${T(U.which)}</legend><div class="dye-checks">${evChecks}</div></fieldset>
              <fieldset class="field"><legend>${T(U.food)}</legend><div class="seg">
                <label><input type="radio" name="food" value="veg" checked><span class="mark-veg">${T(U.veg)}</span></label>
                <label><input type="radio" name="food" value="jain"><span class="mark-veg">${T(U.jain)}</span></label>
                <label><input type="radio" name="food" value="nonveg"><span class="mark-nonveg">${T(U.nonveg)}</span></label>
              </div></fieldset>
              <div class="form__row">
                <label class="field"><span>${T(U.travelBy)}</span><select name="travel" data-modes>${modes()}</select></label>
                <label class="field"><span>${T(U.arrival)}</span><input type="date" name="arrival"></label>
              </div>
            </div>
            <label class="field"><span>${T(U.note)}</span><textarea name="note" rows="3"${TA('placeholder', U.notePh)}></textarea></label>
            <p class="form__error" id="rsvp-error" role="alert" hidden>${T(U.nameMissing)}</p>
            <button class="btn btn--primary btn--wide" type="submit">${icon.wa}${T(U.send)}</button>
            ${T(U.sendHint, 'p', ' class="form__hint"')}
          </form>
          <div class="done" id="rsvp-done" hidden tabindex="-1">${T(U.thanks, 'p', ' class="done__big"')}<p class="done__msg" id="rsvp-msg"></p><button class="text-btn" type="button" id="rsvp-edit">${T(U.edit)}</button></div>
        </div>
      </div>
    </section>`;
  }

  function footer() {
    return `<footer class="foot">
      <div class="toran toran--foot" data-toran></div>
      <div class="wrap foot__inner">
        ${MONO ? `<img class="foot__mono" src="${esc(MONO)}" alt="">` : ''}
        ${T(C.shagun, 'p', ' class="foot__shagun"')}
        <div class="countdown" id="countdown" role="timer">
          ${['days', 'hours', 'minutes', 'seconds'].map((k) => `<div><span data-cd="${k}">--</span>${T(U[k], 'small')}</div>`).join('')}
        </div>
        <p class="foot__until">${T(C.wedding.untilLabel || U.until)} — ${T(C.wedding.muhuratLabel)}</p>
        ${C.hashtag ? `<p class="foot__tag">${esc(C.hashtag)}</p>` : ''}
        ${C.contact ? `<p class="foot__contact">${T(C.contact.label || U.contactLabel)} ${T(C.contact.name, 'b')}
          <span class="foot__contact-btns"><a class="btn btn--ghost btn--sm" href="tel:+${esc(C.contact.phone)}">${icon.phone || ''}${esc(C.contact.show || C.contact.phone)}</a><a class="btn btn--ghost btn--sm" href="https://wa.me/${esc(C.contact.phone)}" target="_blank" rel="noopener">${icon.wa}WhatsApp</a></span></p>` : ''}
        <p class="foot__hosts">${T(U.welcome, 'b')} — ${T(C.hosts)}</p>
        ${C.invocation ? T({ en: '॥ Shubham Bhavatu ॥', hi: '॥ शुभम् भवतु ॥' }, 'p', ' class="foot__shubham"') : ''}
      </div>
    </footer>`;
  }

  /* ------------------------------------------------------------------
     Render
     ------------------------------------------------------------------ */
  document.body.insertAdjacentHTML('afterbegin', header());
  $('#app').innerHTML = hero() + invite() + (ON.couple ? couple() : '') + (ON.events ? events() : '') + (ON.family ? family() : '') + (ON.travel ? travel() : '') + (ON.rsvp ? rsvp() : '');
  // the glass look: the venue photo stays behind the whole page, softly blurred,
  // and every section sits on dark see-through glass
  if (photoHero && !(C.theme && C.theme.glass === false)) {
    document.documentElement.classList.add('glass');
    document.body.insertAdjacentHTML('afterbegin', `<div class="page-bg" aria-hidden="true"><picture>${HP.photoWide ? `<source media="(min-aspect-ratio: 1/1)" srcset="${esc(HP.photoWide)}">` : ''}<img src="${esc(HP.photo || HP.photoWide)}" alt=""></picture></div>`);
  }
  $('#app').insertAdjacentHTML('afterend', footer());
  const showGate = !new URLSearchParams(location.search).has('nogate');
  if (showGate) { document.body.insertAdjacentHTML('beforeend', gate()); if (!photoGate) S.mountGate($('#gate')); }
  // the little one's note: every letter (every word, in Hindi) sits a little crooked, like a child's writing
  function babyfy() {
    $$('.kid__text, .kid__sign').forEach((el, n) => {
      const txt = el.textContent;
      if (!txt.trim()) return;
      const deva = /[\u0900-\u097F]/.test(txt);
      let seed = 7 + n * 31;
      const R = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - .5; };
      const tilt = () => `transform:translateY(${(R() * .16).toFixed(3)}em) rotate(${(R() * 13).toFixed(1)}deg);font-size:${(1 + R() * .22).toFixed(2)}em`;
      const html = txt.split(/(\s+)/).map((w) => {
        if (!w.trim()) return ' ';
        if (deva) return `<span class="w" style="${tilt()}">${esc(w)}</span>`;
        return `<span class="w">${[...w].map((ch) => `<span class="l" style="${tilt()}">${esc(ch)}</span>`).join('')}</span>`;
      }).join('');
      el.innerHTML = `<span class="sr-only">${esc(txt)}</span><span aria-hidden="true">${html}</span>`;
    });
  }
  document.addEventListener('wi:lang', babyfy);
  applyLang(lang);

  /* ------------------------------------------------------------------
     Behaviour
     ------------------------------------------------------------------ */
  // torans
  const torans = () => $$('[data-toran]').forEach((el) => S.toran(el));
  torans();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(torans, 150); });

  // stars
  (function () {
    const svg = $('.hero__stars'); if (!svg) return; let s = '';
    for (let i = 0; i < 90; i++) {
      const x = (Math.random() * 100).toFixed(2), y = (Math.pow(Math.random(), 1.5) * 55).toFixed(2), r = (0.4 + Math.random() * 1.1).toFixed(2);
      s += `<circle cx="${x}%" cy="${y}%" r="${r}" fill="#FFF3D6" opacity="${(0.3 + Math.random() * .6).toFixed(2)}"${Math.random() < .35 ? ` class="tw" style="animation-delay:${(-Math.random() * 4).toFixed(2)}s"` : ''}/>`;
    }
    svg.innerHTML = s;
  })();

  // scenes
  S.mountHero($('#home'));
  if ($('.invite-fx')) S.envelopesLoop($('.invite-fx'), innerWidth < 640 ? 7 : 18);
  C.events.forEach((e) => {
    const root = $(`#ev-${e.id} .ev__art`);
    if (!root) return;
    if (e.scene === 'haldi') S.mountHaldi(root);
    else if (e.scene === 'mehendi') S.mountMehendi(root, {
      found: () => t(U.found), revealed: () => t(U.revealed), warm: () => t(U.warm), cold: () => t(U.cold), hint: () => t(U.hint)
    });
    else if (e.scene === 'sangeet') S.mountSangeet(root);
    else if (e.scene === 'baraat') S.mountBaraat(root);
    else S.mountReception(root);
  });

  // gate
  const gateEl = $('#gate');
  if (gateEl) {
    document.documentElement.classList.add('gate-open');
    const btn = $('[data-open]', gateEl);
    setTimeout(() => btn.focus(), 50);
    let opened = false, done = false;
    const finish = () => {
      if (done) return; done = true;
      gateEl.classList.add('is-leaving');
      S.shower(140, 'stars');
      setTimeout(() => { gateEl.remove(); document.documentElement.classList.remove('gate-open'); syncSound(); }, reduce ? 50 : 900);
    };
    const open = () => {
      if (opened) return; opened = true;
      if (A) { A.ensure(); if (A.isEnabled()) { A.flourish(); A.playMusic(); } }
      if (!photoGate) {
        gateEl.classList.add('is-opening');
        S.shower(140, 'stars');
        setTimeout(() => { gateEl.remove(); document.documentElement.classList.remove('gate-open'); syncSound(); }, reduce ? 50 : 1900);
        return;
      }
      gateEl.classList.add('is-opening');
      const v = $('.gate__video', gateEl);
      // no clip (or reduced motion): the door glows and the camera moves in, then the page appears
      if (!v || reduce) { setTimeout(finish, reduce ? 0 : 1400); return; }
      const skip = $('[data-skip]', gateEl);
      skip.hidden = false; skip.addEventListener('click', finish);
      v.muted = !GT.videoSound;
      const revealAt = +GT.revealAt || 0;
      v.addEventListener('playing', () => gateEl.classList.add('is-playing'), { once: true });
      v.addEventListener('timeupdate', () => { if (revealAt && v.currentTime >= revealAt) finish(); else if (!revealAt && v.duration && v.currentTime > v.duration - .45) finish(); });
      v.addEventListener('ended', finish);
      v.addEventListener('error', finish, true);
      // if the clip hasn't started within a few seconds (a slow connection), don't keep the guest waiting
      const wait = setTimeout(() => { if (!gateEl.classList.contains('is-playing')) finish(); }, 6000);
      v.addEventListener('playing', () => clearTimeout(wait), { once: true });
      const p = v.play();
      if (p && p.catch) p.catch(finish);
    };
    btn.addEventListener('click', open);
    const area = $('[data-open-area]', gateEl);
    if (area) area.addEventListener('click', open);
  }

  // header: solid after the hero, mobile menu, active link
  const hdr = $('#hdr'), menuBtn = $('.menu-btn', hdr);
  const onScroll = () => hdr.classList.toggle('is-solid', scrollY > innerHeight * .6);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { hdr.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  menuBtn.addEventListener('click', () => {
    const open = !hdr.classList.contains('menu-open');
    hdr.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav a', hdr).forEach((a) => a.addEventListener('click', closeMenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  if ('IntersectionObserver' in window) {
    const links = $$('.nav a', hdr);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('#app > section').forEach((s) => io.observe(s));
  }

  // language buttons (header + gate)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang-btn]');
    if (b) { applyLang(b.dataset.langBtn); refreshDynamic(); }
  });

  // sound toggle
  if (A && C.music) A.setMusic(C.music);
  const syncSound = () => $$('[data-sound]').forEach((b) => { const on = A && A.isEnabled(); b.setAttribute('aria-pressed', String(on)); b.classList.toggle('is-off', !on); });
  $$('[data-sound]').forEach((b) => b.addEventListener('click', () => { if (!A) return; A.ensure(); A.toggle(); if (A.isEnabled()) { A.hit('bell'); A.playMusic(); } }));
  if (A) A.onChange(syncSound);
  syncSound();

  // the couple come alive: blink, glance, and greet when tapped
  $$('[data-greet]').forEach((stage, i) => {
    const body = $('.person__body', stage), who = stage.dataset.greet;
    const life = P.alive(body, i * 3 + 1);
    let greetAt = -9, now = 0;
    const greet = () => { greetAt = now; };
    stage.addEventListener('click', greet);
    stage.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); greet(); } });
    S.animate(stage, (t) => {
      now = t;
      const k = t - greetAt, g = Math.max(0, Math.min(1, k / .45, (2.8 - k) / .5)); // up, hold, down over 2.8 s
      const e = g * g * (3 - 2 * g);
      const imgs = $$('.pose', body);
      if (imgs.length) {
        // paper cut-out: swap to the greeting pose (if there is one) and give a little hop
        if (imgs[1]) { imgs[0].setAttribute('opacity', e > .5 ? '0' : '1'); imgs[1].setAttribute('opacity', e > .5 ? '1' : '0'); }
        body.setAttribute('transform', `translate(0 ${(-Math.abs(Math.sin(k * 5)) * 10 * e).toFixed(2)}) rotate(${(Math.sin(t * .8 + i) * .6).toFixed(2)})`);
        return;
      }
      if (who === 'bride') {
        const wave = Math.sin(k * 10) * 16 * e;
        P.pose(body, { armR: [-3 + (66 + 3) * e, -27 + (100 + 27) * e + wave], armL: [3, 27] });
      } else P.pose(body, { armL: [-4 + (-20 + 4) * e, 8 + (128 - 8) * e], armR: [4 + (20 - 4) * e, -8 + (-128 + 8) * e] });
      body.setAttribute('transform', `rotate(${(Math.sin(t * .8 + i) * .6).toFixed(2)})`);
      life(t, e > .2 ? { look: 0, tilt: (who === 'bride' ? -5 : 4) * e } : {});
    });
  });

  // reveal on scroll
  (function () {
    const els = $$('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
  })();

  // rangoli draws itself when it comes into view
  (function () {
    const r = $('.rangoli'); if (!r) return;
    $$('.rg-line', r).forEach((p) => { const L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 1000) + 2; p.style.setProperty('--len', L); });
    if (reduce || !('IntersectionObserver' in window)) { r.classList.add('is-drawn'); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { r.classList.add('is-drawn'); io.disconnect(); } }, { threshold: .3 });
    io.observe(r);
  })();

  /* ---------------- pheras ---------------- */
  (function () {
    const svg = $('#phere-svg'); if (!svg) return;
    const N = C.vows.steps.length, C0 = 260, RN = 190, step = 360 / N;
    const ang = (i) => (-90 + i * step) * Math.PI / 180, pos = (a, r) => [C0 + r * Math.cos(a), C0 + r * Math.sin(a)];
    const f = (n) => +n.toFixed(2);
    let g = '';
    for (let i = 0; i < 44; i++) {
      const [x, y] = pos(i / 44 * Math.PI * 2, 232);
      g += `<use href="#marigold" x="${f(x - 9)}" y="${f(y - 9)}" width="18" height="18"${i % 2 ? ' style="--m1:#F2B318;--m2:#FAD04A;--m3:#C98A06"' : ''}/>`;
    }
    $('#phere-garland').innerHTML = g;
    let feet = '';
    for (let i = 0; i < N; i++) for (let k = 1; k <= 3; k++) {
      const a = ang(i + k / 4), side = k % 2 ? -6 : 6, [x, y] = pos(a, RN + side);
      feet += `<use class="phere-foot" data-seg="${i}" href="#foot" x="${f(x - 5)}" y="${f(y - 9)}" width="10" height="18" transform="rotate(${f(a * 180 / Math.PI + 180)} ${f(x)} ${f(y)})"/>`;
    }
    $('#phere-feet').innerHTML = feet;
    let bloom = '';
    for (let k = 0; k < 8; k++) {
      const a0 = k * Math.PI / 4, a1 = (k + 1) * Math.PI / 4;
      bloom += (k ? '' : `M${f(19 * Math.cos(a0))} ${f(19 * Math.sin(a0))}`) + `A8.6 8.6 0 0 1 ${f(19 * Math.cos(a1))} ${f(19 * Math.sin(a1))}`;
    }
    $('#phere-nodes').innerHTML = C.vows.steps.map((s, i) => { const [x, y] = pos(ang(i), RN); return `<g class="phere-node" data-i="${i}" role="button" tabindex="0" transform="translate(${f(x)} ${f(y)})"><path class="bloom" d="${bloom}Z"/><text class="num" y="1"></text></g>`; }).join('');
    // the couple, tiny, walking the circle with their clothes knotted together
    $('#phere-couple').innerHTML = S.art('coupleNamaste')
      ? `<g transform="translate(${C0} ${C0 - 112})">${S.cut(S.art('coupleNamaste'), 70, 70)}</g>`
      : `<g transform="translate(${C0} ${C0 - 150})"><g transform="translate(-15 36) scale(.15)">${P.man({ kind: 'groom', pose: { armR: [14, -20] } }).svg}</g><g transform="translate(15 36) scale(.15)">${P.bride({ pose: { armL: [-10, 16] } }).svg}</g><path d="M-6 6C-2 14 2 14 6 6" stroke="#F2C76A" stroke-width="2.4" fill="none"/></g>`;
    const couple = $('#phere-couple'), pothi = $('#pothi');
    const el = (k) => $(`[data-ph="${k}"]`, pothi);
    const prev = $('[data-ph-prev]'), next = $('[data-ph-next]');
    let cur = 0, celebrated = false;
    const render = (i, anim = true) => {
      cur = (i + N) % N;
      couple.style.transform = `rotate(${cur * step}deg)`;
      $$('.phere-node', svg).forEach((n, j) => { n.classList.toggle('is-active', j === cur); n.classList.toggle('is-done', j < cur); n.setAttribute('aria-pressed', String(j === cur)); n.setAttribute('aria-label', `${t(U.step)} ${j + 1}`); $('.num', n).textContent = num(j + 1); });
      $$('.phere-foot', svg).forEach((ft) => { const s = +ft.dataset.seg; ft.classList.toggle('is-on', s < cur || (cur === N - 1 && s === N - 1)); });
      const swap = () => {
        const d = C.vows.steps[cur], ord = t(U.ordinals);
        el('ord').textContent = lang === 'hi' ? `${ord[cur]} ${t(U.step)}` : `${ord[cur]} ${t(U.step).toLowerCase()}`;
        el('of').textContent = `${num(cur + 1)} ${t(U.of)} ${num(N)}`;
        el('sa').textContent = d.sa; el('tr').textContent = d.tr; el('lit').textContent = t(d.lit); el('ours').textContent = t(d.ours);
        pothi.classList.remove('is-turning');
      };
      if (anim && !reduce) { pothi.classList.add('is-turning'); setTimeout(swap, 240); } else swap();
      prev.disabled = cur === 0;
      next.innerHTML = cur === N - 1 ? `${t(U.again)} ↺` : `${t(U.next)} →`;
      if (cur === N - 1 && !celebrated) { celebrated = true; setTimeout(() => { S.shower(110); if (A) A.hit('bell'); }, 700); }
    };
    // on a phone the circle sits above the card: bring both back into view when a step changes
    const stage = $('.vows__stage');
    const keepInView = () => {
      const r = stage.getBoundingClientRect(), top = hdr.offsetHeight;
      if ((r.top < top - 4 || r.bottom > innerHeight + 4) && r.height <= innerHeight - top) stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };
    prev.addEventListener('click', () => { render(cur - 1); keepInView(); });
    next.addEventListener('click', () => { if (cur === N - 1) celebrated = false; render(cur + 1); keepInView(); });
    svg.addEventListener('click', (e) => { const n = e.target.closest('.phere-node'); if (n) render(+n.dataset.i); });
    svg.addEventListener('keydown', (e) => {
      const n = e.target.closest('.phere-node'); if (!n) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); render(+n.dataset.i); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); render(cur + 1); $$('.phere-node', svg)[cur].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); render(cur - 1); $$('.phere-node', svg)[cur].focus(); }
    });
    render(0, false);
    document.addEventListener('wi:lang', () => render(cur, false));
  })();

  /* ---------------- calendar ---------------- */
  const icsDate = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  // an event given only a date (start: '2026-11-28') goes in the calendar as an all-day event
  const allDay = (e) => e.start.length <= 10;
  const ymd = (d) => d.slice(0, 10).replace(/-/g, '');
  const dayAfter = (d) => { const x = new Date(d.slice(0, 10) + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + 1); return ymd(x.toISOString()); };
  const icsWhen = (e) => allDay(e) ? [`DTSTART;VALUE=DATE:${ymd(e.start)}`, `DTEND;VALUE=DATE:${dayAfter(e.end || e.start)}`] : [`DTSTART:${icsDate(e.start)}`, `DTEND:${icsDate(e.end)}`];
  const gcalWhen = (e) => allDay(e) ? `${ymd(e.start)}/${dayAfter(e.end || e.start)}` : `${icsDate(e.start)}/${icsDate(e.end)}`;
  const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  const evTitle = (e) => `${t(e.name)} · ${t(B.first)} ${t(C.couple.joiner)} ${t(G.first)}`;
  function downloadIcs(list) {
    const now = icsDate(new Date().toISOString());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shubh Vivah//EN', 'CALSCALE:GREGORIAN'];
    list.forEach((e) => lines.push('BEGIN:VEVENT', `UID:${e.id}-${e.start.slice(0, 10)}@shubh-vivah`, `DTSTAMP:${now}`, ...icsWhen(e),
      `SUMMARY:${icsEsc(evTitle(e))}`, `LOCATION:${icsEsc(t(e.venue))}`, `DESCRIPTION:${icsEsc(e.about ? t(e.about) : '')}`, 'END:VEVENT'));
    lines.push('END:VCALENDAR');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' })), download: list.length > 1 ? 'wedding.ics' : `wedding-${list[0].id}.ics` });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-cal]');
    if (b) {
      const e = C.events.find((x) => x.id === b.dataset.cal);
      if (!e) return;
      if (/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)) return downloadIcs([e]);
      const q = new URLSearchParams({ action: 'TEMPLATE', text: evTitle(e), dates: gcalWhen(e), details: t(e.about), location: t(e.venue), ctz: 'Asia/Kolkata' });
      window.open(`https://calendar.google.com/calendar/render?${q}`, '_blank', 'noopener');
    }
    if (ev.target.closest('[data-ics="all"]')) downloadIcs(C.events);
  });

  /* ---------------- RSVP → WhatsApp ---------------- */
  (function () {
    const form = $('#rsvp-form'); if (!form) return;
    const count = $('#guest-count'), err = $('#rsvp-error'), done = $('#rsvp-done'), msg = $('#rsvp-msg');
    const nameIn = form.elements.name;
    const dates = C.events.map((e) => e.start.slice(0, 10)).sort();
    const d0 = new Date(dates[0]); d0.setDate(d0.getDate() - 3);
    form.elements.arrival.min = d0.toISOString().slice(0, 10); form.elements.arrival.max = dates[dates.length - 1];
    const d1 = new Date(dates[0]); d1.setDate(d1.getDate() - 1); form.elements.arrival.value = d1.toISOString().slice(0, 10);
    form.addEventListener('change', (e) => { if (e.target.name === 'attending') form.classList.toggle('is-no', e.target.value === 'no'); });
    $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => { count.textContent = Math.max(1, Math.min(15, +count.textContent + +b.dataset.step)); }));
    nameIn.addEventListener('input', () => { err.hidden = true; nameIn.removeAttribute('aria-invalid'); });
    document.addEventListener('wi:lang', () => { const sel = $('[data-modes]', form), v = sel.value; sel.innerHTML = (t(U.modes) || []).map((m, i) => `<option value="${i}">${m}</option>`).join(''); sel.value = v; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form), name = String(fd.get('name') || '').trim();
      if (!name) { err.hidden = false; nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); return; }
      const W = U.waMsg, yes = fd.get('attending') === 'yes';
      const lines = [`${t(W.hello)}: ${t(B.first)} ${t(C.couple.joiner)} ${t(G.first)}`, '', `${t(W.name)}: ${name}`];
      const phone = String(fd.get('phone') || '').trim(); if (phone) lines.push(`${t(W.phone)}: ${phone}`);
      if (yes) {
        const ev = fd.getAll('events').map((id) => t(C.events.find((x) => x.id === id).name));
        const arr = fd.get('arrival');
        const when = arr ? ', ' + new Date(arr + 'T12:00:00').toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }) : '';
        const food = { veg: U.veg, jain: U.jain, nonveg: U.nonveg }[fd.get('food')];
        lines.push(`${t(W.coming)}: ${t(W.yes)} ${count.textContent} ${t(W.people)}`, `${t(W.events)}: ${ev.join(', ') || '—'}`, `${t(W.food)}: ${t(food)}`, `${t(W.travel)}: ${(t(U.modes) || [])[+fd.get('travel')] || ''}${when}`);
      } else lines.push(`${t(W.coming)}: ${t(W.no)}`);
      const note = String(fd.get('note') || '').trim(); if (note) lines.push('', `${t(W.note)}: ${note}`);
      const url = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      msg.innerHTML = '';
      msg.append(`${name.split(/\s+/)[0]} ${lang === 'hi' ? 'जी' : 'ji'}, ${t(yes ? U.thanksYes : U.thanksNo)} `);
      msg.append(Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener', textContent: t(U.waFallback) }));
      form.hidden = true; done.hidden = false; done.focus();
      if (yes) { S.shower(140); if (A) A.hit('bell'); }
    });
    $('#rsvp-edit').addEventListener('click', () => { done.hidden = true; form.hidden = false; nameIn.focus(); });
  })();

  /* ---------------- countdown ---------------- */
  let cdTimer;
  function countdown() {
    const el = $('#countdown'); if (!el) return;
    const target = new Date(C.wedding.muhurat).getTime();
    const pad = (n) => num(String(n).padStart(2, '0'));
    const tick = () => {
      let s = Math.floor((target - Date.now()) / 1000);
      if (s <= 0) { clearInterval(cdTimer); el.hidden = true; $('.foot__until').textContent = t(U.married); return; }
      const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60;
      $('[data-cd="days"]', el).textContent = num(d); $('[data-cd="hours"]', el).textContent = pad(h);
      $('[data-cd="minutes"]', el).textContent = pad(m); $('[data-cd="seconds"]', el).textContent = pad(s);
    };
    clearInterval(cdTimer); tick(); cdTimer = setInterval(tick, 1000);
  }
  countdown();
  function refreshDynamic() {
    countdown();
    $$('[data-dhol-play]').forEach((btn) => { $('[data-label]', btn).textContent = btn.classList.contains('is-playing') ? btn.dataset.stop : btn.dataset.play; });
  }
})();
