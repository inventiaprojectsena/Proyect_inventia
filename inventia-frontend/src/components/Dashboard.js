// src/components/Dashboard.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Formulario from "./Formulario";
import { Modal } from "react-bootstrap";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFileExcel, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useHistorial } from "../context/HistorialContext";
import { useAuth }      from "../context/AuthContext";
import "./Dashboard.css";

const URL = "http://localhost:5000";

const ESTADO_COLORS = {
  Activo:            { cls: "badge-activo" },
  Dañado:            { cls: "badge-danado" },
  "En reparación":   { cls: "badge-reparacion" },
};

const PIE_COLORS = ["#4ade80", "#f87171", "#fb923c", "#60a5fa", "#c084fc"];
const BAR_COLOR  = "#4f6ef7";

// Tooltip personalizado para las gráficas
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(18,18,26,0.95)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: "0.82rem",
      color: "#d0d0e8",
    }}>
      {label && <p style={{ margin: "0 0 4px", color: "#a0b0d0", fontSize: "0.75rem" }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || "#8ba4ff", fontWeight: 600 }}>
          {p.name || p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

function Dashboard() {
  const [activos, setActivos]                 = useState([]);
  const [editando, setEditando]               = useState(null);
  const [showModal, setShowModal]             = useState(false);
  const [estadosData, setEstadosData]         = useState([]);
  const [ubicacionesData, setUbicacionesData] = useState([]);

  // Búsqueda y filtros
  const [busqueda, setBusqueda]               = useState("");
  const [filtroEstado, setFiltroEstado]       = useState("Todos");
  const [filtroUbicacion, setFiltroUbicacion] = useState("Todas");

  // Historial y autenticación
  const { registrar } = useHistorial();
  const { user, esAdmin } = useAuth();

  // ─── Cargar activos ───────────────────────────────────────
  const obtenerActivos = async () => {
    try {
      const res = await axios.get(`${URL}/activos`);
      setActivos(res.data);

      const estadosCount = res.data.reduce((acc, a) => {
        acc[a.estado_nombre] = (acc[a.estado_nombre] || 0) + 1;
        return acc;
      }, {});
      setEstadosData(
        Object.keys(estadosCount).map(k => ({ name: k, value: estadosCount[k] }))
      );

      const ubicCount = res.data.reduce((acc, a) => {
        acc[a.ubicacion_nombre] = (acc[a.ubicacion_nombre] || 0) + 1;
        return acc;
      }, {});
      setUbicacionesData(
        Object.keys(ubicCount).map(k => ({ name: k, value: ubicCount[k] }))
      );
    } catch {
      toast.error("Error al cargar activos");
    }
  };

  useEffect(() => { obtenerActivos(); }, []);

  // ─── Eliminar ─────────────────────────────────────────────
  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este activo?")) return;
    try {
      const activo = activos.find(a => a.id_activo === id);
      await axios.delete(`${URL}/activos/${id}`);
      registrar("Eliminado", activo, user);
      toast.success("Activo eliminado");
      obtenerActivos();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // ─── Modal ────────────────────────────────────────────────
  const abrirModal = (activo = null) => {
    setEditando(activo);
    setShowModal(true);
  };

  // activoGuardado lo recibe desde Formulario al completar el guardado
  const cerrarModal = (activoGuardado = null) => {
    if (activoGuardado) {
      registrar(editando ? "Editado" : "Creado", activoGuardado, user);
    }
    setEditando(null);
    setShowModal(false);
  };

  // ─── Filtros ──────────────────────────────────────────────
  const estadosUnicos     = ["Todos",  ...new Set(activos.map(a => a.estado_nombre))];
  const ubicacionesUnicas = ["Todas", ...new Set(activos.map(a => a.ubicacion_nombre))];

  const activosFiltrados = useMemo(() => {
    return activos.filter(a => {
      const texto = busqueda.toLowerCase();
      const coincideTexto =
        a.nombre.toLowerCase().includes(texto) ||
        (a.descripcion || "").toLowerCase().includes(texto) ||
        a.estado_nombre.toLowerCase().includes(texto) ||
        a.ubicacion_nombre.toLowerCase().includes(texto);
      const coincideEstado    = filtroEstado    === "Todos" || a.estado_nombre    === filtroEstado;
      const coincideUbicacion = filtroUbicacion === "Todas" || a.ubicacion_nombre === filtroUbicacion;
      return coincideTexto && coincideEstado && coincideUbicacion;
    });
  }, [activos, busqueda, filtroEstado, filtroUbicacion]);

  const limpiarFiltros    = () => { setBusqueda(""); setFiltroEstado("Todos"); setFiltroUbicacion("Todas"); };
  const hayFiltrosActivos = busqueda !== "" || filtroEstado !== "Todos" || filtroUbicacion !== "Todas";

  // ─── Exportar Excel ───────────────────────────────────────
  const exportarExcel = () => {
    const datos = activosFiltrados.map(a => ({
      Nombre:      a.nombre,
      Descripción: a.descripcion,
      Estado:      a.estado_nombre,
      Ubicación:   a.ubicacion_nombre,
    }));
    const hoja  = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    hoja["!cols"] = [{ wch: 25 }, { wch: 35 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(libro, hoja, "Activos");
    const buffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Inventia_Activos.xlsx");
    toast.success("Excel exportado correctamente");
  };

  // ─── Métricas ─────────────────────────────────────────────
  const metrics = [
    { icon: "📦", label: "Total de activos",   value: activos.length,                               cls: "mi-blue"   },
    { icon: "✅", label: "Activos operativos",  value: activos.filter(a => a.id_estado === 1).length, cls: "mi-green"  },
    { icon: "🔧", label: "En reparación",       value: activos.filter(a => a.id_estado === 3).length, cls: "mi-orange" },
    { icon: "⚠️", label: "Dañados",             value: activos.filter(a => a.id_estado === 2).length, cls: "mi-red"    },
  ];

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="dash-root">

      {/* Título */}
      <div className="dash-header">
        <h2>Dashboard</h2>
        <p>Resumen general del estado de activos</p>
      </div>

      {/* Métricas */}
      <div className="dash-metrics" style={{ gridTemplateColumns: `repeat(${metrics.length}, 1fr)` }}>
        {metrics.map((m, i) => (
          <div key={i} className="dash-metric">
            <div className={`dash-metric-icon ${m.cls}`}>{m.icon}</div>
            <div className="dash-metric-value">{m.value}</div>
            <div className="dash-metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="dash-charts">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Activos por Estado</div>
          <div className="dash-chart-sub">Distribución actual del inventario</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={estadosData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}
              >
                {estadosData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-legend">
            {estadosData.map((e, i) => (
              <div key={i} className="dash-legend-item">
                <span className="dash-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {e.name} ({e.value})
              </div>
            ))}
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Activos por Ubicación</div>
          <div className="dash-chart-sub">Distribución por espacio físico</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ubicacionesData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "rgba(160,160,185,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(160,160,185,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,110,247,0.06)" }} />
              <Bar dataKey="value" name="Activos" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla */}
      <div className="dash-table-section">

        <div className="dash-table-header">
          <div className="dash-chart-title">
            Listado de Activos
            {hayFiltrosActivos && (
              <span className="dash-result-count">
                {activosFiltrados.length} de {activos.length} resultados
              </span>
            )}
          </div>
          <div className="dash-table-actions">
            <button className="dash-btn-excel" onClick={exportarExcel}>
              <FaFileExcel size={12} /> Exportar Excel
            </button>
            {/* Solo el admin puede crear activos */}
            {esAdmin && (
              <button className="dash-btn-new" onClick={() => abrirModal()}>
                <FaPlus size={11} /> Nuevo Activo
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="dash-filters">
          <div className="dash-search-wrap">
            <FaSearch className="dash-search-icon" size={12} />
            <input
              type="text"
              className="dash-search"
              placeholder="Buscar por nombre, descripción, estado o ubicación..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="dash-search-clear" onClick={() => setBusqueda("")}>
                <FaTimes size={10} />
              </button>
            )}
          </div>

          <select className="dash-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            {estadosUnicos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select className="dash-select" value={filtroUbicacion} onChange={e => setFiltroUbicacion(e.target.value)}>
            {ubicacionesUnicas.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          {hayFiltrosActivos && (
            <button className="dash-btn-clear" onClick={limpiarFiltros}>
              <FaTimes size={10} /> Limpiar
            </button>
          )}
        </div>

        {/* Tabla de activos */}
        <table className="dash-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Ubicación</th>
              {/* Solo el admin ve la columna de acciones */}
              {esAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {activosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={esAdmin ? 5 : 4} style={{ textAlign: "center", color: "rgba(150,150,175,0.4)", padding: "40px" }}>
                  {hayFiltrosActivos
                    ? "No se encontraron activos con esos filtros"
                    : "No hay activos registrados"}
                </td>
              </tr>
            ) : (
              activosFiltrados.map((a) => {
                const estadoInfo = ESTADO_COLORS[a.estado_nombre] || { cls: "badge-activo" };
                return (
                  <tr key={a.id_activo}>
                    <td>{a.nombre}</td>
                    <td style={{ color: "rgba(180,180,205,0.6)" }}>{a.descripcion}</td>
                    <td>
                      <span className={`dash-badge ${estadoInfo.cls}`}>
                        <span className="badge-dot" />
                        {a.estado_nombre}
                      </span>
                    </td>
                    <td style={{ color: "rgba(180,180,205,0.7)" }}>{a.ubicacion_nombre}</td>
                    {/* Botones solo visibles para admin */}
                    {esAdmin && (
                      <td>
                        <button className="dash-action-btn btn-edit" onClick={() => abrirModal(a)}>
                          <FaEdit size={11} /> Editar
                        </button>
                        <button className="dash-action-btn btn-delete" onClick={() => eliminar(a.id_activo)}>
                          <FaTrash size={11} /> Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — solo accesible para admin */}
      {esAdmin && (
        <Modal show={showModal} onHide={() => cerrarModal()} centered dialogClassName="inv-modal">
          <Modal.Header closeButton>
            <Modal.Title>{editando ? "Editar Activo" : "Nuevo Activo"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formulario
              obtenerActivos={(activoGuardado) => {
                obtenerActivos();
                cerrarModal(activoGuardado);
              }}
              editando={editando}
              setEditando={setEditando}
            />
          </Modal.Body>
        </Modal>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        toastStyle={{
          background: "#12121a",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#e0e0f0",
          borderRadius: 12,
        }}
      />
    </div>
  );
}

export default Dashboard;