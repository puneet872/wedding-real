/* Sound: a real dhol recording (assets/audio/dhol-intro.mp3) with its strokes
   timed so the drawings move with it, single real dagga (bass head) and tilli
   (treble head) strokes for tapping the drum, a synthesised temple bell, and an
   optional background track from config. If the recording can't play, a
   synthesised dhol takes over. Browsers only allow sound after a tap, so
   nothing plays until the guest opens the invitation. */
(function () {
  'use strict';
  const KEY = 'wi-sound';
  let ctx = null, out = null, noise = null;
  let enabled = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } })();
  let music = null, musicWanted = false;
  const listeners = new Set();

  /* the recording, and when each stroke lands in it (seconds; D = big dagga
     stroke, t = tilli). Measured from the file with an onset detector. */
  const CLIP = {
    src: 'assets/audio/dhol-intro.mp3',
    hits: [[.093, 'D'], [.401, 'D'], [.743, 't'], [.894, 't'], [1.027, 't'], [1.173, 't'], [1.364, 'D'], [1.66, 'D'],
      [2.043, 't'], [2.142, 't'], [2.281, 't'], [2.432, 't'], [2.612, 'D'], [2.757, 't'], [2.821, 't'], [2.92, 't'],
      [3.077, 'D'], [3.146, 't'], [3.239, 't'], [3.384, 't'], [3.448, 't'], [3.553, 'D'], [3.698, 't'], [3.913, 't'],
      [4.005, 'D'], [4.081, 't'], [4.174, 't'], [4.325, 't'], [4.476, 'D'], [4.638, 't'], [4.783, 'D'], [4.928, 't']]
  };
  // single strokes cut from the same recording, small enough to embed (mp3, base64)
  const STROKES = {
    dagga: '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/xNhAd0ZsXYoLQZDUTa0wV9V8stX66VPTPInqDLLlMaavcgRSzXSJiHlAqoKd/RV/5C6abihqsUmNkIa9KZ5DxhpxNSsI2iqgKZwQnzVhNMGFM1s3zWBRJBQZJJhiEKmRCKUaLQgB54ucGgZKKryP87qWxa6B1yqatEAojKByGnNKadjBpcFH1YrCUfWqJhPGumUQ9GrjVkJKqFTMqmzFC5FKUYpIkTwWeEjXBURPnUZGkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkAAAahmZt0ZayBbAz2YGhl3mZYYtZYnKsBA2OLBVECEAEMsgXLVO4n/+3LEu4PP3Jj8DuUvSfqTnIHMJegXvIkKyaRxdAfJRUIRoPjI0HxgjQI2G3solVjqi6ik4bkopJqrJpJwBw2CwSFgcFWVCUVFQy6KioqKdYsLI8WFv/+sV//i3wqK1UxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7cMSmg84kinStZSOAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    tilli: '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'
  };
  const buffers = {};
  let clip = null, clipWatch = 0, clipFailed = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12; comp.ratio.value = 12; comp.attack.value = .002; comp.release.value = .12;
      out = ctx.createGain();
      out.gain.value = .5;
      out.connect(comp); comp.connect(ctx.destination);
      const len = ctx.sampleRate;
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      Object.keys(STROKES).forEach((k) => {
        try {
          const bin = atob(STROKES[k]), bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          const done = (b) => { buffers[k] = b; };
          const pr = ctx.decodeAudioData(bytes.buffer, done, () => {});
          if (pr && pr.catch) pr.catch(() => {});
        } catch (e) { /* the synthesised stroke is used instead */ }
      });
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function env(g, t, peak, decay, attack = .003) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  function noiseHit(t, type, freq, q, peak, decay) {
    const src = ctx.createBufferSource(); src.buffer = noise;
    src.playbackRate.value = .8 + Math.random() * .4;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = freq; fl.Q.value = q;
    const g = ctx.createGain(); env(g, t, peak, decay, .001);
    src.connect(fl); fl.connect(g); g.connect(out);
    src.start(t, Math.random() * .5); src.stop(t + decay + .05);
  }
  function tone(t, type, f0, f1, sweep, peak, decay) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    const g = ctx.createGain(); env(g, t, peak, decay);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + decay + .05);
  }

  // a real stroke from the recording, slightly varied so repeats don't sound copied
  function stroke(kind, t, v) {
    const b = buffers[kind];
    if (!b) return false;
    const src = ctx.createBufferSource(); src.buffer = b;
    src.playbackRate.value = .97 + Math.random() * .06;
    const g = ctx.createGain(); g.gain.value = 1.5 * v;
    src.connect(g); g.connect(out); src.start(t);
    return true;
  }

  // dagga: the big goat-skin head — a boom that drops in pitch, with a stick slap
  function dagga(t, v = 1) {
    tone(t, 'sine', 150, 52, .22, .95 * v, .55);
    tone(t, 'triangle', 92, 46, .16, .35 * v, .28);
    noiseHit(t, 'bandpass', 900, 1.2, .28 * v, .045);
  }
  // tilli: the thin treble head — a bright crack with a short ring
  function tilli(t, v = 1) {
    noiseHit(t, 'bandpass', 3200, 1.1, 1.3 * v, .075);
    noiseHit(t, 'highpass', 6000, .7, .55 * v, .03);
    tone(t, 'triangle', 600, 480, .05, .5 * v, .1);
    tone(t, 'sine', 300, 260, .05, .25 * v, .07);
  }
  // temple bell: inharmonic partials with a long ring
  function bell(t, base = 784, v = .5) {
    [[1, 1], [2.76, .55], [5.4, .3], [8.93, .16]].forEach(([r, a], i) => {
      tone(t, 'sine', base * r, base * r * .999, 1, v * a * .5, 2.6 / (i * .6 + 1));
    });
  }

  /* bhangra chaal on a triplet grid: 12 steps a bar, two bars that answer each other */
  const D = 'D', T = 't', B = 'Dt';
  const PATTERN = [
    D, 0, T, D, 0, T, D, 0, T, D, T, T,
    D, 0, T, D, 0, T, D, T, T, B, 0, D
  ];
  let loop = null;

  function startLoop(onStep, bpm = 100) {
    if (!enabled || !ensure()) return false;
    stopLoop();
    const stepDur = 60 / bpm / 3;
    let step = 0, next = ctx.currentTime + .08;
    loop = { timer: setInterval(() => {
      while (next < ctx.currentTime + .14) {
        const hit = PATTERN[step % PATTERN.length];
        const accent = step % 12 === 0 ? 1 : .8;
        if (hit === D || hit === B) dagga(next, accent);
        if (hit === T || hit === B) tilli(next, step % 3 === 2 ? .7 : .85);
        if (onStep) {
          const s = step, h = hit, delay = Math.max(0, (next - ctx.currentTime) * 1000);
          setTimeout(() => onStep(s, h), delay);
        }
        next += stepDur; step++;
      }
    }, 25) };
    return true;
  }
  function stopLoop() { if (loop) { clearInterval(loop.timer); loop = null; } }

  /* the recording: play it (once, or looping) and call onHit(kind) as each
     stroke goes by, so sticks, drum heads and dancers move with the sound */
  function getClip() {
    if (!clip && !clipFailed) {
      clip = new Audio(CLIP.src);
      clip.preload = 'auto'; clip.volume = .8;
      clip.addEventListener('error', () => { clipFailed = true; clip = null; });
    }
    return clip;
  }
  function playClip(opts = {}) {
    if (!enabled) return Promise.resolve(false);
    const a = getClip();
    if (!a) return Promise.resolve(false);
    stopClip();
    a.loop = !!opts.loop;
    try { a.currentTime = 0; } catch (e) {}
    let i = 0, last = 0;
    const watch = () => {
      const now = a.currentTime;
      if (now < last - .5) i = 0; // looped back to the start
      last = now;
      while (i < CLIP.hits.length && CLIP.hits[i][0] <= now + .015) {
        if (opts.onHit) opts.onHit(CLIP.hits[i][1] === 'D' ? 'dagga' : 'tilli');
        i++;
      }
      if (!a.paused || a.loop) clipWatch = requestAnimationFrame(watch); else clipWatch = 0;
    };
    const p = a.play();
    const started = () => { cancelAnimationFrame(clipWatch); clipWatch = requestAnimationFrame(watch); return true; };
    a.onended = () => { if (opts.onEnd) opts.onEnd(); };
    return p && p.then ? p.then(started, () => false) : Promise.resolve(started());
  }
  function stopClip() {
    if (clipWatch) { cancelAnimationFrame(clipWatch); clipWatch = 0; }
    if (clip) { clip.pause(); clip.onended = null; }
  }

  /* "Play the dhol": the recording on a loop, or the synthesised chaal if it can't play */
  function startDhol(onHit) {
    if (!enabled) return Promise.resolve(false);
    ensure();
    return playClip({ loop: true, onHit }).then((ok) => ok || startLoop((step, h) => {
      if (!onHit) return;
      if (h === 'D' || h === 'Dt') onHit('dagga');
      if (h === 't' || h === 'Dt') onHit('tilli');
    }));
  }
  function stopDhol() { stopClip(); stopLoop(); }

  // opening the invitation: the dhol intro and a temple bell (synthesised roll as a fallback)
  function flourish(onHit) {
    if (!enabled || !ensure()) return;
    bell(ctx.currentTime + .05, 784, .45);
    playClip({ onHit }).then((ok) => { if (!ok) synthRoll(); });
  }
  function synthRoll() {
    const t = ctx.currentTime + .05;
    const times = [0, .16, .3, .42, .52, .6, .67, .73, .78, .82];
    times.forEach((dt, i) => (i % 3 === 0 ? dagga : tilli)(t + dt, .6 + i * .04));
    dagga(t + .95, 1); tilli(t + .95, .9);
    bell(t + 1.0, 784, .55);
  }

  function hit(kind) {
    if (!enabled || !ensure()) return;
    const t = ctx.currentTime + .005;
    if (kind === 'bell') return bell(t);
    if (stroke(kind, t, 1)) return;
    if (kind === 'dagga') dagga(t, 1); else if (kind === 'tilli') tilli(t, 1);
  }

  function setMusic(src) {
    if (!src) return;
    music = new Audio(src);
    music.loop = true; music.preload = 'none'; music.volume = .55;
  }
  function playMusic() { musicWanted = true; if (music && enabled) music.play().catch(() => {}); }
  function pauseMusic() { if (music) music.pause(); }

  function setEnabled(on) {
    enabled = !!on;
    try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (e) {}
    if (!enabled) { stopDhol(); pauseMusic(); } else if (musicWanted) playMusic();
    listeners.forEach((fn) => fn(enabled));
  }

  window.WIAudio = {
    ensure, hit, flourish, startDhol, stopDhol, startLoop, stopLoop, setMusic, playMusic, pauseMusic,
    isEnabled: () => enabled, setEnabled, toggle: () => setEnabled(!enabled),
    onChange: (fn) => listeners.add(fn), hasMusic: () => !!music
  };
})();
