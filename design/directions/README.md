# Trois directions — baromètre IA

Page de comparaison montrant la couverture et le premier écran de question du
baromètre (`enquete/index.html`) dans trois partis pris franchement différents,
à présenter côte à côte à la direction.

- **A — L'Étude** : Instrument Serif / Instrument Sans, papier blanc, rouge en
  filet. Seule direction qui affiche le logo réel.
- **B — Le Signe** : Archivo Black / Archivo, couverture en aplat rouge.
- **C — L'Instrument** : Space Grotesk / JetBrains Mono, fond sombre, aiguille.

Constante aux trois : `#E01A4F` devient *la* couleur du baromètre, alors qu'il
n'est aujourd'hui que la septième des huit couleurs de chapitre
(`var COULEURS` dans `enquete/index.html`).

Tout le contenu affiché est le contenu réel du questionnaire (`PARTIES`,
`ECRANS`, `NIVEAUX`) : aucun chiffre, nom de client ni témoignage inventé.

`logo.svg` est une copie de `catalogue/img/logo.svg`, pour que la page reste
autonome (la publication en artifact interdit les images distantes).
