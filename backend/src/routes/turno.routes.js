const express = require('express');
const router = express.Router();
const { createTurno, getTurnos } = require('../controllers/turno.controller');

router.post('/turnos', createTurno);
router.get('/turnos', getTurnos);

module.exports = router;