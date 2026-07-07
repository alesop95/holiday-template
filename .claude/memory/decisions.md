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

## ADR-004 — Regole Firestore distribuite via CLI da un firebase.json di radice, non generate dalla Console

Data: 2026-07-06
Stato: accettata
Contesto: creando il database Firestore da Console, l'utente ha scelto "modalità di test" per lo
step delle regole (necessario per avere subito lettura/scrittura funzionanti). La modalità di
test della Console genera però una regola con una scadenza automatica di 30 giorni incorporata
nel testo della regola stessa, che richiederebbe di tornare manualmente su Console prima della
scadenza per sostituirla con una versione permanente — un promemoria ricorrente da non
dimenticare, che l'utente ha chiesto di eliminare invece di gestire.
Decisione: le regole permissive già previste (`allow read, write: if true`, invariate nel
contenuto) sono state scritte in `firestore.rules` (radice del repository, tracciato in Git) e
distribuite una tantum con `firebase deploy --only firestore:rules`, usando un `firebase.json` di
radice dedicato (chiave `"firestore"` soltanto, nessuna `"hosting"`) e un `.firebaserc` di radice
(gitignored) che punta allo stesso progetto condiviso `viaggio-new`.
Motivazione: una regola distribuita via CLI non porta la condizione di scadenza che la Console
inserisce automaticamente nella modalità di test; il problema dei 30 giorni si elimina alla radice
invece di essere rimandato con un promemoria.
Conseguenze: eventuali modifiche future alle regole (es. restringerle con Firebase Authentication)
vanno fatte editando `firestore.rules` e rilanciando lo stesso comando di deploy, non dalla
Console — la Console resta comunque utilizzabile per ispezionare le regole attive, solo non è più
la fonte di verità del loro contenuto.

## ADR-005 — Incidente: apiKey Firebase esposta pubblicamente, rimedio con restrizione + bonifica storia

Data: 2026-07-07
Stato: accettata
Contesto: GitHub Secret Scanning ha segnalato un "Google API Key" in `trips/cilento-2026/trip.config.js`
(la `FIREBASE_CONFIG.apiKey` reale, introdotta nel commit poi rinominato `8f3d1c3` dopo la
riscrittura). Il repository `alesop95/holiday-template` è pubblico (verificato via API GitHub, non
assunto). Sebbene una `apiKey` Firebase non sia un segreto nel senso classico — l'accesso ai dati è
governato dalle Firestore Security Rules, non dalla segretezza della chiave (vedi
`design-and-security.md`) — il rischio reale di una chiave Google esposta e non ristretta è l'abuso
su altre API del progetto Cloud, non l'accesso ai dati Firestore.
Decisione: due azioni indipendenti, non una sola. Primo, la chiave è stata ristretta su Google
Cloud Console (progetto `viaggio-new`): referrer HTTP limitati a `viaggio-new.web.app` e
`viaggio-new.firebaseapp.com`, API accessibili ridotte da 25 a 4 (Cloud Firestore API, Identity
Toolkit API, Token Service API, Firebase Installations API) — questo è il rimedio che neutralizza
il rischio reale. Secondo, la storia Git è stata riscritta con `git filter-repo --replace-text`
(dopo un backup completo via `git bundle`) per rimuovere le ripetizioni della stringa dai commit
precedenti, poi la chiave (stessa stringa, ora ristretta) è stata reintrodotta in un nuovo commit
perché l'app deve comunque poterla leggere per funzionare, e forzato il push (`git push --force`,
eseguito dall'utente, non dall'agente, come da vincolo del progetto sulle operazioni git manuali).
Motivazione: riscrivere solo la storia, senza restringere la chiave su Cloud Console, non avrebbe
ridotto il rischio reale (la chiave sarebbe comunque rimasta nel commit corrente, necessariamente);
restringere la chiave senza bonificare la storia avrebbe lasciato ripetuta la stessa stringa in piu'
commit passati, superfluo ma non necessario dopo la restrizione. Fatte entrambe perché l'utente ha
chiesto esplicitamente sia la pulizia della storia sia la restrizione, e sono complementari, non
alternative.
Conseguenze: ogni clone locale del repository precedente al force-push ha una storia ora
incompatibile (i vecchi hash dei commit dal punto della riscrittura in poi non esistono più); non
risultano altri clone noti. Verificato dopo il force-push, con un fetch indipendente e non fidandosi
del solo output incollato dall'utente, che `origin/main` riflette la storia riscritta e che la
vecchia stringa della chiave non ricorre più in nessun punto della storia remota tranne
nell'unico commit finale che la reintroduce (atteso e corretto). Backup pre-riscrittura conservato
in locale (`git bundle`, fuori dal repository), non versionato.
