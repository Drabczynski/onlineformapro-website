"""Activités FLE : les sons lus par ElevenLabs pour l'ouverture des jeux de rôle et pour les mots à composer.

    python3 travaux/activites-fle/generer_jeux.py

- medias/jeux/<id>.mp3 : « Jeu de rôle. <la situation> L'autre personne : <le rôle> », lu au début de chaque jeu de rôle
  (EO-23, 24, 25, 27, 39, 40, 41), pendant l'animation d'ouverture. Textes de l'Excel, mot pour mot.
- medias/mots/<mot>.mp3 : un mot seul, pour composer un mot qu'on entend (« bonjour », EE-06).

Même voix et mêmes réglages que generer_questions.py (Claire, Eleven Multilingual v2, débit selon le niveau, volume
égalisé, MP3 mono 48 kb/s). Un son déjà fait pour le même texte n'est pas redemandé. Puis lancer generer_temps.py
(les mots qui s'allument) et construire.py.
La clé ElevenLabs n'est pas dans le dépôt : c'est un secret réseau de l'environnement (hôte api.elevenlabs.io).
"""
import hashlib, json, os, re, subprocess, tempfile
from generer_questions import tts, DEBIT

ICI = os.path.dirname(os.path.abspath(__file__))
MOTS = {"bonjour": "A1"}          # les mots à composer qu'on entend


def texte_role(role):
    """Le rôle de l'autre personne tel qu'il s'affiche : sans « Rôle de l'interlocuteur : », avec une majuscule."""
    r = re.sub(r"^Rôle de l'interlocuteur\s*:\s*", "", role or "", flags=re.I)
    r = re.sub(r"^Questions du recruteur\s*:\s*", "Le recruteur demande : ", r, flags=re.I)
    return r[:1].upper() + r[1:]


def texte_jeu(a):
    return f"Jeu de rôle. {a['consigne'].strip()} L'autre personne : {texte_role(a['role'])}"


def produire(chemin, texte, niveau):
    trace = chemin + ".txt"; empreinte = hashlib.sha1(f"{texte}|{niveau}".encode()).hexdigest()
    if os.path.exists(chemin) and os.path.exists(trace) and open(trace).read() == empreinte: return "déjà fait"
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        brut = os.path.join(d, "brut.mp3"); tts(texte, DEBIT.get(niveau, .9), brut)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ac", "1", "-ar", "44100", "-b:a", "48k", chemin], check=True)
    open(trace, "w").write(empreinte)
    return "fait"


def main():
    A = json.load(open(os.path.join(ICI, "donnees", "activites.json"), encoding="utf-8"))
    for a in A:
        if a.get("type") == "oral" and a.get("sous") == "role":
            print(a["id"], produire(os.path.join(ICI, "medias", "jeux", a["id"] + ".mp3"), texte_jeu(a), a.get("niveau")))
    for m, niv in MOTS.items():
        print(m, produire(os.path.join(ICI, "medias", "mots", m + ".mp3"), m.capitalize() + ".", niv))


if __name__ == "__main__":
    main()
