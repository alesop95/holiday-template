import httpx

from app.adapters.overpass_adapter import OverpassAdapter
from app.geocoding import BoundingBox
from app.schemas import PoiSearchRequest

_REQUEST = PoiSearchRequest(location="Marina di Camerota", limit=10)
_BBOX = BoundingBox(ne_lat=40.05, ne_long=15.40, sw_lat=40.00, sw_long=15.30)


class _FakeResponse:
    def __init__(self, payload=None, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            request = httpx.Request("POST", "https://overpass-api.de/api/interpreter")
            raise httpx.HTTPStatusError(str(self.status_code), request=request, response=self)

    def json(self):
        return self._payload


def test_search_returns_empty_when_location_not_found(monkeypatch):
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: None)

    assert OverpassAdapter().search(_REQUEST) == []


def test_search_filters_unnamed_and_accommodation_elements(monkeypatch):
    # Forma reale verificata in sessione contro l'API live di Overpass.
    payload = {
        "elements": [
            {"type": "node", "id": 1, "lat": 40.03, "lon": 15.37, "tags": {"name": "Grotta Azzurra", "tourism": "attraction"}},
            {"type": "node", "id": 2, "lat": 40.03, "lon": 15.37, "tags": {"tourism": "guest_house"}},  # senza nome: scartato
            {"type": "node", "id": 3, "lat": 40.00, "lon": 15.37, "tags": {"name": "Hotel America", "tourism": "hotel"}},  # alloggio: scartato
            {"type": "node", "id": 4, "lat": 40.02, "lon": 15.37, "tags": {"historic": "ruins"}},  # senza nome: scartato
            {"type": "node", "id": 5, "lat": 40.03, "lon": 15.33, "tags": {"name": "Belvedere di Cala Fortuna", "tourism": "viewpoint"}},
        ]
    }
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(payload))

    pois = OverpassAdapter().search(_REQUEST)

    names = {p.name for p in pois}
    assert names == {"Grotta Azzurra", "Belvedere di Cala Fortuna"}


def test_search_parses_fee_and_charge_tags_when_present(monkeypatch):
    # Forma reale verificata dal vivo contro l'API Overpass (Parigi, tourism=museum): fee spesso
    # solo "yes"/"no", charge un vero importo ma raro (5/100 elementi nella verifica).
    payload = {
        "elements": [
            {"type": "node", "id": 1, "lat": 48.85, "lon": 2.35, "tags": {"name": "Musée Edith Piaf", "tourism": "museum", "fee": "yes", "charge": "10 EUR"}},
            {"type": "node", "id": 2, "lat": 48.86, "lon": 2.36, "tags": {"name": "Maison de Victor Hugo", "tourism": "museum", "fee": "no"}},
            {"type": "node", "id": 3, "lat": 48.87, "lon": 2.37, "tags": {"name": "Point zéro", "tourism": "attraction"}},  # nessun tag fee/charge
        ]
    }
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(payload))

    pois = {p.name: p for p in OverpassAdapter().search(_REQUEST)}

    assert pois["Musée Edith Piaf"].fee == "yes"
    assert pois["Musée Edith Piaf"].price_hint == "10 EUR"
    assert pois["Maison de Victor Hugo"].fee == "no"
    assert pois["Maison de Victor Hugo"].price_hint is None
    assert pois["Point zéro"].fee is None
    assert pois["Point zéro"].price_hint is None


def test_search_includes_food_amenity_categories(monkeypatch):
    # Forma reale verificata dal vivo contro l'API live di Overpass (Polignano a Mare, 2026-07-14).
    # Nessun caso "amenity fuori whitelist" da testare qui: la query inviata a Overpass e'
    # costruita direttamente da _FOOD_AMENITY_VALUES (vedi search()), quindi non puo' mai
    # restituire un amenity fuori whitelist — non esiste un filtro client-side separato da testare.
    payload = {
        "elements": [
            {"type": "node", "id": 725314415, "lat": 41.0037597, "lon": 17.2014609, "tags": {"amenity": "restaurant", "name": "Cozze Nere"}},
            {"type": "node", "id": 800979358, "lat": 40.9919848, "lon": 17.2251911, "tags": {"amenity": "cafe", "name": "Cremeria 110"}},
            {"type": "node", "id": 862782621, "lat": 40.9962716, "lon": 17.2202171, "tags": {"amenity": "pub", "name": "Millenium"}},
        ]
    }
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(payload))

    pois = {p.name: p for p in OverpassAdapter().search(_REQUEST)}

    assert pois["Cozze Nere"].category == "restaurant"
    assert pois["Cremeria 110"].category == "cafe"
    assert pois["Millenium"].category == "pub"


def test_search_amenity_wins_over_tourism_on_dual_tagged_node(monkeypatch):
    # Caso reale verificato dal vivo: Grotta Palazzese ha sia amenity=restaurant sia
    # tourism=viewpoint. amenity deve vincere nella categoria assegnata (vedi docstring
    # dell'adapter), non essendo un alloggio (tourism=viewpoint non e' nella blacklist alloggi).
    payload = {
        "elements": [
            {"type": "node", "id": 567237137, "lat": 40.9959228, "lon": 17.2209902, "tags": {
                "amenity": "restaurant", "tourism": "viewpoint", "name": "Grotta Palazzese",
            }},
        ]
    }
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(payload))

    pois = OverpassAdapter().search(_REQUEST)

    assert len(pois) == 1
    assert pois[0].category == "restaurant"


def test_search_respects_limit(monkeypatch):
    payload = {
        "elements": [
            {"type": "node", "id": i, "lat": 40.0, "lon": 15.3, "tags": {"name": f"POI {i}", "tourism": "attraction"}}
            for i in range(20)
        ]
    }
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(payload))

    request = PoiSearchRequest(location="Marina di Camerota", limit=5)
    pois = OverpassAdapter().search(request)

    assert len(pois) == 5


def test_search_skips_malformed_element_without_crashing(monkeypatch):
    payload = {"elements": [{"type": "node", "id": 1}]}  # manca "tags": deve essere scartato
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(payload))

    assert OverpassAdapter().search(_REQUEST) == []


def test_search_retries_on_transient_error_then_succeeds(monkeypatch):
    # Riprodotto dal vivo in sessione (2026-07-14): un 504 reale da overpass-api.de, sparito al
    # tentativo successivo.
    payload = {"elements": [{"type": "node", "id": 1, "lat": 40.0, "lon": 15.3, "tags": {"name": "Grotta Azzurra", "tourism": "attraction"}}]}
    responses = [_FakeResponse(status_code=504), _FakeResponse(payload)]
    calls = {"n": 0}

    def _fake_post(*a, **k):
        r = responses[calls["n"]]
        calls["n"] += 1
        return r

    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", _fake_post)
    monkeypatch.setattr("app.adapters.overpass_adapter.time.sleep", lambda s: None)  # non rallentare i test

    pois = OverpassAdapter().search(_REQUEST)

    assert len(pois) == 1
    assert calls["n"] == 2  # un tentativo fallito (504) + uno riuscito


def test_search_returns_empty_after_exhausting_retries_on_persistent_transient_error(monkeypatch):
    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", lambda *a, **k: _FakeResponse(status_code=503))
    monkeypatch.setattr("app.adapters.overpass_adapter.time.sleep", lambda s: None)

    assert OverpassAdapter().search(_REQUEST) == []


def test_search_does_not_retry_on_non_transient_error(monkeypatch):
    calls = {"n": 0}

    def _fake_post(*a, **k):
        calls["n"] += 1
        return _FakeResponse(status_code=400)

    monkeypatch.setattr("app.adapters.overpass_adapter.geocode", lambda location: _BBOX)
    monkeypatch.setattr("app.adapters.overpass_adapter.httpx.post", _fake_post)
    monkeypatch.setattr("app.adapters.overpass_adapter.time.sleep", lambda s: None)

    assert OverpassAdapter().search(_REQUEST) == []
    assert calls["n"] == 1  # 400 non e' nella lista transitoria: nessun retry
