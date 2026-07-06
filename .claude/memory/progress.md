# Work-log

> Append-only, in ordine cronologico inverso (la voce più recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento. Qui confluisce anche il log di riconciliazione dei
> documenti `.docx`, con il nome del documento sorgente e l'esito, così la data di allineamento
> sopravvive a un clone.

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
