/* Café ou thé ? Dans la cuisine du bureau, elle lui propose un café ; il préfère un thé, sans sucre (et ils se tutoient).
   1 · dans la vidéo, un QTE : on appuie sur le bouton quand l'homme dit « thé » (pas quand elle dit « café ») ;
   2 · il redit ses deux réponses (la vidéo resserrée sur lui) : à côté, une tasse et quatre choses autour (du thé, du café,
       du sucre, du lait) ; on met dans la tasse ce qu'il veut (glisser ou cliquer ; cliquer dans la tasse pour retirer),
       puis on clique sur Servir. Juste : le thé seul. (À l'image, ni thé ni sucre : rien ne donne la réponse.) */
window.SCENARIO = (() => {
  const NB = ' ';
  /* les quatre choses autour de la tasse, dessinées simplement (64 × 64) */
  const CUBE = (x, y) => `<g transform="translate(${x} ${y})" stroke="#B9B3A7" stroke-width=".9" stroke-linejoin="round"><path d="M6 13l14-7 14 7-14 7z" fill="#fff"/><path d="M6 13v14l14 7V20z" fill="#EDEAE3"/><path d="M34 13v14l-14 7V20z" fill="#D9D4CA"/></g>`;
  const SVG = {
    the: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 24c0-8 5-13 11-14" fill="none" stroke="#A08A64" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="40" y="3" width="19" height="13" rx="2.5" fill="#3FA34D"/><path d="M45 13.5c0-4.5 3.4-7 9-7-.8 4.6-3.6 7-9 7z" fill="#fff"/>
      <path d="M17 24h30l2 33H15z" fill="#EAD9B5" stroke="#C9B080" stroke-width="1"/><path d="M17 24h30v6H17z" fill="#D6BE8C"/>
      <g fill="#9A7442"><circle cx="24" cy="39" r="1.7"/><circle cx="33" cy="45" r="1.7"/><circle cx="40" cy="37" r="1.5"/><circle cx="27" cy="50" r="1.5"/><circle cx="39" cy="51" r="1.7"/></g></svg>`,
    cafe: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M45 22h4a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6h-4" fill="none" stroke="#2B2B33" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 18h31l-2 35a6 6 0 0 1-6 6H23a6 6 0 0 1-6-6z" fill="#E3EDF3" stroke="#98AEBE" stroke-width="1.5"/>
      <path d="M16 31h29l-1.3 21.5a5 5 0 0 1-5 4.5H22.3a5 5 0 0 1-5-4.5z" fill="#5A3418"/><path d="M16.2 31.5h28.6" stroke="#8C5A33" stroke-width="2"/>
      <path d="M12 12.5a2 2 0 0 1 2-2h33a2 2 0 0 1 2 2V19H12z" fill="#2B2B33"/><path d="M12 13.5 6 17l6 2z" fill="#2B2B33"/><rect x="26" y="5" width="9" height="6" rx="2" fill="#2B2B33"/></svg>`,
    sucre: `<svg viewBox="0 0 64 64" aria-hidden="true">${CUBE(-3, 24)}${CUBE(25, 24)}${CUBE(11, 8)}</svg>`,
    lait: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="24" y="3" width="16" height="6" rx="1" fill="#E6EDF6" stroke="#93AACB" stroke-width="1.4"/>
      <path d="M18 22l6-13h16l6 13z" fill="#E6EDF6" stroke="#93AACB" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="18" y="22" width="28" height="39" rx="2" fill="#fff" stroke="#93AACB" stroke-width="1.4"/>
      <path d="M18 42h28v17a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2z" fill="#3B82C4"/><path d="M32 26c-4.2 5-6.2 7.6-6.2 10.2a6.2 6.2 0 0 0 12.4 0c0-2.6-2-5.2-6.2-10.2z" fill="#3B82C4"/></svg>`,
  };
  const CHOSES = [
    { id: 'cafe', nom: 'du café', aria: 'Du café' },
    { id: 'the', nom: 'du thé', aria: 'Un sachet de thé' },
    { id: 'sucre', nom: 'du sucre', aria: 'Du sucre' },
    { id: 'lait', nom: 'du lait', aria: 'Du lait' },
  ];
  /* sa tasse (une grande tasse bleue sur sa soucoupe) : vide au début ; le liquide prend la couleur de ce qu'on y met ;
     avec le thé, le fil et l'étiquette du sachet pendent sur le bord */
  const TASSE = `<svg viewBox="0 0 240 200" aria-hidden="true">
      <ellipse cx="112" cy="184" rx="104" ry="13" fill="#E4DED2"/><ellipse cx="112" cy="182" rx="70" ry="8" fill="#D3CBBB"/>
      <path d="M178 82c30-8 44 10 40 28-4 20-24 30-44 27" fill="none" stroke="#4B7FAE" stroke-width="14" stroke-linecap="round"/>
      <path d="M42 60h140l-8 102c-1 10-8 16-18 16H68c-10 0-17-6-18-16z" fill="#5B8FBF"/>
      <path d="M146 60h36l-8 102c-1 10-8 16-18 16h-12c10 0 15-6 16-16z" fill="#4B7FAE"/>
      <path d="M54 74l5 82" stroke="rgba(255,255,255,.28)" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="112" cy="60" rx="70" ry="14" fill="#7AA8D2"/><ellipse cx="112" cy="61" rx="63" ry="10.5" fill="#E9EEF3"/>
      <ellipse class="liquide" cx="112" cy="63" rx="59" ry="8.5"/>
      <g class="sachet"><path d="M100 64C86 38 54 38 45 56l-8 34" fill="none" stroke="#A08A64" stroke-width="2"/><rect x="24" y="89" width="26" height="19" rx="3" fill="#3FA34D"/><path d="M31 104c0-6 4.4-9.4 12-9.4-1 6.2-4.8 9.4-12 9.4z" fill="#fff"/></g>
      <g class="vapeur" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3" stroke-linecap="round"><path d="M92 42c-6-8 6-12 0-22"/><path d="M112 38c-6-8 6-12 0-22"/><path d="M132 42c-6-8 6-12 0-22"/></g>
    </svg>`;

  return {
    plans: [{ de: 0, cx: { femme: .43, homme: .66 } }, { de: 1.92, cx: { femme: .3, homme: .6 } }, { de: 3.46, cx: { femme: .44, homme: .6 } },
      { de: 4.79, cx: { femme: .3, homme: .6 } }, { de: 7.13, cx: { femme: .41, homme: .66 } }],
    ordre: ['moment', 'boisson'],
    bravo: 'Super' + NB + '! Un thé sans sucre, comme il préfère.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, at, sfx, fly, faux, juste, suite, goBtn, avant, qte, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const dedans = (el, x, y, m = 14) => { const r = el.getBoundingClientRect(); return x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m; };
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      /* faire glisser un élément du panneau (ou cliquer dessus) : lacher(el, cible) au lâcher, clic(el) sur un simple clic */
      function tirer(el, { cibles, lacher, clic }) {
        let st = null;
        el.addEventListener('pointerdown', e => {
          if (!tour() || e.button > 0 || el.disabled) return;
          A.unlock(); idle.reset(); st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
          try { el.setPointerCapture(e.pointerId); } catch (err) {}
        });
        el.addEventListener('pointermove', e => {
          if (!st || e.pointerId !== st.id) return;
          const dx = e.clientX - st.x, dy = e.clientY - st.y;
          if (!st.bouge && Math.hypot(dx, dy) < 6) return;
          if (!st.bouge) { st.bouge = true; el.classList.add('tenu'); sfx.tick(); }
          el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
          cibles().forEach(c => c.classList.toggle('chaud', dedans(c, e.clientX, e.clientY)));
        });
        const fin = e => {
          if (!st || e.pointerId !== st.id) return;
          const s = st; st = null; cibles().forEach(c => c.classList.remove('chaud'));
          if (!s.bouge) return;
          el.classList.remove('tenu'); el.dataset.glisse = '1'; setTimeout(() => delete el.dataset.glisse, 60);
          const c = e.type === 'pointerup' && tour() ? cibles().find(x => dedans(x, e.clientX, e.clientY)) : null;
          lacher(el, c || null);
        };
        el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
        el.addEventListener('click', () => { if (el.dataset.glisse || !tour() || el.disabled) return; A.unlock(); idle.reset(); clic(el); });
      }
      const retour = el => { el.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)'; el.style.transform = ''; setTimeout(() => { el.style.transition = ''; }, 460); };
      const glisseVers = (de, vers) => () => {
        if (!de || !de.isConnected || !vers || !vers.isConnected) return null;
        const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .4;
        return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
      };

      return {
        /* 1 · dans la vidéo, un QTE : appuyer sur le bouton quand l'homme dit « thé » (elle dit « café » avant) */
        async moment(f) {
          const THE = phrase('thé'), PREF = phrase('je préfère');
          const fin = THE[1] + .7;
          if (!await qte(f, { mot: 'thé', consigne: 'Appuie sur le bouton quand tu entends le mot thé.', de: .3, a: ligne(2)[1],
            cibles: [{ s: THE[0] - .1, e: fin }],
            pieges: [
              { s: ligne(0)[0], e: ligne(0)[1] + .5, msg: "Là, c'est «" + NB + 'café' + NB + '».' },
              { s: ligne(1)[0], e: PREF[0] + .06, msg: 'Pas encore' + NB + ': là, il dit «' + NB + 'Non merci' + NB + '».' },
              { s: PREF[0] + .06, e: THE[0] - .1, msg: 'Presque' + NB + '! Là, il dit «' + NB + 'je préfère' + NB + '».' },
              { s: fin, e: ligne(2)[1] + .2, msg: 'Trop tard' + NB + ': là, elle dit «' + NB + 'Avec du sucre' + NB + '».' },
            ],
            juste: 'Oui' + NB + '! «' + NB + 'Non merci, je préfère un thé.' + NB + '»' })) return;
          suite();
        },

        /* 2 · il redit ses deux réponses : on prépare sa boisson (le thé seul), puis on sert */
        async boisson(f) {
          const SEG = [ligne(1)[0], ligne(3)[1]];
          const PAS = {
            cafe: { msg: 'Pas de café' + NB + ': il préfère un thé.', seg: ligne(1) },
            sucre: { msg: 'Pas de sucre' + NB + ': il dit «' + NB + 'sans sucre' + NB + '».', seg: [ligne(2)[0], ligne(3)[1]] },
            lait: { msg: 'Pas de lait.', seg: SEG },
          };
          const dans = [];                                      // ce qui est dans la tasse, dans l'ordre
          const zone = () => $('.tz', side), chose = id => $(`.chose[data-id="${id}"]`, side), puce = id => $(`.puce[data-id="${id}"]`, side);
          const nomDe = id => CHOSES.find(c => c.id === id).nom;
          function peindre(nouveau) {                           // la tasse : liquide, sachet, vapeur, et ce qu'il y a dedans
            const z = zone(); if (!z) return;
            ['the', 'cafe', 'sucre', 'lait'].forEach(id => z.classList.toggle('l-' + id, dans.includes(id)));
            $('.contenu', z).innerHTML = dans.map(id => `<button class="puce${id === nouveau ? ' neuf' : ''}" data-id="${id}" aria-label="Retirer ${nomDe(id)} de la tasse"><span class="mini">${SVG[id]}</span><span class="x" aria-hidden="true">×</span></button>`).join('');
            $$('.puce', z).forEach(b => b.addEventListener('click', () => { if (!tour()) return; A.unlock(); idle.reset(); retirer(b.dataset.id, true); }));
          }
          function ajouter(id) { if (dans.includes(id)) return; dans.push(id); chose(id).classList.add('pris'); sfx.tick(); peindre(id); }
          function retirer(id, vole) {
            const i = dans.indexOf(id); if (i < 0) return;
            const p = puce(id), c = chose(id);
            if (vole && p && !A.reduced) fly(p, $('.pic', c), `<div class="mini" style="width:100%;height:100%">${SVG[id]}</div>`, { scale: 1 }).then(() => c.classList.remove('pris'));
            else c.classList.remove('pris');
            dans.splice(i, 1); sfx.tick(); peindre();
          }
          const figer = () => $$('.chose, .puce', side).forEach(x => { x.disabled = true; });
          const servie = msg => { figer(); zone().classList.add('juste'); $('.tz .legende', side).textContent = 'un thé sans sucre'; if (msg) Q.show('ok', msg); };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Servir', servir); yourTurn(); idle.set(glisseVers(chose('lait'), $('.tz .tasse', side)), 6000); };
          const consigne = "Prépare la boisson de l'homme" + NB + ": mets dans la tasse ce qu'il veut, puis clique sur Servir.";
          const tuile = c => `<button class="tuile chose" data-id="${c.id}" aria-label="${c.aria}"><span class="pic">${SVG[c.id]}</span><span class="nom">${c.nom}</span></button>`;
          if (!await avant(f, {
            qui: 'homme', seg: SEG, gel: 4.9, sideW: 560, consigne,
            panneau: `<div class="panel glass cafe"><p class="ptitre">Mets dans la tasse ce qu'il veut, puis clique sur Servir.</p>
              <div class="table">${tuile(CHOSES[0])}${tuile(CHOSES[1])}
                <div class="tz" role="group" aria-label="Sa tasse"><div class="tasse">${TASSE}<div class="contenu"></div></div><span class="legende">sa tasse</span></div>
                ${tuile(CHOSES[2])}${tuile(CHOSES[3])}</div></div>`,
            monte: p => {
              $$('.chose', p).forEach(el => tirer(el, {
                cibles: () => [zone()],
                lacher: (x, c) => { if (c) { x.style.transform = ''; ajouter(x.dataset.id); } else retour(x); },
                clic: x => {
                  const id = x.dataset.id; if (dans.includes(id)) return;
                  x.classList.add('pris');
                  fly($('.pic', x), $('.tz .tasse', side), `<div class="mini" style="width:100%;height:100%">${SVG[id]}</div>`, { scale: .6 }).then(() => { if (alive(f)) ajouter(id); });
                },
              }));
              peindre();
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function servir() {
            if (!tour()) return;
            if (!dans.length) { secouer(zone()); Q.show('you', "La tasse est vide. Mets dedans ce qu'il veut."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const faute = ['cafe', 'sucre', 'lait'].find(id => dans.includes(id));
            if (!faute) {                                       // le thé seul
              servie();
              if (!await juste(f, 'Oui' + NB + '! Un thé, sans sucre.')) return;
              suite(); return;
            }
            const p = puce(faute); if (p) p.classList.add('faux');
            secouer(zone());
            const montrer = await faux(f, PAS[faute].seg, PAS[faute].msg); if (montrer === null) return;
            if (montrer) {                                      // deux essais : on pose la réponse, le thé seul
              dans.filter(id => id !== 'the').forEach(id => retirer(id, true));
              if (!dans.includes('the')) ajouter('the');
              servie('Il veut un thé, sans sucre.'); state.essais = 0; suite();
            } else { retirer(faute, true); ask(); }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { homme: 'un thé, sans sucre' },
      faits: {
        femme: [{ text: 'Tu veux un café' + A.NB + '?', seg: A.ligne(0) }, { text: '«' + A.NB + 'tu' + A.NB + '»' + A.NB + ': ils se tutoient', seg: A.phrase('tu veux') }, { text: 'Avec du sucre' + A.NB + '?', seg: A.ligne(2) }],
        homme: [{ text: 'Non merci, je préfère un thé.', seg: A.ligne(1) }, { text: 'Non, sans sucre, merci.', seg: A.ligne(3) }],
      },
    }),
  };
})();
