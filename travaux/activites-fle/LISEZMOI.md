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
  Retirées partout le 12 novembre : `formulaire` (bureau sombre vu de haut, remplacée par `remplir-fiche`) et
  `accueil-sante` (remplacée par `secretaire-telephone` pour EO-31, `agenda-accueil` pour EO-01, `medecin` pour EO-45).
  Puis : CO-14 (« thé ou café ? ») deux amies à la maison avec des tasses dont on ne voit pas le contenu, EO-08
  (« Vous avez des frères et sœurs ? ») un frère et une sœur, enfants, qui regardent l'objectif (`fratrie`, Izzy
  Park ; la photo `freres-soeurs` est retirée).
  Diversification du 12/11 (« toutes les questions sur le travail ont la même photo ») : 31 photos servaient à
  plusieurs questions, jusqu'à 7 fois. 49 nouvelles photos Unsplash, chacune regardée face à son texte (voisin
  bruyant : une femme exaspérée, les mains sur les oreilles ; parler de son travail : un mécanicien ; consignes d'un
  collègue : deux femmes dans un entrepôt ; panne de chauffage : une femme sous une couette…). Aucune photo ne sert
  plus de deux fois, et une paire garde un lien de sens (l'écoute et sa phrase à répéter, un document et sa question).
  Le mot à composer reprend la photo de sa question d'origine.
  EE-47 (un appareil en panne) : une femme agacée devant son ordinateur, à la place du colis.
- **Sur la photo** : le SMS est une carte à la taille du message, posée en bas pour laisser voir le visage, et il
  arrive plus vite. L'exemple oral s'affiche toujours à gauche ; pour une photo à décrire, il s'accroche au bas de
  la photo, qui remonte pour lui laisser la place. Le micro est écarté de la consigne.

**Mobile** : l'adaptation au téléphone est mise en pause (12 novembre) ; on la reprendra à la fin.

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

**Écouter et regarder** restent en plein écran, la question au centre de l'image floutée (la version « image à
gauche, question à droite » a été essayée le 12 novembre et écartée). Quand on répond, l'onde du son s'efface : elle
passait sous le retour « Bravo ! ». « Réécouter » ou « Revoir » ramène l'image nette en plein écran ; à la fin, ou en
touchant « Répondre », la question revient telle qu'on l'avait laissée. Une question peut avoir **des images comme
réponses** (`images` dans la question) : la vidéo de l'hôtel en a une, avec deux images tirées de la vidéo. La vidéo
est celle d'origine, en 1280 × 720 (elle avait été trop compressée).

**Écrire petit à petit** : les douze sujets sont ceux de l'Excel, consigne mot pour mot. À droite, une seule chose à
écrire à la fois (un champ du formulaire, une phrase, un article de la liste, ou l'un des éléments demandés par la
consigne) ; à gauche, le document (liste, SMS, courriel, fiche) se remplit pendant qu'on écrit. Entrée ou « Suivant »
passe à la suite ; toucher une partie du document la reprend. Les étapes des textes libres sont dans
`donnees/aides-ecriture.json` (`etapes`) : elles découpent la consigne, elles ne viennent pas de l'Excel.

**Sur chaque question** : une pastille près de la croix donne le niveau (A1, A2, B1). La carte de droite a trois
zones : la question en haut, les réponses au centre exact (sur l'axe de l'image), le retour en bas ; rien ne bouge
quand le retour arrive. À l'oral, le micro est au centre et ne se déplace plus quand on appuie. Les réponses en
lignes sont à plat, sans tranche ni ombre.

**Vidéos de test** (12 novembre) : 10 vidéos de 10 secondes prises dans le dossier Google Drive fourni (87 vidéos),
A1-A2 : épicerie, café ou thé, chercher la pharmacie, fleuriste, quel quai, train en retard, médecin, une table pour
deux, l'addition, forfait de téléphone. Compressées en 720p (environ 1,3 Mo chacune, `medias/video/`), sous-titres
calés sur la voix par la reconnaissance ElevenLabs (avec qui parle), deux questions par vidéo écrites à partir de ce
qui est dit (`donnees/videos.json`, à relire). La vidéo passe de bout en bout, sans arrêt et sans voile violet sur l'image (juste une ombre neutre en haut et en
bas pour lire la question et les boutons) ; ensuite,
la question au centre, plein écran, sur la vidéo floutée sous le voile violet. « Revoir » (grand écran) passe en face
à face : la vidéo en vignette à gauche, qui rejoue là, la question à droite, qui reste ; « Revoir » est alors en bas à
gauche de la vignette. Après la question, si la vidéo ne joue plus, on revient au centre. Une série au
hasard tire deux vidéos, deux questions chacune. Écoutes : « Réécouter » rejoue le son
sans cacher la question. Téléchargement : l'adresse
`drive.usercontent.google.com/download?id=…&export=download&confirm=t`, le dossier partagé en lecture par lien.

**Écran de départ : notre menu de paramétrage**, tout blanc. « Nouvelle série » lance toujours la même série de
démonstration, en A1 (`SERIE_FIXE` dans `page.html`) : 3 vidéos (épicerie, pharmacie, médecin ; deux questions
après chacune), « Que dites-vous ? » (Merci → De rien ; Ne quittez pas → J'attends, une question A2
gardée à la demande), 3 écoutes (bus, famille, météo), 3 phrases à répéter (famille, météo, Vesoul), 3 textes à
trous (Je ___ Mariam, Nous ___ à Vesoul, J'achète deux ___), la lecture (SMS de Samir, invitation). « Série au
hasard » tire une série dans le niveau choisi (Tous, A1, A2, B1). « Toutes les questions » : la revue, qui reprend
où on l'a laissée. La croix en haut de chaque question y
ramène ; le bilan a un bouton pour y revenir. Pas de boutons permanents pendant les questions.

**Oral** : « Écouter » est en bas à gauche de la photo. Une consigne longue (B1) s'écrit un peu plus petit ; après
l'enregistrement, le micro se fait petit : le bouton pour continuer reste à l'écran (il sortait de l'écran sur les
longues consignes, d'où le blocage vers la 150ᵉ question de la revue). Vérifié sur les 60 questions orales, en
1907 × 940, 1440 × 760, 1280 × 640 et sur téléphone.

**Ce que la personne dit, écrit** : pendant qu'elle parle, ses mots s'écrivent sur la photo, dans une carte en bas
(au-dessus de « Écouter ») ; après, la même carte dit « Ce que j'ai entendu ». Avec l'exemple, ce qui a été dit est
repris en haut de la carte de l'exemple, pour comparer. Dans l'artefact, c'est la dictée de claude.ai (capacité `dictation`, navigateur Chromium) ; sur le site, la
reconnaissance vocale du navigateur (Chrome, Edge, Safari ; pas Firefox). Avec Chrome, le son part chez Google pour
être transcrit. Sans reconnaissance possible, rien ne change.

**Répéter** (rubrique à part) : sur la photo, « Écoutez et répétez. » ; à droite, la phrase, que la voix dit ; après l'enregistrement, chaque mot passe au vert
s'il a été dit, en rose sinon (sans tenir compte des accents ni de la ponctuation ; « 12 » vaut « douze »), avec
« 8 mots sur 10 » ; 85 % des mots ou plus, c'est juste. Les phrases : les trois « Écoutez et répétez » de l'Excel
(EO-01, EO-02, EO-33) et dix phrases des écoutes A1 de l'Excel, mot pour mot, avec leur son (`REP-CO-01`…, dans
`construire.py`, `REPETER_CO`). Le niveau est respecté : une seule phrase en A2, aucune en B1.

**Composer le mot** (rubrique à part) : des cases et des lettres en carrés, en majuscules, rangés en grille (celles du mot et quelques lettres des
mauvaises réponses) ; on touche une lettre, elle vole dans la case ; le clavier marche aussi. Le mot se remplit en
même temps dans le trou de la phrase, sur la photo. Dix QCM de l'Excel dont la réponse est un mot à bien écrire
(`LETTRES` dans `construire.py`) : EE-05, 06 (le mot entendu, « bonjour »), 07 (« 15 » → quinze), 12, 13 en A1 ;
EE-20, 28 en A2 ; EE-38, 42, 43 en B1. Le mot de base entre parenthèses (« pomme », « gentil », « être »…) est ajouté
ici, à relire. Le QCM d'origine reste dans la grammaire.

**Jeux de rôle** : retirés de la page le 12 novembre (trop compliqués à comprendre) : `JEUX_DE_ROLE = False` dans
`construire.py`. Ce qui avait été fait reste prêt : une ouverture animée (les masques, « Jeu de rôle », la situation, « L'autre personne » et son rôle),
lue par la voix de Claire avec les mots qui s'allument (`generer_jeux.py`, sons dans `medias/jeux/`) ; à la fin de la
lecture (ou avec « Passer »), la situation et le rôle partent à leur place dans l'écran.

**Grammaire, ce qui se lit va sur la photo** : la phrase citée (« Je viendrai demain. »), les mots à remettre dans
l'ordre, la phrase à transformer, la situation (« Vous écrivez un SMS à un ami. ») se posent sur la photo, à gauche ;
la question et les réponses restent à droite. Quand l'Excel ne donne que « Choisissez la bonne réponse. », le titre
reprend l'énoncé (« Comment écrit-on 15 en lettres ? ») et le nombre s'écrit en très grand sur la photo. Un mot à
trait d'union (« écrit-on ») ne se coupe plus en fin de ligne.

**Deux trous dans la phrase** (EE-26 « plus… que », EE-35 « suis arrivé / pleuvait ») : on les remplit l'un après
l'autre. Le trou à remplir est cerclé de violet, l'autre attend ; à droite, « Choisissez le premier mot. » puis « le
deuxième », avec deux points de suivi, et seulement les mots possibles pour ce trou (tirés des quatre réponses de
l'Excel). La réponse est juste si les deux mots le sont. Deux ou trois réponses courtes se rangent en ligne.

**Après la réponse, rien ne pâlit** : les autres propositions restent nettes (texte un peu adouci), la mauvaise
choisie est rose et barrée, et dans un trou, le mot remis après une erreur est cerclé de vert (le vert plein reste
la bonne réponse donnée). Les réponses arrivent sans fondu.

**Passer en revue toutes les questions** : sous le bouton « Commencer », un lien ouvre la revue. Toutes les
questions défilent à la suite dans l'ordre des identifiants (CO, CE, EE, EO), sans rideau ; en haut, deux flèches
et une liste pour aller directement à une question. La revue se reprend où on l'a laissée. Elle compte les 200
questions de l'Excel, les 2 de la vidéo et celles des ajouts.

**Ajouter un son avec ses questions** : `donnees/ajouts.json` (identifiant, niveau, titre, photo, transcription,
questions) et le son dans `medias/sons/<identifiant>.mp3` ; puis `generer_questions.py`, `generer_temps.py` et
`construire.py`. Premier ajout : `POD-02`, le dialogue « La famille » fourni le 12 novembre, avec quatre questions
écrites à partir de ce qui est dit (à valider).

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
