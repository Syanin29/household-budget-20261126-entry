// RumahTangga — fungsi bersama semua halaman.
// Satu tempat untuk: format rupiah, memuat/menyimpan perubahan pengguna (localStorage),
// dan semua hitungan yang tampil di situs. Halaman tidak pernah menghitung sendiri
// dengan rumus yang berbeda — rumusnya hidup di sini dan di data.js saja.

import {
  CATEGORIES, GROUPS, INCOME, META, SAVINGS, TRANSACTIONS,
  categoryById, safeRemainder, spentByCategory, spentByGroup, totalBudget, totalSpent,
} from './data.js';

export const STORE_KEY = 'rumahtangga-v1';

export function fmtRp(n) {
  const sign = n < 0 ? '-Rp ' : 'Rp ';
  const abs = Math.abs(Math.round(n));
  return sign + String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function fmtPct(n, decimals) {
  const d = decimals === undefined ? 1 : decimals;
  return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toString().replace('.', ',') + '%';
}

export function fmtSigned(n) {
  return (n < 0 ? '−' : '+') + fmtRp(Math.abs(n)).replace('Rp ', 'Rp ');
}

// --- Penyimpanan perubahan pengguna (anggaran edit + transaksi tambah + tutup buku) ---
export function loadStore() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return { budgets: {}, added: [], closed: false, allocation: null };
    const parsed = JSON.parse(raw);
    return {
      budgets: parsed.budgets || {},
      added: Array.isArray(parsed.added) ? parsed.added : [],
      closed: parsed.closed === true,
      allocation: parsed.allocation || null,
    };
  } catch (e) {
    return { budgets: {}, added: [], closed: false, allocation: null };
  }
}

export function saveStore(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    // Penyimpanan penuh/diblokir: situs tetap jalan, perubahan hanya di memori.
  }
}

// Anggaran efektif = anggaran data.js, ditimpa edit pengguna bila ada.
export function effectiveBudgets(store) {
  const out = {};
  for (const c of CATEGORIES) {
    const edited = store.budgets[c.id];
    out[c.id] = typeof edited === 'number' && edited >= 0 ? edited : c.budget;
  }
  return out;
}

export function allTransactions(store) {
  return TRANSACTIONS.concat(store.added);
}

// Satu paket hitungan untuk satu kondisi (dipakai dashboard, anggaran, tutup buku).
export function computeState(store) {
  const txs = allTransactions(store);
  const byCat = spentByCategory(txs);
  const byGroup = spentByGroup(txs);
  const spent = totalSpent(txs);
  const budgets = effectiveBudgets(store);
  let budgetTotal = 0;
  for (const c of CATEGORIES) budgetTotal += budgets[c.id];
  const remainder = safeRemainder(txs, SAVINGS);
  const dailyBurn = spent / META.daysElapsed;
  const groupPct = {};
  for (const g of Object.keys(GROUPS)) groupPct[g] = (byGroup[g] / INCOME.total) * 100;
  return {
    txs, byCat, byGroup, spent, budgets, budgetTotal,
    income: INCOME.total, savings: SAVINGS, remainder,
    dailyBurn, groupPct,
    underBudget: budgetTotal - spent,
    savingsPct: (SAVINGS / INCOME.total) * 100,
    remainderPct: (remainder / INCOME.total) * 100,
  };
}

// Peringatan dini per amplop: kapan anggaran habis pada laju harian saat ini.
// Mengembalikan tanggal (nomor hari November) atau null bila tidak habis bulan ini.
export function runoutDay(categoryId, state) {
  const spent = state.byCat[categoryId];
  const budget = state.budgets[categoryId];
  if (spent <= 0) return null;
  const daily = spent / META.daysElapsed;
  const day = Math.ceil(budget / daily);
  return day <= META.daysInMonth ? day : null;
}

export function categoryStatus(spent, budget) {
  if (spent > budget) return { key: 'over', label: 'Melewati anggaran', tone: 'bad' };
  if (spent / budget >= 0.9) return { key: 'tight', label: 'Hampir habis', tone: 'warn' };
  return { key: 'ok', label: 'Aman', tone: 'good' };
}

// Tandai link navigasi halaman aktif + isi label bulan di footer.
export function markNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[data-page]').forEach((a) => {
    if (a.getAttribute('data-page') === path) a.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('[data-month-label]').forEach((el) => {
    el.textContent = META.monthLabel;
  });
}

export function categoryName(id) {
  const c = categoryById(id);
  return c ? c.name : id;
}

export { CATEGORIES, GROUPS, INCOME, META, SAVINGS, categoryById, totalBudget };
