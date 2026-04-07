import React, { useEffect, useState } from "react";
import axios from "axios";
import Formulario from "./Formulario";
import { ToastContainer, toast } from "react-toastify";
import { Button, Card, Row, Col, Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const URL = "http://localhost:5000";

function Activos() {
  const [activos, setActivos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const obtenerActivos = async () => {
    try {
      const res = await axios.get(`${URL}/activos`);    
      setActivos(res.data);
    } catch (error) {
      toast.error("Error al cargar activos");
    }
  };

  useEffect(() => {
    obtenerActivos();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este activo?")) return;
    try {
      await axios.delete(`${URL}/activos/${id}`);
      toast.success("Activo eliminado");
      obtenerActivos();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const abrirModal = (activo = null) => {
    setEditando(activo);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setEditando(null);
    setShowModal(false);
  };

  return (
    <div className="p-3">
      <Button variant="success" onClick={() => abrirModal()}>
        Nuevo Activo
      </Button>

      <Row className="mt-3">
        {activos.map((a) => (
          <Col md={4} className="mb-3" key={a.id_activo}>
            <Card
              border={
                a.id_estado === 1
                  ? "success"
                  : a.id_estado === 2
                  ? "danger"
                  : "warning"
              }
            >
              <Card.Body>
                <Card.Title>{a.nombre}</Card.Title>
                <Card.Text>{a.descripcion}</Card.Text>
                <Card.Text>
                  <strong>Estado:</strong> {a.estado_nombre}
                </Card.Text>
                <Card.Text>
                  <strong>Ubicación:</strong> {a.ubicacion_nombre}
                </Card.Text>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => abrirModal(a)}
                >
                  <FaEdit /> Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => eliminar(a.id_activo)}
                >
                  <FaTrash /> Eliminar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal para formulario */}
      <Modal show={showModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar Activo" : "Nuevo Activo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formulario
            obtenerActivos={() => {
              obtenerActivos();
              cerrarModal();
            }}
            editando={editando}
            setEditando={setEditando}
          />
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default Activos;