# Fabriquer le village (Blender sans écran)

Les modèles de `../modeles/` sont assemblés par ces scripts à partir des packs gratuits **CC0** de Quaternius
(téléchargés sur itch.io, non versionnés ici) :

- Medieval Village MegaKit, Stylized Nature MegaKit, Fantasy Props MegaKit (version « Standard ») ;
- Universal Base Characters, Universal Animation Library, Modular Character Outfits – Fantasy (tenues de paysan·ne).

Étapes :

    pip install bpy                         # Blender 5.3 en module Python (Python 3.13)
    python3 itch.py dl medieval-village-megakit 0 telechargements    # idem pour chaque pack, puis dézipper dans packs/
    python perso.py boulangere F Light 2 Hair_Buns 0.45,0.28,0.16 rendu
    python perso.py joueur M Light 1 Hair_SimpleParted 0.30,0.20,0.12
    python perso.py passant M Dark 2 Hair_Buzzed 0.12,0.09,0.07
    python village.py exterieur rendu       # la place : village.glb + village.json (portes, obstacles, habitants)
    python village.py interieur rendu       # la boulangerie : boulangerie.glb + boulangerie.json

Les chemins des packs sont en tête de `kit.py` et `perso.py` (dossier de travail de la session) : à adapter.
Les voix : `../voix.py` (répliques dans `../repliques.json`, ElevenLabs eleven_v4, -20 LUFS, vérifiées par transcription).
