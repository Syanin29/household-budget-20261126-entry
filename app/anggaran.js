// Anggaran — tabel 12 amplop: anggaran (bisa diedit), terpakai, sisa, persen, status.
// Edit anggaran tersimpan di localStorage dan langsung mengubah total + dashboard.

import { CATEGORIES, META } from './data.js';
import { iconSvg } from './icons.js';
import { computeState, fmtPct, fmtRp, loadStore, markNav, saveStore, categoryStatus } from './app.js';

const store = loadStore();
markNav();

const tableBody = document.getElementById('budget-rows');
const totalsRow = document.getElementById('budget-totals');
const savedNote = document.getElementById('saved-note');

// Tampilan anggaran memakai pemisah ribuan (titik), sama seperti fmtRp di
// halaman lain; yang disimpan ke localStorage tetap angka mentah.
function fmtBudget(n) {
  return fmtRp(n).replace('Rp ', '');
}

function parseBudget(text) {
  const digits = String(text).replace(/[^0-9]/g, '');
  return digits === '' ? NaN : Number(digits);
}

function render() {
  const state = computeState(store);
  tableBody.innerHTML = CATEGORIES.map((c) => {
    const spent = state.byCat[c.id];
    const budget = state.budgets[c.id];
    const left = budget - spent;
    const pct = (spent / budget) * 100;
    const st = categoryStatus(spent, budget);
    return '<tr><td><span class="cat-cell">' + iconSvg(c.icon, 20) + ' ' + c.name + '</span>'
      + '<div class="hint">' + c.blurb + '</div></td>'
      + '<td class="num"><input type="text" inputmode="numeric" class="budget-input" id="budget-' + c.id + '" data-category="' + c.id + '" value="' + fmtBudget(budget) + '" aria-label="Anggaran ' + c.name + ' (rupiah)"></td>'
      + '<td class="num">' + fmtRp(spent) + '</td>'
      + '<td class="num">' + fmtRp(left) + '</td>'
      + '<td><div class="bar-track"><div class="bar-fill ' + (st.tone === 'good' ? '' : st.tone) + '" style="width:' + Math.min(100, pct).toFixed(1) + '%"></div></div>'
      + '<div class="hint">' + fmtPct(pct, 0) + ' &middot; <span class="lamp ' + st.tone + '">' + st.label + '</span></div></td></tr>';
  }).join('');

  totalsRow.innerHTML = '<td>Total 12 amplop</td>'
    + '<td class="num">' + fmtRp(state.budgetTotal) + '</td>'
    + '<td class="num">' + fmtRp(state.spent) + '</td>'
    + '<td class="num">' + fmtRp(state.underBudget) + '</td>'
    + '<td><strong>' + (state.underBudget >= 0 ? 'Di bawah anggaran' : 'Melewati anggaran') + '</strong></td>';

  tableBody.querySelectorAll('input[data-category]').forEach((input) => {
    input.addEventListener('focus', () => input.select());
    input.addEventListener('change', () => {
      const value = parseBudget(input.value);
      if (!Number.isFinite(value) || value < 0) {
        input.value = fmtBudget(state.budgets[input.dataset.category] || 0);
        return;
      }
      store.budgets[input.dataset.category] = Math.round(value);
      saveStore(store);
      savedNote.textContent = 'Anggaran ' + input.dataset.category + ' disimpan. Total dan dashboard ikut berubah.';
      render();
    });
  });
}

render();

const resetBtn = document.getElementById('reset-budgets');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    store.budgets = {};
    saveStore(store);
    savedNote.textContent = 'Anggaran dikembalikan ke angka awal November 2026.';
    render();
  });
}

const asOf = document.getElementById('budget-asof');
if (asOf) asOf.textContent = 'Angka per ' + META.asOf + '. Anggaran bisa diedit; terpakai dihitung dari 48 transaksi November 2026.';
