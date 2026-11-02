// L'ouverture : défilement doux, parcours de la caméra, textes qui s'allument.
//
// Le défilement (Lenis, lerp 0,1) fait avancer la caméra dans le monde de lignes : la
// progression vaut la position de défilement, en hauteurs d'écran, divisée par la longueur
// du parcours ; pendant que les cartes d'un chapitre défilent, la caméra ne garde que 5 %
// de son avance (elle « marque l'arrêt »). La progression est amortie (0,2 s).
//
// Les textes vivent dans des blocs collants de hauteur fixe (en svh, comme le modèle).
// Chacun a sa fenêtre (data-fenetre : début et fin, en svh depuis le haut de son bloc) :
// il s'allume en y entrant, s'éteint en sortant. Titres : lettre par lettre ; paragraphes :
// mot par mot ; encadrés : un scintillement. Les cartes se dévoilent de bas en haut.
//
// Animations réduites (réglage « réduire les animations » du système) : défilement natif,
// textes affichés d'un coup, caméra posée à la station la plus proche du chapitre.
import Lenis from './vendor/lenis.mjs';

const racine = document.documentElement;
let anime = !racine.classList.contains('mouvement-reduit');
const svh = () => innerHeight / 100;

// -------------------------------------------------------------------- défilement doux
let lenis = null;
function defilementDoux(actif) {
  if (actif && !lenis) lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  if (!actif && lenis) { lenis.destroy(); lenis = null; }
}

// -------------------------------------------------------------------- découpe des textes
// lettres (titres) ou mots (paragraphes) dans des <span>, cachés aux lecteurs d'écran qui
// lisent une copie intacte
function decouper(el, mode) {
  // le texte lu par les lecteurs d'écran (un retour à la ligne y compte pour une espace)
  const copie = el.cloneNode(true);
  copie.querySelectorAll('br').forEach(b => b.replaceWith(' '));
  const texte = copie.textContent.replace(/\s+/g, ' ').trim();
  let lettres = 0, mots = 0;
  const parcourir = (noeud) => {
    for (const n of [...noeud.childNodes]) {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        // dans les textes, les espaces insécables restent dans le mot (« de l’IA » ne se coupe
        // pas) ; dans les grands titres, elles redeviennent des espaces : deux mots soudés y
        // seraient parfois plus larges que la ligne, et se couperaient entre deux lettres
        const motif = mode === 'title' ? /\S+|\s+/g : /[^ \t\n\r\f]+|[ \t\n\r\f]+/g, blanc = mode === 'title' ? /^\s+$/ : /^[ \t\n\r\f]+$/;
        for (const morceau of n.textContent.match(motif) || []) {
          if (blanc.test(morceau)) { frag.appendChild(document.createTextNode(morceau.replace(/\u00a0/g, ' '))); continue; }
          const mot = document.createElement('span'), enveloppe = document.createElement('span');
          mot.className = 'word'; enveloppe.className = 'word-wrap';
          enveloppe.style.setProperty('--word-index', mots++);
          if (mode === 'title') for (const c of morceau) {
            const s = document.createElement('span');
            s.className = 'char'; s.style.setProperty('--char-index', lettres++); s.textContent = c;
            enveloppe.appendChild(s);
          } else enveloppe.textContent = morceau;
          mot.appendChild(enveloppe); frag.appendChild(mot);
        }
        noeud.replaceChild(frag, n);
      } else if (n.nodeType === Node.ELEMENT_NODE && n.tagName !== 'BR') parcourir(n);
    }
  };
  const visuel = document.createElement('span');
  visuel.setAttribute('aria-hidden', 'true');
  while (el.firstChild) visuel.appendChild(el.firstChild);
  parcourir(visuel);
  const lisible = document.createElement('span');
  lisible.className = 'lisible'; lisible.textContent = texte;
  el.append(lisible, visuel);
  el.style.setProperty('--char-total', lettres);
  el.style.setProperty('--word-total', mots);
  return mode === 'title' ? lettres : mots;
}

// -------------------------------------------------------------------- apparitions
const ANIM = /animation--[\w-]+/g;
function nettoyer(el) { el.className = el.className.replace(ANIM, '').replace(/\s+/g, ' ').trim(); clearTimeout(el._minuteur); }
function allumer(el) {
  nettoyer(el);
  el.classList.add('est-visible');
  const nom = el.dataset.revele;
  if (!anime || !nom) return;
  el.classList.add(`animation--${nom}--inactive`);
  void el.offsetWidth;
  requestAnimationFrame(() => setTimeout(() => {
    el.classList.remove(`animation--${nom}--inactive`);
    el.classList.add(`animation--${nom}--active`);
  }, 16));
}
function eteindre(el) {
  nettoyer(el);
  const nom = el.dataset.revele;
  if (!anime || !nom) { el.classList.remove('est-visible'); return; }
  const sortie = nom === 'flicker-in' ? 'flicker-out' : `${nom}-out`;
  el.classList.add(`animation--${sortie}--active`);
  const duree = nom === 'flicker-in' ? 300 : (el._morceaux || 0) * 10 + 200;
  el._minuteur = setTimeout(() => { nettoyer(el); el.classList.remove('est-visible'); }, duree + 50);
}

// les cartes : dévoilées de bas en haut à l'aller, effacées vers le haut ensuite. Chaque
// passage anime le cadre (découpe, échelle, opacité) et le contenu (opacité, position) vers
// leur état d'arrivée. Le dévoilement démarre vite et ralentit à la fin : la carte est presque
// entière en une demi-seconde. Un passage qui en interrompt un autre repart de l'état
// atteint ; une carte qui s'en va avant d'être entière achève de s'ouvrir pendant que son
// contenu s'efface (jamais de demi-carte). À la sortie, le cadre s'efface avec le contenu :
// c'est lui qui porte le flou du fond, qui sinon resterait seul à l'écran puis disparaîtrait
// d'un coup.
const ENTREE = 'cubic-bezier(0.22, 1, 0.36, 1)', SORTIE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const corps = (c) => c.querySelector('.carte-corps, .presentation-image-corps');
const OUVERTE = { clipPath: 'inset(0% 0% 0% 0%)', transform: 'scale(1)', opacity: 1 }, FERMEE = { clipPath: 'inset(100% 0% 0% 0%)', transform: 'scale(1.05)', opacity: 1 };
const EFFACEE = { ...OUVERTE, opacity: 0 };
const PLEIN = { opacity: 1, transform: 'translateY(0)' }, EFFACE = { opacity: 0, transform: 'translateY(-2.5svh)' };
const PASSAGES = {                     // le cadre, puis le contenu : [départ, arrivée, durée (ms), courbe]
  entree: [[FERMEE, OUVERTE, 1200, ENTREE], [PLEIN, PLEIN, 300, ENTREE]],
  entreeRetour: [[OUVERTE, OUVERTE, 300, ENTREE], [EFFACE, PLEIN, 1000, ENTREE]],
  sortie: [[OUVERTE, EFFACEE, 800, SORTIE], [PLEIN, EFFACE, 800, SORTIE]],
  sortieRetour: [[OUVERTE, FERMEE, 1000, SORTIE], [PLEIN, PLEIN, 300, ENTREE]],
};
function animerCarte(carte, sorte) {
  const c = corps(carte), animations = carte.getAnimations().concat(c.getAnimations());
  const enCours = animations.some(a => a.playState === 'running');
  const sc = getComputedStyle(carte), sb = getComputedStyle(c);
  const atteint = [{ clipPath: sc.clipPath === 'none' ? OUVERTE.clipPath : sc.clipPath, transform: sc.transform === 'none' ? 'scale(1)' : sc.transform, opacity: +sc.opacity },
    { opacity: +sb.opacity, transform: sb.transform === 'none' ? 'translateY(0)' : sb.transform }];
  for (const a of animations) a.cancel();
  if (!anime) { carte.classList.toggle('est-visible', sorte.startsWith('entree')); return; }
  carte.classList.add('est-visible');
  let fin = null;
  [carte, c].forEach((el, k) => {
    const [depart, arrivee, duration, easing] = PASSAGES[sorte][k];
    const a = el.animate([enCours ? atteint[k] : depart, arrivee], { duration, easing, fill: 'both' });
    if (!fin || duration > fin.effect.getTiming().duration) fin = a;
  });
  if (sorte.startsWith('sortie')) fin.finished.then(() => { carte.classList.remove('est-visible'); for (const x of carte.getAnimations().concat(c.getAnimations())) x.cancel(); }).catch(() => {});
}
// les images des cartes, décodées d'avance : elles sont prêtes quand la carte se dévoile
addEventListener('load', () => { for (const img of document.querySelectorAll('.carte-image')) img.decode?.().catch(() => {}); });

// -------------------------------------------------------------------- mise en page
const blocs = [...document.querySelectorAll('.bloc')];
let elements = [], paquets = [], chapitres = [], gel = [], total = 1, finExperience = 0, phaseRuban = null;
function mesurer() {
  const y = scrollY, u = svh();
  const haut = (el) => (el.getBoundingClientRect().top + y) / u;            // en svh
  elements = [];
  for (const b of blocs) {
    const h = haut(b);
    for (const el of b.querySelectorAll('[data-fenetre]')) {
      const [a, z] = el.dataset.fenetre.split(' ').map(Number);
      // les cartes, et la grande image du passage « 25 ans », se dévoilent par découpe
      elements.push({ el, debut: h + a, fin: h + z, carte: el.matches('.carte, .presentation-image'), etat: el._etat || false });
    }
  }
  paquets = [...document.querySelectorAll('.paquet')].map(p => ({ haut: haut(p), n: +p.dataset.cartes, barres: [...p.querySelectorAll('.progression i')], ruban: p.hasAttribute('data-ruban') }));
  chapitres = [...document.querySelectorAll('[data-chapitre]')].map(c => haut(c) + 115);
  // les arrêts de la caméra : pendant les cartes de chaque chapitre (en hauteurs d'écran)
  gel = paquets.map(p => ({ de: (p.haut + 100) / 100, a: (p.haut + 100 + 75 * p.n) / 100, part: 0.95 }));
  const dernier = paquets[paquets.length - 1];
  finExperience = (dernier.haut + 100 + 75 * dernier.n) / 100 + 0.75;
  // le chapitre du catalogue : son titre, et l'arrêt pendant lequel le ruban tourne
  const r = paquets.findIndex(p => p.ruban);
  phaseRuban = r < 0 ? null : { titre: chapitres[2] / 100, de: gel[r].de, a: gel[r].a };
  total = avance(finExperience);
  if (monde) monde.placer(stations(), moments());
}
// l'avance de la caméra pour une position de défilement (en écrans), arrêts compris
function avance(e) {
  let ajuste = e;
  for (const g of gel) {
    if (e >= g.a) ajuste -= (g.a - g.de) * g.part;
    else if (e > g.de) ajuste -= (e - g.de) * g.part;
  }
  return ajuste;
}
const progressionDe = (e) => Math.min(1, Math.max(0, avance(e) / total));
// les stations de la caméra, calées sur les textes (positions en écrans) : vingt-trois pour
// l'ouverture complète, dix-neuf pour l'essai « ondes » qui part juste avant les pics
function ecransDesStations() {
  const [c1, c2, cr, c3, c4] = chapitres.map(v => v / 100);
  const [g1, g2, gr, g3, g4] = gel;
  // au chapitre 1 : l'arrêt devant les pics, l'entrée dedans, les cartes au milieu d'eux, la
  // sortie ; au chapitre du catalogue, la caméra suit la liaison jusqu'au rond-point du ruban
  // (pendant le titre), s'arrête face au ruban le temps des familles, puis repart
  const suite = [c1 + 0.4, (c1 + 0.4 + g1.de) / 2, g1.de, g1.a + 0.35, g1.a + 0.9, c2 + 0.3, g2.de, g2.a, g2.a + 0.9, cr + 1.0, gr.de, gr.a, c3 + 0.3, g3.de, c4 + 0.3, g4.de, g4.de + 0.9, finExperience];
  // avant : le logo, la descente vers l'autoroute, l'autoroute, les lacets, l'approche des pics
  return racine.dataset.variante === 'ondes' ? [0, ...suite] : [0, 0.35, 1.3, 2.0, c1 - 0.5, ...suite];
}
const stations = () => ecransDesStations().map(progressionDe);

// les moments du cube modulaire (chapitre 2) : le socle brille avec la première carte (le
// LMS) ; chaque module s'emboîte à l'entrée de la sienne (les suivantes) et brille tant
// qu'elle est à l'écran
function moments() {
  const g = gel[1], carte = (k) => g.de + 0.75 * k, modules = [1, 2, 3, 4];
  return {
    socle: [progressionDe(carte(0)), progressionDe(carte(1))],
    modules: modules.map(k => [progressionDe(carte(k) - 0.15), progressionDe(carte(k) + 0.45)]),
    cartes: modules.map(k => [progressionDe(carte(k)), progressionDe(carte(k + 1))]),
  };
}

// -------------------------------------------------------------------- monde 3D
// chargé à part (three.js pèse lourd) : les textes n'attendent pas la 3D. Sa création
// occupe le navigateur un instant (préparation des nuanceurs) : elle attend que le titre
// d'accueil soit affiché, puis le monde apparaît en fondu. L'arrivée de la caméra se compte
// à partir de là.
let monde = null, debutMonde = null, signalerTitre;
const titreAffiche = new Promise((r) => { signalerTitre = r; });
const toile = document.getElementById('monde');
import('./monde.js').then(async ({ creerMonde }) => {
  await titreAffiche;
  monde = creerMonde(toile);
  racine.classList.add('avec-webgl');
  monde.taille();
  monde.placer(stations(), moments());
  chargerRuban();
}).catch((e) => {
  racine.classList.add('sans-webgl');
  console.warn('WebGL indisponible :', e);
});

// -------------------------------------------------------------------- le ruban du catalogue
// chargé après le monde, dans son propre canevas (ruban.js), vu par la caméra du monde : il
// monte du rond-point de la liaison, entre le cube et la planète (helice.js). Pendant l'arrêt
// du chapitre, le défilement fait glisser les images le long du ruban : la famille au premier
// plan (f, en continu) commande la liste qui roule à droite et le compteur. Un clic sur le
// ruban, ou sur « Voir le catalogue », couvre l'écran d'une mosaïque de carrés et mène au
// catalogue
const toileRuban = document.getElementById('ruban');
const listeRuban = [...document.querySelectorAll('.ruban-liste li')];
const compteurRuban = document.querySelector('.ruban-compteur b');
let ruban = null, familleAffichee = -1, rubanActif = false, familleRuban = 0;
function chargerRuban() {
  if (!toileRuban || !listeRuban.length) return;
  import('./ruban.js').then(({ creerRuban }) => {
    ruban = creerRuban(toileRuban, listeRuban.map(li => [li.textContent, li.dataset.image || null]));
    ruban.taille();
  }).catch((e) => console.warn('Ruban indisponible :', e));
}
function majRuban(e, t) {
  if (!phaseRuban || !listeRuban.length) return;
  const { titre, de, a } = phaseRuban, n = listeRuban.length;
  // le clic sur le ruban : du titre du chapitre à un peu après l'arrêt
  rubanActif = e > titre - 0.3 && e < a + 0.6;
  familleRuban = Math.min(1, Math.max(0, (e - de) / (a - de))) * (n - 1);
  if (ruban && monde) ruban.image({ vue: monde.camera, f: familleRuban, temps: t, anime });
  if (!rubanActif) survolRuban(false); else revoirSurvol();
  // la liste roule : la famille au premier plan au milieu, ses voisines au-dessus et dessous
  listeRuban.forEach((li, i) => {
    const d = i - familleRuban, ad = Math.abs(d);
    li.style.transform = `translateY(calc(${d.toFixed(3)} * var(--pas-ruban))) scale(${(1 - Math.min(ad, 2.5) * 0.16).toFixed(3)})`;
    li.style.opacity = ad > 2.6 ? 0 : (1 - ad * 0.36).toFixed(3);
  });
  const k = Math.round(familleRuban);
  if (k !== familleAffichee) {
    familleAffichee = k;
    compteurRuban.textContent = String(k + 1).padStart(2, '0');
    listeRuban.forEach((li, i) => li.classList.toggle('est-actif', i === k));
  }
}
function versCatalogue(e, depuisRuban = false) {
  const adresse = 'catalogue.html#titre-categories';
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // un nouvel onglet : le navigateur s'en charge
  // sans animations : directement au catalogue
  if (!anime) { if (depuisRuban) location.href = adresse; return; }
  e.preventDefault();
  const nom = listeRuban[Math.round(familleRuban)].textContent, m = document.createElement('div');
  m.className = 'mosaique-catalogue';
  const etroit = innerWidth < innerHeight, cols = etroit ? 8 : 16, rangs = etroit ? 14 : 10;
  m.style.setProperty('--cols', cols); m.style.setProperty('--rangs', rangs);
  const COULEURS = ['#6b56e2', '#262385', '#8a6ef0', '#a3b2f1', '#ee9cd2', '#ffb088', '#1d1e6c', '#4f5fd8', '#c9c2f6'];
  for (let i = 0; i < cols * rangs; i++) {
    const c = document.createElement('i'), r = Math.random();
    if (r < 0.14) c.className = 'creux'; else c.style.background = COULEURS[Math.floor(Math.random() * COULEURS.length)];
    c.style.animationDelay = `${Math.round(Math.random() * 380)}ms`;
    m.append(c);
  }
  const titre = document.createElement('p');
  titre.className = 'mosaique-catalogue-titre';
  titre.innerHTML = `<small>Famille de formation</small><strong></strong>`;
  titre.querySelector('strong').textContent = nom;
  m.append(titre);
  document.body.append(m);
  setTimeout(() => { location.href = adresse; }, 900);
}
// la toile du ruban est sous les chapitres : on vise le ruban lui-même (un rayon sur sa surface
// visible), hors liens, boutons et cartes. La scène bouge sous un pointeur immobile (la caméra
// suit la souris) : le survol se revérifie aussi de temps en temps, image après image
const experienceRuban = toileRuban?.closest('.experience') || document.body;
let surRuban = false, pointeurRuban = null, tourSurvol = 0;
function viseRuban(x, y, cible) {
  if (!ruban || !rubanActif || !cible) return false;
  if (cible.closest('a, button, input, textarea, .carte, .entete, dialog')) return false;
  const r = toileRuban.getBoundingClientRect();
  return ruban.sous(x - r.left, y - r.top);
}
function survolRuban(v) { if (v !== surRuban) { surRuban = v; experienceRuban.classList.toggle('sur-ruban', v); } }
function revoirSurvol() {
  if (!pointeurRuban || !rubanActif || ++tourSurvol % 6) return;
  survolRuban(viseRuban(pointeurRuban.x, pointeurRuban.y, document.elementFromPoint(pointeurRuban.x, pointeurRuban.y)));
}
if (toileRuban) {
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointeurRuban = { x: e.clientX, y: e.clientY };
    if (surRuban || rubanActif) survolRuban(viseRuban(e.clientX, e.clientY, e.target));
  }, { passive: true });
  addEventListener('click', (e) => { if (viseRuban(e.clientX, e.clientY, e.target)) versCatalogue(e, true); });
}
document.querySelector('.ruban-bouton')?.addEventListener('click', versCatalogue);
// au retour arrière depuis le catalogue, la page revient sans sa mosaïque
addEventListener('pageshow', () => document.querySelectorAll('.mosaique-catalogue').forEach(m => m.remove()));

// -------------------------------------------------------------------- l'indicateur 01 / 04
const indicateur = document.querySelector('.indicateur'), indicateurNum = indicateur.querySelector('.indicateur-num');
let indicateurVisible = false, indicateurValeur = 1;
function majIndicateur(s) {
  let n = 0;
  chapitres.forEach((debut, k) => { if (s >= debut) n = k + 1; });
  const visible = n > 0 && s < finExperience * 100;
  if (visible !== indicateurVisible) {
    indicateurVisible = visible;
    indicateur.dataset.revele = 'flicker-in';
    visible ? allumer(indicateur) : eteindre(indicateur);
    indicateur.classList.toggle('est-cache', false);
  }
  if (n && n !== indicateurValeur) { indicateurValeur = n; indicateurNum.textContent = String(n).padStart(2, '0'); }
}

// -------------------------------------------------------------------- les fenêtres
let sPrec = 0, introFaite = false, debut = null;
function majFenetres(s) {
  const descend = s >= sPrec;
  for (const e of elements) {
    const dedans = s >= e.debut && (s < e.fin || (e.debut === e.fin));
    const premier = e.debut <= 0.0001;                       // les textes d'ouverture, à l'arrivée
    if (premier && !introFaite) continue;
    if (dedans === e.etat) continue;
    e.etat = e.el._etat = dedans;
    if (e.carte) animerCarte(e.el, dedans ? (descend ? 'entree' : 'entreeRetour') : (descend ? 'sortie' : 'sortieRetour'));
    else dedans ? allumer(e.el) : eteindre(e.el);
  }
  for (const p of paquets) p.barres.forEach((b, i) => {
    const f = Math.min(1, Math.max(0, (s - (p.haut + 100 + 75 * i)) / 75));
    b.style.setProperty('--remplissage', f.toFixed(3));
  });
  majIndicateur(s);
  sPrec = s;
}

// -------------------------------------------------------------------- souris
const souris = { x: 0, y: 0 }, sourisCible = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { sourisCible.x = e.clientX / innerWidth - 0.5; sourisCible.y = e.clientY / innerHeight - 0.5; } }, { passive: true });

// -------------------------------------------------------------------- boucle
let progression = 0, vitesse = 0, tPrec = null, mesures = [], derniereAlerte = 0;
function amortir(x, cible, duree, dt) {
  const o = 2 / duree, k = o * dt, e = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k);
  const ch = x - cible, tmp = (vitesse + o * ch) * dt;
  vitesse = (vitesse - o * tmp) * e;
  return cible + (ch + tmp) * e;
}
function image(ms) {
  requestAnimationFrame(image);
  const t = ms / 1000, dt = tPrec === null ? 1 / 60 : Math.min(0.1, t - tPrec);
  tPrec = t;
  if (lenis) lenis.raf(ms);
  if (debut === null) debut = t;
  // les textes d'ouverture s'allument presque aussitôt (tout de suite sans animation)
  if (!introFaite && (t - debut > (anime ? 0.35 : 0) || scrollY > 10)) { introFaite = true; setTimeout(signalerTitre, anime ? 700 : 0); }
  const s = scrollY / svh();
  majFenetres(s);
  const cible = progressionDe(s / 100);
  progression = anime ? amortir(progression, cible, 0.2, dt) : cible;
  if (!monde) return;
  if (debutMonde === null) debutMonde = t;
  const intro = anime ? Math.min(1, (t - debutMonde) / 3) : 1;
  const scene = toile.getBoundingClientRect();
  if (scene.bottom <= 0) return;                             // l'ouverture est passée
  souris.x += (sourisCible.x - souris.x) * Math.min(1, dt * 6);
  souris.y += (sourisCible.y - souris.y) * Math.min(1, dt * 6);
  monde.image({ progression, souris, temps: t, dt, anime, intro });
  majRuban(s / 100, t);
  // si la machine peine (plus de 28 ms par image en moyenne), on allège le rendu
  mesures.push(dt);
  if (mesures.length >= 90) {
    const moyenne = mesures.reduce((a, b) => a + b, 0) / mesures.length;
    mesures = [];
    if (moyenne > 0.028 && t - derniereAlerte > 2) { derniereAlerte = t; monde.alleger(); }
  }
}

// -------------------------------------------------------------------- réglage des animations
// celui du système, suivi s'il change en cours de visite
function appliquer(etat) {
  anime = etat;
  racine.classList.toggle('mouvement-reduit', !anime);
  defilementDoux(anime);
}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => appliquer(!e.matches));

// -------------------------------------------------------------------- départ
document.querySelectorAll('[data-revele="title"], [data-revele="text"]').forEach(el => { el._morceaux = decouper(el, el.dataset.revele); });
appliquer(anime);
function redimensionner() { if (monde) monde.taille(); if (ruban) ruban.taille(); mesurer(); }
addEventListener('resize', redimensionner);
redimensionner();
requestAnimationFrame(image);
// pour les captures de contrôle : aller à une position, sans amortissement
window.__aller = (y) => { scrollTo(0, y); progression = progressionDe(y / svh() / 100); vitesse = 0; };
window.__stations = ecransDesStations;
