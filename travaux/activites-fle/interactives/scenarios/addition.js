/* Au restaurant, l'addition : le serveur redit le prix (la vidéo resserrée sur lui) et on le tape sur son terminal, avec la
   touche verte ; puis le client redit comment il veut payer et on choisit, parmi ses affaires, sa carte bancaire (pas son
   téléphone, pas des billets) ; enfin, dans la vidéo, après le « Oui, bien sûr » du serveur, on fait glisser la vraie carte
   jusqu'au vrai terminal : la vidéo avance sous le doigt, comme un paiement sans contact.
   (Pas de question à toucher sur l'image du serveur : son terminal est tout en bas, sous la bulle de la consigne.) */
window.SCENARIO = (() => {
  /* on regarde la scène jusqu'au bout : le paiement par carte et le ticket (le dialogue finit à 7,8 s, la vidéo à 10 s) */
  if (window.DONNEES) window.DONNEES.duree = Math.max(window.DONNEES.duree, 9.92);
  const NB = ' ';
  const GEL_SERVEUR = 2.55;   // le serveur, les yeux sur son terminal
  const GEL_CLIENT = 6.1;     // le client seul, sa carte déjà rangée : l'image ne dit pas comment il paie
  const PRIX = 28;
  /* le gros plan du paiement : à 7,88 s la carte arrive à droite, à 8,3 s elle est sur le terminal (en % de l'image) */
  const GLISSE = { de: 7.88, a: 8.3, fin: 8.6, depart: [71, 70], cible: [44, 58] };
  const ZCARTE = { id: 'carte-video', label: "Sa carte : fais-la glisser jusqu'au terminal", x: 62, y: 56, w: 22, h: 30 };
  const ZTERMINAL = { x: 33, y: 52, w: 29, h: 34 };
  const SANS_CONTACT = '<svg class="ondes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 3.5a12 12 0 0 1 0 17"/></svg>';
  const SVG = {
    carte: `<svg viewBox="0 0 96 62" aria-hidden="true"><rect x="2" y="2" width="92" height="58" rx="8" fill="#2F6FDB"/><path d="M2 42h92v10a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8z" fill="#2559B5"/>
      <rect x="12" y="18" width="17" height="13" rx="3" fill="#F2C94C"/><path d="M12 24.5h17M20.5 18v13" stroke="#C9962A" stroke-width="1.2"/>
      <path d="M70 17.5a8 8 0 0 1 0 12M75 15a12 12 0 0 1 0 17M80 12.5a16 16 0 0 1 0 22" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="M12 49h11M27 49h11M42 49h11M57 49h11" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".75"/></svg>`,
    telephone: `<svg viewBox="0 0 96 62" aria-hidden="true"><rect x="31" y="1" width="34" height="60" rx="7" fill="#24272E"/><rect x="34.5" y="7" width="27" height="47" rx="3" fill="#8DBBF7"/>
      <rect x="43" y="3.2" width="10" height="2" rx="1" fill="#555A63"/><rect x="42" y="56.5" width="12" height="2" rx="1" fill="#555A63"/>
      <path d="M41 22h14M41 28h10M41 34h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></svg>`,
    billets: `<svg viewBox="0 0 96 62" aria-hidden="true"><g transform="rotate(-9 48 31)"><rect x="6" y="9" width="80" height="42" rx="5" fill="#E29E8B"/><text x="70" y="38" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Figtree, system-ui, sans-serif">10</text></g>
      <rect x="12" y="15" width="80" height="42" rx="5" fill="#6F9BDE"/><circle cx="32" cy="36" r="10" fill="none" stroke="#fff" stroke-width="2.2" opacity=".75"/>
      <text x="71" y="43" font-size="17" font-weight="800" fill="#fff" text-anchor="middle" font-family="Figtree, system-ui, sans-serif">20 €</text></svg>`,
  };
  const MOYENS = [
    { id: 'billets', nom: 'des billets', pas: "Les billets, c'est payer en espèces. Écoute encore." },
    { id: 'carte', nom: 'sa carte bancaire' },
    { id: 'telephone', nom: 'son téléphone', pas: "Ça, c'est payer avec son téléphone. Écoute encore." },
  ];
  const euros = n => n + ',00' + NB + '€';
  /* les nombres en lettres, pour que le message d'erreur apprenne quelque chose : « 22 €, c'est vingt-deux euros. » */
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const DIZ = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante', 8: 'quatre-vingt' };
  function l99(n) {
    if (n <= 16) return U[n];
    if (n < 20) return 'dix-' + U[n - 10];
    const d = Math.floor(n / 10), u = n % 10;
    if (d === 7) return 'soixante' + (n === 71 ? ' et ' : '-') + l99(n - 60);
    if (d === 9) return 'quatre-vingt-' + l99(n - 80);
    if (!u) return d === 8 ? 'quatre-vingts' : DIZ[d];
    return DIZ[d] + (u === 1 && d !== 8 ? ' et un' : '-' + U[u]);
  }
  function lettres(n) {
    if (n < 100) return l99(n);
    const c = Math.floor(n / 100), r = n % 100, cents = c === 1 ? 'cent' : U[c] + ' cent' + (r ? '' : 's');
    return r ? cents + ' ' + l99(r) : cents;
  }
  /* le terminal de paiement du serveur (comme celui de la vidéo : écran, clavier, touches rouge, jaune, verte) */
  const ICT = {
    annuler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    corriger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>',
    valider: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };
  function terminal(actif, haut, montant) {
    const tag = actif ? 'button' : 'span';
    const touche = k => `<${tag} class="touche" data-k="${k}">${k}</${tag}>`;
    const couleur = (k, c, t) => `<${tag} class="touche couleur ${c}" data-k="${k}">${ICT[k]}<span>${t}</span></${tag}>`;
    return `<div class="tpe${actif ? '' : ' deco'}" role="group" aria-label="Le terminal de paiement">
        <div class="tpe-ecran"><div class="tpe-ligne"><small>${haut}</small>${actif ? '' : SANS_CONTACT}</div><b id="tpe-montant">${montant}</b><span class="tpe-etat" id="tpe-etat"></span></div>
        <div class="tpe-clavier"${actif ? '' : ' aria-hidden="true"'}>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(touche).join('')}<span></span>${touche(0)}<span></span></div>
        <div class="tpe-couleurs"${actif ? '' : ' aria-hidden="true"'}>${couleur('annuler', 'rouge', 'Annuler')}${couleur('corriger', 'jaune', 'Corriger')}${couleur('valider', 'verte', 'Valider')}</div>
      </div>`;
  }
  const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  return {
    plans: [{ de: 0, cx: { client: .56, serveur: .5 } }, { de: 2.46, cx: { serveur: .6, client: .1 } }, { de: 4.58, cx: { client: .56, serveur: .5 } },
      { de: 6.46, cx: { serveur: .6, client: .1 } }, { de: 7.75, cx: { serveur: .3, client: .78 } }, { de: 9.79, cx: { serveur: .21, client: .77 } }],
    ordre: ['prix', 'carte'],
    bravo: 'Super' + NB + '! Le client a payé ses vingt-huit euros par carte.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, freeze, frameTo, CROPS, setSide, phrase, ligne, side, idle, tapHere, at, sfx, fly, faux, juste, suite, wait, zones, cam, avant, cadreZone, marque, gel } = A;
      const PRIX_SEG = ligne(1), VINGT_HUIT = [phrase('ça fait')[0], ligne(1)[1]], OUI = ligne(3);
      const CARTE = [ligne(2)[0], 6.44];     // « Je peux payer par carte ? » (la coupe vers le serveur est à 6,46 s)
      return {
        /* 1 · le prix : le serveur le redit (la vidéo resserrée sur lui), on le tape sur son terminal, puis la touche verte */
        async prix(f) {
          let saisie = '', fini = false;
          const afficher = () => { $('#tpe-montant', side).textContent = euros(+saisie || 0); };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.tpe .touche[data-k="5"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute le serveur.', qui: 'serveur', seg: PRIX_SEG, gel: GEL_SERVEUR, sideW: 420, consigne: 'Ça fait combien' + NB + '? Clique sur les chiffres, puis sur la touche verte.',
            panneau: `<div class="panel glass"><p class="ptitre">Tape le prix sur le terminal</p>${terminal(true, 'Montant', euros(0))}</div>`,
            monte: p => $$('.tpe button', p).forEach(b => b.addEventListener('click', () => {
              if (document.body.dataset.turn !== 'you' || fini) return;
              A.unlock(); idle.reset(); sfx.tick();
              const k = b.dataset.k;
              if (k === 'valider') return valider();
              if (/^\d$/.test(k)) { if (saisie.length >= 3 || (!saisie && k === '0')) return secouer($('.tpe-ecran', side)); saisie += k; }
              else if (k === 'corriger') saisie = saisie.slice(0, -1);
              else saisie = '';
              $('.tpe', side).classList.remove('faux'); afficher();
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(PRIX_SEG[0], PRIX_SEG[1], gel()); if (!alive(f)) return; if (fini) setTurn('you'); else ask(); };
          async function valider() {
            if (!saisie) { Q.show('you', "Clique d'abord sur les chiffres."); return; }
            setTurn('wait'); idle.clear();
            const n = +saisie, t = $('.tpe', side);
            if (n === PRIX) {
              fini = true; t.classList.add('juste'); $('#tpe-etat', side).textContent = '✓ Validé';
              if (!await juste(f, 'Oui' + NB + '! Ça fait vingt-huit euros.', VINGT_HUIT)) return;
              suite();
            } else {
              t.classList.add('faux'); secouer(t);
              const montrer = await faux(f, PRIX_SEG, n + NB + "€, c'est " + lettres(n) + (n > 1 ? ' euros' : ' euro') + '. Écoute encore.'); if (montrer === null) return;
              t.classList.remove('faux'); saisie = '';
              if (montrer) {
                fini = true; saisie = String(PRIX); afficher(); t.classList.add('indice');
                Q.show('ok', 'Ça fait vingt-huit euros' + NB + ': ' + euros(PRIX) + '.'); state.essais = 0; suite();
              } else { afficher(); ask(); }
            }
          }
          ask();
        },

        /* 2 · par carte : le client le redit, on choisit sa carte bancaire ; puis, dans la vidéo, on la fait glisser
           jusqu'au terminal (la vidéo avance sous le doigt ; un simple clic sur la carte marche aussi) */
        async carte(f) {
          let partie = 1;
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.moyen[data-id="billets"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute le client.', qui: 'client', seg: CARTE, gel: GEL_CLIENT, sideW: 540, consigne: 'Il veut payer comment' + NB + '? Clique sur le bon objet.',
            panneau: `<div class="panel glass"><p class="ptitre">Il veut payer…</p><div class="caisse">${terminal(false, 'À payer', euros(PRIX))}
              <div class="poche">${MOYENS.map(m => `<button class="tuile moyen" data-id="${m.id}"><span class="pic">${SVG[m.id]}</span><span class="nom">${m.nom}</span></button>`).join('')}</div></div></div>`,
            monte: p => $$('.moyen', p).forEach(b => b.addEventListener('click', () => { if (document.body.dataset.turn === 'you' && partie === 1) { A.unlock(); choisir(b); } })),
          })) return;
          state.replay = async () => {
            setTurn('listen'); cam.classList.remove('asking');
            const s = partie === 1 ? CARTE : [CARTE[0], OUI[1]];
            await playSegment(s[0], s[1], gel()); if (!alive(f)) return;
            if (partie === 1) ask(); else if (partie === 2) demander(); else setTurn('you');
          };

          async function choisir(b) {
            setTurn('wait'); idle.clear(); sfx.tick();
            const m = MOYENS.find(x => x.id === b.dataset.id), t = $('.tpe', side);
            if (m.id === 'carte') {
              partie = 2; $$('.moyen', side).forEach(x => x.classList.remove('indice', 'faux')); b.classList.add('juste');
              await fly($('.pic', b), $('.tpe-ecran', side), `<div class="vol-pic">${SVG.carte}</div>`, { scale: .8 }); if (!alive(f)) return;
              b.classList.add('posee'); t.classList.add('juste'); t.insertAdjacentHTML('beforeend', `<span class="tpe-carte">${SVG.carte}</span>`);
              if (!await juste(f, 'Oui' + NB + '! Il paie par carte.')) return;
              await wait(900); if (!alive(f)) return;
              video();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, CARTE, m.pas); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.moyen[data-id="carte"]', side).classList.add('indice');
              ask();
            }
          }

          /* la vraie carte, dans la vidéo : le serveur dit oui, la vidéo revient en grand sur le gros plan du paiement */
          const vid = $('#vid');
          const pct = (p, r) => [r.left + p[0] / 100 * r.width, r.top + p[1] / 100 * r.height];
          const geste = () => {
            const r = cam.getBoundingClientRect(), [x, y] = pct(GLISSE.depart, r), [x2, y2] = pct(GLISSE.cible, r);
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
          };
          function demander() { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(geste, 4000); }
          async function video() {
            setSide(null); frameTo(CROPS.full, false); setTurn('listen');
            await playSegment(OUI[0], OUI[1], null); if (!alive(f)) return;
            state.gel = GLISSE.de; await freeze(GLISSE.de); if (!alive(f)) return;
            state.ask = "Dans la vidéo, fais glisser sa carte jusqu'au terminal.";
            if (!await Q.say(state.ask, f)) return;
            let glisse = false;
            zones([ZCARTE], () => { if (glisse) { glisse = false; return; } payer(); });     // un clic sans glisser : la carte y va seule
            const h = $('.hit[data-id="carte-video"]', cam); h.classList.add('glissable');
            /* le doigt fait avancer la vidéo : on projette son déplacement sur le chemin carte → terminal */
            h.addEventListener('pointerdown', e => {
              if (document.body.dataset.turn !== 'you' || partie !== 2 || e.button > 0) return;
              A.unlock(); idle.reset(); e.preventDefault(); glisse = false;
              try { h.setPointerCapture(e.pointerId); } catch (err) {}
              const r = cam.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY, [xc, yc] = pct(GLISSE.cible, r), [xd, yd] = pct(GLISSE.depart, r);
              const vx = xc - xd, vy = yc - yd, L2 = vx * vx + vy * vy;
              let p = 0, cible = null, occupe = false;
              const aller = t => { cible = t; if (occupe) return; occupe = true; try { vid.currentTime = t; } catch (err) { occupe = false; } };
              const vu = () => { occupe = false; if (cible != null && Math.abs(vid.currentTime - cible) > .02) aller(cible); };
              vid.addEventListener('seeked', vu);
              const bouge = ev => {
                p = Math.max(0, Math.min(1, ((ev.clientX - x0) * vx + (ev.clientY - y0) * vy) / L2));
                if (p > .03) glisse = true;
                aller(GLISSE.de + p * (GLISSE.a - GLISSE.de));
              };
              const lache = () => {
                h.removeEventListener('pointermove', bouge); h.removeEventListener('pointerup', lache); h.removeEventListener('pointercancel', lache);
                vid.removeEventListener('seeked', vu);
                if (!glisse) return;
                if (p >= .75) payer(GLISSE.de + p * (GLISSE.a - GLISSE.de));
                else { aller(GLISSE.de); Q.show('you', 'Encore un peu' + NB + ": jusqu'au terminal."); idle.reset(4000); }
              };
              h.addEventListener('pointermove', bouge); h.addEventListener('pointerup', lache); h.addEventListener('pointercancel', lache);
            });
            demander();
          }
          async function payer(depuis = GLISSE.de) {
            if (partie !== 2) return;
            partie = 3; zones(null); idle.clear(); setTurn('wait');
            await playSegment(depuis, GLISSE.fin, null); if (!alive(f)) return;
            state.gel = GLISSE.fin; await freeze(GLISSE.fin); if (!alive(f)) return;
            sfx.coin(); cadreZone(ZTERMINAL); marque(ZTERMINAL, 'Payé', 'juste');
            if (!await juste(f, 'Bravo' + NB + '! Il a payé sans contact.')) return;
            suite();
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        serveur: [{ text: 'Ça fait vingt-huit euros.', seg: [A.phrase('ça fait')[0], A.ligne(1)[1]] }, { text: 'Oui, bien sûr.', seg: A.ligne(3) }],
        client: [{ text: "J'aimerais payer l'addition.", seg: A.ligne(0) }, { text: 'Je peux payer par carte' + A.NB + '?', seg: [A.ligne(2)[0], 6.44] }],
      },
    }),
  };
})();
