/**
 * Normalisasi nama peserta:
 * Menghilangkan spasi ganda, trim, dan ubah ke huruf kecil.
 * Digunakan untuk identifikasi unik peserta (FR-PES-04, SRS Sec 17).
 */
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

module.exports = {
  normalizeName
};
