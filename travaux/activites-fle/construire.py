"""Activités FLE : construit le prototype (index.html) à partir de l'Excel des 200 questions.

    python3 travaux/activites-fle/construire.py

Sources :
- donnees/excel-200.json : les 200 lignes de l'Excel « Test de positionnement FLE – A1 à B1 – 200 questions » ;
- ../positionnement-fle/banque/banque.json : les 142 QCM déjà mis en forme pour le premier test (type de support,
  document, script audio) ;
- donnees/modeles.json : les modèles de réponse et les points « Vérifiez » des 58 productions ;
- donnees/video-hotel-sous-titres.json : les sous-titres de la vidéo de démonstration ;
- les sons (../positionnement-fle/sons/) et les photos (../positionnement-fle-2/banque/img/), copiés dans medias/.

Une activité = un support et ses questions : une vidéo (en attendant les vraies vidéos, la photo et le son de
l'enregistrement), un document à lire, une série de grammaire, un texte à écrire, une réponse orale à enregistrer.
La page (page.html) tire au hasard une série d'activités variées ; rien n'est adaptatif.
"""
import json, os, re, shutil

ICI = os.path.dirname(os.path.abspath(__file__))
TRAVAUX = os.path.dirname(ICI)
SONS_V1 = os.path.join(TRAVAUX, "positionnement-fle", "sons")
IMG_V2 = os.path.join(TRAVAUX, "positionnement-fle-2", "banque", "img")
X = json.load(open(os.path.join(ICI, "donnees", "excel-200.json"), encoding="utf-8"))
B = json.load(open(os.path.join(TRAVAUX, "positionnement-fle", "banque", "banque.json"), encoding="utf-8"))
COPIES = json.load(open(os.path.join(TRAVAUX, "positionnement-fle", "sons", "copies.json"), encoding="utf-8")) if os.path.exists(os.path.join(TRAVAUX, "positionnement-fle", "sons", "copies.json")) else {}
f_modeles = os.path.join(ICI, "donnees", "modeles.json")
MODELES = json.load(open(f_modeles, encoding="utf-8")) if os.path.exists(f_modeles) else {}
SOUS_TITRES = json.load(open(os.path.join(ICI, "donnees", "video-hotel-sous-titres.json"), encoding="utf-8"))

# une photo par écoute (en attendant la vidéo) : elle pose le lieu sans jamais souffler la réponse
PHOTO_CO = {"CO-01": "lucas", "CO-02": "bus", "CO-03": "boulangerie", "CO-04": "classe", "CO-05": "amir", "CO-06": "rue",
            "CO-07": "accueil-sante", "CO-08": "telephone-2", "CO-09": "couple", "CO-10": "ville-calme", "CO-11": "conversation",
            "CO-12": "ecole", "CO-13": "gare", "CO-14": "amies", "CO-15": "prets", "CO-16": "marche", "CO-17": "chez-amie",
            "CO-18": "medecin", "CO-21": "primeur", "CO-23": "appartement", "CO-27": "bureau", "CO-29": "enfants", "CO-31": "voiture",
            "CO-33": "musee", "CO-34": "parc", "CO-35": "velo-travail", "CO-38": "presentation", "CO-41": "fromagerie",
            "CO-44": "atelier", "CO-47": "classe", "CO-50": "cinema-entree"}
PHOTO_EO = {"EO-11": "boulangerie", "EO-13": "famille", "EO-28": "marche", "EO-17": "lucas", "EO-31": "accueil-sante"}
PHOTO_EE = {"EE-17": "primeur"}
PICTOS = {"À droite": "➡️", "À gauche": "⬅️", "En face": "⬆️", "Derrière": "↩️", "Il fait soleil": "☀️", "Il pleut": "🌧️",
          "Il neige": "❄️", "Il fait chaud": "🥵"}

medias = set()


def son(nom):
    """Copie un son du premier test dans medias/sons et renvoie son chemin relatif (ou None s'il n'existe pas)."""
    src = os.path.join(SONS_V1, nom + ".mp3")
    if not os.path.exists(src): return None
    dst = os.path.join(ICI, "medias", "sons", nom + ".mp3")
    if not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src): shutil.copy(src, dst)
    medias.add("medias/sons/" + nom + ".mp3"); return "medias/sons/" + nom + ".mp3"


def photo(nom):
    dst = os.path.join(ICI, "medias", "photos", nom + ".webp")
    if not os.path.exists(dst): shutil.copy(os.path.join(IMG_V2, nom + ".webp"), dst)
    medias.add("medias/photos/" + nom + ".webp"); return "medias/photos/" + nom + ".webp"


def theme(i):
    return (X[i]["Situation / thème"] or "").replace(" – ", " · ")


def question(x):
    q = {"id": x["id"], "q": x["question"], "choix": x["choix"], "bonne": x["bonne"]}
    if any(c in PICTOS for c in x["choix"]): q["pictos"] = [PICTOS.get(c, "") for c in x["choix"]]
    for k in ("t", "phrase", "etiquette", "indice", "avant", "citation", "apres", "mots", "vers", "photo", "replique", "texte", "emoji"):
        if k in x and x[k] not in (None, "", []): q[k] = x[k]
    return q


def secondes(type_reponse):
    m = re.search(r"\((\d+)\s*(min|s)(?:\s*(\d+))?", type_reponse or "")
    if not m: return None
    return int(m.group(1)) * 60 + int(m.group(3) or 0) if m.group(2) == "min" else int(m.group(1))


def entre_guillemets(t):
    m = re.search(r"«\s*(.*?)\s*»", t or "", re.S)
    return m.group(1).strip() if m else None


activites = []

# --- la vidéo de démonstration (scène fournie, générée avec Gemini) : ajoutée hors Excel, pour montrer le lecteur
medias.update(["medias/video/hotel.mp4", "medias/video/hotel.jpg"])
activites.append({"id": "demo-hotel", "type": "video", "niveau": "A1", "titre": "À l'hôtel", "theme": "Demander une information",
                  "video": "medias/video/hotel.mp4", "poster": "medias/video/hotel.jpg", "sousTitres": SOUS_TITRES, "demo": True,
                  "script": [c["qui"] + " : " + c["texte"] for c in SOUS_TITRES],
                  "questions": [
                      {"id": "demo-1", "q": "Où est la salle du petit déjeuner ?", "choix": ["Au premier étage, à droite", "Au rez-de-chaussée, à gauche", "Au rez-de-chaussée, à droite", "Au sous-sol"], "bonne": 1},
                      {"id": "demo-2", "q": "Le petit déjeuner finit à quelle heure ?", "choix": ["À 9 heures", "À 10 heures", "À 11 heures", "À midi"], "bonne": 2}]})

# --- compréhension orale : une « vidéo » par enregistrement (photo + son en attendant la vidéo)
groupes = {}
for x in B:
    groupes.setdefault(x["groupe"], []).append(x)
for g, xs in groupes.items():
    x0 = xs[0]
    if x0["epreuve"] == "CO":
        activites.append({"id": g, "type": "video", "niveau": x0["niveau"], "titre": x0.get("etiquette") or theme(g), "theme": theme(g),
                          "video": None, "poster": photo(PHOTO_CO[g]), "audio": son(x0["audio"]), "script": x0["script"],
                          "questions": [question(x) for x in xs]})
    elif x0["epreuve"] == "CE":
        doc = {k: x0[k] for k in ("t", "titre", "emoji", "style", "lignes", "texte", "etiquette", "produit", "prix", "unite", "jour", "plats") if k in x0}
        activites.append({"id": g, "type": "lecture", "niveau": x0["niveau"], "titre": x0.get("titre") or x0.get("etiquette") or theme(g),
                          "theme": theme(g), "doc": doc, "questions": [question(x) for x in xs]})

# --- grammaire et vocabulaire : les QCM d'expression écrite, en séries de 4 ou 5 par niveau
for niv in ("A1", "A2", "B1"):
    ee = sorted([x for x in B if x["epreuve"] == "EE" and x["niveau"] == niv], key=lambda x: x["n"])
    n = max(1, round(len(ee) / 4)); taille = -(-len(ee) // n)
    for k in range(n):
        lot = ee[k * taille:(k + 1) * taille]
        if lot: activites.append({"id": f"gram-{niv}-{k + 1}", "type": "grammaire", "niveau": niv, "titre": "Grammaire et vocabulaire",
                                  "theme": f"Série {k + 1}", "questions": [question(x) for x in lot]})

# --- réagir à l'oral : les 4 QCM d'expression orale (une situation, une réplique)
eo_qcm = sorted([x for x in B if x["epreuve"] == "EO"], key=lambda x: x["n"])
qs = []
for x in eo_qcm:
    q = question(x)
    if x.get("audio"): q["audio"] = son(x["audio"])
    if x["id"] in PHOTO_EO: q["photo"] = photo(PHOTO_EO[x["id"]])
    qs.append(q)
activites.append({"id": "reagir", "type": "reagir", "niveau": None, "titre": "Que dites-vous ?", "theme": "Réagir dans une situation", "questions": qs})

# --- productions écrites et orales (les 58 lignes ouvertes de l'Excel), avec un modèle et des points à vérifier
for i, x in X.items():
    if (x["Type de réponse"] or "").startswith("QCM"): continue
    m = MODELES.get(i, {})
    support = (x["Support (texte ou script audio)"] or "").strip()
    a = {"id": i, "niveau": x["Niveau CECRL"], "titre": theme(i), "theme": x["Savoir-faire CECRL visé"] or "", "consigne": x["Consigne / question"],
         "modele": m.get("modele"), "verifiez": m.get("verifiez", [])}
    if i.startswith("EE"):
        a["type"] = "ecriture"; a["mots"] = m.get("mots")
        lg = re.search(r"\((\d+)(?:-(\d+))? mots\)", x["Type de réponse"] or "")      # l'objectif tel que l'Excel le dit
        if lg: a["objectif"] = f"{lg.group(1)} à {lg.group(2)} mots" if lg.group(2) else f"environ {lg.group(1)} mots" if int(lg.group(1)) > 5 else f"{lg.group(1)} mots"
        if i == "EE-15": a["formulaire"] = [c.strip() for c in support.split(":", 1)[1].split("/")]
        elif support and support != "—": a["support"] = support
        if i in PHOTO_EE: a["photo"] = photo(PHOTO_EE[i])
    else:
        a["type"] = "oral"; a["duree"] = secondes(x["Type de réponse"]); media = x["Média à produire"]
        a["audio"] = son(i)
        if media.startswith("Audio modèle"): a["sous"] = "repeter"; a["phrase"] = entre_guillemets(support)
        elif media.startswith("Jeu de rôle"): a["sous"] = "role"; a["role"] = support
        elif media.startswith("Image"):
            a["sous"] = "image"
            if i in PHOTO_EO: a["photo"] = photo(PHOTO_EO[i])
            elif i == "EO-10": a["numero"] = support.split(":", 1)[1].strip()
            elif i == "EO-15": a["horloge"] = [10, 30]
        elif media.startswith("Audio (question)"): a["sous"] = "question"; a["phrase"] = entre_guillemets(support)
        elif media.startswith("Audio (consigne)"): a["sous"] = "consigne"
        else: a["sous"] = "ecoute"; a["phrase"] = entre_guillemets(support)
        f = os.path.join(ICI, "medias", "modeles", i + ".mp3")
        if os.path.exists(f): a["modeleAudio"] = "medias/modeles/" + i + ".mp3"; medias.add(a["modeleAudio"])
    activites.append(a)

# ordre stable : par type puis identifiant
ORDRE = ["video", "lecture", "grammaire", "ecriture", "reagir", "oral"]
activites.sort(key=lambda a: (ORDRE.index(a["type"]), a["id"] != "demo-hotel", a["id"]))
json.dump(activites, open(os.path.join(ICI, "donnees", "activites.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

page = open(os.path.join(ICI, "page.html"), encoding="utf-8").read()
donnees = json.dumps(activites, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
contenu = page.replace("/*__ACTIVITES__*/[]", donnees)
# artefact.html : le contenu seul (l'outil d'artefact ajoute l'en-tête) ; index.html : la page web complète
open(os.path.join(ICI, "artefact.html"), "w", encoding="utf-8").write(contenu)
open(os.path.join(ICI, "index.html"), "w", encoding="utf-8").write(
    '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<meta name="robots" content="noindex">\n</head>\n<body>\n' + contenu + '\n</body>\n</html>\n')
json.dump(sorted(medias), open(os.path.join(ICI, "donnees", "medias.json"), "w"), indent=1)

compte = {}
for a in activites: compte[a["type"]] = compte.get(a["type"], 0) + 1
nq = sum(len(a.get("questions", [])) for a in activites)
print(len(activites), "activités", compte, "|", nq, "questions à choix,", sum(1 for a in activites if a["type"] in ("ecriture", "oral")), "productions",
      "|", sum(1 for a in activites if a.get("modele")), "modèles,", sum(1 for a in activites if a.get("modeleAudio")), "modèles lus |", len(medias), "médias")
