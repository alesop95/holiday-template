"""Schema di richiesta e schema FlightOffer normalizzato, comune a tutte le fonti.

Vedi .claude/context/roadmap.md, Fase 1, per il piano completo (Amadeus e Kiwi Tequila
come fonti aggiuntive, non ancora implementate qui).
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
