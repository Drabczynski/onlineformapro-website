"""Vidéos interactives : prépare les données de chaque scène (à relancer quand on ajoute une vidéo).

    python3 preparer.py

- les répliques calées mot à mot (retranscription ElevenLabs, avec qui parle) → donnees/<id>.js ;
- les consignes dites par la voix « Femme 2 » (créée pour les mises en situation), modèle eleven_v4, toutes au même
  niveau sonore (−20 LUFS, un peu au-dessus des dialogues des vidéos), chacune vérifiée par une transcription, avec le
  début de chaque mot → medias/ ;
- les portraits des personnes, découpés dans l'image où la vidéo s'arrête → medias/.
"""
import base64, hashlib, json, os, re, subprocess, sys
ICI = os.path.dirname(os.path.abspath(__file__)); RACINE = os.path.dirname(ICI)
STT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "stt")
VOIX = "87kc04olBn8nRQKuNmaf"          # Femme 2 (../../mises-en-situation/voix.json)
MODELE = "eleven_v4"
NIVEAU = -20.0                         # LUFS
NB = " "
SCENES = {
    "epicerie": {"video": "epicerie", "gel": 9.2,
                 "people": {"vendeur": {"name": "Le vendeur", "qui": "Le vendeur", "side": "g", "spot": [27, 50, 18, 62], "anchor": [24, 46], "crop": [21, 12, 14, 25]},
                            "cliente": {"name": "La cliente", "qui": "La cliente", "side": "d", "spot": [72, 50, 18, 62], "anchor": [75, 46], "crop": [57, 16, 14, 25]}},
                 "consignes": ["Écoute la cliente.", "Dans la boutique, clique sur ce qu'elle achète.", "Écoute le vendeur.", "Pose l'argent, puis clique sur payer.",
                               "Parfait ! La cliente a ses pommes et son pain."]},
    "pharmacie": {"video": "pharmacie-chemin", "gel": 6.0,
                  "people": {"homme": {"name": "Le monsieur", "qui": "L'homme", "side": "g", "spot": [32, 52, 16, 62], "anchor": [29, 50], "crop": [29, 16, 14, 25]},
                             "dame": {"name": "La dame", "qui": "La dame", "side": "d", "spot": [67, 55, 16, 62], "anchor": [70, 52], "crop": [59, 19, 14, 25]}},
                  "consignes": ["Écoute la dame.", "Sur le plan, guide le monsieur avec les flèches.", "Écoute encore la dame.", "Sur le plan, clique sur la pharmacie.",
                                "Bravo ! Le monsieur a trouvé la pharmacie."]},
    "medecin": {"video": "medecin-tete", "gel": 5.8,
                "people": {"patiente": {"name": "La patiente", "qui": "La patiente", "side": "g", "spot": [18, 55, 18, 64], "anchor": [16, 52], "crop": [17, 19, 14, 25]},
                           "medecin": {"name": "Le médecin", "qui": "Le médecin", "side": "d", "spot": [72, 52, 18, 64], "anchor": [72, 56], "crop": [65, 17, 14, 25]}},
                "consignes": ["Écoute la patiente.", "Aujourd'hui, c'est jeudi. Elle a mal depuis quel jour ?", "Écoute encore la patiente.", "Fais monter le thermomètre.",
                              "Touche la vidéo quand tu entends le mot médicament.", "Très bien ! Tu as tout compris chez le médecin."]},
    "fleuriste": {"video": "fleuriste", "gel": 9.2,
                  "people": {"fleuriste": {"name": "La fleuriste", "qui": "La fleuriste", "side": "g", "spot": [34, 52, 16, 64], "anchor": [31, 46], "crop": [27, 19, 14, 25]},
                             "client": {"name": "Le client", "qui": "Le client", "side": "d", "spot": [74, 52, 16, 64], "anchor": [77, 46], "crop": [67, 10, 14, 25], "portrait": [3.0, [36, 8, 28, 50]]}},
                  "consignes": ["Écoute le client.", "Clique sur la bonne personne.", "Écoute bien.", "Dans la boutique, clique sur les fleurs qu'elle adore.",
                                "Et la couleur ? Clique sur les roses qu'il choisit.", "Génial ! Sa mère va adorer ses roses blanches."]},
}
COMMUNES = []      # (texte, vitesse) : consignes communes à toutes les scènes (le bravo est propre à chaque scène)


def affiche(t):     # l'espace fine avant ? ! : comme dans le prototype
    return re.sub(r" ([?!:])", NB + r"\1", t)


def tts(texte, vitesse=1.0):
    cle = f"{VOIX}|{MODELE}|{texte}" + ("" if vitesse == 1.0 else f"|{vitesse}")
    nom = "voix-" + hashlib.sha1(cle.encode()).hexdigest()[:10] + ".mp3"; chemin = os.path.join(ICI, "medias", nom)
    meta = chemin + ".json"
    if os.path.exists(chemin) and os.path.exists(meta): return nom, json.load(open(meta))
    corps = json.dumps({"text": texte, "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .5, "similarity_boost": .8, "speed": vitesse}}, ensure_ascii=False)
    r = subprocess.run(["curl", "-sS", f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}/with-timestamps", "-H", "xi-api-key: secret-du-proxy",
                        "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
    d = json.loads(r.stdout); brut = chemin + ".brut.mp3"; open(brut, "wb").write(base64.b64decode(d["audio_base64"]))
    niveau(brut, chemin); os.remove(brut); verifier(texte, chemin)
    al = d["alignment"]; car, deb = al["characters"], al["character_start_times_seconds"]
    # le début de chaque mot affiché : « Bravo ! » est un seul mot (le « ! » suit une espace fine)
    w, i = [], 0
    for k, tok in enumerate(texte.split(" ")):
        if not (re.fullmatch(r"[?!:;]", tok) and w): w.append(round(deb[i], 2))
        i += len(tok) + 1
    json.dump(w, open(meta, "w")); return nom, w


def niveau(src, dst):
    """Toutes les consignes au même niveau sonore : un simple gain (pas de compression), calculé sur la mesure EBU R128."""
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    mesure = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", o)[-1])
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", f"volume={NIVEAU - mesure:.2f}dB,alimiter=limit=0.89", "-b:a", "128k", dst], check=True)


def verifier(texte, chemin):
    """La consigne retranscrite (scribe) doit redonner le texte : sinon on le signale (mot avalé, mot déformé)."""
    r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: secret-du-proxy", "-F", "model_id=scribe_v1",
                        "-F", "language_code=fr", "-F", f"file=@{chemin}"], capture_output=True, text=True)
    lu = json.loads(r.stdout).get("text", "")
    n = lambda t: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ' ]", " ", t.lower().replace("’", "'")).split()
    print(("  ok      " if n(lu) == n(texte) else "  ÉCART   ") + texte + ("" if n(lu) == n(texte) else "  →  " + lu))


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
    if all(os.path.exists(os.path.join(ICI, "medias", f"{cle}-{k}.jpg")) for k in sc["people"]):     # déjà découpés : on les garde
        for k, p in sc["people"].items(): p["img"] = f"medias/{cle}-{k}.jpg"
        return
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
    communes = {affiche(t): dict(zip(("src", "w"), tts(t, v))) for t, v in COMMUNES}
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
