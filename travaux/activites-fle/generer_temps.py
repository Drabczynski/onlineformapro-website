"""Activités FLE : retrouve le moment où chaque mot est dit dans les sons (écoutes, consignes orales, modèles lus,
questions lues) et dans la vidéo de démonstration.

    python3 travaux/activites-fle/generer_temps.py

La reconnaissance vocale d'ElevenLabs (scribe_v1) donne chaque mot entendu avec son début et sa fin. Le résultat brut
va dans donnees/temps.json ; construire.py le cale ensuite sur le texte écrit (transcription, phrase, modèle) pour que
la page allume les mots au rythme de la voix. Un son déjà traité (même empreinte) n'est pas redemandé.
La clé ElevenLabs n'est pas dans le dépôt : c'est un secret réseau de l'environnement (hôte api.elevenlabs.io).
"""
import concurrent.futures, glob, hashlib, json, os, subprocess

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, "donnees", "temps.json")


def empreinte(chemin):
    return hashlib.sha1(open(chemin, "rb").read()).hexdigest()[:16]


def stt(chemin):
    for _ in range(3):
        r = subprocess.run(["curl", "-sS", "-X", "POST", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: secret-du-proxy",
                            "-F", "model_id=scribe_v1", "-F", "language_code=fr", "-F", "tag_audio_events=false",
                            "-F", f"file=@{chemin}"], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
            if "words" in d: return d
        except ValueError: pass
    raise RuntimeError(f"{chemin} : {r.stdout[:200]}")


def main():
    T = json.load(open(SORTIE, encoding="utf-8")) if os.path.exists(SORTIE) else {}
    fichiers = sorted(glob.glob(os.path.join(ICI, "medias", "sons", "*.mp3")) + glob.glob(os.path.join(ICI, "medias", "modeles", "*.mp3"))
                      + glob.glob(os.path.join(ICI, "medias", "video", "*.mp4")) + glob.glob(os.path.join(ICI, "medias", "questions", "*.mp3"))
                      + glob.glob(os.path.join(ICI, "medias", "jeux", "*.mp3")))
    a_faire = []
    for f in fichiers:
        cle = os.path.relpath(f, ICI)
        if T.get(cle, {}).get("empreinte") != empreinte(f): a_faire.append((cle, f))

    def un(cf):
        cle, f = cf
        d = stt(f)
        mots = [[w["text"], round(w["start"], 3), round(w["end"], 3)] for w in d["words"] if w.get("type") == "word"]
        return cle, {"empreinte": empreinte(f), "texte": d.get("text", ""), "mots": mots}

    with concurrent.futures.ThreadPoolExecutor(4) as ex:
        for cle, v in ex.map(un, a_faire):
            T[cle] = v; print(cle, len(v["mots"]), "mots")
    json.dump(dict(sorted(T.items())), open(SORTIE, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(len(a_faire), "sons traités,", len(T), "en tout")


if __name__ == "__main__":
    main()
