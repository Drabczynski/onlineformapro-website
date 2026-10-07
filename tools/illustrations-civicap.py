#!/usr/bin/env python3
"""Fabrique les visuels de la newsletter CiviCap.

Chaque visuel est une petite page HTML/CSS rendue par Chromium : PNG en double densité
pour les fragments d'interface, JPEG pour les fonds. Les messageries n'affichent ni SVG
ni dégradés de façon fiable : tout ce qui fait le style « vitrine » est cuit dans
l'image, le texte de l'e-mail reste du HTML.

Langage visuel : un cadre en dégradé jaune-pêche vers lilas-violet, quadrillé de blanc,
autour de cartes blanches ; les fragments d'interface sont posés dans des cadres de verre
dépoli, avec quelques étiquettes manuscrites et des tuiles de thème qui débordent.

Contenu : ce que CiviCap montre sur son propre site — la question de démonstration du
14 juillet, sa bonne réponse et son explication (traduite de la version arabe, la seule
présente dans la copie du site transmise), les niveaux A2/B1/B2, le mode « Entraînement
libre », le chrono et le drapeau « à revoir » de l'examen blanc, le bilan par thème, la
jauge de préparation. Le suivi de groupe côté formateur n'est pas décrit sur le site :
il illustre la rubrique demandée pour l'offre organisme. Le bilan, la jauge et le suivi
portent la mention « Exemple » : aucune personne, aucun résultat réel.

Polices : Inter et Caveat (étiquettes manuscrites), téléchargées depuis Google Fonts au
premier lancement (curl), mises en cache, puis intégrées en base64. Régénérer demande donc
un accès réseau la première fois.
"""
import base64, json, pathlib, re, subprocess, tempfile, textwrap

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / "travaux" / "newsletter-civicap" / "img"
CACHE = pathlib.Path(tempfile.gettempdir()) / "civicap-polices"
PLAYWRIGHT = "/opt/node22/lib/node_modules/playwright/index.js"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"

POLICES = {  # fichier en cache : (famille Google Fonts, sous-ensemble, nom CSS, graisses)
    "inter-latin.woff2": ("Inter:wght@400..800", "latin", "Inter", "400 800"),
    "caveat-latin.woff2": ("Caveat:wght@500..700", "latin", "Caveat", "500 700"),
}

# L'explication de la démonstration de civicap.app, traduite de sa version arabe : la copie
# du site transmise ne donnait pas la version française. À remplacer par le texte français exact de CiviCap.
EXPLICATION = ("Le 14 juillet est la fête nationale française. Il commémore la prise de la Bastille "
               "en 1789, symbole de la fin de la monarchie absolue, ainsi que la fête de la "
               "Fédération de 1790. On y célèbre les valeurs de la République : liberté, égalité, "
               "fraternité.")



def polices_css():
    CACHE.mkdir(parents=True, exist_ok=True)
    css = []
    for fichier, (famille, sous, nom, graisses) in POLICES.items():
        cible = CACHE / fichier
        if not cible.exists():
            feuille = subprocess.run(["curl", "-sS", "-A", UA,
                                      f"https://fonts.googleapis.com/css2?family={famille}&display=swap"],
                                     check=True, capture_output=True, text=True).stdout
            url = re.search(r"/\* " + sous + r" \*/\s*@font-face\s*\{[^}]*?src:\s*url\(([^)]+)\)",
                            feuille, re.S).group(1)
            subprocess.run(["curl", "-sS", url, "-o", str(cible)], check=True)
        b64 = base64.b64encode(cible.read_bytes()).decode()
        css.append(f"@font-face{{font-family:'{nom}';font-weight:{graisses};"
                   f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
    return "".join(css)


COCHE = ('<svg width="{s}" height="{s}" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3 4.9 8.6 9.6 3.6" '
         'stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>')

# le dégradé de marque : jaune-pêche à gauche, lilas-violet à droite
DEGRADE = """radial-gradient(75% 60% at 0% 0%,#FFB45C 0%,rgba(255,180,92,0) 70%),
   radial-gradient(65% 55% at 100% 0%,#B9A3FF 0%,rgba(185,163,255,0) 72%),
   radial-gradient(85% 65% at 100% 100%,#8E72F6 0%,rgba(142,114,246,0) 72%),
   radial-gradient(75% 60% at 0% 100%,#FF9E80 0%,rgba(255,158,128,0) 72%),
   linear-gradient(180deg,#FFE9DA 0%,#F2EAFF 55%,#E3D7FF 100%)"""
# une version adoucie, pour l'intérieur des cartes claires
DEGRADE_DOUX = """radial-gradient(70% 95% at 100% 0%,rgba(185,163,255,.48),transparent 62%),
   radial-gradient(60% 95% at 0% 100%,rgba(255,180,92,.32),transparent 60%),#F7F5FC"""
GRILLE = """background-image:linear-gradient(rgba(255,255,255,.42) 1px,transparent 1px),
   linear-gradient(90deg,rgba(255,255,255,.42) 1px,transparent 1px);background-size:32px 32px"""

BASE = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;color:#0F0A1A}
#scene{position:relative;background:#fff;overflow:hidden}
.carte{position:absolute;background:#fff;border-radius:16px;border:1px solid rgba(76,52,140,.10);
  box-shadow:0 0 0 5px rgba(255,255,255,.55),0 26px 50px -18px rgba(46,16,101,.32),0 6px 14px -6px rgba(46,16,101,.12)}
.eti{font-size:9.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#8A8499}
.ok{flex:none;width:18px;height:18px;border-radius:50%;background:#16A34A;display:grid;place-items:center}
.seg{display:flex;gap:2px;padding:2px;border-radius:9px;background:#F3F1F8}
.seg span{font-size:10.5px;font-weight:600;color:#6E6880;padding:4px 9px;border-radius:7px}
.seg .on{background:#6D28D9;color:#fff}
.ligne{display:flex;align-items:center;justify-content:space-between}
.sk{height:8px;border-radius:5px;background:#ECE9F3}
.tag{font-size:9px;font-weight:600;letter-spacing:.04em;color:#8A8499;background:#F3F1F8;border-radius:999px;padding:3px 7px}
/* cadre de verre dépoli autour d'une fenêtre d'interface */
.verre{position:absolute;padding:9px;border-radius:24px;background:rgba(255,255,255,.46);
  border:1px solid rgba(255,255,255,.9);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  box-shadow:0 34px 70px -24px rgba(60,28,130,.38),inset 0 1px 0 rgba(255,255,255,.95)}
.fen{background:#fff;border-radius:16px;border:1px solid rgba(76,52,140,.09);overflow:hidden}
/* étiquette manuscrite */
.main{position:absolute;display:flex;align-items:center;gap:6px;padding:5px 12px 6px 10px;border-radius:999px;
  background:#fff;font-family:Caveat,cursive;font-size:17px;font-weight:600;color:#3B2A63;line-height:1;
  box-shadow:0 10px 24px -10px rgba(46,16,101,.35),0 0 0 1px rgba(76,52,140,.06)}
.main i{font-style:normal;color:#7C3AED;font-family:Inter;font-size:11px}
/* tuile de thème */
.tuile{position:absolute;width:46px;height:46px;border-radius:13px;background:#fff;display:grid;place-items:center;
  box-shadow:0 14px 28px -12px rgba(46,16,101,.38),0 0 0 1px rgba(76,52,140,.07)}
.tuile svg{color:#6D28D9}
.fond-carte{position:absolute;inset:0;overflow:hidden;background:""" + DEGRADE_DOUX + """}
.panneau{position:absolute;background:#fff;border-radius:13px;border:1px solid rgba(76,52,140,.10);
  box-shadow:0 0 0 5px rgba(255,255,255,.6),0 22px 44px -16px rgba(46,16,101,.28)}
"""


GLYPHES = {  # un repère par thème du programme officiel
    "Valeurs": '<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>',
    "Institutions": '<path d="M8 25 32 11l24 14"/><path d="M14 25v22M24 25v22M40 25v22M50 25v22"/><path d="M8 52h48"/>',
    "Droits": '<path d="M32 13v33M14 20h36"/><path d="M14 20 8 33h12z"/><path d="M50 20 44 33h12z"/><path d="M22 47h20"/>',
    "Histoire": '<path d="M32 8 54 20v24L32 56 10 44V20Z"/><circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>',
    "Société": '<circle cx="32" cy="19" r="7"/><path d="M20 45c0-7 5.4-12 12-12s12 5 12 12"/><circle cx="13" cy="29" r="5.5"/><path d="M4 48c0-6 4-10 9-10"/><circle cx="51" cy="29" r="5.5"/><path d="M60 48c0-6-4-10-9-10"/>',
    "Situations": '<path d="M9 14h46v28H29L17 52v-10H9z"/><path d="M19 24h26M19 32h17"/>',
}



def glyphe(cle, taille=22, epaisseur=4.4):
    return (f'<svg width="{taille}" height="{taille}" viewBox="0 0 64 64" fill="none" stroke="currentColor" '
            f'stroke-width="{epaisseur}" stroke-linecap="round" stroke-linejoin="round">{GLYPHES[cle]}</svg>')


def fond_hero():
    """Le fond du bandeau de tête : le dégradé de marque, quadrillé, plus dense sur les bords."""
    w, h = 600, 1200
    css = """
.d{position:absolute;inset:0;background:""" + DEGRADE + """}
.g{position:absolute;inset:0;""" + GRILLE + """;
  -webkit-mask-image:radial-gradient(ellipse 62% 48% at 50% 34%,transparent 30%,#000 78%)}
"""
    return w, h, css, '<div class="d"></div><div class="g"></div>', {"jpeg": 86, "echelle": 1}


def fond_cta():
    """Le fond du bloc final : une aurore violette et jaune sur nuit, quadrillée."""
    w, h = 528, 300
    css = """
.d{position:absolute;inset:0;background:radial-gradient(70% 90% at 100% 0%,rgba(124,58,237,.75),transparent 62%),
   radial-gradient(60% 80% at 0% 100%,rgba(251,180,40,.30),transparent 62%),
   radial-gradient(50% 60% at 50% 50%,rgba(185,163,255,.12),transparent 70%),#120A24}
.g{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),
   linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:32px 32px;
   -webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,transparent 20%,#000 85%)}
"""
    return w, h, css, '<div class="d"></div><div class="g"></div>', {"jpeg": 86, "echelle": 2}


def hero():
    """La démonstration de CiviCap dans un cadre de verre, avec ses détails flottants.

    Fond blanc : le visuel se pose dans la carte blanche du bandeau et s'y fond par le bas.
    """
    w, h = 488, 340
    css = """
.halo{position:absolute;left:30px;right:30px;top:60px;bottom:-40px;filter:blur(26px);
  background:radial-gradient(60% 70% at 15% 70%,rgba(255,170,110,.75),transparent 70%),
             radial-gradient(60% 70% at 85% 25%,rgba(167,139,250,.85),transparent 70%),
             radial-gradient(50% 50% at 55% 55%,rgba(196,181,253,.6),transparent 70%)}
.verre{left:30px;top:40px;width:412px;height:360px}
.barre{display:flex;align-items:center;gap:7px;padding:11px 14px;border-bottom:1px solid #F0EDF6;font-size:10.5px;white-space:nowrap}
.barre .pas{color:#8A8499}
.barre b{font-weight:600;color:#3D3850}
.prog{width:54px;height:4px;border-radius:9px;background:#EFECF6;overflow:hidden;margin-left:7px}
.prog i{display:block;width:46%;height:100%;background:#7C3AED;border-radius:9px}
.num{margin-left:auto;display:flex;align-items:center;font-variant-numeric:tabular-nums;color:#3D3850;font-weight:600}
.corps{padding:15px 17px}
.question{margin-top:6px;font-size:15px;line-height:1.3;font-weight:650;letter-spacing:-.014em}
.rep{margin-top:11px;display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:10px;
  background:#EEFBF3;border:1px solid #C6F0D5;font-size:12.5px;font-weight:600;color:#14532D}
.sep{margin:12px 0 9px;height:1px;background:#EEEBF4}
.ex{margin-top:8px;font-size:12px;line-height:1.62;color:#3D3850}
.toast{left:4px;top:22px;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 9px;border-radius:999px;
  font-size:11.5px;font-weight:600}
.toast .ok{width:16px;height:16px}
.fondu{position:absolute;left:0;right:0;bottom:0;height:96px;background:linear-gradient(rgba(255,255,255,0),#fff 88%)}
"""
    corps = f"""
<div class="halo"></div>
<div class="verre"><div class="fen">
  <div class="barre"><span style="color:#6D28D9">{glyphe("Histoire", 13, 6)}</span><b>Entraînement libre</b>
    <span class="pas">›</span><span class="pas">Histoire, géographie, culture</span>
    <span class="num">7 / 15<span class="prog"><i></i></span></span></div>
  <div class="corps">
    <div class="eti">Question 7</div>
    <div class="question">Que commémore la fête nationale du&nbsp;14&nbsp;juillet&nbsp;?</div>
    <div class="rep"><span class="ok">{COCHE.format(s=10)}</span>La prise de la Bastille (1789)</div>
    <div class="sep"></div>
    <div class="ligne"><span class="eti">Explication</span>
      <div class="seg"><span>A2</span><span class="on">B1</span><span>B2</span></div></div>
    <div class="ex">{EXPLICATION}</div>
  </div>
</div></div>
<div class="carte toast"><span class="ok">{COCHE.format(s=9)}</span>Corrigée à l’instant</div>
<div class="main" style="right:8px;top:14px;transform:rotate(3deg)"><i>✦</i>au niveau de chacun</div>
<div class="tuile" style="left:420px;top:176px">{glyphe("Institutions")}</div>
<div class="tuile" style="left:420px;top:232px">{glyphe("Valeurs")}</div>
<div class="fondu"></div>
"""
    return w, h, css, corps


def examen():
    """L'examen blanc : écran sobre, compte à rebours, drapeau « à revoir »."""
    w, h = 528, 210
    css = """
.fen2{left:40px;right:40px;top:30px;height:230px;border-radius:14px}
.haut{display:flex;align-items:center;gap:14px;padding:13px 16px;border-bottom:1px solid #F0EDF6}
.num{font-size:11.5px;font-weight:600;color:#3D3850;white-space:nowrap}
.num b{color:#0F0A1A}
.prog{flex:1;height:5px;border-radius:9px;background:#EFECF6;overflow:hidden}
.prog i{display:block;width:30%;height:100%;border-radius:9px;background:#7C3AED}
.chrono{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:650;color:#5B21B6;
  background:#F1EBFF;border-radius:999px;padding:5px 10px 5px 8px;font-variant-numeric:tabular-nums}
.corps{padding:16px 16px 0}
.opt{display:flex;align-items:center;gap:10px;margin-top:9px;padding:9px 11px;border-radius:10px;border:1px solid #EEEBF4}
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
  <div class="panneau fen2">
    <div class="haut"><span class="num">Question <b>12</b> / 40</span><div class="prog"><i></i></div>
      <span class="chrono">{horloge}32:14</span></div>
    <div class="corps"><div class="sk" style="width:74%;height:9px"></div>
      <div class="sk" style="width:48%;height:9px;margin-top:7px"></div>{opts}</div>
  </div>
  <div class="drap">{drapeau}À revoir</div>
  <div class="main" style="left:16px;top:14px;transform:rotate(-3deg)"><i>✦</i>comme le jour J</div>
</div>
"""
    return w, h, css, corps


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
        f'<div class="row{" bas" if v < 50 else ""}">{glyphe(n, 12, 5)}'
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
<div class="fond-carte" style="background:radial-gradient(70% 95% at 0% 0%,rgba(185,163,255,.48),transparent 62%),radial-gradient(60% 95% at 100% 100%,rgba(255,180,92,.30),transparent 60%),#F7F5FC">
  <div class="panneau pan"><div class="ligne"><span class="t">Jauge de préparation</span><span class="tag">Exemple</span></div>
    {graphe}<span class="etat"><i></i>Au-dessus du seuil</span></div>
</div>
"""
    return w, h, css, corps


def pilotage():
    """Le suivi d'un groupe côté formateur, sur un exemple, dans un cadre de verre.

    Cette vue n'est pas décrite dans la copie du site CiviCap : elle illustre la rubrique
    demandée pour l'offre organisme. Initiales seulement, noms en barres grises, mention
    « Exemple » : aucune personne, aucun résultat réel.
    """
    w, h = 528, 336
    css = """
.fond{position:absolute;inset:0;border-radius:24px;overflow:hidden;background:""" + DEGRADE + """}
.fond::after{content:"";position:absolute;inset:0;""" + GRILLE + """;
  -webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 50%,transparent 35%,#000 85%)}
.verre{left:26px;top:34px;width:476px;height:290px}
.tab{padding:13px 16px 6px}
.titre{font-size:12.5px;font-weight:650;letter-spacing:-.01em}
.titre span{color:#8A8499;font-weight:500}
.titre-l{display:flex;align-items:center;gap:9px}
.grille{display:grid;grid-template-columns:112px 56px 1fr 96px;column-gap:14px;align-items:center}
.th{margin-top:11px;padding-bottom:6px;font-size:8.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#9A94A8}
.tr{padding:7px 0;border-top:1px solid #F0EDF6}
.qui{display:flex;align-items:center;gap:8px}
.av{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700}
.score{font-size:12px;font-weight:650;font-variant-numeric:tabular-nums}
.score span{color:#9A94A8;font-weight:500}
.j{position:relative;height:6px;border-radius:9px;background:#EFECF6}
.j i{position:absolute;left:0;top:0;bottom:0;border-radius:9px}
.j b{position:absolute;left:80%;top:-4px;width:2px;height:14px;border-radius:2px;background:#16A34A}
.st{justify-self:start;font-size:9.5px;font-weight:600;border-radius:999px;padding:4px 9px}
.s-ok{background:#EAF8EF;color:#166534}.s-cours{background:#F1EBFF;color:#5B21B6}.s-aide{background:#FFF4D6;color:#92400E}
.toast{right:14px;top:14px;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 9px;border-radius:999px;font-size:11.5px;font-weight:600}
.toast .ok{width:16px;height:16px}
"""
    gens = [("AM", 36, "ok", "Prêt", "#EDE7FF", "#5B21B6"),
            ("KD", 33, "ok", "Prêt", "#DCFCE7", "#166534"),
            ("SB", 29, "cours", "En progrès", "#FCE7F3", "#9D174D"),
            ("YN", 27, "cours", "En progrès", "#E0F2FE", "#075985"),
            ("LT", 22, "aide", "À accompagner", "#FEF3C7", "#92400E")]
    couleur = {"ok": "#7C3AED", "cours": "#A78BFA", "aide": "#F59E0B"}
    lignes = "".join(
        f'<div class="grille tr"><div class="qui"><span class="av" style="background:{fond};color:{encre}">{ini}</span>'
        f'<div class="sk" style="width:{56 - 4 * k}px;height:7px"></div></div>'
        f'<div class="score">{s}<span>/40</span></div>'
        f'<div class="j"><i style="width:{round(100 * s / 40)}%;background:{couleur[c]}"></i><b></b></div>'
        f'<span class="st s-{c}">{lib}</span></div>'
        for k, (ini, s, c, lib, fond, encre) in enumerate(gens))
    corps = f"""
<div class="fond"></div>
<div class="verre"><div class="fen tab">
  <div class="titre-l"><span class="titre">Groupe FLE <span>· mardi matin</span></span><span class="tag">Exemple</span></div>
  <div class="grille th"><span>Apprenant</span><span>Score</span><span>Jauge · seuil 32/40</span><span>Statut</span></div>
  {lignes}
</div></div>
<div class="carte toast"><span class="ok">{COCHE.format(s=9)}</span>2 prêts pour l’examen</div>
<div class="main" style="left:14px;top:12px;transform:rotate(-3deg)"><i>✦</i>vue formateur</div>
"""
    return w, h, css, corps


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    polices = polices_css()
    pieces = {"fond-hero": fond_hero(), "hero": hero(), "examen": examen(), "bilan": bilan(),
              "jauge": jauge(), "pilotage": pilotage(), "fond-cta": fond_cta()}
    taches = []
    with tempfile.TemporaryDirectory() as tmp:
        for nom, piece in pieces.items():
            w, h, css, corps = piece[:4]
            opts = piece[4] if len(piece) > 4 else {}
            ext = "jpg" if "jpeg" in opts else "png"
            page = pathlib.Path(tmp) / f"{nom}.html"
            page.write_text(f'<!doctype html><meta charset="utf-8"><style>{polices}{BASE}{css}</style>'
                            f'<div id="scene" style="width:{w}px;height:{h}px">{corps}</div>', encoding="utf-8")
            taches.append({"page": str(page), "sortie": str(SORTIE / f"{nom}.{ext}"), "w": w, "h": h,
                           "jpeg": opts.get("jpeg"), "echelle": opts.get("echelle", 2)})
        script = pathlib.Path(tmp) / "rendu.mjs"
        script.write_text(textwrap.dedent(f"""
            import pw from '{PLAYWRIGHT}';
            const t = JSON.parse(process.argv[2]);
            const b = await pw.chromium.launch();
            for (const x of t) {{
              const p = await b.newPage({{ viewport: {{ width: x.w, height: x.h }}, deviceScaleFactor: x.echelle }});
              await p.goto('file://' + x.page);
              await p.evaluate(() => document.fonts.ready);
              const o = {{ path: x.sortie }};
              if (x.jpeg) {{ o.type = 'jpeg'; o.quality = x.jpeg; }}
              await (await p.$('#scene')).screenshot(o);
              await p.close();
            }}
            await b.close();
        """), encoding="utf-8")
        subprocess.run(["node", str(script), json.dumps(taches)], check=True)
    for t in taches:
        p = pathlib.Path(t["sortie"])
        print(f"{p.name:13} {t['w']}×{t['h']} affiché · {p.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
