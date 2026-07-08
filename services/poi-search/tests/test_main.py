import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app.main import app
from app.schemas import PointOfInterest


@pytest.fixture(autouse=True)
def clear_cache():
    main_module._CACHE.clear()
    yield
    main_module._CACHE.clear()


class _FakeAdapter:
    def __init__(self, name, pois=None, error=None):
        self.name = name
        self._pois = pois or []
        self._error = error

    def search(self, request):
        if self._error:
            raise self._error
        return self._pois


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_search_poi_returns_results(monkeypatch):
    poi = PointOfInterest(source="overpass", name="Grotta Azzurra", category="attraction", lat=40.03, lon=15.37)
    monkeypatch.setattr(main_module, "ADAPTERS", [_FakeAdapter("overpass", pois=[poi])])

    client = TestClient(app)
    response = client.post("/api/poi/search", json={"location": "Marina di Camerota", "limit": 10})

    assert response.status_code == 200
    assert response.json()[0]["name"] == "Grotta Azzurra"


def test_search_poi_all_adapters_failing_returns_502(monkeypatch):
    monkeypatch.setattr(main_module, "ADAPTERS", [_FakeAdapter("rotto", error=RuntimeError("simulato"))])

    client = TestClient(app)
    response = client.post("/api/poi/search", json={"location": "Marina di Camerota", "limit": 10})

    assert response.status_code == 502


def test_search_poi_result_is_cached(monkeypatch):
    call_count = {"n": 0}

    class _CountingAdapter:
        name = "counting"

        def search(self, request):
            call_count["n"] += 1
            return [PointOfInterest(source="c", name="Test", category="attraction", lat=1.0, lon=1.0)]

    monkeypatch.setattr(main_module, "ADAPTERS", [_CountingAdapter()])

    client = TestClient(app)
    body = {"location": "Marina di Camerota", "limit": 10}
    client.post("/api/poi/search", json=body)
    client.post("/api/poi/search", json=body)

    assert call_count["n"] == 1
