/*
 * lorem.lorel.lol — motore di generazione.
 *
 * Motore puro: nessun DOM, nessuna rete, nessuna dipendenza, nessun log.
 * Espone un modulo CommonJS e, quando caricato con <script>, il globale
 * `LoremEngine` (vedi docs/CONTRATTO-DATI.md).
 *
 * I corpora arrivano da data/themes.js, che espone `window.LOREM_THEMES`.
 * Il motore lo legge al momento della chiamata, così l'ordine dei due
 * <script> non conta.
 *
 * API:
 *   LoremEngine.themes() -> [{ id, label, lang, about }]
 *   LoremEngine.generate({ theme, unit, count, html, markdown, json,
 *                          seed, startClassic, lang, logogram })
 *     -> { text, meta: { theme, unit, count, sentences, words } }
 *        con logogram:true -> { text: "<svg…>", meta: { theme,
 *                              unit: "logograms", count, glyphs, words: 0 } }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LoremEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Costanti                                                          */
  /* ---------------------------------------------------------------- */

  /* Intervalli ammessi per `count`, come da contratto. */
  var UNIT_RANGES = {
    paragraphs: { min: 1, max: 12, label: "paragrafi", fallback: 3 },
    sentences: { min: 1, max: 50, label: "frasi", fallback: 3 },
    words: { min: 1, max: 500, label: "parole", fallback: 30 }
  };

  /* Connettivi per lingua: vengono anteposti ad alcune frasi dei paragrafi
   * per variare il ritmo. Le frasi dei corpora iniziano sempre con una
   * parola comune, quindi abbassare la maiuscola è sicuro. */
  var CONNECTORS = {
    it: [
      "Inoltre,", "Tuttavia,", "D'altra parte,", "Per di più,",
      "In effetti,", "A quel punto,", "Nel frattempo,", "Insomma,",
      "Dopotutto,", "In fondo,", "Del resto,", "Soprattutto,"
    ],
    la: [
      "Deinde,", "Praeterea,", "Itaque,", "Interea,", "Tamen,",
      "Porro,", "Atque etiam,", "Hinc,", "Postremo,", "Nimirum,"
    ],
    neo: [
      "Dunke,", "Ma,", "E,", "Anke,", "Pos,", "Kande,", "Sempre,",
      "Nunka,", "Multe,", "Poko,"
    ]
  };

  /* Formato logogrammi: limiti e griglia. Passo di 88 unità con glifo
   * visivo di ~72: 16 unità di luce restano tra un glifo e l'altro.
   * Massimo 6 glifi per riga, padding 32, larghezza sempre sotto le
   * 1200 unità previste. Con 12 glifi il viewBox è 592×240. */
  var LOGOGRAM_RANGE = { min: 1, max: 48, label: "glifi", fallback: 12 };
  var GLYPH_PITCH = 88;
  var SVG_PADDING = 32;
  var SVG_MAX_COLUMNS = 6;
  var SVG_MAX_WIDTH = 1200;

  /* Incipit latino canonico (lorem ipsum, dal lessico di Cicerone,
   * pubblico dominio): primo paragrafo di startClassic. */
  var CLASSIC_INCIPIT =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do " +
    "eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad " +
    "minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip " +
    "ex ea commodo consequat. Duis aute irure dolor in reprehenderit in " +
    "voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

  /* Parole funzione italiane: quando una locuzione viene appiattita per
   * unit:"words" non devono uscire da sole ("latte di avena" → "latte",
   * "avena"). Restano invece legittime le voci latine del tema classico,
   * che non passano da questo filtro. */
  var WORD_STOPWORDS = {
    a: 1, ad: 1, al: 1, alla: 1, alle: 1, agli: 1, ai: 1, allo: 1,
    con: 1, da: 1, dal: 1, dalla: 1, dalle: 1, dagli: 1, dai: 1, dallo: 1,
    de: 1, del: 1, della: 1, delle: 1, degli: 1, dei: 1, dello: 1,
    di: 1, e: 1, ed: 1, fra: 1, gli: 1, i: 1, il: 1, in: 1, la: 1,
    le: 1, lo: 1, nel: 1, nella: 1, nelle: 1, negli: 1, nei: 1, nello: 1,
    o: 1, per: 1, su: 1, sul: 1, sulla: 1, sulle: 1, sugli: 1, sui: 1,
    sullo: 1, tra: 1, un: 1, una: 1, uno: 1
  };

  /* ---------------------------------------------------------------- */
  /* PRNG deterministico                                               */
  /* ---------------------------------------------------------------- */

  /* mulberry32: stesso seed, stessa sequenza. L'output non usa mai
   * valori casuali globali. */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function shuffle(list, rng) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  /* Hash FNV-1a a 32 bit: lega il disegno di un glifo alla terna
   * (seed, indice, parola), come richiesto dal contratto. */
  function hash32(text) {
    var h = 2166136261 >>> 0;
    var str = String(text);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  /* Normalizza il seed: intero, default fisso, deterministico. */
  function readSeed(value) {
    var seed = value == null ? 1 : value;
    if (typeof seed !== "number" || !isFinite(seed)) {
      throw new Error("Seed non valido: deve essere un numero intero.");
    }
    return Math.floor(seed) >>> 0;
  }

  /* Numeri con un solo decimale, senza "-0" e senza dipendere dalla
   * locale: servono per avere lo stesso SVG byte per byte. */
  function formatNumber(value) {
    var rounded = Math.round(value * 10) / 10;
    if (rounded === 0) rounded = 0;
    return String(rounded);
  }

  /* ---------------------------------------------------------------- */
  /* Utilità sul testo                                                 */
  /* ---------------------------------------------------------------- */

  function countWords(text) {
    var trimmed = String(text).trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function countSentences(text) {
    var matches = String(text).match(/[.!?]+(?=\s|$)/g);
    return matches ? matches.length : 0;
  }

  /* Abbassa la prima lettera, ma non tocca acronimi e nomi propri che
   * iniziano con due maiuscole. */
  function lowerFirst(sentence) {
    if (!sentence) return sentence;
    var first = sentence.charAt(0);
    if (first !== first.toUpperCase() || first === first.toLowerCase()) {
      return sentence;
    }
    var second = sentence.charAt(1);
    if (second && second === second.toUpperCase() && /[A-Z]/.test(second)) {
      return sentence;
    }
    return first.toLowerCase() + sentence.slice(1);
  }

  /* ---------------------------------------------------------------- */
  /* Accesso ai corpora                                                */
  /* ---------------------------------------------------------------- */

  function globalObject() {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof self !== "undefined") return self;
    if (typeof window !== "undefined") return window;
    return {};
  }

  function getCorpus() {
    var g = globalObject();
    if (g && g.LOREM_THEMES) return g.LOREM_THEMES;
    if (typeof window !== "undefined" && window.LOREM_THEMES) {
      return window.LOREM_THEMES;
    }
    return null;
  }

  function themeList(corpus) {
    var result = [];
    var keys = Object.keys(corpus);
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var theme = corpus[id];
      if (!theme || typeof theme !== "object") continue;
      if (!theme.sentences || !theme.sentences.length) continue;
      if (!theme.words || !theme.words.length) continue;
      result.push({
        id: theme.id || id,
        label: theme.label || id,
        lang: theme.lang || "it",
        about: theme.about || ""
      });
    }
    return result;
  }

  /* ---------------------------------------------------------------- */
  /* Selezione delle frasi                                             */
  /* ---------------------------------------------------------------- */

  /* Restituisce frasi in ordine mescolato senza ripetizioni ravvicinate:
   * quando il mazzo finisce viene rimescolato. */
  function createSentencePicker(rng, sentences) {
    var pool = [];
    var last = null;

    function refill() {
      pool = shuffle(sentences, rng);
    }

    return function pick() {
      if (!pool.length) refill();
      var sentence = pool.pop();
      if (sentence === last && pool.length) {
        var alt = pool[pool.length - 1];
        pool[pool.length - 1] = sentence;
        sentence = alt;
      }
      last = sentence;
      return sentence;
    };
  }

  /* ---------------------------------------------------------------- */
  /* Costruzione dei paragrafi                                         */
  /* ---------------------------------------------------------------- */

  function makeParagraph(rng, pick, lang) {
    var connectors = CONNECTORS[lang] || CONNECTORS.it;
    var total = randInt(rng, 3, 6);
    var parts = [];
    var lastWasConnector = false;

    for (var i = 0; i < total; i++) {
      var sentence = pick();
      var useConnector =
        i > 0 && !lastWasConnector && connectors.length > 0 && rng() < 0.4;
      if (useConnector) {
        var connector = connectors[Math.floor(rng() * connectors.length)];
        parts.push(connector + " " + lowerFirst(sentence));
        lastWasConnector = true;
      } else {
        parts.push(sentence);
        lastWasConnector = false;
      }
    }

    return parts.join(" ");
  }

  /* ---------------------------------------------------------------- */
  /* Costruzione di unit: words                                        */
  /* ---------------------------------------------------------------- */

  /* Appiattisce parole e locuzioni in singoli token unici (senza distinzione
   * tra maiuscole e minuscole). Per l'italiano le parole funzione interne
   * alle locuzioni vengono scartate: "latte di avena" → "latte", "avena". */
  function flattenCorpusWords(corpusWords, lang) {
    var tokens = [];
    var seen = Object.create(null);

    for (var i = 0; i < corpusWords.length; i++) {
      var parts = String(corpusWords[i]).trim().split(/\s+/);
      for (var j = 0; j < parts.length; j++) {
        var token = parts[j];
        if (!token) continue;
        var key = token.toLowerCase();
        if (parts.length > 1 && lang === "it" && WORD_STOPWORDS[key]) {
          continue;
        }
        if (seen[key]) continue;
        seen[key] = true;
        tokens.push(token);
      }
    }

    return tokens;
  }

  /* Ripete il mazzo in ciclo finché non ha prodotto esattamente `count`
   * parole, evitando la ripetizione immediata. */
  function buildWordText(rng, corpusWords, count, lang) {
    var tokens = flattenCorpusWords(corpusWords, lang);

    if (!tokens.length) {
      throw new Error("Il vocabolario del tema è vuoto: impossibile generare parole.");
    }

    var pool = shuffle(tokens, rng);
    var out = [];
    var previous = null;

    for (var k = 0; k < count; k++) {
      if (!pool.length) pool = shuffle(tokens, rng);
      var word = pool.pop();
      if (word === previous && pool.length) {
        var alt = pool[pool.length - 1];
        pool[pool.length - 1] = word;
        word = alt;
      }
      out.push(word);
      previous = word;
    }

    return out.join(" ");
  }

  /* ---------------------------------------------------------------- */
  /* Formato logogrammi                                                */
  /* ---------------------------------------------------------------- */

  /* Disegna un glifo in coordinate locali (0,0 = centro): un cerchio aperto
   * con 2–6 lobi e 1–6 tendril. Tutti i parametri vengono dal PRNG del
   * glifo, quindi il disegno dipende solo da (seed, indice, parola).
   * Il glifo visivo sta in un diametro di ~72 unità, dentro un passo di 88. */
  function buildGlyph(rng) {
    var lobes = randInt(rng, 2, 6);
    var tendrils = randInt(rng, 1, 6);
    var radius = 24 + rng() * 5;
    var amplitude = 2 + rng() * 3;
    var phase = rng() * Math.PI * 2;
    var rotation = rng() * Math.PI * 2;

    /* Apertura: circa un glifo su tre ha un taglio netto (una "C" evidente),
     * gli altri restano quasi chiusi. Il taglio è ciò che rende subito
     * riconoscibile un cerchio aperto anche a colpo d'occhio. */
    var gap = rng() < 0.3 ? 1.9 + rng() * 0.8 : 0.5 + rng() * 0.9;

    var start = rotation + gap / 2;
    var end = rotation + Math.PI * 2 - gap / 2;
    var steps = 72;
    var path = "";
    var i;

    /* Anello aperto: raggio modulato in modo sinusoidale, un lobo per
     * semionda. L'arco non si chiude, così il cerchio resta aperto. */
    for (i = 0; i <= steps; i++) {
      var angle = start + ((end - start) * i) / steps;
      var wobble =
        radius + amplitude * Math.sin(lobes * (angle - start) + phase);
      path +=
        (i === 0 ? "M" : "L") +
        formatNumber(Math.cos(angle) * wobble) + " " +
        formatNumber(Math.sin(angle) * wobble);
    }

    /* Tendril: viticci lunghi e asimmetrici che partono dall'anello e si
     * arricciano verso l'esterno. Ogni tendril ha angolo, lunghezza,
     * direzione e curvatura propri, così il glifo non è mai simmetrico.
     * L'attacco resta dentro l'arco disegnato: mai sospeso nel vuoto
     * dell'apertura. */
    var arcSpan = end - start;
    for (var j = 0; j < tendrils; j++) {
      var spot = (j + 0.7) / (tendrils + 0.4);
      var baseAngle =
        start +
        spot * arcSpan +
        (rng() - 0.5) * Math.min(0.35, (arcSpan / (tendrils + 1)) * 0.6);
      var baseRadius =
        radius + amplitude * Math.sin(lobes * (baseAngle - start) + phase);
      var length = 7 + rng() * 7;
      var direction = rng() < 0.5 ? -1 : 1;
      var curl = 0.7 + rng() * 0.9;
      var cosA = Math.cos(baseAngle);
      var sinA = Math.sin(baseAngle);
      var tanX = -sinA * direction;
      var tanY = cosA * direction;
      var startX = cosA * baseRadius;
      var startY = sinA * baseRadius;
      var c1x = startX + cosA * length * 0.3 + tanX * length * curl * 0.3;
      var c1y = startY + sinA * length * 0.3 + tanY * length * curl * 0.3;
      var endX = startX + cosA * length * 0.5 + tanX * length * curl * 0.4;
      var endY = startY + sinA * length * 0.5 + tanY * length * curl * 0.4;
      var c2x = endX - cosA * length * 0.1 + tanX * length * curl * 0.25;
      var c2y = endY - sinA * length * 0.1 + tanY * length * curl * 0.25;
      path +=
        "M" + formatNumber(startX) + " " + formatNumber(startY) +
        "C" + formatNumber(c1x) + " " + formatNumber(c1y) + " " +
        formatNumber(c2x) + " " + formatNumber(c2y) + " " +
        formatNumber(endX) + " " + formatNumber(endY);
    }

    return '<path d="' + path + '"/>';
  }

  /* Costruisce un unico SVG con la griglia di glifi: massimo 6 per riga,
   * padding 32, passo 88, larghezza massima 592 unità (ben dentro le 1200
   * previste). Ogni glifo è un <path> dentro un <g class="glifo">. */
  function buildLogogramSvg(themeId, theme, count, seed) {
    var tokens = flattenCorpusWords(theme.words || [], theme.lang || "it");
    if (!tokens.length) {
      throw new Error(
        'Il tema "' + themeId + '" non contiene parole: impossibile disegnare glifi.'
      );
    }

    var columnsAvailable = Math.max(
      1,
      Math.min(
        SVG_MAX_COLUMNS,
        Math.floor((SVG_MAX_WIDTH - 2 * SVG_PADDING) / GLYPH_PITCH)
      )
    );
    var columns = Math.min(count, columnsAvailable);
    var rows = Math.ceil(count / columns);
    var width = 2 * SVG_PADDING + columns * GLYPH_PITCH;
    var height = 2 * SVG_PADDING + rows * GLYPH_PITCH;
    var label = "Logogrammi eptapodi, " + count + " glifi";

    var wordRng = mulberry32((seed ^ 0x9e3779b9) >>> 0);
    var words = shuffle(tokens, wordRng);
    var parts = [];

    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        width + " " + height + '" width="' + width + '" height="' + height +
        '" role="img" aria-label="' + label +
        '" stroke="currentColor" fill="none" stroke-linecap="round" ' +
        'stroke-linejoin="round">'
    );
    parts.push("<title>" + label + "</title>");
    parts.push('<g stroke-width="2.2">');

    for (var i = 0; i < count; i++) {
      var row = Math.floor(i / columns);
      var column = i % columns;
      var cx = SVG_PADDING + column * GLYPH_PITCH + GLYPH_PITCH / 2;
      var cy = SVG_PADDING + row * GLYPH_PITCH + GLYPH_PITCH / 2;
      var word = words[i % words.length];
      var glyphRng = mulberry32(hash32(seed + "|" + i + "|" + word));
      parts.push(
        '<g class="glifo" transform="translate(' +
          formatNumber(cx) + " " + formatNumber(cy) + ')">' +
          buildGlyph(glyphRng) + "</g>"
      );
    }

    parts.push("</g></svg>");
    return parts.join("");
  }

  /* Ramo logogrammi: unit, html, markdown e json sono ignorati. */
  function generateLogograms(options, themeId, theme) {
    var count =
      options.count == null ? LOGOGRAM_RANGE.fallback : options.count;
    if (
      typeof count !== "number" ||
      !isFinite(count) ||
      Math.floor(count) !== count
    ) {
      throw new Error("Numero di glifi non valido: deve essere un intero.");
    }
    if (count < LOGOGRAM_RANGE.min || count > LOGOGRAM_RANGE.max) {
      throw new Error(
        "Numero di glifi non valido: " + count +
          ". Valori consentiti: da " + LOGOGRAM_RANGE.min +
          " a " + LOGOGRAM_RANGE.max + "."
      );
    }

    var seed = readSeed(options.seed);
    return {
      text: buildLogogramSvg(themeId, theme, count, seed),
      meta: {
        theme: themeId,
        unit: "logograms",
        count: count,
        glyphs: count,
        words: 0
      }
    };
  }

  /* ---------------------------------------------------------------- */
  /* Formattazione e metadati                                          */
  /* ---------------------------------------------------------------- */

  function formatBlocks(blocks, options) {
    if (options.json) {
      return JSON.stringify({ theme: options.theme, paragraphs: blocks });
    }
    if (options.html) {
      var wrapped = [];
      for (var i = 0; i < blocks.length; i++) {
        wrapped.push("<p>" + blocks[i] + "</p>");
      }
      return wrapped.join("\n");
    }
    /* Markdown e testo semplice condividono la riga vuota tra paragrafi. */
    return blocks.join("\n\n");
  }

  /* ---------------------------------------------------------------- */
  /* API pubblica                                                      */
  /* ---------------------------------------------------------------- */

  function themes() {
    var corpus = getCorpus();
    if (!corpus) {
      throw new Error(
        "Corpora dei temi non caricati: manca il globale LOREM_THEMES."
      );
    }
    return themeList(corpus);
  }

  function generate(options) {
    var opts = options || {};

    var corpus = getCorpus();
    if (!corpus) {
      throw new Error(
        "Corpora dei temi non caricati: manca il globale LOREM_THEMES."
      );
    }

    /* Tema */
    var themeId = opts.theme == null ? "classico" : String(opts.theme);
    var theme = corpus[themeId];
    if (!theme || typeof theme !== "object") {
      var available = themeList(corpus).map(function (t) {
        return t.id;
      });
      throw new Error(
        'Tema inesistente: "' + themeId + '". Temi disponibili: ' +
          available.join(", ") + "."
      );
    }
    if (!theme.sentences || !theme.sentences.length) {
      throw new Error(
        'Il tema "' + themeId + '" non contiene frasi: impossibile generare.'
      );
    }

    /* Formato logogrammi: ha precedenza su unit, html, markdown e json. */
    if (opts.logogram) {
      return generateLogograms(opts, themeId, theme);
    }

    /* Unità di misura */
    var unit = opts.unit == null ? "paragraphs" : String(opts.unit);
    if (!Object.prototype.hasOwnProperty.call(UNIT_RANGES, unit)) {
      throw new Error(
        'Unità non valida: "' + unit +
          '". Valori consentiti: paragraphs, sentences, words.'
      );
    }
    var range = UNIT_RANGES[unit];

    /* Quantità */
    var count = opts.count == null ? range.fallback : opts.count;
    if (typeof count !== "number" || !isFinite(count) || Math.floor(count) !== count) {
      throw new Error(
        "Numero di " + range.label +
          " non valido: deve essere un intero."
      );
    }
    if (count < range.min || count > range.max) {
      throw new Error(
        "Numero di " + range.label + " non valido: " + count +
          ". Valori consentiti: da " + range.min + " a " + range.max + "."
      );
    }

    /* Seed: intero, deterministico, default fisso */
    var seed = readSeed(opts.seed);

    var html = !!opts.html;
    var markdown = !!opts.markdown;
    var json = !!opts.json;
    var startClassic = !!opts.startClassic;
    var lang = theme.lang || "it";

    var rng = mulberry32(seed);
    var blocks = [];

    if (unit === "words") {
      blocks.push(buildWordText(rng, theme.words || [], count, lang));
    } else if (unit === "sentences") {
      var pick = createSentencePicker(rng, theme.sentences);
      var sentences = [];
      for (var i = 0; i < count; i++) sentences.push(pick());
      blocks.push(sentences.join(" "));
    } else {
      var pickParagraph = createSentencePicker(rng, theme.sentences);
      var classic =
        startClassic && themeId === "classico";
      if (classic) blocks.push(CLASSIC_INCIPIT);
      var remaining = count - blocks.length;
      for (var k = 0; k < remaining; k++) {
        blocks.push(makeParagraph(rng, pickParagraph, lang));
      }
    }

    var plain = blocks.join("\n\n");
    var meta = {
      theme: themeId,
      unit: unit,
      count: count,
      sentences: countSentences(plain),
      words: countWords(plain)
    };

    return {
      text: formatBlocks(blocks, {
        theme: themeId,
        html: html,
        markdown: markdown,
        json: json
      }),
      meta: meta
    };
  }

  return {
    themes: themes,
    generate: generate
  };
});
