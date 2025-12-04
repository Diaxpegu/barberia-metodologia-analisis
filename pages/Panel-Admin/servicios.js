import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ServiciosAdmin() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  const [servicios, setServicios] = useState([]);
  
  // Estados para Modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [servicioActual, setServicioActual] = useState({
    _id: "",
    nombre_servicio: "",
    precio: "",
    duracion: ""
  });

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

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

  const abrirModal = (servicio = null) => {
    setMensaje({ texto: "", tipo: "" });
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
      setMensaje({ texto: "El nombre del servicio es obligatorio", tipo: "error" });
      return;
    }
    if (!servicioActual.precio) {
      setMensaje({ texto: "El precio es obligatorio", tipo: "error" });
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
        setModalVisible(false);
        alert(modoEdicion ? "Servicio actualizado correctamente" : "Servicio creado exitosamente");
      } else {
        setMensaje({ texto: "Error al guardar en el servidor", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    }
  };

  const eliminarServicio = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este servicio?")) return;
    try {
      await fetch(`${backendUrl}/servicios/${id}`, { method: "DELETE" });
      cargarServicios();
    } catch (e) {
      console.error(e);
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
              <th>Duración</th>
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
                      <button className="btn-eliminar" onClick={() => eliminarServicio(s._id)} title="Eliminar">
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

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modoEdicion ? "Editar Servicio" : "Añadir Servicio"}</h3>
            
            {mensaje.texto && (
              <div className={`mensaje-alerta ${mensaje.tipo}`}>
                {mensaje.texto}
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
    </DashboardLayoutAdmin>
  );
}