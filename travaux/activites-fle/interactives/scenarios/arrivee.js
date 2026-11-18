/* Le petit déjeuner : à la réception, le client demande où est la salle du petit déjeuner (« Au rez-de-chaussée, à
   gauche. ») et à quelle heure il finit (« Il termine à onze heures. »).
   1 · elle redit où est la salle (la vidéo resserrée sur elle) ; à côté, le plan de l'hôtel en coupe : trois niveaux
       (2e étage, 1er étage, rez-de-chaussée), à chaque niveau une salle à gauche et une à droite (l'escalier au milieu,
       l'accueil au milieu du rez-de-chaussée) ; on clique sur la bonne salle. La gauche du plan est la gauche de
       l'apprenant (repères « gauche / droite » au-dessus). Son geste en gros plan montre le côté, pas l'étage : il faut
       avoir compris « rez-de-chaussée ».
   2 · elle redit l'heure : sur le chevalet du petit déjeuner, posé sur le comptoir (dessiné à côté), on fait glisser la
       tasse le long de la matinée jusqu'à l'heure où il finit (onze heures), puis on valide.
   (Pas de geste sur l'image : tout ce qu'on y voit, son geste vers la salle compris, donnerait la réponse ou demanderait
   de se mettre à la place de quelqu'un vu de face.) */
window.SCENARIO = (() => {
  const NB = '\u202f';
  /* le plan de l'hôtel : les niveaux de haut en bas, une salle à gauche (g) et à droite (d) à chaque niveau */
  const GEL_SALLE = .4;                                                // elle sourit, avant toute réponse (premier plan)
  const NIVEAUX = [{ n: 2, nom: '2<sup>e</sup> étage', aria: 'Deuxième étage', dit: 'le deuxième étage' },
    { n: 1, nom: '1<sup>er</sup> étage', aria: 'Premier étage', dit: 'le premier étage' },
    { n: 0, nom: 'rez-de-chaussée', aria: 'Rez-de-chaussée', dit: 'le rez-de-chaussée' }];
  const BON = { n: 0, c: 'g' };
  const ESCALIER = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 34h8v-7h7v-7h7v-7h8" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  const ACCUEIL = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="11" r="5" fill="currentColor"/><path d="M11 24c0-5 4-8 9-8s9 3 9 8z" fill="currentColor"/><rect x="5" y="24" width="30" height="11" rx="2" fill="currentColor" opacity=".55"/></svg>';
  const TABLE = '<svg viewBox="0 0 64 40" aria-hidden="true"><rect x="8" y="18" width="48" height="5" rx="2" fill="#8C5A33"/><path d="M14 23v14M50 23v14" stroke="#8C5A33" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M18 9h12l-1.2 8h-9.6z" fill="#fff" stroke="#C9B080"/><path d="M30 11h2a2 2 0 0 1 0 4h-2" fill="none" stroke="#C9B080" stroke-width="1.6"/>'
    + '<path d="M37 16c1-5 4-8 8-8s7 3 8 8c-2 1-3 1-4.5 .3-1 1.5-2.2 2-3.5 2s-2.5-.5-3.5-2c-1.5.7-2.5.7-4.5-.3z" fill="#E7A957"/></svg>';

  /* le chevalet : la matinée de 8 h à 12 h ; la tasse marque la fin du petit déjeuner */
  const GEL_HEURE = 9.2;                                               // elle a fini de répondre, elle sourit (gros plan, avant la coupe de 9,375 s)
  const H0 = 8, H1 = 12, BONNE = 11;
  const DIT = { 8: 'huit heures', 9: 'neuf heures', 10: 'dix heures', 11: 'onze heures', 12: 'midi' };
  const COURT = h => (h === 12 ? 'midi' : h + NB + 'h');
  const TASSE = `<svg viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2.2" stroke-linecap="round"><path d="M18 11c-3-4 3-5 0-9"/><path d="M26 11c-3-4 3-5 0-9"/></g>
      <path d="M33 21h3a6 6 0 0 1 0 12h-4" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M8 16h27l-2.4 18.5A6 6 0 0 1 26.7 40H16.3a6 6 0 0 1-5.9-5.5z" fill="#fff"/>
      <path d="M10.3 21h22.4" stroke="#8C5A33" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="21.5" cy="44" rx="17" ry="3" fill="rgba(255,255,255,.55)"/></svg>`;
  const CROISSANT = `<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M4 22c2-10 10-17 20-17s18 7 20 17c-4 3-8 3-11 1-2 4-6 6-9 6s-7-2-9-6c-3 2-7 2-11-1z" fill="#E7A957"/>
      <path d="M17 9l3 15M24 6v19M31 9l-3 15" stroke="#B9772E" stroke-width="2" stroke-linecap="round"/></svg>`;

  return {
    plans: [{ de: 0, cx: { receptionniste: .58, client: .3 } }, { de: 1.625, cx: { receptionniste: .62, client: .34 } },
      { de: 3.583, cx: { receptionniste: .6, client: .6 } }, { de: 5.417, cx: { receptionniste: .36, client: .36 } },
      { de: 7.792, cx: { receptionniste: .6, client: .6 } }, { de: 9.375, cx: { receptionniste: .38, client: .38 } }],
    ordre: ['salle', 'heure'],
    bravo: 'Bravo' + NB + '! Demain, le monsieur prend son petit déjeuner à gauche, avant onze heures.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      /* les passages : sa réponse, jusqu'avant la coupe suivante */
      const OU = [ligne(2)[0], Math.min(ligne(2)[1], 5.38)], FIN = [ligne(4)[0], ligne(4)[1]];
      return {
        /* 1 · le plan de l'hôtel en coupe : on clique sur la salle du petit déjeuner (rez-de-chaussée, à gauche) */
        async salle(f) {
          const salle = (n, c) => $(`.ph-salle[data-n="${n}"][data-c="${c}"]`, side);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(salle(1, 'd')), 5000); };
          const bouton = (v, c) => `<button class="ph-salle" data-n="${v.n}" data-c="${c}" aria-label="${v.aria}, salle de ${c === 'g' ? 'gauche' : 'droite'}"><span class="ph-dedans"></span></button>`;
          const milieu = v => `<span class="ph-milieu">${v.n === 0 ? ACCUEIL + '<small>accueil</small>' : ESCALIER}</span>`;
          if (!await avant(f, {
            qui: 'receptionniste', seg: OU, gel: GEL_SALLE, sideW: 520, consigne: 'Où est la salle du petit déjeuner' + NB + '? Clique sur la bonne salle.',
            panneau: `<div class="panel glass ph-panel"><p class="ptitre">Le plan de l'hôtel</p>
              <div class="ph-hotel">
                <div class="ph-cotes" aria-hidden="true"><span></span><span>← gauche</span><span></span><span>droite →</span></div>
                ${NIVEAUX.map(v => `<div class="ph-niveau${v.n === 0 ? ' rdc' : ''}"><span class="ph-nom">${v.nom}</span>${bouton(v, 'g')}${milieu(v)}${bouton(v, 'd')}</div>`).join('')}
              </div></div>`,
            monte: p => $$('.ph-salle', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(OU[0], OU[1], gel()); if (alive(f)) ask(); };
          async function choisir(b) {
            if (!tour()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const n = +b.dataset.n, c = b.dataset.c;
            if (n === BON.n && c === BON.c) {
              $$('.ph-salle', side).forEach(x => x.classList.remove('indice', 'faux'));
              b.classList.add('juste'); $('.ph-dedans', b).innerHTML = TABLE + '<small>petit déjeuner</small>';
              if (!await juste(f, 'Oui' + NB + '! Au rez-de-chaussée, à gauche.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const niv = NIVEAUX.find(v => v.n === n);
              const msg = n !== BON.n ? "Non, ça, c'est " + niv.dit + (c !== BON.c ? ', à droite.' : '.') : "Non, ça, c'est à droite.";
              const montrer = await faux(f, OU, msg); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) salle(BON.n, BON.c).classList.add('indice');
              ask();
            }
          }
          ask();
        },

        /* 2 · le chevalet du petit déjeuner : on fait glisser la tasse jusqu'à l'heure de la fin (ou on clique sur une heure) */
        async heure(f) {
          let h = H0, bouge = false;
          const rail = () => $('.pd-rail', side), tasse = () => $('.pd-tasse', side);
          const pos = x => (x - H0) / (H1 - H0) * 100;                     // une heure → % du rail
          function poser(x, anime = true) {                                // x : une heure (décimale pendant le glisser)
            const c = $('.pd-chev', side); if (!c) return;
            c.classList.toggle('lisse', anime);
            c.style.setProperty('--p', pos(x) + '%');
            const k = Math.round(x);
            $$('.pd-h', side).forEach(b => { b.classList.toggle('on', +b.dataset.h === k); b.setAttribute('aria-pressed', +b.dataset.h === k); });
            $('#pdFin', side).textContent = "jusqu'à " + COURT(k);
          }
          const choisir = k => { h = k; bouge = true; poser(k); sfx.tick(); };
          const glisser = () => {                                          // le doigt fantôme : prendre la tasse, la faire glisser d'une heure
            const t = tasse(), r = rail(); if (!t || !r) return null;
            const a = t.getBoundingClientRect(), b = r.getBoundingClientRect(), x = a.left + a.width / 2, y = a.top + a.height / 2, x2 = Math.min(b.right, x + b.width / (H1 - H0));
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y, 1, .82), at(x2, y, 1), at(x2, y, 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 4500); };
          if (!await avant(f, {
            qui: 'receptionniste', seg: FIN, gel: GEL_HEURE, sideW: 520, consigne: 'Le petit déjeuner finit à quelle heure' + NB + "? Fais glisser la tasse jusqu'à la bonne heure.",
            panneau: `<div class="panel glass pd-panel"><p class="ptitre">Fais glisser la tasse jusqu'à l'heure de la fin.</p>
              <div class="pd-chev lisse" style="--p: 0%">
                <p class="pd-titre">${CROISSANT}<span>Petit déjeuner</span></p>
                <div class="pd-zone">
                  <div class="pd-rail"><span class="pd-ruban"></span>${Array.from({ length: H1 - H0 + 1 }, (_, i) => `<span class="pd-cran" style="left:${pos(H0 + i)}%"></span>`).join('')}
                    <button class="pd-tasse" type="button" aria-label="La tasse : fais-la glisser jusqu'à l'heure de la fin">${TASSE}</button></div>
                  <div class="pd-heures">${Array.from({ length: H1 - H0 + 1 }, (_, i) => H0 + i).map(k => `<button class="pd-h" type="button" data-h="${k}" style="left:${pos(k)}%" aria-pressed="false" aria-label="${DIT[k]}">${COURT(k)}</button>`).join('')}</div>
                </div>
                <p class="pd-fin" id="pdFin" aria-live="polite"></p>
              </div></div>`,
            monte: p => {
              const t = $('.pd-tasse', p), r = $('.pd-rail', p);
              const heureDe = e => { const b = r.getBoundingClientRect(); return H0 + Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)) * (H1 - H0); };
              let tire = false, x0 = 0, loin = false;
              t.addEventListener('pointerdown', e => {
                if (!tour() || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault(); tire = true; x0 = e.clientX; loin = false; t.classList.add('tenu');
                try { t.setPointerCapture(e.pointerId); } catch (err) {}
              });
              t.addEventListener('pointermove', e => { if (!tire) return; if (Math.abs(e.clientX - x0) > 6) loin = true; if (loin) poser(heureDe(e), false); });
              const lacher = e => { if (!tire) return; tire = false; t.classList.remove('tenu'); if (loin) choisir(Math.round(heureDe(e))); else poser(h); };
              t.addEventListener('pointerup', lacher); t.addEventListener('pointercancel', lacher);
              t.addEventListener('keydown', e => {                       // au clavier : les flèches
                if (!tour() || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
                e.preventDefault(); choisir(Math.max(H0, Math.min(H1, h + (e.key === 'ArrowRight' ? 1 : -1))));
              });
              $$('.pd-h', p).forEach(b => b.addEventListener('click', () => { if (!tour()) return; A.unlock(); idle.reset(); choisir(+b.dataset.h); }));
              poser(H0);
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(FIN[0], FIN[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            if (!bouge) { secouer(tasse()); Q.show('you', "Fais glisser la tasse jusqu'à la bonne heure."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const c = $('.pd-chev', side);
            if (h === BONNE) {
              c.classList.add('juste'); $$('.pd-h', side).forEach(b => b.classList.remove('indice'));
              if (!await juste(f, 'Oui' + NB + '! Il termine à onze heures.')) return;
              suite();
            } else {
              c.classList.add('faux'); secouer($('.pd-zone', side));
              const montrer = await faux(f, FIN, h === 12 ? "Non, là, c'est midi." : "Non, là, c'est " + DIT[h] + '.'); if (montrer === null) return;
              c.classList.remove('faux');
              if (montrer) {                                               // deux essais : on pose la réponse
                h = BONNE; poser(BONNE); c.classList.add('juste');
                Q.show('ok', 'Il termine à onze heures.'); state.essais = 0; suite();
              } else { bouge = false; h = H0; poser(H0); ask(); }
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        receptionniste: [{ text: 'Bonjour monsieur.', seg: A.ligne(0) }, { text: 'Au rez-de-chaussée, à gauche.', seg: [A.ligne(2)[0], Math.min(A.ligne(2)[1], 5.38)] },
          { text: 'Il termine à onze heures.', seg: A.ligne(4) }],
        client: [{ text: 'Où est la salle du petit déjeuner' + A.NB + '?', seg: A.ligne(1) }, { text: 'Le petit déjeuner finit à quelle heure' + A.NB + '?', seg: A.phrase('Le petit déjeuner finit à quelle heure') },
          { text: "D'accord, merci beaucoup.", seg: A.ligne(5) }],
      },
    }),
  };
})();
