# Vidéos interactives : faire une nouvelle scène

Une scène = une courte vidéo (10 s, A1-A2) qu'on regarde en entier, puis 2 ou 3 questions qui se répondent par
**un geste**, et un bilan. Le design et la pédagogie viennent du prototype de Kenji (`kenji/index.html`) ; le moteur
commun est `moteur.js` + `moteur.css`. Exemples complets : `scenarios/epicerie.js`, `pharmacie.js`, `medecin.js`,
`fleuriste.js` (lire au moins `medecin.js` et `fleuriste.js` avant de commencer).

## Les fichiers d'une scène `<id>`

| Fichier | Contenu |
| --- | --- |
| `../medias/video/<video>.mp4` et `.jpg` | la vidéo (1280×720) et son affiche |
| `stt/<video>.json` | la transcription mot à mot (ElevenLabs scribe : `words[]` avec `text`, `start`, `end`, `speaker_id`) |
| `scenes/<id>.json` | la description de la scène (ci-dessous) |
| `scenarios/<id>.js` | les étapes et les gestes |
| `scenarios/<id>.css` | (facultatif) les styles propres à la scène |
| `donnees/<id>.js`, `medias/<id>-*.jpg`, `medias/voix-*.mp3` | produits par `preparer.py` |
| `<id>.html` | produit par `construire.py` (tout intégré, sauf la vidéo) |

```
python3 preparer.py <id>      # répliques mot à mot, portraits, consignes lues (voix « Femme 2 », vérifiées) → donnees/<id>.js
python3 construire.py <id>    # → <id>.html
```

Ne modifier **que** les fichiers de sa scène. `moteur.js`, `moteur.css`, `preparer.py`, `construire.py`, `../page.html`
sont communs : s'il manque quelque chose au moteur, l'écrire dans la scène (fonction locale, `scenarios/<id>.css`).

### `scenes/<id>.json`

```json
{
  "video": "glace", "titre": "La glace", "niveau": "A1", "gel": 9.4,
  "sousTitres": [
    {"d": 0.34, "f": 1.9, "qui": "Le vendeur", "texte": "Bonjour, qu'est-ce que je vous sers ?"},
    {"d": 2.68, "f": 4.9, "qui": "La cliente", "texte": "Deux boules, s'il vous plaît. Vanille et chocolat."}
  ],
  "people": {
    "vendeur": {"name": "Le vendeur", "qui": "Le vendeur", "side": "g", "spot": [30, 50, 16, 62], "anchor": [28, 46], "crop": [24, 14, 14, 25]},
    "cliente": {"name": "La cliente", "qui": "La cliente", "side": "d", "spot": [70, 50, 16, 62], "anchor": [72, 46], "crop": [64, 14, 14, 25]}
  },
  "consignes": ["Écoute la cliente.", "…", "Super ! …"]
}
```

- `sousTitres` : une entrée par réplique, `d`/`f` en secondes (début du premier mot, fin du dernier, d'après le STT),
  `qui` = le `qui` d'une personne. Une réplique = les mots du STT entre `d - 0.06` et `f + 0.06`.
- `gel` : l'image où la vidéo s'arrête pendant les questions et le bilan. Elle ne doit **pas** donner la réponse.
- `people` : `side` g/d (couleur de la fiche), `spot` [x, y, rx, ry] en %, `anchor` [x, y] où pointe l'étiquette au
  bilan, `crop` [gauche, haut, largeur, hauteur] en % pour le portrait (pris sur l'image `gel` ; sinon
  `"portrait": [temps, crop]` pour le prendre ailleurs). Vérifier chaque portrait (`medias/<id>-<personne>.jpg`).
- `consignes` : **toutes** les phrases dites par la voix dans la scène, mot pour mot, y compris le bravo. Une espace
  normale avant `?` `!` `:` (preparer.py la remplace par l'espace fine) ; dans le JS, écrire `'…' + NB + '?'`.

## Le scénario `scenarios/<id>.js`

```js
window.SCENARIO = (() => ({
  plans: [{ de: 0, cx: { vendeur: .28, cliente: .72 } }, { de: 3.2, cx: { cliente: .55 } }],   // une entrée par plan (coupe)
  ordre: ['etape1', 'etape2'],
  bravo: 'Super ! …',                                 // = une des consignes, propre à la scène
  etapes: A => ({ async etape1(f) { … }, async etape2(f) { … } }),
  bilan: A => ({ faits: { vendeur: [{ text: '…', seg: A.ligne(0) }], cliente: [ … ] } }),
}))();
```

- `plans` : les coupes de la vidéo (`ffmpeg -i v.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null -`) et, pour chaque
  plan, le centre horizontal (0–1) de chaque personne : quand la vidéo se resserre sur quelqu'un, le cadre le suit.
- Le moteur fait l'intro (on regarde toute la scène) et le bilan (fiches des personnes, chaque fait se réécoute).

### Outils du moteur (`A`)

| Outil | Rôle |
| --- | --- |
| `avant(f, { question, qui, seg, panneau, sideW, consigne, monte, gel })` | le déroulé de chaque question : la voix dit `question` (« Écoute la cliente. ») ; la vidéo se resserre sur `qui` et rejoue `seg` ; puis le `panneau` (HTML) s'ouvre à côté, large de `sideW` px (ou, sans panneau, la vidéo revient en grand pour toucher l'image) ; `monte(el)` branche les gestes ; enfin la voix dit la `consigne`. `gel` : une autre image figée pour cette étape. Renvoie `false` si on a quitté l'étape. |
| `phrase('texte exact')` → `[début, fin]` | un passage retrouvé par ses mots (première occurrence) |
| `ligne(i)` → `[début, fin]` | la réplique `i` |
| `playSegment(s, e, gel())` | rejoue un passage puis revient à l'image figée |
| `state.ask`, `state.replay`, `Q.show(mode, texte)` | la consigne en cours, le bouton « réécouter », la bulle (`'you'`, `'ok'`, `'try'`) |
| `yourTurn()`, `setTurn('wait')` | à l'apprenant / en attente (les gestes vérifient `document.body.dataset.turn === 'you'`) |
| `juste(f, msg, seg?)` | bravo + (facultatif) réécoute de la preuve ; renvoie `false` si on a quitté |
| `faux(f, seg, msg?)` | « Écoute encore », rejoue `seg` ; renvoie `true` au 2e essai raté (montrer la réponse), `null` si on a quitté |
| `suite(label?)` | bouton vers l'étape suivante |
| `goBtn('check', 'Valider', fn)` | le bouton d'action du dock |
| `zones([{id, label, x, y, w, h}], (id, ev, z) => …)` + `cam.classList.add('asking')` | des zones à toucher **sur l'image** (en %) |
| `cadreZone(z, 'faux'?)`, `marque(z, texte, 'juste' | 'faux')` | un cadre autour d'une zone, une étiquette sur l'image |
| `fly(depuis, vers, html, {scale})` | un objet qui vole d'un élément à un autre |
| `idle.set(tapHere(el), 5000)` | le doigt fantôme (ne jamais le pointer sur la bonne réponse) ; `at(x, y, o, s)` pour un geste glissé |
| `sfx.tick()`, `NB`, `$`, `$$`, `wait`, `side`, `cam`, `stopAll`, `gel()` | divers |

Classes de `moteur.css` réutilisables : `.panel.glass`, `.ptitre`, `.tuile` (+ `.pic`, `.nom`, `.juste`, `.faux`,
`.indice`, `.shake`), `.famille`, `.semaine`/`.jour`, `.thermo`, `.plan`, `.fleches`/`.fleche`, `.plateau`,
`.bourse`/`.argent`. Couleurs : `var(--ok)` (juste), `var(--try)` (à revoir), `var(--ink)`, `var(--text2)`.

## Les règles (retours du client, à respecter toutes)

1. **Un geste différent pour chaque question, adapté au contenu.** Ne pas recopier les trois gestes de Kenji
   (choisir une personne, défiler des chiffres, trier des cartes à gauche/à droite). Chercher le geste qui
   *ressemble à la vraie vie* : poser l'argent, guider sur un plan, remonter un calendrier, faire glisser un
   thermomètre, composer un cornet, taper sur un terminal de carte…
2. **Au moins un geste dans la vidéo** par scène (toucher l'image : un objet réel de la scène, le bon moment…), sans
   panneau à droite pour ce geste : la vidéo reste en grand.
3. **Réécouter avant d'agir.** Chaque question passe par `avant()` : « Écoute X. » (la voix n'annonce pas la phrase
   que la personne va redire : jamais « Depuis quand ? » suivi du médecin qui dit « Depuis quand ? »), la vidéo se
   resserre sur la personne et rejoue sa réplique, puis la consigne.
4. **Consignes claires, dites par la voix, au tutoiement, avec « clique »** ; une question quand c'est utile :
   « Pour qui sont les fleurs ? Clique sur la bonne personne. » La consigne doit correspondre au geste (« Fais
   monter » = on fait glisser ; si on clique, dire « clique »).
5. **Pas de question évidente** (la réponse se voit : elle se tient la tête → ne pas demander où elle a mal) et
   **pas d'image figée qui montre la réponse** (choisir `gel` ou un `gel` d'étape avant le geste qui la révèle).
6. **Pas d'objets dessinés plaqués sur la vidéo.** Sur l'image : seulement les vrais éléments de la scène. Les dessins
   (SVG simples, propres) vont dans le panneau à côté.
7. **La sélection n'est jamais rouge** (le rouge fait croire à une erreur) : blanc pour « choisi », vert `--ok` pour
   « juste », orange `--try` pour « à revoir ».
8. **Deux essais, puis la réponse** (`faux()` renvoie `true` : montrer la bonne réponse avec `.indice`, ou la poser).
   Les messages d'erreur apprennent quelque chose : « Pas de vin. Écoute encore. », « Ça fait trois jours. »
9. **Pas de réécoute inutile quand c'est juste** (au médecin, on ne refait pas entendre « médicament » quand
   l'apprenant vient de le toucher au bon moment).
10. **Panneaux assez grands** pour être lus : `sideW` 380 à 580 selon le geste ; pas de calendrier « riquiqui ».
11. **Un bravo propre à la scène**, naturel, lié à l'histoire (« Bravo ! Le monsieur a trouvé la pharmacie. »).
12. Bilan : 2 ou 3 faits par personne, courts, chacun avec son passage (`seg`).
13. Accessible : `aria-label` sur les boutons sans texte, cibles d'au moins 44 px, pas de couleur seule pour dire
    juste/faux (cadre + texte). Pas d'ombres portées.

## Vérifier

- Les zones sur l'image : extraire l'image figée avec une grille (`ffmpeg -ss <gel> -i v.mp4 -frames:v 1 -vf
  "scale=960:-1,drawbox=…"`), dessiner les zones, regarder.
- Les consignes : `preparer.py` affiche `ok` ou `ÉCART` pour chacune (transcription de la voix) ; corriger les écarts
  réels (les homophones « ses / ces » ne comptent pas).
- Le parcours : un script Playwright qui fait toute la scène, avec **une erreur volontaire à chaque étape**, jusqu'au
  bilan, sans erreur dans la console ; des captures de chaque étape (regardées une par une). Serveur local :
  `python3 -m http.server 8765 --directory /home/user/onlineformapro-website/travaux`, page
  `http://localhost:8765/activites-fle/interactives/<id>.html` (lancer Chromium avec
  `--autoplay-policy=no-user-gesture-required`; `#<etape>` ouvre directement une étape).
