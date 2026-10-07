const pool = require('../db');

// POST /api/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT correo, nombre, celular, contrasena, rol FROM usuarios WHERE correo = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const usuario = result.rows[0];

    if (password !== usuario.contrasena) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    return res.status(200).json({
      email: usuario.correo,
      fullName: usuario.nombre,
      phone: usuario.celular,
      role: usuario.rol,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// POST /api/registro  (registro de pasajero, SCRUM-11)
async function register(req, res) {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ mensaje: 'El celular debe tener 10 digitos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const correo = email.trim().toLowerCase();
  const client = await pool.connect();

  try {
    // Transacción: se crea el usuario y su billetera en cero, o no se crea nada
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO usuarios (correo, nombre, celular, contrasena, rol)
       VALUES ($1, $2, $3, $4, 'usuario')
       RETURNING correo, nombre, celular, rol`,
      [correo, fullName.trim(), phone, password]
    );

    await client.query('INSERT INTO billetera (correo, saldo) VALUES ($1, 0)', [correo]);

    await client.query('COMMIT');

    const usuario = result.rows[0];
    return res.status(201).json({
      email: usuario.correo,
      fullName: usuario.nombre,
      phone: usuario.celular,
      role: usuario.rol,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  } finally {
    client.release();
  }
}

module.exports = { login, register };
