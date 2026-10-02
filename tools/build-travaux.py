#!/usr/bin/env python3
"""Régénère les deux pages de données du dossier « Travail en cours ».

    python3 tools/build-travaux.py

  travaux/prospection-fle.csv                        → travaux/gagnants-fle/
  travaux/mails-fle.csv + travaux/contacts-hunter.csv → travaux/mailing-gagnants/
  travaux/contacts-ofii.csv                          → travaux/mailing-ofii/

Les deux sources d'adresses sont fusionnées sur le nom de domaine. Quand la
même adresse figure dans les deux, la fiche de contacts-hunter.csv l'emporte :
elle porte un nom, une fonction et la marque décideur.

Dans chaque page, seuls les fragments situés entre les marqueurs sont
réécrits. Le reste des pages n'est pas touché.
"""
import csv
import html
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
CSV = RACINE / "travaux" / "prospection-fle.csv"
PAGE = RACINE / "travaux" / "gagnants-fle" / "index.html"
CSV_MAILS = RACINE / "travaux" / "mails-fle.csv"
CSV_HUNTER = RACINE / "travaux" / "contacts-hunter.csv"
CSV_OFII = RACINE / "travaux" / "contacts-ofii.csv"
PAGE_OFII = RACINE / "travaux" / "mailing-ofii" / "index.html"
PAGE_MAILS = RACINE / "travaux" / "mailing-gagnants" / "index.html"
ZONES = {
    "COUNT:PROSPECTION-FLE": None,   # le compteur, sous le titre
    "TABLE:PROSPECTION-FLE": None,   # la table, sous le chapeau
}
ZONES_MAILS = {
    "COUNT:MAILS": None,
    "LISTE:MAILS": None,
}
ZONES_OFII = {
    "COUNT:OFII": None,
    "LISTE:OFII": None,
}
# Une adresse mal formée ne part pas dans un envoi : elle est écartée.
SYNTAXE = re.compile(r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+"
                     r"(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
                     r"@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$")

MAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# Adresses manifestement gabarit ou non vérifiées, rendues par l'outil de
# recherche : elles ne partent pas dans un mailing.
BIDON = re.compile(r"^(f\.last|unknown_not_verified|undetermined|prenom|nom)@", re.I)
BORDS_E = " \t,;.\u2013\u2014-"       # on garde « : » pour le découpage
BORDS_L = " \t,;:.\u2013\u2014?-"
# Organismes à ne pas contacter. Leurs adresses restent affichées, mais elles
# ne sont ni cliquables ni copiables, et le bloc porte la mention.
EXCLUS = {
    "aksis": "Ne pas contacter",
}
# Les organismes nommés différemment dans les deux fichiers.
ALIAS = {
    "ufcvl": "UFCV Auvergne-Rhône-Alpes",
    "nouvelle donne": "Nouvelle Donne Formation",
    "nacarat": "NACARAT Formations",
    "eclipse istec groupe": "Eclipse ISTEC / EI Groupe",
    "cfp presqu\u2019île": "CFP Presqu\u2019Île",
    "aksis": "AKSIS",
    "mooveus": "Moovéus",
    "croix-rouge compétence": "Croix-Rouge française / Croix-Rouge Compétence",
    "learning system": "Learning System",
}

RANG = {"A": 0, "B": 1, "C": 2}
ENTETES = ["Prio.", "Organisme", "Statut commercial", "Acheteur", "Zone",
           "Attribution", "Montant du lot", "Plateforme connue", "Preuves"]
FINE = " "          # espace fine insécable, séparateur de milliers
INSEC = " "


def euros(v):
    """« 1 260 000,00 € » → « 1 260 000 € ». Les centimes sont tous nuls."""
    v = (v or "").strip().replace("?", FINE)
    if not v:
        return ""
    return v.replace(",00", "").replace(" €", INSEC + "€")


def tri(v):
    """Valeur numérique d'un montant, pour le classement."""
    chiffres = re.sub(r"[^\d]", "", (v or "").split(",")[0])
    return int(chiffres) if chiffres else 0


def e(s):
    return html.escape((s or "").strip())


def lien(url, texte):
    if not (url or "").strip():
        return ""
    return (
        f'<a class="lnk" href="{e(url)}" target="_blank" rel="noopener">{texte}'
        '<svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
        '<path d="M6 3h7v7M13 3 4 12" stroke="currentColor" stroke-width="1.8" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
    )


def detail(r, colonnes):
    """Les champs longs, sur une seconde ligne qui court sur toute la table.

    Le dépliage est purement CSS : la ligne de détail se montre via
    `tr:has(details[open]) + tr.det`, sans JavaScript.
    """
    champs = [
        ("Signal FLE", r["Signal FLE"]),
        ("Marché / lot", r["Marché / lot probant"]),
        ("Plafond du lot", euros(r["Plafond du lot (€)"])),
        ("Angle commercial", r["Angle commercial proposé"]),
        ("Remarque", r["Remarque"]),
    ]
    champs = [(k, v) for k, v in champs if (v or "").strip()]
    if not champs:
        return "", ""
    bascule = "<details><summary>Détail</summary></details>"
    blocs = "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in champs)
    ligne = (f'<tr class="det"><td colspan="{colonnes}"><dl>{blocs}</dl></td></tr>')
    return bascule, ligne


def main():
    with CSV.open(encoding="utf-8", newline="") as f:
        lignes = [r for r in csv.DictReader(f, delimiter=";") if r.get("Organisme")]

    # priorité d'abord, puis montant du lot décroissant
    lignes.sort(key=lambda r: (RANG.get(r["Priorité"].strip(), 9),
                               -tri(r["Montant attribué (€)"])))

    corps = []
    for r in lignes:
        p = r["Priorité"].strip()
        preuves = " ".join(x for x in (
            lien(r["URL preuve marché"], "Marché"),
            lien(r["URL preuve plateforme"], "Plateforme"),
        ) if x) or '<span class="vide">—</span>'
        bascule, ligne_detail = detail(r, len(ENTETES))
        corps.append(
            "<tr>"
            f'<td><span class="p p-{e(p)}">{e(p)}</span></td>'
            f'<td class="org"><b>{e(r["Organisme"])}</b>{bascule}</td>'
            f"<td>{e(r['Statut commercial'])}</td>"
            f"<td>{e(r['Acheteur'])}</td>"
            f"<td>{e(r['Zone'])}</td>"
            f'<td class="num">{e(r["Date attribution"])}</td>'
            f'<td class="num">{e(euros(r["Montant attribué (€)"]))}</td>'
            f"<td>{e(r['Plateforme / concurrence connue'])}</td>"
            f'<td class="pr">{preuves}</td>'
            "</tr>" + ligne_detail
        )

    thead = "".join(f"<th>{e(h)}</th>" for h in ENTETES)
    table = ('<div class="tbl-wrap"><table>'
             f"<thead><tr>{thead}</tr></thead>"
             f"<tbody>{''.join(corps)}</tbody></table></div>")

    n = {k: sum(1 for r in lignes if r["Priorité"].strip() == k) for k in "ABC"}
    compte = (f'<span class="compte">{len(lignes)} organismes · '
              f'{n["A"]} en A · {n["B"]} en B · {n["C"]} en C</span>')

    ZONES["COUNT:PROSPECTION-FLE"] = compte
    ZONES["TABLE:PROSPECTION-FLE"] = "\n  " + table + "\n  "

    page = PAGE.read_text(encoding="utf-8")
    for nom, contenu in ZONES.items():
        debut, fin = f"<!-- {nom} -->", f"<!-- /{nom} -->"
        if debut not in page or fin not in page:
            sys.exit(f"Marqueur {nom} absent de {PAGE}")
        page = re.sub(
            re.escape(debut) + r".*?" + re.escape(fin),
            lambda _, d=debut, c=contenu, f=fin: d + c + f,
            page, flags=re.S,
        )
    PAGE.write_text(page, encoding="utf-8")
    print(f"{len(lignes)} lignes écrites dans {PAGE.relative_to(RACINE)} "
          f"(A {n['A']} · B {n['B']} · C {n['C']})")
    page_mails()
    page_ofii()


# ---------------------------------------------------------------- mailing ---

def _entrees(champ):
    """Rend les couples (libellé, adresse) d'un champ de l'export.

    Le libellé d'une adresse est le texte qui la précède, borné par l'adresse
    précédente et par le début de ligne. Cette règle couvre les trois formats
    présents dans le fichier : liste d'adresses séparées par des virgules ou
    des points-virgules, « Fonction : adresse », et « Nom – Fonction – adresse »
    une par ligne.
    """
    champ = re.sub(r"[ \t]*Markdown coll[ée][ \t]*", " ", champ or "")
    sortie, fin = [], 0
    for m in MAIL.finditer(champ):
        avant = champ[fin:m.start()].split("\n")[-1]
        sortie.append((avant.strip(BORDS_E), m.group(0).lower()))
        fin = m.end()
    return sortie


def _decoupe(label):
    """« Nom – Fonction » → (nom, fonction). « Fonction : » → (—, fonction)."""
    for sep in (" \u2019 ", " ? ", " \u2013 ", " \u2014 "):
        if sep in label:
            a, _, b = label.partition(sep)
            return a.strip(BORDS_L), b.strip(BORDS_L)
    if ":" in label:
        a, _, b = label.rpartition(":")
        if not b.strip(BORDS_L):
            return "", a.strip(BORDS_L)
    label = label.strip(BORDS_L)
    # un libellé court est un nom, un libellé long une fonction
    return ("", label) if len(label.split()) > 3 else (label, "")


def _cle(s):
    s = unicodedata.normalize("NFKD", (s or "").lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s)


def _hunter():
    """Les fiches nominatives, groupées par domaine."""
    with CSV_HUNTER.open(encoding="utf-8", newline="") as f:
        lignes = [r for r in csv.DictReader(f, delimiter=";") if (r.get("email") or "").strip()]
    par_domaine = {}
    for r in lignes:
        d = r["target_domain"].strip().lower()
        par_domaine.setdefault(d, {"societe": r["company"].strip(), "contacts": []})
        par_domaine[d]["contacts"].append({
            "nom": r["name"].strip(),
            "fonction": r["role"].strip(),
            "adr": r["email"].strip().lower(),
            "src": "hunter",
            "decideur": r["decision_maker"].strip().lower() == "yes",
        })
    return par_domaine


def fiches_mails():
    """Une fiche par organisme : le fichier d'adresses, complété par les
    fiches nominatives rattachées au même domaine. Ordre alphabétique."""
    with CSV_MAILS.open(encoding="utf-8", newline="") as f:
        lignes = [r for r in csv.DictReader(f, delimiter=";") if (r.get("Organisme") or "").strip()]
    hunter = _hunter()

    def bloc(nom_of, domaine, remplir):
        vus, contacts, ecartees = set(), [], []

        def ajoute(c):
            if c["adr"] in vus:
                return
            if BIDON.match(c["adr"]):
                ecartees.append(c["adr"])
                return
            vus.add(c["adr"])
            contacts.append(c)

        remplir(ajoute)
        # les fiches nominatives du même domaine, d'abord : elles sont mieux
        # renseignées, donc elles gagnent le dédoublonnage
        rang = {"reco": 0, "hunter": 1, "finder": 2, "public": 3}
        contacts.sort(key=lambda c: (rang.get(c["src"], 9), not c.get("decideur"),
                                     not (c["nom"] or c["fonction"]), c["adr"]))
        return {"of": nom_of, "domaine": domaine, "contacts": contacts}, ecartees

    fiches, ecartees = [], []
    domaines_vus = set()
    for r in lignes:
        dom = (r["Domaine"] or "").strip().lower()
        domaines_vus.add(dom)

        def remplir(ajoute, r=r, dom=dom):
            reco = (r["Email recommandé"] or "").strip().lower()
            if MAIL.fullmatch(reco):
                ajoute({"nom": "", "fonction": "", "adr": reco, "src": "reco", "decideur": False})
            for c in hunter.get(dom, {}).get("contacts", []):
                ajoute(dict(c))
            for label, adr in _entrees(r["Réponse outil DomainFinder"]):
                nom, fonction = _decoupe(label)
                ajoute({"nom": nom, "fonction": fonction, "adr": adr,
                        "src": "finder", "decideur": False})
            for label, adr in _entrees(r["Autres emails publics"]):
                nom, fonction = _decoupe(label)
                ajoute({"nom": nom, "fonction": fonction, "adr": adr,
                        "src": "public", "decideur": False})

        fiche, ec = bloc(r["Organisme"].strip(), (r["Domaine"] or "").strip(), remplir)
        fiches.append(fiche)
        ecartees += ec

    # les domaines que seule la recherche nominative a trouvés
    for dom, h in hunter.items():
        if dom in domaines_vus:
            continue

        def remplir(ajoute, h=h):
            for c in h["contacts"]:
                ajoute(dict(c))

        fiche, ec = bloc(h["societe"], dom, remplir)
        fiches.append(fiche)
        ecartees += ec

    fiches.sort(key=lambda f: f["of"].lower())
    return fiches, ecartees


def page_mails():
    fiches, ecartees = fiches_mails()

    # priorité reprise de la table de prospection, quand l'organisme s'y trouve
    with CSV.open(encoding="utf-8", newline="") as f:
        prospects = [r for r in csv.DictReader(f, delimiter=";") if r.get("Organisme")]
    par_cle = {}
    for pr in prospects:
        nom = pr["Organisme"].strip()
        par_cle[_cle(ALIAS.get(nom.lower(), nom))] = pr["Priorité"].strip()
    for f in fiches:
        f["prio"] = par_cle.get(_cle(f["of"]), "")

    vus_of = {_cle(f["of"]) for f in fiches}
    sans = [pr["Organisme"].strip() for pr in prospects
            if _cle(ALIAS.get(pr["Organisme"].strip().lower(), pr["Organisme"].strip())) not in vus_of]

    blocs, nb_exclus = [], 0
    for f in fiches:
        exclu = EXCLUS.get(_cle(f["of"]))
        if exclu:
            nb_exclus += 1
        adresses = ", ".join(c["adr"] for c in f["contacts"])
        prio = (f'<span class="p p-{e(f["prio"])}">{e(f["prio"])}</span>'
                if f["prio"] else '<span class="p p-0" title="hors table de prospection">·</span>')
        lignes = []
        for c in f["contacts"]:
            qui = " · ".join(x for x in (c["nom"], c["fonction"]) if x)
            # sur un organisme exclu l'adresse n'est pas un lien : un clic ne
            # doit pas pouvoir ouvrir un message par mégarde
            adr = (f'<span class="adr">{e(c["adr"])}</span>' if exclu else
                   f'<a class="adr" href="mailto:{e(c["adr"])}">{e(c["adr"])}</a>')
            lignes.append(
                "<li>" + adr
                + (f'<span class="qui">{e(qui)}</span>' if qui else '<span class="qui"></span>')
                + ('<span class="reco">recommandé</span>'
                   if c["src"] == "reco" and not exclu else "")
                + ('<span class="dec">décideur</span>' if c.get("decideur") else "")
                + "</li>"
            )
        action = (f'<span class="nope">{e(exclu)}</span>' if exclu else
                  f'<button class="cop" type="button" data-adr="{e(adresses)}">'
                  f'Copier les {len(f["contacts"])}</button>')
        avis = ('<p class="avis">Ces adresses sont à exclure du mailing. Elles restent '
                'affichées pour mémoire, mais elles ne sont ni cliquables ni '
                'copiables.</p>') if exclu else ""
        blocs.append(
            f'<section class="of{" exclu" if exclu else ""}">'
            f'<div class="of-h">{prio}<h2>{e(f["of"])}</h2>'
            f'<span class="dom">{e(f["domaine"])}</span>{action}</div>'
            f'{avis}<ul class="adrs">{"".join(lignes)}</ul></section>'
        )

    if sans:
        items = "".join(f"<li>{e(x)}</li>" for x in sans)
        blocs.append(
            '<section class="of manque"><div class="of-h">'
            f'<h2>Sans contact&nbsp;: {len(sans)} organismes</h2></div>'
            f'<ul class="rien">{items}</ul>'
            "<p>Ces organismes figurent dans la table des gagnants mais pas dans "
            "l'export d'adresses.</p></section>"
        )

    total = sum(len(f["contacts"]) for f in fiches)
    nommes = sum(1 for f in fiches for c in f["contacts"] if c["nom"] or c["fonction"])
    compte = (f'<span class="compte">{len(fiches)} organismes · {total} adresses · '
              f'{nommes} avec un nom ou une fonction'
              + (f' · {nb_exclus} organisme{"s" if nb_exclus > 1 else ""} à exclure'
                 if nb_exclus else "") + '</span>')

    ZONES_MAILS["COUNT:MAILS"] = compte
    ZONES_MAILS["LISTE:MAILS"] = "\n  " + "\n  ".join(blocs) + "\n  "
    injecte(PAGE_MAILS, ZONES_MAILS)
    print(f"{len(fiches)} organismes et {total} adresses écrits dans "
          f"{PAGE_MAILS.relative_to(RACINE)} ({len(sans)} organismes sans contact, "
          f"{len(ecartees)} adresses gabarit écartées, {nb_exclus} organisme à exclure)")


# ------------------------------------------------------------------ OFII ---

def page_ofii():
    """Les contacts des gagnants de l'appel d'offre OFII, groupés par domaine.

    L'export porte deux signaux de délivrabilité qu'on ne peut pas ignorer dans
    un mailing : la syntaxe de l'adresse, et l'existence d'un serveur de
    messagerie sur le domaine (MX). Un domaine sans MX ne reçoit rien ; ses
    adresses sont affichées mais ni cliquables ni copiables.
    """
    with CSV_OFII.open(encoding="utf-8", newline="") as f:
        lignes = [r for r in csv.DictReader(f) if (r.get("Email") or "").strip()]

    par_domaine, invalides = {}, []
    for r in lignes:
        adr = r["Email"].strip().lower()
        if not SYNTAXE.match(adr):
            invalides.append(adr)
            continue
        dom = r["Domain"].strip().lower()
        d = par_domaine.setdefault(dom, {"nom": "", "contacts": [], "sansmx": True})
        if not d["nom"] and (r["Company Name"] or "").strip():
            d["nom"] = r["Company Name"].strip()
        if r["MX Active"].strip().lower() == "yes":
            d["sansmx"] = False
        score = r["Confidence Score"].strip()
        d["contacts"].append({
            "nom": (r["Full Name"] or "").strip(),
            "fonction": (r["Job Title"] or "").strip(),
            "adr": adr,
            "decideur": r["Decision Maker"].strip().lower() == "yes",
            "generique": r["Email Type"].strip().lower() == "generic",
            "score": int(score) if score.isdigit() else None,
        })

    fiches = []
    for dom, d in par_domaine.items():
        d["contacts"].sort(key=lambda c: (not c["decideur"], c["generique"],
                                          not c["nom"], c["adr"]))
        fiches.append({"of": d["nom"] or dom, "domaine": dom,
                       "contacts": d["contacts"], "sansmx": d["sansmx"]})
    fiches.sort(key=lambda f: f["of"].lower())

    # les domaines déjà présents dans la campagne FLE, pour ne pas écrire deux fois
    with CSV_HUNTER.open(encoding="utf-8", newline="") as f:
        dom_fle = {r["target_domain"].strip().lower()
                   for r in csv.DictReader(f, delimiter=";") if r.get("target_domain")}

    blocs, nb_sansmx, nb_croise = [], 0, 0
    for f in fiches:
        croise = f["domaine"] in dom_fle
        if croise:
            nb_croise += 1
        if f["sansmx"]:
            nb_sansmx += 1
        envoyables = [c["adr"] for c in f["contacts"]] if not f["sansmx"] else []
        lignes_html = []
        for c in f["contacts"]:
            qui = " · ".join(x for x in (c["nom"], c["fonction"]) if x)
            adr = (f'<span class="adr">{e(c["adr"])}</span>' if f["sansmx"] else
                   f'<a class="adr" href="mailto:{e(c["adr"])}">{e(c["adr"])}</a>')
            lignes_html.append(
                "<li>" + adr
                + (f'<span class="qui">{e(qui)}</span>' if qui else '<span class="qui"></span>')
                + ('<span class="dec">décideur</span>' if c["decideur"] else "")
                + (f'<span class="faible">confiance {c["score"]}</span>'
                   if c["score"] is not None and c["score"] < 70 else "")
                + "</li>"
            )
        action = ('<span class="nope">Domaine sans messagerie</span>' if f["sansmx"] else
                  f'<button class="cop" type="button" data-adr="{e(", ".join(envoyables))}">'
                  f'Copier les {len(envoyables)}</button>')
        avis = []
        if f["sansmx"]:
            avis.append("Ce domaine n'a pas de serveur de messagerie actif&nbsp;: aucune de ces "
                        "adresses ne peut recevoir de courrier. Les liens sont désactivés.")
        if croise:
            avis.append("Ce domaine figure déjà dans la campagne FLE&nbsp;: vérifiez de ne pas "
                        "écrire deux fois au même organisme.")
        avis_html = f'<p class="avis">{" ".join(avis)}</p>' if avis else ""
        blocs.append(
            f'<section class="of{" exclu" if f["sansmx"] else ""}">'
            f'<div class="of-h"><span class="p p-0">·</span><h2>{e(f["of"])}</h2>'
            f'<span class="dom">{e(f["domaine"])}</span>{action}</div>'
            f'{avis_html}<ul class="adrs">{"".join(lignes_html)}</ul></section>'
        )

    total = sum(len(f["contacts"]) for f in fiches)
    envoyables = sum(len(f["contacts"]) for f in fiches if not f["sansmx"])
    decideurs = sum(1 for f in fiches for c in f["contacts"] if c["decideur"])
    compte = (f'<span class="compte">{len(fiches)} organismes · {total} adresses · '
              f'{envoyables} envoyables · {decideurs} décideurs</span>')

    ZONES_OFII["COUNT:OFII"] = compte
    ZONES_OFII["LISTE:OFII"] = "\n  " + "\n  ".join(blocs) + "\n  "
    injecte(PAGE_OFII, ZONES_OFII)
    print(f"{len(fiches)} organismes et {total} adresses écrits dans "
          f"{PAGE_OFII.relative_to(RACINE)} ({envoyables} envoyables, "
          f"{nb_sansmx} domaines sans messagerie, {len(invalides)} adresse mal formée, "
          f"{nb_croise} domaines déjà dans la campagne FLE)")


def injecte(page, zones):
    txt = page.read_text(encoding="utf-8")
    for nom, contenu in zones.items():
        debut, fin = f"<!-- {nom} -->", f"<!-- /{nom} -->"
        if debut not in txt or fin not in txt:
            sys.exit(f"Marqueur {nom} absent de {page}")
        txt = re.sub(re.escape(debut) + r".*?" + re.escape(fin),
                     lambda _, d=debut, c=contenu, f=fin: d + c + f,
                     txt, flags=re.S)
    page.write_text(txt, encoding="utf-8")


if __name__ == "__main__":
    main()
