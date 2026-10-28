// Les scènes de l'ouverture, à valider avant l'animation complète : l'open space, la salle
// de formation en îlots, le siège, et le Ó final dessiné comme un échangeur.
//
// 3D minimaliste, comme le camion du modèle : aucun volume plein, seulement des contours
// lumineux (plateaux, écrans, étages, routes), dessinés avec la même lumière que les traces
// de l'ouverture. Chaque contour est une polyligne 3D élargie face à la caméra à chaque
// image ; les contours se tracent quand la scène entre à l'écran, et la caméra tourne autour
// de la structure au fil du défilement. Le Ó part d'une vue d'échangeur et se révèle vu du
// dessus.
//
// Animations réduites (réglage du système, ou choix retenu par l'ouverture) : contours
// entiers d'emblée, caméra fixe de trois quarts, ni éclats ni dérive ; le Ó vu du dessus.
import * as THREE from 'three';

let anime = true;
try { const v = localStorage.getItem('ofp-animations'); anime = v ? v === 'oui' : !matchMedia('(prefers-reduced-motion: reduce)').matches; }
catch (e) { anime = !matchMedia('(prefers-reduced-motion: reduce)').matches; }

const C = {
  blanc: '#F1EEFF', lilas: '#B9A2FF', faible: '#6672D6', rose: '#FF8FB1', rouge: '#FF2D55', corail: '#FF6B5B',
  ambre: '#FFB648', cyan: '#47D7FF', bleu: '#3D7BFF', vert: '#2FBF9B',
};
const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
const alea = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// -------------------------------------------------------------------- tracés
const plus = (a, b, k = 1) => a.map((v, d) => v + b[d] * k);
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
const longueur = (pts) => pts.slice(1).reduce((s, p, k) => s + Math.hypot(...p.map((v, d) => v - pts[k][d])), 0);
function spline(pts, n = 200) {
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
// un rectangle arrondi dans le plan des axes u et v, centré en c (contour fermé)
function rect(c, u, v, l, p, r, n = 6) {
  const pts = [];
  [[1, 1, 0], [-1, 1, 1], [-1, -1, 2], [1, -1, 3]].forEach(([su, sv, q]) => {
    const o = plus(plus(c, u, su * (l / 2 - r)), v, sv * (p / 2 - r));
    for (let k = 0; k <= n; k++) { const a = (q + k / n) * Math.PI / 2; pts.push(plus(plus(o, u, r * Math.cos(a)), v, r * Math.sin(a))); }
  });
  return pts;
}
const cercle = (c, u, v, r, n = 40) => Array.from({ length: n }, (_, k) => {
  const a = k / n * Math.PI * 2;
  return plus(plus(c, u, r * Math.cos(a)), v, r * Math.sin(a));
});
const polygone = (c, u, v, r, cotes, rot = 0) => Array.from({ length: cotes }, (_, k) => {
  const a = rot + k / cotes * Math.PI * 2;
  return plus(plus(c, u, r * Math.cos(a)), v, r * Math.sin(a));
});
const tourne = (u, v, a) => [plus(u.map(x => x * Math.cos(a)), v, Math.sin(a)), plus(u.map(x => x * -Math.sin(a)), v, Math.cos(a))];
// les arêtes d'une forme three.js (un arbre en icosaèdre, par exemple), comme segments
function aretes(geometrie, c) {
  const p = new THREE.EdgesGeometry(geometrie).attributes.position.array, out = [];
  for (let k = 0; k < p.length; k += 6) out.push([plus(c, [p[k], p[k + 1], p[k + 2]]), plus(c, [p[k + 3], p[k + 4], p[k + 5]])]);
  return out;
}

// -------------------------------------------------------------------- les contours lumineux
// Chaque ligne : { pts, ferme, couleurs: [début, fin], largeur, retard (0 → 0,6 : quand elle se
// trace), vitesse (des éclats qui courent le long, pour les routes) }. Toutes les lignes
// d'une scène partagent un seul maillage ; maj(cam) les élargit face à la caméra.
const nuanceur = {
  vertexShader: `
    attribute float u; attribute float cote; attribute vec3 ca; attribute vec3 cb;
    attribute float graine; attribute float retard; attribute float ferme; attribute float vitesse;
    varying float vU; varying float vC; varying vec3 vA; varying vec3 vB;
    varying float vG; varying float vR; varying float vF; varying float vV;
    void main() {
      vU = u; vC = cote; vA = ca; vB = cb; vG = graine; vR = retard; vF = ferme; vV = vitesse;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform float temps; uniform float trace; uniform float eclats;
    varying float vU; varying float vC; varying vec3 vA; varying vec3 vB;
    varying float vG; varying float vR; varying float vF; varying float vV;
    void main() {
      float s = vC;
      float coeur = exp(-s * s * 55.0);
      float halo = exp(-s * s * 4.0) * 0.3;
      float bouts = mix(smoothstep(0.0, 0.04, vU) * smoothstep(1.0, 0.96, vU), 1.0, vF);
      float t = trace * 1.6 - vR;
      float tracee = 1.0 - smoothstep(t - 0.05, t, vU);
      float p = fract(vU * 2.0 - temps * vV + vG);
      float eclat = eclats * step(0.001, abs(vV)) * smoothstep(0.0, 0.03, p) * smoothstep(0.2, 0.03, p);
      vec3 c = mix(vA, vB, vU);
      c = mix(c, vec3(1.0), coeur * 0.5);
      gl_FragColor = vec4(c, (coeur * 1.1 + halo) * (0.72 + 1.1 * eclat) * bouts * tracee);
    }`,
};
function contours(scene, lignes) {
  const P = [], T = [], W = [], att = { u: [], ca: [], cb: [], graine: [], retard: [], ferme: [], vitesse: [] }, idx = [];
  lignes.forEach((L, numero) => {
    const pts0 = L.ferme ? [...L.pts, L.pts[0]] : L.pts;
    const n = Math.max(6, Math.round(longueur(pts0) * (L.densite || 9)));
    const pts = reechantillonne(pts0, n), d0 = P.length;
    const ca = new THREE.Color(L.couleurs[0]), cb = new THREE.Color(L.couleurs[1] || L.couleurs[0]);
    pts.forEach((p, j) => {
      const a = pts[j > 0 ? j - 1 : (L.ferme ? n - 2 : 0)], b = pts[j < n - 1 ? j + 1 : (L.ferme ? 1 : n - 1)];
      const t = b.map((v, d) => v - a[d]), lt = Math.hypot(...t) || 1;
      P.push(p); T.push(t.map(v => v / lt)); W.push(L.largeur || 0.09);
      att.u.push(j / (n - 1)); att.ca.push(ca.r, ca.g, ca.b); att.cb.push(cb.r, cb.g, cb.b);
      att.graine.push(alea(numero, 7)); att.retard.push(L.retard ?? alea(numero, 3) * 0.5);
      att.ferme.push(L.ferme ? 1 : 0); att.vitesse.push(L.vitesse || 0);
      if (j < n - 1) { const q = 2 * (d0 + j); idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
    });
  });
  const NB = P.length, pos = new Float32Array(NB * 6), g = new THREE.BufferGeometry();
  const double = (tab, k) => { const out = new Float32Array(tab.length * 2); for (let i = 0; i < tab.length / k; i++) for (let d = 0; d < k; d++) { out[(2 * i) * k + d] = tab[i * k + d]; out[(2 * i + 1) * k + d] = tab[i * k + d]; } return out; };
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('cote', new THREE.BufferAttribute(new Float32Array(NB * 2).map((_, k) => (k % 2 ? 1 : -1)), 1));
  g.setAttribute('u', new THREE.BufferAttribute(double(att.u, 1), 1));
  g.setAttribute('ca', new THREE.BufferAttribute(double(att.ca, 3), 3));
  g.setAttribute('cb', new THREE.BufferAttribute(double(att.cb, 3), 3));
  for (const nom of ['graine', 'retard', 'ferme', 'vitesse']) g.setAttribute(nom, new THREE.BufferAttribute(double(att[nom], 1), 1));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({ ...nuanceur, transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { temps: { value: 0 }, trace: { value: 1 }, eclats: { value: 1 } } });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const V = new THREE.Vector3(), Tv = new THREE.Vector3(), Nv = new THREE.Vector3();
  return {
    mat,
    maj(cam) {
      for (let i = 0; i < NB; i++) {
        const p = P[i];
        V.set(cam.x - p[0], cam.y - p[1], cam.z - p[2]).normalize();
        Nv.crossVectors(Tv.fromArray(T[i]), V).normalize().multiplyScalar(W[i]);
        pos[6 * i] = p[0] - Nv.x; pos[6 * i + 1] = p[1] - Nv.y; pos[6 * i + 2] = p[2] - Nv.z;
        pos[6 * i + 3] = p[0] + Nv.x; pos[6 * i + 4] = p[1] + Nv.y; pos[6 * i + 5] = p[2] + Nv.z;
      }
      g.attributes.position.needsUpdate = true;
    },
  };
}
// une route au sol : points [x, z], lissés
const route = (pts2, y = 0) => spline(pts2.map(([x, z]) => [x, y, z]), 220);

// -------------------------------------------------------------------- le mobilier, en contours
function piece(L, l, p, H = 2.6) {
  L.push({ pts: rect([0, 0, 0], X, Z, l, p, 0.5), ferme: true, couleurs: [C.faible, C.lilas], retard: 0 });
  L.push({ pts: [[-l / 2, 0, p / 2], [-l / 2, 0, -p / 2], [l / 2, 0, -p / 2]].map(q => plus(q, [0, H, 0])), couleurs: [C.faible, C.faible], retard: 0.1 });
  for (const [x, z] of [[-l / 2, -p / 2], [-l / 2, p / 2], [l / 2, -p / 2]]) L.push({ pts: [[x, 0, z], [x, H, z]], couleurs: [C.faible, C.lilas], retard: 0.05 });
  for (let k = 1; k < Math.round(l / 2.2); k++) L.push({ pts: [[-l / 2 + k * l / Math.round(l / 2.2), 0.9, -p / 2], [-l / 2 + k * l / Math.round(l / 2.2), H, -p / 2]], couleurs: [C.faible, C.faible], largeur: 0.06, retard: 0.2 });
  for (let k = 1; k < Math.round(p / 2.2); k++) L.push({ pts: [[-l / 2, 0.9, -p / 2 + k * p / Math.round(p / 2.2)], [-l / 2, H, -p / 2 + k * p / Math.round(p / 2.2)]], couleurs: [C.faible, C.faible], largeur: 0.06, retard: 0.2 });
  L.push({ pts: [[-l / 2, 0.9, p / 2], [-l / 2, 0.9, -p / 2], [l / 2, 0.9, -p / 2]], couleurs: [C.faible, C.faible], largeur: 0.06, retard: 0.15 });
}
// un îlot de quatre bureaux : le plateau, ses pieds, quatre écrans dos à dos, quatre sièges
function ilotBureaux(L, cx, cz, k) {
  L.push({ pts: rect([cx, 0.74, cz], X, Z, 2.8, 1.5, 0.12), ferme: true, couleurs: [C.blanc, C.lilas] });
  L.push({ pts: [[cx - 1.4, 0.74, cz], [cx + 1.4, 0.74, cz]], couleurs: [C.lilas, C.lilas], largeur: 0.06 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.push({ pts: [[cx + sx * 1.3, 0, cz + sz * 0.65], [cx + sx * 1.3, 0.74, cz + sz * 0.65]], couleurs: [C.faible, C.lilas], largeur: 0.06 });
  [-0.68, 0.68].forEach((dx, a) => [-1, 1].forEach((sz, b) => {
    const col = [C.cyan, C.rose, C.ambre][(k + a + b) % 3];
    L.push({ pts: rect([cx + dx, 1.04, cz + sz * 0.14], X, Y, 0.64, 0.38, 0.05), ferme: true, couleurs: [col, col], retard: 0.35 + 0.05 * (a + b) });
    L.push({ pts: [[cx + dx, 0.74, cz + sz * 0.14], [cx + dx, 0.85, cz + sz * 0.14]], couleurs: [C.lilas, C.lilas], largeur: 0.05 });
    L.push({ pts: cercle([cx + dx, 0.46, cz + sz * 1.12], X, Z, 0.24, 18), ferme: true, couleurs: [C.faible, C.lilas], largeur: 0.06 });
  }));
}
function boiteFil(L, c, [l, h, p], couleurs, retard = 0.3) {
  const [x, y, z] = c, coins = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const yy of [y, y + h]) L.push({ pts: coins.map(([a, b]) => [x + a * l / 2, yy, z + b * p / 2]), ferme: true, couleurs, retard });
  for (const [a, b] of coins) L.push({ pts: [[x + a * l / 2, y, z + b * p / 2], [x + a * l / 2, y + h, z + b * p / 2]], couleurs, retard });
}
function ecranMural(L, c, l, h, sorte) {
  L.push({ pts: rect(c, X, Y, l, h, 0.1), ferme: true, couleurs: [C.rouge, C.corail], retard: 0.25, largeur: 0.1 });
  const P = (u, v) => plus(c, [u * l / 2, v * h / 2, 0.02]);
  if (sorte === 'tableau') {
    [-0.62, 0, 0.62].forEach((u, k) => L.push({ pts: rect(P(u, 0.48), X, Y, l * 0.26, h * 0.22, 0.04), ferme: true, couleurs: [[C.cyan, C.rose, C.ambre][k]], retard: 0.45, largeur: 0.06 }));
    L.push({ pts: Array.from({ length: 13 }, (_, k) => P(-0.85 + k * 0.1, -0.7 + 0.8 * alea(k, 5) * (0.4 + k / 20))), couleurs: [C.cyan, C.bleu], retard: 0.5, largeur: 0.06 });
    for (let k = 0; k < 4; k++) L.push({ pts: [P(0.5 + k * 0.12, -0.72), P(0.5 + k * 0.12, -0.72 + 0.7 * alea(k, 6))], couleurs: [C.rose, C.lilas], retard: 0.55, largeur: 0.06 });
  } else {
    L.push({ pts: [P(-0.1, 0.25), P(-0.1, -0.25), P(0.14, 0)], ferme: true, couleurs: [C.blanc], retard: 0.45, largeur: 0.07 });
    L.push({ pts: [P(-0.85, -0.78), P(0.2, -0.78)], couleurs: [C.rouge, C.corail], retard: 0.5, largeur: 0.07 });
    L.push({ pts: [P(0.2, -0.78), P(0.85, -0.78)], couleurs: [C.faible], retard: 0.5, largeur: 0.05 });
  }
}
// une table hexagonale, et autour : un portable (écran incliné, clavier) et un tabouret par place
function ilotFormation(L, cx, cz, n, graine) {
  L.push({ pts: polygone([cx, 0.74, cz], X, Z, 1.05, 6, Math.PI / 6), ferme: true, couleurs: [C.blanc, C.lilas] });
  L.push({ pts: [[cx, 0, cz], [cx, 0.74, cz]], couleurs: [C.faible, C.lilas], largeur: 0.06 });
  for (let k = 0; k < n; k++) {
    const a = k * Math.PI * 2 / n + Math.PI / n + graine, s = Math.sin(a), c = Math.cos(a);
    const vers = [s, 0, c], cote = [c, 0, -s];       // vers la place, et le long du bord
    const base = [cx + 0.62 * s, 0.76, cz + 0.62 * c];
    L.push({ pts: rect(base, cote, vers, 0.36, 0.25, 0.03), ferme: true, couleurs: [C.lilas], largeur: 0.05, retard: 0.3 });
    const [u2, v2] = [cote, plus(plus([0, 0, 0], Y, 0.96), vers, -0.27)];
    L.push({ pts: rect(plus(plus(base, vers, -0.13), v2, 0.12), u2, v2, 0.36, 0.24, 0.03), ferme: true,
      couleurs: [[C.cyan, C.rose, C.ambre, C.lilas][(k + Math.round(graine * 7)) % 4]], largeur: 0.06, retard: 0.4 });
    L.push({ pts: cercle([cx + 1.42 * s, 0.46, cz + 1.42 * c], X, Z, 0.22, 16), ferme: true, couleurs: [C.faible, C.lilas], largeur: 0.05 });
  }
  L.push({ pts: cercle([cx, 2.75, cz], X, Z, 0.38, 24), ferme: true, couleurs: [C.ambre, '#FFE0B0'], retard: 0.5 });
  L.push({ pts: [[cx, 2.75, cz], [cx, 3.6, cz]], couleurs: [C.faible], largeur: 0.04, retard: 0.5 });
}

// -------------------------------------------------------------------- les scènes
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

// A · l'open space
function openSpace(scene) {
  const L = [];
  piece(L, 17, 11.5);
  ilotBureaux(L, -4.6, -1.6, 0);
  ilotBureaux(L, 0.2, -1.6, 1);
  ilotBureaux(L, -2.2, 2.4, 2);
  ecranMural(L, [-2.4, 1.5, -5.7], 3.4, 1.9, 'tableau');
  // la salle de réunion vitrée et sa table
  boiteFil(L, [5.9, 0, -3.8], [4.2, 2.4, 3.3], [C.cyan, C.bleu]);
  L.push({ pts: rect([5.9, 0.74, -3.8], X, Z, 2.2, 1.1, 0.3), ferme: true, couleurs: [C.blanc, C.lilas], retard: 0.4 });
  [[5.1, -2.75], [6.7, -2.75], [5.9, -4.85]].forEach(([x, z]) => L.push({ pts: cercle([x, 0.46, z], X, Z, 0.24, 18), ferme: true, couleurs: [C.faible, C.lilas], largeur: 0.06 }));
  // le coin d'échange : une table haute ronde
  L.push({ pts: cercle([4.6, 1.08, 2.4], X, Z, 0.48, 28), ferme: true, couleurs: [C.blanc, C.lilas], retard: 0.4 });
  L.push({ pts: [[4.6, 0, 2.4], [4.6, 1.08, 2.4]], couleurs: [C.faible, C.lilas], largeur: 0.06 });
  // les traces au sol : elles entrent, passent entre les îlots et rejoignent l'écran
  L.push({ pts: route([[-22, 6], [-9, 4.6], [-4.4, 0.4], [-1.9, 0.3], [2.6, 0.4], [3.4, -2.2], [1.6, -4.6], [-2.4, -5.0]]), couleurs: [C.bleu, C.cyan], largeur: 0.14, vitesse: 0.1, retard: 0 });
  L.push({ pts: route([[-20, 9], [-6, 5.2], [0.4, 4.6], [3.1, 2.6], [2.9, -0.2], [9, -0.4], [24, -2]]), couleurs: [C.rouge, C.ambre], largeur: 0.14, vitesse: 0.08, retard: 0.05 });
  L.push({ pts: route([[24, 7], [10, 6.4], [3.2, 5.3], [-0.6, 0.6], [-6.8, 0.2], [-7.4, -3.6], [-12, -10]]), couleurs: [C.rose, C.lilas], largeur: 0.14, vitesse: 0.07, retard: 0.1 });
  return { lignes: L, cadrer: orbite([-0.6, 0.6, 0.2], 17.5, 10, 0.62) };
}

// B · la salle de formation en îlots
function salleFormation(scene) {
  const L = [];
  piece(L, 16, 12);
  ecranMural(L, [0, 1.5, -5.95], 4.4, 2.3, 'cours');
  const ilots = [[-4.3, -1.5, 4], [0.1, -1.0, 5], [4.5, -1.5, 4], [-2.1, 3.1, 5], [2.6, 3.2, 4]];
  ilots.forEach(([x, z, n], k) => ilotFormation(L, x, z, n, k * 0.37));
  ilots.forEach(([x, z], k) => L.push({ pts: route([[0.6 * (k - 2), -5.6], [x * 0.5, (z - 5.3) / 2 - 0.4], [x, z - 1.75], [x + 1.8 * Math.sign(x || 1), z], [x * 2.6 + (k - 2) * 2, z + 9]]),
    couleurs: [[C.rouge, C.ambre], [C.cyan, C.bleu], [C.rose, C.lilas], [C.ambre, C.corail], [C.bleu, C.cyan]][k], largeur: 0.12, vitesse: 0.09, retard: 0.05 * k }));
  return { lignes: L, cadrer: orbite([0, 0.8, 0.4], 16.5, 9.5, 0.6) };
}

// C · le siège : une tour et son aile, dessinées étage par étage, le Ó au sommet, et les
// routes de lumière qui contournent l'îlot, comme le carrefour du camion
function batiment(L, [cx, cz], [l, p], etages, retard0) {
  const h = 1.05, H = etages * h;
  for (let k = 0; k <= etages; k++) L.push({ pts: rect([cx, k * h, cz], X, Z, l, p, 0.2, 3), ferme: true,
    couleurs: k === etages ? [C.blanc, C.blanc] : [C.lilas, C.blanc], largeur: 0.08, retard: retard0 + 0.04 * k });
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) L.push({ pts: [[cx + a * l / 2, 0, cz + b * p / 2], [cx + a * l / 2, H, cz + b * p / 2]], couleurs: [C.lilas, C.blanc], largeur: 0.07, retard: retard0 });
  const n = Math.round(l / 0.75);
  for (let i = 1; i < n; i++) L.push({ pts: [[cx - l / 2 + i * l / n, 0, cz + p / 2], [cx - l / 2 + i * l / n, H, cz + p / 2]], couleurs: [C.faible, C.cyan], largeur: 0.04, retard: retard0 + 0.2 });
  const m = Math.round(p / 0.75);
  for (let i = 1; i < m; i++) L.push({ pts: [[cx + l / 2, 0, cz - p / 2 + i * p / m], [cx + l / 2, H, cz - p / 2 + i * p / m]], couleurs: [C.faible, C.cyan], largeur: 0.04, retard: retard0 + 0.2 });
  return H;
}
function siege(scene) {
  const L = [];
  L.push({ pts: rect([0, 0, 0], X, Z, 26, 19, 1.2), ferme: true, couleurs: [C.faible, C.lilas], retard: 0 });
  L.push({ pts: rect([0.8, 0, 4.1], X, Z, 11, 6.2, 0.6), ferme: true, couleurs: [C.faible], largeur: 0.06, retard: 0.1 });
  const H = batiment(L, [-2, -1.2], [6, 4.4], 8, 0.1);
  batiment(L, [4.6, -1.6], [7, 3.6], 2, 0.2);
  // l'auvent de l'entrée
  L.push({ pts: rect([-2, 2.2, 1.8], X, Z, 3.2, 1.6, 0.1), ferme: true, couleurs: [C.blanc, C.lilas], retard: 0.35 });
  for (const x of [-3.4, -0.6]) L.push({ pts: [[x, 0, 2.4], [x, 2.2, 2.4]], couleurs: [C.lilas], largeur: 0.05, retard: 0.35 });
  // le Ó, en façade au dernier étage : les deux bords du O, le contour de la barre
  const front = -1.2 + 2.2 + 0.06, centreO = [-2.4, H - 2.2, front], R = 0.72;
  L.push({ pts: cercle(centreO, X, Y, R, 36), ferme: true, couleurs: [C.rouge, C.corail], largeur: 0.09, retard: 0.55 });
  L.push({ pts: cercle(centreO, X, Y, R * 0.42, 24), ferme: true, couleurs: [C.rouge, C.corail], largeur: 0.08, retard: 0.55 });
  const [ub, vb] = tourne(X, Y, 0.51);
  L.push({ pts: rect(plus(centreO, [-0.551 * R, 1.618 * R, 0]), ub, vb, 1.744 * R, 0.534 * R, 0.04, 2), ferme: true, couleurs: [C.rouge, C.corail], largeur: 0.08, retard: 0.6 });
  // des arbres en fil de fer, autour de la place
  [[-9.8, 6.4], [-7.4, 7.6], [9.6, 6.6], [7.2, 7.8], [-10.5, -5.6], [10.5, -6.4], [-10.6, 0.4], [10.8, 1.6]].forEach(([x, z], k) => {
    for (const pts of aretes(new THREE.IcosahedronGeometry(0.62, 0), [x, 1.25, z])) L.push({ pts, couleurs: [C.vert, '#7FF0CF'], largeur: 0.05, retard: 0.45 + k * 0.02 });
    L.push({ pts: [[x, 0, z], [x, 0.7, z]], couleurs: [C.faible, C.vert], largeur: 0.05, retard: 0.45 });
  });
  // les routes : deux voies qui contournent l'îlot, deux chaussées qui filent vers l'horizon
  const boucle = (decal) => {
    const [Lx, Pz, r] = [11 + decal, 8 + decal, 2.4], pts = [];
    [[Lx - r, Pz - r, 0], [-Lx + r, Pz - r, 1], [-Lx + r, -Pz + r, 2], [Lx - r, -Pz + r, 3]].forEach(([x, z, q]) => {
      for (let k = 0; k <= 10; k++) { const a = (q + k / 10) * Math.PI / 2; pts.push([x + r * Math.cos(a), 0, z + r * Math.sin(a)]); }
    });
    return pts;
  };
  L.push({ pts: boucle(0.6), ferme: true, couleurs: [C.rouge, C.ambre], largeur: 0.13, vitesse: 0.06, retard: 0 });
  L.push({ pts: boucle(1.1), ferme: true, couleurs: [C.bleu, C.cyan], largeur: 0.13, vitesse: -0.05, retard: 0.05 });
  L.push({ pts: route([[-40, 12.4], [-12.4, 9.6], [-6, 9.0], [6, 9.0], [12.4, 9.6], [40, 12.4]]), couleurs: [C.ambre, C.rouge], largeur: 0.13, vitesse: 0.08, retard: 0.1 });
  L.push({ pts: route([[14.4, -40], [12.6, -12], [12.1, 0], [12.6, 12], [14.4, 40]]), couleurs: [C.cyan, C.rose], largeur: 0.13, vitesse: 0.08, retard: 0.1 });
  return { lignes: L, cadrer: orbite([0, 3.4, 0], 25, 12, 0.7, 1.0) };
}

// D · le Ó final, dessiné comme un échangeur : le O est un anneau routier à quatre voies,
// l'accent une chaussée en forme de pilule posée sur une route droite qui file vers
// l'horizon des deux côtés, et deux bretelles montent du bas pour rejoindre l'anneau en
// tangente, l'une par la droite, l'autre par la gauche
function logo(scene) {
  const L = [], R = 4, sol = ([lx, ly]) => [lx, 0, -ly];   // le logo à plat : son « haut » regarde vers -z
  [0.42, 0.61, 0.8, 1].forEach((f, k) => L.push({ pts: Array.from({ length: 120 }, (_, j) => { const a = j / 120 * Math.PI * 2 + 2.2 + k * 0.9; return sol([R * f * Math.cos(a), R * f * Math.sin(a)]); }),
    ferme: true, largeur: 0.14, couleurs: [[C.rouge, C.corail], [C.corail, C.ambre], [C.ambre, C.rouge], [C.rouge, C.rose]][k], retard: 0.1 * k }));
  const p1 = [-1.311 * R, 1.191 * R], p2 = [0.209 * R, 2.046 * R], e = 0.267 * R;
  const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), dir = [(p2[0] - p1[0]) / d, (p2[1] - p1[1]) / d], n = [-dir[1], dir[0]];
  const ang = Math.atan2(n[1], n[0]);
  const arc2 = (c, r, a0, a1, m = 20) => Array.from({ length: m + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / m; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });
  const pilule = (h) => [[p1[0] + n[0] * h, p1[1] + n[1] * h], ...arc2(p2, h, ang, ang - Math.PI), ...arc2(p1, h, ang + Math.PI, ang)].map(sol);
  L.push({ pts: pilule(e), ferme: true, largeur: 0.14, couleurs: [C.rouge, C.corail], retard: 0.2 });
  L.push({ pts: pilule(e * 0.45), ferme: true, largeur: 0.12, couleurs: [C.ambre, C.rouge], retard: 0.3 });
  // la route de l'accent, prolongée des deux côtés
  const droite = (p, sens) => [0.4, 6, 18, 44].map(k => sol([p[0] + dir[0] * k * sens, p[1] + dir[1] * k * sens]));
  L.push({ pts: droite(p1, -1), largeur: 0.13, couleurs: [C.rose, C.bleu], vitesse: 0.08, retard: 0.35 });
  L.push({ pts: droite(p2, 1), largeur: 0.13, couleurs: [C.rose, C.bleu], vitesse: 0.08, retard: 0.35 });
  // les bretelles, en tangente sur l'anneau extérieur (à 315° par la droite, à 225° par la gauche)
  const bretelle = (theta, sens) => {
    const t = [-Math.sin(theta) * sens, Math.cos(theta) * sens], P = [R * Math.cos(theta), R * Math.sin(theta)];
    const pts = [40, 14, 4].map(k => [P[0] - t[0] * k, P[1] - t[1] * k]);
    pts.push(...Array.from({ length: 40 }, (_, j) => { const a = theta + sens * 2.1 * j / 39; return [R * Math.cos(a), R * Math.sin(a)]; }));
    return pts.map(sol);
  };
  L.push({ pts: bretelle(-Math.PI / 4, 1), largeur: 0.13, couleurs: [C.bleu, C.cyan], vitesse: 0.1, retard: 0 });
  L.push({ pts: bretelle(Math.PI * 1.25, -1), largeur: 0.13, couleurs: [C.cyan, C.bleu], vitesse: 0.1, retard: 0 });
  // la caméra : vue d'échangeur, puis elle monte et se place au-dessus du Ó
  const centre = new THREE.Vector3(-0.8, 0, -2.6), haut = new THREE.Vector3(), bas = new THREE.Vector3();
  return {
    lignes: L,
    cadrer: (cam, p, t) => {
      const q = anime ? Math.min(1, Math.max(0, (p - 0.15) / 0.6)) : 1, e2 = q * q * (3 - 2 * q);
      const loin = cam.aspect < 1 ? 1.15 : 1;
      const elev = 0.2 + (Math.PI / 2 - 0.2) * e2, az = 0.75 * (1 - e2) + Math.sin(t * 0.15) * 0.02 * (1 - e2), dist = (22 + 8 * e2) * loin;
      cam.position.set(centre.x + dist * Math.cos(elev) * Math.sin(az), dist * Math.sin(elev), centre.z + dist * Math.cos(elev) * Math.cos(az));
      haut.set(0, 1, 0).lerp(bas.set(0, 0, -1), Math.min(1, Math.max(0, (e2 - 0.6) / 0.4))).normalize();
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
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 300);
  const { lignes, cadrer } = construire(scene);
  const s = { toile, rendu, scene, camera, cadrer, traits: contours(scene, lignes), visible: false, debut: null, l: 0, h: 0 };
  scenes.push(s);
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; demande(); }, { rootMargin: '60px' }).observe(toile);
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
  const t = ms / 1000;
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
    // les contours se tracent la première fois que la scène paraît
    if (s.debut === null) s.debut = t;
    const trace = anime ? Math.min(1, (t - s.debut) / 3) : 1;
    s.cadrer(s.camera, progression(s.toile), anime ? t : 0);
    s.traits.maj(s.camera.position);
    const u = s.traits.mat.uniforms;
    u.temps.value = anime ? t : 0; u.eclats.value = anime ? 1 : 0; u.trace.value = 1 - (1 - trace) ** 2;
    s.rendu.render(s.scene, s.camera);
  }
  if (scenes.some(s => s.visible) && (anime || scenes.some(s => s.visible && s.debut === null))) demande();
}
addEventListener('scroll', demande, { passive: true });
addEventListener('resize', demande);

ajouter('scene-open-space', openSpace);
ajouter('scene-formation', salleFormation);
ajouter('scene-siege', siege);
ajouter('scene-logo', logo);
demande();
// pour les captures de contrôle : dessiner un instant précis (les contours déjà tracés)
window.__dessiner = (ms) => { for (const s of scenes) if (s.debut !== null) s.debut = -100; image(ms); };
