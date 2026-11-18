/* Le guichet : dans le hall d'une gare, un voyageur demande à une agente si le guichet est ouvert ; oui, jusqu'à vingt
   heures ; il est juste là, à gauche (coupes à 2,29, 5, 6,375 et 8,5 s : le voyageur de près, l'agente de près, le voyageur
   par-dessus l'épaule de l'agente, l'agente de près — elle montre la direction —, le voyageur de nouveau).
   Nouveauté de cette scène : deux questions sur trois se font SUR la vidéo, qui reste en grand (des cartes de verre posées
   sur l'image figée, comme si la vidéo contenait la question) ; la troisième garde le panneau à côté (vidéo décalée).
   1 · (sur la vidéo) le voyageur redit sa question : quatre cartes montent sur l'image, à droite (loin de son visage) ; on
       clique sur ce qu'il cherche (le guichet, parmi les toilettes, le café, la sortie : tout ce qu'on cherche dans une gare) ;
   2 · (sur la vidéo) l'agente redit « Oui, il est ouvert jusqu'à vingt heures » : une carte « Le guichet est ouvert
       jusqu'à … » et quatre heures (12 h, 18 h, 20 h, 22 h) montent à gauche (loin de son visage) ; on fait glisser la bonne
       heure dans la case (un clic sur l'heure marche aussi) ;
   3 · (panneau) « Il est où ? — Juste là, à gauche. » : à côté, le plan du hall vu de dessus, le voyageur en bas, de dos
       (sa gauche est donc notre gauche : pas de piège de point de vue) ; quatre endroits possibles (à gauche tout près, à
       gauche au fond, en face, à droite) ; on clique sur le bon : le voyageur y marche. « Juste là » écarte le fond à gauche.
   Les images figées ne donnent rien : 2,1 s (le voyageur de près, avant la réponse), 4,8 s (l'agente de près, bouche
   fermée, aucune horloge ni aucun horaire lisible), 6,6 s (l'agente de près AVANT qu'elle montre la direction), 9,5 s (fin). */
window.SCENARIO = (() => {
  const NB = ' ';

  /* 1 · ce que le voyageur peut chercher dans une gare (pictogrammes au trait, viewBox 24 × 24) */
  const LIEUX = [
    { id: 'toilettes', nom: 'les toilettes', svg: '<rect x="3" y="5" width="18" height="14" rx="3"/><text x="12" y="15.6" text-anchor="middle" font-size="8.5" font-weight="800" fill="currentColor" stroke="none" font-family="system-ui, sans-serif">WC</text>' },
    { id: 'guichet', nom: 'le guichet', bon: true, svg: '<path d="M3 20V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/><path d="M2 15h20"/><circle cx="12" cy="8.6" r="2"/><path d="M8.6 15a3.4 3.4 0 0 1 6.8 0"/><path d="M9 18.5h6"/>' },
    { id: 'cafe', nom: 'le café', svg: '<path d="M4.5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M15.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.6"/><path d="M8 3.5c0 1.4 1.4 1.4 1.4 2.8M11.6 3.5c0 1.4 1.4 1.4 1.4 2.8"/><path d="M4 21h13"/>' },
    { id: 'sortie', nom: 'la sortie', svg: '<path d="M13 4H6v16h7"/><path d="M10.5 12H21M17 8l4 4-4 4"/>' },
  ];
  /* 2 · les heures proposées : 20 h, et des heures qui s'entendent ou se lisent pas loin */
  const HEURES = [
    { h: 12, dit: 'douze heures' }, { h: 22, dit: 'vingt-deux heures' }, { h: 18, dit: 'dix-huit heures' }, { h: 20, dit: 'vingt heures', bon: true },
  ];
  /* 3 · le plan du hall (viewBox 400 × 300), vu de dessus ; les endroits possibles en coordonnées du plan */
  const ENDROITS = [
    { id: 'pres-gauche', nom: 'à gauche, tout près', x: 14, y: 172, w: 74, h: 72, bon: true },
    { id: 'fond-gauche', nom: 'à gauche, au fond', x: 14, y: 26, w: 74, h: 72, msg: 'Non' + NB + ': il est tout près.' },
    { id: 'face', nom: 'en face, au fond', x: 163, y: 12, w: 74, h: 52, msg: 'Non, pas en face.' },
    { id: 'droite', nom: 'à droite, tout près', x: 312, y: 172, w: 74, h: 72, msg: 'Non, pas à droite.' },
  ];
  const DEPART = { x: 200, y: 262 };               // le voyageur, en bas du plan
  const pc = (v, t) => (v / t * 100).toFixed(2) + '%';
  const PLAN = `<svg viewBox="0 0 400 300" aria-hidden="true">
      <rect x="2" y="2" width="396" height="296" rx="18" fill="#E9E3D6" stroke="#B9AE98" stroke-width="4"/>
      <path d="M120 4h160" stroke="#9DB7D6" stroke-width="6"/>
      <g fill="#D9D1BF">${[[130, 120], [270, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</g>
      ${ENDROITS.map(e => `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="10" fill="#C9D3E2" stroke="#7F8FA8" stroke-width="3"/>`).join('')}
      <g transform="translate(200 196)"><circle r="11" fill="#F07B22" stroke="#fff" stroke-width="3"/></g>
      <text x="222" y="201" font-size="14" font-weight="700" fill="#5A5246" font-family="system-ui, sans-serif">l'agente</text>
      <path d="M200 238v-16" stroke="#26303F" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 5"/>
    </svg>`;
  /* le voyageur vu de dessus, de dos : la tête, les épaules, le sac à dos (il regarde vers le haut du plan) */
  const VOYAGEUR = `<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="22" rx="15" ry="9" fill="#C8B48E"/><rect x="12" y="24" width="16" height="12" rx="4" fill="#4E5A3E"/><circle cx="20" cy="17" r="7" fill="#3A2E25"/></svg>`;

  /* ================= LES CARTES SUR LA VIDÉO (overlay) — modèle réutilisable =================
     Le moteur affiche un geste soit dans un panneau à côté (la vidéo se décale), soit sur l'image (zones, marques).
     Ici, on pose des cartes d'interface PAR-DESSUS la vidéo restée en grand :
     - on appelle avant(f, { qui, seg, consigne, monte }) SANS panneau : le moteur rejoue la réplique, puis remet la vidéo
       en grand (frameTo(full)) et appelle monte() ; c'est là qu'on pose le calque ;
     - le calque va dans la fenêtre (A.win), pas dans la caméra (A.cam) : sur téléphone tenu droit, la caméra (16/9) déborde
       de la fenêtre (4/3) ; dans la fenêtre, les positions en % tombent toujours dans la partie visible ;
     - il porte aussi la classe « qte » du moteur : go() efface tout « .qte » de la fenêtre en changeant d'étape, donc le
       calque disparaît tout seul (bilan, étape suivante, Recommencer) ; .qte lui donne aussi inset: 0 et pointer-events: none
       (seules les cartes reçoivent les clics) ;
     - data-cote="g" ou "d" : les cartes se rangent du côté opposé au visage de la personne à l'image ;
     - pendant une réécoute (bouton réécouter, erreur), le calque s'efface (classe « ecoute ») pour laisser voir la vidéo.
     Les cartes elles-mêmes (.gu-carte) : verre sombre translucide, apparition l'une après l'autre (--i). */
  function calque(A, cote, html) {
    const c = document.createElement('div');
    c.className = 'qte gu-calque'; c.dataset.cote = cote; c.innerHTML = html;
    A.win.append(c);
    return c;
  }
  /* faux() du moteur, mais le calque s'efface pendant que la vidéo rejoue l'extrait (faux() attend 850 ms puis rejoue) */
  async function fauxSurVideo(A, f, c, seg, msg) {
    const t = setTimeout(() => c.classList.add('ecoute'), 800);
    const r = await A.faux(f, seg, msg);
    clearTimeout(t); c.classList.remove('ecoute');
    return r;
  }
  /* réécouter : même chose avec le bouton du dock */
  const reecoute = (A, f, c, seg, ensuite) => async () => {
    A.setTurn('listen'); A.idle.clear(); c.classList.add('ecoute');
    await A.playSegment(seg[0], seg[1], A.gel());
    c.classList.remove('ecoute'); if (A.alive(f)) ensuite();
  };

  return {
    plans: [{ de: 0, cx: { voyageur: .43, agente: .97 } }, { de: 2.292, cx: { voyageur: .1, agente: .55 } }, { de: 5, cx: { voyageur: .4, agente: .88 } },
      { de: 6.375, cx: { voyageur: .1, agente: .55 } }, { de: 8.5, cx: { voyageur: .44, agente: .92 } }],
    ordre: ['cherche', 'heure', 'ou'],
    bravo: 'Bravo' + NB + '! Le voyageur a trouvé le guichet, juste là, à gauche.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, ligne, side, idle, tapHere, at, sfx, juste, suite, wait, avant, faux, playSegment, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y, m = 12) => { const r = el.getBoundingClientRect(); return x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m; };
      return {
        /* 1 · SUR LA VIDÉO : quatre cartes à droite du voyageur ; on clique sur ce qu'il cherche */
        async cherche(f) {
          const SEG = ligne(0);
          let c = null, fini = false;
          const carte = id => $(`.gu-carte[data-id="${id}"]`, c);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(carte('toilettes')), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); setTurn('wait'); idle.clear(); sfx.tick();
            const l = LIEUX.find(x => x.id === b.dataset.id);
            $$('.gu-carte', c).forEach(x => x.setAttribute('aria-pressed', x === b));      // blanc : choisi
            await wait(380); if (!alive(f)) return;
            if (l.bon) {
              fini = true; b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il cherche le guichet.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await fauxSurVideo(A, f, c, SEG, 'Non, pas ' + l.nom + '.'); if (montrer === null) return;
              b.classList.remove('faux'); b.setAttribute('aria-pressed', 'false');
              if (montrer) {                                     // deux essais : on montre la bonne carte
                fini = true; carte('guichet').classList.add('juste');
                Q.show('ok', 'Il cherche le guichet.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'voyageur', seg: SEG, gel: 2.1,
            consigne: "Qu'est-ce que le voyageur cherche" + NB + '? Clique sur la bonne carte.',
            monte: () => {
              c = calque(A, 'd', `<div class="gu-pile gu-lieux" role="group" aria-label="Ce que le voyageur cherche">${LIEUX.map((l, i) => `
                <button class="gu-carte" data-id="${l.id}" aria-pressed="false" style="--i:${i}"><span class="gu-pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${l.svg}</svg></span><span class="gu-nom">${l.nom}</span></button>`).join('')}</div>`);
              $$('.gu-carte', c).forEach(b => b.addEventListener('click', () => choisir(b)));
            },
          })) return;
          state.replay = reecoute(A, f, c, SEG, ask);
          ask();
        },

        /* 2 · SUR LA VIDÉO : la carte « Le guichet est ouvert jusqu'à … » et quatre heures, à gauche de l'agente ;
               on fait glisser la bonne heure dans la case (ou on clique dessus) */
        async heure(f) {
          const SEG = ligne(1);
          let c = null, fini = false;
          const casee = () => $('.gu-case', c), heure = h => $(`.gu-heure[data-h="${h}"]`, c);
          /* l'heure va se poser dans la case (ou revient à sa place avec v = null) */
          function poser(b, dans = true) {
            if (!b) return;
            b.style.transition = 'transform .5s cubic-bezier(.34,1.3,.64,1)';
            if (!dans) { b.style.transform = ''; b.classList.remove('posee'); return; }
            const ici = b.style.transform; b.style.transition = 'none'; b.style.transform = '';
            const a = b.getBoundingClientRect(), z = casee().getBoundingClientRect();
            b.style.transform = ici; void b.offsetWidth; b.style.transition = 'transform .5s cubic-bezier(.34,1.3,.64,1)';
            b.style.transform = `translate(${(z.left + z.width / 2 - (a.left + a.width / 2)).toFixed(1)}px, ${(z.top + z.height / 2 - (a.top + a.height / 2)).toFixed(1)}px)`;
            b.classList.add('posee');
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {                                     // le doigt fait glisser une heure (pas la bonne) vers la case
              const de = heure(12), vers = casee(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), z = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = z.left + z.width / 2, y2 = z.top + z.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); setTurn('wait'); idle.clear(); sfx.tick();
            const h = HEURES.find(x => x.h === +b.dataset.h);
            $$('.gu-heure', c).forEach(x => { if (x !== b) poser(x, false); });
            poser(b); casee().classList.remove('chaud');
            await wait(520); if (!alive(f)) return;
            if (h.bon) {
              fini = true; b.classList.add('juste'); casee().classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il est ouvert jusqu\'à 20' + NB + 'heures.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer($('.gu-phrase', c));
              const montrer = await fauxSurVideo(A, f, c, SEG, 'Non, pas ' + h.h + NB + 'heures.'); if (montrer === null) return;
              b.classList.remove('faux'); poser(b, false);
              if (montrer) {                                     // deux essais : on pose 20 h dans la case
                fini = true; const bon = heure(20); poser(bon); bon.classList.add('juste'); casee().classList.add('juste');
                Q.show('ok', 'Le guichet est ouvert jusqu\'à 20' + NB + 'heures.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'agente', seg: SEG, gel: 4.8,
            consigne: "Le guichet est ouvert jusqu'à quelle heure" + NB + '? Fais glisser la bonne heure dans la case.',
            monte: () => {
              c = calque(A, 'g', `<div class="gu-pile gu-ouvert">
                  <div class="gu-carte gu-phrase" style="--i:0"><span class="gu-pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/><path d="M2 15h20"/><circle cx="12" cy="8.6" r="2"/><path d="M8.6 15a3.4 3.4 0 0 1 6.8 0"/></svg></span>
                    <span class="gu-txt">Le guichet est ouvert jusqu'à</span><span class="gu-case" aria-label="La case de l'heure">?</span></div>
                  <div class="gu-heures" role="group" aria-label="Les heures">${HEURES.map((h, i) => `<button class="gu-carte gu-heure" data-h="${h.h}" style="--i:${i + 1}" aria-label="${h.dit}">${h.h}${NB}h</button>`).join('')}</div>
                </div>`);
              $$('.gu-heure', c).forEach(b => {
                let st = null;
                b.addEventListener('pointerdown', e => {
                  if (!tour() || fini || e.button > 0) return;
                  A.unlock(); idle.reset(); e.preventDefault();
                  b.style.transition = 'none'; b.style.transform = '';
                  st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                  try { b.setPointerCapture(e.pointerId); } catch (err) {}
                  b.classList.add('tenu');
                });
                b.addEventListener('pointermove', e => {
                  if (!st || e.pointerId !== st.id) return;
                  const dx = e.clientX - st.x, dy = e.clientY - st.y;
                  if (!st.bouge && Math.hypot(dx, dy) > 6) { st.bouge = true; sfx.tick(); }
                  if (st.bouge) { b.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`; casee().classList.toggle('chaud', dedans(casee(), e.clientX, e.clientY)); }
                });
                const lacher = e => {
                  if (!st || e.pointerId !== st.id) return;
                  const bouge = st.bouge; st = null; b.classList.remove('tenu'); casee().classList.remove('chaud');
                  if (e.type !== 'pointerup' || !tour()) return poser(b, false);
                  if (!bouge || dedans(casee(), e.clientX, e.clientY)) choisir(b);     // un clic, ou lâchée sur la case
                  else poser(b, false);
                };
                b.addEventListener('pointerup', lacher); b.addEventListener('pointercancel', lacher);
                b.addEventListener('click', e => { if (e.detail === 0) choisir(b); });  // au clavier (Entrée, espace)
              });
            },
          })) return;
          state.replay = reecoute(A, f, c, SEG, ask);
          ask();
        },

        /* 3 · PANNEAU : le plan du hall ; on clique sur l'endroit du guichet, le voyageur y marche */
        async ou(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let fini = false;
          const lieu = id => $(`.gu-lieu[data-id="${id}"]`, side), pion = () => $('.gu-pion', side);
          const aller = e => {                                   // le voyageur marche jusqu'à l'endroit (ou revient au départ)
            const p = pion(); if (!p) return;
            const x = e ? (e.id === 'face' ? e.x + e.w / 2 : e.x < 200 ? e.x + e.w + 22 : e.x - 22) : DEPART.x;
            const y = e ? (e.id === 'face' ? e.y + e.h + 22 : e.y + e.h / 2) : DEPART.y;
            p.style.left = pc(x, 400); p.style.top = pc(y, 300);
            p.style.rotate = e ? (e.id === 'face' ? '0deg' : e.x < 200 ? '-90deg' : '90deg') : '0deg';
            $('.gu-plan', side).classList.toggle('parti', !!e);

          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(lieu('face')), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); setTurn('wait'); idle.clear(); sfx.tick();
            const e = ENDROITS.find(x => x.id === b.dataset.id);
            $$('.gu-lieu', side).forEach(x => x.setAttribute('aria-pressed', x === b));
            aller(e);
            await wait(900); if (!alive(f)) return;
            if (e.bon) {
              fini = true; b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Juste là, à gauche.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, e.msg); if (montrer === null) return;
              b.classList.remove('faux'); b.setAttribute('aria-pressed', 'false'); aller(null);
              if (montrer) {                                     // deux essais : le voyageur va au guichet
                fini = true; const bon = lieu('pres-gauche'); bon.classList.add('juste'); aller(ENDROITS[0]);
                Q.show('ok', 'Le guichet est juste là, à gauche.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'agente', seg: SEG, gel: 6.6, sideW: 480,
            consigne: 'Le guichet est où' + NB + '? Sur le plan, clique au bon endroit.',
            panneau: `<div class="panel glass"><p class="ptitre">Le plan du hall${NB}: clique au bon endroit.</p>
              <div class="gu-plan">${PLAN}
                ${ENDROITS.map(e => `<button class="gu-lieu" data-id="${e.id}" aria-pressed="false" aria-label="${e.nom}" style="left:${pc(e.x, 400)};top:${pc(e.y, 300)};width:${pc(e.w, 400)};height:${pc(e.h, 300)}"><span>?</span></button>`).join('')}
                <div class="gu-pion" style="left:${pc(DEPART.x, 400)};top:${pc(DEPART.y, 300)}">${VOYAGEUR}</div>
                <span class="gu-legende" style="left:${pc(DEPART.x + 30, 400)};top:${pc(DEPART.y, 300)}">le voyageur</span>
              </div></div>`,
            monte: p => $$('.gu-lieu', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        voyageur: [{ text: 'Le guichet est ouvert' + A.NB + '?', seg: A.phrase('le guichet est ouvert') }, { text: 'Il est où' + A.NB + '?', seg: A.ligne(2) }],
        agente: [{ text: 'Oui, il est ouvert jusqu\'à vingt heures.', seg: A.ligne(1) }, { text: 'Juste là, à gauche.', seg: A.ligne(3) }],
      },
    }),
  };
})();
