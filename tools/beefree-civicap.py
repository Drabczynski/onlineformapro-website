#!/usr/bin/env python3
"""Prépare la newsletter CiviCap pour l'importeur HTML de Beefree.

    python3 tools/beefree-civicap.py

  travaux/newsletter-civicap/email.html → travaux/newsletter-civicap/beefree/civicap-beefree.html
  logo + img/                           → travaux/newsletter-civicap/beefree/civicap-images.zip

L'importeur de Beefree garde les adresses d'images telles quelles : un chemin relatif
(« img/hero.png ») arrive en bloc image vide. Les images passent donc en adresses absolues,
vers les copies publiques du dépôt GitHub, figées sur le dernier commit qui les a modifiées
(une image régénérée ne change pas un e-mail déjà monté).

Le reste ne sert qu'à Outlook ou à l'envoi direct, et Beefree régénère le sien : le fond VML
du bandeau, les blocs conditionnels mso, le texte d'aperçu caché (il se règle dans l'outil
d'envoi, le guide le donne), les commentaires. L'importeur ne reprend pas les images de
fond : elles restent dans le code, avec leurs couleurs de repli, et le guide explique
comment les remettre.

Le ZIP porte les mêmes images, préfixées « civicap- », pour le gestionnaire de fichiers de
Beefree. Il est reproductible : mêmes images, même fichier.
"""
import pathlib
import re
import subprocess
import sys
import zipfile

RACINE = pathlib.Path(__file__).resolve().parent.parent
NL = RACINE / "travaux" / "newsletter-civicap"
SOURCE = NL / "email.html"
SORTIE = NL / "beefree"
DEPOT = "https://raw.githubusercontent.com/Drabczynski/onlineformapro-website"
IMAGES = ["logo-civicap.png", "img"]


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
    relatif = r"(?!https?:|data:|mailto:|#|\[)"
    html = re.sub(rf'\b(src|background)="{relatif}([^"]+)"', rf'\1="{base}\2"', html)
    html = re.sub(rf"url\('{relatif}([^']+)'\)", rf"url('{base}\1')", html)
    return html


def verifie(html):
    assert html.startswith("<!DOCTYPE html>"), "DOCTYPE"
    assert re.search(r"<head>.*<meta charset=\"utf-8\">.*</head>", html, re.S), "meta charset"
    assert "<body" in html and "</html>" in html, "html / body"
    for attr in re.findall(r'\b(?:src|background)="([^"]+)"', html):
        assert attr.startswith("https://"), f"chemin relatif : {attr}"
    assert "<!--" not in html and "mso" not in html, "reste Outlook"


def images():
    for i in IMAGES:
        chemin = NL / i
        yield from (sorted(chemin.iterdir()) if chemin.is_dir() else [chemin])


def zip_images(dest):
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_STORED) as z:
        for f in images():
            nom = "civicap-" + f.name.replace("logo-civicap", "logo")
            info = zipfile.ZipInfo(nom, date_time=(2026, 1, 1, 0, 0, 0))
            info.external_attr = 0o644 << 16
            z.writestr(info, f.read_bytes())
            print(f"  {nom}")


if __name__ == "__main__":
    sha = commit_des_images()
    base = f"{DEPOT}/{sha}/{NL.relative_to(RACINE)}/"
    html = pour_beefree(SOURCE.read_text(encoding="utf-8"), base)
    verifie(html)
    SORTIE.mkdir(exist_ok=True)
    (SORTIE / "civicap-beefree.html").write_text(html, encoding="utf-8")
    print(f"civicap-beefree.html : images servies depuis le commit {sha[:7]}")
    print("civicap-images.zip :")
    zip_images(SORTIE / "civicap-images.zip")
