/* Au musée : à l'accueil, une visiteuse demande deux billets et s'il y a un tarif réduit (oui, pour les étudiants et les
   seniors) ; le musée ferme à 18 heures ; les photos sont interdites. Coupes à 2, 4,96, 7 et 8,92 s : plan large, le jeune
   homme de près, la visiteuse de près, le jeune homme de près, plan large.
   1 · « Vous avez un tarif réduit ? — Oui, pour les étudiants et les seniors. » : sur l'affiche des tarifs du musée, on
       coche les deux bonnes personnes (parmi les enfants, les étudiants, les seniors, les familles, les groupes), puis Valider ;
   2 · « Le musée ferme à quelle heure ? — À 18 heures. » : sur la plaque des horaires, on fait glisser le curseur de la
       fermeture (de 15 h à 21 h, par demi-heure) sur la bonne heure, puis Valider (dix-huit, pas seize ni dix-neuf) ;
   3 · « Les photos sont interdites. » : sur le règlement du musée (les photos, les boissons, les chiens, les grands sacs :
       tous plausibles dans un musée, seul le dialogue dit lequel), on fait glisser le panneau « Interdit » sur la bonne
       image ; un clic sur l'image marche aussi.
   Pas de geste sur l'image : rien dans le hall ne porte une information du dialogue (aucun prix, aucun horaire, aucun
   pictogramme lisible ; toucher la visiteuse pour « senior » se devinerait à ses cheveux gris). Les images figées des étapes
   (le jeune homme de près) et l'image finale (plan large) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* 1 · l'affiche des tarifs : cinq personnes, en pictogrammes simples (viewBox 64 × 64) */
  const ENC = '#2B3A55';
  const tete = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ENC}"/>`;
  const corps = (x, y, w = 14, h = 20) => `<path d="M${x - w / 2} ${y + h}V${y + 6}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}z" fill="${ENC}"/>`;
  const PERS = [
    { id: 'enfants', nom: 'les enfants', svg: `${tete(24, 26, 4.5)}${corps(24, 32, 11, 16)}${tete(42, 28, 4.2)}${corps(42, 33, 10, 15)}<circle cx="33" cy="52" r="5" fill="#E0713A"/>` },
    { id: 'etudiants', nom: 'les étudiants', svg: `${tete(32, 22, 6)}${corps(32, 30, 18, 26)}<path d="M18 13l14-6 14 6-14 6z" fill="${ENC}"/><path d="M44 14v8" stroke="${ENC}" stroke-width="2"/><circle cx="44" cy="23" r="2" fill="#E0B23A"/><rect x="40" y="38" width="12" height="15" rx="2" fill="#4E7FD0"/>`, bon: true },
    { id: 'seniors', nom: 'les seniors', svg: `${tete(30, 18, 6)}<path d="M23 15a7 7 0 0 1 14 0" fill="none" stroke="#B9C0CC" stroke-width="3"/>${corps(30, 26, 18, 30)}<path d="M44 34v24M44 34a5 5 0 0 0-6-4" fill="none" stroke="#8A5A2E" stroke-width="3" stroke-linecap="round"/>`, bon: true },
    { id: 'familles', nom: 'les familles', svg: `${tete(18, 20, 5)}${corps(18, 27, 13, 28)}${tete(46, 20, 5)}${corps(46, 27, 13, 28)}${tete(32, 33, 4)}${corps(32, 38, 10, 17)}` },
    { id: 'groupes', nom: 'les groupes', svg: `<path d="M10 8v22" stroke="${ENC}" stroke-width="2.4"/><path d="M11 8h12l-3 4 3 4H11z" fill="#E0713A"/>${tete(16, 36, 4)}${corps(16, 41, 10, 17)}${tete(28, 32, 4)}${corps(28, 37, 10, 19)}${tete(40, 36, 4)}${corps(40, 41, 10, 17)}${tete(52, 32, 4)}${corps(52, 37, 10, 19)}` },
  ];
  /* 2 · la plaque des horaires : de 15 h à 21 h, par demi-heure (valeur en heures) */
  const MIN_H = 15, MAX_H = 21, PAS = .5, DEPART = 15, BONNE = 18;
  const hfmt = v => Math.floor(v) + NB + 'h' + (v % 1 ? NB + '30' : '');
  const hdit = v => { const n = Math.floor(v); return n + ' heures' + (v % 1 ? ' trente' : ''); };
  /* 3 · le règlement du musée : quatre images (viewBox 64 × 64) */
  const REGLES = [
    { id: 'photos', nom: 'les photos', svg: '<rect x="8" y="20" width="48" height="32" rx="6" fill="#2B3A55"/><path d="M22 20l4-7h12l4 7z" fill="#2B3A55"/><circle cx="32" cy="36" r="10" fill="#9DB4D8"/><circle cx="32" cy="36" r="5.5" fill="#2B3A55"/><rect x="45" y="25" width="6" height="4" rx="1" fill="#E0B23A"/>', bon: true },
    { id: 'boissons', nom: 'les boissons', de: 'des boissons', svg: '<path d="M20 18h24l-3.5 36a3 3 0 0 1-3 2.6H26.5a3 3 0 0 1-3-2.6z" fill="#B06A35"/><rect x="17" y="12" width="30" height="7" rx="3" fill="#2B3A55"/><path d="M22 30h20l-1 10H23z" fill="#F2E3CF"/><path d="M36 12l3-7" stroke="#2B3A55" stroke-width="3" stroke-linecap="round"/>' },
    { id: 'chiens', nom: 'les chiens', de: 'des chiens', svg: '<path d="M44 14l6 2 4 6h4v5l-6 3h-4v18h-6V40H24v8h-6V31l-6-9 3-2 6 7h19v-7z" fill="#2B3A55"/><path d="M45 14l-1 9 6-1z" fill="#1A2436"/><circle cx="51" cy="21" r="1.6" fill="#fff"/>' },
    { id: 'sacs', nom: 'les grands sacs', de: 'des sacs', svg: '<path d="M22 16a10 10 0 0 1 20 0" fill="none" stroke="#2B3A55" stroke-width="4"/><rect x="14" y="16" width="36" height="42" rx="9" fill="#3E6B4E"/><rect x="21" y="34" width="22" height="16" rx="4" fill="#2F5440"/><path d="M21 26h22" stroke="#2F5440" stroke-width="3" stroke-linecap="round"/>' },
  ];
  const INTERDIT = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="none" stroke="#1E2230" stroke-width="7"/><path d="M13 13l38 38" stroke="#1E2230" stroke-width="7" stroke-linecap="round"/></svg>';

  return {
    plans: [{ de: 0, cx: { employe: .2, visiteuse: .77 } }, { de: 2, cx: { employe: .46, visiteuse: .98 } }, { de: 4.958, cx: { employe: .02, visiteuse: .54 } },
      { de: 7, cx: { employe: .46, visiteuse: .98 } }, { de: 8.917, cx: { employe: .2, visiteuse: .77 } }],
    ordre: ['tarif', 'heure', 'photos'],
    bravo: 'Bravo' + NB + '! La visiteuse a ses deux billets pour le musée.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      const liste = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' ni ' + a[a.length - 1];
      return {
        /* 1 · sur l'affiche des tarifs, on coche les deux personnes qui ont le tarif réduit, puis Valider */
        async tarif(f) {
          const SEG = [ligne(0)[0], ligne(1)[1]];
          const choix = new Set(); let fini = false;
          const peindre = () => $$('.mu-pers', side).forEach(b => b.setAttribute('aria-pressed', choix.has(b.dataset.id)));
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.mu-pers[data-id="familles"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'employe', seg: SEG, gel: 3.6, sideW: 500,
            consigne: "Le tarif réduit, c'est pour qui" + NB + '? Clique sur les deux bonnes personnes, puis sur Valider.',
            panneau: `<div class="panel glass musee"><p class="ptitre">Clique sur les deux bonnes personnes, puis sur Valider.</p>
              <div class="mu-affiche" id="affiche"><div class="mu-tete"><b>Musée</b><span>Tarifs</span></div>
                <p class="mu-ligne">Tarif réduit pour${NB}:</p>
                <div class="mu-perss" role="group" aria-label="Le tarif réduit, pour qui${NB}?">${PERS.map(p => `<button class="mu-pers" data-id="${p.id}" aria-pressed="false" aria-label="${p.nom}">
                  <span class="case" aria-hidden="true"></span><svg viewBox="6 4 52 56" aria-hidden="true">${p.svg}</svg><span class="nom">${p.nom}</span></button>`).join('')}</div></div></div>`,
            monte: p => $$('.mu-pers', p).forEach(b => b.addEventListener('click', () => {
              if (!tour() || fini) return;
              A.unlock(); idle.reset(); sfx.tick();
              const id = b.dataset.id; if (choix.has(id)) choix.delete(id); else choix.add(id);
              b.classList.remove('faux'); peindre();
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            if (!choix.size) { secouer($('#affiche', side)); Q.show('you', 'Clique sur les deux bonnes personnes.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const faux_ = [...choix].filter(id => !PERS.find(p => p.id === id).bon), manque = PERS.filter(p => p.bon && !choix.has(p.id));
            $$('.mu-pers', side).forEach(b => { if (choix.has(b.dataset.id)) b.classList.add(faux_.includes(b.dataset.id) ? 'faux' : 'juste'); });
            if (!faux_.length && !manque.length) {
              fini = true; $$('.mu-pers', side).forEach(x => x.classList.remove('indice')); $('#affiche', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Pour les étudiants et les seniors.')) return;
              suite();
            } else {
              secouer($('#affiche', side));
              const msg = faux_.length ? 'Pas ' + liste(faux_.map(id => PERS.find(p => p.id === id).nom)) + '.'
                : 'Il y a une autre personne.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              faux_.forEach(id => { choix.delete(id); $(`.mu-pers[data-id="${id}"]`, side).classList.remove('faux'); });
              $$('.mu-pers', side).forEach(b => b.classList.remove('juste'));
              peindre();
              if (montrer) {                                    // deux essais : on montre les deux bonnes personnes
                fini = true; PERS.forEach(p => { if (p.bon) choix.add(p.id); }); peindre();
                PERS.filter(p => p.bon).forEach(p => $(`.mu-pers[data-id="${p.id}"]`, side).classList.add('juste'));
                $('#affiche', side).classList.add('juste');
                Q.show('ok', 'Le tarif réduit, c\'est pour les étudiants et les seniors.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 2 · sur la plaque des horaires, on fait glisser le curseur de la fermeture sur la bonne heure, puis Valider */
        async heure(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let val = DEPART, fini = false;
          const pc = v => (v - MIN_H) / (MAX_H - MIN_H) * 100;
          const peindre = () => {
            const c = $('#curseur', side); if (!c) return;
            c.style.left = pc(val) + '%'; $('#plein', side).style.width = pc(val) + '%';
            c.setAttribute('aria-valuenow', val); c.setAttribute('aria-valuetext', hdit(val));
            $('#affH', side).textContent = hfmt(val);
          };
          const regler = v => { v = Math.max(MIN_H, Math.min(MAX_H, Math.round(v / PAS) * PAS)); if (v !== val) { val = v; sfx.tick(); peindre(); $('#plaque', side).classList.remove('faux'); } };
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            idle.set(() => {                                   // le doigt fait glisser le curseur d'un petit bout (pas jusqu'à la réponse)
              const c = $('#curseur', side); if (!c) return null;
              const r = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, d = $('#rail', side).getBoundingClientRect().width / 8;
              return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x + d, y, 1, .82), at(x + d, y, 1), at(x + d, y, 0)];
            }, 5000);
          };
          const graduations = [];
          for (let v = MIN_H; v <= MAX_H; v += PAS) graduations.push(`<span class="mu-grad${v % 1 ? ' demi' : ''}" style="left:${pc(v)}%">${v % 1 ? '' : `<b>${v}${NB}h</b>`}</span>`);
          if (!await avant(f, {
            qui: 'employe', seg: SEG, gel: 7.5, sideW: 520,
            consigne: 'Le musée ferme à quelle heure' + NB + '? Fais glisser le curseur sur la bonne heure, puis clique sur Valider.',
            panneau: `<div class="panel glass musee"><p class="ptitre">Fais glisser le curseur, puis clique sur Valider.</p>
              <div class="mu-plaque" id="plaque"><div class="mu-tete"><b>Musée</b><span>Horaires</span></div>
                <p class="mu-ferme">Fermeture${NB}: <output id="affH">${hfmt(DEPART)}</output></p>
                <div class="mu-rail" id="rail"><div class="mu-piste"><div class="mu-plein" id="plein"></div></div>${graduations.join('')}
                  <div class="mu-curseur" id="curseur" role="slider" tabindex="0" aria-label="L'heure de fermeture du musée" aria-valuemin="${MIN_H}" aria-valuemax="${MAX_H}" aria-valuenow="${DEPART}" aria-valuetext="${hdit(DEPART)}"></div></div>
              </div></div>`,
            monte: p => {
              const rail = $('#rail', p), c = $('#curseur', p); let tient = null;
              const deX = x => { const r = rail.getBoundingClientRect(); return MIN_H + (x - r.left) / r.width * (MAX_H - MIN_H); };
              const prendre = e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault(); tient = e.pointerId;
                try { rail.setPointerCapture(e.pointerId); } catch (err) {}
                c.classList.add('tenu'); regler(deX(e.clientX));
              };
              rail.addEventListener('pointerdown', prendre);
              rail.addEventListener('pointermove', e => { if (tient === e.pointerId && tour()) regler(deX(e.clientX)); });
              const lacher = e => { if (tient !== e.pointerId) return; tient = null; c.classList.remove('tenu'); };
              rail.addEventListener('pointerup', lacher); rail.addEventListener('pointercancel', lacher);
              c.addEventListener('keydown', e => {
                if (!tour() || fini) return;
                const d = { ArrowRight: PAS, ArrowUp: PAS, ArrowLeft: -PAS, ArrowDown: -PAS }[e.key];
                if (d) { e.preventDefault(); A.unlock(); idle.reset(); regler(val + d); }
                else if (e.key === 'Enter') { e.preventDefault(); valider(); }
              });
            },
          })) return;
          peindre();
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            setTurn('wait'); goBtn(null); idle.clear();
            const pl = $('#plaque', side);
            if (val === BONNE) {
              fini = true; pl.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Le musée ferme à 18' + NB + 'heures.')) return;
              suite();
            } else {
              pl.classList.add('faux'); secouer(pl);
              const montrer = await faux(f, SEG, 'Non, pas ' + hfmt(val) + '.'); if (montrer === null) return;
              pl.classList.remove('faux');
              if (montrer) {                                    // deux essais : on pose le curseur sur 18 h
                fini = true; val = BONNE; peindre(); pl.classList.add('juste');
                Q.show('ok', 'Le musée ferme à 18' + NB + 'heures.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · sur le règlement du musée, on fait glisser le panneau « Interdit » sur la bonne image (ou on clique sur l'image) */
        async photos(f) {
          const SEG = ligne(4);
          const signe = () => $('.mu-signe', side), regle = id => $(`.mu-regle[data-id="${id}"]`, side);
          let fini = false;
          function poser(v, anime = true) {
            const el = signe(); if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            el.classList.toggle('pose', !!v);
            if (!v) { el.style.transition = tr; el.style.transform = ''; return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = $('svg', v).getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            const k = b.width * 1.08 / a.width;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${k.toFixed(3)})`;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = signe(), vers = regle('chiens'); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .45;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const v = regle(id), r = REGLES.find(x => x.id === id); poser(v);
            $$('.mu-regle', side).forEach(x => x.classList.remove('chaud'));
            await wait(450); if (!alive(f)) return;
            if (r.bon) {
              fini = true; $$('.mu-regle', side).forEach(x => x.classList.remove('indice')); v.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Les photos sont interdites.')) return;
              suite();
            } else {
              v.classList.add('faux'); secouer(v);
              const montrer = await faux(f, SEG, 'Non' + NB + ': il ne parle pas ' + r.de + '.');
              if (montrer === null) return;
              v.classList.remove('faux'); poser(null);
              if (montrer) regle('photos').classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass musee"><p class="ptitre">Fais glisser le panneau sur la bonne image.</p>
            <div class="mu-reglement"><div class="mu-tete"><b>Musée</b><span>Règlement</span></div>
              <div class="mu-regles">${REGLES.map(r => `<button class="mu-regle" data-id="${r.id}" aria-label="Interdire ${r.nom}"><svg viewBox="0 0 64 64" aria-hidden="true">${r.svg}</svg><span class="nom">${r.nom}</span></button>`).join('')}</div></div>
            <div class="mu-depart"><div class="mu-signe" aria-hidden="true">${INTERDIT}</div><span class="legende">le panneau<br><b>Interdit</b></span></div></div>`;
          if (!await avant(f, {
            qui: 'employe', seg: SEG, gel: 8.6, sideW: 500, panneau,
            consigne: "Pour le jeune homme, qu'est-ce qui est interdit" + NB + '? Fais glisser le panneau Interdit sur la bonne image.',
            monte: p => {
              const el = $('.mu-signe', p); let st = null;
              el.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                el.style.transition = 'none'; el.style.transform = '';
                st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                try { el.setPointerCapture(e.pointerId); } catch (err) {}
                el.classList.add('tenu');
              });
              el.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x, dy = e.clientY - st.y;
                if (!st.bouge && Math.hypot(dx, dy) > 5) { st.bouge = true; sfx.tick(); }
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
                $$('.mu-regle', p).forEach(v => v.classList.toggle('chaud', dedans(v, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenu');
                const v = e.type === 'pointerup' && tour() ? $$('.mu-regle', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.mu-regle', p).forEach(x => x.classList.remove('chaud'));
                if (v) choisir(v.dataset.id); else poser(null);
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.mu-regle', p).forEach(v => v.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(v.dataset.id); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        visiteuse: [{ text: 'Deux billets.', seg: A.phrase('deux billets') }, { text: 'Vous avez un tarif réduit' + A.NB + '?', seg: A.phrase('vous avez un tarif réduit') },
          { text: 'Le musée ferme à quelle heure' + A.NB + '?', seg: A.phrase('le musée ferme à quelle heure') }],
        employe: [{ text: 'Pour les étudiants et les seniors.', seg: A.ligne(1) }, { text: 'À 18 heures.', seg: A.ligne(3) }, { text: 'Les photos sont interdites.', seg: A.ligne(4) }],
      },
    }),
  };
})();
