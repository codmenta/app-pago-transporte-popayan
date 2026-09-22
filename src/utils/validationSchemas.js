import * as Yup from 'yup';

// SCRUM-11: Registro de pasajero
export const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('Ingresa tu nombre completo'),
  email: Yup.string()
    .trim()
    .email('Ingresa un correo valido')
    .required('Ingresa tu correo electronico'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'El celular debe tener 10 digitos')
    .required('Ingresa tu numero de celular'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Crea una contraseña'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

// SCRUM-15: Inicio de sesion de pasajero
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Ingresa un correo valido')
    .required('Ingresa tu correo electronico'),
  password: Yup.string().required('Ingresa tu contraseña'),
});

// SCRUM-17: Recargar saldo (simulada)
export const rechargeSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Ingresa solo numeros')
    .min(1000, 'El monto minimo de recarga es $ 1.000')
    .max(200000, 'El monto maximo de recarga es $ 200.000')
    .required('Ingresa un monto a recargar'),
});
