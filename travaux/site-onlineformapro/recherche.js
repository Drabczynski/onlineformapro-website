// La recherche de l'en-tête : « Décrivez votre projet ». Un clic, ou Ctrl K (⌘ K sur Mac),
// ouvre le panneau : accès rapides, suggestions, exemples de demandes. En tapant, les accès
// se filtrent et l'on peut demander à l'assistant IA, qui répond et oriente vers les pages
// qui conviennent ; la conversation continue dans le panneau.
//
// L'assistant de la maquette répond à partir des pages du site (les textes ci-dessous en sont
// repris) : il reconnaît le sujet d'une demande à ses mots. Pour le brancher sur une vraie IA,
// servir un point d'accès et l'indiquer dans <html data-assistant="/api/assistant"> : il reçoit
// { messages: [{ role, content }] } et rend { reponse, liens: [{ texte, href }] } ; s'il ne
// répond pas, l'assistant de la maquette prend le relais.
(() => {
  const form = document.querySelector('.recherche');
  if (!form) return;
  const champ = form.querySelector('input'), panneau = form.querySelector('.recherche-panneau');
  const accueil = form.querySelector('.recherche-accueil'), conversation = form.querySelector('.recherche-conversation');
  const demander = form.querySelector('.recherche-demander'), voile = document.querySelector('.recherche-voile');
  const touche = form.querySelector('.recherche-touche');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/Mac|iPhone|iPad/.test(navigator.platform)) touche.textContent = '⌘ K';

  // ------------------------------------------------------------------ ouvrir, fermer
  const ouvert = () => !panneau.hidden;
  function ouvrir() {
    if (ouvert()) return;
    panneau.hidden = false; voile.hidden = false;
    champ.setAttribute('aria-expanded', 'true');
    document.body.classList.add('recherche-ouverte');
  }
  function fermer() {
    panneau.hidden = true; voile.hidden = true;
    champ.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('recherche-ouverte');
  }
  champ.addEventListener('focus', ouvrir);
  champ.addEventListener('click', ouvrir);
  voile.addEventListener('click', () => { fermer(); champ.blur(); });
  document.addEventListener('click', (e) => { if (ouvert() && !form.contains(e.target)) fermer(); });
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); champ.focus(); ouvrir(); }
    else if (e.key === 'Escape' && ouvert()) { fermer(); champ.blur(); }
  });

  // ------------------------------------------------------------------ filtrer en tapant
  const normal = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9&]+/g, ' ').trim();
  const elements = [...accueil.querySelectorAll('.recherche-puce:not(.recherche-exemple), .recherche-carte')];
  champ.addEventListener('input', () => {
    const q = champ.value.trim(), mots = normal(q).split(' ').filter(m => m.length > 1);
    demander.hidden = !q;
    demander.querySelector('strong').textContent = `« ${q} »`;
    for (const el of elements) el.hidden = mots.length > 0 && !mots.some(m => normal(el.textContent).includes(m));
    for (const bloc of accueil.querySelectorAll('.recherche-puces, .recherche-cartes')) {
      const titre = bloc.previousElementSibling, vide = [...bloc.children].every(c => c.hidden);
      bloc.hidden = vide; if (titre) titre.hidden = vide;
    }
  });
  for (const b of accueil.querySelectorAll('.recherche-exemple')) b.addEventListener('click', () => { champ.value = b.textContent; poser(); });

  // ------------------------------------------------------------------ ce que sait l'assistant
  // chaque sujet : ses mots (sans accents ; un mot vaut pour tous ceux qui commencent par lui,
  // une expression de plusieurs mots doit apparaître telle quelle), sa réponse, ses liens
  const SUJETS = [
    { nom: 'FastFormation', mots: ['creer', 'creation', 'concevoir', 'module', 'contenu', 'auteur', 'generer', 'scenari', 'cours', 'ressource', 'prompt', 'flashcard', 'fastformation', 'ia generative'],
      texte: 'Avec FastFormation, notre outil auteur boosté à l’intelligence artificielle, vous générez votre formation à partir de vos ressources pédagogiques ; si vous n’en avez pas, un simple prompt suffit. De la ressource au module, en quelques minutes.',
      liens: [['Découvrir FastFormation', 'outils-ia.html#fastformation']] },
    { nom: 'FastQuiz', mots: ['quiz', 'question', 'evaluer', 'evaluation', 'qcm', 'examen', 'positionnement', 'fastquiz', 'tester mes', 'tester les'],
      texte: 'FastQuiz, notre générateur de quiz alimenté par l’intelligence artificielle, vous permet d’évaluer vos apprenants sur n’importe quelle thématique de formation et à n’importe quel niveau : des centaines de questions en un clic, avec feedbacks intégrés, y compris à partir de vos documents.',
      liens: [['Découvrir FastQuiz', 'outils-ia.html#fastquiz']] },
    { nom: 'RolePlay IA', mots: ['jeu de role', 'roleplay', 'simulation', 'simuler', 'entretien', 'vente', 'vendeur', 'commercial', 'client', 'oral', 'conversation', 'avatar', 'recrut', 'entrainer', 'mise en situation', 'soft skill', 'negoci'],
      texte: 'RolePlay IA met vos apprenants face à des interlocuteurs virtuels dotés d’une véritable intelligence situationnelle (un client mécontent, une nouvelle recrue, un prospect exigeant), capables de converser de manière fluide et naturelle, à l’oral comme à l’écrit. Le droit à l’erreur est total, ce qui lève les blocages psychologiques.',
      liens: [['Découvrir RolePlay IA', 'outils-ia.html#roleplay']] },
    { nom: 'Learning Podcast', mots: ['podcast', 'audio', 'ecoute', 'talk show', 'emission'],
      texte: 'Avec Learning Podcast, deux IA se mettent à discuter sur votre thème, comme dans un véritable talk-show, et l’apprenant peut à tout moment les interrompre pour poser des questions.',
      liens: [['Découvrir Learning Podcast', 'outils-ia.html#learning-podcast']] },
    { nom: 'OnlineManager', mots: ['lms', 'plateforme', 'onlinemanager', 'suivi', 'suivre', 'diffuser', 'gerer', 'administr', 'parcours', 'groupe', 'inscri', 'blended', 'deployer'],
      texte: 'OnlineManager, notre plateforme LMS : l’efficacité, la convivialité et la simplicité pour gérer, diffuser et suivre vos formations en ligne (e-learning, blended learning, classes virtuelles), avec une prise en main immédiate et intuitive. Elle est adoptée par des PME, des organismes de formation, des universités et de grands groupes.',
      liens: [['Découvrir OnlineManager', 'lms.html']] },
    { nom: 'le reporting intégré', mots: ['reporting', 'statistique', 'tableau de bord', 'analyse', 'progression', 'kpi', 'indicateur', 'connexion'],
      texte: 'Le reporting intégré d’OnlineManager vous aide à connaître vos apprenants : du taux de progression aux fréquences de connexion, sur un individu ou un groupe d’apprenants.',
      liens: [['Côté administration', 'lms.html#administration']] },
    { nom: 'Lisy, le coach IA', mots: ['lisy', 'coach', 'accompagn', 'motiv', 'rappel', 'encourag', 'decroch'],
      texte: 'Lisy, le coach IA d’OnlineManager, intervient de manière dynamique, proactive et variée tout au long du parcours de vos apprenants : rappels, défis et encouragements personnalisés, depuis le tableau de bord et au sein des modules.',
      liens: [['Côté apprenant', 'lms.html#apprenant']] },
    { nom: 'la marque blanche', mots: ['marque blanche', 'couleurs', 'a mon image', 'a notre image', 'logo', 'charte', 'revendre', 'mes clients', 'nos clients'],
      texte: 'Votre plateforme de formation aux couleurs de votre organisation. Vos clients ont besoin d’outils pour se former ? Proposez-leur la plateforme.',
      liens: [['Configurer le LMS à votre image', 'lms.html#administration']] },
    { nom: 'OnlineVisio', mots: ['visio', 'classe virtuelle', 'classes virtuelles', 'webinaire', 'webconference', 'distanciel', 'regroupement', 'a distance'],
      texte: 'Avec OnlineVisio, organisez en quelques clics une séance de regroupement virtuelle avec vos apprenants ou vos collaborateurs.',
      liens: [['Côté apprenant', 'lms.html#apprenant']] },
    { nom: 'la sécurité et les normes', mots: ['securite', 'rgpd', 'anssi', 'scorm', 'xapi', 'aicc', 'ldap', 'sso', 'norme', 'interoperab', 'integrer', 'gdrh', 'sirh', 'heberg', 'donnees'],
      texte: 'OnlineManager est conforme aux normes AICC, SCORM et xAPI, interfaçable avec votre logiciel de GDRH ou votre annuaire LDAP, et s’adapte à votre environnement avec un respect complet du RGPD. Il est titulaire du visa de sécurité de l’ANSSI.',
      liens: [['Découvrir OnlineManager', 'lms.html']] },
    { nom: 'notre catalogue', mots: ['catalogue', 'bureautique', 'excel', 'word', 'outlook', 'langue', 'anglais', 'espagnol', 'allemand', 'savoirs de base', 'francais', 'maths', 'sante', 'prevention', 'cpf', 'certifi', 'rncp', 'titre pro', 'autocad', 'revit', 'pao', 'photoshop', 'developpement web', 'tertiaire', 'management', 'comptab', 'google', 'sur etagere', 'pret a l emploi'],
      texte: 'Notre catalogue compte plus de 6000 heures de modules e-learning opérationnels et interactifs : bureautique, langues, savoirs de base, santé, prévention, CAO-DAO, PAO, développement… Il est en accès libre : vous pouvez tester gratuitement nos formations certifiantes, sans engagement.',
      liens: [['Voir le catalogue', 'catalogue.html'], ['Accéder au catalogue', 'https://catalogue.onlineformapro.com/']] },
    { nom: 'le sur-mesure', mots: ['sur mesure', 'specifique', 'nos metiers', 'notre metier', 'mes metiers', 'culture d entreprise', 'r&d', 'studio', 'personnalise'],
      texte: 'Notre pôle R&D et d’ingénierie pédagogique conçoit des formations sur mesure adaptées à vos métiers, votre culture d’entreprise et à vos besoins.',
      liens: [['Nous contacter', 'contact.html']] },
    { nom: 'une démonstration', mots: ['demo', 'demonstration', 'tarif', 'prix', 'cout', 'combien', 'devis', 'essai', 'essayer', 'abonnement', 'licence', 'budget'],
      texte: 'Le plus simple est d’en parler avec notre équipe : 30 minutes pour découvrir Onlineformapro, une démonstration 100 % sur mesure en fonction de vos objectifs et de vos besoins.',
      liens: [['Demander une démo', 'demo.html']] },
    { nom: 'nous joindre', mots: ['contact', 'telephone', 'appeler', 'adresse', 'mail', 'joindre', 'vesoul', 'rendez vous', 'parler a quelqu'],
      texte: 'Vous pouvez nous joindre au +33 (0)3 84 76 52 44 ou à projet@onlineformapro.com. Nous sommes au 19 rue du Praley, 70000 Vesoul.',
      liens: [['Nous contacter', 'contact.html']] },
    { nom: 'le blog', mots: ['blog', 'article', 'actualite', 'lettre', 'newsletter', 'cas client', 'temoignage', 'ia act'],
      texte: 'Sur le blog : la Lettre IA de la formation, des études de cas clients et la boîte à outils du formateur.',
      liens: [['Lire le blog', 'blog.html']] },
    { nom: 'Onlineformapro', mots: ['onlineformapro', 'qui etes', 'qui est', 'societe', 'entreprise innovante', 'histoire', 'reference', 'apprenants dans'],
      texte: 'Lauréate du concours « Entreprises innovantes » dès sa création en 1999, Onlineformapro s’est rapidement imposée comme le leader de la solution globale digital learning : 25 ans de pédagogie et d’innovation technologique, 22 millions d’apprenants.',
      liens: [['L’ouverture', 'index.html'], ['Nous contacter', 'contact.html']] },
  ];
  const BONJOUR = /^(bonjour|bonsoir|salut|hello|coucou|hey)\b/;

  function reponseLocale(question) {
    const q = ' ' + normal(question) + ' ', mots = q.trim().split(' ');
    const notes = SUJETS.map(s => ({ s, n: s.mots.reduce((n, m) => n + (m.includes(' ') ? (q.includes(' ' + m) ? 2 : 0) : (mots.some(w => w.startsWith(m)) ? 1 : 0)), 0) }))
      .filter(x => x.n > 0).sort((a, b) => b.n - a.n);
    if (!notes.length && BONJOUR.test(q.trim())) {
      return { parties: [{ texte: 'Bonjour ! Décrivez votre projet de formation (créer des modules, évaluer vos apprenants, déployer une plateforme…) et je vous oriente vers la bonne solution.' }], liens: [] };
    }
    if (!notes.length) {
      return { parties: [{ texte: 'Je n’ai pas trouvé de réponse précise dans nos pages. Le mieux est d’en parler directement avec notre équipe : elle vous répond rapidement.' }], liens: [['Demander une démo', 'demo.html'], ['Nous contacter', 'contact.html']] };
    }
    const retenus = notes.slice(0, notes[1] && notes[1].n >= notes[0].n / 2 ? 2 : 1).map(x => x.s);
    const parties = retenus.length > 1
      ? [{ texte: 'Votre projet touche deux de nos solutions.' }, ...retenus.map(s => ({ nom: s.nom, texte: s.texte }))]
      : [{ texte: 'Je vous oriente vers ', nom: retenus[0].nom, fin: '.' }, { texte: retenus[0].texte }];
    const liens = [...retenus.flatMap(s => s.liens)];
    if (!liens.some(([, h]) => h === 'demo.html')) liens.push(['Demander une démo', 'demo.html']);
    return { parties, liens: liens.slice(0, 3) };
  }

  // ------------------------------------------------------------------ la conversation
  const historique = [];
  const nouveau = (balise, classe, texte) => { const el = document.createElement(balise); if (classe) el.className = classe; if (texte) el.textContent = texte; return el; };
  const attendre = (ms) => new Promise(r => setTimeout(r, calme ? 0 : ms));

  function afficherQuestion(texte) {
    const m = nouveau('div', 'message message--vous');
    m.append(nouveau('p', '', texte));
    conversation.append(m);
  }
  async function afficherReponse({ parties, liens }) {
    const m = nouveau('div', 'message message--ia'), corps = nouveau('div', 'message-corps');
    m.append(nouveau('span', 'recherche-ia'), corps);
    conversation.append(m);
    const points = nouveau('p', 'message-points', '');
    points.append(nouveau('span'), nouveau('span'), nouveau('span'));
    corps.append(points);
    panneau.scrollTop = panneau.scrollHeight;
    await attendre(650);
    points.remove();
    // le texte s'écrit mot à mot
    for (const partie of parties) {
      const p = nouveau('p');
      corps.append(p);
      const morceaux = [];
      if (partie.nom && partie.fin) morceaux.push([partie.texte, false], [partie.nom, true], [partie.fin, false]);
      else if (partie.nom) morceaux.push([partie.nom + ' : ', true], [partie.texte, false]);
      else morceaux.push([partie.texte, false]);
      for (const [texte, gras] of morceaux) {
        const cible = gras ? p.appendChild(nouveau('strong')) : p;
        for (const mot of texte.split(/(\s+)/)) { cible.append(mot); if (!calme && mot.trim()) await attendre(18); }
      }
      panneau.scrollTop = panneau.scrollHeight;
    }
    if (liens.length) {
      const l = nouveau('div', 'message-liens');
      for (const [texte, href] of liens) {
        const a = nouveau('a', 'message-lien', texte);
        a.href = href;
        if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
        l.append(a);
      }
      corps.append(l);
    }
    panneau.scrollTop = panneau.scrollHeight;
  }
  async function repondre(question) {
    const url = document.documentElement.dataset.assistant;
    if (url) {
      try {
        const ctrl = new AbortController(), minuteur = setTimeout(() => ctrl.abort(), 12000);
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: historique }), signal: ctrl.signal });
        clearTimeout(minuteur);
        if (r.ok) {
          const d = await r.json();
          return { parties: [{ texte: d.reponse }], liens: (d.liens || []).map(x => [x.texte, x.href]) };
        }
      } catch (e) { /* l'assistant de la maquette prend le relais */ }
    }
    return reponseLocale(question);
  }

  let occupe = false;
  async function poser() {
    const question = champ.value.trim();
    if (!question || occupe) return;
    occupe = true;
    ouvrir();
    accueil.hidden = true; conversation.hidden = false;
    if (!conversation.querySelector('.recherche-retour')) {
      const retour = nouveau('button', 'recherche-retour', '← Nouvelle recherche');
      retour.type = 'button';
      retour.addEventListener('click', () => { conversation.replaceChildren(); historique.length = 0; conversation.hidden = true; accueil.hidden = false; champ.placeholder = 'Décrivez votre projet'; champ.focus(); });
      conversation.append(retour);
    }
    afficherQuestion(question);
    historique.push({ role: 'user', content: question });
    champ.value = ''; demander.hidden = true;
    for (const el of accueil.querySelectorAll('[hidden]:not(.recherche-demander)')) el.hidden = false;
    const r = await repondre(question);
    historique.push({ role: 'assistant', content: r.parties.map(p => (p.nom ? p.nom + ' : ' : '') + p.texte).join(' ') });
    await afficherReponse(r);
    champ.placeholder = 'Posez une autre question';
    occupe = false;
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); poser(); });
})();
