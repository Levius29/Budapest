import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GIORNI, SETTIMANE, CARDIO, MUSCOLI } from '../allenamento/data.js';
import {
  serieSettimana, rirSettimana, minutiPesi, minutiCardio,
  durataSeduta, volumeSettimanale, intensificazioneAttiva,
} from '../allenamento/logic.js';

const tutti = GIORNI.flatMap(g => g.esercizi);

test('4 giorni, 8 settimane, cardio per ogni settimana e giorno', () => {
  assert.equal(GIORNI.length, 4);
  assert.equal(SETTIMANE.length, 8);
  for (const s of SETTIMANE) for (const g of GIORNI) assert.ok(CARDIO[s.n][g.id], `cardio s${s.n} ${g.id}`);
});

test('ogni esercizio ha i campi obbligatori', () => {
  for (const e of tutti) {
    assert.ok(e.ord && e.nome && e.note && e.rip, e.nome);
    assert.ok(['main', 'comp', 'iso'].includes(e.cat), e.nome);
    assert.ok(Number.isInteger(e.serie) && e.serie > 0, e.nome);
    assert.ok(Number.isFinite(e.rec) && e.rec >= 0, e.nome);
    assert.ok(Array.isArray(e.alt) && e.alt.length >= 1, e.nome);
    assert.ok(Object.values(e.muscoli).includes(1), e.nome);
    for (const m of Object.keys(e.muscoli)) assert.ok(MUSCOLI[m], `${e.nome}: ${m}`);
  }
});

test('scarico: serie x0.6 arrotondate (3->2, 2->1), niente intensificazioni', () => {
  const tre = tutti.find(e => e.serie === 3), due = tutti.find(e => e.serie === 2);
  assert.equal(serieSettimana(tre, 2), 3);
  assert.equal(serieSettimana(tre, 8), 2);
  assert.equal(serieSettimana(due, 8), 1);
  const conInt = tutti.find(e => e.intens);
  assert.equal(intensificazioneAttiva(conInt, 5), true);
  assert.equal(intensificazioneAttiva(conInt, 8), false);
});

test('RIR per settimana e categoria', () => {
  const main = tutti.find(e => e.cat === 'main'), iso = tutti.find(e => e.cat === 'iso');
  assert.equal(rirSettimana(main, 1), '3');
  assert.equal(rirSettimana(main, 2), '2');
  assert.equal(rirSettimana(main, 5), '1-2');
  assert.equal(rirSettimana(iso, 8), '2');
});

test('minuti pesi stimati come da spec (G1 58, G2 65, G3 62, G4 69)', () => {
  assert.deepEqual(GIORNI.map(g => minutiPesi(g, 2)), [58, 65, 62, 69]);
});

test('minuti cardio per settimana = tabella spec', () => {
  const tot = SETTIMANE.map(s => GIORNI.reduce((a, g) => a + minutiCardio(CARDIO[s.n][g.id]), 0));
  assert.deepEqual(tot, [90, 90, 106, 106, 115, 125, 135, 90]);
});

test('ogni seduta <= 120 minuti in ogni settimana', () => {
  for (const s of SETTIMANE) for (const g of GIORNI) {
    const d = durataSeduta(g, s.n);
    assert.ok(d.totale <= 120, `s${s.n} ${g.id}: ${d.totale}'`);
  }
  assert.equal(durataSeduta(GIORNI[1], 7).totale, 118);
  assert.equal(durataSeduta(GIORNI[3], 7).totale, 117);
});

test('volume settimanale = tabella spec 4.11', () => {
  const v = volumeSettimanale(2);
  const atteso = { petto: 11, dorso: 12, deltLat: 7.5, deltAnt: 7.5, deltPost: 6, bicipiti: 11,
    tricipiti: 11, quadricipiti: 11, femorali: 9, glutei: 9, polpacci: 6, addome: 6 };
  for (const [m, t] of Object.entries(atteso)) assert.equal(v[m].totale, t, m);
});
