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
 * Giulietta diesel usato per il carburante in costEstimate. Le voci
 * ristoranti di Alberobello e Ostuni restano indicative (tipo di cucina, non un nome
 * verificato), non ancora coperte da questa seconda passata.
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
  { lat:40.7302, lng:17.5741, nm:"Ostuni",           sub:"Giorno 4",         c:"#7B4F9E" },
];

// ─── DATI DEL VIAGGIO ────────────────────────────────────────────────────────

export const TRIP_DATA = {

  // Prima era testo scritto a mano nella shell condivisa con la sintesi di Cilento — bug
  // template gia' corretto per "Cambio Hotel" e "Info & Costi", qui era sfuggito finche'
  // l'utente non l'ha notato sul sito live di Polignano.
  programSummary: "Sosta a Bari in itinere, poi 5 notti a Polignano a Mare con gite a Alberobello, Ostuni e Monopoli. Una sola base, nessun cambio hotel.",


  days: [
    {
      id:1, color:"#2B5C8A", label:"Giorno 1",
      title:"Civitanova Marche → Bari (sosta) → Polignano a Mare",
      places:"Bari Vecchia (sosta) · Centro storico Polignano · Lama Monachile",
      sections:[
        { t:"Il viaggio: perché fermarsi a Bari",
          tx:"Da Via Aurora, Civitanova Marche Alta a Bari: <b>425 km, circa 4h 18min</b>. Da Bari a Polignano a Mare: altri <b>36 km, 35 min</b>. Il totale (4h 53min) è solo ~7 minuti più lungo del tragitto diretto Civitanova-Polignano (4h 46min, 460 km): Bari non è una deviazione, è sulla strada — calcolato con un routing reale, non stimato. Partire presto (indicativamente 6:00-6:30) per arrivare a Bari a metà mattina." },
        { t:"Sosta a Bari - Bari Vecchia",
          tx:"Percorso a piedi consigliato: <b>Piazza del Ferrarese</b> come punto di partenza, poi dentro il centro storico verso la <b>Basilica di San Nicola</b> (tappa centrale). <b>Via dell'Arco Basso</b>, la \"strada della pasta\": le massaie preparano a mano le orecchiette sugli usci di casa, si può comprare pasta fresca o solo guardare. <b>Piazza Mercantile</b> per una sosta caffè/pranzo veloce. 2-3 ore bastano per il percorso essenziale." },
        { t:"Parcheggio a Bari",
          tx:"L'intera Bari Vecchia è <b>ZTL</b> (zona a traffico limitato): non entrare in auto. Per una sosta breve, le strisce blu lato mare (Zona D) costano ~€1/ora; in alternativa il parcheggio Cesare Battisti (sotterraneo, quartiere Murat, da ~€1,90/ora) è a pochi minuti a piedi dal centro storico. Fonti: <a href=\"https://www.regionepuglia.org/itinerario-bari-mezza-giornata/\" target=\"_blank\" rel=\"noopener noreferrer\">itinerario mezza giornata</a>, <a href=\"https://www.bariexperience.com/en/what-to-do-in-bari/parking-in-bari-where-to-park-your-car-parkride-multi-storey-car-park-ztl-paid-parking/\" target=\"_blank\" rel=\"noopener noreferrer\">parcheggi a Bari</a>." },
        { t:"Arrivo a Polignano & Check-in",
          tx:"Ultimi 35 minuti di guida da Bari. Arrivo indicativo a Polignano a Mare nel primo pomeriggio. Sistemazione in hotel/appartamento — una sola base per tutto il soggiorno, nessun cambio alloggio nei giorni successivi." },
        { t:"Sera - Centro storico di Polignano",
          tx:"Passeggiata nel centro storico, un dedalo di vicoli bianchi a picco sul mare. Sosta a <b>Lama Monachile</b>, la piccola insenatura tra le scogliere che è l'immagine simbolo del paese, e alla statua dedicata a <b>Domenico Modugno</b>, nato qui. Cena in centro storico, vista scogliera se possibile. Costo indicativo: €25-40 a persona." },
      ],
      tips:["Giornata lunga (guida + Bari + guida + arrivo): partire presto per non arrivare a Polignano troppo tardi","Bari Vecchia è ZTL: parcheggiare fuori e proseguire a piedi","Il tramonto da Lama Monachile è il momento migliore per le foto"],
      cf:"25-40", ca:"0"
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
          tx:"Il ristorante <b>Grotta Palazzese</b>, scavato in una vera grotta naturale a picco sul mare (aperta da Pasqua a ottobre), è tra i luoghi più fotografati della Puglia — ma con alcune informazioni pratiche che è meglio conoscere prima di prenotare, non solo dopo. Prezzo reale: <b>almeno €200 a persona</b> per un menu degustazione senza bevande (una bottiglia d'acqua costa già ~€10). I tavoli si assegnano all'arrivo, non alla prenotazione: prenotare con anticipo non garantisce uno dei tavoli a strapiombo sul mare. Le recensioni sono discordanti (3,4/5 su Tripadvisor, migliaia di recensioni): l'atmosfera è elogiata, ma diversi ospiti segnalano servizio lento e cucina non all'altezza del prezzo." },
        { t:"Sera",
          tx:"Cena in centro storico, oppure Grotta Palazzese consapevoli del compromesso reale (prezzo/qualità) sopra — è un'esperienza da vivere per l'ambiente, non da aspettarsi come miglior pasto del viaggio." },
      ],
      tips:["Se si prenota Grotta Palazzese, farlo sapendo che il tavolo vista mare non è garantito","Kayak e barca a noleggio sul porticciolo per vedere le grotte dal mare"],
      cf:"25-60", ca:"10-25"
      // Fonti (ricerca web 2026-07-13): prezzo, assegnazione tavoli, valutazione Tripadvisor da
      // https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/ e
      // https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html
    },
    {
      id:3, color:"#C4832A", label:"Giorno 3",
      title:"Alberobello, i Trulli",
      places:"Rione Monti · Aia Piccola · Trullo Sovrano",
      sections:[
        { t:"Come Arrivare",
          tx:"Da Polignano ad Alberobello: circa 35 km, 40-45 minuti in auto." },
        { t:"Rione Monti & Aia Piccola",
          tx:"Alberobello è patrimonio <b>UNESCO</b> per i suoi <b>trulli</b>, le caratteristiche case in pietra a secco con tetto conico bianco. <b>Rione Monti</b> è il quartiere principale, denso di trulli (molti oggi negozi di souvenir); <b>Aia Piccola</b>, dall'altra parte del paese, è più residenziale e autentico, meno turistico." },
        { t:"Trullo Sovrano",
          tx:"L'unico trullo a due piani della città, oggi piccolo museo. Ingresso a pagamento, pochi euro." },
        { t:"Pranzo",
          tx:"Pranzo in una trattoria del centro storico: cucina della Valle d'Itria, orecchiette, verdure locali." },
      ],
      tips:["Rione Monti è molto turistico: Aia Piccola offre scorci più tranquilli","Nelle ore centrali fa molto caldo, poca ombra tra i trulli"],
      cf:"20-35", ca:"5-10"
    },
    {
      id:4, color:"#7B4F9E", label:"Giorno 4",
      title:"Ostuni, la Città Bianca",
      places:"Centro storico · Cattedrale · Costa Ostunese",
      sections:[
        { t:"Come Arrivare",
          tx:"Da Polignano a Ostuni: circa 50 km, 50-60 minuti in auto." },
        { t:"Mattino - Il centro storico",
          tx:"Ostuni è nota come <b>la Città Bianca</b> per il centro storico interamente imbiancato a calce, arroccato su una collina con vista sulla piana degli ulivi e sul mare. Vicoli stretti, scalinate, la <b>Concattedrale di Ostuni</b> con il grande rosone gotico." },
        { t:"Pomeriggio - Mare, meno affollato",
          tx:"Sulla costa di Ostuni, <b>Torre Pozzelle</b> ha una serie di calette selvagge tra gli scogli, e <b>Costa Merlata</b> insenature rocciose meno battute delle spiagge principali — alternative valide a Rosa Marina se si cerca meno folla. Fonte: <a href=\"https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Villa Gapanthus</a>." },
      ],
      tips:["Il centro storico è ripido e acciottolato: scarpe comode","Vista migliore sulla città bianca dalla strada che arriva da sud"],
      cf:"20-35", ca:"0"
      // Fonte spiagge (ricerca web 2026-07-13): https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/
    },
    {
      id:5, color:"#1A7A6E", label:"Giorno 5",
      title:"Monopoli",
      places:"Centro storico · Porto · Castello di Carlo V",
      sections:[
        { t:"Come Arrivare",
          tx:"Da Polignano a Monopoli: solo 12 km, 15-20 minuti in auto — la tappa più vicina, giornata più rilassata." },
        { t:"Centro storico & Porto",
          tx:"Monopoli ha un centro storico bianco simile a Polignano ma più esteso, cinto da mura, con un <b>porto peschereccio</b> ancora attivo pieno di barche colorate. Il <b>Castello di Carlo V</b>, sul mare, domina il porto vecchio." },
        { t:"Mare, meno affollato",
          tx:"A sud del centro, <b>Spiaggia di Porto Ghiacciolo</b> (5 minuti in auto) è segnalata come la spiaggia migliore della zona, sabbia dorata e acqua limpida. Più selvagge: <b>Port'Alga</b> (Scoglio dell'Eremita) e <b>Torre Incina</b>, buone per lo snorkeling; <b>Cala Verde</b>, dietro il campeggio Santo Stefano, è la più remota e meno frequentata. Fonti: <a href=\"https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Villa Gapanthus</a>, <a href=\"https://roamandthrive.com/best-beaches-monopoli-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Roam & Thrive</a>." },
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
      { nm:"Grotta Palazzese", tags:["Pesce","$$$$"], note:"Ristorante scavato in una grotta naturale a picco sul mare. Prezzo reale almeno €200/persona, tavolo vista mare non garantito anche prenotando, recensioni discordanti (3,4/5 Tripadvisor) — dettaglio completo nel Giorno 2. Fonte: <a href=\"https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/\" target=\"_blank\" rel=\"noopener noreferrer\">Dissapore</a>, <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>.", sp:"Esperienza per l'ambiente, non il miglior pasto del viaggio", tripadvisor:"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html" },
      // Nessun campo thefork per Grotta Palazzese: verificato che non ha una scheda su TheFork,
      // prenota solo dal proprio sito ufficiale (grottapalazzese.it) — non inventato un link.
      { nm:"Pescaria", tags:["Pesce","Street food","$"], note:"Piazza Aldo Moro 6-8. Il primo fast food di pesce d'Italia, nato qui a Polignano: panini di mare, tartare di tonno, fish and chips. Informale, senza prenotazione. 4,8/5 su Restaurant Guru, #10 su 205 ristoranti di Polignano su Tripadvisor. Fonte: <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>, <a href=\"https://www.yelp.com/biz/pescaria-polignano-a-mare\" target=\"_blank\" rel=\"noopener noreferrer\">Yelp</a>.", sp:"Ottima alternativa economica a Grotta Palazzese", tripadvisor:"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html", thefork:"https://www.thefork.it/ristorante/pescaria-polignano-r849503" },
    ]},
    { area:"Alberobello", days:"Giorno 3 pranzo", items:[
      { nm:"Trattoria in un trullo", tags:["Valle d'Itria","$-$$"], note:"Voce indicativa: diversi ristoranti del centro storico occupano trulli veri. Orecchiette, verdure sott'olio, formaggi locali." },
    ]},
    { area:"Ostuni", days:"Giorno 4 pranzo", items:[
      { nm:"Ristorante del centro storico", tags:["Pugliese","$-$$"], note:"Voce indicativa: cucina pugliese classica (fave e cicorie, orecchiette, carne alla brace) nel centro storico della città bianca." },
    ]},
    { area:"Monopoli", days:"Giorno 5", items:[
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
      { t:"Contanti €100-150" },
      { t:"Carta di credito / bancomat" },
    ]},
    { cat:"Abbigliamento", items:[
      { t:"Magliette leggere (x5-6)" },
      { t:"Pantaloncini" },
      { t:"Abiti / vestiti per le cene",  n:"1-2 outfit" },
      { t:"Sandali da camminata" },
      { t:"Scarpe comode per centri storici acciottolati", n:"Ostuni e Alberobello sono ripidi/sconnessi" },
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
    ]},
  ],

  // Nessun hotelChange: una sola base per tutto il soggiorno, niente banner di cambio hotel.

  // Onestà: a differenza delle voci sopra (Bari, Grotta Palazzese, Pescaria, spiagge), qui non
  // ho fatto una ricerca dedicata su hotel/B&B reali di Polignano: prezzi e nomi sono indicativi,
  // da verificare su Booking/Airbnb prima di prenotare (agosto è alta stagione).
  accommodation: {
    subtitle: "Una sola base per tutto il soggiorno — prezzi indicativi, non verificati",
    bases: [
      {
        name: "Polignano a Mare", location: "Giorni 1-6 (5 notti)",
        badge: "Unica base", badgeBg: "#E3F7EE", badgeColor: "#1DAD70",
        options: [
          { name:"Hotel/B&B nel centro storico", price:"indicativo €90-160 / notte (doppia, alta stagione agosto)", desc:"Voce non verificata con una ricerca dedicata: controllare prezzi e disponibilità reali su Booking/Airbnb, prenotare con largo anticipo per agosto." },
          { name:"Alternativa - Airbnb/appartamento", price:"indicativo €100-180 / notte", desc:"Con cucina propria, utile per colazioni o pranzi più economici." },
        ]
      },
    ]
  },

  // Alloggio: indicativo, non ricercato (Alloggio diventa dinamico se confermi una prenotazione
  // reale o salvi un alloggio da Pianifica, vedi renderInfoCosts/resolveAccommodationCost in
  // public/index.html — questa riga resta solo il valore di partenza). Pasti/Biglietti: somma
  // delle stime cf/ca già scritte in ogni giorno sopra, coerenti con quei valori.
  // Carburante: ricalcolato con dati reali (2026-07-13), non più una stima approssimativa —
  // distanze via OSRM (Civitanova-Bari-Polignano A/R 924,4 km; Polignano-Alberobello A/R 60,2 km;
  // Polignano-Ostuni A/R 98,8 km; Polignano-Monopoli A/R 22,8 km — totale 1106,2 km), consumo
  // reale Alfa Romeo Giulietta 1.6 JTD diesel (2019) da fonti citate: 4,7-5,0 L/100km ciclo misto
  // ufficiale (test reali spesso migliori, ~4L/100km). Fonti:
  // https://it.motor1.com/reviews/375130/alfa-romeo-giulietta-diesel-manuale-prova-consumi/
  // https://www.linkmotors.it/scheda-tecnica/auto/2019-Alfa-Romeo-Giulietta-Type/36540/
  costEstimate: {
    subtitle: "Per persona, camera doppia condivisa — stima indicativa",
    rows: [
      { label:"Alloggio", desc:"5 notti a Polignano a Mare, alta stagione agosto (indicativo, non verificato — diventa reale se confermi una prenotazione o salvi un alloggio da Pianifica)", amount:"€225-400", kind:"accommodation" },
      { label:"Pasti", desc:"Somma delle stime giornaliere sopra (Giorni 1-6)", amount:"€120-225" },
      { label:"Biglietti e attività", desc:"Grotta Palazzese/Pescaria escluse (già in Pasti se scelte), Trullo Sovrano incluso", amount:"€15-35" },
      { label:"Carburante diesel", desc:"1106 km reali (Civitanova-Bari-Polignano A/R + spostamenti locali, calcolati con OSRM), Alfa Romeo Giulietta 1.6 JTD diesel 2019 (4,7-5,0L/100km reale), €1.65/L, diviso tra 2 persone. Fonti: <a href=\"https://it.motor1.com/reviews/375130/alfa-romeo-giulietta-diesel-manuale-prova-consumi/\" target=\"_blank\" rel=\"noopener noreferrer\">Motor1</a>, <a href=\"https://www.linkmotors.it/scheda-tecnica/auto/2019-Alfa-Romeo-Giulietta-Type/36540/\" target=\"_blank\" rel=\"noopener noreferrer\">scheda tecnica</a>.", amount:"€43-46" },
      { label:"Extra e imprevisti", amount:"€50-100" },
    ],
    total: { sub:"6 giorni, tutto incluso" },
    // Importo di coppia (non per persona), sottratto coerentemente da tutte le viste che mostrano
    // un totale (Info & Costi per persona, Costi il totale reale) — vedi renderInfoCosts e
    // renderCostsDashboard in public/index.html. Scaduto dopo validUntil: non piu' applicato
    // automaticamente, per non mostrare uno sconto non piu' reale.
    discount: { amount: 74.66, desc: "Sconto disponibile su questa prenotazione", validUntil: "2026-07-30" }
  },

  tickets: [
    { name:"Basilica di San Nicola (Bari)", price:"Gratuito", free:true },
    { name:"Bari Vecchia (passeggiata)", price:"Gratuito", free:true },
    { name:"Trullo Sovrano (Alberobello)", price:"€1-2" },
    { name:"Centro storico Ostuni", price:"Gratuito", free:true },
    { name:"Centro storico Monopoli", price:"Gratuito", free:true },
  ],

  savingTips: [
    "Pescaria è un'alternativa economica di qualità a Grotta Palazzese per un pasto di pesce, senza il conto da occasione speciale",
    "Aia Piccola ad Alberobello ha gli stessi trulli di Rione Monti, meno negozi per turisti",
    "Spiagge libere (Torre Pozzelle, Porto Ghiacciolo, Cala Verde) invece di stabilimenti a pagamento",
  ],
};
