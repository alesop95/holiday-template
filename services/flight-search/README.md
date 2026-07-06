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

Per eseguire i test che richiedono `TestClient` (non necessario per far girare il servizio,
solo per verificarlo da script): `pip install -r requirements-dev.txt`.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
curl -X POST http://localhost:8001/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"FCO","destination":"CDG","departure_date":"2026-09-15","adults":1}'
```

## Cosa manca — vedi roadmap.md per il piano completo

Adapter Amadeus Flight Offers Search (fonte di validazione prezzi, API ufficiale, free tier
reale) e adapter Kiwi Tequila (multi-città, self-transfer) non sono ancora implementati: il
layer comparatore che interroga più fonti in parallelo e deduplica è pensato per orchestrarli
tutti dietro allo stesso schema `FlightOffer`, ma oggi orchestra solo `fast_flights`. Non c'è
cache: ogni chiamata a `/api/flights/search` esegue una ricerca live. Non è stata ancora presa
una decisione su dove deployare questo servizio (self-hosted Docker Compose vs cloud free-tier,
sezione "Direzione" di `roadmap.md`); oggi gira solo in locale con `uvicorn`.
