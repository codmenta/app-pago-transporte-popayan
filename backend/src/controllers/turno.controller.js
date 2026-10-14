const pool = require('../db');

// POST /api/turnos
async function createTurno(req, res) {
  const { correo_conductor, placa_bus, fecha_inicio, fecha_fin } = req.body;

  if (!correo_conductor || !placa_bus || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  const correo = correo_conductor.toLowerCase();
  const placa = placa_bus.toUpperCase();

  try {
    // Busca turnos activos que se crucen en horario con el conductor o con el bus
    const cruce = await pool.query(
      `SELECT correo_conductor, placa_bus FROM turnos
       WHERE estado = 'activo'
         AND (correo_conductor = $1 OR placa_bus = $2)
         AND fecha_inicio < $4 AND fecha_fin > $3
       LIMIT 1`,
      [correo, placa, fecha_inicio, fecha_fin]
    );

    if (cruce.rows.length > 0) {
      const quien = cruce.rows[0].correo_conductor === correo ? 'El conductor' : 'El bus';
      return res.status(409).json({
        mensaje: `${quien} ya tiene un turno asignado en ese horario`,
      });
    }

    const result = await pool.query(
      `INSERT INTO turnos (correo_conductor, placa_bus, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, correo_conductor, placa_bus, fecha_inicio, fecha_fin, estado`,
      [correo, placa, fecha_inicio, fecha_fin]
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
         t.estado,
         to_char(t.fecha_inicio, 'DD/MM/YYYY') AS fecha,
         to_char(t.fecha_inicio, 'HH24:MI') AS hora_inicio,
         to_char(t.fecha_fin, 'HH24:MI') AS hora_fin
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
// PATCH /api/turnos/:id/finalizar
async function finalizarTurno(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ mensaje: 'Id de turno no valido' });
  }

  try {
    const result = await pool.query(
      `UPDATE turnos SET estado = 'finalizado'
       WHERE id = $1 AND estado = 'activo'
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontro un turno activo con ese id' });
    }

    return res.status(200).json({ mensaje: 'Turno finalizado' });
  } catch (error) {
    console.error('Error finalizando turno:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// DELETE /api/turnos/:id
async function deleteTurno(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ mensaje: 'Id de turno no valido' });
  }

  try {
    const result = await pool.query('DELETE FROM turnos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontro el turno' });
    }

    return res.status(200).json({ mensaje: 'Turno eliminado' });
  } catch (error) {
    console.error('Error eliminando turno:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { createTurno, getTurnos, getTurnoActivo, finalizarTurno, deleteTurno };
