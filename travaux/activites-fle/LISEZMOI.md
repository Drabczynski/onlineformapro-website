# Activités FLE (prototype)

Prototype de produit fini : des activités d'entraînement tirées de l'Excel « Test de positionnement FLE – A1 à B1 –
200 questions ». Ce n'est pas un test : rien n'est adaptatif, chaque réponse est corrigée tout de suite.

- Page web : https://onlineformapro-website.vercel.app/travaux/activites-fle/ (site en « noindex »).
- Artefact : https://claude.ai/artifact/VVuyxMQGPpX1N5ANSqdjLL, publié à partir de `artefact.html` avec les fichiers de
  `medias/` à côté (la liste est dans `donnees/medias.json`).

## Ce que fait la page

L'accueil propose une **série de 8 activités tirées au hasard** (un « medley ») : 2 vidéos, 2 lectures, 1 série de
grammaire, 1 texte à écrire, 2 réponses orales (dont souvent un jeu de rôle ou une image), parfois « Que dites-vous ? ».
Jamais deux activités du même type à la suite. Les pastilles A1, A2, B1 limitent le tirage à un niveau ; le bouton
« hasard » de la barre du bas tire une nouvelle série. Au premier tirage, la vidéo de démonstration ouvre la série.

| Type | Nombre | Contenu |
|---|---|---|
| Vidéo | 32 | 31 enregistrements de compréhension orale de l'Excel (50 questions) et la vidéo de démonstration |
| Lecture | 24 | les documents de compréhension écrite (50 questions) : annonces, courriels, affiches, SMS, menu, plaque… |
| Grammaire | 9 | les 38 QCM d'expression écrite, en séries de 4 ou 5 par niveau |
| Que dites-vous ? | 1 | les 4 QCM d'expression orale (une situation, une réplique) |
| Écriture | 12 | les productions écrites : zone de texte, compteur de mots, objectif de l'Excel |
| Oral | 46 | les productions orales : répéter, répondre, décrire une image, parler d'un sujet, jeu de rôle |

En tout 124 activités, 144 questions à choix (142 de l'Excel et 2 pour la démonstration) et les 58 productions.

- **QCM** : on choisit, on valide ; la bonne réponse s'affiche en vert, l'erreur en rouge, puis la question suivante.
  Pour les vidéos, la transcription s'ouvre après la première réponse.
- **Écriture et oral** : l'apprenant écrit ou s'enregistre au micro (le navigateur demande l'autorisation ; si le micro
  n'est pas disponible, il dit sa réponse à voix haute), puis il voit **un exemple de réponse** et coche les points
  « Vérifiez votre réponse ». À l'oral, l'exemple est aussi lu à voix haute.
- **Bilan** : bonnes réponses, textes écrits, réponses orales, et la liste de la série.
- La série et les activités faites sont gardées dans le navigateur.

## Les vidéos

L'Excel ne contient pas de vidéo : **les vidéos seront fournies.** En attendant, chaque activité « Vidéo » affiche le
lecteur avec une photo (qui pose le lieu sans souffler la réponse) et joue le son de l'enregistrement ; un bandeau dit
« Vidéo à venir · photo et son ». Pour brancher une vraie vidéo : la déposer dans `medias/video/`, puis renseigner
`"video"` (et `"poster"`) pour l'activité concernée dans `construire.py`, comme pour la démonstration.

**La vidéo de démonstration** (« À l'hôtel ») est la scène générée avec Gemini fournie le 4 novembre : elle montre le
vrai lecteur, avec des sous-titres calés phrase par phrase (bouton « CC ») retrouvés par la reconnaissance vocale
d'ElevenLabs. Ses 2 questions ont été écrites d'après son dialogue : **elle ne vient pas de l'Excel.**

## Les modèles de réponse

L'Excel donne les consignes et les critères de l'examinateur, pas de réponse type : les 58 modèles et les points
« Vérifiez » ont été écrits par l'IA (`donnees/modeles.json`), au niveau et à la longueur demandés, avec des
personnages neutres. **À faire relire par un formateur.** Points déjà repérés :
- EO-13 (photo de famille) et EO-28 (marché) décrivent la photo affichée ; la photo de famille montre un grand-père,
  une grand-mère et trois enfants, pas « des parents, deux enfants, une grand-mère » comme dans l'Excel ;
- les monologues A2 font 90 à 100 mots (environ 45 s) pour 1 minute demandée, pour rester imitables ;
- quelques œuvres ou faits réels : EO-42 cite le film *Intouchables*, EO-34 l'Aïd el-Fitr en Tunisie, EO-45 la carte
  Vitale et le 15 ;
- EE-31, EE-32, EE-49 accordent au féminin (« désolée », « allée »), les points « Vérifiez » rappellent les deux formes.

Les modèles oraux sont lus par ElevenLabs (`generer_modeles.py`, modèle Eleven Multilingual v2, voix du premier test :
Claire pour une femme, Guillaume pour un homme selon le personnage, Lucie ou Marc pour l'interlocuteur des jeux de
rôle ; débit 0,85 en A1, 0,95 en A2, 1 en B1). Chacun a été retranscrit par la reconnaissance vocale et comparé à son
texte : la première voix d'homme (Theo) ajoutait des « euh », elle a été remplacée.

## Fichiers

- `construire.py` : construit `index.html` (page web) et `artefact.html` (le même contenu, sans en-tête, pour
  l'artefact) à partir de `page.html` (le gabarit : style et code) et des données.
- `donnees/excel-200.json` : les 200 lignes de l'Excel ; les QCM mis en forme viennent de
  `../positionnement-fle/banque/banque.json` ; `donnees/modeles.json` ; `donnees/video-hotel-sous-titres.json` ;
  `donnees/activites.json` (produit) ; `donnees/medias.json` (la liste des fichiers à publier avec l'artefact).
- `medias/sons/` : les sons du premier test (enregistrements, consignes et phrases de l'oral) ; `medias/modeles/` :
  les modèles lus ; `medias/photos/` : les photos (celles du positionnement, Unsplash, plus `famille` par Daria
  Trofimova et `atelier` par Shavr IK, Unsplash) ; `medias/video/` : la démonstration.

    python3 travaux/activites-fle/construire.py         # refait la page
    python3 travaux/activites-fle/generer_modeles.py    # refait les modèles lus qui ont changé

## Le style

Thème clair et coloré, d'après la référence montrée le 12 novembre : fond en dégradé pastel (bleu, lilas, rose) qui
dérive lentement, cartes en verre dépoli, tuiles de couleur selon le type (photo pour la vidéo, blanc et bleu pour la
lecture, menthe et police à points pour la grammaire, jaune et serif pour l'écriture, pervenche et onde pour l'oral,
rose pour « Que dites-vous ? »), grands titres blancs, pastille active jaune, barre d'action flottante. Aucune ombre
portée. Polices Outfit, Instrument Serif et Doto (Google Fonts).
