"""Servizio FastAPI di orchestrazione — Fase 3 di .claude/context/roadmap.md ("layer comparatore").

A differenza degli altri tre servizi backend (flight-search, stay-search, poi-search), questo
non ha adapter propri: chiama i tre servizi via HTTP e combina le risposte in un'unica vista di
un possibile viaggio. Presuppone che i tre servizi girino già (default: localhost:8001/8002/8003,
configurabile via .env, vedi .env.example). Se uno dei tre non risponde, il piano di viaggio
torna comunque con gli altri due e un errore per quello mancante — non tutto o niente.

Avvio di sviluppo:
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8004
"""

import asyncio
import os
from typing import Optional, Tuple

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import TripPlan, TripPlanRequest

load_dotenv()

app = FastAPI(title="trip-planner", version="0.1.0")

# Nessuna autenticazione né dato sensibile in nessuno dei quattro servizi (vedi
# design-and-security.md): origine aperta a tutti per permettere alla shell frontend
# (aperta da file:// o da un server statico locale, origine imprevedibile) di chiamare
# questo servizio durante lo sviluppo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FLIGHT_SEARCH_URL = os.environ.get("FLIGHT_SEARCH_URL", "http://localhost:8001")
STAY_SEARCH_URL = os.environ.get("STAY_SEARCH_URL", "http://localhost:8002")
POI_SEARCH_URL = os.environ.get("POI_SEARCH_URL", "http://localhost:8003")


async def _fetch(client: httpx.AsyncClient, name: str, url: str, payload: dict) -> Tuple[str, list, Optional[str]]:
    try:
        # 90s, non 30s: su un hosting free-tier (Render, ADR-008) un servizio a valle in pausa
        # per inattivita' impiega ~50s a ripartire, prima ancora di eseguire la ricerca vera e
        # propria (scraping, a sua volta non istantaneo). Verificato live: 32-56s per una singola
        # ricerca reale su Render, contro pochi secondi in locale.
        response = await client.post(url, json=payload, timeout=90)
        response.raise_for_status()
        return name, response.json(), None
    except httpx.HTTPError as exc:
        return name, [], f"{name}: {exc}"


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/trip-plan", response_model=TripPlan)
async def build_trip_plan(request: TripPlanRequest) -> TripPlan:
    flight_payload = {
        "origin": request.origin_airport,
        "destination": request.destination_airport,
        "departure_date": request.departure_date,
        "return_date": request.return_date,
        "adults": request.adults,
    }
    stay_payload = {
        "location": request.destination_location,
        "check_in": request.departure_date,
        "check_out": request.return_date,
        "adults": request.adults,
        "price_max": request.price_max_stay,
    }
    poi_payload = {"location": request.destination_location, "limit": request.poi_limit}

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            _fetch(client, "flights", f"{FLIGHT_SEARCH_URL}/api/flights/search", flight_payload),
            _fetch(client, "stays", f"{STAY_SEARCH_URL}/api/stays/search", stay_payload),
            _fetch(client, "poi", f"{POI_SEARCH_URL}/api/poi/search", poi_payload),
        )

    plan = TripPlan()
    for name, data, error in results:
        if error:
            plan.errors.append(error)
            continue
        if name == "flights":
            plan.flights = data
        elif name == "stays":
            plan.stays = data
        elif name == "poi":
            plan.points_of_interest = data

    return plan
