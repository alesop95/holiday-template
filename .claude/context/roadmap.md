---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths: []
last-verified-commit: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
---

# Roadmap

> Direzione e priorità del progetto. Tracciata. Non è il work-log: qui sta dove si va, non cosa è
> già stato fatto.

## Direzione

L'obiettivo di medio termine è evolvere l'applicazione da semplice visualizzatore statico di un
itinerario già scritto a comparatore multi-fonte di voli, alloggi e trasporto terra, affiancato a
un *itinerary builder*[^1] capace di suggerire punti di interesse (*POI*[^2]) e ottimizzare l'ordine
di visita giornaliero. La direzione nasce dalla ricerca tecnica condotta in una sessione precedente
(sintetizzata qui sotto; il documento di ricerca originale, dopo questa sintesi, è stato eliminato
perché il suo contenuto operativo vive ormai in questa scheda) e resta vincolata al requisito di
partenza del progetto: uso privato di coppia, a costo zero, senza dipendere da servizi partner-only.

## Priorità

La sequenza di fasi, in ordine di dipendenza:

1. *Motore di ricerca voli* — `services/flight-search/`, avanzato. Fonte primaria:
   reverse-engineering diretto di Google Flights (`fast-flights` di AWeirdDev, nessuna chiave
   richiesta), verificata live e funzionante. Fonte secondaria: **Kiwi Tequila**, non più Amadeus
   (vedi nota sotto), per ricerche multi-città e self-transfer, registrazione gratuita immediata
   senza OAuth, scritta ma non ancora verificata live. Query in parallelo, cache in-memory con
   TTL breve, ordinamento per prezzo: fatti. Schema di normalizzazione comune: `FlightOffer`.
2. *Motore di ricerca alloggi* — `services/stay-search/`, avanzato, una sola fonte per scelta
   informata. La fonte primaria originariamente prevista, Amadeus Hotel Search/List API, non è
   più disponibile per lo stesso motivo del punto 1. Fonte attiva: `pyairbnb` di johnbalvin per
   Airbnb (nessuna API ufficiale esiste; è reverse-engineering della GraphQL interna, rischio
   *ToS*[^3] più alto delle altre fonti, usata senza login con account personale), verificata
   live e funzionante, con cache e geocodifica del nome località via Nominatim. Una seconda fonte
   (Booking.com) è stata cercata esplicitamente e scartata: nessuna libreria HTTP-diretta
   keyless equivalente a `pyairbnb` esiste, solo scraper community basati su browser headless
   (Playwright), valutati troppo fragili/pesanti per il beneficio. Schema di normalizzazione
   comune: `StayOffer`.

**Nota — Amadeus for Developers non è più una fonte disponibile.** Il portale self-service
(quello gratuito, senza approvazione business, su cui si basava sia il punto 1 sia il punto 2)
viene chiuso da Amadeus il 17 luglio 2026: nuove registrazioni già sospese, chiavi esistenti
disattivate a quella data. Verificato con fonti indipendenti (PhocusWire, Tragento), non solo
dall'annuncio sul sito. Un adapter Amadeus per i voli era stato scritto e poi rimosso in
`services/flight-search/` quando è emersa questa notizia; non ritentare la stessa via per hotel
o voli finché non cambia lo stato del portale Enterprise (a pagamento, richiede account manager,
fuori scope per un progetto privato).
3. *Layer comparatore* — fatto a due livelli. Dentro ogni servizio: query in parallelo dove c'è
   più di un provider, fault tolerance (un provider che fallisce non blocca gli altri),
   aggregazione, ordinamento per prezzo, cache TTL (`flight-search`, `stay-search`, `poi-search`).
   Tra i servizi: nuovo `services/trip-planner/`, un endpoint unico (`/api/trip-plan`) che chiama
   i tre servizi in parallelo (`asyncio.gather`) e restituisce un'unica risposta
   `{flights, stays, points_of_interest, errors}`, verificato live con i quattro servizi in
   esecuzione reale insieme e con un test esplicito di tolleranza ai guasti (un servizio a valle
   spento non fa fallire l'intero piano). Manca ancora una stima di costo totale che sommi un
   volo + un alloggio scelti dall'utente: oggi restituisce liste separate, non un totale.
4. *Itinerary builder* — avviato con `services/poi-search/`. Fonte POI: **Overpass API**
   (OpenStreetMap) soltanto, non OpenTripMap — scelta deliberata: Overpass non richiede alcuna
   chiave, mentre OpenTripMap sì (un passo manuale in più per lo stesso tipo di dato, dei tag
   `tourism`/`historic` di OpenStreetMap), verificata live e funzionante (Marina di Camerota:
   Grotta Azzurra, Belvedere di Cala Fortuna, spiagge — nomi in parte già presenti
   nell'itinerario scritto a mano di Cilento, buon segnale di qualità). Il primo pezzo del data
   model Trip → Days → Places è ora scritto: la scheda "Pianifica" della shell chiama
   `trip-planner` e salva un risultato scelto su un giorno specifico direttamente su Firestore dal
   browser, senza Admin SDK nel backend (ADR-007) — verificato live lato backend (CORS, forma
   della risposta), non ancora verificato in un browser reale lato Firestore (dettaglio in
   `current-work.md`). Resta non iniziato il routing/ottimizzazione del percorso giornaliero
   (OpenTripPlanner o GraphHopper, entrambi self-hostabili in Docker).
5. *Rifinitura* — non iniziato. Export dell'itinerario, price alert opzionali, gestione multivaluta.

Non conviene inseguire integrazioni ufficiali con Skyscanner o Booking.com: entrambe le API sono
partner-only, richiedono revisione business e non sono percorribili per un progetto privato in fase
iniziale.

Sullo stack di hosting per i servizi backend introdotti da queste fasi (a differenza del frontend
statico attuale, che resta su Firebase), la ricerca originale raccomandava **self-hosting su un
dispositivo sempre acceso** (mini PC, NAS, Raspberry Pi) con Docker Compose come combinazione a
costo zero indipendente dal tempo/volume d'uso, con il cloud free-tier (Vercel + Render +
Supabase) come fallback. **Decisione presa (ADR-008, `memory/decisions.md`)**: Render, non il
self-hosting — l'utente ha già un account Render collegato a GitHub, e la scelta risolve anche un
problema emerso nel primo test della scheda "Pianifica" (`current-work.md`): la shell su HTTPS non
può chiamare un backend `http://localhost` per via del blocco *mixed content* dei browser, mentre
un backend Render è già HTTPS. `render.yaml` (radice del repository) descrive i quattro servizi
come Web Service Python; creazione effettiva su Render non ancora eseguita (passo manuale). Limite
noto del piano free: pausa dopo ~15 minuti di inattività, ~50 secondi di cold start alla richiesta
successiva (fino a ~100 secondi per una ricerca che li coinvolge tutti e quattro in sequenza di
risveglio) — giudicato accettabile dall'utente per il pattern d'uso reale (ricerca occasionale
durante la pianificazione, non accesso continuo), nessun meccanismo di keep-alive introdotto
deliberatamente per non aggiungere infrastruttura non necessaria. Per un'eventuale app mobile, la raccomandazione è una *PWA* installabile
invece di un'app nativa separata, per restare a costo zero senza account developer a pagamento;
solo se in futuro servissero notifiche push native o accesso a sensori conviene valutare React
Native + Expo (free tier EAS sufficiente per un uso personale).

## Idee e ipotesi da verificare

Tutto questo elenco proviene da una ricerca web di una sessione precedente (luglio 2026) e non è
stato verificato in questa sessione: prima di integrare una fonte dati, va confermato lo stato
attuale di pricing, limiti di free tier e disponibilità, perché tutte le fonti citate cambiano
condizioni con una certa frequenza.

Repository di riferimento architetturale da studiare prima di scrivere il layer comparatore:
`MikkoParkkola/trvl` (server *MCP*[^5] con 43 tool, aggrega voli/hotel/trasporto terra senza
chiave per la maggior parte dei provider — utile soprattutto per capire come normalizzano le
risposte dei vari provider in uno schema unico), `borski/travel-hacking-toolkit` (collezione di
skill Claude Code/Codex installabili per singole fonti dati) e `mauriceboe/TREK` (self-hosted trip
planner con collaborazione realtime, mappe Leaflet/Mapbox, route optimization e MCP integrato —
il progetto più vicino, come *UX*[^6] finale, a un itinerary builder completo; da valutare se
prendere solo a riferimento di data model o effettivamente estendere).

Considerazione legale da verificare caso per caso prima di ogni integrazione: gran parte delle
fonti voli/alloggi più utili (Google Flights, Airbnb) non hanno API pubblica ufficiale, quindi le
librerie che le interrogano fanno reverse-engineering di endpoint non documentati. Per uso
strettamente privato e a basso volume il rischio pratico è considerato basso dalla ricerca
originale, ma resta un rischio contrattuale (ban IP o account) da mitigare con cache aggressiva,
backoff e un adapter pattern per fonte, così una fonte che si rompe si sostituisce senza riscrivere
l'applicazione.

[^1]: **Itinerary builder** — componente applicativo che assiste nella costruzione di un
itinerario di viaggio, tipicamente suggerendo punti di interesse e ottimizzando l'ordine di visita
giornaliero in base a posizione geografica e tempi di spostamento.

[^2]: **POI** — Point of Interest. Luogo geografico rilevante per un visitatore (monumento,
ristorante, spiaggia, museo), tipicamente restituito da un servizio di dati geografici con nome,
coordinate e categoria.

[^3]: **ToS** — Terms of Service. Termini di servizio contrattuali di una piattaforma; la loro
violazione (es. scraping non autorizzato) è un rischio contrattuale verso quella piattaforma, non
automaticamente un illecito, ma varia per giurisdizione e tipo di dato.

[^4]: **PaaS** — Platform as a Service. Categoria di servizi cloud che astrae l'infrastruttura e
fa girare codice applicativo dietro un free tier o un piano a consumo (es. Render, Vercel, Fly.io).

[^5]: **MCP** — Model Context Protocol. Standard che permette a un client AI di parlare con
sistemi esterni attraverso un'interfaccia comune di tool, risorse e prompt.

[^6]: **UX** — User Experience. L'esperienza complessiva di un utente nell'uso di un prodotto
digitale: usabilità, chiarezza del flusso, percezione di qualità.
