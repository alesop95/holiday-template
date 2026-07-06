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

1. *Motore di ricerca voli* — in corso, scaffold iniziale in `services/flight-search/`. Fonte
   primaria scelta: reverse-engineering diretto di Google Flights (via librerie come `fli` di
   punitarani o `fast-flights` di AWeirdDev, nessuna chiave richiesta), da affiancare in una fase
   successiva a Amadeus Flight Offers Search (API self-service ufficiale, free tier reale) come
   fonte di validazione prezzi e a Kiwi Tequila per ricerche multi-città e self-transfer. Schema
   di normalizzazione comune: `FlightOffer`.
2. *Motore di ricerca alloggi* — non iniziato. Fonte primaria: Amadeus Hotel Search/List API
   (stesso account OAuth del motore voli). Fonte secondaria: `pyairbnb` di johnbalvin per Airbnb
   (nessuna API ufficiale esiste; è reverse-engineering della GraphQL interna, rischio *ToS*[^3]
   più alto delle altre fonti, da usare senza login con account personale). Schema di
   normalizzazione comune: `StayOffer`.
3. *Layer comparatore* — non iniziato. Endpoint unico che interroga i provider disponibili in
   parallelo, aggrega, deduplica e ordina i risultati; cache con TTL breve per non interrogare i
   prezzi ad ogni refresh.
4. *Itinerary builder* — non iniziato. Data model Trip → Days → Places/Reservations. Fonti POI:
   OpenTripMap (free tier) e Overpass API (OpenStreetMap, gratuita ma con rate limit sui server
   pubblici condivisi). Routing e ottimizzazione del percorso giornaliero: OpenTripPlanner o
   GraphHopper, entrambi self-hostabili in Docker.
5. *Rifinitura* — non iniziato. Export dell'itinerario, price alert opzionali, gestione multivaluta.

Non conviene inseguire integrazioni ufficiali con Skyscanner o Booking.com: entrambe le API sono
partner-only, richiedono revisione business e non sono percorribili per un progetto privato in fase
iniziale.

Sullo stack di hosting per i servizi backend introdotti da queste fasi (a differenza del frontend
statico attuale, che resta su Firebase), la ricerca raccomanda **self-hosting su un dispositivo
sempre acceso** (mini PC, NAS, Raspberry Pi) con Docker Compose — FastAPI, Postgres, Redis, e
OpenTripPlanner/GraphHopper nello stesso compose, accesso remoto via Tailscale — perché è l'unica
combinazione che resta a costo zero indipendentemente dal tempo e dal volume d'uso, a differenza dei
free tier dei PaaS[^4] cloud (Fly.io e Railway hanno già eliminato i propri free tier permanenti;
Render e Supabase li mantengono ma con spin-down o pausa dopo inattività). L'alternativa cloud
free-tier (Vercel + Render + Supabase, con un ping periodico via GitHub Actions per evitare la
pausa di Supabase) resta una via di fallback valida se non si dispone di un dispositivo proprio
sempre acceso. Per un'eventuale app mobile, la raccomandazione è una *PWA* installabile invece di
un'app nativa separata, per restare a costo zero senza account developer a pagamento; solo se in
futuro servissero notifiche push native o accesso a sensori conviene valutare React Native + Expo
(free tier EAS sufficiente per un uso personale).

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
