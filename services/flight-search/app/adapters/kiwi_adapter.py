"""Adapter per Kiwi.com Tequila API (self-service, registrazione gratuita, no OAuth).

Sostituisce l'adapter Amadeus, abbandonato perche' il portale self-service di Amadeus for
Developers viene chiuso il 17 luglio 2026 (verificato con fonti indipendenti in sessione:
PhocusWire, Tragento — non solo la pagina del sito, che gia' segnalava la chiusura). Kiwi
Tequila resta la seconda fonte gia' indicata nella ricerca originale (roadmap.md).

Stato di verifica, piu' debole delle altre due fonti — da leggere prima di fidarsi:
- Base URL, header di autenticazione (`apikey`, minuscolo, nessun prefisso Bearer) e il fatto
  che senza chiave l'endpoint risponde 403 con un messaggio esplicito: verificato con una
  richiesta HTTP reale (non autenticata) fatta direttamente in questa sessione.
- I nomi dei campi della risposta (`price`, `route[].local_departure/local_arrival/airline/
  flight_no`, `duration.total` in secondi) sono ricostruiti incrociando piu' fonti di terzi
  (SDK community, guide, un thread di issue del repository ufficiale che segnala campi rimossi
  senza aggiornare la documentazione) perche' la documentazione ufficiale e' su una pagina
  interamente client-side che non e' stato possibile leggere in questa sessione. A differenza
  di fast_flights (verificato con una ricerca live reale) e dell'adapter Amadeus abbandonato
  (verificato contro un esempio ufficiale statico), qui non c'e' stata nessuna delle due:
  la prima ricerca live con una chiave reale e' la verifica vera, non questo commento.
- Limitazione nota, deliberata: gestisce solo ricerche one-way. `request.return_date` viene
  ignorato; un ritorno esplicito richiederebbe verificare i parametri Kiwi per il round-trip,
  non fatto in questo avvio per evitare di aggiungere altra API non verificata alla volta.
"""

import logging
from typing import List, Optional

import httpx

from ..schemas import FlightOffer, FlightSearchRequest
from .base import FlightSourceAdapter

logger = logging.getLogger(__name__)

SEARCH_URL = "https://tequila-api.kiwi.com/v2/search"


def _to_kiwi_date(iso_date: str) -> str:
    """'2026-09-15' -> '15/09/2026', il formato richiesto da Kiwi Tequila."""
    year, month, day = iso_date.split("-")
    return f"{day}/{month}/{year}"


def _format_duration(total_seconds: int) -> str:
    hours, minutes = divmod(total_seconds // 60, 60)
    return f"{hours}h {minutes}m" if hours else f"{minutes}m"


class KiwiAdapter(FlightSourceAdapter):
    name = "kiwi"

    def __init__(self, api_key: Optional[str]):
        self._api_key = api_key

    def search(self, request: FlightSearchRequest) -> List[FlightOffer]:
        if not self._api_key:
            logger.info("kiwi: KIWI_TEQUILA_API_KEY non configurata, adapter disattivato")
            return []

        kiwi_date = _to_kiwi_date(request.departure_date)
        params = {
            "fly_from": request.origin,
            "fly_to": request.destination,
            "date_from": kiwi_date,
            "date_to": kiwi_date,
            "adults": request.adults,
            "curr": "EUR",
            "limit": 10,
        }

        try:
            response = httpx.get(
                SEARCH_URL,
                params=params,
                headers={"apikey": self._api_key},
                timeout=15,
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "kiwi: risposta di errore %s: %s", exc.response.status_code, exc.response.text[:300]
            )
            return []
        except httpx.HTTPError:
            logger.exception("kiwi: richiesta fallita")
            return []

        offers: List[FlightOffer] = []
        for item in payload.get("data", []):
            try:
                route = item["route"]
                airlines = ", ".join(sorted({seg["airline"] for seg in route}))
                offers.append(
                    FlightOffer(
                        source=self.name,
                        airline=airlines,
                        departure=route[0]["local_departure"][:16].replace("T", " "),
                        arrival=route[-1]["local_arrival"][:16].replace("T", " "),
                        duration=_format_duration(item["duration"]["total"]),
                        stops=len(route) - 1,
                        price=f"{item['price']} EUR",
                    )
                )
            except (KeyError, IndexError) as exc:
                logger.warning("kiwi: offerta scartata, forma dati inattesa (%s)", exc)
                continue

        return offers
