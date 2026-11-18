/* Le train a du retard : sur le quai, un voyageur demande à l'agente si le train pour Marseille est arrivé ; il a vingt
   minutes de retard (coupes à 3,13, 5,08, 6,63 et 8,21 s : plan large, l'agente de près, plan large…).
   1 · le voyageur redit sa question (la vidéo resserrée sur lui) : à côté, le tableau des départs ; on clique sur son train
       (Marseille, parmi Versailles, Montpellier, Mulhouse, Lyon : des noms qui se ressemblent à l'oreille) ;
   2 · dans la vidéo, un QTE : on appuie sur le bouton quand l'agente dit « retard » ;
   3 · l'agente redit « Vingt minutes » : on fait tourner le disque d'un minuteur (comme un minuteur de cuisine : on tire le
       disque bleu jusqu'au bon nombre de minutes ; un clic sur un nombre le pose aussi), puis Valider.
   L'image figée (9,1 s : le voyageur sourit, l'agente de dos ; à l'étape 3, 7,8 s : l'agente de près) ne donne aucune
   réponse : le vrai tableau, en haut, est illisible et aucune horloge n'est visible. */
window.SCENARIO = (() => {
  const NB = ' ';
  const DEPARTS = [
    { id: 'montpellier', h: '14:52', dest: 'Montpellier' },
    { id: 'versailles', h: '15:04', dest: 'Versailles' },
    { id: 'marseille', h: '15:10', dest: 'Marseille' },
    { id: 'mulhouse', h: '15:18', dest: 'Mulhouse' },
    { id: 'lyon', h: '15:25', dest: 'Lyon' },
  ];
  /* le minuteur (viewBox 340 × 340, centre 170 170) : 0 en haut, les minutes dans le sens des aiguilles d'une montre */
  const C = 170, R_DISQUE = 104, R_BOUTON = 84, R_NOMBRE = 146;
  const pol = (deg, r) => [C + r * Math.sin(deg * Math.PI / 180), C - r * Math.cos(deg * Math.PI / 180)];
  const f1 = n => n.toFixed(1);
  const TRAITS = Array.from({ length: 60 }, (_, i) => {
    const g = i % 5 === 0, [x1, y1] = pol(i * 6, g ? 106 : 112), [x2, y2] = pol(i * 6, 120);
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke-width="${g ? 3.4 : 1.4}"/>`;
  }).join('');
  const MINUTEUR = `<svg viewBox="0 0 340 340" aria-hidden="true">
      <rect class="boitier" x="3" y="3" width="334" height="334" rx="46"/>
      <circle class="cadran" cx="${C}" cy="${C}" r="126"/>
      <path class="disque" id="disque" d=""/>
      <g class="traits" stroke-linecap="round">${TRAITS}</g>
      <line class="bord" id="bord" x1="${C}" y1="${C}" x2="${C}" y2="${C - R_DISQUE}"/>
      <circle class="bouton" id="bouton" cx="${C}" cy="${C - R_BOUTON}" r="13"/>
    </svg>`;
  const NOMBRES = Array.from({ length: 12 }, (_, i) => {
    const n = (i + 1) * 5, [x, y] = pol(n * 6, R_NOMBRE);
    return `<button class="num" data-n="${n}" style="left:${f1(x / 340 * 100)}%;top:${f1(y / 340 * 100)}%" aria-label="${n} minutes">${n}</button>`;
  }).join('');
  const MOTS = { 5: 'cinq', 10: 'dix', 15: 'quinze', 20: 'vingt', 25: 'vingt-cinq', 30: 'trente', 35: 'trente-cinq', 40: 'quarante', 45: 'quarante-cinq', 50: 'cinquante', 55: 'cinquante-cinq', 60: 'soixante' };
  const BON = 20;
  const GEL_AGENTE = 7.8;                                // l'agente de près (plan de 6,63 à 8,21 s), après « Vingt minutes » : rien n'y donne la réponse

  return {
    plans: [{ de: 0, cx: { voyageur: .36, agente: .73 } }, { de: 3.125, cx: { voyageur: .05, agente: .58 } }, { de: 5.083, cx: { voyageur: .36, agente: .79 } },
      { de: 6.625, cx: { voyageur: .05, agente: .59 } }, { de: 8.208, cx: { voyageur: .32, agente: .8 } }],
    ordre: ['train', 'retard', 'minutes'],
    bravo: 'Bravo' + NB + '! Le train pour Marseille a vingt minutes de retard.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, avant, qte, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · le voyageur redit sa question : sur le tableau des départs, on clique sur son train */
        async train(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.depart[data-id="montpellier"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'voyageur', seg: ligne(0), sideW: 460, consigne: 'Le voyageur attend quel train' + NB + '? Clique sur son train.',
            panneau: `<div class="panel glass retard"><p class="ptitre">Le voyageur attend quel train${NB}?</p>
              <div class="tableau" role="group" aria-label="Tableau des départs"><div class="tete"><span>Départs</span><span class="col">Heure</span><span class="col">Destination</span></div>
              ${DEPARTS.map(d => `<button class="depart" data-id="${d.id}" aria-label="${d.h.replace(':', ' h ')}, ${d.dest}"><span class="h">${d.h}</span><span class="dest">${d.dest}</span><span class="etat" aria-hidden="true"></span></button>`).join('')}
              </div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(ligne(0)[0], ligne(0)[1], gel()); if (alive(f)) ask(); };
          $$('.depart', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            $$('.depart', side).forEach(x => x.classList.remove('choisi', 'faux'));
            if (b.dataset.id === 'marseille') {
              $$('.depart', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); $('.etat', b).textContent = 'son train';
              if (!await juste(f, 'Oui' + NB + '! Le train pour Marseille.')) return;
              suite();
            } else {
              const d = DEPARTS.find(x => x.id === b.dataset.id);
              b.classList.add('faux'); $('.etat', b).textContent = 'non'; secouer(b);
              const montrer = await faux(f, ligne(0), 'Non' + NB + ': ce train va à ' + d.dest + '.'); if (montrer === null) return;
              b.classList.remove('faux'); $('.etat', b).textContent = '';
              if (montrer) $('.depart[data-id="marseille"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · dans la vidéo, un QTE : appuyer sur le bouton quand l'agente dit « retard » */
        async retard(f) {
          const RET = phrase('retard'), fin = Math.min(RET[1] + .55, ligne(2)[0] - .05);
          if (!await qte(f, { mot: 'retard', consigne: 'Appuie sur le bouton quand tu entends le mot retard.', de: .3, a: ligne(2)[1] + .3,
            cibles: [{ s: RET[0] - .1, e: fin }],
            pieges: [
              { s: .3, e: ligne(1)[0] - .2, msg: 'Pas encore' + NB + ': là, le voyageur pose sa question.' },
              { s: ligne(1)[0] - .2, e: RET[0] - .1, msg: 'Presque' + NB + '! Là, elle dit «' + NB + 'Non, ce train a du…' + NB + '».' },
              { s: fin, e: ligne(2)[1] + .4, msg: 'Trop tard' + NB + ': là, il demande «' + NB + 'Combien de temps' + NB + '?' + NB + '».' },
            ],
            juste: 'Oui' + NB + '! «' + NB + 'Non, ce train a du retard.' + NB + '»', montre: "C'est là" + NB + ': «' + NB + 'ce train a du retard' + NB + '».' })) return;
          suite();
        },

        /* 3 · l'agente redit « Vingt minutes » : on fait tourner le disque du minuteur, puis Valider */
        async minutes(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let val = 0, tire = false;
          const peindre = (v, anime) => {
            const m = $('.minuteur', side); if (!m) return;
            const a = Math.min(v, 60) * 6, d = $('#disque', m);
            if (v <= 0) d.setAttribute('d', '');
            else if (v >= 60) d.setAttribute('d', `M${C} ${C - R_DISQUE}A${R_DISQUE} ${R_DISQUE} 0 1 1 ${C} ${C + R_DISQUE}A${R_DISQUE} ${R_DISQUE} 0 1 1 ${C} ${C - R_DISQUE}Z`);
            else { const [x, y] = pol(a, R_DISQUE); d.setAttribute('d', `M${C} ${C}L${C} ${C - R_DISQUE}A${R_DISQUE} ${R_DISQUE} 0 ${a > 180 ? 1 : 0} 1 ${f1(x)} ${f1(y)}Z`); }
            const [bx, by] = pol(a, R_DISQUE), [kx, ky] = pol(a, R_BOUTON);
            $('#bord', m).setAttribute('x2', f1(bx)); $('#bord', m).setAttribute('y2', f1(by));
            $('#bouton', m).setAttribute('cx', f1(kx)); $('#bouton', m).setAttribute('cy', f1(ky));
            $('#lu', side).textContent = v;
            m.setAttribute('aria-valuenow', v); m.setAttribute('aria-valuetext', v + ' minutes');
            $$('.num', m).forEach(b => b.setAttribute('aria-pressed', +b.dataset.n === v));
            if (anime) m.classList.add('pose'); else m.classList.remove('pose');
          };
          const poser = (v, anime = true) => { val = v; peindre(v, anime); sfx.tick(); };
          const angle = (e, m) => { const r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); return (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360; };
          const tourner = () => {                               // le doigt fantôme : il tire le disque d'un quart de tour (pas jusqu'à la réponse)
            const m = $('.minuteur', side); if (!m || !m.isConnected) return null;
            const r = m.getBoundingClientRect(), k = r.width / 340, pt = deg => { const [x, y] = pol(deg, R_BOUTON); return [r.left + x * k, r.top + y * k]; };
            const [x0, y0] = pt(0), [x1, y1] = pt(35), [x2, y2] = pt(70), [x3, y3] = pt(95);
            return [at(x0, y0 + 40, 0), at(x0, y0, 1), at(x0, y0, 1, .82), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x3, y3, 1, .82), at(x3, y3, 1), at(x3, y3, 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tourner, 4500); };
          if (!await avant(f, {
            qui: 'agente', seg: SEG, gel: GEL_AGENTE, sideW: 460, consigne: 'Le train a combien de minutes de retard' + NB + '? Fais tourner le minuteur, puis clique sur Valider.',
            panneau: `<div class="panel glass retard"><p class="ptitre">Fais tourner le minuteur, puis clique sur Valider.</p>
              <div class="minuteur" role="slider" tabindex="0" aria-label="Minuteur, en minutes" aria-valuemin="0" aria-valuemax="60" aria-valuenow="0">${MINUTEUR}${NOMBRES}
                <div class="centre" aria-hidden="true"><b id="lu">0</b><small>min</small></div></div>
              <p class="legende" id="leg">Le train a <b id="leg-n">…</b> de retard.</p></div>`,
            monte: p => {
              const m = $('.minuteur', p);
              m.addEventListener('pointerdown', e => {
                if (!tour() || e.button > 0 || e.target.closest('.num')) return;
                A.unlock(); idle.reset(); e.preventDefault(); tire = true; m.classList.add('tire');
                try { m.setPointerCapture(e.pointerId); } catch (err) {}
                val = Math.round(angle(e, m) / 6); peindre(val, false);
              });
              m.addEventListener('pointermove', e => {
                if (!tire) return;
                let v = Math.round(angle(e, m) / 6);
                if (val >= 45 && v <= 15) v = 60; else if (val <= 15 && v >= 45) v = 0;   // on ne saute pas de 60 à 0 en passant le haut
                if (v !== val) { val = v; peindre(v, false); }
              });
              const lacher = () => { if (!tire) return; tire = false; m.classList.remove('tire'); poser(Math.round(val / 5) * 5); legende(); };
              m.addEventListener('pointerup', lacher); m.addEventListener('pointercancel', lacher);
              m.addEventListener('keydown', e => {
                if (!tour()) return;
                const pas = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key]; if (!pas) return;
                e.preventDefault(); A.unlock(); idle.reset(); poser(Math.max(0, Math.min(60, Math.round(val / 5) * 5 + pas))); legende();
              });
              $$('.num', m).forEach(b => b.addEventListener('click', () => { if (!tour()) return; A.unlock(); idle.reset(); poser(+b.dataset.n); legende(); }));
              peindre(0, false);
            },
          })) return;
          function legende() { const n = $('#leg-n', side); if (n) n.textContent = val ? MOTS[val] + ' minutes' : '…'; if (tour() && val) Q.show('you', state.ask); }
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            if (!val) { secouer($('.minuteur', side)); Q.show('you', 'Fais tourner le minuteur.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const m = $('.minuteur', side);
            if (val === BON) {
              m.classList.add('juste'); $('#leg', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Vingt minutes de retard.')) return;
              suite();
            } else {
              m.classList.add('faux'); secouer(m);
              const montrer = await faux(f, SEG, 'Pas ' + MOTS[val] + ' minutes.'); if (montrer === null) return;
              m.classList.remove('faux');
              if (montrer) {                                    // deux essais : on pose la réponse
                poser(BON); legende(); m.classList.add('juste'); $('#leg', side).classList.add('juste');
                Q.show('ok', 'Vingt minutes de retard.'); state.essais = 0; suite();
              } else { poser(0); legende(); ask(); }
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        voyageur: [{ text: 'le train pour Marseille', seg: A.phrase('le train pour Marseille') }, { text: 'Combien de temps' + A.NB + '?', seg: A.ligne(2) }, { text: "D'accord, merci.", seg: A.ligne(4) }],
        agente: [{ text: 'Ce train a du retard.', seg: A.ligne(1) }, { text: 'vingt minutes', seg: A.ligne(3) }],
      },
    }),
  };
})();
