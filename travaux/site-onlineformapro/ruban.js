// Le ruban du catalogue (chapitre « Catalogue » de l'ouverture) : les familles du catalogue
// défilent sur le ruban qui monte en hélice du rond-point de la liaison (helice.js) ; autour,
// un réseau de particules connectées, aux couleurs de l'ouverture.
//
// Le ruban est un lieu du monde, vu par la caméra du monde (monde.js), mais dessiné sur un
// canevas à part, posé sur la scène : sans la tonalité ni le halo de la scène, les images
// gardent leurs couleurs. Il est fixe, comme tout le décor : ce sont les images qui glissent
// le long du ruban au défilement ; elles sortent de la route, montent et se perdent dans le
// ciel, et la famille au premier plan (f) s'arrête face à la caméra. Ses bords lumineux sont
// des lignes du monde : là où ils passent devant le ruban, ce canevas s'efface pour les laisser
// voir. Le brouillard du monde (de 18 à 150 unités) l'efface au loin.
import * as THREE from 'three';
import { HELICE, HAUT, lieu, point, courbesBords } from './helice.js';

const SUBDIV = 24;                                      // pas par famille : la courbe est lisse
const NUIT = [28 / 255, 10 / 255, 60 / 255];
const BROUILLARD = [18, 150];                           // celui du monde

// l'atlas : les images des familles, recadrées dans des cases de 512 × 256 (4 × 4)
function atlas(familles) {
  const toile = document.createElement('canvas');
  toile.width = 2048; toile.height = 1024;
  const ctx = toile.getContext('2d');
  const texture = new THREE.CanvasTexture(toile);
  texture.anisotropy = 8;
  familles.forEach(([, image], k) => {
    const x = (k % 4) * 512, y = Math.floor(k / 4) * 256;
    if (!image) {
      // une famille sans photo (Prévention) : un dégradé violet et son pictogramme
      const g = ctx.createLinearGradient(x, y, x + 512, y + 256);
      g.addColorStop(0, '#6b56e2'); g.addColorStop(1, '#262385');
      ctx.fillStyle = g; ctx.fillRect(x, y, 512, 256);
      ctx.save(); ctx.translate(x + 256 - 42, y + 128 - 42); ctx.scale(3.5, 3.5);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.lineCap = ctx.lineJoin = 'round';
      ctx.stroke(new Path2D('M12 3l8 3v6c0 4.4-3.4 8.2-8 9-4.6-.8-8-4.6-8-9V6l8-3z')); ctx.stroke(new Path2D('M8.5 12l2.5 2.5 4.5-5'));
      ctx.restore();
      return;
    }
    ctx.fillStyle = '#2a1a6a'; ctx.fillRect(x, y, 512, 256);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // recadrée pour couvrir la case
      const k2 = Math.max(512 / img.width, 256 / img.height), w = img.width * k2, h = img.height * k2;
      ctx.drawImage(img, x + (512 - w) / 2, y + (256 - h) / 2, w, h);
      texture.needsUpdate = true;
    };
    img.src = image;
  });
  texture.needsUpdate = true;
  return texture;
}

// la surface du ruban, du ciel (s = 0) à l'anneau (s = vertical + pose) : s et v (0 → 1, du
// bord du bas au bord du haut) servent à y poser les images dans le nuanceur
function surface() {
  const pos = [], ss = [], vv = [], tt = [], index = [], P = new THREE.Vector3();
  const n = (HELICE.vertical + HELICE.pose) * SUBDIV;
  for (let i = 0; i <= n; i++) {
    const s = i / SUBDIV, { t } = lieu(s);
    for (const v of [0, 1]) {
      point(s, v * 2 - 1, P);
      pos.push(P.x, P.y, P.z); ss.push(s); vv.push(v); tt.push(t);
    }
    if (i < n) { const j = i * 2; index.push(j, j + 2, j + 1, j + 1, j + 2, j + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aS', new THREE.Float32BufferAttribute(ss, 1));
  g.setAttribute('aV', new THREE.Float32BufferAttribute(vv, 1));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(tt, 1));
  g.setIndex(index);
  return g;
}

// le réseau : des points semés dans une coque autour du ruban (autour de son axe, du sol au
// ciel), reliés à leurs voisins proches
function reseau() {
  let graine = 7;
  const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const COULEURS = [[1, 1, 1], [0.69, 0.64, 1], [1, 0.45, 0.6], [0.56, 0.52, 1]];
  const noeuds = [];
  for (let i = 0; i < 110; i++) {
    const a = hasard() * Math.PI * 2, r = HELICE.rayon + 1.6 + hasard() * 5.5, y = 0.6 + hasard() * (HAUT + 3);
    noeuds.push([r * Math.sin(a), y, r * Math.cos(a)]);
  }
  const pts = [], couleurs = [], tailles = [], phases = [], lignes = [], alphas = [];
  noeuds.forEach((p, i) => {
    pts.push(...p);
    couleurs.push(...COULEURS[Math.floor(hasard() * COULEURS.length)]);
    tailles.push(0.6 + hasard() * 1.4); phases.push(hasard() * 6.28);
    // trois voisins au plus, à moins de 4 unités
    const proches = noeuds.map((q, j) => [j, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])]).filter(([j, d]) => j > i && d < 4).sort((x, y) => x[1] - y[1]).slice(0, 3);
    for (const [j, d] of proches) { lignes.push(...p, ...noeuds[j]); alphas.push(1 - d / 4, 1 - d / 4); }
  });
  const gp = new THREE.BufferGeometry();
  gp.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  gp.setAttribute('aCouleur', new THREE.Float32BufferAttribute(couleurs, 3));
  gp.setAttribute('aTaille', new THREE.Float32BufferAttribute(tailles, 1));
  gp.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  const gl = new THREE.BufferGeometry();
  gl.setAttribute('position', new THREE.Float32BufferAttribute(lignes, 3));
  gl.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
  return { gp, gl };
}

export function creerRuban(toile, familles) {
  const rendu = new THREE.WebGLRenderer({ canvas: toile, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  rendu.setClearColor(0x000000, 0);
  const ratio = Math.min(devicePixelRatio || 1, 2);
  rendu.setPixelRatio(ratio);
  const scene = new THREE.Scene();
  // la caméra : une copie de celle du monde, à chaque image
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 240);
  const K = HELICE.centre, n = familles.length;

  const uniforms = {
    uAtlas: { value: atlas(familles) }, uF: { value: 0 }, uN: { value: n }, uSFace: { value: HELICE.sFace },
    uNuit: { value: new THREE.Vector3(...NUIT) }, uFond: { value: 35 }, uBrouillard: { value: new THREE.Vector2(...BROUILLARD) },
  };
  const ruban = new THREE.Mesh(surface(), new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide, transparent: true, depthWrite: true, premultipliedAlpha: true,
    vertexShader: `
      attribute float aS, aV, aT;
      varying float vS, vV, vT, vProf;
      void main() {
        vS = aS; vV = aV; vT = aT;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vProf = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uAtlas; uniform float uF, uN, uSFace, uFond; uniform vec3 uNuit; uniform vec2 uBrouillard;
      varying float vS, vV, vT, vProf;
      void main() {
        // la famille sous ce point : f au premier plan, les suivantes plus bas, vers la route
        float t = uF + (vS - uSFace) + 0.5;
        float c = mod(floor(t), uN);
        const float m = 2.0 / 512.0, l = 0.25 - 2.0 * m;
        vec2 base = vec2(mod(c, 4.0) / 4.0, 1.0 - (floor(c / 4.0) + 1.0) / 4.0) + m;
        vec2 cont = vec2(t, vV) * l;                 // continu : la bonne finesse aux changements d'image
        vec3 col = textureGrad(uAtlas, base + vec2(fract(t), vV) * l, dFdx(cont), dFdy(cont)).rgb;
        // le haut se perd dans le ciel ; en se couchant, le ruban redevient la route
        float a = smoothstep(0.0, 3.0, vS) * (1.0 - smoothstep(0.35, 0.95, vT));
        a *= 1.0 - smoothstep(uBrouillard.x, uBrouillard.y, vProf);
        // l'envers assombri, le fond du ruban dans la nuit
        float dos = gl_FrontFacing ? 0.0 : 0.5;
        float brume = clamp((vProf - uFond) / 14.0, 0.0, 0.45);
        col = mix(col, uNuit, max(dos, brume));
        gl_FragColor = vec4(col * a, a);
      }`,
  }));
  scene.add(ruban);

  // là où un bord lumineux (une ligne du monde, sous ce canevas) passe devant le ruban, le
  // canevas s'efface
  const petit = Math.min(innerWidth, innerHeight) < 600 ? 1.7 : 1;
  const gomme = new THREE.ShaderMaterial({
    transparent: true, blending: THREE.NoBlending, depthWrite: false,
    vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }',
  });
  for (const c of courbesBords()) {
    const g = new THREE.Mesh(new THREE.TubeGeometry(c, 600, 0.022 * petit * 1.8, 5, false), gomme);
    g.renderOrder = 1;
    scene.add(g);
  }

  const nuee = new THREE.Group();
  nuee.position.set(K.x, 0, K.z);
  scene.add(nuee);
  const { gp, gl } = reseau();
  const uReseau = { uTemps: { value: 0 }, uEchelle: { value: 300 }, uBrouillard: uniforms.uBrouillard };
  const points = new THREE.Points(gp, new THREE.ShaderMaterial({
    uniforms: uReseau, transparent: true, depthWrite: false, premultipliedAlpha: true,
    vertexShader: `
      attribute vec3 aCouleur; attribute float aTaille, aPhase;
      uniform float uTemps, uEchelle; uniform vec2 uBrouillard;
      varying vec3 vCouleur; varying float vEclat;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vCouleur = aCouleur;
        vEclat = (0.55 + 0.45 * sin(uTemps * 1.6 + aPhase)) * (1.0 - smoothstep(uBrouillard.x, uBrouillard.y, -mv.z));
        gl_PointSize = aTaille * uEchelle / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vCouleur; varying float vEclat;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float k = smoothstep(0.5, 0.0, r) * vEclat;
        gl_FragColor = vec4(vCouleur * k, k);
      }`,
  }));
  const liens = new THREE.LineSegments(gl, new THREE.ShaderMaterial({
    uniforms: uReseau, transparent: true, depthWrite: false, premultipliedAlpha: true,
    vertexShader: `
      attribute float aAlpha;
      uniform vec2 uBrouillard;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vAlpha = aAlpha * clamp(1.2 - (-mv.z - 30.0) / 18.0, 0.15, 1.0) * (1.0 - smoothstep(uBrouillard.x, uBrouillard.y, -mv.z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vAlpha;
      void main() { float k = vAlpha * 0.5; gl_FragColor = vec4(vec3(0.72, 0.68, 1.0) * k, k); }`,
  }));
  points.renderOrder = liens.renderOrder = 2;
  nuee.add(liens, points);

  let largeur = 1, hauteur = 1;
  function taille() {
    largeur = toile.clientWidth; hauteur = toile.clientHeight;
    rendu.setSize(largeur, hauteur, false);
  }

  // une image, vue par la caméra du monde : f (la famille au premier plan, en continu), le temps
  const zone = new THREE.Sphere(K.clone().setY(HAUT / 2 + 1), 16), cone = new THREE.Frustum(), m4 = new THREE.Matrix4();
  let vu = false;
  function image({ vue, f, temps, anime }) {
    camera.position.copy(vue.position); camera.quaternion.copy(vue.quaternion);
    if (camera.fov !== vue.fov || camera.aspect !== vue.aspect) {
      camera.fov = vue.fov; camera.aspect = vue.aspect; camera.updateProjectionMatrix();
      uReseau.uEchelle.value = hauteur * ratio / (2 * Math.tan(camera.fov * Math.PI / 360)) * 0.09;
    }
    camera.updateMatrixWorld();
    // hors du champ, ou dans le brouillard : rien à dessiner
    cone.setFromProjectionMatrix(m4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const loin = camera.position.distanceTo(zone.center) - zone.radius > BROUILLARD[1];
    if (loin || !cone.intersectsSphere(zone)) { if (vu) { rendu.clear(); vu = false; toile.style.visibility = 'hidden'; } return; }
    if (!vu) { toile.style.visibility = 'visible'; vu = true; }
    uniforms.uF.value = f;
    uniforms.uFond.value = Math.hypot(camera.position.x - K.x, camera.position.z - K.z);
    nuee.rotation.y = anime ? temps * 0.04 : 0;
    uReseau.uTemps.value = anime ? temps : 0;
    rendu.render(scene, camera);
  }

  // le pointeur (en px dans la toile) est-il sur une image du ruban, assez près ?
  const lancer = new THREE.Raycaster(), visee = new THREE.Vector2();
  const ss = ruban.geometry.getAttribute('aS'), ts = ruban.geometry.getAttribute('aT');
  function sous(x, y) {
    if (!vu || camera.position.distanceTo(zone.center) > 70) return false;
    visee.set(x / largeur * 2 - 1, -(y / hauteur) * 2 + 1);
    lancer.setFromCamera(visee, camera);
    for (const t of lancer.intersectObject(ruban)) {
      if (ss.getX(t.face.a) > 1.5 && ts.getX(t.face.a) < 0.6) return true;
    }
    return false;
  }
  return { taille, image, sous, get visible() { return vu; } };
}
