/* Chez le vétérinaire : un jeune homme amène son chat (on ne le voit pas) ; il ne mange plus depuis hier, il ne sort jamais.
   Coupes à 1,92, 3,92, 5,96 et 8,92 s : plan large, le jeune homme de près, la vétérinaire de près, lui de près, plan large.
   1 · elle demande « Qu'est-ce qu'il a, votre chat ? », il répond : sur la fiche de consultation, on coche le problème
       (il ne mange plus / ne dort plus / ne boit plus / ne joue plus : même tournure, seul le verbe change) ;
   2 · il redit « depuis hier » : on tourne les pages d'un calendrier à feuilles (aujourd'hui mercredi 18) jusqu'au bon jour,
       puis Valider (on peut aussi aller vers demain : il faut savoir dans quel sens) ;
   3 · « Il est sorti dehors cette semaine ? — Non, jamais. Il reste toujours à l'appartement. » : on fait glisser le chat
       dans l'appartement, le jardin ou la rue.
   Pas de geste sur l'image : le chat n'est jamais à l'écran, il n'y a rien dans la pièce qui porte une information du
   dialogue (toucher la vétérinaire ou le bureau ne vérifierait rien). L'image figée (9,5 s, plan large) ne donne aucune réponse. */
window.SCENARIO = (() => {
  const NB = '\u202f';
  /* 1 · la fiche : quatre problèmes, même tournure */
  const ICO = {
    dort: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M24 7a13 13 0 1 0 10 21A11 11 0 0 1 24 7z" fill="#5865B8"/><path d="M27 9h6l-6 7h6" fill="none" stroke="#5865B8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mange: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="13" cy="20" r="3.4" fill="#9A5B2E"/><circle cx="19.5" cy="18" r="3.4" fill="#B06A35"/><circle cx="26" cy="20" r="3.4" fill="#9A5B2E"/><circle cx="16" cy="15" r="3" fill="#B06A35"/><circle cx="23" cy="14" r="3" fill="#9A5B2E"/><path d="M5 22h30l-3.5 10a3 3 0 0 1-2.8 2H11.3a3 3 0 0 1-2.8-2z" fill="#E0713A"/></svg>',
    boit: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="#3AA8FF"/><path d="M5 24h30l-3.5 8a3 3 0 0 1-2.8 2H11.3a3 3 0 0 1-2.8-2z" fill="#2B7BC4"/><path d="M7 24h26" stroke="#9AD3FF" stroke-width="3" stroke-linecap="round"/></svg>',
    joue: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="19" cy="19" r="12" fill="#E8689A"/><path d="M9 14c6 2 13 9 15 16M12 9c6 4 13 12 17 17M8 21c5 1 9 5 11 10M20 7c4 4 9 10 11 14" fill="none" stroke="#B83F70" stroke-width="1.8" stroke-linecap="round"/><path d="M29 27c3 3 6 4 8 3" fill="none" stroke="#E8689A" stroke-width="2" stroke-linecap="round"/></svg>',
  };
  const PROBLEMES = [
    { id: 'dort', txt: 'Il ne dort plus.', msg: 'Non' + NB + ': il ne parle pas de dormir.' },
    { id: 'mange', txt: 'Il ne mange plus.', bon: true },
    { id: 'joue', txt: 'Il ne joue plus.', msg: 'Non' + NB + ': il ne parle pas de jouer.' },
    { id: 'boit', txt: 'Il ne boit plus.', msg: 'Non' + NB + ': il ne parle pas de boire.' },
  ];
  /* 2 · le calendrier à feuilles : aujourd'hui (le jour de la visite), mercredi 18 novembre */
  const JOURS = [
    { o: -7, j: 'mercredi', n: 11, l: 'il y a une semaine' },
    { o: -6, j: 'jeudi', n: 12, l: 'il y a six jours' },
    { o: -5, j: 'vendredi', n: 13, l: 'il y a cinq jours' },
    { o: -4, j: 'samedi', n: 14, l: 'il y a quatre jours' },
    { o: -3, j: 'dimanche', n: 15, l: 'il y a trois jours' },
    { o: -2, j: 'lundi', n: 16, l: 'avant-hier' },
    { o: -1, j: 'mardi', n: 17, l: 'hier' },
    { o: 0, j: 'mercredi', n: 18, l: "aujourd'hui" },
    { o: 1, j: 'jeudi', n: 19, l: 'demain' },
    { o: 2, j: 'vendredi', n: 20, l: 'après-demain' },
  ];
  const AUJ = JOURS.findIndex(x => x.o === 0), BON_JOUR = JOURS.findIndex(x => x.o === -1);
  /* 3 · trois endroits (dessins simples) et le chat */
  const LIEUX = [
    { id: 'jardin', nom: 'le jardin', msg: 'Non' + NB + ': le jardin, c\'est dehors.',
      svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="#BFE3F5"/><circle cx="80" cy="18" r="9" fill="#FFD23F"/><rect y="62" width="100" height="38" fill="#6CBF5A"/><rect x="24" y="38" width="7" height="30" fill="#8A5A35"/><circle cx="27" cy="32" r="17" fill="#3E9A48"/><circle cx="17" cy="40" r="10" fill="#3E9A48"/><circle cx="38" cy="40" r="10" fill="#3E9A48"/><path d="M52 62V54M60 62V50M68 62V55M76 62V51M84 62V54M92 62V50M48 56h48" stroke="#FFFFFF" stroke-width="2.4"/><circle cx="58" cy="82" r="3" fill="#FFD23F"/><circle cx="72" cy="88" r="3" fill="#F28AB2"/><circle cx="86" cy="80" r="3" fill="#FFFFFF"/></svg>' },
    { id: 'appartement', nom: "l'appartement", bon: true,
      svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="#F3E3C8"/><rect y="78" width="100" height="22" fill="#B9845A"/><path d="M0 78h100" stroke="#8E6240" stroke-width="2"/><rect x="10" y="14" width="34" height="38" rx="2" fill="#BFE3F5" stroke="#FFFFFF" stroke-width="4"/><path d="M27 14v38M10 33h34" stroke="#FFFFFF" stroke-width="3"/><rect x="52" y="56" width="40" height="16" rx="5" fill="#4A6FA5"/><rect x="54" y="48" width="36" height="12" rx="5" fill="#5B82BA"/><rect x="52" y="72" width="4" height="7" fill="#33465F"/><rect x="88" y="72" width="4" height="7" fill="#33465F"/><path d="M72 14v12" stroke="#7A6A55" stroke-width="2"/><path d="M64 26h16l-3 9H67z" fill="#FFD23F"/></svg>' },
    { id: 'rue', nom: 'la rue', msg: 'Non' + NB + ': la rue, c\'est dehors.',
      svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="#C9D3DE"/><rect x="6" y="10" width="26" height="46" fill="#D98E6C"/><rect x="38" y="20" width="24" height="36" fill="#A9B8C9"/><rect x="68" y="6" width="28" height="50" fill="#E3C27A"/><g fill="#FFFFFF" opacity=".85"><rect x="11" y="16" width="6" height="7"/><rect x="21" y="16" width="6" height="7"/><rect x="11" y="30" width="6" height="7"/><rect x="21" y="30" width="6" height="7"/><rect x="43" y="26" width="6" height="7"/><rect x="52" y="26" width="6" height="7"/><rect x="73" y="12" width="7" height="8"/><rect x="85" y="12" width="7" height="8"/><rect x="73" y="28" width="7" height="8"/><rect x="85" y="28" width="7" height="8"/></g><rect y="56" width="100" height="9" fill="#E6E9EE"/><rect y="65" width="100" height="35" fill="#4A505C"/><path d="M4 82h14M30 82h14M56 82h14M82 82h14" stroke="#FFFFFF" stroke-width="3"/><rect x="52" y="68" width="34" height="11" rx="4" fill="#E5383B"/><path d="M58 68l4-7h14l4 7z" fill="#C92A2D"/><circle cx="60" cy="80" r="3.6" fill="#1D2029"/><circle cx="79" cy="80" r="3.6" fill="#1D2029"/></svg>' },
  ];
  const CHAT = `<svg viewBox="0 0 64 72" aria-hidden="true">
      <path d="M50 64c10-2 13-12 9-20" fill="none" stroke="#C9772E" stroke-width="6" stroke-linecap="round"/>
      <path d="M14 66c-2-16 4-30 18-30s20 14 18 30z" fill="#E8954A"/>
      <path d="M26 46c3 2 9 2 12 0M24 54c4 2 12 2 16 0" stroke="#C9772E" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M17 12l3 16 12-6zM47 12l-3 16-12-6z" fill="#E8954A"/>
      <path d="M20 17l2 8 5-3zM44 17l-2 8-5-3z" fill="#F6C4A0"/>
      <circle cx="32" cy="27" r="14" fill="#E8954A"/>
      <circle cx="26.5" cy="26" r="2.2" fill="#2B2B2B"/><circle cx="37.5" cy="26" r="2.2" fill="#2B2B2B"/>
      <path d="M30 31h4l-2 2.4z" fill="#D9606B"/>
      <path d="M22 32h-8M22 34.5l-7 2.5M42 32h8M42 34.5l7 2.5" stroke="#7A4A22" stroke-width="1.2" stroke-linecap="round"/>
      <ellipse cx="25" cy="66" rx="6" ry="3" fill="#F6C4A0"/><ellipse cx="39" cy="66" rx="6" ry="3" fill="#F6C4A0"/>
    </svg>`;

  return {
    plans: [{ de: 0, cx: { veterinaire: .28, homme: .74 } }, { de: 1.917, cx: { veterinaire: .05, homme: .53 } }, { de: 3.917, cx: { veterinaire: .42, homme: .9 } },
      { de: 5.958, cx: { veterinaire: .05, homme: .53 } }, { de: 8.917, cx: { veterinaire: .3, homme: .72 } }],
    ordre: ['probleme', 'depuis', 'dehors'],
    bravo: 'Bravo' + NB + '! Maintenant, la vétérinaire peut soigner le chat.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « Qu'est-ce qu'il a, votre chat ? — Il ne mange plus… » : on coche le problème sur la fiche */
        async probleme(f) {
          const SEG = [ligne(0)[0], ligne(1)[1]];
          let fini = false;
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.fv-case[data-id="dort"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'homme', seg: SEG, sideW: 440, consigne: 'Quel est le problème du chat' + NB + '? Clique sur la bonne case.',
            panneau: `<div class="panel glass veto"><p class="ptitre">Quel est le problème du chat${NB}?</p>
              <div class="fv"><div class="fv-pince" aria-hidden="true"></div>
                <div class="fv-tete"><b>Fiche de consultation</b><span>Animal${NB}: un chat</span></div>
                <p class="fv-q">Problème${NB}:</p>
                <div class="fv-cases" role="group" aria-label="Problème du chat">
                ${PROBLEMES.map(p => `<button class="fv-case" data-id="${p.id}" aria-label="${p.txt}"><span class="boite" aria-hidden="true"></span><span class="ic">${ICO[p.id]}</span><span class="txt">${p.txt}</span><span class="etat" aria-hidden="true"></span></button>`).join('')}
                </div></div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          $$('.fv-case', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const p = PROBLEMES.find(x => x.id === b.dataset.id);
            b.classList.add('coche');
            if (p.bon) {
              fini = true; $$('.fv-case', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); $('.etat', b).textContent = 'oui';
              if (!await juste(f, 'Oui' + NB + '! Il ne mange plus.')) return;
              suite();
            } else {
              b.classList.add('faux'); $('.etat', b).textContent = 'non'; secouer(b);
              const montrer = await faux(f, ligne(1), p.msg); if (montrer === null) return;
              b.classList.remove('faux', 'coche'); $('.etat', b).textContent = '';
              if (montrer) $('.fv-case[data-id="mange"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · « depuis hier » : on tourne les pages du calendrier jusqu'au bon jour, puis Valider */
        async depuis(f) {
          const SEG = ligne(1);
          let i = AUJ, fini = false;
          const peindre = (sens = 0) => {
            const c = $('.cal', side); if (!c) return;
            const d = JOURS[i], page = $('.cal-page', c);
            $('.cal-j', c).textContent = d.j; $('.cal-n', c).textContent = d.n; $('.cal-l', c).textContent = d.l;
            page.setAttribute('aria-label', `${d.j} ${d.n} novembre, ${d.l}`);
            $('.cal-av', side).disabled = i === 0; $('.cal-ap', side).disabled = i === JOURS.length - 1;
            c.classList.toggle('auj', i === AUJ);
            if (sens && page.animate && !A.reduced) page.animate([{ transform: `translateX(${sens * -46}px) rotate(${sens * -5}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.32,.72,0,1)' });
          };
          const tourner = sens => {                            // sens −1 : le jour d'avant ; +1 : le jour d'après
            if (!tour() || fini) return;
            const n = Math.max(0, Math.min(JOURS.length - 1, i + sens)); if (n === i) { secouer($('.cal', side)); return; }
            A.unlock(); idle.reset(); i = n; sfx.tick(); peindre(sens);
            const c = $('.cal', side); c.classList.remove('faux');
            if (tour()) Q.show('you', state.ask);
          };
          const glisser = () => {                              // le doigt fantôme tourne une page vers demain (pas vers la réponse)
            const p = $('.cal-page', side); if (!p || !p.isConnected) return null;
            const r = p.getBoundingClientRect(), y = r.top + r.height * .55, x1 = r.left + r.width * .72, x2 = r.left + r.width * .28;
            return [at(x1, y + 30, 0), at(x1, y, 1), at(x1, y, 1, .82), at(x2, y, 1, .82), at(x2, y, 1), at(x2, y, 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 5000); };
          if (!await avant(f, {
            qui: 'homme', seg: SEG, sideW: 440, consigne: 'Il ne mange plus depuis quand' + NB + '? Tourne les pages du calendrier, puis clique sur Valider.',
            panneau: `<div class="panel glass veto"><p class="ptitre">Il ne mange plus depuis quand${NB}?</p>
              <div class="cal-zone">
                <button class="cal-fl cal-av" aria-label="Le jour d'avant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="cal"><div class="cal-haut" aria-hidden="true"><i></i><i></i><span>novembre</span></div>
                  <div class="cal-page" tabindex="0" role="group"><span class="cal-j"></span><b class="cal-n"></b><span class="cal-l"></span></div></div>
                <button class="cal-fl cal-ap" aria-label="Le jour d'après"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              </div>
              <p class="cal-aide">Le jour de la visite${NB}: mercredi 18 novembre.</p></div>`,
            monte: p => {
              $('.cal-av', p).addEventListener('click', () => tourner(-1));
              $('.cal-ap', p).addEventListener('click', () => tourner(1));
              const page = $('.cal-page', p); let st = null;
              page.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault(); st = { x: e.clientX, id: e.pointerId };
                try { page.setPointerCapture(e.pointerId); } catch (err) {}
              });
              page.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x; page.style.transform = `translateX(${Math.max(-60, Math.min(60, dx)) * .6}px)`;
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x; st = null; page.style.transform = '';
                if (e.type === 'pointerup' && Math.abs(dx) > 36) tourner(dx > 0 ? -1 : 1);   // vers la droite : la page d'avant, comme dans un livre
              };
              page.addEventListener('pointerup', lacher); page.addEventListener('pointercancel', lacher);
              page.addEventListener('keydown', e => { const s = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (s) { e.preventDefault(); tourner(s); } });
              peindre();
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            setTurn('wait'); goBtn(null); idle.clear();
            const c = $('.cal', side), d = JOURS[i];
            if (i === BON_JOUR) {
              fini = true; c.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Depuis hier, mardi.')) return;
              suite();
            } else {
              c.classList.add('faux'); secouer(c);
              const msg = d.o === 0 ? "Non, ça, c'est aujourd'hui." : 'Pas ' + d.l + '.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              c.classList.remove('faux');
              if (montrer) {                                   // deux essais : on pose la réponse
                i = BON_JOUR; peindre(-1); fini = true; c.classList.add('juste');
                Q.show('ok', 'Depuis hier' + NB + ': mardi 17.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · « Il est sorti dehors ? — Non, jamais. Il reste toujours à l'appartement. » : on fait glisser le chat au bon endroit */
        async dehors(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          const chat = () => $('.chat', side), lieu = id => $(`.lieu[data-id="${id}"]`, side);
          let fini = false;
          function poser(v, anime = true) {
            const el = chat(); if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!v) { el.style.transition = tr; el.style.transform = ''; return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = $('.sol', v).getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height * .7 - (a.top + a.height / 2)}px) scale(.7)`;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = chat(), vers = lieu('rue'); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .55;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const v = lieu(id), L = LIEUX.find(x => x.id === id); poser(v);
            $$('.lieu', side).forEach(x => x.classList.remove('chaud'));
            await wait(450); if (!alive(f)) return;
            if (L.bon) {
              fini = true; $$('.lieu', side).forEach(x => x.classList.remove('indice')); v.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il ne sort jamais' + NB + ": il reste à l'appartement.")) return;
              suite();
            } else {
              v.classList.add('faux'); secouer(v);
              const montrer = await faux(f, SEG, L.msg); if (montrer === null) return;
              v.classList.remove('faux'); poser(null);
              if (montrer) lieu('appartement').classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'homme', seg: SEG, sideW: 540, consigne: 'Où reste le chat' + NB + '? Fais glisser le chat au bon endroit.',
            panneau: `<div class="panel glass veto"><p class="ptitre">Fais glisser le chat au bon endroit.</p>
              <div class="lieux">${LIEUX.map(l => `<button class="lieu" data-id="${l.id}" aria-label="${l.nom}"><span class="sol">${l.svg}</span><span class="nom">${l.nom}</span></button>`).join('')}</div>
              <div class="depart"><div class="chat" aria-hidden="true">${CHAT}</div><span class="legende">le chat</span></div></div>`,
            monte: p => {
              const el = $('.chat', p); let st = null;
              el.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                el.style.transition = 'none'; el.style.transform = '';
                st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                try { el.setPointerCapture(e.pointerId); } catch (err) {}
                el.classList.add('tenu');
              });
              el.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x, dy = e.clientY - st.y;
                if (!st.bouge && Math.hypot(dx, dy) > 5) { st.bouge = true; sfx.tick(); }
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
                $$('.lieu', p).forEach(v => v.classList.toggle('chaud', dedans(v, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenu');
                const v = e.type === 'pointerup' && tour() ? $$('.lieu', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.lieu', p).forEach(x => x.classList.remove('chaud'));
                if (v) choisir(v.dataset.id); else poser(null);
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.lieu', p).forEach(v => v.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(v.dataset.id); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        veterinaire: [{ text: "Qu'est-ce qu'il a, votre chat" + A.NB + '?', seg: A.ligne(0) }, { text: 'Il est sorti dehors' + A.NB + '?', seg: A.ligne(2) }],
        homme: [{ text: 'Il ne mange plus.', seg: A.phrase('Il ne mange plus') }, { text: 'depuis hier', seg: A.phrase('depuis hier') }, { text: "Il reste toujours à l'appartement.", seg: A.phrase("Il reste toujours à l'appartement") }],
      },
    }),
  };
})();
