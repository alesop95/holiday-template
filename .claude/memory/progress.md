# Work-log

> Append-only, in ordine cronologico inverso (la voce più recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento. Qui confluisce anche il log di riconciliazione dei
> documenti `.docx`, con il nome del documento sorgente e l'esito, così la data di allineamento
> sopravvive a un clone.

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
