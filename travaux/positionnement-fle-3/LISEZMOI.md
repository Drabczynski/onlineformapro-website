# Test de positionnement FLE, version 3 (« La feuille »)

Même test que la version 2 (`../positionnement-fle-2/`) : même banque de 113 questions, mêmes sons, même moteur
adaptatif, mêmes panneaux « Barème » et « Moteur » pour le formateur. Seule la présentation change, pour un test
perçu comme plus officiel. La version 2, plus ludique, reste en place pour d'autres activités.

- Page web : https://onlineformapro-website.vercel.app/travaux/positionnement-fle-3/
- `index.html` : la page web. Elle lit les sons dans `../positionnement-fle-2/sons/`.
- `test-positionnement.html` : la version artifact (sons et images intégrés).
- `degrade/` : la même version 3 avec le style « Le dégradé » (piste A des maquettes), pour comparer :
  https://onlineformapro-website.vercel.app/travaux/positionnement-fle-3/degrade/ . Dégradé violet, bleu,
  turquoise en haut de l'écran qui s'efface vers un fond clair, cartes blanches bordées, bouton sombre, barre
  d'avancement sous l'en-tête (elle avance d'une question sur 21, le maximum, sans repartir à zéro). Ses sons sont
  lus dans `../../positionnement-fle-2/sons/`.
- `examen/` : la variante « L'examen », minimaliste, en police Public Sans :
  https://onlineformapro-website.vercel.app/travaux/positionnement-fle-3/examen/ . En haut, le dégradé bleu ciel de la
  référence (relevé au pixel), qui prend toute la place libre et porte le support : la bille d'écoute violette animée
  (cerclée de blanc), le SMS (une bulle de message reçu, avec sa pointe), la phrase à compléter, le texte, le
  document. La plupart des questions ont une photo, qui remplit tout le haut et se fond dans le blanc, le support posé
  dessus ; elle pose le décor sans jamais montrer la réponse (liste et raisons dans `../positionnement-fle-2/LISEZMOI.md`).
  Une question sans photo ni support garde une simple bande de ciel. L'accueil s'ouvre sur une photo de personnes qui
  discutent. En bas, sur blanc, la question et les réponses A, B, C, alignées à gauche, puis « Je ne sais pas » /
  « Valider ». Aucun bandeau, aucun numéro de question, aucune compétence affichée : en haut, le son à gauche et la
  croix pour quitter à droite (elle demande confirmation). Un mot à trait d'union (« posez-vous ») n'est jamais coupé
  en fin de ligne. Ses sons et ses images sont lus dans `../../positionnement-fle-2/` (l'artifact les intègre).
- `hublot/` : « Le Hublot », le même test que « L'examen » (mêmes questions, moteur, langues et voix) avec une mise en
  page pour ordinateur : https://onlineformapro-website.vercel.app/travaux/positionnement-fle-3/hublot/ . Elle
  s'applique dès que l'écran fait au moins 1000 × 600 px ; en dessous (téléphone, tablette en portrait), c'est «
  L'examen » à l'identique (vérifié au pixel). À gauche, la photo dans un grand cercle (un cercle de ciel quand il n'y
  a pas de photo), posé sur ses propres couleurs en flou léger (une miniature de 24 px de la photo, agrandie et
  floutée) ; la bille d'écoute est son satellite, avec une petite ombre ; la phrase à compléter se place au centre du
  cercle (lignes équilibrées). Un message (SMS, petit texte, document) est une feuille blanche au coin replié, posée
  sur une seconde feuille de biais, qui sort d'une enveloppe et fait face à la question (la photo, plus petite, en
  haut à gauche) ; la formule d'appel et la signature sont mises en forme, aucun mot n'est coupé. À droite, sur le
  blanc : le contexte ou la situation (avec un trait violet, pour qu'on le lise en premier), la question en grand, les
  réponses, « Je ne sais pas » / « Valider ». Sur ordinateur, un document se lit ainsi en face de sa question : plus
  d'écran de lecture séparé ni de bouton « Relire ». La colonne de droite n'affiche une barre de défilement que si son
  contenu dépasse vraiment (jamais pendant les transitions). Transition : le cercle se referme sur la bille et le
  suivant s'ouvre depuis elle, les couleurs du fond passent en fondu sur 2,2 s. Au clavier : A, B, C, D (ou 1 à 4)
  pour répondre, Entrée pour valider. Les feuilles (relire, langue, quitter) s'ouvrent en fenêtre au centre. Vient de
  la piste D des maquettes bureau (`maquettes-bureau/`).
- `maquettes/` : les trois pistes comparées avant le choix.
- `maquettes-bureau/` : les six pistes pour ordinateur comparées avant le choix du Hublot.

## La langue des consignes (« L'examen »)

Sur l'accueil, le bouton « Langue des consignes » (drapeau et nom de la langue) ouvre la liste : français, soudanais
(arabe du Soudan), ukrainien, pachto, lingala, somali, bengali, tibétain, dari, russe, tamoul. Le choix est gardé dans le
navigateur.

- Traduits : les questions, les phrases de contexte (« Vous prenez le métro… »), les situations, les étiquettes
  (« Vous recevez une invitation »), les indications (« Le verbe correct au présent ») et l'interface (accueil,
  boutons, fin, « Quitter le test ? »).
- Restent en français : les phrases à compléter, les questions qui contiennent un blanc (« Ce message est envoyé pour
  ___ un rendez-vous. »), la dictée de numéro (A2-35), les réponses, les SMS, les documents et les textes à lire.
- Le haut-parleur des questions A1 lit la question dans la langue choisie : voix ElevenLabs (modèle eleven_v3, la
  même voix que les consignes françaises), contrôlées par reconnaissance vocale. Le tibétain n'a pas de voix (aucune
  synthèse vocale ne le parle) : le haut-parleur disparaît.
- Une police Noto par écriture (arabe, bengali, tamoul, tibétain, cyrillique), chargée seulement quand la langue est
  choisie ; arabe, pachto et dari s'écrivent de droite à gauche.
- Fichiers : `traductions/source.json` (les textes à traduire), `traductions/<code>.json` (clé = texte français),
  `sons/<code>/` (voix, refaites par `python3 travaux/positionnement-fle-3/generer_voix.py <code>`), `drapeaux/`
  (flag-icons, licence MIT ; drapeau tibétain simplifié dessiné pour le test, sans les lions).
- **À faire relire.** Les traductions ont été faites par l'IA, avec une relecture par retraduction, pas par des
  locuteurs natifs. Avant un usage réel, les faire relire, en priorité le lingala (orthographe des ɛ/ɔ, emprunts au
  français pour les termes de grammaire), le tibétain, le dari, l'arabe du Soudan (impératif au masculin, chiffres
  arabes orientaux) et le pachto. Points de vigilance déjà repérés : « tante » n'a pas de mot neutre en bengali, tamoul
  et somali (tante maternelle ou paternelle) ; « l'article » n'existe pas en bengali, tamoul et pachto (terme expliqué
  ou emprunté) ; « De quoi s'agit-il ? » devient « Quel est ce texte ? » pour coller aux réponses (publicité, commande,
  menu).

## Ce qui change par rapport à la version 2

- Fond pastel clair (le dégradé violet, bleu, turquoise de la référence, adouci) et une grande feuille blanche qui
  porte la question, les réponses et les boutons. Police Manrope, accent indigo, plus d'alvéoles.
- L'apprenant ne voit jamais son niveau : l'en-tête montre seulement « Question 4 », numéroté depuis le début du
  test ; plus d'écran « Bravo ! Niveau validé » entre deux niveaux, le test enchaîne ; à la fin, « Test terminé »
  sans niveau.
- Le niveau et le bilan restent visibles pour le formateur, sur ordinateur, dans le panneau « Moteur ».
- Les réponses sont des lignes à toucher (plus de questions à lettres), l'écoute avec photo garde
  la photo en grand et le bouton posé dessus.

## Ce qui ne change pas

La banque, les règles du moteur (paliers de 7 questions, 5 justes pour valider, arrêt dès que le niveau ne peut plus
être validé), les sons, le resserrement des questions sur petit écran, le plein écran sur téléphone, les panneaux du
formateur. Détails dans `../positionnement-fle-2/LISEZMOI.md`.

## À savoir

Les réponses ne sont encore enregistrées nulle part : le résultat n'existe que sur l'appareil, dans le panneau
« Moteur ». L'écran de fin dit donc seulement « Vous pouvez prévenir votre formateur ». Il faudra l'adapter le jour
où les résultats seront transmis.

## Reconstruire

```
python3 travaux/positionnement-fle-2/banque/banque_v2.py      # si la banque a changé
python3 travaux/positionnement-fle-2/banque/assembler_v2.py   # reconstruit la v2
python3 travaux/positionnement-fle-3/assembler_v3.py          # transforme la v2 en v3 (« La feuille », « Le dégradé », « L'examen » et « Le Hublot »)
```
