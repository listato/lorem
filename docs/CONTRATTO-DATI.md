# Contratto dati — lorem.lorel.lol

Pagina singola statica, nessuna dipendenza, nessuna richiesta esterna al
caricamento. Stessa pasta di `lorel.lol`: `index.html` + `styles.css` + JS
locale, deploy Cloudflare Pages, mobile first, italiano visibile.

## File

| File | Contenuto | Chi lo scrive |
|---|---|---|
| `data/generators.js` | catalogo dei generatori da awesome-ipsum | teammate `catalogo-dati` |
| `data/checksums.js` | esito verifica link (non serve: sta dentro generators.js) | teammate `catalogo-dati` |
| `tools/check-links.py` | verifica HTTP dei link del catalogo | teammate `catalogo-dati` |
| `engine.js` | motore di generazione puro, deterministico con seed | teammate `motore-testi` |
| `data/themes.js` | corpora dei temi italiani + latino classico | teammate `motore-testi` |
| `tools/test-engine.mjs` | test Node del motore | teammate `motore-testi` |
| `index.html`, `styles.css`, `app.js` | pagina, stile, UI | lead |
| `README.md` | documentazione | lead |

## `data/generators.js`

Caricato con `<script src="data/generators.js">`, espone un globale:

```js
window.LOREM_CATALOG = {
  meta: {
    source: "awesome-ipsum",
    sourceUrl: "https://github.com/templeman/awesome-ipsum",
    license: "...",            // licenza della lista, se esiste un LICENSE
    fetched: "2026-11-21",
    checked: "2026-11-21",     // data ultima verifica HTTP
    total: 88
  },
  categories: [                // ordine di presentazione, id stabile
    { id: "practical",  label: "Pratici",          blurb: "..." },
    { id: "animals",    label: "Animali",          blurb: "..." },
    { id: "people",     label: "Personaggi",       blurb: "..." },
    { id: "music",      label: "Musica",           blurb: "..." },
    { id: "food",       label: "Cibo e bevande",   blurb: "..." },
    { id: "geography",  label: "Luoghi e dialetti",blurb: "..." },
    { id: "literature", label: "Letteratura",      blurb: "..." },
    { id: "misc",       label: "Vari",             blurb: "..." },
    { id: "tvfilm",     label: "TV e cinema",      blurb: "..." },
    { id: "tools",      label: "Strumenti",        blurb: "..." }
  ],
  generators: [
    {
      id: "cat-ipsum",              // slug ascii univoco, kebab-case
      name: "Cat Ipsum",
      url: "http://www.catipsum.com/",
      category: "animals",          // deve esistere in categories
      tags: ["HTML"],               // tag normalizzati: api, github, html, json,
                                    // markdown, npm, polysource, chrome
      langs: ["en"],                // ISO 639-1; "en" se non dichiarato altro
      what: "Riempitivo felino…",   // italiano, una frase, 40–130 caratteri
      status: "up",                 // "up" | "stale" | "dead" | "unknown"
      http: 200,                    // codice HTTP dell'ultima verifica, 0 se ignoto
      note: ""                      // facoltativo: una riga su cosa lo distingue
    }
  ]
};
```

Regole:

- 88 voci reali, le voci di `Tools, Apps, and Extensions` comprese.
- `status` da verifica HTTP reale (`curl -o /dev/null -s -w '%{http_code}' -L`),
  non inventato. `stale` = risponde ma su dominio parcheggiato/redirect anomalo.
- Nessuna descrizione copiata dalla lista: `what` è una riga scritta in italiano.
- `langs`: dal tag `lang-X`; `lang-CajunFrench` → `["fr-cajun"]`,
  `lang-Italian` → `["it"]`; niente tag → `["en"]`.
- Il file deve restare sotto ~60 KB e valere come sintassi: si verifica con
  `node --check data/generators.js`.

## `engine.js`

Motore puro, nessun DOM, nessuna rete. Espone sia modulo CommonJS sia globale
(niente bundler):

```js
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LoremEngine = factory();
})(typeof self !== "undefined" ? self : this, function () { /* ... */ });
```

API:

```js
LoremEngine.themes() -> [{ id, label, lang, about }]   // id: classico, pinocchio, ...
LoremEngine.generate({
  theme: "pinocchio",      // id di themes(); default "classico"
  unit: "paragraphs",      // "paragraphs" | "sentences" | "words"
  count: 3,                // 1..50 (paragrafi 1..12, parole 1..500)
  html: false,             // <p>…</p> per paragrafo
  markdown: false,         // paragrafi separati da riga vuota
  json: false,             // stringa JSON {theme, paragraphs:[...]}
  seed: 12345,             // intero: stesso seed, stesso testo
  startClassic: false,     // se true e unit=paragraphs, primo paragrafo latino canonico
  lang: "it"               // solo per i temi bilingue; default lang del tema
}) -> { text: "...", meta: { theme, unit, count, sentences, words } }
```

Regole:

- Deterministico: stesso seed → identico output. PRNG interno (mulberry32 o
  simile), niente `Math.random` per il risultato.
- `unit: "words"` produce esattamente `count` parole.
- `unit: "sentences"` produce esattamente `count` frasi.
- Frasi scritte a mano nei corpora: grammaticali, non pezzi di parole incollate.
  Ogni tema ha almeno 40 frasi e 120 parole di vocabolario.
- `startClassic` usa il testo latino canonico (Cicerone, pubblico dominio),
  solo se `theme === "classico"`.
- Nessuna dipendenza esterna, nessun `console.log`.

## `data/themes.js`

```js
window.LOREM_THEMES = {
  pinocchio: {
    id: "pinocchio",
    label: "Pinocchio",
    lang: "it",
    about: "Una riga: perché questo tema.",
    sentences: ["...", "..."],        // 40+ frasi complete, una per voce
    words: ["...", "..."]              // 120+ parole o locuzioni, per unit=words
  }
};
```

Temi richiesti (8): `classico` (latino), `pinocchio` (Collodi, pubblico
dominio), `ufficio`, `burocrazia`, `cucina`, `astronomia`, `fantascienza`,
`hipster`. Aggiungerne altri è benvenuto se le frasi sono di qualità.

## Licenza e provenienza

- Testi dei temi: scritti per il progetto, licenza CC BY-SA 4.0 come il resto
  del sito. Il latino canonico e Collodi sono pubblico dominio.
- La lista awesome-ipsum va citata con link e licenza reale (verificare se
  esiste `LICENSE` nella repo; se manca, dire «licenza non dichiarata»).

## Aggiunta v2 — temi `neo` e `heptapod`, formato logogrammi

### Nuovi temi in `data/themes.js`

- `neo` — lingua artificiale di Arturo Alfandari (1961). `label: "Neo"`,
  `lang: "neo"`, `about` deve dire esplicitamente «imitazione dichiarata, non
  una traduzione». Almeno 30 frasi brevi, sintassi semplice, con radici
  internazionali; è un pastiche consapevole, non filologia.
- `heptapod` — `label: "Eptapodi"`, `lang: "it"`, `about` sul linguaggio
  circolare degli eptapodi (Arrival) e sul tempo non lineare. 30+ frasi
  italiane originali, nessuna citazione dal film o dal racconto di Ted Chiang.

Entrambi con `words` ≥ 90.

### Formato logogrammi

Nuova opzione booleana in `generate()`: `logogram: true`.

```js
LoremEngine.generate({ theme: "heptapod", count: 12, seed: 7, logogram: true })
// → { text: "<svg …>…</svg>", meta: { theme, unit: "logograms", count: 12, glyphs: 12, words: 0 } }
```

- Con `logogram: true` ogni unità diventa un **glifo** disegnato in SVG: un
  cerchio aperto con 2–6 lobi e 1–6 tendril, geometria deterministica
  dall'hash di `(seed, indice, parola)`. Stesso seed, stesso disegno.
- `count` = numero di glifi, 1–48. `unit` è ignorata.
- L'SVG è un unico elemento con `viewBox`, `role="img"`,
  `<title>` in italiano («Logogrammi eptapodi, N glifi») e `aria-label`;
  niente colori fissi: `stroke="currentColor"`, `fill="none"`, sfondo
  trasparente, così funziona nei due temi.
- Disposizione: griglia che va a capo, glifi da ~44 px unità SVG, padding
  generoso; larghezza massima 1200 unità.
- `logogram` ha precedenza su `html`, `markdown`, `json` (ignorati).
- Disponibile per **tutti** i temi: il tema `heptapod` dà frasi sul linguaggio,
  il formato trasforma qualunque testo in glifi.
- Nessuna dipendenza, nessun DOM in `engine.js`: si restituisce solo la stringa.
