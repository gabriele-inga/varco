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
const SEGNAPOSTO = ["[DOMINIO]", "[EMAIL]", "[NOME E COGNOME DEL TITOLARE]", "[INDIRIZZO", "[CODICE FISCALE]", "[P.IVA]"];
const trovati = new Map();
for (const f of testi) {
  if (/tools[\\/](check|go-live)\.mjs$/.test(f)) continue; // gli script li nominano di mestiere
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
