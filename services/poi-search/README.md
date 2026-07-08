# poi-search — Fase 4 della roadmap funzionalità (itinerary builder)

Servizio FastAPI di ricerca punti di interesse, primo tassello dell'itinerary builder descritto
in `.claude/context/roadmap.md`. Un solo adapter (Overpass/OpenStreetMap), nessuna chiave
richiesta.

## Cosa c'è

Un endpoint `POST /api/poi/search` che accetta un nome di località e un limite di risultati, e
restituisce una lista di `PointOfInterest` (nome, categoria, coordinate) ordinati per rilevanza
di scoperta dell'API sorgente. La località viene geocodificata in un bounding box tramite
Nominatim (`app/geocoding.py`, identico a `services/stay-search/`), poi usato per interrogare
Overpass API (`app/adapters/overpass_adapter.py`) sui tag OSM `tourism` e `historic`.

## Stato di verifica

Eseguito realmente in questa sessione: query dirette a `overpass-api.de/api/interpreter` da
riga di comando, poi ricerca live via `TestClient` per "Marina di Camerota". Risultato: 7 POI
reali (Grotta Azzurra, Belvedere di Cala Fortuna, spiagge, un monumento) — nomi che in parte
coincidono con l'itinerario già scritto a mano in `trips/cilento-2026/trip.config.js`, un buon
segnale indipendente sulla qualità dei dati.

**Due dettagli emersi dalla verifica, non deducibili dalla sola documentazione:**

Il server risponde `406 Not Acceptable` (invece di un errore più parlante) se la richiesta non
ha un header `User-Agent` esplicito — impostato in `overpass_adapter.py` e `geocoding.py`, come
richiesto anche dalla policy di utilizzo di Overpass/Nominatim.

Molti elementi, soprattutto con tag `historic` (rovine, relitti), non hanno un tag `name`.
L'adapter li scarta: un punto di interesse senza nome non è utile da suggerire in un itinerario.
Gli elementi con `tourism` uguale a un valore di alloggio (hotel, ostello, ecc.) vengono scartati
altrettanto — quella è competenza di `services/stay-search/`, non di questo servizio.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
curl -X POST http://localhost:8003/api/poi/search \
  -H "Content-Type: application/json" \
  -d '{"location":"Marina di Camerota","limit":15}'
```

## Cosa manca — vedi roadmap.md per il piano completo

Nessun routing/ottimizzazione dell'ordine di visita (OpenTripPlanner o GraphHopper, entrambi
self-hosted, non introdotti in questa sessione). Un primo collegamento all'itinerario esiste ora
tramite `services/trip-planner/` e la scheda "Pianifica" della shell, che salva un POI scelto su
un giorno specifico (ADR-007, `.claude/memory/decisions.md`) — non verificato in un browser reale
finché il backend non è raggiungibile in HTTPS (vedi sotto). Hosting deciso: Render (ADR-008),
`render.yaml` alla radice del repository; creazione effettiva del servizio su Render non ancora
eseguita.
