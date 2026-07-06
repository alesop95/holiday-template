---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - public/**
  - trips/**
  - services/flight-search/**
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

Il *backend* (`services/flight-search/`), introdotto in questa sessione come avvio della Fase 1
della roadmap funzionalità, è Python + FastAPI, gestore pacchetti pip con `requirements.txt`
(nessun ambiente virtuale ancora fissato nel repository). Non è collegato al frontend: oggi è un
servizio a sé, eseguibile in locale con `uvicorn`, senza deployment configurato.

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

`services/flight-search/app/main.py` espone l'endpoint FastAPI `/api/flights/search`, che delega
la ricerca a una lista di adapter (`app/adapters/`) tutti conformi all'interfaccia
`FlightSourceAdapter` (`app/adapters/base.py`) e normalizzati verso lo schema `FlightOffer`
(`app/schemas.py`). Un adapter che fallisce non blocca gli altri: gli errori si accumulano e
vengono restituiti solo se nessun adapter ha prodotto risultati.

## Riferimenti a snippet

`public/index.html:seedIfNeeded` — seeding automatico di Firestore al primo avvio di un viaggio,
percorsi namespaced sotto `trips/{TRIP_ID}`.

`public/index.html:listenRealtime` — i due listener `onSnapshot` che realizzano la
sincronizzazione realtime tra i due dispositivi.

`services/flight-search/app/adapters/fast_flights_adapter.py:FastFlightsAdapter.search` — unico
adapter di ricerca voli oggi funzionante, verso la libreria `fast-flights` (stato di verifica
descritto in `services/flight-search/README.md`).
