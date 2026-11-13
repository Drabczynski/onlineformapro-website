"""Vidéos interactives : assemble chaque page en un seul fichier (styles, données, scénario et moteur intégrés).

    python3 construire.py          → epicerie.html, pharmacie.html, medecin.html, fleuriste.html

Les médias restent à côté (medias/, ../medias/video/). La vidéo de Kenji est la page d'origine du prototype (kenji/).
La liste des vidéos de la page d'accueil est dans ../page.html (VIDEOS_INTERACTIVES).
"""
import json, os

ICI = os.path.dirname(os.path.abspath(__file__))
PAGES = ["epicerie", "pharmacie", "medecin", "fleuriste"]
lire = lambda p: open(os.path.join(ICI, p), encoding="utf-8").read()

GABARIT = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{titre}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap">
<style>
{css}
</style></head><body>
<script>
{donnees}
</script>
<script>
{scenario}
</script>
<script>
{moteur}
</script>
</body></html>
"""

if __name__ == "__main__":
    css, moteur = lire("moteur.css"), lire("moteur.js")
    for p in PAGES:
        donnees = lire(f"donnees/{p}.js")
        titre = json.loads(donnees[donnees.index("{"):donnees.rindex("}") + 1])["titre"]
        html = GABARIT.format(titre=titre, css=css, donnees=donnees, scenario=lire(f"scenarios/{p}.js") if os.path.exists(os.path.join(ICI, f"scenarios/{p}.js")) else "window.SCENARIO = null;", moteur=moteur)
        open(os.path.join(ICI, p + ".html"), "w", encoding="utf-8").write(html)
        print(p + ".html", len(html) // 1024, "Ko")
