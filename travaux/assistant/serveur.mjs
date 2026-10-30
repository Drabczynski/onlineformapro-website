// L'assistant IA de la recherche « Décrivez votre projet », branché sur Claude.
//
// Sert le site (travaux/site-onlineformapro) et son point d'accès POST /api/assistant : il reçoit
// { messages: [{ role, content }] } (la conversation du panneau) et rend { reponse, liens, relances },
// ce qu'attend recherche.js. Les réponses s'appuient sur le texte des pages du site, relu au
// démarrage : le site change, l'assistant suit. Les pages servies portent déjà
// data-assistant="/api/assistant" (ajouté à la volée) ; en cas d'échec, le panneau retombe sur
// l'assistant de la maquette.
//
//   cd travaux/assistant && npm install && ANTHROPIC_API_KEY=… npm start
//   puis http://localhost:8787/lms.html
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(ICI, '../site-onlineformapro');
const PORT = Number(process.env.PORT) || 8787;
const client = new Anthropic();

// ------------------------------------------------------------------ ce que sait l'assistant
// les pages vers lesquelles il peut orienter (un lien hors de cette liste est écarté)
const PAGES = {
  'index.html': 'L’accueil : la solution globale digital learning',
  'lms.html': 'LMS OnlineManager : administration, reporting, marque blanche, espace apprenant (OnlineCompétences, Lisy, OnlineVisio), références, spécifications techniques',
  'outils-ia.html': 'Outils IA : FastFormation, FastQuiz, Learning Podcast, RolePlay IA',
  'catalogue.html': 'Le catalogue de formations e-learning',
  'blog.html': 'Le blog',
  'demo.html': 'Réserver une démonstration de 30 minutes',
  'contact.html': 'Nous contacter : e-mail, téléphone, formulaire, la société',
};
const ANCRES = ['lms.html#administration', 'lms.html#apprenant', 'lms.html#titre-specs', 'outils-ia.html#fastformation', 'outils-ia.html#fastquiz', 'outils-ia.html#learning-podcast', 'outils-ia.html#roleplay'];
const PERMIS = new Set([...Object.keys(PAGES), ...ANCRES]);

// le texte des pages, sans l'en-tête ni le pied communs
function texte(fichier) {
  const html = fs.readFileSync(path.join(SITE, fichier), 'utf8');
  const corps = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [, html])[1];
  return corps.replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, ' [image : $1] ')
    .replace(/<\/(p|h[1-6]|li|blockquote|figcaption|div|section)>/g, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#8209;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"')
    .replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}
const SYSTEME = `Tu es l’assistant de la recherche du site d’Onlineformapro, dans le panneau « Décrivez votre projet ». Les visiteurs sont des responsables formation, RH, organismes de formation, écoles. Tu les écoutes décrire leur projet et tu les orientes vers la solution qui leur convient, en conversation : tu tiens compte de ce qui a déjà été dit.

Tu réponds en français, en une à trois phrases claires, à partir des pages du site ci-dessous et d’elles seules. Si l’information n’y est pas (un tarif, un délai, une fonction non décrite), dis-le simplement et indique que l’équipe peut répondre : +33 (0)3 84 76 52 44, projet@onlineformapro.com. N’invente ni chiffre, ni client, ni fonction.

Ne propose la démonstration que si le visiteur parle de tarifs, d’essai, de rendez-vous ou la demande. Pour le reste, le lien sert à approfondir : la page (ou l’ancre) du site la plus utile, avec un libellé court du type « Découvrir FastQuiz » ; laisse le lien vide si aucune page n’apporte plus que ta réponse. Les relances sont deux questions courtes que le visiteur pourrait poser ensuite et auxquelles les pages répondent.

Liens possibles (href exact) :
${[...PERMIS].map(h => `- ${h}${PAGES[h] ? ` : ${PAGES[h]}` : ''}`).join('\n')}

Les pages du site :
${Object.keys(PAGES).map(f => `<page href="${f}">\n${texte(f)}\n</page>`).join('\n\n')}`;

const FORMAT = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      reponse: { type: 'string' },
      lien: { type: 'object', properties: { texte: { type: 'string' }, href: { type: 'string' } }, required: ['texte', 'href'], additionalProperties: false },
      relances: { type: 'array', items: { type: 'string' } },
    },
    required: ['reponse', 'lien', 'relances'],
    additionalProperties: false,
  },
};

// ------------------------------------------------------------------ une réponse
// la conversation reçue : les douze derniers messages, alternés, en commençant par le visiteur
function nettoyer(messages) {
  const propres = [];
  for (const m of Array.isArray(messages) ? messages.slice(-12) : []) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) continue;
    if (!propres.length && m.role !== 'user') continue;
    if (propres.length && propres.at(-1).role === m.role) propres.pop();
    propres.push({ role: m.role, content: m.content.slice(0, 2000) });
  }
  return propres.at(-1)?.role === 'user' ? propres : [];
}

async function repondre(messages) {
  const r = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    // une conversation de site : de courtes réponses, vite
    output_config: { effort: 'low', format: FORMAT },
    // le texte des pages, identique d'une question à l'autre, reste en cache
    cache_control: { type: 'ephemeral' },
    // si un filtre de sécurité décline la demande, un autre modèle la reprend
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEME,
    messages,
  });
  if (r.stop_reason === 'refusal') return null;
  const bloc = r.content.find(b => b.type === 'text');
  if (!bloc) return null;
  const d = JSON.parse(bloc.text);
  const lien = d.lien && PERMIS.has(d.lien.href) && d.lien.texte.trim() ? [{ texte: d.lien.texte.trim(), href: d.lien.href }] : [];
  return { reponse: d.reponse, liens: lien, relances: (d.relances || []).slice(0, 2) };
}

// ------------------------------------------------------------------ le serveur
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const envoyer = (res, code, corps, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type }); res.end(corps); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/assistant') {
    if (req.method !== 'POST') return envoyer(res, 405, '{}');
    let brut = '';
    for await (const morceau of req) { brut += morceau; if (brut.length > 100_000) return envoyer(res, 413, '{}'); }
    try {
      const messages = nettoyer(JSON.parse(brut).messages);
      if (!messages.length) return envoyer(res, 400, '{}');
      const r = await repondre(messages);
      return r ? envoyer(res, 200, JSON.stringify(r)) : envoyer(res, 502, '{}');
    } catch (e) {
      // le panneau retombe alors sur l'assistant de la maquette
      if (e instanceof Anthropic.AuthenticationError) console.error('Clé d’API absente ou refusée : définir ANTHROPIC_API_KEY.');
      else if (e instanceof Anthropic.RateLimitError) console.error('Limite de débit atteinte.');
      else if (e instanceof Anthropic.APIError) console.error(`Erreur de l’API (${e.status}) :`, e.message);
      else console.error(e.message);
      return envoyer(res, 502, '{}');
    }
  }
  // les fichiers du site ; les pages reçoivent l'adresse de l'assistant
  const fichier = path.join(SITE, path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '') || 'index.html');
  if (!fichier.startsWith(SITE)) return envoyer(res, 403, '');
  fs.readFile(fs.existsSync(fichier) && fs.statSync(fichier).isDirectory() ? path.join(fichier, 'index.html') : fichier, (err, donnees) => {
    if (err) return envoyer(res, 404, 'Introuvable', 'text/plain; charset=utf-8');
    const ext = path.extname(fichier) || '.html';
    if (ext === '.html') donnees = donnees.toString().replace('<html lang="fr"', '<html lang="fr" data-assistant="/api/assistant"');
    envoyer(res, 200, donnees, TYPES[ext] || 'application/octet-stream');
  });
}).listen(PORT, () => {
  console.log(`Site et assistant : http://localhost:${PORT}/  (${Math.round(SYSTEME.length / 1000)} 000 caractères de pages en contexte)`);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) console.log('Sans ANTHROPIC_API_KEY, le panneau répondra avec l’assistant de la maquette.');
});
