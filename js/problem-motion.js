/* Varco — problem-motion.js — animazione GSAP dedicata alla sezione
   #trasformazione (index.html): le 4 card di "In cosa possiamo aiutarti" che
   entrano in sequenza. La roadmap sotto (.route-wrap) è gestita interamente
   da js/main.js — non da questo file. Isolato da main.js apposta: main.js
   resta senza librerie esterne (vedi la sua intestazione), questo file è
   l'unico punto del sito che dipende da GSAP + ScrollTrigger (caricati via
   CDN in index.html, cdnjs). Se quella dipendenza manca o l'utente ha
   impostato prefers-reduced-motion, questo script non fa nulla: il markup
   della sezione parte già leggibile e fermo (nessun opacity:0 in CSS),
   l'animazione è solo un'aggiunta via JS, mai una condizione per vedere il
   contenuto. */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- riga "in cosa possiamo aiutarti": ingresso a cascata ----------
     Un solo passaggio quando la riga entra in viewport (non scrub, non si
     ripete tornando indietro) — l'etichetta e le 4 card salgono e appaiono
     una dopo l'altra, stesso carattere "preciso e strumentato" del resto del
     sistema: nessun bounce, easing in uscita. */
  var helpRow = document.querySelector(".problem-help");
  if (helpRow) {
    var helpEls = helpRow.querySelectorAll(".problem-help-label, .problem-item");
    if (helpEls.length) {
      gsap.set(helpEls, { opacity: 0, y: 18 });
      gsap.to(helpEls, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.09,
        scrollTrigger: {
          trigger: helpRow,
          start: "top 82%",
          toggleActions: "play none none none"
        }
      });
    }
  }
})();
