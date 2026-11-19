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

## À la boulangerie, une situation en quatre exercices

`boulangerie/` : la situation « Commerces · À la boulangerie · A1 · Acheter du pain et des viennoiseries », dans
l'interface du journal. Quatre exercices sur la même scène : QCM, texte à trous (la manière du journal), vrai ou faux,
association. En haut, une « île » noire : elle montre l'exercice en cours et les quatre points ; on la touche (ou on
la survole à la souris), elle s'ouvre sur la liste des exercices pour y aller ; elle annonce aussi chaque réussite.
Le vrai / faux défile comme des paroles de chanson : la phrase lue au centre, nette, qui se remplit mot à mot pendant
qu'on l'entend ; les autres au-dessus et en dessous, pâles et floues. Une erreur se voit en rouge (réponse barrée,
fil rouge), puis on réécoute.

- Sons : `dialogue.mp3` (la boulangère, Femme 2 ; la cliente, Femme 1) et `enonces.mp3` (la question et les trois
  phrases, Homme 1), voix ElevenLabs, -20 LUFS, vérifiées par transcription. `python3 exercices/boulangerie/voix.py`
  les refait et écrit les repères des mots dans `reperes.json` (à recopier dans `index.html` si les textes changent).
- Fin : quand les quatre exercices sont réussis, la vague « Distortion waves » de libraries.dev (paquet npm
  `distortion-waves` 0.1.0, licence MIT) emporte le dernier exercice vers l'écran « Bravo », en anneau (type « center »)
  depuis le rond vert, palette « colorful ». La page n'est pas en React : `distortion-waves.js` est le
  `WaveController` de la librairie (son mode sans React), empaqueté tel quel avec esbuild. La vague travaille sur une
  image des vues, qui doivent être opaques : à ce moment-là, la carte prend un fond plein aux couleurs du verre.
- Sons de réponse (fournis, ElevenLabs) : `bonne.mp3` (son aigu et court, plus discret : -24 LUFS) et `mauvaise.mp3` (-20 LUFS).
- Photo : croissants sur une plaque (Unsplash, ePh7mI8y_bA).
- Page : https://onlineformapro-website.vercel.app/exercices/boulangerie/
