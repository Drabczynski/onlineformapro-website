#!/usr/bin/env python3
"""Fabrique les illustrations de la newsletter CiviCap.

Les clients de messagerie ne savent pas afficher du SVG : on dessine en SVG,
on rend en PNG avec Chromium, en double densité. Le fond de chaque image est
celui du bloc qui l'accueille — un PNG transparent vire au noir dans les
vieux Outlook.

Rien n'est inventé : la grille montre le barème officiel (32 sur 40), les
barres montrent le nombre de questions de chaque parcours. Aucune capture
du produit, aucune personne.
"""
import json, pathlib, subprocess, textwrap

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / "travaux" / "newsletter-civicap" / "img"
VIOLET, SOMBRE, JAUNE = "#6D28D9", "#13041C", "#FBCE08"
PALE, BANDE, CARTE = "#D9CFF0", "#F3EFFB", "#F7F5FD"


def grille(reussite=32, total=40, colonnes=10, cote=42, jeu=12):
    """Le barème, case par case : ce qu'il faut avoir juste pour l'attestation."""
    lignes = -(-total // colonnes)
    w = colonnes * cote + (colonnes - 1) * jeu
    h = lignes * cote + (lignes - 1) * jeu
    cases = []
    for i in range(total):
        x = (i % colonnes) * (cote + jeu)
        y = (i // colonnes) * (cote + jeu)
        if i < reussite:
            cases.append(f'<rect x="{x}" y="{y}" width="{cote}" height="{cote}" rx="10" '
                         f'fill="{VIOLET}"/>')
        else:
            cases.append(f'<rect x="{x + 1}" y="{y + 1}" width="{cote - 2}" height="{cote - 2}" '
                         f'rx="9" fill="#FFFFFF" stroke="{PALE}" stroke-width="2"/>')
    return w, h, (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
                  f'viewBox="0 0 {w} {h}"><rect width="{w}" height="{h}" fill="{BANDE}"/>'
                  + "".join(cases) + "</svg>")


def barres(donnees, largeur=528, hauteur_barre=34, jeu=18):
    """Les trois parcours à l'échelle : 235, 257 et 343 questions."""
    maxi = max(v for _, v in donnees)
    h = len(donnees) * hauteur_barre + (len(donnees) - 1) * jeu
    out = []
    for i, (_, v) in enumerate(donnees):
        y = i * (hauteur_barre + jeu)
        out.append(f'<rect x="0" y="{y}" width="{largeur}" height="{hauteur_barre}" rx="8" '
                   f'fill="#FFFFFF"/>')
        out.append(f'<rect x="0" y="{y}" width="{round(largeur * v / maxi)}" '
                   f'height="{hauteur_barre}" rx="8" fill="{VIOLET}"/>')
    return largeur, h, (f'<svg xmlns="http://www.w3.org/2000/svg" width="{largeur}" height="{h}" '
                        f'viewBox="0 0 {largeur} {h}"><rect width="{largeur}" height="{h}" '
                        f'fill="{CARTE}"/>' + "".join(out) + "</svg>")


GLYPHES = {
    # un repère par thème du programme officiel, rien de plus
    "valeurs": '<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="14"/>'
               f'<circle cx="32" cy="32" r="5" fill="{VIOLET}" stroke="none"/>',
    "institutions": '<path d="M8 25 32 11l24 14"/><path d="M14 25v22M24 25v22M40 25v22M50 25v22"/>'
                    '<path d="M8 52h48"/>',
    "droits": '<path d="M32 13v33M14 20h36"/><path d="M14 20 8 33h12z"/><path d="M50 20 44 33h12z"/>'
              '<path d="M22 47h20"/>',
    "histoire": '<path d="M32 8 54 20v24L32 56 10 44V20Z"/>'
                f'<circle cx="32" cy="32" r="4" fill="{VIOLET}" stroke="none"/>',
    "societe": '<circle cx="32" cy="19" r="7"/><path d="M20 45c0-7 5.4-12 12-12s12 5 12 12"/>'
               '<circle cx="13" cy="29" r="5.5"/><path d="M4 48c0-6 4-10 9-10"/>'
               '<circle cx="51" cy="29" r="5.5"/><path d="M60 48c0-6-4-10-9-10"/>',
    "situation": '<path d="M9 14h46v28H29L17 52v-10H9z"/><path d="M19 24h26M19 32h17"/>',
}


def icone(cle):
    return 64, 64, (f'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" '
                    f'viewBox="0 0 64 64"><rect width="64" height="64" fill="{CARTE}"/>'
                    f'<g fill="none" stroke="{VIOLET}" stroke-width="2.6" stroke-linecap="round" '
                    f'stroke-linejoin="round">{GLYPHES[cle]}</g></svg>')


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    pieces = {"bareme": grille(),
              "parcours": barres([("pluriannuelle", 235), ("resident", 257), ("naturalisation", 343)])}
    pieces.update({f"th-{c}": icone(c) for c in GLYPHES})

    taches = []
    for nom, (w, h, svg) in pieces.items():
        # Chromium ouvre un SVG comme un document sans <head> : on l'enveloppe.
        f = SORTIE / f"_{nom}.html"
        f.write_text("<!doctype html><meta charset=\"utf-8\">"
                     "<style>html,body{margin:0;padding:0;overflow:hidden}"
                     "svg{display:block}</style>" + svg, encoding="utf-8")
        taches.append({"page": str(f), "png": str(SORTIE / f"{nom}.png"), "w": w, "h": h})

    script = textwrap.dedent("""
        import pw from '/opt/node22/lib/node_modules/playwright/index.js';
        const t = JSON.parse(process.argv[2]);
        const b = await pw.chromium.launch();
        for (const x of t) {
          const p = await b.newPage({ viewport: { width: x.w, height: x.h },
                                      deviceScaleFactor: 2 });
          await p.goto('file://' + x.page);
          await p.screenshot({ path: x.png });
          await p.close();
        }
        await b.close();
    """)
    s = SORTIE / "_rendu.mjs"
    s.write_text(script, encoding="utf-8")
    subprocess.run(["node", str(s), json.dumps(taches)], check=True)
    s.unlink()
    for t in taches:
        pathlib.Path(t["page"]).unlink()
        p = pathlib.Path(t["png"])
        print(f"{p.name:16} {t['w']}×{t['h']} affiché · {p.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
