/* Le petit déjeuner : à la réception, le client demande où est la salle du petit déjeuner (« Au rez-de-chaussée, à
   gauche. ») et à quelle heure il finit (« Il termine à onze heures. »).
   1 · dans la vidéo : elle redit où est la salle (la vidéo resserrée sur elle) ; puis, sur le plan où le monsieur est en
       face de nous (1,7 s : il ne parle pas encore, personne ne montre rien), on clique dans le hall, derrière lui, du côté
       où il doit aller : à SA gauche, donc à droite de l'image (le salon, les fenêtres, les fauteuils jaunes). Elle montre
       la salle de sa main droite en gros plan (vers la gauche de l'image) : recopier le côté de l'écran ne suffit pas, il
       faut avoir compris « à gauche » du monsieur. Pièges : le couloir et les portes vitrées, à sa droite.
   2 · elle redit l'heure : sur le chevalet du petit déjeuner, posé sur le comptoir (dessiné à côté), on fait glisser la
       tasse le long de la matinée jusqu'à l'heure où il finit (onze heures), puis on valide. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* le hall derrière le monsieur, sur l'image à 1,7 s (en %) */
  const GEL_HALL = 1.7;
  const ZONES = [
    { id: 'salon', label: 'Le salon, avec les fauteuils', bon: true, x: 52, y: 18, w: 17, h: 70 },
    { id: 'couloir', label: 'Le couloir', x: 0, y: 28, w: 13, h: 54, msg: 'Non' + NB + ': le couloir est à droite du monsieur.' },
    { id: 'portes', label: 'Les portes vitrées', x: 13, y: 24, w: 14, h: 22, msg: 'Non' + NB + ': les portes vitrées sont à droite du monsieur.' },
  ];

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
    /* sur un téléphone (en hauteur), l'image entière est recadrée : on garde le couloir (à gauche) et le salon (à droite) */
    crops: { fullTall: { a: 1.5, h: 1, cx: .45, cy: .5 } },
    ordre: ['salle', 'heure'],
    bravo: 'Bravo' + NB + '! Demain, le monsieur prend son petit déjeuner à gauche, avant onze heures.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, zones, cam, avant, cadreZone, marque, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      /* les passages : sa réponse, jusqu'avant la coupe suivante */
      const OU = [ligne(2)[0], Math.min(ligne(2)[1], 5.38)], FIN = [ligne(4)[0], ligne(4)[1]];
      return {
        /* 1 · dans la vidéo : la salle est à gauche du monsieur (il est en face de nous : à droite de l'image) */
        async salle(f) {
          let aide = '';                                                   // après deux essais : la consigne avec l'indice
          const ask = () => { Q.show('you', aide || state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="portes"]', cam)), 5000); };
          if (!await avant(f, {
            qui: 'receptionniste', seg: OU, gel: GEL_HALL, consigne: 'Où est la salle du petit déjeuner' + NB + '? Clique dans le hall, derrière le monsieur.',
            monte: () => zones(ZONES, choisir),
          })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(OU[0], OU[1], gel()); if (alive(f)) ask(); };
          async function choisir(id, ev, z) {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.bon) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(z, 'La salle du petit déjeuner', 'juste');
              if (!await juste(f, 'Oui' + NB + '! Au rez-de-chaussée, à gauche du monsieur.')) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z, z.label, 'faux');
              const montrer = await faux(f, OU, z.msg); if (montrer === null) return;
              if (montrer) { $('.hit[data-id="salon"]', cam).classList.add('indice'); aide = 'Il est en face de toi' + NB + ": sa gauche, c'est de ce côté. Clique sur la salle."; }
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
