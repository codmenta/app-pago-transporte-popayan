const bcrypt = require('bcryptjs');
const pool = require('../db');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT correo, nombre, celular, contrasena FROM usuarios WHERE correo = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.contrasena);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    return res.status(200).json({
      email: usuario.correo,
      fullName: usuario.nombre,
      phone: usuario.celular,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { login };