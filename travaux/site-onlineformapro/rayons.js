// Les rayons de la page Contact : les routes lumineuses de l'ouverture, sur fond blanc. Quatre
// rubans de fibres fines (bleu à peine violet, lavande, rose, orangé) qui balaient l'écran depuis
// les bords et filent vers un point de l'horizon, à droite ; des comètes qui les parcourent, avec
// leur lueur ; une poussière de particules carrées qui dérive le long des rubans, comme les
// particules de l'ouverture ; au sol une matrice de points que parcourent des ondes ; à
// l'horizon un halo et un éclat horizontal. Deux canevas : le net, et la lueur (en demi-
// résolution, floutée par le CSS). Dessiné en 2D (rien de lourd à charger), à l'arrêt hors de
// l'écran, figé si le visiteur a demandé moins d'animations.
(() => {
  const zone = document.querySelector('.heros-rayons');
  if (!zone) return;
  const cadre = document.createElement('div');
  cadre.className = 'rayons';
  cadre.setAttribute('aria-hidden', 'true');
  cadre.innerHTML = '<canvas class="rayons-lueur"></canvas><canvas class="rayons-net"></canvas>';
  zone.append(cadre);
  const [toileLueur, toile] = cadre.children;
  const ctx = toile.getContext('2d'), lueur = toileLueur.getContext('2d');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // les couleurs de l'ouverture, assez soutenues pour tenir sur le blanc
  const B = [58, 51, 255], V = [118, 84, 255], W = [150, 138, 255], R = [255, 70, 120], O = [255, 132, 64];
  const melange = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
  const nuancier = (cs, t) => { const s = t * (cs.length - 1), i = Math.min(cs.length - 2, Math.floor(s)); return melange(cs[i], cs[i + 1], s - i); };

  // les rubans : leur axe (x au sol en fonction de la profondeur z), leur largeur, leurs couleurs
  const Z0 = 1.2, Z1 = 70, CAM = 2.4;
  const RUBANS = [
    { x: (z) => -3 - 34 * Math.exp(-(z - 4) / 10), large: 4.2, n: 16, teintes: [B, V, W, R] },
    { x: (z) => 1.2 + 1.6 * Math.sin(z * 0.08 + 0.4), large: 3.2, n: 14, teintes: [R, O, W], voile: 0.2 },
    { x: (z) => 6 + 30 * Math.exp(-(z - 4) / 9), large: 4.6, n: 16, teintes: [W, V, B] },
    { x: (z) => -14 + 6 * Math.sin(z * 0.05 + 2.2) + 9 * Math.exp(-z / 14), large: 2.6, n: 10, teintes: [V, R] },
  ];
  // chaque fibre ondule un peu autour de sa place dans le ruban, comme une tresse lâche
  const fibreX = (ruban, u, z, i) => ruban.x(z) + u * ruban.large / 2 * (1 + 0.22 * Math.sin(z * 0.13 + i * 0.9));
  const fibres = [];
  RUBANS.forEach((ruban) => {
    for (let i = 0; i < ruban.n; i++) {
      const t = i / (ruban.n - 1);
      fibres.push({ ruban, i, u: t * 2 - 1, c: nuancier(ruban.teintes, t), a: 0.5 + 0.45 * Math.sin(Math.PI * t) });
    }
  });

  let graine = 11;
  const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  // les comètes : une fibre, une position, une longueur, une vitesse, un sens
  const cometes = Array.from({ length: 150 }, () => ({
    fibre: fibres[Math.floor(hasard() * fibres.length)], z: Z0 + hasard() * (Z1 - Z0),
    long: 6 + hasard() * 12, vitesse: 9 + hasard() * 15, sens: hasard() < 0.7 ? 1 : -1,
  }));
  // la poussière : le long d'un ruban, un peu à côté, un peu en l'air, qui vient vers nous
  const grains = Array.from({ length: 1500 }, () => {
    const ruban = RUBANS[Math.floor(hasard() * RUBANS.length)];
    return {
      ruban, u: (hasard() + hasard() + hasard() - 1.5) * 1.5, y: hasard() ** 2 * 1.6, z: Z0 + hasard() * (Z1 - Z0),
      vitesse: 1.2 + hasard() * 4, taille: 0.8 + hasard() * 1.1, phase: hasard() * 6.3, c: nuancier(ruban.teintes, hasard()),
    };
  });
  const teinte = new Map();
  const rgba = (c, a) => { const k = c.join() + '/' + (a = Math.round(a * 20) / 20); let s = teinte.get(k); if (!s) teinte.set(k, (s = `rgba(${c}, ${a})`)); return s; };

  let L = 0, H = 0, dpr = 1, vx = 0, vy = 0, f = 0, souris = 0, cible = 0, degrades = [], voiles = [];
  const projeter = (x, z, y = 0) => [vx + (x / z) * f, vy + ((CAM - y) / z) * f];
  const fondu = (z) => Math.max(0, 1 - (z - Z0) / (Z1 - Z0)) ** 1.3;
  function taille() {
    const b = zone.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    L = b.width; H = b.height;
    toile.width = Math.round(L * dpr); toile.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    toileLueur.width = Math.round(L / 2); toileLueur.height = Math.round(H / 2);
    lueur.setTransform(0.5, 0, 0, 0.5, 0, 0);
    f = Math.max(L, 700) * 0.55;
    vy = H * (L < 700 ? 0.26 : 0.34);
    // le fondu des fibres vers l'horizon : la hauteur à l'écran ne dépend que de la profondeur,
    // un dégradé vertical par fibre suffit (z → décalage Z0/z)
    degrades = fibres.map((fi) => {
      const g = ctx.createLinearGradient(0, vy, 0, vy + (CAM / Z0) * f);
      g.addColorStop(0, rgba(fi.c, 0));
      for (const z of [70, 40, 24, 14, 8, 5, 3, 2, 1.2]) g.addColorStop(Z0 / z, rgba(fi.c, fi.a * fondu(z)));
      return g;
    });
    voiles = RUBANS.map((ruban) => {
      const c = nuancier(ruban.teintes, ruban.voile ?? 0.5), g = lueur.createLinearGradient(0, vy, 0, vy + (CAM / Z0) * f);
      g.addColorStop(0, rgba(c, 0));
      for (const z of [70, 30, 14, 7, 4, 2, 1.2]) g.addColorStop(Z0 / z, rgba(c, 0.32 * fondu(z) * Math.min(1, z / 5)));
      return g;
    });
  }

  function image(t) {
    souris += (cible - souris) * 0.05;
    vx = L * (L < 700 ? 0.64 : 0.73) + souris * 28;
    ctx.clearRect(0, 0, L, H);
    lueur.clearRect(0, 0, L, H);

    // le halo de l'horizon, et son éclat horizontal (dans la lueur)
    const halo = ctx.createRadialGradient(vx, vy, 0, vx, vy, Math.max(L, H) * 0.5);
    halo.addColorStop(0, 'rgba(118, 84, 255, .42)'); halo.addColorStop(0.3, 'rgba(255, 70, 120, .14)'); halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, L, H);
    lueur.save(); lueur.translate(vx, vy); lueur.scale(1, 0.06);
    const eclat = lueur.createRadialGradient(0, 0, 0, 0, 0, L * 0.55);
    eclat.addColorStop(0, 'rgba(118, 84, 255, .9)'); eclat.addColorStop(0.35, 'rgba(255, 70, 120, .35)'); eclat.addColorStop(1, 'rgba(255, 255, 255, 0)');
    lueur.fillStyle = eclat; lueur.fillRect(-L, -H * 20, L * 2, H * 40); lueur.restore();
    const ligne = ctx.createLinearGradient(vx - L * 0.5, 0, vx + L * 0.5, 0);
    ligne.addColorStop(0, 'rgba(118, 84, 255, 0)'); ligne.addColorStop(0.5, 'rgba(118, 84, 255, .7)'); ligne.addColorStop(1, 'rgba(255, 70, 120, 0)');
    ctx.fillStyle = ligne; ctx.fillRect(vx - L * 0.5, vy - 0.5, L, 1);

    // la matrice de points au sol, et ses ondes qui filent vers l'horizon
    const onde = (t * 10) % 34;
    for (let z = Z0 + 0.3; z < Z1; z += 1.5) {
      const a0 = fondu(z);
      for (let x = -40; x <= 40; x += 1.5) {
        const [px, py] = projeter(x, z);
        if (px < -4 || px > L + 4 || py > H + 4) continue;
        const e = Math.exp(-Math.abs(Math.hypot(x * 0.6, z) - onde) / 2);
        const r = Math.max(1.2, Math.min(3, 4.4 / Math.sqrt(z))) * (1 + 0.6 * e);
        ctx.fillStyle = rgba([98, 80, 255], (0.34 + 0.66 * e) * a0);
        ctx.fillRect(px - r / 2, py - r / 2, r, r);
      }
    }

    // le corps lumineux de chaque ruban, dans la lueur : la surface entre ses deux bords
    RUBANS.forEach((ruban, r) => {
      lueur.fillStyle = voiles[r];
      lueur.beginPath();
      const bord = (u, z) => projeter(ruban.x(z) + u * ruban.large * 0.5, z);
      for (let z = Z0; z <= Z1; z += z < 6 ? 0.3 : 1) lueur.lineTo(...bord(-1, z));
      for (let z = Z1; z >= Z0; z -= z < 6 ? 0.3 : 1) lueur.lineTo(...bord(1, z));
      lueur.fill();
    });

    // les fibres : un trait par tronçon de profondeur (plus épais devant), le fondu par dégradé
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const TRONCONS = [[Z0, 3, 2.6], [3, 8, 1.9], [8, 22, 1.25], [22, Z1, 0.8]];
    fibres.forEach((fi, k) => {
      ctx.strokeStyle = degrades[k];
      for (const [za, zb, ep] of TRONCONS) {
        ctx.lineWidth = ep;
        ctx.beginPath();
        for (let z = za; z <= zb + 1e-6; z += z < 6 ? 0.25 : z < 20 ? 0.6 : 1.5) {
          const [px, py] = projeter(fibreX(fi.ruban, fi.u, z, fi.i), z);
          z === za ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    });

    // la poussière : des carrés qui dérivent vers nous et scintillent
    for (const g of grains) {
      const z = Z0 + ((((g.z - g.vitesse * t - Z0) % (Z1 - Z0)) + (Z1 - Z0)) % (Z1 - Z0));
      const [px, py] = projeter(g.ruban.x(z) + g.u * g.ruban.large / 2, z, g.y);
      if (px < -4 || px > L + 4 || py < -4 || py > H + 4) continue;
      const r = Math.max(0.8, Math.min(3.2, 4 / Math.sqrt(z))) * g.taille;
      ctx.fillStyle = rgba(g.c, fondu(z) * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.4 + g.phase))));
      ctx.fillRect(px - r / 2, py - r / 2, r, r);
    }

    // les comètes : une tête vive et une traîne qui s'efface, nettes et dans la lueur
    for (const q of cometes) {
      const { fibre: fi, sens } = q;
      let tete = q.z - sens * q.vitesse * t;
      tete = Z0 + ((((tete - Z0) % (Z1 - Z0)) + (Z1 - Z0)) % (Z1 - Z0));
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const z = tete + (sens * q.long * k) / 6;
        if (z < Z0 || z > Z1) break;
        pts.push(projeter(fibreX(fi.ruban, fi.u, z, fi.i), z));
      }
      if (pts.length < 2) continue;
      const vif = fondu(tete), [a, b] = [pts[0], pts[pts.length - 1]];
      const ep = Math.max(1, Math.min(4.5, 6.5 / Math.sqrt(tete)));
      // la tête nette d'un ton plus soutenu que sa fibre, pour se détacher d'elle sur le blanc
      const fort = fi.c.map((x) => Math.round(x * 0.8));
      for (const [c2, c, largeur] of [[ctx, fort, ep], [lueur, fi.c, ep * 5]]) {
        const g = c2.createLinearGradient(a[0], a[1], b[0], b[1]);
        g.addColorStop(0, rgba(c, vif)); g.addColorStop(0.35, rgba(c, vif * 0.5)); g.addColorStop(1, rgba(c, 0));
        c2.strokeStyle = g; c2.lineWidth = largeur; c2.lineCap = 'round';
        c2.beginPath(); pts.forEach(([x, y], k) => (k ? c2.lineTo(x, y) : c2.moveTo(x, y))); c2.stroke();
      }
    }
  }

  let visible = true, debut = performance.now() - 4000;
  const boucle = (maintenant) => { image((maintenant - debut) / 1000); if (visible && !calme) requestAnimationFrame(boucle); };
  new IntersectionObserver(([e]) => { const etait = visible; visible = e.isIntersecting; if (visible && !etait && !calme) requestAnimationFrame(boucle); }).observe(zone);
  addEventListener('resize', () => { taille(); if (calme) image(6); });
  zone.addEventListener('pointermove', (e) => { const b = zone.getBoundingClientRect(); cible = (e.clientX - b.left) / b.width - 0.5; });
  taille();
  if (calme) image(6); else requestAnimationFrame(boucle);
})();
