// Les pages du site : menu sur téléphone, en-tête transparent au-dessus d'une photo
// d'ouverture, titres d'ouverture découpés en mots, changements de fond au défilement (comme
// le modèle Vectura), lignes « gestion » qui s'allument au centre de l'écran, apparitions,
// onglets du blog, formulaires (maquette : rien n'est envoyé).
document.documentElement.classList.add('js');

// -------------------------------------------------------------------- en-tête
const entete = document.querySelector('.entete');
const burger = document.querySelector('.entete-burger');
if (burger) burger.addEventListener('click', () => {
  const ouvert = entete.classList.toggle('menu-ouvert');
  burger.setAttribute('aria-expanded', String(ouvert));
  majEntete();
});
// les méga-menus s'ouvrent au survol (marque.css) ; au-dessus d'une photo, l'en-tête prend alors
// son fond clair, comme quand le menu est ouvert ; un clic sur l'un de leurs liens les replie jusqu'à ce que la souris en sorte
// (une ancre de la même page reste visible)
let megaOuvert = false;
function majEntete() { if (entete && entete.classList.contains('entete--photo')) entete.classList.toggle('est-defile', scrollY > 24 || megaOuvert || entete.classList.contains('menu-ouvert')); }
for (const menu of document.querySelectorAll('.entete-menu')) {
  const ouvrir = (oui) => { megaOuvert = oui; majEntete(); };
  menu.addEventListener('mouseenter', () => ouvrir(true));
  menu.addEventListener('mouseleave', () => { ouvrir(false); menu.classList.remove('mega-repli'); });
  menu.addEventListener('focusin', () => ouvrir(true));
  menu.addEventListener('focusout', (e) => { if (!menu.contains(e.relatedTarget)) ouvrir(false); });
  menu.addEventListener('click', (e) => { if (e.target.closest('.mega a')) { menu.classList.add('mega-repli'); document.activeElement.blur(); ouvrir(false); } });
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { menu.classList.add('mega-repli'); document.activeElement.blur(); ouvrir(false); } });
}
if (entete && entete.classList.contains('entete--photo')) {
  addEventListener('scroll', majEntete, { passive: true });
  majEntete();
}

// -------------------------------------------------------------------- titres d'ouverture
// découpés en mots (les espaces insécables gardent leurs groupes ensemble), que marque.css
// fait monter un à un à l'arrivée sur la page
for (const titre of document.querySelectorAll(':is(.visuel-texte, .heros-texte, .tete-produit-texte, .heros-clair, .billet-titre) > .titre-1')) {
  let i = 0;
  const parcourir = (noeud) => {
    for (const n of [...noeud.childNodes]) {
      if (n.nodeType === Node.ELEMENT_NODE) { parcourir(n); continue; }
      if (n.nodeType !== Node.TEXT_NODE) continue;
      const frag = document.createDocumentFragment();
      for (const morceau of n.textContent.split(/( +)/)) {
        if (!morceau) continue;
        if (/^ +$/.test(morceau)) { frag.append(morceau); continue; }
        const mot = document.createElement('span');
        mot.className = 'mot'; mot.style.setProperty('--i', i++); mot.textContent = morceau;
        frag.append(mot);
      }
      n.replaceWith(frag);
    }
  };
  parcourir(titre);
  titre.classList.add('titre-mots');
}

// -------------------------------------------------------------------- changements de fond
// une section marquée data-fond="noir" ou "chaud" fait passer toute la page à ce fond quand
// elle franchit la ligne située à 40 % de la hauteur de l'écran ; la page redevient blanche
// quand plus aucune ne la franchit
const fonds = [...document.querySelectorAll('[data-fond]')];
if (fonds.length && 'IntersectionObserver' in window) {
  const actives = new Set();
  const obs = new IntersectionObserver((entrees) => {
    for (const e of entrees) e.isIntersecting ? actives.add(e.target) : actives.delete(e.target);
    const f = [...actives][0]?.dataset.fond;
    document.body.classList.toggle('fond-noir', f === 'noir');
    document.body.classList.toggle('fond-chaud', f === 'chaud');
  }, { rootMargin: '-40% 0px -60% 0px' });
  fonds.forEach(s => obs.observe(s));
}

// -------------------------------------------------------------------- lignes « gestion »
// voilées à 60 %, elles s'allument quand elles passent au centre de l'écran
const lignes = document.querySelectorAll('.gestion-ligne');
if (lignes.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entrees) => {
    for (const e of entrees) e.target.classList.toggle('est-active', e.isIntersecting);
  }, { rootMargin: '-30% 0px -30% 0px' });
  lignes.forEach(l => obs.observe(l));
} else lignes.forEach(l => l.classList.add('est-active'));

// -------------------------------------------------------------------- apparitions
const apparitions = document.querySelectorAll('.apparait');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('est-visible'); obs.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  apparitions.forEach(el => obs.observe(el));
} else apparitions.forEach(el => el.classList.add('est-visible'));

// -------------------------------------------------------------------- vidéos en boucle
// arrêtées quand le visiteur a demandé moins d'animations ; celles qui ont un data-debut (en
// secondes) commencent à ce moment et y reviennent à chaque tour (leur introduction sautée)
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const v of document.querySelectorAll('video[autoplay]')) { v.removeAttribute('autoplay'); v.pause(); }
}
for (const v of document.querySelectorAll('video[data-debut]')) {
  const debut = +v.dataset.debut || 0;
  if (!debut) continue;
  v.loop = false;
  const caler = () => { if (v.currentTime < debut) v.currentTime = debut; };
  v.addEventListener('loadedmetadata', caler);
  if (v.readyState >= 1) caler();
  v.addEventListener('ended', () => { v.currentTime = debut; v.play().catch(() => {}); });
}

// -------------------------------------------------------------------- onglets du blog
const filtres = document.querySelector('.filtres');
if (filtres) {
  const articles = [...document.querySelectorAll('[data-categorie]')];
  filtres.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    for (const x of filtres.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b));
    const c = b.dataset.filtre;
    for (const a of articles) a.hidden = c !== 'tout' && a.dataset.categorie !== c;
  });
}

// -------------------------------------------------------------------- formulaires (maquette)
for (const f of document.querySelectorAll('form[data-maquette]')) {
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    let m = f.querySelector('.formulaire-message');
    if (!m) { m = document.createElement('p'); m.className = 'formulaire-message'; m.setAttribute('role', 'status'); f.append(m); }
    m.innerHTML = `Maquette : ce formulaire n’envoie encore rien. En attendant, utilisez <a href="${f.dataset.maquette}" style="text-decoration:underline">celui du site actuel</a>.`;
  });
}

// -------------------------------------------------------------------- onglets des logos clients
for (const bloc of document.querySelectorAll('.logos')) {
  const onglets = [...bloc.querySelectorAll('[role="tab"]')];
  const choisir = (o) => {
    for (const x of onglets) {
      const actif = x === o;
      x.setAttribute('aria-selected', String(actif));
      x.tabIndex = actif ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !actif;
    }
  };
  bloc.addEventListener('click', (e) => { const o = e.target.closest('[role="tab"]'); if (o) choisir(o); });
  bloc.addEventListener('keydown', (e) => {
    const i = onglets.indexOf(document.activeElement);
    if (i < 0 || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    const o = onglets[(i + (e.key === 'ArrowRight' ? 1 : onglets.length - 1)) % onglets.length];
    choisir(o);
    o.focus();
  });
}
