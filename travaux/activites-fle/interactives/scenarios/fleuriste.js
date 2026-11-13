/* Chez la fleuriste : pour qui est le bouquet (la famille), puis on cueille les bonnes fleurs dans la boutique, sur l'image. */
window.SCENARIO = (() => {
  const VISAGE = (peau, cheveux, extra) => `<svg viewBox="0 0 48 48">${extra.fond || ''}<circle cx="24" cy="25" r="12" fill="${peau}"/>${cheveux}<circle cx="19.5" cy="25" r="1.4" fill="#2B2B2B"/><circle cx="28.5" cy="25" r="1.4" fill="#2B2B2B"/><path d="M20.5 30.5c2 1.6 5 1.6 7 0" stroke="#9A5B4A" stroke-width="1.6" fill="none" stroke-linecap="round"/>${extra.dessus || ''}<path d="M10 47c1-7 7-10 14-10s13 3 14 10z" fill="${extra.haut}"/></svg>`;
  const FAMILLE = [
    { id: 'pere', nom: 'son père', svg: VISAGE('#E9B994', '<path d="M12 23c0-9 6-13 12-13s12 4 12 13c-2-4-6-6-12-6s-10 2-12 6z" fill="#8E8E8E"/>', { dessus: '<path d="M19 28.6c2.2-1.2 7.8-1.2 10 0" stroke="#7A7A7A" stroke-width="2.2" stroke-linecap="round"/>', haut: '#4A6FA5' }) },
    { id: 'soeur', nom: 'sa sœur', svg: VISAGE('#F1C7A5', '<path d="M11 27c-1-11 5-17 13-17s14 6 13 17c-2-6-6-9-13-9s-11 3-13 9z" fill="#6B3E26"/><circle cx="37" cy="17" r="4.5" fill="#6B3E26"/>', { haut: '#E5383B' }) },
    { id: 'mere', nom: 'sa mère', svg: VISAGE('#EDBE9B', '<path d="M11 28c-1-12 5-17 13-17s14 5 13 17c-1-7-5-10-13-10s-12 3-13 10z" fill="#B9B3AA"/><circle cx="24" cy="10" r="5" fill="#B9B3AA"/>', { haut: '#7E57C2' }) },
    { id: 'copine', nom: 'sa copine', svg: VISAGE('#C68E66', '<path d="M10 38c-2-17 4-27 14-27s16 10 14 27c-2-9-3-17-14-19-11 2-12 10-14 19z" fill="#2D1E16"/>', { haut: '#2EC4B6' }) },
  ];
  const ROSE = c => `<g><circle r="9" fill="${c}"/><path d="M-4-1c2-4 7-3 7 1s-5 5-7 2" stroke="rgba(0,0,0,.18)" stroke-width="1.4" fill="none"/><circle r="2.6" fill="rgba(0,0,0,.12)"/></g>`;
  const BOUQUET = `<svg viewBox="0 0 170 200" aria-label="Le bouquet">
      <g id="tiges" opacity="0"><path d="M85 150L60 70M85 150L85 60M85 150l25-80M85 150L45 92M85 150l40-58" stroke="#3FA34D" stroke-width="3" stroke-linecap="round"/></g>
      <g id="fleurs" opacity="0">${[[60, 66], [85, 54], [110, 66], [45, 90], [125, 90], [72, 84], [98, 84]].map(([x, y]) => `<g transform="translate(${x} ${y})">${ROSE('#FFFFFF')}</g>`).join('')}</g>
      <path d="M40 104l45 90 45-90-20 8-25-10-25 10z" fill="#E7C9A0" stroke="#C9A06A" stroke-width="2" stroke-linejoin="round"/>
      <path d="M70 160c10 6 20 6 30 0" stroke="#E5383B" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`;
  const ZONES = [
    { id: 'rouges', label: 'Les roses rouges', x: 35, y: 46, w: 12, h: 16, c: '#C1121F' },
    { id: 'blanches', label: 'Les roses blanches', x: 47, y: 53, w: 16, h: 12, c: '#FFFFFF' },
    { id: 'tournesols', label: 'Les tournesols', x: 47, y: 40, w: 17, h: 12, c: '#FFC300' },
    { id: 'orange', label: 'Les roses orange', x: 0, y: 45, w: 12.5, h: 16, c: '#F4A261' },
    { id: 'tulipes', label: 'Les tulipes', x: 13, y: 47, w: 7, h: 13, c: '#E07BB4' },
    { id: 'roses', label: 'Les roses roses', x: 0, y: 80, w: 19, h: 20, c: '#F4A7B9' },
  ];
  const ROSES = ['rouges', 'orange', 'roses'];

  return {
    ordre: ['qui', 'fleurs'],
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, frameTo, CROPS, WIDE, freeze, playSegment, phrase, ligne, setSide, side, idle, tapHere, sfx, fly, faux, juste, suite, zones, cam, wait } = A;
      const MERE = phrase("pour l'anniversaire de ma mère"), CHOIX = [ligne(4)[0], ligne(5)[1]];
      return {
        /* 1 · pour qui : on touche la personne de sa famille */
        async qui(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = "Le bouquet, c'est pour qui" + NB + '?';
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.tuile', side)), 5000); };
          state.replay = async () => { setTurn('listen'); await playSegment(ligne(1)[0], ligne(1)[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Le bouquet est pour…</p>
            <div class="famille">${FAMILLE.map(p => `<button class="tuile" data-id="${p.id}"><span class="pic">${p.svg}</span><span class="nom">${p.nom}</span></button>`).join('')}</div></div>`);
          frameTo(CROPS.full, true);
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

        /* 2 · quelles fleurs : on les touche dans la boutique, elles volent dans le bouquet */
        async fleurs(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Il choisit quelles fleurs' + NB + '?';
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="tournesols"]', cam)), 5000); };
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(CHOIX[0], CHOIX[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Touchez les fleurs dans la boutique</p><div class="bouquet" id="bouquet">${BOUQUET}</div><p class="etiquette" id="etiq">Le bouquet de sa mère</p></div>`);
          frameTo(CROPS.full, true);
          zones(ZONES, async id => {
            setTurn('wait'); cam.classList.remove('asking');
            const z = ZONES.find(x => x.id === id), hit = $(`.hit[data-id="${id}"]`, cam);
            const fl = $('#fleurs'), ti = $('#tiges');
            await fly(hit, $('#bouquet'), `<svg viewBox="-12 -12 24 24" style="width:100%;height:100%">${ROSE(z.c)}</svg>`, { scale: .3 });
            $$('#fleurs circle:first-child', side).forEach(c => c.setAttribute('fill', z.c));
            fl.setAttribute('opacity', 1); ti.setAttribute('opacity', 1); sfx.tick();
            if (id === 'blanches') {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              $('#etiq').textContent = 'Des roses blanches';
              if (!await juste(f, 'Oui' + NB + '! Des roses blanches.', ligne(5))) return;
              zones(null); suite();
            } else {
              const b = $('#bouquet'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
              const msg = ROSES.includes(id) ? 'Des roses, oui. Mais écoute la couleur.' : 'Non. Écoute encore.';
              const montrer = await faux(f, CHOIX, msg); if (montrer === null) return;
              fl.setAttribute('opacity', 0); ti.setAttribute('opacity', 0);
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
