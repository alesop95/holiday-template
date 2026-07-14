"""Servizio FastAPI di ricerca voli — Fase 1 di .claude/context/roadmap.md.

Avvio di sviluppo:
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8001
"""

import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .adapters.fast_flights_adapter import FastFlightsAdapter
from .cache import TTLCache
from .schemas import FlightOffer, FlightSearchRequest

load_dotenv()  # legge .env locale (gitignored); assente in produzione se non creato

app = FastAPI(title="flight-search", version="0.1.0")

# Nessuna autenticazione né dato sensibile (vedi design-and-security.md): origine aperta
# per permettere alla shell frontend di chiamare questo servizio durante lo sviluppo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ADAPTERS = [
    FastFlightsAdapter(),
]

# I prezzi voli cambiano rapidamente: TTL breve (roadmap.md, Fase 3). Vedi app/cache.py
# per i limiti di una cache in-memory a singolo processo.
_CACHE = TTLCache(ttl_seconds=300)
_PRICE_RE = re.compile(r"[\d.,]+")


def _price_sort_key(offer: FlightOffer) -> float:
    match = _PRICE_RE.search(offer.price)
    if not match:
        return float("inf")  # offerte con prezzo non parsabile vanno in fondo, non escluse
    return float(match.group().replace(",", ""))


def _run_adapters(request: FlightSearchRequest) -> List[FlightOffer]:
    """Interroga tutti gli adapter in parallelo (thread, non asyncio: sia fast_flights sia
    httpx-in-modalita'-sync sono I/O bloccante). Un adapter che fallisce non blocca gli altri."""
    offers: List[FlightOffer] = []
    errors: List[str] = []
    with ThreadPoolExecutor(max_workers=len(ADAPTERS)) as pool:
        future_to_adapter = {pool.submit(adapter.search, request): adapter for adapter in ADAPTERS}
        for future in as_completed(future_to_adapter):
            adapter = future_to_adapter[future]
            try:
                offers.extend(future.result())
            except Exception as exc:
                errors.append(f"{adapter.name}: {exc}")

    if not offers and errors:
        raise HTTPException(status_code=502, detail="; ".join(errors))
    return sorted(offers, key=_price_sort_key)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/flights/search", response_model=List[FlightOffer])
def search_flights(request: FlightSearchRequest) -> List[FlightOffer]:
    cache_key = (
        request.origin, request.destination, request.departure_date,
        request.return_date, request.adults, request.seat,
    )
    offers, _from_cache = _CACHE.get_or_set(cache_key, lambda: _run_adapters(request))
    return offers
