"""Adapter per Amadeus for Developers - Flight Offers Search API (self-service, free tier).

A differenza di fast_flights_adapter.py, qui l'autenticazione e la forma della risposta sono
verificate contro la documentazione ufficiale e un esempio di risposta reale del repository
amadeus4dev/amadeus-code-examples (flight_offers_search/v2/get/response.json), non contro una
sintesi di terzi. Non è stato invece possibile eseguire una ricerca live in questa sessione:
richiede credenziali reali (AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET) che l'utente non ha ancora
generato su https://developers.amadeus.com/my-apps. Vedi services/flight-search/README.md per
come completare la verifica una volta ottenute.

Forma della risposta (ambiente test.api.amadeus.com, v2/shopping/flight-offers):
  data[] -> ogni elemento ha "itineraries" (uno per direzione: andata, eventuale ritorno) e
  "price". Ogni itinerary ha "duration" (ISO 8601, es. "PT9H20M") e "segments[]" (le singole
  tratte, con "departure"/"arrival" -> {iataCode, at}, "carrierCode", "duration").
  Semplificazione consapevole: FlightOffer è piatto (un solo departure/arrival/duration), quindi
  per un volo andata e ritorno questo adapter espone solo l'itinerario di andata. Un ritorno
  esplicito nello schema è un miglioramento futuro, non incluso in questo avvio di Fase 1.
"""

import logging
import re
import time
from typing import List, Optional

import httpx

from ..schemas import FlightOffer, FlightSearchRequest
from .base import FlightSourceAdapter

logger = logging.getLogger(__name__)

TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
SEARCH_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers"

_ISO_DURATION_RE = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?")


def _parse_iso_duration(value: str) -> str:
    """'PT9H20M' -> '9h 20m'; verificato contro il formato reale della risposta Amadeus."""
    match = _ISO_DURATION_RE.match(value)
    if not match:
        return value
    hours, minutes = match.group(1) or "0", match.group(2) or "0"
    return f"{hours}h {minutes}m" if hours != "0" else f"{minutes}m"


def _format_datetime(value: str) -> str:
    """'2026-09-15T10:00:00' -> '2026-09-15 10:00', stesso formato di fast_flights_adapter."""
    return value.replace("T", " ")[:16]


class AmadeusAdapter(FlightSourceAdapter):
    name = "amadeus"

    def __init__(self, client_id: Optional[str], client_secret: Optional[str]):
        self._client_id = client_id
        self._client_secret = client_secret
        self._token: Optional[str] = None
        self._token_expiry = 0.0

    def _get_token(self) -> str:
        if self._token and time.monotonic() < self._token_expiry:
            return self._token
        response = httpx.post(
            TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": self._client_id,
                "client_secret": self._client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
        self._token = payload["access_token"]
        self._token_expiry = time.monotonic() + payload["expires_in"] - 60
        return self._token

    def search(self, request: FlightSearchRequest) -> List[FlightOffer]:
        if not self._client_id or not self._client_secret:
            logger.info("amadeus: AMADEUS_CLIENT_ID/SECRET non configurate, adapter disattivato")
            return []

        try:
            token = self._get_token()
            params = {
                "originLocationCode": request.origin,
                "destinationLocationCode": request.destination,
                "departureDate": request.departure_date,
                "adults": request.adults,
                "currencyCode": "EUR",
                "max": 10,
            }
            if request.return_date:
                params["returnDate"] = request.return_date
            response = httpx.get(
                SEARCH_URL,
                params=params,
                headers={"Authorization": f"Bearer {token}"},
                timeout=15,
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "amadeus: risposta di errore %s: %s",
                exc.response.status_code,
                exc.response.text[:300],
            )
            return []
        except httpx.HTTPError:
            logger.exception("amadeus: richiesta fallita")
            return []

        carriers = payload.get("dictionaries", {}).get("carriers", {})
        offers: List[FlightOffer] = []
        for item in payload.get("data", []):
            try:
                outbound = item["itineraries"][0]
                segments = outbound["segments"]
                carrier_codes = {seg["carrierCode"] for seg in segments}
                airline = ", ".join(carriers.get(code, code) for code in sorted(carrier_codes))
                offers.append(
                    FlightOffer(
                        source=self.name,
                        airline=airline,
                        departure=_format_datetime(segments[0]["departure"]["at"]),
                        arrival=_format_datetime(segments[-1]["arrival"]["at"]),
                        duration=_parse_iso_duration(outbound["duration"]),
                        stops=len(segments) - 1,
                        price=f"{item['price']['grandTotal']} {item['price']['currency']}",
                    )
                )
            except (KeyError, IndexError) as exc:
                logger.warning("amadeus: offerta scartata, forma dati inattesa (%s)", exc)
                continue

        return offers
