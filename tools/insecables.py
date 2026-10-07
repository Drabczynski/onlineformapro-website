#!/usr/bin/env python3
"""Espaces insécables à la française dans le texte visible d'une page HTML.

Évite les coupures de ligne disgracieuses : une ligne qui finit sur « à », « de », « et »…,
un nombre séparé de son unité (« 40 / questions », « 4,99 / € »), une ponctuation haute
rejetée en début de ligne, un mot composé coupé à son trait d'union (« e- / mail »).

Ne touche ni aux balises ni à leurs attributs, ni aux commentaires (donc ni aux blocs
conditionnels d'Outlook), ni au contenu de <style>, <script> et <title>. Idempotent : on
le relance après chaque modification de texte.

    python3 tools/insecables.py travaux/newsletter-civicap/email.html [autre.html …]

Les veuves (un mot seul en dernière ligne) : les deux derniers mots d'un <p> restent
ensemble. Ailleurs (titres, libellés de cartes étroites), elles se règlent à la main.
"""
import pathlib
import re
import sys

COURTS = ("à a y de le la les un une des du et ou en au aux sa son ses vos nos ce ces ni "
          "il on ne par pour sur dès sans que qui")
MOTS = "|".join(sorted(COURTS.split(), key=len, reverse=True))
BLANC = r"[ \t\r\n]+"
# un mot court isolé : en début de texte, ou précédé d'un blanc, d'une parenthèse, d'un
# guillemet ou d'une insécable déjà posée — pas d'un trait d'union (« est-ce », « t-il »)
ISOLE = r"(?:^|(?<=[\s(«])|(?<=&nbsp;))"
APRES_COURT = re.compile(rf"{ISOLE}({MOTS}){BLANC}(?=[^\s<])", re.I)
COURT_EN_FIN = re.compile(rf"{ISOLE}({MOTS}){BLANC}$", re.I)
NOMBRE = re.compile(rf"(\d){BLANC}(?=[^\W\d_]|[€%])")
AVANT_PONCTUATION = re.compile(rf"{BLANC}(?=[:;!?»%€])")
APRES_GUILLEMET = re.compile(rf"«{BLANC}")
TRAIT_D_UNION = re.compile(r"(?<=[^\W\d_])-(?=[^\W\d_])")
BALISE_EN_LIGNE = re.compile(r"<(span|a|b|i|em|strong|sup|sub|small|u)\b", re.I)
FIN_DE_PARAGRAPHE = re.compile(r"</p\s*>", re.I)


def sans_veuve(t):
    """Fin de paragraphe : les deux derniers mots restent ensemble (au moins trois mots)."""
    corps = t.rstrip()
    i = max(corps.rfind(c) for c in " \t\r\n")
    if i < 0:
        return t
    avant, dernier = corps[:i].rstrip(), corps[i + 1:]
    if "&nbsp;" in dernier or len(avant.split()) < 2:
        return t
    return avant + "&nbsp;" + dernier + t[len(corps):]


def texte(t, suivant=None):
    """Un morceau de texte entre deux balises. `suivant` : la balise qui le suit, s'il y en a."""
    t = APRES_COURT.sub(r"\1&nbsp;", t)
    t = NOMBRE.sub(r"\1&nbsp;", t)
    t = AVANT_PONCTUATION.sub("&nbsp;", t)
    t = APRES_GUILLEMET.sub("«&nbsp;", t)
    t = TRAIT_D_UNION.sub("&#8209;", t)  # trait d'union insécable
    if suivant is not None and BALISE_EN_LIGNE.match(suivant):
        t = COURT_EN_FIN.sub(r"\1&nbsp;", t)  # « à » suivi d'un <span>…
    if suivant is not None and FIN_DE_PARAGRAPHE.match(suivant):
        t = sans_veuve(t)
    return t


def page(html):
    debut = html.find("<body")
    tete, corps = html[:debut], html[debut:]
    morceaux = re.split(r"(<!--.*?-->|<[^>]+>)", corps, flags=re.S)
    sortie, dans = [], None
    for k, m in enumerate(morceaux):
        if m.startswith("<"):
            nom = re.match(r"</?([a-zA-Z0-9]+)", m)
            if nom and nom.group(1).lower() in ("style", "script", "title"):
                dans = None if m.startswith("</") else nom.group(1).lower()
            sortie.append(m)
        elif dans or not m.strip():
            sortie.append(m)
        else:
            sortie.append(texte(m, morceaux[k + 1] if k + 1 < len(morceaux) else None))
    return tete + "".join(sortie)


if __name__ == "__main__":
    for chemin in sys.argv[1:]:
        f = pathlib.Path(chemin)
        avant = f.read_text(encoding="utf-8")
        apres = page(avant)
        f.write_text(apres, encoding="utf-8")
        print(f"{chemin} : {apres.count('&nbsp;') - avant.count('&nbsp;')} insécables ajoutées")
