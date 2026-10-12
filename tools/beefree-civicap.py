#!/usr/bin/env python3
"""La newsletter CiviCap reconstruite pour l'import HTML de Beefree.

    python3 tools/beefree-civicap.py images   # 1. les visuels propres à Beefree, puis committer et pousser
    python3 tools/beefree-civicap.py          # 2. le fichier à importer

  → travaux/newsletter-civicap/beefree/img/            (pastilles, cartes des trois modes)
  → travaux/newsletter-civicap/beefree/civicap-beefree.html

L'e-mail d'origine (email.html) emboîte des cartes dans un cadre en dégradé : l'importeur de
Beefree le met en pièces (cartes perdues, pastilles éclatées, titre d'un seul style). Ce
fichier-ci est écrit comme Beefree écrit ses propres e-mails : une suite de rangées, chaque
rangée une ou plusieurs colonnes, chaque colonne une pile de blocs (image, titre,
paragraphe, bouton), et un seul style par bloc. Le titre à deux couleurs devient deux blocs
de titre ; les pastilles (« Côté stagiaire »…) deviennent de petites images ; les trois
chiffres, trois colonnes blanches. Si Beefree ignore un réglage (coins arrondis, bordures
des colonnes), le bloc reste lisible.

Les images sont servies depuis le dépôt GitHub public, figées sur le dernier commit qui les
a modifiées : c'est pourquoi les visuels se fabriquent, se committent et se poussent avant
le fichier. Les textes sont ceux de email.html.
"""
import base64, importlib.util, json, pathlib, re, subprocess, sys, tempfile, textwrap

sys.dont_write_bytecode = True
OUTILS = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(OUTILS))
from insecables import texte as insec

RACINE = OUTILS.parent
NL = RACINE / "travaux" / "newsletter-civicap"
DOSSIER = NL / "beefree"
IMG = DOSSIER / "img"
SORTIE = DOSSIER / "civicap-beefree.html"
DEPOT = "https://raw.githubusercontent.com/Drabczynski/onlineformapro-website"
IMAGES = ["logo-civicap.png", "img", "beefree/img"]
SITE = "https://civicap.fr/"

# la palette de l'e-mail
FOND, ENCRE, TEXTE, DISCRET = "#F3F1F8", "#0F0A1A", "#57516B", "#8A8499"
VIOLET, LILAS, NUIT = "#6D28D9", "#F2DBF3", "#1A1028"
SANS = "'Instrument Sans',Arial,Helvetica,sans-serif"
SERIF = "'Instrument Serif',Georgia,'Times New Roman',serif"
INTER = "Inter,Arial,Helvetica,sans-serif"


# ---------------------------------------------------------------- les visuels

def charge_illustrations():
    spec = importlib.util.spec_from_file_location("illus", OUTILS / "illustrations-civicap.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def pastille(texte, fond="#FFFFFF", sombre=False):
    """Une pastille de section, en image à sa taille (le dessin de email.html)."""
    bg, fg, point = ("#2A1D4A", "#DDD3FF", "#C4B5FD") if sombre else ("#F3EEFF", VIOLET, VIOLET)
    css = (f"#scene{{display:inline-block;background:{fond};padding:1px}}"
           f".p{{display:inline-flex;align-items:center;gap:7px;background:{bg};border-radius:999px;"
           f"padding:6px 13px 6px 11px;font:600 12px/16px Inter;color:{fg};white-space:nowrap}}"
           f".p i{{width:6px;height:6px;border-radius:6px;background:{point}}}")
    return css, f'<span class="p"><i></i>{texte}</span>'


def badge(coche):
    css = ("#scene{display:inline-block;background:#fff;padding:1px}"
           ".b{display:inline-flex;align-items:center;gap:8px;background:#F5F0FF;border:1px solid #E7DCFF;"
           "border-radius:999px;padding:5px 14px 5px 5px;font:600 12.5px/18px Inter;color:#5B21B6;white-space:nowrap}"
           ".c{width:18px;height:18px;border-radius:50%;background:#6D28D9;display:grid;place-items:center}")
    return css, f'<span class="b"><span class="c">{coche}</span>FLE · insertion · primo&#8209;arrivants</span>'


def images():
    """Pastilles rendues par Chromium ; cartes des trois modes arrondies sur fond blanc."""
    from PIL import Image, ImageDraw
    illus = charge_illustrations()
    IMG.mkdir(parents=True, exist_ok=True)
    pieces = {
        "badge": badge(illus.COCHE.format(s=10)),
        "pastille-stagiaire": pastille("Côté stagiaire"),
        "pastille-formateur": pastille("Côté formateur"),
        "pastille-telecharger": pastille("À télécharger"),
        "pastille-organisme": pastille("Pour votre organisme", fond=NUIT, sombre=True),
    }
    polices = illus.polices_css()
    with tempfile.TemporaryDirectory() as tmp:
        taches = []
        for nom, (css, corps) in pieces.items():
            page = pathlib.Path(tmp) / f"{nom}.html"
            page.write_text(f'<!doctype html><meta charset="utf-8"><style>{polices}'
                            f'*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:Inter;'
                            f'-webkit-font-smoothing:antialiased}}{css}</style><div id="scene">{corps}</div>',
                            encoding="utf-8")
            taches.append({"page": str(page), "sortie": str(IMG / f"{nom}.png")})
        script = pathlib.Path(tmp) / "rendu.mjs"
        script.write_text(textwrap.dedent(f"""
            import pw from '{illus.PLAYWRIGHT}';
            const t = JSON.parse(process.argv[2]);
            const b = await pw.chromium.launch();
            for (const x of t) {{
              const p = await b.newPage({{ viewport: {{ width: 600, height: 200 }}, deviceScaleFactor: 2 }});
              await p.goto('file://' + x.page);
              await p.evaluate(() => document.fonts.ready);
              await (await p.$('#scene')).screenshot({{ path: x.sortie }});
              await p.close();
            }}
            await b.close();
        """), encoding="utf-8")
        subprocess.run(["node", str(script), json.dumps(taches)], check=True)
    for nom in ("entrainement", "examen", "revision"):   # la carte arrondie, posée sur le blanc
        im = Image.open(NL / "img" / f"{nom}.png").convert("RGB")
        masque = Image.new("L", im.size, 0)
        ImageDraw.Draw(masque).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=48, fill=255)
        carte = Image.new("RGB", im.size, "#FFFFFF")
        carte.paste(im, (0, 0), masque)
        carte.save(IMG / f"{nom}.png", optimize=True)
    for f in sorted(IMG.iterdir()):
        w, h = Image.open(f).size
        print(f"  beefree/img/{f.name:26} {w // 2}×{h // 2} affiché")


# ---------------------------------------------------------------- les blocs, à la manière de Beefree

def taille(chemin):
    from PIL import Image
    w, h = Image.open(NL / chemin).size
    return (w // 2, h // 2) if chemin != "logo-civicap.png" else (96, 34)


def pad(t, r, b, l):
    return f"padding-top:{t}px;padding-right:{r}px;padding-bottom:{b}px;padding-left:{l}px;"


class Fichier:
    def __init__(self, base):
        self.base, self.n = base, 0

    def bloc(self, genre, td_style, contenu, table_style=""):
        self.n += 1
        return (f'<table class="{genre}_block block-{self.n}" width="100%" border="0" cellpadding="0" '
                f'cellspacing="0" role="presentation" style="{table_style}">'
                f'<tr><td class="pad" style="{td_style}">{contenu}</td></tr></table>\n')

    def image(self, chemin, alt, p=(0, 0, 0, 0), aligne="center", lien=None, largeur=None):
        w, _ = taille(chemin)
        w = largeur or w
        img = (f'<img src="{self.base}{chemin}" style="display:block;height:auto;border:0;width:100%;" '
               f'width="{w}" alt="{alt}" title="{alt}" height="auto">')
        if lien:
            img = f'<a href="{lien}" target="_blank" style="outline:none" tabindex="-1">{img}</a>'
        return self.bloc("image", pad(*p) + "width:100%;",
                         f'<div class="alignment" align="{aligne}" style="line-height:10px">'
                         f'<div style="max-width:{w}px;">{img}</div></div>')

    def titre(self, texte, taille_px, couleur=ENCRE, police=SANS, graisse=600, approche=0,
              interligne=1.08, p=(0, 0, 0, 0), aligne="center", italique=False, niveau=2):
        style = (f"margin:0;color:{couleur};direction:ltr;font-family:{police};font-size:{taille_px}px;"
                 f"font-weight:{graisse};letter-spacing:{approche}px;line-height:{interligne};"
                 f"text-align:{aligne};margin-top:0;margin-bottom:0;"
                 + ("font-style:italic;" if italique else ""))
        return self.bloc("heading", pad(*p) + f"text-align:{aligne};width:100%;",
                         f'<h{niveau} style="{style}"><span style="word-break:break-word;">'
                         f'{insec(texte)}</span></h{niveau}>')

    def paragraphe(self, html, taille_px=16, couleur=TEXTE, police=INTER, graisse=400, interligne=1.6,
                   p=(0, 0, 0, 0), aligne="center", approche=0, capitales=False):
        style = (f"color:{couleur};direction:ltr;font-family:{police};font-size:{taille_px}px;"
                 f"font-weight:{graisse};letter-spacing:{approche}px;line-height:{interligne};"
                 f"text-align:{aligne};" + ("text-transform:uppercase;" if capitales else ""))
        return self.bloc("paragraph", pad(*p),
                         f'<div style="{style}"><p style="margin:0;">{html}</p></div>',
                         "word-break:break-word;")

    def bouton(self, texte, lien, fond, couleur, bordure=None, p=(0, 0, 0, 0)):
        trait = f"1px solid {bordure}" if bordure else "0px solid transparent"
        style = (f"background-color:{fond};border-bottom:{trait};border-left:{trait};border-radius:24px;"
                 f"border-right:{trait};border-top:{trait};color:{couleur};display:inline-block;"
                 f"font-family:{INTER};font-size:14px;font-weight:600;padding-bottom:13px;padding-top:13px;"
                 f"text-align:center;text-decoration:none;width:auto;word-break:keep-all;")
        return self.bloc("button", pad(*p) + "text-align:center;",
                         f'<div class="alignment" align="center"><a href="{lien}" target="_blank" '
                         f'style="{style}"><span style="word-break:break-word;padding-left:24px;'
                         f'padding-right:24px;font-size:14px;display:inline-block;letter-spacing:normal;">'
                         f'<span style="word-break:break-word;line-height:20px;">{texte}</span></span></a></div>')

    def espace(self, h):
        self.n += 1
        return (f'<div class="spacer_block block-{self.n}" style="height:{h}px;line-height:{h}px;'
                f'font-size:1px;">&#8202;</div>\n')


def rangee(k, colonnes, fond="transparent", rayon=0, empile=True):
    """Une rangée Beefree : colonnes = [(largeur %, style de colonne, blocs)]."""
    tds = "".join(
        f'<td class="column column-{i + 1}" width="{w}%" style="font-weight:400;text-align:left;'
        f'vertical-align:top;{style}">\n{blocs}</td>'
        for i, (w, style, blocs) in enumerate(colonnes))
    return (f'<table class="row row-{k}" align="center" width="100%" border="0" cellpadding="0" '
            f'cellspacing="0" role="presentation"><tbody><tr><td>'
            f'<table class="row-content{" stack" if empile else ""}" align="center" border="0" '
            f'cellpadding="0" cellspacing="0" role="presentation" style="background-color:{fond};'
            f'border-radius:{rayon}px;color:#000000;width:600px;margin:0 auto;" width="600">'
            f'<tbody><tr>{tds}</tr></tbody></table></td></tr></tbody></table>\n')


def une_colonne(blocs, p=(0, 0, 0, 0)):
    return [(100, pad(*p), blocs)]


def section(f, pastille_img, pastille_alt, ligne1, ligne2, texte):
    """Pastille, titre en deux blocs (noir, puis l'accent violet en italique), paragraphe."""
    return (f.image(pastille_img, pastille_alt, p=(0, 36, 18, 36))
            + f.titre(ligne1, 36, approche=-1, interligne=1.08, p=(0, 36, 0, 36))
            + f.titre(ligne2, 40, couleur=VIOLET, police=SERIF, graisse=400, interligne=1.05,
                      italique=True, p=(0, 36, 0, 36))
            + f.paragraphe(insec(texte), p=(16, 48, 0, 48)))


def carte_mode(f, img, alt, titre, texte, haut):
    return (f.image(img, alt, p=(haut, 36, 0, 36))
            + f.titre(titre, 21, approche=0, interligne=1.2, p=(18, 36, 0, 36), aligne="left", niveau=3)
            + f.paragraphe(insec(texte), taille_px=15, p=(6, 36, 0, 36), aligne="left"))


def chiffre(f, nombre, libelle):
    return (f.titre(nombre, 44, approche=-1, interligne=1, p=(18, 16, 0, 16), aligne="left", niveau=3)
            + f.paragraphe("questions", taille_px=10.5, couleur=DISCRET, graisse=700, approche=1.2,
                           capitales=True, interligne=1.4, p=(8, 16, 0, 16), aligne="left")
            + f.paragraphe(insec(libelle), taille_px=15, couleur=ENCRE, police=SANS, graisse=600,
                           interligne=1.25, p=(8, 16, 18, 16), aligne="left"))


def construit(base):
    f = Fichier(base)
    r = []
    r.append(rangee(1, une_colonne(f.espace(24))))
    # le bandeau : une seule rangée blanche
    r.append(rangee(2, une_colonne(
        f.image("logo-civicap.png", "CiviCap", p=(24, 28, 0, 28), aligne="left", lien=SITE)
        + f.image("beefree/img/badge.png", "FLE · insertion · primo-arrivants", p=(34, 20, 22, 20))
        + f.titre("L’examen civique<br>est obligatoire.", 44, approche=-2, interligne=1.04,
                  p=(0, 24, 0, 24), niveau=1)
        + f.titre("Votre préparation<br>est prête.", 44, couleur=VIOLET, approche=-2, interligne=1.04,
                  p=(0, 24, 0, 24), niveau=1)
        + f.paragraphe(insec("L’examen civique est désormais exigé pour les titres de séjour, les cartes "
                             "de résident et la naturalisation. Vos stagiaires arrivent avec des niveaux "
                             "très hétérogènes. Un échec leur coûte une nouvelle session et retarde "
                             "leur dossier."), p=(20, 52, 0, 52))
        + f.bouton("Tester gratuitement", SITE, ENCRE, "#FFFFFF", p=(28, 20, 0, 20))
        + f.bouton("Voir les&nbsp;tarifs", SITE, "#FFFFFF", ENCRE, bordure="#E4DFEE", p=(10, 20, 0, 20))
        + f.paragraphe("✓&nbsp;5&nbsp;licences offertes &nbsp;&nbsp; ✓&nbsp;Sans&nbsp;engagement",
                       taille_px=13, graisse=500, interligne=1.4, p=(16, 20, 0, 20))
        + f.image("img/hero.png", "La question 7, « Que commémore la fête nationale du 14 juillet ? », "
                  "sa bonne réponse et son explication ; les questions 8 et 9 attendent derrière.",
                  p=(28, 28, 8, 28))), fond="#FFFFFF", rayon=30))
    # les trois parcours : un surtitre, trois colonnes blanches sur le lilas
    r.append(rangee(3, une_colonne(f.espace(16))))
    r.append(rangee(4, une_colonne(
        f.paragraphe("835&nbsp;questions officielles · trois&nbsp;parcours", taille_px=11,
                     couleur="#4C1D95", graisse=700, approche=1.5, capitales=True, interligne=1.4,
                     p=(24, 20, 14, 20))), fond=LILAS))
    # des bordures lilas font l'écart entre les cartes, identiques pour que l'empilement mobile s'aligne
    bord = (f"background-color:#FFFFFF;border-bottom:12px solid {LILAS};border-left:6px solid {LILAS};"
            f"border-right:6px solid {LILAS};")
    r.append(rangee(5, [(33.33, bord, chiffre(f, "235", "Carte de séjour pluriannuelle")),
                        (33.33, bord, chiffre(f, "257", "Carte de résident")),
                        (33.34, bord, chiffre(f, "343", "Naturalisation"))], fond=LILAS))
    r.append(rangee(6, une_colonne(f.espace(16))))
    # la carte blanche : stagiaire, formateur, fiches
    r.append(rangee(7, une_colonne(
        f.image("img/entete-photo.jpg", "Une formatrice montre l’écran de son ordinateur portable à une "
                "personne en formation, qui sourit ; à l’écran, l’entraînement libre en est à la "
                "question 7 sur 15.", p=(36, 36, 56, 36))
        + section(f, "beefree/img/pastille-stagiaire.png", "Côté stagiaire", "Ce que CiviCap fait",
                  "à votre place", "Il fait passer les examens blancs, corrige et explique chaque réponse, "
                  "et cible les points faibles de chacun. Vos formateurs gardent leur temps pour enseigner.")
        + carte_mode(f, "beefree/img/entrainement.png", "Un nouvel entraînement : 15, 25 ou 40 questions, "
                     "tirées au hasard parmi les 835 questions officielles.", "Entraînement libre",
                     "15, 25 ou 40 questions, tirées au hasard parmi les 835 questions officielles. "
                     "Correction immédiate après chaque réponse.", 44)
        + carte_mode(f, "beefree/img/examen.png", "L’écran d’examen blanc : question 12 sur 40, le compte "
                     "à rebours et le drapeau « à revoir ».", "Examen blanc, conditions réelles",
                     "40 questions, 45 minutes chronométrées, seuil de réussite à 80 % : exactement le "
                     "format de l’épreuve officielle.", 36)
        + carte_mode(f, "beefree/img/revision.png", "Une carte mémoire sur la laïcité, à revoir dans trois "
                     "jours.", "Révision par thème", "Fiches de révision, cartes mémoire à répétition "
                     "espacée et entraînement par thème pour cibler les points faibles.", 36)
        + f.espace(80)
        + section(f, "beefree/img/pastille-formateur.png", "Côté formateur", "Pilotez la progression",
                  "de chaque stagiaire", "Vous créez vos stagiaires en quelques clics, par invitation "
                  "e-mail. Puis vous suivez leur progression : scores, thèmes faibles, tests passés.")
        + f.image("img/pilotage.png", "Exemple de suivi des stagiaires : pour chacun, son score au dernier "
                  "examen blanc, son thème faible, le nombre de tests passés et son statut.",
                  p=(44, 36, 0, 36))
        + f.espace(80)
        + section(f, "beefree/img/pastille-telecharger.png", "À télécharger", "Des fiches formatives",
                  "à télécharger", "Une notion par fiche, illustrée et classée par thème : les devoirs du "
                  "citoyen, le droit des femmes, le Parlement, la Constitution, travailler en France…")
        + f.image("img/fiches.jpg", "Cinq fiches formatives en éventail : la Constitution, le droit des "
                  "femmes en France, les devoirs du citoyen, le Parlement, travailler en France.",
                  p=(44, 36, 56, 36))), fond="#FFFFFF", rayon=30))
    r.append(rangee(8, une_colonne(f.espace(16))))
    # l'offre, sur nuit
    r.append(rangee(9, une_colonne(
        f.image("beefree/img/pastille-organisme.png", "Pour votre organisme", p=(56, 40, 20, 40))
        + f.titre("Ajoutez vos stagiaires", 36, couleur="#FFFFFF", approche=-1, p=(0, 40, 0, 40))
        + f.titre("quand vous le voulez.", 40, couleur="#C4B5FD", police=SERIF, graisse=400,
                  interligne=1.05, italique=True, p=(0, 40, 0, 40))
        + f.paragraphe(insec("5 licences offertes pour tester. Ensuite, des licences de 30 ou 90 jours "
                             "dès 9,00 € HT, sans engagement."), couleur="#CFC7E2", p=(16, 60, 0, 60))
        + f.bouton("Créer mon espace d’essai&nbsp;→", SITE, "#FFFFFF", ENCRE, p=(30, 20, 54, 20))),
        fond=NUIT, rayon=30))
    # le pied
    r.append(rangee(10, une_colonne(
        f.paragraphe('<a href="[LIEN_DESABONNEMENT]" target="_blank" style="color:#6D28D9;'
                     'text-decoration:underline;">Se désabonner</a> &nbsp;·&nbsp; '
                     '[Raison sociale, adresse&nbsp;postale]', taille_px=11.5, couleur=DISCRET,
                     interligne=1.65, p=(26, 30, 30, 30)))))
    return "".join(r)


TETE = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CiviCap — l’examen civique, préparé</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700&family=Instrument+Serif:ital@1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css">
<style>
* { box-sizing: border-box; }
body { margin: 0; padding: 0; }
a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; }
p { line-height: inherit; }
.image_block img + div { display: none; }
@media (max-width:620px) {
  .row-content { width: 100% !important; }
  .stack .column { width: 100%; display: block; }
}
</style>
</head>
<body class="body" style="background-color:#F3F1F8;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none;">
<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F3F1F8;"><tbody><tr><td>
"""
PIED = "</td></tr></tbody></table>\n</body>\n</html>\n"


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


def fichier():
    sha = commit_des_images()
    base = f"{DEPOT}/{sha}/{NL.relative_to(RACINE)}/"
    html = TETE + construit(base) + PIED
    for src in re.findall(r'src="([^"]+)"', html):
        assert src.startswith(base), src
        assert (NL / src[len(base):]).exists(), f"image absente : {src}"
    SORTIE.write_text(html, encoding="utf-8")
    print(f"{SORTIE.name} : {html.count('_block block-')} blocs, images du commit {sha[:7]}")


if __name__ == "__main__":
    images() if sys.argv[1:] == ["images"] else fichier()
