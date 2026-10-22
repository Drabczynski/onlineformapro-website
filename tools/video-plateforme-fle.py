#!/usr/bin/env python3
"""La vidéo de la Plateforme FLE, à partir des cinq visuels Onlineformapro.

    FFMPEG=/chemin/vers/ffmpeg python3 tools/video-plateforme-fle.py [--essai]

  travaux/video-plateforme-fle/visuels/*.webp → travaux/video-plateforme-fle/plateforme-fle.mp4

Les cinq visuels partagent le même en-tête, au même endroit : le logo, puis « Plateforme
FLE ». La vidéo s'en sert : l'en-tête reste en place, seuls le sous-titre et les captures
changent, qui montent d'un visuel à l'autre ; pendant qu'un visuel est à l'écran, ses
captures avancent doucement vers le spectateur. La première image est déjà un visuel
complet (c'est elle que Facebook prend pour vignette). La fin reprend l'appel du mailing
Plateforme FLE : « Demandez vos accès démo ».

Format 4:5 (1080 × 1350), celui qui prend le plus de place dans un fil Facebook ou
Instagram ; 30 images par seconde, H.264, sans son (les vidéos démarrent muettes dans les
fils). Chaque image est la page de scène rendue par Chromium à un instant donné, puis
encodée par ffmpeg (sans ffmpeg installé : pip install imageio-ffmpeg, qui en fournit un).
--essai rend quelques images fixes au lieu de la vidéo.
"""
import base64, json, os, pathlib, shutil, subprocess, sys, tempfile, textwrap

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "travaux" / "video-plateforme-fle"
VISUELS = ["ressources", "parcours", "vocabulaire", "battles", "evaluation"]   # dans l'ordre
SORTIE = DOSSIER / "plateforme-fle.mp4"
PLAYWRIGHT = "/opt/node22/lib/node_modules/playwright/index.js"
CACHE = pathlib.Path(tempfile.gettempdir()) / "civicap-polices"
POLICES = {"inter-latin.woff2": ("Inter:wght@400..800", "Inter", "400 800"),
           "teko-500-latin.woff2": ("Teko:wght@500", "Teko", "500")}
IPS, DUREE = 30, 23.0


def police(fichier, famille):
    cible = CACHE / fichier
    if not cible.exists():
        import re
        CACHE.mkdir(parents=True, exist_ok=True)
        css = subprocess.run(["curl", "-sS", "-A", "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0 Safari/537.36",
                              f"https://fonts.googleapis.com/css2?family={famille}&display=swap"],
                             check=True, capture_output=True, text=True).stdout
        url = re.search(r"/\* latin \*/\s*@font-face\s*\{[^}]*?src:\s*url\(([^)]+)\)", css, re.S).group(1)
        subprocess.run(["curl", "-sS", url, "-o", str(cible)], check=True)
    return base64.b64encode(cible.read_bytes()).decode()


def scene():
    polices = "".join(f"@font-face{{font-family:'{nom}';font-weight:{g};src:url(data:font/woff2;base64,"
                      f"{police(f, fam)}) format('woff2')}}" for f, (fam, nom, g) in POLICES.items())
    images = json.dumps([(DOSSIER / "visuels" / f"{v}.webp").as_uri() for v in VISUELS])
    return """<!doctype html><meta charset="utf-8"><style>""" + polices + """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden;background:#250F52}
#f{position:absolute;inset:0;overflow:hidden;background:#250F52}
#fonds{position:absolute;inset:0;z-index:0}
.fond{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(26px) brightness(.85)}
#cam{position:absolute;inset:0;z-index:1;transform-origin:50% 50%}
/* le visuel fait 1080 × 1224 à l'écran, centré : 63 px de bande en haut et en bas */
.corps{position:absolute;left:0;top:351px;width:1080px;height:999px;overflow:hidden}
.corps img{position:absolute;left:0;top:-288px;width:1080px;transform-origin:50% 288px}
.tete{position:absolute;left:0;top:63px;width:1080px;height:327px;overflow:hidden;
  -webkit-mask-image:linear-gradient(#000 calc(100% - 16px),transparent)}
.tete img{position:absolute;left:0;top:0;width:1080px}
#fin{position:absolute;z-index:2;left:0;right:0;top:420px;bottom:63px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;color:#fff;font-family:Inter}
#fin > *{opacity:0}
.l1,.l2{font-weight:700;font-size:88px;line-height:1.02;letter-spacing:-.025em}
.l2{color:#FEED3F}
.caps{margin-top:34px;font-family:Teko;font-weight:500;font-size:46px;line-height:1;letter-spacing:.015em;color:#A09FDF}
.site{margin-top:46px;background:#fff;color:#250F52;font-weight:700;font-size:38px;letter-spacing:-.01em;
  padding:20px 44px;border-radius:999px;box-shadow:0 18px 40px -12px rgba(0,0,0,.45)}
.mail{margin-top:22px;font-weight:500;font-size:27px;color:#A09FDF}
</style>
<div id="f">
  <div id="fonds"></div>
  <div id="cam"><div id="corps"></div><div id="tetes"></div></div>
  <div id="fin">
    <div class="l1">Demandez vos</div>
    <div class="l2">accès démo</div>
    <div class="caps">RESSOURCES · PARCOURS · JEUX · SUIVI DES APPRENANTS</div>
    <div class="site">onlineformapro.com</div>
    <div class="mail">projet@onlineformapro.com</div>
  </div>
</div>
<script>
const IMG = """ + images + """;
const N = IMG.length, TENUE = 3.6, TRANS = 0.9, DEBUT_FIN = 18.4;
const fonds = [], corps = [];
for (const src of IMG) {
  const fd = document.createElement('div'); fd.className = 'fond'; fd.style.backgroundImage = `url(${src})`;
  document.getElementById('fonds').appendChild(fd); fonds.push(fd);
  const c = document.createElement('div'); c.className = 'corps'; c.innerHTML = `<img src="${src}">`;
  document.getElementById('corps').appendChild(c); corps.push(c);
}
// un seul en-tête pour toute la vidéo, pris sur un visuel en pleine résolution : celui
// des « ressources » est plus petit, et deux en-têtes en fondu se dédoubleraient
const tete = document.createElement('div'); tete.className = 'tete'; tete.style.zIndex = 40;
tete.innerHTML = `<img src="${IMG[1]}">`; document.getElementById('tetes').appendChild(tete);
const fin = [...document.querySelectorAll('#fin > *')];
const borne = (x) => Math.min(1, Math.max(0, x));
const doux = (x) => { x = borne(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sortie = (x) => 1 - Math.pow(1 - borne(x), 3);
const entree = (k) => k * TENUE;            // la transition qui amène le visuel k commence ici

function rendu(t) {
  // ouverture : la caméra recule sur le premier visuel, déjà complet
  const c0 = sortie(t / 1.4);
  document.getElementById('cam').style.transform = `scale(${1.09 - .09 * c0})`;
  for (let k = 0; k < N; k++) {
    const a = k === 0 ? -TRANS : entree(k);                    // début de l'arrivée
    const d = k === N - 1 ? Infinity : entree(k + 1);          // début du départ
    const u = borne((t - a) / TRANS), v = borne((t - d) / TRANS);
    const visible = t >= a && t < d + TRANS;
    for (const el of [corps[k], fonds[k]]) el.style.display = visible ? 'block' : 'none';
    if (!visible) continue;
    const img = corps[k].firstChild;
    // départ : remonte de 30 px en s'effaçant vite ; arrivée : monte de 80 px, une fois
    // l'ancien presque effacé, pour que deux sous-titres ne se superposent pas
    const op = k === 0 ? 1 : doux((u - .35) / .65);
    const opd = 1 - doux(v / .45);
    const ty = (1 - doux(u)) * 80 - doux(v) * 30;
    const zoom = 1 + .045 * borne((t - Math.max(a, 0)) / (TENUE + TRANS));
    let filtre = 'none';
    if (k === N - 1) {                                           // la fin : le dernier visuel s'estompe
      const w = doux((t - DEBUT_FIN) / 1.0);
      filtre = `blur(${16 * w}px) brightness(${1 - .62 * w})`;
    }
    corps[k].style.zIndex = 10 + k; fonds[k].style.zIndex = k;
    corps[k].style.opacity = op * opd;
    img.style.transform = `translateY(${ty}px) scale(${zoom})`;
    img.style.filter = filtre;
    fonds[k].style.opacity = k === 0 ? 1 : doux(u / .6);
  }
  fin.forEach((el, i) => {
    const w = sortie((t - DEBUT_FIN - .35 - i * .15) / .7);
    el.style.opacity = w; el.style.transform = `translateY(${(1 - w) * 36}px)`;
  });
}
window.rendu = rendu;
</script>"""


RENDU = """
import pw from '%(pw)s';
import { spawn } from 'child_process';
const [page_, sortie, ffmpeg, ips, duree, essai] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto('file://' + page_);
await p.evaluate(async () => { await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode())); });
if (essai) {
  for (const t of essai.split(',').map(Number)) {
    await p.evaluate(t => rendu(t), t);
    await p.screenshot({ path: `${sortie}-${t}.png` });
  }
} else {
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', ips, '-c:v', 'mjpeg',
    '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', sortie], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(Number(duree) * Number(ips));
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => rendu(t), i / Number(ips));
    const img = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((ok, ko) => ff.on('close', c => c === 0 ? ok() : ko(new Error('ffmpeg ' + c))));
}
await b.close();
"""


def ffmpeg():
    chemin = os.environ.get("FFMPEG") or shutil.which("ffmpeg")
    if not chemin:
        sys.exit("ffmpeg introuvable : l'installer, ou pip install imageio-ffmpeg puis FFMPEG=<chemin>.")
    return chemin


if __name__ == "__main__":
    essai = "--essai" in sys.argv
    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp) / "scene.html"
        page.write_text(scene(), encoding="utf-8")
        script = pathlib.Path(tmp) / "rendu.mjs"
        script.write_text(RENDU % {"pw": PLAYWRIGHT}, encoding="utf-8")
        cible = (pathlib.Path(os.environ.get("ESSAI_DIR", tmp)) / "essai") if essai else SORTIE
        subprocess.run(["node", str(script), str(page), str(cible), "" if essai else ffmpeg(),
                        str(IPS), str(DUREE), "0.01,2,3.85,4.0,4.2,11.15,15,19.0,22.9" if essai else ""],
                       check=True)
    if not essai:
        print(f"{SORTIE.relative_to(RACINE)} : {DUREE:.0f} s, {SORTIE.stat().st_size // 1024} Ko")
