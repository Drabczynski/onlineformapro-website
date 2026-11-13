/* À la laverie : la dame redit comment ça marche (la vidéo resserrée sur elle) ; puis, sur une image où elle ne montre
   encore rien (2,2 s : les mains sur ses serviettes, les machines à gauche), on touche sur les vraies machines où va le
   linge (le grand tambour), puis où va la lessive (en haut). Enfin elle redit le prix : on glisse les pièces du
   porte-monnaie dans la fente d'une machine dessinée, son petit écran compte, et on la démarre. */
window.SCENARIO = (() => {
  const GEL_MACHINES = 2.2;
  /* sur l'image à 2,2 s, en % : trois machines (le haut avec le bac et l'écran, le tambour), la borne au mur, la table */
  const ZONES = [
    { id: 'tambourB', label: 'Le grand tambour', quoi: 'tambour', x: 12, y: 63, w: 15, h: 37 },
    { id: 'tambourC', label: 'Le grand tambour', quoi: 'tambour', x: 30, y: 60.5, w: 10.5, h: 34 },
    { id: 'tambourA', label: 'Le grand tambour', quoi: 'tambour', x: 0, y: 68, w: 9, h: 32 },
    { id: 'hautB', label: 'En haut de la machine', quoi: 'haut', x: 10, y: 46.5, w: 18, h: 14.5 },
    { id: 'hautC', label: 'En haut de la machine', quoi: 'haut', x: 28.5, y: 46, w: 12, h: 14.5 },
    { id: 'hautA', label: 'En haut de la machine', quoi: 'haut', x: 0, y: 47, w: 9.5, h: 14 },
    { id: 'borne', label: 'La borne pour payer', quoi: 'borne', x: 41.7, y: 25, w: 8.6, h: 25 },
    { id: 'table', label: 'La table', quoi: 'table', x: 77, y: 79, w: 23, h: 21 },
  ];
  const PAS = { haut: 'Pas en haut.', tambour: 'Pas dans le tambour.', table: 'Pas sur la table.', borne: "Non, ça, c'est pour payer." };
  const ETIQ = { haut: 'En haut', tambour: 'Le tambour', table: 'La table', borne: 'Pour payer' };
  const milieu = z => ({ ...z, y: z.y + z.h * .55 });          // une étiquette au milieu du tambour, pas sur le haut

  /* la machine dessinée : le porte-monnaie (6 pièces, 7 €), l'écran qui compte, la fente, le hublot */
  const BOURSE = [2, 2, 1, 1, .5, .5];
  const NB_ = ' ';
  const PIECE = { 2: { c: 'piece deux', t: '2' + NB_ + '€' }, 1: { c: 'piece un', t: '1' + NB_ + '€' }, .5: { c: 'piece', t: '50' + NB_ + 'c' } };
  const ecranTxt = v => v.toFixed(2).replace('.', ',');
  const euros = v => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));
  const HUBLOT = `<svg viewBox="0 0 160 160" aria-hidden="true"><defs><clipPath id="lm-verre"><circle cx="80" cy="80" r="58"/></clipPath></defs>
      <circle cx="80" cy="80" r="76" fill="#DDE2E7" stroke="#A9B1BA" stroke-width="2"/><circle cx="80" cy="80" r="66" fill="#C3CAD2"/>
      <circle cx="80" cy="80" r="58" fill="#24405A"/>
      <g clip-path="url(#lm-verre)"><g class="lm-linge">
        <path d="M14 98q16-12 33-3t33 0 33-3 33 3V160H14z" fill="#3AA8FF"/>
        <path d="M14 112q16-9 33 0t33 0 33 0 33 0V160H14z" fill="#E5383B"/>
        <path d="M14 126q16-8 33 0t33 0 33 0 33 0V160H14z" fill="#FFD24A"/>
      </g></g>
      <path d="M44 56a44 44 0 0 1 30-22" stroke="rgba(255,255,255,.5)" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`;

  return {
    plans: [{ de: 0, cx: { homme: .4, dame: .7 } }, { de: 2.177, cx: { homme: .5, dame: .64 } }, { de: 4.385, cx: { homme: .33, dame: .4 } },
      { de: 5.135, cx: { homme: .15, dame: .65 } }, { de: 7.968, cx: { homme: .38, dame: .7 } }],
    crops: { fullTall: { a: 4 / 3, h: 1, cx: .42, cy: .5 } },       // sur un téléphone en hauteur : un peu plus à gauche, pour garder les machines
    ordre: ['machine', 'payer'],
    bravo: 'Bravo' + NB_ + '! Le jeune homme peut laver son linge.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel, reduced } = A;
      const LINGE = ligne(1), LESSIVE = phrase('et la lessive en haut');
      const PRIX = [ligne(2)[0], ligne(3)[1]], QUATRE = [ligne(2)[0], phrase('quatre euros')[1]];
      return {
        /* 1 · dans la vidéo : où va le linge (le grand tambour), puis la lessive (en haut) */
        async machine(f) {
          let partie = 1;
          const seg = () => (partie === 1 ? LINGE : LESSIVE);
          const bon = z => z.quoi === (partie === 1 ? 'tambour' : 'haut');
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="table"]', cam)), 5000); };
          if (!await avant(f, { question: 'Écoute la dame.', qui: 'dame', seg: LINGE, gel: GEL_MACHINES, consigne: 'Où va le linge' + NB + '? Clique au bon endroit.' })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(seg()[0], seg()[1], gel()); if (alive(f)) ask(); };
          zones(ZONES, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (bon(z) && partie === 1) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              const c = cadreZone(z), m = marque(milieu(z), 'Le linge', 'juste');
              if (!await juste(f, 'Oui' + NB + '! Le linge va dans le grand tambour.')) return;
              await wait(1100); if (!alive(f)) return;
              c.remove(); m.remove(); partie = 2;
              await playSegment(LESSIVE[0], LESSIVE[1], gel()); if (!alive(f)) return;
              state.ask = 'Et la lessive' + NB + '? Clique au bon endroit.';
              if (!await Q.say(state.ask, f)) return;
              ask();
            } else if (bon(z)) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              const t = ZONES.find(x => x.id === 'tambour' + id.slice(-1));
              cadreZone(z); marque(z, 'La lessive', 'juste'); cadreZone(t); marque(milieu(t), 'Le linge', 'juste');
              if (!await juste(f, 'Oui' + NB + '! La lessive va en haut.')) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z.quoi === 'tambour' ? milieu(z) : z, ETIQ[z.quoi], 'faux');
              const montrer = await faux(f, seg(), PAS[z.quoi] + ' Écoute encore.'); if (montrer === null) return;
              if (montrer) ZONES.filter(bon).forEach(x => $(`.hit[data-id="${x.id}"]`, cam).classList.add('indice'));
              ask();
            }
          });
          ask();
        },

        /* 2 · payer : la dame redit le prix ; on glisse les pièces dans la fente (ou on clique dessus), l'écran compte, Démarrer */
        async payer(f) {
          let total = 0;
          const vols = new Set();
          const fente = () => $('#fente', side);
          const maj = () => { const e = $('#compte', side); if (e) e.textContent = ecranTxt(total); };
          const surFente = (x, y) => { const r = fente().getBoundingClientRect(); return x > r.left - 34 && x < r.right + 34 && y > r.top - 34 && y < r.bottom + 34; };
          const volant = (b, r) => {
            const v = document.createElement('div'); v.className = 'volant lm-vol'; v.innerHTML = `<span class="${b.className.replace(' pris', '')}">${b.textContent}</span>`;
            Object.assign(v.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); document.body.append(v); return v;
          };
          /* la pièce entre dans la fente : elle y va, se met de chant et disparaît ; l'écran compte */
          const glisser = (b, v) => {
            if (!fente()) { if (v) v.remove(); return Promise.resolve(); }
            b.classList.add('pris');
            v = v || volant(b, b.getBoundingClientRect());
            const a = v.getBoundingClientRect(), r = fente().getBoundingClientRect();
            const dx = r.left + r.width / 2 - (a.left + a.width / 2), dy = r.top + r.height / 2 - (a.top + a.height / 2);
            const an = v.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(.7)`, offset: .62 }, { transform: `translate(${dx}px, ${dy + 10}px) scale(.12, .6)`, opacity: .2 }],
              { duration: reduced ? 1 : 460, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
            const p = an.finished.catch(() => {}).then(() => {
              v.remove(); vols.delete(p); total = Math.round((total + +b.dataset.v) * 100) / 100; maj(); sfx.coin();
              const e = $('#ecran', side); if (e) { e.classList.remove('compte'); void e.offsetWidth; e.classList.add('compte'); }
            });
            vols.add(p); return p;
          };
          const rendre = () => { $$('.lm-bourse .argent.pris', side).forEach(b => b.classList.remove('pris')); total = 0; maj(); };
          const brancher = p => {
            $$('.lm-bourse .argent', p).forEach(b => {
              let d = null;
              b.addEventListener('pointerdown', e => {
                if (document.body.dataset.turn !== 'you' || b.classList.contains('pris')) return;
                A.unlock(); idle.reset(); e.preventDefault(); b.setPointerCapture(e.pointerId);
                d = { x: e.clientX, y: e.clientY, v: null, r: b.getBoundingClientRect() };
              });
              b.addEventListener('pointermove', e => {
                if (!d) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                if (!d.v && Math.hypot(dx, dy) > 6) { d.v = volant(b, d.r); b.classList.add('pris'); sfx.tick(); }
                if (d.v) { d.v.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`; fente().classList.toggle('vise', surFente(e.clientX, e.clientY)); }
              });
              const lacher = e => {
                if (!d) return;
                const g = d; d = null; b.dataset.tap = '1'; setTimeout(() => delete b.dataset.tap, 400); if (fente()) fente().classList.remove('vise');
                if (!g.v) { glisser(b); return; }                                   // un simple clic : la pièce y va toute seule
                if (e.type !== 'pointercancel' && surFente(e.clientX, e.clientY)) { glisser(b, g.v); return; }
                const an = g.v.animate([{ transform: g.v.style.transform }, { transform: 'none' }], { duration: reduced ? 1 : 300, easing: 'cubic-bezier(.3,.7,0,1)', fill: 'forwards' });
                an.finished.catch(() => {}).then(() => { g.v.remove(); b.classList.remove('pris'); });
              };
              b.addEventListener('pointerup', lacher); b.addEventListener('pointercancel', lacher);
              b.addEventListener('click', e => {                                      // au clavier (Entrée, Espace)
                if (b.dataset.tap) { delete b.dataset.tap; return; }
                if (e.detail !== 0 || document.body.dataset.turn !== 'you' || b.classList.contains('pris')) return;
                A.unlock(); idle.reset(); glisser(b);
              });
            });
            $('#rendre', p).addEventListener('click', () => { if (document.body.dataset.turn !== 'you' || !total) return; A.unlock(); idle.reset(); sfx.tick(); rendre(); });
          };
          const fantome = () => {
            const c = $('.lm-bourse .argent:not(.pris)[data-v="0.5"]', side) || $('.lm-bourse .argent:not(.pris)', side), s = fente();
            if (!c || !s) return null;
            const a = c.getBoundingClientRect(), r = s.getBoundingClientRect(), x = a.left + a.width / 2, y = a.top + a.height / 2, x2 = r.left + r.width / 2, y2 = r.top + r.height / 2;
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Démarrer', valider); yourTurn(); idle.set(fantome, 4500); };
          if (!await avant(f, {
            question: 'Écoute encore la dame.', qui: 'dame', seg: PRIX, sideW: 460, consigne: 'Glisse les pièces dans la machine, puis clique sur démarrer.',
            panneau: `<div class="panel glass lav"><p class="ptitre">Glisse les pièces dans la machine</p>
              <div class="lm" id="lm">
                <div class="lm-haut"><span class="lm-bac" aria-hidden="true"></span>
                  <div class="lm-ecran" id="ecran" role="status"><b id="compte">0,00</b><small>€</small></div>
                  <div class="lm-fente" id="fente" aria-hidden="true"><i></i><small>€</small></div></div>
                <div class="lm-bas"><div class="lm-hublot" id="hublot">${HUBLOT}</div>
                  <button class="lm-rendre" id="rendre" aria-label="Rendre les pièces"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg><span>Rendre</span></button></div>
              </div>
              <div class="lm-bourse" role="group" aria-label="Le porte-monnaie">${BOURSE.map((v, k) => `<button class="argent ${PIECE[v].c}" data-v="${v}" data-k="${k}" aria-label="Mettre ${PIECE[v].t}">${PIECE[v].t}</button>`).join('')}</div></div>`,
            monte: brancher,
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(PRIX[0], PRIX[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            setTurn('wait'); goBtn(null); idle.clear();
            await Promise.all([...vols]); if (!alive(f)) return;
            if (!total) { ask(); Q.show('you', 'Glisse les pièces dans la machine.'); return; }
            const ec = $('#ecran', side);
            if (total === 4) {
              ec.classList.add('juste'); $('#hublot', side).classList.add('tourne');
              if (!await juste(f, 'Oui' + NB + '! Quatre euros.', phrase('quatre euros'))) return;
              suite();
            } else {
              ec.classList.add('faux'); const lm = $('#lm', side); lm.classList.remove('shake'); void lm.offsetWidth; lm.classList.add('shake');
              const msg = euros(total) + NB + '€, ' + (total < 4 ? "ce n'est pas assez." : "c'est trop.") + ' Écoute encore.';
              const montrer = await faux(f, QUATRE, msg); if (montrer === null) return;
              ec.classList.remove('faux'); rendre();
              if (montrer) {
                const deux = $$('.lm-bourse .argent[data-v="2"]', side);
                for (const b of deux) { await glisser(b); if (!alive(f)) return; await wait(120); }
                ec.classList.add('juste'); Q.show('ok', 'Quatre euros' + NB + ': deux pièces de 2' + NB + '€.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        homme: [{ text: 'Comment ça marche' + A.NB + '?', seg: A.ligne(0) }, { text: "C'est combien" + A.NB + '?', seg: A.ligne(2) }],
        dame: [{ text: 'le linge dans le grand tambour', seg: A.phrase('le linge ici dans le grand tambour') }, { text: 'la lessive en haut', seg: A.phrase('et la lessive en haut') },
          { text: 'quatre euros, dans la machine', seg: A.ligne(3) }],
      },
    }),
  };
})();
