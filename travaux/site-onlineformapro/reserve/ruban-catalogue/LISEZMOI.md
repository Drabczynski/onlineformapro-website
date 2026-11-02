# En réserve : la phase « Catalogue de formation » de l'ouverture

Mise de côté le 2 novembre 2026, pour être reprise plus tard. Rien ici n'est chargé par le
site : l'ouverture (`index.html`, `intro-complete.html`) est revenue à son état d'avant le
ruban, avec quatre chapitres.

## Ce que c'est

Un chapitre 03 (sur 05), entre « Une solution globale et modulaire » et « Éprouvée par
22 millions d'apprenants » :

- Le titre « 6000 h de formations interactives ».
- Sur la liaison du cube à la planète, un rond-point. Son anneau se soulève et monte en
  hélice : un seul ruban lisse, bordé de deux lignes de lumière.
- La caméra suit la route jusqu'au ruban, s'arrête face à lui, puis repart vers la planète.
- Pendant l'arrêt, les vignettes des douze familles du catalogue glissent le long du ruban
  au défilement. Une famille à la fois s'arrête au premier plan.
- Un réseau de particules reliées entoure le ruban.
- À droite, la liste des familles, qui roule ; en bas, un compteur (01 / 12) et le bouton
  « Voir le catalogue ».
- Un clic sur le ruban ou sur le bouton couvre l'écran d'une mosaïque de carrés, puis ouvre
  le catalogue.

Captures : `img/captures-ordinateur.webp` et `img/captures-telephone.webp`.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `helice.js` | La forme du ruban : place, rayon, pas, pose sur l'anneau, angle face à la caméra. |
| `ruban.js` | Les images sur le ruban, le réseau de particules, le clic. |
| `integration.patch` | Les changements dans `index.html`, `intro-complete.html`, `monde.js`, `ouverture.js` et `ouverture.css`. |
| `maquette-catalogue.html` | Les écrans figés de la première maquette, validée avant l'intégration, avec ses fonds dans `img/`. |

Ce que fait `integration.patch` :

- **`monde.js`** : le rond-point, les bords lumineux et les stations de la caméra.
- **`ouverture.js`** : le calage des stations (vingt-trois au lieu de vingt ; dix-neuf au
  lieu de seize pour l'essai « ondes »), la liste, le compteur, le clic et la mosaïque.
- **`ouverture.css`** : la liste, le compteur, le bouton et la mosaïque.
- **Les deux pages** : le chapitre et la toile `canvas#ruban`.

## Le remettre en place

Depuis la racine du dépôt :

```sh
git apply travaux/site-onlineformapro/reserve/ruban-catalogue/integration.patch
cp travaux/site-onlineformapro/reserve/ruban-catalogue/helice.js \
   travaux/site-onlineformapro/reserve/ruban-catalogue/ruban.js \
   travaux/site-onlineformapro/
```

Le patch s'applique tel quel sur l'ouverture du 2 novembre 2026. Si les fichiers de
l'ouverture ont changé depuis, `git apply --3way` aide à fusionner. On peut aussi repartir du
commit `dc46743` sur la branche `claude/salut-beau-gosse-0ma9xt`, où tout est en place.

Pour ouvrir la maquette figée, servir le site par http, puis ouvrir
`/reserve/ruban-catalogue/maquette-catalogue.html`.
