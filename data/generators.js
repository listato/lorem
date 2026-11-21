/* Catalogo dei generatori di lorem ipsum della lista awesome-ipsum.
   Fonte: https://github.com/templeman/awesome-ipsum (licenza CC0-1.0 dichiarata nel README).
   Le voci sono scritte a mano in italiano; lo stato HTTP è l'esito reale
   dell'ultima esecuzione di tools/check-links.py, non una stima.
   Caricato con <script src="data/generators.js">, espone window.LOREM_CATALOG. */
window.LOREM_CATALOG = {
  "meta": {
    "source": "awesome-ipsum",
    "sourceUrl": "https://github.com/templeman/awesome-ipsum",
    "license": "CC0-1.0, dichiarata nel README della lista (nessun file LICENSE nella repository)",
    "fetched": "2026-11-21",
    "checked": "2026-11-21",
    "total": 88
  },
  "categories": [
    {
      "id": "practical",
      "label": "Pratici",
      "blurb": "Generatori generalisti: latino classico, lingue diverse, formati di uscita e API pronte all'uso."
    },
    {
      "id": "animals",
      "label": "Animali",
      "blurb": "Testi ispirati al mondo animale, dal gatto al cane allo zombie."
    },
    {
      "id": "people",
      "label": "Personaggi",
      "blurb": "Riempitivi costruiti sulle frasi celebri di persone reali, dal politico allo scienziato."
    },
    {
      "id": "music",
      "label": "Musica",
      "blurb": "Il testo prende forma dai testi delle canzoni e dai musicisti."
    },
    {
      "id": "food",
      "label": "Cibo e bevande",
      "blurb": "La categoria più nutriente: carne, formaggio, caffè, dolci e alcolici."
    },
    {
      "id": "geography",
      "label": "Luoghi e dialetti",
      "blurb": "Generatori legati a un territorio o a una parlata, dall'Australia alla Baviera."
    },
    {
      "id": "literature",
      "label": "Letteratura",
      "blurb": "Riempitivi che attingono a libri, autori e mondi narrativi."
    },
    {
      "id": "misc",
      "label": "Vari",
      "blurb": "Tutto ciò che non sta altrove: ufficio, business, subculture, esperimenti."
    },
    {
      "id": "tvfilm",
      "label": "TV e cinema",
      "blurb": "Personaggi e battute di serie televisive e film."
    },
    {
      "id": "tools",
      "label": "Strumenti",
      "blurb": "Non solo pagine web: plugin, estensioni, librerie, app e strumenti da riga di comando."
    }
  ],
  "generators": [
    {
      "id": "adhesiontext",
      "name": "Adhesiontext",
      "url": "https://adhesiontext.com/",
      "category": "practical",
      "tags": [],
      "langs": [
        "fr",
        "de",
        "es",
        "ca",
        "pt",
        "nl",
        "tr",
        "sl"
      ],
      "what": "Genera parole che usano solo i caratteri scelti, utile per testare larghezze e glifi di un font.",
      "status": "up",
      "http": 200,
      "note": "Non è un generatore di frasi: lavora sulle singole parole ammesse."
    },
    {
      "id": "blind-text-generator",
      "name": "Blind Text Generator",
      "url": "https://www.blindtextgenerator.com/lorem-ipsum",
      "category": "practical",
      "tags": [
        "html",
        "polysource"
      ],
      "langs": [
        "ru",
        "cs",
        "it",
        "es",
        "fr",
        "de"
      ],
      "what": "Testo riempitivo classico in molte varianti, con opzioni HTML e lingue diverse dall'inglese.",
      "status": "up",
      "http": 200
    },
    {
      "id": "corporatelorem",
      "name": "CorporateLorem",
      "url": "https://corporatelorem.woblick.dev/",
      "category": "practical",
      "tags": [
        "api",
        "github",
        "json"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempie la pagina con articoli veri da giornali e blog, restituibili anche via API JSON.",
      "status": "up",
      "http": 200
    },
    {
      "id": "faux-texte",
      "name": "Faux Texte",
      "url": "https://www.faux-texte.com/",
      "category": "practical",
      "tags": [
        "html",
        "polysource"
      ],
      "langs": [
        "fr"
      ],
      "what": "Generatore francese con stili diversi e opzione per l'HTML, pensato per il pubblico francofono.",
      "status": "up",
      "http": 200
    },
    {
      "id": "jipsum",
      "name": "Jipsum",
      "url": "https://jipsum.com/",
      "category": "practical",
      "tags": [
        "html"
      ],
      "langs": [
        "en"
      ],
      "what": "Lorem ipsum casuale, con scelta della lunghezza e del formato; all'occorrenza include i tag HTML.",
      "status": "up",
      "http": 200
    },
    {
      "id": "journo-ipsum",
      "name": "Journo Ipsum",
      "url": "https://www.niemanlab.org/journo-ipsum/",
      "category": "practical",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Pensato per chi progetta testate e newsletter: il testo pesca dal gergo del giornalismo.",
      "status": "up",
      "http": 200
    },
    {
      "id": "lipsum-pro",
      "name": "Lipsum.pro",
      "url": "https://lipsum.pro/",
      "category": "practical",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Generatore veloce da usare col mouse: si sceglie la quantità e si copia il testo in un clic.",
      "status": "up",
      "http": 200
    },
    {
      "id": "lorem-2",
      "name": "Lorem 2",
      "url": "https://lorem2.com/",
      "category": "practical",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo statico essenziale: pagine di testo latino pronte senza impostazioni da toccare.",
      "status": "up",
      "http": 200
    },
    {
      "id": "lorem-ipsum",
      "name": "Lorem Ipsum",
      "url": "https://www.lipsum.com/",
      "category": "practical",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "L'originale lorem ipsum, con paragrafi, frasi, parole e la scelta di iniziare dal testo canonico.",
      "status": "up",
      "http": 200
    },
    {
      "id": "lorem-markdown",
      "name": "Lorem Markdown",
      "url": "http://jaspervdj.be/lorem-markdownum/",
      "category": "practical",
      "tags": [
        "api",
        "github",
        "markdown"
      ],
      "langs": [
        "en"
      ],
      "what": "Genera testo già strutturato in Markdown, con titoli e liste, ed espone un'API e il codice.",
      "status": "up",
      "http": 200
    },
    {
      "id": "amazing-lorem-ipsum-generator",
      "name": "The Amazing Lorem Ipsum Generator",
      "url": "http://www.i-r-genius.com/lipsum.html",
      "category": "practical",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Generatore classico con parecchie opzioni di formattazione, dai paragrafi ai marcatori HTML.",
      "status": "dead",
      "http": 404
    },
    {
      "id": "wizipsum",
      "name": "Wizipsum",
      "url": "https://wizbii.github.io/wizipsum/",
      "category": "practical",
      "tags": [
        "github",
        "npm",
        "polysource",
        "chrome"
      ],
      "langs": [
        "en"
      ],
      "what": "Permette di usare contenuti propri e condividerli; è anche pacchetto npm ed estensione Chrome.",
      "status": "up",
      "http": 200
    },
    {
      "id": "wp-ipsum",
      "name": "WP Ipsum",
      "url": "https://wpshout.com/wp-ipsum-generator/",
      "category": "practical",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo in salsa WordPress, con gergo da redazione e da plugin; il codice sta su GitHub.",
      "status": "up",
      "http": 200,
      "note": "La pagina vive dentro un articolo del blog di WPShout."
    },
    {
      "id": "cat-ipsum",
      "name": "Cat Ipsum",
      "url": "http://www.catipsum.com/",
      "category": "animals",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Testo gattoso con vocali allungate e digressioni feline, per riempire una pagina con ironia.",
      "status": "up",
      "http": 200
    },
    {
      "id": "doggo-ipsum",
      "name": "Doggo Ipsum",
      "url": "https://doggoipsum.com",
      "category": "animals",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Frasi infantili e allegre dal mondo dei cani, con vocaboli storpi in stile doggo.",
      "status": "up",
      "http": 200
    },
    {
      "id": "zombie-ipsum",
      "name": "Zombie Ipsum",
      "url": "http://www.zombieipsum.com/",
      "category": "animals",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Righe da apocalisse zombie, tra grugniti e brandelli di frasi: scuro al punto giusto.",
      "status": "up",
      "http": 200
    },
    {
      "id": "birolipsum",
      "name": "Birolipsum",
      "url": "https://izmcm.github.io/birolipsum/",
      "category": "people",
      "tags": [],
      "langs": [
        "pt"
      ],
      "what": "In portoghese, sul presidente brasiliano Bolsonaro: citazioni e frasi ricorrenti del personaggio.",
      "status": "up",
      "http": 200
    },
    {
      "id": "bob-ross-lipsum",
      "name": "Bob Ross Lipsum",
      "url": "https://www.bobrosslipsum.com/",
      "category": "people",
      "tags": [
        "html"
      ],
      "langs": [
        "en"
      ],
      "what": "Frasi del pittore televisivo Bob Ross, tra alberi felici e nuvole: può includere HTML.",
      "status": "up",
      "http": 200
    },
    {
      "id": "busey-ipsum",
      "name": "Busey Ipsum",
      "url": "http://www.buseyipsum.com/",
      "category": "people",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo costruito sulle uscite dell'attore Gary Busey, con un tono caotico e surreale.",
      "status": "up",
      "http": 200
    },
    {
      "id": "chuck-norris-ipsum",
      "name": "Chuck Norris Facts",
      "url": "http://vincentloy.github.io/chuck_facts_ipsum/",
      "category": "people",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Battute infinite su Chuck Norris, con frasi che seguono sempre lo stesso schema comico.",
      "status": "up",
      "http": 200
    },
    {
      "id": "mussum-ipsum",
      "name": "Mussum Ipsum",
      "url": "https://mussumipsum.com/",
      "category": "people",
      "tags": [],
      "langs": [
        "pt"
      ],
      "what": "In portoghese brasiliano, sul comico Mussum: parole inventate e cadenze del suo personaggio.",
      "status": "up",
      "http": 200
    },
    {
      "id": "neil-degrasse-tyson-ipsum",
      "name": "Neil deGrasse Tyson Ipsum",
      "url": "https://www.neilipsum.pw/",
      "category": "people",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Citazioni dell'astrofisico Neil deGrasse Tyson, tra divulgazione e battute sul cosmo.",
      "status": "up",
      "http": 200
    },
    {
      "id": "nietzsche-ipsum",
      "name": "Nietzsche Ipsum",
      "url": "http://nietzsche-ipsum.com/",
      "category": "people",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Aforismi in stile Nietzsche, tra superuomo, abissi e martelli: riempitivo filosofico.",
      "status": "up",
      "http": 200
    },
    {
      "id": "obama-ipsum",
      "name": "Obama Ipsum",
      "url": "https://obamaipsum.com/",
      "category": "people",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Frasi e slogan del discorso pubblico di Barack Obama, utili per mockup a tema politica.",
      "status": "up",
      "http": 200
    },
    {
      "id": "sagan-ipsum",
      "name": "Sagan Ipsum",
      "url": "http://saganipsum.com/",
      "category": "people",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Fraseggio di Carl Sagan, tra stelle e miliardi: riempitivo dal tono solenne e divulgativo.",
      "status": "up",
      "http": 200
    },
    {
      "id": "dylan-ipsum",
      "name": "Dylan Ipsum",
      "url": "https://brody.fyi/works/side-quests/dylan-ipsum",
      "category": "music",
      "tags": [
        "github",
        "html",
        "npm"
      ],
      "langs": [
        "en"
      ],
      "what": "Pesca dai testi di Bob Dylan: versi e immagini in inglese, con HTML e modulo npm.",
      "status": "up",
      "http": 200
    },
    {
      "id": "nickelback-ipsum",
      "name": "Nickelback Ipsum",
      "url": "https://nickelback-ipsum.com",
      "category": "music",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo con i versi dei Nickelback, per pagine che non chiedono altro che rock.",
      "status": "up",
      "http": 200
    },
    {
      "id": "rush-ipsum",
      "name": "Rush Ipsum",
      "url": "https://rushipsum.herokuapp.com",
      "category": "music",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Frasi ispirate alla band Rush; storicamente ospitato su Heroku, quindi da verificare.",
      "status": "up",
      "http": 200,
      "note": "Ospitato su un sottodominio Heroku, non su un dominio dedicato."
    },
    {
      "id": "bacon-ipsum",
      "name": "Bacon Ipsum",
      "url": "https://baconipsum.com/",
      "category": "food",
      "tags": [
        "api",
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Testo grasso al punto giusto: si sceglie tra solo carne o carne con riempitivo, e c'è l'API.",
      "status": "up",
      "http": 200
    },
    {
      "id": "cajun-ipsum",
      "name": "Cajun Ipsum",
      "url": "https://www.cajunipsum.com/",
      "category": "food",
      "tags": [],
      "langs": [
        "fr-cajun"
      ],
      "what": "Riempitivo in francese cajun della Louisiana, con grafia e lessico locali.",
      "status": "up",
      "http": 200
    },
    {
      "id": "cheeseburger-ipsum",
      "name": "Cheeseburger Ipsum",
      "url": "http://cheeseburgeripsum.com/",
      "category": "food",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo costruito intorno agli hamburger, con un tono pubblicitario e surreale.",
      "status": "up",
      "http": 200
    },
    {
      "id": "coffee-ipsum",
      "name": "Coffee Ipsum",
      "url": "http://coffeeipsum.com/",
      "category": "food",
      "tags": [
        "html"
      ],
      "langs": [
        "en"
      ],
      "what": "Testo al gusto di caffè, con opzione HTML, per progetti che chiedono una carica.",
      "status": "up",
      "http": 200
    },
    {
      "id": "cupcake-ipsum",
      "name": "Cupcake Ipsum",
      "url": "https://cupcakeipsum.com/",
      "category": "food",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo dolce e pasticcere, con parole zuccherate e frasi da vetrina.",
      "status": "up",
      "http": 200
    },
    {
      "id": "lasagna-ipsum",
      "name": "Lasagna Ipsum",
      "url": "https://lasagna-ipsum.netlify.app",
      "category": "food",
      "tags": [
        "api",
        "github",
        "html",
        "json"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo a strati, con API e uscita JSON oltre a HTML: comodo per test automatici.",
      "status": "up",
      "http": 200
    },
    {
      "id": "liquor-ipsum",
      "name": "Liquor Ipsum",
      "url": "https://liquoripsum.com/",
      "category": "food",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Testo sbronzo, con lessico da bar e distillati: riempitivo più forte del solito.",
      "status": "up",
      "http": 200
    },
    {
      "id": "pizza-ipsum",
      "name": "Pizza Ipsum",
      "url": "https://pizzaipsum.com",
      "category": "food",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo appena sfornato, intorno alla pizza e ai suoi ingredienti.",
      "status": "up",
      "http": 200
    },
    {
      "id": "tuna-ipsum",
      "name": "Tuna Ipsum",
      "url": "https://tunaipsum.com",
      "category": "food",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Generatore ittico, con frasi da mare e scatolette: alternativa a un lorem più sobrio.",
      "status": "up",
      "http": 200
    },
    {
      "id": "wine-ipsum",
      "name": "Wine Ipsum",
      "url": "https://www.wineipsum.com/",
      "category": "food",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo enologico tra cantina e degustazione, con un tono un po' snob.",
      "status": "up",
      "http": 200
    },
    {
      "id": "bavaria-ipsum",
      "name": "Bavaria Ipsum",
      "url": "http://bavaria-ipsum.de/",
      "category": "geography",
      "tags": [],
      "langs": [
        "de"
      ],
      "what": "Generatore bavarese in tedesco, con lessico e riferimenti regionali.",
      "status": "up",
      "http": 200
    },
    {
      "id": "bogan-ipsum",
      "name": "Bogan Ipsum",
      "url": "https://boganipsum.com.au/",
      "category": "geography",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo in slang australiano e neozelandese, con espressioni volgari di quartiere.",
      "status": "up",
      "http": 200
    },
    {
      "id": "durham-ipsum",
      "name": "Durham Ipsum",
      "url": "https://durhamipsum.com/",
      "category": "geography",
      "tags": [
        "polysource"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo ambientato a Durham, North Carolina; attinge a più fonti di contenuto.",
      "status": "up",
      "http": 200
    },
    {
      "id": "gangsta-lorem-ipsum",
      "name": "Gangsta Lorem Ipsum",
      "url": "https://lorizzle.nl/",
      "category": "geography",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Soldi, catene d'oro e grammatica ridotta: lorem ipsum in stile hip hop.",
      "status": "unknown",
      "http": 502
    },
    {
      "id": "hillbilly-ipsum",
      "name": "Hillbilly Ipsum",
      "url": "http://hillbillyipsum.com/",
      "category": "geography",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo rurale americano, con detti di campagna e grammatica storta.",
      "status": "up",
      "http": 200
    },
    {
      "id": "hipster-ipsum",
      "name": "Hipster Ipsum",
      "url": "https://hipsum.co/",
      "category": "geography",
      "tags": [
        "api"
      ],
      "langs": [
        "en"
      ],
      "what": "Testo artigianale a base di barba, birra acida e parole ricercate; offre un'API.",
      "status": "up",
      "http": 200
    },
    {
      "id": "lancashire-ipsum",
      "name": "Lancashire Ipsum",
      "url": "https://www.quentinjamesdesign.co.uk/lancashire-ipsum/",
      "category": "geography",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo con il dialetto del Lancashire, Inghilterra nord-occidentale.",
      "status": "dead",
      "http": 404,
      "note": "La pagina vive nel sito di uno studio di design, non su un dominio dedicato."
    },
    {
      "id": "pirate-ipsum",
      "name": "Pirate Ipsum",
      "url": "https://pirateipsum.me/",
      "category": "geography",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo piratesco tra galeoni e abbordaggi, con l'italiano dei doppiaggi.",
      "status": "up",
      "http": 200
    },
    {
      "id": "bible-ipsum",
      "name": "Bible Ipsum",
      "url": "http://bibleipsum.free.fr/",
      "category": "literature",
      "tags": [
        "html"
      ],
      "langs": [
        "fr"
      ],
      "what": "Versetti della Bibbia in inglese secondo la versione americana, con varianti in francese.",
      "status": "up",
      "http": 200,
      "note": "Dominio free.fr: hosting personale francese."
    },
    {
      "id": "cthuvian-ipsum",
      "name": "Cthuvian Ipsum",
      "url": "http://ephemer.kapsi.fi/FhtagnGenerator.php",
      "category": "literature",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Testo in r'lyehiano, la lingua dei racconti di Lovecraft: suoni impronunciabili e culti antichi.",
      "status": "up",
      "http": 200,
      "note": "URL diretto a uno script PHP, non a una pagina con interfaccia."
    },
    {
      "id": "fifty-shades-ipsum",
      "name": "Fifty Shades Ipsum",
      "url": "http://www.fiftyshadesgenerator.com/",
      "category": "literature",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo erotico di serie B, con frasi tratte dalla saga: non per tutti i contesti.",
      "status": "up",
      "http": 200
    },
    {
      "id": "harry-potter-ipsum",
      "name": "Harry Potter Ipsum",
      "url": "http://www.christinachern.com/hpipsum/",
      "category": "literature",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Frasi dal mondo di Harry Potter, tra incantesimi e cucine di Hogwarts.",
      "status": "up",
      "http": 200,
      "note": "Ospitato nel sito personale dell'autrice, non su un dominio dedicato."
    },
    {
      "id": "joyce-ipsum",
      "name": "Joyce Ipsum",
      "url": "http://joyceipsum.com/ulysses/",
      "category": "literature",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo che attinge all'Ulisse di Joyce: flusso di coscienza al posto del latino.",
      "status": "up",
      "http": 200,
      "note": "Il percorso punta a una singola opera: esistono varianti per altri testi."
    },
    {
      "id": "lorem-gibson",
      "name": "Lorem Gibson",
      "url": "http://loremgibson.com/",
      "category": "literature",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Testo che pesca dalla prosa di William Gibson, tra tecnologia e distopia.",
      "status": "up",
      "http": 200
    },
    {
      "id": "bro-ipsum",
      "name": "Bro Ipsum",
      "url": "https://www.broipsum.com/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo da fratello universitario: slang, esclamazioni e molta sicurezza di sé.",
      "status": "up",
      "http": 200
    },
    {
      "id": "business-ipsum",
      "name": "Business Ipsum",
      "url": "https://randommer.io/business-lorem-ipsum-text",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo da riunione aziendale, con lessico di management e obiettivi trimestrali.",
      "status": "up",
      "http": 200,
      "note": "Fa parte di una raccolta più ampia di generatori sullo stesso sito."
    },
    {
      "id": "fyre-ipsum",
      "name": "Fyre Ipsum",
      "url": "https://fyreipsum.com/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo costruito sul pitch deck del Fyre Festival, tra promesse e vuoto.",
      "status": "up",
      "http": 200
    },
    {
      "id": "gothic-ipsum",
      "name": "Gothic Ipsum",
      "url": "http://gothicipsum.com",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo gotico tra castelli, nebbia e presagi: atmosfera da romanzo ottocentesco.",
      "status": "up",
      "http": 200
    },
    {
      "id": "ipsum-generator",
      "name": "Ipsum Generator",
      "url": "https://ipsum.ecxol.net/",
      "category": "misc",
      "tags": [
        "polysource"
      ],
      "langs": [
        "fr"
      ],
      "what": "Arricchisce il lorem canonico con sfumature di altri contenuti e ha opzioni in francese.",
      "status": "up",
      "http": 200
    },
    {
      "id": "mattress-ipsum",
      "name": "Mattress Ipsum",
      "url": "https://craig1123.github.io/mattress-ipsum/",
      "category": "misc",
      "tags": [
        "github",
        "npm"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo morbido sul mondo dei materassi, con modulo npm e codice su GitHub.",
      "status": "up",
      "http": 200
    },
    {
      "id": "metaphorpsum",
      "name": "Metaphorpsum",
      "url": "http://metaphorpsum.com/",
      "category": "misc",
      "tags": [
        "api",
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Genera metafore in inglese con una struttura fissa, disponibile anche via API.",
      "status": "unknown",
      "http": 502
    },
    {
      "id": "modernipsum",
      "name": "Modernipsum",
      "url": "http://www.modernipsum.com/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo in tono artistico e da galleria, con frasi programmatiche e kitsch.",
      "status": "unknown",
      "http": 500
    },
    {
      "id": "monocle-ipsum",
      "name": "Monocle Ipsum",
      "url": "http://www.monocleipsum.com/",
      "category": "misc",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo con il gergo da rivista di stile, tra lusso, viaggi e oggetti curati.",
      "status": "up",
      "http": 200
    },
    {
      "id": "office-ipsum",
      "name": "Office Ipsum",
      "url": "http://officeipsum.com/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Frasi da ufficio: riunioni, scadenze e gergo aziendale per simulare una giornata di lavoro.",
      "status": "up",
      "http": 200
    },
    {
      "id": "robot-ipsum",
      "name": "Robot Ipsum",
      "url": "http://robotipsum.github.io/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo meccanico e sintetico, con frasi da manuale e lessico industriale.",
      "status": "up",
      "http": 200
    },
    {
      "id": "rational-placeholder-text",
      "name": "The Rational Placeholder Text Generator",
      "url": "https://www.boom-online.co.uk/lorem-ipsum/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo ragionato: si inserisce un argomento e il testo pesca contenuti da Wikipedia.",
      "status": "up",
      "http": 200,
      "note": "Pagina interna di un'agenzia, non un servizio autonomo."
    },
    {
      "id": "time-cube-ipsum",
      "name": "Time Cube Ipsum",
      "url": "http://www.timecubeipsum.com/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo ispirato alla teoria di Time Cube, con frasi ossessive e ripetitive.",
      "status": "up",
      "http": 200
    },
    {
      "id": "video-game-ipsum",
      "name": "Video Game Ipsum",
      "url": "https://videogameipsum.netlify.app/",
      "category": "misc",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo a tema videogiochi, tra vite extra e game over, con codice su GitHub.",
      "status": "up",
      "http": 200
    },
    {
      "id": "web20-ipsum",
      "name": "Web 2.0 Ipsum",
      "url": "https://web20ipsum.com/",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo con nomi di startup della bolla Web 2.0, tra beta e pivot.",
      "status": "up",
      "http": 200
    },
    {
      "id": "weed-ipsum",
      "name": "Weed Ipsum",
      "url": "http://weedipsum.com",
      "category": "misc",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo da cultura canapa, con slang e frasi volutamente stonate.",
      "status": "up",
      "http": 200
    },
    {
      "id": "bluth-ipsum",
      "name": "Bluth Ipsum",
      "url": "https://bluthipsum.com/",
      "category": "tvfilm",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Frasi della famiglia Bluth di Arrested Development, tra sarcasmo e imbarazzo.",
      "status": "up",
      "http": 200
    },
    {
      "id": "delorean-ipsum",
      "name": "DeLorean Ipsum",
      "url": "https://satoristudio.net/delorean-ipsum/",
      "category": "tvfilm",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo ispirato a Ritorno al futuro: macchina del tempo, 88 e plutonio.",
      "status": "up",
      "http": 200,
      "note": "La pagina vive nel sito di uno studio di sviluppo, non su un dominio dedicato."
    },
    {
      "id": "devlorem",
      "name": "DevLorem",
      "url": "https://devlorem.woblick.dev/",
      "category": "tvfilm",
      "tags": [
        "api",
        "github",
        "json"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo con battute di attori famosi, con API e uscita JSON oltre agli altri formati.",
      "status": "up",
      "http": 200
    },
    {
      "id": "forcem-ipsum",
      "name": "Forcem Ipsum",
      "url": "https://www.forcemipsum.com/",
      "category": "tvfilm",
      "tags": [
        "api",
        "github",
        "npm"
      ],
      "langs": [
        "en"
      ],
      "what": "Citazioni di Guerre stellari, con API, modulo npm e codice su GitHub.",
      "status": "up",
      "http": 200
    },
    {
      "id": "godfather-ipsum",
      "name": "Godfather Ipsum",
      "url": "https://godfatheripsum.github.io",
      "category": "tvfilm",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo dalla trilogia del Padrino: offerte, favori e minacce in forma di testo.",
      "status": "up",
      "http": 200
    },
    {
      "id": "gosling-ipsum",
      "name": "Gosling Ipsum",
      "url": "http://www.rygo-ipsum.com/",
      "category": "tvfilm",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Battute dei personaggi di Ryan Gosling, con codice disponibile su GitHub.",
      "status": "up",
      "http": 200
    },
    {
      "id": "greys-anatomy-ipsum",
      "name": "Grey's Anatomy Lorem Ipsum Generator",
      "url": "https://greysanatomyloremipsum.netlify.app/",
      "category": "tvfilm",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo medico, con lessico di Grey's Anatomy tra corsia e sala operatoria.",
      "status": "up",
      "http": 200
    },
    {
      "id": "heisenberg-ipsum",
      "name": "Heisenburg Ipsum",
      "url": "https://heisenbergipsum.com/",
      "category": "tvfilm",
      "tags": [
        "polysource"
      ],
      "langs": [
        "en"
      ],
      "what": "Frasi di Breaking Bad, tra chimica e minacce sussurrate; attinge a più fonti.",
      "status": "up",
      "http": 200,
      "note": "Nel nome della lista il cognome è scritto Heisenburg, con la u."
    },
    {
      "id": "vole-text-generator",
      "name": "Vole Text Generator",
      "url": "https://vole.wtf/text-generator/",
      "category": "tvfilm",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo costruito sulle sigle televisive, con un formato sperimentale e sonoro.",
      "status": "up",
      "http": 200
    },
    {
      "id": "neah",
      "name": "Neah",
      "url": "http://nckg.github.io/neah/",
      "category": "tvfilm",
      "tags": [
        "github",
        "npm"
      ],
      "langs": [
        "en"
      ],
      "what": "Citazioni dei personaggi di Arnold Schwarzenegger, disponibili anche come modulo npm.",
      "status": "up",
      "http": 200
    },
    {
      "id": "rick-and-morty-ipsum",
      "name": "Rick and Morty Ipsum Generator",
      "url": "https://felipemotabr.github.io/rick-and-morty-ipsum-generator/",
      "category": "tvfilm",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo dal multiverso di Rick and Morty, tra battute ciniche e nonsenso.",
      "status": "up",
      "http": 200
    },
    {
      "id": "samuel-l-ipsum",
      "name": "Samuel L. Ipsum",
      "url": "https://slipsum.com/",
      "category": "tvfilm",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Riempitivo con le battute di Samuel L. Jackson: monosillabi, parolacce e calma apparente.",
      "status": "up",
      "http": 200
    },
    {
      "id": "star-trek-ipsum",
      "name": "Star Trek Ipsum",
      "url": "https://vlad-saling.github.io/star-trek-ipsum/",
      "category": "tvfilm",
      "tags": [
        "github",
        "html"
      ],
      "langs": [
        "en"
      ],
      "what": "Frasi da Star Trek: The Next Generation, con opzione HTML e codice su GitHub.",
      "status": "up",
      "http": 200
    },
    {
      "id": "stranger-ipsum",
      "name": "Stranger Ipsum",
      "url": "https://stranger-ipsum.robertcooper.me/",
      "category": "tvfilm",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Riempitivo da Stranger Things, tra anni Ottanta e l'Altrove.",
      "status": "up",
      "http": 200
    },
    {
      "id": "any-ipsum",
      "name": "Any Ipsum",
      "url": "https://wordpress.org/plugins/any-ipsum/",
      "category": "tools",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Plugin WordPress per costruire un proprio generatore: si sceglie cosa copiare, i contenuti.",
      "status": "up",
      "http": 200,
      "note": "Il README rimanda il codice a un repository GitHub separato; il link è la scheda del plugin."
    },
    {
      "id": "aozora",
      "name": "aozora",
      "url": "https://github.com/fand/aozora",
      "category": "tools",
      "tags": [
        "github",
        "npm"
      ],
      "langs": [
        "ja"
      ],
      "what": "Strumento da riga di comando che estrae testi da Aozora Bunko, la biblioteca digitale giapponese.",
      "status": "up",
      "http": 200,
      "note": "Non è un generatore web: è un pacchetto npm da terminale."
    },
    {
      "id": "emmet",
      "name": "Emmet",
      "url": "https://docs.emmet.io/abbreviations/lorem-ipsum/",
      "category": "tools",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Il riempitivo lorem integrato nell'editor: si digita lorem5 e si ottengono cinque parole.",
      "status": "up",
      "http": 200,
      "note": "Il link è la documentazione ufficiale di Emmet, non un generatore autonomo."
    },
    {
      "id": "littleipsum",
      "name": "LittleIpsum",
      "url": "https://apps.apple.com/ca/app/littleipsum/id405772121",
      "category": "tools",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "App macOS minuscola che genera testo latino e lo copia: sta nella barra dei menu.",
      "status": "dead",
      "http": 404,
      "note": "Il link è la scheda dell'App Store canadese."
    },
    {
      "id": "sublime-text-packages",
      "name": "Sublime Text Packages",
      "url": "https://packagecontrol.io/search/ipsum",
      "category": "tools",
      "tags": [],
      "langs": [
        "en"
      ],
      "what": "Ricerca dei pacchetti lorem ipsum per Sublime Text pubblicati su Package Control.",
      "status": "up",
      "http": 200,
      "note": "Il link è una pagina di ricerca, non un singolo generatore."
    },
    {
      "id": "roughdraft-js",
      "name": "RoughDraft.js",
      "url": "http://ndreckshage.github.io/roughdraft.js/",
      "category": "tools",
      "tags": [
        "github"
      ],
      "langs": [
        "en"
      ],
      "what": "Libreria JS per mockup HTML rapidi che include un generatore di testo segnaposto.",
      "status": "up",
      "http": 200,
      "note": "Il link è la demo; il codice sta in un repository GitHub separato."
    }
  ]
};
