/* Quel bus ? : à un arrêt de bus, un jeune homme avec un sac à dos demande à une dame si ce bus va au centre-ville ; non, pour
   le centre-ville, il faut prendre le bus numéro cinq ; il passe dans dix minutes (coupes à 5,125 et 5,75 s : plan large, qui
   suit le jeune homme jusqu'à l'abri ; la dame de près, qui regarde sa montre ; plan large).
   1 · le jeune homme redit sa question (la vidéo resserrée sur lui) : à côté, le plan de la ville, six endroits avec leur nom ;
       on clique sur l'endroit où il veut aller ;
   2 · la dame redit « il faut prendre le bus numéro cinq » : trois bus à l'arrêt (7, 15 et 5 : cinq / quinze / sept) ; on fait
       glisser le jeune homme dans le bon bus (un clic sur le bus marche aussi) ;
   3 · « Il passe quand ? — Dans dix minutes. » : l'écran de l'arrêt (ligne 5, centre-ville) attend le temps d'attente ; on
       clique sur le bon temps parmi 2, 10, 12 et 20 minutes (deux / dix / douze / vingt).
   Pas de geste sur l'image : le bus du début (au fond, flou, sans numéro lisible) n'est pas celui du centre-ville, et le plan
   de l'abri est illisible ; rien d'autre de l'image ne porte une information du dialogue. Les images figées (2,5 s : les deux
   de profil ; 5,0 s : la dame qui finit de parler ; 7,0 s : plan large ; 8,2 s : plan large) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* 1 · le plan de la ville : six endroits (x, y en % du plan), chacun avec son dessin (viewBox 48 × 40) */
  const ENDROITS = [
    { id: 'gare', nom: 'la gare', a: 'à la gare', x: 18, y: 22, svg: `<rect x="6" y="14" width="36" height="20" rx="2" fill="#D9C6A5" stroke="#7A6448" stroke-width="2"/><path d="M3 15L24 4L45 15Z" fill="#9C5B3E"/>
        <circle cx="24" cy="12" r="3.6" fill="#fff" stroke="#7A6448" stroke-width="1.4"/><path d="M24 10v2.2h1.6" stroke="#7A6448" stroke-width="1.1" fill="none"/>
        <rect x="11" y="20" width="7" height="14" rx="1" fill="#5B6E85"/><rect x="21" y="20" width="7" height="14" rx="1" fill="#5B6E85"/><rect x="31" y="20" width="7" height="14" rx="1" fill="#5B6E85"/><path d="M2 37h44" stroke="#7A6448" stroke-width="2"/>` },
    { id: 'centre', nom: 'le centre-ville', a: 'au centre-ville', x: 50, y: 50, svg: `<rect x="4" y="18" width="11" height="18" fill="#E8B87A" stroke="#8A6236" stroke-width="1.6"/><rect x="33" y="14" width="11" height="22" fill="#E8B87A" stroke="#8A6236" stroke-width="1.6"/>
        <rect x="15" y="12" width="18" height="24" fill="#F3E3C3" stroke="#8A6236" stroke-width="1.6"/><path d="M13 13L24 4L35 13Z" fill="#4E6A8A"/><path d="M24 4V0" stroke="#8A6236" stroke-width="1.4"/>
        <rect x="21" y="26" width="6" height="10" rx="3" fill="#8A6236"/><circle cx="24" cy="18" r="3" fill="#fff" stroke="#8A6236" stroke-width="1.2"/>
        <path d="M7 22h5M7 27h5M36 18h5M36 23h5M36 28h5" stroke="#8A6236" stroke-width="2"/><path d="M2 37h44" stroke="#8A6236" stroke-width="2"/>` },
    { id: 'hopital', nom: "l'hôpital", a: "à l'hôpital", x: 82, y: 22, svg: `<rect x="6" y="10" width="36" height="26" rx="2" fill="#F4F6F8" stroke="#6B7785" stroke-width="2"/>
        <rect x="19" y="3" width="10" height="10" rx="1.5" fill="#fff" stroke="#6B7785" stroke-width="1.6"/><path d="M24 5v6M21 8h6" stroke="#D33A3A" stroke-width="2.4"/>
        <path d="M10 17h6M10 23h6M32 17h6M32 23h6" stroke="#7FA6C9" stroke-width="3"/><rect x="20" y="26" width="8" height="10" fill="#7FA6C9"/><path d="M2 37h44" stroke="#6B7785" stroke-width="2"/>` },
    { id: 'piscine', nom: 'la piscine', a: 'à la piscine', x: 18, y: 78, svg: `<rect x="4" y="12" width="40" height="22" rx="5" fill="#7CC6EA" stroke="#3C88B4" stroke-width="2"/>
        <path d="M8 20q4-3 8 0t8 0t8 0t8 0M8 27q4-3 8 0t8 0t8 0t8 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M36 6v10M41 6v10M36 9h5M36 13h5" stroke="#6B7785" stroke-width="1.8"/>` },
    { id: 'universite', nom: "l'université", a: "à l'université", x: 82, y: 78, svg: `<path d="M4 14L24 4L44 14Z" fill="#B9C3CF" stroke="#5E6A78" stroke-width="1.8"/><rect x="6" y="14" width="36" height="4" fill="#D5DCE4" stroke="#5E6A78" stroke-width="1.4"/>
        <path d="M11 19v14M19 19v14M29 19v14M37 19v14" stroke="#5E6A78" stroke-width="3.4"/><rect x="5" y="33" width="38" height="4" fill="#D5DCE4" stroke="#5E6A78" stroke-width="1.4"/>` },
    { id: 'stade', nom: 'le stade', a: 'au stade', x: 50, y: 14, svg: `<ellipse cx="24" cy="22" rx="21" ry="13" fill="#D9DEE4" stroke="#6B7785" stroke-width="2"/><ellipse cx="24" cy="22" rx="14" ry="7.5" fill="#6DBB5B" stroke="#fff" stroke-width="1.4"/>
        <path d="M24 14.5v15" stroke="#fff" stroke-width="1.2"/><circle cx="24" cy="22" r="2.6" fill="none" stroke="#fff" stroke-width="1.2"/>` },
  ];
  const BON_LIEU = 'centre';
  /* 2 · les trois bus à l'arrêt (cinq / quinze / sept) */
  const BUS = [{ n: 7, dit: 'sept', c: '#2F7DD1' }, { n: 15, dit: 'quinze', c: '#C2410C' }, { n: 5, dit: 'cinq', c: '#15803D' }];
  const BON_BUS = 5;
  const CAR = (n, c) => `<svg viewBox="0 0 220 76" aria-hidden="true"><rect x="4" y="6" width="210" height="56" rx="10" fill="${c}"/><rect x="4" y="46" width="210" height="8" fill="rgba(0,0,0,.18)"/>
      <rect x="168" y="12" width="40" height="30" rx="6" fill="#CFE3F2"/><rect x="12" y="12" width="30" height="24" rx="3" fill="#CFE3F2"/><rect x="48" y="12" width="30" height="24" rx="3" fill="#CFE3F2"/>
      <rect x="84" y="12" width="30" height="24" rx="3" fill="#CFE3F2"/><rect x="122" y="12" width="38" height="46" rx="3" fill="#E7F1F8" stroke="rgba(0,0,0,.25)" stroke-width="2" class="porte"/>
      <path d="M141 12v46" stroke="rgba(0,0,0,.25)" stroke-width="2"/><circle cx="46" cy="64" r="10" fill="#2A2F36"/><circle cx="46" cy="64" r="4" fill="#9AA3AE"/>
      <circle cx="182" cy="64" r="10" fill="#2A2F36"/><circle cx="182" cy="64" r="4" fill="#9AA3AE"/><rect x="208" y="48" width="6" height="6" rx="2" fill="#FFE08A"/></svg>`;
  const PERSO = `<svg viewBox="0 0 40 56" aria-hidden="true"><rect x="5" y="20" width="12" height="20" rx="4" fill="#6E7A4A"/><circle cx="22" cy="10" r="8" fill="#E9B98F"/>
      <path d="M14 8q2-8 9-7q7 1 7 7q-3-3-8-2q-5 0-8 2z" fill="#4A3424"/><rect x="13" y="19" width="18" height="22" rx="7" fill="#4B5563"/><rect x="15" y="40" width="6" height="14" rx="3" fill="#1F2937"/><rect x="23" y="40" width="6" height="14" rx="3" fill="#1F2937"/></svg>`;
  /* 3 · l'écran de l'arrêt : le temps d'attente du bus 5 (deux / dix / douze / vingt) */
  const TEMPS = [2, 10, 12, 20];
  const DIT = { 2: 'deux', 10: 'dix', 12: 'douze', 20: 'vingt' };
  const BON_T = 10;

  return {
    plans: [{ de: 0, cx: { jeune: .24, dame: .66 } }, { de: 5.125, cx: { jeune: .05, dame: .64 } }, { de: 5.75, cx: { jeune: .34, dame: .68 } }],
    ordre: ['plan', 'bus', 'ecran'],
    bravo: 'Bravo' + NB + '! Dans dix minutes, le jeune homme prend le bus numéro cinq.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « Excusez-moi madame, ce bus va au centre-ville ? » : sur le plan de la ville, on clique sur l'endroit */
        async plan(f) {
          const SEG = ligne(0);
          let fini = false;
          const lieu = id => $(`.cv-lieu[data-id="${id}"]`, side);
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(lieu('piscine')), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const id = b.dataset.id, E = ENDROITS.find(x => x.id === id);
            if (id === BON_LIEU) {
              fini = true; $$('.cv-lieu', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); $('.etat', b).textContent = '✓';
              if (!await juste(f, 'Oui' + NB + '! Il veut aller au centre-ville.')) return;
              suite();
            } else {
              b.classList.add('faux'); $('.etat', b).textContent = 'non'; secouer($('.cv-plan', side));
              const montrer = await faux(f, SEG, 'Non' + NB + ': il ne va pas ' + E.a + '.'); if (montrer === null) return;
              b.classList.remove('faux'); $('.etat', b).textContent = '';
              if (montrer) lieu(BON_LIEU).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'jeune', seg: SEG, gel: 2.5, sideW: 500,
            consigne: 'Où veut aller le jeune homme' + NB + "? Clique sur l'endroit, sur le plan.",
            panneau: `<div class="panel glass cv"><p class="ptitre">Le plan de la ville${NB}: clique sur l'endroit.</p>
              <div class="cv-plan" role="group" aria-label="Le plan de la ville">
                <svg class="cv-rues" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M18 22H82M18 78H82M18 22V78M82 22V78M50 14V86M18 50H82" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
                  <path d="M18 22H82M18 78H82M18 22V78M82 22V78M50 14V86M18 50H82" stroke="#D8D2C4" stroke-width="5.6" fill="none" stroke-linecap="round" opacity=".35"/>
                  <path d="M0 64Q30 58 50 66T100 60" stroke="#9CCBE8" stroke-width="4" fill="none"/></svg>
                ${ENDROITS.map(e => `<button class="cv-lieu" data-id="${e.id}" style="left:${e.x}%;top:${e.y}%" aria-label="${e.nom}">
                  <svg viewBox="0 0 48 40" aria-hidden="true">${e.svg}</svg><span class="nom">${e.nom}</span><span class="etat" aria-hidden="true"></span></button>`).join('')}
              </div></div>`,
            monte: p => $$('.cv-lieu', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · « Il faut prendre le bus numéro cinq. » : on fait glisser le jeune homme dans le bon bus (ou on clique sur le bus) */
        async bus(f) {
          const SEG = ligne(1);
          let fini = false;
          const car = n => $(`.cv-car[data-n="${n}"]`, side), perso = () => $('.cv-perso', side);
          const monter = (b, cls) => { $('.passager', b).innerHTML = PERSO; b.classList.add('pris'); if (cls) b.classList.add(cls); const p = perso(); p.style.transition = 'none'; p.style.transform = ''; p.classList.add('parti'); };
          const descendre = b => { $('.passager', b).innerHTML = ''; b.classList.remove('pris', 'faux'); $('.etat', b).textContent = ''; perso().classList.remove('parti'); };
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {                                   // le doigt fantôme glisse vers le bus 15 (pas vers la réponse)
              const de = perso(), vers = car(15); if (!de || !vers || !de.isConnected) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(n) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const b = car(n); monter(b);
            $$('.cv-car', side).forEach(x => x.classList.remove('chaud'));
            await wait(350); if (!alive(f)) return;
            if (n === BON_BUS) {
              fini = true; $$('.cv-car', side).forEach(x => x.classList.remove('indice')); b.classList.add('juste'); $('.etat', b).textContent = '✓';
              if (!await juste(f, 'Oui' + NB + '! Le bus numéro cinq va au centre-ville.')) return;
              suite();
            } else {
              b.classList.add('faux'); $('.etat', b).textContent = 'non'; secouer(b);
              const montrer = await faux(f, SEG, 'Non' + NB + ": ça, c'est le bus " + BUS.find(x => x.n === n).dit + '.'); if (montrer === null) return;
              descendre(b);
              if (montrer) {                                   // deux essais : le jeune homme monte dans le bus 5
                fini = true; const c = car(BON_BUS); monter(c, 'juste'); $('.etat', c).textContent = '✓';
                Q.show('ok', 'Le bus numéro cinq.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'dame', seg: SEG, gel: 5.0, sideW: 500,
            consigne: 'Pour le centre-ville, il faut prendre quel bus' + NB + '? Fais monter le jeune homme dans le bon bus.',
            panneau: `<div class="panel glass cv"><p class="ptitre">Fais glisser le jeune homme dans le bon bus.</p>
              <div class="cv-arret" role="group" aria-label="Les bus à l'arrêt">
                ${BUS.map(b => `<button class="cv-car" data-n="${b.n}" aria-label="Le bus numéro ${b.n}"><span class="dessin">${CAR(b.n, b.c)}</span>
                  <span class="num" style="--l:${b.c}">${b.n}</span><span class="passager" aria-hidden="true"></span><span class="etat" aria-hidden="true"></span></button>`).join('')}
              </div>
              <div class="cv-quai"><div class="cv-perso" aria-hidden="true">${PERSO}</div><span class="legende">le jeune homme</span></div></div>`,
            monte: p => {
              const el = $('.cv-perso', p); let st = null;
              el.addEventListener('pointerdown', e => {
                if (!tour() || fini || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault();
                el.style.transition = 'none'; el.style.transform = '';
                st = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false };
                try { el.setPointerCapture(e.pointerId); } catch (err) {}
                el.classList.add('tenu');
              });
              el.addEventListener('pointermove', e => {
                if (!st || e.pointerId !== st.id) return;
                const dx = e.clientX - st.x, dy = e.clientY - st.y;
                if (!st.bouge && Math.hypot(dx, dy) > 5) { st.bouge = true; sfx.tick(); }
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
                $$('.cv-car', p).forEach(v => v.classList.toggle('chaud', dedans(v, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenu');
                const v = e.type === 'pointerup' && tour() ? $$('.cv-car', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.cv-car', p).forEach(x => x.classList.remove('chaud'));
                if (v) choisir(+v.dataset.n); else { el.style.transition = 'transform .4s cubic-bezier(.34,1.3,.64,1)'; el.style.transform = ''; }
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.cv-car', p).forEach(v => v.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(+v.dataset.n); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 3 · « Il passe quand ? — Dans dix minutes. » : on complète l'écran de l'arrêt */
        async ecran(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let fini = false;
          const btn = t => $(`.cv-temps[data-t="${t}"]`, side);
          const afficher = (t, cls) => { const d = $('#attente', side); d.textContent = t == null ? '--' : t; d.className = 'min ' + (cls || ''); };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere(btn(20)), 5000); };
          async function choisir(b) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const t = +b.dataset.t; afficher(t);
            $$('.cv-temps', side).forEach(x => x.classList.toggle('choisi', x === b));
            await wait(350); if (!alive(f)) return;
            if (t === BON_T) {
              fini = true; $$('.cv-temps', side).forEach(x => x.classList.remove('indice', 'choisi')); b.classList.add('juste'); afficher(t, 'juste'); $('.cv-ecran', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Dans dix minutes.')) return;
              suite();
            } else {
              b.classList.remove('choisi'); b.classList.add('faux'); afficher(t, 'faux'); secouer($('.cv-ecran', side));
              const montrer = await faux(f, SEG, 'Non' + NB + ': pas ' + DIT[t] + ' minutes.'); if (montrer === null) return;
              b.classList.remove('faux'); afficher(null);
              if (montrer) btn(BON_T).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'dame', seg: SEG, gel: 7.0, sideW: 480,
            consigne: 'Le bus passe dans combien de minutes' + NB + '? Clique sur la bonne réponse.',
            panneau: `<div class="panel glass cv"><p class="ptitre">L'écran de l'arrêt${NB}: clique sur le temps.</p>
              <div class="cv-ecran" aria-live="polite"><p class="tete"><span>Prochain bus</span><span>attente</span></p>
                <p class="rang"><span class="ligne">5</span><span class="dest">Centre-ville</span><span class="att"><span id="attente" class="min">--</span> min</span></p></div>
              <div class="cv-choix" role="group" aria-label="Le temps d'attente">${TEMPS.map(t => `<button class="cv-temps" data-t="${t}" aria-label="${t} minutes"><b>${t}</b><span>min</span></button>`).join('')}</div></div>`,
            monte: p => $$('.cv-temps', p).forEach(b => b.addEventListener('click', () => choisir(b))),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { jeune: 'centre-ville', dame: 'bus 5' },
      faits: {
        jeune: [{ text: 'Ce bus va au centre-ville' + A.NB + '?', seg: [A.phrase('ce bus va au')[0], A.ligne(0)[1]] }, { text: 'Il passe quand' + A.NB + '?', seg: A.ligne(2) }],
        dame: [{ text: 'Il faut prendre le bus numéro cinq.', seg: [A.phrase('il faut prendre')[0], A.ligne(1)[1]] }, { text: 'Dans dix minutes.', seg: A.ligne(3) }],
      },
    }),
  };
})();
