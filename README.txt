Varco — SITO WEB — README
==========================

NOTA VERSIONE: questa build è la revisione LIGHT MODE (v2) del sito, con palette
primaria #025E71, secondaria #FF6B35, font Inter + JetBrains Mono e nuovo logo.
Per tutte le specifiche di palette, tipografia, componenti, spacing e animazioni
vedi DESIGN_SYSTEM.md nella root del pacchetto.


CONTENUTO DEL PACCHETTO
------------------------
index.html                  Home
chi-siamo.html               Pagina Chi siamo
contatti.html                 Pagina Contatti (form)
servizi/                        11 pagine servizio (template coerente)
casi-studio/               index.html (filtro per settore) + 5 casi studio singoli
                           NASCOSTI dal 28/08/2026: i casi sono dimostrativi,
                           con nomi e numeri inventati, e non reggono la promessa
                           "un numero o un come" finche' non ci sono clienti veri.
                           I file restano tutti al loro posto. Nascoste anche le tre
                           testimonianze in home, che firmavano gli stessi clienti,
                           e il pulsante "Guarda i risultati" dell'hero.
                           Per rimettere tutto in linea: cercare in tutto il progetto
                           CASI-STUDIO-NASCOSTO e togliere i commenti che marca
                           (HTML, sitemap.xml e i meta robots noindex). Il CSS della
                           famiglia caso studio non e' mai stato toccato.
legal/                          Privacy, Cookie, Termini (testi dimostrativi — vedi sotto)
css/style.css               Foglio di stile unico, design system a variabili CSS
js/chat.js                  Widget chatbot AI (vedi README_CHATBOT.md)
js/main.js                  JS vanilla: menu mobile, FAQ, reveal on scroll, filtro casi studio, invio form
assets/                      Logo, favicon, immagine Open Graph, icone SVG dei servizi
robots.txt, sitemap.xml     SEO tecnica di base

STACK
-----
HTML5 + CSS3 (variabili custom, grid, flexbox) + JavaScript vanilla.
Nessuna dipendenza esterna eccetto i Google Fonts (Inter, JetBrains Mono),
caricati via <link> nell'head di ogni pagina. Se preferisci non dipendere da Google Fonts,
scarica i file .woff2 e sostituisci il link con una @font-face locale in css/style.css.

COME METTERE ONLINE IL SITO
----------------------------
1. Carica l'intera cartella (index.html incluso) nella root del tuo hosting via FTP/SFTP
   o pannello file manager (Netlify, o qualsiasi hosting statico).
2. Verifica che i percorsi relativi restino intatti: non spostare i file fuori dalla
   struttura di cartelle fornita (css/, js/, assets/, servizi/, casi-studio/, legal/).
3. Imposta il dominio finale al posto del segnaposto https://[DOMINIO] in:
   - la costante SITE_URL nello script di generazione (se vuoi rigenerare il sito), oppure
   - cerca e sostituisci manualmente "https://[DOMINIO]" in tutti i file
     HTML (meta canonical, Open Graph) e in sitemap.xml / robots.txt.
4. Il form di contatti (contatti.html) invia davvero: fa POST su Formspree
   (endpoint nell'attributo action del form, gestione in js/main.js). Da fare
   una volta sola: confermare l'indirizzo di destinazione dalla dashboard
   Formspree e provare un invio reale end-to-end.
5. Il link segnaposto "Prenota una call" (Calendly inesistente) è stato rimosso
   da contatti.html. Se attivi un calendario vero, reinseriscilo come voce di
   .contact-info-list accanto a telefono/email/WhatsApp.
6. assets/og-image.png è generata con i colori e le parole del sito, ma con i
   font di sistema di fallback (Inter e JetBrains Mono non erano disponibili
   in fase di build). Rigenerala con i font veri, o sostituiscila con
   un'anteprima fotografica, mantenendo 1200×630.

CHECKLIST PRE-GO-LIVE
----------------------
[ ] Sostituire numero di P.IVA segnaposto nel footer con il dato reale.
[ ] Far validare privacy policy, cookie policy e termini da un consulente legale.
[ ] Verificare l'indirizzo di destinazione su Formspree e fare un invio di prova reale.
[ ] Inserire un vero cookie banner conforme se si attivano cookie di analytics/marketing.
[ ] Verificare che numero di telefono, email e link social nel footer siano corretti.
[ ] Aggiungere Google Analytics 4 / Meta Pixel se previsti, rispettando la cookie policy.
[ ] Testare il form e i filtri casi studio su Chrome, Safari e almeno un browser mobile.
[ ] Controllare Core Web Vitals con PageSpeed Insights dopo la messa online definitiva.
[ ] Inviare sitemap.xml a Google Search Console e Bing Webmaster Tools.
[ ] Verificare che tutte le immagini/icone abbiano testo alternativo pertinente.
[ ] Rivedere i 5 casi studio: sono contenuti dimostrativi con dati di esempio —
    sostituire con casi reali (o ottenere il consenso dei clienti citati) prima
    della pubblicazione pubblica, se non si tratta ancora di clienti reali.
[ ] Chatbot AI: inserire la API key in api/config.php e aggiornare la privacy
    policy (vedi README_CHATBOT.md).
[ ] Impostare redirect 404 personalizzata (non inclusa in questo pacchetto).

NOTE SUI CONTENUTI
-------------------
- I 5 casi studio (Osteria Bramante, Bianchi & Partners, Rossi Srl, Ferraro Immobiliare,
  Verde Moda) sono ESEMPI DIMOSTRATIVI con nomi e numeri fittizi ma realistici, come da
  richiesta del brief. Vanno sostituiti con casi reali (o resi espliciti come "esempi di
  scenario tipico") prima della pubblicazione definitiva.
- Squadra in chi-siamo.html: nomi/ruoli di esempio, da sostituire con il team reale.
- Il logo utilizzato è quello fornito (assets/logo/logo.svg), invariato.
- Copy in italiano, tono diretto, senza claim non supportati da un numero o da un "come".

ACCESSIBILITÀ E PERFORMANCE
-----------------------------
- Markup semantico (header/main/footer/nav), focus visibile su tutti gli elementi
  interattivi, rispetto di prefers-reduced-motion, contrasto testo/sfondo verificato
  sulla palette scura del sito.
- Nessuna libreria JS pesante: solo vanilla JS (~4 KB non minificato).
- Immagini sostituite da SVG/CSS dove possibile per ridurre peso e tempi di caricamento;
  se aggiungi fotografie reali, esporta in WebP/AVIF e specifica sempre width/height.

BUON LAVORO,
Varco
