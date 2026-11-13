/* Le menu du jour : le client redit ce qu'il choisit (la vidéo resserrée sur lui) et on touche, sur l'image, la vraie ardoise
   du restaurant ; puis, sur l'ardoise vue de près (dessinée à côté), on clique sur l'entrée qu'il prend et un trait de craie
   l'entoure ; enfin on remplit son assiette avec le plat qu'il prend (le poulet avec du riz), puis on valide. */
window.SCENARIO = (() => {
  /* l'écriture de l'ardoise (Google Fonts) ; sans elle, une écriture manuscrite du système */
  if (!document.querySelector('link[data-craie]')) document.head.insertAdjacentHTML('beforeend', '<link data-craie rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap">');

  /* sur l'image où la vidéo s'arrête (9,3 s : le serveur devant l'ardoise ; plus de 0,3 s après la fin de la dernière réplique, pour que le moteur y saute franchement), en % ; « my » : où poser l'étiquette */
  const ZONES = [
    { id: 'ardoise-g', label: "L'ardoise", ok: true, x: 13, y: 5, w: 21, h: 41, my: 30 },
    { id: 'ardoise-d', label: "L'ardoise", ok: true, x: 51, y: 5, w: 15, h: 40, my: 30 },
    { id: 'vin-d', label: 'Les bouteilles de vin', nom: 'Du vin', pas: 'Pas de vin.', x: 62, y: 52, w: 14, h: 16 },
    { id: 'vin-g', label: 'Les bouteilles de vin', nom: 'Du vin', pas: 'Pas de vin.', x: 10, y: 53, w: 6, h: 15 },
    { id: 'verres-d', label: 'Les verres', nom: 'Un verre', pas: 'Il ne demande pas à boire.', x: 66, y: 78, w: 15, h: 16 },
    { id: 'verres-g', label: 'Les verres', nom: 'Un verre', pas: 'Il ne demande pas à boire.', x: 0, y: 79, w: 10, h: 15 },
  ];

  /* l'ardoise de près : trois entrées (on clique), trois plats, trois desserts */
  const ENTREES = [{ id: 'soupe', nom: 'Soupe de légumes', pas: 'Pas de soupe.' }, { id: 'salade', nom: 'Salade verte' }, { id: 'oeuf', nom: 'Œuf mayonnaise', pas: "Pas d'œuf." }];
  const ARDOISE = () => `<div class="ardoise">
      <p class="ard-titre">Menu du jour <span>15&nbsp;€</span></p>
      <div class="ard-rub"><p class="ard-nom">Entrées</p>
        <div class="ard-ligne">${ENTREES.map(e => `<button class="ard-choix" data-id="${e.id}">${e.nom}</button>`).join('')}</div></div>
      <div class="ard-rub deco"><p class="ard-nom">Plats</p>
        <div class="ard-ligne"><span class="ard-txt">Poulet</span><span class="ard-txt">Poisson</span><span class="ard-txt">Steak</span></div>
        <p class="ard-note">avec riz, frites ou légumes</p></div>
      <div class="ard-rub deco"><p class="ard-nom">Desserts</p>
        <div class="ard-ligne"><span class="ard-txt">Tarte aux pommes</span><span class="ard-txt">Crème caramel</span><span class="ard-txt">Mousse au chocolat</span></div></div>
    </div>`;
  /* un trait de craie tracé à la main autour d'un choix : un peu plus d'un tour, qui finit légèrement à l'intérieur */
  const trait = (W, H) => {
    const cx = W / 2, cy = H / 2, rx = W / 2 - 6, ry = H / 2 - 5, n = 72, a0 = -2.3, pts = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, a = a0 + t * (Math.PI * 2 + .6), g = 1 + .03 * Math.sin(3 * a + 1) - .06 * t;
      pts.push((cx + rx * g * Math.cos(a)).toFixed(1) + ' ' + (cy + ry * g * Math.sin(a)).toFixed(1));
    }
    return 'M' + pts.join('L');
  };
  const entourer = b => {
    const W = b.offsetWidth + 20, H = b.offsetHeight + 14;
    b.classList.add('entoure');
    b.insertAdjacentHTML('beforeend', `<svg class="cercle" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${trait(W, H)}" pathLength="1"/></svg>`);
    return b.lastElementChild;
  };

  /* l'assiette : un plat et ce qui va avec */
  const SVG = {
    poulet: '<svg viewBox="0 0 48 48"><ellipse cx="28.5" cy="19.5" rx="14" ry="10.5" transform="rotate(-45 28.5 19.5)" fill="#C8752E"/><ellipse cx="31.5" cy="16.5" rx="7.5" ry="4" transform="rotate(-45 31.5 16.5)" fill="#E9A45C"/><path d="M19.5 28.5 11.5 36.5" stroke="#F3E9D9" stroke-width="5.5" stroke-linecap="round"/><circle cx="8.6" cy="35.2" r="3.7" fill="#F3E9D9"/><circle cx="12.8" cy="39.4" r="3.7" fill="#F3E9D9"/><path d="M19.5 28.5 11.5 36.5" stroke="#DCCDB4" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></svg>',
    poisson: '<svg viewBox="0 0 48 48"><path d="M4 24C9 14 23 12.5 32 21l9-7-2.5 10 2.5 10-9-7C23 35.5 9 34 4 24Z" fill="#86AFCF"/><path d="M21 17.5c2.4 4 2.4 9 0 13" stroke="#5F8DB3" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="22" r="2.1" fill="#1E2A38"/><path d="M8 27.5c3 1.6 6 1.8 9 1" stroke="#6E9BC0" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    steak: '<svg viewBox="0 0 48 48"><path d="M8 23c0-8 9-13 19-12 9 1 14 6 13 13s-7 13-17 12S8 31 8 23Z" fill="#8E3B2E"/><path d="M14.5 19.5l6-4M16 28l13-9.5M22.5 33l13-9.5" stroke="#5E2018" stroke-width="2.6" stroke-linecap="round"/><path d="M36 14.5c4.5 3 5.5 8.5 3.2 13.5" stroke="#F1D9C4" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>',
    riz: '<svg viewBox="0 0 48 48"><path d="M6 35c0-11 8-19 18-19s18 8 18 19Z" fill="#F6EED6" stroke="#B9AC8C" stroke-width="1.8" stroke-linejoin="round"/><g fill="#CBBF9F"><ellipse cx="15" cy="29" rx="2.2" ry="1" transform="rotate(-25 15 29)"/><ellipse cx="22" cy="23" rx="2.2" ry="1" transform="rotate(20 22 23)"/><ellipse cx="29" cy="27" rx="2.2" ry="1" transform="rotate(-35 29 27)"/><ellipse cx="34" cy="32" rx="2.2" ry="1" transform="rotate(15 34 32)"/><ellipse cx="21" cy="31" rx="2.2" ry="1" transform="rotate(40 21 31)"/><ellipse cx="27" cy="20" rx="2.2" ry="1" transform="rotate(-10 27 20)"/></g><path d="M26 14.5c2-3 5-3.5 7-2-2 2.5-4.5 3-7 2Z" fill="#5DB860"/></svg>',
    frites: '<svg viewBox="0 0 48 48"><g stroke="#D99A2B" stroke-width="1.2" fill="#F5C651" stroke-linejoin="round"><rect x="9" y="12" width="5.5" height="25" rx="1.6" transform="rotate(-18 11.7 24.5)"/><rect x="17" y="9" width="5.5" height="28" rx="1.6" transform="rotate(-6 19.7 23)"/><rect x="25" y="10" width="5.5" height="27" rx="1.6" transform="rotate(8 27.7 23.5)"/><rect x="32.5" y="13" width="5.5" height="24" rx="1.6" transform="rotate(20 35.2 25)"/><rect x="20.5" y="16" width="5.5" height="23" rx="1.6" transform="rotate(-30 23.2 27.5)"/></g></svg>',
    legumes: '<svg viewBox="0 0 48 48"><g stroke="#3E9B47" stroke-width="4.2" stroke-linecap="round" fill="none"><path d="M8 18c6 3 13 3 20 0"/><path d="M10 26c7 2.5 14 2 21-1.5"/><path d="M14 33c5 1.5 10 1 15-1.5"/></g><circle cx="35" cy="31" r="6.2" fill="#F28C28"/><circle cx="35" cy="31" r="2.6" fill="#F7B267"/><circle cx="37" cy="17" r="5.4" fill="#F28C28"/><circle cx="37" cy="17" r="2.2" fill="#F7B267"/></svg>',
  };
  const ALIMENTS = [
    { id: 'poulet', g: 'plat', nom: 'Poulet', le: 'le poulet' }, { id: 'poisson', g: 'plat', nom: 'Poisson', le: 'le poisson', pas: 'de poisson' }, { id: 'steak', g: 'plat', nom: 'Steak', le: 'le steak', pas: 'de steak' },
    { id: 'riz', g: 'avec', nom: 'Riz', le: 'le riz' }, { id: 'frites', g: 'avec', nom: 'Frites', le: 'les frites', pas: 'de frites' }, { id: 'legumes', g: 'avec', nom: 'Légumes', le: 'les légumes', pas: 'de légumes' },
  ];
  const aliment = id => ALIMENTS.find(x => x.id === id);
  const tuile = a => `<button class="tuile" data-id="${a.id}"><span class="pic">${SVG[a.id]}</span><span class="nom">${a.nom}</span></button>`;
  const COUVERTS = {
    fourchette: '<svg class="couvert" viewBox="0 0 24 150" aria-hidden="true"><path d="M5 8v30c0 6 3 9 7 9s7-3 7-9V8M12 8v30" stroke="rgba(255,255,255,.75)" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M12 47v92" stroke="rgba(255,255,255,.75)" stroke-width="5" stroke-linecap="round"/></svg>',
    couteau: '<svg class="couvert" viewBox="0 0 24 150" aria-hidden="true"><path d="M9 8c7 4 9 20 9 46H9Z" fill="rgba(255,255,255,.75)"/><path d="M13 58v82" stroke="rgba(255,255,255,.75)" stroke-width="5.5" stroke-linecap="round"/></svg>',
  };

  return {
    plans: [{ de: 0, cx: { serveur: .4, client: .92 } }, { de: 1.79, cx: { serveur: .08, client: .63 } }, { de: 3.46, cx: { serveur: .44, client: .92 } },
      { de: 4.71, cx: { serveur: .08, client: .66 } }, { de: 6.25, cx: { serveur: .4, client: .92 } }, { de: 7.42, cx: { serveur: .08, client: .66 } }, { de: 9.08, cx: { serveur: .43, client: .92 } }],
    ordre: ['menu', 'entree', 'plat'],
    bravo: 'Bon appétit ! Tu as compris toute la commande.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, sfx, fly, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel } = A;
      const DEMANDE = ligne(1), MENU = phrase('le menu du jour'), SALADE = phrase('une salade'), POULET = phrase('le poulet avec du riz');
      const ENTREE = [ligne(2)[0], ligne(3)[1]], PLAT = [ligne(4)[0], ligne(5)[1]];
      const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · dans la vidéo : il redit ce qu'il veut ; dans le restaurant, on touche la vraie ardoise du menu du jour */
        async menu(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="vin-d"]', cam)), 5000); };
          if (!await avant(f, { question: 'Écoute le client.', qui: 'client', seg: DEMANDE, consigne: "Dans le restaurant, clique sur ce qu'il choisit." })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(DEMANDE[0], DEMANDE[1], gel()); if (alive(f)) ask(); };
          zones(ZONES, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.ok) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              ZONES.filter(x => x.ok).forEach(x => cadreZone(x)); marque({ ...z, y: z.my }, 'Le menu du jour', 'juste');
              if (!await juste(f, 'Oui' + NB + "! Le menu du jour est sur l'ardoise.", MENU)) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z, z.nom, 'faux');
              const montrer = await faux(f, DEMANDE, z.pas + ' Écoute encore.'); if (montrer === null) return;
              if (montrer) ZONES.filter(x => x.ok).forEach(x => $(`.hit[data-id="${x.id}"]`, cam).classList.add('indice'));
              ask();
            }
          });
          ask();
        },

        /* 2 · l'ardoise de près : le serveur demande une entrée, le client répond ; on clique sur l'entrée, la craie l'entoure */
        async entree(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.ard-choix[data-id="oeuf"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute bien.', seg: ENTREE, sideW: 540, consigne: 'Il prend quelle entrée' + NB + "? Clique sur l'ardoise.",
            panneau: `<div class="panel glass"><p class="ptitre">L'ardoise du restaurant</p>${ARDOISE()}</div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(ENTREE[0], ENTREE[1], gel()); if (alive(f)) ask(); };
          $$('.ard-choix', side).forEach(b => b.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const c = entourer(b);
            await wait(700); if (!alive(f)) return;
            if (b.dataset.id === 'salade') {
              b.classList.remove('indice'); b.classList.add('juste'); c.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Une salade.', SALADE)) return;
              suite();
            } else {
              b.classList.add('faux'); c.classList.add('faux'); secouer(b);
              const montrer = await faux(f, ENTREE, ENTREES.find(e => e.id === b.dataset.id).pas + ' Écoute encore.'); if (montrer === null) return;
              c.remove(); b.classList.remove('faux', 'entoure');
              if (montrer) $('.ard-choix[data-id="salade"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 3 · l'assiette : le serveur demande le plat, le client répond ; on pose le plat et ce qui va avec, puis Valider */
        async plat(f) {
          const choix = { plat: null, avec: null };
          const pose = g => $(`.pose[data-g="${g}"]`, side);
          const vider = g => {
            const id = choix[g]; choix[g] = null; const p = pose(g);
            p.innerHTML = ''; p.classList.remove('faux'); p.setAttribute('aria-label', p.dataset.vide);
            if (id) $(`.tuile[data-id="${id}"]`, side).classList.remove('pris');
          };
          const poser = b => {
            const a = aliment(b.dataset.id);
            vider(a.g); choix[a.g] = a.id; b.classList.add('pris'); b.classList.remove('indice');
            const p = pose(a.g); p.setAttribute('aria-label', 'Enlever ' + a.le);
            fly($('.pic', b), p, `<div class="vol">${SVG[a.id]}</div>`, { scale: 1.6 }).then(() => { if (choix[a.g] === a.id && !p.firstChild) p.innerHTML = SVG[a.id]; });
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.tuile[data-id="steak"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute la suite.', seg: PLAT, sideW: 440, consigne: "Et le plat" + NB + "? Clique sur ce qu'il prend, puis sur valider.",
            panneau: `<div class="panel glass"><p class="ptitre">L'assiette du client</p>
              <div class="table">${COUVERTS.fourchette}<div class="assiette" id="assiette">
                <button class="pose" data-g="plat" data-vide="Le plat (vide)" aria-label="Le plat (vide)"></button><button class="pose" data-g="avec" data-vide="Avec (vide)" aria-label="Avec (vide)"></button></div>${COUVERTS.couteau}</div>
              <p class="rang">Le plat</p><div class="choix3">${ALIMENTS.filter(a => a.g === 'plat').map(tuile).join('')}</div>
              <p class="rang">Avec</p><div class="choix3">${ALIMENTS.filter(a => a.g === 'avec').map(tuile).join('')}</div></div>`,
            monte: p => {
              $$('.tuile', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); sfx.tick(); poser(b); }));
              $$('.pose', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you' || !choix[b.dataset.g]) return; A.unlock(); idle.reset(); sfx.tick(); vider(b.dataset.g); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(PLAT[0], PLAT[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!choix.plat && !choix.avec) { Q.show('you', "Clique sur ce qu'il prend."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (choix.plat === 'poulet' && choix.avec === 'riz') {
              $('#assiette', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Le poulet avec du riz.', POULET)) return;
              suite();
            } else {
              const fauxPlat = choix.plat && choix.plat !== 'poulet', fauxAvec = choix.avec && choix.avec !== 'riz';
              const pas = [fauxPlat && aliment(choix.plat).pas, fauxAvec && aliment(choix.avec).pas].filter(Boolean);     // « Pas de steak, pas de frites. »
              const msg = pas.length ? 'Pas ' + pas.join(', pas ') + '.' : choix.plat ? 'Le poulet, oui. Avec quoi' + NB + '?' : 'Le riz, oui. Et le plat' + NB + '?';
              if (fauxPlat) pose('plat').classList.add('faux');
              if (fauxAvec) pose('avec').classList.add('faux');
              secouer($('#assiette', side));
              const montrer = await faux(f, PLAT, msg + ' Écoute encore.'); if (montrer === null) return;
              if (fauxPlat) vider('plat');
              if (fauxAvec) vider('avec');
              if (montrer) ['poulet', 'riz'].forEach(id => { const t = $(`.tuile[data-id="${id}"]`, side); if (!t.classList.contains('pris')) t.classList.add('indice'); });
              ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        serveur: [{ text: 'Vous avez choisi quoi' + A.NB + '?', seg: A.ligne(0) }, { text: 'Vous voulez une entrée' + A.NB + '?', seg: A.ligne(2) }, { text: 'Et comme plat principal' + A.NB + '?', seg: A.ligne(4) }],
        client: [{ text: 'le menu du jour', seg: A.phrase('le menu du jour') }, { text: 'une salade', seg: A.phrase('une salade') }, { text: 'le poulet avec du riz', seg: A.phrase('le poulet avec du riz') }],
      },
    }),
  };
})();
