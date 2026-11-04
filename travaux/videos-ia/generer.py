#!/usr/bin/env python3
"""Génère en série les vidéos de mises en situation avec Gemini Omni Flash, sur fal.ai.

Chaque scène de scenes.json devient une vidéo réaliste de quelques secondes, avec ses voix
(dialogue en français, lèvres synchronisées). Le script envoie les scènes à la file d'attente
de fal.ai, plusieurs à la fois, attend chaque vidéo, la télécharge dans sorties/<thème>/<id>.mp4
et note tout dans sorties/journal.jsonl (une ligne par vidéo : identifiant fal, adresse,
durée, coût estimé). Une scène déjà téléchargée n'est pas relancée : on peut relancer le script
après une coupure, ou après avoir supprimé une vidéo ratée pour la refaire.

    python3 generer.py scenes.json --simulation        # les instructions et le coût, sans rien envoyer
    python3 generer.py scenes.json --essai 5 --budget 10
    python3 generer.py scenes.json --theme hotel --budget 40
    python3 generer.py scenes.json --budget 150        # tout
    python3 generer.py scenes.json --planches          # une planche par thème, pour choisir

Il faut la clé fal.ai dans la variable d'environnement FAL_KEY, et l'accès réseau à
queue.fal.run et aux domaines de fal.media (voir LISEZMOI.md).
"""
import argparse, json, os, sys, time, subprocess, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

MODELE = "google/gemini-omni-flash"
FILE = os.environ.get("FAL_FILE_URL", f"https://queue.fal.run/{MODELE}")   # remplaçable pour les essais hors ligne
PRIX_SECONDE = 0.125      # fal.ai, 720p : « environ 0,125 $ par seconde de vidéo » (facturé aux jetons)
MOTS_PAR_SECONDE = 2.6    # au-delà, le dialogue risque de ne pas tenir dans la durée
ATTENTE_MAX = 25 * 60     # secondes, par vidéo


# ------------------------------------------------------------------------------ les instructions
def instruction(theme, scene):
    """L'instruction envoyée au modèle, en français, composée du thème (lieu, personnages, style,
    repris à l'identique dans toutes ses scènes pour que les mêmes personnes reviennent) et de la
    scène (situation, dialogue)."""
    roles = "; ".join(f"{r} : {d}" for r, d in theme["personnages"].items())
    dialogue = " ".join(f"{r} : « {t} »" for r, t in scene["dialogue"])
    morceaux = [
        "Vidéo réaliste, filmée comme une scène de formation professionnelle, caméra stable, lumière naturelle.",
        theme.get("style", ""),
        f"Lieu : {theme['lieu']}.",
        f"Personnages : {roles}.",
        f"Situation : {scene['situation']}." if scene.get("situation") else "",
        f"Dialogue en français, voix naturelles, lèvres synchronisées, en champ-contrechamp : {dialogue}",
        "Pas de musique, pas de sous-titres, aucun texte à l'écran.",
    ]
    return " ".join(m for m in morceaux if m)


def scenes_a_faire(donnees, theme=None, essai=None):
    liste = [s for s in donnees["scenes"] if not theme or s["theme"] == theme]
    return liste[:essai] if essai else liste


def duree(donnees, scene):
    return int(scene.get("duree", donnees.get("duree", 8)))


def verifier(donnees, liste):
    """Thèmes inconnus, identifiants en double, dialogues trop longs pour leur durée."""
    erreurs, alertes, vus = [], [], set()
    for s in liste:
        if s["theme"] not in donnees["themes"]:
            erreurs.append(f"{s['id']} : thème inconnu « {s['theme']} »")
        if s["id"] in vus:
            erreurs.append(f"{s['id']} : identifiant en double")
        vus.add(s["id"])
        mots = sum(len(t.split()) for _, t in s["dialogue"])
        if mots > duree(donnees, s) * MOTS_PAR_SECONDE:
            alertes.append(f"{s['id']} : {mots} mots pour {duree(donnees, s)} s, le dialogue risque d'être coupé")
    return erreurs, alertes


# ------------------------------------------------------------------------------ fal.ai
def requete(url, cle, donnees=None):
    corps = json.dumps(donnees).encode() if donnees is not None else None
    req = urllib.request.Request(url, data=corps, method="POST" if corps else "GET",
                                 headers={"Authorization": f"Key {cle}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())


def telecharger(url, chemin):
    tmp = chemin + ".part"
    with urllib.request.urlopen(url, timeout=300) as r, open(tmp, "wb") as f:
        while bloc := r.read(1 << 16):
            f.write(bloc)
    os.replace(tmp, chemin)


def generer_une(donnees, scene, cle, sortie, format_):
    theme = donnees["themes"][scene["theme"]]
    d = duree(donnees, scene)
    trace = {"id": scene["id"], "theme": scene["theme"], "duree": d, "cout_estime": round(d * PRIX_SECONDE, 3),
             "date": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    try:
        envoi = requete(FILE, cle, {"prompt": instruction(theme, scene), "duration": d,
                                    "aspect_ratio": format_, "enable_safety_checker": True})
        trace["request_id"] = envoi.get("request_id")
        statut_url = envoi.get("status_url") or f"{FILE}/requests/{trace['request_id']}/status"
        reponse_url = envoi.get("response_url") or f"{FILE}/requests/{trace['request_id']}"
        debut = time.time()
        while True:
            statut = requete(statut_url, cle).get("status")
            if statut == "COMPLETED":
                break
            if statut not in ("IN_QUEUE", "IN_PROGRESS"):
                raise RuntimeError(f"statut inattendu : {statut}")
            if time.time() - debut > ATTENTE_MAX:
                raise TimeoutError("trop long, la demande reste sur fal.ai (voir request_id)")
            time.sleep(6)
        resultat = requete(reponse_url, cle)
        url = (resultat.get("video") or {}).get("url")
        if not url:
            raise RuntimeError(f"pas de vidéo dans la réponse : {json.dumps(resultat)[:300]}")
        trace["url"] = url
        dossier = os.path.join(sortie, scene["theme"])
        os.makedirs(dossier, exist_ok=True)
        telecharger(url, os.path.join(dossier, f"{scene['id']}.mp4"))
        trace["statut"] = "ok"
    except urllib.error.HTTPError as e:
        trace["statut"] = f"erreur HTTP {e.code} : {e.read().decode(errors='ignore')[:300]}"
    except Exception as e:                                  # noqa: BLE001 — on note et on continue
        trace["statut"] = f"erreur : {e}"
    return trace


# ------------------------------------------------------------------------------ planches
def planches(sortie):
    """Une image par thème : une vignette prise au milieu de chaque vidéo, avec son identifiant."""
    police = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    for theme in sorted(os.listdir(sortie)):
        dossier = os.path.join(sortie, theme)
        if not os.path.isdir(dossier):
            continue
        videos = sorted(f for f in os.listdir(dossier) if f.endswith(".mp4"))
        if not videos:
            continue
        vignettes = os.path.join(dossier, "_vignettes")
        os.makedirs(vignettes, exist_ok=True)
        for k, v in enumerate(videos):
            texte = os.path.splitext(v)[0].replace(":", r"\:")
            etiquette = f",drawtext=fontfile={police}:text='{texte}':x=12:y=12:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=6" if os.path.exists(police) else ""
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "3", "-i", os.path.join(dossier, v), "-frames:v", "1",
                            "-vf", f"scale=480:-2{etiquette}", os.path.join(vignettes, f"{k:03d}.jpg")], check=False)
        colonnes = min(5, len(videos))
        rangees = -(-len(videos) // colonnes)
        cible = os.path.join(sortie, f"planche-{theme}.jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(vignettes, "%03d.jpg"),
                        "-vf", f"tile={colonnes}x{rangees}:padding=6:color=white", "-frames:v", "1", cible], check=False)
        print("planche :", cible)


# ------------------------------------------------------------------------------ programme
def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("scenes")
    a.add_argument("--sortie", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "sorties"))
    a.add_argument("--theme")
    a.add_argument("--essai", type=int, help="seulement les N premières scènes")
    a.add_argument("--budget", type=float, help="plafond en dollars (coût estimé) ; obligatoire pour envoyer")
    a.add_argument("--simultanes", type=int, default=6, help="vidéos demandées en même temps")
    a.add_argument("--format", default="16:9", choices=["16:9", "9:16"])
    a.add_argument("--simulation", action="store_true", help="montre les instructions et le coût, n'envoie rien")
    a.add_argument("--planches", action="store_true", help="fabrique les planches des vidéos déjà téléchargées")
    o = a.parse_args()

    if o.planches:
        planches(o.sortie)
        return
    donnees = json.load(open(o.scenes, encoding="utf-8"))
    liste = scenes_a_faire(donnees, o.theme, o.essai)
    erreurs, alertes = verifier(donnees, liste)
    for x in alertes:
        print("attention,", x)
    if erreurs:
        sys.exit("\n".join(erreurs))
    deja = {s["id"] for s in liste if os.path.exists(os.path.join(o.sortie, s["theme"], f"{s['id']}.mp4"))}
    a_faire = [s for s in liste if s["id"] not in deja]
    cout = sum(duree(donnees, s) * PRIX_SECONDE for s in a_faire)
    print(f"{len(a_faire)} vidéo(s) à générer ({len(deja)} déjà faites), coût estimé {cout:.2f} $ "
          f"à {PRIX_SECONDE} $/s")

    if o.simulation:
        for s in a_faire:
            print(f"\n--- {s['id']} ({duree(donnees, s)} s)\n{instruction(donnees['themes'][s['theme']], s)}")
        return
    cle = os.environ.get("FAL_KEY")
    if not cle:
        sys.exit("FAL_KEY absente : ajoutez la clé fal.ai comme secret de l'environnement (voir LISEZMOI.md)")
    if o.budget is None:
        sys.exit("indiquez --budget (en dollars) : rien n'est envoyé sans plafond")
    if cout > o.budget:
        sys.exit(f"coût estimé {cout:.2f} $ au-dessus du budget {o.budget:.2f} $ : réduisez (--essai, --theme) ou relevez --budget")

    os.makedirs(o.sortie, exist_ok=True)
    journal = os.path.join(o.sortie, "journal.jsonl")
    bons = 0
    with ThreadPoolExecutor(max_workers=o.simultanes) as pool:
        taches = {pool.submit(generer_une, donnees, s, cle, o.sortie, o.format): s for s in a_faire}
        for t in as_completed(taches):
            trace = t.result()
            with open(journal, "a", encoding="utf-8") as f:
                f.write(json.dumps(trace, ensure_ascii=False) + "\n")
            bons += trace["statut"] == "ok"
            print(f"{trace['id']} : {trace['statut']}")
    print(f"\n{bons}/{len(a_faire)} vidéo(s) téléchargée(s) ; journal : {journal}")


if __name__ == "__main__":
    main()
