---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - public/**
  - trips/**
  - services/flight-search/**
  - README.md
  - .gitignore
last-verified-commit: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
stato: in corso
---

# Lavoro in corso

> La fonte di verità su cosa è fatto resta `memory/index.md` e il work-log, non le spunte di
> questo file. Ogni feature si descrive con lo schema fisso sotto, così il lavoro pendente è
> leggibile senza ricostruire il contesto da capo.

## Feature: integrazione del codice consegnato da `handoff/` nella struttura definitiva — chiusa

Cosa fa: il codice dell'app (travel app Firebase + Leaflet), consegnato da una sessione Claude
precedente in `handoff/`, è stato portato nella struttura definitiva. A differenza dell'ipotesi
originale di `handoff/README.md` (un solo `public/` condiviso), la struttura adottata è a
sotto-cartella per viaggio: `public/index.html` resta la shell canonica sorgente di verità, ogni
viaggio vive in `trips/<nome>/` con una propria copia di shell, `trip.config.js` e `firebase.json`.
Decisione motivata in `memory/decisions.md`.

File creati: `public/index.html`, `trips/cilento-2026/{index.html, trip.config.js, firebase.json,
.firebaserc}`, `README.md` di radice (riscritto sul modello a cartelle).

File modificati: `.gitignore` (pattern `_trip-notes/`, commento sui pattern Firebase applicati a
ogni profondità).

File rimossi: `handoff/` (contenuto migrato, nessuna copia di riferimento conservata).

Definition of done:

- [x] Struttura del repository a sotto-cartella per viaggio (`public/` + `trips/<nome>/`)
- [x] `README.md` di radice riscritto per il nuovo modello
- [x] `handoff/` rimossa dopo la migrazione
- [ ] Scheda `dev-testing.md` ancora da popolare (non esiste ancora nulla da documentare: nessun
      test nel repository) — STACK.md, design-and-security.md e deployment.md popolate in sessione
- [ ] Diagrammi Mermaid migrati in `context/diagrams/` invece di restare inline in README.md

Domande aperte: nessuna residua su questa feature; le domande originali (layout `public/` e sorte
di `handoff/`) sono state risolte in sessione.

## Feature: motore di ricerca voli (Fase 1 della roadmap) — avviata

Cosa fa: introduce il primo servizio backend del progetto, `services/flight-search/`, uno scaffold
FastAPI con un adapter funzionante verso una fonte di ricerca voli e uno schema `FlightOffer`
normalizzato. È l'avvio della Fase 1 descritta in `roadmap.md`, non l'implementazione completa: le
fonti aggiuntive (Amadeus, Kiwi Tequila) e la cache restano fuori da questa sessione.

File da creare: vedi `roadmap.md` per il piano completo; il dettaglio di questa fase è nel README
del servizio stesso, `services/flight-search/README.md`.

Definition of done:

- [x] Scaffold FastAPI con un adapter funzionante e un endpoint di ricerca
- [x] Verificato con esecuzione reale (pip install, uvicorn reale, ricerca live FCO→CDG,
      11 offerte reali con prezzi/orari veri) — non solo controllo di sintassi. Nel farlo,
      corretto l'adapter due volte: l'API reale della libreria installata (v3.0.2) differisce
      da quella descritta dalla ricerca web usata per la prima stesura (struttura annidata
      Result→Flights→SingleFlight, non un oggetto Flight piatto), e serve un bypass del muro
      di consenso GDPR di Google (cookie `SOCS`) da rete europea. Dettagli in
      `services/flight-search/README.md`.
- [x] ~~Adapter Amadeus Flight Offers Search come seconda fonte~~ — scritto, poi **rimosso**:
      durante la verifica è emerso che il portale self-service Amadeus chiude il 17 luglio 2026
      (fonti indipendenti: PhocusWire, Tragento), nuove registrazioni già sospese. Codice
      cancellato invece di lasciato come riferimento morto. Dettagli e motivazione in
      `roadmap.md` e ADR-006 (`memory/decisions.md`).
- [x] Adapter Kiwi Tequila come seconda fonte (sostituisce Amadeus) — scritto e collegato in
      `main.py`, degrada correttamente a lista vuota senza chiave (verificato: l'endpoint
      continua a funzionare con la sola fonte `fast_flights`). Verifica più debole delle altre
      due fonti tentate finora: base URL e header `apikey` confermati con una richiesta HTTP
      reale non autenticata, ma i nomi dei campi della risposta sono ricostruiti incrociando
      fonti di terzi (documentazione ufficiale non leggibile, pagina client-side), non verificati
      contro una risposta live. **Non eseguito contro l'API live**: servono credenziali reali
      (`KIWI_TEQUILA_API_KEY`) che l'utente non ha ancora generato. Dettagli in
      `services/flight-search/README.md`.
- [x] Cache delle ricerche (TTL breve) — `app/cache.py`, `TTLCache` in-memory a singolo
      processo, 300 secondi. Verificato: prima chiamata reale (~1.3s), seconda identica servita
      dalla cache (~0.0s). Limite dichiarato: non condivisa tra processi/istanze, upgrade a
      Redis segnato come futuro se il servizio scala oltre un singolo processo.
- [x] Query in parallelo invece che sequenziali (`ThreadPoolExecutor` in `main.py`) e ordinamento
      dei risultati per prezzo crescente — verificati insieme alla cache.
- [ ] Scelta e messa in opera dell'hosting del servizio (self-hosted Docker Compose vs cloud
      free-tier, vedi `roadmap.md`) — oggi il servizio esiste solo come codice locale, non deployato

Domande aperte: dove e come deployare questo servizio non è stato deciso in questa sessione — resta
un item della roadmap, non bloccante per lo sviluppo locale del servizio stesso. Il bypass del
consenso GDPR (cookie `SOCS` hardcoded) non è garantito stabile nel tempo: se Google cambia
l'interstitial, l'adapter tornerà a restituire zero risultati finché non si aggiorna il cookie.
L'adapter Kiwi resta da verificare con una ricerca live non appena l'utente genera la chiave: la
sola verifica di base URL/header, senza un esempio ufficiale della risposta, è più debole della
verifica live già fatta per `fast_flights`.

## Feature: motore di ricerca alloggi (Fase 2 della roadmap) — avviata

Cosa fa: introduce il secondo servizio backend, `services/stay-search/`, stesso adapter pattern
di `flight-search`. Un adapter attivo (`PyairbnbAdapter`, verso Airbnb via `pyairbnb`), schema
`StayOffer` normalizzato, geocodifica del nome località via Nominatim (gratuita, nessuna chiave)
per accettare un nome di città invece di coordinate grezze.

File da creare: vedi `roadmap.md` per il piano completo; il dettaglio è nel README del servizio,
`services/stay-search/README.md`.

Definition of done:

- [x] Scaffold FastAPI con un adapter funzionante e un endpoint di ricerca, verificato con
      esecuzione reale (pip install, ricerca live "Marina di Camerota", 40 alloggi reali con
      nomi/prezzi/valutazioni veri) — non solo controllo di sintassi. Nel farlo, scoperti e
      aggirati due bug reali della libreria installata (`pyairbnb` 2.2.1): le funzioni pubbliche
      di ricerca cercano una chiave di primo livello che non esiste nella risposta grezza
      (bypassato chiamando le funzioni interne direttamente), e il campo `price.total` è sempre
      0 (il prezzo reale è nell'ultimo elemento di `price.break_down`). Dettagli in
      `services/stay-search/README.md`.
- [ ] Seconda fonte alloggi: nessuna individuata. Amadeus Hotel API condivide la chiusura del
      portale descritta sopra; Booking.com Demand API resta partner-only. Domanda aperta, non
      una svista: richiede una ricerca dedicata prima di poter procedere.
- [ ] Cache delle ricerche (oggi assente; `flight-search` ha già un pattern riusabile in
      `app/cache.py` se si vuole la stessa soluzione)
- [ ] Scelta e messa in opera dell'hosting — stessa domanda aperta di `flight-search`, non decisa

Domande aperte: quale seconda fonte alloggi usare, non risolta in questa sessione. Il rischio ToS
di `pyairbnb` (nessuna API ufficiale, reverse-engineering della GraphQL Airbnb) è più alto delle
fonti voli usate finora, accettato per uso privato a basso volume secondo il ragionamento già
in `roadmap.md`, non un rischio nuovo introdotto qui.

## Riconciliazione

Ultima verifica: 2026-07-07, non ancora committata (ultimo commit reale su `origin/main`:
`cfb97ca`, "Aggiungi adapter Amadeus come seconda fonte voli" — superato dal lavoro di questa
sessione, che rimuove Amadeus e aggiunge Kiwi e `stay-search`).
