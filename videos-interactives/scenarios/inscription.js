/* L'inscription à l'école : un père vient inscrire son fils ; il a sept ans, il parle un peu français ; l'employée lui dit
   qu'il peut commencer lundi prochain (coupes à 1,92, 3,92, 6 et 8,96 s : plan large, l'employée de près, le père de près,
   l'employée de près, plan large).
   1 · « Il a quel âge, votre fils ? — Sept ans. » : on met les bougies sur le gâteau d'anniversaire (une par an), puis Valider ;
   2 · « Il parle un peu français. » : on fait glisser le curseur (pas du tout / un peu / bien / très bien), puis Valider ;
   3 · « Il peut commencer lundi prochain. » : aujourd'hui, c'est mercredi 18 ; sur le calendrier de l'école (cette semaine et
       la semaine prochaine), on clique sur le jour où il commence (lundi 23, pas lundi 16, déjà passé).
   Tout se fait dans le panneau : le fils n'est pas là, rien dans le bureau ne porte une information du dialogue (le petit
   calendrier au mur est illisible). Les images figées (5,0 et 5,4 s : le père de près ; 7,5 s : l'employée de près ; 9,5 s :
   plan large) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  const NOMBRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];
  const MAX = 12, AGE = 7;
  /* 2 · les quatre niveaux du curseur */
  const NIVEAUX = [
    { id: 'rien', t: 'pas du tout', msg: 'Non' + NB + ': il parle français.' },
    { id: 'peu', t: 'un peu', bon: true },
    { id: 'bien', t: 'bien', msg: 'Non, pas bien.' },
    { id: 'tresbien', t: 'très bien', msg: 'Non, pas très bien.' },
  ];
  /* 3 · le calendrier de l'école : deux semaines de novembre 2026, aujourd'hui mercredi 18 */
  const JS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const SEMAINES = [{ t: 'Cette semaine', d: 16 }, { t: 'La semaine prochaine', d: 23 }];
  const AUJ = 18, BON = 23;
  const jourDe = n => JS[(n - 16) % 7];

  /* le gâteau (viewBox 320 × 230) : les bougies se posent sur le dessus */
  const GATEAU = `<svg viewBox="0 0 320 230" aria-hidden="true">
      <ellipse cx="160" cy="214" rx="146" ry="14" fill="#E7E2EC"/>
      <path d="M50 110V196Q50 210 160 210T270 196V110Z" fill="#E9A15B"/>
      <path d="M50 150Q160 168 270 150V164Q160 182 50 164Z" fill="#F7D7A8"/>
      <path d="M50 110Q50 96 160 96T270 110V126Q262 134 254 126T236 128T218 124T200 132T182 126T164 134T146 126T128 132T110 124T92 130T74 124T56 130L50 126Z" fill="#FFF6EC"/>
      <ellipse cx="160" cy="110" rx="110" ry="18" fill="#FFF9F2"/>
      ${[70, 104, 140, 180, 216, 250].map((x, i) => `<circle cx="${x}" cy="${186 + (i % 2) * 6}" r="5" fill="${['#E8689A', '#3AA8FF', '#FFD23F'][i % 3]}"/>`).join('')}
      <g id="ins-bougies"></g>
    </svg>`;
  const BOUGIE = (x, y, i) => `<g class="ins-bougie" style="animation-delay:0s"><rect x="${x - 4}" y="${y - 40}" width="8" height="40" rx="3" fill="${['#3AA8FF', '#E8689A', '#4BC97A', '#FFD23F'][i % 4]}"/>
      <path d="M${x - 4} ${y - 30}l8 -5M${x - 4} ${y - 18}l8 -5M${x - 4} ${y - 6}l8 -5" stroke="rgba(255,255,255,.7)" stroke-width="2"/>
      <path d="M${x} ${y - 40}v-5" stroke="#3B3B3B" stroke-width="1.6"/>
      <path class="flamme" d="M${x} ${y - 60}c5 7 6 10 0 15c-6-5-5-8 0-15z" fill="#FFB020"/><path d="M${x} ${y - 52}c2 3 2 4 0 6c-2-2-2-3 0-6z" fill="#FFF3B0"/></g>`;
  /* la boîte de bougies */
  const BOITE = `<svg viewBox="0 0 90 60" aria-hidden="true"><rect x="4" y="18" width="82" height="38" rx="6" fill="#F2F4F8" stroke="#B9C2CC" stroke-width="2"/>
      ${[16, 30, 44, 58, 72].map((x, i) => `<rect x="${x - 4}" y="6" width="8" height="34" rx="3" fill="${['#3AA8FF', '#E8689A', '#4BC97A', '#FFD23F', '#3AA8FF'][i]}"/>`).join('')}
      <rect x="4" y="30" width="82" height="26" rx="6" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="2"/><path d="M45 36v14M38 43h14" stroke="#5B6573" stroke-width="3.4" stroke-linecap="round"/></svg>`;

  return {
    plans: [{ de: 0, cx: { employee: .2, pere: .73 } }, { de: 1.917, cx: { employee: .38, pere: .94 } }, { de: 3.917, cx: { employee: .05, pere: .6 } },
      { de: 6, cx: { employee: .38, pere: .94 } }, { de: 8.958, cx: { employee: .2, pere: .73 } }],
    ordre: ['age', 'francais', 'lundi'],
    bravo: 'Bravo' + NB + "! Son fils commence l'école lundi prochain.",
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · « Il a quel âge, votre fils ? — Sept ans. » : on met les bougies sur le gâteau, puis Valider */
        async age(f) {
          const SEG = [ligne(1)[0], ligne(2)[1]];
          let n = 0;
          const dessiner = () => {
            const g = $('#ins-bougies', side); if (!g) return;
            const pas = n > 1 ? Math.min(26, 196 / (n - 1)) : 0;
            g.innerHTML = Array.from({ length: n }, (_, i) => { const x = 160 + (i - (n - 1) / 2) * pas; return BOUGIE(x, 110 + Math.abs(i - (n - 1) / 2) * 0.6, i); }).join('');
            $('#ins-n', side).textContent = n; $('#ins-mot', side).textContent = n === 1 ? 'bougie' : 'bougies';
            $('#ins-moins', side).disabled = !n; $('#ins-plus', side).disabled = n >= MAX;
          };
          const changer = d => {
            if (!tour()) return;
            A.unlock(); idle.reset(); sfx.tick();
            n = Math.max(0, Math.min(MAX, n + d)); $('.ins-gateau', side).classList.remove('faux'); dessiner();
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('#ins-plus', side)), 5000); };
          if (!await avant(f, {
            qui: 'pere', seg: SEG, gel: 5.0, sideW: 460,
            consigne: 'Son fils a quel âge' + NB + '? Mets les bougies sur le gâteau, puis clique sur Valider.',
            panneau: `<div class="panel glass insc"><p class="ptitre">Une bougie pour chaque année.</p>
              <div class="ins-gateau" aria-live="polite">${GATEAU}<p class="ins-compte"><b id="ins-n">0</b> <span id="ins-mot">bougie</span></p></div>
              <div class="ins-boutons">
                <button class="ins-moins" id="ins-moins" aria-label="Enlever une bougie" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button>
                <button class="ins-plus" id="ins-plus" aria-label="Mettre une bougie">${BOITE}<span>une bougie</span></button>
              </div></div>`,
            monte: p => { $('#ins-plus', p).addEventListener('click', () => changer(1)); $('#ins-moins', p).addEventListener('click', () => changer(-1)); },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            const g = $('.ins-gateau', side);
            if (!n) { secouer(g); Q.show('you', 'Mets des bougies sur le gâteau.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (n === AGE) {
              g.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il a sept ans.')) return;
              suite();
            } else {
              g.classList.add('faux'); secouer(g);
              const montrer = await faux(f, SEG, 'Pas ' + NOMBRES[n] + (n > 1 ? ' ans.' : ' an.')); if (montrer === null) return;
              g.classList.remove('faux');
              if (montrer) {                                     // deux essais : on pose les sept bougies
                n = AGE; dessiner(); g.classList.add('juste'); $('#ins-moins', side).disabled = true; $('#ins-plus', side).disabled = true;
                Q.show('ok', 'Sept ans' + NB + ': sept bougies.'); state.essais = 0; suite();
              } else ask();
            }
          }
          dessiner(); ask();
        },

        /* 2 · « Il parle un peu français. » : on fait glisser le curseur, puis Valider */
        async francais(f) {
          const SEG = ligne(3);
          let k = 0, fini = false;
          const rail = () => $('.ins-rail', side), poignee = () => $('.ins-poignee', side);
          const placer = (i, anime = true) => {
            k = i; const p = poignee(); if (!p) return;
            p.style.transition = anime ? '' : 'none'; p.style.left = (i / (NIVEAUX.length - 1) * 100) + '%';
            p.setAttribute('aria-valuenow', i); p.setAttribute('aria-valuetext', NIVEAUX[i].t);
            $('.ins-rempli', side).style.width = (i / (NIVEAUX.length - 1) * 100) + '%';
            $$('.ins-niveau', side).forEach((b, j) => b.setAttribute('aria-pressed', j === i));
            $('#ins-lu', side).textContent = 'Il parle français' + NB + ': ' + NIVEAUX[i].t + '.';
          };
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            idle.set(() => {
              const r = rail(); if (!r) return null; const b = r.getBoundingClientRect(), y = b.top + b.height / 2, x1 = b.left + b.width * k / 3;
              const x3 = k < 2 ? b.right : b.left;
              return [at(x1, y + 40, 0), at(x1, y, 1), at(x1, y, 1, .82), at(x3, y, 1, .82), at(x3, y, 1), at(x3, y, 0)];
            }, 5000);
          };
          if (!await avant(f, {
            qui: 'pere', seg: SEG, gel: 5.4, sideW: 500,
            consigne: 'Est-ce que son fils parle français' + NB + '? Fais glisser le curseur, puis clique sur Valider.',
            panneau: `<div class="panel glass insc"><p class="ptitre">Son fils parle français${NB}:</p>
              <div class="ins-curseur" id="ins-curseur">
                <div class="ins-bulle" aria-hidden="true"><svg viewBox="0 0 48 40"><path d="M6 4h36a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H20l-9 8v-8H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="#FFFFFF"/><text x="24" y="23" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#2F4A70">FR</text></svg></div>
                <div class="ins-rail"><span class="ins-rempli"></span>${NIVEAUX.map((_, i) => `<span class="ins-cran" style="left:${i / 3 * 100}%"></span>`).join('')}
                  <span class="ins-poignee" role="slider" tabindex="0" aria-label="Il parle français" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"></span></div>
                <div class="ins-niveaux">${NIVEAUX.map((v, i) => `<button class="ins-niveau" data-i="${i}" aria-pressed="false" style="left:${i / 3 * 100}%"><span class="barres" aria-hidden="true">${[0, 1, 2].map(j => `<i class="${j < i ? 'on' : ''}"></i>`).join('')}</span>${v.t}</button>`).join('')}</div>
              </div>
              <p class="ins-lu" id="ins-lu" aria-live="polite"></p></div>`,
            monte: p => {
              const el = $('.ins-poignee', p), r = $('.ins-rail', p); let st = null;
              const vers = x => { const b = r.getBoundingClientRect(); return Math.max(0, Math.min(1, (x - b.left) / b.width)); };
              const bouger = x => { const v = vers(x); el.style.transition = 'none'; el.style.left = v * 100 + '%'; $('.ins-rempli', p).style.width = v * 100 + '%'; };
              const debut = e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                st = { id: e.pointerId, i: k }; try { el.setPointerCapture(e.pointerId); } catch (err) {}
                p.querySelector('.ins-curseur').classList.add('tire'); bouger(e.clientX);
              };
              el.addEventListener('pointerdown', debut);
              r.addEventListener('pointerdown', e => { if (e.target === el) return; debut(e); try { r.setPointerCapture(e.pointerId); } catch (err) {} });
              const suivre = e => { if (!st || e.pointerId !== st.id) return; bouger(e.clientX); const i = Math.round(vers(e.clientX) * 3); if (i !== st.i) { st.i = i; sfx.tick(); } };
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; p.querySelector('.ins-curseur').classList.remove('tire');
                placer(Math.round(vers(e.clientX) * 3)); Q.show('you', state.ask);
              };
              [el, r].forEach(x => { x.addEventListener('pointermove', suivre); x.addEventListener('pointerup', lacher); x.addEventListener('pointercancel', lacher); });
              el.addEventListener('keydown', e => {
                if (!tour() || fini) return;
                const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return;
                e.preventDefault(); A.unlock(); idle.reset(); sfx.tick(); placer(Math.max(0, Math.min(3, k + d)));
              });
              $$('.ins-niveau', p).forEach(b => b.addEventListener('click', () => { if (!tour() || fini) return; A.unlock(); idle.reset(); sfx.tick(); placer(+b.dataset.i); }));
              placer(0, false);
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            setTurn('wait'); goBtn(null); idle.clear();
            const c = $('#ins-curseur', side), b = $(`.ins-niveau[data-i="${k}"]`, side);
            if (NIVEAUX[k].bon) {
              fini = true; $$('.ins-niveau', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); c.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il parle un peu français.')) return;
              suite();
            } else {
              b.classList.add('faux'); c.classList.add('faux'); secouer(c);
              const montrer = await faux(f, SEG, NIVEAUX[k].msg); if (montrer === null) return;
              b.classList.remove('faux'); c.classList.remove('faux');
              if (montrer) {                                     // deux essais : on met le curseur sur « un peu »
                fini = true; placer(1); $('.ins-niveau[data-i="1"]', side).classList.add('juste'); c.classList.add('juste');
                Q.show('ok', 'Un peu' + NB + ': il parle un peu français.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · « Il peut commencer lundi prochain. » : sur le calendrier de l'école, on clique sur le jour */
        async lundi(f) {
          const SEG = ligne(5);
          let fini = false;
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.ins-jour[data-n="19"]', side)), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const n = +b.dataset.n;
            if (n === BON) {
              fini = true; $$('.ins-jour', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Lundi prochain, lundi 23.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const msg = n === 16 ? 'Non' + NB + ': lundi 16, c\'est passé.' : n === AUJ ? "Non" + NB + ": aujourd'hui, c'est mercredi." : 'Non' + NB + ': là, c\'est ' + jourDe(n) + ' ' + n + '.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $(`.ins-jour[data-n="${BON}"]`, side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'employee', seg: SEG, gel: 7.5, sideW: 540,
            consigne: "Aujourd'hui, c'est mercredi. Son fils peut commencer l'école quand" + NB + '? Clique sur le bon jour.',
            panneau: `<div class="panel glass insc"><p class="ptitre">Aujourd'hui, c'est mercredi 18.</p>
              <div class="ins-cal"><p class="ins-mois">Novembre 2026</p>
                <div class="ins-tetes" aria-hidden="true">${JS.map(j => `<span>${j.slice(0, 3)}.</span>`).join('')}</div>
                ${SEMAINES.map(s => `<p class="ins-sem">${s.t}</p><div class="ins-ligne" role="group" aria-label="${s.t}">${JS.map((j, i) => {
                  const n = s.d + i, we = i > 4;
                  return `<button class="ins-jour${n === AUJ ? ' auj' : ''}${we ? ' we' : ''}" data-n="${n}" ${we ? 'disabled' : ''} aria-label="${j} ${n}${n === AUJ ? ", aujourd'hui" : ''}"><b>${n}</b><small>${n === AUJ ? "aujourd'hui" : ''}</small></button>`;
                }).join('')}</div>`).join('')}
              </div></div>`,
            monte: p => $$('.ins-jour:not([disabled])', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { pere: 'son fils' + A.NB + ': 7 ans' },
      faits: {
        pere: [{ text: "Je voudrais inscrire mon fils à l'école.", seg: A.ligne(0) }, { text: 'Sept ans.', seg: A.ligne(2) }, { text: 'Il parle un peu français.', seg: A.ligne(3) }],
        employee: [{ text: 'Il a quel âge, votre fils' + A.NB + '?', seg: A.ligne(1) }, { text: 'Il peut commencer lundi prochain.', seg: A.ligne(5) }],
      },
    }),
  };
})();
