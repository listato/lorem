#!/usr/bin/env python3
"""Verifica gli URL del catalogo e riscrive status/http/checked in data/generators.js.

Nessuna dipendenza esterna: usa urllib e, come ripiego, il comando curl del
sistema. Regole di classificazione:

    up      -> 200 e pagina con contenuto utile
    stale   -> 200 ma redirect a dominio parcheggiato o pagina senza contenuto utile
    dead    -> 404/410 oppure DNS non risolto
    unknown -> timeout, errore di rete, 403/429/5xx, esito non interpretabile

Failsafe: timeout 8 s per richiesta, al massimo 2 tentativi per URL, 8 richieste
in parallelo, tetto di parete di ~3 minuti. Le voci non concluse entro il tetto
restano "unknown" e vengono elencate nel riepilogo.

Uso:
    python3 tools/check-links.py [--dry-run]
"""
from __future__ import annotations

import concurrent.futures
import json
import os
import re
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "data", "generators.js")

TIMEOUT = 8            # secondi per singola richiesta
MAX_TENTATIVI = 2      # niente retry infinito
CONCORRENZA = 8        # richieste in parallelo
TETTO_SECONDI = 165    # tempo di parete massimo (~3 minuti)
MAX_BODY = 64 * 1024   # byte letti per capire se la pagina ha contenuto

UA = "Mozilla/5.0 (compatible; lorem-link-checker/1.0; +http://lorem.lorel.lol/)"
PREFISSO = "window.LOREM_CATALOG = "

# Firme di pagine parcheggiate o di cortesia: se compaiono, la pagina è "stale".
FIRME_PARCHEGGIO = (
    "domain is for sale",
    "domain may be for sale",
    "buy this domain",
    "this domain is parked",
    "domain parking",
    "parked domain",
    "hugedomains",
    "sedoparking",
    "parkingcrew",
    "afternic",
    "dan.com",
    "bodis",
    "above.com",
    "domainmarket",
    "related searches",
    "sponsored listings",
    "this page is parked",
    "inquire about this domain",
)
# Firme di pagine vuote o in costruzione: anche queste valgono "stale".
FIRME_VUOTE = (
    "coming soon",
    "under construction",
    "site not found",
    "default web page",
    "welcome to nginx",
    "apache2 debian default page",
    "it works!",
    "nothing to see here",
    "account suspended",
)


def log(msg: str) -> None:
    """Log compatto su stdout, con flush immediato per seguire l'avanzamento."""
    print(msg, flush=True)


def registrabile(host: str) -> str:
    """Restituisce il dominio registrabile approssimato (ultime due etichette)."""
    host = (host or "").lower().strip(".")
    if host.startswith("www."):
        host = host[4:]
    parti = host.split(".")
    if len(parti) >= 3 and parti[-2] in ("co", "com", "org", "net", "ac", "gov", "edu"):
        return ".".join(parti[-3:])
    return ".".join(parti[-2:]) if len(parti) >= 2 else host


def testo_visibile(html: str) -> str:
    """Riduce l'HTML a testo leggibile, minuscolo e senza spazi doppi."""
    html = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", html)
    html = re.sub(r"(?s)<!--.*?-->", " ", html)
    html = re.sub(r"(?s)<[^>]+>", " ", html)
    html = re.sub(r"&[a-z#0-9]+;", " ", html, flags=re.I)
    return re.sub(r"\s+", " ", html).strip().lower()


def classifica_pagina(url_iniziale: str, url_finale: str, corpo: str, tipo: str):
    """Restituisce (status, motivo) per una risposta HTTP 200."""
    if "json" in tipo or "text/plain" in tipo or "xml" in tipo:
        return "up", "contenuto non HTML"
    testo = testo_visibile(corpo)
    for firma in FIRME_PARCHEGGIO:
        if firma in testo:
            return "stale", f"pagina parcheggiata ({firma})"
    for firma in FIRME_VUOTE:
        if firma in testo:
            return "stale", f"pagina in costruzione ({firma})"
    # Redirect su un altro dominio registrabile: sospetto, ma non basta da solo.
    host_i = registrabile(urllib.parse.urlsplit(url_iniziale).hostname or "")
    host_f = registrabile(urllib.parse.urlsplit(url_finale).hostname or "")
    if host_f and host_i and host_f != host_i:
        if len(testo) < 400:
            return "stale", f"redirect fuori dominio verso {host_f} con poco testo"
    # Pagina sostanzialmente vuota: niente script e pochissimo testo.
    if len(testo) < 200 and len(corpo) < 3000 and "<script" not in corpo.lower():
        return "stale", "pagina senza contenuto utile"
    return "up", ""


def tentativo_urllib(url: str):
    """Un tentativo con urllib. Restituisce (codice, url_finale, corpo, tipo, errore)."""
    richiesta = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Accept": "text/html,application/json;q=0.9,*/*;q=0.8"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(richiesta, timeout=TIMEOUT) as risposta:
            corpo = risposta.read(MAX_BODY).decode("utf-8", "replace")
            tipo = risposta.headers.get("Content-Type", "").lower()
            return risposta.status, risposta.geturl(), corpo, tipo, None
    except urllib.error.HTTPError as errore:
        return errore.code, errore.geturl() or url, "", "", None
    except urllib.error.URLError as errore:
        return 0, url, "", "", errore.reason
    except (TimeoutError, socket.timeout):
        return 0, url, "", "", "timeout"
    except Exception as errore:  # noqa: BLE001 - rete imprevedibile
        return 0, url, "", "", f"{type(errore).__name__}: {errore}"


def tentativo_curl(url: str, insicuro: bool = False):
    """Ripiego con curl del sistema: serve solo a leggere codice e URL finale.

    Con insicuro=True accetta certificati non validi: serve unicamente a capire
    cosa risponde il server quando il certificato è scaduto o self-signed.
    """
    comando = ["curl", "-sL", "-o", "/dev/null", "--max-time", str(TIMEOUT),
               "-A", UA, "-w", "%{http_code} %{url_effective}"]
    if insicuro:
        comando.insert(1, "-k")
    try:
        esito = subprocess.run(
            comando + [url],
            capture_output=True, text=True, timeout=TIMEOUT + 4,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return 0, url, "curl assente o in timeout"
    parti = esito.stdout.strip().split(" ", 1)
    codice = int(parti[0]) if parti and parti[0].isdigit() else 0
    finale = parti[1] if len(parti) > 1 else url
    return codice, finale, "" if codice else "curl senza risposta"


def e_dns(errore) -> bool:
    """Riconosce un fallimento di risoluzione DNS."""
    if isinstance(errore, socket.gaierror):
        return True
    testo = str(errore).lower()
    return any(s in testo for s in (
        "name or service not known",
        "nodename nor servname",
        "temporary failure in name resolution",
        "no address associated",
        "getaddrinfo",
    ))


def e_certificato(errore) -> bool:
    """Riconosce un certificato TLS non valido (scaduto, self-signed, host sbagliato)."""
    testo = str(errore).lower()
    return any(s in testo for s in (
        "certificate verify failed",
        "certificate has expired",
        "self-signed certificate",
        "self signed certificate",
        "hostname mismatch",
        "ssl: ",
    ))


def e_timeout(errore) -> bool:
    """Riconosce un timeout."""
    if isinstance(errore, (TimeoutError, socket.timeout)):
        return True
    testo = str(errore).lower()
    return "timed out" in testo or "timeout" in testo


def verifica(url: str, scadenza: float):
    """Verifica un URL e restituisce (status, http, motivo)."""
    motivo = ""
    for tentativo in range(1, MAX_TENTATIVI + 1):
        if time.monotonic() > scadenza:
            return "unknown", 0, "tetto di tempo raggiunto"
        codice, finale, corpo, tipo, errore = tentativo_urllib(url)

        if codice and 200 <= codice < 300:
            status, motivo = classifica_pagina(url, finale, corpo, tipo)
            return status, codice, motivo

        if codice in (404, 410):
            return "dead", codice, "risorsa non trovata"

        if codice in (401, 403, 429) or 500 <= codice < 600:
            # Il server risponde ma non mostra la pagina: non è un link morto.
            if tentativo < MAX_TENTATIVI and codice != 403:
                time.sleep(0.4)
                continue
            return "unknown", codice, f"risposta HTTP {codice}"

        if codice in (301, 302, 303, 307, 308):
            return "unknown", codice, "redirect non seguito"

        if codice == 0:
            if e_dns(errore):
                return "dead", 0, "DNS non risolto"
            if e_timeout(errore):
                if tentativo < MAX_TENTATIVI:
                    continue
                return "unknown", 0, "timeout"
            if e_certificato(errore):
                # Certificato non valido: il browser blocca la pagina. Leggo cosa
                # risponde il server ignorando la verifica, per non dire "unknown"
                # quando in realtà la pagina non esiste più.
                codice_k, finale_k, nota_k = tentativo_curl(url, insicuro=True)
                if codice_k in (404, 410):
                    return "dead", codice_k, "certificato non valido e pagina non trovata"
                if 200 <= codice_k < 300:
                    return "stale", codice_k, "certificato non valido: il browser blocca la pagina"
                return "unknown", codice_k, nota_k or "certificato non valido"
            # Errore di rete generico: un tentativo con curl prima di arrendersi.
            codice_curl, finale_curl, nota = tentativo_curl(url)
            if codice_curl and 200 <= codice_curl < 300:
                status, motivo = classifica_pagina(url, finale_curl, "", "")
                return status, codice_curl, motivo or "verificato con curl"
            if codice_curl in (404, 410):
                return "dead", codice_curl, "risorsa non trovata (curl)"
            if tentativo < MAX_TENTATIVI:
                continue
            return "unknown", codice_curl, nota or f"errore di rete: {errore}"

        # Codici 1xx/3xx non gestiti: riprova una volta, poi unknown.
        if tentativo < MAX_TENTATIVI:
            continue
        return "unknown", codice, f"codice HTTP {codice}"
    return "unknown", 0, motivo or "esito non interpretabile"


def leggi_catalogo(percorso: str):
    """Legge generators.js e restituisce (intestazione, oggetto dati)."""
    with open(percorso, "r", encoding="utf-8") as fh:
        testo = fh.read()
    indice = testo.find(PREFISSO)
    if indice < 0:
        raise SystemExit("ERRORE: window.LOREM_CATALOG non trovato in generators.js")
    intestazione = testo[:indice]
    corpo = testo[indice + len(PREFISSO):].strip()
    if corpo.endswith(";"):
        corpo = corpo[:-1]
    return intestazione, json.loads(corpo)


def scrivi_catalogo(percorso: str, intestazione: str, dati: dict) -> None:
    """Riscrive il file conservando l'intestazione commentata."""
    corpo = json.dumps(dati, ensure_ascii=False, indent=2)
    with open(percorso, "w", encoding="utf-8") as fh:
        fh.write(intestazione)
        fh.write(PREFISSO)
        fh.write(corpo)
        fh.write(";\n")


def main() -> int:
    dry_run = "--dry-run" in sys.argv[1:]
    inizio = time.monotonic()
    scadenza = inizio + TETTO_SECONDI

    intestazione, dati = leggi_catalogo(TARGET)
    voci = dati.get("generators", [])
    totale = len(voci)
    log(f"verifica {totale} URL, concorrenza {CONCORRENZA}, timeout {TIMEOUT}s, tetto {TETTO_SECONDI}s")

    esiti: dict[str, tuple] = {}
    conclusi = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCORRENZA) as pool:
        futuro = {pool.submit(verifica, voce["url"], scadenza): voce for voce in voci}
        try:
            for completato in concurrent.futures.as_completed(futuro, timeout=max(1.0, scadenza - time.monotonic() + 10)):
                voce = futuro[completato]
                try:
                    esito = completato.result()
                except Exception as errore:  # noqa: BLE001 - un guasto non ferma il giro
                    esito = ("unknown", 0, f"eccezione: {errore}")
                esiti[voce["id"]] = esito
                conclusi += 1
                status, codice, motivo = esito
                coda = f"  ({motivo})" if motivo and status != "up" else ""
                log(f"[{conclusi:3d}/{totale}] {status:7s} {codice:3d}  {voce['id']:32s}{coda}")
        except concurrent.futures.TimeoutError:
            log("ATTENZIONE: tetto di tempo raggiunto, alcune voci restano non verificate")
            for f in futuro:
                f.cancel()

    # Le voci senza esito (tetto raggiunto o future annullate) restano unknown.
    for voce in voci:
        if voce["id"] not in esiti:
            esiti[voce["id"]] = ("unknown", 0, "non verificato entro il tetto di tempo")

    # Riscrittura del catalogo con gli esiti reali.
    for voce in voci:
        status, codice, _motivo = esiti[voce["id"]]
        voce["status"] = status
        voce["http"] = int(codice)
    oggi = time.strftime("%Y-%m-%d")
    dati.setdefault("meta", {})["checked"] = oggi
    if not dry_run:
        scrivi_catalogo(TARGET, intestazione, dati)

    conteggi = {"up": 0, "stale": 0, "dead": 0, "unknown": 0}
    for voce in voci:
        conteggi[voce["status"]] = conteggi.get(voce["status"], 0) + 1
    durata = time.monotonic() - inizio

    # Riepilogo finale compatto.
    log("")
    log(f"riepilogo: su {totale} voci -> up {conteggi['up']} | stale {conteggi['stale']} | "
        f"dead {conteggi['dead']} | unknown {conteggi['unknown']}")
    for status in ("dead", "stale", "unknown"):
        nomi = [v["id"] for v in voci if v["status"] == status]
        if nomi:
            log(f"  {status}: {', '.join(nomi)}")
    log(f"durata {durata:.1f}s" + (" (dry-run, file non riscritto)" if dry_run else f", riscritto {TARGET}"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
