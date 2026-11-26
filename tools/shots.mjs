// Pengambil screenshot RumahTangga — render asli situs lewat Firefox headless.
// Dipakai ulang untuk tiap pengambilan ulang: jalankan `node tools/shots.mjs` dari root repo.
// Hasil: 4 JPEG di screenshots/ (desktop 1280x800 x3 + ponsel 390x844 x1),
// masing-masing sisi panjang <= 1280px dan ukuran <= 256 KiB (gate screenshots).
// Keempatnya halaman berbeda: dashboard, anggaran, simulator, tren (ponsel).

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

// playwright-core terinstal sekali di /tmp/pw (di luar repo, bukan bagian entry).
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

function serve(port) {
  return new Promise((resolveListen) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let path = decodeURIComponent(url.pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = resolve(join(appDir, '.' + path));
      if (!file.startsWith(appDir)) {
        res.writeHead(403).end();
        return;
      }
      try {
        const data = readFileSync(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404).end('not found');
      }
    });
    server.listen(port, '127.0.0.1', () => resolveListen(server));
  });
}

const SHOTS = [
  { file: '1-dashboard-desktop.jpg', page: 'index.html', width: 1280, height: 800 },
  { file: '2-anggaran-desktop.jpg', page: 'anggaran.html', width: 1280, height: 800 },
  { file: '3-simulator-desktop.jpg', page: 'simulator.html', width: 1280, height: 800 },
  { file: '4-tren-phone.jpg', page: 'tren.html', width: 390, height: 844 },
];

const PORT = 8123;
const server = await serve(PORT);
const browser = await firefox.launch({ executablePath: findFirefox() });
mkdirSync(shotsDir, { recursive: true });

let failures = 0;
for (const shot of SHOTS) {
  const context = await browser.newContext({ viewport: { width: shot.width, height: shot.height } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:' + PORT + '/' + shot.page, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const out = join(shotsDir, shot.file);
  await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
  const size = statSync(out).size;
  console.log(shot.file + ' ' + shot.width + 'x' + shot.height + ' ' + size + ' bytes' + (errors.length ? ' CONSOLE-ERROR: ' + errors.join(' | ') : ''));
  if (size > 262144) { console.log('FAIL: ' + shot.file + ' melebihi 256 KiB'); failures += 1; }
  if (errors.length) failures += 1;
  await context.close();
}

await browser.close();
server.close();
if (failures > 0) {
  console.log('shots: ' + failures + ' masalah');
  process.exit(1);
}
console.log('shots: 4/4 OK');
