from fastapi.testclient import TestClient

import app.main as main_module
from app.main import app

_REQUEST_BODY = {
    "origin_airport": "FCO",
    "destination_airport": "CDG",
    "destination_location": "Paris",
    "departure_date": "2026-09-15",
    "return_date": "2026-09-20",
    "adults": 2,
}


class _FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload

    def raise_for_status(self):
        if self.status_code >= 400:
            import httpx
            raise httpx.HTTPStatusError("errore simulato", request=None, response=self)

    def json(self):
        return self._payload


class _FakeAsyncClient:
    """Sostituisce httpx.AsyncClient: stesso protocollo async context manager + .post()."""

    def __init__(self, responses):
        self._responses = responses  # dict: nome-servizio (dedotto dall'URL) -> _FakeResponse

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def post(self, url, json, timeout):
        for key, response in self._responses.items():
            if key in url:
                return response
        raise AssertionError(f"URL non atteso nel test: {url}")


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_build_trip_plan_combines_all_three_services(monkeypatch):
    fake_client = _FakeAsyncClient({
        "flights": _FakeResponse(200, [{"source": "fast_flights", "price": "100 EUR"}]),
        "stays": _FakeResponse(200, [{"source": "airbnb", "total_price": "300 EUR"}]),
        "poi": _FakeResponse(200, [{"source": "overpass", "name": "Torre Eiffel"}]),
    })
    monkeypatch.setattr(main_module.httpx, "AsyncClient", lambda: fake_client)

    client = TestClient(app)
    response = client.post("/api/trip-plan", json=_REQUEST_BODY)

    assert response.status_code == 200
    plan = response.json()
    assert plan["errors"] == []
    assert len(plan["flights"]) == 1
    assert len(plan["stays"]) == 1
    assert len(plan["points_of_interest"]) == 1


def test_build_trip_plan_degrades_gracefully_when_one_service_is_down(monkeypatch):
    fake_client = _FakeAsyncClient({
        "flights": _FakeResponse(200, [{"source": "fast_flights", "price": "100 EUR"}]),
        "stays": _FakeResponse(200, [{"source": "airbnb", "total_price": "300 EUR"}]),
        "poi": _FakeResponse(502, {"detail": "tutti gli adapter falliti"}),
    })
    monkeypatch.setattr(main_module.httpx, "AsyncClient", lambda: fake_client)

    client = TestClient(app)
    response = client.post("/api/trip-plan", json=_REQUEST_BODY)

    assert response.status_code == 200  # il piano torna comunque, non e' tutto-o-niente
    plan = response.json()
    assert len(plan["flights"]) == 1
    assert len(plan["stays"]) == 1
    assert plan["points_of_interest"] == []
    assert len(plan["errors"]) == 1
    assert "poi" in plan["errors"][0]


def test_build_trip_plan_skips_flights_when_airports_omitted(monkeypatch):
    """Un viaggio in auto non ha aeroporti: niente chiamata a flight-search, nessun errore per
    quello, non fa parte per niente della gather()."""
    car_trip_body = {
        "destination_location": "Marina di Camerota",
        "departure_date": "2026-09-15",
        "return_date": "2026-09-20",
        "adults": 2,
    }
    fake_client = _FakeAsyncClient({
        "stays": _FakeResponse(200, [{"source": "airbnb", "total_price": "300 EUR"}]),
        "poi": _FakeResponse(200, [{"source": "overpass", "name": "Torre dell'Isola"}]),
    })
    monkeypatch.setattr(main_module.httpx, "AsyncClient", lambda: fake_client)

    client = TestClient(app)
    response = client.post("/api/trip-plan", json=car_trip_body)

    assert response.status_code == 200
    plan = response.json()
    assert plan["flights"] == []
    assert plan["errors"] == []  # niente errore "flights: ..." per una ricerca mai fatta
    assert len(plan["stays"]) == 1
    assert len(plan["points_of_interest"]) == 1


def test_build_trip_plan_sends_correct_payloads_to_each_service(monkeypatch):
    captured = {}

    class _CapturingClient(_FakeAsyncClient):
        async def post(self, url, json, timeout):
            captured[url] = json
            return await super().post(url, json, timeout)

    fake_client = _CapturingClient({
        "flights": _FakeResponse(200, []),
        "stays": _FakeResponse(200, []),
        "poi": _FakeResponse(200, []),
    })
    monkeypatch.setattr(main_module.httpx, "AsyncClient", lambda: fake_client)

    client = TestClient(app)
    client.post("/api/trip-plan", json=_REQUEST_BODY)

    flight_payload = next(v for k, v in captured.items() if "flights" in k)
    stay_payload = next(v for k, v in captured.items() if "stays" in k)
    poi_payload = next(v for k, v in captured.items() if "poi" in k)

    assert flight_payload["origin"] == "FCO"
    assert flight_payload["destination"] == "CDG"
    assert stay_payload["location"] == "Paris"
    assert stay_payload["check_in"] == "2026-09-15"
    assert stay_payload["check_out"] == "2026-09-20"
    assert poi_payload["location"] == "Paris"
