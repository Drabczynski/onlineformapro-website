# Travail en cours

Dossier accessible depuis la plaque « Travail en cours » de la page d'accueil.
`/travaux/` est une simple liste : chaque ligne ouvre une pièce.

| Ligne de la liste | Ouvre |
|---|---|
| Gagnants d'appels d'offre | `gagnants-fle/` — la table des 45 organismes |
| Mailing des gagnants | `mailing-gagnants/` — en attente des contacts |
| Poster Octobre Rose | `poster-octobre-rose.webp` |
| Mailing FLE Plateforme | `mailing-fle-plateforme.pdf` |
| Poster FICA | `poster-fica.webp` |

`travaux.css` est la feuille commune aux trois pages. `prospection-fle.csv` est
la source de la table.

## Mettre la table à jour

Modifier `prospection-fle.csv`, puis depuis la racine du dépôt :

```bash
python3 tools/build-travaux.py
```

Le script réécrit uniquement les deux fragments situés entre les marqueurs
`COUNT:PROSPECTION-FLE` et `TABLE:PROSPECTION-FLE` de
`travaux/gagnants-fle/index.html`.

Le CSV d'origine était en Windows-1252 et son séparateur de milliers avait été
perdu à l'enregistrement (`1?260?000`). La copie de ce dossier est en UTF-8,
avec une espace fine insécable rétablie dans les montants.

## Deux choses encore attendues

- **Les contacts du mailing** : organisme, nom, fonction, adresse. Un fichier,
  un tableur ou du texte collé suffisent.
- **Les PDF des deux affiches**, si vous voulez qu'elles s'ouvrent en PDF
  plutôt qu'en image. Il suffira de déposer les fichiers ici et de changer les
  deux `href` dans `index.html`.
