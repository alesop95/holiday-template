// ── Pianifica: comparatore voli/alloggi/POI (services/trip-planner/) ─────────────
// Chiama il backend Python locale via fetch semplice (nessun SDK Firebase coinvolto
// in questa parte): S.planResults tiene solo l'ultima ricerca, non persistita finche'
// l'utente non salva un risultato su un giorno. Il salvataggio invece passa da
// Firestore (writePlanDay), stesso canale di sincronizzazione realtime del resto
// dell'app: un risultato salvato appare sull'altro dispositivo come una nota o una
// spunta della valigia.
import { TRIP_PLANNER_URL, ROUTING_PROFILE, CURRENCY_CODE } from '../trip.config.js';
import { S, escHtml, parsePrice, PLAN_API_KEY, PLAN_KIND_LABEL, FLIGHT_SOURCE_LABEL, PLAN_FILTERS_DEFAULT } from './state.js';
import { writePlanDay } from './firestore.js';

// FlightOffer.source (services/flight-search/app/schemas.py) non porta un link di prenotazione
// per singola offerta: né fast_flights né Kiwi Tequila espongono un booking_token verificato in
// questa sessione (vedi README del servizio). Per fast_flights l'unico link onesto è una ricerca
// generica su Google Flights sulla stessa rotta/date (non l'itinerario esatto), verificata dal
// vivo in sessione (200, pagina di ricerca valida). Per kiwi, non ancora verificato live (manca
// la chiave), nessun link finché non lo è: solo l'etichetta della fonte.
function googleFlightsSearchUrl(origin, dest, dep, ret) {
  const q = ret ? `Flights from ${origin} to ${dest} on ${dep} through ${ret}` : `Flights from ${origin} to ${dest} on ${dep}`;
  return 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q);
}

// ── Mappetta prezzi alloggi (Pianifica) ───────────────────────────────────────
// Solo gli alloggi hanno coordinate (StayOffer.lat/lon, verificate live contro l'API reale
// Airbnb): i voli non hanno una coordinata sensata da mostrare, i POI non hanno prezzo. Istanza
// Leaflet separata da quella della scheda "Mappa" (renderMap): quella e' persistente per tutta
// la sessione, questa va ricreata a ogni nuova ricerca (i marker cambiano), quindi richiede
// .remove() esplicito prima di ricreare — Leaflet non permette due L.map() sullo stesso div.
let planMapInstance = null;

export function renderPlanPriceMap() {
  const el = document.getElementById('plan-map'); if (!el) return;
  const stays = (S.planResults?.stays || []).filter(s => s.lat && s.lon);
  if (!stays.length) {
    el.style.display = 'none';
    if (planMapInstance) { planMapInstance.remove(); planMapInstance = null; }
    return;
  }
  el.style.display = 'block';
  setTimeout(() => {
    if (planMapInstance) { planMapInstance.remove(); planMapInstance = null; }
    planMapInstance = L.map('plan-map').setView([stays[0].lat, stays[0].lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(planMapInstance);
    const bounds = [];
    stays.forEach(s => {
      const icon = L.divIcon({ html: `<div class="plan-map-price-pin">${escHtml(s.total_price)}</div>`, className: '' });
      L.marker([s.lat, s.lon], { icon }).addTo(planMapInstance).bindPopup(`<strong>${escHtml(s.name)}</strong><br>${escHtml(s.total_price)}`);
      bounds.push([s.lat, s.lon]);
    });
    if (bounds.length > 1) planMapInstance.fitBounds(bounds, { padding: [24,24] });
  }, 120);
}

// Menu "Aggiungi al giorno": i giorni del viaggio sono sempre gli stessi (TRIP_DATA.days, scritti
// dallo sviluppatore), ma l'ordine in cui compaiono per ciascun tipo (volo/alloggio/POI) riflette
// cosa quel giorno ha gia' — un giorno che ha gia' un volo salvato va in fondo, non e' piu'
// probabile che serva un secondo volo lo stesso giorno. Non nasconde nessun giorno (resta scelta
// manuale dell'utente, l'app non conosce la destinazione di un giorno per bloccare scelte
// incoerenti), solo lo rende meno probabile per disattenzione.
function dayOptsForKind(kind) {
  return S.days
    .map(d => ({ d, has: ((S.planning[d.id] || {})[kind] || []).length > 0 }))
    .sort((a, b) => (a.has === b.has ? 0 : a.has ? 1 : -1))
    .map(({ d, has }) => `<option value="${d.id}">${escHtml(d.label)} · ${escHtml(d.title)}${has ? ' (già presente)' : ''}</option>`)
    .join('');
}

export function renderPlanResults() {
  const p = S.planResults; const el = document.getElementById('plan-results'); if (!p || !el) return;
  const pf = S.planFilters;
  // Ogni item porta con se' l'indice originale in S.planResults: filtrare/ordinare non deve mai
  // rompere savePlanItem, che legge S.planResults[chiave][idx] per indice, non per riferimento.
  const withIndex = arr => arr.map((item, origIndex) => ({ item, origIndex }));

  let flights = withIndex(p.flights || []);
  if (pf.flightsDirectOnly) flights = flights.filter(x => x.item.stops === 0);
  flights.sort((a,b) => (pf.flightsSort === 'price-desc' ? -1 : 1) * (parsePrice(a.item.price) - parsePrice(b.item.price)));

  let stays = withIndex(p.stays || []).filter(x => (x.item.rating || 0) >= pf.staysMinRating);
  stays.sort((a,b) => {
    if (pf.staysSort === 'rating-desc') return (b.item.rating || 0) - (a.item.rating || 0);
    if (pf.staysSort === 'price-desc') return parsePrice(b.item.total_price) - parsePrice(a.item.total_price);
    return parsePrice(a.item.total_price) - parsePrice(b.item.total_price);
  });

  const poiCategories = [...new Set((p.points_of_interest || []).map(o => o.category))].sort();
  let pois = withIndex(p.points_of_interest || []);
  if (pf.poiCategory) pois = pois.filter(x => x.item.category === pf.poiCategory);
  // "a pagamento" e' un giudizio best-effort sul tag OSM fee grezzo: qualunque valore diverso da
  // "no" (compreso "yes" o una nota libera) conta come pagamento presunto. Un POI senza il tag
  // fee non entra in questo filtro: assenza del dato non e' la stessa cosa di "gratuito".
  if (pf.poiFeeOnly) pois = pois.filter(x => x.item.fee && x.item.fee !== 'no');
  pois.sort((a,b) => pf.poiSort === 'name-desc' ? b.item.name.localeCompare(a.item.name) : a.item.name.localeCompare(b.item.name));

  const groups = [
    { key:'flights', label:'Voli', originalCount:(p.flights||[]).length, pairs:flights,
      // S.planLastSearch e' non-null solo se questa ricerca ha davvero incluso aeroporti: serve a
      // distinguere "non ho chiesto voli" (sezione nascosta, comportamento invariato) da "li ho
      // chiesti ma la fonte non ha restituito nulla" (messaggio esplicito invece del silenzio
      // totale di prima — un utente non puo' distinguere i due casi senza questo messaggio).
      emptyMsg: S.planLastSearch ? 'Nessun volo trovato per questa rotta e queste date. Puo\' essere una rotta senza voli in quel periodo, oppure la fonte (Google Flights) non ha risposto: non e\' necessariamente un errore del comparatore.' : null,
      view:f=>{
        const src = FLIGHT_SOURCE_LABEL[f.source] || f.source;
        const ls = S.planLastSearch;
        const link = (f.source === 'fast_flights' && ls) ? googleFlightsSearchUrl(ls.origin, ls.destAir, ls.dep, ls.ret) : '';
        return {nm:escHtml(f.airline),price:escHtml(f.price),
          sub:`${escHtml(f.departure)} → ${escHtml(f.arrival)} · ${escHtml(f.duration)} · ${f.stops===0?'diretto':escHtml(f.stops)+' scalo/i'}${f.is_best?' · consigliato':''} · fonte: ${escHtml(src)}`,
          link, linkLabel:'Cerca su Google Flights →'};
      },
      controls:`<div class="plan-filters">
        <label><input type="checkbox" ${pf.flightsDirectOnly?'checked':''} onchange="setPlanFilter('flightsDirectOnly',this.checked)"> Solo diretti</label>
        <select onchange="setPlanFilter('flightsSort',this.value)">
          <option value="price-asc" ${pf.flightsSort==='price-asc'?'selected':''}>Prezzo crescente</option>
          <option value="price-desc" ${pf.flightsSort==='price-desc'?'selected':''}>Prezzo decrescente</option>
        </select></div>` },
    { key:'stays', label:'Alloggi', originalCount:(p.stays||[]).length, pairs:stays,
      view:s=>({nm:escHtml(s.name),price:escHtml(s.total_price),sub:`${escHtml(s.listing_type||'Alloggio')}${s.rating>0?' · '+escHtml(s.rating)+' ('+escHtml(s.review_count)+' recensioni)':' · senza recensioni'}`,link:s.url||'',linkLabel:'Vedi e prenota su Airbnb →'}),
      controls:`<div class="plan-filters">
        <select onchange="setPlanFilter('staysMinRating',parseFloat(this.value))">
          <option value="0" ${pf.staysMinRating===0?'selected':''}>Qualsiasi valutazione</option>
          <option value="3" ${pf.staysMinRating===3?'selected':''}>3+ stelle</option>
          <option value="4" ${pf.staysMinRating===4?'selected':''}>4+ stelle</option>
          <option value="4.5" ${pf.staysMinRating===4.5?'selected':''}>4.5+ stelle</option>
        </select>
        <select onchange="setPlanFilter('staysSort',this.value)">
          <option value="price-asc" ${pf.staysSort==='price-asc'?'selected':''}>Prezzo crescente</option>
          <option value="price-desc" ${pf.staysSort==='price-desc'?'selected':''}>Prezzo decrescente</option>
          <option value="rating-desc" ${pf.staysSort==='rating-desc'?'selected':''}>Valutazione più alta</option>
        </select></div>` },
    { key:'pois', label:'Punti di interesse', originalCount:(p.points_of_interest||[]).length, pairs:pois,
      // fee/price_hint vengono dai tag OSM fee/charge, copertura reale bassa (verificato in
      // sessione: 0/30 su un'area rurale, 5/100 con un prezzo vero su un'area museale densa) —
      // per questo qui e' solo informativo, mai sommato nel totale automatico dei costi.
      view:o=>{
        const feeTxt = o.price_hint ? `Ingresso: ${o.price_hint}` : (o.fee === 'no' ? 'Ingresso gratuito' : (o.fee ? 'Ingresso a pagamento' : ''));
        return {nm:escHtml(o.name), price:'', sub:`${escHtml(o.category)}${feeTxt?' · '+escHtml(feeTxt):''}`, link:''};
      },
      controls: `<div class="plan-filters">
        ${poiCategories.length > 1 ? `<select onchange="setPlanFilter('poiCategory',this.value)">
          <option value="">Tutte le categorie</option>
          ${poiCategories.map(c => `<option value="${escHtml(c)}" ${pf.poiCategory===c?'selected':''}>${escHtml(c)}</option>`).join('')}
        </select>` : ''}
        <label><input type="checkbox" ${pf.poiFeeOnly?'checked':''} onchange="setPlanFilter('poiFeeOnly',this.checked)"> Solo a pagamento</label>
      </div>
      <p class="costs-hint">Il dato ingresso viene da OpenStreetMap ed è spesso assente anche quando il posto è davvero a pagamento: non conteggiato nel totale automatico dei costi per questo motivo.</p>` },
  ];

  const html = groups.map(g => {
    if (!g.originalCount) {
      // g.emptyMsg distingue "sezione non pertinente a questa ricerca" (torna '', comportamento
      // invariato) da "pertinente ma zero risultati dalla fonte" (messaggio esplicito, vedi
      // definizione del gruppo "flights" sopra per il caso d'uso reale che l'ha motivato).
      return g.emptyMsg ? `<details class="plan-group" open><summary class="plan-group-ttl">${g.label} (0)</summary><p class="costs-hint">${escHtml(g.emptyMsg)}</p></details>` : '';
    }
    const countLbl = g.pairs.length !== g.originalCount ? `${g.pairs.length} di ${g.originalCount}` : `${g.originalCount}`;
    if (!g.pairs.length) return `<details class="plan-group" open><summary class="plan-group-ttl">${g.label} (${countLbl})</summary>${g.controls}<p class="costs-hint">Nessun risultato con i filtri scelti.</p></details>`;
    const dayOpts = dayOptsForKind(g.key);
    return `<details class="plan-group" open><summary class="plan-group-ttl">${g.label} (${countLbl})</summary>${g.controls}
      ${g.pairs.map(({item, origIndex}) => { const v = g.view(item);
        return `<div class="plan-item"><div class="plan-item-hd"><div class="plan-item-nm">${v.nm}</div>${v.price?`<div class="plan-item-price">${v.price}</div>`:''}</div><div class="plan-item-sub">${v.sub}</div>${v.link?`<a class="plan-item-link" href="${escHtml(v.link)}" target="_blank" rel="noopener noreferrer">${escHtml(v.linkLabel||'Vedi →')}</a>`:''}
        <div class="plan-item-save"><span class="plan-item-save-lbl">Aggiungi al giorno</span><select>${dayOpts}</select><button class="plan-save-btn" onclick="savePlanItem('${g.key}',${origIndex},this)">Salva</button></div></div>`;
      }).join('')}</details>`;
  }).join('');
  el.innerHTML = html || '<p style="color:var(--muted);font-size:13px;">Nessun risultato per questa ricerca.</p>';
}

// Riga di una singola prenotazione salvata: condivisa tra la scheda "Pianifica" (renderPlanSaved,
// raggruppata per giorno) e il blocco "Prenotato" dentro ogni day-card di "Itinerario"
// (renderDayPlanning), cosi' le due viste non duplicano la stessa logica di formattazione.
function planSavedRowHtml(dayId, kind, item, i) {
  const nm = kind==='flights' ? `${escHtml(item.airline)} · ${escHtml(item.price)} · ${escHtml(FLIGHT_SOURCE_LABEL[item.source]||item.source)}` : kind==='stays' ? `${escHtml(item.name)} · ${escHtml(item.total_price)}` : escHtml(item.name);
  const link = kind==='stays' && item.url ? ` <a class="plan-item-link" href="${escHtml(item.url)}" target="_blank" rel="noopener noreferrer">Airbnb →</a>` : '';
  return `<div class="plan-saved-item"><div class="plan-saved-nm">${PLAN_KIND_LABEL[kind]}: ${nm}${link}</div><button class="plan-rm-btn" onclick="removePlanItem('${dayId}','${kind}',${i})">Rimuovi</button></div>`;
}

// Il totale combinato volo+alloggio di un giorno ha senso solo se ci sono entrambi, altrimenti
// e' solo il prezzo del singolo elemento gia' visibile sopra, ridondante. Condiviso per lo
// stesso motivo di planSavedRowHtml.
function planSavedTotalHtml(dayPlanning) {
  const dayFlights = dayPlanning.flights || [], dayStays = dayPlanning.stays || [];
  if (!dayFlights.length || !dayStays.length) return '';
  const total = dayFlights.reduce((s,f)=>s+parsePrice(f.price),0) + dayStays.reduce((s,st)=>s+parsePrice(st.total_price),0);
  return `<div class="plan-saved-total">Totale volo + alloggio: ${total.toFixed(2)} ${CURRENCY_CODE}</div>`;
}

export function renderDayPlanningAll() { S.days.forEach(d => renderDayPlanning(d.id)); }

function renderDayPlanning(dayId) {
  const el = document.getElementById(`day-planning-${dayId}`); if (!el) return;
  const day = S.planning[dayId] || {};
  const rows = [];
  ['flights','stays','pois'].forEach(kind => (day[kind]||[]).forEach((item,i) => rows.push(planSavedRowHtml(String(dayId), kind, item, i))));
  if (!rows.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
  // L'ottimizzazione ha senso solo con almeno due POI con coordinate: un solo punto (o nessuno)
  // non ha un ordine da scegliere. L'alloggio del giorno, se presente, si aggiunge come punto di
  // partenza dentro optimizeDayRoute, non qui: non conta per la soglia dei due POI.
  const poisWithCoords = (day.pois||[]).filter(p => p.lat != null && p.lon != null);
  const routeBlk = poisWithCoords.length >= 2
    ? `<button class="act-btn route-btn" onclick="optimizeDayRoute(${dayId})">Ottimizza percorso</button><div class="day-route" id="day-route-${dayId}"></div>`
    : '';
  el.style.display = 'block';
  el.innerHTML = `<div class="day-planning-ttl">Prenotato da Pianifica</div>${rows.join('')}${planSavedTotalHtml(day)}${routeBlk}`;
}

// ── Ottimizzazione percorso giornaliero (Itinerario) ───────────────────────────
// Server demo pubblico OSRM (router.project-osrm.org): gratuito, senza chiave, CORS aperto
// (Access-Control-Allow-Origin: *, verificato dal vivo), nessun backend proprio necessario. I
// suoi termini d'uso dichiarati limitano il server demo a "reasonable, non-commercial use", non
// piu' di 1 richiesta al secondo e nessuna garanzia di uptime/latenza — coerente con un click
// manuale occasionale dell'utente, mai con chiamate automatiche o in sequenza ravvicinata.
window.optimizeDayRoute = async (dayId) => {
  const el = document.getElementById(`day-route-${dayId}`); if (!el) return;
  const day = S.planning[dayId] || {};
  const pois = (day.pois || []).filter(p => p.lat != null && p.lon != null);
  const stay = (day.stays || []).find(s => s.lat != null && s.lon != null);
  const points = stay ? [stay, ...pois] : pois; // l'alloggio, se c'e', e' sempre il punto di partenza (source=first sotto)

  el.innerHTML = '<p class="costs-hint">Calcolo percorso...</p>';
  const coords = points.map(p => `${p.lon},${p.lat}`).join(';');
  try {
    const res = await fetch(`https://router.project-osrm.org/trip/v1/${ROUTING_PROFILE}/${coords}?source=first&roundtrip=false`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.trips || !data.trips.length) throw new Error(data.message || data.code || 'risposta inattesa');
    const trip = data.trips[0];
    const ordered = data.waypoints
      .map((w,i) => ({ point: points[i], order: w.waypoint_index }))
      .sort((a,b) => a.order - b.order)
      .map(w => w.point);
    const mins = Math.round(trip.duration / 60), km = (trip.distance / 1000).toFixed(1);
    const steps = ordered.map((p,i) => `<div class="route-step"><span class="route-step-n">${i+1}</span>${escHtml(p.name)}</div>`).join('');
    el.innerHTML = `<div class="route-summary">${mins} min · ${km} km (stima stradale, non tiene conto di soste)</div>${steps}`;
  } catch (e) {
    el.innerHTML = `<p class="costs-hint">Percorso non calcolabile (${escHtml(e.message)}). Il servizio di routing è un demo pubblico gratuito, senza garanzia di disponibilità: riprova più tardi.</p>`;
  }
};

export function renderPlanSaved() {
  const el = document.getElementById('plan-saved'); if (!el) return;
  const dayIds = Object.keys(S.planning).filter(id => ['flights','stays','pois'].some(k => (S.planning[id][k]||[]).length));
  if (!dayIds.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px;">Nessun elemento salvato ancora.</p>'; return; }
  dayIds.sort((a,b) => (parseInt(a,10)||0) - (parseInt(b,10)||0));
  el.innerHTML = dayIds.map(dayId => {
    const dayInfo = S.days.find(d => String(d.id) === String(dayId));
    const dayTitle = `${escHtml(dayInfo?.label||'')} · ${escHtml(dayInfo?.title||`Giorno ${dayId}`)}`;
    const rows = [];
    ['flights','stays','pois'].forEach(kind => {
      (S.planning[dayId][kind]||[]).forEach((item,i) => rows.push(planSavedRowHtml(dayId, kind, item, i)));
    });
    return `<div class="plan-saved-day"><div class="plan-saved-day-ttl">${dayTitle}</div>${rows.join('')}${planSavedTotalHtml(S.planning[dayId])}</div>`;
  }).join('');
}

// ── Autocompletamento aeroporti (public/airports.json, dataset OurAirports) ─────
// Caricato una sola volta, al primo accesso alla scheda Pianifica (lazy: 4562 aeroporti,
// ~380KB, non serve scaricarlo se l'utente non apre mai questa scheda). L'input mantiene
// sempre il codice IATA come value (compatibilita' con searchPlan, che legge 3 lettere),
// il nome leggibile va nella label di conferma sotto il campo, non nel campo stesso.
export async function ensureAirportsLoaded() {
  if (!S.airports) {
    try {
      const res = await fetch('./airports.json');
      S.airports = await res.json();
    } catch (e) {
      S.airports = [];
      console.error('Impossibile caricare airports.json', e);
    }
  }
  if (!S.airportZones) {
    try {
      const res = await fetch('./airport-zones.json');
      S.airportZones = await res.json();
    } catch (e) {
      S.airportZones = [];
      console.error('Impossibile caricare airport-zones.json', e);
    }
  }
}

// Punteggio di rilevanza, non solo "contiene": digitando il codice esatto ("FUE") l'aeroporto
// giusto deve comparire primo, non dopo altri con "fue" come sottostringa casuale del nome
// (es. Cienfuegos) - verificato con un caso reale in sessione, non un'ipotesi.
function _airportScore(a, q) {
  const iata = a.iata.toLowerCase(), city = a.city.toLowerCase(), name = a.name.toLowerCase();
  if (iata === q) return 0;
  if (iata.startsWith(q)) return 1;
  if (city.startsWith(q)) return 2;
  if (name.startsWith(q)) return 3;
  if (city.includes(q)) return 4;
  if (name.includes(q)) return 5;
  return 9;
}

window.onAirportInput = (fieldKey) => {
  const inputId = fieldKey === 'origin' ? 'pf-origin' : 'pf-dest-air';
  const input = document.getElementById(inputId);
  const listEl = document.getElementById(`${inputId}-list`);
  const confirmEl = document.getElementById(`${inputId}-confirm`);
  const q = input.value.trim();
  if (!S.airports || q.length < 2) { listEl.style.display = 'none'; return; }

  const exact = S.airports.find(a => a.iata === q.toUpperCase());
  confirmEl.textContent = exact ? `${escHtml(exact.city)} — ${escHtml(exact.name)}` : '';

  const ql = q.toLowerCase();
  const matches = S.airports.map(a => ({ a, score: _airportScore(a, ql) })).filter(x => x.score < 9).sort((x,y) => x.score - y.score).slice(0, 8).map(x => x.a);
  if (!matches.length) { listEl.style.display = 'none'; return; }
  listEl.innerHTML = matches.map(a => `<div class="airport-ac-item" onmousedown="selectAirport('${fieldKey}','${a.iata}')"><strong>${escHtml(a.iata)}</strong> — ${escHtml(a.city)}<span>${escHtml(a.name)}</span></div>`).join('');
  listEl.style.display = 'block';
};

window.hideAirportSuggestions = (fieldKey) => {
  const inputId = fieldKey === 'origin' ? 'pf-origin' : 'pf-dest-air';
  document.getElementById(`${inputId}-list`).style.display = 'none';
};

window.selectAirport = (fieldKey, iata) => {
  const inputId = fieldKey === 'origin' ? 'pf-origin' : 'pf-dest-air';
  const input = document.getElementById(inputId);
  const airport = S.airports.find(a => a.iata === iata);
  input.value = iata;
  document.getElementById(`${inputId}-confirm`).textContent = airport ? `${escHtml(airport.city)} — ${escHtml(airport.name)}` : '';
  document.getElementById(`${inputId}-list`).style.display = 'none';
  // Suggerisce la citta'/zona per alloggi e POI solo se l'utente non ha gia' scritto la sua:
  // e' un punto di partenza plausibile (comune dell'aeroporto), non sempre la zona turistica
  // giusta (es. FUE -> "El Matorral", non "Corralejo"), quindi non sovrascrive mai un valore
  // presente.
  if (fieldKey === 'dest' && airport) {
    const destLoc = document.getElementById('pf-dest-loc');
    if (!destLoc.value.trim()) destLoc.value = airport.city;
    // Zone turistiche note (public/airport-zones.json), verificate una per una con ricerca web
    // reale, non a memoria: coprono solo aeroporti "leisure" dove il comune amministrativo e'
    // notoriamente diverso dalla zona turistica (isole, destinazioni balneari). Un clic sostituisce
    // sempre il valore corrente: e' una scelta esplicita dell'utente, a differenza del comune
    // sopra che non sovrascrive mai.
    const zoneEntry = (S.airportZones || []).find(z => z.iata === iata);
    const zoneEl = document.getElementById('pf-zone-suggestions');
    // data-zone, non un letterale dentro onclick: alcuni nomi reali contengono un apostrofo
    // (es. "Playa d'en Bossa", Ibiza) che romperebbe una stringa JS incorporata nell'attributo.
    // this.dataset.zone arriva gia' decodificato dal browser, nessun escaping manuale necessario.
    zoneEl.innerHTML = zoneEntry
      ? `<span class="airport-ac-confirm" style="width:100%">Zone turistiche note:</span>${zoneEntry.zones.map(z => `<span class="zone-chip" data-zone="${escHtml(z)}" onclick="pickZoneSuggestion(this.dataset.zone)">${escHtml(z)}</span>`).join('')}`
      : '';
  }
};

window.pickZoneSuggestion = (zoneName) => {
  document.getElementById('pf-dest-loc').value = zoneName;
};

// Il cold start concorrente dei tre servizi a valle (flight/stay/poi-search) puo' superare anche
// i 90s di margine gia' coperti dal retry di trip-planner (verificato dal vivo in sessione): li
// si sveglia in anticipo, appena si apre questa scheda, cosi' il tempo speso a compilare il form
// diventa tempo di risveglio gratuito invece di attesa durante "Cerca". Fire-and-forget: non si
// aspetta la risposta e non si blocca l'interfaccia, un fallimento qui non è mai un errore per
// l'utente (la ricerca vera ha comunque il proprio retry indipendente).
let backendWarmed = false;
export function warmupBackend() {
  if (backendWarmed) return;
  backendWarmed = true;
  fetch(`${TRIP_PLANNER_URL}/api/warmup`, { method: 'POST' }).catch(() => {});
}

window.searchPlan = async () => {
  const btn = document.getElementById('pf-submit'), msgEl = document.getElementById('plan-msg');
  const origin = document.getElementById('pf-origin').value.trim().toUpperCase();
  const destAir = document.getElementById('pf-dest-air').value.trim().toUpperCase();
  const destLoc = document.getElementById('pf-dest-loc').value.trim();
  const dep = document.getElementById('pf-dep').value, ret = document.getElementById('pf-ret').value;
  const adults = parseInt(document.getElementById('pf-adults').value,10) || 1;
  const budget = parseInt(document.getElementById('pf-budget').value,10) || 0;

  if (!destLoc || !dep || !ret) {
    msgEl.innerHTML = '<div class="plan-msg err">Compila almeno città, andata e ritorno.</div>';
    return;
  }
  const wantsFlight = origin.length>0 || destAir.length>0;
  if (wantsFlight && (origin.length!==3 || destAir.length!==3)) {
    msgEl.innerHTML = '<div class="plan-msg err">Aeroporti: 3 lettere in entrambi i campi, oppure lasciali vuoti per non cercare voli.</div>';
    return;
  }
  btn.disabled = true; btn.textContent = 'Ricerca in corso...';
  msgEl.innerHTML = '<div class="plan-msg">Interrogo alloggi e punti di interesse' + (wantsFlight?' e voli':'') + '...</div>';
  document.getElementById('plan-results').innerHTML = '';
  document.getElementById('plan-map').style.display = 'none';
  try {
    const payload = {
      destination_location: destLoc, departure_date: dep, return_date: ret,
      adults, price_max_stay: budget, poi_limit: 20, currency: CURRENCY_CODE,
    };
    if (wantsFlight) { payload.origin_airport = origin; payload.destination_airport = destAir; }
    const res = await fetch(`${TRIP_PLANNER_URL}/api/trip-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const plan = await res.json();
    S.planResults = plan;
    // Serve solo a costruire il link "Cerca su Google Flights" per fonte fast_flights: la
    // FlightOffer non porta origine/destinazione/date, solo l'ultima ricerca fatta le ha.
    S.planLastSearch = wantsFlight ? { origin, destAir, dep, ret } : null;
    S.planFilters = { ...PLAN_FILTERS_DEFAULT };  // ogni nuova ricerca riparte pulita, niente filtri della ricerca precedente
    // Un 429/502/503 qui e' quasi sempre cold start concorrente dei servizi Render (piano free):
    // trip-planner ha gia' ritentato per 90s prima di arrendersi, ma un secondo tentativo a
    // freddo puo' ancora fallire se i servizi non erano ancora svegli — un pulsante "Riprova"
    // evita di dover ridigitare tutto il form per il tentativo successivo, quasi sempre risolutivo.
    msgEl.innerHTML = (plan.errors && plan.errors.length) ? `<div class="plan-msg err">Parziale: ${plan.errors.join(' · ')} <button class="plan-retry-btn" onclick="searchPlan()">Riprova</button></div>` : '';
    renderPlanResults();
    renderPlanPriceMap();
  } catch (e) {
    msgEl.innerHTML = `<div class="plan-msg err">Comparatore non raggiungibile (${e.message}). Se i servizi si stanno solo risvegliando (cold start su Render), riprova. <button class="plan-retry-btn" onclick="searchPlan()">Riprova</button></div>`;
  } finally {
    btn.disabled = false; btn.textContent = 'Cerca';
  }
};

window.setPlanFilter = (key, value) => { S.planFilters[key] = value; renderPlanResults(); };

window.savePlanItem = (kind, idx, btn) => {
  const item = S.planResults[PLAN_API_KEY[kind]][idx];
  const sel = btn.previousElementSibling, dayId = sel.value;
  const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Salvo...';
  const current = (S.planning[dayId] && S.planning[dayId][kind]) || [];
  writePlanDay(dayId, kind, [...current, item]).then(() => {
    btn.textContent = 'Salvato'; btn.classList.add('saved');
    setTimeout(() => { btn.disabled = false; btn.textContent = orig; btn.classList.remove('saved'); }, 1500);
  }).catch(e => { btn.disabled = false; btn.textContent = orig; alert('Errore salvataggio: ' + e.message); });
};

window.removePlanItem = (dayId, kind, idx) => {
  const arr = (S.planning[dayId] && S.planning[dayId][kind]) || [];
  writePlanDay(dayId, kind, arr.filter((_,i) => i !== idx)).catch(e => alert('Errore rimozione: ' + e.message));
};
