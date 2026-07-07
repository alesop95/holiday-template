from fastapi.testclient import TestClient

import app.main as main_module
from app.main import app
from app.schemas import StayOffer


class _FakeAdapter:
    def __init__(self, name, offers=None, error=None):
        self.name = name
        self._offers = offers or []
        self._error = error

    def search(self, request):
        if self._error:
            raise self._error
        return self._offers


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_search_stays_sorts_by_price(monkeypatch):
    cheap = StayOffer(source="a", name="Economico", total_price="150 EUR")
    expensive = StayOffer(source="a", name="Caro", total_price="400 EUR")
    monkeypatch.setattr(main_module, "ADAPTERS", [_FakeAdapter("a", offers=[expensive, cheap])])

    client = TestClient(app)
    response = client.post("/api/stays/search", json={
        "location": "Marina di Camerota", "check_in": "2026-09-15", "check_out": "2026-09-20",
        "adults": 2, "price_max": 500,
    })

    assert response.status_code == 200
    names = [o["name"] for o in response.json()]
    assert names == ["Economico", "Caro"]


def test_search_stays_all_adapters_failing_returns_502(monkeypatch):
    monkeypatch.setattr(main_module, "ADAPTERS", [_FakeAdapter("rotto", error=RuntimeError("simulato"))])

    client = TestClient(app)
    response = client.post("/api/stays/search", json={
        "location": "Marina di Camerota", "check_in": "2026-09-15", "check_out": "2026-09-20",
        "adults": 2, "price_max": 500,
    })

    assert response.status_code == 502
