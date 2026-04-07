// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock } from "react-icons/fa";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [usuario,  setUsuario]  = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !password) { setError("Completa todos los campos"); return; }
    setCargando(true);
    // Pequeño delay para simular una llamada real
    await new Promise(r => setTimeout(r, 600));
    const resultado = login(usuario, password);
    if (resultado.ok) {
      navigate("/");
    } else {
      setError(resultado.mensaje);
    }
    setCargando(false);
  };

  // Rellenar credenciales de demo con un clic
  const usarDemo = (u, p) => {
    setUsuario(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="login-root">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">I</div>
          <span className="login-logo-name">Inventia</span>
        </div>

        <h1 className="login-title">Bienvenido de nuevo</h1>
        <p className="login-sub">Inicia sesión para acceder al sistema</p>

        {error && (
          <div className="login-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Usuario</label>
            <div className="login-input-wrap">
              <FaUser className="login-input-icon" size={13} />
              <input
                type="text"
                className="login-input"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={e => { setUsuario(e.target.value); setError(""); }}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <div className="login-input-wrap">
              <FaLock className="login-input-icon" size={13} />
              <input
                type="password"
                className="login-input"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={cargando}>
            {cargando ? "Verificando..." : "Iniciar sesión →"}
          </button>
        </form>

        {/* Credenciales de demo */}
        <div className="login-demo">
          <p className="login-demo-title">Credenciales de prueba</p>
          <div className="login-demo-cards">
            <div className="login-demo-card" onClick={() => usarDemo("admin", "admin123")}>
              <div className="login-demo-rol rol-admin">👑 Admin</div>
              <div className="login-demo-creds">
                usuario: admin<br />
                pass: admin123
              </div>
            </div>
            <div className="login-demo-card" onClick={() => usarDemo("usuario", "user123")}>
              <div className="login-demo-rol rol-usuario">👤 Usuario</div>
              <div className="login-demo-creds">
                usuario: usuario<br />
                pass: user123
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;