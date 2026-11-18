"""Voix des habitants du village (ElevenLabs, eleven_v4, -20 LUFS, vérifiées par transcription).
usage : python3 voix.py   (ne refait que les répliques nouvelles ou modifiées)"""
import json, os, subprocess, re, hashlib
ICI = os.path.dirname(os.path.abspath(__file__))
VOIX = {"boulangere": "87kc04olBn8nRQKuNmaf", "passant": "W01VS3mCiWjHO239CD72"}   # Femme 2, Homme 1 (../../travaux/mises-en-situation/voix.json)
MODELE, NIVEAU = "eleven_v4", -20.0
REPLIQUES = json.load(open(os.path.join(ICI, "repliques.json"), encoding="utf-8"))


def niveau(src, dst):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", o)[-1])
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", f"volume={NIVEAU - m:.2f}dB,alimiter=limit=0.89", "-b:a", "96k", dst], check=True)


def verifier(texte, chemin):
    r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: secret-du-proxy", "-F", "model_id=scribe_v1",
                        "-F", "language_code=fr", "-F", f"file=@{chemin}"], capture_output=True, text=True)
    lu = json.loads(r.stdout).get("text", "")
    n = lambda t: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9' ]", " ", t.lower().replace("’", "'")).split()
    print(("  ok      " if n(lu) == n(texte) else "  ÉCART   ") + texte + ("" if n(lu) == n(texte) else "  →  " + lu))


for cle, (qui, texte) in REPLIQUES.items():
    chemin = os.path.join(ICI, "voix", cle + ".mp3"); empreinte = chemin + ".txt"
    sig = hashlib.sha1(f"{VOIX[qui]}|{MODELE}|{texte}".encode()).hexdigest()
    if os.path.exists(chemin) and os.path.exists(empreinte) and open(empreinte).read() == sig: continue
    corps = json.dumps({"text": texte, "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .5, "similarity_boost": .8}}, ensure_ascii=False)
    brut = chemin + ".brut.mp3"
    subprocess.run(["curl", "-sS", "-o", brut, f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX[qui]}", "-H", "xi-api-key: secret-du-proxy",
                    "-H", "Content-Type: application/json", "--data-binary", corps], check=True)
    niveau(brut, chemin); os.remove(brut); verifier(texte, chemin); open(empreinte, "w").write(sig)
