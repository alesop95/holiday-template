# flight-search — Fase 1 della roadmap funzionalità

Servizio FastAPI di ricerca voli, primo tassello del comparatore descritto in
`.claude/context/roadmap.md`. È uno scaffold di avvio, non l'implementazione completa
della Fase 1: espone un solo adapter funzionante e nessuna cache.

## Cosa c'è

Un endpoint `POST /api/flights/search` che accetta origine, destinazione, data di partenza,
data di ritorno opzionale, numero di adulti e classe, e restituisce una lista di `FlightOffer`
normalizzati (`app/schemas.py`), interrogando l'unico adapter attivo. `FastFlightsAdapter`
(`app/adapters/fast_flights_adapter.py`) usa la libreria `fast-flights` (repository
`AWeirdDev/flights`) per interrogare Google Flights senza chiave.

**Nota**: sono state tentate due fonti aggiuntive, entrambe scritte, verificate quanto possibile
e poi **rimosse**. Amadeus Flight Offers Search (API ufficiale) è stata scritta e verificata
contro un esempio di risposta reale, poi rimossa quando è emerso che Amadeus chiude il proprio
portale self-service il 17 luglio 2026 (fonti indipendenti: PhocusWire, Tragento). Kiwi.com
Tequila API (`KiwiAdapter`, `app/adapters/kiwi_adapter.py`) è stata scritta e mai verificata dal
vivo con una chiave reale: al momento di provare a registrarsi (2026-07-14), il portale
self-service risultava chiuso a favore di un'approvazione manuale via `affiliates@kiwi.com`,
stesso destino di Amadeus. Rimossa per lo stesso motivo. Dettagli e motivazione in `roadmap.md`
e ADR-006 (`.claude/memory/decisions.md`). Non ripartire da nessuna delle due per questa o altre
fonti dati finché il loro stato non cambia.

## Stato di verifica

Eseguito realmente in questa sessione: `pip install -r requirements.txt` in un virtualenv,
avvio di `uvicorn` reale (non solo `TestClient`), ricerca live FCO→CDG del 2026-09-15. Risultato:
11 offerte reali con prezzi in EUR, orari e compagnie vere. Non è una verifica di sola
compilazione, è stato osservato traffico reale verso Google Flights e una risposta reale
parsata correttamente.

Due cose emerse dalla verifica, non deducibili dalla sola documentazione:

**Il muro di consenso GDPR.** Da rete europea, la richiesta diretta della libreria atterra su
`consent.google.com` invece che sui risultati, perché il fetcher di default non gestisce
l'interstitial di consenso. La libreria espone un punto di estensione pulito per questo
(`FetchIntegration`), usato in `fast_flights_adapter.py` (classe `_ConsentBypassFetch`) per
impostare il cookie `SOCS` prima della richiesta. Questo comportamento di Google non è
garantito nel tempo: se l'adapter inizia a restituire sempre zero risultati, il primo sospetto
è che l'interstitial sia cambiato, verificabile isolando la chiamata:

```bash
.venv/Scripts/python -c "from app.adapters.fast_flights_adapter import FastFlightsAdapter; from app.schemas import FlightSearchRequest; print(FastFlightsAdapter().search(FlightSearchRequest(origin='FCO', destination='CDG', departure_date='2026-09-15')))"
```

**Fragilità del parsing su alcuni itinerari.** Nella stessa ricerca di verifica, alcuni
itinerari restituiti da Google hanno una forma dati che il parser della libreria non gestisce
(`ValueError` nello spacchettare l'orario). L'adapter scarta il singolo itinerario problematico
e tiene gli altri, invece di far fallire l'intera ricerca: è una caratteristica strutturale di
un adapter basato su scraping, non un bug isolato da correggere una volta per tutte.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
curl -X POST http://localhost:8001/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"FCO","destination":"CDG","departure_date":"2026-09-15","adults":1}'
```

## Cosa manca — vedi roadmap.md per il piano completo

Il layer comparatore che interroga più fonti in parallelo e combina i tre servizi di ricerca è
`services/trip-planner/`, non questo servizio (che ha comunque una cache in-memory con TTL,
`app/cache.py`, e resta strutturato per interrogare più adapter in parallelo con
`ThreadPoolExecutor` se in futuro se ne aggiungesse un altro). Hosting
deciso: Render (ADR-008, `.claude/memory/decisions.md`), `render.yaml` alla radice del
repository; creazione effettiva del servizio su Render non ancora eseguita, oggi gira solo in
locale con `uvicorn`.
