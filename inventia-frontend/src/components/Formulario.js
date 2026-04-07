// src/components/Formulario.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const URL = "http://localhost:5000";

function Formulario({ obtenerActivos, editando, setEditando }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_estado: "",
    id_ubicacion: "",
  });

  const [estados,     setEstados]     = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  // Cargar estados y ubicaciones desde el backend
  useEffect(() => {
    axios.get(`${URL}/estados`).then(res => setEstados(res.data));
    axios.get(`${URL}/ubicaciones`).then(res => setUbicaciones(res.data));
  }, []);

  // Prellenar el formulario al editar
  useEffect(() => {
    if (editando) setForm(editando);
  }, [editando]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id_estado:    parseInt(form.id_estado),
      id_ubicacion: parseInt(form.id_ubicacion),
    };

    try {
      if (editando) {
        await axios.put(`${URL}/activos/${editando.id_activo}`, payload);
        setEditando(null);
      } else {
        await axios.post(`${URL}/activos`, payload);
      }

      // Buscar los nombres legibles del estado y ubicación seleccionados
      // para pasarlos al historial en el Dashboard
      const estadoSeleccionado    = estados.find(e => e.id_estado    === parseInt(form.id_estado));
      const ubicacionSeleccionada = ubicaciones.find(u => u.id_ubicacion === parseInt(form.id_ubicacion));

      const activoGuardado = {
        nombre:           form.nombre,
        descripcion:      form.descripcion,
        estado_nombre:    estadoSeleccionado?.nombre    || "—",
        ubicacion_nombre: ubicacionSeleccionada?.nombre || "—",
      };

      // Limpiar formulario
      setForm({ nombre: "", descripcion: "", id_estado: "", id_ubicacion: "" });

      // Pasar el activo guardado al Dashboard para registrar en el historial
      obtenerActivos(activoGuardado);

    } catch (error) {
      console.error("Error al guardar activo:", error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={guardar} className="card p-3 shadow">
      <h5>{editando ? "Editar Activo" : "Nuevo Activo"}</h5>

      <input
        className="form-control mb-2"
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        required
      />

      <input
        className="form-control mb-2"
        name="descripcion"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={handleChange}
        required
      />

      <select
        className="form-control mb-2"
        name="id_estado"
        value={form.id_estado}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione estado</option>
        {estados.map((e) => (
          <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>
        ))}
      </select>

      <select
        className="form-control mb-2"
        name="id_ubicacion"
        value={form.id_ubicacion}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione ubicación</option>
        {ubicaciones.map((u) => (
          <option key={u.id_ubicacion} value={u.id_ubicacion}>{u.nombre}</option>
        ))}
      </select>

      <button className="btn btn-success" type="submit">
        {editando ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
}

export default Formulario;