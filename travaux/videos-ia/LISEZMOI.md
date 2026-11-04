# Vidéos de mises en situation, générées par l'IA

Des scènes réalistes de quelques secondes, avec leurs voix (dialogue en français, lèvres
synchronisées), comme celle produite dans Gemini pour l'accueil à l'hôtel. Objectif : environ
20 scènes par thème, pour 5 thèmes.

## Le modèle

**Gemini Omni Flash** (Google), celui qu'utilise l'application Gemini (« Gemini Omni 1.1 Flash
utilisé » dans les détails de la réponse), appelé par l'API de fal.ai : `google/gemini-omni-flash`.

- Entrées : l'instruction, la durée en secondes (8 par défaut), le format 16:9 ou 9:16.
- Prix affiché par fal.ai (relevé le 4 novembre 2026) : facturé aux jetons, 21,875 $ le million,
  soit **environ 0,125 $ par seconde de vidéo en 720p** : 1 $ la scène de 8 s, environ 100 $
  les 100 scènes, plus les essais refaits.

## Ce qu'il faut dans l'environnement

1. **La clé fal.ai**, en secret de l'environnement, sous le nom `FAL_KEY` (menu de
   l'environnement cloud, Edit, Network secrets ou variable d'environnement). Elle n'est prise
   en compte que dans une nouvelle session. Ne jamais la coller dans une conversation.
2. **Le réseau** : `fal.ai`, `queue.fal.run`, `fal.run`, `fal.media`, `v3.fal.media` et
   `v3b.fal.media` (les vidéos sont servies depuis ces derniers).

## Les scènes

`scenes-exemple.json` montre la structure. Chaque thème décrit une fois son lieu, ses
personnages (repris à l'identique dans toutes ses scènes, pour que les mêmes personnes
reviennent) et son style ; chaque scène a un identifiant, une situation et son dialogue. Compter
environ 2,5 mots par seconde : 8 s, c'est une vingtaine de mots. Le script prévient quand un
dialogue est trop long pour sa durée.

## Lancer

    python3 generer.py scenes.json --simulation          # les instructions et le coût, rien n'est envoyé
    python3 generer.py scenes.json --essai 5 --budget 10 # un essai sur 5 scènes
    python3 generer.py scenes.json --budget 150          # tout, 6 vidéos à la fois
    python3 generer.py scenes.json --planches            # une planche par thème, pour choisir

Rien n'est envoyé sans `--budget` ; le script s'arrête si le coût estimé le dépasse. Les vidéos
arrivent dans `sorties/<thème>/<id>.mp4` (hors du dépôt git, trop lourdes) et chaque demande est
notée dans `sorties/journal.jsonl`, avec l'adresse de la vidéo sur fal.ai. Une scène déjà
téléchargée n'est pas refaite : pour en refaire une, supprimer son fichier et relancer.

Le script a été essayé contre un faux service fal.ai local (envoi, attente, téléchargement,
erreur notée sans arrêter les autres, relance) ; `FAL_FILE_URL` sert à ces essais.
