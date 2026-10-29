// Les particules de l'ouverture : des nuées de points lumineux qui accompagnent la caméra
// tout au long de la traversée. Cinq familles, chacune dessinée en une passe (points
// additifs, taille en perspective, brouillard, scintillement) :
//  - la poussière, semée autour du chemin de la caméra, plus dense près de lui ;
//  - les amas, des nuages et des spirales qui tournent lentement sur eux-mêmes, de part et
//    d'autre du chemin ;
//  - les flux, qui filent le long des routes comme une circulation de lumière (blanche et
//    lavande dans un sens, rouge et orangée dans l'autre), plus vite quand on fait défiler ;
//  - le champ, un essaim qui entoure toujours la caméra : il est fixe dans le monde, mais se
//    replie autour d'elle à mesure qu'elle avance ;
//  - les essaims, six courants de particules en hélice qui volent aux côtés de la caméra
//    (avec un léger retard dans les virages) et filent vers elle, plus vite quand on défile.
// Tout le mouvement est calculé par la carte graphique : rien n'est recopié à chaque image.
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

// les teintes, en couleurs linéaires (comme les lignes) : lavande, violet, blanc, rose, orangé
const TEINTES = {
  lavande: [0.46, 0.4, 1.0], violet: [0.26, 0.21, 1.0], blanc: [0.95, 0.94, 1.0],
  rose: [1.0, 0.2, 0.34], orange: [1.0, 0.3, 0.02],
};
function teinte(r, poids) {
  let x = r() * poids.reduce((a, [, p]) => a + p, 0);
  for (const [nom, p] of poids) if ((x -= p) <= 0) return TEINTES[nom];
  return TEINTES[poids[0][0]];
}
const CIEL = [['lavande', 35], ['violet', 25], ['blanc', 24], ['rose', 11], ['orange', 5]];

// -------------------------------------------------------------------- nuanceurs
// MODE 0 : poussière, 1 : amas (rotation autour de aAxe, le centre), 2 : flux (glissement le
// long de aAxe, la direction, en boucle sur une courte longueur), 3 : champ (replié autour de
// la caméra), 4 : essaim (courant en hélice le long de l'axe z de l'essaim, qui revient en
// boucle ; aParam : vitesse, longueur)
const SOMMETS = `
  uniform float uTemps; uniform float uFlux; uniform float uEchelle; uniform float uTailleMax;
  uniform float uProche; uniform float uLoin; uniform vec3 uCamera; uniform float uDemi;
  attribute vec3 aCouleur; attribute float aTaille; attribute float aGraine; attribute vec2 aParam;
  #if MODE == 1 || MODE == 2
  attribute vec3 aAxe;
  #endif
  varying vec3 vCouleur; varying float vAlpha;
  void main() {
    vec3 p = position; float g = aGraine, fondu = 1.0;
    #if MODE == 1
      vec3 d = p - aAxe;
      float a = uTemps * aParam.x / (1.0 + 0.18 * length(d.xz));
      float c = cos(a), s = sin(a);
      d.xz = mat2(c, s, -s, c) * d.xz;
      p = aAxe + d;
    #elif MODE == 2
      float f = fract(g * 7.31 + uFlux * aParam.x / aParam.y);
      p += aAxe * (f - 0.5) * aParam.y;
      fondu = sin(3.14159 * f);
    #elif MODE == 3
      vec3 rel = mod(p - uCamera + uDemi, 2.0 * uDemi) - uDemi;
      p = uCamera + rel;
      fondu = 1.0 - smoothstep(0.55 * uDemi, uDemi, length(rel));
    #elif MODE == 4
      float f = fract(g * 3.7 + uFlux * aParam.x / aParam.y), z = (f - 0.5) * aParam.y;   // +z : vers la caméra
      float ang = atan(p.y, p.x) + uTemps * 0.5 + z * 0.22;
      float rr = length(p.xy) * (0.75 + 0.25 * sin(z * 0.35 + g * 6.0));
      p = vec3(cos(ang) * rr, sin(ang) * rr, z + p.z);
      fondu = smoothstep(0.0, 0.18, f) * smoothstep(1.0, 0.8, f);
    #endif
    #if MODE != 2 && MODE != 4
      // une dérive lente, propre à chaque point
      p += aParam.y * vec3(sin(uTemps * 0.21 + g * 61.0), 0.6 * sin(uTemps * 0.17 + g * 37.0), cos(uTemps * 0.19 + g * 53.0));
    #endif
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(0.001, -mv.z);
    float px = aTaille * uEchelle / dist;
    float scintille = 0.62 + 0.38 * sin(uTemps * (1.1 + 2.9 * g) + g * 91.0);
    float alpha = scintille * fondu * (1.0 - smoothstep(uProche, uLoin, dist)) * smoothstep(0.8, 3.5, dist);
    // un point plus petit qu'un pixel s'atténue au lieu de rapetisser (pas de fourmillement)
    if (px < 1.3) { alpha *= px / 1.3; px = 1.3; }
    gl_PointSize = min(px, uTailleMax);
    vAlpha = alpha; vCouleur = aCouleur;
    gl_Position = projectionMatrix * mv;
  }`;
const FRAGMENTS = `
  uniform float uOpacite;
  varying vec3 vCouleur; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    a = a * a * (0.55 + 0.45 * a);                       // un cœur net, un bord doux
    gl_FragColor = vec4(vCouleur, a * vAlpha * uOpacite);
  }`;

const communs = { uTemps: { value: 0 }, uFlux: { value: 0 }, uEchelle: { value: 1000 }, uTailleMax: { value: 16 }, uCamera: { value: new THREE.Vector3() } };
function nuee(mode, n, remplir, { opacite = 1, proche = 25, loin = 170, demi = 30 } = {}) {
  const pos = new Float32Array(n * 3), coul = new Float32Array(n * 3), taille = new Float32Array(n), graine = new Float32Array(n), param = new Float32Array(n * 2);
  const axe = mode === 1 || mode === 2 ? new Float32Array(n * 3) : null;
  const ecrire = (i, p, c, t, pa, ax) => {
    pos.set([p.x, p.y, p.z], i * 3); coul.set(c, i * 3); taille[i] = t; param.set(pa, i * 2);
    if (ax) axe.set([ax.x, ax.y, ax.z], i * 3);
  };
  remplir(ecrire, n);
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
    uniforms: { ...communs, uOpacite: { value: opacite }, uProche: { value: proche }, uLoin: { value: loin }, uDemi: { value: demi } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(g, m);
  points.frustumCulled = false;                    // déplacés par la carte graphique
  return points;
}

// -------------------------------------------------------------------- les quatre nuées
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

  // la poussière : autour du chemin, de plus en plus clairsemée en s'en éloignant
  const poussiere = nuee(0, nb(140000), (ecrire, n) => {
    const p = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      repere(chemin, r());
      const rayon = 2.5 + 36 * r() ** 2, a = r() * Math.PI * 2;
      p.copy(P).addScaledVector(N, Math.cos(a) * rayon).addScaledVector(B, Math.sin(a) * rayon * 0.6).addScaledVector(T, (r() - 0.5) * 8);
      if (p.y < -3) p.y = -3 + r() * 2;
      const etoile = r() < 0.02;
      ecrire(i, p, teinte(r, CIEL), etoile ? 0.08 + 0.08 * r() : 0.02 + 0.045 * r() ** 3, [0, 0.25 + 0.5 * r()]);
    }
  });

  // les amas : 90 nuages et spirales, de part et d'autre du chemin
  const AMAS = 60, PALETTES = [
    [['lavande', 5], ['blanc', 3]], [['violet', 5], ['lavande', 3], ['blanc', 1]],
    [['rose', 5], ['orange', 2], ['blanc', 1]], [['blanc', 4], ['lavande', 4], ['rose', 1]],
  ];
  const amas = nuee(1, nb(120000), (ecrire, n) => {
    const p = new THREE.Vector3(), c = new THREE.Vector3(), o = new THREE.Vector3();
    let i = 0;
    for (let k = 0; k < AMAS; k++) {
      repere(chemin, (k + r()) / AMAS);
      const cote = r() < 0.5 ? -1 : 1;
      c.copy(P).addScaledVector(N, cote * (7 + 22 * r())).addScaledVector(B, 14 * r()).addScaledVector(T, (r() - 0.5) * 10);
      const sigma = 2.5 + 6 * r(), spirale = r() < 0.55, bras = r() < 0.5 ? 2 : 3;
      const inclX = (r() - 0.5) * 0.5, inclZ = (r() - 0.5) * 0.5, vitesse = (0.2 + 0.45 * r()) * (r() < 0.5 ? -1 : 1);
      const palette = PALETTES[Math.floor(r() * PALETTES.length)];
      const fin = k === AMAS - 1 ? n : Math.min(n, i + Math.round((n / AMAS) * (0.5 + r())));
      for (; i < fin; i++) {
        let rayon;
        if (spirale) {
          rayon = sigma * 2.4 * r() ** 0.7;
          const th = (Math.floor(r() * bras) * 2 * Math.PI) / bras + (rayon / sigma) * 2.4 + gauss(r) * 0.28;
          o.set(Math.cos(th) * rayon, gauss(r) * 0.12 * sigma, Math.sin(th) * rayon);
        } else {
          o.set(gauss(r), gauss(r) * 0.6, gauss(r)).multiplyScalar(sigma);
          rayon = o.length();
        }
        o.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclX).applyAxisAngle(new THREE.Vector3(0, 0, 1), inclZ);
        p.copy(c).add(o);
        const coeur = Math.exp(-rayon / sigma);
        ecrire(i, p, teinte(r, coeur > 0.6 ? [['blanc', 3], ...palette] : palette), (0.035 + 0.06 * r() ** 2.5) * (1 + 1.6 * coeur), [vitesse, 0.08], c);
      }
    }
  });

  // les flux : sur les routes, entre les voies ; à droite (dans le sens de la route) la
  // lumière blanche et lavande s'éloigne, à gauche la rouge et orangée revient
  const longueurs = routes.map(c => c.getLength()), total = longueurs.reduce((a, b) => a + b, 0);
  const flux = nuee(2, nb(50000), (ecrire, n) => {
    const p = new THREE.Vector3(), d = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      let x = r() * total, k = 0;
      while (x > longueurs[k] && k < routes.length - 1) x -= longueurs[k++];
      repere(routes[k], r());
      const droite = r() < 0.5, voie = [0.9, 1.7, 2.2][Math.floor(r() * 3)] + gauss(r) * 0.18;
      p.copy(P).addScaledVector(N, droite ? voie : -voie).setY(0.08 + r() ** 2 * 1.1);
      d.copy(T).setY(0).normalize().multiplyScalar(droite ? 1 : -1);
      const c = droite ? teinte(r, [['blanc', 5], ['lavande', 3]]) : teinte(r, [['rose', 4], ['orange', 3]]);
      ecrire(i, p, c, 0.03 + 0.04 * r() ** 2, [3 + 7 * r(), 3 + 7 * r()], d);
    }
  }, { loin: 140 });

  // le champ : un cube de 60 unités centré sur la caméra, qui se replie autour d'elle
  const DEMI = 30;
  const champ = nuee(3, nb(40000), (ecrire, n) => {
    const p = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      p.set((r() * 2 - 1) * DEMI, (r() * 2 - 1) * DEMI, (r() * 2 - 1) * DEMI);
      ecrire(i, p, teinte(r, [['lavande', 4], ['blanc', 4], ['violet', 2], ['rose', 1]]), 0.015 + 0.03 * r() ** 2, [0, 0.4 + 0.8 * r()]);
    }
  }, { opacite: 0.9, proche: 15, loin: DEMI, demi: DEMI });

  // les essaims : [côté, hauteur, distance devant la caméra, rayon, longueur, teintes], dans
  // le repère de la caméra ; ils restent sur les bords, loin des textes
  const ESSAIMS = [
    [-13, -3, 24, 3.4, 50, [['lavande', 5], ['blanc', 3]]],
    [15, 4, 30, 4, 60, [['rose', 4], ['orange', 2], ['blanc', 1]]],
    [-19, 8, 42, 5, 70, [['violet', 4], ['lavande', 4], ['blanc', 1]]],
    [20, -5, 22, 3, 44, [['blanc', 4], ['lavande', 4], ['rose', 1]]],
    [-4, 12, 55, 5.5, 80, [['lavande', 4], ['rose', 2], ['blanc', 2]]],
    [7, -8, 36, 3.8, 60, [['violet', 3], ['blanc', 3], ['orange', 1]]],
  ];
  const essaims = ESSAIMS.map(([x, y, d, rayon, longueur, palette]) => {
    const brins = r() < 0.5 ? 2 : 3;
    const e = nuee(4, nb(30000), (ecrire, n) => {
      const p = new THREE.Vector3();
      for (let i = 0; i < n; i++) {
        let rr, a;
        if (r() < 0.6) { rr = rayon * (0.85 + gauss(r) * 0.12); a = (Math.floor(r() * brins) * 2 * Math.PI) / brins + gauss(r) * 0.12; }
        else { rr = rayon * Math.sqrt(-Math.log(1 - r() * 0.98)) * 0.6; a = r() * Math.PI * 2; }
        p.set(Math.cos(a) * rr, Math.sin(a) * rr, gauss(r) * 0.4);
        ecrire(i, p, teinte(r, palette), 0.035 + 0.06 * r() ** 2.5, [4 + 6 * r(), longueur]);
      }
    }, { opacite: 0.9, loin: 140 });
    e.userData.place = new THREE.Vector3(x, y, d);
    return e;
  });

  const nuees = [poussiere, amas, flux, champ, ...essaims];
  for (const x of nuees) scene.add(x);
  // le repère de la caméra et la pose visée de chaque essaim
  const avant = new THREE.Vector3(), cote = new THREE.Vector3(), dessus = new THREE.Vector3(), cible = new THREE.Vector3();
  const regard = new THREE.Matrix4(), q = new THREE.Quaternion(), ORIGINE = new THREE.Vector3();
  let poses = false;

  return {
    // pixels par unité à une unité de distance, et la densité de pixels
    taille(echelle, ratio) { communs.uEchelle.value = echelle; communs.uTailleMax.value = 16 * ratio; },
    // vitesse : celle de la progression du parcours (par seconde), qui accélère les flux
    animer(temps, dt, camera, vitesse, anime) {
      communs.uTemps.value = anime ? temps : 0;
      if (anime) communs.uFlux.value += dt * (1 + Math.min(5, Math.abs(vitesse) * 40));
      communs.uCamera.value.copy(camera.position);
      // les essaims suivent la caméra, avec un retard d'environ 0,4 s (ils s'écartent dans les
      // virages) et un léger balancement
      camera.getWorldDirection(avant);
      cote.crossVectors(avant, camera.up).normalize(); dessus.crossVectors(cote, avant);
      regard.lookAt(ORIGINE, avant, dessus); q.setFromRotationMatrix(regard);
      const suivi = !poses || !anime ? 1 : 1 - Math.exp(-dt * 2.5);
      essaims.forEach((e, k) => {
        const { x, y, z } = e.userData.place, b = anime ? Math.sin(temps * 0.35 + k * 1.7) : 0;
        cible.copy(camera.position).addScaledVector(avant, z).addScaledVector(cote, x + 2 * b).addScaledVector(dessus, y + 1.5 * b);
        e.position.lerp(cible, suivi);
        e.quaternion.slerp(q, suivi);
      });
      poses = true;
    },
    // si la machine peine : la moitié des points
    alleger() { for (const x of nuees) x.geometry.setDrawRange(0, Math.floor(x.geometry.attributes.position.count / 2)); },
  };
}
