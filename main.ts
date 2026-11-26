// RumahTangga 50/30/20 — program penyerahan entry (Node 22, standard library saja).
//
// Tugas program ini kecil dan tetap: salin situs statis di app/ dan hasil render di
// screenshots/ dari samping berkas ini ke direktori keluaran, lalu tulis dossier.json
// di sana dengan pustaka dossier make.fun yang divendor di vendor/makefun-frontend.ts.
// Di luar grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Program ini deterministik: dua jalan ke dua direktori menulis dossier.json yang
// byte-identik, karena isinya hanya berasal dari berkas repo.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Batas gate scorer: teks dossier 160 KiB, maksimal 4 screenshot @ 256 KiB,
// app/ maksimal 993 entri dan 16 MiB. buildDossier menolak bila ada yang lewat.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
