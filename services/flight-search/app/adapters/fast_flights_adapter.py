"""Adapter per la libreria fast-flights (AWeirdDev/flights su GitHub).

Reverse-engineering diretto di Google Flights (nessuna chiave richiesta). L'interfaccia
usata qui (create_query, FlightQuery, Passengers, get_flights) e' quella documentata nel
README del branch main del repository upstream; i nomi dei campi dell'oggetto Flight
restituito (name, departure, arrival, duration, stops, price, is_best) sono confermati da
piu' fonti indipendenti ma non sono stati eseguiti in questa sessione contro un'installazione
reale. Prima di affidarsi a questo adapter in produzione, eseguire una ricerca di prova con
`pip install -r requirements.txt` e verificare l'output effettivo.
"""

from typing import List

from fast_flights import FlightQuery, Passengers, create_query, get_flights

from ..schemas import FlightOffer, FlightSearchRequest
from .base import FlightSourceAdapter


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
        )
        result = get_flights(query)

        return [
            FlightOffer(
                source=self.name,
                airline=f.name,
                departure=f.departure,
                arrival=f.arrival,
                duration=f.duration,
                stops=f.stops,
                price=f.price,
                is_best=getattr(f, "is_best", False),
            )
            for f in result.flights
        ]
