/* Café ou thé ? Dans la cuisine du bureau, elle lui propose un café ; il préfère un thé, sans sucre (et ils se tutoient).
   1 · dans la vidéo : la scène repart, on touche l'image à chaque question de la femme (« Tu veux un café ? », « Avec du
       sucre ? »), pas quand l'homme répond ;
   2 · l'homme redit ce qu'il préfère (la vidéo resserrée sur lui) : on glisse le sachet de thé dans sa tasse d'eau chaude ;
   3 · il redit « sans sucre » : deux sucres attendent sur la soucoupe, on les glisse dans la tasse ou dans le sucrier, puis
       on clique sur Servir. (À l'image, ni thé ni sucre : rien ne donne la réponse.) */
window.SCENARIO = (() => {
  const NB = ' ';
  const SVG = {
    cafe: `<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-28 32 32)"><rect x="23" y="3" width="18" height="58" rx="3" fill="#6B4226"/><path d="M23 9h18M23 55h18" stroke="#A47148" stroke-width="2.2" stroke-dasharray="2.2 2.2"/>
      <ellipse cx="32" cy="32" rx="6" ry="8.5" fill="#E2C29A"/><path d="M32 24c-3 5 3 11 0 16" stroke="#6B4226" stroke-width="1.8" fill="none" stroke-linecap="round"/></g></svg>`,
    the: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 24c0-8 5-13 11-14" fill="none" stroke="#A08A64" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="40" y="3" width="19" height="13" rx="2.5" fill="#3FA34D"/><path d="M45 13.5c0-4.5 3.4-7 9-7-.8 4.6-3.6 7-9 7z" fill="#fff"/>
      <path d="M17 24h30l2 33H15z" fill="#EAD9B5"/><path d="M17 24h30v6H17z" fill="#D6BE8C"/>
      <g fill="#9A7442"><circle cx="24" cy="39" r="1.7"/><circle cx="33" cy="45" r="1.7"/><circle cx="40" cy="37" r="1.5"/><circle cx="27" cy="50" r="1.5"/><circle cx="39" cy="51" r="1.7"/></g></svg>`,
    chocolat: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="13" y="8" width="38" height="50" rx="3" fill="#8E3B2E"/><path d="M13 13h38M13 53h38" stroke="#B25A48" stroke-width="2.2" stroke-dasharray="2.2 2.2"/>
      <rect x="21" y="22" width="22" height="22" rx="2.5" fill="#5A2318"/><path d="M21 33h22M32 22v22" stroke="#8E3B2E" stroke-width="1.8"/></svg>`,
  };
  /* la tasse de l'homme : de l'eau chaude ; avec le thé, le sachet pend sur le bord et l'eau devient ambrée */
  const TASSE = `<svg viewBox="0 0 200 170" aria-hidden="true">
      <ellipse cx="96" cy="152" rx="88" ry="15" fill="#E4DED2"/><ellipse cx="96" cy="150" rx="60" ry="9" fill="#D3CBBB"/>
      <path d="M150 74c28-7 40 9 36 25-4 18-22 26-40 24" fill="none" stroke="#EFEAE1" stroke-width="12" stroke-linecap="round"/>
      <path d="M38 52h116l-9 88c-1 8-7 12-15 12H62c-8 0-14-4-15-12z" fill="#F7F4EE"/>
      <path d="M124 52h30l-9 88c-1 8-7 12-15 12h-10c8 0 12-5 13-12z" fill="#E6E0D4"/>
      <ellipse cx="96" cy="52" rx="58" ry="12" fill="#EFEAE1"/><ellipse class="liquide" cx="96" cy="54" rx="51" ry="9"/>
      <g class="vapeur" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"><path d="M78 38c-6-8 6-12 0-22"/><path d="M98 34c-6-8 6-12 0-22"/><path d="M118 38c-6-8 6-12 0-22"/></g>
      <g class="sachet"><path d="M86 56C72 34 48 34 41 50l-9 30" fill="none" stroke="#A08A64" stroke-width="2"/><rect x="19" y="79" width="24" height="17" rx="3" fill="#3FA34D"/><path d="M25 92c0-5.5 4-8.5 11-8.5-1 5.6-4.4 8.5-11 8.5z" fill="#fff"/></g>
    </svg>`;
  /* le sucrier : un pot rond, ouvert (son couvercle posé à côté), avec des sucres dedans */
  const DE = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M6 13l14-7 14 7-14 7z" fill="#fff"/><path d="M6 13v12l14 7V20z" fill="#E6E3DC"/><path d="M34 13v12l-14 7V20z" fill="#D2CEC5"/></g>`;
  const SUCRIER = `<svg viewBox="0 0 200 140" aria-hidden="true">
      <ellipse cx="96" cy="128" rx="60" ry="9" fill="#E4DED2"/>
      <g transform="rotate(24 168 88)"><ellipse cx="168" cy="104" rx="30" ry="8" fill="#E6E0D4"/><path d="M138 104c0-18 13-28 30-28s30 10 30 28z" fill="#F7F4EE"/><circle cx="168" cy="72" r="7" fill="#E6E0D4"/></g>
      <path d="M38 64c-12 0-12 22 3 22M154 64c12 0 12 22-3 22" fill="none" stroke="#EFEAE1" stroke-width="7" stroke-linecap="round"/>
      <path d="M42 54c-4 46 18 70 54 70s58-24 54-70z" fill="#F7F4EE"/><path d="M122 54h28c4 46-18 70-54 70 22-8 32-34 26-70z" fill="#E6E0D4"/>
      <ellipse cx="96" cy="54" rx="54" ry="12" fill="#EFEAE1"/><ellipse cx="96" cy="56" rx="47" ry="9" fill="#CFC6B6"/>
      ${DE(62, 38, .7)}${DE(82, 34, .7)}${DE(103, 39, .7)}
    </svg>`;
  const SOUCOUPE = '<svg viewBox="0 0 170 34" aria-hidden="true"><ellipse cx="85" cy="17" rx="82" ry="15" fill="#E4DED2"/><ellipse cx="85" cy="16" rx="56" ry="9" fill="#D3CBBB"/></svg>';
  const CUBE = '<svg viewBox="4 4 32 32" aria-hidden="true"><path d="M6 13l14-7 14 7-14 7z" fill="#fff"/><path d="M6 13v14l14 7V20z" fill="#E6E3DC"/><path d="M34 13v14l-14 7V20z" fill="#CFCAC0"/><g fill="#BDB7AB"><circle cx="11" cy="21" r=".9"/><circle cx="15" cy="26" r=".9"/><circle cx="26" cy="22" r=".9"/><circle cx="29" cy="27" r=".9"/><circle cx="20" cy="11" r=".9"/></g></svg>';

  return {
    plans: [{ de: 0, cx: { femme: .43, homme: .66 } }, { de: 1.92, cx: { femme: .3, homme: .6 } }, { de: 3.46, cx: { femme: .44, homme: .6 } },
      { de: 4.79, cx: { femme: .3, homme: .6 } }, { de: 7.13, cx: { femme: .41, homme: .66 } }],
    ordre: ['questions', 'tasse', 'sucre'],
    bravo: 'Super' + NB + '! Un thé sans sucre, comme il préfère.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, setSide, frameTo, CROPS, freeze, playSegment, phrase, ligne, LINES, side, idle, at, sfx, fly, faux, juste, suite, goBtn, wait, zones, cam, avant, marque, stopAll } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const dedans = (el, x, y, m = 14) => { const r = el.getBoundingClientRect(); return x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m; };
      const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      /* faire glisser un élément du panneau (ou cliquer dessus) : lacher(el, cible, ev) au lâcher, clic(el) sur un simple clic */
      function tirer(el, { cibles, lacher, clic }) {
        let st = null;
        el.addEventListener('pointerdown', e => {
          if (!tour() || e.button > 0) return;
          A.unlock(); idle.reset(); st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
          try { el.setPointerCapture(e.pointerId); } catch (err) {}
        });
        el.addEventListener('pointermove', e => {
          if (!st || e.pointerId !== st.id) return;
          const dx = e.clientX - st.x, dy = e.clientY - st.y;
          if (!st.bouge && Math.hypot(dx, dy) < 6) return;
          if (!st.bouge) { st.bouge = true; el.classList.add('tenu'); sfx.tick(); }
          el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
          cibles().forEach(c => c.classList.toggle('chaud', dedans(c, e.clientX, e.clientY)));
        });
        const fin = e => {
          if (!st || e.pointerId !== st.id) return;
          const s = st; st = null; cibles().forEach(c => c.classList.remove('chaud'));
          if (!s.bouge) return;
          el.classList.remove('tenu'); el.dataset.glisse = '1'; setTimeout(() => delete el.dataset.glisse, 60);
          const c = e.type === 'pointerup' && tour() ? cibles().find(x => dedans(x, e.clientX, e.clientY)) : null;
          lacher(el, c || null, e);
        };
        el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
        el.addEventListener('click', () => { if (el.dataset.glisse || !tour()) return; A.unlock(); idle.reset(); clic(el); });
      }
      const retour = el => { el.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)'; el.style.transform = ''; setTimeout(() => { el.style.transition = ''; }, 460); };
      const glisseVers = (de, vers, fin = .45) => () => {
        if (!de || !de.isConnected || !vers || !vers.isConnected) return null;
        const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * fin;
        return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
      };

      return {
        /* 1 · dans la vidéo : la scène repart du début, on touche l'image à chaque question de la femme */
        async questions(f) {
          const FIN = LINES[3].e + .3;
          const QS = [0, 2].map(i => ({ i, de: LINES[i].s - .1, a: LINES[i + 1].s - .08, seg: ligne(i), txt: LINES[i].words.map(w => w.t).join(' '), ok: false }));
          const repond = t => (t >= LINES[1].s - .08 && t < QS[1].de) || t >= LINES[3].s - .08;
          const reste = () => QS.filter(q => !q.ok);
          let touche = null, depart = 0;
          setSide(null); frameTo(CROPS.full, false); idle.clear();
          state.gel = 0; await freeze(0); if (!alive(f)) return;
          state.ask = 'La femme pose deux questions. Touche la vidéo à chaque question.';
          if (!await Q.say(state.ask, f)) return;
          async function lancer(de) {
            depart = de; touche = null; $$('.surimage', cam).forEach(e => e.remove());
            Q.show('you', QS.some(q => q.ok) ? "Et l'autre question" + NB + '?' : state.ask); setTurn('you'); cam.classList.add('asking');
            const fini = await playSegment(de, FIN, null);
            if (!alive(f) || touche !== null || !fini) return;
            cam.classList.remove('asking'); setTurn('wait');
            rater("Tu n'as pas touché. Écoute encore.");
          }
          async function rater(msg) {
            const q = reste()[0];
            const montrer = await faux(f, q.seg, msg); if (montrer === null) return;
            if (montrer) {
              Q.show('ok', 'Les questions' + NB + ': «' + NB + QS[0].txt + NB + '» et «' + NB + QS[1].txt + NB + '».');
              state.essais = 0; zones(null); suite();
            } else { await wait(300); if (alive(f)) lancer(q.i === 0 ? 0 : 1.95); }
          }
          zones([{ id: 'ecran', label: 'Toucher la vidéo', x: 0, y: 0, w: 100, h: 100 }], async (id, ev) => {
            const t = $('#vid').currentTime, q = QS.find(x => t >= x.de && t <= x.a);
            if (q && q.ok) return;                                   // une question déjà trouvée : la scène continue
            touche = t; stopAll(); cam.classList.remove('asking'); setTurn('wait');
            const r = cam.getBoundingClientRect(), z = { x: (ev.clientX - r.left) / r.width * 100, y: (ev.clientY - r.top) / r.height * 100, w: 0, h: 0 };
            if (q) {
              q.ok = true; marque(z, q.txt, 'juste');
              if (!await juste(f, 'Oui' + NB + '! «' + NB + q.txt + NB + '»')) return;
              await wait(1300); if (!alive(f)) return;
              if (!reste().length) { zones(null); Q.show('ok', 'Les deux questions' + NB + ': le café, puis le sucre.'); suite(); }
              else lancer(reste()[0].i > q.i ? t : 0);
            } else {
              const parle = repond(t);
              marque(z, parle ? "l'homme répond" : 'pas encore', 'faux');
              rater(parle ? "Non, là, c'est l'homme" + NB + ': il répond. Écoute encore.' : 'Pas encore. Écoute bien.');
            }
          });
          $('.hit[data-id="ecran"]', cam).classList.add('ecran');
          state.replay = () => { if (!tour()) return; stopAll(); lancer(depart); };
          lancer(0);
        },

        /* 2 · il redit ce qu'il préfère : on glisse le sachet de thé (pas le café, pas le chocolat) dans sa tasse */
        async tasse(f) {
          const SEG = ligne(1);
          const B = [
            { id: 'cafe', nom: 'un café', pas: 'Pas de café' + NB + ': il dit «' + NB + 'non merci' + NB + '». Écoute encore.' },
            { id: 'the', nom: 'un thé' },
            { id: 'chocolat', nom: 'un chocolat', pas: 'Pas de chocolat. Écoute encore.' },
          ];
          const comptoir = () => $('.comptoir', side);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(glisseVers($('.boisson[data-id="chocolat"]', side), $('.tasse', side)), 4500); };
          async function poser(el) {
            setTurn('wait'); idle.clear();
            const b = B.find(x => x.id === el.dataset.id);
            if (b.id === 'the') {
              $$('.boisson', side).forEach(x => { x.disabled = true; }); el.classList.remove('indice'); el.classList.add('pris'); el.style.transform = '';
              comptoir().classList.add('the', 'juste'); $('.comptoir .legende', side).textContent = 'un thé';
              if (!await juste(f, 'Oui' + NB + '! Il préfère un thé.', phrase('je préfère un thé'))) return;
              suite();
            } else {
              retour(el); el.classList.add('faux'); secouer(el); secouer(comptoir());
              const montrer = await faux(f, SEG, b.pas); if (montrer === null) return;
              el.classList.remove('faux');
              if (montrer) $('.boisson[data-id="the"]', side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            question: "Écoute l'homme.", qui: 'homme', seg: SEG, sideW: 520, consigne: "Qu'est-ce qu'il préfère" + NB + '? Glisse-le dans sa tasse.',
            panneau: `<div class="panel glass cafe"><p class="ptitre">Qu'est-ce qu'il préfère${NB}? Glisse-le dans sa tasse.</p>
              <div class="boissons">${B.map(b => `<button class="tuile boisson" data-id="${b.id}"><span class="pic">${SVG[b.id]}</span><span class="nom">${b.nom}</span></button>`).join('')}</div>
              <div class="comptoir"><div class="tasse" role="img" aria-label="Sa tasse d'eau chaude">${TASSE}</div><span class="legende">sa tasse</span></div></div>`,
            monte: p => $$('.boisson', p).forEach(el => tirer(el, {
              cibles: () => [comptoir()],
              lacher: (x, c) => { if (c) { x.style.transition = 'transform .25s, opacity .25s'; x.style.transform += ' scale(.4)'; setTimeout(() => { x.style.transition = ''; poser(x); }, 230); } else retour(x); },
              clic: x => { setTurn('wait'); fly(x, $('.tasse', side), `<div class="mini" style="width:100%;height:100%">${SVG[x.dataset.id]}</div>`, { scale: .3 }).then(() => { if (alive(f)) poser(x); }); },
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], A.gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 3 · « sans sucre » : les deux sucres de la soucoupe vont dans la tasse ou dans le sucrier, puis on sert */
        async sucre(f) {
          const SEG = ligne(3);
          let choisi = null;
          const poste = ou => $(`.poste[data-ou="${ou}"]`, side);
          const dans = ou => $$('.sucre', poste(ou)).length;
          const choisir = c => { choisi = c; $$('.sucre', side).forEach(x => x.setAttribute('aria-pressed', x === c)); };
          const deplacer = (c, ou) => {
            const a = c.getBoundingClientRect(); $('.places', poste(ou)).append(c); c.style.transform = ''; c.style.transition = '';
            const b = c.getBoundingClientRect();
            if (!A.reduced) c.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.32,.72,0,1)' });
            sfx.tick(); choisir(null);
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Servir', servir); yourTurn(); idle.set(glisseVers($('.poste[data-ou="soucoupe"] .sucre', side), $('.table', side), .08), 4500); };
          const lieu = (ou, nom, legende, dessin) => `<div class="poste" data-ou="${ou}"><button class="cible" aria-label="${nom}">${dessin}<span class="legende">${legende}</span></button><div class="places"></div></div>`;
          if (!await avant(f, {
            question: "Écoute encore l'homme.", qui: 'homme', seg: SEG, sideW: 520, consigne: 'Il veut du sucre' + NB + '? Glisse les sucres dans la tasse ou dans le sucrier, puis clique sur Servir.',
            panneau: `<div class="panel glass cafe sucres"><p class="ptitre">Il veut du sucre${NB}? Glisse les sucres dans la tasse ou dans le sucrier.</p>
              ${lieu('soucoupe', 'La soucoupe', 'deux sucres', SOUCOUPE)}
              <div class="table">${lieu('sucrier', 'Le sucrier', 'le sucrier', SUCRIER)}${lieu('tasse', 'La tasse', 'sa tasse de thé', `<span class="tasse the">${TASSE}</span>`)}</div></div>`,
            monte: p => {
              $('.poste[data-ou="soucoupe"] .places', p).innerHTML = [0, 1].map(k => `<button class="sucre" data-k="${k}" aria-label="Un sucre" aria-pressed="false">${CUBE}</button>`).join('');
              const cibles = () => $$('.poste[data-ou="sucrier"] .cible, .poste[data-ou="tasse"] .cible, .poste[data-ou="soucoupe"] .cible', side);
              $$('.sucre', p).forEach(c => tirer(c, {
                cibles,
                lacher: (x, cb) => { if (cb) deplacer(x, cb.closest('.poste').dataset.ou); else retour(x); },
                clic: x => { sfx.tick(); choisir(choisi === x ? null : x); },
              }));
              $$('.cible', p).forEach(cb => cb.addEventListener('click', () => {
                if (!tour()) return; A.unlock(); idle.reset();
                if (choisi) deplacer(choisi, cb.closest('.poste').dataset.ou);
                else if (dans('soucoupe')) Q.show('you', 'Glisse les sucres' + NB + ': dans la tasse ou dans le sucrier.');
              }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], A.gel()); if (alive(f)) ask(); };
          async function servir() {
            if (!tour()) return;
            if (dans('soucoupe')) { secouer(poste('soucoupe')); Q.show('you', 'Glisse les deux sucres' + NB + ': dans la tasse ou dans le sucrier.'); return; }
            setTurn('wait'); goBtn(null); idle.clear(); choisir(null);
            const n = dans('tasse'), fige = () => $$('.sucre, .cible', side).forEach(x => { x.disabled = true; });
            if (!n) {
              fige();
              poste('sucrier').classList.add('juste'); poste('tasse').classList.add('juste'); $('.poste[data-ou="tasse"] .legende', side).textContent = 'un thé sans sucre';
              if (!await juste(f, 'Oui' + NB + '! Sans sucre.', phrase('sans sucre'))) return;
              suite();
            } else {
              poste('tasse').classList.add('faux'); secouer(poste('tasse'));
              const montrer = await faux(f, SEG, (n === 2 ? 'Deux sucres' : 'Un sucre') + NB + '? Non. Écoute encore.'); if (montrer === null) return;
              poste('tasse').classList.remove('faux');
              if (montrer) {
                $$('.sucre', side).forEach(c => deplacer(c, 'sucrier')); fige(); poste('sucrier').classList.add('juste'); poste('tasse').classList.add('juste');
                $('.poste[data-ou="tasse"] .legende', side).textContent = 'un thé sans sucre';
                Q.show('ok', 'Sans sucre' + NB + ': les sucres restent dans le sucrier.'); state.essais = 0; suite();
              } else { $$('.poste[data-ou="tasse"] .sucre', side).forEach(c => deplacer(c, 'soucoupe')); ask(); }
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { homme: 'un thé, sans sucre' },
      faits: {
        femme: [{ text: 'Tu veux un café' + A.NB + '?', seg: A.ligne(0) }, { text: '«' + A.NB + 'tu' + A.NB + '»' + A.NB + ': ils se tutoient', seg: A.phrase('tu veux') }, { text: 'Avec du sucre' + A.NB + '?', seg: A.ligne(2) }],
        homme: [{ text: 'Non merci, je préfère un thé.', seg: A.ligne(1) }, { text: 'Non, sans sucre, merci.', seg: A.ligne(3) }],
      },
    }),
  };
})();
