# Images de la page catalogue

Déposer les fichiers ici (GitHub → Add file → Upload files), puis me signaler
l'ajout : je les intègre à la page.

## Ce qui apporterait le plus, par ordre d'impact

| Fichier attendu | Usage dans la page | Format |
|---|---|---|
| ~~`logo.svg`~~ *(fourni)* | Barre de navigation — intégré | SVG |
| `client-sncf.svg` … | Bandeau de références et cartes de retours, à la place des noms en toutes lettres | SVG, fond transparent |
| `portrait-provillard.jpg` | Citation mise en avant, à la place des initiales | JPG, carré, ≥ 400 px |
| `plateforme-*.png` | Cartes produit, à la place des interfaces reconstituées en HTML | PNG, ≥ 1200 px de large |
| `ambiance-*.jpg` | Fonds de cartes, à la place des peintures générées | JPG, ≥ 1600 px de large |

> **Sur `logo.svg`** : le fichier fourni est une image matricielle de 278 × 115 px
> encapsulée dans une enveloppe SVG (export Figma en bitmap), et non un tracé
> vectoriel. Il passe pour la barre de navigation, y compris sur écran à haute
> densité. Il ne conviendra ni à un affichage plus grand, ni à une impression,
> ni à un changement de couleur. Un export vectoriel serait à demander pour la
> mise en production.

## Contraintes

- **Poids** : viser moins de 400 Ko par image. Les fonds d'ambiance sont
  redimensionnés à l'intégration.
- **Droits** : photos de personnes uniquement avec autorisation écrite ;
  logos clients uniquement avec accord de citation.
- **Nommage** : sans accent ni espace, en minuscules, séparé par des tirets.

## Deux destinations, une seule source

La page est publiée à deux endroits :

- **Vercel**, qui sert les fichiers de ce dossier tels quels ;
- **un aperçu partageable**, dont la politique de sécurité interdit toute
  image distante.

`tools/build-apercu.mjs` règle le second cas : il encode les images du dossier
directement dans le fichier publié. Rien à faire de votre côté, les images
n'existent qu'ici.
