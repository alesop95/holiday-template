"""Cache in-memory con scadenza (TTL), unico processo.

Identica agli altri due servizi (services/flight-search/app/cache.py,
services/stay-search/app/cache.py): duplicata per la stessa ragione già documentata in
.claude/context/STACK.md. TTL più lungo qui (un'ora): i punti di interesse cambiano molto più
raramente dei prezzi di voli o alloggi.
"""

import threading
import time
from typing import Any, Callable, Optional, Tuple


class TTLCache:
    def __init__(self, ttl_seconds: float):
        self._ttl = ttl_seconds
        self._store: dict[Any, Tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get_or_set(self, key: Any, compute: Callable[[], Any]) -> Tuple[Any, bool]:
        now = time.monotonic()
        with self._lock:
            cached = self._store.get(key)
            if cached is not None and now < cached[0]:
                return cached[1], True

        value = compute()
        with self._lock:
            self._store[key] = (now + self._ttl, value)
        return value, False

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        with self._lock:
            return len(self._store)
