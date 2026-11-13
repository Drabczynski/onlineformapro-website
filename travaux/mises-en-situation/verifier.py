"""Retranscrit des sons <niveau>-sN et compare, mot à mot, avec ce qui devait être dit (textes-<niveau>.json + dire()).
   Les nombres sont écrits en lettres des deux côtés ; seuls les vrais écarts restent.   usage : python3 verifier.py A2 1 147"""
import difflib, json, os, re, subprocess, sys, unicodedata
from concurrent.futures import ThreadPoolExecutor
sys.dont_write_bytecode = True
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ICI, ".pylib"))   # num2words : pip install --no-deps --target .pylib num2words
sys.path.insert(0, ICI)
from num2words import num2words
import generer as g
NIV, A, B = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
D = json.load(open(os.path.join(ICI, f"textes-{NIV}.json"), encoding="utf-8"))
def mots(t):
    t = re.sub(r"\[[^\]]*\]", " ", t)
    t = re.sub(r"(\d+),(\d+)", lambda m: f"{m[1]} virgule {m[2]}", t)
    t = re.sub(r"(?<=\d) (?=\d{3}\b)", "", t)                          # « 1 443 » → 1443
    t = re.sub(r"\d+", lambda m: " " + num2words(int(m[0]), lang="fr") + " ", t)
    t = t.replace("%", " pour cent ").replace("€", " euros ")
    t = unicodedata.normalize("NFKD", t.lower()); t = "".join(c for c in t if not unicodedata.combining(c))
    out = []
    for x in re.findall(r"[a-z]+", t.replace("-", " ").replace("'", " ")):
        x = re.sub(r"(s|x)$", "", x) if len(x) > 3 else x
        out.append({"h": "heure", "heur": "heure"}.get(x, x))
    return out
def un(n):
    k = f"{NIV}-s{n}"; f = os.path.join(ICI, NIV, k + ".mp3")
    for essai in range(2):
        r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: secret-du-proxy", "-F", "model_id=scribe_v1", "-F", "language_code=fra", "-F", f"file=@{f}"], capture_output=True, text=True)
        try: lu = json.loads(r.stdout).get("text", "")
        except Exception: lu = ""
        attendu = " ".join(g.dire(t) or g.dire(role) + "." for role, t in D[k]["repliques"])
        a, b = mots(attendu), mots(lu)
        sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
        diff = [(o, " ".join(a[i1:i2]), " ".join(b[j1:j2])) for o, i1, i2, j1, j2 in sm.get_opcodes() if o != "equal"]
        if sm.ratio() > .5: break                                      # un raté de la retranscription : on la refait une fois
    return n, round(sm.ratio(), 3), diff, lu
with ThreadPoolExecutor(6) as ex:
    for n, ratio, diff, lu in ex.map(un, range(A, B + 1)):
        print(f"s{n} {ratio} {'OK' if not diff else diff}")
        if diff: print("     lu :", lu)
