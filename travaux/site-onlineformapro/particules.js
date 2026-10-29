// Les données de l'ouverture : l'intelligence artificielle qui accompagne la traversée, en un
// seul système net et régulier (pas de brume, pas d'éléments épars). Deux familles de points,
// chacune dessinée en une passe (mélange additif, brouillard), tout le mouvement étant
// calculé par la carte graphique :
//  - la grille : une matrice de points serrés posée sous les routes, sur une bande de 45 unités
//    de part et d'autre du trajet de la caméra ; des ondes en partent, centrées sur la caméra, et
//    l'accompagnent tout du long ; çà et là, un point s'allume un instant, comme une donnée ;
//  - les flux : des paquets qui circulent sur les routes, entre les voies (blancs et lavande
//    dans un sens, rouges et orangés dans l'autre), plus vite quand on fait défiler.
import * as THREE from 'three';

// un tirage pseudo-aléatoire reproductible (le même ciel à chaque visite)
function tirage(s) {
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

// les teintes, en couleurs linéaires (comme les lignes) : lavande, blanc, rose, orangé
const TEINTES = { lavande: [0.46, 0.4, 1.0], blanc: [0.95, 0.94, 1.0], rose: [1.0, 0.36, 0.5], orange: [1.0, 0.3, 0.02] };
function teinte(r, poids) {
  let x = r() * poids.reduce((a, [, p]) => a + p, 0);
  for (const [nom, p] of poids) if ((x -= p) <= 0) return TEINTES[nom];
  return TEINTES[poids[0][0]];
}

// -------------------------------------------------------------------- nuanceurs
// MODE 2 : paquets des routes (glissement le long de aAxe, en boucle sur une courte longueur ;
// aParam : vitesse, longueur) ; MODE 3 : la grille (ondes autour de la caméra, clignotements)
const SOMMETS = `
  uniform float uTemps; uniform float uFlux; uniform float uEchelle; uniform float uTailleMax;
  uniform float uProche; uniform float uLoin; uniform vec3 uCamera; uniform float uPas; uniform float uMax;
  attribute vec3 aCouleur; attribute float aTaille; attribute float aGraine; attribute vec2 aParam;
  #if MODE == 2
  attribute vec3 aAxe;
  #endif
  varying vec3 vCouleur; varying float vAlpha;
  void main() {
    vec3 p = position, couleur = aCouleur; float g = aGraine, eclat = 1.0;
    #if MODE == 2
      float f = fract(g * 7.31 + uFlux * aParam.x / aParam.y);
      p += aAxe * (f - 0.5) * aParam.y;
      eclat = sin(3.14159 * f);
    #else
      // les ondes : un front net tous les 26 unités, qui s'éloigne de la caméra à 9 unités par
      // seconde, suivi d'une traîne lumineuse vers l'intérieur
      float r = length(p.xz - uCamera.xz);
      float x = fract((uTemps * 9.0 - r) / 26.0) * 26.0;
      float onde = exp(-x / 1.8) * (1.0 - smoothstep(12.0, 75.0, r));
      // les données : un point sur 120 s'allume, tiré au sort trois fois par seconde
      float clin = step(0.9917, fract(sin(dot(floor(p.xz / uPas + 0.5), vec2(12.9898, 78.233)) + floor(uTemps * 3.0) * 7.13) * 43758.5453));
      eclat = 0.75 + 2.6 * onde + 3.0 * clin;
      couleur = mix(mix(couleur, vec3(1.0), min(onde, 1.0) * 0.6), g < 0.3 ? vec3(1.0, 0.36, 0.5) : vec3(1.0), clin);
    #endif
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(0.001, -mv.z);
    float px = aTaille * uEchelle / dist;
    float alpha = eclat * (1.0 - smoothstep(uProche, uLoin, dist)) * smoothstep(0.8, 3.0, dist);
    // un point plus petit qu'un pixel et demi s'atténue au lieu de rapetisser
    if (px < 1.5) { alpha *= px / 1.5; px = 1.5; }
    gl_PointSize = min(px, uTailleMax * uMax);
    vAlpha = alpha; vCouleur = couleur;
    gl_Position = projectionMatrix * mv;
  }`;
const FRAGMENTS = `
  uniform float uOpacite;
  varying vec3 vCouleur; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.45, 1.0, d);          // un point net, au bord à peine adouci
    gl_FragColor = vec4(vCouleur, a * vAlpha * uOpacite);
  }`;

const communs = { uTemps: { value: 0 }, uFlux: { value: 0 }, uEchelle: { value: 1000 }, uTailleMax: { value: 12 }, uCamera: { value: new THREE.Vector3() } };
function points(mode, n, remplir, { opacite = 1, proche = 30, loin = 170, pas = 1, max = 1 } = {}) {
  const pos = new Float32Array(n * 3), coul = new Float32Array(n * 3), taille = new Float32Array(n), graine = new Float32Array(n), param = new Float32Array(n * 2);
  const axe = mode === 2 ? new Float32Array(n * 3) : null;
  remplir((i, p, c, t, pa = [0, 0], ax = null) => {
    pos.set([p.x, p.y, p.z], i * 3); coul.set(c, i * 3); taille[i] = t; param.set(pa, i * 2);
    if (ax) axe.set([ax.x, ax.y, ax.z], i * 3);
  }, n);
  for (let i = 0; i < n; i++) graine[i] = (i * 0.6180339887) % 1;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aCouleur', new THREE.BufferAttribute(coul, 3));
  g.setAttribute('aTaille', new THREE.BufferAttribute(taille, 1));
  g.setAttribute('aGraine', new THREE.BufferAttribute(graine, 1));
  g.setAttribute('aParam', new THREE.BufferAttribute(param, 2));
  if (axe) g.setAttribute('aAxe', new THREE.BufferAttribute(axe, 3));
  const m = new THREE.ShaderMaterial({
    vertexShader: SOMMETS, fragmentShader: FRAGMENTS, defines: { MODE: mode },
    uniforms: { ...communs, uOpacite: { value: opacite }, uProche: { value: proche }, uLoin: { value: loin }, uPas: { value: pas }, uMax: { value: max } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const o = new THREE.Points(g, m);
  o.frustumCulled = false;                       // déplacés par la carte graphique
  return o;
}

// -------------------------------------------------------------------- la grille et les flux
// chemin : le trajet de la caméra ; routes : les axes des routes ; facteur : la part du
// nombre de points (moins sur les petits écrans)
export function creerParticules(scene, { chemin, routes, facteur = 1 }) {
  const r = tirage(20261029);
  const P = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), HAUT = new THREE.Vector3(0, 1, 0);
  const repere = (courbe, u) => { courbe.getPointAt(u, P); courbe.getTangentAt(u, T); N.crossVectors(T, HAUT).normalize(); };

  // la grille : les nœuds d'un quadrillage serré (pas de 0,9 unité, 1,4 sur petit écran)
  // situés à moins de 45 unités du trajet de la caméra (mesuré au sol), un peu sous les routes ;
  // ses points ne dépassent pas 5 pixels (densité 1), même tout près
  const PAS = facteur < 1 ? 1.4 : 0.9, BANDE = 45, Y = -0.4;
  const echantillons = chemin.getSpacedPoints(Math.ceil(chemin.getLength() / 4));
  const cases = new Map(), cle = (i, j) => i + ',' + j;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const e of echantillons) {
    const k = cle(Math.floor(e.x / BANDE), Math.floor(e.z / BANDE));
    if (!cases.has(k)) cases.set(k, []);
    cases.get(k).push(e);
    x0 = Math.min(x0, e.x); x1 = Math.max(x1, e.x); z0 = Math.min(z0, e.z); z1 = Math.max(z1, e.z);
  }
  const noeuds = [];
  for (let x = Math.floor((x0 - BANDE) / PAS) * PAS; x <= x1 + BANDE; x += PAS) {
    for (let z = Math.floor((z0 - BANDE) / PAS) * PAS; z <= z1 + BANDE; z += PAS) {
      const ci = Math.floor(x / BANDE), cj = Math.floor(z / BANDE);
      let proche = false;
      for (let di = -1; di <= 1 && !proche; di++) for (let dj = -1; dj <= 1 && !proche; dj++) {
        for (const e of cases.get(cle(ci + di, cj + dj)) || []) if ((e.x - x) ** 2 + (e.z - z) ** 2 < BANDE * BANDE) { proche = true; break; }
      }
      if (proche) noeuds.push(x, z);
    }
  }
  const grille = points(3, noeuds.length / 2, (ecrire, n) => {
    const p = new THREE.Vector3();
    for (let i = 0; i < n; i++) ecrire(i, p.set(noeuds[2 * i], Y, noeuds[2 * i + 1]), TEINTES.lavande, 0.035);
  }, { proche: 12, loin: 80, pas: PAS, max: 5 / 12 });

  // les flux : des paquets sur les routes, entre les voies
  const longueurs = routes.map(c => c.getLength()), total = longueurs.reduce((a, b) => a + b, 0);
  const flux = points(2, Math.round(9000 * facteur), (ecrire, n) => {
    const p = new THREE.Vector3(), d = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      let x = r() * total, k = 0;
      while (x > longueurs[k] && k < routes.length - 1) x -= longueurs[k++];
      repere(routes[k], r());
      const droite = r() < 0.5, voie = [0.9, 1.7, 2.2][Math.floor(r() * 3)] + gauss(r) * 0.12;
      p.copy(P).addScaledVector(N, droite ? voie : -voie).setY(0.1 + r() * 0.3);
      d.copy(T).setY(0).normalize().multiplyScalar(droite ? 1 : -1);
      const c = droite ? teinte(r, [['blanc', 5], ['lavande', 3]]) : teinte(r, [['rose', 4], ['orange', 3]]);
      ecrire(i, p, c, 0.022 + 0.018 * r(), [3 + 6 * r(), 2 + 4 * r()], d);
    }
  }, { loin: 140 });

  const nuees = [grille, flux];
  for (const o of nuees) scene.add(o);
  return {
    // pixels par unité à une unité de distance, et la densité de pixels
    taille(echelle, ratio) { communs.uEchelle.value = echelle; communs.uTailleMax.value = 12 * ratio; },
    // vitesse : celle de la progression du parcours (par seconde), qui accélère les paquets
    animer(temps, dt, camera, vitesse, anime) {
      communs.uTemps.value = anime ? temps : 0;
      if (anime) communs.uFlux.value += dt * (1 + Math.min(5, Math.abs(vitesse) * 40));
      communs.uCamera.value.copy(camera.position);
    },
    // si la machine peine : la moitié des paquets (la grille reste entière, régulière)
    alleger() { flux.geometry.setDrawRange(0, Math.floor(flux.geometry.attributes.position.count / 2)); },
  };
}
