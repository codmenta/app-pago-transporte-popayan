import React, { createContext, useContext, useEffect, useState } from 'react';
import * as storage from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, revisamos si ya habia una sesion guardada.
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUser = await storage.getCurrentUser();
        if (savedUser) {
          setUser(savedUser);
        }
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  // SCRUM-11: Registro de pasajero (contra el backend real).
  // No inicia sesion automaticamente: RegisterScreen lleva al usuario al login.
  async function register({ fullName, email, phone, password }) {
    return storage.registerRequest({ fullName, email, phone, password });
  }

  // SCRUM-15: Inicio de sesion (contra el backend real)
  async function login({ email, password }) {
    const foundUser = await storage.loginRequest(email, password);
    await storage.setCurrentUser(foundUser);
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
