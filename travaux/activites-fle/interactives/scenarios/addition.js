/* Au restaurant, l'addition : dans la vidéo (le serveur arrive, son terminal à la main), on touche ce qui va avec ce que
   le client veut faire (payer, pas commander sur la carte du restaurant) ; puis le serveur redit le prix et on le tape sur
   son terminal, avec la touche verte ; enfin le client redit comment il veut payer, et on fait glisser sa carte bancaire
   (pas son téléphone, pas des billets) sur le terminal, comme pour payer sans contact. */
window.SCENARIO = (() => {
  /* on regarde la scène jusqu'au bout : le paiement par carte et le ticket (le dialogue finit à 7,8 s, la vidéo à 10 s) */
  if (window.DONNEES) window.DONNEES.duree = Math.max(window.DONNEES.duree, 9.92);
  const NB = ' ';
  const GEL_SERVEUR = 2.55;   // le serveur arrive, le terminal dans les mains, la carte du restaurant au mur
  const GEL_CLIENT = 6.1;     // le client seul, sa carte déjà rangée : l'image ne dit pas comment il paie
  const PRIX = 28;
  /* ce qu'on peut toucher sur l'image du serveur (2,55 s), en % : payer, commander ou boire */
  const OBJETS = [
    { id: 'terminal', label: 'Le terminal de paiement', x: 47, y: 86, w: 21, h: 14 },
    { id: 'ardoise', label: 'La carte du restaurant, au mur', nom: 'La carte', pas: "La carte, c'est pour commander. Écoute encore.", x: 24.5, y: 12, w: 18, h: 67 },
    { id: 'vin', label: 'Les bouteilles de vin', nom: 'Le vin', pas: "Le vin, c'est pour boire. Écoute encore.", x: 0, y: 12, w: 8, h: 22 },
  ];
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
  /* le terminal de paiement du serveur (le même que dans la vidéo : écran, clavier, touches rouge, jaune, verte) */
  const ICT = {
    annuler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    corriger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>',
    valider: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };
  function terminal(actif, haut, montant) {
    const tag = actif ? 'button' : 'span';
    const touche = k => `<${tag} class="touche" data-k="${k}">${k}</${tag}>`;
    const couleur = (k, c, t) => `<${tag} class="touche couleur ${c}" data-k="${k}"${actif ? ` aria-label="${t}"` : ''}>${ICT[k]}<span>${t}</span></${tag}>`;
    return `<div class="tpe${actif ? '' : ' deco'}" role="group" aria-label="Le terminal de paiement">
        <div class="tpe-ecran"><div class="tpe-ligne"><small>${haut}</small>${actif ? '' : SANS_CONTACT}</div><b id="tpe-montant">${montant}</b><span class="tpe-etat" id="tpe-etat"></span></div>
        <div class="tpe-clavier">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(touche).join('')}<span></span>${touche(0)}<span></span></div>
        <div class="tpe-couleurs">${couleur('annuler', 'rouge', 'Annuler')}${couleur('corriger', 'jaune', 'Corriger')}${couleur('valider', 'verte', 'Valider')}</div>
      </div>`;
  }
  const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  return {
    plans: [{ de: 0, cx: { client: .56, serveur: .5 } }, { de: 2.46, cx: { serveur: .6, client: .1 } }, { de: 4.58, cx: { client: .56, serveur: .5 } },
      { de: 6.46, cx: { serveur: .6, client: .1 } }, { de: 7.75, cx: { serveur: .3, client: .78 } }, { de: 9.79, cx: { serveur: .21, client: .77 } }],
    ordre: ['addition', 'prix', 'carte'],
    bravo: 'Super' + NB + '! Le client a payé ses vingt-huit euros par carte.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, fly, faux, juste, suite, zones, cam, avant, cadreZone, marque, gel } = A;
      const ADDITION = ligne(0), PRIX_SEG = ligne(1), VINGT_HUIT = phrase('ça fait vingt-huit euros'), OUI = ligne(3);
      const CARTE = [ligne(2)[0], 6.44];     // « Je peux payer par carte ? » (la coupe vers le serveur est à 6,46 s)
      return {
        /* 1 · dans la vidéo : il veut payer l'addition, on touche le terminal du serveur (pas la carte du restaurant) */
        async addition(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="ardoise"]', cam)), 5000); };
          if (!await avant(f, { question: 'Écoute le client.', qui: 'client', seg: ADDITION, gel: GEL_SERVEUR, consigne: "Qu'est-ce qu'il veut faire" + NB + "? Clique sur le bon objet dans l'image." })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(ADDITION[0], ADDITION[1], gel()); if (alive(f)) ask(); };
          zones(OBJETS, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (id === 'terminal') {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(z, 'Payer', 'juste');
              if (!await juste(f, 'Oui' + NB + "! Il veut payer l'addition.")) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(z, z.nom, 'faux');
              const montrer = await faux(f, ADDITION, z.pas); if (montrer === null) return;
              if (montrer) $('.hit[data-id="terminal"]', cam).classList.add('indice');
              ask();
            }
          });
          ask();
        },

        /* 2 · le prix : le serveur le redit (la vidéo resserrée sur lui), on le tape sur son terminal, puis la touche verte */
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
              const k = b.dataset.k, t = $('.tpe', side);
              if (k === 'valider') return valider();
              if (/^\d$/.test(k)) { if (saisie.length >= 3 || (!saisie && k === '0')) return secouer($('.tpe-ecran', side)); saisie += k; }
              else if (k === 'corriger') saisie = saisie.slice(0, -1);
              else saisie = '';
              t.classList.remove('faux'); afficher();
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

        /* 3 · par carte : le client le redit, on fait glisser sa carte bancaire sur le terminal (on peut aussi cliquer dessus) */
        async carte(f) {
          let fini = false;
          const T = () => $('.tpe', side);
          const glisser = () => {
            const a = $('.moyen[data-id="billets"] .pic', side), b = $('.tpe-ecran', side); if (!a || !b) return null;
            const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, x2 = s.left + s.width / 2, y2 = s.top + s.height / 2;
            return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(glisser, 4500); };
          const dessus = ev => { const r = T().getBoundingClientRect(); return ev.clientX >= r.left - 12 && ev.clientX <= r.right + 12 && ev.clientY >= r.top - 12 && ev.clientY <= r.bottom + 12; };
          function brancher(p) {
            $$('.moyen', p).forEach(b => {
              b.addEventListener('pointerdown', e => {
                if (document.body.dataset.turn !== 'you' || fini || e.button > 0) return;
                A.unlock(); idle.reset();
                const x0 = e.clientX, y0 = e.clientY, pic = $('.pic', b); let vol = null;
                try { b.setPointerCapture(e.pointerId); } catch (err) {}
                const placer = ev => { vol.style.left = ev.clientX - vol.offsetWidth / 2 + 'px'; vol.style.top = ev.clientY - vol.offsetHeight / 2 + 'px'; };
                const bouge = ev => {
                  if (!vol && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) {
                    vol = document.createElement('div'); vol.className = 'moyen-vol'; vol.innerHTML = pic.innerHTML; document.body.append(vol); b.classList.add('tenu'); sfx.tick();
                  }
                  if (vol) { placer(ev); T().classList.toggle('survol', dessus(ev)); }
                };
                const lache = ev => {
                  b.removeEventListener('pointermove', bouge); b.removeEventListener('pointerup', lache); b.removeEventListener('pointercancel', lache);
                  if (!vol) return;                        // un simple clic : géré par « click »
                  b.dataset.glisse = '1'; T().classList.remove('survol');
                  if (ev.type === 'pointerup' && dessus(ev) && document.body.dataset.turn === 'you') { vol.remove(); b.classList.remove('tenu'); choisir(b); return; }
                  const r = pic.getBoundingClientRect(), v = vol.getBoundingClientRect();
                  vol.animate([{ transform: 'none' }, { transform: `translate(${r.left - v.left}px, ${r.top - v.top}px) rotate(6deg) scale(.9)` }], { duration: 380, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' })
                    .finished.catch(() => {}).then(() => { vol.remove(); b.classList.remove('tenu'); });
                };
                b.addEventListener('pointermove', bouge); b.addEventListener('pointerup', lache); b.addEventListener('pointercancel', lache);
              });
              b.addEventListener('click', async () => {
                if (b.dataset.glisse) { delete b.dataset.glisse; return; }
                if (document.body.dataset.turn !== 'you' || fini) return;
                A.unlock(); idle.clear(); setTurn('wait');
                await fly($('.pic', b), $('.tpe-ecran', side), `<div class="vol-pic">${$('.pic', b).innerHTML}</div>`, { scale: .7 });
                if (alive(f)) choisir(b);
              });
            });
          }
          if (!await avant(f, {
            question: 'Écoute encore le client.', qui: 'client', seg: CARTE, gel: GEL_CLIENT, sideW: 540, consigne: 'Il veut payer comment' + NB + '? Fais glisser le bon objet sur le terminal.',
            panneau: `<div class="panel glass"><p class="ptitre">Fais glisser le bon objet sur le terminal</p><div class="caisse">${terminal(false, 'À payer', euros(PRIX))}
              <div class="poche">${MOYENS.map(m => `<button class="tuile moyen" data-id="${m.id}"><span class="pic">${SVG[m.id]}</span><span class="nom">${m.nom}</span></button>`).join('')}</div></div></div>`,
            monte: brancher,
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(CARTE[0], CARTE[1], gel()); if (!alive(f)) return; if (fini) setTurn('you'); else ask(); };
          async function choisir(b) {
            setTurn('wait'); idle.clear(); sfx.tick();
            const t = T(), m = MOYENS.find(x => x.id === b.dataset.id);
            if (m.id === 'carte') {
              fini = true; $$('.moyen', side).forEach(x => x.classList.remove('indice', 'faux'));
              b.classList.add('juste', 'posee'); t.classList.add('juste');
              t.insertAdjacentHTML('beforeend', `<span class="tpe-carte">${SVG.carte}</span>`); $('#tpe-etat', side).textContent = '✓ Paiement accepté';
              if (!await juste(f, 'Oui' + NB + '! Il paie par carte.', OUI)) return;
              suite();
            } else {
              b.classList.add('faux'); t.classList.add('faux'); secouer(t);
              const montrer = await faux(f, CARTE, m.pas); if (montrer === null) return;
              b.classList.remove('faux'); t.classList.remove('faux');
              if (montrer) $('.moyen[data-id="carte"]', side).classList.add('indice');
              ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        serveur: [{ text: 'Ça fait vingt-huit euros.', seg: A.phrase('ça fait vingt-huit euros') }, { text: 'Oui, bien sûr.', seg: A.ligne(3) }],
        client: [{ text: "J'aimerais payer l'addition.", seg: A.ligne(0) }, { text: 'Je peux payer par carte' + A.NB + '?', seg: [A.ligne(2)[0], 6.44] }],
      },
    }),
  };
})();
