"""Activités FLE : fait lire par ElevenLabs les modèles de réponse orale (donnees/modeles.json, clés EO-…).

    python3 travaux/activites-fle/generer_modeles.py [EO-03 EO-23 …]

Voix (celles du premier test) : une voix de femme ou d'homme pour « Vous » selon le personnage du modèle (accords au
féminin, prénom), une autre voix pour l'interlocuteur des jeux de rôle ; débit 0,85 en A1, 0,95 en A2, 1 en B1.
Les répliques d'un dialogue sont assemblées avec 0,45 s de silence, le volume égalisé (loudnorm, -16 LUFS), le tout en
MP3 mono 48 kb/s dans medias/modeles/<id>.mp3. Un son déjà fait pour le même texte n'est pas redemandé.
La clé ElevenLabs n'est pas dans le dépôt : c'est un secret réseau de l'environnement (hôte api.elevenlabs.io,
en-tête xi-api-key), ajouté par le proxy.
"""
import concurrent.futures, hashlib, json, os, re, subprocess, sys, tempfile
from prononciation import prononcer          # « Vesoul » se dit « Veusoul »

ICI = os.path.dirname(os.path.abspath(__file__))
MODELE = "eleven_multilingual_v2"
VOIX = {"femme": "NEjemlRxgWmL5ZGJetsB",      # Claire - Conversationnel
        "homme": "ohItIVrXTBI80RrUECOD",      # Guillaume - Narration and voiceover (Theo ajoutait des « euh »)
        "autre_f": "YxrwjAKoUKULGd0g8K9Y",    # Lucie - Professional Customer Care Agent
        "autre_h": "Dla3WGY1SmXh3Q3svPFL"}    # Marc - Formateur FR posé
DEBIT = {"A1": .85, "A2": .95, "B1": 1.0}
FEMININ = re.compile(r"\b(née|mariée|allée|arrivée|contente|fatiguée|inscrite|venue|partie|restée|désolée|couturière|"
                     r"infirmière|aide-soignante|madame \w+|je m'appelle (Amina|Fatou|Aïssatou|Leila|Nadia|Sara|Mariam|Lina|Aminata))\b", re.I)
MASCULIN = re.compile(r"\b(né|marié|arrivé|content|fatigué|inscrit|soudanais|électricien|je m'appelle (Ahmad|Karim|Samir|Mamadou|Omar))\b", re.I)
FEMME_ROLE = re.compile(r"secrétaire|conseillère|vendeuse|voisine|collègue \(elle\)|recruteuse", re.I)


def voix_vous(i, textes):
    t = " ".join(textes)
    if FEMININ.search(t) and not MASCULIN.search(t): return "femme"
    if MASCULIN.search(t): return "homme"
    return "femme" if int(i[3:]) % 2 else "homme"          # personnage neutre : on alterne


def tts(voix, texte, debit, chemin):
    corps = json.dumps({"text": prononcer(texte), "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .62, "similarity_boost": .8, "style": 0, "use_speaker_boost": True, "speed": debit}}, ensure_ascii=False)
    for essai in range(3):
        r = subprocess.run(["curl", "-sS", "-o", chemin, "-w", "%{http_code}", "-X", "POST",
                            f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX[voix]}?output_format=mp3_44100_128",
                            "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(chemin) > 1000: return
    raise RuntimeError(f"HTTP {r.stdout} : {open(chemin, errors='ignore').read()[:200]}")


def produire(i, m, niveau):
    final = os.path.join(ICI, "medias", "modeles", i + ".mp3"); trace = final + ".txt"
    lignes = [(l["qui"], l["texte"]) for l in m] if isinstance(m, list) else [("Vous", m)]
    empreinte = hashlib.sha1(json.dumps(lignes, ensure_ascii=False).encode()).hexdigest()
    if os.path.exists(final) and os.path.exists(trace) and open(trace).read() == empreinte: return i, "déjà fait"
    vous = voix_vous(i, [t for q, t in lignes if q == "Vous"])
    autre = next((q for q, _ in lignes if q != "Vous"), "")
    v_autre = ("autre_f" if FEMME_ROLE.search(autre) else "autre_h")
    with tempfile.TemporaryDirectory() as d:
        morceaux = []
        for k, (qui, texte) in enumerate(lignes):
            c = os.path.join(d, f"{k}.mp3"); tts(vous if qui == "Vous" else v_autre, texte, DEBIT[niveau], c); morceaux.append(c)
        entrees, filtre = [], ""
        for k, c in enumerate(morceaux):
            entrees += ["-i", c]; filtre += f"[{k}:a]aresample=44100,aformat=channel_layouts=mono,apad=pad_dur=0.45[a{k}];"
        filtre += "".join(f"[a{k}]" for k in range(len(morceaux))) + f"concat=n={len(morceaux)}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[s]"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *entrees, "-filter_complex", filtre, "-map", "[s]", "-ac", "1", "-ar", "44100", "-b:a", "48k", final], check=True)
    open(trace, "w").write(empreinte)
    return i, f"fait ({vous}{', ' + v_autre if autre else ''})"


def main(ids):
    M = json.load(open(os.path.join(ICI, "donnees", "modeles.json"), encoding="utf-8"))
    X = json.load(open(os.path.join(ICI, "donnees", "excel-200.json"), encoding="utf-8"))
    os.makedirs(os.path.join(ICI, "medias", "modeles"), exist_ok=True)
    ids = ids or [k for k in M if k.startswith("EO")]
    with concurrent.futures.ThreadPoolExecutor(4) as ex:
        for i, etat in ex.map(lambda i: produire(i, M[i]["modele"], X[i]["Niveau CECRL"]), ids):
            print(i, etat)


if __name__ == "__main__":
    main(sys.argv[1:])
