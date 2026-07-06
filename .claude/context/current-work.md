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
- [ ] Adapter Amadeus Flight Offers Search come seconda fonte
- [ ] Adapter Kiwi Tequila per multi-città/self-transfer
- [ ] Cache delle ricerche (TTL breve)
- [ ] Scelta e messa in opera dell'hosting del servizio (self-hosted Docker Compose vs cloud
      free-tier, vedi `roadmap.md`) — oggi il servizio esiste solo come codice locale, non deployato

Domande aperte: dove e come deployare questo servizio non è stato deciso in questa sessione — resta
un item della roadmap, non bloccante per lo sviluppo locale del servizio stesso. Il bypass del
consenso GDPR (cookie `SOCS` hardcoded) non è garantito stabile nel tempo: se Google cambia
l'interstitial, l'adapter tornerà a restituire zero risultati finché non si aggiorna il cookie.

## Riconciliazione

Ultima verifica: 2026-07-06 al commit fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff, committato e
pushato su `origin/main` dall'utente (commit `aeaeb84`, `5e52006`, `fb591e5`).
