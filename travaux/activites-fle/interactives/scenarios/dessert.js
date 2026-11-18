/* Un dessert ? : au restaurant, le serveur demande au client s'il veut un dessert ; le client demande ce qu'il y a ; le
   serveur propose une tarte aux pommes ou une mousse au chocolat ; le client prend la tarte aux pommes, et le serveur la note
   sur son carnet (coupes à 1,125, 3,58, 6,92 et 9,29 s : plan large, le client de près, le serveur de face (le client de
   dos), le client de près, le serveur qui écrit).
   1 · le serveur redit les desserts (la vidéo resserrée sur lui) : à côté, le chariot des desserts du restaurant, six
       desserts sur leurs assiettes, chacun avec son nom ; on clique sur les deux qu'il propose, puis Valider ;
   2 · le client redit son choix : on fait glisser son dessert (une étiquette, parmi les six) sur le carnet du serveur,
       comme le serveur qui note la commande à la fin de la vidéo ; un clic sur l'étiquette marche aussi.
   Pas de geste sur l'image : aucun dessert n'est visible dans la vidéo (l'ardoise du fond est floue et illisible), et rien
   d'autre de l'image ne se rattache à une information du dialogue. Les images figées (4,3 s : le serveur de face, avant de
   répondre ; 7,3 s : le client de près, avant de choisir ; 9,7 s : le serveur qui écrit, carnet illisible) ne donnent
   aucune réponse. Différent du « Menu du jour » (ardoise, trait de craie, assiette à remplir) et de « L'addition ». */
window.SCENARIO = (() => {
  /* on regarde la scène jusqu'au bout : le serveur écrit la commande sur son carnet (le dialogue finit à 8,9 s) */
  if (window.DONNEES) window.DONNEES.duree = Math.max(window.DONNEES.duree, 9.9);
  /* l'écriture du carnet (Google Fonts) ; sans elle, une écriture manuscrite du système */
  if (!document.querySelector('link[data-carnet]')) document.head.insertAdjacentHTML('beforeend', '<link data-carnet rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap">');
  const NB = ' ';
  const ASSIETTE = '<ellipse cx="50" cy="60" rx="44" ry="9" fill="#FFFFFF" stroke="#D5DAE0" stroke-width="1.6"/><ellipse cx="50" cy="59" rx="30" ry="5.5" fill="none" stroke="#E6E9EE" stroke-width="1.2"/>';
  /* une part de tarte vue de trois quarts (viewBox 100 × 72) : la pâte, puis le dessus */
  const PART = dessus => `<path d="M16 52L80 34L84 44L18 62Z" fill="#C88A43"/><path d="M80 34Q90 36 88 44L84 44Z" fill="#B67733"/>${dessus}`;
  /* les six desserts du chariot (viewBox 100 × 72) */
  const DESSERTS = [
    { id: 'pommes', nom: 'la tarte aux pommes', court: 'tarte aux pommes', svg: ASSIETTE + PART(`<path d="M16 52L80 34Q90 36 88 44Z" fill="#F0C46A"/>
        <path d="M28 49q6-6 12-4M40 46q6-6 12-4M52 43q6-6 12-4M64 40q6-6 12-4M36 51q6-5 12-4M50 48q6-5 12-4M64 45q6-5 12-4" stroke="#C97E22" stroke-width="2.6" fill="none" stroke-linecap="round"/>`) },
    { id: 'mousse', nom: 'la mousse au chocolat', court: 'mousse au chocolat', svg: ASSIETTE + `<path d="M32 16H68L64 58Q50 63 36 58Z" fill="#E9EEF3" fill-opacity=".7" stroke="#B8C3CE" stroke-width="2"/>
        <path d="M33.4 28H66.6L64 58Q50 63 36 58Z" fill="#6B3E22"/><path d="M33.4 28Q40 23 46 27Q52 22 58 27Q63 23 66.6 28Z" fill="#8A5530"/>
        <path d="M44 22q6-8 12 0z" fill="#F6EEDF"/><rect x="48" y="12" width="4" height="10" rx="2" fill="#4A2A16" transform="rotate(18 50 17)"/>` },
    { id: 'citron', nom: 'la tarte au citron', court: 'tarte au citron', svg: ASSIETTE + PART(`<path d="M16 52L80 34Q90 36 88 44Z" fill="#F7DF4E"/>
        <circle cx="34" cy="45" r="5" fill="#FFF8E8"/><circle cx="50" cy="41" r="5" fill="#FFF8E8"/><circle cx="66" cy="37" r="5" fill="#FFF8E8"/>
        <path d="M30 43q4-3 8 0M46 39q4-3 8 0M62 35q4-3 8 0" stroke="#E9C88C" stroke-width="1.6" fill="none"/>`) },
    { id: 'creme', nom: 'la crème brûlée', court: 'crème brûlée', svg: ASSIETTE + `<path d="M22 40V52Q50 62 78 52V40Z" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="2"/>
        <path d="M24 44h52M24 48h52" stroke="#E2E6EB" stroke-width="1.4"/><ellipse cx="50" cy="40" rx="28" ry="8" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="2"/>
        <ellipse cx="50" cy="40" rx="24" ry="6" fill="#C9862F"/><path d="M36 39q6-3 12 0M52 41q5-2 10 0" stroke="#A86720" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },
    { id: 'glace', nom: 'la glace à la vanille', court: 'glace à la vanille', svg: ASSIETTE + `<path d="M28 34H72Q70 46 50 48Q30 46 28 34Z" fill="#DCE5EE" stroke="#A9B6C3" stroke-width="2"/>
        <path d="M47 48h6v8h-6z" fill="#DCE5EE" stroke="#A9B6C3" stroke-width="1.6"/><ellipse cx="50" cy="58" rx="12" ry="3" fill="#DCE5EE" stroke="#A9B6C3" stroke-width="1.6"/>
        <circle cx="41" cy="30" r="10" fill="#F7EBC4"/><circle cx="59" cy="30" r="10" fill="#F3E2AE"/><circle cx="38" cy="27" r="1" fill="#3B2A1A"/><circle cx="57" cy="26" r="1" fill="#3B2A1A"/><circle cx="62" cy="32" r="1" fill="#3B2A1A"/>
        <path d="M64 18L72 10" stroke="#D9A85B" stroke-width="5" stroke-linecap="round"/>` },
    { id: 'fruits', nom: 'la salade de fruits', court: 'salade de fruits', svg: ASSIETTE + `<path d="M22 38Q24 58 50 58Q76 58 78 38Z" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="2"/>
        <ellipse cx="50" cy="38" rx="28" ry="6" fill="#F6E6B8"/><circle cx="36" cy="36" r="5" fill="#E8463C"/><circle cx="47" cy="34" r="4.5" fill="#F29A2E"/>
        <rect x="55" y="31" width="9" height="7" rx="2" fill="#F5D64A"/><circle cx="68" cy="37" r="4" fill="#7CB342"/><circle cx="42" cy="40" r="3.5" fill="#8E3B8A"/><circle cx="58" cy="40" r="3.5" fill="#E8463C"/>` },
  ];
  const D = id => DESSERTS.find(d => d.id === id);
  const PROPOSES = ['pommes', 'mousse'], CHOISI = 'pommes';
  const cap = s => s[0].toUpperCase() + s.slice(1);

  return {
    plans: [{ de: 0, cx: { client: .3, serveur: .6 } }, { de: 1.125, cx: { client: .4, serveur: .98 } }, { de: 3.583, cx: { client: .12, serveur: .63 } },
      { de: 6.917, cx: { client: .4, serveur: .98 } }, { de: 9.292, cx: { client: .18, serveur: .61 } }],
    ordre: ['propose', 'carnet'],
    bravo: 'Bravo' + NB + '! Le serveur note une tarte aux pommes.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « Une tarte aux pommes ou une mousse au chocolat. » : sur le chariot, on clique sur les deux desserts, puis Valider */
        async propose(f) {
          const SEG = ligne(2);
          let choix = [], fini = false;
          const peindre = () => $$('.dst-dessert', side).forEach(b => {
            const on = choix.includes(b.dataset.id); b.setAttribute('aria-pressed', on); b.classList.toggle('choisi', on);
          });
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.dst-dessert[data-id="creme"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'serveur', seg: SEG, gel: 4.3, sideW: 520,
            consigne: 'Le serveur propose quels desserts' + NB + '? Clique sur les deux desserts, puis sur Valider.',
            panneau: `<div class="panel glass dst"><p class="ptitre">Le chariot des desserts${NB}: clique sur les deux desserts.</p>
              <div class="dst-chariot" id="chariot" role="group" aria-label="Le chariot des desserts">
                ${[0, 3].map(i => `<div class="dst-etage">${DESSERTS.slice(i, i + 3).map(d => `<button class="dst-dessert" data-id="${d.id}" aria-pressed="false" aria-label="${d.nom}">
                  <svg viewBox="0 0 100 72" aria-hidden="true">${d.svg}</svg><span class="nom">${d.court}</span><span class="etat" aria-hidden="true"></span></button>`).join('')}</div>`).join('')}
              </div></div>`,
            monte: p => $$('.dst-dessert', p).forEach(b => b.addEventListener('click', () => {
              if (!tour() || fini) return;
              A.unlock(); idle.reset(); sfx.tick();
              const id = b.dataset.id;
              b.classList.remove('faux'); $('.etat', b).textContent = '';
              if (choix.includes(id)) choix = choix.filter(x => x !== id);
              else { choix.push(id); if (choix.length > 2) choix.shift(); }        // deux desserts au plus : le plus ancien est reposé
              peindre(); Q.show('you', state.ask);
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            if (choix.length < 2) { secouer($('#chariot', side)); Q.show('you', choix.length ? 'Clique sur un autre dessert.' : 'Clique sur deux desserts.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const bons = choix.filter(id => PROPOSES.includes(id)), mauvais = choix.filter(id => !PROPOSES.includes(id));
            choix.forEach(id => {
              const b = $(`.dst-dessert[data-id="${id}"]`, side), ok = PROPOSES.includes(id);
              b.classList.add(ok ? 'juste' : 'faux'); $('.etat', b).textContent = ok ? '✓' : 'non';
            });
            if (!mauvais.length) {
              fini = true; $$('.dst-dessert', side).forEach(x => x.classList.remove('indice'));
              if (!await juste(f, 'Oui' + NB + '! Une tarte aux pommes ou une mousse au chocolat.')) return;
              suite();
            } else {
              secouer($('#chariot', side));
              const msg = [bons.length ? 'Oui pour ' + D(bons[0]).nom + '.' : '', 'Pas ' + (mauvais.length === 2 ? 'de ' + D(mauvais[0]).court + ' ni de ' + D(mauvais[1]).court : 'de ' + D(mauvais[0]).court) + '.'].filter(Boolean).join(' ');
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              mauvais.forEach(id => { const b = $(`.dst-dessert[data-id="${id}"]`, side); b.classList.remove('faux'); $('.etat', b).textContent = ''; });
              choix = bons.slice(); peindre();
              if (montrer) {                                    // deux essais : on montre les deux desserts
                fini = true; choix = PROPOSES.slice(); peindre();
                PROPOSES.forEach(id => { const b = $(`.dst-dessert[data-id="${id}"]`, side); b.classList.add('juste'); $('.etat', b).textContent = '✓'; });
                Q.show('ok', 'Une tarte aux pommes ou une mousse au chocolat.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 2 · « Une tarte aux pommes, s'il vous plaît. » : on fait glisser son dessert sur le carnet du serveur (ou on clique dessus) */
        async carnet(f) {
          const SEG = ligne(3);
          let fini = false;
          const etiq = id => $(`.dst-etiq[data-id="${id}"]`, side);
          const ecrire = (id, cls) => {                         // le serveur écrit le dessert sur la ligne du carnet
            const l = $('#ligne', side); if (!l) return;
            l.className = 'dst-ecrit ' + (cls || ''); l.textContent = id ? '1 ' + D(id).court : '';
          };
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = etiq('fruits'), vers = $('#carnet', side); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .6;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const c = $('#carnet', side), e = etiq(id);
            $$('.dst-etiq', side).forEach(x => x.classList.remove('indice'));
            e.classList.add('posee'); ecrire(id, 'trace'); c.classList.remove('chaud');
            await wait(700); if (!alive(f)) return;
            if (id === CHOISI) {
              fini = true; c.classList.add('juste'); ecrire(id, 'juste');
              if (!await juste(f, 'Oui' + NB + '! Il prend une tarte aux pommes.')) return;
              suite();
            } else {
              c.classList.add('faux'); ecrire(id, 'faux'); secouer(c);
              const msg = id === 'mousse' ? 'Non' + NB + ': il ne prend pas la mousse au chocolat.' : 'Non' + NB + ': le serveur ne propose pas ' + D(id).nom + '.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              c.classList.remove('faux'); e.classList.remove('posee'); ecrire(null);
              if (montrer) etiq(CHOISI).classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass dst"><p class="ptitre">Fais glisser son dessert sur le carnet.</p>
            <div class="dst-carnet" id="carnet" aria-live="polite"><span class="spirale" aria-hidden="true"></span>
              <p class="tete"><b>Table 6</b><span>Desserts</span></p>
              <p class="dst-place"><span id="ligne" class="dst-ecrit"></span></p>
              <p class="dst-place vide" aria-hidden="true"></p></div>
            <div class="dst-etiqs" role="group" aria-label="Les desserts">${DESSERTS.map(d => `<button class="dst-etiq" data-id="${d.id}" aria-label="${cap(d.nom)}">
              <svg viewBox="0 0 100 72" aria-hidden="true">${d.svg}</svg><span>${d.court}</span></button>`).join('')}</div></div>`;
          if (!await avant(f, {
            qui: 'client', seg: SEG, gel: 7.3, sideW: 500, panneau,
            consigne: "Qu'est-ce que le client prend" + NB + '? Fais glisser son dessert sur le carnet du serveur.',
            monte: p => $$('.dst-etiq', p).forEach(el => {
              let st = null;
              el.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset();
                el.style.transition = 'none'; el.style.transform = '';
                st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                try { el.setPointerCapture(e.pointerId); } catch (err) {}
              });
              el.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x, dy = e.clientY - st.y;
                if (!st.bouge && Math.hypot(dx, dy) > 6) { st.bouge = true; el.classList.add('tenue'); sfx.tick(); }
                if (!st.bouge) return;
                e.preventDefault();
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
                $('#carnet', p).classList.toggle('chaud', dedans($('#carnet', p), e.clientX, e.clientY));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                const bouge = st.bouge; st = null; el.classList.remove('tenue');
                const sur = e.type === 'pointerup' && tour() && dedans($('#carnet', p), e.clientX, e.clientY);
                $('#carnet', p).classList.remove('chaud');
                el.style.transition = 'transform .4s cubic-bezier(.34,1.3,.64,1)'; el.style.transform = '';
                if (bouge) { el.dataset.glisse = '1'; if (sur) choisir(el.dataset.id); }
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              el.addEventListener('click', () => {                // un clic (ou la touche Entrée) écrit aussi le dessert
                if (el.dataset.glisse) { delete el.dataset.glisse; return; }
                if (!tour()) return; A.unlock(); choisir(el.dataset.id);
              });
            }),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { client: 'la tarte aux pommes' },
      faits: {
        serveur: [{ text: 'Vous voulez un dessert' + A.NB + '?', seg: A.ligne(0) }, { text: 'Une tarte aux pommes ou une mousse au chocolat.', seg: A.ligne(2) }],
        client: [{ text: 'Il y a quoi comme dessert' + A.NB + '?', seg: A.phrase('il y a quoi comme dessert') }, { text: "Une tarte aux pommes, s'il vous plaît.", seg: A.ligne(3) }],
      },
    }),
  };
})();
