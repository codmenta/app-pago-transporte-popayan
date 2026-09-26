const pool = require('../db');

// GET /api/billetera/:correo
async function getWallet(req, res) {
  const { correo } = req.params;

  try {
    const billeteraResult = await pool.query(
      'SELECT saldo FROM billetera WHERE correo = $1',
      [correo.toLowerCase()]
    );

    const saldo = billeteraResult.rows.length > 0 ? billeteraResult.rows[0].saldo : 0;

    const movimientosResult = await pool.query(
      'SELECT id, tipo, monto, fecha, descripcion FROM movimientos WHERE correo = $1 ORDER BY fecha DESC',
      [correo.toLowerCase()]
    );

    const movements = movimientosResult.rows.map((m) => ({
      id: m.id.toString(),
      type: m.tipo,
      amount: Number(m.monto),
      date: m.fecha,
      description: m.descripcion,
    }));

    return res.status(200).json({ balance: Number(saldo), movements });
  } catch (error) {
    console.error('Error obteniendo billetera:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// POST /api/recargar
async function recharge(req, res) {
  const { correo, monto } = req.body;

  if (!correo || !monto || Number(monto) <= 0) {
    return res.status(400).json({ mensaje: 'Correo y un monto válido son obligatorios' });
  }

  try {
    const billeteraExistente = await pool.query(
      'SELECT saldo FROM billetera WHERE correo = $1',
      [correo.toLowerCase()]
    );

    if (billeteraExistente.rows.length === 0) {
      await pool.query(
        'INSERT INTO billetera (correo, saldo) VALUES ($1, $2)',
        [correo.toLowerCase(), monto]
      );
    } else {
      await pool.query(
        'UPDATE billetera SET saldo = saldo + $1 WHERE correo = $2',
        [monto, correo.toLowerCase()]
      );
    }

    const movimientoResult = await pool.query(
      `INSERT INTO movimientos (tipo, correo, monto, descripcion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tipo, monto, fecha, descripcion`,
      ['recarga', correo.toLowerCase(), monto, 'Recarga de saldo']
    );

    const nuevoSaldo = await pool.query(
      'SELECT saldo FROM billetera WHERE correo = $1',
      [correo.toLowerCase()]
    );

    const movimiento = movimientoResult.rows[0];

    return res.status(201).json({
      balance: Number(nuevoSaldo.rows[0].saldo),
      movement: {
        id: movimiento.id.toString(),
        type: movimiento.tipo,
        amount: Number(movimiento.monto),
        date: movimiento.fecha,
        description: movimiento.descripcion,
      },
    });
  } catch (error) {
    console.error('Error en recarga:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { getWallet, recharge };