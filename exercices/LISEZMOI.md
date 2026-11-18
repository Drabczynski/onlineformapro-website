# Exercices

Cinq exercices refaits d'après des captures d'écran, aux couleurs des activités FLE (fond lavande, violet, boutons vert
citron, hexagones). Page : https://onlineformapro-website.vercel.app/exercices/

1. **Écouter — Extraits du *Journal en français facile*** : on glisse les verbes au passé composé dans les 7 phrases.
2. **Vocabulaire — Le football** : on glisse 5 mots dans le texte (Mbappé et le Ballon d'Or).
3. **Grammaire — Les adjectifs** : on clique sur la bonne forme (français / française, bon / bonne).
4. **Écouter — Les transports** : vrai ou faux, après l'écoute.
5. **Vocabulaire — La mobilité** : on clique sur le mot entendu dans l'extrait.

- Glisser : à la souris ou au doigt ; on peut aussi toucher un mot, puis un trou. Toucher un trou rempli le vide.
- « Valider » corrige (vert : juste, rose : faux, la bonne réponse en vert), puis « Suivant » ; un bilan à la fin.
- Les données des exercices sont en haut du script de `index.html` (`EXERCICES`) : `[réponse]` = un trou,
  `{*juste|faux}` = un choix.

## Les sons

Les sons sont des voix de synthèse (ElevenLabs), pas les extraits originaux de RFI : `sons/voix.py` lit les textes
qu'il contient (`python3 exercices/sons/voix.py`, ne refait que les textes changés). Les textes des exercices 1, 2 et 5
sont ceux des captures, complétés. Le texte de l'exercice 4 a été écrit pour l'exercice à partir des trois
affirmations (la réponse « faux » de la 3e vient de ce texte : « au Kenya », pas « en tout en Afrique ») : il est à
remplacer par le vrai extrait si on l'a.
