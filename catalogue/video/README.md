# Vidéos

Déposer ici les vidéos de la page catalogue : démonstration de la plateforme,
extrait de module, témoignage filmé.

## Format

- **MP4 / H.264 + AAC** en fichier principal : c'est le seul format lu
  partout sans condition.
- **WebM / VP9** en complément si vous l'avez : plus léger à qualité égale,
  ignoré par les navigateurs qui ne le lisent pas.
- **1280 × 720** suffit pour une démonstration intégrée à la page. Le 1080p
  ne se justifie que si la vidéo passe en plein écran.

## Poids

C'est le point qui compte le plus. Une vidéo de démonstration devrait tenir
**sous 5 Mo**, idéalement sous 3. Au-delà, elle retarde le reste de la page
et pénalise le référencement sur les indicateurs de performance.

Trois leviers, dans cet ordre : raccourcir (20 à 30 secondes suffisent pour
une démonstration), couper la bande son si elle n'apporte rien, réduire le
débit avant d'abaisser la définition.

## Fichiers attendus par vidéo

```
demo-plateforme.mp4       la vidéo
demo-plateforme.webm      variante allégée, facultative
demo-plateforme.jpg       image affichée avant lecture — obligatoire
demo-plateforme.vtt       sous-titres, si la vidéo parle
```

L'image d'attente n'est pas un détail : sans elle, la page affiche un cadre
noir tant que la vidéo n'a pas commencé à charger.

## Ce qui sera fait à l'intégration

Une vidéo décorative sera muette, sans commande visible, relancée en boucle,
et **remplacée par son image fixe** pour les personnes ayant demandé à leur
système de limiter les animations. Une vidéo porteuse de contenu gardera ses
commandes et ne démarrera pas seule.

## Deux destinations, une limite

Vercel sert ces fichiers tels quels. L'aperçu partageable, lui, refuse les
médias distants et plafonne à 16 Mo : une vidéo ne peut pas y être encodée.
`tools/build-apercu.mjs` y substitue donc l'image d'attente et le signale.
La vidéo reste visible sur Vercel et en local.

## Droits

Une vidéo montrant des personnes identifiables demande leur autorisation
écrite. Une musique demande une licence couvrant la diffusion en ligne :
les banques gratuites imposent souvent une mention, à vérifier avant
publication.
