# design-sync — note per le prossime esecuzioni

- **Questo repo è fuori dall'inviluppo del converter.** Nessun `package.json`, nessuna
  `dist/`, nessuno Storybook, nessun componente React: è un sito statico scritto a mano
  (14 file HTML + `css/style.css` + `js/main.js` vanilla). `package-build.mjs` non è
  applicabile e non è stato eseguito.
- **Ambito scelto dall'utente (2026-08-27): solo token, stile e guide.** Nessun
  `_ds_bundle.js`, quindi nessun componente nel picker di Claude Design. L'alternativa
  scartata era scrivere da zero una libreria React che avvolgesse le classi esistenti:
  sarebbe stato codice nuovo da mantenere allineato al CSS a mano.
- **`_ds_sync.json` è volutamente omesso.** La ricetta degli hash del converter presume la
  forma "package"; senza componenti da verificare non c'è nulla per cui fare da àncora.
  Conseguenza: ogni sync futuro ricarica tutto, ed è corretto così.
- **Il layout si rigenera a mano**, non da script:
  `tokens/tokens.css` = righe 8–81 di `css/style.css` (il blocco `:root`);
  `_ds_bundle.css` = copia integrale di `css/style.css`;
  `guidelines/glyphs.md` = gli 11 SVG `.sr-icon` estratti da `index.html`.
  Se il blocco `:root` cambia posizione, l'estrazione per numero di riga va rifatta.
- **`css/style.css` non ha dipendenze esterne**: le due `url()` sono data URI inline,
  nessun `@font-face`, nessun `@import`. I font sono aggiunti da `styles.css`.
- Se un giorno il sito adotta un build system con componenti veri, questa cartella va
  buttata e si riparte dal converter standard.
