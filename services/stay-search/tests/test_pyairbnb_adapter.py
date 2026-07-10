from app.adapters.pyairbnb_adapter import PyairbnbAdapter
from app.geocoding import BoundingBox
from app.schemas import StaySearchRequest

_REQUEST = StaySearchRequest(
    location="Marina di Camerota", check_in="2026-09-15", check_out="2026-09-20", adults=2, price_max=500
)
_BBOX = BoundingBox(ne_lat=40.02, ne_long=15.39, sw_lat=39.98, sw_long=15.35)


def test_search_returns_empty_when_location_not_found(monkeypatch):
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", lambda location: None)

    assert PyairbnbAdapter().search(_REQUEST) == []


def test_search_returns_empty_when_geocoding_raises(monkeypatch):
    def _raise(location):
        raise RuntimeError("rete non disponibile")

    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", _raise)

    assert PyairbnbAdapter().search(_REQUEST) == []


def test_search_parses_listing_without_discount(monkeypatch):
    # Forma reale verificata in sessione: una sola voce in break_down = il totale del soggiorno.
    raw_result = {
        "room_id": 1201347293452040313,
        "name": "Palazzo Capasso B&B, Palazzo Capasso B&B - Camera.",
        "title": "Camerota. B&B",
        "price": {"total": {"amount": 0}, "break_down": [{"amount": 35753.0, "description": "5 notti a 71,51€"}]},
        "rating": {"value": 5.0, "reviewCount": "47"},
        # "coordinates" assente apposta: verifica che lat/lon degradino a 0 invece di rompersi,
        # come per un annuncio reale che non le espone.
    }
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_api.get", lambda proxy: "api-key-finta")
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_search.get", lambda *a, **k: {"raw": True})
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_standardize.from_search", lambda raw: [raw_result])

    offers = PyairbnbAdapter().search(_REQUEST)

    assert len(offers) == 1
    offer = offers[0]
    assert offer.name == "Palazzo Capasso B&B, Palazzo Capasso B&B - Camera."
    assert offer.listing_type == "Camerota. B&B"  # nessun "⋅" nel titolo: resta intero
    assert offer.total_price == "358 EUR"  # 35753 / 100, arrotondato
    assert offer.rating == 5.0
    assert offer.review_count == 47
    assert offer.url == "https://www.airbnb.com/rooms/1201347293452040313"
    assert offer.lat == 0
    assert offer.lon == 0


def test_search_parses_coordinates_using_real_typo_key(monkeypatch):
    # La libreria installata scrive "longitud", non "longitude" (verificato leggendo il codice
    # sorgente di pyairbnb.standardize.from_search): questo test blocca una regressione se in
    # futuro qualcuno "corregge" per errore la chiave nel nostro codice.
    raw_result = {
        "room_id": 42,
        "name": "Casa sul mare",
        "title": "Marina di Camerota. Appartamento",
        "price": {"total": {"amount": 0}, "break_down": [{"amount": 50000.0, "description": "tot"}]},
        "rating": {"value": 4.5, "reviewCount": "10"},
        "coordinates": {"latitude": 39.991, "longitud": 15.373},
    }
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_api.get", lambda proxy: "api-key-finta")
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_search.get", lambda *a, **k: {"raw": True})
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_standardize.from_search", lambda raw: [raw_result])

    offer = PyairbnbAdapter().search(_REQUEST)[0]

    assert offer.lat == 39.991
    assert offer.lon == 15.373


def test_search_parses_listing_with_discount_uses_last_breakdown_entry(monkeypatch):
    # Forma reale verificata in sessione: con sconto, l'ultima voce "Totale" e' quella corretta.
    raw_result = {
        "room_id": 1689131125836695487,
        "name": "Ad Agros Logement - Domus Olea: Monolocale Centrale",
        "title": "Appartamento ⋅ Marina di Camerota",
        "price": {
            "total": {"amount": 0},
            "break_down": [
                {"amount": 31535.0, "description": "5 notti a 63,07€"},
                {"amount": -1355.0, "description": "Sconto per le prenotazioni anticipate"},
                {"amount": 30180.0, "description": "Totale"},
            ],
        },
        "rating": {"value": 0, "reviewCount": 0},
    }
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_api.get", lambda proxy: "api-key-finta")
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_search.get", lambda *a, **k: {"raw": True})
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_standardize.from_search", lambda raw: [raw_result])

    offers = PyairbnbAdapter().search(_REQUEST)

    assert len(offers) == 1
    assert offers[0].total_price == "302 EUR"  # 30180 / 100 (il Totale scontato, non 315.35)
    assert offers[0].listing_type == "Appartamento"  # split su "⋅", troncato e ripulito
    assert offers[0].rating == 0.0
    assert offers[0].review_count == 0


def test_search_passes_custom_currency_to_request_and_price(monkeypatch):
    # Prova che request.currency arriva davvero al parametro posizionale "currency" mandato ad
    # Airbnb (indice 9 di pyairbnb.search.get, verificato contro la firma reale della libreria
    # installata) e nella stringa prezzo, non solo che il campo esiste inutilizzato nello schema.
    captured = {}
    raw_result = {
        "room_id": 99,
        "name": "Studio in centro",
        "title": "Appartamento",
        "price": {"total": {"amount": 0}, "break_down": [{"amount": 20000.0, "description": "tot"}]},
        "rating": {"value": 0, "reviewCount": 0},
    }

    def _fake_search_get(*a, **k):
        captured["currency"] = a[9]
        return {"raw": True}

    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_api.get", lambda proxy: "api-key-finta")
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_search.get", _fake_search_get)
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_standardize.from_search", lambda raw: [raw_result])

    request = StaySearchRequest(
        location="Marina di Camerota", check_in="2026-09-15", check_out="2026-09-20",
        adults=2, price_max=500, currency="USD",
    )
    offers = PyairbnbAdapter().search(request)

    assert captured["currency"] == "USD"
    assert offers[0].total_price == "200 USD"


def test_search_skips_malformed_item_without_crashing(monkeypatch):
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_api.get", lambda proxy: "api-key-finta")
    monkeypatch.setattr("app.adapters.pyairbnb_adapter.pyairbnb_search.get", lambda *a, **k: {"raw": True})
    monkeypatch.setattr(
        "app.adapters.pyairbnb_adapter.pyairbnb_standardize.from_search",
        lambda raw: [{"room_id": 1}],  # manca "price": deve essere scartato, non deve rompere
    )

    assert PyairbnbAdapter().search(_REQUEST) == []
