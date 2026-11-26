// RumahTangga 50/30/20 — satu-satunya sumber data situs ini.
// Keluarga Pratama, 4 orang, Jakarta. Bulan acuan: November 2026 (satu vintage).
// Semua angka yang tampil di situs dihitung dari file ini — tidak ada angka narasi
// yang diketik manual di halaman. Kalau angka di sini berubah, seluruh situs ikut berubah.
//
// Kunci rekonsiliasi (dicek tools/verify.mjs):
//   pemasukan 12.500.000 - terpakai 9.853.000 - tabungan 1.800.000 = sisa aman 847.000
//   jumlah 48 transaksi = 9.853.000; jumlah 12 kategori = 9.853.000
//   anggaran 12 kategori = 10.100.000 (di bawah anggaran 247.000)

export const META = {
  household: 'Keluarga Pratama',
  members: 4,
  city: 'Jakarta',
  monthLabel: 'November 2026',
  monthShort: 'Nov 2026',
  asOf: '28 November 2026',
  payday: '30 November 2026',
  daysElapsed: 28,
  daysInMonth: 30,
};

export const INCOME = {
  total: 12500000,
  sources: [
    { label: 'Gaji Ayah', member: 'Ayah', amount: 8000000 },
    { label: 'Gaji Ibu', member: 'Ibu', amount: 4500000 },
  ],
};

export const SAVINGS = 1800000;

// Kelompok 50/30/20. "needs" = kebutuhan, "wants" = keinginan, "other" = lain-lain
// (di luar pembagian 50/30/20, tapi tetap amplop yang dilacak).
export const GROUPS = {
  needs: { label: 'Kebutuhan', targetPct: 50, color: '#2e7d46' },
  wants: { label: 'Keinginan', targetPct: 30, color: '#c98a1b' },
  other: { label: 'Lain-lain', targetPct: null, color: '#5b7a99' },
};

export const CATEGORIES = [
  { id: 'makan', name: 'Makan & Belanja Harian', group: 'needs', icon: 'makan', budget: 2400000, blurb: 'Belanja mingguan pasar dan supermarket untuk 4 orang.' },
  { id: 'rumah', name: 'Rumah & Utilitas', group: 'needs', icon: 'rumah', budget: 2000000, blurb: 'Cicilan rumah, listrik, air, dan internet.' },
  { id: 'transport', name: 'Transport', group: 'needs', icon: 'transport', budget: 900000, blurb: 'Bensin mobil dan motor, tol, parkir, ojek online.' },
  { id: 'kesehatan', name: 'Kesehatan', group: 'needs', icon: 'kesehatan', budget: 450000, blurb: 'Dokter, obat, dan vitamin keluarga.' },
  { id: 'pendidikan', name: 'Pendidikan Anak', group: 'needs', icon: 'pendidikan', budget: 800000, blurb: 'SPP, les, buku, dan kegiatan sekolah.' },
  { id: 'pakaian', name: 'Pakaian & Perawatan', group: 'needs', icon: 'pakaian', budget: 400000, blurb: 'Seragam, sepatu, dan baju kerja.' },
  { id: 'hiburan', name: 'Hiburan & Langganan', group: 'wants', icon: 'hiburan', budget: 600000, blurb: 'Streaming, bioskop, musik, dan game anak.' },
  { id: 'makan-luar', name: 'Makan di Luar & Jajan', group: 'wants', icon: 'makan-luar', budget: 650000, blurb: 'Resto keluarga, jajan kantor, kopi, dan delivery.' },
  { id: 'hobi', name: 'Hobi & Olahraga', group: 'wants', icon: 'hobi', budget: 350000, blurb: 'Gym, rajut, buku hobi, dan alat pancing.' },
  { id: 'hadiah', name: 'Hadiah & Sosial', group: 'wants', icon: 'hadiah', budget: 450000, blurb: 'Kado, sumbangan RT, dan bingkisan.' },
  { id: 'lain', name: 'Lain-lain', group: 'other', icon: 'lain', budget: 400000, blurb: 'Servis rumah, pulsa, peralatan, dan laundry.' },
  { id: 'gadget', name: 'Gadget & Elektronik', group: 'other', icon: 'gadget', budget: 700000, blurb: 'Cicilan HP dan aksesori elektronik.' },
];

// 48 transaksi November 2026. Jumlah per kategori = terpakai kategori itu.
// Anggota: Ayah, Ibu, atau Bersama (dana bersama keluarga).
export const TRANSACTIONS = [
  { day: 2, member: 'Bersama', category: 'makan', label: 'Belanja mingguan — Pasar Minggu', amount: 685000 },
  { day: 9, member: 'Ibu', category: 'makan', label: 'Belanja mingguan — supermarket', amount: 520000 },
  { day: 16, member: 'Bersama', category: 'makan', label: 'Belanja mingguan — pasar + supermarket', amount: 640000 },
  { day: 23, member: 'Ibu', category: 'makan', label: 'Belanja mingguan — sayur & lauk', amount: 540000 },

  { day: 1, member: 'Bersama', category: 'rumah', label: 'Cicilan rumah November', amount: 1100000 },
  { day: 5, member: 'Bersama', category: 'rumah', label: 'Listrik PLN', amount: 320000 },
  { day: 10, member: 'Bersama', category: 'rumah', label: 'Air PDAM', amount: 180000 },
  { day: 3, member: 'Bersama', category: 'rumah', label: 'Internet + TV kabel', amount: 320000 },

  { day: 4, member: 'Ayah', category: 'transport', label: 'Bensin mobil', amount: 240000 },
  { day: 7, member: 'Ayah', category: 'transport', label: 'Bensin motor', amount: 300000 },
  { day: 14, member: 'Ayah', category: 'transport', label: 'Tol & parkir', amount: 180000 },
  { day: 20, member: 'Ibu', category: 'transport', label: 'Ojek online', amount: 125000 },

  { day: 6, member: 'Bersama', category: 'kesehatan', label: 'Dokter gigi anak', amount: 150000 },
  { day: 12, member: 'Ibu', category: 'kesehatan', label: 'Obat & vitamin apotek', amount: 120000 },
  { day: 18, member: 'Ibu', category: 'kesehatan', label: 'Vitamin keluarga', amount: 85000 },
  { day: 25, member: 'Ayah', category: 'kesehatan', label: 'Masker & kotak P3K', amount: 57000 },

  { day: 1, member: 'Bersama', category: 'pendidikan', label: 'SPP anak pertama', amount: 450000 },
  { day: 8, member: 'Ibu', category: 'pendidikan', label: 'Les bahasa Inggris', amount: 180000 },
  { day: 15, member: 'Ibu', category: 'pendidikan', label: 'Buku & alat tulis', amount: 90000 },
  { day: 22, member: 'Ayah', category: 'pendidikan', label: 'Uang saku & kegiatan sekolah', amount: 60000 },

  { day: 5, member: 'Ibu', category: 'pakaian', label: 'Seragam sekolah', amount: 145000 },
  { day: 11, member: 'Ibu', category: 'pakaian', label: 'Sepatu anak', amount: 98000 },
  { day: 17, member: 'Ibu', category: 'pakaian', label: 'Baju kerja Ibu', amount: 75000 },
  { day: 24, member: 'Ayah', category: 'pakaian', label: 'Kaos & celana Ayah', amount: 50000 },

  { day: 1, member: 'Bersama', category: 'hiburan', label: 'Langganan streaming film', amount: 199000 },
  { day: 7, member: 'Bersama', category: 'hiburan', label: 'Bioskop keluarga', amount: 150000 },
  { day: 2, member: 'Ayah', category: 'hiburan', label: 'Langganan musik', amount: 96000 },
  { day: 13, member: 'Bersama', category: 'hiburan', label: 'Game & aplikasi anak', amount: 75000 },

  { day: 8, member: 'Bersama', category: 'makan-luar', label: 'Makan keluarga di resto', amount: 220000 },
  { day: 12, member: 'Ayah', category: 'makan-luar', label: 'Jajan & makan siang kantor', amount: 185000 },
  { day: 19, member: 'Ibu', category: 'makan-luar', label: 'Kopi & camilan', amount: 160000 },
  { day: 27, member: 'Bersama', category: 'makan-luar', label: 'Delivery makan akhir pekan', amount: 120000 },

  { day: 3, member: 'Ayah', category: 'hobi', label: 'Iuran gym Ayah', amount: 120000 },
  { day: 10, member: 'Ibu', category: 'hobi', label: 'Benang & alat rajut Ibu', amount: 85000 },
  { day: 16, member: 'Ayah', category: 'hobi', label: 'Buku hobi', amount: 65000 },
  { day: 21, member: 'Ayah', category: 'hobi', label: 'Alat pancing', amount: 40000 },

  { day: 9, member: 'Bersama', category: 'hadiah', label: 'Kado ulang tahun Nenek', amount: 200000 },
  { day: 14, member: 'Bersama', category: 'hadiah', label: 'Sumbangan RT & keamanan', amount: 125000 },
  { day: 20, member: 'Ibu', category: 'hadiah', label: 'Kartu ucapan & bingkisan', amount: 63000 },
  { day: 26, member: 'Bersama', category: 'hadiah', label: 'Angpao untuk keponakan', amount: 40000 },

  { day: 6, member: 'Bersama', category: 'lain', label: 'Servis AC', amount: 150000 },
  { day: 11, member: 'Ayah', category: 'lain', label: 'Pulsa & paket data', amount: 90000 },
  { day: 18, member: 'Bersama', category: 'lain', label: 'Peralatan rumah tangga', amount: 65000 },
  { day: 25, member: 'Ibu', category: 'lain', label: 'Laundry', amount: 45000 },

  { day: 2, member: 'Ayah', category: 'gadget', label: 'Cicilan HP baru', amount: 600000 },
  { day: 9, member: 'Ayah', category: 'gadget', label: 'Casing & pelindung layar', amount: 120000 },
  { day: 15, member: 'Ayah', category: 'gadget', label: 'Charger & kabel cadangan', amount: 80000 },
  { day: 23, member: 'Ayah', category: 'gadget', label: 'Mouse wireless', amount: 50000 },
];

// Tren 6 bulan, Juni–November 2026. needs + wants + other = spent setiap bulan.
// Baris November harus sama dengan hitungan transaksi November (dicek verify).
export const MONTHS = [
  { label: 'Jun 2026', income: 12500000, spent: 9120000, makan: 1980000, needs: 6200000, wants: 1720000, other: 1200000 },
  { label: 'Jul 2026', income: 12500000, spent: 9480000, makan: 2050000, needs: 6450000, wants: 1830000, other: 1200000 },
  { label: 'Agu 2026', income: 12500000, spent: 9205000, makan: 1940000, needs: 6300000, wants: 1705000, other: 1200000 },
  { label: 'Sep 2026', income: 12500000, spent: 9640000, makan: 2110000, needs: 6550000, wants: 1890000, other: 1200000 },
  { label: 'Okt 2026', income: 12500000, spent: 9402000, makan: 2020000, needs: 6380000, wants: 1822000, other: 1200000 },
  { label: 'Nov 2026', income: 12500000, spent: 9853000, makan: 2385000, needs: 6710000, wants: 1943000, other: 1200000 },
];

// Turunan murni dari data di atas — dipakai semua halaman dan verify.
export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id);
}

export function spentByCategory(transactions) {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of transactions) {
    if (out[t.category] !== undefined) out[t.category] += t.amount;
  }
  return out;
}

export function spentByGroup(transactions) {
  const byCat = spentByCategory(transactions);
  const out = { needs: 0, wants: 0, other: 0 };
  for (const c of CATEGORIES) out[c.group] += byCat[c.id];
  return out;
}

export function totalSpent(transactions) {
  let sum = 0;
  for (const t of transactions) sum += t.amount;
  return sum;
}

export function totalBudget() {
  let sum = 0;
  for (const c of CATEGORIES) sum += c.budget;
  return sum;
}

// Sisa aman = pemasukan - terpakai - tabungan. Satu rumus, dipakai di mana-mana.
export function safeRemainder(transactions, savings) {
  return INCOME.total - totalSpent(transactions) - savings;
}
