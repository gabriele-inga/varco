# Varco — Motion System (v1)

Estende `DESIGN.md` e `DESIGN_SYSTEM.md` alla dimensione temporale. Serve a produrre
le **11 animazioni hero dei servizi** che oggi sono un placeholder ("Video dimostrativo,
in arrivo") dentro `.hero-video-frame`.

Regola guida, ereditata dal sistema statico: *"Nothing bounces, glows ambiently, or moves
without a direct cause."* Un'animazione qui non decora: **mostra il problema descritto nel
copy della pagina e il suo esito misurabile.** Se un movimento non racconta quel passaggio,
non entra.

---

## 1. Il palcoscenico

Ogni animazione vive nel riquadro già presente in tutte le pagine servizio:

| Proprietà | Valore | Origine |
|---|---|---|
| Rapporto | `16 / 9` | `.hero-video-frame` |
| Risoluzione di export | `1280 × 720` (2×: `2560 × 1440`) | — |
| Raggio | `16px` (`--radius-lg`) | `.hero-video-frame` |
| Fondo | `#000000` (nero pieno, il "palco" del sito) | `body{background:#000}` |
| Bordo | `1px solid #202020` | `.hero-video-frame` |
| Larghezza reale | fino a `~560px` desktop, `480px` max su `<980px` | `.hero-video` |

**Safe area**: margine interno del **7%** su ogni lato (90px su 1280). Niente di leggibile
tocca il bordo: su mobile il riquadro scende a 480px di larghezza e un tratto da 1.5px
diventa sub-pixel.

**Leggibilità minima**: nessun testo sotto i `14px` @1280 (≈ 5px sul riquadro mobile
più piccolo). In pratica: **una sola etichetta mono per animazione**, più il readout.

---

## 2. Palette in movimento (sottoinsieme vincolato)

Il fondo è nero, non bianco: la palette light del sito va **invertita**, non copiata.

| Ruolo nell'animazione | Valore | Nota |
|---|---|---|
| Fondo palco | `#000000` | mai `#0A0A0A`, mai gradiente |
| Tratto neutro / stato "prima" | `#5A5A5A` | il problema è grigio, mai rosso |
| Tratto attivo / stato "dopo" | `#01497C` → su nero usa **`#2E8FC0`** | il blu istituzionale a 1.5px su nero non regge il contrasto: schiarisci solo qui |
| Superficie tenue | `rgba(46,143,192,.12)` | fill di riempimento, sostituisce `--primario-light` |
| Testo / readout | `#FFFFFF` primario, `#8A8A8A` etichette | come `.hero-video-caption` |
| Linea di griglia | `#202020` | stessa del bordo frame |

**Un solo accento.** Nessun secondo colore, nessun rosso di errore, nessun verde di successo:
il passaggio problema → esito si racconta con **grigio → blu**, non con semaforo. È la stessa
regola che ha eliminato l'arancione dal sistema statico.

---

## 3. Grammatica del segno

Le animazioni **non** introducono un linguaggio grafico nuovo: animano quello che esiste già.

- **Sorgente**: i glifi inline `viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"` che stanno in `index.html`, uno per servizio (accordion `.sr-icon`). Sono la base di partenza di ogni animazione.
- **Scala sul palco**: il glifo 40×40 viene portato a **320×320** al centro del canvas → lo stroke va riscalato a `12` per mantenere il peso ottico originale (`1.5 × 8`). Elementi secondari: `8`.
- **Terminazioni**: `stroke-linecap="round"`, `stroke-linejoin="round"`.
- **Riempimenti**: solo i pallini pieni già presenti nei glifi (`fill="currentColor"`, es. i tre punti del chatbot). Nessun altro fill opaco.
- **Due linguaggi d'angolo, come nel sito**: ciò che si preme è pillola (`999px`), ciò che si legge è squadrato (`0`). Non mescolarli nello stesso elemento.
- **Numeri**: JetBrains Mono 500, `letter-spacing: .08em`, maiuscolo per le etichette. Ogni cifra che rappresenta un fatto misurato è mono, come `.r-num` e `.rs-num`.

---

## 4. Tempo

### 4.1 Unità

L'unità atomica del sito è **150ms** (il press dei bottoni). Tutta la scala temporale ne è multiplo:

| Token | Valore | Uso |
|---|---|---|
| `--m-tick` | `150ms` | micro-scatto, accensione di un punto, avanzamento di una cifra |
| `--m-step` | `300ms` | morph di un elemento (già usato da accordion e `max-height`) |
| `--m-beat` | `600ms` | entrata/uscita di un elemento in scena (già usato da `.reveal`) |
| `--m-hold` | `900ms` | pausa di lettura su uno stato compiuto |
| `--m-stagger` | `60ms` | ritardo tra elementi in sequenza (già usato da `.stagger`) |
| `--m-cycle` | `7200ms` | durata totale di un ciclo (12 × `--m-beat`) |

### 4.2 Curve

Ereditate senza modifiche da `:root`:

- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` — **entrate, uscite, trasformazioni.** È la curva di default: parte decisa, si posa.
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` — **morph di qualcosa già a schermo**: una forma che diventa un'altra, un contenitore che cambia altezza.
- `linear` — **solo** per rotazioni continue (l'ingranaggio dell'automazione) e per il riempimento di una barra di progresso.

Nessun `ease-in` puro, nessuna curva elastica, **nessun overshoot**: il sistema statico frena a `scale(.97)` e si ferma lì.

### 4.3 Struttura standard di un ciclo

Ogni animazione è un loop di **7,2 secondi** in tre battute più una tenuta:

| Fase | Finestra | Cosa succede |
|---|---|---|
| **A · Il problema** | `0 → 1800ms` | Lo stato attuale descritto dall'h2 della pagina. Tratto grigio. Qualcosa non funziona, e si vede. |
| **B · L'intervento** | `1800 → 4200ms` | Il servizio entra in scena. Il grigio diventa blu, un elemento per volta, stagger `60ms`. |
| **C · L'esito** | `4200 → 6000ms` | Il readout mono sale al valore finale. Un solo numero. |
| **Tenuta** | `6000 → 7200ms` | Fermo immagine sull'esito: è il fotogramma che resta impresso. |
| Ritorno | ultimi `300ms` | Dissolvenza incrociata verso A. Mai un taglio secco, mai un riavvolgimento visibile. |

Il loop deve essere **impercettibile**: l'ultimo fotogramma e il primo condividono composizione e opacità.

### 4.4 Divieti

- Niente parallasse, niente zoom continuo del canvas, niente camera che si muove da sola.
- Niente glow, bloom, ombre ambientali: nel sistema statico l'ombra esiste solo come risposta a un'interazione, e qui non c'è interazione.
- Niente più di **due elementi in movimento contemporaneamente**. La sequenza è un ragionamento, non un traffico.
- Niente audio.

**Unica deroga registrata — il campo shader delle hero.** `js/hero-shader.js`
disegna dietro le hero delle undici pagine servizio e dietro l'hero della home un campo
che deriva da solo: cioè esattamente ciò che il primo divieto qui sopra vieta. È una
decisione presa, non una deriva, e vale **solo** per quel file e solo per quelle dodici
hero, a tre condizioni non negoziabili: deriva sotto la soglia di percezione
(`TIME_SCALE` 0.10), nessuna reattività al cursore, fotogramma unico con
`prefers-reduced-motion`. Per ogni altra animazione prodotta secondo questo documento i
divieti restano interi. Vedi DESIGN.md → Components → Hero Shader Field.

---

## 5. Reduced motion e implementazione

`prefers-reduced-motion: reduce` è già gestito globalmente in `style.css` azzerando ogni durata.
Le animazioni hero devono comportarsi di conseguenza:

- Ogni animazione ha un **poster frame**: il fotogramma della fase C (l'esito, readout al valore finale). È anche il `poster` del video e l'immagine di fallback.
- In reduced motion si mostra il poster statico, non un loop rallentato.

**Formato consigliato**: SVG inline animato con CSS (`@keyframes` + `animation-delay`), non video.
Pesa meno di un MP4, resta nitido a ogni densità, eredita i token del sito e si spegne da solo
sotto la media query già presente. Video `.mp4`/`.webm` (muted, loop, playsinline, `poster`)
solo se l'animazione richiede sfumature che l'SVG non regge.

Sostituzione nel markup — resta dentro il frame esistente, non si tocca la struttura:

```html
<div class="hero-video-frame">
  <!-- al posto di .hero-video-play + .hero-video-caption -->
  <svg class="hero-anim" viewBox="0 0 1280 720" role="img"
       aria-label="Animazione: [descrizione dell'esito in una frase]">…</svg>
</div>
```

`aria-label` descrive **l'esito, non il movimento**: "Le prenotazioni passano dal telefono al
calendario", non "Un telefono che ruota".

---

## 6. Le 11 animazioni

Ogni scheda è autosufficiente: glifo di partenza, concetto ancorato al copy della pagina,
tre battute, readout. Le finestre temporali seguono §4.3.

---

### 01 · Web Design — `servizi/web-design.html`
> *"Il sito c'è da anni. Il problema è cosa succede nei primi tre secondi che qualcuno lo apre da telefono."*

**Glifo**: finestra browser (rect 32×26, barra superiore, due pallini, due righe).
**Concetto**: i tre secondi che decidono tutto, visti come un conto alla rovescia.

- **A** — La finestra è grigia e vuota. In alto a destra un readout mono parte da `0:03` e scende a `0:01`, un tick ogni `--m-tick` × 4. Le righe di contenuto non compaiono in tempo.
- **B** — Riavvolgimento: la finestra si ricompone da sotto, elemento per elemento con stagger `60ms` (barra → titolo → due righe → bottone pillola). Ogni elemento che atterra passa da `#5A5A5A` a `#2E8FC0`.
- **C** — Il bottone pillola si accende pieno; il readout si ferma su `0:00,8`.

**Readout**: `0:00,8` · etichetta `PRIMO CONTATTO`.

---

### 02 · Web App — `servizi/web-app.html`
> *"L'Excel condiviso ha smesso di reggere i volumi."*

**Glifo**: finestra applicativa (barra + blocco laterale + due righe).
**Concetto**: quattro fogli sparsi che diventano una schermata sola.

- **A** — Quattro rettangoli grigi disallineati, leggermente ruotati (±3°), che si sovrappongono. Uno sfarfalla (`opacity .4 → 1`, due tick): è il conflitto di modifica.
- **B** — I quattro si raddrizzano e scivolano l'uno nell'altro (`--ease-in-out`, `--m-step` × 2, stagger `60ms`) fino a formare l'unica finestra del glifo. Il blocco laterale si accende per ultimo.
- **C** — Dentro la finestra, tre righe si spuntano dall'alto al basso, un tick l'una.

**Readout**: `1 SCHERMATA` · etichetta `AL POSTO DI 4 FILE`.

---

### 03 · Ottimizzazione Sito — `servizi/ottimizzazione-sito.html`
> *"Il sito è bello. Su una connessione mobile, però, ci mette sei secondi."*

**Glifo**: tachimetro (cerchio, arco, ago, tacca).
**Concetto**: l'ago che torna indietro.

- **A** — Ago fermo in zona alta, grigio. Sotto, una barra di caricamento avanza `linear` e si blocca al 40%.
- **B** — Tre pesi etichettati mono (`IMG`, `PLUGIN`, `HOST`) si staccano dall'ago e escono dal quadro verso il basso, uno ogni `--m-beat` × 0,5. A ogni distacco l'ago scatta indietro di un terzo (`--ease-out`).
- **C** — L'arco si riempie di blu da sinistra; il readout scende da `6,0s` a `1,2s` per interpolazione mono a passo `--m-tick`.

**Readout**: `1,2s` · etichetta `CARICAMENTO MOBILE`.

---

### 04 · Social Media Marketing — `servizi/social-media-marketing.html`
> *"Il profilo è aperto dal 2021. L'ultimo post è di marzo."*

**Glifo**: tre nodi collegati (un cerchio grande, due piccoli, due linee).
**Concetto**: il calendario che smette di avere buchi.

- **A** — Griglia 4×3 di quadratini (le settimane): i primi tre pieni di blu, gli altri nove vuoti e grigi. Il nodo centrale pulsa una volta e si spegne.
- **B** — I quadratini si riempiono in sequenza, uno ogni `--m-stagger` × 2, con ritmo regolare. Al riempirsi della griglia i tre nodi del glifo emergono sopra di essa e le due linee si tracciano (`stroke-dashoffset`, `--m-beat`).
- **C** — Un quarto nodo entra dall'esterno e si aggancia: è il contatto generato.

**Readout**: `12–20 / MESE` · etichetta `PUBBLICAZIONI PIANIFICATE`.

---

### 05 · Campagne Ads — `servizi/campagne-ads.html`
> *"«Abbiamo provato con Facebook, per il nostro settore non funziona»"*

**Glifo**: bersaglio con freccia (due cerchi concentrici, punto, asta, punta).
**Concetto**: il bersaglio che si stringe.

- **A** — Bersaglio molto largo, grigio, che occupa quasi tutta la safe area. Tre frecce lo attraversano in diagonale e escono dal quadro senza toccarlo (`--m-beat` l'una, stagger `60ms`).
- **B** — I cerchi si contraggono verso il centro (`--ease-in-out`, `--m-step` × 3) fino alle dimensioni del glifo. Mentre si stringono passano al blu, dall'esterno verso l'interno.
- **C** — Una quarta freccia entra e centra il punto; un anello sottile si espande una volta sola dal centro e svanisce (nessuna ripetizione: non è un glow).

**Readout**: `−41%` · etichetta `COSTO PER CONTATTO`.

---

### 06 · Ottimizzazione SEO — `servizi/seo.html`
> *"Il sito esiste. Su Google, per le ricerche che portano clienti, spesso no."*

**Glifo**: lente d'ingrandimento con spezzata crescente.
**Concetto**: la riga che risale la lista.

- **A** — Nove righe orizzontali impilate, tutte grigie. La terza dal basso è leggermente più marcata: è il tuo sito. Numerazione mono a sinistra, `01`…`09`.
- **B** — La riga marcata risale di posizione, uno scatto ogni `--m-tick` × 2 (`--ease-out`), spingendo le altre verso il basso. Man mano che sale diventa blu. La lente la segue senza anticiparla.
- **C** — Si ferma in terza posizione; le due righe sopra restano grigie (non promettiamo il primo posto).

**Readout**: `#09 → #03` · etichetta `POSIZIONE MEDIA`.

---

### 07 · Video Promozionali con AI — `servizi/video-ai.html`
> *"Tre settimane per un video che serviva la settimana scorsa."*

**Glifo**: rettangolo video con play e scintilla.
**Concetto**: un fotogramma che si moltiplica nei formati.

- **A** — Un rettangolo 16:9 grigio al centro. Un calendario mono a destra avanza `21 GIORNI` a scatti rapidi: il tempo passa e il quadro resta vuoto.
- **B** — Il contatore si azzera a `4 GIORNI`. Il rettangolo si sdoppia in tre: 16:9 al centro, 1:1 e 9:16 che scivolano ai lati (`--ease-out`, stagger `60ms`), ognuno con il proprio bordo blu.
- **C** — I tre formati si accendono in sequenza, un tick l'uno; la scintilla del glifo compare in alto a destra, una volta sola.

**Readout**: `3 FORMATI · 4 GIORNI` · etichetta `DALLA CONSEGNA`.

---

### 08 · Email Marketing — `servizi/email-marketing.html`
> *"Duemila indirizzi raccolti in cinque anni, mai usati una volta."*

**Glifo**: busta con freccia in uscita.
**Concetto**: la lista ferma che si divide e riparte.

- **A** — Una pila fitta di righe grigie identiche (gli indirizzi), leggermente disallineate. Sopra, un velo di polvere: `opacity .5`. Nessun movimento per un intero `--m-hold`, ed è il punto.
- **B** — La pila si separa in tre gruppi orizzontali (`--ease-in-out`, `--m-step` × 2). Ogni gruppo prende un'etichetta mono breve. Il secondo gruppo si accende di blu.
- **C** — Dal gruppo acceso parte una busta che si apre a metà strada; la freccia del glifo la accompagna fuori quadro.

**Readout**: `2.000 → 3 SEGMENTI` · etichetta `LISTA RIATTIVATA`.

---

### 09 · Automazione E-Mail — `servizi/automazione-email.html`
> *"Il modulo compilato alle 21 resta lì fino alle 9 del mattino."*

**Glifo**: busta affiancata a un ingranaggio.
**Concetto**: le dodici ore che diventano trenta secondi.

- **A** — Orologio mono `21:04`. Una busta entra e si ferma. Le cifre avanzano veloci fino a `09:00` mentre la busta resta immobile e grigia: dodici ore in `--m-beat` × 3.
- **B** — Ritorno a `21:04`. L'ingranaggio del glifo compie **due giri** `linear` e si ferma con precisione (non rallenta, si ferma: è una macchina). Alla fermata la busta si accende.
- **C** — La risposta parte; l'orologio si ferma su `21:04` e sotto compare `+30s`.

**Readout**: `21:04 + 30s` · etichetta `TEMPO DI PRIMA RISPOSTA`.

---

### 10 · Agente Vocale per Chiamate — `servizi/agente-vocale.html`
> *"Il telefono squilla quando la sala è piena e nessuno può alzare la cornetta."*

**Glifo**: cuffia con microfono.
**Concetto**: la linea piatta che torna a essere una voce.

- **A** — Una forma d'onda audio grigia attraversa il quadro. Tre impulsi di squillo la sollevano (`--m-tick` l'uno), poi la linea si appiattisce e resta piatta: chiamata persa. Un contatore mono segna `03` chiamate perse.
- **B** — La cuffia scende dall'alto e si posa sulla linea (`--ease-out`, `--m-beat`). Al contatto l'onda riprende ampiezza da sinistra a destra, blu, come una risposta che scorre.
- **C** — L'onda si condensa in una riga di calendario con un appuntamento confermato; il contatore delle perse torna a `00`.

**Readout**: `24 / 7` · etichetta `NESSUNA CHIAMATA PERSA`.

---

### 11 · Chatbot — `servizi/chatbot.html`
> *"Le stesse tre domande, venti volte al giorno."*

**Glifo**: fumetto con tre punti.
**Concetto**: le domande ripetute che si staccano da quelle che contano.

- **A** — Tre fumetti identici arrivano da sinistra, uno ogni `--m-stagger` × 3, e si accumulano. Poi altri tre, sovrapposti ai primi: la ripetizione si vede come impilamento.
- **B** — Dai fumetti impilati parte una risposta immediata, blu, un tick dopo ciascuno. La pila si svuota da sotto.
- **C** — Resta un solo fumetto, diverso dagli altri (bordo più marcato): scivola verso destra e passa a una sagoma umana. I tre punti del glifo si accendono in sequenza.

**Readout**: `< 1 MIN` · etichetta `PRIMA RISPOSTA, SEMPRE`.

---

## 7. Prompt di partenza per Claude Design

Da incollare, sostituendo il blocco tra parentesi con la scheda del servizio scelto:

```
Genera un'animazione SVG in loop per l'hero di una pagina servizio.

PALCO: 1280×720 (16:9), fondo #000000, raggio 16px, safe area 7% per lato.
TRATTO: linee, nessun fill opaco. Stroke 12 per il segno principale, 8 per i
secondari, linecap e linejoin round.
COLORI: grigio #5A5A5A per lo stato "prima", blu #2E8FC0 per lo stato "dopo",
bianco #FFFFFF per il readout, #8A8A8A per le etichette, #202020 per le griglie.
Un solo accento: nessun rosso, nessun verde, nessun gradiente.
TIPO: JetBrains Mono 500, letter-spacing .08em, maiuscolo per le etichette.
Nessun testo sotto i 14px.
CURVE: entrate e trasformazioni cubic-bezier(0.23,1,0.32,1); morph di elementi
già a schermo cubic-bezier(0.77,0,0.175,1); linear solo per rotazioni continue.
Nessun overshoot, nessun rimbalzo, nessun glow, nessuna ombra.
TEMPO: ciclo di 7200ms in loop impercettibile — problema 0→1800ms,
intervento 1800→4200ms, esito 4200→6000ms, tenuta 6000→7200ms, dissolvenza
negli ultimi 300ms. Massimo due elementi in movimento insieme.
ACCESSIBILITÀ: includi @media (prefers-reduced-motion: reduce) che congela
l'animazione sul fotogramma della fase C.

[QUI LA SCHEDA DEL SERVIZIO: glifo, concetto, battute A/B/C, readout]
```

## 8. Checklist prima della consegna

- [ ] Il loop non ha uno scatto visibile al ritorno.
- [ ] A `480px` di larghezza il readout è ancora leggibile e nessun tratto sparisce.
- [ ] Solo grigio e blu: nessun terzo colore è entrato di soppiatto.
- [ ] Mai più di due elementi in movimento nello stesso istante.
- [ ] Il fotogramma di fase C funziona da immagine statica: si capisce senza aver visto il resto.
- [ ] `prefers-reduced-motion` mostra quel fotogramma, non un loop lento.
- [ ] L'`aria-label` descrive l'esito, non il movimento.
- [ ] L'animazione dice la stessa cosa dell'h2 della sua pagina. Se sono intercambiabili tra due servizi, una delle due è sbagliata.
