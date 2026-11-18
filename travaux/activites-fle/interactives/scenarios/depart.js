/* Le départ de l'hôtel : le client rend la clé de sa chambre ; la réceptionniste demande si son séjour s'est bien passé
   (« Oui, très bien, merci. ») et lui dit « Au revoir et bon voyage. » (coupes à 1,46, 3,75, 5,58 et 7,29 s : la réceptionniste
   de face, le client de face, la réceptionniste de près, le client de près, la réceptionniste de face ; le client sort à gauche).
   1 · le client redit sa réplique (la vidéo resserrée sur lui) : à côté, quatre objets qu'on peut donner à une réception
       (la carte-clé de la chambre, une carte bancaire, un passeport, un billet de train), tous des petites cartes ou des
       papiers, sans nom écrit ; on clique sur celui qu'il donne, et il glisse sur le comptoir de la réception. La carte-clé
       de la vidéo est blanche et petite, comme la carte bancaire : il faut avoir compris « la clé de ma chambre ».
   2 · « Votre séjour s'est bien passé ? — Oui, très bien, merci. » : sur la borne de satisfaction de l'hôtel (quatre gros
       boutons à visage : très bien, bien, pas très bien, mal), on appuie sur la réponse du client (« très bien », pas « bien »).
   3 · la réceptionniste redit « Au revoir et bon voyage. » : dans sa bulle, « Au revoir et bon … ! », on fait glisser le bon
       mot (voyage, parmi appétit, anniversaire, week-end) ; un clic sur le mot marche aussi.
   Pas de geste sur l'image : la seule chose utile qu'on y voit, la carte-clé, est dans la main du client puis de la
   réceptionniste (la toucher serait évident) ; le reste du dialogue (son avis, le « bon voyage ») ne se montre pas.
   Les images figées (0,4 s : la réceptionniste de face, avant l'échange de la carte ; 1,55 s : le client de face, la carte
   à peine visible dans sa main ; 5,65 s : le client de près, avant sa réponse ; 7,5 s : la réceptionniste avant son
   « au revoir ») ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';

  /* 1 · les quatre objets (viewBox 120 × 84), aucun nom écrit */
  const OBJETS = {
    cle: { nom: 'la clé de la chambre', svg: `<svg viewBox="0 0 120 84" aria-hidden="true">
      <rect x="14" y="12" width="92" height="60" rx="8" fill="#FFFFFF" stroke="#AEB6C2" stroke-width="2.4"/>
      <rect x="14" y="12" width="92" height="12" rx="6" fill="#2F4F7A"/><rect x="14" y="18" width="92" height="6" fill="#2F4F7A"/>
      <circle cx="44" cy="48" r="10" fill="none" stroke="#B8892E" stroke-width="5"/>
      <path d="M54 48h32M76 48v8M84 48v6" fill="none" stroke="#B8892E" stroke-width="5" stroke-linecap="round"/></svg>` },
    carte: { nom: 'la carte bancaire', svg: `<svg viewBox="0 0 120 84" aria-hidden="true">
      <rect x="14" y="12" width="92" height="60" rx="8" fill="#F3F5F8" stroke="#AEB6C2" stroke-width="2.4"/>
      <rect x="24" y="28" width="18" height="14" rx="3" fill="#D9B45A" stroke="#A9842F" stroke-width="1.4"/>
      <path d="M24 35h18M33 28v14" stroke="#A9842F" stroke-width="1.2"/>
      <path d="M24 54h12M40 54h12M56 54h12M72 54h12" stroke="#7C8594" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="86" cy="30" r="7" fill="#E46A4E" fill-opacity=".85"/><circle cx="95" cy="30" r="7" fill="#F2B233" fill-opacity=".85"/></svg>` },
    passeport: { nom: 'le passeport', svg: `<svg viewBox="0 0 120 84" aria-hidden="true">
      <rect x="38" y="6" width="46" height="72" rx="5" fill="#7A2335" stroke="#5A1726" stroke-width="2"/>
      <circle cx="61" cy="36" r="11" fill="none" stroke="#D9B45A" stroke-width="2.6"/>
      <path d="M50 36h22M61 25c-5 6-5 16 0 22M61 25c5 6 5 16 0 22" fill="none" stroke="#D9B45A" stroke-width="1.8"/>
      <path d="M49 60h24M53 66h16" stroke="#D9B45A" stroke-width="2.4" stroke-linecap="round"/></svg>` },
    billet: { nom: 'le billet de train', svg: `<svg viewBox="0 0 120 84" aria-hidden="true">
      <path d="M8 22h104v13a7 7 0 0 0 0 14v13H8V49a7 7 0 0 0 0-14z" fill="#FCE9D4" stroke="#D3A574" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M82 24v36" stroke="#D3A574" stroke-width="2" stroke-dasharray="4 4"/>
      <rect x="20" y="32" width="30" height="18" rx="6" fill="#2F6F9F"/><rect x="25" y="36" width="8" height="6" rx="1.5" fill="#CFE6F7"/><rect x="37" y="36" width="8" height="6" rx="1.5" fill="#CFE6F7"/>
      <circle cx="27" cy="53" r="2.6" fill="#2F6F9F"/><circle cx="43" cy="53" r="2.6" fill="#2F6F9F"/>
      <path d="M58 36h16M58 44h12M90 36h12M90 44h8" stroke="#A9794A" stroke-width="3" stroke-linecap="round"/></svg>` },
  };
  const ORDRE_OBJ = ['carte', 'cle', 'billet', 'passeport'];
  const MSG1 = { carte: 'Non, pas la carte bancaire.', passeport: 'Non, pas le passeport.', billet: 'Non, pas le billet de train.' };

  /* 2 · la borne de satisfaction : quatre boutons à visage (viewBox 40 × 40) */
  const VISAGE = (fond, bouche) => `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${fond}"/>
    <circle cx="14" cy="16" r="2.6" fill="#1E2330"/><circle cx="26" cy="16" r="2.6" fill="#1E2330"/>${bouche}</svg>`;
  const AVIS = [
    { id: 'tresbien', nom: 'Très bien', svg: VISAGE('#3FAE6A', '<path d="M11 23h18a9 9 0 0 1-18 0z" fill="#1E2330"/>') },
    { id: 'bien', nom: 'Bien', svg: VISAGE('#A6CF4E', '<path d="M13 24q7 6 14 0" fill="none" stroke="#1E2330" stroke-width="2.6" stroke-linecap="round"/>') },
    { id: 'pastres', nom: 'Pas très bien', svg: VISAGE('#F2B233', '<path d="M13 28q7-4 14 0" fill="none" stroke="#1E2330" stroke-width="2.6" stroke-linecap="round"/>') },
    { id: 'mal', nom: 'Mal', svg: VISAGE('#E46A4E', '<path d="M12 30q8-8 16 0" fill="none" stroke="#1E2330" stroke-width="2.6" stroke-linecap="round"/>') },
  ];
  const MSG2 = { bien: 'Non' + NB + ': il ne dit pas seulement «' + NB + 'bien' + NB + '».', pastres: 'Non' + NB + ': il est content de son séjour.', mal: 'Non' + NB + ': il est content de son séjour.' };

  /* 3 · les mots pour la bulle « Au revoir et bon … ! » (pictos viewBox 40 × 40) */
  const MOTS = [
    { id: 'appetit', mot: 'appétit', msg: 'Non' + NB + ': il ne va pas manger.', pic: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="21" r="12" fill="#FFFFFF" stroke="#9AA3AF" stroke-width="2"/><circle cx="20" cy="21" r="7" fill="none" stroke="#C8CED6" stroke-width="1.6"/><path d="M4 9v8a2 2 0 0 0 4 0V9M6 17v16M36 9c-3 2-3 9 0 11v13" fill="none" stroke="#6B7480" stroke-width="2" stroke-linecap="round"/></svg>' },
    { id: 'voyage', mot: 'voyage', bon: true, pic: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M15 11V7h10v4" fill="none" stroke="#5B4636" stroke-width="2.4" stroke-linejoin="round"/><rect x="8" y="11" width="24" height="21" rx="3" fill="#C9773E"/><path d="M15 11v21M25 11v21" stroke="#A35C2A" stroke-width="2"/><circle cx="13" cy="35" r="2.4" fill="#4A4F58"/><circle cx="27" cy="35" r="2.4" fill="#4A4F58"/></svg>' },
    { id: 'anniversaire', mot: 'anniversaire', msg: "Non" + NB + ": ce n'est pas son anniversaire.", pic: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="20" width="24" height="13" rx="2" fill="#F2A7C3"/><path d="M8 25q4 3 8 0t8 0 8 0" fill="none" stroke="#FFFFFF" stroke-width="2"/><path d="M14 20v-6M20 20v-6M26 20v-6" stroke="#5B8BD9" stroke-width="2.4"/><path d="M14 9q2 2 0 4-2-2 0-4zM20 9q2 2 0 4-2-2 0-4zM26 9q2 2 0 4-2-2 0-4z" fill="#F2B233"/><path d="M5 34h30" stroke="#9AA3AF" stroke-width="2.4" stroke-linecap="round"/></svg>' },
    { id: 'weekend', mot: 'week-end', msg: 'Non, pas «' + NB + 'bon week-end' + NB + '».', pic: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="9" width="28" height="25" rx="3" fill="#FFFFFF" stroke="#9AA3AF" stroke-width="2"/><path d="M6 9h28v7H6z" fill="#5B8BD9"/><path d="M13 6v6M27 6v6" stroke="#4A4F58" stroke-width="2.4" stroke-linecap="round"/><rect x="11" y="20" width="7" height="9" rx="1.5" fill="#F2B233"/><rect x="22" y="20" width="7" height="9" rx="1.5" fill="#F2B233"/></svg>' },
  ];

  return {
    plans: [{ de: 0, cx: { receptionniste: .33, client: .82 } }, { de: 1.458, cx: { receptionniste: .12, client: .55 } },
      { de: 3.75, cx: { receptionniste: .39, client: .95 } }, { de: 5.583, cx: { receptionniste: .2, client: .6 } },
      { de: 7.292, cx: { receptionniste: .37, client: .88 } }],
    ordre: ['cle', 'sejour', 'voyage'],
    bravo: 'Bravo' + NB + "! Le client quitte l'hôtel content. Bon voyage" + NB + '!',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, wait, avant, gel, fly } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « Bonjour, voici la clé de ma chambre. » : on clique sur l'objet qu'il donne, il glisse sur le comptoir */
        async cle(f) {
          const SEG = ligne(1);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.dp-objet[data-id="billet"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'client', seg: SEG, gel: 1.55, sideW: 480,
            consigne: "Qu'est-ce que le client donne à la réceptionniste" + NB + '? Clique sur le bon objet.',
            panneau: `<div class="panel glass depart"><p class="ptitre">Qu'est-ce qu'il donne${NB}?</p>
              <div class="dp-comptoir" aria-hidden="true"><span class="dp-cloche"><svg viewBox="0 0 40 30"><path d="M6 24a14 14 0 0 1 28 0z" fill="#D9B45A"/><path d="M3 26h34" stroke="#A9842F" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="8" r="2.6" fill="#A9842F"/></svg></span>
                <span class="dp-place"></span><span class="dp-bois"></span></div>
              <div class="dp-objets" role="group" aria-label="Les objets du client">${ORDRE_OBJ.map(id => `<button class="dp-objet" data-id="${id}" aria-label="${OBJETS[id].nom}">${OBJETS[id].svg}<span class="etat" aria-hidden="true"></span></button>`).join('')}</div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          $$('.dp-objet', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            if (b.dataset.id === 'cle') {
              $$('.dp-objet', side).forEach(x => x.classList.remove('indice'));
              const place = $('.dp-place', side);
              await fly(b, place, OBJETS.cle.svg, { scale: .9 }); if (!alive(f)) return;
              place.innerHTML = OBJETS.cle.svg; place.classList.add('pose');
              b.classList.add('juste', 'donne'); $('.etat', b).textContent = 'la clé ✓';
              if (!await juste(f, 'Oui' + NB + '! Il rend la clé de sa chambre.')) return;
              suite();
            } else {
              b.classList.add('faux'); $('.etat', b).textContent = 'non'; secouer(b);
              const montrer = await faux(f, SEG, MSG1[b.dataset.id]); if (montrer === null) return;
              b.classList.remove('faux'); $('.etat', b).textContent = '';
              if (montrer) $('.dp-objet[data-id="cle"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · « Votre séjour s'est bien passé ? — Oui, très bien, merci. » : sur la borne, on appuie sur sa réponse */
        async sejour(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.dp-bouton[data-id="pastres"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'client', seg: SEG, gel: 5.65, sideW: 520,
            consigne: "Son séjour s'est bien passé" + NB + '? Clique sur la réponse du client.',
            panneau: `<div class="panel glass depart"><p class="ptitre">La réponse du client${NB}?</p>
              <div class="dp-borne"><div class="dp-ecran" aria-live="polite">Votre séjour${NB}?</div>
                <div class="dp-boutons" role="group" aria-label="La borne de satisfaction">${AVIS.map(a => `<button class="dp-bouton" data-id="${a.id}" aria-label="${a.nom}"><span class="rond">${a.svg}</span><span class="nom">${a.nom}</span></button>`).join('')}</div>
                <span class="dp-pied" aria-hidden="true"></span></div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          const ecran = () => $('.dp-ecran', side);
          $$('.dp-bouton', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            b.classList.add('appuye'); await wait(220); if (!alive(f)) return; b.classList.remove('appuye');
            if (b.dataset.id === 'tresbien') {
              $$('.dp-bouton', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              ecran().textContent = 'Très bien' + NB + '! Merci' + NB + '!'; ecran().classList.add('juste');
              if (!await juste(f, 'Oui' + NB + "! Son séjour s'est très bien passé.")) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, MSG2[b.dataset.id]); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.dp-bouton[data-id="tresbien"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 3 · « Au revoir et bon voyage. » : on fait glisser le bon mot dans sa bulle (ou on clique dessus) */
        async voyage(f) {
          const SEG = ligne(4);
          const trou = () => $('.dp-trou', side), mot = id => $(`.dp-mot[data-id="${id}"]`, side);
          let fini = false;
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = mot('weekend'), vers = trou(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const m = MOTS.find(x => x.id === id), el = mot(id), t = trou();
            el.classList.add('pris'); t.textContent = m.mot; t.classList.add('rempli');
            await wait(350); if (!alive(f)) return;
            if (m.bon) {
              fini = true; $$('.dp-mot', side).forEach(x => x.classList.remove('indice')); t.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! «' + NB + 'Au revoir et bon voyage.' + NB + '»')) return;
              suite();
            } else {
              t.classList.add('faux'); secouer(t);
              const montrer = await faux(f, SEG, m.msg); if (montrer === null) return;
              t.classList.remove('faux', 'rempli'); t.textContent = ''; el.classList.remove('pris');
              if (montrer) mot('voyage').classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass depart"><p class="ptitre">Fais glisser le bon mot.</p>
            <div class="dp-bulle"><span>Au revoir et bon</span> <span class="dp-trou" aria-label="le mot qui manque"></span> <span>${NB}!</span></div>
            <div class="dp-mots" role="group" aria-label="Les mots">${MOTS.map(m => `<button class="dp-mot" data-id="${m.id}"><span class="pic">${m.pic}</span><span class="nom">${m.mot}</span></button>`).join('')}</div></div>`;
          if (!await avant(f, {
            qui: 'receptionniste', seg: SEG, gel: 7.5, sideW: 500, panneau,
            consigne: "Qu'est-ce que la réceptionniste dit au client" + NB + '? Fais glisser le bon mot dans la phrase.',
            monte: p => {
              $$('.dp-mot', p).forEach(el => {
                let st = null, glisse = false;
                el.addEventListener('pointerdown', e => {
                  if (!tour() || fini || e.button > 0) return;
                  A.unlock(); idle.reset(); e.preventDefault();
                  st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false }; glisse = false;
                  try { el.setPointerCapture(e.pointerId); } catch (err) {}
                });
                el.addEventListener('pointermove', e => {
                  if (!st || e.pointerId !== st.id) return;
                  const dx = e.clientX - st.x, dy = e.clientY - st.y;
                  if (!st.bouge && Math.hypot(dx, dy) > 6) { st.bouge = true; el.classList.add('tenu'); sfx.tick(); }
                  if (st.bouge) { el.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`; trou().classList.toggle('chaud', dedans($('.dp-bulle', p), e.clientX, e.clientY)); }
                });
                const lacher = e => {
                  if (!st || e.pointerId !== st.id) return;
                  const bouge = st.bouge; st = null; glisse = bouge;
                  el.classList.remove('tenu'); el.style.transform = ''; trou().classList.remove('chaud');
                  if (bouge && e.type === 'pointerup' && dedans($('.dp-bulle', p), e.clientX, e.clientY)) choisir(el.dataset.id);
                };
                el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
                el.addEventListener('click', () => { if (glisse) { glisse = false; return; } if (!tour()) return; A.unlock(); choisir(el.dataset.id); });
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        receptionniste: [{ text: "Votre séjour s'est bien passé" + A.NB + '?', seg: A.ligne(2) }, { text: 'Au revoir et bon voyage.', seg: A.ligne(4) }],
        client: [{ text: 'Voici la clé de ma chambre.', seg: A.phrase('voici la clé de ma chambre') }, { text: 'Oui, très bien, merci.', seg: A.ligne(3) }],
      },
    }),
  };
})();
