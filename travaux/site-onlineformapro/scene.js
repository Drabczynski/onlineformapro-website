// Les traces de lumière de l'ouverture du site Onlineformapro.
//
// L'ouverture est une longue section : la scène y reste épinglée à l'écran pendant que les
// messages défilent. Huit traces de lumière y dessinent, d'étape en étape : le flux
// (ouverture), la route de 25 ans d'innovation, les six tuiles de la solution modulaire,
// l'onde de l'IA, le globe des 17 millions d'utilisateurs, la coche de l'évaluation et,
// pour finir, le Ó du logo. Entre deux étapes, chaque point d'une trace glisse de la
// première forme vers la seconde, au rythme du défilement ; au chargement, les traces se
// dessinent d'un bout à l'autre. Le cadrage suit les messages : le dessin se décale du côté
// où le texte lui laisse de la place (attribut data-cadre de chaque moment).
//
// Accessibilité : la scène est décorative (aria-hidden), tout le contenu est dans la page.
// Mouvement réduit (réglage du système, ou bouton « Animations » de l'en-tête : site.js
// pose alors la classe mouvement-reduit sur <html>) : ni tracé au chargement, ni
// respiration, ni éclats, ni suivi du pointeur ; formes et cadrages changent d'un coup.
// Sans WebGL, la scène garde son fond dégradé.
import * as THREE from 'three';

const toile = document.getElementById('scene');
const plateau = toile.parentElement;           // la scène épinglée
const ouverture = plateau.parentElement;       // la longue section qui la porte
const compteur = document.querySelector('.compteur');
const racine = document.documentElement;

let rendu;
try {
  rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  racine.classList.add('sans-webgl');
  throw e;
}
racine.classList.add('avec-webgl');

const petit = matchMedia('(max-width: 760px)').matches;
const N = 8;                                   // traces
const M = petit ? 200 : 300;                   // points par trace
const LARGEUR = petit ? 0.5 : 0.4;             // demi-largeur du halo, en unités de la scène

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

// -------------------------------------------------------------------- outils de tracé
const cr = (i) => (i - (N - 1) / 2) / ((N - 1) / 2);         // -1 … 1, de trace en trace
const alea = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// n points à intervalles réguliers le long d'une ligne brisée
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

// courbe de Catmull-Rom passant par des points de contrôle
function spline(pts, n) {
  const dense = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[s + 1], p3 = pts[Math.min(pts.length - 1, s + 2)];
    for (let k = 0; k < 40; k++) {
      const t = k / 40, t2 = t * t, t3 = t2 * t;
      dense.push(p1.map((_, d) => 0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t +
        (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  dense.push(pts[pts.length - 1]);
  return reechantillonne(dense, n);
}

// rectangle arrondi posé à plat (hauteur y), depuis le milieu du bord du fond, puis par la
// droite, le devant, la gauche, jusqu'au point de départ
function rectArrondi(cx, cz, l, p, r, y) {
  const pts = [[cx, y, cz - p / 2]];
  const coin = (ox, oz, a0) => {
    for (let k = 0; k <= 8; k++) { const a = a0 + (Math.PI / 2) * k / 8; pts.push([ox + r * Math.cos(a), y, oz + r * Math.sin(a)]); }
  };
  coin(cx + l / 2 - r, cz - p / 2 + r, -Math.PI / 2);
  coin(cx + l / 2 - r, cz + p / 2 - r, 0);
  coin(cx - l / 2 + r, cz + p / 2 - r, Math.PI / 2);
  coin(cx - l / 2 + r, cz - p / 2 + r, Math.PI);
  pts.push([cx, y, cz - p / 2]);
  return pts;
}

// -------------------------------------------------------------------- les dessins
// 0 · le flux : les traces arrivent de l'horizon, à gauche, et filent vers le bas de l'écran,
// à droite, en s'écartant à mesure qu'elles approchent
const FLUX = Array.from({ length: N }, (_, i) => spline([
  [-72, 0.8, -95], [-32, -0.8, -44], [-10, -2.4, -14], [5, -3.6, -1], [17, -5.0, 7], [30, -7.0, 13],
], M).map(([x, y, z], j) => {
  const e = 0.6 + 2.0 * (j / (M - 1));
  return [x + cr(i) * 0.8 * e, y + cr(i) * 0.85 * e, z + cr(i) * 3.4 * e];
}));

// 1 · la route : 25 ans de chemin, qui serpente jusqu'à l'horizon, ses voies côte à côte
const ROUTE = Array.from({ length: N }, (_, i) => Array.from({ length: M }, (_, j) => {
  const t = j / (M - 1);
  return [7.5 * Math.sin(t * Math.PI * 2.3 + 0.9) * (1 - 0.55 * t) + cr(i) * 1.1 * (1 - 0.65 * t), -3.4 + 2.6 * t, 12 - 96 * t];
}));

// 2 · les tuiles : six traces font chacune le tour d'une tuile (les six solutions), en
// épingle à cheveux : celles du fond viennent de l'horizon et y retournent, celles de
// devant viennent du bas de l'écran et y repartent, sans jamais se croiser ; deux autres
// bordent l'ensemble, comme des routes
const SOL = -2.2;
const TUILES = Array.from({ length: N }, (_, i) => {
  if (i >= 6) {
    const s = i === 6 ? -1 : 1;
    return spline([[s * 7, SOL, -90], [s * 9.5, SOL, -30], [s * 11, SOL, -8], [s * 13, SOL, 6], [s * 17, SOL, 30]], M);
  }
  const fond = i < 3, cx = (i % 3 - 1) * 6.2, cz = fond ? -11 : -5.6, l = 5.2, p = 3.4;
  let tour = rectArrondi(cx, cz, l, p, 0.8, SOL);
  // pour celles de devant, le tour part du milieu du bord avant
  if (!fond) tour = [[cx, SOL, cz + p / 2], ...tour.slice(19, 37), ...tour.slice(0, 19), [cx, SOL, cz + p / 2]];
  const bord = fond ? cz - p / 2 : cz + p / 2, sens = fond ? -1 : 1;
  const loin = (dx) => fond ? [cx * 1.3 + dx, SOL, -85] : [cx * 2.4 + dx * 3, SOL, 30];
  return reechantillonne([loin(-0.4), [cx - 0.35, SOL, bord + sens * 2], ...tour,
    [cx + 0.35, SOL, bord + sens * 2], loin(0.4)], M);
});

// 3 · l'onde : chaque trace s'élève en deux pics, comme le signal d'une voix
const ONDE = Array.from({ length: N }, (_, i) => Array.from({ length: M }, (_, j) => {
  const t = j / (M - 1), x = -30 + 60 * t, z = -2.5 - 1.3 * i;
  const pic = (c, a, s) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const y = -3.5 + pic(-7 + 14 * alea(i, 1) - 3, 2.4 + 4.2 * alea(i, 2), 1.6 + 1.2 * alea(i, 3))
                  + pic(2 + 8 * alea(i, 4), 1.8 + 3.6 * alea(i, 5), 1.4 + 1.0 * alea(i, 6));
  return [x, y, z + 7 * (1 - t) ** 3];
}));

// 4 · le globe : cinq méridiens et trois parallèles, qui tournent lentement sur leur axe
let rotationGlobe = 0.6;
const GLOBE_R = 5.6, INCLINAISON = 0.38;
function globe(i, t) {
  const a = Math.PI * 2 * t;
  let x, y, z;
  if (i < 5) {
    const phi = i * Math.PI / 5 + rotationGlobe;
    [x, y, z] = [GLOBE_R * Math.sin(a) * Math.cos(phi), GLOBE_R * Math.cos(a), GLOBE_R * Math.sin(a) * Math.sin(phi)];
  } else {
    const lat = (i - 6) * 0.62, r = GLOBE_R * Math.cos(lat);
    [x, y, z] = [r * Math.cos(a + rotationGlobe), GLOBE_R * Math.sin(lat), r * Math.sin(a + rotationGlobe)];
  }
  [y, z] = [y * Math.cos(INCLINAISON) - z * Math.sin(INCLINAISON), y * Math.sin(INCLINAISON) + z * Math.cos(INCLINAISON)];
  return [x, y + 0.6, z - 6];
}

// 5 · la coche : les traces partent du petit bras, tracent ✓ et filent vers le haut
const COCHE = Array.from({ length: N }, (_, i) => spline([
  [-14, 1.4], [-9, -1.2], [-3.2, -4.4], [8.5, 7.2], [32, 24],
].map(([x, y]) => [x + cr(i) * 0.5, y + cr(i) * 0.95, -1.5 + cr(i) * 2.6]), M));

// 6 · le Ó du logo : cinq anneaux serrés font l'épaisseur du O (de 42 % à 100 % du rayon),
// trois traits la barre posée dessus, aux proportions du logo (barre de 41 sur 134,
// inclinée de 29°, rayon du O 77)
const O_R = 4, O_Y = -2.5, LOGO_Z = -3;
const LOGO = Array.from({ length: N }, (_, i) => {
  if (i < 5) {
    // un peu plus d'un tour : le début et la fin de l'anneau, qui s'estompent, se recouvrent
    const r = O_R * (0.53 + 0.36 * i / 4), a0 = Math.PI / 2 + i * 0.5, tour = Math.PI * 2 / 0.94;
    return Array.from({ length: M }, (_, j) => {
      const a = a0 - tour * (j / (M - 1));
      return [r * Math.cos(a), O_Y + r * Math.sin(a), LOGO_Z];
    });
  }
  const p1 = [-1.311 * O_R, O_Y + 1.191 * O_R], p2 = [0.209 * O_R, O_Y + 2.046 * O_R];
  const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = [-(p2[1] - p1[1]) / d, (p2[0] - p1[0]) / d];
  const o = (i - 6) * 0.52 * 0.267 * O_R;
  return reechantillonne([[p1[0] + n[0] * o, p1[1] + n[1] * o, LOGO_Z], [p2[0] + n[0] * o, p2[1] + n[1] * o, LOGO_Z]], M);
});

const tableau = (T) => (i, t) => T[i][Math.round(t * (M - 1))];
const FORMES = [tableau(FLUX), tableau(ROUTE), tableau(TUILES), tableau(ONDE), globe, tableau(COCHE), tableau(LOGO)];

// pour chaque dessin : l'épaisseur des traces, leur cœur plein ou fin (le Ó les veut
// pleines et jointives, comme l'aplat du logo) et l'ampleur de leur respiration (nulle
// pour le logo, qui doit rester net)
const EPAISSEURS = [1, 1, 1, 1, 1, 1, 1.25];
const PLEINS = [0, 0, 0, 0, 0, 0, 1];
const SOUPLESSES = [1, 1, 0.4, 1, 0.5, 0.8, 0];

// où se place la caméra pour chaque dessin : position, point visé
const CAMERAS = [
  [[0, 1.2, 15], [0, -1.2, -10]],
  [[0, 2.9, 14], [0, -0.6, -30]],
  [[0, 8.5, 13], [0, -2.6, -8.5]],
  [[0, 1.0, 16.5], [0, 0.4, -6]],
  [[0, 1.4, 15.5], [0, 0.6, -6]],
  [[1.5, 0.6, 19], [2, 0.8, -2]],
  [[0, 0.4, 16.5], [0, 0.2, -3]],
];

// -------------------------------------------------------------------- les traces
// les couleurs de la marque (rouge Onlineformapro, rose et lilas du titre, ambre) et un bleu
// en contrepoint ; le Ó du logo passe tout au rouge
const COULEURS = [['#FF2D55', '#FF8A3D'], ['#FFB648', '#FFE07A'], ['#3D7BFF', '#47D7FF'], ['#D31E44', '#FF5FA2'],
  ['#B26BFF', '#FF8FB1'], ['#47D7FF', '#3D7BFF'], ['#FF5FA2', '#FFB648'], ['#FF4040', '#FF2D55']];
const ROUGES = COULEURS.map(() => ['#D7204A', '#D7204A']);
const PALETTES = FORMES.map((_, k) => (k === 6 ? ROUGES : COULEURS).map(p => p.map(c => new THREE.Color(c))));

const nuanceur = {
  vertexShader: `
    attribute float u; attribute float cote;
    varying float vU; varying float vCote;
    void main() { vU = u; vCote = cote; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 colA; uniform vec3 colB; uniform float temps; uniform float eclats; uniform float graine; uniform float trace;
    uniform float plein;
    varying float vU; varying float vCote;
    // la lumière s'ajoute au fond (traces) ; quand le dessin devient « plein » (le logo),
    // la trace couvre aussi le fond, comme une peinture : sortie prémultipliée, dont
    // l'opacité passe de 0 (pure addition) à la couverture du cœur
    void main() {
      float s = vCote;
      float coeur = mix(exp(-s * s * 90.0), 1.0 - smoothstep(0.62, 1.0, abs(s)), plein);
      float halo = exp(-s * s * 5.0) * 0.26;
      float bouts = smoothstep(0.0, 0.06, vU) * smoothstep(1.0, 0.94, vU);
      float p = fract(vU * 2.2 - temps * 0.09 + graine);
      float eclat = eclats * smoothstep(0.0, 0.04, p) * smoothstep(0.22, 0.04, p);
      float tracee = 1.0 - smoothstep(trace - 0.05, trace, vU);
      float tete = (1.0 - step(1.04, trace)) * exp(-pow((vU - trace + 0.02) * 30.0, 2.0)) * 1.6;
      vec3 c = mix(colA, colB, vU);
      c = mix(c, vec3(1.0), coeur * 0.5 * (1.0 - 0.8 * plein));
      float lumiere = (coeur * 1.1 + halo * (1.0 - 0.85 * plein)) * mix(0.62 + 0.9 * eclat + tete, 1.0, plein);
      float present = bouts * tracee;
      gl_FragColor = vec4(c * lumiere * present, coeur * plein * present);
    }`,
};

const traces = [];
for (let i = 0; i < N; i++) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(M * 2 * 3), u = new Float32Array(M * 2), cote = new Float32Array(M * 2);
  const idx = [];
  for (let j = 0; j < M; j++) {
    u[2 * j] = u[2 * j + 1] = j / (M - 1);
    cote[2 * j] = -1; cote[2 * j + 1] = 1;
    if (j < M - 1) { const a = 2 * j; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('u', new THREE.BufferAttribute(u, 1));
  g.setAttribute('cote', new THREE.BufferAttribute(cote, 1));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    ...nuanceur, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: { colA: { value: new THREE.Color() }, colB: { value: new THREE.Color() }, temps: { value: 0 },
      eclats: { value: 1 }, graine: { value: alea(i, 9) }, trace: { value: 2 }, plein: { value: 0 } },
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);
  traces.push({ g, pos, mat, centre: new Float32Array(M * 3) });
}

// une poussière d'étoiles, comme sur l'accueil actuel, pour la profondeur
const NB = petit ? 180 : 360, poussiere = new Float32Array(NB * 3);
for (let k = 0; k < NB; k++) {
  poussiere[3 * k] = (alea(k, 11) - 0.5) * 80; poussiere[3 * k + 1] = (alea(k, 12) - 0.5) * 40;
  poussiere[3 * k + 2] = -alea(k, 13) * 80 + 6;
}
const gp = new THREE.BufferGeometry();
gp.setAttribute('position', new THREE.BufferAttribute(poussiere, 3));
const points = new THREE.Points(gp, new THREE.PointsMaterial({ color: 0xc8d0ff, size: 0.08, transparent: true,
  opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(points);

// -------------------------------------------------------------------- défilement → dessin, cadrage
const etapes = [...ouverture.querySelectorAll('[data-forme]')];
const moments = [...ouverture.querySelectorAll('[data-cadre]')];
let bornesFormes = [], bornesCadres = [], portrait = false;
const lireCadre = (el) => (portrait ? (el.dataset.cadreMobile || '0 0.3') : el.dataset.cadre).split(' ').map(Number);
function mesure() {
  const y = scrollY, haut = (el) => el.getBoundingClientRect().top + y;
  bornesFormes = etapes.map(el => ({ haut: haut(el), v: [+el.dataset.forme] }));
  bornesCadres = moments.map(el => ({ haut: haut(el), v: lireCadre(el) }));
}
const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// la valeur d'une suite de repères à la position du défilement : chaque repère prend le
// relais du précédent pendant qu'il monte dans l'écran ; sans animation, d'un coup
function suivre(bornes, avant, apres, continu) {
  if (!bornes.length) return [0, 0];
  const h = innerHeight, centre = scrollY + h * 0.5, v = bornes[0].v.slice();
  for (let k = 1; k < bornes.length; k++) {
    const f = continu ? lisse(bornes[k].haut - h * avant, bornes[k].haut + h * apres, centre)
                      : (bornes[k].haut <= centre ? 1 : 0);
    for (let d = 0; d < v.length; d++) v[d] += (bornes[k].v[d] - bornes[k - 1].v[d]) * f;
  }
  return v;
}

// -------------------------------------------------------------------- animation ou pas
// le réglage vient de site.js (système ou bouton « Animations »), par la classe de <html>
let anime = !racine.classList.contains('mouvement-reduit');
let debutTrace = null;                         // le tracé au chargement
addEventListener('ofp:animations', () => { anime = !racine.classList.contains('mouvement-reduit'); demande(); });

// -------------------------------------------------------------------- dessin
const va = new THREE.Vector3(), vb = new THREE.Vector3(), vise = new THREE.Vector3(), cam = new THREE.Vector3();
const T = new THREE.Vector3(), V = new THREE.Vector3(), Nv = new THREE.Vector3(), ca = new THREE.Color(), cb = new THREE.Color();
let pointeur = [0, 0], cible = [0, 0], etapeAffichee = -1;
addEventListener('pointermove', e => { cible = [e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5]; }, { passive: true });

function taille() {
  const w = plateau.clientWidth, h = plateau.clientHeight;
  rendu.setPixelRatio(Math.min(devicePixelRatio, petit ? 1.5 : 1.75));
  rendu.setSize(w, h, false);
  camera.aspect = w / h;
  portrait = w / h < 0.8;
  camera.fov = portrait ? 66 : 50;   // sur téléphone, un champ plus large pour garder les dessins entiers
  mesure();
  demande();
}

let enCours = false;
function demande() { if (!enCours) { enCours = true; requestAnimationFrame(image); } }

function image(ms) {
  enCours = false;
  const t = ms / 1000;
  let s = suivre(bornesFormes, 0.35, 0.35, anime)[0];
  const k = Math.min(FORMES.length - 2, Math.floor(s)), f = Math.min(1, s - k);
  const souffle = anime ? 1 : 0;
  if (anime && debutTrace === null) debutTrace = t;
  // le tracé part de l'horizon : sa partie lointaine, longue mais minuscule à l'écran, passe vite
  const trace = anime ? Math.pow(Math.min(1, (t - debutTrace) / 2.2), 0.6) * 1.08 + (t - debutTrace > 2.2 ? 1 : 0) : 2;
  if (anime) rotationGlobe = 0.6 + t * 0.12;

  // la caméra, d'un cadrage à l'autre, plus un léger suivi du pointeur
  pointeur = pointeur.map((p, d) => p + (cible[d] - p) * 0.05 * souffle);
  va.fromArray(CAMERAS[k][0]).lerp(vb.fromArray(CAMERAS[k + 1][0]), f);
  cam.copy(va).add(new THREE.Vector3(pointeur[0] * 1.6, -pointeur[1] * 0.9, 0));
  vise.fromArray(CAMERAS[k][1]).lerp(vb.fromArray(CAMERAS[k + 1][1]), f);
  if (portrait) cam.sub(vise).multiplyScalar(1.18).add(vise);   // sur téléphone, un peu de recul
  camera.position.copy(cam); camera.lookAt(vise);
  // le dessin se décale du côté libre de l'écran (décalage de la projection, en fraction d'écran)
  const [dx, dy] = suivre(bornesCadres, 0.45, 0.2, anime);
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8] = -dx;
  camera.projectionMatrix.elements[9] = -dy;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

  const A = FORMES[k], B = FORMES[k + 1];
  const largeur = LARGEUR * (EPAISSEURS[k] + (EPAISSEURS[k + 1] - EPAISSEURS[k]) * f);
  const ampleur = souffle * 0.12 * (SOUPLESSES[k] + (SOUPLESSES[k + 1] - SOUPLESSES[k]) * f);
  const plein = PLEINS[k] + (PLEINS[k + 1] - PLEINS[k]) * f;
  for (let i = 0; i < N; i++) {
    const r = traces[i], c = r.centre;
    // un léger décalage entre traces : elles ne changent pas de forme toutes ensemble
    const fi = Math.min(1, Math.max(0, f * 1.25 - (i / N) * 0.25));
    const e = fi * fi * (3 - 2 * fi);
    for (let j = 0; j < M; j++) {
      const u = j / (M - 1), a = A(i, u), b = B(i, u);
      const ondule = ampleur * Math.sin(t * 0.8 + u * 9 + i);
      c[3 * j] = a[0] + (b[0] - a[0]) * e;
      c[3 * j + 1] = a[1] + (b[1] - a[1]) * e + ondule;
      c[3 * j + 2] = a[2] + (b[2] - a[2]) * e;
    }
    // la trace fait face à la caméra : on l'élargit perpendiculairement à sa direction
    for (let j = 0; j < M; j++) {
      const j0 = Math.max(0, j - 1), j1 = Math.min(M - 1, j + 1);
      T.set(c[3 * j1] - c[3 * j0], c[3 * j1 + 1] - c[3 * j0 + 1], c[3 * j1 + 2] - c[3 * j0 + 2]).normalize();
      V.set(cam.x - c[3 * j], cam.y - c[3 * j + 1], cam.z - c[3 * j + 2]).normalize();
      Nv.crossVectors(T, V).normalize().multiplyScalar(largeur);
      for (const [o, sg] of [[0, -1], [1, 1]]) {
        r.pos[(2 * j + o) * 3] = c[3 * j] + Nv.x * sg;
        r.pos[(2 * j + o) * 3 + 1] = c[3 * j + 1] + Nv.y * sg;
        r.pos[(2 * j + o) * 3 + 2] = c[3 * j + 2] + Nv.z * sg;
      }
    }
    r.g.attributes.position.needsUpdate = true;
    const u = r.mat.uniforms;
    u.colA.value.copy(ca.copy(PALETTES[k][i][0]).lerp(PALETTES[k + 1][i][0], e));
    u.colB.value.copy(cb.copy(PALETTES[k][i][1]).lerp(PALETTES[k + 1][i][1], e));
    u.temps.value = t;
    u.eclats.value = souffle;
    u.trace.value = trace;
    u.plein.value = plein;
  }
  points.rotation.y = souffle * t * 0.01;
  rendu.render(scene, camera);

  // le compteur d'étapes, en bas de la scène
  const n = Math.round(s);
  if (compteur && n !== etapeAffichee) {
    etapeAffichee = n;
    compteur.querySelector('.compteur-num').textContent = String(n + 1).padStart(2, '0');
    compteur.querySelector('.compteur-nom').textContent = etapes.find(el => +el.dataset.forme === n)?.dataset.nom || '';
  }
  // on ne redessine en continu que si l'ouverture est à l'écran (au repos : au défilement)
  const visible = ouverture.getBoundingClientRect().bottom > 0;
  if (((anime && visible) || trace < 1.08) && !document.hidden) demande();
}

addEventListener('resize', taille);
addEventListener('scroll', demande, { passive: true });
document.addEventListener('visibilitychange', demande);
new ResizeObserver(() => { mesure(); demande(); }).observe(document.body);
taille();
// pour les captures de contrôle : dessiner un instant précis sans attendre l'image suivante
window.__dessiner = (ms) => image(ms);
