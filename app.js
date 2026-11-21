/* lorem.lorel.lol — generatore e catalogo, tutto nel browser */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- tema */

  var THEME_KEY = "lorem-theme";

  function applyTheme(mode) {
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
    $$(".theme-btn").forEach(function (b) {
      b.setAttribute("aria-checked", b.dataset.themeMode === mode ? "true" : "false");
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#0c0e11" : "#f4efe4");
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    // ?tema=chiaro / ?tema=scuro forza il tema per quella visita, come su lorel.lol
    var forced = null;
    try {
      var q = new URLSearchParams(location.search).get("tema");
      if (q === "scuro" || q === "dark") forced = "dark";
      if (q === "chiaro" || q === "light") forced = "light";
    } catch (e) {}
    applyTheme(forced || (saved === "dark" || saved === "light" ? saved : (dark ? "dark" : "light")));
    $$(".theme-btn").forEach(function (b) {
      b.addEventListener("click", function () { applyTheme(b.dataset.themeMode); });
    });
    requestAnimationFrame(function () { document.documentElement.classList.remove("preload"); });
  }

  /* ----------------------------------------------------------- generatore */

  var LANG_NAMES = {
    en: "Inglese", it: "Italiano", fr: "Francese", de: "Tedesco", es: "Spagnolo",
    ca: "Catalano", pt: "Portoghese", nl: "Olandese", tr: "Turco", sl: "Sloveno",
    ru: "Russo", cs: "Ceco", ja: "Giapponese", "fr-cajun": "Francese cajun",
    la: "Latino"
  };

  function langName(code) { return LANG_NAMES[code] || code; }

  var LIMITS = {
    paragraphs: { min: 1, max: 12, def: 3 },
    sentences: { min: 1, max: 20, def: 5 },
    words: { min: 1, max: 200, def: 40 }
  };

  var state = {
    theme: "classico",
    unit: "paragraphs",
    count: 3,
    format: "text",
    seed: 1,
    classic: false
  };

  var els = {};

  function engineThemes() {
    if (window.LoremEngine && typeof window.LoremEngine.themes === "function") {
      try { return window.LoremEngine.themes(); } catch (e) {}
    }
    var T = window.LOREM_THEMES || {};
    return Object.keys(T).map(function (k) {
      return { id: T[k].id || k, label: T[k].label || k, lang: T[k].lang || "it", about: T[k].about || "" };
    });
  }

  function renderThemeChips() {
    var themes = engineThemes();
    els.themeChips.innerHTML = "";
    themes.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.theme = t.id;
      b.textContent = t.label;
      b.title = t.about || t.label;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(state.theme === t.id));
      b.addEventListener("click", function () {
        state.theme = t.id;
        $$(".chip[data-theme]", els.themeChips).forEach(function (c) {
          c.setAttribute("aria-checked", String(c.dataset.theme === state.theme));
        });
        els.classic.checked = state.classic && state.theme === "classico";
        generate(true);
      });
      els.themeChips.appendChild(b);
    });
    if (!themes.some(function (t) { return t.id === state.theme; }) && themes.length) {
      state.theme = themes[0].id;
    }
  }

  function syncCountLimits() {
    var lim = LIMITS[state.unit] || LIMITS.paragraphs;
    els.count.min = String(lim.min);
    els.count.max = String(lim.max);
    if (state.count < lim.min || state.count > lim.max) state.count = lim.def;
    els.count.value = String(state.count);
  }

  function updateClassicAvailability() {
    var ok = state.theme === "classico" && state.unit === "paragraphs";
    els.classic.disabled = !ok;
    if (!ok) state.classic = false;
    els.classic.checked = state.classic;
    els.classic.parentElement.title = ok
      ? "Il primo paragrafo è l'incipit latino canonico"
      : "Disponibile solo con tema Classico e unità Paragrafi";
  }

  function formatMeta() {
    var labels = { text: "Testo", html: "HTML", markdown: "Markdown", json: "JSON" };
    return labels[state.format] || "Testo";
  }

  function fail(msg) {
    els.output.textContent = "⚠ " + msg;
    els.outputTitle.textContent = "errore";
    els.stats.textContent = "—";
    els.share.hidden = true;
  }

  function generate(quiet) {
    if (!window.LoremEngine || typeof window.LoremEngine.generate !== "function") {
      fail("motore non caricato: apri la pagina con il server locale (engine.js è nella cartella).");
      return;
    }
    updateClassicAvailability();

    var opts = {
      theme: state.theme,
      unit: state.unit,
      count: state.count,
      seed: state.seed,
      html: state.format === "html",
      markdown: state.format === "markdown",
      json: state.format === "json",
      startClassic: state.classic && state.theme === "classico" && state.unit === "paragraphs"
    };

    var res;
    try {
      res = window.LoremEngine.generate(opts);
    } catch (e) {
      fail(e && e.message ? e.message : "generazione non riuscita.");
      return;
    }

    els.output.textContent = res.text;
    els.output.scrollTop = 0;

    var th = engineThemes().filter(function (t) { return t.id === state.theme; })[0];
    var thLabel = th ? th.label : state.theme;
    els.outputTitle.textContent = thLabel + " · " + formatMeta() + " · seed " + state.seed;

    var words = res.meta && res.meta.words != null ? res.meta.words : countWords(res.text);
    var chars = res.text.length;
    els.stats.textContent = words + " parole · " + chars + " caratteri · " + (state.unit === "paragraphs" ? state.count + " paragrafi" : state.unit === "sentences" ? state.count + " frasi" : state.count + " parole");
    els.share.hidden = false;
    syncHash();
    if (!quiet) els.output.focus({ preventScroll: true });
  }

  function countWords(t) {
    var m = t.replace(/<[^>]+>/g, " ").match(/[A-Za-zÀ-ÿ0-9'’]+/g);
    return m ? m.length : 0;
  }

  function syncHash() {
    var q = "tema=" + encodeURIComponent(state.theme) +
      "&unita=" + state.unit +
      "&n=" + state.count +
      "&seed=" + state.seed +
      "&formato=" + state.format;
    try {
      history.replaceState(null, "", "#" + q);
    } catch (e) {}
    els.share.href = "#" + q;
  }

  function readHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) return false;
    var p = {};
    h.split("&").forEach(function (kv) {
      var i = kv.indexOf("=");
      if (i > 0) p[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
    });
    var touched = false;
    if (p.tema) { state.theme = p.tema; touched = true; }
    if (p.unita && LIMITS[p.unita]) { state.unit = p.unita; touched = true; }
    if (p.n) { var n = parseInt(p.n, 10); if (n > 0) { state.count = n; touched = true; } }
    if (p.seed) { var s = parseInt(p.seed, 10); if (!isNaN(s)) { state.seed = s; touched = true; } }
    if (p.formato && ["text", "html", "markdown", "json"].indexOf(p.formato) !== -1) { state.format = p.formato; touched = true; }
    return touched;
  }

  function randomSeed() {
    if (window.crypto && window.crypto.getRandomValues) {
      var a = new Uint32Array(1);
      window.crypto.getRandomValues(a);
      return a[0] % 1000000;
    }
    return Math.floor(Math.random() * 1000000);
  }

  async function copyOutput() {
    var text = els.output.textContent;
    if (!text || text === "—") return;
    try {
      await navigator.clipboard.writeText(text);
      flash(els.copy, "Copiato");
    } catch (e) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); flash(els.copy, "Copiato"); } catch (err) { flash(els.copy, "Copia a mano"); }
      document.body.removeChild(ta);
    }
  }

  function flash(btn, label) {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = label;
    btn.disabled = true;
    setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1400);
  }

  function download() {
    var text = els.output.textContent;
    if (!text || text === "—") return;
    var ext = state.format === "html" ? "html" : state.format === "markdown" ? "md" : state.format === "json" ? "json" : "txt";
    var mime = state.format === "html" ? "text/html" : state.format === "json" ? "application/json" : "text/plain";
    var blob = new Blob([text + (ext === "txt" ? "\n" : "")], { type: mime + ";charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lorem-" + state.theme + "-" + state.seed + "." + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function initGenerator() {
    els.themeChips = $("#themeChips");
    els.unit = $("#unit");
    els.count = $("#qty");
    els.format = $("#format");
    els.seed = $("#seed");
    els.classic = $("#classic");
    els.generate = $("#generate");
    els.output = $("#output");
    els.outputTitle = $("#outputTitle");
    els.stats = $("#outStats");
    els.copy = $("#copy");
    els.download = $("#download");
    els.reroll = $("#reroll");
    els.share = $("#share");
    if (!els.output) return;

    var fromHash = readHash();
    if (!fromHash) state.seed = randomSeed();
    renderThemeChips();
    els.unit.value = state.unit;
    els.format.value = state.format;
    els.seed.value = String(state.seed);
    syncCountLimits();
    updateClassicAvailability();

    els.unit.addEventListener("change", function () {
      state.unit = els.unit.value;
      state.count = LIMITS[state.unit].def;
      syncCountLimits();
      updateClassicAvailability();
      generate();
    });

    els.count.addEventListener("input", function () {
      var lim = LIMITS[state.unit];
      var v = parseInt(els.count.value, 10);
      if (isNaN(v)) return;
      state.count = Math.max(lim.min, Math.min(lim.max, v));
      generate();
    });

    els.count.addEventListener("blur", function () {
      els.count.value = String(state.count);
    });

    els.format.addEventListener("change", function () {
      state.format = els.format.value;
      generate();
    });

    els.seed.addEventListener("change", function () {
      var v = parseInt(els.seed.value, 10);
      state.seed = isNaN(v) ? 1 : v;
      els.seed.value = String(state.seed);
      generate();
    });

    els.classic.addEventListener("change", function () {
      state.classic = els.classic.checked;
      generate();
    });

    els.generate.addEventListener("click", function () { generate(); });
    els.reroll.addEventListener("click", function () {
      state.seed = randomSeed();
      els.seed.value = String(state.seed);
      generate();
    });
    els.copy.addEventListener("click", copyOutput);
    els.download.addEventListener("click", download);

    // Cmd/Ctrl+Invio rigenera
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    });

    generate(true);
  }

  /* ------------------------------------------------------------- catalogo */

  var cat = {
    all: [],
    categories: [],
    meta: {},
    filter: { q: "", category: "", lang: "", onlyUp: false }
  };

  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function initCatalogData() {
    var data = window.LOREM_CATALOG;
    if (!data || !Array.isArray(data.generators)) {
      $("#grid").innerHTML = '<p class="empty">Catalogo non caricato: manca <code>data/generators.js</code>.</p>';
      $("#catalogCount").textContent = "—";
      return false;
    }
    cat.all = data.generators.slice();
    cat.categories = data.categories || [];
    cat.meta = data.meta || {};
    return true;
  }

  function catLabel(id) {
    var c = cat.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.label : (id || "");
  }

  function renderCatChips() {
    var wrap = $("#catChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    var items = [{ id: "", label: "Tutti" }].concat(cat.categories);
    items.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = c.label;
      b.dataset.category = c.id;
      b.setAttribute("aria-pressed", String(cat.filter.category === c.id));
      b.addEventListener("click", function () {
        cat.filter.category = c.id;
        $$(".chip", wrap).forEach(function (x) {
          x.setAttribute("aria-pressed", String(x.dataset.category === cat.filter.category));
        });
        renderCatalog();
      });
      wrap.appendChild(b);
    });
  }

  function renderLangOptions() {
    var sel = $("#langFilter");
    if (!sel) return;
    var langs = {};
    cat.all.forEach(function (g) {
      (g.langs || []).forEach(function (l) { langs[l] = (langs[l] || 0) + 1; });
    });
    var codes = Object.keys(langs).sort(function (a, b) {
      if (a === "en") return -1;
      if (b === "en") return 1;
      return langName(a).localeCompare(langName(b), "it");
    });
    codes.forEach(function (code) {
      var o = document.createElement("option");
      o.value = code;
      o.textContent = langName(code) + " (" + langs[code] + ")";
      sel.appendChild(o);
    });
  }

  function matches(g, f) {
    if (f.category && g.category !== f.category) return false;
    if (f.lang && (g.langs || []).indexOf(f.lang) === -1) return false;
    if (f.onlyUp && g.status !== "up") return false;
    if (f.q) {
      var hay = normalize([g.name, g.what, g.note, (g.tags || []).join(" "), (g.langs || []).map(langName).join(" "), catLabel(g.category)].join(" "));
      if (hay.indexOf(f.q) === -1) return false;
    }
    return true;
  }

  var STATUS_LABEL = {
    up: "Link attivo",
    stale: "Link sospetto: risponde ma sembra parcheggiato o vuoto",
    dead: "Link non raggiungibile",
    unknown: "Stato non verificato"
  };

  function cardEl(g) {
    var card = document.createElement("article");
    card.className = "card";

    var top = document.createElement("div");
    top.className = "card-top";

    var h3 = document.createElement("h3");
    var a = document.createElement("a");
    a.href = g.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = g.name;
    if (g.note) a.title = g.note;
    h3.appendChild(a);

    var st = document.createElement("span");
    st.className = "stato " + (g.status || "unknown");
    st.title = (STATUS_LABEL[g.status] || STATUS_LABEL.unknown) + (g.http ? " (HTTP " + g.http + ")" : "");
    st.setAttribute("aria-label", st.title);

    top.appendChild(h3);
    top.appendChild(st);

    var what = document.createElement("p");
    what.className = "what";
    what.textContent = g.what || "";

    var foot = document.createElement("div");
    foot.className = "card-foot";

    var catSpan = document.createElement("span");
    catSpan.className = "card-cat";
    catSpan.textContent = catLabel(g.category);

    var tags = document.createElement("span");
    tags.className = "tags";
    var shown = 0;
    (g.tags || []).forEach(function (t) {
      if (shown >= 3) return;
      var s = document.createElement("span");
      s.className = "tag";
      s.textContent = t.toLowerCase();
      tags.appendChild(s);
      shown++;
    });
    (g.langs || []).forEach(function (l) {
      if (l !== "en" && shown < 4) {
        var s2 = document.createElement("span");
        s2.className = "tag lang";
        s2.textContent = l;
        tags.appendChild(s2);
        shown++;
      }
    });
    if (shown === 0) {
      var none = document.createElement("span");
      none.className = "tag";
      none.textContent = "en";
      tags.appendChild(none);
    }

    foot.appendChild(catSpan);
    foot.appendChild(tags);

    card.appendChild(top);
    card.appendChild(what);
    card.appendChild(foot);
    return card;
  }

  function renderCatalog() {
    if (!cat.all.length) return;
    var f = cat.filter;
    var list = cat.all.filter(function (g) { return matches(g, f); });
    var grid = $("#grid");
    grid.innerHTML = "";
    var frag = document.createDocumentFragment();
    list.forEach(function (g) { frag.appendChild(cardEl(g)); });
    grid.appendChild(frag);

    var n = list.length;
    var tot = cat.all.length;
    $("#catalogCount").textContent = n === tot
      ? tot + " generatori · tutti visibili"
      : n + " di " + tot + " generatori";

    $("#empty").hidden = n !== 0;
    $("#catalogCount").hidden = n === 0;

    var checked = $("#checkedDate");
    if (checked) {
      var d = cat.meta.checked || cat.meta.fetched;
      checked.textContent = d ? new Date(d + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : "—";
    }
  }

  function renderStats() {
    var box = $("#statGrid");
    if (!box) return;
    var list = cat.all;
    var langs = {};
    var up = 0, dead = 0, api = 0, gh = 0;
    list.forEach(function (g) {
      (g.langs || []).forEach(function (l) { langs[l] = 1; });
      if (g.status === "up") up++;
      if (g.status === "dead") dead++;
      if ((g.tags || []).indexOf("api") !== -1) api++;
      if ((g.tags || []).indexOf("github") !== -1) gh++;
    });
    var items = [
      [list.length, "generatori in catalogo"],
      [cat.categories.length, "categorie"],
      [Object.keys(langs).length, "lingue dichiarate"],
      [api, "con API"],
      [gh, "con codice su GitHub"],
      [up, "link attivi oggi"],
      [dead, "link caduti"]
    ];
    box.innerHTML = "";
    items.forEach(function (it) {
      var d = document.createElement("div");
      d.className = "stat";
      var b = document.createElement("b");
      b.textContent = String(it[0]);
      var s = document.createElement("span");
      s.textContent = it[1];
      d.appendChild(b);
      d.appendChild(s);
      box.appendChild(d);
    });
  }

  function initCatalog() {
    if (!initCatalogData()) return;

    renderCatChips();
    renderLangOptions();
    renderCatalog();
    renderStats();

    var search = $("#search");
    var clear = $("#clearSearch");
    var langSel = $("#langFilter");
    var onlyUp = $("#onlyUp");

    var debounce;
    search.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        cat.filter.q = normalize(search.value.trim());
        clear.hidden = !search.value;
        renderCatalog();
      }, 120);
    });

    clear.addEventListener("click", function () {
      search.value = "";
      cat.filter.q = "";
      clear.hidden = true;
      renderCatalog();
      search.focus();
    });

    langSel.addEventListener("change", function () {
      cat.filter.lang = langSel.value;
      renderCatalog();
    });

    onlyUp.addEventListener("change", function () {
      cat.filter.onlyUp = onlyUp.checked;
      renderCatalog();
    });

    $("#resetFilters").addEventListener("click", function () {
      cat.filter = { q: "", category: "", lang: "", onlyUp: false };
      search.value = "";
      clear.hidden = true;
      langSel.value = "";
      onlyUp.checked = false;
      $$("#catChips .chip").forEach(function (x) {
        x.setAttribute("aria-pressed", String(x.dataset.category === ""));
      });
      renderCatalog();
    });
  }

  /* ------------------------------------------------------------------ avvio */

  function boot() {
    initTheme();
    initGenerator();
    initCatalog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
