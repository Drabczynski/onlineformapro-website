# Direction « Lancement » — prototype interactif du baromètre IA

Registre : les pages de lancement des produits SaaS (fond sombre, halos animés,
grain, filets d'un pixel, éclat qui tourne, produit montré en flottant).
Trois écrans réellement cliquables : couverture → question 1 → résultat.

- Clavier : `1`–`6` pour répondre, `Entrée` pour continuer, `Échap` pour revenir.
- La pastille en bas au centre permet de sauter d'un écran à l'autre.

## Fichiers

| Fichier | Rôle |
|---|---|
| `source.html` | la source à modifier — contient `@@SANS@@` / `@@MONO@@` |
| `index.html`  | le fichier publié — fontes en base64, aucune dépendance réseau |
| `fonts/`      | les woff2 injectés (sous-ensemble latin) |

Reconstruire `index.html` après une modification de `source.html`, depuis ce
dossier :

```bash
python3 - <<'PY'
import base64, pathlib
s = pathlib.Path('source.html').read_text(encoding='utf-8')
out = (s.replace('@@SANS@@', base64.b64encode(pathlib.Path('fonts/instrument.woff2').read_bytes()).decode())
        .replace('@@MONO@@', base64.b64encode(pathlib.Path('fonts/jetbrains.woff2').read_bytes()).decode()))
pathlib.Path('index.html').write_text(out, encoding='utf-8')
PY
```

## Pourquoi les fontes sont en base64 et non en lien Google Fonts

Deux raisons. La politique de sécurité de l'aperçu partageable interdit les
images distantes et rend les fontes distantes fragiles ; et le navigateur de
vérification utilisé dans ce conteneur ne fait pas confiance à l'autorité de
certification du proxy, si bien qu'un lien vers `fonts.googleapis.com` se
chargeait en silence avec la fonte de repli — les captures de contrôle ne
montraient donc pas la vraie typographie. Les fontes injectées suppriment les
deux problèmes.

Typographie : **Instrument Sans** (titrage et courant) et **JetBrains Mono**
(relevés, indices, micro-libellés), toutes deux sous licence SIL OFL.

## Honnêteté du contenu

Tout le texte vient de `enquete/index.html` (`PARTIES`, `ECRANS`, `NIVEAUX`,
`AXES`). L'écran de résultat affiche des valeurs d'illustration, signalées
comme telles par une pastille « Exemple » sur les deux écrans concernés.
Aucun chiffre d'entreprise, nom de client ni témoignage n'est inventé.
