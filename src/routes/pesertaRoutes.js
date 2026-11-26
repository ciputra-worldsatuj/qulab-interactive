const express = require('express');
const router = express.Router();
const PesertaController = require('../controllers/pesertaController');

router.get('/', PesertaController.masukPage);
router.get('/main', PesertaController.mainPage);
router.get('/kicked', (req, res) => res.redirect('/?status=kicked'));

module.exports = router;
