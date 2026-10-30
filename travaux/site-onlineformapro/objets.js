// Les objets du parcours, dessinés comme le camion du modèle (voir « objets dessinés » dans
// monde.js) : un cube dont les modules s'emboîtent au-dessus du carrefour (la solution
// globale et modulaire) ; une planète entourée de particules au-dessus du croisement en X
// (les 22 millions d'apprenants) ; le bâtiment de la R&D au bout de la ligne droite (les
// développements sur mesure).
//
// Chaque objet est construit dans son propre repère (en unités du monde : la route fait
// environ 4,4 de large), puis posé. L'épaisseur des traits suit la distance d'où la caméra
// les regarde : environ deux pixels à l'écran.
import * as THREE from 'three';

// fournis par monde.js à la création (dessin : voir « objets dessinés » ; les couleurs ; nuee :
// des points de données le long de lignes, voir particules.js)
let dessin, B, R, nuee;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RAD = Math.PI / 180;

// -------------------------------------------------------------------- formes planes
// un rectangle aux coins arrondis (l × h, rayon r), centré : ses points, dans l'ordre
export function rectangle(l, h, r = 0, n = 5) {
  const pts = [], cx = l / 2 - r, cy = h / 2 - r, m = r > 0 ? n : 0;
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sy], k) => {
    for (let j = 0; j <= m; j++) {
      const a = (k * 90 + 90 * j / Math.max(m, 1)) * RAD;
      pts.push(new THREE.Vector2(sx * cx + r * Math.cos(a), sy * cy + r * Math.sin(a)));
    }
  });
  return pts;
}
// une ligne brisée (Vector3), refermée si « ferme » : la courbe que suivent les nuées
function brisee(pts, ferme = false) {
  const c = new THREE.CurvePath();
  const liste = ferme ? [...pts, pts[0]] : pts;
  for (let k = 1; k < liste.length; k++) c.add(new THREE.LineCurve3(liste[k - 1], liste[k]));
  return c;
}
// un plan : son centre O, ses axes A (u) et B (v) ; place des points 2D dans l'espace
const plan = (O, A, B) => (pts) => pts.map(p => O.clone().addScaledVector(A, p.x).addScaledVector(B, p.y));
// une boîte : ses douze arêtes, et son volume si demandé
function boite(d, [x0, x1], [y0, y1], [z0, z1], couleur, rayon, volume = true) {
  for (const y of [y0, y1]) d.trait([V(x0, y, z0), V(x1, y, z0), V(x1, y, z1), V(x0, y, z1)], couleur, rayon, true);
  for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) d.trait([V(x, y0, z), V(x, y1, z)], couleur, rayon);
  if (volume) {
    const e = 0.03, g = new THREE.BoxGeometry(x1 - x0 - e, y1 - y0 - e, z1 - z0 - e);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    d.volume(g);
  }
}
// -------------------------------------------------------------------- la planète
// Méridiens et parallèles sur une sphère qui masque sa face cachée ; un liseré qui suit le
// contour vu de la caméra, avec deux arcs orangés ; des particules en orbite.
function planete(rayon) {
  const groupe = new THREE.Group(), globe = new THREE.Group(), fin = 0.03;
  const d = dessin(), lignes = [];
  for (let k = 0; k < 9; k++) {
    const phi = k * 20 * RAD, pts = [];
    for (let j = 0; j < 72; j++) { const t = j / 72 * 2 * Math.PI; pts.push(V(rayon * Math.cos(t) * Math.cos(phi), rayon * Math.sin(t), rayon * Math.cos(t) * Math.sin(phi))); }
    d.trait(pts, B, fin, true);
    lignes.push(brisee(pts, true));
  }
  for (const lat of [-75, -60, -40, -20, 0, 20, 40, 60, 75, 84]) {
    const rr = rayon * Math.cos(lat * RAD), y = rayon * Math.sin(lat * RAD), n = Math.max(16, Math.round(72 * Math.cos(lat * RAD))), pts = [];
    for (let j = 0; j < n; j++) { const t = j / n * 2 * Math.PI; pts.push(V(rr * Math.cos(t), y, rr * Math.sin(t))); }
    d.trait(pts, B, fin, true);
    lignes.push(brisee(pts, true));
  }
  d.volume(new THREE.SphereGeometry(rayon - 0.08, 48, 32));
  d.finir(globe);
  // les données, comme autour des pics : des points serrés le long des méridiens et des
  // parallèles, à peine au-dessus de la surface, où filent des paquets
  if (nuee) globe.add(nuee(lignes, { densite: 13, dispersion: 0.07, taille: [0.026, 0.024], graine: 2 }));
  groupe.add(globe);

  // le liseré : des arcs dans le plan face à la caméra (réorientés à chaque image)
  const liseré = new THREE.Group(), dl = dessin();
  for (const [a0, a1, couleur] of [[105, 175, R], [175, 295, B], [295, 345, R], [345, 465, B]]) {
    const pts = [];
    for (let j = 0; j <= 40; j++) { const a = (a0 + (a1 - a0) * j / 40) * RAD; pts.push(V(rayon * 1.006 * Math.cos(a), rayon * 1.006 * Math.sin(a), 0)); }
    dl.trait(pts, couleur, 0.07);
  }
  dl.finir(liseré);
  groupe.add(liseré);

  // les particules : une poussière fine, plus dense près de la surface, quelques grains
  // orangés ou blancs
  const n = 1600, pos = new Float32Array(n * 3), coul = new Float32Array(n * 3), phase = new Float32Array(n);
  const teintes = [B, B, B, B, B, B, '#FFFFFF', '#FFFFFF', R].map(c => new THREE.Color().setHex(parseInt(c.slice(1), 16), THREE.LinearSRGBColorSpace));
  for (let k = 0; k < n; k++) {
    const u = Math.random() * 2 - 1, t = Math.random() * 2 * Math.PI, r = rayon * (1.03 + 0.55 * Math.random() ** 2.5), s = Math.sqrt(1 - u * u);
    pos.set([r * s * Math.cos(t), r * u * 0.8, r * s * Math.sin(t)], k * 3);
    coul.set(teintes[k % teintes.length].toArray(), k * 3);
    phase[k] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('couleur', new THREE.BufferAttribute(coul, 3));
  geo.setAttribute('phase', new THREE.BufferAttribute(phase, 1));
  const matiere = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTemps: { value: 0 }, uEchelle: { value: 100 } }]),
    vertexShader: `
      attribute vec3 couleur; attribute float phase;
      uniform float uTemps; uniform float uEchelle;
      varying vec3 vCouleur; varying float vEclat;
      #include <fog_pars_vertex>
      void main() {
        vCouleur = couleur;
        vEclat = 0.3 + 0.7 * pow(0.5 + 0.5 * sin(uTemps * 1.6 + phase * 6.2832), 2.0);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.5, uEchelle / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      varying vec3 vCouleur; varying float vEclat;
      #include <fog_pars_fragment>
      void main() {
        float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5)) * vEclat;
        gl_FragColor = vec4(vCouleur * 1.5, a);
        #include <fog_fragment>
      }`,
  });
  const nuage = new THREE.Points(geo, matiere);
  groupe.add(nuage);

  const versCamera = new THREE.Vector3(), centre = new THREE.Vector3();
  return {
    groupe,
    animer(temps, camera, anime) {
      globe.rotation.y = anime ? temps * 0.05 : 0;
      nuage.rotation.y = anime ? temps * 0.03 : 0;
      matiere.uniforms.uTemps.value = anime ? temps : 0;
      // le contour apparent d'une sphère vue de près : un cercle un peu plus petit, avancé vers la caméra
      groupe.getWorldPosition(centre);
      versCamera.copy(camera.position).sub(centre);
      const dist = versCamera.length(), k = Math.min(0.99, rayon / dist);
      liseré.position.copy(versCamera).multiplyScalar(k * rayon / dist);
      liseré.scale.setScalar(Math.sqrt(1 - k * k));
      liseré.quaternion.copy(camera.quaternion);
    },
    taille(echelle) { matiere.uniforms.uEchelle.value = 0.12 * echelle; },
  };
}

// -------------------------------------------------------------------- le bâtiment
// Trois niveaux, des bandeaux à chaque plancher, des baies vitrées à meneaux, un auvent
// d'entrée vitré avec ses marches, un édicule sur le toit. Repère : x en largeur, y en
// hauteur, la façade principale en z = 0, tournée vers +z.
function batiment() {
  const d = dessin(), L = 36, P = 16, Hb = 13.4, niveaux = [0, 4.2, 8.4], fort = 0.045, fin = 0.03;
  // le volume, ses bandeaux (plinthe orangée, planchers, acrotère orangé)
  boite(d, [-L / 2, L / 2], [0, Hb], [-P, 0], B, fort);
  const x = L / 2 + 0.012, z0 = 0.012, z1 = -P - 0.012;
  const ceinture = (y, couleur) => d.trait([V(-x, y, z0), V(x, y, z0), V(x, y, z1), V(-x, y, z1)], couleur, fort, true);
  ceinture(0.5, R);
  for (const y of [4.0, 4.4, 8.2, 8.6, 12.4]) ceinture(y, B);
  ceinture(Hb - 0.45, R);
  // les façades : pilastres aux angles et entre les baies, fenêtres à quatre carreaux
  const faces = [
    { O: V(0, 0, 0.012), A: V(1, 0, 0), largeur: L, baies: 4, entree: true },
    { O: V(0, 0, -P - 0.012), A: V(-1, 0, 0), largeur: L, baies: 4 },
    { O: V(-L / 2 - 0.012, 0, -P / 2), A: V(0, 0, 1), largeur: P, baies: 2 },
    { O: V(L / 2 + 0.012, 0, -P / 2), A: V(0, 0, -1), largeur: P, baies: 2 },
  ];
  for (const f of faces) {
    const sur = plan(f.O, f.A, V(0, 1, 0)), bord = f.largeur / 2 - 0.9, l = (2 * bord) / f.baies;
    for (const u of [-bord, bord]) d.trait(sur([new THREE.Vector2(u, 0.5), new THREE.Vector2(u, Hb - 0.45)]), B, fin);
    for (let b = 1; b < f.baies; b++) for (const du of [-0.3, 0.3]) d.trait(sur([new THREE.Vector2(-bord + b * l + du, 0.5), new THREE.Vector2(-bord + b * l + du, Hb - 0.45)]), B, fin);
    for (let b = 0; b < f.baies; b++) for (const y0 of niveaux) {
      if (f.entree && y0 === 0 && (b === 1 || b === 2)) continue;     // l'auvent d'entrée
      const u0 = -bord + b * l + 0.7, u1 = -bord + (b + 1) * l - 0.7, v0 = y0 + 0.9, v1 = y0 + 3.5;
      d.trait(sur([new THREE.Vector2(u0, v0), new THREE.Vector2(u1, v0), new THREE.Vector2(u1, v1), new THREE.Vector2(u0, v1)]), B, fin, true);
      for (let m = 1; m < 4; m++) { const u = u0 + (u1 - u0) * m / 4; d.trait(sur([new THREE.Vector2(u, v0), new THREE.Vector2(u, v1)]), B, fin * 0.8); }
    }
  }
  // l'auvent d'entrée : sa boîte, l'arête orangée, la façade vitrée, la porte double
  boite(d, [-6.5, 6.5], [0, 4.8], [0, 2.6], B, fort);
  d.trait([V(-6.5, 4.8, 2.612), V(6.5, 4.8, 2.612)], R, fort);
  d.trait([V(-6.5, 4.15, 2.612), V(6.5, 4.15, 2.612)], B, fin);
  const vitre = plan(V(0, 0, 2.612), V(1, 0, 0), V(0, 1, 0)), P2 = (x, y) => new THREE.Vector2(x, y);
  d.trait(vitre([P2(-5.6, 0.36), P2(5.6, 0.36), P2(5.6, 3.9), P2(-5.6, 3.9)]), B, fin, true);
  d.trait(vitre([P2(-5.6, 3.2), P2(5.6, 3.2)]), B, fin * 0.8);
  for (const x of [-3.7, -1.8, 1.8, 3.7]) d.trait(vitre([P2(x, 0.36), P2(x, 3.9)]), B, fin * 0.8);
  d.trait(vitre([P2(0, 0.36), P2(0, 3.2)]), B, fin * 0.8);
  // les marches, l'édicule sur le toit
  boite(d, [-7.2, 7.2], [0, 0.18], [2.6, 3.5], B, fin);
  boite(d, [-6.9, 6.9], [0.18, 0.36], [2.6, 3.05], R, fin);
  boite(d, [3, 13], [Hb, Hb + 2.2], [-11, -5], B, fort);
  return d.finir(new THREE.Group());
}

// -------------------------------------------------------------------- le cube modulaire
// Un cube de 2 × 2 × 2 cellules aux arêtes adoucies. Quatre cellules bleues forment le socle
// (le LMS, qui brille avec sa carte) ; quatre modules orangés viennent s'y emboîter, un par
// carte suivante : par la gauche, par le haut, par l'avant, par la droite. Des pointillés
// montrent leur chemin tant qu'ils sont détachés ; le module de la carte à l'écran brille.
// Repère : la caméra le regarde depuis -x, +y, +z.
const CELLULE = 3, PAS = 3.22, ADOUCI = 0.28;
// une boîte aux arêtes adoucies : le contour de chacune de ses faces, en retrait des arêtes
// (les contours de deux faces voisines dessinent l'arête en double trait)
function pave(d, c, [lx, ly, lz], couleur, rayon, lignes = null) {
  for (const [n, u, v, demi, lu, lv] of [
    [V(1, 0, 0), V(0, 0, -1), V(0, 1, 0), lx / 2, lz, ly], [V(-1, 0, 0), V(0, 0, 1), V(0, 1, 0), lx / 2, lz, ly],
    [V(0, 1, 0), V(1, 0, 0), V(0, 0, -1), ly / 2, lx, lz], [V(0, -1, 0), V(1, 0, 0), V(0, 0, 1), ly / 2, lx, lz],
    [V(0, 0, 1), V(1, 0, 0), V(0, 1, 0), lz / 2, lx, ly], [V(0, 0, -1), V(-1, 0, 0), V(0, 1, 0), lz / 2, lx, ly],
  ]) {
    const a = Math.min(ADOUCI, lu / 4, lv / 4);
    const pts = plan(c.clone().addScaledVector(n, demi + 0.004), u, v)(rectangle(lu - 2 * a, lv - 2 * a, Math.min(0.14, a), 3));
    d.trait(pts, couleur, rayon, true);
    if (lignes) lignes.push(brisee(pts, true));
  }
  d.volume(new THREE.BoxGeometry(lx - 0.03, ly - 0.03, lz - 0.03).translate(c.x, c.y, c.z));
}
const cellule = (i, j, k) => V((i - 0.5) * PAS, (j - 0.5) * PAS, (k - 0.5) * PAS);
// un trait en pointillés de a à b
function pointilles(d, a, b, couleur, rayon, tiret = 0.35, vide = 0.3) {
  const L = a.distanceTo(b), dir = b.clone().sub(a).normalize();
  for (let t = 0; t < L; t += tiret + vide) d.trait([a.clone().addScaledVector(dir, t), a.clone().addScaledVector(dir, Math.min(L, t + tiret))], couleur, rayon);
}
function cubeModulaire() {
  const groupe = new THREE.Group(), fort = 0.03, fin = 0.022;
  const socle = dessin({ propre: true }), lignesSocle = [];
  for (const c of [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]) pave(socle, cellule(...c), [CELLULE, CELLULE, CELLULE], B, fort, lignesSocle);
  socle.finir(groupe);
  // les données, comme autour des pics : lavande et blanches sur le socle, orangées sur les modules
  const NUEE_CUBE = { densite: 18, dispersion: 0.1, taille: [0.05, 0.045] };
  if (nuee) groupe.add(nuee(lignesSocle, { ...NUEE_CUBE, teintes: [['blanc', 3], ['lavande', 5]], graine: 3 }));
  const teinteSocle = socle.matieres.map(m => m.uniforms.uCouleur.value.clone());
  // les modules, dans l'ordre des cartes : leur place, d'où ils viennent
  const modules = [
    { place: cellule(0, 0, 1), depart: V(-6, 0, 0) },
    { place: cellule(1, 1, 0), depart: V(0, 6, 0) },
    { place: cellule(1, 0, 1), depart: V(0, 0, 6) },
    { place: cellule(1, 0, 0), depart: V(5.5, 0, 0) },
  ].map(({ place, depart }, k) => {
    const taille = [CELLULE, CELLULE, CELLULE];
    const objet = new THREE.Group(), d = dessin({ propre: true }), sens = depart.clone().normalize().negate(), lignesModule = [];
    pave(d, V(0, 0, 0), taille, R, fort, lignesModule);
    // l'ergot d'emboîtement, sur la face qui entre la première
    const demi = Math.abs(sens.dot(V(...taille))) / 2, ergot = [1.1, 1.1, 1.1].map((l, a) => (Math.abs(sens.getComponent(a)) > 0.5 ? 0.5 : l));
    pave(d, sens.clone().multiplyScalar(demi + 0.25), ergot, R, fin);
    d.finir(objet);
    if (nuee) objet.add(nuee(lignesModule, { ...NUEE_CUBE, teintes: [['orange', 4], ['rose', 3], ['blanc', 2]], graine: 4 + k }));
    objet.position.copy(place).add(depart);
    groupe.add(objet);
    // les pointillés : des coins de la face d'entrée jusqu'à la place
    const g = new THREE.Group(), dg = dessin({ propre: true });
    const axes = [0, 1, 2].filter(a => Math.abs(sens.getComponent(a)) < 0.5);
    for (const [s1, s2] of [[-1, -1], [-1, 1], [1, 1], [1, -1]]) {
      const coin = V(0, 0, 0).addScaledVector(sens, demi);
      coin.setComponent(axes[0], s1 * (taille[axes[0]] / 2 - ADOUCI));
      coin.setComponent(axes[1], s2 * (taille[axes[1]] / 2 - ADOUCI));
      pointilles(dg, coin.clone().add(place), coin.clone().add(place).add(depart), R, fin * 0.8);
    }
    dg.finir(g);
    groupe.add(g);
    return { objet, place, depart, lignes: d.matieres, guides: dg.matieres, teinte: d.matieres.map(m => m.uniforms.uCouleur.value.clone()) };
  });

  let moments = null;
  const aide = (p, [a, b]) => { const t = Math.min(1, Math.max(0, (p - a) / Math.max(1e-6, b - a))); return t * t * (3 - 2 * t); };
  return {
    groupe,
    placer(m) { moments = m; },
    animer(progression, anime) {
      if (!moments) return;
      const [a0, b0] = moments.socle, brilleSocle = progression >= a0 && progression < b0 ? 1.7 : 1;
      socle.matieres.forEach((m, j) => m.uniforms.uCouleur.value.copy(teinteSocle[j]).multiplyScalar(brilleSocle));
      modules.forEach((mod, k) => {
        let e = aide(progression, moments.modules[k]);
        if (!anime) e = e < 0.5 ? 0 : 1;
        mod.objet.position.copy(mod.place).addScaledVector(mod.depart, 1 - e);
        const [a, b] = moments.cartes[k], brille = progression >= a && progression < b ? 1.7 : 1;
        mod.lignes.forEach((m, j) => m.uniforms.uCouleur.value.copy(mod.teinte[j]).multiplyScalar(brille));
        for (const m of mod.guides) m.uniforms.uAlpha.value = 0.7 * (1 - e);
      });
    },
  };
}

// -------------------------------------------------------------------- mise en place
// poses : cube { centre }, planete { centre, rayon }, batiment { entree, sens }
export function creerObjets(scene, poses, outils) {
  ({ dessin, nuee } = outils);
  ({ bleu: B, rouge: R } = outils.couleurs);
  // la solution globale et modulaire : le cube, au-dessus du carrefour
  const cube = cubeModulaire();
  cube.groupe.position.copy(poses.cube.centre);
  scene.add(cube.groupe);

  // les 22 millions d'apprenants : la planète au-dessus du croisement
  const terre = planete(poses.planete.rayon);
  terre.groupe.position.copy(poses.planete.centre);
  scene.add(terre.groupe);

  // les développements sur mesure : le bâtiment, son entrée au bout de la ligne droite
  const { entree, sens } = poses.batiment, devant = sens.clone().negate();
  const siege = batiment(), echelle = 0.72;
  siege.scale.setScalar(echelle);
  siege.position.copy(entree).addScaledVector(sens, 3.5 * echelle);
  siege.rotation.y = Math.atan2(devant.x, devant.z);
  scene.add(siege);

  return {
    animer: (temps, camera, anime, progression) => { terre.animer(temps, camera, anime); cube.animer(progression, anime); },
    taille: (echelle) => terre.taille(echelle),
    placer: (moments) => cube.placer(moments),
  };
}
