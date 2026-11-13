/* Vidéos interactives : le moteur du prototype « La colocation de Kenji », rendu commun à toutes les vidéos.
   Chaque page charge ses données (donnees/<id>.js : répliques calées mot à mot, personnes, consignes enregistrées),
   son scénario (window.SCENARIO : les étapes, avec leurs gestes propres) puis ce moteur.
   Toujours pareil : on regarde d'abord la scène entière ; on répond en agissant ; la preuve, c'est la vidéo (on réentend
   le passage) ; l'erreur ne bloque jamais (« Écoute encore », puis la réponse) ; les aides restent là (réécouter, les
   mots, plus lentement) ; un doigt fantôme montre le geste ; un bilan reprend ce qu'on a compris. */
(() => {
  'use strict';
  const DON = window.DONNEES, SC = window.SCENARIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const NB = ' ';
  document.title = DON.titre;
  document.body.classList.add('boot');

  /* ================= la page ================= */
  const PEOPLE = DON.people;
  document.body.insertAdjacentHTML('beforeend', `
<canvas class="env" id="amb" width="64" height="36" aria-hidden="true"></canvas>
<div class="env-dim" aria-hidden="true"></div>
<a class="retour glass" href="${SC.retour || '../index.html#videos'}" aria-label="Retour aux vidéos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H6M11 6l-6 6 6 6"/></svg></a>
<div class="scene" id="scene">
  <div class="win" id="win">
    <div class="cam" id="cam">
      <video id="vid" playsinline preload="auto" poster="${DON.poster}"><source src="${DON.video}" type="video/mp4"></video>
      <div class="veil" id="veil"></div>
      <div class="spot" id="spot"></div>
      ${Object.entries(PEOPLE).map(([k, p]) => `<div class="tag" data-p="${k}"><span class="stem"></span><span class="dot"></span><span class="lab">${p.name}<small></small></span></div>`).join('')}
    </div>
    <button class="bigplay glass" id="bigplay" aria-label="Regarder la scène"><svg viewBox="0 0 30 34" aria-hidden="true"><path d="M4 3.5v27a2 2 0 0 0 3 1.7l20-13.5a2 2 0 0 0 0-3.4L7 1.8A2 2 0 0 0 4 3.5Z" fill="currentColor"/></svg></button>
  </div>
  <div class="talk" id="talk" aria-live="polite">
    <div class="qb bub empty" id="qb" data-mode="you"><button class="orb" id="orb" aria-label="Réécouter la question"><span class="core"></span><span class="ic" id="orbIc"></span></button><p class="qt" id="qt"></p></div>
    <div class="lrow" id="lrow" data-side="g" aria-hidden="true"><img class="av" id="lav" src="" alt=""><div class="lb bub" id="lb"><span class="words" id="lwords"></span></div></div>
  </div>
  <div class="orn glass dock" id="dock">
    <button class="ico" id="replayBtn" aria-label="Réécouter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg></button>
    <button class="ico" id="ccBtn" aria-pressed="false" aria-label="Afficher les mots" title="Les mots">Aa</button>
    <button class="ico" id="slowBtn" aria-pressed="false" aria-label="Plus lentement" title="Plus lentement"><svg viewBox="0 0 26 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16h17.5a3 3 0 0 0 3-3V9"/><path d="M5 16a6.5 6.5 0 1 1 13 0"/><path d="M11.5 16a2.6 2.6 0 0 1 0-5.2 1.6 1.6 0 0 1 0 3.2"/><path d="M21 9.5 20 4.5M24 9.5l1-4.6"/></svg></button>
    <span id="goSlot" class="goslot"></span>
  </div>
  <aside class="side" id="side"></aside>
  <button class="bin no glass" id="binNo" data-side="no"></button>
  <button class="bin yes glass" id="binYes" data-side="yes"></button>
  <div class="deck" id="deck"></div>
</div>
<div class="ghost" id="ghost" aria-hidden="true"></div>`);

  /* ================= la scène ================= */
  const LINES = DON.lines.map(L => ({ ...L, words: L.words.map(([t, s, e]) => ({ t, s, e })) }));
  const WIDE = DON.gel;
  const CROPS = { full: { a: 16 / 9, h: 1, cx: .5, cy: .5 }, fullTall: { a: 4 / 3, h: 1, cx: .5, cy: .5 }, ...(SC.crops || {}) };
  /* un passage de la vidéo retrouvé par ses mots : phrase('un kilo de pommes') → [début, fin] */
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ALLW = LINES.flatMap(L => L.words.map(w => ({ ...w, n: norm(w.t) })));
  function phrase(txt, avant = .06, apres = .12) {
    const q = norm(txt).split(' ');
    for (let i = 0; i + q.length <= ALLW.length; i++) if (q.every((m, k) => ALLW[i + k].n === m)) return [Math.max(0, ALLW[i].s - avant), ALLW[i + q.length - 1].e + apres];
    console.warn('phrase introuvable :', txt); return [0, 1];
  }
  const ligne = i => [LINES[i].s - .05, LINES[i].e + .12];

  /* ================= éléments et état ================= */
  const vid = $('#vid'), win = $('#win'), cam = $('#cam'), veil = $('#veil'), spot = $('#spot'), bigplay = $('#bigplay');
  const talk = $('#talk'), qb = $('#qb'), orbIc = $('#orbIc'), qt = $('#qt'), lrow = $('#lrow'), lav = $('#lav'), lwords = $('#lwords');
  const dock = $('#dock'), side = $('#side'), goSlot = $('#goSlot'), ghost = $('#ghost'), amb = $('#amb');
  const binNo = $('#binNo'), binYes = $('#binYes'), deck = $('#deck');
  const ccBtn = $('#ccBtn'), slowBtn = $('#slowBtn'), replayBtn = $('#replayBtn');
  const state = { step: 'intro', cc: false, slow: false, lineView: false, crop: CROPS.full, sideOn: false, split: false, essais: 0 };
  let flow = 0;
  const alive = f => f === flow;

  /* ================= mise en place : fenêtre, barre, panneau, cases ================= */
  function layout() {
    const Wd = innerWidth, Hd = innerHeight, wide = Wd / Hd >= 1.1, short = wide && Hd < 520, compact = !wide && Hd < 740;
    const B = document.body; B.classList.toggle('wide', wide); B.classList.toggle('tall', !wide); B.classList.toggle('short', short); B.classList.toggle('compact', compact);
    let c = (!wide && state.crop === CROPS.full) ? CROPS.fullTall : state.crop;
    if (short && c.a < 1.3) c = { ...c, a: 1.3 };
    const sideOn = state.sideOn, split = state.split;
    const dockH = short ? 46 : 52, dockGap = short ? 10 : 16;
    let wx, wy, ww, wh;
    if (wide) {
      const vm = short ? 12 : 36, pad = short ? 14 : 32, gap = (sideOn || split) ? (short ? 14 : 28) : 0;
      const sw = sideOn ? Math.min(short ? 230 : (state.sideW || 320), Wd * .32) : split ? Math.min(short ? 140 : 210, Wd * .18) : 0;
      const extra = sideOn ? sw + gap : split ? 2 * (sw + gap) : 0;
      const aw = Wd - pad * 2 - extra, ah = Hd - vm * 2 - dockGap - dockH;
      wh = Math.min(ah, aw / c.a); ww = wh * c.a;
      const gx = (Wd - ww - extra) / 2;
      wx = split ? gx + sw + gap : gx; wy = (Hd - (wh + dockGap + dockH)) / 2;
      Object.assign(side.style, { left: wx + ww + gap + 'px', top: wy + wh / 2 + 'px', width: (sideOn ? sw : Math.min(320, Wd * .3)) + 'px' });
      const bw = split ? sw : Math.min(210, Wd * .18);
      const yc = wy + wh * (short ? .46 : .56);
      Object.assign(binNo.style, { left: wx - gap - bw + 'px', top: yc + 'px', width: bw + 'px', height: '' });
      Object.assign(binYes.style, { left: wx + ww + gap + 'px', top: yc + 'px', width: bw + 'px', height: '' });
      Object.assign(deck.style, { left: wx + ww / 2 + 'px', top: yc + 'px' });
    } else {
      const pad = 12, top = Math.max(14, Math.round(Hd * .04)) + 44;
      const sideH = sideOn && side.firstElementChild ? side.firstElementChild.offsetHeight : 0, rowH = compact ? 118 : 156;
      const below = sideOn ? sideH + 12 : split ? rowH + 12 : 0;
      ww = Wd - pad * 2; wh = ww / c.a;
      const maxH = Hd - top - dockGap - dockH - below - 14;
      if (wh > maxH) { wh = Math.max(150, maxH); ww = Math.min(Wd - pad * 2, wh * c.a); }
      wx = (Wd - ww) / 2; wy = Math.max(top, Math.round((Hd - (wh + dockGap + dockH + below)) / 2));
      const yBelow = wy + wh + dockGap + dockH + 12;
      Object.assign(side.style, { left: pad + 'px', width: Wd - pad * 2 + 'px', top: yBelow + 'px' });
      const cw = compact ? 100 : 132, bw = (Wd - pad * 2 - cw - 20) / 2, yc = yBelow + rowH / 2;
      Object.assign(binNo.style, { left: pad + 'px', top: yc + 'px', width: bw + 'px', height: rowH + 'px' });
      Object.assign(binYes.style, { left: Wd - pad - bw + 'px', top: yc + 'px', width: bw + 'px', height: rowH + 'px' });
      Object.assign(deck.style, { left: Wd / 2 + 'px', top: yc + 'px' });
    }
    Object.assign(win.style, { left: wx + 'px', top: wy + 'px', width: ww + 'px', height: wh + 'px' });
    const Vh = wh / c.h, Vw = Vh * 16 / 9;
    const cl = Math.min(0, Math.max(ww - Vw, ww / 2 - c.cx * Vw)), ct = Math.min(0, Math.max(wh - Vh, wh / 2 - c.cy * Vh));
    Object.assign(cam.style, { left: cl + 'px', top: ct + 'px', width: Vw + 'px', height: Vh + 'px' });
    $$('.tag').forEach(t => { const lab = $('.lab', t), half = (lab.offsetWidth || 90) / 2, ax = cl + parseFloat(t.style.left || 0) / 100 * Vw;
      t.style.setProperty('--dx', Math.max(0, 10 - (ax - half)) - Math.max(0, ax + half - (ww - 10)) + 'px'); });
    const inset = short ? 10 : wide ? 18 : 10;
    Object.assign(talk.style, { left: wx + inset + 'px', width: ww - inset * 2 + 'px', bottom: Hd - (wy + wh) + inset + 'px' });
    Object.assign(dock.style, { left: wx + ww / 2 + 'px', top: wy + wh + dockGap + 'px' });
  }
  function frameTo(crop, sideOn, sideW) { state.crop = crop; state.sideOn = sideOn; state.sideW = sideW; layout(); side.classList.toggle('on', sideOn && side.children.length > 0); }
  addEventListener('resize', () => { document.body.classList.add('boot'); layout(); requestAnimationFrame(() => document.body.classList.remove('boot')); idle.reset(); });

  /* ================= médias : une seule voix à la fois ================= */
  const SRC = DON.video;
  const voice = new Audio(SRC); voice.preload = 'auto';
  const CLIPS = DON.clips;
  const plainSp = t => t.replace(/[  ]/g, ' ');
  const CLIPSN = {}; for (const [t, c] of Object.entries(CLIPS)) { c.el = new Audio(c.src); c.el.preload = 'auto'; CLIPSN[plainSp(t)] = c; }
  const clipFor = t => CLIPSN[plainSp(t)] || null;
  vid.addEventListener('loadedmetadata', async () => {
    if (vid.seekable.length && vid.seekable.end(0) >= vid.duration - .5) return;
    try { const url = URL.createObjectURL(await (await fetch(SRC)).blob()); const t = vid.currentTime; vid.src = url; voice.src = url; vid.load(); seek(vid, t); } catch (e) {}
  }, { once: true });
  let unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    voice.muted = true; const p = voice.play(); if (p && p.then) p.then(() => { voice.pause(); voice.muted = false; }).catch(() => { voice.muted = false; });
    for (const c of Object.values(CLIPS)) {
      const a = c.el; a.muted = true; const q = a.play();
      if (q && q.then) q.then(() => { if (a.muted) { a.pause(); try { a.currentTime = 0; } catch (e) {} } a.muted = false; }).catch(() => { a.muted = false; });
    }
    audioCtx();
  }
  let media = 0;
  function stopAll() { media++; vid.pause(); voice.pause(); for (const c of Object.values(CLIPS)) c.el.pause(); if ('speechSynthesis' in window) try { speechSynthesis.cancel(); } catch (e) {} }
  function seek(el, t) {
    return new Promise(res => {
      if (Math.abs(el.currentTime - t) < .02) return res();
      let done = false; const fin = () => { if (done) return; done = true; el.removeEventListener('seeked', fin); res(); };
      el.addEventListener('seeked', fin); try { el.currentTime = t; } catch (e) {} setTimeout(fin, 800);
    });
  }
  async function freeze(t) {
    stopAll();
    if (Math.abs(vid.currentTime - t) > .3) { veil.classList.add('on'); await seek(vid, t); requestAnimationFrame(() => veil.classList.remove('on')); }
    else await seek(vid, t);
  }
  let movingTok = -1;
  async function playSegment(s, e, back) {
    stopAll(); const my = media; movingTok = my;
    vid.playbackRate = state.slow ? .75 : 1;
    await seek(vid, s); if (my !== media) return false;
    state.lineView = true;
    try { await vid.play(); } catch (err) { state.lineView = false; if (movingTok === my) movingTok = -1; return false; }
    await new Promise(res => { const loop = () => { if (my !== media) return res(); if (vid.currentTime >= e - .02 || vid.ended) { vid.pause(); return res(); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
    if (my !== media) { state.lineView = false; return false; }
    await wait(380); state.lineView = false;
    if (back != null && my === media) { const fz = freeze(back); movingTok = media; await fz; await wait(60); }
    if (movingTok === media) movingTok = -1;
    return true;
  }
  async function hear(s, e) {
    stopAll(); const my = media;
    voice.playbackRate = state.slow ? .75 : 1;
    await seek(voice, s); if (my !== media) return false;
    try { await voice.play(); } catch (err) { return false; }
    await new Promise(res => { const loop = () => { if (my !== media) { voice.pause(); return res(); } if (voice.currentTime >= e - .02 || voice.ended) { voice.pause(); return res(); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
    return my === media;
  }

  /* ================= voix de synthèse (secours, quand une consigne n'est pas enregistrée) ================= */
  let frVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    frVoice = vs.find(v => /^fr[-_]FR/i.test(v.lang) && /google|amélie|amelie|thomas|audrey|marie|denise|premium|enhanced|natural/i.test(v.name)) || vs.find(v => /^fr[-_]FR/i.test(v.lang)) || vs.find(v => /^fr/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
  function speak(text) {
    stopAll(); const my = media;
    const est = 700 + text.length * (state.slow ? 95 : 72);
    return new Promise(res => {
      let done = false; const fin = () => { if (done) return; done = true; clearTimeout(to); res(my === media); };
      const to = setTimeout(fin, frVoice ? est + 2500 : est);
      if (!frVoice) return;
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = frVoice; u.lang = frVoice.lang; u.rate = state.slow ? .74 : .92; u.onend = fin; u.onerror = fin;
        setTimeout(() => { if (my === media) speechSynthesis.speak(u); else fin(); }, 60);
      } catch (e) { fin(); }
    });
  }
  function playClip(c, onTime) {
    stopAll(); const my = media, el = c.el;
    return new Promise(async res => {
      el.muted = false; try { el.currentTime = 0; } catch (e) {}
      el.playbackRate = state.slow ? .8 : 1;
      try { await el.play(); } catch (err) { return res(null); }
      if (my !== media) { el.pause(); return res(false); }
      const loop = () => {
        if (my !== media) { el.pause(); return res(false); }
        if (onTime) onTime(el.currentTime);
        if (el.ended || el.paused) return res(true);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  }

  /* ================= petits sons ================= */
  let ctx = null;
  function audioCtx() { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) {} return ctx; }
  function tone(f, t0, dur, gain, type = 'sine') {
    const c = audioCtx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, c.currentTime + t0); g.gain.linearRampToValueAtTime(gain, c.currentTime + t0 + .01);
    g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + .02);
  }
  const sfx = {
    tick() { tone(2300, 0, .02, .02, 'triangle'); if (navigator.vibrate) try { navigator.vibrate(4); } catch (e) {} },
    ok() { tone(784, 0, .22, .06); tone(1175, .09, .38, .05); tone(1568, .18, .4, .03); },
    try() { tone(392, 0, .18, .045, 'triangle'); tone(330, .1, .22, .035, 'triangle'); },
    coin() { tone(1900, 0, .08, .03, 'triangle'); tone(2600, .05, .12, .025, 'triangle'); },
  };

  /* ================= icônes ================= */
  const ICON = {
    bars: '<span class="bars"><b></b><b></b><b></b><b></b></span>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 3-3 3.6-3 6.3a3.2 3.2 0 0 1-5.6 2.1"/><path d="M9.5 9.3a2.5 2.5 0 0 1 5 0"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke-width="1.4"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    heart: '<svg viewBox="0 0 40 40" fill="currentColor"><path d="M20 34.5S5 25.6 5 15.2A7.7 7.7 0 0 1 20 11a7.7 7.7 0 0 1 15 4.2C35 25.6 20 34.5 20 34.5Z"/></svg>',
    noheart: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 34.5S5 25.6 5 15.2A7.7 7.7 0 0 1 20 11a7.7 7.7 0 0 1 15 4.2C35 25.6 20 34.5 20 34.5Z"/><path d="M7 33 33 7"/></svg>',
  };

  /* ================= la bulle de l'appli ================= */
  const Q = {
    mode(m, icon) { qb.dataset.mode = m; orbIc.innerHTML = icon || (m === 'talk' ? ICON.bars : m === 'ok' ? ICON.check : m === 'try' ? ICON.ear : ICON.speaker); },
    text(t) { qt.innerHTML = t ? t.split(' ').map(w => `<span class="wd">${w}</span>`).join(' ') : ''; qb.classList.toggle('empty', !t); },
    show(m, t, icon) { this.mode(m, icon); this.text(t); },
    async say(t, f) {
      this.mode('talk'); this.text(t); setTurn('listen');
      const words = $$('.wd', qt); words.forEach(w => w.classList.add('hid'));
      const c = clipFor(t);
      if (c) {
        const at = k => c.w.length === words.length ? c.w[k] : (c.el.duration || 2) * k / words.length;
        const r = await playClip(c, now => words.forEach((w, k) => { if (now >= at(k) - .03) w.classList.remove('hid'); }));
        if (r !== null) { words.forEach(w => w.classList.remove('hid')); return alive(f); }
      }
      const dur = 450 + t.length * (state.slow ? 85 : 62);
      words.forEach((w, k) => setTimeout(() => w.classList.remove('hid'), 80 + dur * k / words.length));
      await speak(plainSp(t));
      words.forEach(w => w.classList.remove('hid'));
      return alive(f);
    },
  };
  function setTurn(t) { document.body.dataset.turn = t; if (t !== 'you') idle.stop(); }
  function goBtn(kind, label, fn) {
    goSlot.innerHTML = ''; if (!kind) return;
    const b = document.createElement('button'); b.className = 'go';
    b.innerHTML = `<span>${label}</span>${kind === 'check' ? ICON.check : ICON.arrow}`;
    b.addEventListener('click', () => { unlock(); idle.reset(); fn(); });
    goSlot.append(b);
  }
  $('#orb').addEventListener('click', () => {
    unlock();
    if (!state.ask || document.body.dataset.turn !== 'you' || qb.dataset.mode !== 'you') return;
    const f = flow;
    Q.say(state.ask, f).then(ok => { if (ok && alive(f)) yourTurn(); });
  });
  replayBtn.addEventListener('click', () => { unlock(); idle.reset(); if (document.body.dataset.turn === 'you' && state.replay) state.replay(); });

  /* ================= la réplique en cours, en bulle ================= */
  let curLine = -1, lastAmb = -1;
  function renderLine(li) {
    curLine = li;
    if (li < 0 || !state.cc) { talk.classList.remove('line'); return; }
    const L = LINES[li];
    lrow.dataset.side = PEOPLE[L.who].side; lav.src = PEOPLE[L.who].img;
    lwords.innerHTML = L.words.map((w, k) => `<span class="w" data-k="${k}">${w.t}</span>`).join('');
    $$('.w', lwords).forEach(span => span.addEventListener('click', () => { const w = L.words[+span.dataset.k]; hear(w.s - .02, w.e + .06); }));
    talk.classList.add('line');
    if (!reduced) lrow.animate([{ opacity: 0, transform: 'translateY(12px) scale(.88)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  }
  function loop() {
    const t = vid.currentTime;
    let li = -1;
    if (state.lineView) { li = LINES.findIndex(L => t >= L.s - .1 && t <= L.e + .45); if (li < 0) li = curLine; }
    talk.classList.toggle('playing', state.lineView);
    cam.classList.toggle('moving', movingTok === media);
    if (li !== curLine) renderLine(li);
    if (li >= 0 && state.cc) $$('.w', lwords).forEach((span, k) => { const w = LINES[li].words[k]; span.classList.toggle('past', t >= w.e); span.classList.toggle('now', t >= w.s - .03 && t < w.e); });
    if (Math.abs(t - lastAmb) > .04 && vid.readyState >= 2) { lastAmb = t; try { amb.getContext('2d').drawImage(vid, 0, 0, amb.width, amb.height); } catch (e) {} }
    requestAnimationFrame(loop);
  }
  const posterImg = new Image(); posterImg.src = DON.poster; posterImg.onload = () => { try { amb.getContext('2d').drawImage(posterImg, 0, 0, amb.width, amb.height); } catch (e) {} };

  /* ================= sur l'image ================= */
  function tag(p, pos, show = true, stem = 34, plus) {
    const el = $(`.tag[data-p="${p}"]`);
    el.style.left = pos[0] + '%'; el.style.top = pos[1] + '%'; el.style.setProperty('--stem', stem + 'px');
    if (plus !== undefined) { $('small', el).textContent = plus; el.classList.toggle('aged', !!plus); }
    if (!show) { el.classList.remove('show'); return; }
    layout();
    if (!el.classList.contains('show')) { void el.offsetWidth; el.classList.add('show'); }
  }
  function hideTags() { $$('.tag').forEach(el => el.classList.remove('show')); }
  function tagAll(plus = {}) { for (const k of Object.keys(PEOPLE)) tag(k, PEOPLE[k].anchor, true, 64, plus[k] || ''); }
  function spotAt(x, y, rx, ry, dim = 1) { spot.style.setProperty('--sx', x + '%'); spot.style.setProperty('--sy', y + '%'); spot.style.setProperty('--srx', rx + '%'); spot.style.setProperty('--sry', ry + '%'); spot.style.setProperty('--dim', dim); }
  function spotOn(p, dim = 1) { const [x, y, rx, ry] = PEOPLE[p].spot; spotAt(x, y, rx, ry, dim); }
  function spotOff() { spot.style.setProperty('--dim', 0); spot.style.setProperty('--srx', '140%'); spot.style.setProperty('--sry', '140%'); }
  function rippleAt(ev) { const b = cam.getBoundingClientRect(), r = document.createElement('div'); r.className = 'ripple'; r.style.left = (ev.clientX - b.left) + 'px'; r.style.top = (ev.clientY - b.top) + 'px'; cam.append(r); setTimeout(() => r.remove(), 800); }
  /* des zones à toucher sur l'image (une personne, un objet) : zones([{ id, label, x, y, w, h }], (id, ev) => …) */
  function zones(list, onPick) {
    $$('.hit', cam).forEach(h => h.remove()); if (!list) { cam.classList.remove('asking'); return; }
    for (const z of list) {
      const b = document.createElement('button'); b.className = 'hit zone'; b.setAttribute('aria-label', z.label); b.dataset.id = z.id;
      Object.assign(b.style, { left: z.x + '%', top: z.y + '%', width: z.w + '%', height: z.h + '%' });
      b.addEventListener('click', ev => { if (document.body.dataset.turn !== 'you' || !cam.classList.contains('asking')) return; unlock(); rippleAt(ev); idle.clear(); onPick(z.id, ev, z); });
      cam.append(b);
    }
  }
  /* un objet qui vole d'un élément vers un autre (vers le sac, vers le plateau) */
  function fly(from, to, html, opts = {}) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const el = document.createElement('div'); el.className = 'volant'; el.innerHTML = html;
    Object.assign(el.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' }); document.body.append(el);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const an = el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx * .5}px, ${dy * .5 - 50}px) scale(.8)`, offset: .5 }, { transform: `translate(${dx}px, ${dy}px) scale(${opts.scale || .35})`, opacity: .2 }],
      { duration: reduced ? 1 : 620, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    return an.finished.catch(() => {}).then(() => el.remove());
  }

  /* ================= doigt fantôme ================= */
  const idle = {
    timer: null, anim: null, fn: null,
    set(fn, w = 3500) { this.fn = fn; this.reset(w); },
    reset(w = 7000) { clearTimeout(this.timer); this.stop(); if (this.fn && !reduced) this.timer = setTimeout(() => this.play(), w); },
    stop() { if (this.anim) { this.anim.cancel(); this.anim = null; } ghost.style.opacity = 0; },
    clear() { this.fn = null; clearTimeout(this.timer); this.stop(); },
    play() { if (!this.fn || document.body.dataset.turn !== 'you') return this.reset(3000); const fr = this.fn(); if (!fr) return; this.anim = ghost.animate(fr, { duration: 2600, easing: 'ease-in-out' }); this.anim.onfinish = () => { ghost.style.opacity = 0; this.reset(6500); }; },
  };
  const at = (x, y, o = 1, s = 1) => ({ left: x + 'px', top: y + 'px', opacity: o, transform: `scale(${s})` });
  const tapHere = el => () => { if (!el || !el.isConnected) return null; const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; return [at(x, y + 50, 0), at(x, y + 14, 1), at(x, y, 1), at(x, y, 1, .75), at(x, y, 1), at(x, y, 0)]; };

  /* ================= panneau du geste, cases à trier ================= */
  function setSide(html, onMount) {
    if (!html) { side.classList.remove('on'); state.sideOn = false; setTimeout(() => { if (!side.classList.contains('on')) side.innerHTML = ''; }, 400); return; }
    side.innerHTML = html; onMount && onMount(side);
  }
  function setSplit(on) {
    state.split = on; layout();
    [binNo, binYes].forEach(b => b.classList.toggle('on', on));
    if (!on) { deck.innerHTML = ''; setTimeout(() => { if (!state.split) $$('.got', binNo.parentElement).forEach(g => g.innerHTML = ''); }, 450); }
  }
  function yourTurn() { Q.mode('you'); setTurn('you'); }

  /* deux essais, puis la réponse : faux(f, n) dit « Écoute encore », rejoue le passage, et renvoie true quand il faut montrer la réponse */
  async function faux(f, seg, msg = 'Non. Écoute encore.') {
    state.essais++; sfx.try();
    Q.show('try', state.essais >= 2 ? 'Écoute bien.' : msg);
    await wait(850); if (!alive(f)) return null;
    await playSegment(seg[0], seg[1], WIDE); if (!alive(f)) return null;
    return state.essais >= 2;
  }
  async function juste(f, msg, seg) {
    sfx.ok(); Q.show('ok', msg); state.essais = 0;
    if (seg) await hear(seg[0], seg[1]);
    return alive(f);
  }

  const ORDRE = SC.ordre;
  function suivant(step) { const i = ORDRE.indexOf(step); return i >= 0 && i + 1 < ORDRE.length ? ORDRE[i + 1] : 'end'; }
  function suite(label = 'Suivant') { const nx = suivant(state.step); goBtn('next', label, () => go(nx)); setTurn('you'); }

  function go(step) {
    flow++; stopAll(); idle.clear();
    Object.assign(state, { step, ask: null, replay: null, lineView: false, essais: 0 });
    cam.classList.remove('asking'); zones(null); spotOff(); goBtn(null); setSplit(false);
    STEPS[step](flow);
  }
  const STEPS = {};

  /* ================= 0 · regarder ================= */
  STEPS.intro = f => {
    hideTags(); setSide(null); frameTo(CROPS.full, false);
    bigplay.classList.remove('gone'); seek(vid, 0);
    Q.show('you', '');
    state.replay = watch; setTurn('you');
  };
  async function watch() {
    unlock(); idle.clear(); bigplay.classList.add('gone');
    const f = flow; Q.text(''); goBtn(null); setTurn('listen');
    await playSegment(0, DON.duree, null);
    if (!alive(f) || state.step !== 'intro') return;
    goBtn('next', 'Commencer', () => go(ORDRE[0]));
    Q.mode('you'); setTurn('you');
  }
  bigplay.addEventListener('click', watch);

  /* ================= bilan : les fiches des personnes, chaque élément se réécoute ================= */
  STEPS.end = async f => {
    hideTags(); setSide(null); frameTo(CROPS.full, false);
    await freeze(WIDE); if (!alive(f)) return;
    const B = typeof SC.bilan === 'function' ? SC.bilan(api) : SC.bilan;
    tagAll(B.tags || {});
    const fact = (x) => `<button class="fact ${x.cls || 'quote'}" data-s="${x.seg[0]}" data-e="${x.seg[1]}">${x.icon ? ICON[x.icon] || x.icon : ICON.speaker}<span>${x.text}</span></button>`;
    setSide(`<div class="panel glass"><div class="cast">${Object.entries(PEOPLE).map(([k, p]) => `
        <div class="fiche" data-p="${k}" data-side="${p.side}"><div class="portrait"><img src="${p.img}" alt="${p.name}"></div>
          <div class="who"><span class="name">${p.name}</span><div class="facts">${(B.faits[k] || []).map(fact).join('')}</div></div></div>`).join('')}
      </div></div>`, p => {
      $$('.fact', p).forEach(b => b.addEventListener('click', async () => { unlock(); if (document.body.dataset.turn !== 'you') return; setTurn('listen'); await playSegment(+b.dataset.s, +b.dataset.e, WIDE); if (alive(f)) setTurn('you'); }));
    });
    frameTo(CROPS.full, true);
    setTimeout(() => { if (alive(f)) flyFaces(); }, 800);
    state.ask = 'Bravo' + NB + '! Tu as compris la scène.';
    if (!await Q.say(state.ask, f)) return;
    Q.mode('ok');
    state.replay = async () => { setTurn('listen'); await playSegment(0, DON.duree, WIDE); if (alive(f)) { Q.mode('ok'); setTurn('you'); } };
    goBtn('next', 'Recommencer', () => go('intro'));
    setTurn('you');
  };
  function flyFaces() {
    const sr = cam.getBoundingClientRect();
    Object.keys(PEOPLE).forEach((who, k) => {
      const img = $(`.fiche[data-p="${who}"] .portrait img`, side); if (!img) return;
      const tr = img.getBoundingClientRect(); if (!tr.width || reduced) return;
      const [l, t, w, h] = PEOPLE[who].crop;
      const fx = sr.left + sr.width * l / 100, fy = sr.top + sr.height * t / 100, fw = sr.width * w / 100, fh = sr.height * h / 100;
      const fl = document.createElement('img'); fl.className = 'flyer'; fl.src = PEOPLE[who].img; fl.alt = '';
      Object.assign(fl.style, { left: tr.left + 'px', top: tr.top + 'px', width: tr.width + 'px', height: tr.height + 'px' });
      document.body.append(fl); img.style.opacity = 0;
      const sx = fw / tr.width, sy = fh / tr.height;
      const a = fl.animate([
        { transform: `translate(${fx - tr.left}px, ${fy - tr.top}px) scale(${sx}, ${sy})`, transformOrigin: '0 0', borderRadius: '4px', opacity: 0 },
        { opacity: 1, offset: .12 },
        { transform: `translate(${(fx - tr.left) * .4}px, ${(fy - tr.top) * .4 - 30}px) scale(${1 + (sx - 1) * .4}, ${1 + (sy - 1) * .4})`, transformOrigin: '0 0', offset: .5, boxShadow: '0 30px 60px rgba(0,0,0,.45)' },
        { transform: 'translate(0,0) scale(1,1)', transformOrigin: '0 0', borderRadius: '16px', boxShadow: '0 0 0 rgba(0,0,0,0)' },
      ], { duration: 950, delay: k * 140, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'both' });
      a.finished.then(() => { img.style.opacity = 1; fl.remove(); }).catch(() => fl.remove());
    });
  }

  /* ================= les étapes du scénario ================= */
  var api = {
    $, $$, wait, NB, reduced, state, alive, go, suite, Q, goBtn, yourTurn, setTurn, frameTo, CROPS, WIDE, LINES, PEOPLE,
    freeze, playSegment, hear, phrase, ligne, tag, tagAll, hideTags, spotOn, spotAt, spotOff, rippleAt, zones, fly,
    setSide, side, setSplit, binNo, binYes, deck, idle, at, tapHere, sfx, ICON, win, cam, layout, speak, unlock, faux, juste,
    flow: () => flow,
  };
  Object.assign(STEPS, SC.etapes(api));

  /* ================= outils ================= */
  ccBtn.addEventListener('click', () => { state.cc = !state.cc; ccBtn.setAttribute('aria-pressed', state.cc); curLine = -99; });
  slowBtn.addEventListener('click', () => { state.slow = !state.slow; slowBtn.setAttribute('aria-pressed', state.slow); vid.playbackRate = voice.playbackRate = state.slow ? .75 : 1; });
  document.addEventListener('pointerdown', () => unlock(), { once: true });
  cam.addEventListener('click', ev => { if (cam.classList.contains('asking') && !ev.target.closest('.hit')) { rippleAt(ev); idle.reset(); } });

  layout();
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('boot')));
  requestAnimationFrame(loop);
  const start = (location.hash || '').replace('#', '');
  if ([...ORDRE, 'end'].includes(start)) { bigplay.classList.add('gone'); go(start); } else go('intro');
})();
