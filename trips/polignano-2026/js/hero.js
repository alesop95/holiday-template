// ── Hero dinamico da S.meta (Firestore, editabile), con fallback a TRIP_META ─────
// TRIP_META resta l'unica fonte finché lo stato Firestore non e' stato letto (primo
// render, prima ancora della connessione), e resta il seed iniziale per ogni nuovo
// viaggio: da li' in avanti l'utente puo' modificare titolo/badge/tag dall'app senza
// toccare trip.config.js. escHtml perche' da questo momento e' contenuto scritto da un
// utente reale, non solo dallo sviluppatore in trip.config.js.
import { TRIP_META } from '../trip.config.js';
import { S, escHtml } from './state.js';
import { writeMeta } from './firestore.js';

export function renderHero() {
  const m = S.meta || TRIP_META;
  document.getElementById('hero-root').innerHTML = `
    <button class="hero-edit-btn" onclick="toggleMetaEdit()">${S.metaEditing?'Chiudi':'Modifica'}</button>
    <div class="hero-badge">${escHtml(m.badge)}</div>
    <h1>${escHtml(m.title)}</h1>
    <p class="hero-sub">${escHtml(m.subtitle)}</p>
    <div class="hero-stats">
      ${m.stats.map(s => `<div class="hero-stat">${escHtml(s)}</div>`).join('')}
    </div>`;
}

// ── Pannello di modifica hero (badge/titolo/sottotitolo/tag) ─────────────────────
// Bozza locale separata da S.meta: onSnapshot su state/meta non deve poter cancellare
// modifiche non ancora salvate mentre il pannello e' aperto (vedi listenRealtime).
let _metaDraft = null;

function renderMetaEditPanel() {
  const panel = document.getElementById('hero-edit-panel');
  if (!S.metaEditing) { panel.style.display = 'none'; panel.innerHTML = ''; return; }
  const m = _metaDraft;
  panel.style.display = 'block';
  panel.innerHTML = `<div class="hero-edit-card">
    <div class="hero-edit-field"><label>Badge</label><input id="me-badge" value="${escHtml(m.badge)}"></div>
    <div class="hero-edit-field"><label>Titolo</label><input id="me-title" value="${escHtml(m.title)}"></div>
    <div class="hero-edit-field"><label>Sottotitolo</label><input id="me-subtitle" value="${escHtml(m.subtitle)}"></div>
    <div class="hero-edit-field"><label>Tag (vincoli/caratteristiche del viaggio)</label></div>
    ${m.stats.map((s,i) => `<div class="hero-edit-stats-row"><input id="me-stat-${i}" value="${escHtml(s)}"><button class="hero-edit-rm-btn" onclick="removeMetaStatField(${i})">&times;</button></div>`).join('')}
    <button class="hero-edit-add-btn" onclick="addMetaStatField()">+ Aggiungi tag</button>
    <div class="hero-edit-actions">
      <button class="hero-edit-save" onclick="saveMeta()">Salva</button>
      <button class="hero-edit-cancel" onclick="toggleMetaEdit()">Annulla</button>
    </div>
  </div>`;
}

function _readMetaDraftFromInputs() {
  // Legge lo stato corrente dei campi prima di ri-renderizzare (add/remove tag), cosi'
  // non si perde quello che l'utente ha gia' digitato negli altri campi.
  if (!_metaDraft) return;
  const badgeEl = document.getElementById('me-badge');
  if (!badgeEl) return; // pannello non ancora renderizzato la prima volta
  _metaDraft.badge = badgeEl.value;
  _metaDraft.title = document.getElementById('me-title').value;
  _metaDraft.subtitle = document.getElementById('me-subtitle').value;
  _metaDraft.stats = _metaDraft.stats.map((_,i) => document.getElementById(`me-stat-${i}`).value);
}

window.toggleMetaEdit = () => {
  if (S.metaEditing) { S.metaEditing = false; }
  else { _metaDraft = JSON.parse(JSON.stringify(S.meta || TRIP_META)); S.metaEditing = true; }
  renderHero();
  renderMetaEditPanel();
};

window.addMetaStatField = () => {
  _readMetaDraftFromInputs();
  _metaDraft.stats.push('');
  renderMetaEditPanel();
  document.getElementById(`me-stat-${_metaDraft.stats.length - 1}`).focus();
};

window.removeMetaStatField = (i) => {
  _readMetaDraftFromInputs();
  _metaDraft.stats.splice(i, 1);
  renderMetaEditPanel();
};

window.saveMeta = () => {
  _readMetaDraftFromInputs();
  const meta = {
    badge: _metaDraft.badge.trim(), title: _metaDraft.title.trim(), subtitle: _metaDraft.subtitle.trim(),
    stats: _metaDraft.stats.map(s => s.trim()).filter(Boolean),
  };
  writeMeta(meta).then(() => {
    S.meta = meta; S.metaEditing = false; renderHero(); renderMetaEditPanel();
  }).catch(e => alert('Errore salvataggio: ' + e.message));
};
