/* J'ai mal à la gorge : chez la médecin, un patient a mal à la gorge et de la fièvre, depuis samedi ; il tousse la nuit.
   Coupes à 1,92, 4,96, 5,96 et 8,92 s : plan large, le patient de près, la médecin de près, le patient de près, plan large.
   (Une autre scène de médecin, « Chez le médecin », a déjà un calendrier à toucher, un thermomètre et un QTE : ici, ni
   calendrier, ni thermomètre, ni question sur la fièvre.)
   1 · dans la vidéo : il redit « J'ai mal à la gorge et de la fièvre » ; sur l'image figée de lui de près (2 s, il ne
       se touche pas, rien ne montre où il a mal), on clique sur l'endroit où il a mal : la tête, les yeux, l'oreille, la
       bouche ou la gorge (le vocabulaire du corps, utile chez le médecin ; rien en bas de l'image, sous la bulle) ;
   2 · « Depuis combien de temps ? — Depuis samedi. » : sur la fiche du patient, on fait glisser l'étiquette du bon jour
       (les sept jours de la semaine) ; un clic sur une étiquette marche aussi ;
   3 · « Et je tousse la nuit. » : on fait tourner la roue de la journée (le matin, l'après-midi, le soir, la nuit) jusqu'au
       bon moment, sous le repère, puis Valider (les flèches et un clic sur un moment la font tourner aussi).
   Les images figées des étapes 2 et 3 sont des plans du patient de près : elles ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  const GEL_CORPS = 2.0;
  /* 1 · les endroits du corps sur l'image à 2 s (en %) ; « ou » : où se pose l'étiquette (le haut de la zone, sauf la tête) */
  const CORPS = [
    { id: 'tete', label: 'La tête', x: 41, y: 2, w: 28, h: 26, ou: { x: 55, y: 13, w: 0, h: 0 } },
    { id: 'yeux', label: 'Les yeux', x: 43, y: 29, w: 19, h: 16 },
    { id: 'oreille', label: "L'oreille", x: 62.5, y: 28, w: 9.5, h: 23 },
    { id: 'bouche', label: 'La bouche', x: 46, y: 46.5, w: 15, h: 17 },
    { id: 'gorge', label: 'La gorge', x: 46, y: 65, w: 19, h: 17, bon: true },
  ];
  /* 2 · les jours de la semaine */
  const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], BON_JOUR = 'samedi';
  /* 3 · la roue de la journée : quatre moments dans le sens des aiguilles d'une montre, le premier en haut au départ */
  const MOMENTS = [
    { id: 'matin', t: 'le matin', fond: '#FFE2B8', encre: '#5A3A12' },
    { id: 'aprem', t: "l'après-midi", fond: '#9FD3FA', encre: '#123A5C' },
    { id: 'soir', t: 'le soir', fond: '#F59A6B', encre: '#4A1E0A' },
    { id: 'nuit', t: 'la nuit', fond: '#232C5C', encre: '#FFFFFF', bon: true },
  ];
  const C = 130, R = 120;
  const pt = (a, r) => [C + r * Math.sin(a * Math.PI / 180), C - r * Math.cos(a * Math.PI / 180)].map(v => v.toFixed(1));
  const ICONES = {
    matin: '<path d="M-26 8h52" stroke="#9A6A2A" stroke-width="3" stroke-linecap="round"/><path d="M-14 8a14 14 0 0 1 28 0z" fill="#FFB31A"/><path d="M0-16v-6M-14-10l-4-4M14-10l4-4M-20 0h-6M20 0h6" stroke="#FFB31A" stroke-width="3" stroke-linecap="round"/>',
    aprem: '<circle r="13" fill="#FFC93C" stroke="#fff" stroke-width="3"/><path d="M0-19v-6M0 19v6M-19 0h-6M19 0h6M-13-13l-4-4M13-13l4-4M-13 13l-4 4M13 13l4 4" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/>',
    soir: '<path d="M-26 8h52" stroke="#7A2E10" stroke-width="3" stroke-linecap="round"/><path d="M-14 8a14 14 0 0 1 28 0z" fill="#FFE07A"/><path d="M-20 15h40M-12 21h24" stroke="#FFE07A" stroke-width="3" stroke-linecap="round" opacity=".8"/>',
    nuit: '<path d="M6-16a16 16 0 1 0 12 26A13 13 0 0 1 6-16z" fill="#F4EFC8"/><circle cx="-16" cy="-12" r="2" fill="#fff"/><circle cx="20" cy="-14" r="1.6" fill="#fff"/><circle cx="-20" cy="10" r="1.4" fill="#fff"/>',
  };
  const ROUE = () => `<svg class="fi-roue" viewBox="0 0 260 260" role="img" aria-label="La roue de la journée">
      <g id="fi-tourne">${MOMENTS.map((m, i) => {
        const c = i * 90, [x1, y1] = pt(c - 45, R), [x2, y2] = pt(c + 45, R), [ix, iy] = pt(c, 62), [tx, ty] = pt(c, 98);
        return `<g class="fi-part" data-id="${m.id}"><path d="M${C} ${C}L${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}Z" fill="${m.fond}" stroke="#fff" stroke-width="3"/>
          <g transform="translate(${ix} ${iy}) rotate(${c})">${ICONES[m.id]}</g>
          <text transform="translate(${tx} ${ty}) rotate(${c})" text-anchor="middle" dominant-baseline="middle" font-family="Figtree, system-ui, sans-serif" font-size="17" font-weight="800" fill="${m.encre}">${m.t}</text></g>`;
      }).join('')}</g>
      <circle cx="${C}" cy="${C}" r="16" fill="#fff" stroke="#C9CED8" stroke-width="3"/>
    </svg>`;

  return {
    plans: [{ de: 0, cx: { medecin: .2, patient: .78 } }, { de: 1.917, cx: { medecin: .02, patient: .55 } }, { de: 4.958, cx: { medecin: .38, patient: .96 } },
      { de: 5.958, cx: { medecin: .02, patient: .55 } }, { de: 8.917, cx: { medecin: .2, patient: .78 } }],
    ordre: ['gorge', 'jour', 'toux'],
    bravo: 'Bravo' + NB + '! Le patient va bientôt aller mieux.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · dans la vidéo : « J'ai mal à la gorge et de la fièvre. » ; on clique sur l'endroit où il a mal */
        async gorge(f) {
          const SEG = ligne(1);
          let fini = false;
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="tete"]', cam)), 5000); };
          if (!await avant(f, { qui: 'patient', seg: SEG, gel: GEL_CORPS, consigne: 'Où est-ce que le patient a mal' + NB + "? Clique au bon endroit dans l'image." })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          zones(CORPS, async (id, ev, z) => {
            if (fini) return;
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.bon) {
              fini = true; $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(z.ou || z, z.label, 'juste');
              if (!await juste(f, 'Oui' + NB + '! Il a mal à la gorge.')) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z.ou || z, z.label, 'faux');
              const montrer = await faux(f, SEG, 'Non, pas ' + z.label.replace(/^L'/, "l'").replace(/^L/, 'l') + '.'); if (montrer === null) return;
              if (montrer) $('.hit[data-id="gorge"]', cam).classList.add('indice');
              ask();
            }
          });
          ask();
        },

        /* 2 · « Depuis combien de temps ? — Depuis samedi. » : on fait glisser le bon jour sur la fiche (ou on clique dessus) */
        async jour(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          const fente = () => $('.fi-fente', side), etiq = id => $(`.fi-jour[data-id="${id}"]`, side);
          let fini = false;
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = etiq('mardi'), vers = fente(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          function ecrire(j, cls) {                            // le jour écrit dans la fente de la fiche
            const fe = fente(); if (!fe) return;
            fe.classList.remove('juste', 'faux', 'vide'); $('b', fe).textContent = j || '…';
            if (!j) fe.classList.add('vide'); if (cls) fe.classList.add(cls);
          }
          async function choisir(id, deja) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const el = etiq(id);
            if (!deja && el && fente()) await A.fly(el, fente(), `<span class="fi-vol">${id}</span>`, { scale: .9 });
            if (!alive(f)) return;
            el.classList.add('pose'); el.style.transition = 'none'; el.style.transform = '';
            if (id === BON_JOUR) {
              fini = true; $$('.fi-jour', side).forEach(x => x.classList.remove('indice')); ecrire(id, 'juste'); el.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Depuis samedi.')) return;
              suite();
            } else {
              ecrire(id, 'faux'); secouer(fente());
              const montrer = await faux(f, SEG, 'Pas ' + id + '.'); if (montrer === null) return;
              el.classList.remove('pose'); ecrire(null);
              if (montrer) etiq(BON_JOUR).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'patient', seg: SEG, gel: 7.0, sideW: 480,
            consigne: 'Il est malade depuis quel jour' + NB + '? Fais glisser le bon jour sur la fiche du patient.',
            panneau: `<div class="panel glass fievre"><p class="ptitre">Fais glisser le bon jour sur la fiche.</p>
              <div class="fi-fiche"><div class="fi-pince" aria-hidden="true"></div>
                <div class="fi-tete"><b>Fiche du patient</b><span>Mal à la gorge, fièvre</span></div>
                <p class="fi-ligne">Malade depuis${NB}: <span class="fi-fente vide" aria-live="polite"><b>…</b></span></p></div>
              <div class="fi-jours" role="group" aria-label="Les jours de la semaine">${JOURS.map(j => `<button class="fi-jour" data-id="${j}">${j}</button>`).join('')}</div></div>`,
            monte: p => {
              $$('.fi-jour', p).forEach(el => {
                let st = null;
                el.addEventListener('pointerdown', e => {
                  if (!tour() || fini || e.button > 0) return;
                  A.unlock(); idle.reset(); e.preventDefault();
                  st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                  try { el.setPointerCapture(e.pointerId); } catch (err) {}
                });
                el.addEventListener('pointermove', e => {
                  if (!st || e.pointerId !== st.id) return;
                  const dx = e.clientX - st.x, dy = e.clientY - st.y;
                  if (!st.bouge && Math.hypot(dx, dy) > 6) { st.bouge = true; sfx.tick(); el.classList.add('tenu'); }
                  if (!st.bouge) return;
                  el.style.transition = 'none'; el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
                  fente().classList.toggle('chaud', dedans($('.fi-ligne', p), e.clientX, e.clientY));
                });
                const lacher = e => {
                  if (!st || e.pointerId !== st.id) return;
                  const bouge = st.bouge; st = null; el.classList.remove('tenu'); fente().classList.remove('chaud');
                  if (!bouge) { if (e.type === 'pointerup') choisir(el.dataset.id); return; }   // un simple clic : l'étiquette y va seule
                  const ok = e.type === 'pointerup' && tour() && dedans($('.fi-ligne', p), e.clientX, e.clientY);
                  if (ok) choisir(el.dataset.id, true);
                  else { el.style.transition = 'transform .4s cubic-bezier(.34,1.3,.64,1)'; el.style.transform = ''; }
                };
                el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
                el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); A.unlock(); choisir(el.dataset.id); } });
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 3 · « Et je tousse la nuit. » : on fait tourner la roue de la journée jusqu'au bon moment, puis Valider */
        async toux(f) {
          const SEG = ligne(4);
          let rot = 0, anim = 0, fini = false;
          const enHaut = () => MOMENTS[((Math.round(-rot / 90) % 4) + 4) % 4];
          const peindre = () => {
            const g = $('#fi-tourne'); if (!g) return;
            g.setAttribute('transform', `rotate(${rot.toFixed(1)} ${C} ${C})`);
            const m = enHaut(), lu = $('#fi-lu', side);
            if (lu) lu.textContent = m.t;
            $$('.fi-part', side).forEach(x => x.classList.toggle('haut', x.dataset.id === m.id));
          };
          const vers = cible => {                              // la roue tourne doucement jusqu'à un angle
            const de = rot, t0 = performance.now(), my = ++anim, d = A.reduced ? 1 : 420;
            return new Promise(ok => { const pas = now => { if (my !== anim) return ok(); const k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3); rot = de + (cible - de) * e; peindre(); if (k < 1) requestAnimationFrame(pas); else ok(); }; requestAnimationFrame(pas); });
          };
          const caler = () => vers(Math.round(rot / 90) * 90);
          const tourner = s => { if (!tour() || fini) return; A.unlock(); idle.reset(); sfx.tick(); $('.fi-roue-zone', side).classList.remove('faux'); vers(Math.round(rot / 90) * 90 + s * 90); };
          const glisser = () => {                              // le doigt fantôme fait tourner la roue d'un quart, dans le sens des aiguilles
            const s = $('.fi-roue', side); if (!s) return null;
            const r = s.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, k = r.width * .36;
            return [at(cx, cy - k + 40, 0), at(cx, cy - k, 1), at(cx, cy - k, 1, .82), at(cx + k * .72, cy - k * .72, 1, .82), at(cx + k, cy, 1, .82), at(cx + k, cy, 1), at(cx + k, cy, 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 5000); };
          if (!await avant(f, {
            qui: 'patient', seg: SEG, gel: 8.75, sideW: 460,
            consigne: "Quand est-ce qu'il tousse" + NB + '? Fais tourner la roue, puis clique sur Valider.',
            panneau: `<div class="panel glass fievre"><p class="ptitre">Fais tourner la roue.</p>
              <div class="fi-roue-zone">
                <button class="fi-fl" data-s="-1" aria-label="Tourner vers la gauche"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 1 2.1 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M5 5v7h7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="fi-roue-cadre"><span class="fi-repere" aria-hidden="true"></span>${ROUE()}</div>
                <button class="fi-fl" data-s="1" aria-label="Tourner vers la droite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 0-2.1 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M19 5v7h-7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              </div>
              <p class="fi-phrase" aria-live="polite">Il tousse <b id="fi-lu">le matin</b>.</p></div>`,
            monte: p => {
              $$('.fi-fl', p).forEach(b => b.addEventListener('click', () => tourner(+b.dataset.s)));
              const svg = $('.fi-roue', p); let st = null;
              const angleDe = e => { const r = svg.getBoundingClientRect(); return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; };
              svg.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault(); anim++;
                st = { a: angleDe(e), rot, id: e.pointerId, bouge: false, x: e.clientX, y: e.clientY };
                try { svg.setPointerCapture(e.pointerId); } catch (err) {}
                $('.fi-roue-zone', p).classList.remove('faux');
              });
              svg.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                if (!st.bouge && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 6) { st.bouge = true; sfx.tick(); }
                if (!st.bouge) return;
                let d = angleDe(e) - st.a; d = ((d + 540) % 360) - 180;
                rot = st.rot + d; st.rot = rot; st.a = angleDe(e); peindre();
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                const bouge = st.bouge; st = null;
                if (bouge || e.type !== 'pointerup') { sfx.tick(); caler(); return; }
                const a = angleDe(e), r = svg.getBoundingClientRect(), dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
                if (dist < r.width * .08) { caler(); return; }
                const pas = Math.round(a / 90);                // un clic sur un moment : il vient sous le repère
                sfx.tick(); vers(Math.round(rot / 90) * 90 - pas * 90);
              };
              svg.addEventListener('pointerup', lacher); svg.addEventListener('pointercancel', lacher);
              peindre();
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            setTurn('wait'); goBtn(null); idle.clear();
            await caler(); if (!alive(f)) return;
            const m = enHaut(), z = $('.fi-roue-zone', side);
            if (m.bon) {
              fini = true; z.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il tousse la nuit.')) return;
              suite();
            } else {
              z.classList.add('faux'); secouer($('.fi-roue-cadre', side));
              const montrer = await faux(f, SEG, 'Pas ' + m.t + '.'); if (montrer === null) return;
              if (montrer) {                                   // deux essais : on pose la réponse
                z.classList.remove('faux'); fini = true;
                const i = MOMENTS.findIndex(x => x.bon); let cible = -i * 90; while (cible - rot > 180) cible -= 360; while (rot - cible > 180) cible += 360;
                await vers(cible); if (!alive(f)) return;
                z.classList.add('juste'); Q.show('ok', 'Il tousse la nuit.'); state.essais = 0; suite();
              } else { z.classList.remove('faux'); ask(); }
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        medecin: [{ text: "Qu'est-ce qui ne va pas" + A.NB + '?', seg: A.ligne(0) }, { text: 'Depuis combien de temps' + A.NB + '?', seg: A.ligne(2) }],
        patient: [{ text: "J'ai mal à la gorge et de la fièvre.", seg: A.ligne(1) }, { text: 'depuis samedi', seg: A.ligne(3) }, { text: 'Je tousse la nuit.', seg: A.phrase('je tousse la nuit') }],
      },
    }),
  };
})();
