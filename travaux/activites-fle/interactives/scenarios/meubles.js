/* Au magasin de meubles : un client aime un canapé et demande s'il existe en bleu ; oui, mais il faut attendre trois semaines ;
   le magasin livre à domicile, et la livraison est gratuite (coupes à 2,92, 4,96, 6,96 et 8,96 s : plan large, la vendeuse
   de près, le client de près, la vendeuse de près, plan large).
   1 · le client redit sa demande (la vidéo resserrée sur lui) : à côté, le canapé dessiné et le nuancier de tissus du
       magasin ; on clique sur le tissu de la couleur qu'il veut (bleu, parmi gris, vert, jaune, rouge) : le canapé dessiné
       prend la couleur du tissu ;
   2 · la vendeuse redit le délai : sur une frise des semaines (d'aujourd'hui à six semaines), on fait glisser le curseur
       jusqu'à trois semaines, puis Valider (un clic sur une semaine ou les flèches du clavier marchent aussi) ;
   3 · « Vous livrez à domicile ? — Oui, et la livraison est gratuite. » : sur le bon de commande, on coche « oui » pour la
       livraison à domicile et « gratuite » pour son prix (parmi 30 € et 60 €), puis Valider.
   Pas de geste sur l'image : le canapé dont parle le client n'est pas désigné à l'écran, il n'y a aucun canapé bleu dans le
   magasin (des gris et des blancs), et ni le délai ni la livraison ne se voient. Les images figées (1,5 s plan large ; 4,0 et
   8,0 s : la vendeuse de près) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* le canapé trois places (viewBox 300 × 160) : le tissu prend la couleur choisie (--tissu, --tissu2 pour l'ombre) */
  const CANAPE = `<svg viewBox="0 0 300 160" aria-hidden="true">
      <rect class="t2" x="34" y="22" width="232" height="70" rx="18"/>
      <rect class="t" x="44" y="30" width="68" height="58" rx="12"/><rect class="t" x="116" y="30" width="68" height="58" rx="12"/><rect class="t" x="188" y="30" width="68" height="58" rx="12"/>
      <rect class="t2" x="40" y="86" width="220" height="40" rx="10"/>
      <rect class="t" x="44" y="84" width="70" height="30" rx="10"/><rect class="t" x="115" y="84" width="70" height="30" rx="10"/><rect class="t" x="186" y="84" width="70" height="30" rx="10"/>
      <rect class="t" x="10" y="54" width="40" height="76" rx="16"/><rect class="t" x="250" y="54" width="40" height="76" rx="16"/>
      <rect class="t2" x="10" y="112" width="40" height="18" rx="8"/><rect class="t2" x="250" y="112" width="40" height="18" rx="8"/>
      <path class="pied" d="M26 130h12l-2 18h-8zM262 130h12l-2 18h-8zM140 126h20l-2 14h-16z"/>
    </svg>`;
  /* le nuancier du magasin */
  const TISSUS = [
    { id: 'gris', nom: 'gris', c: '#9AA0A8', o: '#7C838D' },
    { id: 'vert', nom: 'vert', c: '#3F8A5C', o: '#2F6C47' },
    { id: 'bleu', nom: 'bleu', c: '#3E6FC2', o: '#2D559B', bon: true },
    { id: 'jaune', nom: 'jaune', c: '#E5BC3E', o: '#C49B25' },
    { id: 'rouge', nom: 'rouge', c: '#C8473F', o: '#A1352E' },
  ];
  const BASE = { c: '#E9E2D4', o: '#D3CAB8' };          // le canapé du magasin, en tissu clair
  /* la frise des semaines */
  const NOMBRES = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six'];
  const MAX = 6, BON_DELAI = 3;
  const delaiTxt = n => n === 0 ? "aujourd'hui" : 'dans ' + n + ' semaine' + (n > 1 ? 's' : '');
  /* le bon de commande */
  const DOMICILE = [{ id: 'oui', t: 'oui' }, { id: 'non', t: 'non' }];
  const PRIX = [{ id: 'gratuite', t: 'gratuite' }, { id: '30', t: '30' + NB + '€', l: 'trente euros' }, { id: '60', t: '60' + NB + '€', l: 'soixante euros' }];

  return {
    plans: [{ de: 0, cx: { vendeuse: .28, client: .66 } }, { de: 2.917, cx: { vendeuse: .45, client: .96 } }, { de: 4.958, cx: { vendeuse: .04, client: .61 } },
      { de: 6.958, cx: { vendeuse: .45, client: .96 } }, { de: 8.958, cx: { vendeuse: .28, client: .66 } }],
    ordre: ['couleur', 'delai', 'livraison'],
    bravo: 'Super' + NB + '! Dans trois semaines, le client a son canapé bleu chez lui.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · « Ce canapé me plaît. Il existe en bleu, non ? » : dans le nuancier, on clique sur le tissu bleu */
        async couleur(f) {
          const SEG = ligne(0);
          let fini = false;
          const teindre = t => { const c = $('.mb-canape', side); if (!c) return; c.style.setProperty('--tissu', t.c); c.style.setProperty('--tissu2', t.o); };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.mb-tissu[data-id="gris"]', side)), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const t = TISSUS.find(x => x.id === b.dataset.id); teindre(t);
            if (t.bon) {
              fini = true; $$('.mb-tissu', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Il veut ce canapé en bleu.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, 'Non, pas en ' + t.nom + '.'); if (montrer === null) return;
              b.classList.remove('faux'); teindre(BASE);
              if (montrer) $('.mb-tissu[data-id="bleu"]', side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'client', seg: SEG, gel: 1.5, sideW: 480,
            consigne: 'Le client veut ce canapé en quelle couleur' + NB + '? Clique sur le bon tissu.',
            panneau: `<div class="panel glass meubles"><p class="ptitre">Clique sur le tissu de la bonne couleur.</p>
              <div class="mb-scene"><div class="mb-canape" style="--tissu:${BASE.c};--tissu2:${BASE.o}">${CANAPE}</div></div>
              <div class="mb-nuancier" role="group" aria-label="Le nuancier de tissus"><span class="mb-etiq">les tissus</span>
                <div class="mb-tissus">${TISSUS.map(t => `<button class="mb-tissu" data-id="${t.id}" aria-label="tissu ${t.nom}"><span class="ech" style="--c:${t.c};--o:${t.o}" aria-hidden="true"></span><span class="nom">${t.nom}</span></button>`).join('')}</div></div></div>`,
            monte: p => $$('.mb-tissu', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · « Oui, mais il faut attendre trois semaines. » : sur la frise, on fait glisser le curseur, puis Valider */
        async delai(f) {
          const SEG = ligne(1);
          let val = 0, fini = false;
          const placer = (n, son = true) => {
            n = Math.max(0, Math.min(MAX, n));
            if (son && n !== val) sfx.tick();
            val = n;
            const fr = $('.mb-frise', side); if (!fr) return;
            fr.style.setProperty('--v', val / MAX);
            const th = $('.mb-curseur', side); th.setAttribute('aria-valuenow', val); th.setAttribute('aria-valuetext', delaiTxt(val));
            $$('.mb-sem', side).forEach(s => s.classList.toggle('pris', +s.dataset.n <= val && +s.dataset.n > 0));
            $('#mb-lu', side).textContent = delaiTxt(val);
            fr.classList.remove('faux');
          };
          const ask = () => {
            Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn();
            idle.set(() => {                                   // le doigt fantôme : un glissé jusqu'à une semaine (pas la bonne)
              const th = $('.mb-curseur', side), s = $('.mb-sem[data-n="1"]', side); if (!th || !s) return null;
              const a = th.getBoundingClientRect(), b = s.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y1, 1, .82), at(x2, y1, 1), at(x2, y1, 0)];
            }, 5000);
          };
          if (!await avant(f, {
            qui: 'vendeuse', seg: SEG, gel: 4.0, sideW: 520,
            consigne: 'Pour avoir le canapé bleu, il faut attendre combien de temps' + NB + '? Fais glisser le curseur, puis clique sur Valider.',
            panneau: `<div class="panel glass meubles"><p class="ptitre">Fais glisser le curseur, puis clique sur Valider.</p>
              <div class="mb-calendrier">
                <p class="mb-lu" aria-live="polite"><span class="mb-mini" aria-hidden="true">${CANAPE}</span><b id="mb-lu">${delaiTxt(0)}</b></p>
                <div class="mb-frise" style="--v:0">
                  <div class="mb-sems">${Array.from({ length: MAX + 1 }, (_, n) => `<button class="mb-sem" data-n="${n}" tabindex="-1" aria-label="${delaiTxt(n)}"><span class="num">${n === 0 ? 'auj.' : n}</span></button>`).join('')}</div>
                  <div class="mb-rail"><div class="mb-rempli"></div>
                    <div class="mb-curseur" role="slider" tabindex="0" aria-label="Le délai, en semaines" aria-valuemin="0" aria-valuemax="${MAX}" aria-valuenow="0" aria-valuetext="${delaiTxt(0)}">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l-4 5 4 5M15 7l4 5-4 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
                  <p class="mb-unite">semaines</p>
                </div></div></div>`,
            monte: p => {
              const rail = $('.mb-rail', p), th = $('.mb-curseur', p), sems = $('.mb-sems', p);
              const versN = x => { const r = sems.getBoundingClientRect(), w = r.width / (MAX + 1); return Math.round((x - r.left - w / 2) / w); };
              let st = null;
              const prendre = e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                st = { id: e.pointerId }; th.classList.add('tenu');
                try { th.setPointerCapture(e.pointerId); } catch (err) {}
                placer(versN(e.clientX));
              };
              th.addEventListener('pointerdown', prendre); rail.addEventListener('pointerdown', e => { if (e.target === th || th.contains(e.target)) return; prendre(e); });
              th.addEventListener('pointermove', e => { if (st && e.pointerId === st.id) placer(versN(e.clientX)); });
              const lacher = e => { if (st && e.pointerId === st.id) { st = null; th.classList.remove('tenu'); Q.show('you', state.ask); } };
              th.addEventListener('pointerup', lacher); th.addEventListener('pointercancel', lacher);
              $$('.mb-sem', p).forEach(s => s.addEventListener('click', () => { if (!tour() || fini) return; A.unlock(); idle.reset(); placer(+s.dataset.n); }));
              th.addEventListener('keydown', e => {
                if (!tour() || fini) return;
                const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
                if (d) { e.preventDefault(); A.unlock(); idle.reset(); placer(val + d); }
                else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); placer(e.key === 'Home' ? 0 : MAX); }
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            const fr = $('.mb-frise', side);
            if (val === 0) { secouer(fr); Q.show('you', 'Fais glisser le curseur vers la droite.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (val === BON_DELAI) {
              fini = true; fr.classList.add('juste'); $('.mb-calendrier', side).classList.remove('indice');
              if (!await juste(f, 'Oui' + NB + '! Il faut attendre trois semaines.')) return;
              suite();
            } else {
              fr.classList.add('faux'); secouer(fr);
              const montrer = await faux(f, SEG, 'Non, pas ' + NOMBRES[val] + ' semaine' + (val > 1 ? 's' : '') + '.'); if (montrer === null) return;
              fr.classList.remove('faux');
              if (montrer) {                                    // deux essais : on pose la réponse
                fini = true; placer(BON_DELAI, false); fr.classList.add('juste');
                Q.show('ok', 'Il faut attendre trois semaines.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · « Vous livrez à domicile ? — Oui, et la livraison est gratuite. » : sur le bon de commande, on coche, puis Valider */
        async livraison(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let dom = null, prix = null, fini = false;
          const peindre = () => {
            $$('.mb-case[data-d]', side).forEach(b => b.setAttribute('aria-checked', b.dataset.d === dom));
            $$('.mb-case[data-p]', side).forEach(b => b.setAttribute('aria-checked', b.dataset.p === prix));
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.mb-case[data-p="30"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'vendeuse', seg: SEG, gel: 8.0, sideW: 500,
            consigne: 'Le magasin livre à domicile' + NB + '? Et la livraison coûte combien' + NB + '? Coche les bonnes cases, puis clique sur Valider.',
            panneau: `<div class="panel glass meubles"><p class="ptitre">Coche les bonnes cases, puis clique sur Valider.</p>
              <div class="mb-bon" id="mb-bon">
                <div class="tete"><b>Bon de commande</b><span>N° 2318</span></div>
                <p class="article"><span class="mb-mini" aria-hidden="true" style="--tissu:#3E6FC2;--tissu2:#2D559B">${CANAPE}</span>Canapé 3 places, bleu</p>
                <p class="ligne-b">Livraison à domicile${NB}:</p>
                <div class="mb-cases deux" id="mb-dom" role="radiogroup" aria-label="Livraison à domicile">${DOMICILE.map(o => `<button class="mb-case" role="radio" data-d="${o.id}" aria-checked="false"><span class="boite" aria-hidden="true"></span>${o.t}</button>`).join('')}</div>
                <p class="ligne-b">Prix de la livraison${NB}:</p>
                <div class="mb-cases trois" id="mb-prix" role="radiogroup" aria-label="Prix de la livraison">${PRIX.map(o => `<button class="mb-case" role="radio" data-p="${o.id}" aria-checked="false"${o.l ? ` aria-label="${o.l}"` : ''}><span class="boite" aria-hidden="true"></span>${o.t}</button>`).join('')}</div>
              </div></div>`,
            monte: p => {
              $$('.mb-case[data-d]', p).forEach(b => b.addEventListener('click', () => { if (!tour() || fini) return; A.unlock(); idle.reset(); sfx.tick(); dom = b.dataset.d; b.classList.remove('faux'); peindre(); Q.show('you', state.ask); }));
              $$('.mb-case[data-p]', p).forEach(b => b.addEventListener('click', () => { if (!tour() || fini) return; A.unlock(); idle.reset(); sfx.tick(); prix = b.dataset.p; b.classList.remove('faux'); peindre(); Q.show('you', state.ask); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            if (!dom || !prix) {
              secouer($(dom ? '#mb-prix' : '#mb-dom', side));
              Q.show('you', dom ? 'Coche aussi le prix de la livraison.' : prix ? 'Coche aussi oui ou non pour la livraison.' : 'Coche une case sur chaque ligne.');
              return;
            }
            setTurn('wait'); goBtn(null); idle.clear();
            const bd = $(`.mb-case[data-d="${dom}"]`, side), bp = $(`.mb-case[data-p="${prix}"]`, side);
            const dOk = dom === 'oui', pOk = prix === 'gratuite';
            bd.classList.add(dOk ? 'juste' : 'faux'); bp.classList.add(pOk ? 'juste' : 'faux');
            if (dOk && pOk) {
              fini = true; $$('.mb-case', side).forEach(x => x.classList.remove('indice')); $('#mb-bon', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Le magasin livre à domicile, et c\'est gratuit.')) return;
              suite();
            } else {
              secouer($('#mb-bon', side));
              const msg = [dOk ? '' : 'Si, le magasin livre à domicile.', pOk ? '' : 'Pas ' + PRIX.find(o => o.id === prix).l + '.'].filter(Boolean).join(' ');
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              if (!dOk) { bd.classList.remove('faux'); dom = null; }
              if (!pOk) { bp.classList.remove('faux'); prix = null; }
              peindre();
              if (montrer) {                                    // deux essais : on coche la réponse
                fini = true; dom = 'oui'; prix = 'gratuite'; peindre();
                $('.mb-case[data-d="oui"]', side).classList.add('juste'); $('.mb-case[data-p="gratuite"]', side).classList.add('juste'); $('#mb-bon', side).classList.add('juste');
                Q.show('ok', 'Le magasin livre à domicile, et la livraison est gratuite.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { client: 'en bleu' },
      faits: {
        client: [{ text: 'Ce canapé me plaît.', seg: A.phrase('ce canapé me plaît') }, { text: 'Il existe en bleu' + A.NB + '?', seg: A.phrase('il existe en bleu non') },
          { text: 'Vous livrez à domicile' + A.NB + '?', seg: A.ligne(2) }],
        vendeuse: [{ text: 'Il faut attendre trois semaines.', seg: A.phrase('il faut attendre trois semaines') }, { text: 'La livraison est gratuite.', seg: A.phrase('la livraison est gratuite') }],
      },
    }),
  };
})();
