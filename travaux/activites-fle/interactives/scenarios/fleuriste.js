/* Chez le fleuriste : le client redit pour qui est le bouquet (la vidéo resserrée sur lui), on clique sur la personne de sa
   famille ; puis on écoute le choix des fleurs et on les touche dans la boutique, directement sur l'image (sans panneau). */
window.SCENARIO = (() => {
  const VISAGE = (peau, cheveux, extra) => `<svg viewBox="0 0 48 48">${extra.fond || ''}<circle cx="24" cy="25" r="12" fill="${peau}"/>${cheveux}<circle cx="19.5" cy="25" r="1.4" fill="#2B2B2B"/><circle cx="28.5" cy="25" r="1.4" fill="#2B2B2B"/><path d="M20.5 30.5c2 1.6 5 1.6 7 0" stroke="#9A5B4A" stroke-width="1.6" fill="none" stroke-linecap="round"/>${extra.dessus || ''}<path d="M10 47c1-7 7-10 14-10s13 3 14 10z" fill="${extra.haut}"/></svg>`;
  const FAMILLE = [
    { id: 'pere', nom: 'son père', svg: VISAGE('#E9B994', '<path d="M12 23c0-9 6-13 12-13s12 4 12 13c-2-4-6-6-12-6s-10 2-12 6z" fill="#8E8E8E"/>', { dessus: '<path d="M19 28.6c2.2-1.2 7.8-1.2 10 0" stroke="#7A7A7A" stroke-width="2.2" stroke-linecap="round"/>', haut: '#4A6FA5' }) },
    { id: 'soeur', nom: 'sa sœur', svg: VISAGE('#F1C7A5', '<path d="M11 27c-1-11 5-17 13-17s14 6 13 17c-2-6-6-9-13-9s-11 3-13 9z" fill="#6B3E26"/><circle cx="37" cy="17" r="4.5" fill="#6B3E26"/>', { haut: '#E5383B' }) },
    { id: 'mere', nom: 'sa mère', svg: VISAGE('#EDBE9B', '<path d="M11 28c-1-12 5-17 13-17s14 5 13 17c-1-7-5-10-13-10s-12 3-13 10z" fill="#B9B3AA"/><circle cx="24" cy="10" r="5" fill="#B9B3AA"/>', { haut: '#7E57C2' }) },
    { id: 'copine', nom: 'sa copine', svg: VISAGE('#C68E66', '<path d="M10 38c-2-17 4-27 14-27s16 10 14 27c-2-9-3-17-14-19-11 2-12 10-14 19z" fill="#2D1E16"/>', { haut: '#2EC4B6' }) },
  ];
  /* les fleurs de la boutique, sur l'image où la vidéo s'arrête (9,2 s), en % */
  const ZONES = [
    { id: 'rouges', label: 'Les roses rouges', x: 35, y: 46, w: 12, h: 16 },
    { id: 'blanches', label: 'Les roses blanches', x: 47, y: 53, w: 16, h: 12 },
    { id: 'tournesols', label: 'Les tournesols', x: 47, y: 40, w: 17, h: 12 },
    { id: 'orange', label: 'Les roses orange', x: 0, y: 45, w: 12.5, h: 16 },
    { id: 'tulipes', label: 'Les tulipes', x: 13, y: 47, w: 7, h: 13 },
    { id: 'roses', label: 'Les roses roses', x: 0, y: 80, w: 19, h: 20 },
  ];
  const ROSES = ['rouges', 'orange', 'roses'];

  return {
    plans: [{ de: 0, cx: { fleuriste: .3, client: .8 } }, { de: 1.29, cx: { fleuriste: .3, client: .6 } }, { de: 3.46, cx: { fleuriste: .35, client: .7 } },
      { de: 4.46, cx: { fleuriste: .3, client: .6 } }, { de: 5.58, cx: { fleuriste: .28, client: .8 } }, { de: 7.42, cx: { fleuriste: .3, client: .6 } }, { de: 8.75, cx: { fleuriste: .35, client: .76 } }],
    ordre: ['qui', 'fleurs'],
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, WIDE, playSegment, phrase, ligne, side, idle, tapHere, sfx, faux, juste, suite, zones, cam, avant, cadreZone, marque } = A;
      const MERE = phrase("pour l'anniversaire de ma mère"), CHOIX = [ligne(4)[0], ligne(5)[1]];
      return {
        /* 1 · pour qui : le client le redit, on clique sur la personne de sa famille */
        async qui(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.tuile', side)), 5000); };
          if (!await avant(f, {
            question: "Le bouquet, c'est pour qui" + NB + '?', qui: 'client', seg: ligne(1), sideW: 380, consigne: 'Clique sur la bonne personne.',
            panneau: `<div class="panel glass"><p class="ptitre">Le bouquet est pour…</p>
              <div class="famille">${FAMILLE.map(p => `<button class="tuile" data-id="${p.id}"><span class="pic">${p.svg}</span><span class="nom">${p.nom}</span></button>`).join('')}</div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(ligne(1)[0], ligne(1)[1], WIDE); if (alive(f)) ask(); };
          $$('.tuile', side).forEach(b => b.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait');
            if (b.dataset.id === 'mere') {
              $$('.tuile', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + "! Pour l'anniversaire de sa mère.", MERE)) return;
              suite();
            } else {
              b.classList.add('faux'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
              const montrer = await faux(f, ligne(1)); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.tuile[data-id="mere"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · dans la vidéo : on écoute le choix, puis on touche les fleurs dans la boutique */
        async fleurs(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="tournesols"]', cam)), 5000); };
          if (!await avant(f, { question: 'Il choisit quelles fleurs' + NB + '?', seg: CHOIX, consigne: "Dans la boutique, clique sur les fleurs qu'il choisit." })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(CHOIX[0], CHOIX[1], WIDE); if (alive(f)) ask(); };
          zones(ZONES, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (id === 'blanches') {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(z, 'Des roses blanches', 'juste');
              if (!await juste(f, 'Oui' + NB + '! Des roses blanches.', ligne(5))) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z, z.label, 'faux');
              const msg = ROSES.includes(id) ? 'Des roses, oui. Mais écoute la couleur.' : 'Non. Écoute encore.';
              const montrer = await faux(f, CHOIX, msg); if (montrer === null) return;
              if (montrer) $('.hit[data-id="blanches"]', cam).classList.add('indice');
              ask();
            }
          });
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        fleuriste: [{ text: 'Je peux vous aider' + A.NB + '?', seg: A.ligne(0) }, { text: 'Des roses rouges ou des roses blanches' + A.NB + '?', seg: A.ligne(4) }],
        client: [{ text: "pour l'anniversaire de sa mère", seg: A.phrase("pour l'anniversaire de ma mère") }, { text: 'Elle adore les roses.', seg: A.ligne(3) }, { text: 'des roses blanches', seg: A.ligne(5) }],
      },
    }),
  };
})();
