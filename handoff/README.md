# Travel App — Documentazione Tecnica

**Versione:** 1.0.0  
**Stack:** Vanilla JavaScript ES Modules · Firebase Firestore · Firebase Hosting · Leaflet.js  
**Autore:** generato con Claude (Anthropic)

---

## Indice

1. [Panoramica del Sistema](#1-panoramica-del-sistema)
2. [Modello Architetturale](#2-modello-architetturale)
3. [Struttura del Repository](#3-struttura-del-repository)
4. [Layer di Configurazione — trip.config.js](#4-layer-di-configurazione--tripconfigjs)
5. [Application Shell — index.html](#5-application-shell--indexhtml)
6. [Modello dei Dati — Firebase Firestore](#6-modello-dei-dati--firebase-firestore)
7. [Flusso Applicativo Completo](#7-flusso-applicativo-completo)
8. [Sincronizzazione in Tempo Reale](#8-sincronizzazione-in-tempo-reale)
9. [Templatizzazione per un Nuovo Viaggio](#9-templatizzazione-per-un-nuovo-viaggio)
10. [Versionamento su GitHub](#10-versionamento-su-github)
11. [Deployment](#11-deployment)
12. [Considerazioni di Sicurezza](#12-considerazioni-di-sicurezza)
13. [Note a Piè di Pagina](#13-note-a-piè-di-pagina)

---

## 1. Panoramica del Sistema

Questa applicazione è una *progressive web app* [^1] per la pianificazione condivisa di viaggi di coppia. Eroga un itinerario interattivo giorno per giorno, una mappa geografica delle tappe, un elenco di ristoranti per area e una checklist di preparazione sincronizzata in tempo reale tra due dispositivi distinti. Non esiste un backend proprietario: l'intera infrastruttura poggia sul piano gratuito di Firebase [^2] (Google), che fornisce sia il database che l'hosting statico.

La caratteristica distintiva del sistema è la separazione netta tra struttura applicativa e contenuto del viaggio. La struttura — tutta la logica di rendering, la gestione dello stato, l'inizializzazione di Firebase, i listener real-time — risiede in un unico file HTML che non viene mai toccato tra un viaggio e l'altro. Il contenuto — destinazioni, ristoranti, checklist, credenziali Firebase, testi dell'intestazione — risiede in un secondo file JavaScript che è l'unico da modificare per generare una nuova istanza dell'applicazione per un viaggio diverso.

---

## 2. Modello Architetturale

Il sistema è organizzato su tre layer distinti e indipendenti tra loro: il *layer di configurazione*, il *layer di presentazione* e il *layer di persistenza e sincronizzazione*.

Il *layer di configurazione* è `trip.config.js`. Esporta quattro oggetti JavaScript che descrivono completamente un singolo viaggio: le credenziali del progetto Firebase, i metadati dell'intestazione visiva, le coordinate geografiche dei marker sulla mappa e la struttura dati completa (giorni, ristoranti, checklist). Questo file è l'unica variabile nel sistema.

Il *layer di presentazione* è `index.html`. Contiene tutto il CSS, tutta la struttura HTML della shell e tutto il codice JavaScript di orchestrazione. Importa il layer di configurazione tramite il meccanismo nativo degli *ECMAScript Modules* [^3] e si occupa esclusivamente di leggere i dati — prima da `trip.config.js`, poi da Firestore — e di renderizzarli nel DOM [^4].

Il *layer di persistenza e sincronizzazione* è Firebase, composto da due servizi distinti: *Cloud Firestore* (database NoSQL [^5] documentale, real-time) per i dati e lo stato condiviso, e *Firebase Hosting* per l'erogazione del file HTML tramite URL [^6] pubblico su rete HTTPS [^7].

Il diagramma seguente rappresenta le relazioni tra i tre layer:

```mermaid
graph TD
    subgraph repo["Repository GitHub"]
        cfg["trip.config.js<br/>(configurazione viaggio)"]
        shell["index.html<br/>(application shell)"]
    end

    subgraph firebase["Firebase Project"]
        subgraph hosting["Firebase Hosting"]
            url["https://viaggio.web.app"]
        end
        subgraph firestore["Cloud Firestore"]
            cd["content/days"]
            cr["content/restaurants"]
            cc["content/checklist"]
            sc["state/checklist"]
            sn["state/notes"]
        end
    end

    cfg -->|"importato via ESM"| shell
    shell -->|"firebase deploy"| url
    url -->|"seed al primo avvio"| cd
    url -->|"seed al primo avvio"| cr
    url -->|"seed al primo avvio"| cc
    url <-->|"onSnapshot (read/write)"| sc
    url <-->|"onSnapshot (read/write)"| sn
```

---

## 3. Struttura del Repository

```
travel-app-template/
├── public/
│   ├── index.html          ← application shell; non modificare tra un viaggio e l'altro
│   └── trip.config.js      ← configurazione del viaggio; unico file da cambiare
├── firebase.json           ← configurazione Firebase Hosting
├── .gitignore              ← esclude .firebaserc e node_modules
└── README.md               ← questo documento
```

`firebase.json` istruisce Firebase Hosting a servire i file dalla cartella `public/` e a redirezionare tutte le richieste verso `index.html`, comportamento necessario per qualunque applicazione che gestisca la navigazione lato client senza ricaricare la pagina.

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

`.firebaserc`, il file che Firebase CLI [^8] genera automaticamente durante `firebase init` e che contiene il binding tra la cartella locale e lo specifico progetto Firebase, è volutamente escluso da Git tramite `.gitignore`. Questo consente alla stessa struttura di repository di essere collegata a progetti Firebase diversi (uno per viaggio) senza che le configurazioni si sovrascrivano tra branch o fork.

---

## 4. Layer di Configurazione — `trip.config.js`

`trip.config.js` è un modulo JavaScript standard che usa la sintassi `export` di ES Modules per esporre quattro oggetti distinti. Ogni oggetto ha una responsabilità precisa e corrisponde a una parte specifica del sistema.

### 4.1 FIREBASE_CONFIG

Contiene le credenziali del progetto Firebase. Questi valori sono recuperabili dalla Firebase Console sotto *Impostazioni progetto > Le tue app > SDK setup and configuration*.

```javascript
export const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_ME",
  authDomain:        "REPLACE_ME.firebaseapp.com",
  projectId:         "REPLACE_ME",       // identificatore univoco del progetto Firebase
  storageBucket:     "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId:             "REPLACE_ME"
};
```

Al momento dell'inizializzazione, `index.html` chiama `initializeApp(FIREBASE_CONFIG)` passando questo oggetto all'SDK [^9] Firebase. Prima di farlo, verifica che `apiKey` non sia ancora il valore placeholder `"REPLACE_ME"`: se lo è, interrompe l'esecuzione e mostra un messaggio diagnostico nell'overlay di caricamento, evitando che l'applicazione tenti una connessione con credenziali non valide.

### 4.2 TRIP_META

Contiene il contenuto testuale dell'intestazione visiva dell'applicazione: il badge, il titolo principale, il sottotitolo in corsivo e l'array delle statistiche sintetiche.

```javascript
export const TRIP_META = {
  badge:    "Viaggio di Coppia · Estate 2025",
  title:    "Cilento & Caserta",
  subtitle: "7 giorni tra mare, natura e storia",
  stats:    ["📅 7 giorni · 6 notti", "🏨 1 solo cambio hotel", ...]
};
```

Questa separazione consente a `index.html` di renderizzare l'intestazione immediatamente al caricamento, prima ancora che Firebase risponda, perché `renderHero()` viene invocata come prima istruzione di `init()` e non dipende da alcuna chiamata asincrona.

### 4.3 MAP_LOCATIONS

Array di oggetti che descrivono i marker della mappa Leaflet [^10]. Ogni oggetto definisce coordinate geografiche (`lat`, `lng`), nome visualizzato (`nm`), sottotitolo (`sub`), colore esadecimale del marker (`c`) ed emoji sovrapposta al cerchio del marker (`em`).

```javascript
export const MAP_LOCATIONS = [
  { lat: 40.0064, lng: 15.3743, nm: "Marina di Camerota",
    sub: "Base 1 · Giorni 1–4", c: "#2B5C8A", em: "🏨" },
  // ...altri marker in ordine cronologico di visita
];
```

La sequenza dell'array rispecchia l'ordine cronologico delle tappe: Leaflet disegna la linea tratteggiata del percorso connettendo i punti nell'ordine in cui compaiono nell'array, tramite `L.polyline(MAP_LOCATIONS.map(l => [l.lat, l.lng]), ...)`.

### 4.4 TRIP_DATA

Contiene la struttura dati completa del viaggio, suddivisa in tre sotto-array: `days`, `restaurants` e `checklist`. Questa struttura viene caricata su Firestore al primo avvio dell'applicazione (meccanismo di *seeding* descritto nel paragrafo 7.2). Ogni elemento di `days` include un identificatore numerico progressivo (`id`), un colore tema (`color`), icona, etichetta, titolo, luoghi, sezioni descrittive, suggerimenti pratici e stime di costo per pasti e attività. Ogni elemento di `checklist` raggruppa gli item sotto una categoria (`cat`) e li lista come oggetti con testo (`t`) e nota opzionale (`n`).

---

## 5. Application Shell — `index.html`

`index.html` è strutturato in tre blocchi sequenziali: il markup HTML della shell visiva, il tag `<script src>` che carica Leaflet come script sincrono globale, e il tag `<script type="module">` che contiene tutta la logica applicativa in un modulo ES isolato.

### 5.1 Il tag `<script type="module">` e la catena di import

La prima istruzione eseguita dal modulo è un blocco di tre `import` statici:

```javascript
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

import { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { FIREBASE_CONFIG, TRIP_META, TRIP_DATA, MAP_LOCATIONS }
  from './trip.config.js';
```

I primi due import scaricano l'SDK Firebase direttamente dalla CDN [^11] di Google tramite URL assoluti. Il terzo import risolve `trip.config.js` come percorso relativo rispetto a `index.html`: poiché entrambi i file si trovano nella stessa cartella `public/`, il browser li carica correttamente sia in ambiente di sviluppo locale che da Firebase Hosting.

L'uso di `type="module"` implica tre comportamenti automatici del browser rilevanti per questo sistema: i moduli sono sempre *deferred* (eseguiti dopo il parsing completo del DOM), hanno scope isolato (le variabili non inquinano il namespace globale) e supportano nativamente la sintassi `import/export`. Le funzioni che devono essere accessibili dagli handler `onclick` dell'HTML — dove il module scope non è raggiungibile — vengono esplicitamente assegnate a `window.*` nella sezione finale del modulo.

### 5.2 Stato applicativo

Lo stato in memoria è un unico oggetto `S` dichiarato a livello di modulo:

```javascript
const S = {
  days: [], restaurants: [], checklist: [],  // contenuto da Firestore
  ckState: {},   // mappa key→boolean per la checklist, sincronizzata via onSnapshot
  notes: {},     // mappa dayId→string per le note, sincronizzata via onSnapshot
  completed: {}, // mappa dayId→boolean per i giorni segnati come fatti
  mapDone: false // flag per inizializzare Leaflet una sola volta
};
```

Questo oggetto è la singola fonte di verità in memoria. I listener `onSnapshot` lo aggiornano ogni volta che Firestore notifica una modifica e invocano le funzioni di aggiornamento del DOM corrispondenti.

---

## 6. Modello dei Dati — Firebase Firestore

Firestore è un database NoSQL documentale organizzato in *collections* e *documents*. Ogni document è un oggetto JSON con campi arbitrari. Il sistema usa cinque document fissi distribuiti in due collection.

```
firestore-root/
├── content/
│   ├── days           → { data: [...array dei 7 giorni] }
│   ├── restaurants    → { data: [...array delle aree ristoranti] }
│   └── checklist      → { data: [...array delle categorie checklist] }
└── state/
    ├── checklist      → { items: { "0-0": true, "1-3": false, ... } }
    └── notes          → { days: { "1": "testo nota", ... },
                           completed: { "2": true, ... } }
```

La collection `content` contiene i dati strutturali del viaggio e viene scritta una sola volta (al primo avvio) e letta ad ogni caricamento successivo. La collection `state` contiene lo stato interattivo condiviso e viene aggiornata in scrittura ad ogni interazione utente e in lettura continua tramite listener real-time.

La chiave usata per identificare i singoli item della checklist in `state/checklist.items` è una stringa composita nel formato `"<indice_categoria>-<indice_item>"`, generata dinamicamente durante `renderCk()`. Ad esempio, `"2-4"` identifica il quinto elemento (indice 4) della terza categoria (indice 2). Questa convenzione mantiene il modello piatto e rende ogni aggiornamento atomico: scrivere `items["2-4"] = true` modifica un solo campo del documento senza sovrascrivere lo stato degli altri item.

---

## 7. Flusso Applicativo Completo

Il diagramma seguente copre tutte le casistiche del ciclo di vita dell'applicazione, dalla prima apertura alle interazioni utente successive.

```mermaid
flowchart TD
    A([Browser apre l'URL]) --> B[Parsing HTML e CSS]
    B --> C[Leaflet caricato come script sincrono globale]
    C --> D[Modulo ES eseguito — import statici risolti]
    D --> E[renderHero — intestazione visiva immediata]
    E --> F{FIREBASE_CONFIG.apiKey === 'REPLACE_ME'?}
    F -- Sì --> ERR1([Overlay: messaggio di configurazione\nnessuna chiamata Firebase])
    F -- No --> G[initializeApp + getFirestore]
    G --> H[seedIfNeeded: getDoc content/days]
    H --> I{Il document esiste?}
    I -- No: primo avvio --> J[Promise.all: 5 setDoc in parallelo\ncontent/days, restaurants, checklist\nstate/checklist, state/notes]
    J --> K[loadContent: 3 getDoc in parallelo]
    I -- Sì: avvio successivo --> K
    K --> L[S.days, S.restaurants, S.checklist popolati]
    L --> M[listenRealtime: 2 onSnapshot attivati]
    M --> N[renderAll: renderDays, renderRest, renderCk]
    N --> O[hideLoading: overlay rimosso con fade]
    O --> P([App operativa — entrambi i dispositivi connessi])

    P --> Q{Interazione utente}
    Q --> R[Toggle checklist item]
    Q --> S[Salva nota su giorno]
    Q --> T[Segna giorno come fatto]
    Q --> U[Apre tab Mappa]

    R --> R1[Aggiornamento ottimistico UI]
    R1 --> R2[updateDoc state/checklist items.key]
    R2 --> R3{Scrittura riuscita?}
    R3 -- Sì --> R4[onSnapshot propaga a partner]
    R3 -- No --> R5[Rollback UI — stato precedente ripristinato]

    S --> S1[onblur textarea → saveNote]
    S1 --> S2[setDoc state/notes merge:true]
    S2 --> S3[onSnapshot propaga a partner]

    T --> T1[writeCompleted: setDoc state/notes.completed]
    T1 --> T2[onSnapshot: updateNotesUI su entrambi i device]

    U --> U1{S.mapDone === false?}
    U1 -- Sì --> U2[Leaflet L.map inizializzato\nmarker e polyline aggiunti]
    U2 --> U3[S.mapDone = true]
    U1 -- No --> U4([Mappa già pronta — nessuna re-inizializzazione])
```

### 7.1 Fase di Inizializzazione

Quando il browser carica `index.html`, il parser HTML incontra il tag `<script src="...leaflet.min.js">` privo di attributi `defer` o `async` e lo esegue in modo sincrono, rendendo disponibile l'oggetto globale `L` prima che qualsiasi altro script venga eseguito. Subito dopo, incontra `<script type="module">` che viene automaticamente *deferred*: il modulo viene scaricato in parallelo ma eseguito solo a parsing del documento completato.

Il modulo parte risolvendo i tre `import` statici. I due import Firebase scaricano i moduli dell'SDK dalla CDN di Google; il terzo import carica `trip.config.js` dalla stessa origine. Solo dopo che tutti e tre i moduli sono stati risolti, l'esecuzione del corpo del modulo inizia con la chiamata a `init()`.

`init()` invoca immediatamente `renderHero()`, che legge `TRIP_META` — già disponibile in memoria perché importato staticamente — e scrive l'HTML dell'intestazione nel DOM senza aspettare nessuna risposta di rete. Il risultato è che l'utente vede il titolo del viaggio prima ancora che Firebase risponda, riducendo la percezione di latenza.

### 7.2 Seeding Automatico al Primo Avvio

`seedIfNeeded()` esegue un singolo `getDoc` sul document `content/days`. Se il document non esiste, è il segnale che il database è vergine e che l'applicazione viene aperta per la prima volta. In questo caso, cinque `setDoc` vengono lanciati in parallelo tramite `Promise.all`:

```javascript
async function seedIfNeeded() {
  const snap = await getDoc(doc(db, 'content', 'days'));
  if (snap.exists()) return; // database già popolato, nessuna scrittura
  await Promise.all([
    setDoc(doc(db, 'content', 'days'),        { data: TRIP_DATA.days }),
    setDoc(doc(db, 'content', 'restaurants'), { data: TRIP_DATA.restaurants }),
    setDoc(doc(db, 'content', 'checklist'),   { data: TRIP_DATA.checklist }),
    setDoc(doc(db, 'state',   'checklist'),   { items: {} }),
    setDoc(doc(db, 'state',   'notes'),       { days: {}, completed: {} }),
  ]);
}
```

La chiamata `Promise.all` riduce il tempo di seed da cinque latenze di rete sequenziali a una sola latenza parallela. I document `state/checklist` e `state/notes` vengono inizializzati con strutture vuote per garantire che i successivi `updateDoc` — che presuppongono l'esistenza del document — non falliscano.

Una condizione di *race* è teoricamente possibile: se due dispositivi aprono l'applicazione simultaneamente per la prima volta, entrambi possono eseguire `seedIfNeeded()` prima che l'altro abbia completato la scrittura. In questo caso, il seed viene eseguito due volte, ma con dati identici: Firestore applica l'ultima scrittura e il risultato finale è corretto. Non si verifica corruzione né perdita di dati.

### 7.3 Caricamento dal Database

`loadContent()` legge i tre document della collection `content` in parallelo e popola `S.days`, `S.restaurants` e `S.checklist`:

```javascript
async function loadContent() {
  const [d, r, c] = await Promise.all([
    getDoc(doc(db, 'content', 'days')),
    getDoc(doc(db, 'content', 'restaurants')),
    getDoc(doc(db, 'content', 'checklist')),
  ]);
  S.days        = d.data().data;
  S.restaurants = r.data().data;
  S.checklist   = c.data().data;
}
```

Questi dati non cambiano durante la sessione. Se il contenuto del viaggio viene modificato dalla Firebase Console, la modifica diventa visibile al prossimo caricamento della pagina.

### 7.4 Attivazione dei Listener Real-Time

`listenRealtime()` attiva due listener `onSnapshot` che rimangono attivi per tutta la durata della sessione. Il primo monitora `state/checklist`, il secondo monitora `state/notes`:

```javascript
function listenRealtime() {
  onSnapshot(doc(db, 'state', 'checklist'), snap => {
    if (!snap.exists()) return;
    S.ckState = snap.data().items || {};
    updateCkUI(); // aggiorna solo i nodi DOM della checklist
  });
  onSnapshot(doc(db, 'state', 'notes'), snap => {
    if (!snap.exists()) return;
    S.notes     = snap.data().days      || {};
    S.completed = snap.data().completed || {};
    updateNotesUI(); // aggiorna badge, pulsanti e textarea di tutti i giorni
  });
}
```

`onSnapshot` mantiene una connessione WebSocket persistente con Firestore. Ogni modifica al document — da qualsiasi dispositivo — scatena la callback entro poche decine di millisecondi. I listener sono attivi su entrambi i dispositivi in parallelo: questo è il meccanismo che garantisce la sincronizzazione in tempo reale.

### 7.5 Interazioni Utente

**Checklist:** quando l'utente tocca un item, `ckTog()` esegue immediatamente un aggiornamento ottimistico del DOM — l'item cambia aspetto senza aspettare la conferma di rete — e parallelamente invia `updateDoc` a Firestore con il nuovo valore booleano nel campo `items["<key>"]`. Se la scrittura fallisce (assenza di rete, errore di regola di sicurezza), un blocco `catch` ripristina il DOM allo stato precedente e registra l'errore in console. Se ha successo, `onSnapshot` sul partner propaga automaticamente l'aggiornamento.

**Note sui giorni:** `saveNote()` viene invocata dall'evento `onblur` del textarea, cioè quando l'utente sposta il focus fuori dall'area di testo. Esegue `setDoc` con l'opzione `{ merge: true }`, che aggiorna solo il campo specificato all'interno del documento senza sovrascrivere gli altri campi esistenti. Dopo la scrittura, mostra brevemente la label "✓ Salvato" per due secondi.

**Giorno completato:** `markDone()` legge lo stato corrente da `S.completed[dayId]`, lo inverte e scrive il valore aggiornato con `setDoc` merge su `state/notes.completed`. L'`onSnapshot` del secondo listener riceve la modifica e invoca `updateNotesUI()` su entrambi i dispositivi, aggiornando badge, pulsante e opacità della card.

---

## 8. Sincronizzazione in Tempo Reale

Il diagramma seguente descrive la sequenza precisa di eventi che si verifica quando un utente toglie un elemento dalla checklist mentre il partner ha l'applicazione aperta su un secondo dispositivo.

```mermaid
sequenceDiagram
    participant U1 as Utente 1
    participant App1 as App — Device 1
    participant FS as Cloud Firestore
    participant App2 as App — Device 2
    participant U2 as Utente 2

    Note over App1,App2: Entrambi i dispositivi hanno onSnapshot attivo su state/checklist

    U1->>App1: Tocca elemento checklist (key "3-2")
    App1->>App1: Aggiornamento ottimistico DOM<br/>S.ckState["3-2"] = true
    App1->>FS: updateDoc: items["3-2"] = true
    FS-->>App1: onSnapshot callback (conferma locale)
    App1->>App1: updateCkUI() — nessun cambiamento visivo<br/>(DOM già aggiornato ottimisticamente)
    FS-->>App2: onSnapshot callback (propagazione)
    App2->>App2: S.ckState["3-2"] = true
    App2->>App2: updateCkUI() — aggiorna DOM
    App2->>U2: Item spuntato visibile su Device 2
```

Il punto critico è che l'aggiornamento ottimistico su Device 1 e la propagazione su Device 2 avvengono attraverso lo stesso meccanismo (`onSnapshot`), ma con latenze diverse: Device 1 aggiorna il DOM in modo sincrono prima della scrittura, Device 2 aggiorna il DOM solo dopo che Firestore ha ricevuto e propagato la modifica. In condizioni normali di rete mobile (latenza 50–200ms), l'esperienza su Device 2 è percepita come istantanea.

L'SDK Firestore gestisce internamente la coda delle scritture offline: se Device 1 perde la connessione mentre l'utente toglie elementi dalla checklist, le modifiche vengono accumulate localmente e trasmesse a Firestore non appena la connessione si ripristina. L'aggiornamento ottimistico garantisce che l'interfaccia rimanga coerente anche durante questa finestra offline.

---

## 9. Templatizzazione per un Nuovo Viaggio

Creare una nuova istanza dell'applicazione per un viaggio diverso è un'operazione che non richiede modifiche ad `index.html`, `firebase.json` o `.gitignore`. La procedura è la seguente.

Prima operazione: clona o fai fork della repository su GitHub e crea un nuovo branch con il nome del viaggio (ad esempio `tokyo-2026`). Questa scelta mantiene uno storico dei viaggi passati accessibile come branch separati all'interno della stessa repository, senza dover duplicare l'intero progetto.

Seconda operazione: crea un nuovo progetto Firebase dalla Console e recupera le credenziali dalla sezione *SDK setup and configuration*. Aggiorna l'oggetto `FIREBASE_CONFIG` in `trip.config.js` con i nuovi valori. Questo disaccoppia completamente il database del nuovo viaggio da quelli dei viaggi precedenti.

Terza operazione: modifica in `trip.config.js` gli oggetti `TRIP_META`, `MAP_LOCATIONS` e `TRIP_DATA.days / .restaurants / .checklist` con i contenuti del nuovo viaggio. La struttura degli oggetti rimane identica; cambiano solo i valori.

```javascript
// Esempio: nuovo viaggio, stesso schema
export const TRIP_META = {
  badge:    "Viaggio di Coppia · Primavera 2026",
  title:    "Tokyo & Kyoto",
  subtitle: "10 giorni tra tradizione e modernità",
  stats:    ["📅 10 giorni · 9 notti", "🏯 2 basi", "🌸 Fioritura dei ciliegi"]
};
```

Quarta operazione: dalla cartella del progetto, esegui `firebase use --add` per collegare il progetto locale al nuovo progetto Firebase (questo crea il file `.firebaserc` localmente, che è gitignored), poi `firebase deploy`. Al primo accesso all'URL generato, il seed automatico popolerà Firestore con i nuovi dati.

---

## 10. Versionamento su GitHub

La struttura del repository è concepita per il versionamento con Git. Il file `.gitignore` esclude intenzionalmente tre categorie di file: `.firebaserc` (binding locale al progetto Firebase, specifico per macchina e progetto), la cartella `.firebase/` (cache locale di Firebase CLI) e `node_modules/` (dipendenze installate localmente se si usa npm per la CLI).

La strategia di branching consigliata è semplice: `main` ospita il template base con i dati del viaggio Cilento come esempio di riferimento; ogni nuovo viaggio viene sviluppato su un branch dedicato (`cilento-2026`, `tokyo-20xx`, ecc.). In questo modo la repository mantiene uno storico navigabile e `main` rimane sempre un esempio funzionante da cui partire per nuovi fork.

Se si vuole che il repository sia privato — scelta raccomandata poiché `trip.config.js` contiene le credenziali Firebase — GitHub offre repository private gratuite per account personali senza limitazioni di numero.

Per condividere l'accesso alla repository con il partner, la funzione *Collaborators* di GitHub (sotto *Settings > Collaborators and teams*) consente di aggiungere un secondo utente con permessi di lettura o scrittura. Questo permette a entrambi di aprire il codice, di modificare `trip.config.js` per aggiornare note o ristoranti e di fare push — operazione che però richiede un nuovo `firebase deploy` per rendere le modifiche visibili nell'applicazione.

---

## 11. Deployment

Il deployment si esegue con Firebase CLI, uno strumento a riga di comando installabile tramite `npm install -g firebase-tools`. Una volta installato, richiede una sola autenticazione con account Google (`firebase login`) e poi opera autonomamente.

La sequenza completa per il primo deploy di un nuovo viaggio è:

```bash
npm install -g firebase-tools   # installa Firebase CLI globalmente
firebase login                  # autenticazione Google (si apre il browser)
firebase use --add              # collega la cartella al progetto Firebase creato in Console
                                # seleziona il progetto e assegna un alias (es. "default")
firebase deploy                 # carica public/ su Firebase Hosting
```

`firebase deploy` comprime e carica tutti i file dentro `public/` su Firebase Hosting, assegna un hash di versione a ciascun file e aggiorna l'URL di produzione in modo atomico. Il comando stampa l'URL finale nella forma `https://<project-id>.web.app`. Ogni deploy successivo può essere eseguito con il solo `firebase deploy`, senza ripetere login o `use`.

Per aggiornamenti frequenti al solo contenuto del viaggio (ad esempio modificare la descrizione di un ristorante), è più efficiente intervenire direttamente dalla Firebase Console sui document della collection `content`, evitando del tutto un nuovo deploy.

---

## 12. Considerazioni di Sicurezza

Firebase Hosting eroga i file su HTTPS con certificato TLS gestito automaticamente da Google senza costi aggiuntivi. La comunicazione tra i dispositivi e Firestore avviene attraverso WebSocket sicuri sulla stessa infrastruttura.

Le credenziali in `FIREBASE_CONFIG` — in particolare `apiKey` — non sono un segreto nel senso tradizionale del termine. Sono visibili nel sorgente JavaScript e in alcun modo offuscabili in un'applicazione client-side. La sicurezza in Firebase non si fonda sulla segretezza dell'API key, ma sulle *Firestore Security Rules*: regole dichiarative che definiscono chi può leggere e scrivere quale document. Per questa applicazione, il piano gratuito *Spark* attiva la modalità test con regole permissive che scadono automaticamente dopo 30 giorni. Prima della scadenza, occorre aggiornare le regole dalla Firebase Console (*Firestore > Regole*) con una configurazione permanente. Per un uso personale privato tra due persone con un URL non pubblico, le regole seguenti sono sufficienti:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Queste regole consentono lettura e scrittura a chiunque abbia l'URL dell'applicazione. Per un uso esclusivamente privato, con un URL non indicizzato e non distribuito pubblicamente, il rischio è accettabile. Se si desidera una protezione più granulare, Firebase Authentication consente di vincolare le regole a specifici account Google autenticati, ma richiede l'aggiunta dell'SDK di autenticazione e una logica di login nell'applicazione.

---

## 13. Note a Piè di Pagina

[^1]: **PWA** — Progressive Web App. Applicazione web che sfrutta le API moderne del browser per offrire un'esperienza simile a quella di un'applicazione nativa: installabile su homescreen, accessibile offline (con service worker), responsive. In questa implementazione non è presente un service worker esplicito; il termine è usato in senso lato per indicare un'applicazione web moderna fruibile da dispositivi mobili.

[^2]: **Firebase** — Piattaforma Backend-as-a-Service di Google che raggruppa servizi cloud come database real-time (Firestore), autenticazione, hosting statico, storage di file e funzioni serverless. Il piano gratuito *Spark* include: 1 GB di storage Firestore, 10 GB/mese di trasferimento su Hosting, 50.000 letture e 20.000 scritture al giorno su Firestore.

[^3]: **ESM** — ECMAScript Modules. Sistema di moduli nativo JavaScript introdotto con ES2015 (ES6). Permette di suddividere il codice in file distinti con `export` e `import` espliciti, risolti dal browser senza necessità di bundler. Attivato nei browser tramite `<script type="module">`.

[^4]: **DOM** — Document Object Model. Rappresentazione ad albero del documento HTML mantenuta in memoria dal browser. JavaScript interagisce con la pagina tramite le API del DOM, leggendo e modificando nodi, attributi e stili.

[^5]: **NoSQL** — Not Only SQL. Categoria di database che si discosta dal modello relazionale (tabelle con schema fisso). Firestore è un database documentale: i dati sono organizzati in documenti JSON annidati all'interno di collection, senza schema imposto.

[^6]: **URL** — Uniform Resource Locator. Indirizzo che identifica univocamente una risorsa su rete, nella forma `https://dominio.tld/percorso`. In questo contesto, Firebase Hosting assegna automaticamente un URL nella forma `https://<project-id>.web.app`.

[^7]: **HTTPS** — HyperText Transfer Protocol Secure. Versione cifrata di HTTP che usa TLS (Transport Layer Security) per cifrare la comunicazione tra browser e server, garantendo riservatezza e integrità dei dati trasmessi. Obbligatorio per le applicazioni che usano API moderne del browser.

[^8]: **CLI** — Command-Line Interface. Interfaccia a riga di comando. Firebase CLI è il tool ufficiale installabile tramite npm che permette di gestire progetti Firebase da terminale: autenticazione, configurazione, deploy, gestione delle regole.

[^9]: **SDK** — Software Development Kit. Insieme di librerie, strumenti e documentazione che semplificano l'integrazione con un servizio esterno. L'SDK Firebase per JavaScript espone funzioni come `initializeApp`, `getFirestore`, `onSnapshot` che astraggono le chiamate HTTP REST sottostanti all'API Firestore.

[^10]: **Leaflet** — Libreria JavaScript open-source per mappe interattive. Versione 1.9.4, caricata da CDN Cloudflare come script sincrono. Espone l'oggetto globale `L` da cui si istanziano mappe, marker, livelli tile e geometrie vettoriali.

[^11]: **CDN** — Content Delivery Network. Rete di server distribuiti geograficamente che eroga risorse statiche (script, immagini, font) dal nodo fisicamente più vicino all'utente, riducendo la latenza di download. Sia Firebase SDK che Leaflet e Google Fonts vengono caricati da CDN in questa applicazione.
