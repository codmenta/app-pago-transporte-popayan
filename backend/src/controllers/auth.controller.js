const pool = require('../db');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT correo, nombre, celular, contrasena, rol FROM usuarios WHERE correo = $1',
      [email.toLowerCase()]
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

// POST /api/registro
async function register(req, res) {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  const correo = email.trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(correo)) {
    return res.status(400).json({ mensaje: 'El correo no es valido' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ mensaje: 'El celular debe tener 10 digitos' });
  }
  if (password.length < 6) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener minimo 6 caracteres' });
  }

  try {
    await pool.query(
      `INSERT INTO usuarios (correo, nombre, celular, contrasena, rol)
       VALUES ($1, $2, $3, $4, 'pasajero')`,
      [correo, fullName.trim(), phone, password]
    );

    // Cada pasajero nuevo arranca con su billetera en cero
    await pool.query(
      'INSERT INTO billetera (correo, saldo) VALUES ($1, 0) ON CONFLICT (correo) DO NOTHING',
      [correo]
    );

    return res.status(201).json({
      email: correo,
      fullName: fullName.trim(),
      phone,
      role: 'pasajero',
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta registrada con este correo' });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { login, register };