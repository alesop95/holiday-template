"""Schema di richiesta e schema PointOfInterest normalizzato.

Vedi .claude/context/roadmap.md, Fase 4 (itinerary builder), per il piano completo.
"""

from pydantic import BaseModel, Field


class PoiSearchRequest(BaseModel):
    location: str = Field(..., description="Nome del luogo da geocodificare, es. 'Marina di Camerota'")
    limit: int = Field(30, ge=1, le=200)


class PointOfInterest(BaseModel):
    """Schema comune a cui ogni adapter normalizza i risultati della propria fonte."""

    source: str = Field(..., description="Adapter che ha prodotto questo POI, es. 'overpass'")
    name: str
    category: str = Field(..., description="Valore del tag OSM tourism/historic, es. 'museum', 'castle'")
    lat: float
    lon: float
