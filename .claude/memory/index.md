# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. È la fonte di verità su cosa è fatto,
> non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
Data snapshot:         2026-07-06
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | fb591e5 | aggiornata e committata |
| design-and-security.md | fb591e5 | popolata in sessione (2026-07-06), non ancora committata |
| deployment.md | fb591e5 | popolata in sessione (2026-07-06), non ancora committata |
| dev-testing.md | f8a0c3d | da popolare (covers-paths ancora placeholder; nessun test nel repo oggi) |
| current-work.md | fb591e5 | aggiornata e committata |
| roadmap.md | fb591e5 | aggiornata e committata (covers-paths vuoto per scelta: direzione, non area di codice) |

## Punto di ripresa

Struttura del repository allineata al modello a sotto-cartella per viaggio: `public/index.html`
(shell canonica) + `trips/cilento-2026/` (primo viaggio, autosufficiente, ora con credenziali
Firebase reali, non più `REPLACE_ME`) + `README.md` di radice riscritto. `handoff/` è stata
rimossa. La ricerca sulle funzionalità future (comparatore voli/alloggi/trasporto + itinerary
builder) è confluita in `roadmap.md`; i tre file sorgente in `_notes/` sono stati eliminati.
Avviato lo scaffold del backend `services/flight-search/` (Fase 1 della roadmap), non ancora
eseguito contro un ambiente reale né deployato. I tre commit `aeaeb84`/`5e52006`/`fb591e5` sono
committati e pushati su `origin/main`.

Da quel punto, in sessione, sono state fatte ulteriori modifiche non ancora committate: database
Firestore creato su Console (`viaggio-new`, location `eur3`, versione Standard); regole di
sicurezza permanenti distribuite via CLI da `firestore.rules` + `firebase.json` di radice (ADR-004),
eliminando lo scadenzario a 30 giorni della modalità di test; `.gitignore` esteso con pattern
Python e `.env`; `design-and-security.md` e `deployment.md` popolate (quest'ultima include un
confronto verificato con `E:\my-wedding-day`, altro progetto sulla stessa macchina, sui motivi
strutturali per cui i due usano modelli di deploy Firebase opposti); `trip.config.js` di Cilento
completato con le credenziali Firebase reali (`apiKey`, `storageBucket`, `messagingSenderId`,
`appId`).

Prossima azione: committare tutto il lavoro di questa sessione non ancora versionato
(`firestore.rules`, `firebase.json` di radice, `.gitignore`, `README.md`, `design-and-security.md`,
`deployment.md`, `decisions.md`, `trips/cilento-2026/trip.config.js`, questo file). Poi verificare
l'app reale aprendo l'URL di hosting dopo un primo `firebase deploy` da `trips/cilento-2026/`
(mai ancora eseguito in questa sessione). Resta da popolare `dev-testing.md`. Da decidere dove
deployare `services/flight-search/` e da eseguirne una prova reale.
