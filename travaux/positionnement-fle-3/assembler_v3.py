"""Version 3 du test de positionnement : le style « La feuille » (fond pastel clair, grande feuille blanche qui porte
la question), plus officiel, et aucun niveau montré à l'apprenant (ni pastille, ni écran de passage de niveau,
ni niveau à la fin). Même banque, mêmes sons, même moteur adaptatif et mêmes panneaux « Barème » et « Moteur »
que la version 2 : le script part des deux fichiers produits par la v2 et les transforme.

    python3 travaux/positionnement-fle-3/assembler_v3.py

Produit index.html (page web ; les sons sont lus dans ../positionnement-fle-2/sons/) et test-positionnement.html
(artifact, tout intégré), pour « La feuille » (ce dossier) et pour la variante « Le dégradé » (dossier degrade/)."""
import os, re

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
/* Variante « L'examen », en violet, avec les polices de la v2 (Baloo 2 pour les titres, Nunito pour le texte).
   Bandeau blanc avec un filet dégradé violet, fond très clair, nom de la compétence au-dessus de chaque question,
   réponses A, B, C dans des cartes blanches, barre du bas blanche (« Je ne sais pas » / « Valider »).
   Marges de 20 px partout ; le contenu se centre dans la hauteur pour ne pas laisser un grand vide. */
:root {
  --violet: #7442e8; --violet-fonce: #5d2fd0; --violet-pale: #f2edff; --fond: #f5f3fa; --encre: #241b45; --doux: #6b6585; --filet: #e4dff1;
  --titre: "Baloo 2", "Arial Rounded MT Bold", system-ui, sans-serif;
  --texte: "Nunito", "Segoe UI", system-ui, sans-serif;
  --fond-1: #7442e8;
  --cyan-1: #78fdf8; --cyan-2: #42d8ff; --vert-1: #cdfc2a; --vert-2: #8fe60c; --rose-1: #ffadf6; --rose-2: #ea62de;
  color-scheme: light;
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
html, body { height: 100%; }
body { margin: 0; color: var(--encre); font: 700 16px/1.5 var(--texte); overflow: hidden; background: #e8e8ec;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px; display: grid; place-items: center; }
button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
button:focus-visible { outline: 3px solid var(--violet); outline-offset: 2px; border-radius: 12px; }
svg { display: block; }

/* le téléphone */
.appli { position: relative; z-index: 1; width: min(400px, 100%); height: min(860px, 100%); display: flex; flex-direction: column; overflow: hidden;
  border: 10px solid #15161c; border-radius: 50px; background: var(--fond); }
.ecran { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; animation: entre .25s ease-out both; }
@keyframes entre { from { opacity: 0; } }
.defile { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; padding: 22px 20px 20px; scrollbar-width: none; }
.defile::-webkit-scrollbar { display: none; }
.defile > * { flex-shrink: 0; }
.defile > :first-child { margin-top: auto; }
.defile > :last-child { margin-bottom: auto; }
.defile.a-suivre { -webkit-mask-image: linear-gradient(#000 calc(100% - 48px), transparent); mask-image: linear-gradient(#000 calc(100% - 48px), transparent); }

/* le bandeau : quitter, « Évaluation », le numéro de la question (jamais le niveau), le son */
.haut { flex: none; position: relative; z-index: 2; display: grid; grid-template-columns: 38px 1fr auto 38px; align-items: center; gap: 10px; padding: 14px 16px 12px; background: #fff; }
.haut::after { content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 3px; background: linear-gradient(90deg, #9748fe, #7b6cf6 55%, #b394ff); }
.haut-accueil { grid-template-columns: 1fr 38px; }
.rond { display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 0; border-radius: 11px; background: #f3f0fa; color: var(--encre); }
.rond svg { width: 17px; height: 17px; }
.titre-test { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--doux); }
.numero { font: 800 17px/1 var(--titre); font-variant-numeric: tabular-nums; }
.haut .barre { display: none; }

/* le contenu : la compétence, le support, la question, les réponses */
.scene, .feuille-q { display: grid; gap: 14px; }
.scene { padding-bottom: 16px; }
.rubrique { justify-self: start; display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 9px; background: var(--violet-pale); color: var(--violet); font-size: 13.5px; font-weight: 800; }
.rubrique svg { width: 16px; height: 16px; }
.visuel { display: grid; gap: 12px; }
.visuel-feuille { padding: 18px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; }
.contexte { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.45; color: #4a4366; }
.etiquette { font-size: 13px; font-weight: 800; color: var(--doux); }
.lecteur { position: relative; display: grid; grid-template-columns: 56px 1fr; align-items: center; gap: 14px; width: 100%; padding: 12px 14px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; text-align: left; }
.lecteur > svg { width: 56px; height: 56px; padding: 16px 14px 16px 19px; border-radius: 13px; background: var(--violet); color: #fff; }
.lecteur-texte { display: grid; line-height: 1.3; }
.lecteur-texte b { font-size: 17px; font-weight: 800; }
.lecteur-texte small { font-size: 14px; font-weight: 700; color: var(--doux); }
.lecteur .pastille { display: none; }
.lecteur .vague { display: none; width: 56px; height: 56px; align-items: center; justify-content: center; gap: 4px; border-radius: 13px; background: var(--violet); }
.lecteur.parle > svg { display: none; }
.lecteur.parle .vague { display: flex; }
.vague i { width: 4px; height: 12px; border-radius: 2px; background: #fff; }
.vague i:nth-child(2n) { height: 22px; } .vague i:nth-child(3n) { height: 16px; }
.vague.active i { animation: barre .7s ease-in-out infinite; }
.vague i:nth-child(2n) { animation-delay: -.2s; } .vague i:nth-child(3n) { animation-delay: -.45s; }
@keyframes barre { 50% { transform: scaleY(.45); } }
.lecteur:disabled { cursor: default; opacity: .55; }
.lecteur.parle:disabled { opacity: 1; border-color: var(--violet); }
.visuel.photo-fond .photo-scene { order: -1; }
.photo-scene { display: block; width: 100%; height: 200px; object-fit: cover; border-radius: 16px; }
.phrase { font-size: 23px; font-weight: 800; line-height: 1.6; text-wrap: balance; }
.phrase.petite { font-size: 19px; }
.ordre-phrase { font-size: 21px; line-height: 1.9; }
.trou { display: inline-block; min-width: 88px; margin: 0 3px; padding: 0 10px; border: 1.5px solid var(--violet); border-radius: 9px; background: var(--violet-pale); color: var(--violet); line-height: 1.45; }
.trou.pop { animation: pop .3s ease-out; }
@keyframes pop { from { transform: scale(.88); } }
.ordre-phrase .trou { min-width: 66px; cursor: pointer; }
.trou.curseur::after { content: ""; display: inline-block; width: 2px; height: 1.05em; margin-left: 2px; vertical-align: -.15em; background: currentColor; animation: clignote 1.1s steps(1) infinite; }
@keyframes clignote { 50% { opacity: 0; } }
.indice { justify-self: start; padding: 3px 11px; border-radius: 999px; background: #f3f0fa; color: var(--doux); font-size: 14px; font-weight: 700; }
.sms { display: grid; justify-items: start; gap: 6px; }
.sms p { margin: 0; padding: 12px 15px; border-radius: 16px 16px 16px 5px; background: var(--fond); font-size: 17px; font-weight: 700; line-height: 1.45; }
.papier-court { display: grid; gap: 4px; }
.papier-court strong { font-size: 16px; }
.papier-court p { margin: 0; font-size: 17px; font-weight: 600; line-height: 1.55; }
.image-support { position: relative; display: block; padding: 6px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; }
.image-support img { display: block; width: 100%; max-height: 230px; object-fit: contain; border-radius: 11px; }
.loupe { position: absolute; right: 12px; bottom: 12px; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--violet); color: #fff; }
.loupe svg { width: 19px; height: 19px; }
.image-grande { width: 100%; border-radius: 12px; }
.visuel-scene .scene-emoji { font-size: 50px; line-height: 1; }
.situation { margin: 0; font-size: 17px; font-weight: 700; line-height: 1.5; }
.doc-mini { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; padding: 14px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; }
.doc-mini .icone-doc { display: grid; place-items: center; width: 54px; height: 60px; border-radius: 13px; background: var(--violet-pale); font-size: 28px; }
.doc-mini .icone-doc.avec-photo { width: 58px; height: 58px; overflow: hidden; border-radius: 50%; }
.avec-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.doc-mini strong { font-size: 17px; }
.pilule { display: inline-flex; align-items: center; gap: 6px; padding: 8px 13px; border: 0; border-radius: 10px; background: var(--violet-pale); color: var(--violet); font-size: 14.5px; font-weight: 800; }
.pilule svg { width: 16px; height: 16px; }
.question { margin: 0; font: 800 24px/1.25 var(--titre); text-wrap: balance; }
.question.consigne { font-size: 22px; }
.lire-consigne { display: inline-grid; place-items: center; width: 32px; height: 32px; margin-left: 4px; padding: 0; border: 0; border-radius: 9px; background: var(--violet-pale); color: var(--violet); vertical-align: -5px; }
.lire-consigne svg { width: 16px; height: 16px; }
.lire-consigne.parle { background: var(--violet); color: #fff; }

/* les réponses A, B, C */
.reponses { display: grid; gap: 10px; counter-reset: rep; }
.rep { counter-increment: rep; }
.bonbons .rep, .ligne-audio .rep { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 60px; padding: 12px 14px; border: 1.5px solid var(--filet); border-radius: 15px; background: #fff; color: var(--encre); font-size: 17.5px; font-weight: 700; line-height: 1.3; text-align: left; transition: border-color .12s, background .12s; }
.marque { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: #f3f0fa; color: var(--doux); font-size: 15px; font-weight: 900; }
.marque::before { content: counter(rep, upper-alpha); }
.reponses .rep[aria-checked="true"] { border-color: var(--violet); background: #f8f4ff; box-shadow: inset 0 0 0 1px var(--violet); }
.reponses .rep[aria-checked="true"] .marque { background: var(--violet); color: #fff; }
.ligne-audio { display: flex; align-items: center; gap: 10px; }
.ecouter-rep { flex: none; display: grid; place-items: center; width: 50px; height: 50px; padding: 0; border: 0; border-radius: 13px; background: var(--violet); color: #fff; }
.ecouter-rep svg { width: 19px; height: 19px; margin-left: 2px; }
.ecouter-rep.parle { background: var(--violet-fonce); }
.reponses.images { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.reponses.images[data-cols="2"] .rep-image:first-child:nth-last-child(odd) { margin-inline: calc((100% - var(--wi)) / 2); }
.rep-image { width: var(--wi, calc((100% - 20px) / 3)); padding: 5px; border: 1.5px solid var(--filet); border-radius: 15px; background: #fff; }
.rep-image img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 10px; }
.rep-image[aria-checked="true"] { border-color: var(--violet); background: #f8f4ff; box-shadow: inset 0 0 0 1px var(--violet); }
.mots-a-placer { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
.mot-dispo { padding: 12px 18px; border: 1.5px solid var(--filet); border-radius: 12px; background: #fff; color: var(--encre); font-size: 18px; font-weight: 800; transition: opacity .15s; }
.mot-dispo:disabled { opacity: .3; cursor: default; }
.saisies { display: grid; gap: 12px; }
.champ { display: grid; gap: 6px; font-size: 13px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--doux); }
.champ input { width: 100%; min-height: 58px; padding: 12px 16px; border: 1.5px solid var(--filet); border-radius: 14px; background: #fff; color: var(--encre); font: 800 20px/1.2 var(--texte); outline: none; }
.champ input:focus { border-color: var(--violet); box-shadow: inset 0 0 0 1px var(--violet); }
.reponses.ecrire { display: grid; gap: 16px; }
.mot-ecrit { justify-self: center; }
.mot-ecrit .trou { min-width: 180px; margin: 0; font-size: 26px; font-weight: 800; text-align: center; }
.lettres { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }
.lettre, .effacer { display: grid; place-items: center; height: 50px; padding: 0; border: 1.5px solid var(--filet); border-radius: 11px; background: #fff; color: var(--encre); font-size: 20px; font-weight: 900; text-transform: uppercase; transition: opacity .15s; }
.lettre:disabled { opacity: .28; cursor: default; }
.effacer { grid-column: span 2; color: var(--doux); }
.effacer:disabled { opacity: .45; cursor: default; }
.effacer svg { width: 22px; height: 22px; }

/* la barre du bas */
.bas { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px)); background: #fff; border-top: 1px solid var(--filet); }
.bouton { display: grid; place-items: center; min-height: 52px; padding: 0 32px; border: 0; border-radius: 13px; font: 800 18px/1 var(--titre); }
.bas > .bouton:only-child { flex: 1; }
.bouton.vert { background: var(--violet); color: #fff; }
.bouton.vert:active:not(:disabled) { background: var(--violet-fonce); }
.bouton:disabled { opacity: .38; cursor: default; }
.bouton.blanc { flex: 1; background: #fff; color: var(--violet); box-shadow: inset 0 0 0 2px var(--violet); }
.lien { order: -1; padding: 10px 4px; border: 0; background: none; color: var(--doux); font-size: 15.5px; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }

/* les documents à lire */
.papier { display: grid; gap: 12px; padding: 18px; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; }
.papier-tete { display: flex; align-items: center; gap: 12px; }
.papier-tete span { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 13px; background: var(--violet-pale); font-size: 24px; flex: none; }
.papier-tete .avec-photo { width: 58px; height: 58px; overflow: hidden; border-radius: 50%; }
.papier-tete strong { display: block; font: 800 21px/1.15 var(--titre); }
.papier-tete small { color: var(--doux); font-size: 14px; }
.papier p { margin: 0; font-size: 17.5px; line-height: 1.65; font-weight: 600; }
.consigne-lecture { margin: 14px 0 0; color: var(--doux); font-size: 15px; text-align: center; }
.tableau-defile { overflow-x: auto; }
.edt { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13px; line-height: 1.25; text-align: center; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: anywhere; }
.edt th, .edt td { padding: 7px 3px; border: 1px solid var(--filet); }
.edt tr > :first-child { width: 25%; white-space: nowrap; font-size: 11.5px; }
.edt tr:first-child > * { font-size: 12px; letter-spacing: .03em; }
.edt th { background: var(--violet-pale); font-weight: 900; }
.edt td:empty { background: #fbfaff; }

/* la feuille du bas (quitter, relire, agrandir) */
.voile { position: absolute; inset: 0; z-index: 5; display: flex; align-items: flex-end; background: rgba(36, 27, 69, .4); animation: entre .2s ease-out both; }
.feuille { width: 100%; max-height: 92%; overflow-y: auto; display: grid; gap: 12px; padding: 24px 20px calc(18px + env(safe-area-inset-bottom, 0px)); border-radius: 24px 24px 0 0; background: #fff; }
.feuille h2 { margin: 0; font: 800 23px/1.2 var(--titre); }
.feuille > p { margin: 0; color: var(--doux); }
.feuille .bouton { width: 100%; }

/* l'accueil et la fin */
.ex-tete { display: grid; gap: 8px; padding-bottom: 20px; }
.ex-tete h1, .ex-fin h1 { margin: 0; font: 800 32px/1.08 var(--titre); letter-spacing: -.01em; text-wrap: balance; }
.ex-meta { margin: 0; display: flex; align-items: center; gap: 8px; color: var(--doux); font-size: 15px; }
.ex-meta svg { width: 18px; height: 18px; flex: none; }
.ex-rubriques { margin: 0 0 16px; padding: 0; list-style: none; border: 1.5px solid var(--filet); border-radius: 16px; background: #fff; }
.ex-rubriques li { display: flex; align-items: center; gap: 14px; padding: 14px 16px; }
.ex-rubriques li + li { border-top: 1px solid var(--filet); }
.ex-rubriques svg { width: 24px; height: 24px; flex: none; color: var(--violet); }
.ex-rubriques span { display: grid; line-height: 1.3; }
.ex-rubriques b { font-size: 16.5px; font-weight: 800; }
.ex-rubriques small { font-size: 14px; font-weight: 700; color: var(--doux); }
.ex-encadre { padding: 14px 16px; border-left: 4px solid var(--violet); border-radius: 6px 14px 14px 6px; background: var(--violet-pale); }
.ex-encadre b { font-size: 15.5px; font-weight: 900; }
.ex-encadre p { margin: 4px 0 0; font-size: 15px; line-height: 1.5; color: #4a4366; }
.ex-fin { display: grid; justify-items: start; gap: 12px; }
.ex-fin > p { margin: 0 0 6px; font-size: 16.5px; color: var(--doux); }
.ex-doc { display: grid; place-items: center; width: 68px; height: 68px; border-radius: 18px; background: var(--violet-pale); color: var(--violet); }
.ex-doc svg { width: 34px; height: 34px; }
.ex-fin .ex-encadre { align-self: stretch; }

/* une question qui ne tient pas dans la hauteur de l'écran se resserre, en deux crans */
.serre .defile { padding-top: 16px; padding-bottom: 14px; }
.serre .scene { gap: 11px; padding-bottom: 12px; }
.serre .feuille-q { gap: 11px; }
.serre .photo-scene { height: 150px; }
.serre .image-support img { max-height: 170px; }
.serre .question { font-size: 22px; }
.serre .bonbons .rep, .serre .ligne-audio .rep { min-height: 52px; padding-block: 9px; }
.serre .reponses { gap: 8px; }
.serre .lecteur { padding-block: 9px; } .serre .lecteur > svg, .serre .lecteur .vague { width: 48px; height: 48px; padding: 13px 11px 13px 16px; }
.serre .edt th, .serre .edt td { padding-block: 4px; }
.serre .ex-tete { gap: 6px; padding-bottom: 14px; }
.serre .ex-tete h1, .serre .ex-fin h1 { font-size: 28px; }
.serre .ex-rubriques { margin-bottom: 12px; }
.serre .ex-rubriques li { padding-block: 10px; }
.serre .ex-encadre { padding-block: 11px; }
.tres-serre .ex-rubriques small { display: none; }
.tres-serre .ex-rubriques li { padding-block: 9px; }
.tres-serre .haut { padding-block: 10px 9px; }
.tres-serre .rubrique { padding-block: 4px; }
.tres-serre .photo-scene { height: 116px; }
.tres-serre .image-support img { max-height: 140px; }
.tres-serre .phrase { font-size: 20px; }
.tres-serre .question { font-size: 20px; }
.tres-serre .sms p { font-size: 16px; padding: 10px 13px; }
.tres-serre .bonbons .rep, .tres-serre .ligne-audio .rep { min-height: 46px; font-size: 16.5px; }
.tres-serre .visuel-feuille, .tres-serre .papier { padding: 14px; }
.tres-serre .bouton { min-height: 48px; }

/* sur un appareil tactile ou un écran étroit : le test occupe tout l'écran, comme une application */
@media (max-width: 520px), (hover: none) and (pointer: coarse) {
  html, body { overflow: hidden; overscroll-behavior: none; background: #fff; }
  body { padding: 0; }
  .appli { position: fixed; inset: 0; width: auto; height: auto; border: 0; border-radius: 0; }
  .haut { padding-top: calc(12px + env(safe-area-inset-top, 0px)); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
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
  // le numéro de la question depuis le début du test, sans repartir à zéro : le niveau n'apparaît jamais
  const n = etat.vus.length + etat.k + 1;
  return `<div class="haut">
    <button class="rond" type="button" id="fermer" aria-label="Quitter le test">${ICONE.fermer}</button>
    <span class="titre-test">Évaluation</span>
    <span class="numero">Question ${n}</span>
    ${boutonSon()}
  </div>`;
}
"""

ACCUEIL_EXAMEN = r"""
function ecranAccueil() {
  poser(`<section class="ecran ecran-accueil" aria-labelledby="t-accueil">
    <div class="haut haut-accueil"><span class="titre-test">Français langue étrangère</span>${boutonSon()}</div>
    <div class="defile"><div>
      <div class="ex-tete"><h1 id="t-accueil">Évaluation de positionnement</h1><p class="ex-meta">${ICONE.horloge}Environ 10 minutes · questions adaptées à vos réponses</p></div>
      <ul class="ex-rubriques">
        <li>${ICONE.ecoute}<span><b>Compréhension orale</b><small>Écouter des enregistrements courts</small></span></li>
        <li>${ICONE.livre}<span><b>Compréhension écrite</b><small>Lire des messages et des documents</small></span></li>
        <li>${ICONE.crayon}<span><b>Expression écrite</b><small>Écrire des mots et des phrases</small></span></li>
        <li>${ICONE.langue}<span><b>Langue</b><small>Grammaire, conjugaison, vocabulaire</small></span></li>
      </ul>
      <div class="ex-encadre"><b>Avant de commencer</b><p>Installez-vous au calme. Des écouteurs sont conseillés. Si vous ne connaissez pas la réponse, choisissez «&nbsp;Je ne sais pas&nbsp;».</p></div>
    </div></div>
    <div class="bas">${bouton("Commencer l'évaluation", "vert", 'id="commencer"')}</div>
  </section>`);
  brancherSon();
  $("#commencer").addEventListener("click", () => { audio(); SONS.valider(); vibrer(15); nouveauTest(); afficher(); });
  resserrer();
}
"""

RESULTAT_EXAMEN = r"""
function ecranResultat() {
  calculer();      // le niveau et le diagnostic restent pour le formateur (panneau « Moteur ») ; l'apprenant ne les voit pas
  poser(`<section class="ecran ecran-fin" aria-labelledby="t-resultat">
    <div class="haut haut-accueil"><span class="titre-test">Français langue étrangère</span>${boutonSon()}</div>
    <div class="defile"><div class="ex-fin"><span class="ex-doc">${ICONE.doc}</span><h1 id="t-resultat">Évaluation terminée</h1>
      <p>Vous avez répondu à toutes les questions. Merci.</p>
      <div class="ex-encadre"><b>Et ensuite ?</b><p>Vous pouvez prévenir votre formateur que vous avez terminé.</p></div></div></div>
    <div class="bas">${bouton("Fermer", "blanc", 'id="refaire"')}</div>
  </section>`);
  brancherSon(); SONS.valider();
  $("#refaire").addEventListener("click", () => { etat = { ecran: "accueil" }; afficher(); });
  resserrer();
}
"""

def transformer(s, artifact, style='feuille'):
    # en-tête du document : police, titre, couleur du navigateur
    if style != 'examen':      # « L'examen » garde les polices de la v2 (Baloo 2 et Nunito)
        police = 'family=Manrope:wght@500;600;700;800' if style == 'feuille' else 'family=Plus+Jakarta+Sans:wght@500;600;700;800'
        s = remplacer(s, 'family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800;900', police)
    if artifact:
        s = remplacer(s, '<title>Positionnement FLE v2</title>', '<title>Positionnement FLE v3</title>' if style == 'feuille' else '<title>Positionnement FLE dégradé</title>' if style == 'degrade' else '<title>Positionnement FLE examen</title>')
    else:
        s = remplacer(s, '<meta name="theme-color" content="#9748fe">', '<meta name="theme-color" content="%s">' % {'feuille': '#cbc2fb', 'degrade': '#8c7af6', 'examen': '#ffffff'}[style])
        s = remplacer(s, '<title>Test de niveau de français</title>', '<title>Test de positionnement en français</title>')
        s = s.replace('content="Test de niveau de français"', 'content="Test de positionnement en français"')
        # les sons sont ceux de la v2
        a = s.index('const AUDIO = {'); b = s.index('};', a)
        s = s[:a] + s[a:b].replace('"sons/', '"../positionnement-fle-2/sons/' if style == 'feuille' else '"../../positionnement-fle-2/sons/') + s[b:]
    # la feuille de style : entièrement nouvelle, sauf les panneaux du formateur, repris tels quels
    a = s.index('<style>') + len('<style>'); b = s.index('</style>', a)
    panneaux = bloc_css(s[a:b], '.coin { display: none; }')
    s = s[:a] + (CSS_EXAMEN if style == 'examen' else CSS + (CSS_DEGRADE if style == 'degrade' else '')) + '\n/* panneaux « Barème » et « Moteur » (ordinateur), repris de la v2 */\n' + panneaux + '\n' + s[b:]
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
    ex = style == 'examen'
    s = fonction(s, 'haut', HAUT_EXAMEN if ex else HAUT)
    s = fonction(s, 'ecranAccueil', ACCUEIL_EXAMEN if ex else ACCUEIL)
    s = fonction(s, 'ecranLecture', LECTURE)
    s = fonction(s, 'ecranResultat', RESULTAT_EXAMEN if ex else RESULTAT)
    if ex:
        s = remplacer(s, 'bouton("Suivant", "vert", `id="valider"', 'bouton("Valider", "vert", `id="valider"')
    # le lecteur dit ce qu'il fait (affiché seulement dans « L'examen »)
    s = remplacer(s, '${ICONE.jouer}<span class="vague" id="vague"', '${ICONE.jouer}<span class="lecteur-texte" aria-hidden="true"><b>Écouter l\'enregistrement</b><small id="reste">${reste === 2 ? "2 écoutes possibles" : reste === 1 ? "1 écoute possible" : "Plus d\'écoute possible"}</small></span><span class="vague" id="vague"')
    s = remplacer(s, '    lecteur.disabled = true;\n', '    lecteur.disabled = true; { const r = $("#reste"); if (r) r.textContent = "Écoute en cours…"; }\n')
    s = remplacer(s, 'lecteur.setAttribute("aria-label", 2 - n > 0 ? "Réécouter l\'enregistrement (1 écoute possible)" : "Plus d\'écoute possible");',
                  'lecteur.setAttribute("aria-label", 2 - n > 0 ? "Réécouter l\'enregistrement (1 écoute possible)" : "Plus d\'écoute possible"); { const r = $("#reste"); if (r) r.textContent = 2 - n > 0 ? "1 écoute possible" : "Plus d\'écoute possible"; }')
    s = remplacer(s, '      etat.ecran = "palier"; return afficher();', '      etat.ecran = "question"; return afficher();      // v3 : on enchaîne, sans écran de niveau')
    return s


for style, dossier in (('feuille', ICI), ('degrade', os.path.join(ICI, 'degrade')), ('examen', os.path.join(ICI, 'examen'))):
    os.makedirs(dossier, exist_ok=True)
    for nom, artifact in (('index.html', False), ('test-positionnement.html', True)):
        s = open(os.path.join(V2, nom), encoding='utf-8').read()
        s = transformer(s, artifact, style)
        open(os.path.join(dossier, nom), 'w', encoding='utf-8').write(s)
        print(style, nom, len(s) // 1024, 'Ko')
