// Simulator Geser — what-if: geser 3 pengeluaran, lihat dampaknya langsung.
// Potongan per bulan menambah sisa aman dan tabungan; tabungan tambahan setahun = potongan x 12.

import { META } from './data.js';
import { computeState, fmtRp, loadStore, markNav } from './app.js';

markNav();

const base = computeState(loadStore());
const sliders = {
  hiburan: document.getElementById('cut-hiburan'),
  makanLuar: document.getElementById('cut-makan-luar'),
  makan: document.getElementById('cut-makan'),
};
const values = {
  hiburan: document.getElementById('cut-hiburan-value'),
  makanLuar: document.getElementById('cut-makan-luar-value'),
  makan: document.getElementById('cut-makan-value'),
};
const outCut = document.getElementById('out-cut');
const outRemainder = document.getElementById('out-remainder');
const outYearly = document.getElementById('out-yearly');
const outSavings = document.getElementById('out-savings');
const outBuffer = document.getElementById('out-buffer');
const outNote = document.getElementById('out-note');

// Batas geser = jumlah yang memang terpakai di kategori itu bulan ini (dari data,
// bukan angka ketik): hiburan dan makan-di-luar bisa dipotong sampai habis,
// belanja harian dibatasi Rp 500.000 karena dapur tetap harus belanja.
sliders.hiburan.max = String(base.byCat.hiburan);
sliders.makanLuar.max = String(base.byCat['makan-luar']);
sliders.makan.max = '500000';

function update() {
  const cutHiburan = Number(sliders.hiburan.value);
  const cutLuar = Number(sliders.makanLuar.value);
  const cutMakan = Number(sliders.makan.value);
  const cut = cutHiburan + cutLuar + cutMakan;
  const remainder = base.remainder + cut;
  const savings = base.savings + cut;
  const bufferDays = remainder / base.dailyBurn;
  values.hiburan.textContent = fmtRp(cutHiburan) + ' / bulan';
  values.makanLuar.textContent = fmtRp(cutLuar) + ' / bulan';
  values.makan.textContent = fmtRp(cutMakan) + ' / bulan';
  outCut.textContent = fmtRp(cut) + ' / bulan';
  outRemainder.textContent = fmtRp(remainder);
  // Label kolom sudah menyebut "/ tahun" dan "/ bulan", jadi nilainya tampil
  // polos agar muat satu baris tanpa membungkus di tengah angka.
  outYearly.textContent = fmtRp(cut * 12);
  outSavings.textContent = fmtRp(savings);
  outBuffer.textContent = bufferDays.toFixed(1).replace('.', ',') + ' hari';
  outNote.textContent = cut === 0
    ? 'Geser salah satu slider di atas untuk melihat dampaknya. Coba tombol “Potong Rp 200.000 langganan”.'
    : 'Dengan potongan ' + fmtRp(cut) + ' per bulan, sisa aman naik dari ' + fmtRp(base.remainder)
    + ' menjadi ' + fmtRp(remainder) + ' dan tabungan tahunan bertambah ' + fmtRp(cut * 12)
    + '. Pada laju belanja saat ini, sisa aman itu cukup untuk ' + bufferDays.toFixed(1).replace('.', ',')
    + ' hari sampai ' + META.payday + '.';
}

Object.values(sliders).forEach((s) => s.addEventListener('input', update));

// Preset "Potong Rp 200.000 langganan": hiburan dipotong 200 ribu, dua slider
// lain tetap nol. Dijalankan sekali saat halaman dimuat supaya simulator
// langsung hidup berangka, bukan menampilkan Rp 0 di semua hasil.
function applyPreset200k() {
  sliders.hiburan.value = '200000';
  sliders.makanLuar.value = '0';
  sliders.makan.value = '0';
  update();
}

const preset = document.getElementById('preset-200k');
if (preset) {
  preset.addEventListener('click', applyPreset200k);
}
const reset = document.getElementById('reset-sim');
if (reset) {
  reset.addEventListener('click', () => {
    sliders.hiburan.value = '0';
    sliders.makanLuar.value = '0';
    sliders.makan.value = '0';
    update();
  });
}

applyPreset200k();
