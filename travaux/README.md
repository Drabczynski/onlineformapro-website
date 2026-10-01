# Travail en cours

Dossier accessible depuis la plaque « Travail en cours » de la page d'accueil.
`/travaux/` est une simple liste : chaque ligne ouvre une pièce.

| Ligne de la liste | Ouvre |
|---|---|
| Baromètre IA 2026 | `/enquete/` — la maquette de l'enquête |
| Gagnants d'appels d'offre | `gagnants-fle/` — la table des 45 organismes |
| Mailing des gagnants | `mailing-gagnants/` — 39 organismes, 348 adresses |
| Poster Octobre Rose | `poster-octobre-rose.webp` |
| Mailing FLE Plateforme | `mailing-fle-plateforme.pdf` |
| Poster FICA | `poster-fica.webp` |

**Masqué pour l'instant** : la ligne « Rendez-vous tournage Auguste prix »,
groupe « À faire ». Elle est commentée dans `index.html` entre les repères
`MASQUÉ` et `FIN DU BLOC MASQUÉ` — retirer le commentaire la remet en place.
La page `tournage/` et sa pièce jointe `question-video.docx` n'ont pas bougé
et restent accessibles en direct.

Chaque ligne porte un marqueur d'état : cercle vide tant que la pièce est en
cours, coche verte quand elle est finie. Pour basculer une ligne, remplacer
`<span class="st" aria-hidden="true"></span>` par le bloc `<span class="st ok">`
du Baromètre, et le libellé `.sr` qui suit (« En cours » / « Terminé », lu par
les lecteurs d'écran, invisible à l'œil).

`travaux.css` est la feuille commune aux trois pages.

## Les trois sources de données

| Fichier | Alimente |
|---|---|
| `prospection-fle.csv` | la table des gagnants |
| `mails-fle.csv` | les adresses, par organisme |
| `contacts-hunter.csv` | les fiches nominatives, par domaine |

Les deux fichiers d'adresses sont **fusionnés sur le nom de domaine**. Quand la
même adresse figure dans les deux, c'est la fiche de `contacts-hunter.csv` qui
est retenue : elle porte un nom, une fonction et la marque décideur. Dans
chaque bloc, l'ordre est : adresse recommandée, décideurs, contacts nommés,
adresses génériques.

Un domaine partagé sert plusieurs organismes : `greta-cfa.ac-lyon.fr` apparaît
sous GRETA CFA Loire et sous GRETA CFA de l'Ain, avec les mêmes fiches
académiques. C'est voulu, les deux sont joignables à ces adresses.

Trois adresses gabarit rendues par l'outil de recherche sont écartées à la
génération : `f.last@`, `undetermined@`, `unknown_not_verified@`.

## Régénérer

```bash
python3 tools/build-travaux.py
```

Le script réécrit uniquement les fragments situés entre marqueurs
(`COUNT:…`, `TABLE:…`, `LISTE:…`) dans `gagnants-fle/index.html` et
`mailing-gagnants/index.html`.

## Encodages

Les deux CSV d'origine arrivaient abîmés et ont été réécrits en UTF-8 :

- `prospection-fle.csv` était en **Windows-1252**, séparateur de milliers perdu
  à l'enregistrement (`1?260?000`) ; l'espace fine insécable a été rétablie.
- `mails-fle.csv` était en **cp850** (encodage DOS), apostrophes et tirets
  remplacés par des `?` ; ils ont été rétablis selon le contexte.
- `contacts-hunter.csv` était déjà propre, seule la marque d'ordre d'octets a
  été retirée.

## Encore attendu

- **Les PDF des deux affiches**, si vous voulez qu'elles s'ouvrent en PDF
  plutôt qu'en image : déposer les fichiers ici et changer les deux `href`
  dans `index.html`.
- **Les contacts des 7 organismes restants** : RH Reflex, GRETA CFA Lyon
  Métropole, FCR Lyon, GRETA CFA Rhône, FCR 38, FCR PDS, INFREP Ardèche.
