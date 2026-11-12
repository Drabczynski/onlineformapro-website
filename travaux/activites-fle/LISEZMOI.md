# Activités FLE (prototype)

Prototype de produit fini : des activités d'entraînement tirées de l'Excel « Test de positionnement FLE – A1 à B1 –
200 questions ». Ce n'est pas un test : rien n'est adaptatif, chaque réponse est corrigée tout de suite.

- Page web : https://onlineformapro-website.vercel.app/travaux/activites-fle/ (site en « noindex »).
- Artefact : https://claude.ai/artifact/VVuyxMQGPpX1N5ANSqdjLL, publié à partir de `artefact.html` avec les fichiers de
  `medias/` à côté (la liste est dans `donnees/medias.json`).
- Versions gardées pour comparer (même adresse, suivie du dossier) : `v1/` (tuiles et cartes en thème clair) et
  `v2-violet/` (la version 2 sur fond violet → bleu, exactement comme le premier positionnement).

## État actuel (retours du 12 novembre)

- **Minimalisme** : tout sur un axe ; le violet seul en accent, le vert pour continuer et pour le juste, le rose pour le
  faux ; le retour (« Bravo ! ») centré au-dessus d'un seul bouton ; pas de barre de suivi ; pas de zoom sur les
  photos ; confettis au bilan seulement ; police Lexend (dessinée pour la facilité de lecture).
- **Deux encarts sur un fond pastel** : six ambiances (lilas → pêche, ciel → lilas, lagon, rose → bleu, menthe,
  pêche → rose) qui changent d'une question à l'autre. À gauche, la photo dans son cadre arrondi, jamais recouverte
  d'un voile ; à droite, une carte de verre dépoli avec la question et les réponses. Ce qui se pose sur la photo :
  le document à lire (carte postale, panneau, liste…), la phrase à compléter en grammaire (le mot choisi vole de la
  carte de droite jusqu'au trou, à gauche), la bulle de l'interlocuteur, et l'exemple après la prise de parole.
  Une photo à décrire (« Regardez la photo ») se voit en entier, dans un cadre à sa forme. Pas d'ombre portée.
  Seule la vidéo reste en plein écran. Départ plus court (rideau d'environ une seconde). Vidéo : la question et les réponses au centre de
  l'image floutée. Lecture : le document d'abord seul sur sa photo, en grand, puis la question (après quelques
  secondes, ou en touchant le document).
- **Haut-parleur** discret au bout de chaque question et consigne : les 181 textes sont lus par ElevenLabs
  (`generer_questions.py`, voix de Claire), avec les mots qui s'allument.
- **Écrire** : un titre court, la consigne en petit, un support adapté (lignes à compléter en A1, téléphone, liste de
  courses, courriel, forum) et des débuts de phrase à toucher (`donnees/aides-ecriture.json`, écrits par l'IA, à
  relire). Après « J'ai fini » : le texte écrit et un exemple, sans liste à cocher.
- **Parler** : une petite consigne, la phrase ou la question en grand, le micro ; l'exemple (son et texte) après
  l'enregistrement.
- **Photos** : les photos du positionnement retéléchargées en 1800 px (même cadrage), `primeur` et `fromagerie`
  remplacées, et 31 photos d'ambiance Unsplash pour les écrans sans image (`donnees/habillage.json` ; auteurs et
  liens dans `donnees/credits-photos.json`). Seule `appartement` (photo fournie) reste en 640 px.
  Revue du 12/11, chaque photo regardée face à son texte : CE-11 (carte postale) prend une vue de Nice, EE-12
  (« J'achète deux… ») un étal de pommes, CO-15 (« Je suis cuisinier ») une salle de restaurant, CO-10 (« Il neige »)
  une personne à la fenêtre, vue de l'intérieur (ni soleil ni neige : la photo ne contredit pas et ne souffle pas la
  réponse), CO-33 le vieux Lyon, CO-21 (annonce du magasin) un rayon de supermarché sans fruits, EE-17 le même rayon.
  Puis : CE-06 (fiche d'inscription) une main qui remplit une fiche, CO-07 (« Quel jour est le rendez-vous ? ») une
  secrétaire à l'accueil devant son agenda, CO-17 (les cheveux d'Amina) des mains qui tiennent des photos, sans visage.
  Puis : CO-14 (« thé ou café ? ») deux amies à la maison avec des tasses dont on ne voit pas le contenu, EO-08
  (« Vous avez des frères et sœurs ? ») un frère et une sœur.
- **Sur la photo** : le SMS est une carte à la taille du message, posée en bas pour laisser voir le visage, et il
  arrive plus vite. L'exemple oral s'affiche toujours à gauche ; pour une photo à décrire, il s'accroche au bas de
  la photo, qui remonte pour lui laisser la place. Le micro est écarté de la consigne.

## Ce que fait la page (version 2)

Une seule chose à la fois. L'accueil montre la série comme un chemin de tuiles hexagonales : **sept rubriques**
(Regarder, Écouter, Lire, Compléter, Répondre, Écrire, Parler), dans un ordre tiré au hasard, et **2 ou 3 questions
dans chacune** (2 pour Regarder et Écrire), soit 14 à 19 questions. Le rideau ne passe qu'entre deux rubriques ; à
l'intérieur d'une rubrique, la question suivante arrive directement. Les questions d'un même document ou d'un même
enregistrement restent ensemble ; en grammaire et dans « Répondre », chaque question a son écran et sa photo. Les
pastilles A1, A2, B1 limitent le tirage à un niveau (« Répondre » n'a que quatre questions : s'il n'y en a qu'une au
niveau choisi, elle est complétée par une question d'un niveau voisin). Le bouton « hasard » tire une nouvelle série.
Quitter au milieu d'une rubrique la reprend où on en était. La série est gardée dans le navigateur sous la clé
`activites-fle-3`.

**Regarder, la vidéo interactive** : la vidéo s'arrête d'elle-même juste après le passage utile, la question se pose
sur l'image, puis la vidéo repart jusqu'à la question suivante (les moments d'arrêt sont dans `ARRETS`, dans
`construire.py`). Il n'y a pour l'instant qu'**une vraie vidéo** (« À l'hôtel », 10 secondes) : elle revient donc dans
chaque série. Les autres scènes se génèrent avec `../videos-ia/` (clé `FAL_KEY`, environ 1 $ la scène de 8 secondes).

**Autres points de cette version** : l'invitation (CE-15) sort d'une enveloppe qui s'ouvre ; pour écrire un SMS, la
zone de saisie prend toute la largeur, il n'y a plus que trois débuts de phrase, sans « … » ni « (e) » à effacer, et
toucher une deuxième fois un début de phrase le retire du texte ; au bilan, le score est écrit en grand dans
l'hexagone ; la synthèse vocale dit « Veusoul » pour Vesoul (`prononciation.py`, huit sons refaits).

Chaque question est annoncée par un rideau (un grand mot : Regardez, Écoutez, Lisez, Complétez, Écrivez, Parlez,
Répétez, Répondez), puis occupe tout l'écran :

- **Vidéo** : l'image en grand ; la question s'affiche pendant l'écoute ; à la fin, les réponses arrivent. Après la
  réponse, « Le texte » rejoue l'enregistrement et allume les mots au fil de la voix.
- **Lecture** : le document posé comme un objet (panneau suspendu qui se balance, téléphone où le SMS s'écrit,
  étiquette de prix, plaque, ardoise, affiche, fiche, lettre) et la question à côté.
- **Grammaire** : la phrase en très grand ; la réponse choisie vole jusqu'au trou.
- **Que dites-vous ?** : une petite conversation ; la personne parle (points de suspension, puis la bulle et la voix),
  on choisit sa réplique, qui part comme un message.
- **Écrire** : une feuille blanche, une jauge de mots qui se remplit jusqu'à l'objectif de l'Excel ; puis le texte écrit
  à côté d'un exemple, et les points « Vérifiez votre réponse » à cocher.
- **Parler** : la consigne ou la phrase lue (les mots s'allument), un gros bouton micro avec un halo qui bouge avec la
  voix et un anneau qui avance jusqu'à la durée demandée ; puis « Ma voix » et l'exemple lu, réplique par réplique
  pour les jeux de rôle. Sans micro (dans l'artefact, le micro est bloqué), le bouton lance un minuteur : on parle à
  voix haute.
- **Bilan** : une médaille hexagonale avec le score, des étoiles, des confettis.

Des sons accompagnent chaque geste (synthétisés dans la page, sans fichier ; bouton pour les couper). Les touches 1 à 4
répondent, Entrée continue, Espace lit ou arrête le son. La série et les réponses sont gardées dans le navigateur.

| Banque | Nombre |
|---|---|
| Vidéo | 32 enregistrements (50 questions de compréhension orale) et la vidéo de démonstration |
| Lecture | 24 documents (50 questions de compréhension écrite) |
| Grammaire | les 38 QCM d'expression écrite |
| Que dites-vous ? | les 4 QCM d'expression orale |
| Écrire | 12 productions écrites |
| Parler | 46 productions orales |

## Les vidéos

L'Excel ne contient pas de vidéo : **les vidéos seront fournies.** En attendant, chaque activité « Vidéo » affiche une
photo (qui pose le lieu sans souffler la réponse) et joue le son de l'enregistrement, avec une onde qui suit la voix ;
un bandeau dit « Vidéo à venir ». Pour brancher une vraie vidéo : la déposer dans `medias/video/`, puis renseigner
`"video"` (et `"poster"`) pour l'activité concernée dans `construire.py`, comme pour la démonstration.

**La vidéo de démonstration** (« À l'hôtel ») est la scène générée avec Gemini fournie le 4 novembre, avec des
sous-titres (bouton « CC »). Ses 2 questions ont été écrites d'après son dialogue : **elle ne vient pas de l'Excel.**

## Les mots qui s'allument

`generer_temps.py` fait retranscrire chaque son par la reconnaissance vocale d'ElevenLabs, qui donne le moment où
chaque mot est dit (`donnees/temps.json`) ; `construire.py` cale ces moments sur le texte écrit (les nombres lus en
lettres se partagent le temps du passage). Calés : 31 enregistrements et la démonstration, 45 modèles lus sur 46,
24 consignes ou phrases à répéter, les 4 répliques de « Que dites-vous ? ». `construire.py` calcule aussi
l'enveloppe de chaque son (le volume toutes les 40 ms) : les ondes de la page bougent avec la vraie voix.

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

Les modèles oraux sont lus par ElevenLabs (`generer_modeles.py`, modèle Eleven Multilingual v2 : Claire pour une
femme, Guillaume pour un homme selon le personnage, Lucie ou Marc pour l'interlocuteur des jeux de rôle ; débit 0,85
en A1, 0,95 en A2, 1 en B1). La première voix d'homme (Theo) ajoutait des « euh », elle a été remplacée.

## Le style

La version 2 est en **thème clair** : la DA du premier positionnement sur un fond lavande pâle. Le violet passe dans
les grands titres (avec une tranche lavande) et les repères (progression, chemin, rayons) ; les cartes sont blanches
avec leur tranche lavande ; sur les photos et les vidéos, le texte reste blanc sur un voile violet. La version sur
fond violet est gardée telle quelle dans `v2-violet/` (son gabarit : `v2-violet/page.html`).

La DA reprise du premier positionnement (`../positionnement-fle/`) : tuiles hexagonales à plat,
coins arrondis, face blanche lavande et tranche lavande ; réponses courtes en quatre alvéoles (haut, gauche, droite,
bas), réponses longues en pastilles blanches avec une marque hexagonale ; jaune citron pour le choix, vert pour le
juste, rose pour le faux, cyan pour écouter ; gros boutons verts en capitales ; panneaux ton sur ton. Une couleur de
tuile par type : cyan (écouter), blanc (lire), vert (grammaire), citron (écrire), rose (parler), lilas (répondre).
Polices Baloo 2 et Nunito (Caveat pour l'ardoise et le post-it), Google Fonts.

## Fichiers

- `construire.py` : construit `index.html` (page web), `artefact.html` (le même contenu, sans en-tête, pour
  l'artefact), `v1/index.html` et `v2-violet/index.html`, à partir de `page.html` (le gabarit : style et code), de
  `v1/page.html`, de `v2-violet/page.html` et des données.
- `donnees/excel-200.json` : les 200 lignes de l'Excel ; les QCM mis en forme viennent de
  `../positionnement-fle/banque/banque.json` ; `donnees/modeles.json` ; `donnees/video-hotel-sous-titres.json` ;
  `donnees/temps.json` ; `donnees/activites.json` (produit) ; `donnees/medias.json` (les fichiers de l'artefact).
- `medias/sons/` : les sons du premier test ; `medias/modeles/` : les modèles lus ; `medias/photos/` : les photos
  (celles du positionnement, Unsplash, plus `famille` par Daria Trofimova et `atelier` par Shavr IK, Unsplash) ;
  `medias/video/` : la démonstration.

    python3 travaux/activites-fle/construire.py         # refait les pages
    python3 travaux/activites-fle/generer_temps.py      # recale les mots des sons nouveaux ou changés
    python3 travaux/activites-fle/generer_modeles.py    # refait les modèles lus qui ont changé
