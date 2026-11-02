// Les pages du site (l'en-tête est dans entete.js) : titres d'ouverture découpés en mots,
// changements de fond au défilement (comme le modèle Vectura), lignes « gestion » qui
// s'allument au centre de l'écran, apparitions, onglets du blog et des logos, accordéons,
// formulaires (maquette : rien n'est envoyé).
document.documentElement.classList.add('js');

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

// un dégradé posé sur une phrase du titre (.titre-degrade) court sur toute la phrase : chaque
// mot en montre sa part (sa place et la largeur de la phrase, en variables CSS), recalée quand
// les polices arrivent et quand la fenêtre change de taille
const degrades = document.querySelectorAll('.titre-degrade');
if (degrades.length) {
  const caler = () => degrades.forEach((d) => {
    const r = d.getBoundingClientRect();
    d.style.setProperty('--degrade-l', `${r.width.toFixed(1)}px`);
    d.querySelectorAll('.mot').forEach((m) => m.style.setProperty('--degrade-x', `${(m.getBoundingClientRect().left - r.left).toFixed(1)}px`));
  });
  caler();
  document.fonts?.ready.then(caler);
  addEventListener('resize', caler);
}

// le titre qui change d'argument (LMS) : toutes les 2,8 s, l'argument affiché s'efface mot à mot
// et le suivant monte. L'animation d'arrivée des mots est libérée dès qu'elle est finie (sinon le
// premier changement serait brutal) ; à l'arrêt quand le titre n'est pas à l'écran ou l'onglet
// caché, immobile (le premier argument) si le visiteur a demandé moins d'animations
for (const bloc of document.querySelectorAll('.titre-arguments')) {
  const args = [...bloc.querySelectorAll('.titre-argument')];
  args.forEach((arg) => arg.querySelectorAll('.mot').forEach((m, j) => m.style.setProperty('--j', j)));
  if (args.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) continue;
  let k = 0, visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(bloc);
  const mots = [...args[0].querySelectorAll('.mot')];
  const liberer = () => bloc.classList.add('tourne');
  // la fin de l'arrivée du dernier mot (ou, à défaut, 2,2 s)
  const dernier = mots[mots.length - 1];
  if (dernier) dernier.addEventListener('animationend', liberer, { once: true });
  setTimeout(liberer, 2200);
  const suivant = () => {
    if (!visible || document.hidden) return;
    liberer();
    const avant = args[k];
    k = (k + 1) % args.length;
    avant.classList.add('sort');
    avant.classList.remove('est-actif');
    setTimeout(() => avant.classList.remove('sort'), 1000);
    args[k].classList.add('est-actif');
  };
  setTimeout(() => { suivant(); setInterval(suivant, 2800); }, 2800);
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

// -------------------------------------------------------------------- chiffres et données
// les blocs de chiffres (donnees.py) s'animent à leur arrivée à l'écran (est-visible) ; leurs
// nombres défilent de 0 à leur valeur. Tout est affiché d'emblée si le visiteur a demandé
// moins d'animations.
const blocsDonnees = document.querySelectorAll('.donnees');
if (blocsDonnees.length) {
  const ecrire = (el, v) => { const n = Math.round(v); el.textContent = n >= 10000 ? n.toLocaleString('fr-FR') : String(n); };
  const compter = (bloc) => bloc.querySelectorAll('[data-compte]').forEach((el, i) => {
    const cible = +el.dataset.compte, duree = 1500, debut = performance.now() + 250 + i * 140;
    const pas = (t) => {
      const x = Math.min(1, Math.max(0, (t - debut) / duree));
      ecrire(el, cible * (1 - Math.pow(1 - x, 3)));
      if (x < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) blocsDonnees.forEach(b => b.classList.add('est-visible'));
  else {
    blocsDonnees.forEach(b => b.querySelectorAll('[data-compte]').forEach(el => ecrire(el, 0)));
    const obs = new IntersectionObserver((entrees) => {
      for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('est-visible'); compter(e.target); obs.unobserve(e.target); }
    }, { threshold: 0.25 });
    blocsDonnees.forEach(b => obs.observe(b));
  }
}

// -------------------------------------------------------------------- vidéos jouées une fois
// une vidéo marquée data-fin (l'ouverture LMS) se joue une fois et reste sur sa dernière image ;
// si le visiteur a demandé moins d'animations, ou si la lecture est refusée, elle montre
// d'emblée cette dernière image (data-fin)
for (const v of document.querySelectorAll('video[data-fin]')) {
  const figer = () => { v.poster = v.dataset.fin; v.removeAttribute('autoplay'); v.pause(); v.preload = 'none'; };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { figer(); continue; }
  v.muted = true;
  const p = v.play();
  if (p && p.catch) p.catch(figer);
}

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

// -------------------------------------------------------------------- accordéons
// la réponse se déplie et se replie en douceur (hauteur, marge, fondu) ; le chevron tourne (CSS)
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) for (const d of document.querySelectorAll('details.question')) {
  const resume = d.querySelector('summary'), corps = d.querySelector('.question-reponse');
  if (!resume || !corps) continue;
  let anim = null;
  resume.addEventListener('click', (e) => {
    e.preventDefault();
    if (anim) anim.cancel();
    const ouvrir = !d.open;
    if (ouvrir) d.open = true;
    const h = corps.scrollHeight, bas = getComputedStyle(corps).paddingBottom, ferme = { height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-6px)' }, plein = { height: h + 'px', paddingBottom: bas, opacity: 1, transform: 'none' };
    corps.style.overflow = 'hidden';
    anim = corps.animate(ouvrir ? [ferme, plein] : [plein, ferme], { duration: ouvrir ? 450 : 320, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    anim.onfinish = () => { if (!ouvrir) d.open = false; corps.style.overflow = ''; anim = null; };
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
