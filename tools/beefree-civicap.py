#!/usr/bin/env python3
"""Prépare la newsletter CiviCap pour l'import HTML de Beefree : un fichier, rien à refaire.

    python3 tools/beefree-civicap.py

  travaux/newsletter-civicap/email.html → travaux/newsletter-civicap/beefree/civicap-beefree.html

Beefree garde les adresses d'images telles quelles : un chemin relatif (« img/hero.png »)
arriverait en bloc image vide. Les images passent donc en adresses absolues, vers leurs
copies publiques du dépôt GitHub, figées sur le dernier commit qui les a modifiées.

Beefree n'importe pas les images de fond : les deux fonds (le dégradé du bandeau, l'aurore
du bloc final) deviennent des couleurs unies, la teinte médiane de chaque image. Ce qu'on
voit en ouvrant le fichier est ce qu'on obtient dans Beefree, sans retouche.

Le reste ne sert qu'à Outlook ou à l'envoi direct, et Beefree génère le sien : le fond VML,
les blocs conditionnels mso, le texte d'aperçu caché, les commentaires.
"""
import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
NL = RACINE / "travaux" / "newsletter-civicap"
SOURCE = NL / "email.html"
SORTIE = NL / "beefree" / "civicap-beefree.html"
DEPOT = "https://raw.githubusercontent.com/Drabczynski/onlineformapro-website"
IMAGES = ["logo-civicap.png", "img"]
# couleur de repli de l'original → teinte médiane de l'image de fond qu'elle remplace
FONDS = {"#F1E6F8": "#F2DBF3",   # fond-hero.jpg
         "#120A24": "#1A1028"}   # fond-cta.jpg


def git(*args):
    return subprocess.run(["git", *args], cwd=RACINE, capture_output=True, text=True,
                          check=True).stdout.strip()


def commit_des_images():
    chemins = [str((NL / i).relative_to(RACINE)) for i in IMAGES]
    if git("status", "--porcelain", "--", *chemins):
        sys.exit("Images modifiées et pas encore committées : committer et pousser d'abord, "
                 "sinon l'e-mail pointerait vers les anciennes.")
    sha = git("log", "-1", "--format=%H", "--", *chemins)
    if not git("branch", "-r", "--contains", sha):
        print(f"Attention : le commit {sha[:7]} n'est pas encore sur GitHub, les images "
              "ne s'afficheront qu'après le push.")
    return sha


def pour_beefree(html, base):
    html = re.sub(r"^\s*<!doctype html>", "<!DOCTYPE html>", html, flags=re.I)
    html = html.replace(' xmlns:v="urn:schemas-microsoft-com:vml" '
                        'xmlns:o="urn:schemas-microsoft-com:office:office"', "")
    html = re.sub(r"<!--\[if !mso\]><!-->(.*?)<!--<!\[endif\]-->", r"\1", html, flags=re.S)
    html = re.sub(r"[ \t]*<!--\[if [^\]]*mso[^\]]*\]>.*?<!\[endif\]-->\n?", "", html, flags=re.S)
    html = re.sub(r"<!-- texte d'aperçu.*?</div>\s*", "", html, flags=re.S)
    html = re.sub(r"[ \t]*<!--.*?-->\n?", "", html, flags=re.S)
    html = re.sub(r"[ \t]*/\*.*?\*/\n?", "", html, flags=re.S)
    html = re.sub(r"\n    <div>\n|\n    </div>\n", "\n", html)    # l'enveloppe du VML
    # les fonds en image deviennent des couleurs unies
    html = re.sub(r'\s+background="[^"]+"', "", html)
    html = re.sub(r"background-image:url\('[^']+'\);background-repeat:[^;]+;"
                  r"background-position:[^;]+;background-size:[^;]+;", "", html)
    for repli, teinte in FONDS.items():
        html = html.replace(repli, teinte)
    relatif = r"(?!https?:|data:|mailto:|#|\[)"
    html = re.sub(rf'\bsrc="{relatif}([^"]+)"', rf'src="{base}\1"', html)
    return html


def verifie(html):
    assert html.startswith("<!DOCTYPE html>"), "DOCTYPE"
    assert re.search(r"<head>.*<meta charset=\"utf-8\">.*</head>", html, re.S), "meta charset"
    assert "<body" in html and "</html>" in html, "html / body"
    for src in re.findall(r'\bsrc="([^"]+)"', html):
        assert src.startswith("https://"), f"chemin relatif : {src}"
    assert "background-image" not in html and 'background="' not in html, "image de fond"
    assert "<!--" not in html and "mso" not in html, "reste Outlook"


if __name__ == "__main__":
    sha = commit_des_images()
    base = f"{DEPOT}/{sha}/{NL.relative_to(RACINE)}/"
    html = pour_beefree(SOURCE.read_text(encoding="utf-8"), base)
    verifie(html)
    SORTIE.parent.mkdir(exist_ok=True)
    SORTIE.write_text(html, encoding="utf-8")
    print(f"{SORTIE.name} : images servies depuis le commit {sha[:7]}")
