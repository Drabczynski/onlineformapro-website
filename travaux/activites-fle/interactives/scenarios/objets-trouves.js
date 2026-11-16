/* Aux objets trouvés, dans l'ordre du dialogue : la dame redit « j'ai perdu mon sac dans le bus » (la vidéo resserrée sur
   elle) ; sur le plan large, au comptoir, on cherche parmi les objets trouvés des étagères ce qu'elle a perdu (un sac) ;
   elle redit le numéro de son bus, on le compose sur la girouette d'un bus avec le clavier ; elle redit comment est son
   sac, on clique sur le bon parmi six sacs dessinés (noir, petite fleur rouge). Quand c'est juste : le bravo, et la suite. */
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

  /* 1 · ce qu'elle a perdu : les objets trouvés du plan large (image figée à 6,94 s), en %. Justes : tous les sacs à main
     (le sien, à l'épaule, aussi : c'est un sac). Les sacs à dos ne sont pas cliquables (« un sac » aussi : ambigu). */
  const OBJETS = [
    { id: 'sac-coin', sac: true, label: 'Un sac', x: 0, y: 0, w: 6, h: 6.5 },
    { id: 'sac-noir', sac: true, label: 'Un sac', x: 0, y: 18, w: 9.8, h: 17.5 },
    { id: 'sac-beige', sac: true, label: 'Un sac', x: 60.6, y: 13, w: 6.8, h: 17.5 },
    { id: 'sac-noir2', sac: true, label: 'Un sac', x: 51.6, y: 39, w: 7.6, h: 12 },
    { id: 'sac-marron', sac: true, label: 'Un sac', x: 61.5, y: 32.5, w: 7.3, h: 18 },
    { id: 'sac-fermoir', sac: true, label: 'Un sac', x: 58.8, y: 40, w: 7.4, h: 11 },
    { id: 'sac-bas', sac: true, label: 'Des sacs', x: 59.6, y: 54.5, w: 7.4, h: 10 },
    { id: 'sac-epaule', sac: true, label: 'Un sac', x: 83.3, y: 63, w: 5, h: 33 },
    { id: 'parapluies', label: 'Des parapluies', msg: 'Ce sont des parapluies.', x: 31.5, y: 14.5, w: 9, h: 44 },
    { id: 'echarpes', label: 'Des écharpes', msg: 'Ce sont des écharpes.', x: 40.2, y: 16.5, w: 11, h: 50 },
    { id: 'bannettes', label: 'Des bannettes', msg: 'Ce sont des bannettes, pour le courrier.', x: 0, y: 51, w: 12.2, h: 26 },
    { id: 'calendrier', label: 'Un calendrier', msg: "C'est un calendrier.", x: 79.8, y: 17, w: 8, h: 27 },
    { id: 'telephone', label: 'Un téléphone', msg: "C'est un téléphone.", x: 59.6, y: 64.5, w: 5.6, h: 8 },
    { id: 'calculatrice', label: 'Une calculatrice', msg: "C'est une calculatrice.", x: 46.8, y: 69.5, w: 7.2, h: 6 },
    { id: 'brochures', label: 'Des brochures', msg: 'Ce sont des brochures.', x: 54, y: 51, w: 5.6, h: 24.5 },
  ];
  /* l'étiquette au-dessus d'une zone, ou dessous quand la zone touche le haut de l'image */
  const ou = z => (z.y < 8 ? { ...z, y: z.y + z.h + 7.5 } : z);

  /* 3 · comment est son sac : six sacs dessinés, un seul noir avec une petite fleur rouge */
  const FLEUR = (x, y, r, c) => [0, 1, 2, 3, 4].map(k => { const a = (k * 72 - 90) * Math.PI / 180; return `<circle cx="${(x + r * Math.cos(a)).toFixed(1)}" cy="${(y + r * Math.sin(a)).toFixed(1)}" r="${(r * .8).toFixed(1)}" fill="${c}"/>`; }).join('')
    + `<circle cx="${x}" cy="${y}" r="${(r * .55).toFixed(1)}" fill="#FFD34D"/>`;
  const PETITE = c => FLEUR(86, 70, 4.6, c), GRANDE = c => FLEUR(60, 67, 12.5, c);
  const DESSIN = (corps, fleur) => `<svg viewBox="0 0 120 100" aria-hidden="true">
      <path d="M38 41C38 12 82 12 82 41" fill="none" stroke="${corps}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M22 38H98Q104 38 105 44L110 84Q111 92 103 92H17Q9 92 10 84L15 44Q16 38 22 38Z" fill="${corps}"/>
      <path d="M15.5 51H104.5" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
      <rect x="54" y="46" width="12" height="9" rx="2.5" fill="#D8B45C"/>
      <path d="M22 38H98Q104 38 105 44L110 84Q111 92 103 92H17Q9 92 10 84L15 44Q16 38 22 38Z" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>
      ${fleur}</svg>`;
  const NOIR = '#1F2026', MARRON = '#7B4A2B', ROUGE = '#C8322B', ROUGEF = '#E8383A';
  const SACS = [
    { id: 'marron', nom: 'Un sac marron avec une petite fleur rouge', svg: DESSIN(MARRON, PETITE(ROUGEF)), msg: 'Ce sac est marron.' },
    { id: 'grande', nom: 'Un sac noir avec une grande fleur rouge', svg: DESSIN(NOIR, GRANDE(ROUGEF)), msg: 'La fleur est grande.' },
    { id: 'sans', nom: 'Un sac noir sans fleur', svg: DESSIN(NOIR, ''), msg: "Il n'a pas de fleur." },
    { id: 'rouge', nom: 'Un sac rouge avec une petite fleur noire', svg: DESSIN(ROUGE, PETITE('#15161A')), msg: 'Ce sac est rouge, la fleur est noire.' },
    { id: 'bon', nom: 'Un sac noir avec une petite fleur rouge', svg: DESSIN(NOIR, PETITE(ROUGEF)) },
    { id: 'blanche', nom: 'Un sac noir avec une petite fleur blanche', svg: DESSIN(NOIR, PETITE('#FFFFFF')), msg: 'La fleur est blanche.' },
  ];
  /* la dame redit « il est noir avec une petite fleur rouge » ; la vidéo coupe sur l'étagère (et sur son sac) à 7,17 s,
     avant la fin du mot « rouge » : la réécoute s'arrête juste avant la coupe, pour ne pas montrer la réponse */
  const COUPE = 7.17;

  return {
    plans: [{ de: 0, cx: { agent: .27, dame: .72 } }, { de: COUPE, cx: { agent: .3, dame: .5 } }, { de: 7.96, cx: { agent: .26, dame: .72 } }],
    ordre: ['perdu', 'bus', 'sac'],
    bravo: 'Super ! La dame a retrouvé son sac.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, sfx, faux, juste, suite, goBtn, zones, cam, avant, cadreZone, marque, gel } = A;
      const PERDU = ligne(0), NUMERO = ligne(2), COULEUR = [ligne(4)[0], COUPE - .02];
      const secouer = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · dans la vidéo : elle redit qu'elle a perdu son sac ; sur le plan large, on cherche un sac parmi les objets trouvés */
        async perdu(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="echarpes"]', cam)), 5000); };
          if (!await avant(f, { qui: 'dame', seg: PERDU, consigne: "Qu'est-ce qu'elle a perdu" + NB + '? Clique dessus dans l\'image.' })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(PERDU[0], PERDU[1], gel()); if (alive(f)) ask(); };
          zones(OBJETS, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            if (z.sac) {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(z); marque(ou(z), z.label, 'juste');
              if (!await juste(f, id === 'sac-epaule' ? 'Oui' + NB + '! Un sac.' : 'Oui' + NB + '! Elle a perdu son sac.')) return;
              zones(null); suite();
            } else {
              cadreZone(z, 'faux'); marque(ou(z), z.label, 'faux');
              const montrer = await faux(f, PERDU, z.msg); if (montrer === null) return;
              if (montrer) OBJETS.filter(x => x.sac).forEach(x => $(`.hit[data-id="${x.id}"]`, cam).classList.add('indice'));
              ask();
            }
          });
          ask();
        },

        /* 2 · le bus : elle redit « le bus numéro douze », on compose le numéro sur la girouette (clavier), puis Valider */
        async bus(f) {
          let tape = '', averti = false;
          const afficher = () => { const t = $('#ligne', side); if (!t) return; t.textContent = tape || '– –'; t.classList.toggle('vide', !tape); };
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            idle.set(() => tapHere(tape ? $('#goSlot .go') : $('.touche[data-k="5"]', side))(), 5000);
          };
          const taper = k => {
            const clavier = $('.clavier', side);
            if (document.body.dataset.turn !== 'you' || !clavier || clavier.classList.contains('fini')) return;
            A.unlock(); idle.reset(); sfx.tick();
            const bus = $('.bus', side); bus.classList.remove('faux');
            if (k === 'x') tape = tape.slice(0, -1);
            else if (tape.length < 2) tape += k;
            else { secouer(bus); Q.show('you', 'Deux chiffres, pas plus.'); averti = true; return; }
            if (averti) { averti = false; Q.show('you', state.ask); }
            afficher();
          };
          if (!await avant(f, {
            qui: 'dame', seg: NUMERO, sideW: 440, consigne: 'Elle a pris quel bus' + NB + '? Clique sur les chiffres.',
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
              bus.classList.add('juste'); $('.clavier', side).classList.add('fini');
              if (!await juste(f, 'Oui' + NB + '! Le bus numéro douze.')) return;
              suite();
            } else {
              bus.classList.add('faux'); secouer(bus);
              const montrer = await faux(f, NUMERO, "Ça, c'est le bus " + enLettres(parseInt(tape, 10)) + '.'); if (montrer === null) return;
              bus.classList.remove('faux'); tape = ''; afficher();
              if (montrer) {
                tape = BON; afficher(); bus.classList.add('juste'); $('.clavier', side).classList.add('fini');
                $$('.touche[data-k="1"], .touche[data-k="2"]', side).forEach(b => b.classList.add('indice'));
                Q.show('ok', 'Le bus numéro douze' + NB + ': 1 et 2.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · son sac : elle redit comment il est ; on clique sur le bon parmi six sacs dessinés */
        async sac(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.modele', side)), 5000); };
          if (!await avant(f, {
            qui: 'dame', seg: COULEUR, sideW: 520, consigne: 'Son sac est comment' + NB + '? Clique sur le bon sac.',
            panneau: `<div class="panel glass"><p class="ptitre">Clique sur son sac.</p>
              <div class="rayon">${SACS.map(s => `<button class="tuile modele" data-id="${s.id}" aria-label="${s.nom}"><span class="dessin">${s.svg}</span></button>`).join('')}</div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); await playSegment(COULEUR[0], COULEUR[1], gel()); if (alive(f)) ask(); };
          $$('.modele', side).forEach(b => b.addEventListener('click', async () => {
            if (document.body.dataset.turn !== 'you') return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            if (b.dataset.id === 'bon') {
              $$('.modele', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Noir avec une petite fleur rouge.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, COULEUR, SACS.find(s => s.id === b.dataset.id).msg); if (montrer === null) return;
              b.classList.remove('faux');
              if (montrer) $('.modele[data-id="bon"]', side).classList.add('indice');
              ask();
            }
          }));
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
