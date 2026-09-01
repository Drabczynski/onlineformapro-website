# Logos clients

Déposer ici les logos des organisations citées sur la page. Ils remplaceront
les noms actuellement affichés en toutes lettres, à trois endroits :

1. le bandeau défilant « Ils forment avec notre contenu e-learning » ;
2. les cartes des deux rangées de références ;
3. le visuel des études de cas, où le logo se pose sur l'image.

## Nommage attendu

Un fichier par organisation, en minuscules, sans accent ni espace :

```
sncf.svg
ministere-agriculture.svg
banque-populaire.svg
bouygues-telecom.svg
stmicroelectronics.svg
fiducial-informatique.svg
esc-amiens.svg
maison-de-la-formation.svg
estc-marseille.svg
```

Signalez-moi l'ajout : je les branche, y compris partiellement — un logo
manquant garde simplement son nom en toutes lettres.

## Format

- **SVG vectoriel**, pas une image matricielle enveloppée dans du SVG
  (l'export Figma produit souvent le second : vérifier que le fichier
  contient des `<path>` et non un `<image>`).
- **Fond transparent**, sans cadre ni marge intégrée.
- **Version monochrome** de préférence, ou tracés utilisant `currentColor` :
  le même fichier sert en gris sur fond clair et en blanc sur les visuels
  sombres. À défaut, fournir les deux déclinaisons, suffixées `-noir` et
  `-blanc`.
- Hauteur libre : la mise à l'échelle se fait en CSS.

## Droits

Un logo client ne s'affiche qu'avec **l'accord de citation de l'organisation
concernée**. Pour les administrations et les entreprises publiques, cet accord
passe souvent par leur direction de la communication et peut imposer une
version précise du logo et une zone de protection. À vérifier avant mise en
ligne, pas après.
