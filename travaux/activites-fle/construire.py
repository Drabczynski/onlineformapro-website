"""Activités FLE : construit le prototype (index.html) à partir de l'Excel des 200 questions.

    python3 travaux/activites-fle/construire.py

Sources :
- donnees/excel-200.json : les 200 lignes de l'Excel « Test de positionnement FLE – A1 à B1 – 200 questions » ;
- ../positionnement-fle/banque/banque.json : les 142 QCM déjà mis en forme pour le premier test (type de support,
  document, script audio) ;
- donnees/modeles.json : les modèles de réponse et les points « Vérifiez » des 58 productions ;
- donnees/video-hotel-sous-titres.json : les sous-titres de la vidéo de démonstration ;
- donnees/temps.json : le moment où chaque mot est dit dans les sons (generer_temps.py), calé ici sur le texte écrit ;
- donnees/questions-lues.json (generer_questions.py), donnees/habillage.json (photos d'ambiance), donnees/aides-ecriture.json ;
- les sons (../positionnement-fle/sons/) et les photos (../positionnement-fle-2/banque/img/), copiés dans medias/.

La page (page.html) reçoit aussi, pour chaque son, son enveloppe (le volume toutes les 40 ms) : les ondes qui bougent
avec la voix. Les versions précédentes sont construites à côté : v1/ (tuiles en thème clair) et v2-violet/
(la version 2 sur fond violet).

Une activité = un support et ses questions : une vidéo (en attendant les vraies vidéos, la photo et le son de
l'enregistrement), un document à lire, une série de grammaire, un texte à écrire, une réponse orale à enregistrer.
La page (page.html) tire au hasard une série d'activités variées ; rien n'est adaptatif.
"""
import array, difflib, json, os, re, shutil, subprocess, unicodedata
from prononciation import SONS as SONS_REFAITS
from generer_jeux import texte_role, MOTS as MOTS_LUS

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
f_temps = os.path.join(ICI, "donnees", "temps.json")
TEMPS = json.load(open(f_temps, encoding="utf-8")) if os.path.exists(f_temps) else {}
def lire_json(nom):
    f = os.path.join(ICI, "donnees", nom)
    return json.load(open(f, encoding="utf-8")) if os.path.exists(f) else {}
LUES = lire_json("questions-lues.json")       # le texte lu de chaque question (generer_questions.py)
HAB = lire_json("habillage.json")             # la photo d'ambiance des écrans sans image
AIDES = lire_json("aides-ecriture.json")      # le support et les débuts de phrase des textes à écrire
ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"

# une photo par écoute (en attendant la vidéo) : elle pose le lieu sans jamais souffler la réponse
PHOTO_CO = {"CO-01": "lucas", "CO-02": "bus", "CO-03": "boulangerie", "CO-04": "classe", "CO-05": "amir", "CO-06": "rue",
            "CO-07": "agenda-accueil", "CO-08": "telephone-2", "CO-09": "couple", "CO-10": "fenetre-the", "CO-11": "conversation",
            "CO-12": "cours-adultes", "CO-13": "gare", "CO-14": "offrir-boisson", "CO-15": "salle-restaurant", "CO-16": "etal-fruits", "CO-17": "photos-main",
            "CO-18": "medecin", "CO-21": "courses", "CO-23": "appartement", "CO-27": "bureau", "CO-29": "enfants", "CO-31": "voiture",
            "CO-33": "vieux-lyon", "CO-34": "parc", "CO-35": "velo-travail", "CO-38": "presentation", "CO-41": "fromagerie",
            "CO-44": "atelier", "CO-47": "etudier-maison", "CO-50": "cinema-entree"}
PHOTO_EO = {"EO-11": "boulangerie", "EO-13": "famille", "EO-28": "marche", "EO-17": "lucas", "EO-31": "secretaire-telephone"}
PHOTO_EE = {"EE-17": "primeur"}
PICTOS = {"À droite": "➡️", "À gauche": "⬅️", "En face": "⬆️", "Derrière": "↩️", "Il fait soleil": "☀️", "Il pleut": "🌧️",
          "Il neige": "❄️", "Il fait chaud": "🥵"}

medias = set()


def son(nom):
    """Copie un son du premier test dans medias/sons et renvoie son chemin relatif (ou None s'il n'existe pas)."""
    src = os.path.join(SONS_V1, nom + ".mp3")
    if not os.path.exists(src): return None
    dst = os.path.join(ICI, "medias", "sons", nom + ".mp3")
    refait = nom in SONS_REFAITS and os.path.exists(dst)      # un son refait ici (prononciation.py) n'est pas écrasé par celui du premier test
    if not refait and (not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src)): shutil.copy(src, dst)
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


def _n(m):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", m.lower()).encode("ascii", "ignore").decode())


def caler(lignes, cle):
    """Cale les mots écrits (une liste de lignes) sur les mots entendus dans le son `cle` : pour chaque ligne,
    la liste [mot, début, fin]. Les mots dits autrement (chiffres lus en lettres…) se partagent le temps du passage."""
    t = TEMPS.get(cle)
    if not t or not t["mots"]: return None
    jetons = []
    for li, l in enumerate(lignes):
        for m in l.split():
            if not _n(m) and jetons and jetons[-1][0] == li: jetons[-1][1] += "\u00a0" + m     # « ? », « : » restent avec le mot
            else: jetons.append([li, m])
    A, S = [_n(m) for _, m in jetons], t["mots"]
    sm = difflib.SequenceMatcher(None, A, [_n(w) for w, _, _ in S], autojunk=False)
    if sm.ratio() < .45: return None
    temps = [None] * len(A)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1): temps[i1 + k] = (S[j1 + k][1], S[j1 + k][2])
        elif tag == "replace":
            d, f, n = S[j1][1], S[j2 - 1][2], i2 - i1
            for k in range(n): temps[i1 + k] = (d + (f - d) * k / n, d + (f - d) * (k + 1) / n)
    for k in range(len(temps)):
        if temps[k] is None:
            av = next((temps[x][1] for x in range(k - 1, -1, -1) if temps[x]), 0.0)
            ap = next((temps[x][0] for x in range(k + 1, len(temps)) if temps[x]), av + .3)
            temps[k] = (av, max(av, ap))
    sortie = [[] for _ in lignes]
    for (li, m), (d, f) in zip(jetons, temps): sortie[li].append([m, round(d, 2), round(f, 2)])
    return sortie


def enveloppe(rel):
    """Le volume du son toutes les 40 ms, sur 64 niveaux (un caractère par pas)."""
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", os.path.join(ICI, rel), "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                       capture_output=True, check=True)
    e = array.array("h"); e.frombytes(r.stdout[:len(r.stdout) // 2 * 2])
    rms = [(sum(x * x for x in e[i:i + 320]) / max(1, len(e[i:i + 320]))) ** .5 for i in range(0, len(e), 320)]
    ref = sorted(rms)[int(len(rms) * .97)] if rms else 1
    return "".join(ALPHA[min(63, int(63 * min(1, v / (ref or 1)) ** .75))] for v in rms)


activites = []

# --- la vidéo de démonstration (scène fournie, générée avec Gemini) : ajoutée hors Excel, pour montrer le lecteur
medias.update(["medias/video/hotel.mp4", "medias/video/hotel.jpg"])
activites.append({"id": "demo-hotel", "type": "video", "niveau": "A1", "titre": "À l'hôtel", "theme": "Demander une information",
                  "video": "medias/video/hotel.mp4", "poster": "medias/video/hotel.jpg", "sousTitres": SOUS_TITRES, "demo": True,
                  "script": [c["qui"] + " : " + c["texte"] for c in SOUS_TITRES],
                  "questions": [
                      {"id": "demo-1", "q": "Où est la salle du petit déjeuner ?", "choix": ["Au premier étage, à droite", "Au rez-de-chaussée, à gauche", "Au rez-de-chaussée, à droite", "Au sous-sol"], "bonne": 1},
                      {"id": "demo-2", "q": "Le petit déjeuner finit à quelle heure ?", "choix": ["À 9 heures", "À 10 heures", "À 11 heures", "À midi"], "bonne": 2},
                      # une question dont les réponses sont des images de la vidéo
                      {"id": "demo-3", "q": "Qui travaille à l'hôtel ?", "choix": ["La réceptionniste", "Le client"], "bonne": 0,
                       "images": ["medias/video/hotel-receptionniste.webp", "medias/video/hotel-client.webp"]}]})
medias.update(["medias/video/hotel-receptionniste.webp", "medias/video/hotel-client.webp"])
k = caler([c["texte"] for c in SOUS_TITRES], "medias/video/hotel.mp4")
if k: activites[-1]["karaoke"] = [{"qui": c["qui"], "mots": m} for c, m in zip(SOUS_TITRES, k)]

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
        k = caler(x0["script"], activites[-1]["audio"])
        if k: activites[-1]["karaoke"] = [{"mots": m} for m in k]
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
    if x.get("audio"):
        q["audio"] = son(x["audio"])
        k = caler([q.get("replique") or q.get("texte") or ""], q["audio"])
        if k: q["k"] = k[0]
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
        elif media.startswith("Jeu de rôle"):
            a["sous"] = "role"; a["role"] = support; a["roleTexte"] = texte_role(support)
            rel = "medias/jeux/" + i + ".mp3"          # l'ouverture lue : « Jeu de rôle. <situation> L'autre personne : <rôle> » (generer_jeux.py)
            if os.path.exists(os.path.join(ICI, rel)):
                medias.add(rel); a["jeu"] = {"audio": rel}
                k = caler([a["consigne"], a["roleTexte"]], rel)
                if k: a["jeu"]["k"] = k
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
        # les mots qui s'allument : la phrase à répéter ou la consigne lue, et le modèle
        if a["audio"] and a["sous"] in ("repeter", "consigne"):
            k = caler([a["phrase"] if a["sous"] == "repeter" else a["consigne"]], a["audio"])
            if k: a["k"] = k[0]
        if a.get("modeleAudio") and a["modele"]:
            lignes = [l["texte"] for l in a["modele"]] if isinstance(a["modele"], list) else [p for p in str(a["modele"]).split("\n\n") if p.strip()]
            k = caler(lignes, a["modeleAudio"])
            if k: a["modeleK"] = [{"qui": l["qui"], "mots": m} for l, m in zip(a["modele"], k)] if isinstance(a["modele"], list) else [{"mots": m} for m in k]
    activites.append(a)

# --- les jeux de rôle (EO-23, 24, 25, 27, 39, 40, 41) sont retirés de la page le 12 novembre : trop compliqués à comprendre.
#     Leurs données, l'ouverture animée (page.html, introJeu) et les sons (medias/jeux/) restent, pour y revenir.
JEUX_DE_ROLE = False
if not JEUX_DE_ROLE: activites = [a for a in activites if a.get("sous") != "role"]

# --- les ajouts hors Excel (donnees/ajouts.json) : un son fourni (medias/sons/<id>.mp3), sa transcription et ses questions,
#     sur le même écran que la compréhension orale
for p_ in lire_json("ajouts.json"):
    rel = "medias/sons/" + p_["id"] + ".mp3"; medias.add(rel)
    activites.append({"id": p_["id"], "type": "video", "niveau": p_["niveau"], "titre": p_["titre"], "theme": p_["theme"], "video": None,
                      "poster": photo(p_["photo"]), "audio": rel, "script": p_["script"], "questions": [dict(q, niveau=p_["niveau"]) for q in p_["questions"]], "ajout": True})
    k = caler(p_["script"], rel)
    if k: activites[-1]["karaoke"] = [{"mots": m} for m in k]

# --- répéter : les phrases courtes des écoutes A1 de l'Excel, mot pour mot, avec leur son (la même voix que l'écoute).
#     Les trois « Écoutez et répétez » de l'Excel (EO-01, EO-02, EO-33) sont dans la même rubrique.
REPETER_CO = ["CO-01", "CO-04", "CO-05", "CO-06", "CO-07", "CO-09", "CO-10", "CO-11", "CO-15", "CO-17"]
for g in REPETER_CO:
    c = next(a for a in activites if a["id"] == g)
    ph = " ".join(c["script"])
    r = {"id": "REP-" + g, "type": "oral", "sous": "repeter", "niveau": c["niveau"], "titre": "Répéter", "theme": c["theme"],
         "consigne": "Écoutez et répétez.", "phrase": ph, "audio": c["audio"], "duree": max(5, round(len(ph.split()) * .9)),
         "photo": c["poster"], "source": g, "derive": True, "verifiez": []}
    k = caler([ph], c["audio"])
    if k: r["k"] = k[0]
    activites.append(r)

# --- composer le mot avec des lettres : des QCM de l'Excel dont la réponse est un mot à bien écrire (orthographe, accord,
#     conjugaison). La phrase de l'Excel, le mot de base entre parenthèses (ajouté ici), les lettres du mot et quelques
#     lettres des mauvaises réponses en plus.
LETTRES = {"EE-06": {"son": "bonjour", "titre": "Écoutez et écrivez le mot."}, "EE-07": {"grand": "15", "titre": "Comment écrit-on 15 en lettres ?"},
           "EE-05": {"indice": "habiter"}, "EE-12": {"indice": "pomme"}, "EE-13": {"indice": "gentil"},
           "EE-20": {"indice": "aller"}, "EE-28": {"indice": "être"},
           "EE-38": {"indice": "remplir"}, "EE-42": {"indice": "faire"}, "EE-43": {"indice": "écrire"}}
def lettres_en_plus(mot, autres):
    reste = []
    for c in autres:
        m = list(mot.lower())
        for l in c.lower():
            if l in m: m.remove(l)
            elif l.isalpha() and l not in reste: reste.append(l)
    return reste[:3]
par_niv = {}
for x in B:
    if x["id"] not in LETTRES: continue
    L = LETTRES[x["id"]]; mot = x["choix"][x["bonne"]]
    q = {"id": x["id"] + "-L", "source": x["id"], "niveau": x["niveau"], "mot": mot,
         "extra": lettres_en_plus(mot, [c for i, c in enumerate(x["choix"]) if i != x["bonne"]]), "titre": L.get("titre") or "Écrivez le mot avec les lettres."}
    if x.get("t") == "trou": q["phrase"] = x["phrase"]
    elif x.get("t") == "enonce" and "_" in (x.get("citation") or ""): q["phrase"] = x["citation"]
    for k_ in ("indice", "grand"):
        if L.get(k_): q[k_] = L[k_]
    if L.get("son"):
        rel = "medias/mots/" + L["son"] + ".mp3"
        if os.path.exists(os.path.join(ICI, rel)): medias.add(rel); q["son"] = rel
    par_niv.setdefault(x["niveau"], []).append(q)
for niv in ("A1", "A2", "B1"):
    if par_niv.get(niv): activites.append({"id": "lettres-" + niv, "type": "lettres", "niveau": niv, "titre": "Composer le mot", "theme": "Orthographe",
                                            "questions": sorted(par_niv[niv], key=lambda q: q["id"])})

# le haut-parleur des questions et des consignes, la photo d'ambiance, l'aide à l'écriture
# la vidéo interactive : le moment (en secondes) où elle s'arrête pour poser chaque question ; 99 = à la fin
ARRETS = {"demo-1": 5.3, "demo-2": 99, "demo-3": 99}
def lue(i):
    rel = f"medias/questions/{i}.mp3"
    if not os.path.exists(os.path.join(ICI, rel)): return None
    medias.add(rel); return rel


def photo_h(nom):
    rel = f"medias/photos/{nom}.webp"
    if not os.path.exists(os.path.join(ICI, rel)): return None
    medias.add(rel); return rel


for a in activites:
    for q in a.get("questions", []):
        if q["id"] in X: q["niveau"] = X[q["id"]]["Niveau CECRL"]
        if q["id"] in ARRETS: q["arret"] = ARRETS[q["id"]]
        p = lue(q["id"])
        if p:
            q["audioQ"] = p
            k = caler([q["q"]], p) if LUES.get(q["id"]) == q["q"] else None
            if k: q["qk"] = k[0]
        src = q.get("source")
        if src and a["type"] == "lettres":
            if HAB.get(src) and photo_h(HAB[src]): q["photoH"] = photo_h(HAB[src])
            if q.get("phrase") and lue(src): q["audioQ"] = lue(src)
            continue
        if HAB.get(q["id"]) and photo_h(HAB[q["id"]]): q["photoH"] = photo_h(HAB[q["id"]])
    if a["type"] in ("ecriture", "oral"):
        p = lue(a["id"])
        if p:
            a["audioQ"] = p
            k = caler([a["consigne"]], p)
            if k: a["consigneK"] = k[0]
    if HAB.get(a["id"]) and photo_h(HAB[a["id"]]): a["photoH"] = photo_h(HAB[a["id"]])
    if a["id"] in AIDES: a["aide"] = AIDES[a["id"]]

# ordre stable : par type puis identifiant
ORDRE = ["video", "lecture", "grammaire", "lettres", "ecriture", "reagir", "oral"]
activites.sort(key=lambda a: (ORDRE.index(a["type"]), a["id"] != "demo-hotel", a["id"]))
json.dump(activites, open(os.path.join(ICI, "donnees", "activites.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# les enveloppes de tous les sons utilisés (les ondes de la page)
sons = sorted({a.get(c) for a in activites for c in ("audio", "modeleAudio", "audioQ") if a.get(c)} | {a["jeu"]["audio"] for a in activites if a.get("jeu")}
              | {q[c] for a in activites for q in a.get("questions", []) for c in ("son",) if q.get(c)}
              | {q[c] for a in activites for q in a.get("questions", []) for c in ("audio", "audioQ") if q.get(c)})
ENV = {s_: enveloppe(s_) for s_ in sons}

donnees = json.dumps(activites, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
env = json.dumps(ENV, separators=(",", ":"))


def page_web(contenu, tete=""):
    return ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<meta name="robots" content="noindex">\n' + tete + '</head>\n<body>\n' + contenu + '\n</body>\n</html>\n')


# la page : artefact.html est le contenu seul (l'outil d'artefact ajoute l'en-tête) ; index.html, la page web complète
contenu = open(os.path.join(ICI, "page.html"), encoding="utf-8").read().replace("/*__ACTIVITES__*/[]", donnees).replace("/*__ENV__*/{}", env)
open(os.path.join(ICI, "artefact.html"), "w", encoding="utf-8").write(contenu)
open(os.path.join(ICI, "index.html"), "w", encoding="utf-8").write(page_web(contenu))
# la première version (tuiles et cartes), gardée pour comparer : mêmes données, médias du dossier parent
v1 = open(os.path.join(ICI, "v1", "page.html"), encoding="utf-8").read().replace("/*__ACTIVITES__*/[]", donnees)
open(os.path.join(ICI, "v1", "index.html"), "w", encoding="utf-8").write(page_web(v1, '<base href="../">\n'))
# la version 2 en violet (fond violet → bleu, comme le premier positionnement), gardée telle quelle
v2v = open(os.path.join(ICI, "v2-violet", "page.html"), encoding="utf-8").read().replace("/*__ACTIVITES__*/[]", donnees).replace("/*__ENV__*/{}", env)
open(os.path.join(ICI, "v2-violet", "index.html"), "w", encoding="utf-8").write(page_web(v2v, '<base href="../">\n'))
json.dump(sorted(medias), open(os.path.join(ICI, "donnees", "medias.json"), "w"), indent=1)

compte = {}
for a in activites: compte[a["type"]] = compte.get(a["type"], 0) + 1
nq = sum(len(a.get("questions", [])) for a in activites)
print(len(activites), "activités", compte, "|", nq, "questions à choix,", sum(1 for a in activites if a["type"] in ("ecriture", "oral")), "productions",
      "|", sum(1 for a in activites if a.get("modele")), "modèles,", sum(1 for a in activites if a.get("modeleAudio")), "modèles lus |", len(medias), "médias")
