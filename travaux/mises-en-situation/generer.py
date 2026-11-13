"""Mises en situation FLE : les dialogues de l'Excel en sons (ElevenLabs), avec une ambiance discrète du lieu.

    python3 generer.py A1 1-10        → A1/A1-s1.mp3 … A1/A1-s10.mp3 (et A1/voix-seules/…)

Le dialogue est joué d'un seul coup par le modèle v4 d'ElevenLabs (text-to-dialogue : les deux personnes se répondent avec
un rythme de vraie conversation), avec nos quatre voix créées pour ce travail (deux femmes, deux hommes, studio sec), attribuées
selon le rôle (« Boulangère », « Cliente »… sont des femmes) ; une ambiance du lieu (bruitage ElevenLabs, sans voix ni
musique) passe dessous, assez bas pour que les mots restent clairs. Un fichier déjà fait n'est pas refait tant que le texte
ne change pas.
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
import openpyxl

ICI = os.path.dirname(os.path.abspath(__file__))
API = "https://api.elevenlabs.io/v1"
MODELE = "eleven_v4"
# deux voix par genre ; dans un dialogue, la première personne d'un genre prend la première voix, la deuxième l'autre
# nos voix, créées avec l'outil de création de voix d'ElevenLabs (studio sec, ton naturel) : voix.json (creer_voix.py),
# dans l'ordre : les deux femmes et les deux hommes choisis à l'écoute, puis les voix ajoutées pour varier (âges)
_V = json.load(open(os.path.join(ICI, "voix.json"), encoding="utf-8"))
VOIX = {g: [v["id"] for v in _V.values() if v["genre"] == g] for g in "FM"}
ROULEMENT_DEPUIS = 11
VOIX_FORCEE = {30: {"Léa": "Femme 3", "Invitée": "Femme 2"},     # quand le roulement donne une voix peu crédible pour le rôle
               73: {"Jeune": "Homme 3", "Entraîneur": "Homme 4"}}
GENRE_FORCE = {64: {"Guide": "F"}}                                  # « Je m'appelle Julie, je suis votre guide »
# les lignes d'un même document (fiche, mot, mail, offre, écran) sont lues par une seule voix off ; la consigne par une autre
DOCUMENT = {"Écran", "Formulaire", "Mot de l'enseignante", "Signature des parents", "Mail", "Offre"}      # de 1 à 10 : toujours les deux premières voix (déjà validées) ; ensuite, les voix tournent
# les rôles dont le genre ne se lit pas à la terminaison
GENRE = {"Primeur": "M", "Fleuriste": "F", "Parent 1": "F", "Parent 2": "M", "Léa": "F", "Amina": "F", "Julie": "F",
         "Bibliothécaire": "F", "Réceptionniste": "F", "Consigne": "F", "Mail": "M", "Offre": "F", "Formulaire": "F",
         # les lignes qui ne sont pas des personnes : l'écran du distributeur, lu par une voix off ; les SMS, lus par leurs auteurs
         "Écran": "F", "SMS reçu": "F", "Réponse": "M", "Agent": "M", "Guide": "M", "Accueil": "F", "Responsable": "F", "Secrétaire": "F", "Mère": "F", "Père": "M"}
FEMININ = re.compile(r"(ère|euse|ienne|ice|ante|ente|ée|ine|esse|onne|elle|ette|Mère|Mme|Madame|Femme|Fille|Sœur|Tante)$", re.I)

# l'ambiance de chaque situation (en anglais : le bruitage comprend mieux) — toujours sans voix ni musique
AMBIANCE = {
    1: "Inside a small French bakery, quiet room tone, a shop door bell chimes once at the very start, paper bag rustling, soft distant cash register, no voices, no music",
    2: "Inside a French butcher shop, quiet room tone, refrigerated display hum, a butcher knife on a wooden board from time to time, no voices, no music",
    3: "Small neighbourhood grocery store, quiet fridge hum, a glass bottle clinks softly, light footsteps, no voices, no music",
    4: "Outdoor French street market in the morning, distant indistinct crowd murmur without clear words, wooden crates, paper bags, a few birds, no music",
    5: "Inside a shop, quiet room tone, distant checkout scanner beeps, light footsteps, no voices, no music",
    6: "Supermarket checkout, barcode scanner beeps, items sliding on the conveyor belt, plastic bag rustling, no voices, no music",
    7: "Greengrocer shop, apples dropped into a paper bag, scale beep, soft street noise from the open door, no voices, no music",
    8: "Fishmonger stall, crushed ice being scooped, wet market sounds, paper wrapping, scale beep, no voices, no music",
    9: "Cheese shop, quiet room tone, a cheese wire cutting through cheese, paper wrapping, no voices, no music",
    10: "Pastry shop, a shop door bell chimes once at the very start, cardboard pastry box being closed, quiet room tone, no voices, no music",
    11: "Florist shop, quiet room tone, a small door bell chimes once at the very start, cellophane and paper wrapping rustling, scissors snipping flower stems, no voices, no music",
    12: "French newsagent and tobacco shop, quiet room tone, a door bell chimes once at the very start, newspapers rustling, a lottery machine beep, no voices, no music",
    13: "Indoor shopping mall, large hall, distant indistinct crowd murmur without clear words, footsteps on tiles, escalator hum, no music",
    14: "French café bar, espresso machine hissing, cups and saucers clinking, distant indistinct murmur without clear words, no music",
    15: "Restaurant dining room, cutlery on plates, glasses clinking softly, distant indistinct murmur without clear words, no music",
    16: "Fast food restaurant, fryer sizzling, order screen beeps, trays sliding, distant indistinct murmur without clear words, no music",
    17: "Cinema lobby, popcorn machine popping, ticket printer, quiet distant murmur without clear words, no music",
    18: "Outdoor playground in a park, distant children playing and laughing without clear words, birds singing, a swing creaking, light wind, no music",
    19: "Indoor public swimming pool, large echoing hall, distant water splashing, a lifeguard whistle far away, no clear voices, no music",
    20: "Inside a city bus, engine rumble, bus doors opening with a hiss at the very start, ticket validator beep, light traffic outside, no voices, no music",
    21: "Underground tram and metro station ticket hall, a distant tram arriving and braking, ticket gate beeps, footsteps, distant indistinct murmur without clear words, no announcements, no music",
    22: "Train station hall, large space, a distant train departure chime, rolling suitcases, distant indistinct murmur without clear words, no announcements, no music",
    23: "Inside a moving taxi, a car door closing at the very start, engine hum, city traffic outside, a turn signal clicking briefly, no voices, no music",
    24: "Petrol station shop, quiet room tone, a door bell chimes once at the very start, a card payment terminal beep, distant cars outside, no voices, no music",
    25: "Cash machine on a city street, ATM keypad beeps, card slot motor, light street traffic, no voices, no music",
    26: "Quiet French town street, light traffic passing, footsteps on the pavement, distant birds, no voices, no music",
    27: "Adult language classroom, quiet room, chairs moving softly, papers rustling, a pen on paper, no voices, no music",
    28: "Apartment building stairwell, a door closing at the very start, keys jingling, quiet echo, no voices, no music",
    29: "Outside a primary school at pickup time, a school bell at the very start, distant children laughing and playing without clear words, light street noise, no music",
    30: "Small birthday party at home, gentle distant chatter without clear words, gift wrapping paper rustling, balloons squeaking, no music",
    31: "Quiet room, a smartphone message notification chime at the very start and once again in the middle, soft phone keyboard tapping, no voices, no music",
    32: "Pharmacy, quiet room tone, an automatic door opening at the very start, medicine boxes and a paper bag rustling, a cash register beep, no voices, no music",
    33: "Doctor's consulting room, quiet room tone, a chair creaking, papers rustling, no voices, no music",
    34: "Paediatrician's office, quiet room tone, a baby softly whimpering in the distance now and then, a toy rattle, no music",
    35: "Dentist's surgery, quiet room tone, a dental chair motor, faint metal dental tools clinking, no voices, no music",
    36: "Optician shop, quiet room tone, a door bell chimes once at the very start, a tiny screwdriver and metal glasses frame clicks, no voices, no music",
    37: "Medical laboratory waiting room, quiet room tone, a queue ticket machine beep, papers, distant footsteps, no voices, no music",
    38: "Quiet room at home, a telephone ringing twice at the very start and being picked up, subtle phone line hiss, no voices, no music",
    39: "Hair salon, scissors snipping, a hair dryer in the distance, water running briefly, no voices, no music",
    40: "Calm beauty salon, quiet room tone, a nail file, small glass bottles clinking, no voices, no music",
    41: "Dry cleaner shop, quiet room tone, a door bell chimes once at the very start, clothes hangers clinking, a steam press hissing softly, no voices, no music",
    42: "Small cobbler and key cutting shop, a key cutting machine grinding briefly, metal keys jingling, quiet room tone, no voices, no music",
    43: "Small corner shop used as a parcel pick-up point, quiet room tone, a barcode scanner beep, a cardboard box sliding on the counter, no voices, no music",
    44: "Post office counter, quiet room tone, a rubber stamp being pressed, envelopes and paper, a queue ticket beep, distant indistinct murmur without clear words, no music",
    45: "Clothing store, quiet room tone, hangers sliding on a rail, a fitting room curtain being pulled, no voices, no music",
    46: "Shoe shop, quiet room tone, a shoe box being opened, tissue paper rustling, footsteps on the floor, no voices, no music",
    47: "Large DIY hardware store, big hall, a shopping trolley rolling, distant beeps, small metal items clinking, no voices, no music",
    48: "Mobile phone shop, quiet modern room tone, a phone notification sound, a printer printing a page, no voices, no music",
    49: "Stationery shop, quiet room tone, a door bell chimes once at the very start, notebooks and paper, a cash register beep, no voices, no music",
    50: "Pet and garden shop, quiet room tone, small birds chirping in cages, a bag of pet food rustling, no voices, no music",
    51: "Veterinary clinic waiting room, quiet room tone, a dog panting and its claws tapping on the floor, a door opening, no voices, no music",
    52: "Bank reception area, quiet room tone, keyboard typing, a distant door, soft footsteps, no voices, no music",
    53: "Town hall reception, large quiet hall, footsteps on a stone floor, papers, a distant door closing, no voices, no music",
    54: "Quiet public library, pages turning, a book barcode scanner beep, very soft footsteps, no voices, no music",
    55: "Outdoor recycling centre, wind, a car boot closing, cardboard and wood thrown into a metal skip, a distant truck, no voices, no music",
    56: "Quiet office room, a pen writing on paper, papers rustling, a clock ticking softly, no voices, no music",
    57: "Inside a moving train carriage, steady rhythm of the rails, gentle swaying, a sliding door opening, no voices, no announcements, no music",
    58: "Airport check-in hall, large space, rolling suitcases, a luggage conveyor belt, distant indistinct murmur without clear words, no announcements, no music",
    59: "Town street with parking spaces, light traffic, a car door closing, a parking meter beep, footsteps, no voices, no music",
    60: "Outdoor bike rental shop in summer, bicycle bells ringing, bike chains clicking, birds, light street noise, no voices, no music",
    61: "Tourist information office, quiet room tone, a door bell chimes once at the very start, maps and brochures being unfolded, no voices, no music",
    62: "Hotel lobby in the evening, quiet room tone, a reception desk bell ding at the very start, keys jingling, soft footsteps on carpet, no voices, no music",
    63: "Campsite reception outdoors in summer, cicadas, birds, distant children playing without clear words, footsteps on gravel, no music",
    64: "Old town square outdoors, a small group walking on cobblestones, distant church bells, pigeons, light wind, no clear voices, no music",
    65: "Museum entrance hall, large quiet space, soft footsteps, a ticket printer, no voices, no music",
    66: "Town hall office, quiet room tone, keyboard typing, papers, a stapler, no voices, no music",
    67: "School office near the canteen, distant children's lunchtime noise without clear words, plates and cutlery clattering far away, no music",
    68: "Day nursery in the morning, soft distant toddlers babbling without clear words, toys, a door closing gently, no music",
    69: "Children's leisure centre office, distant children playing without clear words, a ball bouncing, no music",
    70: "Quiet kitchen at home in the evening, a school notebook being opened, a pen signing paper, a clock ticking, no voices, no music",
    71: "Quiet living room, soft room tone, a cup set down on a table, light rain outside the window, no voices, no music",
    72: "Gym reception, distant weights clanking, a treadmill humming, a door closing, no voices, no music",
    73: "Outdoor football ground in the evening, distant players calling without clear words, a ball being kicked, a coach whistle far away, no music",
    74: "Concert hall box office in the evening, foyer ambience, distant indistinct crowd murmur without clear words, a ticket printer, no music",
    75: "Outdoor neighbourhood flea market, distant indistinct crowd murmur without clear words, objects being moved on tables, birds, no music",
    76: "Outdoor wedding reception, distant cheerful chatter without clear words, glasses clinking, light wind, no music",
    77: "Quiet church entrance, large stone space, soft footsteps, a distant heavy door, no voices, no music",
    78: "Office telephone call, a telephone ringing twice at the very start and being picked up, subtle phone line hiss, quiet office room tone, no voices, no music",
    79: "Quiet room, an email notification sound at the very start, computer keyboard typing, a mouse click, no voices, no music",
    80: "Quiet room, a newspaper page turning, a pen tapping on a table, no voices, no music",
}
# coquilles évidentes de l'Excel, corrigées pour la voix (signalées dans le LISEZMOI)
CORRECTIONS = {9: [("Bonjou Madame r.", "Bonjour, madame.")], 18: [("Elel adore le toboggan", "Elle adore le toboggan.")],
               35: [("J'ai mal à une den, en bas à droite", "J'ai mal à une dent, en bas à droite.")]}


def lire(niveau):
    wb = openpyxl.load_workbook(os.path.join(ICI, "source", f"Mises_en_situation_FLE_Niveau_{niveau}.xlsx"), data_only=True)
    S = {}
    for r in wb["Mises en situation"].iter_rows(min_row=2, values_only=True):
        if not r[0]: continue
        n, texte = int(r[0]), r[5] or ""
        for a, b in CORRECTIONS.get(n, []): texte = texte.replace(a, b)
        repliques = [(l.split(":", 1)[0].strip(), l.split(":", 1)[1].strip()) for l in texte.splitlines() if ":" in l and l.split(":", 1)[1].strip()]
        S[n] = {"n": n, "theme": r[1], "lieu": r[2], "situation": r[4], "repliques": repliques}
    return S


def genre(role):
    return GENRE.get(role) or ("F" if FEMININ.search(role) else "M")


def voix_du_dialogue(repliques, n=0):
    vus, prises, par_cle = {}, {"F": 0, "M": 0}, {}
    docs = [role for role, _ in repliques if role in DOCUMENT]
    for role, _ in repliques:
        if role in vus: continue
        cle = ("document", docs[0]) if role in DOCUMENT else role          # un document : une seule voix pour toutes ses lignes
        if cle not in par_cle:
            g = GENRE_FORCE.get(n, {}).get(cle if isinstance(cle, str) else cle[1]) or genre(cle if isinstance(cle, str) else cle[1])
            par_cle[cle] = VOIX[g][prises[g] % 2] if n < ROULEMENT_DEPUIS else VOIX[g][(n + prises[g]) % len(VOIX[g])]
            prises[g] += 1
        vus[role] = par_cle[cle]
    for role, nom in VOIX_FORCEE.get(n, {}).items():
        if role in vus: vus[role] = _V[nom]["id"]
    return vus


def dire(t):
    """Le texte tel qu'on le donne à la voix : les prix « 4,50 euros » se disent « 4 euros 50 »."""
    t = re.sub(r"(\d+),(\d{2})\s*euros?", lambda m: f"{m[1]} {'euro' if m[1] == '1' else 'euros'} {m[2]}", t)
    t = re.sub(r"\b(\d{1,2}) h (\d{2})\b", lambda m: f"{m[1]} {'heure' if m[1] == '1' else 'heures'} {m[2]}", t)     # « 10 h 15 » → « 10 heures 15 »
    t = re.sub(r"\b(\d{1,2}) h\b", lambda m: f"{m[1]} {'heure' if m[1] == '1' else 'heures'}", t)                     # « 14 h » → « 14 heures »
    t = re.sub(r"_+(\s*/\s*_+)*", " ", t)                     # les blancs à remplir d'une fiche ne se lisent pas
    t = re.sub(r"\b(\d{1,2}) kilos\b", lambda m: ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"][int(m[1])] + " kilos" if int(m[1]) <= 10 else m[0], t)   # « 3 kilos » était lu « trois kilogrammes »
    t = re.sub(r"\bCD([DI])\b", lambda m: f"C.D.{m[1]}.", t)  # « CDD », « CDI » épelés
    t = re.sub(r"\bNOM\b", "nom", t)                          # « NOM » n'est pas un sigle à épeler
    t = re.sub(r"(?<=[a-zé]) / (?=[a-zé])", " ou ", t)          # « vendeur / vendeuse » → « vendeur ou vendeuse »
    t = re.sub(r"\s*:\s*(?=[A-ZÉ]|$)", ". ", t)               # « Objet : Absence », « Nationalité : » → une phrase par champ
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\.(\s*\.)+", ".", t)                         # « Choisissez le montant : » → « … montant. »
    return t[:1].upper() + t[1:]


def appeler(url, corps, chemin):
    cle = hashlib.sha1((url + json.dumps(corps, ensure_ascii=False, sort_keys=True)).encode()).hexdigest()
    cache = os.path.join(ICI, ".cache", cle + ".mp3"); os.makedirs(os.path.dirname(cache), exist_ok=True)
    if os.path.exists(cache): shutil.copy(cache, chemin); return
    _appeler(url, corps, chemin); shutil.copy(chemin, cache)


def _appeler(url, corps, chemin):
    for _ in range(3):
        r = subprocess.run(["curl", "-sS", "-o", chemin, "-w", "%{http_code}", "-X", "POST", url, "-H", "xi-api-key: secret-du-proxy",
                            "-H", "Content-Type: application/json", "--data-binary", json.dumps(corps, ensure_ascii=False)], capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(chemin) > 1000: return
    raise RuntimeError(f"HTTP {r.stdout} : {open(chemin, errors='replace').read()[:300]}")


def duree(chemin):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", chemin], capture_output=True, text=True).stdout)


def produire(niveau, s):
    nom = f"{niveau}-s{s['n']}"; dossier = os.path.join(ICI, niveau); os.makedirs(os.path.join(dossier, "voix-seules"), exist_ok=True)
    final, seul, trace = os.path.join(dossier, nom + ".mp3"), os.path.join(dossier, "voix-seules", nom + ".mp3"), os.path.join(dossier, "voix-seules", nom + ".txt")
    voix = voix_du_dialogue(s["repliques"], s["n"]); amb = AMBIANCE.get(s["n"])
    empreinte = hashlib.sha1(json.dumps([s["repliques"], voix, amb, MODELE], ensure_ascii=False).encode()).hexdigest()
    if os.path.exists(final) and os.path.exists(trace) and open(trace).read() == empreinte: return nom, "déjà fait"
    with tempfile.TemporaryDirectory() as d:
        brut = os.path.join(d, "dialogue.mp3")
        appeler(f"{API}/text-to-dialogue?output_format=mp3_44100_128",
                {"inputs": [{"text": dire(t) or dire(role) + ".", "voice_id": voix[role]} for role, t in s["repliques"]], "model_id": MODELE, "language_code": "fr"}, brut)
        # sans les blancs du début et de la fin, au bon volume ; 0,8 s de calme au début, 1 s à la fin
        voixw = os.path.join(d, "voix.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", brut, "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                        "loudnorm=I=-17:TP=-2:LRA=9,adelay=800:all=1,apad=pad_dur=1", "-ar", "44100", "-ac", "1", voixw], check=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", voixw, "-b:a", "96k", seul], check=True)
        if amb:   # l'ambiance, à la longueur du dialogue, bien en dessous des voix, avec un fondu au début et à la fin
            t = duree(voixw); a = os.path.join(d, "amb.mp3")
            appeler(f"{API}/sound-generation", {"text": amb, "duration_seconds": round(min(t + .5, 22), 1), "prompt_influence": .45}, a)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", voixw, "-stream_loop", "-1", "-i", a, "-filter_complex",
                            f"[1:a]loudnorm=I=-35:TP=-9,aresample=44100,atrim=0:{t:.2f},afade=t=in:d=0.6,afade=t=out:st={max(t - 1.2, 0):.2f}:d=1.2[am];"
                            f"[0:a]aformat=channel_layouts=stereo[vo];[vo][am]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.9[x]",
                            "-map", "[x]", "-ar", "44100", "-b:a", "128k", final], check=True)
        else:
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", voixw, "-b:a", "96k", final], check=True)
    open(trace, "w").write(empreinte)
    return nom, "fait"


if __name__ == "__main__":
    niveau, plage = sys.argv[1], sys.argv[2]
    a, _, b = plage.partition("-"); nums = range(int(a), int(b or a) + 1)
    S = lire(niveau)
    json.dump({f"{niveau}-s{n}": {**S[n], "voix": voix_du_dialogue(S[n]["repliques"], n), "ambiance": AMBIANCE.get(n)} for n in S},
              open(os.path.join(ICI, f"textes-{niveau}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with ThreadPoolExecutor(4) as ex:
        for nom, etat in ex.map(lambda n: produire(niveau, S[n]), nums): print(nom, etat, flush=True)
