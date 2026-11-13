/* À l'épicerie : ce que la cliente achète va dans le sac ; puis on paie, avec des pièces et des billets. */
window.SCENARIO = (() => {
  const SVG = {
    sac: '<svg viewBox="0 0 60 64"><path d="M8 18h44l-3 42H11z" fill="#C8955A"/><path d="M8 18l6-8h32l6 8z" fill="#B07D45"/><path d="M22 25c0 7 16 7 16 0" stroke="#7A5128" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>',
    pommes: '<svg viewBox="0 0 48 48"><path d="M24 15c-4-3-12-3-14 5-2 9 4 21 10 21 2 0 3-1 4-1s2 1 4 1c6 0 12-12 10-21-2-8-10-8-14-5z" fill="#E5383B"/><path d="M24 15c0-4 1-7 4-9" stroke="#6B4226" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M26 11c4-3 8-2 9 0-3 3-7 3-9 0z" fill="#3FA34D"/><ellipse cx="16" cy="22" rx="2.5" ry="4.5" fill="#fff" opacity=".35"/></svg>',
    pain: '<svg viewBox="0 0 48 48"><path d="M9 34C5 30 27 10 34 9c5-1 8 2 6 6C38 22 17 40 13 38z" fill="#D9A15B"/><path d="M17 28l4 2M22 23l4 2M27 18l4 2M32 14l3 1.5" stroke="#B5762F" stroke-width="2.4" stroke-linecap="round"/></svg>',
    lait: '<svg viewBox="0 0 48 48"><path d="M15 17l4-8h10l4 8v26H15z" fill="#fff" stroke="#9FB4D6" stroke-width="2" stroke-linejoin="round"/><path d="M15 17h18" stroke="#9FB4D6" stroke-width="2"/><rect x="18" y="23" width="12" height="12" rx="3" fill="#3AA8FF"/><path d="M19 9h10V5H19z" fill="#3AA8FF"/></svg>',
    oranges: '<svg viewBox="0 0 48 48"><circle cx="24" cy="28" r="14" fill="#FF9F1C"/><circle cx="19" cy="23" r="1.3" fill="#E07F00"/><circle cx="28" cy="31" r="1.3" fill="#E07F00"/><circle cx="23" cy="35" r="1.1" fill="#E07F00"/><circle cx="31" cy="24" r="1.1" fill="#E07F00"/><path d="M24 14c2-4 6-5 9-4-2 4-6 5-9 4z" fill="#3FA34D"/></svg>',
    fromage: '<svg viewBox="0 0 48 48"><path d="M5 35L31 14l12 7v14z" fill="#FFD166" stroke="#E0A800" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="29" r="2.8" fill="#E9B949"/><circle cx="31" cy="25" r="2" fill="#E9B949"/><circle cx="35" cy="31" r="1.7" fill="#E9B949"/></svg>',
    oeufs: '<svg viewBox="0 0 48 48"><ellipse cx="18" cy="28" rx="9" ry="12" fill="#F4E3C9" stroke="#D9C2A0" stroke-width="1.5"/><ellipse cx="31" cy="30" rx="8.5" ry="11" fill="#FFF6E8" stroke="#D9C2A0" stroke-width="1.5"/></svg>',
  };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const euros = v => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));
  return {
    ordre: ['sac', 'payer'],
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, frameTo, CROPS, WIDE, freeze, playSegment, phrase, setSide, side, idle, tapHere, sfx, fly, faux, juste, suite, goBtn } = A;
      const PROD = [
        { id: 'lait', nom: 'du lait' }, { id: 'pommes', nom: 'des pommes', ok: true, seg: phrase('je voudrais un kilo de pommes') },
        { id: 'oranges', nom: 'des oranges' }, { id: 'pain', nom: 'du pain', ok: true, seg: phrase('oui je voudrais du pain') },
        { id: 'fromage', nom: 'du fromage' }, { id: 'oeufs', nom: 'des œufs' },
      ];
      const ACHATS = [phrase('je voudrais un kilo de pommes')[0], phrase('oui je voudrais du pain')[1]];
      const PRIX = phrase('cela fait cinq euros'), SEG_PRIX = [phrase('combien ça coûte')[0], PRIX[1]];
      return {
        /* 1 · le sac : on y met ce que la cliente achète */
        async sac(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = "Qu'est-ce que la cliente achète" + NB + '?';
          const pris = new Set(), reste = () => PROD.filter(p => p.ok && !pris.has(p.id));
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.tuile', side)), 5000); };
          state.replay = async () => { setTurn('listen'); await playSegment(ACHATS[0], ACHATS[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          setSide(`<div class="panel glass"><div class="sac" id="sac"><div class="sacpic">${SVG.sac}</div><div class="dans" id="dans"></div></div>
            <div class="grille">${PROD.map(p => `<button class="tuile" data-id="${p.id}"><span class="pic">${SVG[p.id]}</span><span class="nom">${p.nom}</span></button>`).join('')}</div></div>`);
          frameTo(CROPS.full, true);
          $$('.tuile', side).forEach(b => b.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait');
            const p = PROD.find(x => x.id === b.dataset.id);
            if (p.ok) {
              b.classList.remove('indice'); b.classList.add('pris'); pris.add(p.id);
              await fly(b, $('#sac'), `<div class="mini" style="width:100%;height:100%">${SVG[p.id]}</div>`, { scale: .4 });
              $('#dans').insertAdjacentHTML('beforeend', `<span class="mini">${SVG[p.id]}</span>`);
              $('#sac').classList.add('chaud'); setTimeout(() => { const s = $('#sac'); if (s) s.classList.remove('chaud'); }, 600);
              if (!await juste(f, 'Oui' + NB + '! ' + cap(p.nom) + '.', p.seg)) return;
              if (reste().length) ask();
              else { Q.show('ok', 'Oui' + NB + '! Des pommes et du pain.'); suite(); }
            } else {
              b.classList.add('faux'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
              const montrer = await faux(f, ACHATS); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) reste().forEach(x => $(`.tuile[data-id="${x.id}"]`, side).classList.add('indice'));
              ask();
            }
          }));
          ask();
        },

        /* 2 · payer : poser sur le comptoir la somme que dit le vendeur (toute façon de faire cinq euros est juste) */
        async payer(f) {
          setSide(null); frameTo(CROPS.full, false);
          await freeze(WIDE); if (!alive(f)) return;
          state.ask = 'Combien ça coûte' + NB + '?';
          let total = 0;
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Payer', valider); yourTurn(); idle.set(tapHere($('.bourse .argent', side)), 5000); };
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(SEG_PRIX[0], SEG_PRIX[1], WIDE); if (alive(f)) ask(); };
          if (!await Q.say(state.ask, f)) return;
          const MONNAIE = [{ v: .5, c: 'piece', t: '50' + NB + 'c' }, { v: 1, c: 'piece blanche', t: '1' + NB + '€' }, { v: 2, c: 'piece deux', t: '2' + NB + '€' }, { v: 5, c: 'billet cinq', t: '5' + NB + '€' }, { v: 10, c: 'billet dix', t: '10' + NB + '€' }];
          const argent = (m, k) => `<button class="argent ${m.c}" data-v="${m.v}" data-k="${k}" aria-label="${m.t}">${m.t}</button>`;
          setSide(`<div class="panel glass"><p class="ptitre">Posez l'argent sur le comptoir</p>
            <div class="plateau" id="plateau"><div class="somme"><span id="somme">0</span><small>€</small></div><div class="posees" id="posees"></div></div>
            <div class="bourse">${MONNAIE.map(argent).join('')}</div></div>`);
          frameTo(CROPS.full, true);
          const maj = () => { total = Math.round([...$$('#posees .argent', side)].reduce((s, b) => s + +b.dataset.v, 0) * 100) / 100; $('#somme').textContent = euros(total); };
          const poser = k => {
            const box = document.createElement('div'); box.innerHTML = argent(MONNAIE[k], k); const b = box.firstChild;
            $('#posees').append(b); maj();
            b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you') return; sfx.tick(); b.remove(); maj(); });
          };
          $$('.bourse .argent', side).forEach(b => b.addEventListener('click', () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.reset(); sfx.coin(); poser(+b.dataset.k);
          }));
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!total) { Q.show('you', "Posez l'argent sur le comptoir."); return; }
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
        vendeur: [{ text: 'Vous désirez quoi ?', seg: A.ligne(2) }, { text: 'Merci, bonne journée.', seg: A.ligne(10) }],
        cliente: [{ text: 'un kilo de pommes', seg: A.phrase('un kilo de pommes') }, { text: 'du pain', seg: A.phrase('du pain') }, { text: '5 €', seg: A.phrase('cela fait cinq euros') }],
      },
    }),
  };
})();
