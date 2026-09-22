import React, { createContext, useContext, useEffect, useState } from 'react';
import * as storage from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, revisamos si ya habia una sesion guardada.
  useEffect(() => {
    async function restoreSession() {
      const email = await storage.getCurrentUserEmail();
      if (email) {
        const foundUser = await storage.findUserByEmail(email);
        setUser(foundUser || null);
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  // SCRUM-11: Registro de pasajero
  async function register({ fullName, email, phone, password }) {
    const existing = await storage.findUserByEmail(email);
    if (existing) {
      throw new Error('Ya existe una cuenta registrada con este correo');
    }
    const newUser = { fullName, email: email.trim().toLowerCase(), phone, password };
    await storage.saveUser(newUser);
    return newUser;
  }

  // SCRUM-15: Inicio de sesion de pasajero
  async function login({ email, password }) {
    const foundUser = await storage.findUserByEmail(email);
    if (!foundUser || foundUser.password !== password) {
      throw new Error('Correo o contraseña incorrectos');
    }
    await storage.setCurrentUser(foundUser.email);
    setUser(foundUser);
    return foundUser;
  }

  async function logout() {
    await storage.clearCurrentUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
