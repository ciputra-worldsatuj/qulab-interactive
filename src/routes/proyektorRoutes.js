const express = require('express');
const router = express.Router();
const os = require('os');
const QRCode = require('qrcode');
const { renderWithLayout } = require('../utils/renderHelper');

function getPrimaryIp() {
  // 1. Jika diisi manual di .env, prioritaskan ini
  if (process.env.SERVER_HOST) {
    return process.env.SERVER_HOST.trim();
  }

  // 2. Deteksi otomatis adapter non-virtual
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    // Lewati adapter virtualbox / vethernet / vmware
    if (/virtual|vbox|vmware|vethernet/i.test(name)) continue;
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Layar Proyektor (P-01 sampai P-05)
router.get('/:pin', async (req, res) => {
  const pin = req.params.pin;
  const hostIp = getPrimaryIp();
  const port = process.env.PORT || 3000;
  const joinUrl = `http://${hostIp}:${port}/?pin=${pin}`;

  let qrDataUrl = '';
  try {
    // Generate QR Code secara lokal murni (offline tanpa internet)
    qrDataUrl = await QRCode.toDataURL(joinUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1B1B2F',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('[QR Code Error]:', err.message);
  }

  renderWithLayout(res, 'proyektor/index', {
    title: `Layar Kelas - PIN ${pin}`,
    sessionPin: pin,
    pin: pin,
    hostIp,
    joinUrl,
    qrDataUrl
  }, 'layouts/projector-shell');
});

module.exports = router;
