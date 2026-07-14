// ── Punto di ingresso: importa SDK Firebase e configurazione del viaggio ─────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { FIREBASE_CONFIG, CURRENCY_CODE } from '../trip.config.js';
import { S } from './state.js';
import { initFirestore, seedIfNeeded, loadContent, loadMeta, loadCosts, loadPriceAlerts, loadKeepAlive, listenRealtime, writeCk, writeActivity, writeNote, writeCompleted } from './firestore.js';
import { renderHero } from './hero.js';
import { renderDays, renderRest, renderCk, updateCkProgress, renderInfoCosts } from './itinerario.js';
import { renderPlanSaved, renderPriceAlerts, renderKeepAlive, ensureAirportsLoaded, warmupBackend, checkPriceAlerts } from './pianifica.js';
import { renderCostsDashboard } from './costs.js';
import { renderMap } from './map.js';

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() { renderHero(); renderDays(); renderRest(); renderCk(); renderPlanSaved(); renderPriceAlerts(); renderKeepAlive(); renderCostsDashboard(); renderInfoCosts(); }

// ── Helpers ───────────────────────────────────────────────────────────────────
function hideLoading() { const o=document.getElementById('overlay'); if(o){ o.style.opacity='0'; setTimeout(()=>o.style.display='none',400); } }
function setStatus(msg) { const el=document.getElementById('load-status'); if(el) el.textContent=msg; }

// ── Punto di ingresso ─────────────────────────────────────────────────────────
async function init() {
  renderHero(); // non richiede Firebase, renderizza subito
  // Etichetta statica in HTML (non rigenerata da un render()): l'unico punto dove riflettere
  // CURRENCY_CODE è impostarla qui una volta, non serve un listener perché il valore è un
  // import statico immutabile per tutta la sessione.
  const budgetLabel = document.getElementById('pf-budget-label');
  if (budgetLabel) budgetLabel.textContent = `Budget alloggio (${CURRENCY_CODE}, totale)`;

  if (FIREBASE_CONFIG.apiKey === 'REPLACE_ME') {
    setStatus('Configura Firebase: sostituisci i valori REPLACE_ME in trip.config.js');
    return;
  }
  try {
    setStatus('Connessione a Firebase...');
    const app = initializeApp(FIREBASE_CONFIG);
    initFirestore(app);

    setStatus('Verifica dati...');
    await seedIfNeeded();

    setStatus('Caricamento itinerario...');
    await loadContent();
    await loadMeta();
    await loadCosts();
    await loadPriceAlerts();
    await loadKeepAlive();

    setStatus('Attivazione sync in tempo reale...');
    listenRealtime();

    renderAll();
    hideLoading();
  } catch (e) {
    setStatus('Errore: ' + e.message);
    console.error(e);
  }
}

// ── Esportazioni verso il DOM (handler onclick nell'HTML) ─────────────────────
window.showTab = (id,btn) => {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active'); btn.classList.add('active');
  if(id==='mappa') renderMap();
  if(id==='pianifica') { ensureAirportsLoaded(); warmupBackend(); checkPriceAlerts(); }
};
window.tog = id => document.getElementById(`dc${id}`).classList.toggle('open');
window.ckTog = (key,el) => {
  const v=!S.ckState[key]; S.ckState[key]=v;
  el.classList.toggle('done',v); const box=el.querySelector('.ck-box'); if(box) box.textContent=v?'✓':''; updateCkProgress();
  writeCk(key,v).catch(e=>{ S.ckState[key]=!v; el.classList.toggle('done',!v); if(box) box.textContent=!v?'✓':''; updateCkProgress(); console.error(e); });
};
window.actTog = (key,el) => {
  const v=!S.activityState[key]; S.activityState[key]=v;
  const blk=el.closest('.sec-blk'); const box=el.querySelector('.sec-box');
  if(blk) blk.classList.toggle('sec-done',v); if(box){ box.classList.toggle('done',v); box.textContent=v?'✓':''; }
  const updated={...S.activityState};
  writeActivity(updated).catch(e=>{
    S.activityState[key]=!v;
    if(blk) blk.classList.toggle('sec-done',!v); if(box){ box.classList.toggle('done',!v); box.textContent=!v?'✓':''; }
    console.error(e);
  });
};
window.toggleNote = id => {
  const area=document.getElementById(`note-area-${id}`); if(!area) return;
  const show=area.style.display==='none'||area.style.display===''; area.style.display=show?'block':'none';
  if(show){ const ta=area.querySelector('textarea'); if(ta){ if(S.notes[id]) ta.value=S.notes[id]; ta.focus(); } }
};
window.saveNote = (id,text) => {
  writeNote(id,text).then(()=>{ const s=document.getElementById(`note-saved-${id}`); if(s){ s.style.display='block'; setTimeout(()=>s.style.display='none',2000); } }).catch(console.error);
};
window.markDone = id => { const c=S.completed[id]||false; writeCompleted(id,!c).catch(console.error); };

init();
