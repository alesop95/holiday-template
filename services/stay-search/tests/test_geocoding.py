import httpx
import pytest

from app.geocoding import BoundingBox, geocode


class _FakeResponse:
    def __init__(self, payload=None, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            request = httpx.Request("GET", "https://nominatim.openstreetmap.org/search")
            raise httpx.HTTPStatusError(str(self.status_code), request=request, response=self)

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


def test_geocode_retries_on_transient_error_then_succeeds(monkeypatch):
    payload = [{"boundingbox": ["39.9801512", "40.0201512", "15.3537510", "15.3937510"]}]
    responses = [_FakeResponse(status_code=429), _FakeResponse(status_code=503), _FakeResponse(payload)]
    calls = {"n": 0}

    def _fake_get(*a, **k):
        r = responses[calls["n"]]
        calls["n"] += 1
        return r

    monkeypatch.setattr("app.geocoding.httpx.get", _fake_get)
    monkeypatch.setattr("app.geocoding.time.sleep", lambda s: None)  # non rallentare i test

    bbox = geocode("Polignano a Mare")

    assert bbox == BoundingBox(ne_lat=40.0201512, ne_long=15.3937510, sw_lat=39.9801512, sw_long=15.3537510)
    assert calls["n"] == 3  # due tentativi falliti (429, 503) + uno riuscito


def test_geocode_raises_after_exhausting_retries_on_persistent_transient_error(monkeypatch):
    monkeypatch.setattr("app.geocoding.httpx.get", lambda *a, **k: _FakeResponse(status_code=429))
    monkeypatch.setattr("app.geocoding.time.sleep", lambda s: None)

    with pytest.raises(httpx.HTTPStatusError):
        geocode("Polignano a Mare")


def test_geocode_does_not_retry_on_non_transient_error(monkeypatch):
    calls = {"n": 0}

    def _fake_get(*a, **k):
        calls["n"] += 1
        return _FakeResponse(status_code=404)

    monkeypatch.setattr("app.geocoding.httpx.get", _fake_get)
    monkeypatch.setattr("app.geocoding.time.sleep", lambda s: None)

    with pytest.raises(httpx.HTTPStatusError):
        geocode("Polignano a Mare")

    assert calls["n"] == 1  # 404 non e' nella lista transitoria: nessun retry
