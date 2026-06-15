# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. È la fonte di verità su cosa è fatto,
> non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: PENDING-FIRST-COMMIT
Data snapshot:         2026-06-15
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | PENDING-FIRST-COMMIT | da popolare |
| design-and-security.md | PENDING-FIRST-COMMIT | da popolare |
| deployment.md | PENDING-FIRST-COMMIT | da popolare |
| dev-testing.md | PENDING-FIRST-COMMIT | da popolare |
| current-work.md | PENDING-FIRST-COMMIT | da popolare |
| roadmap.md | PENDING-FIRST-COMMIT | da popolare |

## Punto di ripresa

Sistema inizializzato in greenfield; il codice dell'app è ancora in `handoff/` (consegnato da una
sessione Claude precedente). Prossima azione: l'utente esegue il primo commit, poi si invoca la
skill `sync-context` per sostituire ogni `PENDING-FIRST-COMMIT` con l'hash di HEAD. Dopodiché si
integra il contenuto di `handoff/` nella struttura definitiva del repository e si popolano le
schede di `context/` leggendo il codice reale.
