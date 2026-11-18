/* Le livreur : dans le couloir d'un immeuble, un livreur apporte un colis pour monsieur Bernard ; il n'est pas là, sa voisine
   prend le colis et signe sur le téléphone du livreur (gros plan de 7,13 à 7,79 s).
   1 · le livreur redit pour qui est le colis (la vidéo resserrée sur lui) : à côté, l'interphone de l'immeuble, six noms
       (M. Bernard, Mme Bernard, M. Bertrand, M. Renard, M. Gérard, Mme Leroy : des noms qui se ressemblent à l'oreille) ;
       on sonne chez le bon ;
   2 · dans la vidéo : ils redisent « Il n'est pas là ? — Non. Vous pouvez prendre le colis ? — Oui, bien sûr. » ; sur
       l'image du couloir, on clique sur la porte où va le colis : chez la dame (pas la porte à côté, pas les autres portes
       du palier) ;
   3 · le livreur redit « Vous signez ici » : sur son téléphone (dessiné à côté), on choisit ce qu'il demande (signer, pas
       taper un code, pas prendre une photo), puis on signe avec le doigt et on valide.
   Images figées : 3,4 s (le livreur tient encore le colis, personne ne montre de porte ni de téléphone) ; la réécoute de
   l'étape 3 s'arrête juste avant le gros plan sur le téléphone. La fin (elle rentre chez elle avec le colis) n'est jamais
   figée. */
window.SCENARIO = (() => {
  const NB = '\u202f';                                 // l'espace fine insécable (comme le moteur)
  /* l'interphone : les noms, dans l'ordre des boutons */
  const NOMS = [
    { id: 'bertrand', nom: 'M. Bertrand', msg: 'Non, pas monsieur Bertrand.' },
    { id: 'mme', nom: 'Mme Bernard', msg: "Ça, c'est madame Bernard. Le colis est pour un monsieur." },
    { id: 'renard', nom: 'M. Renard', msg: 'Non, pas monsieur Renard.' },
    { id: 'leroy', nom: 'Mme Leroy', msg: 'Non, pas madame Leroy.' },
    { id: 'bernard', nom: 'M. Bernard', bon: true },
    { id: 'gerard', nom: 'M. Gérard', msg: 'Non, pas monsieur Gérard.' },
  ];
  /* 2 · les portes du couloir, sur l'image à 3,4 s, en % ; « my » : où poser l'étiquette */
  const PORTES = [
    { id: 'gauche', label: 'La porte à gauche', x: 8, y: 8, w: 8, h: 84 },
    { id: 'fond', label: 'La porte du fond', x: 41.5, y: 13, w: 9.5, h: 40 },
    { id: 'cote', label: 'La porte à côté', x: 53, y: 10, w: 6.5, h: 82 },
    { id: 'dame', label: 'Chez la dame', bon: true, x: 61, y: 2, w: 18, h: 96, my: 17 },
  ];
  /* 3 · le téléphone du livreur : trois façons de valider une livraison */
  const IC = {
    signer: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 5.5l6 6L12 26H6v-6z"/><path d="M17.5 8.5l6 6"/><path d="M4 30h24" stroke-width="2"/></svg>',
    code: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor"><circle cx="8" cy="6" r="2.6"/><circle cx="16" cy="6" r="2.6"/><circle cx="24" cy="6" r="2.6"/><circle cx="8" cy="14" r="2.6"/><circle cx="16" cy="14" r="2.6"/><circle cx="24" cy="14" r="2.6"/><circle cx="8" cy="22" r="2.6"/><circle cx="16" cy="22" r="2.6"/><circle cx="24" cy="22" r="2.6"/><circle cx="16" cy="29" r="2.6"/></svg>',
    photo: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 11a3 3 0 0 1 3-3h3.5l2-3h7l2 3H25a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><circle cx="16" cy="17" r="5"/></svg>',
    colis: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9M7.5 5.2l9 4.5"/></svg>',
  };
  const ACTIONS = [
    { id: 'signer', nom: 'Signer', bon: true },
    { id: 'code', nom: 'Taper un code', msg: 'Il ne demande pas de code.' },
    { id: 'photo', nom: 'Prendre une photo', msg: 'Il ne demande pas de photo.' },
  ];

  return {
    plans: [{ de: 0, cx: { livreur: .36, dame: .68 } }, { de: 7.125, cx: { livreur: .25, dame: .72 } }, { de: 7.79, cx: { livreur: .42, dame: .7 } }],
    ordre: ['nom', 'porte', 'signer'],
    bravo: 'Bravo' + NB + '! Le colis de monsieur Bernard est chez sa voisine.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · pour qui : le livreur le redit, on sonne chez le bon nom sur l'interphone */
        async nom(f) {
          const SEG = ligne(0);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.lv-sonnette[data-id="renard"] .lv-bouton', side)), 5000); };
          if (!await avant(f, {
            qui: 'livreur', seg: SEG, sideW: 420, consigne: 'Le colis est pour qui' + NB + '? Clique sur son nom.',
            panneau: `<div class="panel glass lv"><p class="ptitre">Le colis est pour…</p>
              <div class="lv-inter" role="group" aria-label="L'interphone de l'immeuble"><div class="lv-hp" aria-hidden="true"></div>
                <div class="lv-noms">${NOMS.map(n => `<button class="lv-sonnette" data-id="${n.id}" aria-label="Sonner chez ${n.nom}"><span class="lv-etiq">${n.nom}</span><span class="lv-bouton" aria-hidden="true"></span></button>`).join('')}</div></div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          $$('.lv-sonnette', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            b.classList.remove('sonne'); void b.offsetWidth; b.classList.add('sonne');
            const n = NOMS.find(x => x.id === b.dataset.id);
            if (n.bon) {
              $$('.lv-sonnette', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Pour monsieur Bernard, le voisin.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, n.msg); if (montrer === null) return;
              b.classList.remove('faux', 'sonne');
              if (montrer) $('.lv-sonnette[data-id="bernard"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · dans la vidéo : monsieur Bernard n'est pas là, la dame prend le colis ; on clique sur sa porte */
        async porte(f) {
          const SEG = [ligne(1)[0], ligne(3)[1]];
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="gauche"]', cam)), 5000); };
          if (!await avant(f, { seg: SEG, consigne: 'Où va le colis' + NB + '? Clique sur la bonne porte.' })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          const ou = z => (z.my != null ? { ...z, y: z.my } : z);
          zones(PORTES, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.bon) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(ou(z), 'Chez la dame', 'juste');
              if (!await juste(f, 'Oui' + NB + '! La dame prend le colis de son voisin.')) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(ou(z), z.label, 'faux');
              const montrer = await faux(f, SEG, "Non. Monsieur Bernard n'est pas là."); if (montrer === null) return;
              if (montrer) $('.hit[data-id="dame"]', cam).classList.add('indice');
              ask();
            }
          });
          ask();
        },

        /* 3 · sur le téléphone du livreur : ce qu'il demande (signer), puis on signe avec le doigt et on valide */
        async signer(f) {
          const SEG = [ligne(4)[0], 7.11];                     // s'arrête avant le gros plan sur le téléphone (7,13 s)
          let partie = 1, trace = 0;
          const pad = () => $('.lv-pad canvas', side);
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            if (partie === 1) { goBtn(null); idle.set(tapHere($('.lv-action[data-id="photo"]', side)), 5000); }
            else { goBtn('check', 'Valider', valider); idle.set(signature, 4500); }
          };
          /* le doigt fantôme fait une signature dans le cadre */
          const signature = () => {
            const c = pad(); if (!c || !c.isConnected) return null;
            const r = c.getBoundingClientRect(), y = r.top + r.height * .55, x = k => r.left + r.width * k;
            return [at(x(.18), y + 30, 0), at(x(.18), y, 1), at(x(.18), y, 1, .82), at(x(.36), y - 26, 1, .82), at(x(.5), y + 14, 1, .82), at(x(.68), y - 18, 1, .82), at(x(.82), y + 4, 1, .82), at(x(.82), y + 4, 0)];
          };
          if (!await avant(f, {
            qui: 'livreur', seg: SEG, sideW: 440, consigne: 'Le livreur demande quoi' + NB + '? Clique sur son téléphone.',
            panneau: `<div class="panel glass lv"><p class="ptitre">Le téléphone du livreur</p>
              <div class="lv-tel"><div class="lv-ecran">
                <div class="lv-appli">${IC.colis}<span><b>Livraison</b><small>Colis pour M. Bernard</small></span></div>
                <div class="lv-choix">${ACTIONS.map(a => `<button class="lv-action" data-id="${a.id}">${IC[a.id]}<span>${a.nom}</span></button>`).join('')}</div>
                <div class="lv-pad" hidden><p class="lv-sig">Signature</p><div class="lv-cadre"><canvas aria-label="Signe ici avec ton doigt"></canvas><span class="lv-x" aria-hidden="true">×</span></div>
                  <button class="lv-effacer">Effacer</button></div>
              </div></div></div>`,
            monte: p => {
              $$('.lv-action', p).forEach(b => b.addEventListener('click', () => choisir(b)));
              $('.lv-effacer', p).addEventListener('click', () => { if (!tour()) return; A.unlock(); idle.reset(); effacer(); });
              brancherPad($('.lv-pad canvas', p));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };

          /* partie 1 : ce qu'il demande */
          async function choisir(b) {
            if (!tour() || partie !== 1) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const a = ACTIONS.find(x => x.id === b.dataset.id);
            if (a.bon) {
              $$('.lv-action', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! «' + NB + 'Vous signez ici.' + NB + '»')) return;
              await wait(900); if (!alive(f)) return;
              partie = 2; $('.lv-choix', side).hidden = true; $('.lv-pad', side).hidden = false; dimensionner();
              state.ask = 'Signe avec ton doigt, puis clique sur Valider.';
              if (!await Q.say(state.ask, f)) return;
              ask();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, a.msg); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.lv-action[data-id="signer"]', side).classList.add('indice');
              ask();
            }
          }

          /* partie 2 : signer avec le doigt (ou la souris) dans le cadre */
          function dimensionner() {
            const c = pad(); if (!c) return;
            const d = window.devicePixelRatio || 1;                // offsetWidth : la vraie taille, même pendant l'animation d'ouverture
            c.width = Math.round(c.offsetWidth * d); c.height = Math.round(c.offsetHeight * d);
            const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1F3F8F';
            trace = 0;
          }
          function effacer() { dimensionner(); $('.lv-cadre', side).classList.remove('vide', 'juste'); }
          function brancherPad(c) {
            let der = null;
            const point = e => { const r = c.getBoundingClientRect(), k = c.offsetWidth / (r.width || 1); return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }; };
            c.addEventListener('pointerdown', e => {
              if (!tour() || partie !== 2 || c.classList.contains('fini')) return;
              A.unlock(); idle.reset(); e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (err) {}
              if (c.width !== Math.round(c.offsetWidth * (window.devicePixelRatio || 1))) dimensionner();
              der = point(e); const cadre = $('.lv-cadre', side); if (cadre.classList.contains('vide')) { cadre.classList.remove('vide'); Q.show('you', state.ask); }
              const g = c.getContext('2d'); g.beginPath(); g.arc(der.x, der.y, 1.4, 0, Math.PI * 2); g.fillStyle = '#1F3F8F'; g.fill();
            });
            c.addEventListener('pointermove', e => {
              if (!der) return;
              const p = point(e), g = c.getContext('2d');
              g.beginPath(); g.moveTo(der.x, der.y); g.lineTo(p.x, p.y); g.stroke();
              trace += Math.hypot(p.x - der.x, p.y - der.y); der = p;
            });
            const fin = () => { der = null; };
            c.addEventListener('pointerup', fin); c.addEventListener('pointercancel', fin);
          }
          async function valider() {
            if (!tour() || partie !== 2) return;
            if (trace < 60) { const cadre = $('.lv-cadre', side); cadre.classList.add('vide'); secouer(cadre); Q.show('you', 'Signe dans le cadre avec ton doigt.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            pad().classList.add('fini'); $('.lv-cadre', side).classList.add('juste'); $('.lv-effacer', side).disabled = true;
            if (!await juste(f, 'Voilà' + NB + '! Le colis est signé.')) return;
            suite();
          }
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { dame: 'la voisine' },
      faits: {
        livreur: [{ text: 'un colis pour monsieur Bernard', seg: A.phrase('un colis pour monsieur Bernard') }, { text: 'Vous pouvez prendre le colis' + A.NB + '?', seg: A.phrase('vous pouvez prendre le colis') },
          { text: "Vous signez ici, s'il vous plaît.", seg: A.phrase("vous signez ici s'il vous plaît") }],
        dame: [{ text: "Il n'est pas là" + A.NB + '?', seg: A.ligne(1) }, { text: 'Oui, bien sûr.', seg: A.ligne(3) }, { text: 'Merci, bonne journée.', seg: A.ligne(7) }],
      },
    }),
  };
})();
