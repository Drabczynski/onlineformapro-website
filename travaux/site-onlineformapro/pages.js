// Les pages du site : menu sur téléphone, en-tête qui blanchit au premier défilement au-dessus
// d'un visuel, apparitions au fil du défilement, liste active à côté des écrans d'interface,
// filtres du blog, formulaires (maquette : rien n'est envoyé).
document.documentElement.classList.add('js');

// -------------------------------------------------------------------- en-tête
const entete = document.querySelector('.entete');
const burger = document.querySelector('.entete-burger');
if (burger) burger.addEventListener('click', () => {
  const ouvert = entete.classList.toggle('menu-ouvert');
  burger.setAttribute('aria-expanded', String(ouvert));
});
if (entete && entete.classList.contains('entete--visuel')) {
  const maj = () => entete.classList.toggle('est-defile', scrollY > 24);
  addEventListener('scroll', maj, { passive: true });
  maj();
}

// -------------------------------------------------------------------- apparitions
const apparitions = document.querySelectorAll('.apparait');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('est-visible'); obs.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  apparitions.forEach(el => obs.observe(el));
} else apparitions.forEach(el => el.classList.add('est-visible'));

// -------------------------------------------------------------------- liste active (écrans qui défilent)
for (const liste of document.querySelectorAll('.defile-liste')) {
  const liens = [...liste.querySelectorAll('a[href^="#"]')];
  const panneaux = liens.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const activer = (id) => liens.forEach(a => a.classList.toggle('est-actif', a.getAttribute('href') === '#' + id));
  const obs = new IntersectionObserver((entrees) => {
    const vus = entrees.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (vus.length) activer(vus[0].target.id);
  }, { rootMargin: '-35% 0px -55% 0px' });
  panneaux.forEach(p => obs.observe(p));
  if (panneaux[0]) activer(panneaux[0].id);
}

// -------------------------------------------------------------------- filtres du blog
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
