#!/usr/bin/env node
/**
 * check.mjs — controllo pre-volo del sito. Nessuna dipendenza, nessun npm.
 *
 *   node tools/check.mjs
 *
 * Esce con codice 1 se trova un ERRORE, 0 se ci sono solo avvisi. E' pensato
 * per essere l'ultima cosa che si lancia prima di caricare via FTP, e gira
 * identico dentro GitHub Actions (.github/workflows/check.yml).
 *
 * Ogni controllo qui dentro esiste perche' il problema corrispondente si e'
 * gia' verificato almeno una volta su questo progetto:
 *
 *   1. SEGNAPOSTO   — [DOMINIO] in 26 file e [EMAIL] in 23 sono arrivati fino
 *                     a un audit di pre-pubblicazione senza che nessuno se ne
 *                     accorgesse.
 *   2. SEGRETI      — una chiave API viva e' rimasta in api/config.php dentro
 *                     la web root. Qui si controlla che non entri mai in un
 *                     file tracciato da git.
 *   3. LINK ROTTI   — href locali verso pagine che non esistono piu'.
 *   4. ASSET        — src verso file cancellati (e' successo con tre SVG hero
 *                     sostituiti dal .webp e mai rimossi).
 *   5. PESO         — un video da 12 MB su una pagina che vende ottimizzazione.
 *   6. IMMAGINI     — <img> senza width/height: layout che salta al
 *                     caricamento (CLS).
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP = new Set([".git", ".impeccable", ".design-sync", ".vscode", ".claude", "ds-bundle", "node_modules", "prompts"]);

const errori = [];
const avvisi = [];
const err = (m) => errori.push(m);
const avv = (m) => avvisi.push(m);
const rel = (p) => relative(ROOT, p).split(sep).join("/");

function walk(dir, filtro, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, filtro, out);
    else if (filtro(name)) out.push(p);
  }
  return out;
}

const pagine = walk(ROOT, (n) => n.endsWith(".html"));
const testi = walk(ROOT, (n) => /\.(html|xml|txt|css|js)$/.test(n));

// ---- 1. Segnaposto ---------------------------------------------------------
// [HOSTING PROVIDER] sta in legal/privacy.html, nell'elenco dei responsabili
// del trattamento ex art. 28 GDPR: e' il nome di una societa' vera che deve
// essere dichiarato. Non era in questa lista e nessun controllo lo vedeva.
const SEGNAPOSTO = ["[DOMINIO]", "[EMAIL]", "[NOME E COGNOME DEL TITOLARE]", "[INDIRIZZO", "[CODICE FISCALE]", "[P.IVA]", "[HOSTING PROVIDER]"];
const trovati = new Map();
for (const f of testi) {
  // Gli script li nominano di mestiere. README.txt pure: la sua sezione DATI
  // LEGALI esiste apposta per elencare quali segnaposto vanno riempiti a mano,
  // quindi li contiene per definizione e non smettera' mai di contenerli. Se
  // restasse in elenco, questo controllo non potrebbe mai passare — e un
  // controllo che fallisce sempre e' un controllo che si impara a ignorare.
  // Il file non viene comunque servito: lo negano .htaccess e .vercelignore.
  if (/tools[\\/](check|go-live)\.mjs$/.test(f)) continue;
  if (/[\\/]README\.txt$/.test(f)) continue;
  const s = readFileSync(f, "utf8");
  for (const sp of SEGNAPOSTO) {
    if (!s.includes(sp)) continue;
    if (!trovati.has(sp)) trovati.set(sp, []);
    trovati.get(sp).push(rel(f));
  }
}
for (const [sp, files] of trovati) {
  err(`segnaposto ${sp} in ${files.length} file (${files.slice(0, 2).join(", ")}${files.length > 2 ? ", …" : ""})`);
}

// ---- 2. Segreti in file tracciati da git -----------------------------------
// La chiave non deve stare in un file che git conosce, comunque si chiami.
const CHIAVI = [/\bgsk_[A-Za-z0-9]{20,}/, /\bsk-[A-Za-z0-9_-]{20,}/, /\bAIza[A-Za-z0-9_-]{30,}/];
let tracciati = [];
try {
  tracciati = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
} catch { avv("git non disponibile: controllo dei segreti nei file tracciati saltato"); }
for (const t of tracciati) {
  const p = join(ROOT, t);
  if (!existsSync(p) || statSync(p).isDirectory()) continue;
  if (statSync(p).size > 2000000) continue;
  let s;
  try { s = readFileSync(p, "utf8"); } catch { continue; }
  for (const re of CHIAVI) {
    if (re.test(s)) { err(`possibile chiave API in un file TRACCIATO DA GIT: ${t}`); break; }
  }
}
// api/config.php dentro la web root e' la posizione sconsigliata.
if (existsSync(join(ROOT, "api", "config.php"))) {
  avv("api/config.php esiste: sta dentro la web root ed e' protetto solo da .htaccess (Apache). Preferisci VARCO_API_KEY o varco-config.php fuori dalla radice — vedi api/config.example.php");
}

// ---- 3 e 4. Link interni e asset -------------------------------------------
const ATTR = /(?:href|src)\s*=\s*"([^"]+)"/g;
const ESTERNO = /^(https?:|mailto:|tel:|data:|#|\/\/)/i;
for (const f of pagine) {
  const s = readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const base = dirname(f);
  let m;
  ATTR.lastIndex = 0;
  while ((m = ATTR.exec(s))) {
    let href = m[1].trim();
    if (!href || ESTERNO.test(href)) continue;
    href = href.split("#")[0].split("?")[0];
    if (!href) continue;
    // Percorsi assoluti dalla radice: 404.html li usa di proposito, perche'
    // Apache la serve mantenendo nella barra l'indirizzo sbagliato.
    const target = href.startsWith("/") ? join(ROOT, href) : resolve(base, href);
    if (existsSync(target)) continue;
    // URL puliti (vercel.json cleanUrls + riscrittura .htaccess): "/pagina"
    // e "/cartella" sul disco sono ancora "pagina.html" e "cartella/index.html".
    if (existsSync(target + ".html") || existsSync(join(target, "index.html"))) continue;
    /* assets/servizi/ e' l'unica assenza prevista: sono le immagini laterali
       delle pagine servizio, che il cliente deve ancora fornire. Finche'
       mancano la pagina mostra il pannello "Immagine, in arrivo" e main.js
       toglie l'<img> che fallisce, quindi non si rompe niente — ma restano
       da consegnare, e l'avviso serve a non dimenticarsene.
       Vedi assets/servizi/LEGGIMI.txt. */
    if (href.includes("assets/servizi/")) avv(`${rel(f)} -> immagine da fornire: ${m[1]}`);
    else err(`${rel(f)} -> riferimento inesistente: ${m[1]}`);
  }
}

// ---- 5. Peso dei media ------------------------------------------------------
const LIMITE_VIDEO = 2 * 1024 * 1024;
const LIMITE_IMG = 300 * 1024;
for (const f of walk(ROOT, (n) => /\.(mp4|webm|png|jpe?g|webp|svg|gif)$/i.test(n))) {
  const size = statSync(f).size;
  const limite = /\.(mp4|webm)$/i.test(f) ? LIMITE_VIDEO : LIMITE_IMG;
  if (size > limite) avv(`${rel(f)} pesa ${Math.round(size / 1024)} KB (soglia ${Math.round(limite / 1024)} KB)`);
}

// ---- 6. img senza dimensioni ------------------------------------------------
for (const f of pagine) {
  const s = readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const imgs = s.match(/<img\b[^>]*>/g) || [];
  const nude = imgs.filter((t) => !/\bwidth=/.test(t) || !/\bheight=/.test(t));
  if (nude.length) avv(`${rel(f)}: ${nude.length} <img> senza width/height (rischio salto di layout)`);
}

// ---- 7. CSS minificato aggiornato -------------------------------------------
// Le pagine caricano css/style.min.css, che lo genera tools/build-css.mjs da
// css/style.css. Chi modifica gli stili tocca il sorgente: se dimentica di
// rigenerare, il sito continua a servire la versione vecchia senza un errore,
// senza una pagina rotta e senza niente da notare finche' qualcuno non chiede
// perche' la modifica "non si vede". Meglio che se ne accorga questo script.
{
  const sorgente = join(ROOT, "css", "style.css");
  const minificato = join(ROOT, "css", "style.min.css");
  if (!existsSync(minificato)) {
    err("css/style.min.css non esiste: le pagine lo caricano. Esegui: node tools/build-css.mjs --scrivi");
  } else if (statSync(minificato).mtimeMs < statSync(sorgente).mtimeMs) {
    err("css/style.min.css e' piu' vecchio di css/style.css: il sito servirebbe stili vecchi. Esegui: node tools/build-css.mjs --scrivi");
  }
}

// ---- 8. Redirect canonici attivi in .htaccess -------------------------------
// Su hosting Apache queste due regole sono l'unica cosa che impedisce a
// http://, https://, www. e non-www di rispondere tutti 200 sulla stessa
// pagina, mentre il canonical ne dichiara una sola. Erano commentate, e
// go-live.mjs non apre .htaccess perche' filtra html|xml|txt: e' esattamente
// il tipo di riga che resta spenta senza che nessuno se ne accorga, fino a
// trovarsi quattro varianti di ogni URL negli indici.
{
  const h = join(ROOT, ".htaccess");
  if (existsSync(h)) {
    const s = readFileSync(h, "utf8");
    const attiva = (re) => s.split("\n").some((r) => !r.trim().startsWith("#") && re.test(r));
    if (!attiva(/RewriteCond\s+%\{HTTPS\}\s+off/)) err(".htaccess: il redirect http -> https e' commentato o assente");
    if (!attiva(/RewriteCond\s+%\{HTTP_HOST\}\s+\^www\\\./)) err(".htaccess: manca la regola di host canonico www -> non-www");
    if (!attiva(/llms\\\.txt/)) err(".htaccess: llms.txt non e' fra le eccezioni di FilesMatch, verrebbe servito come 403");
    if (attiva(/Strict-Transport-Security/)) avv(".htaccess: HSTS e' attivo — verifica che https risponda davvero sul dominio finale");
  }
}

// ---- 9. Risorse esterne che la CSP bloccherebbe -----------------------------
// Il caso reale: index.html caricava GSAP da cdnjs.cloudflare.com mentre la
// CSP dichiarava script-src 'self'. In produzione il browser bloccava i due
// file, js/problem-motion.js trovava window.gsap assente e usciva senza
// errori: l'animazione non partiva e niente lo segnalava. E' il modo in cui
// una CSP corretta e un <script> sbagliato si nascondono a vicenda.
{
  // Le origini permesse le leggo dalle CSP davvero scritte in .htaccess —
  // quella generale e quella ristretta alla pagina dell'agente vocale — cosi'
  // il controllo segue la configurazione invece di ripeterla a memoria.
  const conf = existsSync(join(ROOT, ".htaccess")) ? readFileSync(join(ROOT, ".htaccess"), "utf8") : "";
  const permesse = new Set();
  for (const m of conf.matchAll(/Content-Security-Policy\s+"([^"]+)"/g)) {
    for (const o of m[1].matchAll(/(https?|wss):\/\/[^\s;'"]+/g)) permesse.add(o[0].replace(/\/$/, ""));
  }
  // Stessa verifica su vercel.json: e' l'unica configurazione che conta sul
  // deploy Vercel, e le due possono divergere senza che nulla lo segnali.
  const vercel = existsSync(join(ROOT, "vercel.json")) ? readFileSync(join(ROOT, "vercel.json"), "utf8") : "";
  const permesseVercel = new Set();
  for (const m of vercel.matchAll(/Content-Security-Policy[^}]*?"value":\s*"([^"]+)"/g)) {
    for (const o of m[1].matchAll(/(https?|wss):\/\/[^\s;'"\\]+/g)) permesseVercel.add(o[0].replace(/\/$/, ""));
  }
  for (const o of permesse) if (vercel && !permesseVercel.has(o)) avv(`CSP disallineate: ${o} e' permessa in .htaccess ma non in vercel.json`);
  for (const o of permesseVercel) if (conf && !permesse.has(o)) avv(`CSP disallineate: ${o} e' permessa in vercel.json ma non in .htaccess`);

  for (const f of pagine) {
    const s = readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    const esterni = [
      ...[...s.matchAll(/<script\b[^>]*\bsrc="(https?:\/\/[^"]+)"/g)].map((m) => ["script-src", m[1]]),
      ...[...s.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="(https?:\/\/[^"]+)"/g)].map((m) => ["style-src", m[1]]),
      ...[...s.matchAll(/<link\b[^>]*\bhref="(https?:\/\/[^"]+)"[^>]*\brel="stylesheet"/g)].map((m) => ["style-src", m[1]]),
    ];
    for (const [direttiva, url] of esterni) {
      const origine = new URL(url).origin;
      if (permesse.has(origine)) continue;
      err(`${rel(f)}: carica ${origine} (${direttiva}) ma nessuna CSP lo permette — il browser lo blocca in silenzio, senza pagina rotta e senza errore visibile. Ospitalo in locale, oppure aggiungi l'origine alla CSP in .htaccess E in vercel.json.`);
    }
  }
}

// ---- resoconto --------------------------------------------------------------
const linea = "-".repeat(64);
console.log(`\nControllo pre-volo — ${pagine.length} pagine HTML\n${linea}`);
if (errori.length) {
  console.log(`\nERRORI (${errori.length}) — bloccano la pubblicazione:`);
  for (const e of errori) console.log("  x  " + e);
}
if (avvisi.length) {
  console.log(`\nAVVISI (${avvisi.length}) — da valutare, non bloccano:`);
  for (const a of avvisi) console.log("  !  " + a);
}
if (!errori.length && !avvisi.length) console.log("\nTutto a posto.");
console.log(`\n${linea}\n${errori.length} errori, ${avvisi.length} avvisi\n`);
process.exit(errori.length ? 1 : 0);
