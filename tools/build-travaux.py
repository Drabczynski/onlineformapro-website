#!/usr/bin/env python3
"""Régénère la table « Gagnants d'appels d'offre » dans index.html.

    python3 tools/build-travaux.py

Lit travaux/prospection-fle.csv et réécrit le fragment situé entre les deux
marqueurs TABLE:PROSPECTION-FLE de index.html. Rien d'autre n'est touché.
"""
import csv
import html
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
CSV = RACINE / "travaux" / "prospection-fle.csv"
PAGE = RACINE / "index.html"
ZONES = {
    "COUNT:PROSPECTION-FLE": None,   # le compteur, dans l'en-tête de l'encart
    "TABLE:PROSPECTION-FLE": None,   # la table, sous le paragraphe
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
    compte = (f'<span class="m">{len(lignes)} organismes · '
              f'{n["A"]} en A · {n["B"]} en B · {n["C"]} en C</span>')

    ZONES["COUNT:PROSPECTION-FLE"] = compte
    ZONES["TABLE:PROSPECTION-FLE"] = "\n" + table + "\n        "

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


if __name__ == "__main__":
    main()
