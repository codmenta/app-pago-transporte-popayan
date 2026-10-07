import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ----------------------------------------------------------------
// URL del backend
// - Celular real (Expo Go): crea un archivo .env en la raiz del frontend con
//     EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000/api
//   (la IPv4 que te da `ipconfig`) y reinicia con `npx expo start -c`
// - Emulador Android: 10.0.2.2 es el localhost de tu PC
// - iOS simulator / web: localhost funciona
// ----------------------------------------------------------------
const DEFAULT_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api',
  default: 'http://localhost:4000/api',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

const TIMEOUT_MS = 10000;
const CURRENT_USER_KEY = '@app_pago_transporte:currentUser';

// ----------------------------------------------------------------
// Sesion actual (guardamos el usuario que devuelve el backend)
// ----------------------------------------------------------------

export async function setCurrentUser(user) {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearCurrentUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

// ----------------------------------------------------------------
// Helper comun para todas las peticiones al backend
// ----------------------------------------------------------------

async function request(path, options = {}, defaultMessage = 'Ocurrio un error inesperado') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica tu red y la URL de la API.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // respuesta sin JSON
  }

  if (!response.ok) {
    throw new Error(data?.mensaje || defaultMessage);
  }

  return data;
}

// ----------------------------------------------------------------
// Autenticacion (SCRUM-11, SCRUM-15)
// ----------------------------------------------------------------

export function loginRequest(email, password) {
  return request(
    '/login',
    { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) },
    'Correo o contraseña incorrectos'
  ); // { email, fullName, phone, role }
}

export function registerRequest({ fullName, email, phone, password }) {
  return request(
    '/registro',
    {
      method: 'POST',
      body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), phone, password }),
    },
    'No se pudo crear la cuenta'
  ); // { email, fullName, phone, role }
}

// ----------------------------------------------------------------
// Billetera (SCRUM-17, SCRUM-18, SCRUM-19)
// ----------------------------------------------------------------

export function getWallet(email) {
  return request(
    `/billetera/${encodeURIComponent(email)}`,
    {},
    'No se pudo obtener la billetera'
  ); // { balance, movements }
}

export function addRecharge(email, amount) {
  return request(
    '/recargar',
    { method: 'POST', body: JSON.stringify({ correo: email, monto: amount }) },
    'No se pudo procesar la recarga'
  ); // { balance, movement }
}

// ----------------------------------------------------------------
// Admin: buses (con QR) y conductores
// ----------------------------------------------------------------

export function registerBus(placa, numeroInterno, ruta) {
  return request(
    '/buses',
    { method: 'POST', body: JSON.stringify({ placa, numero_interno: numeroInterno, ruta }) },
    'No se pudo registrar el bus'
  ); // { placa, numero_interno, ruta, codigo_qr, fecha_creacion, qrImage }
}

export function registerConductor(nombre, cedula, celular, correo, password) {
  return request(
    '/conductores',
    { method: 'POST', body: JSON.stringify({ nombre, cedula, celular, correo, password }) },
    'No se pudo registrar el conductor'
  );
}
