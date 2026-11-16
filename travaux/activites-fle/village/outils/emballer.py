"""Les artefacts ne servent pas les .glb : on les emballe en .glb.json ({"glb": base64}) pour la publication.
usage : python3 emballer.py <dossier de sortie>"""
import base64, json, os, sys, glob
ICI = os.path.dirname(os.path.abspath(__file__)); sortie = sys.argv[1]
os.makedirs(sortie, exist_ok=True)
for f in sorted(glob.glob(os.path.join(ICI, "..", "modeles", "*.glb"))):
    d = os.path.join(sortie, os.path.basename(f) + ".json")
    json.dump({"glb": base64.b64encode(open(f, "rb").read()).decode()}, open(d, "w"))
    print(os.path.basename(d), round(os.path.getsize(d) / 1e6, 1), "Mo")
