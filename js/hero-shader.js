/* ==========================================================================
   hero-shader.js — campo shader dietro le hero delle pagine servizio
   --------------------------------------------------------------------------
   Deroga deliberata a MOTION_SYSTEM.md §4.4 ("niente camera che si muove da
   sola") e alla regola "flat by default" di DESIGN.md. NON e' deriva: e'
   registrata in entrambi i documenti. Chi la trova in una passata di
   manutenzione legga quelle note prima di rimuoverla.

   Porting vanilla del componente "Silk" del 21st.dev Shader Builder. Rispetto
   all'originale React qui sono stati TOLTI, non disattivati:
     - tutta la reattivita' al cursore (uniform, branch GLSL, e i quattro
       listener su window fra cui lo `scroll` in capture che chiamava
       getBoundingClientRect() a ogni evento: sulle quattro pagine con il
       palco video quello scroll guida gia' il pin sticky);
     - il domain warp e il suo fbm/noise/hash (u_warp era 0);
     - la conversione OKLab (u_oklab era 0);
     - hue rotate, vignette, contrast, brightness, saturation (tutti neutri).
   Restano solo palette, shade, sfocatura a 5 campioni e grana.

   VINCOLO DI CONTRASTO — il numero che governa tutta la palette.
   Il testo piu' debole sopra il campo e' la .lede in --bone-dim (#5A5A5A,
   L = 0.1022). Per tenere 4.5:1 il fondo non puo' scendere sotto L = 0.635.
   La tinta piu' scura della palette e' il 20% di --traccia (#01497C) su
   bianco = #CCDBE5, L = 0.691 -> 4.87:1. Nel caso peggiore di grana
   (-0.0245 per canale) resta L = 0.645 -> 4.57:1. Il contrasto e' quindi
   garantito per costruzione, in ogni punto e in ogni fotogramma: non serve
   nessuno scrim bianco sotto il testo, e non c'e' nessuno scrim che possa
   rompersi. Se qualcuno scurisce una di queste quattro tinte, rifaccia
   il conto prima.

   Convive con la mappa topografica di main.js (initTopo, [data-topo]): quella
   sta nella banda CTA in fondo alla stessa pagina, un'altezza di schermo piu'
   giu'. Entrambi i canvas si fermano fuori campo, quindi non disegnano mai
   nello stesso fotogramma.
   ========================================================================== */
(function () {
  "use strict";

  var VERT =
    "attribute vec2 a_position;" +
    "void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }";

  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",

    "uniform vec3 u_colors[4];",
    "uniform vec4 u_scene;", // resolution.xy, time, scale
    "uniform vec4 u_look;",  // intensity, seed, dissolvenza alta (px), —

    "#define u_resolution u_scene.xy",
    "#define u_time u_scene.z",
    "#define u_scale u_scene.w",
    "#define u_intensity u_look.x",
    "#define u_fadeTop u_look.z",
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "#define u_seed u_look.y",
    "#else",
    // mediump garantisce solo +/-2^14: tiene l'ingresso dell'hash nel range.
    "#define u_seed mod(u_look.y, 31.0)",
    "#endif",

    "const float BLUR = 0.008;",
    "const float GRAIN = 0.049;",
    // Dissolvenza a bianco sul bordo inferiore: la hairline .service-hero e il
    // bordo del foglio del palco devono appoggiarsi su bianco pieno, come oggi.
    "const float FADE_BOTTOM = 0.16;",

    // Hash uniforme (Dave Hoskins hash12). La grana NON e' decorazione: su un
    // intervallo di luminanza cosi' stretto (0.80 -> 1.00) un gradiente a 8 bit
    // fascia visibilmente. Questo e' il dithering che lo impedisce.
    "float grainHash(vec2 p){",
    "  vec3 p3 = fract(vec3(p.xyx) * 0.1031);",
    "  p3 += dot(p3, p3.yzx + 33.33);",
    "  return fract((p3.x + p3.y) * p3.z);",
    "}",

    // WebGL1 vieta l'indicizzazione dinamica degli uniform nel fragment
    // shader: quattro tinte, tre mix srotolati.
    "vec3 palette(float x){",
    "  float f = clamp(x, 0.0, 1.0) * 3.0;",
    "  vec3 col = u_colors[0];",
    "  col = mix(col, u_colors[1], smoothstep(0.0, 1.0, clamp(f, 0.0, 1.0)));",
    "  col = mix(col, u_colors[2], smoothstep(0.0, 1.0, clamp(f - 1.0, 0.0, 1.0)));",
    "  col = mix(col, u_colors[3], smoothstep(0.0, 1.0, clamp(f - 2.0, 0.0, 1.0)));",
    "  return col;",
    "}",

    "vec3 shade(vec2 p, float t){",
    "  vec2 q = p * 1.6;",
    "  float amp = 0.25 + u_intensity * 0.85;",
    "  for (int i = 1; i < 5; i++){",
    "    float fi = float(i);",
    "    q.x += amp / fi * cos(fi * 2.4 * q.y + t * 0.8 + u_seed);",
    "    q.y += amp / fi * cos(fi * 1.7 * q.x + t * 0.6);",
    "  }",
    "  return palette(0.5 + 0.5 * sin(q.x + q.y));",
    "}",

    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution)",
    "    / min(u_resolution.x, u_resolution.y);",
    "  p *= u_scale;",
    "  float pe = BLUR * u_scale;",
    "  vec3 col  = shade(p, u_time) * 0.36;",
    "  col += shade(p + vec2(pe, 0.0), u_time) * 0.16;",
    "  col += shade(p - vec2(pe, 0.0), u_time) * 0.16;",
    "  col += shade(p + vec2(0.0, pe), u_time) * 0.16;",
    "  col += shade(p - vec2(0.0, pe), u_time) * 0.16;",
    // Due dissolvenze. In basso, perche' il filo dell'hero si appoggi su bianco.
    // In alto, perche' `.site-header` e' una barra bianca OPACA alta 84.8px: senza,
    // il campo comincia con un taglio netto sotto di essa. Cosi' il campo emerge
    // da sotto l'header invece di sbatterci contro.
    "  float fade = smoothstep(0.0, FADE_BOTTOM, gl_FragCoord.y / u_resolution.y)",
    "    * smoothstep(0.0, u_fadeTop, u_resolution.y - gl_FragCoord.y);",
    "  col = mix(vec3(1.0), col, fade);",
    // La grana segue la dissolvenza: sul filo inferiore il bianco resta pulito.
    "  col += (grainHash(gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0))",
    "    - 0.5) * GRAIN * fade;",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  /* Palette: bianco -> 20% di --traccia (#01497C) su bianco. Vedi il vincolo
     di contrasto in testa al file prima di toccare questi numeri. */
  var COLORS = new Float32Array([
    0.980, 0.986, 0.990,  // 2%  su bianco
    0.930, 0.950, 0.964,  // 7%
    0.860, 0.900, 0.928,  // 14%
    0.801, 0.857, 0.897   // 20% -> #CCDBE5, la tinta piu' scura ammessa
  ]);

  var SCALE = 1.26;
  var INTENSITY = 0.28;
  var SEED = 1581.0;
  /* 0.29 nell'originale. Qui la deriva deve stare sotto la soglia di
     percezione a colpo d'occhio: il campo respira, non si muove. */
  var TIME_SCALE = 0.10;
  /* Fotogramma unico mostrato con prefers-reduced-motion — il "poster" di
     MOTION_SYSTEM.md §5: si mostra quello, non un loop rallentato. */
  var POSTER_TIME = 12.0;

  /* Altezza della dissolvenza alta, in px CSS: poco piu' dell'header opaco
     (84.8px) cosi' il campo emerge da sotto la barra invece di tagliarsi. */
  var FADE_TOP_CSS = 120;

  var MAX_DPR = 1.5;
  var MAX_PIXELS = 1600000;

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  function mount(canvas) {
    /* alpha:false -> il canvas e' opaco. Sulle quattro pagine con il palco
       video questo non e' un dettaglio: il foglio dell'hero deve restare
       opaco o il video sottostante trasparirebbe prima del sollevamento. */
    var gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power"
    });
    /* Senza WebGL il canvas resta vuoto e il background del genitore mostra
       l'hero di oggi, identica. Stessa onesta' del fallback video e immagine. */
    if (!gl) return;

    // Prima di qualunque disegno: bianco, mai il nero di default di alpha:false.
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = gl.createProgram();
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    var loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uColors = gl.getUniformLocation(program, "u_colors");
    var uScene = gl.getUniformLocation(program, "u_scene");
    var uLook = gl.getUniformLocation(program, "u_look");
    gl.uniform3fv(uColors, COLORS);

    var raf = 0;
    var start = 0;
    var clock = 0;
    var visible = document.visibilityState === "visible";
    var inView = true;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* La misura in px CSS e' tenuta in cache e aggiornata SOLO dal
       ResizeObserver, che la porta gia' pronta in `contentRect`. Misurare nel
       loop costringerebbe il browser a un layout per fotogramma: e' lo stesso
       difetto per cui e' stato tolto lo `scroll` listener dell'originale. */
    var cssW = 0, cssH = 0, fadeTopPx = FADE_TOP_CSS;

    function applySize() {
      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var w = Math.max(1, Math.round(cssW * dpr));
      var h = Math.max(1, Math.round(cssH * dpr));
      var k = Math.min(1, Math.sqrt(MAX_PIXELS / Math.max(1, w * h)));
      w = Math.max(1, Math.round(w * k));
      h = Math.max(1, Math.round(h * k));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      // La dissolvenza alta e' definita in px CSS: convertita nella scala del
      // buffer resta alta uguale a qualunque DPR o tetto di risoluzione.
      fadeTopPx = FADE_TOP_CSS * (cssH > 0 ? h / cssH : 1);
    }

    // Unica lettura di layout del modulo, prima del primo disegno.
    function measure() {
      var r = canvas.getBoundingClientRect();
      cssW = r.width;
      cssH = r.height;
      applySize();
    }

    function draw(t) {
      gl.uniform4f(uLook, INTENSITY, SEED, fadeTopPx, 0.0);
      gl.uniform4f(uScene, canvas.width, canvas.height, t, SCALE);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      raf = 0;
      if (!visible || !inView || reduce.matches) return;
      // `clock` sopravvive alla pausa: rientrando in campo si riancora l'origine
      // al tempo gia' accumulato, cosi' il campo riprende da dove si era
      // fermato invece di saltare all'inizio.
      if (!start) start = now - (clock / TIME_SCALE) * 1000;
      clock = ((now - start) / 1000) * TIME_SCALE;
      draw(clock);
      raf = window.requestAnimationFrame(frame);
    }

    function play() {
      if (reduce.matches) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        draw(POSTER_TIME);
        return;
      }
      if (!raf && visible && inView) raf = window.requestAnimationFrame(frame);
    }

    function pause() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      start = 0;
    }

    // Primo fotogramma sincrono: nessun lampo al primo paint.
    measure();
    draw(reduce.matches ? POSTER_TIME : 0);

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(function (entries) {
        var r = entries[0] && entries[0].contentRect;
        if (r) {
          cssW = r.width;
          cssH = r.height;
          applySize();
        } else {
          measure();
        }
        // A loop fermo (fuori campo, o reduced motion) il ridimensionamento
        // e' l'unica cosa che puo' ridisegnare.
        if (!raf) draw(reduce.matches ? POSTER_TIME : clock);
      }).observe(canvas);
    }

    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(function (entries) {
        inView = entries[0] ? entries[0].isIntersecting : true;
        if (inView) play();
        else pause();
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", function () {
      visible = document.visibilityState === "visible";
      if (visible) play();
      else pause();
    });

    if (reduce.addEventListener) {
      reduce.addEventListener("change", function () {
        pause();
        play();
      });
    }

    play();
  }

  var nodes = document.querySelectorAll("[data-hero-shader]");
  for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
})();
