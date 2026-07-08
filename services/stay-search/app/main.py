"""Servizio FastAPI di ricerca alloggi — Fase 2 di .claude/context/roadmap.md.

Avvio di sviluppo:
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8002
"""

from typing import List

from fastapi import FastAPI, HTTPException

from .adapters.pyairbnb_adapter import PyairbnbAdapter
from .cache import TTLCache
from .schemas import StayOffer, StaySearchRequest

app = FastAPI(title="stay-search", version="0.1.0")

ADAPTERS = [PyairbnbAdapter()]

# Prezzi e disponibilità degli alloggi cambiano più lentamente di quelli dei voli nell'arco della
# stessa giornata: TTL più lungo di flight-search (300s) non e' un refuso.
_CACHE = TTLCache(ttl_seconds=600)


def _price_sort_key(offer: StayOffer) -> float:
    try:
        return float(offer.total_price.split()[0])
    except (ValueError, IndexError):
        return float("inf")  # prezzo non parsabile va in fondo, non escluso


def _run_adapters(request: StaySearchRequest) -> List[StayOffer]:
    offers: List[StayOffer] = []
    errors: List[str] = []
    for adapter in ADAPTERS:
        try:
            offers.extend(adapter.search(request))
        except Exception as exc:  # un adapter che fallisce non deve bloccare gli altri
            errors.append(f"{adapter.name}: {exc}")

    if not offers and errors:
        raise HTTPException(status_code=502, detail="; ".join(errors))
    return sorted(offers, key=_price_sort_key)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/stays/search", response_model=List[StayOffer])
def search_stays(request: StaySearchRequest) -> List[StayOffer]:
    cache_key = (request.location, request.check_in, request.check_out, request.adults, request.price_max)
    offers, _from_cache = _CACHE.get_or_set(cache_key, lambda: _run_adapters(request))
    return offers
