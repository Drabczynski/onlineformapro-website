// Les scènes 3D de l'ouverture, à valider avant l'animation complète : l'open space, la
// salle de formation en îlots, le siège, et le Ó final dessiné comme un échangeur.
//
// Même moteur et même langage que l'ouverture : formes low poly à facettes (ombrage plat),
// arêtes lumineuses, traces de lumière posées au sol. Chaque scène tourne doucement autour
// de sa structure au fil du défilement (la caméra suit la position de la carte dans
// l'écran) ; le Ó part d'une vue rasante, façon échangeur, et se révèle vu du dessus.
//
// Animations réduites (réglage du système, ou choix retenu par l'ouverture) : caméra fixe
// de trois quarts, ni éclats ni dérive ; le Ó est montré vu du dessus.
import * as THREE from 'three';

let anime = true;
try { const v = localStorage.getItem('ofp-animations'); anime = v ? v === 'oui' : !matchMedia('(prefers-reduced-motion: reduce)').matches; }
catch (e) { anime = !matchMedia('(prefers-reduced-motion: reduce)').matches; }

const C = {
  sol: '#232D96', mur: '#3442B8', meuble: '#3B47B8', plateau: '#ECE9FF', fonce: '#1A2272', tete: '#EADFF7',
  lilas: '#B9A2FF', rose: '#FF8FB1', rouge: '#D31E44', corail: '#FF6B5B', ambre: '#FFB648',
  cyan: '#47D7FF', bleu: '#3D7BFF', vert: '#2FBF9B', vert2: '#23A487',
};
const HAUTS = [C.corail, C.ambre, C.cyan, C.rose, C.lilas, '#F4F2FF', C.bleu, '#FF9F6B'];
const alea = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// -------------------------------------------------------------------- matériaux
const memo = new Map();
function mat(couleur, options = {}) {
  const cle = couleur + JSON.stringify(options);
  if (!memo.has(cle)) memo.set(cle, new THREE.MeshStandardMaterial({ color: couleur, flatShading: true, roughness: 0.78, metalness: 0.04, ...options }));
  return memo.get(cle);
}
const eclaire = (couleur) => new THREE.MeshBasicMaterial({ color: couleur, toneMapped: false });
const verre = new THREE.MeshStandardMaterial({ color: '#9DB8FF', transparent: true, opacity: 0.14, roughness: 0.1,
  metalness: 0.3, depthWrite: false, side: THREE.DoubleSide });

function aretes(mesh, couleur = C.cyan, opacite = 0.35) {
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25),
    new THREE.LineBasicMaterial({ color: couleur, transparent: true, opacity: opacite })));
  return mesh;
}
// une boîte posée : [x, y, z] est le milieu de sa base
function boite(parent, [l, h, p], materiau, [x, y, z], arete) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), materiau);
  m.position.set(x, y + h / 2, z);
  if (arete) aretes(m, ...arete);
  parent.add(m);
  return m;
}
function cylindre(parent, [r1, r2, h, cotes], materiau, [x, y, z], arete) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, cotes), materiau);
  m.position.set(x, y + h / 2, z);
  if (arete) aretes(m, ...arete);
  parent.add(m);
  return m;
}

// -------------------------------------------------------------------- personnages et mobilier
// une personne low poly, tournée vers +z (angle : rotation autour de la verticale)
function personne(parent, { x, z, angle = 0, assise = false, haut = C.corail, siege = 'chaise' }) {
  const g = new THREE.Group(), jambes = mat(C.fonce);
  if (assise) {
    if (siege === 'chaise') {
      boite(g, [0.46, 0.06, 0.44], mat(C.meuble), [0, 0.4, 0.02]);
      boite(g, [0.46, 0.5, 0.06], mat(C.meuble), [0, 0.46, -0.2]);
      boite(g, [0.06, 0.4, 0.06], mat(C.fonce), [0, 0, 0]);
    } else {
      cylindre(g, [0.22, 0.22, 0.06, 6], mat(C.meuble), [0, 0.4, 0]);
      cylindre(g, [0.04, 0.04, 0.4, 5], mat(C.fonce), [0, 0, 0]);
    }
    boite(g, [0.34, 0.13, 0.42], jambes, [0, 0.46, 0.14]);
    boite(g, [0.3, 0.46, 0.13], jambes, [0, 0, 0.3]);
  } else {
    boite(g, [0.14, 0.8, 0.17], jambes, [-0.09, 0, 0]);
    boite(g, [0.14, 0.8, 0.17], jambes, [0.09, 0, 0]);
  }
  const y = assise ? 0.5 : 0.8;
  cylindre(g, [0.16, 0.21, 0.6, 6], mat(haut), [0, y, 0]);
  const tete = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), mat(C.tete));
  tete.position.y = y + 0.8;
  g.add(tete);
  g.position.set(x, 0, z);
  g.rotation.y = angle;
  parent.add(g);
  return g;
}

function bureau(parent, x, z, angle, couleurEcran) {
  const g = new THREE.Group();
  boite(g, [1.3, 0.05, 0.7], mat(C.plateau), [0, 0.7, 0], [C.cyan, 0.22]);
  boite(g, [0.05, 0.7, 0.6], mat(C.meuble), [-0.6, 0, 0]);
  boite(g, [0.05, 0.7, 0.6], mat(C.meuble), [0.6, 0, 0]);
  boite(g, [0.06, 0.16, 0.06], mat(C.meuble), [0, 0.75, -0.2]);
  const ecran = boite(g, [0.64, 0.38, 0.03], mat(C.fonce), [0, 0.88, -0.2]);
  const dalle = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.32), eclaire(couleurEcran));
  dalle.position.z = 0.017;
  ecran.add(dalle);
  boite(g, [0.42, 0.02, 0.14], mat('#B9B6E8'), [0, 0.75, 0.1]);
  g.position.set(x, 0, z);
  g.rotation.y = angle;
  parent.add(g);
}

// un îlot de quatre bureaux face à face, chacun occupé
function ilotBureaux(parent, cx, cz, n0) {
  [-0.68, 0.68].forEach((dx, a) => {
    const k = n0 + a * 2;
    bureau(parent, cx + dx, cz + 0.36, 0, [C.cyan, C.rose, C.lilas][k % 3]);
    personne(parent, { x: cx + dx, z: cz + 0.36 + 0.62, angle: Math.PI, assise: true, haut: HAUTS[k % HAUTS.length] });
    bureau(parent, cx + dx, cz - 0.36, Math.PI, [C.lilas, C.cyan, C.rose][k % 3]);
    personne(parent, { x: cx + dx, z: cz - 0.36 - 0.62, angle: 0, assise: true, haut: HAUTS[(k + 3) % HAUTS.length] });
  });
}

function portable(parent, x, z, angle, couleur) {
  const g = new THREE.Group();
  boite(g, [0.36, 0.02, 0.25], mat('#C9C6F2'), [0, 0, 0]);
  const charniere = new THREE.Group();
  charniere.position.set(0, 0.02, -0.125);
  charniere.rotation.x = -0.28;
  const dalle = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.23, 0.015), mat('#C9C6F2'));
  dalle.position.y = 0.115;
  charniere.add(dalle);
  const lum = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.19), eclaire(couleur));
  lum.position.set(0, 0.115, 0.009);
  charniere.add(lum);
  g.add(charniere);
  g.position.set(x, 0.77, z);
  g.rotation.y = angle;
  parent.add(g);
}

// une table hexagonale, ses apprenants tout autour, chacun devant son portable
function ilotFormation(parent, cx, cz, n, graine) {
  cylindre(parent, [1.05, 1.05, 0.06, 6], mat(C.plateau), [cx, 0.71, cz], [C.cyan, 0.28]);
  cylindre(parent, [0.16, 0.24, 0.71, 6], mat(C.meuble), [cx, 0, cz]);
  for (let k = 0; k < n; k++) {
    const a = k * Math.PI * 2 / n + Math.PI / n + graine;
    const s = Math.sin(a), c = Math.cos(a);
    portable(parent, cx + 0.64 * s, cz + 0.64 * c, a, [C.cyan, C.rose, C.ambre, C.lilas][(k + graine * 7 | 0) % 4]);
    personne(parent, { x: cx + 1.42 * s, z: cz + 1.42 * c, angle: a + Math.PI, assise: true, siege: 'tabouret',
      haut: HAUTS[(k * 3 + (graine * 10 | 0)) % HAUTS.length] });
  }
  // la suspension au-dessus de l'îlot
  cylindre(parent, [0.42, 0.3, 0.12, 8], eclaire('#FFE0B0'), [cx, 2.75, cz]);
  boite(parent, [0.02, 0.8, 0.02], mat(C.fonce), [cx, 2.87, cz]);
  const lampe = new THREE.PointLight('#FFD8A8', 6, 5, 1.6);
  lampe.position.set(cx, 2.6, cz);
  parent.add(lampe);
}

function plante(parent, x, z, taille = 1) {
  cylindre(parent, [0.22 * taille, 0.17 * taille, 0.42 * taille, 6], mat(C.plateau), [x, 0, z]);
  const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42 * taille, 0), mat(alea(x, z) > 0.5 ? C.vert : C.vert2));
  f.position.set(x, 0.42 * taille + 0.36 * taille, z);
  f.rotation.set(alea(x, 1), alea(z, 2), 0);
  parent.add(f);
}
function arbre(parent, x, z, taille = 1) {
  cylindre(parent, [0.08 * taille, 0.11 * taille, 0.7 * taille, 5], mat('#3A2F86'), [x, 0, z]);
  const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62 * taille, 0), mat(alea(x, z) > 0.5 ? C.vert : C.vert2));
  f.position.set(x, 0.7 * taille + 0.5 * taille, z);
  f.rotation.set(alea(x, 3), alea(z, 4), 0);
  parent.add(f);
}

// un mur bas vitré, construit le long de x, puis tourné
function mur(parent, long, [x, z], rotation) {
  const g = new THREE.Group(), H = 2.6, e = 0.16, m = mat(C.mur);
  boite(g, [long, 0.95, e], m, [0, 0, 0], [C.lilas, 0.35]);
  boite(g, [long, 0.28, e], m, [0, H - 0.28, 0], [C.lilas, 0.35]);
  const n = Math.max(2, Math.round(long / 2.2));
  for (let k = 0; k <= n; k++) boite(g, [0.12, H - 1.23, e], m, [-long / 2 + 0.06 + k * (long - 0.12) / n, 0.95, 0]);
  const vitre = new THREE.Mesh(new THREE.BoxGeometry(long, H - 1.23, 0.03), verre);
  vitre.position.y = 0.95 + (H - 1.23) / 2;
  g.add(vitre);
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  parent.add(g);
}
// le sol et deux murs (fond et gauche) : une salle en coupe, comme une maquette
function salle(parent, l, p) {
  boite(parent, [l, 0.3, p], mat(C.sol), [0, -0.3, 0], [C.lilas, 0.5]);
  mur(parent, l, [0, -p / 2 + 0.08], 0);
  mur(parent, p, [-l / 2 + 0.08, 0], Math.PI / 2);
}

// un écran mural, dessiné dans une texture (tableau de bord ou cours en vidéo)
function ecranMural(parent, [l, h], [x, y, z], rotation, sorte) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = Math.round(640 * h / l);
  const g = c.getContext('2d'), W = c.width, H = c.height;
  g.fillStyle = '#0B1050'; g.fillRect(0, 0, W, H);
  g.fillStyle = C.rouge; g.fillRect(0, 0, W, 30);
  const rr = (x0, y0, w, hh, r, couleur) => { g.fillStyle = couleur; g.beginPath(); g.roundRect(x0, y0, w, hh, r); g.fill(); };
  if (sorte === 'tableau') {
    [[24, C.cyan], [232, C.rose], [440, C.ambre]].forEach(([x0, col]) => {
      rr(x0, 52, 176, 86, 12, '#1C2588');
      rr(x0 + 16, 106, 144 * (0.45 + 0.4 * alea(x0, 1)), 12, 6, col);
      rr(x0 + 16, 70, 70, 20, 6, '#E9E6FF');
    });
    rr(24, 158, 384, H - 182, 12, '#1C2588');
    g.strokeStyle = C.cyan; g.lineWidth = 5; g.beginPath();
    for (let k = 0; k <= 12; k++) g.lineTo(44 + k * 28, H - 50 - 90 * (0.3 + 0.6 * alea(k, 5)) * (k / 12 * 0.6 + 0.4));
    g.stroke();
    rr(428, 158, 188, H - 182, 12, '#1C2588');
    for (let k = 0; k < 5; k++) rr(448 + k * 33, H - 46 - 120 * alea(k, 6), 20, 120 * alea(k, 6), 4, k % 2 ? C.lilas : C.rose);
  } else {
    rr(24, 48, 410, H - 96, 14, '#26318F');
    g.fillStyle = '#E9E6FF'; g.beginPath(); g.moveTo(206, H / 2 - 30); g.lineTo(206, H / 2 + 30); g.lineTo(256, H / 2); g.fill();
    rr(24, H - 34, 410, 10, 5, '#1C2588'); rr(24, H - 34, 250, 10, 5, C.rouge);
    for (let k = 0; k < 5; k++) { rr(454, 48 + k * 44, 162, 32, 8, k === 1 ? '#3A47BC' : '#1C2588'); rr(468, 60 + k * 44, 90, 8, 4, k === 1 ? C.ambre : '#8C93D8'); }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const cadre = boite(parent, [l + 0.12, h + 0.12, 0.08], mat(C.fonce), [0, 0, 0], [C.cyan, 0.5]);
  const dalle = new THREE.Mesh(new THREE.PlaneGeometry(l, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  dalle.position.z = 0.045;
  cadre.add(dalle);
  const support = new THREE.Group();
  support.add(cadre);
  cadre.position.set(0, 0, 0);
  support.position.set(x, y, z);
  support.rotation.y = rotation;
  parent.add(support);
}

// -------------------------------------------------------------------- traces de lumière au sol
function reechantillonne(pts, n) {
  const long = [0];
  for (let k = 1; k < pts.length; k++) long.push(long[k - 1] + Math.hypot(...pts[k].map((v, d) => v - pts[k - 1][d])));
  const total = long[long.length - 1], out = [];
  let k = 1;
  for (let j = 0; j < n; j++) {
    const cible = total * j / (n - 1);
    while (k < long.length - 1 && long[k] < cible) k++;
    const f = (cible - long[k - 1]) / (long[k] - long[k - 1] || 1);
    out.push(pts[k - 1].map((v, d) => v + (pts[k][d] - v) * f));
  }
  return out;
}
function spline(pts, n) {
  const dense = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[s + 1], p3 = pts[Math.min(pts.length - 1, s + 2)];
    for (let k = 0; k < 30; k++) {
      const t = k / 30, t2 = t * t, t3 = t2 * t;
      dense.push(p1.map((_, d) => 0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t +
        (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  dense.push(pts[pts.length - 1]);
  return reechantillonne(dense, n);
}
const arc = (cx, cz, r, a0, a1, n = 48) => Array.from({ length: n + 1 }, (_, k) => {
  const a = a0 + (a1 - a0) * k / n;
  return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
});

const nuanceur = {
  vertexShader: `
    attribute float u; attribute float cote; varying float vU; varying float vC;
    void main() { vU = u; vC = cote; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 colA; uniform vec3 colB; uniform float temps; uniform float graine; uniform float eclats; uniform float vitesse;
    varying float vU; varying float vC;
    void main() {
      float s = vC;
      float coeur = exp(-s * s * 36.0);
      float halo = exp(-s * s * 3.2) * 0.32;
      float bouts = smoothstep(0.0, 0.05, vU) * smoothstep(1.0, 0.95, vU);
      float p = fract(vU * 2.5 - temps * vitesse + graine);
      float eclat = eclats * smoothstep(0.0, 0.03, p) * smoothstep(0.2, 0.03, p);
      vec3 c = mix(colA, colB, vU);
      c = mix(c, vec3(1.0), coeur * 0.45);
      gl_FragColor = vec4(c, (coeur * 1.1 + halo) * (0.75 + 1.1 * eclat) * bouts);
    }`,
};
// une trace posée à plat : points [x, z] (lissés, ou suivis tels quels si brut), à la hauteur y
function trace(scene, pts2d, { y = 0.03, largeur = 0.18, couleurs = [C.rouge, C.ambre], n = 260, brut = false, vitesse = 0.1, graine = 0 }) {
  const pts3 = pts2d.map(([x, z]) => [x, y, z]);
  const pts = brut ? reechantillonne(pts3, n) : spline(pts3, n);
  const pos = new Float32Array(n * 6), u = new Float32Array(n * 2), cote = new Float32Array(n * 2), idx = [];
  for (let j = 0; j < n; j++) {
    const a = pts[Math.max(0, j - 1)], b = pts[Math.min(n - 1, j + 1)];
    let tx = b[0] - a[0], tz = b[2] - a[2];
    const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    for (const [o, sg] of [[0, -1], [1, 1]]) {
      pos[(2 * j + o) * 3] = pts[j][0] - tz * largeur * sg;
      pos[(2 * j + o) * 3 + 1] = pts[j][1];
      pos[(2 * j + o) * 3 + 2] = pts[j][2] + tx * largeur * sg;
      u[2 * j + o] = j / (n - 1);
      cote[2 * j + o] = sg;
    }
    if (j < n - 1) { const q = 2 * j; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('u', new THREE.BufferAttribute(u, 1));
  g.setAttribute('cote', new THREE.BufferAttribute(cote, 1));
  g.setIndex(idx);
  const m = new THREE.ShaderMaterial({ ...nuanceur, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, uniforms: { colA: { value: new THREE.Color(couleurs[0]) }, colB: { value: new THREE.Color(couleurs[1]) },
      temps: { value: 0 }, graine: { value: graine }, eclats: { value: 1 }, vitesse: { value: vitesse } } });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  scene.add(mesh);
  return m;
}

// -------------------------------------------------------------------- les scènes
function lumieres(scene) {
  scene.add(new THREE.HemisphereLight('#A9B6FF', '#1A1260', 1.5));
  const soleil = new THREE.DirectionalLight('#FFE6D2', 2.2);
  soleil.position.set(6, 12, 9);
  scene.add(soleil);
  const contre = new THREE.DirectionalLight('#FF8FB1', 0.9);
  contre.position.set(-8, 5, -9);
  scene.add(contre);
}
// la caméra tourne autour de la cible au fil du défilement (p : 0 → 1)
function orbite(cible, rayon, hauteur, angle, amplitude = 0.9) {
  return (cam, p, t) => {
    const a = angle + (p - 0.5) * amplitude + Math.sin(t * 0.15) * 0.03;
    const r = rayon * (cam.aspect < 1 ? 1.12 : 1);
    cam.position.set(cible[0] + r * Math.sin(a), hauteur * (cam.aspect < 1 ? 1.15 : 1), cible[2] + r * Math.cos(a));
    cam.up.set(0, 1, 0);
    cam.lookAt(...cible);
  };
}

// A · l'open space : îlots de bureaux, salle de réunion vitrée, écran de pilotage, coin d'échange
function openSpace(scene) {
  const g = new THREE.Group(), mats = [];
  scene.add(g);
  salle(g, 17, 11.5);
  ilotBureaux(g, -4.6, -1.6, 0);
  ilotBureaux(g, 0.2, -1.6, 1);
  ilotBureaux(g, -2.2, 2.4, 2);
  // l'écran de pilotage sur le mur du fond, et deux personnes qui le commentent
  ecranMural(g, [3.4, 1.9], [-2.4, 1.5, -5.55], 0, 'tableau');
  personne(g, { x: -0.3, z: -4.3, angle: -2.6, haut: C.ambre });
  personne(g, { x: 0.5, z: -4.0, angle: 2.8, haut: C.cyan });
  // la salle de réunion vitrée
  const salleR = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.3), verre);
  salleR.position.set(5.9, 1.2, -3.8);
  aretes(salleR, C.cyan, 0.75);
  g.add(salleR);
  boite(g, [2.2, 0.05, 1.1], mat(C.plateau), [5.9, 0.72, -3.8], [C.cyan, 0.3]);
  boite(g, [0.3, 0.72, 0.3], mat(C.meuble), [5.9, 0, -3.8]);
  personne(g, { x: 5.2, z: -2.75, angle: Math.PI, assise: true, haut: C.rose });
  personne(g, { x: 6.6, z: -2.75, angle: Math.PI, assise: true, haut: C.lilas });
  personne(g, { x: 5.9, z: -4.85, angle: 0, assise: true, haut: C.corail });
  // le coin d'échange : table haute, deux personnes debout, un canapé
  cylindre(g, [0.45, 0.45, 0.05, 8], mat(C.plateau), [4.6, 1.05, 2.4], [C.cyan, 0.3]);
  cylindre(g, [0.06, 0.06, 1.05, 6], mat(C.meuble), [4.6, 0, 2.4]);
  personne(g, { x: 4.0, z: 2.9, angle: 2.2, haut: '#F4F2FF' });
  personne(g, { x: 5.2, z: 3.0, angle: -2.3, haut: C.corail });
  boite(g, [2.4, 0.42, 0.9], mat(C.lilas), [6.8, 0, 4.6]);
  boite(g, [2.4, 0.5, 0.25], mat(C.lilas), [6.8, 0.42, 5.0]);
  [[-7.6, -5.0], [7.7, 0.4], [2.6, 5.1], [-7.6, 5.0], [-0.3, -5.0]].forEach(([x, z], k) => plante(g, x, z, k === 4 ? 0.8 : 1));
  // les traces : elles entrent dans la salle, passent entre les îlots et rejoignent l'écran
  mats.push(trace(scene, [[-22, 6], [-9, 4.6], [-4.4, 0.4], [-1.9, 0.3], [2.6, 0.4], [3.4, -2.2], [1.6, -4.6], [-2.4, -4.9]],
    { couleurs: [C.bleu, C.cyan], graine: 0.1 }));
  mats.push(trace(scene, [[-20, 9], [-6, 5.2], [0.4, 4.6], [3.1, 2.6], [2.9, -0.2], [9, -0.4], [24, -2]],
    { couleurs: [C.rouge, C.ambre], graine: 0.5 }));
  mats.push(trace(scene, [[24, 7], [10, 6.4], [3.2, 5.3], [-0.6, 0.6], [-6.8, 0.2], [-7.4, -3.6], [-12, -10]],
    { couleurs: [C.rose, C.lilas], graine: 0.8, vitesse: 0.07 }));
  return { mats, cadrer: orbite([0, 0.2, 0.4], 23, 13.5, 0.62) };
}

// B · la salle de formation : îlots hexagonaux, grand écran, formatrice, suspensions
function salleFormation(scene) {
  const g = new THREE.Group(), mats = [];
  scene.add(g);
  salle(g, 16, 12);
  ecranMural(g, [4.4, 2.3], [0, 1.5, -5.78], 0, 'cours');
  personne(g, { x: 2.9, z: -4.6, angle: -0.35, haut: C.rouge });
  boite(g, [0.3, 0.02, 0.22], eclaire(C.cyan), [3.05, 1.12, -4.35]);
  const ilots = [[-4.3, -1.5, 4], [0.1, -1.0, 5], [4.5, -1.5, 4], [-2.1, 3.1, 5], [2.6, 3.2, 4]];
  ilots.forEach(([x, z, n], k) => ilotFormation(g, x, z, n, k * 0.37));
  [[-7.2, -5.3], [7.3, -5.3], [7.3, 5.3]].forEach(([x, z]) => plante(g, x, z));
  // depuis l'écran, une trace vers chaque îlot
  ilots.forEach(([x, z], k) => mats.push(trace(scene, [[0.6 * (k - 2), -5.3], [x * 0.5, (z - 5.3) / 2 - 0.4], [x, z - 1.6],
    [x + 1.7 * Math.sign(x || 1), z], [x * 2.6 + (k - 2) * 2, z + 9]],
    { couleurs: [[C.rouge, C.ambre], [C.cyan, C.bleu], [C.rose, C.lilas], [C.ambre, C.corail], [C.bleu, C.cyan]][k], graine: k * 0.23, largeur: 0.11 })));
  return { mats, cadrer: orbite([0, 0.5, 0.3], 22.5, 13, 0.6) };
}

// C · le siège : une tour vitrée et son aile, la place, les arbres, et les routes de lumière
function facade(colonnes, graine) {
  const c = document.createElement('canvas');
  c.width = colonnes * 20; c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = '#141B6E'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < colonnes; i++) {
    const v = alea(i, graine);
    g.fillStyle = v < 0.42 ? '#FFD39A' : v < 0.62 ? '#A8EBFF' : '#2A3594';
    g.fillRect(i * 20 + 3, 5, 14, 22);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function etage(parent, [l, h, p], [x, y, z], graine) {
  const face = (col, k) => { const t = facade(col, graine * 13 + k); return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t,
    emissive: '#ffffff', emissiveIntensity: 0.8, roughness: 0.35, metalness: 0.25, flatShading: true }); };
  const cx = Math.round(p * 2.4), cl = Math.round(l * 2.4), toit = mat(C.mur);
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), [face(cx, 1), face(cx, 2), toit, toit, face(cl, 3), face(cl, 4)]);
  m.position.set(x, y + h / 2, z);
  parent.add(m);
  boite(parent, [l + 0.14, 0.1, p + 0.14], mat('#D9D6FF'), [x, y + h, z]);
}
function siege(scene) {
  const g = new THREE.Group(), mats = [];
  scene.add(g);
  boite(g, [26, 0.4, 19], mat(C.sol), [0, -0.4, 0], [C.lilas, 0.45]);
  boite(g, [11, 0.06, 6.2], mat('#3A47BC'), [0.8, 0, 4.1]);
  // la tour : huit étages vitrés, et le Ó rouge au sommet
  for (let k = 0; k < 8; k++) etage(g, [6, 0.95, 4.4], [-2, 0.06 + k * 1.05, -1.2], k + 1);
  const haut = 0.06 + 8 * 1.05;
  boite(g, [1.6, 0.6, 1.2], mat(C.meuble), [-3.2, haut, -2], [C.cyan, 0.3]);
  boite(g, [1.0, 0.4, 0.9], mat(C.meuble), [-0.6, haut, -2.2], [C.cyan, 0.3]);
  const signe = new THREE.Group();
  const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.17, 6, 20), eclaire(C.rouge));
  signe.add(anneau);
  const barre = new THREE.Mesh(new THREE.BoxGeometry(1.17, 0.36, 0.12), eclaire(C.rouge));
  barre.position.set(-0.37, 1.08, 0);
  barre.rotation.z = 0.51;
  signe.add(barre);
  signe.scale.setScalar(0.8);
  signe.position.set(-2, haut - 1.35, -1.2 + 2.28);
  g.add(signe);
  // l'aile basse, l'auvent de l'entrée
  for (let k = 0; k < 2; k++) etage(g, [7, 0.95, 3.6], [4.6, 0.06 + k * 1.05, -1.6], 20 + k);
  boite(g, [3.2, 0.12, 1.6], mat('#D9D6FF'), [-2, 2.2, 1.6], [C.cyan, 0.4]);
  boite(g, [0.1, 2.2, 0.1], mat(C.meuble), [-3.4, 0, 2.2]);
  boite(g, [0.1, 2.2, 0.1], mat(C.meuble), [-0.6, 0, 2.2]);
  // la place : arbres, quelques personnes
  [[-9.8, 6.4], [-7.4, 7.6], [9.6, 6.6], [7.2, 7.8], [-10.5, -5.6], [10.5, -6.4], [-10.6, 0.4], [10.8, 1.6]].forEach(([x, z]) => arbre(g, x, z, 1.1));
  personne(g, { x: -1.2, z: 3.6, angle: 2.6, haut: C.ambre });
  personne(g, { x: -0.4, z: 3.9, angle: -2.4, haut: C.cyan });
  personne(g, { x: 3.3, z: 5.4, angle: 0.4, haut: C.rose });
  personne(g, { x: 5.6, z: 3.2, angle: -1.2, haut: '#F4F2FF' });
  // les routes de lumière : une boucle autour de l'îlot, deux voies qui filent vers l'horizon
  const boucle = (decal) => { const pts = []; const [L, P, R] = [11 + decal, 8 + decal, 2.4];
    [[L - R, P - R, 0], [-L + R, P - R, 0.5], [-L + R, -P + R, 1], [L - R, -P + R, 1.5]].forEach(([cx, cz, q]) =>
      pts.push(...arc(cx, cz, R, q * Math.PI, (q + 0.5) * Math.PI, 10)));
    pts.push(pts[0], pts[1]);
    return pts; };
  mats.push(trace(scene, boucle(0.6), { y: 0.03, couleurs: [C.rouge, C.ambre], brut: true, n: 400, graine: 0.2, largeur: 0.12 }));
  mats.push(trace(scene, boucle(1.1), { y: 0.03, couleurs: [C.bleu, C.cyan], brut: true, n: 400, graine: 0.6, largeur: 0.12, vitesse: -0.08 }));
  mats.push(trace(scene, [[-40, 12.4], [-12.4, 9.6], [-6, 9.0], [6, 9.0], [12.4, 9.6], [40, 12.4]], { couleurs: [C.ambre, C.rouge], graine: 0.4 }));
  mats.push(trace(scene, [[14.4, -40], [12.6, -12], [12.1, 0], [12.6, 12], [14.4, 40]], { couleurs: [C.cyan, C.rose], graine: 0.9 }));
  return { mats, cadrer: orbite([0, 3.2, 0], 33, 15, 0.7, 1.0) };
}

// D · le Ó final, dessiné comme un échangeur : le O est un anneau routier à quatre voies,
// l'accent une chaussée en forme de pilule posée sur une route droite qui file vers
// l'horizon des deux côtés, et deux bretelles montent du bas pour rejoindre l'anneau en
// tangente, l'une par la droite, l'autre par la gauche
function logo(scene) {
  const mats = [], R = 4;
  const sol = ([lx, ly]) => [lx, -ly];          // le logo à plat : son « haut » regarde vers -z
  [0.42, 0.61, 0.8, 1].forEach((f, k) => {
    const tour = Math.PI * 2 / 0.9, a0 = 2.2 + k * 0.9;
    mats.push(trace(scene, Array.from({ length: 160 }, (_, j) => { const a = a0 + tour * j / 159; return sol([R * f * Math.cos(a), R * f * Math.sin(a)]); }),
      { brut: true, n: 320, largeur: 0.13, couleurs: [[C.rouge, C.corail], [C.corail, C.ambre], [C.ambre, C.rouge], [C.rouge, C.rose]][k], graine: k * 0.27 }));
  });
  const p1 = [-1.311 * R, 1.191 * R], p2 = [0.209 * R, 2.046 * R], e = 0.267 * R;
  const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), dir = [(p2[0] - p1[0]) / d, (p2[1] - p1[1]) / d], n = [-dir[1], dir[0]];
  const ang = Math.atan2(n[1], n[0]);
  const pilule = (h) => {
    const pts = [[p1[0] + n[0] * h, p1[1] + n[1] * h], [p2[0] + n[0] * h, p2[1] + n[1] * h]];
    pts.push(...arc(p2[0], p2[1], h, ang, ang - Math.PI, 20).slice(1));
    pts.push([p1[0] - n[0] * h, p1[1] - n[1] * h]);
    pts.push(...arc(p1[0], p1[1], h, ang + Math.PI, ang, 20).slice(1));
    pts.push(pts[1]);
    return pts.map(sol);
  };
  mats.push(trace(scene, pilule(e), { brut: true, n: 300, largeur: 0.13, couleurs: [C.rouge, C.corail], graine: 0.15 }));
  mats.push(trace(scene, pilule(e * 0.45), { brut: true, n: 300, largeur: 0.12, couleurs: [C.ambre, C.rouge], graine: 0.55 }));
  // la route de l'accent : elle prolonge la pilule de chaque côté, jusqu'à l'horizon
  const droite = (p, sens) => [0.4, 6, 18, 44].map(k => sol([p[0] + dir[0] * k * sens, p[1] + dir[1] * k * sens]));
  mats.push(trace(scene, droite(p1, -1), { brut: true, couleurs: [C.rose, C.bleu], graine: 0.5 }));
  mats.push(trace(scene, droite(p2, 1), { brut: true, couleurs: [C.rose, C.bleu], graine: 0.9 }));
  // les bretelles : elles arrivent du bas en ligne droite, touchent l'anneau extérieur en
  // tangente (à 315° par la droite, à 225° par la gauche) et le suivent sur un bon tiers
  const bretelle = (theta, sens) => {
    const t = [-Math.sin(theta) * sens, Math.cos(theta) * sens], P = [R * Math.cos(theta), R * Math.sin(theta)];
    const pts = [40, 14, 4].map(k => [P[0] - t[0] * k, P[1] - t[1] * k]);
    pts.push(...Array.from({ length: 40 }, (_, j) => { const a = theta + sens * 2.1 * j / 39; return [R * Math.cos(a), R * Math.sin(a)]; }));
    return pts.map(sol);
  };
  mats.push(trace(scene, bretelle(-Math.PI / 4, 1), { brut: true, n: 300, couleurs: [C.bleu, C.cyan], graine: 0.3 }));
  mats.push(trace(scene, bretelle(Math.PI * 1.25, -1), { brut: true, n: 300, couleurs: [C.cyan, C.bleu], graine: 0.7 }));
  // la caméra : vue rasante d'échangeur, puis elle monte et se place au-dessus du Ó
  const centre = new THREE.Vector3(-0.8, 0, -2.6), haut = new THREE.Vector3(), cam0 = new THREE.Vector3(), cam1 = new THREE.Vector3();
  return {
    mats,
    cadrer: (cam, p, t) => {
      const q = anime ? Math.min(1, Math.max(0, (p - 0.15) / 0.6)) : 1, e2 = q * q * (3 - 2 * q);
      const loin = cam.aspect < 1 ? 1.15 : 1;
      const elev = 0.2 + (Math.PI / 2 - 0.2) * e2, az = 0.75 * (1 - e2) + Math.sin(t * 0.15) * 0.02 * (1 - e2), dist = (22 + 8 * e2) * loin;
      cam0.set(centre.x + dist * Math.cos(elev) * Math.sin(az), dist * Math.sin(elev), centre.z + dist * Math.cos(elev) * Math.cos(az));
      cam.position.copy(cam0);
      haut.set(0, 1, 0).lerp(cam1.set(0, 0, -1), Math.min(1, Math.max(0, (e2 - 0.6) / 0.4))).normalize();
      cam.up.copy(haut);
      cam.lookAt(centre);
    },
  };
}

// -------------------------------------------------------------------- mise en scène
const scenes = [];
function ajouter(id, construire) {
  const toile = document.getElementById(id);
  if (!toile) return;
  let rendu;
  try { rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true }); }
  catch (e) { toile.closest('figure')?.classList.add('sans-webgl'); return; }
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  lumieres(scene);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 300);
  const s = { toile, rendu, scene, camera, visible: false, l: 0, h: 0, ...construire(scene) };
  scenes.push(s);
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; demande(); }, { rootMargin: '100px' }).observe(toile);
}
function progression(el) {
  if (!anime) return 0.5;
  const r = el.getBoundingClientRect();
  return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
}
let enCours = false;
function demande() { if (!enCours) { enCours = true; requestAnimationFrame(image); } }
function image(ms) {
  enCours = false;
  const t = anime ? ms / 1000 : 0;
  for (const s of scenes) {
    if (!s.visible) continue;
    const l = s.toile.clientWidth, h = s.toile.clientHeight;
    if (l !== s.l || h !== s.h) {
      s.l = l; s.h = h;
      s.rendu.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      s.rendu.setSize(l, h, false);
      s.camera.aspect = l / h;
      s.camera.fov = l / h < 1 ? 42 : 30;
      s.camera.updateProjectionMatrix();
    }
    s.cadrer(s.camera, progression(s.toile), t);
    for (const m of s.mats) { m.uniforms.temps.value = t; m.uniforms.eclats.value = anime ? 1 : 0; }
    s.rendu.render(s.scene, s.camera);
  }
  if (anime && scenes.some(s => s.visible)) demande();
}
addEventListener('scroll', demande, { passive: true });
addEventListener('resize', demande);

ajouter('scene-open-space', openSpace);
ajouter('scene-formation', salleFormation);
ajouter('scene-siege', siege);
ajouter('scene-logo', logo);
demande();
// pour les captures de contrôle
window.__dessiner = (ms) => image(ms);
