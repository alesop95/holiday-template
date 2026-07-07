from app.geocoding import BoundingBox, geocode


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def test_geocode_parses_real_nominatim_shape(monkeypatch):
    # Forma verificata con una richiesta reale a Nominatim in sessione (Marina di Camerota).
    payload = [{
        "place_id": 80566195,
        "lat": "40.0001512",
        "lon": "15.3737510",
        "name": "Marina di Camerota",
        "display_name": "Marina di Camerota, Camerota, Salerno, Campania, 84059, Italia",
        "boundingbox": ["39.9801512", "40.0201512", "15.3537510", "15.3937510"],
    }]
    monkeypatch.setattr("app.geocoding.httpx.get", lambda *a, **k: _FakeResponse(payload))

    bbox = geocode("Marina di Camerota")

    assert bbox == BoundingBox(ne_lat=40.0201512, ne_long=15.3937510, sw_lat=39.9801512, sw_long=15.3537510)


def test_geocode_returns_none_when_no_results(monkeypatch):
    monkeypatch.setattr("app.geocoding.httpx.get", lambda *a, **k: _FakeResponse([]))

    assert geocode("luogo-inesistente-xyz") is None
