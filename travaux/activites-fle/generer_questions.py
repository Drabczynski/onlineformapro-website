"""Activités FLE : fait lire par ElevenLabs les questions et les consignes (le petit haut-parleur à côté de la question).

    python3 travaux/activites-fle/generer_questions.py

Ce qui est lu : pour une question à choix, la question (avec, pour la grammaire, la phrase à compléter et son
contexte, le trou dit « … ») ; pour un texte à écrire et pour une réponse orale, la consigne (sauf quand le son de la
consigne existe déjà). Voix de Claire (celle des modèles), modèle Eleven Multilingual v2, débit 0,85 en A1, 0,95 en A2,
1 en B1, volume égalisé, MP3 mono 48 kb/s dans medias/questions/<id>.mp3. Le texte lu de chaque son est gardé dans
donnees/questions-lues.json ; un son déjà fait pour le même texte n'est pas redemandé.
La clé ElevenLabs n'est pas dans le dépôt : c'est un secret réseau de l'environnement (hôte api.elevenlabs.io).
"""
import concurrent.futures, hashlib, json, os, re, subprocess, tempfile
from prononciation import prononcer          # « Vesoul » se dit « Veusoul »

ICI = os.path.dirname(os.path.abspath(__file__))
VOIX, MODELE = "NEjemlRxgWmL5ZGJetsB", "eleven_multilingual_v2"      # Claire
DEBIT = {"A1": .85, "A2": .95, "B1": 1.0, None: .9}


def trou(t):
    return re.sub(r"_{3,}", "…", t or "")


def a_lire():
    A = json.load(open(os.path.join(ICI, "donnees", "activites.json"), encoding="utf-8"))
    textes = {}
    for a in A:
        for q in a.get("questions", []):
            if q.get("t") == "trou": t = " ".join(x for x in [q.get("etiquette") and "", trou(q.get("phrase"))] if x)
            elif q.get("t") == "enonce": t = " ".join(x for x in [q.get("avant"), trou(q.get("citation")), q.get("apres"), "" if re.search(r"_{3,}", q.get("citation") or "") else q["q"]] if x)
            elif q.get("t") == "mots": t = q["q"]
            elif q.get("t") == "transformer": t = f"{q.get('vers')} {q.get('phrase')}"
            else: t = q["q"]
            textes[q["id"]] = (t.strip(), a.get("niveau"))
        if a["type"] == "ecriture" or (a["type"] == "oral" and a.get("sous") != "consigne"):
            textes[a["id"]] = (a["consigne"].strip(), a.get("niveau"))
    return textes


def tts(texte, debit, chemin):
    corps = json.dumps({"text": prononcer(texte), "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .62, "similarity_boost": .8, "style": 0, "use_speaker_boost": True, "speed": debit}}, ensure_ascii=False)
    for _ in range(3):
        r = subprocess.run(["curl", "-sS", "-o", chemin, "-w", "%{http_code}", "-X", "POST",
                            f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}?output_format=mp3_44100_128",
                            "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(chemin) > 1000: return
    raise RuntimeError(f"HTTP {r.stdout} pour « {texte[:60]} »")


def produire(i, texte, niveau):
    final = os.path.join(ICI, "medias", "questions", i + ".mp3"); trace = final + ".txt"
    empreinte = hashlib.sha1(f"{texte}|{niveau}".encode()).hexdigest()
    if os.path.exists(final) and os.path.exists(trace) and open(trace).read() == empreinte: return i, "déjà fait"
    with tempfile.TemporaryDirectory() as d:
        brut = os.path.join(d, "brut.mp3"); tts(texte, DEBIT.get(niveau, .9), brut)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ac", "1", "-ar", "44100", "-b:a", "48k", final], check=True)
    open(trace, "w").write(empreinte)
    return i, "fait"


def main():
    os.makedirs(os.path.join(ICI, "medias", "questions"), exist_ok=True)
    textes = a_lire()
    with concurrent.futures.ThreadPoolExecutor(4) as ex:
        faits = list(ex.map(lambda kv: produire(kv[0], *kv[1]), textes.items()))
    json.dump({i: t for i, (t, _) in sorted(textes.items())}, open(os.path.join(ICI, "donnees", "questions-lues.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(len(textes), "textes,", sum(1 for _, e in faits if e == "fait"), "sons faits")


if __name__ == "__main__":
    main()
