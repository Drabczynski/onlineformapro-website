/* La brocante : dans une rue, devant un stand de brocante, un monsieur demande à la vendeuse combien coûte une lampe ; elle
   dit quinze euros (« elle marche très bien ») ; il trouve ça trop cher et propose dix euros ; elle dit « allez, douze euros
   et elle est à vous » (coupes à 1,96, 3,92, 6,92 et 8,92 s : plan large, la vendeuse de près, le monsieur de près, la
   vendeuse de près, plan large).
   1 · dans la vidéo : le monsieur redit sa question (la vidéo resserrée sur lui) ; sur le plan large, on cherche sur le stand,
       parmi une dizaine de vrais objets (valise, cadre, radio, vase, théière…), celui dont il demande le prix : la lampe ;
   2 · la vendeuse redit son premier prix : à côté, l'étiquette de la lampe et une règle des prix (1 à 20 €) ; on fait
       glisser le curseur jusqu'au prix (le prix s'écrit sur l'étiquette), puis Valider ;
   3 · la fin de la discussion (« trop cher… dix euros ? — allez, douze euros ») : on pose l'argent sur la table (billets et
       pièces), puis Payer.
   Rien de devinable par l'image : le monsieur ne montre pas la lampe, aucun prix n'est écrit sur le stand. Les images figées
   (9,5 s : plan large, les deux rient ; 2,4 s : la vendeuse de près, avant de répondre ; 7,2 s : la vendeuse de près, avant
   « allez ») ne donnent aucune réponse. */
window.SCENARIO = (() => {
  /* l'écriture de l'étiquette (Google Fonts) ; sans elle, une écriture manuscrite du système */
  if (!document.querySelector('link[data-carnet]')) document.head.insertAdjacentHTML('beforeend', '<link data-carnet rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap">');
  const NB = ' ';
  const LETTRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'];
  const enLettres = n => LETTRES[n] || String(n);
  const euros = n => n + NB + '€';

  /* 1 · les objets du stand, repérés sur l'image figée (9,5 s), en % (la vidéo se resserre sur le stand : voir crops) */
  const OBJETS = [
    { id: 'lampe', ok: true, label: 'La lampe', x: 36.5, y: 48.5, w: 10, h: 17 },
    { id: 'boite', label: 'Une boîte', x: 35.5, y: 65.5, w: 6.5, h: 7.5 },
    { id: 'vase', label: 'Un vase', x: 38, y: 73, w: 5, h: 14 },
    { id: 'radio', label: 'Une radio', x: 31, y: 75, w: 6.8, h: 13 },
    { id: 'theiere', label: 'Une théière', x: 35.5, y: 88, w: 7.5, h: 12 },
    { id: 'valise', label: 'Une valise', x: 16, y: 79, w: 9, h: 21 },
    { id: 'cadre', label: 'Un cadre', x: 25.3, y: 82, w: 6.4, h: 18 },
    { id: 'cartons', label: 'Des cartons', x: 7.5, y: 62.5, w: 8.5, h: 7.5 },
    { id: 'pichet', label: 'Un pichet', x: 43.4, y: 77, w: 4.6, h: 10 },
    { id: 'carafe', label: 'Une carafe', x: 45.2, y: 67, w: 3.8, h: 9.5 },
    { id: 'casserole', label: 'Une casserole', x: 51, y: 73, w: 6.5, h: 6 },
    { id: 'boite2', label: 'Une boîte', x: 50, y: 79.5, w: 8, h: 5 },
    { id: 'assiette', label: 'Une assiette', x: 44.5, y: 94, w: 13.5, h: 6 },
  ];
  /* l'étiquette au-dessus d'une zone ; sous la lampe (au-dessus, elle toucherait la bulle de consigne) */
  const ou = z => (z.id === 'lampe' ? { ...z, y: z.y + z.h + 5 } : z);

  /* 2 · la règle des prix */
  const MIN = 1, MAX = 20, PREMIER = 15;
  /* 3 · l'argent */
  const FINAL = 12;
  const MONNAIE = [{ v: 1, c: 'piece blanche', t: '1' + NB + '€' }, { v: 2, c: 'piece deux', t: '2' + NB + '€' },
    { v: 5, c: 'billet cinq', t: '5' + NB + '€' }, { v: 10, c: 'billet dix', t: '10' + NB + '€' }, { v: 20, c: 'billet vingt', t: '20' + NB + '€' }];
  const LAMPE = `<svg viewBox="0 0 60 70" aria-hidden="true"><path d="M16 6h28l10 26H6z" fill="#F6F0E2" stroke="#C9BFA8" stroke-width="2" stroke-linejoin="round"/>
      <path d="M28 32h4v26h-4z" fill="#8A5A36"/><ellipse cx="30" cy="62" rx="14" ry="5" fill="#6E4527"/></svg>`;

  return {
    plans: [{ de: 0, cx: { vendeuse: .26, client: .69 } }, { de: 1.958, cx: { vendeuse: .4, client: .97 } }, { de: 3.917, cx: { vendeuse: .02, client: .63 } },
      { de: 6.917, cx: { vendeuse: .4, client: .97 } }, { de: 8.917, cx: { vendeuse: .24, client: .71 } }],
    /* le stand, en bas à gauche de l'image : la vidéo se resserre dessus pour la question 1 */
    crops: { stand: { a: 16 / 9, h: .62, cx: .33, cy: 1 }, standTall: { a: 1.4, h: .64, cx: .325, cy: 1 } },
    ordre: ['objet', 'prix', 'payer'],
    bravo: 'Bravo' + NB + '! Le monsieur a sa lampe pour douze euros.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, phrase, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, zones, cam, avant, cadreZone, marque, gel,
        frameTo, CROPS, focus, wait, win } = A;
      /* 1 · le stand en grand (sur un téléphone tenu droit : plus haut), pour chercher l'objet */
      const STANDS = [CROPS.stand, CROPS.standTall];
      const stand = () => frameTo(document.body.classList.contains('tall') ? CROPS.standTall : CROPS.stand, false);
      addEventListener('resize', () => { if (STANDS.includes(state.crop)) stand(); });     // après le moteur (qui pose body.tall)
      /* tant qu'on regarde le stand, la bulle de consigne ne cache pas les objets : en haut de la vidéo (écran large), sous les
         boutons (téléphone tenu droit) */
      let pos = null;
      (function bulle() {
        const B = document.body, on = STANDS.includes(state.crop);
        if (on) {
          const t = parseFloat(win.style.top) || 0, h = parseFloat(win.style.height) || 0;
          const y = (B.classList.contains('tall') ? t + h + 16 + 52 + 14 : t + (B.classList.contains('short') ? 10 : 18)) + 'px';
          if (y !== pos) { pos = y; B.style.setProperty('--br-bulle', y); }
        }
        if (B.classList.contains('br-bulle') !== on) B.classList.toggle('br-bulle', on);
        requestAnimationFrame(bulle);
      })();
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · « Elle coûte combien, cette lampe ? » : sur le stand, dans l'image, on clique sur l'objet */
        async objet(f) {
          const SEG = ligne(0);
          /* réécouter : la vidéo se resserre sur lui le temps de la réplique, puis revient sur le stand */
          const reecouter = async () => {
            cam.classList.remove('asking'); focus('client', false);
            await playSegment(SEG[0], SEG[1], gel()); if (!alive(f)) return false;
            stand(); await wait(700); return alive(f);
          };
          /* comme faux() du moteur, mais la réplique rejouée resserrée sur lui */
          const rate = async msg => {
            state.essais++; sfx.try(); Q.show('try', msg);
            await wait(1300); if (!alive(f)) return null;
            if (!await reecouter()) return null;
            return state.essais >= 2;
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="valise"]', cam)), 5000); };
          if (!await avant(f, {
            qui: 'client', seg: SEG, consigne: 'Le monsieur demande le prix de quel objet' + NB + "? Clique dessus dans l'image.",
            monte: () => { stand(); zones(OBJETS, choisir); },
          })) return;
          state.replay = async () => { setTurn('listen'); if (await reecouter()) ask(); };
          async function choisir(id, ev, z) {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.ok) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(ou(z), z.label, 'juste');
              if (!await juste(f, 'Oui' + NB + '! Elle coûte combien, cette lampe' + NB + '?')) return;
              zones(null); suite();
            } else {
              const c = cadreZone(z, 'faux'), m = marque(ou(z), z.label, 'faux');
              const montrer = await rate('Non' + NB + ": ça, c'est " + z.label.toLowerCase() + '.'); if (montrer === null) return;
              c.remove(); m.remove();
              if (montrer) $('.hit[data-id="lampe"]', cam).classList.add('indice');
              ask();
            }
          }
          ask();
        },

        /* 2 · « Quinze euros. Elle marche très bien. » : on fait glisser le curseur de la règle jusqu'au prix, puis Valider */
        async prix(f) {
          const SEG = [phrase('elle coûte combien')[0], ligne(1)[1]];
          let v = MIN, bouge = false, fini = false;
          const regle = () => $('#regle', side);
          const peindre = () => {
            const r = regle(); if (!r) return;
            const pc = (v - MIN) / (MAX - MIN) * 100;
            r.style.setProperty('--pc', pc + '%'); r.setAttribute('aria-valuenow', v); r.setAttribute('aria-valuetext', euros(v));
            $('#prix', side).textContent = bouge ? v : '?';
          };
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            idle.set(() => {                                   // le doigt fantôme fait glisser le curseur un peu (pas jusqu'au prix)
              const c = $('.br-curseur', side), r = regle(); if (!c || !r) return null;
              const a = c.getBoundingClientRect(), b = r.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = Math.min(x1 + b.width * .22, b.right - 10);
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y1, 1, .82), at(x2, y1, 1), at(x2, y1, 0)];
            }, 5000);
          };
          const regler = n => { n = Math.max(MIN, Math.min(MAX, n)); if (n !== v) sfx.tick(); v = n; bouge = true; $('#etiq', side).classList.remove('faux', 'juste'); peindre(); };
          const depuisX = x => { const b = $('.br-rail', side).getBoundingClientRect(); return Math.round(MIN + (x - b.left) / b.width * (MAX - MIN)); };
          async function valider() {
            if (!tour() || fini) return;
            if (!bouge) { secouer(regle()); Q.show('you', 'Fais glisser le curseur.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const e = $('#etiq', side);
            if (v === PREMIER) {
              fini = true; e.classList.add('juste'); regle().classList.remove('indice');
              if (!await juste(f, 'Oui' + NB + '! Quinze euros.')) return;
              suite();
            } else {
              e.classList.add('faux'); secouer(e);
              const msg = v === 10 ? 'Non' + NB + ': dix euros, c\'est le prix du monsieur.' : 'Pas ' + enLettres(v) + ' euros.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              e.classList.remove('faux');
              if (montrer) {                                   // deux essais : le curseur va sur quinze
                fini = true; v = PREMIER; bouge = true; peindre(); e.classList.add('juste');
                Q.show('ok', 'Au début, la lampe coûte quinze euros.'); state.essais = 0; suite();
              } else ask();
            }
          }
          const graduations = Array.from({ length: MAX - MIN + 1 }, (_, k) => {
            const n = MIN + k, pc = k / (MAX - MIN) * 100, fort = n === MIN || n % 5 === 0;
            return `<span class="br-trait${fort ? ' fort' : ''}" style="left:${pc}%"></span>${fort ? `<span class="br-num" style="left:${pc}%">${n}</span>` : ''}`;
          }).join('');
          if (!await avant(f, {
            qui: 'vendeuse', seg: SEG, gel: 2.4, sideW: 500,
            consigne: 'Au début, la lampe coûte combien' + NB + '? Fais glisser le curseur, puis clique sur Valider.',
            panneau: `<div class="panel glass broc"><p class="ptitre">Fais glisser le curseur jusqu'au prix de la lampe.</p>
              <div class="br-objet"><span class="br-lampe">${LAMPE}</span><span class="br-ficelle" aria-hidden="true"></span>
                <div class="br-etiq" id="etiq" aria-live="polite"><span class="trou" aria-hidden="true"></span><b id="prix">?</b><small>€</small></div></div>
              <div class="br-regle" id="regle" role="slider" tabindex="0" aria-label="Le prix de la lampe, en euros" aria-valuemin="${MIN}" aria-valuemax="${MAX}" aria-valuenow="${MIN}">
                <div class="br-rail"><span class="br-rempli"></span>${graduations}<span class="br-curseur" aria-hidden="true"></span></div></div></div>`,
            monte: p => {
              const r = $('#regle', p); let st = null;
              peindre();
              r.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                st = e.pointerId; r.classList.add('tire');
                try { r.setPointerCapture(e.pointerId); } catch (err) {}
                regler(depuisX(e.clientX));
              });
              r.addEventListener('pointermove', e => { if (st === e.pointerId) regler(depuisX(e.clientX)); });
              const lacher = e => { if (st !== e.pointerId) return; st = null; r.classList.remove('tire'); };
              r.addEventListener('pointerup', lacher); r.addEventListener('pointercancel', lacher);
              r.addEventListener('keydown', e => {
                if (!tour() || fini) return;
                const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
                if (d) { e.preventDefault(); A.unlock(); idle.reset(); regler(v + d); }
                else if (e.key === 'Enter') { e.preventDefault(); valider(); }
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 3 · « C'est trop cher pour moi. Dix euros ? — Allez, douze euros et elle est à vous. » : on pose l'argent, puis Payer */
        async payer(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let total = 0, fini = false;
          const argent = (m, k) => `<button class="argent ${m.c}" data-v="${m.v}" data-k="${k}" aria-label="${m.t}">${m.t}</button>`;
          const maj = () => { total = [...$$('#posees .argent', side)].reduce((s, b) => s + +b.dataset.v, 0); $('#somme', side).textContent = total; $('#plateau', side).classList.remove('faux'); };
          const poser = k => {
            const box = document.createElement('div'); box.innerHTML = argent(MONNAIE[k], k); const b = box.firstChild;
            b.setAttribute('aria-label', 'Reprendre ' + MONNAIE[k].t);
            $('#posees', side).append(b); maj();
            b.addEventListener('click', () => { if (!tour() || fini) return; sfx.tick(); b.remove(); maj(); });
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Payer', valider); yourTurn(); idle.set(tapHere($('.bourse .argent[data-v="5"]', side)), 5000); };
          async function valider() {
            if (!tour() || fini) return;
            if (!total) { secouer($('#plateau', side)); Q.show('you', "Pose l'argent sur la table."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const pl = $('#plateau', side);
            if (total === FINAL) {
              fini = true; pl.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Douze euros, et la lampe est à lui.')) return;
              suite();
            } else {
              pl.classList.add('faux'); secouer(pl);
              const msg = total === 10 ? 'Non' + NB + ": dix euros, c'est le prix du monsieur."
                : total === 15 ? 'Non' + NB + ": quinze euros, c'est trop cher pour lui."
                : 'Pas ' + enLettres(total) + ' euros.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              pl.classList.remove('faux');
              if (montrer) {                                   // deux essais : on pose un billet de 10 € et une pièce de 2 €
                fini = true; $('#posees', side).innerHTML = ''; poser(3); poser(1); pl.classList.add('juste');
                Q.show('ok', 'Douze euros' + NB + ': un billet de dix et une pièce de deux.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'vendeuse', seg: SEG, gel: 7.2, sideW: 460,
            consigne: 'À la fin, le monsieur paie combien' + NB + "? Pose l'argent, puis clique sur Payer.",
            panneau: `<div class="panel glass broc"><p class="ptitre">Pose l'argent sur la table. Clique sur un billet ou une pièce.</p>
              <div class="plateau br-table" id="plateau"><div class="somme" aria-live="polite"><span id="somme">0</span><small>€</small></div><div class="posees" id="posees"></div></div>
              <div class="bourse br-bourse" role="group" aria-label="Le porte-monnaie du monsieur">${MONNAIE.map(argent).join('')}</div></div>`,
            monte: p => $$('.bourse .argent', p).forEach(b => b.addEventListener('click', () => {
              if (!tour() || fini) return;
              A.unlock(); idle.reset(); sfx.coin(); poser(+b.dataset.k);
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { client: 'la lampe' + A.NB + ': 12' + A.NB + '€' },
      faits: {
        client: [{ text: 'Elle coûte combien, cette lampe' + A.NB + '?', seg: A.phrase('elle coûte combien cette lampe') },
          { text: "C'est trop cher pour moi. Dix euros" + A.NB + '?', seg: A.ligne(2) }],
        vendeuse: [{ text: 'Quinze euros. Elle marche très bien.', seg: A.ligne(1) }, { text: 'Allez, douze euros et elle est à vous.', seg: A.ligne(3) }],
      },
    }),
  };
})();
