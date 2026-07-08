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
- [x] Suite di test (`tests/`, pytest), 21 test, tutti passanti — cache, adapter (con payload
      dalla forma reale verificata), endpoint (aggregazione, fault tolerance, cache hit).
      Dettagli in `.claude/context/dev-testing.md`.
- [ ] Hosting: **deciso Render** (ADR-008), `render.yaml` scritto e verificato contro la
      documentazione ufficiale — creazione effettiva dei servizi su Render non ancora eseguita
      (passo manuale, vedi `deployment.md`)

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
- [x] ~~Seconda fonte alloggi~~ — ricercata esplicitamente, conclusione: nessuna praticabile per
      ora. Amadeus Hotel API condivide la chiusura del portale (ADR-006); Booking.com Demand API
      resta partner-only; l'unica alternativa keyless trovata per Booking.com sono scraper
      community basati su Playwright/browser headless (nessuna libreria pip semplice come
      `pyairbnb`), più fragili e pesanti per il beneficio atteso — non implementati per scelta,
      non per mancanza di tempo. Riaprire se in futuro emerge una libreria HTTP-diretta
      equivalente a `pyairbnb` per Booking.com.
- [x] Cache delle ricerche — `app/cache.py`, stesso `TTLCache` di `flight-search` ma TTL più
      lungo (600s: disponibilità alloggi cambia più lentamente dei prezzi voli nell'arco della
      giornata). Verificato con test dedicato.
- [x] Suite di test (`tests/`, pytest), 11 test, tutti passanti — geocodifica, adapter (con
      payload dalla forma reale verificata, con e senza sconto), endpoint, cache. Stesso pattern
      di `flight-search`, dettagli in `.claude/context/dev-testing.md`.
- [ ] Hosting: deciso Render insieme agli altri tre servizi (ADR-008) — non ancora eseguito

Domande aperte: nessuna sulla seconda fonte (ricercata e conclusa: nessuna praticabile per ora,
vedi DoD sopra). Il rischio ToS di `pyairbnb` (nessuna API ufficiale, reverse-engineering della
GraphQL Airbnb) è più alto delle fonti voli usate finora, accettato per uso privato a basso
volume secondo il ragionamento già in `roadmap.md`, non un rischio nuovo introdotto qui.

## Feature: motore di ricerca punti di interesse (Fase 4 della roadmap, itinerary builder) — avviata

Cosa fa: introduce il terzo servizio backend, `services/poi-search/`, stesso adapter pattern
degli altri due. Un adapter attivo (`OverpassAdapter`, verso Overpass API/OpenStreetMap), schema
`PointOfInterest` normalizzato, stessa geocodifica via Nominatim di `stay-search` (duplicata, non
condivisa, per la stessa ragione architetturale già in `STACK.md`).

File da creare: vedi `roadmap.md` per il piano completo; il dettaglio è nel README del servizio,
`services/poi-search/README.md`.

Definition of done:

- [x] Scaffold FastAPI con un adapter funzionante e un endpoint di ricerca, verificato con
      esecuzione reale (query dirette a Overpass da riga di comando, poi ricerca live via
      `TestClient` per "Marina di Camerota": 7 POI reali, alcuni già presenti nell'itinerario
      scritto a mano di Cilento). Scoperti in sessione: il server risponde 406 senza un header
      `User-Agent` esplicito (impostato); molti elementi `historic` non hanno un tag `name`
      (scartati, un POI senza nome non è suggeribile); i valori di alloggio del tag `tourism`
      vengono esclusi perché competenza di `stay-search`, non di questo servizio.
- [x] Cache delle ricerche — stesso `TTLCache`, TTL di un'ora (i POI cambiano più raramente di
      prezzi voli/alloggi).
- [x] Suite di test (`tests/`, pytest), 10 test, tutti passanti — geocodifica, adapter (filtro
      elementi senza nome/di tipo alloggio, rispetto del limite), endpoint, cache.
- [ ] Data model Trip → Days → Places/Reservations che collega i POI trovati a un itinerario
      reale — non iniziato, è il pezzo che manca per passare da "motore di ricerca POI" a
      "itinerary builder" vero e proprio.
- [ ] Routing/ottimizzazione del percorso giornaliero (OpenTripPlanner o GraphHopper self-hosted)
      — non iniziato, richiede una decisione infrastrutturale (Docker) non ancora presa.
- [ ] Hosting: deciso Render insieme agli altri tre servizi (ADR-008) — non ancora eseguito

Domande aperte: nessuna sulla fonte POI (Overpass scelta esplicitamente al posto di OpenTripMap
perché non richiede chiave, vedi `roadmap.md`). Resta aperta la stessa domanda di hosting degli
altri due servizi backend, e il data model dell'itinerario non è stato progettato in questa
sessione.

## Feature: comparatore unico voli+alloggi+POI (Fase 3 della roadmap, layer comparatore) — chiusa

Cosa fa: nuovo servizio `services/trip-planner/`, l'unico dei quattro senza adapter propri —
chiama via HTTP `flight-search`, `stay-search` e `poi-search` in parallelo (`asyncio.gather`,
non `ThreadPoolExecutor`: qui il lavoro è I/O puro verso altri servizi, non librerie sincrone
bloccanti) e combina le risposte in un unico `{flights, stays, points_of_interest, errors}`.

File da creare: vedi `roadmap.md` per il piano completo; il dettaglio è nel README del servizio,
`services/trip-planner/README.md`.

Definition of done:

- [x] Scaffold FastAPI con orchestrazione funzionante, verificato con esecuzione reale non solo
      `TestClient`: avviati tutti e quattro i servizi con `uvicorn` reale su porte separate
      (8001-8004), una vera richiesta FCO→CDG/Parigi ha restituito 7 voli, 40 alloggi, 4 POI
      reali, zero errori.
- [x] Tolleranza ai guasti verificata live, non solo nei test: fermato `poi-search` a metà
      sessione di test, la richiesta successiva è tornata 200 con voli e alloggi intatti e un
      errore specifico (`"poi: All connection attempts failed"`), non un fallimento totale.
- [x] Suite di test (`tests/`, pytest), 4 test, tutti passanti — combinazione delle tre risposte,
      degradazione con un servizio giù, payload inviati a ciascun servizio a valle corretti.
- [ ] Nessuna stima di costo totale che sommi un volo + un alloggio scelti — oggi liste separate.
- [ ] Hosting: deciso Render (ADR-008) — con una complicazione in più di cui `render.yaml` tiene
      conto: questo servizio dipende dalla raggiungibilità pubblica degli altri tre, i cui URL
      Render vanno incollati a mano nelle sue variabili d'ambiente dopo il loro primo deploy.

Domande aperte: nessuna specifica a questa feature, oltre alla domanda di hosting già comune
agli altri tre servizi (qui più stringente, perché questo servizio non funziona affatto se gli
altri non sono raggiungibili).

## Feature: scheda "Pianifica" — collega il comparatore all'itinerario (parte del data model di Fase 4) — avviata

Cosa fa: nuova scheda nella shell canonica (`public/index.html`, propagata in
`trips/cilento-2026/index.html`) con un form che chiama `trip-planner` (`fetch` verso
`TRIP_PLANNER_URL`, nuovo export di `trip.config.js`, default `http://localhost:8004`) e mostra
voli/alloggi/POI reali con un pulsante "Salva" per giorno. Il salvataggio scrive direttamente su
Firestore dal browser (nessun Admin SDK nel backend, vedi ADR-007), nuovo documento
`trips/{TRIP_ID}/state/planning` sincronizzato in realtime come checklist e note. Chiude parte
del gap "data model Trip → Days → Places" segnalato nella feature POI sopra, senza toccare il
routing/ottimizzazione del percorso (ancora non iniziato).

File modificati: `public/index.html` (nav, pannello, CSS, `renderPlanResults`/`renderPlanSaved`/
`searchPlan`/`savePlanItem`/`removePlanItem`, seed e listener realtime di `state/planning`),
propagato in `trips/cilento-2026/index.html`; `trips/cilento-2026/trip.config.js` (nuovo export
`TRIP_PLANNER_URL`); `services/{flight-search,stay-search,poi-search,trip-planner}/app/main.py`
(CORS aperto, necessario perché il browser blocchi altrimenti la risposta).

Definition of done:

- [x] Form di ricerca e chiamata reale a `trip-planner` — verificato live: i quattro servizi
      avviati con `uvicorn` reale, una richiesta HTTP diretta con lo stesso payload che manda il
      form (FCO→NAP, Marina di Camerota) ha restituito 4 voli/2 alloggi/4 POI reali, in una forma
      che corrisponde esattamente ai campi letti da `renderPlanResults` (non assunta, controllata
      campo per campo contro la risposta vera).
- [x] CORS verificato live — preflight `OPTIONS` reale contro `trip-planner` con un'origine
      finta da browser (`http://localhost:5500`) restituisce `access-control-allow-origin: *`.
- [x] Primo test in browser reale (screenshot dell'utente, 2026-07-08): la ricerca fallisce con
      `Failed to fetch` verso `http://localhost:8004`. Diagnosi confermata, non solo ipotizzata:
      la shell gira su HTTPS (`viaggio-new.web.app`) e il browser blocca come *mixed content* una
      chiamata attiva verso un'origine HTTP in chiaro, a prescindere da come risponde il servizio
      — non un problema di CORS (verificato separatamente, funzionante) né di servizi spenti
      (erano attivi e rispondevano a `curl` nello stesso momento).
- [ ] **Il flusso di salvataggio/rimozione su Firestore resta non verificato in un browser
      reale**, bloccato dal problema sopra: senza un backend raggiungibile in HTTPS, la ricerca
      non produce mai risultati da salvare. Sbloccato dal deploy del backend su Render (ADR-008,
      `deployment.md`): una volta che `TRIP_PLANNER_URL` punta a un URL Render HTTPS invece di
      `localhost`, il test visivo (ricerca, salvataggio su un giorno, controllo su
      "Salvati nell'itinerario" e sull'altro dispositivo) torna eseguibile.
- [ ] Nessuna stima di costo aggregato tra un volo e un alloggio salvati sullo stesso giorno.
- [ ] Routing/ottimizzazione del percorso giornaliero — non iniziato, resta un item separato.

Domande aperte: se il flusso di salvataggio si rivela corretto al riscontro visivo dopo il deploy
Render, resta da decidere se mostrare gli elementi salvati anche dentro la scheda "Itinerario"
(accanto a note e segna-come-fatto) invece che solo nella scheda "Pianifica" — non deciso in
questa sessione.

## Riconciliazione

Ultima verifica: 2026-07-08. Ultimo commit reale su `origin/main` al momento di scrivere (da
verificare con `git log`/`git status`, non assumere): il lavoro su cache di `stay-search`,
`poi-search` e ora `trip-planner` potrebbe non essere ancora committato — controllare `git
status` prima di assumere lo stato esatto.
