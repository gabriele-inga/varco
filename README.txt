Varco — SITO WEB — README
==========================

Aggiornato: 2026-09-17.

Sito statico in HTML/CSS/JS senza framework. L'unica parte dinamica e' il
proxy del chatbot: api/chat.js come funzione serverless su Vercel, oppure
hosting-php/chat.php su un hosting Apache con PHP.

Non c'e' un bundler, ma dal 2026-09-17 c'e' UN passo di build, uno solo:
le pagine caricano css/style.min.css, che si genera da css/style.css con
tools/build-css.mjs. Se modifichi gli stili e non lo rilanci, il sito serve
la versione vecchia senza dirlo — per questo check.mjs si rifiuta di dare il
via libera quando il minificato e' piu' vecchio del sorgente.

Le specifiche di design (palette, tipografia, componenti, regole) stanno in
DESIGN.md, che e' la fonte autorevole. Se questo README e DESIGN.md dicessero
cose diverse, vale DESIGN.md.


PRIMA DI TUTTO: I COMANDI
--------------------------
    node tools/build-css.mjs --scrivi
        Rigenera css/style.min.css da css/style.css. Da rilanciare DOPO
        ogni modifica agli stili, ed e' l'unico passo di build del progetto.
        Senza --scrivi dice solo quanto risparmierebbe. Si ricontrolla da
        solo: se un costrutto CSS gli sfugge, non scrive il file.

    node tools/fetch-fonts.mjs --scrivi
        Riscarica i woff2 di Inter e JetBrains Mono in assets/fonts/.
        Serve solo se cambiano i font o i pesi usati: normalmente mai.

    node tools/check.mjs
        Controllo pre-volo. Elenca cosa impedisce ancora la pubblicazione:
        segnaposto rimasti, chiavi API in file tracciati da git, link e
        immagini che puntano nel vuoto, media fuori peso. Esce con codice 1
        se trova un errore. Gira anche in CI a ogni push
        (.github/workflows/check.yml).

    node tools/go-live.mjs --dominio varco.it --email info@varco.it
        Prova a vuoto: mostra cosa cambierebbe. Aggiungi --scrivi per
        applicare. Sostituisce dominio ed email in tutti i file, riapre
        l'indicizzazione e riscrive robots.txt. Vedi "MESSA ONLINE".


STATO ATTUALE — COSA MANCA PER PUBBLICARE
------------------------------------------
  1. DOMINIO ed EMAIL — FATTO il 2026-09-17.
     go-live.mjs e' stato eseguito con varcoagency.it e
     mrigserviziweb@gmail.com. Canonical, og:url, JSON-LD, sitemap e llms.txt
     portano il dominio vero; robots.txt e' passato da Disallow: / a Allow: /
     e 17 pagine da noindex a index, follow. Le 6 pagine casi-studio e la 404
     restano noindex, come previsto.

  2. NOME DEL FORNITORE DI HOSTING — FATTO il 2026-09-17.
     legal/privacy.html, punto 4, dichiara "Vercel Inc. (Stati Uniti)" fra i
     responsabili del trattamento ex art. 28 GDPR. Se un giorno il sito
     traslocasse su un hosting Apache, quella riga va riscritta con la
     ragione sociale del nuovo fornitore: e' una dichiarazione legale, non una
     stringa di configurazione, e nessuno script la aggiorna.

  3. CSP DELLA PAGINA AGENTE VOCALE — da provare in produzione.
     Il widget di Retell e' l'unico pezzo di terze parti del sito. Le origini
     che contatta a widget fermo sono note e permesse; quelle che apre a
     conversazione avviata non sono documentate. Prima del lancio: aprire
     /servizi/agente-vocale, avviare una conversazione vera e guardare la
     console. Ogni errore di CSP nomina il dominio da aggiungere, e va
     aggiunto in DUE posti — .htaccess e vercel.json. Se restano disallineati
     lo dice check.mjs.

  4. IMMAGINI delle sette pagine servizio senza video
     (vedi assets/servizi/LEGGIMI.txt). Queste non bloccano: finche'
     mancano, la pagina mostra un pannello "Immagine, in arrivo".

  5. DUE FILE PESANTI E NON PIU' USATI — CANCELLATI il 2026-09-17.
     assets/illustrazioni/home-hero.svg (2,1 MB) e assets/servizi/
     sfondoServ.webp (1,5 MB): 3,6 MB in meno nel deploy. Il primo non era
     grafica vettoriale — incorporava due PNG da 2400x1916 in base64 — ed e'
     stato sostituito da home-hero.webp, 100 KB, la stessa illustrazione. Il
     secondo non era referenziato da nessuna pagina ne' dal CSS.
     Se dovessero servire di nuovo, sono nella cronologia git:
         git checkout bcae66b -- assets/illustrazioni/home-hero.svg
         git checkout bcae66b -- assets/servizi/sfondoServ.webp


DATI LEGALI — DA DECIDERE CON UN COMMERCIALISTA
------------------------------------------------
I segnaposto anagrafici di legal/privacy.html e legal/termini.html sono stati
riempiti: titolare Gabriele Ingaramo, codice fiscale e recapiti sono nel testo.
Resta aperto solo [HOSTING PROVIDER], al punto 4 della privacy (vedi sopra).

C'e' invece una contraddizione ancora aperta, che nessuno script puo' risolvere.
legal/privacy.html, punto 1, dichiara:

    "Non e' presente una partita IVA: l'attivita' e' attualmente svolta
     senza carattere professionale abituale e i progetti proposti tramite
     questo sito sono realizzati a titolo gratuito come casi studio."

Ma il resto del sito vende undici servizi, promette un preventivo scritto
dopo l'audit e ha una pagina Termini e condizioni che parla di forniture.
Le due cose non stanno insieme. Ci sono due strade, e vanno percorse per
intero, non a meta':

  A) C'E' la partita IVA (o si sta aprendo).
     - Riscrivere il punto 1 della privacy togliendo la frase qui sopra.
     - Aggiungere nel footer di ogni pagina denominazione, P.IVA e sede,
       come richiede il D.Lgs 70/2003 art. 7 per un sito che offre servizi.
     - Il resto del sito resta com'e'.

  B) NON c'e' la partita IVA e i progetti sono davvero gratuiti.
     - Allineare il sito alla privacy, non il contrario: togliere il
       linguaggio commerciale (preventivo, forniture, "budget") e riscrivere
       i Termini come accordo per progetti-vetrina gratuiti.
     - E' un lavoro sui testi, non sul codice.

Finche' non e' deciso, tools/check.mjs continua a segnalare errore. E' voluto.


DOVE VIVE LA CHIAVE API DEL CHATBOT
------------------------------------
Ci sono DUE strade, e il progetto le supporta entrambe. Vanno tenute
allineate a mano, perche' niente lo fa al posto tuo.

  VERCEL (quello che la configurazione attuale si aspetta)
    Il proxy e' api/chat.js, funzione serverless. La chiave sta in una
    variabile d'ambiente del progetto Vercel, mai su disco.
    Routing, redirect www -> apex e intestazioni di sicurezza stanno in
    vercel.json: il .htaccess qui NON viene letto.
    .vercelignore tiene fuori dal deploy documentazione, prompt e sorgenti.
    Senza quel file sarebbero URL pubblici: su Vercel tutto cio' che sta nel
    repository diventa raggiungibile.

  HOSTING PHP CON APACHE
    Il proxy e' hosting-php/chat.php, da mettere in api/. Valgono .htaccess
    e le tre posizioni della chiave descritte qui sotto. Il sito NON va su
    GitHub Pages o Cloudflare Pages: li' il PHP non gira, il .htaccess viene
    ignorato e api/config.php verrebbe servito in chiaro, chiave compresa.

ATTENZIONE: .htaccess e vercel.json contengono la stessa Content-Security-
Policy scritta due volte, piu' l'eccezione per la pagina dell'agente vocale.
Se ne modifichi una, modifica l'altra: check.mjs avvisa quando divergono.

Per il resto di questa sezione vale la strada Apache.

api/chat.php cerca la chiave in tre posti, in quest'ordine:

  1. Variabile d'ambiente VARCO_API_KEY.               <- consigliato
     Dal pannello dell'hosting, oppure nel .htaccess di root:
         SetEnv VARCO_API_KEY gsk_la_tua_chiave
     La chiave non esiste su disco: niente da servire per sbaglio, niente
     da caricare per sbaglio via FTP.

  2. varco-config.php UN LIVELLO SOPRA la radice del sito.
     Cioe' accanto a public_html/ o httpdocs/, non dentro. Parti da
     varco-config.example.php in questa cartella. Nessuna richiesta HTTP
     puo' raggiungerlo, su qualunque server.

  3. api/config.php — posizione storica, SCONSIGLIATA.
     Funziona, ma sta dentro la web root: la protegge solo api/.htaccess.
     Supportata per non rompere installazioni esistenti.

Opzioni utili in configurazione (vedi api/config.example.php):
  trusted_proxy    attivalo SOLO dietro Cloudflare o un reverse proxy,
                   altrimenti il limite anti-abuso conta tutti i visitatori
                   come un IP solo e 30 messaggi all'ora valgono per
                   l'intero sito invece che per persona.
  rate_limit_salt  sale per l'hash dell'IP: mettici una stringa tua.
  allowed_origins  solo se il sito vive su piu' domini. La stessa origine
                   e' sempre autorizzata.

api/chat.php accetta richieste SOLO dalla stessa origine del sito. Senza
quel controllo l'endpoint sarebbe un proxy AI gratuito e anonimo per
chiunque, a spese del budget API.


CONTENUTO DEL PACCHETTO
------------------------
index.html                Home
chi-siamo.html            Chi siamo
contatti.html             Contatti (modulo Formspree, invio reale)
404.html                  Pagina non trovata (servita da ErrorDocument)
servizi/                  11 pagine servizio
                          - 4 con il palco video: email-marketing,
                            automazione-email, agente-vocale, chatbot
                          - 7 con la lastra di apertura (frase + immagine):
                            web-design, web-app, ottimizzazione-sito,
                            social-media-marketing, campagne-ads, seo,
                            video-ai
casi-studio/              NASCOSTI dal 28/08/2026 — nomi e numeri inventati.
                          I file restano al loro posto, con meta robots
                          noindex e fuori dalla sitemap. Nascoste anche le
                          tre testimonianze in home, che firmavano gli
                          stessi clienti. Per rimetterli in linea: cercare
                          CASI-STUDIO-NASCOSTO in tutto il progetto.
legal/                    Privacy, Cookie, Termini
css/style.css             Foglio di stile unico
js/main.js                Menu, FAQ, reveal, palco video, invio modulo
js/chat.js                Widget assistente
api/                      Proxy PHP del chatbot (richiede PHP con cURL)
tools/                    check.mjs e go-live.mjs (non vanno caricati online)
.htaccess                 404, intestazioni di sicurezza, cache, blocco dei
                          file che non devono essere serviti
assets/                   Logo, favicon, illustrazioni, video, poster


MESSA ONLINE
-------------
1. Decidere dominio ed email, poi:
       node tools/go-live.mjs --dominio ilmiodominio.it --email info@...
       (guarda l'esito, poi rilancia con --scrivi)

2. Riempire i dati legali a mano (sezione DATI LEGALI qui sopra).

3. Lanciare  node tools/check.mjs  finche' non da' zero errori.

4. Caricare via FTP la cartella, ESCLUSI:
       tools/  prompts/  ds-bundle/  .git/  .github/  .impeccable/
       .design-sync/  .vscode/  *.md  varco-config.example.php
   Il .htaccess di root blocca comunque .md, .txt e i file nascosti se
   dovessero finire online per sbaglio.

5. Mettere la chiave API (sezione DOVE VIVE LA CHIAVE qui sopra) e provare
   il chatbot dal sito vero.

6. Verificare che il modulo contatti arrivi davvero: la destinazione va
   confermata dalla dashboard Formspree (endpoint nell'attributo action di
   contatti.html). Fare un invio di prova reale.

7. Attivare HTTPS, poi togliere il commento alle due sezioni in fondo al
   .htaccess (redirect a https e HSTS). NON attivare HSTS prima che il
   certificato funzioni: bloccherebbe i visitatori fuori dal sito per un
   anno.

8. Inviare sitemap.xml a Google Search Console e Bing Webmaster Tools.

9. assets/og-image.png e' generata con font di sistema di fallback.
   Rigenerarla con Inter e JetBrains Mono, o sostituirla, mantenendo
   1200x630.


COSA RESTA APERTO, MA NON BLOCCA
---------------------------------
[ ] Immagini laterali delle 7 pagine servizio (assets/servizi/LEGGIMI.txt).
[ ] Casi studio: sostituire i 5 esempi con casi reali, oppure lasciarli
    nascosti. Stessa cosa per i nomi del team in chi-siamo.html.
[ ] Analytics: non c'e' niente di installato, e va bene cosi'. Se si
    aggiunge GA4 o Meta Pixel servono PRIMA un banner cookie conforme e
    l'aggiornamento della cookie policy.
[ ] Far validare privacy, cookie policy e termini da un consulente.


STACK E PRESTAZIONI
--------------------
HTML5 + CSS3 (variabili custom, grid, flexbox) + JavaScript vanilla, circa
1000 righe non minificate in js/main.js. Nessuna dipendenza esterna a parte
i Google Fonts (Inter + JetBrains Mono) caricati via <link>. Per non
dipendere da Google: scaricare i .woff2 e sostituire il link con @font-face
locale in css/style.css (e togliere fonts.googleapis.com dalla CSP nel
.htaccess).

Peso degli asset, dopo la ripulitura dell'8 settembre 2026:
  video          25,0 MB -> 2,9 MB   (ricodifica + poster; non partono piu'
                                      al caricamento della pagina, ma quando
                                      il foglio-hero comincia a sollevarsi)
  illustrazioni   6,3 MB -> 2,2 MB   (i raster incorporati negli SVG erano
                                      PNG: ora sono WebP, il vettore e'
                                      intatto)
  file morti      2,4 MB -> 0        (home-hero.svg da 2,1 MB non era usato
                                      da nessuna pagina: l'hero carica il
                                      .webp da 98 KB)

Accessibilita': markup semantico, focus visibile, prefers-reduced-motion
rispettato, contrasto verificato sulla palette chiara (Muted #6B7280 e'
stato alzato apposta per superare il 4,5:1 su bianco — non abbassarlo).
Nessuna certificazione formale: e' una base curata, non un livello WCAG
dichiarato.


BUON LAVORO,
Varco
