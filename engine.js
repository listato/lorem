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
 *                          seed, startClassic, lang })
 *     -> { text, meta: { theme, unit, count, sentences, words } }
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
    ]
  };

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

  /* Appiattisce parole e locuzioni in singoli token, elimina i duplicati
   * (senza distinzione tra maiuscole e minuscole) e ripete il mazzo in
   * ciclo finché non ha prodotto esattamente `count` parole. Per l'italiano
   * le parole funzione interne alle locuzioni vengono scartate. */
  function buildWordText(rng, corpusWords, count, lang) {
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
    var seed = opts.seed == null ? 1 : opts.seed;
    if (typeof seed !== "number" || !isFinite(seed)) {
      throw new Error("Seed non valido: deve essere un numero intero.");
    }
    seed = Math.floor(seed) >>> 0;

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
