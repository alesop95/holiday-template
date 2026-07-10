"""Adapter per la libreria fast-flights (AWeirdDev/flights su GitHub), versione 3.0.2.

Reverse-engineering diretto di Google Flights (nessuna chiave richiesta). A differenza della
prima stesura di questo file, l'interfaccia e i nomi dei campi qui sotto sono stati verificati
eseguendo ricerche reali in questa sessione (`pip install`, chiamate live), non dedotti da
documentazione di terzi: la versione installata restituisce una struttura annidata
(ResultList di Flights, ognuno con una lista di SingleFlight per le singole tratte), diversa
da quella descritta nei risultati di ricerca usati per la primissima stesura.

Ostacolo reale incontrato e risolto: da rete europea, la richiesta diretta a
google.com/travel/flights atterra sull'interstitial di consenso GDPR (host
consent.google.com) invece che sui risultati, e la libreria non lo gestisce. Impostare il
cookie `SOCS` (verificato funzionante in una ricerca live in questa sessione) evita
l'interstitial. Nota di onesta': non è garantito che Google mantenga stabile questo
comportamento nel tempo; se l'adapter inizia a restituire zero risultati, il primo sospetto è
che l'interstitial sia cambiato e vada ri-verificato con lo script diagnostico descritto nel
README del servizio.

Fragilita' nota: su almeno una rotta testata (FCO-NRT, one-way) il parser della libreria ha
sollevato IndexError, mentre su una rotta comune (FCO-CDG) ha funzionato con risultati reali.
Per questo la ricerca è avvolta in un try/except che restituisce lista vuota invece di
propagare l'eccezione: un fallimento di parsing su una rotta non deve rompere l'endpoint.
"""

import logging
from datetime import datetime
from typing import List

from fast_flights import FlightQuery, Passengers, create_query, get_flights
from fast_flights.integrations.base import FetchIntegration
from fast_flights.querying import Query
from primp import Client

from ..schemas import FlightOffer, FlightSearchRequest
from .base import FlightSourceAdapter

logger = logging.getLogger(__name__)

GOOGLE_FLIGHTS_URL = "https://www.google.com/travel/flights"

# Cookie che evita l'interstitial di consenso GDPR di Google (host consent.google.com)
# per le richieste da rete europea. Verificato con una ricerca live il 2026-07-06.
_CONSENT_BYPASS_COOKIES = {
    "SOCS": "CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAml0IAEaBgiA6NKmBg",
}


class _ConsentBypassFetch(FetchIntegration):
    """Fetch integration che imposta il cookie di bypass del consenso GDPR prima della
    richiesta, cosa che il fetcher di default della libreria non fa."""

    def fetch_html(self, q: Query | str) -> str:
        client = Client(
            impersonate="chrome_145",
            impersonate_os="macos",
            referer=True,
            cookie_store=True,
            cookies=_CONSENT_BYPASS_COOKIES,
        )
        params = q.params() if isinstance(q, Query) else {"q": q}
        res = client.get(GOOGLE_FLIGHTS_URL, params=params)
        return res.text


def _format_datetime(dt) -> str:
    y, mo, d = dt.date
    h, mi = dt.time
    return datetime(y, mo, d, h, mi).strftime("%Y-%m-%d %H:%M")


def _format_duration(total_minutes: int) -> str:
    hours, minutes = divmod(total_minutes, 60)
    return f"{hours}h {minutes}m" if hours else f"{minutes}m"


class FastFlightsAdapter(FlightSourceAdapter):
    name = "fast_flights"

    def search(self, request: FlightSearchRequest) -> List[FlightOffer]:
        flights = [
            FlightQuery(
                date=request.departure_date,
                from_airport=request.origin,
                to_airport=request.destination,
            )
        ]
        if request.return_date:
            flights.append(
                FlightQuery(
                    date=request.return_date,
                    from_airport=request.destination,
                    to_airport=request.origin,
                )
            )

        query = create_query(
            flights=flights,
            seat=request.seat,
            trip="round-trip" if request.return_date else "one-way",
            passengers=Passengers(adults=request.adults),
            currency=request.currency,
            language="it",
        )

        try:
            result = get_flights(query, integration=_ConsentBypassFetch())
        except Exception:
            logger.exception("fast_flights: ricerca fallita per %s->%s", request.origin, request.destination)
            return []

        offers: List[FlightOffer] = []
        for itinerary in result:
            try:
                first_leg, last_leg = itinerary.flights[0], itinerary.flights[-1]
                offers.append(
                    FlightOffer(
                        source=self.name,
                        airline=", ".join(itinerary.airlines),
                        departure=_format_datetime(first_leg.departure),
                        arrival=_format_datetime(last_leg.arrival),
                        duration=_format_duration(sum(leg.duration for leg in itinerary.flights)),
                        stops=len(itinerary.flights) - 1,
                        price=f"{itinerary.price} {request.currency}",
                    )
                )
            except (IndexError, AttributeError, ValueError, TypeError) as exc:
                logger.warning("fast_flights: itinerario scartato, forma dati inattesa (%s)", exc)
                continue

        return offers
