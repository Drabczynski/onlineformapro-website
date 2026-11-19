"""Forme d'onde du dialogue (Sons/A1/A1-s1.mp3) pour la loupe du vrai / faux : le niveau crête tous les 1/100 s,
de 0 à 99, écrit dans onde.js (lu aussi quand la page est ouverte depuis le disque).
usage : python3 exercices/boulangerie/exercices-lies/boulangerie/calcul-onde.py   (il faut ffmpeg)"""
import os, struct, subprocess
ICI = os.path.dirname(os.path.abspath(__file__))
SON = os.path.join(ICI, '..', '..', 'Sons', 'A1', 'A1-s1.mp3')
TAUX, PAS = 8000, 80   # 8 kHz, fenêtres de 10 ms
brut = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', SON, '-ac', '1', '-ar', str(TAUX), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = struct.unpack(f'<{len(brut) // 4}f', brut)
crete = [max(abs(v) for v in x[i:i + PAS]) for i in range(0, len(x), PAS)]
m = max(crete) or 1
v = [min(99, round(c / m * 99)) for c in crete]
with open(os.path.join(ICI, 'onde.js'), 'w') as f:
    f.write('// forme d\'onde du dialogue (Sons/A1/A1-s1.mp3) : niveau crête tous les 1/100 s, 0 à 99 ; refaite par calcul-onde.py\n')
    f.write('window.ONDE_DIALOGUE = { pas: 0.01, v: [' + ','.join(map(str, v)) + '] };\n')
print(len(v), 'valeurs')
