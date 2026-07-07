---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - public/**
  - trips/**
  - services/flight-search/**
  - services/stay-search/**
last-verified-commit: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
---

# Stack applicativo

> Documento di recupero più importante: tracciato, perché un collega che clona deve vederlo.
> Popolare leggendo il codice attuale, non inventare. Affinare `covers-paths` man mano.

## Stack e runtime

Il progetto ha due parti indipendenti, senza build step condiviso tra loro.

Il *frontend* (`public/` + `trips/<nome>/`) è Vanilla JavaScript su *ECMAScript Modules* nativi,
nessun bundler, nessun gestore pacchetti: gli SDK Firebase e Leaflet si caricano da CDN via URL
assoluti dentro `index.html`. Persistenza e sincronizzazione realtime su Cloud Firestore, hosting
statico su Firebase Hosting, entrambi sul piano gratuito *Spark*. Un solo progetto Firebase
(`viaggio-new`) serve tutti i viaggi; i dati sono separati per viaggio via `TRIP_ID` (dettagli in
`README.md`, sezioni 4 e 6).

Il *backend* è composto da due servizi indipendenti, entrambi Python + FastAPI, gestore pacchetti
pip con un proprio `requirements.txt` ciascuno (nessun ambiente virtuale fissato nel repository,
`.venv/` è gitignored). Nessuno dei due è collegato al frontend né all'altro: sono servizi a sé,
eseguibili in locale con `uvicorn` su porte diverse (8001 e 8002), senza deployment configurato.
`services/flight-search/` (Fase 1 della roadmap) interroga Google Flights (scraping) e Kiwi
Tequila (API key) per i voli. `services/stay-search/` (Fase 2) interroga Airbnb (scraping) per
gli alloggi, con geocodifica del nome località via Nominatim. Entrambi condividono lo stesso
adapter pattern (interfaccia comune per fonte, normalizzazione verso uno schema condiviso,
un adapter che fallisce non blocca gli altri), duplicato tra i due servizi invece che
fattorizzato in una libreria comune: scelta deliberata per tenere i due servizi indipendenti e
deployabili separatamente, coerente con il fatto che potrebbero finire su infrastrutture diverse.

## Alternative deliberatamente escluse

Skyscanner e Booking.com come fonti dati per la ricerca voli/alloggi: entrambe le API ufficiali
sono partner-only, richiedono revisione business e non sono percorribili per un progetto privato
in fase iniziale (dettagli in `roadmap.md`).

Branch Git per viaggio (proposto dalla documentazione originale consegnata in `handoff/`,
poi rimossa): scartato in favore di sotto-cartelle `trips/<nome>/` che coesistono su `main`,
decisione registrata in `memory/decisions.md`.

Un progetto Firebase per viaggio: scartato in favore di un progetto unico con dati Firestore
namespaced per `TRIP_ID`, per evitare di dover creare un nuovo progetto Firebase ad ogni nuovo
viaggio. Decisione registrata in `memory/decisions.md`.

## Flussi di codice e ruolo architetturale dei file

`public/index.html` è la shell canonica: markup, CSS e tutta la logica applicativa (stato in
memoria, inizializzazione Firebase, rendering, listener realtime). Non contiene mai dati di un
viaggio specifico. Ogni `trips/<nome>/index.html` è una copia byte-per-byte di questa shell al
momento della creazione del viaggio; propagare una correzione della shell richiede di ricopiarla
manualmente in ogni cartella viaggio che si vuole aggiornare (nessun meccanismo di import a
runtime tra `public/` e `trips/`, per scelta).

`trips/<nome>/trip.config.js` esporta `TRIP_ID`, `FIREBASE_CONFIG`, `TRIP_META`, `MAP_LOCATIONS`,
`TRIP_DATA`; è l'unico file che cambia da un viaggio all'altro, insieme al resto della cartella
che lo contiene. `trips/<nome>/firebase.json` punta `"public"` alla cartella corrente (`"."`)
perché `index.html` e `trip.config.js` vivono direttamente dentro `trips/<nome>/`, non in una
sottocartella ulteriore.

`services/flight-search/app/main.py` espone l'endpoint FastAPI `/api/flights/search`, che
interroga in parallelo (`ThreadPoolExecutor`) una lista di adapter (`app/adapters/`) tutti
conformi all'interfaccia `FlightSourceAdapter` (`app/adapters/base.py`) e normalizzati verso lo
schema `FlightOffer` (`app/schemas.py`), poi ordina per prezzo. Un adapter che fallisce non
blocca gli altri. Le risposte sono cache-ate in memoria con TTL di 5 minuti (`app/cache.py`).

`services/stay-search/app/main.py` espone `/api/stays/search`, stesso pattern ma senza cache né
parallelismo (un solo adapter attivo oggi, `PyairbnbAdapter`). `app/geocoding.py` traduce il nome
di una località in un bounding box via Nominatim prima di interrogare Airbnb.

## Riferimenti a snippet

`public/index.html:seedIfNeeded` — seeding automatico di Firestore al primo avvio di un viaggio,
percorsi namespaced sotto `trips/{TRIP_ID}`.

`public/index.html:listenRealtime` — i due listener `onSnapshot` che realizzano la
sincronizzazione realtime tra i due dispositivi.

`services/flight-search/app/adapters/fast_flights_adapter.py:FastFlightsAdapter.search` — unico
adapter di ricerca voli verificato live, verso la libreria `fast-flights` (stato di verifica
descritto in `services/flight-search/README.md`).

`services/stay-search/app/adapters/pyairbnb_adapter.py:PyairbnbAdapter.search` — bypassa due bug
reali della libreria `pyairbnb` 2.2.1 scoperti in sessione (chiave di risposta annidata ignorata
dalle funzioni pubbliche, campo prezzo totale sempre a zero); dettagli nel docstring del file e
in `services/stay-search/README.md`.
