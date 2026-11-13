/* Chez le médecin : on montre où elle a mal sur le corps, on remonte le calendrier jusqu'au premier jour, on lit le thermomètre. */
window.SCENARIO = (() => {
  const PARTIES = { tete: 'la tête', gorge: 'la gorge', ventre: 'le ventre', bras: 'le bras', jambes: 'les jambes' };
  const CORPS = `<svg viewBox="0 0 150 270" aria-label="Le corps">
      <circle class="zc" data-id="tete" cx="75" cy="32" r="24"/>
      <rect class="zc" data-id="gorge" x="64" y="58" width="22" height="16" rx="6"/>
      <rect class="zc" data-id="ventre" x="46" y="78" width="58" height="88" rx="18"/>
      <rect class="zc" data-id="bras" x="20" y="80" width="21" height="90" rx="10"/><rect class="zc" data-id="bras" x="109" y="80" width="21" height="90" rx="10"/>
      <rect class="zc" data-id="jambes" x="48" y="170" width="25" height="94" rx="12"/><rect class="zc" data-id="jambes" x="77" y="170" width="25" height="94" rx="12"/>
    </svg>`;
  const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'], AUJ = 3;
  const TETE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#FF4D64"/><path d="M7 9.5l3 1.5M17 9.5l-3 1.5M8.5 16.5c2-1.6 5-1.6 7 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  const NIV = [{ id: 'beaucoup', t: 'Beaucoup', y: 26 }, { id: 'peu', t: 'Un peu', y: 98 }, { id: 'non', t: 'Pas de fièvre', y: 166 }];
  const THERMO = `<svg viewBox="0 0 70 240" aria-hidden="true">
      <rect x="24" y="8" width="22" height="200" rx="11" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
      <path d="M46 26h8M46 98h8M46 166h8" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/>
      <text x="58" y="30" font-size="9" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Figtree, system-ui, sans-serif">40°</text>
      <text x="58" y="102" font-size="9" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Figtree, system-ui, sans-serif">38°</text>
      <text x="58" y="170" font-size="9" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Figtree, system-ui, sans-serif">37°</text>
      <rect class="mercure" id="mercure" x="29" width="12" rx="6" fill="#FF4D64" style="y: 190px; height: 22px"/>
      <circle cx="35" cy="214" r="19" fill="#FF4D64" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
    </svg>`;
  const nbJours = n => (n === 1 ? 'un jour' : ['zéro', 'un', 'deux', 'trois'][n] + ' jours');

  return {
    ordre: ['ou', 'quand', 'fievre'],
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, frameTo, CROPS, WIDE, freeze, playSegment, phrase, ligne, setSide, side, idle, tapHere, sfx, faux, juste, suite, goBtn, wait } = A;
      const MAL = [ligne(2)[0], ligne(3)[1]], DEPUIS = [ligne(4)[0], ligne(5)[1]], FIEVRE = [ligne(6)[0], ligne(7)[1]];
      return {
        /* 1 · où elle a mal : toucher la partie du corps */
        async ou(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Elle a mal où' + NB + '?';
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.zc[data-id="ventre"]', side)), 5000); };
          state.replay = async () => { setTurn('listen'); await playSegment(MAL[0], MAL[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Touchez où elle a mal</p><div class="corps">${CORPS}</div><p class="legende" id="leg"></p></div>`);
          frameTo(CROPS.full, true);
          $$('.zc', side).forEach(z => z.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait');
            const id = z.dataset.id, toutes = $$(`.zc[data-id="${id}"]`, side);
            $('#leg').textContent = PARTIES[id];
            if (id === 'tete') {
              toutes.forEach(x => { x.classList.remove('indice'); x.classList.add('juste'); });
              if (!await juste(f, 'Oui' + NB + '! Elle a mal à la tête.', ligne(3))) return;
              suite();
            } else {
              toutes.forEach(x => x.classList.add('faux'));
              const montrer = await faux(f, MAL, 'Pas ' + PARTIES[id] + '. Écoute encore.'); if (montrer === null) return;
              toutes.forEach(x => x.classList.remove('faux')); $('#leg').textContent = '';
              if (montrer) $('.zc[data-id="tete"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · depuis quand : aujourd'hui c'est jeudi, on touche le premier jour du mal de tête */
        async quand(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Depuis quand' + NB + '?';
          let choix = -1;
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($(`.jour[data-k="${choix < 0 ? AUJ : choix}"]`, side)), 5000); };
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(DEPUIS[0], DEPUIS[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Aujourd'hui, c'est jeudi. Touchez le premier jour du mal de tête.</p>
            <div class="semaine">${JOURS.map((j, k) => `<button class="jour${k === AUJ ? ' auj' : ''}" data-k="${k}" ${k > AUJ ? 'disabled' : ''}><b>${j}</b><span>${k === AUJ ? 'auj.' : ''}</span><i class="tete">${TETE}</i></button>`).join('')}</div>
            <p class="legende" id="leg"></p></div>`);
          frameTo(CROPS.full, true);
          const marquer = k => {
            choix = k;
            $$('.jour', side).forEach(b => { const i = +b.dataset.k; b.classList.toggle('mal', i >= k && i <= AUJ); b.classList.toggle('debut', i === k); b.classList.remove('juste'); });
            const n = AUJ - k; $('#leg').textContent = n ? 'Depuis ' + ({ 0: 'lundi', 1: 'mardi', 2: 'mercredi' })[k] + NB + ': ' + nbJours(n) : "Depuis aujourd'hui";
          };
          $$('.jour:not([disabled])', side).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); sfx.tick(); marquer(+b.dataset.k); }));
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (choix < 0) { Q.show('you', 'Touchez un jour.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (choix === 1) {
              $$('.jour.mal', side).forEach(b => b.classList.add('juste'));
              if (!await juste(f, 'Oui' + NB + '! Depuis deux jours.', ligne(5))) return;
              suite();
            } else {
              const n = AUJ - choix, s = $('.semaine', side); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
              const montrer = await faux(f, DEPUIS, (n ? 'Ça fait ' + nbJours(n) : "C'est aujourd'hui") + '. Écoute encore.'); if (montrer === null) return;
              if (montrer) { marquer(1); $$('.jour.mal', side).forEach(b => b.classList.add('juste')); Q.show('ok', 'Depuis deux jours' + NB + ': mardi et mercredi.'); state.essais = 0; suite(); }
              else ask();
            }
          }
          ask();
        },

        /* 3 · la fièvre : on fait monter le thermomètre au bon niveau */
        async fievre(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Elle a de la fièvre' + NB + '?';
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.niveau[data-id="non"]', side)), 5000); };
          state.replay = async () => { setTurn('listen'); await playSegment(FIEVRE[0], FIEVRE[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><p class="ptitre">Montez le thermomètre</p><div class="thermo">${THERMO}
            <div class="niveaux">${NIV.map(n => `<button class="niveau" data-id="${n.id}" aria-pressed="false">${n.t}</button>`).join('')}</div></div></div>`);
          frameTo(CROPS.full, true);
          const monter = y => { const m = $('#mercure'); m.style.y = y + 'px'; m.style.height = (212 - y) + 'px'; };
          $$('.niveau', side).forEach(b => b.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait');
            const n = NIV.find(x => x.id === b.dataset.id);
            $$('.niveau', side).forEach(x => x.setAttribute('aria-pressed', x === b)); monter(n.y); sfx.tick();
            await wait(750); if (!alive(f)) return;
            if (n.id === 'peu') {
              b.classList.remove('indice'); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Un peu de fièvre.', ligne(7))) return;
              suite();
            } else {
              const montrer = await faux(f, FIEVRE); if (montrer === null) return;
              b.setAttribute('aria-pressed', 'false'); monter(190);
              if (montrer) $('.niveau[data-id="peu"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        patiente: [{ text: 'mal à la tête', seg: A.phrase("j'ai mal à la tête") }, { text: 'depuis deux jours', seg: A.ligne(5) }, { text: 'un peu de fièvre', seg: [A.ligne(6)[0], A.ligne(7)[1]] }],
        medecin: [{ text: "Qu'est-ce que vous avez" + A.NB + '?', seg: A.ligne(2) }, { text: 'un médicament', seg: A.ligne(8) }],
      },
    }),
  };
})();
