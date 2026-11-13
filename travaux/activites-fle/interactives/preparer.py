"""Vidéos interactives : prépare les données de chaque scène (à relancer quand on ajoute une vidéo).

    python3 preparer.py

- les répliques calées mot à mot (retranscription ElevenLabs, avec qui parle) → donnees/<id>.js ;
- les consignes dites par la voix « FLE - femme-38 » (celle du prototype de Kenji), avec le début de chaque mot → medias/ ;
- les portraits des personnes, découpés dans l'image où la vidéo s'arrête → medias/.
"""
import base64, hashlib, json, os, re, subprocess, sys
ICI = os.path.dirname(os.path.abspath(__file__)); RACINE = os.path.dirname(ICI)
STT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "stt")
VOIX = "RBkAZvACIOn52Hc7XASF"          # FLE - femme-38
NB = " "
SCENES = {
    "epicerie": {"video": "epicerie", "gel": 9.2,
                 "people": {"vendeur": {"name": "Le vendeur", "qui": "Le vendeur", "side": "g", "spot": [27, 50, 18, 62], "anchor": [24, 46], "crop": [21, 12, 14, 25]},
                            "cliente": {"name": "La cliente", "qui": "La cliente", "side": "d", "spot": [72, 50, 18, 62], "anchor": [75, 46], "crop": [57, 16, 14, 25]}},
                 "consignes": ["Qu'est-ce que la cliente achète ?", "Combien ça coûte ?"]},
    "pharmacie": {"video": "pharmacie-chemin", "gel": 6.0,
                  "people": {"homme": {"name": "Le monsieur", "qui": "L'homme", "side": "g", "spot": [32, 52, 16, 62], "anchor": [29, 50], "crop": [29, 16, 14, 25]},
                             "dame": {"name": "La dame", "qui": "La dame", "side": "d", "spot": [67, 55, 16, 62], "anchor": [70, 52], "crop": [59, 19, 14, 25]}},
                  "consignes": ["Écoute la dame. Montre le chemin.", "Où est la pharmacie ?"]},
    "medecin": {"video": "medecin-tete", "gel": 6.0,
                "people": {"patiente": {"name": "La patiente", "qui": "La patiente", "side": "g", "spot": [18, 55, 18, 64], "anchor": [16, 52], "crop": [17, 19, 14, 25]},
                           "medecin": {"name": "Le médecin", "qui": "Le médecin", "side": "d", "spot": [72, 52, 18, 64], "anchor": [72, 56], "crop": [65, 17, 14, 25]}},
                "consignes": ["Elle a mal où ?", "Depuis quand ?", "Elle a de la fièvre ?"]},
    "fleuriste": {"video": "fleuriste", "gel": 9.2,
                  "people": {"fleuriste": {"name": "La fleuriste", "qui": "La fleuriste", "side": "g", "spot": [34, 52, 16, 64], "anchor": [31, 46], "crop": [27, 19, 14, 25]},
                             "client": {"name": "Le client", "qui": "Le client", "side": "d", "spot": [74, 52, 16, 64], "anchor": [77, 46], "crop": [67, 10, 14, 25], "portrait": [3.0, [36, 8, 28, 50]]}},
                  "consignes": ["Le bouquet, c'est pour qui ?", "Il choisit quelles fleurs ?"]},
}
COMMUNES = ["Bravo ! Tu as compris la scène."]


def affiche(t):     # l'espace fine avant ? ! : comme dans le prototype
    return re.sub(r" ([?!:])", NB + r"\1", t)


def tts(texte):
    nom = "voix-" + hashlib.sha1(texte.encode()).hexdigest()[:10] + ".mp3"; chemin = os.path.join(ICI, "medias", nom)
    meta = chemin + ".json"
    if os.path.exists(chemin) and os.path.exists(meta): return nom, json.load(open(meta))
    corps = json.dumps({"text": texte, "model_id": "eleven_multilingual_v2", "language_code": "fr",
                        "voice_settings": {"stability": .55, "similarity_boost": .8, "style": 0, "use_speaker_boost": True}}, ensure_ascii=False)
    r = subprocess.run(["curl", "-sS", f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}/with-timestamps", "-H", "xi-api-key: secret-du-proxy",
                        "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
    d = json.loads(r.stdout); open(chemin, "wb").write(base64.b64decode(d["audio_base64"]))
    al = d["alignment"]; car, deb = al["characters"], al["character_start_times_seconds"]
    # le début de chaque mot affiché : « Bravo ! » est un seul mot (le « ! » suit une espace fine)
    w, i = [], 0
    for k, tok in enumerate(texte.split(" ")):
        if not (re.fullmatch(r"[?!:;]", tok) and w): w.append(round(deb[i], 2))
        i += len(tok) + 1
    json.dump(w, open(meta, "w")); return nom, w


def repliques(cle, sc):
    v = next(x for x in json.load(open(os.path.join(RACINE, "donnees", "videos.json"), encoding="utf-8")) if x["fichier"] == sc["video"])
    mots = [m for m in json.load(open(os.path.join(STT, sc["video"] + ".json")))["words"] if m["type"] == "word"]
    qui = {p["qui"]: k for k, p in sc["people"].items()}
    L = []
    for c in v["sousTitres"]:
        W = []
        for m in mots:
            if m["start"] >= c["d"] - .06 and m["end"] <= c["f"] + .06:
                t = m["text"].strip()
                if re.fullmatch(r"[?!:;.,]+", t):
                    if W: W[-1][0] += (NB if t in "?!:;" else "") + t   # une ponctuation seule : collée au mot d'avant (jamais en tête de réplique)
                else: W.append([t, round(m["start"], 2), round(m["end"], 2)])
        for k in range(len(W) - 1):
            if re.search(r"[?!:;]$", W[k][0]) and not W[k][0].endswith(NB + W[k][0][-1]): W[k][0] = W[k][0][:-1].rstrip() + NB + W[k][0][-1]
        if W and re.search(r" [?!:;]$", W[-1][0]): W[-1][0] = W[-1][0][:-2] + NB + W[-1][0][-1]
        L.append({"who": qui[c["qui"]], "s": W[0][1] if W else c["d"], "e": W[-1][2] if W else c["f"], "words": W})
    return L, v


def portraits(cle, sc):
    gel = os.path.join(ICI, "medias", f"{cle}-gel.png")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(sc["gel"]), "-i", os.path.join(RACINE, "medias", "video", sc["video"] + ".mp4"), "-frames:v", "1", gel], check=True)
    from PIL import Image
    im0 = Image.open(gel); W, H = im0.size
    for k, p in sc["people"].items():
        l, t, w, h = p["crop"]; im = im0
        if "portrait" in p:                     # une autre image, quand la personne est de dos au moment de l'arrêt
            t_, (l, t, w, h) = p["portrait"]; autre = gel.replace(".png", f"-{k}.png")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(t_), "-i", os.path.join(RACINE, "medias", "video", sc["video"] + ".mp4"), "-frames:v", "1", autre], check=True)
            im = Image.open(autre); os.remove(autre)
        im.crop((round(W * l / 100), round(H * t / 100), round(W * (l + w) / 100), round(H * (t + h) / 100))).resize((240, 240)).convert("RGB").save(os.path.join(ICI, "medias", f"{cle}-{k}.jpg"), quality=86)
        p["img"] = f"medias/{cle}-{k}.jpg"
    os.remove(gel)


if __name__ == "__main__":
    communes = {affiche(t): dict(zip(("src", "w"), tts(t))) for t in COMMUNES}
    for cle, sc in SCENES.items():
        L, v = repliques(cle, sc); portraits(cle, sc)
        clips = dict(communes)
        for t in sc["consignes"]:
            nom, w = tts(t); clips[affiche(t)] = {"src": "medias/" + nom, "w": w}
        for c in clips.values():
            if not c["src"].startswith("medias/"): c["src"] = "medias/" + c["src"]
        people = {k: {x: p[x] for x in ("name", "side", "spot", "anchor", "crop", "img")} for k, p in sc["people"].items()}
        D = {"titre": v["titre"], "niveau": v["niveau"], "video": f"../medias/video/{sc['video']}.mp4", "poster": f"../medias/video/{sc['video']}.jpg",
             "duree": round(L[-1]["e"] + .3, 2), "gel": sc["gel"], "lines": L, "people": people, "clips": clips}
        open(os.path.join(ICI, "donnees", cle + ".js"), "w", encoding="utf-8").write("window.DONNEES = " + json.dumps(D, ensure_ascii=False, indent=1) + ";\n")
        print(cle, len(L), "répliques,", len(clips), "consignes")
