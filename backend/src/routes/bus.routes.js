const express = require('express');
const router = express.Router();
const { createBus, getBuses } = require('../controllers/bus.controller');

router.post('/buses', createBus);
router.get('/buses', getBuses);

module.exports = router;