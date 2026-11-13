"""Crée des voix avec l'outil de création de voix d'ElevenLabs (text-to-voice/design), garde le meilleur aperçu de chacune
et l'enregistre sur le compte ; la liste des voix est tenue dans voix.json (lu par generer.py).

    python3 creer_voix.py            → crée celles de NOUVELLES qui ne sont pas encore dans voix.json

Le meilleur aperçu : celui que la reconnaissance vocale retranscrit tel quel, au débit le plus proche d'une conversation
(environ 2,8 mots par seconde) et sans longs blancs entre les mots (l'homme 1 du premier essai découpait trop).
"""
import base64, json, os, re, subprocess, tempfile, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
API = "https://api.elevenlabs.io/v1"
SEC = "Recorded close to a high-quality microphone in a completely dry, quiet studio: no reverb, no room echo, no music, no background noise."
TF = "Bonjour ! Alors, aujourd'hui, j'ai des fraises et des tomates du marché. Vous voulez autre chose ? Voilà, ça fait quatre euros, s'il vous plaît. Merci, bonne journée !"
TH = "Bonjour monsieur. Qu'est-ce qu'il vous faut aujourd'hui ? Un ticket ? Très bien. Ça fait un euro quatre-vingts, s'il vous plaît. Merci, et bonne journée !"
NOUVELLES = {
    "Femme 3": ("F", "A young French woman in her early twenties from Paris, native standard French accent, bright, natural and relaxed everyday conversational tone, friendly, medium pace, like a student working in a shop. " + SEC, TF),
    "Femme 4": ("F", "A French woman in her late fifties, native standard French accent, warm, calm and natural everyday conversational tone, slightly lower voice, medium pace, like an experienced shopkeeper. " + SEC, TF),
    "Homme 3": ("M", "A young French man in his mid-twenties, native standard French accent, natural, relaxed and friendly everyday conversational tone, medium pace, like a young waiter. " + SEC, TH),
    "Homme 4": ("M", "A French man around sixty, native standard French accent, warm, calm, slightly deep natural everyday conversational voice, medium pace, like a friendly older shopkeeper. " + SEC, TH),
}


def curl(url, corps=None, fichier=None):
    cmd = ["curl", "-sS", url, "-H", "xi-api-key: secret-du-proxy"]
    if corps is not None: cmd += ["-H", "Content-Type: application/json", "--data-binary", json.dumps(corps, ensure_ascii=False)]
    if fichier: cmd += ["-F", "model_id=scribe_v1", "-F", "language_code=fra", "-F", f"file=@{fichier}"]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout)


def mots(t):
    t = unicodedata.normalize("NFKD", t.lower()); t = "".join(c for c in t if not unicodedata.combining(c))
    return re.findall(r"[a-z0-9]+", t.replace("-", " "))


def note(chemin, texte):
    d = curl(f"{API}/speech-to-text", fichier=chemin)
    M = [w for w in d.get("words", []) if w.get("type") == "word"]
    if not M: return 99, {}
    duree = M[-1]["end"] - M[0]["start"]; debit = len(M) / duree
    blanc = max((b["start"] - a["end"] for a, b in zip(M, M[1:])), default=0)
    ecart = len(set(mots(texte)) ^ set(mots(d.get("text", ""))))
    return ecart * 2 + abs(debit - 2.8) * 3 + max(blanc - .6, 0) * 4, {"debit": round(debit, 2), "blanc": round(blanc, 2), "ecart": ecart, "lu": d.get("text")}


def creer(nom, genre, desc, texte):
    d = curl(f"{API}/text-to-voice/design", {"voice_description": desc, "text": texte, "model_id": "eleven_ttv_v3"})
    meilleurs = []
    with tempfile.TemporaryDirectory() as t:
        for p in d["previews"]:
            c = os.path.join(t, p["generated_voice_id"] + ".mp3"); open(c, "wb").write(base64.b64decode(p["audio_base_64"]))
            n, info = note(c, texte); meilleurs.append((n, p["generated_voice_id"], info)); print(" ", nom, p["generated_voice_id"], round(n, 2), info)
    n, gid, info = min(meilleurs)
    r = curl(f"{API}/text-to-voice", {"voice_name": f"FLE situations - {nom}", "voice_description": desc, "generated_voice_id": gid})
    return {"id": r["voice_id"], "genre": genre, "description": desc, "apercu": info}


if __name__ == "__main__":
    chemin = os.path.join(ICI, "voix.json")
    V = json.load(open(chemin, encoding="utf-8"))
    for nom, (genre, desc, texte) in NOUVELLES.items():
        if nom in V: continue
        V[nom] = creer(nom, genre, desc, texte); print(nom, "→", V[nom]["id"])
        json.dump(V, open(chemin, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
