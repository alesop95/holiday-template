# Registro delle decisioni architetturali

> Convenzione ADR-lite, append-only. Ogni decisione architetturale non ovvia entra come voce
> numerata con data, stato, contesto, decisione, motivazione e conseguenze. Una decisione non si
> cancella e non si riscrive: quando viene superata, si aggiunge una nuova voce che dichiara di
> superare la precedente e ne cita il numero. Le inferenze non confermate si marcano come da
> verificare e si promuovono a decisione solo quando una fonte le conferma.

## ADR-001 — Adozione del sistema di progetto portabile

Data: 2026-06-15
Stato: accettata
Contesto: il progetto necessita di uno stato interamente recuperabile da un clone e di
documentazione che resti allineata al codice senza rilettura integrale a ogni sessione.
Decisione: adottare il sistema descritto in `.claude/PROJECT-SYSTEM.md`, con motore di
riconciliazione ancorato ai commit e doppio livello documentale tracciato/ignorato.
Motivazione: persistenza strutturale su disco indipendente dalla sessione di chat, e controllo
umano sul versionamento.
Conseguenze: ogni passo significativo aggiorna schede, `last-verified-commit`, snapshot e
work-log; commit e push restano manuali.

## ADR-002 — Sotto-cartella per viaggio invece di branch Git per viaggio

Data: 2026-07-06
Stato: accettata
Contesto: `handoff/README.md` (rimosso in questa sessione dopo la migrazione) proponeva un solo
`public/index.html` + `public/trip.config.js` condivisi, con un nuovo viaggio gestito come branch
Git separato dal branch `main`. Il progetto vuole invece poter avere più viaggi, passati e futuri,
visibili e navigabili insieme sullo stesso branch.
Decisione: ogni viaggio è una cartella autosufficiente sotto `trips/<nome>/`, con una propria
copia di shell (`index.html`), configurazione (`trip.config.js`) e hosting (`firebase.json`),
deployabile in modo indipendente dalle altre. `public/index.html` resta la shell canonica,
sorgente di verità da cui si copia, non un file importato a runtime dai viaggi.
Motivazione: coerenza con l'obiettivo di tenere lo storico di tutti i viaggi consultabile su disco
senza cambiare branch; ogni cartella resta deployabile per conto proprio.
Conseguenze: una correzione alla shell canonica non si propaga automaticamente ai viaggi già
creati — va ricopiata manualmente in ogni `trips/<nome>/index.html` che si vuole aggiornare.

## ADR-003 — Un solo progetto Firebase condiviso, dati Firestore namespaced per TRIP_ID

Data: 2026-07-06
Stato: accettata
Contesto: il modello originale (un progetto Firebase per viaggio, per non far collidere i
percorsi Firestore fissi `content/days` ecc. tra viaggi diversi) risolveva la collisione dei dati
ma richiede di creare un nuovo progetto Firebase su Console ad ogni nuovo viaggio, percepito come
un attrito operativo non necessario per un uso privato saltuario.
Decisione: un solo progetto Firebase (`viaggio-new`) serve tutti i viaggi, presenti e futuri.
`trip.config.js` guadagna l'export `TRIP_ID`; tutti i percorsi Firestore in `index.html` sono
namespaced come `trips/{TRIP_ID}/content/...` e `trips/{TRIP_ID}/state/...`. Questa è stata
l'unica modifica apportata a `index.html` per un motivo diverso da una correzione di bug: da qui
in avanti la shell torna a non cambiare mai tra un viaggio e l'altro.
Motivazione: elimina la creazione di un nuovo progetto Firebase (e delle relative credenziali)
ad ogni nuovo viaggio, al costo di condividere la stessa quota gratuita giornaliera di Firestore
tra tutti i viaggi — quota (50.000 letture/20.000 scritture al giorno) ampiamente sufficiente per
un uso privato di due persone anche con più viaggi attivi.
Conseguenze: le Firestore Security Rules permissive (`allow read, write: if true`, sezione 12 di
`README.md`) coprono l'intero albero `trips/**`, non un solo viaggio: chiunque conosca l'URL
pubblico può leggere/scrivere i dati di qualunque viaggio, passato o futuro, non solo di quello
in corso.

<!-- ADR-004 — <titolo>
Data: <YYYY-MM-DD>
Stato: <proposta / accettata / superata da ADR-NNN>
Contesto: ...
Decisione: ...
Motivazione: ...
Conseguenze: ... -->
