#!/usr/bin/env node
/**
 * Prépare la version « aperçu » de la page.
 *
 * La page vit dans le dépôt comme un document HTML complet, ouvrable tel quel.
 * L'hébergement d'aperçu fournit lui-même le squelette et refuse les images
 * distantes : ce script retire l'enveloppe et encode les images locales dans
 * le fichier, pour que les deux publications partent de la même source.
 *
 * Les vidéos ne peuvent pas y tenir : elles sont remplacées par leur image
 * d'attente, et restent visibles sur Vercel comme en local.
 *
 *   node tools/build-apercu.mjs catalogue/index.html sortie.html
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [src = 'catalogue/index.html', out = 'apercu.html'] = process.argv.slice(2);
const html = readFileSync(src, 'utf8');
const base = dirname(resolve(src));

const TYPES = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg',
                jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif',
                mp4: 'video/mp4', webm: 'video/webm' };
const PLAFOND = 15 * 1024 * 1024;   // marge sous la limite de publication

// 1. retirer l'enveloppe fournie par l'hôte
const i = html.indexOf('<title>');
const j = html.indexOf('<header class="nav"');
const k = html.lastIndexOf('</body>');
if (i < 0 || j < 0 || k < 0) {
  console.error('Structure inattendue : <title>, <header class="nav"> ou </body> introuvable.');
  process.exit(1);
}
let page = html.slice(i, j) + html.slice(j, k);

// 2. les vidéos : encodées si le budget le permet, sinon remplacées par
//    leur image d'attente (l'aperçu refuse les médias distants)
const SRC_VIDEO = /<(?:source|video)([^>]*?)\ssrc="(?!https?:|data:)([^"]+\.(?:mp4|webm))"/gi;
const pesee = [...page.matchAll(SRC_VIDEO)]
  .map(m => resolve(base, m[2]))
  .filter(existsSync)
  .reduce((n, f) => n + statSync(f).size, 0);
const budgetOk = pesee * 4 / 3 < PLAFOND * 0.8;   // base64 pèse un tiers de plus

let encodees = 0, substituees = 0, sansPoster = [];
if (budgetOk && pesee) {
  page = page.replace(SRC_VIDEO, (whole, attrs, rel) => {
    const file = resolve(base, rel);
    if (!existsSync(file)) return whole;
    const ext = rel.split('.').pop().toLowerCase();
    const balise = whole.slice(1, whole.indexOf(attrs));
    encodees++;
    return `<${balise}${attrs} src="data:${TYPES[ext]};base64,${readFileSync(file).toString('base64')}"`;
  });
  console.log(`${encodees} vidéo(s) encodée(s) — ${(pesee / 1048576).toFixed(1)} Mo de source.`);
} else if (pesee) {
page = page.replace(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi, (whole, attrs) => {
  const local = /(?:src|poster)="(?!https?:|data:)/.test(whole);
  if (!local) return whole;
  substituees++;
  const poster = (attrs.match(/poster="([^"]+)"/) || [])[1];
  if (!poster) {
    sansPoster.push((attrs.match(/class="([^"]+)"/) || [])[1] || 'sans classe');
    const legende = (attrs.match(/data-alt="([^"]+)"/) || [])[1] || 'Vidéo';
    return `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;`
         + `padding:24px;font-size:.86rem;line-height:1.5;color:#6E6E6E">`
         + `${legende}<br><span style="color:#9B9B9B">Trop lourde pour l'aperçu : visible en local et sur Vercel.</span></div>`;
  }
  const cls = (attrs.match(/class="([^"]+)"/) || [])[1];
  const alt = (attrs.match(/data-alt="([^"]+)"/) || [])[1] || '';
  return `<img src="${poster}"${cls ? ` class="${cls}"` : ''} alt="${alt}">`;
  });
}

// 3. encoder les images locales : celles des balises, puis celles
//    appelees depuis la feuille de style par url(), qui echappaient
//    au premier passage et manquaient donc a l'apercu
let inlined = 0, manquantes = [];
const encoder = rel => {
  const file = resolve(base, rel);
  if (!existsSync(file)) { manquantes.push(rel); return null; }
  const ext = rel.split('.').pop().toLowerCase();
  inlined++;
  return `data:${TYPES[ext]};base64,${readFileSync(file).toString('base64')}`;
};

page = page.replace(/(src|href)="(?!https?:|data:|#|\/\/)([^"]+\.(?:svg|png|jpe?g|webp|avif))"/gi,
  (whole, attr, rel) => {
    const uri = encoder(rel);
    return uri ? `${attr}="${uri}"` : whole;
  });

page = page.replace(/url\((['"]?)(?!https?:|data:|#|\/\/)([^)'"]+\.(?:svg|png|jpe?g|webp|avif))\1\)/gi,
  (whole, q, rel) => {
    const uri = encoder(rel);
    return uri ? `url(${uri})` : whole;
  });

writeFileSync(out, page);
const ko = (Buffer.byteLength(page) / 1024).toFixed(1);
console.log(`${out} — ${ko} Ko, ${inlined} image(s) encodée(s)`);
if (manquantes.length) console.warn('Introuvables :', manquantes.join(', '));
if (substituees) console.log(`${substituees} vidéo(s) remplacée(s) par leur image d'attente : trop lourde(s) pour l'aperçu.`);
if (sansPoster.length) console.warn("Vidéo(s) sans image d'attente, remplacée(s) par un cadre légendé :", sansPoster.join(', '));
if (ko > 16000) console.warn('Au-delà de la limite de 16 Mo de la publication.');
