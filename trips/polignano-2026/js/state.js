// ── Stato applicativo in memoria e utility condivise ──────────────────────────
// Nessuna dipendenza da altri moduli locali: e' la base che tutti gli altri importano.
// `fb` sostituisce una variabile `db` riassegnabile: un binding importato da un altro modulo
// non si puo' riassegnare (`db = x` fallirebbe in un modulo che importa `db`), quindi la
// connessione Firestore vive come proprieta' mutabile di un oggetto esportato una sola volta.

export const PLAN_FILTERS_DEFAULT = { flightsSort:'price-asc', flightsDirectOnly:false, staysSort:'price-asc', staysMinRating:0, poiCategory:'', poiSort:'name-asc', poiFeeOnly:false };

export const S = { days:[], restaurants:[], checklist:[], ckState:{}, activityState:{}, notes:{}, completed:{}, mapDone:false, planning:{}, planResults:null, planLastSearch:null, planLastPayload:null, meta:null, metaEditing:false, costs:null, priceAlerts:null, planFilters:{...PLAN_FILTERS_DEFAULT}, airports:null, airportZones:null };

export const fb = { db: null };

export const PLAN_API_KEY = { flights: 'flights', stays: 'stays', pois: 'points_of_interest' };
export const PLAN_KIND_LABEL = { flights: 'Volo', stays: 'Alloggio', pois: 'Punto di interesse' };

// FlightOffer.source (services/flight-search/app/schemas.py) non porta un link di prenotazione
// per singola offerta: né fast_flights né Kiwi Tequila espongono un booking_token verificato in
// questa sessione (vedi README del servizio). Per fast_flights l'unico link onesto è una ricerca
// generica su Google Flights sulla stessa rotta/date (non l'itinerario esatto), verificata dal
// vivo in sessione (200, pagina di ricerca valida). Per kiwi, non ancora verificato live (manca
// la chiave), nessun link finché non lo è: solo l'etichetta della fonte.
export const FLIGHT_SOURCE_LABEL = { fast_flights: 'Google Flights', kiwi: 'Kiwi.com' };

// Voli/alloggi/POI vengono da fonti esterne scrapate (Airbnb, Google Flights, OpenStreetMap), non
// da trip.config.js scritto dallo sviluppatore: a differenza del resto della shell, questi valori
// vanno sempre passati per escHtml prima di finire in innerHTML.
export function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function parsePrice(str) {
  if (!str) return 0;
  const m = String(str).match(/[\d]+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(',', '.')) : 0;
}

// Estrae [minimo, massimo] da una stringa come "€120-225" o "€50" (valore singolo): serve a
// ricalcolare il totale di "Stima Costi" quando la riga Alloggio diventa un valore risolto
// (confermato o da Pianifica) invece dell'intervallo indicativo scritto a mano.
export function parseCostRange(str) {
  const nums = (String(str).match(/[\d]+(?:[.,]\d+)?/g) || []).map(n => parseFloat(n.replace(',', '.')));
  if (!nums.length) return [0, 0];
  return nums.length > 1 ? [nums[0], nums[1]] : [nums[0], nums[0]];
}
