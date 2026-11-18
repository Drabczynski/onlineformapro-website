"""Exercices : construit index.html avec la page des activités FLE (même charte, même moteur), mais seulement nos questions.
usage : python3 exercices/construire.py   (après sons/voix.py si un son a changé)
La page part de ../activites/page.html ; ses propres fichiers (polices, sons du jeu) sont lus dans ../activites/ (<base>),
les nôtres dans ../exercices/ (photos/, sons/)."""
import array, json, os, subprocess

ICI = os.path.dirname(os.path.abspath(__file__))
ACT = os.path.join(os.path.dirname(ICI), "activites")
ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
P, S = "../exercices/photos/", "../exercices/sons/"


def ecoute(id_, titre, photo, son, questions, script):
    return {"id": id_, "type": "video", "niveau": "A1", "titre": titre, "theme": titre, "video": None, "poster": P + photo + ".jpg",
            "audio": S + son + ".mp3", "script": [script],
            "questions": [dict(id=f"{id_}-{n + 1}", t="ecoute", niveau="A1", **q) for n, q in enumerate(questions)]}


def q(texte, choix, bonne, dit=None):
    d = {"q": texte, "choix": choix, "bonne": choix.index(bonne)}
    if dit: d["audioQ"] = S + dit + ".mp3"
    return d


J = [("j1", "Les ambassadeurs français ______ écouter Emmanuel Macron.", "sont venus", ["sont arrivés", "sont venus", "est entré", "sont descendues"], "Les ambassadeurs français sont venus écouter Emmanuel Macron."),
     ("j2", "François Bayrou ______ à l'hôtel Matignon.", "est arrivé", ["est arrivé", "sont arrivés", "est revenu", "est devenu"], "François Bayrou est arrivé à l'hôtel Matignon."),
     ("j3", "Mark Carney ______ Premier ministre du Canada.", "est devenu", ["est revenu", "est devenu", "est entré", "est arrivé"], "Mark Carney est devenu Premier ministre du Canada."),
     ("j4", "Olivier Grondeau ______ en France.", "est revenu", ["est devenu", "est arrivé", "est revenu", "sont venus"], "Olivier Grondeau est revenu en France."),
     ("j5", "Mark Carney ______ en fonction la semaine dernière.", "est entré", ["est entré", "est revenu", "sont descendues", "est devenu"], "Mark Carney est entré en fonction la semaine dernière."),
     ("j6", "Les premiers avions ______ en Ukraine.", "sont arrivés", ["est arrivé", "sont venus", "sont arrivés", "sont descendues"], "Les premiers avions sont arrivés en Ukraine."),
     ("j7", "Des milliers de personnes ______ dans les rues.", "sont descendues", ["sont venus", "sont descendues", "est entré", "sont arrivés"], "Des milliers de personnes sont descendues dans les rues.")]
F = [("f1", [q("Avant de retrouver Radio ______ Internationale…", ["Ballon", "Foot", "buteur", "gagner"], "Foot")], "Avant de retrouver Radio Foot Internationale, cette petite phrase."),
     ("f2", [q("C'est la bonne année pour ______ le Ballon d'Or.", ["gagner", "superstar", "Foot", "Ballon"], "gagner"),
             q("C'est la bonne année pour gagner le ______ d'Or.", ["buteur", "Ballon", "gagner", "Foot"], "Ballon")], "C'est peut-être la bonne année pour gagner le Ballon d'Or."),
     ("f3", [q("La ______ française pense que c'est son année.", ["Ballon", "buteur", "superstar", "Foot"], "superstar")], "La superstar française pense que c'est son année."),
     ("f4", [q("Il a été le meilleur ______ du Mondial.", ["superstar", "gagner", "Ballon", "buteur"], "buteur")], "Il a été le meilleur buteur du Mondial.")]

ACTIVITES = [ecoute(f"JOURNAL-{n + 1}", "Le journal", "radio", s, [q(t, c, r)], sc) for n, (s, t, r, c, sc) in enumerate(J)]
ACTIVITES += [ecoute(f"FOOT-{n + 1}", "Le football", "foot", s, qs, sc) for n, (s, qs, sc) in enumerate(F)]
ACTIVITES.append({"id": "ADJ", "type": "grammaire", "niveau": "A1", "titre": "Les adjectifs", "theme": "Les adjectifs", "questions": [
    dict(id=f"ADJ-{n + 1}", q="Choisissez la bonne réponse.", choix=c, bonne=c.index(r), t="trou", phrase=ph, etiquette="Complétez :", niveau="A1",
         photoH=P + "equipe.jpg", audioQ=S + son + ".mp3")
    for n, (ph, c, r, son) in enumerate([("Kylian Mbappé est un buteur ______.", ["français", "française"], "français", "g1"),
                                         ("Il joue pour l'équipe nationale ______.", ["français", "française"], "française", "g2"),
                                         ("C'est un très ______ joueur de foot.", ["bon", "bonne"], "bon", "g3"),
                                         ("C'est une ______ année pour lui.", ["bon", "bonne"], "bonne", "g4")])]})
ACTIVITES.append(ecoute("TRANSPORTS", "Les transports", "circulation", "transport", [
    q("Le transport, c'est 25 % des gaz à effet de serre.", ["Vrai", "Faux"], "Vrai", "t1"),
    q("L'essence coûte plus cher depuis la guerre en Ukraine.", ["Vrai", "Faux"], "Vrai", "t2"),
    q("En Afrique, 7 000 motos électriques en tout depuis 2022.", ["Vrai", "Faux"], "Faux", "t3")],
    "Le transport des voyageurs et des marchandises représente environ 25 % des émissions mondiales de gaz à effet de serre. "
    "Depuis le début du conflit en Ukraine, le prix de l'essence a beaucoup augmenté. Alors, en Afrique, les deux-roues électriques se vendent "
    "de mieux en mieux. Au Kenya, par exemple, plus de 7 000 motos électriques ont été enregistrées depuis 2022."))
ACTIVITES.append(ecoute("MOBILITE-1", "La mobilité", "tricycle", "m1", [q("Les ventes de ______ électriques progressent fortement.", ["monoroues", "deux-roues"], "deux-roues")],
                        "Les ventes de deux-roues électriques progressent fortement."))
ACTIVITES.append(ecoute("MOBILITE-2", "La mobilité", "tricycle", "m2", [
    q("Le nombre de scooters, ______ et tricycles électriques a pris son envol.", ["vélos", "motos"], "motos"),
    q("Le nombre de scooters, motos et ______ électriques a pris son envol.", ["trottinettes", "tricycles"], "tricycles")],
    "En Afrique, le nombre de scooters, motos et tricycles électriques a pris son envol."))

ids = lambda pre: [{"id": a["id"], "q": list(range(len(a["questions"])))} for a in ACTIVITES if a["id"].startswith(pre)]
SERIE = [{"type": "video", "items": ids("JOURNAL")}, {"type": "video", "items": ids("FOOT")},
         {"type": "grammaire", "items": [{"id": "ADJ", "q": [i]} for i in range(4)]},
         {"type": "video", "items": ids("TRANSPORTS")}, {"type": "video", "items": ids("MOBILITE")}]


def enveloppe(rel):
    """Le volume du son toutes les 40 ms, sur 64 niveaux (les ondes de la page) : la même mesure que les activités."""
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", os.path.normpath(os.path.join(ACT, rel)), "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                       capture_output=True, check=True)
    e = array.array("h"); e.frombytes(r.stdout[:len(r.stdout) // 2 * 2])
    rms = [(sum(x * x for x in e[i:i + 320]) / max(1, len(e[i:i + 320]))) ** .5 for i in range(0, len(e), 320)]
    ref = sorted(rms)[int(len(rms) * .97)] if rms else 1
    return "".join(ALPHA[min(63, int(63 * min(1, v / (ref or 1)) ** .75))] for v in rms)


sons = {a["audio"] for a in ACTIVITES if a.get("audio")} | {x["audioQ"] for a in ACTIVITES for x in a["questions"] if x.get("audioQ")}
ENV = {s: enveloppe(s) for s in sorted(sons)}

page = open(os.path.join(ACT, "page.html"), encoding="utf-8").read()
remplacer = [
    ("/*__ACTIVITES__*/[]", json.dumps(ACTIVITES, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")),
    ("/*__ENV__*/{}", json.dumps(ENV, separators=(",", ":"))),
    ('"activites-fle-3"', '"exercices-fle-1"'),          # chacun sa mémoire dans le navigateur
    ('<span class="a-venir">Vidéo à venir</span>', ''),  # ici ce sont des écoutes, pas des vidéos en attente
]
for a, b in remplacer:
    assert a in page, a; page = page.replace(a, b)
debut = page.index("const SERIE_FIXE = ["); fin = page.index("];", debut) + 2
page = page[:debut] + "const SERIE_FIXE = " + json.dumps(SERIE, ensure_ascii=False) + ";" + page[fin:]
# on entre directement dans la série ; la croix ramène au menu des activités
page = page.replace("</script>", """
etat.mode = null; etat.serie = serieFixe(); etat.resultats = {}; etat.k = 0; etat.j = 0; lancer(0);
</script>""", 1) if page.count("</script>") == 1 else page
assert "lancer(0);\n</script>" in page, "lancement non injecté"
html = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="robots" content="noindex">\n<base href="../activites/">\n</head>\n<body>\n' + page + '\n</body>\n</html>\n')
open(os.path.join(ICI, "index.html"), "w", encoding="utf-8").write(html)
print(len(ACTIVITES), "activités,", sum(len(a["questions"]) for a in ACTIVITES), "questions,", len(ENV), "sons")
