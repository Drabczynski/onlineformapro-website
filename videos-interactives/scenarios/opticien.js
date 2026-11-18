/* Chez l'opticien : un client essaie des lunettes rondes en écaille ; l'opticienne trouve les noires plus élégantes ; elles
   coûtent cent vingt euros ; elle propose de les mettre de côté (coupes à 1,92, 4,92, 5,96 et 9 s : plan large, l'opticienne
   de près, le client de près, l'opticienne de près, plan large).
   1 · l'opticienne redit sa réplique (la vidéo resserrée sur elle) : à côté, un plateau de quatre paires de lunettes, sans
       nom écrit (noires, rouges, dorées, et les rondes en écaille que le client porte) ; on clique sur les noires ;
   2 · « Elles coûtent combien ? — Cent vingt euros. » : on tape le prix sur l'étiquette des lunettes (un clavier, comme
       une étiqueteuse), puis Valider (cent vingt, pas cent deux ni vingt) ;
   3 · « Je vous les mets de côté ? » : on fait glisser les lunettes là où elle propose de les mettre (le présentoir, un sac,
       la boîte « Réservé ») ; un clic sur l'endroit marche aussi.
   Tout se fait dans le panneau : sur l'image, rien ne se prête à une vraie question (les lunettes noires posées sur le
   comptoir, petites, se confondent avec celles du mur). Les images figées des étapes 1 à 3 sont des plans de l'opticienne de
   près (le comptoir n'y est pas visible) : elles ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* une paire de lunettes vue de face (viewBox 120 × 48) */
  const LUN = {
    noires: { nom: 'les lunettes noires', svg: `<svg viewBox="0 0 120 48" aria-hidden="true"><path d="M2 14h8M110 14h8" stroke="#141414" stroke-width="5" stroke-linecap="round"/>
      <rect x="9" y="9" width="42" height="30" rx="8" fill="#DDE6EE" fill-opacity=".45" stroke="#141414" stroke-width="6"/>
      <rect x="69" y="9" width="42" height="30" rx="8" fill="#DDE6EE" fill-opacity=".45" stroke="#141414" stroke-width="6"/>
      <path d="M51 18c4-4 14-4 18 0" fill="none" stroke="#141414" stroke-width="5"/></svg>` },
    rouges: { nom: 'les lunettes rouges', svg: `<svg viewBox="0 0 120 48" aria-hidden="true"><path d="M2 12h8M110 12h8" stroke="#C62F3A" stroke-width="5" stroke-linecap="round"/>
      <path d="M9 10h42v14c0 9-7 15-18 15S9 33 9 24z" fill="#DDE6EE" fill-opacity=".45" stroke="#C62F3A" stroke-width="5" stroke-linejoin="round"/>
      <path d="M69 10h42v14c0 9-6 15-15 15s-27-6-27-15z" fill="#DDE6EE" fill-opacity=".45" stroke="#C62F3A" stroke-width="5" stroke-linejoin="round"/>
      <path d="M51 16c4-4 14-4 18 0" fill="none" stroke="#C62F3A" stroke-width="4"/></svg>` },
    dorees: { nom: 'les lunettes dorées', svg: `<svg viewBox="0 0 120 48" aria-hidden="true"><path d="M2 13h10M108 13h10" stroke="#C49A2C" stroke-width="3" stroke-linecap="round"/>
      <path d="M12 12c8-3 30-3 38 1 1 10-3 24-17 24-14 0-22-12-21-25z" fill="#DDE6EE" fill-opacity=".45" stroke="#C49A2C" stroke-width="3"/>
      <path d="M108 12c-8-3-30-3-38 1-1 10 3 24 17 24 14 0 22-12 21-25z" fill="#DDE6EE" fill-opacity=".45" stroke="#C49A2C" stroke-width="3"/>
      <path d="M50 13c4-3 16-3 20 0M50 18h20" fill="none" stroke="#C49A2C" stroke-width="2.6"/></svg>` },
    ecaille: { nom: 'les lunettes rondes en écaille', svg: `<svg viewBox="0 0 120 48" aria-hidden="true"><path d="M2 16h10M108 16h10" stroke="#8A5530" stroke-width="5" stroke-linecap="round"/>
      <circle cx="32" cy="25" r="18" fill="#DDE6EE" fill-opacity=".45" stroke="#8A5530" stroke-width="5"/>
      <circle cx="88" cy="25" r="18" fill="#DDE6EE" fill-opacity=".45" stroke="#8A5530" stroke-width="5"/>
      <circle cx="32" cy="25" r="18" fill="none" stroke="#C98A55" stroke-width="2" stroke-dasharray="5 7"/>
      <circle cx="88" cy="25" r="18" fill="none" stroke="#C98A55" stroke-width="2" stroke-dasharray="5 7"/>
      <path d="M50 21c4-4 16-4 20 0" fill="none" stroke="#8A5530" stroke-width="4"/></svg>` },
  };
  const PLATEAU = ['ecaille', 'rouges', 'noires', 'dorees'];
  const MSG1 = { ecaille: 'Non' + NB + ': ce sont ses lunettes à lui.', rouges: 'Non, pas les rouges.', dorees: 'Non, pas les dorées.' };

  /* les nombres en lettres (pour les messages du prix) */
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const D = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };
  function lettres(n) {
    if (n < 17) return U[n];
    if (n < 20) return 'dix-' + U[n - 10];
    if (n < 100) {
      let d = Math.floor(n / 10), u = n % 10;
      if (d === 7 || d === 9) { d -= 1; u += 10; }
      const base = d === 8 ? 'quatre-vingt' : D[d];
      if (u === 0) return d === 8 ? 'quatre-vingts' : base;
      if ((u === 1 && d < 8) || (u === 11 && d === 6)) return base + ' et ' + U[u];
      return base + '-' + lettres(u);
    }
    if (n < 1000) { const c = Math.floor(n / 100), r = n % 100; return (c > 1 ? U[c] + ' cent' + (r ? '' : 's') : 'cent') + (r ? ' ' + lettres(r) : ''); }
    const m = Math.floor(n / 1000), r = n % 1000; return (m > 1 ? lettres(m) + ' mille' : 'mille') + (r ? ' ' + lettres(r) : '');
  }
  const PRIX = 120;

  /* les trois endroits de l'étape 3 (viewBox 100 × 90) */
  const ENDROITS = [
    { id: 'presentoir', leg: 'le présentoir', msg: 'Non' + NB + ': elle ne les remet pas sur le présentoir.', svg: `<svg viewBox="0 0 100 90" aria-hidden="true">
      <rect x="20" y="4" width="60" height="82" rx="6" fill="#EEF1F4" stroke="#B9C2CC" stroke-width="2"/>
      ${[16, 34, 52, 70].map(y => `<path d="M24 ${y + 10}h52" stroke="#B9C2CC" stroke-width="2"/><g fill="none" stroke-width="2.6"><circle cx="38" cy="${y + 4}" r="5" stroke="#5B6573"/><circle cx="50" cy="${y + 4}" r="5" stroke="#5B6573"/><rect x="58" y="${y}" width="9" height="8" rx="2" stroke="#9A6B42"/><rect x="69" y="${y}" width="5" height="8" rx="2" stroke="#9A6B42"/></g>`).join('')}
    </svg>` },
    { id: 'sac', leg: 'le sac', msg: 'Non' + NB + ': il ne les emporte pas maintenant.', svg: `<svg viewBox="0 0 100 90" aria-hidden="true">
      <path d="M36 30v-8a14 14 0 0 1 28 0v8" fill="none" stroke="#5B6573" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 30h60l-5 56H25z" fill="#F4E3C3" stroke="#B89A66" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="36" cy="38" r="2.6" fill="#8C7346"/><circle cx="64" cy="38" r="2.6" fill="#8C7346"/>
    </svg>` },
    { id: 'reserve', aria: 'la boîte Réservé', leg: 'la boîte «' + NB + 'Réservé' + NB + '»', bon: true, svg: `<svg viewBox="0 0 100 90" aria-hidden="true">
      <path d="M12 40h76v42a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="#D9E4F2" stroke="#7D93B2" stroke-width="2.4"/>
      <path d="M8 32h84v10H8z" fill="#BFD0E6" stroke="#7D93B2" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M58 52l20-6 6 16-20 6z" fill="#FFFFFF" stroke="#7D93B2" stroke-width="2"/><circle cx="62" cy="55" r="1.8" fill="#7D93B2"/>
      <rect x="22" y="56" width="30" height="14" rx="3" fill="#FFFFFF" stroke="#7D93B2" stroke-width="1.6"/>
      <text x="37" y="66" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#2F4A70">Réservé</text>
    </svg>` },
  ];

  return {
    plans: [{ de: 0, cx: { client: .27, opticienne: .78 } }, { de: 1.917, cx: { client: .04, opticienne: .6 } }, { de: 4.917, cx: { client: .42, opticienne: .98 } },
      { de: 5.958, cx: { client: .04, opticienne: .6 } }, { de: 9, cx: { client: .27, opticienne: .78 } }],
    ordre: ['noires', 'prix', 'cote'],
    bravo: 'Bravo' + NB + '! Le client va avoir des lunettes élégantes.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « Oui, mais les noires sont plus élégantes. » : sur le plateau, on clique sur les lunettes noires */
        async noires(f) {
          const SEG = ligne(1);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.op-paire[data-id="rouges"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'opticienne', seg: SEG, gel: 4.6, sideW: 460, consigne: "Pour l'opticienne, quelles lunettes sont plus élégantes" + NB + '? Clique sur les bonnes lunettes.',
            panneau: `<div class="panel glass opticien"><p class="ptitre">Quelles lunettes sont plus élégantes${NB}?</p>
              <div class="op-plateau" role="group" aria-label="Le plateau de lunettes">${PLATEAU.map(id => `<button class="op-paire" data-id="${id}" aria-label="${LUN[id].nom}">${LUN[id].svg}<span class="etat" aria-hidden="true"></span></button>`).join('')}</div></div>`,
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          $$('.op-paire', side).forEach(b => b.addEventListener('click', async () => {
            if (!tour()) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            if (b.dataset.id === 'noires') {
              $$('.op-paire', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); $('.etat', b).textContent = 'les noires ✓';
              if (!await juste(f, 'Oui' + NB + '! Les noires sont plus élégantes.')) return;
              suite();
            } else {
              b.classList.add('faux'); $('.etat', b).textContent = 'non'; secouer(b);
              const montrer = await faux(f, SEG, MSG1[b.dataset.id]); if (montrer === null) return;
              b.classList.remove('faux'); $('.etat', b).textContent = '';
              if (montrer) $('.op-paire[data-id="noires"]', side).classList.add('indice');
              ask();
            }
          }));
          ask();
        },

        /* 2 · « Elles coûtent combien ? — Cent vingt euros. » : on tape le prix sur l'étiquette, puis Valider */
        async prix(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let tape = '';
          const montrerPrix = () => { const e = $('#op-lu', side); if (e) e.textContent = tape || '…'; $('.op-etiquette', side)?.classList.toggle('vide', !tape); };
          const touche = k => {
            if (!tour()) return;
            A.unlock(); idle.reset(); sfx.tick();
            $('.op-etiquette', side).classList.remove('faux');
            if (k === 'x') tape = tape.slice(0, -1);
            else if (tape.length < 4 && !(tape === '' && k === '0')) tape += k;
            montrerPrix(); Q.show('you', state.ask);
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.op-touche[data-k="5"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'opticienne', seg: SEG, gel: 7.1, sideW: 440, consigne: "Les lunettes coûtent combien" + NB + "? Tape le prix sur l'étiquette, puis clique sur Valider.",
            panneau: `<div class="panel glass opticien"><p class="ptitre">Tape le prix sur l'étiquette.</p>
              <div class="op-prix">
                <div class="op-etiquette vide" aria-live="polite"><span class="trou" aria-hidden="true"></span><span class="ficelle" aria-hidden="true"></span>
                  <span class="op-mini" aria-hidden="true">${LUN.noires.svg}</span><b id="op-lu">…</b><small>€</small></div>
                <div class="op-clavier" role="group" aria-label="Clavier">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', '0'].map(k => k === 'x'
                  ? `<button class="op-touche efface" data-k="x" aria-label="Effacer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9l5 6M17 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`
                  : `<button class="op-touche" data-k="${k}">${k}</button>`).join('')}</div>
              </div></div>`,
            monte: p => $$('.op-touche', p).forEach(b => b.addEventListener('click', () => touche(b.dataset.k))),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            const et = $('.op-etiquette', side);
            if (!tape) { secouer(et); Q.show('you', 'Tape le prix avec le clavier.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const v = +tape;
            if (v === PRIX) {
              et.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Cent vingt euros.')) return;
              suite();
            } else {
              et.classList.add('faux'); secouer(et);
              const montrer = await faux(f, SEG, 'Pas ' + lettres(v) + (v > 1 ? ' euros.' : ' euro.')); if (montrer === null) return;
              et.classList.remove('faux');
              if (montrer) {                                    // deux essais : on pose la réponse
                tape = String(PRIX); montrerPrix(); et.classList.add('juste');
                Q.show('ok', 'Cent vingt euros' + NB + ': 120' + NB + '€.'); state.essais = 0; suite();
              } else { tape = ''; montrerPrix(); ask(); }
            }
          }
          ask();
        },

        /* 3 · « Je vous les mets de côté ? » : on fait glisser les lunettes jusqu'à la boîte « Réservé » (ou on clique dessus) */
        async cote(f) {
          const SEG = ligne(4);
          const paire = () => $('.op-glisse', side), endroit = id => $(`.op-endroit[data-id="${id}"]`, side);
          let fini = false;
          function poser(v, anime = true) {
            const el = paire(); if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!v) { el.style.transition = tr; el.style.transform = ''; return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = $('.dessin', v).getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height * .45 - (a.top + a.height / 2)}px) scale(.62)`;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = paire(), vers = endroit('sac'); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .45;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const v = endroit(id), e = ENDROITS.find(x => x.id === id); poser(v);
            $$('.op-endroit', side).forEach(x => x.classList.remove('chaud'));
            await wait(450); if (!alive(f)) return;
            if (e.bon) {
              $$('.op-endroit', side).forEach(x => x.classList.remove('indice')); v.classList.add('juste'); fini = true;
              if (!await juste(f, 'Oui' + NB + '! Elle propose de les mettre de côté pour lui.')) return;
              suite();
            } else {
              v.classList.add('faux'); secouer(v);
              const montrer = await faux(f, SEG, e.msg); if (montrer === null) return;
              v.classList.remove('faux'); poser(null);
              if (montrer) endroit('reserve').classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass opticien"><p class="ptitre">Fais glisser les lunettes au bon endroit.</p>
            <div class="op-endroits">${ENDROITS.map(e => `<button class="op-endroit" data-id="${e.id}" aria-label="${e.aria || e.leg}"><span class="dessin">${e.svg}</span><span class="legende">${e.leg}</span></button>`).join('')}</div>
            <div class="op-depart"><div class="op-glisse" aria-hidden="true">${LUN.noires.svg}</div><span class="legende">les lunettes</span></div></div>`;
          if (!await avant(f, {
            qui: 'opticienne', seg: SEG, gel: 8.6, sideW: 500, panneau,
            consigne: "Qu'est-ce que l'opticienne propose" + NB + '? Fais glisser les lunettes au bon endroit.',
            monte: p => {
              const el = $('.op-glisse', p); let st = null;
              el.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                el.style.transition = 'none'; el.style.transform = '';
                st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                try { el.setPointerCapture(e.pointerId); } catch (err) {}
                el.classList.add('tenue');
              });
              el.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x, dy = e.clientY - st.y;
                if (!st.bouge && Math.hypot(dx, dy) > 5) { st.bouge = true; sfx.tick(); }
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
                $$('.op-endroit', p).forEach(v => v.classList.toggle('chaud', dedans(v, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenue');
                const v = e.type === 'pointerup' && tour() ? $$('.op-endroit', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.op-endroit', p).forEach(x => x.classList.remove('chaud'));
                if (v) choisir(v.dataset.id); else poser(null);
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.op-endroit', p).forEach(v => v.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(v.dataset.id); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        client: [{ text: 'Elles me vont bien, ces lunettes' + A.NB + '?', seg: A.ligne(0) }, { text: 'Elles coûtent combien' + A.NB + '?', seg: A.ligne(2) }],
        opticienne: [{ text: 'Les noires sont plus élégantes.', seg: A.phrase('les noires sont plus élégantes') }, { text: 'cent vingt euros', seg: A.ligne(3) },
          { text: 'Je vous les mets de côté' + A.NB + '?', seg: A.ligne(4) }],
      },
    }),
  };
})();
