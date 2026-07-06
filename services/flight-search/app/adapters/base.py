"""Interfaccia comune degli adapter fonte-dati.

Il pattern (una classe per fonte, tutte normalizzate verso FlightOffer) e' quello
raccomandato in .claude/context/roadmap.md proprio per poter sostituire una fonte
che si rompe senza toccare le altre ne' il livello comparatore.
"""

from abc import ABC, abstractmethod
from typing import List

from ..schemas import FlightOffer, FlightSearchRequest


class FlightSourceAdapter(ABC):
    name: str

    @abstractmethod
    def search(self, request: FlightSearchRequest) -> List[FlightOffer]:
        ...
