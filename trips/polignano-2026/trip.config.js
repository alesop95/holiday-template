/**
 * trip.config.js - viaggio: polignano-2026
 *
 * File di configurazione del viaggio. È l'unico file (insieme a questa intera
 * cartella trips/polignano-2026/) che cambia tra un viaggio e l'altro. index.html
 * non va mai modificato per un nuovo viaggio.
 *
 * Nota di onestà sui contenuti: la prima stesura di questo file (giorni, ristoranti,
 * consigli) veniva da conoscenza generale, non da una ricerca dedicata. Una seconda
 * passata (2026-07-13, ricerca web sequenziale su richiesta esplicita dell'utente) ha
 * verificato con fonti reali e citabili, ORA VISIBILI COME LINK CLICCABILI dentro
 * l'app stessa (non solo in questi commenti): la sosta a Bari (Giorno 1, scheda
 * Itinerario), Grotta Palazzese e Pescaria (Giorno 2 e scheda Ristoranti), le spiagge
 * meno affollate di Ostuni e Monopoli (Giorni 4 e 5), il consumo reale dell'Alfa Romeo
 * Giulietta diesel usato per il carburante in costEstimate. Una terza passata
 * (2026-07-13, stessa modalità sequenziale) ha coperto Alberobello (Rione Monti/Aia
 * Piccola, orari consigliati, Trullo Sovrano con prezzo reale €2,50), Ostuni (Piazza
 * della Libertà, parcheggio ZTL, e un fatto rilevante: la Concattedrale risulta chiusa
 * per restauro secondo un aggiornamento di aprile 2026 - da riverificare sul posto,
 * non assumere che abbia riaperto) e Monopoli (Castello di Carlo V, Piazza Giuseppe
 * Garibaldi). Le voci ristoranti di Alberobello e Ostuni restano indicative (tipo di
 * cucina, non un nome verificato), non coperte da nessuna delle passate finora.
 *
 * Una quarta passata (2026-07-13) integra un'esperienza diretta e reale dell'utente,
 * che questi luoghi li ha già visitati: Super Mago del Gelo e il consiglio sull'orario
 * di Alberobello (Giorno 1 e 3), il molo e il panino al polpo di Monopoli (Giorno 5),
 * il giro con l'ape calessino sotto le mura di Ostuni (Giorno 4), la rassicurazione su
 * Bari (Giorno 1) e le gite extra sulla via del ritorno o se restano giorni liberi
 * (Trani, Locorotondo, Grotte di Castellana, Lecce, Brindisi, Otranto - Giorno 6). Non
 * è una fonte web citabile con un link: è testimonianza diretta di chi scrive questo
 * file, marcata come tale ovunque compare, non presentata come dato di una guida.
 */

// ─── IDENTIFICATIVO DEL VIAGGIO ────────────────────────────────────────────────

export const TRIP_ID = "polignano-2026";

// ─── FIREBASE ────────────────────────────────────────────────────────────────
// Stesso progetto Firebase condiviso di tutti i viaggi (viaggio-new): non ricreare.

export const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBMKlxbgQ4wmgwGzhvme0yH7_7xh-l14N8",
  authDomain:        "viaggio-new.firebaseapp.com",
  projectId:         "viaggio-new",
  storageBucket:     "viaggio-new.firebasestorage.app",
  messagingSenderId: "15558495838",
  appId:             "1:15558495838:web:e59d6320eff09870b96ecf"
};

// ─── COMPARATORE (backend Python, Render) ──────────────────────────────────────
// Stesso backend condiviso di tutti i viaggi (ADR-008): non ricreare.

export const TRIP_PLANNER_URL = "https://trip-planner-l2dh.onrender.com";

// Viaggio esplicitamente in auto (giro di borghi vicini da un'unica base): "driving".
export const ROUTING_PROFILE = "driving";

export const CURRENCY_CODE = "EUR";
export const CURRENCY_SYMBOL = "€";

// ─── HERO ─────────────────────────────────────────────────────────────────────

export const TRIP_META = {
  badge:    "Viaggio di Coppia · Estate 2026",
  title:    "Polignano a Mare & Valle d'Itria",
  subtitle: "6 giorni tra scogliere, trulli e centri storici",
  stats:    [
    "6 giorni · 5 notti",
    "Sosta a Bari in itinere",
    "Una sola base",
    "Trulli UNESCO",
    "Per due"
  ]
};

// ─── MAPPA ───────────────────────────────────────────────────────────────────
// Coordinate approssimate dei centri storici (note generali, non rilevate sul posto):
// sufficienti per un marker su Leaflet, da non trattare come precisione da rilevamento.

export const MAP_LOCATIONS = [
  // Bari: coordinate reali da geocoding Nominatim in sessione (Bari Centrale), non a memoria.
  { lat:41.1172, lng:16.8706, nm:"Bari",             sub:"Sosta Giorno 1 (in itinere)", c:"#B03A2E" },
  { lat:40.9966, lng:17.2202, nm:"Polignano a Mare", sub:"Base · Giorni 1-6", c:"#2B5C8A" },
  { lat:40.9535, lng:17.3009, nm:"Monopoli",         sub:"Giorno 5",         c:"#1A7A6E" },
  { lat:40.7827, lng:17.2378, nm:"Alberobello",      sub:"Giorno 3",         c:"#C4832A" },
  // Martina Franca e Cisternino: coordinate reali da geocoding Nominatim in sessione
  // (2026-07-31), non a memoria. Inseriti qui e non in coda perche' l'ordine dell'array
  // disegna la polyline: da Alberobello verso est la sequenza Martina Franca, Cisternino,
  // Ostuni e' quella geograficamente coerente.
  { lat:40.7042, lng:17.3400, nm:"Martina Franca",   sub:"Giorno 4",         c:"#7B4F9E" },
  { lat:40.7430, lng:17.4257, nm:"Cisternino",       sub:"Giorno 3 · sera",  c:"#C4832A" },
  { lat:40.7302, lng:17.5741, nm:"Ostuni",           sub:"Giorno 4 · opzionale", c:"#7B4F9E" },
];

// ─── DATI DEL VIAGGIO ────────────────────────────────────────────────────────

export const TRIP_DATA = {

  // Prima era testo scritto a mano nella shell condivisa con la sintesi di Cilento - bug
  // template gia' corretto per "Cambio Hotel" e "Info & Costi", qui era sfuggito finche'
  // l'utente non l'ha notato sul sito live di Polignano.
  programSummary: "Sosta a Bari in itinere, poi 5 notti a Polignano a Mare con gite in Valle d'Itria (Grotte di Castellana, Alberobello, Cisternino, Martina Franca) e a Monopoli. Ostuni resta come tappa opzionale del Giorno 4. Una sola base, nessun cambio hotel.",

  // Video salvati durante la pianificazione, identificati il 2026-07-31: i link brevi sono stati
  // risolti seguendo i redirect e i titoli letti dall'endpoint oEmbed pubblico di TikTok. Quindi
  // autore e titolo sono reali, non inventati, ma il contenuto dei video non e' stato guardato da
  // qui (TikTok richiede login): cio' che ne e' stato estratto sta nelle descrizioni pubbliche.
  // Il primo e il secondo hanno prodotto contenuto vero, finito nel Giorno 4 (percorso a piedi di
  // Ostuni) e nel Giorno 5 (Cala Tre Buchi); il terzo e' un vlog generico, nessun dato utile.
  savedLinks: [
    { label: "Mini tour di Ostuni a piedi (JohnPietro_PugliaSpoiler)", url: "https://vm.tiktok.com/ZNRou1gpL/" },
    { label: "Cala Tre Buchi, caletta sulla costa di Monopoli (Toboat)", url: "https://vm.tiktok.com/ZNRoucgd7/" },
    { label: "Vlog di due giorni a Polignano a Mare (sofiabossi)", url: "https://vm.tiktok.com/ZNRousSDE/" },
  ],

  days: [
    {
      id:1, color:"#2B5C8A", label:"Giorno 1",
      title:"Civitanova Marche → Bari (sosta) → Polignano a Mare",
      places:"Bari Vecchia (sosta) · Centro storico Polignano · Lama Monachile",
      sections:[
        { t:"Il viaggio: perché fermarsi a Bari",
          tx:"Da Via Aurora, Civitanova Marche Alta a Bari: <b>425 km, circa 4h 18min</b>. Da Bari a Polignano a Mare: altri <b>36 km, 35 min</b>. Il totale (4h 53min) è solo ~7 minuti più lungo del tragitto diretto Civitanova-Polignano (4h 46min, 460 km): Bari non è una deviazione, è sulla strada - calcolato con un routing reale, non stimato. Partire presto (indicativamente 6:00-6:30) per arrivare a Bari a metà mattina." },
        { t:"Sosta a Bari - Bari Vecchia",
          tx:"Percorso a piedi consigliato: <b>Piazza del Ferrarese</b> come punto di partenza, poi dentro il centro storico verso la <b>Basilica di San Nicola</b> (tappa centrale). <b>Via dell'Arco Basso</b>, la \"strada della pasta\": le massaie preparano a mano le orecchiette sugli usci di casa, si può comprare pasta fresca o solo guardare. <b>Piazza Mercantile</b> per una sosta caffè/pranzo veloce. 2-3 ore bastano per il percorso essenziale." },
        { t:"Parcheggio a Bari",
          tx:"L'intera Bari Vecchia è <b>ZTL</b> (zona a traffico limitato): non entrare in auto. Per una sosta breve, le strisce blu lato mare (Zona D) costano ~€1/ora; in alternativa il parcheggio Cesare Battisti (sotterraneo, quartiere Murat, da ~€1,90/ora) è a pochi minuti a piedi dal centro storico. Fonti: <a href=\"https://www.regionepuglia.org/itinerario-bari-mezza-giornata/\" target=\"_blank\" rel=\"noopener noreferrer\">itinerario mezza giornata</a>, <a href=\"https://www.bariexperience.com/en/what-to-do-in-bari/parking-in-bari-where-to-park-your-car-parkride-multi-storey-car-park-ztl-paid-parking/\" target=\"_blank\" rel=\"noopener noreferrer\">parcheggi a Bari</a>." },
        { t:"Arrivo a Polignano & Check-in",
          tx:"Ultimi 35 minuti di guida da Bari. Arrivo indicativo a Polignano a Mare nel primo pomeriggio. Sistemazione in hotel/appartamento - una sola base per tutto il soggiorno, nessun cambio alloggio nei giorni successivi." },
        { t:"Sera - Centro storico di Polignano",
          tx:"Passeggiata nel centro storico, un dedalo di vicoli bianchi a picco sul mare. Sosta a <b>Lama Monachile</b>, la piccola insenatura tra le scogliere che è l'immagine simbolo del paese, e alla statua dedicata a <b>Domenico Modugno</b>, nato qui. Cena in centro storico, vista scogliera se possibile. Costo indicativo: €25-40 a persona." },
        { t:"Tre cose da non perdere, tutte a due passi",
          tx:"Testimonianza diretta di chi ha già fatto questo viaggio, non da una guida: Lama Monachile, Pescaria (panino o frittura di pesce, un'experience tipica del posto) e <b>Super Mago del Gelo</b> (un caffè speciale che pare si trovi solo lì, gusto amaretto e agrumi - vale la sosta) si trovano tutti nel giro di 20 metri l'uno dall'altro. Il resto del centro storico si visita comodamente in un'oretta, non serve pianificarci sopra mezza giornata." },
      ],
      tips:["Giornata lunga (guida + Bari + guida + arrivo): partire presto per non arrivare a Polignano troppo tardi","Bari Vecchia è ZTL: parcheggiare fuori e proseguire a piedi","Il tramonto da Lama Monachile è il momento migliore per le foto","Su Bari circolano allarmismi locali sui furti d'auto: nell'esperienza diretta di chi ha già fatto questo giro, parcheggiando nelle zone indicate sopra è stata una tappa tranquilla e vale assolutamente la sosta a Bari Vecchia"],
      cf:"25-40", ca:"0",
      // Cose da fare seminate per questo giorno (checkbox in Itinerario, spuntabili e
      // rimovibili dall'app): luoghi del centro storico di Polignano, non delle grotte marine
      // (quelle sono nel Giorno 2). La lista era un'indicazione dell'utente senza fonte; il tipo
      // di ciascun luogo e' stato verificato il 2026-08-03 interrogando Overpass su OpenStreetMap
      // (tutti e sei trovati con il nome esatto entro 9 km da Polignano) e scritto in italiano tra
      // parentesi: tourism=viewpoint -> punto panoramico, amenity=restaurant -> ristorante,
      // tourism=museum -> museo, historic=memorial -> memoriale. Serviva perche' dai soli nomi non
      // si capiva che "La colonna" e "La Veranda di Giselda" sono ristoranti.
      todos:["Balconata Lama Monachile (punto panoramico)","Galleria Santo Stefano, ex chiesetta (museo)","La colonna (ristorante)","La Veranda di Giselda (ristorante)","Monumento ai caduti (memoriale)","Piazza Ardito (punto panoramico)"]
      // Fonti (ricerca web 2026-07-13): percorso Bari Vecchia e parcheggio da
      // https://www.regionepuglia.org/itinerario-bari-mezza-giornata/ e
      // https://www.bariexperience.com/en/what-to-do-in-bari/parking-in-bari-where-to-park-your-car-parkride-multi-storey-car-park-ztl-paid-parking/
      // Tempi/distanze di guida: calcolo reale via OSRM (router.project-osrm.org) da coordinate
      // geocodificate con Nominatim per l'indirizzo di partenza fornito dall'utente.
    },
    {
      id:2, color:"#4A90B8", label:"Giorno 2",
      title:"Polignano a Mare in profondità",
      places:"Cala Porto · Cala Paura · Grotta Palazzese",
      sections:[
        { t:"Mattino - Spiagge e grotte marine",
          tx:"Giornata dedicata al mare: <b>Cala Porto</b> e <b>Cala Paura</b>, le due calette principali sotto il centro storico. Le scogliere sono ricche di grotte marine visitabili in barca o kayak (noleggio sul posto)." },
        { t:"Grotta Palazzese - da sapere prima di prenotare",
          tx:"Il ristorante <b>Grotta Palazzese</b>, scavato in una vera grotta naturale a picco sul mare (aperta da Pasqua a ottobre), è tra i luoghi più fotografati della Puglia - ma con alcune informazioni pratiche che è meglio conoscere prima di prenotare, non solo dopo. Prezzo reale: <b>almeno €200 a persona</b> per un menu degustazione senza bevande (una bottiglia d'acqua costa già ~€10). I tavoli si assegnano all'arrivo, non alla prenotazione: prenotare con anticipo non garantisce uno dei tavoli a strapiombo sul mare. Le recensioni sono discordanti (3,4/5 su Tripadvisor, migliaia di recensioni): l'atmosfera è elogiata, ma diversi ospiti segnalano servizio lento e cucina non all'altezza del prezzo." },
        { t:"Sera",
          tx:"Cena in centro storico, oppure Grotta Palazzese consapevoli del compromesso reale (prezzo/qualità) sopra - è un'esperienza da vivere per l'ambiente, non da aspettarsi come miglior pasto del viaggio." },
      ],
      tips:["Se si prenota Grotta Palazzese, farlo sapendo che il tavolo vista mare non è garantito","Kayak e barca a noleggio sul porticciolo per vedere le grotte dal mare"],
      cf:"25-60", ca:"10-25",
      // Cose da fare seminate per questo giorno: le grotte marine della costa di Polignano
      // (categoria "viewpoint" su OpenStreetMap, verificate dal vivo via Overpass in sessione,
      // vedi services/poi-search/) piu' due ristoranti di pesce sulla stessa zona di costa.
      // Tipo verificato di nuovo il 2026-08-03 sugli stessi 14 nomi: tutti trovati in OSM con il
      // nome esatto, dodici tourism=viewpoint (quasi tutti anche natural=cave_entrance), Cozze
      // Nere amenity=restaurant, e Grotta Palazzese che porta entrambi i tag - per questo qui e'
      // annotata come ristorante e punto panoramico insieme, non solo come ristorante.
      todos:["Arco Cala Di Luna (punto panoramico)","Cozze Nere (ristorante)","Grotta Ardito (punto panoramico)","Grotta delle monache (punto panoramico)","Grotta delle rondinelle (punto panoramico)","Grotta di Pietro e Paolo 1 e 2 (punto panoramico)","Grotta di Santa Caterina 2 (punto panoramico)","Grotta Frascina (punto panoramico)","Grotta Palazzese (ristorante e punto panoramico)","Grotta piana - Grotta del basso porto (punto panoramico)","Grotta Pietropaolo - Grotticella sotto Favale (punto panoramico)","Grotta San Gennaro (punto panoramico)","Grotticella di Santo Stefano (punto panoramico)","Pietra Piatta (punto panoramico)"]
      // Fonti (ricerca web 2026-07-13): prezzo, assegnazione tavoli, valutazione Tripadvisor da
      // https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/ e
      // https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html
    },
    {
      id:3, color:"#C4832A", label:"Giorno 3",
      title:"Polignano (mattina) → Grotte di Castellana → Alberobello (sera)",
      places:"Polignano a Mare (mattina) · Grotte di Castellana · Rione Monti · Aia Piccola · Cisternino (sera, alternativa)",
      sections:[
        { t:"Mattina - Ultimo relax a Polignano",
          tx:"Non c'è fretta: le Grotte di Castellana sono a soli <b>17 km, circa 20 minuti</b> di auto da Polignano (calcolato con un routing reale, non stimato). Ultimo bagno in una delle calette o una colazione con calma in centro, poi si parte nel primo pomeriggio." },
        { t:"Grotte di Castellana",
          tx:"Testimonianza diretta di chi ha già fatto questo viaggio, non da una guida: paragonabili alle Grotte di Frasassi, forse un po' meno spettacolari, ma offrono un po' di fresco rispetto al caldo di agosto. Non sembra serva prenotare con grande anticipo, ma verificare comunque i posti disponibili vista la stagione estiva prima di contarci." },
        { t:"Verso Alberobello",
          tx:"Da Grotte di Castellana ad Alberobello: altri <b>17 km, circa 20 minuti</b> di auto (calcolato con un routing reale). Il percorso Polignano → Castellana → Alberobello è tutto sensato come spostamento: nessuna delle due tappe è fuori strada rispetto all'altra." },
        { t:"Sera - Rione Monti & Aia Piccola",
          tx:"Da chi ha già fatto questo viaggio: Alberobello vale la pena tenerla per la sera, quando i trulli si accendono con le lucine - è molto più bella così che di giorno, e in agosto significa anche non \"schiattare\" di caldo tra i vicoli senza ombra. È abbastanza una turistata (al 99% negozi di souvenir), ma comunque una tappa da fare una volta nella vita. Alberobello è patrimonio <b>UNESCO</b> per i suoi <b>trulli</b>, le caratteristiche case in pietra a secco con tetto conico bianco. <b>Rione Monti</b> (oltre 1.000 trulli) è il quartiere principale, denso di trulli - molti oggi negozi di souvenir. <b>Aia Piccola</b> (400 trulli), dall'altra parte del paese, è molto meno turistica - ancora abitazioni di famiglia vere, il nucleo più antico del paese - ed è particolarmente suggestiva la sera. Percorso consigliato: dal belvedere, scendere nel Rione Monti, poi Aia Piccola per capire la differenza tra la parte scenografica e quella vissuta. Fonte: <a href=\"https://www.marcotogni.it/cosa-vedere-alberobello/\" target=\"_blank\" rel=\"noopener noreferrer\">Marco Togni</a>." },
        { t:"Trullo Sovrano",
          tx:"L'unico trullo a due piani della città (fine XVIII secolo, monumento nazionale dal 1930), oggi piccolo museo con ambienti ricostruiti (panificio, camera da letto, cucina). Biglietto: <b>€2,50</b> (Piazza Sacramento 10). Fonte: <a href=\"https://www.trullosovrano.eu/ingresso-biglietti/\" target=\"_blank\" rel=\"noopener noreferrer\">sito ufficiale</a>." },
        { t:"Cena",
          tx:"Cena in una trattoria del centro storico: cucina della Valle d'Itria, orecchiette, verdure locali." },
        // Sezione aggiunta in coda e non in mezzo alla giornata per una ragione tecnica, non
        // estetica: le checkbox delle attivita' usano come chiave `${d.id}-${indice di sezione}`
        // (js/itinerario.js), quindi un inserimento intermedio sposterebbe le spunte gia' salvate
        // su Firestore verso la voce sbagliata.
        { t:"Cisternino, alternativa per la sera",
          tx:"Testimonianza diretta, non da fonte web: <b>Cisternino</b> è già stata visitata nel 2023, mezza giornata di passaggio, e la cosa che vale la pena è prenotare una cena dentro i vicoli del centro storico. È l'alternativa concreta alla trattoria di Alberobello della sezione sopra, non un'aggiunta: si sceglie una delle due cene, non entrambe. Da Alberobello sono <b>18,1 km, circa 20 minuti</b>; da Polignano <b>43 km, circa 38 minuti</b>, e il rientro serale Cisternino-Polignano è di <b>41,5 km, 39 minuti</b> (distanze da routing reale, non stimate). Chi ha già girato questa zona non alloggiava in paese ma fuori, in campagna, alla <a href=\"https://www.tripadvisor.com/Hotel_Review-g652000-d4225796-Reviews-Masseria_Peppeturro-Cisternino_Province_of_Brindisi_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Masseria Peppeturro</a>, masseria di inizio Novecento con due trulli ristrutturati e piscina a pochi chilometri da Cisternino: il contatto telefonico diretto non sta in questo file ma negli appunti privati del viaggio, perché il repository è pubblico." },
      ],
      tips:["Rione Monti è molto turistico: Aia Piccola offre scorci più tranquilli","Nelle ore centrali fa molto caldo: la mattina a Polignano e le Grotte (fresche) coprono bene la parte più calda della giornata","Da testimonianza diretta: tenere Alberobello per il tardo pomeriggio/sera, sia per le lucine sui trulli sia per evitare il caldo peggiore","Da testimonianza diretta: tra Locorotondo e Martina Franca è meglio la seconda, che ora è la tappa principale del Giorno 4 - Locorotondo si aggiunge solo se resta tempo, è carina ma molto piccola e non è nel percorso diretto Castellana-Alberobello","Se si sceglie Cisternino per la sera, la cena nei vicoli va prenotata: è il motivo per cui ci si va"],
      cf:"20-35", ca:"5-10"
      // Distanze/tempi Polignano-Castellana e Castellana-Alberobello: calcolo reale via OSRM
      // (router.project-osrm.org) da coordinate geocodificate con Nominatim, verificato dal vivo
      // in sessione (2026-07-15), non stimato.
      // Tratte di Cisternino aggiunte con lo stesso metodo (2026-07-31): Alberobello-Cisternino
      // 18,1 km / 20 min; Polignano-Cisternino 43,0 km / 38 min; Cisternino-Polignano 41,5 km /
      // 39 min. La testimonianza ricordava Cisternino "poco piu' giu' di 50 km": il dato reale
      // conferma l'ordine di grandezza.
    },
    {
      id:4, color:"#7B4F9E", label:"Giorno 4",
      title:"Martina Franca, il barocco della Valle d'Itria",
      places:"Piazza Roma · Palazzo Ducale · Basilica di San Martino · Ostuni (opzionale)",
      sections:[
        { t:"Perché questa giornata è cambiata",
          tx:"Testimonianza diretta, non da fonte web: chi ha già girato questa zona ha preferito la <b>Valle d'Itria</b> a Ostuni, e tra Locorotondo e Martina Franca indica senza esitazione la seconda. Nella stessa testimonianza Ostuni e Matera venivano ricordate come \"altre centinaia di chilometri\" rispetto a Cisternino, e questo il dato reale non lo conferma: va detto, perché è l'informazione su cui si decide. Da Polignano, Martina Franca è a <b>40,9 km, 39 minuti</b> e Ostuni a <b>51,3 km, 44 minuti</b>, quindi come spostamento le due tappe sono praticamente equivalenti (routing reale, non stime). Ostuni non sparisce quindi per una questione di distanza, ma per una preferenza dichiarata: scende a tappa opzionale di questa giornata e conserva tutto il suo contenuto più sotto. Martina Franca ha in più il vantaggio di stare a <b>9,7 km, 13 minuti</b> da Cisternino, la tappa serale del Giorno 3." },
        { t:"Come arrivare e parcheggio",
          tx:"Da Polignano a Martina Franca: <b>40,9 km, circa 39 minuti</b>, e <b>39,0 km, 39 minuti</b> al ritorno (routing reale). Si parcheggia vicino al centro storico a prezzi contenuti e si prosegue a piedi; un'alternativa indicata è lasciare l'auto nell'area di <b>Villa Garibaldi</b> e raggiungere a piedi <b>Piazza XX Settembre</b>, da cui si entra nel centro storico attraverso la <b>Porta di Santo Stefano</b>. Una cosa va dichiarata invece di riempita per ipotesi: a differenza di Bari e di Ostuni, per Martina Franca non ho trovato una fonte che documenti una ZTL con orari precisi, quindi va verificata sul posto alla segnaletica e non data per assente. Fonte: <a href=\"https://www.lafinestraaccanto.com/2024/citta/martina-franca-itinerario-a-piedi-nel-centro-storico/\" target=\"_blank\" rel=\"noopener noreferrer\">La finestra accanto</a>." },
        { t:"Il centro storico barocco",
          tx:"Martina Franca è il centro barocco della Valle d'Itria: case bianche a calce, vicoli stretti, balconi in ferro battuto e facciate nobiliari decorate. Il <b>Palazzo Ducale</b>, edificato nel <b>1668</b> su un progetto approvato da <b>Gian Lorenzo Bernini</b>, ha una balconata in ferro battuto di <b>74 metri</b> lungo tutta la facciata che dà su <b>Piazza Roma</b>, e ospita all'interno due musei, uno di scienze naturali e uno di arte pittorica. La <b>Basilica di San Martino</b> (<b>1747</b>) è il monumento simbolo della città, e la <b>Chiesa di San Domenico</b> completa il giro del barocco locale. Il prezzo dei biglietti dei due musei dentro il Palazzo Ducale non è verificato e non lo invento: la passeggiata nel centro storico è in ogni caso gratuita. Fonti: <a href=\"https://www.idealista.it/news/vacanze/mete-turistiche/2026/04/18/353411-che-cosa-vedere-a-martina-franca-il-borgo-barocco-della-valle-d-itria\" target=\"_blank\" rel=\"noopener noreferrer\">idealista</a>, <a href=\"https://www.iltarantino.it/turismo/2026/06/02/cosa-vedere-a-martina-franca-guida-completa-del-gioiello-barocco-della-valle-ditria/\" target=\"_blank\" rel=\"noopener noreferrer\">Il Tarantino</a>." },
        { t:"Festival della Valle d'Itria, da controllare contro le date del viaggio",
          tx:"Da verificare prima di partire, perché può cambiare del tutto l'atmosfera della giornata e la disponibilità di alloggi in zona: la <b>52ª edizione del Festival della Valle d'Itria</b>, festival lirico tra i più importanti d'Europa, si tiene a Martina Franca dal <b>14 luglio al 2 agosto 2026</b>, con sede principale il Palazzo Ducale e i chiostri del centro storico. Se il viaggio cade nei primissimi giorni di agosto il festival è ancora in corso e conviene guardare il programma con anticipo; se cade più avanti nel mese è già chiuso. Questo itinerario non ha date calendariali fissate, quindi la verifica resta da fare. Fonti: <a href=\"https://www.festivaldellavalleditria.it/en/program-2026\" target=\"_blank\" rel=\"noopener noreferrer\">programma ufficiale 2026</a>, <a href=\"https://www.laterradipuglia.it/2026/eventi-spettacoli/concerti-musica/festival-della-valle-ditria-2026-programma-artisti-e-guida-completa.htm\" target=\"_blank\" rel=\"noopener noreferrer\">La Terra di Puglia</a>." },
        { t:"Ostuni (opzionale) - come arrivare",
          tx:"Ostuni resta un'opzione piena, non una tappa cancellata: se si preferisce la Città Bianca al barocco della Valle d'Itria, questa giornata si scambia con quella descritta sopra. Da Polignano sono <b>51,3 km, 44 minuti</b> all'andata e <b>49,6 km, 45 minuti</b> al ritorno (routing reale ricalcolato in sessione), cioè circa 101 km in giornata contro gli 80 di Martina Franca." },
        { t:"Ostuni (opzionale) - parcheggio",
          tx:"Il centro storico è in gran parte <b>ZTL</b>, strade strette e affollate in alta stagione: meglio lasciare l'auto in un parcheggio esterno a pagamento (es. Ostuni Parking Area1, o i parcheggi di Via Antonia Specchia) e proseguire a piedi. Fonte: <a href=\"https://www.ostunicentralparking.it/2025/06/20/cosa-vedere-a-ostuni-in-un-giorno-con-mappa-e-consigli-di-parcheggio/\" target=\"_blank\" rel=\"noopener noreferrer\">Ostuni Central Parking</a>." },
        { t:"Ostuni (opzionale) - il centro storico",
          tx:"Ostuni è nota come <b>la Città Bianca</b> per il centro storico interamente imbiancato a calce, arroccato su una collina con vista sulla piana degli ulivi e sul mare. Vicoli stretti, scalinate, molti vicoli ciechi. <b>Piazza della Libertà</b>, con la Colonna di Sant'Oronzo, è il punto d'incontro tra la città nuova e il borgo antico. <b>Attenzione</b>: la Concattedrale di Ostuni, con il suo rosone gotico, risulta <b>chiusa per lavori di ristrutturazione</b> secondo un aggiornamento di aprile 2026 - verificare sul posto se ha riaperto prima di contarci come tappa, non è detto che sia già visitabile ad agosto. Un percorso a piedi concreto arriva da uno dei video salvati in cima all'Itinerario, di cui è stata letta la descrizione pubblica e non il video stesso: partire dal <b>Parcheggio Comunale</b>, seguire <b>Via Giosuè Pinto</b> in direzione del centro storico fino alla <b>Colonna di Sant'Oronzo</b>, che sta davanti al Comune, poi imboccare <b>Via Cattedrale</b> e percorrerla fino alla <b>Cattedrale di Santa Maria Assunta</b>. Da tenere presente che quel percorso termina proprio sul monumento segnalato come chiuso per lavori: il giro resta valido, la tappa finale no. Fonti: <a href=\"https://www.eleonoraongaro.it/ostuni-cosa-vedere/\" target=\"_blank\" rel=\"noopener noreferrer\">Sarà Perché Viaggio</a>, <a href=\"https://vm.tiktok.com/ZNRou1gpL/\" target=\"_blank\" rel=\"noopener noreferrer\">video salvato sul mini tour di Ostuni</a>." },
        { t:"Ostuni (opzionale) - la vista dalle mura e l'ape calessino",
          tx:"Testimonianza diretta, non da fonte web: sotto le mura c'è un tratto panoramico da cui si vede tutta Ostuni, la Città Bianca, in un colpo d'occhio - da non perdere. Da lì si può anche fare un giro con l'ape calessino (turistico e un po' \"da turisti basic\", ma ci sta). Questa tappa va vissuta di giorno, non di sera: il bianco della città risalta molto di più con la luce piena." },
        { t:"Ostuni (opzionale) - mare, meno affollato",
          tx:"Sulla costa di Ostuni, <b>Torre Pozzelle</b> ha una serie di calette selvagge tra gli scogli, e <b>Costa Merlata</b> insenature rocciose meno battute delle spiagge principali - alternative valide a Rosa Marina se si cerca meno folla. Fonte: <a href=\"https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Villa Gapanthus</a>." },
      ],
      tips:["Il centro storico di Martina Franca si gira a piedi senza un percorso obbligato: il barocco è il motivo della tappa","Da testimonianza diretta: tra Locorotondo e Martina Franca è meglio la seconda","Se il viaggio cade entro il 2 agosto, controllare il programma del Festival della Valle d'Itria prima di arrivare","Ostuni, se scelta al posto di Martina Franca: centro storico ripido e acciottolato, scarpe comode","Ostuni, se scelta: vista migliore sulla città bianca dalla strada che arriva da sud","Ostuni, se scelta: da testimonianza diretta va vista di giorno e non di sera, perché il bianco risalta con la luce piena"],
      cf:"20-35", ca:"0"
      // Fonte spiagge Ostuni (ricerca web 2026-07-13): https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/
      // Contenuto Martina Franca (ricerca web 2026-07-31): Palazzo Ducale, balconata di 74 m,
      // Basilica di San Martino, parcheggio Villa Garibaldi / Porta di Santo Stefano da
      // https://www.idealista.it/news/vacanze/mete-turistiche/2026/04/18/353411-che-cosa-vedere-a-martina-franca-il-borgo-barocco-della-valle-d-itria
      // https://www.iltarantino.it/turismo/2026/06/02/cosa-vedere-a-martina-franca-guida-completa-del-gioiello-barocco-della-valle-ditria/
      // https://www.lafinestraaccanto.com/2024/citta/martina-franca-itinerario-a-piedi-nel-centro-storico/
      // Date Festival della Valle d'Itria 2026 (14 luglio - 2 agosto) da
      // https://www.festivaldellavalleditria.it/en/program-2026
      // Nessuna fonte trovata su una ZTL di Martina Franca: dichiarato come da verificare sul
      // posto, non riempito per analogia con Ostuni e Bari.
      // Distanze Polignano-Martina Franca (40,9 / 39,0 km) e Polignano-Ostuni (51,3 / 49,6 km):
      // OSRM reale in sessione (2026-07-31). La stima "centinaia di km" della testimonianza non e'
      // confermata e non e' stata riportata nel testo.
    },
    {
      id:5, color:"#1A7A6E", label:"Giorno 5",
      title:"Monopoli",
      places:"Centro storico · Porto · Castello di Carlo V",
      sections:[
        { t:"Come Arrivare",
          tx:"Da Polignano a Monopoli: solo 12 km, 15-20 minuti in auto - la tappa più vicina, giornata più rilassata." },
        { t:"Centro storico & Porto",
          tx:"Monopoli ha un centro storico bianco simile a Polignano ma più esteso, cinto da mura, con un <b>porto peschereccio</b> ancora attivo - barche colorate (i tradizionali gozzi), pescatori che riparano le reti. Il <b>Castello di Carlo V</b> (XVI secolo), sul mare accanto al centro storico, domina il porto vecchio: non è visitabile ovunque all'interno (parte ospita uffici comunali), ma l'esterno vale comunque la sosta. Fonte: <a href=\"https://www.regionepuglia.org/monopoli/\" target=\"_blank\" rel=\"noopener noreferrer\">Regione Puglia</a>." },
        { t:"Il molo con le barchette blu",
          tx:"Testimonianza diretta, non da fonte web: Monopoli è bellissima tutta, ma soprattutto il molo con le barchette blu - molto colorato, da non perdere. Lì si trova ovunque il panino con il polpo fritto, uno street food diffuso in tutta la zona del porto. Il centro è pieno di locali per fare aperitivo, specialmente sul tardo pomeriggio/sera." },
        { t:"Mare, meno affollato",
          tx:"A sud del centro, <b>Spiaggia di Porto Ghiacciolo</b> (5 minuti in auto) è segnalata come la spiaggia migliore della zona, sabbia dorata e acqua limpida. Più selvagge: <b>Port'Alga</b> (Scoglio dell'Eremita) e <b>Torre Incina</b>, buone per lo snorkeling; <b>Cala Verde</b>, dietro il campeggio Santo Stefano, è la più remota e meno frequentata. Da uno dei video salvati in cima all'Itinerario, di cui è stata letta la descrizione pubblica: <b>Cala Tre Buchi</b>, incassata tra gli scogli della costa di Monopoli, prende il nome dalle tre piccole grotte che la formano ed è riparata dal mare aperto, quindi con acqua calma e limpida tutto il giorno. Da valutare sapendo due cose: la fonte è un operatore di gite in barca, quindi non è un consiglio neutrale, e l'accesso descritto è dal mare, non a piedi. Fonti: <a href=\"https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Villa Gapanthus</a>, <a href=\"https://roamandthrive.com/best-beaches-monopoli-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Roam & Thrive</a>, <a href=\"https://vm.tiktok.com/ZNRoucgd7/\" target=\"_blank\" rel=\"noopener noreferrer\">video salvato su Cala Tre Buchi</a>." },
        { t:"Sera - Porto vecchio",
          tx:"A fine giornata, rientro nel centro storico per l'atmosfera serale intorno al porto vecchio e <b>Piazza Giuseppe Garibaldi</b>, il ritrovo serale della città." },
      ],
      tips:["Giornata volutamente leggera, vicina alla base: buon giorno per riposare dagli spostamenti"],
      cf:"20-35", ca:"0"
      // Fonti spiagge (ricerca web 2026-07-13): https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/
      // e https://roamandthrive.com/best-beaches-monopoli-puglia/
    },
    {
      id:6, color:"#B03A2E", label:"Giorno 6",
      title:"Ultimo Mare & Partenza",
      places:"Polignano a Mare · Partenza",
      sections:[
        { t:"Mattino Libero",
          tx:"Ultima mattinata a Polignano a Mare: ultimo bagno o ultima passeggiata nel centro storico, secondo l'orario di partenza." },
        { t:"Check-out & Partenza",
          tx:"Check-out e partenza per il rientro." },
        { t:"Sulla via del ritorno: Trani",
          tx:"Testimonianza diretta, non da fonte web: se il percorso di rientro lo permette, una sosta a Trani vale la pena - ha un mercato del pesce molto famoso, con crudi di mare descritti come \"la fine del mondo\". Da valutare in base a quanto tempo/deviazione comporta rispetto al rientro." },
        { t:"Se restano giorni liberi nell'itinerario",
          tx:"Sempre da esperienza diretta: con più giorni a disposizione, quasi tutto qui intorno vale una visita perché le tappe sono piccole e il costo della vita è basso ovunque. <b>Lecce</b> ha un bel centro storico, un po' distante dalla base ma comunque consigliata se c'è tempo. <b>Brindisi</b> è invece sconsigliata senza mezzi termini: descritta come uno \"scenario post apocalittico\", niente da vedere. <b>Otranto e la Grotta della Poesia</b> sono decisamente fuori mano rispetto a questa base (più adatte a un futuro tour della Puglia centro/sud), non rientrano in questo itinerario. <b>Matera</b> è stata vista dalla stessa testimonianza, ma dieci anni fa: da Polignano sono <b>139,2 km, circa 2 ore e 20 minuti</b> (routing reale), quindi è una giornata intera da programmare, non un salto - ed è anche la ragione per cui non entra nell'itinerario a base unica. A <b>28,3 km</b> da Matera, verso Metaponto, c'è <b>Bernalda</b>, dove nella stessa occasione si alloggiava in un grande albergo per cerimonie di un amico, usato come base per le battute di caccia in zona. Bernalda è il paese di origine dei nonni paterni di <b>Francis Ford Coppola</b>, emigrati da lì: non il suo paese natale, perché Coppola è nato a Detroit nel 1939, e la differenza vale la pena saperla prima di raccontarla sul posto (fonte: <a href=\"https://en.wikipedia.org/wiki/Francis_Ford_Coppola\" target=\"_blank\" rel=\"noopener noreferrer\">Wikipedia</a>)." },
      ],
      tips:["Tenere conto del traffico estivo sulla statale se si parte nel weekend"],
      cf:"10-20", ca:"0"
    },
  ],

  // Fonti Pescaria (ricerca web 2026-07-13): indirizzo, valutazioni e descrizione da
  // https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html
  // e https://www.yelp.com/biz/pescaria-polignano-a-mare
  // Grotta Palazzese: fonti citate accanto al Giorno 2 sopra.
  restaurants: [
    { area:"Bari (sosta Giorno 1)", days:"Giorno 1, in itinere", items:[
      { nm:"Via dell'Arco Basso", tags:["Street food","$"], note:"Non un ristorante ma una strada: le massaie di Bari Vecchia preparano orecchiette a mano davanti casa, vendute fresche. Esperienza autentica più che un pasto vero e proprio.", sp:"Sosta breve, non un pranzo completo" },
    ]},
    { area:"Polignano a Mare", days:"Giorni 1, 2, 6", items:[
      { nm:"Grotta Palazzese", tags:["Pesce","$$$$"], note:"Ristorante scavato in una grotta naturale a picco sul mare. Prezzo reale almeno €200/persona, tavolo vista mare non garantito anche prenotando, recensioni discordanti (3,4/5 Tripadvisor) - dettaglio completo nel Giorno 2. Fonte: <a href=\"https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/\" target=\"_blank\" rel=\"noopener noreferrer\">Dissapore</a>, <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>.", sp:"Esperienza per l'ambiente, non il miglior pasto del viaggio", tripadvisor:"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html" },
      // Nessun campo thefork per Grotta Palazzese: verificato che non ha una scheda su TheFork,
      // prenota solo dal proprio sito ufficiale (grottapalazzese.it) - non inventato un link.
      { nm:"Pescaria", tags:["Pesce","Street food","$"], note:"Piazza Aldo Moro 6-8. Il primo fast food di pesce d'Italia, nato qui a Polignano: panini di mare, tartare di tonno, fish and chips. Informale, senza prenotazione. 4,8/5 su Restaurant Guru, #10 su 205 ristoranti di Polignano su Tripadvisor. Fonte: <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>, <a href=\"https://www.yelp.com/biz/pescaria-polignano-a-mare\" target=\"_blank\" rel=\"noopener noreferrer\">Yelp</a>.", sp:"Ottima alternativa economica a Grotta Palazzese", tripadvisor:"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html", thefork:"https://www.thefork.it/ristorante/pescaria-polignano-r849503" },
      { nm:"Super Mago del Gelo", tags:["Gelateria/Caffè","$"], note:"Testimonianza diretta, non da fonte web (nessun link verificato per questa voce): fa un caffè speciale che pare si trovi solo qui, gusto amaretto e agrumi. A due passi da Pescaria e Lama Monachile, nello stesso angolo di paese.", sp:"Vale la sosta anche solo per il caffè" },
    ]},
    // "Giorno 3 sera" e non piu' "Giorno 3 pranzo": il Giorno 3 tiene Alberobello per la sera
    // (lucine sui trulli, caldo evitato), quindi l'etichetta precedente contraddiceva la giornata.
    { area:"Alberobello", days:"Giorno 3 sera", items:[
      { nm:"Trattoria in un trullo", tags:["Valle d'Itria","$-$$"], note:"Voce indicativa: diversi ristoranti del centro storico occupano trulli veri. Orecchiette, verdure sott'olio, formaggi locali." },
    ]},
    { area:"Cisternino", days:"Giorno 3 sera, alternativa ad Alberobello", items:[
      { nm:"Cena nei vicoli del centro storico", tags:["Valle d'Itria","$-$$"], note:"Testimonianza diretta, non da fonte web: a Cisternino la cosa che vale la pena è prenotare una cena dentro i vicoli del centro storico. La testimonianza non indica un locale specifico, quindi qui non c'è nessun link: va scelto sul posto o cercato in zona, sapendo che la prenotazione è il punto.", sp:"Alternativa alla cena ad Alberobello, non in aggiunta" },
    ]},
    { area:"Martina Franca", days:"Giorno 4", items:[
      { nm:"Ristorante del centro storico", tags:["Valle d'Itria","$-$$"], note:"Voce indicativa, come quelle di Alberobello e Ostuni: cucina della Valle d'Itria nel centro barocco. Su Martina Franca non è stata fatta una ricerca dedicata a locali specifici, quindi nessun nome e nessun link inventato." },
    ]},
    { area:"Ostuni", days:"Giorno 4, solo se si sceglie Ostuni", items:[
      { nm:"Ristorante del centro storico", tags:["Pugliese","$-$$"], note:"Voce indicativa: cucina pugliese classica (fave e cicorie, orecchiette, carne alla brace) nel centro storico della città bianca." },
    ]},
    { area:"Monopoli", days:"Giorno 5", items:[
      { nm:"Panino col polpo fritto (molo)", tags:["Street food","$"], note:"Testimonianza diretta, non da fonte web: street food diffuso ovunque intorno al molo con le barchette blu, non un singolo locale specifico." },
      { nm:"Locali per aperitivo (centro)", tags:["Aperitivo","$-$$"], note:"Testimonianza diretta: il centro di Monopoli è pieno di locali per l'aperitivo, specialmente sul tardo pomeriggio/sera." },
      { nm:"Ristorante sul porto", tags:["Pesce","$$-$$$"], note:"Voce indicativa: il porto vecchio di Monopoli ha diversi ristoranti di pesce con vista sulle barche." },
    ]},
  ],

  checklist: [
    { cat:"Documenti", items:[
      { t:"Carta d'identità / Passaporto",          n:"Obbligatorio" },
      { t:"Patente di guida" },
      { t:"Assicurazione auto + libretto" },
      { t:"Prenotazioni hotel (screenshot offline)" },
      { t:"Prenotazione Grotta Palazzese, se fatta",  n:"Giorno 2" },
      { t:"Contanti €100-150",                       n:"Spese in loco, oltre ai €150 della caparra" },
      { t:"Carta di credito / bancomat" },
      // Voce aggiunta in coda alla categoria, non in mezzo: le chiavi delle checkbox sono
      // posizionali (`${indice categoria}-${indice voce}`), un inserimento intermedio
      // sposterebbe le spunte gia' salvate su Firestore.
      { t:"Caparra alloggio: €150 in contanti",       n:"Confermato dall'utente, da portare in contanti" },
    ]},
    { cat:"Abbigliamento", items:[
      { t:"Magliette leggere (x5-6)" },
      { t:"Pantaloncini" },
      { t:"Abiti / vestiti per le cene",  n:"1-2 outfit" },
      { t:"Sandali da camminata" },
      { t:"Scarpe comode per centri storici acciottolati", n:"Alberobello, Martina Franca e Ostuni sono ripidi/sconnessi" },
      { t:"Costume da bagno x 2" },
      { t:"Copricostume / pareo" },
      { t:"Cappello da sole" },
      { t:"Occhiali da sole" },
    ]},
    { cat:"Mare & Spiaggia", items:[
      { t:"Crema solare 50+ (abbondante)" },
      { t:"Doposole idratante" },
      { t:"Telo mare x 2" },
      { t:"Borsa / sacca impermeabile" },
      { t:"Maschera e boccaglio",       n:"Grotte marine di Polignano" },
      { t:"Ciabatte da mare" },
    ]},
    { cat:"Salute & Farmacia", items:[
      { t:"Farmaci personali (scorta completa)" },
      { t:"Cerotti e kit medicazione" },
      { t:"Repellente insetti" },
      { t:"Antidolorifico / antipiretico" },
    ]},
    { cat:"Tecnologia", items:[
      { t:"Caricabatterie smartphone" },
      { t:"Power bank (5000+ mAh)" },
      { t:"Cuffie / auricolari" },
      { t:"Macchina fotografica",      n:"Trulli e scogliere" },
      { t:"Caricabatterie auto / adattatore 12V" },
    ]},
    { cat:"Per l'Auto", items:[
      { t:"Acqua (almeno 6-8 bottiglie x 1,5L)" },
      { t:"Snack per i trasferimenti" },
      { t:"Cassetta pronto soccorso (obbligatoria)" },
      { t:"Gilet catarifrangenti x 2 (obbligatori)" },
      { t:"Playlist viaggio creata" },
    ]},
    { cat:"Per la Coppia", items:[
      { t:"Prenotare Grotta Palazzese",   n:"Con largo anticipo - Giorno 2" },
      { t:"Tramonto a Lama Monachile",    n:"Giorno 1" },
      { t:"Foto tra i trulli di Alberobello" },
      { t:"Foto in ogni tappa dell'itinerario" },
      // Voci aggiunte in coda alla categoria e non in mezzo: le checkbox della valigia usano
      // come chiave `${indice categoria}-${indice voce}` (js/itinerario.js), quindi un
      // inserimento intermedio sposterebbe le spunte gia' salvate su Firestore.
      { t:"Prenotare la cena nei vicoli a Cisternino", n:"Giorno 3, alternativa alla cena ad Alberobello" },
      { t:"Controllare le date del Festival della Valle d'Itria", n:"Giorno 4, edizione 2026 dal 14 luglio al 2 agosto" },
    ]},
  ],

  // Nessun hotelChange: una sola base per tutto il soggiorno, niente banner di cambio hotel.

  // Onestà: a differenza delle voci sopra (Bari, Grotta Palazzese, Pescaria, spiagge), qui non
  // ho fatto una ricerca dedicata su hotel/B&B reali di Polignano: prezzi e nomi sono indicativi,
  // da verificare su Booking/Airbnb prima di prenotare (agosto è alta stagione).
  accommodation: {
    subtitle: "Una sola base per tutto il soggiorno - prezzi indicativi, non verificati",
    bases: [
      {
        name: "Polignano a Mare", location: "Giorni 1-6 (5 notti)",
        badge: "Unica base", badgeBg: "#E3F7EE", badgeColor: "#1DAD70",
        options: [
          { name:"Hotel/B&B nel centro storico", price:"prenotato e pagato (importo reale nel pannello Alloggio confermato)", desc:"La prenotazione è stata fatta e pagata, con lo sconto già applicato all'importo versato (confermato dall'utente il 2026-08-03), più una caparra di €150 da consegnare in contanti sul posto. L'importo esatto non è scritto qui: va inserito una volta nel pannello Alloggio confermato della scheda Costi, che è il meccanismo previsto per un alloggio reale e alimenta sia il totale di Info & Costi sia quello di Costi senza contarlo due volte. Le due voci sotto restano solo come riferimento di quanto costava indicativamente la zona." },
          { name:"Alternativa - Airbnb/appartamento", price:"indicativo €100-180 / notte", desc:"Con cucina propria, utile per colazioni o pranzi più economici." },
          // Voce solo descrittiva: resolveAccommodationCost() (js/itinerario.js) non legge questo
          // campo price, il costo alloggio del totale viene da una prenotazione confermata o da un
          // alloggio salvato in Pianifica. Nessun prezzo inventato qui.
          { name:"Alternativa fuori base - masseria in campagna in Valle d'Itria", price:"prezzo non verificato", desc:"Testimonianza diretta, non una fonte web: chi ha già girato questa zona non alloggiava in paese ma fuori, in campagna, alla <a href=\"https://www.tripadvisor.com/Hotel_Review-g652000-d4225796-Reviews-Masseria_Peppeturro-Cisternino_Province_of_Brindisi_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Masseria Peppeturro</a>, masseria di inizio Novecento con due trulli ristrutturati e piscina a pochi chilometri da Cisternino. Va letta come alternativa alla base di Polignano e non come secondo alloggio da sommare: sposta il centro del viaggio nella Valle d'Itria e allontana dalle calette di Polignano, che sono il motivo dei Giorni 1, 2 e 6. Prezzi non verificati direttamente, come per le due voci sopra. Il contatto telefonico diretto sta negli appunti privati del viaggio, non nel repository, che è pubblico." },
        ]
      },
    ]
  },

  // Alloggio: indicativo, non ricercato (Alloggio diventa dinamico se confermi una prenotazione
  // reale o salvi un alloggio da Pianifica, vedi renderInfoCosts/resolveAccommodationCost in
  // public/index.html - questa riga resta solo il valore di partenza). Pasti/Biglietti: somma
  // delle stime cf/ca già scritte in ogni giorno sopra, coerenti con quei valori.
  // Carburante: ricalcolato con dati reali (2026-07-13, rifatto il 2026-07-31 dopo il passaggio di
  // Ostuni a tappa opzionale), non una stima approssimativa - distanze via OSRM
  // (Civitanova-Bari-Polignano A/R 924,4 km; giro del Giorno 3 Polignano-Castellana-Alberobello-
  // Polignano 65,6 km, che sostituisce il vecchio Polignano-Alberobello A/R 60,2 km perche' non
  // contava la deviazione per le Grotte; Martina Franca A/R 79,9 km al posto di Ostuni A/R;
  // Monopoli A/R 22,8 km - totale 1092,7 km), consumo
  // reale Alfa Romeo Giulietta 1.6 JTD diesel (2019) da fonti citate: 4,7-5,0 L/100km ciclo misto
  // ufficiale (test reali spesso migliori, ~4L/100km). Fonti:
  // https://it.motor1.com/reviews/375130/alfa-romeo-giulietta-diesel-manuale-prova-consumi/
  // https://www.linkmotors.it/scheda-tecnica/auto/2019-Alfa-Romeo-Giulietta-Type/36540/
  costEstimate: {
    subtitle: "Per persona, camera doppia condivisa - stima indicativa",
    rows: [
      { label:"Alloggio", desc:"5 notti a Polignano a Mare, alta stagione agosto (indicativo, non verificato - diventa reale se confermi una prenotazione o salvi un alloggio da Pianifica)", amount:"€225-400", kind:"accommodation" },
      { label:"Pasti", desc:"Somma delle stime giornaliere sopra (Giorni 1-6)", amount:"€120-225" },
      { label:"Biglietti e attività", desc:"Grotta Palazzese/Pescaria escluse (già in Pasti se scelte), Trullo Sovrano incluso", amount:"€15-35" },
      { label:"Carburante diesel", desc:"1092,7 km reali calcolati con OSRM: Civitanova-Bari-Polignano A/R 924,4 km, giro del Giorno 3 (Polignano-Castellana-Alberobello-Polignano) 65,6 km, Martina Franca A/R 79,9 km, Monopoli A/R 22,8 km. Alfa Romeo Giulietta 1.6 JTD diesel 2019 (4,7-5,0L/100km reale), €1.65/L, diviso tra 2 persone. Due varianti che spostano il conto: scegliere Ostuni al posto di Martina Franca aggiunge circa 21 km (100,9 km A/R contro 79,9), e chiudere il Giorno 3 con la cena a Cisternino invece del rientro diretto da Alberobello ne aggiunge altri 28,8. Fonti: <a href=\"https://it.motor1.com/reviews/375130/alfa-romeo-giulietta-diesel-manuale-prova-consumi/\" target=\"_blank\" rel=\"noopener noreferrer\">Motor1</a>, <a href=\"https://www.linkmotors.it/scheda-tecnica/auto/2019-Alfa-Romeo-Giulietta-Type/36540/\" target=\"_blank\" rel=\"noopener noreferrer\">scheda tecnica</a>.", amount:"€42-45" },
      { label:"Extra e imprevisti", amount:"€50-100" },
    ],
    total: { sub:"6 giorni, tutto incluso" },
    // Importo di coppia (non per persona), sottratto coerentemente da tutte le viste che mostrano
    // un totale (Info & Costi per persona, Costi il totale reale) - vedi renderInfoCosts e
    // renderCostsDashboard in public/index.html. Scaduto dopo validUntil: non piu' applicato
    // automaticamente, per non mostrare uno sconto non piu' reale.
    // ATTENZIONE, non riportare validUntil in avanti: lo sconto e' stato usato davvero, l'utente
    // ha confermato di aver pagato la prenotazione con lo sconto applicato (2026-08-03). Essendo
    // gia' incluso nella cifra realmente pagata, riattivarlo lo sottrarrebbe una seconda volta dal
    // totale. La data passata lo tiene inerte (activeDiscount() torna null), che qui e' il
    // comportamento corretto e non una dimenticanza.
    discount: { amount: 74.66, desc: "Sconto gia' usato: incluso nel prezzo realmente pagato", validUntil: "2026-07-30" }
  },

  tickets: [
    { name:"Basilica di San Nicola (Bari)", price:"Gratuito", free:true },
    { name:"Bari Vecchia (passeggiata)", price:"Gratuito", free:true },
    { name:"Trullo Sovrano (Alberobello)", price:"€2,50" },
    { name:"Centro storico Cisternino", price:"Gratuito", free:true },
    { name:"Centro storico Martina Franca", price:"Gratuito", free:true },
    { name:"Musei del Palazzo Ducale (Martina Franca)", price:"Non verificato" },
    { name:"Centro storico Ostuni (opzionale)", price:"Gratuito", free:true },
    { name:"Centro storico Monopoli", price:"Gratuito", free:true },
  ],

  savingTips: [
    "Pescaria è un'alternativa economica di qualità a Grotta Palazzese per un pasto di pesce, senza il conto da occasione speciale",
    "Aia Piccola ad Alberobello ha gli stessi trulli di Rione Monti, meno negozi per turisti",
    "Spiagge libere (Torre Pozzelle, Porto Ghiacciolo, Cala Verde) invece di stabilimenti a pagamento",
  ],
};
