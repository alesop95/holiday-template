// ── Seed, letture e scritture Firestore, listener realtime ──────────────────────
import { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { TRIP_ID, TRIP_META, TRIP_DATA } from '../trip.config.js';
import { S, fb } from './state.js';
import { renderHero } from './hero.js';
import { updateCkUI, updateNotesUI, updateActivityUI, renderInfoCosts, renderDayTodosAll } from './itinerario.js';
import { renderPlanSaved, renderDayPlanningAll, renderPriceAlerts, renderKeepAlive } from './pianifica.js';
import { renderCostsDashboard } from './costs.js';

export function initFirestore(app) {
  fb.db = getFirestore(app);
}

// ── Fabbrica per un documento di stato semplice (trips/{TRIP_ID}/state/{name}) ───
// Generalizza il pattern seed→load→write→listener scritto a mano, identico, per
// meta/costs/priceAlerts/activities/keepAlive: un solo documento Firestore, letto e scritto
// sempre per intero (mai un aggiornamento parziale). unwrap/wrap servono solo a chi avvolge un
// array o una mappa sotto una chiave wrapper (es. {items:[...]}: Firestore non accetta un array
// come documento di primo livello) - meta/costs/keepAlive non ne hanno bisogno, il documento e'
// gia' l'oggetto giusto cosi' com'e'. Restano fuori da questa fabbrica checklist (updateDoc con
// path puntato, aggiornamento di un singolo campo) e notes/planning (setDoc con merge:true su
// mappe annidate): scrivono in modo parziale, non per intero, sono una variante diversa dello
// stesso schema di stato condiviso, non lo stesso schema, e restano scritte a mano sotto.
function createStateDoc(name, { defaultValue, unwrap = (data) => data, wrap = (value) => value }) {
  const ref = () => doc(fb.db, 'trips', TRIP_ID, 'state', name);
  return {
    seed: () => setDoc(ref(), wrap(defaultValue)),
    load: async () => {
      const snap = await getDoc(ref());
      return snap.exists() ? unwrap(snap.data()) : defaultValue;
    },
    write: (value) => setDoc(ref(), wrap(value)),
    listen: (onChange) => onSnapshot(ref(), snap => {
      onChange(snap.exists() ? unwrap(snap.data()) : defaultValue);
    }),
  };
}

const metaDoc = createStateDoc('meta', { defaultValue: { ...TRIP_META } });
const costsDoc = createStateDoc('costs', { defaultValue: { participants: [], expenses: [] } });
const priceAlertsDoc = createStateDoc('priceAlerts', {
  defaultValue: [], unwrap: (data) => data.items || [], wrap: (items) => ({ items }),
});
const activitiesDoc = createStateDoc('activities', {
  defaultValue: {}, unwrap: (data) => data.items || {}, wrap: (items) => ({ items }),
});
const keepAliveDoc = createStateDoc('keepAlive', { defaultValue: { activatedAt: null } });

// "Cose da fare" seminate da TRIP_DATA.days[].todos (contenuto per-viaggio, opzionale), poi
// libere: l'utente le spunta, ne aggiunge e ne rimuove dall'app, esattamente come i partecipanti
// in "Costi". Calcolato una sola volta qui (TRIP_DATA e' statico per tutta la sessione), stesso
// principio di TRIP_META per state/meta: lo shell condiviso legge un campo generico del viaggio,
// il contenuto vero e proprio vive in trip.config.js, non qui.
function _defaultTodosByDay() {
  const byDay = {};
  TRIP_DATA.days.forEach(d => {
    if (d.todos && d.todos.length) {
      byDay[d.id] = d.todos.map((text, i) => ({ id: `seed-${d.id}-${i}`, text, done: false }));
    }
  });
  return byDay;
}
const todosDoc = createStateDoc('todos', {
  defaultValue: _defaultTodosByDay(), unwrap: (data) => data.byDay || {}, wrap: (byDay) => ({ byDay }),
});

// ── Seed automatico al primo avvio ────────────────────────────────────────────
// days/restaurants/checklist NON sono piu' seminati su Firestore (erano "seed once": la prima
// visita li scriveva su Firestore e ogni modifica successiva a TRIP_DATA restava invisibile
// finche' qualcuno non cancellava i documenti a mano su Firebase Console - fonte reale di
// confusione, riscontrata piu' volte durante lo sviluppo di piu' viaggi). Sono contenuto
// dello sviluppatore, mai modificato dall'app: si leggono sempre dal file, sullo stesso
// modello gia' usato per hotelChange/accommodation/costEstimate/tickets/savingTips/
// programSummary. Si perde la comodita' di editarli da Firebase Console senza redeploy
// (documentata in precedenza in README.md, mai usata nella pratica), a favore di un solo
// meccanismo coerente per tutto il contenuto statico del viaggio.
// state/* resta seed-once (a differenza di content, e' dati reali dell'utente - checklist
// spuntata, note, alloggi salvati, prenotazione confermata - che un reseed ripetuto
// distruggerebbe: setDoc con un array vuoto sovrascrive per intero l'array esistente anche
// con merge:true, Firestore non fa merge profondo sugli array). state/meta come sentinella
// di "prima visita mai fatta", sullo stesso ruolo che content/days aveva prima.
export async function seedIfNeeded() {
  const snap = await getDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'meta'));
  if (snap.exists()) return;
  await Promise.all([
    setDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'checklist'), { items: {} }),
    setDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'notes'),     { days: {}, completed: {} }),
    setDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'planning'),  { byDay: {} }),
    metaDoc.seed(),
    costsDoc.seed(),
    priceAlertsDoc.seed(),
    activitiesDoc.seed(),
    keepAliveDoc.seed(),
    todosDoc.seed(),
  ]);
}

// ── Contenuto del viaggio: sempre dal file, mai da Firestore ──────────────────
export function loadContent() {
  S.days = TRIP_DATA.days; S.restaurants = TRIP_DATA.restaurants; S.checklist = TRIP_DATA.checklist;
}

// Viaggi seminati prima che state/meta esistesse (vedi seedIfNeeded) non hanno questo
// documento: fallback a TRIP_META, self-healing al primo salvataggio (writeMeta usa
// setDoc, non updateDoc, quindi crea il documento se assente).
export async function loadMeta() { S.meta = await metaDoc.load(); }

// Stesso fallback self-healing di loadMeta: un viaggio seminato prima che questa feature
// esistesse non ha 'costs', riparte da un dashboard vuoto invece di rompersi.
export async function loadCosts() { S.costs = await costsDoc.load(); }

// Stesso fallback self-healing di loadCosts/loadMeta: un viaggio seminato prima che questa
// feature esistesse non ha 'priceAlerts', riparte da una lista vuota invece di rompersi.
export async function loadPriceAlerts() { S.priceAlerts = await priceAlertsDoc.load(); }

// Stesso fallback self-healing: un viaggio seminato prima di questa feature riparte da
// "mai attivato" invece di rompersi.
export async function loadKeepAlive() { S.keepAlive = await keepAliveDoc.load(); }

// Stesso fallback self-healing, ma il default qui non e' vuoto: un viaggio senza questo
// documento (seminato prima della feature, o mai scritto perche' l'utente non ha ancora
// toccato nulla) riparte dalle cose-da-fare suggerite in TRIP_DATA, non da una lista vuota.
export async function loadTodos() { S.todos = await todosDoc.load(); }

// ── Listener real-time per stato condiviso ────────────────────────────────────
export function listenRealtime() {
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'checklist'), snap => {
    if (!snap.exists()) return;
    S.ckState = snap.data().items || {};
    updateCkUI();
  });
  activitiesDoc.listen(items => { S.activityState = items; updateActivityUI(); });
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'notes'), snap => {
    if (!snap.exists()) return;
    S.notes = snap.data().days || {}; S.completed = snap.data().completed || {};
    updateNotesUI();
  });
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'planning'), snap => {
    S.planning = snap.exists() ? (snap.data().byDay || {}) : {};
    renderPlanSaved();
    renderDayPlanningAll();
    // computePlanningCosts()/resolveAccommodationCost() dipendono da S.planning: senza queste due
    // righe, "Costi" e "Info & Costi" restavano disallineati finché non si cambiava scheda.
    renderCostsDashboard();
    renderInfoCosts();
  });
  metaDoc.listen(meta => {
    S.meta = meta;
    if (!S.metaEditing) renderHero(); // non sovrascrive una modifica in corso sull'altro dispositivo
  });
  costsDoc.listen(costs => {
    S.costs = costs;
    renderCostsDashboard();
    renderInfoCosts(); // confirmedAccommodation vive nello stesso documento: aggiorna anche "Info & Costi"
  });
  priceAlertsDoc.listen(items => { S.priceAlerts = items; renderPriceAlerts(); });
  keepAliveDoc.listen(keepAlive => { S.keepAlive = keepAlive; renderKeepAlive(); });
  todosDoc.listen(byDay => { S.todos = byDay; renderDayTodosAll(); });
}

// ── Scritture su Firestore ────────────────────────────────────────────────────
export async function writeCk(key, val)       { await updateDoc(doc(fb.db,'trips',TRIP_ID,'state','checklist'), { [`items.${key}`]: val }); }
export async function writeActivity(items)    { await activitiesDoc.write(items); }
export async function writeNote(id, text)     { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','notes'), { days: { [id]: text } }, { merge:true }); }
export async function writeCompleted(id, val) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','notes'), { completed: { [id]: val } }, { merge:true }); }
// merge:true crea il documento e le mappe annidate se assenti (vale anche per un viaggio
// gia' seminato prima che 'planning' esistesse, vedi seedIfNeeded): stesso pattern di writeNote.
export async function writePlanDay(dayId, kind, arr) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','planning'), { byDay: { [dayId]: { [kind]: arr } } }, { merge:true }); }
export async function writeMeta(meta)         { await metaDoc.write(meta); }
export async function writeCosts(costs)       { await costsDoc.write(costs); }
export async function writePriceAlerts(items) { await priceAlertsDoc.write(items); }
export async function writeKeepAlive(activatedAt) { await keepAliveDoc.write({ activatedAt }); }
export async function writeTodos(byDay) { await todosDoc.write(byDay); }
