/* L'avis de passage : au guichet, un jeune homme dit qu'il a reçu un avis de passage ; l'employée demande si c'est pour un
   colis ou une lettre ; « Une lettre recommandée, je crois. » ; elle va la chercher.
   Coupes : 1,96 s (l'employée de près), 3,92 s (lui de près), 5,96 s (elle de près), 8,96 s (plan large, elle se lève).
   1 · il redit sa première phrase (la vidéo resserrée sur lui) : à côté, quatre papiers (un avis de passage, une facture,
       un ticket de caisse, une ordonnance) et le guichet ; on fait glisser le bon papier sur le guichet, comme dans la
       vraie vie (un simple clic sur un papier le pose aussi) ;
   2 · ils redisent la suite (« C'est pour un colis ou une lettre ? — Une lettre recommandée, je crois. — D'accord, un
       instant, je vais la chercher. ») : à côté, le casier derrière le guichet (colis, lettres, lettres recommandées, petits
       paquets) ; on clique sur le casier où elle va chercher la lettre.
   Pas de geste dans la vidéo : l'image n'a rien d'utile à toucher (deux plans rapprochés de visages, un plan large où le seul
   papier est sur le comptoir, illisible) ; un geste sur l'image n'aurait vérifié aucune information du dialogue.
   Images figées : 1,3 s (plan large, personne ne montre rien) et 8,5 s (l'employée de près, avant qu'elle se lève) : aucune
   ne donne de réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* 1 · ses papiers : on lit le titre de chacun */
  const PAPIERS = [
    { id: 'facture', nom: 'une facture', msg: 'Non, ça, c\'est une facture.',
      html: '<span class="ap-titre">Facture</span><span class="ap-lignes"><i></i><i></i><i></i></span><span class="ap-total">Total : 48,90 €</span>' },
    { id: 'avis', nom: 'un avis de passage', bon: true,
      html: '<span class="ap-titre">Avis de passage</span><span class="ap-lignes"><i></i><i></i></span><span class="ap-case" aria-hidden="true"></span>' },
    { id: 'ordonnance', nom: 'une ordonnance', msg: 'Non, ça, c\'est une ordonnance.',
      html: '<span class="ap-titre">Ordonnance</span><span class="ap-dr">Dr Martin</span><span class="ap-lignes"><i></i><i></i></span>' },
    { id: 'ticket', nom: 'un ticket de caisse', msg: 'Non, ça, c\'est un ticket de caisse.',
      html: '<span class="ap-titre">Ticket de caisse</span><span class="ap-lignes"><i></i><i></i><i></i></span>' },
  ];
  /* 2 · le casier derrière le guichet : ce qu'on voit dans chaque bac */
  const ENV = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect width="52" height="34" rx="3" fill="#FAFAF7" stroke="#B9BDC4" stroke-width="1.6"/><path d="M1.5 2l24.5 17L50.5 2" fill="none" stroke="#B9BDC4" stroke-width="1.6"/></g>`;
  const CASIERS = [
    { id: 'colis', nom: 'Colis', msg: 'Non, ce n\'est pas un colis.',
      svg: `<svg viewBox="0 0 120 70" aria-hidden="true"><rect x="8" y="22" width="56" height="44" rx="3" fill="#C99A5E"/><path d="M8 34h56M36 22v12" stroke="#A97B42" stroke-width="3"/><rect x="58" y="10" width="54" height="56" rx="3" fill="#D8AC70"/><path d="M58 24h54M85 10v14" stroke="#B5864B" stroke-width="3"/><rect x="66" y="36" width="20" height="12" rx="2" fill="#FFFDF5"/></svg>` },
    { id: 'lettres', nom: 'Lettres', msg: 'Presque' + NB + '! C\'est une lettre, mais pas une lettre normale.',
      svg: `<svg viewBox="0 0 120 70" aria-hidden="true">${ENV(10, 30, -6)}${ENV(56, 26, 5)}${ENV(32, 18, -1)}</svg>` },
    { id: 'recommandees', nom: 'Lettres recommandées', bon: true,
      svg: `<svg viewBox="0 0 120 70" aria-hidden="true">${ENV(10, 30, -5)}${ENV(56, 27, 4)}<g transform="translate(32 18) rotate(-1)"><rect width="52" height="34" rx="3" fill="#FAFAF7" stroke="#B9BDC4" stroke-width="1.6"/><rect x="6" y="6" width="22" height="14" rx="1.5" fill="#fff" stroke="#3E7D5A" stroke-width="1.6"/><path d="M9 9v8M11.5 9v8M13 9v8M16 9v8M18 9v8M21 9v8M23.5 9v8M25 9v8" stroke="#2B2F3A" stroke-width="1.1"/><rect x="34" y="5" width="12" height="12" rx="1.5" fill="#F2C94C"/></g></svg>` },
    { id: 'paquets', nom: 'Petits paquets', msg: 'Non, ce n\'est pas un paquet.',
      svg: `<svg viewBox="0 0 120 70" aria-hidden="true"><g transform="rotate(-5 40 45)"><rect x="10" y="26" width="58" height="38" rx="6" fill="#E3C28F"/><path d="M14 33h50" stroke="#C9A46B" stroke-width="2.4" stroke-dasharray="2 4"/></g><g transform="rotate(4 84 40)"><rect x="56" y="16" width="56" height="44" rx="6" fill="#EBCF9F"/><path d="M60 24h48" stroke="#CCA86F" stroke-width="2.4" stroke-dasharray="2 4"/><rect x="66" y="34" width="22" height="12" rx="2" fill="#FFFDF5"/></g></svg>` },
  ];
  const GEL_EMPLOYEE = 8.5;                     // l'employée de près, elle sourit, juste avant qu'elle se lève

  return {
    plans: [{ de: 0, cx: { employee: .19, homme: .72 } }, { de: 1.958, cx: { employee: .42, homme: .42 } }, { de: 3.917, cx: { employee: .62, homme: .62 } },
      { de: 5.958, cx: { employee: .42, homme: .42 } }, { de: 8.958, cx: { employee: .24, homme: .74 } }],
    ordre: ['papier', 'casier'],
    bravo: 'Bravo' + NB + '! L\'employée va chercher sa lettre recommandée.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, wait, avant } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · il redit ce qu'il a reçu : on fait glisser le bon papier sur le guichet */
        async papier(f) {
          const SEG = ligne(0);
          const papier = id => $(`.ap-papier[data-id="${id}"]`, side), guichet = () => $('.ap-guichet', side);
          let fini = false;
          /* le papier va se poser sur le guichet (ou revient à sa place) */
          function poser(el, sur, anime = true) {
            if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!sur) { el.style.transition = tr; el.style.transform = ''; el.classList.remove('pose'); return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = $('.ap-pose', guichet()).getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.86)`;
            el.classList.add('pose');
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {                                    // le doigt fantôme glisse la facture (jamais le bon papier)
              const de = papier('facture'), vers = guichet(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .55;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const el = papier(id), p = PAPIERS.find(x => x.id === id), g = guichet();
            poser(el, true); g.classList.remove('chaud');
            await wait(500); if (!alive(f)) return;
            if (p.bon) {
              $$('.ap-papier', side).forEach(x => x.classList.remove('indice')); el.classList.add('juste'); g.classList.add('juste'); fini = true;
              if (!await juste(f, 'Oui' + NB + '! Il a reçu un avis de passage.')) return;
              suite();
            } else {
              el.classList.add('faux'); g.classList.add('faux'); secouer(g);
              const montrer = await faux(f, SEG, p.msg); if (montrer === null) return;
              el.classList.remove('faux'); g.classList.remove('faux'); poser(el, false);
              if (montrer) papier('avis').classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass ap"><p class="ptitre">Fais glisser le bon papier sur le guichet.</p>
            <div class="ap-papiers">${PAPIERS.map(p => `<button class="ap-papier ap-${p.id}" data-id="${p.id}" aria-label="${p.nom.replace(/^une? /, '')}">${p.html}</button>`).join('')}</div>
            <div class="ap-guichet"><span class="ap-vitre" aria-hidden="true"></span><span class="ap-comptoir"><span class="ap-pose">le guichet</span></span></div></div>`;
          if (!await avant(f, {
            qui: 'homme', seg: SEG, sideW: 520, panneau,
            consigne: 'Qu\'est-ce qu\'il a reçu' + NB + '? Fais glisser le bon papier sur le guichet.',
            monte: p => {
              let st = null;
              $$('.ap-papier', p).forEach(el => {
                el.addEventListener('pointerdown', e => {
                  if (!tour() || fini || e.button > 0) return;
                  A.unlock(); idle.reset(); e.preventDefault();
                  el.style.transition = 'none'; el.style.transform = '';
                  st = { el, x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                  try { el.setPointerCapture(e.pointerId); } catch (err) {}
                  el.classList.add('tenu');
                });
                el.addEventListener('pointermove', e => {
                  if (!st || st.el !== el || e.pointerId !== st.id) return;
                  const dx = e.clientX - st.x, dy = e.clientY - st.y;
                  if (!st.bouge && Math.hypot(dx, dy) > 6) { st.bouge = true; sfx.tick(); }
                  if (st.bouge) el.style.transform = `translate(${dx}px, ${dy}px) rotate(-3deg) scale(1.04)`;
                  guichet().classList.toggle('chaud', st.bouge && dedans(guichet(), e.clientX, e.clientY));
                });
                const lacher = e => {
                  if (!st || st.el !== el || e.pointerId !== st.id) return;
                  const bouge = st.bouge; st = null; el.classList.remove('tenu'); guichet().classList.remove('chaud');
                  if (e.type !== 'pointerup' || !tour()) { poser(el, false); return; }
                  if (!bouge || dedans(guichet(), e.clientX, e.clientY)) choisir(el.dataset.id);     // un clic le pose aussi
                  else poser(el, false);
                };
                el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
                el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && tour()) { e.preventDefault(); A.unlock(); choisir(el.dataset.id); } });
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], A.gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · « Colis ou lettre ? — Une lettre recommandée. — Je vais la chercher. » : on clique sur le bon casier */
        async casier(f) {
          const SEG = [ligne(1)[0], ligne(3)[1]];
          let fini = false;
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.ap-casier[data-id="colis"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'employee', seg: SEG, gel: GEL_EMPLOYEE, sideW: 500,
            consigne: 'Elle va chercher quoi' + NB + '? Clique sur le bon casier.',
            panneau: `<div class="panel glass ap"><p class="ptitre">Derrière le guichet, elle va chercher quoi${NB}?</p>
              <div class="ap-meuble" role="group" aria-label="Le casier derrière le guichet">${CASIERS.map(c => `<button class="ap-casier" data-id="${c.id}" aria-label="Casier ${c.nom}"><span class="ap-bac">${c.svg}</span><span class="ap-plaque">${c.nom}</span></button>`).join('')}</div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], A.gel()); if (alive(f)) ask(); };
          $$('.ap-casier', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const c = CASIERS.find(x => x.id === b.dataset.id);
            b.classList.add('choisi'); await wait(350); if (!alive(f)) return; b.classList.remove('choisi');
            if (c.bon) {
              $$('.ap-casier', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); fini = true;
              if (!await juste(f, 'Oui' + NB + '! Une lettre recommandée.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, c.msg); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.ap-casier[data-id="recommandees"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        homme: [{ text: 'J\'ai reçu un avis de passage.', seg: A.ligne(0) }, { text: 'une lettre recommandée', seg: A.phrase('Une lettre recommandée') }],
        employee: [{ text: 'C\'est pour un colis ou une lettre' + A.NB + '?', seg: A.ligne(1) }, { text: 'Un instant, je vais la chercher.', seg: A.phrase('un instant, je vais la chercher') }],
      },
    }),
  };
})();
