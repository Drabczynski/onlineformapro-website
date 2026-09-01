#!/usr/bin/env node
/**
 * Prépare la version « aperçu » de la page.
 *
 * La page vit dans le dépôt comme un document HTML complet, ouvrable tel quel.
 * L'hébergement d'aperçu fournit lui-même le squelette et refuse les images
 * distantes : ce script retire l'enveloppe et encode les images locales dans
 * le fichier, pour que les deux publications partent de la même source.
 *
 *   node tools/build-apercu.mjs catalogue/index.html sortie.html
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [src = 'catalogue/index.html', out = 'apercu.html'] = process.argv.slice(2);
const html = readFileSync(src, 'utf8');
const base = dirname(resolve(src));

const TYPES = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg',
                jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif' };

// 1. retirer l'enveloppe fournie par l'hôte
const i = html.indexOf('<title>');
const j = html.indexOf('<header class="nav"');
const k = html.lastIndexOf('</body>');
if (i < 0 || j < 0 || k < 0) {
  console.error('Structure inattendue : <title>, <header class="nav"> ou </body> introuvable.');
  process.exit(1);
}
let page = html.slice(i, j) + html.slice(j, k);

// 2. encoder les images locales
let inlined = 0, manquantes = [];
page = page.replace(/(src|href)="(?!https?:|data:|#|\/\/)([^"]+\.(?:svg|png|jpe?g|webp|avif))"/gi,
  (whole, attr, rel) => {
    const file = resolve(base, rel);
    if (!existsSync(file)) { manquantes.push(rel); return whole; }
    const ext = rel.split('.').pop().toLowerCase();
    const b64 = readFileSync(file).toString('base64');
    inlined++;
    return `${attr}="data:${TYPES[ext]};base64,${b64}"`;
  });

writeFileSync(out, page);
const ko = (Buffer.byteLength(page) / 1024).toFixed(1);
console.log(`${out} — ${ko} Ko, ${inlined} image(s) encodée(s)`);
if (manquantes.length) console.warn('Introuvables :', manquantes.join(', '));
if (ko > 16000) console.warn('Au-delà de la limite de 16 Mo de la publication.');
