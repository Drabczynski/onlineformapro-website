/* Chez le glacier : comme le vendeur, on prend d'abord le cornet, puis on met les boules dessus.
   1 · la cliente redit « en cornet » ; dans la vidéo (une image du début : personne ne tient encore de glace), on touche les
       vrais cornets de la boutique (il n'y a pas de pots à l'image : les autres choses touchables sont les bacs de glace, les
       serviettes, le menu).
   2 · elle redit sa commande (la vidéo resserrée sur elle) ; à côté, on prépare sa glace : on fait glisser les boules sur le
       cornet, exactement deux, vanille et chocolat, parmi six parfums (un clic sur un parfum pose aussi une boule).
   La fin de la vidéo (il lui tend la glace) n'est jamais l'image figée. */
window.SCENARIO = (() => {
  const PARFUMS = [
    { id: 'fraise', nom: 'Fraise', de: 'de fraise', c: '#F7A3B8', o: '#E27795' },
    { id: 'vanille', nom: 'Vanille', de: 'de vanille', c: '#F6E6B4', o: '#DFC27A', ok: true },
    { id: 'pistache', nom: 'Pistache', de: 'de pistache', c: '#BCD98E', o: '#93B962' },
    { id: 'cafe', nom: 'Café', de: 'de café', c: '#C29770', o: '#9A6E48' },
    { id: 'citron', nom: 'Citron', de: 'de citron', c: '#FFEF73', o: '#E6CC3A' },
    { id: 'chocolat', nom: 'Chocolat', de: 'de chocolat', c: '#7B4B2F', o: '#58311C', ok: true },
  ];
  const P = Object.fromEntries(PARFUMS.map(p => [p.id, p]));
  const GRAINS = '<g fill="#5A3B22" opacity=".7"><circle cx="48" cy="22" r="1.4"/><circle cx="60" cy="30" r="1.3"/><circle cx="40" cy="34" r="1.3"/><circle cx="66" cy="40" r="1.2"/><circle cx="27" cy="40" r="1.2"/><circle cx="53" cy="42" r="1.3"/><circle cx="35" cy="19" r="1.1"/></g>';
  /* une boule de glace (vue de face, le bord qui coule un peu) */
  const BOULE = p => `<svg viewBox="0 0 90 70" aria-hidden="true">
      <path d="M10 46A35 35 0 0 1 80 46C82 54 76 60 70 56C66 63 58 64 54 58C50 65 40 65 36 58C32 64 24 63 20 56C14 60 8 54 10 46Z" fill="${p.c}"/>
      <path d="M10 46C8 54 14 60 20 56C24 63 32 64 36 58C40 65 50 65 54 58C58 64 66 63 70 56C76 60 82 54 80 46C76 51 70 52 66 49C60 55 51 55 45 50C39 55 30 55 24 49C20 52 13 51 10 46Z" fill="${p.o}"/>
      <ellipse cx="30" cy="25" rx="9" ry="5.5" fill="#fff" opacity=".42" transform="rotate(-28 30 25)"/>${p.id === 'vanille' ? GRAINS : ''}</svg>`;
  /* le cornet gaufré */
  const CONE = `<svg class="cone" viewBox="0 0 110 150" aria-hidden="true"><defs><clipPath id="gl-cone"><path d="M9 14 55 147 101 14z"/></clipPath></defs>
      <path d="M9 14 55 147 101 14z" fill="#E2A65C"/>
      <g clip-path="url(#gl-cone)" stroke="#B97835" stroke-width="2.6" stroke-linecap="round" fill="none">${[...Array(9).keys()].map(k => `<path d="M${-70 + k * 22} 14l100 140M${180 - k * 22} 14l-100 140"/>`).join('')}</g>
      <rect x="3" y="4" width="104" height="19" rx="9.5" fill="#CF8D45"/><path d="M12 9.5h86" stroke="#F2C58C" stroke-width="3" stroke-linecap="round"/></svg>`;
  /* dans la boutique, sur l'image à 1,5 s (plan large : il parle, elle écoute, personne ne tient de glace), en % */
  const ZONES = [
    { id: 'cornets-mur', label: 'Les cornets', cornet: true, x: 0, y: 22, w: 8, h: 26 },
    { id: 'cornets-comptoir', label: 'Les cornets', cornet: true, x: 51.5, y: 29, w: 9.5, h: 15.5 },
    { id: 'cornets-bas', label: 'Les cornets', cornet: true, x: 0, y: 66, w: 12.5, h: 34 },
    { id: 'bacs', label: 'Les bacs de glace', msg: 'Ce sont les bacs de glace.', x: 40, y: 79, w: 23, h: 17 },
    { id: 'bacs-2', label: 'Les bacs de glace', msg: 'Ce sont les bacs de glace.', x: 15, y: 87, w: 24, h: 13 },
    { id: 'serviettes', label: 'Les serviettes', msg: 'Ce sont les serviettes.', x: 48, y: 44.5, w: 7.5, h: 11 },
    { id: 'menu', label: 'Le menu', msg: "C'est le menu.", x: 0, y: 0, w: 9.5, h: 17, dessous: true },
  ];
  const NOMBRE = ['', 'une boule', 'deux boules', 'trois boules'];
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const liste = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1]);

  return {
    plans: [{ de: 0, cx: { vendeur: .26, cliente: .75 } }, { de: 1.875, cx: { vendeur: .3, cliente: .6 } }, { de: 5, cx: { vendeur: .4, cliente: .9 } },
      { de: 6.958, cx: { vendeur: .3, cliente: .6 } }, { de: 7.958, cx: { vendeur: .26, cliente: .75 } }],
    ordre: ['cornet', 'boules'],
    bravo: 'Miam ! Voilà sa glace : vanille et chocolat, en cornet.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, fly, faux, juste, suite, goBtn, zones, cam, avant, cadreZone, marque, gel } = A;
      const CHOIX = [ligne(2)[0], ligne(3)[1]];                   // « En cornet ou en pot ? » « En cornet. » (avant le plan large où on voit la glace)
      const CMD = [ligne(1)[0], Math.min(ligne(1)[1], 4.97)];     // « Deux boules, s'il vous plaît. Vanille et chocolat. » (sans l'image du plan suivant)
      return {
        /* 1 · dans la vidéo : elle redit « en cornet », on touche les vrais cornets de la boutique */
        async cornet(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="bacs"]', cam)), 5000); };
          if (!await avant(f, { question: 'Écoute bien.', seg: CHOIX, consigne: "Dans la boutique, clique sur ce qu'elle choisit." })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(CHOIX[0], CHOIX[1], gel()); if (alive(f)) ask(); };
          const etiquette = (z, txt, cls) => marque(z.dessous ? { ...z, y: z.y + z.h + 6, h: 0 } : z, txt, cls);   // le menu est en haut de l'image : l'étiquette dessous
          zones(ZONES, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.cornet) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              ZONES.filter(x => x.cornet).forEach(x => cadreZone(x)); etiquette(z, 'Les cornets', 'juste');
              if (!await juste(f, 'Oui' + NB + '! En cornet.', ligne(3))) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); etiquette(z, z.label, 'faux');
              const montrer = await faux(f, CHOIX, z.msg + ' Écoute encore.'); if (montrer === null) return;
              if (montrer) ZONES.filter(x => x.cornet).forEach(x => $(`.hit[data-id="${x.id}"]`, cam).classList.add('indice'));
              ask();
            }
          });
          ask();
        },

        /* 2 · à côté : elle redit sa commande ; on fait glisser les boules sur le cornet (deux : vanille et chocolat), puis Valider */
        async boules(f) {
          let boules = [], fini = false;
          const legende = () => (boules.length ? cap(NOMBRE[boules.length]) + NB + ': ' + liste(boules.map(id => P[id].nom.toLowerCase())) : 'Le cornet est vide.');
          const dessiner = neuve => {
            const el = $('#boules', side); if (!el) return;
            el.innerHTML = boules.map((id, k) => `<button class="boule${neuve && k === boules.length - 1 ? ' neuve' : ''}" data-k="${k}" style="--k:${k}" aria-label="Enlever la boule ${P[id].de}">${BOULE(P[id])}</button>`).join('');
            $('#compte', side).textContent = legende();
          };
          const ajouter = (id, depuis) => {
            if (fini) return;
            if (boules.length >= 3) { Q.show('you', 'Le cornet est plein' + NB + ': trois boules au maximum.'); return; }
            sfx.tick(); boules.push(id); dessiner(true);
            if (depuis) { const b = $(`.boule[data-k="${boules.length - 1}"]`, side); b.classList.add('tapee'); fly($('.pic', depuis), b, BOULE(P[id]), { scale: 1.2 }); }
            if (state.ask) Q.show('you', state.ask);
          };
          const dessus = (el, e) => { const r = el.getBoundingClientRect(); return e.clientX > r.left - 16 && e.clientX < r.right + 16 && e.clientY > r.top - 16 && e.clientY < r.bottom + 16; };
          const revenir = (vol, b) => {
            const r = b.getBoundingClientRect();
            const an = vol.animate([{ left: vol.style.left, top: vol.style.top, opacity: 1 }, { left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px', opacity: 0 }], { duration: A.reduced ? 1 : 380, easing: 'ease-in', fill: 'forwards' });
            an.finished.then(() => vol.remove(), () => vol.remove());
          };
          /* le doigt fantôme : glisser un bac (jamais vanille ni chocolat) jusqu'au cornet */
          const glisser = () => {
            const a = $('.bac[data-id="pistache"]', side), c = $('#cornet', side); if (!a || !c) return null;
            const r = a.getBoundingClientRect(), q = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, x2 = q.left + q.width / 2, y2 = q.top + q.height * .4;
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 4500); };
          if (!await avant(f, {
            question: 'Écoute la cliente.', qui: 'cliente', seg: CMD, gel: 3.55, sideW: 540, consigne: 'Prépare sa glace' + NB + ': fais glisser les boules sur le cornet.',
            panneau: `<div class="panel glass glace"><p class="ptitre">Fais glisser les boules sur le cornet</p>
              <div class="comptoir"><div class="cornet" id="cornet" role="group" aria-label="Le cornet"><div class="boules" id="boules"></div>${CONE}</div>
              <div class="bacs">${PARFUMS.map(p => `<button class="tuile bac" data-id="${p.id}"><span class="pic">${BOULE(p)}</span><span class="nom">${p.nom}</span></button>`).join('')}</div></div>
              <p class="legende" id="compte" aria-live="polite">Le cornet est vide.</p><p class="astuce">Pour enlever une boule, clique dessus.</p></div>`,
            monte: p => {
              const cornet = $('#cornet', p);
              $$('.bac', p).forEach(b => {
                let d = null, glisse = 0;
                b.addEventListener('pointerdown', e => {
                  if (document.body.dataset.turn !== 'you' || e.button > 0 || fini) return;
                  A.unlock(); idle.reset(); d = { id: b.dataset.id, x: e.clientX, y: e.clientY, pid: e.pointerId, vol: null };
                  try { b.setPointerCapture(e.pointerId); } catch (er) { /* rien */ }
                });
                b.addEventListener('pointermove', e => {
                  if (!d || e.pointerId !== d.pid) return;
                  if (!d.vol) {
                    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return;
                    d.vol = document.createElement('div'); d.vol.className = 'boule-vol'; d.vol.innerHTML = BOULE(P[d.id]); document.body.append(d.vol); b.classList.add('tire');
                  }
                  d.vol.style.left = e.clientX + 'px'; d.vol.style.top = e.clientY + 'px';
                  cornet.classList.toggle('survol', dessus(cornet, e));
                });
                const lacher = e => {
                  if (!d || e.pointerId !== d.pid) return;
                  const { vol, id } = d; d = null; b.classList.remove('tire'); cornet.classList.remove('survol');
                  if (!vol) return;                                  // un simple clic : voir « click »
                  glisse = performance.now();
                  if (e.type === 'pointerup' && dessus(cornet, e) && document.body.dataset.turn === 'you') { vol.remove(); ajouter(id); } else revenir(vol, b);
                };
                b.addEventListener('pointerup', lacher); b.addEventListener('pointercancel', lacher);
                b.addEventListener('click', () => {
                  if (performance.now() - glisse < 500 || document.body.dataset.turn !== 'you') return;
                  A.unlock(); idle.reset(); ajouter(b.dataset.id, b);
                });
              });
              cornet.addEventListener('click', e => {
                const s = e.target.closest('.boule'); if (!s || fini || document.body.dataset.turn !== 'you') return;
                idle.reset(); sfx.tick(); boules.splice(+s.dataset.k, 1); dessiner(false); if (state.ask) Q.show('you', state.ask);
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(CMD[0], CMD[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!boules.length) { Q.show('you', 'Fais glisser les boules sur le cornet.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const cornet = $('#cornet', side), intrus = boules.map(id => P[id]).find(p => !p.ok);
            if (boules.length === 2 && boules.includes('vanille') && boules.includes('chocolat')) {
              cornet.classList.add('juste'); fini = true;
              if (!await juste(f, 'Oui' + NB + '! Deux boules' + NB + ': vanille et chocolat.', CMD)) return;
              suite();
            } else {
              cornet.classList.remove('shake'); void cornet.offsetWidth; cornet.classList.add('shake', 'faux');
              const seul = [...new Set(boules)];
              const msg = intrus ? 'Pas ' + intrus.de + '.' : 'Ça fait ' + NOMBRE[boules.length] + (seul.length === 1 ? ' ' + P[seul[0]].de : '') + '.';
              const montrer = await faux(f, CMD, msg + ' Écoute encore.'); if (montrer === null) return;
              cornet.classList.remove('faux');
              if (montrer) { fini = true; boules = ['vanille', 'chocolat']; dessiner(false); cornet.classList.add('juste'); Q.show('ok', 'Deux boules' + NB + ': vanille et chocolat.'); state.essais = 0; suite(); }
              else ask();
            }
          }
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
