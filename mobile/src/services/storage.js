import AsyncStorage from '@react-native-async-storage/async-storage';

// En produccion viene de EXPO_PUBLIC_API_URL (/api); en tu computador usa localhost
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// ----------------------------------------------------------------
// Claves de AsyncStorage
// ----------------------------------------------------------------
const USERS_KEY = '@app_pago_transporte:users';
const CURRENT_USER_KEY = '@app_pago_transporte:currentUser';

// ----------------------------------------------------------------
// Usuarios locales (ya no los usa el registro, quedan por compatibilidad)
// ----------------------------------------------------------------

export async function getUsers() {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo usuarios registrados', error);
    return [];
  }
}

export async function saveUser(user) {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ----------------------------------------------------------------
// Sesion actual
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
// Login y registro contra el backend
// ----------------------------------------------------------------

export async function loginRequest(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Correo o contraseña incorrectos');
  }

  return data; // { email, fullName, phone, role }
}

export async function registerRequest({ fullName, email, phone, password }) {
  const response = await fetch(`${API_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, phone, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo completar el registro');
  }

  return data;
}

// ----------------------------------------------------------------
// Billetera contra el backend
// ----------------------------------------------------------------

export async function getWallet(email) {
  const response = await fetch(`${API_URL}/billetera/${email}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo obtener la billetera');
  }

  return data; // { balance, movements }
}

export async function addRecharge(email, amount) {
  const response = await fetch(`${API_URL}/recargar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo: email, monto: amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo procesar la recarga');
  }

  return data;
}

// ----------------------------------------------------------------
// Admin: buses y conductores
// ----------------------------------------------------------------

export async function registerBus(placa, numeroInterno, ruta) {
  const response = await fetch(`${API_URL}/buses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placa, numero_interno: numeroInterno, ruta }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo registrar el bus');
  }

  return data; // { placa, numero_interno, ruta, codigo_qr, fecha_creacion, qrImage }
}

export async function registerConductor(nombre, cedula, celular, correo, password) {
  const response = await fetch(`${API_URL}/conductores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, cedula, celular, correo, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo registrar el conductor');
  }

  return data;
}
// Conductor: turno activo (bus y ruta asignados)
export async function getTurnoActivo(email) {
  const response = await fetch(`${API_URL}/turnos/conductor/${email}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo obtener el turno');
  }

  return data; // { placa_bus, numero_interno, ruta, fecha_inicio, fecha_fin, estado }
}