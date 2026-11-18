/* Chez le glacier : la cliente dit « Deux boules, s'il vous plaît. Vanille et chocolat. », puis « En cornet. ».
   1 · elle redit sa commande (la vidéo resserrée sur elle) ; puis la vidéo se resserre sur la vitrine (l'image à 1,5 s : personne
       ne tient de glace) et on touche les deux vrais bacs de ses parfums : la vanille (crème) et le chocolat (le bac marron du
       devant, le plus foncé). Pièges : la menthe, la fraise, le citron ; chaque bac touché dit son nom. Les autres bacs (au fond,
       derrière les étiquettes) ne sont pas cliquables. La bulle de consigne passe en haut de la vidéo (les bacs sont en bas).
   2 · on réentend « En cornet ou en pot ? » « En cornet. » ; à côté, on fait glisser ses deux boules dans le cornet ou dans le
       pot (un clic sur le cornet ou sur le pot les y pose aussi).
   La fin de la vidéo (il lui tend la glace) n'est jamais l'image figée. */
window.SCENARIO = (() => {
  const VANILLE = { id: 'vanille', c: '#F6E6B4', o: '#DFC27A' }, CHOCOLAT = { id: 'chocolat', c: '#7B4B2F', o: '#58311C' };
  const GRAINS = '<g fill="#5A3B22" opacity=".7"><circle cx="48" cy="22" r="1.4"/><circle cx="60" cy="30" r="1.3"/><circle cx="40" cy="34" r="1.3"/><circle cx="66" cy="40" r="1.2"/><circle cx="27" cy="40" r="1.2"/><circle cx="53" cy="42" r="1.3"/><circle cx="35" cy="19" r="1.1"/></g>';
  /* une boule de glace (vue de face, le bord qui coule un peu) */
  const BOULE = p => `<svg viewBox="0 0 90 70" aria-hidden="true">
      <path d="M10 46A35 35 0 0 1 80 46C82 54 76 60 70 56C66 63 58 64 54 58C50 65 40 65 36 58C32 64 24 63 20 56C14 60 8 54 10 46Z" fill="${p.c}"/>
      <path d="M10 46C8 54 14 60 20 56C24 63 32 64 36 58C40 65 50 65 54 58C58 64 66 63 70 56C76 60 82 54 80 46C76 51 70 52 66 49C60 55 51 55 45 50C39 55 30 55 24 49C20 52 13 51 10 46Z" fill="${p.o}"/>
      <ellipse cx="30" cy="25" rx="9" ry="5.5" fill="#fff" opacity=".42" transform="rotate(-28 30 25)"/>${p.id === 'vanille' ? GRAINS : ''}</svg>`;
  const DUO = `<span class="gl-duo"><span class="gl-boule">${BOULE(VANILLE)}</span><span class="gl-boule">${BOULE(CHOCOLAT)}</span></span>`;
  /* le cornet gaufré */
  const CONE = `<svg class="gl-svg cone" viewBox="0 0 110 150" aria-hidden="true"><defs><clipPath id="gl-cone"><path d="M9 14 55 147 101 14z"/></clipPath></defs>
      <path d="M9 14 55 147 101 14z" fill="#E2A65C"/>
      <g clip-path="url(#gl-cone)" stroke="#B97835" stroke-width="2.6" stroke-linecap="round" fill="none">${[...Array(9).keys()].map(k => `<path d="M${-70 + k * 22} 14l100 140M${180 - k * 22} 14l-100 140"/>`).join('')}</g>
      <rect x="3" y="4" width="104" height="19" rx="9.5" fill="#CF8D45"/><path d="M12 9.5h86" stroke="#F2C58C" stroke-width="3" stroke-linecap="round"/></svg>`;
  /* le pot en carton, avec sa cuillère */
  const POT = `<svg class="gl-svg pot" viewBox="0 0 130 100" aria-hidden="true">
      <path d="M96 4 84 40" stroke="#E7C08A" stroke-width="7" stroke-linecap="round"/>
      <path d="M12 22h106l-13 70a7 7 0 0 1-7 6H32a7 7 0 0 1-7-6z" fill="#FDFBF6"/>
      <path d="M17 46h96l-3.4 18H20.4z" fill="#F28AB0"/><path d="M22.4 74h85.2l-1.6 9H24z" fill="#F28AB0"/>
      <rect x="5" y="14" width="120" height="15" rx="7.5" fill="#E9E3D6"/></svg>`;
  /* les bacs de la vitrine, sur l'image à 1,5 s (en %) ; « bas » : un bac du devant, l'étiquette se pose dedans */
  const BACS = [
    { id: 'menthe', nom: 'la menthe', label: 'La menthe', bas: true, x: 16.2, y: 96, w: 7.2, h: 4 },
    { id: 'chocolat', nom: 'le chocolat', label: 'Le chocolat', ok: true, bas: true, x: 23.0, y: 93.9, w: 13.1, h: 6.1 },
    { id: 'vanille', nom: 'la vanille', label: 'La vanille', ok: true, x: 28.4, y: 88.8, w: 9.6, h: 5.1 },
    { id: 'fraise', nom: 'la fraise', label: 'La fraise', bas: true, x: 41.7, y: 94.6, w: 11.1, h: 5.4 },
    { id: 'citron', nom: 'le citron', label: 'Le citron', x: 44.9, y: 90.4, w: 11.5, h: 4.2 },
  ];
  const cap = s => s[0].toUpperCase() + s.slice(1);

  return {
    plans: [{ de: 0, cx: { vendeur: .26, cliente: .75 } }, { de: 1.875, cx: { vendeur: .3, cliente: .6 } }, { de: 5, cx: { vendeur: .4, cliente: .9 } },
      { de: 6.958, cx: { vendeur: .3, cliente: .6 } }, { de: 7.958, cx: { vendeur: .26, cliente: .75 } }],
    /* la vitrine, en bas de l'image : une fenêtre large, resserrée sur les bacs (sur un téléphone tenu droit : plus haute) */
    crops: { vitrine: { a: 2.4, h: .31, cx: .362, cy: 1 }, vitrineTall: { a: 1.25, h: .58, cx: .362, cy: 1 } },
    ordre: ['parfums', 'cornet'],
    bravo: 'Miam ! Voilà sa glace : vanille et chocolat, en cornet.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, frameTo, CROPS, focus, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, wait, zones, cam, avant, cadreZone, marque, gel, win } = A;
      const CMD = [ligne(1)[0], Math.min(ligne(1)[1], 4.97)];     // « Deux boules, s'il vous plaît. Vanille et chocolat. » (sans l'image du plan suivant)
      const CHOIX = [ligne(2)[0], ligne(3)[1]];                   // « En cornet ou en pot ? » « En cornet. » (avant le plan large où on voit la glace)
      const VITRINES = [CROPS.vitrine, CROPS.vitrineTall];
      const vitrine = () => frameTo(document.body.classList.contains('tall') ? CROPS.vitrineTall : CROPS.vitrine, false);
      addEventListener('resize', () => { if (VITRINES.includes(state.crop)) vitrine(); });     // après le moteur (qui pose body.tall)

      /* la bulle de consigne en haut de la vidéo tant qu'on regarde la vitrine (le moteur la pose en bas, sur les bacs) */
      let haut = null;
      (function bulle() {
        const B = document.body, on = VITRINES.includes(state.crop);
        if (on) { const y = (parseFloat(win.style.top) || 0) + (B.classList.contains('short') ? 10 : B.classList.contains('wide') ? 18 : 10) + 'px'; if (y !== haut) { haut = y; B.style.setProperty('--gl-haut', y); } }
        if (B.classList.contains('gl-haut') !== on) B.classList.toggle('gl-haut', on);
        requestAnimationFrame(bulle);
      })();

      return {
        /* 1 · elle redit sa commande ; dans la vitrine, on touche les bacs de ses deux parfums */
        async parfums(f) {
          const trouves = new Set();
          let relance = null;
          /* réécouter : la vidéo se resserre sur elle le temps de la réplique, puis revient sur la vitrine */
          const reecouter = async () => {
            cam.classList.remove('asking'); focus('cliente', false);
            await playSegment(CMD[0], CMD[1], gel()); if (!alive(f)) return false;
            vitrine(); await wait(700); return alive(f);
          };
          /* comme faux() du moteur, mais le temps de lire le nom du bac, et la réplique rejouée resserrée sur elle */
          const rate = async msg => {
            state.essais++; sfx.try(); Q.show('try', msg);
            await wait(1500); if (!alive(f)) return null;
            if (!await reecouter()) return null;
            return state.essais >= 2;
          };
          const etiquette = (z, cls) => marque(z.bas ? { ...z, y: z.y + z.h, h: 0 } : z, z.label, cls);
          const ask = () => { Q.show('you', relance || state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="fraise"]', cam)), 5000); };
          if (!await avant(f, {
            qui: 'cliente', seg: CMD, consigne: 'Elle veut quels parfums' + NB + '? Dans la vitrine, clique sur ses deux parfums.',
            monte: () => { vitrine(); zones(BACS, choisir); },
          })) return;
          state.replay = async () => { setTurn('listen'); if (await reecouter()) ask(); };
          async function choisir(id, ev, z) {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.ok) {
              trouves.add(id); state.essais = 0;
              const h = $(`.hit[data-id="${id}"]`, cam); if (h) h.remove();
              $$('.hit', cam).forEach(x => x.classList.remove('indice'));
              cadreZone(z); etiquette(z, 'juste');
              if (trouves.size === 2) {
                zones(null);
                if (!await juste(f, 'Oui' + NB + '! Vanille et chocolat.')) return;
                suite(); return;
              }
              sfx.ok(); Q.show('ok', 'Oui' + NB + '! ' + cap(z.nom) + '.');
              await wait(1300); if (!alive(f)) return;
              relance = "Et l'autre parfum" + NB + '?';
              ask();
            } else {
              cadreZone(z, 'faux'); etiquette(z, 'faux');
              const montrer = await rate('Non' + NB + ": ça, c'est " + z.nom + '.'); if (montrer === null) return;
              if (montrer) BACS.filter(x => x.ok && !trouves.has(x.id)).forEach(x => $(`.hit[data-id="${x.id}"]`, cam).classList.add('indice'));
              ask();
            }
          }
          ask();
        },

        /* 2 · on réentend « En cornet ou en pot ? » « En cornet. » ; à côté, on fait glisser ses deux boules dans le cornet ou dans le pot */
        async cornet(f) {
          let pose = null;
          const CONT = { cornet: 'le cornet', pot: 'le pot' };
          const leg = t => { const l = $('#gl-leg', side); if (l) l.textContent = t; };
          const remplir = (id, neuve) => { $$('.gl-dessus', side).forEach(d => { d.innerHTML = d.closest('.gl-cont').dataset.id === id ? DUO : ''; d.classList.toggle('neuve', !!neuve); }); $('#gl-paire', side).classList.toggle('pris', !!id); };
          /* le doigt fantôme : prendre les boules et les faire glisser vers le bas, entre le cornet et le pot (sans choisir) */
          const glisser = () => {
            const a = $('#gl-paire', side), c = $('.gl-choix', side); if (!a || !c) return null;
            const r = a.getBoundingClientRect(), q = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, x2 = q.left + q.width / 2, y2 = q.top + q.height * .45;
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(glisser, 4500); };
          /* un clic sur le cornet ou sur le pot : les boules y volent */
          const voler = (de, vers) => new Promise(res => {
            const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), v = document.createElement('div');
            v.className = 'gl-vol'; v.innerHTML = DUO; document.body.append(v);
            const an = v.animate([{ left: a.left + a.width / 2 + 'px', top: a.top + a.height / 2 + 'px' }, { left: b.left + b.width / 2 + 'px', top: b.top - 30 + 'px' }],
              { duration: A.reduced ? 1 : 450, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
            an.finished.then(() => { v.remove(); res(); }, () => { v.remove(); res(); });
          });
          async function poser(id, depuis) {
            if (pose || document.body.dataset.turn !== 'you') return;
            pose = id; A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const cont = $(`.gl-cont[data-id="${id}"]`, side);
            if (depuis) { $('#gl-paire', side).classList.add('pris'); await voler(depuis, $('.gl-dessus', cont)); if (!alive(f)) return; }
            remplir(id, true); leg('En ' + (id === 'cornet' ? 'cornet' : 'pot'));
            if (id === 'cornet') {
              $$('.gl-cont', side).forEach(x => x.classList.remove('indice')); cont.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! En cornet.')) return;
              suite();
            } else {
              cont.classList.remove('shake'); void cont.offsetWidth; cont.classList.add('shake', 'faux');
              const montrer = await faux(f, CHOIX, 'Pas en pot' + NB + ': elle dit «' + NB + 'en cornet' + NB + '».'); if (montrer === null) return;
              cont.classList.remove('faux', 'shake'); remplir(null); leg(''); pose = null;
              if (montrer) $('.gl-cont[data-id="cornet"]', side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            seg: CHOIX, sideW: 480, consigne: 'En cornet ou en pot' + NB + '? Fais glisser les boules dans le bon.',
            panneau: `<div class="panel glass gl-pot"><p class="ptitre">En cornet ou en pot${NB}?</p>
              <div class="gl-depart"><button class="gl-paire" id="gl-paire" aria-label="Les deux boules : vanille et chocolat">${DUO}</button><span class="gl-nom">vanille et chocolat</span></div>
              <div class="gl-choix">${Object.entries(CONT).map(([id, nom]) => `<button class="gl-cont" data-id="${id}" aria-label="Mettre les boules dans ${nom}"><span class="gl-dessus"></span>${id === 'cornet' ? CONE : POT}<span class="gl-nom">${nom}</span></button>`).join('')}</div>
              <p class="legende" id="gl-leg" aria-live="polite"></p></div>`,
            monte: p => {
              const paire = $('#gl-paire', p), conts = $$('.gl-cont', p);
              const sous = e => conts.find(c => { const r = c.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
              let d = null, glisse = 0;
              paire.addEventListener('pointerdown', e => {
                if (document.body.dataset.turn !== 'you' || e.button > 0 || pose) return;
                A.unlock(); idle.reset(); d = { x: e.clientX, y: e.clientY, pid: e.pointerId, vol: null };
                try { paire.setPointerCapture(e.pointerId); } catch (er) { /* rien */ }
              });
              paire.addEventListener('pointermove', e => {
                if (!d || e.pointerId !== d.pid) return;
                if (!d.vol) {
                  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return;
                  d.vol = document.createElement('div'); d.vol.className = 'gl-vol'; d.vol.innerHTML = DUO; document.body.append(d.vol); paire.classList.add('tire');
                }
                d.vol.style.left = e.clientX + 'px'; d.vol.style.top = e.clientY + 'px';
                const c = sous(e); conts.forEach(x => x.classList.toggle('survol', x === c));
              });
              const lacher = e => {
                if (!d || e.pointerId !== d.pid) return;
                const { vol } = d; d = null; paire.classList.remove('tire'); conts.forEach(x => x.classList.remove('survol'));
                if (!vol) return;                                  // un simple clic : voir « click »
                glisse = performance.now();
                const c = e.type === 'pointerup' ? sous(e) : null;
                if (c && document.body.dataset.turn === 'you') { vol.remove(); poser(c.dataset.id); return; }
                const r = paire.getBoundingClientRect();
                const an = vol.animate([{ left: vol.style.left, top: vol.style.top, opacity: 1 }, { left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px', opacity: 0 }], { duration: A.reduced ? 1 : 380, easing: 'ease-in', fill: 'forwards' });
                an.finished.then(() => vol.remove(), () => vol.remove());
              };
              paire.addEventListener('pointerup', lacher); paire.addEventListener('pointercancel', lacher);
              /* un clic sur les boules : le doigt fantôme montre tout de suite le geste */
              paire.addEventListener('click', () => { if (performance.now() - glisse < 500 || document.body.dataset.turn !== 'you' || pose) return; A.unlock(); sfx.tick(); idle.reset(300); });
              conts.forEach(c => c.addEventListener('click', () => { if (performance.now() - glisse < 500) return; poser(c.dataset.id, paire); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(CHOIX[0], CHOIX[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        vendeur: [{ text: "Qu'est-ce que je vous sers" + A.NB + '?', seg: [A.ligne(0)[0], 1.86] }, { text: 'En cornet ou en pot' + A.NB + '?', seg: A.ligne(2) }],
        cliente: [{ text: 'deux boules', seg: A.phrase('deux boules') }, { text: 'vanille et chocolat', seg: [A.phrase('vanille et chocolat')[0], 4.97] }, { text: 'en cornet', seg: A.ligne(3) }],
      },
    }),
  };
})();
