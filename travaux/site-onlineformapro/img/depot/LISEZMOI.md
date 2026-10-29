# Dépôt d'images

Déposez ici, en vrac, les images à mettre dans le site : photos, captures d'écran,
visuels produits, logos. Pas besoin de les renommer ni de les redimensionner.

Deux façons de les déposer :

- sur GitHub : ouvrir ce dossier sur la branche `claude/salut-beau-gosse-0ma9xt`
  (https://github.com/Drabczynski/onlineformapro-website/tree/claude/salut-beau-gosse-0ma9xt/travaux/site-onlineformapro/img/depot),
  puis « Add file » → « Upload files » ;
- ou les envoyer directement dans la conversation avec Claude.

Ensuite, demandez à Claude de traiter le dépôt. Il regarde chaque image, choisit son
emplacement (voir `../EMPLACEMENTS.md`), la recadre et la convertit en WebP dans `../site/`,
met à jour les pages, puis vide ce dossier. Si une image ne correspond à aucun emplacement,
il le signale au lieu de la placer.

Ce qui aide :

- **le format** : de préférence au moins 1600 px de large pour les grandes images
  (bandeaux, tuiles), 1200 px pour les vignettes ; PNG ou JPG, en couleurs ;
- **le fond** : pour les visuels produits, un fond coloré ou sombre plutôt que blanc
  (les cartes sont sur fond bleu nuit ou crème) ;
- **le texte incrusté** : à éviter, le site affiche déjà les titres à côté ;
- **une indication** si une image est destinée à un endroit précis : le nom du fichier
  suffit (par exemple `lms-hero.jpg`, `podcast.png`, `prevention.jpg`).
