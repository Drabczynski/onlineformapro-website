/* À la gare : le voyageur redit sa question (la vidéo resserrée sur lui), on clique sur la ville sur la carte de France ;
   l'agent redit l'heure du départ, on fait tourner les aiguilles de l'horloge de la gare ; enfin, dans la vidéo, on touche
   l'image quand on entend l'heure d'arrivée (pas l'heure du départ, pas la question du voyageur). */
window.SCENARIO = (() => {
  /* la carte : contour simplifié de la France (viewBox 330 × 325), les villes en coordonnées de la carte */
  const FRANCE = 'M180 18 184 16 192 28 199 28 209 36 221 43 224 55 237 48 237 60 250 66 266 70 280 80 291 82 314 87 305 100 299 122 299 134 287 138 285 143 274 153 266 167 264 182 282 174 288 190 282 197 289 210 279 219 287 230 285 240 298 250 299 261 293 264 287 269 279 281 267 284 262 284 249 279 237 276 222 271 215 270 199 279 196 291 199 306 183 309 165 304 142 294 119 294 103 286 85 275 91 269 96 247 97 232 99 207 100 200 98 182 84 170 76 158 75 148 68 143 57 137 45 130 26 127 24 118 16 108 19 100 34 96 45 91 57 93 64 102 80 98 90 98 90 80 82 63 97 63 99 75 121 76 128 71 130 63 150 55 161 46 163 29 168 21Z';
  const VILLES = [
    { id: 'lille', nom: 'Lille', x: 194, y: 37, cote: 'd' },
    { id: 'paris', nom: 'Paris', x: 180, y: 91, cote: 'g' },
    { id: 'strasbourg', nom: 'Strasbourg', x: 299, y: 101, cote: 'bg' },      // le nom en dessous, à gauche : il ne cache pas Paris
    { id: 'bordeaux', nom: 'Bordeaux', x: 112, y: 226, cote: 'd' },
    { id: 'lyon', nom: 'Lyon', x: 237, y: 195, cote: 'd' },
    { id: 'marseille', nom: 'Marseille', x: 249, y: 274, cote: 'g' },
  ];
  const CARTE = `<div class="carte"><svg viewBox="0 0 330 325" aria-hidden="true"><path d="${FRANCE}" class="pays"/></svg>
    ${VILLES.map(v => `<button class="ville" data-id="${v.id}" data-cote="${v.cote}" style="left:${(v.x / 330 * 100).toFixed(1)}%;top:${(v.y / 325 * 100).toFixed(1)}%"><span class="pt"></span><span class="nomv">${v.nom}</span></button>`).join('')}</div>`;

  /* l'horloge de la gare (viewBox 300 × 300, centre 150 150) : l'aiguille des heures a une poignée ; celle des minutes
     tourne douze fois plus vite, comme quand on remet une horloge à l'heure */
  const pol = (a, r) => [150 + r * Math.sin(a * Math.PI / 180), 150 - r * Math.cos(a * Math.PI / 180)].map(n => n.toFixed(1));
  const TRAITS = Array.from({ length: 60 }, (_, i) => { const h = i % 5 === 0, [x1, y1] = pol(i * 6, h ? 126 : 132), [x2, y2] = pol(i * 6, 138); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${h ? 5 : 2}"/>`; }).join('');
  const CHIFFRES = Array.from({ length: 12 }, (_, i) => { const [x, y] = pol((i + 1) * 30, 107); return `<text x="${x}" y="${y}">${i + 1}</text>`; }).join('');
  const HORLOGE = `<svg viewBox="0 0 300 300" aria-hidden="true">
      <circle class="cadran" cx="150" cy="150" r="143" fill="#fff" stroke="#2A3142" stroke-width="10"/>
      <g stroke="#0B0D16" stroke-linecap="round">${TRAITS}</g>
      <g class="chiffres" fill="#0B0D16">${CHIFFRES}</g>
      <g class="aig" id="aigM"><rect x="146.5" y="56" width="7" height="106" rx="3.5" fill="#0B0D16"/></g>
      <g class="aig" id="aigH"><rect x="143" y="84" width="14" height="78" rx="7" fill="#0B0D16"/><circle class="poignee" cx="150" cy="86" r="14" fill="#fff" stroke="#3AA8FF" stroke-width="5"/></g>
      <circle cx="150" cy="150" r="9" fill="#E5383B"/>
    </svg>`;
  const MOTS = ['', 'une heure', 'deux heures', 'trois heures', 'quatre heures', 'cinq heures', 'six heures', 'sept heures', 'huit heures', 'neuf heures', 'dix heures', 'onze heures', 'midi'];
  const DEPART = 10, AU_DEBUT = 8;

  return {
    plans: [{ de: 0, cx: { agent: .17, voyageur: .71 } }, { de: 2.92, cx: { agent: .38, voyageur: .92 } }, { de: 4.46, cx: { agent: .17, voyageur: .69 } },
      { de: 6.46, cx: { agent: .39, voyageur: .92 } }, { de: 8.29, cx: { agent: .17, voyageur: .71 } }],
    ordre: ['ville', 'depart', 'arrivee'],
    bravo: 'Bravo ! Départ à dix heures, arrivée à midi. Bon voyage !',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, setSide, frameTo, CROPS, freeze, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, marque, gel, stopAll, qte } = A;
      const aToi = () => document.body.dataset.turn === 'you';
      const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · où va le train : le voyageur redit sa question, on clique sur la ville sur la carte */
        async ville(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.ville[data-id="paris"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute le voyageur.', qui: 'voyageur', seg: ligne(0), sideW: 460, consigne: 'Le train va où' + NB + '? Clique sur la ville.',
            panneau: `<div class="panel glass"><p class="ptitre">Le train va à…</p>${CARTE}</div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(ligne(0)[0], ligne(0)[1], gel()); if (alive(f)) ask(); };
          $$('.ville', side).forEach(b => b.addEventListener('click', async () => {
            if (!aToi()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const v = VILLES.find(x => x.id === b.dataset.id);
            if (v.id === 'marseille') {
              $$('.ville', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Le train va à Marseille.', phrase('pour Marseille'))) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, ligne(0), 'Pas à ' + v.nom + '. Écoute encore.'); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.ville[data-id="marseille"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · l'heure du départ : l'agent la redit, on fait tourner les aiguilles de l'horloge (glisser, ou flèches du clavier), puis Valider */
        async depart(f) {
          let cont = AU_DEBUT * 30, bouge = false, tient = false;
          const mod = x => ((x % 360) + 360) % 360;
          const heure = () => (Math.round(mod(cont) / 30) % 12) || 12;
          const proche = a => cont + ((a - mod(cont) + 540) % 360) - 180;          // le même angle, au plus près de l'aiguille
          const poser = (a, net) => {
            cont = net ? Math.round(a / 30) * 30 : a;
            const h = $('#aigH'), m = $('#aigM'); if (!h) return;
            h.style.transform = `rotate(${cont}deg)`; m.style.transform = `rotate(${cont * 12}deg)`;
            const n = heure(), w = $('.horloge', side);
            $('#hLu').textContent = n + NB + 'h'; w.setAttribute('aria-valuenow', n); w.setAttribute('aria-valuetext', n === 12 ? 'midi' : MOTS[n]);
          };
          const glisser = () => {
            const s = $('.horloge svg', side); if (!s) return null;
            const r = s.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, rr = r.width / 2 * 64 / 150;
            const sens = proche(DEPART * 30) > cont ? -1 : 1;                              // jamais vers la bonne heure
            const pt = k => { const a = (cont + sens * 50 * k) * Math.PI / 180; return [cx + rr * Math.sin(a), cy - rr * Math.cos(a)]; };
            const fr = [at(pt(0)[0], pt(0)[1] + 40, 0), at(...pt(0), 1), at(...pt(0), 1, .82)];
            for (const k of [.25, .5, .75, 1]) fr.push(at(...pt(k), 1, .82));
            return [...fr, at(...pt(1), 1), at(...pt(1), 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 4000); };
          if (!await avant(f, {
            question: "Écoute l'agent.", qui: 'agent', seg: ligne(1), gel: 3.05, sideW: 420, consigne: 'Le train part à quelle heure' + NB + '? Fais tourner les aiguilles.',
            panneau: `<div class="panel glass"><p class="ptitre">Fais tourner les aiguilles</p>
              <div class="horloge" role="slider" tabindex="0" aria-label="Horloge de la gare : l'heure du départ" aria-valuemin="1" aria-valuemax="12" aria-valuenow="${AU_DEBUT}" aria-valuetext="${MOTS[AU_DEBUT]}">${HORLOGE}</div>
              <p class="hlu"><span>Départ${NB}:</span><b id="hLu">${AU_DEBUT}${NB}h</b></p></div>`,
            monte: p => {
              const w = $('.horloge', p), s = $('svg', w);
              const angle = e => { const r = s.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); return { a: mod(Math.atan2(x, -y) * 180 / Math.PI), d: Math.hypot(x, y) / (r.width / 2) }; };
              poser(cont, true);
              w.addEventListener('pointerdown', e => {
                if (!aToi()) return;
                A.unlock(); idle.reset(); e.preventDefault(); w.setPointerCapture(e.pointerId); tient = true;
                const { a, d } = angle(e); if (d > .12) poser(proche(a), false);
              });
              w.addEventListener('pointermove', e => {
                if (!tient) return;
                w.classList.add('tire'); const { a, d } = angle(e); if (d > .12) poser(proche(a), false);
              });
              const lacher = () => { if (!tient) return; tient = false; w.classList.remove('tire'); poser(cont, true); bouge = true; sfx.tick(); };
              w.addEventListener('pointerup', lacher); w.addEventListener('pointercancel', lacher); w.addEventListener('lostpointercapture', lacher);
              w.addEventListener('keydown', e => {
                const pas = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!pas || !aToi()) return;
                e.preventDefault(); A.unlock(); idle.reset(); poser(Math.round(cont / 30) * 30 + pas * 30, true); bouge = true; sfx.tick();
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(ligne(1)[0], ligne(1)[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!aToi()) return;
            if (!bouge) { Q.show('you', 'Fais tourner les aiguilles.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const n = heure(), w = $('.horloge', side);
            if (n === DEPART) {
              w.classList.add('juste'); $('.hlu', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Le train part à dix heures.', ligne(1))) return;
              suite();
            } else {
              w.classList.add('faux'); secouer(w);
              const montrer = await faux(f, ligne(1), 'Là, il est ' + MOTS[n] + '. Écoute encore.'); if (montrer === null) return;
              w.classList.remove('faux');
              if (montrer) { poser(proche(DEPART * 30), true); w.classList.add('juste'); $('.hlu', side).classList.add('juste'); Q.show('ok', 'Le train part à dix heures.'); state.essais = 0; suite(); }
              else ask();
            }
          }
          ask();
        },

        /* 3 · dans la vidéo, un QTE : appuyer quand l'agent dit l'heure d'arrivée, « midi » (pas « dix heures », le départ) */
        async arrivee(f) {
          if (!await qte(f, { mot: 'midi', consigne: 'Appuie sur le bouton quand tu entends le mot midi.', de: 3.0, a: ligne(3)[1] + .3,
            cibles: [{ s: phrase('midi')[0] - .15, e: ligne(3)[1] + .6 }],
            pieges: [{ s: ligne(1)[0] - .08, e: ligne(1)[1] + .4, msg: "Dix heures, c'est le départ." }, { s: ligne(2)[0] - .12, e: ligne(2)[1] + .2, msg: "Là, c'est la question." }],
            juste: 'Oui' + NB + '! Il arrive à midi' + NB + ': 12' + NB + 'h.' })) return;
          suite();
        },
      };
    },
    bilan: A => ({
      faits: {
        agent: [{ text: 'À dix heures.', seg: A.ligne(1) }, { text: 'Il arrive à midi.', seg: A.ligne(3) }],
        voyageur: [{ text: 'À quelle heure part le train' + A.NB + '?', seg: A.phrase('à quelle heure part le train') }, { text: 'pour Marseille', seg: A.phrase('pour Marseille') },
          { text: 'Et il arrive à quelle heure' + A.NB + '?', seg: A.ligne(2) }],
      },
    }),
  };
})();
