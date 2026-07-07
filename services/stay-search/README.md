# stay-search — Fase 2 della roadmap funzionalità

Servizio FastAPI di ricerca alloggi, secondo tassello del comparatore descritto in
`.claude/context/roadmap.md`. Un solo adapter (Airbnb via `pyairbnb`), nessuna chiave richiesta,
nessuna cache ancora.

## Cosa c'è

Un endpoint `POST /api/stays/search` che accetta un nome di località (non coordinate grezze),
date di check-in/check-out, numero di adulti e prezzo massimo, e restituisce una lista di
`StayOffer` normalizzati ordinati per prezzo crescente. Il nome di località viene geocodificato
in un bounding box tramite Nominatim (OpenStreetMap, `app/geocoding.py`), gratuito e senza
chiave; il bounding box alimenta la ricerca geografica di Airbnb (`app/adapters/pyairbnb_adapter.py`).

## Stato di verifica

Eseguito realmente in questa sessione: virtualenv, `pip install`, ricerca live per "Marina di
Camerota" (15-20 settembre 2026, 2 adulti). Risultato: 40 alloggi reali con nomi, tipo, prezzo
totale del soggiorno e valutazioni vere.

**Due bug reali della libreria installata (`pyairbnb` 2.2.1), scoperti e aggirati in sessione,
non documentati altrove:**

`search_first_page()`/`search_all()` passano internamente `results_raw.get("searchResults", [])`
alla funzione di normalizzazione, ma `"searchResults"` non è una chiave di primo livello della
risposta grezza — è annidata in `data.presentation.staysSearch.results.searchResults`. Il
risultato è che le funzioni pubbliche della libreria falliscono sempre con
`AttributeError: 'list' object has no attribute 'get'`. Bypass: l'adapter chiama direttamente
`pyairbnb.api.get()` e `pyairbnb.search.get()` per la richiesta grezza, poi passa il dizionario
intero (non filtrato) a `pyairbnb.standardize.from_search()`, che naviga correttamente il
percorso annidato.

Il campo `price.total` restituito è sempre `0`. Il prezzo reale sta nell'ultimo elemento di
`price.break_down`: senza sconti c'è una sola voce (il totale); con uno sconto, l'ultima voce è
esplicitamente "Totale" e somma le precedenti. Prendere l'ultimo elemento copre entrambi i casi,
verificato su esempi reali di entrambe le forme nella stessa ricerca di prova.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
curl -X POST http://localhost:8002/api/stays/search \
  -H "Content-Type: application/json" \
  -d '{"location":"Marina di Camerota","check_in":"2026-09-15","check_out":"2026-09-20","adults":2,"price_max":500}'
```

## Considerazioni ToS

Nessuna API ufficiale Airbnb esiste; `pyairbnb` fa reverse-engineering della GraphQL interna.
Usato qui senza login con account personale, solo richieste pubbliche anonime, come raccomandato
dal repository upstream e già annotato in `roadmap.md`. Rischio ToS più alto delle fonti voli
usate in `services/flight-search/`, accettato per uso privato a basso volume secondo lo stesso
ragionamento della ricerca originale.

## Cosa manca — vedi roadmap.md per il piano completo

Nessuna cache (ogni ricerca rifà la geocodifica e la query Airbnb da zero, a differenza di
`flight-search` che ha già una cache in-memory con TTL). Nessuna seconda fonte (Booking.com è
partner-only, non percorribile; Amadeus Hotel API condivide la chiusura del portale self-service
descritta in `roadmap.md` e ADR-006). Non è stata ancora presa una decisione su dove deployare
questo servizio, stessa domanda aperta di `flight-search`.
