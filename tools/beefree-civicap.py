#!/usr/bin/env python3
"""La newsletter CiviCap en un bloc HTML, à coller dans Beefree.

    python3 tools/beefree-civicap.py images   # 1. le titre en image, puis committer et pousser
    python3 tools/beefree-civicap.py          # 2. le code à coller

  beefree/bloc-modele.html → beefree/bloc-html.txt, et le même code dans beefree/index.html
                             (bouton « Copier le code »)

L'import HTML de Beefree reconstruit l'e-mail en blocs et casse sa mise en page. Le bloc
« HTML » garde le code tel quel. Mais il n'a pas d'en-tête : les règles mobiles de
email.html (placées dans l'en-tête) n'y tiennent pas, et Gmail ignore une feuille de style
posée dans le corps. Le modèle est donc écrit pour s'adapter seul, sans ces règles :

- le titre du bandeau est une image (titre.png) qui suit la largeur de l'écran ;
- les deux boutons sont deux blocs en ligne : ils passent l'un sous l'autre quand la place
  manque ;
- les trois cartes chiffres sont des blocs en ligne de 180 px au plus : trois de front sur
  ordinateur, l'une sous l'autre sur téléphone ;
- les titres de section se coupent d'eux-mêmes, les marges sont réduites.

Les règles mobiles restent dans le bloc, en bonus, pour les messageries qui les lisent
(Apple Mail, iPhone) ; leurs classes portent le préfixe « cc- » (Beefree a sa propre classe
« pad »). Les images sont servies depuis le dépôt GitHub public, figées sur le dernier
commit qui les a modifiées : {{BASE}} dans le modèle.
"""
import base64, html as H, pathlib, re, subprocess, sys, tempfile, textwrap

RACINE = pathlib.Path(__file__).resolve().parent.parent
NL = RACINE / "travaux" / "newsletter-civicap"
MODELE = NL / "beefree" / "bloc-modele.html"
CODE = NL / "beefree" / "bloc-html.txt"
PAGE = NL / "beefree" / "index.html"
IMG = NL / "beefree" / "img"
DEPOT = "https://raw.githubusercontent.com/Drabczynski/onlineformapro-website"
IMAGES = ["logo-civicap.png", "img", "beefree/img"]
PLAYWRIGHT = "/opt/node22/lib/node_modules/playwright/index.js"
CACHE = pathlib.Path(tempfile.gettempdir()) / "civicap-polices"
POLICES = {  # fichier en cache : (famille Google Fonts, nom CSS, graisses, style)
    "instrument-sans-latin.woff2": ("Instrument+Sans:wght@400..700", "Instrument Sans", "400 700", "normal"),
    "instrument-serif-italic-latin.woff2": ("Instrument+Serif:ital@1", "Instrument Serif", "400", "italic"),
}


def polices_css():
    CACHE.mkdir(parents=True, exist_ok=True)
    css = []
    for fichier, (famille, nom, graisses, style) in POLICES.items():
        cible = CACHE / fichier
        if not cible.exists():
            feuille = subprocess.run(["curl", "-sS", "-A", "Mozilla/5.0 Chrome/126.0",
                                      f"https://fonts.googleapis.com/css2?family={famille}&display=swap"],
                                     check=True, capture_output=True, text=True).stdout
            url = re.search(r"/\* latin \*/\s*@font-face\s*\{[^}]*?src:\s*url\(([^)]+)\)", feuille, re.S).group(1)
            subprocess.run(["curl", "-sS", url, "-o", str(cible)], check=True)
        b64 = base64.b64encode(cible.read_bytes()).decode()
        css.append(f"@font-face{{font-family:'{nom}';font-weight:{graisses};font-style:{style};"
                   f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
    return "".join(css)


def images():
    """Le titre du bandeau, tel que dans email.html, en PNG double densité sur blanc."""
    IMG.mkdir(parents=True, exist_ok=True)
    page = (f"<!doctype html><meta charset='utf-8'><style>{polices_css()}"
            "body{margin:0;background:#fff;-webkit-font-smoothing:antialiased}"
            "#scene{width:360px;padding:2px 0 4px;background:#fff;text-align:center}"
            "h1{margin:0;font-family:'Instrument Sans';font-size:46px;line-height:1.02;letter-spacing:-.04em;"
            "font-weight:600;color:#0F0A1A}"
            ".v{color:#6D28D9}.s{font-family:'Instrument Serif';font-style:italic;font-weight:400;"
            "font-size:1.12em;letter-spacing:-.01em}</style>"
            "<div id='scene'><h1>L’examen civique<br>est obligatoire.<br><span class='v'>Votre préparation"
            "<br>est <span class='s'>prête.</span></span></h1></div>")
    with tempfile.TemporaryDirectory() as tmp:
        fichier = pathlib.Path(tmp) / "titre.html"
        fichier.write_text(page, encoding="utf-8")
        script = pathlib.Path(tmp) / "rendu.mjs"
        script.write_text(textwrap.dedent(f"""
            import pw from '{PLAYWRIGHT}';
            const b = await pw.chromium.launch();
            const p = await b.newPage({{ viewport: {{ width: 400, height: 300 }}, deviceScaleFactor: 2 }});
            await p.goto('file://{fichier}');
            await p.evaluate(() => document.fonts.ready);
            await (await p.$('#scene')).screenshot({{ path: '{IMG / "titre.png"}' }});
            await b.close();
        """), encoding="utf-8")
        subprocess.run(["node", str(script)], check=True)
    print("beefree/img/titre.png")


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


def verifie(code, base):
    for attr in re.findall(r'\b(?:src|background)="([^"]+)"', code):
        assert attr.startswith(base), f"chemin relatif : {attr}"
        assert (NL / attr[len(base):]).exists(), f"image absente : {attr}"
    assert "{{" not in code and "<!--" not in code
    assert not re.search(r'class="(?!cc-)', code), "classe sans préfixe"
    assert code.count("<table") == code.count("</table>"), "tableaux mal fermés"
    for lien in re.findall(r"<a [^>]*>", code):
        assert "text-decoration" in lien, f"lien souligné par défaut : {lien[:60]}"


if __name__ == "__main__":
    if sys.argv[1:] == ["images"]:
        images()
        sys.exit()
    sha = commit_des_images()
    base = f"{DEPOT}/{sha}/{NL.relative_to(RACINE)}/"
    code = MODELE.read_text(encoding="utf-8").replace("{{BASE}}", base)
    verifie(code, base)
    CODE.write_text(code, encoding="utf-8")
    page = PAGE.read_text(encoding="utf-8")
    page, n = re.subn(r'(<textarea id="code"[^>]*>).*?(</textarea>)',
                      lambda m: m.group(1) + H.escape(code, quote=False) + m.group(2), page, flags=re.S)
    assert n == 1, "zone de code introuvable dans la page"
    PAGE.write_text(page, encoding="utf-8")
    print(f"{CODE.name} : {len(code) // 1024} Ko, images du commit {sha[:7]} ; page mise à jour")
