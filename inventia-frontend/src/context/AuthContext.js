// src/context/AuthContext.js
import React, { createContext, useContext, useState } from "react";

// Usuarios hardcodeados (en un proyecto real vendrían del backend)
const USUARIOS = [
  { id: 1, nombre: "Administrador", usuario: "admin",   password: "admin123",  rol: "admin"  },
  { id: 2, nombre: "Juan Pérez",    usuario: "usuario",  password: "user123",   rol: "usuario" },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Recuperar sesión guardada
    const guardado = localStorage.getItem("inventia_user");
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = (usuario, password) => {
    const encontrado = USUARIOS.find(
      u => u.usuario === usuario && u.password === password
    );
    if (encontrado) {
      const sesion = { id: encontrado.id, nombre: encontrado.nombre, usuario: encontrado.usuario, rol: encontrado.rol };
      localStorage.setItem("inventia_user", JSON.stringify(sesion));
      setUser(sesion);
      return { ok: true };
    }
    return { ok: false, mensaje: "Usuario o contraseña incorrectos" };
  };

  const logout = () => {
    localStorage.removeItem("inventia_user");
    setUser(null);
  };

  const esAdmin = user?.rol === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, esAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}