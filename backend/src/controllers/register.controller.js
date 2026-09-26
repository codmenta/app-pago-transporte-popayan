const pool = require('../db');

const registrarUsuario = async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  // 1. Validar presencia de campos requeridos
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({
      message: 'Todos los campos (nombre, correo, celular y contraseña) son obligatorios.'
    });
  }

  // 2. Validar que no contengan únicamente espacios en blanco
  if (
    fullName.trim() === '' ||
    email.trim() === '' ||
    phone.trim() === '' ||
    password === ''
  ) {
    return res.status(400).json({
      message: 'Los campos no pueden estar vacíos.'
    });
  }

  // 3. Validar longitud del nombre completo
  if (fullName.trim().length < 3) {
    return res.status(400).json({
      message: 'El nombre completo debe tener al menos 3 caracteres.'
    });
  }

  // 4. Validar formato de correo electrónico
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email.trim())) {
    return res.status(400).json({
      message: 'El correo electrónico no es válido.'
    });
  }

  // 5. Validar formato de teléfono celular (exactamente 10 dígitos)
  const regexPhone = /^[0-9]{10}$/;
  if (!regexPhone.test(phone.trim())) {
    return res.status(400).json({
      message: 'El número de celular debe contener exactamente 10 dígitos numéricos.'
    });
  }

  // 6. Validar longitud mínima de la contraseña
  if (password.length < 6) {
    return res.status(400).json({
      message: 'La contraseña debe tener al menos 6 caracteres.'
    });
  }

  const emailLimpio = email.toLowerCase().trim();

  try {
    // 7. Validar existencia del correo en la base de datos PostgreSQL
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [emailLimpio]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        message: 'El correo electrónico ya se encuentra registrado.'
      });
    }

    // 8. Inserción en la tabla 'usuarios'
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre_completo, email, telefono, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre_completo, email, telefono`,
      [fullName.trim(), emailLimpio, phone.trim(), password]
    );

    const usuarioCreado = nuevoUsuario.rows[0];
    
    // 9. Inicializar billetera usando el 'correo' 
    await pool.query(
      `INSERT INTO billetera (correo, saldo)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [emailLimpio, 0]
    );

    return res.status(201).json({
      message: 'Cuenta creada exitosamente',
      usuario: usuarioCreado
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({
      message: 'Error interno del servidor al procesar el registro.'
    });
  }
};

module.exports = { registrarUsuario };