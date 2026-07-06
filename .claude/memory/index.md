# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. È la fonte di verità su cosa è fatto,
> non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
Data snapshot:         2026-07-06
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | f8a0c3d | popolata in sessione (2026-07-06), non ancora committata |
| design-and-security.md | f8a0c3d | da popolare |
| deployment.md | f8a0c3d | da popolare |
| dev-testing.md | f8a0c3d | da popolare |
| current-work.md | f8a0c3d | aggiornata in sessione (2026-07-06), non ancora committata |
| roadmap.md | f8a0c3d | popolata in sessione (2026-07-06), non ancora committata |

Nota: il commit di riferimento (`f8a0c3d`) precede le modifiche di questa sessione. Le schede
segnate "non ancora committata" descrivono uno stato del codice più avanzato di quello dell'HEAD
attuale; `sync-context` andrà rilanciata dopo il prossimo commit dell'utente per bumpare
`last-verified-commit` sulle schede coerentemente con il nuovo HEAD.

## Punto di ripresa

Struttura del repository allineata al modello a sotto-cartella per viaggio: `public/index.html`
(shell canonica) + `trips/cilento-2026/` (primo viaggio, autosufficiente) + `README.md` di radice
riscritto. `handoff/` è stata rimossa. La ricerca sulle funzionalità future (comparatore voli/
alloggi/trasporto + itinerary builder) è confluita in `roadmap.md`; i tre file sorgente in
`_notes/` sono stati eliminati. Avviato lo scaffold del backend `services/flight-search/` (Fase 1
della roadmap), non ancora eseguito contro un ambiente reale né deployato.

Prossima azione: l'utente committa le modifiche di questa sessione (nulla è stato committato
automaticamente, per vincolo di progetto), poi incolla in `trips/cilento-2026/trip.config.js` i
campi Firebase ancora `REPLACE_ME` (`apiKey`, `storageBucket`, `messagingSenderId`, `appId`) dal
progetto Firebase `viaggio-new`. Restano da popolare `design-and-security.md` e `dev-testing.md`
leggendo il codice reale, e da decidere dove deployare `services/flight-search/`.
