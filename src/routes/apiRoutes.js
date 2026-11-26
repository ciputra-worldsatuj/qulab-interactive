const express = require('express');
const router = express.Router();

// Health Check API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
