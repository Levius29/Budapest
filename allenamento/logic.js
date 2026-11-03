// Funzioni pure sul programma. Nessun accesso al DOM.
import { GIORNI, SETTIMANE, CARDIO, MUSCOLI, STRUTTURA } from './data.js';

const LAVORO_SERIE = 0.75; // minuti per serie allenante
const MIN_RISC_SERIE = 1.5; // minuti per serie di riscaldamento
const CAMBIO = 1; // minuti di cambio esercizio

export const settimana = n => SETTIMANE.find(s => s.n === n) ?? SETTIMANE[0];

export function serieSettimana(es, n) {
  return settimana(n).scarico ? Math.max(1, Math.round(es.serie * 0.6)) : es.serie;
}

export const rirSettimana = (es, n) => settimana(n).rir[es.cat];

export const intensificazioneAttiva = (es, n) => Boolean(es.intens) && !settimana(n).scarico;

export function minutiEsercizio(es, n) {
  return serieSettimana(es, n) * (LAVORO_SERIE + es.rec / 60) + (es.riscSerie || 0) * MIN_RISC_SERIE + CAMBIO;
}

export function minutiPesi(giorno, n) {
  return Math.round(giorno.esercizi.reduce((t, es) => t + minutiEsercizio(es, n), 0));
}

export function minutiCardio(c) {
  if (c.tipo === 'HIIT') return c.riscMin + (c.round * (c.lavoro + c.recupero)) / 60 + c.z2Min;
  return c.min;
}

export function durataSeduta(giorno, n) {
  const risc = STRUTTURA.riscGenerale + STRUTTURA.riscSpecifico;
  const pesi = minutiPesi(giorno, n);
  const cardio = minutiCardio(CARDIO[n][giorno.id]);
  const defat = STRUTTURA.defaticamento;
  return { risc, pesi, cardio, defat, totale: risc + pesi + cardio + defat };
}

export function volumeSettimanale(n) {
  const v = Object.fromEntries(Object.keys(MUSCOLI).map(m => [m, { diretto: 0, indiretto: 0, totale: 0 }]));
  for (const g of GIORNI) for (const es of g.esercizi) {
    const s = serieSettimana(es, n);
    for (const [m, peso] of Object.entries(es.muscoli)) {
      if (peso === 1) v[m].diretto += s; else v[m].indiretto += s * peso;
      v[m].totale += s * peso;
    }
  }
  return v;
}

export const cardioSettimana = n => GIORNI.reduce((t, g) => t + minutiCardio(CARDIO[n][g.id]), 0);

export function fmtTempo(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtRec(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}'${String(s).padStart(2, '0')}"` : `${m}'`;
}

// Fasi del timer HIIT: [{nome, sec, tipo}]
export function fasiHiit(c) {
  const fasi = [{ nome: 'Riscaldamento', sec: c.riscMin * 60, tipo: 'risc' }];
  for (let r = 1; r <= c.round; r++) {
    fasi.push({ nome: `Lavoro ${r}/${c.round}`, sec: c.lavoro, tipo: 'lavoro' });
    fasi.push({ nome: `Recupero ${r}/${c.round}`, sec: c.recupero, tipo: 'recupero' });
  }
  fasi.push({ nome: 'Zona 2', sec: c.z2Min * 60, tipo: 'z2' });
  return fasi;
}
