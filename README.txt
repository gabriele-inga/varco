Varco — SITO WEB — README
==========================

Aggiornato: 2026-09-08.

Sito statico in HTML/CSS/JS senza framework e senza build. L'unica parte
dinamica e' il proxy PHP del chatbot in api/.

Le specifiche di design (palette, tipografia, componenti, regole) stanno in
DESIGN.md, che e' la fonte autorevole. Se questo README e DESIGN.md dicessero
cose diverse, vale DESIGN.md.


PRIMA DI TUTTO: DUE COMANDI
----------------------------
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
Il sito e' completo e funzionante, ma NON e' pubblicabile finche' non
arrivano tre cose, tutte dati che solo il titolare puo' fornire:

  1. DOMINIO ed EMAIL.
     Oggi sono segnaposto. Per questo tutte le pagine portano
     <meta name="robots" content="noindex, nofollow"> e robots.txt e' in
     Disallow: farsi indicizzare con canonical e og:url che puntano a
     https://[DOMINIO] significa entrare negli indici con URL invalidi e poi
     doverli far rimuovere. Il comando go-live.mjs qui sopra rimette tutto a
     posto in un colpo solo, noindex compreso.

  2. DATI LEGALI (vedi sezione dedicata piu' sotto).

  3. IMMAGINI delle sette pagine servizio senza video
     (vedi assets/servizi/LEGGIMI.txt). Queste non bloccano: finche'
     mancano, la pagina mostra un pannello "Immagine, in arrivo".


DATI LEGALI — DA DECIDERE CON UN COMMERCIALISTA
------------------------------------------------
In legal/privacy.html e legal/termini.html ci sono quattro segnaposto:
[NOME E COGNOME DEL TITOLARE], [INDIRIZZO], [CODICE FISCALE], [EMAIL].

C'e' anche una contraddizione aperta, che nessuno script puo' risolvere.
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
Scelta di deploy: HOSTING PHP CON APACHE. Il sito NON va su Netlify,
GitHub Pages o Cloudflare Pages: li' il PHP non gira, il .htaccess viene
ignorato e api/config.php verrebbe servito in chiaro, chiave compresa.
(Se un giorno servisse un host statico, l'alternativa e' una Cloudflare
Worker: vedi README_CHATBOT.md.)

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
