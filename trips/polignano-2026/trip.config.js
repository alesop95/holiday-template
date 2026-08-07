/**
 * trip.config.js - viaggio: polignano-2026
 *
 * File di configurazione del viaggio. È l'unico file (insieme a questa intera
 * cartella trips/polignano-2026/) che cambia tra un viaggio e l'altro. index.html
 * non va mai modificato per un nuovo viaggio.
 *
 * Nota di onestà sui contenuti: la prima stesura di questo file (giorni, ristoranti,
 * consigli) veniva da conoscenza generale, non da una ricerca dedicata. Le passate
 * successive hanno verificato con fonti reali e citabili, visibili come link cliccabili
 * dentro l'app stessa e non solo in questi commenti: la sosta a Bari, Grotta Palazzese e
 * Pescaria, le spiagge meno affollate di Monopoli, il consumo reale dell'Alfa Romeo
 * Giulietta diesel usato per il carburante in costEstimate, Alberobello (Rione Monti e Aia
 * Piccola, Trullo Sovrano con prezzo reale €2,50), le Grotte di Castellana con il listino
 * ufficiale 2026, le escursioni in barca alle grotte marine di Polignano con operatori e
 * prezzi pubblicati, e le informazioni pratiche di Lama Monachile. Dove la fonte è una
 * testimonianza diretta di chi ha già fatto questo viaggio, e non una guida citabile, è
 * marcata come tale nel testo: non è un dato verificabile con un link e non va presentato
 * come tale.
 *
 * RIORGANIZZAZIONE SU DATE REALI (2026-08-07). Fino a questa passata l'itinerario era
 * scritto senza date calendariali, con una sosta a Bari in itinere il primo giorno e una
 * giornata piena in Valle d'Itria. L'utente ha comunicato i dati reali: partenza sabato
 * 8 agosto 2026, arrivo a Polignano a Mare alle 19:00-19:30, rientro giovedì 13 agosto,
 * cinque notti. Le conseguenze sono strutturali e non cosmetiche, e sono tutte applicate
 * qui: la sosta a Bari non è più possibile all'andata (si arriva a sera) e si è spostata al
 * giorno del rientro, che passa da Bari sulla strada di casa; il Giorno 1 non contiene più
 * nessuna attività diurna, solo viaggio, check-in, cena e la passeggiata serale nel centro
 * storico; le giornate di contenuto scendono da cinque a quattro e per starci dentro sono
 * state accorpate, con Alberobello e la cena a Cisternino nella stessa serata (scelta
 * dell'utente) e con Martina Franca e Ostuni fuori dal piano, retrocesse a tappe non
 * incluse nel Giorno 6 dove conservano le loro fonti; SpeleoNight è impossibile perché la
 * prima data del calendario 2026 è il 15 agosto, due giorni dopo il rientro, e Hell in the
 * Cave ha come uniche date utili il 9 e il 14 agosto, quindi solo il 9 cadeva nel viaggio
 * ed è stato scartato dall'utente a favore della giornata di mare.
 *
 * ATTENZIONE, effetto tecnico della riorganizzazione: le checkbox delle attività usano come
 * chiave `${d.id}-${indice di sezione}` (js/itinerario.js) e le sezioni di ogni giorno sono
 * state riscritte, quindi le eventuali spunte già salvate su Firestore ora puntano a
 * sezioni diverse da quelle su cui erano state messe. Conviene azzerarle dall'app o dalla
 * Console prima di partire. Sulla checklist della valigia il quadro è più sfumato e va detto
 * per intero: le categorie Abbigliamento, Mare & Spiaggia, Salute & Farmacia, Tecnologia e
 * Per l'Auto conservano posizioni e significato di ogni voce, quindi le spunte restano
 * valide; in Documenti la quinta voce ha cambiato contenuto (era la prenotazione di Grotta
 * Palazzese, ora è il biglietto online delle Grotte di Castellana); la categoria Per la
 * Coppia è stata riscritta e ridotta da undici a sei voci, perché metà riguardava esperienze
 * e verifiche non più in programma con queste date, quindi le sue spunte vanno azzerate.
 * Le "cose da fare" seminate per giorno (todos) restano quelle verificate su OpenStreetMap
 * nel 2026-08-03 e sono state riportate sui giorni corrispondenti del piano nuovo: i luoghi
 * del centro storico sul Giorno 1, le grotte marine sul Giorno 2. Nota tecnica: state/todos
 * è seed-once, quindi sul sito già in uso restano quelle già presenti su Firestore e queste
 * righe valgono per un eventuale reseed, non per la sessione corrente.
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
  badge:    "Viaggio di Coppia · 8-13 Agosto 2026",
  title:    "Polignano a Mare & Valle d'Itria",
  subtitle: "6 giorni tra scogliere, trulli e grotte",
  stats:    [
    "8-13 agosto · 5 notti",
    "Arrivo sabato sera",
    "Una sola base",
    "Bari al rientro",
    "Per due"
  ]
};

// ─── MAPPA ───────────────────────────────────────────────────────────────────
// Coordinate dei centri storici: quelle di Bari, Martina Franca e Cisternino vengono da
// geocoding Nominatim reale fatto in sessione, quella delle Grotte di Castellana
// dall'oggetto OSM natural=cave_entrance (2026-08-07), le altre sono note generali
// sufficienti per un marker su Leaflet, da non trattare come precisione da rilevamento.
// L'ordine dell'array disegna la polyline: Martina Franca e Ostuni sono state rimosse
// insieme alle rispettive tappe, che non fanno più parte del piano.

export const MAP_LOCATIONS = [
  { lat:41.1172, lng:16.8706, nm:"Bari",                 sub:"Giorno 6 · sosta al rientro", c:"#B03A2E" },
  { lat:40.9966, lng:17.2202, nm:"Polignano a Mare",     sub:"Base · 8-13 agosto", c:"#2B5C8A" },
  { lat:40.9535, lng:17.3009, nm:"Monopoli",             sub:"Giorno 5 · mer 12",  c:"#1A7A6E" },
  { lat:40.8763, lng:17.1485, nm:"Grotte di Castellana", sub:"Giorno 3 · lun 10",  c:"#C4832A" },
  { lat:40.7827, lng:17.2378, nm:"Alberobello",          sub:"Giorno 4 · mar 11",  c:"#7B4F9E" },
  { lat:40.7430, lng:17.4257, nm:"Cisternino",           sub:"Giorno 4 · cena",    c:"#7B4F9E" },
];

// ─── DATI DEL VIAGGIO ────────────────────────────────────────────────────────

export const TRIP_DATA = {

  programSummary: "Cinque notti a Polignano a Mare, una sola base, nessun cambio hotel. Sabato 8 si arriva a sera e la giornata è solo viaggio e centro storico dopo cena. Domenica 9 mare a Polignano e tour in barca alle grotte marine, lunedì 10 Grotte di Castellana nel pomeriggio, martedì 11 Alberobello al tramonto con cena nei vicoli di Cisternino, mercoledì 12 Monopoli. Giovedì 13 check-out con sosta a Bari Vecchia sulla strada del rientro. Martina Franca e Ostuni non entrano in questo piano: restano documentate tra le tappe non incluse del Giorno 6.",

  // Video salvati durante la pianificazione, identificati il 2026-07-31: i link brevi sono stati
  // risolti seguendo i redirect e i titoli letti dall'endpoint oEmbed pubblico di TikTok. Quindi
  // autore e titolo sono reali, non inventati, ma il contenuto dei video non e' stato guardato da
  // qui (TikTok richiede login): cio' che ne e' stato estratto sta nelle descrizioni pubbliche.
  // Il video su Ostuni resta nell'elenco per completezza dello storico, ma la tappa non fa piu'
  // parte del piano: il contenuto utile che ne era stato estratto vive ora nella sezione delle
  // tappe non incluse, in coda al Giorno 6.
  savedLinks: [
    { label: "Cala Tre Buchi, caletta sulla costa di Monopoli (Toboat)", url: "https://vm.tiktok.com/ZNRoucgd7/" },
    { label: "Vlog di due giorni a Polignano a Mare (sofiabossi)", url: "https://vm.tiktok.com/ZNRousSDE/" },
    { label: "Mini tour di Ostuni a piedi (JohnPietro_PugliaSpoiler), tappa non inclusa", url: "https://vm.tiktok.com/ZNRou1gpL/" },
  ],

  days: [
    {
      id:1, color:"#2B5C8A", label:"Giorno 1",
      title:"Sabato 8 agosto - Viaggio, arrivo a sera, centro storico",
      places:"Civitanova Marche → Polignano a Mare · Centro storico · Lama Monachile dal ponte",
      sections:[
        { t:"Il viaggio: percorso diretto, nessuna sosta",
          tx:"Da Via Aurora, Civitanova Marche Alta a Polignano a Mare in diretta sono <b>460 km, circa 4h 46min</b> di guida (routing reale, non stimato), a cui vanno aggiunti i tempi morti di carburante, pause e traffico estivo di sabato. L'arrivo dichiarato è tra le <b>19:00 e le 19:30</b>, quindi la sosta a Bari che questo itinerario prevedeva all'andata non è più possibile: si è spostata al giorno del rientro, giovedì 13, dove Bari è comunque sulla strada di casa. Questa giornata non ha nessuna attività diurna, ed è meglio saperlo prima che scoprirlo guidando." },
        { t:"Check-in e il deposito cauzionale",
          tx:"Sistemazione alla <b>Magda Relax Suites</b>, unica base per tutte e cinque le notti, prenotata e già pagata su Booking. Sul posto va consegnato a parte un <b>deposito cauzionale di €150 in contanti</b>, che è rimborsabile e torna indietro al check-out di giovedì: va portato in contanti e va ricordato di riprenderlo, per questo è anche una voce della checklist." },
        { t:"Cena, con un piano B che regge un arrivo alle 19:30",
          tx:"Un sabato di agosto a Polignano senza prenotazione è realisticamente pieno, quindi la cena in un ristorante del centro storico va prenotata prima di partire, non cercata all'arrivo. Il piano B verificato è <b>Pescaria</b> in Piazza Aldo Moro 6-8, il fast food di pesce nato qui: è informale, <b>non prende prenotazioni</b> e secondo gli orari pubblicati è aperto <b>tutti i giorni dalle 11:30 alle 23:30</b>, quindi copre senza problemi un arrivo alle 19:30, con l'avvertenza che nelle ore di punta la fila c'è. Costo indicativo della serata: €25-40 a persona in ristorante, meno da Pescaria. Fonti: <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>, <a href=\"https://www.oraridiapertura24.it/filiale/Polignano%2520a%2520Mare-Pescaria-873345J.html\" target=\"_blank\" rel=\"noopener noreferrer\">orari pubblicati</a>." },
        { t:"Dopo cena: il centro storico e Lama Monachile dall'alto",
          tx:"È l'unica cosa che questa sera ci sta, ed è anche il modo giusto di iniziare: il centro storico è un dedalo di vicoli bianchi a picco sul mare e di sera è fresco e vivo. Il giro essenziale sta in un'ora: la <b>balconata su Lama Monachile</b>, che di notte si vede illuminata dal ponte e resta il punto panoramico simbolo del paese, la statua dedicata a <b>Domenico Modugno</b>, nato qui, <b>Piazza Ardito</b> e la Galleria Santo Stefano. In spiaggia non si scende: il bagno a Lama Monachile è programmato per domani mattina presto, quando la caletta è ancora vuota. Testimonianza diretta di chi ha già fatto questo viaggio: <b>Super Mago del Gelo</b>, a due passi da Pescaria, fa un caffè particolare (amaretto e agrumi) che pare si trovi solo lì e vale la sosta, con l'orario di chiusura da verificare sul posto perché non ho una fonte per gli orari estivi." },
        { t:"Cosa è stato spostato da questa giornata",
          tx:"Per chiarezza, visto che l'itinerario precedente prometteva altro. La <b>sosta a Bari Vecchia</b> è nel Giorno 6, al rientro, con lo stesso percorso a piedi e le stesse indicazioni di parcheggio già verificate. Il <b>mare</b> e le <b>grotte marine</b> sono nel Giorno 2. Le <b>Grotte di Castellana</b> sono nel Giorno 3. Nulla è stato cancellato per fare spazio all'arrivo serale, tranne le tappe che non entravano comunque in cinque giorni, elencate in coda al Giorno 6." },
      ],
      tips:["Partire con calma ma non tardi: 460 km più le pause vogliono la mattina intera","Prenotare la cena di sabato prima di partire, oppure contare su Pescaria, che non prende prenotazioni e chiude alle 23:30","Portare i €150 del deposito cauzionale in contanti: non è una spesa, torna al check-out","Stasera solo centro storico: il bagno a Lama Monachile è domani entro le 9"],
      cf:"25-40", ca:"0",
      // Cose da fare seminate per questo giorno: luoghi del centro storico di Polignano, tutti
      // raggiungibili a piedi dopo cena. Il tipo di ciascun luogo e' stato verificato il
      // 2026-08-03 interrogando Overpass su OpenStreetMap (tutti e sei trovati con il nome esatto
      // entro 9 km da Polignano) e scritto in italiano tra parentesi: tourism=viewpoint ->
      // punto panoramico, amenity=restaurant -> ristorante, tourism=museum -> museo,
      // historic=memorial -> memoriale. Serviva perche' dai soli nomi non si capiva che
      // "La colonna" e "La Veranda di Giselda" sono ristoranti.
      todos:["Balconata Lama Monachile (punto panoramico)","Galleria Santo Stefano, ex chiesetta (museo)","La colonna (ristorante)","La Veranda di Giselda (ristorante)","Monumento ai caduti (memoriale)","Piazza Ardito (punto panoramico)"]
      // Distanza e tempo Civitanova-Polignano diretti: OSRM reale, coerenti con il calcolo della
      // sessione 2026-07-13 (460 km, 4h46) che allora serviva a giustificare la sosta a Bari.
      // Orari di Pescaria: fonte secondaria di orari pubblicati, non il sito dell'insegna, che non
      // espone un orario. Verificati due riscontri concordi (11:30-23:30, tutti i giorni).
    },
    {
      id:2, color:"#4A90B8", label:"Giorno 2",
      title:"Domenica 9 agosto - Lama Monachile presto e grotte marine dal mare",
      places:"Lama Monachile · Cala Porto · Cala Paura · Tour in barca alle grotte",
      sections:[
        { t:"Prima cosa, entro le 9: Lama Monachile",
          tx:"La caletta, chiamata anche <b>Cala Porto</b>, sta a circa <b>300 metri dal centro</b>, meno di cinque minuti a piedi, e l'ingresso è <b>gratuito e libero tutto l'anno</b>. Sull'orario le fonti concordano e il consiglio è netto: in estate si riempie molto presto, quindi <b>entro le 8:30-9:00</b> del mattino oppure <b>dopo le 17:00</b>, e una domenica di agosto è il caso peggiore possibile, quindi qui la sveglia presto non è un vezzo. Il fondo è di <b>ciottoli</b>, non di sabbia: le scarpette da scoglio sono la differenza tra stare comodi e non starci, e per questo sono in valigia. La spiaggia <b>non è attrezzata</b> - niente lettini, ombrelloni, docce pubbliche o punti ristoro sulla riva, i locali stanno sopra - e in auto non si arriva: <b>nessun parcheggio dedicato</b>, si usano le strisce blu del centro (Via Pompeo Sarnelli, Via San Vito, Via Martiri di Dogali) o il parcheggio di <b>Via San Francesco da Paola</b>, a circa un chilometro a piedi. Non è adatta a passeggini e carrozzine: scalini e ciottoli, nessuna rampa. Fonti: <a href=\"https://www.spiagge.it/magazine/lama-monachile/\" target=\"_blank\" rel=\"noopener noreferrer\">Spiagge.it</a>, <a href=\"https://www.regionepuglia.org/lama-monachile/\" target=\"_blank\" rel=\"noopener noreferrer\">Regione Puglia</a>, <a href=\"https://lamamonachile.com/en/2025/10/21/how-to-get-to-lama-monachile-polignano-mare/\" target=\"_blank\" rel=\"noopener noreferrer\">come raggiungere Lama Monachile</a>." },
        { t:"Lama Monachile: due punti su cui le fonti non concordano",
          tx:"Due cose vanno dichiarate come discordanti invece di essere appiattite in un dato pulito. Sul <b>ponte</b> che sovrasta la caletta le guide si contraddicono: una lo chiama ponte romano della <b>Via Traiana</b> e attribuisce il ponte sopra la spiaggia al periodo <b>borbonico, Ottocento</b>; un'altra fonde le due cose in \"Ponte Borbonico della Via Traiana\" datandolo al <b>II secolo d.C.</b>, che con l'attributo borbonico non sta insieme. Nessuna fonte consultata chiude la questione, quindi resta aperta: il punto panoramico è quello, la sua datazione no. Sugli <b>accessi</b> il conteggio cambia: due secondo due guide (la scalinata in pietra sotto il ponte, ripida e diretta, e un sentiero più dolce dalla parte del <b>Bastione di Santo Stefano</b>), tre secondo una terza, che indica <b>Piazza Garibaldi</b> con una scalinata ripida, <b>Piazza Bonsante</b> dal lato del parcheggio San Francesco e <b>Largo Gelso</b> vicino alla statua di Modugno. Il pratico che resta valido: scendendo con borse e attrezzatura conviene la via meno ripida, non la scalinata sotto il ponte." },
        { t:"Le calette e le grotte, dopo la prima mattina",
          tx:"Quando Lama Monachile si affolla, le alternative a piedi o a pochi minuti sono <b>Cala Paura</b>, più grande e frequentata dai locali, e le calette sotto il centro storico. Le grotte marine invece non si raggiungono da terra: sono la ragione della barca, prevista nel pomeriggio." },
        { t:"Tour in barca alle grotte marine: operatori e prezzi reali",
          tx:"Le grotte di questa costa sono quasi tutte <b>visitabili solo dal mare</b>, quindi il tour in barca non è un extra ma il modo per vederle. Le escursioni collettive partono dal porto turistico <b>Cala Ponte Marina</b> o dal porticciolo di <b>San Vito</b> e durano tra <b>un'ora e mezza e due ore</b>, con sosta per il bagno e spesso un aperitivo a bordo. Prezzi a persona pubblicati al 2026-08-07 su un aggregatore di prenotazioni, quindi confrontabili tra loro ma da riverificare in fase di acquisto: <b>Dorino Gite in Barca €20</b> per 1h30 con snorkeling e aperitivo, <b>Rent Me Charter €20</b> per 1h45, <b>Escursioni Sofia €25</b> per 2h, <b>Pugliamare €30</b> per 1h30 con aperitivo, <b>Blue Wave €30</b> per 2h da San Vito. Un operatore che espone il listino sul proprio sito, <b>MammaMia Boat</b>, chiede <b>€40 a persona</b> per l'escursione di gruppo di 2 ore con transfer incluso, massimo 12 persone, giubbotti e teli mare compresi. Le grotte tipicamente incluse sono <b>Grotta delle Rondinelle, Grotta Ardito, Grotta Palazzese, il Grottone, Cala Paura, Cala Port'Alga, Grotta degli Innamorati</b> e lo <b>Scoglio dell'Eremita</b>. Fonti: <a href=\"https://www.checkyeti.com/it/boat-tours/italia/polignano-a-mare/gite-in-barca-alle-grotte\" target=\"_blank\" rel=\"noopener noreferrer\">listino comparato CheckYeti</a>, <a href=\"https://mammamiaboat.com/\" target=\"_blank\" rel=\"noopener noreferrer\">MammaMia Boat</a>." },
        { t:"Quale tour conviene in due, e cosa può farlo saltare",
          tx:"In due la scelta economicamente sensata è il <b>collettivo</b>: le stesse grotte, la stessa costa, €20-40 a testa. Il <b>privato</b> si paga a barca e non a persona - €300-400 per due ore secondo gli <a href=\"https://www.checkyeti.com/it/boat-tours/italia/polignano-a-mare/gite-in-barca-alle-grotte\" target=\"_blank\" rel=\"noopener noreferrer\">stessi listini</a>, €380 di partenza per l'<a href=\"https://mammamiaboat.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Exclusive di MammaMia</a> - quindi per una coppia sono <b>€150-200 a testa</b> per avere la barca da soli: si giustifica se la privacy è il punto, non per vedere più grotte. Chi vuole entrare nelle cavità più piccole ha come alternativa il <b>kayak</b>, che diversi operatori propongono con istruttore fino alla Grotta Palazzese: qui non ho trovato un prezzo pubblicato verificabile, quindi non lo invento e resta da chiedere sul porticciolo. Due avvertenze pratiche. Il mare comanda: con onda o vento le uscite si annullano, quindi conviene prenotare con <b>cancellazione gratuita</b> (tutti gli operatori del listino comparato la offrono) e sapere che se domenica il mare è mosso il tour si sposta a lunedì mattina o a mercoledì, non si perde. E la partenza del tardo pomeriggio, quella per il tramonto dal mare, è la più richiesta di agosto: va prenotata oggi, non domenica mattina." },
        { t:"Grotta Palazzese: cosa sapere, e il realismo su una domenica di agosto",
          tx:"Il ristorante <b>Grotta Palazzese</b>, scavato in una vera grotta naturale a picco sul mare, è tra i luoghi più fotografati della Puglia, ma le informazioni pratiche vanno sapute prima. Prezzo reale: <b>almeno €200 a persona</b> per un menu degustazione senza bevande. I tavoli si assegnano all'arrivo, non alla prenotazione: prenotare con anticipo non garantisce uno dei tavoli a strapiombo. Le recensioni sono discordanti (3,4/5 su Tripadvisor, migliaia di recensioni): l'atmosfera è elogiata, servizio e cucina no, non a quel prezzo. Il realismo su queste date: senza una prenotazione già in mano, una domenica di metà agosto è la sera meno probabile dell'anno per trovare posto, quindi non è su questa cena che si costruisce la serata. Fonti: <a href=\"https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/\" target=\"_blank\" rel=\"noopener noreferrer\">Dissapore</a>, <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>." },
        { t:"Sera",
          tx:"Cena in centro storico o da Pescaria, senza spostamenti in auto: è l'unica giornata del viaggio completamente a piedi, e conviene tenerla tale perché domani si guida e martedì si rientra tardi." },
      ],
      tips:["Sveglia presto: una domenica di agosto Lama Monachile si riempie prima delle 9","Scarpette da scoglio e acqua da casa: sulla riva non c'è nulla","Prenotare il tour in barca oggi, con cancellazione gratuita: gli slot del tramonto vanno via prima","Se il mare è mosso il tour si annulla: si recupera lunedì mattina o mercoledì, non si perde","Giornata senza auto: approfittarne, domani e dopodomani si guida"],
      cf:"25-45", ca:"20-40",
      // Cose da fare seminate per questo giorno: le grotte marine della costa di Polignano, cioe'
      // esattamente quelle che il tour in barca costeggia, piu' due ristoranti sulla stessa zona di
      // costa. Tipo verificato il 2026-08-03 via Overpass su OpenStreetMap sugli stessi 14 nomi:
      // tutti trovati con il nome esatto, dodici tourism=viewpoint (quasi tutti anche
      // natural=cave_entrance), Cozze Nere amenity=restaurant, e Grotta Palazzese che porta
      // entrambi i tag - per questo e' annotata come ristorante e punto panoramico insieme.
      todos:["Arco Cala Di Luna (punto panoramico)","Cozze Nere (ristorante)","Grotta Ardito (punto panoramico)","Grotta delle monache (punto panoramico)","Grotta delle rondinelle (punto panoramico)","Grotta di Pietro e Paolo 1 e 2 (punto panoramico)","Grotta di Santa Caterina 2 (punto panoramico)","Grotta Frascina (punto panoramico)","Grotta Palazzese (ristorante e punto panoramico)","Grotta piana - Grotta del basso porto (punto panoramico)","Grotta Pietropaolo - Grotticella sotto Favale (punto panoramico)","Grotta San Gennaro (punto panoramico)","Grotticella di Santo Stefano (punto panoramico)","Pietra Piatta (punto panoramico)"]
    },
    {
      id:3, color:"#C4832A", label:"Giorno 3",
      title:"Lunedì 10 agosto - Grotte di Castellana nel pomeriggio",
      places:"Mattina libera a Polignano · Grotte di Castellana · Sera in centro",
      sections:[
        { t:"Come si incastra la giornata",
          tx:"Le Grotte di Castellana sono a <b>17,4 km, 20 minuti</b> di auto da Polignano (routing reale ricalcolato in sessione), quindi non serve dedicargli una giornata intera: mattina lenta, bagno o centro storico, partenza nel primo pomeriggio, visita nelle ore più calde, rientro per cena. È l'incastro giusto anche per il caldo, perché sottoterra la temperatura è bassa e costante mentre fuori sono le ore peggiori." },
        { t:"Quale percorso, quanto costa, a che ora",
          tx:"La visita si fa solo con guida e a turni, e la scelta è tra due percorsi. Il <b>percorso completo</b> è di <b>3 km</b> per circa <b>100 minuti</b> e arriva alla <b>Grotta Bianca</b>, l'ambiente più spettacolare del complesso; il <b>percorso parziale</b> è di <b>1 km</b> per circa <b>50 minuti</b> e la Grotta Bianca non la vede. Prezzi ufficiali 2026 in biglietteria: <b>intero dai 15 anni €25</b> il completo e <b>€22</b> il parziale, ridotto 6-14 anni €22 e €19, gratis sotto i 5 anni. Attenzione a un errore facile: diverse guide secondarie riportano ancora €22 e €19 come prezzi <b>interi</b>, che nel listino ufficiale sono i ridotti, quindi il preventivo si fa sul sito e non su una guida. L'acquisto online aggiunge commissioni e un supplemento di prenotazione anticipata, ma a metà agosto è la scelta giusta perché i turni si esauriscono: va comprato prima di partire, non davanti alla cassa. Sugli orari va dichiarato il livello di verifica: il calendario ufficiale è pubblicato come immagine, quindi non leggibile come testo, e la scansione per agosto - completo <b>ogni ora dalle 9:00 alle 18:00</b>, parziale alle 13:15, 14:15, 18:15 e 19:15 - viene da una guida secondaria che la riporta per esteso, quindi va confermata sul sito. Su questo le fonti secondarie non sono nemmeno d'accordo tra loro: un'altra parla genericamente di partenze ogni ora dalle 9:00 alle 19:00 per l'estate, un'ora più tardi dell'ultimo turno completo indicato sopra, che è esattamente il tipo di scarto per cui non conviene arrivare all'ultimo turno sulla fiducia. L'indirizzo è <b>Piazzale Anelli</b> a Castellana Grotte, con i parcheggi a pagamento P1 e P2 accanto all'ingresso e un P3 al centro commerciale di Via Putignano servito da navetta. Fonti: <a href=\"https://www.grottedicastellana.it/informazioni-utili/orari-e-prezzi/\" target=\"_blank\" rel=\"noopener noreferrer\">orari e prezzi ufficiali</a>, <a href=\"https://www.grottedicastellana.it/informazioni-utili/come-raggiungerci-2/\" target=\"_blank\" rel=\"noopener noreferrer\">come raggiungerci e parcheggi</a>, <a href=\"https://www.unviaggioinfiniteemozioni.it/grotte-di-castellana-visita/\" target=\"_blank\" rel=\"noopener noreferrer\">orari di agosto turno per turno, guida secondaria</a>, <a href=\"https://www.informazioni-turistiche.it/grotte-di-castellana-orari-prezzi-percorsi-e-consigli-per-visitarle/\" target=\"_blank\" rel=\"noopener noreferrer\">seconda guida, che dà 9:00-19:00 generico</a>." },
        { t:"Cosa portarsi dietro, e la testimonianza di chi ci è già stato",
          tx:"Il fondo è umido e in alcuni tratti scivoloso: servono scarpe chiuse con suola antiscivolo, non infradito. La temperatura sotterranea resta costante e bassa - le fonti secondarie indicano circa 16-18 gradi, il dato ufficiale non l'ho trovato - quindi una felpa leggera serve davvero anche in pieno agosto, ed è in valigia per questo. Testimonianza diretta di chi ha già fatto questo viaggio, non una guida: sono paragonabili alle Grotte di Frasassi, forse un po' meno spettacolari, e il fresco rispetto al caldo di agosto è reale e non un dettaglio." },
        { t:"Le due esperienze speciali che con queste date non si possono fare",
          tx:"Le grotte offrono due cose molto più interessanti della visita turistica, e vanno dette insieme al motivo per cui non rientrano, così non le si cerca invano. <b>SpeleoNight</b> è la visita al buio con gli speleologi, 3 km fino alla Grotta Bianca illuminati solo dal caschetto, €28 più commissioni, minimo 2 ore, età minima 7 anni: il calendario estivo 2026 parte dal <b>15 agosto</b>, due giorni dopo il rientro, quindi è fuori portata per questo viaggio. <b>Hell in the Cave</b> è l'Inferno di Dante messo in scena con danza, voci e luci nella <b>Caverna della Grave</b> (100 metri per 50, profonda 60), €25 a persona o <b>€42 in combinato</b> con la visita: le date di agosto sono <b>9, 14, 22 e 29 alle 21:00</b>, quindi l'unica compatibile era domenica 9, che è stata scelta come giornata di mare e tour in barca. Se i piani cambiassero, lo spettacolo si prenota al numero indicato dalla sua scheda ufficiale e risulta distribuito anche sul circuito TicketOne, che però non ho potuto verificare da qui e quindi non linko. Fonti e acquisto: <a href=\"https://www.grottedicastellana.it/esperienze/speleonight/\" target=\"_blank\" rel=\"noopener noreferrer\">scheda SpeleoNight</a>, <a href=\"https://www.grottedicastellana.it/esperienze/hell-in-the-cave/\" target=\"_blank\" rel=\"noopener noreferrer\">scheda Hell in the Cave</a>, <a href=\"https://shop.grottedicastellana.it/webshop/webticket/timeslot\" target=\"_blank\" rel=\"noopener noreferrer\">biglietteria online delle grotte</a>." },
        { t:"Sera libera a Polignano",
          tx:"Rientro a Polignano in venti minuti e serata in centro storico, volutamente scarica: domani si rientra tardi da Cisternino e conviene arrivarci riposati." },
      ],
      tips:["Comprare il biglietto online prima di partire: a metà agosto i turni guidati si esauriscono","Percorso completo, non parziale: €3 in più e in cambio c'è la Grotta Bianca","Felpa leggera e scarpe chiuse antiscivolo: dentro ci sono 16-18 gradi costanti e il fondo è umido","Andarci nel pomeriggio, non la mattina: sono le ore in cui fuori si sta peggio","Gli orari dei turni di agosto nel file vengono da una fonte secondaria: confermarli sul sito ufficiale"],
      cf:"20-35", ca:"25-30"
    },
    {
      id:4, color:"#7B4F9E", label:"Giorno 4",
      title:"Martedì 11 agosto - Alberobello al tramonto, cena a Cisternino",
      places:"Rione Monti · Aia Piccola · Trullo Sovrano · Cisternino",
      sections:[
        { t:"Perché si parte nel tardo pomeriggio",
          tx:"Testimonianza diretta di chi ha già fatto questo viaggio: Alberobello va tenuta per la sera, quando i trulli si accendono con le lucine, perché è molto più bella così che di giorno, e in agosto vuol dire anche non prendere il caldo peggiore tra vicoli senza ombra. Da Polignano ad Alberobello sono <b>33,1 km, 34 minuti</b> (routing reale), quindi partendo intorno alle 17:30-18:00 si arriva con la luce ancora buona, si gira mentre cala il sole e si resta per il buio, che è il momento delle lucine. Va detto anche il rovescio: è abbastanza una turistata, al novantanove per cento negozi di souvenir, ma è una tappa da fare una volta nella vita." },
        { t:"Rione Monti e Aia Piccola",
          tx:"Alberobello è patrimonio <b>UNESCO dal 1996</b> per i suoi <b>trulli</b>, le case in pietra a secco con tetto conico costruite senza malta, una tecnica preistorica ancora in uso in questa zona: la scheda UNESCO conta <b>oltre 1.500</b> di queste costruzioni tra i due rioni del paese. <b>Rione Monti</b> (oltre 1.000 trulli) è il quartiere principale e scenografico, oggi in gran parte negozi; <b>Aia Piccola</b> (400 trulli), dall'altra parte del paese, è molto meno turistica, ancora abitazioni vere, il nucleo più antico, e la sera è la parte più suggestiva. Percorso consigliato: dal belvedere si scende nel Rione Monti, poi si passa ad Aia Piccola per vedere la differenza tra la parte in vetrina e quella vissuta. Fonti: <a href=\"https://whc.unesco.org/en/list/787\" target=\"_blank\" rel=\"noopener noreferrer\">scheda UNESCO dei Trulli di Alberobello</a>, <a href=\"https://www.marcotogni.it/cosa-vedere-alberobello/\" target=\"_blank\" rel=\"noopener noreferrer\">Marco Togni</a>." },
        { t:"Trullo Sovrano, se si arriva in orario",
          tx:"L'unico trullo a due piani della città (fine XVIII secolo, monumento nazionale dal 1930), oggi piccolo museo con ambienti ricostruiti: panificio, camera da letto, cucina. Biglietto <b>€2,50</b>, in Piazza Sacramento 10. È l'unica cosa della serata che dipende da un orario di chiusura, quindi va verificato sul <a href=\"https://www.trullosovrano.eu/ingresso-biglietti/\" target=\"_blank\" rel=\"noopener noreferrer\">sito ufficiale</a> prima di contarci: arrivando per il tramonto potrebbe essere già chiuso, e in quel caso salta solo questo, non la serata." },
        { t:"Cena nei vicoli di Cisternino",
          tx:"Testimonianza diretta, non fonte web: <b>Cisternino</b> era già stata visitata nel 2023 e la cosa che vale la pena è prenotare una cena dentro i vicoli del centro storico. Da Alberobello sono <b>18,1 km, 20 minuti</b>, quindi lo spostamento dopo il giro tra i trulli è breve. La testimonianza non indica un locale preciso, quindi qui non c'è un nome da citare: va scelto e <b>prenotato</b>, perché la prenotazione è esattamente il punto, e un martedì di metà agosto senza tavolo prenotato è una scommessa persa. Sempre dalla stessa testimonianza, chi ha girato questa zona alloggiava fuori paese, in campagna, alla <a href=\"https://www.tripadvisor.com/Hotel_Review-g652000-d4225796-Reviews-Masseria_Peppeturro-Cisternino_Province_of_Brindisi_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Masseria Peppeturro</a>: informazione di contesto, non un'alternativa praticabile ora che l'alloggio è pagato." },
        { t:"È la serata più lunga del viaggio: come chiuderla",
          tx:"Il rientro da Cisternino a Polignano è di <b>41,5 km, 39 minuti</b> (routing reale), tutto di sera e in parte su strade di campagna. Sommando il giro di Alberobello e la cena, si rientra tardi, plausibilmente dopo mezzanotte: è l'unica giornata del viaggio in cui conviene decidere prima chi guida e regolarsi con il vino di conseguenza. Chilometri totali della serata: <b>92,7 km</b>, il giro più lungo dopo il viaggio di andata e ritorno." },
      ],
      tips:["Partire verso le 17:30-18:00: si arriva con la luce e si resta per le lucine","Aia Piccola ha gli stessi trulli di Rione Monti e molti meno negozi","Il Trullo Sovrano ha un orario di chiusura: verificarlo, alla sera potrebbe essere già chiuso","Prenotare la cena a Cisternino oggi: senza tavolo un martedì di agosto è una scommessa","Si rientra dopo mezzanotte e si guidano 92,7 km in serata: decidere prima chi guida"],
      cf:"25-45", ca:"0-5"
      // Tratte ricalcolate con OSRM in sessione (2026-08-07): Polignano-Alberobello 33,1 km / 34
      // min, Alberobello-Cisternino 18,1 km / 20 min, Cisternino-Polignano 41,5 km / 39 min.
      // Il vecchio dato "Polignano-Alberobello A/R 60,2 km" del carburante era piu' basso perche'
      // derivava da un calcolo diverso: qui vale la misura diretta appena rifatta.
    },
    {
      id:5, color:"#1A7A6E", label:"Giorno 5",
      title:"Mercoledì 12 agosto - Monopoli, giornata leggera",
      places:"Spiagge · Centro storico · Porto · Castello di Carlo V",
      sections:[
        { t:"Come arrivare, e perché questa giornata è volutamente scarica",
          tx:"Da Polignano a Monopoli sono <b>13,4 km, 14 minuti</b> (routing reale): è la tappa più vicina di tutto il viaggio ed è collocata il giorno dopo la serata lunga in Valle d'Itria proprio per questo. Nessuna corsa: mattina in spiaggia, pomeriggio e sera in centro." },
        { t:"Mattina - le spiagge, anche quelle meno battute",
          tx:"A sud del centro, la <b>Spiaggia di Porto Ghiacciolo</b> (cinque minuti in auto) è segnalata come la migliore della zona, sabbia dorata e acqua limpida. Più selvagge: <b>Port'Alga</b> (Scoglio dell'Eremita) e <b>Torre Incina</b>, buone per lo snorkeling, e <b>Cala Verde</b>, dietro il campeggio Santo Stefano, la più remota. Da uno dei video salvati, di cui è stata letta la descrizione pubblica e non guardato il contenuto: <b>Cala Tre Buchi</b>, incassata tra gli scogli, prende il nome dalle tre piccole grotte che la formano ed è riparata dal mare aperto, quindi con acqua calma tutto il giorno - da valutare sapendo due cose, che la fonte è un operatore di gite in barca e quindi non è neutrale, e che l'accesso descritto è dal mare e non a piedi. Fonti: <a href=\"https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Villa Gapanthus</a>, <a href=\"https://roamandthrive.com/best-beaches-monopoli-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Roam & Thrive</a>, <a href=\"https://vm.tiktok.com/ZNRoucgd7/\" target=\"_blank\" rel=\"noopener noreferrer\">video salvato su Cala Tre Buchi</a>." },
        { t:"Centro storico, porto e Castello di Carlo V",
          tx:"Monopoli ha un centro storico bianco simile a Polignano ma più esteso, cinto da mura, con un <b>porto peschereccio</b> ancora attivo, gozzi colorati e reti in riparazione. Il <b>Castello di Carlo V</b> (XVI secolo), sul mare accanto al centro, domina il porto vecchio: l'interno non è visitabile per intero, parte ospita uffici comunali, ma l'esterno vale la sosta. Fonte: <a href=\"https://www.regionepuglia.org/monopoli/\" target=\"_blank\" rel=\"noopener noreferrer\">Regione Puglia</a>." },
        { t:"Il molo con le barchette blu, e il panino col polpo",
          tx:"Testimonianza diretta, non fonte web: Monopoli è bella tutta, ma soprattutto il molo con le barchette blu, molto colorato, da non perdere. Lì intorno si trova ovunque il panino con il polpo fritto, street food diffuso in tutta la zona del porto, e il centro è pieno di locali per l'aperitivo, specialmente sul tardo pomeriggio e la sera." },
        { t:"Sera - Piazza Garibaldi e rientro",
          tx:"A fine giornata, atmosfera serale intorno al porto vecchio e <b>Piazza Giuseppe Garibaldi</b>, il ritrovo della città. Rientro a Polignano in un quarto d'ora: è anche l'ultima sera piena del viaggio, quindi se è rimasto qualcosa da vedere nel centro storico di Polignano, questa è l'occasione." },
      ],
      tips:["Giornata vicina alla base e volutamente leggera: serve dopo il rientro tardi da Cisternino","Porto Ghiacciolo è a cinque minuti dal centro di Monopoli: buona come prima spiaggia della mattina","Ultima sera piena: se manca qualcosa del centro storico di Polignano, si recupera stasera"],
      cf:"20-35", ca:"0"
    },
    {
      id:6, color:"#B03A2E", label:"Giorno 6",
      title:"Giovedì 13 agosto - Check-out, Bari Vecchia e rientro",
      places:"Check-out · Bari Vecchia · Rientro a Civitanova Marche",
      sections:[
        { t:"Come si incastra il rientro con la sosta a Bari",
          tx:"È qui che si recupera la tappa saltata all'andata, e i numeri dicono che ci sta. Da Polignano a Bari sono <b>36 km, 35 minuti</b>; da Bari a Civitanova Marche <b>425 km, circa 4h 18min</b> (routing reale). Con un check-out puntuale la mattina si è in Bari Vecchia a metà mattina, si gira <b>2-3 ore</b> a piedi, si pranza lì e si riparte nel primo pomeriggio. Il totale di guida è praticamente identico al rientro diretto, perché Bari è sulla strada e non una deviazione." },
        { t:"Prima di lasciare l'alloggio",
          tx:"Due cose da non dimenticare al check-out: farsi restituire il <b>deposito cauzionale di €150 in contanti</b>, che è rimborsabile e va recuperato, e fare il giro delle prese e del bagno, perché con la partenza di prima mattina è il momento in cui si lasciano indietro caricabatterie e costumi stesi." },
        { t:"Bari Vecchia a piedi",
          tx:"Percorso consigliato: <b>Piazza del Ferrarese</b> come punto di partenza, poi dentro il centro storico verso la <b>Basilica di San Nicola</b>, tappa centrale. <b>Via dell'Arco Basso</b>, la strada della pasta, dove le massaie preparano a mano le orecchiette sugli usci di casa e si può comprare pasta fresca o solo guardare. <b>Piazza Mercantile</b> per la sosta caffè o il pranzo veloce. Due o tre ore bastano per il percorso essenziale. Fonte: <a href=\"https://www.regionepuglia.org/itinerario-bari-mezza-giornata/\" target=\"_blank\" rel=\"noopener noreferrer\">itinerario di mezza giornata</a>." },
        { t:"Parcheggio a Bari e la questione sicurezza",
          tx:"L'intera Bari Vecchia è <b>ZTL</b>: non si entra in auto. Per una sosta breve le strisce blu lato mare (Zona D) costano circa €1 l'ora; in alternativa il parcheggio Cesare Battisti, sotterraneo, quartiere Murat, da circa €1,90 l'ora, è a pochi minuti a piedi dal centro storico - e con l'auto carica di bagagli per il rientro, il coperto è la scelta più tranquilla. Su Bari circolano allarmismi locali sui furti d'auto: nell'esperienza diretta di chi ha già fatto questo giro, parcheggiando nelle zone indicate è stata una tappa tranquilla e la sosta vale assolutamente. Fonte: <a href=\"https://www.bariexperience.com/en/what-to-do-in-bari/parking-in-bari-where-to-park-your-car-parkride-multi-storey-car-park-ztl-paid-parking/\" target=\"_blank\" rel=\"noopener noreferrer\">parcheggi a Bari</a>." },
        { t:"Tappe che non entrano in questo piano, e perché",
          tx:"Conservate qui con le loro fonti, così restano disponibili per un ritorno senza dover rifare la ricerca. <b>Martina Franca</b>, il centro barocco della Valle d'Itria, a <b>40,9 km</b> da Polignano: Palazzo Ducale del 1668 su progetto approvato da Gian Lorenzo Bernini, con la balconata in ferro battuto di 74 metri su Piazza Roma, e la Basilica di San Martino del 1747. È uscita per fare spazio all'accorpamento Alberobello più Cisternino, non per un difetto (<a href=\"https://www.idealista.it/news/vacanze/mete-turistiche/2026/04/18/353411-che-cosa-vedere-a-martina-franca-il-borgo-barocco-della-valle-d-itria\" target=\"_blank\" rel=\"noopener noreferrer\">fonte</a>). <b>Ostuni</b>, la Città Bianca, a <b>51,3 km</b>: da vedere di giorno perché il bianco risalta con la luce piena, con il tratto panoramico sotto le mura e le calette selvagge di Torre Pozzelle e Costa Merlata; attenzione, la Concattedrale risultava <b>chiusa per restauro</b> ad aprile 2026 (<a href=\"https://www.eleonoraongaro.it/ostuni-cosa-vedere/\" target=\"_blank\" rel=\"noopener noreferrer\">fonte</a>). <b>Trani</b>, testimonianza diretta, ha un mercato del pesce famoso e crudi descritti come la fine del mondo, ed è a nord di Bari, quindi già sulla strada del rientro: è l'unica di questo elenco che si potrebbe aggiungere davvero oggi, al costo di circa un'ora in più. <b>Locorotondo</b> è carina ma piccola e, da testimonianza diretta, perde il confronto con Martina Franca. <b>Lecce</b> vale il viaggio ma è lontana dalla base. <b>Brindisi</b> è sconsigliata senza mezzi termini dalla stessa testimonianza. <b>Otranto e la Grotta della Poesia</b> sono decisamente fuori mano. <b>Matera</b> è a <b>139,2 km, circa 2h 20min</b>: una giornata intera da programmare, non un salto, ed è la ragione per cui non entra in un itinerario a base unica." },
      ],
      tips:["Check-out puntuale: la sosta a Bari funziona solo se si è in città a metà mattina","Farsi restituire i €150 del deposito cauzionale prima di andare via","Con l'auto carica, parcheggio coperto (Cesare Battisti) meglio delle strisce blu","Traffico estivo sulla statale: metà agosto in direzione nord non è una giornata vuota","Trani è l'unica tappa extra ancora aggiungibile: circa un'ora in più sul rientro"],
      cf:"10-25", ca:"0"
    },
  ],

  restaurants: [
    { area:"Polignano a Mare", days:"Giorni 1, 2, 3 e 5 (sera)", items:[
      { nm:"Pescaria", tags:["Pesce","Street food","$"], note:"Piazza Aldo Moro 6-8. Il primo fast food di pesce d'Italia, nato qui: panini di mare, tartare di tonno, fish and chips. Informale, senza prenotazione, aperto secondo gli orari pubblicati tutti i giorni dalle 11:30 alle 23:30 - è il piano B che regge l'arrivo di sabato alle 19:30. 4,8/5 su Restaurant Guru, #10 su 205 ristoranti di Polignano su Tripadvisor. Fonti: <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>, <a href=\"https://www.oraridiapertura24.it/filiale/Polignano%2520a%2520Mare-Pescaria-873345J.html\" target=\"_blank\" rel=\"noopener noreferrer\">orari</a>.", sp:"Cena di sabato senza prenotazione", tripadvisor:"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html", thefork:"https://www.thefork.it/ristorante/pescaria-polignano-r849503" },
      { nm:"Grotta Palazzese", tags:["Pesce","$$$$"], note:"Ristorante scavato in una grotta naturale a picco sul mare. Prezzo reale almeno €200/persona, tavolo vista mare non garantito anche prenotando, recensioni discordanti (3,4/5 Tripadvisor). Senza prenotazione già in mano, a metà agosto è realisticamente pieno: dettaglio completo nel Giorno 2. Fonti: <a href=\"https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/\" target=\"_blank\" rel=\"noopener noreferrer\">Dissapore</a>, <a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Tripadvisor</a>.", sp:"Esperienza per l'ambiente, non il miglior pasto del viaggio", tripadvisor:"https://www.tripadvisor.com/Restaurant_Review-g635875-d1022607-Reviews-Ristorante_Grotta_Palazzese-Polignano_a_Mare_Province_of_Bari_Puglia.html" },
      // Nessun campo thefork per Grotta Palazzese: verificato che non ha una scheda su TheFork,
      // prenota solo dal proprio sito ufficiale (grottapalazzese.it) - non inventato un link.
      { nm:"Super Mago del Gelo", tags:["Gelateria/Caffè","$"], note:"Testimonianza diretta, non fonte web (nessun link verificato per questa voce): fa un caffè particolare che pare si trovi solo qui, gusto amaretto e agrumi. A due passi da Pescaria e Lama Monachile. Orario di chiusura estivo non verificato: da controllare sul posto.", sp:"Vale la sosta anche solo per il caffè" },
    ]},
    { area:"Cisternino", days:"Giorno 4, martedì 11 (cena scelta)", items:[
      { nm:"Cena nei vicoli del centro storico", tags:["Valle d'Itria","$-$$"], note:"Testimonianza diretta, non fonte web: a Cisternino la cosa che vale la pena è prenotare una cena dentro i vicoli del centro storico. La testimonianza non indica un locale specifico, quindi qui non c'è nessun link: va scelto sul posto o cercato in zona, sapendo che la prenotazione è il punto e che un martedì di metà agosto senza tavolo prenotato è una scommessa persa.", sp:"È la cena scelta del Giorno 4, al posto di Alberobello" },
    ]},
    { area:"Alberobello", days:"Giorno 4, solo se si cambia idea su Cisternino", items:[
      { nm:"Trattoria in un trullo", tags:["Valle d'Itria","$-$$"], note:"Voce indicativa, non un nome verificato: diversi ristoranti del centro storico occupano trulli veri. Orecchiette, verdure sott'olio, formaggi locali. Resta l'alternativa se la cena a Cisternino non si prenota in tempo." },
    ]},
    { area:"Monopoli", days:"Giorno 5, mercoledì 12", items:[
      { nm:"Panino col polpo fritto (molo)", tags:["Street food","$"], note:"Testimonianza diretta, non fonte web: street food diffuso ovunque intorno al molo con le barchette blu, non un singolo locale specifico." },
      { nm:"Locali per aperitivo (centro)", tags:["Aperitivo","$-$$"], note:"Testimonianza diretta: il centro di Monopoli è pieno di locali per l'aperitivo, specialmente sul tardo pomeriggio e la sera." },
      { nm:"Ristorante sul porto", tags:["Pesce","$$-$$$"], note:"Voce indicativa: il porto vecchio ha diversi ristoranti di pesce con vista sulle barche." },
    ]},
    { area:"Bari (sosta del rientro)", days:"Giorno 6, giovedì 13", items:[
      { nm:"Via dell'Arco Basso", tags:["Street food","$"], note:"Non un ristorante ma una strada: le massaie di Bari Vecchia preparano orecchiette a mano davanti casa, vendute fresche. Esperienza autentica più che un pasto vero e proprio.", sp:"Sosta breve, non un pranzo completo" },
      { nm:"Pranzo in Piazza Mercantile", tags:["Pugliese","$-$$"], note:"Voce indicativa, nessun nome verificato: la piazza è il punto naturale per il pranzo veloce prima di rimettersi in strada per 425 km." },
    ]},
  ],

  checklist: [
    { cat:"Documenti", items:[
      { t:"Carta d'identità / Passaporto",          n:"Obbligatorio" },
      { t:"Patente di guida" },
      { t:"Assicurazione auto + libretto" },
      { t:"Prenotazioni hotel (screenshot offline)" },
      { t:"Biglietto Grotte di Castellana comprato online",  n:"Giorno 3, lunedì 10: <a href=\"https://shop.grottedicastellana.it/webshop/webticket/timeslot\" target=\"_blank\" rel=\"noopener noreferrer\">biglietteria online</a>" },
      { t:"Contanti €100-150",                       n:"Spese in loco, oltre ai €150 del deposito cauzionale" },
      { t:"Carta di credito / bancomat" },
      // Voce aggiunta in coda alla categoria, non in mezzo: le chiavi delle checkbox sono
      // posizionali (`${indice categoria}-${indice voce}`), un inserimento intermedio
      // sposterebbe le spunte gia' salvate su Firestore.
      { t:"Deposito cauzionale alloggio: €150 in contanti", n:"Rimborsabile, torna indietro: da recuperare al check-out di giovedì" },
    ]},
    { cat:"Abbigliamento", items:[
      { t:"Magliette leggere (x5-6)" },
      { t:"Pantaloncini" },
      { t:"Abiti / vestiti per le cene",  n:"1-2 outfit" },
      { t:"Sandali da camminata" },
      { t:"Scarpe comode per centri storici acciottolati", n:"Alberobello e Cisternino sono ripidi e sconnessi" },
      { t:"Costume da bagno x 2" },
      { t:"Copricostume / pareo" },
      { t:"Cappello da sole" },
      { t:"Occhiali da sole" },
      { t:"Felpa leggera x 2",            n:"Grotte di Castellana: 16-18 gradi costanti anche ad agosto" },
    ]},
    { cat:"Mare & Spiaggia", items:[
      { t:"Crema solare 50+ (abbondante)" },
      { t:"Doposole idratante" },
      { t:"Telo mare x 2" },
      { t:"Borsa / sacca impermeabile" },
      { t:"Maschera e boccaglio",       n:"Grotte marine di Polignano, dal tour in barca" },
      { t:"Ciabatte da mare" },
      { t:"Scarpette da scoglio",       n:"Lama Monachile ha il fondo di ciottoli, non di sabbia" },
      { t:"Borraccia / acqua da casa",  n:"A Lama Monachile non ci sono punti ristoro sulla riva" },
      { t:"Sacca da canoa impermeabile", n:"Per il tour in barca: telefono, chiavi e documenti asciutti anche con gli spruzzi" },
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
      { t:"Macchina fotografica",      n:"Trulli, scogliere e grotte" },
      { t:"Caricabatterie auto / adattatore 12V" },
      // Voci in coda: caricatori e power bank erano gia' in lista al singolare, qui diventano
      // espliciti per due persone e due telefoni, che e' il caso reale di questo viaggio.
      { t:"Secondo caricabatterie + cavi di riserva", n:"Due telefoni, e un cavo si rompe sempre in viaggio" },
      { t:"Power bank x2, caricate prima di partire", n:"Giornate lunghe fuori: mappe, foto e biglietti stanno sul telefono" },
      { t:"Presa multipla / ciabatta piccola",         n:"Negli appartamenti le prese accanto al letto sono spesso una sola" },
    ]},
    { cat:"Per l'Auto", items:[
      { t:"Acqua (almeno 6-8 bottiglie x 1,5L)" },
      { t:"Snack per i trasferimenti" },
      { t:"Cassetta pronto soccorso (obbligatoria)" },
      { t:"Gilet catarifrangenti x 2 (obbligatori)" },
      { t:"Playlist viaggio creata" },
      // Voci in coda alla categoria, non in mezzo: chiavi posizionali delle checkbox.
      { t:"Chiave di riserva dell'auto",  n:"Tenuta separata dalla prima: con il mare e i borghi in mezzo, una chiave persa a 460 km da casa è un guaio serio" },
      { t:"Triangolo e ruotino / kit gonfia-e-ripara" },
    ]},
    { cat:"Per la Coppia", items:[
      { t:"Prenotare la cena di sabato a Polignano",   n:"Giorno 1: oppure Pescaria, che non prende prenotazioni" },
      { t:"Bagno a Lama Monachile entro le 9",         n:"Domenica 9 mattina, prima che si riempia" },
      { t:"Foto tra i trulli di Alberobello" },
      { t:"Foto in ogni tappa dell'itinerario" },
      // Voci in coda alla categoria: le due ultime sono state riscritte il 2026-08-07 perche'
      // riguardavano SpeleoNight e Hell in the Cave, non piu' in programma con queste date.
      { t:"Prenotare la cena nei vicoli a Cisternino", n:"Giorno 4, martedì 11: è il motivo per cui ci si va" },
      { t:"Prenotare il tour in barca alle grotte marine", n:"Giorno 2, domenica 9, con cancellazione gratuita: <a href=\"https://www.checkyeti.com/it/boat-tours/italia/polignano-a-mare/gite-in-barca-alle-grotte\" target=\"_blank\" rel=\"noopener noreferrer\">operatori e prezzi</a>" },
    ]},
  ],

  // Nessun hotelChange: una sola base per tutto il soggiorno, niente banner di cambio hotel.

  accommodation: {
    subtitle: "Una sola base dall'8 al 13 agosto - prenotazione reale, pagata su Booking",
    bases: [
      {
        name: "Polignano a Mare", location: "8-13 agosto (5 notti)",
        badge: "Unica base", badgeBg: "#E3F7EE", badgeColor: "#1DAD70",
        options: [
          { name:"Magda Relax Suites, prenotata su Booking e già pagata", price:"€710,12 in tutto (5 notti, due persone)", desc:"Cifra realmente versata, non una stima: <b>€784,78</b> di totale Booking meno <b>€74,66</b> di credito wallet, quindi <b>€710,12</b> pagati, cioè €355,06 a persona. Sul posto va consegnato a parte un <b>deposito cauzionale di €150 in contanti</b>, rimborsabile al check-out di giovedì 13: va portato, ma non è un costo del viaggio e per questo non entra nella stima." },
        ]
      },
    ]
  },

  // Alloggio: cifra reale confermata dall'utente il 2026-08-03, scritta anche qui perche' il
  // repository conservi il dato se il documento Firestore state/costs venisse cancellato:
  // Magda Relax Suites, €784,78 di totale Booking meno €74,66 di credito wallet fanno €710,12
  // pagati, cioe' €355,06 a persona.
  // ATTENZIONE, discrepanza ancora aperta al 2026-08-07: il pannello Alloggio confermato su
  // Firestore contiene €804,78, cioe' €20,00 esatti in piu' del totale Booking dichiarato, e
  // nessuna delle due cifre meno il wallet da' 710,12 tranne 784,78. Finche' non e' chiarito quale
  // sia il vero totale, il valore del pannello prevale su questa riga nel rendering
  // (resolveAccommodationCost) e il totale mostrato sovrastima di €47,33 a persona.
  // Il deposito cauzionale di €150 resta correttamente NON sommato: e' rimborsabile.
  // Pasti/Biglietti: somma delle stime cf/ca dei giorni sopra, ricalcolata dopo la
  // riorganizzazione sulle date reali.
  // Carburante: ricalcolato il 2026-08-07 con le tratte reali del piano nuovo (OSRM):
  // Civitanova-Polignano diretta all'andata 460 km, rientro con sosta a Bari 36 + 425 = 461 km,
  // Castellana A/R 34,8 km, serata Alberobello-Cisternino-Polignano 92,7 km, Monopoli A/R 26,8 km,
  // totale 1075,3 km. Consumo reale Alfa Romeo Giulietta 1.6 JTD diesel (2019), 4,7-5,0 L/100km
  // ciclo misto ufficiale. Fonti:
  // https://it.motor1.com/reviews/375130/alfa-romeo-giulietta-diesel-manuale-prova-consumi/
  // https://www.linkmotors.it/scheda-tecnica/auto/2019-Alfa-Romeo-Giulietta-Type/36540/
  costEstimate: {
    subtitle: "Per persona, camera doppia condivisa - alloggio reale pagato, il resto stima indicativa",
    rows: [
      { label:"Alloggio", desc:"Cifra reale, non una stima: €710,12 pagati su Booking per 5 notti (€784,78 meno €74,66 di credito wallet), divisi tra due persone. Resta il valore di partenza del file: inserendo l'importo nel pannello Alloggio confermato, questa riga viene sostituita dal valore risolto da Firestore.", amount:"€355,06", kind:"accommodation" },
      { label:"Pasti", desc:"Somma delle stime giornaliere del piano riorganizzato: sabato 8 €25-40, domenica 9 €25-45, lunedì 10 €20-35, martedì 11 €25-45 (cena a Cisternino), mercoledì 12 €20-35, giovedì 13 €10-25 con il pranzo a Bari.", amount:"€125-225" },
      { label:"Biglietti e attività", desc:"Domenica 9 €20-40 per il tour in barca collettivo alle grotte marine, lunedì 10 €25-30 per le Grotte di Castellana (percorso completo €25 più parcheggio), martedì 11 €0-5 per il Trullo Sovrano. Grotta Palazzese e Pescaria non sono qui: se scelte stanno in Pasti. SpeleoNight e Hell in the Cave non sono nel conto perché con queste date non sono fattibili.", amount:"€45-75" },
      { label:"Carburante diesel", desc:"1075,3 km reali calcolati con OSRM sul piano nuovo: andata diretta Civitanova-Polignano 460 km, rientro con sosta a Bari 461 km, Grotte di Castellana A/R 34,8 km, serata Alberobello più Cisternino 92,7 km, Monopoli A/R 26,8 km. Alfa Romeo Giulietta 1.6 JTD diesel 2019 (4,7-5,0 L/100km), €1,65/L, diviso tra 2 persone. Aggiungere circa €3 a testa se si inserisce anche Trani sul rientro. Fonti: <a href=\"https://it.motor1.com/reviews/375130/alfa-romeo-giulietta-diesel-manuale-prova-consumi/\" target=\"_blank\" rel=\"noopener noreferrer\">Motor1</a>, <a href=\"https://www.linkmotors.it/scheda-tecnica/auto/2019-Alfa-Romeo-Giulietta-Type/36540/\" target=\"_blank\" rel=\"noopener noreferrer\">scheda tecnica</a>.", amount:"€42-44" },
      { label:"Extra e imprevisti", amount:"€50-100" },
    ],
    total: { sub:"6 giorni, 8-13 agosto, tutto incluso" },
    // ATTENZIONE, non riportare validUntil in avanti: lo sconto e' stato usato davvero, l'utente
    // ha confermato di aver pagato la prenotazione con lo sconto applicato (2026-08-03). Essendo
    // gia' incluso nella cifra realmente pagata, riattivarlo lo sottrarrebbe una seconda volta dal
    // totale. La data passata lo tiene inerte (activeDiscount() torna null), che qui e' il
    // comportamento corretto e non una dimenticanza.
    discount: { amount: 74.66, desc: "Sconto gia' usato: incluso nel prezzo realmente pagato", validUntil: "2026-07-30" }
  },

  // Il campo name viene inserito come HTML dal renderer (renderInfoCosts, js/itinerario.js non usa
  // escHtml su questa colonna), quindi ogni voce che ha una fonte o una biglietteria online porta
  // il link direttamente qui: da questa tabella si arriva all'acquisto in un clic, senza dover
  // ritrovare la sezione del giorno che ne parla.
  tickets: [
    { name:"<a href=\"https://www.regionepuglia.org/lama-monachile/\" target=\"_blank\" rel=\"noopener noreferrer\">Lama Monachile / Cala Porto (Polignano)</a>", price:"Gratuito", free:true },
    { name:"Centro storico Polignano a Mare", price:"Gratuito", free:true },
    { name:"<a href=\"https://www.checkyeti.com/it/boat-tours/italia/polignano-a-mare/gite-in-barca-alle-grotte\" target=\"_blank\" rel=\"noopener noreferrer\">Tour in barca alle grotte marine (collettivo, 1h30-2h)</a>", price:"€20-40 a persona" },
    { name:"<a href=\"https://mammamiaboat.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Tour in barca privato alle grotte (prezzo per barca)</a>", price:"€300-400 (2 ore)" },
    { name:"<a href=\"https://shop.grottedicastellana.it/webshop/webticket/timeslot\" target=\"_blank\" rel=\"noopener noreferrer\">Grotte di Castellana, percorso completo 3 km con Grotta Bianca</a>", price:"€25 (ridotto 6-14 anni €22)" },
    { name:"<a href=\"https://www.grottedicastellana.it/informazioni-utili/orari-e-prezzi/\" target=\"_blank\" rel=\"noopener noreferrer\">Grotte di Castellana, percorso parziale 1 km</a>", price:"€22 (ridotto 6-14 anni €19)" },
    { name:"<a href=\"https://www.trullosovrano.eu/ingresso-biglietti/\" target=\"_blank\" rel=\"noopener noreferrer\">Trullo Sovrano (Alberobello)</a>", price:"€2,50" },
    { name:"<a href=\"https://whc.unesco.org/en/list/787\" target=\"_blank\" rel=\"noopener noreferrer\">Centro storico Alberobello, sito UNESCO</a>", price:"Gratuito", free:true },
    { name:"Centro storico Cisternino", price:"Gratuito", free:true },
    { name:"<a href=\"https://www.regionepuglia.org/monopoli/\" target=\"_blank\" rel=\"noopener noreferrer\">Centro storico Monopoli e Castello di Carlo V (esterno)</a>", price:"Gratuito", free:true },
    { name:"Basilica di San Nicola (Bari)", price:"Gratuito", free:true },
    { name:"<a href=\"https://www.regionepuglia.org/itinerario-bari-mezza-giornata/\" target=\"_blank\" rel=\"noopener noreferrer\">Bari Vecchia (passeggiata)</a>", price:"Gratuito", free:true },
  ],

  // Anche questi sono inseriti come HTML dal renderer: dove il consiglio nasce da una fonte, il
  // link ci sta dentro, cosi' il risparmio e' verificabile e non un'affermazione da credere.
  savingTips: [
    "<a href=\"https://www.tripadvisor.com/Restaurant_Review-g635875-d8144682-Reviews-Pescaria-Polignano_a_Mare_Province_of_Bari_Puglia.html\" target=\"_blank\" rel=\"noopener noreferrer\">Pescaria</a> è un'alternativa economica di qualità a <a href=\"https://www.dissapore.com/ristoranti/grotta-palazzese-cosa-sapere-prima-di-prenotare/\" target=\"_blank\" rel=\"noopener noreferrer\">Grotta Palazzese</a> per un pasto di pesce, senza il conto da occasione speciale",
    "<a href=\"https://www.regionepuglia.org/lama-monachile/\" target=\"_blank\" rel=\"noopener noreferrer\">Lama Monachile</a> è gratuita e senza stabilimento: l'unico costo è il parcheggio, e arrivando entro le 9 si evita anche di girare a vuoto per trovarlo",
    "Il <a href=\"https://www.checkyeti.com/it/boat-tours/italia/polignano-a-mare/gite-in-barca-alle-grotte\" target=\"_blank\" rel=\"noopener noreferrer\">tour in barca collettivo</a> (€20-40 a persona) mostra le stesse grotte del privato, che si paga a barca: €300-400 per due ore, cioè €150-200 a testa in due",
    "Alle <a href=\"https://www.grottedicastellana.it/informazioni-utili/orari-e-prezzi/\" target=\"_blank\" rel=\"noopener noreferrer\">Grotte di Castellana</a> il percorso completo costa solo €3 in più del parziale e include la Grotta Bianca: risparmiare qui è il taglio sbagliato",
    "<a href=\"https://www.marcotogni.it/cosa-vedere-alberobello/\" target=\"_blank\" rel=\"noopener noreferrer\">Aia Piccola</a> ad Alberobello ha gli stessi trulli di Rione Monti, meno negozi per turisti",
    "Spiagge libere (<a href=\"https://www.villagapanthus.it/en/best-beaches-polignano-monopoli-ostuni-puglia/\" target=\"_blank\" rel=\"noopener noreferrer\">Porto Ghiacciolo, Cala Verde, Port'Alga</a>) invece di stabilimenti a pagamento",
  ],
};
