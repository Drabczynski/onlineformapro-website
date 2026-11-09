"""Banque de la version 2, transcrite du PDF « EVAL POSITIONNEMENT v2 » (export PowerPoint, 67 pages).
Bonne réponse = celle écrite en vert (ou l'image encadrée en vert) dans le PDF. « deduite » : réponse non marquée
dans le PDF (diapos « Faire avec même présentation » ou réponse à écrire), déduite du texte ou de la règle.
comp : CO compréhension orale, CE compréhension écrite, EE expression écrite, EO expression orale,
LG langue (grammaire, conjugaison, vocabulaire). tag : l'étiquette du PDF. page : page du PDF."""
import json
B = []
def q(niveau, comp, tag, page, question, choix=None, bonne=None, **k):
    d = {"niveau": niveau, "comp": comp, "tag": tag, "page": page, "question": question}
    if choix is not None: d["choix"] = choix; d["bonne"] = choix.index(bonne) if isinstance(bonne, str) else bonne
    d.update(k); d.setdefault("t", "aucun"); B.append(d)
CHOISIR = "Choisissez la bonne réponse."
REPONDRE = "Que répondez-vous ?"
JEANNE = ["Salut Jeanne,", "J'ai 20 ans le 16 février ! J'organise une petite fête à la maison le samedi prochain à 17h00. Tu peux venir ? Apporte un jus de fruits si tu veux. Voici mon adresse : 10 rue des Oursons.", "J'attends ta réponse ! Bisous", "Lisa"]
LUCAS = ["Bonjour ! Je m'appelle Lucas. J'ai 22 ans et j'habite à Toulouse. Je travaille dans une boulangerie et je commence à 6 heures du matin. Le week-end, je me repose et je vais voir mes amis."]
MARIE = ["Marie est une jeune fille française. Elle habite à Lyon avec sa famille. Son père est médecin et sa mère est professeure. Le matin, Marie prend le bus pour aller au lycée. Elle aime étudier les langues et elle veut devenir avocate. Pendant le week-end, elle va souvent au café avec ses amis. Ils boivent du jus d'orange ou du café et parlent de leurs projets d'avenir."]
LYCEE = ["Ce matin, les élèves arrivent au lycée à huit heures, comme d'habitude. Le ciel est gris, il fait froid, et beaucoup d'élèves sont fatigués. Les cours commencent normalement : en maths, les élèves font des exercices ; en français, ils lisent un poème. À dix heures, pendant le cours d'histoire, un grand bruit éclate. Tout le monde sursaute : un ordinateur dans la salle informatique a explosé ! Heureusement, la salle était vide à ce moment-là. Les professeurs demandent aux élèves de sortir rapidement. Les pompiers arrivent dix minutes plus tard. Ils entrent dans le bâtiment pour vérifier que tout est en sécurité."]
JULIE = ["Julie habite dans une petite maison à la campagne. Sa maison est blanche avec un toit rouge. Devant la maison, il y a un petit jardin avec des fleurs et un arbre. Au rez-de-chaussée, il y a un salon, une cuisine et une salle de bains. Le salon est grand et lumineux. Il y a un canapé gris, une télévision et une table en bois. La cuisine est moderne, avec un frigo, une cuisinière et un petit four.", "À l'étage, il y a deux chambres : une pour Julie et une pour sa sœur. La chambre de Julie est bleue. Il y a un lit, une armoire, un bureau et une lampe. Elle aime lire dans sa chambre, surtout le soir. Derrière la maison, il y a un garage et un potager. Julie aide souvent ses parents à planter des légumes."]
LETTRE = ["Madame, Monsieur,", "Nous vous informons que votre demande de remboursement a été traitée avec succès. Le montant de 167,52 € a été crédité sur votre compte et devrait apparaître sur votre relevé bancaire dans un délai de 2 à 3 jours ouvrables.", "Nous restons à votre disposition pour toute question ou information complémentaire.", "Salutations distinguées,", "C. Dupont – service achats"]
ECOLE = ["À l'attention des parents d'élèves,", "Suite à un mouvement de grève, la réunion de ce soir n'aura pas lieu. Nous vous communiquerons la prochaine date par mail.", "Merci pour votre compréhension.", "La direction de l'école"]
# l'emploi du temps de Julien, recopié de l'image du PDF (page 56)
EDT_PDF = [["", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"],
       ["8h00-9h00", "", "", "", "Français", ""], ["9h00-9h50", "Français", "Technologie", "", "Français", "Français"],
       ["10h10-11h00", "Français", "Mathématiques", "Histoire-Géographie", "EPS (Sport)", "Français"],
       ["11h00-12h00", "Mathématiques", "Musique", "Anglais", "EPS (Sport)", "Histoire-Géographie"],
       ["12h00-13h00", "Repas", "Repas", "Repas", "Repas", "Repas"],
       ["13h00-14h00", "EPS (Sport)", "Arts plastiques", "", "", "Physique (Sciences)"],
       ["14h00-14h50", "SVT (Sciences)", "Français", "", "Anglais", "Anglais"],
       ["15h10-16h00", "", "Français", "", "Histoire-Géographie", "Mathématiques"],
       ["16h00-17h00", "", "", "", "Français", ""]]
# affiché sans le mercredi ni le vendredi, pour un tableau plus grand ; les réponses (mardi, jeudi) ne changent pas
EDT = [[l[0], l[1], l[2], l[4]] for l in EDT_PDF]

# ------------------------------------------------------------------ A1
q("A1", "EE", "EXP écrite", 1, CHOISIR, ["donne", "parle", "fait"], "parle", t="trou", phrase="Je ______ français.", indice="(parler)")
q("A1", "EE", "EXP écrite", 1, "Quel jour après lundi ?", ["dimanche", "mardi", "jeudi"], "mardi")
q("A1", "CE", "COMP écrite", 1, CHOISIR, ["fait", "est", "a"], "a", t="trou", phrase="Elle ______ une voiture.")
q("A1", "CO", "COMP orale", 1, "Qu'est-ce qu'elle fait ?", ["médecin", "étudiante"], "étudiante", t="ecoute", audio="o01", phrase="Elle est ______.")
q("A1", "EE", "EXP écrite", 2, CHOISIR, ["La", "Le", "Les"], "Le", t="trou", phrase="______ livre est intéressant.")
q("A1", "EE", "EXP écrite", 2, "Le contraire de « grand » ?", ["large", "gros", "petit"], "petit", groupe="contraire-grand")
q("A1", "CO", "COMP orale", 2, "Combien coûte un ticket ?", ["1,70 €", "1,90 €"], "1,90 €", t="ecoute", audio="o02", contexte="Vous prenez le métro et achetez un ticket au guichet automatique.")
q("A1", "CO", "COMP écrite", 3, "Elle fait des courses. Où est-elle ?", ["À la boulangerie", "Au rayon fruits et légumes", "À la fromagerie"], 0, t="ecoute", audio="o03", contexte="Vous êtes au téléphone avec votre tante.", images=["boulangerie", "primeur", "fromagerie"])
q("A1", "CO", "COMP orale", 4, "Qu'est-ce que vous devez faire ?", ["prendre l'escalier", "monter au 2e étage", "sortir du bâtiment"], "monter au 2e étage", t="ecoute", audio="o04", contexte="Au centre de santé, l'agent d'accueil vous indique le cabinet du dentiste.")
q("A1", "CO", "COMP orale", 5, "Qu'est-ce que vous apprenez sur cet appartement ?", ["sa taille", "son prix", "son étage"], "sa taille", t="ecoute", audio="o05", contexte="Vous visitez un appartement pour une location.")
q("A1", "CE", "COMP écrite", 6, "Quand est-ce que le café linguistique est ouvert ?", ["Une fois par jour", "Une fois par semaine", "Une fois par mois"], "Une fois par semaine", t="image", img="affiche-cafe", contexte="Vous lisez cette affiche.", alt="Affiche du café linguistique : tous les jeudis de 17h30 à 19h30, début des ateliers le 16 novembre.")
q("A1", "CE", "COMP écrite", 7, "Quelle image correspond à la situation ?", ["Une gare", "Un pique-nique", "Une plage"], 1, t="sms", texte="Salut tout le monde ! Il va faire beau ! On va pique-niquer au parc samedi ?", images=["gare", "pique-nique", "plage"])
q("A1", "CE", "COMP écrite", 8, "Ce message est envoyé pour ___ un rendez-vous.", ["annuler", "rappeler", "changer"], "rappeler", t="sms", texte="Cabinet Brunet – Confirmation de votre rendez-vous dentiste le 04/11 à 9h. Si vous ne pouvez pas venir, merci de nous téléphoner. Ne pas répondre à ce message automatique.")
q("A1", "CE", "COMP écrite", 8, "Vous êtes en retard. Quel message est-ce que vous envoyez ?", ["Je t'attends devant le cinéma", "J'arrive dans 2 minutes, attends-moi !", "À demain !"], 1, t="situation", emoji="🎬", texte="Vous avez rendez-vous avec un ami pour aller au cinéma.")
q("A1", "CE", "COMP écrite", 8, "Complétez la phrase.", ["je vais", "je suis", "j'ai"], "j'ai", t="trou", etiquette="Vous vous présentez au groupe.", phrase="Bonjour, je m'appelle Amir, ______ 29 ans.")
q("A1", "EE", "EXP écrite", 9, "Remettez les mots dans l'ordre.", t="ordre", contexte="Vous êtes dans la rue et vous demandez votre chemin.", avant="Excusez-moi ! Je cherche la station de métro,", apres="?", mots=["m'aider", "pouvez", "est-ce que", "vous"], ordre=[2, 3, 1, 0])
q("A1", "CE", "COM écrite", 9, "Qu'est-ce que vous dites ?", ["C'est très bon !", "C'est très loin.", "C'est à droite."], 0, t="situation", emoji="🍽️", texte="Vous déjeunez avec vos amis.")
q("A1", "EE", "EXP écrite", 10, "Quelle question posez-vous ?", ["C'est dans quelle salle ?", "Quand est-ce que la séance commence ?", "Combien de temps dure le film ?"], 1, t="situation", emoji="🎟️", texte="Vous êtes au cinéma et vous prenez votre place au guichet. Vous voulez savoir à quelle heure commence le film.")
q("A1", "LG", "Grammaire", 11, "Complétez.", ["apprends", "apprendre", "appris"], "apprends", t="trou", phrase="J'______ le français depuis 2 ans.")
for question, choix, bonne in [("C'est un message…", ["amical", "administratif", "professionnel"], "amical"),
                               ("Pourquoi la personne a-t-elle écrit ce message ?", ["Pour refuser une invitation", "Pour remercier une amie", "Pour inviter une amie"], "Pour inviter une amie"),
                               ("La personne peut apporter :", ["Un cadeau", "Un jus de fruits", "Un gâteau"], "Un jus de fruits")]:
    q("A1", "CE", "COMP écrite", 11, question, choix, bonne, t="document", titre="Message de Lisa", emoji="💌", style="", lignes=JEANNE, groupe="jeanne")
q("A1", "LG", "Grammaire", 13, "Quel est le pluriel de « un cheval » ?", ["Des chevals", "Des chevaux", "Des chevaus"], "Des chevaux", deduite=True)
q("A1", "LG", "Conjugaison", 13, CHOISIR, ["faisais", "ferai", "fait"], "ferai", t="trou", phrase="Demain, je ______ mes achats.", deduite=True)
q("A1", "LG", "Conjugaison", 13, CHOISIR, ["suis", "ai", "parle"], "ai", t="trou", phrase="Je ______ 25 ans.", deduite=True)
q("A1", "LG", "Vocabulaire", 13, CHOISIR, ["habite", "appelle", "parle"], "appelle", t="trou", phrase="Je m'______ Paul.", deduite=True)
q("A1", "LG", "Vocabulaire", 13, CHOISIR, ["du", "de la", "d'"], "du", t="trou", phrase="Je viens ______ Portugal.", deduite=True)
for question, choix, bonne in [("Où achète-t-on des médicaments ?", ["À la pharmacie", "À la boulangerie", "À l'école"], "À la pharmacie"),
                               ("Que fait-on avec un stylo ?", ["On mange", "On écrit", "On écoute"], "On écrit"),
                               ("Où va-t-on pour apprendre ?", ["À la poste", "À la gare", "À l'école"], "À l'école"),
                               ("Où achète-t-on des croissants ?", ["À la boucherie", "À la boulangerie", "À l'épicerie"], "À la boulangerie"),
                               ("Que fait-on avec des ciseaux ?", ["On mesure", "On écrit", "On coupe"], "On coupe")]:
    q("A1", "LG", "Vocabulaire", 14, question, choix, bonne)
q("A1", "CE", "COMP écrite", 14, "Quelle est la couleur du ciel quand il fait beau ?", ["jaune", "bleu", "vert"], "bleu")
q("A1", "LG", "Vocabulaire", 14, "Quel est le contraire de « grand » ?", ["gros", "petit", "long"], "petit", groupe="contraire-grand")
for phrase, choix, bonne, tag, indice in [("Tu ______.", ["ai", "as", "avais"], "as", "Conjugaison", "Le verbe « avoir » au présent"),
                                          ("Je ______ un café.", ["boivent", "bois", "bu"], "bois", "Conjugaison", "Le verbe correct au présent"),
                                          ("Le pharmacien vend ______.", ["des vêtements", "des médicaments", "des chaussures"], "des médicaments", "Vocabulaire", ""),
                                          ("Paul ______ du pain.", ["manges", "mangent", "mange"], "mange", "Conjugaison", "(manger)"),
                                          ("______ école est fermée aujourd'hui.", ["Un", "La", "L'"], "L'", "Vocabulaire", "L'article correct"),
                                          ("Le pâtissier fait et vend ______.", ["du saucisson", "des livres", "des gâteaux"], "des gâteaux", "Vocabulaire", ""),
                                          ("Je ______ un croissant.", ["manger", "mange", "dors"], "mange", "Vocabulaire", "Le verbe correct au présent"),
                                          ("Elles travaillent pour un journal ou pour la télévision. Elles sont ______.", ["factrices", "électriciennes", "journalistes"], "journalistes", "Vocabulaire", ""),
                                          ("Je ______ très fatigué aujourd'hui.", ["suis", "es", "être"], "suis", "Grammaire", ""),
                                          ("Il travaille dans un hôpital. Il est ______.", ["avocat", "facteur", "infirmier"], "infirmier", "Vocabulaire", ""),
                                          ("Nous ______ au cinéma samedi soir.", ["allez", "va", "allons"], "allons", "Conjugaison", ""),
                                          ("Tu ______ quelle langue ?", ["parles", "parlé", "parlent"], "parles", "Conjugaison", ""),
                                          ("Il y a une ______ sur la table.", ["pain", "pomme", "eau"], "pomme", "Vocabulaire", ""),
                                          ("Tu aimes lire des ______.", ["livres", "télés", "vêtements"], "livres", "Vocabulaire", ""),
                                          ("Je suis né le 9 mai 1980 ______ Marseille.", ["à", "en", "dans"], "à", "Grammaire", ""),
                                          ("Comment tu ______ au travail ?", ["es", "vas", "marches"], "vas", "Conjugaison", ""),
                                          ("Je commence ______ 8 h 00 tous les jours.", ["à", "en", "au"], "à", "Grammaire", ""),
                                          ("Le médecin travaille dans ______.", ["un hôpital", "une école", "une banque"], "un hôpital", "Vocabulaire", ""),
                                          ("99 : ______", ["quatre-vingt-neuf", "quatre-vingt-dix-neuf", "quatre-vingt-onze"], "quatre-vingt-dix-neuf", "Vocabulaire", ""),
                                          ("Je ______ deux chats.", ["ai", "es", "és"], "ai", "Conjugaison", "(avoir)")]:
    q("A1", "LG", tag, 15, CHOISIR, choix, bonne, t="trou", phrase=phrase, indice=indice)
q("A1", "LG", "Grammaire", 21, CHOISIR, ["Mon amie est anglais.", "Mon amie est anglaise.", "Moi amie est anglaise."], 1)
q("A1", "LG", "Grammaire", 25, "Choisissez la bonne phrase.", ["Elle est médecin.", "Elle est un médecin.", "Elle a médecin."], 0)
q("A1", "CE", "Comp écrite", 21, "Quel âge a Lucas ?", t="court", lignes=LUCAS, groupe="lucas", saisie=[{"accepte": ["22", "22 ans", "vingt-deux", "vingt-deux ans", "vingt deux ans", "il a 22 ans"]}], deduite=True)
q("A1", "CE", "Comp écrite", 21, "Où habite-t-il ?", t="court", lignes=LUCAS, groupe="lucas", saisie=[{"accepte": ["toulouse", "a toulouse", "il habite a toulouse"]}], deduite=True)
for phrase, mot, groupe in [("Ils ______ à la gare.", "vont", "ils-aller"), ("Nous ______ prêts.", "sommes", None), ("Nous ______ le bus.", "prenons", None)]:
    verbe = {"vont": "(aller)", "sommes": "(être)", "prenons": "(prendre)"}[mot]
    q("A1", "LG", "Conjugaison", 21, "Écrivez le verbe.", t="trou", phrase=phrase, indice=verbe, saisie=[{"accepte": [mot]}], **({"groupe": groupe} if groupe else {}))

# ------------------------------------------------------------------ A2
q("A2", "EE", "EXP écrite", 34, "Laquelle de ces phrases est correcte ?", ["Mes amis ne mangent que des produits végétariens.", "Mes amis mangent pas produits végétariens.", "Mes amis produits mangent végétariens."], 0)
q("A2", "EE", "EXP écrite", 34, CHOISIR, ["dont", "que", "quel"], "dont", t="trou", phrase="C'est un film ______ je t'ai parlé.")
q("A2", "LG", "Conjugaison", 34, CHOISIR, ["va", "vont", "sont"], "vont", t="trou", phrase="Ils ______ à la gare.", indice="(aller)", groupe="ils-aller")
q("A2", "LG", "Grammaire", 35, "Que pourrions-nous faire en attendant ?", ["Nous pouvons aller manger", "Une heure trente", "Seulement s'il ne neige pas"], 0, t="sms", texte="Il est midi et le train vers Paris ne part qu'à trois heures de l'après-midi. S'il ne neige pas, nous devrions être à Paris vers quatre heures et demie. Que pourrions-nous faire en attendant ?")
q("A2", "CE", "COMP écrite", 37, "De quoi s'agit-il ?", ["D'une publicité", "D'une commande", "D'un menu"], 0, t="court", lignes=["« Une pizza medium coûte 10 €, mais sur présentation de ce bon, vous recevez en plus de délicieux pains à l'ail d'une valeur de 2 €. »"])
q("A2", "EO", "EXP orale", 39, "Qu'est-ce que vous dites ?", ["Bonjour, je voudrais refaire mon passeport.", "Bonjour, je veux envoyer une lettre en recommandé.", "Bonjour, je veux prendre un billet de train."], 1, t="situation", emoji="📮", texte="Vous êtes au guichet de la poste.", audios=["poste-1", "poste-2", "poste-3"])
q("A2", "CO", "COMP orale", 40, "De quoi est-ce que ça parle ?", ["Il est interdit de fumer", "Il est interdit de manger et de boire", "Il faut éteindre son téléphone"], 2, t="ecoute", audio="o06", images=["interdit-fumer", "interdit-manger", "interdit-telephone"])
q("A2", "CE", "COMP écrite", 37, REPONDRE, ["Vers 10 heures", "Seule", "On ne s'est pas vu"], 0, t="sms", texte="Bonjour, je suis très contente que tu viennes chez moi samedi. Quand penses-tu arriver ?")
q("A2", "CO", "COMP orale", 40, "Qu'est-ce qu'on apprend sur Margaret Marie ?", ["C'est une journaliste, la plus connue au monde", "C'est la femme la plus âgée au monde", "C'est une dame qui a eu 10 enfants"], 1, t="ecoute", audio="o07")
q("A2", "EE", "EXP écrite", 40, "Complétez le message.", ["les", "y", "en"], "les", t="sms", contexte="Vous envoyez un message à votre colocataire.", texte="J'ai oublié les billets pour le concert de ce soir. Ils sont sur mon bureau. Pense à ______ prendre, s'il te plaît ! Merci !")
q("A2", "CO", "COMP orale", 41, "Est-il possible de choisir une viande sur la carte ?", ["Oui, mais pas tous les jours", "Oui", "Non, que des poissons et des desserts"], 1, t="ecoute", audio="o08", contexte="Au restaurant, le serveur présente la carte.")
q("A2", "CE", "COMP écrite", 42, "Qu'est-ce que cette lettre vous annonce ?", ["Un versement sur votre compte", "Un paiement réalisé depuis votre compte", "Une facture à régler rapidement"], 0, t="document", titre="Lettre reçue", emoji="✉️", style="courrier", lignes=LETTRE)
q("A2", "EE", "EXP écrite", 42, "Complétez la question au serveur.", ["Est-ce que", "Qu'est-ce que", "Qui"], "Qu'est-ce que", t="trou", etiquette="Au restaurant, vous posez une question au serveur.", phrase="______ vous me conseillez ?", deduite=True)
q("A2", "CE", "COMP écrite", 43, "Vous n'êtes pas disponible. Quel est le bon message ?", ["Avec plaisir ! J'adore la natation.", "Ah, dommage ! Je pars ce week-end."], 1, t="sms", etiquette="Vous recevez une invitation", texte="Tu ne vas pas me croire ! J'ai gagné deux places pour la finale de rugby samedi au stade de France ! Tu viens avec moi ?")
q("A2", "CE", "COMP écrite", 43, "Qu'est-ce qu'on apprend sur la réunion ?", ["Elle est reportée", "Elle est annulée", "Comment inscrire son enfant à l'école"], 0, t="document", titre="Panneau devant l'école", emoji="🏫", style="affiche", lignes=ECOLE)
q("A2", "CE", "COMP écrite", 44, "Où habite Marie ?", ["À Lyon", "À Paris", "À Nice"], 0, t="document", titre="Marie", emoji="👧", style="", lignes=MARIE, groupe="marie")
q("A2", "CE", "COMP écrite", 61, "Quelle est la profession de son père ?", ["professeur", "médecin", "avocat"], 1, t="document", titre="Marie", emoji="👧", style="", lignes=MARIE, groupe="marie")
for phrase, choix, bonne in [("Vous ______ italien.", ["est", "êtes", "sommes"], "êtes"),
                             ("Sylvie ______ souvent à la piscine.", ["vais", "va", "vont"], "va"),
                             ("Il mange en ______ la télévision.", ["regardait", "regardant", "regarde"], "regardant"),
                             ("Monsieur Martin et ______ femme sont très sympathiques.", ["son", "ses", "sa"], "sa"),
                             ("Pour aller à la poste, vous tournez ______.", ["à la droite", "tout droit", "à droite"], "à droite"),
                             ("Quand j'habitais à Paris, ______ le métro tous les jours.", ["j'ai pris", "je prendrais", "je prenais"], "je prenais"),
                             ("Je suis allée voir un film ______ était très intéressant.", ["que", "où", "qui"], "qui"),
                             ("Chaque matin, Paul ______ son café à la maison.", ["a bu", "boit", "boire"], "boit"),
                             ("Quand elle était petite, elle ______ toujours avec son frère.", ["joue", "jouait", "jouera"], "jouait"),
                             ("Tu connais Marie ? Oui, je ______ connais.", ["le", "la", "lui"], "la"),
                             ("Je n'ai vu ______ dans le jardin.", ["tout le monde", "personne", "quelqu'un"], "personne"),
                             ("Hier, nous ______ un film très drôle.", ["regardons", "regarder", "avons regardé"], "avons regardé"),
                             ("Demain, nous ______ une promenade au parc.", ["fait", "faire", "ferons"], "ferons"),
                             ("C'est mon stylo. Où est le ______ ?", ["mien", "tienne", "tien"], "tien"),
                             ("La ville ______ j'habite est très calme.", ["que", "qui", "où"], "où"),
                             ("Ce film était tellement ______ que tout le monde a ri.", ["triste", "drôle", "ennuyeux"], "drôle"),
                             ("Quand il pleut, je prends un ______.", ["chapeau", "parapluie", "sac"], "parapluie")]:
    q("A2", "LG", "Grammaire / Vocabulaire", 45, CHOISIR, choix, bonne, t="trou", phrase=phrase)
q("A2", "LG", "Grammaire / Vocabulaire", 47, "Mon numéro de téléphone, c'est le soixante-dix-huit, quatre-vingt-un, quarante, quatre-vingt-douze.", ["68-41-40-82", "78-81-40-92", "78-41-40-92"], 1)
q("A2", "LG", "Grammaire / Vocabulaire", 53, "Cochez le mot contraire de « propre ».", ["plein", "sale", "chaud"], "sale")
q("A2", "LG", "Grammaire / Vocabulaire", 55, "Cochez le mot contraire de « chaud ».", ["sec", "tiède", "froid"], "froid")
q("A2", "LG", "Grammaire / Vocabulaire", 55, "Le mot « quartier » désigne :", ["un village", "une maison", "une partie d'une ville"], 2)
q("A2", "CE", "Compréhension écrite", 56, "Quel jour Julien commence-t-il à 8h ?", t="document", titre="L'emploi du temps de Julien", emoji="🗓️", style="", tableau=EDT, groupe="julien", saisie=[{"etiquette": "Jour", "accepte": ["jeudi", "le jeudi"]}], deduite=True)
q("A2", "CE", "Compréhension écrite", 56, "Quel jour et à quelle heure Julien a-t-il cours d'arts plastiques ?", t="document", titre="L'emploi du temps de Julien", emoji="🗓️", style="", tableau=EDT, groupe="julien", saisie=[{"etiquette": "Jour", "accepte": ["mardi", "le mardi"]}, {"etiquette": "Heure", "accepte": ["re:^(a |de )?13 ?(h|heures?)( ?00)?( ?(a|-) ?14 ?(h|heures?)( ?00)?)?$"]}], deduite=True)

# ------------------------------------------------------------------ B1
q("B1", "CE", "COMP écrite", 59, REPONDRE, ["Je serai accompagné de mon collègue.", "Non, pas de souci.", "En voiture."], 0, t="sms", texte="La réunion aura lieu demain matin dans nos bureaux. Vous pouvez vous garer dans le parking réservé à la clientèle. Nos bureaux se trouvent au 1er étage du bâtiment principal. Viendrez-vous seul ?")
q("B1", "CE", "COMP écrite", 60, REPONDRE, ["Bonne idée ! À 16h.", "Certainement, à 10h.", "Le musée est ouvert le matin."], 0, t="sms", texte="Comme tu n'es pas disponible le matin, pourrions-nous aller au musée en fin d'après-midi ?")
q("B1", "CE", "COMP écrite", 62, "Comment Marie va-t-elle au lycée ?", ["À pied", "En voiture", "En bus"], 2, t="document", titre="Marie", emoji="👧", style="", lignes=MARIE, groupe="marie")
q("B1", "CE", "COMP écrite", 62, "Que veut faire Marie plus tard ?", ["Être professeure", "Être médecin", "Être avocate"], 2, t="document", titre="Marie", emoji="👧", style="", lignes=MARIE, groupe="marie")
for question, choix, bonne in [("À quelle heure commencent les cours ?", ["À neuf heures", "À huit heures", "À dix heures"], 1),
                               ("Pourquoi les élèves sortent-ils dans la cour ?", ["Ils ont fini les cours", "Ils partent en sport", "Les professeurs le demandent"], 2),
                               ("Que se passe-t-il pendant le cours d'histoire ?", ["Une élève tombe", "Un ordinateur explose", "Un professeur est malade"], 1),
                               ("Que font les pompiers ?", ["Ils donnent un cours de sécurité", "Ils vérifient le bâtiment", "Ils éteignent un feu"], 1)]:
    q("B1", "CE", "COMP écrite", 63, question, choix, bonne, t="document", titre="Au lycée", emoji="🏫", style="", lignes=LYCEE, groupe="lycee")
for question, choix, bonne in [("Que fait Julie dans sa chambre le soir ?", ["Elle regarde la télévision", "Elle dort", "Elle lit"], 2),
                               ("Où se trouve le garage ?", ["En face de la maison", "Derrière la maison", "Il n'y a pas de garage"], 1)]:
    q("B1", "CE", "COMP écrite", 65, question, choix, bonne, t="document", titre="La maison de Julie", emoji="🏡", style="", lignes=JULIE, groupe="julie")
q("B1", "EE", "EXP écrite", 66, "Qu'écrivez-vous ?", ["Je vous remercie pour votre message. Étant en vacances, je ne peux pas traiter votre problème.", "Je vous remercie pour votre message. Je vous répondrai dès mon retour de congés, le 7 avril. Pour une demande urgente, merci de contacter rh@travail.fr. Cordialement."], 1, t="situation", emoji="🏖️", texte="Vous n'êtes pas au bureau pour quelques jours et vous laissez un message automatique d'absence.")
q("B1", "CO", "COMP orale", 67, "Qu'apprend-on sur Marie-Louise ?", ["Elle ne peut plus garder son taxi", "Elle exerce plusieurs métiers", "Elle cherche des clients"], 1, t="ecoute", audio="o11", contexte="Vous écoutez un reportage à Abidjan.")

compte = {}
for k, d in enumerate(B, 1):
    compte[d["niveau"]] = compte.get(d["niveau"], 0) + 1
    d["id"] = f"{d['niveau']}-{compte[d['niveau']]:02d}"
    d["groupe"] = d["niveau"] + ":" + d.get("groupe", d["id"])
# Expression écrite à mot court : la réponse s'écrit en touchant des lettres. Les lettres proposées sont celles des
# choix du PDF (chaque lettre autant de fois qu'elle apparaît au plus dans un choix), sans indice sur la longueur.
import re, collections
for d in B:
    if d["comp"] == "EE" and d.get("choix") and all(re.fullmatch(r"[^\W\d_]{1,8}", c) for c in d["choix"]):
        maxi = {}
        for c in d["choix"]:
            for l, n in collections.Counter(c.lower()).items(): maxi[l] = max(maxi.get(l, 0), n)
        d["lettres"] = sorted(l for l, n in maxi.items() for _ in range(n))
        if d["question"] == CHOISIR: d["question"] = "Complétez la phrase."
import os
json.dump(B, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "banque-v2.json"), "w"), ensure_ascii=False, indent=1)
import collections
print("à écrire en lettres :", [(d["id"], "".join(d["lettres"])) for d in B if d.get("lettres")])
print(len(B), "questions ;", dict(collections.Counter((d["niveau"], d["comp"]) for d in B)))
print("groupes par niveau :", {n: len({d["groupe"] for d in B if d["niveau"] == n}) for n in ("A1", "A2", "B1")})
print("réponses déduites :", sum(1 for d in B if d.get("deduite")), "; à saisir :", sum(1 for d in B if d.get("saisie")), "; images :", sum(1 for d in B if d.get("images")), "; ordre :", sum(1 for d in B if d["t"] == "ordre"))
