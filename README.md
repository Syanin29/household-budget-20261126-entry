# household-budget-20261126-entry

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Syanin29/household-budget-20261126-entry/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Syanin29/household-budget-20261126-entry/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

RumahTangga 50/30/20 — situs anggaran keluarga: 6 alat, 12 amplop, dan 1 angka sisa aman Rp 847.000 untuk Keluarga Pratama, November 2026. Dashboard, anggaran yang bisa diedit, 48 transaksi, tren 6 bulan, simulator geser what-if, dan tutup buku bulanan — semuanya dihitung dari satu sumber data, tanpa internet.

## Run it

```sh
python3 -m http.server 8080 --directory app
```

Lalu buka http://localhost:8080 di peramban.

## Enam alat

1. **Dashboard** (`index.html`) — kartu pemasukan Rp 12.500.000, terpakai Rp 9.853.000, sisa aman Rp 847.000, tabungan Rp 1.800.000; donat 50/30/20; 5 amplop terbesar; peringatan dini dari laju belanja harian; 3 transaksi terakhir.
2. **Anggaran** (`anggaran.html`) — tabel 12 amplop (anggaran, terpakai, sisa, persen, lampu status Aman / Hampir habis / Melewati anggaran); klik angka anggaran untuk mengubahnya — tampil berformat ribuan, tersimpan di peramban, total ikut berubah; tombol "Kembalikan anggaran awal".
3. **Transaksi** (`transaksi.html`) — 48 transaksi November 2026 dengan filter kategori dan anggota keluarga; form tambah transaksi yang benar-benar mengubah total; tombol "Unduh CSV" untuk mengunduh semua transaksi sebagai CSV.
4. **Tren & Laporan** (`tren.html`) — batang pemasukan vs pengeluaran 6 bulan (Jun–Nov 2026), garis arus kas, tumpukan per kelompok, dan kartu insight berangka (misalnya belanja makan naik 18% vs Oktober).
5. **Simulator** (`simulator.html`) — 3 slider what-if (potong hiburan, makan di luar, belanja harian) yang langsung mengubah sisa aman, tabungan per bulan/tahun, dan berapa hari sisa aman bertahan; preset "Potong Rp 200.000 langganan" langsung aktif saat halaman dibuka.
6. **Tutup Buku** (`tutup-buku.html`) — rekap November 2026 (masuk, terpakai, tabungan, sisa aman, di bawah anggaran) dan tombol "Tutup November" yang mengalihkan sisa ke tabungan/dana darurat lalu menyalin anggaran ke Desember.

Semua angka dihitung dari `app/data.js` — satu sumber data, satu bulan acuan (November 2026). Situs ini statis dan bekerja tanpa internet: tanpa build step, tanpa font/gambar luar, perubahan pengguna hanya tersimpan di localStorage peramban sendiri.

## Changelog

- **v1 (26 Nov 2026)** — rilis awal: 6 alat, 12 amplop, simulator geser, dan verifikasi angka otomatis (`node tools/verify.mjs`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=5xm183q1&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
