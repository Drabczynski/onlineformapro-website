// La page, hors scène 3D : le réglage des animations, l'apparition des blocs au défilement
// et l'en-tête qui se fond au-dessus du contenu.
//
// Le réglage part du système (« réduire les animations ») ; le bouton « Animations » de
// l'en-tête le remplace, et le choix est retenu dans le navigateur. Il se lit sur <html> :
// classe mouvement-reduit. Le petit script en tête de page la pose avant tout affichage ;
// ce fichier la tient à jour et prévient la scène (évènement ofp:animations).
//
// Les apparitions ne cachent jamais ce qui est déjà à l'écran : un bloc visible au
// chargement est marqué vu tout de suite. Sans JavaScript, ou animations coupées, tout est
// affiché d'emblée.
(function () {
  const racine = document.documentElement;
  const systeme = matchMedia('(prefers-reduced-motion: reduce)');
  const bouton = document.getElementById('animations');

  function choixRetenu() {
    try { const v = localStorage.getItem('ofp-animations'); if (v) return v === 'oui'; } catch (e) {}
    return null;
  }

  // -------------------------------------------------------------- apparitions
  const blocs = [...document.querySelectorAll('.apparait')];
  const guetteur = 'IntersectionObserver' in window ? new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('vu'); guetteur.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;

  function preparerApparitions() {
    const actif = !!guetteur && !racine.classList.contains('mouvement-reduit');
    if (actif) {
      for (const b of blocs) {
        if (b.classList.contains('vu')) continue;
        if (b.getBoundingClientRect().top < innerHeight) b.classList.add('vu');
        else guetteur.observe(b);
      }
    }
    racine.classList.toggle('apparitions', actif);
  }

  // -------------------------------------------------------------- réglage
  function appliquer(anime) {
    racine.classList.toggle('mouvement-reduit', !anime);
    bouton.setAttribute('aria-pressed', String(anime));
    bouton.querySelector('.etat').textContent = anime ? 'activées' : 'désactivées';
    preparerApparitions();
    dispatchEvent(new Event('ofp:animations'));
  }
  bouton.addEventListener('click', () => {
    const anime = racine.classList.contains('mouvement-reduit');
    try { localStorage.setItem('ofp-animations', anime ? 'oui' : 'non'); } catch (e) {}
    appliquer(anime);
  });
  systeme.addEventListener('change', () => {
    const c = choixRetenu();
    appliquer(c === null ? !systeme.matches : c);
  });

  // -------------------------------------------------------------- en-tête
  const entete = document.querySelector('.entete');
  const suivre = () => entete.classList.toggle('defile', scrollY > 24);
  addEventListener('scroll', suivre, { passive: true });
  suivre();

  appliquer(!racine.classList.contains('mouvement-reduit'));
})();
