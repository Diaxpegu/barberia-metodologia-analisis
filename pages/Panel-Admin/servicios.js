import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ServiciosAdmin() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  const [servicios, setServicios] = useState([]);
  
  // Estados para Modal Formulario (Crear/Editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [servicioActual, setServicioActual] = useState({
    _id: "",
    nombre_servicio: "",
    precio: "",
    duracion: ""
  });

  // ESTADOS ESTILO BARBERIA.JS (Modal Éxito y Eliminar)
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [idEliminar, setIdEliminar] = useState("");

  // Estado para mensajes de error en el formulario
  const [mensajeError, setMensajeError] = useState("");

  const cargarServicios = async () => {
    try {
      const res = await fetch(`${backendUrl}/servicios/`);
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar:", err);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, [backendUrl]);

  // Función para mostrar éxito (Igual que en Barberos)
  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
  };

  // --- LÓGICA FORMULARIO ---
  const abrirModal = (servicio = null) => {
    setMensajeError("");
    if (servicio) {
      setModoEdicion(true);
      setServicioActual({
        _id: servicio._id,
        nombre_servicio: servicio.nombre_servicio,
        precio: servicio.precio,
        duracion: servicio.duracion
      });
    } else {
      setModoEdicion(false);
      setServicioActual({ _id: "", nombre_servicio: "", precio: "", duracion: "" });
    }
    setModalVisible(true);
  };

  const guardarServicio = async (e) => {
    e.preventDefault();

    if (!servicioActual.nombre_servicio || !servicioActual.nombre_servicio.trim()) {
      setMensajeError("El nombre del servicio es obligatorio");
      return;
    }
    if (!servicioActual.precio) {
      setMensajeError("El precio es obligatorio");
      return;
    }

    const payload = {
      nombre_servicio: servicioActual.nombre_servicio,
      precio: parseFloat(servicioActual.precio),
      duracion: parseInt(servicioActual.duracion) || 30
    };

    try {
      let res;
      if (modoEdicion) {
        res = await fetch(`${backendUrl}/servicios/${servicioActual._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${backendUrl}/servicios/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        cargarServicios();
        setModalVisible(false); // Cierra formulario
        // MUESTRA EL MODAL BONITO
        triggerSuccess(modoEdicion ? "Servicio actualizado correctamente" : "Servicio creado exitosamente");
      } else {
        setMensajeError("Error al guardar en el servidor");
      }
    } catch (error) {
      setMensajeError("Error de conexión");
    }
  };

  // --- LÓGICA ELIMINAR ---
  const solicitarEliminar = (id) => {
    setIdEliminar(id);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    try {
      await fetch(`${backendUrl}/servicios/${idEliminar}`, { method: "DELETE" });
      setShowModalEliminar(false);
      setIdEliminar("");
      cargarServicios();
      triggerSuccess("Servicio eliminado correctamente");
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <div className="admin-header">
        <h2>Gestionar Servicios</h2>
        <button className="btn-admin-action btn-verde" onClick={() => abrirModal()}>
          <i className="fas fa-plus"></i> Añadir Servicio
        </button>
      </div>

      <div className="tabla-container">
        <table className="tabla-custom">
          <thead>
            <tr>
              <th>Nombre Servicio</th>
              <th>Precio</th>
              <th>Duración (min)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 ? (
              <tr><td colSpan="4" className="no-data">No hay servicios registrados.</td></tr>
            ) : (
              servicios.map((s) => (
                <tr key={s._id}>
                  <td>{s.nombre_servicio}</td>
                  <td>${s.precio?.toLocaleString('es-CL')}</td>
                  <td>{s.duracion} min</td>
                  <td>
                    <div className="acciones-btns">
                      <button className="btn-editar" onClick={() => abrirModal(s)} title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-eliminar" onClick={() => solicitarEliminar(s._id)} title="Eliminar">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE FORMULARIO (Crear/Editar) */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modoEdicion ? "Editar Servicio" : "Añadir Servicio"}</h3>
            
            {mensajeError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                {mensajeError}
              </div>
            )}

            <form onSubmit={guardarServicio}>
              <div className="form-group">
                <label>Nombre del Servicio *</label>
                <input 
                  type="text" 
                  value={servicioActual.nombre_servicio}
                  onChange={(e) => setServicioActual({...servicioActual, nombre_servicio: e.target.value})}
                  className="input-modal"
                  placeholder="Ej: Perfilado de Barba"
                />
              </div>

              <div className="form-group">
                <label>Precio ($) *</label>
                <input 
                  type="number" 
                  value={servicioActual.precio}
                  onChange={(e) => setServicioActual({...servicioActual, precio: e.target.value})}
                  className="input-modal"
                  placeholder="5000"
                />
              </div>

              <div className="form-group">
                <label>Duración (minutos)</label>
                <input 
                  type="number" 
                  value={servicioActual.duracion}
                  onChange={(e) => setServicioActual({...servicioActual, duracion: e.target.value})}
                  className="input-modal"
                  placeholder="30"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-admin-action btn-gris" onClick={() => setModalVisible(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-admin-action btn-verde">
                  {modoEdicion ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINAR (Estilo Barbería) */}
      {showModalEliminar && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '15px' }}></i>
            <h3>¿Eliminar Servicio?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-admin-action btn-gris" onClick={() => setShowModalEliminar(false)}>Cancelar</button>
              <button className="btn-admin-action btn-rojo" onClick={confirmarEliminar}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO (Estilo Barbería) */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content success-modal-content">
            <i className="fas fa-check-circle success-icon"></i>
            <h3 className="success-title">¡Operación Exitosa!</h3>
            <p>{successMessage}</p>
            <button className="success-btn-close" onClick={() => setShowSuccess(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </DashboardLayoutAdmin>
  );
}