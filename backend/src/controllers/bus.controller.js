const pool = require('../db');
const QRCode = require('qrcode');

// POST /api/buses
async function createBus(req, res) {
  const { placa, numero_interno, ruta } = req.body;

  if (!placa || !numero_interno || !ruta) {
    return res.status(400).json({ mensaje: 'Placa, numero interno y ruta son obligatorios' });
  }

  try {
    // Generamos el codigo unico que identifica al bus (el mismo que ira dentro del QR)
    const codigoQr = `POPAPAY-BUS-${numero_interno}-${placa}`.toUpperCase();

    // Generamos la imagen QR real, como un "data URL" (texto que representa la imagen)
    const qrImageDataUrl = await QRCode.toDataURL(codigoQr);

    const result = await pool.query(
      `INSERT INTO buses (placa, numero_interno, ruta, codigo_qr)
       VALUES ($1, $2, $3, $4)
       RETURNING placa, numero_interno, ruta, codigo_qr, fecha_creacion`,
      [placa.toUpperCase(), numero_interno, ruta, codigoQr]
    );

    const bus = result.rows[0];

    return res.status(201).json({
      ...bus,
      qrImage: qrImageDataUrl, // esto es lo que el admin puede mostrar/descargar como imagen
    });
  } catch (error) {
    if (error.code === '23505') {
      // codigo de error de Postgres para "llave duplicada" (placa repetida)
      return res.status(409).json({ mensaje: 'Ya existe un bus con esa placa' });
    }
    console.error('Error creando bus:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/buses
async function getBuses(req, res) {
  try {
    const result = await pool.query(
      'SELECT placa, numero_interno, ruta, codigo_qr, fecha_creacion FROM buses ORDER BY fecha_creacion DESC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error obteniendo buses:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { createBus, getBuses };