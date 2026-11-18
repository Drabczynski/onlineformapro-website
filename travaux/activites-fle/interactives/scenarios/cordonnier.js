/* Chez le cordonnier : une cliente apporte sa botte ; le cordonnier peut réparer le talon, c'est quinze euros, c'est prêt
   jeudi, après dix heures. À la fin, il attache un ticket à la botte (coupes à 2,96, 4,96, 6,96 et 8,88 s : plan large,
   le cordonnier de près, la cliente de près, le cordonnier de près, plan large).
   1 · la cliente redit sa demande (la vidéo resserrée sur elle) : à côté, sa botte dessinée en grand ; on clique sur la
       partie à réparer, comme quand on la montre au cordonnier (le talon, parmi le bout, la semelle, la fermeture éclair,
       le haut) ;
   2 · le cordonnier redit le prix : on pose l'argent du porte-monnaie sur le comptoir (15 €), puis Payer ;
   3 · ils redisent « C'est prêt quand ? — Jeudi, après dix heures. » : sur le ticket du cordonnier (le vrai ticket qu'il
       attache à la botte à la fin), on clique sur le jour et sur l'heure, puis Valider.
   Pas de geste sur l'image : la botte n'y est jamais posée en grand (elle est dans les mains de la cliente, puis petite sur
   le comptoir, sous le ticket), aucun prix ni aucune date n'y est lisible, et rien ne montre un talon abîmé. Les images
   figées (2,0 s plan large ; 4,0 et 7,6 s : le cordonnier de près) ne donnent aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* la botte (viewBox 360 × 310) : la tige et le pied en cuir noir, la pointe à droite ; les cinq parties à toucher */
  const PARTIES = [
    { id: 'haut', nom: 'le haut de la botte', d: 'M92 26H198L197.4 68H90.9Z', lx: 145, ly: 13 },
    { id: 'fermeture', nom: 'la fermeture éclair', d: 'M138 72H174V214H138Z', lx: 214, ly: 120 },
    { id: 'bout', nom: 'le bout', d: 'M288 199C322 206 338 220 338 240V250H294C298 232 296 214 288 199Z', lx: 322, ly: 182 },
    { id: 'semelle', nom: 'la semelle', d: 'M146 246C170 248 190 250 210 250H338Q348 250 347 262Q345 276 330 276H214C194 274 170 266 146 262Z', lx: 262, ly: 296 },
    { id: 'talon', nom: 'le talon', d: 'M90 246H148L142 302H96Z', lx: 92, ly: 302 },
  ];
  const BOTTE = `<svg viewBox="0 0 360 310" aria-hidden="false" role="group" aria-label="Sa botte">
      <path class="cuir" d="M96 26H190Q198 26 198 36L196 148C202 176 238 190 284 198C320 205 338 220 338 240V250H210C190 250 168 248 146 246H100C92 236 88 220 88 196L92 34Q92 26 96 26Z"/>
      <path class="reflet" d="M112 44C108 100 108 160 118 222" />
      <path class="reflet" d="M232 196C262 200 292 204 312 214" />
      ${PARTIES.map(p => `<g class="partie" data-id="${p.id}" role="button" tabindex="0" aria-label="${p.nom}"><path class="hitp" d="${p.d}"/><path class="forme ${p.id}" d="${p.d}"/>${
        p.id === 'fermeture' ? '<rect class="zip" x="152" y="76" width="8" height="134" rx="2"/><path class="dents" d="M156 80V206"/><rect class="tirette" x="149" y="78" width="14" height="22" rx="4"/>'
        : p.id === 'haut' ? '<path class="couture" d="M93 62H196"/><path class="boucle" d="M94 28C80 28 78 52 92 54"/>'
        : p.id === 'bout' ? '<path class="couture" d="M290 202C298 216 300 232 296 248"/>'
        : p.id === 'talon' ? '<path class="fer" d="M96.8 294H142.6L142 302H96Z"/>' : ''}</g>`).join('')}
    </svg>`;
  /* le porte-monnaie de la cliente */
  const MONNAIE = [{ v: 20, c: 'billet vingt', t: '20' }, { v: 10, c: 'billet dix', t: '10' }, { v: 5, c: 'billet cinq', t: '5' }, { v: 2, c: 'piece deux', t: '2' }, { v: 1, c: 'piece blanche', t: '1' }];
  const BON_PRIX = 15;
  /* le ticket du cordonnier */
  const JOURS = [{ id: 'lun', t: 'lundi' }, { id: 'mar', t: 'mardi' }, { id: 'mer', t: 'mercredi' }, { id: 'jeu', t: 'jeudi' }, { id: 'ven', t: 'vendredi' }, { id: 'sam', t: 'samedi' }];
  const HEURES = [{ id: '9', t: 'neuf heures' }, { id: '10', t: 'dix heures' }, { id: '11', t: 'onze heures' }, { id: '12', t: 'midi' }];
  const BON_JOUR = 'jeu', BON_HEURE = '10';
  const cap = s => s[0].toUpperCase() + s.slice(1);

  return {
    plans: [{ de: 0, cx: { cordonnier: .27, cliente: .75 } }, { de: 2.958, cx: { cordonnier: .37, cliente: .98 } }, { de: 4.958, cx: { cordonnier: .04, cliente: .72 } },
      { de: 6.958, cx: { cordonnier: .4, cliente: .98 } }, { de: 8.875, cx: { cordonnier: .3, cliente: .76 } }],
    ordre: ['talon', 'prix', 'ticket'],
    bravo: 'Bravo' + NB + '! Elle revient jeudi, après dix heures.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, ligne, side, idle, tapHere, sfx, faux, juste, suite, goBtn, avant, gel } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      return {
        /* 1 · la cliente redit sa demande : sur sa botte dessinée, on clique sur la partie à réparer */
        async talon(f) {
          const SEG = ligne(0);
          let fini = false;
          const nom = (p, cls) => {                          // le nom de la partie, écrit à côté d'elle
            const b = $('.botte', side); if (!b) return;
            $$(`.nompart[data-id="${p.id}"]`, b).forEach(x => x.remove());
            b.insertAdjacentHTML('beforeend', `<span class="nompart ${cls}" data-id="${p.id}" style="left:${(4 + p.lx / 360 * 92).toFixed(1)}%;top:${(4 + p.ly / 310 * 88).toFixed(1)}%">${cap(p.nom)}</span>`);
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.partie[data-id="bout"]', side)), 5000); };
          async function choisir(g) {
            if (!tour() || fini) return;
            A.unlock(); idle.clear(); setTurn('wait'); sfx.tick();
            const p = PARTIES.find(x => x.id === g.dataset.id);
            if (p.id === 'talon') {
              fini = true; $$('.partie', side).forEach(x => x.classList.remove('indice', 'faux')); g.classList.add('juste'); nom(p, 'juste');
              if (!await juste(f, 'Oui' + NB + '! Elle veut faire réparer le talon.')) return;
              suite();
            } else {
              g.classList.add('faux'); nom(p, 'faux'); secouer($('.botte', side));
              const montrer = await faux(f, SEG, 'Non, ça, c\'est ' + p.nom + '.'); if (montrer === null) return;
              g.classList.remove('faux'); $$(`.nompart[data-id="${p.id}"]`, side).forEach(x => x.remove());
              if (montrer) $('.partie[data-id="talon"]', side).classList.add('indice');
              ask();
            }
          }
          if (!await avant(f, {
            qui: 'cliente', seg: SEG, gel: 2.0, sideW: 480,
            consigne: "Qu'est-ce qu'elle veut faire réparer" + NB + '? Clique sur la bonne partie de la botte.',
            panneau: `<div class="panel glass cordo"><p class="ptitre">Sa botte${NB}: clique sur la partie à réparer.</p><div class="botte">${BOTTE}</div></div>`,
            monte: p => $$('.partie', p).forEach(g => {
              g.addEventListener('click', () => choisir(g));
              g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(g); } });
            }),
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · le cordonnier redit le prix : on pose l'argent sur le comptoir, puis Payer */
        async prix(f) {
          const SEG = ligne(1);
          let total = 0;
          const argent = (m, k) => `<button class="argent ${m.c}" data-v="${m.v}" data-k="${k}" aria-label="${m.v} euros">${m.t}${NB}€</button>`;
          const maj = () => { total = [...$$('#posees .argent', side)].reduce((s, b) => s + +b.dataset.v, 0); $('#somme', side).textContent = total; };
          const poser = k => {
            const box = document.createElement('div'); box.innerHTML = argent(MONNAIE[k], k); const b = box.firstChild;
            b.setAttribute('aria-label', 'Reprendre ' + MONNAIE[k].v + ' euros');
            $('#posees', side).append(b); maj();
            b.addEventListener('click', () => { if (!tour()) return; sfx.tick(); b.remove(); maj(); });
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Payer', valider); yourTurn(); idle.set(tapHere($('.bourse .argent[data-v="20"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'cordonnier', seg: SEG, gel: 4.0, sideW: 460,
            consigne: "La réparation coûte combien" + NB + "? Pose l'argent sur le comptoir, puis clique sur Payer.",
            panneau: `<div class="panel glass cordo"><p class="ptitre">Clique sur l'argent pour le poser sur le comptoir.</p>
              <div class="plateau comptoir" id="plateau"><span class="etiq">le comptoir</span><div class="somme"><span id="somme">0</span><small>€</small></div><div class="posees" id="posees"></div></div>
              <div class="portemonnaie"><span class="etiq">son porte-monnaie</span><div class="bourse">${MONNAIE.map(argent).join('')}</div></div></div>`,
            monte: p => $$('.bourse .argent', p).forEach(b => b.addEventListener('click', () => {
              if (!tour()) return;
              A.unlock(); idle.reset(); sfx.coin(); poser(+b.dataset.k);
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            if (!total) { secouer($('#plateau', side)); Q.show('you', "Pose l'argent sur le comptoir."); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const pl = $('#plateau', side);
            if (total === BON_PRIX) {
              pl.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Quinze euros.')) return;
              suite();
            } else {
              pl.classList.add('faux'); secouer(pl);
              const montrer = await faux(f, SEG, 'Non' + NB + ': là, tu donnes ' + total + NB + '€.'); if (montrer === null) return;
              pl.classList.remove('faux');
              $('#posees', side).innerHTML = ''; maj();
              if (montrer) {                                    // deux essais : on pose la réponse
                poser(1); poser(2); pl.classList.add('juste');
                Q.show('ok', 'Quinze euros' + NB + ': un billet de dix et un billet de cinq.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · « C'est prêt quand ? — Jeudi, après dix heures. » : sur le ticket, on clique sur le jour et sur l'heure, puis Valider */
        async ticket(f) {
          const SEG = [ligne(2)[0], ligne(3)[1]];
          let jour = null, heure = null, fini = false;
          const peindre = () => {
            $$('.case[data-j]', side).forEach(b => b.setAttribute('aria-pressed', b.dataset.j === jour));
            $$('.case[data-h]', side).forEach(b => b.setAttribute('aria-pressed', b.dataset.h === heure));
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.case[data-j="mar"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'cordonnier', seg: SEG, gel: 7.6, sideW: 500,
            consigne: "Sa botte est prête quand" + NB + "? Sur le ticket, clique sur le jour et sur l'heure, puis sur Valider.",
            panneau: `<div class="panel glass cordo"><p class="ptitre">Clique sur le jour et sur l'heure, puis sur Valider.</p>
              <div class="ticket" id="ticket"><span class="trou" aria-hidden="true"></span>
                <div class="tete"><b>Cordonnerie</b><span>N° 047</span></div>
                <div class="infos"><span>Réparation${NB}: <b>talon</b></span><span>Prix${NB}: <b>15${NB}€</b></span></div>
                <p class="ligne-t">Prête le</p>
                <div class="cases jours" id="jours" role="group" aria-label="Le jour">${JOURS.map(j => `<button class="case" data-j="${j.id}" aria-pressed="false" aria-label="${j.t}">${j.t}</button>`).join('')}</div>
                <p class="ligne-t">Après</p>
                <div class="cases heures" id="heures" role="group" aria-label="L'heure">${HEURES.map(h => `<button class="case" data-h="${h.id}" aria-pressed="false" aria-label="${h.t}">${h.id}${NB}h</button>`).join('')}</div>
              </div></div>`,
            monte: p => {
              $$('.case[data-j]', p).forEach(b => b.addEventListener('click', () => { if (!tour() || fini) return; A.unlock(); idle.reset(); sfx.tick(); jour = b.dataset.j; b.classList.remove('faux'); peindre(); }));
              $$('.case[data-h]', p).forEach(b => b.addEventListener('click', () => { if (!tour() || fini) return; A.unlock(); idle.reset(); sfx.tick(); heure = b.dataset.h; b.classList.remove('faux'); peindre(); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            if (!jour || !heure) {
              secouer($(jour ? '#heures' : '#jours', side));
              Q.show('you', jour ? "Clique aussi sur l'heure." : heure ? 'Clique aussi sur le jour.' : "Clique sur le jour et sur l'heure.");
              return;
            }
            setTurn('wait'); goBtn(null); idle.clear();
            const bj = $(`.case[data-j="${jour}"]`, side), bh = $(`.case[data-h="${heure}"]`, side);
            const jOk = jour === BON_JOUR, hOk = heure === BON_HEURE;
            if (jOk) bj.classList.add('juste'); else bj.classList.add('faux');
            if (hOk) bh.classList.add('juste'); else bh.classList.add('faux');
            if (jOk && hOk) {
              fini = true; $$('.case', side).forEach(x => x.classList.remove('indice')); $('#ticket', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Jeudi, après dix heures.')) return;
              suite();
            } else {
              secouer($('#ticket', side));
              const msg = [jOk ? '' : 'Pas ' + JOURS.find(j => j.id === jour).t + '.', hOk ? '' : 'Pas ' + HEURES.find(h => h.id === heure).t + '.'].filter(Boolean).join(' ');
              const montrer = await faux(f, SEG, msg); if (montrer === null) return;
              if (!jOk) { bj.classList.remove('faux'); jour = null; }
              if (!hOk) { bh.classList.remove('faux'); heure = null; }
              peindre();
              if (montrer) {                                    // deux essais : on montre la réponse sur le ticket
                fini = true; jour = BON_JOUR; heure = BON_HEURE; peindre();
                $(`.case[data-j="${BON_JOUR}"]`, side).classList.add('juste'); $(`.case[data-h="${BON_HEURE}"]`, side).classList.add('juste'); $('#ticket', side).classList.add('juste');
                Q.show('ok', 'Jeudi, après dix heures.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      tags: { cliente: 'le talon' },
      faits: {
        cliente: [{ text: 'Vous pouvez réparer le talon' + A.NB + '?', seg: A.ligne(0) }, { text: "C'est prêt quand" + A.NB + '?', seg: A.ligne(2) }],
        cordonnier: [{ text: "C'est quinze euros.", seg: A.phrase("c'est quinze euros") }, { text: 'Jeudi, après dix heures.', seg: A.ligne(3) }],
      },
    }),
  };
})();
