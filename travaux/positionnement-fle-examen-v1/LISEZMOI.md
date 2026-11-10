# Test de positionnement FLE — « L'examen », version 1 (figée)

**Produit fini, figé le 10 novembre 2026. Ne pas modifier ce dossier.** Les évolutions (la version pour ordinateur
de bureau, notamment) se font ailleurs ; ce dossier reste la référence de la version mobile validée.

En ligne : https://onlineformapro-website.vercel.app/travaux/positionnement-fle-examen-v1/

## Contenu

- `index.html` : la page web. Elle ne dépend que de ce dossier (et de Google Fonts pour les polices) :
  - `img/` : les photos et les images de réponses ;
  - `sons/` : les enregistrements d'origine du PDF (o01 à o11), les consignes lues en français et les trois phrases
    de la poste ;
  - `voix/<langue>/` : les questions A1 lues dans les 9 langues qui ont une voix.
- `test-positionnement.html` : la même version en un seul fichier, tout intégré (artifact, environ 10 Mo).

## Ce que fait cette version

- 105 questions de A1 à B1, moteur adaptatif : paliers de 7 questions, 5 justes pour valider un niveau, arrêt dès que
  le niveau ne peut plus être validé. L'apprenant ne voit jamais son niveau ; le formateur le voit sur ordinateur,
  dans le panneau « Moteur ».
- Style « L'examen » : dégradé bleu ciel en haut, photo pleine largeur qui se fond dans le blanc (79 questions
  illustrées, sans jamais montrer la réponse), bille d'écoute violette, question et réponses alignées à gauche,
  apparition des écrans en cascade.
- Langue des consignes au choix : français, soudanais, ukrainien, pachto, lingala, somali, bengali, tibétain, dari,
  russe, tamoul (questions, contextes, indications et boutons traduits ; voix des questions A1, sauf en tibétain).
  Les traductions sont à faire relire par des locuteurs natifs avant un usage réel (détail dans
  `../positionnement-fle-3/LISEZMOI.md`).

## D'où vient cette copie

Copie de `../positionnement-fle-3/examen/` au commit `d863dae` (branche `claude/salut-beau-gosse-0ma9xt`), avec ses
fichiers rapatriés ici et ses chemins réécrits vers ce dossier. Les scripts qui l'ont produite
(`../positionnement-fle-2/banque/banque_v2.py`, `assembler_v2.py`, `../positionnement-fle-3/assembler_v3.py`,
`generer_voix.py`) continuent d'évoluer : ne pas s'en servir pour regénérer ce dossier. Crédits des photos :
`../positionnement-fle-2/LISEZMOI.md`.
