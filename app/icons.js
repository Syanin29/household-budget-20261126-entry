// Ikon kategori RumahTangga — digambar sendiri sebagai SVG murni.
// Setiap ikon adalah kumpulan bentuk geometris (lingkaran, persegi, poligon, path)
// pada kanvas 24x24, gaya garis: stroke currentColor, lebar 1.8, ujung membulat.
// Tidak ada aset pinjaman: semua koordinat di bawah ditulis tangan untuk situs ini.

const ICON_PATHS = {
  makan: '<path d="M4 12a8 8 0 0 1 16 0Z"/><path d="M2 12h20"/><path d="M12 4a8 8 0 0 1 8 8"/><circle cx="12" cy="12" r="2.2"/>',
  rumah: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
  transport: '<rect x="3" y="6" width="18" height="10" rx="2"/><path d="M3 11h18"/><circle cx="7.5" cy="18.5" r="1.8"/><circle cx="16.5" cy="18.5" r="1.8"/>',
  kesehatan: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  pendidikan: '<path d="M12 6c-2-1.6-5-2-8-1.5V18c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5V4.5C17 4 14 4.4 12 6Z"/><path d="M12 6v13.5"/>',
  pakaian: '<path d="M9 4 4 7l2 3 2-1v11h8V9l2 1 2-3-5-3"/><path d="M9 4a3 3 0 0 0 6 0"/>',
  hiburan: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 9.5v5l4.5-2.5Z"/>',
  'makan-luar': '<path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8Z"/><path d="M7 8a5 5 0 0 1 10 0"/><path d="M14 3l2.5-1.5"/>',
  hobi: '<circle cx="12" cy="12" r="8.5"/><path d="M7.5 9.5c1.5 1.5 3 3 4.5 4.5M15 8l3 3M9 16l3 3"/>',
  hadiah: '<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M12 10v10M4 14h16"/><path d="M12 10c-4 0-5-2.5-3.5-4C10 4.5 12 6.5 12 10Zm0 0c4 0 5-2.5 3.5-4C14 4.5 12 6.5 12 10Z"/>',
  lain: '<path d="M4 8l8-4 8 4v8l-8 4-8-4Z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  gadget: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10.5 18h3"/>',
};

// Logo situs: rumah kecil di atas koin — digambar dari poligon + lingkaran.
export const LOGO_MARK = '<svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">'
  + '<rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#2e7d46"/>'
  + '<path d="M8 17 16 10l8 7" fill="none" stroke="#faf6ec" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<path d="M10.5 15.5V22h11v-6.5" fill="none" stroke="#faf6ec" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<circle cx="16" cy="19" r="2.4" fill="#f2c14e"/></svg>';

export function iconSvg(name, size) {
  const inner = ICON_PATHS[name] || ICON_PATHS.lain;
  const s = size || 22;
  return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" '
    + 'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
}

export function iconNames() {
  return Object.keys(ICON_PATHS);
}
