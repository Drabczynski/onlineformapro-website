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
  (sur la photo quand il y en a une, la photo remplit tout le haut et se fond dans le blanc), le message, la phrase à
  compléter, le document. En bas, sur blanc, la question et les réponses A, B, C, alignées à gauche, puis « Je ne sais
  pas » / « Valider ». Aucun bandeau, aucun numéro de question, aucune compétence affichée, pas de bouton pour quitter :
  seul le bouton du son reste en haut à droite. Ses sons sont lus dans `../../positionnement-fle-2/sons/`.
- `maquettes/` : les trois pistes comparées avant le choix.

## Ce qui change par rapport à la version 2

- Fond pastel clair (le dégradé violet, bleu, turquoise de la référence, adouci) et une grande feuille blanche qui
  porte la question, les réponses et les boutons. Police Manrope, accent indigo, plus d'alvéoles.
- L'apprenant ne voit jamais son niveau : l'en-tête montre seulement « Question 4 », numéroté depuis le début du
  test ; plus d'écran « Bravo ! Niveau validé » entre deux niveaux, le test enchaîne ; à la fin, « Test terminé »
  sans niveau.
- Le niveau et le bilan restent visibles pour le formateur, sur ordinateur, dans le panneau « Moteur ».
- Les réponses sont des lignes à toucher, le clavier de lettres une grille de touches, l'écoute avec photo garde
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
python3 travaux/positionnement-fle-3/assembler_v3.py          # transforme la v2 en v3 (« La feuille », « Le dégradé » et « L'examen »)
```
