# Registro delle decisioni architetturali

> Convenzione ADR-lite, append-only. Ogni decisione architetturale non ovvia entra come voce
> numerata con data, stato, contesto, decisione, motivazione e conseguenze. Una decisione non si
> cancella e non si riscrive: quando viene superata, si aggiunge una nuova voce che dichiara di
> superare la precedente e ne cita il numero. Le inferenze non confermate si marcano come da
> verificare e si promuovono a decisione solo quando una fonte le conferma.

## ADR-001 — Adozione del sistema di progetto portabile

Data: 2026-06-15
Stato: accettata
Contesto: il progetto necessita di uno stato interamente recuperabile da un clone e di
documentazione che resti allineata al codice senza rilettura integrale a ogni sessione.
Decisione: adottare il sistema descritto in `.claude/PROJECT-SYSTEM.md`, con motore di
riconciliazione ancorato ai commit e doppio livello documentale tracciato/ignorato.
Motivazione: persistenza strutturale su disco indipendente dalla sessione di chat, e controllo
umano sul versionamento.
Conseguenze: ogni passo significativo aggiorna schede, `last-verified-commit`, snapshot e
work-log; commit e push restano manuali.

## ADR-002 — Sotto-cartella per viaggio invece di branch Git per viaggio

Data: 2026-07-06
Stato: accettata
Contesto: `handoff/README.md` (rimosso in questa sessione dopo la migrazione) proponeva un solo
`public/index.html` + `public/trip.config.js` condivisi, con un nuovo viaggio gestito come branch
Git separato dal branch `main`. Il progetto vuole invece poter avere più viaggi, passati e futuri,
visibili e navigabili insieme sullo stesso branch.
Decisione: ogni viaggio è una cartella autosufficiente sotto `trips/<nome>/`, con una propria
copia di shell (`index.html`), configurazione (`trip.config.js`) e hosting (`firebase.json`),
deployabile in modo indipendente dalle altre. `public/index.html` resta la shell canonica,
sorgente di verità da cui si copia, non un file importato a runtime dai viaggi.
Motivazione: coerenza con l'obiettivo di tenere lo storico di tutti i viaggi consultabile su disco
senza cambiare branch; ogni cartella resta deployabile per conto proprio.
Conseguenze: una correzione alla shell canonica non si propaga automaticamente ai viaggi già
creati — va ricopiata manualmente in ogni `trips/<nome>/index.html` che si vuole aggiornare.

## ADR-003 — Un solo progetto Firebase condiviso, dati Firestore namespaced per TRIP_ID

Data: 2026-07-06
Stato: accettata
Contesto: il modello originale (un progetto Firebase per viaggio, per non far collidere i
percorsi Firestore fissi `content/days` ecc. tra viaggi diversi) risolveva la collisione dei dati
ma richiede di creare un nuovo progetto Firebase su Console ad ogni nuovo viaggio, percepito come
un attrito operativo non necessario per un uso privato saltuario.
Decisione: un solo progetto Firebase (`viaggio-new`) serve tutti i viaggi, presenti e futuri.
`trip.config.js` guadagna l'export `TRIP_ID`; tutti i percorsi Firestore in `index.html` sono
namespaced come `trips/{TRIP_ID}/content/...` e `trips/{TRIP_ID}/state/...`. Questa è stata
l'unica modifica apportata a `index.html` per un motivo diverso da una correzione di bug: da qui
in avanti la shell torna a non cambiare mai tra un viaggio e l'altro.
Motivazione: elimina la creazione di un nuovo progetto Firebase (e delle relative credenziali)
ad ogni nuovo viaggio, al costo di condividere la stessa quota gratuita giornaliera di Firestore
tra tutti i viaggi — quota (50.000 letture/20.000 scritture al giorno) ampiamente sufficiente per
un uso privato di due persone anche con più viaggi attivi.
Conseguenze: le Firestore Security Rules permissive (`allow read, write: if true`, sezione 12 di
`README.md`) coprono l'intero albero `trips/**`, non un solo viaggio: chiunque conosca l'URL
pubblico può leggere/scrivere i dati di qualunque viaggio, passato o futuro, non solo di quello
in corso.

## ADR-004 — Regole Firestore distribuite via CLI da un firebase.json di radice, non generate dalla Console

Data: 2026-07-06
Stato: accettata
Contesto: creando il database Firestore da Console, l'utente ha scelto "modalità di test" per lo
step delle regole (necessario per avere subito lettura/scrittura funzionanti). La modalità di
test della Console genera però una regola con una scadenza automatica di 30 giorni incorporata
nel testo della regola stessa, che richiederebbe di tornare manualmente su Console prima della
scadenza per sostituirla con una versione permanente — un promemoria ricorrente da non
dimenticare, che l'utente ha chiesto di eliminare invece di gestire.
Decisione: le regole permissive già previste (`allow read, write: if true`, invariate nel
contenuto) sono state scritte in `firestore.rules` (radice del repository, tracciato in Git) e
distribuite una tantum con `firebase deploy --only firestore:rules`, usando un `firebase.json` di
radice dedicato (chiave `"firestore"` soltanto, nessuna `"hosting"`) e un `.firebaserc` di radice
(gitignored) che punta allo stesso progetto condiviso `viaggio-new`.
Motivazione: una regola distribuita via CLI non porta la condizione di scadenza che la Console
inserisce automaticamente nella modalità di test; il problema dei 30 giorni si elimina alla radice
invece di essere rimandato con un promemoria.
Conseguenze: eventuali modifiche future alle regole (es. restringerle con Firebase Authentication)
vanno fatte editando `firestore.rules` e rilanciando lo stesso comando di deploy, non dalla
Console — la Console resta comunque utilizzabile per ispezionare le regole attive, solo non è più
la fonte di verità del loro contenuto.

## ADR-005 — Incidente: apiKey Firebase esposta pubblicamente, rimedio con restrizione + bonifica storia

Data: 2026-07-07
Stato: accettata
Contesto: GitHub Secret Scanning ha segnalato un "Google API Key" in `trips/cilento-2026/trip.config.js`
(la `FIREBASE_CONFIG.apiKey` reale, introdotta nel commit poi rinominato `8f3d1c3` dopo la
riscrittura). Il repository `alesop95/holiday-template` è pubblico (verificato via API GitHub, non
assunto). Sebbene una `apiKey` Firebase non sia un segreto nel senso classico — l'accesso ai dati è
governato dalle Firestore Security Rules, non dalla segretezza della chiave (vedi
`design-and-security.md`) — il rischio reale di una chiave Google esposta e non ristretta è l'abuso
su altre API del progetto Cloud, non l'accesso ai dati Firestore.
Decisione: due azioni indipendenti, non una sola. Primo, la chiave è stata ristretta su Google
Cloud Console (progetto `viaggio-new`): referrer HTTP limitati a `viaggio-new.web.app` e
`viaggio-new.firebaseapp.com`, API accessibili ridotte da 25 a 4 (Cloud Firestore API, Identity
Toolkit API, Token Service API, Firebase Installations API) — questo è il rimedio che neutralizza
il rischio reale. Secondo, la storia Git è stata riscritta con `git filter-repo --replace-text`
(dopo un backup completo via `git bundle`) per rimuovere le ripetizioni della stringa dai commit
precedenti, poi la chiave (stessa stringa, ora ristretta) è stata reintrodotta in un nuovo commit
perché l'app deve comunque poterla leggere per funzionare, e forzato il push (`git push --force`,
eseguito dall'utente, non dall'agente, come da vincolo del progetto sulle operazioni git manuali).
Motivazione: riscrivere solo la storia, senza restringere la chiave su Cloud Console, non avrebbe
ridotto il rischio reale (la chiave sarebbe comunque rimasta nel commit corrente, necessariamente);
restringere la chiave senza bonificare la storia avrebbe lasciato ripetuta la stessa stringa in piu'
commit passati, superfluo ma non necessario dopo la restrizione. Fatte entrambe perché l'utente ha
chiesto esplicitamente sia la pulizia della storia sia la restrizione, e sono complementari, non
alternative.
Conseguenze: ogni clone locale del repository precedente al force-push ha una storia ora
incompatibile (i vecchi hash dei commit dal punto della riscrittura in poi non esistono più); non
risultano altri clone noti. Verificato dopo il force-push, con un fetch indipendente e non fidandosi
del solo output incollato dall'utente, che `origin/main` riflette la storia riscritta e che la
vecchia stringa della chiave non ricorre più in nessun punto della storia remota tranne
nell'unico commit finale che la reintroduce (atteso e corretto). Backup pre-riscrittura conservato
in locale (`git bundle`, fuori dal repository), non versionato.

## ADR-006 — Abbandonato Amadeus come fonte dati, sostituito da Kiwi Tequila

Data: 2026-07-07
Stato: accettata, supera implicitamente la scelta di Amadeus in ADR (nessuna precedente formale,
ma Amadeus era la fonte pianificata fin dalla ricerca originale sintetizzata in `roadmap.md`)
Contesto: durante la registrazione per ottenere credenziali reali per l'adapter Amadeus Flight
Offers Search (già scritto e verificato contro un esempio di risposta ufficiale, ma mai contro
l'API live), è emerso che il sito Amadeus for Developers mostra un avviso di chiusura del
portale self-service al 17 luglio 2026. Verificato con fonti indipendenti (PhocusWire, Tragento),
non solo dall'annuncio sul sito: nuove registrazioni già sospese, chiavi esistenti disattivate
alla data di chiusura. Resta attivo solo il portale Enterprise, a pagamento e con approvazione
tramite account manager — fuori scope per un progetto privato a costo zero.
Decisione: rimosso interamente `amadeus_adapter.py` (non lasciato come riferimento morto) e
tutte le sue tracce in `main.py`/`.env.example`. Scritto `kiwi_adapter.py` come sostituto,
verso Kiwi.com Tequila API — già la seconda scelta della ricerca originale, con il vantaggio
pratico di richiedere solo una API key (nessun OAuth2) e una registrazione senza revisione.
Motivazione: investire ulteriore lavoro di verifica (credenziali, test live) su una piattaforma
in chiusura imminente non avrebbe alcun ritorno; il pattern adapter (`FlightSourceAdapter`) ha
reso la sostituzione priva di conseguenze per `FastFlightsAdapter` o per il comparatore in
`main.py`, che non hanno dovuto cambiare.
Conseguenze: la Fase 2 della roadmap (motore di ricerca alloggi) perde la propria fonte primaria
pianificata (Amadeus Hotel Search/List API, stesso portale in chiusura) e resta senza una fonte
"ufficiale" sostitutiva individuata — segnalato come domanda aperta in `roadmap.md`, non risolto
da questa decisione. L'adapter Kiwi ha una verifica più debole di quella Amadeus al momento della
rimozione (nomi dei campi della risposta ricostruiti da fonti di terze parti, non da un esempio
ufficiale): la prima ricerca live con una chiave reale resta un passo di verifica ancora dovuto,
non completato da questa sessione.

## ADR-007 — Risultati del comparatore salvati dal frontend via SDK client, non dal backend via Admin SDK

Data: 2026-07-08
Stato: accettata
Contesto: collegare i risultati di `trip-planner` (voli, alloggi, POI) a un giorno specifico
dell'itinerario richiede una scrittura su Firestore. La via ovvia — dare a `trip-planner` un
endpoint di salvataggio che scrive lui stesso su Firestore — richiede il Firebase Admin SDK, che
a sua volta richiede una service account key: una credenziale reale da generare su Google Cloud
Console e distribuire al servizio, cioè uno dei passi manuali che l'utente ha chiesto di rimandare
a favore dello sviluppo di puro codice.
Decisione: nessuno dei quattro servizi backend scrive su Firestore. La shell (`public/index.html`)
guadagna una scheda "Pianifica" che chiama `trip-planner` via `fetch` semplice (nessun SDK
coinvolto in quella chiamata) e, quando l'utente sceglie di salvare un risultato su un giorno,
scrive direttamente su Firestore con l'SDK client già inizializzato in `init()` — lo stesso canale
usato da checklist e note. Nuovo documento `trips/{TRIP_ID}/state/planning`, struttura
`{ byDay: { "<dayId>": { flights: [...], stays: [...], pois: [...] } } }`, scritto con
`setDoc(..., {merge:true})` sullo stesso pattern già in uso per `writeNote`.
Motivazione: la separazione già esistente tra i quattro backend (stateless, senza segreti, senza
dato personale, vedi `design-and-security.md`) resta intatta senza introdurre credenziali nuove;
il costo è che il salvataggio funziona solo quando la shell gira nello stesso contesto browser che
può raggiungere sia `trip-planner` (rete locale) sia Firestore (rete pubblica), non da qualunque
client del backend.
Conseguenze: CORS aperto (`allow_origins=["*"]`) aggiunto a tutti e quattro i servizi, altrimenti
il browser blocca la risposta della chiamata da un'origine diversa (la shell aperta da file:// o
da un server statico locale) — scelta coerente con l'assenza di autenticazione e di dati sensibili
già documentata, non un indebolimento della sicurezza reale. Se in futuro il salvataggio dovesse
avvenire da un contesto senza SDK client (es. un job schedulato lato server), servirà comunque
introdurre l'Admin SDK a quel punto: questa decisione rimanda quel passo, non lo esclude.

## ADR-008 — Hosting dei quattro servizi backend su Render, un solo deploy condiviso per tutti i viaggi

Data: 2026-07-08
Stato: proposta (Blueprint scritto e verificato contro la documentazione ufficiale Render; la
creazione effettiva dei servizi su Render, un account già esistente dell'utente collegato a
GitHub, resta un passo manuale non ancora eseguito in questa sessione)
Contesto: il primo test in browser della scheda "Pianifica" (screenshot dell'utente) ha mostrato
`Failed to fetch` verso `http://localhost:8004`: la shell gira su HTTPS (`viaggio-new.web.app`,
referrer autorizzato dell'apiKey Firebase per ADR-005) e il browser blocca come *mixed content*
una richiesta attiva verso un'origine HTTP in chiaro, indipendentemente da come risponde il
servizio di destinazione. Nessuna delle alternative di solo sviluppo locale è pulita: allargare la
restrizione referrer dell'apiKey a `localhost` è un cambio di postura di sicurezza per un test, e
un certificato HTTPS locale autofirmato aggiunge un pezzo di infrastruttura usa-e-getta. L'utente
ha inoltre posto la domanda di hosting reale nello stesso momento, con un account Render già
esistente collegato a GitHub.
Decisione: i quattro servizi backend (`flight-search`, `stay-search`, `poi-search`,
`trip-planner`) si deployano su Render come Web Service Python separati, descritti in un unico
`render.yaml` (Render Blueprint) alla radice del repository. Un solo deploy serve tutti i viaggi,
presenti e futuri: nessuno dei quattro servizi conosce un `TRIP_ID` o dipende da un viaggio
specifico (sono ricerca/orchestrazione pure), lo stesso principio già adottato per il progetto
Firebase unico (ADR-003). `TRIP_PLANNER_URL` in `trip.config.js` passa dal default locale
(`http://localhost:8004`) all'URL pubblico HTTPS di `trip-planner` su Render, stesso valore
ripetuto identico in ogni `trips/<nome>/trip.config.js` futuro, sullo stesso modello già in uso
per `FIREBASE_CONFIG`.
Motivazione: risolve il blocco di mixed content alla radice, perché sia la shell sia il backend
finiscono sotto HTTPS, senza toccare la restrizione referrer dell'apiKey né introdurre
infrastruttura locale usa-e-getta. Render era già la scelta di fallback raccomandata dalla ricerca
originale (`roadmap.md`, sezione "Direzione") per chi non dispone di un dispositivo sempre acceso;
l'utente ha già l'account, quindi non introduce un nuovo attrito operativo.
Conseguenze accettate esplicitamente dall'utente, non mitigate: il piano free di Render mette in
pausa un servizio dopo circa 15 minuti di inattività, con un cold start di circa 50 secondi alla
richiesta successiva; per una ricerca che coinvolge tutti e quattro (`trip-planner` deve prima
svegliarsi lui stesso, poi gli altri tre si svegliano in parallelo) il caso peggiore dopo un
periodo di inattività è dell'ordine di 100 secondi per la prima ricerca. Giudicato accettabile per
il pattern d'uso reale della scheda "Pianifica" (ricerca occasionale durante la pianificazione di
un viaggio, non un servizio ad accesso continuo): non introdotto alcun meccanismo per tenere i
servizi svegli (es. un ping periodico via GitHub Actions, comunque valutato nella ricerca originale
in `roadmap.md`), scelta deliberata per non aggiungere infrastruttura non necessaria al caso d'uso.
Gli URL pubblici dei tre servizi a valle di `trip-planner` (`FLIGHT_SEARCH_URL`,
`STAY_SEARCH_URL`, `POI_SEARCH_URL`) vanno impostati a mano nel pannello Render dopo il primo
deploy di ciascuno, perché la sintassi esatta della variabile Blueprint `fromService` per
comporre un URL completo con schema HTTPS a partire dal solo host/porta privato non è stata
verificata con sufficiente certezza contro la documentazione ufficiale per essere scritta nel
Blueprint senza rischio di un valore inventato; il file `render.yaml` marca quei tre valori
`sync: false` apposta.
