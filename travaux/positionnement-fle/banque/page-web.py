"""Fabrique index.html (la page web à partager) à partir de test-positionnement.html (l'artifact) :
mêmes écrans, mais une vraie page HTML, et les sons en fichiers MP3 (sons/) au lieu d'être intégrés.
Usage : python3 page-web.py <test-positionnement.html> <banque.json> <cles-consignes.json> <dossier positionnement-fle>"""
import json, os, sys
source, f_banque, f_cles, D = sys.argv[1:5]
s = open(source, encoding='utf-8').read()
banque = json.load(open(f_banque)); cles = json.load(open(f_cles))
urls = {}
for q in banque:
    if q.get('audio'): urls[q['audio']] = f"sons/{q['audio']}.mp3"
for cle, ident in cles.items(): urls[cle] = f"sons/{'pictos' if ident.startswith('picto') else 'consignes-a1'}/{ident}.mp3"
manque = [u for u in urls.values() if not os.path.exists(f'{D}/{u}')]
assert not manque, manque
a = s.index('const AUDIO = {'); b = s.index('const ETOILE =', a)
s = s[:a] + 'const AUDIO = ' + json.dumps(urls, ensure_ascii=False, indent=0).replace('\n', '\n  ') + ';\n' + s[b:]
s = s.replace("// Sons enregistrés avec ElevenLabs (modèle Multilingual v2), débit 0,85 en A1, 0,95 en A2, 1 en B1.",
              "// Sons enregistrés avec ElevenLabs (modèle Multilingual v2), débit 0,85 en A1, 0,95 en A2, 1 en B1.\n// Version web : chaque son est un fichier MP3 du dossier sons/, chargé quand la question s'affiche.")
old = '''  const q = qActuelle();
  if (q.t === "document" && !etat.lus[q.id]) return ecranLecture(q);'''
assert s.count(old) == 1
s = s.replace(old, '''  const q = qActuelle();
  if (q.audio && AUDIO[q.audio]) { const p = new Audio(); p.preload = "auto"; p.src = AUDIO[q.audio]; }
  if (q.t === "document" && !etat.lus[q.id]) return ecranLecture(q);''')
s = s.replace('<title>Test de positionnement FLE</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n', '')
tete = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#9748fe">
<title>Test de niveau de français</title>
<meta name="description" content="Test de positionnement en français, du niveau A1 au niveau B1, adaptatif, sur mobile.">
<meta property="og:title" content="Test de niveau de français">
<meta property="og:description" content="Test de positionnement adaptatif, du niveau A1 au niveau B1, environ 10 minutes.">
<meta property="og:type" content="website">
'''
i = s.index('</style>') + len('</style>')
s = tete + s[:i] + '\n</head>\n<body>\n' + s[i:].lstrip('\n') + '\n</body>\n</html>\n'
open(f'{D}/index.html', 'w', encoding='utf-8').write(s)
print(len(s) // 1024, 'Ko ;', len(urls), 'sons en fichiers')
