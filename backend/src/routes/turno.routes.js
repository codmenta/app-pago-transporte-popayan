const express = require('express');
const router = express.Router();
const { createTurno, getTurnos, getTurnoActivo } = require('../controllers/turno.controller');

router.post('/turnos', createTurno);
router.get('/turnos', getTurnos);
router.get('/turnos/conductor/:correo', getTurnoActivo);

module.exports = router;