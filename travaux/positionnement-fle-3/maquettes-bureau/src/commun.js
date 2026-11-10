// Maquettes bureau — moteur commun : six écrans réels du test (accueil, écoute, situation, SMS, phrase à
// compléter, fin), réponses à la souris ou au clavier (A, B, C ou 1, 2, 3 ; Entrée pour valider ; Échap pour
// quitter), le vrai enregistrement du métro, la langue des consignes. Chaque piste fournit rendre(e) et ses
// animations ; ce fichier enchaîne les écrans.
const { img: IMG, son: SON, drapeaux: DRAP, langues: LANGS, trad: T } = DONNEES;
const ECRANS = [
  { type: "accueil", photo: "intro" },
  { type: "question", photo: "metro", bille: true, contexte: "Vous prenez le métro et achetez un ticket au guichet automatique.",
    question: "Combien coûte un ticket ?", reponses: ["1,70 €", "1,90 €"] },
  { type: "question", photo: "cinema", situation: "Vous avez rendez-vous avec un ami pour aller au cinéma.",
    question: "Vous êtes en retard. Quel message est-ce que vous envoyez ?", reponses: ["Je t'attends devant le cinéma", "J'arrive dans 2 minutes, attends-moi !", "À demain !"] },
  { type: "question", photo: "telephone", etiquette: "Vous recevez une invitation",
    sms: "Tu ne vas pas me croire ! J'ai gagné deux places pour la finale de rugby samedi au stade de France ! Tu viens avec moi ?",
    question: "Vous n'êtes pas disponible. Quel est le bon message ?", reponses: ["Avec plaisir ! J'adore la natation.", "Ah, dommage ! Je pars ce week-end."] },
  { type: "question", photo: "croissant", phrase: "Je ______ un croissant.", indice: "Le verbe correct au présent",
    question: "Choisissez la bonne réponse.", reponses: ["manger", "mange", "dors"] },
  { type: "fin" },
];
const ICONE = {
  jouer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
  son: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  muet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 5M22 9l-5 5"/></svg>',
  croix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  ecoute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/></svg>',
  livre: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
  crayon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5l4 4L8 20H4v-4z"/></svg>',
  coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};
let n = 0, choix = null, langue = "fr", ecoutes = 0, sonActif = true;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app");
const echap = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const L = () => LANGS.find(l => l.code === langue) || LANGS[0];
const tr = (fr) => (fr && langue !== "fr" && T[langue] && T[langue][fr]) || fr;
const attrs = (fr) => tr(fr) !== fr ? ` lang="${langue}" dir="${L().dir || "ltr"}"` : "";
const texte = (fr) => echap(tr(fr));
// une phrase découpée en mots, chacun dans son masque (--i règle le décalage de l'apparition)
function motAMot(fr, depart = 0) {
  const t = tr(fr), propre = t === fr ? t.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ") : t;
  return propre.split(" ").map((m, k) => `<span class="mot"><span style="--i:${k + depart}">${echap(m)}</span></span>`).join(" ");
}
const trous = (s) => echap(s).replace(/_{3,}/g, '<span class="trou" id="trou">&nbsp;</span>');
const LETTRES = "ABCD";
const reponses = (e, classe = "") => `<div class="reponses ${classe}" role="radiogroup" aria-labelledby="q" style="--n:${e.reponses.length}">${e.reponses.map((r, k) =>
  `<button class="rep" type="button" role="radio" aria-checked="false" data-k="${k}" style="--k:${k}"><span class="lettre" aria-hidden="true">${LETTRES[k]}</span><span class="rep-texte">${echap(r)}</span></button>`).join("")}</div>`;
const bas = () => `<div class="bas"><button class="lien" type="button" data-action="passer"${attrs("Je ne sais pas")}>${texte("Je ne sais pas")}</button><button class="bouton" type="button" data-action="valider" disabled><span${attrs("Valider")}>${texte("Valider")}</span><kbd aria-hidden="true">Entrée ↵</kbd></button></div>`;
const bille = (taille) => `<button class="bille" type="button" data-action="ecouter" aria-label="Écouter l'enregistrement, 2 écoutes possibles"${taille ? ` style="--b:${taille}px"` : ""}>${ICONE.jouer}<span class="vague" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="pastille" aria-hidden="true">2</span></button>`;
const titreQuestion = (e, classe = "question") => `<h2 class="${classe}" id="q" tabindex="-1" data-focus${attrs(e.question)}>${motAMot(e.question)}</h2>`;
const aptitudes = () => `<ul class="aptitudes">${[["ecoute", "Écouter des enregistrements courts"], ["livre", "Lire des messages et des documents"], ["crayon", "Écrire des mots et des phrases"]].map(([i, t]) => `<li><span class="ic" aria-hidden="true">${ICONE[i]}</span><span${attrs(t)}>${texte(t)}</span></li>`).join("")}</ul>`;
const langues = () => `<div class="bloc-langue"><span class="etiquette-langue"${attrs("Langue des consignes")}>${texte("Langue des consignes")}</span><div class="langues" role="group">${LANGS.map(l =>
  `<button class="puce" type="button" data-langue="${l.code}" aria-pressed="${l.code === langue}" title="${l.nom}"><img src="${DRAP[l.drapeau]}" alt=""><span lang="${l.code}" dir="auto">${l.natif}</span></button>`).join("")}</div></div>`;
// ce qui se pose sur la photo d'une question
function surPhoto(e, { bille: avecBille = true, taille } = {}) {
  let h = "";
  if (e.contexte) h += `<p class="carte"${attrs(e.contexte)}>${texte(e.contexte)}</p>`;
  if (e.situation) h += `<p class="carte"${attrs(e.situation)}>${texte(e.situation)}</p>`;
  if (e.etiquette) h += `<span class="etiquette"${attrs(e.etiquette)}>${texte(e.etiquette)}</span>`;
  if (e.sms) h += `<p class="sms">${echap(e.sms)}</p>`;
  if (e.phrase) h += `<p class="phrase">${trous(e.phrase)}</p>`;
  if (e.indice) h += `<span class="indice"${attrs(e.indice)}>${texte(e.indice)}</span>`;
  if (e.bille && avecBille) h += bille(taille);
  return h;
}

// ---------- l'enchaînement des écrans
const audio = new Audio();
function aller(cible) {
  const ancien = $(".ecran.actif", app);
  n = cible; choix = null; ecoutes = 0; audio.pause();
  const e = ECRANS[n], nouveau = document.createElement("section");
  nouveau.className = "ecran actif ecran-" + e.type;
  nouveau.innerHTML = rendre(e);
  app.appendChild(nouveau);
  brancher(nouveau);
  $("#quitter").classList.toggle("cache", e.type !== "question");
  if (ancien) { ancien.classList.remove("actif"); ancien.classList.add("sort"); setTimeout(() => ancien.remove(), SORTIE); }
  const f = $("[data-focus]", nouveau); if (f) f.focus({ preventScroll: true });
  if (typeof apres === "function") apres(nouveau, e);
}
function choisir(k) {
  const e = ECRANS[n]; if (e.type !== "question" || k >= e.reponses.length) return;
  choix = k;
  $$(".ecran.actif .rep").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.k === k)));
  $(".ecran.actif [data-action=valider]").disabled = false;
  const t = $(".ecran.actif #trou");
  if (t) { t.textContent = e.reponses[k]; t.classList.remove("rempli"); void t.offsetWidth; t.classList.add("rempli"); }
}
function valider() {
  if (choix === null) return;
  const r = $(`.ecran.actif .rep[data-k="${choix}"]`); if (r) r.classList.add("valide");
  setTimeout(() => aller(n + 1), 380);
}
function ecouter(b) {
  if (ecoutes >= 2 || !SON) return;
  ecoutes++; b.classList.add("parle"); $(".pastille", b).textContent = 2 - ecoutes;
  audio.src = SON; audio.muted = !sonActif; audio.currentTime = 0;
  audio.onended = audio.onerror = () => { b.classList.remove("parle"); if (ecoutes >= 2) { b.disabled = true; $(".pastille", b).hidden = true; } };
  audio.play().catch(() => audio.onended());
}
const polices = new Set();
function chargerPolice(famille, texte) {
  if (!famille) return; const cle = famille + "|" + (texte || ""); if (polices.has(cle)) return; polices.add(cle);
  const l = document.createElement("link"); l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=" + famille.replace(/ /g, "+") + ":wght@400;700;800" + (texte ? "&text=" + encodeURIComponent(texte) : "") + "&display=swap";
  document.head.appendChild(l);
}
function changerLangue(code) {
  langue = code; chargerPolice(L().police);
  const e = $(".ecran.actif", app); e.classList.add("relangue");
  e.innerHTML = rendre(ECRANS[n]); brancher(e);
  const p = $(`.puce[data-langue="${code}"]`, e); if (p) p.focus({ preventScroll: true });
}
function brancher(el) {
  $$(".rep", el).forEach(b => b.addEventListener("click", () => choisir(+b.dataset.k)));
  $$(".puce", el).forEach(b => b.addEventListener("click", () => changerLangue(b.dataset.langue)));
  el.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-action]"); if (!a) return;
    ({ valider, passer: () => aller(n + 1), commencer: () => aller(1), fermer: () => aller(0), ecouter: () => ecouter(a) })[a.dataset.action]?.();
  });
}
addEventListener("keydown", (ev) => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const e = ECRANS[n], k = ev.key.toLowerCase(), surBouton = document.activeElement && document.activeElement.matches("button:not(.rep)");
  if (e.type === "question") {
    const i = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
    if (i >= 0 && k.length === 1) { choisir(i); ev.preventDefault(); return; }
    if (k === "escape") { aller(0); return; }
  }
  if (k === "enter" && !surBouton) {
    ev.preventDefault();
    if (e.type === "accueil") aller(1); else if (e.type === "fin") aller(0); else valider();
  }
});
LANGS.forEach(l => chargerPolice(l.police, l.natif));
$("#son").innerHTML = ICONE.son; $("#quitter").innerHTML = ICONE.croix;
$("#son").addEventListener("click", () => { sonActif = !sonActif; audio.muted = !sonActif; $("#son").innerHTML = sonActif ? ICONE.son : ICONE.muet; $("#son").setAttribute("aria-pressed", String(!sonActif)); });
$("#quitter").addEventListener("click", () => aller(0));
aller(0);
