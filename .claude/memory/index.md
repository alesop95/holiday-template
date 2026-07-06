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
| deployment.md | f8a0c3d | da popolare (covers-paths ancora placeholder, non affinato) |
| dev-testing.md | f8a0c3d | da popolare (covers-paths ancora placeholder, non affinato) |
| current-work.md | fb591e5 | aggiornata e committata |
| roadmap.md | fb591e5 | aggiornata e committata (covers-paths vuoto per scelta: direzione, non area di codice) |

## Punto di ripresa

Struttura del repository allineata al modello a sotto-cartella per viaggio: `public/index.html`
(shell canonica) + `trips/cilento-2026/` (primo viaggio, autosufficiente) + `README.md` di radice
riscritto. `handoff/` è stata rimossa. La ricerca sulle funzionalità future (comparatore voli/
alloggi/trasporto + itinerary builder) è confluita in `roadmap.md`; i tre file sorgente in
`_notes/` sono stati eliminati. Avviato lo scaffold del backend `services/flight-search/` (Fase 1
della roadmap), non ancora eseguito contro un ambiente reale né deployato. I tre commit
`aeaeb84`/`5e52006`/`fb591e5` sono committati e pushati su `origin/main`.

Da quel punto, in sessione, sono state fatte ulteriori modifiche non ancora committate: database
Firestore creato su Console (`viaggio-new`, location `eur3`, versione Standard); regole di
sicurezza permanenti distribuite via CLI da `firestore.rules` + `firebase.json` di radice (ADR-004),
eliminando lo scadenzario a 30 giorni della modalità di test; `.gitignore` esteso con pattern
Python e `.env`; `design-and-security.md` popolata.

Prossima azione: l'utente sta recuperando da Firebase Console i campi `apiKey`, `storageBucket`,
`messagingSenderId`, `appId` per completare `trips/cilento-2026/trip.config.js` (ancora
`REPLACE_ME`). Dopo, va committato tutto il lavoro di questa sessione non ancora versionato
(`firestore.rules`, `firebase.json` di radice, `.gitignore`, `README.md`, `design-and-security.md`,
`decisions.md`, questo file). Restano da popolare `deployment.md` e `dev-testing.md` (covers-paths
ancora il placeholder del template, mai affinato). Da decidere dove deployare
`services/flight-search/` e da eseguirne una prova reale.
