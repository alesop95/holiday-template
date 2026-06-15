---
generated-from-commit: PENDING-FIRST-COMMIT
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - <glob delle aree toccate dalla feature attiva>
last-verified-commit: PENDING-FIRST-COMMIT
stato: in pianificazione
---

# Lavoro in corso

> La fonte di verità su cosa è fatto resta `memory/index.md` e il work-log, non le spunte di
> questo file. Ogni feature si descrive con lo schema fisso sotto, così il lavoro pendente è
> leggibile senza ricostruire il contesto da capo.

## Feature: integrazione del codice consegnato da `handoff/` nella struttura definitiva

Cosa fa: il codice dell'app (travel app Firebase + Leaflet) è stato consegnato da una sessione
Claude precedente nella cartella `handoff/`. Va portato nella struttura definitiva del repository
prevista dalla sua stessa documentazione (`handoff/README.md`, sezione 3): `public/index.html`,
`public/trip.config.js`, `firebase.json`, `.gitignore`, `README.md` in radice.

File da creare:

```
<da definire in sessione: collocazione finale di public/, README.md di radice, ecc.>
```

File da modificare:

```
<da definire: eventuale adattamento dei percorsi e del .gitignore di radice>
```

Definition of done:

- [ ] Struttura del repository allineata alla sezione 3 di `handoff/README.md`
- [ ] Schede di `context/` (STACK, design-and-security, deployment, dev-testing) popolate dal codice reale
- [ ] Diagrammi Mermaid del README eventualmente migrati in `context/diagrams/`
- [ ] `sync-context` eseguita dopo il primo commit per ancorare i frontmatter a HEAD

Domande aperte:

Si conferma la struttura `public/` proposta dal README o si adotta un layout diverso? La cartella
`handoff/` va rimossa dopo l'integrazione o conservata come riferimento? Da risolvere a inizio
della sessione di integrazione.

## Riconciliazione

Ultima verifica: 2026-06-15 al commit PENDING-FIRST-COMMIT.
