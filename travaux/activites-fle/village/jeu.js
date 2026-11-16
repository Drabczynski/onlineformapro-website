// Le village FLE : on se déplace au clic, on entre dans les boutiques, on parle aux habitants.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const $ = id => document.getElementById(id);
window.__village = {};
const NB = ' ';
const euros = c => (c / 100).toFixed(2).replace('.', ',') + NB + '€';
const TELEPHONE = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 560;

/* ------------------------------------------------------------------ rendu */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, TELEPHONE ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(TELEPHONE ? 48 : 40, innerWidth / innerHeight, 0.1, 400);
const horloge = new THREE.Clock();
const temps = { value: 0 };
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
});

/* ------------------------------------------------------------------ chargement */
const gestion = new THREE.LoadingManager();
gestion.onProgress = (u, n, total) => { $('barre').firstElementChild.style.width = Math.round(100 * n / total) + '%'; };
const chargeur = new GLTFLoader(gestion);
// sur l'artefact, les modèles sont emballés en .glb.json (base64) ; en local, on lit le .glb directement
const glb = url => fetch(url + '.json').then(r => { if (!r.ok) throw 0; return r.json(); })
  .then(d => { const bin = atob(d.glb), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); gestion.itemEnd(url); return new Promise((ok, ko) => chargeur.parse(u.buffer, '', ok, ko)); },
        () => { gestion.itemEnd(url); return new Promise((ok, ko) => chargeur.load(url, ok, undefined, ko)); });
const glbDebut = url => { gestion.itemStart(url); return glb(url); };
const json = url => fetch(url).then(r => r.json());

/* ------------------------------------------------------------------ matériaux : vent, feuillage, sol */
function vent(m, force) {
  m.onBeforeCompile = s => {
    s.uniforms.uTemps = temps;
    s.vertexShader = 'uniform float uTemps;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wp = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        wp = instanceMatrix * wp;
      #endif
      wp = modelMatrix * wp;
      float h = max(transformed.y, 0.0);
      float w = sin(uTemps * 1.7 + wp.x * .55 + wp.z * .35) + .5 * sin(uTemps * 2.9 + wp.x * 1.3);
      transformed.x += w * ${force.toFixed(3)} * h;
      transformed.z += w * ${(force * .6).toFixed(3)} * h;`);
  };
  m.customProgramCacheKey = () => 'vent' + force;
}

function solHerbe() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  m.onBeforeCompile = s => {
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMonde;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMonde = (modelMatrix * vec4(transformed,1.0)).xyz;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vMonde;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float bruit(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for(int k=0;k<4;k++){ v += a*bruit(p); p *= 2.07; a *= .5; } return v; }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float n = fbm(vMonde.xz * .09), g = bruit(vMonde.xz * 3.1);
        vec3 c1 = vec3(.20,.42,.10), c2 = vec3(.36,.58,.16), c3 = vec3(.47,.55,.20);
        vec3 c = mix(c1, c2, smoothstep(.25,.75,n));
        c = mix(c, c3, smoothstep(.62,.9,fbm(vMonde.xz*.035+7.)) * .55);
        diffuseColor.rgb = c * (.9 + .2 * g);`);
  };
  return m;
}

function eau(rayon) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTemps: temps, uR: { value: rayon } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform float uTemps, uR; varying vec2 vP;
      vec2 h22(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
      float vor(vec2 p){ vec2 i = floor(p), f = fract(p); float d = 1.;
        for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 g = vec2(x,y); vec2 o = h22(i+g); o = .5+.5*sin(uTemps*.9 + 6.28*o);
          d = min(d, length(g+o-f)); } return d; }
      void main(){
        float r = length(vP) / uR;
        vec3 fond = mix(vec3(.05,.33,.42), vec3(.24,.70,.74), smoothstep(.85,.15,1.-r));
        float c = pow(1. - vor(vP*1.3 + uTemps*.15), 6.) + .6*pow(1. - vor(vP*2.3 - uTemps*.1), 8.);
        vec3 col = fond + c * vec3(.55,.75,.8) * (1.-r*.5);
        float ecume = smoothstep(.86,.97,r) * (.6 + .4*sin(uTemps*2. + atan(vP.y,vP.x)*9.));
        col = mix(col, vec3(.95,.98,1.), ecume * .8);
        float a = smoothstep(1.0,.96,r);
        gl_FragColor = vec4(col, a * .93);
        #include <colorspace_fragment>
      }`
  });
}

/* fusion des copies d'une même pièce en InstancedMesh : beaucoup moins d'appels de dessin */
function instancier(racine, reglage) {
  racine.updateMatrixWorld(true);
  const groupes = new Map(), sortie = new THREE.Group();
  racine.traverse(o => {
    if (!o.isMesh) return;
    const nom = (o.name || '') + ' ' + (o.parent?.name || '');
    const k = o.geometry.uuid + '|' + o.material.uuid;
    if (!groupes.has(k)) groupes.set(k, { geo: o.geometry, mat: o.material, nom, liste: [] });
    groupes.get(k).liste.push(o.matrixWorld.clone());
  });
  for (const g of groupes.values()) {
    const im = new THREE.InstancedMesh(g.geo, g.mat, g.liste.length);
    g.liste.forEach((m, i) => im.setMatrixAt(i, m));
    im.computeBoundingSphere(); im.name = g.nom;
    reglage?.(im, g.mat);
    sortie.add(im);
  }
  return sortie;
}

function reglerMateriau(m) {
  const n = m.name || '';
  if (m.map) m.map.anisotropy = 4;
  if (m.alphaTest > 0 || /Leaves|Flowers|Grass|Clover|Leaf/.test(n)) { m.alphaTest = Math.max(m.alphaTest, .45); m.transparent = false; m.side = THREE.DoubleSide; }
  if (/WindowGlass/.test(n)) { m.transparent = true; m.opacity = .45; m.color.set(0xbfd7e6); m.roughness = .1; }
  if (/Leaves|Leaf/.test(n)) vent(m, .018);
  else if (/Grass|Flowers|Clover|Fern|Plant/.test(n)) vent(m, .09);
}

/* ------------------------------------------------------------------ ciel et lumière */
function ciel(scene) {
  const geo = new THREE.SphereGeometry(300, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec3 vD; void main(){ float h = clamp(vD.y,0.,1.);
      vec3 c = mix(vec3(.80,.89,.95), vec3(.34,.60,.88), pow(h,.55)); gl_FragColor = vec4(c,1.);
      #include <colorspace_fragment>
    }`
  });
  scene.add(new THREE.Mesh(geo, mat));
  // nuages : des amas de boules douces, peints sur un canevas
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62); grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(.6, 'rgba(255,255,255,.85)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const nuages = new THREE.Group();
  for (let k = 0; k < 14; k++) {
    const amas = new THREE.Group(), a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 90;
    amas.position.set(Math.cos(a) * r, 55 + Math.random() * 35, Math.sin(a) * r - 40);
    for (let j = 0; j < 7; j++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, fog: false, depthWrite: false, opacity: .95 }));
      const t = 14 + Math.random() * 16; s.scale.set(t * 1.6, t, 1); s.position.set((j - 3) * 9 + Math.random() * 6, Math.random() * 6, Math.random() * 6);
      amas.add(s);
    }
    nuages.add(amas);
  }
  scene.add(nuages);
  return nuages;
}

function lumieres(scene, interieur) {
  const hemi = new THREE.HemisphereLight(interieur ? 0xfff1df : 0xcfe4f7, interieur ? 0x8a6a4a : 0x7a9a55, interieur ? 1.5 : 1.25);
  scene.add(hemi);
  const soleil = new THREE.DirectionalLight(interieur ? 0xffe2b8 : 0xfff0d8, interieur ? 1.6 : 2.6);
  soleil.castShadow = true;
  const t = TELEPHONE ? 1024 : 2048; soleil.shadow.mapSize.set(t, t);
  const c = soleil.shadow.camera; const e = interieur ? 7 : 24;
  c.left = -e; c.right = e; c.top = e; c.bottom = -e; c.near = 1; c.far = interieur ? 30 : 120;
  soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.03;
  scene.add(soleil, soleil.target);
  return soleil;
}

/* ------------------------------------------------------------------ navigation : grille + A* */
class Grille {
  constructor(plan, x0, z0, x1, z1, pas = .5, marge = .35) {
    Object.assign(this, { x0, z0, pas });
    this.nx = Math.ceil((x1 - x0) / pas); this.nz = Math.ceil((z1 - z0) / pas);
    this.bloc = new Uint8Array(this.nx * this.nz);
    for (let i = 0; i < this.nx; i++) for (let j = 0; j < this.nz; j++) {
      const x = x0 + (i + .5) * pas, z = z0 + (j + .5) * pas; let b = false;
      for (const [ax, az, bx, bz] of plan.obstacles || []) if (x > ax - marge && x < bx + marge && z > az - marge && z < bz + marge) { b = true; break; }
      if (!b) for (const [cx, cz, r] of plan.cercles || []) if ((x - cx) ** 2 + (z - cz) ** 2 < (r + marge) ** 2) { b = true; break; }
      if (!b && plan.limite && Math.hypot(x, z) > plan.limite) b = true;
      this.bloc[j * this.nx + i] = b ? 1 : 0;
    }
  }
  cellule(x, z) { return [Math.floor((x - this.x0) / this.pas), Math.floor((z - this.z0) / this.pas)]; }
  libre(i, j) { return i >= 0 && j >= 0 && i < this.nx && j < this.nz && !this.bloc[j * this.nx + i]; }
  centre(i, j) { return new THREE.Vector3(this.x0 + (i + .5) * this.pas, 0, this.z0 + (j + .5) * this.pas); }
  plusProche(i, j) {
    if (this.libre(i, j)) return [i, j];
    for (let r = 1; r < 30; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++)
      if (Math.max(Math.abs(di), Math.abs(dj)) === r && this.libre(i + di, j + dj)) return [i + di, j + dj];
    return null;
  }
  vue(a, b) {          // ligne droite praticable entre deux points ?
    const d = a.distanceTo(b), n = Math.ceil(d / (this.pas * .5));
    for (let k = 1; k < n; k++) { const p = a.clone().lerp(b, k / n); const [i, j] = this.cellule(p.x, p.z); if (!this.libre(i, j)) return false; }
    return true;
  }
  chemin(depart, arrivee) {
    let [si, sj] = this.cellule(depart.x, depart.z); const s = this.plusProche(si, sj); if (!s) return null; [si, sj] = s;
    let [ti, tj] = this.cellule(arrivee.x, arrivee.z); const t = this.plusProche(ti, tj); if (!t) return null; [ti, tj] = t;
    const N = this.nx * this.nz, g = new Float32Array(N).fill(Infinity), venu = new Int32Array(N).fill(-1), ferme = new Uint8Array(N);
    const tas = [], pousser = (k, f) => { tas.push([f, k]); let i = tas.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (tas[p][0] <= tas[i][0]) break; [tas[p], tas[i]] = [tas[i], tas[p]]; i = p; } };
    const tirer = () => { const h = tas[0], d = tas.pop(); if (tas.length) { tas[0] = d; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < tas.length && tas[l][0] < tas[m][0]) m = l; if (r < tas.length && tas[r][0] < tas[m][0]) m = r; if (m === i) break; [tas[m], tas[i]] = [tas[i], tas[m]]; i = m; } } return h; };
    const hx = (i, j) => { const dx = Math.abs(i - ti), dz = Math.abs(j - tj); return dx + dz + (Math.SQRT2 - 2) * Math.min(dx, dz); };
    const k0 = sj * this.nx + si; g[k0] = 0; pousser(k0, hx(si, sj));
    const cible = tj * this.nx + ti;
    while (tas.length) {
      const [, k] = tirer(); if (ferme[k]) continue; ferme[k] = 1; if (k === cible) break;
      const i = k % this.nx, j = (k / this.nx) | 0;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (!di && !dj) continue; const a = i + di, b = j + dj; if (!this.libre(a, b)) continue;
        if (di && dj && (!this.libre(i + di, j) || !this.libre(i, j + dj))) continue;
        const kk = b * this.nx + a, ng = g[k] + (di && dj ? Math.SQRT2 : 1);
        if (ng < g[kk]) { g[kk] = ng; venu[kk] = k; pousser(kk, ng + hx(a, b)); }
      }
    }
    if (venu[cible] < 0 && cible !== k0) return null;
    const pts = []; for (let k = cible; k >= 0; k = venu[k]) { pts.push(this.centre(k % this.nx, (k / this.nx) | 0)); if (k === k0) break; }
    pts.reverse(); pts[pts.length - 1] = this.libre(...this.cellule(arrivee.x, arrivee.z)) ? arrivee.clone().setY(0) : pts[pts.length - 1];
    // lissage : on saute les points intermédiaires quand la ligne droite passe
    const lisse = [depart.clone().setY(0)]; let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !this.vue(lisse[lisse.length - 1], pts[j])) j--; lisse.push(pts[j]); i = j; }
    return lisse.slice(1);
  }
}

/* ------------------------------------------------------------------ personnages */
const CLIPS = {};
function personnage(gltf, nom) {
  const o = SkeletonUtils.clone(gltf.scene);
  o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; if (m.material.map) m.material.map.anisotropy = 4; } });
  const mixer = new THREE.AnimationMixer(o);
  const actions = {};
  for (const c of gltf.animations) actions[c.name] = mixer.clipAction(c);
  const p = { nom, o, mixer, actions, courante: null, chemin: [], vitesse: 2.6, rot: 0, arrivee: null, parle: false };
  p.jouer = (n, fondu = .25) => {
    const a = actions[n]; if (!a || p.courante === a) return;
    a.reset().setEffectiveWeight(1).fadeIn(fondu).play(); p.courante?.fadeOut(fondu); p.courante = a;
  };
  p.jouer('Idle_Loop', 0);
  return p;
}

function avancer(p, dt) {
  if (p.chemin.length) {
    const cible = p.chemin[0], pos = p.o.position, d = cible.clone().sub(pos).setY(0), L = d.length();
    if (L < .08) { p.chemin.shift(); if (!p.chemin.length) { p.jouer('Idle_Loop'); const f = p.arrivee; p.arrivee = null; f?.(); } }
    else {
      const pasDt = Math.min(L, p.vitesse * dt); pos.addScaledVector(d.normalize(), pasDt);
      p.rot = Math.atan2(d.x, d.z); p.jouer('Walk_Loop');
    }
  }
  const diff = ((p.rot - p.o.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  p.o.rotation.y += diff * Math.min(1, dt * 10);
  p.mixer.update(dt);
}
const regarder = (p, cible) => { p.rot = Math.atan2(cible.x - p.o.position.x, cible.z - p.o.position.z); };

/* ------------------------------------------------------------------ enseignes peintes */
function enseigne(texte, dessin, larg = 2.1, haut = .5) {
  const cv = document.createElement('canvas'); cv.width = 840; cv.height = 200; const g = cv.getContext('2d');
  g.fillStyle = '#5b3a22'; g.beginPath(); g.roundRect(0, 0, 840, 200, 26); g.fill();
  g.fillStyle = '#7a5130'; g.beginPath(); g.roundRect(12, 12, 816, 176, 18); g.fill();
  g.strokeStyle = '#e9c98f'; g.lineWidth = 5; g.beginPath(); g.roundRect(26, 26, 788, 148, 12); g.stroke();
  g.fillStyle = '#f6e7c4'; g.font = '800 82px Georgia, "Times New Roman", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(texte, 480, 104); dessin(g);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(larg, haut), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 }));
  m.castShadow = true; return m;
}
const dessinPain = g => { g.save(); g.translate(112, 100); g.rotate(-.5); g.fillStyle = '#e2a65a'; g.beginPath(); g.ellipse(0, 0, 62, 20, 0, 0, 7); g.fill();
  g.strokeStyle = '#a8662b'; g.lineWidth = 6; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 22 - 8, -9); g.lineTo(k * 22 + 8, 9); g.stroke(); } g.restore(); };
const dessinCroix = g => { g.fillStyle = '#2fae5a'; g.fillRect(84, 58, 56, 84); g.fillRect(70, 72, 84, 56); g.fillStyle = '#e8fff0'; g.fillRect(102, 74, 20, 52); g.fillRect(86, 90, 52, 20); };

/* ------------------------------------------------------------------ état du jeu */
const etat = { argent: [200, 100, 100, 50, 20, 20, 10], sac: [], mission: 'pain', lieu: null, occupe: false, dialogue: null, guide: false };
const total = () => etat.argent.reduce((a, b) => a + b, 0);
function majBourse() { $('argent').textContent = euros(total()); $('sac').textContent = etat.sac.length ? 'Ton sac : ' + etat.sac.join(', ') : ''; }

const audio = new Audio(); let derniereVoix = null;
function voix(id) { if (!id) return; derniereVoix = id; audio.src = 'voix/' + id + '.mp3'; audio.currentTime = 0; audio.play().catch(() => {}); }

function bulle(t, ms = 2600) { const b = $('bulle'); b.textContent = t; b.style.display = 'block'; clearTimeout(bulle.t); bulle.t = setTimeout(() => b.style.display = 'none', ms); }
function toast(t, s) { const e = $('toast'); e.innerHTML = t + (s ? '<small>' + s + '</small>' : ''); e.classList.add('vu'); setTimeout(() => e.classList.remove('vu'), 2600); }
const fondu = v => new Promise(ok => { $('fondu').style.opacity = v ? 1 : 0; setTimeout(ok, 470); });

/* ------------------------------------------------------------------ lieux */
const LIEUX = {};
let joueur, gJoueur, gPassant, gBoulangere;
const marqueur = new THREE.Mesh(new THREE.RingGeometry(.28, .4, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, depthWrite: false }));
marqueur.rotation.x = -Math.PI / 2; marqueur.visible = false;
const fleche = new THREE.Group();
{ const m = new THREE.MeshStandardMaterial({ color: 0xffc23a, emissive: 0x6b4200, roughness: .5 });
  const c = new THREE.Mesh(new THREE.ConeGeometry(.32, .55, 20), m); c.rotation.x = Math.PI; fleche.add(c);
  const t = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .45, 12), m); t.position.y = .48; fleche.add(t); fleche.visible = false; }
function pointBulle(couleur = '#ffffff', signe = '…') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  g.fillStyle = couleur; g.beginPath(); g.arc(64, 58, 46, 0, 7); g.fill(); g.beginPath(); g.moveTo(48, 96); g.lineTo(64, 122); g.lineTo(78, 96); g.fill();
  g.fillStyle = '#c2412d'; g.font = '900 64px Figtree, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(signe, 64, 60);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false })); s.scale.set(.55, .55, 1); s.renderOrder = 9; return s;
}

async function construireExterieur() {
  const [g, plan] = await Promise.all([glbDebut('modeles/village.glb'), json('modeles/village.json')]);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfe3f2, 45, 140);
  const nuages = ciel(scene);
  const soleil = lumieres(scene, false);
  g.scene.traverse(o => { if (o.isMesh) reglerMateriau(o.material); });
  const sol = g.scene.getObjectByName('Sol_Herbe'); sol?.parent.remove(sol);
  const monde = instancier(g.scene, (im, mat) => {
    const herbe = /Grass|Flowers|Clover|Mushroom|Fern|Plant/.test(mat.name) && !/Leaves/.test(mat.name);
    im.castShadow = !herbe; im.receiveShadow = true;
  });
  scene.add(monde);
  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), solHerbe()); terrain.rotation.x = -Math.PI / 2; terrain.receiveShadow = true; scene.add(terrain);
  if (plan.etang) {
    const e = new THREE.Mesh(new THREE.CircleGeometry(plan.etang.rayon, 64), eau(plan.etang.rayon));
    e.rotation.x = -Math.PI / 2; e.position.set(plan.etang.centre[0], .035, plan.etang.centre[2]); scene.add(e);
    const fond = new THREE.Mesh(new THREE.CircleGeometry(plan.etang.rayon + .25, 48), new THREE.MeshStandardMaterial({ color: 0x5a6b3a, roughness: 1 }));
    fond.rotation.x = -Math.PI / 2; fond.position.set(plan.etang.centre[0], .02, plan.etang.centre[2]); fond.receiveShadow = true; scene.add(fond);
  }
  // enseignes au-dessus des portes
  const eb = enseigne('BOULANGERIE', dessinPain); eb.position.set(plan.portes.boulangerie.pos[0], 2.78, plan.portes.boulangerie.pos[2] + .14); scene.add(eb);
  const ep = enseigne('PHARMACIE', dessinCroix, 1.9); ep.position.set(plan.portes.pharmacie.pos[0], 2.78, plan.portes.pharmacie.pos[2] + .14); scene.add(ep);
  plan.limite = 40;
  const grille = new Grille(plan, -42, -42, 42, 42);
  const cliquables = [];
  const zone = (pos, l, h, p, donnees) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), new THREE.MeshBasicMaterial({ visible: false }));
    m.position.set(pos[0], h / 2, pos[2]); m.userData = donnees; scene.add(m); cliquables.push(m); return m;
  };
  for (const [cle, porte] of Object.entries(plan.portes)) {
    const lat = Math.abs(porte.devant[0] - porte.pos[0]) > .5;
    zone(porte.pos, lat ? .8 : 1.6, 2.6, lat ? 1.6 : .8, { type: 'porte', cle, porte, etiquette: porte.ouverte ? 'Entrer dans ' + porte.nom : porte.nom.replace(/^la /, 'La ').replace(/^le /, 'Le ') });
  }
  // le passant fait le tour de la place
  const passant = personnage(gPassant, 'passant'); const hp = plan.habitants.passant;
  passant.o.position.set(...hp.pos); passant.vitesse = 1.25; passant.ronde = hp.chemin.map(p => new THREE.Vector3(...p)); passant.etape = 0;
  scene.add(passant.o);
  const zp = zone([0, 0, 0], .9, 1.9, .9, { type: 'pnj', qui: 'passant', etiquette: 'Parler au passant' });
  const bp = pointBulle('#ffffff', '?'); scene.add(bp);
  scene.add(marqueur, fleche);
  const depart = new THREE.Vector3(...plan.depart);
  LIEUX.exterieur = {
    scene, soleil, grille, cliquables, plan, nuages, habitants: [passant],
    entrer(pos) { joueur.o.position.copy(pos || depart); scene.add(joueur.o); camCible.copy(joueur.o.position); },
    camera(dt, pres) {
      const off = new THREE.Vector3(...plan.camera.decalage).multiplyScalar(zoom);
      const vise = joueur.o.position.clone().add(new THREE.Vector3(0, 1.2, -2.5));
      camCible.lerp(vise, 1 - Math.exp(-dt * 4));
      let pos = camCible.clone().add(off), regard = camCible.clone();
      if (pres) { pos = pres.pos; regard = pres.cible; }
      camera.position.lerp(pos, 1 - Math.exp(-dt * (pres ? 3 : 5))); camLook.lerp(regard, 1 - Math.exp(-dt * (pres ? 3 : 6))); camera.lookAt(camLook);
      soleil.position.copy(joueur.o.position).add(new THREE.Vector3(-18, 34, 14)); soleil.target.position.copy(joueur.o.position);
    },
    maj(dt) {
      nuages.children.forEach((a, i) => { a.position.x += dt * (.6 + i % 3 * .25); if (a.position.x > 220) a.position.x = -220; });
      if (!passant.parle && !passant.chemin.length) {
        passant.attente = (passant.attente || 0) - dt;
        if (passant.attente <= 0) { passant.etape = (passant.etape + 1) % passant.ronde.length; passant.chemin = grille.chemin(passant.o.position, passant.ronde[passant.etape]) || []; passant.arrivee = () => passant.attente = 2.5 + Math.random() * 3; }
      }
      avancer(passant, dt);
      zp.position.set(passant.o.position.x, .95, passant.o.position.z);
      bp.visible = !etat.guide && !passant.parle; bp.position.set(passant.o.position.x, 2.25 + Math.sin(temps.value * 3) * .06, passant.o.position.z);
    }
  };
}

async function construireBoulangerie() {
  const [g, plan] = await Promise.all([glbDebut('modeles/boulangerie.glb'), json('modeles/boulangerie.json')]);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a1d14);
  const soleil = lumieres(scene, true);
  soleil.position.set(-4, 9, 6); soleil.target.position.set(0, 0, -1);
  const chaude = new THREE.PointLight(0xffb15c, 6, 9, 1.6); chaude.position.set(0, 2.6, -1.2); scene.add(chaude);
  g.scene.traverse(o => {
    if (!o.isMesh) return; reglerMateriau(o.material);
    // le mur de façade est retiré : on regarde la pièce depuis la rue
    let n = o; while (n && !/^MurAvant_/.test(n.name || '')) n = n.parent;
    if (n) o.visible = false;
  });
  const caches = []; g.scene.traverse(o => { if (o.isMesh && !o.visible) caches.push(o); }); caches.forEach(o => o.parent.remove(o));
  const monde = instancier(g.scene, im => { im.castShadow = true; im.receiveShadow = true; });
  scene.add(monde);
  // un sol sombre sous la pièce et autour
  const dessous = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 1 }));
  dessous.rotation.x = -Math.PI / 2; dessous.position.y = -.02; dessous.receiveShadow = true; scene.add(dessous);
  const boulangere = personnage(gBoulangere, 'boulangere'); const hb = plan.habitants.boulangere;
  boulangere.o.position.set(...hb.pos); regarder(boulangere, new THREE.Vector3(...hb.regard)); boulangere.o.rotation.y = boulangere.rot;
  scene.add(boulangere.o);
  plan.limite = 0; plan.obstacles.push([-3.8, -3, 3.8, -1.05]);   // derrière le comptoir : réservé à la boulangère
  const grille = new Grille(plan, -3.6, -2.6, 3.6, 2.9, .25, .25);
  const cliquables = [];
  const zone = (pos, l, h, p, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(pos[0], pos[1] ?? h / 2, pos[2]); m.userData = d; scene.add(m); cliquables.push(m); return m; };
  zone([hb.pos[0], .95, hb.pos[2]], 1, 1.9, 1, { type: 'pnj', qui: 'boulangere', etiquette: 'Parler à la boulangère' });
  zone([plan.porte.pos[0], 1.2, plan.porte.pos[2] - .2], 1.4, 2.4, .6, { type: 'sortie', etiquette: 'Sortir' });
  const bb = pointBulle('#ffffff', '…'); bb.position.set(hb.pos[0], 2.3, hb.pos[2]); scene.add(bb);
  const dedans = new THREE.Vector3(...plan.porte.dedans), cp = new THREE.Vector3(...plan.camera.pos), cc = new THREE.Vector3(...plan.camera.cible);
  LIEUX.boulangerie = {
    scene, soleil, grille, cliquables, plan, habitants: [boulangere],
    entrer() { joueur.o.position.copy(dedans); joueur.rot = Math.PI; joueur.o.rotation.y = Math.PI; scene.add(joueur.o); camera.position.copy(cp); camLook.copy(cc); },
    camera(dt, pres) {
      let pos = cp.clone().add(new THREE.Vector3(joueur.o.position.x * .35, 0, 0)), regard = cc.clone().add(new THREE.Vector3(joueur.o.position.x * .3, 0, 0));
      if (pres) { pos = pres.pos; regard = pres.cible; }
      camera.position.lerp(pos, 1 - Math.exp(-dt * 3)); camLook.lerp(regard, 1 - Math.exp(-dt * 3)); camera.lookAt(camLook);
    },
    maj(dt) { avancer(boulangere, dt); bb.visible = !boulangere.parle && etat.mission === 'pain'; bb.position.y = 2.3 + Math.sin(temps.value * 3) * .05; }
  };
}

/* ------------------------------------------------------------------ dialogues (répliques et choix) */
const DIALOGUES = {
  passant: {
    nom: 'Le passant', debut: 'bonjour',
    noeuds: {
      bonjour: { voix: 'p-bonjour', texte: 'Bonjour' + NB + '! Je peux vous aider' + NB + '?', choix: [
        { t: 'Bonjour' + NB + '! Où est la boulangerie, s’il vous plaît' + NB + '?', aller: 'chemin' },
        { t: 'Je voudrais du pain.', reponse: { voix: 'p-pain', texte: 'Du pain' + NB + '? Il faut aller à la boulangerie' + NB + '!' }, aide: 'Demande où est la boulangerie.' },
        { t: 'Au revoir' + NB + '!', aller: 'revoir' }] },
      chemin: { voix: 'p-chemin', texte: 'La boulangerie' + NB + '? C’est là, à côté de la pharmacie.', faire: () => montrerBoulangerie(), choix: [
        { t: 'Merci beaucoup' + NB + '! Au revoir' + NB + '!', aller: 'revoir' }] },
      revoir: { voix: 'p-revoir', texte: 'Au revoir, bonne journée' + NB + '!', fin: true }
    }
  },
  boulangere: {
    nom: 'La boulangère', debut: () => etat.mission === 'pain' ? 'bonjour' : 'encore',
    noeuds: {
      encore: { voix: 'b-revoir', texte: 'Au revoir, à demain' + NB + '!', fin: true },
      bonjour: { voix: 'b-bonjour', texte: 'Bonjour' + NB + '! Qu’est-ce que je vous sers' + NB + '?', choix: [
        { t: 'Bonjour' + NB + '! Une baguette, s’il vous plaît.', aller: 'voila', faire: s => { s.panier = [['une baguette', 120]]; } },
        { t: 'Je voudrais un médicament, s’il vous plaît.', reponse: { voix: 'b-medicament', texte: 'Ici, c’est une boulangerie' + NB + '! Les médicaments, c’est à la pharmacie.' } },
        { t: 'Au revoir' + NB + '!', reponse: { voix: 'b-deja', texte: 'Vous partez déjà' + NB + '? Qu’est-ce que vous voulez' + NB + '?' } }] },
      voila: { voix: 'b-voila', texte: 'Voilà votre baguette. Et avec ceci' + NB + '?', geste: 'Interact', choix: [
        { t: 'C’est tout, merci.', aller: 'prix' },
        { t: 'Un croissant aussi, s’il vous plaît.', aller: 'prix', faire: s => s.panier.push(['un croissant', 110]) }] },
      prix: { voix: s => s.panier.length > 1 ? 'b-prix-2' : 'b-prix-1', texte: s => 'Alors, ça fait ' + euros(s.prix()) + ', s’il vous plaît.', payer: true },
      fin: { voix: s => s.rendu > 0 ? 'b-monnaie' : 'b-merci', texte: s => s.rendu > 0 ? 'Merci' + NB + '! Voilà votre monnaie' + NB + ': ' + euros(s.rendu) + '. Bonne journée' + NB + '!' : 'Merci' + NB + '! Bonne journée' + NB + '!', choix: [
        { t: 'Merci, au revoir' + NB + '!', fin: true, faire: s => finirPain(s) },
        { t: 'Bonne nuit' + NB + '!', reponse: { voix: 'b-nuit', texte: 'Bonne nuit' + NB + '? Mais c’est le matin' + NB + '!' }, aide: 'Le matin, on dit «' + NB + 'Au revoir' + NB + '» ou «' + NB + 'Bonne journée' + NB + '».' }] }
    }
  }
};

function montrerBoulangerie() {
  etat.guide = true;
  const p = LIEUX.exterieur.plan.portes.boulangerie.pos; fleche.position.set(p[0], 3.6, p[2] + .4); fleche.visible = true;
}
function finirPain(s) {
  etat.mission = 'fait'; etat.sac.push(...s.panier.map(p => p[0])); majBourse();
  $('m-pain').classList.remove('actif'); $('m-pain').classList.add('fait'); $('m-pain').querySelector('i').textContent = '✓';
  setTimeout(() => toast('Mission accomplie' + NB + '!', 'Tu as acheté ' + s.panier.map(p => p[0]).join(' et ') + '.'), 600);
}

let session = null;
function ouvrirDialogue(qui, pnj) {
  const D = DIALOGUES[qui];
  session = { D, qui, pnj, panier: [], rendu: 0, prix() { return this.panier.reduce((a, p) => a + p[1], 0); } };
  etat.occupe = true; pnj.parle = true; pnj.chemin = []; regarder(pnj, joueur.o.position); regarder(joueur, pnj.o.position);
  $('aide').style.display = 'none'; $('sortir').style.display = 'none';
  $('qui').textContent = D.nom; $('dialogue').style.display = 'block';
  // plan rapproché : la caméra se place à côté des deux personnes
  const a = joueur.o.position, b = pnj.o.position, milieu = a.clone().add(b).multiplyScalar(.5);
  const dir = b.clone().sub(a).setY(0).normalize(), cote = new THREE.Vector3(-dir.z, 0, dir.x);
  if (cote.z < 0) cote.negate();
  plan = etat.lieu === 'boulangerie'
    ? { pos: milieu.clone().add(new THREE.Vector3(1.3, 1.9, 3.4)), cible: milieu.clone().add(new THREE.Vector3(0, 1.15, 0)) }
    : { pos: milieu.clone().addScaledVector(cote, 4.6).addScaledVector(dir, -1.4).add(new THREE.Vector3(0, 2.1, 0)), cible: milieu.clone().add(new THREE.Vector3(0, 1.25, 0)) };
  noeud(typeof D.debut === 'function' ? D.debut() : D.debut);
}
let plan = null;
function fermerDialogue() {
  $('dialogue').style.display = 'none'; etat.occupe = false; plan = null;
  if (session) { session.pnj.parle = false; session.pnj.jouer('Idle_Loop'); }
  session = null; joueur.jouer('Idle_Loop');
  if (etat.lieu === 'boulangerie') $('sortir').style.display = 'block';
}
function val(v) { return typeof v === 'function' ? v(session) : v; }
function noeud(id) {
  const n = session.D.noeuds[id]; session.n = n;
  n.faire?.(session);
  $('dit').textContent = val(n.texte); $('retour').textContent = ''; voix(val(n.voix));
  session.pnj.jouer(n.geste || 'Idle_Talking_Loop'); if (n.geste) setTimeout(() => session?.pnj.jouer('Idle_Talking_Loop'), 1800);
  const c = $('choix'); c.innerHTML = ''; c.className = '';
  if (n.payer) return payer();
  if (n.fin) { const b = document.createElement('button'); b.textContent = 'Continuer'; b.onclick = fermerDialogue; c.appendChild(b); return; }
  for (const ch of n.choix) {
    const b = document.createElement('button'); b.textContent = ch.t;
    b.onclick = () => {
      if (ch.reponse) { $('dit').textContent = ch.reponse.texte; voix(ch.reponse.voix); $('retour').textContent = ch.aide || ''; return; }
      ch.faire?.(session);
      if (ch.fin) return fermerDialogue();
      noeud(ch.aller);
    };
    c.appendChild(b);
  }
}
function payer() {
  const c = $('choix'); c.className = 'pieces'; const du = session.prix(); let donne = 0;
  $('retour').textContent = 'Clique sur tes pièces pour payer ' + euros(du) + '.';
  const dessiner = () => {
    c.innerHTML = '';
    etat.argent.slice().sort((a, b) => b - a).forEach(v => {
      const b = document.createElement('button'); b.textContent = v >= 100 ? (v / 100) + NB + '€' : v + NB + 'c';
      if (v >= 500) b.className = 'billet';
      b.onclick = () => {
        etat.argent.splice(etat.argent.indexOf(v), 1); donne += v; majBourse();
        if (donne >= du) {
          session.rendu = donne - du; rendreMonnaie(session.rendu); majBourse(); joueur.jouer('Interact'); setTimeout(() => joueur.jouer('Idle_Loop'), 1400);
          setTimeout(() => noeud('fin'), 500);
        } else { $('retour').textContent = 'Tu as donné ' + euros(donne) + '. Il manque ' + euros(du - donne) + '.'; dessiner(); }
      };
      c.appendChild(b);
    });
  };
  dessiner();
}
function rendreMonnaie(r) { for (const v of [200, 100, 50, 20, 10]) while (r >= v) { etat.argent.push(v); r -= v; } }

/* ------------------------------------------------------------------ interaction */
const rayon = new THREE.Raycaster(), souris = new THREE.Vector2(), plansol = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let zoom = 1; const camCible = new THREE.Vector3(), camLook = new THREE.Vector3();
function lancer(ev) {
  const r = canvas.getBoundingClientRect(); souris.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  rayon.setFromCamera(souris, camera);
}
function survol(ev) {
  if (etat.occupe || !etat.lieu) return;
  lancer(ev); const L = LIEUX[etat.lieu]; const h = rayon.intersectObjects(L.cliquables, false)[0];
  const e = $('etiquette');
  if (h) { e.textContent = h.object.userData.etiquette; e.style.left = ev.clientX + 'px'; e.style.top = ev.clientY + 'px'; e.style.display = 'block'; canvas.classList.add('main'); }
  else { e.style.display = 'none'; canvas.classList.remove('main'); }
}
function allerVers(cible, ensuite, distanceArret = 0) {
  const L = LIEUX[etat.lieu]; let c = cible.clone().setY(0);
  if (distanceArret) { const d = joueur.o.position.clone().sub(c).setY(0); if (d.length() > distanceArret) c.add(d.normalize().multiplyScalar(distanceArret)); }
  const ch = L.grille.chemin(joueur.o.position, c);
  if (!ch) { bulle('Je ne peux pas aller là.'); return false; }
  if (!ch.length) { joueur.chemin = []; joueur.arrivee = null; ensuite?.(); return true; }
  joueur.chemin = ch; joueur.arrivee = ensuite || null;
  marqueur.position.set(ch[ch.length - 1].x, .05, ch[ch.length - 1].z); marqueur.visible = etat.lieu === 'exterieur'; marqueur.scale.setScalar(1.6);
  return true;
}
let appui = null;
canvas.addEventListener('pointerdown', ev => { appui = { x: ev.clientX, y: ev.clientY }; });
canvas.addEventListener('pointermove', survol);
canvas.addEventListener('pointerup', ev => {
  if (!appui || Math.hypot(ev.clientX - appui.x, ev.clientY - appui.y) > 12) return; appui = null;
  if (etat.occupe || !etat.lieu) return;
  $('aide').style.display = 'none';
  lancer(ev); const L = LIEUX[etat.lieu];
  const h = rayon.intersectObjects(L.cliquables, false)[0];
  if (h) return agir(h.object.userData);
  const p = new THREE.Vector3(); if (rayon.ray.intersectPlane(plansol, p)) allerVers(p);
});
canvas.addEventListener('wheel', ev => { zoom = THREE.MathUtils.clamp(zoom * (ev.deltaY > 0 ? 1.08 : .92), .55, 1.45); ev.preventDefault(); }, { passive: false });

function agir(d) {
  const L = LIEUX[etat.lieu];
  if (d.type === 'porte') {
    allerVers(new THREE.Vector3(...d.porte.devant), () => {
      regarder(joueur, new THREE.Vector3(...d.porte.pos));
      if (!d.porte.ouverte) return bulle(d.cle === 'pharmacie' ? 'La pharmacie est fermée. (Bientôt dans le jeu)' : 'Personne ne répond.');
      changerLieu(d.cle);
    });
  } else if (d.type === 'pnj') {
    const pnj = L.habitants.find(h => h.nom === d.qui);
    if (d.qui === 'boulangere') allerVers(new THREE.Vector3(...L.plan.comptoir), () => ouvrirDialogue('boulangere', pnj));
    else { pnj.chemin = []; pnj.parle = true; pnj.jouer('Idle_Loop'); if (!allerVers(pnj.o.position, () => ouvrirDialogue(d.qui, pnj), 1.3)) pnj.parle = false; }
  } else if (d.type === 'sortie') {
    allerVers(new THREE.Vector3(...L.plan.porte.dedans), () => changerLieu('exterieur'));
  }
}
$('sortir').onclick = () => { if (!etat.occupe) agir({ type: 'sortie' }); };
$('rejouer').onclick = () => { if (derniereVoix) voix(derniereVoix); };

async function changerLieu(lieu) {
  etat.occupe = true; await fondu(1);
  const avant = etat.lieu; LIEUX[avant]?.scene.remove(joueur.o);
  joueur.chemin = []; joueur.jouer('Idle_Loop', 0); marqueur.visible = false;
  etat.lieu = lieu;
  if (lieu === 'exterieur') {
    const pd = LIEUX.exterieur.plan.portes[avant]; const pos = pd ? new THREE.Vector3(...pd.devant) : null;
    LIEUX.exterieur.entrer(pos); if (pd) { joueur.rot = 0; joueur.o.rotation.y = 0; }
    const off = new THREE.Vector3(...LIEUX.exterieur.plan.camera.decalage).multiplyScalar(zoom);
    camCible.copy(joueur.o.position).add(new THREE.Vector3(0, 1.2, -2.5)); camera.position.copy(camCible).add(off); camLook.copy(camCible);
    $('sortir').style.display = 'none';
    if (avant === 'boulangerie') { fleche.visible = false; }
  } else {
    LIEUX[lieu].entrer(); $('sortir').style.display = 'block';
  }
  await fondu(0); etat.occupe = false;
  if (lieu === 'boulangerie' && etat.mission === 'pain') bulle('Clique sur la boulangère pour lui parler.', 3200);
}

/* ------------------------------------------------------------------ boucle */
function boucle() {
  const dt = Math.min(horloge.getDelta(), .05); temps.value += dt;
  const L = LIEUX[etat.lieu];
  if (L) {
    avancer(joueur, dt); L.maj(dt); L.camera(dt, plan);
    if (marqueur.visible) { marqueur.scale.multiplyScalar(1 - dt * 2.2); if (marqueur.scale.x < .7) marqueur.visible = false; }
    if (fleche.visible) { fleche.position.y = 3.6 + Math.sin(temps.value * 3.2) * .18; fleche.rotation.y += dt * 1.5; }
    renderer.render(L.scene, camera);
  }
  requestAnimationFrame(boucle);
}

/* ------------------------------------------------------------------ démarrage */
(async () => {
  try {
    [gJoueur, gPassant, gBoulangere] = await Promise.all([glbDebut('modeles/joueur.glb'), glbDebut('modeles/passant.glb'), glbDebut('modeles/boulangere.glb')]);
    joueur = personnage(gJoueur, 'joueur'); joueur.vitesse = 3.1;
    await Promise.all([construireExterieur(), construireBoulangerie()]);
    etat.lieu = 'exterieur'; LIEUX.exterieur.entrer();
    joueur.rot = Math.PI; joueur.o.rotation.y = Math.PI;
    const off = new THREE.Vector3(...LIEUX.exterieur.plan.camera.decalage);
    camCible.copy(joueur.o.position).add(new THREE.Vector3(0, 1.2, -2.5)); camera.position.copy(camCible).add(off).add(new THREE.Vector3(0, 6, 8)); camLook.copy(camCible);
    window.__village.teleporter = (x, z) => { joueur.o.position.set(x, 0, z); joueur.chemin = []; };
    renderer.compile(LIEUX.exterieur.scene, camera); renderer.compile(LIEUX.boulangerie.scene, camera);
    majBourse(); boucle();
    const b = $('commencer'); b.disabled = false; b.textContent = 'Commencer';
    b.onclick = () => { $('accueil').remove(); $('aide').style.display = 'block'; audio.play().catch(() => {}); audio.pause(); };
    Object.assign(window.__village, { etat, LIEUX, joueur: () => joueur, agir, allerVers, camera });
  } catch (e) {
    console.error(e); $('erreur').style.display = 'block'; $('erreur').textContent = 'Le village n’a pas pu se charger (' + (e.message || e) + ').';
  }
})();
