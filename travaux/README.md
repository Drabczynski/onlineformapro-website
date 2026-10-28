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
| Ouverture 3D du site | `site-onlineformapro/` — l'ouverture de l'accueil, lignes de lumière au défilement |
| Vidéo Plateforme FLE | `video-plateforme-fle/` — 23 s, 4:5, à partir des cinq visuels |
| Newsletter Outils Google | `newsletter-google/` — e-mail pour Brevo, d'après la maquette fournie |
| Site des modules IA | https://module-ia-pink.vercel.app/site/ — lien externe |
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
formateur ; enfin les fiches formatives en éventail (`fiches.jpg`), composées à partir des
cinq fiches fournies, rangées dans `fiches/` (WebP). Chaque visuel est une page HTML/CSS
rendue par Chromium.

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
les licences de 30 ou 90 jours et l'essai de 5 licences. Les niveaux A2/B1/B2 et la jauge
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

### Dans Beefree : un bloc HTML

`newsletter-civicap/beefree/` : la newsletter en un seul bloc « HTML » de Beefree. La page
`index.html` donne les trois gestes (e-mail vide, bloc HTML, coller) et le code, avec un
bouton « Copier le code » ; `bloc-html.txt` est le même code, fabriqué à partir de
`bloc-modele.html` (images en `{{BASE}}`).

    python3 tools/beefree-civicap.py images   # titre.png, puis committer et pousser
    python3 tools/beefree-civicap.py          # le code à coller

Pourquoi un bloc HTML : l'import HTML de Beefree reconstruit l'e-mail en blocs, et deux
essais sont arrivés en pièces. Le bloc HTML garde le code tel quel ; il fait partie des
offres payantes de Beefree d'après sa documentation.

Pourquoi un modèle à part : le bloc n'a pas d'en-tête, donc pas les règles mobiles de
`email.html`, et Gmail ignore une feuille de style posée dans le corps. Le modèle s'adapte
seul : le titre du bandeau est une image fluide (`beefree/img/titre.png`, rendue depuis les
polices de la marque) ; les trois cartes chiffres sont des blocs en ligne qui passent
l'une sous l'autre quand la place manque ; les titres de section sont en
30 px et sans longs groupes insécables ; les marges sont réduites. Les règles mobiles
restent dans le bloc pour les messageries qui les lisent, classes préfixées `cc-` (Beefree
a sa propre classe `pad`). Chaque lien porte `text-decoration:none`. Vérifié sans les
règles mobiles et sans les polices web (le cas de Gmail), à 320, 390 et 700 px : aucun
débordement.

Les images sont servies depuis `raw.githubusercontent.com`, figées sur le dernier commit qui
les a modifiées : le script refuse de tourner si une image est modifiée sans être committée.

`tools/insecables.py` ne touche plus au contenu des balises `<code>`, `<pre>` et `<textarea>` :
un nom de fichier, une version texte ou un code doit se copier tel quel.

## Vidéo Plateforme FLE

`video-plateforme-fle/plateforme-fle.mp4` : 23 secondes en 1080 × 1350 (4:5, le format qui
prend le plus de place dans un fil Facebook ou Instagram), 30 images par seconde, sans son.
Elle est faite des cinq visuels Onlineformapro fournis (`visuels/`, dans l'ordre de la
vidéo : ressources, parcours, vocabulaire, battles, évaluation). Les cinq partagent le même
en-tête au même endroit ; la vidéo le garde fixe, pris sur un seul visuel en pleine
résolution, et fait monter d'un visuel à l'autre le sous-titre et les captures, qui avancent
doucement pendant qu'ils sont à l'écran. La première image est déjà un visuel complet (la
vignette de Facebook). La fin reprend l'appel du mailing Plateforme FLE, « Demandez vos accès
démo », avec onlineformapro.com et projet@onlineformapro.com, adresses tirées du même mailing.

    FFMPEG=/chemin/vers/ffmpeg python3 tools/video-plateforme-fle.py [--essai]

Chaque image est une page HTML rendue par Chromium à un instant donné, puis encodée en H.264
par ffmpeg (sans ffmpeg installé : `pip install imageio-ffmpeg` en fournit un). `--essai`
sort quelques images fixes pour vérifier un réglage sans tout rendre.

### Montage face caméra

`tools/montage-plateforme-fle.py` monte la vidéo face caméra sur la Plateforme FLE
(30 s de parole, 9:16) : sous-titres mot à mot (transcription Whisper « base » en local,
via le paquet npm `sts-whisper-base` et transformers.js, texte corrigé à la main sur son
minutage), zooms à chaque phrase, captures de la plateforme posées sur le buste au moment
où elles sont nommées, carte de fin « Demandez vos accès démo », son à -14 LUFS. Ni la
vidéo source ni le montage ne sont dans le dépôt : on y voit la personne qui parle, et le
dépôt est public.

## Newsletter Outils Google

`newsletter-google/` : la maquette fournie (`maquette.jpg`, 556 px de large) écrite en e-mail
pour Brevo. `brevo.html` est le code à coller (« Coller votre code »), `email.html` le même
avec des images en chemins relatifs pour l'aperçu, `index.html` la page avec le bouton
« Copier le code », les étapes, l'objet et l'aperçu proposés.

    python3 tools/newsletter-google.py images   # recadre les visuels, puis committer et pousser
    python3 tools/newsletter-google.py          # écrit email.html, brevo.html et la zone de code

Titres, cartes, pastilles et boutons sont du vrai texte ; le logo Google, les icônes et la
photo du bas sont recadrés dans la maquette, bords fondus dans la couleur de leur bloc. Les
cartes sont des blocs en ligne de 260 px : deux de front sur ordinateur, l'une sous l'autre
sur téléphone, sans dépendre des règles mobiles. Vérifié de 320 à 640 px, avec et sans la
police Plus Jakarta Sans. « Contactez-nous » ouvre un e-mail vers projet@onlineformapro.com,
à confirmer ; le pied utilise `{{ mirror }}` et `{{ unsubscribe }}` de Brevo.

## Ouverture 3D du site Onlineformapro

`site-onlineformapro/` : maquette de l'ouverture de la page d'accueil, au plus près de
madarplatform.com pour pouvoir ensuite l'ajuster par petites touches. Une scène reste
épinglée à l'écran ; la caméra y parcourt un monde fixe de lignes de lumière (three.js)
pendant que les textes défilent. Les vues suivent celles du modèle : le logo de l'accueil,
l'autoroute et ses lacets, le graphique de pics (la puissance de l'IA), le carrefour vu
d'en haut (la solution globale et modulaire), le croisement en X entouré d'anneaux (17
millions d'utilisateurs), la ligne droite puis l'éventail de lignes (la demande de démo).
Textes et liens repris du site officiel, aucun visuel. La partie plus classique du site
viendra avec le prochain modèle.

À l'arrivée, le Ó du logo est dessiné en routes, aux proportions du logo : l'anneau en route
circulaire à trois paires de voies où la lumière circule, l'accent en bretelle aux bouts
arrondis, des arcs de cercle autour (comme au croisement en X) et une bretelle qui rejoint
l'autoroute. La caméra descend ensuite vers les appareils, qui accompagnent le texte « 25 ans
de pédagogie ».

Les objets, d'après les croquis, sont dessinés comme le camion du modèle : des traits de
lumière fins à angles vifs sur leurs arêtes, et leur volume, de la couleur exacte du fond,
qui cache les traits situés derrière (d'où l'impression d'objet plein). Dans le virage de
l'autoroute, un ordinateur portable, un smartphone et une tablette. Au-dessus du carrefour,
un cube aux arêtes adoucies : au titre, ses trois modules orangés sont détachés, avec des
pointillés vers leur place ; chacun s'emboîte à l'entrée de sa carte (LMS OnlineManager,
OnlineAgora, OnlineVisio) et brille tant qu'elle est à l'écran ; à la troisième, le cube est
complet. Au croisement en X, une planète (méridiens, parallèles, un liseré qui suit son
contour avec deux arcs orangés) dans une poussière fine de particules. Au bout de
l'éventail, le bâtiment de la R&D, qui apparaît avec la carte « Vous avez un projet ? ».
Objets construits en code, sans fichier 3D : `objets.js`.

Le code et les tracés sont les nôtres ; la mécanique et les réglages sont relevés sur le
modèle : hauteurs des blocs en svh, caméra quasi arrêtée (5 % d'avance) pendant les cartes
de chaque chapitre, défilement amorti par Lenis (`lerp` 0,1), apparitions des titres et
des textes lettre par lettre (mêmes images clés), cartes qui se dévoilent de bas en haut en
1,6 s, tubes fins dont la lumière pulse le long des routes, brouillard, tonalité ACES, halo,
deux lueurs bleues. Couleurs : le bleu, l'orangé et le blanc du modèle ; pour passer au
rouge de la marque, changer `rouge` dans `COULEURS` (en tête de `monde.js`).

`monde.js` : le décor (logo, routes, carrefours, pics, anneaux, éventail), les stations de
la caméra et le rendu ; `objets.js` : les objets. `ouverture.js` : les mesures de la page,
le calage des stations et des modules du cube sur les textes, les apparitions, les cartes,
le bouton « Animations ». `ouverture.css` : la mise en
page, à l'échelle d'un écran de 1440 × 900. three.js 0.170.0 (et ses passes d'effets) et
Lenis 1.3.23 sont copiés dans `vendor/` (licences MIT jointes) et chargés par une importmap :
rien ne dépend d'un CDN. Modules JavaScript : la page se sert par http, elle ne s'ouvre pas
en `file://`.

Accessibilité : la scène est décorative, tout le texte est dans la page, dans l'ordre de
lecture (les titres découpés pour l'animation gardent une copie lisible). Réglage « réduire
les animations » du système, ou bouton « Animations » (retenu dans le navigateur) : ni
défilement amorti, ni apparitions, et la caméra passe d'une vue à l'autre sans glisser.
Sans WebGL, les textes restent sur le fond bleu. Sur téléphone, les cartes deviennent des
vitres en bas de l'écran, la caméra centre les objets et les traits sont plus épais.
Vérifié à 1440 × 900 et 390 × 844, avec et sans animations, sans débordement horizontal.

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

- une question fréquente reste de côté, faute de réponse visible sur les captures :
  « Où sont hébergées les données ? ». Sa place est marquée en commentaire dans le HTML.
  « Faut-il une carte bancaire pour l'essai ? » est revenue : le formulaire réel répond
  « Aucune carte bancaire demandée » ;
- le formulaire d'essai reprend les champs du formulaire réel (organisme, SIRET, prénom,
  nom, e-mail professionnel, téléphone et stagiaires par an facultatifs, case des CGV et
  de la politique de confidentialité). Seules les tranches de « Stagiaires par an » sont
  provisoires : elles n'étaient pas visibles. Il n'envoie rien : un message le dit si on
  le soumet ;
- les liens « Espace stagiaire », « Espace organisme », « Mentions légales », « CGV » et
  « Confidentialité » (pied de page et case du formulaire) pointent sur `#`.

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

`mailing-gagnants/contacts-mailing.csv` (lien « Toutes les adresses en CSV » en haut de
la page) réunit les adresses envoyables des deux sections, régénéré par le même script :
exactement celles que les boutons « Copier » donnent, soit ni AKSIS (« Ne pas contacter »)
ni les domaines sans messagerie, et chaque adresse une seule fois (colonne `liste` à
« OFII + FLE » quand elle figure dans les deux). Colonnes : email, organisme, domaine,
liste, nom, fonction, décideur, confiance (indice OFII). Point-virgule et UTF-8 avec BOM,
pour Excel en français. La colonne `nom` hérite du défaut de l'export OFII signalé sur la
page : pas de publipostage sur le prénom.

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
