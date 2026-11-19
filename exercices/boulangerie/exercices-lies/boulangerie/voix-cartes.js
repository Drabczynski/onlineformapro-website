// Voix du jeu de cartes de vocabulaire (vocabulaire.html), avec ElevenLabs (modèle de voix.py) :
// - un fichier par mot, dit par la boulangère (Femme 2) ;
// - la consigne, dite par la voix des énoncés du quiz (Homme 1).
// usage (dans PowerShell) :
//   $env:ELEVENLABS_API_KEY = [Environment]::GetEnvironmentVariable('ELEVENLABS_API_KEY', 'User'); node exercices-lies/boulangerie/voix-cartes.js
//   ajouter --refaire pour régénérer les fichiers qui existent déjà
// Les fichiers vont dans exercices-lies/boulangerie/cartes/. Tant qu'un fichier manque, la page fait parler la voix du navigateur.
const fs = require('fs'), path = require('path');
const CLE = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY;
const MODELE = process.env.ELEVENLABS_MODELE || 'eleven_v4';
const BOULANGERE = '87kc04olBn8nRQKuNmaf', NARRATEUR = 'W01VS3mCiWjHO239CD72';   // Femme 2 et Homme 1, comme dans voix.py
const MOTS = ['la boulangerie', 'la boulangère', 'la baguette', 'le pain de campagne', 'le croissant',
  'le pain au chocolat', 'la tarte', 'le gâteau', 'la monnaie', 'le sac en papier'];
const CONSIGNE = 'Associe chaque mot à son image.';   // la même phrase que dans vocabulaire.html
// même règle que dans vocabulaire.html : sans accents, des tirets à la place des espaces
const nomFichier = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.mp3';
const A_DIRE = [...MOTS.map(t => ({ fichier: nomFichier(t), texte: t.charAt(0).toUpperCase() + t.slice(1) + '.', voix: BOULANGERE })),
  { fichier: 'retiens.mp3', texte: 'Retiens ces mots.', voix: NARRATEUR },   // avant la partie, les paires sont sur la table
  { fichier: 'consigne.mp3', texte: CONSIGNE, voix: NARRATEUR },
  { fichier: 'ouvre.mp3', texte: 'Ouvre le paquet de cartes.', voix: NARRATEUR }];   // quand le paquet apparaît

(async () => {
  if (!CLE) { console.error('Il manque la clé : $env:ELEVENLABS_API_KEY = "<ta clé>" avant de lancer le script.'); process.exit(1); }
  const dossier = path.join(__dirname, 'cartes'); fs.mkdirSync(dossier, { recursive: true });
  const refaire = process.argv.includes('--refaire');
  for (const { fichier, texte, voix } of A_DIRE) {
    const dst = path.join(dossier, fichier);
    if (fs.existsSync(dst) && !refaire) { console.log('déjà là  ', fichier); continue; }
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voix}?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'xi-api-key': CLE, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texte, model_id: MODELE }),
    });
    if (!r.ok) { console.error(`échec pour « ${texte} » : ${r.status} ${await r.text()}`); process.exit(1); }
    fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
    console.log('fait     ', fichier);
  }
})();
