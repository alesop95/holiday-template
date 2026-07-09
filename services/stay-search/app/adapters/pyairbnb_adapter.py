"""Adapter per pyairbnb (repository johnbalvin/pyairbnb): reverse-engineering della GraphQL
interna di Airbnb, nessuna chiave richiesta. Nessuna API ufficiale esiste (vedi
`.claude/context/roadmap.md`, considerazioni ToS): usato senza login, solo richieste pubbliche,
come raccomandato dal repository stesso.

Bug reale scoperto in sessione nella versione installata (2.2.1), non nella documentazione:
`pyairbnb.search_first_page()` / `search_all()` chiamano internamente
`standardize.from_search(results_raw.get("searchResults", []))`, ma "searchResults" non e' una
chiave di primo livello della risposta grezza — sta annidata in
`data.presentation.staysSearch.results.searchResults`. Il risultato e' che le funzioni
pubbliche della libreria ricevono sempre una lista vuota e falliscono con
`AttributeError: 'list' object has no attribute 'get'` dentro `standardize.from_search`.
Bypass verificato in sessione con una ricerca reale (40 risultati validi, Marina di Camerota):
si chiamano direttamente `pyairbnb.api.get()` e `pyairbnb.search.get()` per la richiesta grezza,
poi si passa il dizionario intero (non `.get("searchResults", [])`) a
`pyairbnb.standardize.from_search()`, che sa navigare correttamente il percorso annidato.

Prezzo: il campo `price.total` restituito da pyairbnb e' sempre 0 (altro bug osservato in
sessione). Il prezzo reale sta nell'ultimo elemento di `price.break_down`: quando non ci sono
sconti c'e' una sola voce (il totale del soggiorno); quando c'e' uno sconto, l'ultima voce e'
esplicitamente "Totale" e somma le precedenti. Prendere l'ultimo elemento e' corretto in
entrambi i casi, verificato su esempi reali di entrambe le forme.

Coordinate: `item["coordinates"]["latitude"]` e `item["coordinates"]["longitud"]` (si', senza la
"e" finale — refuso reale della libreria installata in `standardize.from_search`, verificato
leggendo il codice sorgente installato, non assunto dal nome del campo).
"""

import logging
from typing import List

import pyairbnb.api as pyairbnb_api
import pyairbnb.search as pyairbnb_search
import pyairbnb.standardize as pyairbnb_standardize

from ..geocoding import geocode
from ..schemas import StayOffer, StaySearchRequest
from .base import StaySourceAdapter

logger = logging.getLogger(__name__)


class PyairbnbAdapter(StaySourceAdapter):
    name = "airbnb"

    def search(self, request: StaySearchRequest) -> List[StayOffer]:
        try:
            bbox = geocode(request.location)
        except Exception:
            logger.exception("airbnb: geocodifica di '%s' fallita", request.location)
            return []

        if bbox is None:
            logger.info("airbnb: nessun risultato di geocodifica per '%s'", request.location)
            return []

        try:
            api_key = pyairbnb_api.get("")
            raw = pyairbnb_search.get(
                api_key, "", request.check_in, request.check_out,
                bbox.ne_lat, bbox.ne_long, bbox.sw_lat, bbox.sw_long,
                12,  # zoom_value: livello città, non quartiere
                "EUR", "", 0, request.price_max, [], False,
                request.adults, 0, 0, 0, 0, 0, "it", "", hash="",
            )
            results = pyairbnb_standardize.from_search(raw)  # bypass del bug, vedi docstring
        except Exception:
            logger.exception("airbnb: ricerca fallita per '%s'", request.location)
            return []

        offers: List[StayOffer] = []
        for item in results:
            try:
                breakdown = item["price"]["break_down"]
                total_amount = breakdown[-1]["amount"] / 100
                rating = item.get("rating") or {}
                coordinates = item.get("coordinates") or {}
                offers.append(
                    StayOffer(
                        source=self.name,
                        name=item.get("name") or item.get("title") or "Senza nome",
                        listing_type=(item.get("title") or "").split("⋅")[0].strip(),
                        total_price=f"{total_amount:.0f} EUR",
                        rating=float(rating.get("value") or 0),
                        review_count=int(rating.get("reviewCount") or 0),
                        url=f"https://www.airbnb.com/rooms/{item['room_id']}" if item.get("room_id") else "",
                        lat=float(coordinates.get("latitude") or 0),
                        lon=float(coordinates.get("longitud") or 0),
                    )
                )
            except (KeyError, IndexError, TypeError, ValueError) as exc:
                logger.warning("airbnb: offerta scartata, forma dati inattesa (%s)", exc)
                continue

        return offers
