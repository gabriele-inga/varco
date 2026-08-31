# Prompt video dimostrativo — Chatbot AI

> Destinazione: `assets/video/chatbot.mp4`, palco di `servizi/chatbot.html`.
> Stesso trattamento del video Agente Vocale: fondo bianco, tratto sottile, un solo blu.

---

## PROMPT (da incollare)

Crea un video dimostrativo animato di 60 secondi per il sito di un'agenzia digitale
italiana. Spiega, senza parlare di tecnologia, cosa fa un chatbot AI installato sul sito
e su WhatsApp di una piccola azienda italiana: risponde subito alle domande che tornano
sempre uguali, e passa a una persona vera solo la conversazione che vale un preventivo.

**Formato**
- 1920×1080, 16:9, 30fps, durata 55–60 secondi, senza tagli netti: una scena si trasforma
  nella successiva con movimenti continui degli stessi elementi.
- **Fondo bianco puro #FFFFFF su tutta la superficie, da bordo a bordo.** Nessuna cornice,
  nessun bordo, nessun angolo arrotondato, nessuna ombra sul perimetro, nessuna barra
  nera: il video viene incastonato in una pagina bianca e i suoi margini devono sparire.
- Area di sicurezza del 7% su ogni lato: niente di leggibile la tocca.

**Stile grafico**
- Disegno di linea, tratto uniforme di ~3px a 1080p, terminazioni e giunzioni arrotondate,
  nessun riempimento pieno tranne i pochi pallini indicati.
- Geometria semplice e riconoscibile: fumetti squadrati, rettangoli, cerchi, frecce. Niente
  illustrazioni dettagliate, niente volti, niente mani, niente mockup di telefoni realistici,
  niente 3D, niente gradienti, niente texture.
- Il telefono, quando serve, è un rettangolo con angoli arrotondati e una tacca in alto:
  un simbolo, non un prodotto.

**Colore — solo tre**
- Grigio `#5A5A5A` per tutto ciò che è "prima": le domande accumulate, l'attesa, le linee
  neutre.
- Blu `#01497C` per tutto ciò che è "dopo": la risposta automatica, il percorso che
  funziona, le cifre finali. Il blu compare solo quando qualcosa si risolve.
- Grigio chiaro `#8A8A8A` per le etichette piccole.
- Nessun altro colore. Nessun rosso, nessun verde, nessun accento secondario.

**Tipografia**
- Testi in Inter (o un grottesco geometrico equivalente), peso 400–500, nero `#1A1A1A`.
- I numeri e le etichette maiuscole in JetBrains Mono, spaziatura lettere +8%.
- Massimo una riga di testo alla volta sullo schermo. Frasi corte, in italiano.

**Movimento**
- Curva unica `cubic-bezier(0.23, 1, 0.32, 1)` per le entrate, `cubic-bezier(0.77, 0, 0.175, 1)`
  per le trasformazioni. Niente rimbalzi, niente elastico, niente rotazioni gratuite.
- Elementi che entrano: 20px dal basso più dissolvenza, 600ms. Elementi in serie: ritardo
  di 60ms l'uno dall'altro.
- La camera non si muove mai: nessuno zoom, nessun pan, nessun tilt. Si muovono solo gli
  oggetti disegnati.

---

## Sceneggiatura, 6 scene

**Scena 1 — 0:00-0:09 · Le stesse tre domande**
Fondo bianco. Da sinistra entrano tre fumetti grigi identici, uno ogni 200ms, e si
dispongono in colonna. Poi ne entrano altri tre sovrapposti ai primi, poi altri tre: la
pila cresce e si vede che sono sempre le stesse. Dentro i primi tre, in piccolo:
"A che ora aprite?", "Quanto costa?", "Lo fate anche voi?".
Testo in basso: **"Le stesse tre domande, venti volte al giorno."**

**Scena 2 — 0:09-0:19 · Il tempo che portano via**
La pila di fumetti scivola a sinistra. A destra compare una figura schematica al lavoro
(un rettangolo-banco, un tratto verticale per la persona) che si gira verso la pila ogni
volta che un fumetto arriva. Sopra la figura, un contatore mono grigio sale: `00:03`,
`00:11`, `00:26`… fino a `01:40`.
Testo: **"Rispondere a mano toglie tempo a chi ha una richiesta seria."**

**Scena 3 — 0:19-0:29 · Le dieci di sera**
Le luci del banco si spengono: la figura e il rettangolo passano a un grigio più tenue.
Un fumetto nuovo arriva comunque, e resta sospeso a mezz'aria senza risposta. Accanto, un
orologio essenziale segna le 22:10. Dopo un'attesa di due secondi il fumetto si sposta di
lato, verso un secondo rettangolo grigio identico al primo, etichettato `CONCORRENTE`.
Testo: **"Chi non riceve risposta in pochi minuti scrive a un altro."**

**Scena 4 — 0:29-0:41 · Il chatbot entra**
Al centro compare in blu un fumetto con tre punti, disegnato con lo stesso tratto ma con
il bordo più marcato. I tre punti si accendono in sequenza. La pila grigia di fumetti
ricomincia ad arrivare e, un tick dopo ciascuno, parte una risposta blu immediata: la pila
si svuota da sotto verso l'alto. Il contatore mono, ora blu, scende e si ferma su `< 1 MIN`.
In alto, tre etichette mono grigio chiaro appaiono in serie: `SITO`, `WHATSAPP`, `MESSENGER`.
Testo: **"Risponde subito, sul canale dove la domanda è arrivata."**

**Scena 5 — 0:41-0:51 · La conversazione che conta**
Resta un solo fumetto, diverso dagli altri: bordo blu più spesso, dentro una riga più
lunga. Le risposte automatiche si allontanano sullo sfondo. Questo fumetto scivola verso
destra lungo una linea blu continua e arriva a una sagoma umana schematica, che si accende
in blu quando lo riceve. Sopra la linea, tre spunte mono compaiono in serie: `SETTORE`,
`BUDGET`, `TEMPI`.
Testo: **"Quando la richiesta vale davvero, passa a una persona."**

**Scena 6 — 0:51-1:00 · Chiusura**
Tutti gli elementi escono verso il basso tranne il fumetto blu con i tre punti, che si
sposta al centro e si rimpicciolisce. Sotto, in due righe:
riga mono blu **`< 1 MIN`**, sotto etichetta mono grigio chiara **`PRIMA RISPOSTA, SEMPRE`**.
Un secondo di stacco, poi compare la sola parola **Varco** in nero, allineata al centro,
e il fotogramma resta fermo per l'ultimo secondo.
L'ultimo fotogramma è bianco con il solo fumetto blu e la scritta: è anche il poster del
video.

---

## Audio

Voce narrante maschile italiana, tono normale da conversazione, nessuna enfasi
pubblicitaria, ritmo lento. Legge esattamente le sei frasi in grassetto, una per scena,
lasciando due secondi di silenzio tra una e l'altra. Nessuna musica con melodia: solo un
tappeto sottilissimo e un piccolo tick sordo quando un fumetto si posa. Volume del tappeto
almeno 18 dB sotto la voce.

## Da evitare

Persone reali o fotografie, loghi di WhatsApp o Meta riconoscibili, emoji, interfacce di
chat realistiche in stile screenshot, robot o volti AI, cervelli, circuiti, nodi luminosi,
particelle, effetti glitch, testo inglese, più di una frase alla volta, qualsiasi bordo o
cornice attorno all'inquadratura.
