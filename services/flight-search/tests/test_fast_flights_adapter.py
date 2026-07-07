from types import SimpleNamespace

from app.adapters.fast_flights_adapter import _format_datetime, _format_duration


def test_format_datetime_pads_date_and_time():
    dt = SimpleNamespace(date=(2026, 9, 5), time=(6, 30))
    assert _format_datetime(dt) == "2026-09-05 06:30"


def test_format_duration_with_hours():
    assert _format_duration(140) == "2h 20m"


def test_format_duration_under_one_hour():
    assert _format_duration(45) == "45m"


def test_format_duration_exact_hour():
    assert _format_duration(120) == "2h 0m"
