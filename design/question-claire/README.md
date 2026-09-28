# Écran de question — thème clair

Le soin des pages de lancement SaaS, mais en clair : voiles de couleur très
dilués, grille fine en fondu, grain, filets d'un pixel, ombres en couches,
touches de clavier en relief, survol qui soulève la carte. Aucune inversion de
thème : le baromètre reste clair.

La palette est celle du site, reprise telle quelle de `catalogue/index.html`
(lignes 13 à 18) : `#F7F7F7` de fond, `#FFFFFF` pour les cartes, `#0F0F0F`,
`#6E6E6E`, `#9B9B9B` pour le texte, `#E01A4F` en unique couleur d'accent.

Le prototype enchaîne les **trois vraies questions de la partie 1**, reprises
telles quelles du tableau `ECRANS` de `enquete/index.html` :

1. Quel est votre type d'organisme ? — 6 réponses
2. Combien de personnes travaillent dans votre organisme ? — 5 réponses
3. Combien d'apprenants formez-vous chaque année ? — 5 réponses

Clavier : `1`–`6` pour répondre, `Entrée` pour continuer, `Retour arrière` pour
revenir. La bande des huit segments, sous la barre haute, montre l'avancement
dans la partie en cours. Après la troisième question, le prototype revient au
début.

## Fichiers

| Fichier | Rôle |
|---|---|
| `source.html` | la source à modifier — contient `@@SANS@@` / `@@MONO@@` |
| `index.html`  | le fichier publié — fontes en base64, aucune dépendance réseau |
| `fonts/`      | les woff2 injectés (sous-ensemble latin) |

Reconstruire `index.html` après une modification, depuis ce dossier :

```bash
python3 - <<'PY'
import base64, pathlib
s = pathlib.Path('source.html').read_text(encoding='utf-8')
out = (s.replace('@@SANS@@', base64.b64encode(pathlib.Path('fonts/instrument.woff2').read_bytes()).decode())
        .replace('@@MONO@@', base64.b64encode(pathlib.Path('fonts/jetbrains.woff2').read_bytes()).decode()))
pathlib.Path('index.html').write_text(out, encoding='utf-8')
PY
```

## Pourquoi les fontes sont injectées et non liées à Google Fonts

La politique de sécurité de l'aperçu partageable rend les fontes distantes
fragiles ; et le navigateur de vérification utilisé dans ce conteneur ne fait
pas confiance à l'autorité de certification du proxy, si bien qu'un lien vers
`fonts.googleapis.com` se chargeait en silence avec la fonte de repli — les
captures de contrôle ne montraient donc pas la vraie typographie. Les fontes
injectées suppriment les deux problèmes.

Typographie : **Instrument Sans** (titrage et courant) et **JetBrains Mono**
(numéros, libellés en petites capitales), toutes deux sous licence SIL OFL.

## Vérifié

Aucun débordement horizontal ni défilement parasite à 390, 768, 1280 et
1920 px, sur les trois questions. Les cartes de réponse gardent la même
largeur d'une question à l'autre. Les animations s'arrêtent sous
`prefers-reduced-motion`.

Le contenu affiché est celui du questionnaire réel. Aucun chiffre, nom de
client ni témoignage n'est inventé.
