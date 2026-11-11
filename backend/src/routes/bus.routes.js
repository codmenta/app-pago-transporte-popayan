const express = require('express');
const router = express.Router();
const { createBus, getBuses, getBusQr } = require('../controllers/bus.controller');

router.post('/buses', createBus);
router.get('/buses', getBuses);
router.get('/buses/:placa/qr', getBusQr);

module.exports = router;