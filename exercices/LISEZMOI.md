# Exercices

Les cinq exercices des captures, dans la page des activités FLE elle-même (même charte, même moteur) :
`construire.py` prend `../activites/page.html`, y met seulement nos questions et entre directement dans la série.
Relancer `python3 exercices/construire.py` après un changement des questions, des sons ou de la page des activités. Page : https://onlineformapro-website.vercel.app/exercices/

1. Écouter — Le journal (7 phrases au passé composé)
2. Écouter — Le football (5 mots)
3. Complétez — Les adjectifs (français / française, bon / bonne)
4. Écouter — Les transports (vrai ou faux)
5. Écouter — La mobilité (le mot entendu)

- Les questions sont dans `construire.py` ; `______` marque le trou.
- Sons : voix de synthèse ElevenLabs, une phrase par fichier (`sons/voix.py`, `python3 exercices/sons/voix.py`), pas
  les extraits de RFI. Le texte de l'écoute des transports a été écrit pour l'exercice (« au Kenya ») : à remplacer
  par le vrai extrait si on l'a.
- Photos Unsplash : radio (Geoff Moore), foot (Skiking Photos), equipe (Ibrahim Guetar), circulation (Derek Lee),
  tricycle (Bernd Dittrich).

## Le journal, texte à trous (nouvelle modalité)

`journal/` : le texte à trous dans l'interface de « La chambre de Kenji » (fond noir, carte de verre, trous d'encre
invisible qui scintillent, mots à glisser ou à toucher). À gauche, la photo et un lecteur : lecture / pause, curseur
avec un repère par phrase, lecture lente. Un seul enregistrement (`journal/journal.mp3`) pour tout : chaque phrase
est rejouée en se plaçant dans ce fichier, aucune autre voix ne la coupe. Les repères (début de chaque mot) viennent
de la transcription ElevenLabs du fichier. Photo : micro rétro (fournie). Page : https://onlineformapro-website.vercel.app/exercices/journal/

## À la boulangerie

`boulangerie/` : l'activité complète fournie (archive « boulangerie-activites », remplace la première version), avec sa
structure d'origine, sans changement :
- `exercices-lies/boulangerie/index.html` : les exercices liés à la scène ; `vocabulaire.html` : le jeu de cartes de vocabulaire.
- `Sons/A1/A1-s1.mp3` : le dialogue ; `fiches/illustrations/A1/1.jpg` : l'illustration.
- Vrai / faux : sur une erreur, la scène rejoue ; au passage qui donne la réponse, le lecteur zoome sur l'onde de ce
  passage (`onde.js`, refait par `calcul-onde.py`), seul ce passage passe au ralenti (x0,6), puis tout revient. Les passages
  sont dans `ENC.v[...].preuve` (phrase 1 : « Bonjour, madame ! » ; phrase 3 : « Une baguette et deux croissants » ; phrase 2 : aucun).
- Voix : `voix.py` et `voix-cartes.js` (clé dans la variable d'environnement ELEVENLABS_API_KEY).
- Pages : https://onlineformapro-website.vercel.app/exercices/boulangerie/exercices-lies/boulangerie/ (l'ancienne adresse
  /exercices/boulangerie/ y renvoie) et …/exercices-lies/boulangerie/vocabulaire.html
