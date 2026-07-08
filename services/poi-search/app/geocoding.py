"""Geocodifica di un nome di località in un bounding box, via Nominatim (OpenStreetMap).

Identico a services/stay-search/app/geocoding.py, duplicato per la stessa ragione già
documentata in .claude/context/STACK.md (servizi indipendenti, deployabili separatamente).
Gratuito, nessuna chiave. Verificato con richieste reali in sessione.
"""

from typing import NamedTuple, Optional

import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "holiday-template-poi-search/0.1 (uso privato, non commerciale)"


class BoundingBox(NamedTuple):
    ne_lat: float
    ne_long: float
    sw_lat: float
    sw_long: float


def geocode(location: str) -> Optional[BoundingBox]:
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
