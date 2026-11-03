import * as D from './data.js';
import * as L from './logic.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, Number(v) || a));

// ── preferenze locali (solo comodità: l'app funziona anche senza) ──
const store = {
  get(k, d) { try { const v = localStorage.getItem('allen.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('allen.' + k, JSON.stringify(v)); } catch { /* storage non disponibile */ } },
};

const OGGI = { 1: 'g1', 2: 'g2', 4: 'g3', 5: 'g4' }[new Date().getDay()];
const TABS = ['giorni', 'cardio', 'piano', 'guida'];
const state = {
  sett: clamp(store.get('sett', 1), 1, 8),
  tab: TABS.includes(store.get('tab')) ? store.get('tab') : 'giorni',
  giorno: OGGI || store.get('giorno', 'g1'),
};
if (!D.GIORNI.some(g => g.id === state.giorno)) state.giorno = 'g1';

// ── audio ──
let ac;
function audio() {
  try {
    if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); }
    if (ac && ac.state === 'suspended') ac.resume();
  } catch { /* audio non disponibile */ }
  return ac;
}
function beep(freq = 880, dur = 0.15, when = 0) {
  if (!ac) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function segnale(volte = 3, freq = 1046) {
  for (let i = 0; i < volte; i++) beep(freq, 0.18, i * 0.28);
  try { navigator.vibrate?.([200, 100, 200]); } catch { /* */ }
  document.body.classList.remove('flash'); void document.body.offsetWidth; document.body.classList.add('flash');
}

// ── timer recupero ──
const rest = { fine: 0, durata: 0, iv: null, finito: false, chiudi: null };
function avviaRecupero(sec, nome) {
  audio();
  Object.assign(rest, { fine: Date.now() + sec * 1000, durata: sec, finito: false });
  clearTimeout(rest.chiudi);
  $('#t-nome').textContent = `Recupero · ${nome}`;
  const el = $('#timer'); el.hidden = false; el.classList.remove('done');
  clearInterval(rest.iv); rest.iv = setInterval(tickRecupero, 200); tickRecupero();
}
function tickRecupero() {
  const left = (rest.fine - Date.now()) / 1000;
  $('#t-tempo').textContent = L.fmtTempo(left);
  $('#t-prog').style.width = `${Math.min(100, 100 * (1 - left / rest.durata))}%`;
  if (left <= 0 && !rest.finito) {
    rest.finito = true; clearInterval(rest.iv);
    $('#timer').classList.add('done'); $('#t-tempo').textContent = 'Via!';
    segnale();
    rest.chiudi = setTimeout(chiudiRecupero, 20000);
  }
}
function chiudiRecupero() { clearInterval(rest.iv); clearTimeout(rest.chiudi); $('#timer').hidden = true; }
function regolaRecupero(delta) {
  if (rest.finito) { if (delta > 0) avviaRecupero(delta, $('#t-nome').textContent.replace('Recupero · ', '')); return; }
  rest.fine += delta * 1000; rest.durata = Math.max(1, rest.durata + delta); tickRecupero();
}

// ── timer HIIT (basato sul tempo trascorso: resta corretto dopo il blocco schermo) ──
const hiit = { cfg: null, fasi: [], tot: 0, t0: null, acc: 0, iv: null, fase: -1, ultimoBeep: null };
function hiitPrepara(cfg) {
  if (hiit.cfg === cfg) return;
  clearInterval(hiit.iv);
  const fasi = L.fasiHiit(cfg);
  Object.assign(hiit, { cfg, fasi, tot: fasi.reduce((t, f) => t + f.sec, 0), t0: null, acc: 0, iv: null, fase: -1, ultimoBeep: null });
}
const hiitTrascorso = () => hiit.acc + (hiit.t0 ? (Date.now() - hiit.t0) / 1000 : 0);
function hiitStato() {
  const el = hiitTrascorso(); let cum = 0;
  for (let i = 0; i < hiit.fasi.length; i++) {
    if (el < cum + hiit.fasi[i].sec) return { i, left: cum + hiit.fasi[i].sec - el, el };
    cum += hiit.fasi[i].sec;
  }
  return { i: hiit.fasi.length, left: 0, el: hiit.tot };
}
function hiitStart() {
  audio();
  if (hiitStato().i >= hiit.fasi.length) { hiit.acc = 0; hiit.fase = -1; }
  hiit.t0 = Date.now(); clearInterval(hiit.iv); hiit.iv = setInterval(hiitTick, 200); hiitTick();
}
function hiitPausa() { hiit.acc = hiitTrascorso(); hiit.t0 = null; clearInterval(hiit.iv); hiitTick(); }
function hiitReset() { clearInterval(hiit.iv); Object.assign(hiit, { t0: null, acc: 0, fase: -1, ultimoBeep: null }); hiitTick(); }
function hiitSalta() {
  const s = hiitStato(); if (s.i >= hiit.fasi.length) return;
  hiit.acc = hiitTrascorso() + s.left + 0.01; if (hiit.t0) hiit.t0 = Date.now(); hiitTick();
}
function hiitTick() {
  if (!hiit.fasi.length) return;
  const s = hiitStato(), fine = s.i >= hiit.fasi.length, f = hiit.fasi[s.i];
  if (hiit.t0 && s.i !== hiit.fase) {
    if (hiit.fase !== -1 || s.i > 0) {
      if (fine) segnale(4, 1318);
      else if (f.tipo === 'lavoro') { beep(1318, 0.35); beep(1318, 0.35, 0.4); }
      else beep(784, 0.5);
    }
    hiit.fase = s.i;
  }
  if (hiit.t0 && !fine && f.tipo !== 'z2') {
    const sec = Math.ceil(s.left);
    if (sec <= 3 && sec >= 1 && hiit.ultimoBeep !== `${s.i}-${sec}`) { hiit.ultimoBeep = `${s.i}-${sec}`; beep(880, 0.12); }
  }
  if (fine && hiit.t0) { hiit.acc = hiit.tot; hiit.t0 = null; clearInterval(hiit.iv); }
  const box = $('#hiit'); if (!box) return; // suoni anche se sei su un'altra sezione
  box.className = `card hiit ${fine ? '' : f.tipo}`;
  $('#h-ph').textContent = fine ? (hiit.acc ? 'Finito' : 'Pronto') : f.nome;
  $('#h-big').textContent = fine ? (hiit.acc ? '✓' : L.fmtTempo(hiit.fasi[0].sec)) : L.fmtTempo(s.left);
  if (!hiit.t0 && hiit.acc === 0) { $('#h-ph').textContent = 'Pronto'; $('#h-big').textContent = L.fmtTempo(hiit.fasi[0].sec); box.className = 'card hiit'; }
  const prossima = hiit.fasi[s.i + 1];
  $('#h-sub').textContent = fine ? `Totale ${Math.round(hiit.tot / 60)}'` : prossima ? `Poi: ${prossima.nome} · ${L.fmtTempo(prossima.sec)}` : 'Ultima fase';
  $('#h-prog').style.width = `${(100 * s.el) / hiit.tot}%`;
  $('#h-go').textContent = hiit.t0 ? 'Pausa' : hiit.acc && !fine ? 'Riprendi' : fine && hiit.acc ? 'Ricomincia' : 'Avvia';
  $('#h-go').dataset.h = hiit.t0 ? 'pausa' : 'start';
}

// ── schermo sempre acceso ──
let wl = null, wakeOn = store.get('wake', false);
async function applicaWake() {
  try {
    if (wakeOn && document.visibilityState === 'visible') {
      if (!wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); }
    } else if (wl) { await wl.release(); wl = null; }
  } catch { wl = null; }
  $('#wake').classList.toggle('on', wakeOn);
  $('#wake').setAttribute('aria-pressed', String(wakeOn));
}

// ── viste ──
const fasiRiscaldamento = g => [
  ['Riscaldamento generale', `${D.STRUTTURA.riscGenerale}'`, 'Cyclette o ellittica, RPE 3'],
  ['Riscaldamento specifico', `${D.STRUTTURA.riscSpecifico}'`, `${g.mobilita}. Le serie di avvicinamento sono nel tempo dei pesi.`],
];

function cardioTesto(c, gid) {
  const m = D.MACCHINE[gid];
  if (c.tipo === 'HIIT') return {
    titolo: `HIIT ${c.round}×(${c.lavoro}"/${c.recupero}") + Z2 ${c.z2Min}'`,
    dett: `${m.hiit}: ${c.riscMin}' di riscaldamento, ${c.round} intervalli da ${c.lavoro}" a RPE 8-9 con ${c.recupero}" di pedalata facile. Poi Z2 ${c.z2Min}' su ${m.z2.toLowerCase()}.`,
    fc: `Lavoro ${D.ZONE.HIIT.fc} · Z2 ${D.ZONE.Z2.fc}`,
  };
  return { titolo: `Zona 2 · ${c.min}'`, dett: `${m.z2} (alt. ${m.alt.toLowerCase()}).`, fc: `${D.ZONE.Z2.fc} · RPE ${D.ZONE.Z2.rpe}` };
}

function cardEsercizio(es) {
  const n = state.sett, serie = L.serieSettimana(es, n), rir = L.rirSettimana(es, n), scarico = L.settimana(n).scarico;
  const nome = `${es.ord} ${es.nome}`;
  const rec = es.rec
    ? `<button class="cell rec" data-rec="${es.rec}" data-nome="${esc(nome)}" aria-label="Avvia recupero ${esc(L.fmtRec(es.rec))}"><small>Recupero</small><b>${L.fmtRec(es.rec)} <span class="play">▶</span></b></button>`
    : `<div class="cell"><small>Recupero</small><b class="muted">→ ${esc(es.ord.replace('a', 'b'))}</b></div>`;
  const prim = Object.entries(es.muscoli).filter(([, p]) => p === 1).map(([m]) => D.MUSCOLI[m]).join(', ');
  const sec = Object.entries(es.muscoli).filter(([, p]) => p < 1).map(([m]) => D.MUSCOLI[m]).join(', ');
  const int = es.intens ? `<p class="int ${scarico ? 'off' : ''}">⚡ ${esc(es.intens)}${scarico ? ' (sospesa in scarico)' : ''}</p>` : '';
  return `<article class="ex ${es.cat}">
    <div class="ex-h"><span class="ord">${esc(es.ord)}</span><div><h3>${esc(es.nome)}</h3><span class="chip">${D.CATEGORIE[es.cat].nome}</span></div></div>
    <div class="grid4">
      <div class="cell"><small>Serie</small><b>${serie}${serie !== es.serie ? ` <small class="muted">/${es.serie}</small>` : ''}</b></div>
      <div class="cell"><small>Ripetizioni</small><b>${esc(es.rip)}</b></div>
      ${rec}
      <div class="cell"><small>RIR</small><b>${esc(rir)}</b></div>
    </div>
    <p class="note">${esc(es.note)}</p>${int}
    <details><summary>Riscaldamento · alternative · muscoli</summary><dl class="det">
      <div><dt>Serie di riscaldamento (non allenanti)</dt><dd>${es.riscSerie ? esc(es.risc) : 'Nessuna: il lavoro precedente basta.'}</dd></div>
      <div><dt>Alternative</dt><dd>${es.alt.map(esc).join(' · ')}</dd></div>
      <div><dt>Muscoli</dt><dd>${esc(prim)}${sec ? ` <span class="muted">· secondari: ${esc(sec)}</span>` : ''}</dd></div>
    </dl></details>
  </article>`;
}

function vistaGiorni() {
  const n = state.sett, g = D.GIORNI.find(x => x.id === state.giorno), s = L.settimana(n);
  const d = L.durataSeduta(g, n), c = D.CARDIO[n][g.id], ct = cardioTesto(c, g.id);
  let esercizi = '';
  for (let i = 0; i < g.esercizi.length; i++) {
    const es = g.esercizi[i];
    if (/a$/.test(es.ord) && es.superset) {
      const b = g.esercizi[++i];
      esercizi += `<div class="ss"><div class="ss-l">Superset ${esc(es.ord)} + ${esc(b.ord)} · nessuna pausa tra i due</div>${cardEsercizio(es)}${cardEsercizio(b)}</div>`;
    } else esercizi += cardEsercizio(es);
  }
  const fasi = [...fasiRiscaldamento(g),
    ['Pesi', `~${d.pesi}'`, `${g.esercizi.length} esercizi · RIR settimana ${n}: fondamentali ${s.rir.main}, complementari ${s.rir.comp}, isolamento ${s.rir.iso}`],
    ['Cardio', `${Math.round(d.cardio)}'`, `${ct.titolo} · dopo i pesi`],
    ['Defaticamento', `${D.STRUTTURA.defaticamento}'`, 'Camminata lenta + respirazione'],
  ];
  return `
  <div class="seg" role="tablist">${D.GIORNI.map(x => `<button role="tab" aria-selected="${x.id === g.id}" class="${x.id === g.id ? 'on' : ''}" data-giorno="${x.id}"><b>${x.sigla}</b><small>${x.nome}</small></button>`).join('')}</div>
  <div class="dayhead"><h2>${g.sigla} · ${g.nome}</h2><p class="muted">${esc(g.focus)} · ${g.giorno}</p></div>
  ${s.scarico ? `<div class="banner">Settimana di scarico: serie ridotte, carichi −10%, RIR più alto, niente drop set o rest-pause.</div>` : s.nota ? `<div class="banner info">${esc(s.nota)}</div>` : ''}
  <section><div class="sec-t">Struttura seduta</div><div class="card"><ul class="phases">
    ${fasi.map(([t, m, sub]) => `<li><span>${t}</span><b>${m}</b><small>${esc(sub)}</small></li>`).join('')}
    <li class="tot"><span>Totale stimato</span><b>~${Math.round(d.totale)}'</b></li>
  </ul></div></section>
  <section><div class="sec-t">Pesi · tocca il recupero per avviare il timer</div>${esercizi}</section>
  <section><div class="sec-t">Cardio · dopo i pesi</div><div class="card"><h3>${esc(ct.titolo)}</h3><p class="note" style="margin-top:4px">${esc(ct.dett)}</p><p class="muted" style="font-size:14px;margin-top:4px">${esc(ct.fc)}</p>
    <button class="link" data-tab="cardio">${c.tipo === 'HIIT' ? 'Apri timer HIIT' : 'Dettagli cardio'} →</button></div></section>
  <section><div class="sec-t">Defaticamento</div><div class="card"><p class="note">${D.STRUTTURA.defaticamento}' di camminata lenta sul tapis (o gli ultimi minuti del cardio a intensità minima), respirazione nasale lenta. Stretching facoltativo.</p></div></section>`;
}

function vistaCardio() {
  const n = state.sett, s = L.settimana(n), cg4 = D.CARDIO[n].g4;
  const giorni = D.GIORNI.map(g => {
    const c = D.CARDIO[n][g.id], ct = cardioTesto(c, g.id);
    return `<div class="card cd ${g.id === OGGI ? 'today' : ''}"><span class="ord">${g.sigla}</span><div><h3>${g.nome}</h3><small class="muted">${g.giorno} · dopo i pesi</small></div>
      <div class="min">${Math.round(L.minutiCardio(c))}<small>'</small></div>
      <p><span class="tag ${c.tipo === 'HIIT' ? 'hiit' : 'z2'}">${c.tipo === 'HIIT' ? 'HIIT' : 'Z2'}</span> ${esc(ct.dett)}</p><p class="muted">${esc(ct.fc)}</p></div>`;
  }).join('');
  let hiitBox;
  if (cg4.tipo === 'HIIT') {
    hiitPrepara(cg4);
    hiitBox = `<div class="card hiit" id="hiit"><div class="ph" id="h-ph">Pronto</div><div class="big num" id="h-big">5:00</div><div class="sub" id="h-sub"></div>
      <div class="prog"><i id="h-prog"></i></div>
      <div class="btns"><button class="btn" data-h="reset">Reset</button><button class="btn pri" id="h-go" data-h="start">Avvia</button><button class="btn" data-h="salta">Salta</button></div></div>
      <p class="muted" style="font-size:13px;margin-top:8px">Beep a 3-2-1 secondi dalla fine di ogni fase. Con l’iPhone in silenzioso o a schermo bloccato il suono può non arrivare: tieni lo schermo acceso (☀︎ in alto).</p>`;
  } else {
    hiitBox = `<div class="card"><p class="note">${s.scarico ? 'Settimana di scarico: niente HIIT, solo Z2.' : 'L’HIIT entra dalla settimana 3 (G4). Nelle settimane 1-2 si costruisce la base aerobica con lo Z2.'}</p></div>`;
  }
  const tab = D.SETTIMANE.map(w => `<tr class="${w.n === n ? 'cur' : ''}" data-week="${w.n}"><td><b>${w.n}</b></td>${D.GIORNI.map(g => { const c = D.CARDIO[w.n][g.id]; return `<td>${c.tipo === 'HIIT' ? `<span class="tag hiit">H</span> ` : ''}${Math.round(L.minutiCardio(c))}'</td>`; }).join('')}<td class="r"><b>${L.cardioSettimana(w.n)}'</b></td></tr>`).join('');
  return `
  <div class="dayhead"><h2>Cardio · settimana ${n}</h2><p class="muted">Totale ${L.cardioSettimana(n)}' + passi ${s.passi.toLocaleString('it-IT')}/die</p></div>
  <section>${giorni}</section>
  <section><div class="sec-t">Timer HIIT · G4</div>${hiitBox}</section>
  <section><div class="sec-t">Zone (FC max stimata 184 bpm)</div>${Object.values(D.ZONE).map(z => `<div class="card zone"><h3>${z.nome}</h3><b>${z.fc}</b><p>RPE ${z.rpe}. ${esc(z.descr)}</p></div>`).join('')}</section>
  <section><div class="sec-t">Progressione 8 settimane (minuti)</div><div class="card"><table class="tbl tight"><thead><tr><th>Sett</th>${D.GIORNI.map(g => `<th>${g.sigla}</th>`).join('')}<th class="r">Tot</th></tr></thead><tbody>${tab}</tbody></table>
    <p class="muted" style="font-size:13px;margin-top:8px"><span class="tag hiit">H</span> = HIIT 5' + intervalli 30"/90" + Z2. Tocca una riga per cambiare settimana.</p></div></section>
  <section><div class="sec-t">Perché così</div><div class="card"><ul class="list">
    <li>Cardio sempre dopo i pesi: le serie pesanti vengono prima.</li>
    <li>Giorni Lower: camminata inclinata, poca fase eccentrica → non toglie recupero alle gambe.</li>
    <li>HIIT in bici il venerdì: seguono 2 giorni di riposo prima delle gambe.</li>
    <li>${esc(D.TAGLIO_CARDIO)}</li></ul></div></section>
  <section><div class="sec-t">Giorni di riposo</div><div class="card"><ul class="list">
    <li>Passi: <b>${s.passi.toLocaleString('it-IT')}</b>/die questa settimana (8.000 → 10.000 dalla settimana 4).</li>
    <li>LISS facoltativo 30-45' (${D.ZONE.LISS.fc}) solo se non arrivi ai passi. Non conta nei minuti di cardio.</li></ul></div></section>`;
}

function vistaPiano() {
  const n = state.sett, v = L.volumeSettimanale(n);
  const righe = D.SETTIMANE.map(w => `<tr class="${w.n === n ? 'cur' : ''}" data-week="${w.n}"><td><b>${w.n}</b></td><td>${w.fase}</td><td class="num">${w.rir.main} / ${w.rir.comp} / ${w.rir.iso}</td><td class="r num">${L.cardioSettimana(w.n)}'</td></tr>`).join('');
  const max = Math.max(14, ...Object.values(v).map(x => x.totale));
  const vol = Object.entries(D.MUSCOLI).map(([k, nome]) => `<span>${nome}</span><b>${v[k].totale}</b><div class="bar"><i style="width:${(100 * v[k].diretto) / max}%"></i><i style="width:${(100 * v[k].indiretto) / max}%"></i></div>`).join('');
  return `
  <div class="dayhead"><h2>Piano 8 settimane</h2><p class="muted">Upper/Lower ×2 · struttura stabile, progressione misurabile</p></div>
  <section><div class="sec-t">Calendario</div><div class="card"><table class="tbl">${D.CALENDARIO.map(([d, t]) => `<tr><td class="muted">${d}</td><td>${t}</td></tr>`).join('')}</table></div>
    <div class="card"><ul class="list">${D.PERCHE_SPLIT.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div></section>
  <section><div class="sec-t">Settimane · RIR fond. / compl. / isol.</div><div class="card"><table class="tbl"><thead><tr><th>Sett</th><th>Fase</th><th>RIR</th><th class="r">Cardio</th></tr></thead><tbody>${righe}</tbody></table>
    <p class="muted" style="font-size:13px;margin-top:8px">Settimana 8: serie ×0,6 (3→2, 2→1), carichi −10%. Tocca una riga per cambiare settimana.</p></div></section>
  <section><div class="sec-t">Intensità per categoria</div><div class="card"><ul class="list">
    <li><b style="color:var(--main)">Fondamentale</b>: 5-8 rip, recupero 2'30"-3'. Serve a mantenere la forza.</li>
    <li><b style="color:var(--comp)">Complementare</b>: 6-12 rip, recupero 2'-2'30".</li>
    <li><b style="color:var(--iso)">Isolamento</b>: 10-20 rip, recupero 1'-1'30". Qui stanno drop set e rest-pause.</li>
    <li>Riscaldamento: 5' generale + 3' mobilità; le serie di avvicinamento sono nel dettaglio di ogni esercizio e non contano come allenanti.</li></ul></div></section>
  <section><div class="sec-t">Progressione</div><div class="card"><ul class="list">${D.PROGRESSIONE.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div></section>
  <section><div class="sec-t">Stanchezza o calo: semaforo</div>${D.SEMAFORO.map(x => `<div class="card sem ${x.liv}"><h3>${x.titolo}</h3><p class="muted">${esc(x.quando)}</p><p>${esc(x.cosa)}</p></div>`).join('')}
    <div class="card"><p class="note">${esc(D.TAGLIO_CARDIO)}</p></div></section>
  <section><div class="sec-t">Volume settimanale · settimana ${n}</div><div class="card"><div class="leg"><span>diretto</span><span>indiretto ×0,5</span></div><div class="vol">${vol}</div></div></section>`;
}

function vistaGuida() {
  return `
  <div class="dayhead"><h2>Guida</h2><p class="muted">Dimagrimento, monitoraggio, stallo</p></div>
  <section><div class="sec-t">Profilo</div><div class="card"><div class="kv">${D.PROFILO.dati.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div></div>
    <div class="card"><h3 style="margin-bottom:8px">Ipotesi adottate</h3><ul class="list">${D.PROFILO.ipotesi.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>
    <div class="card"><h3 style="margin-bottom:8px">Aspettative realistiche</h3><ul class="list">${D.PROFILO.aspettative.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div></section>
  <section><div class="sec-t">Strategia di dimagrimento</div>${D.GUIDA.map(g => `<div class="card g"><h3>${g.titolo}</h3>${g.testo.map(t => `<p>${esc(t)}</p>`).join('')}</div>`).join('')}</section>
  <section><div class="sec-t">Dati per calcolare il fabbisogno</div><div class="card"><ul class="list">${D.DATI_FABBISOGNO.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div></section>
  <section><div class="sec-t">Monitoraggio settimanale</div><div class="card">${D.MONITORAGGIO.map(([p, f, c]) => `<div class="mon"><div><b>${p}</b><small class="muted">${f}</small></div><p>${esc(c)}</p></div>`).join('')}</div></section>
  <section><div class="sec-t">Se il peso si blocca</div><div class="card"><p class="note" style="margin-bottom:12px">${esc(D.STALLO.definizione)}</p><ol class="steps">${D.STALLO.passi.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div></section>
  <section><div class="sec-t">Check-in · copialo in Note</div><div class="card"><pre id="checkin">${esc(D.CHECKIN)}</pre><div class="btns" style="margin-top:10px"><button class="btn pri" data-copia>Copia modello</button></div></div></section>`;
}

const VISTE = { giorni: vistaGiorni, cardio: vistaCardio, piano: vistaPiano, guida: vistaGuida };

function render({ scroll = false } = {}) {
  const s = L.settimana(state.sett);
  $('#wk-n').textContent = `Sett. ${s.n}`;
  $('#wk-f').textContent = s.fase;
  $('#wk-prev').disabled = s.n <= 1;
  $('#wk-next').disabled = s.n >= 8;
  document.querySelectorAll('[data-tab]').forEach(b => { if (b.closest('.tabs')) b.classList.toggle('on', b.dataset.tab === state.tab); });
  $('#view').innerHTML = VISTE[state.tab]();
  if (state.tab === 'cardio' && $('#hiit')) hiitTick();
  if (scroll) window.scrollTo(0, 0);
}

function vaiA(tab) { state.tab = tab; store.set('tab', tab); render({ scroll: true }); }
function settimanaA(n) { state.sett = clamp(n, 1, 8); store.set('sett', state.sett); render(); }

document.addEventListener('click', e => {
  const t = e.target.closest('button, tr[data-week]'); if (!t) return;
  if (t.dataset.tab) return vaiA(t.dataset.tab);
  if (t.dataset.giorno) { state.giorno = t.dataset.giorno; store.set('giorno', state.giorno); return render(); }
  if (t.dataset.week) return settimanaA(Number(t.dataset.week));
  if (t.dataset.rec) return avviaRecupero(Number(t.dataset.rec), t.dataset.nome);
  if (t.dataset.t) return t.dataset.t === 'x' ? chiudiRecupero() : regolaRecupero(Number(t.dataset.t));
  if (t.dataset.h) return ({ start: hiitStart, pausa: hiitPausa, reset: hiitReset, salta: hiitSalta })[t.dataset.h]();
  if ('copia' in t.dataset) {
    const ok = () => { t.textContent = 'Copiato ✓'; setTimeout(() => { t.textContent = 'Copia modello'; }, 1800); };
    const seleziona = () => getSelection().selectAllChildren($('#checkin'));
    if (navigator.clipboard) navigator.clipboard.writeText(D.CHECKIN).then(ok, seleziona); else seleziona();
  }
});
$('#wk-prev').addEventListener('click', () => settimanaA(state.sett - 1));
$('#wk-next').addEventListener('click', () => settimanaA(state.sett + 1));

if ('wakeLock' in navigator) {
  $('#wake').hidden = false;
  $('#wake').addEventListener('click', () => { wakeOn = !wakeOn; store.set('wake', wakeOn); applicaWake(); });
  document.addEventListener('visibilitychange', applicaWake);
  applicaWake();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (!$('#timer').hidden && !rest.finito) tickRecupero();
  if (hiit.t0) hiitTick();
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* offline non disponibile */ });
}
