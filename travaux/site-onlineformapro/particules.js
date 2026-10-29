// Les données de l'ouverture : l'intelligence artificielle qui accompagne la traversée, en
// traits et en points nets (pas de brume). Quatre familles, chacune dessinée en une passe
// (mélange additif, brouillard), tout le mouvement étant calculé par la carte graphique :
//  - les fibres : quatre lignes de lumière qui longent tout le trajet de la caméra, de part et
//    d'autre ; des paquets de données y filent dans le sens de la marche, en comètes, plus vite
//    quand on fait défiler ;
//  - les constellations : de petits réseaux posés le long du trajet (des nœuds reliés à leurs
//    plus proches voisins, comme un réseau de neurones) ; des impulsions parcourent leurs liens
//    et leurs nœuds s'allument tour à tour ;
//  - les flux : des paquets qui circulent sur les routes, entre les voies (blancs et lavande
//    dans un sens, rouges et orangés dans l'autre) ;
//  - les points : quelques milliers de points nets semés autour du trajet, pour la profondeur.
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
const TEINTES = { lavande: [0.46, 0.4, 1.0], blanc: [0.95, 0.94, 1.0], rose: [1.0, 0.2, 0.34], orange: [1.0, 0.3, 0.02] };
function teinte(r, poids) {
  let x = r() * poids.reduce((a, [, p]) => a + p, 0);
  for (const [nom, p] of poids) if ((x -= p) <= 0) return TEINTES[nom];
  return TEINTES[poids[0][0]];
}

const communs = { uTemps: { value: 0 }, uFlux: { value: 0 }, uEchelle: { value: 1000 }, uTailleMax: { value: 12 } };
const BROUILLARD = `
  float brouillard(float dist, float proche, float loin) { return (1.0 - smoothstep(proche, loin, dist)) * smoothstep(0.8, 3.0, dist); }`;

// -------------------------------------------------------------------- les points
// MODE 0 : fixes ; 1 : nœuds (qui s'allument tour à tour) ; 2 : paquets des routes (glissement
// le long de aAxe, en boucle sur une courte longueur ; aParam : vitesse, longueur)
const SOMMETS_POINTS = `
  uniform float uTemps; uniform float uFlux; uniform float uEchelle; uniform float uTailleMax;
  uniform float uProche; uniform float uLoin;
  attribute vec3 aCouleur; attribute float aTaille; attribute float aGraine; attribute vec2 aParam;
  #if MODE == 2
  attribute vec3 aAxe;
  #endif
  varying vec3 vCouleur; varying float vAlpha;
  ${BROUILLARD}
  void main() {
    vec3 p = position; float g = aGraine, eclat = 1.0;
    #if MODE == 1
      eclat = 0.45 + 1.4 * pow(0.5 + 0.5 * sin(uTemps * 1.7 + g * 40.0), 12.0);
    #elif MODE == 2
      float f = fract(g * 7.31 + uFlux * aParam.x / aParam.y);
      p += aAxe * (f - 0.5) * aParam.y;
      eclat = sin(3.14159 * f);
    #else
      eclat = 0.7 + 0.3 * sin(uTemps * (1.1 + 2.0 * g) + g * 91.0);
    #endif
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(0.001, -mv.z);
    float px = aTaille * uEchelle / dist, alpha = eclat * brouillard(dist, uProche, uLoin);
    if (px < 1.5) { alpha *= px / 1.5; px = 1.5; }
    gl_PointSize = min(px, uTailleMax);
    vAlpha = alpha; vCouleur = aCouleur;
    gl_Position = projectionMatrix * mv;
  }`;
const FRAGMENTS_POINTS = `
  uniform float uOpacite;
  varying vec3 vCouleur; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.45, 1.0, d);          // un point net, au bord à peine adouci
    gl_FragColor = vec4(vCouleur, a * vAlpha * uOpacite);
  }`;
function points(mode, n, remplir, { opacite = 1, proche = 30, loin = 170 } = {}) {
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
    vertexShader: SOMMETS_POINTS, fragmentShader: FRAGMENTS_POINTS, defines: { MODE: mode },
    uniforms: { ...communs, uOpacite: { value: opacite }, uProche: { value: proche }, uLoin: { value: loin } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const o = new THREE.Points(g, m);
  o.frustumCulled = false;
  return o;
}

// -------------------------------------------------------------------- les traits
// MODE 0 : fibres (aS : la distance le long de la fibre ; des comètes filent vers les aS
// croissants) ; 1 : liens des constellations (aS : de 0 à 1 le long du lien ; une impulsion
// le parcourt)
const SOMMETS_TRAITS = `
  uniform float uProche; uniform float uLoin;
  attribute vec3 aCouleur; attribute float aS; attribute float aGraine;
  varying vec3 vCouleur; varying float vS; varying float vGraine; varying float vBrouillard;
  ${BROUILLARD}
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vBrouillard = brouillard(-mv.z, uProche, uLoin);
    vCouleur = aCouleur; vS = aS; vGraine = aGraine;
    gl_Position = projectionMatrix * mv;
  }`;
const FRAGMENTS_TRAITS = `
  uniform float uTemps; uniform float uFlux; uniform float uFond; uniform float uOpacite;
  varying vec3 vCouleur; varying float vS; varying float vGraine; varying float vBrouillard;
  void main() {
    float eclat;
    #if MODE == 0
      // une comète toutes les 16 unités : la tête, puis une traîne de 2,5 unités derrière elle
      float d = fract((uFlux * 9.0 - vS) / 16.0 + vGraine) * 16.0;
      eclat = exp(-d / 2.5) * 2.4;
    #else
      float f = fract(uTemps * (0.25 + 0.3 * vGraine) + vGraine * 13.0);
      eclat = exp(-abs(vS - f) * 16.0) * 2.0;
    #endif
    gl_FragColor = vec4(vCouleur * (1.0 + eclat), (uFond + eclat) * vBrouillard * uOpacite);
  }`;
function traits(mode, geo, { fond, opacite = 1, proche = 30, loin = 170, segments = true }) {
  const m = new THREE.ShaderMaterial({
    vertexShader: SOMMETS_TRAITS, fragmentShader: FRAGMENTS_TRAITS, defines: { MODE: mode },
    uniforms: { ...communs, uFond: { value: fond }, uOpacite: { value: opacite }, uProche: { value: proche }, uLoin: { value: loin } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const o = segments ? new THREE.LineSegments(geo, m) : new THREE.Line(geo, m);
  o.frustumCulled = false;
  return o;
}
function geometrie(pos, coul, s, graine) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aCouleur', new THREE.BufferAttribute(new Float32Array(coul), 3));
  g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(s), 1));
  g.setAttribute('aGraine', new THREE.BufferAttribute(new Float32Array(graine), 1));
  return g;
}

// -------------------------------------------------------------------- les quatre familles
// chemin : le trajet de la caméra ; routes : les axes des routes ; facteur : la part du
// nombre de points (moins sur les petits écrans)
export function creerParticules(scene, { chemin, routes, facteur = 1 }) {
  const r = tirage(20261029);
  const P = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), HAUT = new THREE.Vector3(0, 1, 0);
  // le repère du chemin en u : P le point, T la tangente, N le côté, B le dessus
  const repere = (courbe, u) => {
    courbe.getPointAt(u, P); courbe.getTangentAt(u, T);
    N.crossVectors(T, HAUT).normalize(); B.crossVectors(N, T).normalize();
  };
  const nb = (x) => Math.round(x * facteur);
  const objets = [];

  // les fibres : [côté, hauteur, teinte], de part et d'autre du trajet, sur toute sa longueur
  const longueur = chemin.getLength(), pas = 0.5, nPas = Math.ceil(longueur / pas);
  [[-6, -2.2, 'lavande'], [6.5, -1.8, 'blanc'], [-10.5, 3.6, 'rose'], [11, 4.4, 'lavande']].forEach(([cote, haut, nom], k) => {
    const pos = [], coul = [], s = [], graine = [];
    for (let j = 0; j <= nPas; j++) {
      repere(chemin, j / nPas);
      // une légère ondulation, pour que les fibres ne soient pas des rails
      const o = Math.sin(j * pas * 0.05 + k * 1.3) * 0.8;
      pos.push(P.x + N.x * (cote + o) + B.x * haut, P.y + N.y * (cote + o) + B.y * haut, P.z + N.z * (cote + o) + B.z * haut);
      coul.push(...TEINTES[nom]); s.push(j * pas); graine.push(k * 0.37);
    }
    objets.push(traits(0, geometrie(pos, coul, s, graine), { fond: 0.18, segments: false, loin: 140 }));
  });

  // les constellations : 30 petits réseaux aérés le long du trajet, chaque nœud relié à ses
  // deux plus proches voisins
  const CONSTELLATIONS = 30, noeuds = [], liens = { pos: [], coul: [], s: [], graine: [] };
  for (let k = 0; k < CONSTELLATIONS; k++) {
    repere(chemin, (k + 0.3 + 0.4 * r()) / CONSTELLATIONS);
    const cote = r() < 0.5 ? -1 : 1, rayon = 5 + 5 * r();
    const c = P.clone().addScaledVector(N, cote * (10 + 14 * r())).addScaledVector(B, 2 + 12 * r()).addScaledVector(T, (r() - 0.5) * 12);
    const n = 5 + Math.floor(r() * 5), ici = [];
    for (let i = 0; i < n; i++) ici.push(c.clone().add(new THREE.Vector3(gauss(r), gauss(r) * 0.6, gauss(r)).multiplyScalar(rayon * 0.55)));
    const vus = new Set();
    ici.forEach((a, i) => {
      noeuds.push(a);
      const voisins = ici.map((b, j) => [a.distanceToSquared(b), j]).filter(([, j]) => j !== i).sort((x, y) => x[0] - y[0]).slice(0, 2);
      for (const [, j] of voisins) {
        const cle = Math.min(i, j) + '-' + Math.max(i, j);
        if (vus.has(cle)) continue;
        vus.add(cle);
        const b = ici[j], g = r(), t = r() < 0.2 ? TEINTES.rose : TEINTES.lavande;
        liens.pos.push(a.x, a.y, a.z, b.x, b.y, b.z); liens.coul.push(...t, ...t); liens.s.push(0, 1); liens.graine.push(g, g);
      }
    });
  }
  objets.push(traits(1, geometrie(liens.pos, liens.coul, liens.s, liens.graine), { fond: 0.16 }));
  objets.push(points(1, noeuds.length, (ecrire, n) => {
    for (let i = 0; i < n; i++) ecrire(i, noeuds[i], teinte(r, [['blanc', 3], ['lavande', 2]]), 0.1 + 0.06 * r());
  }));

  // les flux : des paquets sur les routes, entre les voies
  const longueurs = routes.map(c => c.getLength()), total = longueurs.reduce((a, b) => a + b, 0);
  objets.push(points(2, nb(9000), (ecrire, n) => {
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
  }, { loin: 140 }));

  // les points : semés autour du trajet, de plus en plus clairsemés en s'en éloignant
  objets.push(points(0, nb(7000), (ecrire, n) => {
    const p = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      repere(chemin, r());
      const rayon = 6 + 55 * r() ** 1.4, a = r() * Math.PI * 2;
      p.copy(P).addScaledVector(N, Math.cos(a) * rayon).addScaledVector(B, Math.sin(a) * rayon * 0.6).addScaledVector(T, (r() - 0.5) * 8);
      if (p.y < -2) p.y = -2 + r() * 2;
      ecrire(i, p, teinte(r, [['blanc', 4], ['lavande', 4], ['rose', 1]]), 0.012 + 0.02 * r() ** 3);
    }
  }, { opacite: 0.8 }));

  for (const o of objets) scene.add(o);
  return {
    // pixels par unité à une unité de distance, et la densité de pixels
    taille(echelle, ratio) { communs.uEchelle.value = echelle; communs.uTailleMax.value = 12 * ratio; },
    // vitesse : celle de la progression du parcours (par seconde), qui accélère les paquets
    animer(temps, dt, camera, vitesse, anime) {
      communs.uTemps.value = anime ? temps : 0;
      if (anime) communs.uFlux.value += dt * (1 + Math.min(5, Math.abs(vitesse) * 40));
    },
    // si la machine peine : la moitié des points semés
    alleger() { for (const o of objets) if (o.isPoints) o.geometry.setDrawRange(0, Math.floor(o.geometry.attributes.position.count / 2)); },
  };
}
