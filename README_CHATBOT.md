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
| `api/chat.js` | Proxy server-side per **Vercel** (funzione serverless Node): aggiunge chiave, system prompt e limiti. In uso in produzione. |
| `hosting-php/chat.php` | Stessa logica per hosting **PHP tradizionale** (Apache/cPanel). Vive fuori da `api/` perché Vercel rifiuta il deploy se due file nella stessa cartella hanno lo stesso nome-base con estensioni diverse (`chat.js` e `chat.php` collidevano entrambi su `/api/chat`). Non usato su Vercel. |
| `hosting-php/config.example.php` | Modello di configurazione per la variante PHP. |
| `hosting-php/config.php` | Chiave per la variante PHP, solo uso locale/hosting tradizionale. Mai committato (è in `.gitignore`). |
| `hosting-php/.htaccess` | Blocca l'accesso diretto a `config.php` dal browser (variante PHP). |

La chiave API **non è mai nel browser**. Il widget chiama solo `api/chat`
sullo stesso dominio; è la funzione serverless (o il PHP, su hosting
tradizionale) a parlare con il provider. Mettere la chiave direttamente nel
JavaScript la renderebbe leggibile da chiunque apra "visualizza sorgente", e
in poche ore verrebbe usata da altri.

## Attivazione su Vercel (in uso)

1. **Chiave gratuita Groq** — crea un account su
   <https://console.groq.com> e genera una key da
   <https://console.groq.com/keys>. Inizia con `gsk_`.
   Il free tier di Groq non richiede carta di credito e con i volumi di un sito
   vetrina è ampiamente sufficiente.
2. **Configura** — su Vercel: Project → Settings → Environment Variables,
   aggiungi `VARCO_API_KEY` con il valore della chiave, per l'ambiente
   Production (e Preview se vuoi testare i deploy di anteprima). La chiave
   **non va mai** in un file committato.
3. **Deploy** — push su GitHub (o `vercel --prod`); Vercel rileva
   automaticamente `api/chat.js` come funzione serverless.
4. **Prova** — apri il sito online, clicca "Parliamo del tuo problema", manda
   un messaggio. Se leggi *"Chatbot non configurato"* manca la variabile
   d'ambiente `VARCO_API_KEY` (o non hai rifatto il deploy dopo averla
   impostata — su Vercel serve un nuovo deploy perché la variabile venga
   letta).

## Attivazione su hosting PHP tradizionale (Apache/cPanel)

Serve solo se un giorno il sito lasciasse Vercel per un hosting PHP classico;
per il deploy attuale su Vercel usa la sezione sopra.

1. Stessa chiave Groq del punto sopra.
2. Copia `hosting-php/config.example.php` in `hosting-php/config.php` e
   incolla la chiave nel campo `api_key`. La chiave va **solo** in
   `config.php`, mai in `config.example.php`, che è il file destinato a
   essere condiviso.
3. Sposta il contenuto di `hosting-php/` dentro `api/` sul server di
   destinazione (su Vercel devono restare separati, altrove no), insieme a
   `js/chat.js` e `css/style.css` aggiornati. In `js/chat.js` riporta
   `ENDPOINT` a `BASE + "api/chat.php"`.
4. Prova come sopra. Se leggi *"Chatbot non configurato"* manca
   `config.php`.

`hosting-php/config.php` non va condiviso, mandato via mail o pubblicato su repository.

## Provarlo in locale (variante PHP)

Aprire `index.html` con doppio clic **non funziona**: senza un server PHP la
chiamata a `api/chat.php` fallisce con "Failed to fetch". Serve il server PHP
integrato — XAMPP è già installato su questa macchina:

```
C:\xampp\php\php.exe -S localhost:8000 -t C:\Users\gabbo\Desktop\mrig-sito-light-mode
```

Poi apri <http://localhost:8000/index.html>. Ricorda che in locale con questo
metodo serve la variante PHP (`hosting-php/chat.php` copiato in `api/`,
vedi sopra), non la funzione serverless usata su Vercel.

## Requisito di hosting

Su Vercel: nessun requisito aggiuntivo, `api/chat.js` gira come funzione
serverless Node di default.

Sull'alternativa PHP tradizionale serve PHP con cURL: va bene qualsiasi
hosting che lo fornisca, senza aggiungere nulla.

Su un host puramente statico senza funzioni serverless né PHP (GitHub Pages)
l'equivalente è una Cloudflare Worker gratuita (100.000 richieste al giorno)
che ripete la stessa logica; poi in `js/chat.js` si sostituisce la riga

```js
var ENDPOINT = BASE + "api/chat";
```

con l'URL della Worker. Il resto del widget non cambia.

## Cambiare provider

Su Vercel, l'endpoint/modello si cambiano con le variabili d'ambiente
`VARCO_API_ENDPOINT` e `VARCO_MODEL` (vedi `api/chat.js`); sulla variante PHP
è `hosting-php/config.php`. Alternative gratuite già testate come formato:

- **Groq** (default, in uso) — `openai/gpt-oss-120b`. Sotto il secondo per risposta.
- **OpenRouter** — `https://openrouter.ai/api/v1/chat/completions`, modelli con
  suffisso `:free`. Più lento, ma con una scelta di modelli più ampia.
- **Cerebras** — `https://api.cerebras.ai/v1/chat/completions`.

## Limiti e sicurezza già impostati

- **Rate limit**: 30 messaggi per IP all'ora (`VARCO_RATE_LIMIT_MAX` /
  `VARCO_RATE_LIMIT_WINDOW` su Vercel, `rate_limit_max` / `rate_limit_window`
  su PHP). Oltre, il widget invita a scrivere su WhatsApp.
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

Il system prompt è in `api/chat.js` (Vercel) / `hosting-php/chat.php` (PHP,
variabile `$system`) e vieta esplicitamente
di inventare **prezzi, tempi, percentuali, garanzie, nomi di clienti o casi
studio**: su costi e tempi la risposta è sempre che si definiscono dopo l'audit.
Se modifichi i servizi offerti, aggiorna l'elenco dentro quel prompt.

I sei problemi del registro d'apertura sono in cima a `js/chat.js`
(costante `PROBLEMS`) e il messaggio di apertura è `OPENER`.

## Da fare prima del go-live

- [x] Chiave inserita nella variabile d'ambiente `VARCO_API_KEY` su Vercel; conversazione provata end-to-end.
- [ ] Aggiornare la **privacy policy** (`legal/privacy.html`): il widget invia il
      testo scritto dal visitatore a un fornitore terzo (Groq, server USA). Va
      dichiarato, con base giuridica e riferimento al trasferimento extra-UE.
- [ ] Decidere se il widget deve comparire anche sulle pagine legali (oggi sì);
      per escluderne una, togli il tag `<script src=".../js/chat.js">` da quel file,
      come già fatto in `servizi/agente-vocale.html`.
