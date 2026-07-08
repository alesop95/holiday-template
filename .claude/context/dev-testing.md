---
generated-from-commit: f8a0c3d0d692fe9c32b6b89e3902fa4d2dfa53c8
generated-from-branch: main
generated-date: 2026-06-15
covers-paths:
  - services/flight-search/tests/**
  - services/stay-search/tests/**
  - services/poi-search/tests/**
last-verified-commit: fb591e56a801d12f33dd6e7ddbda7a9cb20df5ff
---

# Test di sviluppo

> Popolare leggendo la configurazione reale dei test. La checklist operativa locale dei test
> manuali vive invece in `_notes/TEST-CHECKLIST.md`, ignorata da git.

## Test runner e comandi

Il frontend (`public/`, `trips/<nome>/`) non ha test automatici: è Vanilla JS senza build step,
verificato finora solo manualmente in browser (screenshot dell'utente durante lo sviluppo).

I tre servizi backend usano `pytest`, ciascuno con la propria suite in `tests/` e il proprio
virtualenv (`.venv/`, gitignored). Comandi, identici per tutti e tre:

```bash
cd services/flight-search   # o services/stay-search, o services/poi-search
python -m venv .venv
.venv/Scripts/pip install -r requirements-test.txt   # .venv/bin/pip su Linux/macOS
.venv/Scripts/python -m pytest tests/ -v
```

`requirements-test.txt` (`-r requirements.txt` più `pytest`) è separato da `requirements.txt`
perché `pytest` non serve a far girare il servizio in produzione, solo a testarlo. Nessuna
copertura di codice misurata (`coverage.py` non introdotto): 42 test in totale (21 flight-search,
11 stay-search, 10 poi-search) al momento di scrivere, tutti unitari o di integrazione in-process
via `TestClient`, nessuno esegue chiamate di rete reali.

## Rotte e dati mockati

Nessun servizio mock: i test usano `monkeypatch` di pytest per sostituire le chiamate di rete con
funzioni finte che restituiscono payload dalla forma verificata reale (catturata durante lo
sviluppo con ricerche live vere, non inventata). Pattern usato in tutti e tre i servizi: gli
adapter vengono sostituiti a livello di modulo (`monkeypatch.setattr(main_module, "ADAPTERS",
[...])`) per i test dell'endpoint, e le funzioni di rete (`httpx.get`, `httpx.post`,
`pyairbnb.search.get`, ecc.) vengono sostituite direttamente per i test dei singoli adapter.
Questo tiene la suite veloce (l'intera suite dei tre servizi gira in meno di un secondo
complessivo) e deterministica, a costo di non rilevare se una fonte esterna reale cambia forma —
per quello serve una verifica manuale live, come già fatto per ogni adapter descritto nei
rispettivi README.

## Hook e controlli di qualità

Nessun lint, type-check o hook di pre-commit configurato in nessuna parte del repository, per
nessuno dei linguaggi coinvolti (JavaScript, Python). Nessuna CI configurata: i test si eseguono
solo manualmente, on demand.
