<?php
/**
 * MODELLO DI CONFIGURAZIONE — questo file non contiene segreti ed e' l'unico
 * dei due che si puo' condividere o committare.
 *
 * DOVE COPIARLO (in ordine di preferenza):
 *
 *   1. Non copiarlo affatto: imposta la variabile d'ambiente VARCO_API_KEY
 *      dal pannello dell'hosting, oppure con SetEnv nel .htaccess di root.
 *      La chiave non finisce su disco: non c'e' niente da servire per
 *      sbaglio e niente da caricare per sbaglio via FTP.
 *
 *   2. Copialo come  varco-config.php  UN LIVELLO SOPRA la radice del sito
 *      (accanto a public_html/ o httpdocs/, non dentro). Nessuna richiesta
 *      HTTP puo' raggiungerlo, su qualunque server.
 *
 *   3. Copialo come  api/config.php  — la posizione storica. Funziona, ma sta
 *      dentro la web root: la protegge solo api/.htaccess, che vale su Apache
 *      e viene ignorato da Nginx, Netlify e Cloudflare Pages, dove il file
 *      verrebbe servito in chiaro con la chiave dentro.
 */
return array(

  // Chiave API del provider. Su Groq inizia con "gsk_".
  // Lasciala com'e' se usi VARCO_API_KEY.
  'api_key'  => 'INSERISCI-QUI-LA-CHIAVE',

  // Endpoint compatibile OpenAI. Groq di default. Alternative con la stessa
  // interfaccia: OpenRouter, Cerebras.
  'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
  'model'    => 'openai/gpt-oss-120b',

  // Alcuni modelli ragionano prima di rispondere: 'low' tiene la latenza
  // sotto il secondo. Stringa vuota per non inviare il parametro.
  'reasoning_effort' => 'low',

  // Limite anti-abuso: messaggi per IP nella finestra indicata.
  'rate_limit_max'    => 30,
  'rate_limit_window' => 3600,

  // Sale per l'hash dell'IP nei file del rate limit: l'indirizzo non viene
  // mai scritto in chiaro. Cambialo in una stringa casuale tua.
  'rate_limit_salt'   => 'cambia-questa-stringa',

  // Attivalo SOLO se il sito sta davvero dietro Cloudflare o un reverse
  // proxy. Se attivo, il vero IP del visitatore viene letto da
  // CF-Connecting-IP / X-Forwarded-For invece che da REMOTE_ADDR (che
  // altrimenti sarebbe l'IP del proxy, uguale per tutti). Su hosting diretto
  // lascialo false: e' un'intestazione che il client puo' scriversi da solo.
  'trusted_proxy'     => false,

  // Domini autorizzati a chiamare api/chat.php. La stessa origine del sito e'
  // sempre inclusa: questo serve solo se il sito vive su piu' domini.
  'allowed_origins'   => array(),
);
