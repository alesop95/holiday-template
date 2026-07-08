# trip-planner — Fase 3 della roadmap funzionalità (layer comparatore)

Servizio FastAPI di orchestrazione, non di ricerca: combina in un'unica risposta i tre servizi
di ricerca già esistenti (`flight-search`, `stay-search`, `poi-search`), come descritto nella
Fase 3 di `.claude/context/roadmap.md`.

## Cosa c'è

Un endpoint `POST /api/trip-plan` che accetta i parametri necessari a tutti e tre i servizi a
valle (aeroporti per i voli, nome località per alloggi e POI, date, adulti) e chiama i tre in
parallelo (`asyncio.gather`, non `ThreadPoolExecutor` come `flight-search`: qui il lavoro è I/O
puro verso altri servizi HTTP, non librerie sincrone bloccanti, quindi `asyncio` nativo è la
scelta più diretta). Restituisce `{flights, stays, points_of_interest, errors}`: se un servizio a
valle non risponde, il piano torna comunque con gli altri due e un errore specifico per quello
mancante, non un fallimento totale.

Le tre chiamate presuppongono che i servizi girino già, su URL configurabili via `.env`
(`FLIGHT_SEARCH_URL`, `STAY_SEARCH_URL`, `POI_SEARCH_URL`, default `localhost:8001/8002/8003`).
Le risposte dei tre servizi non vengono ri-normalizzate in schemi Pydantic propri: passano come
`dict` grezzi, perché questo servizio le inoltra soltanto, non le elabora.

## Stato di verifica

Eseguito realmente in questa sessione, non solo con `TestClient`: avviati i tre servizi a valle
con `uvicorn` reale su porte separate, poi una vera richiesta HTTP a `trip-planner` per
FCO→CDG/Parigi (15-20 settembre 2026, 2 adulti). Risultato: 7 voli reali, 40 alloggi reali, 4 POI
reali (incluso il Musée de l'Armée), zero errori. Verificata anche la tolleranza ai guasti
fermando `poi-search` a metà test: la risposta è tornata comunque 200, con voli e alloggi intatti
e un solo errore specifico (`"poi: All connection attempts failed"`) invece di un fallimento
totale.

```bash
# In quattro terminali separati (o con &, in background):
cd services/flight-search && uvicorn app.main:app --port 8001
cd services/stay-search   && uvicorn app.main:app --port 8002
cd services/poi-search    && uvicorn app.main:app --port 8003
cd services/trip-planner  && uvicorn app.main:app --port 8004

curl -X POST http://localhost:8004/api/trip-plan \
  -H "Content-Type: application/json" \
  -d '{"origin_airport":"FCO","destination_airport":"CDG","destination_location":"Paris","departure_date":"2026-09-15","return_date":"2026-09-20","adults":2}'
```

## Cosa manca — vedi roadmap.md per il piano completo

Nessuna deduplicazione tra fonti (non applicabile qui: le tre categorie voli/alloggi/POI non si
sovrappongono mai, a differenza di due fonti voli diverse dentro `flight-search`). Nessuna stima
di costo totale del viaggio che sommi un volo + un alloggio scelti: oggi restituisce liste
separate, la selezione e il calcolo restano manuali. Il salvataggio di un risultato scelto su un
giorno dell'itinerario passa dalla scheda "Pianifica" della shell frontend, non da questo
servizio (ADR-007, `.claude/memory/decisions.md`) — non verificato in un browser reale finché
questo servizio non è raggiungibile in HTTPS, vedi sotto.

Hosting deciso: Render (ADR-008, `.claude/memory/decisions.md`), `render.yaml` alla radice del
repository. Questo servizio dipende dalla raggiungibilità pubblica degli altri tre: dopo il loro
primo deploy su Render, i rispettivi URL pubblici vanno incollati a mano nelle variabili
d'ambiente di questo servizio (`FLIGHT_SEARCH_URL`, `STAY_SEARCH_URL`, `POI_SEARCH_URL`, marcate
`sync: false` nel Blueprint apposta per questo). Creazione effettiva su Render non ancora eseguita.
