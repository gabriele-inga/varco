#!/usr/bin/env node
/**
 * go-live.mjs — sostituisce i segnaposto e riapre l'indicizzazione.
 *
 * Il problema che risolve: dominio ed email comparivano in una cinquantina di
 * punti fra canonical, og:url, JSON-LD, sitemap, robots e footer. Farlo a mano
 * con "cerca e sostituisci" significa dimenticarne uno e accorgersene da
 * Search Console tre settimane dopo. Qui e' un comando solo, ed e' verificabile:
 * senza --scrivi non tocca niente e dice soltanto cosa farebbe.
 *
 *   node tools/go-live.mjs --dominio varco.it --email info@varco.it
 *   node tools/go-live.mjs --dominio varco.it --email info@varco.it --scrivi
 *
 * Cosa fa, in ordine:
 *   1. https://[DOMINIO]         ->  https://varco.it          (html, xml)
 *   2. <strong>[EMAIL]</strong>  ->  link mailto funzionante   (testi legali)
 *   3. [EMAIL]                   ->  info@varco.it             (resto)
 *   4. noindex,nofollow          ->  index,follow              (17 pagine)
 *   5. robots.txt                ->  Allow + riga Sitemap
 *   6. rimette la voce Email nell'elenco contatti di contatti.html
 *   7. rimette "email" nel JSON-LD dell'organizzazione
 *
 * Cosa NON fa, di proposito: i dati anagrafici nei testi legali
 * ([NOME E COGNOME DEL TITOLARE], [INDIRIZZO], [CODICE FISCALE]). Quelle sono
 * dichiarazioni legali, non stringhe: le scrivi tu, dopo aver deciso con il
 * commercialista la questione della partita IVA. Lo script te le elenca e si
 * rifiuta di dire che il sito e' pronto finche' ci sono.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP = new Set([".git", ".impeccable", ".design-sync", ".vscode", ".claude", "ds-bundle", "node_modules", "tools", "prompts"]);

// ---- argomenti -------------------------------------------------------------
const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf("--" + name);
  return i > -1 ? argv[i + 1] : null;
};
const scrivi = argv.includes("--scrivi");
let dominio = arg("dominio");
const email = arg("email");

if (!dominio || !email) {
  console.error("Uso: node tools/go-live.mjs --dominio varco.it --email info@varco.it [--scrivi]");
  process.exit(2);
}
dominio = dominio.replace(/^https?:\/\//, "").replace(/\/+$/, "");
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominio)) {
  console.error(`Dominio non valido: "${dominio}". Attesi es. varco.it oppure www.varco.it`);
  process.exit(2);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error(`Email non valida: "${email}"`);
  process.exit(2);
}

const BASE = "https://" + dominio;

// ---- raccolta file ---------------------------------------------------------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(html|xml|txt)$/.test(name)) out.push(p);
  }
  return out;
}

const CI_EMAIL = `        <div class="contact-info-item">
          <div class="ci-label">Email</div>
          <a class="ci-value" href="mailto:${email}">${email}</a>
        </div>
`;

const NOINDEX_BLOCK = `<!-- SEGNAPOSTO-DOMINIO: noindex finche' canonical e og:url puntano a
     https://[DOMINIO]. Lo rimette a "index, follow" lo script
     tools/go-live.mjs quando gli passi il dominio vero. -->
<meta name="robots" content="noindex, nofollow">`;

let cambiati = 0;
const riepilogo = [];
/* Il contenuto TRASFORMATO di ogni file, tenuto da parte per il controllo
   finale dei segnaposto. Rileggere da disco farebbe dire alla prova a vuoto
   che i segnaposto ci sono ancora — veri, ma non dopo la scrittura: il
   resoconto descriverebbe un mondo diverso da quello che sta proponendo. */
const risultato = new Map();

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel === "robots.txt") continue; // riscritto per intero piu' sotto
  let s = readFileSync(file, "utf8");
  const prima = s;
  const conta = {};

  const sostituisci = (cerca, metti, etichetta) => {
    const n = s.split(cerca).length - 1;
    if (n) { s = s.split(cerca).join(metti); conta[etichetta] = (conta[etichetta] || 0) + n; }
  };

  // Prima il blocco noindex, finche' contiene ancora [DOMINIO] testuale.
  sostituisci(NOINDEX_BLOCK, '<meta name="robots" content="index, follow">', "riaperta indicizzazione");

  sostituisci("https://[DOMINIO]", BASE, "dominio");
  sostituisci("<strong>[EMAIL]</strong>", `<a href="mailto:${email}">${email}</a>`, "email nei testi legali");
  sostituisci("[EMAIL]", email, "email");

  // JSON-LD: la proprieta' email era stata tolta perche' conteneva un
  // segnaposto, e un dato strutturato sbagliato e' peggio di uno assente.
  // Ora che l'indirizzo esiste, torna al suo posto.
  sostituisci('"telephone": "+393888648509", "logo"', `"telephone": "+393888648509", "email": "${email}", "logo"`, "email JSON-LD");
  sostituisci('"telephone": "+393888648509", "sameAs"', `"telephone": "+393888648509", "email": "${email}", "sameAs"`, "email JSON-LD");

  if (rel === "contatti.html" && !s.includes('class="ci-label">Email<')) {
    const ancora = '        <div class="contact-info-item">\n          <div class="ci-label">WhatsApp</div>';
    if (s.includes(ancora)) { s = s.replace(ancora, CI_EMAIL + ancora); conta["voce Email nei contatti"] = 1; }
  }

  risultato.set(file, s);
  if (s !== prima) {
    cambiati++;
    riepilogo.push([rel, conta]);
    if (scrivi) writeFileSync(file, s, "utf8");
  }
}

// ---- robots.txt ------------------------------------------------------------
const robots = `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;
if (scrivi) writeFileSync(join(ROOT, "robots.txt"), robots, "utf8");
/* Anche robots.txt entra nel risultato, altrimenti il controllo finale lo
   rileggerebbe da disco e continuerebbe a segnalare il [DOMINIO] che questo
   script ha appena tolto. */
risultato.set(join(ROOT, "robots.txt"), robots);
riepilogo.push(["robots.txt", { "riscritto: scansione riaperta": 1 }]);

// ---- resoconto -------------------------------------------------------------
console.log(`\n${scrivi ? "SCRITTO" : "PROVA A VUOTO — aggiungi --scrivi per applicare"}`);
console.log(`Dominio: ${BASE}`);
console.log(`Email:   ${email}\n`);
for (const [rel, conta] of riepilogo) {
  const dettaglio = Object.entries(conta).map(([k, v]) => `${k} x${v}`).join(", ");
  console.log("  " + rel.padEnd(42) + " " + dettaglio);
}
console.log(`\n${cambiati} file HTML/XML modificati.`);

// ---- cio' che resta da fare a mano -----------------------------------------
const RESIDUI = ["[NOME E COGNOME DEL TITOLARE]", "[INDIRIZZO", "[CODICE FISCALE]", "[DOMINIO]", "[EMAIL]"];
const perSegnaposto = new Map();
for (const file of walk(ROOT)) {
  const s = risultato.has(file) ? risultato.get(file) : readFileSync(file, "utf8");
  for (const r of RESIDUI) {
    if (!s.includes(r)) continue;
    if (!perSegnaposto.has(r)) perSegnaposto.set(r, []);
    perSegnaposto.get(r).push(relative(ROOT, file).replace(/\\/g, "/"));
  }
}
if (perSegnaposto.size) {
  console.log("\nSEGNAPOSTO ANCORA APERTI — il sito non e' pronto a essere pubblicato:");
  for (const [r, files] of perSegnaposto) {
    console.log(`  ${r}  —  ${files.length} file: ${files.slice(0, 3).join(", ")}${files.length > 3 ? ", …" : ""}`);
  }
  console.log("\nSono dati anagrafici e dichiarazioni legali: vanno scritti a mano, non");
  console.log("sostituiti da uno script. Vedi README.txt, sezione DATI LEGALI.");
} else if (scrivi) {
  console.log("\nNessun segnaposto residuo.");
}
