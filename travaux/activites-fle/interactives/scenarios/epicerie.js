/* À l'épicerie : on touche dans la boutique, sur l'image, ce que la cliente achète (ça part dans son sac en papier) ;
   puis le vendeur redit le prix, la vidéo resserrée sur lui, et on pose l'argent sur le comptoir. */
window.SCENARIO = (() => {
  const SVG = {
    pommes: '<svg viewBox="0 0 48 48"><path d="M24 15c-4-3-12-3-14 5-2 9 4 21 10 21 2 0 3-1 4-1s2 1 4 1c6 0 12-12 10-21-2-8-10-8-14-5z" fill="#E5383B"/><path d="M24 15c0-4 1-7 4-9" stroke="#6B4226" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M26 11c4-3 8-2 9 0-3 3-7 3-9 0z" fill="#3FA34D"/><ellipse cx="16" cy="22" rx="2.5" ry="4.5" fill="#fff" opacity=".35"/></svg>',
    pain: '<svg viewBox="0 0 48 48"><path d="M9 34C5 30 27 10 34 9c5-1 8 2 6 6C38 22 17 40 13 38z" fill="#D9A15B"/><path d="M17 28l4 2M22 23l4 2M27 18l4 2M32 14l3 1.5" stroke="#B5762F" stroke-width="2.4" stroke-linecap="round"/></svg>',
  };
  /* les produits de la boutique, repérés sur l'image où la vidéo s'arrête (9,2 s), en % */
  const PROD = [
    { id: 'pommes', nom: 'des pommes', ok: true, zones: [{ x: 0, y: 59, w: 12, h: 11 }, { x: 21, y: 92, w: 27, h: 8 }, { x: 82, y: 56, w: 7, h: 10 }] },
    { id: 'pain', nom: 'du pain', ok: true, zones: [{ x: 56, y: 54, w: 8, h: 10 }, { x: 44, y: 55, w: 7, h: 12 }] },
    { id: 'confiture', nom: 'de la confiture', pas: 'Pas de confiture.', zones: [{ x: 0, y: 4, w: 18, h: 38 }] },
    { id: 'vin', nom: 'du vin', pas: 'Pas de vin.', zones: [{ x: 40, y: 13, w: 17, h: 32 }] },
    { id: 'legumes', nom: 'des légumes', pas: 'Pas de légumes.', zones: [{ x: 6, y: 52, w: 9, h: 9 }, { x: 34, y: 52, w: 9, h: 9 }] },
    { id: 'oranges', nom: 'des oranges', pas: "Pas d'oranges.", zones: [{ x: 86, y: 78, w: 10, h: 10 }] },
  ];
  const SAC = { x: 40, y: 81 };     // le sac en papier, sur le comptoir
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const euros = v => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));
  return {
    plans: [{ de: 0, cx: { vendeur: .25, cliente: .72 } }, { de: 4.17, cx: { vendeur: .35, cliente: .6 } }, { de: 5.42, cx: { vendeur: .25, cliente: .72 } }],
    ordre: ['sac', 'payer'],
    bravo: 'Parfait ! La cliente a ses pommes et son pain.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, WIDE, playSegment, phrase, side, idle, tapHere, sfx, fly, faux, juste, suite, goBtn, zones, cam, avant, cadreZone, marque } = A;
      PROD[0].seg = phrase('je voudrais un kilo de pommes'); PROD[1].seg = phrase('oui je voudrais du pain');
      const ACHATS = [PROD[0].seg[0], PROD[1].seg[1]];
      const PRIX = phrase('cela fait cinq euros'), SEG_PRIX = [phrase('combien ça coûte')[0], PRIX[1]];
      return {
        /* 1 · dans la boutique : toucher ce qu'elle achète, ça vole dans le sac en papier du comptoir */
        async sac(f) {
          let sac;
          const ZL = PROD.flatMap(p => p.zones.map((z, k) => ({ ...z, id: p.id + '-' + k, label: p.nom, p })));
          const pris = new Set(), reste = () => PROD.filter(p => p.ok && !pris.has(p.id));
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="vin-0"]', cam)), 5000); };
          if (!await avant(f, {
            question: 'Écoute la cliente.', qui: 'cliente', seg: ACHATS, consigne: "Dans la boutique, clique sur ce qu'elle achète.",
            monte: () => { sac = document.createElement('div'); sac.className = 'surimage sacv'; Object.assign(sac.style, { left: SAC.x + '%', top: SAC.y + '%' }); cam.append(sac); },
          })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(ACHATS[0], ACHATS[1], WIDE); if (alive(f)) ask(); };
          zones(ZL, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking');
            const p = z.p;
            if (p.ok && pris.has(p.id)) { Q.show('you', cap(p.nom) + NB + ': déjà dans le sac.'); setTimeout(() => { if (alive(f)) ask(); }, 900); return; }
            if (p.ok) {
              pris.add(p.id); sfx.tick();
              $$(`.hit[data-id^="${p.id}-"]`, cam).forEach(h => h.classList.remove('indice'));
              const c = cadreZone(z); p.zones.filter(x => x !== p.zones[+id.split('-')[1]]).forEach(x => cadreZone(x)); marque(z, cap(p.nom), 'juste');
              await fly(c, sac, `<div class="mini" style="width:100%;height:100%;border-radius:50%">${SVG[p.id]}</div>`, { scale: .3 });
              sac.insertAdjacentHTML('beforeend', `<span class="mini">${SVG[p.id]}</span>`);
              if (!await juste(f, 'Oui' + NB + '! ' + cap(p.nom) + '.', p.seg)) return;
              if (reste().length) ask();
              else { zones(null); Q.show('ok', 'Oui' + NB + '! Des pommes et du pain.'); suite(); }
            } else {
              cadreZone(z, 'faux'); marque(z, cap(p.nom), 'faux');
              const montrer = await faux(f, ACHATS, p.pas + ' Écoute encore.'); if (montrer === null) return;
              if (montrer) reste().forEach(x => $$(`.hit[data-id^="${x.id}-"]`, cam).forEach(h => h.classList.add('indice')));
              ask();
            }
          });
          ask();
        },

        /* 2 · payer : le vendeur redit le prix (la vidéo resserrée sur lui), on pose l'argent sur le comptoir */
        async payer(f) {
          let total = 0;
          const MONNAIE = [{ v: .5, c: 'piece', t: '50' + NB + 'c' }, { v: 1, c: 'piece blanche', t: '1' + NB + '€' }, { v: 2, c: 'piece deux', t: '2' + NB + '€' }, { v: 5, c: 'billet cinq', t: '5' + NB + '€' }, { v: 10, c: 'billet dix', t: '10' + NB + '€' }];
          const argent = (m, k) => `<button class="argent ${m.c}" data-v="${m.v}" data-k="${k}" aria-label="${m.t}">${m.t}</button>`;
          const maj = () => { total = Math.round([...$$('#posees .argent', side)].reduce((s, b) => s + +b.dataset.v, 0) * 100) / 100; $('#somme').textContent = euros(total); };
          const poser = k => {
            const box = document.createElement('div'); box.innerHTML = argent(MONNAIE[k], k); const b = box.firstChild;
            $('#posees').append(b); maj();
            b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; sfx.tick(); b.remove(); maj(); });
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Payer', valider); yourTurn(); idle.set(tapHere($('.bourse .argent', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute le vendeur.', qui: 'vendeur', seg: SEG_PRIX, sideW: 400, consigne: "Pose l'argent, puis clique sur payer.",
            panneau: `<div class="panel glass"><p class="ptitre">Pose l'argent sur le comptoir</p>
              <div class="plateau" id="plateau"><div class="somme"><span id="somme">0</span><small>€</small></div><div class="posees" id="posees"></div></div>
              <div class="bourse">${MONNAIE.map(argent).join('')}</div></div>`,
            monte: p => $$('.bourse .argent', p).forEach(b => b.addEventListener('click', () => {
              if (document.body.dataset.turn !== 'you') return;
              A.unlock(); idle.reset(); sfx.coin(); poser(+b.dataset.k);
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(SEG_PRIX[0], SEG_PRIX[1], WIDE); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!total) { Q.show('you', "Pose l'argent sur le comptoir."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (total === 5) {
              $('#plateau').classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Ça fait cinq euros.', PRIX)) return;
              suite();
            } else {
              const pl = $('#plateau'); pl.classList.remove('shake'); void pl.offsetWidth; pl.classList.add('shake');
              const montrer = await faux(f, SEG_PRIX, 'Pas ' + euros(total) + NB + '€. Écoute encore.'); if (montrer === null) return;
              if (montrer) {
                $('#posees').innerHTML = ''; poser(3); $('#plateau').classList.add('juste');
                Q.show('ok', 'Ça fait cinq euros.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        vendeur: [{ text: 'Vous désirez quoi' + A.NB + '?', seg: A.ligne(2) }, { text: 'Cela fait cinq euros.', seg: A.ligne(8) }],
        cliente: [{ text: 'un kilo de pommes', seg: A.phrase('un kilo de pommes') }, { text: 'du pain', seg: A.phrase('du pain') }, { text: 'Combien ça coûte' + A.NB + '?', seg: A.ligne(7) }],
      },
    }),
  };
})();
