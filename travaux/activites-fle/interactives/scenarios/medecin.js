/* Chez le médecin : la patiente redit « depuis deux jours » (la vidéo resserrée sur elle), on touche le premier jour sur le
   calendrier ; elle redit « un peu » de fièvre, on fait glisser le thermomètre ; enfin, dans la vidéo, on touche l'image
   au moment où le médecin dit « médicament ». (Pas de question sur « où elle a mal » : elle se tient la tête.) */
window.SCENARIO = (() => {
  const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'], AUJ = 3;
  const NIV = [{ id: 'beaucoup', t: 'Beaucoup', y: 26 }, { id: 'peu', t: 'Un peu', y: 98 }, { id: 'non', t: 'Pas de fièvre', y: 166 }];
  const BAS = 192;
  const THERMO = `<svg viewBox="0 0 70 240" aria-label="Thermomètre : faites glisser vers le haut">
      <rect x="24" y="8" width="22" height="200" rx="11" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
      <path d="M46 26h8M46 98h8M46 166h8" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/>
      <text x="58" y="30" font-size="9" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Figtree, system-ui, sans-serif">40°</text>
      <text x="58" y="102" font-size="9" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Figtree, system-ui, sans-serif">38°</text>
      <text x="58" y="170" font-size="9" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Figtree, system-ui, sans-serif">37°</text>
      <rect class="mercure" id="mercure" x="29" width="12" rx="6" fill="#FF4D64" style="y: ${BAS}px; height: ${212 - BAS}px"/>
      <circle cx="35" cy="214" r="19" fill="#FF4D64" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
      <circle class="poignee" id="poignee" cx="35" r="12" fill="#fff" stroke="#FF4D64" stroke-width="4" style="cy: ${BAS}px"/>
    </svg>`;
  const nbJours = n => (n === 1 ? 'un jour' : ['zéro', 'un', 'deux', 'trois'][n] + ' jours');

  return {
    plans: [{ de: 0, cx: { patiente: .24, medecin: .7 } }, { de: 6.04, cx: { patiente: .38, medecin: .5 } }, { de: 7.5, cx: { patiente: .24, medecin: .72 } }],
    ordre: ['quand', 'fievre', 'moment'],
    bravo: 'Très bien ! Tu as tout compris chez le médecin.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, setSide, frameTo, CROPS, freeze, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, marque, gel, stopAll } = A;
      const DEPUIS = [ligne(4)[0], ligne(5)[1]], FIEVRE = [ligne(6)[0], ligne(7)[1]], DONNE = ligne(8);
      return {
        /* 1 · depuis quand : elle le redit, puis on touche le premier jour du mal de tête (on est jeudi) */
        async quand(f) {
          let choix = -1;
          const marquer = k => {
            choix = k;
            $$('.jour', side).forEach(b => { const i = +b.dataset.k; b.classList.toggle('mal', i >= k && i <= AUJ); b.classList.toggle('debut', i === k); b.classList.remove('juste'); });
            const n = AUJ - k; $('#leg').textContent = n ? 'Depuis ' + ({ 0: 'lundi', 1: 'mardi', 2: 'mercredi' })[k] + NB + ': ' + nbJours(n) : "Depuis aujourd'hui";
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($(`.jour[data-k="${choix < 0 ? AUJ : choix}"]`, side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute la patiente.', qui: 'patiente', seg: DEPUIS, sideW: 580, consigne: "Aujourd'hui, c'est jeudi. Elle a mal depuis quel jour" + NB + '?',
            panneau: `<div class="panel glass"><p class="ptitre">Aujourd'hui, c'est jeudi. Clique sur le premier jour du mal de tête.</p><p class="mois">Novembre</p>
              <div class="semaine">${JOURS.map((j, k) => `<button class="jour${k === AUJ ? ' auj' : ''}" data-k="${k}" ${k > AUJ ? 'disabled' : ''}><span>${j}</span><b>${9 + k}</b><small>${k === AUJ ? "aujourd'hui" : ''}</small></button>`).join('')}</div>
              <p class="legende" id="leg"></p></div>`,
            monte: p => $$('.jour:not([disabled])', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); sfx.tick(); marquer(+b.dataset.k); })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(DEPUIS[0], DEPUIS[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (choix < 0) { Q.show('you', 'Clique sur un jour.'); return; }
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

        /* 2 · la fièvre : elle redit « un peu » ; on fait glisser le thermomètre (ou on clique sur un niveau), puis Valider */
        async fievre(f) {
          let choix = null;
          const monter = y => { const m = $('#mercure'), k = $('#poignee'); if (!m) return; m.style.y = y + 'px'; m.style.height = (212 - y) + 'px'; k.style.cy = y + 'px'; };
          const allumer = n => $$('.niveau', side).forEach(x => x.setAttribute('aria-pressed', !!n && x.dataset.id === n.id));
          const proche = y => NIV.reduce((a, b) => (Math.abs(b.y - y) < Math.abs(a.y - y) ? b : a));
          const choisir = n => { choix = n; monter(n.y); allumer(n); sfx.tick(); };
          const glisser = () => { const k = $('#poignee'); if (!k) return null; const r = k.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, y2 = y - 120; return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x, y2, 1, .82), at(x, y2, 1), at(x, y2, 0)]; };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 4000); };
          if (!await avant(f, {
            question: 'Écoute encore la patiente.', qui: 'patiente', seg: FIEVRE, sideW: 380, consigne: 'Fais monter le thermomètre.',
            panneau: `<div class="panel glass"><p class="ptitre">Fais monter le thermomètre</p><div class="thermo">${THERMO}
              <div class="niveaux">${NIV.map(n => `<button class="niveau" data-id="${n.id}" aria-pressed="false">${n.t}</button>`).join('')}</div></div></div>`,
            monte: p => {
              const svg = $('.thermo svg', p), th = $('.thermo', p);
              const yDe = e => { const r = svg.getBoundingClientRect(); return Math.max(20, Math.min(BAS, (e.clientY - r.top) / r.height * 240)); };
              svg.addEventListener('pointerdown', e => {
                if (document.body.dataset.turn !== 'you') return;
                A.unlock(); idle.reset(); e.preventDefault(); svg.setPointerCapture(e.pointerId); th.classList.add('tire');
                const y = yDe(e); monter(y); allumer(proche(y));
              });
              svg.addEventListener('pointermove', e => { if (!th.classList.contains('tire')) return; const y = yDe(e); monter(y); allumer(proche(y)); });
              const lacher = e => { if (!th.classList.contains('tire')) return; th.classList.remove('tire'); choisir(proche(yDe(e))); };
              svg.addEventListener('pointerup', lacher); svg.addEventListener('pointercancel', lacher);
              $$('.niveau', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); choisir(NIV.find(x => x.id === b.dataset.id)); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(FIEVRE[0], FIEVRE[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!choix) { Q.show('you', 'Fais monter le thermomètre.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (choix.id === 'peu') {
              const b = $('.niveau[data-id="peu"]', side); b.classList.remove('indice'); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Un peu de fièvre.', ligne(7))) return;
              suite();
            } else {
              const montrer = await faux(f, FIEVRE); if (montrer === null) return;
              choix = null; allumer(null); monter(BAS);
              if (montrer) $('.niveau[data-id="peu"]', side).classList.add('indice');
              ask();
            }
          }
          ask();
        },

        /* 3 · dans la vidéo : la fin de la scène repart, on touche l'image au moment où le médecin dit « médicament » */
        async moment(f) {
          const MED = phrase('médicament'), BON = [MED[0] - .15, MED[1] + .8], DEB = ligne(6)[0], FIN = ligne(9)[1];
          let touche = null;
          setSide(null); frameTo(CROPS.full, false); idle.clear();
          state.gel = DEB; await freeze(DEB); if (!alive(f)) return;
          state.ask = 'Touche la vidéo quand tu entends le mot médicament.';
          if (!await Q.say(state.ask, f)) return;
          async function lancer() {
            touche = null; Q.show('you', state.ask); setTurn('you'); cam.classList.add('asking');
            await playSegment(DEB, FIN, null);
            if (!alive(f) || touche !== null) return;
            cam.classList.remove('asking'); setTurn('wait');
            rater("Tu n'as pas touché. Écoute encore.");
          }
          async function rater(msg) {
            const montrer = await faux(f, DONNE, msg); if (montrer === null) return;
            if (montrer) { Q.show('ok', 'C\'est là' + NB + ': «' + NB + 'je vais vous donner un médicament' + NB + '».'); state.essais = 0; suite(); }
            else { await wait(300); if (alive(f)) lancer(); }
          }
          zones([{ id: 'ecran', label: 'Toucher la vidéo', x: 0, y: 0, w: 100, h: 100 }], async (id, ev) => {
            const t = $('#vid').currentTime; touche = t; stopAll(); cam.classList.remove('asking'); setTurn('wait');
            const r = cam.getBoundingClientRect(), z = { x: (ev.clientX - r.left) / r.width * 100, y: (ev.clientY - r.top) / r.height * 100, w: 0, h: 0 };
            if (t >= BON[0] && t <= BON[1]) {
              marque(z, 'médicament', 'juste');
              if (!await juste(f, 'Oui' + NB + '! «' + NB + 'Un médicament' + NB + '».')) return;
              zones(null); suite();
            } else {
              marque(z, t < BON[0] ? 'trop tôt' : 'trop tard', 'faux');
              rater(t < BON[0] ? 'Pas encore. Écoute bien.' : 'Trop tard. Écoute encore.');
            }
          });
          $('.hit[data-id="ecran"]', cam).classList.add('ecran');
          state.replay = () => { if (document.body.dataset.turn !== 'you') return; stopAll(); lancer(); };
          lancer();
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
