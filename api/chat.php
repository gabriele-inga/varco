<?php
/**
 * Varco — proxy chatbot.
 *
 * Il browser non parla mai direttamente con il provider AI: la chiave sta qui,
 * lato server, e non finisce mai nel sorgente della pagina. Il client manda solo
 * la conversazione; questo file aggiunge system prompt, chiave e limiti.
 *
 * Requisiti hosting: PHP 5.6+ con cURL (Netlify+funzioni no — vedi
 * README_CHATBOT.md per l'alternativa Cloudflare Worker).
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail($code, $msg) {
  http_response_code($code);
  echo json_encode(array('error' => $msg), JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'Metodo non consentito.');

/* ---- Dove vive la chiave ------------------------------------------------
   In ordine, dalla posizione piu' sicura alla piu' fragile:

   1. Variabile d'ambiente VARCO_API_KEY (SetEnv nel .htaccess, pannello
      dell'hosting, variabile di sistema). La chiave non esiste su disco:
      niente da servire per sbaglio, niente da caricare per sbaglio via FTP.
   2. Un file di configurazione FUORI dalla web root: VARCO_CONFIG, oppure
      varco-config.php un livello sopra la radice del sito. Nessuna richiesta
      HTTP puo' raggiungerlo, su qualunque server.
   3. api/config.php, la posizione storica. Funziona, ma sta dentro la web
      root ed e' protetta solo da api/.htaccess: vale su Apache, viene
      ignorato da Nginx, Netlify, Pages e simili, dove il file verrebbe
      servito in chiaro. Resta supportata per non rompere installazioni
      esistenti, ma non e' quella consigliata. */
$cfg = array();
$cfgCandidates = array();
if (getenv('VARCO_CONFIG')) $cfgCandidates[] = getenv('VARCO_CONFIG');
$cfgCandidates[] = dirname(dirname(__DIR__)) . '/varco-config.php';
$cfgCandidates[] = __DIR__ . '/config.php';
foreach ($cfgCandidates as $cand) {
  if ($cand && is_readable($cand)) {
    $loaded = require $cand;
    if (is_array($loaded)) { $cfg = $loaded; break; }
  }
}

$envKey = getenv('VARCO_API_KEY');
if ($envKey) $cfg['api_key'] = $envKey;

/* Senza file di configurazione il proxy deve comunque sapere dove chiamare. */
if (empty($cfg['endpoint'])) $cfg['endpoint'] = 'https://api.groq.com/openai/v1/chat/completions';
if (empty($cfg['model']))    $cfg['model']    = 'openai/gpt-oss-120b';

if (empty($cfg['api_key']) || strpos($cfg['api_key'], 'INSERISCI') === 0) {
  fail(500, 'Chatbot non configurato: imposta VARCO_API_KEY oppure crea varco-config.php fuori dalla web root.');
}

/* ---- Chi puo' chiamare questo endpoint ----------------------------------
   Senza questo controllo l'endpoint e' un proxy AI gratuito e anonimo: un
   altro sito puo' farci POST dal browser dei suoi visitatori e consumare il
   budget API a nome nostro, restando sotto il limite per IP perche' gli IP
   sono i loro. Il widget chiama sempre api/chat.php sulla stessa origine
   (js/chat.js), quindi la regola e' semplice: stessa origine, o niente.
   'allowed_origins' serve solo se un giorno il sito vivesse su piu' domini. */
$selfHost = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
$allowed  = array();
if (!empty($cfg['allowed_origins']) && is_array($cfg['allowed_origins'])) {
  foreach ($cfg['allowed_origins'] as $o) {
    $h = parse_url($o, PHP_URL_HOST);
    if ($h) $allowed[] = strtolower($h);
  }
}
if ($selfHost !== '') $allowed[] = preg_replace('/:\d+$/', '', $selfHost);

$originHeader = '';
if (!empty($_SERVER['HTTP_ORIGIN']))      $originHeader = $_SERVER['HTTP_ORIGIN'];
elseif (!empty($_SERVER['HTTP_REFERER'])) $originHeader = $_SERVER['HTTP_REFERER'];
$originHost = $originHeader ? strtolower((string)parse_url($originHeader, PHP_URL_HOST)) : '';

/* Un fetch POST dal browser manda sempre Origin; uno script a riga di comando
   no. L'assenza di entrambe le intestazioni e' gia' un segnale, non un caso
   limite da tollerare. */
if ($originHost === '' || !in_array($originHost, $allowed, true)) {
  fail(403, 'Richiesta non consentita.');
}

/* ---- Rate limit per IP, su file. Niente database. ------------------------ */
/* Dietro Cloudflare o un qualsiasi reverse proxy REMOTE_ADDR e' l'IP del
   proxy, uguale per tutti i visitatori: con quello come chiave il limite
   diventa 30 messaggi all'ora per l'INTERO sito invece che per persona, e il
   primo che chiacchiera zittisce tutti gli altri. Ci fidiamo
   dell'intestazione del proxy solo se 'trusted_proxy' e' attivo in
   configurazione: un'intestazione che il client puo' scriversi da solo non e'
   una difesa se la si crede sempre. */
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
if (!empty($cfg['trusted_proxy'])) {
  if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
  } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $ip = trim($parts[0]);
  }
}
if (!filter_var($ip, FILTER_VALIDATE_IP)) $ip = '0.0.0.0';

$window = isset($cfg['rate_limit_window']) ? (int)$cfg['rate_limit_window'] : 3600;
$max    = isset($cfg['rate_limit_max']) ? (int)$cfg['rate_limit_max'] : 30;
$now    = time();

/* L'IP non viene mai scritto in chiaro: il nome del file e' un hash con sale
   e il contenuto sono solo marche temporali. */
$salt   = isset($cfg['rate_limit_salt']) ? (string)$cfg['rate_limit_salt'] : 'varco';
$rlDir  = sys_get_temp_dir();
$rlFile = $rlDir . '/varco_chat_' . md5($salt . '|' . $ip) . '.txt';

$hits = array();
if (is_readable($rlFile)) {
  $raw = explode(',', (string)file_get_contents($rlFile));
  foreach ($raw as $t) { $t = (int)$t; if ($t && $now - $t < $window) $hits[] = $t; }
}
if (count($hits) >= $max) fail(429, 'Troppi messaggi. Riprova tra qualche minuto, oppure scrivici su WhatsApp.');
$hits[] = $now;
@file_put_contents($rlFile, implode(',', $hits), LOCK_EX);

/* La privacy policy promette che il dato usato per l'anti-abuso sparisce
   entro 24 ore. Senza questa raccolta i file restavano nella cartella
   temporanea finche' non ci pensava l'host, cioe' potenzialmente mai: una
   promessa scritta che il codice non manteneva. Gira di rado (una volta su
   venti) perche' e' manutenzione, non parte della risposta. */
if (mt_rand(1, 20) === 1) {
  $ttl = max($window, 86400);
  $old = glob($rlDir . '/varco_chat_*.txt');
  if (is_array($old)) {
    foreach ($old as $f) {
      $mt = @filemtime($f);
      if ($mt && ($now - $mt) > $ttl) @unlink($f);
    }
  }
}

/* ---- Input -------------------------------------------------------------- */
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body) || !isset($body['messages']) || !is_array($body['messages'])) {
  fail(400, 'Richiesta non valida.');
}

/* Ripuliamo la history: solo ruoli attesi, solo testo, lunghezze limitate, e
   al massimo gli ultimi 16 turni. Il client non decide né il system prompt né
   quanto contesto può far pagare. */
$messages = array();
$history  = array_slice($body['messages'], -16);
foreach ($history as $m) {
  if (!isset($m['role'], $m['content'])) continue;
  if ($m['role'] !== 'user' && $m['role'] !== 'assistant') continue;
  $text = trim((string)$m['content']);
  if ($text === '') continue;
  $messages[] = array(
    'role'    => $m['role'],
    'content' => function_exists('mb_substr') ? mb_substr($text, 0, 1500) : substr($text, 0, 1500),
  );
}
if (!count($messages)) fail(400, 'Nessun messaggio.');

/* ---- System prompt ------------------------------------------------------ */
$system = <<<'PROMPT'
Sei l'assistente del sito di Varco, agenzia italiana di trasformazione digitale per PMI.

TONO E LINGUA
- Rispondi sempre in italiano, dando del tu, con tono diretto e concreto.
- Frasi brevi. Massimo 120 parole per risposta, spesso bastano 40.
- Niente entusiasmo di maniera, niente emoji, niente elenchi puntati lunghi.

COSA FA VARCO
Varco non vende servizi isolati: parte sempre da un audit gratuito di sito, social e
strumenti già in uso, poi costruisce un sistema unico su web, marketing e automazioni AI,
con un referente unico per progetto e numeri condivisi per intero (anche quelli brutti).
Servizi: web design, web app, ottimizzazione sito, SEO, social media marketing,
campagne ads, video promozionali con AI, email marketing, automazione e-mail,
chatbot, agente vocale per le chiamate.

IL TUO COMPITO
1. Capire il problema concreto di chi scrive (cosa succede oggi, da quanto, cosa hanno già provato).
2. Fare UNA domanda per volta, mai un questionario.
3. Collegare il problema al servizio o alla combinazione di servizi che lo affronta, spiegando il "come" in una frase.
4. Dopo 3-4 scambi, o appena il problema è chiaro, proporre l'audit gratuito di 30 minuti
   rimandando alla pagina Contatti o a WhatsApp. Proponilo una volta, senza insistere.

REGOLE NON NEGOZIABILI
- Non inventare MAI prezzi, tempi di consegna, percentuali, garanzie, nomi di clienti o casi studio.
  Se ti chiedono quanto costa: il preventivo arriva solo dopo l'audit, perché dipende da cosa c'è già.
  Se ti chiedono quanto tempo serve: dipende dal progetto, si definisce nell'audit.
- Non sei un consulente legale, fiscale o medico e non prendi impegni a nome di Varco.
- Se la domanda non c'entra con Varco o col digitale dell'attività di chi scrive, dillo in una riga
  e riporta il discorso al loro problema.
- Se non sai una cosa, dillo e rimanda al contatto umano: WhatsApp o la pagina Contatti.

CONTATTI
Telefono e WhatsApp: +39 388 864 8509 — Email: [EMAIL] — pagina Contatti del sito.
PROMPT;

array_unshift($messages, array('role' => 'system', 'content' => $system));

/* ---- Chiamata al provider ----------------------------------------------- */
$req = array(
  'model'       => $cfg['model'],
  'messages'    => $messages,
  'temperature' => 0.4,
  /* Alto abbastanza da coprire i modelli che "ragionano" prima di rispondere:
     con un tetto basso il ragionamento consuma tutto il budget e il campo
     content torna vuoto. La lunghezza della risposta la impone il prompt. */
  'max_tokens'  => 900,
);
if (!empty($cfg['reasoning_effort'])) $req['reasoning_effort'] = $cfg['reasoning_effort'];
$payload = json_encode($req, JSON_UNESCAPED_UNICODE);

$ch = curl_init($cfg['endpoint']);
curl_setopt_array($ch, array(
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => $payload,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 30,
  CURLOPT_HTTPHEADER     => array(
    'Content-Type: application/json',
    'Authorization: Bearer ' . $cfg['api_key'],
  ),
));
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($res === false) fail(502, 'Assistente non raggiungibile. Riprova tra poco.');

$data = json_decode($res, true);
if ($code !== 200 || !isset($data['choices'][0]['message']['content'])) {
  /* Il messaggio d'errore del provider resta nei log del server, non va al browser. */
  error_log('[varco-chat] HTTP ' . $code . ' — ' . substr($res, 0, 500) . ' ' . $err);
  if ($code === 429) fail(429, 'Assistente sovraccarico in questo momento. Riprova tra un minuto.');
  fail(502, 'Assistente non disponibile. Scrivici su WhatsApp e ti rispondiamo noi.');
}

$reply = trim($data['choices'][0]['message']['content']);
if ($reply === '') {
  /* Risposta vuota: succede se il modello esaurisce i token ragionando.
     Meglio un rilancio onesto che una bolla bianca. */
  error_log('[varco-chat] risposta vuota dal modello ' . $cfg['model']);
  $reply = "Non sono riuscito a formulare la risposta. Riprova, oppure scrivici su WhatsApp al +39 388 864 8509.";
}

echo json_encode(array('reply' => $reply), JSON_UNESCAPED_UNICODE);
