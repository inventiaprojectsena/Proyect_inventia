// src/components/Inicio.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Inicio.css";

function Inicio() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: "📦",
      iconClass: "inv-icon-blue",
      text: "Visualiza y administra todos tus activos",
    },
    {
      icon: "✏️",
      iconClass: "inv-icon-purple",
      text: "Crea y actualiza información de activos",
    },
    {
      icon: "📊",
      iconClass: "inv-icon-teal",
      text: "Consulta estadísticas y reportes en tiempo real",
    },
  ];

  return (
    <div className="inventia-root">
      <div className={`inv-card ${visible ? "visible" : ""}`}>

        <div className="inv-badge">
          <span className="inv-badge-dot" />
          Sistema activo
        </div>

        <h1 className="inv-title">
          Bienvenido a <span>Inventia</span>
        </h1>

        <p className="inv-subtitle">
          Gestiona, visualiza y controla todos tus activos desde un solo lugar.
          Eficiencia y claridad en cada paso.
        </p>

        <div className="inv-divider" />

        <ul className="inv-features">
          {features.map((f, i) => (
            <li key={i} className="inv-feature">
              <div className={`inv-icon ${f.iconClass}`}>{f.icon}</div>
              {f.text}
            </li>
          ))}
        </ul>

        <button className="inv-btn" onClick={() => navigate("/dashboard")}>
          Ir al Dashboard →
        </button>

        <p className="inv-footer-note">
          INVENTIA · Gestión de Activos v1.0
        </p>
      </div>
    </div>
  );
}

export default Inicio;