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

Tag `fee`/`charge` (ingresso a pagamento): copertura verificata dal vivo con query reali, non
assunta. Su un'area rurale (Marina di Camerota, 30 elementi) zero avevano uno dei due tag; su
un'area museale densa (Parigi, 100 elementi tourism=museum/attraction) 30 avevano `fee` (quasi
sempre "yes"/"no", a volte una nota libera con importi non strutturati) e solo 5 avevano `charge`
con un prezzo vero e proprio. Per questo il frontend non somma questi valori in un totale
automatico: la copertura e' troppo incompleta per un numero che sembri completo senza esserlo.

Ristoranti/bar/caffè aggiunti in sessione (2026-07-14) via tag `amenity`, non solo
`tourism`/`historic`: verificato dal vivo con una query reale intorno a Polignano a Mare, incluso
un caso reale di doppio tag (Grotta Palazzese ha sia `amenity=restaurant` sia
`tourism=viewpoint`). In quel caso `amenity` vince nella categoria assegnata: e' il tag più
specifico per l'intento di questa ricerca ("trova un posto dove mangiare"), il che sposta un nodo
già presente in TRIP_DATA da "viewpoint" a "restaurant" — coerente con l'uso reale che se ne fa.

Retry aggiunto nella stessa sessione: un 504 Gateway Timeout riprodotto dal vivo contro il
server pubblico condiviso overpass-api.de, sparito al tentativo immediatamente successivo —
stesso principio gia' applicato al geocoding (geocoding.py), backoff piu' lungo perche' una
query Overpass e' piu' pesante di un lookup Nominatim.
"""

import logging
import time
from typing import List

import httpx

from ..geocoding import geocode
from ..schemas import PoiSearchRequest, PointOfInterest
from .base import PoiSourceAdapter

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
USER_AGENT = "holiday-template-poi-search/0.1 (uso privato, non commerciale)"

_TRANSIENT_STATUS_CODES = {429, 502, 503, 504}
_RETRY_BACKOFFS_SECONDS = [2, 4, 8]

# Valori di tourism=* che sono alloggi, non punti di interesse da visitare: esclusi perché
# competenza di services/stay-search/.
_ACCOMMODATION_TOURISM_VALUES = {
    "hotel", "hostel", "guest_house", "motel", "apartment", "chalet",
    "camp_site", "caravan_site", "alpine_hut", "wilderness_hut",
}

# amenity=* per cibo/bevande: whitelist deliberata, non tutti gli amenity (che includono
# panchine, parcheggi, cestini...). "ecc." dell'utente si ferma qui, non a qualunque amenity.
_FOOD_AMENITY_VALUES = {"restaurant", "cafe", "bar", "pub", "fast_food", "ice_cream", "biergarten"}


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

        amenity_regex = "|".join(sorted(_FOOD_AMENITY_VALUES))
        query = (
            "[out:json][timeout:50];"
            f'(node["tourism"]({bbox.sw_lat},{bbox.sw_long},{bbox.ne_lat},{bbox.ne_long});'
            f'node["historic"]({bbox.sw_lat},{bbox.sw_long},{bbox.ne_lat},{bbox.ne_long});'
            f'node["amenity"~"^({amenity_regex})$"]({bbox.sw_lat},{bbox.sw_long},{bbox.ne_lat},{bbox.ne_long}););'
            f"out {request.limit * 2};"  # margine: molti elementi verranno scartati (senza nome, alloggi)
        )

        payload = None
        for attempt in range(len(_RETRY_BACKOFFS_SECONDS) + 1):
            try:
                response = httpx.post(
                    OVERPASS_URL,
                    data={"data": query},
                    headers={"User-Agent": USER_AGENT},
                    timeout=60,  # margine sopra il timeout lato server (50s nella query stessa)
                )
                response.raise_for_status()
                payload = response.json()
                break
            except httpx.HTTPStatusError as exc:
                # Riprodotto dal vivo in sessione (2026-07-14): un 504 sul server pubblico
                # overpass-api.de, sparito al tentativo successivo — congestione transitoria
                # dell'istanza condivisa, stesso principio gia' applicato a Nominatim in
                # geocoding.py. Backoff piu' lungo che li': una query Overpass e' piu' pesante
                # di un lookup di geocodifica.
                if exc.response.status_code in _TRANSIENT_STATUS_CODES and attempt < len(_RETRY_BACKOFFS_SECONDS):
                    logger.warning(
                        "overpass: risposta transitoria %s per '%s' (tentativo %d/%d)",
                        exc.response.status_code, request.location, attempt + 1, len(_RETRY_BACKOFFS_SECONDS),
                    )
                    time.sleep(_RETRY_BACKOFFS_SECONDS[attempt])
                    continue
                logger.exception("overpass: richiesta fallita per '%s'", request.location)
                return []
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

                # amenity vince su tourism/historic quando entrambi presenti (es. Grotta
                # Palazzese: amenity=restaurant e tourism=viewpoint insieme, vedi docstring).
                category = tags.get("amenity") or tags.get("tourism") or tags.get("historic")
                if tags.get("tourism") in _ACCOMMODATION_TOURISM_VALUES:
                    continue

                pois.append(
                    PointOfInterest(
                        source=self.name,
                        name=name,
                        category=category or "altro",
                        lat=element["lat"],
                        lon=element["lon"],
                        fee=tags.get("fee"),
                        price_hint=tags.get("charge"),
                    )
                )
            except (KeyError, TypeError) as exc:
                logger.warning("overpass: elemento scartato, forma dati inattesa (%s)", exc)
                continue

            if len(pois) >= request.limit:
                break

        return pois
