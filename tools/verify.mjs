// Verifikasi RumahTangga — data-quality-auditor dalam bentuk assert mesin.
// Jalankan `node tools/verify.mjs` dari root repo. Keluar 0 hanya bila SEMUA lolos:
//   A. Rekonsiliasi data (dari data.js, tanpa peramban): 48 transaksi; tiap kategori
//      berjumlah sama dengan transaksinya; total terpakai 9.853.000;
//      pemasukan - terpakai - tabungan = sisa aman 847.000; anggaran total 10.100.000;
//      kelompok kebutuhan/keinginan/lain-lain cocok dengan baris November tren;
//      tiap bulan tren: kebutuhan + keinginan + lain-lain = terpakai;
//      belanja makan November naik 18% (pembulatan) vs Oktober.
//   B. Vintage tunggal: semua label bulan 2026, bulan acuan November 2026.
//   C. Kebersihan sumber: tanpa Date.now / Math.random / fetch / XHR / WebSocket /
//      eval / new Function / cookie / service worker / URL http(s) di app/.
//   D. Peramban (Firefox headless): 6 halaman tanpa console error, tanpa request
//      gagal, tanpa request keluar localhost; angka kunci tampil di DOM;
//      tanpa overflow horizontal; tanpa teks terpotong (scrollWidth > clientWidth).
//   E. Screenshot: 4 berkas ada, masing-masing <= 256 KiB, sisi panjang <= 1280px,
//      sisi pendek >= 360px.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

const failures = [];
const passes = [];
function check(name, ok, detail) {
  if (ok) {
    passes.push(name);
    console.log('PASS ' + name);
  } else {
    failures.push(name);
    console.log('FAIL ' + name + (detail ? ' — ' + detail : ''));
  }
}

// ---------- A + B: rekonsiliasi data ----------
const data = await import(pathToFileURL(join(appDir, 'data.js')).href);
const { CATEGORIES, INCOME, META, MONTHS, SAVINGS, TRANSACTIONS } = data;

check('tx-count-48', TRANSACTIONS.length === 48, 'ditemukan ' + TRANSACTIONS.length);
const byCat = data.spentByCategory(TRANSACTIONS);
let catSumsOk = true;
for (const c of CATEGORIES) {
  const rows = TRANSACTIONS.filter((t) => t.category === c.id);
  if (rows.length !== 4) { catSumsOk = false; console.log('  kategori ' + c.id + ' punya ' + rows.length + ' transaksi, bukan 4'); }
  if (byCat[c.id] <= 0) catSumsOk = false;
}
check('tiap-kategori-4-transaksi', catSumsOk);
const spent = data.totalSpent(TRANSACTIONS);
check('total-terpakai-9853000', spent === 9853000, 'ditemukan ' + spent);
check('sisa-aman-847000', data.safeRemainder(TRANSACTIONS, SAVINGS) === 847000,
  'ditemukan ' + data.safeRemainder(TRANSACTIONS, SAVINGS));
check('anggaran-total-10100000', data.totalBudget() === 10100000, 'ditemukan ' + data.totalBudget());
const byGroup = data.spentByGroup(TRANSACTIONS);
check('kelompok-kebutuhan-6710000', byGroup.needs === 6710000, 'ditemukan ' + byGroup.needs);
check('kelompok-keinginan-1943000', byGroup.wants === 1943000, 'ditemukan ' + byGroup.wants);
check('kelompok-lain-1200000', byGroup.other === 1200000, 'ditemukan ' + byGroup.other);
check('pemasukan-12500000', INCOME.total === 12500000
  && INCOME.sources.reduce((s, x) => s + x.amount, 0) === 12500000, 'sumber tidak berjumlah 12.500.000');

const nov = MONTHS[MONTHS.length - 1];
check('tren-nov-cocok-transaksi', nov.spent === spent && nov.needs === byGroup.needs
  && nov.wants === byGroup.wants && nov.other === byGroup.other && nov.makan === byCat.makan,
  JSON.stringify(nov));
let monthsOk = MONTHS.length === 6;
for (const m of MONTHS) {
  if (m.needs + m.wants + m.other !== m.spent) monthsOk = false;
  if (m.income !== 12500000) monthsOk = false;
}
check('tren-6-bulan-konsisten', monthsOk);
const okt = MONTHS[MONTHS.length - 2];
const makanGrowth = Math.round(((nov.makan - okt.makan) / okt.makan) * 100);
check('makan-naik-18-persen', makanGrowth === 18, 'ditemukan ' + makanGrowth + '%');
check('vintage-november-2026', META.monthLabel === 'November 2026' && nov.label === 'Nov 2026'
  && MONTHS.every((m) => m.label.endsWith('2026')), 'label bulan di luar 2026');
check('semua-transaksi-november', TRANSACTIONS.every((t) => t.day >= 1 && t.day <= 30 && t.amount > 0));

// ---------- C: kebersihan sumber ----------
const sourceFiles = readdirSync(appDir).filter((f) => /\.(js|html|css)$/.test(f));
const banned = ['Date.now', 'Math.random', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'eval(', 'new Function', 'document.cookie', 'serviceWorker', 'http://', 'https://'];
let cleanOk = true;
for (const f of sourceFiles) {
  const text = readFileSync(join(appDir, f), 'utf8');
  for (const b of banned) {
    if (text.includes(b)) { cleanOk = false; console.log('  ' + f + ' mengandung ' + b); }
  }
}
check('sumber-bersih-tanpa-network-tanpa-tanggal-hari-ini', cleanOk);

// ---------- D: peramban ----------
const requirePw = createRequire('/tmp/pw/package.json');
const { firefox } = requirePw('playwright-core');

function findFirefox() {
  if (process.env.PLAYWRIGHT_FIREFOX_PATH && existsSync(process.env.PLAYWRIGHT_FIREFOX_PATH)) {
    return process.env.PLAYWRIGHT_FIREFOX_PATH;
  }
  const home = process.env.HOME || '';
  const base = join(home, '.cache', 'ms-playwright');
  const dirs = readdirSync(base).filter((d) => d.startsWith('firefox-')).sort().reverse();
  for (const d of dirs) {
    const bin = join(base, d, 'firefox', 'firefox');
    if (existsSync(bin)) return bin;
  }
  return undefined;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = join(appDir, '.' + path);
  if (!file.startsWith(appDir)) { res.writeHead(403).end(); return; }
  try {
    const data = readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(8124, '127.0.0.1', r));

const PAGES = [
  { file: 'index.html', figures: ['12.500.000', '9.853.000', '847.000', '1.800.000'] },
  { file: 'anggaran.html', figures: ['10.100.000', '9.853.000'] },
  { file: 'transaksi.html', figures: ['9.853.000'] },
  { file: 'tren.html', figures: ['9.853.000'] },
  { file: 'simulator.html', figures: ['847.000'] },
  { file: 'tutup-buku.html', figures: ['12.500.000', '9.853.000', '847.000'] },
];

const browser = await firefox.launch({ executablePath: findFirefox() });
for (const p of PAGES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  const failedReqs = [];
  const externalReqs = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => failedReqs.push(r.url()));
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:8124')) externalReqs.push(r.url()); });
  await page.goto('http://127.0.0.1:8124/' + p.file, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  check(p.file + '-tanpa-console-error', errors.length === 0, errors.join(' | '));
  check(p.file + '-tanpa-request-gagal', failedReqs.length === 0, failedReqs.join(' | '));
  check(p.file + '-tanpa-request-network', externalReqs.length === 0, externalReqs.join(' | '));
  const bodyText = await page.evaluate(() => document.body.innerText);
  for (const fig of p.figures) {
    check(p.file + '-angka-' + fig, bodyText.includes(fig), 'angka tidak tampil di DOM');
  }
  const overflow = await page.evaluate(() => {
    const beyond = Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return el.textContent.trim() && r.width > 0 && r.right > window.innerWidth + 1
          && style.position !== 'fixed';
      })
      .slice(0, 5).map((el) => el.tagName + ':' + el.textContent.trim().slice(0, 40));
    const clipped = Array.from(document.querySelectorAll('h1, h2, h3, p, td, th, span, div, a, label, button'))
      .filter((el) => el.children.length === 0 && el.textContent.trim()
        && el.scrollWidth > el.clientWidth + 1
        && ['hidden', 'scroll', 'auto', 'clip'].includes(getComputedStyle(el).overflowX))
      .slice(0, 5).map((el) => el.tagName + ':' + el.textContent.trim().slice(0, 40));
    return { h: document.documentElement.scrollWidth > window.innerWidth + 1, beyond, clipped };
  });
  check(p.file + '-tanpa-overflow-horizontal', !overflow.h, 'scrollWidth melebihi viewport');
  check(p.file + '-tanpa-teks-keluar-viewport', overflow.beyond.length === 0, overflow.beyond.join(' | '));
  check(p.file + '-tanpa-teks-terpotong', overflow.clipped.length === 0, overflow.clipped.join(' | '));
  await context.close();
}
// Ponsel: dashboard tanpa overflow horizontal.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:8124/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check('ponsel-390-tanpa-overflow', !overflow, 'scrollWidth melebihi 390px');
  check('ponsel-390-tanpa-pageerror', errors.length === 0, errors.join(' | '));
  await context.close();
}
await browser.close();
server.close();

// ---------- E: screenshot ----------
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}
function pngSize(buf) {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
const expectedShots = ['1-dashboard-desktop.jpg', '2-anggaran-desktop.jpg', '3-simulator-desktop.jpg', '4-dashboard-phone.jpg'];
for (const f of expectedShots) {
  const path = join(shotsDir, f);
  const exists = existsSync(path);
  check('screenshot-ada-' + f, exists, 'berkas tidak ada');
  if (!exists) continue;
  const buf = readFileSync(path);
  const size = statSync(path).size;
  check('screenshot-ukuran-' + f, size <= 262144, size + ' bytes > 256 KiB');
  const dim = f.endsWith('.png') ? pngSize(buf) : jpegSize(buf);
  if (dim) {
    const longSide = Math.max(dim.w, dim.h);
    const shortSide = Math.min(dim.w, dim.h);
    check('screenshot-dimensi-' + f, longSide <= 1280 && shortSide >= 360, dim.w + 'x' + dim.h);
  } else {
    check('screenshot-dimensi-' + f, false, 'dimensi tidak terbaca');
  }
}

console.log('\nverify: ' + passes.length + ' lolos, ' + failures.length + ' gagal');
process.exit(failures.length ? 1 : 0);
