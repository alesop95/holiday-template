import httpx
import pytest

from app.geocoding import _SEARCH_RADIUS_KM, _bbox_around, geocode


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


def test_bbox_around_at_equator_lat_and_lon_deltas_are_equal():
    # All'equatore cos(0)=1: nessuna correzione di longitudine, quindi i due delta coincidono.
    # Verifica la geometria di base senza dipendere dalla costante di raggio scelta altrove.
    bbox = _bbox_around(lat=0.0, lon=10.0, radius_km=111.0)  # 111km = 1 grado esatto

    assert bbox.ne_lat == pytest.approx(1.0)
    assert bbox.sw_lat == pytest.approx(-1.0)
    assert bbox.ne_long == pytest.approx(11.0)
    assert bbox.sw_long == pytest.approx(9.0)


def test_bbox_around_shrinks_longitude_delta_away_from_equator():
    # A una latitudine reale (Polignano, ~41°N) un grado di longitudine copre meno km di un
    # grado di latitudine: a parita' di raggio, il delta di longitudine dev'essere maggiore
    # del delta di latitudine (serve piu' longitudine per coprire la stessa distanza reale).
    bbox = _bbox_around(lat=41.0, lon=17.0, radius_km=5.0)

    lat_delta = bbox.ne_lat - 41.0
    lon_delta = bbox.ne_long - 17.0
    assert lon_delta > lat_delta


def test_geocode_uses_center_point_not_nominatim_admin_boundary(monkeypatch):
    # Bug reale scoperto in sessione (2026-07-14): per "Polignano a mare" il primo risultato di
    # Nominatim e' il confine amministrativo dell'intero comune (~15x10km), non il centro
    # abitato — includeva zone di un comune diverso (Conversano). Il fix ignora il campo
    # "boundingbox" della risposta e ricostruisce un riquadro di raggio fisso attorno al solo
    # punto centrale (lat/lon), qui verificato con le coordinate reali di Polignano a Mare.
    payload = [{
        "place_id": 56810860,
        "lat": "40.9944463",
        "lon": "17.2224879",
        "name": "Polignano a Mare",
        "boundingbox": ["40.8957620", "41.0367715", "17.1404562", "17.2593045"],  # ignorato di proposito
    }]
    monkeypatch.setattr("app.geocoding.httpx.get", lambda *a, **k: _FakeResponse(payload))

    bbox = geocode("Polignano a mare")

    assert bbox == _bbox_around(40.9944463, 17.2224879, _SEARCH_RADIUS_KM)
    # Il punto di Conversano (comune diverso, comparso per errore nei risultati prima del fix)
    # deve restituire un valore ovunque fuori da questo bounding box.
    conversano_lat, conversano_lon = 40.9425719, 17.1569652
    assert not (bbox.sw_lat <= conversano_lat <= bbox.ne_lat and bbox.sw_long <= conversano_lon <= bbox.ne_long)


def test_geocode_returns_none_when_no_results(monkeypatch):
    monkeypatch.setattr("app.geocoding.httpx.get", lambda *a, **k: _FakeResponse([]))

    assert geocode("luogo-inesistente-xyz") is None


def test_geocode_retries_on_transient_error_then_succeeds(monkeypatch):
    payload = [{"lat": "40.0001512", "lon": "15.3737510"}]
    responses = [_FakeResponse(status_code=429), _FakeResponse(status_code=503), _FakeResponse(payload)]
    calls = {"n": 0}

    def _fake_get(*a, **k):
        r = responses[calls["n"]]
        calls["n"] += 1
        return r

    monkeypatch.setattr("app.geocoding.httpx.get", _fake_get)
    monkeypatch.setattr("app.geocoding.time.sleep", lambda s: None)  # non rallentare i test

    bbox = geocode("Marina di Camerota")

    assert bbox == _bbox_around(40.0001512, 15.3737510, _SEARCH_RADIUS_KM)
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
