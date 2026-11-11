const pool = require('../db');

// Valor del pasaje (se puede cambiar con la variable de entorno TARIFA_PASAJE)
const TARIFA = Number(process.env.TARIFA_PASAJE) || 3000;

// GET /api/tarifa
function getTarifa(req, res) {
  return res.status(200).json({ tarifa: TARIFA });
}

// POST /api/pagar
// body: { correo, bus } donde "bus" es el numero interno o el codigo del QR
async function pagarPasaje(req, res) {
  const { correo, bus } = req.body;

  if (!correo || !bus || !String(bus).trim()) {
    return res.status(400).json({ mensaje: 'Correo y bus son obligatorios' });
  }

  const correoPasajero = correo.toLowerCase();
  const codigoBus = String(bus).trim().toUpperCase();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Buscar el bus por codigo QR o por numero interno
    const busResult = await client.query(
      `SELECT placa, numero_interno, ruta FROM buses
       WHERE codigo_qr = $1 OR UPPER(numero_interno) = $1`,
      [codigoBus]
    );

    if (busResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: 'No se encontro un bus con ese numero o codigo' });
    }
    if (busResult.rows.length > 1) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        mensaje: 'Hay varios buses con ese numero. Usa el codigo QR del bus',
      });
    }

    const busData = busResult.rows[0];

    // 2. El bus debe tener un turno activo (asi sabemos a que conductor le llega el pago)
    const turnoResult = await client.query(
      `SELECT t.id, t.correo_conductor, u.nombre AS nombre_conductor
       FROM turnos t
       JOIN usuarios u ON u.correo = t.correo_conductor
       WHERE t.placa_bus = $1 AND t.estado = 'activo'
       ORDER BY t.fecha_inicio DESC
       LIMIT 1`,
      [busData.placa]
    );

    if (turnoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ mensaje: 'Este bus no tiene un turno activo en este momento' });
    }

    const turno = turnoResult.rows[0];

    // 3. Verificar saldo (bloqueando la fila para evitar dobles cobros simultaneos)
    const saldoResult = await client.query(
      'SELECT saldo FROM billetera WHERE correo = $1 FOR UPDATE',
      [correoPasajero]
    );
    const saldo = saldoResult.rows.length > 0 ? Number(saldoResult.rows[0].saldo) : 0;

    if (saldo < TARIFA) {
      await client.query('ROLLBACK');
      return res.status(402).json({ mensaje: 'Saldo insuficiente. Recarga tu billetera' });
    }

    // 4. Descontar saldo, registrar movimiento y registrar el pago para el conductor
    const nuevoSaldoResult = await client.query(
      'UPDATE billetera SET saldo = saldo - $1 WHERE correo = $2 RETURNING saldo',
      [TARIFA, correoPasajero]
    );

    const movimientoResult = await client.query(
      `INSERT INTO movimientos (tipo, correo, monto, descripcion)
       VALUES ('pago', $1, $2, $3)
       RETURNING id, tipo, monto, fecha, descripcion`,
      [correoPasajero, TARIFA, `Pasaje bus #${busData.numero_interno} - ${busData.ruta}`]
    );

    const pagoResult = await client.query(
      `INSERT INTO pagos (correo_pasajero, id_turno, placa_bus, correo_conductor, monto)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fecha`,
      [correoPasajero, turno.id, busData.placa, turno.correo_conductor, TARIFA]
    );

    await client.query('COMMIT');

    const movimiento = movimientoResult.rows[0];

    return res.status(201).json({
      balance: Number(nuevoSaldoResult.rows[0].saldo),
      pago: {
        id: pagoResult.rows[0].id.toString(),
        monto: TARIFA,
        fecha: pagoResult.rows[0].fecha,
        numero_interno: busData.numero_interno,
        ruta: busData.ruta,
        placa_bus: busData.placa,
        nombre_conductor: turno.nombre_conductor,
      },
      movement: {
        id: movimiento.id.toString(),
        type: movimiento.tipo,
        amount: Number(movimiento.monto),
        date: movimiento.fecha,
        description: movimiento.descripcion,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error en pago de pasaje:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  } finally {
    client.release();
  }
}

// GET /api/pagos/conductor/:correo
// Devuelve los pagos recibidos en el turno activo del conductor
async function getPagosConductor(req, res) {
  const correo = req.params.correo.toLowerCase();

  try {
    const turnoResult = await pool.query(
      `SELECT id FROM turnos
       WHERE correo_conductor = $1 AND estado = 'activo'
       ORDER BY fecha_inicio DESC
       LIMIT 1`,
      [correo]
    );

    if (turnoResult.rows.length === 0) {
      return res.status(200).json({ id_turno: null, total_pasajeros: 0, total_recaudado: 0, pagos: [] });
    }

    const idTurno = turnoResult.rows[0].id;

    const pagosResult = await pool.query(
      `SELECT p.id, p.monto, p.fecha, u.nombre AS nombre_pasajero
       FROM pagos p
       JOIN usuarios u ON u.correo = p.correo_pasajero
       WHERE p.id_turno = $1
       ORDER BY p.fecha DESC`,
      [idTurno]
    );

    const pagos = pagosResult.rows.map((p) => ({
      id: p.id.toString(),
      monto: Number(p.monto),
      fecha: p.fecha,
      nombre_pasajero: p.nombre_pasajero,
    }));

    return res.status(200).json({
      id_turno: idTurno,
      total_pasajeros: pagos.length,
      total_recaudado: pagos.reduce((sum, p) => sum + p.monto, 0),
      pagos,
    });
  } catch (error) {
    console.error('Error obteniendo pagos del conductor:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { getTarifa, pagarPasaje, getPagosConductor };
