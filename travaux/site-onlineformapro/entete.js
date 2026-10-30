// L'en-tête, commun aux pages et à l'ouverture 3D : le menu sur petit écran, les méga-menus au
// survol, le fond clair au-dessus d'une photo une fois qu'on a défilé.
(() => {
  const entete = document.querySelector('.entete');
  const burger = document.querySelector('.entete-burger');
  if (burger) burger.addEventListener('click', () => {
    const ouvert = entete.classList.toggle('menu-ouvert');
    burger.setAttribute('aria-expanded', String(ouvert));
    majEntete();
  });
  // les méga-menus s'ouvrent au survol (classe est-ouvert, marque.css), avec de l'indulgence : un
  // menu ouvert le reste 0,4 s après que la souris en est sortie (le temps de rejoindre le
  // panneau en diagonale, ou d'y revenir), et un autre ne le remplace qu'après 0,15 s de survol
  // (on peut traverser les liens voisins en chemin) ; au clavier, ils s'ouvrent au focus.
  // Au-dessus d'une photo, l'en-tête prend alors son fond clair, comme quand le menu est ouvert ;
  // un clic sur l'un de leurs liens les replie jusqu'à ce que la souris en sorte (une ancre de
  // la même page reste visible)
  let megaOuvert = false, ouvert = null, minuteur = null;
  function majEntete() {
    if (!entete || !entete.classList.contains('entete--photo')) return;
    // sur l'ouverture 3D (entete--nuit), l'en-tête reste sombre au défilement, et passe au clair
    // quand les sections blanches du site arrivent sous lui
    const nuit = entete.classList.contains('entete--nuit'), plan = nuit && document.querySelector('.plan');
    const defile = nuit ? !!plan && plan.getBoundingClientRect().top <= entete.offsetHeight : scrollY > 24;
    entete.classList.toggle('est-defile', defile || megaOuvert || entete.classList.contains('menu-ouvert'));
  }
  const ouvrir = (oui) => { megaOuvert = oui; if (entete) entete.classList.toggle('mega-actif', oui); document.body.classList.toggle('mega-ouverte', oui); majEntete(); };
  const fermer = () => { clearTimeout(minuteur); if (ouvert) ouvert.classList.remove('est-ouvert', 'mega-repli'); ouvert = null; ouvrir(false); };
  const montrer = (menu) => {
    clearTimeout(minuteur);
    if (ouvert !== menu) { if (ouvert) ouvert.classList.remove('est-ouvert', 'mega-repli'); ouvert = menu; menu.classList.add('est-ouvert'); }
    if (!menu.classList.contains('mega-repli')) ouvrir(true);
  };
  const replier = (menu) => { menu.classList.add('mega-repli'); document.activeElement.blur(); ouvrir(false); };
  for (const menu of document.querySelectorAll('.entete-menu')) {
    menu.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(minuteur);
      if (ouvert && ouvert !== menu) minuteur = setTimeout(() => montrer(menu), 150);
      else montrer(menu);
    });
    menu.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(minuteur); minuteur = setTimeout(fermer, 400); });
    menu.addEventListener('focusin', () => montrer(menu));
    menu.addEventListener('focusout', (e) => { if (!menu.contains(e.relatedTarget) && ouvert === menu && !menu.matches(':hover')) fermer(); });
    menu.addEventListener('click', (e) => { if (e.target.closest('.mega a')) replier(menu); });
    menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') replier(menu); });
  }
  if (entete && entete.classList.contains('entete--photo')) {
    addEventListener('scroll', majEntete, { passive: true });
    majEntete();
  }
})();
