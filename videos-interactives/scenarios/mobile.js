/* Chez le réparateur : une cliente a fait tomber son téléphone, l'écran est cassé ; le technicien peut le réparer, ça
   coûte quatre-vingts euros ; ça prend une heure : « Revenez à quinze heures. » (coupes à 2,92, 4,96, 6,92 et 8,96 s :
   plan large, le technicien de près, la cliente de près, le technicien de près, plan large).
   1 · la cliente redit sa phrase (la vidéo resserrée sur elle) : à côté, son téléphone dessiné, devant et derrière, sans
       fissure ; on clique sur la partie cassée (l'écran, parmi le bouton, la caméra, le dos) ; une fois juste, l'écran
       se fissure ;
   2 · le technicien redit le prix : on fait glisser la bonne étiquette de prix (18, 20, 80 ou 90 €) sur la fiche de
       réparation (un appui sur une étiquette la pose aussi) ; quatre-vingts, pas vingt ni quatre-vingt-dix ;
   3 · « Ça prend combien de temps ? — Une heure. Revenez à quinze heures. » : on fait tourner l'aiguille de la petite
       horloge « Revenez à » (comme sur une porte de boutique), puis Valider ; une heure, c'est la durée, pas 13 h.
   Pas de geste sur l'image : le téléphone n'est jamais visible, il n'y a ni horloge ni prix dans la boutique ; toucher une
   personne ou les étagères ne vérifierait rien du dialogue. Les images figées (2,0 s plan large ; 4,0 et 8,0 s : le
   technicien de près ; 9,5 s plan large) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* 1 · le téléphone (viewBox 360 × 336) : devant à gauche, derrière à droite ; les quatre parties à toucher */
  const PARTIES = [
    { id: 'ecran', nom: "l'écran", lx: 105, ly: 160 },
    { id: 'bouton', nom: 'le bouton', lx: 176, ly: 70 },
    { id: 'dos', nom: 'le dos', lx: 265, ly: 220 },
    { id: 'camera', nom: 'la caméra', lx: 238, ly: 128 },
  ];
  const FORMES = {
    ecran: '<rect class="hitp" x="50" y="44" width="110" height="232" rx="12"/><rect class="forme ecran" x="50" y="44" width="110" height="232" rx="12"/>'
      + '<path class="fissure" d="M118 120 104 146 122 160 98 196 112 214 90 250M104 146 74 140 60 152M122 160 146 170 158 190M98 196 70 206M112 214 136 236 150 232"/>',
    bouton: '<rect class="hitp" x="170" y="88" width="9" height="44" rx="3"/><rect class="forme" x="170" y="88" width="9" height="44" rx="3"/>'
      + '<rect class="hitp" x="191" y="88" width="9" height="44" rx="3"/><rect class="forme" x="191" y="88" width="9" height="44" rx="3"/>',
    dos: '<rect class="hitp" x="200" y="30" width="130" height="260" rx="22"/><rect class="forme dos" x="200" y="30" width="130" height="260" rx="22"/>'
      + '<circle class="logo" cx="265" cy="190" r="13"/>',
    camera: '<rect class="hitp" x="212" y="42" width="54" height="76" rx="16"/><rect class="forme camera" x="212" y="42" width="54" height="76" rx="16"/>'
      + '<circle class="lentille" cx="239" cy="62" r="11"/><circle class="lentille" cx="239" cy="96" r="11"/><circle class="flash" cx="258" cy="80" r="3.5"/>',
  };
  const TEL = `<svg viewBox="0 0 360 336" role="group" aria-label="Son téléphone">
      <rect class="corps" x="40" y="30" width="130" height="260" rx="22"/>
      <rect class="cadre" x="40" y="30" width="130" height="260" rx="22"/>
      ${['bouton', 'ecran', 'dos', 'camera'].map(id => { const p = PARTIES.find(x => x.id === id);
        return `<g class="partie" data-id="${id}" role="button" tabindex="0" aria-label="${p.nom}">${FORMES[id]}</g>`; }).join('')}
      <rect class="encoche" x="88" y="50" width="34" height="9" rx="4.5"/>
      <text class="vue" x="105" y="318">devant</text><text class="vue" x="265" y="318">derrière</text>
    </svg>`;

  /* 2 · les étiquettes de prix */
  const PRIX = [{ v: 18, mot: 'dix-huit euros' }, { v: 80, mot: 'quatre-vingts euros' }, { v: 20, mot: 'vingt euros' }, { v: 90, mot: 'quatre-vingt-dix euros' }];
  const BON_PRIX = 80;

  /* 3 · l'horloge « Revenez à » (viewBox 300 × 300, centre 150 150) : une seule aiguille, celle des heures, avec une poignée */
  const pol = (a, r) => [150 + r * Math.sin(a * Math.PI / 180), 150 - r * Math.cos(a * Math.PI / 180)].map(n => n.toFixed(1));
  const TRAITS = Array.from({ length: 12 }, (_, i) => { const [x1, y1] = pol(i * 30, 128), [x2, y2] = pol(i * 30, 138); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('');
  const CHIFFRES = Array.from({ length: 12 }, (_, i) => { const [x, y] = pol((i + 1) * 30, 108); return `<text x="${x}" y="${y}">${i + 1}</text>`; }).join('');
  const CHIFFRES24 = Array.from({ length: 12 }, (_, i) => { const [x, y] = pol((i + 1) * 30, 76); return `<text x="${x}" y="${y}">${i + 13}</text>`; }).join('');
  const HORLOGE = `<svg viewBox="0 0 300 300" aria-hidden="true">
      <circle cx="150" cy="150" r="143" fill="#fff" stroke="#2A3142" stroke-width="8"/>
      <g class="traits">${TRAITS}</g>
      <g class="chiffres">${CHIFFRES}</g>
      <g class="chiffres24">${CHIFFRES24}</g>
      <g class="aig" id="mb-aig"><rect x="143" y="62" width="14" height="100" rx="7" fill="#0B0D16"/><circle class="poignee" cx="150" cy="66" r="15" fill="#fff" stroke="#3AA8FF" stroke-width="5"/></g>
      <circle cx="150" cy="150" r="9" fill="#2A3142"/>
    </svg>`;
  /* la boutique est ouverte de 9 h à 20 h : l'aiguille sur 3, c'est 15 h */
  const H24 = n => (n >= 9 ? n : n + 12);
  const MOTS = { 9: 'neuf heures', 10: 'dix heures', 11: 'onze heures', 12: 'midi', 13: 'treize heures', 14: 'quatorze heures', 15: 'quinze heures', 16: 'seize heures',
    17: 'dix-sept heures', 18: 'dix-huit heures', 19: 'dix-neuf heures', 20: 'vingt heures' };
  const RETOUR = 15, AU_DEBUT = 12;

  return {
    plans: [{ de: 0, cx: { technicien: .25, cliente: .68 } }, { de: 2.917, cx: { technicien: .47, cliente: .98 } }, { de: 4.958, cx: { technicien: .02, cliente: .58 } },
      { de: 6.917, cx: { technicien: .48, cliente: .98 } }, { de: 8.958, cx: { technicien: .27, cliente: .7 } }],
    ordre: ['ecran', 'prix', 'heure'],
    bravo: 'Bravo' + NB + '! À quinze heures, son téléphone est réparé.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      const cap = s => s[0].toUpperCase() + s.slice(1);
      return {
        /* 1 · la cliente redit sa phrase : sur son téléphone dessiné, on clique sur la partie cassée */
        async ecran(f) {
          const SEG = ligne(0);
          let fini = false;
          const nom = (p, cls) => {                          // le nom de la partie, écrit sur le dessin
            const b = $('.mb-tel', side); if (!b) return;
            $$(`.nompart[data-id="${p.id}"]`, b).forEach(x => x.remove());
            b.insertAdjacentHTML('beforeend', `<span class="nompart ${cls}" data-id="${p.id}" style="left:${(p.lx / 360 * 100).toFixed(1)}%;top:${(p.ly / 336 * 100).toFixed(1)}%">${cap(p.nom)}</span>`);
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.partie[data-id="camera"]', side)), 5000); };
          async function choisir(g) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const p = PARTIES.find(x => x.id === g.dataset.id);
            if (p.id === 'ecran') {
              fini = true; $$('.partie', side).forEach(x => x.classList.remove('indice', 'faux')); g.classList.add('juste', 'casse'); nom(p, 'juste');
              if (!await juste(f, 'Oui' + NB + "! L'écran est cassé.")) return;
              suite();
            } else {
              g.classList.add('faux'); nom(p, 'faux'); secouer($('.mb-tel', side));
              const montrer = await faux(f, SEG, "Non, ça, c'est " + p.nom + '.'); if (montrer === null) return;
              g.classList.remove('faux'); $$(`.nompart[data-id="${p.id}"]`, side).forEach(x => x.remove());
              if (montrer) $('.partie[data-id="ecran"]', side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'cliente', seg: SEG, gel: 2.0, sideW: 480,
            consigne: "Qu'est-ce qui est cassé" + NB + '? Clique sur la bonne partie du téléphone.',
            panneau: `<div class="panel glass mobile"><p class="ptitre">Son téléphone${NB}: clique sur la partie cassée.</p><div class="mb-tel">${TEL}</div></div>`,
            monte: p => $$('.partie', p).forEach(g => {
              g.addEventListener('click', () => choisir(g));
              g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(g); } });
            }),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · le technicien redit le prix : on fait glisser la bonne étiquette sur la fiche de réparation */
        async prix(f) {
          const SEG = ligne(1);
          let fini = false;
          const etiq = v => $(`.mb-etiq[data-v="${v}"]`, side), caseP = () => $('#mb-case', side);
          function poser(el, dansCase, anime = true) {
            if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!dansCase) { el.style.transition = tr; el.style.transform = ''; return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = caseP().getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px)`;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {
              const de = etiq(20), vers = caseP(); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(v) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const el = etiq(v), c = caseP(); poser(el, true); el.classList.add('posee');
            c.classList.remove('chaud');
            await wait(500); if (!alive(f)) return;
            if (v === BON_PRIX) {
              fini = true; $$('.mb-etiq', side).forEach(x => x.classList.remove('indice')); c.classList.add('juste'); $('#mb-fiche', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Quatre-vingts euros.')) return;
              suite();
            } else {
              c.classList.add('faux'); secouer($('#mb-fiche', side));
              const montrer = await faux(f, SEG, 'Non, pas ' + PRIX.find(x => x.v === v).mot + '.'); if (montrer === null) return;
              c.classList.remove('faux'); el.classList.remove('posee'); poser(el, false);
              if (montrer) {                                    // deux essais : on pose la bonne étiquette
                await wait(350); if (!alive(f)) return;
                fini = true; const b = etiq(BON_PRIX); poser(b, true); b.classList.add('posee'); c.classList.add('juste'); $('#mb-fiche', side).classList.add('juste');
                Q.show('ok', 'Quatre-vingts euros' + NB + ': 80' + NB + '€.'); state.essais = 0; suite();
              } else ask();
            }
          }
          if (!await avant(f, {
            qui: 'technicien', seg: SEG, gel: 4.0, sideW: 480,
            consigne: 'La réparation coûte combien' + NB + '? Fais glisser le bon prix sur la fiche de réparation.',
            panneau: `<div class="panel glass mobile"><p class="ptitre">Fais glisser le bon prix sur la fiche.</p>
              <div class="mb-fiche" id="mb-fiche">
                <div class="tete"><b>Fiche de réparation</b><span>N° 112</span></div>
                <p class="ligne-f"><span>Appareil${NB}:</span><b>téléphone</b></p>
                <p class="ligne-f"><span>Problème${NB}:</span><b>écran cassé</b></p>
                <div class="ligne-f prix"><span>Prix${NB}:</span><div class="mb-case" id="mb-case" aria-label="Le prix"><small>…</small></div></div>
              </div>
              <div class="mb-etiqs" role="group" aria-label="Les prix">${PRIX.map(p => `<button class="mb-etiq" data-v="${p.v}" aria-label="${p.v} euros"><span class="trou" aria-hidden="true"></span>${p.v}${NB}€</button>`).join('')}</div></div>`,
            monte: p => {
              const fiche = $('#mb-fiche', p);
              $$('.mb-etiq', p).forEach(el => {
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
                  el.style.transform = `translate(${dx}px, ${dy}px) rotate(-4deg) scale(1.06)`;
                  $('#mb-case', p).classList.toggle('chaud', dedans(fiche, e.clientX, e.clientY));
                });
                const lacher = e => {
                  if (!st || e.pointerId !== st.id) return;
                  const bouge = st.bouge; st = null; el.classList.remove('tenue');
                  $('#mb-case', p).classList.remove('chaud');
                  const ok = e.type === 'pointerup' && tour();
                  if (ok && (!bouge || dedans(fiche, e.clientX, e.clientY))) choisir(+el.dataset.v);   // un appui pose aussi l'étiquette
                  else poser(el, false);
                };
                el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
                el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (tour()) { A.unlock(); choisir(+el.dataset.v); } } });
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 3 · « Ça prend combien de temps ? — Une heure. Revenez à quinze heures. » : on tourne l'aiguille, puis Valider */
        async heure(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let cont = AU_DEBUT * 30, bouge = false, tient = false;
          const mod = x => ((x % 360) + 360) % 360;
          const cadran = () => (Math.round(mod(cont) / 30) % 12) || 12;
          const proche = a => cont + ((a - mod(cont) + 540) % 360) - 180;          // le même angle, au plus près de l'aiguille
          const poser = (a, net) => {
            cont = net ? Math.round(a / 30) * 30 : a;
            const h = $('#mb-aig', side); if (!h) return;
            h.style.transform = `rotate(${cont}deg)`;
            const n = H24(cadran()), w = $('.mb-horloge', side);
            $('#mb-lu', side).textContent = n + NB + 'h'; w.setAttribute('aria-valuenow', n); w.setAttribute('aria-valuetext', MOTS[n]);
          };
          const glisser = () => {
            const s = $('.mb-horloge svg', side); if (!s) return null;
            const r = s.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, rr = r.width / 2 * 84 / 150;
            const sens = proche((RETOUR - 12) * 30) > cont ? -1 : 1;                       // jamais vers la bonne heure
            const pt = k => { const a = (cont + sens * 50 * k) * Math.PI / 180; return [cx + rr * Math.sin(a), cy - rr * Math.cos(a)]; };
            const fr = [at(pt(0)[0], pt(0)[1] + 40, 0), at(...pt(0), 1), at(...pt(0), 1, .82)];
            for (const k of [.25, .5, .75, 1]) fr.push(at(...pt(k), 1, .82));
            return [...fr, at(...pt(1), 1), at(...pt(1), 0)];
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 4500); };
          if (!await avant(f, {
            qui: 'technicien', seg: SEG, gel: 8.0, sideW: 440,
            consigne: "Elle revient à quelle heure" + NB + "? Fais tourner l'aiguille, puis clique sur Valider.",
            panneau: `<div class="panel glass mobile"><p class="ptitre">Fais tourner l'aiguille.</p>
              <div class="mb-pancarte"><span class="ficelle" aria-hidden="true"></span><p class="titre-p">Revenez à</p>
                <div class="mb-horloge" role="slider" tabindex="0" aria-label="Horloge : l'heure du retour" aria-valuemin="9" aria-valuemax="20" aria-valuenow="${AU_DEBUT}" aria-valuetext="${MOTS[AU_DEBUT]}">${HORLOGE}</div>
                <p class="mb-lu"><b id="mb-lu">${AU_DEBUT}${NB}h</b></p></div></div>`,
            monte: p => {
              const w = $('.mb-horloge', p), s = $('svg', w);
              const angle = e => { const r = s.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); return { a: mod(Math.atan2(x, -y) * 180 / Math.PI), d: Math.hypot(x, y) / (r.width / 2) }; };
              poser(cont, true);
              w.addEventListener('pointerdown', e => {
                if (!tour() || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault(); try { w.setPointerCapture(e.pointerId); } catch (err) {} tient = true;
                $('.mb-pancarte', p).classList.remove('faux');
                const { a, d } = angle(e); if (d > .12) poser(proche(a), false);
              });
              w.addEventListener('pointermove', e => {
                if (!tient) return;
                w.classList.add('tire'); const { a, d } = angle(e); if (d > .12) poser(proche(a), false);
              });
              const lacher = () => { if (!tient) return; tient = false; w.classList.remove('tire'); poser(cont, true); bouge = true; sfx.tick(); };
              w.addEventListener('pointerup', lacher); w.addEventListener('pointercancel', lacher); w.addEventListener('lostpointercapture', lacher);
              w.addEventListener('keydown', e => {
                const pas = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!pas || !tour()) return;
                e.preventDefault(); A.unlock(); idle.reset(); $('.mb-pancarte', p).classList.remove('faux');
                poser(Math.round(cont / 30) * 30 + pas * 30, true); bouge = true; sfx.tick();
              });
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            if (!bouge) { secouer($('.mb-horloge', side)); Q.show('you', "Fais tourner l'aiguille."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const n = H24(cadran()), pc = $('.mb-pancarte', side);
            if (n === RETOUR) {
              pc.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Elle revient à quinze heures.')) return;
              suite();
            } else {
              pc.classList.add('faux'); secouer(pc);
              const msg = n === 13 ? 'Non' + NB + ": une heure, c'est le temps de la réparation." : 'Pas ' + MOTS[n] + '.';
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              pc.classList.remove('faux');
              if (montrer) {                                    // deux essais : on met l'aiguille sur 3 (15 h)
                poser(proche((RETOUR - 12) * 30), true); pc.classList.add('juste');
                Q.show('ok', 'Quinze heures' + NB + ": l'aiguille sur le 3 (15" + NB + 'h).'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { cliente: "l'écran" },
      faits: {
        cliente: [{ text: "L'écran est cassé.", seg: A.phrase("l'écran est cassé") }, { text: 'Ça prend combien de temps' + A.NB + '?', seg: A.ligne(2) }],
        technicien: [{ text: 'Ça coûte quatre-vingts euros.', seg: [A.phrase('ça coûte')[0], A.ligne(1)[1]] }, { text: 'Une heure.', seg: A.phrase('une heure') },
          { text: 'Revenez à quinze heures.', seg: A.phrase('revenez à quinze heures') }],
      },
    }),
  };
})();
