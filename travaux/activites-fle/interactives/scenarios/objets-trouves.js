/* Aux objets trouvés : la dame redit le numéro de son bus (la vidéo resserrée sur elle), on le compose sur la girouette d'un
   bus avec le clavier ; puis elle redit comment est son sac et, dans la vidéo, sur l'image où l'agent arrive devant
   l'étagère (avant qu'il prenne le sac), on clique sur son sac parmi les vrais sacs ; la fin de la scène repart alors. */
window.SCENARIO = (() => {
  const BON = '12';
  const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  /* le nombre tapé, en lettres, pour le message d'erreur (« Ça, c'est le bus vingt et un. ») */
  const enLettres = n => {
    if (n < 20) return UNITES[n];
    if (n < 70) { const u = n % 10; return DIZAINES[Math.floor(n / 10)] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + UNITES[u]); }
    if (n < 80) return n === 71 ? 'soixante et onze' : 'soixante-' + UNITES[n - 60];
    return n === 80 ? 'quatre-vingts' : 'quatre-vingt-' + UNITES[n - 80];
  };
  /* l'avant d'un bus de ville, avec sa girouette (le numéro de la ligne) */
  const BUS = `<svg viewBox="0 0 300 236" role="img" aria-label="L'avant du bus et son numéro">
      <path d="M22 74h10M268 74h10" stroke="#2A2E38" stroke-width="5" stroke-linecap="round"/>
      <rect x="6" y="64" width="16" height="42" rx="7" fill="#2A2E38"/><rect x="278" y="64" width="16" height="42" rx="7" fill="#2A2E38"/>
      <path d="M30 42a34 34 0 0 1 34-34h172a34 34 0 0 1 34 34v128H30z" fill="#F3F1EC"/>
      <path d="M30 170h240v26a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14z" fill="#17A589"/>
      <rect class="girouette" x="54" y="18" width="192" height="52" rx="11" fill="#14161E"/>
      <text id="ligne" class="vide" x="150" y="57" text-anchor="middle">– –</text>
      <rect x="42" y="80" width="216" height="82" rx="14" fill="#2B3647"/>
      <path d="M62 160 120 82h30L92 160z" fill="#fff" opacity=".08"/><path d="M106 160 164 82h12l-58 78z" fill="#fff" opacity=".06"/>
      <path d="M150 159 116 120" stroke="#11151D" stroke-width="3" stroke-linecap="round"/>
      <rect x="44" y="179" width="44" height="17" rx="8.5" fill="#FFF4CC"/><rect x="212" y="179" width="44" height="17" rx="8.5" fill="#FFF4CC"/>
      <rect x="122" y="182" width="56" height="12" rx="4" fill="#F3F1EC"/>
      <rect x="34" y="208" width="232" height="10" rx="5" fill="#2A2E38"/>
      <rect x="52" y="214" width="36" height="18" rx="6" fill="#1B1E25"/><rect x="212" y="214" width="36" height="18" rx="6" fill="#1B1E25"/>
    </svg>`;
  const EFFACE = '<svg viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4h15a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-7-8z"/><path d="m13 9 6 6M19 9l-6 6"/></svg>';
  /* les sacs de l'étagère, sur l'image à 7,27 s (l'agent lève la main, il n'a pas encore pris le sac), en % */
  const GEL_SAC = 7.27;
  const SACS = [
    { id: 'marron', label: 'Un sac marron', x: 0, y: 34, w: 15, h: 33 },
    { id: 'noir', label: 'Un sac noir', x: 32, y: 37, w: 15, h: 30 },
    { id: 'fleur', label: 'Un sac noir avec une fleur', x: 47.5, y: 34, w: 25, h: 34 },
  ];

  return {
    plans: [{ de: 0, cx: { agent: .27, dame: .72 } }, { de: 7.17, cx: { agent: .3, dame: .5 } }, { de: 7.96, cx: { agent: .26, dame: .72 } }],
    ordre: ['bus', 'sac'],
    bravo: 'Super ! La dame a retrouvé son sac.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel } = A;
      const NUMERO = ligne(2), COULEUR = ligne(4);
      const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · le bus : elle redit « le bus numéro douze », on compose le numéro sur la girouette (clavier), puis Valider */
        async bus(f) {
          let tape = '', averti = false;
          const afficher = () => { const t = $('#ligne', side); if (!t) return; t.textContent = tape || '– –'; t.classList.toggle('vide', !tape); };
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            idle.set(() => tapHere(tape ? $('#goSlot .go') : $('.touche[data-k="5"]', side))(), 5000);
          };
          const taper = k => {
            if (document.body.dataset.turn !== 'you' || !$('.clavier', side)) return;
            A.unlock(); idle.reset(); sfx.tick();
            const bus = $('.bus', side); bus.classList.remove('faux');
            if (k === 'x') tape = tape.slice(0, -1);
            else if (tape.length < 2) tape += k;
            else { secouer(bus); Q.show('you', 'Deux chiffres, pas plus.'); averti = true; return; }
            if (averti) { averti = false; Q.show('you', state.ask); }
            afficher();
          };
          if (!await avant(f, {
            question: 'Écoute la dame.', qui: 'dame', seg: NUMERO, sideW: 440, consigne: 'Elle a pris quel bus' + NB + '? Clique sur les chiffres.',
            panneau: `<div class="panel glass"><p class="ptitre">Le numéro du bus</p><div class="bus">${BUS}</div>
              <div class="clavier" role="group" aria-label="Les chiffres">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button class="touche" data-k="${k}">${k}</button>`).join('')}
                <button class="touche zero" data-k="0">0</button><button class="touche efface" data-k="x" aria-label="Effacer">${EFFACE}</button></div></div>`,
            monte: p => $$('.touche', p).forEach(b => b.addEventListener('click', () => taper(b.dataset.k))),
          })) return;
          /* au clavier aussi : les chiffres et la touche d'effacement */
          const auClavier = e => {
            if (!alive(f)) { removeEventListener('keydown', auClavier); return; }
            if (/^[0-9]$/.test(e.key)) taper(e.key); else if (e.key === 'Backspace') taper('x');
          };
          addEventListener('keydown', auClavier);
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(NUMERO[0], NUMERO[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!tape) { Q.show('you', 'Clique sur les chiffres.'); averti = true; return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const bus = $('.bus', side);
            if (tape === BON) {
              bus.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Le bus numéro douze.', phrase('le bus numéro douze'))) return;
              suite();
            } else {
              bus.classList.add('faux'); secouer(bus);
              const montrer = await faux(f, NUMERO, "Ça, c'est le bus " + enLettres(parseInt(tape, 10)) + '. Écoute encore.'); if (montrer === null) return;
              bus.classList.remove('faux'); tape = ''; afficher();
              if (montrer) {
                tape = BON; afficher(); bus.classList.add('juste');
                $$('.touche[data-k="1"], .touche[data-k="2"]', side).forEach(b => b.classList.add('indice'));
                Q.show('ok', 'Le bus numéro douze' + NB + ': 1 et 2.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 2 · dans la vidéo : elle redit comment est son sac ; sur l'étagère, on clique sur le sac noir à la petite fleur rouge */
        async sac(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="marron"]', cam)), 5000); };
          /* la question sur l'image d'ensemble (la dame, comme à l'étape 1) ; sa réplique finit sur la coupe vers l'étagère, et
             la vidéo s'arrête là : avant() a déjà figé l'image d'ensemble quand on passe à l'image de l'étagère (state.gel) */
          const pret = avant(f, { question: 'Écoute encore la dame.', qui: 'dame', seg: COULEUR, consigne: 'Clique sur le sac de la dame.' });
          state.gel = GEL_SAC;
          if (!await pret) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(COULEUR[0], COULEUR[1], gel()); if (alive(f)) ask(); };
          zones(SACS, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (id === 'fleur') {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(z, 'Son sac', 'juste');
              if (!await juste(f, 'Oui' + NB + '! Noir avec une petite fleur rouge.')) return;
              await wait(1500); if (!alive(f)) return;
              /* la fin de la scène : l'agent prend le sac et le lui donne */
              zones(null); $$('.surimage', cam).forEach(e => e.remove()); setTurn('listen');
              await playSegment(GEL_SAC, ligne(6)[1], null); if (!alive(f)) return;
              suite();
            } else {
              cadreZone(z, 'faux'); marque(z, id === 'noir' ? 'pas de fleur' : 'marron', 'faux');
              const montrer = await faux(f, COULEUR, id === 'noir' ? "Il est noir, mais il n'a pas de fleur. Écoute encore." : 'Non, ce sac est marron. Écoute encore.'); if (montrer === null) return;
              if (montrer) $('.hit[data-id="fleur"]', cam).classList.add('indice');
              ask();
            }
          });
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        agent: [{ text: 'Quel bus' + A.NB + '?', seg: A.ligne(1) }, { text: 'Il est de quelle couleur votre sac' + A.NB + '?', seg: A.ligne(3) }, { text: "C'est celui-ci" + A.NB + '?', seg: A.ligne(5) }],
        dame: [{ text: "J'ai perdu mon sac dans le bus.", seg: A.phrase("j'ai perdu mon sac dans le bus") }, { text: 'le bus numéro douze', seg: A.phrase('le bus numéro douze') },
          { text: 'noir avec une petite fleur rouge', seg: A.phrase('noir avec une petite fleur rouge') }],
      },
    }),
  };
})();
