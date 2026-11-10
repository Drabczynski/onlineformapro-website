"""Voix des questions traduites de « L'examen » (niveau A1, comme les consignes lues en français).

    python3 travaux/positionnement-fle-3/generer_voix.py [code ...]

Pour chaque langue (sauf le tibétain : aucune voix de synthèse ne le parle) et chaque question A1 traduite
(traductions/source.json, clé questions_lues_A1 ; traductions/<code>.json), demande la lecture à ElevenLabs
(modèle eleven_v3, même voix que les consignes françaises), égalise le volume (loudnorm, -16 LUFS) et encode en MP3 mono
32 kb/s dans sons/<code>/<empreinte du texte français>.mp3 ; sons/<code>/index.json dit quel fichier lit quelle question.
Un fichier déjà fait pour la même traduction n'est pas redemandé. La clé ElevenLabs n'est pas dans le dépôt : c'est un
secret réseau de l'environnement (hôte api.elevenlabs.io, en-tête xi-api-key), ajouté par le proxy.
"""
import concurrent.futures, hashlib, json, os, subprocess, sys

ICI = os.path.dirname(os.path.abspath(__file__))
VOIX = "NgOpYRnxMldnH8FmqCdL"          # Neutre-FLE, la voix des consignes françaises
MODELE = "eleven_v3"
CODES_ELEVENLABS = {"ar-SD": "ar", "uk": "uk", "ps": "ps", "ln": "ln", "so": "so", "bn": "bn", "fa-AF": "fa", "ru": "ru", "ta": "ta"}


def empreinte(texte):
    return hashlib.sha1(texte.encode("utf-8")).hexdigest()[:12]


def lire(code, fr, traduction, dossier):
    nom = empreinte(fr) + ".mp3"
    final, brut, trace = os.path.join(dossier, nom), os.path.join(dossier, "." + nom + ".brut"), os.path.join(dossier, "." + nom + ".txt")
    if os.path.exists(final) and os.path.exists(trace) and open(trace, encoding="utf-8").read() == traduction:
        return fr, nom, "déjà fait"
    corps = json.dumps({"text": traduction, "model_id": MODELE, "language_code": CODES_ELEVENLABS[code]}, ensure_ascii=False)
    for essai in range(3):
        r = subprocess.run(["curl", "-sS", "-o", brut, "-w", "%{http_code}", "-X", "POST",
                            f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}?output_format=mp3_44100_128",
                            "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(brut) > 1000:
            break
    else:
        msg = open(brut, errors="ignore").read()[:200] if os.path.exists(brut) else r.stderr
        raise RuntimeError(f"{code} « {fr} » : HTTP {r.stdout} {msg}")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ac", "1",
                    "-ar", "44100", "-b:a", "32k", final], check=True)
    os.remove(brut)
    open(trace, "w", encoding="utf-8").write(traduction)
    return fr, nom, "fait"


def main(codes):
    source = json.load(open(os.path.join(ICI, "traductions", "source.json"), encoding="utf-8"))
    for code in codes:
        f = os.path.join(ICI, "traductions", code + ".json")
        if code not in CODES_ELEVENLABS or not os.path.exists(f):
            print(code, ": pas de voix ou pas de traduction"); continue
        trad = json.load(open(f, encoding="utf-8"))
        dossier = os.path.join(ICI, "sons", code); os.makedirs(dossier, exist_ok=True)
        travaux = [(fr, trad[fr]) for fr in source["questions_lues_A1"] if trad.get(fr)]
        index = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
            for fr, nom, etat in ex.map(lambda x: lire(code, x[0], x[1], dossier), travaux):
                index[fr] = nom
        json.dump(index, open(os.path.join(dossier, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(code, ":", len(index), "questions lues")


if __name__ == "__main__":
    main(sys.argv[1:] or list(CODES_ELEVENLABS))
