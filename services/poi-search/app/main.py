"""Servizio FastAPI di ricerca punti di interesse — Fase 4 di .claude/context/roadmap.md.

Avvio di sviluppo:
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8003
"""

from typing import List

from fastapi import FastAPI, HTTPException

from .adapters.overpass_adapter import OverpassAdapter
from .cache import TTLCache
from .schemas import PoiSearchRequest, PointOfInterest

app = FastAPI(title="poi-search", version="0.1.0")

ADAPTERS = [OverpassAdapter()]

# I POI cambiano raramente: TTL lungo, più di flight-search e stay-search.
_CACHE = TTLCache(ttl_seconds=3600)


def _run_adapters(request: PoiSearchRequest) -> List[PointOfInterest]:
    pois: List[PointOfInterest] = []
    errors: List[str] = []
    for adapter in ADAPTERS:
        try:
            pois.extend(adapter.search(request))
        except Exception as exc:  # un adapter che fallisce non deve bloccare gli altri
            errors.append(f"{adapter.name}: {exc}")

    if not pois and errors:
        raise HTTPException(status_code=502, detail="; ".join(errors))
    return pois


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/poi/search", response_model=List[PointOfInterest])
def search_poi(request: PoiSearchRequest) -> List[PointOfInterest]:
    cache_key = (request.location, request.limit)
    pois, _from_cache = _CACHE.get_or_set(cache_key, lambda: _run_adapters(request))
    return pois
