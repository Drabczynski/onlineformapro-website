# Mises en situation FLE — les dialogues en sons

Source : `source/Mises_en_situation_FLE_Niveau_A1.xlsx` (onglet « Mises en situation », colonne « Dialogue / support »,
147 situations). Nommage : `A1-s1.mp3` … `A1-s147.mp3`, le numéro est celui de la colonne « N° ».

    python3 generer.py A1 1-10      # fait A1-s1 à A1-s10 (ce qui est déjà fait n'est pas refait)

- **`A1/A1-sN.mp3`** : le dialogue, avec une ambiance discrète du lieu dessous (bruitage ElevenLabs, sans voix ni
  musique, environ 15 à 20 dB sous les voix ; fondu au début et à la fin).
- **`A1/voix-seules/A1-sN.mp3`** : le même dialogue sans ambiance.
- **`textes-A1.json`** : pour chaque son, les répliques dites, la voix de chaque rôle et la description de l'ambiance.

Voix : `voix.json` (créées par `creer_voix.py`, qui garde le plus fluide des trois aperçus proposés). Le dialogue est joué d'un seul coup par le modèle **v4** d'ElevenLabs (text-to-dialogue), ce qui donne le rythme
d'une vraie conversation. Quatre **voix créées pour ce travail** avec l'outil de création de voix d'ElevenLabs (Française /
Français de 35-40 ans, accent standard, ton naturel, micro proche, studio sec sans réverbération), choisies à l'écoute et
enregistrées sur le compte sous « FLE situations - Femme 1 / Femme 2 / Homme 1 / Homme 2 ». Chaque rôle prend une voix
selon son genre (« Boulangère », « Cliente », « Vendeuse »… sont des femmes) ; deux personnes du même genre ont deux voix
différentes. 0,8 s de calme au début, 1 s à la fin. Pour varier, quatre voix de plus (Femme 3 : une vingtaine d'années ;
Femme 4 : la cinquantaine ; Homme 3 : 25 ans ; Homme 4 : 60 ans) ; à partir de la situation 11, les voix tournent d'une
situation à l'autre (de 1 à 10, les deux premières de chaque genre, déjà validées). Les prix « 4,50 euros » sont dits
« 4 euros 50 », les heures « 10 h 15 » « 10 heures 15 ». Lignes qui ne sont pas des personnes : « Écran » (distributeur,
s25) est lu par une voix off ; « SMS reçu » / « Réponse » (s31) sont lus par deux voix, comme leurs auteurs. Léa (s30)
a la voix de femme jeune (`VOIX_FORCEE`). Les documents (fiche, mot de l'enseignante, mail, offre d'emploi, écran) sont
lus par une seule voix off, la consigne par une autre ; les blancs à remplir (« ______ ») ne se lisent pas, chaque champ
devient une courte phrase (« Nom. Prénom. »). « 3 kilos » est écrit en lettres pour la voix (lu « kilogrammes » sinon),
« CDD » / « CDI » épelés. La guide de s64 est une femme (« Je m'appelle Julie »).

Premier essai abandonné : répliques générées une à une (modèle v2), ralenties et collées avec des blancs fixes — pas
naturel ; et les voix de la bibliothèque sont des clones de comédiens enregistrés dans des conditions très variables
(réverbération, micro lointain, ton radio).

Vérification : les 80 premiers sons ont été retranscrits (comparaison mot à mot pour 41 à 80) par la reconnaissance vocale ElevenLabs ; chaque réplique est
dite telle qu'écrite.

Corrigé pour la voix (coquilles de l'Excel) : situation 9, « Bonjou Madame r. » → « Bonjour, madame. » ; situation 18,
« Elel adore le toboggan » → « Elle adore le toboggan. » ; situation 35, « une den » → « une dent ».

À prévoir pour la suite : l'ambiance est décrite à la main pour chaque situation (`AMBIANCE` dans `generer.py`, faite
pour 1 à 80) ; certains dialogues ont des lignes qui ne sont pas des personnes (« Consigne », « Écran », « Formulaire »…),
à décider avant de les faire (voix off neutre, ou pas lues).
