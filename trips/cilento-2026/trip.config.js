/**
 * trip.config.js - viaggio: cilento-2026
 *
 * File di configurazione del viaggio. È l'unico file (insieme a questa intera
 * cartella trips/cilento-2026/) che cambia tra un viaggio e l'altro. index.html
 * non va mai modificato per un nuovo viaggio.
 *
 * Per un nuovo viaggio:
 *   1. Copia questa cartella in trips/<nuovo-nome>/
 *   2. Cambia TRIP_ID con un identificativo univoco (es. "tokyo-2026")
 *   3. FIREBASE_CONFIG resta lo stesso progetto Firebase di tutti i viaggi
 *      (un solo progetto, dati separati per viaggio via TRIP_ID) - non ricrearlo
 *   4. Modifica TRIP_META, TRIP_DATA e MAP_LOCATIONS con i nuovi dati
 *   5. Dentro trips/<nuovo-nome>/: firebase deploy
 *
 * Convenzione di stile del contenuto (vale per ogni viaggio, non solo questo):
 * nessuna emoji, nessun trattino lungo. La shell non usa piu' emoji per
 * icone (day-ico mostra il numero del giorno, le sezioni non hanno icona),
 * quindi i campi icon/i/em non esistono piu' in questo schema.
 */

// ─── IDENTIFICATIVO DEL VIAGGIO ────────────────────────────────────────────────
// Namespace dei documenti Firestore di questo viaggio: tutti i percorsi in
// index.html sono trips/{TRIP_ID}/content/... e trips/{TRIP_ID}/state/...,
// cosi' piu' viaggi possono condividere lo stesso progetto Firebase senza
// sovrascrivere i dati gli uni degli altri. Deve essere univoco tra i viaggi.

export const TRIP_ID = "cilento-2026";

// ─── FIREBASE ────────────────────────────────────────────────────────────────
// Credenziali del progetto Firebase, condiviso da tutti i viaggi (progetto
// "viaggio-new" su Firebase Console). apiKey, storageBucket, messagingSenderId
// e appId non sono deducibili dal solo project id: vanno incollati da Firebase
// Console > Impostazioni progetto > Le tue app > SDK setup and configuration.

export const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_ME_ROTATED",
  authDomain:        "viaggio-new.firebaseapp.com",
  projectId:         "viaggio-new",
  storageBucket:     "viaggio-new.firebasestorage.app",
  messagingSenderId: "15558495838",
  appId:             "1:15558495838:web:e59d6320eff09870b96ecf"
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
// Contenuto della sezione di testa dell'applicazione.

export const TRIP_META = {
  badge:    "Viaggio di Coppia · Estate 2026",
  title:    "Cilento &amp; Caserta",
  subtitle: "7 giorni tra mare, natura e storia",
  stats:    [
    "7 giorni · 6 notti",
    "1 solo cambio hotel",
    "Costa Cilentana",
    "Reggia di Caserta",
    "Per due"
  ]
};

// ─── MAPPA ───────────────────────────────────────────────────────────────────
// Marker della mappa Leaflet. Ogni oggetto rappresenta un punto geografico.
// c: colore esadecimale del marker (un pin colorato semplice, nessuna icona).

export const MAP_LOCATIONS = [
  { lat:40.0064, lng:15.3743, nm:"Marina di Camerota", sub:"Base 1 · Giorni 1-4",      c:"#2B5C8A" },
  { lat:40.0547, lng:15.4874, nm:"Scario",             sub:"Giorno 1 pomeriggio",       c:"#2B5C8A" },
  { lat:40.1205, lng:15.5134, nm:"Policastro Bussentino", sub:"Giorno 1 sera",          c:"#2B5C8A" },
  { lat:40.0222, lng:15.3340, nm:"Baia degli Infreschi",  sub:"Giorno 2 trekking",      c:"#1A7A6E" },
  { lat:40.0308, lng:15.2875, nm:"Palinuro",           sub:"Giorno 3 barca",            c:"#4A90B8" },
  { lat:40.3786, lng:15.3684, nm:"Sacco - Gole del Sammaro", sub:"Giorno 4",            c:"#6B8E3E" },
  { lat:40.3753, lng:15.2806, nm:"Roscigno Vecchia",   sub:"Giorno 4 pomeriggio",       c:"#6B8E3E" },
  { lat:40.2850, lng:14.9608, nm:"Castellabate",       sub:"Giorno 5 mattino",          c:"#C4832A" },
  { lat:40.4200, lng:15.0037, nm:"Paestum",            sub:"Giorno 5 pomeriggio",       c:"#C4832A" },
  { lat:40.5797, lng:15.4706, nm:"Grotte di Pertosa-Auletta", sub:"Giorno 6 gita",      c:"#7B4F9E" },
  { lat:41.0749, lng:14.3328, nm:"Caserta - Reggia",   sub:"Base 2 + Giorno 7",         c:"#B03A2E" },
];

// ─── DATI DEL VIAGGIO ────────────────────────────────────────────────────────
// Struttura dati caricata su Firestore al primo avvio (seed automatico).
// Modificabile successivamente dalla Firebase Console o dall'app stessa.
//
// Schema:
//   days[]        → giorni dell'itinerario
//   restaurants[] → ristoranti per area geografica
//   checklist[]   → categorie con elementi spuntabili

export const TRIP_DATA = {

  days: [
    {
      id:1, color:"#2B5C8A", label:"Giorno 1",
      title:"Arrivo nel Cilento",
      places:"Scario · Policastro Bussentino",
      sections:[
        { t:"Partenza & Arrivo",
          tx:"Partenza da casa in mattinata. Arrivo a Marina di Camerota in tarda mattinata o primo pomeriggio. Check-in in hotel, sistemazione e riposo." },
        { t:"Pomeriggio - Scario & Policastro",
          tx:"Breve escursione in auto (~35 km A/R). <b>Scario</b>: pittoresco porto di pescatori con lungomare e barche colorate. <b>Policastro Bussentino</b>: castello angioino del XIII sec., centro storico medievale, porto sul Golfo di Policastro." },
        { t:"Cena",
          tx:"Ristorante <b>L'Uorto</b> a Policastro Bussentino (cucina cilentana autentica, giardino esterno - prenotare!) oppure cena nel ristorante dell'albergo. Costo: €25-40 a persona." },
      ],
      tips:["Prenotare L'Uorto almeno il giorno prima in stagione","Aperitivo romantico sul porto di Scario al tramonto prima di cena"],
      cf:"25-40", ca:"0"
    },
    {
      id:2, color:"#1A7A6E", label:"Giorno 2",
      title:"Trekking sulla Costa degli Infreschi",
      places:"Baia degli Infreschi · Cala Pozzallo · Cala Bianca",
      sections:[
        { t:"Mattino - Partenza per il sentiero",
          tx:"Colazione in albergo, poi fino alla <b>Spiaggia di Lentiscelle</b> (punto di partenza). Partenza entro le 8:30-9:00 per evitare il caldo." },
        { t:"Il Percorso - Sentiero Mediterraneo",
          tx:"Circa <b>10 km A/R</b>, difficoltà media, dislivello ±350 m, durata 4-6 ore. Tappe: Lentiscelle → <b>Cala Pozzallo</b> → <b>Cala Bianca</b> (spiaggia più bella d'Italia 2013) → <b>Baia degli Infreschi</b> (acqua verde smeraldo). Azienda Agricola Oasi Infreschi: ristoro con prodotti bio locali lungo il percorso." },
        { t:"Alternativa - Trekking + Barca",
          tx:"Trekking all'andata, ritorno in barca dal Porto degli Infreschi (costo ~€10-15/pers.)." },
        { t:"Pranzo & Sera",
          tx:"Pranzo al sacco (chiedi all'hotel) o all'Azienda Agricola Oasi Infreschi. Porta almeno 1,5-2L di acqua a testa. Cena in albergo o in paese." },
      ],
      tips:["Scarpe da trekking obbligatorie - no sandali, no sneakers","Porta costume: si fa il bagno nelle calette","Crema solare 50+ e cappello - ombra scarsa in estate"],
      cf:"5-15", ca:"0"
    },
    {
      id:3, color:"#4A90B8", label:"Giorno 3",
      title:"Le Grotte di Capo Palinuro",
      places:"Palinuro · Grotta Azzurra · Costa delle Mille Grotte",
      sections:[
        { t:"Come Arrivare",
          tx:"Palinuro si trova a circa 20-25 km da Marina di Camerota (30 min in auto). Parcheggio vicino al porto." },
        { t:"Mattino - Escursione in Barca",
          tx:"Dal Porto di Palinuro partono gozzi ogni ~30 min (9:00-17:00). Il <b>tour completo</b> (~2,5 ore) include: Grotta Azzurra (luce blu da sifone a 20m), Grotta d'Argento, Grotta del Sangue, Arco Naturale, Cala delle Sirene, 2 soste bagno." },
        { t:"Prezzi",
          tx:"<b>Solo Grotta Azzurra</b>: €10-15/adulto. <b>Tour completo</b>: €25-35/pers. <b>Tour tramonto con aperitivo</b>: da €40/pers." },
        { t:"Pranzo & Pomeriggio",
          tx:"Pranzo sul lungomare di Palinuro. Pomeriggio: spiaggia della Ficocella o esplorazione del borgo." },
      ],
      tips:["La Grotta Azzurra è più spettacolare nelle ore centrali (11-14)","Il tour al tramonto con aperitivo è l'opzione più romantica","Se soffrite di mal di mare, prendete un antinausea preventivo"],
      cf:"15-25", ca:"15-35"
    },
    {
      id:4, color:"#6B8E3E", label:"Giorno 4",
      title:"Natura e Borghi dell'Entroterra",
      places:"Sacco · Gole del Sammaro · Roscigno Vecchia",
      sections:[
        { t:"Come Arrivare",
          tx:"Da Marina di Camerota a Sacco: circa 1h-1h30 in auto (60-70 km). Strada ripida segnalata fino alle sorgenti." },
        { t:"Mattino - Gole del Sammaro",
          tx:"Spaccatura calcarea di <b>1.600 m</b> con pareti verticali a picco su pozze turchesi. Un ponte di <b>130 m</b> sovrasta il canyon. Sentiero facile con passerelle in legno. Ingresso gratuito." },
        { t:"Pomeriggio - Roscigno Vecchia",
          tx:"Il paese fantasma del Cilento, a 15 min in auto. Abbandonato per frane nel dopoguerra, oggi vi abita un solo residente. Portali in pietra, chiese abbandonate, case rurali immobili nel tempo. Ingresso gratuito." },
        { t:"Pranzo & Cena",
          tx:"Pranzo al sacco alle sorgenti del Sammaro. Cena: rientro a Marina di Camerota o trattoria locale." },
      ],
      tips:["Scarpe impermeabili: la roccia è scivolosa","Sosta obbligatoria sul Ponte di Sacco per la vista sul canyon","Roscigno: prenditi tempo, vale una visita tranquilla"],
      cf:"5-10", ca:"0"
    },
    {
      id:5, color:"#C4832A", label:"Giorno 5",
      title:"Verso Nord: Castellabate, Paestum & Caserta",
      places:"Check-out MdC → Castellabate → Paestum → Caserta",
      sections:[
        { t:"Mattino - Check-out & Partenza",
          tx:"Colazione, check-out da Marina di Camerota. <b>Castellabate e Paestum sono lungo la strada verso Caserta</b> - nessuna deviazione, tutto in linea." },
        { t:"Sosta 1 - Castellabate",
          tx:"Uno dei borghi più belli d'Italia. Vicoli medievali in pietra, portali barocchi, panorami mozzafiato sul mare. Visita libera e gratuita. Sosta: 1h-1h30." },
        { t:"Sosta 2 - Paestum",
          tx:"Tre dei templi dorici meglio conservati al mondo (VI-V sec. a.C.), patrimonio UNESCO. Include il Museo Nazionale con la Tomba del Tuffatore. Biglietto: <b>€10/persona</b>. Lungo il percorso: sosta in un caseificio per la mozzarella di bufala DOP." },
        { t:"Trasferimento a Caserta",
          tx:"Da Paestum a Caserta: circa 1h45 in auto. Arrivo in serata, check-in hotel, cena in pizzeria napoletana." },
      ],
      tips:["Partite presto da Marina di Camerota per avere tempo in tutto","Lungo la SS18 verso Paestum ci sono caseifici con bufala freschissima","Prenota biglietti Paestum online per evitare la cassa"],
      cf:"30-50", ca:"10"
    },
    {
      id:6, color:"#7B4F9E", label:"Giorno 6",
      title:"Il Fiume Sotterraneo",
      places:"Grotte di Pertosa-Auletta (gita da Caserta)",
      sections:[
        { t:"Come Arrivare",
          tx:"Da Caserta a Pertosa: circa 1h30 in auto (100 km, A2). Gita della giornata con rientro a Caserta la sera." },
        { t:"Le Grotte di Pertosa-Auletta",
          tx:"<b>Uniche in Italia</b> con fiume sotterraneo navigabile in barca (il Fiume Negro), e uniche in Europa con resti di villaggio palafitticolo del II millennio a.C. Visita guidata (~1h30): viaggio in barca, stalattiti monumentali, cascata sotterranea." },
        { t:"Biglietti",
          tx:"Adulto: <b>€18-19/pers</b>. Ridotto: €13. Prenotazione: 0975 397037 o prenotazioni@fondazionemida.it" },
        { t:"Temperatura",
          tx:"Le grotte mantengono <b>14-16°C</b> costanti. Porta una felpa anche in agosto." },
        { t:"Sera a Caserta",
          tx:"Rientro, cena campana. Passeggiata in Piazza Carlo di Borbone con la Reggia illuminata." },
      ],
      tips:["Porta assolutamente una felpa - 14°C in agosto è freddo","Prenotare in anticipo: visite a numero chiuso in alta stagione"],
      cf:"20-35", ca:"18-19"
    },
    {
      id:7, color:"#B03A2E", label:"Giorno 7",
      title:"La Reggia di Caserta & Rientro",
      places:"Reggia di Caserta · Partenza",
      sections:[
        { t:"Mattino - La Reggia",
          tx:"Il palazzo reale più grande al mondo per volume: <b>1.200 stanze</b>, 1.200 ettari di parco, patrimonio UNESCO. Include Appartamenti Reali, Parco Reale (3 km di fontane e cascate), Giardino Inglese. Visita minima: 3 ore." },
        { t:"Biglietti",
          tx:"<b>Appartamenti + Parco</b>: €14-18/pers. Prima domenica del mese: ingresso gratuito (prenota online!). Prenotazione consigliata sempre in estate." },
        { t:"Pranzo & Partenza",
          tx:"Pranzo nei pressi della Reggia. Poi partenza per rientro a casa. Caserta è collegata all'A1 (Nord) e A30/A16 (Sud)." },
      ],
      tips:["Prenota biglietti online: le code in estate sono enormi","Scarpe comode: il Parco Reale richiede molto cammino","Arriva all'apertura (8:30) per meno folla e più fresco"],
      cf:"15-25", ca:"14-18"
    },
  ],

  restaurants: [
    { area:"Scario & Policastro", days:"Giorno 1 sera", items:[
      { nm:"L'Uorto",     tags:["Cilentana","$$"],  note:"Il ristorante storico di Policastro. Cucina tradizionale con orto proprio e giardino esterno. Alici di Menaica, caciocavallo podolico, strozzapreti al polpo.", sp:"Prenotare - molto richiesto in stagione" },
      { nm:"Da Fernando", tags:["Pesce","$-$$"],    note:"A Scario, sul porto. Pesce fresco del Golfo di Policastro, frittura mista, spaghetti alle vongole." },
    ]},
    { area:"Marina di Camerota - Cene", days:"Giorni 2, 3, 4", items:[
      { nm:"Il Torrione",           tags:["Pesce","$$$"],    note:"Terrazza panoramica con vista sul mare. Eccellente per crudi di mare e pasta ai ricci.", sp:"Perfetto per una serata romantica" },
      { nm:"Osteria del Porto",      tags:["Pesce","$$"],     note:"Vicino al porto. Cucina di mare genuina: alici marinate, vongole, grigliata mista." },
      { nm:"La Cantina di Lu'Orto", tags:["Cilentana","$-$$"], note:"Cucina dell'entroterra: fagioli di Controne, formaggi locali. Buona alternativa al pesce." },
    ]},
    { area:"Entroterra Cilentano", days:"Giorno 4 pranzo", items:[
      { nm:"Azienda Agricola Oasi Infreschi", tags:["Bio","$"], note:"SUL SENTIERO degli Infreschi. Prodotti biologici propri: formaggi, conserve, piatti semplici e straordinari.", sp:"Non perderla - è sul percorso del trekking (Giorno 2)" },
      { nm:"Trattoria La Piazzetta",          tags:["Contadina","$"], note:"A Roscigno, cucina rurale cilentana: pasta e fagioli, pane fatto in casa. Prezzi bassissimi." },
    ]},
    { area:"Castellabate & Paestum", days:"Giorno 5 pranzo", items:[
      { nm:"Acquamarina",        tags:["Pesce","$$"],     note:"A Santa Maria di Castellabate, in riva al mare. Pesce del giorno, frittura di paranza." },
      { nm:"Ristorante Nettuno", tags:["Campana","$$-$$$"], note:"Storico ristorante di Paestum, di fronte ai Templi. Pasta e fagioli con cozze, bufala fresca.", sp:"Vista sui Templi - prenotare in estate" },
      { nm:"Caseificio del Borgo", tags:["Bufala","$"],   note:"Mozzarella di bufala DOP fresca dal produttore, prodotta ogni mattina alle 5.", sp:"Esperienza cilentana autentica" },
    ]},
    { area:"Caserta", days:"Giorni 5, 6, 7", items:[
      { nm:"Pepe in Grani",         tags:["Pizza","$-$$"], note:"A Caiazzo, 30 min da Caserta. Tra le migliori pizzerie d'Italia. Prenotazione obbligatoria.", sp:"Vale il viaggio - prenotare sempre" },
      { nm:"Pizzeria Sorbillo Caserta", tags:["Pizza","$-$$"], note:"Pizza napoletana classica in centro Caserta. Qualità garantita, senza prenotazione." },
      { nm:"Trattoria La Maschera", tags:["Campana","$$"],  note:"Cucina campana: pasta e patate, genovese di cipolla, ziti al ragù." },
    ]},
  ],

  checklist: [
    { cat:"Documenti", items:[
      { t:"Carta d'identità / Passaporto",          n:"Obbligatorio" },
      { t:"Patente di guida" },
      { t:"Assicurazione auto + libretto" },
      { t:"Prenotazioni hotel (screenshot offline)", n:"Per entrambe le basi" },
      { t:"Biglietti prenotati (Grotte, Reggia, Paestum)" },
      { t:"Contanti €100-200",                      n:"Zone rurali: no carte" },
      { t:"Carta di credito / bancomat" },
    ]},
    { cat:"Abbigliamento", items:[
      { t:"Magliette leggere (x5-6)" },
      { t:"Pantaloncini" },
      { t:"Abiti / vestiti per le cene",  n:"1-2 outfit" },
      { t:"Sandali da camminata" },
      { t:"Scarpe da trekking",           n:"Obbligatorie Giorno 2" },
      { t:"Scarpe comode per i musei" },
      { t:"Costume da bagno x 2" },
      { t:"Copricostume / pareo" },
      { t:"Felpa / giacchetto leggero",   n:"Per le Grotte (14°C!)" },
      { t:"Cappello da sole" },
      { t:"Occhiali da sole" },
    ]},
    { cat:"Mare & Spiaggia", items:[
      { t:"Crema solare 50+ (abbondante)" },
      { t:"Doposole idratante" },
      { t:"Telo mare x 2" },
      { t:"Borsa / sacca impermeabile" },
      { t:"Maschera e boccaglio (facoltativo)", n:"Acque cristalline" },
      { t:"Ciabatte da mare" },
    ]},
    { cat:"Trekking - Giorno 2", items:[
      { t:"Scarpe da trekking (già in valigia)", n:"Ricordatele!" },
      { t:"Calze tecniche anti-vesciche" },
      { t:"Zaino leggero 15-20L" },
      { t:"Borraccia / thermos da 1L",          n:"Min. 2L totali a testa" },
      { t:"Snack energetici (barrette, fichi, frutta secca)" },
      { t:"Pranzo al sacco",                    n:"Organizzare sera prima" },
    ]},
    { cat:"Salute & Farmacia", items:[
      { t:"Farmaci personali (scorta completa)" },
      { t:"Cerotti e kit medicazione" },
      { t:"Repellente insetti" },
      { t:"Antidolorifico / antipiretico" },
      { t:"Antinausea",                n:"Per la barca a Palinuro" },
      { t:"Cerotti anti-vesciche (Compeed)" },
    ]},
    { cat:"Tecnologia", items:[
      { t:"Caricabatterie smartphone" },
      { t:"Power bank (5000+ mAh)" },
      { t:"Cuffie / auricolari" },
      { t:"Macchina fotografica",      n:"Palinuro & Paestum" },
      { t:"Caricabatterie auto / adattatore 12V" },
      { t:"Mappe offline scaricate",   n:"Copertura scarsa in zona" },
    ]},
    { cat:"Per l'Auto", items:[
      { t:"Acqua (almeno 6-8 bottiglie x 1,5L)" },
      { t:"Snack per i trasferimenti" },
      { t:"Cassetta pronto soccorso (obbligatoria)" },
      { t:"Gilet catarifrangenti x 2 (obbligatori)" },
      { t:"Playlist viaggio creata" },
    ]},
    { cat:"Per la Coppia", items:[
      { t:"Prenotare tour tramonto a Palinuro", n:"Romantico - Giorno 3" },
      { t:"Prenotare L'Uorto a Policastro",     n:"Giorno 1" },
      { t:"Mozzarella bufala fresca a Paestum" },
      { t:"Foto in ogni tappa dell'itinerario" },
    ]},
  ],
};
