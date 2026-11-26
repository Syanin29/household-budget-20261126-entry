// Dashboard — kartu ringkas, donat 50/30/20, amplop teratas, peringatan dini.
// Semua angka dihitung dari data.js lewat computeState(); tidak ada angka ketik manual.

import { CATEGORIES, GROUPS, INCOME, META, SAVINGS, categoryById } from './data.js';
import { donutChart } from './charts.js';
import { iconSvg } from './icons.js';
import { computeState, fmtPct, fmtRp, loadStore, markNav, runoutDay, categoryStatus } from './app.js';

const state = computeState(loadStore());
markNav();

function money(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmtRp(value);
}

money('kpi-income', state.income);
money('kpi-spent', state.spent);
money('kpi-remainder', state.remainder);
money('kpi-savings', state.savings);
money('hero-remainder', state.remainder);

const heroNote = document.getElementById('hero-note');
if (heroNote) {
  heroNote.textContent = 'Uang yang boleh dipakai sampai gajian ' + META.payday
    + ' tanpa menyentuh tabungan. Laju belanja saat ini ' + fmtRp(Math.round(state.dailyBurn))
    + ' per hari, dihitung dari ' + META.daysElapsed + ' hari pertama ' + META.monthLabel + '.';
}

// Donat pembagian pemasukan.
const donutParts = [
  { label: 'Kebutuhan', value: state.byGroup.needs, color: GROUPS.needs.color, pctText: fmtPct(state.groupPct.needs) },
  { label: 'Keinginan', value: state.byGroup.wants, color: GROUPS.wants.color, pctText: fmtPct(state.groupPct.wants) },
  { label: 'Lain-lain', value: state.byGroup.other, color: GROUPS.other.color, pctText: fmtPct(state.groupPct.other) },
  { label: 'Tabungan', value: state.savings, color: '#3f6d4e', pctText: fmtPct(state.savingsPct) },
  { label: 'Sisa aman', value: state.remainder, color: '#f2c14e', pctText: fmtPct(state.remainderPct) },
];
donutParts.centerText = fmtRp(state.remainder).replace('Rp ', 'Rp ');
const donutHost = document.getElementById('donut');
if (donutHost) donutHost.innerHTML = donutChart(donutParts, 240);

// Bar aturan 50/30/20: aktual vs target, dengan lampu status.
const rulesHost = document.getElementById('rules-503020');
if (rulesHost) {
  const rows = [
    { group: 'needs', actual: state.groupPct.needs, target: GROUPS.needs.targetPct, note: 'Makan, rumah, transport, kesehatan, pendidikan, pakaian.' },
    { group: 'wants', actual: state.groupPct.wants, target: GROUPS.wants.targetPct, note: 'Hiburan, makan di luar, hobi, hadiah & sosial.' },
    { group: 'savings', actual: state.savingsPct, target: 20, note: 'Tabungan yang sudah dipisah di awal bulan.' },
  ];
  rulesHost.innerHTML = rows.map((r) => {
    const diff = r.actual - r.target;
    const tone = r.group === 'needs'
      ? (diff > 5 ? 'bad' : diff > 0 ? 'warn' : 'good')
      : (diff < -5 ? 'warn' : 'good');
    const lampText = r.group === 'needs'
      ? (diff > 0 ? 'Di atas target ' + fmtPct(diff) : 'Sesuai target')
      : (diff < 0 ? 'Di bawah target ' + fmtPct(Math.abs(diff)) : 'Sesuai target');
    const name = r.group === 'savings' ? 'Tabungan' : GROUPS[r.group].label;
    return '<div class="rule-row"><div><div class="rule-name">' + name + '</div>'
      + '<div class="rule-note">' + r.note + '</div></div>'
      + '<div><div class="bar-track"><div class="bar-fill ' + (tone === 'good' ? '' : tone) + '" style="width:' + Math.min(100, r.actual) + '%"></div></div>'
      + '<div class="rule-note">Target ' + r.target + '% &middot; aktual ' + fmtPct(r.actual) + '</div></div>'
      + '<div class="rule-pct">' + fmtPct(r.actual) + '<div><span class="lamp ' + tone + '">' + lampText + '</span></div></div></div>';
  }).join('');
}

// Lima amplop terbesar + tautan ke halaman Anggaran.
const envHost = document.getElementById('top-envelopes');
if (envHost) {
  const sorted = [...CATEGORIES].sort((a, b) => state.byCat[b.id] - state.byCat[a.id]).slice(0, 5);
  envHost.innerHTML = sorted.map((c) => {
    const spent = state.byCat[c.id];
    const budget = state.budgets[c.id];
    const pct = Math.min(100, (spent / budget) * 100);
    const st = categoryStatus(spent, budget);
    return '<div class="envelope"><div class="envelope-top"><span class="envelope-name">' + iconSvg(c.icon, 20) + ' ' + c.name + '</span>'
      + '<span class="envelope-amount">' + fmtRp(spent) + ' / ' + fmtRp(budget) + '</span></div>'
      + '<div class="bar-track"><div class="bar-fill ' + (st.tone === 'good' ? '' : st.tone) + '" style="width:' + pct.toFixed(1) + '%"></div></div>'
      + '<div class="envelope-meta">' + fmtPct((spent / budget) * 100, 0) + ' dari anggaran &middot; <span class="lamp ' + st.tone + '">' + st.label + '</span></div></div>';
  }).join('');
}

// Peringatan dini — semuanya dihitung dari laju harian nyata.
const warnHost = document.getElementById('warnings');
if (warnHost) {
  const alerts = [];
  for (const c of CATEGORIES) {
    const spent = state.byCat[c.id];
    const budget = state.budgets[c.id];
    if (spent > budget) {
      alerts.push({ tone: 'bad', title: c.name + ' melewati anggaran ' + fmtRp(spent - budget) + '.',
        body: 'Terpakai ' + fmtRp(spent) + ' dari anggaran ' + fmtRp(budget) + '. Kurangi bulan depan atau pindahkan dari amplop yang masih longgar.' });
    }
  }
  const makanDay = runoutDay('makan', state);
  if (makanDay !== null) {
    alerts.push({ tone: 'warn', title: 'Amplop Makan habis sekitar ' + makanDay + ' November.',
      body: 'Pada laju ' + fmtRp(Math.round(state.byCat.makan / META.daysElapsed)) + ' per hari, anggaran '
        + fmtRp(state.budgets.makan) + ' habis ' + (META.daysInMonth - makanDay) + ' hari sebelum gajian ' + META.payday + '.' });
  }
  const luarDay = runoutDay('makan-luar', state);
  if (luarDay !== null && luarDay <= META.daysElapsed) {
    alerts.push({ tone: 'warn', title: 'Amplop Makan di Luar sudah habis sejak ' + luarDay + ' November.',
      body: 'Terpakai ' + fmtRp(state.byCat['makan-luar']) + ' dari anggaran ' + fmtRp(state.budgets['makan-luar'])
        + '. Masak di rumah sampai gajian untuk menahan laju ini.' });
  }
  if (alerts.length === 0) {
    alerts.push({ tone: 'good', title: 'Semua amplop masih dalam anggaran.',
      body: 'Tidak ada kategori yang melewati anggaran sampai ' + META.asOf + '.' });
  }
  warnHost.innerHTML = alerts.map((a) => '<div class="alert ' + a.tone + '"><strong>' + a.title + '</strong>' + a.body + '</div>').join('');
}

// Tiga transaksi terakhir (hari terbesar, lalu nominal terbesar).
const recentHost = document.getElementById('recent-tx');
if (recentHost) {
  const recent = [...state.txs].sort((a, b) => (b.day - a.day) || (b.amount - a.amount)).slice(0, 3);
  recentHost.innerHTML = '<table><thead><tr><th>Tanggal</th><th>Transaksi</th><th>Kategori</th><th class="num">Jumlah</th></tr></thead><tbody>'
    + recent.map((t) => '<tr><td>' + t.day + ' Nov</td><td>' + t.label + '</td><td>' + categoryById(t.category).name + '</td><td class="num">' + fmtRp(t.amount) + '</td></tr>').join('')
    + '</tbody></table>';
}
