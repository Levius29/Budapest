// Dati del programma. Nessuna logica qui: solo contenuti (vedi docs/superpowers/specs/2026-11-03-allenamento-app-design.md)

export const PROFILO = {
  dati: [
    ['Sesso', 'Uomo'], ['Età', '34 anni'], ['Altezza', '175 cm'],
    ['Peso attuale', '96 kg'], ['Peso obiettivo', '77 kg'], ['Livello', 'Avanzato'],
    ['Frequenza', '4 giorni/sett'], ['Durata max', '120 min/seduta'],
  ],
  ipotesi: [
    'Grasso corporeo ~25-28% (non misurato)',
    'Passi attuali ~6.000/die',
    'Nessun cardio strutturato attuale',
    'Nessun esercizio da evitare',
    'FC max stimata 184 bpm (Tanaka: 208 − 0,7 × età)',
  ],
  aspettative: [
    'Ritmo sostenibile: −0,5/−1% del peso a settimana (≈ −0,5/−0,9 kg).',
    '8 settimane ≈ −5/−7 kg. I 19 kg richiedono ~5-7 mesi: questo è il blocco 1 di circa 3.',
    'Il target 77 kg va rivalutato quando conosci la % di grasso: con massa magra alta potrebbe essere troppo basso.',
  ],
};

export const MUSCOLI = {
  petto: 'Petto', dorso: 'Dorsali / alta schiena', deltLat: 'Deltoide laterale',
  deltAnt: 'Deltoide anteriore', deltPost: 'Deltoide posteriore', bicipiti: 'Bicipiti',
  tricipiti: 'Tricipiti', quadricipiti: 'Quadricipiti', femorali: 'Femorali',
  glutei: 'Glutei', polpacci: 'Polpacci', addome: 'Addome',
};

export const CATEGORIE = {
  main: { nome: 'Fondamentale', descr: '5-8 rip · forza' },
  comp: { nome: 'Complementare', descr: '6-12 rip' },
  iso: { nome: 'Isolamento', descr: '10-20 rip' },
};

export const SETTIMANE = [
  { n: 1, fase: 'Introduzione', rir: { main: '3', comp: '2-3', iso: '1-2' }, scarico: false, passi: 8000, nota: 'Trova i carichi, annota i top set. RIR alto di proposito.' },
  { n: 2, fase: 'Accumulo', rir: { main: '2', comp: '1-2', iso: '0-1' }, scarico: false, passi: 8000, nota: 'Inizia la doppia progressione.' },
  { n: 3, fase: 'Accumulo', rir: { main: '2', comp: '1-2', iso: '0-1' }, scarico: false, passi: 9000, nota: 'Entra l’HIIT (G4).' },
  { n: 4, fase: 'Accumulo', rir: { main: '2', comp: '1-2', iso: '0-1' }, scarico: false, passi: 10000, nota: 'Check-in intermedio. +1 serie a un gruppo carente solo se semaforo verde.' },
  { n: 5, fase: 'Intensificazione', rir: { main: '1-2', comp: '1', iso: '0' }, scarico: false, passi: 10000, nota: 'Ultima serie dei fondamentali a RIR 1 se la tecnica tiene.' },
  { n: 6, fase: 'Intensificazione', rir: { main: '1-2', comp: '1', iso: '0' }, scarico: false, passi: 10000, nota: '' },
  { n: 7, fase: 'Intensificazione', rir: { main: '1-2', comp: '1', iso: '0' }, scarico: false, passi: 10000, nota: 'Ultima settimana dura del blocco.' },
  { n: 8, fase: 'Scarico', rir: { main: '3-4', comp: '3', iso: '2' }, scarico: true, passi: 10000, nota: 'Serie ×0,6, carichi −10%, niente drop set/rest-pause. Check-in di fine blocco.' },
];

export const STRUTTURA = { riscGenerale: 5, riscSpecifico: 3, defaticamento: 5 };

export const GIORNI = [
  {
    id: 'g1', sigla: 'G1', nome: 'Lower A', focus: 'Quadricipiti + forza squat', giorno: 'Lunedì', tipo: 'lower',
    mobilita: 'Leg swing, hip airplane, tenuta in goblet squat',
    esercizi: [
      { ord: '1', nome: 'Squat con bilanciere', cat: 'main', serie: 3, rip: '5-7', rec: 180, riscSerie: 5,
        risc: 'Bilanciere×10 · 40%×6 · 60%×4 · 75%×2 · 85%×1',
        note: 'Profondità costante (almeno parallelo), bracing 360°, discesa 2-3", niente rimbalzo.',
        intens: null, alt: ['Hack squat', 'Smith squat', 'Pendulum squat'],
        muscoli: { quadricipiti: 1, glutei: 0.5 } },
      { ord: '2', nome: 'Leg press 45°', cat: 'comp', serie: 3, rip: '10-12', rec: 120, riscSerie: 1,
        risc: '1 serie ~60%×8',
        note: 'Piedi a media altezza, larghezza spalle. Scendi finché il bacino resta appoggiato, non bloccare le ginocchia.',
        intens: null, alt: ['Pressa orizzontale', 'Belt squat'],
        muscoli: { quadricipiti: 1, glutei: 0.5 } },
      { ord: '3', nome: 'Leg curl seduto', cat: 'iso', serie: 3, rip: '10-12', rec: 90, riscSerie: 0,
        note: 'Busto inclinato in avanti (femorali in allungamento), eccentrica 3".',
        intens: null, alt: ['Leg curl sdraiato'],
        muscoli: { femorali: 1 } },
      { ord: '4', nome: 'Leg extension', cat: 'iso', serie: 2, rip: '12-15', rec: 90, riscSerie: 0,
        note: 'Schienale reclinato, pausa 1" in contrazione.',
        intens: 'Drop set sull’ultima serie: −30% del carico, 1 drop a cedimento tecnico.',
        alt: ['Sissy squat assistito', 'Reverse Nordic'],
        muscoli: { quadricipiti: 1 } },
      { ord: '5', nome: 'Calf in piedi alla macchina', cat: 'iso', serie: 3, rip: '8-12', rec: 90, riscSerie: 0,
        note: 'Pausa 2" in allungamento, ROM completo, niente rimbalzi.',
        intens: null, alt: ['Calf alla leg press', 'Calf al Smith su step'],
        muscoli: { polpacci: 1 } },
      { ord: '6', nome: 'Crunch ai cavi in ginocchio', cat: 'iso', serie: 3, rip: '10-15', rec: 60, riscSerie: 0,
        note: 'Arrotola la colonna, bacino fermo, non tirare con le braccia.',
        intens: null, alt: ['Crunch alla macchina', 'Ab wheel'],
        muscoli: { addome: 1 } },
    ],
  },
  {
    id: 'g2', sigla: 'G2', nome: 'Upper A', focus: 'Spinta/tirata orizzontale + forza panca', giorno: 'Martedì', tipo: 'upper',
    mobilita: 'Band pull-apart, extrarotazioni con elastico, push-up scapolari',
    esercizi: [
      { ord: '1', nome: 'Panca piana con bilanciere', cat: 'main', serie: 3, rip: '5-7', rec: 180, riscSerie: 3,
        risc: '50%×8 · 70%×4 · 85%×2',
        note: 'Scapole addotte e depresse, piedi a terra, tocco al petto controllato, gomiti a 45-70°.',
        intens: null, alt: ['Panca piana al Smith', 'Chest press convergente', 'Panca piana con manubri'],
        muscoli: { petto: 1, tricipiti: 0.5, deltAnt: 0.5 } },
      { ord: '2', nome: 'Rematore T-bar con appoggio al petto', cat: 'comp', serie: 3, rip: '6-8', rec: 150, riscSerie: 1,
        risc: '1 serie ~60%×6',
        note: 'Petto sempre appoggiato, gomiti verso i fianchi, pausa 1", niente slancio.',
        intens: null, alt: ['Rematore Hammer', 'Rematore manubrio su panca', 'Rematore con bilanciere'],
        muscoli: { dorso: 1, bicipiti: 0.5, deltPost: 0.5 } },
      { ord: '3', nome: 'Panca inclinata con manubri 30°', cat: 'comp', serie: 3, rip: '8-10', rec: 120, riscSerie: 0,
        note: 'Panca a 30° (non 45°), allungamento completo in basso, i manubri non si toccano in alto.',
        intens: null, alt: ['Chest press inclinata', 'Panca inclinata al Smith'],
        muscoli: { petto: 1, deltAnt: 0.5, tricipiti: 0.5 } },
      { ord: '4', nome: 'Lat machine presa neutra stretta', cat: 'comp', serie: 3, rip: '8-12', rec: 120, riscSerie: 0,
        note: 'Petto in fuori, tira verso lo sterno, allungamento completo in alto, busto inclinato 10-15°.',
        intens: null, alt: ['Trazioni presa neutra', 'Lat machine unilaterale'],
        muscoli: { dorso: 1, bicipiti: 0.5 } },
      { ord: '5', nome: 'Alzate laterali al cavo unilaterali', cat: 'iso', serie: 3, rip: '12-15', rec: 60, riscSerie: 0,
        note: 'Cavo dietro il corpo all’altezza del polso, sali fino all’altezza della spalla, gomito leggermente flesso.',
        intens: 'Drop set sull’ultima serie: −30% del carico, 1 drop.',
        alt: ['Alzate laterali alla macchina', 'Alzate laterali con manubri'],
        muscoli: { deltLat: 1 } },
      { ord: '6a', nome: 'Curl con bilanciere EZ', cat: 'iso', serie: 3, rip: '8-12', rec: 0, riscSerie: 0, superset: 'b',
        note: 'Gomiti fermi, niente slancio, eccentrica 2".',
        intens: null, alt: ['Curl alla macchina', 'Curl al cavo'],
        muscoli: { bicipiti: 1 } },
      { ord: '6b', nome: 'Push-down al cavo con corda', cat: 'iso', serie: 3, rip: '10-15', rec: 90, riscSerie: 0, superset: 'a',
        note: 'Gomiti ai fianchi, apri la corda in fondo.',
        intens: null, alt: ['Push-down con barra a V', 'Dip machine'],
        muscoli: { tricipiti: 1 } },
    ],
  },
  {
    id: 'g3', sigla: 'G3', nome: 'Lower B', focus: 'Catena posteriore', giorno: 'Giovedì', tipo: 'lower',
    mobilita: 'Leg swing, hip hinge con bastone, ponte glutei a corpo libero',
    esercizi: [
      { ord: '1', nome: 'Stacco rumeno con bilanciere', cat: 'main', serie: 3, rip: '6-8', rec: 180, riscSerie: 4,
        risc: '40%×8 · 60%×5 · 75%×3 · 85%×1',
        note: 'Anca indietro, ginocchia leggermente flesse e ferme, bilanciere aderente alle cosce, schiena neutra. Scendi fino al massimo allungamento dei femorali (di solito metà tibia).',
        intens: null, alt: ['Stacco rumeno con manubri', 'Stacco rumeno al Smith', 'Good morning al Smith'],
        muscoli: { femorali: 1, glutei: 0.5 } },
      { ord: '2', nome: 'Hack squat', cat: 'comp', serie: 3, rip: '8-10', rec: 150, riscSerie: 2,
        risc: '2 serie: ~50%×8, ~70%×4',
        note: 'Piedi a metà pedana, discesa profonda 2-3", spingi con tutto il piede.',
        intens: null, alt: ['Pendulum squat', 'Leg press 45°', 'Smith squat'],
        muscoli: { quadricipiti: 1, glutei: 0.5 } },
      { ord: '3', nome: 'Hip thrust (macchina o bilanciere)', cat: 'comp', serie: 3, rip: '8-12', rec: 120, riscSerie: 0,
        note: 'Tibie verticali in alto, mento al petto, retroversione del bacino in chiusura, pausa 1".',
        intens: null, alt: ['Glute bridge al Smith', 'Kickback alla macchina glutei'],
        muscoli: { glutei: 1 } },
      { ord: '4', nome: 'Leg curl sdraiato', cat: 'iso', serie: 3, rip: '10-12', rec: 90, riscSerie: 0,
        note: 'Bacino schiacciato sulla panca, eccentrica 3".',
        intens: 'Rest-pause sull’ultima serie: +2 mini-serie con 15" di pausa.',
        alt: ['Leg curl seduto', 'Leg curl in piedi unilaterale'],
        muscoli: { femorali: 1 } },
      { ord: '5', nome: 'Calf seduto', cat: 'iso', serie: 3, rip: '12-15', rec: 60, riscSerie: 0,
        note: 'Pausa 2" in basso, ROM completo.',
        intens: null, alt: ['Calf alla leg press a ginocchia flesse'],
        muscoli: { polpacci: 1 } },
      { ord: '6', nome: 'Leg raise alla sbarra', cat: 'iso', serie: 3, rip: '10-15', rec: 60, riscSerie: 0,
        note: 'Retroversione del bacino in alto, niente oscillazioni.',
        intens: null, alt: ['Captain’s chair', 'Reverse crunch su panca'],
        muscoli: { addome: 1 } },
    ],
  },
  {
    id: 'g4', sigla: 'G4', nome: 'Upper B', focus: 'Verticale, spalle, braccia', giorno: 'Venerdì', tipo: 'upper',
    mobilita: 'Band pull-apart, dislocazioni con elastico, push-up scapolari',
    esercizi: [
      { ord: '1', nome: 'Trazioni presa prona', cat: 'main', serie: 3, rip: '6-8', rec: 150, riscSerie: 2,
        risc: '2 serie leggere di lat machine (×10, ×5)',
        note: 'Scapole depresse prima di tirare, petto verso la sbarra, discesa completa. Meno di 6 rip: assistite o lat machine pesante.',
        intens: 'Zavorra quando superi 8 ripetizioni pulite.',
        alt: ['Lat machine presa prona', 'Trazioni assistite alla macchina'],
        muscoli: { dorso: 1, bicipiti: 0.5 } },
      { ord: '2', nome: 'Panca inclinata al Smith 30°', cat: 'main', serie: 3, rip: '6-8', rec: 150, riscSerie: 2,
        risc: '50%×8 · 75%×3',
        note: 'Barra al petto alto, scapole addotte, gomiti sotto il bilanciere.',
        intens: null, alt: ['Panca inclinata con bilanciere', 'Chest press inclinata'],
        muscoli: { petto: 1, deltAnt: 0.5, tricipiti: 0.5 } },
      { ord: '3', nome: 'Pulley basso presa stretta', cat: 'comp', serie: 3, rip: '8-12', rec: 120, riscSerie: 0,
        note: 'Allungamento in avanti senza curvare la lombare, tira all’ombelico, pausa 1".',
        intens: null, alt: ['Rematore alla macchina', 'Rematore manubrio'],
        muscoli: { dorso: 1, bicipiti: 0.5, deltPost: 0.5 } },
      { ord: '4', nome: 'Shoulder press con manubri da seduto', cat: 'comp', serie: 3, rip: '8-10', rec: 120, riscSerie: 0,
        note: 'Schienale 80-85°, gomiti leggermente avanti, scendi all’altezza del mento.',
        intens: null, alt: ['Shoulder press alla macchina', 'Military press con bilanciere'],
        muscoli: { deltAnt: 1, deltLat: 0.5, tricipiti: 0.5 } },
      { ord: '5', nome: 'Croci ai cavi', cat: 'iso', serie: 2, rip: '12-15', rec: 90, riscSerie: 0,
        note: 'Braccia semi-flesse, enfasi sull’allungamento.',
        intens: 'Rest-pause sull’ultima serie: +2 mini-serie con 15" di pausa.',
        alt: ['Pectoral machine', 'Croci con manubri'],
        muscoli: { petto: 1 } },
      { ord: '6a', nome: 'Alzate laterali con manubri', cat: 'iso', serie: 3, rip: '12-20', rec: 0, riscSerie: 0, superset: 'b',
        note: 'Sali fino all’altezza della spalla, niente slancio.',
        intens: null, alt: ['Alzate laterali alla macchina'],
        muscoli: { deltLat: 1 } },
      { ord: '6b', nome: 'Reverse pec deck', cat: 'iso', serie: 3, rip: '15-20', rec: 60, riscSerie: 0, superset: 'a',
        note: 'Braccia quasi tese, movimento guidato dalle spalle e non dalle scapole.',
        intens: null, alt: ['Alzate posteriori al cavo', 'Face pull'],
        muscoli: { deltPost: 1 } },
      { ord: '7a', nome: 'Curl con manubri su panca inclinata', cat: 'iso', serie: 2, rip: '10-12', rec: 0, riscSerie: 0, superset: 'b',
        note: 'Spalle indietro, allungamento completo.',
        intens: null, alt: ['Bayesian curl al cavo'],
        muscoli: { bicipiti: 1 } },
      { ord: '7b', nome: 'French press con bilanciere EZ', cat: 'iso', serie: 2, rip: '10-12', rec: 90, riscSerie: 0, superset: 'a',
        note: 'Gomiti fermi, porta il bilanciere dietro la testa per allungare il capo lungo.',
        intens: null, alt: ['Estensioni sopra la testa al cavo'],
        muscoli: { tricipiti: 1 } },
    ],
  },
];

export const ZONE = {
  Z2: { nome: 'Zona 2', fc: '115-130 bpm', rpe: '3-4/10', descr: 'Riesci a parlare con frasi complete. Migliora la base aerobica e aumenta il dispendio senza togliere recupero.' },
  LISS: { nome: 'LISS', fc: '100-120 bpm', rpe: '2-3/10', descr: 'Camminata o ellittica leggera. Solo nei giorni di riposo, se non raggiungi i passi.' },
  HIIT: { nome: 'HIIT', fc: '>160 bpm a fine intervallo', rpe: 'lavoro 8-9 · recupero 2', descr: 'Negli intervalli da 30" la FC sale in ritardo: per l’HIIT conta l’RPE.' },
};

export const MACCHINE = {
  g1: { z2: 'Tapis roulant inclinato 8-12%, 4,5-5,5 km/h', alt: 'Ellittica' },
  g2: { z2: 'Tapis roulant inclinato o ellittica', alt: 'Cyclette' },
  g3: { z2: 'Tapis roulant inclinato 8-12%, 4,5-5,5 km/h', alt: 'Ellittica' },
  g4: { z2: 'Ellittica o tapis inclinato', alt: 'Cyclette', hiit: 'Bike da spinning o cyclette' },
};

const z2 = min => ({ tipo: 'Z2', min });
const hiit = (round, z2Min) => ({ tipo: 'HIIT', riscMin: 5, round, lavoro: 30, recupero: 90, z2Min });

export const CARDIO = {
  1: { g1: z2(15), g2: z2(30), g3: z2(15), g4: z2(30) },
  2: { g1: z2(15), g2: z2(30), g3: z2(15), g4: z2(30) },
  3: { g1: z2(20), g2: z2(35), g3: z2(20), g4: hiit(8, 10) },
  4: { g1: z2(20), g2: z2(35), g3: z2(20), g4: hiit(8, 10) },
  5: { g1: z2(20), g2: z2(40), g3: z2(20), g4: hiit(10, 10) },
  6: { g1: z2(25), g2: z2(40), g3: z2(25), g4: hiit(10, 10) },
  7: { g1: z2(30), g2: z2(40), g3: z2(30), g4: hiit(10, 10) },
  8: { g1: z2(15), g2: z2(30), g3: z2(15), g4: z2(30) },
};

export const CALENDARIO = [
  ['Lunedì', 'G1 · Lower A'], ['Martedì', 'G2 · Upper A'], ['Mercoledì', 'Riposo · passi + LISS facoltativo'],
  ['Giovedì', 'G3 · Lower B'], ['Venerdì', 'G4 · Upper B + HIIT'], ['Sabato', 'Riposo · passi + LISS facoltativo'],
  ['Domenica', 'Riposo · passi'],
];

export const PERCHE_SPLIT = [
  'Upper/Lower ×2: ogni muscolo stimolato 2 volte a settimana, il miglior compromesso per conservare massa in deficit.',
  'Gambe a inizio settimana: l’HIIT del venerdì è seguito da 2 giorni di riposo prima del Lower A.',
  'Lo Z2 del martedì ha un giorno di riposo prima del Lower B.',
  'Cardio sempre dopo i pesi: la qualità delle serie pesanti viene prima.',
];

export const PROGRESSIONE = [
  'Doppia progressione: quando tutte le serie arrivano al massimo del range al RIR previsto, aumenta il carico e riparti dal minimo del range.',
  'Incrementi: +2,5 kg sui fondamentali Upper, +5 kg sui fondamentali Lower, incremento minimo su complementari e isolamento.',
  'In deficit mantenere carichi e ripetizioni è già un buon risultato.',
  'Volume costante nelle settimane 1-7. Dalla 4 puoi aggiungere 1 serie a un gruppo carente solo con semaforo verde.',
  'Esercizi invariati per 8 settimane. Si cambiano solo per dolore o stallo che dura più di 3 settimane.',
  'Dopo la settimana 8: confronta i top set con la settimana 2. Il blocco 2 mantiene la struttura e cambia solo in base ai dati.',
];

export const SEMAFORO = [
  { liv: 'verde', titolo: 'Verde', quando: 'Sonno ≥7 h, prestazioni stabili o in crescita.', cosa: 'Segui la scheda.' },
  { liv: 'giallo', titolo: 'Giallo', quando: 'Sonno <6 h, molto indolenzimento, una seduta in calo.', cosa: '−1 serie su complementari e isolamento, RIR +1. HIIT → Z2 di pari durata, Z2 −25%.' },
  { liv: 'rosso', titolo: 'Rosso', quando: 'Calo per 2 sedute di fila su ≥2 fondamentali, stanchezza persistente o FC a riposo +5-7 bpm per una settimana.', cosa: 'Anticipa una settimana di scarico (protocollo sett. 8), poi riprendi dalla settimana interrotta.' },
];

export const TAGLIO_CARDIO = 'Se le gambe non recuperano, taglia prima l’HIIT, poi lo Z2 dei giorni Lower.';

export const GUIDA = [
  { titolo: 'Deficit calorico', testo: [
    'È la leva principale. Circa 500-750 kcal/die sotto il fabbisogno (20-25%) → −0,5/−0,9 kg a settimana.',
    'Stima iniziale indicativa: basale (Mifflin-St Jeor) ≈ 1.890 kcal, fabbisogno ≈ 2.900 kcal (×1,55), target ≈ 2.200-2.400 kcal. È solo un punto di partenza: va validato con 2 settimane di dati.',
  ] },
  { titolo: 'Proteine', testo: [
    '180-200 g/die (~1,9-2,1 g/kg del peso attuale), in 3-5 pasti da 30-50 g.',
    'Restano invariate anche quando tagli le calorie.',
  ] },
  { titolo: 'Allenamento con i pesi', testo: [
    'È il segnale che conserva il muscolo. Mantieni carichi e intensità; se serve, riduci il volume, non il carico.',
  ] },
  { titolo: 'Cardio', testo: [
    'Aumenta il dispendio ma è secondario rispetto al deficit. Va dosato per non togliere recupero alle gambe.',
  ] },
  { titolo: 'Passi', testo: [
    'Obiettivo 8.000 → 10.000/die. Il movimento quotidiano (NEAT) cala spontaneamente in dieta: monitoralo.',
  ] },
  { titolo: 'Sonno', testo: [
    '7-9 ore. Dormire poco in deficit aumenta la quota di massa magra persa.',
  ] },
  { titolo: 'Recupero', testo: [
    'Scarico ogni 8 settimane, gestione dello stress. Creatina monoidrato 3-5 g/die: facoltativa, con buone evidenze.',
  ] },
  { titolo: 'Come preservare la massa muscolare', testo: [
    'Deficit moderato, proteine alte, carichi pesanti mantenuti, sonno sufficiente, cardio dosato. Nessuno di questi da solo basta.',
  ] },
];

export const DATI_FABBISOGNO = [
  'Media del peso di 2 settimane',
  '% di grasso (plicometria, DEXA o BIA)',
  'Diario alimentare di 7-14 giorni (kcal e macro abituali)',
  'Passi medi',
  'Tipo di lavoro (in piedi o seduto, ore)',
  'Orari degli allenamenti',
  'Preferenze e restrizioni alimentari',
  'Esami del sangue recenti (facoltativi)',
];

export const MONITORAGGIO = [
  ['Peso', 'Ogni mattina', 'Dopo il bagno, a digiuno, stessa bilancia → media settimanale. Obiettivo −0,5/−1%/sett.'],
  ['Girovita', '1/sett', 'All’ombelico, a fine espirazione normale, stesso giorno e ora.'],
  ['Foto', 'Sett. 0, 2, 4, 6, 8', 'Fronte, lato, retro. Stessa luce, distanza e ora.'],
  ['Prestazioni', 'Ogni seduta', 'Top set di squat, panca, stacco rumeno, trazioni, panca inclinata Smith: carico × rip @ RIR.'],
  ['Passi', 'Media sett.', 'App Salute dell’iPhone.'],
  ['Cardio', 'Settimanale', 'Minuti totali, FC media, RPE.'],
  ['Sonno', 'Media sett.', 'Ore + qualità da 1 a 5.'],
  ['Recupero', 'Settimanale', 'Da 1 a 5 (indolenzimento, energia, motivazione). FC a riposo facoltativa.'],
];

export const STALLO = {
  definizione: 'Stallo = media settimanale invariata (±0,2 kg) per 2-3 settimane. Non contano la settimana di scarico né quella dopo un pasto molto abbondante o salato.',
  passi: [
    'Guarda girovita e foto: se il girovita scende e la forza tiene, non cambiare nulla per 1-2 settimane (ritenzione o ricomposizione).',
    'Controlla l’aderenza: calorie reali (condimenti, weekend, alcol), passi reali, sonno, stress.',
    'Se l’aderenza è buona e lo stallo dura ≥3 settimane, fai UNA sola modifica, in quest’ordine: 1) +2.000 passi/die; 2) −150-200 kcal/die da carboidrati o grassi (proteine invariate); 3) +1 sessione Z2 da 30’ in un giorno di riposo.',
    'Rivaluta dopo 2 settimane. Non sommare più modifiche insieme.',
    'Dopo 10-12 settimane di deficit continuo valuta 1-2 settimane a calorie di mantenimento (diet break).',
  ],
};

export const CHECKIN = `CHECK-IN SETTIMANA __
Peso medio: __ kg (sett. prec. __ kg)
Girovita: __ cm
Passi medi: __
Cardio totale: __ min · FC media __ · RPE __
Sonno: __ h · qualità __/5
Recupero: __/5 · Semaforo: verde / giallo / rosso
Top set:
- Squat: __ kg × __ @RIR __
- Panca piana: __ kg × __ @RIR __
- Stacco rumeno: __ kg × __ @RIR __
- Trazioni: __ kg × __ @RIR __
- Panca inclinata Smith: __ kg × __ @RIR __
Note:`;
