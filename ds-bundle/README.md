## Come si costruisce con questo sistema

Varco non è una libreria di componenti: è **HTML semantico più un unico foglio di stile
globale**. Non ci sono componenti React da importare, nessun provider, nessun tema da
inizializzare. Si compone con gli elementi nativi e le classi elencate qui sotto.

### Struttura di pagina obbligatoria

Il `body` è nero (`background:#000`): è il palco. La pagina bianca è il `<main>`, che ha
`background: var(--bg)` e angoli inferiori arrotondati a 40px. Il nero si vede solo alle
giunture, sotto il main e nel footer.

```html
<body>
  <header class="site-header">…</header>
  <main id="main">
    <section class="section">
      <div class="container">…</div>
    </section>
  </main>
  <footer class="site-footer">…</footer>
</body>
```

**Contenuto messo direttamente nel `body`, fuori dal `<main>`, appare su fondo nero.**
È l'errore più facile da fare qui.

### Vocabolario di classi

| Famiglia | Classi reali |
|---|---|
| Impaginazione | `.container` (max 1180px), `.section` (100px verticali), `.section-tight` (64px), `.section-head`, `.two-col`, `.col-narrow` |
| Testo | `.eyebrow` (etichetta maiuscola sopra un h2), `.lede` (paragrafo introduttivo), `.italic` (parola in corsivo dentro un titolo), `.meta-mono` |
| Azioni | `.btn` + una tra `.btn-primary`, `.btn-ghost`, `.btn-whatsapp`, `.btn-roadmap`; `.btn-arrow` aggiunge la freccia; `.cta-row` per allinearle, `.cta-band` per la fascia finale |
| Etichette | `.tag` e `.tech-pill` (pillole), `.badge` (settore), `.client-mark` |
| Contenitori | `.case-card` + `.cc-top`/`.cc-result`/`.cs-btn`, `.value-card` + `.values-grid`, `.team-card` + `.team-grid`, `.problem-item` + `.problem-list` |
| Sequenze | `.process-list` + `.process-item` con `.p-num`, `.route-step` con `.rs-num` |
| Moduli | `.form-grid`, `.field`, `.field-consent`, `.form-status`, `.select` e la sua famiglia `.select-*` |
| Entrata in scena | `.reveal` (parte a `opacity:0`, `translateY(20px)`; un IntersectionObserver aggiunge `.in`), `.stagger` sul contenitore per ritardare i figli di 60ms l'uno |

Non inventare nomi di classe: se una cosa non è in questa tabella, si costruisce con i
token, non con una classe nuova.

### Token

Tutto passa da `var(--*)`, mai valori letterali. Superfici `--bg`, `--bg-alt`, `--surface`.
Testo `--ink`, `--bone-dim`, `--muted`. Bordi `--line`, `--line-strong`. Un solo accento
cromatico: `--traccia` (#01497C) con `--traccia-hov` e il fondo tenue `--primario-light`;
**non esiste un secondo colore di brand**, e qualsiasi file che ne usi uno è regredito.
Tipografia per ruolo: `--fs-body`, `--fs-lede`, `--fs-h1`, `--fs-h2`, `--fs-title`,
`--fs-label`. Forme: `--radius` (32px, pillole) e `--radius-lg` (16px, contenitori).
Famiglie: `--font-body` (Inter) e `--font-mono` (JetBrains Mono).

**Regola dei due linguaggi d'angolo**: ciò che si preme è pillola, ciò che si legge è
squadrato. Non si mescolano sullo stesso elemento.

**Regola del mono**: ogni numero che è un fatto misurato — un risultato, un indice di
processo, un passo di roadmap — va in `--font-mono`. La prosa resta Inter.

### Dove sta la verità

- `styles.css` e la sua chiusura `@import` (`tokens/tokens.css`, `_ds_bundle.css`): leggere il CSS reale prima di stilare qualsiasi cosa.
- `guidelines/design-system.md` — regole complete, con Do's and Don'ts.
- `guidelines/motion-system-it.md` — curve, durate e le schede delle animazioni hero.
- `guidelines/glyphs.md` — gli 11 glifi di linea 40×40, base obbligata delle animazioni.

### Esempio idiomatico

```html
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <div class="eyebrow">Il metodo</div>
      <h2>Come si arriva a un sito che lavora</h2>
      <p class="lede">Quattro passaggi, sempre nello stesso ordine.</p>
    </div>
    <div class="cta-row">
      <a href="/contatti.html" class="btn btn-primary btn-arrow">Prenota audit gratuito</a>
      <a href="#faq" class="btn btn-ghost">Domande frequenti</a>
    </div>
  </div>
</section>
```

---

## Contenuto di questo progetto

Sincronizzato da un sito statico scritto a mano: non esiste un pacchetto npm né una
build, quindi **non ci sono componenti compilati** in questo progetto. Il foglio di
stile è l'artefatto reale spedito in produzione, copiato senza modifiche.

| File | Cos'è |
|---|---|
| `styles.css` | Punto di ingresso. I design ricevono solo la sua chiusura `@import`. |
| `tokens/tokens.css` | Il blocco `:root` del sito: colori, scala tipografica, forme, curve, ombre. |
| `_ds_bundle.css` | Copia fedele di `css/style.css` (1219 righe), lo stile di tutti i componenti. |
| `guidelines/design-system.md` | Il sistema completo: colori, tipografia, layout, profondità, forme, Do's and Don'ts. |
| `guidelines/design-system-reference-it.md` | Riferimento operativo in italiano, per token. |
| `guidelines/motion-system-it.md` | Sistema di movimento: curve, scala temporale, e le 11 schede delle animazioni hero. |
| `guidelines/glyphs.md` | Gli 11 glifi di linea 40×40, uno per servizio. |

I font (Inter, JetBrains Mono) arrivano da Google Fonts via `@import` in `styles.css`.
