"""Adapter per Overpass API (dati grezzi OpenStreetMap): gratuito, nessuna chiave.

Verificato con query reali in sessione contro https://overpass-api.de/api/interpreter (bounding
box intorno a Marina di Camerota). Due dettagli emersi dalla verifica, non deducibili dalla sola
documentazione:

- Il server richiede un header `User-Agent` esplicito: senza, risponde 406 Not Acceptable
  invece di un errore più parlante. Impostato esplicitamente qui, come richiesto anche dalla
  policy di utilizzo di Overpass/Nominatim.
- Molti elementi (soprattutto `historic`, es. rovine, relitti) non hanno un tag `name`: vengono
  scartati, perché un punto di interesse senza nome non è utile da suggerire in un itinerario.

Filtra i valori del tag `tourism` che rappresentano alloggi (hotel, ostelli, ecc.): quelli sono
compito di services/stay-search/, non di un itinerary builder che suggerisce cosa visitare.
"""

import logging
from typing import List

import httpx

from ..geocoding import geocode
from ..schemas import PoiSearchRequest, PointOfInterest
from .base import PoiSourceAdapter

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
USER_AGENT = "holiday-template-poi-search/0.1 (uso privato, non commerciale)"

# Valori di tourism=* che sono alloggi, non punti di interesse da visitare: esclusi perché
# competenza di services/stay-search/.
_ACCOMMODATION_TOURISM_VALUES = {
    "hotel", "hostel", "guest_house", "motel", "apartment", "chalet",
    "camp_site", "caravan_site", "alpine_hut", "wilderness_hut",
}


class OverpassAdapter(PoiSourceAdapter):
    name = "overpass"

    def search(self, request: PoiSearchRequest) -> List[PointOfInterest]:
        try:
            bbox = geocode(request.location)
        except Exception:
            logger.exception("overpass: geocodifica di '%s' fallita", request.location)
            return []

        if bbox is None:
            logger.info("overpass: nessun risultato di geocodifica per '%s'", request.location)
            return []

        query = (
            "[out:json][timeout:50];"
            f'(node["tourism"]({bbox.sw_lat},{bbox.sw_long},{bbox.ne_lat},{bbox.ne_long});'
            f'node["historic"]({bbox.sw_lat},{bbox.sw_long},{bbox.ne_lat},{bbox.ne_long}););'
            f"out {request.limit * 2};"  # margine: molti elementi verranno scartati (senza nome, alloggi)
        )

        try:
            response = httpx.post(
                OVERPASS_URL,
                data={"data": query},
                headers={"User-Agent": USER_AGENT},
                timeout=60,  # margine sopra il timeout lato server (50s nella query stessa)
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.HTTPError:
            logger.exception("overpass: richiesta fallita per '%s'", request.location)
            return []

        pois: List[PointOfInterest] = []
        for element in payload.get("elements", []):
            try:
                tags = element["tags"]
                name = tags.get("name")
                if not name:
                    continue

                category = tags.get("tourism") or tags.get("historic")
                if category in _ACCOMMODATION_TOURISM_VALUES:
                    continue

                pois.append(
                    PointOfInterest(
                        source=self.name,
                        name=name,
                        category=category or "altro",
                        lat=element["lat"],
                        lon=element["lon"],
                    )
                )
            except (KeyError, TypeError) as exc:
                logger.warning("overpass: elemento scartato, forma dati inattesa (%s)", exc)
                continue

            if len(pois) >= request.limit:
                break

        return pois
