/* Chez le médecin : elle redit « depuis deux jours » (la vidéo resserrée sur elle), on remonte le calendrier jusqu'au premier
   jour ; elle redit « un peu » de fièvre, on monte le thermomètre ; enfin, sur le bureau, dans la vidéo, on touche ce que le
   médecin va donner. (Pas de question sur « où elle a mal » : elle se tient la tête, la réponse se voit.) */
window.SCENARIO = (() => {
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
  /* sur le bureau (image à 5,8 s, en %) : des objets posés, plus le vrai stéthoscope */
  const OBJETS = [
    { id: 'medicament', nom: 'des médicaments', ok: true, x: 37, y: 83, w: 7, h: 8, svg: '<svg viewBox="0 0 60 44"><rect x="2" y="6" width="56" height="34" rx="4" fill="#fff" stroke="#9FB4D6" stroke-width="2"/><rect x="2" y="6" width="56" height="10" rx="3" fill="#3AA8FF"/><path d="M23 28h14M30 21v14" stroke="#19A974" stroke-width="5" stroke-linecap="round"/></svg>' },
    { id: 'thermometre', nom: 'le thermomètre', pas: 'Pas le thermomètre.', x: 45.5, y: 88, w: 8, h: 4, svg: '<svg viewBox="0 0 60 20"><rect x="2" y="6" width="46" height="8" rx="4" fill="#fff" stroke="#9FB4D6" stroke-width="1.5"/><rect x="6" y="8.5" width="24" height="3" rx="1.5" fill="#FF4D64"/><circle cx="51" cy="10" r="6" fill="#FF4D64"/></svg>' },
    { id: 'pansement', nom: 'un pansement', pas: 'Pas de pansement.', x: 54.5, y: 88, w: 6.5, h: 5, svg: '<svg viewBox="0 0 60 30"><g transform="rotate(-12 30 15)"><rect x="4" y="7" width="52" height="16" rx="8" fill="#E8B48A"/><rect x="22" y="9" width="16" height="12" rx="2" fill="#F6D7BC"/></g></svg>' },
    { id: 'lunettes', nom: 'les lunettes', pas: 'Pas les lunettes.', x: 85, y: 87, w: 7, h: 5, svg: '<svg viewBox="0 0 60 26"><circle cx="16" cy="14" r="10" fill="rgba(180,220,255,.35)" stroke="#2A2D34" stroke-width="3"/><circle cx="44" cy="14" r="10" fill="rgba(180,220,255,.35)" stroke="#2A2D34" stroke-width="3"/><path d="M26 12q4-4 8 0" stroke="#2A2D34" stroke-width="3" fill="none"/></svg>' },
    { id: 'stethoscope', nom: 'le stéthoscope', pas: "C'est son stéthoscope.", x: 64, y: 80, w: 16, h: 7 },
  ];
  const nbJours = n => (n === 1 ? 'un jour' : ['zéro', 'un', 'deux', 'trois'][n] + ' jours');
  const cap = s => s[0].toUpperCase() + s.slice(1);

  return {
    plans: [{ de: 0, cx: { patiente: .24, medecin: .7 } }, { de: 6.04, cx: { patiente: .38, medecin: .5 } }, { de: 7.5, cx: { patiente: .24, medecin: .72 } }],
    ordre: ['quand', 'fievre', 'donne'],
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, WIDE, playSegment, ligne, side, idle, tapHere, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque } = A;
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
            question: 'Depuis quand' + NB + '?', qui: 'patiente', seg: DEPUIS, sideW: 580, consigne: "Aujourd'hui, c'est jeudi. Elle a mal depuis quel jour" + NB + '?',
            panneau: `<div class="panel glass"><p class="ptitre">Aujourd'hui, c'est jeudi. Clique sur le premier jour du mal de tête.</p><p class="mois">Novembre</p>
              <div class="semaine">${JOURS.map((j, k) => `<button class="jour${k === AUJ ? ' auj' : ''}" data-k="${k}" ${k > AUJ ? 'disabled' : ''}><span>${j}</span><b>${9 + k}</b><small>${k === AUJ ? "aujourd'hui" : ''}</small><i class="tete">${TETE}</i></button>`).join('')}</div>
              <p class="legende" id="leg"></p></div>`,
            monte: p => $$('.jour:not([disabled])', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); sfx.tick(); marquer(+b.dataset.k); })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(DEPUIS[0], DEPUIS[1], WIDE); if (alive(f)) ask(); };
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

        /* 2 · la fièvre : elle redit « un peu », on fait monter le thermomètre au bon niveau */
        async fievre(f) {
          const monter = y => { const m = $('#mercure'); m.style.y = y + 'px'; m.style.height = (212 - y) + 'px'; };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.niveau[data-id="non"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Elle a de la fièvre' + NB + '?', qui: 'patiente', seg: FIEVRE, sideW: 380, consigne: 'Monte le thermomètre.',
            panneau: `<div class="panel glass"><p class="ptitre">Monte le thermomètre</p><div class="thermo">${THERMO}
              <div class="niveaux">${NIV.map(n => `<button class="niveau" data-id="${n.id}" aria-pressed="false">${n.t}</button>`).join('')}</div></div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(FIEVRE[0], FIEVRE[1], WIDE); if (alive(f)) ask(); };
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

        /* 3 · dans la vidéo : le médecin redit sa phrase, puis on touche sur le bureau ce qu'il va donner */
        async donne(f) {
          const els = {};
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="lunettes"]', cam)), 5000); };
          if (!await avant(f, {
            question: 'Le médecin va donner quoi' + NB + '?', qui: 'medecin', seg: DONNE, consigne: "Sur le bureau, clique sur ce qu'il va donner.",
            monte: () => OBJETS.filter(o => o.svg).forEach(o => {
              const d = document.createElement('div'); d.className = 'surimage objet'; d.innerHTML = o.svg;
              Object.assign(d.style, { left: o.x + '%', top: o.y + '%', width: o.w + '%', height: o.h + '%' }); cam.append(d); els[o.id] = d;
            }),
          })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(DONNE[0], DONNE[1], WIDE); if (alive(f)) ask(); };
          zones(OBJETS.map(o => ({ ...o, label: o.nom })), async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking');
            if (z.ok) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              const b = els[id]; b.classList.add('donne'); b.style.left = '27%'; b.style.top = '79%'; sfx.tick();
              await wait(900); if (!alive(f)) return;
              marque({ x: 27, y: 79, w: z.w, h: z.h }, 'Un médicament', 'juste');
              if (!await juste(f, 'Oui' + NB + '! Un médicament.', DONNE)) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z, cap(z.nom), 'faux');
              const montrer = await faux(f, DONNE, z.pas + ' Écoute encore.'); if (montrer === null) return;
              if (montrer) $('.hit[data-id="medicament"]', cam).classList.add('indice');
              ask();
            }
          });
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
