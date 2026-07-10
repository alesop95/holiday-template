from types import SimpleNamespace

from app.adapters.fast_flights_adapter import FastFlightsAdapter, _format_datetime, _format_duration
from app.schemas import FlightSearchRequest


def test_format_datetime_pads_date_and_time():
    dt = SimpleNamespace(date=(2026, 9, 5), time=(6, 30))
    assert _format_datetime(dt) == "2026-09-05 06:30"


def test_format_duration_with_hours():
    assert _format_duration(140) == "2h 20m"


def test_format_duration_under_one_hour():
    assert _format_duration(45) == "45m"


def test_format_duration_exact_hour():
    assert _format_duration(120) == "2h 0m"


def test_search_passes_custom_currency_to_query_and_price(monkeypatch):
    # Prova che request.currency arriva davvero a create_query() (query mandata a Google) e nella
    # stringa prezzo, non solo che il campo esiste inutilizzato nello schema.
    captured = {}

    def _fake_create_query(**kwargs):
        captured.update(kwargs)
        return "fake-query"

    leg = SimpleNamespace(
        departure=SimpleNamespace(date=(2026, 9, 15), time=(6, 30)),
        arrival=SimpleNamespace(date=(2026, 9, 15), time=(9, 0)),
        duration=150,
    )
    itinerary = SimpleNamespace(price=120, airlines=["Ryanair"], flights=[leg])

    monkeypatch.setattr("app.adapters.fast_flights_adapter.create_query", _fake_create_query)
    monkeypatch.setattr("app.adapters.fast_flights_adapter.get_flights", lambda query, integration=None: [itinerary])

    request = FlightSearchRequest(origin="FCO", destination="CDG", departure_date="2026-09-15", currency="USD")
    offers = FastFlightsAdapter().search(request)

    assert captured["currency"] == "USD"
    assert offers[0].price == "120 USD"
