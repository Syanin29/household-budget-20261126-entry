// Tutup Buku — rekap November 2026, alokasi sisa aman, dan penutupan bulan.
// Sisa aman harus dialokasikan seluruhnya (jumlah alokasi = sisa aman) sebelum
// tombol tutup-buku aktif. Status tertutup tersimpan di localStorage.

import { CATEGORIES, META } from './data.js';
import { computeState, fmtRp, loadStore, markNav, saveStore } from './app.js';

const store = loadStore();
markNav();

const state = computeState(store);
const recapHost = document.getElementById('recap-rows');
const allocTotal = document.getElementById('alloc-total');
const allocLeft = document.getElementById('alloc-left');
const closeBtn = document.getElementById('close-month');
const closeMsg = document.getElementById('close-msg');
const closedPanel = document.getElementById('closed-panel');
const openForm = document.getElementById('alloc-form');
const inputs = {
  darurat: document.getElementById('alloc-darurat'),
  tabungan: document.getElementById('alloc-tabungan'),
  desember: document.getElementById('alloc-desember'),
};

function money(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmtRp(value);
}

money('recap-income', state.income);
money('recap-spent', state.spent);
money('recap-savings', state.savings);
money('recap-remainder', state.remainder);
money('recap-budget', state.budgetTotal);
money('recap-under', state.underBudget);

if (recapHost) {
  recapHost.innerHTML = CATEGORIES.map((c) => {
    const spent = state.byCat[c.id];
    const budget = state.budgets[c.id];
    return '<tr><td>' + c.name + '</td><td class="num">' + fmtRp(budget) + '</td>'
      + '<td class="num">' + fmtRp(spent) + '</td><td class="num">' + fmtRp(budget - spent) + '</td></tr>';
  }).join('');
}

function allocSum() {
  return ['darurat', 'tabungan', 'desember'].reduce((s, k) => s + (Number(inputs[k].value) || 0), 0);
}

function refreshAlloc() {
  const sum = allocSum();
  const left = state.remainder - sum;
  allocTotal.textContent = fmtRp(sum);
  allocLeft.textContent = fmtRp(left);
  closeBtn.disabled = sum !== state.remainder;
  closeMsg.textContent = sum === state.remainder
    ? 'Alokasi pas: seluruh sisa aman sudah dibagi. Bulan siap ditutup.'
    : (left > 0 ? 'Masih ada ' + fmtRp(left) + ' sisa aman yang belum dialokasikan.' : 'Alokasi melewati sisa aman sebesar ' + fmtRp(-left) + '. Kurangi salah satu pos.');
  closeMsg.className = sum === state.remainder ? 'ok-text' : 'error-text';
}

Object.values(inputs).forEach((input) => input.addEventListener('input', refreshAlloc));

closeBtn.addEventListener('click', () => {
  if (allocSum() !== state.remainder) return;
  store.closed = true;
  store.allocation = {
    darurat: Number(inputs.darurat.value) || 0,
    tabungan: Number(inputs.tabungan.value) || 0,
    desember: Number(inputs.desember.value) || 0,
  };
  saveStore(store);
  showClosed();
});

const reopenBtn = document.getElementById('reopen-month');
if (reopenBtn) {
  reopenBtn.addEventListener('click', () => {
    store.closed = false;
    store.allocation = null;
    saveStore(store);
    closedPanel.hidden = true;
    openForm.hidden = false;
    closeMsg.textContent = 'November 2026 dibuka kembali. Alokasi sebelumnya dihapus.';
    closeMsg.className = 'hint';
    refreshAlloc();
  });
}

function showClosed() {
  const a = store.allocation || { darurat: 0, tabungan: 0, desember: 0 };
  openForm.hidden = true;
  closedPanel.hidden = false;
  const lines = document.getElementById('closed-lines');
  if (lines) {
    lines.innerHTML = '<li>Dana darurat bertambah ' + fmtRp(a.darurat) + '.</li>'
      + '<li>Tabungan bertambah ' + fmtRp(a.tabungan) + '.</li>'
      + '<li>Belanja awal Desember mendapat ' + fmtRp(a.desember) + '.</li>'
      + '<li>Anggaran 12 amplop Desember 2026 menyalin anggaran November 2026 (total ' + fmtRp(state.budgetTotal) + ').</li>';
  }
  const note = document.getElementById('closed-note');
  if (note) note.textContent = 'November 2026 ditutup dengan sisa aman ' + fmtRp(state.remainder) + ' yang sudah dialokasikan seluruhnya.';
}

if (store.closed) {
  showClosed();
} else {
  refreshAlloc();
}
