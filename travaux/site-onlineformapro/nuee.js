// Les nuées de particules des pages, sur fond blanc : des grains ronds, à peine éclairés comme de
// petites billes, aux couleurs de l'ouverture (bleu nuit, violet, bleu, pêche, rose, lavande).
// Chaque élément [data-nuee] en reçoit une, vue selon son plan :
//   anneau : un grand anneau vu de biais, dont on voit la moitié gauche (l'ouverture de Contact).
//     En travers de l'anneau, des bandes qui se mêlent : au bord intérieur une brume rose et
//     lilas, puis du violet, un cœur bleu nuit piqueté de rose et d'orangé, une bande pêche, du
//     rose, du bleu lavande, et au bord extérieur une poussière pastel qui s'éloigne et renaît ;
//   gros-plan : le même anneau, la caméra tout contre lui : un épais boudin de grains traverse
//     l'écran en diagonale, ses bandes filent le long de lui ;
//   tres-gros-plan : plus près encore, les grains deviennent de grosses billes qui emplissent
//     l'écran ;
//   vagues : une nappe de grains en couches de couleur, qui ondule comme un relief et file.
// Les grains glissent lentement (le long de l'anneau, ou de la nappe), la forme ondule et suit à
// peine la souris ; à l'arrivée, les grains se rassemblent. WebGL 2 sans bibliothèque : tout le
// mouvement est calculé par la carte graphique. Chaque nuée se crée à l'approche de l'écran,
// s'arrête hors de l'écran, et reste figée si le visiteur a demandé moins d'animations.
(() => {
  const FOND = [1, 1, 1];
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const petit = matchMedia('(max-width: 860px)').matches;
  const D = 3.4, DEMI = Math.tan((35 / 2) * Math.PI / 180);

  // les bandes de l'anneau, du bord intérieur (s = 0) au bord extérieur (s = 1), et au-delà la poussière
  const BANDES = [
    { de: -0.3, a: 0.08, poids: 0.05, teintes: ['#8d74e8', '#a58cf0', '#c9b3f2', '#e3c6ec', '#d9c2ef', '#efd3ea'], brume: true },
    { de: 0.04, a: 0.28, poids: 0.16, teintes: ['#6b56e2', '#7c62ea', '#5d6fe6', '#8a6ef0', '#4f5fd8'] },
    { de: 0.24, a: 0.5, poids: 0.26, teintes: ['#1d1e6c', '#262385', '#30289c', '#232f8f', '#3a2fb2', '#1a2a78'], piquets: ['#ff8fb1', '#ffb088', '#b9a4ff'] },
    { de: 0.49, a: 0.62, poids: 0.11, teintes: ['#ffb088', '#ff9d7a', '#ffc39e', '#f7a27f'] },
    { de: 0.6, a: 0.73, poids: 0.13, teintes: ['#ee9cd2', '#f5b6dd', '#e88bc6', '#f3a8c8'] },
    { de: 0.7, a: 0.88, poids: 0.15, teintes: ['#a3b2f1', '#92bcf0', '#b8c0f5', '#8ea6ee', '#a9d0f3'] },
    { de: 0.86, a: 1.9, poids: 0.14, teintes: ['#c9c2f6', '#f4c0df', '#ffd3c2', '#a9c6f5', '#d7d3f7', '#9fb3f2'], poussiere: true },
  ];
  // les couches de la nappe, du dessus au fond
  const COUCHES = [['#5d6fe6', '#4f7be8', '#6c8ff0'], ['#7c62ea', '#8a6ef0', '#9a7ff2'], ['#ee9cd2', '#f5b6dd', '#e88bc6'],
    ['#ffb088', '#ff9d7a', '#ffc39e'], ['#a3b2f1', '#b8c0f5', '#c9c2f6'], ['#262385', '#30289c', '#3a2fb2'], ['#4f5fd8', '#6b56e2', '#5d6fe6']];

  // les plans : forme, nombre de grains (ordinateur, téléphone), et leur pose selon le format
  // (h et l : la demi-hauteur et la demi-largeur visibles à la distance D). cible : où va le
  // pivot (point de la forme) ; rot : inclinaisons (x, y, roulis) ; tour : la part de
  // l'anneau semée (début, longueur) ou la longueur de la nappe ; vit : vitesse (rad/s ou
  // unités/s) ; brume : les grains lointains pâlissent (début, longueur)
  const PLANS = {
    anneau: { forme: 0, n: [360000, 120000], pose: (h, l, asp) => {
      const R = asp > 1.1 ? h * 1.15 : h * 0.78;
      return { cible: asp > 1.1 ? [h * 1.37 - l * 0.06, -h * 0.06, -D] : [l * 0.95, h * 0.62, -D], pivot: [0, 0, 0],
        R: R * 0.96, larg: R * 0.8, epais: R, rot: [0.42, -0.55, 0], tour: [0, Math.PI * 2], vit: 0.03, taille: 1.12, brume: [3.4, 6] };
    } },
    'gros-plan': { forme: 0, n: [400000, 140000], pose: () => ({ cible: [0.3, -0.05, -3.6], pivot: [7, 0, 0],
      R: 7, larg: 1.6, epais: 1.3, rot: [0.95, -0.25, 0.65], tour: [-0.62, 1.24], vit: 0.006, taille: 1.25, brume: [3.2, 7] }) },
    'tres-gros-plan': { forme: 0, n: [420000, 150000], pose: () => ({ cible: [0.05, 0.05, -1.45], pivot: [9, 0, 0],
      R: 9, larg: 1.3, epais: 1.7, rot: [1.0, 0.3, -0.5], tour: [-0.24, 0.48], vit: 0.004, taille: 0.75, brume: [1.6, 5] }) },
    vagues: { forme: 1, n: [400000, 140000], pose: () => ({ cible: [0, -0.45, -3.0], pivot: [0, 0, 0],
      R: 0, larg: 1, epais: 0.4, rot: [0.5, -0.45, 0.06], tour: [0, 7], vit: 0.12, taille: 1.25, brume: [3.2, 8] }) },
  };

  const rvb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  function semer(plan, N, tour) {
    let graine = 20260;
    const hasard = () => { graine |= 0; graine = (graine + 0x6d2b79f5) | 0; let t = Math.imul(graine ^ (graine >>> 15), 1 | graine); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const gauss = () => (hasard() + hasard() + hasard() - 1.5) / 0.5;
    const choisir = (liste) => liste[Math.floor(hasard() * liste.length)];
    const pos = new Float32Array(N * 4), coul = new Uint8Array(N * 4);
    const total = BANDES.reduce((x, b) => x + b.poids, 0);
    for (let i = 0; i < N; i++) {
      if (plan.forme === 1) {
        // la nappe : x le long du courant, d la profondeur dans l'épaisseur, z en travers ; la
        // couleur en larges bandes obliques, ondulées, décalées un peu avec la profondeur (les
        // couches se lisent sur la tranche)
        const x = hasard() * tour[1], d = hasard(), z = (hasard() * 2 - 1) * 2.2;
        const bande = x * 0.32 + z * 0.45 + 0.3 * Math.sin(1.2 * z + 0.7 * x) + d * 0.35 + gauss() * 0.025;
        const b = Math.floor(((bande % 1) + 1) % 1 * COUCHES.length);
        pos.set([x, d, z, hasard()], i * 4);
        coul.set([...rvb(choisir(COUCHES[b])), Math.round((0.7 + hasard() * 0.55) * 160)], i * 4);
        continue;
      }
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
      const teinte = b.piquets && hasard() < 0.05 ? choisir(b.piquets) : choisir(voisine.teintes);
      pos.set([hasard() * tour[1], s, gauss() * (plein + diffus), hasard()], i * 4);
      coul.set([...rvb(teinte), Math.round((b.poussiere ? 0.45 + hasard() * 0.5 : 0.65 + hasard() * 0.6) * 160)], i * 4);
    }
    return { pos, coul };
  }

  const SOMMETS = `#version 300 es
    in vec4 aPos; in vec4 aCoul;
    uniform mat4 uProj; uniform mat3 uRot; uniform vec3 uCentre;
    uniform float uForme, uR, uLarg, uEpais, uTour0, uTourL, uVit, uT, uArrivee, uPx, uDisp, uBrume0, uBrumeL, uMax;
    out vec3 vCoul; out float vFondu;
    void main() {
      float s = aPos.y, g = aPos.w, vie = 0.0;
      vec3 q;
      if (uForme < 0.5) {
        // la poussière s'éloigne de l'anneau, s'efface et renaît
        if (s > 0.9) { vie = fract(g * 13.7 + uT * 0.012); s += vie * 0.35; }
        // les grains glissent le long de l'anneau, plus vite au cœur
        float th = uTour0 + mod(aPos.x + uT * uVit * (1.0 + 1.17 * exp(-pow((s - 0.38) / 0.3, 2.0))), uTourL);
        float a = th * uR;
        float rho = uR + uLarg * (s - 0.45 + 0.0375 * sin(a * 1.6 + uT * 0.35 + s * 3.0));
        q = vec3(rho * cos(th), rho * sin(th), uEpais * aPos.z + uLarg * 0.03 * sin(a * 2.4 - uT * 0.4 + g * 6.2831));
      } else {
        // la nappe file le long de x et ondule comme un relief
        float x = mod(aPos.x + uT * uVit, uTourL) - uTourL * 0.5, z = aPos.z;
        float y = 0.35 * sin(1.1 * x + 0.4 * uT + 0.8 * sin(0.7 * z)) + 0.25 * sin(0.9 * z - 0.3 * uT + 0.5 * x);
        q = vec3(x, y - s * uEpais, z);
      }
      vec3 p = uRot * q + uCentre;
      // à l'arrivée, chaque grain vient d'un peu plus loin, les uns après les autres
      float k = clamp(uArrivee * 1.6 - g * 0.6, 0.0, 1.0);
      k = 1.0 - pow(1.0 - k, 3.0);
      p = mix(p + vec3(sin(g * 91.7), cos(g * 53.3), sin(g * 17.9 + 1.0)) * uDisp, p, k);
      gl_Position = uProj * vec4(p, 1.0);
      gl_PointSize = clamp(aCoul.a * 20.0 * uPx / max(-p.z, 0.05), 1.0, uMax);
      vCoul = aCoul.rgb;
      vFondu = clamp(clamp((-p.z - uBrume0) / uBrumeL, 0.0, 0.3) + vie * 0.85 + (1.0 - k) * 0.7, 0.0, 1.0);
    }`;
  const PIXELS = `#version 300 es
    precision mediump float;
    in vec3 vCoul; in float vFondu;
    uniform vec3 uFond;
    out vec4 o;
    void main() {
      vec2 q = (gl_PointCoord - 0.5) * 2.0;
      float r2 = dot(q, q);
      if (r2 > 1.0) discard;
      // une petite bille : éclairée en haut à gauche, un reflet, et qui pâlit vers le fond
      vec3 n = vec3(q.x, -q.y, sqrt(1.0 - r2));
      float lum = 0.6 + 0.52 * max(dot(n, normalize(vec3(-0.45, 0.55, 0.7))), 0.0);
      float reflet = pow(max(dot(n, normalize(vec3(-0.3, 0.4, 1.0))), 0.0), 28.0) * 0.22;
      vec3 c = mix(vCoul * lum + reflet, uFond, vFondu);
      float a = smoothstep(1.0, 0.8, r2);
      o = vec4(c * a, a);
    }`;

  function creer(zone, plan) {
    const toile = document.createElement('canvas');
    toile.className = 'nuee';
    toile.setAttribute('aria-hidden', 'true');
    zone.append(toile);
    const gl = toile.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
    if (!gl) { toile.remove(); return; }
    const N = plan.n[petit ? 1 : 0];
    const nuanceur = (type, src) => { const n = gl.createShader(type); gl.shaderSource(n, src); gl.compileShader(n); return n; };
    const prog = gl.createProgram();
    gl.attachShader(prog, nuanceur(gl.VERTEX_SHADER, SOMMETS));
    gl.attachShader(prog, nuanceur(gl.FRAGMENT_SHADER, PIXELS));
    gl.bindAttribLocation(prog, 0, 'aPos'); gl.bindAttribLocation(prog, 1, 'aCoul');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { toile.remove(); return; }
    gl.useProgram(prog);
    let pose = plan.pose(1, 1, 1.6);
    const { pos, coul } = semer(plan, N, pose.tour);
    gl.bindVertexArray(gl.createVertexArray());
    [[pos, 0, gl.FLOAT, false], [coul, 1, gl.UNSIGNED_BYTE, true]].forEach(([donnees, attribut, type, normalise]) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, donnees, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(attribut);
      gl.vertexAttribPointer(attribut, 4, type, normalise, 0, 0);
    });
    const u = Object.fromEntries(['uProj', 'uRot', 'uCentre', 'uForme', 'uR', 'uLarg', 'uEpais', 'uTour0', 'uTourL', 'uVit', 'uT', 'uArrivee', 'uPx', 'uDisp', 'uBrume0', 'uBrumeL', 'uMax', 'uFond']
      .map((n) => [n, gl.getUniformLocation(prog, n)]));
    gl.uniform3fv(u.uFond, FOND);
    gl.uniform1f(u.uForme, plan.forme);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    // la caméra à l'origine, vers -z
    let souris = [0, 0], cible = [0, 0];
    function taille() {
      const b = zone.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      toile.width = Math.round(b.width * dpr); toile.height = Math.round(b.height * dpr);
      gl.viewport(0, 0, toile.width, toile.height);
      const asp = b.width / b.height, f = 1 / DEMI, pres = 0.05, loin = 40;
      gl.uniformMatrix4fv(u.uProj, false, [f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (loin + pres) / (pres - loin), -1, 0, 0, (2 * loin * pres) / (pres - loin), 0]);
      pose = plan.pose(DEMI * D, DEMI * D * asp, asp);
      gl.uniform1f(u.uR, pose.R); gl.uniform1f(u.uLarg, pose.larg); gl.uniform1f(u.uEpais, pose.epais);
      gl.uniform1f(u.uTour0, pose.tour[0]); gl.uniform1f(u.uTourL, pose.tour[1]); gl.uniform1f(u.uVit, pose.vit);
      gl.uniform1f(u.uDisp, pose.larg * 1.125);
      gl.uniform1f(u.uBrume0, pose.brume[0]); gl.uniform1f(u.uBrumeL, pose.brume[1]);
      gl.uniform1f(u.uPx, pose.taille * dpr * Math.min(1.4, Math.max(0.75, b.height / 800)));
      gl.uniform1f(u.uMax, 44 * dpr);
    }
    // la rotation (Rz · Ry · Rx, en colonnes) et le centre, pour que le pivot reste à sa cible
    function poser() {
      souris[0] += (cible[0] - souris[0]) * 0.04; souris[1] += (cible[1] - souris[1]) * 0.04;
      const [ax, ay, az] = [pose.rot[0] + souris[1] * 0.05, pose.rot[1] + souris[0] * 0.08, pose.rot[2]];
      const [cx, sx, cy, sy, cz, sz] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
      const m = [cz * cy, sz * cy, -sy, cz * sy * sx - sz * cx, sz * sy * sx + cz * cx, cy * sx, cz * sy * cx + sz * sx, sz * sy * cx - cz * sx, cy * cx];
      gl.uniformMatrix3fv(u.uRot, false, m);
      const [px, py, pz] = pose.pivot;
      gl.uniform3fv(u.uCentre, [0, 1, 2].map((i) => pose.cible[i] - (m[i] * px + m[3 + i] * py + m[6 + i] * pz)));
    }
    function image(t, arrivee) {
      poser();
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
  }

  // chaque nuée se crée à l'approche de l'écran (la semer prend un instant)
  const approche = new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) { approche.unobserve(e.target); creer(e.target, PLANS[e.target.dataset.nuee] || PLANS.anneau); }
  }, { rootMargin: '300px 0px' });
  document.querySelectorAll('[data-nuee]').forEach((zone) => approche.observe(zone));
})();
