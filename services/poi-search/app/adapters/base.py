"""Interfaccia comune degli adapter fonte-dati per i POI, stesso pattern degli altri due servizi
backend (services/flight-search, services/stay-search)."""

from abc import ABC, abstractmethod
from typing import List

from ..schemas import PoiSearchRequest, PointOfInterest


class PoiSourceAdapter(ABC):
    name: str

    @abstractmethod
    def search(self, request: PoiSearchRequest) -> List[PointOfInterest]:
        ...
