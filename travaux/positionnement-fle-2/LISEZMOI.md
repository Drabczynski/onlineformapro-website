# Test de positionnement FLE, version 2

Même test que la version 1 (`../positionnement-fle/`) : mêmes écrans, même moteur adaptatif,
mêmes sons d'interface. Seule la banque change : elle vient du PDF « EVAL POSITIONNEMENT v2 »
(export PowerPoint, 67 pages). La version 1 n'est pas modifiée.

- Page web : https://onlineformapro-website.vercel.app/travaux/positionnement-fle-2/
- `index.html` : la page web (sons en fichiers dans `sons/`).
- `test-positionnement.html` : la version artifact (sons et images intégrés, 3,6 Mo).
- Affichage : sur ordinateur, le téléphone posé au centre d'un fond gris ; sur un appareil tactile
  (téléphone, tablette) ou un écran de moins de 520 px, le test occupe tout l'écran, comme une application.
- Lisibilité : aucun texte de lecture sous 14 px ; contextes, messages et phrases agrandis.
- Sur téléphone, le test est un bloc fixe de la taille de l'écran : la page ne peut pas défiler, donc rien
  ne passe sous la barre d'état. Safari (iOS 26) teinte ses barres avec la couleur des bords d'un tel bloc ;
  le fond violet de la page sert de repli.
- Sur ordinateur (écran d'au moins 1000 px, souris), deux petits boutons dans le coin bas gauche,
  « Barème » et « Moteur », ouvrent chacun un panneau (un à la fois ; un second clic le referme), pour
  présenter le test : le barème et la composition de la banque ; le moteur en direct. Le palier en
  cours y figure question par question (niveau, compétence, sous-catégorie pour la langue, identifiant),
  avec le décompte des bonnes réponses (par exemple « 2/3 bonnes réponses pour A2 »), les erreurs encore
  permises, les paliers validés, le niveau attribué et le bilan par compétence. Une réponse n'y est comptée
  qu'une fois validée. Les panneaux n'apparaissent pas sur téléphone ni sur tablette.
- Hauteur de l'écran : une question qui ne tient pas est resserrée en deux crans (marges, lecteur, réponses,
  image) ; testé sur toutes les questions en 390 × 664 (iPhone avec les barres de Safari). Un long texte à
  lire qui dépasse encore s'estompe en bas tant qu'on n'a pas défilé jusqu'au bout.
- Lecteur des écoutes : le bouton seul, avec le nombre d'écoutes restantes ; pendant l'écoute, les ondes
  s'animent dans le bouton.

## Contenu

113 questions : A1 61, A2 40, B1 12.

| Niveau | CO | CE | EE | EO | LG |
|---|---|---|---|---|---|
| A1 | 5 | 13 | 6 | – | 37 |
| A2 | 3 | 9 | 4 | 1 | 23 |
| B1 | 1 | 10 | 1 | – | – |

CO compréhension orale, CE compréhension écrite, EE expression écrite, EO expression orale,
LG langue (grammaire, conjugaison, vocabulaire). Le tag de chaque question est celui du PDF ;
le numéro de page du PDF est gardé dans `banque/banque-v2.json`.

Types de réponses :

- choix à toucher : un texte, ou une image quand le PDF propose des photos (A1-08, A1-12, A2-07).
  Les images prennent la place libre : sur deux colonnes (une en haut, deux en bas) quand l'écran
  le permet, sinon toutes les trois sur une ligne ;
- choix à écouter (A2-06, les trois phrases au guichet de la poste) ;
- mots à remettre dans l'ordre (A1-16) ;
- (retiré à la demande) les questions où l'on écrivait un mot en touchant des lettres, l'expression écrite à mot
  court (A1-01, A1-02, A1-05, A1-06, A2-02, A2-10) : elles ne sont plus dans la banque, les autres questions gardent
  leur numéro ;
- réponse à écrire (A1-57 à A1-61, A2-39, A2-40). Les accents et les majuscules ne comptent pas,
  et plusieurs formes sont acceptées (« 22 », « 22 ans », « vingt-deux ans »).

## Moteur adaptatif (repris de la version 1)

- Trois paliers dans l'ordre : A1, A2, B1.
- 7 questions par palier, tirées au hasard. D'abord une question de chaque compétence présente
  à ce niveau, puis on complète en équilibrant les compétences.
- Deux questions d'un même groupe (même document, même son) ne tombent jamais dans le même palier.
- Palier validé avec 70 % de bonnes réponses, soit 5 sur 7. Le palier est joué en entier,
  sauf quand il ne peut plus être validé : le test s'arrête alors tout de suite.
- Résultat : le dernier niveau validé (« Niveau A1 », « Niveau A2 », « Niveau B1 »),
  ou « A1 en cours » si le premier palier n'est pas validé.
- Un diagnostic par compétence et par tag est calculé (`etat.diagnostic`), mais il n'est pas affiché.

## Sons

- `sons/o01.mp3` à `sons/o11.mp3` : les sons d'origine (`sons-source/`), mis au même volume.
  Les sons 01 à 08 et 11 servent. Le 09 (des trains, sans question) et le 10 (la seule question
  qui l'utilise est écartée, voir plus bas) sont copiés mais ne servent pas.
- `sons/consignes/` : 32 consignes A1 lues à voix haute, comme dans la version 1.
- `sons/poste/` : les trois phrases du guichet de la poste (A2-06).
- Consignes et phrases générées avec ElevenLabs par `../positionnement-fle/generer_sons.py`,
  à partir de `banque/sons-v2.json`.

## Reconstruire

```
python3 banque/banque_v2.py      # réécrit banque/banque-v2.json
python3 banque/assembler_v2.py   # réécrit index.html et test-positionnement.html
```

`assembler_v2.py` part de `../positionnement-fle/test-positionnement.html` (version 1)
et remplace la banque, le moteur, les sons et les images (`banque/img/`).

## Écarts avec le PDF

### Questions écartées

- « Je … le chemin autour du lac » et « Je … en parler » : questions incomplètes ou sans réponse sûre.
- « À qui est cette voiture ? » : la réponse marquée, « C'est ma. », est fausse.
- « Je prends un café … sucre » : en double avec une autre question, qui est gardée (réponse « du »).
- Deux questions B1 dont l'énoncé a été recopié par erreur : « Quelle est la profession de son père ? »
  au-dessus de réponses sur une écharpe et sur des boissons.
- « Trois jeunes étudiants… » : question incomplète.
- Le texte sur Ana : deux réponses sont vraies.
- « Est-ce que tu (prendre)… → as pris » et « Je (avoir) deux chats les jours ? » : énoncés incohérents.
- « (...) tu vas faire cet après-midi ? → que » : la réponse marquée est fausse (« Qu'est-ce que »).
- « avoir de la chance → Réussir trop facilement » : la définition marquée est fausse.
- « Où sont ces 2 dames ? » (son 08) : le son se passe au restaurant, mais c'est la photo des courses qui est marquée.
- B1, émission de radio (son 10) : deux photos, aucune n'est marquée et une seule correspond.
- Les questions en double ont été fusionnées.

### Réponses déduites (non marquées dans le PDF)

Le pluriel de « un cheval » (« Des chevaux »), « ferai », « ai », « appelle », « du »,
l'âge de Lucas (22 ans) et sa ville (Toulouse), « Qu'est-ce que » (au restaurant).

### Textes ajustés

- « De quoi est-ce que ça parle ? » : la question est coupée dans le PDF.
- « Margaret Marie » : le prénom entendu dans le son (la diapositive écrit « Maritz »).
- L'affiche du café : le zoom montre le 16 novembre.
- Les deux questions sur l'emploi du temps de Julien (A2, page 56 du PDF) et les six questions à lettres sont
  retirées à la demande : la banque compte 105 questions.
- A1-16 : « Remettez les mots dans l'ordre. » à la place de « Qu'est-ce que vous dites ? », pour moins
  de texte (le contexte reste au-dessus). Consigne lue générée avec ElevenLabs (`v2-q33`).
- A1-01 : l'infinitif « (parler) » indiqué sous la phrase.
- A1-13 : la phrase du PDF « Vous avez rendez-vous chez le dentiste et vous recevez un message. » est retirée.
- A1-10 et A1-16 : les phrases du PDF « Vous visitez un appartement pour une location. » et « Vous êtes
  dans la rue et vous demandez votre chemin. » sont retirées.
- A1-08 : sans « Vous êtes au téléphone avec votre tante. » ; la question devient « Votre tante fait des
  courses. Où est-elle ? » (consigne lue générée avec ElevenLabs, `v2-q34`).
- B1-12 : sans « Vous écoutez un reportage à Abidjan. ».
- A1-29 : à la demande, la phrase à compléter « Avec un stylo, on ______. » sous la question « Que fait-on avec un
  stylo ? » ; les réponses deviennent « mange », « écrit », « écoute » (« On mange »… dans le PDF).
- Photos de scène fournies : pour les écoutes, la photo remplit tout l'encart et le bouton d'écoute est
  posé dessus (l'immeuble, A1-10 ; les trois femmes à Abidjan, B1-12) ; la salle de cinéma remplace
  l'icône de la situation (A1-18). Marie (A2-16, A2-17, B1-01, B1-02) :
  une vraie photo à la place de l'icône (crédit plus bas).
- Photos d'illustration : 81 questions sur 105 en ont une. Dans « L'examen » (v3), elle remplit le haut de l'écran et
  se fond dans le blanc, le support posé dessus (bille d'écoute au centre ; SMS, phrase, texte ou document en bas,
  pour que le haut de la photo reste visible). Chaque photo pose le décor sans jamais montrer la réponse : une
  personne au téléphone pour un SMS, la ville d'une phrase (« Je viens du Portugal » : Lisbonne), un comptoir
  d'accueil sans escalier ni panneau d'étage (A1-09), un bistrot sans aucun plat (A2-11), un dîner sans viande ni
  poisson (A2-01), une rue sans flèche (A2-22), une vitre sous la pluie sans parapluie (A2-34)… La table question →
  photo est `PHOTOS` dans `banque/banque_v2.py`. Restent sans photo, exprès, les questions où toute image donnerait la
  réponse : le vocabulaire défini par l'objet ou le lieu (pharmacie, stylo, école, croissants, ciseaux, couleur du
  ciel, pâtissier, journalistes, pomme, livres, hôpital du médecin), les contraires, « quartier », les chiffres, les
  écoutes A1-04 (le métier), A2-07 (l'interdiction) et A2-09 (l'âge), et la maison de Julie (B1-09, B1-10). « Un film
  tellement drôle » (A2-33) prend la façade du cinéma, où personne ne rit. « Je n'ai vu personne dans le jardin »
  (A2-28) a une photo à la demande : un massif de fleurs cadré serré, qui ne montre ni quelqu'un ni un jardin vide.
  L'affiche A1-11 et les réponses en images d'A1-08, A1-12 et A2-07 restent. Crédits : métro (A1-07), appartement,
  salle de cinéma, Abidjan : photos fournies ; primeur, fromagerie, gare, pique-nique, plage, interdictions et affiche
  : images du PDF. Toutes les autres viennent d'Unsplash (licence Unsplash), par nom de fichier dans `banque/img/` :
  accueil-sante, Dental Implants Tasmania (97A7qum-dvg, recadrée) · amies, Omar Lopez (770jbAj_wvQ) · amir, Josias
  Garibay (rifCUO-4X8k) · amis-telephone, Vitaly Gariev (CPVWc-ZJg1o) · boucherie (réponse d'A1-08), Darth Liu
  (hf_i6mm88pM) · boulangerie (réponse d'A1-08), Zoshua Colah (D7cyLNwSEOo) · bureau, Luca Bravo (9l_326FISzk) ·
  bureau-matin, Carrie Allen (HCJKGkeKmW0) · bus, Nathan Cima (P_T5kv1Nd3w) · cafe, engin akyurt (W4cStr7X2wY) ·
  chats, Nathalie Jolie (nKzeG3iE_Qg) · chevaux, Manoj Kulkarni (Xgy8G9qMkFA) · chez-amie, Peter Boccia (vQVWSCx8lbQ)
  · cinema-entree, Myke Simon (atsUqIm3wxo) · classe, Vitaly Gariev (14jNrPntbgk) · conversation, Christina @
  wocintechchat.com (VpcgTEKerEQ) · couple, Vitaly Gariev (-FYWsRxATAE) · croissant, Co Tan (ngWKZNeOhkk) · dejeuner,
  Queensland, Australia (g6FKXPq0SI0) · dentiste, Ozkan Guner (aFqSRokmw2E) · ecole, Benoit Roy (lJOe6zs3vCI) ·
  enfants, Jennifer Kalenberg (dKVypFEWM0k) · fatigue, Adrian Swancar (roCfgvkBLVY) · gare, Jametlene Reskp
  (w5bhXG_uUXw) · hopital, LEDC (JtHwupBN3to) · intro, Alexis Brown (-Xv7k95vOFA) · italie, mana5280 (6sIDfzp-ssQ) ·
  jeune-femme, Max Harlynking (coB2qm6VUGg) · jardin (A2-28), Anastasios Kara (mYKv1ubOY_g) · lettre, Mediamodifier
  (S3Lig53867M) · lisa, Kevin Wolf (h-GnGkgc8n8) · lisbonne, Mehmet Bozgedik (c-ibE7UOpGQ) · lucas, Elizeu Dias
  (2EGNqazbAMk) · marche, Jason Ng (yGTdnZ_QWog) · marie, Cristina Anne Costello (g-sZXPH1eSM) · marseille, Carnet de
  Voyage d'Alex (0KdrlrwYlCo) · medecin, Vitaly Gariev (_zbqco3m7dA) · musee, Tamara Harhai (1YuglK73vBU) · pain, Ryan
  Wallace (JjvxFIX_3aA) · parc, Alex Sherstnev (okbDJ3IEC0Y) · piscine, Mariusz Smenzyk (xs9r8fPUats) · pizza, Laure
  Noverraz (jsZKLRi7toU) · pluie, Thomas Kinto (7BdGQlR-5Gs) · poste, Kseniia Poroshkova (WySH93gqRPM) · presentation,
  Vitaly Gariev (lZXX-QVdyXY) · prets, Vitaly Gariev (b3-k_Lf4qU4) · restaurant et rep-restaurant (réponse d'A1-12),
  Kamilla Isalieva (3ICm8lZyeZE) · reunion, Vitaly Gariev (G6DRxdnw4WY) · rue, Jalen Hueser (QBjv69x4s0U) · stylos,
  Babak Eshaghian (gCb97Kja9mY) · tele, Vitaly Gariev (X3jvunGfJdU) · telephone-2, Vitaly Gariev (h2FIDYqL_SA) ·
  velo-travail, Alain Rouiller (PuF07L4-Y_c) · ville-calme, Pujalin (AGlIvH19MOQ) · voiture, Sevadis (3mxiB5KCKB0). La
  tante (A1-08) est une photo fournie, recadrée pour ne pas montrer la vitrine de viennoiseries (elle donnerait la
  réponse).
- Page web : les images sont des fichiers (`banque/img/`), chargés en arrière-plan une fois la page affichée ;
  l'artifact les intègre.
- A1-11 : sans « Vous lisez cette affiche. » ni « Touchez l'image pour l'agrandir » ; une loupe dans le coin
  de l'affiche indique qu'on peut l'agrandir.
- « Que répondez-vous ? » ajouté aux questions où l'on répond à un message. Les contextes viennent du PDF ;
  retirés à la demande : « Au restaurant, le serveur présente la carte. » (A2-11), « Vous vous présentez au
  groupe. » (A1-15), « Au restaurant, vous posez une question au serveur. » (A2-13). Fautes de frappe corrigées.
- A1-08 : une quatrième photo de réponse, la boucherie (l'enregistrement ne parle que de pâtisseries), pour une
  grille de 2 × 2 ; la vitrine de boulangerie est remplacée par une photo plus nette. A1-12 : de même, un quatrième
  lieu en image, « Un restaurant ».
- A1-25 et A1-54 : « J'______ 25 ans. » et « J'______ deux chats. » (le PDF écrit « Je ______ » devant la
  réponse « ai ») ; la case se colle à l'apostrophe pour qu'on lise « J'ai ».
- Son sur iPhone : la page passe en mode « lecture » (navigator.audioSession), le son passe même sonnerie coupée.
