/* Le chemin de la pharmacie : on guide le monsieur sur un plan avec les flèches, puis on montre le bâtiment. */
window.SCENARIO = (() => {
  const FL = {
    g: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>',
    h: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    d: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  };
  const NOM = { g: 'À gauche', h: 'Tout droit', d: 'À droite' };
  /* le plan : une rue qui monte, une rue en travers au feu ; la boulangerie en haut à droite, la pharmacie juste en face */
  const BAT = [
    { id: 'b1', x: 8, y: 8, w: 52, h: 94 }, { id: 'b3', x: 66, y: 8, w: 52, h: 94 },
    { id: 'boul', x: 190, y: 8, w: 64, h: 94 }, { id: 'b6', x: 260, y: 8, w: 34, h: 94 },
    { id: 'b4', x: 8, y: 168, w: 52, h: 72 }, { id: 'b8', x: 66, y: 168, w: 52, h: 72 },
    { id: 'phar', x: 190, y: 168, w: 64, h: 72 }, { id: 'b7', x: 260, y: 168, w: 34, h: 72 },
    { id: 'b9', x: 8, y: 248, w: 110, h: 46 }, { id: 'b10', x: 190, y: 248, w: 104, h: 46 },
  ];
  const POS = [[150, 280], [150, 135], [222, 135]];
  const plan = () => `<div class="plan" id="plan"><svg viewBox="0 0 300 300" aria-label="Plan du quartier">
      <rect width="300" height="300" fill="#E9E4D8"/>
      <path d="M125 0h50v300h-50zM0 110h300v50H0z" fill="#5E6573"/>
      <path d="M150 300V170M150 100V0M0 135h115M185 135h115" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" opacity=".55"/>
      ${BAT.map(b => `<rect class="bat${b.id === 'boul' ? ' boul' : ''}" data-id="${b.id}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="7" fill="${b.id === 'boul' ? '#F2C38B' : '#CFC6B4'}"/>`).join('')}
      <g pointer-events="none"><path d="M207 62c-3-3 13-17 19-18 4-1 6 1 5 4-2 6-17 18-20 16z" fill="#C98A3E"/><path d="M213 56l3 1.5M217 52l3 1.5M221 49l3 1.5" stroke="#8C5A1E" stroke-width="1.8" stroke-linecap="round"/>
        <text x="222" y="86" text-anchor="middle" font-size="9" font-weight="800" fill="#6B4226" font-family="Figtree, system-ui, sans-serif">Boulangerie</text></g>
      <g transform="translate(176 163)" pointer-events="none"><rect width="11" height="26" rx="4" fill="#2A2D34"/><circle cx="5.5" cy="6" r="3" fill="#FF4D4D"/><circle cx="5.5" cy="13" r="3" fill="#FFB020" opacity=".35"/><circle cx="5.5" cy="20" r="3" fill="#2BD47D" opacity=".35"/></g>
      <g transform="translate(222 204)" pointer-events="none"><g class="croix" id="croix"><circle r="20" fill="#fff"/><rect x="-13" y="-4.5" width="26" height="9" rx="2" fill="#19A974"/><rect x="-4.5" y="-13" width="9" height="26" rx="2" fill="#19A974"/></g></g>
      <polyline class="trace" id="trace" points="${POS[0].join(',')}"/>
      <g class="marcheur" id="marcheur" style="transform: translate(${POS[0][0]}px, ${POS[0][1]}px)"><circle r="15" fill="#3AA8FF" opacity=".25"/><circle r="9" fill="#3AA8FF" stroke="#fff" stroke-width="3"/></g>
    </svg></div>`;

  return {
    ordre: ['chemin', 'ou'],
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, frameTo, CROPS, WIDE, freeze, playSegment, phrase, ligne, setSide, side, idle, tapHere, sfx, faux, juste, suite, wait } = A;
      const DROIT = phrase('allez tout droit'), FEU = phrase('puis tournez à droite au feu'), CHEMIN = ligne(1), FACE = ligne(3);
      let pos = 0;
      const placer = (k, vite) => {
        const m = $('#marcheur'); if (!m) return;
        if (vite) m.style.transition = 'none';
        m.style.transform = `translate(${POS[k][0]}px, ${POS[k][1]}px)`;
        if (vite) { void m.getBoundingClientRect(); m.style.transition = ''; }
        $('#trace').setAttribute('points', POS.slice(0, k + 1).map(p => p.join(',')).join(' '));
      };
      const pousser = (dir) => {           /* un faux pas : le point part un peu dans la mauvaise direction, puis revient */
        const m = $('#marcheur'), [x, y] = POS[pos], d = { g: [-16, 0], h: [0, -16], d: [16, 0] }[dir];
        if (m) m.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: `translate(${x + d[0]}px, ${y + d[1]}px)` }, { transform: `translate(${x}px, ${y}px)` }], { duration: 520, easing: 'ease-in-out' });
      };
      return {
        /* 1 · le chemin : tout droit, puis à droite au feu */
        async chemin(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Écoute la dame. Montre le chemin.'; pos = 0;
          const ask = () => { Q.show('you', pos === 0 ? state.ask : 'Et au feu' + NB + '?'); yourTurn(); idle.set(tapHere($('.fleche', side)), 5000); };
          state.replay = async () => { setTurn('listen'); await playSegment(CHEMIN[0], CHEMIN[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Guidez le monsieur jusqu'à la pharmacie</p>${plan()}
            <div class="fleches">${['g', 'h', 'd'].map(k => `<button class="fleche" data-k="${k}" aria-label="${NOM[k]}">${FL[k]}</button>`).join('')}</div></div>`);
          frameTo(CROPS.full, true); placer(0, true);
          $$('.fleche', side).forEach(b => b.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait');
            const bon = pos === 0 ? 'h' : 'd';
            if (b.dataset.k === bon) {
              $$('.fleche', side).forEach(x => x.classList.remove('indice', 'faux'));
              b.classList.add('juste'); setTimeout(() => b.classList.remove('juste'), 900);
              pos++; placer(pos); sfx.tick(); await wait(950); if (!alive(f)) return;
              if (pos === 1) { if (!await juste(f, 'Oui' + NB + '! Tout droit.', DROIT)) return; ask(); }
              else {
                if (!await juste(f, 'Oui' + NB + '! À droite au feu.', FEU)) return;
                Q.show('ok', 'Oui' + NB + '! Tout droit, puis à droite au feu.'); suite();
              }
            } else {
              b.classList.add('faux'); pousser(b.dataset.k);
              const montrer = await faux(f, pos === 0 ? DROIT : FEU); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $(`.fleche[data-k="${bon}"]`, side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · le bâtiment : la pharmacie est en face de la boulangerie */
        async ou(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Où est la pharmacie' + NB + '?';
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.bat[data-id="b8"]', side)), 5000); };
          state.replay = async () => { setTurn('listen'); await playSegment(FACE[0], FACE[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Touchez la pharmacie</p>${plan()}</div>`);
          frameTo(CROPS.full, true); placer(2, true);
          const pl = $('#plan'); pl.classList.add('choisir');
          $$('.bat', side).forEach(r => { if (r.dataset.id !== 'boul') r.classList.add('cible'); r.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait');
            if (r.dataset.id === 'phar') {
              r.classList.remove('indice'); r.classList.add('juste'); $('#croix').classList.add('on'); pl.classList.remove('choisir');
              if (!await juste(f, 'Oui' + NB + '! En face de la boulangerie.', FACE)) return;
              suite();
            } else {
              r.classList.add('faux');
              const msg = r.dataset.id === 'boul' ? "Ça, c'est la boulangerie. Écoute encore." : 'Non. Écoute encore.';
              const montrer = await faux(f, FACE, msg); if (montrer === null) return;
              r.classList.remove('faux');
              if (montrer) $('.bat[data-id="phar"]', side).classList.add('indice');
              ask();
            }
          }); });
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        homme: [{ text: "Il y a une pharmacie près d'ici" + A.NB + '?', seg: A.ligne(0) }],
        dame: [{ text: 'tout droit', seg: A.phrase('allez tout droit') }, { text: 'à droite au feu', seg: A.phrase('tournez à droite au feu') }, { text: 'en face de la boulangerie', seg: A.phrase('en face de la boulangerie') }],
      },
    }),
  };
})();
