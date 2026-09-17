/**
 * Varco — proxy chatbot (Vercel Serverless Function).
 *
 * Porta di api/chat.php per hosting Vercel, che non esegue PHP: i file .php
 * vengono serviti come testo statico invece che processati. Stessa logica,
 * stesso system prompt, stessi limiti.
 *
 * Chiave: impostala su Vercel come variabile d'ambiente VARCO_API_KEY
 * (Project Settings -> Environment Variables). Non va mai scritta qui.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SYSTEM_PROMPT = `Sei l'assistente del sito di Varco, agenzia italiana di trasformazione digitale per PMI.

TONO E LINGUA
- Rispondi sempre in italiano, dando del tu, con tono diretto e concreto.
- Frasi brevi. Massimo 120 parole per risposta, spesso bastano 40.
- Niente entusiasmo di maniera, niente emoji, niente elenchi puntati lunghi.

COSA FA VARCO
Varco non vende servizi isolati: parte sempre da un audit gratuito di sito, social e
strumenti già in uso, poi costruisce un sistema unico su web, marketing e automazioni AI,
con un referente unico per progetto e numeri condivisi per intero (anche quelli brutti).
Servizi: web design, web app, ottimizzazione sito, SEO, social media marketing,
campagne ads, video promozionali con AI, email marketing, automazione e-mail,
chatbot, agente vocale per le chiamate.

IL TUO COMPITO
1. Capire il problema concreto di chi scrive (cosa succede oggi, da quanto, cosa hanno già provato).
2. Fare UNA domanda per volta, mai un questionario.
3. Collegare il problema al servizio o alla combinazione di servizi che lo affronta, spiegando il "come" in una frase.
4. Dopo 3-4 scambi, o appena il problema è chiaro, proporre l'audit gratuito di 30 minuti
   rimandando alla pagina Contatti o a WhatsApp. Proponilo una volta, senza insistere.

REGOLE NON NEGOZIABILI
- Non inventare MAI prezzi, tempi di consegna, percentuali, garanzie, nomi di clienti o casi studio.
  Se ti chiedono quanto costa: il preventivo arriva solo dopo l'audit, perché dipende da cosa c'è già.
  Se ti chiedono quanto tempo serve: dipende dal progetto, si definisce nell'audit.
- Non sei un consulente legale, fiscale o medico e non prendi impegni a nome di Varco.
- Se la domanda non c'entra con Varco o col digitale dell'attività di chi scrive, dillo in una riga
  e riporta il discorso al loro problema.
- Se non sai una cosa, dillo e rimanda al contatto umano: WhatsApp o la pagina Contatti.

CONTATTI
Telefono e WhatsApp: +39 388 864 8509 — Email: mrigserviziweb@gmail.com — pagina Contatti del sito.`;

const ENDPOINT = process.env.VARCO_API_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.VARCO_MODEL || 'openai/gpt-oss-120b';
const REASONING_EFFORT = process.env.VARCO_REASONING_EFFORT || 'low';
const RATE_LIMIT_MAX = parseInt(process.env.VARCO_RATE_LIMIT_MAX || '30', 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.VARCO_RATE_LIMIT_WINDOW || '3600', 10);

function fail(res, code, msg) {
  res.status(code).json({ error: msg });
}

function hostOf(url) {
  try { return new URL(url).host.toLowerCase(); } catch (e) { return ''; }
}

module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') return fail(res, 405, 'Metodo non consentito.');

  const apiKey = process.env.VARCO_API_KEY;
  if (!apiKey) {
    return fail(res, 500, 'Chatbot non configurato: imposta VARCO_API_KEY nelle variabili d\'ambiente di Vercel.');
  }

  /* Stessa origine o niente: senza questo controllo l'endpoint diventa un
     proxy AI gratuito e anonimo che chiunque può chiamare dal proprio sito. */
  const selfHost = (req.headers.host || '').toLowerCase();
  const originHeader = req.headers.origin || req.headers.referer || '';
  const originHost = originHeader ? hostOf(originHeader) : '';
  if (!originHost || originHost !== selfHost.replace(/:\d+$/, '')) {
    return fail(res, 403, 'Richiesta non consentita.');
  }

  /* Rate limit per IP, su file in /tmp. Best-effort: su Vercel /tmp non è
     garantito persistere tra invocazioni fredde, ma regge tra quelle calde,
     esattamente come il file temporaneo usato dalla versione PHP. */
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : (xff || '')).split(',')[0].trim() || req.socket.remoteAddress || '0.0.0.0';
  const now = Date.now() / 1000;
  const rlFile = path.join(os.tmpdir(), 'varco_chat_' + crypto.createHash('md5').update('varco|' + ip).digest('hex') + '.txt');

  let hits = [];
  try {
    const raw = fs.readFileSync(rlFile, 'utf8').split(',');
    hits = raw.map((t) => parseInt(t, 10)).filter((t) => t && now - t < RATE_LIMIT_WINDOW);
  } catch (e) { /* nessun file precedente: primo messaggio di questa finestra */ }
  if (hits.length >= RATE_LIMIT_MAX) return fail(res, 429, 'Troppi messaggi. Riprova tra qualche minuto, oppure scrivici su WhatsApp.');
  hits.push(Math.floor(now));
  try { fs.writeFileSync(rlFile, hits.join(',')); } catch (e) { /* non bloccante */ }

  /* Input: solo ruoli attesi, testo troncato, ultimi 16 turni. Il client non
     decide né il system prompt né quanto contesto può far pagare. */
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!Array.isArray(body.messages)) return fail(res, 400, 'Richiesta non valida.');

  const messages = [];
  for (const m of body.messages.slice(-16)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
    const text = String(m.content || '').trim();
    if (!text) continue;
    messages.push({ role: m.role, content: text.slice(0, 1500) });
  }
  if (!messages.length) return fail(res, 400, 'Nessun messaggio.');
  messages.unshift({ role: 'system', content: SYSTEM_PROMPT });

  const payload = {
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 900,
  };
  if (REASONING_EFFORT) payload.reasoning_effort = REASONING_EFFORT;

  let upstream;
  try {
    upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return fail(res, 502, 'Assistente non raggiungibile. Riprova tra poco.');
  }

  const data = await upstream.json().catch(() => null);
  const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  if (!upstream.ok || typeof reply !== 'string') {
    console.error('[varco-chat] HTTP', upstream.status, JSON.stringify(data).slice(0, 500));
    if (upstream.status === 429) return fail(res, 429, 'Assistente sovraccarico in questo momento. Riprova tra un minuto.');
    return fail(res, 502, 'Assistente non disponibile. Scrivici su WhatsApp e ti rispondiamo noi.');
  }

  const trimmed = reply.trim() || 'Non sono riuscito a formulare la risposta. Riprova, oppure scrivici su WhatsApp al +39 388 864 8509.';
  res.status(200).json({ reply: trimmed });
};
