// La recherche de l'en-tête : « Décrivez votre projet ». Un clic, ou Ctrl K (⌘ K sur Mac),
// ouvre le panneau : accès rapides, suggestions, exemples de demandes. En tapant, les accès
// se filtrent et l'on peut demander à l'assistant IA ; la conversation continue dans le
// panneau, une réponse à la fois.
//
// L'assistant de la maquette répond à partir des pages du site (les textes ci-dessous en sont
// repris) : il reconnaît le sujet d'une demande à ses mots, suit le fil (« et sur mobile ? »
// après une question sur FastFormation) et ne répète pas ce qu'il a déjà dit. Pour une vraie
// conversation, le brancher sur une IA : servir un point d'accès (voir travaux/assistant/) et
// l'indiquer dans <html data-assistant="…"> ; il reçoit { messages: [{ role, content }] } et
// rend { reponse, liens: [{ texte, href }], relances: […] } ; s'il ne répond pas, l'assistant
// de la maquette prend le relais.
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
  // la classe recherche-ouverte (sur <body>) déplie le panneau, élargit le champ et voile la
  // page, en transitions (marque.css)
  const ouvert = () => document.body.classList.contains('recherche-ouverte');
  function ouvrir() {
    if (ouvert()) return;
    champ.setAttribute('aria-expanded', 'true');
    document.body.classList.add('recherche-ouverte');
  }
  function fermer() {
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
  // Chaque sujet : ses mots (sans accents ; un mot vaut pour tous ceux qui commencent par lui,
  // une expression de plusieurs mots doit apparaître telle quelle et compte double, comme un mot
  // marqué « ! », propre au sujet), sa présentation, sa version
  // courte (quand on compare deux sujets), ses précisions (chacune avec ses mots ; « inclus » :
  // déjà dite par la présentation), le lien « Découvrir » qui lui correspond et deux relances. Les textes sont repris des pages du site.
  const SUJETS = [
    { nom: 'FastFormation', mots: ['creer', 'creation', 'concevoir', 'module', 'contenu', 'auteur', 'generer', 'scenari', 'cours', 'prompt', 'flashcard', '!fastformation', 'ia generative'],
      texte: 'Pour créer vos modules, il y a FastFormation, notre outil auteur boosté à l’intelligence artificielle : vous générez votre formation à partir de vos ressources pédagogiques, et si vous n’en avez pas, un simple prompt suffit. De la ressource au module, en quelques minutes.',
      court: 'FastFormation crée vos modules de formation à partir de vos ressources, ou d’un simple prompt.',
      details: [
        { mots: ['activit', 'flashcard', 'vrai faux', 'mise en situation', 'interacti', 'engage', 'quoi dedans', 'type'], texte: 'FastFormation génère une multitude d’activités : mises en situation, flashcards, podcast, vrai/faux… pour des modules vivants et engageants.' },
        { mots: ['mobile', 'tablette', 'telephone', 'smartphone', 'partout'], texte: 'Oui : les formations créées avec FastFormation sont disponibles sur mobile et tablette, partout et en tout temps.' },
        { mots: ['ressource', 'document', 'pdf', 'support', 'partir de', 'sans contenu', 'rien'], texte: 'Vous partez de vos ressources pédagogiques ; si vous n’en avez pas, un simple prompt suffit.', inclus: true },
        { mots: ['coach', 'lisy', 'conseil', 'point faible', 'accompagn'], texte: 'Dans les modules, Lisy, un coach virtuel IA, analyse les réponses, détecte les points faibles, encourage les réussites et propose des conseils personnalisés.' },
      ],
      lien: ['Découvrir FastFormation', 'outils-ia.html#fastformation'], relances: ['Quelles activités peut-il générer ?', 'Ça marche sur mobile ?'] },
    { nom: 'FastQuiz', mots: ['!quiz', 'question', 'evaluer', 'evaluation', '!qcm', 'examen', '!fastquiz', 'tester mes', 'tester les'],
      texte: 'Pour évaluer vos apprenants, FastQuiz génère des quiz grâce à l’intelligence artificielle, sur n’importe quelle thématique et à n’importe quel niveau : des centaines de questions en un clic, avec feedbacks intégrés, prêtes à être déployées.',
      court: 'FastQuiz génère vos quiz d’évaluation en quelques secondes.',
      details: [
        { mots: ['type', 'genre', 'format', 'combien de sorte'], texte: 'FastQuiz génère et vous laisse éditer 5 types de questions, toutes pouvant être générées automatiquement.' },
        { mots: ['document', 'pdf', 'docx', 'word', 'fichier', 'partir de', 'support'], texte: 'Oui : la génération automatique de quiz à partir de vos documents PDF ou DOCX, c’est aujourd’hui possible.' },
        { mots: ['image', 'illustr', 'photo', 'visuel'], texte: 'L’IA vous propose des images libres de droits en rapport avec vos questions.' },
        { mots: ['feedback', 'correction', 'corrige', 'explication'], texte: 'Chaque question arrive avec son feedback intégré, prête à être déployée à vos apprenants.' },
      ],
      lien: ['Découvrir FastQuiz', 'outils-ia.html#fastquiz'], relances: ['Depuis mes documents PDF ?', 'Quels types de questions ?'] },
    { nom: 'RolePlay IA', mots: ['jeu de role', 'jeux de role', '!roleplay', '!simulation', 'simuler', 'entretien', 'vente', 'vendeur', 'commercial', 'client', 'oral', 'avatar', 'recrut', 'entrainer', 'mise en situation', 'soft skill', 'negoci', 'manager'],
      texte: 'RolePlay IA met vos apprenants face à des interlocuteurs virtuels dotés d’une véritable intelligence situationnelle : un client mécontent, une nouvelle recrue, un prospect exigeant. Ils conversent de manière fluide et naturelle, à l’oral comme à l’écrit.',
      court: 'RolePlay IA entraîne vos équipes face à des interlocuteurs virtuels, à l’oral comme à l’écrit.',
      details: [
        { mots: ['metier', 'process', 'catalogue produit', 'grille', 'personnalis', 'adapter', 'mon entreprise', 'nos produits'], texte: 'Vous importez votre ADN métier : vos processus, vos catalogues produits et vos grilles d’évaluation.' },
        { mots: ['erreur', 'stress', 'peur', 'pression', 'timide', 'bloc'], texte: 'L’immersion se fait sans pression : le droit à l’erreur est total, ce qui lève les blocages psychologiques.' },
        { mots: ['roi', 'mesur', 'performance', 'resultat', 'note', 'evalu', 'feedback'], texte: 'Le ROI est mesurable : l’outil analyse instantanément la performance selon vos critères d’évaluation.' },
        { mots: ['avatar', 'agent', 'personnage', 'naturel', 'voix'], texte: 'L’IA génère des avatars sur mesure, qui conversent de manière fluide et naturelle.' },
      ],
      lien: ['Découvrir RolePlay IA', 'outils-ia.html#roleplay'], relances: ['Peut-on l’adapter à nos produits ?', 'Comment mesure-t-on les progrès ?'] },
    { nom: 'Learning Podcast', mots: ['!podcast', 'audio', 'ecoute', 'talk show', 'emission'],
      texte: 'Avec Learning Podcast, deux IA discutent de votre thème comme dans un véritable talk-show, et l’apprenant peut à tout moment les interrompre pour poser ses questions.',
      court: 'Learning Podcast transforme un thème en talk-show interactif entre deux IA.',
      details: [
        { mots: ['source', 'document', 'video', 'youtube', 'page web', 'image', 'partir de'], texte: 'Toutes vos sources conviennent : documents, audio et vidéo, images, pages web et YouTube ; l’IA en extrait la matière.' },
        { mots: ['script', 'modifier', 'editer', 'personnalis', 'controle'], texte: 'Vous éditez le script : ajoutez des sujets, des précisions ou des exemples, l’IA intègre vos modifications.' },
        { mots: ['recent', 'actualite', 'web', 'a jour', 'internet'], texte: 'Une recherche web intégrée enrichit le script avec des informations récentes, en un seul clic.' },
      ],
      lien: ['Découvrir Learning Podcast', 'outils-ia.html#learning-podcast'], relances: ['À partir de quelles sources ?', 'Peut-on modifier le script ?'] },
    { nom: 'OnlineManager', mots: ['!lms', 'plateforme', '!onlinemanager', 'suivi', 'suivre', 'diffuser', 'gerer', 'administr', 'parcours', 'groupe', 'inscri', 'blended', 'deployer', 'distance'],
      texte: 'Je vous oriente vers OnlineManager, notre plateforme LMS : l’efficacité, la convivialité et la simplicité pour gérer, diffuser et suivre vos formations en ligne. Elle est adoptée par des PME, des organismes de formation, des universités et de grands groupes.',
      court: 'OnlineManager est notre plateforme LMS, pour gérer, diffuser et suivre vos formations.',
      details: [
        { mots: ['mobile', 'tablette', 'telephone', 'smartphone', 'appareil', 'responsive'], texte: 'Oui : mobile, tablette ou ordinateur de bureau, l’interface d’OnlineManager s’adapte parfaitement à vos outils.' },
        { mots: ['simple', 'facile', 'intuiti', 'novice', 'prise en main', 'ergonom'], texte: 'Les interfaces d’OnlineManager ont été conçues pour tout type d’utilisateur : expérimenté ou novice, vous profitez d’un système ergonomique, confortable et intuitif.' },
        { mots: ['individualis', 'adaptati', 'personnalis', 'chaque apprenant', 'sur mesure'], texte: 'OnlineManager permet d’individualiser les parcours de formation en fonction des besoins de chaque apprenant : c’est l’adaptative learning.' },
        { mots: ['entite', 'niveau', 'filiale', 'multi', 'site'], texte: 'La plateforme est multiniveaux : entrez un nombre illimité d’entités et de niveaux, et retrouvez-les en un clin d’œil.' },
        { mots: ['langue', 'anglais', 'international', 'traduction'], texte: 'OnlineManager intègre 15 langues.' },
        { mots: ['social', 'chat', 'forum', 'agenda', 'fichier', 'communaute', 'collabor'], texte: 'Côté apprenant, on trouve des outils collaboratifs : chat et forums, agenda partagé, fichiers et ressources mutualisés.' },
        { mots: ['contenu existant', 'mes contenus', 'nos contenus', 'importer', 'integrer'], texte: 'Vous pouvez y intégrer vos contenus existants : la plateforme est conforme aux normes AICC, SCORM et xAPI.' },
        { mots: ['securi', 'rgpd', 'anssi', 'cyber', 'protection'], texte: 'Oui. OnlineManager est titulaire du visa de sécurité de l’ANSSI, et 10 % de notre budget de développement est consacré à la cybersécurité. Les données sont hébergées en France et soumises au RGPD.' },
      ],
      lien: ['Découvrir OnlineManager', 'lms.html'], relances: ['C’est sécurisé ?', 'On peut suivre la progression ?'] },
    { nom: 'le reporting intégré', mots: ['!reporting', 'statistique', 'tableau de bord', 'analyse', 'progression', 'kpi', 'indicateur', 'connexion'],
      texte: 'Le reporting intégré d’OnlineManager vous aide à connaître vos apprenants : du taux de progression aux fréquences de connexion, toutes leurs habitudes sont là, sur un individu ou un groupe d’apprenants.',
      court: 'Le reporting intégré suit la progression de chaque apprenant.',
      details: [], lien: ['Découvrir le reporting', 'lms.html#administration'], relances: ['Et le coach IA pour les apprenants ?'] },
    { nom: 'Lisy', mots: ['!lisy', 'coach', 'motiv', 'rappel', 'encourag', 'decroch', 'engagement'],
      texte: 'Lisy, le coach IA d’OnlineManager, intervient de manière dynamique, proactive et variée tout au long du parcours : rappels, défis et encouragements personnalisés, depuis le tableau de bord et au sein des modules.',
      court: 'Lisy, le coach IA, accompagne et relance vos apprenants.',
      details: [], lien: ['Découvrir Lisy', 'lms.html#apprenant'], relances: ['Et pour suivre leurs résultats ?'] },
    { nom: 'la marque blanche', mots: ['marque blanche', 'couleurs', 'a mon image', 'a notre image', 'logo', 'charte', 'revendre', 'mes clients', 'nos clients'],
      texte: 'Votre plateforme peut être aux couleurs de votre organisation. Et si vos clients ont besoin d’outils pour se former, vous pouvez étendre l’utilisation du LMS en leur proposant la plateforme.',
      court: 'La plateforme peut être aux couleurs de votre organisation.',
      details: [], lien: ['Découvrir la marque blanche', 'lms.html#administration'], relances: ['C’est sécurisé ?'] },
    { nom: 'OnlineVisio', mots: ['!visio', 'classe virtuelle', 'classes virtuelles', 'webinaire', 'webconference', 'distanciel', 'regroupement'],
      texte: 'Avec OnlineVisio, vous organisez en quelques clics une séance de regroupement virtuelle avec vos apprenants ou vos collaborateurs.',
      court: 'OnlineVisio organise vos classes virtuelles en quelques clics.',
      details: [], lien: ['Découvrir l’espace apprenant', 'lms.html#apprenant'], relances: ['Et la plateforme LMS ?'] },
    { nom: 'la sécurité', mots: ['securi', '!rgpd', '!anssi', 'scorm', 'xapi', 'aicc', 'ldap', 'sso', 'norme', 'interoperab', 'gdrh', 'sirh', 'heberg', 'donnees', 'cyber', 'serveur', 'saas', 'cloud'],
      texte: 'Oui. OnlineManager est titulaire du visa de sécurité de l’ANSSI, et 10 % de notre budget de développement est consacré à la cybersécurité. Les données sont hébergées en France et soumises au RGPD.',
      court: 'La plateforme est titulaire du visa de sécurité de l’ANSSI ; données hébergées en France.',
      details: [
        { mots: ['heberg', 'serveur', 'saas', 'cloud', 'data center', 'sauvegard', 'dedie'], texte: 'La solution est en mode SaaS, sur serveur mutualisé ou dédié, opérationnelle 24 h/24 : données hébergées en France, sauvegarde quotidienne, alimentation, climatisation et réseau redondants.' },
        { mots: ['scorm', 'xapi', 'aicc', 'norme', 'ldap', 'gdrh', 'sirh', 'interoperab', 'connect', 'annuaire'], texte: 'OnlineManager est conforme aux normes AICC, SCORM et xAPI, et interfaçable avec votre logiciel de GDRH ou votre annuaire LDAP.' },
      ],
      lien: ['Voir les spécifications techniques', 'lms.html#titre-specs'], relances: ['Où sont hébergées les données ?', 'Compatible SCORM ?'] },
    { nom: 'notre catalogue', mots: ['!catalogue', 'bureautique', 'excel', 'word', 'outlook', 'powerpoint', 'langue', 'anglais', 'espagnol', 'allemand', 'savoirs de base', 'francais', 'maths', 'sante', 'prevention', 'cpf', 'certifi', 'rncp', 'titre pro', 'autocad', 'revit', 'pao', 'photoshop', 'developpement web', 'tertiaire', 'management', 'comptab', 'google', 'sur etagere', 'pret a l emploi', 'formations existantes'],
      texte: 'Notre catalogue compte plus de 6000 heures de modules e-learning opérationnels et interactifs : bureautique, langues, savoirs de base, santé, prévention, CAO-DAO, PAO, développement… Il est en accès libre : vous pouvez tester gratuitement nos formations certifiantes.',
      court: 'Notre catalogue compte plus de 6000 heures de modules e-learning prêts à l’emploi.',
      details: [
        { mots: ['certifi', 'rncp', 'titre pro', ' rs ', 'diplom', 'cpf'], texte: 'Le catalogue propose des parcours RNCP, RS et titres pro, en accès libre, dès maintenant.' },
        { mots: ['duree', 'combien de temps', 'heure', 'long', 'lecon'], texte: 'Un module dure une heure en moyenne et compte 4 à 7 leçons, chacune avec un objectif pédagogique précis.' },
        { mots: ['lms', 'integrer', 'scorm', 'ma plateforme', 'notre plateforme', 'autre plateforme'], texte: 'Toutes nos productions respectent les normes SCORM, AICC et xAPI : elles s’intègrent à toute plateforme LMS du marché.' },
        { mots: ['tester', 'essai', 'gratuit', 'essayer'], texte: 'Oui : le catalogue est en accès libre, vous pouvez tester gratuitement nos formations certifiantes, sans engagement, en 1 minute chrono.' },
      ],
      lien: ['Découvrir le catalogue', 'catalogue.html'], relances: ['Combien de temps dure un module ?', 'Y a-t-il des formations certifiantes ?'] },
    { nom: 'le sur-mesure', mots: ['sur mesure', 'specifique', 'nos metiers', 'notre metier', 'mes metiers', 'culture d entreprise', 'r&d', 'studio', 'developpement specifique'],
      texte: 'Notre pôle R&D et d’ingénierie pédagogique conçoit des formations sur mesure, adaptées à vos métiers, à votre culture d’entreprise et à vos besoins.',
      court: 'Notre pôle R&D conçoit des formations sur mesure.',
      details: [], lien: ['Parler de votre projet', 'contact.html'], relances: ['Et des formations prêtes à l’emploi ?'] },
    { nom: 'une démonstration', mots: ['!demo', 'demonstration', '!tarif', '!prix', 'cout', 'combien ca', 'devis', 'abonnement', 'licence', 'budget', 'rendez vous'],
      texte: 'Nos pages ne donnent pas de tarifs : le plus simple est d’en parler avec notre équipe, lors d’une démonstration de 30 minutes, 100 % sur mesure selon vos objectifs et vos besoins.',
      court: 'Une démonstration de 30 minutes, sur mesure, avec notre équipe.',
      details: [], lien: ['Réserver une démonstration', 'demo.html'], relances: [] },
    { nom: 'nous joindre', mots: ['contact', 'telephone', 'appeler', 'adresse', 'mail', 'joindre', 'vesoul', 'parler a quelqu', 'humain', 'conseiller'],
      texte: 'Vous pouvez joindre l’équipe au +33 (0)3 84 76 52 44 ou à projet@onlineformapro.com. Nous sommes au 19 rue du Praley, à Vesoul.',
      court: 'L’équipe répond au +33 (0)3 84 76 52 44.',
      details: [], lien: ['Écrire à l’équipe', 'contact.html'], relances: [] },
    { nom: 'le blog', mots: ['!blog', 'article', 'actualite', 'lettre', 'newsletter', 'cas client', 'temoignage', 'ia act'],
      texte: 'Sur le blog, vous trouverez la Lettre IA de la formation, des études de cas clients et la boîte à outils du formateur.',
      court: 'Le blog publie la Lettre IA de la formation et des cas clients.',
      details: [], lien: ['Lire le blog', 'blog.html'], relances: [] },
    { nom: 'Onlineformapro', mots: ['onlineformapro', 'qui etes', 'qui est', 'societe', 'entreprise innovante', 'histoire', 'reference', 'depuis quand', 'anciennete'],
      texte: 'Lauréate du concours « Entreprises innovantes » dès sa création en 1999, Onlineformapro s’est imposée comme le leader de la solution globale digital learning : 25 ans de pédagogie et d’innovation technologique, 22 millions d’apprenants.',
      court: 'Onlineformapro, depuis 1999 : 25 ans d’innovation, 22 millions d’apprenants.',
      details: [], lien: null, relances: ['Quelles sont vos solutions ?'] },
    { nom: 'nos solutions', mots: ['solutions', 'que proposez', 'que faites', 'vos outils', 'offre', 'gamme'],
      texte: 'Une solution globale : une plateforme LMS (OnlineManager), des outils auteur dopés à l’IA (FastFormation, FastQuiz, Learning Podcast, RolePlay IA), un catalogue de plus de 6000 heures de modules et des formations sur mesure.',
      court: 'Une plateforme LMS, des outils IA, un catalogue et du sur-mesure.',
      details: [], lien: null, relances: ['Je veux créer des modules', 'Je cherche un LMS'] },
  ];
  const BONJOUR = /^(bonjour|bonsoir|salut|hello|coucou|hey)\b/;
  const MERCI = /^(merci|super|parfait|top|genial|cool|excellent|d accord merci|ok merci)\b/;
  const QUI = /\b(qui es tu|tu es qui|t es qui|es tu un|es tu une|tu es un robot|tu es une ia|cet assistant|comment tu marches)\b/;
  const REVOIR = /^(au revoir|bye|a bientot|bonne journee|bonne soiree)\b/;
  // une relance sans sujet nommé : « et comment ça marche ? », « dites-m'en plus », « oui »…
  const ENCORE = /\b(plus|detail|precis|comment|marche|fonctionne|encore|ensuite|et apres|exemple|c est a dire|explique|dis m en|dites m en|en savoir|autre chose|quoi d autre|oui|ok|d accord|vas y)\b/;

  // le fil : le sujet en cours et les trois d'avant, ce qui a déjà été dit, les questions posées
  const fil = { sujet: null, avant: [], dits: new Set(), poses: new Set() };
  const note = (mots, q, liste) => mots.reduce((n, m) => {
    if (m.includes(' ')) return n + (q.includes(' ' + m.trim()) ? 2 : 0);
    const fort = m[0] === '!', r = fort ? m.slice(1) : m;
    return n + (liste.some(w => w.startsWith(r)) ? (fort ? 2 : 1) : 0);
  }, 0);
  // la page où l'on est : à égalité, ses sujets passent devant (« ça marche sur mobile ? » sur la
  // page LMS parle d'OnlineManager)
  const ICI = location.pathname.split('/').pop() || 'index.html';
  const dici = (s) => (s.lien && s.lien[1].split('#')[0] === ICI ? 0.5 : 0);

  function reponseLocale(question) {
    const q = ' ' + normal(question) + ' ', liste = q.trim().split(' ');
    fil.poses.add(question.trim());
    const sujets = SUJETS.map(s => ({ s, n: note(s.mots, q, liste) + (s === fil.sujet ? 0.4 : 0) + dici(s) / 5 })).filter(x => x.n >= 1).sort((a, b) => b.n - a.n);
    const precision = (s) => s.details.map(d => ({ d, n: note(d.mots, q, liste) })).filter(x => x.n > 0).sort((a, b) => b.n - a.n)[0];
    const suivante = (s) => s.details.find(d => !fil.dits.has(d.texte));
    const relances = (s) => (s ? s.relances.filter(r => !fil.poses.has(r)).slice(0, 2) : []);
    const dire = (s, texte) => {
      if (fil.sujet && fil.sujet !== s) fil.avant = [fil.sujet, ...fil.avant.filter(x => x !== fil.sujet && x !== s)].slice(0, 3);
      fil.sujet = s; fil.dits.add(texte);
      // les relances qui mèneraient à ce qui vient d'être dit ne sont plus proposées
      for (const r of s.relances) {
        const rq = ' ' + normal(r) + ' ', d = s.details.map(x => ({ x, n: note(x.mots, rq, rq.trim().split(' ')) })).sort((a, b) => b.n - a.n)[0];
        if (d && d.n > 0 && fil.dits.has(d.x.texte)) fil.poses.add(r);
      }
      return { texte, lien: s.lien, relances: relances(s) };
    };
    // une précision d'un sujet pas encore présenté : précédée de sa version courte (sans le
    // « Oui » du début), ou remplacée par la présentation si celle-ci la dit déjà
    const presenter = (s, d) => {
      if (fil.dits.has(s.texte) || s === fil.sujet) return dire(s, d.texte);
      if (d.inclus) return dire(s, s.texte);
      fil.dits.add(s.texte); fil.dits.add(d.texte);
      const reste = d.texte.replace(/^Oui[ .:]+/, '');
      return dire(s, `${s.court} ${reste.charAt(0).toUpperCase()}${reste.slice(1)}`);
    };
    const t = q.trim();
    if (!sujets.length) {
      if (BONJOUR.test(t)) return { texte: 'Bonjour ! Décrivez-moi votre projet de formation (créer des modules, évaluer vos apprenants, déployer une plateforme…) et je vous oriente.', relances: ['Je veux créer des modules', 'Je cherche un LMS'] };
      if (MERCI.test(t)) return { texte: 'Avec plaisir. Une autre question sur votre projet ?', relances: relances(fil.sujet) };
      if (REVOIR.test(t)) return { texte: 'Bonne journée ! Je reste là si une question vous revient.' };
      if (QUI.test(t)) return { texte: 'Je suis l’assistant d’Onlineformapro : je réponds à partir des pages du site et je vous oriente vers la solution qui correspond à votre projet.', relances: ['Quelles sont vos solutions ?'] };
    }
    // un sujet nommé : sa précision si la question en vise une, sinon sa présentation (ou, s'il
    // vient d'être présenté, la précision suivante) ; deux sujets à égalité : les deux en bref
    // une précision très marquée d'un autre sujet (« combien de temps dure un module ? ») l'emporte
    // sur un sujet nommé d'un seul mot courant
    const ailleurs = SUJETS.map(s => ({ s, p: precision(s) })).filter(x => x.p).sort((x, y) => y.p.n + dici(y.s) - x.p.n - dici(x.s))[0];
    if (sujets.length) {
      const [a, b] = sujets;
      if (ailleurs && ailleurs.s !== a.s && ailleurs.p.n >= 2 && ailleurs.p.n >= a.n && !precision(a.s)) return presenter(ailleurs.s, ailleurs.p.d);
      if (b && b.s !== a.s && b.n >= a.n && !precision(a.s)) {
        fil.sujet = a.s;
        return { texte: `${a.s.court} ${b.s.court}`, lien: a.s.lien, relances: relances(a.s) };
      }
      const p = precision(a.s);
      if (p) return presenter(a.s, p.d);
      if (a.s === fil.sujet && fil.dits.has(a.s.texte)) { const d = suivante(a.s); if (d) return dire(a.s, d.texte); }
      return dire(a.s, a.s.texte);
    }
    // pas de sujet nommé : on reste sur celui en cours (ou sur l'un des précédents, si la
    // question vise l'une de ses précisions)
    for (const s of fil.sujet ? [fil.sujet, ...fil.avant] : []) {
      const p = precision(s);
      if (p) return dire(s, p.d.texte);
    }
    if (fil.sujet) {
      if (ENCORE.test(q)) {
        const d = suivante(fil.sujet);
        if (d) return dire(fil.sujet, d.texte);
        return { texte: `Je vous ai dit l’essentiel de ce que nos pages disent de ${fil.sujet.nom}. Pour aller plus loin, notre équipe vous répond au +33 (0)3 84 76 52 44.`, lien: fil.sujet.lien, relances: [] };
      }
    }
    // une précision d'un autre sujet (« ça marche sur mobile ? » sans contexte…)
    if (ailleurs) return presenter(ailleurs.s, ailleurs.p.d);
    return { texte: 'Je ne trouve pas cette information dans nos pages. Notre équipe pourra vous répondre précisément, au +33 (0)3 84 76 52 44 ou à projet@onlineformapro.com.', lien: ['Écrire à l’équipe', 'contact.html'], relances: relances(fil.sujet) };
  }

  // ------------------------------------------------------------------ l'échange à l'écran
  // Une question et sa réponse à la fois : à chaque nouvelle question, l'échange précédent
  // s'efface vers le haut ; la réponse, en grand, apparaît mot à mot ; dessous, discrets, un
  // lien « Découvrir… » choisi selon la demande et deux relances.
  const historique = [];
  const nouveau = (balise, classe, texte) => { const el = document.createElement(balise); if (classe) el.className = classe; if (texte) el.textContent = texte; return el; };
  const attendre = (ms) => new Promise(r => setTimeout(r, calme ? 0 : ms));
  let echange = null;
  // la typographie française : pas de coupure avant : ; ? ! » %, après «, dans un numéro, entre
  // un nombre et son unité (le découpage en mots se fait aux seules espaces ordinaires)
  const insecables = (t) => t.replace(/ ([:;?!»%])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
    .replace(/(\d) (?=[\d(])/g, '$1\u00a0').replace(/\+33 /g, '+33\u00a0').replace(/(\d) (?=\p{L})/gu, '$1\u00a0');

  async function afficher(question, promesse) {
    if (echange) {
      const ancien = echange;
      ancien.classList.add('echange--sortie');
      await attendre(260);
      ancien.remove();
    }
    echange = nouveau('div', 'echange');
    echange.append(nouveau('p', 'echange-question', question));
    const reponse = nouveau('div', 'echange-reponse'), reflexion = nouveau('p', 'echange-reflexion');
    reflexion.append(nouveau('span'), nouveau('span'), nouveau('span'));
    reflexion.setAttribute('aria-label', 'L’assistant réfléchit');
    reponse.append(nouveau('span', 'recherche-ia'), reflexion);
    echange.append(reponse);
    conversation.append(echange);
    panneau.scrollTop = 0;
    const [r] = await Promise.all([promesse, attendre(700)]);
    reflexion.remove();
    const texte = nouveau('p', 'echange-texte');
    let i = 0;
    for (const morceau of insecables(r.texte).split(/( +)/)) {
      if (!morceau.trim()) { texte.append(morceau); continue; }
      const mot = nouveau('span', 'mot-ia', morceau);
      mot.style.setProperty('--i', Math.min(i++, 140));
      texte.append(mot);
    }
    reponse.append(texte);
    const suite = nouveau('div', 'echange-suite');
    suite.style.animationDelay = `${calme ? 0 : Math.min(i, 140) * 22 + 250}ms`;
    if (r.lien) {
      const a = nouveau('a', 'echange-lien', r.lien[0]);
      a.href = r.lien[1];
      if (/^https?:/.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; }
      suite.append(a);
    }
    if (r.relances && r.relances.length) {
      const p = nouveau('p', 'echange-relances', 'Vous pouvez aussi demander : ');
      r.relances.forEach((t, k) => {
        if (k) p.append(' · ');
        const b = nouveau('button', '', t);
        b.type = 'button';
        b.addEventListener('click', () => { champ.value = t; poser(); });
        p.append(b);
      });
      suite.append(p);
    }
    if (suite.childNodes.length) reponse.append(suite);
    return r;
  }

  async function repondre(question) {
    const url = document.documentElement.dataset.assistant;
    if (url) {
      try {
        const ctrl = new AbortController(), minuteur = setTimeout(() => ctrl.abort(), 20000);
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: historique }), signal: ctrl.signal });
        clearTimeout(minuteur);
        if (r.ok) {
          const d = await r.json();
          if (d.reponse) {
            const l = (d.liens || [])[0];
            return { texte: d.reponse, lien: l ? [l.texte, l.href] : null, relances: (d.relances || []).slice(0, 2) };
          }
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
      retour.addEventListener('click', () => {
        conversation.replaceChildren(); echange = null; historique.length = 0;
        fil.sujet = null; fil.avant = []; fil.dits.clear(); fil.poses.clear();
        conversation.hidden = true; accueil.hidden = false; champ.placeholder = 'Décrivez votre projet'; champ.focus();
      });
      conversation.append(retour);
    }
    historique.push({ role: 'user', content: question });
    champ.value = ''; demander.hidden = true;
    for (const el of accueil.querySelectorAll('[hidden]:not(.recherche-demander)')) el.hidden = false;
    const r = await afficher(question, repondre(question));
    historique.push({ role: 'assistant', content: r.texte });
    champ.placeholder = 'Posez une autre question';
    occupe = false;
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); poser(); });
})();
