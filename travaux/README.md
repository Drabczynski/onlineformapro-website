# Travail en cours — pièces sources

Les fichiers de ce dossier alimentent la section « Travail en cours » de la
page d'accueil (`index.html`).

| Fichier | Usage |
|---|---|
| `prospection-fle.csv` | source de la table « Gagnants d'appels d'offre » |
| `poster-octobre-rose.webp` | affiche du concert Couleur Soul du 15 octobre |
| `mailing-fle-plateforme.pdf` | la newsletter, telle que fournie |
| `mailing-fle-plateforme.webp` | aperçu de la newsletter, affiché dans la page |
| `poster-fica.webp` | affiche « L'IA au service de la formation » |

## Mettre la table à jour

Modifier `prospection-fle.csv`, puis depuis la racine du dépôt :

```bash
python3 tools/build-travaux.py
```

Le script réécrit uniquement le fragment situé entre les marqueurs
`COUNT:PROSPECTION-FLE` et `TABLE:PROSPECTION-FLE` de `index.html`. Le reste de
la page n'est pas touché.

Le CSV d'origine était en Windows-1252 et son séparateur de milliers avait été
perdu à l'enregistrement (`1?260?000`). La copie de ce dossier est en UTF-8,
avec une espace fine insécable rétablie dans les montants.

## Deux choses encore attendues

- **Les contacts du mailing** : organisme, nom, fonction, adresse. Un fichier,
  un tableur ou du texte collé suffisent.
- **Les PDF des deux affiches**, si vous voulez les afficher à la place des
  images. Pour l'instant la page montre les images fournies.
