# Test de positionnement FLE (A1 à B1)

Tiré de la banque « Test de positionnement FLE – A1 à B1 – 200 questions » (fichier Excel fourni).

## Le test mobile, adaptatif

`test-positionnement.html` porte les **142 QCM** de la banque (les 58 productions écrites et orales,
corrigées à la main ou par IA, n'y entrent pas), avec tous leurs tags : N° de difficulté, niveau CECRL,
épreuve, tag grammaire-lexique, composante détaillée, critère du Tableau 3. Les sons et les deux photos sont
intégrés dans la page (3,8 Mo). Publié en artifact : https://claude.ai/artifact/RwuHp8y9B2T4wExdfhnyz1

Le moteur adaptatif. Le fichier dit seulement « Le moteur adaptatif peut piocher par niveau » ; ces règles
sont un choix, à valider :

- on commence en A1 ; chaque niveau est un palier de 7 questions piochées dans la banque de ce niveau :
  2 de compréhension orale, 2 de compréhension écrite, 2 d'expression écrite, 1 d'interaction orale ;
  dans chaque épreuve, l'une dans la moitié la plus facile du niveau (colonne N°), l'autre dans la plus
  difficile ; le palier se joue du plus facile au plus difficile ;
- 5 bonnes réponses sur 7 valident le niveau et ouvrent le suivant. Le palier se joue en entier pour que les
  4 épreuves soient vues ; il s'arrête plus tôt quand le niveau ne peut plus être validé (3 erreurs ou
  « Je ne sais pas »), et le test s'arrête là ;
- jamais deux questions sur le même document ou le même enregistrement dans un test ;
- niveau affiché : le dernier palier validé (« A1 en cours » si aucun). Le sous-score par épreuve et par tag
  grammaire-lexique, recommandé par le fichier, est calculé (`etat.diagnostic`) mais pas affiché au candidat.

Simulé sur 1 200 candidats : un débutant s'arrête après 3 à 4 questions, un A1 en fait 11 en moyenne, un A2
18, un B1 21 ; le niveau trouvé est le bon dans environ 95 % des cas.

Le reste :
- l'ordre des réponses est mélangé (le fichier le permet) ; 2 écoutes par enregistrement (choix de mise en page) ;
- en A1, chaque question a un bouton qui lit la consigne, et, pour CO-06 et CO-10 (« Audio + pictos »),
  les pictogrammes de réponse, comme le demande le fichier pour les publics peu lecteurs ;
- les 8 QCM à visuel (panneaux, étiquette, affiche, menu, plaque) sont dessinés dans la page ;
- photos des deux répliques : Unsplash (licence libre), Marcos Paulo Prado et BaljkanN4.

`banque/` : `construire.py` lit le fichier Excel (exporté en JSON) et produit `banque.json` (questions, tags,
présentation) ; `assembler.py` les injecte dans la page avec les sons. Les chemins en tête des scripts
pointent vers le dossier de travail de la session : à adapter pour les relancer.

## La page à partager

`index.html` est le même test en page web, publiée par Vercel avec le reste du dépôt :
https://onlineformapro-website.vercel.app/travaux/positionnement-fle/

La seule différence avec l'artifact : les sons ne sont pas intégrés, ce sont les MP3 du dossier `sons/`, chargés
quand la question s'affiche (page de 160 Ko au lieu de 3,8 Mo). Elle se refait à partir de l'artifact avec
`banque/page-web.py` (mode d'emploi en tête du script). Le site est en « noindex » (vercel.json) :
la page ne sort pas dans les moteurs de recherche, seules les personnes qui ont le lien y accèdent.

## Les sons (ElevenLabs)

`sons/` porte un MP3 par question audio de la banque : 88 fichiers, nommés par identifiant
(`CO-02.mp3`, `EO-17.mp3`…). Les 50 de compréhension orale, les 15 phrases à entendre et les
23 consignes lues de l'expression orale. `sons/consignes-a1/` porte les 39 consignes A1 lues
et `sons/pictos/` les 8 libellés des pictogrammes de CO-06 et CO-10.

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
