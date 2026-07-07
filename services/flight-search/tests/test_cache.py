import time

from app.cache import TTLCache


def test_get_or_set_computes_once_within_ttl():
    cache = TTLCache(ttl_seconds=60)
    calls = []

    def compute():
        calls.append(1)
        return "valore"

    value1, from_cache1 = cache.get_or_set("chiave", compute)
    value2, from_cache2 = cache.get_or_set("chiave", compute)

    assert value1 == value2 == "valore"
    assert from_cache1 is False
    assert from_cache2 is True
    assert len(calls) == 1  # compute chiamata una sola volta


def test_get_or_set_recomputes_after_expiry():
    cache = TTLCache(ttl_seconds=0.05)
    calls = []

    def compute():
        calls.append(1)
        return len(calls)

    cache.get_or_set("chiave", compute)
    time.sleep(0.1)
    value, from_cache = cache.get_or_set("chiave", compute)

    assert from_cache is False
    assert value == 2
    assert len(calls) == 2


def test_different_keys_are_independent():
    cache = TTLCache(ttl_seconds=60)

    cache.get_or_set("a", lambda: "valore-a")
    cache.get_or_set("b", lambda: "valore-b")

    assert cache.size() == 2


def test_clear_empties_the_cache():
    cache = TTLCache(ttl_seconds=60)
    cache.get_or_set("a", lambda: "valore")

    cache.clear()

    assert cache.size() == 0
