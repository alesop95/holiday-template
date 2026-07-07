# Work-log

> Append-only, in ordine cronologico inverso (la voce più recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento.

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
