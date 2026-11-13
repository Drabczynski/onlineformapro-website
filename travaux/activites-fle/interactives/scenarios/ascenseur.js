/* L'ascenseur ne marche pas : un appel entre deux lieux, la loge du gardien et le hall de l'immeuble (coupes à 0,92, 3,96
   et 6,88 s). Madame Diallo redit la panne (la vidéo resserrée sur elle) : dans le hall, on clique sur ce qui ne marche
   pas ; le gardien redit quand le technicien arrive : on fait glisser le soleil dans le ciel de la journée, et l'affichette
   de la panne se complète ; elle redit « je prends l'escalier » : dans le hall, on trace son chemin du doigt, puis la fin
   de la vidéo le montre (elle range son téléphone, reprend ses sacs et part vers l'escalier). Les images figées du hall
   sont prises avant qu'elle bouge ; rien n'y montre la panne. */
window.SCENARIO = (() => {
  const NB = ' ';
  const GEL_HALL = 7.0, GEL_LOGE = 4.05, FIN = 10.0;
  /* les vrais éléments du hall (image à 7 s, en %) ; l'ascenseur est derrière elle : quatre morceaux autour d'elle.
     « ou » : le coin haut-gauche de l'étiquette (marque), pour qu'elle ne cache pas un visage et ne sorte pas de l'image */
  const LIEUX = {
    ascenseur: { label: "L'ascenseur", cadre: { x: 32, y: 1, w: 31, h: 86 }, ou: { x: 43.8, y: 4.6, w: 0, h: 0 } },
    escalier: { label: "L'escalier", cadre: { x: 71, y: 25, w: 16.5, h: 75 }, ou: { x: 70.5, y: 20, w: 0, h: 0 } },
    boites: { label: 'Les boîtes aux lettres', cadre: { x: 91.5, y: 17, w: 8.5, h: 46 }, ou: { x: 85, y: 12.2, w: 0, h: 0 } },
    porte: { label: 'La porte', cadre: { x: 8, y: 2, w: 8, h: 96 }, ou: { x: 9, y: 8, w: 0, h: 0 } },
    telephone: { label: 'Le téléphone', cadre: { x: 42, y: 18, w: 7, h: 16 }, ou: { x: 32.6, y: 22, w: 0, h: 0 } },
  };
  const ZONES = [
    { id: 'asc-0', lieu: 'ascenseur', x: 32, y: 0, w: 31, h: 10 }, { id: 'asc-1', lieu: 'ascenseur', x: 31, y: 10, w: 6.5, h: 78 },
    { id: 'asc-2', lieu: 'ascenseur', x: 55.5, y: 10, w: 8.5, h: 19 }, { id: 'asc-3', lieu: 'ascenseur', x: 60, y: 29, w: 4, h: 59 },
    { id: 'escalier', lieu: 'escalier', ...LIEUX.escalier.cadre }, { id: 'boites', lieu: 'boites', ...LIEUX.boites.cadre },
    { id: 'porte', lieu: 'porte', ...LIEUX.porte.cadre }, { id: 'telephone', lieu: 'telephone', ...LIEUX.telephone.cadre },
  ].map(z => ({ ...z, label: LIEUX[z.lieu].label }));
  const PAS_CA = {
    escalier: "Ça, c'est l'escalier. Écoute encore.", boites: 'Ça, ce sont les boîtes aux lettres. Écoute encore.',
    porte: "Ça, c'est la porte. Écoute encore.", telephone: 'Le téléphone marche' + NB + ': elle appelle le gardien. Écoute encore.',
  };
  const PAS_LA = { ascenseur: "Non, l'ascenseur ne marche pas. Écoute encore.", porte: 'Pas la porte. Écoute encore.', boites: 'Pas les boîtes aux lettres. Écoute encore.' };

  /* le ciel de la journée : le soleil suit un arc ; quatre moments */
  const MOMENTS = [
    { id: 'matin', t: 'le matin', h: '8 h', note: 'ce matin', a: 148 },
    { id: 'midi', t: 'à midi', h: '12 h', note: 'à midi', a: 90 },
    { id: 'aprem', t: "l'après-midi", h: '16 h', note: 'cet après-midi', a: 40 },
    { id: 'soir', t: 'le soir', h: '20 h', note: 'ce soir', a: 9 },
  ];
  const CX = 230, CY = 162, RX = 188, RY = 128, DEPART = 180;
  const pos = a => [CX + RX * Math.cos(a * Math.PI / 180), CY - RY * Math.sin(a * Math.PI / 180)];
  const CIELS = { aube: ['#53618F', '#C9A7A0'], matin: ['#8EC3F0', '#FFD8AE'], midi: ['#2E97E6', '#A6DAFF'], aprem: ['#4C9DD6', '#FFDE9C'], soir: ['#1D2756', '#E9825A'] };
  const CIEL = () => `<svg class="ciel" viewBox="0 0 460 200" role="img" aria-label="Le ciel de la journée, avec le soleil à faire glisser">
      <defs>${Object.entries(CIELS).map(([k, [h, b]]) => `<linearGradient id="ciel-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')}
        <clipPath id="ciel-bord"><rect width="460" height="200" rx="22"/></clipPath></defs>
      <g clip-path="url(#ciel-bord)">
        ${Object.keys(CIELS).map(k => `<rect class="fond${k === 'aube' ? ' on' : ''}" data-id="${k}" width="460" height="200" fill="url(#ciel-${k})"/>`).join('')}
        <path d="M${CX - RX} ${CY} A${RX} ${RY} 0 0 1 ${CX + RX} ${CY}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
        ${MOMENTS.map(m => { const [x, y] = pos(m.a); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#fff" opacity=".85"/>`; }).join('')}
        <g id="soleil" transform="translate(${pos(DEPART).map(v => v.toFixed(1)).join(' ')})"><circle r="27" fill="rgba(255,214,90,.32)"/><circle r="17" fill="#FFC93C" stroke="#fff" stroke-width="3"/></g>
        <path d="M0 ${CY} H460 V200 H0Z" fill="#232B44"/>
        <path d="M150 ${CY}v-26h38v26zM194 ${CY}v-44h36v44zM236 ${CY}v-20h48v20z" fill="#323C5C"/>
        <path d="M201 124h8v7h-8zM215 124h8v7h-8zM201 138h8v7h-8zM215 138h8v7h-8z" fill="#FFE7A3" opacity=".85"/>
      </g></svg>`;

  return {
    plans: [{ de: 0, cx: { gardien: .62, diallo: .5 } }, { de: .917, cx: { diallo: .47, gardien: .5 } }, { de: 3.958, cx: { gardien: .66, diallo: .5 } }, { de: 6.875, cx: { diallo: .47, gardien: .5 } }],
    ordre: ['panne', 'quand', 'chemin'],
    bravo: 'Bravo' + NB + "! Madame Diallo prend l'escalier en attendant le technicien.",
    etapes: A => {
      const { $, $$, state, alive, Q, yourTurn, setTurn, playSegment, phrase, ligne, side, idle, tapHere, at, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, cadreZone, marque, gel } = A;
      const PANNE = phrase("L'ascenseur ne marche pas"), TECH = [phrase('le technicien')[0], ligne(2)[1]], ESC = ligne(3);
      const tour = () => document.body.dataset.turn === 'you';
      return {
        /* 1 · dans la vidéo : elle redit la panne ; on clique, dans le hall, sur ce qui ne marche pas */
        async panne(f) {
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking'); idle.set(tapHere($('.hit[data-id="porte"]', cam)), 5000); };
          if (!await avant(f, { question: 'Écoute madame Diallo.', qui: 'diallo', seg: ligne(1), gel: GEL_HALL, consigne: "Qu'est-ce qui ne marche pas" + NB + "? Clique dessus dans l'image." })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); await playSegment(ligne(1)[0], ligne(1)[1], gel()); if (alive(f)) ask(); };
          zones(ZONES, async (id, ev, z) => {
            setTurn('wait'); cam.classList.remove('asking'); sfx.tick();
            const L = LIEUX[z.lieu];
            if (z.lieu === 'ascenseur') {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              cadreZone(L.cadre); marque(L.ou, L.label, 'juste');
              if (!await juste(f, 'Oui' + NB + "! L'ascenseur ne marche pas.", PANNE)) return;
              zones(null); suite();
            } else {
              cadreZone(L.cadre, 'faux'); marque(L.ou || L.cadre, L.label, 'faux');
              const montrer = await faux(f, ligne(1), PAS_CA[z.lieu]); if (montrer === null) return;
              if (montrer) $$('.hit[data-id^="asc"]', cam).forEach(h => h.classList.add('indice'));
              ask();
            }
          });
          ask();
        },

        /* 2 · le gardien redit quand le technicien arrive ; on fait glisser le soleil (ou on clique sur un moment), l'affichette se complète */
        async quand(f) {
          let choix = null, angle = DEPART, anim = 0, tire = false;
          const proche = a => (a > 168 ? null : MOMENTS.reduce((p, m) => (Math.abs(m.a - a) < Math.abs(p.a - a) ? m : p)));
          const poser = a => {
            angle = a; const s = $('#soleil'); if (!s) return;
            s.setAttribute('transform', `translate(${pos(a).map(v => v.toFixed(1)).join(' ')})`);
            const m = proche(a);
            $$('.ciel .fond', side).forEach(r => r.classList.toggle('on', r.dataset.id === (m ? m.id : 'aube')));
            $$('.moment', side).forEach(b => b.setAttribute('aria-pressed', !!m && b.dataset.id === m.id));
            $('#trou').textContent = m ? m.note : '…'; $('#trou').classList.toggle('vide', !m);
          };
          const vers = a => { const de = angle, t0 = performance.now(), my = ++anim; const pas = now => { if (my !== anim) return; const k = Math.min(1, (now - t0) / 480), e = 1 - Math.pow(1 - k, 3); poser(de + (a - de) * e); if (k < 1) requestAnimationFrame(pas); }; requestAnimationFrame(pas); };
          const choisir = m => { choix = m; vers(m.a); sfx.tick(); };
          const glisser = () => { const s = $('#soleil'); if (!s) return null; const r = s.getBoundingClientRect(), svg = $('.ciel', side).getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, [mx, my] = pos(MOMENTS[0].a), x2 = svg.left + mx / 460 * svg.width, y2 = svg.top + my / 200 * svg.height; return [at(x, y + 40, 0), at(x, y, 1), at(x, y, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)]; };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(glisser, 4000); };
          if (!await avant(f, {
            question: 'Écoute le gardien.', qui: 'gardien', seg: ligne(2), gel: GEL_LOGE, sideW: 520, consigne: 'Le technicien arrive quand' + NB + '? Fais glisser le soleil.',
            panneau: `<div class="panel glass journee"><p class="ptitre">Fais glisser le soleil</p>${CIEL()}
              <div class="moments">${MOMENTS.map(m => `<button class="moment" data-id="${m.id}" aria-pressed="false"><b>${m.t}</b><small>${m.h}</small></button>`).join('')}</div>
              <div class="affichette" aria-live="polite"><p class="af-titre">Ascenseur en panne</p><p class="af-texte">Le technicien arrive <span class="trou vide" id="trou">…</span></p><p class="af-sign">Le gardien</p></div></div>`,
            monte: p => {
              const svg = $('.ciel', p);
              const aDe = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 460, c = Math.max(-1, Math.min(1, (x - CX) / RX)); return Math.max(6, Math.min(176, Math.acos(c) * 180 / Math.PI)); };
              svg.addEventListener('pointerdown', e => {
                if (!tour()) return;
                A.unlock(); idle.reset(); e.preventDefault(); svg.setPointerCapture(e.pointerId); tire = true; anim++; $('.journee', p).classList.add('tire'); poser(aDe(e));
              });
              svg.addEventListener('pointermove', e => { if (tire) poser(aDe(e)); });
              const lacher = () => { if (!tire) return; tire = false; $('.journee', p).classList.remove('tire'); choisir(proche(angle) || MOMENTS[0]); };
              svg.addEventListener('pointerup', lacher); svg.addEventListener('pointercancel', lacher);
              $$('.moment', p).forEach(b => b.addEventListener('click', () => { if (!tour()) return; A.unlock(); idle.reset(); choisir(MOMENTS.find(m => m.id === b.dataset.id)); }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(ligne(2)[0], ligne(2)[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (!tour()) return;
            if (!choix) { Q.show('you', 'Fais glisser le soleil.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            if (choix.id === 'aprem') {
              const b = $('.moment[data-id="aprem"]', side); b.classList.remove('indice'); b.classList.add('juste'); $('.affichette', side).classList.add('juste');
              if (!await juste(f, 'Oui' + NB + '! Cet après-midi.', TECH)) return;
              suite();
            } else {
              const montrer = await faux(f, ligne(2), 'Pas ' + choix.note + '. Écoute encore.'); if (montrer === null) return;
              choix = null; vers(DEPART);
              if (montrer) $('.moment[data-id="aprem"]', side).classList.add('indice');
              ask();
            }
          }
          ask();
        },

        /* 3 · dans la vidéo : elle redit « je prends l'escalier » ; on trace son chemin du doigt dans le hall ; la fin de la vidéo le montre */
        async chemin(f) {
          const SVGNS = 'http://www.w3.org/2000/svg', Z = ZONES.filter(z => z.lieu !== 'telephone'), ac = new AbortController();
          let trace = null, pts = [], dernier = 0;
          const surCam = e => { const r = cam.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; };
          const zoneEn = p => Z.slice().reverse().find(z => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h);
          const dessiner = () => trace && trace.firstChild.setAttribute('points', pts.map(p => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' '));
          const glisse = () => { const r = cam.getBoundingClientRect(), P = (x, y) => [r.left + r.width * x / 100, r.top + r.height * y / 100], [x1, y1] = P(49, 56), [x2, y2] = P(27, 86); return [at(x1, y1 + 40, 0), at(x1, y1, 1), at(x1, y1, 1, .82), at(x2, y2, 1, .82), at(x2, y2, 1), at(x2, y2, 0)]; };
          const ask = () => { Q.show('you', state.ask); yourTurn(); cam.classList.add('asking', 'trace-on'); idle.set(glisse, 4500); };
          if (!await avant(f, { question: 'Écoute encore madame Diallo.', qui: 'diallo', seg: ESC, gel: GEL_HALL, consigne: 'Où va madame Diallo' + NB + '? Fais glisser ton doigt pour montrer son chemin.' })) return;
          state.replay = async () => { setTurn('listen'); cam.classList.remove('asking'); $$('.trace', cam).forEach(x => x.remove()); await playSegment(ESC[0], ESC[1], gel()); if (alive(f)) ask(); };
          const fini = () => { ac.abort(); cam.classList.remove('trace-on'); };
          async function arriver(z, tr) {
            setTurn('wait'); cam.classList.remove('asking'); idle.clear(); sfx.tick();
            const L = LIEUX[z.lieu];
            if (z.lieu === 'escalier') {
              $$('.hit', cam).forEach(h => h.classList.remove('indice'));
              if (tr) tr.classList.add('juste');
              cadreZone(L.cadre); marque(L.ou || L.cadre, L.label, 'juste');
              fini(); zones(null);
              if (!await juste(f, 'Oui' + NB + "! Elle prend l'escalier.")) return;
              await wait(600); if (!alive(f)) return;
              if (tr) tr.remove();
              await playSegment(ESC[1] - .05, FIN, null); if (!alive(f)) return;
              suite();
            } else {
              if (tr) tr.classList.add('faux');
              cadreZone(L.cadre, 'faux'); marque(L.ou || L.cadre, L.label, 'faux');
              const montrer = await faux(f, ESC, PAS_LA[z.lieu]); if (montrer === null) return;
              $$('.trace', cam).forEach(x => x.remove());
              if (montrer) $('.hit[data-id="escalier"]', cam).classList.add('indice');
              ask();
            }
          }
          /* au clavier (ou un simple clic sur un endroit) : le bouton de la zone */
          zones(Z, (id, ev, z) => { if (Date.now() - dernier < 600) return; arriver(z, null); });
          const pret = () => alive(f) && tour() && cam.classList.contains('asking');
          cam.addEventListener('pointerdown', e => {
            if (!alive(f)) return fini();
            if (!pret() || e.button > 0) return;
            A.unlock(); idle.clear(); e.preventDefault();
            try { cam.setPointerCapture(e.pointerId); } catch (x) {}
            $$('.trace', cam).forEach(x => x.remove());
            pts = [surCam(e)];
            trace = document.createElementNS(SVGNS, 'svg'); trace.setAttribute('class', 'surimage trace'); trace.setAttribute('viewBox', '0 0 100 100'); trace.setAttribute('preserveAspectRatio', 'none'); trace.setAttribute('aria-hidden', 'true');
            const l = document.createElementNS(SVGNS, 'polyline'); l.setAttribute('vector-effect', 'non-scaling-stroke'); trace.append(l); cam.append(trace); dessiner();
          }, { signal: ac.signal });
          cam.addEventListener('pointermove', e => {
            if (!trace) return;
            const p = surCam(e), q = pts[pts.length - 1]; if (Math.hypot((p.x - q.x) * 16 / 9, p.y - q.y) < .7) return;
            pts.push(p); dessiner();
          }, { signal: ac.signal });
          const lacher = e => {
            if (!trace) return;
            const tr = trace; trace = null; dernier = Date.now();
            if (!pret() || e.type === 'pointercancel') { tr.remove(); return; }
            const p = surCam(e); pts.push(p); dessiner();
            const z = zoneEn(p);
            if (!z) { tr.classList.add('perdu'); setTimeout(() => tr.remove(), 1500); Q.show('you', "Glisse jusqu'à l'endroit où elle va."); idle.set(glisse, 4500); return; }
            arriver(z, tr);
          };
          cam.addEventListener('pointerup', lacher, { signal: ac.signal }); cam.addEventListener('pointercancel', lacher, { signal: ac.signal });
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        gardien: [{ text: 'Allô, oui' + A.NB + '?', seg: A.ligne(0) }, { text: 'Le technicien arrive cet après-midi.', seg: [A.phrase('le technicien')[0], A.ligne(2)[1]] }],
        diallo: [{ text: "C'est madame Diallo.", seg: A.phrase("c'est madame Diallo") }, { text: "L'ascenseur ne marche pas.", seg: A.phrase("L'ascenseur ne marche pas") }, { text: "Je prends l'escalier.", seg: A.phrase("je prends l'escalier") }],
      },
    }),
  };
})();
