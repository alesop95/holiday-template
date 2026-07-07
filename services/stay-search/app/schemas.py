"""Schema di richiesta e schema StayOffer normalizzato, comune a tutte le fonti alloggi.

Vedi .claude/context/roadmap.md, Fase 2, per il piano completo.
"""

from pydantic import BaseModel, Field


class StaySearchRequest(BaseModel):
    location: str = Field(..., description="Nome del luogo da geocodificare, es. 'Marina di Camerota'")
    check_in: str = Field(..., description="Data di check-in, formato YYYY-MM-DD")
    check_out: str = Field(..., description="Data di check-out, formato YYYY-MM-DD")
    adults: int = Field(2, ge=1, le=16)
    price_max: int = Field(500, ge=0, description="Prezzo massimo per l'intero soggiorno, in EUR")


class StayOffer(BaseModel):
    """Schema comune a cui ogni adapter normalizza i risultati della propria fonte."""

    source: str = Field(..., description="Adapter che ha prodotto questa offerta, es. 'airbnb'")
    name: str
    listing_type: str = Field("", description="Es. 'Appartamento', 'Aparthotel', vuoto se ignoto")
    total_price: str = Field(..., description="Prezzo totale del soggiorno, es. '357 EUR'")
    rating: float = Field(0, description="0 se senza recensioni")
    review_count: int = 0
    url: str = ""
