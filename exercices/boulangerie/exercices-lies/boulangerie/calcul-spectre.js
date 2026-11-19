// Calcule d'avance le spectre des sons du quiz et l'écrit dans spectre.js.
// Sert quand index.html est ouvert directement depuis le disque (file://) : Chrome y interdit l'analyse en direct
// (le son deviendrait muet), alors le quiz relit ce spectre au même instant du son.
// L'analyse est celle du quiz en ligne, faite par Chrome lui-même : AnalyserNode, fftSize 256, lissage .78, relevé 60 fois par seconde.
// usage : node exercices-lies/boulangerie/calcul-spectre.js [son.mp3 ...]
//         chemins vus depuis ce dossier, comme dans index.html ; par défaut, le son du dialogue de reperes.json et enonces.mp3.
//         Dans spectre.js, chaque son est rangé sous son seul nom de fichier (A1-s1.mp3), que le quiz retrouve à la fin de l'adresse du son.
// À relancer chaque fois qu'un son change (après voix.py). Il faut Chrome ou Edge (ou leur chemin dans la variable CHROME).
const fs = require('fs'), http = require('http'), os = require('os'), path = require('path'), { spawn } = require('child_process');
const ICI = __dirname, FPS = 60, TAUX = 48000;

// les bandes que lisent les 38 barres du spectre dans index.html : floor(2 + k * 58), k de 0 au centre à 1 aux bords
const NBAR = 38, BANDES = [...new Set(Array.from({ length: NBAR }, (_, i) => Math.floor(2 + Math.abs(i - (NBAR - 1) / 2) / ((NBAR - 1) / 2) * 58)))].sort((a, b) => a - b);

let sons = process.argv.slice(2);
if (!sons.length) {
  let dialogue = '../../Sons/A1/A1-s1.mp3';
  try { dialogue = JSON.parse(fs.readFileSync(path.join(ICI, 'reperes.json'), 'utf8')).dialogue.fichier || dialogue; } catch (e) {}
  sons = [dialogue, 'enonces.mp3'];
}
for (const s of sons) if (!fs.existsSync(path.resolve(ICI, s))) { console.error(`son introuvable : ${s}`); process.exit(1); }
const NOMS = sons.map(s => path.basename(s));

const CHROMES = [process.env.CHROME,
  path.join(process.env['ProgramFiles'] || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['LOCALAPPDATA'] || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env['ProgramFiles'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const chrome = CHROMES.find(c => c && fs.existsSync(c));
if (!chrome) { console.error('Chrome ou Edge introuvable : indiquer son chemin dans la variable CHROME'); process.exit(1); }

// la page de calcul, servie avec les sons par un petit serveur local (fetch et decodeAudioData ne marchent pas en file://)
const PAGE = `<!doctype html><meta charset="utf-8"><script>
const FPS = ${FPS}, TAUX = ${TAUX}, BANDES = ${JSON.stringify(BANDES)}, NOMS = ${JSON.stringify(NOMS)};
const envoyer = r => fetch('/resultat', { method: 'POST', body: JSON.stringify(r) });
(async () => {
  const sortie = {};
  for (const [k, nom] of NOMS.entries()) {
    const audio = await new OfflineAudioContext(1, 1, TAUX).decodeAudioData(await (await fetch('/son/' + k)).arrayBuffer());
    const n = Math.floor((audio.length - 256) / TAUX * FPS), ctx = new OfflineAudioContext(audio.numberOfChannels, audio.length, TAUX);
    const src = ctx.createBufferSource(), an = ctx.createAnalyser();
    src.buffer = audio; an.fftSize = 256; an.smoothingTimeConstant = .78; src.connect(an).connect(ctx.destination);
    // une image par 1/60 s : la i-ème donne ce que le quiz lirait à l'instant i/60 (l'image 0, avant le son, reste à zéro)
    const freq = new Uint8Array(an.frequencyBinCount), octets = new Uint8Array((n + 1) * BANDES.length);
    for (let i = 1; i <= n; i++) ctx.suspend(i / FPS).then(() => { an.getByteFrequencyData(freq); BANDES.forEach((b, j) => octets[i * BANDES.length + j] = freq[b]); ctx.resume(); });
    src.start(0); await ctx.startRendering();
    let bin = ''; for (let k = 0; k < octets.length; k += 8192) bin += String.fromCharCode(...octets.subarray(k, k + 8192));
    sortie[nom] = btoa(bin);
  }
  await envoyer({ sons: sortie });
})().catch(e => envoyer({ erreur: String(e) }));
</script>`;

const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'spectre-chrome-'));
let navigateur = null;
const finir = code => { if (navigateur) navigateur.kill(); serveur.close(); setTimeout(() => { try { fs.rmSync(profil, { recursive: true, force: true }); } catch (e) {} process.exit(code); }, 500); };
const serveur = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (req.method === 'POST' && url === '/resultat') {
    let corps = ''; req.on('data', d => corps += d); req.on('end', () => {
      res.end('ok'); const r = JSON.parse(corps);
      if (r.erreur) { console.error('échec du calcul : ' + r.erreur); return finir(1); }
      const donnees = { fps: FPS, bandes: BANDES, sons: r.sons };
      fs.writeFileSync(path.join(ICI, 'spectre.js'),
        '// Spectre des sons du quiz calculé d\'avance, relu quand la page est ouverte depuis le disque (file://).\n' +
        '// Généré par calcul-spectre.js : ne pas modifier à la main. sons[fichier] : base64, une image de ' + BANDES.length + ' octets (un par bande) tous les 1/' + FPS + ' s.\n' +
        'window.SPECTRE = ' + JSON.stringify(donnees) + ';\n');
      sons.forEach((s, k) => console.log(`${s} : ${Buffer.from(r.sons[NOMS[k]], 'base64').length / BANDES.length - 1} images`));
      console.log('spectre.js écrit');
      finir(0);
    });
    return;
  }
  if (url === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(PAGE); }
  const k = /^\/son\/(\d+)$/.exec(url);
  if (!k || !sons[+k[1]]) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'audio/mpeg' }); fs.createReadStream(path.resolve(ICI, sons[+k[1]])).pipe(res);
});
serveur.listen(0, '127.0.0.1', () => {
  navigateur = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--mute-audio',
    `--user-data-dir=${profil}`, `http://127.0.0.1:${serveur.address().port}/`], { stdio: 'ignore' });
  setTimeout(() => { console.error('trop long : abandon'); finir(1); }, 60000);
});
