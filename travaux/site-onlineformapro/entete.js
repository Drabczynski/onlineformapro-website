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
  // les méga-menus s'ouvrent au survol (marque.css) ; au-dessus d'une photo, l'en-tête prend alors
  // son fond clair, comme quand le menu est ouvert ; un clic sur l'un de leurs liens les replie
  // jusqu'à ce que la souris en sorte (une ancre de la même page reste visible)
  let megaOuvert = false;
  function majEntete() {
    if (!entete || !entete.classList.contains('entete--photo')) return;
    // sur l'ouverture 3D (entete--nuit), l'en-tête reste sombre au défilement
    const defile = scrollY > 24 && !entete.classList.contains('entete--nuit');
    entete.classList.toggle('est-defile', defile || megaOuvert || entete.classList.contains('menu-ouvert'));
  }
  for (const menu of document.querySelectorAll('.entete-menu')) {
    const ouvrir = (oui) => { megaOuvert = oui; if (entete) entete.classList.toggle('mega-actif', oui); document.body.classList.toggle('mega-ouverte', oui); majEntete(); };
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
})();
