/* Une table pour deux : un couple entre au restaurant ; le client demande une table pour deux, le serveur les conduit
   (« Bien sûr, par ici. ») et donne le menu ; elle dit « Merci beaucoup ».
   1 · le client redit sa demande (la vidéo resserrée sur lui) : à côté, une table de restaurant vue de dessus, six places
       autour ; on met les couverts comme le serveur (on clique sur une place pour mettre ou retirer un couvert), puis on
       valide. Juste : deux couverts, n'importe où. (Image figée : le serveur seul, de face, la cliente de dos.)
   2 · dans la vidéo, un QTE : on appuie sur le bouton quand le serveur dit « par ici » (pas sur « Bien sûr », pas sur la
       demande du client). */
window.SCENARIO = (() => {
  const NB = ' ';     // l'espace fine avant ? ! : (comme dans le moteur)
  const GEL_SERVEUR = 4.3; // le serveur de face, la cliente de dos : l'image ne dit pas combien ils sont
  const LETTRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];
  const Maj = s => s[0].toUpperCase() + s.slice(1);
  /* les six places autour de la table (en % du plateau) : deux de chaque côté, une à chaque bout ; « c » = où est la chaise */
  const PLACES = [
    { id: 0, x: 35, y: 33, c: 'haut' }, { id: 1, x: 65, y: 33, c: 'haut' },
    { id: 2, x: 35, y: 67, c: 'bas' }, { id: 3, x: 65, y: 67, c: 'bas' },
    { id: 4, x: 21, y: 50, c: 'gauche' }, { id: 5, x: 79, y: 50, c: 'droite' },
  ];
  /* un couvert vu de dessus : la fourchette, l'assiette, le couteau, le verre */
  const COUVERT = `<svg viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="58" cy="13" r="7.5" fill="rgba(255,255,255,.55)" stroke="#AFC3D3" stroke-width="1.6"/><circle cx="58" cy="13" r="4.4" fill="none" stroke="#D7E3EC" stroke-width="1.2"/>
      <path d="M10 26v13M13 26v13M16 26v13M10 39c0 4 6 4 6 0M13 42v28" stroke="#C3C8D0" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <circle cx="40" cy="46" r="21" fill="#fff" stroke="#DCE1E8" stroke-width="1.6"/><circle cx="40" cy="46" r="13.5" fill="none" stroke="#E7EAF0" stroke-width="1.4"/>
      <path d="M67 26c3.6 4 3.6 13 0 17v27" stroke="#C3C8D0" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>`;
  /* le plateau de la table, les six chaises autour (dessinées, toujours là) */
  const CHAISE = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-17" y="-13" width="34" height="26" rx="7" fill="#7A4E2D"/><rect x="-17" y="-17" width="34" height="8" rx="4" fill="#5B3920"/></g>`;
  const PLATEAU = `<svg class="tbl-svg" viewBox="0 0 400 260" aria-hidden="true">
      ${CHAISE(140, 28, 0)}${CHAISE(260, 28, 0)}${CHAISE(140, 232, 180)}${CHAISE(260, 232, 180)}${CHAISE(28, 130, -90)}${CHAISE(372, 130, 90)}
      <rect x="50" y="46" width="300" height="168" rx="14" fill="#C08A55"/><rect x="50" y="46" width="300" height="168" rx="14" fill="none" stroke="#9C6B3E" stroke-width="3"/>
      <path d="M66 70h268M66 94h268M66 118h268M66 142h268M66 166h268M66 190h268" stroke="rgba(120,74,36,.18)" stroke-width="2"/>
      <rect x="182" y="118" width="36" height="24" rx="5" fill="#E9DFC9"/><circle cx="194" cy="130" r="5" fill="#fff" stroke="#C9BFA9"/><circle cx="207" cy="130" r="5" fill="#6B6B6B"/></svg>`;

  return {
    plans: [{ de: 0, cx: { client: .4, cliente: .56 } }, { de: 1.29, cx: { serveur: .38, cliente: .62, client: .9 } },
      { de: 2.125, cx: { client: .35, cliente: .72 } }, { de: 4.04, cx: { serveur: .36, cliente: .88, client: .5 } },
      { de: 5.17, cx: { serveur: .35, client: .6, cliente: .72 } }, { de: 8.125, cx: { cliente: .6, client: .6, serveur: .3 } }],
    ordre: ['couverts', 'parici'],
    bravo: 'Bravo' + NB + '! Ils ont leur table pour deux.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, sfx, faux, juste, suite, goBtn, avant, qte, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      return {
        /* 1 · le client redit sa demande : on met les couverts sur la table (deux), puis on valide */
        async couverts(f) {
          const DEMANDE = ligne(0);
          const mis = new Set(); state.vide = false;
          const place = id => $(`.tbl-place[data-id="${id}"]`, side);
          const compte = () => { const n = mis.size; return n ? (n === 1 ? '1 couvert' : n + ' couverts') : 'Pas de couvert'; };
          function peindre() {
            $$('.tbl-place', side).forEach(b => {
              const on = mis.has(+b.dataset.id);
              b.classList.toggle('mis', on); b.setAttribute('aria-pressed', on);
              b.setAttribute('aria-label', (on ? 'Retirer le couvert, place ' : 'Mettre un couvert, place ') + (+b.dataset.id + 1));
            });
            const l = $('.tbl-compte', side); if (l) l.textContent = compte();
          }
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            const vide = PLACES.find(p => !mis.has(p.id)); idle.set(tapHere(place(vide ? vide.id : 0)), 5000);
          };
          if (!await avant(f, {
            qui: 'client', seg: DEMANDE, gel: GEL_SERVEUR, sideW: 540,
            consigne: 'Une table pour combien' + NB + '? Clique sur les places pour mettre les couverts, puis sur Valider.',
            panneau: `<div class="panel glass tbl"><p class="ptitre">Clique sur les places pour mettre les couverts, puis sur Valider.</p>
              <div class="tbl-plateau" role="group" aria-label="La table du restaurant, vue de dessus">${PLATEAU}
                ${PLACES.map(p => `<button class="tbl-place" data-id="${p.id}" data-c="${p.c}" style="left:${p.x}%;top:${p.y}%" aria-pressed="false"><span class="tbl-vide" aria-hidden="true">+</span><span class="tbl-couvert">${COUVERT}</span></button>`).join('')}
              </div><p class="tbl-compte" aria-live="polite">Pas de couvert</p></div>`,
            monte: p => {
              $$('.tbl-place', p).forEach(b => b.addEventListener('click', () => {
                if (!tour()) return; A.unlock(); idle.reset(); sfx.tick();
                const id = +b.dataset.id; mis.has(id) ? mis.delete(id) : mis.add(id);
                $$('.tbl-place', side).forEach(x => x.classList.remove('faux'));
                if (state.vide) { state.vide = false; Q.show('you', state.ask); }
                peindre();
              }));
              peindre();
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(DEMANDE[0], DEMANDE[1], gel()); if (alive(f)) ask(); };
          const bien = () => { $$('.tbl-place.mis', side).forEach(b => b.classList.add('juste')); $$('.tbl-place', side).forEach(b => { b.disabled = true; }); const l = $('.tbl-compte', side); l.textContent = 'Une table pour deux'; l.classList.add('juste'); };
          async function valider() {
            if (!tour()) return;
            if (!mis.size) { state.vide = true; Q.show('you', 'La table est vide. Clique sur les places.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (mis.size === 2) {
              bien();
              if (!await juste(f, 'Oui' + NB + '! Une table pour deux.')) return;
              suite(); return;
            }
            const n = mis.size;
            $$('.tbl-place.mis', side).forEach(b => b.classList.add('faux'));
            const pl = $('.tbl-plateau', side); pl.classList.remove('shake'); void pl.offsetWidth; pl.classList.add('shake');
            const msg = n === 1 ? "Un couvert, c'est pour une personne." : Maj(LETTRES[n]) + " couverts, c'est pour " + LETTRES[n] + ' personnes.';
            const montrer = await faux(f, DEMANDE, msg); if (montrer === null) return;
            mis.clear(); $$('.tbl-place', side).forEach(b => b.classList.remove('faux')); peindre();
            if (montrer) {                                       // deux essais : on pose la réponse, deux couverts face à face
              mis.add(0); mis.add(2); peindre(); bien();
              Q.show('ok', 'Une table pour deux' + NB + ': deux couverts.'); state.essais = 0; suite();
            } else ask();
          }
          ask();
        },

        /* 2 · dans la vidéo, un QTE : appuyer sur le bouton quand le serveur dit « par ici » */
        async parici(f) {
          const PAR = phrase('par ici'), fin = PAR[1] + .6;
          if (!await qte(f, { mot: 'par ici', consigne: 'Appuie sur le bouton quand le serveur dit par ici.', de: ligne(0)[0] - .1, a: fin + .9,
            cibles: [{ s: PAR[0] - .1, e: fin }],
            pieges: [
              { s: ligne(0)[0] - .1, e: ligne(0)[1] + .2, msg: 'Pas encore' + NB + ': là, le client demande une table.' },
              { s: ligne(0)[1] + .2, e: PAR[0] - .1, msg: 'Presque' + NB + '! Là, le serveur dit «' + NB + 'Bien sûr' + NB + '».' },
              { s: fin, e: fin + 1.2, msg: 'Trop tard' + NB + ': ils marchent déjà vers la table.' },
            ],
            juste: 'Oui' + NB + '! «' + NB + 'Par ici' + NB + '»' + NB + ': le serveur montre le chemin.',
            montre: "C'est là" + NB + ': «' + NB + 'Bien sûr, par ici.' + NB + '»' })) return;
          suite();
        },
      };
    },
    bilan: A => ({
      tags: { client: 'pour deux' },
      faits: {
        serveur: [{ text: 'Bien sûr, par ici.', seg: A.ligne(1) }, { text: 'Voici le menu.', seg: A.ligne(2) }],
        client: [{ text: 'Bonjour' + A.NB + '!', seg: A.phrase('Bonjour') }, { text: 'une table pour deux', seg: A.phrase('une table pour deux') }, { text: "s'il vous plaît", seg: A.phrase("s'il vous plaît") }],
        cliente: [{ text: 'Elle prend le menu.', seg: [A.ligne(2)[0], A.ligne(3)[1]] }, { text: 'Merci beaucoup.', seg: A.ligne(3) }],
      },
    }),
  };
})();
