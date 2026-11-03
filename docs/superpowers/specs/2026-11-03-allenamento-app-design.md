# App "Allenamento" — Design

Data: 2026-11-03 · Stato: in revisione

## 1. Scopo

Web app per iPhone (Aggiungi a Home, offline) che contiene un programma di 8 settimane per dimagrimento con conservazione della massa muscolare. Uso: consultazione in palestra + timer recupero + timer HIIT. Nessun diario dati.

**Utente (dati forniti):** uomo, 34 anni, 175 cm, 96 kg → obiettivo 77 kg, avanzato, nessuna limitazione, 4 giorni/sett, max 120'/seduta, palestra completa.

**Ipotesi (dati non forniti, mostrate nell'app):** grasso ~25-28%, ~6.000 passi/die, nessun cardio attuale, nessun esercizio da evitare, FCmax stimata 184 bpm (Tanaka: 208 − 0,7 × età).

**Aspettative realistiche:** 0,5-1% peso/sett → 8 settimane ≈ −5/−7 kg. 19 kg ≈ 5-7 mesi = ~3 blocchi. Target 77 kg da rivalutare quando sarà nota la % di grasso.

## 2. Architettura

- Cartella `allenamento/` servita da GitHub Pages (`main`): `https://levius29.github.io/Budapest/allenamento/`.
- File:
  - `index.html` — markup + CSS, font di sistema (nessuna risorsa esterna).
  - `data.js` — modulo ES, solo dati del programma (giorni, esercizi, settimane, cardio, guida).
  - `logic.js` — modulo ES, funzioni pure: serie per settimana, RIR per settimana, durata seduta, volume settimanale. Nessun DOM.
  - `app.js` — modulo ES, render e timer (DOM).
  - `sw.js` — service worker cache-first, cache versionata.
  - `manifest.webmanifest`, `icon-180.png`, `icon-512.png`.
- `tests/allenamento.test.mjs` — `node --test`, importa `data.js` e `logic.js`.
- localStorage solo per: settimana selezionata, ultima scheda aperta, preferenza "schermo acceso". Ogni accesso in try/catch.
- Pubblicazione: merge del branch in `main` (azione dell'utente).

## 3. Interfaccia

- Tema scuro, ottimizzato iPhone (safe-area, tap target ≥44 px).
- Header: titolo + selettore settimana (◀ Sett N ▶) + fase della settimana.
- Barra in basso, 4 sezioni: **Giorni · Cardio · Piano · Guida**.
- **Giorni:** selettore G1-G4. Per il giorno: fasi con minuti (riscaldamento generale, specifico, pesi, cardio, defaticamento, totale). Poi una card per esercizio con i 7 campi richiesti (Ordine, Esercizio, Serie, Ripetizioni, Recupero, RIR, Note tecniche), i valori di Serie e RIR calcolati per la settimana selezionata. Tocco sulla card → dettagli: serie di riscaldamento, tecnica di intensificazione, alternative, muscoli. Superset marcati (6a/6b).
- **Timer recupero:** tocco sul recupero → countdown in barra fissa in basso; ±15", stop. Basato su timestamp (corretto dopo blocco schermo). Fine: 3 beep (WebAudio, sbloccato al tocco) + flash schermo + `navigator.vibrate` se disponibile. A schermo bloccato non suona (limite iOS).
- **Schermo acceso:** interruttore che usa Screen Wake Lock API se disponibile; altrimenti nascosto.
- **Cardio:** tabella delle 8 settimane + dettaglio del giorno (macchina, minuti, FC, RPE, momento). Nei giorni HIIT: timer a intervalli (riscaldamento 5' → N × lavoro 30"/recupero 90") con beep e countdown 3-2-1.
- **Piano:** tabella delle 8 settimane (fase, RIR, serie, cardio), regole di progressione, gestione fatica, volume settimanale calcolato da `logic.js`.
- **Guida:** strategia dimagrimento, dati necessari per il fabbisogno, monitoraggio, gestione stallo, ipotesi. Modello check-in con pulsante "Copia" (per incollarlo in Note).

## 4. Programma

### 4.1 Split e calendario

Upper/Lower ×2: ogni gruppo muscolare 2 volte a settimana, volume distribuito, recupero gestibile in deficit.

| Giorno | Seduta | Focus |
|---|---|---|
| Lunedì | G1 Lower A | Quadricipiti + forza squat |
| Martedì | G2 Upper A | Spinta/tirata orizzontale + forza panca |
| Mercoledì | Riposo | Passi + LISS facoltativo |
| Giovedì | G3 Lower B | Catena posteriore |
| Venerdì | G4 Upper B | Spinta/tirata verticale, spalle, braccia + HIIT |
| Sabato | Riposo | Passi + LISS facoltativo |
| Domenica | Riposo | Passi |

Motivo dell'ordine: l'HIIT (venerdì) è seguito da 2 giorni di riposo prima delle gambe; lo Z2 del martedì è seguito da un giorno di riposo prima di Lower B.

### 4.2 Categorie di esercizio e intensità

- **Fondamentale (main):** 5-8 rip, recupero 2'30"-3', RIR 2. Serve a mantenere la forza.
- **Complementare (comp):** 6-12 rip, recupero 2'-2'30", RIR 1-2.
- **Isolamento (iso):** 10-20 rip, recupero 1'-1'30", RIR 0-1.
- Il RIR effettivo varia per settimana (§4.8).
- Serie di riscaldamento separate dalle serie allenanti, indicate in % del carico di lavoro.

### 4.3 Struttura seduta

1. Riscaldamento generale: 5' cyclette o ellittica, RPE 3.
2. Riscaldamento specifico: 3' di mobilità + serie di avvicinamento sul primo esercizio (tempo incluso nei pesi).
3. Pesi: ~58-65'.
4. Cardio: 15-40' (§4.9).
5. Defaticamento: 5' di camminata lenta + respirazione.

Mobilità per Lower: leg swing, hip airplane, tenuta in goblet squat. Per Upper: band pull-apart, rotazioni esterne con elastico, push-up scapolari.

### 4.4 G1 — Lower A (quadricipiti)

| # | Esercizio | Cat | Serie | Rip | Rec | Intens. | Note tecniche | Alternative |
|---|---|---|---|---|---|---|---|---|
| 1 | Squat con bilanciere | main | 3 | 5-7 | 3' | — | Riscaldamento: bilanciere×10, 40%×6, 60%×4, 75%×2, 85%×1. Profondità costante (almeno parallelo), respirazione e contrazione addominale 360°, discesa 2-3", nessun rimbalzo. | Hack squat, Smith squat, Pendulum squat |
| 2 | Leg press 45° | comp | 3 | 10-12 | 2' | — | 1 serie di avvicinamento. Piedi a media altezza larghezza spalle, scendi finché il bacino resta appoggiato, non bloccare le ginocchia. | Pressa orizzontale, Belt squat |
| 3 | Leg curl seduto | iso | 3 | 10-12 | 1'30" | — | Busto inclinato in avanti (femorali in allungamento), eccentrica 3". | Leg curl sdraiato |
| 4 | Leg extension | iso | 2 | 12-15 | 1'30" | Drop set ultima serie (−30%, 1 drop) | Schienale reclinato, pausa 1" in contrazione. | Sissy squat assistito, Reverse Nordic |
| 5 | Calf in piedi alla macchina | iso | 3 | 8-12 | 1'30" | — | Pausa 2" in allungamento, escursione completa, niente rimbalzi. | Calf alla leg press, Calf Smith su step |
| 6 | Crunch ai cavi in ginocchio | iso | 3 | 10-15 | 1' | — | Arrotola la colonna, bacino fermo, non tirare con le braccia. | Crunch alla macchina, Ab wheel |

### 4.5 G2 — Upper A (orizzontale)

| # | Esercizio | Cat | Serie | Rip | Rec | Intens. | Note tecniche | Alternative |
|---|---|---|---|---|---|---|---|---|
| 1 | Panca piana con bilanciere | main | 3 | 5-7 | 3' | — | Riscaldamento: 50%×8, 70%×4, 85%×2. Scapole addotte e depresse, piedi a terra, tocco al petto controllato, gomiti a 45-70°. | Panca piana Smith, Chest press convergente, Panca piana con manubri |
| 2 | Rematore T-bar con appoggio al petto | comp | 3 | 6-8 | 2'30" | — | 1 serie di avvicinamento. Petto sempre appoggiato, gomiti verso i fianchi, pausa 1", niente slancio. | Rematore Hammer, Rematore manubrio su panca, Rematore con bilanciere |
| 3 | Panca inclinata con manubri 30° | comp | 3 | 8-10 | 2' | — | Panca a 30° (non 45°), allungamento completo in basso, i manubri non si toccano in alto. | Chest press inclinata, Panca inclinata Smith |
| 4 | Lat machine presa neutra stretta | comp | 3 | 8-12 | 2' | — | Petto in fuori, tira verso lo sterno, allungamento completo in alto, busto inclinato di 10-15°. | Trazioni presa neutra, Lat machine unilaterale |
| 5 | Alzate laterali al cavo unilaterali | iso | 3 | 12-15 | 1' | Drop set ultima serie (−30%, 1 drop) | Cavo dietro il corpo all'altezza del polso, sali fino all'altezza della spalla, gomito leggermente flesso. | Alzate laterali alla macchina, Alzate laterali con manubri |
| 6a | Curl con bilanciere EZ | iso | 3 | 8-12 | — | Superset con 6b | Gomiti fermi, niente slancio, eccentrica 2". | Curl alla macchina, Curl al cavo |
| 6b | Push-down al cavo con corda | iso | 3 | 10-15 | 1'30" dopo la coppia | Superset con 6a | Gomiti ai fianchi, apri la corda in fondo. | Push-down barra a V, Dip machine |

### 4.6 G3 — Lower B (catena posteriore)

| # | Esercizio | Cat | Serie | Rip | Rec | Intens. | Note tecniche | Alternative |
|---|---|---|---|---|---|---|---|---|
| 1 | Stacco rumeno con bilanciere | main | 3 | 6-8 | 3' | — | Riscaldamento: 40%×8, 60%×5, 75%×3, 85%×1. Anca indietro, ginocchia leggermente flesse e ferme, bilanciere aderente alle cosce, schiena neutra, scendi fino al massimo allungamento dei femorali (di solito metà tibia). | Stacco rumeno con manubri, Stacco rumeno Smith, Good morning Smith |
| 2 | Hack squat | comp | 3 | 8-10 | 2'30" | — | 2 serie di avvicinamento. Piedi a metà pedana, discesa profonda 2-3", spingi con tutto il piede. | Pendulum squat, Leg press 45°, Smith squat |
| 3 | Hip thrust (macchina o bilanciere) | comp | 3 | 8-12 | 2' | — | Tibie verticali in alto, mento al petto, retroversione del bacino in chiusura, pausa 1". | Glute bridge Smith, Kickback alla macchina per glutei |
| 4 | Leg curl sdraiato | iso | 3 | 10-12 | 1'30" | Rest-pause ultima serie (+2 mini-serie, pausa 15") | Bacino schiacciato sulla panca, eccentrica 3". | Leg curl seduto, Leg curl in piedi unilaterale |
| 5 | Calf seduto | iso | 3 | 12-15 | 1' | — | Pausa 2" in basso, escursione completa. | Calf alla leg press a ginocchia flesse |
| 6 | Leg raise alla sbarra | iso | 3 | 10-15 | 1' | — | Retroversione del bacino in alto, niente oscillazioni. | Captain's chair, Reverse crunch su panca |

### 4.7 G4 — Upper B (verticale, spalle, braccia)

| # | Esercizio | Cat | Serie | Rip | Rec | Intens. | Note tecniche | Alternative |
|---|---|---|---|---|---|---|---|---|
| 1 | Trazioni presa prona | main | 3 | 6-8 | 2'30" | Zavorra se fai più di 8 rip | Riscaldamento: 2 serie leggere di lat machine. Scapole depresse prima di tirare, petto verso la sbarra, discesa completa. Se fai meno di 6 rip: assistite o lat machine pesante. | Lat machine presa prona, Trazioni assistite alla macchina |
| 2 | Panca inclinata Smith 30° | main | 3 | 6-8 | 2'30" | — | Riscaldamento: 50%×8, 75%×3. Barra al petto alto, scapole addotte. | Panca inclinata con bilanciere, Chest press inclinata |
| 3 | Pulley basso presa stretta | comp | 3 | 8-12 | 2' | — | Allungamento in avanti senza curvare la zona lombare, tira all'ombelico, pausa 1". | Rematore alla macchina, Rematore manubrio |
| 4 | Shoulder press con manubri da seduto | comp | 3 | 8-10 | 2' | — | Schienale a 80-85°, gomiti leggermente avanti, scendi all'altezza del mento. | Shoulder press alla macchina, Military press con bilanciere |
| 5 | Croci ai cavi | iso | 2 | 12-15 | 1'30" | Rest-pause ultima serie (+2 mini-serie, pausa 15") | Braccia semi-flesse, enfasi sull'allungamento. | Pectoral machine, Croci con manubri |
| 6a | Alzate laterali con manubri | iso | 3 | 12-20 | — | Superset con 6b | Sali fino all'altezza della spalla, niente slancio. | Alzate laterali alla macchina |
| 6b | Reverse pec deck | iso | 3 | 15-20 | 1' dopo la coppia | Superset con 6a | Braccia quasi tese, movimento guidato dalle spalle e non dalle scapole. | Alzate posteriori al cavo, Face pull |
| 7a | Curl con manubri su panca inclinata | iso | 2 | 10-12 | — | Superset con 7b | Spalle indietro, allungamento completo. | Bayesian curl al cavo |
| 7b | French press con bilanciere EZ | iso | 2 | 10-12 | 1'30" dopo la coppia | Superset con 7a | Gomiti fermi, porta il bilanciere dietro la testa per allungare il capo lungo. | Estensioni sopra la testa al cavo |

### 4.8 Le 8 settimane

| Sett | Fase | RIR main / comp / iso | Serie | Note |
|---|---|---|---|---|
| 1 | Introduzione | 3 / 2-3 / 1-2 | come da scheda | Trova i carichi e annota i top set |
| 2 | Accumulo | 2 / 1-2 / 0-1 | come da scheda | Inizia la doppia progressione |
| 3 | Accumulo | 2 / 1-2 / 0-1 | come da scheda | Entra l'HIIT |
| 4 | Accumulo | 2 / 1-2 / 0-1 | come da scheda | Check-in intermedio |
| 5 | Intensificazione | 1-2 / 1 / 0 | come da scheda | |
| 6 | Intensificazione | 1-2 / 1 / 0 | come da scheda | |
| 7 | Intensificazione | 1-2 / 1 / 0 | come da scheda | Ultima settimana dura |
| 8 | Scarico | 3-4 / 3 / 2 | ×0,6 arrotondato (3→2, 2→1) | Carichi −10%, niente drop set o rest-pause, check-in del blocco |

**Doppia progressione:**
- Quando tutte le serie arrivano al massimo del range di ripetizioni al RIR previsto → aumenta il carico.
- Aumento: +2,5 kg per i fondamentali Upper, +5 kg per i fondamentali Lower, incremento minimo per complementari e isolamento. Poi riparti dal minimo del range.
- In deficit, mantenere carichi e ripetizioni è già un buon risultato.

**Volume:** costante nelle settimane 1-7. Dalla settimana 4, +1 serie a un gruppo carente solo se lo stato di recupero è "verde".

**Esercizi:** invariati per tutte le 8 settimane. Si cambiano solo per dolore o stallo che dura più di 3 settimane.

**Gestione della fatica (semaforo):**
- **Verde** (sonno ≥7 h, prestazioni stabili o in crescita): si segue la scheda.
- **Giallo** (sonno <6 h, molto indolenzimento, una seduta in calo): −1 serie su complementari e isolamento, RIR +1, HIIT sostituito da Z2 di pari durata, Z2 −25%.
- **Rosso** (calo per 2 sedute consecutive su almeno 2 fondamentali, oppure stanchezza persistente, oppure FC a riposo +5-7 bpm per una settimana): anticipa una settimana di scarico (protocollo della settimana 8), poi riprendi dalla settimana interrotta.
- **Priorità di taglio del cardio:** prima l'HIIT, poi lo Z2 dei giorni Lower.

**Dopo la settimana 8:** confronta i top set con la settimana 2 e fai il check-in. Il blocco 2 mantiene la struttura, con modifiche solo in base ai dati.

### 4.9 Cardio

**Zone:**
- FCmax stimata: 184 bpm.
- Zona 2: 115-130 bpm (RPE 3-4, riesci a parlare con frasi complete).
- LISS: 100-120 bpm (RPE 2-3).
- HIIT: lavoro a RPE 8-9, FC sopra 160 bpm a fine intervallo; recupero pedalando a RPE 2.
- In intervalli da 30" la FC sale in ritardo: per l'HIIT conta l'RPE.

**Quando e dove:**
- Il cardio si fa sempre dopo i pesi, per non compromettere le prestazioni.
- Giorni Lower: tapis roulant inclinato 8-12%, 4,5-5,5 km/h (poca fase eccentrica, poco impatto sul recupero delle gambe). Alternativa: ellittica.
- G2: tapis inclinato o ellittica.
- G4: HIIT su bike da spinning o cyclette (poca componente eccentrica), poi Z2 su ellittica o tapis.

| Sett | G1 Lower A | G2 Upper A | G3 Lower B | G4 Upper B | Totale |
|---|---|---|---|---|---|
| 1 | Z2 15' | Z2 30' | Z2 15' | Z2 30' | 90' |
| 2 | Z2 15' | Z2 30' | Z2 15' | Z2 30' | 90' |
| 3 | Z2 20' | Z2 35' | Z2 20' | HIIT 5' + 8×(30"/90") + Z2 10' = 31' | 106' |
| 4 | Z2 20' | Z2 35' | Z2 20' | come settimana 3 = 31' | 106' |
| 5 | Z2 20' | Z2 40' | Z2 20' | HIIT 5' + 10×(30"/90") + Z2 10' = 35' | 115' |
| 6 | Z2 25' | Z2 40' | Z2 25' | come settimana 5 = 35' | 125' |
| 7 | Z2 30' | Z2 40' | Z2 30' | come settimana 5 = 35' | 135' |
| 8 | Z2 15' | Z2 30' | Z2 15' | Z2 30' | 90' |

**Giorni di riposo:**
- Passi: 8.000 nelle settimane 1-2, 9.000 nella settimana 3, poi 10.000 dalla settimana 4.
- LISS facoltativo di 30-45' solo se non raggiungi i passi.
- Fuori dal conteggio dei minuti di cardio.

**Durata delle sedute:**
- Riscaldamento 8' + pesi + cardio + defaticamento 5'.
- Vincolo: ≤120' in ogni settimana; verificato da test.
- Stime con la formula §4.10: pesi G1 ≈ 58', G2 ≈ 65', G3 ≈ 62', G4 ≈ 69'.
- Massimi: G2 nelle settimane 5-7 = 8 + 65 + 40 + 5 = 118'; G4 nelle settimane 5-7 = 8 + 69 + 35 + 5 = 117'.

### 4.10 Durata stimata dei pesi (usata da `logic.js`)

Per ogni esercizio: `serie × (0,75' lavoro + recupero) + serie di riscaldamento × 1,5' + 1' di cambio esercizio`.

I superset contano il lavoro di entrambi gli esercizi e un solo recupero per coppia.

### 4.11 Volume settimanale (serie allenanti)

Diretto = 1, indiretto = 0,5. Calcolato da `logic.js` usando i muscoli associati a ogni esercizio.

| Muscolo | Diretto | Indiretto | Totale |
|---|---|---|---|
| Petto | 11 (panca piana 3, panca inclinata manubri 3, panca inclinata Smith 3, croci 2) | — | 11 |
| Dorsali / parte alta della schiena | 12 (T-bar 3, lat machine 3, trazioni 3, pulley 3) | — | 12 |
| Deltoide laterale | 6 | shoulder press 3×0,5 | 7,5 |
| Deltoide anteriore | 3 | panche 9×0,5 | 7,5 |
| Deltoide posteriore | 3 | T-bar + pulley 6×0,5 | 6 |
| Bicipiti | 5 | tirate 12×0,5 | 11 |
| Tricipiti | 5 | spinte 12×0,5 | 11 |
| Quadricipiti | 11 (squat 3, leg press 3, leg extension 2, hack squat 3) | — | 11 |
| Femorali | 9 (leg curl 3+3, stacco rumeno 3) | — | 9 |
| Glutei | 3 | squat, leg press, hack squat, stacco rumeno 12×0,5 | 9 |
| Polpacci | 6 | — | 6 |
| Addome | 6 | — | 6 |

Il test confronta i totali calcolati con questa tabella.

## 5. Guida al dimagrimento (contenuto)

**Deficit calorico:**
- Il deficit è la leva principale: circa 500-750 kcal/die (20-25% sotto il fabbisogno) → −0,5/−0,9 kg a settimana.
- Stima iniziale indicativa: metabolismo basale Mifflin-St Jeor ≈ 1.890 kcal, fabbisogno ≈ 2.900 kcal (fattore 1,55), quindi target ≈ 2.200-2.400 kcal.
- È una stima approssimativa, da validare con 2 settimane di dati.

**Proteine:**
- 180-200 g/die (~1,9-2,1 g/kg del peso attuale).
- 3-5 pasti da 30-50 g.
- Restano invariate anche quando si tagliano le calorie.

**Allenamento con i pesi:**
- È il segnale che conserva il muscolo.
- Si mantengono carichi e intensità; in caso di fatica si riduce il volume, non il carico.

**Cardio:**
- Aumenta il dispendio, ma è secondario rispetto al deficit.
- Va dosato per non togliere recupero alle gambe.

**Passi:**
- Obiettivo 8.000-10.000/die.
- Il movimento quotidiano (NEAT) tende a calare durante la dieta: va monitorato.

**Sonno:** 7-9 h. Dormire poco in deficit aumenta la quota di massa magra persa.

**Recupero:**
- Scarico ogni 8 settimane.
- Gestione dello stress.
- Creatina monoidrato 3-5 g/die (facoltativa, con buone evidenze).

**Dati necessari per calcolare il fabbisogno:**
- Media del peso di 2 settimane.
- % di grasso (plicometria, DEXA o BIA).
- Diario alimentare di 7-14 giorni (kcal e macro abituali).
- Passi medi.
- Tipo di lavoro (in piedi o seduto, ore).
- Orari degli allenamenti.
- Preferenze e restrizioni alimentari.
- Esami del sangue recenti (facoltativi).

## 6. Monitoraggio

| Parametro | Frequenza | Come |
|---|---|---|
| Peso | ogni mattina | Dopo il bagno, a digiuno, stessa bilancia → media settimanale. Obiettivo −0,5/−1%/sett |
| Circonferenza addominale | 1/sett | All'ombelico, a fine espirazione normale, stesso giorno e ora |
| Foto | settimane 0, 2, 4, 6, 8 | Fronte, lato, retro; stessa luce, distanza e ora |
| Prestazioni | ogni seduta | Top set di squat, panca, stacco rumeno, trazioni, panca inclinata Smith: carico × rip @ RIR |
| Passi | media settimanale | App Salute dell'iPhone |
| Cardio | settimanale | Minuti totali, FC media, RPE |
| Sonno | media settimanale | Ore + qualità da 1 a 5 |
| Recupero | settimanale | Da 1 a 5 (indolenzimento, energia, motivazione); FC a riposo facoltativa |

### Stallo

Stallo = media settimanale invariata (±0,2 kg) per 2-3 settimane. Non si conta la settimana di scarico né quella dopo un pasto molto abbondante o salato.

1. Guarda girovita e foto: se il girovita scende e la forza tiene, non cambiare nulla per 1-2 settimane (ritenzione idrica o ricomposizione).
2. Controlla l'aderenza: calorie reali (condimenti, weekend, alcol), passi reali, sonno, stress.
3. Se l'aderenza è buona e lo stallo dura ≥3 settimane, fai **una sola** modifica, in quest'ordine:
   1. +2.000 passi/die;
   2. −150-200 kcal/die (da carboidrati o grassi, proteine invariate);
   3. +1 sessione Z2 da 30' in un giorno di riposo.
4. Rivaluta dopo 2 settimane. Non sommare più modifiche insieme.
5. Dopo 10-12 settimane di deficit continuo, valuta 1-2 settimane a calorie di mantenimento (diet break).

Il modello di check-in (copiabile) contiene: settimana, peso medio, girovita, passi medi, minuti di cardio, sonno (ore e qualità), recupero (1-5), top set, note.

## 7. Verifica

- `node --test tests/`:
  - campi obbligatori di ogni esercizio;
  - durata ≤120' per ogni giorno in ogni settimana;
  - volume calcolato = tabella §4.11;
  - serie dello scarico (3→2, 2→1);
  - totali del cardio = tabella §4.9.
- Playwright a viewport iPhone (390×844): screenshot di ogni sezione, nessuno scroll orizzontale, timer di recupero e HIIT che avanzano, service worker registrato e pagina che si ricarica offline.

## 8. Fuori ambito

Diario dei carichi, grafici, sincronizzazione, notifiche push, dieta dettagliata, app nativa.
