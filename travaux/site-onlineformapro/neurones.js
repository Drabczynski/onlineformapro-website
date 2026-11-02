// Essai de direction artistique « neuro » : des réseaux de neurones sur fond clair, pour les
// ouvertures des pages (d'après la collection « Neurones » de Colorpong, sur fond noir, ici
// adaptée au blanc). Chaque neurone part d'un nœud, souvent hors cadre, sur les bords, et
// déploie des centaines de fibres lisses qui se ramifient en éventails, ponctuées de points.
// Chaque branche a sa couleur : le violet de l'ouverture domine, avec de l'indigo, du rouge,
// de l'ambre (le jaune ne se lit pas sur du blanc), du rose, du cyan et du vert. Là où vit le
// texte, les fibres s'éteignent : il reste lisible. Deux compositions (data-neurones) :
// « droite » (le texte ferré à gauche, un grand neurone à droite) et « centre » (le texte au
// centre, les neurones sur les bords) ; sur téléphone, un neurone dans le haut, le texte dessous.
//
// Image figée : le dessin est tiré d'une graine fixe, il est le même à chaque visite. Chaque
// élément [data-neurones] reçoit sa toile ; la composition suit la taille de l'élément.
(() => {
  // les troncs : surtout violet et indigo ; les extrémités prennent les couleurs vives
  const TRONCS = [['#2d0b9e', 5], ['#4a3ff0', 4], ['#6b56e2', 2]];
  const VIVES = [['#e25cb8', 3], ['#19c27a', 3], ['#1fb6d6', 2.4], ['#e5432f', 1.2], ['#f2a516', 1.2], ['#4a3ff0', 1.5]];
  // les compositions (data-neurones) : les neurones, chacun un nœud (en part de la largeur et
  // de la hauteur, hors cadre s'il le faut) et ses lobes [direction (degrés), écart, nombre de
  // fibres, portée (en part de la hauteur), courbure] ; et la zone du texte, où les fibres
  // s'éteignent (centre et demi-axes)
  const COMPOSITIONS = {
    // le texte au centre, les neurones sur les deux bords
    centre: {
      neurones: [
        { x: 1.03, y: 0.44, lobes: [[204, 9, 16, 0.44, -0.012], [178, 8, 18, 0.46, 0.006], [152, 9, 16, 0.44, 0.012], [242, 8, 12, 0.4, -0.014], [114, 8, 12, 0.4, 0.014]] },
        { x: -0.03, y: 0.18, lobes: [[2, 8, 14, 0.4, 0.012], [30, 9, 16, 0.44, -0.006], [62, 8, 14, 0.42, -0.012], [-26, 7, 8, 0.3, 0.012]] },
        { x: 0.14, y: 1.04, lobes: [[252, 8, 10, 0.36, 0.012], [284, 8, 10, 0.4, -0.004], [316, 8, 8, 0.34, -0.012]] },
        { x: 0.86, y: -0.06, lobes: [[116, 7, 8, 0.28, 0.01], [146, 7, 6, 0.24, -0.01]] },
      ],
      calme: { x: 0.5, y: 0.43, rx: 0.34, ry: 0.46 },
    },
    // le texte ferré à gauche ; à droite, un grand neurone dont on voit le nœud, et deux autres
    // qui entrent par les coins
    droite: {
      neurones: [
        { x: 0.74, y: 0.45, lobes: [[-8, 14, 18, 0.43, 0.018], [36, 12, 11, 0.3, -0.016], [84, 13, 14, 0.37, 0.02], [134, 12, 9, 0.26, -0.014], [180, 11, 8, 0.21, 0.016], [218, 13, 12, 0.33, -0.02], [262, 12, 16, 0.41, 0.014], [304, 14, 11, 0.29, -0.018]] },
        { x: 1.04, y: 0.05, lobes: [[152, 9, 10, 0.3, 0.01], [186, 9, 8, 0.26, -0.01], [122, 8, 8, 0.28, 0.012]] },
        { x: 0.99, y: 1.03, lobes: [[206, 8, 10, 0.3, -0.01], [244, 8, 8, 0.28, 0.01]] },
      ],
      calme: { x: 0.24, y: 0.46, rx: 0.3, ry: 0.62 },
    },
    // sur téléphone : un neurone dans le haut, à droite ; le texte dessous
    etroit: {
      neurones: [
        { x: 0.72, y: 0.13, lobes: [[0, 12, 10, 0.17, 0.012], [50, 12, 9, 0.16, -0.01], [110, 12, 7, 0.13, 0.012], [170, 12, 8, 0.15, -0.01], [230, 12, 9, 0.15, 0.01], [290, 12, 9, 0.15, -0.012]] },
        { x: 1.05, y: 0.3, lobes: [[190, 9, 7, 0.14, 0.01], [220, 9, 6, 0.12, -0.01]] },
      ],
      calme: { x: 0.45, y: 0.66, rx: 0.8, ry: 0.42 },
    },
  };

  function dessiner(zone) {
    const toile = zone.querySelector('canvas.neurones') || zone.appendChild(Object.assign(document.createElement('canvas'), { className: 'neurones' }));
    toile.setAttribute('aria-hidden', 'true');
    const b = zone.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const L = b.width, H = Math.max(1, b.height);
    toile.width = Math.round(L * dpr); toile.height = Math.round(H * dpr);
    const ctx = toile.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = ctx.lineJoin = 'round';
    let graine = 1807;
    const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
    const gauss = () => (hasard() + hasard() + hasard() - 1.5) / 1.5;
    const tirer = (liste) => { const tot = liste.reduce((s, [, p]) => s + p, 0); let r = hasard() * tot; for (const [c, p] of liste) { if ((r -= p) <= 0) return c; } return liste[0][0]; };
    const etroit = L < 700;
    const compo = COMPOSITIONS[etroit ? 'etroit' : zone.dataset.neurones] || COMPOSITIONS.centre, zc = compo.calme;
    const calme = (x, y) => {
      const d = Math.hypot((x / L - zc.x) / zc.rx, (y / H - zc.y) / zc.ry);
      return Math.min(1, Math.max(0, (d - 0.78) / 0.5));
    };
    const echelle = Math.min(1.15, Math.max(0.65, Math.min(L / 1440, H / 860)));
    const traits = [], points = [];

    // sur un écran moyen, la composition « droite » laisse plus de place au texte
    const decale = !etroit && zone.dataset.neurones === 'droite' && L < 1180 ? 0.07 : 0;
    for (const ne of compo.neurones) {
      const cx = (ne.x + (ne.x > 0.5 ? decale : 0)) * L, cy = ne.y * H;
      // une fibre : une courbe lisse qui avance, puis se divise ; les troncs restent violets,
      // les branches fines prennent de plus en plus souvent une couleur vive
      const pousser = (x, y, angle, longueur, prof, epaisseur, parcouru, portee, courbure, couleur) => {
        const pas = 6 * echelle, pts = [[x, y]];
        let a = angle, px = x, py = y, fait = 0, c = courbure;
        while (fait < longueur) {
          a += c; c += (hasard() - 0.5) * 0.004;
          px += Math.cos(a) * pas; py += Math.sin(a) * pas; fait += pas;
          pts.push([px, py]);
        }
        const total = parcouru + fait, milieu = pts[pts.length >> 1];
        traits.push([pts, couleur, epaisseur, (0.66 - 0.16 * Math.min(1, total / portee)) * calme(milieu[0], milieu[1])]);
        if (prof < 6 && total < portee) {
          // au bout, les fibres s'ouvrent en éventails
          const enfants = hasard() < (prof < 2 ? 0.5 : 0.78) ? 2 : hasard() < 0.25 ? 3 : 1;
          for (let e = 0; e < enfants; e++) {
            const ecart = enfants === 1 ? gauss() * 0.12 : (e - (enfants - 1) / 2) * (0.16 + prof * 0.05 + hasard() * 0.26);
            const vive = hasard() < 0.08 + prof * 0.15;
            pousser(px, py, a + ecart, longueur * (0.5 + hasard() * 0.3), prof + 1, Math.max(0.45, epaisseur * 0.74), total, portee, c * 0.8 + (hasard() - 0.5) * 0.012, vive ? tirer(VIVES) : couleur);
          }
          if (hasard() < 0.08) points.push([px, py, 0.8 + hasard() * 0.9, couleur]);
        } else if (hasard() < 0.62) points.push([px, py, 1.1 + hasard() * 2.1, hasard() < 0.7 ? couleur : tirer(VIVES)]);
      };
      for (const [dir, ecart, n, porteeRel, courbure] of ne.lobes) {
        const portee = porteeRel * Math.max(H, 600);
        for (let i = 0; i < n; i++) {
          const angle = (dir + gauss() * ecart) * Math.PI / 180;
          // les fibres d'un lobe partent ensemble du nœud, en faisceau, puis s'ouvrent
          pousser(cx + gauss() * 4, cy + gauss() * 4, angle, portee * (0.28 + hasard() * 0.16), 0, 1.25 * echelle, 0, portee, courbure + gauss() * 0.003, tirer(TRONCS));
        }
      }
    }
    for (const [pts, couleur, epaisseur, al] of traits) {
      if (al < 0.015) continue;
      ctx.globalAlpha = al; ctx.strokeStyle = couleur; ctx.lineWidth = epaisseur;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.stroke();
    }
    // les points, par-dessus les fibres
    for (const [x, y, r, couleur] of points) {
      const al = 0.95 * calme(x, y);
      if (al < 0.03) continue;
      ctx.globalAlpha = al; ctx.fillStyle = couleur;
      ctx.beginPath(); ctx.arc(x, y, r * echelle, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const zones = document.querySelectorAll('[data-neurones]');
  zones.forEach(dessiner);
  let minuteur = null;
  addEventListener('resize', () => { clearTimeout(minuteur); minuteur = setTimeout(() => zones.forEach(dessiner), 200); });
})();
