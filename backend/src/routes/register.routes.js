const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/register.controller');

// Endpoint POST /api/auth/registro
router.post('/registro', registrarUsuario);

module.exports = router;