// Tren & Laporan — 6 bulan Juni–November 2026: batang masuk vs terpakai,
// batang bertumpuk per kelompok, garis surplus, garis belanja makan,
// dan kartu insight yang semuanya dihitung dari data.js.

import { INCOME, MONTHS, SAVINGS, TRANSACTIONS } from './data.js';
import { cashLine, makanLine, stackedBars, trendBars } from './charts.js';
import { fmtPct, fmtRp, markNav } from './app.js';

markNav();

const trendHost = document.getElementById('chart-trend');
if (trendHost) trendHost.innerHTML = trendBars(MONTHS, 640, 300);
const stackHost = document.getElementById('chart-stacked');
if (stackHost) stackHost.innerHTML = stackedBars(MONTHS, 640, 300);
const cashHost = document.getElementById('chart-cash');
if (cashHost) cashHost.innerHTML = cashLine(MONTHS, 640, 280);
const makanHost = document.getElementById('chart-makan');
if (makanHost) makanHost.innerHTML = makanLine(MONTHS, 640, 260);

const nov = MONTHS[5];
const okt = MONTHS[4];
const insightsHost = document.getElementById('insights');
if (insightsHost) {
  const makanGrowth = ((nov.makan - okt.makan) / okt.makan) * 100;
  const spentGrowth = ((nov.spent - okt.spent) / okt.spent) * 100;
  const avgSpent = MONTHS.reduce((s, m) => s + m.spent, 0) / MONTHS.length;
  const avgSurplus = MONTHS.reduce((s, m) => s + (m.income - m.spent), 0) / MONTHS.length;
  const bestMonth = MONTHS.reduce((best, m) => (m.income - m.spent) > (best.income - best.spent) ? m : best, MONTHS[0]);
  const savingsPct = (SAVINGS / INCOME.total) * 100;
  const savingsTarget = INCOME.total * 0.2;
  const hpCicilan = TRANSACTIONS.find((t) => t.label.indexOf('Cicilan HP') === 0);
  const cards = [
    { title: 'Belanja makan naik ' + fmtPct(makanGrowth, 0) + ' vs Oktober',
      body: 'Dari ' + fmtRp(okt.makan) + ' menjadi ' + fmtRp(nov.makan) + '. Kenaikan terbesar dari 6 bulan terakhir — periksa amplop Makan di halaman Anggaran.' },
    { title: 'November bulan paling boros: ' + fmtRp(nov.spent),
      body: 'Naik ' + fmtPct(spentGrowth) + ' dari Oktober (' + fmtRp(okt.spent) + '). Pemicunya ' + (hpCicilan ? hpCicilan.label.toLowerCase() + ' ' + fmtRp(hpCicilan.amount) : 'cicilan HP baru') + ' di amplop Gadget.' },
    { title: 'Rata-rata terpakai 6 bulan: ' + fmtRp(Math.round(avgSpent)),
      body: 'Surplus rata-rata ' + fmtRp(Math.round(avgSurplus)) + ' per bulan. Bulan paling hemat adalah ' + bestMonth.label
        + ' dengan surplus ' + fmtRp(bestMonth.income - bestMonth.spent) + '.' },
    { title: 'Tabungan ' + fmtPct(savingsPct) + ' dari pemasukan — di bawah target 20%',
      body: 'Target 50/30/20 meminta tabungan ' + fmtRp(savingsTarget) + ' per bulan. Selisihnya ' + fmtRp(savingsTarget - SAVINGS)
        + ' — sebesar itulah yang perlu dipangkas dari keinginan lewat Simulator.' },
  ];
  insightsHost.innerHTML = cards.map((c) => '<div class="card"><h3>' + c.title + '</h3><p class="sub">' + c.body + '</p></div>').join('');
}
