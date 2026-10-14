const express = require('express');
const router = express.Router();
const {
  createTurno,
  getTurnos,
  getTurnoActivo,
  finalizarTurno,
  deleteTurno,
} = require('../controllers/turno.controller');

router.post('/turnos', createTurno);
router.get('/turnos', getTurnos);
router.get('/turnos/conductor/:correo', getTurnoActivo);
router.patch('/turnos/:id/finalizar', finalizarTurno);
router.delete('/turnos/:id', deleteTurno);

module.exports = router;