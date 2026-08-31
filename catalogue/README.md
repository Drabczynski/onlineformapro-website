# Maquette — page catalogue e-learning

Prototype de refonte de `onlineformapro.com/catalogue-elearning-onlineformapro/`.
Page statique autonome : aucune dépendance, aucun build.

## La visualiser

**Double-clic** sur `index.html` — c'est un document HTML complet, il s'ouvre
tel quel dans n'importe quel navigateur.

Si le navigateur bloque le chargement des polices en `file://`, servir le dossier :

```bash
npx serve catalogue     # puis http://localhost:3000
# ou
python3 -m http.server 8000 -d catalogue
```

## Ce qu'elle contient

- Argumentaire réorienté vers l'acheteur B2B (responsable formation, dirigeant d'OF)
- Bloc-réponse en tête, rédigé pour être cité par les moteurs génératifs
- JSON-LD : `Organization`, `WebPage`, `BreadcrumbList`, `ItemList`, `FAQPage`
- Thème repris du template Payflow, rouge de marque en accent unique
- Animations : nav en pilule flottante, révélations décalées au scroll,
  compteurs, marquee, sommaire sticky à point actif
- `prefers-reduced-motion` respecté

## À arbitrer avant mise en ligne

- Chiffres, références clients et éligibilité CPF par domaine : repris de sources
  publiques et de la page actuelle, à confirmer en interne
- La page publique annonce « 9 rubriques » et en affiche 12 — cette maquette retient 12
- Police d'approche : Plus Jakarta Sans, à remplacer par celle de la charte

## Note de publication

`index.html` embarque son propre `<!doctype>`, `<head>` et un reset minimal pour
être ouvrable en local. L'hébergement d'artefact fournit déjà ce squelette :
pour republier la page en tant qu'artefact, en retirer l'enveloppe au préalable
(du `<!doctype>` au `<meta viewport>`, le bloc « reset minimal », `</head><body>`
et la fermeture finale).
