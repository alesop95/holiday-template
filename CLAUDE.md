# holiday-template

> Istruzioni di team, versionate. Questo file è l'indice del progetto: indicizza i soli file
> satellite tracciati e descrive la procedura di ripresa. Le preferenze personali vivono in
> `CLAUDE.local.md`, ignorato da git, non qui.

## Cos'è questo progetto

Template di una web app per la pianificazione condivisa di viaggi di coppia: itinerario giorno
per giorno, mappa Leaflet delle tappe, elenco ristoranti per area e checklist sincronizzata in
tempo reale tra due dispositivi tramite Firebase Firestore, con hosting statico su Firebase
Hosting. La struttura applicativa (`index.html`) è invariante tra un viaggio e l'altro; il
contenuto del singolo viaggio vive in `trip.config.js`. La documentazione tecnica di partenza,
prodotta in una sessione Claude precedente, è in `handoff/README.md`.

Nota: al momento dell'inizializzazione il codice dell'app vive ancora nella cartella `handoff/`,
così come consegnata dalla sessione precedente. La sua integrazione nella struttura definitiva
del repository (es. `public/`) è il primo lavoro da svolgere ed è descritta in
`.claude/context/current-work.md` e `.claude/memory/index.md`.

## Procedura di ripresa in una sessione nuova

Lo stato del progetto è interamente recuperabile su disco. All'inizio di una sessione si segue
questo percorso fisso. Si legge per primo `.claude/memory/index.md`, che dà branch, commit di
riferimento, stato di verifica di ogni scheda e punto di ripresa. Si legge poi
`.claude/context/current-work.md` se c'è una feature attiva, per sapere cosa è in lavorazione e
quali sono i TODO e i limiti d'ambiente. Si invoca la skill `sync-context` per verificare il
drift tra schede e codice, e si leggono solo le schede pertinenti al task, mai tutte insieme. Il
work-log `.claude/memory/progress.md` e il registro `.claude/memory/decisions.md` forniscono la
storia e le decisioni quando servono. Il materiale grezzo sotto `_notes/` si apre solo per
verificare un requisito originale.

## Indice dei file satellite tracciati

Memoria e meta-stato, sotto `.claude/memory/`, letti sempre a inizio sessione.

```
.claude/memory/index.md       snapshot e tabella di sincronizzazione, da leggere per primo
.claude/memory/progress.md    work-log append-only di passi e riconciliazioni
.claude/memory/decisions.md   registro ADR-lite delle decisioni architetturali
```

Schede tecniche, sotto `.claude/context/`, con frontmatter di riconciliazione.

```
.claude/context/STACK.md                stack, flussi di codice, ruolo architetturale dei file
.claude/context/design-and-security.md  paradigmi di design e sicurezza applicativa
.claude/context/deployment.md           livelli test e produzione, hosting, comandi
.claude/context/dev-testing.md          test di sviluppo, runner, rotte mockate, hook
.claude/context/current-work.md         feature attiva, definition of done, domande aperte
.claude/context/roadmap.md              direzione e priorità
```

Regole modulari caricate su necessità, sotto `.claude/rules/`, e skill richiamabili, sotto
`.claude/skills/`. Lo standard di sistema completo è in `.claude/PROJECT-SYSTEM.md`.

## Vincoli di team

Le operazioni di `git add`, commit e push restano sempre manuali dell'utente: l'agente prepara i
file, non committa. L'identità git è impostata a livello locale del repo secondo
`.claude/rules/git-identity-and-repo.md`: identità personale `alesop95`, remoto agganciato
all'alias SSH `github-personal` verso `alesop95/holiday-template`. Lo stile di documentazione e
di interazione è quello di `.claude/rules/interaction-style.md`. Claude non scrive autonomamente
nei file di memoria e di contesto: li aggiorna solo su richiesta esplicita, così il versionamento
resta sotto controllo umano.
