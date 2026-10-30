// L'ouverture de Contact : un grand anneau de particules sur fond lavande, vu de biais, dont on
// voit la moitié gauche. En travers de l'anneau, des bandes de couleur qui se mêlent : au bord
// intérieur une brume rose et lilas, puis du violet, un cœur bleu nuit piqueté de jaune-vert,
// une bande vert anis, du rose, du bleu lavande, et au bord extérieur une poussière pastel qui
// s'éloigne et renaît. Les grains tournent lentement le long de l'anneau (plus vite au cœur),
// l'anneau ondule un peu, et suit à peine la souris ; à l'arrivée, les grains se rassemblent.
// WebGL 2 sans bibliothèque : tout le mouvement est calculé par la carte graphique. À l'arrêt
// hors de l'écran, figé si le visiteur a demandé moins d'animations.
(() => {
  const zone = document.querySelector('.heros-nuee');
  if (!zone) return;
  const toile = document.createElement('canvas');
  toile.className = 'nuee';
  toile.setAttribute('aria-hidden', 'true');
  zone.append(toile);
  const gl = toile.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) { toile.remove(); return; }
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = matchMedia('(max-width: 860px)').matches ? 90000 : 260000;
  const FOND = [240, 239, 250].map((x) => x / 255);

  // les bandes, du bord intérieur (s = 0) au bord extérieur (s = 1), et au-delà la poussière
  const BANDES = [
    { de: -0.45, a: 0.08, poids: 0.07, teintes: ['#8d74e8', '#a58cf0', '#c9b3f2', '#e3c6ec', '#d9c2ef', '#efd3ea'], brume: true },
    { de: 0.04, a: 0.28, poids: 0.16, teintes: ['#6b56e2', '#7c62ea', '#5d6fe6', '#8a6ef0', '#4f5fd8'] },
    { de: 0.24, a: 0.5, poids: 0.26, teintes: ['#1d1e6c', '#262385', '#30289c', '#232f8f', '#3a2fb2', '#1a2a78'], piquets: ['#d9ec6e', '#e6f08a', '#b9a4ff'] },
    { de: 0.49, a: 0.62, poids: 0.11, teintes: ['#c3e75c', '#b4dd6b', '#d5ef85', '#a8d870'] },
    { de: 0.6, a: 0.73, poids: 0.13, teintes: ['#ee9cd2', '#f5b6dd', '#e88bc6', '#f3a8c8'] },
    { de: 0.7, a: 0.88, poids: 0.15, teintes: ['#a3b2f1', '#92bcf0', '#b8c0f5', '#8ea6ee', '#a9d0f3'] },
    { de: 0.86, a: 1.9, poids: 0.14, teintes: ['#c9c2f6', '#f4c0df', '#bfe8d8', '#a9c6f5', '#d7d3f7', '#9fb3f2'], poussiere: true },
  ];
  const rvb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  let graine = 20260;
  const hasard = () => { graine |= 0; graine = (graine + 0x6d2b79f5) | 0; let t = Math.imul(graine ^ (graine >>> 15), 1 | graine); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const gauss = () => (hasard() + hasard() + hasard() - 1.5) / 0.5;
  const total = BANDES.reduce((x, b) => x + b.poids, 0);
  const pos = new Float32Array(N * 4), coul = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    let h = hasard() * total, k = 0;
    while (h > BANDES[k].poids) h -= BANDES[k++].poids;
    const b = BANDES[k];
    let s;
    if (b.poussiere) s = Math.min(b.a, b.de + -Math.log(1 - hasard()) * 0.2);
    else if (b.brume) s = b.a - (b.a - b.de) * hasard() ** 1.8;
    else s = b.de + (b.a - b.de) * hasard() + gauss() * 0.015;
    // l'épaisseur de l'anneau : pleine au cœur, plus diffuse dans la brume et la poussière
    const plein = 0.2 * Math.sqrt(Math.max(0, 1 - ((s - 0.42) / 0.62) ** 2));
    const diffus = s > 0.86 ? 0.04 + (s - 0.86) * 0.22 : s < 0.04 ? 0.05 + (0.04 - s) * 0.3 : 0;
    // de temps en temps un grain de la bande voisine, pour que les couleurs se mêlent
    const voisine = hasard() < 0.035 ? BANDES[Math.min(BANDES.length - 1, Math.max(0, k + (hasard() < 0.5 ? -1 : 1)))] : b;
    const teinte = b.piquets && hasard() < 0.05 ? b.piquets[Math.floor(hasard() * b.piquets.length)] : voisine.teintes[Math.floor(hasard() * voisine.teintes.length)];
    pos.set([hasard() * Math.PI * 2, s, gauss() * (plein + diffus), hasard()], i * 4);
    coul.set([...rvb(teinte), Math.round((b.poussiere ? 0.45 + hasard() * 0.5 : 0.65 + hasard() * 0.6) * 160)], i * 4);
  }

  const SOMMETS = `#version 300 es
    in vec4 aPos; in vec4 aCoul;
    uniform mat4 uProj; uniform mat3 uRot; uniform vec3 uCentre;
    uniform float uR, uT, uArrivee, uPx;
    out vec3 vCoul; out float vFondu;
    void main() {
      float th = aPos.x, s = aPos.y, g = aPos.w, vie = 0.0;
      // la poussière s'éloigne de l'anneau, s'efface et renaît
      if (s > 0.9) { vie = fract(g * 13.7 + uT * 0.012); s += vie * 0.35; }
      // les grains tournent le long de l'anneau, plus vite au cœur
      th += uT * (0.03 + 0.035 * exp(-pow((s - 0.38) / 0.3, 2.0)));
      float rho = uR * (0.6 + 0.8 * s + 0.03 * sin(th * 2.0 + uT * 0.35 + s * 3.0));
      float z = uR * (aPos.z + 0.025 * sin(th * 3.0 - uT * 0.4 + g * 6.2831));
      vec3 p = uRot * vec3(rho * cos(th), rho * sin(th), z) + uCentre;
      // à l'arrivée, chaque grain vient d'un peu plus loin, les uns après les autres
      float k = clamp(uArrivee * 1.6 - g * 0.6, 0.0, 1.0);
      k = 1.0 - pow(1.0 - k, 3.0);
      p = mix(p + vec3(sin(g * 91.7), cos(g * 53.3), sin(g * 17.9 + 1.0)) * uR * 0.9, p, k);
      gl_Position = uProj * vec4(p, 1.0);
      gl_PointSize = max(1.0, aCoul.a * 20.0 * uPx / -p.z);
      vCoul = aCoul.rgb;
      vFondu = clamp(clamp((-p.z - 3.4) / 6.0, 0.0, 0.3) + vie * 0.85 + (1.0 - k) * 0.7, 0.0, 1.0);
    }`;
  const PIXELS = `#version 300 es
    precision mediump float;
    in vec3 vCoul; in float vFondu;
    uniform vec3 uFond;
    out vec4 o;
    void main() {
      vec2 q = gl_PointCoord - 0.5;
      float r = length(q);
      if (r > 0.5) discard;
      // un grain rond, à peine éclairé par le haut à gauche, qui pâlit vers le fond
      float a = smoothstep(0.5, 0.34, r);
      vec3 c = mix(vCoul * (1.08 - 0.4 * length(q + vec2(0.16))), uFond, vFondu);
      o = vec4(c * a, a);
    }`;
  const nuanceur = (type, src) => { const n = gl.createShader(type); gl.shaderSource(n, src); gl.compileShader(n); return n; };
  const prog = gl.createProgram();
  gl.attachShader(prog, nuanceur(gl.VERTEX_SHADER, SOMMETS));
  gl.attachShader(prog, nuanceur(gl.FRAGMENT_SHADER, PIXELS));
  gl.bindAttribLocation(prog, 0, 'aPos'); gl.bindAttribLocation(prog, 1, 'aCoul');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { toile.remove(); return; }
  gl.useProgram(prog);
  const tampon = (donnees, attribut, taille, type, normalise) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, donnees, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribut);
    gl.vertexAttribPointer(attribut, taille, type, normalise, 0, 0);
  };
  gl.bindVertexArray(gl.createVertexArray());
  tampon(pos, 0, 4, gl.FLOAT, false);
  tampon(coul, 1, 4, gl.UNSIGNED_BYTE, true);
  const u = Object.fromEntries(['uProj', 'uRot', 'uCentre', 'uR', 'uT', 'uArrivee', 'uPx', 'uFond'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  gl.uniform3fv(u.uFond, FOND);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  // la caméra à l'origine, vers -z ; l'anneau (rayon 1) placé selon le format de l'ouverture
  const D = 3.4, demi = Math.tan((35 / 2) * Math.PI / 180);
  let L = 0, H = 0, souris = [0, 0], cible = [0, 0];
  function taille() {
    const b = zone.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    L = b.width; H = b.height;
    toile.width = Math.round(L * dpr); toile.height = Math.round(H * dpr);
    gl.viewport(0, 0, toile.width, toile.height);
    const asp = L / H, f = 1 / demi, pres = 0.1, loin = 40;
    gl.uniformMatrix4fv(u.uProj, false, [f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (loin + pres) / (pres - loin), -1, 0, 0, (2 * loin * pres) / (pres - loin), 0]);
    const h = demi * D, l = h * asp;
    // en large, l'anneau à droite du texte ; en étroit (téléphone), en haut, le texte dessous
    if (asp > 1.1) gl.uniform3fv(u.uCentre, [l * 0.95, -h * 0.1, -D]), gl.uniform1f(u.uR, h);
    else gl.uniform3fv(u.uCentre, [l * 0.9, h * 0.55, -D]), gl.uniform1f(u.uR, h * 0.62);
    gl.uniform1f(u.uPx, dpr * Math.min(1.4, Math.max(0.75, H / 800)));
  }
  function rotation() {
    souris[0] += (cible[0] - souris[0]) * 0.04; souris[1] += (cible[1] - souris[1]) * 0.04;
    const ax = 0.42 + souris[1] * 0.05, ay = -0.55 + souris[0] * 0.08;
    const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];
    // Ry · Rx, en colonnes
    gl.uniformMatrix3fv(u.uRot, false, [cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx]);
  }
  function image(t, arrivee) {
    rotation();
    gl.uniform1f(u.uT, t); gl.uniform1f(u.uArrivee, arrivee);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
  }

  let visible = true, debut = null;
  const boucle = (maintenant) => {
    if (debut === null) debut = maintenant;
    const t = (maintenant - debut) / 1000;
    image(t + 20, Math.min(1, t / 2.8));
    if (visible) requestAnimationFrame(boucle);
  };
  taille();
  new ResizeObserver(() => { taille(); if (calme) image(20, 1); }).observe(zone);
  if (calme) { image(20, 1); return; }
  new IntersectionObserver(([e]) => { const etait = visible; visible = e.isIntersecting; if (visible && !etait) requestAnimationFrame(boucle); }).observe(zone);
  zone.addEventListener('pointermove', (e) => { const b = zone.getBoundingClientRect(); cible = [(e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5]; });
  requestAnimationFrame(boucle);
})();
