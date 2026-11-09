"""Génère les sons du test de positionnement avec ElevenLabs (clé injectée par le proxy de l'environnement).
Chaque son = une ou plusieurs répliques (voix, texte) ; les répliques sont assemblées avec un court silence,
puis le volume est égalisé (loudnorm) et le tout encodé en MP3 mono 64 kb/s, nommé par identifiant."""
import json, subprocess, sys, os, pathlib
MODELE = "eleven_multilingual_v2"
VOIX = {
    "consigne": "NgOpYRnxMldnH8FmqCdL",   # Neutre-FLE
    "delf_f": "kqDoLMn4s9NsNFh5MHOi",     # DELF_Voix_Femme
    "marc": "Dla3WGY1SmXh3Q3svPFL",       # Marc - Formateur FR posé
    "lucie": "YxrwjAKoUKULGd0g8K9Y",      # Lucie - Professional Customer Care Agent
    "koraly": "F1toM6PcP54s45kOOAyV",     # Koraly - Expressive and Engaging
    "theo": "NyxenPOqNyllHIzSoPbJ",       # Theo - Smart, warm, open
    "marcel": "kENkNtk0xyzG09WW40xE",     # Marcel - Warm and Conversational
    "maxence": "GGkMUTZaJ8IyPwaHimUq",    # Maxence
    "claire": "NEjemlRxgWmL5ZGJetsB",     # Claire - Conversationnel
    "emilie": "d3AXX0BlgJHYFCuH9X88",     # Emilie - Friendly podcast voice
    "julie": "3QTOBj0N6SRUYK2WEGIP",      # Julie - Formatrice FR claire
    "anne": "SCnOghM2W7PGMTm9LvgX",       # Anne - Formatrice FR rassurante
    "christine": "uFA9UGUhpwqGjVhz3lA2",  # Christine
    "camille": "Da9VfudgKUvFOKayCiue",    # Camille - Social media and commercials
    "victoria": "WeAAwKYcS06VmXw086yZ",   # Victoria - Warm and calm
    "marine": "dzKt73kkmFQQ0Qnznorl",     # Marine B
    "alicia": "sQfOhaIRbFZ7R8bP1x9f",     # Alicia
    "aurel": "X91kq0xypSEbSMQwWKmf",      # Aurel - Super Realistic & Client Support
    "seb35": "BUJMBsQ3Oq4cEeWSb48y",      # Sébastien, voix française homme 35 ans
    "thomas": "e18dMYHSYQ18rN5m989D",     # Thomas San
    "nicolas_info": "iCKVfVbyCo5AAswzTkkX", # Nicolas - Informative Presenter
    "fred": "Q8X0Kxovj3a14eDLmt2l",       # Fred - Radio Host
    "guillaume": "ohItIVrXTBI80RrUECOD",  # Guillaume - Narration and voiceover
    "eric": "9osbeK6KzhDRV0yX4rTq",       # Eric - Calm, Low & Reflective
    "sebastien": "imDSDag6GbkW8mdzqJ0D",  # Sébastien - French
}
DEBIT = {"A1": .85, "A2": .95, "B1": 1.0}
SORTIE = pathlib.Path("mp3"); SORTIE.mkdir(exist_ok=True)
BRUT = pathlib.Path("brut"); BRUT.mkdir(exist_ok=True)

def tts(voix, texte, debit, chemin):
    if chemin.exists() and chemin.stat().st_size > 1000: return
    corps = json.dumps({"text": texte, "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .5, "similarity_boost": .8, "style": 0, "use_speaker_boost": True, "speed": debit}})
    r = subprocess.run(["curl", "-sS", "-o", str(chemin), "-w", "%{http_code}", "-X", "POST",
                        f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX[voix]}?output_format=mp3_44100_128",
                        "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
    if r.stdout != "200":
        msg = chemin.read_text(errors="ignore")[:300] if chemin.exists() else r.stderr
        chemin.unlink(missing_ok=True)
        raise RuntimeError(f"{chemin.name}: HTTP {r.stdout} {msg}")

def produire(son):
    morceaux = []
    for k, (voix, texte) in enumerate(son["repliques"]):
        c = BRUT / f"{son['id']}-{k}.mp3"; tts(voix, texte, son.get("debit", DEBIT[son["niveau"]]), c); morceaux.append(c)
    entrees, filtre = [], ""
    for k, c in enumerate(morceaux):
        entrees += ["-i", str(c)]
    # silence de 0,45 s entre les répliques
    parts = []
    for k in range(len(morceaux)):
        parts.append(f"[{k}:a]aresample=44100,aformat=channel_layouts=mono[a{k}]")
    chaine = "".join(f"[a{k}]" + ("[s]" if False else "") for k in range(len(morceaux)))
    if len(morceaux) > 1:
        sil = "".join(f"[a{k}]apad=pad_dur=0.45[p{k}];" for k in range(len(morceaux) - 1))
        concat = "".join(f"[p{k}]" for k in range(len(morceaux) - 1)) + f"[a{len(morceaux)-1}]"
        filtre = ";".join(parts) + ";" + sil + f"{concat}concat=n={len(morceaux)}:v=0:a=1[c];[c]loudnorm=I=-16:TP=-1.5:LRA=11[o]"
    else:
        filtre = parts[0] + ";[a0]loudnorm=I=-16:TP=-1.5:LRA=11[o]"
    dest = SORTIE / f"{son['id']}.mp3"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *entrees, "-filter_complex", filtre, "-map", "[o]", "-ar", "44100", "-ac", "1", "-b:a", "64k", str(dest)], check=True)
    d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dest)], capture_output=True, text=True).stdout.strip()
    return dest, float(d)

if __name__ == "__main__":
    sons = json.load(open(sys.argv[1]))
    car = sum(len(t) for s in sons for _, t in s["repliques"])
    print(len(sons), "sons,", car, "caractères")
    for s in sons:
        try:
            dest, d = produire(s); print(f"  {s['id']:14} {d:5.1f} s  {dest.stat().st_size // 1024} Ko")
        except Exception as e:
            print("  ERREUR", s["id"], e)
