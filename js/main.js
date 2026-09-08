/* Varco — main.js — vanilla JS, nessuna libreria esterna */
(function () {
  "use strict";

  /* Nav mobile — inert quando chiuso: prima l'overlay era nascosto solo via
     opacity/pointer-events (CSS), quindi restava nel tab order e nell'albero
     di accessibilità. Tab da tastiera o uno screen reader incontravano 7 link
     invisibili prima di qualsiasi contenuto visibile della pagina (P1 di
     /impeccable critique, violazione WCAG 2.4.3). "inert" toglie focus e
     esposizione ad AT in un colpo solo quando il pannello non è aperto. */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    /* Stato iniziale difensivo: l'attributo inert e' nel markup di tutte e 23
       le pagine, ma se una pagina futura lo dimenticasse il pannello chiuso
       tornerebbe silenziosamente nel tab order. Qui lo riallineiamo alla
       classe .open, che e' l'unica fonte di verita' sullo stato. */
    mobileNav.inert = !mobileNav.classList.contains("open");
    toggle.setAttribute("aria-expanded", mobileNav.classList.contains("open") ? "true" : "false");
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      mobileNav.inert = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        mobileNav.inert = true;
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item, i) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.setAttribute("aria-expanded", "false");
    /* aria-controls: prima il legame trigger -> pannello non era esposto da
       nessuna parte nel sito, quindi uno screen reader annunciava "compresso"
       senza poter dire compresso *cosa*. Gli id sono generati qui per non
       doverli scrivere a mano su 23 pagine. */
    if (!a.id) a.id = "faq-panel-" + (i + 1);
    q.setAttribute("aria-controls", a.id);
    a.setAttribute("role", "region");
    if (!q.id) q.id = "faq-q-" + (i + 1);
    a.setAttribute("aria-labelledby", q.id);
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        a.style.maxHeight = null;
        q.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Filtro casi studio (index) */
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    var cards = document.querySelectorAll(".case-card");
    /* Il filtro faceva sparire le schede in silenzio: da 5 risultati a 1 senza
       nessun conteggio e senza live region, quindi invisibile a chi non vede
       la griglia. Il conteggio e' anche l'unico stato vuoto che la pagina ha. */
    var count = document.createElement("p");
    count.className = "filter-count";
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");
    filterBar.insertAdjacentElement("afterend", count);

    var applyFilter = function (filter, announce) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "tutti" || (card.getAttribute("data-tags") || "").indexOf(filter) > -1;
        card.hidden = !match;
        if (match) shown++;
      });
      var grid = document.querySelector(".cases-grid");
      if (grid) grid.classList.toggle("is-empty", shown === 0);
      if (!announce) { count.textContent = ""; return; }
      count.textContent =
        shown === 0
          ? "Nessun caso studio in questo settore."
          : shown === 1
          ? "1 caso studio in questo settore."
          : shown + " casi studio" + (filter === "tutti" ? "." : " in questo settore.");
    };

    filterBar.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        applyFilter(btn.getAttribute("data-filter"), true);
      });
    });
  }

  /* Form contatti — invio reale a Formspree.
     Prima: nessuna chiamata di rete, messaggio di "successo" verde che citava
     il README al visitatore, e form.reset() immediato. Ogni richiesta veniva
     persa. Ora: validazione per campo con aria-invalid + messaggio inline,
     focus sul primo campo non valido, stato di caricamento sul bottone,
     POST reale, e reset SOLO dopo conferma dal server. */
  var form = document.querySelector("#contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector("button[type='submit']");
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var setStatus = function (text, kind) {
      if (!status) return;
      status.textContent = text;
      status.className = "form-status" + (kind ? " " + kind : "");
    };

    var errorFor = function (field) {
      var label = form.querySelector("label[for='" + field.id + "']");
      var name = label ? label.textContent.replace(/\s*\*\s*$/, "").trim() : "Questo campo";
      if (field.type === "checkbox") return "Devi accettare la privacy policy per inviare la richiesta.";
      if (!field.value.trim()) return name + ": campo obbligatorio.";
      if (field.type === "email") return "Controlla l'indirizzo email: manca la @ o il dominio.";
      return name + ": valore non valido.";
    };

    var clearFieldError = function (field) {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
      var box = field.closest(".field");
      var msg = box && box.querySelector(".field-err");
      if (msg) msg.remove();
    };

    var showFieldError = function (field, text) {
      var box = field.closest(".field");
      if (!box) return;
      var msg = box.querySelector(".field-err");
      if (!msg) {
        msg = document.createElement("span");
        msg.className = "field-err";
        msg.id = (field.id || "campo") + "-err";
        box.appendChild(msg);
      }
      msg.textContent = text;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", msg.id);
    };

    var isFilled = function (field) {
      return field.type === "checkbox" ? field.checked : !!field.value.trim();
    };

    var validate = function () {
      var invalid = [];
      form.querySelectorAll("[required]").forEach(function (field) {
        clearFieldError(field);
        var ok = isFilled(field) && (field.type !== "email" || EMAIL_RE.test(field.value.trim()));
        if (!ok) {
          showFieldError(field, errorFor(field));
          invalid.push(field);
        }
      });
      return invalid;
    };

    /* Una volta segnalato l'errore, toglilo appena l'utente rimedia: lasciare
       il bordo rosso su un campo ormai corretto e' rumore, non feedback. */
    form.querySelectorAll("[required]").forEach(function (field) {
      var revalidate = function () {
        if (!field.hasAttribute("aria-invalid")) return;
        if (isFilled(field) && (field.type !== "email" || EMAIL_RE.test(field.value.trim()))) clearFieldError(field);
      };
      field.addEventListener("input", revalidate);
      field.addEventListener("change", revalidate);
    });

    var setBusy = function (busy) {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
      submitBtn.textContent = busy ? "Invio in corso…" : (submitBtn.getAttribute("data-label") || "Invia richiesta");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var invalid = validate();
      if (invalid.length) {
        setStatus(
          invalid.length === 1
            ? "Manca un campo: controlla quello segnalato qui sopra."
            : "Mancano " + invalid.length + " campi: controlla quelli segnalati qui sopra.",
          "err"
        );
        invalid[0].focus();
        return;
      }

      var endpoint = form.getAttribute("action");
      if (!endpoint) {
        setStatus("Invio non disponibile in questo momento. Scrivici su WhatsApp al +39 388 864 8509.", "err");
        return;
      }

      setBusy(true);
      setStatus("Invio in corso…", "");

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) return res;
          return res.json().then(
            function (data) {
              var detail = data && data.errors && data.errors.length ? data.errors[0].message : null;
              throw new Error(detail || "HTTP " + res.status);
            },
            function () { throw new Error("HTTP " + res.status); }
          );
        })
        .then(function () {
          setStatus("Richiesta inviata. Ti rispondiamo entro 24 ore all'indirizzo che hai indicato.", "ok");
          form.reset();
          form.querySelectorAll("[required]").forEach(clearFieldError);
        })
        .catch(function (err) {
          /* Il messaggio non viene mai cancellato su errore: l'utente deve
             poter ritentare senza riscrivere tutto. */
          setStatus(
            "Invio non riuscito (" + (err && err.message ? err.message : "errore di rete") +
              "). Il tuo messaggio e' ancora qui: riprova, oppure scrivici su WhatsApp al +39 388 864 8509.",
            "err"
          );
        })
        .then(function () { setBusy(false); });
    });

    /* "Pulisci il modulo" cancellava sette campi al primo clic, senza conferma
       e senza undo, standing accanto a "Invia richiesta". Ora richiede due tap
       intenzionali e torna da solo allo stato normale. */
    var clearBtn = form.querySelector("[data-action='clear']");
    if (clearBtn) {
      var armed = false, armedTimer = null;
      var disarm = function () {
        armed = false;
        clearBtn.textContent = "Pulisci il modulo";
        clearBtn.classList.remove("is-armed");
        if (armedTimer) { clearTimeout(armedTimer); armedTimer = null; }
      };
      clearBtn.addEventListener("click", function () {
        if (!armed) {
          armed = true;
          clearBtn.textContent = "Tocca di nuovo per svuotare";
          clearBtn.classList.add("is-armed");
          armedTimer = setTimeout(disarm, 5000);
          return;
        }
        form.reset();
        form.querySelectorAll("[required]").forEach(clearFieldError);
        setStatus("", "");
        disarm();
      });
      clearBtn.addEventListener("blur", disarm);
    }
  }

  /* Roadmap: striscia orizzontale con scroll nativo (scroll-snap in CSS,
     nessuno scroll-jacking). I pallini (.route-dot) riflettono passivamente
     quale step è visibile — via IntersectionObserver, non guidano loro lo
     scroll — e permettono anche di saltare a un passaggio col tap/click. */
  var roadmapWrap = document.querySelector(".route-wrap");
  var roadmapStepEls = document.querySelectorAll(".route-step");
  var roadmapDots = document.querySelectorAll(".route-dot");
  if (roadmapWrap && roadmapStepEls.length && roadmapDots.length) {
    var setActiveRoadmapDot = function (index) {
      roadmapDots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    };
    if ("IntersectionObserver" in window) {
      var roadmapIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;
            var index = Array.prototype.indexOf.call(roadmapStepEls, entry.target);
            if (index > -1) setActiveRoadmapDot(index);
          });
        },
        { root: roadmapWrap, threshold: 0.6 }
      );
      roadmapStepEls.forEach(function (step) { roadmapIO.observe(step); });
    }
    roadmapDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        var step = roadmapStepEls[i];
        if (step) step.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });
  }

  /* Servizi: accordion a tap/click sull'intestazione (.sr-head, un <button>),
     stesso pattern single-open della FAQ qui sopra — un solo servizio aperto
     alla volta, nessun blocco dello scroll. Su desktop l'hover fa la stessa
     anteprima via CSS puro (nessun JS necessario per quello); questo gestisce
     tap/click su ogni dispositivo, incluso mouse/trackpad. */
  document.querySelectorAll(".service-row").forEach(function (row, i) {
    var head = row.querySelector(".sr-head");
    if (!head) return;
    var panel = row.querySelector(".sr-body-wrap");
    if (panel) {
      if (!panel.id) panel.id = "service-panel-" + (i + 1);
      head.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "region");
      if (!head.id) head.id = "service-head-" + (i + 1);
      panel.setAttribute("aria-labelledby", head.id);
    }
    head.addEventListener("click", function () {
      var wasOpen = row.classList.contains("is-open");
      document.querySelectorAll(".service-row.is-open").forEach(function (other) {
        if (other === row) return;
        other.classList.remove("is-open");
        var otherHead = other.querySelector(".sr-head");
        if (otherHead) otherHead.setAttribute("aria-expanded", "false");
      });
      row.classList.toggle("is-open", !wasOpen);
      head.setAttribute("aria-expanded", wasOpen ? "false" : "true");
    });
  });

  /* Select personalizzata — vedi .select nel CSS.
     La <select> nativa resta la fonte di verita' e l'elemento inviato: qui
     viene solo nascosta e pilotata. Semantica listbox completa (combobox +
     listbox + option + group), non un div travestito. */
  var CHEVRON = '<svg class="sr-chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK = '<svg class="select-check" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  document.querySelectorAll("select[data-select]").forEach(function (native, si) {
    var wrap = document.createElement("div");
    wrap.className = "select";
    if (native.hasAttribute("data-mono")) wrap.setAttribute("data-mono", "");
    native.parentNode.insertBefore(wrap, native);
    wrap.appendChild(native);
    native.classList.add("select-native");
    native.setAttribute("tabindex", "-1");
    native.setAttribute("aria-hidden", "true");

    var id = native.id || "select-" + (si + 1);
    var lbl = document.querySelector("label[for='" + native.id + "']");
    if (lbl && !lbl.id) lbl.id = id + "-label";

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "select-trigger";
    trigger.id = id + "-trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", id + "-listbox");
    if (lbl) trigger.setAttribute("aria-labelledby", lbl.id + " " + id + "-value");
    trigger.innerHTML = '<span class="select-value" id="' + id + '-value"></span>' + CHEVRON;

    var panel = document.createElement("div");
    panel.className = "select-panel";
    panel.id = id + "-listbox";
    panel.setAttribute("role", "listbox");
    if (lbl) panel.setAttribute("aria-labelledby", lbl.id);
    panel.hidden = true;

    var scrim = document.createElement("div");
    scrim.className = "select-scrim";
    scrim.hidden = true;

    var rows = [];
    var addOption = function (opt, parent) {
      var row = document.createElement("div");
      row.className = "select-option";
      row.id = id + "-opt-" + rows.length;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", opt.selected ? "true" : "false");
      var idx = opt.getAttribute("data-index");
      row.innerHTML =
        (idx ? '<span class="select-index">' + idx + "</span>" : "") +
        '<span class="select-label"></span>' + CHECK;
      row.querySelector(".select-label").textContent = opt.textContent;
      parent.appendChild(row);
      rows.push(row);
    };
    Array.prototype.forEach.call(native.children, function (child) {
      if (child.tagName === "OPTGROUP") {
        var g = document.createElement("div");
        g.className = "select-group";
        g.setAttribute("role", "group");
        g.setAttribute("aria-label", child.label);
        var gl = document.createElement("div");
        gl.className = "select-group-label";
        gl.textContent = child.label;
        gl.setAttribute("aria-hidden", "true");
        g.appendChild(gl);
        Array.prototype.forEach.call(child.children, function (o) { addOption(o, g); });
        panel.appendChild(g);
      } else if (child.tagName === "OPTION") {
        addOption(child, panel);
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    wrap.appendChild(scrim);

    var open = false, active = -1;

    var paint = function () {
      var opt = native.options[native.selectedIndex];
      trigger.querySelector(".select-value").textContent = opt ? opt.textContent : "";
      trigger.setAttribute("data-placeholder", opt && opt.value === "" ? "true" : "false");
      rows.forEach(function (r, i) {
        r.setAttribute("aria-selected", i === native.selectedIndex ? "true" : "false");
      });
    };

    var setActive = function (i) {
      if (active > -1 && rows[active]) rows[active].classList.remove("is-active");
      active = i;
      if (i > -1 && rows[i]) {
        rows[i].classList.add("is-active");
        panel.setAttribute("aria-activedescendant", rows[i].id);
        rows[i].scrollIntoView({ block: "nearest" });
      } else {
        panel.removeAttribute("aria-activedescendant");
      }
    };

    var setOpen = function (state) {
      open = state;
      wrap.classList.toggle("is-open", state);
      panel.hidden = !state;
      scrim.hidden = !state;
      trigger.setAttribute("aria-expanded", state ? "true" : "false");
      if (state) {
        /* ribalta il pannello sopra il campo se sotto non ci sta */
        var r = trigger.getBoundingClientRect();
        wrap.classList.toggle("is-up", window.innerHeight - r.bottom < 340 && r.top > 340);
        setActive(native.selectedIndex);
      } else {
        wrap.classList.remove("is-up");
        setActive(-1);
      }
    };

    var choose = function (i) {
      native.selectedIndex = i;
      native.dispatchEvent(new Event("change", { bubbles: true }));
      setOpen(false);
      trigger.focus();
    };

    trigger.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!open); });
    scrim.addEventListener("click", function () { setOpen(false); });
    rows.forEach(function (row, i) {
      row.addEventListener("click", function () { choose(i); });
      row.addEventListener("mousemove", function () { setActive(i); });
    });

    var typed = "", typedTimer = null;
    trigger.addEventListener("keydown", function (e) {
      var k = e.key;
      if (!open) {
        if (k === "Enter" || k === " " || k === "ArrowDown" || k === "ArrowUp") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (k === "Escape") { e.preventDefault(); setOpen(false); trigger.focus(); return; }
      if (k === "Tab") { setOpen(false); return; }
      if (k === "Enter" || k === " ") { e.preventDefault(); if (active > -1) choose(active); return; }
      if (k === "ArrowDown") { e.preventDefault(); setActive(Math.min(rows.length - 1, active + 1)); return; }
      if (k === "ArrowUp") { e.preventDefault(); setActive(Math.max(0, active - 1)); return; }
      if (k === "Home") { e.preventDefault(); setActive(0); return; }
      if (k === "End") { e.preventDefault(); setActive(rows.length - 1); return; }
      if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        /* ricerca a prima lettera: il comportamento che le dita hanno gia' */
        typed += k.toLowerCase();
        if (typedTimer) clearTimeout(typedTimer);
        typedTimer = setTimeout(function () { typed = ""; }, 700);
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].querySelector(".select-label").textContent.toLowerCase().indexOf(typed) === 0) {
            setActive(i);
            break;
          }
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (open && !wrap.contains(e.target)) setOpen(false);
    });

    /* la label punta ancora alla select nativa, che ora e' nascosta: il clic
       sulla label deve portare al grilletto, non nel vuoto */
    if (lbl) lbl.addEventListener("click", function (e) { e.preventDefault(); trigger.focus(); });

    /* qualsiasi cosa cambi la select nativa (scelta, reset del form, autofill) */
    native.addEventListener("change", paint);
    if (native.form) native.form.addEventListener("reset", function () { setTimeout(paint, 0); });
    paint();
  });

  /* Header: bordo/ombra dopo lo scroll + nascondi scendendo, ricompare salendo */
  var header = document.querySelector(".site-header");
  if (header) {
    var lastScrollY = window.scrollY;
    var onScroll = function () {
      var currentY = window.scrollY;
      header.classList.toggle("is-scrolled", currentY > 8);
      if (!mobileNav || !mobileNav.classList.contains("open")) {
        var scrollingDown = currentY > lastScrollY;
        header.classList.toggle("is-hidden", scrollingDown && currentY > 120);
      }
      lastScrollY = currentY;
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    window.requestAnimationFrame(onScroll);
  }


  /* ============================================================
     PALCO VIDEO — due fogli sovrapposti
     ------------------------------------------------------------
     Il video e l'hero occupano la stessa cella dello schermo: il
     video sta sotto, fermo, presente dall'inizio; l'hero è un
     foglio opaco appoggiato sopra. Scorrendo non scende la pagina
     — il pin è position:sticky, la navigazione resta ferma — si
     solleva il foglio superiore e scopre quello che c'era sotto.

       SOLLEVAMENTO  l'hero trasla verso l'alto di una schermata
                     intera. Il suo contenuto svanisce più in
                     fretta del foglio, su una curva il cui
                     esponente si abbassa con la velocità di
                     scroll: scrollata decisa -> sparisce quasi
                     subito, lenta -> sfuma.
       PARALLASSE    il foglio inferiore accompagna con uno scarto
                     (48px e 2% di scala): è lo scarto fra i due
                     piani a dare la profondità, non un movimento
                     proprio del video.
       PERMANENZA    a foglio sollevato il pin tiene ancora quasi
                     una schermata di scroll: il tempo di guardare.

     Tutto passa da un solo rAF: gli handler di scroll alzano solo
     una bandierina.
     ============================================================ */
  var stageSeq = document.querySelector(".stage-seq");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (stageSeq) {
    var media = stageSeq.querySelector("[data-stage-video]");
    var sheet = stageSeq.querySelector("[data-hero-sheet]");
    var heroLayer = stageSeq.querySelector("[data-hero-parallax]");
    var videoLayer = stageSeq.querySelector("[data-stage-video-layer]");
    var audioBtn = stageSeq.querySelector("[data-stage-audio]");
    var playBtn = stageSeq.querySelector("[data-stage-play]");

    /* `userMuted` è la scelta esplicita del visitatore e vince sempre
       sull'automatismo. `gestured` esiste perché i browser rifiutano
       l'audio finché la pagina non ha ricevuto un'interazione: prima di
       quella il video resta muto e il controllo è lì a dirlo. */
    var gestured = false;
    var userMuted = false;
    /* Gemello di `userMuted`: la pausa chiesta dal visitatore è una scelta,
       non uno stato momentaneo, e sopravvive all'uscita dalla sezione. */
    var userPaused = false;
    var wantAudio = false;
    var fadeRaf = null;
    var FADE_MS = 400;
    var LIFT = 0.6; /* quota di schermata su cui il foglio si solleva */

    var ticking = false;
    var lastY = window.scrollY;
    var velocity = 0;
    var revealed = false;
    var lifting = false;
    /* Finche' e' false il filmato non viene nemmeno richiesto al server.
       Nome esplicito: `armed` da solo collideva con l'omonima variabile del
       bottone "Pulisci il modulo", che vive nella stessa IIFE ed e' quindi
       la stessa variabile per via dello scope di `var`. */
    var videoArmed = false;
    var stillTimer = null;

    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var stacking = function () { return !reduceMotion.matches; };

    /* ---------- audio in dissolvenza ---------- */
    function fadeAudio(to) {
      if (fadeRaf) cancelAnimationFrame(fadeRaf);
      var from = media.muted ? 0 : media.volume;
      if (to > 0) {
        media.volume = from;
        media.muted = false;
        /* play() può essere rifiutato: in quel caso si resta muti e il
           controllo continua a proporre "Attiva audio". */
        if (!userPaused) {
          var pr = media.play();
          if (pr && pr.catch) pr.catch(function () { media.muted = true; paintAudioBtn(); });
        }
      }
      var t0 = performance.now();
      var step = function (now) {
        var k = clamp((now - t0) / FADE_MS, 0, 1);
        media.volume = from + (to - from) * k;
        if (k < 1) { fadeRaf = requestAnimationFrame(step); }
        else { fadeRaf = null; if (to === 0) media.muted = true; paintAudioBtn(); }
      };
      fadeRaf = requestAnimationFrame(step);
      paintAudioBtn();
    }

    function paintAudioBtn() {
      if (!audioBtn) return;
      var on = !media.muted && media.volume > 0.02;
      audioBtn.classList.toggle("is-on", on);
      /* Il controllo è solo icona: l'unico posto in cui l'azione resta detta
         a parole è il nome accessibile. */
      audioBtn.setAttribute("aria-label", on ? "Disattiva audio" : "Attiva audio");
    }

    function paintPlayBtn() {
      var paused = media.paused;
      stageSeq.classList.toggle("is-paused", paused);
      if (playBtn) playBtn.setAttribute("aria-label", paused ? "Riprendi il video" : "Metti in pausa il video");
    }

    function syncAudio() {
      var should = revealed && gestured && !userMuted;
      if (should === wantAudio) return;
      wantAudio = should;
      fadeAudio(should ? 1 : 0);
    }

    /* Decodificare il video mentre è fuori schermo non serve a nessuno e su
       mobile costa batteria. */
    function syncPlayback(near) {
      /* Con preload="none" il file non parte finché non lo si chiede: il
         primo play() È il download. Il palco è in cima alla pagina, quindi
         "vicino allo schermo" è vero già al primo paint — bastava quello per
         far scaricare il filmato a chiunque aprisse la pagina, anche a chi
         non scorreva mai fin lì. Finché il foglio-hero non comincia a
         sollevarsi si guarda il poster, che pesa meno di 2 KB. */
      if (!videoArmed) return;
      if (document.hidden || !near) { if (!media.paused) media.pause(); }
      /* L'automatismo lavora in una direzione sola: può fermare il video
         fuori schermo, non può annullare una pausa chiesta a mano. */
      else if (media.paused && !userPaused) { var pr = media.play(); if (pr && pr.catch) pr.catch(function () {}); }
    }

    /* Il video si arma alla prima intenzione reale di guardarlo: il foglio
       che inizia a sollevarsi, o — dove il palco non impila — l'inquadratura
       che entra per davvero nello schermo. Un tocco sul frame lo arma comunque
       (vedi il gestore di .stage-play più sotto). */
    function armVideo() {
      if (videoArmed) return;
      videoArmed = true;
      if (media.preload === "none") media.preload = "auto";
    }

    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      var seqRect = stageSeq.getBoundingClientRect();

      if (stacking()) {
        /* Progresso del sollevamento, misurato da quanto il palco è già
           scorso sotto il bordo alto dello schermo. */
        var lifted = clamp(-seqRect.top / (vh * LIFT), 0, 1);
        var boost = clamp(velocity / 70, 0, 1);
        var fade = Math.pow(lifted, 1 - 0.55 * boost);

        sheet.style.transform = "translate3d(0," + (-lifted * 100).toFixed(3) + "%,0)";
        sheet.style.visibility = lifted >= 0.999 ? "hidden" : "";
        heroLayer.style.opacity = String(1 - fade);
        heroLayer.style.transform = "translate3d(0," + (-fade * 60).toFixed(2) + "px,0)";

        /* Il foglio inferiore accompagna con uno scarto: è la differenza
           fra i due piani a leggersi come profondità. */
        videoLayer.style.transform = "translate3d(0," + ((1 - lifted) * 48).toFixed(2) + "px,0) scale(" + (0.98 + 0.02 * lifted).toFixed(4) + ")";

        if (lifted > 0.02) armVideo();
        stageSeq.classList.toggle("is-revealing", lifted > 0.5);

        var nowLifting = lifted > 0.001 && lifted < 0.999;
        if (nowLifting !== lifting) {
          lifting = nowLifting;
          sheet.classList.toggle("is-lifting", lifting);
        }

        var nowRevealed = lifted > 0.9 && seqRect.bottom > vh * 0.75;
        if (nowRevealed !== revealed) { revealed = nowRevealed; syncAudio(); }
        syncPlayback(seqRect.top < vh && seqRect.bottom > 0);
      } else {
        /* In sequenza normale "il video ha lo schermo" si misura su quanto
           del media è effettivamente visibile. */
        var mr = media.getBoundingClientRect();
        var shown = Math.max(0, Math.min(mr.bottom, vh) - Math.max(mr.top, 0));
        if (mr.height > 0 && shown / mr.height > 0.25) armVideo();
        var nowRevealed2 = mr.height > 0 && shown / mr.height > 0.6;
        if (nowRevealed2 !== revealed) { revealed = nowRevealed2; syncAudio(); }
        syncPlayback(mr.top < vh * 1.5 && mr.bottom > -vh * 0.5);
      }
    }

    function onStageScroll() {
      var y = window.scrollY;
      /* media mobile esponenziale: assorbe i singoli scatti di rotellina
         senza perdere la reattività di una scrollata decisa */
      velocity = velocity * 0.7 + Math.abs(y - lastY) * 0.3;
      lastY = y;

      if (heroLayer) heroLayer.classList.add("is-moving");
      clearTimeout(stillTimer);
      stillTimer = setTimeout(function () {
        velocity = 0;
        if (heroLayer) heroLayer.classList.remove("is-moving");
      }, 220);

      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }

    document.addEventListener("scroll", onStageScroll, { passive: true });
    window.addEventListener("resize", onStageScroll, { passive: true });

    /* Primo gesto qualsiasi sulla pagina: da qui in poi il browser accetta
       l'audio e il palco può accenderlo da solo scoprendo il video. */
    var gestureEvents = ["pointerdown", "keydown", "touchstart", "wheel"];
    var onFirstGesture = function () {
      gestured = true;
      syncAudio();
      gestureEvents.forEach(function (e) { document.removeEventListener(e, onFirstGesture); });
    };
    gestureEvents.forEach(function (e) { document.addEventListener(e, onFirstGesture, { passive: true }); });

    if (audioBtn) {
      audioBtn.addEventListener("click", function (ev) {
        /* Il controllo sta dentro l'inquadratura, che è a sua volta un
           pulsante: senza questo, alzare l'audio fermerebbe il video. */
        ev.stopPropagation();
        gestured = true;
        if (!media.muted && media.volume > 0.02) { userMuted = true; wantAudio = false; fadeAudio(0); }
        else { userMuted = false; wantAudio = true; fadeAudio(1); }
      });
    }

    /* Tocco sull'inquadratura: ferma e riprende. */
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        gestured = true;
        /* Toccare l'inquadratura è la richiesta più esplicita che esista:
           se il file non è ancora stato chiesto al server, si parte da qui. */
        armVideo();
        if (media.paused) {
          userPaused = false;
          var pr = media.play();
          if (pr && pr.catch) pr.catch(function () {});
        } else {
          userPaused = true;
          media.pause();
        }
      });
    }

    /* Lo stato si dipinge dagli eventi del media, non dal click: così il
       glifo resta vero anche quando a fermare il video sono lo scroll, la
       scheda in secondo piano o un play() rifiutato dal browser. */
    media.addEventListener("play", paintPlayBtn);
    media.addEventListener("pause", paintPlayBtn);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (!media.paused) media.pause(); }
      else onStageScroll();
    });

    /* Se il visitatore chiede meno movimento a metà sessione, il palco si
       smonta senza lasciare in giro transform residui. */
    var onLayoutPref = function () {
      if (!stacking()) {
        stageSeq.classList.remove("is-revealing");
        sheet.style.transform = ""; sheet.style.visibility = "";
        sheet.classList.remove("is-lifting");
        heroLayer.style.opacity = ""; heroLayer.style.transform = "";
        videoLayer.style.transform = "";
        lifting = false;
      }
      onStageScroll();
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onLayoutPref);

    /* Video assente (le pagine servizio che non hanno ancora il loro file):
       il palco passa allo stato "in arrivo" invece di scoprire un rettangolo
       bianco su fondo bianco. */
    var markMissing = function () { stageSeq.classList.add("is-video-missing"); };
    media.addEventListener("error", markMissing);
    var srcEl = media.querySelector("source");
    if (srcEl) srcEl.addEventListener("error", markMissing);
    if (media.networkState === 3) markMissing();

    media.volume = 0;
    paintAudioBtn();
    paintPlayBtn();
    requestAnimationFrame(frame);
  }


  /* ---------- Lastra di apertura: immagine non ancora fornita ----------
     Le sette pagine servizio senza video dichiarano gia'
     ../assets/servizi/<slug>.jpg. Finche' il file non c'e', il browser
     disegnerebbe l'icona di immagine rotta sopra il pannello "in arrivo"
     che sta sotto: l'<img> che fallisce viene tolta e resta la sola
     dicitura mono. Nella direzione che conta il degrado e' corretto — con
     il file al suo posto la pagina funziona anche senza questo script. */
  document.querySelectorAll(".claim-figure img").forEach(function (img) {
    var drop = function () { if (img.parentNode) img.parentNode.removeChild(img); };
    img.addEventListener("error", drop);
    if (img.complete && img.naturalWidth === 0) drop();
  });


  /* ---------- Mappa topografica interattiva ----------
     Il rilievo esiste già: il cursore non lo disegna, lo scopre. Una scia
     morbida fa da maschera e si richiude da sé dopo ~0.9s, così la carta
     resta un accenno di profondità e non un effetto che chiede attenzione.
     Portata dal canvas di design "Home - Hero" (valori impostati lì:
     intensity .6, levels 21, revealSize 100). Si attacca a [data-topo]:
     hero della home e banda CTA finale delle pagine servizio. */
  var topoHosts = document.querySelectorAll("[data-topo]");
  if (topoHosts.length &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    topoHosts.forEach(function (host) { initTopo(host); });
  }

  function topoSeg(c, p1, p2) { c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); }

  function initTopo(host) {
    var cv = document.createElement("canvas");
    cv.className = "topo-canvas";
    cv.setAttribute("aria-hidden", "true");
    host.insertBefore(cv, host.firstChild);

    var ctx = cv.getContext("2d");
    var INTENSITY = 0.6;   /* opacita' massima della carta */
    var LEVELS = 21;       /* curve di livello per lato */
    var BRUSH = 100;       /* raggio del pennello che svela (px) */
    var CELL = 9;          /* passo di campionamento del rilievo (px) */
    var TRAIL = 900;       /* durata della scia (ms) */
    var PAD = 220;         /* la mappa esiste anche oltre i bordi del blocco */

    var map = document.createElement("canvas");
    var mctx = map.getContext("2d");
    var mask = document.createElement("canvas");
    var kctx = mask.getContext("2d");

    var W = 0, H = 0, dpr = 1;

    /* Seme fisso: la stessa carta a ogni caricamento e su ogni pagina. */
    var seed = 20260830;
    var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var seeds = [];
    for (var s = 0; s < 22; s++) {
      seeds.push({ fx: rnd(), fy: rnd(), fr: 0.16 + rnd() * 0.34, a: 0.55 + rnd() * 0.9, s: rnd() < 0.5 ? -1 : 1 });
    }

    function buildMap() {
      var w = W + PAD * 2, h = H + PAD * 2;
      map.width = Math.round(w * dpr);
      map.height = Math.round(h * dpr);
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, w, h);

      var cols = Math.ceil(w / CELL) + 1, rows = Math.ceil(h / CELL) + 1;
      var grid = new Float32Array(cols * rows);
      var base = Math.max(w, h);
      var max = 0, i, j;
      for (var k = 0; k < seeds.length; k++) {
        var sd = seeds[k];
        var cx = sd.fx * w, cy = sd.fy * h, rad = sd.fr * base * 0.55, r2 = rad * rad;
        var i0 = Math.max(0, Math.floor((cx - rad) / CELL)), i1 = Math.min(cols - 1, Math.ceil((cx + rad) / CELL));
        var j0 = Math.max(0, Math.floor((cy - rad) / CELL)), j1 = Math.min(rows - 1, Math.ceil((cy + rad) / CELL));
        for (j = j0; j <= j1; j++) {
          var dy = j * CELL - cy;
          for (i = i0; i <= i1; i++) {
            var dx = i * CELL - cx;
            var d2 = (dx * dx + dy * dy) / r2;
            if (d2 < 1) { var f = 1 - d2; grid[j * cols + i] += sd.s * sd.a * f * f; }
          }
        }
      }
      for (i = 0; i < grid.length; i++) { var v = Math.abs(grid[i]); if (v > max) max = v; }
      if (max <= 0) max = 1;

      var interp = function (v1, v2, t) { return (t - v1) / (v2 - v1 || 1e-6); };
      mctx.lineCap = "round";
      for (var l = 1; l <= LEVELS * 2; l++) {
        var t = (l - LEVELS) * (max / LEVELS) * 0.92;
        if (Math.abs(t) < 1e-4) continue;
        var idx = l % 5 === 0;                     /* curva direttrice, come su una carta */
        mctx.strokeStyle = idx ? "rgba(1,73,124,.60)" : "rgba(1,73,124,.34)";
        mctx.lineWidth = idx ? 1.25 : 1;
        mctx.beginPath();
        for (j = 0; j < rows - 1; j++) {
          for (i = 0; i < cols - 1; i++) {
            var a = grid[j * cols + i], b = grid[j * cols + i + 1];
            var c = grid[(j + 1) * cols + i + 1], d = grid[(j + 1) * cols + i];
            var m = 0;
            if (a > t) m |= 1;
            if (b > t) m |= 2;
            if (c > t) m |= 4;
            if (d > t) m |= 8;
            if (m === 0 || m === 15) continue;
            var x0 = i * CELL, y0 = j * CELL, x1 = x0 + CELL, y1 = y0 + CELL;
            var T = [x0 + CELL * interp(a, b, t), y0];
            var R = [x1, y0 + CELL * interp(b, c, t)];
            var B = [x0 + CELL * interp(d, c, t), y1];
            var L = [x0, y0 + CELL * interp(a, d, t)];
            switch (m) {
              case 1: case 14: topoSeg(mctx, L, T); break;
              case 2: case 13: topoSeg(mctx, T, R); break;
              case 3: case 12: topoSeg(mctx, L, R); break;
              case 4: case 11: topoSeg(mctx, R, B); break;
              case 6: case 9:  topoSeg(mctx, T, B); break;
              case 7: case 8:  topoSeg(mctx, L, B); break;
              case 5: topoSeg(mctx, L, T); topoSeg(mctx, R, B); break;
              case 10: topoSeg(mctx, T, R); topoSeg(mctx, L, B); break;
            }
          }
        }
        mctx.stroke();
      }
    }

    /* Misura auto-riparante: se al primo giro il blocco non e' ancora
       impaginato (larghezza 0) la si ripiglia al primo frame utile, invece
       di restare con un canvas 1x1 per sempre. */
    function resize() {
      var r = host.getBoundingClientRect();
      var nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      var ndpr = Math.min(2, window.devicePixelRatio || 1);
      if (nw === W && nh === H && ndpr === dpr) return;
      W = nw; H = nh; dpr = ndpr;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      mask.width = cv.width; mask.height = cv.height;
      if (W > 1 && H > 1) buildMap();
    }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
    window.addEventListener("resize", resize);
    window.addEventListener("load", resize);

    var px = W / 2, py = H / 2;   /* cursore */
    var fx = px, fy = py;         /* inseguitore con inerzia */
    var lastMove = -1e9, inside = false, fade = 0, dropX = -1e5, dropY = -1e5;
    var trail = [];
    var raf = null;

    var onMove = function (e) {
      var b = host.getBoundingClientRect();
      px = e.clientX - b.left; py = e.clientY - b.top;
      inside = true; lastMove = performance.now();
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerenter", function (e) { onMove(e); fx = px; fy = py; }, { passive: true });
    host.addEventListener("pointerleave", function () { inside = false; }, { passive: true });

    /* Il rAF gira solo quando il blocco e' a schermo: la banda CTA sta in
       fondo alla pagina e non deve consumare un frame per tutto lo scroll. */
    function play() { if (!raf) raf = requestAnimationFrame(tick); }
    function pause() {
      if (raf) cancelAnimationFrame(raf);
      raf = null; inside = false; fade = 0; trail.length = 0;
      cv.style.opacity = "0";
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[entries.length - 1].isIntersecting) play(); else pause();
      }).observe(host);
    } else {
      play();
    }

    var frame = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      var now = performance.now();
      if (W <= 1 || H <= 1 || frame % 30 === 0) resize();
      frame++;
      if (W <= 1 || H <= 1) return;
      var moving = inside && now - lastMove < 130;
      fade += ((moving ? 1 : 0) - fade) * (moving ? 0.08 : 0.02);

      /* Inerzia: l'inseguitore arriva sul cursore in ~0.4s, senza scatti. */
      fx += (px - fx) * 0.11;
      fy += (py - fy) * 0.11;

      var dx = fx - dropX, dy = fy - dropY;
      if (moving && dx * dx + dy * dy > 25) { trail.push({ x: fx, y: fy, t: now }); dropX = fx; dropY = fy; }
      if (moving) trail.push({ x: fx, y: fy, t: now, soft: true });
      while (trail.length && now - trail[0].t > TRAIL) trail.shift();
      if (trail.length > 240) trail.splice(0, trail.length - 240);

      cv.style.opacity = Math.min(1, fade * INTENSITY).toFixed(3);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (fade < 0.004 || !trail.length) return;

      /* Maschera morbida: la scia svela la mappa e si richiude da se'. */
      kctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      kctx.clearRect(0, 0, W, H);
      kctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < trail.length; i++) {
        var p = trail[i];
        var age = (now - p.t) / TRAIL;
        if (age >= 1) continue;
        var e = 1 - age;
        var alpha = (p.soft ? 0.14 : 0.30) * e * e;
        var r = BRUSH * (0.55 + 0.45 * e);
        var g = kctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, "rgba(255,255,255," + alpha.toFixed(3) + ")");
        g.addColorStop(0.6, "rgba(255,255,255," + (alpha * 0.45).toFixed(3) + ")");
        g.addColorStop(1, "rgba(255,255,255,0)");
        kctx.fillStyle = g;
        kctx.beginPath();
        kctx.arc(p.x, p.y, r, 0, 6.2832);
        kctx.fill();
      }
      kctx.globalCompositeOperation = "source-over";

      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      /* Leggera parallasse della carta: profondita' senza movimento evidente. */
      var ox = -PAD + (0.5 - px / Math.max(1, W)) * 26;
      var oy = -PAD + (0.5 - py / Math.max(1, H)) * 26;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(map, 0, 0, map.width, map.height, ox, oy, W + PAD * 2, H + PAD * 2);
      ctx.globalCompositeOperation = "source-over";
    }
  }

})();
