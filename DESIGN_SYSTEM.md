# Varco — Design System (v2, Light Mode)

Documento di riferimento per sviluppo e manutenzione del sito. Riflette il passaggio
da dark a light mode e l'adozione della palette primaria #025E71.

## 1. Palette

### Superfici
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#FFFFFF` | Background principale |
| `--bg-alt` | `#F7F8FA` | Sezioni alternate (proof strip esclusa, CTA band, ecc.) |
| `--surface` | `#FFFFFF` | Card, form, contenitori |
| `--surface-alt` | `#F7F8FA` | Avatar, chip, tech-pill |

### Testo
| Token | Hex | Uso |
|---|---|---|
| `--ink` / `--bone` | `#1A1A1A` | Testo primario (nero morbido, mai `#000`) |
| `--bone-dim` | `#5A5A5A` | Testo secondario, paragrafi |
| `--muted` | `#6B7280` | Testo terziario/label — **regolato da `#9CA3AF`** originale per garantire 4.5:1 su bianco (AA) |
| `--muted-deco` | `#9CA3AF` | Solo per bordi, placeholder, elementi non testuali |

### Brand
| Token | Hex | Uso |
|---|---|---|
| `--traccia` (primario) | `#01497C` | CTA primari, link, focus, icone, badge, eyebrow |
| `--traccia-hov` | `#023254` | Hover/active del primario |
| `--primario-light` | `#E6F3F5` | Background badge/tag/selected |
| `--segnale` | = `--traccia` | Numeri risultati (hero stat, case study, r-num). **Palette monocromatica sul blu**: nessun accento arancione — `--segnale` esiste solo per compatibilità del nome, punta al blu primario. |

### Bordi e feedback
| Token | Hex |
|---|---|
| `--line` | `#E8EAED` |
| `--line-strong` | `#D8DCE1` |
| `--success` | `#10B981` |
| `--error` | `#EF4444` |
| `--warning` | `#F59E0B` |

## 2. Tipografia

Unica famiglia UI: **Inter** (Google Fonts, pesi 400/500/600, italic 400/500).
Famiglia dati/numeri: **JetBrains Mono** (pesi 400/500).

Nessun font serif, nessun font display ornamentale.

| Ruolo | Font | Peso | Note |
|---|---|---|---|
| H1 hero | Inter | 500 | `letter-spacing: -0.02em`, `line-height: 1.08`, clamp 2.4rem→4.2rem |
| H2 sezione | Inter | 500 | `letter-spacing: -0.01em`, clamp 1.9rem→2.75rem |
| H3/H4 | Inter | 500 | mai bold (700) |
| Body | Inter | 400 | `line-height: 1.6`, base 17px |
| Caption/eyebrow/label | Inter | 500 | uppercase, `letter-spacing: 0.05em`, colore `--muted` |
| Numeri/dati/risultati | JetBrains Mono | 500 | colore `--segnale` per risultati, `--traccia` per label mono generiche |
| Citazioni (`.pull`, `.testimonial p`) | Inter italic | 400 | unico uso di corsivo nel sito |

Scala tipografica: 12 / 14 / 16 / 17(body) / 18 / 24 / 32 / 48 / 64 / 80px (clamp fluido su H1/H2).

## 3. Componenti

### Bottoni
- **Primario**: bg `--traccia`, testo bianco, `border-radius: 8px`, padding `14px 28px`, peso 500.
  Hover: bg `--traccia-hov`, `translateY(-1px)`, `box-shadow: 0 4px 12px rgba(2,94,113,.15)`.
- **Ghost/secondario**: bg trasparente, bordo `1.5px solid --line-strong`, testo `--ink`.
  Hover: bordo e testo `--traccia`.

### Card
- Bg `--surface`, bordo `1px solid --line`, `border-radius: 16px`, padding 28–32px.
- Hover: `box-shadow: 0 8px 24px rgba(16,24,32,.08)`, `translateY(-2px)`, transition 0.3s.

### Input/Form
- Bordo `1px solid --line`, `border-radius: 8px`.
- Focus: bordo `--traccia` + `box-shadow: 0 0 0 3px rgba(2,94,113,.1)`.
- Label: 12px uppercase, `letter-spacing: 0.05em`, colore `--muted`.

### Navigazione
- Bg bianco traslucido (`rgba(255,255,255,.86)` + `backdrop-filter: blur(12px)`).
- Bordo inferiore compare solo dopo scroll (classe `.is-scrolled`, gestita da `js/main.js`).
- Link: `--bone-dim`, hover/attivo `--traccia`, peso 500.

## 4. Spaziatura

- Sezioni: `padding: 100px 0` (`.section`), `64px 0` per varianti compatte (`.section-tight`).
- Gap tra elementi: 24–48px a seconda del contesto (grid card: 20–24px; blocchi testo: 56–64px).
- Container: `max-width: 1180px`, padding laterale 28px.
- Raggio standard: `--radius: 8px` (bottoni, input, tech-pill); `--radius-lg: 16px` (card, box).

## 5. Animazioni

Due curve, uso deciso dal tipo di movimento — non una a caso:
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` — entrate, press, qualsiasi `transform` (hover-lift, press `scale(.97)`, icone che si spostano, reveal on scroll).
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` — morph on-screen: accordion (`grid-template-rows`), FAQ (`max-height`).
- Cambi di colore/bordo/sfondo/ombra (non `transform`): `ease` semplice, non un token dedicato.

Regole:
- `reveal on scroll`: `opacity 0→1`, `translateY(20px→0)`, `0.6s var(--ease-out)` (IntersectionObserver in `js/main.js`). Griglie con più elementi (`.stagger`, `.problem-list`, `.services-accordion`) sfalsano l'ingresso di 60ms per elemento.
- Hover card: `translateY(-2px/-3px)` + shadow, `var(--ease-out)` 200ms.
- Bottoni: hover `translateY(-1px)` (`ease-out`), `:active` sempre `scale(.97)` (feedback di pressione, 150ms `ease-out`).
- Ogni `:hover` del sito è dentro `@media (hover: hover) and (pointer: fine)` — niente hover "appiccicosi" su touch dopo un tap.
- L'header **non** nasconde più nav e CTA allo scroll (era un'animazione senza scopo che nascondeva il CTA principale del sito): resta sempre visibile, solo bordo/ombra cambiano dopo lo scroll.
- Nessun parallax, nessuno splash/loader, nessuna transizione tra pagine.
- `prefers-reduced-motion: reduce` rispettato globalmente (animazioni disattivate).

## 6. Icone e immagini

- Icone servizio: SVG custom in stile outline (`stroke-width: 1.5`, `stroke-linecap: round`), colore `--traccia` per accenti, `--bone-dim`/`--muted` per neutre — stessa logica visiva di Lucide/Heroicons.
- Nessuna fotografia stock: avatar testimonianze e team come iniziali su sfondo `--primario-light`, per evitare sia il costo/licenza di foto reali sia l'effetto "clipart aziendale".
- Illustrazione "mappa" (sezione Trasformazione 360°): linea tratteggiata `--traccia` con marker `--segnale`, unico uso esteso del colore secondario, giustificato dal contenuto (percorso a tappe).

## 7. Accessibilità

- Testo body e secondario superano 4.5:1 su bianco (`#1A1A1A` ≈ 17.9:1, `#5A5A5A` ≈ 6.9:1).
- `--muted` regolato a `#6B7280` (≈4.8:1) rispetto al valore originario `#9CA3AF` (≈2.5:1, sotto soglia AA per testo normale) — il valore chiaro originale resta disponibile come `--muted-deco` per soli usi non testuali.
- Focus visibile ovunque: `box-shadow: 0 0 0 3px rgba(2,94,113,.18)` su `:focus-visible`.
- Skip link presente (`.skip-link`) per saltare al contenuto principale.
- `prefers-reduced-motion` rispettato.

## 8. Logo

- File sorgente: `assets/logo/logo.svg` (versione nera + icona bicolore teal/nero, per sfondi chiari).
- Header: altezza 34px, sinistra, link alla home.
- Footer: stesso file (il footer è chiaro, non serve versione invertita).
- Favicon: `assets/favicon.svg` (32×32 concettuale, scalabile) e `assets/favicon.png` (180×180), entrambi derivati dal marchio a doppio cerchio (teal + nero) su sfondo bianco arrotondato.
- Open Graph: `assets/og-image.png` (1200×630), palette light coerente con il sito.

## 9. Changelog (25/08/2026)

- **Naming**: l'agenzia si chiama **Varco**. Aggiornati title, meta, schema.org, footer e alt text su tutte le pagine. Email, dominio e profili social sono segnaposto ([EMAIL], https://[DOMINIO]) — da compilare al momento della pubblicazione.
- **Segnale**: corretto un bug per cui `--segnale` puntava a un blu quasi nero (`#001233`) invece dell'arancione documentato. Ora è `#FF6B35` come da palette originale: i numeri risultato (case study, `.r-num`) tornano a "saltare all'occhio".
- **Rimossi**: loading screen (`.page-loader`, `assets/loading.gif`) e cursore custom (`.site-cursor`) — entrambi in contraddizione con la regola "nessuno splash/loader" di questo documento e non necessari su un sito B2B orientato alla conversione.
- **Bottoni**: hover di `.btn-primary` ora usa `--traccia-hov` invece di nero puro; aggiunto `scale(.97)` su `:active` per il feedback di pressione.
- **Nuovi componenti homepage**: `.problem-list` (le 4 criticità della sezione Trasformazione 360°: lista verticale con icona neutra, non card con hover — non sono cliccabili, quindi non si comportano come se lo fossero), `.services-accordion` (lista servizi che si espande all'hover/tap invece della griglia di card), `.lead-magnet` (mini offerta — checklist gratuita via email — prima della CTA di audit), `.partner-logo-card` (proof strip a 2 loghi reali, trattata come vetrina mirata invece che come logo wall).
- **Servizi**: da 9 a 11 — aggiunti Web App (`servizi/web-app.html`) e Video Promozionali con AI (`servizi/video-ai.html`), presenti nel brief ma mancanti dal sito.
- **Footer**: angoli superiori arrotondati (40px, come `main`) per continuità visiva con il resto del sito; social con hover a sfondo pieno invece del solo bordo. Nota: il footer è scuro (`#000`, logo `logo-white.svg`), non chiaro come indicato al punto 8 — testo da correggere in una prossima revisione di questo documento.

## 10. Changelog (26/08/2026)

- **Segnale → monocromatico**: su richiesta esplicita, l'arancione introdotto il 25/08 (punto 9) è stato rimosso di nuovo. `--segnale`/`--segnale-dim` puntano ora a `--traccia`/`--traccia-hov`: tutta l'interfaccia (numeri risultato inclusi) è sul blu primario, palette monocromatica. Vedi §1.
- **Card casi studio squadrate**: `.case-card` e `.cs-result` hanno `border-radius: 0`, in rottura intenzionale con `--radius-lg` (16px) usato ovunque altrove (accordion servizi, testimonial, lead-magnet, form). Scelta deliberata solo per la famiglia "casi studio" — non estesa al resto del sito.
- **Nuovo componente `.cs-btn`**: "Leggi il caso studio" non è più un link di testo in stile monospace, ma un bottone dedicato (sfondo `--primario-light`, si riempie di blu all'hover, icona freccia SVG) — presente in tutte le 32 occorrenze del sito (home, indice casi studio, mini-sezione "Casi studio" di ogni pagina servizio).
- **Frecce testuali → SVG**: "Scopri il servizio →" (accordion servizi, `.sr-cta`) e "Leggi il caso studio →" non usano più il carattere Unicode "→"; entrambi hanno un'icona SVG inline coerente con `.arrow-icon` già in uso su `.link-arrow`.
- **Header, animazione scroll ripristinata**: su richiesta esplicita, l'header torna a nascondere/mostrare la barra scendendo/salendo con lo scroll (`transform: translateY(-100%)`, 250ms `--ease-out`) e il logo si centra da scrollato (`left:50%` + `translateX(-50%)`, `--ease-in-out`). Differenza importante rispetto alla versione rimossa il 25/08: stavolta CTA e link di navigazione **non** spariscono mai — una volta scrollato, il menu pillola si nasconde ma l'hamburger (`.nav-toggle`) resta sempre visibile e apre lo stesso overlay `.mobile-nav` anche da desktop, così i link restano raggiungibili con un click, non con un hover che li nasconde di default.
- **Verifica visiva limitata in questa sessione**: il pannello Browser non era visualizzato (compositing/screenshot non disponibili), quindi il riposizionamento del logo e il comportamento hide/show non sono stati confermati con uno screenshot reale — solo via stili calcolati e un test isolato con la stessa tecnica CSS. Vale la pena una verifica visiva manuale dopo il deploy.

## 11. Changelog (26/08/2026, sessione 2)

- **Bug reale trovato e corretto — hero "sfasato" su mobile**: il file aveva DUE definizioni di `.hero-grid`/`.hero-visual` con lo stesso nome ma per sezioni diverse (hero home vs hero delle pagine servizio), e il breakpoint mobile dell'hero home usava un selettore `.hero-grid` "nudo" con specificità più bassa della sua stessa regola desktop — quindi non veniva mai applicato. Scoped tutto sotto `.hero` (home) e `.service-hero` (pagine interne): ora il layout a una colonna scatta correttamente sotto i 900px.
- **Header mobile**: rimosso il bottone "Prenota audit gratuito" dalla barra (era lui a far restringere il logo, competendo per lo spazio in un flex senza wrap) — resta solo l'hamburger accanto al logo. Il CTA ora è la prima voce del menu mobile aperto, evidenziata con sfondo blu (`.mobile-nav-cta`).
- **Aziende partner**: da 2 card bordate arrotondate a un'unica striscia squadrata con divisori verticali (tabella), come richiesto — nessun bordo per singolo logo.
- **Roadmap, scrollytelling solo mobile**: sotto i 760px lo scroll orizzontale sparisce, i 5 step diventano una sequenza verticale con linea e pallini che si accendono via `IntersectionObserver` mentre si scrolla (stesso pattern già usato per `.reveal`, nessuna libreria nuova).
- **"Vedi tutti i casi studio"**: squadrato (`border-radius:0`, scoped a `#casi-studio`) e con freccia SVG coerente con gli altri CTA.
- **Footer → sistema editoriale squadrato**: angoli tornati a 0 (era arrotondato dalla sessione precedente); logo+tagline ora in un "masthead" separato in cima, la griglia sotto è a 3 colonne con divisori verticali tra le colonne invece che solo spaziatura, i social si sono spostati nella riga del copyright in basso.

## 12. Changelog (26/08/2026, sessione 3) — correzioni

- **Tabella partner**: tolte le linee orizzontali sopra/sotto, restano solo quelle verticali (bordo sx, divisore tra i due loghi, bordo dx) a piena altezza. Rimossa anche la variante impilata verticale sotto i 480px (avrebbe reintrodotto linee orizzontali tra i loghi): ora restano semplicemente affiancati anche su schermi stretti, con padding/dimensione logo ridotti quel tanto che basta per non andare a capo.
- **`.cs-btn` ("Leggi il caso studio")**: non più un bottoncino affiancato, ma una barra che occupa l'intera larghezza della card ed è ancorata al fondo (bleed fino ai bordi della card tramite margini negativi pari al padding).
- **Roadmap mobile — ripristinata la versione a redesign verticale era sbagliata**: tolto il layout a lista verticale con pallini introdotto per errore. Su mobile la roadmap torna identica a quella desktop (stessa striscia orizzontale con 5 step e illustrazioni), ma non si scorre più col dito: resta "pinnata" (`position:sticky`) e si sposta in orizzontale in sincrono con lo scroll verticale della pagina — un passaggio alla volta — finché non arriva all'ultimo step, dopodiché lo scroll verticale della pagina prosegue normale. Il desktop non è stato toccato: resta la striscia scorrevile a mano di sempre (`overflow-x:auto`).
- **Icone `.problem-item` (Trasformazione 360°)**: sostituite le 4 icone line-art inline con le illustrazioni fornite in `assets/illustrazioni/trasformazione/{1..4}.svg` (stesso ordine dei 4 problemi). Non più badge blu/cerchiato: ogni immagine occupa una colonna fissa a sinistra (100px, 76px sotto i 480px), a piena altezza della riga (`align-items:stretch` + `object-fit:cover`), separata dal testo da una linea verticale (`border-right`).

## 13. Changelog (26/08/2026, sessione 4)

- **Icone problem-item — sfondo trasparente, dimensione fissa centrata**: tolto `object-fit:cover` (ritagliava l'immagine a riempire la colonna) e lo sfondo `--surface-alt`. Ora ogni icona è centrata nella stessa colonna di prima (100px/76px, piena altezza riga) ma a dimensione fissa 48×48px con `object-fit:contain`, sfondo trasparente — tutte identiche indipendentemente dal formato originale del file.
- **Servizi — scrollytelling verticale solo mobile**: stesso principio della roadmap ma in verticale. Su touch, ogni riga dell'accordion parte chiusa (`sr-body-wrap{grid-template-rows:0fr}`) e nome sbiadito (`opacity:.4`); un `IntersectionObserver` su ogni `.service-row` (soglia stretta al centro schermo, `rootMargin:"-45% 0px -45% 0px"`, stesso codice già usato e collaudato per la roadmap) aggiunge `.is-active` alla riga che sta attraversando il centro — quella si apre con nome pieno e descrizione, quella sopra e quella sotto restano chiuse col solo nome. Su desktop la classe non ha alcun effetto CSS: resta l'accordion a hover di sempre (verificato: `.is-active` non modifica nulla quando `hover:hover` è vero).
- **Verifica parziale**: in questa sessione il pannello Browser non compone frame (stesso limite riscontrato più volte), quindi il toggle live di `.is-active` durante uno scroll reale non è osservabile con `getComputedStyle`. Ho verificato però che la regola esiste nel foglio di stile esattamente come scritta e che il selettore combacia con l'elemento reale via `Element.matches()` (verità di fatto indipendente dal rendering) — stessa firma del problema già isolato e risolto in una sessione precedente per un altro componente, non un nuovo bug di CSS. Vale un controllo visivo dopo il deploy.
- **Bug reale trovato e corretto — padding footer**: `.footer-col` aveva un typo (`32p` invece di `32px`), che invalida l'intero valore shorthand di `padding` in CSS — le colonne del footer da PC non avevano quindi *nessun* padding orizzontale, testo schiacciato contro i divisori. Sistemato a `36px 32px 36px 32px` su tutte le colonne (rimossa anche l'eccezione `padding-left:0` sulla prima, ora uniforme come richiesto).
- **Hero home, mobile**: l'immagine non aveva mai un `order` nel breakpoint mobile (a differenza dell'hero delle pagine servizio, che già lo aveva) — restava sotto al testo per puro ordine del DOM. Aggiunto `order:-1` sull'immagine sotto i 900px: ora è sopra al testo, verificato via posizione reale in pagina.
- **Casi studio (home) — griglia unita**: le 3 card non hanno più bordo/gap individuali; condividono un unico bordo esterno e divisori verticali tra loro (`gap:0`, scoping `#casi-studio` per non toccare le altre pagine che riusano `.case-card`). "Vedi tutti i casi studio" non è più un bottone separato sotto: è entrato dentro la stessa griglia come riga finale a piena larghezza (`grid-column:1/-1`), attaccata senza spazio alle card sopra. Divisori responsive corretti a 3, 2 e 1 colonna. Verificato pixel per pixel: bordo inferiore delle card = bordo superiore della riga CTA, zero scarto.

## 14. Changelog (26/08/2026, sessione 5)

- **Hero home, mobile**: l'immagine non si mostra più (`display:none` sotto i 900px) invece di andare sopra al testo.
- **Titolo hero = titoli di sezione**: `.hero h1` ora è `4.25rem` fisso, lo stesso valore di `h2` usato da tutti gli altri titoli di sezione del sito (non più il clamp `2.4rem–4.2rem` dedicato). Verificato: stesso `font-size` calcolato di "Ogni servizio funziona da solo..." su viewport 390px.
- **Servizi mobile — bug reale corretto, ne apriva 2 insieme**: l'`IntersectionObserver` a fascia sottile (-45%/-45%) poteva toccare due righe adiacenti contemporaneamente, dato che le righe non hanno spazio tra loro — succedeva quando la fascia cadeva proprio sul confine tra due righe. Sostituito con uno scroll listener (throttled a un aggiornamento per frame via `requestAnimationFrame`, non ad ogni pixel) che sceglie sempre e solo la riga più vicina al centro schermo: per costruzione (confronto `<` stretto, mai `<=`) può vincere una sola riga, mai due, anche in caso di parità geometrica esatta.
- **scroll-snap per rallentare il passaggio (solo touch)**: aggiunto `html{scroll-snap-type:y proximity}` + `.service-row{scroll-snap-align:center}`, scoped a `(hover:none),(pointer:coarse)` — nativo, nessun hijack dello scroll reale, e non tocca il resto della pagina (solo le righe servizio dichiarano un punto di snap). **Non verificabile in questa sessione**: il motore di rendering del pannello Browser usato per i test non registra affatto queste due dichiarazioni nel CSSOM (verificato enumerando le regole via JS: il file su disco è corretto byte per byte, ma il parser di questo strumento specifico le scarta) — `scroll-snap-type`/`scroll-snap-align` sono standard e supportati da anni su Safari iOS e Chrome/Firefox Android, quindi è quasi certamente un limite dello strumento di test, non del codice, ma vale un controllo su un telefono vero.

## 15. Changelog (26/08/2026, sessione 6)

- **Bug reale corretto — bottoni con testo lungo uscivano dal container**: `.btn` ha sempre `white-space:nowrap`; su schermi stretti un testo lungo come "Prenota una consulenza gratuita di 30 minuti" (402px alla sua larghezza naturale) non aveva spazio nel container (319px di contenuto a 375px di viewport) e il bottone si allargava oltre i margini laterali usati ovunque nel sito. Sotto i 620px `.btn` ora permette l'a-capo (`white-space:normal; text-align:center`) — il testo va su due righe solo quando davvero non ci sta, il bottone non supera mai il container. Riguarda anche il CTA dell'hero ("Prenota audit gratuito di 30 minuti"), stesso problema potenziale. Verificato a 375px (nessuno sconfinamento, testo va a capo) e a 1280px (nessun cambiamento, resta su una riga come prima).
- **Servizi mobile — scroll che si ferma ad ogni cambio (in aggiunta al fix precedente)**: oltre a scegliere sempre una sola riga, ora ad ogni cambio di riga attiva lo scroll si blocca 350ms (`document.body.style.overflow="hidden"`, stesso trucco già usato per il menu mobile) prima di liberarsi da solo. Verificato passo-passo: il blocco scatta solo quando la riga attiva cambia davvero (non ad ogni scroll), e un secondo tentativo di cambio riga arrivato durante il blocco viene ignorato finché non scade.
- **Hamburger animato + pillole unite (solo da desktop, scrollato)**: le 3 linee del bottone menu si aprono a X quando `aria-expanded="true"` (`transform`/`opacity`, `--ease-in-out`, 200/150ms — nessun costo extra: `prefers-reduced-motion` già globale la copre). CTA "Prenota audit gratuito" e hamburger, quando compaiono insieme scrollando da desktop, non sono più due pillole separate: stesso blu, raggi complementari (`var(--radius) 0 0 var(--radius)` / `0 var(--radius) var(--radius) 0`), gap:0 — un'unica sagoma continua con un filo chiaro a separare i due punti cliccabili. Scoped a `min-width:981px`: da mobile il CTA resta nascosto e l'hamburger resta un cerchio pieno per conto suo, verificato che la fusione non si attiva lì. **Non verificabile in questa sessione**: l'animazione delle linee (stessa firma già vista più volte — selettore combacia via `Element.matches()`, regola presente nel CSSOM, ma `getComputedStyle` non riflette il cambio dopo la mutazione dell'attributo in questo pannello non compositato); la fusione delle pillole invece è verificata (raggi e colori corretti sia a 1280px che a 390px).
- **Bug corretto — la pillola unita aveva un'altezza diversa dal CTA in cima alla pagina**: nel fondere CTA e hamburger avevo forzato entrambi a `height:48px`, ma il bottone "Prenota audit gratuito" in cima alla pagina è alto naturalmente ~54px (padding 14px, non un'altezza fissa) — la versione scrollata risultava quindi più bassa e visibilmente diversa. Tolta l'altezza forzata dal bottone (torna alla sua altezza naturale, identica a sempre) e portato l'hamburger a 54px per affiancarlo alla pari, invece del contrario. Verificato: 53.6px il bottone in entrambi gli stati, 54px l'hamburger — stessa riga, stesso bordo superiore e inferiore.
- **Footer — griglia e riga finale unificate**: tolta la linea (`border-bottom` sulla griglia a 3 colonne) che separava le colonne dalla riga finale (copyright, social, link legali) — ora sono un unico blocco continuo, senza rigo di mezzo, solo lo spazio interno (26px) della riga finale a dare respiro al testo. Verificato: 0px di bordo su entrambi i lati del confine, i due box si toccano direttamente.

## 16. Changelog (26/08/2026, sessione 7) — `/impeccable document` + refine home

- **`DESIGN.md` generato**: prima documentazione formale (spec DESIGN.md) del sistema, affiancata a questo file — non lo sostituisce. North Star scelto con l'utente: "The Audit Instrument". Sidecar `.impeccable/design.json` generato in parallelo.
- **Bug reale corretto — `--font-mono` non era affatto monospace**: nonostante questo documento, il commento in cima a `style.css` e il `README.txt` dichiarino tutti "JetBrains Mono" come font dati/numeri, `--font-mono` puntava ad **Arimo** (un sans proporzionale) e il `<link>` Google Fonts di `index.html` non caricava nemmeno quello ai pesi giusti (solo peso 700, mai usato). Ogni numero "readout" del sito (risultati case study, indici servizio, step roadmap) rendeva quindi in Arimo, non in monospace. Corretto: `--font-mono` ora punta a JetBrains Mono (con fallback `ui-monospace`), e il `<link>` di `index.html` carica `JetBrains+Mono:wght@400;500`. Le altre pagine vanno allineate con lo stesso `<link>` in una prossima sessione — nel frattempo cadono sul fallback di sistema, non su Arimo.
- **Bug reale corretto — `--traccia-dim` era un hex corrotto**: il valore era `#01497C01497C` (due hex concatenati), CSS non valido, usato come sfondo della barra "Vedi tutti i casi studio" in home. Ora punta a `var(--primario-light)`, coerente con lo stesso ruolo cromatico già usato da `.cs-btn`.
- **Bug reale corretto — ombre/focus ring ancora tinti del vecchio teal**: `--shadow-btn`, il `:focus-visible` globale e il glow di focus dei campi form (incluso il form del lead-magnet in home) usavano `rgba(2,94,113,…)` = `#025E71`, il primario pre-rebrand, invece del blu attuale `#01497C` (`rgba(1,73,124,…)`). Corretto in tutti e 4 i punti in `style.css`.
- **Pulizia home**: rimosso uno `<span></span>` vuoto tra due `<br>` nell'H2 di "Trasformazione 360°" (markup morto, nessun altro H2 del sito usa un doppio `<br>` per lo spaziatura). Allineati ai testi già corretti su `casi-studio/index.html` i tre teaser dei case study in home, che si interrompevano a metà frase/parola invece che a un punto pulito (Osteria Bramante, Rossi Srl, Verde Moda) — stessa correzione non ancora propagata alle sezioni "altri casi studio" delle pagine caso-studio singole.
- **`font-variant-numeric: tabular-nums`** aggiunto a `.r-num`, `.rs-num`, `.sr-index` — i numeri "readout" ora allineano le cifre come un vero strumento di misura, coerente con il North Star "Audit Instrument".
- **Problema noto, non risolto in questa sessione**: un blocco di CSS legacy in fondo a `style.css` (righe ~802–975: `.service-hero`, `.breadcrumb`, `.tag-row`/`.tag`, un secondo `.cta-row`) ridefinisce selettori già esistenti più sopra usando fallback a colori pre-rebrand mai rimossi (`var(--primario, #025E71)`, `var(--primario-10, #025E711A)`, `var(--primario-20, #025E7133)`, oltre a `#111827`/`#4b5563` di un'altra palette). Poiché la cascata CSS fa vincere queste regole successive, `.tag`/`.breadcrumb` sulle pagine servizio rendono probabilmente nel teal vecchio, non nel blu attuale. Non toccato in questa sessione perché fuori dallo scope "home" e non verificato visivamente sulle pagine servizio — richiede una sessione dedicata.
- **Verifica visiva non disponibile in questa sessione** (stesso limite delle sessioni precedenti): nessun pannello Browser/screenshot disponibile. Le correzioni sopra sono verificate a livello di codice (valori, cascata, coerenza con gli altri file del progetto), non con uno screenshot reale — vale un controllo visivo dopo il deploy, in particolare per il caricamento di JetBrains Mono.

## 17. Changelog (26/08/2026, sessione 8) — coerenza sezione recensioni

- **Bug di coerenza reale trovato e corretto — due linguaggi visivi diversi per la stessa cosa**: le pagine caso-studio singole citano il cliente con `blockquote.pull` (filo blu a sinistra, corsivo Inter, `<cite>` mono) — nessuna card, nessun bordo, nessuna decorazione. La sezione "Non lo diciamo solo noi" in home usava invece per lo stesso identico tipo di contenuto (una citazione di un cliente) una card a sé: bordo, `border-radius:16px`, virgolette giganti decorative (`4.4rem`, colore `--primario-light`, mai usate altrove nel sito) e un avatar circolare con iniziali (`border-radius:50%`, una forma non documentata: il sistema usa solo pillola/piatto/16px/40px). Nessuno dei due elementi (virgolette giganti, avatar circolare) era coerente con l'identità "strumento di precisione" del resto del sito.
- **Corretto**: le 3 testimonianze in home ora sono `blockquote.pull` identiche a quelle delle pagine caso-studio (stesso filo blu, stesso corsivo, stessa riga `<cite>` mono con nome, ruolo e azienda) — layout a griglia 3 colonne invariato, cambia solo la pelle di ogni cella. CSS di `.testimonial`/`.t-avatar`/`.t-person` rimosso (nessun altro file lo usava), sostituito da due sole regole scoped (`.testimonials{gap:40px}`, `.testimonials .pull{margin:0;font-size:1.05rem}`).
- **`DESIGN.md` aggiornato**: nuova sottosezione "Quotes" in Components che fissa questa regola come normativa (una sola resa per ogni citazione cliente, ovunque appaia), e un nuovo Don't esplicito per evitare che la card-con-virgolette torni in futuro. Sidecar `.impeccable/design.json` allineato (componente "Testimonial Card" → "Pull Quote").
- **Non toccato**: il blocco CSS legacy di fine file (righe ~800–895, teal pre-rebrand) segnalato nella sessione 7 — ancora fuori scope, ancora loggato come problema aperto.

## 18. Changelog (26/08/2026, sessione 9) — header mobile e footer tagliato

- **Bug reale corretto — logo mobile in coda alla nav invece che centrato**: `.site-header .container` è un flex con `justify-content:flex-end`; sotto i 980px `.brand` tornava `position:static`, quindi come normale elemento flex veniva spinto in fondo (a destra) insieme all'hamburger invece di stare a sinistra o al centro. Corretto riusando la stessa tecnica già presente per il logo scrollato da desktop (`left:50%` + `translateX(-50%)`, ora applicata sempre su mobile): hamburger resta a destra (unico elemento flex rimasto), logo centrato nell'header.
- **Bug reale corretto — footer tagliato su mobile**: `.site-footer` è `position:sticky;bottom:0` (lo stesso trucco di `.proof-strip`, il "reveal" da sotto quando `main`, con z-index più alto, scorre sopra). Sotto i 700px `.footer-grid` impila da 3 a 2 poi 1 colonna e il footer diventa più alto di un viewport da telefono: con sticky ancora attivo, il bordo inferiore del footer resta incollato al fondo dello schermo mentre la parte alta (masthead, prima colonna) finisce sopra il bordo superiore del viewport — senza altro contenuto sotto, non c'è più scroll disponibile per raggiungerla, quindi risultava "tagliata" in modo permanente, non solo visivamente compressa. Corretto: sotto i 700px `.site-footer` torna a `position:static` (scroll normale, tutto raggiungibile); l'effetto sticky/reveal resta invariato su tablet e desktop, dove il footer sta comodamente in un'unica schermata.

## 19. Changelog (26/08/2026, sessione 10) — CTA icone + roadmap (via `/impeccable shape`)

- **Icone bottoni CTA finale (`.cta-band`)**: "Prenota audit gratuito" ora ha la stessa icona diagonale "apri" già usata per l'audit nell'header e nella roadmap, aggiunta come regola scoped `.cta-band .btn-primary::after` (non un `.btn-arrow::after` generico, per non raddoppiare la freccia dritta già disegnata a mano sul CTA dell'hero, che porta la stessa classe `btn-arrow` senza mai averla sfruttata). "Scrivici su WhatsApp" ha una nuova icona SVG custom (bolla rotonda + coda + accento diagonale), disegnata con primitive esatte (circle/path/rect ruotato) invece di un tracciato a mano libera, per non rischiare una forma malformata senza poterla vedere renderizzata in questa sessione.
- **Bug reale corretto — `.btn-ghost-cta` senza stati hover/active**: la rinomina da `.btn-ghost` a `.btn-ghost-cta` (solo per dare sfondo bianco invece di trasparente sulla banda CTA) aveva perso hover e `:active` per strada. Estesi le regole esistenti a includere anche `.btn-ghost-cta`.
- **Bug reale corretto — card roadmap "a livelli diversi"**: `.roadmap-illustration` era `height:auto; max-height:140px`; le 5 SVG (`01-audit.svg`…`05-ottimizzazione.svg`) hanno proporzioni diverse tra loro, quindi occupavano altezze diverse e tutto il testo sotto (numero, titolo, paragrafo) partiva a un'altezza diversa da uno step all'altro. Corretto a `height:140px` fissa (`object-fit:contain` già presente scala l'immagine dentro il box senza deformarla) — vale su tutte le dimensioni, non solo mobile, perché la causa non era responsive.
- **Bug reale corretto — su mobile si vedevano ~2 step e mezzo invece di 1**: `.route`/`.route-steps` avevano `min-width:760px` fisso anche sotto i 760px, quindi su un telefono da ~375px la finestra (`.route-wrap`, sticky + `overflow:hidden`) mostrava più colonne da ~150px affiancate invece di una sola. Lo script che sposta `.route`/`.route-steps` in sincrono con lo scroll verticale (`main.js`) misura già `scrollWidth`/`clientWidth` a runtime, quindi non ha richiesto modifiche: portando `.route` e `.route-steps` a `width:500%` (`gap:0` per non sballare la matematica delle 5 colonne da `1fr`) ogni step ora occupa esattamente la larghezza della finestra, e lo stesso meccanismo già esistente scorre un passaggio pieno alla volta invece di una porzione di più passaggi.
- **Non toccato**: il blocco CSS legacy di fine file (teal pre-rebrand) — ancora fuori scope, ancora loggato come problema aperto.
- **Verifica visiva non disponibile in questa sessione** (stesso limite di sempre): nessuna delle correzioni sopra è stata vista renderizzata in un browser reale — vale un controllo dopo il deploy, in particolare la sincronia linea/pallini-vs-card della roadmap su un telefono vero.

## 20. Changelog (26/08/2026, sessione 11) — `/impeccable critique` + `/impeccable adapt`

- **`/impeccable critique index.html` eseguita** (metodo dual-agent: revisione design + evidenze detector isolate). Punteggio 22/32, 3 problemi P1 (scroll-hijacking doppio su mobile, focus trap nel menu mobile, nav desktop che sparisce dopo 8px di scroll) e 2 P2 (teaser case study troncati a metà frase, salto di livello H2→H4). Report salvato in `.impeccable/critique/`.
- **Bug reale corretto — scroll-jacking rimosso dalla roadmap mobile**: `position:sticky` + `translateX` sincronizzato allo scroll verticale (tutta la pagina si "bloccava" mentre la roadmap scorreva in orizzontale) sostituito da scroll orizzontale nativo (`scroll-snap-type:x mandatory`), un passaggio pieno alla volta. La linea/pallini decorativa (`.route`) non era più sincronizzabile senza JS che la muova in tempo reale, quindi è nascosta su mobile e sostituita da pallini funzionali (`.route-dots`, 5 bottoni circolari) che riflettono la posizione reale via `IntersectionObserver` e permettono anche di saltare a un passaggio col tap. Nessuno scroll-jacking, nessun blocco della pagina.
- **Bug reale corretto — scroll-lock rimosso dall'accordion servizi**: il meccanismo che sceglieva la riga più vicina al centro schermo scrollando e bloccava lo scroll per 350ms ad ogni cambio (×11 righe) è stato sostituito da un accordion a tap/click sull'intestazione (`.sr-head`, ora un `<button>` reale), stesso pattern single-open già usato dalla FAQ. Nessun blocco dello scroll su nessun dispositivo.
- **Bug reale corretto — riga servizio non distingueva più "apri anteprima" da "vai alla pagina"**: prima l'intera riga (`<a class="service-row">`) navigava al primo tap/click ovunque, anche se visivamente mostrava un link interno "Scopri il servizio →" con la sua stessa freccia. Ora `.sr-head` (tap = apri/chiudi la descrizione) e `.sr-cta` (un vero `<a>` indipendente = vai alla pagina del servizio) sono due azioni distinte, su desktop e mobile.
- **Effetto collaterale accettato, non un bug**: su desktop l'hover continua a fare l'anteprima come sempre (CSS puro), ma ora un click "fissa" aperta una riga anche senza hover continuo — è quindi possibile avere una riga fissata aperta e un'altra in anteprima hover contemporaneamente. Comportamento nuovo ma innocuo, non ripristina nessuno dei problemi segnalati in critique.
- **Nuova eccezione di forma documentata in `DESIGN.md`**: i pallini di paginazione (`.route-dot`, cerchio `50%`) sono l'unico uso di una forma circolare nel sistema — scelta deliberata perché è la convenzione universalmente riconosciuta per un indicatore di posizione, non uno strappo alla disciplina pillola/piatto/16px/40px.
- **Non toccati in questa sessione (P1/P2 rimanenti)**: la nav desktop che sparisce dopo 8px di scroll (`/impeccable layout`), il focus trap nel menu mobile (`/impeccable audit`), i teaser case study troncati e il salto di livello H2→H4 (`/impeccable clarify` e `/impeccable audit`).
- **Verifica visiva non disponibile in questa sessione** (stesso limite di sempre): la sincronia reale dei pallini con lo scroll nativo e il tap-to-expand dei servizi non sono stati visti renderizzati in un browser — vale un controllo su un telefono vero dopo il deploy.

## 21. Changelog (26/08/2026, sessione 12) — chiusura problemi rimanenti di critique

- **Bug reale corretto — nav desktop spariva dopo 8px di scroll (P1)**: `.site-header.is-scrolled .nav-desktop{display:none}` rimossa — la pillola con i 4 link resta visibile anche da scrollato. Di conseguenza rimossi anche: il logo che si centrava da scrollato (avrebbe finito sopra la pillola, sempre visibile ora) e l'intera fusione CTA+hamburger da desktop scrollato (esisteva solo per raggiungere quei link quando sparivano — ora ridondante). L'hamburger resta uno strumento esclusivamente mobile, come già era sotto i 980px.
- **Bug reale corretto — focus trap nel menu mobile (P1, WCAG 2.4.3)**: `#mobile-nav` era nascosto solo via `opacity`/`pointer-events`, restando nel tab order e nell'albero di accessibilità da chiuso. Aggiunto l'attributo `inert` (presente di default nell'HTML, tolto/rimesso in `main.js` insieme alla classe `.open`) — tab da tastiera e screen reader non incontrano più 7 link invisibili prima del contenuto della pagina.
- **Bug reale corretto — salto di livello H2→H4 (P2)**: i 4 titoli di `.problem-list` e i 5 titoli di `.route-steps` erano `<h4>` direttamente sotto un `<h2>`, senza `<h3>` nella sezione. Promossi a `<h3>` (CSS aggiornato di conseguenza, stessa dimensione visiva invariata) — la struttura ad intestazioni della sezione "Trasformazione 360°" ora non salta livelli.
- **Copy corretto — teaser case studio non più troncati a metà frase (P2)**: le 3 card in home (Osteria Bramante, Rossi Srl, Verde Moda) finivano con "…" a metà frase anche dopo la correzione della sessione 7. Riscritte come frasi complete e brevi, usando solo testo già presente nella pagina caso-studio completa di ciascuna (nessun fatto nuovo, nessuna claim aggiunta) — es. "Zero prenotazioni online: tutto passava dal telefono fisso in sala." invece di continuare a metà della frase successiva.
- **Con questa sessione, tutti i 5 problemi prioritari di `/impeccable critique` (26/08, sessione 10) sono stati affrontati**: 3 P1 (scroll-hijacking doppio — sessione 11; focus trap; nav desktop) e 2 P2 (teaser troncati; salto H2→H4).
- **Verifica visiva non disponibile in questa sessione**: nessuna delle correzioni sopra è stata vista renderizzata — vale la pena un controllo reale dopo il deploy, in particolare che la pillola nav non si sovrapponga visivamente a nient'altro da scrollato su schermi stretti-ma-non-mobile (~981–1100px).

## 22. Changelog (26/08/2026, sessione 13) — `/impeccable shape` sulle pagine servizio

- **Spazio video al posto delle illustrazioni SVG, su tutte le 11 pagine servizio**: la colonna immagine dell'hero (`.hero-visual`, in 3 diverse varianti di markup a seconda della pagina — vedi sotto) è ora `.hero-video`, un pannello 16:9 in registro "Black Stage" (nero, bordo `#202020`) con bottone play blu e didascalia mono "Video dimostrativo — in arrivo". Nessun video reale esiste ancora nel pacchetto: stessa onestà già usata per og-image, Calendly e P.IVA.
- **Bug reale trovato durante la migrazione — illustrazioni riciclate/sbagliate**: `web-app.html` e `video-ai.html` non avevano un'illustrazione dedicata e riusavano rispettivamente `web-design-hero.svg` e `social-media-hero.svg` (asset di *altri* servizi). Non più rilevante: sostituiti dallo stesso spazio video di tutti gli altri.
- **Normalizzazione struttura hero**: le 11 pagine avevano in realtà 3 varianti diverse della stessa sezione (`.hero-grid`+`.hero-visual` semplice su 1 pagina, `.hero-grid`+`.hero-visual.hero-visual--transparent` su 3, `.two-col` con icona 120×120 inline su 7). Tutte e 11 ora condividono la stessa struttura `.hero-grid`/`.hero-content`/`.hero-video`.
- **Bug reale corretto — blocco CSS legacy di fine file, segnalato e rimandato nelle sessioni 7 e 9**: quel blocco ridefiniva `.breadcrumb`, `.tag`, `.tag-row`, `.cta-row` e i colori del testo hero usando variabili mai esistite in `:root` (`--testo`, `--primario`, `--primario-10`, `--primario-20`) che risolvevano sempre al fallback — un teal pre-rebrand (`#025E71`) per ogni `.tag` del sito (bug attivo su tutte le pagine servizio, non solo teorico) e un nero leggermente sbagliato (`#111827` invece di `--ink`) per H1 e lede dell'hero. Risolto ora perché la stessa area di codice andava comunque toccata per lo spazio video: rimosse le ridefinizioni duplicate, tenute solo le regole uniche del blocco (hero-grid/hero-content, `.breadcrumb .sep`/`.current`) con i token corretti.
- **"Altri servizi" → ledger numerato**: la fila di pillole `.tag` è sostituita da un elenco a bordo unico (`.related-services`) che riusa la numerazione canonica 01-11 di ogni servizio (stessa di `.sr-index` in home) + nome + freccia. Curation invariata: ogni pagina mantiene esattamente lo stesso sottoinsieme di servizi correlati che aveva prima — cambia solo la presentazione.
- **`DESIGN.md` aggiornato** con i due nuovi componenti (Hero Video, Related Services) e una seconda eccezione narrow-scope alla regola delle forme (il bottone play circolare, stessa logica dei pallini di paginazione).
- **Verifica visiva non disponibile in questa sessione**: modifiche su 11 pagine, nessuna vista renderizzata — vale un controllo reale dopo il deploy, in particolare l'aspect-ratio 16:9 del pannello video su schermi molto stretti e molto larghi.
