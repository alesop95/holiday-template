from app.adapters.kiwi_adapter import KiwiAdapter, _format_duration, _to_kiwi_date
from app.schemas import FlightSearchRequest


def test_to_kiwi_date_converts_iso_to_ddmmyyyy():
    assert _to_kiwi_date("2026-09-15") == "15/09/2026"


def test_format_duration_seconds_to_hours_minutes():
    assert _format_duration(9020) == "2h 30m"  # 9020s // 60 = 150 min -> 2h 30m


def test_format_duration_under_one_hour():
    assert _format_duration(1800) == "30m"


def test_search_without_api_key_returns_empty_list():
    adapter = KiwiAdapter(api_key=None)
    request = FlightSearchRequest(origin="FCO", destination="CDG", departure_date="2026-09-15")

    assert adapter.search(request) == []


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def test_search_parses_real_shaped_response(monkeypatch):
    payload = {
        "data": [
            {
                "price": 99,
                "route": [
                    {"airline": "BA", "local_departure": "2026-09-15T10:35:00.000Z", "local_arrival": "2026-09-15T17:45:00.000Z"},
                ],
                "duration": {"departure": 25800, "return": 0, "total": 25800},
            }
        ]
    }
    monkeypatch.setattr(
        "app.adapters.kiwi_adapter.httpx.get", lambda *a, **k: _FakeResponse(payload)
    )

    adapter = KiwiAdapter(api_key="chiave-di-test")
    request = FlightSearchRequest(origin="FCO", destination="CDG", departure_date="2026-09-15")
    offers = adapter.search(request)

    assert len(offers) == 1
    offer = offers[0]
    assert offer.source == "kiwi"
    assert offer.airline == "BA"
    assert offer.price == "99 EUR"
    assert offer.stops == 0
    assert offer.departure == "2026-09-15 10:35"


def test_search_skips_malformed_item_without_crashing(monkeypatch):
    payload = {"data": [{"price": 99}]}  # manca "route": la voce va scartata, non deve rompere
    monkeypatch.setattr(
        "app.adapters.kiwi_adapter.httpx.get", lambda *a, **k: _FakeResponse(payload)
    )

    adapter = KiwiAdapter(api_key="chiave-di-test")
    request = FlightSearchRequest(origin="FCO", destination="CDG", departure_date="2026-09-15")

    assert adapter.search(request) == []
