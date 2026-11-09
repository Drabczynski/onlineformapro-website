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
// (ordre), réponse à écrire (saisie).
const BANQUE = ''' + json.dumps(B, ensure_ascii=False, separators=(',', ':')) + ''';

''')

# ---------- sons et images
audio_fichiers = {f"o{k:02d}": (f"{RACINE}/sons/o{k:02d}.mp3", f"sons/o{k:02d}.mp3") for k in range(1, 12)}
for cle, ident in cles.items():
    rel = f"sons/{'poste' if ident.startswith('poste') else 'consignes'}/{ident}.mp3"
    audio_fichiers[cle] = (f"{RACINE}/{rel}", rel)
images = sorted({i for d in B for i in d.get('images', [])} | {d['img'] for d in B if d.get('img')})
bloc_images = 'const IMAGES = {\n' + ',\n'.join(f'  {json.dumps(i)}: "{b64(f"{ICI}/img/{i}.webp", "image/webp")}"' for i in images) + '\n};\n'
entre('// Sons enregistrés avec ElevenLabs', 'const ETOILE =', '''// Sons : les enregistrements d'origine du PDF (o01 à o11, volume égalisé), les consignes A1 lues (« q: » + texte) et les
// trois phrases de la question de la poste, générées avec ElevenLabs.
const AUDIO = __AUDIO__;
// Images : photos des réponses et affiche, tirées du PDF.
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
  return `<div class="papier ${q.style || ""}"><div class="papier-tete"><span aria-hidden="true">${q.emoji}</span><div><strong>${q.titre}</strong><small>Prenez le temps de lire</small></div></div>${corps}</div>`;
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
    case "image": return `${ctx}<button class="image-support" type="button" id="agrandir" aria-label="Agrandir l'image"><img src="${IMAGES[q.img]}" alt="${echap(q.alt || "")}"></button><span class="etiquette">Touchez l'image pour l'agrandir</span>`;
    case "situation": return `<span class="scene-emoji" aria-hidden="true">${q.emoji}</span>${etiq}<p class="situation">${q.texte}</p>`;
    case "document": return `${ctx}<div class="doc-mini"><span class="icone-doc" aria-hidden="true">${q.emoji}</span><strong>${q.titre}</strong><button class="pilule" type="button" id="relire">${ICONE.oeil} Relire</button></div>`;
    case "ecoute":
      return `${ctx}<button class="lecteur" type="button" id="lecteur" aria-label="Écouter l'enregistrement (${reste} écoute${reste > 1 ? "s" : ""} possible${reste > 1 ? "s" : ""})" ${reste <= 0 ? "disabled" : ""}>${ICONE.jouer}<span class="pastille" id="pastille" aria-hidden="true" ${reste <= 0 ? "hidden" : ""}>${reste}</span></button><span class="vague" id="vague" aria-hidden="true">${"<i></i>".repeat(9)}</span><span class="etiquette" id="reste">${reste === 2 ? "Touchez pour écouter" : reste === 1 ? "Encore 1 écoute" : "Plus d'écoute"}</span>${q.phrase ? `<div class="phrase petite">${trous(q.phrase)}</div>` : ""}`;
  }
  return "";
}
''')
entre('function ecranQuestion() {', 'function ecranLecture(q) {', r'''function ecranQuestion() {
  const q = qActuelle();
  if (q.audio && AUDIO[q.audio] && !AUDIO[q.audio].startsWith("data:")) { const p = new Audio(); p.preload = "auto"; p.src = AUDIO[q.audio]; }
  if (q.t === "document" && !etat.lus[q.id]) return ecranLecture(q);
  const ordre = etat.ordres[q.id], choisi = etat.reponses[q.id];
  const pret = (r) => q.saisie ? Array.isArray(r) && r.length === q.saisie.length && r.every(v => (v || "").trim()) : q.t === "ordre" ? Array.isArray(r) && r.length === q.ordre.length : r !== undefined && r !== null;
  let reponses;
  if (q.saisie) reponses = `<div class="reponses saisies">${q.saisie.map((c, k) => `<label class="champ">${c.etiquette ? `<span>${c.etiquette}</span>` : ""}<input type="text" data-k="${k}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Écrivez ici" value="${echap((Array.isArray(choisi) && choisi[k]) || "")}"></label>`).join("")}</div>`;
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
      ${q.t === "aucun" ? "" : `<div class="visuel">${visuel(q)}</div>`}
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
  if (q.saisie) {
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
    lecteur.disabled = true; $("#reste").textContent = "Écoutez…";
    const p = $("#pastille"); if (p) { p.textContent = 2 - n; p.hidden = 2 - n <= 0; }
    jouer(q.audio, [], lecteur, $("#vague"), () => { lecteur.disabled = 2 - n <= 0; $("#reste").textContent = 2 - n === 1 ? "Encore 1 écoute" : "Plus d'écoute"; }, {});
  });
  const lireConsigne = $("#lire-consigne"); if (lireConsigne) lireConsigne.addEventListener("click", () => jouer("q:" + q.question, [q.question], lireConsigne, null, null, { voix: "f", debit: DEBIT.A1 }));
  const relire = $("#relire"); if (relire) relire.addEventListener("click", () => feuille(`${papier(q)}${bouton("Revenir à la question", "vert", "data-fermer")}`));
  const agrandir = $("#agrandir"); if (agrandir) agrandir.addEventListener("click", () => feuille(`<img class="image-grande" src="${IMAGES[q.img]}" alt="${echap(q.alt || "")}">${bouton("Revenir à la question", "vert", "data-fermer")}`));
}
''')

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
.edt { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 9.5px; line-height: 1.2; text-align: center; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: anywhere; }
.edt th, .edt td { padding: 4px 2px; border: 1px solid #d8d2ee; }
.edt tr > :first-child { width: 17%; }
.edt th { background: var(--lavande); font-weight: 900; }
.edt td:empty { background: #faf8ff; }
.reponses.images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.rep-image { padding: 6px; border: 0; border-radius: 16px; background: #fff; box-shadow: 0 5px 0 var(--blanc-levre), 0 9px 0 var(--ombre); animation: monte .4s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(.08s + var(--n) * .05s); transition: translate .1s; }
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
