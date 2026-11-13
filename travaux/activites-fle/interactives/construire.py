"""Vidéos interactives : assemble chaque page en un seul fichier (styles, données, scénario et moteur intégrés).

    python3 construire.py              → une page par scénario (scenarios/<scène>.js + donnees/<scène>.js)
    python3 construire.py glace        → seulement cette page

Les portraits et les consignes lues sont intégrés dans la page ; la vidéo et son affiche restent dans ../medias/video/. La vidéo de Kenji est la page d'origine du prototype (kenji/).
La liste des vidéos de la page d'accueil est dans ../page.html (VIDEOS_INTERACTIVES).
"""
import base64, json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
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

def integrer(donnees):
    """Les portraits et les consignes lues, intégrés dans la page (data:) : une scène = une page + sa vidéo + son affiche."""
    def remplace(m):
        f = os.path.join(ICI, m.group(1))
        if not os.path.exists(f): return m.group(0)
        typ = "image/jpeg" if f.endswith(".jpg") else "audio/mpeg"
        return '"data:%s;base64,%s"' % (typ, base64.b64encode(open(f, "rb").read()).decode())
    return re.sub(r'"(medias/[a-z0-9-]+\.(?:jpg|mp3))"', remplace, donnees)


if __name__ == "__main__":
    css, moteur = lire("moteur.css"), lire("moteur.js")
    pages = sys.argv[1:] or sorted(f[:-3] for f in os.listdir(os.path.join(ICI, "scenarios")) if f.endswith(".js") and os.path.exists(os.path.join(ICI, "donnees", f)))
    for p in pages:
        donnees = lire(f"donnees/{p}.js")
        titre = json.loads(donnees[donnees.index("{"):donnees.rindex("}") + 1])["titre"]
        propre = os.path.join(ICI, "scenarios", p + ".css")      # les styles propres à une scène, s'il y en a
        html = GABARIT.format(titre=titre, css=css + ("\n" + open(propre, encoding="utf-8").read() if os.path.exists(propre) else ""),
                              donnees=integrer(donnees), scenario=lire(f"scenarios/{p}.js"), moteur=moteur)
        open(os.path.join(ICI, p + ".html"), "w", encoding="utf-8").write(html)
        print(p + ".html", len(html) // 1024, "Ko")
