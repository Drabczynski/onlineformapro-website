// Les fils de lumière de l'ouverture de la page LMS : une nappe de fils fins, blancs et bleu
// pâle, avec quelques fils pêche, roses et dorés, qui vient du bas de l'écran, se soulève en
// une vague et file vers un horizon brumeux. Des éclats de lumière courent le long des fils ;
// la vague ondule lentement et suit à peine la souris. Au défilement, l'ouverture tire vers le
// blanc et se fond dans la page (la variable CSS --blanc, de 0 à 1).
//
// WebGL 2 sans bibliothèque : chaque fil est une bande de triangles, de largeur constante à
// l'écran, calculée par la carte graphique (un seul tracé pour tous les fils). L'animation
// s'arrête hors de l'écran, et reste figée si le visiteur a demandé moins d'animations ; sans
// WebGL 2, le fond dégradé reste seul.
(() => {
  const zone = document.querySelector('[data-fils]');
  if (!zone) return;
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const petit = matchMedia('(max-width: 860px)').matches;

  const fond = document.createElement('div');
  fond.className = 'fils-fond';
  fond.setAttribute('aria-hidden', 'true');
  const toile = document.createElement('canvas');
  fond.append(toile);
  zone.prepend(fond);

  // au défilement, vers le blanc
  const blanchir = () => {
    const h = zone.offsetHeight || 1;
    zone.style.setProperty('--blanc', Math.min(1, Math.max(0, scrollY / (h * 0.45))).toFixed(3));
  };
  addEventListener('scroll', blanchir, { passive: true });
  blanchir();

  const gl = toile.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true });
  if (!gl) return;

  // les fils : [couleur, opacité, part] ; les fils de couleur vont par petits groupes
  const TEINTES = [
    ['#ffffff', 0.62, 0.34], ['#f1f4ff', 0.5, 0.2], ['#8fa2ec', 0.4, 0.17], ['#a58cf0', 0.34, 0.1],
    ['#c9b3f2', 0.5, 0.06], ['#ffb088', 0.85, 0.05], ['#ee9cd2', 0.8, 0.05], ['#ffd59a', 0.85, 0.03],
  ];
  const N = petit ? 130 : 200, S = petit ? 160 : 240;
  const rvb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  let graine = 1302;
  const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const fils = new Float32Array(N * 4), couleurs = new Uint8Array(N * 4);
  let groupe = null, reste = 0;
  for (let i = 0; i < N; i++) {
    // une teinte tirée au sort, ou la suite d'un petit groupe de fils de couleur
    let teinte;
    if (reste > 0) { teinte = groupe; reste--; } else {
      let r = hasard(), k = 0;
      while (k < TEINTES.length - 1 && r > TEINTES[k][2]) { r -= TEINTES[k][2]; k++; }
      teinte = TEINTES[k];
      if (k >= 5) { groupe = teinte; reste = 1 + Math.floor(hasard() * 3); }
    }
    const [r, v, b] = rvb(teinte[0]);
    fils.set([(i + 0.5) / N + (hasard() - 0.5) * 0.6 / N, hasard(), 0.6 + hasard() * 0.8, 0.7 + hasard() * 0.8], i * 4);
    couleurs.set([r, v, b, Math.round(255 * teinte[1] * (0.75 + hasard() * 0.25))], i * 4);
  }
  // les fibres : de courtes mèches qui s'échappent de la crête et flottent
  const NF = petit ? 70 : 150, fibres = new Float32Array(NF * 4), teintesFibres = new Uint8Array(NF * 4);
  for (let i = 0; i < NF; i++) {
    fibres.set([0.25 + 0.75 * hasard(), hasard(), 0.6 + hasard() * 0.8, 0.4 + hasard() * 0.4], i * 4);
    const [r, v, b] = rvb(['#ffffff', '#ffffff', '#f1f4ff', '#c9b3f2', '#ffd5bd'][Math.floor(hasard() * 5)]);
    teintesFibres.set([r, v, b, Math.round(255 * (0.35 + hasard() * 0.3))], i * 4);
  }
  // le gabarit d'un fil : S pas le long, deux côtés
  const gabarit = new Float32Array((S + 1) * 4);
  for (let j = 0; j <= S; j++) gabarit.set([j / S, -1, j / S, 1], j * 4);

  const SOMMETS = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aSommet;     // le long du fil (0 → 1), le côté (-1, 1)
    layout(location = 1) in vec4 aFil;        // place en travers, phase, éclat, épaisseur
    layout(location = 2) in vec4 aCoul;
    uniform mat4 uProj, uVue;
    uniform float uT, uLarg, uFibres;
    uniform vec2 uRes;
    out vec4 vCoul;
    out float vCote, vFondu, vEclat;

    // la crête de la vague, le long des fils, pour le fil a : basse à gauche, haute à droite
    float creteDe(float a) { return mix(0.2, 0.1, a) + 0.018 * sin(uT * 0.35 + a * 4.0); }

    // la nappe : a en travers (0 → 1), t le long (0 au plus près, 1 à l'horizon) ; crete : la
    // part de la vague en ce point
    vec3 nappe(float a, float t, out float crete) {
      float z = mix(-6.0, -80.0, pow(t, 1.4));
      // elle vient du bas de l'écran et s'élargit en filant vers la droite de l'horizon
      float centre = mix(-2.0, 10.0, smoothstep(0.0, 0.9, t)) + 1.2 * sin(t * 3.0 + 0.6);
      float largeur = mix(14.0, 80.0, t);
      float x = centre + (a - 0.5) * largeur;
      // la vague : une crête en biais, basse à gauche, haute à droite, qui ondule lentement ;
      // les fils y montent, passent la crête et filent au loin en redescendant doucement
      float tc = creteDe(a);
      float h = 1.0 + 5.5 * a + 0.4 * sin(a * 3.1 + uT * 0.22);
      float monte = smoothstep(tc - 0.13, tc, t), loin = smoothstep(tc, tc + 0.6, t);
      float d = (t - tc) / 0.035;
      crete = exp(-d * d);
      float y = -3.2 + h * monte * (1.0 - 0.6 * loin);
      // au-delà, la nappe roule doucement
      y += 0.4 * loin * sin(t * 8.0 - uT * 0.3 + a * 2.2);
      // de légères ondulations, au premier plan
      y += 0.05 * (1.0 - t) * sin(t * 26.0 - uT * 0.9 + a * 5.0);
      return vec3(x, y, z);
    }

    // une fibre : elle part de la crête, monte en ondoyant, recule un peu et se perd
    vec3 fibre(vec4 f, float s) {
      float c, ph = f.y * 6.2832;
      vec3 b = nappe(f.x, creteDe(f.x) + (f.y - 0.5) * 0.015, c);
      return b + vec3(0.45 * s * sin(s * 4.0 + ph + uT * 0.7),
                      (0.35 + 0.9 * f.w) * s + 0.1 * sin(s * 10.0 + ph * 2.0 + uT * 1.2),
                      -0.8 * s * f.z);
    }

    void main() {
      float t = aSommet.x, cp = 0.0, cq;
      float t2 = min(1.0, t + 0.003) - (t >= 0.997 ? 0.006 : 0.0);
      vec3 p, q;
      if (uFibres > 0.5) { p = fibre(aFil, t); q = fibre(aFil, t2); }
      else { p = nappe(aFil.x, t, cp); q = nappe(aFil.x, t2, cq); }
      vec4 P = uProj * uVue * vec4(p, 1.0), Q = uProj * uVue * vec4(q, 1.0);
      vec2 sp = P.xy / P.w * uRes * 0.5, sq = Q.xy / Q.w * uRes * 0.5;
      vec2 dir = sq - sp;
      dir = length(dir) > 1e-4 ? normalize(dir) : vec2(0.0, 1.0);
      if (t >= 0.997) dir = -dir;
      // plus épais au premier plan, jamais moins d'un pixel et demi
      // à la crête, les fils s'élargissent en une lueur
      float larg = uLarg * aFil.w * clamp(14.0 / P.w, 0.7, 2.6) * (1.0 + 1.8 * cp);
      P.xy += vec2(-dir.y, dir.x) * aSommet.y * larg / (uRes * 0.5) * P.w;
      gl_Position = P;
      vCote = aSommet.y;
      vCoul = aCoul;
      // les bouts se perdent : en bas de l'écran et dans la brume de l'horizon
      vFondu = uFibres > 0.5 ? sin(3.1416 * t) : smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.55, 0.98, t));
      // un éclat court le long du fil ; la crête s'allume
      float e = sin(t * 18.0 - uT * (0.6 + 0.5 * aFil.z) + aFil.y * 6.2832);
      vEclat = pow(max(e, 0.0), 40.0) * aFil.z * (1.0 - uFibres) + 0.7 * cp;
    }`;
  const PIXELS = `#version 300 es
    precision highp float;
    in vec4 vCoul;
    in float vCote, vFondu, vEclat;
    out vec4 sortie;
    void main() {
      float k = exp(-vCote * vCote * 3.2);
      float a = clamp(vCoul.a * k * vFondu * (1.0 + 1.6 * vEclat), 0.0, 1.0);
      vec3 c = mix(vCoul.rgb, vec3(1.0), clamp(vEclat, 0.0, 0.85));
      sortie = vec4(c * a, a);
    }`;

  const nuanceur = (type, src) => { const n = gl.createShader(type); gl.shaderSource(n, src); gl.compileShader(n); return n; };
  const prog = gl.createProgram();
  gl.attachShader(prog, nuanceur(gl.VERTEX_SHADER, SOMMETS));
  gl.attachShader(prog, nuanceur(gl.FRAGMENT_SHADER, PIXELS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);
  // deux jeux : les fils de la nappe, les fibres de la crête (le même gabarit)
  const gabaritTampon = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gabaritTampon);
  gl.bufferData(gl.ARRAY_BUFFER, gabarit, gl.STATIC_DRAW);
  const jeu = (donnees, teintes) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gabaritTampon);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    [[donnees, 1, gl.FLOAT, false], [teintes, 2, gl.UNSIGNED_BYTE, true]].forEach(([d, attribut, type, normalise]) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(attribut);
      gl.vertexAttribPointer(attribut, 4, type, normalise, 0, 0);
      gl.vertexAttribDivisor(attribut, 1);
    });
    return vao;
  };
  const vaoFils = jeu(fils, couleurs), vaoFibres = jeu(fibres, teintesFibres);
  const u = Object.fromEntries(['uProj', 'uVue', 'uT', 'uLarg', 'uRes', 'uFibres'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  // la caméra : un peu au-dessus de la nappe, le regard à peine baissé ; la souris la fait pivoter
  let souris = [0, 0], cible = [0, 0], dpr = 1;
  function taille() {
    const b = fond.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    toile.width = Math.max(1, Math.round(b.width * dpr)); toile.height = Math.max(1, Math.round(b.height * dpr));
    gl.viewport(0, 0, toile.width, toile.height);
    const asp = b.width / Math.max(1, b.height), f = 1 / Math.tan((asp > 1 ? 38 : 60) / 2 * Math.PI / 180), pres = 0.1, loin = 120;
    gl.uniformMatrix4fv(u.uProj, false, [f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (loin + pres) / (pres - loin), -1, 0, 0, (2 * loin * pres) / (pres - loin), 0]);
    gl.uniform2f(u.uRes, toile.width, toile.height);
    gl.uniform1f(u.uLarg, 1.4 * dpr);
  }
  function vue() {
    souris[0] += (cible[0] - souris[0]) * 0.04; souris[1] += (cible[1] - souris[1]) * 0.04;
    const ax = 0.12 + souris[1] * 0.03, ay = souris[0] * 0.05;
    const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];
    // Rx · Ry, en colonnes, puis la caméra à (0, 0, 0) : le monde tourne à l'inverse
    gl.uniformMatrix4fv(u.uVue, false, [cy, sx * sy, -cx * sy, 0, 0, cx, sx, 0, sy, -sx * cy, cx * cy, 0, 0, 0, 0, 1]);
  }
  function image(t) {
    vue();
    gl.uniform1f(u.uT, t);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u.uFibres, 0);
    gl.bindVertexArray(vaoFils);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (S + 1) * 2, N);
    gl.uniform1f(u.uFibres, 1);
    gl.bindVertexArray(vaoFibres);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (S + 1) * 2, NF);
  }

  let visible = true, debut = null;
  const boucle = (maintenant) => {
    if (debut === null) debut = maintenant;
    image((maintenant - debut) / 1000 + 12);
    if (visible) requestAnimationFrame(boucle);
  };
  taille();
  new ResizeObserver(() => { taille(); if (calme) image(12); }).observe(fond);
  if (calme) { image(12); return; }
  new IntersectionObserver(([e]) => { const etait = visible; visible = e.isIntersecting; if (visible && !etait) requestAnimationFrame(boucle); }).observe(fond);
  zone.addEventListener('pointermove', (e) => { const b = zone.getBoundingClientRect(); cible = [(e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5]; });
  requestAnimationFrame(boucle);
})();
