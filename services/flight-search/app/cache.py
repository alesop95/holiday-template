"""Cache in-memory con scadenza (TTL), unico processo.

Copre l'esigenza di "cache con TTL breve" della Fase 3 della roadmap in una forma minima: un
dizionario in memoria, non condiviso tra processi o istanze. E' sufficiente per uno sviluppo o un
deploy a singolo processo (es. un unico container self-hosted, coerente con la raccomandazione di
roadmap.md); se il servizio venisse mai scalato su più processi o macchine, questa cache smette di
essere efficace (ogni processo avrebbe la propria, con hit-rate più basso) e andrebbe sostituita
con qualcosa di condiviso come Redis, già annotato in roadmap.md. Non introdotto ora per non
aggiungere una dipendenza infrastrutturale (un server Redis) a un servizio che oggi gira solo
con `uvicorn` in locale, senza deployment deciso.
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
        """Restituisce (valore, from_cache). Chiama compute() solo se assente o scaduto."""
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
