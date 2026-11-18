/* Quel quai ? À la gare, une voyageuse demande à un agent le quai du train pour Nantes, puis s'il est à l'heure.
   1 · dans la vidéo, un QTE : on appuie sur le bouton quand elle dit « Nantes » (pas « Excusez-moi », pas « le train pour ») ;
   2 · l'agent redit le numéro du quai (la vidéo resserrée sur lui) : à côté, l'entrée de quatre quais (2, 3, 4 et 13) ;
       on fait glisser la valise de la voyageuse jusqu'au bon quai (ou on clique sur le quai) ;
   3 · ils redisent « Le train est à l'heure ? — Oui, il est à l'heure. » : sur un tableau des départs, trois trains pour
       Nantes (quai 3 en retard, quai 3 à l'heure, quai 13 à l'heure) ; on clique sur le sien.
   (L'image figée ne donne rien : le vrai tableau de la gare est illisible, et personne ne montre de numéro.) */
window.SCENARIO = (() => {
  const NB = ' ';
  const LETTRES = { 2: 'deux', 3: 'trois', 4: 'quatre', 13: 'treize' };
  const QUAIS = [2, 3, 4, 13];
  /* l'entrée d'un quai, vue du hall : le quai gris entre deux voies, la ligne jaune, le bout d'un train au fond */
  const QUAI_SVG = `<svg viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 150 34 0h32l34 150z" fill="#3A4150"/>
      <path d="M4 150 36 0M14 150 39 0M86 150 61 0M96 150 64 0" stroke="#8C95A6" stroke-width="1.6"/>
      <path d="M22 150 42 0h16l20 150z" fill="#D5DAE2"/>
      <path d="M27 150 43.4 0M73 150 56.6 0" stroke="#F5C518" stroke-width="2.2" stroke-dasharray="7 5"/>
      <rect x="34.5" y="2" width="9" height="12" rx="2" fill="#E9ECF1"/><rect x="56.5" y="2" width="9" height="12" rx="2" fill="#E9ECF1"/>
    </svg>`;
  /* sa valise : une valise à roulettes noire, la poignée sortie */
  const VALISE = `<svg viewBox="0 0 64 92" aria-hidden="true">
      <path d="M24 30V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v24" fill="none" stroke="#9AA3B2" stroke-width="4"/>
      <rect x="22" y="1" width="20" height="7" rx="3.5" fill="#1D2029"/>
      <rect x="8" y="28" width="48" height="54" rx="8" fill="#2B2F3A"/>
      <path d="M20 34v42M32 34v42M44 34v42" stroke="#3F4554" stroke-width="3" stroke-linecap="round"/>
      <rect x="8" y="28" width="48" height="54" rx="8" fill="none" stroke="#151820" stroke-width="2"/>
      <circle cx="17" cy="86" r="5" fill="#151820"/><circle cx="47" cy="86" r="5" fill="#151820"/>
    </svg>`;
  /* le tableau des départs : trois trains pour Nantes, un seul au quai 3 et à l'heure */
  const TRAINS = [
    { id: 'lyon', h: '10:04', dest: 'Lyon', q: '4', info: "à l'heure", msg: 'Ce train va à Lyon.' },
    { id: 'nantes1', h: '10:12', dest: 'Nantes', q: '3', info: 'retard 20 min', msg: 'Ce train a vingt minutes de retard.' },
    { id: 'rennes', h: '10:25', dest: 'Rennes', q: '3', info: "à l'heure", msg: 'Ce train va à Rennes.' },
    { id: 'nantes2', h: '10:40', dest: 'Nantes', q: '3', info: "à l'heure", bon: true },
    { id: 'nantes3', h: '10:48', dest: 'Nantes', q: '13', info: "à l'heure", msg: 'Ce train part du quai treize.' },
    { id: 'bordeaux', h: '10:55', dest: 'Bordeaux', q: '2', info: 'supprimé', msg: 'Ce train va à Bordeaux.' },
  ];

  return {
    plans: [{ de: 0, cx: { voyageuse: .33, agent: .9 } }, { de: 2.46, cx: { voyageuse: .12, agent: .62 } }, { de: 4.08, cx: { voyageuse: .34, agent: .5 } },
      { de: 5.88, cx: { voyageuse: .1, agent: .62 } }, { de: 7.75, cx: { voyageuse: .36, agent: .9 } }],
    ordre: ['nantes', 'quai', 'heure'],
    bravo: 'Bravo' + NB + '! Elle a trouvé son train' + NB + ': quai trois, à l\'heure.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, wait, avant, qte, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · dans la vidéo, un QTE : appuyer quand elle dit « Nantes » */
        async nantes(f) {
          const VILLE = phrase('Nantes'), TRAIN = phrase('le train pour'), fin = VILLE[1] + .55;
          if (!await qte(f, { mot: 'Nantes', consigne: 'Appuie sur le bouton quand tu entends le mot Nantes.', de: 0, a: ligne(0)[1] + .5,
            cibles: [{ s: VILLE[0] - .08, e: fin }],
            pieges: [
              { s: 0, e: TRAIN[0], msg: 'Pas encore' + NB + ': là, elle dit «' + NB + 'Excusez-moi' + NB + '».' },
              { s: TRAIN[0], e: VILLE[0] - .08, msg: 'Presque' + NB + '! Là, elle dit «' + NB + 'le train pour' + NB + '».' },
              { s: fin, e: ligne(0)[1] + .8, msg: 'Trop tard' + NB + ': là, elle dit «' + NB + "c'est quel quai" + NB + '?' + NB + '».' },
            ],
            juste: 'Oui' + NB + '! «' + NB + 'Le train pour Nantes' + NB + '»', montre: "C'est là" + NB + ': «' + NB + 'le train pour Nantes' + NB + '».' })) return;
          suite();
        },

        /* 2 · l'agent redit le quai : on fait glisser la valise jusqu'au bon quai (ou on clique sur le quai) */
        async quai(f) {
          const SEG = ligne(1);
          const valise = () => $('.valise', side), voie = n => $(`.voie[data-n="${n}"]`, side);
          let posee = null, fini = false;
          /* la valise va se poser au pied d'un quai (ou revient au départ) */
          function poser(v, anime = true) {
            const el = valise(); if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!v) { el.style.transition = tr; el.style.transform = ''; posee = null; return; }
            /* la place de départ, mesurée sans transformation (sinon on mesure la valise là où on l'a lâchée) */
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = $('.sol', v).getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height * .62 - (a.top + a.height / 2)}px) scale(.8)`;
            posee = +v.dataset.n;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = valise(), vers = voie(13); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .6;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(n) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const v = voie(n); poser(v);
            $$('.voie', side).forEach(x => x.classList.remove('chaud'));
            await wait(450); if (!alive(f)) return;
            if (n === 3) {
              $$('.voie', side).forEach(x => x.classList.remove('indice')); v.classList.add('juste'); fini = true;
              if (!await juste(f, 'Oui' + NB + '! Le quai trois.')) return;
              suite();
            } else {
              v.classList.add('faux'); secouer(v);
              const montrer = await faux(f, SEG, 'Non, ça, c\'est le quai ' + LETTRES[n] + '.'); if (montrer === null) return;
              v.classList.remove('faux'); poser(null);
              if (montrer) voie(3).classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass quai"><p class="ptitre">Fais glisser la valise jusqu'au bon quai.</p>
            <div class="hall">
              <div class="voies">${QUAIS.map(n => `<button class="voie${n === 13 ? ' loin' : ''}" data-n="${n}" aria-label="Quai ${n}"><span class="pancarte"><small>Quai</small><b>${n}</b></span><span class="sol">${QUAI_SVG}</span></button>`).join('')}</div>
              <div class="depart"><div class="valise" aria-hidden="true">${VALISE}</div><span class="legende">sa valise</span></div>
            </div></div>`;
          if (!await avant(f, {
            qui: 'agent', seg: SEG, gel: 2.7, sideW: 540, panneau,
            consigne: 'Le train pour Nantes part de quel quai' + NB + "? Fais glisser la valise jusqu'au bon quai.",
            monte: p => {
              const el = $('.valise', p); let st = null;
              el.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                el.style.transition = 'none'; el.style.transform = ''; posee = null;
                st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                try { el.setPointerCapture(e.pointerId); } catch (err) {}
                el.classList.add('tenue');
              });
              el.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x, dy = e.clientY - st.y;
                if (!st.bouge && Math.hypot(dx, dy) > 5) { st.bouge = true; sfx.tick(); }
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
                $$('.voie', p).forEach(v => v.classList.toggle('chaud', dedans(v, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenue');
                const v = e.type === 'pointerup' && tour() ? $$('.voie', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.voie', p).forEach(x => x.classList.remove('chaud'));
                if (v) choisir(+v.dataset.n); else poser(null);
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.voie', p).forEach(v => v.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(+v.dataset.n); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 3 · « Le train est à l'heure ? — Oui, il est à l'heure. » : sur le tableau des départs, on clique sur son train */
        async heure(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let fini = false;
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.train[data-id="lyon"]', side)), 5000); };
          const ligneHTML = t => `<button class="train" data-id="${t.id}" aria-label="${t.h.replace(':', ' h ')}, ${t.dest}, quai ${t.q}, ${t.info}"><span class="h">${t.h}</span><span class="dest">${t.dest}</span><span class="q">${t.q}</span><span class="info">${t.info}</span></button>`;
          if (!await avant(f, {
            qui: 'agent', seg: SEG, gel: 6.1, sideW: 560,
            consigne: "Le train est à l'heure" + NB + '? Sur le tableau, clique sur le train de la voyageuse.',
            panneau: `<div class="panel glass quai"><p class="ptitre">Son train va à Nantes, il part du quai 3. Clique sur son train.</p>
              <div class="tableau"><div class="entete" aria-hidden="true"><span class="h">Départ</span><span class="dest">Destination</span><span class="q">Quai</span><span class="info">Information</span></div>
              ${TRAINS.map(ligneHTML).join('')}</div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          $$('.train', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const t = TRAINS.find(x => x.id === b.dataset.id);
            if (t.bon) {
              $$('.train', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Nantes, quai trois' + NB + ': il est à l\'heure.')) return;
              fini = true; suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, t.msg); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.train[data-id="nantes2"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { voyageuse: 'train pour Nantes' },
      faits: {
        voyageuse: [{ text: 'le train pour Nantes', seg: A.phrase('le train pour Nantes') }, { text: "C'est quel quai" + A.NB + '?', seg: A.phrase("c'est quel quai") }, { text: "Le train est à l'heure" + A.NB + '?', seg: A.ligne(2) }],
        agent: [{ text: "C'est le quai trois.", seg: A.ligne(1) }, { text: "Oui, il est à l'heure.", seg: A.ligne(3) }],
      },
    }),
  };
})();
