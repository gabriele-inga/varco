# Chatbot AI — Varco

Assistente flottante presente su 22 delle 23 pagine del sito — escluso
`servizi/agente-vocale.html`, dove l'angolo in basso a destra appartiene al
widget vocale Retell. Apre la conversazione con *"Descrivi un problema che sta rallentando la tua attività,
oppure scegline uno qui sotto"* e sei problemi cliccabili, scritti come li
direbbe un titolare; l'assistente li collega al servizio giusto e, dopo 3-4
scambi, propone l'audit gratuito.

## File

| File | Cosa fa |
|---|---|
| `js/chat.js` | Il widget (vanilla JS, ~7 KB). Nessuna chiave al suo interno. |
| `css/style.css` | Stili del widget, in coda al foglio (sezione "Chatbot"). |
| `api/chat.php` | Proxy server-side: aggiunge chiave, system prompt e limiti. |
| `api/config.example.php` | Modello di configurazione da copiare. |
| `api/.htaccess` | Blocca l'accesso diretto a `config.php` dal browser. |

La chiave API **non è mai nel browser**. Il widget chiama solo
`api/chat.php` sullo stesso dominio; è il PHP a parlare con il provider.
Mettere la chiave direttamente nel JavaScript la renderebbe leggibile da
chiunque apra "visualizza sorgente", e in poche ore verrebbe usata da altri.

## Attivazione (5 minuti)

1. **Chiave gratuita Groq** — crea un account su
   <https://console.groq.com> e genera una key da
   <https://console.groq.com/keys>. Inizia con `gsk_`.
   Il free tier di Groq non richiede carta di credito e con i volumi di un sito
   vetrina è ampiamente sufficiente.
2. **Configura** — copia `api/config.example.php` in `api/config.php` e
   incolla la chiave nel campo `api_key`. La chiave va **solo** in
   `config.php`, mai in `config.example.php`, che è il file destinato a essere
   condiviso.
3. **Carica** — via FTP, la cartella `api/` intera, `js/chat.js`,
   `css/style.css` e tutti gli `.html` aggiornati.
4. **Prova** — apri il sito, clicca "Parliamo del tuo problema", manda un
   messaggio. Se leggi *"Chatbot non configurato"* manca `api/config.php`.

`api/config.php` non va condiviso, mandato via mail o pubblicato su repository.

## Provarlo in locale

Aprire `index.html` con doppio clic **non funziona**: senza un server PHP la
chiamata a `api/chat.php` fallisce con "Failed to fetch". Serve il server PHP
integrato — XAMPP è già installato su questa macchina:

```
C:\xampp\php\php.exe -S localhost:8000 -t C:\Users\gabbo\Desktop\mrig-sito-light-mode
```

Poi apri <http://localhost:8000/index.html>. Verificato: la conversazione
completa gira end-to-end su questa configurazione.

## Requisito di hosting

Serve PHP con cURL: va bene qualsiasi hosting che lo fornisca,
senza aggiungere nulla.

Su un host puramente statico (Netlify, GitHub Pages, Cloudflare Pages) il PHP
non gira. In quel caso l'equivalente è una Cloudflare Worker gratuita
(100.000 richieste al giorno) che ripete la stessa logica di `api/chat.php`;
poi in `js/chat.js` si sostituisce la riga

```js
var ENDPOINT = BASE + "api/chat.php";
```

con l'URL della Worker. Il resto del widget non cambia.

## Cambiare provider

`api/config.php` punta a un endpoint compatibile con l'interfaccia OpenAI, per
cui il cambio è una riga. Alternative gratuite già testate come formato:

- **Groq** (default, in uso) — `openai/gpt-oss-120b`. Sotto il secondo per risposta.
- **OpenRouter** — `https://openrouter.ai/api/v1/chat/completions`, modelli con
  suffisso `:free`. Più lento, ma con una scelta di modelli più ampia.
- **Cerebras** — `https://api.cerebras.ai/v1/chat/completions`.

## Limiti e sicurezza già impostati

- **Rate limit**: 30 messaggi per IP all'ora (`rate_limit_max` /
  `rate_limit_window` in `config.php`). Oltre, il widget invita a scrivere su
  WhatsApp.
- **Costo per richiesta limitato**: al provider vanno al massimo gli ultimi 16
  turni, 1500 caratteri per messaggio, 900 token di risposta. Il client non può
  aumentare questi valori.
- **Nessun HTML dal modello**: la risposta viene inserita come testo, non come
  markup; solo URL, email e numeri `+39` diventano link.
- **Errori**: qualsiasi guasto (provider giù, quota finita, rete) mostra un
  messaggio in italiano con il numero WhatsApp, mai un vicolo cieco.
- Il dettaglio degli errori del provider finisce nei log del server, non nel
  browser.

## Cosa dice e cosa non dice

Il system prompt è in `api/chat.php` (variabile `$system`) e vieta esplicitamente
di inventare **prezzi, tempi, percentuali, garanzie, nomi di clienti o casi
studio**: su costi e tempi la risposta è sempre che si definiscono dopo l'audit.
Se modifichi i servizi offerti, aggiorna l'elenco dentro quel prompt.

I sei problemi del registro d'apertura sono in cima a `js/chat.js`
(costante `PROBLEMS`) e il messaggio di apertura è `OPENER`.

## Da fare prima del go-live

- [x] Chiave inserita in `api/config.php`; conversazione provata end-to-end in locale.
- [ ] Aggiornare la **privacy policy** (`legal/privacy.html`): il widget invia il
      testo scritto dal visitatore a un fornitore terzo (Groq, server USA). Va
      dichiarato, con base giuridica e riferimento al trasferimento extra-UE.
- [ ] Decidere se il widget deve comparire anche sulle pagine legali (oggi sì);
      per escluderne una, togli il tag `<script src=".../js/chat.js">` da quel file,
      come già fatto in `servizi/agente-vocale.html`.
