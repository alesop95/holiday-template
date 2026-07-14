// ── Seed, letture e scritture Firestore, listener realtime ──────────────────────
import { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { TRIP_ID, TRIP_META, TRIP_DATA } from '../trip.config.js';
import { S, fb } from './state.js';
import { renderHero } from './hero.js';
import { updateCkUI, updateNotesUI, renderInfoCosts } from './itinerario.js';
import { renderPlanSaved, renderDayPlanningAll, renderPriceAlerts } from './pianifica.js';
import { renderCostsDashboard } from './costs.js';

export function initFirestore(app) {
  fb.db = getFirestore(app);
}

// ── Seed automatico al primo avvio ────────────────────────────────────────────
// days/restaurants/checklist NON sono piu' seminati su Firestore (erano "seed once": la prima
// visita li scriveva su Firestore e ogni modifica successiva a TRIP_DATA restava invisibile
// finche' qualcuno non cancellava i documenti a mano su Firebase Console — fonte reale di
// confusione, riscontrata piu' volte durante lo sviluppo di piu' viaggi). Sono contenuto
// dello sviluppatore, mai modificato dall'app: si leggono sempre dal file, sullo stesso
// modello gia' usato per hotelChange/accommodation/costEstimate/tickets/savingTips/
// programSummary. Si perde la comodita' di editarli da Firebase Console senza redeploy
// (documentata in precedenza in README.md, mai usata nella pratica), a favore di un solo
// meccanismo coerente per tutto il contenuto statico del viaggio.
// state/* resta seed-once (a differenza di content, e' dati reali dell'utente — checklist
// spuntata, note, alloggi salvati, prenotazione confermata — che un reseed ripetuto
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
    setDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'meta'),      { ...TRIP_META }),
    setDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'costs'),     { participants: [], expenses: [] }),
    setDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'priceAlerts'), { items: [] }),
  ]);
}

// ── Contenuto del viaggio: sempre dal file, mai da Firestore ──────────────────
export function loadContent() {
  S.days = TRIP_DATA.days; S.restaurants = TRIP_DATA.restaurants; S.checklist = TRIP_DATA.checklist;
}

// Viaggi seminati prima che state/meta esistesse (vedi seedIfNeeded) non hanno questo
// documento: fallback a TRIP_META, self-healing al primo salvataggio (writeMeta usa
// setDoc, non updateDoc, quindi crea il documento se assente).
export async function loadMeta() {
  const snap = await getDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'meta'));
  S.meta = snap.exists() ? snap.data() : { ...TRIP_META };
}

// Stesso fallback self-healing di loadMeta: un viaggio seminato prima che questa feature
// esistesse non ha 'costs', riparte da un dashboard vuoto invece di rompersi.
export async function loadCosts() {
  const snap = await getDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'costs'));
  S.costs = snap.exists() ? snap.data() : { participants: [], expenses: [] };
}

// Stesso fallback self-healing di loadCosts/loadMeta: un viaggio seminato prima che questa
// feature esistesse non ha 'priceAlerts', riparte da una lista vuota invece di rompersi.
export async function loadPriceAlerts() {
  const snap = await getDoc(doc(fb.db, 'trips', TRIP_ID, 'state', 'priceAlerts'));
  S.priceAlerts = snap.exists() ? (snap.data().items || []) : [];
}

// ── Listener real-time per stato condiviso ────────────────────────────────────
export function listenRealtime() {
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'checklist'), snap => {
    if (!snap.exists()) return;
    S.ckState = snap.data().items || {};
    updateCkUI();
  });
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
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'meta'), snap => {
    if (!snap.exists()) return;
    S.meta = snap.data();
    if (!S.metaEditing) renderHero();  // non sovrascrive una modifica in corso sull'altro dispositivo
  });
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'costs'), snap => {
    S.costs = snap.exists() ? snap.data() : { participants: [], expenses: [] };
    renderCostsDashboard();
    renderInfoCosts(); // confirmedAccommodation vive nello stesso documento: aggiorna anche "Info & Costi"
  });
  onSnapshot(doc(fb.db, 'trips', TRIP_ID, 'state', 'priceAlerts'), snap => {
    S.priceAlerts = snap.exists() ? (snap.data().items || []) : [];
    renderPriceAlerts();
  });
}

// ── Scritture su Firestore ────────────────────────────────────────────────────
export async function writeCk(key, val)       { await updateDoc(doc(fb.db,'trips',TRIP_ID,'state','checklist'), { [`items.${key}`]: val }); }
export async function writeNote(id, text)     { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','notes'), { days: { [id]: text } }, { merge:true }); }
export async function writeCompleted(id, val) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','notes'), { completed: { [id]: val } }, { merge:true }); }
// merge:true crea il documento e le mappe annidate se assenti (vale anche per un viaggio
// gia' seminato prima che 'planning' esistesse, vedi seedIfNeeded): stesso pattern di writeNote.
export async function writePlanDay(dayId, kind, arr) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','planning'), { byDay: { [dayId]: { [kind]: arr } } }, { merge:true }); }
export async function writeMeta(meta) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','meta'), meta); }
export async function writeCosts(costs) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','costs'), costs); }
export async function writePriceAlerts(items) { await setDoc(doc(fb.db,'trips',TRIP_ID,'state','priceAlerts'), { items }); }
