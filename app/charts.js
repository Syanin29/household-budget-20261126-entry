// Chart RumahTangga — SVG murni yang dihitung dari data (pola d3js-visualization).
// Tidak ada library chart: skala linear, skala band, dan busur donut dihitung sendiri
// di bawah (domain -> range, sudut -> koordinat polar), lalu dirangkai jadi string SVG.
// Setiap fungsi menerima data mentah dan mengembalikan markup <svg> lengkap.

function linearScale(domainMax, rangeMax) {
  return function (v) {
    return rangeMax - (v / domainMax) * rangeMax;
  };
}

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, rOuter, startDeg);
  const [x2, y2] = polar(cx, cy, rOuter, endDeg);
  const [x3, y3] = polar(cx, cy, rInner, endDeg);
  const [x4, y4] = polar(cx, cy, rInner, startDeg);
  return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1)
    + ' A' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1)
    + ' L' + x3.toFixed(1) + ' ' + y3.toFixed(1)
    + ' A' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + x4.toFixed(1) + ' ' + y4.toFixed(1) + ' Z';
}

export function fmtShort(n) {
  if (n >= 1000000) {
    const jt = n / 1000000;
    return 'Rp ' + (Number.isInteger(jt) ? String(jt) : jt.toFixed(2).replace(/0$/, '')) + ' jt';
  }
  if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return 'Rp ' + String(n);
}

// Donut pembagian pemasukan: irisan = bagian dari total pemasukan.
export function donutChart(parts, size) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 6;
  const rInner = rOuter - 34;
  let angle = 0;
  let slices = '';
  for (const p of parts) {
    const sweep = (p.value / total) * 360;
    if (sweep <= 0) continue;
    const end = angle + sweep;
    slices += '<path d="' + arcPath(cx, cy, rOuter, rInner, angle, end - 0.6) + '" fill="' + p.color + '">'
      + '<title>' + p.label + ': ' + p.pctText + '</title></path>';
    angle = end;
  }
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size
    + '" role="img" aria-label="Donat pembagian pemasukan November 2026">' + slices
    + '<text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" font-size="13" fill="#5c5546">Sisa aman</text>'
    + '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#1e3d29">' + parts.centerText + '</text>'
    + '</svg>';
}

// Bar vertikal berkelompok: pemasukan vs terpakai per bulan.
export function trendBars(months, width, height) {
  const maxV = 13000000;
  const padL = 46;
  const padB = 26;
  const padT = 14;
  const innerW = width - padL - 12;
  const innerH = height - padT - padB;
  const y = linearScale(maxV, innerH);
  const slot = innerW / months.length;
  const barW = Math.min(26, (slot - 18) / 2);
  let bars = '';
  let labels = '';
  months.forEach((m, i) => {
    const x0 = padL + i * slot + (slot - barW * 2 - 6) / 2;
    const hInc = innerH - y(m.income);
    const hSp = innerH - y(m.spent);
    bars += '<rect x="' + x0.toFixed(1) + '" y="' + (padT + y(m.income)).toFixed(1) + '" width="' + barW
      + '" height="' + hInc.toFixed(1) + '" rx="3" fill="#2e7d46"><title>' + m.label + ' masuk ' + fmtShort(m.income) + '</title></rect>';
    bars += '<rect x="' + (x0 + barW + 6).toFixed(1) + '" y="' + (padT + y(m.spent)).toFixed(1) + '" width="' + barW
      + '" height="' + hSp.toFixed(1) + '" rx="3" fill="#c98a1b"><title>' + m.label + ' terpakai ' + fmtShort(m.spent) + '</title></rect>';
    labels += '<text x="' + (padL + i * slot + slot / 2).toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="11" fill="#5c5546">' + m.label + '</text>';
  });
  let grid = '';
  [0, 5000000, 10000000].forEach((v) => {
    const gy = padT + y(v);
    grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (width - 12) + '" y2="' + gy.toFixed(1) + '" stroke="#e3dcc8" stroke-width="1"/>'
      + '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="#5c5546">' + (v / 1000000) + ' jt</text>';
  });
  return '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img" aria-label="Grafik batang pemasukan dan pengeluaran Juni sampai November 2026">'
    + grid + bars + labels + '</svg>';
}

// Bar bertumpuk: kebutuhan + keinginan + lain-lain per bulan.
export function stackedBars(months, width, height) {
  const maxV = 13000000;
  const padL = 46;
  const padB = 26;
  const padT = 14;
  const innerW = width - padL - 12;
  const innerH = height - padT - padB;
  const y = linearScale(maxV, innerH);
  const slot = innerW / months.length;
  const barW = Math.min(44, slot - 28);
  const colors = { needs: '#2e7d46', wants: '#c98a1b', other: '#5b7a99' };
  let bars = '';
  let labels = '';
  months.forEach((m, i) => {
    const x = padL + i * slot + (slot - barW) / 2;
    let acc = 0;
    ['needs', 'wants', 'other'].forEach((g) => {
      const v = m[g];
      const h = (v / maxV) * innerH;
      bars += '<rect x="' + x.toFixed(1) + '" y="' + (padT + innerH - acc - h).toFixed(1) + '" width="' + barW
        + '" height="' + h.toFixed(1) + '" fill="' + colors[g] + '"><title>' + m.label + ' ' + g + ' ' + fmtShort(v) + '</title></rect>';
      acc += h;
    });
    labels += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="11" fill="#5c5546">' + m.label + '</text>';
  });
  let grid = '';
  [0, 5000000, 10000000].forEach((v) => {
    const gy = padT + y(v);
    grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (width - 12) + '" y2="' + gy.toFixed(1) + '" stroke="#e3dcc8" stroke-width="1"/>'
      + '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="#5c5546">' + (v / 1000000) + ' jt</text>';
  });
  return '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img" aria-label="Grafik batang bertumpuk pengeluaran per kelompok Juni sampai November 2026">'
    + grid + bars + labels + '</svg>';
}

// Garis arus kas: surplus bulanan (masuk - terpakai) Juni–November.
export function cashLine(months, width, height) {
  const padL = 46;
  const padB = 26;
  const padT = 16;
  const innerW = width - padL - 12;
  const innerH = height - padT - padB;
  const values = months.map((m) => m.income - m.spent);
  const maxV = 4000000;
  const y = linearScale(maxV, innerH);
  const step = innerW / (months.length - 1);
  const pts = values.map((v, i) => [padL + i * step, padT + y(v)]);
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  let dots = '';
  let labels = '';
  pts.forEach((p, i) => {
    dots += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5" fill="#2e7d46" stroke="#fffdf7" stroke-width="2"><title>'
      + months[i].label + ' surplus ' + fmtShort(values[i]) + '</title></circle>';
    labels += '<text x="' + p[0].toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="11" fill="#5c5546">' + months[i].label + '</text>';
    labels += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] - 10).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3d29">' + fmtShort(values[i]) + '</text>';
  });
  let grid = '';
  [0, 2000000, 4000000].forEach((v) => {
    const gy = padT + y(v);
    grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (width - 12) + '" y2="' + gy.toFixed(1) + '" stroke="#e3dcc8" stroke-width="1"/>'
      + '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="#5c5546">' + (v / 1000000) + ' jt</text>';
  });
  return '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img" aria-label="Grafik garis surplus bulanan Juni sampai November 2026">'
    + grid + '<path d="' + line + '" fill="none" stroke="#2e7d46" stroke-width="2.5" stroke-linejoin="round"/>' + dots + labels + '</svg>';
}

// Garis belanja makan 6 bulan (dipakai di halaman Tren).
export function makanLine(months, width, height) {
  const padL = 46;
  const padB = 26;
  const padT = 16;
  const innerW = width - padL - 12;
  const innerH = height - padT - padB;
  const maxV = 2500000;
  const y = linearScale(maxV, innerH);
  const step = innerW / (months.length - 1);
  const pts = months.map((m, i) => [padL + i * step, padT + y(m.makan)]);
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  let dots = '';
  let labels = '';
  pts.forEach((p, i) => {
    dots += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5" fill="#c98a1b" stroke="#fffdf7" stroke-width="2"><title>'
      + months[i].label + ' makan ' + fmtShort(months[i].makan) + '</title></circle>';
    labels += '<text x="' + p[0].toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="11" fill="#5c5546">' + months[i].label + '</text>';
    labels += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] - 10).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3d29">' + fmtShort(months[i].makan) + '</text>';
  });
  let grid = '';
  [0, 1000000, 2000000].forEach((v) => {
    const gy = padT + y(v);
    grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (width - 12) + '" y2="' + gy.toFixed(1) + '" stroke="#e3dcc8" stroke-width="1"/>'
      + '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="#5c5546">' + (v / 1000000) + ' jt</text>';
  });
  return '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img" aria-label="Grafik garis belanja makan Juni sampai November 2026">'
    + grid + '<path d="' + line + '" fill="none" stroke="#c98a1b" stroke-width="2.5" stroke-linejoin="round"/>' + dots + labels + '</svg>';
}
