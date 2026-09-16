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
    "Ciao, sono l'assistente di Varco. Scrivimi pure cosa ti serve: " +
    "ti rispondo io, subito.";

  var history = [];   /* solo user/assistant: il system prompt sta sul server */
  var busy = false;
  var opened = false;
  var root, panel, scroller, log, form, field, sendBtn, launcher, mate;

  /* <sprite-mate> — la mascotte in pixel art dell'header, disegnata su canvas
     dalla griglia 14×21 originale (nessuna immagine da caricare). Due stati:
     "idle" (antenne che oscillano, battito di ciglia) mentre aspetta chi
     scrive, "walk" (passi alternati) mentre elabora una risposta. */
  (function registerSpriteMate() {
    if (customElements.get("sprite-mate")) return;

    var BASE_ROWS = [
      '..aaa...aaa...',
      '.aaaa...aaaa..',
      '.aa.......aa..',
      '.aa.......aa..',
      '.aaaa...aaaa..',
      '..aaa...aaa...',
      'aaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaa',
      'aa..aaaaa..aaa',
      'aa..aaaaa..aaa',
      'aa..aaaaa..aaa',
      'aa..aaaaa..aaa',
      'aaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaa',
      '...aa.....aa..',
      'aaaaa..aaaaa..',
      'aaaaa..aaaaa..',
      'aaaaa..aaaaa..'
    ];
    var W = 14, H = 23, TOP = 1;
    var ANT = [0, 5], TORSO = [6, 16], STEM = 17, FEET = [18, 20];
    var EYE_COLS = [2, 3, 9, 10], LID_ROWS = [9, 10, 12];

    function buildFrame(o) {
      var g = [];
      for (var y = 0; y < H; y++) g.push(new Array(W).fill(false));
      var put = function (x, y) { if (y >= 0 && y < H && x >= 0 && x < W) g[y][x] = true; };
      var dy = o.bodyDy || 0;
      var r, x;
      for (r = ANT[0]; r <= ANT[1]; r++)
        for (x = 0; x < W; x++)
          if (BASE_ROWS[r][x] === 'a') put(x, r + TOP + dy + (x < 7 ? (o.antL || 0) : (o.antR || 0)));
      for (r = TORSO[0]; r <= TORSO[1]; r++)
        for (x = 0; x < W; x++)
          if (BASE_ROWS[r][x] === 'a') put(x, r + TOP + dy);
      if (o.blink)
        for (r = 0; r < LID_ROWS.length; r++)
          for (x = 0; x < EYE_COLS.length; x++) put(EYE_COLS[x], LID_ROWS[r] + TOP + dy);
      for (x = 0; x < W; x++) {
        if (BASE_ROWS[STEM][x] !== 'a') continue;
        var fdy = x < 6 ? (o.footL || 0) : (o.footR || 0);
        for (y = STEM + TOP + dy; y <= FEET[0] + TOP + fdy - 1; y++) put(x, y);
      }
      for (r = FEET[0]; r <= FEET[1]; r++)
        for (x = 0; x < W; x++)
          if (BASE_ROWS[r][x] === 'a') put(x, r + TOP + (x < 6 ? (o.footL || 0) : (o.footR || 0)));
      return g;
    }

    var F = {
      stand: buildFrame({}),
      antL: buildFrame({ antL: 1 }),
      antR: buildFrame({ antR: 1 }),
      blink: buildFrame({ blink: true }),
      stepL: buildFrame({ bodyDy: -1, footL: -1 }),
      stepR: buildFrame({ bodyDy: -1, footR: -1 })
    };
    var STATES = {
      idle: [
        { g: F.stand, d: 1200 }, { g: F.antL, d: 520 }, { g: F.blink, d: 110 },
        { g: F.stand, d: 700 }, { g: F.antR, d: 520 }, { g: F.blink, d: 100 }
      ],
      walk: [
        { g: F.stepL, d: 120 }, { g: F.stand, d: 120 },
        { g: F.stepR, d: 120 }, { g: F.stand, d: 120 }
      ]
    };

    function SpriteMate() { return Reflect.construct(HTMLElement, [], SpriteMate); }
    SpriteMate.prototype = Object.create(HTMLElement.prototype);
    SpriteMate.prototype.constructor = SpriteMate;
    Object.setPrototypeOf(SpriteMate, HTMLElement);

    SpriteMate.prototype.connectedCallback = function () {
      if (this._built) return;
      this._built = true;
      this.style.display = "inline-block";
      this.style.lineHeight = "0";
      this._c = document.createElement("canvas");
      this._c.style.imageRendering = "pixelated";
      this._c.style.display = "block";
      this._ctx = this._c.getContext("2d");
      this.appendChild(this._c);
      this._i = 0; this._t = 0;
      this._sync();
      this._loop = this._loop.bind(this);
      this._last = performance.now();
      this._raf = requestAnimationFrame(this._loop);
    };
    SpriteMate.prototype.disconnectedCallback = function () {
      cancelAnimationFrame(this._raf); this._built = false;
    };
    SpriteMate.prototype.attributeChangedCallback = function () {
      if (this._built) { this._i = 0; this._t = 0; this._sync(); }
    };
    Object.defineProperty(SpriteMate.prototype, "state", {
      get: function () { return this.getAttribute("state") || "idle"; },
      set: function (v) { this.setAttribute("state", v); }
    });
    SpriteMate.prototype._sync = function () {
      var s = Math.max(1, parseInt(this.getAttribute("scale") || "3", 10));
      this._s = s;
      this._c.width = W * s; this._c.height = H * s;
      this._col = this.getAttribute("color") || "#01497C";
      this._draw();
    };
    SpriteMate.prototype._seq = function () { return STATES[this.state] || STATES.idle; };
    SpriteMate.prototype._draw = function () {
      var seq = this._seq(), g = seq[this._i % seq.length].g;
      var ctx = this._ctx, s = this._s;
      ctx.clearRect(0, 0, this._c.width, this._c.height);
      ctx.fillStyle = this._col;
      for (var y = 0; y < H; y++)
        for (var x = 0; x < W; x++)
          if (g[y][x]) ctx.fillRect(x * s, y * s, s, s);
    };
    SpriteMate.prototype._loop = function (now) {
      var dt = Math.min(64, now - this._last);
      this._last = now;
      var seq = this._seq();
      this._t += dt;
      var d = seq[this._i % seq.length].d;
      if (this._t >= d) { this._t -= d; this._i = (this._i + 1) % seq.length; this._draw(); }
      this._raf = requestAnimationFrame(this._loop);
    };
    SpriteMate.observedAttributes = ["state", "scale", "color"];
    customElements.define("sprite-mate", SpriteMate);
  })();

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
    /* Testata ridotta all'osso: la mascotte in cima, il nome sotto. Niente
       nota, niente icona separata — e' lei stessa a dire chi risponde. */
    var headId = el("div", "chat-head-id");
    mate = document.createElement("sprite-mate");
    mate.className = "chat-head-mate";
    mate.setAttribute("scale", "3");
    mate.setAttribute("state", "idle");
    mate.setAttribute("aria-hidden", "true");
    headId.appendChild(mate);
    headId.appendChild(el("p", "chat-head-name", "Assistente Varco"));
    var close = el("button", "chat-close");
    close.type = "button";
    close.setAttribute("aria-label", "Chiudi l'assistente");
    close.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    head.appendChild(headId);
    head.appendChild(close);

    log = el("div", "chat-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-label", "Conversazione con l'assistente");

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

    /* Testata e campo restano fissi; a scorrere e' solo il corpo (verbale).
       Senza questo strato, con il registro aperto la testata veniva
       compressa fuori dal pannello. */
    scroller = el("div", "chat-body");
    scroller.appendChild(log);

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
    /* Idle mentre aspetta chi scrive, cammina mentre elabora la risposta. */
    mate.state = state ? "walk" : "idle";
  }

  function send(text) {
    if (busy) return;
    if (!opened) { opened = true; addTurn("bot", OPENER); }
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
