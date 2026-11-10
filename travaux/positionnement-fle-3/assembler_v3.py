"""Version 3 du test de positionnement : le style « La feuille » (fond pastel clair, grande feuille blanche qui porte
la question), plus officiel, et aucun niveau montré à l'apprenant (ni pastille, ni écran de passage de niveau,
ni niveau à la fin). Même banque, mêmes sons, même moteur adaptatif et mêmes panneaux « Barème » et « Moteur »
que la version 2 : le script part des deux fichiers produits par la v2 et les transforme.

    python3 travaux/positionnement-fle-3/assembler_v3.py

Produit index.html (page web ; les sons sont lus dans ../positionnement-fle-2/sons/) et test-positionnement.html
(artifact, tout intégré), pour « La feuille » (ce dossier) et pour la variante « Le dégradé » (dossier degrade/)."""
import base64, json, os, re

ICI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(ICI, '..', 'positionnement-fle-2')


def remplacer(s, ancien, nouveau, n=1):
    assert s.count(ancien) == n, (ancien[:90], s.count(ancien))
    return s.replace(ancien, nouveau)


def fonction(s, nom, nouveau):
    """Remplace la fonction de premier niveau `nom` (de « function nom( » à son « } » en colonne 0)."""
    a = s.index(f'\nfunction {nom}(') + 1
    b = s.index('\n}\n', a) + 3
    return s[:a] + nouveau.strip('\n') + '\n' + s[b:]


def bloc_css(s, debut):
    """Le bloc CSS qui commence à `debut` et se termine à la fin de la règle @media qui le suit (accolades équilibrées)."""
    a = s.index(debut)
    m = s.index('@media', a)
    i, prof = s.index('{', m), 0
    while True:
        c = s[i]
        prof += c == '{'; prof -= c == '}'
        i += 1
        if prof == 0: return s[a:i]


CSS = r'''
/* Version 3, « La feuille » : fond pastel clair (le dégradé violet, bleu, turquoise de la référence, adouci) et une
   grande feuille blanche qui porte la question, les réponses et les boutons. Texte bleu nuit, accent indigo.
   Sur ordinateur, le téléphone au centre d'un fond gris uni ; sur un appareil tactile, le test occupe l'écran. */
:root {
  --p1: #cbc2fb; --p2: #bccffb; --p3: #cbedf6; --p4: #eef1fb;
  --encre: #1f2140; --doux: #63678a; --indigo: #4a43d8; --indigo-fonce: #3a34b8; --pastel: #f3f2ff; --filet: #e6e5f4;
  --titre: "Manrope", "Segoe UI", system-ui, sans-serif;
  --texte: "Manrope", "Segoe UI", system-ui, sans-serif;
  /* pour les panneaux du formateur (repris de la v2) */
  --fond-1: #4a43d8;
  --cyan-1: #78fdf8; --cyan-2: #42d8ff; --vert-1: #cdfc2a; --vert-2: #8fe60c; --rose-1: #ffadf6; --rose-2: #ea62de;
  color-scheme: light;
}
* { box-sizing: border-box; }
.insec { white-space: nowrap; }
[hidden] { display: none !important; }
html, body { height: 100%; }
body { margin: 0; color: var(--encre); font: 600 15px/1.5 var(--texte); overflow: hidden; background: #e8e8ec;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px; display: grid; place-items: center; }
button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
button:focus-visible { outline: 3px solid var(--indigo); outline-offset: 3px; border-radius: 14px; }
svg { display: block; }

/* ------------------------------------------------------------ le téléphone */
.appli { position: relative; z-index: 1; width: min(400px, 100%); height: min(860px, 100%); display: flex; flex-direction: column; overflow: hidden;
  border: 10px solid #15161c; border-radius: 50px;
  background: linear-gradient(180deg, var(--p1) 0%, var(--p2) 26%, var(--p3) 52%, var(--p4) 100%); }
.ecran { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; animation: entre .3s ease-out both; }
@keyframes entre { from { opacity: 0; transform: translateY(8px); } }
.defile { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
.defile::-webkit-scrollbar { display: none; }
.defile > * { flex-shrink: 0; }
.defile.a-suivre .feuille-q { -webkit-mask-image: linear-gradient(#000 calc(100% - 48px), transparent); mask-image: linear-gradient(#000 calc(100% - 48px), transparent); }

/* l'en-tête : quitter, le numéro de la question (jamais le niveau), le son */
.haut { flex: none; display: grid; grid-template-columns: 38px 1fr 38px; align-items: center; gap: 8px; padding: 14px 16px 6px; }
.rond { display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid rgba(255, 255, 255, .7); border-radius: 50%; background: rgba(255, 255, 255, .42); color: var(--encre); }
.rond svg { width: 17px; height: 17px; }
.haut .barre, .rubrique, .lecteur-texte { display: none; }
.numero { justify-self: center; padding: 6px 14px; border-radius: 999px; background: rgba(255, 255, 255, .62); font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }

/* la scène (au-dessus de la feuille) et la feuille blanche */
.scene { padding: 6px 16px 36px; }
.scene.vide { padding: 0 0 14px; }
.feuille-q { flex: 1 0 auto; display: flex; flex-direction: column; gap: 14px; margin-top: -24px; padding: 24px 18px 6px; border-radius: 30px 30px 0 0; background: #fff; }
.scene.vide + .feuille-q { margin-top: 0; }
.bas { flex: none; display: grid; gap: 2px; padding: 8px 18px calc(14px + env(safe-area-inset-bottom, 0px)); background: #fff; }

/* les supports */
.visuel { display: grid; gap: 12px; }
.visuel-scene { justify-items: center; text-align: center; }
.contexte { margin: 0; max-width: 330px; font-size: 15px; font-weight: 700; line-height: 1.4; color: #3f4366; }
.etiquette { font-size: 13px; font-weight: 800; color: var(--doux); }
.lecteur { position: relative; display: grid; place-items: center; width: 78px; height: 78px; padding: 0; border: 0; border-radius: 50%; background: #fff; color: var(--indigo); }
.lecteur::before { content: ""; position: absolute; inset: -9px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, .8); animation: onde 2.4s ease-out infinite; }
@keyframes onde { from { transform: scale(.9); opacity: 1; } to { transform: scale(1.3); opacity: 0; } }
.lecteur > svg { width: 30px; height: 30px; margin-left: 4px; }
.lecteur:disabled { cursor: default; opacity: .55; }
.lecteur:disabled::before { animation: none; opacity: 0; }
.lecteur.parle { opacity: 1; } .lecteur.parle::before { animation-duration: .9s; opacity: 1; }
.lecteur.parle > svg { display: none; }
.vague { display: none; align-items: center; gap: 4px; height: 30px; }
.lecteur.parle .vague { display: flex; }
.vague i { width: 5px; height: 10px; border-radius: 3px; background: var(--indigo); }
.vague i:nth-child(2n) { height: 20px; } .vague i:nth-child(3n) { height: 14px; }
.vague.active i { animation: barre .7s ease-in-out infinite; }
.vague i:nth-child(2n) { animation-delay: -.2s; } .vague i:nth-child(3n) { animation-delay: -.45s; }
@keyframes barre { 50% { transform: scaleY(.45); } }
.pastille { position: absolute; top: -3px; right: -3px; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--indigo); color: #fff; font-size: 13px; font-weight: 800; }
/* écoute avec photo : la photo prend toute la largeur, le bouton posé dessus */
.visuel.photo-fond { position: relative; height: 230px; margin: -6px -16px 0; overflow: hidden; place-items: center; }
.visuel.photo-fond > .photo-scene { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.visuel.photo-fond > .lecteur { z-index: 1; margin-top: -12px; }
.photo-scene { display: block; width: 100%; aspect-ratio: 16 / 9; max-height: 180px; object-fit: cover; border-radius: 18px; }
.phrase { font-size: 23px; font-weight: 800; line-height: 1.55; text-wrap: balance; }
.phrase.petite { font-size: 19px; }
.ordre-phrase { font-size: 20px; line-height: 1.9; }
.trou { display: inline-block; min-width: 84px; margin: 0 3px; padding: 0 10px; border-radius: 10px; background: var(--pastel); color: var(--indigo); line-height: 1.45; }
.trou.rempli { background: #e9e7ff; }
.trou.pop { animation: pop .3s ease-out; }
.trou.elide { margin-left: 0; padding-left: 4px; }
@keyframes pop { from { transform: scale(.85); } }
.ordre-phrase .trou { min-width: 64px; cursor: pointer; }
.trou.curseur::after { content: ""; display: inline-block; width: 2px; height: 1.05em; margin-left: 2px; vertical-align: -.15em; background: currentColor; animation: clignote 1.1s steps(1) infinite; }
@keyframes clignote { 50% { opacity: 0; } }
.indice { align-self: flex-start; justify-self: start; padding: 3px 11px; border-radius: 999px; background: #f4f4f8; color: var(--doux); font-size: 13.5px; font-weight: 700; }
.sms { display: grid; justify-items: start; gap: 6px; }
.sms p { margin: 0; padding: 12px 15px; border-radius: 18px 18px 18px 6px; background: #f4f4fa; font-size: 16.5px; font-weight: 600; line-height: 1.45; }
.papier-court { display: grid; gap: 4px; padding: 14px 16px; border-radius: 16px; background: #f6f6fb; text-align: left; }
.papier-court strong { font-size: 15px; }
.papier-court p { margin: 0; font-size: 16px; font-weight: 600; line-height: 1.5; }
.image-support { position: relative; display: block; padding: 0; border: 0; border-radius: 16px; overflow: hidden; background: #fff; }
.image-support img { display: block; width: 100%; max-height: 210px; object-fit: contain; }
.loupe { position: absolute; right: 8px; bottom: 8px; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--indigo); color: #fff; }
.loupe svg { width: 18px; height: 18px; }
.image-grande { width: 100%; border-radius: 12px; }
.scene-emoji { font-size: 52px; line-height: 1; }
.situation { margin: 0; max-width: 330px; font-size: 16px; font-weight: 700; line-height: 1.45; color: #2c2f52; }
.doc-mini { display: grid; justify-items: center; gap: 8px; }
.doc-mini .icone-doc { display: grid; place-items: center; width: 64px; height: 72px; border-radius: 16px; background: #fff; font-size: 32px; }
.doc-mini .icone-doc.avec-photo { width: 76px; height: 76px; overflow: hidden; border-radius: 50%; }
.avec-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.doc-mini strong { font-size: 16px; }
.pilule { display: inline-flex; align-items: center; gap: 6px; padding: 7px 15px; border: 0; border-radius: 999px; background: #fff; color: var(--indigo); font-size: 14px; font-weight: 800; }
.pilule svg { width: 16px; height: 16px; }

/* la question */
.question { margin: 0; font: 800 19px/1.3 var(--titre); letter-spacing: -.01em; text-wrap: balance; }
.question.consigne { font-size: 14.5px; font-weight: 700; color: var(--doux); letter-spacing: 0; }
.lire-consigne { display: inline-grid; place-items: center; width: 30px; height: 30px; margin-left: 4px; padding: 0; border: 0; border-radius: 50%; background: var(--pastel); color: var(--indigo); vertical-align: -6px; }
.lire-consigne svg { width: 15px; height: 15px; }
.lire-consigne.parle { background: var(--indigo); color: #fff; }

/* les réponses */
.reponses { display: grid; gap: 9px; }
.bonbons .rep, .ligne-audio .rep { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 50px; padding: 10px 16px; border: 0; border-radius: 16px; background: var(--pastel); color: var(--encre); font-size: 16px; font-weight: 700; line-height: 1.3; text-align: left; transition: background .15s; }
.marque { flex: none; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #c4c1ee; background: #fff; }
.reponses .rep[aria-checked="true"] { background: var(--indigo); color: #fff; }
.reponses .rep[aria-checked="true"] .marque { border: 6px solid #fff; background: var(--indigo); }
.ligne-audio { display: flex; align-items: center; gap: 10px; }
.ecouter-rep { flex: none; display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; background: #fff; color: var(--indigo); box-shadow: inset 0 0 0 2px var(--filet); }
.ecouter-rep svg { width: 18px; height: 18px; margin-left: 2px; }
.ecouter-rep.parle { background: var(--indigo); color: #fff; box-shadow: none; }
.reponses.images { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.reponses.images[data-cols="2"] .rep-image:first-child:nth-last-child(odd) { margin-inline: calc((100% - var(--wi)) / 2); }
.rep-image { width: var(--wi, calc((100% - 20px) / 3)); padding: 5px; border: 2px solid var(--filet); border-radius: 16px; background: #fff; transition: border-color .15s, background .15s; }
.rep-image img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 11px; }
.rep-image[aria-checked="true"] { border-color: var(--indigo); background: var(--pastel); }
.mots-a-placer { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
.mot-dispo { padding: 11px 17px; border: 0; border-radius: 999px; background: var(--pastel); color: var(--encre); font-size: 17px; font-weight: 700; transition: opacity .15s; }
.mot-dispo:disabled { opacity: .3; cursor: default; }
.saisies { display: grid; gap: 12px; }
.champ { display: grid; gap: 6px; font-size: 12.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--doux); }
.champ input { width: 100%; min-height: 54px; padding: 12px 16px; border: 2px solid transparent; border-radius: 16px; background: var(--pastel); color: var(--encre); font: 700 19px/1.2 var(--texte); outline: none; }
.champ input:focus { border-color: var(--indigo); background: #fff; }
.reponses.ecrire { display: grid; gap: 16px; }
.mot-ecrit { justify-self: center; }
.mot-ecrit .trou { min-width: 170px; margin: 0; font-size: 25px; font-weight: 800; text-align: center; }
.lettres { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }
.lettre, .effacer { display: grid; place-items: center; height: 44px; padding: 0; border: 0; border-radius: 999px; background: var(--pastel); color: var(--encre); font-size: 18px; font-weight: 800; text-transform: uppercase; transition: opacity .15s; }
.lettre:disabled { opacity: .28; cursor: default; }
.effacer { grid-column: span 2; color: var(--doux); }
.effacer:disabled { opacity: .45; cursor: default; }
.effacer svg { width: 21px; height: 21px; }

/* les boutons */
.bouton { display: grid; place-items: center; width: 100%; min-height: 52px; padding: 0 20px; border: 0; border-radius: 999px; font: 800 16.5px/1 var(--titre); }
.bouton.vert { background: var(--indigo); color: #fff; }
.bouton.vert:active:not(:disabled) { background: var(--indigo-fonce); }
.bouton:disabled { opacity: .4; cursor: default; }
.bouton.blanc { background: #fff; color: var(--indigo); box-shadow: inset 0 0 0 2px var(--indigo); }
.lien { justify-self: center; margin-top: 4px; padding: 7px 12px; border: 0; background: none; color: var(--doux); font-size: 14.5px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }

/* les documents à lire */
.papier { display: grid; gap: 10px; }
.papier-tete { display: flex; align-items: center; gap: 12px; }
.papier-tete span { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 14px; background: var(--pastel); font-size: 23px; flex: none; }
.papier-tete .avec-photo { width: 58px; height: 58px; overflow: hidden; border-radius: 50%; }
.papier-tete strong { display: block; font: 800 19px/1.2 var(--titre); }
.papier-tete small { color: var(--doux); font-size: 13.5px; }
.papier p { margin: 0; font-size: 17px; line-height: 1.65; font-weight: 600; }
.consigne-lecture { margin: 2px 0 0; color: var(--doux); font-size: 14.5px; text-align: center; }
.tableau-defile { overflow-x: auto; }
.edt { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 12.5px; line-height: 1.25; text-align: center; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: anywhere; }
.edt th, .edt td { padding: 7px 3px; border: 1px solid var(--filet); }
.edt tr > :first-child { width: 25%; white-space: nowrap; font-size: 11px; }
.edt tr:first-child > * { font-size: 11.5px; letter-spacing: .03em; }
.edt th { background: var(--pastel); font-weight: 800; }
.edt td:empty { background: #fafaff; }

/* la feuille du bas (quitter, relire, agrandir) */
.voile { position: absolute; inset: 0; z-index: 5; display: flex; align-items: flex-end; background: rgba(25, 24, 60, .35); animation: entre .2s ease-out both; }
.feuille { width: 100%; max-height: 92%; overflow-y: auto; display: grid; gap: 12px; padding: 24px 20px calc(18px + env(safe-area-inset-bottom, 0px)); border-radius: 28px 28px 0 0; background: #fff; }
.feuille h2 { margin: 0; font: 800 21px/1.2 var(--titre); }
.feuille > p { margin: 0; color: var(--doux); }

/* l'accueil et la fin */
.accueil-tete { padding: 30px 24px 50px; }
.accueil-tete small { font-size: 14px; font-weight: 800; color: #464a75; }
.accueil-tete h1 { margin: 6px 0; font: 800 29px/1.12 var(--titre); letter-spacing: -.02em; text-wrap: balance; }
.accueil-tete p { margin: 0; font-size: 15px; font-weight: 700; color: #464a75; }
.etapes { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; }
.etapes li { display: flex; align-items: center; gap: 13px; font-size: 15.5px; font-weight: 700; }
.etapes .ic { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: var(--pastel); color: var(--indigo); flex: none; }
.etapes .ic svg { width: 20px; height: 20px; }
.note { margin: 4px 0 0; padding: 12px 14px; border-radius: 16px; background: #f6f7fb; color: var(--doux); font-size: 14px; line-height: 1.45; }
.feuille-q.fin { align-items: center; text-align: center; padding-top: 34px; }
.fin-coche { display: grid; place-items: center; width: 76px; height: 76px; border-radius: 50%; background: var(--pastel); color: var(--indigo); }
.fin-coche svg { width: 36px; height: 36px; }
.feuille-q.fin h2 { margin: 0; font: 800 22px/1.2 var(--titre); }
.feuille-q.fin p { margin: 0; max-width: 300px; color: var(--doux); font-size: 15.5px; line-height: 1.5; }

/* une question qui ne tient pas dans la hauteur de l'écran se resserre, en deux crans */
.serre .haut { padding-top: 10px; }
.serre .scene { padding-bottom: 32px; }
.serre .feuille-q { gap: 11px; padding-top: 20px; }
.serre .visuel.photo-fond { height: 180px; }
.serre .lecteur { width: 66px; height: 66px; } .serre .lecteur > svg { width: 26px; height: 26px; }
.serre .photo-scene { max-height: 130px; }
.serre .image-support img { max-height: 160px; }
.serre .scene-emoji { font-size: 40px; }
.serre .doc-mini .icone-doc { width: 54px; height: 60px; font-size: 26px; } .serre .doc-mini .icone-doc.avec-photo { width: 60px; height: 60px; }
.serre .bonbons .rep, .serre .ligne-audio .rep { min-height: 46px; padding-block: 8px; }
.serre .reponses { gap: 8px; }
.serre .edt th, .serre .edt td { padding-block: 4px; }
.tres-serre .visuel.photo-fond { height: 150px; }
.tres-serre .lecteur { width: 58px; height: 58px; }
.tres-serre .photo-scene { max-height: 100px; }
.tres-serre .image-support img { max-height: 130px; }
.tres-serre .phrase { font-size: 20px; }
.tres-serre .question { font-size: 17.5px; }
.tres-serre .sms p { font-size: 15.5px; padding: 10px 13px; }
.tres-serre .bonbons .rep, .tres-serre .ligne-audio .rep { min-height: 42px; font-size: 15.5px; }
.tres-serre .bouton { min-height: 48px; }
.tres-serre .lien { margin-top: 0; padding-block: 4px; }

/* sur un appareil tactile ou un écran étroit : le test occupe tout l'écran, comme une application */
@media (max-width: 520px), (hover: none) and (pointer: coarse) {
  html, body { overflow: hidden; overscroll-behavior: none; background: var(--p1); }
  body { padding: 0; }
  .appli { position: fixed; inset: 0; width: auto; height: auto; border: 0; border-radius: 0; }
  .haut { padding-top: calc(12px + env(safe-area-inset-top, 0px)); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
'''

CSS_DEGRADE = r"""
/* Variante « Le dégradé » (piste A des maquettes) : le dégradé violet, bleu, turquoise de la référence en haut de
   l'écran, qui s'efface vers un fond clair ; cartes blanches bordées, texte bleu nuit, bouton sombre, barre
   d'avancement dans l'en-tête. Mêmes écrans que « La feuille », seule la peinture change. */
:root { --p1: #8c7af6; --encre: #1d2236; --doux: #5f6580; --indigo: #5a57e8; --indigo-fonce: #4643c9; --pastel: #f2f1ff; --filet: #e3e5ee;
  --titre: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif; --texte: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif; --fond-1: #5a57e8; }
.appli { background: #f5f7fb linear-gradient(180deg, #8c7af6 0px, #7b93f6 130px, #93cdf0 250px, #d9edf7 340px, #f5f7fb 430px) no-repeat; }
.rond { border-color: rgba(255, 255, 255, .5); background: rgba(255, 255, 255, .22); color: #fff; }
.numero { padding: 0; background: none; color: #fff; font-size: 14px; }
.haut .barre { display: block; grid-column: 1 / -1; height: 5px; margin-top: 6px; overflow: hidden; border-radius: 3px; background: rgba(255, 255, 255, .35); }
.haut .barre i { display: block; height: 100%; border-radius: 3px; background: #fff; }
.scene { padding: 8px 16px 14px; }
.scene.vide { padding: 0 0 8px; }
.feuille-q { margin-top: 0; padding: 0 16px 6px; border-radius: 0; background: none; gap: 12px; }
.bas { background: none; }
.contexte, .situation { color: #232848; }
.etiquette { color: #3c4166; }
.lecteur { box-shadow: 0 0 0 1px var(--filet); }
.vague i { background: var(--indigo); }
.visuel-feuille { padding: 16px; border: 1px solid var(--filet); border-radius: 20px; background: #fff; }
.visuel.photo-fond { height: 196px; margin: 0; padding: 6px; border-radius: 22px; background: #fff; }
.visuel.photo-fond > .photo-scene { inset: 6px; width: calc(100% - 12px); height: calc(100% - 12px); border-radius: 17px; }
.visuel.photo-fond > .lecteur { margin-top: 0; box-shadow: none; }
.photo-scene { border-radius: 16px; }
.question.consigne { color: #2a2f55; }
.lire-consigne { background: rgba(255, 255, 255, .75); }
.bonbons .rep, .ligne-audio .rep { border: 1.5px solid var(--filet); border-radius: 15px; background: #fff; font-weight: 600; }
.marque { border-color: #c8cbd8; }
.reponses .rep[aria-checked="true"] { border-color: var(--indigo); background: var(--pastel); color: var(--encre); }
.reponses .rep[aria-checked="true"] .marque { border: 6px solid var(--indigo); background: #fff; }
.ecouter-rep { box-shadow: inset 0 0 0 1.5px var(--filet); }
.rep-image { border-width: 1.5px; }
.mot-dispo { border: 1.5px solid var(--filet); border-radius: 12px; background: #fff; }
.champ input { border: 1.5px solid var(--filet); background: #fff; }
.champ input:focus { border-color: var(--indigo); }
.lettre, .effacer { border: 1.5px solid var(--filet); border-radius: 11px; background: #fff; }
.trou, .trou.rempli { border-radius: 0; background: none; box-shadow: inset 0 -2.5px 0 var(--indigo); }
.mot-ecrit .trou { border-radius: 14px; background: #fff; box-shadow: inset 0 0 0 1.5px var(--filet); }
.indice { background: #eef0f6; }
.sms p { background: #f3f4f9; }
.papier { padding: 16px; border: 1px solid var(--filet); border-radius: 20px; background: #fff; }
.papier-tete span { background: #f0f1f8; }
.doc-mini .icone-doc { box-shadow: 0 0 0 1px var(--filet); }
.pilule { box-shadow: inset 0 0 0 1px var(--filet); }
.image-support { box-shadow: 0 0 0 1px var(--filet); }
.bouton { border-radius: 16px; }
.bouton.vert { background: var(--encre); }
.bouton.vert:active:not(:disabled) { background: #2c3350; }
.bouton.blanc { color: var(--encre); box-shadow: inset 0 0 0 2px var(--encre); }
.accueil-tete { padding: 26px 22px 20px; color: #fff; }
.accueil-tete small, .accueil-tete p { color: rgba(255, 255, 255, .9); }
.etapes li { padding: 11px 13px; border: 1px solid var(--filet); border-radius: 16px; background: #fff; }
.note { background: #eef0fb; color: #44486a; }
.feuille-q.fin { flex: none; margin: 6px 16px 0; padding: 26px 18px; border: 1px solid var(--filet); border-radius: 22px; background: #fff; }
.serre .visuel.photo-fond { height: 166px; }
.tres-serre .visuel.photo-fond { height: 136px; }
.serre .scene { padding-bottom: 10px; }
"""

CSS_EXAMEN = r"""
/* Variante « L'examen », minimaliste : le dégradé bleu ciel de la référence en haut de l'écran (relevé au pixel :
   bleu profond au sommet, ciel, pervenche, puis blanc), aucun bandeau ni étiquette. Le haut porte le support (la bille
   d'écoute violette, la photo, le message, la phrase à compléter) ; le bas, blanc, porte la question et les réponses,
   alignées à gauche. Accent violet, police Public Sans. Le dégradé occupe toute la place libre : jamais de vide. */
:root {
  --violet: #7442e8; --violet-fonce: #5d2fd0; --violet-pale: #f1ecff;
  --encre: #14182b; --doux: #697086; --filet: #e5e7ee;
  --titre: "Public Sans", "Segoe UI", system-ui, sans-serif;
  --texte: "Public Sans", "Segoe UI", system-ui, sans-serif;
  --ciel: radial-gradient(90% 34% at 50% -6%, rgba(56, 128, 247, .55), rgba(56, 128, 247, 0) 70%),
          linear-gradient(180deg, #58aef7 0%, #64c2f8 7%, #6bc5fa 16%, #6fc0f8 26%, #79bbf8 37%, #88bffa 48%, #a5cbfa 59%, #c6defb 69%, #e3effd 78%, #f4f8fe 86%, #fcfdff 93%, #ffffff 100%);
  --fond-1: #7442e8;
  --cyan-1: #78fdf8; --cyan-2: #42d8ff; --vert-1: #cdfc2a; --vert-2: #8fe60c; --rose-1: #ffadf6; --rose-2: #ea62de;
  color-scheme: light;
}
* { box-sizing: border-box; }
.insec { white-space: nowrap; }
[hidden] { display: none !important; }
html, body { height: 100%; }
body { margin: 0; color: var(--encre); font: 500 16px/1.5 var(--texte); overflow: hidden; background: #e8e8ec;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px; display: grid; place-items: center; }
button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
button:focus-visible { outline: 3px solid var(--violet); outline-offset: 2px; border-radius: 12px; }
svg { display: block; }

/* le téléphone */
.appli { position: relative; z-index: 1; width: min(400px, 100%); height: min(860px, 100%); display: flex; flex-direction: column; overflow: hidden;
  border: 10px solid #15161c; border-radius: 50px; background: #fff; }
.ecran { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; animation: entre .25s ease-out both; }
@keyframes entre { from { opacity: 0; } }
.defile { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
.defile::-webkit-scrollbar { display: none; }
.defile > * { flex-shrink: 0; }
.defile.a-suivre .feuille-q { -webkit-mask-image: linear-gradient(#000 calc(100% - 48px), transparent); mask-image: linear-gradient(#000 calc(100% - 48px), transparent); }

/* seul reste en haut le bouton du son, posé sur le dégradé */
/* en haut : le son à gauche, quitter à droite */
.haut { position: absolute; top: 0; left: 0; right: 0; z-index: 4; display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; pointer-events: none; }
.haut > * { pointer-events: auto; }
.haut .barre { display: none; }
.rond { display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid rgba(255, 255, 255, .55); border-radius: 50%; background: rgba(16, 22, 48, .3); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); color: #fff; }      /* lisible sur le ciel comme sur une photo claire */
.rond svg { width: 17px; height: 17px; }

/* le haut (dégradé) et le bas (blanc) */
.scene { position: relative; flex: 1 0 auto; min-height: 230px; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 66px 22px 28px; background: var(--ciel); overflow: hidden; }
.scene.vide { min-height: 190px; }
.feuille-q { flex: none; display: grid; gap: 16px; padding: 4px 22px 18px; background: #fff; overflow: hidden; }      /* les réponses qui montent à l'apparition ne comptent pas comme un débordement */
.bas { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 6px 22px calc(18px + env(safe-area-inset-bottom, 0px)); background: #fff; }

/* les supports, dans le dégradé */
.visuel { display: grid; gap: 14px; justify-items: center; }
.rubrique, .lecteur-texte { display: none; }
.contexte { justify-self: stretch; margin: 0; padding: 11px 15px; border-radius: 14px; background: rgba(255, 255, 255, .78); color: var(--encre); font-size: 15.5px; font-weight: 600; line-height: 1.4; text-align: left; }
.etiquette { justify-self: start; font-size: 13.5px; font-weight: 700; color: #234a7a; }
.lecteur { position: relative; z-index: 1; display: grid; place-items: center; width: 98px; height: 98px; padding: 0; border: 3px solid #fff; border-radius: 50%; background: var(--violet); color: #fff; }
.lecteur::before, .lecteur::after { content: ""; position: absolute; inset: -3px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, .85); animation: onde 2.6s ease-out infinite; pointer-events: none; }
.lecteur::after { animation-delay: 1.3s; }
@keyframes onde { from { transform: scale(1); opacity: .9; } to { transform: scale(1.65); opacity: 0; } }
.lecteur > svg { width: 38px; height: 38px; margin-left: 5px; }
.pastille { position: absolute; z-index: 2; top: -3px; right: -3px; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #fff; color: var(--violet); font-size: 14px; font-weight: 800; }
.vague { display: none; align-items: center; gap: 5px; height: 36px; }
.lecteur.parle > svg { display: none; }
.lecteur.parle .vague { display: flex; }
.vague i { width: 5px; height: 14px; border-radius: 3px; background: #fff; }
.vague i:nth-child(2n) { height: 28px; } .vague i:nth-child(3n) { height: 20px; }
.vague.active i { animation: barre .7s ease-in-out infinite; }
.vague i:nth-child(2n) { animation-delay: -.2s; } .vague i:nth-child(3n) { animation-delay: -.45s; }
@keyframes barre { 50% { transform: scaleY(.45); } }
.lecteur.parle::before, .lecteur.parle::after { animation-duration: 1.2s; }
.lecteur:disabled { cursor: default; opacity: .6; }
.lecteur:disabled::before, .lecteur:disabled::after { animation: none; opacity: 0; }
.lecteur.parle:disabled { opacity: 1; }
.lecteur.parle:disabled::before, .lecteur.parle:disabled::after { animation: onde 1.2s ease-out infinite; }
/* une photo remplit tout le haut et se fond dans le blanc ; la bille est posée dessus */
.photo-fond .photo-scene { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; max-height: none; border-radius: 0; object-fit: cover; -webkit-mask-image: linear-gradient(#000 64%, transparent); mask-image: linear-gradient(#000 64%, transparent); }
.photo-fond > :not(.photo-scene) { position: relative; z-index: 1; }
.photo-fond > .cadre-photo { position: absolute; inset: 0; z-index: 0; overflow: hidden; -webkit-mask-image: linear-gradient(#000 calc(var(--fin, 100%) - 36%), transparent var(--fin, 100%)); mask-image: linear-gradient(#000 calc(var(--fin, 100%) - 36%), transparent var(--fin, 100%)); }
.cadre-photo > .photo-scene { -webkit-mask-image: none; mask-image: none; object-position: var(--ox, 50%) 50%; transform-origin: var(--ox, 50%) 0; transform: translateY(var(--dy, 0%)) scale(var(--z, 1)); }
.photo-fond .contexte { background: rgba(255, 255, 255, .93); }
.photo-fond .etiquette { padding: 4px 12px; border-radius: 999px; background: rgba(255, 255, 255, .93); color: var(--encre); }
.photo-fond .indice { background: #fff; }
.lecture-tete { position: relative; z-index: 1; }
.lecture-tete.sur-photo .papier-tete { margin-block: -10px; padding: 10px 14px; border-radius: 18px; background: rgba(255, 255, 255, .94); }      /* la carte déborde dans les marges : même hauteur qu'avant */
.fond-seul { position: absolute; inset: 0; }      /* la photo seule, hors du flux : elle n'ajoute aucune hauteur */
.photo-scene { display: block; width: 100%; max-height: 200px; object-fit: cover; border-radius: 18px; }
.phrase { justify-self: stretch; margin: 0; padding: 18px 20px; border-radius: 18px; background: #fff; color: var(--encre); font-size: 24px; font-weight: 700; line-height: 1.55; text-align: left; text-wrap: balance; }      /* lignes équilibrées : jamais un mot seul en fin de phrase */
.phrase.petite { font-size: 19px; }
.ordre-phrase { font-size: 21px; line-height: 1.95; }
.trou { display: inline-block; min-width: 92px; margin: 0 3px; padding: 0 10px; border-radius: 8px 8px 0 0; background: var(--violet-pale); box-shadow: inset 0 -3px 0 var(--violet); color: var(--violet); line-height: 1.45; }
.trou.pop { animation: pop .3s ease-out; }
.trou.elide { margin-left: 0; padding-left: 4px; }
@keyframes pop { from { transform: scale(.9); } }
.ordre-phrase .trou { min-width: 66px; cursor: pointer; }
.trou.curseur::after { content: ""; display: inline-block; width: 2px; height: 1.05em; margin-left: 2px; vertical-align: -.15em; background: currentColor; animation: clignote 1.1s steps(1) infinite; }
@keyframes clignote { 50% { opacity: 0; } }
.indice { justify-self: start; padding: 4px 12px; border-radius: 999px; background: rgba(255, 255, 255, .85); color: var(--doux); font-size: 14px; font-weight: 700; }
.sms { justify-self: stretch; display: grid; justify-items: start; gap: 6px; }
/* le SMS : une bulle de message reçu, avec sa pointe */
.sms p { position: relative; margin: 0 0 0 8px; padding: 13px 16px; border-radius: 20px 20px 20px 5px; background: #fff; color: var(--encre); font-size: 17px; font-weight: 500; line-height: 1.45; text-align: left; }
.sms p::before { content: ""; position: absolute; left: -8px; bottom: 0; width: 16px; height: 18px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 18'%3E%3Cpath d='M16 0v18H0c5-1.6 8.4-6 9-14z' fill='%23fff'/%3E%3C/svg%3E") no-repeat; }
.papier-court { justify-self: stretch; display: grid; gap: 4px; padding: 16px 18px; border-radius: 18px; background: #fff; text-align: left; }
.papier-court strong { font-size: 16px; }
.papier-court p { margin: 0; font-size: 17px; line-height: 1.55; }
.image-support { justify-self: stretch; position: relative; display: block; padding: 6px; border: 0; border-radius: 18px; background: #fff; }
.image-support img { display: block; width: 100%; max-height: 250px; object-fit: contain; border-radius: 12px; }
.loupe { position: absolute; right: 12px; bottom: 12px; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--violet); color: #fff; }
.loupe svg { width: 19px; height: 19px; }
.image-grande { width: 100%; border-radius: 12px; }
.scene-emoji { font-size: 60px; line-height: 1; }
.situation { justify-self: stretch; margin: 0; padding: 15px 17px; border-radius: 16px; background: #fff; color: var(--encre); font-size: 16.5px; font-weight: 500; line-height: 1.45; text-align: left; }
.doc-mini { justify-self: stretch; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; padding: 14px; border-radius: 18px; background: #fff; text-align: left; }
.doc-mini .icone-doc { display: grid; place-items: center; width: 54px; height: 60px; border-radius: 13px; background: var(--violet-pale); font-size: 28px; }
.doc-mini .icone-doc.avec-photo { width: 60px; height: 60px; overflow: hidden; border-radius: 50%; }
.avec-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.doc-mini strong { font-size: 17px; font-weight: 700; }
.pilule { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border: 0; border-radius: 999px; background: var(--violet-pale); color: var(--violet); font-size: 14.5px; font-weight: 700; }
.pilule svg { width: 16px; height: 16px; }

/* la question et les réponses, dans le blanc */
.question { margin: 0; font-size: 25px; font-weight: 800; line-height: 1.22; letter-spacing: -.015em; text-wrap: pretty; }
.lire-consigne { display: inline-grid; place-items: center; width: 32px; height: 32px; margin-left: 4px; padding: 0; border: 0; border-radius: 50%; background: var(--violet-pale); color: var(--violet); vertical-align: -5px; }
.lire-consigne svg { width: 16px; height: 16px; }
.lire-consigne.parle { background: var(--violet); color: #fff; }
.reponses { display: grid; gap: 10px; counter-reset: rep; }
.rep { counter-increment: rep; }
.bonbons .rep, .ligne-audio .rep { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 62px; padding: 12px 16px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; color: var(--encre); font-size: 17.5px; font-weight: 600; line-height: 1.3; text-align: left; transition: border-color .12s, background .12s; }
.marque { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: #f2f3f7; color: var(--doux); font-size: 15px; font-weight: 800; }
.marque::before { content: counter(rep, upper-alpha); }
.reponses .rep[aria-checked="true"] { border-color: var(--violet); background: #f7f4ff; box-shadow: inset 0 0 0 1px var(--violet); }
.reponses .rep[aria-checked="true"] .marque { background: var(--violet); color: #fff; }
.ligne-audio { display: flex; align-items: center; gap: 10px; }
.ecouter-rep { flex: none; display: grid; place-items: center; width: 52px; height: 52px; padding: 0; border: 0; border-radius: 50%; background: var(--violet); color: #fff; }
.ecouter-rep svg { width: 19px; height: 19px; margin-left: 2px; }
.ecouter-rep.parle { background: var(--violet-fonce); }
.reponses.images { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.reponses.images[data-cols="2"] .rep-image:first-child:nth-last-child(odd) { margin-inline: calc((100% - var(--wi)) / 2); }
.rep-image { width: var(--wi, calc((100% - 20px) / 3)); padding: 5px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; }
.rep-image img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 11px; }
.rep-image[aria-checked="true"] { border-color: var(--violet); background: #f7f4ff; box-shadow: inset 0 0 0 1px var(--violet); }
.mots-a-placer { display: flex; flex-wrap: wrap; gap: 9px; }
.mot-dispo { padding: 13px 18px; border: 1.5px solid var(--filet); border-radius: 13px; background: #fff; color: var(--encre); font-size: 18px; font-weight: 700; transition: opacity .15s; }
.mot-dispo:disabled { opacity: .3; cursor: default; }
.saisies { display: grid; gap: 12px; }
.champ { display: grid; gap: 6px; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--doux); }
.champ input { width: 100%; min-height: 64px; padding: 12px 18px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; color: var(--encre); font: 700 22px/1.2 var(--texte); outline: none; }
.champ input:focus { border-color: var(--violet); box-shadow: inset 0 0 0 1px var(--violet); }
.reponses.ecrire { display: grid; gap: 16px; }
.mot-ecrit { justify-self: stretch; }
.mot-ecrit .trou { display: block; width: 100%; min-height: 68px; margin: 0; padding: 14px 18px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; box-shadow: inset 0 -3px 0 var(--violet); color: var(--encre); font-size: 28px; font-weight: 700; line-height: 1.3; text-align: left; }
.lettres { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.lettre, .effacer { display: grid; place-items: center; height: 54px; padding: 0; border: 1.5px solid var(--filet); border-radius: 13px; background: #fff; color: var(--encre); font-size: 21px; font-weight: 800; text-transform: uppercase; transition: opacity .15s; }
.lettre:disabled { opacity: .28; cursor: default; }
.effacer { grid-column: span 2; color: var(--doux); }
.effacer:disabled { opacity: .45; cursor: default; }
.effacer svg { width: 23px; height: 23px; }

/* les boutons */
.bouton { display: grid; place-items: center; min-height: 56px; padding: 0 34px; border: 0; border-radius: 16px; font: 700 17.5px/1 var(--titre); }
.bas > .bouton:only-child { flex: 1; }
.bouton.vert { background: var(--violet); color: #fff; }
.bouton.vert:active:not(:disabled) { background: var(--violet-fonce); }
.bouton:disabled { opacity: .38; cursor: default; }
.bouton.blanc { flex: 1; background: #fff; color: var(--violet); box-shadow: inset 0 0 0 2px var(--violet); }
.lien { order: -1; padding: 10px 2px; border: 0; background: none; color: var(--doux); font-size: 15.5px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

/* les documents à lire : le titre dans le dégradé, le texte dans le blanc */
.lecture-tete { display: grid; justify-items: center; gap: 10px; text-align: center; }
.lecture-tete .papier-tete { display: grid; justify-items: center; gap: 10px; }
.papier-tete span { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 18px; background: #fff; font-size: 32px; flex: none; }
.papier-tete .avec-photo { width: 92px; height: 92px; overflow: hidden; border-radius: 50%; }
.papier-tete strong { display: block; font-size: 23px; font-weight: 800; line-height: 1.15; }
.papier-tete small { color: #2d4f7c; font-size: 14px; font-weight: 600; }
.feuille .papier-tete { display: flex; justify-items: start; align-items: center; gap: 12px; text-align: left; }
.feuille .papier-tete span { width: 48px; height: 48px; background: var(--violet-pale); font-size: 24px; }
.feuille .papier-tete .avec-photo { width: 56px; height: 56px; }
.feuille .papier-tete small { color: var(--doux); }
.papier { display: grid; gap: 12px; }
.papier p { margin: 0; font-size: 17.5px; line-height: 1.65; }
.consigne-lecture { margin: 4px 0 0; color: var(--doux); font-size: 15px; }
.tableau-defile { overflow-x: auto; }
.edt { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13px; line-height: 1.25; text-align: center; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: anywhere; }
.edt th, .edt td { padding: 7px 3px; border: 1px solid var(--filet); }
.edt tr > :first-child { width: 25%; white-space: nowrap; font-size: 11.5px; }
.edt tr:first-child > * { font-size: 12px; letter-spacing: .03em; }
.edt th { background: var(--violet-pale); font-weight: 800; }
.edt td:empty { background: #fbfaff; }

/* la feuille du bas (relire, agrandir) */
.voile { position: absolute; inset: 0; z-index: 5; display: flex; align-items: flex-end; background: rgba(20, 24, 43, .4); animation: entre .2s ease-out both; }
.feuille { width: 100%; max-height: 92%; overflow-y: auto; display: grid; gap: 12px; padding: 24px 22px calc(18px + env(safe-area-inset-bottom, 0px)); border-radius: 24px 24px 0 0; background: #fff; }
.feuille h2 { margin: 0; font-size: 23px; font-weight: 800; }
.feuille > p { margin: 0; color: var(--doux); }
.feuille .bouton { width: 100%; }
.feuille .lien { order: 0; justify-self: center; }      /* « Quitter » sous le bouton, pas au-dessus du titre */

/* l'accueil et la fin */
.ex-embleme { align-self: center; display: grid; place-items: center; width: 104px; height: 104px; border-radius: 50%; background: var(--violet); color: #fff; }
.ex-embleme svg { width: 46px; height: 46px; }
.ex-titre { margin: 0; font-size: 30px; font-weight: 800; line-height: 1.12; letter-spacing: -.02em; }
.ex-sous { margin: -6px 0 0; color: var(--doux); font-size: 16px; }
.ex-liste { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; }
.ex-liste li { display: flex; align-items: center; gap: 14px; font-size: 16.5px; font-weight: 600; }
.ex-liste .ic { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--violet-pale); color: var(--violet); flex: none; }
.ex-liste .ic svg { width: 21px; height: 21px; }
.ex-texte { margin: 0; color: var(--doux); font-size: 16.5px; line-height: 1.5; }

/* l'apparition de chaque écran, en cascade : la photo se pose (léger recul), le support monte, la bille éclot,
   puis la question, les réponses une à une et les boutons. Rien ne bouge la mise en page : seulement opacité et
   transformation, jouées une seule fois (une réponse touchée ne relance rien). */
@keyframes photo-pose { from { opacity: 0; transform: scale(1.08); } }
@keyframes monte { from { opacity: 0; transform: translateY(18px); } }
@keyframes eclot { 0% { opacity: 0; transform: scale(.5); } 55% { opacity: 1; } }
@keyframes fondu { from { opacity: 0; } }
.ecran { animation-duration: .18s; }
.ecran .cadre-photo { animation: photo-pose 1.2s cubic-bezier(.16, .84, .3, 1) backwards; }
.ecran .visuel > :not(.cadre-photo):not(.photo-scene):not(.lecteur), .ecran .lecture-tete, .ecran .ex-embleme { animation: monte .6s cubic-bezier(.2, .8, .2, 1) .08s backwards; }
.ecran .visuel > :not(.cadre-photo):not(.photo-scene):not(.lecteur) + :not(.lecteur) { animation-delay: .14s; }
.ecran .lecteur { animation: eclot .75s cubic-bezier(.34, 1.56, .64, 1) .1s backwards; }
.ecran .feuille-q > :not(.reponses) { animation: monte .55s cubic-bezier(.2, .8, .2, 1) .18s backwards; }
.ecran .feuille-q > :not(.reponses) + :not(.reponses) { animation-delay: .24s; }
.ecran .reponses > *, .ecran .ex-liste > li { animation: monte .5s cubic-bezier(.2, .8, .2, 1) backwards; }
.ecran .reponses > :nth-child(1), .ecran .ex-liste > li:nth-child(1) { animation-delay: .26s; }
.ecran .reponses > :nth-child(2), .ecran .ex-liste > li:nth-child(2) { animation-delay: .32s; }
.ecran .reponses > :nth-child(3), .ecran .ex-liste > li:nth-child(3) { animation-delay: .38s; }
.ecran .reponses > :nth-child(4) { animation-delay: .44s; }
.ecran .reponses > :nth-child(n+5) { animation-delay: .5s; }
.ecran .bas { animation: fondu .5s ease-out .34s backwards; }

/* la langue des consignes : un bouton sur l'accueil, la liste des langues dans la feuille du bas */
.langue { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; text-align: start; }
.drapeau { flex: none; width: 34px; height: 25px; overflow: hidden; border: 1px solid rgba(20, 24, 43, .12); border-radius: 5px; }
.drapeau img { display: block; width: 100%; height: 100%; object-fit: cover; }
.langue-txt { flex: 1; display: grid; line-height: 1.3; }
.langue-txt small { color: var(--doux); font-size: 13px; font-weight: 600; }
.langue-txt b { font-size: 16.5px; font-weight: 700; }
.langue > svg { flex: none; width: 20px; height: 20px; color: var(--doux); }
.langues { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.langue-opt { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 10px 12px; border: 1.5px solid var(--filet); border-radius: 14px; background: #fff; text-align: start; }
.langue-opt[aria-pressed="true"] { border-color: var(--violet); background: var(--violet-pale); }
.langue-opt > span:last-child { display: grid; min-width: 0; line-height: 1.25; }
.langue-opt b { justify-self: start; font-size: 15.5px; font-weight: 700; }      /* un nom écrit de droite à gauche reste calé à gauche, au-dessus du nom français */
.langue-opt small { color: var(--doux); font-size: 12.5px; font-weight: 600; }
/* une police par écriture (chargée à la demande) ; le français cité entre « » reste en Public Sans */
[lang="ar-SD"], [lang="ar"], [lang="ps"], [lang="fa-AF"] { font-family: "Public Sans", "Noto Sans Arabic", system-ui, sans-serif; }
[lang="ur"] { font-family: "Public Sans", "Noto Nastaliq Urdu", "Noto Sans Arabic", system-ui, sans-serif; line-height: 1.9 !important; }      /* le nastaliq descend en diagonale : il lui faut un interligne large, même dans les grands titres serrés */
[lang="ti"], [lang="am"] { font-family: "Public Sans", "Noto Sans Ethiopic", system-ui, sans-serif; }
[lang="ff"], [lang="bm"] { font-family: "Noto Sans", "Public Sans", system-ui, sans-serif; }      /* ɓ ɗ ƴ ɛ ɔ ɲ ŋ : toute la langue dans la même police */
[lang="bn"] { font-family: "Public Sans", "Noto Sans Bengali", system-ui, sans-serif; }
[lang="ta"] { font-family: "Public Sans", "Noto Sans Tamil", system-ui, sans-serif; }
[lang="bo"] { font-family: "Public Sans", "Noto Serif Tibetan", system-ui, serif; line-height: 1.7; }
[lang="ru"], [lang="uk"] { font-family: "Public Sans", "Noto Sans", system-ui, sans-serif; }
.question[dir="rtl"], .contexte[dir="rtl"], .situation[dir="rtl"], .ex-titre[dir="rtl"], .ex-sous[dir="rtl"], .ex-texte[dir="rtl"], .consigne-lecture[dir="rtl"] { text-align: right; }

/* une question qui ne tient pas dans la hauteur de l'écran se resserre, en deux crans */
.serre .scene { min-height: 190px; padding-top: 58px; padding-bottom: 20px; gap: 12px; }
.serre .feuille-q { gap: 13px; padding-bottom: 14px; }
.serre .lecteur { width: 84px; height: 84px; } .serre .lecteur > svg { width: 32px; height: 32px; }
.serre .question { font-size: 23px; }
.serre .bonbons .rep, .serre .ligne-audio .rep { min-height: 54px; padding-block: 9px; }
.serre .reponses { gap: 8px; }
.serre .image-support img { max-height: 190px; }
.serre .edt th, .serre .edt td { padding-block: 4px; }
.serre .ex-embleme { width: 88px; height: 88px; }
.tres-serre .scene { min-height: 150px; padding-top: 54px; padding-bottom: 14px; }
.tres-serre .lecteur { width: 72px; height: 72px; } .tres-serre .lecteur > svg { width: 28px; height: 28px; }
.tres-serre .phrase { font-size: 21px; padding: 14px 16px; }
.tres-serre .question { font-size: 21px; }
.tres-serre .sms p { font-size: 16px; padding: 11px 14px; }
.tres-serre .bonbons .rep, .tres-serre .ligne-audio .rep { min-height: 48px; font-size: 16.5px; }
.tres-serre .image-support img { max-height: 150px; }
.tres-serre .bouton { min-height: 50px; }
.tres-serre .lettre, .tres-serre .effacer { height: 48px; }

/* sur un appareil tactile ou un écran étroit : le test occupe tout l'écran, comme une application */
@media (max-width: 520px), (hover: none) and (pointer: coarse) {
  html, body { overflow: hidden; overscroll-behavior: none; background: #fff; }
  body { padding: 0; }
  .appli { position: fixed; inset: 0; width: auto; height: auto; border: 0; border-radius: 0; }
  .haut { padding-top: calc(14px + env(safe-area-inset-top, 0px)); }
  .scene { padding-top: calc(66px + env(safe-area-inset-top, 0px)); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
"""

ICONES_EN_PLUS = '''  livre: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
  crayon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5l4 4L8 20H4v-4z"/><path d="M14 6l4 4"/></svg>',
  ecoute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/></svg>',
  horloge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  micro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  langue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l5-12 5 12M4.8 14h6.4"/><path d="M15 12.5c0-1.4 1.1-2.5 2.8-2.5 1.6 0 2.7.9 2.7 2.6V18M20.5 14.6c-3.3 0-5.5.6-5.5 2.1 0 .9.7 1.5 1.9 1.5 2 0 3.6-1.4 3.6-3.6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8.5 15l2.5 2.5 5-5"/></svg>',
  fini: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
'''

HAUT = r'''
function haut() {
  // le numéro de la question depuis le début du test, sans repartir à zéro : le niveau n'apparaît jamais
  const n = etat.vus.length + etat.k + 1, pc = Math.min(100, Math.round(n / (PAR_PALIER * ORDRE.length) * 100));
  return `<div class="haut">
    <button class="rond" type="button" id="fermer" aria-label="Quitter le test">${ICONE.fermer}</button>
    <span class="numero">Question ${n}</span>
    ${boutonSon()}
    <span class="barre" aria-hidden="true"><i style="width:${pc}%"></i></span>
  </div>`;
}
'''

ACCUEIL = r'''
function ecranAccueil() {
  poser(`<section class="ecran ecran-accueil" aria-labelledby="t-accueil">
    <div class="haut"><span></span><span></span>${boutonSon()}</div>
    <div class="defile">
      <div class="scene accueil-tete"><small>Bienvenue</small><h1 id="t-accueil">Test de positionnement en français</h1><p>Environ 10 minutes</p></div>
      <div class="feuille-q">
        <ul class="etapes">
          <li><span class="ic">${ICONE.ecoute}</span>Écouter des enregistrements courts</li>
          <li><span class="ic">${ICONE.livre}</span>Lire des messages et des documents</li>
          <li><span class="ic">${ICONE.crayon}</span>Écrire des mots et des phrases</li>
        </ul>
        <p class="note">Les questions s'adaptent à vos réponses. Des écouteurs sont conseillés. Si vous ne savez pas, touchez «&nbsp;Je ne sais pas&nbsp;».</p>
      </div>
    </div>
    <div class="bas">${bouton("Commencer", "vert", 'id="commencer"')}</div>
  </section>`);
  brancherSon();
  $("#commencer").addEventListener("click", () => { audio(); SONS.valider(); vibrer(15); nouveauTest(); afficher(); });
}
'''

RESULTAT = r'''
function ecranResultat() {
  calculer();      // le niveau et le diagnostic restent pour le formateur (panneau « Moteur ») ; l'apprenant ne les voit pas
  poser(`<section class="ecran ecran-fin" aria-labelledby="t-resultat">
    <div class="haut"><span></span><span></span>${boutonSon()}</div>
    <div class="defile">
      <div class="scene accueil-tete"><small>C'est fini</small><h1>Merci pour vos réponses</h1></div>
      <div class="feuille-q fin"><span class="fin-coche">${ICONE.fini}</span><h2 id="t-resultat">Test terminé</h2>
        <p>Vous avez répondu à toutes les questions. Vous pouvez prévenir votre formateur.</p></div>
    </div>
    <div class="bas">${bouton("Fermer", "vert", 'id="refaire"')}</div>
  </section>`);
  brancherSon(); SONS.valider();
  $("#refaire").addEventListener("click", () => { etat = { ecran: "accueil" }; afficher(); });
}
'''

AJUSTER = r'''
function ajusterImages() {
  // réponses en images : aussi grandes que la place le permet (deux colonnes : une en haut, deux en bas), sinon sur une ligne
  const bloc = appli.querySelector(".reponses.images"); if (!bloc) return;
  const d = bloc.closest(".defile"), n = bloc.children.length, g = 10, larg = bloc.clientWidth, ligne = Math.floor((larg - (n - 1) * g) / n);
  const essayer = (cols, w) => { bloc.dataset.cols = cols; bloc.style.setProperty("--wi", w + "px"); return d.scrollHeight <= d.clientHeight; };
  if (n > 2) for (let w = Math.min(Math.floor((larg - g) / 2), 200); w >= ligne + 16; w -= 6) if (essayer(2, w)) return;
  essayer(n, ligne);
}
'''

LECTURE = r'''
function ecranLecture(q) {
  poser(`<section class="ecran" aria-labelledby="t-doc">
    ${haut()}
    <div class="defile"><div class="scene vide"></div><div class="feuille-q">${papier(q).replace("<strong>", '<strong id="t-doc">')}<p class="consigne-lecture">Lisez le document. La question arrive ensuite, et vous pourrez le relire.</p></div></div>
    <div class="bas">${bouton("J'ai lu", "vert", 'id="lu"')}</div>
  </section>`);
  brancherSon(); avancerJauge();
  $("#fermer").addEventListener("click", demanderQuitter);
  $("#lu").addEventListener("click", () => { etat.lus[q.id] = true; SONS.page(); afficher(); });
  resserrer();
}
'''


HAUT_EXAMEN = r"""
function haut() {
  // en haut : le son à gauche, quitter à droite ; ni numéro de question ni niveau
  return `<div class="haut">${boutonSon()}<button class="rond" type="button" id="fermer" aria-label="Quitter le test">${ICONE.fermer}</button></div>`;
}
"""

ACCUEIL_EXAMEN = r"""
function ecranAccueil() {
  poser(`<section class="ecran ecran-accueil" aria-labelledby="t-accueil">
    <div class="haut">${boutonSon()}</div>
    <div class="defile">
      <div class="scene">${IMAGES.intro ? `<div class="visuel photo-fond fond-seul">${photoFond("intro")}</div>` : `<span class="ex-embleme" aria-hidden="true">${ICONE.ecoute}</span>`}</div>
      <div class="feuille-q">
        <h1 class="ex-titre" id="t-accueil">Évaluation de positionnement</h1>
        <p class="ex-sous">Français · environ 10 minutes</p>
        <ul class="ex-liste">
          <li><span class="ic">${ICONE.ecoute}</span>Écouter des enregistrements courts</li>
          <li><span class="ic">${ICONE.livre}</span>Lire des messages et des documents</li>
          <li><span class="ic">${ICONE.crayon}</span>Écrire des mots et des phrases</li>
        </ul>
        <button class="langue" type="button" id="langue">${drapeau(langue())}<span class="langue-txt"><small>Langue des consignes</small><b lang="${LANGUE}" dir="auto">${langue().natif}</b></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
      </div>
    </div>
    <div class="bas">${bouton("Commencer", "vert", 'id="commencer"')}</div>
  </section>`);
  brancherSon();
  $("#commencer").addEventListener("click", () => { audio(); SONS.valider(); vibrer(15); nouveauTest(); afficher(); });
  $("#langue").addEventListener("click", () => { audio(); choisirLangueFeuille(); });
  resserrer();
}
"""

RESULTAT_EXAMEN = r"""
function ecranResultat() {
  calculer();      // le niveau et le diagnostic restent pour le formateur (panneau « Moteur ») ; l'apprenant ne les voit pas
  poser(`<section class="ecran ecran-fin" aria-labelledby="t-resultat">
    <div class="haut">${boutonSon()}</div>
    <div class="defile">
      <div class="scene"><span class="ex-embleme" aria-hidden="true">${ICONE.fini}</span></div>
      <div class="feuille-q">
        <h1 class="ex-titre" id="t-resultat">Évaluation terminée</h1>
        <p class="ex-texte">Merci pour vos réponses. Vous pouvez prévenir votre formateur que vous avez terminé.</p>
      </div>
    </div>
    <div class="bas">${bouton("Fermer", "vert", 'id="refaire"')}</div>
  </section>`);
  brancherSon(); SONS.valider();
  $("#refaire").addEventListener("click", () => { etat = { ecran: "accueil" }; afficher(); });
  resserrer();
}
"""

LECTURE_EXAMEN = r"""
function ecranLecture(q) {
  // le titre du document dans le dégradé (sur la photo en grand s'il y en a une), le texte dans le blanc
  const html = papier({ ...q, photo: null }).replace("<strong>", '<strong id="t-doc">'), m = html.match(/<div class="papier-tete">[\s\S]*?<\/small><\/div><\/div>/);
  const tete = m ? m[0] : "", corps = m ? html.replace(tete, "") : html;
  const fond = q.photo ? `<div class="visuel photo-fond fond-seul">${photoFond(q.photo)}</div>` : "";
  poser(`<section class="ecran" aria-labelledby="t-doc">
    ${haut()}
    <div class="defile"><div class="scene">${fond}<div class="lecture-tete${q.photo ? " sur-photo" : ""}">${tete}</div></div>
      <div class="feuille-q">${corps}<p class="consigne-lecture">Lisez le document. La question arrive ensuite, et vous pourrez le relire.</p></div></div>
    <div class="bas">${bouton("J'ai lu", "vert", 'id="lu"')}</div>
  </section>`);
  brancherSon(); avancerJauge();
  $("#fermer")?.addEventListener("click", demanderQuitter);
  $("#lu").addEventListener("click", () => { etat.lus[q.id] = true; SONS.page(); afficher(); });
  resserrer();
}
"""

# Cadrage des photos de « L'examen » : la carte (SMS, phrase, texte…) reste au centre ; quand elle cache un visage ou le
# sujet, la photo remonte (dy) et son fondu blanc remonte avec elle (aucun bord visible), peut s'agrandir (z, depuis
# le haut) et se décaler à gauche ou à droite (ox, en %).
CADRES = {
    # la photo remonte (dy, en % de sa hauteur) pour que le visage ou le sujet passe au-dessus de la carte
    "conversation": {"dy": -22}, "telephone-2": {"dy": -15}, "amir": {"dy": -28}, "fatigue": {"dy": -25}, "cafe": {"dy": -25},
    "croissant": {"dy": -22}, "chats": {"dy": -18}, "lucas": {"dy": -25}, "tele": {"dy": -15},
    "couple": {"dy": -15}, "enfants": {"dy": -22},
    "amis-telephone": {"dy": -20}, "chez-amie": {"dy": -18}, "reunion": {"dy": -22}, "lisa": {"dy": -10}, "marie": {"dy": -12},
    "tante": {"dy": -22},
}
CADRES_JS = r"""// cadrage de chaque photo (agrandissement z autour du point ox oy), pour qu'aucune carte ne cache un visage
const CADRES = __CADRES__;
function photoFond(nom) {
  const c = CADRES[nom] || {}, dy = c.dy || 0, z = c.z || 1;
  const st = [dy && `--dy:${dy}%`, z !== 1 && `--z:${z}`, c.ox != null && `--ox:${c.ox}%`, (dy || z !== 1) && `--fin:${Math.min(100, dy + z * 100)}%`].filter(Boolean).join(";");
  return `<span class="cadre-photo"${st ? ` style="${st}"` : ""}><img class="photo-scene" src="${IMAGES[nom]}" alt=""></span>`;
}"""

# La langue des consignes de « L'examen » : 10 langues en plus du français. Sont traduits : les questions (sauf celles
# qui contiennent un blanc à compléter et la dictée de numéro A2-35), les phrases de contexte, les situations, les
# étiquettes, les indications (« Le verbe correct au présent »…) et l'interface. Restent en français : les phrases à
# compléter, les réponses, les SMS, les documents, les textes à lire. Traductions : traductions/<code>.json (clé = texte
# français). Voix des questions A1 traduites : sons/<code>/ (generer_voix.py) ; pas de voix pour le tibétain.
LANGUES = [
    {"code": "fr", "nom": "Français", "natif": "Français", "drapeau": "fr"},
    {"code": "ar-SD", "nom": "Soudanais", "natif": "عربي سوداني", "drapeau": "sd", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "uk", "nom": "Ukrainien", "natif": "Українська", "drapeau": "ua", "police": "Noto Sans"},
    {"code": "ps", "nom": "Pachto", "natif": "پښتو", "drapeau": "af", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "ln", "nom": "Lingala", "natif": "Lingála", "drapeau": "cd"},
    {"code": "so", "nom": "Somali", "natif": "Soomaali", "drapeau": "so"},
    {"code": "bn", "nom": "Bengali", "natif": "বাংলা", "drapeau": "bd", "police": "Noto Sans Bengali"},
    {"code": "bo", "nom": "Tibétain", "natif": "བོད་སྐད།", "drapeau": "tibet", "police": "Noto Serif Tibetan"},
    {"code": "fa-AF", "nom": "Dari, persan", "natif": "دری", "drapeau": "af", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "ru", "nom": "Russe", "natif": "Русский", "drapeau": "ru", "police": "Noto Sans"},
    {"code": "ta", "nom": "Tamoul", "natif": "தமிழ்", "drapeau": "lk", "police": "Noto Sans Tamil"},
    # ajoutées ensuite ; le nom dit aussi les langues très proches qu'elles couvrent (azéri, poular, dioula, malinké, hindi à l'oral)
    {"code": "ar", "nom": "Arabe", "natif": "العربية", "drapeau": "arab", "dir": "rtl", "police": "Noto Sans Arabic"},
    {"code": "tr", "nom": "Turc, azéri", "natif": "Türkçe", "drapeau": "tr"},
    {"code": "ti", "nom": "Tigrinya", "natif": "ትግርኛ", "drapeau": "er", "police": "Noto Sans Ethiopic"},
    {"code": "en", "nom": "Anglais", "natif": "English", "drapeau": "gb"},
    {"code": "am", "nom": "Amharique", "natif": "አማርኛ", "drapeau": "et", "police": "Noto Sans Ethiopic"},
    {"code": "sq", "nom": "Albanais", "natif": "Shqip", "drapeau": "al"},
    {"code": "sg", "nom": "Sango", "natif": "Sängö", "drapeau": "cf"},
    {"code": "ff", "nom": "Peul, poular", "natif": "Pular / Pulaar", "drapeau": "gn", "police": "Noto Sans"},
    {"code": "kmr", "nom": "Kurde (kurmandji)", "natif": "Kurdî", "drapeau": "kurdistan"},
    {"code": "rw", "nom": "Kinyarwanda", "natif": "Ikinyarwanda", "drapeau": "rw"},
    {"code": "es", "nom": "Espagnol", "natif": "Español", "drapeau": "es"},
    {"code": "ur", "nom": "Ourdou, hindi à l'oral", "natif": "اردو", "drapeau": "pk", "dir": "rtl", "police": "Noto Nastaliq Urdu"},
    {"code": "bm", "nom": "Bambara, dioula, malinké", "natif": "Bamanankan", "drapeau": "ml", "police": "Noto Sans"},
    {"code": "sw", "nom": "Swahili", "natif": "Kiswahili", "drapeau": "tz"},
]

def donnees_langue(artifact):
    """Les drapeaux (SVG intégrés), les traductions et les voix des questions traduites."""
    drapeaux = {l["drapeau"]: "data:image/svg+xml;base64," + base64.b64encode(open(os.path.join(ICI, "drapeaux", l["drapeau"] + ".svg"), "rb").read()).decode() for l in LANGUES}
    source = json.load(open(os.path.join(ICI, "traductions", "source.json"), encoding="utf-8"))
    cles = set(source["interface"] + source["questions"] + source["contextes"] + source["indices"])
    trad, voix = {}, {}
    for l in LANGUES[1:]:
        f = os.path.join(ICI, "traductions", l["code"] + ".json")
        if os.path.exists(f):
            trad[l["code"]] = {k: v for k, v in json.load(open(f, encoding="utf-8")).items() if k in cles and v}
        idx = os.path.join(ICI, "sons", l["code"], "index.json")
        if os.path.exists(idx):
            for fr, fichier in json.load(open(idx, encoding="utf-8")).items():
                chemin = os.path.join(ICI, "sons", l["code"], fichier)
                if os.path.exists(chemin):
                    voix["q:" + l["code"] + ":" + fr] = ("data:audio/mpeg;base64," + base64.b64encode(open(chemin, "rb").read()).decode()) if artifact else "../sons/" + l["code"] + "/" + fichier
    return drapeaux, trad, voix

LANGUE_JS = r"""// ------------------------------------------------------------------------------ la langue des consignes
// Questions, contextes, indications et boutons dans la langue choisie à l'accueil ; phrases à compléter, réponses,
// SMS et documents restent en français.
const LANGUES = __LANGUES__;
const DRAPEAUX = __DRAPEAUX__;
const TRAD = __TRAD__;
let LANGUE = "fr";
try { const l = localStorage.getItem("positionnement-langue"); if (LANGUES.some(x => x.code === l)) LANGUE = l; } catch (e) {}
const langue = () => LANGUES.find(x => x.code === LANGUE) || LANGUES[0];
const t = (fr) => (fr && LANGUE !== "fr" && TRAD[LANGUE] && TRAD[LANGUE][fr]) || fr;
const traduit = (fr) => !!fr && t(fr) !== fr;
const attrsLangue = (fr) => traduit(fr) ? ` lang="${LANGUE}" dir="${langue().dir || "ltr"}"` : "";
const drapeau = (l) => `<span class="drapeau" aria-hidden="true"><img src="${DRAPEAUX[l.drapeau]}" alt=""></span>`;
const polices = new Set();
function chargerPolice(famille, texte) {
  if (!famille) return; const cle = famille + "|" + (texte || ""); if (polices.has(cle)) return; polices.add(cle);
  const l = document.createElement("link"); l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=" + famille.replace(/ /g, "+") + ":wght@400;700" + (texte ? "&text=" + encodeURIComponent(texte) : "") + "&display=swap";
  document.head.appendChild(l);
}
chargerPolice(langue().police);
function choisirLangue(code) { LANGUE = code; try { localStorage.setItem("positionnement-langue", code); } catch (e) {} chargerPolice(langue().police); }
// l'interface (boutons, titres, phrases d'aide) est traduite sur place après chaque affichage
const ZONES_INTERFACE = ".bas, .feuille > h2, .feuille > p, .feuille .bouton, .feuille .lien, .ex-titre, .ex-sous, .ex-liste, .ex-texte, .consigne-lecture, .papier-tete small, .pilule, .langue-txt small";
function traduireInterface(racine) {
  if (!racine || LANGUE === "fr") return;
  const dir = langue().dir || "ltr";
  racine.querySelectorAll(ZONES_INTERFACE).forEach(z => {
    const w = document.createTreeWalker(z, NodeFilter.SHOW_TEXT), liste = [];
    while (w.nextNode()) liste.push(w.currentNode);
    for (const n of liste) { const k = n.nodeValue.trim(); if (traduit(k)) { n.nodeValue = n.nodeValue.replace(k, t(k)); n.parentElement.lang = LANGUE; n.parentElement.dir = dir; } }
  });
  racine.querySelectorAll("[placeholder]").forEach(e => { const k = e.getAttribute("placeholder"); if (traduit(k)) { e.setAttribute("placeholder", t(k)); e.lang = LANGUE; e.dir = dir; } });
}
function choisirLangueFeuille() {
  LANGUES.forEach(l => chargerPolice(l.police, l.natif));      // les noms des langues, chacun dans son écriture
  const v = feuille(`<h2>${echap(t("Choisissez la langue des consignes"))}</h2><div class="langues">${LANGUES.map(l => `<button class="langue-opt" type="button" data-code="${l.code}" aria-pressed="${l.code === LANGUE}">${drapeau(l)}<span><b lang="${l.code}" dir="auto">${l.natif}</b><small>${l.nom}</small></span></button>`).join("")}</div>`);
  v.querySelectorAll(".langue-opt").forEach(b => b.addEventListener("click", () => { choisirLangue(b.dataset.code); SONS.choix(); v.remove(); afficher(); }));
}"""

INSECABLES = r"""// un mot à trait d'union (« posez-vous », « attends-moi ») ne se coupe jamais : il passe entier à la ligne
function insecables(racine) {
  if (!racine) return;
  const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT), liste = [];
  while (w.nextNode()) { const n = w.currentNode; if (/[\p{L}\d]-[\p{L}\d]/u.test(n.nodeValue) && !n.parentElement.closest("script, style, .insec")) liste.push(n); }
  for (const n of liste) {
    const f = document.createDocumentFragment();
    n.nodeValue.split(/(\S*[\p{L}\d]-[\p{L}\d]\S*)/u).forEach((m, i) => { if (!m) return; if (i % 2) { const e = document.createElement("span"); e.className = "insec"; e.textContent = m; f.append(e); } else f.append(m); });
    n.replaceWith(f);
  }
}"""

# ------------------------------------------------------------------------------ « Le Hublot » : la version pour ordinateur
# Même test que « L'examen » (même moteur, mêmes questions, langues et voix), avec une mise en page pour les écrans d'au
# moins 1000 × 600 px ; en dessous (téléphone, tablette en portrait), rien ne change. Choisie parmi les maquettes bureau
# (maquettes-bureau/, piste D), puis ajustée : contexte au-dessus de la question, message qui sort d'une enveloppe,
# phrase à compléter au centre du cercle ; on lit de gauche à droite : la question à gauche, le cercle à droite.
CSS_HUBLOT = r"""
/* ================= « Le Hublot » : l'écran d'ordinateur (au moins 1000 × 600 px) =================
   On lit de gauche à droite. À gauche, sur le blanc : ce qui pose la situation, la question en grand, les réponses, les
   boutons. À droite, la photo dans un grand cercle (un ciel quand il n'y a pas de photo), posé sur ses propres couleurs
   en flou léger ; la bille d'écoute est son satellite ; la phrase à compléter se place au centre du cercle ; un message
   sort d'une enveloppe.
   Transition : le cercle se referme sur la bille et le suivant s'ouvre depuis elle ; les couleurs passent en fondu. */
#sorties { display: none; }
@media (min-width: 1000px) and (min-height: 600px) {
  html, body { background: #fff; }
  body { display: block; padding: 0; }
  .appli { position: fixed; inset: 0; width: auto; height: auto; border: 0; border-radius: 0; background: transparent; }
  #sorties { display: block; position: fixed; inset: 0; z-index: 0; pointer-events: none; }
  .ecran { --rond: min(34vw, 60vh); --b: 156px; display: grid; grid-template-columns: minmax(0, 1fr) 50vw; grid-template-rows: minmax(84px, 1fr) auto auto minmax(36px, 1fr); }
  .defile { display: contents; }
  .haut { padding: 24px 28px 0; }
  .rond { width: 46px; height: 46px; }
  .rond svg { width: 20px; height: 20px; }

  /* la scène, à droite : un fond aux couleurs de la photo, le cercle au milieu */
  .scene, .scene.vide { grid-column: 2; grid-row: 1 / -1; position: relative; display: grid; place-items: center; min-height: 0; padding: 88px 32px 72px; gap: 0; background: none; overflow: visible; }
  .scene > :not(.fond-d) { grid-area: 1 / 1; position: relative; z-index: 1; }
  .fond-d { position: absolute; inset: 0 0 0 auto; z-index: 0; width: 54vw; overflow: hidden;      /* l'emprise de l'ancien ciel : depuis le bord droit, arrêté avant la colonne de texte, pâli vers le bas */
    -webkit-mask-image: linear-gradient(270deg, #000 40%, transparent 100%), linear-gradient(#000 30%, transparent 96%); -webkit-mask-composite: source-in;
    mask-image: linear-gradient(270deg, #000 40%, transparent 100%), linear-gradient(#000 30%, transparent 96%); mask-composite: intersect; }
  .fond-d .brume { position: absolute; inset: -12%; animation: h-derive 22s ease-in-out infinite alternate; }
  .fond-d img { display: block; width: 100%; height: 100%; object-fit: cover; filter: blur(28px) saturate(1.3); opacity: .5; }
  .fond-d .ciel-fin { position: absolute; inset: 0; background: var(--ciel); }
  /* aucune image à l'écran, et dans le cercle la bille d'écoute seule ou la phrase à compléter : un dégradé turquoise
     plus affirmé, réglé par l'utilisateur dans la maquette « Bulle d'écoute seule » (linéaire 160°, fond autour à 70 %) */
  .h-turquoise .rond-ciel { background: linear-gradient(160deg, #52a3b7 0%, #35b1d0 50%, #1bf3da 100%); }
  .h-turquoise .fond-d .ciel-fin { background: linear-gradient(180deg, #37cbc9 0%, #72c8de 55%, #d3eef5 100%); opacity: .7; }
  @keyframes h-derive { to { transform: translate(-3%, -2%) scale(1.08); } }
  .visuel, .visuel.fond-seul { position: relative; inset: auto; display: grid; place-items: center; width: var(--rond); height: var(--rond); gap: 0; }
  .visuel > * { grid-area: 1 / 1; }
  .photo-fond > :not(.photo-scene) { position: relative; }
  /* le cercle : la photo, ou un ciel */
  .photo-fond > .cadre-photo, .rond-ciel { display: block; position: relative; inset: auto; z-index: 0; width: var(--rond); height: var(--rond); overflow: hidden; border: 4px solid #fff; border-radius: 50%; background: var(--ciel); -webkit-mask-image: none; mask-image: none; }
  .cadre-photo > .photo-scene { position: absolute; inset: 0; width: 100%; height: 100%; max-height: none; border-radius: 0; object-fit: cover; object-position: var(--ox, 50%) 38%; transform: none; -webkit-mask-image: none; mask-image: none; }
  /* la bille d'écoute : satellite du cercle, avec une petite ombre ; seule, elle se pose au centre */
  .visuel > .lecteur { z-index: 3; width: var(--b); height: var(--b); align-self: start; justify-self: end; margin: calc(var(--rond) * .146 - var(--b) / 2) calc(var(--rond) * .146 - var(--b) / 2) 0 0; box-shadow: 0 8px 22px rgba(52, 26, 140, .32); }
  .visuel > .lecteur.h-seul { --b: 184px; align-self: center; justify-self: center; margin: 0; }
  .lecteur > svg { width: 38%; height: 38%; margin-left: 3%; }
  .pastille { width: 38px; height: 38px; font-size: 16px; }
  .vague { height: 40%; gap: 6px; }
  .vague i { width: 6px; }
  /* au centre du cercle : la phrase à compléter, et son indication dessous */
  .h-centre { z-index: 2; display: grid; justify-items: center; gap: 12px; width: min(calc(var(--rond) * 1.1), 640px); }
  .h-centre > .phrase { justify-self: stretch; padding: 22px 28px; border-radius: 24px; font-size: clamp(26px, 2.3vw, 36px); line-height: 1.45; text-align: center; text-wrap: balance; }      /* lignes équilibrées : jamais un mot seul en fin de phrase */
  .h-centre > .phrase.petite { font-size: clamp(24px, 2vw, 32px); }
  .h-centre > .ordre-phrase { line-height: 1.85; }
  .h-centre .trou { min-width: 3.4em; }
  .h-centre .ordre-phrase .trou { min-width: 2.6em; }
  .h-centre > .indice { justify-self: center; padding: 6px 16px; background: #fff; font-size: 16px; }
  /* un message (SMS, petit texte) sort d'une enveloppe et se pose sur le bas du cercle */
  .lettre-env { z-index: 2; align-self: end; position: relative; display: grid; width: min(calc(var(--rond) * 1.12), 600px); margin-bottom: calc(var(--rond) * -.1); perspective: 900px; }
  /* le message est une feuille blanche, au coin replié, qui se détache du fond ; il fait face à la question */
  .visuel.h-message { width: min(calc(50vw - 72px), 660px); height: calc(100vh - 170px); }
  .h-message > .cadre-photo, .h-message > .rond-ciel { --rond: min(26vw, 44vh); align-self: start; justify-self: end; }      /* la photo, plus petite, en haut côté bord */
  .h-message > .lettre-env { align-self: center; justify-self: start; width: min(calc(100% - 3vw), 560px); margin: 0; }      /* la feuille côté question, en face d'elle */
  .h-feuille { position: relative; z-index: 2; transform-origin: 50% 100%; animation: h-extrait 1.25s cubic-bezier(.45, 0, .2, 1) 1s both; }
  .h-feuille::before { content: ""; position: absolute; inset: 0; z-index: -1; border: 1px solid rgba(20, 24, 43, .08); border-radius: 4px; background: #f3f0fb; transform: rotate(2.4deg) translate(6px, 4px); }      /* une seconde feuille dessous, légèrement de biais : le papier se détache du fond */
  .h-papier { position: relative; padding: 34px 40px 36px 38px; border: 1px solid rgba(20, 24, 43, .1); border-radius: 4px; background: #fff; color: var(--encre); text-align: left;
    clip-path: polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%); }
  .h-papier::before { content: ""; position: absolute; top: 0; right: 0; width: 30px; height: 30px; background: linear-gradient(225deg, transparent 50%, #e2dcf4 50%); }
  .h-papier-corps { display: grid; gap: 12px; max-height: calc(100vh - 270px); overflow-y: auto; hyphens: manual; -webkit-hyphens: manual; overflow-wrap: normal; word-break: normal; scrollbar-width: thin; }
  .h-papier-corps p, .h-papier .papier p { margin: 0; max-width: none; color: var(--encre); font-size: clamp(17px, 1.3vw, 20px); font-weight: 500; line-height: 1.62; text-wrap: pretty; }
  .h-papier .h-salut { font-weight: 600; }
  .h-papier .h-signature { margin-top: 4px; font-weight: 700; }
  .h-papier .papier { display: grid; gap: 12px; }
  .h-papier .papier-tete { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; padding: 0 0 16px; border-bottom: 1px solid var(--filet); background: none; text-align: left; }
  .h-papier .papier-tete span { width: 52px; height: 52px; border-radius: 14px; background: var(--violet-pale); font-size: 26px; }
  .h-papier .papier-tete .avec-photo { width: 56px; height: 56px; border-radius: 50%; }
  .h-papier .papier-tete strong { font-size: 22px; line-height: 1.2; }
  .env-dos, .env-poche, .env-rabat { position: absolute; left: 19%; bottom: 0; width: 62%; aspect-ratio: 1.6; }
  .env-dos { z-index: 1; border-radius: 12px; background: #e6defc; animation: h-fondu .3s ease .3s both, h-env-sort .45s ease 1.7s forwards; }
  .env-poche { z-index: 3; border-radius: 12px; background: linear-gradient(#ffffff, #f2ecff); clip-path: polygon(0 30%, 50% 68%, 100% 30%, 100% 100%, 0 100%); animation: h-fondu .3s ease .3s both, h-env-sort .45s ease 1.7s forwards; }
  .env-rabat { z-index: 4; background: #f7f4ff; clip-path: polygon(0 0, 100% 0, 50% 62%); transform-origin: 50% 0; animation: h-fondu .3s ease .3s both, h-rabat .5s cubic-bezier(.4, 0, .2, 1) .62s both, h-rabat-sort .45s ease 1.7s forwards; }
  @keyframes h-fondu { from { opacity: 0; } }
  @keyframes h-env-sort { to { opacity: 0; transform: translateY(36px); } }
  @keyframes h-rabat { 0% { transform: rotateX(0deg); z-index: 4; } 49% { z-index: 4; } 51% { z-index: 0; } 100% { transform: rotateX(180deg); z-index: 0; } }
  @keyframes h-rabat-sort { from { opacity: 1; transform: rotateX(180deg); } to { opacity: 0; transform: translateY(36px) rotateX(180deg); } }
  /* le message : d'abord il glisse hors de l'enveloppe, encore petit, puis il grandit jusqu'à sa place, devant elle */
  @keyframes h-extrait { 0% { opacity: 0; transform: scale(.55); z-index: 2; } 8% { opacity: 1; } 44% { transform: translateY(-72%) scale(.55); z-index: 2; } 46% { z-index: 5; } 100% { opacity: 1; transform: none; z-index: 5; } }
  /* ce qui pose la situation passe dans la colonne de texte, au-dessus de la question : on le lit en premier */
  .feuille-q > .amorce { justify-self: stretch; max-width: 46ch; margin: 0; padding: 2px 0 2px 18px; border: 0; border-left: 4px solid var(--violet); border-radius: 0; background: none; color: #343a52; font-size: clamp(19px, 1.5vw, 23px); font-weight: 600; line-height: 1.45; text-align: left; }
  .feuille-q > .amorce[dir="rtl"] { padding: 2px 18px 2px 0; border-left: 0; border-right: 4px solid var(--violet); text-align: right; }
  /* le document : son titre en carte sur le bas du cercle ; le rappel « Relire » aussi */
  .scene > .lecture-tete { z-index: 2; align-self: center; translate: 0 calc(var(--rond) / 2 - 24px); }
  .lecture-tete .papier-tete, .lecture-tete.sur-photo .papier-tete { display: flex; align-items: center; gap: 14px; margin: 0; padding: 16px 24px 16px 16px; border-radius: 22px; background: #fff; text-align: left; }
  .lecture-tete .papier-tete span { width: 56px; height: 56px; background: var(--violet-pale); font-size: 28px; }
  .lecture-tete .papier-tete .avec-photo { width: 64px; height: 64px; }
  .papier-tete strong { font-size: 26px; }
  .papier-tete small { color: var(--doux); font-size: 15px; }
  .visuel > .doc-mini { z-index: 2; align-self: end; width: min(calc(var(--rond) * 1.05), 560px); margin-bottom: calc(var(--rond) * -.06); gap: 16px; padding: 16px 18px; }
  .doc-mini strong { font-size: 20px; }
  .pilule { padding: 11px 18px; font-size: 16px; }
  /* sans photo : deux flèches opposées, en blanc, pour les contraires */
  .scene > .h-signe, .visuel > .h-signe { z-index: 2; color: #fff; pointer-events: none; }
  .h-contraire { width: calc(var(--rond) * .42); height: calc(var(--rond) * .42); }
  .h-contraire svg { width: 100%; height: 100%; overflow: visible; }
  .h-interro { width: calc(var(--rond) * .4); height: calc(var(--rond) * .4); }
  .h-interro svg { width: 100%; height: 100%; overflow: visible; }
  /* une affiche (image à lire) : pas de cercle, l'image entière */
  .visuel.h-affiche { width: min(38vw, 560px); height: auto; }
  .h-affiche .image-support img { max-height: calc(100vh - 220px); }
  .visuel > .scene-emoji { z-index: 2; font-size: 120px; }
  /* l'écran de fin : la coche au centre d'un ciel */
  .scene > .ex-embleme { z-index: 2; width: 172px; height: 172px; border: 4px solid #fff; }
  .ex-embleme svg { width: 46%; height: 46%; }

  /* la colonne de gauche, sur le blanc */
  .feuille-q { grid-column: 1; grid-row: 2; justify-self: end; position: relative; z-index: 1; display: flex; flex-direction: column; gap: 30px; width: min(100%, 880px); max-height: calc(100vh - 220px); padding: 4px clamp(20px, 2.6vw, 52px) 4px clamp(40px, 6vw, 112px); overflow: hidden; background: none; scrollbar-width: thin; }
  .feuille-q.deborde { overflow-y: auto; }      /* la barre n'apparaît que si le contenu dépasse vraiment, une fois l'écran posé */
  .bas { grid-column: 1; grid-row: 3; justify-self: end; position: relative; z-index: 1; width: min(100%, 880px); padding: 28px clamp(20px, 2.6vw, 52px) 0 clamp(40px, 6vw, 112px); background: none; }
  .question { font-size: clamp(42px, 4.4vw, 71px); font-weight: 800; line-height: 1.03; letter-spacing: -.038em; text-wrap: balance; }
  .question.longue { font-size: clamp(34px, 3.3vw, 54px); line-height: 1.08; letter-spacing: -.03em; }
  .question[lang="ur"], .question.longue[lang="ur"] { font-size: clamp(32px, 3.3vw, 52px); }      /* le nastaliq, à grand interligne, prend plus de hauteur */
  .lire-consigne { width: 52px; height: 52px; margin-left: 10px; vertical-align: middle; }
  .lire-consigne svg { width: 24px; height: 24px; }
  .reponses { gap: 12px; }
  .bonbons .rep, .ligne-audio .rep { min-height: 76px; gap: 18px; padding: 14px 22px; border-radius: 18px; font-size: clamp(19px, 1.5vw, 22px); }
  .marque { width: 42px; height: 42px; border-radius: 12px; font-size: 17px; }
  .ecouter-rep { width: 62px; height: 62px; }
  .ecouter-rep svg { width: 22px; height: 22px; }
  .reponses.images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; max-width: 620px; }
  .reponses.images .rep-image, .reponses.images[data-cols="2"] .rep-image:first-child:nth-last-child(odd) { width: auto; margin: 0; padding: 6px; border-radius: 18px; }
  .rep-image img { aspect-ratio: 16 / 10; border-radius: 13px; }
  .mots-a-placer { gap: 12px; }
  .mot-dispo { padding: 16px 22px; border-radius: 16px; font-size: 22px; }
  .champ { font-size: 14px; }
  .champ input { max-width: 560px; min-height: 72px; font-size: 26px; }
  .papier { gap: 16px; }
  .papier p { max-width: 64ch; font-size: clamp(18px, 1.35vw, 20px); line-height: 1.7; }
  .consigne-lecture { font-size: 17px; }
  .bouton { min-height: 64px; padding: 0 40px; border-radius: 18px; font-size: 20px; }
  .bas > .bouton:only-child { flex: none; }
  .lien { font-size: 17px; }
  /* l'accueil et la fin */
  .ecran-accueil .feuille-q { gap: 24px; }
  .ex-titre { font-size: clamp(52px, 5.7vw, 96px); font-weight: 900; line-height: .95; letter-spacing: -.05em; text-wrap: balance; }
  .ex-sous { margin: 0; font-size: 20px; }
  .ex-liste { gap: 14px; }
  .ex-liste li { font-size: 19px; }
  .ex-liste .ic { width: 48px; height: 48px; }
  .langue { max-width: 440px; }
  .ex-texte { max-width: 34ch; font-size: 22px; }
  /* les feuilles (relire, langue, quitter) : une fenêtre au centre de l'écran */
  .voile { align-items: center; justify-content: center; background: rgba(20, 24, 43, .38); }
  .feuille { width: min(680px, calc(100% - 64px)); max-height: 86vh; gap: 16px; padding: 32px 34px 28px; border-radius: 26px; }
  .feuille .papier p { font-size: 19px; }

  /* l'entrée : le cercle s'ouvre depuis la bille, la photo recule, les couleurs passent ; puis la cascade du texte
     (#appli : ces règles passent devant la cascade générale de « L'examen ») */
  #appli .ecran .cadre-photo, #appli .ecran .rond-ciel { animation: h-ouvre 1.25s cubic-bezier(.16, 1, .3, 1) both; }
  #appli .ecran .cadre-photo > .photo-scene { animation: h-recule 1.8s cubic-bezier(.16, 1, .3, 1) both; }
  #appli .ecran .fond-d { animation: h-teinte 2.2s cubic-bezier(.45, 0, .25, 1) both; }
  #appli .ecran .visuel > .lecteur { animation: eclot .9s cubic-bezier(.34, 1.56, .64, 1) .5s backwards; }
  #appli .ecran .visuel > .h-centre, #appli .ecran .visuel > .doc-mini, #appli .ecran .scene > .lecture-tete, #appli .ecran .visuel > .scene-emoji, #appli .ecran .h-affiche > .image-support { animation: monte .7s cubic-bezier(.2, .8, .2, 1) .5s backwards; }
  #appli .ecran .visuel > .lettre-env { animation: none; }
  #appli .ecran .scene > .ex-embleme { animation: eclot 1s cubic-bezier(.34, 1.56, .64, 1) .45s backwards; }
  #appli .ecran .h-contraire .h-fleche-1 { animation: h-glisse-d .9s cubic-bezier(.16, 1, .3, 1) .55s backwards; }
  #appli .ecran .h-contraire .h-fleche-2 { animation: h-glisse-g .9s cubic-bezier(.16, 1, .3, 1) .55s backwards; }
  #appli .ecran .h-interro { animation: eclot .9s cubic-bezier(.34, 1.56, .64, 1) .55s backwards; }
  @keyframes h-glisse-d { from { opacity: 0; transform: translateX(-26px); } }
  @keyframes h-glisse-g { from { opacity: 0; transform: translateX(26px); } }
  @keyframes h-ouvre { from { clip-path: circle(0% at 85.4% 14.6%); } to { clip-path: circle(100% at 85.4% 14.6%); } }
  @keyframes h-recule { from { transform: scale(1.22); } }
  @keyframes h-teinte { from { opacity: 0; } }
  /* la sortie : l'écran précédent, déplacé sous le nouveau (#sorties), ne rejoue aucune entrée ; il se retire */
  #sorties .ecran, #sorties .ecran * { animation: none; }
  #sorties .env-dos, #sorties .env-poche, #sorties .env-rabat { display: none; }
  #sorties .ecran .cadre-photo, #sorties .ecran .rond-ciel { animation: h-ferme .7s cubic-bezier(.2, .8, .2, 1) forwards; }
  #sorties .ecran .fond-d { animation: h-efface 2.2s cubic-bezier(.45, 0, .25, 1) forwards; }
  #sorties .ecran .visuel > :not(.cadre-photo):not(.rond-ciel), #sorties .ecran .scene > .lecture-tete, #sorties .ecran .scene > .ex-embleme, #sorties .ecran .scene > .h-interro { animation: h-efface .3s ease forwards; }
  #sorties .ecran .feuille-q, #sorties .ecran .bas, #sorties .ecran .haut { animation: h-sort .42s cubic-bezier(.2, .8, .2, 1) forwards; }
  @keyframes h-ferme { from { clip-path: circle(100% at 85.4% 14.6%); } to { clip-path: circle(0% at 85.4% 14.6%); } }
  @keyframes h-efface { to { opacity: 0; } }
  @keyframes h-sort { to { opacity: 0; transform: translateY(-28px); } }
  /* le même écran redessiné (langue, reprise) : rien ne se rejoue */
  .relance .cadre-photo, .relance .rond-ciel, .relance .cadre-photo > .photo-scene, .relance .fond-d, .relance .lettre-env > * { animation: none !important; }
  .relance .env-dos, .relance .env-poche, .relance .env-rabat { display: none; }
}
/* écran d'ordinateur peu haut (portable 1280 × 720, 1366 × 768) : tout se resserre un peu */
@media (min-width: 1000px) and (min-height: 600px) and (max-height: 820px) {
  .ecran { --rond: min(32vw, 58vh); --b: 132px; grid-template-rows: minmax(76px, 1fr) auto auto minmax(28px, 1fr); }
  .visuel > .lecteur.h-seul { --b: 156px; }
  .feuille-q { gap: 22px; max-height: calc(100vh - 190px); }
  .bas { padding-top: 22px; }
  .question { font-size: min(3.8vw, 7vh); }
  .question.longue { font-size: min(3vw, 5.6vh); }
  .ex-titre { font-size: min(5.7vw, 9.7vh); }
  .bonbons .rep, .ligne-audio .rep { min-height: 62px; padding-block: 10px; font-size: 19px; }
  .marque { width: 38px; height: 38px; }
  .ex-liste li { font-size: 17px; }
  .ex-liste .ic { width: 42px; height: 42px; }
  .rep-image img { aspect-ratio: 16 / 9; }
  .h-centre > .phrase { padding: 18px 22px; }
  .h-papier { padding: 26px 32px 28px 30px; }
  .h-papier-corps { max-height: calc(100vh - 230px); }
  .h-papier-corps p, .h-papier .papier p { font-size: 17px; line-height: 1.55; }
}
"""

HUBLOT_JS = r"""// ------------------------------------------------------------------------------ « Le Hublot » (écran d'ordinateur)
// Sur un écran d'au moins 1000 × 600 px, chaque écran est réorganisé une fois posé : un fond aux couleurs de la photo
// (sa miniature floutée), un cercle de ciel quand il n'y a pas de photo, le contexte au-dessus de la question,
// la phrase à compléter au centre du cercle, le message dans une enveloppe. L'écran précédent reste dessous le temps de
// la transition (sans identifiants, inerte). Sur téléphone, rien de tout cela : « L'examen » tel quel.
const BUREAU = matchMedia("(min-width: 1000px) and (min-height: 600px)");
const MINI = __MINI__;
const NOM_IMAGE = Object.fromEntries(Object.entries(IMAGES).map(([k, v]) => [v, k]));
const SORTIES = document.body.insertBefore(Object.assign(document.createElement("div"), { id: "sorties" }), appli);
SORTIES.setAttribute("aria-hidden", "true");
let cleAffichee = "";
const ICONE_CONTRAIRE = '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><g class="h-fleche-1"><path d="M20 44h74"/><path d="M78 27l17 17-17 17"/></g><g class="h-fleche-2"><path d="M100 78H26"/><path d="M42 61L25 78l17 17"/></g></svg>';
const ICONE_INTERRO = '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M39 42a21 21 0 1 1 30.5 18.7C64.2 63.4 60 67.5 60 74v4"/><circle cx="60" cy="97" r="6.5" fill="currentColor" stroke="none"/></svg>';
const cleEcran = () => etat.ecran === "question" ? "q|" + etat.palier[etat.k] + "|" + Object.keys(etat.lus || {}).length : etat.ecran;
function hublot(ecran, relance) {
  if (!ecran || !BUREAU.matches) return;
  if (relance) ecran.classList.add("relance");
  const scene = ecran.querySelector(".scene"); if (!scene) return;
  const visuel = scene.querySelector(".visuel");
  const src = scene.querySelector(".cadre-photo img, .image-support img")?.getAttribute("src"), mini = src && MINI[NOM_IMAGE[src]];
  scene.insertAdjacentHTML("afterbegin", `<div class="fond-d" aria-hidden="true">${mini ? `<div class="brume"><img src="${mini}" alt=""></div>` : '<div class="ciel-fin"></div>'}</div>`);
  if (visuel && visuel.querySelector(".image-support")) visuel.classList.add("h-affiche");
  else if (!scene.querySelector(".cadre-photo")) {
    if (visuel) visuel.insertAdjacentHTML("afterbegin", '<span class="rond-ciel" aria-hidden="true"></span>');
    else scene.querySelector(".fond-d").insertAdjacentHTML("afterend", '<span class="rond-ciel" aria-hidden="true"></span>');
  }
  // sans photo, pour les contraires : deux flèches opposées, en blanc, au centre de la bulle
  if (etat.ecran === "question" && !scene.querySelector(".cadre-photo") && /contraire/i.test(qActuelle().question))
    (visuel || scene).insertAdjacentHTML("beforeend", `<span class="h-signe h-contraire" aria-hidden="true">${ICONE_CONTRAIRE}</span>`);
  // sans photo, pour les ciseaux (A1-32) : un point d'interrogation blanc au centre de la bulle
  if (etat.ecran === "question" && !scene.querySelector(".cadre-photo") && /ciseaux/i.test(qActuelle().question))
    (visuel || scene).insertAdjacentHTML("beforeend", `<span class="h-signe h-interro" aria-hidden="true">${ICONE_INTERRO}</span>`);
  if (!visuel) return;
  // ce qui pose la situation (contexte, situation, étiquette du message) passe dans la colonne de texte, au-dessus de la question
  const feuille = ecran.querySelector(".feuille-q"), amorces = [...visuel.querySelectorAll(":scope > .contexte, :scope > .situation, :scope > .etiquette, :scope > .sms > .etiquette")];
  if (feuille && amorces.length) { amorces.forEach(a => a.classList.add("amorce")); feuille.prepend(...amorces); }
  // la phrase à compléter (et son indication) au centre du cercle
  const phrase = visuel.querySelector(":scope > .phrase");
  if (phrase) { const c = document.createElement("div"); c.className = "h-centre"; phrase.before(c); c.append(phrase); const ind = visuel.querySelector(":scope > .indice"); if (ind) c.append(ind); if (!scene.querySelector("img")) scene.classList.add("h-turquoise"); }
  // un message (SMS, petit texte, document) : une feuille blanche qui sort d'une enveloppe, en face de la question
  const sms = visuel.querySelector(":scope > .sms"), court = visuel.querySelector(":scope > .papier-court"), doc = visuel.querySelector(":scope > .doc-mini");
  let message = null;
  if (sms) { message = feuilleMessage([...sms.children].filter(x => !x.classList.contains("etiquette"))); sms.replaceWith(message); }
  else if (court) { message = feuilleMessage([...court.children]); court.replaceWith(message); }
  else if (doc && etat.ecran === "question") { message = feuilleMessage(papier(qActuelle()).replace(/<small>[\s\S]*?<\/small>/, "")); doc.replaceWith(message); }
  if (message) visuel.classList.add("h-message");
  const lecteur = visuel.querySelector(":scope > .lecteur");
  if (lecteur && !visuel.querySelector(".cadre-photo, .h-centre, .lettre-env, .doc-mini")) { lecteur.classList.add("h-seul"); if (!scene.querySelector("img")) scene.classList.add("h-turquoise"); }
  const q = ecran.querySelector(".question"); if (q && q.textContent.trim().length > 62) q.classList.add("longue");
}
// la feuille d'un message : enveloppe, papier, mise en forme (formule d'appel, signature), aucun mot coupé
function feuilleMessage(contenu) {
  const env = document.createElement("div"); env.className = "lettre-env";
  env.innerHTML = '<span class="env-dos" aria-hidden="true"></span><div class="h-feuille"><div class="h-papier"><div class="h-papier-corps"></div></div></div><span class="env-poche" aria-hidden="true"></span><span class="env-rabat" aria-hidden="true"></span>';
  const corps = env.querySelector(".h-papier-corps");
  if (typeof contenu === "string") corps.innerHTML = contenu; else corps.append(...contenu);
  const ps = [...corps.querySelectorAll("p")], txt = (p) => p.textContent.trim();
  if (ps.length >= 3) {
    if (txt(ps[0]).length <= 40 && /,$/.test(txt(ps[0]))) ps[0].classList.add("h-salut");
    const fin = ps[ps.length - 1]; if (txt(fin).length <= 45 && !/[.?!:;]$/.test(txt(fin))) fin.classList.add("h-signature");
  }
  insecables(env);
  return env;
}
// sur ordinateur, un document se lit en face de sa question : plus d'écran de lecture séparé
const ecranLectureTelephone = ecranLecture;
ecranLecture = function (q) { if (!BUREAU.matches) return ecranLectureTelephone(q); etat.lus[q.id] = true; return afficher(); };
// la colonne de texte ne défile que si son contenu dépasse vraiment (vérifié une fois les apparitions finies)
function verifierDefilement() { const f = appli.querySelector(".ecran .feuille-q"); if (f) f.classList.toggle("deborde", f.scrollHeight > f.clientHeight + 2); }
addEventListener("resize", verifierDefilement);
BUREAU.addEventListener("change", () => afficher());      // passage téléphone ↔ ordinateur : l'écran se redessine
// au clavier : A, B, C, D (ou 1 à 4) choisissent une réponse, Entrée valide
document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat || appli.querySelector(".voile")) return;
  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  const ecran = appli.querySelector(".ecran"); if (!ecran) return;
  const k = e.key.toLowerCase(), i = k.length === 1 ? ("abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k)) : -1;
  if (i >= 0) { const r = ecran.querySelectorAll(".reponses .rep")[i]; if (r) { r.click(); r.focus({ preventScroll: true }); e.preventDefault(); } return; }
  // Entrée valide, y compris quand une réponse a le focus (sur les autres boutons, Entrée garde son rôle)
  if (e.key === "Enter" && (!e.target.closest("button") || e.target.closest(".reponses"))) { const b = ecran.querySelector("#valider:not(:disabled), #lu, #commencer, #refaire"); if (b) { e.preventDefault(); b.click(); } }
});
"""

POSER_HUBLOT = r"""function poser(html) {
  const cle = cleEcran(), relance = cle === cleAffichee; cleAffichee = cle;
  appli.querySelectorAll(".ecran").forEach(e => {
    if (!BUREAU.matches || relance) return e.remove();
    e.querySelectorAll("[id]").forEach(x => x.removeAttribute("id")); e.removeAttribute("aria-labelledby");
    e.querySelectorAll(".brume").forEach(x => { x.style.transform = getComputedStyle(x).transform; });      // le fond garde sa position : pas de saut
    e.inert = true; e.classList.add("sort"); SORTIES.appendChild(e); setTimeout(() => e.remove(), 2300);
  });
  appli.insertAdjacentHTML("beforeend", html); traduireInterface(appli.lastElementChild); insecables(appli.lastElementChild); hublot(appli.lastElementChild, relance);
  if (BUREAU.matches) setTimeout(verifierDefilement, 1400);
}"""

_MINIATURES = {}
def miniatures(noms):
    # la miniature de chaque photo (24 px de large) : agrandie et floutée par le navigateur, elle donne le fond coloré
    import subprocess
    res = {}
    for n in noms:
        f = os.path.join(V2, 'banque', 'img', n + '.webp')
        if not os.path.exists(f): continue
        if n not in _MINIATURES:
            png = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-vf', 'scale=24:-2:flags=area', '-f', 'image2pipe', '-vcodec', 'png', '-'],
                                 capture_output=True, check=True).stdout
            _MINIATURES[n] = 'data:image/png;base64,' + base64.b64encode(png).decode()
        res[n] = _MINIATURES[n]
    return res


def transformer(s, artifact, style='feuille'):
    # en-tête du document : police, titre, couleur du navigateur
    police = {'feuille': 'family=Manrope:wght@500;600;700;800', 'degrade': 'family=Plus+Jakarta+Sans:wght@500;600;700;800', 'examen': 'family=Public+Sans:wght@400;500;600;700;800', 'hublot': 'family=Public+Sans:wght@400;500;600;700;800;900'}[style]
    s = remplacer(s, 'family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800;900', police)
    if artifact:
        s = remplacer(s, '<title>Positionnement FLE v2</title>', '<title>Positionnement FLE v3</title>' if style == 'feuille' else '<title>Positionnement FLE dégradé</title>' if style == 'degrade' else '<title>Positionnement FLE Hublot</title>' if style == 'hublot' else '<title>Positionnement FLE examen</title>')
    else:
        s = remplacer(s, '<meta name="theme-color" content="#9748fe">', '<meta name="theme-color" content="%s">' % {'feuille': '#cbc2fb', 'degrade': '#8c7af6', 'examen': '#58aef7', 'hublot': '#58aef7'}[style])
        s = remplacer(s, '<title>Test de niveau de français</title>', '<title>Test de positionnement en français</title>')
        s = s.replace('content="Test de niveau de français"', 'content="Test de positionnement en français"')
        # les sons sont ceux de la v2
        a = s.index('const AUDIO = {'); b = s.index('};', a)
        s = s[:a] + s[a:b].replace('"sons/', '"../positionnement-fle-2/sons/' if style == 'feuille' else '"../../positionnement-fle-2/sons/') + s[b:]
        # les images aussi sont celles de la v2, en fichiers
        a = s.index('const IMAGES = {'); b = s.index('};', a)
        s = s[:a] + s[a:b].replace('"banque/img/', '"../positionnement-fle-2/banque/img/' if style == 'feuille' else '"../../positionnement-fle-2/banque/img/') + s[b:]
    # la feuille de style : entièrement nouvelle, sauf les panneaux du formateur, repris tels quels
    a = s.index('<style>') + len('<style>'); b = s.index('</style>', a)
    panneaux = bloc_css(s[a:b], '.coin { display: none; }')
    s = s[:a] + (CSS_EXAMEN + CSS_HUBLOT if style == 'hublot' else CSS_EXAMEN if style == 'examen' else CSS + (CSS_DEGRADE if style == 'degrade' else '')) + '\n/* panneaux « Barème » et « Moteur » (ordinateur), repris de la v2 */\n' + panneaux + '\n' + s[b:]
    # icônes, marque des réponses (un rond), réponses toujours en liste (plus d'alvéoles)
    s = remplacer(s, 'const ICONE = {\n', 'const ICONE = {\n' + ICONES_EN_PLUS)
    s = re.sub(r'const MARQUE = `[^`]*`;', 'const MARQUE = `<span class="marque" aria-hidden="true"></span>`;', s, count=1)
    s = remplacer(s, 'const alveoles = q.choix.every(x => x.length <= 10);', 'const alveoles = false;')
    # clavier de lettres : des touches simples, en grille
    s = remplacer(s, '''tuile(echap(q.lettres[k]), "blanc", "lettre", `type="button" data-l="${k}" aria-label="${echap(q.lettres[k])}" style="--n:${n}"`, "button")''',
                  '''`<button class="lettre" type="button" data-l="${k}" aria-label="${echap(q.lettres[k])}">${echap(q.lettres[k])}</button>`''')
    s = remplacer(s, '''tuile(ICONE.effacer, "rose", "effacer", `type="button" aria-label="Effacer la dernière lettre" style="--n:${ol.length}"`, "button")''',
                  '''`<button class="effacer" type="button" aria-label="Effacer la dernière lettre">${ICONE.effacer}</button>`''')
    s = fonction(s, 'placerLettres', 'function placerLettres() {}      // v3 : le clavier est une grille CSS')
    s = fonction(s, 'ajusterImages', AJUSTER)
    # l'écran d'une question : la scène (photo, lecteur, document…) au-dessus, la feuille blanche avec la question
    s = remplacer(s, '''    <div class="defile">
      ${q.t === "aucun" ? "" : `<div class="visuel${q.t === "ecoute" && q.photo ? " photo-fond" : ""}">${visuel(q)}</div>`}
      <h2 class="question" id="question">${echap(q.question)}${q.niveau === "A1" && audible("q:" + q.question) ? ` <button class="lire-consigne" type="button" id="lire-consigne" aria-label="Entendre la question">${ICONE.son}</button>` : ""}</h2>
      ${reponses}
    </div>''', '''    <div class="defile">${(() => {
      const media = ["ecoute", "image", "situation", "document"].includes(q.t), avant = q.t === "trou" || q.t === "ordre";
      const titre = `<h2 class="question${avant ? " consigne" : ""}" id="question">${echap(q.question)}${q.niveau === "A1" && audible("q:" + q.question) ? ` <button class="lire-consigne" type="button" id="lire-consigne" aria-label="Entendre la question">${ICONE.son}</button>` : ""}</h2>`;
      const vis = q.t === "aucun" ? "" : `<div class="visuel ${media ? "visuel-scene" : "visuel-feuille"}${q.t === "ecoute" && q.photo ? " photo-fond" : ""}">${visuel(q)}</div>`;
      const rub = `<span class="rubrique">${({ CO: ICONE.ecoute, CE: ICONE.livre, EE: ICONE.crayon, EO: ICONE.micro, LG: ICONE.langue })[q.comp] || ""}${NOMS_COMP[q.comp]}</span>`;
      return media ? `<div class="scene">${rub}${vis}</div><div class="feuille-q">${titre}${reponses}</div>`
                   : `<div class="scene vide">${rub}</div><div class="feuille-q">${avant ? titre + vis : vis + titre}${reponses}</div>`;
    })()}</div>''')
    # en-tête, accueil, lecture, fin ; plus d'écran de passage de niveau
    ex = style in ('examen', 'hublot')
    s = fonction(s, 'haut', HAUT_EXAMEN if ex else HAUT)
    s = fonction(s, 'ecranAccueil', ACCUEIL_EXAMEN if ex else ACCUEIL)
    s = fonction(s, 'ecranLecture', LECTURE_EXAMEN if ex else LECTURE)
    s = fonction(s, 'ecranResultat', RESULTAT_EXAMEN if ex else RESULTAT)
    s = s.replace('$("#fermer").addEventListener("click", demanderQuitter);', '$("#fermer")?.addEventListener("click", demanderQuitter);')
    intro = os.path.join(V2, 'banque', 'img', 'intro.webp')
    if ex and os.path.exists(intro):
        val = 'data:image/webp;base64,' + base64.b64encode(open(intro, 'rb').read()).decode() if artifact else '../../positionnement-fle-2/banque/img/intro.webp'
        s = remplacer(s, 'const IMAGES = {\n', 'const IMAGES = {\n  "intro": "%s",\n' % val)
    # aucun mot à trait d'union coupé en fin de ligne
    s = remplacer(s, 'function poser(html) { appli.querySelectorAll(".ecran").forEach(e => e.remove()); appli.insertAdjacentHTML("beforeend", html); }',
                  'function poser(html) { appli.querySelectorAll(".ecran").forEach(e => e.remove()); appli.insertAdjacentHTML("beforeend", html); insecables(appli.lastElementChild); }\n' + INSECABLES)
    if ex:
        s = remplacer(s, 'function poser(html) {', CADRES_JS.replace('__CADRES__', json.dumps(CADRES, ensure_ascii=False)) + '\nfunction poser(html) {')
        drapeaux, trad, voix = donnees_langue(artifact)
        js = LANGUE_JS.replace('__LANGUES__', json.dumps(LANGUES, ensure_ascii=False)).replace('__DRAPEAUX__', json.dumps(drapeaux)).replace('__TRAD__', json.dumps(trad, ensure_ascii=False))
        s = remplacer(s, 'function poser(html) {', js + '\nfunction poser(html) {')
        s = remplacer(s, 'insecables(appli.lastElementChild); }', 'traduireInterface(appli.lastElementChild); insecables(appli.lastElementChild); }')
        if style == 'hublot':
            # la couche « ordinateur » : miniatures des photos, réorganisation de chaque écran, transitions, clavier
            a = s.index('const IMAGES = {'); b = s.index('};', a)
            mini = miniatures(re.findall(r'^\s*"([^"]+)":', s[a:b], re.M))
            s = remplacer(s, 'function poser(html) {', HUBLOT_JS.replace('__MINI__', json.dumps(mini)) + '\nfunction poser(html) {')
            s = remplacer(s, 'function poser(html) { appli.querySelectorAll(".ecran").forEach(e => e.remove()); appli.insertAdjacentHTML("beforeend", html); traduireInterface(appli.lastElementChild); insecables(appli.lastElementChild); }', POSER_HUBLOT)
        s = remplacer(s, '  appli.appendChild(voile);\n', '  appli.appendChild(voile); traduireInterface(voile);\n')
        if voix:
            s = remplacer(s, 'const AUDIO = {', 'const AUDIO = {\n' + ''.join(f'  {json.dumps(k, ensure_ascii=False)}: "{v}",\n' for k, v in voix.items()))
        # la question dans la langue choisie ; le haut-parleur la lit dans cette langue (A1), ou disparaît s'il n'y a pas de voix
        s = remplacer(s, '''const titre = `<h2 class="question${avant ? " consigne" : ""}" id="question">${echap(q.question)}${q.niveau === "A1" && audible("q:" + q.question) ?''',
                      '''const cleQ = traduit(q.question) ? "q:" + LANGUE + ":" + q.question : "q:" + q.question, lisible = q.niveau === "A1" && (traduit(q.question) ? !!AUDIO[cleQ] : audible(cleQ));
      const titre = `<h2 class="question${avant ? " consigne" : ""}" id="question"${attrsLangue(q.question)}>${echap(t(q.question))}${lisible ?''')
        s = remplacer(s, 'lireConsigne.addEventListener("click", () => jouer("q:" + q.question, [q.question], lireConsigne,',
                      'lireConsigne.addEventListener("click", () => jouer(traduit(q.question) ? "q:" + LANGUE + ":" + q.question : "q:" + q.question, [q.question], lireConsigne,')
        s = remplacer(s, 'bouton("Suivant", "vert", `id="valider"', 'bouton("Valider", "vert", `id="valider"')
        # tout support (y compris le message ou la phrase à compléter) va dans le dégradé ; question et réponses dans le blanc
        s = remplacer(s, """      return media ? `<div class="scene">${rub}${vis}</div><div class="feuille-q">${titre}${reponses}</div>`
                   : `<div class="scene vide">${rub}</div><div class="feuille-q">${avant ? titre + vis : vis + titre}${reponses}</div>`;""",
                      """      const enFond = q.photo && q.t !== "ecoute" && q.t !== "situation" ? photoFond(q.photo) : "";
      const qt = { ...q, contexte: t(q.contexte), etiquette: t(q.etiquette), indice: t(q.indice), texte: q.t === "situation" ? t(q.texte) : q.texte };
      const support = (q.t === "aucun" ? "" : visuel(q.t === "document" ? { ...qt, photo: null } : qt).replace(/<img class="photo-scene" src="[^"]*" alt="">/, () => photoFond(q.photo)))
        .replace('<p class="contexte">', `<p class="contexte"${attrsLangue(q.contexte)}>`).replace('<span class="etiquette">', `<span class="etiquette"${attrsLangue(q.etiquette)}>`)
        .replace('<p class="situation">', `<p class="situation"${attrsLangue(q.texte)}>`).replace('<span class="indice">', `<span class="indice"${attrsLangue(q.indice)}>`);
      const visEx = q.t === "aucun" && !q.photo ? "" : `<div class="visuel${q.photo ? " photo-fond" : ""}">${enFond}${support}</div>`;
      return `<div class="scene${q.t === "aucun" && !q.photo ? " vide" : ""}">${visEx}</div><div class="feuille-q">${titre.replace(" consigne", "").replace(/ ([?!:;])/g, "\u00a0$1")}${reponses}</div>`;""")
    # le lecteur dit ce qu'il fait (affiché seulement dans « L'examen »)
    s = remplacer(s, '${ICONE.jouer}<span class="vague" id="vague"', '${ICONE.jouer}<span class="lecteur-texte" aria-hidden="true"><b>Écouter l\'enregistrement</b><small id="reste">${reste === 2 ? "2 écoutes possibles" : reste === 1 ? "1 écoute possible" : "Plus d\'écoute possible"}</small></span><span class="vague" id="vague"')
    s = remplacer(s, '    lecteur.disabled = true;\n', '    lecteur.disabled = true; { const r = $("#reste"); if (r) r.textContent = "Écoute en cours…"; }\n')
    s = remplacer(s, 'lecteur.setAttribute("aria-label", 2 - n > 0 ? "Réécouter l\'enregistrement (1 écoute possible)" : "Plus d\'écoute possible");',
                  'lecteur.setAttribute("aria-label", 2 - n > 0 ? "Réécouter l\'enregistrement (1 écoute possible)" : "Plus d\'écoute possible"); { const r = $("#reste"); if (r) r.textContent = 2 - n > 0 ? "1 écoute possible" : "Plus d\'écoute possible"; }')
    s = remplacer(s, '      etat.ecran = "palier"; return afficher();', '      etat.ecran = "question"; return afficher();      // v3 : on enchaîne, sans écran de niveau')
    return s


for style, dossier in (('feuille', ICI), ('degrade', os.path.join(ICI, 'degrade')), ('examen', os.path.join(ICI, 'examen')), ('hublot', os.path.join(ICI, 'hublot'))):
    os.makedirs(dossier, exist_ok=True)
    for nom, artifact in (('index.html', False), ('test-positionnement.html', True)):
        s = open(os.path.join(V2, nom), encoding='utf-8').read()
        s = transformer(s, artifact, style)
        open(os.path.join(dossier, nom), 'w', encoding='utf-8').write(s)
        print(style, nom, len(s) // 1024, 'Ko')
