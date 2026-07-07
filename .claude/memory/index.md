# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. È la fonte di verità su cosa è fatto,
> non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: 98e4395436dbbef21198cdf245cf49813acfe324
Data snapshot:         2026-07-07
```

Nota importante per chi riprende: la storia Git precedente a questo commit è stata riscritta
(`git filter-repo`, ADR-005) per bonificare una `apiKey` Firebase esposta pubblicamente. Gli hash
dei commit antecedenti a quell'operazione non coincidono più con eventuali riferimenti più vecchi
di questo file o della chat. Non fidarsi di hash citati altrove precedenti al 2026-07-07.

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | fb591e5 | popolata, committata (hash pre-riscrittura storia, contenuto valido) |
| design-and-security.md | fb591e5 | popolata, committata (hash pre-riscrittura storia, contenuto valido) |
| deployment.md | fb591e5 | popolata, committata (hash pre-riscrittura storia, contenuto valido) |
| dev-testing.md | 98e4395 | popolata in sessione (2026-07-07), non ancora committata |
| current-work.md | 98e4395 | aggiornata in sessione (2026-07-07), non ancora committata |
| roadmap.md | 98e4395 | aggiornata in sessione (2026-07-07), non ancora committata |

## Punto di ripresa

**Frontend**: struttura a sotto-cartella per viaggio (`public/index.html` shell canonica +
`trips/cilento-2026/`), deployato e funzionante su `https://viaggio-new.web.app` con dati reali,
palette ispirata a WeRoad, font Poppins/DM Sans, senza emoji (per scelta esplicita, da replicare
per ogni vacanza futura). Un solo progetto Firebase condiviso (`viaggio-new`), dati Firestore
namespaced per `TRIP_ID`. Cache Hosting disabilitata su HTML/JS (altrimenti un anno di sviluppo
attivo si scontra con la cache di un'ora di default).

**Incidente di sicurezza chiuso** (ADR-005): una `apiKey` Firebase è finita esposta nel
repository pubblico; risolto con restrizione della chiave su Google Cloud Console (referrer HTTP
+ 4 API invece di 25) e bonifica della storia Git (`git filter-repo`, force-push), entrambe
verificate indipendentemente, non assunte dall'output dell'utente.

**Backend, due servizi indipendenti, entrambi Python/FastAPI**: `services/flight-search/` (Fase
1) — `fast_flights` (Google Flights scraping) verificato live e funzionante; `Kiwi Tequila`
scritto come seconda fonte ma non ancora verificato live (manca la chiave, registrazione in
corso); query in parallelo, cache TTL, ordinamento per prezzo; 21 test, tutti passanti.
`services/stay-search/` (Fase 2) — `pyairbnb` (Airbnb scraping) verificato live e funzionante,
con geocodifica via Nominatim; 10 test, tutti passanti; nessuna seconda fonte alloggi individuata
(domanda aperta). **Amadeus abbandonato** (ADR-006): il portale self-service chiude il 17 luglio
2026, adapter scritto e poi rimosso per intero, non ritentare.

Nessuno dei due backend è collegato al frontend né deployato da nessuna parte: girano solo in
locale con `uvicorn`. Questa è la prossima decisione strutturale in sospeso, non ancora presa.

Prossima azione dichiarata dall'utente: finire tutto lo sviluppo di puro codice possibile prima
di tornare ai passi manuali (registrazione Kiwi Tequila, poi eventualmente la scelta e messa in
opera dell'hosting dei due backend). Committare il lavoro descritto in questa voce se non ancora
fatto al momento della lettura (controllare `git status` prima di assumere).
