#!/usr/bin/env python3
"""Fabrique les visuels de la newsletter CiviCap.

Chaque visuel est une petite page HTML/CSS rendue par Chromium : PNG en double densité
pour les fragments d'interface, JPEG pour les fonds. Les messageries n'affichent ni SVG
ni dégradés de façon fiable : tout ce qui fait le style « vitrine » est cuit dans
l'image, le texte de l'e-mail reste du HTML.

Langage visuel : un cadre en dégradé jaune-pêche vers lilas-violet, quadrillé de blanc,
autour de cartes blanches ; les fragments d'interface sont posés dans des cadres de verre
dépoli, avec quelques étiquettes manuscrites.

Contenu : ce qu'annonce la page « organismes » de CiviCap — les trois modes d'entraînement
(entraînement libre de 15, 25 ou 40 questions, examen blanc chronométré avec drapeau
« à revoir », révision par thème avec cartes mémoire) et le suivi des stagiaires par le
formateur (scores, thèmes faibles, tests passés). La question du 14 juillet, sa bonne
réponse et son explication viennent de la démonstration de civicap.app (explication
traduite de la version arabe, la seule présente dans la copie du site transmise). Le suivi
porte la mention « Exemple » : aucune personne, aucun résultat réel.

Polices : Inter et Caveat (étiquettes manuscrites), téléchargées depuis Google Fonts au
premier lancement (curl), mises en cache, puis intégrées en base64. Régénérer demande donc
un accès réseau la première fois.
"""
import base64, json, pathlib, re, subprocess, tempfile, textwrap

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / "travaux" / "newsletter-civicap" / "img"
CACHE = pathlib.Path(tempfile.gettempdir()) / "civicap-polices"
PHOTOS = RACINE / "travaux" / "newsletter-civicap" / "photos"   # Unsplash, voir README
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


def photo(nom):
    """Une photo du dossier photos/, en URI de données pour la page de rendu."""
    return "data:image/jpeg;base64," + base64.b64encode((PHOTOS / nom).read_bytes()).decode()

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
.main{position:absolute;display:flex;align-items:center;gap:6px;padding:5px 12px 6px 10px;border-radius:999px;white-space:nowrap;
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
    """La démonstration de CiviCap : une pile de questions dans un cadre de verre.

    Fond blanc : le visuel se pose dans la carte blanche du bandeau et s'y fond par le bas.
    Les questions 8 et 9 dépassent derrière la question 7 : il y en a d'autres à suivre.
    """
    w, h = 488, 360
    css = """
.halo{position:absolute;left:30px;right:30px;top:70px;bottom:-40px;filter:blur(26px);
  background:radial-gradient(60% 70% at 15% 70%,rgba(255,170,110,.75),transparent 70%),
             radial-gradient(60% 70% at 85% 25%,rgba(167,139,250,.85),transparent 70%),
             radial-gradient(50% 50% at 55% 55%,rgba(196,181,253,.6),transparent 70%)}
.verre{left:24px;top:30px;width:440px;height:400px;padding-top:40px}
.fantome{position:absolute;height:60px;border-radius:15px;border:1px solid rgba(76,52,140,.10);
  font-size:8.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#A39DB5;padding:4px 14px}
.f2{left:41px;right:41px;top:10px;background:#EFEAFB}
.f1{left:25px;right:25px;top:24px;background:#F8F6FE;box-shadow:0 -6px 16px -10px rgba(46,16,101,.18)}
.fen{position:relative;box-shadow:0 -8px 20px -12px rgba(46,16,101,.22)}
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
.fondu{position:absolute;left:0;right:0;bottom:0;height:100px;background:linear-gradient(rgba(255,255,255,0),#fff 88%)}
"""
    corps = f"""
<div class="halo"></div>
<div class="verre">
  <div class="fantome f2">Question 9</div>
  <div class="fantome f1">Question 8</div>
  <div class="fen">
  <div class="barre"><span style="color:#6D28D9">{glyphe("Histoire", 13, 6)}</span><b>Entraînement libre</b>
    <span class="pas">›</span><span class="pas">Histoire, géographie, culture</span>
    <span class="num">7 / 15<span class="prog"><i></i></span></span></div>
  <div class="corps">
    <div class="eti">Question 7</div>
    <div class="question">Que commémore la fête nationale du&nbsp;14&nbsp;juillet&nbsp;?</div>
    <div class="rep"><span class="ok">{COCHE.format(s=10)}</span>La prise de la Bastille (1789)</div>
    <div class="sep"></div>
    <div class="eti">Explication</div>
    <div class="ex">{EXPLICATION}</div>
  </div>
  </div>
</div>
<div class="main" style="right:6px;top:16px;transform:rotate(3deg)"><i>✦</i>une explication à chaque réponse</div>
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


def pilotage():
    """Le suivi des stagiaires côté formateur, sur un exemple, dans un cadre de verre.

    La page « organismes » de CiviCap annonce ce suivi : scores, thèmes faibles, tests passés.
    Initiales seulement, noms en barres grises, mention « Exemple » : aucune personne, aucun
    résultat réel.
    """
    w, h = 528, 336
    css = """
.fond{position:absolute;inset:0;border-radius:24px;overflow:hidden;background:""" + DEGRADE + """}
.fond::after{content:"";position:absolute;inset:0;""" + GRILLE + """;
  -webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 50%,transparent 35%,#000 85%)}
.verre{left:26px;top:34px;width:476px;height:290px}
.tab{padding:13px 16px 6px}
.titre{font-size:12.5px;font-weight:650;letter-spacing:-.01em}
.titre-l{display:flex;align-items:center;gap:9px}
.grille{display:grid;grid-template-columns:92px 54px 1fr 34px 92px;column-gap:12px;align-items:center}
.th{margin-top:11px;padding-bottom:6px;font-size:8.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#9A94A8}
.tr{padding:7px 0;border-top:1px solid #F0EDF6}
.qui{display:flex;align-items:center;gap:8px}
.av{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700}
.score{font-size:12px;font-weight:650;font-variant-numeric:tabular-nums}
.score span{color:#9A94A8;font-weight:500}
.faible{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:#4B4658;white-space:nowrap}
.faible svg{flex:none;color:#B45309}
.vide{font-size:11px;color:#C9C4D6}
.nb{font-size:11.5px;font-weight:500;color:#4B4658;font-variant-numeric:tabular-nums}
.st{justify-self:start;font-size:9.5px;font-weight:600;border-radius:999px;padding:4px 9px;white-space:nowrap}
.s-ok{background:#EAF8EF;color:#166534}.s-cours{background:#F1EBFF;color:#5B21B6}.s-aide{background:#FFF4D6;color:#92400E}
.toast{right:14px;top:14px;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 9px;border-radius:999px;font-size:11.5px;font-weight:600}
.toast .ok{width:16px;height:16px}
"""
    gens = [("AM", 36, None, 9, "ok", "Prêt", "#EDE7FF", "#5B21B6"),
            ("KD", 33, None, 7, "ok", "Prêt", "#DCFCE7", "#166534"),
            ("SB", 29, "Histoire", 6, "cours", "En progrès", "#FCE7F3", "#9D174D"),
            ("YN", 27, "Institutions", 5, "cours", "En progrès", "#E0F2FE", "#075985"),
            ("LT", 22, "Histoire", 3, "aide", "À accompagner", "#FEF3C7", "#92400E")]
    lignes = "".join(
        f'<div class="grille tr"><div class="qui"><span class="av" style="background:{fond};color:{encre}">{ini}</span>'
        f'<div class="sk" style="width:{50 - 4 * k}px;height:7px"></div></div>'
        f'<div class="score">{s}<span>/40</span></div>'
        + (f'<div class="faible">{glyphe(th, 12, 6)}{th}</div>' if th else '<div class="vide">—</div>')
        + f'<div class="nb">{n}</div><span class="st s-{c}">{lib}</span></div>'
        for k, (ini, s, th, n, c, lib, fond, encre) in enumerate(gens))
    corps = f"""
<div class="fond"></div>
<div class="verre"><div class="fen tab">
  <div class="titre-l"><span class="titre">Mes stagiaires</span><span class="tag">Exemple</span></div>
  <div class="grille th"><span>Stagiaire</span><span>Score</span><span>Thème faible</span><span>Tests</span><span>Statut</span></div>
  {lignes}
</div></div>
<div class="carte toast"><span class="ok">{COCHE.format(s=9)}</span>2 prêts pour l’examen</div>
<div class="main" style="left:14px;top:12px;transform:rotate(-3deg)"><i>✦</i>vue formateur</div>
"""
    return w, h, css, corps



def entrainement():
    """L'entraînement libre : 15, 25 ou 40 questions tirées au hasard parmi les 835 officielles."""
    w, h = 528, 210
    css = """
.pan{left:40px;width:304px;top:24px;height:230px;padding:14px 16px}
.t{font-size:12px;font-weight:650}
.choix{margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.choix span{display:grid;place-items:center;height:50px;border-radius:12px;border:1px solid #E9E5F2;
  font-size:21px;font-weight:650;letter-spacing:-.03em;color:#3D3850}
.choix .on{border-color:#7C3AED;background:#FAF7FF;color:#6D28D9;box-shadow:0 0 0 3px rgba(124,58,237,.12)}
.note{margin-top:10px;display:flex;align-items:center;gap:6px;font-size:10px;color:#57516B}
.note svg{flex:none}
.go{margin-top:11px;padding:9px;border-radius:999px;background:#0F0A1A;color:#fff;text-align:center;font-size:11.5px;font-weight:600}
"""
    hasard = ('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2" '
              'stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.2c2 0 3.2.9 4.2 2.7l2.6 4.6c1 1.8 '
              '2.2 2.7 4.2 2.7H21"/><path d="M3 17h3.2c1.3 0 2.3-.4 3.1-1.2M14.6 8.2c.8-.8 1.8-1.2 3-1.2H21"/>'
              '<path d="m18 4 3 3-3 3M18 14l3 3-3 3"/></svg>')
    corps = f"""
<div class="fond-carte">
  <div class="panneau pan"><div class="t">Nouvel entraînement</div>
    <div class="eti" style="margin-top:11px">Nombre de questions</div>
    <div class="choix"><span>15</span><span class="on">25</span><span>40</span></div>
    <div class="note">{hasard}Tirées au hasard parmi les 835 questions officielles</div>
    <div class="go">Commencer</div></div>
  <div class="main" style="left:372px;top:62px;transform:rotate(-4deg)"><i>✦</i>à la carte</div>
</div>
"""
    return w, h, css, corps


def revision():
    """La révision par thème : des cartes mémoire, revues au rythme de la répétition espacée."""
    w, h = 528, 220
    css = """
.fiche{position:absolute;border-radius:16px;background:#fff;border:1px solid rgba(76,52,140,.10)}
.f3{left:76px;width:248px;top:20px;height:50px;background:#EFEAFB}
.f2{left:62px;width:276px;top:31px;height:50px;background:#F8F6FE;box-shadow:0 -6px 16px -10px rgba(46,16,101,.18)}
.f1{left:48px;width:304px;top:43px;height:158px;padding:14px 16px;
  box-shadow:0 0 0 5px rgba(255,255,255,.6),0 22px 44px -16px rgba(46,16,101,.28)}
.etq{display:inline-flex;align-items:center;gap:5px;padding:4px 9px 4px 6px;border-radius:999px;background:#F3EEFF;
  color:#6D28D9;font-size:10px;font-weight:600}
.titre{margin-top:10px;font-size:19px;font-weight:650;letter-spacing:-.025em}
.f1 .sk{margin-top:8px;height:7px}
.pied{position:absolute;left:16px;right:16px;bottom:13px;display:flex;align-items:center;justify-content:space-between}
.puce{padding:5px 9px;border-radius:999px;background:#F1EBFF;color:#5B21B6;font-size:10px;font-weight:600}
"""
    corps = f"""
<div class="fond-carte" style="background:radial-gradient(70% 95% at 0% 0%,rgba(185,163,255,.48),transparent 62%),radial-gradient(60% 95% at 100% 100%,rgba(255,180,92,.30),transparent 60%),#F7F5FC">
  <div class="fiche f3"></div><div class="fiche f2"></div>
  <div class="fiche f1">
    <span class="etq">{glyphe("Valeurs", 11, 6)}Principes et valeurs</span>
    <div class="titre">La laïcité</div>
    <div class="sk" style="width:92%"></div><div class="sk" style="width:76%"></div><div class="sk" style="width:58%"></div>
    <div class="pied"><span class="eti">Carte mémoire</span><span class="puce">À revoir dans 3 jours</span></div>
  </div>
  <div class="main" style="left:376px;top:74px;transform:rotate(-4deg)"><i>✦</i>au bon moment</div>
</div>
"""
    return w, h, css, corps


def entete_photo():
    """L'en-tête du bloc blanc : une formatrice montre son ordinateur à une personne en formation.

    La photo (Unsplash) n'existe ici qu'en 400 px de large : elle est montrée à sa taille,
    jamais agrandie au-delà, et les éléments d'interface qui l'entourent restent nets.
    La carte « Entraînement libre » se pose sur le dos de l'ordinateur : elle donne ce que
    voit l'apprenant et couvre la marque de l'appareil.
    """
    w, h = 528, 316
    css = """
.fond{position:absolute;inset:0;border-radius:24px;overflow:hidden;background:""" + DEGRADE + """}
.fond::after{content:"";position:absolute;inset:0;""" + GRILLE + """;
  -webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,transparent 35%,#000 85%)}
.ph{position:absolute;left:64px;top:28px;width:400px;height:260px;border-radius:20px;
  background:url(""" + photo("formatrice-ordinateur.jpg") + """) center/cover no-repeat;
  box-shadow:0 0 0 7px rgba(255,255,255,.55),0 30px 60px -22px rgba(46,16,101,.45)}
.mini{left:300px;top:160px;width:198px;padding:11px 13px 12px}
.mini .h{display:flex;align-items:center;justify-content:space-between;font-size:10px;font-weight:600;color:#3D3850}
.mini .h span{color:#8A8499;font-weight:500}
.mini .prog{margin-top:8px;height:5px;border-radius:9px;background:#EFECF6;overflow:hidden}
.mini .prog i{display:block;width:46%;height:100%;background:#7C3AED;border-radius:9px}
"""
    corps = """
<div class="fond"></div>
<div class="ph"></div>
<div class="carte mini"><div class="h">Entraînement libre<span>7 / 15</span></div><div class="prog"><i></i></div></div>
<div class="main" style="left:20px;top:22px;transform:rotate(-3deg)"><i>✦</i>à son rythme</div>
"""
    return w, h, css, corps, {"jpeg": 86, "echelle": 2}


def coche_badge():
    """La coche du badge de tête, en image : alignée au pixel dans toutes les messageries."""
    w, h = 18, 18
    css = ".r{position:absolute;inset:0;border-radius:50%;background:#6D28D9;display:grid;place-items:center}"
    return w, h, css, f'<div class="r">{COCHE.format(s=10)}</div>'


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    polices = polices_css()
    pieces = {"fond-hero": fond_hero(), "hero": hero(), "coche": coche_badge(),
              "entete-photo": entete_photo(), "entrainement": entrainement(), "examen": examen(),
              "revision": revision(), "pilotage": pilotage(), "fond-cta": fond_cta()}
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
