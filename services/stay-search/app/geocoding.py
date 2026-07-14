"""Geocodifica di un nome di località in un bounding box, via Nominatim (OpenStreetMap).

Gratuito, nessuna chiave. Verificato con una richiesta reale in sessione: la risposta include
gia' un campo "boundingbox" utilizzabile direttamente, senza doverlo calcolare a mano attorno
a un punto centrale. Politica di utilizzo Nominatim (1 richiesta/secondo, User-Agent
identificativo obbligatorio) rispettata per costruzione: un solo lookup per ricerca, header
User-Agent impostato esplicitamente.

Retry scoperto necessario in sessione (2026-07-14): senza alcun retry, un 429/502/503 transitorio
da Nominatim (il limite di 1 richiesta/secondo si supera facilmente con più ricerche ravvicinate,
proprie o di altri utenti dello stesso servizio pubblico condiviso) faceva fallire la geocodifica,
che il chiamante (pyairbnb_adapter.py) cattura genericamente e trasforma in lista vuota — un
alloggio o POI realmente esistente spariva senza nessun segnale di errore. Backoff breve (1+2+4s,
non i 15-30-45s di trip-planner: qui e' un singolo lookup economico, non un cold start da 50s)
sufficiente a coprire un rate-limit momentaneo senza allungare troppo l'attesa dell'utente.
"""

import logging
import time
from typing import NamedTuple, Optional

import httpx

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "holiday-template-stay-search/0.1 (uso privato, non commerciale)"

_TRANSIENT_STATUS_CODES = {429, 502, 503, 504}
_RETRY_BACKOFFS_SECONDS = [1, 2, 4]


class BoundingBox(NamedTuple):
    ne_lat: float
    ne_long: float
    sw_lat: float
    sw_long: float


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

            # boundingbox di Nominatim: [min_lat, max_lat, min_lon, max_lon] (stringhe)
            south, north, west, east = (float(v) for v in results[0]["boundingbox"])
            return BoundingBox(ne_lat=north, ne_long=east, sw_lat=south, sw_long=west)
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
