"""Maquettes de trois pistes « officielles » (fond clair, niveau caché) pour le test de positionnement.
Écrit la version artifact (sans doctype) et la page web (avec doctype) à partir du même contenu."""
import base64, sys

RACINE = '/home/user/onlineformapro-website/travaux'
SORTIE_WEB = f'{RACINE}/positionnement-fle-3/maquettes/index.html'
SORTIE_ART = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/v3/pistes.html'
PHOTO = base64.b64encode(open(f'{RACINE}/positionnement-fle-2/banque/img/appartement.webp', 'rb').read()).decode()

I = {
    'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    'son': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    'jouer': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
    'coche': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    'casque': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/></svg>',
    'livre': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
    'crayon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5l4 4L8 20H4v-4z"/><path d="M14 6l4 4"/></svg>',
    'horloge': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    'effacer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
    'doc': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8.5 15l2.5 2.5 5-5"/></svg>',
}
STATUT = '''<div class="statut"><span>9:41</span><span class="ile"></span><span class="icones"><svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 26 12" fill="none" stroke="currentColor" stroke-width="1.2"><rect x=".6" y=".6" width="22" height="10.8" rx="3"/><rect x="2.4" y="2.4" width="16" height="7.2" rx="1.6" fill="currentColor" stroke="none"/><path d="M24.5 4v4" stroke-width="1.8" stroke-linecap="round"/></svg></span></div>'''

CHOIX = ['son prix', 'sa taille', 'son étage']        # A1-10, dans un ordre tiré
LETTRES = list('tpnadorlfine')                         # A1-01 : les lettres des choix du PDF (donne, parle, fait)
TAPE = 'parle'


def clavier(cls):
    pris, html = list(TAPE), []
    for k, l in enumerate(LETTRES):
        ordre = ''
        if l in pris:
            ordre = f' data-ordre="{TAPE.index(l)}"'; pris.remove(l)
        html.append(f'<button type="button" class="touche{" utilisee" if ordre else ""}"{ordre} {"disabled" if ordre else ""}>{l}</button>')
    html.append(f'<button type="button" class="touche effacer" aria-label="Effacer la dernière lettre">{I["effacer"]}</button>')
    return f'<div class="clavier {cls}">' + ''.join(html) + '</div>'


def liste(cls, lettres=False):
    out = []
    for k, c in enumerate(CHOIX):
        badge = f'<span class="badge">{"ABC"[k]}</span>' if lettres else '<span class="rond"></span>'
        out.append(f'<button type="button" class="choix{" pris" if k == 1 else ""}">{badge}<span>{c}</span></button>')
    return f'<div class="liste {cls}">' + ''.join(out) + '</div>'


def tel(piste, contenu, legende):
    return f'<figure class="cadre"><div class="tel"><div class="ecran {piste}">{STATUT}{contenu}</div></div><figcaption>{legende}</figcaption></figure>'


# ------------------------------------------------------------------ piste A : le dégradé de la référence
A = [
    tel('pa', f'''<div class="a-titre"><span class="a-sur">Français</span><h3>Test de positionnement</h3><p>Environ 10 minutes</p></div>
      <div class="a-corps"><h4>Déroulement</h4>
        <div class="a-tuiles">
          <div class="a-tuile"><span class="ic">{I["casque"]}</span><b>Écouter</b><small>Enregistrements courts</small></div>
          <div class="a-tuile"><span class="ic">{I["livre"]}</span><b>Lire</b><small>Messages, documents</small></div>
          <div class="a-tuile"><span class="ic">{I["crayon"]}</span><b>Écrire</b><small>Mots et phrases</small></div>
          <div class="a-tuile"><span class="ic">{I["horloge"]}</span><b>Adapté</b><small>Selon vos réponses</small></div>
        </div>
        <div class="a-note">{I["info"]}<span>Écouteurs conseillés. Vous pouvez répondre « Je ne sais pas ».</span></div>
      </div>
      <div class="a-bas"><button type="button" class="a-bouton">Commencer le test</button></div>''', 'Accueil'),
    tel('pa', f'''<div class="a-tete"><span class="verre">{I["x"]}</span><span class="a-num">Question 4</span><span class="verre">{I["son"]}</span></div>
      <div class="a-barre"><i style="width:22%"></i></div>
      <div class="a-zone"><div class="a-carte-photo"><div class="photo"><button type="button" class="a-play">{I["jouer"]}</button><span class="a-ecoutes">2 écoutes</span></div></div>
        <h5>Qu'est-ce que vous apprenez sur cet appartement ?</h5>{liste("a-liste")}</div>
      <div class="a-bas"><button type="button" class="a-bouton">Suivant</button><span class="a-lien">Je ne sais pas</span></div>''', 'Question d\'écoute'),
    tel('pa', f'''<div class="a-tete"><span class="verre">{I["x"]}</span><span class="a-num">Question 5</span><span class="verre">{I["son"]}</span></div>
      <div class="a-barre"><i style="width:27%"></i></div>
      <div class="a-zone"><div class="a-carte"><small>Complétez la phrase.</small><p class="a-phrase">Je <span class="saisie">parle</span> français.</p><span class="a-indice">(parler)</span></div>
        {clavier("a-clavier")}</div>
      <div class="a-bas"><button type="button" class="a-bouton">Suivant</button><span class="a-lien">Je ne sais pas</span></div>''', 'Expression écrite'),
    tel('pa', f'''<div class="a-fin"><span class="a-coche">{I["coche"]}</span><h3>Test terminé</h3></div>
      <div class="a-corps"><div class="a-carte a-merci"><b>Merci pour vos réponses.</b><p>Elles ont été enregistrées. Votre organisme de formation vous communiquera le résultat.</p></div>
        <p class="a-discret">Vous pouvez fermer cette page.</p></div>
      <div class="a-bas"><button type="button" class="a-bouton">Fermer</button></div>''', 'Fin du test, sans niveau'),
]

# ------------------------------------------------------------------ piste B : l'examen
B = [
    tel('pb', f'''<div class="b-tete"><span class="b-org">Français langue étrangère</span></div>
      <div class="b-corps"><h3>Évaluation de positionnement</h3><p class="b-meta">{I["horloge"]} Environ 10 minutes · questions adaptées à vos réponses</p>
        <ul class="b-rubriques"><li>{I["casque"]}<span><b>Compréhension orale</b><small>Écouter des enregistrements</small></span></li>
          <li>{I["livre"]}<span><b>Compréhension écrite</b><small>Lire des messages et des documents</small></span></li>
          <li>{I["crayon"]}<span><b>Expression écrite</b><small>Écrire des mots et des phrases</small></span></li></ul>
        <div class="b-consignes"><b>Avant de commencer</b><p>Installez-vous au calme. Des écouteurs sont conseillés. Si vous ne connaissez pas la réponse, choisissez « Je ne sais pas ».</p></div></div>
      <div class="b-bas"><button type="button" class="b-bouton large">Commencer l'évaluation</button></div>''', 'Accueil'),
    tel('pb', f'''<div class="b-tete"><span class="b-x">{I["x"]}</span><span class="b-org">Évaluation</span><span class="b-num">Question 4</span></div>
      <div class="b-corps"><span class="b-rub">{I["casque"]} Compréhension orale</span>
        <div class="photo b-photo"></div>
        <div class="b-lecteur"><button type="button" class="b-play">{I["jouer"]}</button><span><b>Écouter l'enregistrement</b><small>2 écoutes restantes</small></span></div>
        <h5>Qu'est-ce que vous apprenez sur cet appartement ?</h5>{liste("b-liste", lettres=True)}</div>
      <div class="b-bas b-deux"><span class="b-lien">Je ne sais pas</span><button type="button" class="b-bouton">Valider</button></div>''', 'Question d\'écoute'),
    tel('pb', f'''<div class="b-tete"><span class="b-x">{I["x"]}</span><span class="b-org">Évaluation</span><span class="b-num">Question 5</span></div>
      <div class="b-corps"><span class="b-rub">{I["crayon"]} Expression écrite</span>
        <h5>Complétez la phrase.</h5>
        <div class="b-feuille"><p>Je <span class="saisie">parle</span> français.</p><small>Verbe : parler</small></div>
        {clavier("b-clavier")}</div>
      <div class="b-bas b-deux"><span class="b-lien">Je ne sais pas</span><button type="button" class="b-bouton">Valider</button></div>''', 'Expression écrite'),
    tel('pb', f'''<div class="b-tete"><span class="b-org">Français langue étrangère</span></div>
      <div class="b-corps b-fin"><span class="b-doc">{I["doc"]}</span><h3>Évaluation terminée</h3><p>Vos réponses ont été enregistrées.</p>
        <div class="b-consignes"><b>Et ensuite ?</b><p>Votre organisme de formation vous communiquera le résultat. Vous pouvez fermer cette page.</p></div></div>
      <div class="b-bas"><button type="button" class="b-bouton contour large">Fermer</button></div>''', 'Fin du test, sans niveau'),
]

# ------------------------------------------------------------------ piste C : la feuille
C = [
    tel('pc', f'''<div class="c-haut c-accueil"><small>Bienvenue</small><h3>Test de positionnement en français</h3><p>Environ 10 minutes</p></div>
      <div class="c-feuille"><ul class="c-etapes"><li><span class="c-ic">{I["casque"]}</span>Écouter des enregistrements courts</li>
          <li><span class="c-ic">{I["livre"]}</span>Lire des messages et des documents</li>
          <li><span class="c-ic">{I["crayon"]}</span>Écrire des mots et des phrases</li></ul>
        <p class="c-note">Les questions s'adaptent à vos réponses. Des écouteurs sont conseillés.</p>
        <div class="c-bas"><button type="button" class="c-bouton">Commencer</button></div></div>''', 'Accueil'),
    tel('pc', f'''<div class="photo c-photo"><div class="c-tete"><span class="c-verre">{I["x"]}</span><span class="c-num">Question 4</span><span class="c-verre">{I["son"]}</span></div>
        <button type="button" class="c-play">{I["jouer"]}<span class="c-pastille">2</span></button></div>
      <div class="c-feuille c-monte"><h5>Qu'est-ce que vous apprenez sur cet appartement ?</h5>{liste("c-liste")}
        <div class="c-bas"><button type="button" class="c-bouton">Suivant</button><span class="c-lien">Je ne sais pas</span></div></div>''', 'Question d\'écoute'),
    tel('pc', f'''<div class="c-haut"><div class="c-tete sombre"><span class="c-verre">{I["x"]}</span><span class="c-num">Question 5</span><span class="c-verre">{I["son"]}</span></div></div>
      <div class="c-feuille"><small class="c-consigne">Complétez la phrase.</small><p class="c-phrase">Je <span class="saisie">parle</span> français.</p><span class="c-indice">(parler)</span>
        {clavier("c-clavier")}
        <div class="c-bas"><button type="button" class="c-bouton">Suivant</button><span class="c-lien">Je ne sais pas</span></div></div>''', 'Expression écrite'),
    tel('pc', f'''<div class="c-haut c-accueil"><small>C'est fini</small><h3>Merci pour vos réponses</h3></div>
      <div class="c-feuille c-fin"><span class="c-coche">{I["coche"]}</span><b>Test terminé</b><p>Vos réponses ont été enregistrées. Votre organisme de formation vous communiquera le résultat.</p>
        <div class="c-bas"><button type="button" class="c-bouton">Fermer</button></div></div>''', 'Fin du test, sans niveau'),
]

CSS = '''
/* Page de présentation : fond gris clair bleuté, les trois pistes l'une sous l'autre, quatre écrans par piste.
   Une seule ambiance claire, voulue : on compare des écrans clairs. */
:root {
  --fond: #eceef4; --papier: #ffffff; --encre: #1b1f30; --doux: #5d6276; --filet: #d8dbe6; --accent: #5a57e8;
  --titre: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
  --texte: "Public Sans", "Segoe UI", system-ui, sans-serif;
  color-scheme: light;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--fond); color: var(--encre); font: 400 15px/1.55 var(--texte); }
.page { max-width: 1340px; margin: 0 auto; padding-block: 40px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 48px; }
.intro { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 32px; align-items: start; }
.intro h1 { margin: 0 0 12px; font: 800 clamp(28px, 3.4vw, 40px)/1.1 var(--titre); letter-spacing: -.02em; text-wrap: balance; }
.intro p { margin: 0; max-width: 60ch; color: var(--doux); font-size: 16px; }
.commun { margin: 0; padding: 20px 22px; border: 1px solid var(--filet); border-radius: 18px; background: var(--papier); }
.commun h2 { margin: 0 0 10px; font: 700 13px/1.3 var(--texte); letter-spacing: .08em; text-transform: uppercase; color: var(--doux); }
.commun ul { margin: 0; padding-left: 18px; display: grid; gap: 6px; }
.piste { display: grid; gap: 18px; }
.piste-tete { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 14px; align-items: baseline; max-width: 900px; }
.lettre { grid-row: span 2; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: var(--encre); color: #fff; font: 800 20px/1 var(--titre); align-self: start; }
.piste-tete h2 { margin: 0; font: 800 24px/1.2 var(--titre); letter-spacing: -.01em; }
.piste-tete p { margin: 0; color: var(--doux); max-width: 70ch; }
.rangee { display: flex; gap: 28px; overflow-x: auto; padding: 4px 2px 12px; scrollbar-width: thin; }
.cadre { margin: 0; display: grid; gap: 10px; justify-items: center; }
.cadre figcaption { font: 600 13px/1.3 var(--texte); color: var(--doux); }
.choisir { padding: 22px 24px; border-radius: 18px; background: var(--encre); color: #fff; max-width: 900px; }
.choisir h2 { margin: 0 0 6px; font: 800 20px/1.25 var(--titre); }
.choisir p { margin: 0; color: #c9cce0; }
@media (max-width: 860px) { .intro { grid-template-columns: 1fr; } }

/* ------------------------------------------------------------ le téléphone */
.tel { flex: none; width: 300px; height: 650px; padding: 9px; border-radius: 46px; background: #14151b; }
.ecran { position: relative; height: 100%; overflow: hidden; display: flex; flex-direction: column; border-radius: 37px; }
.statut { position: relative; z-index: 3; flex: none; display: flex; justify-content: space-between; align-items: center; height: 38px; padding: 4px 24px 0 28px; font: 700 12.5px/1 -apple-system, "Segoe UI", system-ui, sans-serif; }
.statut .icones { display: flex; gap: 5px; align-items: center; } .statut svg { height: 10px; width: auto; }
.statut .ile { position: absolute; top: 9px; left: 50%; width: 86px; height: 24px; margin-left: -43px; border-radius: 14px; background: #000; }
.ecran svg { display: block; }
.ecran button { font: inherit; color: inherit; cursor: pointer; border: 0; }
.photo { position: relative; background: #9fb3c8 url(data:image/webp;base64,__PHOTO__) center 40% / cover; }
.saisie::after { content: ""; display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -.12em; background: currentColor; animation: clignote 1.1s steps(1) infinite; }
@keyframes clignote { 50% { opacity: 0; } }
.clavier { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.touche { display: grid; place-items: center; height: 40px; font-weight: 700 !important; font-size: 17px !important; text-transform: uppercase; transition: opacity .15s; }
.touche:disabled { opacity: .3; cursor: default; }
.touche.effacer { grid-column: span 2; }
.touche.effacer svg { width: 20px; height: 20px; }
@media (prefers-reduced-motion: reduce) { .saisie::after { animation: none; } }

/* ------------------------------------------------------------ piste A : le dégradé */
.pa { --a-encre: #1d2236; --a-doux: #6a7088; --a-filet: #e5e7ef; --a-accent: #5a57e8;
  background: linear-gradient(180deg, #8c7af6 0%, #7b93f6 19%, #93cdf0 37%, #d9edf7 50%, #f5f7fb 62%); color: var(--a-encre); font-family: "Plus Jakarta Sans", system-ui, sans-serif; }
.pa .statut { color: #fff; }
.a-titre { padding: 22px 22px 18px; color: #fff; }
.a-sur { display: inline-block; padding: 4px 11px; border-radius: 999px; background: rgba(255,255,255,.22); font-size: 12px; font-weight: 700; }
.a-titre h3 { margin: 12px 0 4px; font-size: 27px; line-height: 1.12; font-weight: 800; letter-spacing: -.02em; }
.a-titre p { margin: 0; font-size: 14px; opacity: .9; }
.a-corps { flex: 1; padding: 6px 16px 0; display: grid; align-content: start; gap: 10px; }
.a-corps h4 { margin: 4px 4px 0; font-size: 15px; font-weight: 700; }
.a-tuiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.a-tuile { display: grid; gap: 1px; padding: 9px 11px; border: 1px solid var(--a-filet); border-radius: 16px; background: #fff; }
.a-tuile .ic { width: 18px; height: 18px; margin-bottom: 3px; color: var(--a-accent); }
.a-tuile b { font-size: 14px; } .a-tuile small { font-size: 11.5px; line-height: 1.3; color: var(--a-doux); }
.a-note { display: flex; gap: 8px; padding: 10px 12px; border-radius: 14px; background: #eef0fb; font-size: 12px; line-height: 1.4; color: #44486a; }
.a-note svg { flex: none; width: 16px; height: 16px; margin-top: 1px; color: var(--a-accent); }
.a-bas { margin-top: auto; padding: 10px 16px 18px; display: grid; gap: 4px; justify-items: center; }
.a-bouton { width: 100%; height: 50px; border-radius: 16px !important; background: var(--a-encre) !important; color: #fff !important; font-size: 15.5px !important; font-weight: 700 !important; }
.a-lien { padding: 6px; font-size: 13px; font-weight: 600; color: var(--a-doux); text-decoration: underline; text-underline-offset: 3px; }
.a-tete { display: grid; grid-template-columns: 34px 1fr 34px; align-items: center; padding: 6px 16px 0; color: #fff; }
.verre { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.24); border: 1px solid rgba(255,255,255,.45); }
.verre svg { width: 16px; height: 16px; }
.a-num { text-align: center; font-size: 14px; font-weight: 700; }
.a-barre { margin: 12px 16px 0; height: 5px; border-radius: 3px; background: rgba(255,255,255,.35); overflow: hidden; } .a-barre i { display: block; height: 100%; border-radius: 3px; background: #fff; }
.a-zone { padding: 14px 16px 0; display: grid; gap: 12px; }
.a-carte-photo { padding: 6px; border-radius: 22px; background: #fff; }
.a-carte-photo .photo { height: 150px; border-radius: 17px; display: grid; place-items: center; }
.a-play { display: grid; place-items: center; width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,.92) !important; color: var(--a-accent) !important; }
.a-play svg { width: 24px; height: 24px; margin-left: 3px; }
.a-ecoutes { position: absolute; top: 8px; right: 8px; padding: 3px 9px; border-radius: 999px; background: rgba(20,22,40,.55); color: #fff; font-size: 11px; font-weight: 700; }
.pa h5 { margin: 2px 2px 0; font-size: 17px; line-height: 1.3; font-weight: 800; letter-spacing: -.01em; text-wrap: balance; }
.a-liste { display: grid; gap: 8px; }
.a-liste .choix { display: flex; align-items: center; gap: 11px; min-height: 48px; padding: 0 14px; border: 1.5px solid var(--a-filet) !important; border-radius: 15px; background: #fff; font-size: 15px; font-weight: 600; text-align: left; }
.a-liste .rond { flex: none; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #c8cbd8; }
.a-liste .pris { border-color: var(--a-accent) !important; background: #f2f1ff; }
.a-liste .pris .rond { border: 5px solid var(--a-accent); }
.a-carte { display: grid; gap: 6px; justify-items: center; padding: 16px; border-radius: 20px; background: #fff; border: 1px solid var(--a-filet); text-align: center; }
.a-carte small { font-size: 12.5px; font-weight: 600; color: var(--a-doux); }
.a-phrase { margin: 2px 0; font-size: 22px; font-weight: 700; }
.a-phrase .saisie { display: inline-block; min-width: 76px; padding: 0 6px; border-bottom: 2.5px solid var(--a-accent); color: var(--a-accent); }
.a-indice { padding: 2px 10px; border-radius: 999px; background: #f0f1f6; font-size: 12px; font-weight: 600; color: var(--a-doux); }
.a-clavier .touche { border: 1.5px solid var(--a-filet) !important; border-radius: 11px; background: #fff; color: var(--a-encre); }
.a-clavier .effacer { color: var(--a-doux); }
.a-fin { display: grid; justify-items: center; gap: 12px; padding: 54px 20px 34px; color: #fff; }
.a-coche { display: grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: #fff; color: var(--a-accent); }
.a-coche svg { width: 34px; height: 34px; }
.a-fin h3 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
.a-merci { text-align: left; justify-items: start; padding: 16px 16px 18px; }
.a-merci b { font-size: 15.5px; } .a-merci p { margin: 0; font-size: 13.5px; line-height: 1.45; color: var(--a-doux); }
.a-discret { margin: 0 4px; font-size: 12.5px; color: var(--a-doux); }

/* ------------------------------------------------------------ piste B : l'examen */
.pb { --b-encre: #17213b; --b-doux: #5e667c; --b-filet: #dde1ea; --b-bleu: #2b59d9; background: #f2f4f8; color: var(--b-encre); font-family: "Public Sans", system-ui, sans-serif; }
.pb .statut { background: #fff; color: var(--b-encre); }
.b-tete { flex: none; display: flex; align-items: center; gap: 10px; min-height: 46px; padding: 0 16px; background: #fff; border-bottom: 1px solid var(--b-filet); position: relative; }
.b-tete::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; background: linear-gradient(90deg, #8c7af6, #7b93f6 45%, #8fd6ee); }
.b-x { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: #f0f2f6; } .b-x svg { width: 14px; height: 14px; }
.b-org { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--b-doux); }
.b-num { margin-left: auto; font-size: 13px; font-weight: 700; }
.b-corps { flex: 1; padding: 16px 16px 0; display: grid; align-content: start; gap: 11px; }
.b-corps h3 { margin: 4px 0 0; font-size: 24px; line-height: 1.15; font-weight: 800; letter-spacing: -.015em; }
.b-meta { margin: 0; display: flex; gap: 6px; align-items: center; font-size: 12.5px; color: var(--b-doux); } .b-meta svg { width: 15px; height: 15px; flex: none; }
.b-rubriques { margin: 4px 0 0; padding: 0; list-style: none; border: 1px solid var(--b-filet); border-radius: 12px; background: #fff; }
.b-rubriques li { display: flex; gap: 11px; align-items: center; padding: 11px 13px; } .b-rubriques li + li { border-top: 1px solid var(--b-filet); }
.b-rubriques svg { width: 20px; height: 20px; flex: none; color: var(--b-bleu); }
.b-rubriques span { display: grid; } .b-rubriques b { font-size: 13.5px; } .b-rubriques small { font-size: 11.5px; color: var(--b-doux); }
.b-consignes { padding: 12px 13px; border-left: 3px solid var(--b-bleu); border-radius: 4px 10px 10px 4px; background: #e9eefb; }
.b-consignes b { font-size: 13px; } .b-consignes p { margin: 3px 0 0; font-size: 12.5px; line-height: 1.45; color: #3c4560; }
.b-bas { flex: none; margin-top: auto; padding: 12px 16px 18px; background: #fff; border-top: 1px solid var(--b-filet); display: flex; }
.b-deux { justify-content: space-between; align-items: center; }
.b-bouton { height: 46px; padding: 0 26px; border-radius: 10px !important; background: var(--b-bleu) !important; color: #fff !important; font-size: 15px !important; font-weight: 700 !important; }
.b-bouton.large { width: 100%; } .b-bouton.contour { background: #fff !important; color: var(--b-bleu) !important; border: 1.5px solid var(--b-bleu) !important; }
.b-lien { font-size: 13.5px; font-weight: 600; color: var(--b-doux); text-decoration: underline; text-underline-offset: 3px; }
.b-rub { justify-self: start; display: inline-flex; gap: 6px; align-items: center; padding: 4px 9px; border-radius: 6px; background: #e6ecfb; color: var(--b-bleu); font-size: 12px; font-weight: 700; }
.b-rub svg { width: 14px; height: 14px; }
.b-photo { height: 128px; border-radius: 10px; }
.b-lecteur { display: flex; align-items: center; gap: 11px; }
.b-play { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 10px !important; background: var(--b-bleu) !important; color: #fff !important; } .b-play svg { width: 18px; height: 18px; margin-left: 2px; }
.b-lecteur span { display: grid; } .b-lecteur b { font-size: 13.5px; } .b-lecteur small { font-size: 11.5px; color: var(--b-doux); }
.pb h5 { margin: 2px 0 0; font-size: 16px; line-height: 1.32; font-weight: 700; text-wrap: balance; }
.b-liste { display: grid; gap: 7px; }
.b-liste .choix { display: flex; align-items: center; gap: 11px; min-height: 44px; padding: 0 12px; border: 1.5px solid var(--b-filet) !important; border-radius: 10px; background: #fff; font-size: 14.5px; font-weight: 500; text-align: left; }
.b-liste .badge { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: #eef1f6; font-size: 12px; font-weight: 800; color: var(--b-doux); }
.b-liste .pris { border-color: var(--b-bleu) !important; background: #f3f6fe; } .b-liste .pris .badge { background: var(--b-bleu); color: #fff; }
.b-feuille { display: grid; gap: 4px; padding: 16px; border: 1px solid var(--b-filet); border-radius: 12px; background: #fff; }
.b-feuille p { margin: 0; font-size: 20px; font-weight: 600; }
.b-feuille .saisie { display: inline-block; min-width: 80px; padding: 1px 8px; border: 1.5px solid var(--b-bleu); border-radius: 6px; background: #f3f6fe; color: var(--b-bleu); }
.b-feuille small { font-size: 12px; color: var(--b-doux); }
.b-clavier { gap: 5px; } .b-clavier .touche { border: 1px solid var(--b-filet) !important; border-radius: 7px; background: #fff; color: var(--b-encre); }
.b-fin { justify-items: start; padding-top: 34px; } .b-fin p { margin: 0; font-size: 14px; color: var(--b-doux); }
.b-doc { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 14px; background: #e6ecfb; color: var(--b-bleu); } .b-doc svg { width: 28px; height: 28px; }

/* ------------------------------------------------------------ piste C : la feuille */
.pc { --c-encre: #1f2140; --c-doux: #6b6f8c; --c-indigo: #4a43d8; --c-pastel: #f3f2ff;
  background: linear-gradient(180deg, #cbc2fb 0%, #bccffb 30%, #cbedf6 58%, #eef1fb 100%); color: var(--c-encre); font-family: "Manrope", system-ui, sans-serif; }
.pc .statut { color: var(--c-encre); }
.c-haut { flex: none; padding: 6px 16px 20px; }
.c-accueil { padding: 34px 24px 28px; } .c-accueil small { font-size: 13px; font-weight: 700; color: #4b4f7a; }
.c-accueil h3 { margin: 6px 0 6px; font-size: 26px; line-height: 1.15; font-weight: 800; letter-spacing: -.02em; }
.c-accueil p { margin: 0; font-size: 14px; color: #4b4f7a; }
.c-feuille { flex: 1; display: flex; flex-direction: column; gap: 12px; padding: 22px 18px 0; border-radius: 30px 30px 0 0; background: #fff; }
.c-monte { margin-top: -26px; position: relative; z-index: 2; }
.c-etapes { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.c-etapes li { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
.c-ic { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--c-pastel); color: var(--c-indigo); flex: none; } .c-ic svg { width: 18px; height: 18px; }
.c-note { margin: 4px 0 0; padding: 11px 13px; border-radius: 14px; background: #f6f7fb; font-size: 12.5px; line-height: 1.45; color: var(--c-doux); }
.c-bas { margin-top: auto; padding: 8px 0 18px; display: grid; gap: 4px; justify-items: center; }
.c-bouton { width: 100%; height: 50px; border-radius: 999px !important; background: var(--c-indigo) !important; color: #fff !important; font-size: 15.5px !important; font-weight: 700 !important; }
.c-lien { padding: 6px; font-size: 13px; font-weight: 600; color: var(--c-doux); text-decoration: underline; text-underline-offset: 3px; }
.c-tete { display: grid; grid-template-columns: 34px 1fr 34px; align-items: center; color: #fff; }
.c-tete.sombre { color: var(--c-encre); }
.c-verre { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.35); border: 1px solid rgba(255,255,255,.6); } .c-verre svg { width: 16px; height: 16px; }
.c-num { justify-self: center; padding: 5px 12px; border-radius: 999px; background: rgba(255,255,255,.55); color: var(--c-encre); font-size: 12.5px; font-weight: 800; }
.c-photo { flex: none; height: 262px; margin-top: -38px; padding: 46px 16px 0; display: grid; grid-template-rows: auto 1fr; }
.c-photo::before { content: ""; position: absolute; inset: 0 0 auto; height: 90px; background: linear-gradient(rgba(20,20,50,.38), rgba(20,20,50,0)); }
.c-photo > * { position: relative; }
.c-play { align-self: center; justify-self: center; display: grid; place-items: center; width: 64px; height: 64px; margin-top: -10px; border-radius: 50%; background: #fff !important; color: var(--c-indigo) !important; position: relative; }
.c-play svg { width: 26px; height: 26px; margin-left: 3px; }
.c-pastille { position: absolute; top: -4px; right: -4px; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--c-indigo); color: #fff; font-size: 11.5px; font-weight: 800; }
.pc h5 { margin: 0; font-size: 17px; line-height: 1.3; font-weight: 800; text-wrap: balance; }
.c-liste { display: grid; gap: 8px; }
.c-liste .choix { display: flex; align-items: center; gap: 11px; min-height: 46px; padding: 0 16px; border-radius: 14px; background: var(--c-pastel) !important; font-size: 15px; font-weight: 700; text-align: left; }
.c-liste .rond { flex: none; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #c4c1ee; background: #fff; }
.c-liste .pris { background: var(--c-indigo) !important; color: #fff !important; } .c-liste .pris .rond { border: 5px solid #fff; background: var(--c-indigo); }
.c-consigne { font-size: 13px; font-weight: 700; color: var(--c-doux); }
.c-phrase { margin: 0; font-size: 23px; font-weight: 800; }
.c-phrase .saisie { display: inline-block; min-width: 80px; padding: 0 10px; border-radius: 10px; background: var(--c-pastel); color: var(--c-indigo); }
.c-indice { align-self: flex-start; margin-top: -4px; font-size: 12.5px; font-weight: 700; color: var(--c-doux); }
.c-clavier { gap: 7px; margin-top: 4px; } .c-clavier .touche { height: 42px; border-radius: 999px; background: var(--c-pastel); color: var(--c-encre); }
.c-fin .c-bas { align-self: stretch; }
.c-fin { align-items: center; text-align: center; padding-top: 30px; } .c-fin b { font-size: 19px; font-weight: 800; } .c-fin p { margin: 0; font-size: 14px; line-height: 1.5; color: var(--c-doux); }
.c-coche { display: grid; place-items: center; width: 68px; height: 68px; border-radius: 50%; background: var(--c-pastel); color: var(--c-indigo); } .c-coche svg { width: 32px; height: 32px; }
.c-haut + .c-feuille { margin-top: 0; }
.pc .c-haut:not(.c-accueil) { padding-top: 6px; }
'''

JS = '''
// les maquettes répondent au toucher : choisir une réponse, écrire le mot avec les lettres
document.querySelectorAll(".liste").forEach(l => l.addEventListener("click", (e) => {
  const c = e.target.closest(".choix"); if (!c) return;
  l.querySelectorAll(".choix").forEach(x => x.classList.toggle("pris", x === c));
}));
document.querySelectorAll(".clavier").forEach(k => {
  const champ = k.closest(".ecran").querySelector(".saisie");
  const pile = [...k.querySelectorAll(".touche.utilisee")].sort((a, b) => a.dataset.ordre - b.dataset.ordre);
  const montrer = () => { champ.textContent = pile.map(t => t.textContent).join(""); };
  k.addEventListener("click", (e) => {
    const t = e.target.closest(".touche"); if (!t || t.disabled) return;
    if (t.classList.contains("effacer")) { const d = pile.pop(); if (d) d.disabled = false; }
    else { t.disabled = true; pile.push(t); }
    montrer();
  });
});
'''

contenu = f'''<title>Pistes claires du test FLE</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Public+Sans:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap">
<style>{CSS.replace("__PHOTO__", PHOTO)}</style>
<main class="page">
  <header class="intro">
    <div><h1>Trois pistes pour un test plus officiel</h1>
      <p>Fond clair, lecture sobre, et l'apprenant ne voit plus son niveau. Les questions, les sons et le moteur adaptatif ne changent pas. La version actuelle, plus ludique, reste en place pour d'autres activités.</p></div>
    <section class="commun" aria-labelledby="t-commun"><h2 id="t-commun">Commun aux trois pistes</h2>
      <ul><li>Aucun niveau affiché pendant le test : ni pastille A1, A2, B1, ni écran de passage de niveau.</li>
        <li>L'apprenant voit seulement le numéro de la question. La barre de la piste A avance sans repartir à zéro.</li>
        <li>À la fin, un remerciement sans niveau. Le résultat reste visible pour le formateur dans le panneau « Moteur ».</li>
        <li>Réponses en cartes simples, sans alvéoles ; clavier de lettres en touches.</li></ul></section>
  </header>
  <section class="piste" aria-labelledby="t-a"><div class="piste-tete"><span class="lettre">A</span><h2 id="t-a">Le dégradé</h2>
      <p>Le dégradé violet, bleu et turquoise de votre référence en haut de l'écran, qui s'efface vers un fond clair. Cartes blanches, texte bleu nuit, bouton sombre.</p></div>
    <div class="rangee">{"".join(A)}</div></section>
  <section class="piste" aria-labelledby="t-b"><div class="piste-tete"><span class="lettre">B</span><h2 id="t-b">L'examen</h2>
      <p>La plus institutionnelle : bandeau blanc, nom de la compétence au-dessus de chaque question, réponses A, B, C comme sur une copie. Le dégradé devient un simple filet sous le bandeau.</p></div>
    <div class="rangee">{"".join(B)}</div></section>
  <section class="piste" aria-labelledby="t-c"><div class="piste-tete"><span class="lettre">C</span><h2 id="t-c">La feuille</h2>
      <p>Le dégradé en version pastel sur tout l'écran, et une grande feuille blanche qui porte la question. Plus doux ; la photo de l'écoute prend tout le haut.</p></div>
    <div class="rangee">{"".join(C)}</div></section>
  <aside class="choisir"><h2>Pour choisir</h2><p>Dites-moi la lettre de la piste, ou un mélange : par exemple le dégradé de A avec les réponses A, B, C de B. Les écrans répondent au toucher : on peut choisir une réponse et écrire le mot avec les lettres.</p></aside>
</main>
<script>{JS}</script>
'''

open(SORTIE_ART, 'w', encoding='utf-8').write(contenu)
web = contenu.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
web = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       + web.replace('<main class="page">', '</head>\n<body>\n<main class="page">', 1) + '</body>\n</html>\n')
web = web.replace('<title>', '<meta name="robots" content="noindex">\n<title>', 1)
open(SORTIE_WEB, 'w', encoding='utf-8').write(web)
print(len(contenu) // 1024, 'Ko')
