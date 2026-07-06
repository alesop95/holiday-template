# flight-search — Fase 1 della roadmap funzionalità

Servizio FastAPI di ricerca voli, primo tassello del comparatore descritto in
`.claude/context/roadmap.md`. È uno scaffold di avvio, non l'implementazione completa
della Fase 1: espone un solo adapter funzionante e nessuna cache.

## Cosa c'è

Un endpoint `POST /api/flights/search` che accetta origine, destinazione, data di partenza,
data di ritorno opzionale, numero di adulti e classe, e restituisce una lista di `FlightOffer`
normalizzati (`app/schemas.py`). L'unico adapter attivo, `FastFlightsAdapter`
(`app/adapters/fast_flights_adapter.py`), usa la libreria `fast-flights` (repository
`AWeirdDev/flights`) per interrogare Google Flights senza chiave.

## Stato di verifica — da leggere prima di usarlo

L'interfaccia della libreria `fast-flights` (`create_query`, `FlightQuery`, `Passengers`,
`get_flights`, e i campi `name`/`departure`/`arrival`/`duration`/`stops`/`price`/`is_best`
dell'oggetto `Flight` restituito) è stata verificata in questa sessione leggendo il README
del branch main del repository upstream e incrociandola con fonti indipendenti, non eseguendo
una ricerca reale. Il codice non è stato ancora fatto girare contro un ambiente Python con la
libreria installata. Prima di usarlo, verificare con una ricerca reale:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
curl -X POST http://localhost:8001/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"FCO","destination":"NRT","departure_date":"2026-10-10","adults":1}'
```

Se i nomi dei campi restituiti dalla libreria non coincidono con quelli usati in
`fast_flights_adapter.py`, il traceback dell'eccezione (propagato come `502` con il messaggio
dell'adapter fallito) indica subito dove correggere.

## Cosa manca — vedi roadmap.md per il piano completo

Adapter Amadeus Flight Offers Search (fonte di validazione prezzi, API ufficiale, free tier
reale) e adapter Kiwi Tequila (multi-città, self-transfer) non sono ancora implementati: il
layer comparatore che interroga più fonti in parallelo e deduplica è pensato per orchestrarli
tutti dietro allo stesso schema `FlightOffer`, ma oggi orchestra solo `fast_flights`. Non c'è
cache: ogni chiamata a `/api/flights/search` esegue una ricerca live. Non è stata ancora presa
una decisione su dove deployare questo servizio (self-hosted Docker Compose vs cloud free-tier,
sezione "Direzione" di `roadmap.md`); oggi gira solo in locale con `uvicorn`.
