/*
 * lorem.lorel.lol — test del motore.
 *
 * Uso: node lorem/tools/test-engine.mjs
 *
 * Carica data/themes.js e engine.js in un contesto `vm` con un finto
 * `window` (niente bundler), poi verifica per tutti i 10 temi:
 * determinismo col seed, conteggi esatti di parole/frasi/paragrafi,
 * HTML, JSON, markdown, igiene della punteggiatura, startClassic,
 * formato logogrammi, validazione degli input e qualità minima dei corpora.
 *
 * Esce con codice 1 se almeno un controllo fallisce.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const themesPath = path.join(projectDir, "data", "themes.js");
const enginePath = path.join(projectDir, "engine.js");

/* ------------------------------------------------------------------ */
/* Contesto finto browser                                              */
/* ------------------------------------------------------------------ */

const sandbox = { window: {} };
vm.createContext(sandbox);

vm.runInContext(fs.readFileSync(themesPath, "utf8"), sandbox, {
  filename: "data/themes.js"
});

const themes = sandbox.window.LOREM_THEMES;
sandbox.LOREM_THEMES = themes;

vm.runInContext(fs.readFileSync(enginePath, "utf8"), sandbox, {
  filename: "engine.js"
});

const engine = sandbox.LoremEngine;

/* ------------------------------------------------------------------ */
/* Raccolta dei risultati                                              */
/* ------------------------------------------------------------------ */

let controlli = 0;
const fallimenti = [];

function verifica(condizione, messaggio) {
  controlli += 1;
  if (!condizione) fallimenti.push(messaggio);
}

function verificaUguale(atteso, ottenuto, messaggio) {
  verifica(
    atteso === ottenuto,
    `${messaggio}: atteso ${JSON.stringify(atteso)}, ottenuto ${JSON.stringify(ottenuto)}`
  );
}

function verificaErrore(fn, pattern, etichetta) {
  controlli += 1;
  try {
    fn();
    fallimenti.push(`errore atteso mancante — ${etichetta}`);
  } catch (errore) {
    if (!errore || typeof errore.message !== "string") {
      fallimenti.push(`errore non valido — ${etichetta}`);
      return;
    }
    if (!pattern.test(errore.message)) {
      fallimenti.push(
        `messaggio d'errore inatteso — ${etichetta}: "${errore.message}"`
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Utilità di conteggio                                                */
/* ------------------------------------------------------------------ */

function contaParole(testo) {
  const pulito = String(testo).trim();
  return pulito ? pulito.split(/\s+/).length : 0;
}

function contaFrasi(testo) {
  const trovate = String(testo).match(/[.!?]+(?=\s|$)/g);
  return trovate ? trovate.length : 0;
}

function blocchi(testo) {
  return String(testo)
    .trim()
    .split(/\n{2,}/)
    .filter((blocco) => blocco.length > 0);
}

function contaGlifi(svg) {
  return (String(svg).match(/<g class="glifo"/g) || []).length;
}

function viewBoxDi(svg) {
  const trovato = String(svg).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return trovato
    ? { width: Number(trovato[1]), height: Number(trovato[2]) }
    : null;
}

/* Coordinata (x o y) dei gruppi: serve a contare colonne e righe della
 * griglia senza fidarsi solo del viewBox. */
function coordinateGlifi(svg, asse) {
  const valori = new Set();
  const re = /translate\((-?[\d.]+) (-?[\d.]+)\)/g;
  let trovato;
  while ((trovato = re.exec(String(svg)))) {
    valori.add(asse === "x" ? trovato[1] : trovato[2]);
  }
  return valori.size;
}

/* Distanza in linea d'aria tra inizio e fine dell'anello: un cerchio
 * davvero aperto ha una corda non nulla. */
function aperturaAnello(pathD) {
  const secondoM = pathD.indexOf("M", 1);
  const anello = secondoM > 0 ? pathD.slice(0, secondoM) : pathD;
  const punti = anello.match(/[ML](-?[\d.]+) (-?[\d.]+)/g) || [];
  if (punti.length < 2) return 0;
  const primo = punti[0].slice(1).split(" ").map(Number);
  const ultimo = punti[punti.length - 1].slice(1).split(" ").map(Number);
  return Math.hypot(primo[0] - ultimo[0], primo[1] - ultimo[1]);
}

function anelliDi(svg) {
  return [...String(svg).matchAll(/<g class="glifo"[^>]*><path d="([^"]+)"/g)]
    .map((trovato) => trovato[1]);
}

const TEMI_ATTESI = [
  "classico",
  "pinocchio",
  "ufficio",
  "burocrazia",
  "cucina",
  "astronomia",
  "fantascienza",
  "hipster",
  "neo",
  "heptapod"
];

const PAROLE_FUNZIONE_IT = new Set([
  "a", "ad", "al", "alla", "alle", "agli", "ai", "allo", "con", "da",
  "dal", "dalla", "dalle", "dagli", "dai", "dallo", "de", "del", "della",
  "delle", "degli", "dei", "dello", "di", "e", "ed", "fra", "gli", "i",
  "il", "in", "la", "le", "lo", "nel", "nella", "nelle", "negli", "nei",
  "nello", "o", "per", "su", "sul", "sulla", "sulle", "sugli", "sui",
  "sullo", "tra", "un", "una", "uno"
]);

/* ------------------------------------------------------------------ */
/* Caricamento del motore                                              */
/* ------------------------------------------------------------------ */

verifica(engine && typeof engine === "object", "LoremEngine non è stato esposto");
verifica(
  engine && typeof engine.themes === "function",
  "LoremEngine.themes non è una funzione"
);
verifica(
  engine && typeof engine.generate === "function",
  "LoremEngine.generate non è una funzione"
);

const sorgenteMotore = fs.readFileSync(enginePath, "utf8");
verifica(
  !/Math\.random/.test(sorgenteMotore),
  "engine.js contiene Math.random: l'output deve dipendere solo dal seed"
);
verifica(
  !/console\./.test(sorgenteMotore),
  "engine.js contiene console.*: deve restare silenzioso"
);

/* ------------------------------------------------------------------ */
/* Catalogo dei temi e qualità dei corpora                             */
/* ------------------------------------------------------------------ */

const elencoTemi = engine.themes();
verifica(
  Array.isArray(elencoTemi),
  "themes() non restituisce un array"
);
verificaUguale(TEMI_ATTESI.length, elencoTemi.length, "numero di temi");
verificaUguale(
  TEMI_ATTESI.slice().sort().join(","),
  elencoTemi
    .map((t) => t.id)
    .sort()
    .join(","),
  "id dei temi"
);

const frasiViste = new Map();

for (const id of TEMI_ATTESI) {
  const tema = themes[id];
  verifica(!!tema, `tema mancante nel file: ${id}`);
  if (!tema) continue;

  const scheda = elencoTemi.find((t) => t.id === id);
  verifica(!!scheda, `themes() non elenca il tema ${id}`);
  if (scheda) {
    verifica(
      typeof scheda.label === "string" && scheda.label.trim().length > 0,
      `${id}: label vuota`
    );
    verifica(
      scheda.lang === "it" || scheda.lang === "la" || scheda.lang === "neo",
      `${id}: lang inattesa "${scheda.lang}"`
    );
    verifica(
      typeof scheda.about === "string" && scheda.about.trim().length > 0,
      `${id}: about vuota`
    );
  }

  verifica(
    Array.isArray(tema.sentences) && tema.sentences.length >= 40,
    `${id}: servono almeno 40 frasi (trovate ${
      Array.isArray(tema.sentences) ? tema.sentences.length : 0
    })`
  );
  verifica(
    Array.isArray(tema.words) && tema.words.length >= 120,
    `${id}: servono almeno 120 parole/locuzioni (trovate ${
      Array.isArray(tema.words) ? tema.words.length : 0
    })`
  );

  const frasiLocali = new Set();
  for (const frase of tema.sentences) {
    verifica(
      typeof frase === "string" && frase.trim() === frase && frase.length > 10,
      `${id}: frase vuota o con spazi ai bordi`
    );
    verifica(
      !/\s{2,}/.test(frase),
      `${id}: frase con doppi spazi — "${frase}"`
    );
    verifica(
      /[.!?]$/.test(frase),
      `${id}: frase senza punteggiatura finale — "${frase}"`
    );
    verifica(
      /^[A-ZÀ-ÖØ-Ý]/.test(frase),
      `${id}: frase che non inizia con maiuscola — "${frase}"`
    );
    verifica(
      !frasiLocali.has(frase),
      `${id}: frase duplicata nel tema — "${frase}"`
    );
    frasiLocali.add(frase);

    if (frasiViste.has(frase)) {
      verifica(
        false,
        `frase ripetuta tra temi "${frasiViste.get(frase)}" e "${id}" — "${frase}"`
      );
    } else {
      frasiViste.set(frase, id);
    }
  }

  const paroleLocali = new Set();
  for (const parola of tema.words) {
    verifica(
      typeof parola === "string" && parola.trim() === parola && parola.length > 0,
      `${id}: parola vuota o con spazi ai bordi`
    );
    verifica(
      !/\s{2,}/.test(parola),
      `${id}: parola con doppi spazi — "${parola}"`
    );
    verifica(
      !paroleLocali.has(parola),
      `${id}: parola duplicata nel tema — "${parola}"`
    );
    paroleLocali.add(parola);
  }
}

/* ------------------------------------------------------------------ */
/* Temi v2: vincoli specifici della sezione «Aggiunta v2»              */
/* ------------------------------------------------------------------ */

{
  const neo = themes.neo;
  const heptapod = themes.heptapod;

  verifica(!!neo, 'tema "neo" mancante');
  if (neo) {
    verificaUguale("Neo", neo.label, "neo: label");
    verificaUguale("neo", neo.lang, "neo: lang");
    verifica(
      /imitazione dichiarata, non una traduzione/.test(neo.about || ""),
      "neo: about senza la dicitura «imitazione dichiarata, non una traduzione»"
    );
    verifica(
      (neo.sentences || []).length >= 30,
      "neo: servono almeno 30 frasi"
    );
    verifica((neo.words || []).length >= 90, "neo: servono almeno 90 voci");
  }

  verifica(!!heptapod, 'tema "heptapod" mancante');
  if (heptapod) {
    verificaUguale("Eptapodi", heptapod.label, "heptapod: label");
    verificaUguale("it", heptapod.lang, "heptapod: lang");
    verifica(
      /Arrival/.test(heptapod.about || "") &&
        /Chiang/.test(heptapod.about || ""),
      "heptapod: about non cita Arrival e Ted Chiang"
    );
    verifica(
      /nessuna citazione/i.test(heptapod.about || ""),
      "heptapod: about non dichiara l'assenza di citazioni"
    );
    verifica(
      (heptapod.sentences || []).length >= 30,
      "heptapod: servono almeno 30 frasi"
    );
    verifica(
      (heptapod.words || []).length >= 90,
      "heptapod: servono almeno 90 voci"
    );
  }
}

/* ------------------------------------------------------------------ */
/* Controlli per tema                                                  */
/* ------------------------------------------------------------------ */

function controllaTestoPiano(testo, etichetta) {
  const testoPulito = String(testo).replace(/\n+/g, "\n");
  for (const blocco of testoPulito.split("\n")) {
    verifica(
      !/\s{2,}/.test(blocco),
      `${etichetta}: doppi spazi nel testo`
    );
    verifica(
      blocco.trim() === blocco,
      `${etichetta}: spazi ai bordi di un blocco`
    );
    verifica(
      !/\s[,.;:!?]/.test(blocco),
      `${etichetta}: spazio prima della punteggiatura`
    );
    verifica(
      !/[,.;:!?]{2,}/.test(blocco.replace(/\.\.\./g, "")),
      `${etichetta}: punteggiatura ripetuta`
    );
    verifica(
      !/(^|\s)[,;:!?]/.test(blocco),
      `${etichetta}: punteggiatura a inizio parola`
    );
  }
}

function controllaFrasiComplete(testo, etichetta) {
  /* Si separa solo alla punteggiatura seguita da spazio o fine testo, così
   * i punti interni (per esempio "lorel.lol") non spezzano la frase. */
  const frammenti = String(testo)
    .trim()
    .split(/(?<=[.!?])\s+/);
  for (const frammento of frammenti) {
    verifica(
      /[.!?]$/.test(frammento),
      `${etichetta}: frase senza punteggiatura finale — "${frammento.slice(0, 60)}"`
    );
  }
}

for (const id of TEMI_ATTESI) {
  const tema = themes[id];
  if (!tema) continue;
  const lingua = tema.lang || "it";
  const etichetta = `[${id}]`;

  /* Determinismo: stesso seed, stesso testo. */
  for (const unit of ["paragraphs", "sentences", "words"]) {
    const a = engine.generate({ theme: id, unit, count: 3, seed: 4242 });
    const b = engine.generate({ theme: id, unit, count: 3, seed: 4242 });
    verificaUguale(a.text, b.text, `${etichetta} determinismo ${unit}`);
  }

  /* unit: words — conteggio esatto. */
  for (const count of [1, 7, 25, 200]) {
    const esito = engine.generate({
      theme: id,
      unit: "words",
      count,
      seed: 101
    });
    verificaUguale(
      count,
      contaParole(esito.text),
      `${etichetta} words=${count}: numero di parole`
    );
    verificaUguale(
      count,
      esito.meta.words,
      `${etichetta} words=${count}: meta.words`
    );
    verificaUguale(
      0,
      esito.meta.sentences,
      `${etichetta} words=${count}: meta.sentences`
    );
    controllaTestoPiano(esito.text, `${etichetta} words=${count}`);
    if ((tema.lang || "it") === "it") {
      const intrusi = esito.text
        .split(/\s+/)
        .filter((parola) => PAROLE_FUNZIONE_IT.has(parola.toLowerCase()));
      verifica(
        intrusi.length === 0,
        `${etichetta} words=${count}: parole funzione isolate (${intrusi.join(", ")})`
      );
    }
  }

  /* unit: sentences — conteggio esatto. */
  for (const count of [1, 5, 17, 50]) {
    const esito = engine.generate({
      theme: id,
      unit: "sentences",
      count,
      seed: 202
    });
    verificaUguale(
      count,
      contaFrasi(esito.text),
      `${etichetta} sentences=${count}: numero di frasi`
    );
    verificaUguale(
      count,
      esito.meta.sentences,
      `${etichetta} sentences=${count}: meta.sentences`
    );
    controllaTestoPiano(esito.text, `${etichetta} sentences=${count}`);
    controllaFrasiComplete(esito.text, `${etichetta} sentences=${count}`);
  }

  /* unit: paragraphs — numero esatto, 3–6 frasi ciascuno, varietà. */
  for (const count of [1, 3, 12]) {
    const esito = engine.generate({
      theme: id,
      unit: "paragraphs",
      count,
      seed: 303
    });
    const paragrafi = blocchi(esito.text);
    verificaUguale(
      count,
      paragrafi.length,
      `${etichetta} paragraphs=${count}: numero di paragrafi`
    );
    verificaUguale(
      count,
      esito.meta.count,
      `${etichetta} paragraphs=${count}: meta.count`
    );
    verifica(
      esito.meta.sentences >= count * 3 && esito.meta.sentences <= count * 6,
      `${etichetta} paragraphs=${count}: meta.sentences fuori intervallo (${esito.meta.sentences})`
    );
    for (let i = 0; i < paragrafi.length; i++) {
      const numeroFrasi = contaFrasi(paragrafi[i]);
      verifica(
        numeroFrasi >= 3 && numeroFrasi <= 6,
        `${etichetta} paragraphs=${count}: paragrafo ${i} con ${numeroFrasi} frasi`
      );
    }
    controllaTestoPiano(esito.text, `${etichetta} paragraphs=${count}`);
    controllaFrasiComplete(esito.text, `${etichetta} paragraphs=${count}`);

    /* Nessun paragrafo identico a un altro nello stesso output. */
    const unici = new Set(paragrafi);
    verificaUguale(
      paragrafi.length,
      unici.size,
      `${etichetta} paragraphs=${count}: paragrafi duplicati`
    );
  }

  /* html: paragrafi incapsulati in <p>. */
  {
    const esito = engine.generate({
      theme: id,
      unit: "paragraphs",
      count: 2,
      html: true,
      seed: 404
    });
    const aperture = (esito.text.match(/<p>/g) || []).length;
    const chiusure = (esito.text.match(/<\/p>/g) || []).length;
    verificaUguale(2, aperture, `${etichetta} html: numero di <p>`);
    verificaUguale(2, chiusure, `${etichetta} html: numero di </p>`);
    verifica(
      /^<p>[\s\S]*<\/p>$/.test(esito.text),
      `${etichetta} html: struttura non valida`
    );
    verifica(
      !/<p>\s*<\/p>/.test(esito.text),
      `${etichetta} html: paragrafo vuoto`
    );
  }

  /* html anche su sentences/words: un solo blocco <p>. */
  {
    const esito = engine.generate({
      theme: id,
      unit: "sentences",
      count: 3,
      html: true,
      seed: 405
    });
    verifica(
      esito.text.startsWith("<p>") && esito.text.endsWith("</p>"),
      `${etichetta} html sentences: <p> mancante`
    );
  }

  /* markdown: paragrafi separati da riga vuota. */
  {
    const esito = engine.generate({
      theme: id,
      unit: "paragraphs",
      count: 2,
      markdown: true,
      seed: 406
    });
    verifica(
      !esito.text.includes("<p>"),
      `${etichetta} markdown: contiene HTML`
    );
    verificaUguale(
      2,
      blocchi(esito.text).length,
      `${etichetta} markdown: separazione tra paragrafi`
    );
  }

  /* json: stringa valida con {theme, paragraphs}. */
  {
    const esito = engine.generate({
      theme: id,
      unit: "paragraphs",
      count: 2,
      json: true,
      seed: 407
    });
    let dati = null;
    try {
      dati = JSON.parse(esito.text);
    } catch (errore) {
      verifica(false, `${etichetta} json: JSON non valido`);
    }
    if (dati) {
      verificaUguale(id, dati.theme, `${etichetta} json: theme`);
      verifica(
        Array.isArray(dati.paragraphs),
        `${etichetta} json: paragraphs non è un array`
      );
      verificaUguale(
        2,
        Array.isArray(dati.paragraphs) ? dati.paragraphs.length : -1,
        `${etichetta} json: numero di paragrafi`
      );
      for (const paragrafo of dati.paragraphs || []) {
        verifica(
          typeof paragrafo === "string" && paragrafo.length > 0,
          `${etichetta} json: paragrafo vuoto`
        );
      }
    }
    /* json ha la precedenza su html. */
    const misto = engine.generate({
      theme: id,
      unit: "paragraphs",
      count: 1,
      json: true,
      html: true,
      seed: 408
    });
    verifica(
      misto.text.trim().startsWith("{"),
      `${etichetta} json: html ha sovrascritto il JSON`
    );
  }

  /* Meta coerenti sull'uscita. */
  {
    const esito = engine.generate({
      theme: id,
      unit: "paragraphs",
      count: 2,
      seed: 409
    });
    verificaUguale(id, esito.meta.theme, `${etichetta} meta.theme`);
    verificaUguale("paragraphs", esito.meta.unit, `${etichetta} meta.unit`);
    verifica(
      esito.meta.words > 0,
      `${etichetta} meta.words non positiva`
    );
    verifica(
      esito.meta.words === contaParole(esito.text),
      `${etichetta} meta.words non corrisponde al testo`
    );
  }

  /* La lingua del tema determina i connettivi: nessun testo vuoto. */
  verifica(
    lingua === "it" || lingua === "la" || lingua === "neo",
    `${etichetta} lingua inattesa`
  );
}

/* ------------------------------------------------------------------ */
/* startClassic                                                        */
/* ------------------------------------------------------------------ */

{
  const conIncipit = engine.generate({
    theme: "classico",
    unit: "paragraphs",
    count: 2,
    startClassic: true,
    seed: 500
  });
  const primoParagrafo = blocchi(conIncipit.text)[0] || "";
  verifica(
    primoParagrafo.startsWith("Lorem ipsum dolor sit amet"),
    "startClassic: il primo paragrafo non è l'incipit latino canonico"
  );
  verificaUguale(
    2,
    blocchi(conIncipit.text).length,
    "startClassic: numero di paragrafi"
  );

  const senzaIncipit = engine.generate({
    theme: "classico",
    unit: "paragraphs",
    count: 2,
    seed: 500
  });
  verifica(
    senzaIncipit.text !== conIncipit.text,
    "startClassic: nessuna differenza rispetto alla generazione normale"
  );

  const soloIncipit = engine.generate({
    theme: "classico",
    unit: "paragraphs",
    count: 1,
    startClassic: true,
    seed: 501
  });
  verifica(
    soloIncipit.text.startsWith("Lorem ipsum dolor sit amet"),
    "startClassic: con count=1 manca l'incipit"
  );
  verificaUguale(
    1,
    blocchi(soloIncipit.text).length,
    "startClassic: con count=1 numero di paragrafi"
  );

  const altroTema = engine.generate({
    theme: "pinocchio",
    unit: "paragraphs",
    count: 2,
    startClassic: true,
    seed: 502
  });
  verifica(
    !altroTema.text.startsWith("Lorem ipsum dolor sit amet"),
    "startClassic: applicato a un tema diverso da classico"
  );

  const suFrasi = engine.generate({
    theme: "classico",
    unit: "sentences",
    count: 3,
    startClassic: true,
    seed: 503
  });
  verifica(
    !suFrasi.text.startsWith("Lorem ipsum dolor sit amet"),
    "startClassic: applicato a unit diverso da paragraphs"
  );
}

/* ------------------------------------------------------------------ */
/* Formato logogrammi                                                  */
/* ------------------------------------------------------------------ */

{
  const ETICHETTA = "logogrammi";
  const COLORE_FISSO = /(#[0-9a-fA-F]{3,8}\b)|\brgb\(|\bhsl\(/;

  for (const id of TEMI_ATTESI) {
    const a = engine.generate({
      theme: id,
      count: 9,
      seed: 31415,
      logogram: true
    });
    const b = engine.generate({
      theme: id,
      count: 9,
      seed: 31415,
      logogram: true
    });
    const c = engine.generate({
      theme: id,
      count: 9,
      seed: 31416,
      logogram: true
    });
    const etichetta = `[${id}] ${ETICHETTA}`;

    /* Struttura dell'SVG. */
    verifica(a.text.startsWith("<svg"), `${etichetta}: non inizia con <svg`);
    verifica(a.text.endsWith("</svg>"), `${etichetta}: non finisce con </svg>`);
    verifica(
      (a.text.match(/<svg\b/g) || []).length === 1,
      `${etichetta}: più di un elemento <svg>`
    );
    verifica(
      /viewBox="0 0 [\d.]+ [\d.]+"/.test(a.text),
      `${etichetta}: manca viewBox`
    );
    verifica(/role="img"/.test(a.text), `${etichetta}: manca role="img"`);
    verifica(
      /<title>Logogrammi eptapodi, 9 glifi<\/title>/.test(a.text),
      `${etichetta}: <title> mancante o non in italiano`
    );
    verifica(
      /aria-label="Logogrammi eptapodi, 9 glifi"/.test(a.text),
      `${etichetta}: aria-label mancante o non coerente`
    );
    verifica(
      /stroke="currentColor"/.test(a.text),
      `${etichetta}: stroke non è currentColor`
    );
    verifica(/fill="none"/.test(a.text), `${etichetta}: fill non è none`);
    verifica(
      !COLORE_FISSO.test(a.text),
      `${etichetta}: contiene un colore fisso`
    );

    /* Glifi, metadati, determinismo. */
    verificaUguale(9, contaGlifi(a.text), `${etichetta}: numero di glifi`);
    verificaUguale(9, a.meta.count, `${etichetta}: meta.count`);
    verificaUguale(9, a.meta.glyphs, `${etichetta}: meta.glyphs`);
    verificaUguale(0, a.meta.words, `${etichetta}: meta.words`);
    verificaUguale("logograms", a.meta.unit, `${etichetta}: meta.unit`);
    verificaUguale(id, a.meta.theme, `${etichetta}: meta.theme`);
    verificaUguale(a.text, b.text, `${etichetta}: determinismo byte per byte`);
    verifica(
      a.text !== c.text,
      `${etichetta}: seed diversi producono lo stesso SVG`
    );
    verifica(
      (a.text.match(/<g\b/g) || []).length ===
        (a.text.match(/<\/g>/g) || []).length,
      `${etichetta}: tag <g> non bilanciati`
    );
    verifica(
      (a.text.match(/<g class="glifo"/g) || []).length ===
        (a.text.match(/<\/g>/g) || []).length - 1,
      `${etichetta}: gruppi dei glifi non coerenti`
    );
    verifica(
      (a.text.match(/C/g) || []).length >= 9,
      `${etichetta}: nessun tendril (comandi C) nei glifi`
    );

    /* unit ignorata: anche un'unità inesistente non deve far fallire. */
    const ignoraUnita = engine.generate({
      theme: id,
      unit: "righe",
      count: 2,
      seed: 5,
      logogram: true
    });
    verificaUguale(
      2,
      contaGlifi(ignoraUnita.text),
      `${etichetta}: unit non ignorata`
    );

    /* Precedenza su html, markdown e json. */
    const precedenza = engine.generate({
      theme: id,
      count: 2,
      seed: 5,
      logogram: true,
      html: true,
      markdown: true,
      json: true
    });
    verifica(
      precedenza.text.startsWith("<svg"),
      `${etichetta}: html/markdown/json hanno preceduto logogram`
    );
  }

  /* Limiti: 1 e 48 glifi, default, dimensione esatta della griglia. */
  const uno = engine.generate({
    theme: "heptapod",
    count: 1,
    seed: 1,
    logogram: true
  });
  verificaUguale(1, contaGlifi(uno.text), "logogrammi: count=1");
  verificaUguale(1, uno.meta.glyphs, "logogrammi: meta.glyphs con count=1");

  const massimo = engine.generate({
    theme: "heptapod",
    count: 48,
    seed: 1,
    logogram: true
  });
  verificaUguale(48, contaGlifi(massimo.text), "logogrammi: count=48");
  verificaUguale(48, massimo.meta.glyphs, "logogrammi: meta.glyphs con count=48");
  const vbUno = viewBoxDi(uno.text);
  const vbMax = viewBoxDi(massimo.text);
  verifica(!!vbUno && !!vbMax, "logogrammi: viewBox non leggibile");
  if (vbUno && vbMax) {
    verificaUguale(152, vbUno.width, "logogrammi: viewBox di 1 glifo (larghezza)");
    verificaUguale(152, vbUno.height, "logogrammi: viewBox di 1 glifo (altezza)");
    verificaUguale(592, vbMax.width, "logogrammi: viewBox di 48 glifi (larghezza)");
    verificaUguale(768, vbMax.height, "logogrammi: viewBox di 48 glifi (altezza)");
    verifica(
      vbMax.width <= 1200,
      `logogrammi: larghezza ${vbMax.width} oltre 1200 unità`
    );
    verifica(
      vbMax.height > vbUno.height,
      "logogrammi: la griglia da 48 glifi non va a capo"
    );
    verificaUguale(
      6,
      coordinateGlifi(massimo.text, "x"),
      "logogrammi: massimo 6 glifi per riga"
    );
    verificaUguale(
      8,
      coordinateGlifi(massimo.text, "y"),
      "logogrammi: 48 glifi su 8 righe"
    );
  }

  /* Griglia da 12 glifi: 6 per riga, 2 righe, viewBox 592×240. */
  const dodici = engine.generate({
    theme: "heptapod",
    count: 12,
    seed: 7,
    logogram: true
  });
  const vbDodici = viewBoxDi(dodici.text);
  verifica(!!vbDodici, "logogrammi: viewBox di 12 glifi non leggibile");
  if (vbDodici) {
    verificaUguale(592, vbDodici.width, "logogrammi: 12 glifi, larghezza 592");
    verificaUguale(240, vbDodici.height, "logogrammi: 12 glifi, altezza 240");
    verificaUguale(6, coordinateGlifi(dodici.text, "x"), "logogrammi: 12 glifi, 6 colonne");
    verificaUguale(2, coordinateGlifi(dodici.text, "y"), "logogrammi: 12 glifi, 2 righe");
  }

  /* Griglia da 6 e da 7: il salto di riga è netto. */
  const sei = engine.generate({
    theme: "heptapod",
    count: 6,
    seed: 2,
    logogram: true
  });
  const sette = engine.generate({
    theme: "heptapod",
    count: 7,
    seed: 2,
    logogram: true
  });
  const vbSei = viewBoxDi(sei.text);
  const vbSette = viewBoxDi(sette.text);
  if (vbSei && vbSette) {
    verificaUguale(592, vbSei.width, "logogrammi: 6 glifi, larghezza 592");
    verificaUguale(152, vbSei.height, "logogrammi: 6 glifi, altezza 152");
    verificaUguale(592, vbSette.width, "logogrammi: 7 glifi, larghezza 592");
    verificaUguale(240, vbSette.height, "logogrammi: 7 glifi, altezza 240");
    verificaUguale(2, coordinateGlifi(sette.text, "y"), "logogrammi: 7 glifi su 2 righe");
  }

  /* Forma: anelli aperti, glifi tutti diversi, nessun tratto chiuso. */
  const anelli = anelliDi(dodici.text);
  verificaUguale(12, anelli.length, "logogrammi: anelli non estraibili");
  verifica(
    !/Z/.test(dodici.text),
    "logogrammi: un glifo chiude il cerchio con Z"
  );
  verificaUguale(
    anelli.length,
    new Set(anelli).size,
    "logogrammi: glifi identici nello stesso SVG"
  );
  if (anelli.length) {
    const aperture = anelli.map(aperturaAnello);
    verifica(
      aperture.every((valore) => valore > 3),
      "logogrammi: qualche anello sembra chiuso"
    );
    verifica(
      Math.max(...aperture) > 25,
      "logogrammi: nessun glifo con apertura netta"
    );
  }
  verifica(
    anelli.join("|") !==
      anelliDi(
        engine.generate({
          theme: "heptapod",
          count: 12,
          seed: 8,
          logogram: true
        }).text
      ).join("|"),
    "logogrammi: due seed diversi disegnano gli stessi glifi"
  );

  const predefinito = engine.generate({
    theme: "heptapod",
    seed: 1,
    logogram: true
  });
  verificaUguale(
    12,
    contaGlifi(predefinito.text),
    "logogrammi: count predefinito"
  );
  verificaUguale(12, predefinito.meta.count, "logogrammi: meta.count predefinito");
  const vbPredefinito = viewBoxDi(predefinito.text);
  if (vbPredefinito) {
    verificaUguale(592, vbPredefinito.width, "logogrammi: default, larghezza");
    verificaUguale(240, vbPredefinito.height, "logogrammi: default, altezza");
  }
}

/* ------------------------------------------------------------------ */
/* Input invalidi: errori lanciati, messaggi in italiano                */
/* ------------------------------------------------------------------ */

verificaErrore(
  () => engine.generate({ theme: "tema-inesistente" }),
  /[Tt]ema inesistente/,
  "tema inesistente"
);
verificaErrore(
  () => engine.generate({ unit: "paragraphs", count: 0 }),
  /paragraf/i,
  "paragrafi count=0"
);
verificaErrore(
  () => engine.generate({ unit: "paragraphs", count: 13 }),
  /paragraf/i,
  "paragrafi count=13"
);
verificaErrore(
  () => engine.generate({ unit: "sentences", count: 0 }),
  /frasi/i,
  "frasi count=0"
);
verificaErrore(
  () => engine.generate({ unit: "sentences", count: 51 }),
  /frasi/i,
  "frasi count=51"
);
verificaErrore(
  () => engine.generate({ unit: "words", count: 0 }),
  /parole/i,
  "parole count=0"
);
verificaErrore(
  () => engine.generate({ unit: "words", count: 501 }),
  /parole/i,
  "parole count=501"
);
verificaErrore(
  () => engine.generate({ unit: "paragraphs", count: 2.5 }),
  /intero/i,
  "count non intero"
);
verificaErrore(
  () => engine.generate({ unit: "righe", count: 2 }),
  /[Uu]nità non valida/,
  "unità inesistente"
);
verificaErrore(
  () => engine.generate({ seed: "abc" }),
  /[Ss]eed non valido/,
  "seed non numerico"
);
verificaErrore(
  () => engine.generate({ theme: "heptapod", count: 0, logogram: true }),
  /glifi/i,
  "logogrammi: count=0"
);
verificaErrore(
  () => engine.generate({ theme: "heptapod", count: 49, logogram: true }),
  /glifi/i,
  "logogrammi: count=49"
);
verificaErrore(
  () => engine.generate({ theme: "heptapod", count: 2.5, logogram: true }),
  /intero/i,
  "logogrammi: count non intero"
);
verificaErrore(
  () => engine.generate({ theme: "tema-inesistente", logogram: true }),
  /[Tt]ema inesistente/,
  "logogrammi: tema inesistente"
);
verificaErrore(
  () => engine.generate({ theme: "heptapod", seed: "abc", logogram: true }),
  /[Ss]eed non valido/,
  "logogrammi: seed non numerico"
);

/* ------------------------------------------------------------------ */
/* Riepilogo                                                           */
/* ------------------------------------------------------------------ */

const esitoTemi = [];
for (const id of TEMI_ATTESI) {
  const tema = themes[id];
  if (!tema) continue;
  esitoTemi.push({
    id,
    lang: tema.lang,
    frasi: tema.sentences.length,
    parole: tema.words.length,
    token: tema.words.join(" ").split(/\s+/).length
  });
}

console.log("");
console.log("Test motore lorem.lorel.lol");
console.log("===========================");
console.log("");
console.log("Temi caricati:");
for (const t of esitoTemi) {
  console.log(
    `  ${t.id.padEnd(14)} lang=${t.lang}  frasi=${String(t.frasi).padStart(2)}  ` +
      `voci=${String(t.parole).padStart(3)}  token=${String(t.token).padStart(3)}`
  );
}
console.log("");
console.log(`Controlli eseguiti: ${controlli}`);

if (fallimenti.length > 0) {
  console.log(`Falliti: ${fallimenti.length}`);
  console.log("");
  for (const messaggio of fallimenti) console.log(`  ✗ ${messaggio}`);
  console.log("");
  console.log("Esito: FALLITO");
  process.exitCode = 1;
} else {
  console.log("Falliti: 0");
  console.log("");
  console.log("Esito: SUPERATO");
}
