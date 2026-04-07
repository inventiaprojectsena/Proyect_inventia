// src/context/HistorialContext.js
import React, { createContext, useContext, useState } from "react";

const HistorialContext = createContext(null);

export function HistorialProvider({ children }) {
  const [historial, setHistorial] = useState(() => {
    const guardado = localStorage.getItem("inventia_historial");
    return guardado ? JSON.parse(guardado) : [];
  });

  const registrar = (accion, activo, usuario) => {
    const entrada = {
      id:        Date.now(),
      fecha:     new Date().toISOString(),
      accion,        // "Creado" | "Editado" | "Eliminado"
      activo:    activo.nombre,
      detalle:   activo.descripcion || "—",
      estado:    activo.estado_nombre || "—",
      ubicacion: activo.ubicacion_nombre || "—",
      usuario:   usuario?.nombre || "Sistema",
      rol:       usuario?.rol    || "—",
    };

    const nuevo = [entrada, ...historial].slice(0, 100); // máximo 100 entradas
    setHistorial(nuevo);
    localStorage.setItem("inventia_historial", JSON.stringify(nuevo));
  };

  const limpiarHistorial = () => {
    setHistorial([]);
    localStorage.removeItem("inventia_historial");
  };

  return (
    <HistorialContext.Provider value={{ historial, registrar, limpiarHistorial }}>
      {children}
    </HistorialContext.Provider>
  );
}

export function useHistorial() {
  return useContext(HistorialContext);
}