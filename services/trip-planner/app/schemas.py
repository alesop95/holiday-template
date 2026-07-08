"""Schema di richiesta e risposta per il comparatore unico (Fase 3 della roadmap).

Non uno schema per fonte come negli altri tre servizi: qui non c'è normalizzazione da fare, solo
orchestrazione. Le risposte dei tre servizi a valle passano come `dict` grezzi (già normalizzati
da loro) invece di essere ridichiarate come Pydantic model duplicati: quei tre schemi vivono già
in services/flight-search, services/stay-search, services/poi-search, e questo servizio non ne
elabora i campi, li inoltra soltanto.
"""

from typing import List

from pydantic import BaseModel, Field


class TripPlanRequest(BaseModel):
    origin_airport: str = Field(..., min_length=3, max_length=3, description="Aeroporto di partenza, es. 'FCO'")
    destination_airport: str = Field(..., min_length=3, max_length=3, description="Aeroporto di arrivo, es. 'NRT'")
    destination_location: str = Field(..., description="Nome della città/area per alloggi e POI, es. 'Tokyo'")
    departure_date: str = Field(..., description="Data di partenza/check-in, formato YYYY-MM-DD")
    return_date: str = Field(..., description="Data di ritorno/check-out, formato YYYY-MM-DD")
    adults: int = Field(1, ge=1, le=9)
    price_max_stay: int = Field(500, ge=0, description="Prezzo massimo per l'intero soggiorno, in EUR")
    poi_limit: int = Field(20, ge=1, le=100)


class TripPlan(BaseModel):
    flights: List[dict] = []
    stays: List[dict] = []
    points_of_interest: List[dict] = []
    errors: List[str] = Field(default_factory=list, description="Un errore per servizio a valle non raggiungibile")
