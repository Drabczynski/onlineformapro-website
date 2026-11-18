/* À la réception de l'hôtel : le client redit son nom (la vidéo resserrée sur lui), on remplit la fiche de réservation
   (on clique sur son nom dans les réservations du jour, puis une lune pour chaque nuit) ; puis, dans la vidéo, après
   « Voici votre clé », on donne la vraie clé (une carte) à monsieur Martin : on la fait glisser de la main de la
   réceptionniste jusqu'à lui, et la vidéo avance sous le doigt ; enfin, dans l'ascenseur dessiné à côté, on appuie sur le
   bouton de son étage et la cabine monte.
   (Plus de « Où est la clé ? » : elle la tient dans la main, c'était trop évident.) */
window.SCENARIO = (() => {
  const NB = '\u202f';
  const NOMS = [{ id: 'marin', t: 'Marin' }, { id: 'martin', t: 'Martin' }, { id: 'morin', t: 'Morin' }, { id: 'martel', t: 'Martel' }];
  const BON_NOM = 'martin', BONNES_NUITS = 2, MAX_NUITS = 5;
  const nuitsTxt = n => n + (n > 1 ? ' nuits' : ' nuit');
  const NUITS_MOTS = ['', 'une nuit', 'deux nuits', 'trois nuits', 'quatre nuits', 'cinq nuits'];
  const LUNE = '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="croissant" d="M25 6.5a14 14 0 1 0 9.5 23.2A11.5 11.5 0 0 1 25 6.5z"/><circle class="etoile" cx="30" cy="11" r="1.6"/><circle class="etoile" cx="34" cy="19" r="1.1"/></svg>';
  const CRAYON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4.6L15.8 4.8a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* l'ascenseur : les étages de haut en bas, le nom court sur l'immeuble, le nom dit dans les messages */
  const ETAGES = [4, 3, 2, 1, 0], BON_ETAGE = 2;
  const COURT = { 0: 'RDC', 1: '1er', 2: '2e', 3: '3e', 4: '4e' };
  const DIT = { 0: 'le rez-de-chaussée', 1: 'le premier étage', 2: 'le deuxième étage', 3: 'le troisième étage', 4: 'le quatrième étage' };
  const ARIA = { 0: 'Rez-de-chaussée', 1: 'Premier étage', 2: 'Deuxième étage', 3: 'Troisième étage', 4: 'Quatrième étage' };
  const CLIENT = '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M6 52c0-13 6-20 14-20s14 7 14 20z" fill="#8C8F94"/><path d="M15.5 33.5c1.4 2.4 7.6 2.4 9 0" fill="none" stroke="#F4F1EA" stroke-width="2.4"/><circle cx="20" cy="17" r="9" fill="#E9B994"/><path d="M11 16c-.4-7 3.6-11 9.2-11 5.4 0 9.2 3.6 8.8 10-1.8-3.4-4.6-5-9-5s-7.2 2-9 6z" fill="#6B4A32"/></svg>';
  const FLECHE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3l5 7H3z" fill="currentColor"/></svg>';

  /* la clé, dans la vidéo (mesurée image par image, en % de l'image) : à 6,6 s, la réceptionniste tient la carte devant
     elle, elle ne la tend pas encore ; elle la tend (6,8 s), la pose sur le comptoir devant lui (7,0 → 7,3 s), puis
     monsieur Martin avance la main (7,75 s) et la prend (8,25 → 8,4 s ; la coupe suivante est à 8,46 s). */
  const CLE = {
    gel: 6.6, joue: 8.3, fin: 8.4,     // on joue jusqu'à 8,3 s puis on fige à 8,4 s : jamais d'image du plan suivant
    depart: [35, 70.5],     // la carte, dans la main de la réceptionniste
    cible: [57, 85],        // la main de monsieur Martin, posée sur le comptoir
    /* [avancée du doigt sur le trajet départ → cible (0 → 1), temps de la vidéo] : la carte suit le doigt jusqu'au comptoir
       (0 → 0,5), puis la main de monsieur Martin vient la prendre (0,6 → 1) */
    courbe: [[0, 6.6], [.25, 6.8], [.42, 7.0], [.5, 7.3], [.6, 7.75], [1, 8.3]],
    assez: .8,              // lâchée avant, la carte revient
  };
  const ZCARTE = { id: 'cle-video', label: "La clé : fais-la glisser jusqu'à monsieur Martin", x: 28, y: 60, w: 14, h: 20 };
  const ZPRISE = { x: 40, y: 80, w: 10, h: 9 };     // la clé dans la main de monsieur Martin, à 8,4 s
  const tempsDe = p => { const C = CLE.courbe; for (let k = 1; k < C.length; k++) if (p <= C[k][0]) { const [p0, t0] = C[k - 1], [p1, t1] = C[k]; return t0 + (p - p0) / (p1 - p0) * (t1 - t0); } return C[C.length - 1][1]; };

  return {
    plans: [{ de: 0, cx: { receptionniste: .4, client: .4 } }, { de: .625, cx: { receptionniste: .62, client: .62 } }, { de: .958, cx: { receptionniste: .4, client: .4 } },
      { de: 2.125, cx: { receptionniste: .63, client: .63 } }, { de: 4.042, cx: { receptionniste: .41, client: .41 } }, { de: 5.583, cx: { receptionniste: .63, client: .63 } },
      { de: 6.458, cx: { receptionniste: .23, client: .7 } }, { de: 8.458, cx: { receptionniste: .62, client: .62 } }, { de: 9.208, cx: { receptionniste: .2, client: .71 } }],
    ordre: ['fiche', 'cle', 'etage'],
    bravo: 'Bravo' + NB + '! Monsieur Martin peut monter dans sa chambre.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, freeze, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel, fly } = A;
      /* les passages : la question de la réceptionniste, puis la réponse du client (on coupe avant le plan suivant) */
      const NOM = [ligne(2)[0], 4.0], SEJOUR = [phrase('Vous restez combien de nuits')[0], 6.45];
      const VOICI = phrase('Voici votre clé'), ETAGE = [phrase('Votre chambre est au deuxième étage')[0], 8.45];
      const vibre = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · la fiche : le nom (dans les réservations du jour), puis les nuits (une lune par nuit) */
        async fiche(f) {
          let partie = 1, nuits = 0;
          const seg = () => (partie === 1 ? NOM : SEJOUR);
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            if (partie === 1) idle.set(tapHere($('.h-nom[data-id="marin"]', side)), 5000);
            else { goBtn('check', 'Valider', valider); idle.set(tapHere($('.h-lune[data-k="4"]', side)), 5000); }
          };
          const allumer = n => {
            nuits = n;
            $$('.h-lune', side).forEach(b => { const on = +b.dataset.k <= n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.classList.remove('juste', 'faux', 'indice'); });
            $('#hTotal', side).textContent = n ? nuitsTxt(n) : '';
          };
          if (!await avant(f, {
            qui: 'client', seg: NOM, sideW: 460, consigne: 'La réservation est à quel nom' + NB + '? Clique sur le bon nom.',
            panneau: `<div class="panel glass h-panel"><p class="ptitre">Fiche de réservation</p>
              <div class="h-fiche">
                <div class="h-ligne"><span class="h-lbl">Nom</span><span class="h-champ" id="hNom"><span class="h-vide">${CRAYON}</span></span></div>
                <div class="h-ligne h-ln" id="hLn"><span class="h-lbl">Nuits</span><span class="h-nuits">
                  <span class="h-lunes" role="group" aria-label="Nuits">${Array.from({ length: MAX_NUITS }, (_, i) => `<button class="h-lune" data-k="${i + 1}" aria-label="${nuitsTxt(i + 1)}" aria-pressed="false" disabled>${LUNE}</button>`).join('')}</span>
                  <span class="h-total" id="hTotal" aria-live="polite"></span></span></div>
              </div>
              <div class="h-resa" id="hResa"><p class="ptitre">Les réservations du jour</p>
                <div class="h-noms">${NOMS.map(n => `<button class="h-nom" data-id="${n.id}">${n.t}</button>`).join('')}</div></div></div>`,
            monte: p => {
              $$('.h-nom', p).forEach(b => b.addEventListener('click', () => choisirNom(b)));
              $$('.h-lune', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn !== 'you' || partie !== 2) return; A.unlock(); idle.reset(); sfx.tick(); allumer(+b.dataset.k); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(seg()[0], seg()[1], gel()); if (alive(f)) ask(); };

          async function choisirNom(b) {
            if (document.body.dataset.turn !== 'you' || partie !== 1) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const n = NOMS.find(x => x.id === b.dataset.id);
            if (n.id === BON_NOM) {
              $$('.h-nom', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              await fly(b, $('#hNom', side), `<span class="h-vol">${n.t}</span>`, { scale: .8 }); if (!alive(f)) return;
              const champ = $('#hNom', side); champ.innerHTML = `<span class="h-ecrit">${n.t}</span><span class="h-ok">${CHECK}</span>`; champ.classList.add('rempli');
              if (!await juste(f, 'Oui' + NB + '! Au nom de Martin.')) return;
              await wait(700); if (!alive(f)) return;
              /* 2e partie : les nuits */
              partie = 2; $('#hResa', side).classList.add('fini'); $('#hLn', side).classList.add('actif');
              $$('.h-lune', side).forEach(x => { x.disabled = false; });
              setTurn('listen'); await wait(250); if (!alive(f)) return;
              await playSegment(SEJOUR[0], SEJOUR[1], gel()); if (!alive(f)) return;
              state.ask = 'Il reste combien de nuits' + NB + '? Clique sur une lune pour chaque nuit.';
              await wait(300); if (!alive(f)) return;
              if (!await Q.say(state.ask, f)) return;
              ask();
            } else {
              b.classList.add('faux'); vibre(b);
              const montrer = await faux(f, NOM, 'Pas ' + n.t + '.'); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $(`.h-nom[data-id="${BON_NOM}"]`, side).classList.add('indice');
              ask();
            }
          }
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!nuits) { Q.show('you', 'Clique sur une lune.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (nuits === BONNES_NUITS) {
              $$('.h-lune.on', side).forEach(x => x.classList.add('juste')); $('#hLn', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il reste deux nuits.')) return;
              suite();
            } else {
              $$('.h-lune.on', side).forEach(x => x.classList.add('faux')); vibre($('.h-lunes', side));
              const montrer = await faux(f, SEJOUR, 'Ça fait ' + NUITS_MOTS[nuits] + '.'); if (montrer === null) return;
              if (montrer) {
                allumer(BONNES_NUITS); $$('.h-lune.on', side).forEach(x => x.classList.add('juste')); $('#hLn', side).classList.add('juste');
                Q.show('ok', 'Il reste deux nuits' + NB + ': deux lunes.'); state.essais = 0; suite();
              } else { allumer(0); ask(); }
            }
          }
          ask();
        },

        /* 2 · dans la vidéo : elle redit « Voici votre clé » ; sur l'image d'avant (elle tient la carte devant elle), on fait
           glisser la vraie carte jusqu'à la main de monsieur Martin : la vidéo avance sous le doigt (elle la pose devant lui,
           il avance la main) ; lâchée trop tôt, la carte revient. Un clic sur la carte (ou Entrée) marche aussi. */
        async cle(f) {
          const vid = $('#vid');
          let fait = false, rates = 0, lacheA = 0;
          const pct = (q, r) => [r.left + q[0] / 100 * r.width, r.top + q[1] / 100 * r.height];
          /* le doigt fantôme montre le geste : prendre la carte, la faire glisser jusqu'à lui */
          const geste = () => {
            const r = cam.getBoundingClientRect(), [x, y] = pct(CLE.depart, r), [x2, y2] = pct(CLE.cible, r);
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(geste, 5000); };
          /* la vidéo suit le doigt : une seule recherche à la fois, toujours vers le dernier temps demandé */
          const defiler = () => {
            let cible = null, occupe = false;
            const aller = t => { cible = t; if (occupe) return; occupe = true; try { vid.currentTime = t; } catch (err) { occupe = false; } };
            const vu = () => { occupe = false; if (cible != null && Math.abs(vid.currentTime - cible) > .02) aller(cible); };
            vid.addEventListener('seeked', vu);
            return { aller, fin() { vid.removeEventListener('seeked', vu); cible = null; } };
          };
          if (!await avant(f, {
            qui: 'receptionniste', seg: VOICI, gel: CLE.gel, consigne: 'Donne la clé à monsieur Martin' + NB + ": fais-la glisser jusqu'à lui.",
            monte: () => zones([ZCARTE], () => { if (performance.now() - lacheA > 400) donner(); }),     // un clic, sans glisser : la carte y va seule
          })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(VOICI[0], VOICI[1], gel()); if (alive(f) && !fait) ask(); };
          const h = $('.hit[data-id="cle-video"]', cam); h.classList.add('glissable');
          h.addEventListener('pointerdown', e => {
            if (document.body.dataset.turn !== 'you' || fait || e.button > 0) return;
            A.unlock(); idle.clear(); e.preventDefault(); h.classList.add('tire');
            try { h.setPointerCapture(e.pointerId); } catch (err) {}
            const bulle = $('#qt').textContent;
            Q.text('');     // pendant le geste, la bulle s'efface : on voit la carte arriver sur le comptoir et sa main (sur un téléphone, la bulle les cache)
            const r = cam.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY, [xd, yd] = pct(CLE.depart, r), [xc, yc] = pct(CLE.cible, r);
            const vx = xc - xd, vy = yc - yd, L2 = vx * vx + vy * vy, d = defiler();
            let p = 0, glisse = false;
            const bouge = ev => {
              p = Math.max(0, Math.min(1, ((ev.clientX - x0) * vx + (ev.clientY - y0) * vy) / L2));
              if (p > .03) glisse = true;
              d.aller(tempsDe(p));
            };
            const lache = async () => {
              h.removeEventListener('pointermove', bouge); h.removeEventListener('pointerup', lache); h.removeEventListener('pointercancel', lache);
              h.classList.remove('tire');
              if (!glisse) { d.fin(); Q.show('you', bulle); idle.set(geste, 5000); return; }
              lacheA = performance.now();
              if (p >= CLE.assez) { d.fin(); donner(tempsDe(p)); return; }
              /* trop tôt : la carte revient dans la main de la réceptionniste */
              setTurn('wait'); rates++;
              const t1 = tempsDe(p), t0 = performance.now();
              for (let k = 0; k < 1 && alive(f);) { k = Math.min(1, (performance.now() - t0) / 380); d.aller(t1 + (CLE.gel - t1) * k); await new Promise(res => requestAnimationFrame(res)); }
              d.fin(); if (!alive(f)) return;
              await freeze(CLE.gel); if (!alive(f) || fait) return;
              Q.show('you', 'Encore un peu' + NB + ": jusqu'à lui."); yourTurn(); cam.classList.add('asking');
              idle.set(geste, rates >= 2 ? 700 : 5000);     // au 2e essai, le doigt montre tout de suite le geste
            };
            h.addEventListener('pointermove', bouge); h.addEventListener('pointerup', lache); h.addEventListener('pointercancel', lache);
          });
          /* donnée : la vidéo va jusqu'au bout du geste (il prend la carte), sans le son (la suite de la phrase, « …deuxième
             étage », est pour l'étape d'après) */
          async function donner(depuis = CLE.gel) {
            if (fait || document.body.dataset.turn !== 'you') return;
            fait = true; zones(null); idle.clear(); setTurn('wait'); Q.show('you', '');
            if (depuis < CLE.joue - .02) {
              vid.muted = true;
              try { await playSegment(depuis, CLE.joue, null); } finally { vid.muted = false; }
              if (!alive(f)) return;
            }
            state.gel = CLE.fin; await freeze(CLE.fin); if (!alive(f)) return;
            cadreZone(ZPRISE); marque(ZPRISE, 'Sa clé', 'juste');
            if (!await juste(f, 'Oui' + NB + "! Monsieur Martin a sa clé" + NB + ": c'est une carte.")) return;
            suite();
          }
          ask();
        },

        /* 3 · l'ascenseur : elle redit l'étage ; on appuie sur un bouton, la cabine monte jusqu'à cet étage */
        async etage(f) {
          let ici = 0;
          const btn = e => $(`.h-bouton[data-e="${e}"]`, side), niv = e => $(`.h-niv[data-e="${e}"]`, side);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(btn(4)), 5000); };
          async function aller(e, vite) {
            const c = $('#hCabine', side); if (!c) return;
            const pas = e > ici ? 1 : -1, ecran = $('#hEcran', side);
            c.classList.remove('ouverte'); ecran.classList.toggle('bas', pas < 0); ecran.classList.toggle('bouge', e !== ici);
            if (e !== ici) await wait(vite ? 0 : 350);
            while (ici !== e) {
              ici += pas; c.style.setProperty('--k', ici); c.style.transitionDuration = vite ? '.22s' : '.62s';
              await wait(vite ? 220 : 620); if (!alive(f)) return;
              $('#hNum', side).textContent = ici; if (!vite) sfx.tick();
            }
            ecran.classList.remove('bouge');
            if (!vite) { await wait(200); c.classList.add('ouverte'); await wait(450); }
          }
          if (!await avant(f, {
            qui: 'receptionniste', seg: ETAGE, sideW: 460, consigne: 'La chambre est à quel étage' + NB + '? Clique sur le bon bouton.',
            panneau: `<div class="panel glass h-panel"><p class="ptitre">Dans l'ascenseur</p>
              <div class="h-asc">
                <div class="h-cage" aria-hidden="true">
                  ${ETAGES.map(e => `<div class="h-niv" data-e="${e}"><span class="h-et">${COURT[e]}</span><span class="h-puits"></span><span class="h-couloir"><i></i><i></i></span><span class="h-dit"></span></div>`).join('')}
                  <div class="h-cabine" id="hCabine" style="--k: 0"><span class="h-boite"><span class="h-dedans">${CLIENT}</span><span class="h-pg"></span><span class="h-pd"></span></span></div>
                </div>
                <div class="h-plaque">
                  <div class="h-ecran" id="hEcran" aria-hidden="true"><span class="h-fl">${FLECHE}</span><b id="hNum">0</b></div>
                  <div class="h-boutons">${ETAGES.map(e => `<button class="h-bouton" data-e="${e}" aria-label="${ARIA[e]}">${e}</button>`).join('')}</div>
                </div>
              </div></div>`,
            monte: p => $$('.h-bouton', p).forEach(b => b.addEventListener('click', () => appuyer(+b.dataset.e, b))),
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(ETAGE[0], ETAGE[1], gel()); if (alive(f)) ask(); };

          async function appuyer(e, b) {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            $$('.h-bouton', side).forEach(x => x.classList.remove('indice'));
            b.classList.add('choisi');
            await aller(e); if (!alive(f)) return;
            const n = niv(e), dit = $('.h-dit', n);
            if (e === BON_ETAGE) {
              b.classList.replace('choisi', 'juste'); n.classList.add('juste'); dit.textContent = 'Sa chambre';
              if (!await juste(f, 'Oui' + NB + '! Sa chambre est au deuxième étage.')) return;
              suite();
            } else {
              b.classList.replace('choisi', 'faux'); n.classList.add('faux'); dit.textContent = 'Pas ici';
              const montrer = await faux(f, ETAGE, "Non, ici, c'est " + DIT[e] + '.'); if (montrer === null) return;
              b.classList.remove('faux'); n.classList.remove('faux'); dit.textContent = '';
              await aller(0, true); if (!alive(f)) return;
              if (montrer) btn(BON_ETAGE).classList.add('indice');
              ask();
            }
          }
          ask();
        },
      };
    },
    /* au bilan, chaque passage s'arrête avant la coupe suivante (sinon on voit l'autre plan un instant) */
    bilan: A => ({
      faits: {
        receptionniste: [{ text: 'Vous restez combien de nuits' + A.NB + '?', seg: A.phrase('Vous restez combien de nuits') }, { text: 'Voici votre clé.', seg: A.phrase('Voici votre clé') },
          { text: 'au deuxième étage', seg: [A.phrase('Votre chambre est au deuxième étage')[0], 8.45] }],
        client: [{ text: 'au nom de Martin', seg: [A.phrase("j'ai une réservation au nom de Martin")[0], 4.0] }, { text: 'Je reste deux nuits.', seg: [A.ligne(5)[0], 6.45] },
          { text: 'Merci beaucoup.', seg: A.phrase('Merci beaucoup') }],
      },
    }),
  };
})();
