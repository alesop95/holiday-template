# flight-search — Fase 1 della roadmap funzionalità

Servizio FastAPI di ricerca voli, primo tassello del comparatore descritto in
`.claude/context/roadmap.md`. È uno scaffold di avvio, non l'implementazione completa
della Fase 1: espone un solo adapter funzionante e nessuna cache.

## Cosa c'è

Un endpoint `POST /api/flights/search` che accetta origine, destinazione, data di partenza,
data di ritorno opzionale, numero di adulti e classe, e restituisce una lista di `FlightOffer`
normalizzati (`app/schemas.py`), interrogando in sequenza due adapter. `FastFlightsAdapter`
(`app/adapters/fast_flights_adapter.py`) usa la libreria `fast-flights` (repository
`AWeirdDev/flights`) per interrogare Google Flights senza chiave. `AmadeusAdapter`
(`app/adapters/amadeus_adapter.py`) usa l'API ufficiale Amadeus for Developers (Flight Offers
Search, self-service, free tier) per confrontare con prezzi da un canale non basato su scraping.

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

**AmadeusAdapter, stato diverso da FastFlightsAdapter: non ancora verificato live.** La forma
della risposta (`itineraries`, `segments`, `price.grandTotal`) è verificata contro un esempio
reale ufficiale (`amadeus4dev/amadeus-code-examples`, file
`flight_offers_search/v2/get/response.json`), e la logica di parsing è stata testata offline
alimentandola direttamente con quel file — non contro una ricerca live, perché servono
credenziali reali che non erano disponibili in questa sessione. Senza `AMADEUS_CLIENT_ID` e
`AMADEUS_CLIENT_SECRET` in un `.env` locale (vedi `.env.example`), l'adapter si disattiva da solo
e restituisce lista vuota, senza rompere l'endpoint (verificato: la ricerca continua a funzionare
con la sola fonte `fast_flights`). Per attivarlo e verificarlo davvero: registrarsi su
https://developers.amadeus.com/my-apps (gratuito), creare un'app, copiare API Key e API Secret
in `services/flight-search/.env` come `AMADEUS_CLIENT_ID` e `AMADEUS_CLIENT_SECRET`, poi ripetere
la chiamata `curl` sopra e controllare che compaiano offerte con `"source":"amadeus"`.

Nota sui voli andata e ritorno: Amadeus restituisce un itinerario per direzione (andata e
ritorno separati), ma `FlightOffer` è uno schema piatto con un solo departure/arrival. L'adapter
espone oggi solo l'itinerario di andata anche per ricerche round-trip: una semplificazione
consapevole, non un bug, segnata come miglioramento futuro.

## Cosa manca — vedi roadmap.md per il piano completo

Adapter Kiwi Tequila (multi-città, self-transfer) non è ancora implementato. Il layer comparatore
che interroga più fonti in parallelo (oggi sequenziale) e deduplica non esiste ancora. Non c'è
cache: ogni chiamata a `/api/flights/search` esegue ricerche live su entrambe le fonti attive.
Non è stata ancora presa una decisione su dove deployare questo servizio (self-hosted Docker
Compose vs cloud free-tier, sezione "Direzione" di `roadmap.md`); oggi gira solo in locale con
`uvicorn`.
