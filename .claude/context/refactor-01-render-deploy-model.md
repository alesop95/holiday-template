# Deep-dive 01 — Render: Blueprint, servizi, e il modello Manual Deploy / Auto-Deploy

> Corrisponde alla voce 1 di `studio-didattico-master.md`. Qui si entra nel file di
> configurazione reale e nella sequenza di eventi osservata dal vivo in questa sessione, non in
> un esempio astratto.

## Il Blueprint: quattro servizi indipendenti da un solo file

Render legge la configurazione dei servizi da `render.yaml`, alla radice del repository — un
*Render Blueprint*[^1]. Questo progetto ne descrive quattro, uno per ciascun backend sotto
`services/`:

```yaml
services:
  - type: web
    name: flight-search
    runtime: python
    rootDir: services/flight-search
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Tre campi fanno il lavoro concettuale. `rootDir` dice a Render da quale sottocartella del
repository partire per quel servizio specifico: senza questo campo, Render cercherebbe
`requirements.txt` alla radice del repository, dove non esiste, perché ogni servizio ha il
proprio file di dipendenze nella propria cartella. `buildCommand` è il comando eseguito una sola
volta a ogni deploy per preparare l'ambiente (qui, installare le dipendenze Python);
`startCommand` è il comando che resta in esecuzione a servire traffico. La variabile `$PORT` non
è definita da questo progetto: Render la inietta lei stessa a runtime (tipicamente `10000`), e il
servizio deve bindarsi a `0.0.0.0` su quella porta invece che su una porta fissa come nello
sviluppo locale (`8001`-`8004` per i quattro servizi in `uvicorn --reload`) — un dettaglio
verificato contro la documentazione ufficiale Render nella sessione dell'8 luglio, non assunto per
analogia con altri hosting.

I quattro servizi sono deliberatamente indipendenti: nessuno conosce l'esistenza degli altri se
non tramite URL passati come variabile d'ambiente. `trip-planner`, l'unico che orchestra gli
altri tre, li raggiunge così:

```yaml
  - type: web
    name: trip-planner
    rootDir: services/trip-planner
    envVars:
      - key: FLIGHT_SEARCH_URL
        sync: false   # dopo il deploy di flight-search: https://flight-search-xxxx.onrender.com
```

`sync: false` dichiara che quella variabile non ha un valore nel file: va impostata a mano da
Dashboard dopo che il servizio a cui punta ha già un URL pubblico assegnato — un ordine di
dipendenza reale (`trip-planner` non può sapere l'URL di `flight-search` prima che `flight-search`
esista) che il Blueprint non può risolvere da solo in un unico passaggio.

## Il piano free e il cold start

Ogni servizio è su `plan: free`. La conseguenza osservata dal vivo in sessione (non solo letta
sulla documentazione Render) è che un servizio inattivo per circa 15 minuti va in pausa e impiega
tra i 22 e i 56 secondi a ripartire alla richiesta successiva, prima ancora di eseguire il lavoro
vero (una ricerca con scraping reale). Questo è il motivo per cui `trip-planner` chiama gli altri
tre con un timeout di 90 secondi per tentativo (`services/trip-planner/app/main.py`, funzione
`_fetch`) invece dei 30 secondi iniziali: un timeout troppo stretto scambia un servizio che si
sta ancora svegliando per un servizio rotto.

## La sequenza di eventi che ha generato la domanda

Il 9 luglio, dentro questa stessa sessione, sono successe tre cose in un ordine preciso, ricostruibili
dagli screenshot e dai comandi eseguiti.

Prima: un fix a `services/flight-search/requirements.txt` (la riga `fast-flights>=2.2` sostituita
con `fast-flights==3.0.2`, per fissare la libreria alla versione verificata funzionante in
locale) è stato scritto sul filesystem locale, ma non ancora committato — `git status` in quel
momento mostrava il file come modificato (`M services/flight-search/requirements.txt`), non
come parte di alcun commit.

Seconda: l'utente ha aperto la Dashboard Render e cliccato "Manual Deploy" sul servizio
`trip-planner`. Lo screenshot di quel momento mostra il pannello di build in corso, con
l'etichetta del commit di riferimento ancora `061e73e` — "Zone turistiche note per aeroporti
leisure, con chip cliccabili" — cioè il commit *precedente* a quello del fix. Questo non è un
comportamento anomalo di Render: è la conferma diretta che "Manual Deploy" ha ricostruito
esattamente il codice già presente su GitHub, perché non ce n'era altro a disposizione — il fix
viveva ancora solo sul disco locale, invisibile a Render.

Terza, dopo `git add`, `git commit` e `git push` dei tre file toccati dal fix (il file dei
requirement e i due `index.html` con le altre modifiche di sessione): il nuovo commit
`77b89cf` ("Fissa fast-flights a 3.0.2, fonte/link prenotazione voli, accordion risultati") è
arrivato su `origin/main`. Senza alcun clic da parte dell'utente, la Dashboard ha mostrato un
nuovo deploy del servizio `flight-search-pfcn` con l'etichetta "New commit via Auto-Deploy": il
comportamento predefinito di un servizio Render collegato a un branch, che ricostruisce da solo
ogni volta che quel branch riceve un push.

Il confronto fra il secondo e il terzo evento è la lezione concreta: stesso tipo di azione
("un deploy parte"), causa radicalmente diversa. Nel secondo caso la causa è stata un clic umano
perché non esisteva altro trigger disponibile (nessun commit nuovo); nel terzo caso la causa è
stata il push stesso, e il clic non è mai avvenuto.

## Come estendere il pattern

Quando in futuro un deploy sembra "non contenere" una modifica appena fatta, la domanda da porsi
prima di qualunque altra ipotesi è: quella modifica è già su `origin/main`? Un controllo rapido e
sempre disponibile è confrontare l'hash mostrato nel pannello Render (sezione Events, o la riga
sotto il nome del servizio nella pagina principale) con l'output locale di `git log -1
--format=%H` dopo un `git push` riuscito. Se i due hash non coincidono, non serve indagare altro
sul lato Render: il codice da deployare non è ancora arrivato lì. Vale anche il contrario, utile
quando un servizio sembra "non essersi accorto" di un push: si controlla se per quel servizio
specifico l'Auto-Deploy è attivo (Dashboard → Settings del servizio → Build & Deploy), perché
Render permette di disattivarlo servizio per servizio, nel qual caso ogni push richiede sempre un
Manual Deploy esplicito.

[^1]: *Render Blueprint* — file `render.yaml` che descrive dichiarativamente uno o più servizi
Render (Web Service, database, e altro); collegando un repository che lo contiene, Render propone
di creare tutti i servizi descritti in un solo passaggio invece di configurarli uno per uno da
interfaccia.
