#!/usr/bin/env python3
"""La newsletter « Les outils collaboratifs Google », pour Brevo.

    python3 tools/newsletter-google.py images   # 1. les visuels, puis committer et pousser
    python3 tools/newsletter-google.py          # 2. l'e-mail

  travaux/newsletter-google/maquette.jpg  la maquette fournie (556 px de large)
  → img/                                  les visuels recadrés dans la maquette
  → email.html                            l'e-mail, images en chemins relatifs (aperçu)
  → brevo.html                            le même, images en adresses absolues : à coller dans Brevo
  et le code de brevo.html dans index.html (bouton « Copier le code »)

Le texte de la maquette est écrit en vrai texte (titres, cartes, pastilles, boutons) : net
sur tous les écrans, lisible images bloquées. Seuls le logo Google, les icônes et la photo
du bas sont des images, recadrées dans la maquette ; leurs bords sont fondus dans la couleur
de fond de leur bloc, pour que rien ne se voie au raccord. La maquette fait 556 px de large :
l'e-mail aussi, pour que les visuels restent à leur taille.

Les images sont servies depuis le dépôt GitHub public, figées sur le dernier commit qui les
a modifiées. Le pied utilise les balises de Brevo : {{ mirror }} (version en ligne) et
{{ unsubscribe }} (désabonnement).
"""
import html as H
import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "travaux" / "newsletter-google"
DEPOT = "https://raw.githubusercontent.com/Drabczynski/onlineformapro-website"
ESSAI = "https://onlineformapro.com/formations/outils_google/demo"
CONTACT = "mailto:projet@onlineformapro.com"
FOND_HAUT, FOND_CARTE, FOND_NUIT = "#F7FAFD", "#F1F7FC", "#0D141F"

# boîtes dans la maquette (x0, y0, x1, y1), couleur de fond où fondre les bords, fondus
VISUELS = {
    "google.png": ((0, 222, 556, 535), FOND_HAUT, dict(haut=28, bas=30)),
    "compte-drive.png": ((22, 814, 142, 964), FOND_CARTE, dict(tout=10)),
    "gmail.png": ((285, 814, 405, 964), FOND_CARTE, dict(tout=10)),
    "agenda.png": ((22, 979, 142, 1130), FOND_CARTE, dict(tout=10)),
    "meet.png": ((285, 979, 405, 1130), FOND_CARTE, dict(tout=10)),
    "chat-forms.png": ((22, 1144, 142, 1297), FOND_CARTE, dict(tout=10)),
    "sheets.png": ((285, 1144, 405, 1297), FOND_CARTE, dict(tout=10)),
    "docs.png": ((22, 1311, 142, 1463), FOND_CARTE, dict(tout=10)),
    "slides.png": ((285, 1311, 405, 1463), FOND_CARTE, dict(tout=10)),
    "gemini.png": ((22, 1476, 252, 1603), FOND_CARTE, dict(tout=10)),
    "equipe.jpg": ((0, 1745, 556, 2000), FOND_NUIT, dict(haut=22, bas=80)),
}

# les cartes : visuel, titre, nombre de modules, description (textes de la maquette)
CARTES = [
    ("compte-drive.png", "Compte Google &amp; Drive", "2 modules", "Créer son compte, ranger et partager ses fichiers."),
    ("gmail.png", "Gmail", "3 modules", "Écrire, organiser sa boîte et protéger ses échanges."),
    ("agenda.png", "Agenda, Tasks &amp; Keep", "1 module", "Planifier ses journées et suivre ses tâches."),
    ("meet.png", "Google Meet", "1 module", "Organiser et rejoindre des réunions en ligne."),
    ("chat-forms.png", "Google Chat &amp; Forms", "1 module", "Échanger en équipe et créer des formulaires."),
    ("sheets.png", "Google Sheets", "3 modules", "Saisir des données, calculer et collaborer."),
    ("docs.png", "Google Docs", "2 modules", "Rédiger, structurer et enrichir ses documents."),
    ("slides.png", "Google Slides", "2 modules", "Créer, animer et partager ses présentations."),
]
GEMINI = ("gemini.png", "Gemini", "2 modules", "Formuler ses demandes, créer et vérifier les réponses.")


def images():
    from PIL import Image, ImageDraw
    maquette = Image.open(DOSSIER / "maquette.jpg").convert("RGB")
    (DOSSIER / "img").mkdir(exist_ok=True)
    for nom, (boite, couleur, f) in VISUELS.items():
        im = maquette.crop(boite)
        w, h = im.size
        masque = Image.new("L", (w, h), 255)
        d = ImageDraw.Draw(masque)
        bords = {k: f.get(k, f.get("tout", 0)) for k in ("haut", "bas", "gauche", "droite")}
        for x in range(w):
            for y in range(h):
                a = 1.0
                for dist, n in ((y, bords["haut"]), (h - 1 - y, bords["bas"]),
                                (x, bords["gauche"]), (w - 1 - x, bords["droite"])):
                    if n:
                        a = min(a, dist / n)
                if a < 1:
                    d.point((x, y), int(255 * max(0, a) ** 1.4))
        fond = Image.new("RGB", (w, h), couleur)
        fond.paste(im, (0, 0), masque)
        if nom.endswith(".jpg"):
            fond.save(DOSSIER / "img" / nom, quality=90, optimize=True)
        else:
            fond.save(DOSSIER / "img" / nom, optimize=True)
        print(f"  img/{nom:18} {w}×{h}")


def taille(nom):
    from PIL import Image
    return Image.open(DOSSIER / "img" / nom).size


POLICE = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"


def bouton(texte, lien):
    return (f'<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" '
            f'width="100%" style="border-collapse:separate;margin:0 auto;width:100%;max-width:396px;" class="bouton"><tr>'
            f'<td align="center" bgcolor="#0C71FD" style="background:#0C71FD;border-radius:999px;'
            f'box-shadow:0 10px 24px -8px rgba(12,113,253,.55);">'
            f'<a href="{lien}" target="_blank" style="display:block;padding:17px 24px;font-family:{POLICE};'
            f'font-size:20px;line-height:24px;font-weight:700;letter-spacing:-.01em;color:#FFFFFF;'
            f'text-decoration:none;border-radius:999px;">{texte}</a></td></tr></table>')


def carte(base, visuel, titre, nb, desc, largeur_max=260, hauteur=168):
    w, h = taille(visuel)
    affiche = 112 if w < 200 else 210
    return (f'<div class="carte" style="display:inline-block;width:100%;max-width:{largeur_max}px;'
            f'vertical-align:top;font-size:14px;"><div style="padding:4px;">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
            f'bgcolor="{FOND_CARTE}" style="background:{FOND_CARTE};border-radius:18px;border-collapse:separate;'
            f'height:{hauteur}px;"><tr>'
            # la grande illustration (Gemini) rétrécit avec l'écran ; les icônes gardent leur taille
            + (f'<td width="{affiche}" valign="middle" style="width:{affiche}px;padding:0 0 0 4px;">'
               f'<img src="{base}img/{visuel}" width="{affiche}" alt="" style="display:block;width:{affiche}px;'
               f'height:auto;border:0;"></td>' if affiche < 200 else
               f'<td width="40%" valign="middle" style="width:40%;padding:0 0 0 4px;">'
               f'<img src="{base}img/{visuel}" width="{affiche}" alt="" style="display:block;width:100%;'
               f'max-width:{affiche}px;height:auto;border:0;"></td>')
            + f'<td valign="middle" align="left" style="padding:14px 12px 14px 4px;text-align:left;">'
            f'<div style="font-family:{POLICE};font-size:15px;line-height:1.22;font-weight:800;color:#0C0F2C;">{titre}</div>'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;'
            f'margin:9px 0 8px;"><tr><td bgcolor="#DDEEFE" style="background:#DDEEFE;border-radius:999px;'
            f'padding:4px 12px 5px;font-family:{POLICE};font-size:12.5px;line-height:16px;font-weight:700;'
            f'color:#2B6DB9;white-space:nowrap;">{nb}</td></tr></table>'
            f'<div style="font-family:{POLICE};font-size:12px;line-height:1.42;color:#6E7682;">{desc}</div>'
            f'</td></tr></table></div></div>')


def email(base):
    cartes = "".join(carte(base, *c) for c in CARTES)
    gemini = carte(base, *GEMINI, largeur_max=528, hauteur=130)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Nouvelles formations : les outils collaboratifs Google</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
  body{{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}}
  table{{border-collapse:collapse}}
  img{{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}}
  a{{text-decoration:none}}
  @media only screen and (max-width:575px){{
    .conteneur{{width:100%!important}}
    .h1{{font-size:44px!important}}
    .h2{{font-size:27px!important}}
    .px{{padding-left:18px!important;padding-right:18px!important}}
    .carte{{max-width:none!important}}
    .carte table{{height:auto!important}}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:#EEF3F8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EEF3F8" style="background:#EEF3F8;">
<tr><td align="center" style="padding:24px 0;">
<table role="presentation" class="conteneur" width="556" cellpadding="0" cellspacing="0" border="0" style="width:556px;max-width:556px;background:#FFFFFF;">

  <tr><td class="px" align="center" bgcolor="{FOND_HAUT}" style="background:{FOND_HAUT};padding:44px 24px 0;">
    <p style="margin:0;font-family:{POLICE};font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.01em;color:#1F6FE5;">Nouvelles formations</p>
    <h1 class="h1" style="margin:12px 0 0;font-family:{POLICE};font-size:58px;line-height:1.0;font-weight:800;letter-spacing:-.035em;color:#001A3F;">Les outils<br>collaboratifs</h1>
  </td></tr>
  <tr><td bgcolor="{FOND_HAUT}" style="background:{FOND_HAUT};font-size:0;line-height:0;">
    <img src="{base}img/google.png" width="556" alt="Google : Gmail, Drive, Docs, Sheets, Agenda, Tasks et Keep" style="display:block;width:100%;max-width:556px;height:auto;border:0;">
  </td></tr>
  <tr><td class="px" align="center" bgcolor="{FOND_HAUT}" style="background:{FOND_HAUT};padding:6px 24px 46px;">
    {bouton("Testez gratuitement", ESSAI)}
  </td></tr>

  <tr><td class="px" align="center" style="padding:46px 24px 0;">
    <h2 class="h2" style="margin:0 auto;max-width:470px;font-family:{POLICE};font-size:33px;line-height:1.14;font-weight:800;letter-spacing:-.03em;color:#0E163B;"><span style="color:#0B78FB;">17 modules</span> pour maîtriser les outils Google</h2>
    <p style="margin:12px 0 0;font-family:{POLICE};font-size:15px;line-height:1.5;color:#757982;">Un parcours pour chaque usage du quotidien.</p>
  </td></tr>
  <tr><td align="center" style="padding:22px 10px 0;font-size:0;line-height:0;">
    {cartes}
  </td></tr>
  <tr><td align="center" style="padding:0 10px 40px;font-size:0;line-height:0;">
    {gemini}
  </td></tr>

  <tr><td class="px" align="center" bgcolor="{FOND_NUIT}" style="background:{FOND_NUIT};padding:44px 24px 4px;">
    {bouton("Contactez-nous", CONTACT)}
  </td></tr>
  <tr><td bgcolor="{FOND_NUIT}" style="background:{FOND_NUIT};font-size:0;line-height:0;">
    <img src="{base}img/equipe.jpg" width="556" alt="Une équipe au travail autour d'ordinateurs, entourée des icônes Google Meet, Agenda et Drive" style="display:block;width:100%;max-width:556px;height:auto;border:0;">
  </td></tr>
  <tr><td class="px" align="center" bgcolor="{FOND_NUIT}" style="background:{FOND_NUIT};padding:10px 24px 34px;">
    <p style="margin:0;font-family:{POLICE};font-size:13px;line-height:1.6;font-weight:700;color:#C9D4E3;">Onlineformapro</p>
    <p style="margin:2px 0 0;font-family:{POLICE};font-size:12px;line-height:1.6;color:#8392A8;">+33 (0)3 84 76 52 44</p>
    <p style="margin:14px 0 0;font-family:{POLICE};font-size:12px;line-height:1.6;color:#8392A8;">
      <a href="{{{{ mirror }}}}" target="_blank" style="color:#AFC0D6;text-decoration:underline;">Voir la version en ligne</a>
      &nbsp;·&nbsp; <a href="{{{{ unsubscribe }}}}" target="_blank" style="color:#AFC0D6;text-decoration:underline;">Se désabonner</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
"""


def git(*args):
    return subprocess.run(["git", *args], cwd=RACINE, capture_output=True, text=True, check=True).stdout.strip()


def commit_des_images():
    chemin = str((DOSSIER / "img").relative_to(RACINE))
    if git("status", "--porcelain", "--", chemin):
        sys.exit("Images modifiées et pas encore committées : committer et pousser d'abord.")
    sha = git("log", "-1", "--format=%H", "--", chemin)
    if not git("branch", "-r", "--contains", sha):
        print(f"Attention : le commit {sha[:7]} n'est pas encore sur GitHub.")
    return sha


if __name__ == "__main__":
    if sys.argv[1:] == ["images"]:
        images()
        sys.exit()
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(RACINE / "tools"))
    from insecables import page as insecables
    (DOSSIER / "email.html").write_text(insecables(email("")), encoding="utf-8")
    sha = commit_des_images()
    code = insecables(email(f"{DEPOT}/{sha}/{DOSSIER.relative_to(RACINE)}/"))
    assert all(s.startswith("https://") for s in re.findall(r'src="([^"]+)"', code))
    (DOSSIER / "brevo.html").write_text(code, encoding="utf-8")
    index = DOSSIER / "index.html"
    if index.exists():
        t, n = re.subn(r'(<textarea id="code"[^>]*>).*?(</textarea>)',
                       lambda m: m.group(1) + H.escape(code, quote=False) + m.group(2),
                       index.read_text(encoding="utf-8"), flags=re.S)
        assert n == 1
        index.write_text(t, encoding="utf-8")
    print(f"email.html et brevo.html ({len(code) // 1024} Ko), images du commit {sha[:7]}")
