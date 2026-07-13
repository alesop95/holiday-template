// ── Dashboard costi reali e divisione tra persone ("Info & Costi") ───────────────
// Fonte dei costi "automatici": tutto cio' che e' salvato in S.planning (voli/alloggi
// scelti nella scheda Pianifica). I POI non hanno un prezzo (schema PointOfInterest,
// vedi services/poi-search/), quindi non entrano nel totale. Le spese manuali (con un
// pagatore opzionale) vivono solo in trips/{TRIP_ID}/state/costs, non in S.planning.
import { TRIP_ID, CURRENCY_SYMBOL, CURRENCY_CODE } from '../trip.config.js';
import { S, escHtml, parsePrice } from './state.js';
import { writeCosts } from './firestore.js';
import { resolveAccommodationCost, activeDiscount } from './itinerario.js';

// Algoritmo greedy di settlement: da N saldi (positivo = deve ricevere, negativo = deve dare)
// produce il minor numero ragionevole di trasferimenti "X deve dare a Y" invece di una riga di
// saldo per persona — per due persone si riduce sempre a una sola riga, eliminando il caso
// "entrambi in debito" che non ha senso quando i soldi restano tra loro due.
function computeSettlement(balances) {
  const creditors = balances.filter(b => b.balance > 0.005).map(b => ({ ...b })).sort((a,b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < -0.005).map(b => ({ name: b.name, balance: -b.balance })).sort((a,b) => b.balance - a.balance);
  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].balance, creditors[j].balance);
    transactions.push({ from: debtors[i].name, to: creditors[j].name, amount });
    debtors[i].balance -= amount; creditors[j].balance -= amount;
    if (debtors[i].balance < 0.005) i++;
    if (creditors[j].balance < 0.005) j++;
  }
  return transactions;
}

function computePlanningCosts() {
  let flights = 0, flightsCount = 0;
  Object.values(S.planning).forEach(day => (day.flights||[]).forEach(f => { flights += parsePrice(f.price); flightsCount++; }));
  // L'alloggio usa la stessa gerarchia di risoluzione di "Info & Costi" (resolveAccommodationCost),
  // non una somma indipendente di S.planning.stays: altrimenti un alloggio confermato (es. via
  // Booking.com, fuori da Pianifica) e uno eventualmente salvato da Pianifica si sommerebbero,
  // contando due volte lo stesso soggiorno invece di uno o l'altro.
  const resolvedAcc = resolveAccommodationCost();
  const stays = resolvedAcc ? resolvedAcc.amount : 0;
  const staysCount = resolvedAcc ? resolvedAcc.count : 0;
  const staysPaidBy = resolvedAcc && resolvedAcc.status === 'confirmed' ? resolvedAcc.paidBy : '';
  return { flights, flightsCount, stays, staysCount, staysStatus: resolvedAcc?.status || null, staysPaidBy, total: flights + stays };
}

// "Dettaglio" (stile Splitwise): mostra i passaggi aritmetici del calcolo, non solo il
// risultato finale — richiesto esplicitamente per poter verificare a occhio ogni conto invece
// di fidarsi del solo totale, come e' gia' successo in sessione con un conto che sembrava
// sbagliato e invece era corretto (confronto tra basi diverse).
function renderCostsDetail(auto, c, manualTotal, disc, grandTotal, n, perPerson, paidByPerson) {
  const lordoRows = [
    `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">Voli (da Pianifica)</div></div><div class="cost-amt">${CURRENCY_SYMBOL} ${auto.flights.toFixed(2)}</div></div>`,
    `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">Alloggio${auto.staysPaidBy?' (pagato da '+escHtml(auto.staysPaidBy)+')':''}</div></div><div class="cost-amt">${CURRENCY_SYMBOL} ${auto.stays.toFixed(2)}</div></div>`,
    ...c.expenses.map(e => `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">${escHtml(e.label)}${e.paidBy?' ('+escHtml(e.paidBy)+')':''}</div></div><div class="cost-amt">${CURRENCY_SYMBOL} ${(e.amount||0).toFixed(2)}</div></div>`),
  ].join('');
  const lordo = auto.total + manualTotal;
  return `<details class="plan-group" style="margin-top:10px">
    <summary class="plan-group-ttl" style="color:#fff">Dettaglio calcolo</summary>
    <div class="cost-tbl" style="background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;">
      ${lordoRows}
      <div class="cost-row"><div class="cost-inf"><div class="cost-lbl"><b>= Totale lordo</b></div></div><div class="cost-amt"><b>${CURRENCY_SYMBOL} ${lordo.toFixed(2)}</b></div></div>
      ${disc ? `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">Sconto</div></div><div class="cost-amt">-${CURRENCY_SYMBOL} ${disc.amount.toFixed(2)}</div></div>` : ''}
      <div class="cost-row"><div class="cost-inf"><div class="cost-lbl"><b>= Totale complessivo</b></div></div><div class="cost-amt"><b>${CURRENCY_SYMBOL} ${grandTotal.toFixed(2)}</b></div></div>
      ${n>0 ? `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">÷ ${n} persone = quota a testa</div></div><div class="cost-amt">${CURRENCY_SYMBOL} ${perPerson.toFixed(2)}</div></div>` : ''}
      ${n>0 ? c.participants.map(p => {
        const balance = paidByPerson[p] - perPerson;
        return `<div class="cost-row"><div class="cost-inf"><div class="cost-lbl">${escHtml(p)}: pagato ${CURRENCY_SYMBOL}${paidByPerson[p].toFixed(2)} − quota ${CURRENCY_SYMBOL}${perPerson.toFixed(2)}</div></div><div class="cost-amt">${balance>=0?'+':''}${CURRENCY_SYMBOL}${balance.toFixed(2)}</div></div>`;
      }).join('') : ''}
    </div>
  </details>`;
}

// Export CSV: stesso principio di "Esporta / Stampa itinerario" (nessuna libreria nuova, un
// meccanismo nativo del browser) ma per le spese — un Blob scaricato come file, apribile in
// Excel/Fogli Google per una riconciliazione fuori dall'app.
window.exportCostsCSV = () => {
  const c = S.costs || { participants: [], expenses: [] };
  const auto = computePlanningCosts();
  const disc = activeDiscount();
  const rows = [['Tipo','Descrizione','Importo','Pagato da']];
  rows.push(['Automatico','Voli salvati da Pianifica', auto.flights.toFixed(2), '']);
  rows.push(['Automatico','Alloggio', auto.stays.toFixed(2), auto.staysPaidBy||'']);
  c.expenses.forEach(e => rows.push(['Manuale', e.label, (e.amount||0).toFixed(2), e.paidBy||'']));
  if (disc) rows.push(['Sconto', disc.desc, '-'+disc.amount.toFixed(2), '']);
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${TRIP_ID}-spese.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function renderCostsDashboard() {
  const el = document.getElementById('costs-dashboard'); if (!el) return;
  const c = S.costs || { participants: [], expenses: [] };
  const auto = computePlanningCosts();
  const manualTotal = c.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  // Sconto: importo di coppia, sottratto per intero qui (a differenza di Info & Costi, che lo
  // divide /2 perche' quel totale e' gia' per persona).
  const disc = activeDiscount();
  const grandTotal = Math.max(0, auto.total + manualTotal - (disc ? disc.amount : 0));
  const n = c.participants.length;
  const perPerson = n > 0 ? grandTotal / n : 0;
  // paidByPerson deve includere OGNI spesa reale attribuita a qualcuno, non solo quelle manuali:
  // prima l'alloggio confermato (spesso la voce piu' grande) non veniva mai accreditato a chi
  // l'ha davvero pagato, quindi il saldo di nessuno tornava mai a zero tra due persone — un
  // conto che non può matematicamente risultare "entrambi in debito" per una spesa di coppia.
  const paidByPerson = {};
  const itemsByPerson = {};
  c.participants.forEach(p => { paidByPerson[p] = 0; itemsByPerson[p] = []; });
  c.expenses.forEach(e => {
    if (e.paidBy && paidByPerson.hasOwnProperty(e.paidBy)) {
      paidByPerson[e.paidBy] += (e.amount || 0);
      itemsByPerson[e.paidBy].push({ label: e.label, amount: e.amount || 0 });
    }
  });
  if (auto.staysPaidBy && paidByPerson.hasOwnProperty(auto.staysPaidBy)) {
    paidByPerson[auto.staysPaidBy] += auto.stays;
    itemsByPerson[auto.staysPaidBy].push({ label: 'Alloggio confermato', amount: auto.stays });
  }

  el.innerHTML = `
    <div class="costs-card">
      <div class="costs-card-ttl">Partecipanti</div>
      <div class="costs-participants">
        ${c.participants.map((p,i) => `<span class="costs-chip">${escHtml(p)}<button onclick="removeCostParticipant(${i})">&times;</button></span>`).join('') || '<span class="costs-empty">Nessun partecipante ancora: aggiungine almeno uno per calcolare la quota a testa.</span>'}
      </div>
      <div class="costs-add-row"><input id="cp-new" placeholder="Nome partecipante" onkeydown="if(event.key==='Enter'){event.preventDefault();addCostParticipant();}"><button class="costs-add-btn" onclick="addCostParticipant()">+ Aggiungi</button></div>
    </div>

    <div class="costs-card">
      <div class="costs-card-ttl">Costi automatici</div>
      <div class="costs-auto-row"><span>Voli salvati da Pianifica (${auto.flightsCount})</span><strong>${CURRENCY_SYMBOL} ${auto.flights.toFixed(2)}</strong></div>
      <div class="costs-auto-row"><span>Alloggio${auto.staysStatus==='confirmed'?' (prenotazione confermata)':auto.staysStatus==='pianifica'?` (${auto.staysCount} salvato/i da Pianifica, non confermato)`:' (nessuno confermato o salvato)'}</span><strong>${CURRENCY_SYMBOL} ${auto.stays.toFixed(2)}</strong></div>
      <p class="costs-hint">Voli: si aggiornano salvando un risultato in Pianifica. Alloggio: usa la prenotazione confermata in "Info & Costi" se presente, altrimenti quanto salvato da Pianifica.</p>
    </div>

    <div class="costs-card">
      <div class="costs-card-ttl">Spese aggiunte a mano</div>
      ${c.expenses.map(e => `<div class="costs-expense-row"><div><div class="costs-expense-lbl">${escHtml(e.label)}</div><div class="costs-expense-sub">${e.paidBy?'Pagato da '+escHtml(e.paidBy):'Nessun pagatore assegnato'}</div></div><div class="costs-expense-amt">${CURRENCY_SYMBOL} ${(e.amount||0).toFixed(2)}</div><button class="costs-rm-btn" onclick="removeCostExpense('${e.id}')">&times;</button></div>`).join('') || '<p class="costs-hint">Nessuna spesa manuale ancora (es. traghetto, benzina, biglietti pagati da uno solo).</p>'}
      <div class="costs-expense-form">
        <input id="ce-label" placeholder="Descrizione (es. Traghetto, benzina)">
        <input id="ce-amount" type="number" min="0" step="0.01" placeholder="Importo ${CURRENCY_CODE}">
        <select id="ce-paidby"><option value="">Nessun pagatore</option>${c.participants.map(p=>`<option value="${escHtml(p)}">${escHtml(p)}</option>`).join('')}</select>
        <button class="costs-add-btn" onclick="addCostExpense()">+ Aggiungi spesa</button>
      </div>
    </div>

    ${n>0 ? `<div class="costs-card">
      <div class="costs-card-ttl">Le spese di ciascuno</div>
      ${c.participants.map(p => `<div class="costs-person-block">
        <div class="costs-person-name">${escHtml(p)} — totale pagato ${CURRENCY_SYMBOL} ${paidByPerson[p].toFixed(2)}</div>
        ${itemsByPerson[p].length ? itemsByPerson[p].map(it => `<div class="costs-auto-row"><span>${escHtml(it.label)}</span><span>${CURRENCY_SYMBOL} ${it.amount.toFixed(2)}</span></div>`).join('') : '<p class="costs-hint">Nessuna spesa attribuita ancora.</p>'}
      </div>`).join('')}
    </div>` : ''}

    <div class="costs-summary">
      ${disc ? `<div class="costs-summary-row"><span>Sconto applicato (entro il ${disc.validUntil.split('-').reverse().join('/')})</span><strong style="color:var(--teal)">-${CURRENCY_SYMBOL} ${disc.amount.toFixed(2)}</strong></div>` : ''}
      <div class="costs-summary-row"><span>Totale complessivo</span><strong>${CURRENCY_SYMBOL} ${grandTotal.toFixed(2)}</strong></div>
      ${n>0 ? `<div class="costs-summary-row"><span>Quota a testa (${n} persone)</span><strong>${CURRENCY_SYMBOL} ${perPerson.toFixed(2)}</strong></div>` : ''}
      ${renderCostsDetail(auto, c, manualTotal, disc, grandTotal, n, perPerson, paidByPerson)}
      ${(() => {
        if (n===0) return '';
        // Un solo saldo netto per coppia (o il minor numero di trasferimenti per N persone),
        // non un saldo indipendente a testa: altrimenti, con una spesa grande attribuita a una
        // sola persona, entrambi potevano risultare "in debito" senza che i conti tornassero.
        const balances = c.participants.map(p => ({ name: p, balance: paidByPerson[p] - perPerson }));
        const settlement = computeSettlement(balances);
        if (!settlement.length) return '<div class="costs-balance-row"><span>Conti già in pari</span></div>';
        return settlement.map(t => `<div class="costs-balance-row"><span>${escHtml(t.from)} deve dare a ${escHtml(t.to)}</span><span class="costs-balance neg">${CURRENCY_SYMBOL} ${t.amount.toFixed(2)}</span></div>`).join('');
      })()}
    </div>`;
}

window.addCostParticipant = () => {
  const input = document.getElementById('cp-new'); const name = input.value.trim();
  if (!name) return;
  const c = S.costs || { participants: [], expenses: [] };
  if (c.participants.includes(name)) { input.value = ''; return; }
  const updated = { ...c, participants: [...c.participants, name] };
  writeCosts(updated).then(() => { S.costs = updated; renderCostsDashboard(); }).catch(e => alert('Errore: ' + e.message));
};

window.removeCostParticipant = (i) => {
  const c = S.costs; const name = c.participants[i];
  const updated = {
    participants: c.participants.filter((_,idx) => idx !== i),
    expenses: c.expenses.map(e => e.paidBy === name ? { ...e, paidBy: '' } : e),  // spesa resta, perde solo il pagatore rimosso
  };
  writeCosts(updated).then(() => { S.costs = updated; renderCostsDashboard(); }).catch(e => alert('Errore: ' + e.message));
};

window.addCostExpense = () => {
  const label = document.getElementById('ce-label').value.trim();
  const amount = parseFloat(document.getElementById('ce-amount').value);
  const paidBy = document.getElementById('ce-paidby').value;
  if (!label || !amount || amount <= 0) { alert('Inserisci una descrizione e un importo valido (maggiore di zero).'); return; }
  const c = S.costs || { participants: [], expenses: [] };
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const updated = { ...c, expenses: [...c.expenses, { id, label, amount, paidBy }] };
  writeCosts(updated).then(() => { S.costs = updated; renderCostsDashboard(); }).catch(e => alert('Errore: ' + e.message));
};

window.removeCostExpense = (id) => {
  const c = S.costs;
  const updated = { ...c, expenses: c.expenses.filter(e => e.id !== id) };
  writeCosts(updated).then(() => { S.costs = updated; renderCostsDashboard(); }).catch(e => alert('Errore: ' + e.message));
};
