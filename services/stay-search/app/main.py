"""Servizio FastAPI di ricerca alloggi — Fase 2 di .claude/context/roadmap.md.

Avvio di sviluppo:
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8002
"""

from typing import List

from fastapi import FastAPI, HTTPException

from .adapters.pyairbnb_adapter import PyairbnbAdapter
from .schemas import StayOffer, StaySearchRequest

app = FastAPI(title="stay-search", version="0.1.0")

ADAPTERS = [PyairbnbAdapter()]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/stays/search", response_model=List[StayOffer])
def search_stays(request: StaySearchRequest) -> List[StayOffer]:
    offers: List[StayOffer] = []
    errors: List[str] = []
    for adapter in ADAPTERS:
        try:
            offers.extend(adapter.search(request))
        except Exception as exc:  # un adapter che fallisce non deve bloccare gli altri
            errors.append(f"{adapter.name}: {exc}")

    if not offers and errors:
        raise HTTPException(status_code=502, detail="; ".join(errors))
    return sorted(offers, key=lambda o: float(o.total_price.split()[0]))
