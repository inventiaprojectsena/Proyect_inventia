// src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <nav className="inv-sidebar">

      <div className="inv-sidebar-label">Menú principal</div>

      <NavLink
        to="/"
        end
        className={({ isActive }) => `inv-nav-item ${isActive ? "active" : ""}`}
      >
        <div className="inv-nav-icon">🏠</div>
        Inicio
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => `inv-nav-item ${isActive ? "active" : ""}`}
      >
        <div className="inv-nav-icon">📊</div>
        Dashboard
      </NavLink>

      <NavLink
        to="/historial"
        className={({ isActive }) => `inv-nav-item ${isActive ? "active" : ""}`}
      >
        <div className="inv-nav-icon">📋</div>
        Historial
      </NavLink>

      <div className="inv-sidebar-divider" />

      <div className="inv-sidebar-footer">
        <p className="inv-sidebar-footer-text">
          <span>Inventia</span>
          Gestión de Activos v1.0
        </p>
      </div>

    </nav>
  );
}

export default Sidebar;