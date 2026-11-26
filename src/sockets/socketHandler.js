const SesiModel = require('../models/SesiModel');
const PesertaModel = require('../models/PesertaModel');
const { calculateScore } = require('../utils/timeCalculator');

// Penyimpanan sesi aktif dalam memori server
const activeSessions = new Map();

function initSocket(io) {
  io.on('connection', (socket) => {
    // console.log(`[Socket Connected] ID: ${socket.id}`);

    // ==========================================
    // 1. HOST / DOSEN JOIN ROOM KONTROL
    // ==========================================
    socket.on('dosen_join', async ({ pin }) => {
      socket.join(`sesi:${pin}`);
      socket.join(`dosen:${pin}`);
      socket.pin = pin;
      socket.isDosen = true;

      const sesi = await SesiModel.getByPin(pin);
      if (sesi) {
        const pesertaList = await PesertaModel.getBySesi(sesi.id);
        socket.emit('sync_peserta_lobby', { pesertaList, total: pesertaList.length });
      }
    });

    // ==========================================
    // 2. PROYEKTOR JOIN ROOM
    // ==========================================
    socket.on('proyektor_join', async ({ pin }) => {
      socket.join(`sesi:${pin}`);
      socket.join(`proyektor:${pin}`);
      socket.pin = pin;
      socket.isProyektor = true;

      const sesi = await SesiModel.getByPin(pin);
      if (sesi) {
        const pesertaList = await PesertaModel.getBySesi(sesi.id);
        socket.emit('sync_peserta_lobby', { pesertaList, total: pesertaList.length });

        // Jika sesi sudah berjalan di tengah jalan, sinkronkan keadaan saat ini
        const sessionState = activeSessions.get(pin);
        if (sessionState && sessionState.currentSoal) {
          socket.emit('soal_ditampilkan_proyektor', {
            soalIndex: sessionState.soalIndex + 1,
            totalSoal: sessionState.soalList.length,
            soal: sessionState.currentSoal,
            waktuDetik: sessionState.currentSoal.waktu_detik,
            answeredCount: sessionState.answeredCount,
            totalPeserta: sessionState.totalPeserta
          });
        }
      }
    });

    // ==========================================
    // 3. PESERTA JOIN LOBBY (UF-06, UF-09)
    // ==========================================
    socket.on('peserta_join', async ({ pin, pesertaId, nama }) => {
      socket.join(`sesi:${pin}`);
      socket.pin = pin;
      socket.pesertaId = pesertaId;
      socket.pesertaNama = nama;

      try {
        const sesi = await SesiModel.getByPin(pin);
        if (!sesi) {
          return socket.emit('sesi_error', { message: 'Sesi kuis tidak aktif atau tidak ditemukan.' });
        }

        // Ambil daftar peserta terbaru
        const pesertaList = await PesertaModel.getBySesi(sesi.id);

        // Perbarui data di state memori sesi jika ada
        const sessionState = activeSessions.get(pin);
        if (sessionState) {
          sessionState.totalPeserta = pesertaList.length;
        }

        // Broadcast penambahan peserta ke Dosen dan Layar Proyektor (FR-LOB-02)
        io.to(`dosen:${pin}`).emit('peserta_update', { pesertaList, total: pesertaList.length });
        io.to(`proyektor:${pin}`).emit('peserta_update', { pesertaList, total: pesertaList.length });

        // Konfirmasi sukses masuk lobby ke peserta
        socket.emit('peserta_joined_success', {
          sesiId: sesi.id,
          pin: sesi.pin,
          matkulNama: sesi.matkul_nama,
          status: sesi.status
        });

        // Bila peserta reconnect saat kuis sedang berjalan (FR-PES-05)
        if (sessionState && sessionState.status === 'soal' && sessionState.currentSoal) {
          kirimSoalKePeserta(socket, sessionState);
        }
      } catch (err) {
        console.error('[Peserta Join Error]:', err);
        socket.emit('sesi_error', { message: 'Gagal terhubung ke sesi.' });
      }
    });

    // ==========================================
    // 4. KICK PESERTA OLEH DOSEN (UF-06, FR-LOB-04)
    // ==========================================
    socket.on('kick_peserta', async ({ pin, pesertaId }) => {
      if (!socket.isDosen) return;

      try {
        await PesertaModel.kick(pesertaId);

        // Cari socket peserta terkait dan beri notifikasi kicked
        const socketsInRoom = await io.in(`sesi:${pin}`).fetchSockets();
        for (const s of socketsInRoom) {
          if (s.pesertaId === parseInt(pesertaId, 10)) {
            s.emit('kicked', { message: 'Anda telah dikeluarkan dari sesi.' });
            s.leave(`sesi:${pin}`);
            break;
          }
        }

        const sesi = await SesiModel.getByPin(pin);
        if (sesi) {
          const pesertaList = await PesertaModel.getBySesi(sesi.id);
          io.to(`dosen:${pin}`).emit('peserta_update', { pesertaList, total: pesertaList.length });
          io.to(`proyektor:${pin}`).emit('peserta_update', { pesertaList, total: pesertaList.length });
        }
      } catch (err) {
        console.error('[Kick Error]:', err);
      }
    });

    // ==========================================
    // 5. MULAI KUIS (UF-07, FR-RUN-01)
    // ==========================================
    socket.on('mulai_kuis', async ({ pin }) => {
      if (!socket.isDosen) return;

      try {
        const sesi = await SesiModel.getByPin(pin);
        if (!sesi) return;

        await SesiModel.updateStatus(sesi.id, 'berjalan');
        const soalList = await SesiModel.getSoalList(sesi.id);

        if (soalList.length === 0) {
          return socket.emit('sesi_error', { message: 'Sesi tidak memiliki soal.' });
        }

        const pesertaList = await PesertaModel.getBySesi(sesi.id);

        // Inisialisasi State Sesi Aktif di Server
        const sessionState = {
          sesiId: sesi.id,
          pin,
          status: 'soal',
          soalIndex: 0,
          soalList,
          totalPeserta: pesertaList.length,
          currentSoal: null,
          soalStartTime: 0,
          timerInterval: null,
          answeredParticipants: new Set(),
          answeredCount: 0
        };

        activeSessions.set(pin, sessionState);

        // Siarkan awal kuis ke proyektor dan peserta
        io.to(`sesi:${pin}`).emit('kuis_dimulai', {
          totalSoal: soalList.length,
          matkulNama: sesi.matkul_nama
        });

        // Jalankan soal pertama
        jalankanSoal(io, pin, sessionState);
      } catch (err) {
        console.error('[Mulai Kuis Error]:', err);
      }
    });

    // ==========================================
    // 6. KIRIM JAWABAN PESERTA (UF-10, FR-RUN-02, 03)
    // ==========================================
    socket.on('kirim_jawaban', async ({ pin, sesiSoalId, opsiIds }) => {
      const sessionState = activeSessions.get(pin);
      if (!sessionState || sessionState.status !== 'soal') return;

      const pesertaId = socket.pesertaId;
      if (!pesertaId || sessionState.answeredParticipants.has(pesertaId)) return;

      // Hitung waktu elapsed di server (NFR-08)
      const now = Date.now();
      const timeElapsedMs = Math.max(0, now - sessionState.soalStartTime);
      const waktuDetik = sessionState.currentSoal.waktu_detik;

      // Verifikasi jawaban benar
      const selectedIds = Array.isArray(opsiIds) ? opsiIds.map(Number) : [Number(opsiIds)];
      const benarOpsiIds = sessionState.currentSoal.opsi.filter(o => o.is_benar === 1 || o.is_benar === true).map(o => o.id);

      // Logika penilaian: single choice atau multiple checkboxes
      let isBenar = false;
      if (selectedIds.length === benarOpsiIds.length && selectedIds.every(id => benarOpsiIds.includes(id))) {
        isBenar = true;
      }

      // Hitung skor kecepatan linear
      const basePoints = sessionState.currentSoal.poin || 1000;
      const score = isBenar ? calculateScore(waktuDetik, timeElapsedMs, basePoints) : 0;

      // Simpan jawaban ke database
      try {
        await PesertaModel.recordJawaban({
          sesi_soal_id: sesiSoalId,
          peserta_id: pesertaId,
          waktu_jawab_ms: timeElapsedMs,
          poin: score,
          benar: isBenar,
          opsi_ids: selectedIds
        });

        sessionState.answeredParticipants.add(pesertaId);
        sessionState.answeredCount++;

        // Kunci jawaban di HP peserta (feedback M-04)
        socket.emit('jawaban_terkunci', {
          selectedIds,
          isMulti: benarOpsiIds.length > 1
        });

        // Beritahu proyektor & dosen jumlah peserta yang telah menjawab
        io.to(`proyektor:${pin}`).emit('jawaban_masuk', {
          answeredCount: sessionState.answeredCount,
          totalPeserta: sessionState.totalPeserta
        });
        io.to(`dosen:${pin}`).emit('jawaban_masuk', {
          answeredCount: sessionState.answeredCount,
          totalPeserta: sessionState.totalPeserta
        });

        // Aturan Selesai Lebih Awal jika seluruh peserta aktif sudah menjawab (SRS Sec 24.1)
        if (sessionState.answeredCount >= sessionState.totalPeserta && sessionState.totalPeserta > 0) {
          akhiriSoal(io, pin, sessionState);
        }
      } catch (err) {
        console.error('[Record Jawaban Error]:', err);
      }
    });

    // ==========================================
    // 7. KONTROL LANJUT / SCOREBOARD (UF-07)
    // ==========================================
    socket.on('tampil_scoreboard', async ({ pin }) => {
      if (!socket.isDosen) return;
      const sessionState = activeSessions.get(pin);
      if (!sessionState) return;

      sessionState.status = 'scoreboard';
      const top3 = await PesertaModel.getLeaderboard(sessionState.sesiId, 3);
      io.to(`proyektor:${pin}`).emit('tampil_scoreboard', { top3 });
      io.to(`dosen:${pin}`).emit('tampil_scoreboard', { top3 });
    });

    socket.on('soal_berikutnya', async ({ pin }) => {
      if (!socket.isDosen) return;
      const sessionState = activeSessions.get(pin);
      if (!sessionState) return;

      sessionState.soalIndex++;
      if (sessionState.soalIndex < sessionState.soalList.length) {
        jalankanSoal(io, pin, sessionState);
      } else {
        akhiriKuis(io, pin, sessionState);
      }
    });

    socket.on('akhiri_sesi_manual', async ({ pin }) => {
      if (!socket.isDosen) return;
      const sessionState = activeSessions.get(pin);
      if (sessionState) {
        akhiriKuis(io, pin, sessionState);
      }
    });
  });
}

// Helper: Menjalankan satu soal
function jalankanSoal(io, pin, sessionState) {
  if (sessionState.timerInterval) clearInterval(sessionState.timerInterval);

  const soal = sessionState.soalList[sessionState.soalIndex];
  sessionState.currentSoal = soal;
  sessionState.status = 'soal';
  sessionState.soalStartTime = Date.now();
  sessionState.answeredParticipants = new Set();
  sessionState.answeredCount = 0;

  const waktuDetik = soal.waktu_detik || 20;

  // 1. Tampilkan ke Layar Proyektor (pertanyaan, gambar opsional, opsi 2x2 tanpa tanda benar)
  io.to(`proyektor:${pin}`).emit('soal_ditampilkan_proyektor', {
    soalIndex: sessionState.soalIndex + 1,
    totalSoal: sessionState.soalList.length,
    soal: {
      id: soal.id,
      sesi_soal_id: soal.sesi_soal_id,
      teks: soal.teks,
      gambar_path: soal.gambar_path,
      waktu_detik: waktuDetik,
      poin: soal.poin,
      opsi: soal.opsi.map(o => ({ id: o.id, urutan: o.urutan, teks: o.teks }))
    },
    waktuDetik,
    answeredCount: 0,
    totalPeserta: sessionState.totalPeserta
  });

  // 2. Beritahu Dosen
  io.to(`dosen:${pin}`).emit('soal_ditampilkan_dosen', {
    soalIndex: sessionState.soalIndex + 1,
    totalSoal: sessionState.soalList.length,
    soal,
    waktuDetik,
    answeredCount: 0,
    totalPeserta: sessionState.totalPeserta
  });

  // 3. Tampilkan ke seluruh Peserta (acak urutan opsi per sesi)
  io.to(`sesi:${pin}`).emit('soal_ditampilkan_peserta', {
    soalIndex: sessionState.soalIndex + 1,
    totalSoal: sessionState.soalList.length,
    sesiSoalId: soal.sesi_soal_id,
    teks: soal.teks,
    gambar_path: soal.gambar_path,
    waktuDetik,
    isMulti: soal.opsi.filter(o => o.is_benar === 1 || o.is_benar === true).length > 1,
    opsi: soal.opsi.map(o => ({ id: o.id, urutan: o.urutan, teks: o.teks }))
  });

  // Server Countdown Timer (NFR-08)
  let sisaWaktu = waktuDetik;
  sessionState.timerInterval = setInterval(() => {
    sisaWaktu--;
    if (sisaWaktu <= 0) {
      clearInterval(sessionState.timerInterval);
      akhiriSoal(io, pin, sessionState);
    }
  }, 1000);
}

// Helper khusus saat peserta baru bergabung / reconnect di tengah soal
function kirimSoalKePeserta(socket, sessionState) {
  const soal = sessionState.currentSoal;
  const elapsed = Math.floor((Date.now() - sessionState.soalStartTime) / 1000);
  const sisa = Math.max(0, (soal.waktu_detik || 20) - elapsed);

  socket.emit('soal_ditampilkan_peserta', {
    soalIndex: sessionState.soalIndex + 1,
    totalSoal: sessionState.soalList.length,
    sesiSoalId: soal.sesi_soal_id,
    teks: soal.teks,
    gambar_path: soal.gambar_path,
    waktuDetik: sisa,
    isMulti: soal.opsi.filter(o => o.is_benar === 1 || o.is_benar === true).length > 1,
    opsi: soal.opsi.map(o => ({ id: o.id, urutan: o.urutan, teks: o.teks }))
  });
}

// Helper: Mengakhiri satu soal (waktu habis / semua menjawab)
async function akhiriSoal(io, pin, sessionState) {
  if (sessionState.timerInterval) {
    clearInterval(sessionState.timerInterval);
    sessionState.timerInterval = null;
  }
  sessionState.status = 'hasil_soal';

  try {
    const sesiSoalId = sessionState.currentSoal.sesi_soal_id;
    const distribusi = await PesertaModel.getDistribusiJawaban(sesiSoalId);

    // Kunci jawaban benar
    const kunciBenarIds = sessionState.currentSoal.opsi
      .filter(o => o.is_benar === 1 || o.is_benar === true)
      .map(o => o.id);

    // Kirim grafik sebaran ke Proyektor dan Dosen (P-03, FR-RUN-04)
    io.to(`proyektor:${pin}`).emit('hasil_soal_proyektor', {
      distribusi,
      kunciBenarIds
    });
    io.to(`dosen:${pin}`).emit('hasil_soal_dosen', {
      distribusi,
      kunciBenarIds,
      isLastSoal: sessionState.soalIndex + 1 >= sessionState.soalList.length
    });

    // Kirim status jawaban ke masing-masing HP peserta (M-05, UF-11)
    const socketsInRoom = await io.in(`sesi:${pin}`).fetchSockets();
    for (const s of socketsInRoom) {
      if (s.pesertaId) {
        const { query } = require('../../config/database');
        const [jawabanRow] = await query(
          'SELECT poin, benar FROM jawaban WHERE sesi_soal_id = ? AND peserta_id = ? LIMIT 1',
          [sesiSoalId, s.pesertaId]
        );

        s.emit('hasil_soal_peserta', {
          isAnswered: !!jawabanRow,
          isBenar: jawabanRow ? Boolean(jawabanRow.benar) : false,
          poin: jawabanRow ? parseFloat(jawabanRow.poin) : 0,
          kunciBenarIds
        });
      }
    }
  } catch (err) {
    console.error('[Akhiri Soal Error]:', err);
  }
}

// Helper: Mengakhiri seluruh sesi kuis
async function akhiriKuis(io, pin, sessionState) {
  if (sessionState.timerInterval) clearInterval(sessionState.timerInterval);
  sessionState.status = 'selesai';

  try {
    await SesiModel.updateStatus(sessionState.sesiId, 'selesai');

    // Podium 3 besar (P-05, UF-07)
    const top3 = await PesertaModel.getLeaderboard(sessionState.sesiId, 3);
    io.to(`proyektor:${pin}`).emit('kuis_selesai_proyektor', { top3 });
    io.to(`dosen:${pin}`).emit('kuis_selesai_dosen', { sesiId: sessionState.sesiId });

    // Nilai akhir persentase ke HP masing-masing peserta (M-06, UF-11)
    const riwayatData = await SesiModel.getRiwayatDetail(sessionState.sesiId);
    if (riwayatData && riwayatData.peserta) {
      const pesertaMap = {};
      riwayatData.peserta.forEach(p => { pesertaMap[p.id] = p; });

      const socketsInRoom = await io.in(`sesi:${pin}`).fetchSockets();
      for (const s of socketsInRoom) {
        if (s.pesertaId && pesertaMap[s.pesertaId]) {
          const p = pesertaMap[s.pesertaId];
          s.emit('kuis_selesai_peserta', {
            peringkat: p.peringkat,
            totalPoin: p.total_poin,
            persentase: p.persentase,
            jumlahBenar: p.jumlah_benar || 0,
            jumlahSalah: p.jumlah_salah || 0
          });
        }
      }
    }

    activeSessions.delete(pin);
  } catch (err) {
    console.error('[Akhiri Kuis Error]:', err);
  }
}

module.exports = initSocket;
