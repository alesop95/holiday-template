---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - trips/**/firebase.json
  - trips/**/.firebaserc
  - firebase.json
  - firestore.rules
  - services/flight-search/**
last-verified-commit: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
---

# Deployment

> Popolare leggendo la configurazione reale di infrastruttura e CI. Commit, push e deploy restano
> operazioni manuali dell'utente.

## Livelli

Non esiste un ambiente di staging separato: c'è un solo progetto Firebase (`viaggio-new`, piano
*Spark*) che funge sia da "produzione" sia da unico ambiente di sviluppo, condiviso da tutti i
viaggi. Non essendoci build step né CI, non c'è una pipeline che distingua un rilascio di prova da
uno reale: ogni `firebase deploy` pubblica direttamente sull'URL live.

Il progetto ha due deploy target completamente indipendenti, con comandi diversi e cartelle di
lavoro diverse, perché coprono risorse Firebase di natura diversa:

Hosting (i file statici di un viaggio) è per-viaggio: ogni `trips/<nome>/` ha il proprio
`firebase.json` con chiave `"hosting"` e il proprio `.firebaserc` (gitignored) che punta allo
stesso progetto condiviso. Il comando si lancia da dentro quella cartella.

Firestore Rules (la sicurezza dei dati, condivisa da tutti i viaggi) è di radice: un solo
`firebase.json` in radice con chiave `"firestore"` soltanto, un solo `.firebaserc` di radice
(gitignored), un solo `firestore.rules` tracciato in Git. Il comando si lancia dalla radice del
repository, non da una cartella `trips/<nome>/`. Motivazione e alternativa scartata in ADR-004
(`memory/decisions.md`).

I quattro servizi backend (`services/{flight-search,stay-search,poi-search,trip-planner}/`) non
fanno parte di questo deployment Firebase: sono servizi FastAPI a sé, deliberatamente non
integrati come Firebase Cloud Function (il progetto rimane sul piano Spark proprio perché non usa
Cloud Functions, che richiedono il piano *Blaze* a consumo anche se l'uso resterebbe nella quota
gratuita). Hosting scelto: **Render** (ADR-008, `memory/decisions.md`), un solo deploy condiviso
da tutti i viaggi (nessuno dei quattro servizi conosce un `TRIP_ID`), non ancora eseguito in questa
sessione — resta un passo manuale. Dettagli sotto, sezione "Backend su Render".

## Comandi

Deploy dell'hosting di un viaggio, dalla cartella del viaggio:

```bash
cd trips/<nome-viaggio>
firebase deploy
```

Deploy delle regole di sicurezza Firestore, dalla radice del repository (mai da `trips/<nome>/`,
perché il `firebase.json` di quella cartella non ha una chiave `"firestore"`):

```bash
firebase deploy --only firestore:rules
```

Non esiste un comando di rollback esplicito configurato: Firebase Hosting mantiene uno storico
delle versioni servite navigabile dalla Console (*Hosting > Versioni precedenti*), da cui si può
ripristinare manualmente una release precedente. Le Firestore Rules non hanno uno storico gestito
da questo progetto: la versione precedente si recupera solo dalla cronologia Git di
`firestore.rules`.

## Backend su Render

`render.yaml` (radice del repository) è un *Render Blueprint*[^5]: descrive i quattro servizi come
Web Service Python indipendenti (`rootDir` per puntare ciascuno alla propria cartella sotto
`services/`, `buildCommand: pip install -r requirements.txt`, `startCommand: uvicorn app.main:app
--host 0.0.0.0 --port $PORT`, `plan: free`). Render assegna la variabile `PORT` automaticamente
(default 10000): il servizio deve bindarsi a `0.0.0.0` su quella porta, non su una porta fissa
come nello sviluppo locale (8001-8004) — verificato contro la documentazione ufficiale Render, non
assunto.

Passi di attivazione (manuali, non ancora eseguiti in questa sessione): su Render Dashboard, *New
> Blueprint*, collegare il repository GitHub `alesop95/holiday-template`. Render legge
`render.yaml` e propone la creazione dei quattro servizi. Dopo il primo deploy di
`flight-search`/`stay-search`/`poi-search`, Render assegna a ciascuno un URL pubblico
(`https://<nome-servizio>-xxxx.onrender.com`): questi tre URL vanno incollati a mano nelle
variabili d'ambiente di `trip-planner` su Render (`FLIGHT_SEARCH_URL`, `STAY_SEARCH_URL`,
`POI_SEARCH_URL`, marcate `sync: false` nel Blueprint apposta per questo). Infine, l'URL pubblico
di `trip-planner` va incollato in `TRIP_PLANNER_URL` (`trip.config.js`) di ogni viaggio, sostituendo
il default locale `http://localhost:8004`, e ridistribuito con `firebase deploy` da ciascuna
cartella `trips/<nome>/`.

Limite noto del piano free, non ancora mitigato: un servizio inattivo per circa 15 minuti va in
pausa e impiega circa 50 secondi a ripartire alla richiesta successiva (*cold start*); per una
ricerca che coinvolge tutti e quattro il caso peggiore dopo un periodo di inattività è dell'ordine
di 100 secondi (`trip-planner` si sveglia per primo, poi gli altri tre in parallelo). Dettagli e
motivazione della scelta in ADR-008 (`memory/decisions.md`).

## Variabili d'ambiente e segreti

Il frontend (`public/`, `trips/<nome>/`) non ha variabili d'ambiente: `FIREBASE_CONFIG` è scritto
in chiaro in `trip.config.js` e non è trattato come segreto (`README.md`, sezione 12).

Il backend `services/flight-search/` prevede invece segreti reali nella Fase 1 successiva
(`AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `KIWI_TEQUILA_API_KEY`, documentate in
`services/flight-search/.env.example`), non ancora usate dall'unico adapter oggi attivo
(`fast_flights`, che non richiede chiavi). Un eventuale `.env` reale è escluso da Git.

## Confronto con my-wedding-day (E:\my-wedding-day, altro progetto sulla stessa macchina)

Verificato leggendo `firebase.json` e `package.json` di quel repository in data odierna, non per
sentito dire: è strutturalmente l'opposto di questo progetto su ogni asse rilevante, il che aiuta
a capire perché qui si è scelto un modello diverso invece di copiare un pattern già in uso altrove
sulla stessa macchina.

`my-wedding-day` è un prodotto singolo con un solo deploy target per sempre (un matrimonio, non
N matrimoni futuri): un solo `firebase.json` di radice copre insieme hosting, Cloud Functions
(`functions/`, Node.js 22, con un `predeploy` che builda il codice delle functions) e un'estensione
Firestore (`firestore-send-email`). Ha un vero build step: React (`react-scripts`, cioè Create
React App) più TypeScript, con `firebase` installato come dipendenza npm (SDK modulare v9,
bundlato) e `"public": "build"`, cioè l'output della build, non un `index.html` scritto a mano.
Questo richiede necessariamente il piano *Blaze*, perché le Cloud Functions non girano sul piano
gratuito Spark.

Questo progetto (`holiday-template`) non ha alcun build step (l'SDK Firebase si carica da CDN
dentro `<script type="module">`, non da npm), non ha Cloud Functions, resta sul piano Spark, e
soprattutto non è un prodotto singolo: è pensato per ospitare più istanze indipendenti (i viaggi)
fianco a fianco nello stesso repository, ciascuna con il proprio deploy target di hosting. È
questa esigenza di multi-istanza — assente in un sito di matrimonio, che ne ha uno solo per
definizione — a motivare la struttura a cartella-per-viaggio con `firebase.json` distinti, invece
del modello a `firebase.json` singolo che `my-wedding-day` usa correttamente per il proprio caso
d'uso. Un punto in comune tra i due progetti, non una differenza: entrambi distribuiscono
`firestore.rules` tramite CLI da un `firebase.json` tracciato, invece di affidarsi alle regole
generate dalla Console — `my-wedding-day` aveva già questo file prima che lo si introducesse qui.

[^5]: **Render Blueprint** — file `render.yaml` che descrive dichiarativamente uno o più servizi
Render (Web Service, database, ecc.); collegando un repository che lo contiene, Render propone di
creare tutti i servizi descritti in un solo passaggio invece di configurarli uno per uno da
interfaccia.
