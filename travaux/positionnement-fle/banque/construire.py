"""Construit la banque du test adaptatif à partir du fichier Excel (142 QCM), avec tous les tags,
et la présentation de chaque question (type de support, document, alvéoles ou pastilles)."""
import json, re, collections
X = json.load(open('../positionnement/xlsx-lignes.json'))
copies = json.load(open('../sons/copies.json'))
QCM = sorted([i for i, x in X.items() if (x.get('Type de réponse') or '').startswith('QCM')], key=lambda k: (k[:2], int(k[3:])))
EP = {"COMP orale": "CO", "COMP écrite": "CE", "EXP écrite": "EE", "EXP orale": "EO"}
ETIQ_CO = {"CO-13": "Annonce en gare", "CO-18": "Message sur votre répondeur", "CO-21": "Annonce dans un magasin", "CO-23": "Appel pour un logement",
           "CO-27": "Message d'une collègue", "CO-29": "Annonce de l'école", "CO-31": "La météo à la radio", "CO-33": "Un récit", "CO-34": "Dans la rue",
           "CO-35": "À la radio", "CO-38": "Un entretien d'embauche", "CO-41": "Discussion entre voisins", "CO-44": "Consignes de sécurité",
           "CO-47": "Un témoignage", "CO-50": "Deux amis parlent"}
PICTOS = {"À droite": "➡️", "À gauche": "⬅️", "En face": "⬆️", "Derrière": "↩️", "Il fait soleil": "☀️", "Il pleut": "🌧️", "Il neige": "❄️", "Il fait chaud": "🥵"}
DOCS = {  # groupe → (titre, emoji, style) pour les documents A2-B1 lus avant la question
    "CE-18": ("Annonce d'emploi", "📋", ""), "CE-22": ("Courriel", "✉️", ""), "CE-24": ("Notice du médicament", "💊", ""), "CE-26": ("Médiathèque municipale", "📌", "affiche"),
    "CE-29": ("Courriel d'une amie", "✉️", ""), "CE-32": ("Piscine – règlement", "🏊", "affiche"), "CE-34": ("Info trafic", "🚆", "info"), "CE-35": ("Article", "📰", ""),
    "CE-40": ("Courrier reçu", "✉️", "courrier"), "CE-44": ("Témoignage", "💬", ""), "CE-48": ("Règlement intérieur – extrait", "📜", "affiche")}
TITRES_MAJ = {"PISCINE – RÈGLEMENT", "MÉDIATHÈQUE MUNICIPALE", "RÈGLEMENT INTÉRIEUR – EXTRAIT"}

def groupe_de(i):
    s = X[i]['Support (texte ou script audio)']
    return next(k for k in QCM if X[k]['Support (texte ou script audio)'] == s and k[:2] == i[:2])

def guillemets(t):
    m = re.search(r'«\s*(.*?)\s*»', t, re.S)
    return (t[:m.start()].strip(), m.group(1).strip(), t[m.end():].strip().lstrip('.').strip()) if m else (t.strip(), None, "")

def support(i, x):
    s = (x['Support (texte ou script audio)'] or '').strip()
    ep = EP[x['Épreuve']]; g = groupe_de(i)
    if ep == "CO":
        lignes = [re.sub(r'^([A-ZÉÈ]+\s*)?—\s*', '', l.strip()).strip() for l in guillemets(s)[1].split('\n') if l.strip()]
        return {"t": "ecoute", "audio": copies.get(i, i), "script": lignes, "etiquette": ETIQ_CO.get(g, "")}
    if ep == "EO":
        if i == "EO-17": return {"t": "replique", "photo": "homme", "audio": "EO-17", "replique": "Merci beaucoup !"}
        if i == "EO-31": return {"t": "replique", "photo": "secretaire", "audio": "EO-31", "etiquette": "La secrétaire, au téléphone", "replique": "Ne quittez pas, je vous passe le service."}
        texte = re.sub(r'^Situation\s*:\s*', '', s); texte = texte[0].upper() + texte[1:]
        return {"t": "situation", "emoji": {"EO-32": "⏰", "EO-49": "💼"}[i], "etiquette": "Situation", "texte": texte, "audio": i}
    if ep == "CE":
        if i == "CE-01": return {"t": "panneau", "style": "ferme", "etiquette": "Sur la porte d'un magasin", "texte": "FERMÉ LE DIMANCHE"}
        if i == "CE-02": return {"t": "panneau", "style": "sortie", "texte": "SORTIE"}
        if i == "CE-12": return {"t": "panneau", "style": "interdit", "texte": "INTERDIT DE FUMER"}
        if i == "CE-05": return {"t": "prix", "produit": "Tomates", "prix": "2,50 €", "unite": "le kilo"}
        if g == "CE-08": return {"t": "affiche", "titre": "MAIRIE", "lignes": ["Ouverte du lundi au vendredi", "de 9 h à 12 h et de 14 h à 17 h"]}
        if i == "CE-10": return {"t": "menu", "titre": "Menu de la cantine", "jour": "Lundi", "plats": ["poulet", "riz", "yaourt"]}
        if i == "CE-14": return {"t": "plaque", "etiquette": "Plaque à l'entrée", "lignes": ["Cabinet médical", "2e étage – porte B"]}
        if s.startswith("SMS"):
            texte = guillemets(s)[1]; signe = texte.split('.')[-1].strip().split()[-1]
            return {"t": "sms", "etiquette": f"SMS de {signe}", "texte": texte}
        if i == "CE-11": return {"t": "court", "etiquette": "Carte postale", "lignes": [guillemets(s)[1]]}
        if i == "CE-13": return {"t": "court", "titre": "Liste de courses", "lignes": [m.strip() for m in s.split(':', 1)[1].split('–')], "liste": True}
        if g in ("CE-06", "CE-15"):
            l = s.split('\n'); return {"t": "court", "titre": l[0].strip().capitalize() if g == "CE-06" else l[0].strip().capitalize(), "lignes": [x.strip() for x in l[1:]]}
        titre, emoji, style = DOCS[g]
        lignes = [l.strip() for l in s.split('\n') if l.strip()]
        if lignes[0] in TITRES_MAJ: lignes = lignes[1:]
        if lignes[0].startswith("INFO TRAFIC"): lignes = [lignes[0].split(':', 1)[1].strip().capitalize()] + lignes[1:]
        return {"t": "document", "titre": titre, "emoji": emoji, "style": style, "lignes": lignes}
    # EE : expression écrite, items fermés
    if s in ("—", ""): return {"t": "aucun"}
    m = re.match(r'^Complétez\s*:\s*«\s*(.*?)\s*»\s*(\((.*)\))?\s*$', s, re.S)
    if m: return {"t": "trou", "etiquette": "Complétez :", "phrase": m.group(1), "indice": f"({m.group(3)})" if m.group(3) else ""}
    m = re.match(r'^Mettez la phrase à la forme négative\s*:\s*«\s*(.*?)\s*»', s)
    if m: return {"t": "transformer", "vers": "Mettez la phrase à la forme négative :", "phrase": m.group(1)}
    m = re.match(r'^Remettez les mots dans l\'ordre\s*:\s*(.*)$', s)
    if m: return {"t": "mots", "etiquette": "Remettez les mots dans l'ordre :", "mots": [w.strip() for w in m.group(1).split('/')]}
    avant, cite, apres = guillemets(s)
    return {"t": "enonce", "avant": avant, "citation": cite, "apres": apres}

banque = []
for i in QCM:
    x = X[i]; choix = [x['Réponse ' + l] for l in 'ABCD']
    q = {"id": i, "n": int(x['N° (ordre progressif)']), "niveau": x['Niveau CECRL'], "epreuve": EP[x['Épreuve']], "groupe": groupe_de(i),
         "tag": x['Tag grammaire-lexique (transversal)'], "composante": x['Composante détaillée'], "critere": x['Critère Tableau 3 CECRL'],
         "question": x['Consigne / question'], "choix": choix, "bonne": "ABCD".index(x['Bonne réponse'].strip())}
    q.update(support(i, x))
    if all(c in PICTOS for c in choix): q["pictos"] = [PICTOS[c] for c in choix]
    banque.append(q)
json.dump(banque, open('banque.json', 'w'), ensure_ascii=False, indent=1)
c = collections.Counter((q['niveau'], q['epreuve']) for q in banque)
print(len(banque), 'questions', dict(sorted(c.items())))
print(collections.Counter(q['t'] for q in banque))
# sons à intégrer : enregistrements (une fois chacun), consignes A1 lues, pictogrammes
a1 = sorted({q['question'] for q in banque if q['niveau'] == 'A1'})
print(len(a1), 'consignes A1 distinctes ;', sum(1 for q in banque if q.get('pictos')), 'questions à pictogrammes')
json.dump({"consignes": a1, "pictos": [c for c in PICTOS]}, open('a-generer.json', 'w'), ensure_ascii=False, indent=1)
for q in banque:
    if q['t'] in ('enonce', 'trou', 'mots', 'aucun', 'court', 'transformer') and q['epreuve'] in ('EE', 'CE'):
        print(' ', q['id'], q['t'], {k: v for k, v in q.items() if k in ('etiquette', 'phrase', 'avant', 'citation', 'apres', 'titre', 'lignes', 'mots', 'indice')})
