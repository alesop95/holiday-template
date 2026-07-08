---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - public/**
  - trips/**
  - firestore.rules
  - firebase.json
  - services/flight-search/**
  - services/stay-search/**
  - services/poi-search/**
  - services/trip-planner/**
last-verified-commit: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
---

# Design e sicurezza applicativa

> Popolare leggendo il codice attuale. I diagrammi referenziati vivono in `diagrams/` in
> corrispondenza uno a uno con i componenti descritti (sezione 7).

## Paradigmi di software design

Il frontend separa tre responsabilità in tre luoghi distinti e non sovrapposti: `trip.config.js`
è puro dato (nessuna logica), `index.html` è pura shell (nessun dato di un viaggio specifico
cablato dentro), Firestore è persistenza e canale di sincronizzazione. Il contratto tra shell e
configurazione è l'insieme dei cinque export di `trip.config.js` (`TRIP_ID`, `FIREBASE_CONFIG`,
`TRIP_META`, `MAP_LOCATIONS`, `TRIP_DATA`): finché un nuovo viaggio rispetta questo contratto, la
shell non ha bisogno di sapere nulla del suo contenuto.

La cartella per viaggio (`trips/<nome>/`) è la strategia di multi-tenancy del progetto: invece di
un modello dati multi-tenant dentro un unico deployment (un solo `index.html` che sceglie il
viaggio a runtime), ogni tenant è una copia fisica indipendente su disco, deployabile per conto
propria. Il costo di questa scelta è la duplicazione della shell tra le cartelle; il beneficio è
che un viaggio non può mai rompere il deploy di un altro.

Il backend (`services/flight-search/`) usa l'*adapter pattern*: ogni fonte dati di ricerca voli
implementa l'interfaccia `FlightSourceAdapter` (`app/adapters/base.py`) e normalizza i propri
risultati nello schema comune `FlightOffer` (`app/schemas.py`). L'endpoint `/api/flights/search`
non conosce i dettagli di nessuna fonte specifica, solo il contratto comune; un adapter che
fallisce non blocca gli altri (`app/main.py`). Il valore pratico del pattern si è già visto due
volte: un adapter Amadeus (API REST ufficiale con OAuth2) è stato scritto e poi rimosso di netto
quando è emerso che Amadeus chiude il proprio portale self-service il 17 luglio 2026 (ADR-006,
`memory/decisions.md`), senza dover toccare `FastFlightsAdapter` né il comparatore — è rimasta
la prova che una fonte può sparire senza propagare danni altrove. La fonte che l'ha sostituita,
`KiwiAdapter`, usa una API key semplice invece di OAuth2: anche questa differenza di forma resta
invisibile al comparatore.

`services/stay-search/` replica lo stesso pattern (`StaySourceAdapter`, `StayOffer`) per gli
alloggi, invece di essere fattorizzato in una libreria condivisa tra i servizi backend: sono
mantenuti indipendenti perché potrebbero finire deployati separatamente (dettaglio in
`STACK.md`). Il suo unico adapter oggi, `PyairbnbAdapter`, fa reverse-engineering della GraphQL
interna di Airbnb (nessuna API ufficiale esiste): stesso rischio *ToS* già accettato per uso
privato a basso volume in `roadmap.md`, mitigato allo stesso modo (nessun login con account
personale, sole richieste pubbliche anonime).

`services/poi-search/` replica lo stesso pattern per i punti di interesse (`PoiSourceAdapter`,
`PointOfInterest`). Nessun rischio ToS qui: Overpass API espone dati OpenStreetMap
esplicitamente pubblici, senza reverse-engineering di endpoint privati.

`services/trip-planner/` non ha adapter propri: orchestra gli altri tre via chiamate HTTP dirette
(non passa dall'adapter pattern, perché non normalizza nulla). È il primo punto del backend in
cui un servizio dipende dalla raggiungibilità di rete di altri servizi, non solo di API esterne —
rilevante per qualunque decisione futura di hosting (se un servizio finisse dietro autenticazione
o su una rete privata, `trip-planner` andrebbe configurato di conseguenza tramite le variabili
d'ambiente `FLIGHT_SEARCH_URL`/`STAY_SEARCH_URL`/`POI_SEARCH_URL`).

Nessun segreto o dato personale coinvolto in nessuno dei quattro servizi backend: nessuno
richiede login, nessuno gestisce dati dell'utente oltre i parametri della singola ricerca, non
persistiti da nessuna parte (la cache in-memory di ogni servizio si svuota al riavvio del
processo). Nessuno dei quattro scrive su Firestore: il collegamento tra un risultato di ricerca e
un giorno dell'itinerario è responsabilità della shell frontend, non del backend (ADR-007,
`memory/decisions.md`) — la scelta che ha permesso di costruire questo pezzo di funzionalità senza
introdurre una service account key per il Firebase Admin SDK, una credenziale reale che avrebbe
richiesto un passo manuale su Google Cloud Console.

## Sicurezza applicativa

**Autenticazione e autorizzazione**: non esiste alcun livello di autenticazione utente. La
sicurezza dell'applicazione si fonda sull'oscurità dell'URL di Firebase Hosting (non indicizzato,
non distribuito pubblicamente) più le *Firestore Security Rules* dichiarate in `firestore.rules`
(radice del repository), non sulla segretezza di `FIREBASE_CONFIG.apiKey` — quella è visibile nel
sorgente JavaScript lato client e non è un segreto nel senso tradizionale (dettaglio in
`README.md`, sezione 12).

**Restrizioni sulla chiave Firebase**: la `apiKey` è comunque limitata su Google Cloud Console
(progetto `viaggio-new` > API e servizi > Credenziali > "Browser key (auto created by Firebase)"),
non per segretezza ma per contenere il vero rischio di una chiave Google esposta: l'abuso su altre
API dello stesso progetto Cloud. Restrizioni applicate: referrer HTTP limitati a
`viaggio-new.web.app` e `viaggio-new.firebaseapp.com`, e API accessibili ristrette a quattro
(Cloud Firestore API, Identity Toolkit API, Token Service API, Firebase Installations API) invece

**Conseguenza di ADR-009, eseguita per `cilento-2026`**: da quando ogni viaggio pubblica su un
proprio sito Hosting dedicato (`https://holiday-template-<nome-viaggio>.web.app`, non più l'unico
`viaggio-new.web.app`), i referrer HTTP sopra vanno allargati per ogni nuovo sito, altrimenti la
Firebase init fallisce per referrer non consentito. **Il jolly non copre questo caso**: provato in
sessione un pattern tipo `https://holiday-template-*.web.app/*`, rifiutato dalla Console con
"Dominio sito web non valido" — il carattere jolly di Google sostituisce un'intera etichetta di
sottodominio (`https://*.example.com`), non una porzione di un'etichetta come nel prefisso
`holiday-template-<nome>`. Non esiste quindi una scorciatoia: **ogni nuovo viaggio richiede due
righe nuove in questo elenco** (`https://holiday-template-<nome-viaggio>.web.app/*` e
l'equivalente `.firebaseapp.com/*`), un piccolo passo manuale in più nella procedura di creazione
di un nuovo viaggio (`README.md` sezione 9), accettato esplicitamente dall'utente come non
gravoso. Fatto per `cilento-2026` in questa sessione.
delle venticinque abilitate di default sul progetto. Contesto e incidente che ha portato a questa
scelta in ADR-005 (`memory/decisions.md`).

**Regole Firestore permanenti, non a scadenza**: `firestore.rules` è distribuito con
`firebase deploy --only firestore:rules` da un `firebase.json` di radice dedicato a questo scopo
(distinto dai `firebase.json` di hosting dentro ogni `trips/<nome>/`, che riguardano solo la
consegna dei file statici). Questo evita il timer di scadenza a 30 giorni della modalità di test
generata dalla Firebase Console: quel timer è una condizione (`request.time < ...`) che la
Console inserisce automaticamente nel testo della regola quando la si genera dall'interfaccia
grafica, non una proprietà del sistema. Una regola distribuita via CLI, come questa, non ha quella
condizione e resta valida finché non viene esplicitamente cambiata.

**Superficie di accesso ai dati**: `allow read, write: if true` in `firestore.rules` copre
l'intero albero Firestore, cioè tutti i viaggi sotto `trips/**` (conseguenza di ADR-003, un solo
progetto Firebase condiviso). Chiunque conosca l'URL pubblico dell'app può leggere e scrivere i
dati di qualunque viaggio, passato o futuro, non solo di quello in corso. Per il caso d'uso
(due persone, URL non distribuito) il rischio è accettato deliberatamente; un irrigidimento
futuro (Firebase Authentication con vincolo ad account Google specifici) richiederebbe aggiungere
l'SDK di autenticazione e una logica di login, oggi assente. Il nuovo documento
`trips/{TRIP_ID}/state/planning` (risultati di ricerca salvati su un giorno, scheda "Pianifica")
ricade sotto la stessa regola permissiva, senza bisogno di una regola dedicata: non introduce una
superficie di rischio diversa da quella già accettata per checklist e note.

**CORS dei quattro servizi backend**: `CORSMiddleware` con `allow_origins=["*"]` su tutti e
quattro (`flight-search`, `stay-search`, `poi-search`, `trip-planner`), aggiunto per permettere
alla scheda "Pianifica" della shell di chiamarli da browser. Un'origine aperta sarebbe un problema
se questi servizi gestissero cookie di sessione, autenticazione o dati sensibili: non è questo il
caso (vedi sopra), quindi l'apertura totale non amplia il rischio reale. Se in futuro uno di
questi servizi guadagnasse autenticazione o stato per-utente, questa impostazione andrebbe
ristretta a un'origine esplicita nello stesso momento.

**Gestione dei segreti**: nessun segreto oggi nel frontend (l'unico valore sensibile,
`FIREBASE_CONFIG.apiKey`, non è trattato come segreto per le ragioni sopra). Il backend
`services/flight-search/` prevede invece segreti reali nella Fase 1 successiva (chiavi Amadeus e
Kiwi Tequila): `services/flight-search/.env.example` documenta le variabili attese, mentre un
eventuale `.env` reale è escluso da Git (`*.env` in `.gitignore`, con eccezione esplicita per
`.env.example`). L'adapter `fast_flights` oggi attivo non richiede alcuna chiave.

**Validazione input**: lato frontend non c'è validazione oltre il controllo del placeholder
`REPLACE_ME` su `apiKey` prima di inizializzare Firebase (sezione 4.2 di `README.md`). Lato
backend, `FlightSearchRequest` (`app/schemas.py`) è un modello Pydantic che vincola formato e
lunghezza dei codici IATA e il range del numero di adulti: è l'unico punto di validazione
dell'input utente oggi presente nel progetto.

## Diagrammi

Nessun diagramma ancora migrato in questa cartella: i diagrammi Mermaid esistenti (modello
architetturale, flusso applicativo, sequenza di sincronizzazione realtime) vivono ancora inline
in `README.md`, sezioni 2, 7 e 8. La migrazione a file `.mmd`/`.svg` separati in `diagrams/` resta
un item aperto della feature di integrazione in `current-work.md`.
