import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout, esAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="inv-header">
      <a href="#" className="inv-header-brand">
        <div className="inv-header-logo">I</div>
        <span className="inv-header-name">Inventia</span>
      </a>

      <div className="inv-header-right">
        {user && (
          <>
            <div className={`inv-header-role-badge ${esAdmin ? "role-admin" : "role-user"}`}>
              {esAdmin ? "👑 Admin" : "👤 Usuario"}
            </div>
            <div className="inv-header-username">{user.nombre}</div>
            <button className="inv-header-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        )}
        <div className="inv-header-pill">
          <span className="inv-header-pill-dot" />
          v1.0
        </div>
      </div>
    </header>
  );
}

export default Header;