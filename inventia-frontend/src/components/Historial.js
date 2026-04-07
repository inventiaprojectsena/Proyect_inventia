// src/components/Historial.js
import React, { useState, useMemo } from "react";
import { useHistorial } from "../context/HistorialContext";
import { FaSearch, FaTrash } from "react-icons/fa";
import "./Historial.css";

const POR_PAGINA = 10;

// Formato fecha: "Hoy 14:32" / "Ayer 09:15" / "12 mar 2025 08:00"
function formatearFecha(iso) {
  const fecha  = new Date(iso);
  const ahora  = new Date();
  const hoy    = ahora.toDateString();
  const ayer   = new Date(ahora - 86400000).toDateString();
  const hora   = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  if (fecha.toDateString() === hoy)  return `Hoy ${hora}`;
  if (fecha.toDateString() === ayer) return `Ayer ${hora}`;
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) + ` ${hora}`;
}

const ICONOS = { Creado: "✅", Editado: "✏️", Eliminado: "🗑️" };
const DOT_CLS = { Creado: "dot-creado", Editado: "dot-editado", Eliminado: "dot-eliminado" };
const BADGE_CLS = { Creado: "accion-creado", Editado: "accion-editado", Eliminado: "accion-eliminado" };

function Historial() {
  const { historial, limpiarHistorial } = useHistorial();

  const [busqueda,      setBusqueda]      = useState("");
  const [filtroAccion,  setFiltroAccion]  = useState("Todas");
  const [filtroUsuario, setFiltroUsuario] = useState("Todos");
  const [pagina,        setPagina]        = useState(1);

  // Opciones únicas para los selects
  const usuarios = ["Todos", ...new Set(historial.map(h => h.usuario))];

  // Filtrado
  const filtrado = useMemo(() => {
    return historial.filter(h => {
      const txt = busqueda.toLowerCase();
      const coincideTexto =
        h.activo.toLowerCase().includes(txt) ||
        h.usuario.toLowerCase().includes(txt) ||
        h.estado?.toLowerCase().includes(txt) ||
        h.ubicacion?.toLowerCase().includes(txt);
      const coincideAccion  = filtroAccion  === "Todas" || h.accion   === filtroAccion;
      const coincideUsuario = filtroUsuario === "Todos" || h.usuario  === filtroUsuario;
      return coincideTexto && coincideAccion && coincideUsuario;
    });
  }, [historial, busqueda, filtroAccion, filtroUsuario]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrado.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const entradas     = filtrado.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarPagina = (n) => { setPagina(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Estadísticas rápidas
  const totalCreados   = historial.filter(h => h.accion === "Creado").length;
  const totalEditados  = historial.filter(h => h.accion === "Editado").length;
  const totalEliminados= historial.filter(h => h.accion === "Eliminado").length;

  const confirmarLimpiar = () => {
    if (window.confirm("¿Seguro que deseas borrar todo el historial? Esta acción no se puede deshacer.")) {
      limpiarHistorial();
      setPagina(1);
    }
  };

  return (
    <div className="hist-root">

      {/* Encabezado */}
      <div className="hist-header">
        <div className="hist-header-left">
          <h2>Historial de cambios</h2>
          <p>Registro de todas las acciones realizadas sobre los activos</p>
        </div>
        {historial.length > 0 && (
          <button className="hist-btn-limpiar" onClick={confirmarLimpiar}>
            <FaTrash size={11} /> Limpiar historial
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="hist-stats">
        <div className="hist-stat">
          <span className="hist-stat-icon">📋</span>
          <div className="hist-stat-value">{historial.length}</div>
          <div className="hist-stat-label">Total de registros</div>
        </div>
        <div className="hist-stat">
          <span className="hist-stat-icon">✅</span>
          <div className="hist-stat-value">{totalCreados}</div>
          <div className="hist-stat-label">Activos creados</div>
        </div>
        <div className="hist-stat">
          <span className="hist-stat-icon">✏️</span>
          <div className="hist-stat-value">{totalEditados}</div>
          <div className="hist-stat-label">Ediciones</div>
        </div>
        <div className="hist-stat">
          <span className="hist-stat-icon">🗑️</span>
          <div className="hist-stat-value">{totalEliminados}</div>
          <div className="hist-stat-label">Eliminaciones</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="hist-filters">
        <div className="hist-search-wrap">
          <FaSearch className="hist-search-icon" />
          <input
            type="text"
            className="hist-search"
            placeholder="Buscar por activo, usuario, estado..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
        <select className="hist-select" value={filtroAccion} onChange={e => { setFiltroAccion(e.target.value); setPagina(1); }}>
          <option value="Todas">Todas las acciones</option>
          <option value="Creado">Creado</option>
          <option value="Editado">Editado</option>
          <option value="Eliminado">Eliminado</option>
        </select>
        <select className="hist-select" value={filtroUsuario} onChange={e => { setFiltroUsuario(e.target.value); setPagina(1); }}>
          {usuarios.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Línea de tiempo */}
      <div className="hist-timeline">
        {entradas.length === 0 ? (
          <div className="hist-empty">
            <span className="hist-empty-icon">📭</span>
            <div className="hist-empty-title">
              {historial.length === 0 ? "Aún no hay registros" : "Sin resultados"}
            </div>
            <p className="hist-empty-sub">
              {historial.length === 0
                ? "Las acciones sobre activos aparecerán aquí automáticamente"
                : "Intenta cambiar los filtros de búsqueda"}
            </p>
          </div>
        ) : (
          entradas.map(h => (
            <div key={h.id} className="hist-entry">
              <div className={`hist-entry-dot ${DOT_CLS[h.accion] || "dot-editado"}`}>
                {ICONOS[h.accion] || "📝"}
              </div>
              <div className="hist-entry-body">
                <div className="hist-entry-top">
                  <div className="hist-entry-title">
                    <span className="hist-entry-nombre">{h.activo}</span>
                    <span className={`hist-accion-badge ${BADGE_CLS[h.accion] || "accion-editado"}`}>
                      {h.accion}
                    </span>
                  </div>
                  <span className="hist-entry-fecha">{formatearFecha(h.fecha)}</span>
                </div>

                <div className="hist-entry-meta">
                  <div className="hist-meta-item">
                    <span className="hist-meta-key">Estado</span>
                    {h.estado}
                  </div>
                  <div className="hist-meta-item">
                    <span className="hist-meta-key">Ubicación</span>
                    {h.ubicacion}
                  </div>
                  {h.detalle !== "—" && (
                    <div className="hist-meta-item">
                      <span className="hist-meta-key">Descripción</span>
                      {h.detalle}
                    </div>
                  )}
                </div>

                <div className="hist-entry-user">
                  <div className={`hist-user-avatar ${h.rol === "admin" ? "avatar-admin" : "avatar-usuario"}`}>
                    {h.usuario.charAt(0).toUpperCase()}
                  </div>
                  <span className="hist-user-name">{h.usuario}</span>
                  <span className="hist-user-rol">· {h.rol}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="hist-pagination">
          <button className="hist-page-btn" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
            ← Anterior
          </button>
          <span className="hist-page-info">Página {paginaActual} de {totalPaginas}</span>
          <button className="hist-page-btn" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
            Siguiente →
          </button>
        </div>
      )}

    </div>
  );
}

export default Historial;