#!/usr/bin/env python3
"""La newsletter CiviCap en un bloc HTML, à coller dans Beefree.

    python3 tools/beefree-civicap.py

  travaux/newsletter-civicap/email.html → travaux/newsletter-civicap/beefree/bloc-html.txt
                                         et le même code dans beefree/index.html (bouton « Copier »)

L'import HTML de Beefree reconstruit l'e-mail en blocs et casse sa mise en page (cartes
emboîtées perdues, pastilles éclatées). Le bloc « HTML » de Beefree, lui, garde le code tel
quel : on colle l'e-mail entier dans un seul bloc, le rendu est celui de l'original.

Ce qui change par rapport à email.html : seul le corps est gardé (Beefree fournit l'en-tête
et la page) ; le conteneur devient fluide (600 px au plus, il suit la largeur réglée dans
Beefree) ; les images passent en adresses absolues, vers leurs copies publiques du dépôt
GitHub, figées sur le dernier commit qui les a modifiées ; les classes du réglage mobile
prennent le préfixe « cc- » (Beefree utilise lui-même une classe « pad » : la nôtre aurait
élargi ses marges) ; le fond VML d'Outlook, les commentaires et le texte d'aperçu caché
sont retirés (l'aperçu se règle dans Brevo).
"""
import html as H
import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
NL = RACINE / "travaux" / "newsletter-civicap"
SOURCE = NL / "email.html"
CODE = NL / "beefree" / "bloc-html.txt"
PAGE = NL / "beefree" / "index.html"
DEPOT = "https://raw.githubusercontent.com/Drabczynski/onlineformapro-website"
IMAGES = ["logo-civicap.png", "img"]
CLASSES = ["hero", "ph", "pad", "h1", "h2", "bt", "chiffre", "puce", "lib", "txt", "serif"]
POLICES = ("https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700"
           "&family=Instrument+Serif:ital@1&family=Inter:wght@400;500;600;700&display=swap")


def git(*args):
    return subprocess.run(["git", *args], cwd=RACINE, capture_output=True, text=True,
                          check=True).stdout.strip()


def commit_des_images():
    chemins = [str((NL / i).relative_to(RACINE)) for i in IMAGES]
    if git("status", "--porcelain", "--", *chemins):
        sys.exit("Images modifiées et pas encore committées : committer et pousser d'abord, "
                 "sinon le code pointerait vers les anciennes.")
    sha = git("log", "-1", "--format=%H", "--", *chemins)
    if not git("branch", "-r", "--contains", sha):
        print(f"Attention : le commit {sha[:7]} n'est pas encore sur GitHub, les images "
              "ne s'afficheront qu'après le push.")
    return sha


def bloc(source, base):
    # le réglage mobile de l'original, classes préfixées
    mobile = re.search(r"@media[^{]*\{(.*?)\n  \}", source, re.S).group(1)
    mobile = "\n".join(l for l in mobile.splitlines() if l.strip() and ".conteneur" not in l)
    # le corps : le conteneur de 600 px et tout ce qu'il porte
    debut = source.index('<table role="presentation" class="conteneur"')
    fin = source.index("\n</table>\n\n</td></tr>\n</table>\n</body>") + len("\n</table>")
    corps = source[debut:fin]
    corps = re.sub(r"[ \t]*<!--.*?-->\n?", "", corps, flags=re.S)
    corps = re.sub(r"\n    <div>\n|\n    </div>\n", "\n", corps)     # l'enveloppe du VML
    corps = corps.replace('class="conteneur" width="600" cellpadding="0" cellspacing="0" border="0" '
                          'style="width:600px;max-width:600px;"',
                          'width="100%" cellpadding="0" cellspacing="0" border="0" '
                          'style="width:100%;max-width:600px;margin:0 auto;"')
    corps = corps.replace(' class=""', "")
    for c in CLASSES:
        corps = corps.replace(f'class="{c}"', f'class="cc-{c}"')
        mobile = mobile.replace(f".{c}{{", f".cc-{c}{{")
    # l'en-tête de l'original retirait le soulignement des liens ; ici, chaque lien le porte
    corps = re.sub(r'(<a [^>]*style=")(?![^"]*text-decoration)', r"\1text-decoration:none;", corps)
    relatif = r"(?!https?:|data:|mailto:|#|\[)"
    corps = re.sub(rf'\b(src|background)="{relatif}([^"]+)"', rf'\1="{base}\2"', corps)
    corps = re.sub(rf"url\('{relatif}([^']+)'\)", rf"url('{base}\1')", corps)
    style = (f"<style>\n  @import url('{POLICES}');\n"
             f"  @media only screen and (max-width:620px){{\n{mobile}\n  }}\n</style>\n")
    return (style
            + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
              'bgcolor="#F3F1F8" style="background:#F3F1F8;">\n'
              '<tr><td align="center" style="padding:24px 10px 30px;">\n'
            + corps + "\n</td></tr>\n</table>\n")


def verifie(code):
    for attr in re.findall(r'\b(?:src|background)="([^"]+)"', code):
        assert attr.startswith("https://"), f"chemin relatif : {attr}"
    assert "<!--" not in code and "mso" not in code and "conteneur" not in code
    assert not re.search(r'class="(?!cc-)', code), "classe sans préfixe"
    assert code.count("<table") == code.count("</table>"), "tableaux mal fermés"
    for lien in re.findall(r"<a [^>]*>", code):
        assert "text-decoration" in lien, f"lien souligné par défaut : {lien[:60]}"


if __name__ == "__main__":
    sha = commit_des_images()
    code = bloc(SOURCE.read_text(encoding="utf-8"), f"{DEPOT}/{sha}/{NL.relative_to(RACINE)}/")
    verifie(code)
    CODE.write_text(code, encoding="utf-8")
    page = PAGE.read_text(encoding="utf-8")
    page, n = re.subn(r'(<textarea id="code"[^>]*>).*?(</textarea>)',
                      lambda m: m.group(1) + H.escape(code, quote=False) + m.group(2), page, flags=re.S)
    assert n == 1, "zone de code introuvable dans la page"
    PAGE.write_text(page, encoding="utf-8")
    print(f"{CODE.name} : {len(code) // 1024} Ko, images du commit {sha[:7]} ; page mise à jour")
