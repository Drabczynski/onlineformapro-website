"""Sons de « À la boulangerie » (ElevenLabs eleven_v4, -20 LUFS, vérifiés par transcription).
Deux fichiers seulement : dialogue.mp3 (la scène) et enonces.mp3 (la question et les phrases du vrai/faux).
Les repères (début / fin de chaque phrase, début de chaque mot) sont écrits dans reperes.json.
usage : python3 exercices/boulangerie/voix.py"""
import json, os, re, subprocess, tempfile
ICI = os.path.dirname(os.path.abspath(__file__))
VOIX = {"boulangere": "87kc04olBn8nRQKuNmaf", "cliente": "4NTBwCMIWDfx48seeuxZ", "voix": "W01VS3mCiWjHO239CD72"}   # Femme 2, Femme 1, Homme 1
FICHIERS = {
    "dialogue": [("boulangere", "Bonjour, madame !"),
                 ("cliente", "Bonjour. Une baguette et deux croissants, s'il vous plaît.")],
    "enonces": [("voix", "Que demande la cliente ?"),
                ("voix", "La boulangère dit bonjour."),
                ("voix", "La scène se passe à la boulangerie."),
                ("voix", "La cliente achète un gâteau.")],
}
SILENCE, NIVEAU = 0.7, -20.0
H = ["-H", "xi-api-key: secret-du-proxy"]


def tts(qui, texte, dst):
    subprocess.run(["curl", "-sS", "--fail", "-o", dst, *H, "-H", "Content-Type: application/json",
                    f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX[qui]}?output_format=mp3_44100_128",
                    "-d", json.dumps({"text": texte, "model_id": "eleven_v4"})], check=True)


def stt(chemin):
    r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", *H, "-F", "model_id=scribe_v1",
                        "-F", "language_code=fr", "-F", f"file=@{chemin}"], capture_output=True, text=True)
    return json.loads(r.stdout)


def lufs(src):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", o)[-1])


def duree(src):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)


n = lambda t: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9' ]", " ", t.lower().replace("’", "'")).split()
reperes = {}
with tempfile.TemporaryDirectory() as tmp:
    for nom, lignes in FICHIERS.items():
        morceaux, pos, info = [], 0.0, []
        for k, (qui, texte) in enumerate(lignes):
            brut = os.path.join(tmp, f"{nom}{k}.mp3"); wav = os.path.join(tmp, f"{nom}{k}.wav")
            tts(qui, texte, brut)
            # on coupe le silence du début et de la fin, puis on met chaque phrase au même niveau
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-af",
                            "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                            "-ar", "44100", "-ac", "1", wav], check=True)
            g = NIVEAU - lufs(wav); norm = os.path.join(tmp, f"{nom}{k}n.wav")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-af", f"volume={g:.2f}dB,alimiter=limit=0.89", norm], check=True)
            d = duree(norm); debut = pos + 0.25
            info.append({"qui": qui, "t": texte, "s": round(debut, 2), "e": round(debut + d, 2)})
            morceaux.append(norm); pos = debut + d + SILENCE - 0.25
        # assemblage : 0,25 s de silence avant chaque phrase, SILENCE entre deux phrases
        liste = os.path.join(tmp, nom + ".txt"); sil = os.path.join(tmp, "sil.wav"); sil2 = os.path.join(tmp, "sil2.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.25", sil], check=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(SILENCE - 0.25), sil2], check=True)
        with open(liste, "w") as f:
            for m in morceaux:
                f.write(f"file '{sil}'\nfile '{m}'\nfile '{sil2}'\n")
        dst = os.path.join(ICI, nom + ".mp3")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", liste, "-b:a", "128k", dst], check=True)
        # repères des mots, depuis la transcription du fichier final
        lu = stt(dst); mots = [w for w in lu.get("words", []) if w.get("type") == "word"]
        print(nom, f"{duree(dst):.2f}s", "lu :", lu.get("text"))
        i = 0
        for L in info:
            attendus = len(n(L["t"])); L["w"] = []
            while len(n(" ".join(x["text"] for x in mots[i:i + len(L["w"]) + 1]))) <= attendus and i + len(L["w"]) < len(mots):
                L["w"].append(round(mots[i + len(L["w"])]["start"], 2))
            got = " ".join(x["text"] for x in mots[i:i + len(L["w"])])
            print(("  ok      " if n(got) == n(L["t"]) else "  ÉCART   ") + L["t"], "|", got)
            i += len(L["w"])
        reperes[nom] = {"duree": round(duree(dst), 2), "lignes": info}
json.dump(reperes, open(os.path.join(ICI, "reperes.json"), "w"), ensure_ascii=False, indent=1)
