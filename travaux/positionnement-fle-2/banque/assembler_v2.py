"""Assemble la version 2 du test à partir de la version 1 (mêmes écrans, même moteur adaptatif) :
banque du PDF « EVAL POSITIONNEMENT v2 », sons d'origine, images des réponses, nouveaux types de réponses.
Produit test-positionnement.html (artifact, tout intégré) et index.html (page web, sons en fichiers)."""
import json, base64, os, sys
ICI = os.path.dirname(os.path.abspath(__file__))          # travaux/positionnement-fle-2/banque
RACINE = os.path.dirname(ICI)                              # travaux/positionnement-fle-2
D = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else RACINE
os.makedirs(D, exist_ok=True)
s = open(os.path.join(RACINE, '..', 'positionnement-fle', 'test-positionnement.html'), encoding='utf-8').read()  # la version 1
B = json.load(open(f'{ICI}/banque-v2.json')); cles = json.load(open(f'{ICI}/cles-v2.json'))
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (old[:100], s.count(old))
    s = s.replace(old, new)
def entre(debut, fin, nouveau):
    global s
    a = s.index(debut); b = s.index(fin, a); s = s[:a] + nouveau + s[b:]
b64 = lambda f, t: f"data:{t};base64," + base64.b64encode(open(f, 'rb').read()).decode()

# ---------- banque
entre('// ------------------------------------------------------------------------------ la banque', 'const NIVEAUX = {', '''// ------------------------------------------------------------------------------ la banque (version 2)
// Questions du PDF « EVAL POSITIONNEMENT v2 » (export PowerPoint). Bonne réponse = celle écrite en vert, ou l'image
// encadrée en vert. Chaque question garde ses tags : niveau, comp (CO compréhension orale, CE compréhension écrite,
// EE expression écrite, EO expression orale, LG langue : grammaire, conjugaison, vocabulaire), tag (l'étiquette du PDF),
// page du PDF, groupe (questions sur le même document). « deduite » : réponse non marquée dans le PDF, déduite.
// Types de réponse : choix (alvéoles ou pastilles), images, phrases à écouter (audios), mots à remettre dans l'ordre
// (ordre), réponse à écrire (saisie), mot à écrire en touchant des lettres (lettres : expression écrite, mots courts).
const BANQUE = ''' + json.dumps(B, ensure_ascii=False, separators=(',', ':')) + ''';

''')

# ---------- sons et images
audio_fichiers = {f"o{k:02d}": (f"{RACINE}/sons/o{k:02d}.mp3", f"sons/o{k:02d}.mp3") for k in range(1, 12)}
for cle, ident in cles.items():
    rel = f"sons/{'poste' if ident.startswith('poste') else 'consignes'}/{ident}.mp3"
    audio_fichiers[cle] = (f"{RACINE}/{rel}", rel)
images = sorted({i for d in B for i in d.get('images', [])} | {d[k] for d in B for k in ('img', 'photo') if d.get(k)})
bloc_images = 'const IMAGES = {\n' + ',\n'.join(f'  {json.dumps(i)}: "{b64(f"{ICI}/img/{i}.webp", "image/webp")}"' for i in images) + '\n};\n'
entre('// Sons enregistrés avec ElevenLabs', 'const ETOILE =', '''// Sons : les enregistrements d'origine du PDF (o01 à o11, volume égalisé), les consignes A1 lues (« q: » + texte) et les
// trois phrases de la question de la poste, générées avec ElevenLabs.
const AUDIO = __AUDIO__;
// Images : photos des réponses et affiche, tirées du PDF ; photos de scène fournies (appartement, cinéma, Abidjan) ;
// Marie : photo Unsplash de Janko Ferlič (pMJKJp0aG4M, licence Unsplash).
''' + bloc_images)

# ---------- le moteur adaptatif, adapté à la banque v2
entre('// ------------------------------------------------------------------------------ le moteur adaptatif', 'let etat = { ecran: "accueil" };', '''// ------------------------------------------------------------------------------ le moteur adaptatif
// Même moteur que la version 1 :
// - on commence en A1 ; chaque niveau est un palier de 7 questions piochées dans la banque de ce niveau : d'abord une
//   question de chaque compétence présente au niveau (CO, CE, EE, EO, LG), puis on complète en équilibrant ;
// - 70 % de bonnes réponses valident le niveau (5 sur 7) et ouvrent le suivant ; le palier se joue en entier, et
//   s'arrête plus tôt quand le niveau ne peut plus être validé (3 erreurs ou « Je ne sais pas ») : le test s'arrête ;
// - jamais deux questions sur le même document dans un même palier.
// Niveau atteint = dernier palier validé. Le diagnostic par compétence et par tag est calculé (etat.diagnostic).
const ORDRE = ["A1", "A2", "B1"], PAR_PALIER = 7, TAUX = .7, COMPS = ["CO", "CE", "EE", "EO", "LG"];
const PAR_ID = Object.fromEntries(BANQUE.map(q => [q.id, q]));
function tirerPalier(niveau, groupesExclus) {
  const groupes = new Set(groupesExclus), pris = [], compte = {};
  const libres = (c) => BANQUE.filter(q => q.niveau === niveau && q.comp === c && !groupes.has(q.groupe));
  const prendre = (q) => { pris.push(q.id); groupes.add(q.groupe); compte[q.comp] = (compte[q.comp] || 0) + 1; };
  for (const c of COMPS) { const l = libres(c); if (l.length) prendre(melanger(l)[0]); }
  while (pris.length < PAR_PALIER) {
    const dispo = COMPS.filter(c => libres(c).length); if (!dispo.length) break;
    const mini = Math.min(...dispo.map(c => compte[c] || 0));
    prendre(melanger(libres(melanger(dispo.filter(c => (compte[c] || 0) === mini))[0]))[0]);
  }
  return melanger(pris);
}
const seuil = () => Math.ceil(etat.palier.length * TAUX);
const normaliser = (v) => (v || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[’`]/g, "'").replace(/[.!?;,]+$/g, "").replace(/\\s+/g, " ").trim();
const accepte = (liste, v) => { const n = normaliser(v); return !!n && liste.some(a => a.startsWith("re:") ? new RegExp(a.slice(3)).test(n) : normaliser(a) === n); };
function estJuste(q, r) {
  if (r === null || r === undefined) return false;
  if (q.saisie) return q.saisie.every((c, k) => accepte(c.accepte, r[k]));
  if (q.lettres) return Array.isArray(r) && normaliser(r.map(i => q.lettres[i]).join("")) === normaliser(q.choix[q.bonne]);
  if (q.t === "ordre") return Array.isArray(r) && r.length === q.ordre.length && r.every((m, k) => m === q.ordre[k]);
  return r === q.bonne;
}
''')
rep('''function preparerOrdres() { etat.palier.forEach(id => { if (!etat.ordres[id]) etat.ordres[id] = melanger([0, 1, 2, 3]); }); }''',
    '''function preparerOrdres() { etat.palier.forEach(id => { if (!etat.ordres[id]) etat.ordres[id] = melanger((PAR_ID[id].choix || []).map((_, k) => k)); }); }''')
rep('''  const faites = etat.palier.filter(id => id in etat.reponses), justes = faites.filter(id => etat.reponses[id] === PAR_ID[id].bonne).length;''',
    '''  const faites = etat.palier.filter(id => id in etat.reponses), justes = faites.filter(id => estJuste(PAR_ID[id], etat.reponses[id])).length;''')
rep('''    if (erreurs > PAR_PALIER - SEUIL) { etat.ecran = "resultat"; return afficher(); }''', '''    if (erreurs > etat.palier.length - seuil()) { etat.ecran = "resultat"; return afficher(); }''')
rep('''    if (justes >= SEUIL) {''', '''    if (justes >= seuil()) {''')
entre('function calculer() {', 'function ecranResultat() {', '''function calculer() {
  const faites = [...etat.vus, ...etat.palier].filter(id => id in etat.reponses), diagnostic = { competence: {}, tag: {} };
  faites.forEach(id => { const q = PAR_ID[id], juste = estJuste(q, etat.reponses[id]);
    for (const [axe, cle] of [["competence", q.comp], ["tag", q.tag]]) { const d = (diagnostic[axe][cle] ??= { juste: 0, total: 0 }); d.total++; d.juste += juste; } });
  etat.diagnostic = diagnostic;
  return { niveau: etat.valides[etat.valides.length - 1] || null, diagnostic };
}
''')

# ---------- documents (avec tableau) et supports
entre('function papier(q) {', 'const trous =', r'''function papier(q) {
  const corps = q.tableau
    ? `<div class="tableau-defile"><table class="edt" lang="fr">${q.tableau.map((l, r) => `<tr>${l.map((c, k) => r === 0 || k === 0 ? `<th>${echap(c)}</th>` : `<td>${echap(c)}</td>`).join("")}</tr>`).join("")}</table></div>`
    : q.lignes.map(l => `<p>${echap(l)}</p>`).join("");
  return `<div class="papier ${q.style || ""}"><div class="papier-tete">${q.photo ? `<span class="avec-photo" aria-hidden="true"><img src="${IMAGES[q.photo]}" alt=""></span>` : `<span aria-hidden="true">${q.emoji}</span>`}<div><strong>${q.titre}</strong><small>Prenez le temps de lire</small></div></div>${corps}</div>`;
}
''')
entre('function visuel(q) {', 'function ecranQuestion() {', r'''function visuel(q) {
  const reste = 2 - (etat.ecoutes[q.id] || 0);
  const etiq = q.etiquette ? `<span class="etiquette">${q.etiquette}</span>` : "";
  const ctx = q.contexte ? `<p class="contexte">${echap(q.contexte)}</p>` : "";
  switch (q.t) {
    case "sms": return `${ctx}<div class="sms">${etiq}<p>${trous(q.texte)}</p></div>`;
    case "court": return `${ctx}${etiq}<div class="papier-court">${q.titre ? `<strong>${q.titre}</strong>` : ""}${q.lignes.map(l => `<p>${echap(l)}</p>`).join("")}</div>`;
    case "trou": return `${ctx}${etiq}<div class="phrase">${trous(q.phrase)}</div>${q.indice ? `<span class="indice">${q.indice}</span>` : ""}`;
    case "ordre": return `${ctx}<div class="phrase ordre-phrase">${trous(q.avant + " " + q.ordre.map(() => "______").join(" ") + " " + q.apres)}</div>`;
    case "image": return `${ctx}<button class="image-support" type="button" id="agrandir" aria-label="Agrandir l'image"><img src="${IMAGES[q.img]}" alt="${echap(q.alt || "")}"><span class="loupe" aria-hidden="true">${ICONE.loupe}</span></button>`;
    case "situation": return `${q.photo ? `<img class="photo-scene" src="${IMAGES[q.photo]}" alt="">` : `<span class="scene-emoji" aria-hidden="true">${q.emoji}</span>`}${etiq}<p class="situation">${q.texte}</p>`;
    case "document": return `${ctx}<div class="doc-mini">${q.photo ? `<span class="icone-doc avec-photo" aria-hidden="true"><img src="${IMAGES[q.photo]}" alt=""></span>` : `<span class="icone-doc" aria-hidden="true">${q.emoji}</span>`}<strong>${q.titre}</strong><button class="pilule" type="button" id="relire">${ICONE.oeil} Relire</button></div>`;
    case "ecoute":
      return `${ctx}<button class="lecteur" type="button" id="lecteur" aria-label="${reste > 0 ? `Écouter l'enregistrement (${reste} écoute${reste > 1 ? "s" : ""} possible${reste > 1 ? "s" : ""})` : "Plus d'écoute possible"}" ${reste <= 0 ? "disabled" : ""}>${ICONE.jouer}<span class="vague" id="vague" aria-hidden="true">${"<i></i>".repeat(5)}</span><span class="pastille" id="pastille" aria-hidden="true" ${reste <= 0 ? "hidden" : ""}>${reste}</span></button>${q.photo ? `<img class="photo-scene" src="${IMAGES[q.photo]}" alt="">` : ""}${q.phrase ? `<div class="phrase petite">${trous(q.phrase)}</div>` : ""}`;
  }
  return "";
}
''')
entre('function ecranQuestion() {', 'function ecranLecture(q) {', r'''function ecranQuestion() {
  const q = qActuelle();
  if (q.audio && AUDIO[q.audio] && !AUDIO[q.audio].startsWith("data:")) { const p = new Audio(); p.preload = "auto"; p.src = AUDIO[q.audio]; }
  if (q.t === "document" && !etat.lus[q.id]) return ecranLecture(q);
  const ordre = etat.ordres[q.id], choisi = etat.reponses[q.id];
  const pret = (r) => q.lettres ? Array.isArray(r) && r.length > 0 : q.saisie ? Array.isArray(r) && r.length === q.saisie.length && r.every(v => (v || "").trim()) : q.t === "ordre" ? Array.isArray(r) && r.length === q.ordre.length : r !== undefined && r !== null;
  let reponses;
  if (q.lettres) {
    const ol = (etat.ordres["l:" + q.id] ??= melanger(q.lettres.map((_, k) => k)));
    reponses = `<div class="reponses ecrire">${q.t === "aucun" ? `<div class="mot-ecrit"><span class="trou" aria-live="polite">&nbsp;</span></div>` : ""}<div class="lettres" role="group" aria-label="Lettres à toucher pour écrire le mot">${ol.map((k, n) => tuile(echap(q.lettres[k]), "blanc", "lettre", `type="button" data-l="${k}" aria-label="${echap(q.lettres[k])}" style="--n:${n}"`, "button")).join("")}${tuile(ICONE.effacer, "rose", "effacer", `type="button" aria-label="Effacer la dernière lettre" style="--n:${ol.length}"`, "button")}</div></div>`;
  }
  else if (q.saisie) reponses = `<div class="reponses saisies">${q.saisie.map((c, k) => `<label class="champ">${c.etiquette ? `<span>${c.etiquette}</span>` : ""}<input type="text" data-k="${k}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Écrivez ici" value="${echap((Array.isArray(choisi) && choisi[k]) || "")}"></label>`).join("")}</div>`;
  else if (q.t === "ordre") reponses = `<div class="reponses mots-a-placer">${q.mots.map((m, k) => `<button type="button" class="mot-dispo" data-m="${k}">${echap(m)}</button>`).join("")}</div>`;
  else if (q.images) reponses = `<div class="reponses images" role="radiogroup" aria-labelledby="question">${ordre.map((o, n) => `<button class="rep rep-image" type="button" role="radio" aria-checked="${choisi === o}" data-o="${o}" style="--n:${n}" aria-label="${echap(q.choix[o])}"><img src="${IMAGES[q.images[o]]}" alt=""></button>`).join("")}</div>`;
  else if (q.audios) reponses = `<div class="reponses bonbons" role="radiogroup" aria-labelledby="question">${ordre.map((o, n) => `<div class="ligne-audio" style="--n:${n}"><button class="ecouter-rep" type="button" data-a="${q.audios[o]}" aria-label="Écouter la phrase">${ICONE.jouer}</button><button class="rep" type="button" role="radio" aria-checked="${choisi === o}" data-o="${o}">${MARQUE}<span>${echap(q.choix[o])}</span></button></div>`).join("")}</div>`;
  else {
    const alveoles = q.choix.every(x => x.length <= 10);
    reponses = `<div class="reponses ${alveoles ? "alveoles" : "bonbons"}${alveoles && Math.max(...q.choix.map(c => c.length)) >= 9 ? " longs" : ""}" data-n="${q.choix.length}" role="radiogroup" aria-labelledby="question">
        ${ordre.map((o, n) => alveoles
          ? tuile(echap(q.choix[o]), "blanc", "rep", `type="button" role="radio" aria-checked="${choisi === o}" data-o="${o}" style="--n:${n}"`, "button")
          : `<button class="rep" type="button" role="radio" aria-checked="${choisi === o}" data-o="${o}" style="--n:${n}">${MARQUE}<span>${echap(q.choix[o])}</span></button>`).join("")}
      </div>`;
  }
  poser(`<section class="ecran ecran-question" aria-labelledby="question">
    ${haut()}
    <div class="defile">
      ${q.t === "aucun" ? "" : `<div class="visuel${q.t === "ecoute" && q.photo ? " photo-fond" : ""}">${visuel(q)}</div>`}
      <h2 class="question" id="question">${echap(q.question)}${q.niveau === "A1" && audible("q:" + q.question) ? ` <button class="lire-consigne" type="button" id="lire-consigne" aria-label="Entendre la question">${ICONE.son}</button>` : ""}</h2>
      ${reponses}
    </div>
    <div class="bas">${bouton("Suivant", "vert", `id="valider" ${pret(choisi) ? "" : "disabled"}`)}<button class="lien" type="button" id="passer">Je ne sais pas</button></div>
  </section>`);
  brancherSon(); avancerJauge();
  const valider = $("#valider");
  // le ou les trous se remplissent avec la réponse (« plus… que » : un morceau par trou)
  const remplir = (textes) => {
    const t = [...appli.querySelectorAll(".visuel .trou")]; if (!t.length) return;
    t.forEach((x, k) => { const v = textes[k]; const avant = x.textContent; x.textContent = v || " "; x.classList.toggle("rempli", !!v); if (v && v !== avant) { x.classList.remove("pop"); void x.offsetWidth; x.classList.add("pop"); } });
  };
  const remplirChoix = (o) => { const t = appli.querySelectorAll(".visuel .trou").length; if (!t) return; const m = t > 1 ? q.choix[o].split(/\s*[…\/]\s*/) : [q.choix[o]]; if (m.length === t) remplir(m); };
  if (q.lettres) {
    // le mot s'écrit lettre à lettre dans le trou de la phrase (ou dans le champ) ; chaque lettre ne sert qu'une fois
    const tape = Array.isArray(choisi) ? [...choisi] : [], champ = appli.querySelector(".visuel .trou, .mot-ecrit .trou");
    const debut = /^\s*_/.test(q.phrase || q.texte || "");        // le trou ouvre la phrase : majuscule
    const dessiner = () => {
      let mot = tape.map(i => q.lettres[i]).join(""); if (debut && mot) mot = mot[0].toUpperCase() + mot.slice(1);
      if (champ) { champ.textContent = mot || "\u00a0"; champ.classList.toggle("rempli", !!mot); champ.classList.add("curseur"); }
      appli.querySelectorAll(".lettre").forEach(b => b.disabled = tape.includes(+b.dataset.l));
      $(".effacer").disabled = !tape.length;
      if (tape.length) etat.reponses[q.id] = [...tape]; else delete etat.reponses[q.id];
      valider.disabled = !pret(etat.reponses[q.id]);
    };
    const taper = (k) => { if (k < 0 || tape.includes(k)) return; tape.push(k); SONS.choix(); vibrer(8); dessiner(); };
    const effacer = () => { if (!tape.length) return; tape.pop(); SONS.passer(); vibrer(6); dessiner(); };
    appli.querySelectorAll(".lettre").forEach(b => b.addEventListener("click", () => taper(+b.dataset.l)));
    $(".effacer").addEventListener("click", effacer);
    const ecran = appli.querySelector(".ecran-question");
    const clavier = (e) => {                                          // sur ordinateur, le clavier marche aussi
      if (!ecran.isConnected) return document.removeEventListener("keydown", clavier);
      if (appli.querySelector(".voile") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") { e.preventDefault(); return effacer(); }
      if (e.key === "Enter") { if (!valider.disabled && !e.target.closest("button")) valider.click(); return; }
      if (e.key.length === 1) taper(q.lettres.findIndex((l, i) => normaliser(l) === normaliser(e.key) && !tape.includes(i)));
    };
    document.addEventListener("keydown", clavier);
    dessiner(); placerLettres();
  } else if (q.saisie) {
    const champs = [...appli.querySelectorAll(".saisies input")];
    const maj = () => { etat.reponses[q.id] = champs.map(c => c.value); valider.disabled = !pret(etat.reponses[q.id]); if (q.t === "trou" && champs.length === 1) remplir([champs[0].value.trim()]); };
    champs.forEach(c => { c.addEventListener("input", maj); c.addEventListener("keydown", (e) => { if (e.key === "Enter" && !valider.disabled) valider.click(); }); });
    if (Array.isArray(choisi)) maj(); else delete etat.reponses[q.id];
  } else if (q.t === "ordre") {
    const place = Array.isArray(choisi) ? [...choisi] : [];
    const dessiner = () => {
      remplir(q.ordre.map((_, k) => place[k] !== undefined ? q.mots[place[k]] : ""));
      appli.querySelectorAll(".mot-dispo").forEach(b => b.disabled = place.includes(+b.dataset.m));
      if (place.length) etat.reponses[q.id] = [...place]; else delete etat.reponses[q.id];
      valider.disabled = !pret(etat.reponses[q.id]);
    };
    appli.querySelectorAll(".mot-dispo").forEach(b => b.addEventListener("click", () => { if (place.length < q.ordre.length) { place.push(+b.dataset.m); SONS.choix(); vibrer(8); dessiner(); } }));
    appli.querySelectorAll(".visuel .trou").forEach((t, k) => t.addEventListener("click", () => { if (place[k] !== undefined) { place.splice(k, 1); SONS.passer(); dessiner(); } }));
    dessiner();
  } else {
    appli.querySelectorAll(".rep").forEach(t => t.addEventListener("click", () => {
      const o = +t.dataset.o; etat.reponses[q.id] = o;
      appli.querySelectorAll(".rep").forEach(x => x.setAttribute("aria-checked", +x.dataset.o === o));
      valider.disabled = false; remplirChoix(o); SONS.choix(); vibrer(8);
    }));
    if (choisi !== undefined && choisi !== null) remplirChoix(choisi);
  }
  appli.querySelectorAll(".ecouter-rep").forEach(b => b.addEventListener("click", () => jouer(b.dataset.a, [], b, null, null, {})));
  valider.addEventListener("click", () => { const t = appli.querySelector('.rep[aria-checked="true"]'); if (t) t.classList.add("envoyee"); SONS.valider(); vibrer(12); suivante(380); });
  $("#passer").addEventListener("click", () => { etat.reponses[q.id] = null; SONS.passer(); suivante(120); });
  $("#fermer").addEventListener("click", demanderQuitter);
  const lecteur = $("#lecteur");
  if (lecteur) lecteur.addEventListener("click", () => {
    const n = (etat.ecoutes[q.id] || 0) + 1; etat.ecoutes[q.id] = n;
    lecteur.disabled = true;
    const p = $("#pastille"); if (p) { p.textContent = 2 - n; p.hidden = 2 - n <= 0; }
    jouer(q.audio, [], lecteur, $("#vague"), () => { lecteur.disabled = 2 - n <= 0; lecteur.setAttribute("aria-label", 2 - n > 0 ? "Réécouter l'enregistrement (1 écoute possible)" : "Plus d'écoute possible"); }, {});
  });
  const lireConsigne = $("#lire-consigne"); if (lireConsigne) lireConsigne.addEventListener("click", () => jouer("q:" + q.question, [q.question], lireConsigne, null, null, { voix: "f", debit: DEBIT.A1 }));
  const relire = $("#relire"); if (relire) relire.addEventListener("click", () => feuille(`${papier(q)}${bouton("Revenir à la question", "vert", "data-fermer")}`));
  const agrandir = $("#agrandir"); if (agrandir) agrandir.addEventListener("click", () => feuille(`<img class="image-grande" src="${IMAGES[q.img]}" alt="${echap(q.alt || "")}">${bouton("Revenir à la question", "vert", "data-fermer")}`));
  ajusterImages(); resserrer();
}
// Sur un petit écran (téléphone avec les barres du navigateur), une question qui ne tient pas est resserrée
// (marges, lecteur, réponses), en deux crans ; les images s'ajustent ensuite à la place qui reste.
// Si elle ne tient toujours pas (long texte à lire, très petit écran), le bas du contenu s'estompe pour montrer
// qu'il y a une suite à faire défiler, jusqu'à ce qu'on arrive en bas.
function resserrer() {
  const ecran = appli.querySelector(".ecran"), d = ecran && ecran.querySelector(".defile"); if (!d) return;
  const deborde = () => d.scrollHeight > d.clientHeight + 1;
  ecran.querySelectorAll("img").forEach(i => { if (!i.complete) i.addEventListener("load", resserrer, { once: true }); });   // la taille d'une image n'est connue qu'une fois chargée
  ecran.classList.remove("serre", "tres-serre");
  if (deborde()) { ecran.classList.add("serre"); placerLettres(); ajusterImages(); }
  if (deborde()) { ecran.classList.add("tres-serre"); placerLettres(); ajusterImages(); }
  const suite = () => d.classList.toggle("a-suivre", d.scrollTop + d.clientHeight < d.scrollHeight - 4);
  suite(); if (!d.dataset.suite) { d.dataset.suite = 1; d.addEventListener("scroll", suite, { passive: true }); }
}
// Réponses en images : aussi grandes que la place le permet. On essaie deux colonnes (trois images : une en haut,
// deux en bas, comme les alvéoles), de la plus grande taille à la plus petite ; sinon, toutes sur une ligne.
function ajusterImages() {
  const bloc = appli.querySelector(".reponses.images"); if (!bloc) return;
  const defile = bloc.closest(".defile"), premier = defile.firstElementChild, dernier = defile.lastElementChild;
  const n = bloc.children.length, g = 12, larg = bloc.clientWidth - 32, ligne = Math.floor((larg - (n - 1) * g) / n);
  const marge = () => Math.min(premier.offsetTop - defile.offsetTop, defile.offsetTop + defile.clientHeight - dernier.offsetTop - dernier.offsetHeight);
  const essayer = (cols, w) => { bloc.dataset.cols = cols; bloc.style.setProperty("--wi", w + "px"); return marge() >= 18; };
  if (n > 2) for (let w = Math.min(Math.floor((larg - g) / 2), 200); w >= ligne + 16; w -= 6) if (essayer(2, w)) return;
  essayer(n, ligne);
}
// Lettres à toucher : une bande d'alvéoles (une ou deux rangées en quinconce), à la largeur de l'écran.
function placerLettres() {
  const bloc = appli.querySelector(".lettres"); if (!bloc) return;
  const t = [...bloc.children], n = t.length, rangs = n > 7 ? 2 : 1, cols = Math.ceil(n / rangs), g = 6;
  const larg = bloc.parentElement.clientWidth - 32, w = Math.min(66, Math.floor((larg - (cols - 1) * g) / ((cols - 1) * .75 + 1)));
  const pas = w * .75 + g, h = w * .866 + g;
  let bas = 0;
  t.forEach((x, k) => { const c = rangs === 2 ? Math.floor(k / 2) : k, r = rangs === 2 ? k % 2 : 0, y = r * h + (c % 2 ? h / 2 : 0);
    x.style.left = c * pas + "px"; x.style.top = y + "px"; bas = Math.max(bas, y); });
  bloc.style.setProperty("--w", w + "px"); bloc.style.width = (cols - 1) * pas + w + "px"; bloc.style.height = bas + w * .941 + "px";
}
addEventListener("resize", () => { placerLettres(); ajusterImages(); resserrer(); });
''')

# ---------- lisibilité (textes plus grands, plus aérés) et plein écran sur téléphone et tablette
rep("""@media (max-width: 520px) {
  body { padding: 0; }
  .appli { width: 100%; height: 100%; border: 0; border-radius: 0; outline: 0; }
""", """/* lisibilité : aucun texte de lecture sous 14 px, consignes et contextes plus grands et plus aérés */
.contexte { max-width: 340px; font-size: 17px; line-height: 1.4; }
.etiquette { font-size: 14.5px; }
.sms p { font-size: 18px; line-height: 1.45; }
.ordre-phrase { font-size: 21px; line-height: 1.85; }
.indice { padding: 5px 14px; font-size: 15px; }
.bonbons .rep { font-size: 17.5px; }
.papier p { font-size: 17.5px; }
.papier-court p { font-size: 17px; }
.papier-tete small { font-size: 14px; }
.consigne-lecture { font-size: 15.5px; line-height: 1.45; }
.pilule { font-size: 15px; }
.champ { font-size: 14px; }
.lien { font-size: 15px; }
/* sur ordinateur, le téléphone posé sur le fond gris ; sur un appareil tactile (téléphone, tablette) ou un écran
   étroit, le test occupe tout l'écran, comme une application */
@media (max-width: 520px), (hover: none) and (pointer: coarse) {
  body { padding: 0; }
  .appli { width: 100%; height: 100%; border: 0; border-radius: 0; outline: 0; }
  /* Le test est un bloc fixe de la taille de l'écran : la page elle-même ne peut plus défiler (rien ne passe sous
     la barre d'état), et Safari (iOS 26) prend la couleur des bords d'un tel bloc pour teinter ses barres :
     violet en haut, bleu en bas, comme le dégradé. Le fond violet de la page sert de repli. */
  html, body { height: 100%; overflow: hidden; overscroll-behavior: none; background: var(--fond-1); }
  .appli { position: fixed; inset: 0; width: auto; height: auto; }
""")

# ---------- sur ordinateur, à côté du téléphone : le barème (à gauche) et le moteur en direct (à droite)
rep('''<main class="appli" id="appli" aria-live="polite"></main>''', '''<main class="appli" id="appli" aria-live="polite"></main>
<div class="coin">
  <aside class="moteur" id="regles" aria-label="Le barème du test" hidden></aside>
  <aside class="moteur" id="moteur" aria-label="Le moteur adaptatif, en direct" hidden></aside>
  <div class="coin-boutons"><button class="coin-bouton" type="button" data-panneau="regles" aria-controls="regles" aria-expanded="false">Barème</button><button class="coin-bouton" type="button" data-panneau="moteur" aria-controls="moteur" aria-expanded="false">Moteur</button></div>
</div>''')
rep('''ecranResultat })[etat.ecran](); }''', '''ecranResultat })[etat.ecran](); majMoteur(); if (scrollX || scrollY) scrollTo(0, 0); }
// ------------------------------------------------------------------------------ le moteur montré à côté (ordinateur)
// Pour présenter le test : le barème, puis le palier en cours question par question (niveau, compétence, tag du PDF),
// le décompte des bonnes réponses tel que le moteur le fait, les paliers validés et le bilan par compétence.
// Une réponse n'est comptée qu'une fois validée (« Suivant » ou « Je ne sais pas »).
const NOMS_COMP = { CO: "Compréhension orale", CE: "Compréhension écrite", EE: "Expression écrite", EO: "Expression orale", LG: "Langue" };
const pastilleNiveau = (n) => `<span class="m-niv ${NIVEAUX[n].teinte}">${n}</span>`;
function reglesMoteur() {
  const box = document.getElementById("regles"); if (!box || box.innerHTML) return;
  const compte = (n, c) => BANQUE.filter(q => q.niveau === n && (!c || q.comp === c)).length;
  box.innerHTML = `<h2>Le barème</h2>
    <ol class="m-regles">
      <li><b>3 paliers</b>, dans l'ordre : ${ORDRE.map(pastilleNiveau).join(" → ")}</li>
      <li><b>${PAR_PALIER} questions par palier</b>, tirées au hasard dans la banque du niveau : d'abord une par compétence présente, puis on équilibre.</li>
      <li><b>${Math.ceil(PAR_PALIER * TAUX)} justes sur ${PAR_PALIER}</b> (${Math.round(TAUX * 100)} %) valident le palier et ouvrent le suivant.</li>
      <li><b>Arrêt</b> dès que le palier ne peut plus être validé : ${PAR_PALIER - Math.ceil(PAR_PALIER * TAUX) + 1} erreurs. «\u00a0Je ne sais pas\u00a0» compte comme une erreur.</li>
      <li><b>Niveau attribué</b> : le dernier palier validé. Aucun palier validé : «\u00a0A1 en cours\u00a0».</li>
      <li>Jamais deux questions sur le même document dans un palier.</li>
    </ol>
    <h3>La banque : ${BANQUE.length} questions</h3>
    <table class="m-banque"><tr><th></th>${COMPS.map(c => `<th title="${NOMS_COMP[c]}">${c}</th>`).join("")}<th>Total</th></tr>
      ${ORDRE.map(n => `<tr><th>${pastilleNiveau(n)}</th>${COMPS.map(c => `<td>${compte(n, c) || "–"}</td>`).join("")}<td><b>${compte(n)}</b></td></tr>`).join("")}</table>
    <dl class="m-legende">${COMPS.map(c => `<div><dt>${c}</dt><dd>${NOMS_COMP[c]}${c === "LG" ? " (grammaire, conjugaison, vocabulaire)" : ""}</dd></div>`).join("")}</dl>`;
}
document.querySelectorAll(".coin-bouton").forEach(b => b.addEventListener("click", () => {
  const ouvrir = b.getAttribute("aria-expanded") !== "true";
  document.querySelectorAll(".coin-bouton").forEach(x => { x.setAttribute("aria-expanded", "false"); document.getElementById(x.dataset.panneau).hidden = true; });
  if (ouvrir) { b.setAttribute("aria-expanded", "true"); document.getElementById(b.dataset.panneau).hidden = false; majMoteur(); }
}));
function majMoteur() {
  reglesMoteur();
  const box = document.getElementById("moteur"); if (!box) return;
  if (!etat.palier) { box.innerHTML = `<h2>Le moteur, en direct</h2><p class="m-note">Le test n'a pas commencé. Au démarrage, le moteur tire les ${PAR_PALIER} questions du palier A1.</p>`; return; }
  const fin = etat.ecran === "resultat", derniere = fin ? etat.k : etat.k - 1;      // dernière question comptée du palier
  const comptee = (id, m) => m <= derniere && id in etat.reponses;
  const statut = (id, m) => comptee(id, m) ? (etat.reponses[id] === null ? "passe" : estJuste(PAR_ID[id], etat.reponses[id]) ? "juste" : "faux") : m === etat.k && etat.ecran === "question" ? "encours" : "avenir";
  const st = etat.palier.map(statut), justes = st.filter(x => x === "juste").length, faites = st.filter(x => ["juste", "faux", "passe"].includes(x)).length;
  const n = etat.palier.length, s = seuil(), permises = n - s, erreurs = faites - justes, niv = etat.niveau;
  const valide = etat.valides.includes(niv), echoue = erreurs > permises;
  const etatPalier = valide ? `<b class="m-ok">${niv} validé</b> : ${justes} justes sur ${n}.`
    : echoue ? `<b class="m-ko">${niv} non validé</b> : ${erreurs} erreurs, il n'en fallait pas plus de ${permises}. Le test s'arrête.`
    : `Pour valider ${niv} : <b>${s} justes sur ${n}</b>. Erreurs : ${erreurs} sur ${permises} permises.`;
  const LIB = { juste: "✓ juste", faux: "✗ faux", passe: "✗ je ne sais pas", encours: "en cours", avenir: "" };
  // paliers déjà validés, et bilan par compétence sur toutes les réponses comptées
  const comptees = [...etat.vus, ...etat.palier.filter((id, m) => comptee(id, m))];
  const juste = (id) => estJuste(PAR_ID[id], etat.reponses[id]);
  const histo = etat.valides.filter(v => v !== niv).map(v => { const ids = etat.vus.filter(id => PAR_ID[id].niveau === v); return `<li>${pastilleNiveau(v)} validé : ${ids.filter(juste).length} justes sur ${ids.length}</li>`; }).join("");
  const parComp = COMPS.map(c => { const ids = comptees.filter(id => PAR_ID[id].comp === c); return ids.length ? `<tr><td>${NOMS_COMP[c]}</td><td><span class="m-barre"><i style="width:${Math.round(ids.filter(juste).length / ids.length * 100)}%"></i></span></td><td>${ids.filter(juste).length}/${ids.length}</td></tr>` : ""; }).join("");
  box.innerHTML = `<h2>Le moteur, en direct</h2>
    <div class="m-palier"><span>Palier ${pastilleNiveau(niv)}</span><span>${fin ? "terminé" : etat.ecran === "palier" ? "tiré, prêt à commencer" : `question ${etat.k + 1} sur ${n}`}</span></div>
    <div class="m-score"><strong>${justes}/${faites}</strong><span>${justes > 1 ? "bonnes réponses" : "bonne réponse"} pour ${niv}</span></div>
    <div class="m-cases">${st.map(x => `<i class="m-${x}"></i>`).join("")}</div>
    <p class="m-etat">${etatPalier}</p>
    <ol class="m-questions">${etat.palier.map((id, m) => { const q = PAR_ID[id]; return `<li class="m-${st[m]}"><span class="m-num">${m + 1}</span>${pastilleNiveau(q.niveau)}<span class="m-comp">${NOMS_COMP[q.comp]}<small>${q.comp === "LG" ? echap(q.tag) + " · " : ""}${q.id}</small></span><span class="m-lib">${LIB[st[m]]}</span></li>`; }).join("")}</ol>
    ${histo ? `<h3>Paliers validés</h3><ul class="m-histo">${histo}</ul>` : ""}
    ${fin ? `<p class="m-resultat">Niveau attribué : <b>${etat.valides.length ? etat.valides[etat.valides.length - 1] : "A1 en cours"}</b></p>` : ""}
    ${parComp ? `<h3>Par compétence (réponses comptées)</h3><table class="m-comps">${parComp}</table>` : ""}
    <p class="m-note">Une réponse est comptée quand on appuie sur «\u00a0Suivant\u00a0» ou «\u00a0Je ne sais pas\u00a0».</p>`;
}''')

# ---------- la feuille (quitter, relire) prend le focus sans faire défiler la page
rep('''const premier = voile.querySelector("button"); if (premier) premier.focus();''', '''const premier = voile.querySelector("button"); if (premier) premier.focus({ preventScroll: true });''')

# ---------- icône de la touche « effacer » du clavier de lettres
rep('''  $("#lu").addEventListener("click", () => { etat.lus[q.id] = true; SONS.page(); afficher(); });
}''', '''  $("#lu").addEventListener("click", () => { etat.lus[q.id] = true; SONS.page(); afficher(); });
  resserrer();
}''')
rep("const ICONE = {\n", """const ICONE = {
  loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 8v5M8 10.5h5"/></svg>',
  effacer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
""")

# ---------- styles des nouveaux éléments
rep('''/* ------------------------------------------------------------ les réponses */''', '''/* version 2 : contexte, image, tableau, réponses en images, phrases à écouter, mots à placer, réponses écrites */
.contexte { margin: 0; max-width: 320px; font-size: 15px; font-weight: 800; line-height: 1.35; color: rgba(255, 255, 255, .92); }
.phrase.petite { font-size: 20px; }
.phrase .trou { cursor: default; }
.ordre-phrase { font-size: 19px; line-height: 1.9; }
.ordre-phrase .trou { min-width: 64px; cursor: pointer; }
.trou.pop { animation: pop .35s cubic-bezier(.2, 1.7, .4, 1); }
.image-support { display: block; padding: 0; border: 0; border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 5px 0 var(--blanc-levre); }
.image-support img { display: block; width: 100%; max-height: 190px; object-fit: contain; }
.image-grande { width: 100%; border-radius: 12px; }
.tableau-defile { overflow-x: auto; margin: 0 -8px; }
.edt { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 12.5px; line-height: 1.25; text-align: center; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: anywhere; }
.edt th, .edt td { padding: 7px 3px; border: 1px solid #d8d2ee; }
.edt tr > :first-child { width: 25%; white-space: nowrap; font-size: 11px; letter-spacing: -.01em; }
.edt tr:first-child > * { font-size: 11.5px; letter-spacing: .03em; }
.edt th { background: var(--lavande); font-weight: 900; }
.edt td:empty { background: #faf8ff; }
.reponses.images { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.reponses.images[data-cols="2"] .rep-image:first-child:nth-last-child(odd) { margin-inline: calc((100% - var(--wi)) / 2); }
.rep-image { width: var(--wi, calc((100% - 24px) / 3)); padding: 6px; border: 0; border-radius: 16px; background: #fff; box-shadow: 0 5px 0 var(--blanc-levre), 0 9px 0 var(--ombre); animation: monte .4s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(.08s + var(--n) * .05s); transition: translate .1s; }
.rep-image img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 11px; }
.rep-image:active { translate: 0 4px; }
.rep-image[aria-checked="true"] { background: linear-gradient(var(--citron-1), var(--citron-2)); box-shadow: 0 5px 0 var(--citron-levre), 0 9px 0 var(--ombre); animation: choisi .3s cubic-bezier(.2, 1.6, .4, 1); }
.ligne-audio { display: flex; align-items: center; gap: 10px; animation: monte .4s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(.08s + var(--n) * .05s); }
.ligne-audio .rep { flex: 1; animation: none; }
.ecouter-rep { flex: none; display: grid; place-items: center; width: 46px; height: 46px; padding: 0; border: 0; border-radius: 50%; color: #fff; background: linear-gradient(var(--cyan-1), var(--cyan-2)); box-shadow: inset 0 0 0 4px rgba(255, 255, 255, .45), 0 3px 0 var(--cyan-levre); }
.ecouter-rep svg { width: 18px; height: 18px; margin-left: 3px; }
.ecouter-rep.parle { animation: appel 1s ease-in-out infinite; }
.mots-a-placer { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.mot-dispo { padding: 12px 18px; border: 0; border-radius: 14px; background: linear-gradient(#ffffff, #f2ebff); color: var(--encre); font: 800 19px/1.2 var(--texte); box-shadow: 0 5px 0 var(--blanc-levre), 0 9px 0 var(--ombre); transition: translate .1s, opacity .2s; }
.mot-dispo:active { translate: 0 4px; }
.mot-dispo:disabled { opacity: .25; box-shadow: none; translate: 0 5px; cursor: default; }
.saisies { display: grid; gap: 12px; }
.champ { display: grid; gap: 6px; font-size: 13px; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; color: rgba(255, 255, 255, .8); }
.champ input { width: 100%; min-height: 56px; padding: 12px 16px; border: 0; border-radius: 18px; background: #fff; color: var(--encre); font: 800 20px/1.2 var(--texte); box-shadow: 0 5px 0 var(--blanc-levre); outline: none; }
.champ input:focus { box-shadow: 0 5px 0 var(--citron-levre), inset 0 0 0 3px var(--citron-2); }
.alveoles[data-n="3"] { height: calc(var(--w) * 1.374 + var(--g) / 2); }
.alveoles[data-n="2"] { width: calc(var(--w) * 2 + var(--g) * 2); height: calc(var(--w) * .941); }
.alveoles[data-n="2"] .rep:nth-child(1) { left: 0; top: 0; }
.alveoles[data-n="2"] .rep:nth-child(2) { left: auto; right: 0; top: 0; }
.reponses.ecrire { display: grid; justify-items: center; gap: 22px; }
.mot-ecrit .trou { min-width: 170px; margin: 0; font: 800 26px/1.6 var(--texte); text-align: center; }
.trou.curseur::after { content: ""; display: inline-block; width: 2px; height: 1.05em; margin-left: 2px; vertical-align: -.15em; background: currentColor; animation: clignote 1.1s steps(1) infinite; }
.trou.curseur.rempli { animation: none; }
@keyframes clignote { 50% { opacity: 0; } }
.lettres { --w: 64px; position: relative; flex: none; }
.lettres .tuile { --w: inherit; position: absolute; animation: pose .4s cubic-bezier(.2, 1.4, .4, 1) both; animation-delay: calc(.06s + var(--n) * .03s); transition: opacity .2s; }
.lettres .mot { padding: 0 0 4%; font: 800 calc(var(--w) * .4)/1 var(--titre); text-transform: uppercase; }
.lettres .tuile:active .dessus { translate: 0 4px; }
.lettres .tuile:disabled { opacity: .28; cursor: default; }
.lettres .tuile:disabled .dessus { translate: 0 5px; }
.lettres .effacer { color: #fff; }
.lettres .effacer:disabled { opacity: .45; }
.lettres .effacer .mot svg { position: static; width: 46%; height: auto; }
/* lecteur : les ondes s'animent dans le bouton pendant l'écoute */
.lecteur .vague { display: none; height: 34%; gap: 5px; }
.lecteur .vague i { width: 6px; background: #fff; }
.lecteur.parle svg { display: none; }
.lecteur.parle .vague { display: flex; }
.lecteur.parle:disabled { filter: none; opacity: 1; }
.lecteur.parle:disabled::before { animation: onde .9s ease-out infinite; opacity: 1; }
/* question resserrée quand elle ne tient pas dans la hauteur de l'écran */
.serre .visuel { min-height: 0; margin-top: 10px; padding: 14px 16px; gap: 10px; }
.serre .question { margin-top: 14px; font-size: 20px; }
.serre .reponses { padding-top: 14px; padding-bottom: 10px; }
.serre .reponses.alveoles { --w: 104px; margin-top: 22px; margin-bottom: 10px; }
.serre .bonbons { gap: 10px; }
.serre .bonbons .rep { min-height: 48px; padding-block: 9px; }
.serre .lecteur { width: 72px; height: 72px; }
.serre .lecteur svg { width: 30px; height: 30px; }
.serre .pastille { width: 26px; height: 26px; font-size: 14px; }
.serre .scene-emoji { font-size: 40px; }
.serre .doc-mini { gap: 6px; }
.serre .image-support img { max-height: 150px; }
.serre .doc-mini .icone-doc { width: 58px; height: 66px; font-size: 30px; }
.serre .papier-tete { margin-bottom: 8px; }
.serre .edt th, .serre .edt td { padding-block: 4px; }
.serre .consigne-lecture { margin-top: 12px; }
.tres-serre .haut { padding-bottom: 4px; }
.tres-serre .visuel { margin-top: 6px; padding: 10px 14px; gap: 8px; }
.tres-serre .question { margin-top: 10px; font-size: 19px; }
.tres-serre .reponses { padding-top: 10px; padding-bottom: 6px; }
.tres-serre .bonbons { gap: 8px; }
.tres-serre .bonbons .rep { padding-block: 7px; }
.tres-serre .lecteur { width: 60px; height: 60px; }
.tres-serre .lecteur svg { width: 26px; height: 26px; }
.tres-serre .scene-emoji { font-size: 32px; }
.tres-serre .image-support img { max-height: 120px; }
.tres-serre .doc-mini .icone-doc { width: 48px; height: 54px; font-size: 26px; }
.tres-serre .lien { margin-top: 2px; padding-block: 4px; }
.tres-serre .bouton { min-height: 52px; }
.image-support { position: relative; }
.photo-scene { display: block; width: 100%; aspect-ratio: 16 / 9; max-height: 170px; object-fit: cover; border-radius: 16px; }
.serre .photo-scene { max-height: 120px; }
/* écoute avec photo : la photo remplit tout l'encart, le bouton d'écoute posé dessus, au centre */
.visuel.photo-fond { overflow: hidden; min-height: 220px; }
.visuel.photo-fond > .photo-scene { position: absolute; inset: 0; width: 100%; height: 100%; max-height: none; aspect-ratio: auto; border-radius: 0; }
.visuel.photo-fond > .lecteur { z-index: 1; }
.serre .visuel.photo-fond { min-height: 180px; }
.tres-serre .visuel.photo-fond { min-height: 140px; }
.tres-serre .photo-scene { max-height: 90px; }
.papier-tete .avec-photo { width: 60px; height: 60px; overflow: hidden; border-radius: 50%; }
.doc-mini .icone-doc.avec-photo { width: 76px; height: 76px; overflow: hidden; border-radius: 50%; }
.avec-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.serre .doc-mini .icone-doc.avec-photo { width: 60px; height: 60px; }
.tres-serre .doc-mini .icone-doc.avec-photo { width: 50px; height: 50px; }
.loupe { position: absolute; right: 8px; bottom: 8px; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; color: #fff; background: linear-gradient(var(--cyan-1), var(--cyan-2)); box-shadow: 0 3px 0 var(--cyan-levre); }
.loupe svg { width: 20px; height: 20px; }
.coin { display: none; }
@media (min-width: 1000px) and (hover: hover) and (pointer: fine) {
  .coin { position: fixed; left: 20px; bottom: 20px; z-index: 2; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; max-height: calc(100% - 40px); }
  .coin-boutons { display: flex; gap: 6px; }
  .coin-bouton { padding: 5px 12px; border: 1px solid #d4d4dc; border-radius: 999px; background: #f6f6f8; color: #5a5470; font: 800 12px/1.4 var(--texte); }
  .coin-bouton:hover { border-color: #b9b4cc; color: var(--encre); }
  .coin-bouton[aria-expanded="true"] { border-color: var(--fond-1); background: var(--fond-1); color: #fff; }
  .coin-bouton:focus-visible { outline: 2px solid var(--fond-1); outline-offset: 2px; }
  .moteur { min-height: 0; overflow-y: auto; scrollbar-width: thin; width: min(290px, calc(50vw - 236px)); padding: 16px 16px 14px; border: 1px solid #dcdce4; border-radius: 18px; background: #fff; color: #3b3452; font: 600 12px/1.45 var(--texte); text-align: left; }
  .moteur h2 { margin: 0 0 10px; font: 800 15px/1.2 var(--titre); color: var(--encre); }
  .moteur h3 { margin: 14px 0 6px; font: 800 12.5px/1.2 var(--titre); color: var(--encre); }
  .moteur b { color: var(--encre); }
  .m-niv { display: inline-grid; place-items: center; min-width: 28px; padding: 1px 6px; border-radius: 7px; font: 800 11.5px/1.5 var(--titre); color: var(--encre); vertical-align: 1px; }
  .m-niv.cyan { background: linear-gradient(var(--cyan-1), var(--cyan-2)); }
  .m-niv.vert { background: linear-gradient(var(--vert-1), var(--vert-2)); }
  .m-niv.rose { background: linear-gradient(var(--rose-1), var(--rose-2)); }
  .m-regles { margin: 0; padding-left: 18px; display: grid; gap: 7px; }
  .m-banque { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; text-align: center; }
  .m-banque th, .m-banque td { padding: 4px 2px; border-bottom: 1px solid #ececf2; }
  .m-banque tr:first-child th { font-size: 11.5px; color: #7a7490; }
  .m-legende { display: grid; gap: 3px; margin: 10px 0 0; font-size: 12px; color: #6a6480; }
  .m-legende div { display: flex; gap: 8px; } .m-legende dt { min-width: 22px; font-weight: 800; color: var(--encre); } .m-legende dd { margin: 0; }
  .m-palier { display: flex; justify-content: space-between; align-items: center; color: #6a6480; }
  .m-score { display: flex; align-items: baseline; gap: 8px; margin: 6px 0 8px; }
  .m-score strong { font: 800 28px/1 var(--titre); color: var(--encre); font-variant-numeric: tabular-nums; }
  .m-score span { color: #6a6480; }
  .m-cases { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .m-cases i { height: 8px; border-radius: 4px; background: #ecebf2; }
  .m-cases .m-juste { background: #5fb012; } .m-cases .m-faux, .m-cases .m-passe { background: #e0477a; } .m-cases .m-encours { background: #9748fe; }
  .m-etat { margin: 10px 0 12px; }
  .m-ok { color: #3f8a0c !important; } .m-ko { color: #c2305f !important; }
  .m-questions { margin: 0; padding: 0; list-style: none; display: grid; gap: 2px; }
  .m-questions li { display: grid; grid-template-columns: 14px auto 1fr auto; align-items: center; gap: 7px; padding: 4px 6px; border-radius: 9px; }
  .m-questions .m-encours { background: #f3edff; }
  .m-questions .m-avenir { color: #8f8aa3; }
  .m-num { font-weight: 800; color: #9a95ad; font-variant-numeric: tabular-nums; }
  .m-comp { display: grid; min-width: 0; line-height: 1.25; } .m-comp small { overflow: hidden; font-size: 11px; color: #8f8aa3; white-space: nowrap; text-overflow: ellipsis; }
  .m-lib { font-size: 11px; font-weight: 800; white-space: nowrap; }
  .m-juste .m-lib { color: #3f8a0c; } .m-faux .m-lib, .m-passe .m-lib { color: #c2305f; } .m-encours .m-lib { color: #7a3ff0; }
  .m-histo { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; }
  .m-resultat { margin: 14px 0 0; padding: 10px 12px; border-radius: 12px; background: #f3edff; font-size: 14px; }
  .m-comps { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  .m-comps td { padding: 3px 0; } .m-comps td:last-child { text-align: right; width: 40px; } .m-comps td:nth-child(2) { width: 38%; padding-inline: 8px; }
  .m-barre { display: block; height: 6px; border-radius: 3px; background: #ecebf2; overflow: hidden; } .m-barre i { display: block; height: 100%; background: #5fb012; }
  .m-note { margin: 14px 0 0; font-size: 11.5px; color: #8f8aa3; }
}
.defile.a-suivre { -webkit-mask-image: linear-gradient(#000 calc(100% - 56px), transparent); mask-image: linear-gradient(#000 calc(100% - 56px), transparent); }
.tres-serre .phrase { font-size: 21px; }
.tres-serre .ordre-phrase { font-size: 19px; line-height: 1.7; }
.tres-serre .sms p { font-size: 16.5px; padding: 10px 14px; }
.tres-serre .contexte { font-size: 15.5px; }
.tres-serre .bonbons .rep { min-height: 44px; font-size: 16.5px; }
.tres-serre .reponses.alveoles { --w: 96px; margin-top: 16px; }
.tres-serre .bas { padding-top: 6px; }

/* ------------------------------------------------------------ les réponses */''')

# ---------- deux sorties : l'artifact (tout intégré) et la page web (sons en fichiers)
artifact = s.replace('__AUDIO__', '{\n' + ',\n'.join(f'  {json.dumps(k, ensure_ascii=False)}: "{b64(src, "audio/mpeg")}"' for k, (src, _) in audio_fichiers.items()) + '\n}')
artifact = artifact.replace('<title>Test de positionnement FLE</title>', '<title>Positionnement FLE v2</title>', 1)   # distinct de la version 1 dans la galerie
open(f'{D}/test-positionnement.html', 'w', encoding='utf-8').write(artifact)
web = s.replace('__AUDIO__', json.dumps({k: rel for k, (_, rel) in audio_fichiers.items()}, ensure_ascii=False, indent=0).replace('\n', '\n  '))
web = web.replace('<title>Test de positionnement FLE</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n', '')
tete = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#9748fe">
<title>Test de niveau de français</title>
<meta name="description" content="Évaluation de positionnement en français, du niveau A1 au niveau B1, adaptative, sur mobile.">
<meta property="og:title" content="Test de niveau de français">
<meta property="og:description" content="Évaluation de positionnement adaptative, du niveau A1 au niveau B1, environ 10 minutes.">
<meta property="og:type" content="website">
'''
i = web.index('</style>') + len('</style>')
web = tete + web[:i] + '\n</head>\n<body>\n' + web[i:].lstrip('\n') + '\n</body>\n</html>\n'
open(f'{D}/index.html', 'w', encoding='utf-8').write(web)
os.makedirs(f'{D}/sons/consignes', exist_ok=True); os.makedirs(f'{D}/sons/poste', exist_ok=True)
import shutil
for k, (src, rel) in audio_fichiers.items():
    if os.path.abspath(src) != os.path.abspath(f'{D}/{rel}'): shutil.copyfile(src, f'{D}/{rel}')
print('artifact', len(artifact) // 1024, 'Ko ; page web', len(web) // 1024, 'Ko ;', len(audio_fichiers), 'sons ;', len(images), 'images')
