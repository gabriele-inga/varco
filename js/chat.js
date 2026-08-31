/* Varco — assistente AI. Vanilla JS, nessuna libreria.
   La chiave API non è qui: il widget parla solo con api/chat.php sullo stesso
   dominio, che aggiunge chiave e system prompt lato server. */
(function () {
  "use strict";

  /* Il sito vive sia in root (index.html) sia in sottocartelle (servizi/, legal/):
     ricaviamo il prefisso dallo src di questo stesso script invece di indovinarlo. */
  var self = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="chat.js"]');
    return s[s.length - 1];
  })();
  var BASE = self ? self.src.replace(/js\/chat\.js.*$/, "") : "/";
  var ENDPOINT = BASE + "api/chat.php";

  var OPENER =
    "Descrivi un problema che sta rallentando la tua attività, " +
    "oppure scegline uno qui sotto.";

  /* I problemi sono scritti come li direbbe un titolare, non come si chiamano
     i servizi: il collegamento al servizio lo fa l'assistente nella risposta. */
  var PROBLEMS = [
    "Il sito riceve visite ma quasi nessuna richiesta",
    "Su Google non mi trova nessuno",
    "Spendo in pubblicità senza capire cosa rende",
    "Perdo chiamate quando non c'è nessuno a rispondere",
    "Rispondo sempre alle stesse domande",
    "Ho una lista di contatti che non sto usando"
  ];

  var ARROW =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3.333 8h9.334m0 0L8 3.333M12.667 8L8 12.667"/></svg>';

  var history = [];   /* solo user/assistant: il system prompt sta sul server */
  var busy = false;
  var opened = false;
  var root, panel, scroller, log, suggest, form, field, sendBtn, launcher;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    root = el("div", "chat");

    launcher = el("button", "chat-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Apri l'assistente Varco");
    launcher.innerHTML =
      '<svg class="chat-launcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 8.8 8.8 0 0 1-3.9-.9L3 20.5l1.7-4.9a8.2 8.2 0 0 1-1.1-4.1A8.4 8.4 0 0 1 12.1 3 8.4 8.4 0 0 1 21 11.5z"/></svg>' +
      '<span class="chat-launcher-label">Parliamo del tuo problema</span>';

    panel = el("div", "chat-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Assistente Varco");
    panel.hidden = true;

    var head = el("div", "chat-head");
    var headText = el("div");
    /* Stesso glifo del launcher: la forma che ha aperto l'assistente e' la
       forma che lo nomina. Nessun contenitore tondo — il sistema tiene il
       cerchio per i soli indicatori di posizione. */
    var headId = el("div", "chat-head-id");
    headId.innerHTML =
      '<svg class="chat-head-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 8.8 8.8 0 0 1-3.9-.9L3 20.5l1.7-4.9a8.2 8.2 0 0 1-1.1-4.1A8.4 8.4 0 0 1 12.1 3 8.4 8.4 0 0 1 21 11.5z"/></svg>';
    headId.appendChild(el("p", "chat-head-name", "Assistente Varco"));
    headText.appendChild(headId);
    headText.appendChild(el("p", "chat-head-note", "Risposte generate dall'AI. Il preventivo arriva dopo l'audit."));
    var close = el("button", "chat-close");
    close.type = "button";
    close.setAttribute("aria-label", "Chiudi l'assistente");
    close.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    head.appendChild(headText);
    head.appendChild(close);

    log = el("div", "chat-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-label", "Conversazione con l'assistente");

    suggest = el("div", "chat-suggest");
    var sTitle = el("p", "chat-suggest-title", "Problemi frequenti");
    sTitle.id = "chat-suggest-title";
    suggest.setAttribute("aria-labelledby", sTitle.id);
    suggest.appendChild(sTitle);
    PROBLEMS.forEach(function (p, i) {
      var b = el("button", "chat-suggest-row");
      b.type = "button";
      /* Indice della riga: il CSS ne ricava il ritardo d'entrata, cosi' la
         cascata resta corretta se l'elenco cambia lunghezza. */
      b.style.setProperty("--i", String(i));
      b.appendChild(document.createTextNode(p));
      b.insertAdjacentHTML("beforeend", ARROW);
      b.addEventListener("click", function () { send(p); });
      suggest.appendChild(b);
    });

    form = el("form", "chat-form");
    field = el("input", "chat-field");
    field.type = "text";
    field.placeholder = "Scrivi il tuo problema";
    field.setAttribute("aria-label", "Il tuo messaggio");
    field.maxLength = 1000;
    field.autocomplete = "off";
    sendBtn = el("button", "chat-send");
    sendBtn.type = "submit";
    sendBtn.disabled = true;   /* niente invio a vuoto: il controllo dice la verità */
    sendBtn.setAttribute("aria-label", "Invia messaggio");
    sendBtn.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 8h9m0 0L8 3.5M12 8l-4 4.5"/></svg>';
    form.appendChild(field);
    form.appendChild(sendBtn);

    /* Testata e campo restano fissi; a scorrere e' solo il corpo (verbale +
       problemi frequenti). Senza questo strato, con il registro aperto la
       testata veniva compressa fuori dal pannello. */
    scroller = el("div", "chat-body");
    scroller.appendChild(log);
    scroller.appendChild(suggest);

    panel.appendChild(head);
    panel.appendChild(scroller);
    panel.appendChild(form);
    root.appendChild(panel);
    root.appendChild(launcher);
    document.body.appendChild(root);

    launcher.addEventListener("click", function () { toggle(); });
    close.addEventListener("click", function () { toggle(false); launcher.focus(); });
    field.addEventListener("input", function () {
      sendBtn.disabled = busy || field.value.trim() === "";
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = field.value.trim();
      if (v) send(v);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("chat--open")) {
        toggle(false); launcher.focus();
      }
    });
  }

  /* L'apertura e' l'unico momento coreografato del widget: il pannello cresce
     dall'angolo del lanciatore e il verbale si riga riga per riga. La classe
     che porta la sequenza vive solo per la durata della corsa, altrimenti ogni
     turno successivo entrerebbe con lo stesso ritardo. */
  var OPEN_SEQ_MS = 700;
  var CLOSE_MS = 180;
  var seqTimer = null, closeTimer = null;

  function reduced() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function toggle(force) {
    /* Lo stato vero e' la classe, non `hidden`: durante i 180ms di chiusura il
       pannello e' ancora nel DOM, e un clic sul lanciatore in quel momento
       deve riaprire, non richiudere. */
    var isOpen = root.classList.contains("chat--open");
    var next = force === undefined ? !isOpen : force;
    if (next === isOpen) return;

    /* Riaprire durante i 180ms di chiusura non e' un'apertura: e' una chiusura
       annullata. Il pannello torna al suo posto senza rigare di nuovo le righe
       che sono gia' li'. */
    var wasClosing = closeTimer !== null;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (seqTimer) { clearTimeout(seqTimer); seqTimer = null; }
    panel.classList.remove("is-closing", "is-opening");

    if (next) {
      panel.hidden = false;
      if (!wasClosing && !reduced()) {
        panel.classList.add("is-opening");
        seqTimer = setTimeout(function () {
          panel.classList.remove("is-opening");
          seqTimer = null;
        }, OPEN_SEQ_MS);
      }
    } else if (reduced()) {
      panel.hidden = true;
    } else {
      panel.classList.add("is-closing");
      closeTimer = setTimeout(function () {
        panel.hidden = true;
        panel.classList.remove("is-closing");
        closeTimer = null;
      }, CLOSE_MS);
    }

    root.classList.toggle("chat--open", next);
    launcher.setAttribute("aria-expanded", next ? "true" : "false");
    launcher.setAttribute("aria-label", next ? "Chiudi l'assistente Varco" : "Apri l'assistente Varco");
    if (next) {
      if (!opened) {
        opened = true;
        addTurn("bot", OPENER);
        /* All'apertura si legge dall'inizio: l'ancoraggio in fondo serve solo
           quando la conversazione e' gia' cominciata. */
        scroller.scrollTop = 0;
      }
      field.focus();
    }
  }

  /* Un turno del verbale: etichetta di chi parla + testo. Nessuna bolla. */
  function addTurn(who, text) {
    var turn = el("div", "chat-turn" + (who === "user" ? " chat-turn--user" : ""));
    turn.appendChild(el("p", "chat-turn-who", who === "user" ? "Tu" : "Varco"));
    var body = el("p", "chat-turn-body");
    /* Nessun innerHTML sul testo del modello: solo nodi di testo, così una
       risposta non può iniettare markup nella pagina. I link li creiamo noi. */
    linkify(text, body);
    turn.appendChild(body);
    log.appendChild(turn);
    scroller.scrollTop = scroller.scrollHeight;
    return turn;
  }

  /* Riconosce solo url http(s), email e numeri +39; tutto il resto resta testo. */
  function linkify(text, target) {
    var re = /(https?:\/\/[^\s<]+|[\w.+-]+@[\w-]+\.[\w.]+|\+39[\s\d]{7,})/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) target.appendChild(document.createTextNode(text.slice(last, m.index)));
      var raw = m[0].replace(/[.,;:)]+$/, "");
      var a = el("a", null, raw);
      if (raw.indexOf("http") === 0) {
        a.href = raw; a.target = "_blank"; a.rel = "noopener";
      } else if (raw.indexOf("@") > -1) {
        a.href = "mailto:" + raw;
      } else {
        a.href = "tel:" + raw.replace(/\s/g, "");
      }
      target.appendChild(a);
      last = m.index + raw.length;
    }
    target.appendChild(document.createTextNode(text.slice(last)));
  }

  function setBusy(state) {
    busy = state;
    field.disabled = state;
    sendBtn.disabled = state || field.value.trim() === "";
  }

  function send(text) {
    if (busy) return;
    if (!opened) { opened = true; addTurn("bot", OPENER); }
    suggest.hidden = true;
    field.value = "";
    addTurn("user", text);
    history.push({ role: "user", content: text });

    setBusy(true);
    var wait = addTurn("bot", "Sto scrivendo");
    wait.classList.add("chat-turn--wait");

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    })
      .then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) throw new Error(d && d.error ? d.error : "Errore di rete.");
          return d;
        }, function () { throw new Error("Risposta non valida dal server."); });
      })
      .then(function (d) {
        wait.parentNode.removeChild(wait);
        addTurn("bot", d.reply);
        history.push({ role: "assistant", content: d.reply });
      })
      .catch(function (err) {
        wait.parentNode.removeChild(wait);
        /* L'errore non è un vicolo cieco: resta sempre il canale umano. */
        addTurn("bot", (err.message || "Qualcosa non ha funzionato.") +
          " Puoi scriverci su WhatsApp al +39 388 864 8509.");
      })
      .then(function () {
        setBusy(false);
        field.focus();
      });
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
