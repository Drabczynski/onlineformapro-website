/* À la piscine : à l'accueil, une cliente demande une entrée adulte ; l'employé dit « Quatre euros » et demande si elle a un
   bonnet ; elle l'a oublié, il est obligatoire, mais elle peut en acheter un ici (coupes à 1,92, 3,96, 5,96 et 8,96 s : plan
   large, l'employé de près, la cliente de près, l'employé de près, plan large).
   1 · la cliente redit sa demande (la vidéo resserrée sur elle) : à côté, l'écran de la caisse de la piscine ; on clique sur
       la bonne entrée (entrée adulte, parmi l'entrée enfant, l'entrée étudiant, la carte dix entrées, l'abonnement d'un
       mois), puis Valider : on vérifie « une entrée » (pas une carte, pas un abonnement) et « adulte » (pas étudiant) ;
   2 · l'employé redit le prix : on tape le montant sur le terminal de carte, puis Valider (quatre euros) ;
   3 · « Vous avez un bonnet ? — Non, j'ai oublié. Il est obligatoire ? — Oui, mais vous pouvez en acheter un ici. » : sur le
       présentoir de l'accueil (bonnet, lunettes de natation, maillot, serviette, claquettes, gourde, sans nom écrit), on fait
       glisser sur le comptoir ce qu'elle a oublié ; un clic sur l'objet marche aussi.
   Pas de geste sur l'image : aucun prix, aucun tarif, aucun bonnet n'y est visible (le panneau de la porte n'est pas
   lisible) ; un geste sur la vidéo n'y vérifierait rien du dialogue. Les images figées (1,2 s plan large ; 4,2 et 5,4 s : la
   cliente de près ; 2,0 s : l'employé de près) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  const pers = (h, x = 24) => `<circle cx="${x}" cy="${44 - h - 5}" r="5"/><path d="M${x - 6} 44V${44 - h + 6}q0-6 6-6t6 6V44z"/>`;
  /* les tarifs de la caisse (pictogrammes, viewBox 48 × 48) */
  const ENTREES = [
    { id: 'enfant', nom: 'Entrée enfant', msg: 'Non, pas une entrée enfant.', svg: pers(18) },
    { id: 'adulte', nom: 'Entrée adulte', bon: true, svg: pers(30) },
    { id: 'etudiant', nom: 'Entrée étudiant', msg: 'Non, pas une entrée étudiant.', svg: pers(28) + '<path d="M14 9l10-4 10 4-10 4z"/><path d="M33 9v6" stroke="currentColor" stroke-width="2" fill="none"/>' },
    { id: 'carte', nom: 'Carte 10 entrées', msg: 'Non' + NB + ': elle demande une seule entrée.',
      svg: '<rect x="5" y="11" width="38" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><text x="24" y="30" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="800">10</text>' },
    { id: 'abo', nom: 'Abonnement 1 mois', msg: 'Non' + NB + ': elle demande une entrée, pas un abonnement.',
      svg: '<rect x="7" y="9" width="34" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M7 18h34M16 5v8M32 5v8" stroke="currentColor" stroke-width="3" fill="none"/><text x="24" y="35" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800">1 m</text>' },
  ];
  const PRIX = 4;
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
    const c = Math.floor(n / 100), r = n % 100; return (c > 1 ? U[c] + ' cent' + (r ? '' : 's') : 'cent') + (r ? ' ' + lettres(r) : '');
  }
  /* le présentoir de l'accueil (viewBox 64 × 64) */
  const OBJETS = [
    { id: 'lunettes', nom: 'des lunettes de natation', msg: 'Non' + NB + ': ça, ce sont des lunettes de natation.', svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 30c4-8 8-8 10-6M60 30c-4-8-8-8-10-6" fill="none" stroke="#24304A" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="21" cy="32" rx="10" ry="8" fill="#7FD0E8" stroke="#24304A" stroke-width="3.5"/><ellipse cx="43" cy="32" rx="10" ry="8" fill="#7FD0E8" stroke="#24304A" stroke-width="3.5"/>
      <path d="M31 31q1-3 2 0" fill="none" stroke="#24304A" stroke-width="3"/><path d="M16 29q3-3 6-2M38 29q3-3 6-2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>` },
    { id: 'maillot', nom: 'un maillot de bain', msg: 'Non' + NB + ': ça, c\'est un maillot de bain.', svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M21 6h5c0 8 12 8 12 0h5l-2 18c6 6 8 14 6 22l-7 12H24l-7-12c-2-8 0-16 6-22z" fill="#E2557A" stroke="#9E2C4C" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 34c6 4 14 4 20 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></svg>` },
    { id: 'bonnet', nom: 'un bonnet de bain', bon: true, svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 44C8 24 19 12 32 12s24 12 24 32c-6 4-14 6-24 6S14 48 8 44z" fill="#2F7FD8" stroke="#1B4F8F" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M9 40c6 4 14 5 23 5s17-1 23-5" fill="none" stroke="#1B4F8F" stroke-width="2.5"/><path d="M20 22c3-4 7-6 11-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>` },
    { id: 'serviette', nom: 'une serviette', msg: 'Non' + NB + ': ça, c\'est une serviette.', svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="16" width="48" height="34" rx="5" fill="#F3C64B" stroke="#B38817" stroke-width="2.5"/>
      <path d="M8 24h48M8 42h48" stroke="#fff" stroke-width="3"/><path d="M8 28h48" stroke="#E79C2A" stroke-width="2"/></svg>` },
    { id: 'claquettes', nom: 'des claquettes', msg: 'Non' + NB + ': ça, ce sont des claquettes.', svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="10" width="20" height="46" rx="10" fill="#3F4756" stroke="#202530" stroke-width="2.5"/><rect x="36" y="8" width="20" height="46" rx="10" fill="#3F4756" stroke="#202530" stroke-width="2.5"/>
      <rect x="5" y="18" width="26" height="12" rx="5" fill="#39B98C"/><rect x="33" y="16" width="26" height="12" rx="5" fill="#39B98C"/></svg>` },
    { id: 'gourde', nom: 'une gourde', msg: 'Non' + NB + ': ça, c\'est une gourde.', svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="26" y="4" width="12" height="8" rx="2" fill="#5B6573"/><path d="M24 12h16v6c5 3 7 7 7 12v24a6 6 0 0 1-6 6H23a6 6 0 0 1-6-6V30c0-5 2-9 7-12z" fill="#9AD27A" stroke="#4E8A33" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M17 34h30v12H17z" fill="#fff" opacity=".55"/></svg>` },
  ];

  return {
    plans: [{ de: 0, cx: { employe: .2, cliente: .69 } }, { de: 1.917, cx: { employe: .42, cliente: .98 } }, { de: 3.958, cx: { employe: .02, cliente: .58 } },
      { de: 5.958, cx: { employe: .4, cliente: .97 } }, { de: 8.958, cx: { employe: .21, cliente: .7 } }],
    ordre: ['entree', 'prix', 'bonnet'],
    bravo: 'Bravo' + NB + "! Elle a son entrée, et elle peut acheter un bonnet à l'accueil.",
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, phrase, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y, m = 14) => { const r = el.getBoundingClientRect(); return x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m; };
      return {
        /* 1 · « Une entrée adulte, s'il vous plaît. » : sur l'écran de la caisse, on clique sur la bonne entrée, puis Valider */
        async entree(f) {
          const SEG = ligne(0);
          let choix = null, fini = false;
          const peindre = () => {
            $$('.pi-tarif', side).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === choix));
            const e = ENTREES.find(x => x.id === choix), l = $('#pi-ligne', side);
            if (l) l.innerHTML = e ? `<span>1 ×</span> <b>${e.nom}</b>` : '<i>Ticket vide</i>';
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.pi-tarif[data-id="carte"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'cliente', seg: SEG, gel: 4.2, sideW: 480,
            consigne: "Qu'est-ce qu'elle demande" + NB + '? Sur la caisse, clique sur la bonne entrée, puis sur Valider.',
            panneau: `<div class="panel glass pisc"><p class="ptitre">La caisse${NB}: clique sur la bonne entrée.</p>
              <div class="pi-caisse" id="pi-caisse"><div class="pi-barre"><b>Piscine</b><span>Caisse 1</span></div>
                <div class="pi-tarifs" role="group" aria-label="Les entrées">${ENTREES.map(e => `<button class="pi-tarif" data-id="${e.id}" aria-pressed="false"><svg viewBox="0 0 48 48" aria-hidden="true" fill="currentColor">${e.svg}</svg><span>${e.nom}</span></button>`).join('')}</div>
                <div class="pi-ticket" aria-live="polite"><small>Ticket</small><span id="pi-ligne"><i>Ticket vide</i></span></div></div></div>`,
            monte: p => $$('.pi-tarif', p).forEach(b => b.addEventListener('click', () => {
              if (!tour() || fini) return;
              A.unlock(); idle.reset(); sfx.tick(); $$('.pi-tarif', side).forEach(x => x.classList.remove('faux'));
              choix = b.dataset.id; peindre(); Q.show('you', state.ask);
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            if (!choix) { secouer($('.pi-tarifs', side)); Q.show('you', "Clique sur une entrée de la caisse."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const e = ENTREES.find(x => x.id === choix), b = $(`.pi-tarif[data-id="${choix}"]`, side);
            if (e.bon) {
              fini = true; $$('.pi-tarif', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); $('#pi-caisse', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Une entrée adulte.')) return;
              suite();
            } else {
              b.classList.add('faux'); secouer(b);
              const montrer = await faux(f, SEG, e.msg); if (montrer === null) return;
              b.classList.remove('faux'); choix = null; peindre();
              if (montrer) {                                    // deux essais : on montre la réponse
                fini = true; choix = 'adulte'; peindre(); $('.pi-tarif[data-id="adulte"]', side).classList.add('juste'); $('#pi-caisse', side).classList.add('juste');
                Q.show('ok', 'Elle demande une entrée adulte.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 2 · « Quatre euros. » : on tape le montant sur le terminal de carte, puis Valider */
        async prix(f) {
          const SEG = phrase('Quatre euros');
          let tape = '';
          const montrer = () => { const e = $('#pi-lu', side); if (e) e.textContent = tape || '0'; $('.pi-ecran', side)?.classList.toggle('vide', !tape); };
          const touche = k => {
            if (!tour()) return;
            A.unlock(); idle.reset(); sfx.tick(); $('.pi-tpe', side).classList.remove('faux');
            if (k === 'x') tape = tape.slice(0, -1);
            else if (tape.length < 3 && !(tape === '' && k === '0')) tape += k;
            montrer(); Q.show('you', state.ask);
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.pi-touche[data-k="7"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'employe', seg: SEG, gel: 2.0, sideW: 420,
            consigne: "L'entrée coûte combien" + NB + '? Tape le prix sur le terminal, puis clique sur Valider.',
            panneau: `<div class="panel glass pisc"><p class="ptitre">Le terminal de carte${NB}: tape le prix.</p>
              <div class="pi-tpe"><div class="pi-ecran vide" aria-live="polite"><small>Piscine · Montant</small><div><b id="pi-lu">0</b><span>${NB}€</span></div></div>
                <div class="pi-clavier" role="group" aria-label="Clavier">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', '0'].map(k => k === 'x'
                  ? `<button class="pi-touche corr" data-k="x" aria-label="Effacer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9l5 6M17 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`
                  : `<button class="pi-touche" data-k="${k}">${k}</button>`).join('')}</div></div></div>`,
            monte: p => $$('.pi-touche', p).forEach(b => b.addEventListener('click', () => touche(b.dataset.k))),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            const t = $('.pi-tpe', side);
            if (!tape) { secouer(t); Q.show('you', 'Tape le prix avec le clavier.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const v = +tape;
            if (v === PRIX) {
              t.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + "! L'entrée coûte quatre euros.")) return;
              suite();
            } else {
              t.classList.add('faux'); secouer(t);
              const m = await faux(f, SEG, 'Pas ' + lettres(v) + (v > 1 ? ' euros.' : ' euro.')); if (m === null) return;
              t.classList.remove('faux');
              if (m) { tape = String(PRIX); montrer(); t.classList.add('juste'); Q.show('ok', 'Quatre euros' + NB + ': 4' + NB + '€.'); state.essais = 0; suite(); }
              else { tape = ''; montrer(); ask(); }
            }
          }
          ask();
        },

        /* 3 · le bonnet : sur le présentoir, on fait glisser sur le comptoir ce qu'elle a oublié (ou on clique dessus) */
        async bonnet(f) {
          const SEG = [phrase('Vous avez un bonnet')[0], ligne(3)[1]];
          let fini = false;
          const comptoir = () => $('#pi-comptoir', side);
          const retour = el => { el.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)'; el.style.transform = ''; setTimeout(() => { el.style.transition = ''; }, 460); };
          const versComptoir = el => {                         // l'objet va se poser sur le comptoir
            const c = comptoir(); if (!c) return;
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = c.getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = 'transform .45s cubic-bezier(.34,1.3,.64,1)';
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + 24 + (b.height - 64) / 2 - (a.top + a.height / 2)}px) scale(${Math.min(.62, (b.height - 74) / a.height).toFixed(2)})`;
          };
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {                                   // le doigt fantôme glisse la serviette (jamais le bonnet)
              const de = $('.pi-objet[data-id="serviette"]', side), vers = comptoir(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(el) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const o = OBJETS.find(x => x.id === el.dataset.id), c = comptoir();
            versComptoir(el); c.classList.remove('chaud');
            await A.wait(450); if (!alive(f)) return;
            const nom = $('.pi-nom', c);
            if (o.bon) {
              fini = true; $$('.pi-objet', side).forEach(x => x.classList.remove('indice')); el.classList.add('juste'); c.classList.add('juste');
              nom.textContent = 'un bonnet de bain ✓';
              if (!await juste(f, 'Oui' + NB + '! Elle a oublié son bonnet. Il est obligatoire.')) return;
              suite();
            } else {
              el.classList.add('faux'); c.classList.add('faux'); nom.textContent = o.nom; secouer(c);
              const montrer = await faux(f, SEG, o.msg); if (montrer === null) return;
              el.classList.remove('faux'); c.classList.remove('faux'); nom.textContent = ''; retour(el);
              if (montrer) $('.pi-objet[data-id="bonnet"]', side).classList.add('indice');
              ask();
            }
          }
          function tirer(el) {
            let st = null;
            el.addEventListener('pointerdown', e => {
              if (!tour() || fini || e.button > 0) return;
              A.unlock(); idle.reset(); st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
              try { el.setPointerCapture(e.pointerId); } catch (err) {}
            });
            el.addEventListener('pointermove', e => {
              if (!st || e.pointerId !== st.id) return;
              const dx = e.clientX - st.x, dy = e.clientY - st.y;
              if (!st.bouge && Math.hypot(dx, dy) < 6) return;
              if (!st.bouge) { st.bouge = true; el.classList.add('tenu'); }
              el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
              comptoir().classList.toggle('chaud', dedans(comptoir(), e.clientX, e.clientY));
            });
            const fin = e => {
              if (!st || e.pointerId !== st.id) return;
              const s = st; st = null; comptoir().classList.remove('chaud');
              if (!s.bouge) return;
              el.classList.remove('tenu'); el.dataset.glisse = '1'; setTimeout(() => delete el.dataset.glisse, 60);
              if (e.type === 'pointerup' && tour() && dedans(comptoir(), e.clientX, e.clientY)) choisir(el); else retour(el);
            };
            el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
            el.addEventListener('click', () => { if (el.dataset.glisse || !tour() || fini) return; A.unlock(); idle.reset(); choisir(el); });
          }
          if (!await avant(f, {
            qui: 'cliente', seg: SEG, gel: 5.4, sideW: 500,
            consigne: "Qu'est-ce qu'elle a oublié" + NB + "? Elle peut l'acheter ici. Fais glisser le bon objet sur le comptoir.",
            panneau: `<div class="panel glass pisc"><p class="ptitre">Fais glisser le bon objet sur le comptoir.</p>
              <div class="pi-presentoir"><span class="pi-etiq">le présentoir de l'accueil</span>
                <div class="pi-objets">${OBJETS.map(o => `<button class="pi-objet" data-id="${o.id}" aria-label="${o.nom}">${o.svg}</button>`).join('')}</div></div>
              <div class="pi-comptoir" id="pi-comptoir"><span class="pi-etiq">le comptoir</span><span class="pi-nom" aria-live="polite"></span></div></div>`,
            monte: p => $$('.pi-objet', p).forEach(tirer),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        cliente: [{ text: "Une entrée adulte, s'il vous plaît.", seg: A.ligne(0) }, { text: "Non, j'ai oublié.", seg: A.phrase("Non, j'ai oublié") }, { text: 'Il est obligatoire' + A.NB + '?', seg: A.phrase('Il est obligatoire') }],
        employe: [{ text: 'Quatre euros.', seg: A.phrase('Quatre euros') }, { text: 'Vous avez un bonnet' + A.NB + '?', seg: A.phrase('Vous avez un bonnet') }, { text: 'Vous pouvez en acheter un ici.', seg: A.phrase('vous pouvez en acheter un ici') }],
      },
    }),
  };
})();
