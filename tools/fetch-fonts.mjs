#!/usr/bin/env node
/**
 * fetch-fonts.mjs — riscarica i woff2 di Inter e JetBrains Mono in locale.
 *
 * Perche' esiste: i font stavano su fonts.googleapis.com. Due connessioni a
 * un'origine esterna e un CSS bloccante in piu' prima del primo paint, piu'
 * una CSP costretta ad aprire verso Google. Ora i file vivono in
 * assets/fonts/ e il blocco @font-face sta in testa a css/style.css.
 *
 * Quando rieseguirlo: se Google pubblica una revisione dei font, oppure se
 * il sito comincia a usare un peso o uno stile che prima non serviva — in
 * quel caso aggiorna anche FAMIGLIE qui sotto.
 *
 *   node tools/fetch-fonts.mjs            prova a vuoto: dice cosa scaricherebbe
 *   node tools/fetch-fonts.mjs --scrivi   scarica davvero
 *
 * Scarica SOLO i sottoinsiemi latin e latin-ext: il sito e' in italiano, e
 * cirillico, greco e vietnamita sarebbero 300 KB che nessuno legge. Sono file
 * variabili, quindi uno per famiglia e stile, non uno per peso.
 */

import { writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DEST = join(ROOT, "assets", "fonts");
const scrivi = process.argv.includes("--scrivi");

// La stessa richiesta che stava nell'head delle pagine.
const QUERY = "family=Inter:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap";
const SUBSET = new Set(["latin", "latin-ext"]);
// Un User-Agent da browser: senza, Google risponde con woff/ttf invece di woff2.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const css = await (await fetch(`https://fonts.googleapis.com/css2?${QUERY}`, { headers: { "User-Agent": UA } })).text();

// I blocchi arrivano come:  /* latin */ @font-face { ... }
const blocchi = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)];
if (!blocchi.length) {
  console.error("Google non ha restituito nessun @font-face. Query cambiata o rete assente.");
  process.exit(1);
}

const daScaricare = new Map(); // url -> nome file
for (const [, subset, corpo] of blocchi) {
  if (!SUBSET.has(subset)) continue;
  const famiglia = (corpo.match(/font-family:\s*['"]([^'"]+)['"]/) || [])[1] || "";
  const stile = (corpo.match(/font-style:\s*(\w+)/) || [])[1] || "normal";
  const url = (corpo.match(/url\(([^)]+)\)/) || [])[1];
  if (!url) continue;
  const slug = famiglia.toLowerCase().replace(/\s+/g, "-");
  daScaricare.set(url, `${slug}-${stile}-${subset}.woff2`);
}

console.log(`\n${scrivi ? "SCARICO" : "PROVA A VUOTO — aggiungi --scrivi per scaricare"}`);
console.log(`${daScaricare.size} file unici (i pesi condividono lo stesso file variabile)\n`);

if (scrivi && !existsSync(DEST)) mkdirSync(DEST, { recursive: true });

let totale = 0;
for (const [url, nome] of daScaricare) {
  const percorso = join(DEST, nome);
  if (!scrivi) {
    const stato = existsSync(percorso) ? `gia' presente, ${statSync(percorso).size} byte` : "NUOVO";
    console.log(`  ${nome.padEnd(38)} ${stato}`);
    continue;
  }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(percorso, buf);
  totale += buf.length;
  console.log(`  ${nome.padEnd(38)} ${buf.length} byte`);
}

if (scrivi) {
  console.log(`\n${(totale / 1024).toFixed(0)} KB scritti in assets/fonts/.`);
  console.log("Il browser scarica solo i sottoinsiemi che la pagina usa davvero:");
  console.log("per una pagina in italiano sono i tre 'latin', non tutti e sei.");
  console.log("\nSe cambiano i nomi dei file, aggiorna il blocco @font-face in testa");
  console.log("a css/style.css e i <link rel=preload> nell'head delle pagine.");
}
