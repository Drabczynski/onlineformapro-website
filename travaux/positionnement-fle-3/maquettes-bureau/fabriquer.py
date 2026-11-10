"""Maquettes de la version bureau du test « L'examen » : six pistes jouables et une galerie.

    python3 travaux/positionnement-fle-3/maquettes-bureau/fabriquer.py

Assemble src/piste-a.html à piste-f.html avec la base commune (src/commun.css, src/commun.js) et les
données intégrées (photos de img/, l'enregistrement du métro, les drapeaux et les traductions de la version mobile),
et écrit piste-a.html à piste-f.html, index.html (galerie, page web) et galerie-artifact.html (la même
galerie sans en-tête de document, pour l'artifact). Chaque fichier ne dépend que de lui-même et de Google Fonts.
La version mobile figée (../../positionnement-fle-examen-v1/) n'est pas touchée.
"""
import base64, json, os

ICI = os.path.dirname(os.path.abspath(__file__))
V3 = os.path.dirname(ICI)
V2 = os.path.join(V3, "..", "positionnement-fle-2")

# les langues de la version mobile (même ordre, mêmes drapeaux)
LANGUES = [
    {"code": "fr", "nom": "Français", "natif": "Français", "drapeau": "fr"},
    {"code": "ar-SD", "nom": "Soudanais", "natif": "عربي سوداني", "drapeau": "sd", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "uk", "nom": "Ukrainien", "natif": "Українська", "drapeau": "ua", "police": "Noto Sans"},
    {"code": "ps", "nom": "Pachto", "natif": "پښتو", "drapeau": "af", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "ln", "nom": "Lingala", "natif": "Lingála", "drapeau": "cd"},
    {"code": "so", "nom": "Somali", "natif": "Soomaali", "drapeau": "so"},
    {"code": "bn", "nom": "Bengali", "natif": "বাংলা", "drapeau": "bd", "police": "Noto Sans Bengali"},
    {"code": "bo", "nom": "Tibétain", "natif": "བོད་སྐད།", "drapeau": "tibet", "police": "Noto Serif Tibetan"},
    {"code": "fa-AF", "nom": "Dari", "natif": "دری", "drapeau": "af", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "ru", "nom": "Russe", "natif": "Русский", "drapeau": "ru", "police": "Noto Sans"},
    {"code": "ta", "nom": "Tamoul", "natif": "தமிழ்", "drapeau": "lk", "police": "Noto Sans Tamil"},
]
# les textes français des six écrans, à traduire quand une autre langue est choisie
TEXTES = ["Évaluation de positionnement", "Français · environ 10 minutes", "Écouter des enregistrements courts",
          "Lire des messages et des documents", "Écrire des mots et des phrases", "Commencer", "Langue des consignes",
          "Je ne sais pas", "Valider", "Évaluation terminée",
          "Merci pour vos réponses. Vous pouvez prévenir votre formateur que vous avez terminé.", "Fermer",
          "Vous prenez le métro et achetez un ticket au guichet automatique.", "Combien coûte un ticket ?",
          "Vous avez rendez-vous avec un ami pour aller au cinéma.", "Vous êtes en retard. Quel message est-ce que vous envoyez ?",
          "Vous recevez une invitation", "Vous n'êtes pas disponible. Quel est le bon message ?",
          "Le verbe correct au présent", "Choisissez la bonne réponse."]
PISTES = [
    ("a", "Le grand ciel", "La scène à gauche, la question en très grand à droite.",
     "La photo suivante se pose par-dessus en reculant, le texte sort par le haut et la nouvelle question monte mot à mot."),
    ("b", "L'horizon", "Le bandeau de l'écran mobile en cinémascope, les réponses côte à côte en grandes cartes.",
     "Un travelling : la photo glisse vers la gauche, la suivante arrive de la droite, le texte arrive net après un léger flou."),
    ("c", "L'affiche", "La question en typographie d'affiche, la photo dans une haute fenêtre de ciel qui suit la souris.",
     "La fenêtre se referme vers le haut comme un store, la suivante s'ouvre par le bas, la question monte mot à mot."),
    ("d", "Le hublot", "La photo dans un grand cercle, la bille en satellite ; derrière, ses propres couleurs en flou léger, qui changent à chaque question.",
     "Un diaphragme : le cercle se referme sur la bille, le suivant s'ouvre depuis elle et la photo recule."),
    ("e", "La scène", "L'écran mobile validé, agrandi et centré ; la photo s'étend sur toute la largeur derrière lui.",
     "Une mise au point : la photo arrive floue et devient nette, la question monte mot à mot."),
    ("f", "Le plein cadre", "La piste A sans bord : le ciel et la photo prennent plus de la moitié de l'écran et se fondent dans le blanc.",
     "La photo se déploie depuis la gauche, son bord fondu en tête, et la précédente se replie sous elle."),
]


def data_uri(chemin, type_mime):
    return f"data:{type_mime};base64," + base64.b64encode(open(chemin, "rb").read()).decode()


def donnees():
    img = {n: data_uri(os.path.join(ICI, "img", n + ".webp"), "image/webp") for n in ("intro", "metro", "cinema", "telephone", "croissant")}
    son = data_uri(os.path.join(V2, "sons", "o02.mp3"), "audio/mpeg")
    drapeaux = {l["drapeau"]: data_uri(os.path.join(V3, "drapeaux", l["drapeau"] + ".svg"), "image/svg+xml") for l in LANGUES}
    trad = {}
    for l in LANGUES[1:]:
        t = json.load(open(os.path.join(V3, "traductions", l["code"] + ".json"), encoding="utf-8"))
        trad[l["code"]] = {k: t[k] for k in TEXTES if t.get(k)}
    return {"img": img, "son": son, "drapeaux": drapeaux, "langues": LANGUES, "trad": trad}


def page(contenu):
    return '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n' + contenu + "\n</html>\n"


def main():
    css = open(os.path.join(ICI, "src", "commun.css"), encoding="utf-8").read()
    js = open(os.path.join(ICI, "src", "commun.js"), encoding="utf-8").read()
    d = json.dumps(donnees(), ensure_ascii=False)
    for code, *_ in PISTES:
        s = open(os.path.join(ICI, "src", f"piste-{code}.html"), encoding="utf-8").read()
        s = s.replace("/*__CSS_COMMUN__*/", css).replace("/*__DONNEES__*/", d).replace("/*__JS_COMMUN__*/", js)
        open(os.path.join(ICI, f"piste-{code}.html"), "w", encoding="utf-8").write(page(s))
        print(f"piste-{code}.html", os.path.getsize(os.path.join(ICI, f"piste-{code}.html")) // 1024, "Ko")
    galerie = galerie_html()
    open(os.path.join(ICI, "index.html"), "w", encoding="utf-8").write(page(galerie))
    open(os.path.join(ICI, "galerie-artifact.html"), "w", encoding="utf-8").write(galerie)


def galerie_html():
    cartes = "\n".join(f'''    <a class="carte-piste" href="piste-{c}.html">
      <span class="apercu"><img src="apercus/{c}.webp" alt="Piste {c.upper()}, {nom} : écran d'une question" loading="lazy"></span>
      <span class="corps"><span class="lettre-piste">Piste {c.upper()}</span><strong>{nom}</strong><span>{idee}</span><span class="transition"><b>Transition</b> · {trans}</span><span class="ouvrir">Ouvrir la piste →</span></span>
    </a>''' for c, nom, idee, trans in PISTES)
    return f'''<title>Maquettes bureau</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@500;600;700;800;900&display=swap">
<style>
/* une galerie sobre : trois cartes, l'aperçu de chaque piste, sa transition */
:root {{ --ciel: linear-gradient(180deg, #58aef7 0%, #6fc0f8 26%, #88bffa 48%, #c6defb 69%, #f4f8fe 86%, #ffffff 100%); --violet: #7442e8; --encre: #14172b; --doux: #5d6278; --filet: #e3e5ee; --fond: #ffffff; color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--fond); color: var(--encre); font: 500 16px/1.55 "Public Sans", "Segoe UI", system-ui, sans-serif; }}
.tete {{ background: var(--ciel); padding-block: 72px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
.tete > div, main {{ width: min(1180px, 100%); margin-inline: auto; }}
main {{ padding-block: 8px 72px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
h1 {{ margin: 0 0 14px; font-size: clamp(40px, 6vw, 76px); font-weight: 900; line-height: .98; letter-spacing: -.045em; text-wrap: balance; }}
.tete p {{ max-width: 66ch; margin: 0; font-size: 18px; color: #1d2340; }}
.grille {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: -24px; }}
.carte-piste {{ display: flex; flex-direction: column; overflow: hidden; border: 1.5px solid var(--filet); border-radius: 22px; background: #fff; color: inherit; text-decoration: none; transition: border-color .2s, transform .3s cubic-bezier(.2, .8, .2, 1); }}
.carte-piste:hover {{ border-color: #c9b8fa; transform: translateY(-4px); }}
.carte-piste:focus-visible {{ outline: 3px solid var(--violet); outline-offset: 3px; }}
.apercu {{ display: block; aspect-ratio: 16 / 10; overflow: hidden; background: #eef3fd; }}
.apercu img {{ display: block; width: 100%; height: 100%; object-fit: cover; }}
.corps {{ display: grid; gap: 8px; padding: 20px 22px 22px; }}
.lettre-piste {{ color: var(--violet); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }}
.corps strong {{ font-size: 26px; font-weight: 800; letter-spacing: -.02em; }}
.transition {{ color: var(--doux); font-size: 14.5px; }}
.transition b {{ color: var(--encre); }}
.ouvrir {{ margin-top: 6px; color: var(--violet); font-weight: 800; }}
.note {{ margin-top: 32px; color: var(--doux); font-size: 15px; }}
.note kbd {{ padding: 2px 7px; border: 1px solid var(--filet); border-radius: 6px; background: #f6f7fa; font-family: inherit; font-size: 13px; font-weight: 700; line-height: 1.4; }}
@media (max-width: 960px) {{ .grille {{ grid-template-columns: 1fr; }} }}
@media (prefers-reduced-motion: reduce) {{ .carte-piste {{ transition: none; }} }}
</style>
<header class="tete"><div>
  <h1>Version bureau du test « L'examen »</h1>
  <p>Six façons de porter le test sur un écran d'ordinateur, avec les règles de la version mobile : le ciel, la photo qui se fond dans le blanc, la bille violette, le texte aligné à gauche, aucun niveau affiché. Chaque piste se joue : accueil, quatre questions réelles, fin.</p>
</div></header>
<main>
  <div class="grille">
{cartes}
  </div>
  <p class="note">Au clavier : <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> (ou <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>) pour répondre, <kbd>Entrée</kbd> pour valider, <kbd>Échap</kbd> pour revenir à l'accueil. Sur l'accueil, les drapeaux changent la langue des consignes ; sur la question du métro, la bille fait entendre le vrai enregistrement. Ce sont des maquettes : la version mobile validée reste figée telle quelle.</p>
</main>'''


if __name__ == "__main__":
    main()
