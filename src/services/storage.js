import AsyncStorage from '@react-native-async-storage/async-storage';

// Este servicio simula la capa de backend para el Sprint 1 usando
// almacenamiento local (AsyncStorage). Cuando el equipo conecte una API
// real, solo hay que reemplazar las funciones de este archivo: las
// pantallas no necesitan cambiar.

const USERS_KEY = '@app_pago_transporte:users';
const CURRENT_USER_KEY = '@app_pago_transporte:currentUser';
const WALLET_PREFIX = '@app_pago_transporte:wallet:';

// ----------------------------------------------------------------
// Usuarios (SCRUM-11, SCRUM-15)
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

export async function setCurrentUser(email) {
  await AsyncStorage.setItem(CURRENT_USER_KEY, email);
}

export async function getCurrentUserEmail() {
  return AsyncStorage.getItem(CURRENT_USER_KEY);
}

export async function clearCurrentUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

// ----------------------------------------------------------------
// Billetera: saldo e historial (SCRUM-17, SCRUM-18, SCRUM-19)
// ----------------------------------------------------------------

export async function getWallet(email) {
  try {
    const raw = await AsyncStorage.getItem(WALLET_PREFIX + email);
    if (raw) return JSON.parse(raw);

    // Billetera nueva: saldo inicial en cero y sin movimientos.
    const emptyWallet = { balance: 0, movements: [] };
    await AsyncStorage.setItem(WALLET_PREFIX + email, JSON.stringify(emptyWallet));
    return emptyWallet;
  } catch (error) {
    console.error('Error leyendo la billetera', error);
    return { balance: 0, movements: [] };
  }
}

async function saveWallet(email, wallet) {
  await AsyncStorage.setItem(WALLET_PREFIX + email, JSON.stringify(wallet));
}

// Simula una recarga: suma el monto al saldo y agrega un movimiento
// al inicio del historial. Una API real reemplazaria esto por una
// llamada a Nequi/DaviPlata en entorno sandbox.
export async function addRecharge(email, amount) {
  const wallet = await getWallet(email);
  const movement = {
    id: Date.now().toString(),
    type: 'recarga',
    amount,
    date: new Date().toISOString(),
    description: 'Recarga de saldo (simulada)',
  };

  const updatedWallet = {
    balance: wallet.balance + amount,
    movements: [movement, ...wallet.movements],
  };

  await saveWallet(email, updatedWallet);
  return updatedWallet;
}
