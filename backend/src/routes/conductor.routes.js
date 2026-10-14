const express = require('express');
const router = express.Router();
const { createConductor, getConductores } = require('../controllers/conductor.controller');

router.post('/conductores', createConductor);
router.get('/conductores', getConductores);

module.exports = router;