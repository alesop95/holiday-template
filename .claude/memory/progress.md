# Work-log

> Append-only, in ordine cronologico inverso (la voce più recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento.

## 2026-07-08 — Migrazione di cilento-2026 al sito Hosting dedicato eseguita, corretto un errore sul jolly dei referrer

Commit: non ancora committato (solo documentazione: la migrazione stessa è avvenuta lato Firebase/
Google Cloud Console, non nel repository).
File toccati: `README.md` (sezione 9, aggiunta "Quarta operazione" sul referrer, corretta
l'affermazione sbagliata sul jolly), `.claude/context/design-and-security.md`,
`.claude/context/current-work.md`, `.claude/memory/decisions.md` (ADR-009), header di
`trip.config.js`.
Motivo: guidato l'utente a micro-step su Google Cloud Console (stesso metodo di sessioni
precedenti) per allargare la restrizione referrer della apiKey, prerequisito della migrazione
hosting decisa in ADR-009. Un mio suggerimento iniziale era sbagliato: avevo indicato un pattern
con jolly (`https://holiday-template-*.web.app/*`) per coprire tutti i viaggi futuri con una sola
riga, ma la Console lo ha rifiutato con "Dominio sito web non valido" — il carattere jolly di
Google sostituisce un'intera etichetta di sottodominio (`https://*.example.com`), non una porzione
di un'etichetta come nel prefisso `holiday-template-<nome>`. Corretto immediatamente: ogni nuovo
viaggio richiede due righe manuali specifiche (dominio esatto `.web.app` e `.firebaseapp.com`),
non una regola unica — l'utente ha confermato che il costo operativo per viaggio è accettabile.
Verificato dal vivo con una richiesta HTTP reale, non assunto dallo screenshot dell'utente, che
`https://holiday-template-cilento-2026.web.app` risponde 200 e serve l'app vera: la migrazione al
sito dedicato (comandi CLI `hosting:sites:create`/`target:apply`/`deploy`) è quindi già avvenuta,
presumibilmente nello stesso arco di tempo in cui si sistemava il referrer.
Non ancora fatto: aggiungere la riga referrer `.firebaseapp.com` mancante (segnalata all'utente,
in attesa di conferma); decidere se rimuovere le due righe referrer del vecchio URL condiviso
`viaggio-new.web.app`/`.firebaseapp.com`, ormai non più usato da nessun viaggio.

## 2026-07-08 — Titolo/badge/tag del viaggio editabili dall'app: TRIP_META passa da statico a Firestore

Commit: non ancora committato.
File toccati: `public/index.html` (propagato in `trips/cilento-2026/index.html`): nuovo documento
`state/meta`, pulsante "Modifica" sull'hero, pannello di modifica con bozza locale separata da
`S.meta` (per non perdere una modifica in corso se arriva un aggiornamento realtime dall'altro
dispositivo mentre si sta editando).
Motivo: primo dei sei punti di un messaggio con molte richieste dell'utente, scelto per primo su
sua indicazione esplicita perché fa da base architetturale per la prossima (dashboard costi):
stesso pattern, stato editabile su Firestore invece di valore statico in `trip.config.js`.
Non ancora fatto: riscontro visivo dell'utente in browser (nessun test automatico esiste per il
frontend, per scelta di progetto).

## 2026-07-08 — Un sito Firebase Hosting dedicato per viaggio (ADR-009): risolto un rischio reale di sovrascrittura

Commit: non ancora committato.
File toccati: `trips/cilento-2026/firebase.json` (aggiunta chiave `"target": "cilento-2026"`),
`trips/cilento-2026/trip.config.js` (istruzioni "per un nuovo viaggio" aggiornate con i due comandi
CLI in più), `README.md` (sezioni 9 e 11 riscritte), `deployment.md`, `design-and-security.md`
(conseguenza sulla restrizione referrer dell'apiKey), `memory/decisions.md` (nuovo ADR-009).
Motivo: l'utente ha chiesto conto della strategia multi-hosting prima di aprire un secondo viaggio
(Tokyo), notando di accedere sempre allo stesso URL `viaggio-new.web.app` per Cilento. Verificato
leggendo `firebase.json`/`.firebaserc` reali (nessuna chiave `"target"`/`"targets"` mai esistita) e
`README.md` sezione 11, che documentava esplicitamente il comportamento condiviso: confermato un
gap architetturale reale, non un'ipotesi, mai affrontato da ADR-002/003 (quelle avevano risolto
solo l'isolamento di dati e codice, non di Hosting). Risolto con il *multi-site Hosting* di
Firebase (un sito dedicato per viaggio nello stesso progetto condiviso, niente nuovo progetto
Firebase), verificato contro la documentazione ufficiale prima di scrivere `firebase.json`. Site-id
con prefisso `holiday-template-` invece del solo nome viaggio, per ridurre il rischio di collisione
nel namespace globale dei site-id Firebase (rischio già concretizzato una volta su Render con
`flight-search`).
Conseguenza scoperta e documentata, non ancora applicata: la restrizione referrer HTTP della
apiKey (ADR-005) copre solo `viaggio-new.web.app`, non i futuri domini `holiday-template-*.web.app`
dei siti dedicati — va allargata con un pattern wildcard su Google Cloud Console prima o insieme
alla migrazione, altrimenti Firebase rifiuterebbe l'inizializzazione sui nuovi siti.
Non ancora fatto: i comandi `firebase hosting:sites:create`/`firebase target:apply` per migrare
`cilento-2026` al proprio sito dedicato (passo manuale, muta il progetto Firebase live) e
l'allargamento della restrizione referrer su Google Cloud Console.

## 2026-07-08 — Link "prenota su Airbnb" mancante negli alloggi, escaping HTML aggiunto ai dati esterni scrapati

Commit: non ancora committato.
File toccati: `public/index.html` (propagato in `trips/cilento-2026/index.html`): nuova funzione
`escHtml`, link `<a>` verso `StayOffer.url` nelle card di ricerca e negli elementi salvati.
Motivo: l'utente ha verificato la correzione precedente su Render con screenshot reali (confermata
funzionante: aeroporti opzionali, etichetta "Aggiungi al giorno" chiara) e ha chiesto dove vedere
gli alloggi da prenotare su Airbnb/Booking — il campo `url` di `StayOffer` esisteva già nella
risposta del backend ma non veniva mai renderizzato in nessuna card, un'omissione, non un bug di
rete. Approfittando dell'intervento sulla stessa funzione di rendering, aggiunto anche l'escaping
HTML dei campi dinamici (nome annuncio, compagnia aerea, categoria POI, ecc.): a differenza del
resto della shell, che renderizza solo dati scritti dallo sviluppatore in `trip.config.js`, questa
scheda inserisce in `innerHTML` dati di fonti esterne scrapate (Airbnb, Google Flights,
OpenStreetMap) senza alcun controllo — un gap di sicurezza notato durante l'intervento, non
segnalato dall'utente, corretto per lo stesso principio di "se noti codice insicuro, sistemalo
subito". Nessuna fonte Booking.com esiste in questo progetto (ricerca chiusa in sessioni
precedenti, vedi `roadmap.md`): il link aggiunto è esplicitamente etichettato "su Airbnb", non
generico, per non promettere una fonte che non c'è.

## 2026-07-08 — Aeroporti opzionali in trip-planner: la scheda "Pianifica" non deve richiedere un volo per viaggi in auto

Commit: non ancora committato.
File toccati: `services/trip-planner/app/schemas.py` (`origin_airport`/`destination_airport` da
obbligatori a `Optional[str]`), `services/trip-planner/app/main.py` (`build_trip_plan` chiama
`flight-search` solo se entrambi i campi sono presenti), `services/trip-planner/tests/test_main.py`
(nuovo test, 47 totali), `services/trip-planner/README.md`, `public/index.html` (propagato in
`trips/cilento-2026/index.html`: campi aeroporto etichettati "opzionale", validazione che li
richiede entrambi solo se ne è compilato uno, payload che li omette del tutto se assenti, e
un'etichetta "Aggiungi al giorno" accanto al menu a tendina dei risultati, prima senza spiegazione).
Motivo: primo uso reale della scheda da parte dell'utente su Render, dopo il fix dei timeout.
Segnalati due problemi: prezzi "stellari" per un volo FCO→NRT (in realtà corretti: NRT è Tokyo
Narita, un volo intercontinentale, non un errore) e soprattutto l'osservazione che il form
richiedeva sempre un volo anche per un viaggio come Cilento, esplicitamente in auto — un errore di
concezione del form, non un bug di rete. Corretto rendendo gli aeroporti opzionali end-to-end
(schema, orchestrazione, form), coerente con l'obiettivo dichiarato in `roadmap.md` di servire
anche itinerari di sola terra, non solo viaggi in aereo.
Non ancora fatto: il push di questa correzione, il redeploy automatico su Render che ne consegue,
e il test visivo in browser della scheda "Pianifica" (in attesa anche del `firebase deploy` del
punto precedente).

## 2026-07-08 — Deploy reale su Render dei quattro servizi, bug di timeout scoperto e corretto dal primo test end-to-end

Commit: non ancora committato.
File toccati: `services/trip-planner/app/main.py` (timeout `_fetch` da 30 a 90 secondi),
`services/poi-search/app/adapters/overpass_adapter.py` (timeout httpx da 30 a 60 secondi, timeout
della query Overpass QL da 25 a 50 secondi). Aggiornati `deployment.md`, `current-work.md`,
`memory/decisions.md` (ADR-008 passata da "proposta" ad "accettata ed eseguita").
Motivo: eseguiti insieme all'utente, a micro-step con screenshot (stesso metodo già usato per
Firebase/Google Cloud/Kiwi), tutti i passi manuali di attivazione descritti come pendenti nella
voce precedente. Workspace Render dedicato `holiday-template` creato (separato da un workspace
preesistente `wedding-backend` di un altro progetto sulla stessa macchina, verificato vuoto prima
di lasciarlo intatto, non cancellato: Render impedisce comunque di cancellare l'unico workspace di
un account). Blueprint `holiday-template-backend` collegato al repository, deploy riuscito per
tutti e quattro i servizi (verificato dallo stato "Deployed" e da un `curl` reale a `/health` di
ciascuno). URL pubblici ottenuti e impostati manualmente nelle variabili d'ambiente di
`trip-planner` come previsto da `render.yaml` (`sync: false`, nessun valore inventato in anticipo).
Un primo test end-to-end reale contro `/api/trip-plan` su Render (non più in locale) ha rivelato un
problema non visibile dai 46 test `pytest` esistenti (che mockano tutta la rete): risposta 200 ma
con tre errori a valle (502 da `flight-search`, 502 da `poi-search`, 429 da `stay-search`).
Diagnosticato chiamando i tre servizi direttamente con `curl`: rispondono correttamente e con dati
reali, ma un cold start del piano free (~50s) più lo scraping reale portano una singola ricerca a
32-56 secondi su Render, sopra il timeout fisso di 30 secondi usato sia da `trip-planner` verso i
tre servizi a valle sia da `poi-search` verso Overpass (quest'ultimo spiegava anche perché la
ricerca POI tornava una lista vuota invece di un errore esplicito, invece di essere un problema di
zero risultati reali). Corretto alzando entrambi i timeout con un margine più ampio. 46 test
rieseguiti dopo la modifica: nessuna regressione.
Segnalato di passaggio, non correlato al progetto: due screenshot dell'utente durante la sessione
mostravano per errore pagine Trello/Jira invece di Render (workspace/finestra sbagliata), una delle
quali con una API key e un secret reali di un Power-Up Trello visibili in chiaro — segnalato
all'utente come nota di igiene delle credenziali, non usato né salvato in questo progetto.
Non ancora fatto: un nuovo test end-to-end su Render dopo la correzione dei timeout; l'aggiornamento
di `TRIP_PLANNER_URL` in `trips/cilento-2026/trip.config.js` dall'attuale `http://localhost:8004`
all'URL pubblico Render di `trip-planner`, e il relativo `firebase deploy`; il test visivo in
browser della scheda "Pianifica" (bloccato finché `TRIP_PLANNER_URL` non punta a Render).

## 2026-07-08 — Primo test in browser della scheda "Pianifica": diagnosi mixed content, decisa Render come hosting (ADR-008)

Commit: non ancora committato.
File toccati: nuovo `render.yaml` (radice, Render Blueprint per i quattro servizi). Aggiornati
`deployment.md` (nuova sezione "Backend su Render"), `roadmap.md` (domanda di hosting risolta in
decisione), `current-work.md` (DoD di hosting nei quattro servizi, diagnosi dell'errore nella
feature "Pianifica"), `dev-testing.md`, `memory/decisions.md` (nuovo ADR-008),
`services/{flight-search,stay-search,poi-search,trip-planner}/README.md` (sezione "Cosa manca":
hosting deciso, e corrette due affermazioni ormai false su cache assente in flight-search e
stay-search, notate di passaggio mentre si editava la stessa riga).
Motivo: l'utente ha fatto il primo test reale in browser della scheda "Pianifica" descritta nella
voce precedente (deploy su `viaggio-new.web.app`, quattro servizi backend attivi in locale) e ha
mandato due screenshot con l'errore `Failed to fetch` verso `http://localhost:8004`. Letti gli
screenshot dalla cartella Screenpresso (`manual-screenshots.md`): confermato che è un blocco di
*mixed content* del browser (pagina HTTPS che chiama un'origine HTTP in chiaro), non un problema
di CORS (verificato separatamente con una preflight reale, funzionante) né di servizi spenti
(rispondevano a `curl` nello stesso momento del test). Uno screenshot allegato (`screenshot_03.png`)
non era pertinente a questo progetto (uno schema di rete switch/VLAN): segnalato all'utente e
ignorato.
Nello stesso messaggio l'utente ha chiesto dove ospitare il backend una volta che l'app deve
essere raggiungibile da fuori, per ogni viaggio futuro, citando un proprio account Render già
collegato a GitHub. Deciso Render (ADR-008): risolve il blocco di mixed content alla radice
(backend e frontend finiscono entrambi su HTTPS) ed era già la scelta di fallback della ricerca
originale in `roadmap.md`. Verificati contro la documentazione ufficiale Render (non a memoria,
via `WebFetch` su render.com/docs), prima di scrivere `render.yaml`: la variabile d'ambiente
`PORT` che Render assegna automaticamente (default 10000, bind su `0.0.0.0`), il campo `rootDir`
per servizi in una sotto-cartella di un monorepo, e il valore `plan: free`. Lasciati
esplicitamente non compilati nel Blueprint (`sync: false`) i tre URL a valle di `trip-planner`
e la chiave Kiwi, perché la sintassi Blueprint per comporre automaticamente un URL pubblico
HTTPS da un riferimento `fromService` non è stata verificata con sufficiente certezza da poterla
scrivere senza rischio di un valore inventato — vanno incollati a mano dopo il primo deploy.
Non ancora eseguito: la creazione effettiva dei quattro servizi su Render (passo manuale,
deliberatamente rimandato secondo l'istruzione dell'utente di completare prima tutto il codice
possibile). Il test visivo della scheda "Pianifica" resta bloccato fino a quel deploy.

## 2026-07-08 — Scheda "Pianifica": collega il comparatore all'itinerario dal frontend, CORS sui quattro servizi

Commit: non ancora committato (HEAD al momento di scrivere: acebe30d, che include già il
trip-planner della voce sotto — confermato allineato a `origin/main` via `git fetch` prima di
iniziare, non assunto dall'utente).
File toccati: `public/index.html` (nav, pannello "Pianifica", CSS, stato `S.planning`/
`S.planResults`, `renderPlanResults`/`renderPlanSaved`, `searchPlan`/`savePlanItem`/
`removePlanItem`, seed e listener realtime di `state/planning`), propagato byte-per-byte in
`trips/cilento-2026/index.html`; `trips/cilento-2026/trip.config.js` (nuovo export
`TRIP_PLANNER_URL`); `services/{flight-search,stay-search,poi-search,trip-planner}/app/main.py`
(`CORSMiddleware`, `allow_origins=["*"]`). Aggiornati `roadmap.md`, `current-work.md`, `STACK.md`,
`design-and-security.md`, `dev-testing.md`, `memory/decisions.md` (nuovo ADR-007).
Motivo: proseguendo lo sviluppo di puro codice su richiesta esplicita, chiuso il pezzo di data
model Trip → Days → Places che era stato segnalato come il prossimo passo naturale ma inizialmente
scartato perché sembrava richiedere Firestore Admin SDK lato backend (un passo a credenziali). La
soluzione trovata evita quella credenziale: il salvataggio di un risultato di ricerca su un giorno
passa dall'SDK Firebase client già inizializzato nella shell, non dal backend (ADR-007) — i
quattro servizi restano stateless e senza segreti come prima.
Verificato dal vivo: i quattro servizi avviati con `uvicorn` reale (porte 8001-8004, fermati alla
fine); preflight CORS reale con un'origine finta da browser conferma
`access-control-allow-origin: *`; una richiesta reale a `/api/trip-plan` con lo stesso payload che
manda il nuovo form (FCO→NAP, Marina di Camerota, 2026-08-10/14) ha restituito 4 voli/2 alloggi/4
POI reali, con una forma confrontata campo per campo contro quella letta da `renderPlanResults`
(non assunta). I 46 test esistenti dei quattro servizi rieseguiti dopo l'aggiunta di CORS: tutti
ancora passanti, nessuna regressione.
Non verificato: il flusso di salvataggio/rimozione su Firestore (`writePlanDay`, `renderPlanSaved`)
non è mai stato aperto in un browser reale — richiede un riscontro visivo dell'utente (regola
`manual-screenshots.md`), segnalato come voce aperta in `current-work.md`.

## 2026-07-08 — Nuovo servizio trip-planner: comparatore unico voli+alloggi+POI (Fase 3 chiusa)

Commit: non ancora committato.
File toccati: nuovo `services/trip-planner/` completo: `app/{main,schemas}.py`, `tests/test_main.py`
(4 test), `requirements.txt`, `requirements-test.txt`, `.env.example`, `README.md`. Aggiornati
`roadmap.md`, `current-work.md`, `STACK.md`, `design-and-security.md`, `dev-testing.md`.
Motivo: su richiesta di continuare lo sviluppo, chiuso il pezzo mancante della Fase 3 (layer
comparatore): un endpoint unico che combina i tre servizi di ricerca già costruiti. A differenza
degli altri tre servizi, questo non ha adapter propri: orchestra via HTTP con
`httpx.AsyncClient` dentro `asyncio.gather` (scelto asyncio nativo invece del `ThreadPoolExecutor`
di flight-search, perché qui il lavoro è I/O puro verso altri servizi, non librerie sincrone
bloccanti). Nella prima stesura del codice, individuato e corretto un bug proprio prima ancora di
testarlo: le tre chiamate erano scritte come `await` in sequenza dentro una list comprehension,
non concorrenti — corretto con `asyncio.gather`.
Verificato con il livello di rigore più alto finora: avviati tutti e quattro i servizi con
`uvicorn` reale su porte separate (8001-8004, ripulendo anche un processo orfano rimasto attivo
da un test di sessioni precedenti su una di quelle porte), poi una vera richiesta HTTP end-to-end
per FCO→CDG/Parigi: 7 voli, 40 alloggi, 4 POI reali, zero errori. Verificata anche la tolleranza
ai guasti fermando `poi-search` a metà: la risposta è tornata 200 con voli e alloggi intatti e un
errore specifico, non un fallimento totale — esattamente il comportamento progettato.
Suite di test scritta con lo stesso principio delle precedenti, con una tecnica nuova per questo
servizio (nessun adapter da mockare): sostituito `httpx.AsyncClient` con una classe finta che
implementa lo stesso protocollo async context manager. 4 test, tutti passanti. Totale test nel
repository dopo questa sessione: 46 (21+11+10+4).
Verifica residua: nessuna stima di costo totale che sommi un volo + un alloggio scelti (oggi
liste separate); la domanda di hosting, comune agli altri tre servizi, ora ha una complicazione
in più (`trip-planner` dipende dalla raggiungibilità reciproca degli altri tre).

## 2026-07-07 — Cache per stay-search, ricerca fonte alloggi chiusa, nuovo servizio poi-search

Commit: non ancora committato.
File toccati: nuovo `services/stay-search/app/cache.py` e modifiche a `app/main.py`/`tests/test_main.py`
per usarlo. Nuovo servizio `services/poi-search/` completo: `app/{main,schemas,cache,geocoding}.py`,
`app/adapters/{base,overpass_adapter}.py`, `tests/` (3 file, 10 test), `requirements.txt`,
`requirements-test.txt`, `README.md`. Aggiornati `roadmap.md`, `current-work.md`, `STACK.md`,
`design-and-security.md`, `dev-testing.md`.
Motivo: su richiesta esplicita dell'utente di continuare lo sviluppo e "migliorare fino in
fondo" prima di tornare ai passi manuali. Aggiunta la cache mancante a `stay-search` (TTL 600s,
più lungo di flight-search perché la disponibilità alloggi cambia più lentamente); nel farlo,
sistemato un problema di isolamento nei test esistenti (stessa chiave di richiesta condivisa tra
due test, che con la cache avrebbe fatto leakage di risultati da un test all'altro). Cercata
esplicitamente una seconda fonte alloggi (Booking.com): nessuna libreria HTTP-diretta keyless
trovata, solo scraper community basati su browser headless — conclusione documentata come
ricerca chiusa, non domanda dimenticata.
Avviata la Fase 4 (itinerary builder) con `services/poi-search/`: adapter verso Overpass API
(OpenStreetMap), nessuna chiave, scelta esplicitamente al posto di OpenTripMap (che ne
richiederebbe una) per lo stesso tipo di dato. Verificato con query dirette da riga di comando
prima di scrivere codice, poi con una ricerca live via `TestClient` per "Marina di Camerota": 7
POI reali, alcuni già presenti nell'itinerario scritto a mano di Cilento (Grotta Azzurra), buon
segnale indipendente di qualità dei dati. Scoperti in sessione e gestiti: il server richiede un
header `User-Agent` esplicito (altrimenti 406), e molti elementi (specialmente `historic`) non
hanno un tag `name` e vanno scartati.
Suite di test scritta con lo stesso principio delle precedenti (payload dalla forma reale
verificata, nessuna chiamata di rete nei test): 10 nuovi test per poi-search, tutti passanti.
Totale test nel repository dopo questa sessione: 42 (21+11+10), eseguiti tutti insieme come
verifica finale.
Verifica residua: il data model che collega i POI trovati a un itinerario vero (Trip → Days →
Places) non è stato progettato; resta la domanda di hosting, comune a tutti e tre i servizi
backend, ancora non decisa.

## 2026-07-07 — Suite di test per entrambi i servizi backend, dev-testing.md popolata

Commit: non ancora committato.
File toccati: nuovi `services/flight-search/tests/` (4 file, 21 test), `services/stay-search/tests/`
(3 file, 10 test), `requirements-test.txt` in entrambi i servizi. `.claude/context/dev-testing.md`
popolata da scaffold vuoto (era l'unica scheda ancora completamente da scrivere). Aggiornato
`current-work.md`.
Motivo: dopo aver rifinito flight-search e avviato stay-search, colmato un vuoto segnalato più
volte in questa sessione (`dev-testing.md` sempre "nessun test nel repository"). Suite scritta
con lo stesso principio di onestà tenuto per il codice applicativo: i payload usati nei test
riproducono le forme di risposta reali verificate durante lo sviluppo (Kiwi, pyairbnb con e senza
sconto), non forme inventate; nessuna chiamata di rete reale nei test (tutto mockato via
`monkeypatch`), per tenere la suite veloce e deterministica. Eseguiti entrambi: 31 test totali,
tutti passanti, in meno di un secondo complessivo.
Verifica residua: nessuna — è la prima parte di questa sessione senza una domanda aperta di
verifica lasciata in sospeso.

## 2026-07-07 — Comparatore voli rifinito (parallelo, cache, ordinamento) + avvio stay-search

Commit: non ancora committato.
File toccati: `services/flight-search/app/main.py` (query in parallelo via `ThreadPoolExecutor`,
ordinamento per prezzo), nuovo `services/flight-search/app/cache.py` (`TTLCache` in-memory, 300s).
Nuovo servizio `services/stay-search/` completo: `app/main.py`, `app/schemas.py`,
`app/geocoding.py`, `app/adapters/{base,pyairbnb_adapter}.py`, `requirements.txt`, `README.md`.
Aggiornati `roadmap.md`, `current-work.md`, `STACK.md`, `design-and-security.md`.
Motivo: su richiesta esplicita dell'utente di continuare a sviluppare codice applicativo mentre
i passi manuali (registrazione Kiwi) restano in sospeso per essere fatti tutti insieme più tardi.
Rifinita la Fase 1 (voli): verificato con una ricerca reale che il parallelismo funziona (prima
chiamata ~1.3s, seconda identica servita dalla cache in ~0.0s) e che l'ordinamento per prezzo è
corretto. Avviata la Fase 2 (alloggi) con lo stesso adapter pattern: prima fonte `pyairbnb`
(Airbnb, nessuna chiave), con geocodifica del nome località via Nominatim (gratuita, bounding box
preso direttamente dalla risposta invece di calcolato a mano). Verificato con una ricerca live
reale ("Marina di Camerota", 15-20 settembre 2026): 40 alloggi reali. Nel farlo, scoperti e
aggirati due bug reali della libreria `pyairbnb` 2.2.1 non documentati altrove: le funzioni
pubbliche di ricerca (`search_first_page`/`search_all`) passano internamente una chiave di primo
livello inesistente alla funzione di normalizzazione (bypassato chiamando le funzioni interne
`api.get`/`search.get`/`standardize.from_search` direttamente) e il campo `price.total` è sempre
0 (il prezzo reale è nell'ultimo elemento di `price.break_down`, verificato su esempi reali con e
senza sconto).
Verifica residua: nessuna seconda fonte alloggi individuata (Amadeus Hotel condivide la chiusura
del portale, Booking.com resta partner-only) — nuova domanda aperta in `current-work.md` e
`roadmap.md`. Nessuna cache per `stay-search` (pattern riusabile già scritto per flight-search).

## 2026-07-07 — Amadeus abbandonato (portale in chiusura), sostituito da adapter Kiwi Tequila

Commit: non ancora committato.
File toccati: rimosso `services/flight-search/app/adapters/amadeus_adapter.py`; nuovo
`services/flight-search/app/adapters/kiwi_adapter.py`; `app/main.py` (tolto il collegamento ad
Amadeus, aggiunto Kiwi); `.env.example` (tolti i placeholder Amadeus); `roadmap.md`,
`current-work.md`, `design-and-security.md`, README del servizio, `decisions.md` (ADR-006)
aggiornati per riflettere il cambio.
Motivo: mentre l'utente procedeva alla registrazione su Amadeus for Developers per ottenere
credenziali reali, ha trovato sul sito stesso un avviso di chiusura del portale self-service al
17 luglio 2026. Verificato con fonti indipendenti (PhocusWire, Tragento) prima di agire, non
fidandosi del solo annuncio. Deciso di abbandonare Amadeus del tutto invece di procedere con una
registrazione che avrebbe smesso di funzionare in pochi giorni. Il pattern adapter ha reso la
sostituzione priva di conseguenze per le altre parti del servizio. Verificata l'API reale di
Kiwi Tequila prima di scrivere il nuovo adapter: base URL e header di autenticazione (`apikey`)
confermati con una richiesta HTTP diretta non autenticata (risposta 403 esplicita), ma i nomi dei
campi della risposta sono ricostruiti da fonti di terzi incrociate, non da un esempio ufficiale
come era stato possibile fare per Amadeus — verifica più debole, dichiarata esplicitamente nel
README del servizio. Verificato che l'endpoint degrada correttamente anche senza chiave Kiwi
configurata (stesso comportamento già validato per Amadeus).
Verifica residua: la Fase 2 della roadmap (alloggi) perde la propria fonte primaria pianificata
insieme ad Amadeus, senza sostituto individuato — nuova domanda aperta, non affrontata in questa
sessione. Ricerca live con una chiave Kiwi reale ancora da fare.

## 2026-07-07 — Adapter Amadeus Flight Offers Search, seconda fonte del comparatore voli

Commit: non ancora committato.
File toccati: `services/flight-search/app/adapters/amadeus_adapter.py` (nuovo), `app/main.py`
(collegato il nuovo adapter, aggiunto `load_dotenv()`), `requirements.txt` (`httpx`,
`python-dotenv` promossi da dipendenza indiretta/di test a dipendenza diretta),
`requirements-dev.txt` (rimosso, ridondante ora che `httpx` è in `requirements.txt`), README del
servizio, `current-work.md`, `design-and-security.md`.
Motivo: continuare la Fase 1 della roadmap con la seconda fonte voli pianificata (API ufficiale,
a differenza di `fast_flights` che fa scraping). Verificata la forma reale della risposta
dell'API (endpoint OAuth2, struttura `itineraries`/`segments`/`price.grandTotal`, durate in
ISO 8601) leggendo un esempio di risposta ufficiale dal repository
`amadeus4dev/amadeus-code-examples`, non da una sintesi di terzi. La logica di parsing è stata
testata alimentandola direttamente con quel file di esempio (risultato corretto: compagnia
risolta dal dizionario, durata e prezzo formattati bene). Non è stato possibile eseguire una
ricerca live contro l'API reale, perché richiede credenziali (`AMADEUS_CLIENT_ID`/`SECRET`) che
l'utente non ha ancora generato: differenza esplicita rispetto a `fast_flights`, verificato live
nella sessione precedente. Verificato che l'endpoint `/api/flights/search` degrada correttamente
quando le credenziali Amadeus mancano (l'adapter si disattiva restituendo lista vuota, l'altra
fonte continua a funzionare, status 200).
Verifica residua: ricerca live con credenziali reali, non appena l'utente le genera su
developers.amadeus.com.

## 2026-07-07 — Incidente apiKey esposta: restrizione Cloud Console + bonifica storia Git

Commit: `6ffbe1a64d861066b4f5847fccf2a7d4714eae77` (forzato su `origin/main`, verificato con fetch
indipendente, non dal solo output incollato dall'utente).
File toccati: nessun file di prodotto (solo storia Git riscritta), più
`.claude/context/design-and-security.md` (nuova sezione sulla restrizione della chiave) e
`.claude/memory/decisions.md` (ADR-005).
Motivo: GitHub Secret Scanning ha segnalato la `apiKey` Firebase reale in
`trips/cilento-2026/trip.config.js`, introdotta nel commit `9338942`/`8f3d1c3`. Verificato (non
assunto) che il repository è pubblico. Distinto chiaramente per l'utente il rischio reale (abuso
della chiave su altre API del progetto Cloud, non accesso ai dati Firestore, già protetti dalle
Security Rules indipendentemente dalla segretezza della chiave) dal rimedio percepito
(riscrivere la storia). Eseguite entrambe le azioni richieste esplicitamente dall'utente: (1)
restrizione della chiave su Google Cloud Console — referrer HTTP limitati ai due domini di hosting,
API ridotte da 25 a 4 (corretto in corso d'opera un errore dell'utente: aveva selezionato "Cloud
Datastore API" invece di "Cloud Firestore API"); (2) bonifica della storia con
`git filter-repo --replace-text` dopo backup completo (`git bundle`), poi reintroduzione della
stessa chiave (ora ristretta) in un nuovo commit, perché l'app deve comunque poterla leggere.
Force-push esplicitamente eseguito dall'utente, non dall'agente. Un primo tentativo di verifica
post-force-push aveva rilevato che il push non era ancora arrivato a `origin/main` (l'utente aveva
frainteso "fatto tutto" come comprensivo del push): corretto chiedendo di rilanciare il comando,
poi riverificato con un secondo fetch indipendente prima di dichiarare l'incidente chiuso.
Verifica residua: nessuna nota; incidente chiuso e verificato end-to-end (Cloud Console, storia
Git remota, app live ricaricata con successo dall'utente).

## 2026-07-06 — Fix cache Hosting, verifica reale del backend flight-search

Commit: non ancora committato (HEAD resta fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff).
File toccati: `trips/cilento-2026/firebase.json` e `README.md` (aggiunta direttiva `headers` con
`Cache-Control: no-cache, max-age=0` su HTML/JS), `services/flight-search/app/adapters/fast_flights_adapter.py`
(riscritto), `services/flight-search/README.md` (stato di verifica aggiornato da "non eseguito" a
verificato), `services/flight-search/requirements-dev.txt` (nuovo, per `httpx` di test),
`.claude/context/current-work.md`.
Motivo: un secondo screenshot dell'utente mostrava ancora contenuto vecchio (badge "Estate 2025",
emoji, trattini lunghi) nonostante due deploy e due reseed Firestore corretti. Verificato con
`curl` diretto sull'URL di hosting che il server serviva già il file giusto: la causa reale era
`Cache-Control: max-age=3600` di default di Firebase Hosting, non un problema di deploy. Corretto
alla radice con una direttiva `no-cache` sui file HTML/JS, verificata via header HTTP reali dopo
il fix, e propagata al template README per i viaggi futuri.
Poi ripresa `services/flight-search/`, mai eseguita contro un ambiente reale: creato un virtualenv,
installate le dipendenze reali, ed eseguita una ricerca live. Emersi due problemi reali non
deducibili dalla sola lettura di documentazione: (1) l'API della libreria `fast-flights` installata
(v3.0.2) è strutturalmente diversa da quella descritta dalla ricerca web usata nella prima stesura
dell'adapter (struttura annidata Result→Flights→SingleFlight invece di un oggetto Flight piatto
con `is_best`/`name`/eccetera, che semplicemente non esistono in questa versione); (2) da rete
europea le richieste dirette a Google Flights atterrano sul muro di consenso GDPR
(`consent.google.com`), aggirato impostando il cookie `SOCS` tramite il punto di estensione
`FetchIntegration` della libreria. Dopo la correzione, verificato con una ricerca reale FCO→CDG:
11 offerte reali con prezzi EUR, orari e compagnie vere, servite sia via `TestClient` sia via un
processo `uvicorn` reale interrogato con `curl`. Alcuni itinerari vengono scartati per una
`ValueError` nello spacchettare un formato orario anomalo: gestito con un except mirato invece di
propagare l'errore, documentato come limite strutturale di un adapter basato su scraping.
Verifica residua: il cookie di bypass del consenso non è garantito stabile nel tempo (dipende da
un comportamento di Google non contrattuale).


> Append-only, in ordine cronologico inverso (la voce più recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento. Qui confluisce anche il log di riconciliazione dei
> documenti `.docx`, con il nome del documento sorgente e l'esito, così la data di allineamento
> sopravvive a un clone.

## 2026-07-06 — Palette WeRoad applicata alla shell, tipografia sans-serif, rimozione emoji

Commit: non ancora committato (HEAD resta fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff).
File toccati: `public/index.html` e `trips/cilento-2026/index.html` (riscrittura completa: palette
gia' applicata nel giro precedente, qui font 'Cormorant Garamond' sostituito con 'Poppins' per i
titoli, rimossi tutti gli elementi emoji della shell e sostituiti con simboli funzionali dove
serviva uno stato — numero del giorno al posto dell'icona, spinner CSS al posto dell'ancora nel
loading, stelle hotel riscritte come testo "3 stelle"/"4 stelle"), `trips/cilento-2026/trip.config.js`
(riscrittura completa: rimossi i campi `icon`/`i`/`em` ormai non renderizzati, rimossa ogni emoji
e i simboli decorativi ★/♥ da tutto il contenuto), `README.md` (sezioni 4.3, 4.4, 4.5 allineate al
nuovo schema senza emoji).
Motivo: l'utente ha giudicato l'aspetto (font serif corsivo Cormorant Garamond + emoji ovunque)
tipico di un'app "AI generated", chiedendo di cambiare font e rimuovere tutte le emoji, da
replicare per ogni vacanza futura (quindi nella shell condivisa, non solo nei dati di Cilento). Ho
tentato di verificare il font reale di WeRoad scaricando la loro homepage, ma il risultato
("Google Sans") e' quasi certamente un artefatto di un layer di traduzione/proxy Google, non il
font reale del sito: scartato esplicitamente invece di essere presentato come fatto verificato.
Scelto invece Poppins (bold, geometrico, moderno) per i titoli in sostituzione del serif corsivo,
mantenendo DM Sans per il corpo del testo. La distinzione adottata per le emoji: rimossi tutti i
pittogrammi a colori e i simboli decorativi (★, ♥) dal contenuto; mantenuti solo i simboli
funzionali di stato gia' presenti nell'interazione della shell (✓ completato, ○ da fare, ▼
espandi, › punto elenco dei consigli), perche' non sono flourish decorativo ma stato dell'interfaccia.
Ogni redeploy di TRIP_DATA richiede un nuovo seed forzato (cancellazione di
`trips/cilento-2026/content/days` via `firebase firestore:delete`, verificata via REST API): fatto
due volte in questa sessione, una per il fix dell'anno e dei trattini, una per palette/font/emoji.
Verifica residua: l'utente deve confermare via screenshot che il risultato visivo sia quello
voluto prima di procedere oltre.

## 2026-07-06 — Credenziali Firebase reali, deployment.md popolata con confronto a my-wedding-day

Commit: non ancora committato (HEAD resta fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff).
File toccati: `trips/cilento-2026/trip.config.js` (`apiKey`, `storageBucket`, `messagingSenderId`,
`appId` scritti con i valori reali forniti dall'utente da Firebase Console, sostituendo i
`REPLACE_ME` residui), `.claude/context/deployment.md` (popolata da scaffold vuoto),
`.claude/context/current-work.md`, `.claude/memory/index.md`.
Motivo: l'utente ha registrato un'app web sul progetto `viaggio-new` e incollato il blocco
`firebaseConfig` generato dalla Console. Lo snippet della Console assumeva un progetto con
bundler (`import ... from "firebase/app"`, stile npm); scartate le righe di import, tenuto solo
l'oggetto di configurazione, perché questo progetto carica l'SDK da CDN senza npm né build step.
L'utente ha poi chiesto di documentare con precisione il flusso di deployment e come si
differenzia da `E:\my-wedding-day`, altro progetto sulla stessa macchina: letti `firebase.json` e
`package.json` di quel repository per un confronto verificato, non per sentito dire. Sintesi:
`my-wedding-day` è un prodotto singolo con build step React/TypeScript, Cloud Functions e un solo
`firebase.json` di radice (richiede il piano Blaze); questo progetto non ha build step, non ha
Cloud Functions, resta su Spark, ed è pensato per più istanze (viaggi) indipendenti fianco a
fianco, da cui la struttura a `firebase.json` per cartella invece che uno solo.
Verifica residua: non è stato ancora eseguito un `firebase deploy` reale dell'hosting per
verificare che l'app carichi con le credenziali reali.

## 2026-07-06 — Database Firestore creato, regole permanenti via CLI, design-and-security.md popolata

Commit: non ancora committato (HEAD resta fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff).
File toccati: creati `firestore.rules`, `firebase.json` (radice), `.firebaserc` (radice,
gitignored); modificati `.gitignore` (pattern Python, `.env`), `README.md` (sezioni 3 e 12),
`.claude/context/design-and-security.md` (popolata da scaffold vuoto), `.claude/memory/decisions.md`
(ADR-004), `.claude/context/current-work.md`, `.claude/memory/index.md`.
Motivo: guidato l'utente passo-passo nella creazione del database Firestore su Console per il
progetto condiviso `viaggio-new` (versione Standard, location `eur3`, avviato in modalità di
test), verificando ogni passaggio da screenshot reali invece che per ipotesi. L'utente ha poi
chiesto di "automatizzare" la scadenza a 30 giorni della modalità di test: la soluzione applicata
non è un promemoria ma l'eliminazione del problema, distribuendo le stesse regole permissive via
`firebase deploy --only firestore:rules` da un file versionato, che non porta la condizione di
scadenza che la Console inserisce automaticamente (ADR-004). Deploy eseguito e verificato con
successo in sessione. Contestualmente popolata `design-and-security.md`, finora scaffold vuoto,
e corretta una lacuna reale del `.gitignore` (assenza di `.env`, rilevante perché
`services/flight-search/.env.example` anticipa segreti reali futuri).
Verifica residua: l'utente sta recuperando da Firebase Console i campi Firebase mancanti in
`trips/cilento-2026/trip.config.js`.

## 2026-07-06 — Commit e push della ristrutturazione, riconciliazione post-commit

Commit: `aeaeb84`, `5e52006`, `fb591e5` (l'ultimo è HEAD attuale, verificato pushato su
`origin/main` con `git fetch` + confronto, non solo dall'output incollato dall'utente).
File toccati: `.claude/memory/index.md` (commit di riferimento e stato schede aggiornati a
`fb591e5`, rimossa la nota "non ancora committata" ormai falsa), `last-verified-commit` bumpato a
`fb591e5` in `STACK.md`, `current-work.md`, `roadmap.md`.
Motivo: i tre commit dell'utente (frammentati in due passaggi per un problema di wrapping delle
righe multi-percorso incollate in PowerShell, che ha troncato silenziosamente `git add` su alcuni
percorsi trattandoli come stringhe letterali invece che argomenti) hanno reso obsoleti i
riferimenti a "modifiche non ancora committate" scritti nella voce di lavoro precedente. Nota per
sessioni future: preferire `git add` a livello di cartella (poche righe corte) invece di liste
lunghe di percorsi tra virgolette quando il terminale di destinazione è PowerShell, per evitare
che il paste tronchi la riga.

## 2026-07-06 — Ristrutturazione multi-viaggio, integrazione ricerca funzionalità, avvio Fase 1

Commit: non ancora committato (HEAD resta f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8; le modifiche
di questa voce sono successive e in attesa di commit manuale dell'utente).
File toccati: creati `public/index.html`, `trips/cilento-2026/{index.html, trip.config.js,
firebase.json, .firebaserc}`, `README.md` di radice, `services/flight-search/**` (scaffold
FastAPI), `.claude/memory/decisions.md` (ADR-002, ADR-003); popolati `.claude/context/STACK.md`
e `.claude/context/roadmap.md`; aggiornato `.claude/context/current-work.md`; modificato
`.gitignore`; rimossa la cartella `handoff/`; eliminati da `_notes/` i tre file di ricerca ormai
integrati (`travel-app-handoff.md` e i due `[TBC]`).
Motivo: su richiesta esplicita dell'utente, il codice consegnato in `handoff/` è stato portato
nella struttura definitiva del repository, ma con un modello diverso da quello proposto dalla
documentazione originale — sotto-cartella per viaggio (`trips/<nome>/`) invece di branch Git per
viaggio — per permettere a più viaggi di coesistere sullo stesso branch. Contestualmente, la
ricerca tecnica su come evolvere l'app verso un comparatore multi-fonte (voli, alloggi, trasporto
terra) più itinerary builder, consegnata in tre file di `_notes/`, è stata sintetizzata dentro
`roadmap.md` e i file sorgente sono stati eliminati come richiesto. Durante la sessione l'utente
ha inoltre creato un progetto Firebase reale (`viaggio-new`); la discussione su come collegarlo ha
portato a sostituire il modello "un progetto Firebase per viaggio" con un progetto unico condiviso
e dati Firestore namespaced per `TRIP_ID` (ADR-003), l'unica modifica apportata a `index.html` in
questa sessione. Infine è stato avviato, come primo passo della Fase 1 della roadmap, lo scaffold
del servizio `services/flight-search/` con un adapter funzionante verso `fast-flights`.
Verifica residua: `FIREBASE_CONFIG.apiKey`, `storageBucket`, `messagingSenderId` e `appId` in
`trips/cilento-2026/trip.config.js` restano `REPLACE_ME` — vanno incollati da Firebase Console.
Il servizio `flight-search` non è stato eseguito contro un ambiente Python reale in questa
sessione (dettagli in `services/flight-search/README.md`).

## 2026-07-06 — Primo ancoraggio delle schede a HEAD

Commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
File toccati: frontmatter di tutte le schede in `.claude/context/` (STACK.md,
design-and-security.md, deployment.md, dev-testing.md, current-work.md, roadmap.md) e
`.claude/memory/index.md`.
Motivo: la skill `sync-context` ha rilevato che il repository aveva già 4 commit
(`f470694`..`f8a0c3d`) mentre tutte le schede erano ancora ferme al segnaposto
`PENDING-FIRST-COMMIT` del greenfield. Eseguito il passo 0 di primo ancoraggio: sostituito il
segnaposto con l'hash di HEAD in `generated-from-commit` e `last-verified-commit` di ogni
scheda. Il contenuto delle schede resta ancora quello di solo scaffold, non popolato dal codice
reale: l'ancoraggio non equivale a una revisione dei contenuti.

## 2026-06-15 — Inizializzazione del sistema di progetto

Commit: PENDING-FIRST-COMMIT
File toccati: anatomia di `.claude` (PROJECT-SYSTEM.md, rules/, skills/, templates/,
settings.json, memory/, context/), `CLAUDE.md`, `CLAUDE.local.md`, `.gitignore`, `_notes/`.
Motivo: installazione del sistema portabile di contesto, documentazione e version control
descritto in `.claude/PROJECT-SYSTEM.md`, in modalità greenfield. Identità git locale impostata
sul profilo personale (`alesop95`, alias SSH `github-personal`) con remoto
`alesop95/holiday-template`. Schede di `context/` create con sola struttura e frontmatter
ancorato a `PENDING-FIRST-COMMIT`, da popolare leggendo il codice nelle sessioni successive.
Il codice dell'app è arrivato già scritto in `handoff/` da una sessione Claude precedente e non
è ancora integrato nella struttura definitiva.
