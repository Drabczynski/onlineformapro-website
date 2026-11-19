"""Sons de « À la boulangerie », exercice lié à la fiche A1 n° 1 (fiches/dialogue/A1/1.pdf).
- le dialogue est le son de la fiche, Sons/A1/A1-s1.mp3, que index.html lit à sa place dans le dépôt (aucune copie) :
  rien n'est synthétisé ni retouché ; ses repères viennent de sa transcription (ElevenLabs scribe_v1).
- enonces.mp3 (la question et les phrases du vrai/faux) est synthétisé (eleven_v4, -20 LUFS), puis transcrit.
Les repères (début / fin de chaque phrase, début de chaque mot) sont écrits dans reperes.json ;
ceux de DLG et ENC dans index.html sont à y reporter. Ensuite, node calcul-spectre.js recalcule spectre.js
(le spectre que relit la page quand elle est ouverte depuis le disque).
usage : python3 exercices-lies/boulangerie/voix.py [dialogue] [enonces]
        sans argument, les deux ; une partie qu'on ne refait pas garde ses repères dans reperes.json."""
import json, os, re, subprocess, sys, tempfile
ICI = os.path.dirname(os.path.abspath(__file__))
CECRL, FICHE = "A1", 1
LIEN = f"../../Sons/{CECRL}/{CECRL}-s{FICHE}.mp3"   # le son de la fiche, vu depuis ce dossier (comme dans index.html)
SOURCE = os.path.normpath(os.path.join(ICI, LIEN))
VOIX = {"voix": "W01VS3mCiWjHO239CD72"}   # Homme 1
LIGNES = {
    # le texte du son de la fiche : sert à vérifier la transcription et à répartir les mots entre les phrases
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
debuts = lambda mots: [round(x["start"], 2) for x in mots]


def reperer(chemin, nom, info):
    """Transcrit le fichier et répartit les mots reconnus entre les phrases attendues ; rend les mots de chaque phrase."""
    lu = stt(chemin); mots = [w for w in lu.get("words", []) if w.get("type") == "word"]
    print(nom, f"{duree(chemin):.2f}s", "lu :", lu.get("text"))
    i, par_phrase = 0, []
    for L in info:
        attendus, k = len(n(L["t"])), 0
        while i + k < len(mots) and len(n(" ".join(x["text"] for x in mots[i:i + k + 1]))) <= attendus:
            k += 1
        got = " ".join(x["text"] for x in mots[i:i + k])
        print(("  ok      " if n(got) == n(L["t"]) else "  ÉCART   ") + L["t"], "|", got)
        if not k:
            sys.exit(f"aucun mot reconnu pour : {L['t']}")
        par_phrase.append(mots[i:i + k]); i += k
    return par_phrase


def dialogue():
    """Le son de la fiche, lu à sa place et sans retouche : on le transcrit."""
    if not os.path.isfile(SOURCE):
        sys.exit(f"pas de son pour la fiche {CECRL} n° {FICHE} : {SOURCE}")
    print(f"dialogue : {LIEN} ({lufs(SOURCE):.1f} LUFS ; énoncés à {NIVEAU:.0f})")
    info = [{"qui": qui, "t": texte} for qui, texte in LIGNES["dialogue"]]
    for L, mots in zip(info, reperer(SOURCE, "dialogue", info)):
        # la phrase va du début de son premier mot à la fin de son dernier
        L.update(s=round(mots[0]["start"], 2), e=round(mots[-1]["end"], 2), w=debuts(mots))
    return {"fichier": LIEN, "fiche": f"fiches/dialogue/{CECRL}/{FICHE}.pdf",
            "methode": "transcription ElevenLabs (scribe_v1) du son de la fiche ; une phrase va du début de son premier mot à la fin de son dernier",
            "duree": round(duree(SOURCE), 2), "lignes": info}


def enonces():
    """Synthèse de chaque phrase, mise au même niveau, puis assemblage avec des silences."""
    with tempfile.TemporaryDirectory() as tmp:
        morceaux, pos, info = [], 0.0, []
        for k, (qui, texte) in enumerate(LIGNES["enonces"]):
            brut = os.path.join(tmp, f"enonces{k}.mp3"); wav = os.path.join(tmp, f"enonces{k}.wav")
            tts(qui, texte, brut)
            # on coupe le silence du début et de la fin, puis on met chaque phrase au même niveau
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-af",
                            "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                            "-ar", "44100", "-ac", "1", wav], check=True)
            g = NIVEAU - lufs(wav); norm = os.path.join(tmp, f"enonces{k}n.wav")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-af", f"volume={g:.2f}dB,alimiter=limit=0.89", norm], check=True)
            d = duree(norm); debut = pos + 0.25
            info.append({"qui": qui, "t": texte, "s": round(debut, 2), "e": round(debut + d, 2)})
            morceaux.append(norm); pos = debut + d + SILENCE - 0.25
        # assemblage : 0,25 s de silence avant chaque phrase, SILENCE entre deux phrases
        liste = os.path.join(tmp, "enonces.txt"); sil = os.path.join(tmp, "sil.wav"); sil2 = os.path.join(tmp, "sil2.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.25", sil], check=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(SILENCE - 0.25), sil2], check=True)
        with open(liste, "w", encoding="utf-8") as f:
            for m in morceaux:
                f.write(f"file '{sil}'\nfile '{m}'\nfile '{sil2}'\n")
        dst = os.path.join(ICI, "enonces.mp3")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", liste, "-b:a", "128k", dst], check=True)
    # repères des mots, depuis la transcription du fichier final
    for L, mots in zip(info, reperer(dst, "enonces", info)):
        L["w"] = debuts(mots)
    return {"duree": round(duree(dst), 2), "lignes": info}


PARTIES = {"dialogue": dialogue, "enonces": enonces}
demandees = sys.argv[1:] or list(PARTIES)
if set(demandees) - set(PARTIES):
    sys.exit(f"parties possibles : {', '.join(PARTIES)}")
chemin = os.path.join(ICI, "reperes.json")
reperes = json.load(open(chemin, encoding="utf-8")) if os.path.isfile(chemin) else {}
for nom in demandees:
    reperes[nom] = PARTIES[nom]()
reperes = {nom: reperes[nom] for nom in PARTIES if nom in reperes}
with open(chemin, "w", encoding="utf-8") as f:
    json.dump(reperes, f, ensure_ascii=False, indent=1)
print("à faire ensuite : reporter les repères dans index.html, puis node calcul-spectre.js")
