const pool = require('../db');

// POST /api/conductores
async function createConductor(req, res) {
  const { nombre, cedula, celular, correo, password } = req.body;

  if (!nombre || !cedula || !celular || !correo || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (correo, nombre, celular, contrasena, rol, cedula)
       VALUES ($1, $2, $3, $4, 'conductor', $5)
       RETURNING correo, nombre, celular, rol, cedula`,
      [correo.toLowerCase(), nombre, celular, password, cedula]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo' });
    }
    console.error('Error creando conductor:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/conductores
async function getConductores(req, res) {
  try {
    const result = await pool.query(
      `SELECT correo, nombre, celular, cedula, fecha_registro
       FROM usuarios WHERE rol = 'conductor'
       ORDER BY fecha_registro DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error obteniendo conductores:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { createConductor, getConductores };