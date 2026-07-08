# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. È la fonte di verità su cosa è fatto,
> non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: 98e4395436dbbef21198cdf245cf49813acfe324 (verificare con git log: potrebbe
                       essere avanzato, questo file viene aggiornato meno spesso dei commit)
Data snapshot:         2026-07-08
```

Nota importante per chi riprende: la storia Git precedente a questo commit è stata riscritta
(`git filter-repo`, ADR-005) per bonificare una `apiKey` Firebase esposta pubblicamente. Gli hash
dei commit antecedenti a quell'operazione non coincidono più con eventuali riferimenti più vecchi
di questo file o della chat. Non fidarsi di hash citati altrove precedenti al 2026-07-07.

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | fb591e5 | popolata, committata (hash pre-riscrittura storia, contenuto valido) |
| design-and-security.md | fb591e5 | popolata, committata (hash pre-riscrittura storia, contenuto valido) |
| deployment.md | fb591e5 | popolata, committata (hash pre-riscrittura storia, contenuto valido) |
| dev-testing.md | 98e4395 | aggiornata in sessione (2026-07-07), non ancora committata |
| current-work.md | 98e4395 | aggiornata in sessione (2026-07-07), non ancora committata |
| roadmap.md | 98e4395 | aggiornata in sessione (2026-07-07), non ancora committata |

## Punto di ripresa

**Frontend**: struttura a sotto-cartella per viaggio (`public/index.html` shell canonica +
`trips/cilento-2026/`), deployato e funzionante su `https://viaggio-new.web.app` con dati reali,
palette ispirata a WeRoad, font Poppins/DM Sans, senza emoji (per scelta esplicita, da replicare
per ogni vacanza futura). Un solo progetto Firebase condiviso (`viaggio-new`), dati Firestore
namespaced per `TRIP_ID`. Cache Hosting disabilitata su HTML/JS (altrimenti un anno di sviluppo
attivo si scontra con la cache di un'ora di default).

**Incidente di sicurezza chiuso** (ADR-005): una `apiKey` Firebase è finita esposta nel
repository pubblico; risolto con restrizione della chiave su Google Cloud Console (referrer HTTP
+ 4 API invece di 25) e bonifica della storia Git (`git filter-repo`, force-push), entrambe
verificate indipendentemente, non assunte dall'output dell'utente.

**Backend, quattro servizi indipendenti, tutti Python/FastAPI**, 46 test totali, tutti passanti,
nessuna chiamata di rete reale nei test: `services/flight-search/` (Fase 1) — `fast_flights`
(Google Flights scraping) verificato live e funzionante; `Kiwi Tequila` scritto come seconda
fonte ma non ancora verificato live (manca la chiave, registrazione in corso, interrotta a metà
per continuare con lo sviluppo di puro codice). `services/stay-search/` (Fase 2) — `pyairbnb`
(Airbnb scraping) verificato live; nessuna seconda fonte alloggi praticabile trovata (ricerca
chiusa, non dimenticata). `services/poi-search/` (Fase 4, itinerary builder) — Overpass API
(OpenStreetMap) verificato live; manca il data model che collega i POI a un itinerario vero.
`services/trip-planner/` (Fase 3, layer comparatore, nuovo) — orchestra gli altri tre via HTTP
(`asyncio.gather`), verificato live con tutti e quattro i servizi in esecuzione reale insieme
(7 voli + 40 alloggi + 4 POI per una ricerca FCO→CDG/Parigi) e con un test esplicito di
tolleranza ai guasti. **Amadeus abbandonato** (ADR-006): il portale self-service chiude il 17
luglio 2026, adapter scritto e poi rimosso per intero, non ritentare.

Nessuno dei quattro backend è deployato da nessuna parte: girano solo in locale con `uvicorn`
(porte 8001-8004). Questa è la prossima decisione strutturale in sospeso, resa più stringente
dall'esistenza di `trip-planner` (dipende dalla raggiungibilità reciproca degli altri tre).

**Collegamento frontend-backend, primo pezzo (2026-07-08)**: la shell guadagna una scheda
"Pianifica" che chiama `trip-planner` via `fetch` e salva un risultato scelto su un giorno
specifico direttamente su Firestore dal browser, senza dare al backend un Admin SDK (ADR-007,
`memory/decisions.md`) — CORS aperto sui quattro servizi per permettere la chiamata da browser.
Verificato dal vivo lato rete (CORS, forma della risposta contro il rendering reale). **Primo test
in browser reale fallito** con `Failed to fetch`: diagnosi confermata (screenshot dell'utente) è
un blocco di *mixed content* del browser, la shell HTTPS non può chiamare un backend
`http://localhost`. Deciso di conseguenza l'hosting dei quattro backend su **Render** (ADR-008),
`render.yaml` alla radice, che risolve il blocco mettendo anche il backend su HTTPS — creazione
effettiva dei servizi su Render non ancora eseguita (passo manuale). Il test visivo del
salvataggio su Firestore resta sospeso fino a quel deploy, dettaglio in `current-work.md`.

Prossima azione dichiarata dall'utente: finire tutto lo sviluppo di puro codice possibile prima
di tornare ai passi manuali, che ora sono tre: completare la registrazione Kiwi Tequila, creare
i quattro servizi su Render da `render.yaml` (Dashboard Render > New > Blueprint) e collegarne gli
URL pubblici, e infine il riscontro visivo in browser della scheda "Pianifica". Committare il
lavoro descritto in questa voce se non ancora fatto al momento della lettura (controllare
`git status` prima di assumere).
