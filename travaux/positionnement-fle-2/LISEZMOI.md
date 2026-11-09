# Test de positionnement FLE, version 2

Même test que la version 1 (`../positionnement-fle/`) : mêmes écrans, même moteur adaptatif,
mêmes sons d'interface. Seule la banque change : elle vient du PDF « EVAL POSITIONNEMENT v2 »
(export PowerPoint, 67 pages). La version 1 n'est pas modifiée.

- Page web : https://onlineformapro-website.vercel.app/travaux/positionnement-fle-2/
- `index.html` : la page web (sons en fichiers dans `sons/`).
- `test-positionnement.html` : la version artifact (sons et images intégrés, 3,6 Mo).
- Affichage : sur ordinateur, le téléphone posé au centre d'un fond gris ; sur un appareil tactile
  (téléphone, tablette) ou un écran de moins de 520 px, le test occupe tout l'écran, comme une application.
- Lisibilité : aucun texte de lecture sous 14 px ; contextes, messages et phrases agrandis.

## Contenu

113 questions : A1 61, A2 40, B1 12.

| Niveau | CO | CE | EE | EO | LG |
|---|---|---|---|---|---|
| A1 | 5 | 13 | 6 | – | 37 |
| A2 | 3 | 9 | 4 | 1 | 23 |
| B1 | 1 | 10 | 1 | – | – |

CO compréhension orale, CE compréhension écrite, EE expression écrite, EO expression orale,
LG langue (grammaire, conjugaison, vocabulaire). Le tag de chaque question est celui du PDF ;
le numéro de page du PDF est gardé dans `banque/banque-v2.json`.

Types de réponses :

- choix à toucher : un texte, ou une image quand le PDF propose des photos (A1-08, A1-12, A2-07).
  Les images prennent la place libre : sur deux colonnes (une en haut, deux en bas) quand l'écran
  le permet, sinon toutes les trois sur une ligne ;
- choix à écouter (A2-06, les trois phrases au guichet de la poste) ;
- mots à remettre dans l'ordre (A1-16) ;
- mot à écrire en touchant des lettres, pour l'expression écrite à mot court (A1-01, A1-02, A1-05,
  A1-06, A2-02, A2-10). La règle : une question d'expression écrite dont tous les choix du PDF sont
  des mots seuls de 8 lettres au plus. Les lettres proposées sont celles de ces choix : chaque
  lettre autant de fois qu'elle apparaît au plus dans un choix. Exemple : « La / Le / Les » donne
  a, e, l, s, affichées en majuscules sur les alvéoles. Rien n'indique la longueur du mot. Le mot s'écrit dans le trou de la phrase, avec une
  majuscule quand le trou ouvre la phrase. La touche rose efface la dernière lettre. Sur ordinateur,
  le clavier marche aussi ;
- réponse à écrire (A1-57 à A1-61, A2-39, A2-40). Les accents et les majuscules ne comptent pas,
  et plusieurs formes sont acceptées (« 22 », « 22 ans », « vingt-deux ans »).

## Moteur adaptatif (repris de la version 1)

- Trois paliers dans l'ordre : A1, A2, B1.
- 7 questions par palier, tirées au hasard. D'abord une question de chaque compétence présente
  à ce niveau, puis on complète en équilibrant les compétences.
- Deux questions d'un même groupe (même document, même son) ne tombent jamais dans le même palier.
- Palier validé avec 70 % de bonnes réponses, soit 5 sur 7. Le palier est joué en entier,
  sauf quand il ne peut plus être validé : le test s'arrête alors tout de suite.
- Résultat : le dernier niveau validé (« Niveau A1 », « Niveau A2 », « Niveau B1 »),
  ou « A1 en cours » si le premier palier n'est pas validé.
- Un diagnostic par compétence et par tag est calculé (`etat.diagnostic`), mais il n'est pas affiché.

## Sons

- `sons/o01.mp3` à `sons/o11.mp3` : les sons d'origine (`sons-source/`), mis au même volume.
  Les sons 01 à 08 et 11 servent. Le 09 (des trains, sans question) et le 10 (la seule question
  qui l'utilise est écartée, voir plus bas) sont copiés mais ne servent pas.
- `sons/consignes/` : 32 consignes A1 lues à voix haute, comme dans la version 1.
- `sons/poste/` : les trois phrases du guichet de la poste (A2-06).
- Consignes et phrases générées avec ElevenLabs par `../positionnement-fle/generer_sons.py`,
  à partir de `banque/sons-v2.json`.

## Reconstruire

```
python3 banque/banque_v2.py      # réécrit banque/banque-v2.json
python3 banque/assembler_v2.py   # réécrit index.html et test-positionnement.html
```

`assembler_v2.py` part de `../positionnement-fle/test-positionnement.html` (version 1)
et remplace la banque, le moteur, les sons et les images (`banque/img/`).

## Écarts avec le PDF

### Questions écartées

- « Je … le chemin autour du lac » et « Je … en parler » : questions incomplètes ou sans réponse sûre.
- « À qui est cette voiture ? » : la réponse marquée, « C'est ma. », est fausse.
- « Je prends un café … sucre » : en double avec une autre question, qui est gardée (réponse « du »).
- Deux questions B1 dont l'énoncé a été recopié par erreur : « Quelle est la profession de son père ? »
  au-dessus de réponses sur une écharpe et sur des boissons.
- « Trois jeunes étudiants… » : question incomplète.
- Le texte sur Ana : deux réponses sont vraies.
- « Est-ce que tu (prendre)… → as pris » et « Je (avoir) deux chats les jours ? » : énoncés incohérents.
- « (...) tu vas faire cet après-midi ? → que » : la réponse marquée est fausse (« Qu'est-ce que »).
- « avoir de la chance → Réussir trop facilement » : la définition marquée est fausse.
- « Où sont ces 2 dames ? » (son 08) : le son se passe au restaurant, mais c'est la photo des courses qui est marquée.
- B1, émission de radio (son 10) : deux photos, aucune n'est marquée et une seule correspond.
- Les questions en double ont été fusionnées.

### Réponses déduites (non marquées dans le PDF)

Le pluriel de « un cheval » (« Des chevaux »), « ferai », « ai », « appelle », « du »,
l'âge de Lucas (22 ans) et sa ville (Toulouse), « Qu'est-ce que » (au restaurant),
le jour où Julien commence à 8h (jeudi) et son cours d'arts plastiques (mardi, 13h00-14h00).

### Textes ajustés

- « De quoi est-ce que ça parle ? » : la question est coupée dans le PDF.
- « Margaret Marie » : le prénom entendu dans le son (la diapositive écrit « Maritz »).
- L'affiche du café : le zoom montre le 16 novembre.
- L'emploi du temps de Julien est affiché sans le mercredi ni le vendredi, pour un tableau plus grand
  et lisible. Les réponses (jeudi à 8h, mardi de 13h à 14h) ne changent pas. Le tableau complet du PDF
  reste dans `banque/banque_v2.py` (`EDT_PDF`).
- « Complétez la phrase. » à la place de « Choisissez la bonne réponse. » pour les questions où
  l'on écrit le mot avec les lettres (A1-01, A1-05, A2-02). La consigne lue existait déjà.
- A1-16 : « Remettez les mots dans l'ordre. » à la place de « Qu'est-ce que vous dites ? », pour moins
  de texte (le contexte reste au-dessus). Consigne lue générée avec ElevenLabs (`v2-q33`).
- A1-01 : l'infinitif « (parler) » indiqué sous la phrase.
- A1-13 : la phrase du PDF « Vous avez rendez-vous chez le dentiste et vous recevez un message. » est retirée.
- « Que répondez-vous ? » ajouté aux questions où l'on répond à un message. Une phrase de contexte
  ajoutée à A2-11 (« Au restaurant, le serveur présente la carte. ») ; les autres contextes viennent
  du PDF. Fautes de frappe corrigées.
