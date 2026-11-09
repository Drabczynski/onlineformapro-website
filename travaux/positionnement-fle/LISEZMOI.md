# Test de positionnement FLE (A1 à B1)

Tiré de la banque « Test de positionnement FLE – A1 à B1 – 200 questions » (fichier Excel fourni).

## Le test mobile

`test-positionnement.html` : 20 questions de la banque (7 A1, 7 A2, 6 B1), toutes les
épreuves, dans une interface de jeu en alvéoles. Les sons et les deux photos sont intégrés
dans la page. Publié en artifact : https://claude.ai/artifact/RwuHp8y9B2T4wExdfhnyz1

- Questions, réponses et bonnes réponses : identiques au fichier (vérifié champ par champ).
- Niveau atteint : le plus haut niveau validé sans trou, avec un seuil de 5 bonnes sur 7 en A1,
  5 sur 7 en A2 et 4 sur 6 en B1. Ces seuils ne viennent pas du fichier, ils sont à valider.
- Deux écoutes par enregistrement : choix de mise en page, absent du fichier.
- Photos des deux répliques : Unsplash (licence libre), Marcos Paulo Prado et BaljkanN4.

## Les sons (ElevenLabs)

`sons/` porte un MP3 par question audio de la banque : 88 fichiers, nommés par identifiant
(`CO-02.mp3`, `EO-17.mp3`…). Les 50 de compréhension orale, les 15 phrases à entendre et les
23 consignes lues de l'expression orale. `sons/consignes-a1/` porte les 6 consignes A1 lues
dans le test de 20 questions.

`sons.csv` (séparateur « ; ») dit, pour chaque fichier : l'épreuve, le niveau, le média,
la voix ElevenLabs, le débit, la durée et le texte lu. Quand plusieurs questions portent sur
le même enregistrement (CO-18, CO-19 et CO-20 par exemple), la colonne
« meme_enregistrement_que » le dit et le fichier est identique.

- Modèle : Eleven Multilingual v2, en français.
- Débit : 0,85 en A1, 0,95 en A2, 1 en B1 (« débit lent en A1, naturel en B1 », mode d'emploi
  du fichier). EO-12 est à 1,2 : le fichier demande un débit rapide.
- Dialogues : une voix par réplique, assemblées avec 0,45 s de silence.
- Volume égalisé (loudnorm, −16 LUFS), MP3 mono 64 kb/s.
- Chaque son a été retranscrit par la reconnaissance vocale d'ElevenLabs et comparé au texte :
  tous disent leur texte en entier.

## Refaire un son

`generer_sons.py` lit une liste (`sons-banque.json`, `sons-test20.json`) et appelle l'API
ElevenLabs. La clé n'est pas dans le dépôt : c'est un secret réseau de l'environnement cloud,
hôte `api.elevenlabs.io`, en-tête `xi-api-key`. Pour refaire un son, supprimer ses fichiers
dans `brut/` et `mp3/`, changer la voix ou le texte dans la liste, puis :

    python3 generer_sons.py sons-banque.json

`copies.json` dit quelles questions reprennent l'enregistrement d'une autre.
