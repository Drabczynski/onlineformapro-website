import json, base64, re, os
RACINE = '/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad'
SONS_DEPOT = '/home/user/onlineformapro-website/travaux/positionnement-fle/sons'
p = f'{RACINE}/positionnement/test-positionnement.html'
s = open(p, encoding='utf-8').read()
banque = json.load(open(f'{RACINE}/banque/banque.json'))
cles = json.load(open(f'{RACINE}/banque/cles-consignes.json'))
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (old[:100], s.count(old))
    s = s.replace(old, new)
def entre(debut, fin, nouveau):
    global s
    a = s.index(debut); b = s.index(fin, a)
    s = s[:a] + nouveau + s[b:]
b64 = lambda f: "data:audio/mpeg;base64," + base64.b64encode(open(f, 'rb').read()).decode()

# ---------- la banque (142 QCM, tous les tags du fichier)
entre('// ------------------------------------------------------------------------------ les 20 questions', 'const NIVEAUX = {',
'''// ------------------------------------------------------------------------------ la banque
// Les 142 QCM du fichier « Test de positionnement FLE – A1 à B1 – 200 questions » (les 58 productions écrites
// et orales, corrigées à la main ou par IA, n'entrent pas dans ce test automatique). Chaque question garde ses tags :
// n = N° (ordre de difficulté dans son épreuve), niveau CECRL, épreuve (CO, CE, EE, EO), tag grammaire-lexique,
// composante détaillée, critère du Tableau 3 CECRL, et « groupe » (questions qui portent sur le même document ou le
// même enregistrement). « bonne » est l'indice de la bonne réponse dans la liste du fichier (A = 0) ; l'ordre affiché
// est mélangé, comme le fichier le permet. Le reste dit comment présenter le support.
const BANQUE = ''' + json.dumps(banque, ensure_ascii=False, separators=(',', ':')) + ''';

''')
rep('''  A1: { teinte: "cyan", seuil: 5, total: 7, nom: "Découverte" },
  A2: { teinte: "vert", seuil: 5, total: 7, nom: "Survie" },
  B1: { teinte: "rose", seuil: 4, total: 6, nom: "Seuil" },''', '''  A1: { teinte: "cyan", nom: "Découverte" },
  A2: { teinte: "vert", nom: "Survie" },
  B1: { teinte: "rose", nom: "Seuil" },''')

# ---------- tous les sons : enregistrements (une fois chacun), consignes A1 lues, pictogrammes
audio = {}
for q in banque:
    if q.get('audio'): audio[q['audio']] = f"{SONS_DEPOT}/{q['audio']}.mp3"
for cle, ident in cles.items(): audio[cle] = f"{RACINE}/sons/mp3/{ident}.mp3"
entre('// Sons enregistrés avec ElevenLabs', 'const ETOILE =', '''// Sons enregistrés avec ElevenLabs (modèle Multilingual v2), débit 0,85 en A1, 0,95 en A2, 1 en B1.
// Clé = identifiant de l'enregistrement (partagé par les questions d'un même groupe), « q: » + texte pour une
// consigne A1 lue, « p: » + libellé pour un pictogramme lu.
const AUDIO = {
''' + ',\n'.join(f'  {json.dumps(k, ensure_ascii=False)}: "{b64(f)}"' for k, f in audio.items()) + '''
};
''')
print(len(audio), 'sons intégrés')

# ---------- l'état et le moteur adaptatif
rep('''let etat = { ecran: "accueil", i: 0, ordres: [], reponses: [], ecoutes: {}, lus: {} };
function nouveauTest() { etat = { ecran: "question", i: 0, ordres: QUESTIONS.map(q => melanger(q.choix.map((_, k) => k))), reponses: Array(QUESTIONS.length).fill(undefined), ecoutes: {}, lus: {} }; }''',
'''// ------------------------------------------------------------------------------ le moteur adaptatif
// Le fichier dit : « Dans chaque onglet, les questions sont classées par difficulté croissante (colonne N°).
// Le moteur adaptatif peut piocher par niveau. » Il ne fixe pas les règles ; celles-ci sont à valider :
// - on commence en A1 ; chaque niveau est un palier de 7 questions piochées dans la banque de ce niveau :
//   2 de compréhension orale, 2 de compréhension écrite, 2 d'expression écrite, 1 d'interaction orale (QCM) ;
//   dans chaque épreuve, l'une dans la moitié la plus facile du niveau, l'autre dans la plus difficile (N°) ;
//   le palier se joue du plus facile au plus difficile ;
// - 5 bonnes réponses sur 7 valident le niveau : on passe au suivant. Le palier s'arrête dès que la décision
//   est sûre (5 bonnes : validé ; 3 erreurs ou « Je ne sais pas » : non validé, et le test s'arrête) ;
// - jamais deux questions sur le même document ou le même enregistrement dans un même test.
// Niveau atteint = dernier palier validé. Le sous-score par épreuve et par tag grammaire-lexique (recommandé par le
// fichier) est calculé dans etat.diagnostic, pour le formateur ; il n'est pas affiché au candidat.
const ORDRE = ["A1", "A2", "B1"], SEUIL = 5, PAR_PALIER = 7;
const PAR_ID = Object.fromEntries(BANQUE.map(q => [q.id, q]));
function tirerPalier(niveau, groupesExclus) {
  const pris = [], groupes = new Set(groupesExclus);
  const prendre = (liste) => { const libres = melanger(liste.filter(q => !groupes.has(q.groupe))); if (!libres.length) return false; groupes.add(libres[0].groupe); pris.push(libres[0].id); return true; };
  for (const ep of ["CO", "CE", "EE"]) {
    const liste = BANQUE.filter(q => q.niveau === niveau && q.epreuve === ep).sort((a, b) => a.n - b.n), m = Math.ceil(liste.length / 2);
    prendre(liste.slice(0, m)) || prendre(liste);
    prendre(liste.slice(m)) || prendre(liste);
  }
  prendre(BANQUE.filter(q => q.niveau === niveau && q.epreuve === "EO"));
  return pris.sort((a, b) => PAR_ID[a].n - PAR_ID[b].n);
}
let etat = { ecran: "accueil" };
function nouveauTest() {
  etat = { ecran: "question", niveau: "A1", palier: tirerPalier("A1", []), k: 0, reponses: {}, ordres: {}, ecoutes: {}, lus: {}, valides: [], vus: [] };
  preparerOrdres();
}
function preparerOrdres() { etat.palier.forEach(id => { if (!etat.ordres[id]) etat.ordres[id] = melanger([0, 1, 2, 3]); }); }
const qActuelle = () => PAR_ID[etat.palier[etat.k]];
function bilan() {
  const faites = etat.palier.filter(id => id in etat.reponses), justes = faites.filter(id => etat.reponses[id] === PAR_ID[id].bonne).length;
  return { justes, erreurs: faites.length - justes };
}''')
entre('function haut(k) {', 'function avancerJauge() {}', '''function haut() {
  return `<div class="haut">
    <button class="rond" type="button" id="fermer" aria-label="Quitter le test">${ICONE.fermer}</button>
    <div class="progression">${tuile(etat.niveau, NIVEAUX[etat.niveau].teinte, "puce")}<div class="cases" role="img" aria-label="Niveau ${etat.niveau}, question ${etat.k + 1}">${etat.palier.map((_, m) => `<i class="${m < etat.k ? "fait" : m === etat.k ? "ici" : ""}"></i>`).join("")}</div></div>
    ${boutonSon()}
  </div>`;
}
''')

# ---------- la présentation des supports
entre('function visuel(q) {', 'function ecranQuestion() {', r'''const trous = (phrase) => phrase.split("______").map((p, k, t) => echap(p) + (k < t.length - 1 ? `<span class="trou" data-trou="${k}">&nbsp;</span>` : "")).join("");
function visuel(q) {
  const reste = 2 - (etat.ecoutes[q.id] || 0);
  const etiq = q.etiquette ? `<span class="etiquette">${q.etiquette}</span>` : "";
  switch (q.t) {
    case "panneau":
      if (q.style === "sortie") return `${etiq}<b class="panneau sortie"><span aria-hidden="true">🏃</span>${q.texte}</b>`;
      if (q.style === "interdit") return `${etiq}<b class="panneau interdit"><span class="rond-interdit" aria-hidden="true">🚬</span>${q.texte}</b>`;
      return `${etiq}<b class="panneau">${q.texte}</b>`;
    case "prix": return `<div class="prix"><span class="trou-prix" aria-hidden="true"></span><strong>${q.produit}</strong><b>${q.prix}</b><small>${q.unite}</small></div>`;
    case "affiche": return `<div class="affiche"><strong>${q.titre}</strong>${q.lignes.map(l => `<p>${echap(l)}</p>`).join("")}</div>`;
    case "menu": return `<div class="menu"><strong>${q.titre}</strong><em>${q.jour}</em><p>${q.plats.join(" · ")}</p></div>`;
    case "plaque": return `${etiq}<div class="plaque">${q.lignes.map((l, k) => k ? `<p>${echap(l)}</p>` : `<strong>${echap(l)}</strong>`).join("")}</div>`;
    case "sms": return `<div class="sms">${etiq}<p>${echap(q.texte)}</p></div>`;
    case "court": return `${etiq}<div class="papier-court${q.liste ? " liste" : ""}">${q.titre ? `<strong>${q.titre}</strong>` : ""}${q.liste ? `<ul>${q.lignes.map(l => `<li>${echap(l)}</li>`).join("")}</ul>` : q.lignes.map(l => `<p>${echap(l)}</p>`).join("")}</div>`;
    case "trou": return `${etiq}<div class="phrase">${trous(q.phrase)}</div>${q.indice ? `<span class="indice">${q.indice}</span>` : ""}`;
    case "transformer": return `<span class="fleche">${q.vers}</span><b class="grande">${echap(q.phrase)}</b>`;
    case "mots": return `${etiq}<div class="mots">${q.mots.map(m => `<span>${echap(m)}</span>`).join("")}</div>`;
    case "enonce":
      if (q.citation && q.avant && q.apres && q.citation.length <= 6) return `<p class="situation">${echap(q.avant)} <b class="cite">${echap(q.citation)}</b> ${echap(q.apres)}</p>`;
      return `${q.avant ? `<p class="situation">${echap(q.avant)}</p>` : ""}${q.citation ? `<b class="grande">${trous(q.citation)}</b>` : ""}${q.apres ? `<p class="situation petit">${echap(q.apres)}</p>` : ""}`;
    case "replique": return `${etiq}<div class="replique"><img class="visage" src="${PHOTOS[q.photo]}" alt="" width="84" height="84"><div class="bulle vocale">${audible(q.audio)
      ? `<button class="mini-lecteur" type="button" id="redire" aria-label="Écouter ce qu'on vous dit">${ICONE.jouer}</button><span class="vague sombre" id="vague-replique" aria-hidden="true">${"<i></i>".repeat(14)}</span>`
      : `<strong>« ${q.replique} »</strong>`}</div></div>`;
    case "situation": return `<span class="scene-emoji" aria-hidden="true">${q.emoji}</span>${etiq}<p class="situation">${q.texte}</p>${audible(q.audio) ? `<button class="mini-son" type="button" id="dire-situation">${ICONE.son} Écouter</button>` : ""}`;
    case "document": return `<div class="doc-mini"><span class="icone-doc" aria-hidden="true">${q.emoji}</span><strong>${q.titre}</strong><button class="pilule" type="button" id="relire">${ICONE.oeil} Relire</button></div>`;
    case "ecoute":
      if (!audible(q.audio)) return `<div class="transcription"><span style="color:var(--encre-douce);font-size:12.5px">Pas de son sur cet appareil : lisez le texte.</span>${q.script.map(l => `<p style="margin:4px 0 0">${echap(l)}</p>`).join("")}</div>`;
      return `${etiq}<button class="lecteur" type="button" id="lecteur" aria-label="Écouter l'enregistrement (${reste} écoute${reste > 1 ? "s" : ""} possible${reste > 1 ? "s" : ""})" ${reste <= 0 ? "disabled" : ""}>${ICONE.jouer}<span class="pastille" id="pastille" aria-hidden="true" ${reste <= 0 ? "hidden" : ""}>${reste}</span></button><span class="vague" id="vague" aria-hidden="true">${"<i></i>".repeat(9)}</span><span class="etiquette" id="reste">${reste === 2 ? "Touchez pour écouter" : reste === 1 ? "Encore 1 écoute" : "Plus d'écoute"}</span>`;
  }
  return "";
}
''')

# ---------- l'écran d'une question
rep('''function ecranQuestion() {
  const k = etat.i, q = QUESTIONS[k];
  if (q.type === "document" && !etat.lus[q.id]) return ecranLecture(q, k);
  const ordre = etat.ordres[k], choisi = etat.reponses[k];
  const alveoles = q.choix.every(x => x.length <= 10);''', '''function ecranQuestion() {
  const q = qActuelle();
  if (q.t === "document" && !etat.lus[q.id]) return ecranLecture(q);
  const ordre = etat.ordres[q.id], choisi = etat.reponses[q.id];
  const alveoles = !!q.pictos || q.choix.every(x => x.length <= 10);
  const libelle = (o) => q.pictos ? `<span class="picto" aria-hidden="true">${q.pictos[o]}</span>${echap(q.choix[o])}` : echap(q.choix[o]);''')
rep('''    ${haut(k)}
    <div class="defile">
      <div class="visuel">${visuel(q)}</div>''', '''    ${haut()}
    <div class="defile">
      ${q.t === "aucun" ? "" : `<div class="visuel">${visuel(q)}</div>`}''')
rep('''      <div class="reponses ${alveoles ? "alveoles" : "bonbons"}" role="radiogroup" aria-labelledby="question">''', '''      <div class="reponses ${alveoles ? "alveoles" : "bonbons"}${q.pictos ? " pictos" : ""}" role="radiogroup" aria-labelledby="question">''')
rep('''          ? tuile(echap(q.choix[o]), "blanc", "rep",''', '''          ? tuile(libelle(o), "blanc", "rep",''')
rep('''  const remplirTrou = (o) => { const t = $("#trou"); if (t) { t.textContent = q.choix[o]; t.classList.remove("rempli"); void t.offsetWidth; t.classList.add("rempli"); } };
  appli.querySelectorAll(".rep").forEach(t => t.addEventListener("click", () => {
    const o = +t.dataset.o; etat.reponses[k] = o;''', '''  // la réponse choisie remplit le ou les trous (« plus… que », « suis arrivé / pleuvait » : un morceau par trou)
  const remplirTrou = (o) => {
    const t = [...appli.querySelectorAll(".trou")]; if (!t.length) return;
    const morceaux = t.length > 1 ? q.choix[o].split(/\\s*[…\\/]\\s*/) : [q.choix[o]];
    if (morceaux.length !== t.length) return;
    t.forEach((x, k) => { x.textContent = morceaux[k]; x.classList.remove("rempli"); void x.offsetWidth; x.classList.add("rempli"); });
  };
  appli.querySelectorAll(".rep").forEach(t => t.addEventListener("click", () => {
    const o = +t.dataset.o; etat.reponses[q.id] = o;''')
rep('''  $("#passer").addEventListener("click", () => { etat.reponses[k] = null; SONS.passer(); suivante(120); });''', '''  $("#passer").addEventListener("click", () => { etat.reponses[q.id] = null; SONS.passer(); suivante(120); });''')
rep('''    jouer(q.id, q.script, lecteur, $("#vague"), () => {''', '''    jouer(q.audio, q.script, lecteur, $("#vague"), () => {''')
rep('''}, { voix: q.voix, debit: DEBIT[q.niveau] });
  });''', '''}, { debit: DEBIT[q.niveau] });
  });''')
rep('''redire.addEventListener("click", () => jouer(q.id, [q.replique], redire, $("#vague-replique"), null, { voix: q.voix, debit: DEBIT[q.niveau] }));''',
    '''redire.addEventListener("click", () => jouer(q.audio, [q.replique], redire, $("#vague-replique"), null, { voix: q.photo === "homme" ? "h" : "f", debit: DEBIT[q.niveau] }));''')
rep('''direSituation.addEventListener("click", () => jouer(q.id + "-consigne", [q.texte], direSituation, null, null, { voix: "f", debit: DEBIT[q.niveau] }));''',
    '''direSituation.addEventListener("click", () => jouer(q.audio, [q.texte], direSituation, null, null, { voix: "f", debit: DEBIT[q.niveau] }));''')
# A1 : la consigne lue, puis les pictogrammes dans l'ordre affiché
rep('''lireConsigne.addEventListener("click", () => jouer("q:" + q.question, [q.question], lireConsigne, null, null, { voix: "f", debit: DEBIT.A1 }));''',
    '''lireConsigne.addEventListener("click", () => {
    const suite = ["q:" + q.question, ...(q.pictos ? ordre.map(o => "p:" + q.choix[o]) : [])];
    const un = (k) => k < suite.length && jouer(suite[k], [suite[k].slice(2)], lireConsigne, null, () => setTimeout(() => un(k + 1), 250), { voix: "f", debit: DEBIT.A1 });
    un(0);
  });''')
rep('''function ecranLecture(q, k) {
  poser(`<section class="ecran" aria-labelledby="t-doc">
    ${haut(k)}''', '''function ecranLecture(q) {
  poser(`<section class="ecran" aria-labelledby="t-doc">
    ${haut()}''')

# ---------- la suite : décision du palier
entre('function suivante(delai) {', 'function feuille(contenu) {', '''function suivante(delai) {
  setTimeout(() => {
    const { justes, erreurs } = bilan(), i = ORDRE.indexOf(etat.niveau);
    if (justes >= SEUIL) {                                         // niveau validé
      etat.valides.push(etat.niveau);
      if (i === ORDRE.length - 1) { etat.ecran = "resultat"; return afficher(); }
      etat.vus.push(...etat.palier);
      etat.precedent = etat.niveau; etat.niveau = ORDRE[i + 1];
      etat.palier = tirerPalier(etat.niveau, etat.vus.map(id => PAR_ID[id].groupe)); etat.k = 0; preparerOrdres();
      etat.ecran = "palier"; return afficher();
    }
    if (erreurs > PAR_PALIER - SEUIL || etat.k + 1 >= etat.palier.length) { etat.ecran = "resultat"; return afficher(); }   // le niveau ne peut plus être validé
    etat.k++; afficher();
  }, delai);
}
''')
rep('''  const fini = QUESTIONS[etat.i - 1].niveau, suivant = QUESTIONS[etat.i].niveau;''', '''  const fini = etat.precedent, suivant = etat.niveau;''')
rep('''<p>Niveau ${fini} terminé. On passe au niveau ${suivant}.</p>''', '''<p>Niveau ${fini} validé. On passe au niveau ${suivant}.</p>''')

# ---------- le résultat et le diagnostic
entre('function calculer() {', 'function ecranResultat() {', '''function calculer() {
  const faites = [...etat.vus, ...etat.palier].filter(id => id in etat.reponses), diagnostic = { epreuve: {}, tag: {} };
  faites.forEach(id => { const q = PAR_ID[id], juste = etat.reponses[id] === q.bonne;
    for (const [axe, cle] of [["epreuve", q.epreuve], ["tag", q.tag]]) { const d = (diagnostic[axe][cle] ??= { juste: 0, total: 0 }); d.total++; d.juste += juste; } });
  etat.diagnostic = diagnostic;
  return { niveau: etat.valides[etat.valides.length - 1] || null, diagnostic };
}
''')
rep('''const depart = (data) => { if (data && data.etat && data.etat.ordres) etat = { lus: {}, ...data.etat }; afficher(); };''',
    '''const depart = (data) => { if (data && data.etat && (data.etat.ecran === "accueil" || data.etat.palier)) etat = data.etat; afficher(); };''')

# ---------- l'accueil
rep('''<p class="sous-titre">20 questions · 10 minutes</p>''', '''<p class="sous-titre">Test adaptatif · 10 minutes environ</p>''')
rep('''Sans dictionnaire. Votre niveau s'affiche à la fin.''', '''Les questions s'adaptent à vos réponses. Votre niveau s'affiche à la fin.''')
rep('''Activez le son : certaines questions s'écoutent.''', '''Activez le son. Sans dictionnaire.''')

# ---------- styles des nouveaux supports
rep('''/* ------------------------------------------------------------ les réponses */''', '''.progression { display: flex; align-items: center; justify-content: center; gap: 10px; min-width: 0; }
.progression .tuile.puce { --w: 42px; }
.progression .puce .mot { font-size: 14px; padding: 0; }
.progression .cases { gap: 5px; }
.progression .cases i { flex: 0 1 14px; height: 12px; }
.panneau.sortie { display: inline-flex; align-items: center; gap: 12px; background: #11905a; color: #fff; border-color: #0b6a42; transform: none; }
.panneau.sortie span { font-size: 30px; }
.panneau.interdit { display: grid; justify-items: center; gap: 8px; color: #d0193f; border-color: #fff; transform: none; }
.rond-interdit { position: relative; display: grid; place-items: center; width: 64px; height: 64px; border: 6px solid #d0193f; border-radius: 50%; font-size: 30px; }
.rond-interdit::after { content: ""; position: absolute; width: 6px; height: 64px; background: #d0193f; transform: rotate(45deg); }
.prix { position: relative; display: grid; justify-items: center; gap: 2px; min-width: 170px; padding: 18px 24px 16px; border-radius: 14px; background: #fff7d6; color: var(--encre); box-shadow: 0 5px 0 #e9cf7a; transform: rotate(-3deg); }
.prix strong { font: 800 20px/1.1 var(--titre); }
.prix b { font: 800 34px/1 var(--titre); color: #d0193f; }
.prix small { font-size: 14px; font-weight: 800; }
.trou-prix { position: absolute; top: 8px; width: 12px; height: 12px; border-radius: 50%; background: var(--fond-2); }
.affiche, .menu, .papier-court { justify-self: stretch; display: grid; gap: 4px; padding: 0 0 14px; overflow: hidden; border-radius: 16px; background: #fff; color: var(--encre); text-align: center; box-shadow: 0 5px 0 var(--blanc-levre); }
.affiche strong, .menu strong { padding: 10px; background: #26357a; color: #fff; font: 800 20px/1.1 var(--titre); letter-spacing: .08em; }
.affiche p, .menu p { margin: 4px 14px 0; font-size: 16px; font-weight: 800; }
.menu strong { background: #2f7d4f; letter-spacing: .02em; }
.menu em { margin-top: 6px; font-style: normal; font-weight: 900; color: var(--encre-douce); }
.papier-court { padding: 14px 18px; text-align: left; }
.papier-court strong { font: 800 18px/1.2 var(--titre); text-transform: none; }
.papier-court p { margin: 0; font-size: 16px; font-weight: 700; }
.papier-court ul { margin: 2px 0 0; padding-left: 20px; font-size: 16px; font-weight: 700; }
.plaque { display: grid; gap: 2px; padding: 16px 26px; border-radius: 10px; color: #3c3f46; text-align: center; background: linear-gradient(160deg, #f4f5f7, #c9ccd3 55%, #eef0f3); box-shadow: inset 0 0 0 2px #a9adb6, 0 5px 0 rgba(40, 14, 140, .25); }
.plaque strong { font: 800 20px/1.2 var(--titre); }
.plaque p { margin: 0; font-size: 15px; font-weight: 800; }
.mots { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.mots span { padding: 8px 16px; border-radius: 12px; background: #fff; color: var(--encre); font: 800 20px/1.2 var(--texte); box-shadow: 0 4px 0 var(--blanc-levre); }
.situation.petit { font-size: 15px; font-weight: 700; }
.cite { padding: 0 8px; border-radius: 8px; background: #fff; color: var(--encre); }
.pictos .mot { font-size: 15px; line-height: 1.15; }
.picto { display: block; font-size: 30px; line-height: 1.1; }

/* ------------------------------------------------------------ les réponses */''')
open(p, 'w', encoding='utf-8').write(s)
print('ok', len(s) // 1024, 'Ko')
