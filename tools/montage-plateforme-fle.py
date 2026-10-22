#!/usr/bin/env python3
"""Montage de la vidéo face caméra sur la Plateforme FLE (30 s, 9:16).

    FFMPEG=/chemin/ffmpeg python3 tools/montage-plateforme-fle.py BRUT.mp4 TRAVAIL [--images DIR] [--essai]

  --images DIR      recadre les captures fournies (voir INSERTS) dans TRAVAIL/inserts/
  → TRAVAIL/montage-plateforme-fle.mp4

La vidéo source n'est pas dans le dépôt (on y voit la personne qui parle) ; la sortie non plus.

Ce que fait le montage, sur la parole :
- sous-titres mot à mot, le mot prononcé en jaune : la plupart des vidéos se regardent sans
  le son. Le texte est la transcription Whisper (modèle « base », minutage au mot), corrigée
  à la main : « l'apprenant », « naturalisation »… Les minutages restent ceux de Whisper.
- zooms francs à chaque nouvelle phrase, comme un changement de caméra ;
- les captures de la plateforme posées sur le buste, jamais sur le visage, au moment où il
  en parle : l'accroche « S'intégrer ≠ Obtenir un diplôme », les activités, les dialogues
  avec l'IA, les situations du quotidien, le parcours, l'examen blanc ;
- une carte de fin de 3 s : « Demandez vos accès démo », reprise du mailing Plateforme FLE ;
- le son normalisé à -14 LUFS, la cible des réseaux sociaux.

Chaque image est une page HTML rendue par Chromium (l'image source à cet instant, plus les
calques), encodée en H.264 ; --essai rend quelques images fixes.
"""
import base64, json, os, pathlib, shutil, subprocess, sys, tempfile, textwrap

PLAYWRIGHT = "/opt/node22/lib/node_modules/playwright/index.js"
CACHE = pathlib.Path(tempfile.gettempdir()) / "civicap-polices"
POLICES = {"inter-latin.woff2": ("Inter", "400 800"), "teko-500-latin.woff2": ("Teko", "500")}
IPS, FIN_PAROLE, DUREE = 30, 30.0, 33.2

# la parole : (mot, début, fin), texte corrigé sur le minutage de Whisper ; « / » ouvre un
# nouveau sous-titre
MOTS = """/Apprendre .14 .62|le .62 .80|français .80 1.18|/pour 1.18 1.62|s'intégrer, 1.62 2.52
|/n'est 3.00 3.12|pas 3.12 3.26|la 3.26 3.36|même 3.36 3.52|chose 3.52 3.68
|/qu'apprendre 3.68 3.96|le 3.96 4.12|français 4.12 4.40|/pour 4.40 4.60|obtenir 4.60 4.96
|un 4.96 5.10|diplôme. 5.10 5.50|/C'est 5.68 5.74|pourquoi 5.74 6.00|on 6.00 6.30|a 6.30 6.48
|construit 6.48 7.26|/des 7.26 7.54|centaines 7.54 8.12|d'activités 8.12 8.84
|pédagogiques, 8.84 9.52|/des 9.60 9.66|scénarios 9.66 10.16|immersifs 10.16 10.80
|/pour 10.80 11.34|apprendre 11.34 12.02|à 12.02 12.46|prendre 12.46 13.08|/un 13.08 13.28
|rendez-vous 13.28 13.56|chez 13.56 13.74|le 13.74 13.82|médecin, 13.82 14.10
|/à 14.50 14.88|aller 14.88 15.15|à 15.15 15.25|la 15.25 15.40|boulangerie, 15.40 15.96
|/lire 16.08 16.36|une 16.36 16.78|lettre 16.78 17.06|administrative. 17.06 18.00
|/Ces 18.14 18.36|scénarios 18.36 18.78|immersifs, 18.78 19.44|/l'apprenant 19.64 20.10
|va 20.10 20.24|pouvoir 20.24 20.54|/les 20.54 20.84|faire 20.84 21.08|et 21.08 21.26
|les 21.26 21.38|refaire 21.38 21.80|/autant 22.20 22.48|de 22.48 22.60|fois 22.60 22.82
|qu'il 22.82 23.42|le 23.42 23.64|faudra, 23.64 23.98|/avec 24.02 24.32|au 24.32 24.66
|final 24.66 24.96|/la 24.96 25.36|passation 25.36 25.80|du 25.80 26.06|fameux 26.40 27.06
|/test 27.06 27.26|civique 27.26 27.76|/en 27.76 28.10|vue 28.10 28.34|d'une 28.34 28.84
|future 28.84 29.10|naturalisation. 29.10 29.86"""

# les captures, recadrées depuis les images fournies (images de la session) : source, boîte
INSERTS = {
    "boulangerie.png": ("35.jpg", (512, 176, 889, 400)),
    "france-travail.png": ("35.jpg", (1299, 176, 1676, 400)),
    "serie.png": ("35.jpg", (79, 572, 473, 1060)),
    "examen-blanc.png": ("35.jpg", (919, 1253, 1313, 1503)),
    "parcours.png": ("34.jpg", None),
    "ia-logistique.png": ("36.png", None),
    "ia-cuisinier.png": ("37.png", None),
    "collage.png": ("38.webp", None),
}


def mots():
    out, chunk = [], -1
    for item in MOTS.replace("\n", "").split("|"):
        texte, a, b = item.rsplit(" ", 2)
        if texte.startswith("/"):
            chunk, texte = chunk + 1, texte[1:]
        out.append({"m": texte, "a": float(a), "b": float(b), "c": chunk})
    return out


def police(fichier):
    return base64.b64encode((CACHE / fichier).read_bytes()).decode()


def scene(travail, nb_images):
    polices = "".join(f"@font-face{{font-family:'{nom}';font-weight:{g};src:url(data:font/woff2;base64,"
                      f"{police(f)}) format('woff2')}}" for f, (nom, g) in POLICES.items())
    ins = (travail / "inserts").as_uri() + "/"
    images = (travail / "images").as_uri() + "/"
    return """<!doctype html><meta charset="utf-8"><style>""" + polices + """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#f{position:absolute;inset:0;overflow:hidden}
#cam{position:absolute;inset:0;transform-origin:50% 22%}
#cam img{width:1080px;height:1920px;display:block;filter:contrast(1.05) saturate(1.08)}
/* les captures, sur le buste : entre le menton et les sous-titres */
.ins{position:absolute;left:50%;top:0;opacity:0;will-change:transform}
.carte{border-radius:28px;overflow:hidden;box-shadow:0 34px 70px -18px rgba(0,0,0,.6),0 0 0 6px rgba(255,255,255,.95)}
.carte img{display:block;width:100%}
.nu img{display:block;width:100%;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))}
.puce{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;background:#FEED3F;color:#1B0B45;
  font:800 34px/1 Inter;letter-spacing:-.01em;padding:14px 26px 15px;border-radius:999px;
  box-shadow:0 14px 30px -10px rgba(0,0,0,.5)}
/* l'accroche */
.pilule{background:#fff;color:#14092F;font:800 60px/1 Inter;letter-spacing:-.025em;padding:24px 40px 26px;
  border-radius:999px;white-space:nowrap;box-shadow:0 24px 50px -16px rgba(0,0,0,.55);display:flex;align-items:center;gap:18px}
.pilule i{width:22px;height:22px;border-radius:50%;background:#16A34A;display:block}
.pilule.b i{background:#6D28D9}
.diff{font:800 120px/1 Inter;color:#FEED3F;text-shadow:0 10px 30px rgba(0,0,0,.5)}
/* sous-titres */
#st{position:absolute;left:70px;right:70px;top:1300px;height:250px;display:flex;align-items:center;justify-content:center}
.ligne{text-align:center;font:800 70px/1.12 Inter;letter-spacing:-.015em;color:#fff;
  -webkit-text-stroke:12px #170A3D;paint-order:stroke fill;text-wrap:balance;word-spacing:.2em}
.ligne span{display:inline-block;transition:none}
.ligne .on{color:#FEED3F}
/* carte de fin */
#fin{position:absolute;inset:0;opacity:0;background:
  radial-gradient(80% 45% at 85% 10%,rgba(124,58,237,.55),transparent 70%),
  radial-gradient(70% 40% at 10% 95%,rgba(255,158,80,.35),transparent 70%),
  linear-gradient(180deg,#160A3E 0%,#24104F 60%,#1A0B45 100%)}
#fin > *{position:absolute;left:0;right:0;text-align:center}
.f-collage{top:300px;left:40px!important;right:40px!important}
.f-collage img{width:100%;display:block;filter:drop-shadow(0 40px 50px rgba(0,0,0,.5))}
.f-titre{top:930px;font:800 112px/1 Inter;letter-spacing:-.035em;
  background:linear-gradient(90deg,#4BEBF9,#B8F5B0 55%,#E7F591);-webkit-background-clip:text;color:transparent}
.f-caps{top:1068px;font:500 50px/1 Teko;letter-spacing:.02em;color:#A09FDF}
.f-cta{top:1180px;font:800 74px/1.05 Inter;letter-spacing:-.025em;color:#fff}
.f-cta b{color:#FEED3F;font-weight:800}
.f-site{top:1400px}
.f-site span{display:inline-block;background:#fff;color:#1B0B45;font:800 44px/1 Inter;padding:24px 50px;border-radius:999px;
  box-shadow:0 20px 44px -14px rgba(0,0,0,.5)}
</style>
<div id="f">
  <div id="cam"><img id="v"></div>
  <div id="accroche" class="ins" style="top:620px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:22px;transform:translateX(-50%)">
      <div class="pilule a" id="p1"><i></i>S'intégrer</div>
      <div class="diff" id="p2">≠</div>
      <div class="pilule b" id="p3"><i></i>Obtenir un diplôme</div>
    </div>
  </div>
  <div id="collage" class="ins nu" style="top:560px;width:1180px"><img src="INS/collage.png"></div>
  <div id="ia1" class="ins carte" style="top:610px;width:880px"><img src="INS/ia-cuisinier.png"></div>
  <div id="ia2" class="ins carte" style="top:900px;width:430px"><img src="INS/ia-logistique.png"></div>
  <div id="boul" class="ins carte" style="top:640px;width:700px"><img src="INS/boulangerie.png"></div>
  <div id="ft" class="ins carte" style="top:640px;width:700px"><img src="INS/france-travail.png"></div>
  <div id="parc" class="ins carte" style="top:600px;width:960px;height:560px"><img src="INS/parcours.png" style="width:1144px;height:auto"></div>
  <div id="serie" class="ins carte" style="top:700px;width:440px"><img src="INS/serie.png"></div>
  <div id="exam" class="ins carte" style="top:650px;width:760px"><img src="INS/examen-blanc.png"></div>
  <div class="puce" id="puce" style="top:520px;opacity:0"></div>
  <div id="st"></div>
  <div id="fin">
    <div class="f-collage"><img src="INS/collage.png"></div>
    <div class="f-titre">Plateforme FLE</div>
    <div class="f-caps">ACTIVITÉS · DIALOGUES AVEC L'IA · EXAMEN CIVIQUE</div>
    <div class="f-cta">Demandez vos<br><b>accès démo</b></div>
    <div class="f-site"><span>onlineformapro.com</span></div>
  </div>
</div>
<script>
const MOTS = """.replace("INS/", ins) + json.dumps(mots(), ensure_ascii=False) + """;
const IMAGES = '""" + images + """', NB = """ + str(nb_images) + """, IPS = """ + str(IPS) + """, FIN = """ + str(FIN_PAROLE) + """;
const borne = x => Math.min(1, Math.max(0, x));
const sortie = x => 1 - Math.pow(1 - borne(x), 3);
const rebond = x => { x = borne(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const doux = x => { x = borne(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const $ = id => document.getElementById(id);

// zooms : un plan par phrase, comme un changement de caméra
const PLANS = [[0, 1.00, 1.04], [5.66, 1.12, 1.13], [9.58, 1.03, 1.05], [14.4, 1.12, 1.14],
               [18.1, 1.00, 1.03], [24.0, 1.10, 1.11], [27.0, 1.17, 1.19], [FIN, 1.19, 1.19]];
function zoom(t) {
  for (let i = PLANS.length - 2; i >= 0; i--) if (t >= PLANS[i][0]) {
    const [a, z0, z1] = PLANS[i], b = PLANS[i + 1][0];
    return z0 + (z1 - z0) * borne((t - a) / (b - a));
  }
  return 1;
}

// une capture : apparition avec rebond, légère dérive, sortie rapide
function capture(id, a, b, opts = {}) {
  return t => {
    const el = $(id), u = (t - a) / .42, v = (t - b) / .26;
    if (t < a - .01 || t > b + .3) { el.style.opacity = 0; return; }
    const s = (.8 + .2 * rebond(u)) * (1 - .1 * borne(v)) * (1 + (opts.derive ?? .03) * borne((t - a) / (b - a)));
    const r = (opts.rot ?? 0) * (1 - sortie(u));
    const dx = opts.dx ?? 0, dy = (1 - sortie(u)) * 50;
    el.style.opacity = borne(u * 2.2) * (1 - borne(v));
    el.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px) rotate(${r}deg) scale(${s})`;
    if (opts.pan) opts.pan(el, borne((t - a) / (b - a)));
  };
}
const CAPTURES = [
  capture('collage', 5.72, 9.5, { rot: -3, derive: .05,
    pan: (el, p) => el.firstChild.style.transform = `translateX(${60 - 120 * p}px)` }),
  capture('ia1', 9.66, 14.2, { rot: -2, dx: -40 }),
  capture('ia2', 10.5, 14.2, { rot: 3, dx: 230 }),
  capture('boul', 14.5, 16.0, { rot: -2 }),
  capture('ft', 16.08, 18.05, { rot: 2 }),
  capture('parc', 18.14, 23.95, { derive: .02,
    pan: (el, p) => el.firstChild.style.transform = `translateX(${-doux(p) * 184}px) translateY(${-doux(p) * 0}px)` }),
  capture('serie', 21.38, 23.95, { rot: 4, dx: 250 }),
  capture('exam', 24.96, 29.9, { rot: -2 }),
];
// la pastille qui nomme ce qu'on voit
const PUCES = [[5.72, 9.5, 'Jeux · vidéos · modules interactifs', 500], [9.66, 14.2, 'Dialogues avec l’IA', 520],
  [14.5, 18.05, 'Situations du quotidien', 560], [18.14, 23.95, 'Parcours individualisé', 520],
  [24.96, 29.9, 'Entraînement à l’examen civique', 560]];

function accroche(t) {
  const el = $('accroche');
  const fin = borne((t - 5.5) / .25);
  el.style.opacity = t < .2 || t > 5.8 ? 0 : 1 - fin;
  el.style.transform = `translateY(${-30 * fin}px)`;
  const pop = (id, a) => { const u = (t - a) / .38; $(id).style.opacity = borne(u * 2.5);
    $(id).style.transform = `scale(${t < a ? .6 : .6 + .4 * rebond(u)})`; };
  pop('p1', 1.62); pop('p2', 4.4); pop('p3', 4.6);
}

const st = $('st');
let chunkAffiche = -2;
function sousTitres(t) {
  if (t >= FIN) { st.innerHTML = ''; chunkAffiche = -2; return; }
  let c = -1;
  for (let i = 0; i < MOTS.length; i++) if (MOTS[i].a - .06 <= t) c = MOTS[i].c;
  const mots = MOTS.filter(m => m.c === c);
  const dernier = mots.length ? mots[mots.length - 1] : null;
  const suivant = MOTS.find(m => m.c === c + 1);
  if (!dernier || (t > dernier.b + .5 && (!suivant || t < suivant.a - .06))) { st.innerHTML = ''; return; }
  if (c !== chunkAffiche) {
    st.innerHTML = '<div class="ligne">' + mots.map(m => `<span>${m.m}</span>`).join(' ') + '</div>';
    chunkAffiche = c;
  }
  const debut = mots[0].a - .06, u = (t - debut) / .16;
  st.firstChild.style.transform = `scale(${.86 + .14 * sortie(u)})`;
  st.firstChild.style.opacity = borne(u * 1.5);
  const spans = st.firstChild.children;
  mots.forEach((m, i) => {
    const prochain = mots[i + 1] ? mots[i + 1].a : m.b + .4;
    const actif = t >= m.a - .04 && t < prochain - .04;
    spans[i].className = actif ? 'on' : '';
    spans[i].style.transform = actif ? 'scale(1.06)' : 'none';
  });
}

function fin(t) {
  const u = (t - FIN) / .45;
  $('fin').style.opacity = borne(u);
  const el = (sel, a, dy = 40) => { const w = sortie((t - FIN - a) / .55), e = document.querySelector(sel);
    e.style.opacity = w; e.style.transform = `translateY(${(1 - w) * dy}px)`; };
  el('.f-collage', .15, 80); el('.f-titre', .35); el('.f-caps', .5); el('.f-cta', .65); el('.f-site', .85);
  const c = document.querySelector('.f-collage img');
  c.style.transform = `rotate(-4deg) scale(${1 + .04 * borne((t - FIN) / 3)})`;
}

window.rendu = async t => {
  const n = Math.min(NB, Math.max(1, Math.round(t * IPS) + 1));
  const v = $('v'), src = `${IMAGES}${String(n).padStart(4, '0')}.jpg`;
  if (v.dataset.n != n) { v.src = src; v.dataset.n = n; await v.decode(); }
  const flou = borne((t - FIN) / .45);
  v.style.filter = `contrast(1.05) saturate(1.08) blur(${18 * flou}px) brightness(${1 - .5 * flou})`;
  $('cam').style.transform = `scale(${zoom(t)})`;
  accroche(t);
  for (const c of CAPTURES) c(t);
  const puce = $('puce'), p = PUCES.find(([a, b]) => t >= a && t <= b + .3);
  if (p) { const [a, b, txt, y] = p; if (puce.textContent !== txt) puce.textContent = txt;
    const u = (t - a - .12) / .3, v2 = (t - b) / .25;
    puce.style.top = y + 'px'; puce.style.opacity = borne(u * 2) * (1 - borne(v2));
    puce.style.transform = `translateX(-50%) translateY(${(1 - sortie(u)) * -20}px)`; }
  else puce.style.opacity = 0;
  sousTitres(t);
  fin(t);
};
</script>"""


RENDU = """
import pw from '%(pw)s';
import { spawn } from 'child_process';
const [page_, sortie, ffmpeg, ips, duree, essai] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + page_);
await p.evaluate(async () => { await document.fonts.ready;
  await Promise.all([...document.images].filter(i => i.src).map(i => i.decode())); });
if (essai) {
  for (const t of essai.split(',').map(Number)) {
    await p.evaluate(t => rendu(t), t);
    await p.screenshot({ path: `${sortie}-${t}.png` });
  }
} else {
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', ips, '-c:v', 'mjpeg',
    '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', sortie],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(Number(duree) * Number(ips));
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => rendu(t), i / Number(ips));
    const img = await p.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((ok, ko) => ff.on('close', c => c === 0 ? ok() : ko(new Error('ffmpeg ' + c))));
}
await b.close();
"""


def inserts(images, dossier):
    """Recadre les captures fournies (--images DIR : les fichiers de INSERTS)."""
    from PIL import Image
    dossier.mkdir(parents=True, exist_ok=True)
    for nom, (src, boite) in INSERTS.items():
        im = Image.open(images / src)
        (im.crop(boite) if boite else im).save(dossier / nom)


def lance(ff, *args):
    subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


if __name__ == "__main__":
    brut, travail = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    essai = "--essai" in sys.argv
    ff = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or sys.exit("ffmpeg introuvable")
    if "--images" in sys.argv:
        inserts(pathlib.Path(sys.argv[sys.argv.index("--images") + 1]), travail / "inserts")
    (travail / "images").mkdir(parents=True, exist_ok=True)
    if not any((travail / "images").iterdir()):
        lance(ff, "-i", str(brut), "-q:v", "2", str(travail / "images" / "%04d.jpg"))
    nb = len(list((travail / "images").glob("*.jpg")))
    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp) / "scene.html"
        page.write_text(scene(travail, nb), encoding="utf-8")
        script = pathlib.Path(tmp) / "rendu.mjs"
        script.write_text(RENDU % {"pw": PLAYWRIGHT}, encoding="utf-8")
        if essai:
            subprocess.run(["node", str(script), str(page), str(travail / "essai"), "", str(IPS), str(DUREE),
                            "0.05,1.9,4.8,7.5,11.2,15.2,17.0,20.5,22.6,27.4,31.0,33.1"], check=True)
            sys.exit()
        muet = pathlib.Path(tmp) / "muet.mp4"
        subprocess.run(["node", str(script), str(page), str(muet), ff, str(IPS), str(DUREE), ""], check=True)
        sortie = travail / "montage-plateforme-fle.mp4"
        # le son : normalisé à -14 LUFS, prolongé de silence sous la carte de fin
        lance(ff, "-i", str(muet), "-i", str(brut), "-map", "0:v", "-map", "1:a", "-c:v", "copy",
              "-af", f"loudnorm=I=-14:TP=-1.5:LRA=11,apad", "-t", str(DUREE),
              "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(sortie))
    print(f"{sortie} : {DUREE} s, {sortie.stat().st_size // 1024} Ko")
