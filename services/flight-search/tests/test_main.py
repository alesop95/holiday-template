import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app.main import _price_sort_key, app
from app.schemas import FlightOffer


@pytest.fixture(autouse=True)
def clear_cache():
    main_module._CACHE.clear()
    yield
    main_module._CACHE.clear()


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


def test_price_sort_key_parses_leading_number():
    offer = FlightOffer(source="x", airline="x", departure="x", arrival="x", duration="x", stops=0, price="120 EUR")
    assert _price_sort_key(offer) == 120.0


def test_price_sort_key_unparsable_price_goes_last():
    offer = FlightOffer(source="x", airline="x", departure="x", arrival="x", duration="x", stops=0, price="n/d")
    assert _price_sort_key(offer) == float("inf")


def test_search_flights_aggregates_and_sorts_by_price(monkeypatch):
    offer_cheap = FlightOffer(source="a", airline="A", departure="d", arrival="a", duration="1h", stops=0, price="80 EUR")
    offer_expensive = FlightOffer(source="b", airline="B", departure="d", arrival="a", duration="1h", stops=0, price="200 EUR")
    monkeypatch.setattr(main_module, "ADAPTERS", [
        _FakeAdapter("a", offers=[offer_expensive]),
        _FakeAdapter("b", offers=[offer_cheap]),
    ])

    client = TestClient(app)
    response = client.post("/api/flights/search", json={
        "origin": "FCO", "destination": "CDG", "departure_date": "2026-09-15", "adults": 1,
    })

    assert response.status_code == 200
    prices = [o["price"] for o in response.json()]
    assert prices == ["80 EUR", "200 EUR"]  # ordinato crescente, indipendentemente dall'adapter


def test_search_flights_one_adapter_failing_does_not_block_the_other(monkeypatch):
    offer = FlightOffer(source="ok", airline="A", departure="d", arrival="a", duration="1h", stops=0, price="80 EUR")
    monkeypatch.setattr(main_module, "ADAPTERS", [
        _FakeAdapter("rotto", error=RuntimeError("simulato")),
        _FakeAdapter("ok", offers=[offer]),
    ])

    client = TestClient(app)
    response = client.post("/api/flights/search", json={
        "origin": "FCO", "destination": "CDG", "departure_date": "2026-09-16", "adults": 1,
    })

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_search_flights_all_adapters_failing_returns_502(monkeypatch):
    monkeypatch.setattr(main_module, "ADAPTERS", [
        _FakeAdapter("rotto", error=RuntimeError("simulato")),
    ])

    client = TestClient(app)
    response = client.post("/api/flights/search", json={
        "origin": "FCO", "destination": "CDG", "departure_date": "2026-09-17", "adults": 1,
    })

    assert response.status_code == 502


def test_search_flights_result_is_cached(monkeypatch):
    call_count = {"n": 0}

    class _CountingAdapter:
        name = "counting"

        def search(self, request):
            call_count["n"] += 1
            return [FlightOffer(source="c", airline="A", departure="d", arrival="a", duration="1h", stops=0, price="80 EUR")]

    monkeypatch.setattr(main_module, "ADAPTERS", [_CountingAdapter()])

    client = TestClient(app)
    body = {"origin": "FCO", "destination": "CDG", "departure_date": "2026-09-18", "adults": 1}
    client.post("/api/flights/search", json=body)
    client.post("/api/flights/search", json=body)

    assert call_count["n"] == 1  # la seconda chiamata deve venire dalla cache
