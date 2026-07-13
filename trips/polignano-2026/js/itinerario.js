// ── Itinerario, ristoranti, alloggio risolto, Info & Costi, checklist, note ──────
import { TRIP_DATA, CURRENCY_SYMBOL, CURRENCY_CODE } from '../trip.config.js';
import { S, escHtml, parsePrice, parseCostRange } from './state.js';
import { writeCosts } from './firestore.js';
import { renderDayPlanningAll } from './pianifica.js';

export function renderDays() {
  const c = document.getElementById('days-container'); let html = '';
  // "Il Programma" era testo scritto a mano nella shell condivisa con la sintesi di Cilento
  // (stesso problema gia' corretto per "Cambio Hotel" e "Info & Costi", qui era sfuggito):
  // ogni viaggio copiato dalla shell mostrava la sintesi di Cilento invece della propria.
  const summaryEl = document.getElementById('program-summary');
  if (summaryEl) summaryEl.textContent = TRIP_DATA.programSummary || '';
  // Il banner di cambio hotel e' specifico dei viaggi con piu' di una base (es. Cilento,
  // 4 notti + 2 notti): TRIP_DATA.hotelChange e' assente per un viaggio a base unica come
  // Polignano, quindi il banner semplicemente non compare, invece di mostrare per errore
  // il cambio hotel di un altro viaggio copiato dalla shell condivisa.
  const hc = TRIP_DATA.hotelChange;
  S.days.forEach((d, i) => {
    if (hc && d.id === hc.afterDayId) html += `<div class="change-banner"><h4>${hc.title}</h4><p>${hc.text}</p></div>`;
    const done = S.completed[d.id] || false;
    html += `<div class="day-card${done?' day-done':''}" id="dc${d.id}" style="--dc:${d.color}">
      <div class="day-hdr" onclick="tog(${d.id})">
        <div class="day-ico" style="background:${d.color}">${d.id}</div>
        <div class="day-meta"><div class="day-lbl" style="color:${d.color}">${d.label}</div><div class="day-ttl">${d.title}</div><div class="day-pl">${d.places}</div></div>
        <div class="hdr-right"><div class="done-badge" id="done-badge-${d.id}" style="${done?'display:flex':'display:none'}">✓ Fatto</div><div class="day-chv">▼</div></div>
      </div>
      <div class="day-body">
        ${d.sections.map(s=>`<div class="sec-blk"><div class="sec-ttl" style="color:${d.color}">${s.t}</div><div class="sec-txt">${s.tx}</div></div>`).join('')}
        ${d.tips?`<div class="tips-box" style="border-left-color:${d.color}"><div class="tips-ttl" style="color:${d.color}">Consigli Pratici</div>${d.tips.map(t=>`<div class="tip">${t}</div>`).join('')}</div>`:''}
        <div class="dcosts"><div class="cpill cf">Pasti: ${CURRENCY_SYMBOL}${d.cf}/pers.</div>${d.ca==='0'?'<div class="cpill cg">Attività: Gratuito</div>':`<div class="cpill ca">Attività: ${CURRENCY_SYMBOL}${d.ca}/pers.</div>`}</div>
        <div class="day-planning" id="day-planning-${d.id}" style="display:none"></div>
        <div class="day-actions">
          <button class="act-btn${done?' btn-done-active':''}" id="done-btn-${d.id}" onclick="markDone(${d.id})">${done?'✓ Fatto!':'○ Segna come fatto'}</button>
          <button class="act-btn" onclick="toggleNote(${d.id})">Note</button>
        </div>
        <div class="note-area" id="note-area-${d.id}" style="display:${S.notes[d.id]?'block':'none'}">
          <textarea id="note-ta-${d.id}" placeholder="Aggiungi una nota condivisa..." onblur="saveNote(${d.id},this.value)">${S.notes[d.id]||''}</textarea>
          <div class="note-saved" id="note-saved-${d.id}">✓ Salvato</div>
        </div>
      </div></div>`;
  });
  c.innerHTML = html;
  renderDayPlanningAll();
}

// Link esterni opzionali per ristorante (tripadvisor/thefork su ogni item di TRIP_DATA.
// restaurants[].items[]): funzionalità di template generale, non specifica di un viaggio —
// un item senza questi campi semplicemente non mostra la riga link, come per gli altri
// campi opzionali già esistenti (sp, tags vuoti).
export function renderRest() {
  document.getElementById('rest-container').innerHTML = S.restaurants.map(a=>`
    <div class="rest-area"><div class="rest-area-ttl">${a.area}</div><div class="rest-area-sub">${a.days}</div>
    <div class="rest-grid">${a.items.map(r=>{
      const links = [
        r.tripadvisor ? `<a class="rest-link" href="${r.tripadvisor}" target="_blank" rel="noopener noreferrer">Tripadvisor →</a>` : '',
        r.thefork ? `<a class="rest-link" href="${r.thefork}" target="_blank" rel="noopener noreferrer">TheFork →</a>` : '',
      ].filter(Boolean).join('');
      return `<div class="rest-card"><div class="rest-nm">${r.nm}</div><div class="rest-tags">${r.tags.map(t=>`<span class="rtag${t.startsWith('$')?' p':''}">${t}</span>`).join('')}</div><div class="rest-note">${r.note}</div>${r.sp?`<div class="rest-sp">${r.sp}</div>`:''}${links?`<div class="rest-links">${links}</div>`:''}</div>`;
    }).join('')}</div></div>`).join('');
}

// ── Gerarchia di risoluzione del costo alloggio ────────────────────────────────
// Confermato (prenotazione reale, es. Booking.com) > salvato da Pianifica (ricerca
// Airbnb, automatico ma non confermato) > nessuno dei due, resta solo la stima
// indicativa scritta a mano in TRIP_DATA.costEstimate. Condivisa tra "Info & Costi"
// e il totale automatico di "Costi": lo stesso valore risolto qui alimenta entrambe
// le schede, cosi' un alloggio confermato non si somma due volte (una in "Info &
// Costi", una nel totale di "Costi" calcolato separatamente da Pianifica).
export function resolveAccommodationCost() {
  const confirmed = S.costs?.confirmedAccommodation;
  if (confirmed && confirmed.totalPrice) {
    return { amount: confirmed.totalPrice, count: 1, label: confirmed.label || 'Prenotazione confermata', link: confirmed.link || '', paidBy: confirmed.paidBy || '', status: 'confirmed' };
  }
  const savedStays = Object.values(S.planning).flatMap(day => day.stays || []);
  if (savedStays.length) {
    const amount = savedStays.reduce((s, st) => s + parsePrice(st.total_price), 0);
    return { amount, count: savedStays.length, label: `${savedStays.length} alloggio/i salvato/i da Pianifica`, link: '', status: 'pianifica' };
  }
  return null;
}

// Sconto opzionale di TRIP_DATA.costEstimate.discount: importo di coppia (non per persona),
// applicato coerentemente sia in "Info & Costi" (diviso /2) sia nel totale reale di "Costi"
// (per intero). Scaduto dopo validUntil: torna null, non si applica piu' automaticamente —
// evita di mostrare uno sconto non piu' valido solo perche' nessuno ha aggiornato il file.
export function activeDiscount() {
  const d = TRIP_DATA.costEstimate?.discount;
  if (!d) return null;
  if (d.validUntil && new Date() > new Date(d.validUntil + 'T23:59:59')) return null;
  return d;
}

function renderConfirmedBookingBlock(resolvedAcc) {
  const participants = (S.costs && S.costs.participants) || [];
  if (resolvedAcc && resolvedAcc.status === 'confirmed') {
    return `<div class="info-hotel">
      <div class="costs-card-ttl">Prenotazione confermata</div>
      <div class="costs-auto-row"><span>${escHtml(resolvedAcc.label)} — ${CURRENCY_SYMBOL} ${resolvedAcc.amount.toFixed(2)} totale${resolvedAcc.paidBy?` · pagato da ${escHtml(resolvedAcc.paidBy)}`:' · nessun pagatore assegnato'}${resolvedAcc.link?` · <a href="${escHtml(resolvedAcc.link)}" target="_blank" rel="noopener noreferrer">link</a>`:''}</span>
      <button class="costs-rm-btn" onclick="clearConfirmedAccommodation()">&times;</button></div>
    </div>`;
  }
  return `<div class="info-hotel">
    <div class="costs-card-ttl">Segna una prenotazione come confermata</div>
    <p class="costs-hint">Finché non confermi nulla qui, l'alloggio resta la stima indicativa sopra (o quanto salvato da Pianifica, se presente). Il pagatore serve per calcolare correttamente chi deve dare cosa a chi nella scheda "Costi".</p>
    <div class="costs-expense-form">
      <input id="cb-label" placeholder="Nome struttura (es. Magda Relax Suites)">
      <input id="cb-price" type="number" min="0" step="0.01" placeholder="Prezzo totale ${CURRENCY_CODE}">
      <input id="cb-link" placeholder="Link (facoltativo)">
      <select id="cb-paidby"><option value="">Nessun pagatore</option>${participants.map(p=>`<option value="${escHtml(p)}">${escHtml(p)}</option>`).join('')}</select>
      <button class="costs-add-btn" onclick="saveConfirmedAccommodation()">Conferma prenotazione</button>
    </div>
  </div>`;
}

window.saveConfirmedAccommodation = () => {
  const label = document.getElementById('cb-label').value.trim();
  const price = parseFloat(document.getElementById('cb-price').value);
  const link = document.getElementById('cb-link').value.trim();
  const paidBy = document.getElementById('cb-paidby').value;
  if (!label || !price) { alert('Inserisci almeno nome struttura e prezzo totale.'); return; }
  writeCosts({ ...(S.costs||{participants:[],expenses:[]}), confirmedAccommodation: { label, totalPrice: price, link, paidBy } }).catch(e => alert('Errore: ' + e.message));
};
window.clearConfirmedAccommodation = () => {
  writeCosts({ ...(S.costs||{participants:[],expenses:[]}), confirmedAccommodation: null }).catch(e => alert('Errore: ' + e.message));
};

// ── "Info & Costi": hotel/costi/biglietti/risparmio, guidati da TRIP_DATA ──────────
// Prima era markup scritto a mano dentro la shell condivisa con i dati reali di
// Cilento: copiando la shell su un nuovo viaggio (es. polignano-2026) quel contenuto
// arrivava intatto e sbagliato. TRIP_DATA.accommodation/costEstimate/tickets/
// savingTips sono tutti opzionali: una sezione non compare se il viaggio non la
// definisce, invece di mostrare per errore il contenuto di un altro viaggio.
export function renderInfoCosts() {
  const el = document.getElementById('info-content'); if (!el) return;
  const acc = TRIP_DATA.accommodation, cost = TRIP_DATA.costEstimate;
  const tickets = TRIP_DATA.tickets || [], tips = TRIP_DATA.savingTips || [];
  const resolvedAcc = resolveAccommodationCost();
  let html = '';
  if (acc) {
    // Le opzioni indicative (options) non hanno piu' senso una volta che una prenotazione e'
    // davvero confermata: mostrarle insieme al prezzo vero e' rumore, non un'alternativa reale
    // da valutare. L'intestazione della base (nome/date) resta, per contesto.
    const hideOptions = resolvedAcc && resolvedAcc.status === 'confirmed';
    html += `<div class="sec-head"><h2>Gli Hotel</h2><p>${acc.subtitle||''}</p></div>`;
    html += acc.bases.map(b => `<div class="info-hotel">
      <div class="ih-head"><div><div class="ih-name">${b.name}</div><div class="ih-loc">${b.location}</div></div><div class="ih-badge" style="background:${b.badgeBg};color:${b.badgeColor};">${b.badge}</div></div>
      ${hideOptions ? '' : b.options.map(o => `<div class="ih-opt"><div class="ih-oname">${o.name}</div><div class="ih-price">${o.price}</div><div class="ih-desc">${o.desc}</div>${o.note?`<div class="ih-note">${o.note}</div>`:''}</div>`).join('')}
    </div>`).join('');
    html += renderConfirmedBookingBlock(resolvedAcc);
  }
  if (acc && cost) html += `<div class="divider"></div>`;
  if (cost) {
    // La riga Alloggio diventa il valore risolto (confermato/Pianifica) quando esiste, invece
    // dell'intervallo indicativo scritto a mano: il totale si ricalcola di conseguenza sommando
    // gli intervalli di tutte le righe, non resta un numero statico ormai disallineato.
    const rows = cost.rows.map(r => {
      if (r.kind === 'accommodation' && resolvedAcc) {
        const perPerson = resolvedAcc.amount / 2;
        const statusTxt = resolvedAcc.status === 'confirmed' ? 'confermato' : 'automatico da Pianifica, non ancora confermato';
        const linkTxt = resolvedAcc.link ? ` · <a href="${escHtml(resolvedAcc.link)}" target="_blank" rel="noopener noreferrer">link</a>` : '';
        return { label:r.label, desc:`${escHtml(resolvedAcc.label)} — ${statusTxt}${linkTxt}`, amount:`${CURRENCY_SYMBOL}${perPerson.toFixed(2)}`, _range:[perPerson,perPerson] };
      }
      return { label:r.label, desc:r.desc, amount:r.amount, _range:parseCostRange(r.amount) };
    });
    // Sconto: importo di coppia, va diviso /2 prima di sottrarlo da un totale "per persona".
    const disc = activeDiscount();
    const discPerPerson = disc ? disc.amount / 2 : 0;
    const lo = Math.max(0, rows.reduce((s,r)=>s+r._range[0],0) - discPerPerson);
    const hi = Math.max(0, rows.reduce((s,r)=>s+r._range[1],0) - discPerPerson);
    const totalTxt = lo===hi ? `${CURRENCY_SYMBOL}${lo.toFixed(2)}` : `${CURRENCY_SYMBOL}${lo.toFixed(0)}-${hi.toFixed(0)}`;
    const discRow = disc ? `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">Sconto</div><div class="cost-desc">${escHtml(disc.desc)} (entro il ${disc.validUntil.split('-').reverse().join('/')})</div></div><div class="cost-amt" style="color:var(--teal)">-${CURRENCY_SYMBOL}${discPerPerson.toFixed(2)}</div></div>` : '';
    html += `<div class="sec-head"><h2>Stima Costi</h2><p>${cost.subtitle||''}</p></div>
      <div class="cost-tbl">${rows.map(r => `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">${r.label}</div>${r.desc?`<div class="cost-desc">${r.desc}</div>`:''}</div><div class="cost-amt">${r.amount}</div></div>`).join('')}${discRow}</div>
      <div class="cost-total"><div class="ct-lbl">Totale stimato per persona</div><div><div class="ct-amt">${totalTxt}</div><div class="ct-sub">${cost.total.sub}</div></div></div>`;
  }
  if (tickets.length) {
    html += `<div class="sec-head"><h2>Biglietti e Ingressi</h2></div>
      <div class="bgl-tbl">${tickets.map(t => `<div class="bg-row"><div class="bg-name">${t.name}</div><div class="bg-price"${t.free?' style="color:var(--teal)"':''}>${t.price}</div></div>`).join('')}</div>`;
  }
  if (tips.length) {
    html += `<div class="info-tips"><div class="it-ttl">Come Risparmiare</div>${tips.map((t,i) => `<div class="tip"${i>0?' style="margin-top:6px"':''}>${t}</div>`).join('')}</div>`;
  }
  el.innerHTML = html || '<p style="color:var(--muted);font-size:13px;">Nessun dato di hotel/costi per questo viaggio.</p>';
}

export function renderCk() {
  S.checklist.forEach((cat,ci)=>cat.items.forEach((_,ii)=>{ const k=`${ci}-${ii}`; if(!(k in S.ckState)) S.ckState[k]=false; }));
  document.getElementById('ck-container').innerHTML = S.checklist.map((cat,ci)=>`
    <div class="ck-cat"><div class="ck-cat-ttl">${cat.cat}</div><div class="ck-list">
    ${cat.items.map((item,ii)=>{ const k=`${ci}-${ii}`;const done=S.ckState[k]||false;
      return `<div class="ck-item${done?' done':''}" data-key="${k}" onclick="ckTog('${k}',this)"><div class="ck-box">${done?'✓':''}</div><div class="ck-lbl">${item.t}</div>${item.n?`<div class="ck-note">${item.n}</div>`:''}</div>`;
    }).join('')}</div></div>`).join('');
  updateCkProgress();
}

export function updateCkUI() {
  Object.entries(S.ckState).forEach(([k,v])=>{
    const el=document.querySelector(`.ck-item[data-key="${k}"]`); if(!el) return;
    el.classList.toggle('done',v); const box=el.querySelector('.ck-box'); if(box) box.textContent=v?'✓':'';
  }); updateCkProgress();
}

export function updateCkProgress() {
  const total=Object.keys(S.ckState).length, done=Object.values(S.ckState).filter(Boolean).length, pct=total>0?Math.round(done/total*100):0;
  const t=document.getElementById('prog-txt'),f=document.getElementById('prog-fill'),e=document.getElementById('prog-status');
  if(t) t.textContent=`${done} / ${total}`; if(f) f.style.width=pct+'%';
  if(e) e.textContent=pct===100?'Tutto pronto!':pct>60?'Quasi pronti':pct>0?'In preparazione':'Preparazione';
}

export function updateNotesUI() {
  S.days.forEach(d=>{
    const area=document.getElementById(`note-area-${d.id}`), ta=document.getElementById(`note-ta-${d.id}`);
    const badge=document.getElementById(`done-badge-${d.id}`), btn=document.getElementById(`done-btn-${d.id}`);
    const card=document.getElementById(`dc${d.id}`), note=S.notes[d.id]||'', done=S.completed[d.id]||false;
    if(area&&note) area.style.display='block';
    if(ta&&ta!==document.activeElement&&note) ta.value=note;
    if(badge) badge.style.display=done?'flex':'none';
    if(btn){ btn.textContent=done?'✓ Fatto!':'○ Segna come fatto'; btn.classList.toggle('btn-done-active',done); }
    if(card) card.classList.toggle('day-done',done);
  });
}
