"""Servizio FastAPI di ricerca voli — Fase 1 di .claude/context/roadmap.md.

Avvio di sviluppo:
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8001
"""

import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

from .adapters.amadeus_adapter import AmadeusAdapter
from .adapters.fast_flights_adapter import FastFlightsAdapter
from .schemas import FlightOffer, FlightSearchRequest

load_dotenv()  # legge .env locale (gitignored); assente in produzione se non creato

app = FastAPI(title="flight-search", version="0.1.0")

ADAPTERS = [
    FastFlightsAdapter(),
    AmadeusAdapter(
        client_id=os.environ.get("AMADEUS_CLIENT_ID"),
        client_secret=os.environ.get("AMADEUS_CLIENT_SECRET"),
    ),
]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/flights/search", response_model=List[FlightOffer])
def search_flights(request: FlightSearchRequest) -> List[FlightOffer]:
    offers: List[FlightOffer] = []
    errors: List[str] = []
    for adapter in ADAPTERS:
        try:
            offers.extend(adapter.search(request))
        except Exception as exc:  # un adapter che fallisce non deve bloccare gli altri
            errors.append(f"{adapter.name}: {exc}")

    if not offers and errors:
        raise HTTPException(status_code=502, detail="; ".join(errors))
    return offers
