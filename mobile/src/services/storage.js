import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta IP por la de tu computador (la que te dio ipconfig, adaptador Wi-Fi)
const API_URL = 'http://localhost:4000/api';

// ----------------------------------------------------------------
// Claves de AsyncStorage
// ----------------------------------------------------------------
const USERS_KEY = '@app_pago_transporte:users';
const CURRENT_USER_KEY = '@app_pago_transporte:currentUser';

// ----------------------------------------------------------------
// Usuarios (SCRUM-11, SCRUM-15)
// Esto sigue igual: el REGISTRO todavia lo maneja tu compañera con
// AsyncStorage hasta que ella conecte su propio endpoint.
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
// Sesion actual (ahora guardamos el usuario completo que devuelve
// el backend, no solo el email)
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
// Login real contra el backend (SCRUM-15)
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

  return data; // { email, fullName, phone }
}

// ----------------------------------------------------------------
// Billetera real contra el backend (SCRUM-17, SCRUM-18, SCRUM-19)
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