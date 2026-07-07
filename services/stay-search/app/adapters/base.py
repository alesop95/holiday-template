"""Interfaccia comune degli adapter fonte-dati per gli alloggi, stesso pattern di
services/flight-search/app/adapters/base.py."""

from abc import ABC, abstractmethod
from typing import List

from ..schemas import StayOffer, StaySearchRequest


class StaySourceAdapter(ABC):
    name: str

    @abstractmethod
    def search(self, request: StaySearchRequest) -> List[StayOffer]:
        ...
