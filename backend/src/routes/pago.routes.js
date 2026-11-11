const express = require('express');
const router = express.Router();
const { getTarifa, pagarPasaje, getPagosConductor } = require('../controllers/pago.controller');

router.get('/tarifa', getTarifa);
router.post('/pagar', pagarPasaje);
router.get('/pagos/conductor/:correo', getPagosConductor);

module.exports = router;
