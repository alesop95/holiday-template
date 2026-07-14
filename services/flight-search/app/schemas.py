"""Schema di richiesta e schema FlightOffer normalizzato, comune a tutte le fonti.

fast_flights (Google Flights) resta l'unica fonte: sia Amadeus sia Kiwi Tequila, le due
fonti aggiuntive originariamente previste (roadmap.md, Fase 1), si sono chiuse al
self-service (Amadeus dismesso il 17/07/2026, Kiwi Tequila richiede ora approvazione
manuale via affiliates@kiwi.com) — accantonate per lo stesso motivo di Trenitalia.
"""

from typing import Optional

from pydantic import BaseModel, Field


class FlightSearchRequest(BaseModel):
    origin: str = Field(..., min_length=3, max_length=3, description="Codice IATA aeroporto di partenza, es. 'FCO'")
    destination: str = Field(..., min_length=3, max_length=3, description="Codice IATA aeroporto di arrivo, es. 'NRT'")
    departure_date: str = Field(..., description="Data di partenza, formato YYYY-MM-DD")
    return_date: Optional[str] = Field(None, description="Data di ritorno, formato YYYY-MM-DD; assente per un volo one-way")
    adults: int = Field(1, ge=1, le=9)
    seat: str = Field("economy", description="economy | premium-economy | business | first")
    currency: str = Field("EUR", min_length=3, max_length=3, description="Codice valuta ISO 4217 per la ricerca, es. 'EUR', 'USD', 'GBP'")


class FlightOffer(BaseModel):
    """Schema comune a cui ogni adapter normalizza i risultati della propria fonte."""

    source: str = Field(..., description="Adapter che ha prodotto questa offerta, es. 'fast_flights'")
    airline: str
    departure: str
    arrival: str
    duration: str
    stops: int
    price: str
    is_best: bool = False
