"""Sons des exercices (ElevenLabs, eleven_v4, -20 LUFS, vérifiés par transcription).
usage : python3 exercices/sons/voix.py   (ne refait que les textes nouveaux ou modifiés)"""
import json, os, subprocess, re, hashlib
ICI = os.path.dirname(os.path.abspath(__file__))
VOIX = {"h": "W01VS3mCiWjHO239CD72", "f": "87kc04olBn8nRQKuNmaf", "f1": "4NTBwCMIWDfx48seeuxZ"}   # Homme 1, Femme 2, Femme 1
MODELE, NIVEAU = "eleven_v4", -20.0
TEXTES = {
    "journal": ("h", "Aujourd'hui, à Paris, les ambassadeurs français sont venus écouter Emmanuel Macron. "
                     "François Bayrou, le nouveau Premier ministre de la France, est arrivé à l'hôtel Matignon. "
                     "Mark Carney est devenu officiellement, aujourd'hui, le nouveau Premier ministre canadien. "
                     "Olivier Grondeau a été libéré lundi, il est revenu en France. "
                     "Le nouveau Premier ministre canadien Mark Carney est entré en fonction la semaine dernière. "
                     "Les premiers avions sont arrivés en Ukraine. "
                     "Des milliers de personnes sont descendues dans les rues."),
    "football": ("f1", "Enfin, avant de retrouver Radio Foot Internationale, cette petite phrase : « C'est peut-être la bonne année pour gagner le Ballon d'Or. » "
                       "Phrase du jour, signée Kylian Mbappé. La superstar française pense que c'est peut-être son année, car il a été le meilleur buteur du Mondial."),
    "transport": ("f", "Le transport des voyageurs et des marchandises représente environ vingt-cinq pour cent des émissions mondiales de gaz à effet de serre. "
                       "Depuis le début du conflit en Ukraine, le prix de l'essence a beaucoup augmenté. "
                       "Alors, en Afrique, les deux-roues électriques se vendent de mieux en mieux. "
                       "Au Kenya, par exemple, plus de sept mille motos électriques ont été enregistrées depuis 2022."),
    "mobilite": ("f", "Selon Stéphanie Schüler, les ventes de véhicules, de ces deux-roues qui ont comme énergie l'électricité, progressent fortement. "
                      "En Afrique, le nombre de scooters, motos et tricycles électriques a pris son envol peu après l'invasion de l'Ukraine par la Russie."),
}


def niveau(src, dst):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", o)[-1])
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", f"volume={NIVEAU - m:.2f}dB,alimiter=limit=0.89", "-b:a", "96k", dst], check=True)


def verifier(texte, chemin):
    r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: secret-du-proxy", "-F", "model_id=scribe_v1",
                        "-F", "language_code=fr", "-F", f"file=@{chemin}"], capture_output=True, text=True)
    lu = json.loads(r.stdout).get("text", "")
    n = lambda t: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9' ]", " ", t.lower().replace("’", "'")).split()
    print(("  ok      " if n(lu) == n(texte) else "  ÉCART   ") + texte[:60] + ("" if n(lu) == n(texte) else "\n     lu : " + lu))


for cle, (qui, texte) in TEXTES.items():
    chemin = os.path.join(ICI, cle + ".mp3"); empreinte = chemin + ".txt"
    sig = hashlib.sha1(f"{VOIX[qui]}|{MODELE}|{texte}".encode()).hexdigest()
    if os.path.exists(chemin) and os.path.exists(empreinte) and open(empreinte).read() == sig: continue
    corps = json.dumps({"text": texte, "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .5, "similarity_boost": .8}}, ensure_ascii=False)
    brut = chemin + ".brut.mp3"
    subprocess.run(["curl", "-sS", "-o", brut, f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX[qui]}", "-H", "xi-api-key: secret-du-proxy",
                    "-H", "Content-Type: application/json", "--data-binary", corps], check=True)
    niveau(brut, chemin); os.remove(brut); verifier(texte, chemin); open(empreinte, "w").write(sig)
