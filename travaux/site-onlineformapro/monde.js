// Le monde de lignes de l'ouverture : des routes de lumière posées dans la nuit, et une
// caméra qui les parcourt au fil du défilement.
//
// Rien ne se transforme : le décor est fixe, c'est la caméra qui avance. Elle suit deux
// courbes (sa position, le point qu'elle regarde), échantillonnées selon la progression du
// défilement, avec un léger amortissement et un léger suivi de la souris.
//
// Le rendu : des tubes très fins, une lumière qui pulse le long des routes, un brouillard
// qui les fond dans la nuit, puis la tonalité filmique, un halo (bloom), deux dégradés
// bleus et l'anticrénelage.
import * as THREE from 'three';
import { EffectComposer } from './vendor/addons/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './vendor/addons/postprocessing/ShaderPass.js';
import { OutputPass } from './vendor/addons/postprocessing/OutputPass.js';
import { FXAAShader } from './vendor/addons/shaders/FXAAShader.js';
import { creerObjets, rectangle } from './objets.js';

// les couleurs du modèle (bleu, orangé, blanc) ; pour passer au rouge de la marque, changer « rouge »
export const COULEURS = { bleu: '#1367FE', rouge: '#FF4300', blanc: '#FFFFFF' };
const NUIT = '#000835';

// -------------------------------------------------------------------- tracés
const alea = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
// la direction au sol d'un angle en degrés (0 : vers +x, 90 : vers -z)
const dir = (deg) => { const a = deg * Math.PI / 180; return new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)); };
const HAUT = new THREE.Vector3(0, 1, 0);

// une courbe lisse passant par des points [x, z] (au sol) ou [x, y, z]
function courbe(points, y = 0) {
  return new THREE.CatmullRomCurve3(points.map(p => (p.length === 2 ? new THREE.Vector3(p[0], y, p[1]) : new THREE.Vector3(...p))), false, 'centripetal');
}
// la même courbe, décalée sur le côté (au sol) : une voie d'une route ; un décalage positif
// est à droite dans le sens de la route
function voie(centre, decal, n) {
  const pts = [], T = new THREE.Vector3();
  for (let j = 0; j <= n; j++) {
    const u = j / n, p = centre.getPointAt(u);
    centre.getTangentAt(u, T);
    pts.push(new THREE.Vector3(p.x - T.z * decal, p.y, p.z + T.x * decal));
  }
  return new THREE.CatmullRomCurve3(pts);
}

// -------------------------------------------------------------------- matière des lignes
// Une couleur unie ; sur les routes, une lumière qui pulse le long de la ligne (jusqu'au
// triple de la couleur). Les bouts libres s'effacent ; ceux qu'une autre ligne prolonge,
// non. Brouillard compris.
const nuanceur = {
  vertexShader: `
    uniform float uTemps; uniform float uTaille; uniform float uVitesse;
    varying vec2 vUv; varying float vPulse;
    #include <fog_pars_vertex>
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vPulse = smoothstep(-0.5, 0.5, sin(vUv.x * uTaille + uTemps)) * uVitesse;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    uniform vec3 uCouleur; uniform float uAlpha; uniform vec2 uBouts; uniform float uFondu;
    varying vec2 vUv; varying float vPulse;
    #include <fog_pars_fragment>
    void main() {
      float bouts = mix(1.0, smoothstep(0.0, uFondu, vUv.x), uBouts.x) * mix(1.0, smoothstep(1.0, 1.0 - uFondu, vUv.x), uBouts.y);
      gl_FragColor = vec4(mix(uCouleur, uCouleur * 3.0, vPulse), uAlpha * bouts);
      #include <fog_fragment>
    }`,
};
const matieres = [];
// sur petit écran, des traits plus épais (comme le modèle), sinon ils s'émiettent
let epaisseur = 1;
function matiere(couleur, longueur, route, bouts) {
  // comme le modèle : la valeur hexadécimale prise telle quelle en couleur linéaire (plus
  // lumineuse et plus chaude une fois à l'écran : l'orangé tire sur le jaune, le bleu sur le cyan)
  const c = new THREE.Color().setHex(parseInt(couleur.slice(1), 16), THREE.LinearSRGBColorSpace);
  if (route) c.multiplyScalar(0.92);                   // les voies pulsées, un peu plus sombres au repos
  const m = new THREE.ShaderMaterial({
    ...nuanceur, fog: true, transparent: true, depthWrite: false,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uCouleur: { value: c }, uTemps: { value: 0 }, uTaille: { value: Math.max(2, longueur * 0.3) },
      uVitesse: { value: route ? 1 : 0 }, uAlpha: { value: 1 },
      uBouts: { value: new THREE.Vector2(...bouts) }, uFondu: { value: Math.min(0.1, 25 / longueur) } }]),
  });
  matieres.push(m);
  return m;
}
function tube(groupe, c, { couleur, rayon = 0.016, route = true, bouts = [1, 1], ferme = false }) {
  const L = c.getLength();
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(c, Math.min(900, Math.max(40, Math.round(L * 2.2))), rayon * epaisseur, 5, ferme), matiere(couleur, L, route, bouts));
  groupe.add(mesh);
  return mesh;
}
// -------------------------------------------------------------------- objets dessinés
// La technique du camion du modèle : des traits de lumière fins, à angles vifs et sans
// pulsation, sur les arêtes d'un objet ; et son volume, de la couleur exacte du fond, donc
// invisible, qui cache les traits situés derrière lui. Les traits d'une même couleur sont
// fusionnés en un seul maillage, les volumes aussi.
const fixes = {};
const matiereFixe = (couleur) => (fixes[couleur] ||= matiere(couleur, 1, false, [0, 0]));
const MASQUE = new THREE.MeshBasicMaterial({ color: NUIT, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
function fusionner(geos, avecIndex) {
  let nv = 0, ni = 0;
  for (const g of geos) { nv += g.attributes.position.count; if (avecIndex) ni += g.index.count; }
  const pos = new Float32Array(nv * 3), uv = avecIndex ? new Float32Array(nv * 2) : null, idx = avecIndex ? new Uint32Array(ni) : null;
  let ov = 0, oi = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, ov * 3);
    if (avecIndex) {
      uv.set(g.attributes.uv.array, ov * 2);
      const ix = g.index.array;
      for (let k = 0; k < ix.length; k++) idx[oi + k] = ix[k] + ov;
      oi += ix.length;
    }
    ov += g.attributes.position.count;
    g.dispose();
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  if (avecIndex) { r.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); r.setIndex(new THREE.BufferAttribute(idx, 1)); }
  return r;
}
// « propre » : des matières à lui seul (pour en régler l'éclat ou la transparence), dans
// « matieres » une fois fini
function dessin({ propre = false } = {}) {
  const traits = new Map(), volumes = [];
  return {
    matieres: [],
    // un trait par des points (Vector3) : des segments droits, refermé si « ferme »
    trait(pts, couleur, rayon, ferme = false) {
      const c = new THREE.CatmullRomCurve3(pts, ferme);
      c.getPointAt = (u, o) => c.getPoint(u, o);
      c.getTangentAt = (u, o) => c.getTangent(u, o);
      const g = new THREE.TubeGeometry(c, ferme ? pts.length : pts.length - 1, rayon * epaisseur, 5, ferme);
      if (!traits.has(couleur)) traits.set(couleur, []);
      traits.get(couleur).push(g);
    },
    // un volume qui masque (géométrie déjà placée)
    volume(g) { volumes.push(g.index ? g.toNonIndexed() : g); },
    finir(groupe) {
      for (const [couleur, geos] of traits) {
        const m = propre ? matiere(couleur, 1, false, [0, 0]) : matiereFixe(couleur);
        if (propre) this.matieres.push(m);
        groupe.add(new THREE.Mesh(fusionner(geos, true), m));
      }
      if (volumes.length) groupe.add(new THREE.Mesh(fusionner(volumes, false), MASQUE));
      return groupe;
    },
  };
}

// une ligne lisse par des points (Vector3)
const ligne = (groupe, pts, options) => tube(groupe, new THREE.CatmullRomCurve3(pts, false, 'centripetal'), options);
// une route : plusieurs voies parallèles, chacune sa couleur
function route(groupe, points, voies, { y = 0.03, rayon = 0.018, bouts = [1, 1] } = {}) {
  const centre = courbe(points, y), n = Math.round(centre.getLength() * 1.4);
  // une voie sur deux porte la lumière qui pulse ; les autres restent unies
  voies.forEach(([decal, couleur, r], k) => tube(groupe, voie(centre, decal, n), { couleur, rayon: r || rayon, route: k % 2 === 0, bouts }));
  return centre;
}

// un carrefour vu d'en haut : des routes (les bras) partent du centre ; entre deux bras
// voisins, les bords des deux routes se rejoignent par un arrondi, comme les trottoirs d'un
// pâté de maisons. Chaque bord est une paire de lignes.
//   bras : [{ angle, longueur, ouvert }] par angles croissants ; un bras « ouvert »
//   s'efface au loin, les autres sont prolongés par une route
//   paires : pour chaque coin (du bras k au suivant), les couleurs [intérieure, extérieure]
//   rayon : celui des lignes, à proportion de la distance d'où la caméra les regarde
const BORDS = [1.7, 2.2];
function carrefour(groupe, centre, bras, paires, { rayon, arrondi = 1.2, y = 0.03 }) {
  const omax = Math.max(...BORDS), c = centre.clone().setY(y);
  bras.forEach((bi, i) => {
    const bj = bras[(i + 1) % bras.length];
    let phi = bj.angle - bi.angle; if (phi <= 0) phi += 360;
    const ai = dir(bi.angle), aj = dir(bj.angle), ni = dir(bi.angle + 90), nj = dir(bj.angle - 90);
    // le centre commun des arrondis, sur la bissectrice du coin
    const m = ai.clone().add(aj).normalize(), s = Math.sin(phi * Math.PI / 360);
    const M = c.clone().addScaledVector(m, (omax + arrondi) / s);
    const ti = M.clone().sub(c).dot(ai), tj = M.clone().sub(c).dot(aj);
    const angleDe = (v) => Math.atan2(-v.z, v.x);
    BORDS.forEach((o, k) => {
      const surI = (t) => c.clone().addScaledVector(ai, t).addScaledVector(ni, o);
      const surJ = (t) => c.clone().addScaledVector(aj, t).addScaledVector(nj, o);
      const pts = [];
      for (let t = bi.longueur; t > ti + 1; t -= 2) pts.push(surI(t));
      const r = arrondi + omax - o, a0 = angleDe(surI(ti).sub(M));
      let da = angleDe(surJ(tj).sub(M)) - a0;
      if (da > Math.PI) da -= 2 * Math.PI; else if (da < -Math.PI) da += 2 * Math.PI;
      for (let j = 0; j <= 12; j++) { const a = a0 + da * j / 12; pts.push(M.clone().add(new THREE.Vector3(Math.cos(a) * r, 0, -Math.sin(a) * r))); }
      for (let t = tj + 2; t < bj.longueur - 1; t += 2) pts.push(surJ(t));
      pts.push(surJ(bj.longueur));
      ligne(groupe, pts, { couleur: paires[i][k], rayon: k ? rayon * 0.75 : rayon, route: false, bouts: [bi.ouvert ? 1 : 0, bj.ouvert ? 1 : 0] });
    });
  });
}

const { bleu: B, rouge: R, blanc: W } = COULEURS;
// les voies de l'autoroute : une paire de lignes de chaque côté (les bords du carrefour)
const VOIES = [[-2.2, B], [-1.7, W, 0.013], [1.7, R], [2.2, B, 0.013]];
const VOIES_FINES = [[-1.8, R], [-0.9, B, 0.013], [0.9, W, 0.013], [1.8, B]];

// -------------------------------------------------------------------- le décor
// Le parcours, dans l'ordre : l'autoroute de l'ouverture et ses lacets, le graphique de pics
// (l'IA), le carrefour vu d'en haut (la solution modulaire), le croisement en X et ses
// anneaux (les utilisateurs), la ligne droite et l'éventail (la démonstration).
// le logo : le Ó d'Onlineformapro dessiné en routes, comme un échangeur vu d'en haut, aux
// proportions du logo (en unités du dessin du logo, × k). L'anneau du O est une route
// circulaire à trois paires de voies où la lumière circule ; l'accent, une bretelle droite
// aux bouts arrondis ; autour, des arcs de cercle, comme au croisement en X.
function logo(groupe, centre) {
  const k = 0.1, R0 = 77 * k, r0 = 32 * k, m = (R0 + r0) / 2, y = 0.03, e = 0.4;
  [[R0, B, 0.036], [R0 - e, W, 0.03], [m + 0.2, R, 0.032], [m - 0.2, W, 0.03], [r0 + e, W, 0.03], [r0, R, 0.036]].forEach(([r, couleur, rayon], n) => {
    const pts = [];
    for (let j = 0; j < 120; j++) pts.push(centre.clone().addScaledVector(dir(j * 3), r).setY(y));
    tube(groupe, new THREE.CatmullRomCurve3(pts, true), { couleur, rayon, route: n % 2 === 0, bouts: [0, 0], ferme: true });
  });
  // l'accent : un rectangle tourné de 29,4°, son centre en (86,8 ; 63,3) dans le dessin
  const c = centre.clone().add(new THREE.Vector3((86.77 - 111) * k, y, (63.27 - 175.5) * k));
  const u = new THREE.Vector3(0.8714, 0, -0.4906), v = new THREE.Vector3(0.4906, 0, 0.8714), L = 134.3 * k, l = 41.1 * k;
  const sur = (pts) => pts.map(p => c.clone().addScaledVector(u, p.x).addScaledVector(v, p.y));
  for (const [dl, arrondi, couleur, rayon] of [[0, 0.8, B, 0.036], [2 * e, 0.45, R, 0.028]]) {
    const pts = sur(rectangle(L - dl, l - dl, arrondi));
    tube(groupe, new THREE.CatmullRomCurve3(pts, true), { couleur, rayon, route: false, bouts: [0, 0], ferme: true });
  }
  for (const [dv, couleur] of [[0.2, W], [-0.2, R]]) {
    tube(groupe, new THREE.CatmullRomCurve3(sur([new THREE.Vector2(-L / 2 + 1.1, dv), new THREE.Vector2(L / 2 - 1.1, dv)])), { couleur, rayon: 0.026, route: dv > 0 });
  }
  // la bretelle : elle quitte l'anneau sur sa droite et rejoint l'autoroute, en contrebas
  const depart = centre.clone().addScaledVector(dir(-20), R0 - e / 2);
  route(groupe, [[depart.x, depart.z], [depart.x + 0.75, depart.z + 3.9], [depart.x + 3, depart.z + 10.4], [depart.x + 6.5, depart.z + 16.4], [depart.x + 10.5, depart.z + 20.8], [depart.x + 15.5, depart.z + 23.7]],
    [[-0.2, W, 0.03], [0.2, R, 0.03]], { bouts: [0, 1] });
  // les arcs : à gauche et à droite de l'anneau, et au-dessus de l'accent (angles en degrés)
  [[10.3, 165, 230, R], [13.3, 160, 225, R], [17.2, 170, 218, W], [10.3, -55, 40, R], [13.3, -48, 46, R], [17.2, -40, 38, R], [19.4, 62, 150, R], [22.8, 70, 140, B]].forEach(([r, a0, a1, couleur]) => {
    const pts = [];
    for (let j = 0; j <= 48; j++) pts.push(centre.clone().addScaledVector(dir(a0 + (a1 - a0) * j / 48), r).setY(y));
    tube(groupe, new THREE.CatmullRomCurve3(pts), { couleur, rayon: 0.036, route: false });
  });
}

function decor(groupe) {
  const zc = -420, C1 = new THREE.Vector3(0, 0, zc);
  // l'ouverture : l'autoroute arrive de l'horizon, à gauche, passe tout près, en bas de
  // l'écran, puis tourne, file vers l'horizon et entre droit dans le carrefour
  route(groupe, [[-210, -90], [-110, -40], [-50, -10], [-14, 6], [8, 12], [22, 6], [30, -14], [33, -50], [26, -95], [6, -135], [-6, -178], [6, -218], [12, -252], [6, -300], [0, -350], [0, zc + 30]], VOIES, { bouts: [1, 0] });
  route(groupe, [[130, 34], [70, 26], [42, 18], [32, 6], [31, -14]], VOIES_FINES);

  // le graphique : des lignes qui longent la route et s'élèvent en pics, sur deux rangs
  for (let r = 0; r < 7; r++) {
    const x0 = -9 - r * 1.8, pts = [];
    for (let k = 0; k <= 120; k++) {
      const z = -220 - k * 0.9;
      const pic = (c, h, s) => h * Math.exp(-((z - c) ** 2) / (2 * s * s));
      const y = 0.05 + pic(-262 - alea(r, 1) * 16, 4 + 7 * alea(r, 2), 4 + 3 * alea(r, 3)) + pic(-292 - alea(r, 4) * 10, 2.5 + 6 * alea(r, 5), 3 + 2 * alea(r, 6));
      pts.push(new THREE.Vector3(x0 + Math.sin(k * 0.05 + r) * 0.4, y, z));
    }
    tube(groupe, new THREE.CatmullRomCurve3(pts), { couleur: [B, R, W, R, B, W, R][r], rayon: 0.028 });
  }

  // le carrefour : l'autoroute (bras du bas) y entre, une route transversale le traverse ;
  // le bras de droite file vers le croisement en X
  carrefour(groupe, C1, [
    { angle: 0, longueur: 60 }, { angle: 90, longueur: 70, ouvert: true },
    { angle: 180, longueur: 90, ouvert: true }, { angle: 270, longueur: 30 },
  ], [[B, W], [R, W], [W, B], [R, B]], { rayon: 0.022 });
  // deux boucles posées dans les pâtés de maisons
  [[16, zc - 13, 8, 5.5, W], [-15, zc + 15, 5, 7, B]].forEach(([x, z, rx, rz, couleur]) => {
    const pts = [];
    for (let j = 0; j <= 64; j++) { const a = j / 64 * Math.PI * 2; pts.push(new THREE.Vector3(x + rx * Math.cos(a), 0.03, z + rz * Math.sin(a))); }
    tube(groupe, new THREE.CatmullRomCurve3(pts, true), { couleur, rayon: 0.02, route: false, bouts: [0, 0] });
  });

  // le croisement en X : deux routes en diagonale ; la liaison depuis le carrefour arrive
  // par le bras en bas à droite, le bras en haut à gauche file vers l'éventail
  const P2 = new THREE.Vector3(200, 0, zc);
  const arrivee = P2.clone().addScaledVector(dir(235), 45), sens = dir(55);
  route(groupe, [[60, zc], [72, zc], [98, zc + 6], [122, zc + 28], [146, zc + 54], [arrivee.x - sens.x * 14, arrivee.z - sens.z * 14], [arrivee.x, arrivee.z]],
    [[-2.2, W, 0.018], [-1.7, B, 0.024], [1.7, R, 0.024], [2.2, B, 0.018]], { bouts: [0, 0] });
  carrefour(groupe, P2, [
    { angle: 55, longueur: 270, ouvert: true }, { angle: 125, longueur: 80, ouvert: true },
    { angle: 235, longueur: 45 }, { angle: 305, longueur: 80, ouvert: true },
  ], [[W, R], [B, W], [R, B], [R, B]], { rayon: 0.03 });
  // les anneaux : des arcs de cercle autour du croisement, entre les routes ; par secteur
  // (du bras k au suivant), [rayon, couleur]
  const ARMES = [55, 125, 235, 305, 415];
  [[[16, R], [27, R]], [[22, R]], [[15, R], [29, W]], [[20, R], [31, R]]].forEach((arcs, k) => {
    for (const [r, couleur] of arcs) {
      const marge = Math.asin(Math.min(1, 6 / r)) * 180 / Math.PI;
      const a0 = ARMES[k] + marge, a1 = ARMES[k + 1] - marge, pts = [];
      for (let j = 0; j <= 48; j++) pts.push(P2.clone().addScaledVector(dir(a0 + (a1 - a0) * j / 48), r).setY(0.03));
      tube(groupe, new THREE.CatmullRomCurve3(pts), { couleur, rayon: 0.036, route: false });
    }
  });

  // l'éventail : au bout de la ligne droite, des lignes partent d'un même point de l'horizon
  // et s'ouvrent en revenant vers la caméra, de plus en plus haut, sur sa droite
  const F = P2.clone().addScaledVector(sens, 270), droite = sens.clone().cross(HAUT);
  for (let k = 0; k < 16; k++) {
    const fin = F.clone().addScaledVector(sens, -160).addScaledVector(droite, 4 + 2.6 * k + 0.15 * k * k), haut = 0.4 * k ** 1.8, pts = [];
    for (let j = 0; j <= 60; j++) {
      const u = j / 60;
      pts.push(F.clone().lerp(fin, u).setY(0.03 + haut * u ** 1.6));
    }
    tube(groupe, new THREE.CatmullRomCurve3(pts), { couleur: [R, B, W, B, R, B][k % 6], rayon: k % 2 ? 0.022 : 0.03, route: k % 2 === 0, bouts: [1, 0] });
  }
  // le logo, à gauche du virage de l'accueil ; sa bretelle rejoint l'autoroute
  const L0 = new THREE.Vector3(-38, 0, -26);
  logo(groupe, L0);
  return { C1, P2, sens, F, L0 };
}
// la planète des utilisateurs, au-dessus du croisement en X
const PLANETE = { hauteur: 11, rayon: 7.5 };

// -------------------------------------------------------------------- dégradés bleus (passe)
// Deux lueurs bleues ajoutées à l'image : l'une en haut, au centre, l'autre à gauche.
const DegradeNuanceur = {
  uniforms: { tDiffuse: { value: null }, uRapport: { value: 1.6 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uRapport; varying vec2 vUv;
    float lueur(vec2 c, float echelle) { vec2 d = (vUv - c) * vec2(uRapport, 1.0); return pow(max(0.0, 1.0 - length(d) / echelle), 2.0); }
    void main() {
      vec4 t = texture2D(tDiffuse, vUv);
      vec3 bleu = vec3(0.0431, 0.0706, 0.3922);
      t.rgb += bleu * (lueur(vec2(0.5, 1.0), 1.28) * 0.77 + lueur(vec2(0.0, 0.66), 0.9) * 0.48);
      gl_FragColor = t;
    }`,
};

// -------------------------------------------------------------------- le monde
export function creerMonde(toile) {
  epaisseur = Math.min(innerWidth, innerHeight) < 600 ? 1.7 : 1;
  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: false, powerPreference: 'high-performance' });
  rendu.setClearColor(NUIT);
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 0.7;
  let ratio = Math.min(devicePixelRatio, 1.5);
  rendu.setPixelRatio(ratio);

  const scene = new THREE.Scene();
  // le fond en couleur de scène (et non en couleur d'effacement du rendu, que la chaîne
  // d'effets convertirait deux fois)
  scene.background = new THREE.Color(NUIT);
  scene.fog = new THREE.Fog(NUIT, 18, 150);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 240);
  const groupe = new THREE.Group();
  scene.add(groupe);
  const { C1, P2, sens, F, L0 } = decor(groupe);
  const objets = creerObjets(groupe, {
    appareils: { position: [0.5, 0, -1.5], cap: -0.2, echelle: 0.85 },
    cube: { centre: C1.clone().setY(7.5) },
    planete: { centre: P2.clone().setY(PLANETE.hauteur), rayon: PLANETE.rayon },
    batiment: { entree: F, sens },
  }, { dessin, couleurs: COULEURS });

  // la chaîne de rendu, dans l'ordre du modèle : l'image, sa tonalité (sortie en couleurs
  // d'écran), le halo, les dégradés bleus, l'anticrénelage
  const composeur = new EffectComposer(rendu);
  composeur.addPass(new RenderPass(scene, camera));
  composeur.addPass(new OutputPass());
  const halo = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0, 0);
  composeur.addPass(halo);
  const degrade = new ShaderPass(DegradeNuanceur);
  composeur.addPass(degrade);
  const fxaa = new ShaderPass(FXAAShader);
  composeur.addPass(fxaa);

  // -------------------------------------------------------------- la caméra et ses stations
  // Les stations (position, point visé) sont placées aux moments clés du parcours ; entre
  // deux stations, la caméra glisse sur deux courbes lisses.
  const tab = (p) => p.toArray();
  const gauche = sens.clone().cross(HAUT).negate();
  const auBout = (d, lat, h) => P2.clone().addScaledVector(sens, d).addScaledVector(gauche, lat).setY(h);
  const STATIONS = [
    // [progression, position, point visé, point visé sur écran en hauteur (l'objet, centré)]
    [0.00, tab(L0.clone().add(new THREE.Vector3(6, 40, 36))), tab(L0.clone().add(new THREE.Vector3(8, 0, 1))), tab(L0.clone().add(new THREE.Vector3(0, 0, -3)))],   // l'ouverture : le logo dessiné en routes
    [0.05, [-16, 15, 32], [-2, 0, 2]],                   // la caméra descend vers l'autoroute
    [0.12, [-14, 6.5, 30], [10.5, 1.6, -1], [0.8, 8, 2]],   // les appareils, dans le virage
    [0.20, [44, 3.5, -60], [14, 0.5, -112]],             // les lacets
    [0.27, [4, 2.6, -150], [-6, 1.6, -230]],
    [0.33, [-1, 3.0, -226], [-14, 4.0, -268]],            // le graphique s'élève (l'IA)
    [0.37, [3, 3.4, -236], [-14, 4.4, -276]],            // arrêt devant les pics
    [0.44, [4, 12, -345], [0, 0, -405]],                 // la caméra s'élève au-dessus de la route
    [0.52, tab(C1.clone().add(new THREE.Vector3(-28, 26, 28))), tab(C1.clone().add(new THREE.Vector3(-5.5, 7, -5.5))), tab(C1.clone().setY(5))],   // le carrefour et le cube modulaire (la solution globale et modulaire)
    [0.57, tab(C1.clone().add(new THREE.Vector3(-22, 22, 30))), tab(C1.clone().add(new THREE.Vector3(4.5, 7.5, 3))), tab(C1.clone().setY(5))],
    [0.60, tab(C1.clone().add(new THREE.Vector3(-18, 21, 32))), tab(C1.clone().add(new THREE.Vector3(3, 7, 3))), tab(C1.clone().setY(6))],      // le cube complet
    [0.64, [110, 10, -385], [170, 0, -405]],             // la liaison vers le croisement
    [0.72, tab(P2.clone().add(new THREE.Vector3(-58, 22, 6))), tab(P2.clone().add(new THREE.Vector3(0, 8, -9))), tab(P2.clone().setY(9))],    // le croisement en X, ses anneaux et la planète (les utilisateurs)
    [0.78, tab(P2.clone().add(new THREE.Vector3(-52, 20, -14))), tab(P2.clone().add(new THREE.Vector3(0, 8, 12))), tab(P2.clone().setY(9))],
    [0.86, tab(auBout(14, 1.6, 4)), tab(auBout(27.4, 4.5, 0))],          // la ligne droite (la démonstration)
    [0.92, tab(auBout(150, 6, 2.5)), tab(F.clone().addScaledVector(gauche, -30).setY(8))],   // l'éventail
    [0.96, tab(auBout(212, 20, 8)), tab(F.clone().addScaledVector(sens, 6).addScaledVector(gauche, -12).setY(4)), tab(F.clone().addScaledVector(sens, 6).setY(-1.5))],   // le bâtiment de la R&D (les développements sur mesure)
    [1.00, tab(auBout(228, 22, 9)), tab(F.clone().addScaledVector(sens, 6).addScaledVector(gauche, -9).setY(3.5)), tab(F.clone().addScaledVector(sens, 6).setY(-1.5))],
  ];
  const cheminP = new THREE.CatmullRomCurve3(STATIONS.map(s => new THREE.Vector3(...s[1])), false, 'centripetal');
  const cheminV = new THREE.CatmullRomCurve3(STATIONS.map(s => new THREE.Vector3(...s[2])), false, 'centripetal');
  const cheminVHauteur = new THREE.CatmullRomCurve3(STATIONS.map(s => new THREE.Vector3(...(s[3] || s[2]))), false, 'centripetal');
  let enHauteur = false;
  // progression du défilement → paramètre des courbes (les stations y sont équidistantes)
  function parametre(p) {
    for (let k = 1; k < STATIONS.length; k++) if (p <= STATIONS[k][0]) {
      const a = STATIONS[k - 1][0], b = STATIONS[k][0];
      return (k - 1 + (p - a) / (b - a)) / (STATIONS.length - 1);
    }
    return 1;
  }
  const pos = new THREE.Vector3(), vise = new THREE.Vector3(), cibleP = new THREE.Vector3(), cibleV = new THREE.Vector3();
  const vitP = new THREE.Vector3(), vitV = new THREE.Vector3();
  let premiere = true;
  // amortissement critique (comme SmoothDamp) d'un vecteur vers sa cible
  function amortir(v, cible, vitesse, duree, dt) {
    const o = 2 / duree, x = o * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const ch = v.clone().sub(cible), tmp = vitesse.clone().addScaledVector(ch, o).multiplyScalar(dt);
    vitesse.sub(tmp.clone().multiplyScalar(o)).multiplyScalar(e);
    v.copy(cible).add(ch.add(tmp).multiplyScalar(e));
  }
  // la pose d'une station donnée (pour le mode sans animation)
  const stationProche = (p) => STATIONS.reduce((m, s) => (Math.abs(s[0] - p) < Math.abs(m[0] - p) ? s : m));

  function taille() {
    const l = toile.clientWidth, h = toile.clientHeight;
    rendu.setSize(l, h, false);
    composeur.setPixelRatio(ratio);
    composeur.setSize(l, h);
    camera.aspect = l / h;
    enHauteur = l < h;
    camera.fov = l < 568 ? 65 : l < 980 ? 50 : 35;
    camera.updateProjectionMatrix();
    degrade.uniforms.uRapport.value = l / h;
    fxaa.material.uniforms.resolution.value.set(1 / (l * ratio), 1 / (h * ratio));
    objets.taille(h * ratio / (2 * Math.tan(camera.fov * Math.PI / 360)));   // pixels par unité, à une unité de distance
  }

  // une image : progression du parcours (0 → 1), souris (-0,5 → 0,5), temps, réglage
  function image({ progression, souris, temps, dt, anime, intro }) {
    const p = anime ? progression : stationProche(progression)[0];
    const t = parametre(p);
    cheminP.getPoint(t, cibleP);
    (enHauteur ? cheminVHauteur : cheminV).getPoint(t, cibleV);
    // l'arrivée : depuis un peu plus haut et plus loin, la caméra se pose sur la première station
    if (intro < 1) { const e = 1 - intro; cibleP.add(new THREE.Vector3(-6 * e, 3.5 * e, 10 * e)); }
    if (premiere || !anime) { pos.copy(cibleP); vise.copy(cibleV); premiere = false; }
    else { amortir(pos, cibleP, vitP, intro < 1 ? 0.6 : 0.2, dt); amortir(vise, cibleV, vitV, intro < 1 ? 0.6 : 0.2, dt); }
    // le suivi de la souris : un léger pivot autour du point visé
    const d = pos.clone().sub(vise), s = anime ? souris : { x: 0, y: 0 };
    d.applyAxisAngle(new THREE.Vector3(0, 1, 0), -s.x * 0.11);
    d.y += -s.y * 0.044 * d.length();
    camera.position.copy(vise).add(d);
    camera.lookAt(vise);
    for (const m of matieres) m.uniforms.uTemps.value = anime ? temps * 2 : 0;
    objets.animer(temps, camera, anime, progression);
    composeur.render();
  }

  // dégradation si la machine peine : moins de pixels, puis plus de halo
  let niveau = 0;
  function alleger() {
    niveau++;
    if (niveau === 1) { ratio = Math.min(ratio, 1); taille(); }
    else if (niveau === 2) halo.enabled = false;
    return niveau <= 2;
  }

  // les moments des stations, calés sur les textes par la page (une valeur par station), et
  // ceux des objets (les modules du cube)
  function placer(valeurs, moments) {
    objets.placer(moments);
    let prec = -1;
    valeurs.forEach((v, k) => { STATIONS[k][0] = Math.max(v, prec + 1e-4); prec = STATIONS[k][0]; });
  }

  return { taille, image, alleger, placer };
}
