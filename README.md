# lorem.lorel.lol

Generatore di lorem ipsum in italiano e catalogo dei generatori del mondo.
Pagina singola statica, sorella di [lorel.lol](https://lorel.lol): stesso
impianto (nessuna richiesta esterna al caricamento, nessun cookie, tutto
calcolato nel browser), un tema opposto — carta e inchiostro invece della notte
sulla Terra.

`lorem` e `merlo` sono anagrammi: `merlo.lorel.lol` è il prossimo giro.

| File | Cosa |
|---|---|
| `index.html` | pagina unica |
| `styles.css` | stile, tema Carta/Inchiostro e layout |
| `engine.js` | motore di generazione puro, deterministico con seed, zero dipendenze |
| `data/themes.js` | 8 temi × 40 frasi + 120 voci di vocabolario |
| `data/generators.js` | catalogo dei 88 generatori da awesome-ipsum, con stato dei link |
| `app.js` | UI: generatore, formati, copia/scarica, catalogo con ricerca e filtri |
| `tools/test-engine.mjs` | test Node del motore (7.317 controlli) |
| `tools/check-links.py` | verifica HTTP dei link del catalogo e riscrittura dello stato |
| `docs/CONTRATTO-DATI.md` | schema dati di catalogo e motore |
| `docs/catalogo.md` | tabella leggibile del catalogo e riepilogo per categoria |
| `apple-touch-icon.png` | icona 180×180, stessa grafica della favicon |

## Il generatore

Otto temi: **Classico** (latino, lessico del lorem ipsum canonico), **Pinocchio**
(Collodi, pubblico dominio), **Ufficio**, **Burocrazia**, **Cucina**,
**Astronomia**, **Fantascienza**, **Hipster**.

Quattro formati: testo, HTML (`<p>`), Markdown (paragrafi separati da riga
vuota), JSON (`{theme, paragraphs}`). Unità: paragrafi (1–12), frasi (1–20),
parole (1–200). Con tema Classico e unità Paragrafi, l'opzione «Parti dal Lorem
ipsum» antepone l'incipit latino canonico.

Il motore non è un modello linguistico: ogni tema è una raccolta di frasi
complete scritte a mano, scelte da un PRNG mulberry32. Lo stesso seed produce lo
stesso testo su qualunque browser:

```js
LoremEngine.generate({ theme: "pinocchio", unit: "paragraphs", count: 3, seed: 42 })
// → { text: "...", meta: { theme, unit, count, sentences, words } }
```

Lo stato della pagina sta nell'hash (`#tema=…&unita=…&n=…&seed=…&formato=…`),
quindi il link «link condivisibile» riapre esattamente lo stesso testo. Al primo
accesso il seed è casuale; da lì in poi si può fissarlo, cambiarlo a mano o
premere «Rigenera».

Formato HTML e Markdown non passano da un parser: il testo generato è già
strutturato, e i formati servono a incollarlo nel progetto giusto.

## Il catalogo

88 generatori dalla lista [awesome-ipsum](https://github.com/templeman/awesome-ipsum)
di templeman (CC0-1.0 dichiarata nel README della lista; nella repository non c'è
un file `LICENSE`), in 10 categorie con una descrizione in italiano per ciascuno.
Ricerca libera, filtro per categoria, lingua e «solo link attivi». Ogni scheda
porta il nome, la descrizione, i tag della lista, le lingue dichiarate e un
pallino con lo stato del link.

Stato verificato il 21 novembre 2026: **82 attivi, 3 caduti, 3 irraggiungibili**
(502/500 di server guasti, non link morti). Il pallino è verde (attivo), giallo
(sospetto), rosso (caduto), grigio (non verificato); passando sul nome compare
la nota quando c'è.

Le lingue sono quelle **dichiarate** dai tag `lang-*` della lista, non un
rilevamento del contenuto: la lista a volte le omette, quindi «en» non compare
per chi ha già un'altra lingua (es. `bible-ipsum` è marcato `fr` perché è la
lingua dichiarata, anche se il testo è inglese).

Per aggiornare gli stati:

```bash
python3 tools/check-links.py
```

Lo script usa solo la libreria standard (con `curl` di ripiego), timeout 8 s,
concorrenza 8, massimo 2 tentativi, tetto di parete ~165 s, e riscrive
`status`, `http` e `meta.checked` dentro `data/generators.js`.

## Sviluppo

```bash
python3 -m http.server 8799    # http://127.0.0.1:8799
node tools/test-engine.mjs     # test del motore
```

La pagina funziona anche da `file://`, ma il server HTTP evita sorprese con i
path relativi dei dati.

Dati `generators.js` e `themes.js` caricati con `<script>`: nessun bundler,
nessuna installazione. Il contratto dei due file sta in
`docs/CONTRATTO-DATI.md`.

## Deploy

Cloudflare Pages, serve un progetto `lorem` e il dominio
`lorem.lorel.lol` collegato dalla scheda Custom domains, con la zona
`lorel.lol` nello stesso account:

```bash
secrets run --only CF_DEPLOY_TOKEN,CLOUDFLARE_ACCOUNT_ID -- bash -lc \
  'CLOUDFLARE_API_TOKEN=$CF_DEPLOY_TOKEN npx wrangler pages deploy . --project-name lorem --branch main'
```

## Verifiche fatte

- `node tools/test-engine.mjs`: 7.317 controlli, 0 falliti (determinismo tra
  processi, conteggi esatti, formati, igiene della punteggiatura, errori attesi).
- `node --check` su `engine.js`, `data/themes.js`, `data/generators.js`, `app.js`.
- Browser reale (Chrome headless, viewport 1440 e 390): 8 temi, 88 schede,
  7 statistiche, ricerca/filtri/categorie, cambio tema, hash e «Rigenera»
  funzionanti, zero errori in console, zero richieste esterne al caricamento.
- Catalogo verificato con `tools/check-links.py` (richieste HTTP reali, stato nel
  file, non stimato).

## Limiti dichiarati

- Le frasi sono finte ma grammaticali: non raccontano nulla.
- Il latino del tema Classico è ricombinato dal lessico di Cicerone, non è una
  citazione continua (a parte l'incipit opzionale).
- Con 12 paragrafi le frasi possono ricomparire tra paragrafi diversi: il corpus
  è di 40 frasi per tema, le ripetizioni dentro lo stesso paragrafo sono evitate.
- Le descrizioni del catalogo e i testi dei temi sono nostri; l'unica cosa
  verificata sui generatori altrui è che il link risponda, non che il servizio
  funzioni.

## Licenza

- Testi dei temi, descrizioni e motore: CC BY-SA 4.0.
- Elenco dei generatori e relativi tag: da awesome-ipsum, CC0-1.0.
- Il latino canonico e il mondo di Collodi sono pubblico dominio.
