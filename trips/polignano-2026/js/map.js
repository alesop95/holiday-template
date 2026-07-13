// ── Mappa Leaflet ─────────────────────────────────────────────────────────────
import { MAP_LOCATIONS } from '../trip.config.js';
import { S } from './state.js';

export function renderMap() {
  setTimeout(()=>{
    if(S.mapDone) return; S.mapDone=true;
    const map=L.map('map').setView([40.55,15.1],7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'© OpenStreetMap', maxZoom:18 }).addTo(map);
    MAP_LOCATIONS.forEach(loc=>{
      const ico=L.divIcon({ html:`<div style="width:26px;height:26px;border-radius:50%;background:${loc.c};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>`, className:'', iconSize:[26,26], iconAnchor:[13,13], popupAnchor:[0,-15] });
      L.marker([loc.lat,loc.lng],{icon:ico}).addTo(map).bindPopup(`<strong>${loc.nm}</strong><br><span style="color:#666;font-size:11px">${loc.sub}</span>`);
    });
    L.polyline(MAP_LOCATIONS.map(l=>[l.lat,l.lng]),{color:'#FF4758',weight:2,dashArray:'8,10',opacity:.55}).addTo(map);
    document.getElementById('map-legend').innerHTML = MAP_LOCATIONS.map(l=>`<div class="leg-item"><div class="leg-dot" style="background:${l.c}"></div><div><div class="leg-lbl">${l.nm}</div><div class="leg-day">${l.sub}</div></div></div>`).join('');
  },120);
}
