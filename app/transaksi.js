// Transaksi — 48 transaksi November 2026: filter kategori & anggota, tambah transaksi.
// Transaksi baru tersimpan di localStorage dan langsung mengubah total di semua halaman.

import { CATEGORIES, META, categoryById } from './data.js';
import { iconSvg } from './icons.js';
import { computeState, fmtRp, loadStore, markNav, saveStore } from './app.js';

const store = loadStore();
markNav();

const catFilter = document.getElementById('filter-category');
const memberFilter = document.getElementById('filter-member');
const rowsHost = document.getElementById('tx-rows');
const summary = document.getElementById('tx-summary');

CATEGORIES.forEach((c) => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = c.name;
  catFilter.appendChild(opt);
});

function render() {
  const state = computeState(store);
  const cat = catFilter.value;
  const member = memberFilter.value;
  const list = state.txs.filter((t) => (cat === 'all' || t.category === cat) && (member === 'all' || t.member === member));
  const shownTotal = list.reduce((s, t) => s + t.amount, 0);
  rowsHost.innerHTML = list.map((t) => '<tr><td>' + t.day + ' Nov 2026</td>'
    + '<td>' + t.label + '</td>'
    + '<td><span class="cat-cell">' + iconSvg(categoryById(t.category).icon, 18) + ' ' + categoryById(t.category).name + '</span></td>'
    + '<td>' + t.member + '</td><td class="num">' + fmtRp(t.amount) + '</td></tr>').join('');
  summary.textContent = 'Menampilkan ' + list.length + ' dari ' + state.txs.length + ' transaksi'
    + ' · total yang ditampilkan ' + fmtRp(shownTotal)
    + ' · total November 2026 ' + fmtRp(state.spent) + '.';
}

catFilter.addEventListener('change', render);
memberFilter.addEventListener('change', render);

// Ekspor CSV: semua transaksi bulan ini (termasuk yang ditambahkan pengguna)
// diunduh lewat Blob — tanpa network, tanpa server.
function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function exportCsv() {
  const state = computeState(store);
  const lines = [['Tanggal', 'Transaksi', 'Kategori', 'Anggota', 'Jumlah (Rp)'].map(csvCell).join(',')];
  for (const t of state.txs) {
    lines.push([t.day + ' Nov 2026', t.label, categoryById(t.category).name, t.member, t.amount].map(csvCell).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transaksi-november-2026.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const exportBtn = document.getElementById('export-csv');
if (exportBtn) exportBtn.addEventListener('click', exportCsv);

const form = document.getElementById('add-tx');
const formMsg = document.getElementById('add-tx-msg');
const formCat = document.getElementById('new-category');
CATEGORIES.forEach((c) => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = c.name;
  formCat.appendChild(opt);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const day = Number(document.getElementById('new-day').value);
  const label = document.getElementById('new-label').value.trim();
  const amount = Number(document.getElementById('new-amount').value);
  const member = document.getElementById('new-member').value;
  if (!label || !Number.isFinite(amount) || amount <= 0 || day < 1 || day > META.daysInMonth) {
    formMsg.textContent = 'Lengkapi isian: tanggal 1–30, nama transaksi, dan jumlah lebih dari 0.';
    formMsg.className = 'error-text';
    return;
  }
  store.added.push({ day, member, category: formCat.value, label, amount: Math.round(amount) });
  saveStore(store);
  form.reset();
  formMsg.textContent = 'Transaksi ditambahkan. Total November 2026 sekarang ' + fmtRp(computeState(store).spent) + '.';
  formMsg.className = 'ok-text';
  render();
});

render();
