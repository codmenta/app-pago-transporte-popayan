const pool = require('../db');

// POST /api/turnos
async function createTurno(req, res) {
  const { correo_conductor, placa_bus, fecha_inicio, fecha_fin } = req.body;

  if (!correo_conductor || !placa_bus || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO turnos (correo_conductor, placa_bus, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, correo_conductor, placa_bus, fecha_inicio, fecha_fin, estado`,
      [correo_conductor.toLowerCase(), placa_bus.toUpperCase(), fecha_inicio, fecha_fin]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando turno:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/turnos
// Trae los turnos combinando datos de usuarios y buses (sin llaves foraneas,
// pero igual se puede unir con JOIN comparando los valores)
async function getTurnos(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         t.id,
         t.correo_conductor,
         u.nombre AS nombre_conductor,
         t.placa_bus,
         b.numero_interno,
         b.ruta,
         t.fecha_inicio,
         t.fecha_fin,
         t.estado
       FROM turnos t
       JOIN usuarios u ON u.correo = t.correo_conductor
       JOIN buses b ON b.placa = t.placa_bus
       ORDER BY t.fecha_inicio DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { createTurno, getTurnos };