const express = require('express');
const router = express.Router();
const { getWallet, recharge } = require('../controllers/wallet.controller');

router.get('/billetera/:correo', getWallet);
router.post('/recargar', recharge);

module.exports = router;
