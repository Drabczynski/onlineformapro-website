// Les données de l'ouverture : l'intelligence artificielle qui accompagne la traversée, en un
// seul système net et régulier (pas de brume, pas d'éléments épars). Deux familles de points,
// chacune dessinée en une passe (mélange additif, brouillard), tout le mouvement étant
// calculé par la carte graphique :
//  - la grille : une matrice de points serrés posée sous les routes, sur une bande de 45 unités
//    de part et d'autre du trajet de la caméra ; des ondes en partent, centrées sur la caméra, et
//    l'accompagnent tout du long ; çà et là, un point s'allume un instant, comme une donnée ;
//  - les flux : des paquets qui circulent sur les routes, entre les voies (blancs et lavande
//    dans un sens, rouges et orangés dans l'autre), plus vite quand on fait défiler ;
//  - au chapitre « La puissance de l'IA pour la formation », autour du graphique de pics : des
//    nuées de points serrés le long des courbes, où filent des paquets de données, et sous elles
//    des colonnes de points qui montent de la grille, comme des données qui alimentent l'IA ;
//    quand la caméra les traverse, les points proches se relient en triangles, discrètement ;
//  - les mêmes nuées le long des lignes du logo de l'ouverture, de la planète et du cube
//    (nueeLignes, posée par monde.js et objets.js), et des colonnes montantes sous chacun.
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
// aParam : vitesse, longueur) ; MODE 3 : la grille (ondes autour de la caméra, clignotements) ;
// MODE 4 : le long des pics (aParam : position sur la courbe de 0 à 1, numéro de la courbe) ;
// MODE 5 : colonnes montantes sous les pics (aParam : vitesse, hauteur)
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
    #elif MODE == 4
      // des paquets filent le long des courbes : une grande vague d'éclat et de petits paquets
      float vague = exp(-fract(aParam.x * 3.0 - uFlux * 0.35 + aParam.y * 0.17) * 16.0);
      float paquet = exp(-fract(aParam.x * 11.0 - uFlux * 0.9 + g * 3.0) * 30.0);
      eclat = 0.3 + 2.6 * vague + 1.6 * paquet;
      couleur = mix(couleur, vec3(1.0), min(vague + paquet, 1.0) * 0.7);
    #elif MODE == 5
      // les données montent de la grille, s'allument en partant et s'éteignent en arrivant
      float f = fract(g * 5.13 + uTemps * aParam.x / aParam.y);
      p.y += f * aParam.y;
      eclat = smoothstep(0.0, 0.1, f) * (1.0 - f) * 3.0;
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

// -------------------------------------------------------------------- les nuées des lignes
// des points serrés le long de lignes données, un peu dispersés, où filent des paquets de
// données (comme autour des pics) ; dans le repère de qui les pose (le monde, la planète, un
// module du cube), pour qu'ils suivent ses mouvements ; densité en points par unité de ligne
export function nueeLignes(courbes, { facteur = 1, densite = 14, dispersion = 0.12, teintes = [['blanc', 3], ['lavande', 4], ['orange', 1]], taille = [0.024, 0.024], graine = 1, proche = 20, loin = 110 } = {}) {
  const r = tirage(20261030 + graine);
  const comptes = courbes.map(c => Math.max(6, Math.round(c.getLength() * densite * facteur)));
  return points(4, comptes.reduce((a, b) => a + b, 0), (ecrire) => {
    const p = new THREE.Vector3();
    let i = 0;
    courbes.forEach((c, k) => {
      for (let j = 0; j < comptes[k]; j++, i++) {
        const u = (j + r()) / comptes[k];
        c.getPointAt(u, p).add(new THREE.Vector3(gauss(r), gauss(r), gauss(r)).multiplyScalar(dispersion));
        ecrire(i, p, teinte(r, teintes), taille[0] + taille[1] * r(), [u, k]);
      }
    });
  }, { proche, loin });
}

// -------------------------------------------------------------------- les réseaux
// Quand la caméra s'approche, les points proches se relient en triangles : dans le graphique
// de pics, des nœuds le long de chaque courbe (un tous les 1,6 unité environ, un peu décalés),
// cousus d'une courbe à la suivante en fermeture éclair ; sur la planète, des nœuds répartis
// sur la sphère, reliés à leurs voisins (reseauSphere). Chaque segment se déploie depuis l'un
// de ses nœuds quand la caméra arrive à sa portée (tirée au sort dans un intervalle), et se
// replie quand elle s'éloigne ; les nœuds reliés s'allument. Traits d'un pixel, à peine
// visibles. Les distances se mesurent dans le monde (le réseau de la planète tourne avec elle).
const RESEAU_SOMMETS = `
  uniform vec3 uCamera; uniform float uTemps;
  attribute vec3 aDepart; attribute vec3 aMilieu; attribute float aSeuil;
  varying float vAlpha;
  void main() {
    float g = 1.0 - smoothstep(aSeuil - 4.0, aSeuil, distance(uCamera, (modelMatrix * vec4(aMilieu, 1.0)).xyz));
    vAlpha = g * (0.7 + 0.3 * sin(uTemps * 1.7 + aSeuil * 9.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(aDepart, position, g), 1.0);
  }`;
const NOEUDS_SOMMETS = `
  uniform vec3 uCamera; uniform float uEchelle; uniform float uTailleMax; uniform vec2 uPortee;
  varying float vAlpha;
  void main() {
    float g = 1.0 - smoothstep(uPortee.x, uPortee.y, distance(uCamera, (modelMatrix * vec4(position, 1.0)).xyz));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(0.05 * uEchelle / max(0.001, -mv.z), 1.5, uTailleMax * 0.4);
    vAlpha = g;
    gl_Position = projectionMatrix * mv;
  }`;
// les traits et les nœuds d'un réseau ; portee : l'intervalle des portées des segments
function dessinerReseau(noeuds, segments, r, [p0, p1] = [10, 20], opacite = 0.3) {
  const n = segments.length, pos = new Float32Array(n * 6), depart = new Float32Array(n * 6), milieu = new Float32Array(n * 6), seuil = new Float32Array(n * 2);
  segments.forEach(([a, b], k) => {
    const m = a.clone().add(b).multiplyScalar(0.5), s = p0 + (p1 - p0) * r();
    pos.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6);
    depart.set([a.x, a.y, a.z, a.x, a.y, a.z], k * 6);
    milieu.set([m.x, m.y, m.z, m.x, m.y, m.z], k * 6);
    seuil.set([s, s], k * 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aDepart', new THREE.BufferAttribute(depart, 3));
  g.setAttribute('aMilieu', new THREE.BufferAttribute(milieu, 3));
  g.setAttribute('aSeuil', new THREE.BufferAttribute(seuil, 1));
  const melange = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const traits = new THREE.LineSegments(g, new THREE.ShaderMaterial({ vertexShader: RESEAU_SOMMETS, uniforms: communs, ...melange,
    fragmentShader: `varying float vAlpha; void main() { gl_FragColor = vec4(vec3(0.62, 0.58, 1.0), vAlpha * ${opacite.toFixed(2)}); }` }));
  const gn = new THREE.BufferGeometry();
  gn.setAttribute('position', new THREE.BufferAttribute(new Float32Array(noeuds.flatMap(p => [p.x, p.y, p.z])), 3));
  const ronds = new THREE.Points(gn, new THREE.ShaderMaterial({
    vertexShader: NOEUDS_SOMMETS, uniforms: { ...communs, uPortee: { value: new THREE.Vector2(p0 + 2, p1 - 2) } }, ...melange,
    fragmentShader: 'varying float vAlpha; void main() { float d = length(gl_PointCoord - 0.5) * 2.0; gl_FragColor = vec4(vec3(1.0), (1.0 - smoothstep(0.4, 1.0, d)) * vAlpha * 0.75); }',
  }));
  traits.frustumCulled = ronds.frustumCulled = false;
  return [traits, ronds];
}
// le réseau du graphique de pics
function creerReseau(pics, r) {
  if (!pics.length) return [];
  const noeuds = pics.map(c => {
    const n = Math.round(c.getLength() / 1.6), liste = [];
    for (let i = 0; i < n; i++) liste.push(c.getPointAt(Math.min(1, Math.max(0, (i + 0.5 + (r() - 0.5) * 0.7) / n))).add(new THREE.Vector3(gauss(r), gauss(r), gauss(r)).multiplyScalar(0.12)));
    return liste;
  });
  const segments = [];
  const relier = (a, b) => segments.push(r() < 0.5 ? [a, b] : [b, a]);
  for (const liste of noeuds) for (let i = 1; i < liste.length; i++) relier(liste[i - 1], liste[i]);
  // d'une courbe à la suivante : on avance sur celle dont le prochain nœud vient le premier
  // (les courbes filent vers -z) ; chaque pas ferme un triangle
  for (let k = 0; k + 1 < noeuds.length; k++) {
    const A = noeuds[k], C = noeuds[k + 1];
    let i = 0, j = 0;
    relier(A[0], C[0]);
    while (i < A.length - 1 || j < C.length - 1) {
      if (j >= C.length - 1 || (i < A.length - 1 && A[i + 1].z > C[j + 1].z)) i++; else j++;
      relier(A[i], C[j]);
    }
  }
  return dessinerReseau(noeuds.flat(), segments, r);
}

// le réseau d'une sphère (la planète) : n nœuds répartis en spirale de Fibonacci, à peine au-dessus
// de la surface, chacun relié à ses voisins proches ; à poser dans le repère de la sphère
export function reseauSphere(rayon, { n = 240, graine = 7, portee = [10, 19], opacite = 0.3 } = {}) {
  const r = tirage(20261031 + graine), noeuds = [], or = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), t = i * or + (r() - 0.5) * 0.25;
    noeuds.push(new THREE.Vector3(Math.cos(t) * rr, y, Math.sin(t) * rr).multiplyScalar(rayon * 1.015));
  }
  const pas = Math.sqrt((4 * Math.PI) / n) * rayon, segments = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (noeuds[i].distanceTo(noeuds[j]) < pas * 1.25) segments.push(r() < 0.5 ? [noeuds[i], noeuds[j]] : [noeuds[j], noeuds[i]]);
  return dessinerReseau(noeuds, segments, r, portee, opacite);
}

// -------------------------------------------------------------------- la grille et les flux
// chemin : le trajet de la caméra ; routes : les axes des routes ; pics : les courbes du
// graphique ; lignes : d'autres lignes à garnir de nuées (le logo) ; foyers : les objets sous
// lesquels montent des colonnes ({ centre au sol, rayon, hauteur }) ; facteur : la part du
// nombre de points (moins sur les petits écrans)
export function creerParticules(scene, { chemin, routes, pics = [], lignes = [], foyers = [], facteur = 1 }) {
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

  // autour du graphique de pics : des points serrés le long de chaque courbe, un peu dispersés
  const parCourbe = Math.round(2400 * facteur);
  const longPics = points(4, parCourbe * pics.length, (ecrire, n) => {
    const p = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const k = Math.floor(i / parCourbe), u = ((i % parCourbe) + r()) / parCourbe;
      pics[k].getPointAt(u, p).add(new THREE.Vector3(gauss(r), gauss(r), gauss(r)).multiplyScalar(0.22));
      ecrire(i, p, teinte(r, [['blanc', 3], ['lavande', 4], ['orange', 1]]), 0.024 + 0.024 * r(), [u, k]);
    }
  }, { proche: 20, loin: 110 });
  // et sous les pics, des colonnes de points qui montent de la grille (aux nœuds de la grille)
  // (colonnes : x, z, hauteur la plus basse, hauteur la plus haute)
  const colonnes = [];
  if (pics.length) {
    const boite = new THREE.Box3();
    for (const c of pics) for (const q of c.getSpacedPoints(60)) boite.expandByPoint(q);
    for (let x = Math.ceil((boite.min.x - 3) / PAS) * PAS; x <= boite.max.x + 3; x += PAS) {
      for (let z = Math.ceil(boite.min.z / PAS) * PAS; z <= boite.max.z; z += PAS) for (let d = 0; d < 2; d++) if (r() < facteur) colonnes.push(x, z, 3, 12);
    }
  }
  // de même sous le logo, la planète et le cube : sur un disque, jusqu'à leur base
  for (const { centre, rayon, hauteur } of foyers) {
    for (let x = Math.ceil((centre.x - rayon) / PAS) * PAS; x <= centre.x + rayon; x += PAS) {
      for (let z = Math.ceil((centre.z - rayon) / PAS) * PAS; z <= centre.z + rayon; z += PAS) {
        if ((x - centre.x) ** 2 + (z - centre.z) ** 2 > rayon * rayon) continue;
        for (let d = 0; d < 2; d++) if (r() < facteur) colonnes.push(x, z, hauteur * 0.45, hauteur);
      }
    }
  }
  const montee = points(5, colonnes.length / 4, (ecrire, n) => {
    const p = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const [x, z, h0, h1] = colonnes.slice(4 * i, 4 * i + 4);
      ecrire(i, p.set(x, Y, z), teinte(r, [['lavande', 4], ['blanc', 3], ['orange', 1]]), 0.05, [1.4 + 2.2 * r(), h0 + (h1 - h0) * r()]);
    }
  }, { proche: 20, loin: 110 });
  // les nuées des autres lignes (le logo) et le réseau des pics
  const autres = lignes.map(({ courbes, ...options }, k) => nueeLignes(courbes, { facteur, graine: 10 + k, ...options }));
  const reseau = creerReseau(pics, r);

  const nuees = [grille, flux, longPics, montee, ...autres, ...reseau];
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
