#!/usr/bin/env python3
"""Fabrique les visuels de la newsletter CiviCap.

Chaque visuel est une petite page HTML/CSS rendue en PNG par Chromium, en double
densité. Les messageries n'affichent ni SVG ni dégradés CSS de façon fiable :
tout ce qui fait le style « vitrine » est cuit dans l'image, le texte de l'e-mail
reste du HTML. Les coins arrondis aussi sont cuits, sur le blanc du conteneur,
pour qu'Outlook ne les rende pas carrés.

Le contenu vient de ce que CiviCap montre sur son propre site : la question de
démonstration du 14 juillet, sa bonne réponse et son explication (traduite de la
version arabe, la seule présente dans la copie du site transmise), les niveaux A2/B1/B2, le chrono et le drapeau « à revoir » de l'examen blanc, le bilan par
thème, la jauge de préparation. Le bilan et la jauge portent la mention
« Exemple » : leurs barres et leur courbe ne sont les résultats de personne.

Police : Inter, téléchargée depuis Google Fonts au premier lancement (curl), mise
en cache, puis intégrée en base64. Régénérer demande donc
un accès réseau la première fois.
"""
import base64, json, pathlib, re, subprocess, tempfile, textwrap

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / "travaux" / "newsletter-civicap" / "img"
CACHE = pathlib.Path(tempfile.gettempdir()) / "civicap-polices"
PLAYWRIGHT = "/opt/node22/lib/node_modules/playwright/index.js"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"

POLICES = {  # fichier en cache : (famille Google Fonts, sous-ensemble)
    "inter-latin.woff2": ("Inter:wght@400..800", "latin"),
}

# L'explication de la démonstration de civicap.app, traduite de sa version arabe : la copie
# du site transmise ne donnait pas la version française. À remplacer par le texte français exact de CiviCap.
EXPLICATION = ("Le 14 juillet est la fête nationale française. Il commémore la prise de la Bastille "
               "en 1789, symbole de la fin de la monarchie absolue, ainsi que la fête de la "
               "Fédération de 1790. On y célèbre les valeurs de la République : liberté, égalité, "
               "fraternité.")


def polices_css():
    CACHE.mkdir(parents=True, exist_ok=True)
    for fichier, (famille, sous) in POLICES.items():
        cible = CACHE / fichier
        if cible.exists():
            continue
        css = subprocess.run(["curl", "-sS", "-A", UA,
                              f"https://fonts.googleapis.com/css2?family={famille}&display=swap"],
                             check=True, capture_output=True, text=True).stdout
        url = re.search(r"/\* " + sous + r" \*/\s*@font-face\s*\{[^}]*?src:\s*url\(([^)]+)\)",
                        css, re.S).group(1)
        subprocess.run(["curl", "-sS", url, "-o", str(cible)], check=True)
    b64 = lambda f: base64.b64encode((CACHE / f).read_bytes()).decode()
    return (f"@font-face{{font-family:'Inter';font-weight:400 800;"
            f"src:url(data:font/woff2;base64,{b64('inter-latin.woff2')}) format('woff2')}}")


COCHE = ('<svg width="{s}" height="{s}" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3 4.9 8.6 9.6 3.6" '
         'stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>')

BASE = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;color:#0F0A1A}
#scene{position:relative;background:#fff;overflow:hidden}
.carte{position:absolute;background:#fff;border-radius:16px;border:1px solid rgba(76,52,140,.10);
  box-shadow:0 30px 60px -18px rgba(46,16,101,.30),0 6px 16px -4px rgba(46,16,101,.10)}
.eti{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#8A8499}
.ok{flex:none;width:18px;height:18px;border-radius:50%;background:#16A34A;display:grid;place-items:center}
.seg{display:flex;gap:2px;padding:2px;border-radius:9px;background:#F3F1F8}
.seg span{font-size:10.5px;font-weight:600;color:#6E6880;padding:4px 8px;border-radius:7px}
.seg .on{background:#0F0A1A;color:#fff}
.ligne{display:flex;align-items:center;justify-content:space-between}
.sk{height:8px;border-radius:5px;background:#ECE9F3}
.tag{font-size:9px;font-weight:600;letter-spacing:.04em;color:#8A8499;background:#F3F1F8;
  border-radius:999px;padding:3px 7px}
/* le fond d'une carte de la grille : rectangulaire. L'arrondi est fait en CSS dans l'e-mail,
   pour qu'Outlook, qui l'ignore, montre une carte carrée propre et non des coins blancs. */
.fond-carte{position:absolute;inset:0;overflow:hidden;
  background:radial-gradient(70% 95% at 100% 0%,rgba(167,139,250,.32),transparent 62%),
             radial-gradient(55% 85% at 0% 100%,rgba(251,206,8,.16),transparent 60%),#F6F4FB}
.panneau{position:absolute;background:#fff;border-radius:13px;border:1px solid rgba(76,52,140,.10);
  box-shadow:0 22px 44px -16px rgba(46,16,101,.26),0 4px 12px -4px rgba(46,16,101,.08)}
"""


def hero():
    """La démonstration de CiviCap : la question, la bonne réponse, l'explication au bon niveau."""
    w, h = 528, 340
    css = """
.fond{position:absolute;inset:0;border-radius:22px;overflow:hidden;
  background:radial-gradient(55% 70% at 8% 0%,rgba(124,58,237,.34),transparent 62%),
   radial-gradient(45% 60% at 96% 6%,rgba(192,132,252,.30),transparent 60%),
   radial-gradient(55% 70% at 92% 104%,rgba(251,206,8,.34),transparent 62%),
   radial-gradient(50% 60% at 2% 100%,rgba(167,139,250,.26),transparent 60%),#F4EFFF}
.fond::after{content:"";position:absolute;inset:0;
  background-image:linear-gradient(rgba(91,33,182,.075) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(91,33,182,.075) 1px,transparent 1px);
  background-size:22px 22px;background-position:-1px -1px;
  -webkit-mask-image:radial-gradient(ellipse 70% 70% at 50% 45%,#000 25%,transparent 78%)}
.q{left:82px;top:42px;width:364px;padding:20px 20px 18px}
.question{margin-top:7px;font-size:15.5px;line-height:1.32;font-weight:650;letter-spacing:-.012em}
.rep{margin-top:12px;display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:10px;
  background:#EEFBF3;border:1px solid #C6F0D5;font-size:13px;font-weight:600;color:#14532D}
.sep{margin:14px 0 10px;height:1px;background:#EEEBF4}
.ex{margin-top:8px;font-size:12.5px;line-height:1.65;color:#3D3850;height:64px;overflow:hidden;
  -webkit-mask-image:linear-gradient(#000 50%,transparent)}
.niv{right:22px;top:248px;padding:11px 12px 12px}
.niv .seg span{font-size:11px;padding:5px 10px}
.niv .seg .on{background:#6D28D9}
.toast{left:26px;top:20px;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 9px;
  border-radius:999px;font-size:11.5px;font-weight:600}
.toast .ok{width:16px;height:16px}
"""
    corps = f"""
<div class="fond"></div>
<div class="carte q">
  <div class="eti">Question</div>
  <div class="question">Que commémore la fête nationale du&nbsp;14&nbsp;juillet&nbsp;?</div>
  <div class="rep"><span class="ok">{COCHE.format(s=10)}</span>La prise de la Bastille (1789)</div>
  <div class="sep"></div>
  <div class="eti">Explication</div>
  <div class="ex">{EXPLICATION}</div>
</div>
<div class="carte niv"><div class="eti" style="margin:0 0 7px 2px">Niveau</div>
  <div class="seg"><span>A2</span><span class="on">B1</span><span>B2</span></div></div>
<div class="carte toast"><span class="ok">{COCHE.format(s=9)}</span>Corrigée à l’instant</div>
"""
    return w, h, css, corps


def examen():
    """L'examen blanc : écran sobre, compte à rebours, drapeau « à revoir »."""
    w, h = 528, 210
    css = """
.fen{left:40px;right:40px;top:30px;height:230px;border-radius:14px}
.haut{display:flex;align-items:center;gap:14px;padding:13px 16px;border-bottom:1px solid #F0EDF6}
.num{font-size:11.5px;font-weight:600;color:#3D3850;white-space:nowrap}
.num b{color:#0F0A1A}
.prog{flex:1;height:5px;border-radius:9px;background:#EFECF6;overflow:hidden}
.prog i{display:block;width:30%;height:100%;border-radius:9px;background:#7C3AED}
.chrono{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:650;color:#5B21B6;
  background:#F1EBFF;border-radius:999px;padding:5px 10px 5px 8px;font-variant-numeric:tabular-nums}
.corps{padding:16px 16px 0}
.opt{display:flex;align-items:center;gap:10px;margin-top:9px;padding:9px 11px;border-radius:10px;
  border:1px solid #EEEBF4}
.opt .rad{flex:none;width:14px;height:14px;border-radius:50%;border:1.5px solid #CFCADB}
.opt.sel{border-color:#C4B5FD;background:#FAF7FF}
.opt.sel .rad{border:4px solid #7C3AED}
.drap{position:absolute;right:20px;top:96px;display:flex;align-items:center;gap:7px;padding:8px 13px 8px 10px;
  border-radius:999px;font-size:11.5px;font-weight:600;background:#fff;border:1px solid rgba(76,52,140,.10);
  box-shadow:0 18px 36px -12px rgba(46,16,101,.30),0 4px 10px -4px rgba(46,16,101,.10)}
"""
    horloge = ('<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="9" r="5.6" '
               'stroke="#5B21B6" stroke-width="1.7"/><path d="M8 6.4V9l1.8 1.2M6.4 1.8h3.2" stroke="#5B21B6" '
               'stroke-width="1.7" stroke-linecap="round"/></svg>')
    drapeau = ('<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3.5 14.5V2" stroke="#78350F" '
               'stroke-width="1.6" stroke-linecap="round"/><path d="M3.5 2.6h8.4l-1.9 3 1.9 3H3.5z" fill="#FBCE08" '
               'stroke="#78350F" stroke-width="1.4" stroke-linejoin="round"/></svg>')
    opts = "".join(f'<div class="opt{" sel" if i == 1 else ""}"><span class="rad"></span>'
                   f'<div class="sk" style="width:{l}%"></div></div>' for i, l in enumerate((58, 44, 66)))
    corps = f"""
<div class="fond-carte">
  <div class="panneau fen">
    <div class="haut"><span class="num">Question <b>12</b> / 40</span><div class="prog"><i></i></div>
      <span class="chrono">{horloge}32:14</span></div>
    <div class="corps"><div class="sk" style="width:74%;height:9px"></div>
      <div class="sk" style="width:48%;height:9px;margin-top:7px"></div>{opts}</div>
  </div>
  <div class="drap">{drapeau}À revoir</div>
</div>
"""
    return w, h, css, corps


GLYPHES = {  # un repère par thème du programme officiel
    "Valeurs": '<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>',
    "Institutions": '<path d="M8 25 32 11l24 14"/><path d="M14 25v22M24 25v22M40 25v22M50 25v22"/><path d="M8 52h48"/>',
    "Droits": '<path d="M32 13v33M14 20h36"/><path d="M14 20 8 33h12z"/><path d="M50 20 44 33h12z"/><path d="M22 47h20"/>',
    "Histoire": '<path d="M32 8 54 20v24L32 56 10 44V20Z"/><circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>',
    "Société": '<circle cx="32" cy="19" r="7"/><path d="M20 45c0-7 5.4-12 12-12s12 5 12 12"/><circle cx="13" cy="29" r="5.5"/><path d="M4 48c0-6 4-10 9-10"/><circle cx="51" cy="29" r="5.5"/><path d="M60 48c0-6-4-10-9-10"/>',
    "Situations": '<path d="M9 14h46v28H29L17 52v-10H9z"/><path d="M19 24h26M19 32h17"/>',
}


def bilan():
    """Le bilan par thème, sur un exemple : ce qui tient, ce qui décroche."""
    w, h = 258, 170
    css = """
.pan{left:18px;right:18px;top:16px;height:170px;padding:12px 13px}
.t{font-size:11px;font-weight:650}
.row{display:flex;align-items:center;gap:7px;margin-top:7px}
.row svg{flex:none;color:#6D28D9}
.lab{width:62px;font-size:9.5px;font-weight:500;color:#4B4658;white-space:nowrap}
.tr{flex:1;height:5px;border-radius:9px;background:#EFECF6;overflow:hidden}
.tr i{display:block;height:100%;border-radius:9px;background:#7C3AED}
.tr i.bas{background:#F59E0B}
.row.bas svg{color:#B45309}
"""
    valeurs = [("Valeurs", 88), ("Institutions", 74), ("Droits", 91), ("Histoire", 46),
               ("Société", 83), ("Situations", 67)]
    lignes = "".join(
        f'<div class="row{" bas" if v < 50 else ""}"><svg width="12" height="12" viewBox="0 0 64 64" fill="none" '
        f'stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">{GLYPHES[n]}</svg>'
        f'<span class="lab">{n}</span><div class="tr"><i class="{"bas" if v < 50 else ""}" style="width:{v}%"></i></div></div>'
        for n, v in valeurs)
    corps = f"""
<div class="fond-carte">
  <div class="panneau pan"><div class="ligne"><span class="t">Bilan par thème</span><span class="tag">Exemple</span></div>{lignes}</div>
</div>
"""
    return w, h, css, corps


def jauge():
    """La jauge de préparation, sur un exemple : quand on passe régulièrement le seuil."""
    w, h = 258, 170
    css = """
.pan{left:18px;right:18px;top:20px;height:170px;padding:12px 13px}
.t{font-size:11px;font-weight:650}
.etat{display:inline-flex;align-items:center;gap:6px;margin-top:6px;font-size:10px;font-weight:600;
  color:#166534;background:#EAF8EF;border-radius:999px;padding:4px 9px 4px 7px}
.etat i{width:6px;height:6px;border-radius:50%;background:#16A34A}
"""
    # sept examens blancs ; plus y est petit, plus le score est haut ; le seuil est à y = 34
    pts = [(10, 70), (40, 63), (70, 58), (100, 45), (130, 31), (160, 27), (190, 22)]
    trace = " ".join(f"{x},{y}" for x, y in pts)
    aire = f"M{pts[0][0]},84 L" + " L".join(f"{x},{y}" for x, y in pts) + f" L{pts[-1][0]},84 Z"
    points = "".join(f'<circle cx="{x}" cy="{y}" r="2.6" fill="#fff" stroke="#7C3AED" stroke-width="1.6"/>'
                     for x, y in pts[:-1])
    x, y = pts[-1]
    graphe = f"""<svg width="200" height="86" viewBox="0 0 200 86" style="display:block;margin-top:8px;overflow:visible">
  <defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C3AED" stop-opacity=".18"/>
    <stop offset="1" stop-color="#7C3AED" stop-opacity="0"/></linearGradient></defs>
  <path d="M0 84H200" stroke="#EEEBF4" stroke-width="1"/>
  <path d="{aire}" fill="url(#a)"/>
  <path d="M0 34H200" stroke="#16A34A" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="0" y="29" font-family="Inter" font-size="8.5" font-weight="600" fill="#166534">32/40 · seuil de réussite</text>
  <polyline points="{trace}" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  {points}<circle cx="{x}" cy="{y}" r="4.4" fill="#7C3AED" stroke="#fff" stroke-width="2"/>
</svg>"""
    corps = f"""
<div class="fond-carte" style="background:radial-gradient(70% 95% at 0% 0%,rgba(167,139,250,.30),transparent 62%),radial-gradient(55% 85% at 100% 100%,rgba(22,163,74,.10),transparent 60%),#F6F4FB">
  <div class="panneau pan"><div class="ligne"><span class="t">Jauge de préparation</span><span class="tag">Exemple</span></div>
    {graphe}<span class="etat"><i></i>Au-dessus du seuil</span></div>
</div>
"""
    return w, h, css, corps


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    polices = polices_css()
    pieces = {"hero": hero(), "examen": examen(), "bilan": bilan(), "jauge": jauge()}
    taches = []
    with tempfile.TemporaryDirectory() as tmp:
        for nom, (w, h, css, corps) in pieces.items():
            page = pathlib.Path(tmp) / f"{nom}.html"
            page.write_text(f'<!doctype html><meta charset="utf-8"><style>{polices}{BASE}{css}</style>'
                            f'<div id="scene" style="width:{w}px;height:{h}px">{corps}</div>', encoding="utf-8")
            taches.append({"page": str(page), "png": str(SORTIE / f"{nom}.png"), "w": w, "h": h})
        script = pathlib.Path(tmp) / "rendu.mjs"
        script.write_text(textwrap.dedent(f"""
            import pw from '{PLAYWRIGHT}';
            const t = JSON.parse(process.argv[2]);
            const b = await pw.chromium.launch();
            for (const x of t) {{
              const p = await b.newPage({{ viewport: {{ width: x.w, height: x.h }}, deviceScaleFactor: 2 }});
              await p.goto('file://' + x.page);
              await p.evaluate(() => document.fonts.ready);
              await (await p.$('#scene')).screenshot({{ path: x.png }});
              await p.close();
            }}
            await b.close();
        """), encoding="utf-8")
        subprocess.run(["node", str(script), json.dumps(taches)], check=True)
    for t in taches:
        p = pathlib.Path(t["png"])
        print(f"{p.name:11} {t['w']}×{t['h']} affiché · {p.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
