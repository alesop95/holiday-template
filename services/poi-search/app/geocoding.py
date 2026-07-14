"""Geocodifica di un nome di località in un bounding box, via Nominatim (OpenStreetMap).

Identico a services/stay-search/app/geocoding.py, duplicato per la stessa ragione già
documentata in .claude/context/STACK.md (servizi indipendenti, deployabili separatamente).
Gratuito, nessuna chiave.

Retry scoperto necessario in sessione (2026-07-14): senza alcun retry, un 429/502/503 transitorio
da Nominatim (il limite di 1 richiesta/secondo si supera facilmente con più ricerche ravvicinate,
proprie o di altri utenti dello stesso servizio pubblico condiviso) faceva fallire la geocodifica,
che il chiamante (overpass_adapter.py) cattura genericamente e trasforma in lista vuota — un
alloggio o POI realmente esistente spariva senza nessun segnale di errore. Backoff breve (1+2+4s,
non i 15-30-45s di trip-planner: qui e' un singolo lookup economico, non un cold start da 50s)
sufficiente a coprire un rate-limit momentaneo senza allungare troppo l'attesa dell'utente.

Bug piu' serio scoperto nella stessa sessione, con un caso reale: per "Polignano a mare" il primo
risultato di Nominatim non e' il centro abitato ma il confine amministrativo dell'intero
*comune*, un riquadro di circa 15x10km che si estende ben oltre la cittadina fino a comprendere
zone vicine a Conversano (un comune diverso). Usare quel riquadro alla lettera (comportamento
precedente) restituiva alloggi in un paese sbagliato, non solo "un po' fuori centro". Fix: si
prende il solo punto centrale (`lat`/`lon`) restituito da Nominatim, e si costruisce un bounding
box di raggio fisso attorno ad esso, non il riquadro amministrativo di Nominatim.
"""

import logging
import math
import time
from typing import NamedTuple, Optional

import httpx

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "holiday-template-poi-search/0.1 (uso privato, non commerciale)"

_TRANSIENT_STATUS_CODES = {429, 502, 503, 504}
_RETRY_BACKOFFS_SECONDS = [1, 2, 4]

# Raggio di ricerca attorno al punto centrale geocodificato: una scelta deliberata (non da
# Nominatim), pensata per "entro una breve distanza dal centro", ne' il centro storico stretto
# ne' l'intero comune amministrativo.
_SEARCH_RADIUS_KM = 5.0
_KM_PER_DEGREE_LAT = 111.0


class BoundingBox(NamedTuple):
    ne_lat: float
    ne_long: float
    sw_lat: float
    sw_long: float


def _bbox_around(lat: float, lon: float, radius_km: float) -> BoundingBox:
    lat_delta = radius_km / _KM_PER_DEGREE_LAT
    # 1 grado di longitudine si accorcia in km man mano che ci si allontana dall'equatore:
    # senza questa correzione, a Polignano (~41°N) il riquadro sarebbe piu' largo est-ovest
    # di quanto richiesto (~33% in eccesso).
    km_per_degree_lon = _KM_PER_DEGREE_LAT * math.cos(math.radians(lat))
    lon_delta = radius_km / km_per_degree_lon
    return BoundingBox(
        ne_lat=lat + lat_delta, ne_long=lon + lon_delta,
        sw_lat=lat - lat_delta, sw_long=lon - lon_delta,
    )


def geocode(location: str) -> Optional[BoundingBox]:
    last_exc: Optional[httpx.HTTPStatusError] = None
    for attempt in range(len(_RETRY_BACKOFFS_SECONDS) + 1):
        try:
            response = httpx.get(
                NOMINATIM_URL,
                params={"q": location, "format": "json", "limit": 1},
                headers={"User-Agent": USER_AGENT},
                timeout=10,
            )
            response.raise_for_status()
            results = response.json()
            if not results:
                return None

            return _bbox_around(float(results[0]["lat"]), float(results[0]["lon"]), _SEARCH_RADIUS_KM)
        except httpx.HTTPStatusError as exc:
            last_exc = exc
            if exc.response.status_code in _TRANSIENT_STATUS_CODES and attempt < len(_RETRY_BACKOFFS_SECONDS):
                logger.warning(
                    "geocode: risposta transitoria %s da Nominatim per '%s' (tentativo %d/%d)",
                    exc.response.status_code, location, attempt + 1, len(_RETRY_BACKOFFS_SECONDS),
                )
                time.sleep(_RETRY_BACKOFFS_SECONDS[attempt])
                continue
            raise
    raise last_exc
