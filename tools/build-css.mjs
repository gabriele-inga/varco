#!/usr/bin/env node
/**
 * build-css.mjs — genera css/style.min.css da css/style.css.
 *
 * Perche' esiste: style.css e' un foglio di stile documentato, con commenti
 * che spiegano le scelte del design system. Servito com'e' pesa 35,9 KB
 * gzippati, e arriva prima di qualunque pixel: e' il file che decide quando
 * il browser puo' cominciare a disegnare. Tolti commenti e spazi scende a
 * 13,6 KB, cioe' 22 KB in meno sul percorso dell'LCP, senza cambiare una
 * riga di stile e senza rinunciare ai commenti nel sorgente.
 *
 *   node tools/build-css.mjs            prova a vuoto: dice quanto risparmia
 *   node tools/build-css.mjs --scrivi   scrive css/style.min.css
 *
 * Le pagine puntano a style.min.css. Se modifichi style.css devi rieseguire
 * questo comando, altrimenti il sito continua a servire la versione vecchia
 * senza dire niente — ed e' il tipo di errore che si scopre tardi. Per
 * questo tools/check.mjs si rifiuta di dare il via libera se style.min.css
 * e' piu' vecchio di style.css.
 *
 * Il minificatore e' scritto a mano invece di tirarsi dietro una dipendenza
 * in un progetto che non ha un package.json. Di conseguenza e' prudente:
 * NON tocca nulla dentro le stringhe e dentro url(), e non tocca gli
 * operatori + - ~ perche' calc(100% - 20px) senza spazi non e' piu' calc, e
 * nth-child(2n+1) non e' un posto dove si guadagna qualcosa. Alla fine
 * ricontrolla il proprio lavoro: vedi verifica() piu' sotto.
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SORGENTE = join(ROOT, "css", "style.css");
const USCITA = join(ROOT, "css", "style.min.css");
const scrivi = process.argv.includes("--scrivi");

/**
 * Divide il CSS in pezzi INTOCCABILI (stringhe, url(), commenti) e pezzi
 * normali. Lavorare su questa lista invece che su una sola espressione
 * regolare e' la differenza fra un minificatore e un generatore di bug:
 * content: "a: b" e url(data:image/svg+xml,...) contengono i due punti e le
 * virgole attorno a cui si vorrebbe togliere lo spazio.
 */
function pezzi(css) {
  const out = [];
  let buf = "";
  let i = 0;
  const spingi = (tipo, testo) => { if (buf) { out.push({ tipo: "css", testo: buf }); buf = ""; } out.push({ tipo, testo }); };

  while (i < css.length) {
    const c = css[i];

    // commento
    if (c === "/" && css[i + 1] === "*") {
      const fine = css.indexOf("*/", i + 2);
      const stop = fine === -1 ? css.length : fine + 2;
      spingi("commento", css.slice(i, stop));
      i = stop;
      continue;
    }

    // stringa
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < css.length) {
        if (css[j] === "\\") { j += 2; continue; }
        if (css[j] === c) { j++; break; }
        j++;
      }
      spingi("stringa", css.slice(i, j));
      i = j;
      continue;
    }

    // url( ... ) non quotato: dentro ci puo' stare un data: URI intero
    if ((c === "u" || c === "U") && /^url\(/i.test(css.slice(i, i + 4))) {
      let j = i + 4;
      let profondita = 1;
      while (j < css.length && profondita > 0) {
        if (css[j] === "\\") { j += 2; continue; }
        if (css[j] === '"' || css[j] === "'") {
          const q = css[j++];
          while (j < css.length) {
            if (css[j] === "\\") { j += 2; continue; }
            if (css[j] === q) { j++; break; }
            j++;
          }
          continue;
        }
        if (css[j] === "(") profondita++;
        else if (css[j] === ")") profondita--;
        j++;
      }
      spingi("url", css.slice(i, j));
      i = j;
      continue;
    }

    buf += c;
    i++;
  }
  if (buf) out.push({ tipo: "css", testo: buf });
  return out;
}

function minifica(css) {
  const parti = pezzi(css).filter((p) => p.tipo !== "commento");
  let s = parti
    .map((p) => {
      if (p.tipo !== "css") return p.testo;
      let t = p.testo.replace(/\s+/g, " ");
      // Spazio attorno a { } ; , > — nessuno di questi puo' fare da
      // combinatore discendente, quindi toglierlo non cambia il significato.
      t = t.replace(/\s*([{};,>])\s*/g, "$1");
      // Dopo i due punti si', PRIMA no: ".menu :first-child" e
      // ".menu:first-child" sono due selettori diversi.
      t = t.replace(/:\s+/g, ":");
      return t;
    })
    .join("");
  s = s.replace(/;}/g, "}");        // ultimo punto e virgola del blocco
  s = s.replace(/^\s+|\s+$/g, "");
  return s;
}

/**
 * Ricontrollo: le tre cose che un minificatore fatto in casa puo' rompere
 * davvero. Se una non torna, il file non viene scritto.
 */
function verifica(originale, minificato) {
  const problemi = [];
  const senzaCommenti = pezzi(originale).filter((p) => p.tipo !== "commento").map((p) => p.testo).join("");

  const graffe = (t) => [(t.match(/\{/g) || []).length, (t.match(/\}/g) || []).length];
  const [a1, c1] = graffe(senzaCommenti);
  const [a2, c2] = graffe(minificato);
  if (a1 !== a2 || c1 !== c2) problemi.push(`blocchi: ${a1}/${c1} nel sorgente, ${a2}/${c2} nel minificato`);

  // Stringhe e url() devono sopravvivere identici, uno per uno.
  const estrai = (t) => pezzi(t).filter((p) => p.tipo === "stringa" || p.tipo === "url").map((p) => p.testo);
  const s1 = estrai(senzaCommenti);
  const s2 = estrai(minificato);
  if (s1.length !== s2.length) problemi.push(`stringhe e url(): ${s1.length} nel sorgente, ${s2.length} nel minificato`);
  else {
    const diverse = s1.filter((v, i) => v !== s2[i]);
    if (diverse.length) problemi.push(`${diverse.length} stringhe alterate, la prima: ${diverse[0].slice(0, 60)}`);
  }

  // calc() ha bisogno degli spazi attorno a + e -: calc(100%-20px) non e'
  // un errore di stile, e' una dichiarazione che il browser scarta.
  const calc = [...minificato.matchAll(/calc\(([^()]*)\)/g)].filter((m) => /[\d%a-z)]([+-])[\d.]/i.test(m[1]));
  if (calc.length) problemi.push(`${calc.length} calc() senza spazi attorno all'operatore, il primo: calc(${calc[0][1]})`);

  return problemi;
}

// ---- esecuzione ------------------------------------------------------------
const originale = readFileSync(SORGENTE, "utf8");
const minificato = minifica(originale);
const problemi = verifica(originale, minificato);

const kb = (n) => (n / 1024).toFixed(1) + " KB";
const gz = (t) => gzipSync(Buffer.from(t, "utf8"), { level: 9 }).length;

console.log(`\n${scrivi ? "SCRITTURA" : "PROVA A VUOTO — aggiungi --scrivi per scrivere"}`);
console.log(`  css/style.css       ${kb(Buffer.byteLength(originale))}  ->  ${kb(gz(originale))} gzip`);
console.log(`  css/style.min.css   ${kb(Buffer.byteLength(minificato))}  ->  ${kb(gz(minificato))} gzip`);
console.log(`  risparmio sul filo  ${kb(gz(originale) - gz(minificato))}, prima del primo pixel disegnato`);

if (problemi.length) {
  console.error("\nVERIFICA FALLITA — style.min.css NON scritto:");
  for (const p of problemi) console.error("  x  " + p);
  console.error("\nIl sorgente usa un costrutto che questo minificatore non gestisce.");
  console.error("Non aggirarlo: correggi minifica() in tools/build-css.mjs.");
  process.exit(1);
}
console.log("\n  verifica: blocchi, stringhe, url() e calc() integri.");

if (scrivi) {
  writeFileSync(USCITA, minificato, "utf8");
  console.log("  scritto css/style.min.css");
} else if (existsSync(USCITA) && statSync(USCITA).mtimeMs < statSync(SORGENTE).mtimeMs) {
  console.log("\n  ATTENZIONE: style.min.css e' piu' vecchio di style.css.");
  console.log("  Il sito sta servendo stili vecchi. Riesegui con --scrivi.");
}
