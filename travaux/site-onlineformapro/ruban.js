// Le ruban du catalogue (chapitre « Catalogue » de l'ouverture) : les familles du catalogue sur
// un ruban continu enroulé en hélice, qui tourne au défilement pour amener chaque famille au
// premier plan ; autour, un réseau de particules connectées, aux couleurs de l'ouverture.
//
// Un canevas à part, posé sur la scène 3D : sa propre caméra, sans la tonalité ni le halo de la
// scène, pour que les images gardent leurs couleurs. Le ruban est une seule surface, subdivisée
// finement (18 pas par famille) : il est lisse. Chaque image de famille en couvre un sixième de
// tour ; l'envers du ruban est assombri, le fond s'enfonce dans la nuit, les bouts s'effacent.
import * as THREE from 'three';

const R = 6, HAUTEUR = 3.3, PAS = 5.6;                  // rayon, hauteur de la bande, pas d'un tour
const PAR_TOUR = 6, DELTA = Math.PI * 2 / PAR_TOUR;     // six familles par tour
const SUBDIV = 18;                                      // pas par famille : la courbe est lisse
const DEBUT = -4, FIN = 16;                             // familles posées (au-delà des 12, elles se répètent)
const NUIT = [28 / 255, 10 / 255, 60 / 255];

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

// la surface du ruban : pour chaque famille posée, une bande de SUBDIV pas, ses coordonnées
// dans l'atlas (les sommets des bords communs sont doublés : même place, autre image)
function surface(n) {
  const pos = [], uv = [], angle = [], index = [];
  const marge = 2 / 512;                                // pour ne pas déborder sur la case voisine
  for (let k = DEBUT, base = 0; k < FIN; k++) {
    const c = ((k % n) + n) % n, u0 = (c % 4) / 4, v0 = 1 - (Math.floor(c / 4) + 1) / 4;
    for (let s = 0; s <= SUBDIV; s++) {
      const t = s / SUBDIV, a = (k + t) * DELTA, y = -PAS * a / (Math.PI * 2);
      for (const v of [0, 1]) {
        pos.push(R * Math.sin(a), y + (v - 0.5) * HAUTEUR, R * Math.cos(a));
        uv.push(u0 + marge + t * (0.25 - 2 * marge), v0 + marge + v * (0.25 - 2 * marge));
        angle.push(a);
      }
      if (s < SUBDIV) { const i = base + s * 2; index.push(i, i + 2, i + 1, i + 1, i + 2, i + 3); }
    }
    base += (SUBDIV + 1) * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aAngle', new THREE.Float32BufferAttribute(angle, 1));
  g.setIndex(index);
  return g;
}

// le réseau : des points semés dans une coque autour du ruban, reliés à leurs voisins proches
function reseau() {
  let graine = 7;
  const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const COULEURS = [[1, 1, 1], [0.69, 0.64, 1], [1, 0.45, 0.6], [0.56, 0.52, 1]];
  const noeuds = [];
  for (let i = 0; i < 110; i++) {
    const a = hasard() * Math.PI * 2, r = R + 1.2 + hasard() * 5, y = (hasard() - 0.5) * 20;
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
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  camera.position.set(0, 0, 36);
  const tenue = new THREE.Group(), axe = new THREE.Group(), nuee = new THREE.Group();
  tenue.add(axe, nuee); scene.add(tenue);

  const uniforms = {
    uAtlas: { value: atlas(familles) }, uCentre: { value: 0 }, uPresence: { value: 0 },
    uNuit: { value: new THREE.Vector3(...NUIT) }, uFond: { value: 36 },
  };
  const ruban = new THREE.Mesh(surface(familles.length), new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide, transparent: true, premultipliedAlpha: true,
    vertexShader: `
      attribute float aAngle;
      varying vec2 vUv; varying float vAngle; varying float vProf;
      void main() {
        vUv = uv; vAngle = aAngle;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vProf = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uAtlas; uniform float uCentre, uPresence, uFond; uniform vec3 uNuit;
      varying vec2 vUv; varying float vAngle; varying float vProf;
      void main() {
        vec3 c = texture2D(uAtlas, vUv).rgb;
        // en tours depuis la famille au premier plan : les bouts du ruban s'effacent
        float d = abs(vAngle - uCentre) / 6.2832;
        float a = smoothstep(1.3, 0.75, d) * uPresence;
        // l'envers assombri, le fond du ruban dans la nuit
        float dos = gl_FrontFacing ? 0.0 : 0.5;
        float brume = clamp((vProf - uFond) / 14.0, 0.0, 0.55);
        c = mix(c, uNuit, max(dos, brume));
        gl_FragColor = vec4(c * a, a);
      }`,
  }));
  axe.add(ruban);

  const { gp, gl } = reseau();
  const uReseau = { uTemps: { value: 0 }, uPresence: { value: 0 }, uEchelle: { value: 300 }, uFond: { value: 36 } };
  const points = new THREE.Points(gp, new THREE.ShaderMaterial({
    uniforms: uReseau, transparent: true, depthWrite: false, premultipliedAlpha: true,
    vertexShader: `
      attribute vec3 aCouleur; attribute float aTaille, aPhase;
      uniform float uTemps, uEchelle;
      varying vec3 vCouleur; varying float vEclat;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vCouleur = aCouleur;
        vEclat = 0.55 + 0.45 * sin(uTemps * 1.6 + aPhase);
        gl_PointSize = aTaille * uEchelle / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uPresence;
      varying vec3 vCouleur; varying float vEclat;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, r);
        float k = a * vEclat * uPresence;
        gl_FragColor = vec4(vCouleur * k, k);
      }`,
  }));
  const liens = new THREE.LineSegments(gl, new THREE.ShaderMaterial({
    uniforms: uReseau, transparent: true, depthWrite: false, premultipliedAlpha: true,
    vertexShader: `
      attribute float aAlpha;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vAlpha = aAlpha * clamp(1.2 - (-mv.z - 30.0) / 18.0, 0.15, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uPresence;
      varying float vAlpha;
      void main() { float k = vAlpha * 0.5 * uPresence; gl_FragColor = vec4(vec3(0.72, 0.68, 1.0) * k, k); }`,
  }));
  points.renderOrder = liens.renderOrder = 1;
  nuee.add(liens, points);

  let largeur = 1, hauteur = 1, enHauteur = false;
  function taille() {
    largeur = toile.clientWidth; hauteur = toile.clientHeight;
    rendu.setSize(largeur, hauteur, false);
    camera.aspect = largeur / hauteur;
    enHauteur = largeur / hauteur < 1;
    camera.updateProjectionMatrix();
    uReseau.uEchelle.value = hauteur * ratio / (2 * Math.tan(17.5 * Math.PI / 180)) * 0.09;
  }

  // une image : presence (0 → 1, l'apparition), entree (0 → 1, l'arrivée du ruban, de loin et
  // de côté, à la place qu'il garde pendant le chapitre), f (la famille au premier plan, en
  // continu), le temps et la souris (-0,5 → 0,5)
  let vu = false;
  function image({ presence, entree, f, temps, souris, anime }) {
    if (presence <= 0.001) { if (vu) { rendu.clear(); vu = false; } toile.style.visibility = 'hidden'; return; }
    toile.style.visibility = 'visible'; vu = true;
    const vis = 2 * 36 * Math.tan(17.5 * Math.PI / 180), visL = vis * camera.aspect;
    const e = 1 - Math.pow(1 - entree, 3);
    if (enHauteur) {
      // téléphone : le ruban en haut, plus petit (il arrive sous le titre)
      tenue.scale.setScalar(0.62);
      tenue.position.set(0, vis * (0.2 - 0.18 * (1 - e)), -16 * (1 - e));
    } else {
      tenue.scale.setScalar(1);
      tenue.position.set(visL * (0.33 * (1 - e) - 0.06), -0.3, -18 * (1 - e));
    }
    tenue.rotation.set(0.32 + souris.y * 0.05, souris.x * 0.12, 0.2);
    const centre = (f + 0.5) * DELTA;
    axe.rotation.y = -centre;
    axe.position.y = PAS * centre / (Math.PI * 2);
    nuee.rotation.y = anime ? temps * 0.05 - centre * 0.25 : -centre * 0.25;
    uniforms.uCentre.value = centre;
    uniforms.uPresence.value = presence;
    uniforms.uFond.value = 36 + 18 * (1 - e);
    uReseau.uTemps.value = anime ? temps : 0;
    uReseau.uPresence.value = presence;
    rendu.render(scene, camera);
  }

  // le pointeur (en px dans la toile) est-il sur une partie visible du ruban ?
  const lancer = new THREE.Raycaster(), visee = new THREE.Vector2();
  const angles = ruban.geometry.getAttribute('aAngle');
  function sous(x, y) {
    if (!vu || uniforms.uPresence.value < 0.6) return false;
    visee.set(x / largeur * 2 - 1, -(y / hauteur) * 2 + 1);
    lancer.setFromCamera(visee, camera);
    for (const t of lancer.intersectObject(ruban)) {
      const d = Math.abs(angles.getX(t.face.a) - uniforms.uCentre.value) / (Math.PI * 2);
      if (d < 1.05) return true;
    }
    return false;
  }
  return { taille, image, sous };
}
