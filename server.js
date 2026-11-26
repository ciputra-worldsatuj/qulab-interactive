require('dotenv').config();
const http = require('http');
const os = require('os');
const app = require('./src/app');
const { Server } = require('socket.io');
const initSocket = require('./src/sockets/socketHandler');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Inisialisasi Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pasang handler socket
initSocket(io);

// Simpan instance io ke app agar bisa diakses oleh controller jika diperlukan
app.set('io', io);

// Fungsi mencari IP lokal WiFi untuk akses mahasiswa (mengabaikan adapter virtual)
function getLocalIpAddresses() {
  if (process.env.SERVER_HOST) {
    return [process.env.SERVER_HOST.trim()];
  }

  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    if (/virtual|vbox|vmware|vethernet/i.test(k)) continue;
    for (const k2 of interfaces[k]) {
      if (k2.family === 'IPv4' && !k2.internal) {
        addresses.push(k2.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  const host = ips.length > 0 ? ips[0] : 'localhost';

  console.log('====================================================');
  console.log(`[QuLab] Server berjalan di port ${PORT}`);
  console.log(`[QuLab] Akses Dosen (Laptop):      http://localhost:${PORT}/auth/login`);
  console.log(`[QuLab] Akses Peserta (WiFi HP):    http://${host}:${PORT}`);
  console.log(`[QuLab] Layar Proyektor:           http://localhost:${PORT}/proyektor/<PIN>`);
  console.log('====================================================');
});
