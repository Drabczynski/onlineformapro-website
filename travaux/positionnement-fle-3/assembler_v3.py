"""Version 3 du test de positionnement : le style « La feuille » (fond pastel clair, grande feuille blanche qui porte
la question), plus officiel, et aucun niveau montré à l'apprenant (ni pastille, ni écran de passage de niveau,
ni niveau à la fin). Même banque, mêmes sons, même moteur adaptatif et mêmes panneaux « Barème » et « Moteur »
que la version 2 : le script part des deux fichiers produits par la v2 et les transforme.

    python3 travaux/positionnement-fle-3/assembler_v3.py

Produit index.html (page web ; les sons sont lus dans ../positionnement-fle-2/sons/) et test-positionnement.html
(artifact, tout intégré), pour « La feuille » (ce dossier) et pour la variante « Le dégradé » (dossier degrade/)."""
import base64, os, re

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
.scene.vide { flex-grow: 0; min-height: 128px; }      /* sans photo ni support : une bande de ciel, pas un grand vide */
.feuille-q { flex: none; display: grid; gap: 16px; padding: 4px 22px 18px; background: #fff; }
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
.photo-fond .contexte { background: rgba(255, 255, 255, .93); }
.photo-fond .etiquette { padding: 4px 12px; border-radius: 999px; background: rgba(255, 255, 255, .93); color: var(--encre); }
.photo-fond .indice { background: #fff; }
.lecture-tete { position: relative; z-index: 1; }
.lecture-tete.sur-photo .papier-tete { padding: 12px 16px; border-radius: 18px; background: rgba(255, 255, 255, .94); }
.photo-scene { display: block; width: 100%; max-height: 200px; object-fit: cover; border-radius: 18px; }
.phrase { justify-self: stretch; margin: 0; padding: 18px 20px; border-radius: 18px; background: #fff; color: var(--encre); font-size: 24px; font-weight: 700; line-height: 1.55; text-align: left; }
.phrase.petite { font-size: 19px; }
.ordre-phrase { font-size: 21px; line-height: 1.95; }
.trou { display: inline-block; min-width: 92px; margin: 0 3px; padding: 0 10px; border-radius: 8px 8px 0 0; background: var(--violet-pale); box-shadow: inset 0 -3px 0 var(--violet); color: var(--violet); line-height: 1.45; }
.trou.pop { animation: pop .3s ease-out; }
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
  html, body { overflow: hidden; overscroll-behavior: none; background: #58aef7; }
  body { padding: 0; }
  .appli { position: fixed; inset: 0; width: auto; height: auto; border: 0; border-radius: 0; }
  .haut { padding-top: calc(14px + env(safe-area-inset-top, 0px)); }
  .scene { padding-top: calc(66px + env(safe-area-inset-top, 0px)); }
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
  // en haut : le son à gauche, quitter à droite ; ni numéro de question ni niveau
  return `<div class="haut">${boutonSon()}<button class="rond" type="button" id="fermer" aria-label="Quitter le test">${ICONE.fermer}</button></div>`;
}
"""

ACCUEIL_EXAMEN = r"""
function ecranAccueil() {
  poser(`<section class="ecran ecran-accueil" aria-labelledby="t-accueil">
    <div class="haut">${boutonSon()}</div>
    <div class="defile">
      <div class="scene">${IMAGES.intro ? `<div class="visuel photo-fond"><img class="photo-scene" src="${IMAGES.intro}" alt=""></div>` : `<span class="ex-embleme" aria-hidden="true">${ICONE.ecoute}</span>`}</div>
      <div class="feuille-q">
        <h1 class="ex-titre" id="t-accueil">Évaluation de positionnement</h1>
        <p class="ex-sous">Français · environ 10 minutes</p>
        <ul class="ex-liste">
          <li><span class="ic">${ICONE.ecoute}</span>Écouter des enregistrements courts</li>
          <li><span class="ic">${ICONE.livre}</span>Lire des messages et des documents</li>
          <li><span class="ic">${ICONE.crayon}</span>Écrire des mots et des phrases</li>
        </ul>
      </div>
    </div>
    <div class="bas">${bouton("Commencer", "vert", 'id="commencer"')}</div>
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
  const fond = q.photo ? `<div class="visuel photo-fond"><img class="photo-scene" src="${IMAGES[q.photo]}" alt=""></div>` : "";
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

def transformer(s, artifact, style='feuille'):
    # en-tête du document : police, titre, couleur du navigateur
    police = {'feuille': 'family=Manrope:wght@500;600;700;800', 'degrade': 'family=Plus+Jakarta+Sans:wght@500;600;700;800', 'examen': 'family=Public+Sans:wght@400;500;600;700;800'}[style]
    s = remplacer(s, 'family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800;900', police)
    if artifact:
        s = remplacer(s, '<title>Positionnement FLE v2</title>', '<title>Positionnement FLE v3</title>' if style == 'feuille' else '<title>Positionnement FLE dégradé</title>' if style == 'degrade' else '<title>Positionnement FLE examen</title>')
    else:
        s = remplacer(s, '<meta name="theme-color" content="#9748fe">', '<meta name="theme-color" content="%s">' % {'feuille': '#cbc2fb', 'degrade': '#8c7af6', 'examen': '#58aef7'}[style])
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
        s = remplacer(s, 'bouton("Suivant", "vert", `id="valider"', 'bouton("Valider", "vert", `id="valider"')
        # tout support (y compris le message ou la phrase à compléter) va dans le dégradé ; question et réponses dans le blanc
        s = remplacer(s, """      return media ? `<div class="scene">${rub}${vis}</div><div class="feuille-q">${titre}${reponses}</div>`
                   : `<div class="scene vide">${rub}</div><div class="feuille-q">${avant ? titre + vis : vis + titre}${reponses}</div>`;""",
                      """      const enFond = q.photo && q.t !== "ecoute" && q.t !== "situation" ? `<img class="photo-scene" src="${IMAGES[q.photo]}" alt="">` : "";
      const support = q.t === "aucun" ? "" : visuel(q.t === "document" ? { ...q, photo: null } : q);
      const visEx = q.t === "aucun" && !q.photo ? "" : `<div class="visuel${q.photo ? " photo-fond" : ""}">${enFond}${support}</div>`;
      return `<div class="scene${q.t === "aucun" && !q.photo ? " vide" : ""}">${visEx}</div><div class="feuille-q">${titre.replace(" consigne", "").replace(/ ([?!:;])/g, "\u00a0$1")}${reponses}</div>`;""")
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
