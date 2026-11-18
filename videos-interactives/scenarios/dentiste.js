/* Chez le dentiste : un homme sur le fauteuil se tient la joue ; il a mal à une dent en bas à gauche, depuis trois jours
   (coupes à 1,96, 4,92, 5,96 et 6,96 s : plan large, le patient de près, la dentiste de près, le patient de près, plan large ;
   à la fin, la dentiste allume la lampe et il ouvre la bouche).
   1 · le patient redit « J'ai mal à une dent en bas à gauche. » (la vidéo resserrée sur lui) : à côté, ses dents dessinées
       (les deux mâchoires, avec « en haut », « en bas », « gauche », « droite » écrits en toutes lettres : pas de piège de
       point de vue) ; on clique sur le bon quart de la bouche (en bas à gauche) ;
   2 · « Depuis quand ? — Depuis trois jours. » : on fait glisser la bonne étiquette (2 jours, 3 jours, 13 jours,
       3 semaines) sur la fiche de soins de la dentiste ; un clic sur l'étiquette la pose aussi.
   Pas de geste sur l'image : on ne voit jamais ses dents, rien dans le cabinet ne porte une information du dialogue, et
   « où il a mal » se devinerait en partie à sa main sur la joue. Les images figées (9,5 s : il a la bouche ouverte, la
   main posée ; 8,0 s : plan large) ne donnent ni l'endroit ni la durée ; la main sur la joue ne dit pas « en bas ». */
window.SCENARIO = (() => {
  const NB = '\u202f';
  /* 1 · les dents (viewBox 440 × 320) : la mâchoire du haut (∩) et celle du bas (∪), cinq dents de chaque côté */
  const QUARTS = [
    { id: 'hg', nom: 'en haut à gauche', haut: true, gauche: true },
    { id: 'hd', nom: 'en haut à droite', haut: true, gauche: false },
    { id: 'bg', nom: 'en bas à gauche', haut: false, gauche: true },
    { id: 'bd', nom: 'en bas à droite', haut: false, gauche: false },
  ];
  const BON_QUART = 'bg';
  const ANGLES = [98, 115, 132, 149, 166], RAYONS = [11, 11, 12, 13.5, 14.5];
  function dentsDe(q) {
    const cy = q.haut ? 148 : 172, s = q.haut ? -1 : 1;
    return ANGLES.map((a0, i) => {
      const a = (q.gauche ? a0 : 180 - a0) * Math.PI / 180;
      const x = 220 + 128 * Math.cos(a), y = cy + s * 104 * Math.sin(a);
      const tan = Math.atan2(s * 104 * Math.cos(a), -128 * Math.sin(a)) * 180 / Math.PI;
      return `<ellipse class="dent" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${RAYONS[i]}" ry="${(RAYONS[i] * .86).toFixed(1)}" transform="rotate(${tan.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }).join('');
  }
  const gencive = haut => {                       // la gencive : un arc épais sous les dents
    const cy = haut ? 148 : 172, s = haut ? -1 : 1, pts = [];
    for (let d = 172; d >= 8; d -= 4) { const a = d * Math.PI / 180; pts.push(`${(220 + 128 * Math.cos(a)).toFixed(1)} ${(cy + s * 104 * Math.sin(a)).toFixed(1)}`); }
    return `<path class="gencive" d="M${pts.join('L')}"/>`;
  };
  const BOUCHE = `<svg viewBox="0 0 440 320" role="group" aria-label="Ses dents">
      <path class="axe" d="M220 22V298M40 160H400"/>
      ${gencive(true)}${gencive(false)}
      ${QUARTS.map(q => `<g class="quart" data-q="${q.id}" role="button" tabindex="0" aria-label="${q.nom}">
        <rect class="hitq" x="${q.gauche ? 0 : 220}" y="${q.haut ? 0 : 160}" width="220" height="160"/>${dentsDe(q)}</g>`).join('')}
      <text class="mot" x="220" y="112">en haut</text><text class="mot" x="220" y="222">en bas</text>
      <text class="mot cote" x="38" y="152">gauche</text><text class="mot cote" x="402" y="152">droite</text>
    </svg>`;

  /* 2 · les étiquettes */
  const ETIQ = [
    { id: '13j', t: '13 jours', dit: 'treize jours' },
    { id: '3j', t: '3 jours', dit: 'trois jours', bon: true },
    { id: '3s', t: '3 semaines', dit: 'trois semaines' },
    { id: '2j', t: '2 jours', dit: 'deux jours' },
  ];
  const cap = s => s[0].toUpperCase() + s.slice(1);

  return {
    plans: [{ de: 0, cx: { dentiste: .3, patient: .67 } }, { de: 1.958, cx: { dentiste: .02, patient: .54 } }, { de: 4.917, cx: { dentiste: .35, patient: .98 } },
      { de: 5.958, cx: { dentiste: .02, patient: .53 } }, { de: 6.958, cx: { dentiste: .27, patient: .67 } }],
    ordre: ['ou', 'depuis'],
    bravo: 'Bravo' + NB + '! La dentiste va soigner sa dent.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · « J'ai mal à une dent en bas à gauche. » : on clique sur le bon quart de la bouche */
        async ou(f) {
          const SEG = ligne(1);
          let fini = false;
          const nom = (q, cls) => {                      // le nom de l'endroit, écrit sur le dessin
            const b = $('.dt-bouche', side); if (!b) return;
            $$('.dt-nom', b).forEach(x => x.remove());
            b.insertAdjacentHTML('beforeend', `<span class="dt-nom ${cls}" style="left:${q.gauche ? 27 : 73}%;top:${q.haut ? 8 : 92}%">${cap(q.nom)}</span>`);
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.quart[data-q="hd"]', side)), 5000); };
          async function choisir(g) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const q = QUARTS.find(x => x.id === g.dataset.q);
            if (q.id === BON_QUART) {
              fini = true; $$('.quart', side).forEach(x => x.classList.remove('indice', 'faux')); g.classList.add('juste'); nom(q, 'juste');
              if (!await juste(f, 'Oui' + NB + '! Il a mal à une dent en bas à gauche.')) return;
              suite();
            } else {
              g.classList.add('faux'); nom(q, 'faux'); secouer($('.dt-bouche', side));
              const montrer = await faux(f, SEG, 'Non' + NB + ': là, c\'est ' + q.nom + '.'); if (montrer === null) return;
              g.classList.remove('faux'); $$('.dt-nom', side).forEach(x => x.remove());
              if (montrer) $(`.quart[data-q="${BON_QUART}"]`, side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'patient', seg: SEG, gel: 9.5, sideW: 500,
            consigne: 'Où est la dent qui fait mal' + NB + '? Clique au bon endroit sur le dessin.',
            panneau: `<div class="panel glass dentiste"><p class="ptitre">Ses dents${NB}: clique là où il a mal.</p><div class="dt-bouche">${BOUCHE}</div></div>`,
            monte: p => $$('.quart', p).forEach(g => {
              g.addEventListener('click', () => choisir(g));
              g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(g); } });
            }),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · « Depuis quand ? — Depuis trois jours. » : on fait glisser la bonne étiquette sur la fiche de soins */
        async depuis(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          const etiq = id => $(`.dt-etiq[data-id="${id}"]`, side), caseF = () => $('#dt-case', side);
          let fini = false, glisse = false;
          function poser(el, dans, anime = true) {         // l'étiquette va dans la case de la fiche (ou revient à sa place)
            if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!dans) { el.style.transition = tr; el.style.transform = ''; return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = caseF().getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px)`;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = etiq('2j'), vers = caseF(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            A.unlock(); setTurn('wait'); idle.clear(); sfx.tick();
            const el = etiq(id), e = ETIQ.find(x => x.id === id), c = caseF();
            $$('.dt-etiq', side).forEach(x => x.classList.remove('indice'));
            c.classList.remove('chaud'); el.classList.add('posee'); poser(el, true);
            await wait(450); if (!alive(f)) return;
            if (e.bon) {
              fini = true; el.classList.add('juste'); c.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Depuis trois jours.')) return;
              suite();
            } else {
              el.classList.add('faux'); c.classList.add('faux'); secouer(c);
              const montrer = await faux(f, SEG, 'Pas ' + e.dit + '.'); if (montrer === null) return;
              el.classList.remove('faux', 'posee'); c.classList.remove('faux'); poser(el, false);
              if (montrer) {                                  // deux essais : on pose la bonne étiquette
                await wait(350); if (!alive(f)) return;
                fini = true; const bon = etiq('3j'); bon.classList.add('posee', 'juste'); poser(bon, true); c.classList.add('juste');
                Q.show('ok', 'Depuis trois jours.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'patient', seg: SEG, gel: 8.0, sideW: 480,
            consigne: 'Il a mal depuis quand' + NB + '? Fais glisser la bonne étiquette sur la fiche.',
            panneau: `<div class="panel glass dentiste"><p class="ptitre">Fais glisser la bonne étiquette sur la fiche.</p>
              <div class="dt-fiche" id="dt-fiche">
                <div class="dt-tete"><b>Fiche de soins</b><span>Cabinet dentaire</span></div>
                <div class="dt-ligne"><span>Douleur${NB}:</span><b>une dent, en bas à gauche</b></div>
                <div class="dt-ligne"><span>Depuis${NB}:</span><div class="dt-case" id="dt-case" aria-label="La case Depuis"></div></div>
              </div>
              <div class="dt-etiqs" role="group" aria-label="Les étiquettes">${ETIQ.map(e => `<button class="dt-etiq" data-id="${e.id}" aria-label="${e.dit}">${e.t}</button>`).join('')}</div></div>`,
            monte: p => $$('.dt-etiq', p).forEach(el => {
              let st = null;
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
                if (!st.bouge && Math.hypot(dx, dy) > 6) { st.bouge = true; sfx.tick(); }
                if (!st.bouge) return;
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
                caseF().classList.toggle('chaud', dedans($('#dt-fiche', p), e.clientX, e.clientY));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                const bouge = st.bouge; st = null; el.classList.remove('tenue'); caseF().classList.remove('chaud');
                if (!bouge) { el.style.transform = ''; return; }    // un simple appui : le clic s'en charge
                glisse = true; setTimeout(() => { glisse = false; }, 0);
                if (e.type === 'pointerup' && tour() && dedans($('#dt-fiche', p), e.clientX, e.clientY)) choisir(el.dataset.id); else poser(el, false);
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              el.addEventListener('click', () => { if (glisse || !tour()) return; choisir(el.dataset.id); });
            }),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { patient: 'mal à une dent' },
      faits: {
        dentiste: [{ text: "Qu'est-ce qui ne va pas" + A.NB + '?', seg: A.ligne(0) }, { text: 'Depuis quand' + A.NB + '?', seg: A.ligne(2) }],
        patient: [{ text: "J'ai mal à une dent en bas à gauche.", seg: A.ligne(1) }, { text: 'Depuis trois jours.', seg: A.ligne(3) }],
      },
    }),
  };
})();
