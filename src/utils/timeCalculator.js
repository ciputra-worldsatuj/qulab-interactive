/**
 * Perhitungan Waktu dan Poin (Integritas Server)
 * Reference: NFR-08 (Waktu diukur di server, bukan jam HP)
 */
function calculateScore(timeLimitSeconds, timeElapsedMs, basePoints = 1000) {
  const maxMs = timeLimitSeconds * 1000;
  if (timeElapsedMs >= maxMs) return 0;
  
  // Skor kecepatan berkurang linear sesuai waktu respons
  const score = Math.round(basePoints * (1 - (timeElapsedMs / (2 * maxMs))));
  return Math.max(score, 0);
}

module.exports = {
  calculateScore
};
