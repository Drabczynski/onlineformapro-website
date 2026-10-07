# Travail en cours

Dossier accessible depuis la plaque « Travail en cours » de la page d'accueil.
`/travaux/` est une simple liste : chaque ligne ouvre une pièce.

| Ligne de la liste | Ouvre |
|---|---|
| Tournage Auguste | `tournage/` — le conducteur, 12 questions, + le Word |
| Baromètre IA 2026 | `/enquete/` — la maquette de l'enquête |
| Gagnants d'appels d'offre FLE | `gagnants-fle/` — la table des 45 organismes |
| Mailing des gagnants | `mailing-gagnants/` — OFII puis FLE, les deux campagnes |
| Newsletter CiviCap | `newsletter-civicap/` — objets, e-mail, version texte |
| Page organismes CiviCap | `page-civicap/` — la refonte de la page « organismes » |
| Poster Octobre Rose | `poster-octobre-rose.webp` |
| Mailing FLE Plateforme | `mailing-fle-plateforme.pdf` |
| Poster FICA | `poster-fica.webp` |

Chaque ligne porte un marqueur d'état : cercle vide tant que la pièce est en
cours, coche verte quand elle est finie. Pour basculer une ligne, remplacer
`<span class="st" aria-hidden="true"></span>` par le bloc `<span class="st ok">`
du Baromètre, et le libellé `.sr` qui suit (« En cours » / « Terminé », lu par
les lecteurs d'écran, invisible à l'œil).

`travaux.css` est la feuille commune aux pages du dossier.

## Newsletter CiviCap

`newsletter-civicap/email.html` est l'e-mail lui-même, en tableaux et styles
en ligne, prêt à coller dans l'outil d'envoi. `index.html` porte les objets,
l'aperçu, la version texte et la liste de ce qui reste à fournir.

`img/` porte les visuels de l'e-mail, fabriqués par `tools/illustrations-civicap.py` :
deux fonds en JPEG (`fond-hero.jpg`, le dégradé de marque quadrillé du bandeau de tête ;
`fond-cta.jpg`, l'aurore du bloc final), l'en-tête photo de la carte blanche
(`entete-photo.jpg`), la coche du badge (`coche.png`, en image pour un alignement exact)
et cinq fragments d'interface en PNG double densité : la démonstration du 14 juillet en
pile de questions, puis les trois modes de la page organismes (l'entraînement libre,
l'examen blanc, la révision par thème en cartes mémoire) et le suivi des stagiaires côté
formateur. Chaque visuel est une page HTML/CSS rendue par Chromium.

Typographie de l'e-mail : titres et chiffres en Instrument Sans, mots mis en valeur en Instrument
Serif italique, texte en Inter, chargés depuis Google Fonts là où la messagerie le permet
(Apple Mail, iOS). Ailleurs, la pile système prend le relais, et l'italique retombe sur
Georgia — Outlook compris, grâce à la classe `serif` reprise dans son bloc conditionnel.

`photos/formatrice-ordinateur.jpg` : une formatrice montre son ordinateur à une personne
en formation, photo Unsplash de UK Black Tech (unsplash.com/photos/1g96LfUK3lU), licence
Unsplash (usage commercial libre, crédit non obligatoire, aucun droit sur les marques
visibles : la carte d'interface posée sur l'ordinateur en couvre le logo). C'est la
version de 400 px de large : le réseau de l'environnement de travail bloquait
`images.unsplash.com`. Elle est montrée à sa taille, jamais étirée ; pour un original plus
grand, le déposer sous le même nom et régénérer.

Coupures de ligne : `tools/insecables.py` pose les espaces insécables du texte de
l'e-mail (voir la page organismes, plus bas) ; l'explication du visuel de tête passe par
les mêmes règles. Vérifié de 320 à 700 px, polices web et polices de repli : aucun mot
coupé, aucune ligne qui finit sur un mot court, aucun texte qui déborde.

Les informations reprennent la page « organismes » de CiviCap (captures fournies le
7 octobre) : les trois modes, l'espace formateur (scores, thèmes faibles, tests passés),
les licences de 7, 30 ou 90 jours et l'essai de 5 licences. Les niveaux A2/B1/B2 et la jauge
de préparation, repris de civicap.app (le site grand public), ont été retirés : la page
organismes ne les mentionne pas. Le suivi porte la mention « Exemple ». L'explication du
14 juillet est traduite de sa version arabe, la seule présente dans la copie du site
transmise : à remplacer par le texte exact de CiviCap. Le script télécharge
Inter et Caveat depuis Google Fonts au premier lancement : il faut un accès réseau pour
régénérer.

Le logo `logo-civicap.png` est un recadrage de la capture d'écran fournie
(313 × 111 px, fond ramené au blanc pur par remplissage depuis les bords) :
il dépanne à l'écran, il faudra le fichier d'origine avant l'envoi. Dans
l'outil d'envoi, son chemin devra aussi devenir une adresse absolue.

## Page organismes CiviCap

`page-civicap/index.html` est la refonte de la page « Pour les organismes de formation »
de CiviCap, dans le langage visuel de la newsletter : le dégradé de marque quadrillé, des
cartes blanches, des titres en Instrument Sans avec un mot en Instrument Serif italique,
des fragments d'interface sous verre et un bloc final sombre. Page autonome (HTML, CSS et
pictogrammes en ligne, polices Google Fonts), lisible de 390 à 1440 px.

Les textes viennent des captures de la page actuelle : accroche, constat, méthode pensée
pour les formateurs, trois parcours, trois modes, cinq thèmes, tarifs, étapes, questions
fréquentes. La réponse à « Cette plateforme est-elle un site officiel ? » reprend la
mention de civicap.app. Les fragments d'interface (espace organisme, fiche stagiaire,
licences, écran d'examen) sont des illustrations, pas des captures : initiales seulement,
mention « Exemple » sur les données de stagiaires. La question sur la laïcité et ses
quatre réponses sont celles de la démonstration de civicap.app.

À compléter avant de la mettre en ligne :

- deux questions fréquentes ont été laissées de côté, faute de réponse visible sur les
  captures (accordéons fermés) : « Faut-il une carte bancaire pour l'essai ? » et « Où
  sont hébergées les données ? ». Leur place est marquée en commentaire dans le HTML ;
- le formulaire d'essai : seul le champ « Nom de l'organisme » était visible. « Votre nom »
  et « E-mail professionnel » sont des hypothèses, à aligner sur le vrai formulaire. Il
  n'envoie rien : un message le dit si on le soumet ;
- les liens « Espace stagiaire », « Espace organisme », « Mentions légales », « CGV » et
  « Confidentialité » pointent sur `#`.

Les coupures de ligne suivent les règles de la typographie française, posées par
`tools/insecables.py` (à relancer après chaque modification de texte, sur la page comme
sur l'e-mail) : insécable après les mots courts (« à », « de », « et »…), entre un nombre
et son unité, avant « : ; ! ? % € », traits d'union insécables, et les deux derniers mots
de chaque paragraphe ensemble. Les titres et libellés courts sont réglés à la main.

`img/logo-civicap.png` est le logo de la newsletter détouré (fond blanc rendu
transparent) pour se poser sur la barre de verre ; `img/entete-photo.jpg` est l'en-tête
photo de la newsletter, recopié tel quel.

## Les sources de données

| Fichier | Alimente |
|---|---|
| `prospection-fle.csv` | la table des gagnants FLE |
| `mails-fle.csv` | les adresses FLE, par organisme |
| `contacts-hunter.csv` | les fiches nominatives FLE, par domaine |
| `contacts-ofii.csv` | les contacts OFII (export Hunter, 275 lignes) |

Les deux fichiers d'adresses sont **fusionnés sur le nom de domaine**. Quand la
même adresse figure dans les deux, c'est la fiche de `contacts-hunter.csv` qui
est retenue : elle porte un nom, une fonction et la marque décideur. Dans
chaque bloc, l'ordre est : adresse recommandée, décideurs, contacts nommés,
adresses génériques.

`mailing-gagnants/index.html` porte **les deux campagnes, dans deux sections
distinctes** : « Gagnants OFII » d'abord, « Gagnants FLE » ensuite. Chaque section a
son propre compte, son propre chapeau et sa propre liste. Dans le HTML, les quatre
marqueurs les délimitent : `COUNT:OFII` / `LISTE:OFII` pour la première,
`COUNT:MAILS` / `LISTE:MAILS` pour la seconde. Le titre de la page est un `h1`, celui
d'une section un `h2`, celui d'un organisme un `h3` — ne pas remonter ce niveau, la
hiérarchie est ce qui sépare les deux listes pour un lecteur d'écran.

Un domaine partagé sert plusieurs organismes : `greta-cfa.ac-lyon.fr` apparaît
sous GRETA CFA Loire et sous GRETA CFA de l'Ain, avec les mêmes fiches
académiques. C'est voulu, les deux sont joignables à ces adresses.

Trois adresses gabarit rendues par l'outil de recherche sont écartées à la
génération : `f.last@`, `undetermined@`, `unknown_not_verified@`.

## Organismes à ne pas contacter

Le dictionnaire `EXCLUS` en tête de `tools/build-travaux.py` liste les
organismes à exclure du mailing, par nom normalisé. **AKSIS** y figure.

Un organisme exclu garde ses adresses à l'écran, pour mémoire, mais le bloc
porte la mention « Ne pas contacter », les adresses sont barrées et ne sont
plus des liens `mailto:`, et le bouton de copie disparaît — on ne peut donc
ni les copier en masse ni ouvrir un message par mégarde.

Pour en ajouter un, une ligne suffit :

```python
EXCLUS = {
    "aksis": "Ne pas contacter",
    "<nom normalisé>": "Ne pas contacter",
}
```

La clé est le nom passé par `_cle()` : minuscules, sans accent ni espace ni
ponctuation.

## Campagne OFII

`contacts-ofii.csv` est l'export Hunter brut, débarrassé de sa marque d'ordre
d'octets. Le générateur groupe par domaine et applique deux filtres de
délivrabilité :

- **Syntaxe.** Une adresse mal formée est écartée. Une seule l'est ici :
  `reclamation.@mooveus.fr`, point collé devant l'arobase.
- **MX.** Un domaine sans serveur de messagerie actif ne reçoit rien. Ses
  adresses restent affichées mais barrées, non cliquables, sans bouton de
  copie. Trois domaines sont concernés, dont `esf-formations.com` avec ses
  17 adresses.

Trois domaines apparaissent aussi dans la campagne FLE — `infrep.org`,
`mooveus.fr`, `nouvelle-donne-formation.org` — et leur bloc renvoie à la section du
dessous, pour ne pas écrire deux fois au même organisme.

La colonne « nom » de l'export n'est pas fiable : elle contient parfois un
fragment de phrase plutôt qu'une identité (« contact avec », « sur demande »,
« des DREETS »). Elle est affichée telle quelle, sans correction silencieuse,
et la page avertit de ne pas publiposter sur le prénom.

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
