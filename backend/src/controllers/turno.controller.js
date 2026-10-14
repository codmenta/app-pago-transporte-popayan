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

// GET /api/turnos/conductor/:correo
// Devuelve el turno activo mas reciente de un conductor, con los datos de su bus
async function getTurnoActivo(req, res) {
  const { correo } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         t.id,
         t.placa_bus,
         b.numero_interno,
         b.ruta,
         t.fecha_inicio,
         t.fecha_fin,
         t.estado
       FROM turnos t
       JOIN buses b ON b.placa = t.placa_bus
       WHERE t.correo_conductor = $1 AND t.estado = 'activo'
       ORDER BY t.fecha_inicio DESC
       LIMIT 1`,
      [correo.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No tienes un turno activo asignado' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo turno activo:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { createTurno, getTurnos, getTurnoActivo };