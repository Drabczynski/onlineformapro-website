/* Le chauffage ne marche pas : dans le hall de l'immeuble, une habitante dit au gardien que le chauffage ne marche pas chez
   elle ; elle habite au quatrième, à gauche ; il passe chez elle cet après-midi (coupes à 2,92, 4,92, 6,92 et 8,96 s : plan
   large, le gardien de près, l'habitante de près, le gardien de près, plan large).
   1 · « Vous habitez à quel étage ? — Au quatrième, à gauche. » (la vidéo resserrée sur elle) : à côté, l'immeuble en coupe,
       deux portes par étage (à gauche / à droite de l'escalier, écrit en haut des colonnes : pas de piège de point de vue) ;
       on clique sur sa porte ;
   2 · le gardien redit « je passe chez vous cet après-midi » : on fait glisser la fiche de l'intervention dans son agenda
       (aujourd'hui / demain × matin / après-midi / soir : « cet après-midi », c'est aujourd'hui) ; un clic sur la case marche aussi.
   Pas de question sur la panne : le titre la donne. Pas de geste sur l'image : rien dans le hall ne porte une information du
   dialogue (les boîtes aux lettres sont floues, sans nom lisible ; aucun radiateur à l'écran). Les images figées (6,0 s :
   l'habitante de près ; 8,0 s : le gardien de près ; 9,5 s : plan large) ne donnent aucune réponse.
   Gestes différents de « L'ascenseur ne marche pas » (toucher le hall, faire glisser le soleil). */
window.SCENARIO = (() => {
  const NB = '\u202f';
  /* 1 · l'immeuble : cinq étages, deux portes par étage ; elle habite au 4e, à gauche */
  const ORD = { 1: 'premier', 2: 'deuxième', 3: 'troisième', 4: 'quatrième', 5: 'cinquième' };
  const COURT = { 1: '1<sup>er</sup>', 2: '2<sup>e</sup>', 3: '3<sup>e</sup>', 4: '4<sup>e</sup>', 5: '5<sup>e</sup>' };
  const COTE = { g: 'à gauche', d: 'à droite' };
  const BON_E = 4, BON_C = 'g';
  const PORTE = c => `<svg viewBox="0 0 40 60" aria-hidden="true"><rect x="3" y="3" width="34" height="57" rx="2" class="cadre"/><rect x="7" y="7" width="26" height="53" rx="1.5" class="bois"/>
      <rect x="11" y="12" width="18" height="18" rx="1.5" class="moulure"/><rect x="11" y="35" width="18" height="20" rx="1.5" class="moulure"/>
      <circle cx="${c === 'g' ? 28.5 : 11.5}" cy="34" r="2.2" class="poignee"/><rect x="16" y="3.5" width="8" height="3" rx="1" class="judas"/></svg>`;
  /* 2 · l'agenda du gardien : aujourd'hui / demain × matin / après-midi / soir */
  const MOMENTS = [{ id: 'matin', t: 'matin' }, { id: 'am', t: 'après-midi' }, { id: 'soir', t: 'soir' }];
  const JOURS = [{ id: 'auj', t: "aujourd'hui" }, { id: 'dem', t: 'demain' }];
  const BON_CR = 'auj-am';
  const MSG = {
    'auj-matin': 'Pas ce matin.', 'auj-soir': 'Pas ce soir.', 'dem-matin': 'Pas demain matin.', 'dem-soir': 'Pas demain soir.',
    'dem-am': 'Pas demain' + NB + ': «' + NB + 'cet après-midi' + NB + "», c'est aujourd'hui.",
  };
  const RADIATEUR = `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="4" y="6" width="40" height="28" rx="4" fill="#E9EDF2" stroke="#8C96A5" stroke-width="2.4"/>
      <path d="M12 9v22M20 9v22M28 9v22M36 9v22" stroke="#B5BDC8" stroke-width="3.2" stroke-linecap="round"/><path d="M8 34v4M40 34v4" stroke="#8C96A5" stroke-width="3" stroke-linecap="round"/>
      <path d="M41 10h4" stroke="#C0392B" stroke-width="3" stroke-linecap="round"/></svg>`;
  const PAPIER = `<span class="ic">${RADIATEUR}</span><span class="txt"><b>Chauffage</b><small>4<sup>e</sup> gauche</small></span>`;

  return {
    plans: [{ de: 0, cx: { habitante: .31, gardien: .66 } }, { de: 2.917, cx: { habitante: .02, gardien: .57 } }, { de: 4.917, cx: { habitante: .35, gardien: .93 } },
      { de: 6.917, cx: { habitante: .02, gardien: .6 } }, { de: 8.958, cx: { habitante: .3, gardien: .66 } }],
    ordre: ['porte', 'agenda'],
    bravo: 'Bravo' + NB + '! Cet après-midi, le gardien monte au quatrième.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, phrase, side, idle, tapHere, at, sfx, faux, juste, suite, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « Vous habitez à quel étage ? — Au quatrième, à gauche. » : sur l'immeuble en coupe, on clique sur sa porte */
        async porte(f) {
          const SEG = [ligne(1)[0], ligne(2)[1]];
          let fini = false;
          const porte = (e, c) => $(`.porte[data-e="${e}"][data-c="${c}"]`, side);
          const plaque = (b, txt, cls) => { const p = $('.plaque', b); p.innerHTML = txt; p.className = 'plaque ' + cls; };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(porte(2, 'd')), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const e = +b.dataset.e, c = b.dataset.c, nom = COURT[e] + ' ' + (c === 'g' ? 'gauche' : 'droite');
            if (e === BON_E && c === BON_C) {
              fini = true; $$('.porte', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); plaque(b, '✓ ' + nom, 'juste');
              if (!await juste(f, 'Oui' + NB + '! Au quatrième, à gauche.')) return;
              suite();
            } else {
              b.classList.add('faux'); plaque(b, nom, 'faux'); secouer($('.imm', side));
              const msg = e === BON_E ? "Le quatrième, oui, mais ça, c'est à droite."
                : c === BON_C ? "Non, ça, c'est le " + ORD[e] + ' étage.' : "Non, ça, c'est le " + ORD[e] + ', à droite.';
              const montrer = await faux(f, ligne(2), msg); if (montrer === null) return;
              b.classList.remove('faux'); plaque(b, '', '');
              if (montrer) porte(BON_E, BON_C).classList.add('indice');
              ask();
            }
          }
          const etages = [5, 4, 3, 2, 1].map(e => `<div class="etage"><span class="num" aria-hidden="true">${COURT[e]}</span>${
            ['g', 'd'].map((c, k) => `${k ? '<span class="esc" aria-hidden="true"></span>' : ''}<button class="porte" data-e="${e}" data-c="${c}" aria-label="${ORD[e]} étage, ${COTE[c]}">${PORTE(c)}<span class="plaque"></span></button>`).join('')}</div>`).join('');
          if (!await avant(f, {
            qui: 'habitante', seg: SEG, gel: 6.0, sideW: 460,
            consigne: 'Où habite la dame' + NB + '? Clique sur sa porte.',
            panneau: `<div class="panel glass chauf"><p class="ptitre">L'immeuble${NB}: clique sur sa porte.</p>
              <div class="imm"><div class="imm-toit" aria-hidden="true"></div>
                <div class="imm-tete" aria-hidden="true"><span></span><span>à gauche</span><span class="esc-t">escalier</span><span>à droite</span></div>
                <div class="etages" role="group" aria-label="Les portes de l'immeuble">${etages}</div>
                <div class="etage rdc" aria-hidden="true"><span class="num">RDC</span><span class="hall">le hall</span></div></div></div>`,
            monte: p => $$('.porte', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · « D'accord, je passe chez vous cet après-midi. » : on fait glisser la fiche dans l'agenda du gardien */
        async agenda(f) {
          const SEG = ligne(3);
          const papier = () => $('.papier', side), cr = id => $(`.creneau[data-id="${id}"]`, side);
          let fini = false;
          const poser = (c, cls) => { c.innerHTML = `<span class="mini ${cls || ''}">${PAPIER}</span>`; const p = papier(); p.style.transition = 'none'; p.style.transform = ''; p.classList.add('pris'); };
          const reprendre = c => { c.innerHTML = ''; c.classList.remove('faux'); const p = papier(); p.classList.remove('pris'); };
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {                                   // le doigt fantôme glisse la fiche vers demain matin (pas vers la réponse)
              const de = papier(), vers = cr('dem-matin'); if (!de || !vers || !de.isConnected) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const c = cr(id); poser(c);
            $$('.creneau', side).forEach(x => x.classList.remove('chaud'));
            await wait(300); if (!alive(f)) return;
            if (id === BON_CR) {
              fini = true; $$('.creneau', side).forEach(x => x.classList.remove('indice')); c.classList.add('juste'); $('.agenda', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + "! Cet après-midi" + NB + ": aujourd'hui.")) return;
              suite();
            } else {
              c.classList.add('faux'); secouer(c);
              const montrer = await faux(f, SEG, MSG[id]); if (montrer === null) return;
              reprendre(c);
              if (montrer) {                                   // deux essais : on pose la fiche à la bonne place
                fini = true; const b = cr(BON_CR); poser(b); b.classList.add('juste'); $('.agenda', side).classList.add('juste');
                Q.show('ok', 'Cet après-midi' + NB + ": aujourd'hui, l'après-midi."); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'gardien', seg: SEG, gel: 8.0, sideW: 480,
            consigne: 'Le gardien passe chez elle quand' + NB + '? Fais glisser la fiche dans son agenda.',
            panneau: `<div class="panel glass chauf"><p class="ptitre">Fais glisser la fiche dans l'agenda du gardien.</p>
              <div class="agenda"><div class="ag-spirale" aria-hidden="true"></div>
                <div class="ag-tete" aria-hidden="true"><span></span>${JOURS.map(j => `<b>${j.t}</b>`).join('')}</div>
                ${MOMENTS.map(m => `<div class="ag-ligne"><span class="ag-m" aria-hidden="true">${m.t}</span>${JOURS.map(j => `<button class="creneau" data-id="${j.id}-${m.id}" aria-label="${j.t}, ${m.id === 'am' ? "l'après-midi" : 'le ' + m.t}"></button>`).join('')}</div>`).join('')}
              </div>
              <div class="depart"><div class="papier" aria-hidden="true">${PAPIER}</div><span class="legende">la fiche</span></div></div>`,
            monte: p => {
              const el = $('.papier', p); let st = null;
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
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
                $$('.creneau', p).forEach(v => v.classList.toggle('chaud', dedans(v, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenu');
                const v = e.type === 'pointerup' && tour() ? $$('.creneau', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.creneau', p).forEach(x => x.classList.remove('chaud'));
                if (v) choisir(v.dataset.id); else { el.style.transition = 'transform .4s cubic-bezier(.34,1.3,.64,1)'; el.style.transform = ''; }
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.creneau', p).forEach(v => v.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(v.dataset.id); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { habitante: '4e gauche' },
      faits: {
        habitante: [{ text: 'Le chauffage ne marche pas chez moi.', seg: A.ligne(0) }, { text: 'Au quatrième, à gauche.', seg: A.ligne(2) }],
        gardien: [{ text: 'Vous habitez à quel étage' + A.NB + '?', seg: A.ligne(1) }, { text: 'Je passe chez vous cet après-midi.', seg: [A.phrase('je passe chez vous')[0], A.ligne(3)[1]] }],
      },
    }),
  };
})();
