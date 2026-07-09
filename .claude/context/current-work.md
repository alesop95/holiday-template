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
- [x] Backend deployato su Render (ADR-008): tutti e quattro i servizi "Deployed", URL pubblici
      assegnati (`flight-search-pfcn`, `stay-search`, `poi-search`, `trip-planner-l2dh`, dominio
      `.onrender.com`), variabili `FLIGHT_SEARCH_URL`/`STAY_SEARCH_URL`/`POI_SEARCH_URL` di
      `trip-planner` impostate a mano dopo il primo deploy come previsto.
- [x] **Bug scoperto e corretto dal primo test end-to-end reale su Render**: una richiesta a
      `/api/trip-plan` tornava 200 ma con tre errori (502 da `flight-search` e `poi-search`, 429
      da `stay-search`). Diagnosticato chiamando i tre servizi direttamente: funzionano tutti, ma
      un cold start (~50s, piano free) più lo scraping reale portano una singola ricerca a
      32-56 secondi su Render, contro pochi secondi in locale — sopra il timeout fisso di 30s che
      `trip-planner` usava per ogni chiamata a valle (`app/main.py:_fetch`), e sopra il timeout di
      30s che `poi-search` stesso usava verso Overpass (spiega la lista POI vuota invece di un
      errore esplicito). Alzati entrambi a un margine più ampio (90s in `trip-planner`, 60s/50s in
      `poi-search`/query Overpass). 46 test rieseguiti dopo la modifica, nessuna regressione.
- [x] Nuovo test end-to-end su Render dopo la correzione dei timeout: riuscito. Un primo tentativo
      subito dopo il redeploy ha ancora mostrato 502 su due servizi (non ancora svegli: perfino
      `/health` non rispondeva entro 30s), ma non era un problema del fix — un secondo tentativo,
      dopo che i quattro servizi erano caldi, ha restituito 1 volo, 2 alloggi, 4 POI, zero errori,
      in meno di 3 secondi. Il cold start del piano free può superare i 30-50 secondi dichiarati
      da Render nella propria UI: confermato dal vivo, non solo dalla documentazione.
- [x] `TRIP_PLANNER_URL` in `trips/cilento-2026/trip.config.js` aggiornato a
      `https://trip-planner-l2dh.onrender.com`.
- [ ] Ridistribuire con `firebase deploy` (dalla cartella `trips/cilento-2026/`, passo manuale)
      prima che il test visivo della scheda "Pianifica" in browser sia possibile.
- [x] **Secondo bug scoperto dal primo uso reale in browser**: aeroporti obbligatori nel form e
      nello schema `TripPlanRequest`, anche per un viaggio come Cilento che è esplicitamente in
      auto e non prevede alcun volo. Corretto: `origin_airport`/`destination_airport` diventano
      opzionali in `TripPlanRequest` (`services/trip-planner/app/schemas.py`), `build_trip_plan`
      salta del tutto la chiamata a `flight-search` se mancano entrambi (niente voce in `errors`
      per una ricerca mai fatta); il form richiede entrambi i campi solo se ne è compilato uno,
      altrimenti li tratta come volutamente assenti. Aggiunto un quinto test (47 totali) che
      verifica che `flight-search` non venga proprio interrogato in questo caso. Anche l'etichetta
      del menu a tendina "Salva su giorno" era poco chiara: aggiunta la scritta "Aggiungi al
      giorno" accanto al menu.
- [x] **Terzo problema segnalato dall'uso reale**: gli alloggi mostrati non avevano alcun link
      cliccabile alla pagina Airbnb reale per prenotare, anche se `StayOffer.url` esiste già nella
      risposta del backend — semplicemente non veniva mai renderizzato. Aggiunto un link "Vedi e
      prenota su Airbnb" su ogni card, sia nei risultati di ricerca sia negli elementi salvati.
      Colto nello stesso intervento un problema di sicurezza adiacente non ancora segnalato da
      nessuno: i dati di voli/alloggi/POI vengono da fonti esterne scrapate (a differenza del
      resto della shell, dati sempre scritti dallo sviluppatore in `trip.config.js`) e finivano in
      `innerHTML` senza alcun escaping — aggiunta una funzione `escHtml` e applicata a tutti i
      campi dinamici di questa scheda.
- [ ] Nessuna stima di costo aggregato tra un volo e un alloggio salvati sullo stesso giorno.
- [ ] Routing/ottimizzazione del percorso giornaliero — non iniziato, resta un item separato.

Domande aperte: se il flusso di salvataggio si rivela corretto al riscontro visivo dopo il deploy
Render, resta da decidere se mostrare gli elementi salvati anche dentro la scheda "Itinerario"
(accanto a note e segna-come-fatto) invece che solo nella scheda "Pianifica" — non deciso in
questa sessione.

**Filtri e ordinamento aggiunti** (terza delle quattro richieste grandi): voli (solo diretti,
prezzo crescente/decrescente), alloggi (valutazione minima, prezzo o valutazione), POI (categoria,
sempre ordinati per nome). Tutto client-side su `S.planResults` già scaricato, nessuna nuova
chiamata al backend. Punto delicato risolto: filtrare/ordinare non deve rompere `savePlanItem`,
che identifica l'oggetto da salvare per indice nell'array originale — ogni item porta con sé
l'indice originale (`{item, origIndex}`) anche dopo filtro/sort, verificato con dati di esempio in
uno script Node a parte (nessun test automatico esiste per il frontend). I filtri si azzerano a
ogni nuova ricerca (`PLAN_FILTERS_DEFAULT`), per non applicare per errore un filtro della ricerca
precedente a una nuova. Non ancora verificato in browser.

**Autocompletamento aeroporti, suggerimento città, mappetta prezzi** (quarta richiesta di questo
giro, in tre parti): nuovo `public/airports.json` (propagato in `trips/cilento-2026/`), 4562
aeroporti con IATA reale, filtrato dal dataset pubblico OurAirports (verificato dal vivo: 12.6MB
di CSV scaricato ed elaborato con uno script Node deterministico, non un elenco a memoria). Campi
`pf-origin`/`pf-dest-air` ora hanno un autocompletamento che cerca per città/nome/codice e mostra
un punteggio di rilevanza (il codice esatto digitato deve comparire primo, non dopo un aeroporto
con quella stringa come sottostringa casuale del nome — bug reale trovato e corretto in sessione
con l'esempio concreto "FUE" prima mostrava Cienfuegos come primo risultato). Selezionando
l'aeroporto di arrivo, la "Città/zona" si autocompila con il comune dell'aeroporto solo se il
campo è vuoto (mai sovrascrive una scelta manuale, perché il comune dell'aeroporto non è sempre
la zona turistica giusta: FUE è "El Matorral", non "Corralejo", segnalato esplicitamente
dall'utente).

Mappetta prezzi: `StayOffer` guadagna `lat`/`lon` (`services/stay-search/`), estratti da un campo
della libreria `pyairbnb` mai usato finora (`coordinates.latitude`/`coordinates.longitud`, refuso
reale senza "e" finale, verificato leggendo il codice sorgente installato e poi con una ricerca
live: 40/40 alloggi reali con coordinate valide). Nuova mappa Leaflet dedicata nella scheda
"Pianifica" (`renderPlanPriceMap`, istanza separata da quella della scheda "Mappa"), un marker per
alloggio con il prezzo come etichetta.

Definition of done:

- [x] Dataset aeroporti scaricato ed elaborato da fonte reale, verificato con i codici della
      richiesta originale (BLQ, FUE).
- [x] Punteggio di rilevanza dei suggerimenti verificato con uno script a parte prima di scriverlo
      nel codice applicativo.
- [x] Coordinate alloggi verificate live (40/40 con lat/lon reali), 13 test backend aggiornati
      (incluso un test dedicato al refuso "longitud" per bloccare una regressione futura).
- [ ] Non ancora verificato in un browser reale: autocompletamento, suggerimento città, mappetta.
- [ ] Nessuna fonte treni ancora integrata: la mappetta e i filtri riguardano solo voli/alloggi/POI
      già esistenti, non tocca la richiesta separata sui treni (ancora in sospeso).

**Zone turistiche note per aeroporto leisure, aggiunta dopo un caso reale**: il primo test
dell'utente su BLQ→FUE ha mostrato solo un alloggio a "El Matorral" (il comune amministrativo
dell'aeroporto, minuscolo — verificato via Nominatim, ~4x4 km, non la zona turistica). Nuovo
`public/airport-zones.json` (propagato in `trips/cilento-2026/`), 25 aeroporti "leisure" (isole e
destinazioni balneari) con 2-4 zone turistiche reali ciascuno, ogni voce verificata con una
ricerca web dedicata (non a memoria) da un agente di ricerca separato, che ha anche escluso
esplicitamente gli aeroporti dove il comune amministrativo coincide già con la zona turistica
(es. Lampedusa, Pantelleria) invece di forzare una voce ovunque. Selezionando un aeroporto di
arrivo con una voce in questo file, compaiono delle "chip" cliccabili con le zone note sotto il
campo Città/zona; un clic sovrascrive sempre il campo (scelta esplicita), a differenza del comune
amministrativo che non sovrascrive mai un valore già presente.
Bug di escaping trovato e corretto prima di verificarlo in browser: una delle zone reali
("Playa d'en Bossa", Ibiza) contiene un apostrofo che avrebbe rotto una stringa JS incorporata
direttamente in un attributo `onclick` — risolto con un `data-zone` letto via
`this.dataset.zone` invece di interpolare il nome dentro il JavaScript, verificato con un test
di rendering a parte (nessun test automatico esiste per il frontend).

**Quarto problema segnalato dall'uso reale, stesso giorno**: un altro test dell'utente ha
mostrato 429 su tutti e tre i servizi insieme (non il solito mix 502/429 del cold start).
Diagnosticato chiamando gli stessi tre servizi direttamente un attimo dopo: tutti hanno risposto
correttamente con dati reali (voli BLQ→FUE, 40 alloggi a Corralejo con coordinate valide) — non un
guasto della ricerca in se', ma un problema di concorrenza quando tre servizi Render si svegliano
insieme dal cold start. Corretto in `services/trip-planner/app/main.py:_fetch`: un retry con 6
secondi di attesa per le sole risposte 429/502/503, non per altri errori. Due test aggiornati
(uno adattato per il retry-poi-fallisce-comunque, uno nuovo per retry-poi-riesce), `asyncio.sleep`
mockato nei test per non introdurre attese reali. 6 test trip-planner, tutti passanti.

## Feature: sito Firebase Hosting dedicato per viaggio (ADR-009) — avviata

Cosa fa: risolve un gap reale segnalato dall'utente, non un'ipotesi: senza un sito Hosting dedicato
per viaggio, `firebase deploy` da qualunque `trips/<nome>/` pubblica sullo stesso URL condiviso del
progetto, sovrascrivendo l'ultimo viaggio pubblicato. Dettaglio completo in ADR-009
(`memory/decisions.md`).

Definition of done:

- [x] `trips/cilento-2026/firebase.json` guadagna `"target": "cilento-2026"`.
- [x] Procedura di creazione di un nuovo viaggio aggiornata (`README.md` sezione 9/11, header di
      `trip.config.js`) con i due comandi CLI in più (`hosting:sites:create`, `target:apply`).
- [x] **Migrazione di `cilento-2026` eseguita**: verificato dal vivo con una richiesta HTTP
      reale, non assunto — `https://holiday-template-cilento-2026.web.app` risponde 200 e serve
      l'app vera (stesso `<title>Travel App</title>` e struttura, non una pagina segnaposto).
- [x] Restrizione referrer HTTP della apiKey allargata su Google Cloud Console: aggiunta
      `https://holiday-template-cilento-2026.web.app/*` (verificato via screenshot). **Il jolly
      non copre questo caso** (scoperto in sessione, non un'ipotesi): un pattern come
      `https://holiday-template-*.web.app/*` viene rifiutato dalla Console con "Dominio sito web
      non valido" — il carattere jolly sostituisce un'intera etichetta di sottodominio, non una
      porzione. Corretto in `design-and-security.md`, `README.md`, header di `trip.config.js`.
- [x] Riga `.firebaseapp.com` aggiunta e confermata via screenshot.
- [x] Referrer del vecchio URL condiviso (`viaggio-new.web.app`/`.firebaseapp.com`) rimossi su
      richiesta esplicita dell'utente, confermato via screenshot: la lista referrer contiene ora
      solo le due righe di `holiday-template-cilento-2026`. Feature ADR-009 chiusa end-to-end:
      configurazione, migrazione, restrizione referrer, tutto verificato dal vivo o via screenshot.

Domande aperte: nessuna residua su questa feature.

## Feature: titolo/badge/tag del viaggio editabili dall'app (TRIP_META non più statico) — avviata

Cosa fa: `TRIP_META` (badge, titolo, sottotitolo, tag/stats dell'hero) non è più solo un valore
statico di `trip.config.js`: un nuovo documento `trips/{TRIP_ID}/state/meta` lo rende editabile
dall'app, sincronizzato in realtime come checklist e note. Pulsante "Modifica" sull'hero apre un
pannello con i campi e un elenco di tag aggiungibili/rimuovibili; "Salva" scrive su Firestore.
`TRIP_META` resta il seed iniziale per un viaggio nuovo e il fallback per un viaggio già seminato
prima che questo documento esistesse (`loadMeta` degrada senza errori, `writeMeta` con `setDoc`
crea il documento al primo salvataggio se assente, self-healing come già fatto per `planning`).

File modificati: `public/index.html` (CSS pannello, `renderHero`/`loadMeta`/`writeMeta`/
`renderMetaEditPanel`/`toggleMetaEdit`/`addMetaStatField`/`removeMetaStatField`/`saveMeta`, seed e
listener realtime di `state/meta`), propagato in `trips/cilento-2026/index.html`.

Definition of done:

- [x] Scritto e syntax-check passato (nessun test automatico esiste per il frontend, per scelta
      di progetto: Vanilla JS senza build step, verificato finora solo manualmente in browser).
- [ ] **Non ancora verificato in un browser reale**: serve un riscontro visivo dell'utente (regola
      `manual-screenshots.md`) prima di considerarlo chiuso — aprire l'hero, premere "Modifica",
      cambiare un tag, salvare, controllare che sia sincronizzato sull'altro dispositivo.
- [ ] Contenuto scritto da un utente reale (non più solo dati scrapati come in "Pianifica" o
      dati dello sviluppatore come il resto della shell): passato per `escHtml` per lo stesso
      principio di sicurezza, ma vale la pena un secondo controllo visivo su caratteri speciali
      (es. un titolo con `&`, `<`, apici).

Domande aperte: se questo pattern (stato editabile su Firestore invece di config statica) regge
bene alla prova, la dashboard costi/splitwise richiesta dall'utente come prossima feature grande
può riusare lo stesso approccio.

**Bug trovato durante il primo test reale, corretto**: il titolo mostrava letteralmente
"Cilento &amp; Caserta" invece di "Cilento & Caserta". Causa: `TRIP_META.title` in
`trip.config.js` era scritto `"Cilento &amp; Caserta"` (pensato per un'epoca in cui il valore
finiva diretto in `innerHTML` senza escaping), e ora che passa per `escHtml` (corretto, il campo è
editabile da un utente reale) l'entity veniva codificata una seconda volta. Corretto il dato
sorgente a `"Cilento & Caserta"` (letterale, semplice). Nessun altro campo di `TRIP_META` aveva lo
stesso problema (controllato con una ricerca di `&amp;`/`&lt;`/`&gt;`/entità simili nel file).

## Feature: dashboard "Costi Reali e Divisione tra Persone" (Splitwise semplificato) — avviata

Cosa fa: nuova sezione dentro la scheda "Info & Costi" (sotto la stima statica preesistente, che
resta invariata) che somma in automatico i voli/alloggi salvati nella scheda "Pianifica"
(`S.planning`, prezzi parsati da stringa) più le spese aggiunte a mano (descrizione, importo,
pagatore opzionale), poi divide il totale per il numero di partecipanti e mostra un saldo per
persona (chi ha pagato più della propria quota "deve ricevere", chi meno "deve dare") — la
logica minima di uno Splitwise, non un clone completo (nessuna gestione di trasferimenti multipli
o valute diverse). Nuovo documento `trips/{TRIP_ID}/state/costs`
(`{participants:[], expenses:[{id,label,amount,paidBy}]}`), stesso pattern di stato editabile su
Firestore già usato per `state/meta`.

File modificati: `public/index.html` (CSS dashboard, `parsePrice`/`computePlanningCosts`/
`renderCostsDashboard`/`addCostParticipant`/`removeCostParticipant`/`addCostExpense`/
`removeCostExpense`, seed e listener realtime di `state/costs`), propagato in
`trips/cilento-2026/index.html`.

Definition of done:

- [x] Scritto e syntax-check passato.
- [ ] **Non ancora verificato in un browser reale** (stessa limitazione delle altre feature di
      questa sessione: nessun test automatico esiste per il frontend). Da provare: aggiungere due
      partecipanti, salvare un volo/alloggio da Pianifica, aggiungere una spesa manuale con
      pagatore, controllare che il totale e i saldi per persona siano corretti a mano.
- [ ] I POI non hanno prezzo (schema `PointOfInterest`) e non entrano nel totale: comportamento
      voluto, non un bug, ma da confermare che sia chiaro all'utente in UI.
- [ ] Nessuna gestione di più valute o di trasferimenti ottimizzati tra persone (Splitwise vero
      calcola il minor numero di transazioni per pareggiare i conti tra più di 2 persone): fuori
      scope per la versione "semplice" richiesta esplicitamente dall'utente.

Domande aperte: se la stima statica preesistente in questa stessa scheda (dati Cilento scritti a
mano direttamente nello shell, non in `trip.config.js`) debba essere spostata a sua volta in
`TRIP_DATA` per coerenza con il principio "la shell non contiene mai dati di un viaggio
specifico" — incoerenza preesistente notata in sessione, non richiesta dall'utente, non toccata.

**Verificata dall'utente in browser (screenshot, due e tre partecipanti)**: calcoli confermati
corretti a mano (totale 4 EUR, 3 persone, quota 1.33 EUR, saldi -0.33/+1.67/-1.33). Su richiesta
dell'utente, la sezione è stata spostata dalla scheda "Info & Costi" a una scheda propria "Costi"
dopo "Pianifica" (nav e pannello `#costi`, `renderCostsDashboard` invariato: scrive sempre in
`#costs-dashboard`, solo la posizione nel DOM è cambiata). Ancora da rifare il riscontro visivo
dopo questo spostamento.

## Riconciliazione

Ultima verifica: 2026-07-08. Ultimo commit reale su `origin/main` al momento di scrivere (da
verificare con `git log`/`git status`, non assumere): il lavoro su cache di `stay-search`,
`poi-search` e ora `trip-planner` potrebbe non essere ancora committato — controllare `git
status` prima di assumere lo stato esatto.
