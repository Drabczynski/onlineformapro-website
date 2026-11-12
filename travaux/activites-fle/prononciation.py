"""Activités FLE : la prononciation des mots que la synthèse vocale lit mal.

La voix lisait « Vésoul » ; on dit « Veusoul ». Le texte affiché ne change pas : seule l'écriture envoyée à la
synthèse (ElevenLabs) est remplacée. generer_modeles.py et generer_questions.py passent par prononcer().

    python3 travaux/activites-fle/prononciation.py

refait les deux sons venus du premier test où le mot est dit (medias/sons/CO-35.mp3 et EO-02.mp3), avec la même voix
et le même débit que dans ../positionnement-fle/sons-banque.json. Relancer ensuite generer_temps.py puis construire.py.
La clé ElevenLabs n'est pas dans le dépôt : c'est un secret réseau de l'environnement (hôte api.elevenlabs.io).
"""
import json, os, re, subprocess, tempfile

ICI = os.path.dirname(os.path.abspath(__file__))
PRONONCIATION = {"Vesoul": "Veusoul"}
MODELE = "eleven_multilingual_v2"
VOIX = {"fred": "Q8X0Kxovj3a14eDLmt2l", "julie": "3QTOBj0N6SRUYK2WEGIP"}
DEBIT = {"A1": .85, "A2": .95, "B1": 1.0}
SONS = ["CO-35", "EO-02"]


def prononcer(texte):
    for ecrit, dit in PRONONCIATION.items():
        texte = re.sub(rf"\b{re.escape(ecrit)}\b", dit, texte)
    return texte


def refaire(son):
    (voix, texte), = son["repliques"]
    corps = json.dumps({"text": prononcer(texte), "model_id": MODELE, "language_code": "fr",
                        "voice_settings": {"stability": .5, "similarity_boost": .8, "style": 0, "use_speaker_boost": True,
                                           "speed": son.get("debit", DEBIT[son["niveau"]])}}, ensure_ascii=False)
    with tempfile.TemporaryDirectory() as d:
        brut = os.path.join(d, "brut.mp3")
        r = subprocess.run(["curl", "-sS", "-o", brut, "-w", "%{http_code}", "-X", "POST",
                            f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX[voix]}?output_format=mp3_44100_128",
                            "-H", "Content-Type: application/json", "--data-binary", corps], capture_output=True, text=True)
        if r.stdout != "200": raise RuntimeError(f"{son['id']} : HTTP {r.stdout} {open(brut, errors='ignore').read()[:200]}")
        dest = os.path.join(ICI, "medias", "sons", son["id"] + ".mp3")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-filter_complex",
                        "[0:a]aresample=44100,aformat=channel_layouts=mono[a0];[a0]loudnorm=I=-16:TP=-1.5:LRA=11[o]",
                        "-map", "[o]", "-ar", "44100", "-ac", "1", "-b:a", "64k", dest], check=True)
    return dest


if __name__ == "__main__":
    banque = {s["id"]: s for s in json.load(open(os.path.join(ICI, "..", "positionnement-fle", "sons-banque.json"), encoding="utf-8"))}
    for i in SONS:
        print(i, os.path.getsize(refaire(banque[i])) // 1024, "Ko")
