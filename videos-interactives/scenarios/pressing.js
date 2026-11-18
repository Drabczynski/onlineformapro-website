/* Au pressing : une cliente apporte sa chemise (une tache de café) ; l'employé dit qu'il va l'enlever, qu'elle peut la
   récupérer jeudi, et que ça fait huit euros (coupes à 2,92, 4,96, 6,96 et 8,92 s : plan large, l'employé de près, la
   cliente de près, l'employé de près, plan large).
   1 · la cliente redit sa phrase (la vidéo resserrée sur elle) : à côté, quatre vêtements sur la tringle (une chemise avec
       une tache de vin, une robe et un pantalon avec une tache de café, sa chemise avec une tache de café) ; on fait
       glisser le ticket du pressing sur le bon vêtement (ou on clique sur le vêtement) ;
   2 · « Je peux la récupérer quand ? — Jeudi. » : on choisit le jour sur un tampon dateur (flèches, ou glisser la bande
       des jours), puis on tamponne le ticket de retrait ;
   3 · « Ça fait huit euros » : on tape le prix sur la caisse du pressing, puis OK (le tiroir s'ouvre).
   Pas de geste sur l'image : la vidéo ne montre ni la chemise, ni la tache, ni un calendrier, ni un prix (rien à
   chercher dans l'image qui vérifie une information du dialogue). L'image figée (9,5 s, plan large : ils se sourient au
   comptoir) ne donne aucune réponse. */
window.SCENARIO = (() => {
  const NB = ' ';
  /* ---------- 1 · les vêtements ---------- */
  const CINTRE = '<path d="M50 15V11a5 5 0 1 0-5-5" fill="none" stroke="#9AA3B2" stroke-width="2.6" stroke-linecap="round"/><path d="M50 15 12 31h76z" fill="none" stroke="#9AA3B2" stroke-width="2.6" stroke-linejoin="round"/>';
  const FORMES = {
    chemise: '<path d="M33 27 14 35 7 68l13 3 5-19v74h50V52l5 19 13-3-7-33-19-8-17 9z" fill="#CFE0F0" stroke="#8EA7BF" stroke-width="2" stroke-linejoin="round"/>'
      + '<path d="M38 26 50 41 62 26" fill="#E6EFF8" stroke="#8EA7BF" stroke-width="2" stroke-linejoin="round"/><path d="M50 41v84" stroke="#8EA7BF" stroke-width="1.6"/>'
      + '<circle cx="54" cy="55" r="1.8" fill="#8EA7BF"/><circle cx="54" cy="75" r="1.8" fill="#8EA7BF"/><circle cx="54" cy="95" r="1.8" fill="#8EA7BF"/><circle cx="54" cy="115" r="1.8" fill="#8EA7BF"/>',
    robe: '<path d="M38 27h24l3 30 23 69H12l23-69z" fill="#EBC3CF" stroke="#C48C9C" stroke-width="2" stroke-linejoin="round"/><path d="M38 27q12 12 24 0" fill="none" stroke="#C48C9C" stroke-width="2"/>'
      + '<path d="M35 57h30" stroke="#C48C9C" stroke-width="2.4"/>',
    pantalon: '<path d="M22 29h56l4 97H57L50 62l-7 64H18z" fill="#56647F" stroke="#3B4660" stroke-width="2" stroke-linejoin="round"/><path d="M22 37h56" stroke="#3B4660" stroke-width="2"/>'
      + '<path d="M50 37v24" stroke="#3B4660" stroke-width="1.6"/>',
  };
  const COULEUR = { café: '#7A4A26', vin: '#8B1E5C' };
  const TACHE = (c, x, y) => `<g transform="translate(${x} ${y})"><path d="M-1-10c6 0 11 4 10 9 0 5-4 9-9 8-3 0-4-2-8-2s-7-2-7-6c0-6 7-9 14-9z" fill="${c}" opacity=".88"/><circle cx="12" cy="9" r="2.4" fill="${c}" opacity=".88"/><circle cx="-11" cy="7" r="1.6" fill="${c}" opacity=".88"/></g>`;
  const ICONE = {
    café: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="currentColor"/><path d="M16 11.5h1.5a2.5 2.5 0 0 1 0 5H15" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3.5c-1 1.4 1 2.4 0 4M12 3.5c-1 1.4 1 2.4 0 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    vin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10c0 5.5-2 8.5-5 8.5S7 8.5 7 3z" fill="currentColor"/><path d="M12 11.5V20M8.5 20.5h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };
  const VETEMENTS = [
    { id: 'chemise-vin', forme: 'chemise', nom: 'une chemise', tache: 'vin', tx: 63, ty: 82, msg: "Une chemise, oui, mais là, c'est une tache de vin." },
    { id: 'robe', forme: 'robe', nom: 'une robe', tache: 'café', tx: 46, ty: 88, msg: "Non, là, c'est une robe." },
    { id: 'chemise', forme: 'chemise', nom: 'une chemise', tache: 'café', tx: 36, ty: 70, bon: true },
    { id: 'pantalon', forme: 'pantalon', nom: 'un pantalon', tache: 'café', tx: 66, ty: 98, msg: "Non, là, c'est un pantalon." },
  ];
  const habit = v => `<svg viewBox="0 0 100 130" aria-hidden="true">${CINTRE}${FORMES[v.forme]}${TACHE(COULEUR[v.tache], v.tx, v.ty)}</svg>`;
  /* le ticket du pressing : un petit carton numéroté, avec son trou pour l'épingle */
  const TICKET = '<span class="pr-trou" aria-hidden="true"></span><small>Ticket</small><b>N° 47</b>';

  /* ---------- 2 · le tampon dateur ---------- */
  const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const BON_JOUR = 3;
  const FLECHE = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d < 0 ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}"/></svg>`;

  /* ---------- 3 · la caisse ---------- */
  const PRIX = 8;
  const MOTS = { 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix', 11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze', 16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt', 80: 'quatre-vingts' };
  const enLettres = n => MOTS[n] || String(n);

  return {
    plans: [{ de: 0, cx: { cliente: .27, employe: .69 } }, { de: 2.917, cx: { cliente: .58, employe: .58 } }, { de: 4.958, cx: { cliente: .62, employe: .62 } },
      { de: 6.958, cx: { cliente: .58, employe: .58 } }, { de: 8.917, cx: { cliente: .27, employe: .69 } }],
    ordre: ['vetement', 'jour', 'prix'],
    bravo: 'Bravo' + NB + '! Jeudi, sa chemise sera propre.',
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, avant, gel, reduced } = A;
      const tour = () => document.body.dataset.turn === 'you';
      const secouer = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
      const dedans = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
      return {
        /* 1 · la cliente redit sa phrase : on fait glisser le ticket sur son vêtement (une chemise, une tache de café) */
        async vetement(f) {
          const SEG = ligne(0);
          const ticket = () => $('.pr-ticket', side), habitEl = id => $(`.pr-habit[data-id="${id}"]`, side);
          let fini = false;
          /* le ticket va s'accrocher au cintre d'un vêtement (ou revient à sa place) */
          function poser(h, anime = true) {
            const el = ticket(); if (!el) return;
            const tr = anime ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none';
            if (!h) { el.style.transition = tr; el.style.transform = ''; return; }
            const ici = el.style.transform; el.style.transition = 'none'; el.style.transform = '';
            const a = el.getBoundingClientRect(), b = $('.pr-accroche', h).getBoundingClientRect();
            el.style.transform = ici; void el.offsetWidth; el.style.transition = tr;
            el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) rotate(-8deg) scale(.72)`;
          }
          const ask = () => {
            Q.show('you', state.ask); yourTurn();
            idle.set(() => {                                  // le doigt fantôme : il glisse le ticket vers le pantalon (jamais vers la bonne réponse)
              const de = ticket(), vers = habitEl('pantalon'); if (!de || !vers) return null;
              const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height * .45;
              return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)];
            }, 5000);
          };
          async function choisir(id) {
            if (!tour() || fini) return;
            setTurn('wait'); idle.clear(); sfx.tick();
            const h = habitEl(id), v = VETEMENTS.find(x => x.id === id);
            poser(h); $$('.pr-habit', side).forEach(x => x.classList.remove('chaud'));
            await wait(480); if (!alive(f)) return;
            if (v.bon) {
              fini = true; $$('.pr-habit', side).forEach(x => x.classList.remove('indice')); h.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Sa chemise, avec une tache de café.')) return;
              suite();
            } else {
              h.classList.add('faux'); secouer(h);
              const montrer = await faux(f, SEG, v.msg); if (montrer === null) return;
              h.classList.remove('faux'); poser(null);
              if (montrer) habitEl('chemise').classList.add('indice');
              ask();
            }
          }
          const panneau = `<div class="panel glass pr"><p class="ptitre">Fais glisser le ticket sur le vêtement de la cliente.</p>
            <div class="pr-tringle" role="group" aria-label="Les vêtements du pressing">
              ${VETEMENTS.map(v => `<button class="pr-habit" data-id="${v.id}" aria-label="${v.nom}, tache de ${v.tache}"><span class="pr-accroche" aria-hidden="true"></span>${habit(v)}
                <span class="pr-nom">${v.nom}</span><span class="pr-tache"><i style="color:${COULEUR[v.tache]}">${ICONE[v.tache]}</i>${v.tache}</span></button>`).join('')}
            </div>
            <div class="pr-depart"><div class="pr-ticket" aria-hidden="true">${TICKET}</div><span class="legende">le ticket</span></div></div>`;
          if (!await avant(f, {
            qui: 'cliente', seg: SEG, sideW: 540, panneau,
            consigne: 'Quel vêtement apporte la cliente' + NB + '? Fais glisser le ticket sur le bon vêtement.',
            monte: p => {
              const el = $('.pr-ticket', p); let st = null;
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
                el.style.transform = `translate(${dx}px, ${dy}px) rotate(-6deg) scale(1.06)`;
                $$('.pr-habit', p).forEach(h => h.classList.toggle('chaud', dedans(h, e.clientX, e.clientY)));
              });
              const lacher = e => {
                if (!st || e.pointerId !== st.id) return;
                st = null; el.classList.remove('tenu');
                const h = e.type === 'pointerup' && tour() ? $$('.pr-habit', p).find(x => dedans(x, e.clientX, e.clientY)) : null;
                $$('.pr-habit', p).forEach(x => x.classList.remove('chaud'));
                if (h) choisir(h.dataset.id); else poser(null);
              };
              el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
              $$('.pr-habit', p).forEach(h => h.addEventListener('click', () => { if (!tour()) return; A.unlock(); choisir(h.dataset.id); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          ask();
        },

        /* 2 · « Je peux la récupérer quand ? — Jeudi. » : on règle le tampon dateur sur le bon jour, puis on tamponne le ticket */
        async jour(f) {
          const SEG = [ligne(2)[0], phrase('Jeudi')[1]];
          let k = 0, glisse = null;
          const tampon = () => $('.pr-tampon', side), caseEl = () => $('#pr-case', side);
          const peindre = (anime = true) => {
            const t = tampon(); if (!t) return;
            const b = $('.pr-bande', t);
            b.style.transition = anime && !reduced ? 'transform .3s cubic-bezier(.34,1.3,.64,1)' : 'none';
            b.style.transform = `translateY(${-k * 44}px)`;
            $$('.pr-bande span', t).forEach((s, i) => s.classList.toggle('vu', i === k));
            t.setAttribute('aria-valuenow', k); t.setAttribute('aria-valuetext', JOURS[k]);
            $$('.pr-fl', side).forEach(x => { x.disabled = (+x.dataset.d < 0 && k === 0) || (+x.dataset.d > 0 && k === JOURS.length - 1); });
          };
          const regler = n => { const v = Math.max(0, Math.min(JOURS.length - 1, n)); if (v !== k) { k = v; sfx.tick(); } peindre(); };
          /* le coup de tampon : le tampon descend sur la case du ticket, le jour s'y imprime */
          async function tamponner() {
            const t = tampon(), c = caseEl(); if (!t || !c) return;
            const a = t.getBoundingClientRect(), b = c.getBoundingClientRect();
            const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.bottom - 14);
            const an = t.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(.9)`, offset: .55 }, { transform: `translate(${dx}px, ${dy}px) scale(.86)`, offset: .7 }, { transform: 'none' }],
              { duration: reduced ? 1 : 900, easing: 'cubic-bezier(.5,0,.3,1)' });
            await wait(reduced ? 0 : 560);
            c.innerHTML = `<span class="pr-encre">${JOURS[k]}</span>`; sfx.tick();
            await an.finished.catch(() => {});
          }
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Tamponner', valider); yourTurn(); idle.set(tapHere($('.pr-fl[data-d="1"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'employe', seg: SEG, sideW: 480,
            consigne: 'Elle peut récupérer sa chemise quel jour' + NB + '? Choisis le jour sur le tampon, puis clique sur tamponner.',
            panneau: `<div class="panel glass pr"><p class="ptitre">Choisis le jour sur le tampon, puis clique sur Tamponner.</p>
              <div class="pr-poste">
                <div class="pr-tampon" role="spinbutton" tabindex="0" aria-label="Le jour sur le tampon" aria-valuemin="0" aria-valuemax="${JOURS.length - 1}" aria-valuenow="0" aria-valuetext="lundi">
                  <span class="pr-manche" aria-hidden="true"></span>
                  <span class="pr-socle"><span class="pr-fenetre"><span class="pr-bande">${JOURS.map(j => `<span>${j}</span>`).join('')}</span></span></span>
                </div>
                <div class="pr-fls"><button class="pr-fl" data-d="-1" aria-label="Le jour d'avant">${FLECHE(-1)}</button><button class="pr-fl" data-d="1" aria-label="Le jour d'après">${FLECHE(1)}</button></div>
              </div>
              <div class="pr-recu" id="pr-recu">
                <div class="pr-recu-tete"><b>Pressing</b><span>Ticket N° 47</span></div>
                <div class="pr-recu-l"><span>Vêtement</span><b>1 chemise</b></div>
                <div class="pr-recu-l"><span>À récupérer le</span><span class="pr-case" id="pr-case" aria-live="polite"></span></div>
              </div></div>`,
            monte: p => {
              const t = $('.pr-tampon', p), fen = $('.pr-fenetre', p);
              $$('.pr-fl', p).forEach(b => b.addEventListener('click', () => { if (!tour()) return; A.unlock(); idle.reset(); regler(k + +b.dataset.d); }));
              t.addEventListener('keydown', e => {
                if (!tour()) return;
                const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
                e.preventDefault(); A.unlock(); idle.reset(); regler(k + d);
              });
              /* on peut aussi faire glisser la bande des jours (vers le haut : le jour d'après) */
              fen.addEventListener('pointerdown', e => {
                if (!tour() || e.button > 0) return;
                A.unlock(); idle.reset(); e.preventDefault(); glisse = { y: e.clientY, k0: k, id: e.pointerId };
                try { fen.setPointerCapture(e.pointerId); } catch (err) {}
              });
              fen.addEventListener('pointermove', e => {
                if (!glisse || e.pointerId !== glisse.id) return;
                const n = Math.max(0, Math.min(JOURS.length - 1, glisse.k0 - Math.round((e.clientY - glisse.y) / 34)));
                if (n !== k) { k = n; sfx.tick(); peindre(); }
              });
              const fin = e => { if (glisse && e.pointerId === glisse.id) glisse = null; };
              fen.addEventListener('pointerup', fin); fen.addEventListener('pointercancel', fin);
              peindre(false);
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            setTurn('wait'); goBtn(null); idle.clear();
            await tamponner(); if (!alive(f)) return;
            const c = caseEl();
            if (k === BON_JOUR) {
              c.classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Jeudi.')) return;
              suite();
            } else {
              c.classList.add('faux'); secouer($('#pr-recu', side));
              const montrer = await faux(f, SEG, 'Non, pas ' + JOURS[k] + '.'); if (montrer === null) return;
              c.classList.remove('faux'); c.innerHTML = '';
              if (montrer) {                                    // deux essais : on règle le tampon sur jeudi et on tamponne
                k = BON_JOUR; peindre(); await wait(400); if (!alive(f)) return;
                await tamponner(); if (!alive(f)) return;
                c.classList.add('juste'); Q.show('ok', 'Jeudi' + NB + ': elle peut récupérer sa chemise jeudi.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },

        /* 3 · « Ça fait huit euros » : on tape le prix sur la caisse, puis OK */
        async prix(f) {
          const SEG = [phrase('Ça fait huit euros')[0], ligne(3)[1]];
          let val = '', fini = false;
          const ecran = () => $('#pr-ecran', side);
          const maj = () => { const b = $('#pr-prix', side); if (b) b.textContent = val || '0'; };
          const taper = c => {
            if (!tour() || fini) return;
            A.unlock(); idle.reset(); sfx.tick();
            if (c === 'C') val = '';
            else if (c === 'OK') { valider(); return; }
            else if (val.length < 3 && !(val === '' && c === '0')) val += c;
            maj(); Q.show('you', state.ask);
          };
          const ask = () => { Q.show('you', state.ask); yourTurn(); idle.set(tapHere($('.pr-touche[data-c="3"]', side)), 5000); };
          if (!await avant(f, {
            qui: 'employe', seg: SEG, sideW: 420,
            consigne: 'Ça fait combien' + NB + '? Tape le prix sur la caisse, puis clique sur OK.',
            panneau: `<div class="panel glass pr"><p class="ptitre">Tape le prix sur la caisse, puis clique sur OK.</p>
              <div class="pr-caisse" id="pr-caisse">
                <div class="pr-ecran" id="pr-ecran" role="status"><small>Prix</small><b id="pr-prix">0</b><span>€</span></div>
                <div class="pr-touches" role="group" aria-label="Les touches de la caisse">
                  ${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(c => `<button class="pr-touche${c === 'C' ? ' efface' : c === 'OK' ? ' ok' : ''}" data-c="${c}"${c === 'C' ? ' aria-label="Effacer"' : ''}>${c}</button>`).join('')}
                </div>
                <div class="pr-tiroir" aria-hidden="true"><span></span></div>
              </div></div>`,
            monte: p => {
              $$('.pr-touche', p).forEach(b => b.addEventListener('click', () => taper(b.dataset.c)));
              const clavier = e => {
                if (!alive(f)) { document.removeEventListener('keydown', clavier); return; }
                if (/^[0-9]$/.test(e.key)) taper(e.key); else if (e.key === 'Backspace' || e.key === 'Escape') taper('C'); else if (e.key === 'Enter' && !e.target.closest('button')) taper('OK');
              };
              document.addEventListener('keydown', clavier);
            },
          })) return;
          state.replay = async () => { setTurn('listen'); idle.clear(); await playSegment(SEG[0], SEG[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour() || fini) return;
            if (!val) { secouer(ecran()); Q.show('you', 'Tape le prix, puis clique sur OK.'); return; }
            setTurn('wait'); idle.clear();
            const n = +val, e = ecran();
            if (n === PRIX) {
              fini = true; e.classList.add('juste'); $('#pr-caisse', side).classList.add('ouverte');
              if (!await juste(f, 'Oui' + NB + '! Huit euros.')) return;
              suite();
            } else {
              e.classList.add('faux'); secouer($('#pr-caisse', side));
              const montrer = await faux(f, SEG, 'Non, pas ' + enLettres(n) + ' euros.'); if (montrer === null) return;
              e.classList.remove('faux'); val = ''; maj();
              if (montrer) {                                    // deux essais : la caisse affiche le bon prix
                val = String(PRIX); maj(); fini = true; e.classList.add('juste'); $('#pr-caisse', side).classList.add('ouverte');
                $('.pr-touche[data-c="8"]', side).classList.add('indice');
                Q.show('ok', 'Ça fait huit euros' + NB + ': 8' + NB + '€.'); state.essais = 0; suite();
              } else ask();
            }
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        cliente: [{ text: 'une tache de café sur sa chemise', seg: A.ligne(0) }, { text: 'Je peux la récupérer quand' + A.NB + '?', seg: A.ligne(2) }],
        employe: [{ text: 'Pas de problème, on va l\'enlever.', seg: A.ligne(1) }, { text: 'Jeudi.', seg: A.phrase('Jeudi') }, { text: 'Ça fait huit euros.', seg: A.phrase('Ça fait huit euros') }],
      },
    }),
  };
})();
