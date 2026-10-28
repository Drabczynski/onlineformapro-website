// Les objets du parcours, dessinés comme le camion du modèle (voir « objets dessinés » dans
// monde.js) : un ordinateur, un smartphone et une tablette dans le virage de l'accueil ; une
// planète entourée de particules au-dessus du croisement en X (les utilisateurs) ; le
// bâtiment de la R&D au bout de la ligne droite (les développements sur mesure).
//
// Chaque objet est construit dans son propre repère (en unités du monde : la route fait
// environ 4,4 de large), puis posé. L'épaisseur des traits suit la distance d'où la caméra
// les regarde : environ deux pixels à l'écran.
import * as THREE from 'three';

// fournis par monde.js à la création (dessin : voir « objets dessinés » ; les couleurs)
let dessin, B, R;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RAD = Math.PI / 180;

// -------------------------------------------------------------------- formes planes
// un rectangle aux coins arrondis (l × h, rayon r), centré : ses points, dans l'ordre
function rectangle(l, h, r = 0, n = 5) {
  const pts = [], cx = l / 2 - r, cy = h / 2 - r, m = r > 0 ? n : 0;
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sy], k) => {
    for (let j = 0; j <= m; j++) {
      const a = (k * 90 + 90 * j / Math.max(m, 1)) * RAD;
      pts.push(new THREE.Vector2(sx * cx + r * Math.cos(a), sy * cy + r * Math.sin(a)));
    }
  });
  return pts;
}
const cercle = (r, n = 24) => Array.from({ length: n }, (_, j) => new THREE.Vector2(r * Math.cos(j / n * 2 * Math.PI), r * Math.sin(j / n * 2 * Math.PI)));
const decaler = (pts, dx, dy) => pts.map(p => new THREE.Vector2(p.x + dx, p.y + dy));
// un plan : son centre O, ses axes A (u) et B (v) ; place des points 2D dans l'espace
const plan = (O, A, B) => (pts) => pts.map(p => O.clone().addScaledVector(A, p.x).addScaledVector(B, p.y));
// un volume plat : la forme 2D extrudée de « epaisseur » selon A × B, posée sur le plan
function plaque(d, pts, epaisseur, O, A, B) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: epaisseur, bevelEnabled: false, curveSegments: 4 });
  const C = A.clone().cross(B);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(A, B, C).setPosition(O));
  d.volume(g);
}
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
// pose un objet : position, rotation autour de la verticale, puis inclinaison éventuelle
function poser(groupe, objet, [x, y, z], cap = 0) {
  objet.position.set(x, y, z);
  objet.rotation.y = cap;
  groupe.add(objet);
  return objet;
}

// -------------------------------------------------------------------- l'ordinateur portable
// Le socle à plat, l'écran ouvert ; dessus en bleu, dessous et dos de l'écran en orangé,
// comme sur le croquis.
function ordinateur() {
  const d = dessin(), L = 6.4, P = 4.4, e = 0.16, r = 0.3, h = 4.1, es = 0.11, inclinaison = 16 * RAD;
  const fort = 0.02, fin = 0.013;
  const X = V(1, 0, 0), arriere = V(0, 0, -1), haut = V(0, 1, 0);
  // le socle
  d.trait(plan(V(0, e, 0), X, arriere)(rectangle(L, P, r)), B, fort, true);
  d.trait(plan(V(0, 0.01, 0), X, arriere)(rectangle(L, P, r)), R, fort, true);
  plaque(d, rectangle(L - 0.04, P - 0.04, r - 0.02), e - 0.02, V(0, 0.01, 0), X, arriere);
  // le clavier : quatre rangées de treize touches, et la barre d'espace au premier rang
  const dessus = plan(V(0, e + 0.004, 0), X, arriere), pas = 0.4, touche = 0.32;
  for (let rang = 0; rang < 5; rang++) {
    const v = 0.15 + rang * pas;
    for (let k = 0; k < 13; k++) {
      if (rang === 0 && k >= 4 && k <= 8) continue;
      d.trait(dessus(decaler(rectangle(touche, touche, 0.04, 2), (k - 6) * pas, v)), B, fin, true);
    }
  }
  d.trait(dessus(decaler(rectangle(5 * pas - (pas - touche), touche, 0.04, 2), 0, 0.15)), B, fin, true);
  // le pavé tactile, les prises sur le flanc gauche
  d.trait(dessus(decaler(rectangle(2.7, 1.35, 0.12), 0, -1.2)), B, fin, true);
  const flanc = plan(V(-L / 2 - 0.004, e / 2, 0), arriere, haut);
  for (const u of [-1.5, -1.05, -0.6]) d.trait(flanc(decaler(rectangle(0.3, 0.06, 0.03, 2), u, 0)), B, fin * 0.8, true);
  // l'écran : la charnière au bord arrière du socle
  const H = V(0, e, -P / 2 + 0.14), U = V(0, Math.cos(inclinaison), -Math.sin(inclinaison)), N = V(0, Math.sin(inclinaison), Math.cos(inclinaison));
  const face = plan(H.clone().addScaledVector(U, h / 2).addScaledVector(N, es + 0.004), X, U);
  d.trait(face(rectangle(L, h, r)), B, fort, true);
  d.trait(plan(H.clone().addScaledVector(U, h / 2), X, U)(rectangle(L, h, r)), R, fort, true);
  d.trait(face(decaler(rectangle(L - 0.5, h - 0.62, 0.06), 0, 0.03)), B, fin, true);
  d.trait(face(decaler(cercle(0.055, 12), 0, h / 2 - 0.17)), B, fin, true);
  plaque(d, rectangle(L - 0.04, h - 0.04, r - 0.02), es - 0.01, H.clone().addScaledVector(U, h / 2).addScaledVector(N, 0.005), X, U);
  return d.finir(new THREE.Group());
}

// -------------------------------------------------------------------- smartphone et tablette
// Debout, légèrement penchés en arrière, posés sur leur tranche. Face avant en bleu, dos en
// orangé ; l'écran, la caméra, les boutons sur les flancs.
function appareil({ l, h, ep, r, inclinaison, ecran, encoche, boutonsG = [], boutonsD = [] }) {
  const d = dessin(), fort = 0.02, fin = 0.013;
  const X = V(1, 0, 0), U = V(0, Math.cos(inclinaison * RAD), -Math.sin(inclinaison * RAD)), N = V(0, Math.sin(inclinaison * RAD), Math.cos(inclinaison * RAD));
  const centre = V(0, 0, 0).addScaledVector(U, h / 2);
  const face = plan(centre.clone().addScaledVector(N, ep + 0.004), X, U);
  d.trait(face(rectangle(l, h, r)), B, fort, true);
  d.trait(plan(centre, X, U)(rectangle(l, h, r)), R, fort, true);
  d.trait(face(rectangle(l - 2 * ecran, h - 2 * ecran, Math.max(0.05, r - ecran))), B, fin, true);
  if (encoche) {
    // l'encoche du haut : sa découpe, le haut-parleur et la caméra
    d.trait(face(decaler(rectangle(0.62, 0.17, 0.08), 0, h / 2 - ecran - 0.08)), B, fin, true);
    d.trait(face(decaler(rectangle(0.24, 0.035, 0.017, 2), -0.05, h / 2 - ecran - 0.07)), B, fin * 0.8, true);
    d.trait(face(decaler(cercle(0.03, 10), 0.15, h / 2 - ecran - 0.07)), B, fin * 0.8, true);
  } else d.trait(face(decaler(cercle(0.045, 12), 0, h / 2 - ecran / 2)), B, fin, true);
  // les boutons, sur les flancs (u le long de la hauteur, v dans l'épaisseur)
  for (const [cote, liste] of [[-1, boutonsG], [1, boutonsD]]) {
    const flanc = plan(centre.clone().addScaledVector(N, ep / 2).addScaledVector(X, cote * (l / 2 + 0.004)), U, N);
    for (const [u, longueur] of liste) d.trait(flanc(decaler(rectangle(longueur, 0.06, 0.03, 2), u, 0)), B, fin, true);
  }
  plaque(d, rectangle(l - 0.04, h - 0.04, r - 0.02), ep - 0.01, centre.clone().addScaledVector(N, 0.005), X, U);
  return d.finir(new THREE.Group());
}

// -------------------------------------------------------------------- la planète
// Méridiens et parallèles sur une sphère qui masque sa face cachée ; un liseré qui suit le
// contour vu de la caméra, avec deux arcs orangés ; des particules en orbite.
function planete(rayon) {
  const groupe = new THREE.Group(), globe = new THREE.Group(), fin = 0.03;
  const d = dessin();
  for (let k = 0; k < 9; k++) {
    const phi = k * 20 * RAD, pts = [];
    for (let j = 0; j < 72; j++) { const t = j / 72 * 2 * Math.PI; pts.push(V(rayon * Math.cos(t) * Math.cos(phi), rayon * Math.sin(t), rayon * Math.cos(t) * Math.sin(phi))); }
    d.trait(pts, B, fin, true);
  }
  for (const lat of [-75, -60, -40, -20, 0, 20, 40, 60, 75, 84]) {
    const rr = rayon * Math.cos(lat * RAD), y = rayon * Math.sin(lat * RAD), n = Math.max(16, Math.round(72 * Math.cos(lat * RAD))), pts = [];
    for (let j = 0; j < n; j++) { const t = j / n * 2 * Math.PI; pts.push(V(rr * Math.cos(t), y, rr * Math.sin(t))); }
    d.trait(pts, B, fin, true);
  }
  d.volume(new THREE.SphereGeometry(rayon - 0.08, 48, 32));
  d.finir(globe);
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

  // les particules : une coquille autour de la planète, quelques-unes orangées ou blanches
  const n = 900, pos = new Float32Array(n * 3), coul = new Float32Array(n * 3), phase = new Float32Array(n);
  const teintes = [B, B, B, B, B, B, '#FFFFFF', '#FFFFFF', R].map(c => new THREE.Color().setHex(parseInt(c.slice(1), 16), THREE.LinearSRGBColorSpace));
  for (let k = 0; k < n; k++) {
    const u = Math.random() * 2 - 1, t = Math.random() * 2 * Math.PI, r = rayon * (1.08 + 0.75 * Math.random() ** 2), s = Math.sqrt(1 - u * u);
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
        vEclat = 0.55 + 0.45 * sin(uTemps * 1.6 + phase * 6.2832);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uEchelle / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      varying vec3 vCouleur; varying float vEclat;
      #include <fog_pars_fragment>
      void main() {
        float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5)) * vEclat;
        gl_FragColor = vec4(vCouleur * 1.6, a);
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
    taille(echelle) { matiere.uniforms.uEchelle.value = 0.22 * echelle; },
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

// -------------------------------------------------------------------- mise en place
// poses : appareils { position, cap, echelle }, planete { centre, rayon }, batiment { entree, sens }
export function creerObjets(scene, poses, outils) {
  ({ dessin } = outils);
  ({ bleu: B, rouge: R } = outils.couleurs);
  // l'accueil : l'ordinateur, le smartphone et la tablette, dans le virage de l'autoroute
  const appareils = new THREE.Group();
  poser(appareils, ordinateur(), [-4.4, 0, 0.6], 0.35);
  poser(appareils, appareil({ l: 1.75, h: 3.6, ep: 0.17, r: 0.3, inclinaison: 10, ecran: 0.09, encoche: true, boutonsG: [[0.95, 0.42], [0.42, 0.42]], boutonsD: [[0.7, 0.62]] }), [1.3, 0, 2.2], 0.3);
  poser(appareils, appareil({ l: 5.4, h: 3.8, ep: 0.14, r: 0.32, inclinaison: 14, ecran: 0.26, boutonsD: [[1.1, 0.5], [0.45, 0.5]] }), [6.2, 0, -0.2], -0.6);
  appareils.scale.setScalar(poses.appareils.echelle);
  poser(scene, appareils, poses.appareils.position, poses.appareils.cap);

  // les 17 millions d'utilisateurs : la planète au-dessus du croisement
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
    animer: (temps, camera, anime) => terre.animer(temps, camera, anime),
    taille: (echelle) => terre.taille(echelle),
  };
}
