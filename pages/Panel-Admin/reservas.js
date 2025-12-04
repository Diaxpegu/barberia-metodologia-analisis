import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ReservasAdmin() {
  const [reservas, setReservas] = useState([]);
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  // ESTADOS ESTILO BARBERIA.JS
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para confirmación de acción (Listo / Cancelar)
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState({ id: "", nuevoEstado: "" });

  const cargarReservas = async () => {
    try {
      const r = await fetch(`${backendUrl}/reservas/detalle/`);
      const data = await r.json();

      const pendientes = (Array.isArray(data) ? data : []).filter(reserva =>
        reserva.estado === 'pendiente' || reserva.estado === 'reserva'
      );

      setReservas(pendientes);
    } catch (e) {
      console.error(e);
      setReservas([]);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [backendUrl]);

  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
  };

  // 1. Solicitar acción (Abre modal)
  const solicitarActualizacion = (id, nuevoEstado) => {
    setAccionPendiente({ id, nuevoEstado });
    setShowModalConfirmar(true);
  };

  // 2. Confirmar acción (Llama a API)
  const confirmarActualizacion = async () => {
    const { id, nuevoEstado } = accionPendiente;
    if (!id) return;

    try {
      const res = await fetch(`${backendUrl}/reservas/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        cargarReservas();
        setShowModalConfirmar(false);
        // Mensaje personalizado según la acción
        if (nuevoEstado === "completado") {
            triggerSuccess("¡Cita marcada como completada!");
        } else {
            triggerSuccess("La reserva ha sido cancelada.");
        }
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <h2>Gestión de Reservas</h2>
      <p>Clientes en espera (Estado: Reserva/Pendiente)</p>

      <div className="tabla-container">
        <table className="tabla-custom">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No hay reservas pendientes.
                </td>
              </tr>
            ) : (
              reservas.map((reserva) => {
                const c = reserva.cliente && reserva.cliente[0] ? reserva.cliente[0] : {};
                const nombre = c.nombre || "Sin nombre";
                const apellido = c.apellido || c.apellidos || "-";
                const correo = c.correo || c.email || "-";
                const telefono = c.telefono || c.celular || "-";

                return (
                  <tr key={reserva._id}>
                    <td>{nombre}</td>
                    <td>{apellido}</td>
                    <td>{correo}</td>
                    <td>{telefono}</td>
                    <td>
                      <div className="acciones-btns">
                        {/* Botón LISTO */}
                        <button
                          className="btn-asistio"
                          onClick={() => solicitarActualizacion(reserva._id, "completado")}
                          title="Marcar como Completado"
                        >
                          <i className="fas fa-check"></i> Listo
                        </button>

                        {/* Botón CANCELADO */}
                        <button
                          className="btn-no-asistio"
                          onClick={() => solicitarActualizacion(reserva._id, "cancelado")}
                          title="Cancelar Cita"
                        >
                          <i className="fas fa-times"></i> Cancelado
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ACCIÓN */}
      {showModalConfirmar && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <i 
              className={`fas ${accionPendiente.nuevoEstado === 'completado' ? 'fa-check-circle' : 'fa-times-circle'}`} 
              style={{ fontSize: '3rem', color: accionPendiente.nuevoEstado === 'completado' ? '#10b981' : '#ef4444', marginBottom: '15px' }}
            ></i>
            <h3>¿Estás seguro?</h3>
            <p>
              Vas a marcar esta reserva como: <strong>{accionPendiente.nuevoEstado === 'completado' ? 'COMPLETADA' : 'CANCELADA'}</strong>
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-admin-action btn-gris" onClick={() => setShowModalConfirmar(false)}>Volver</button>
              <button 
                className={`btn-admin-action ${accionPendiente.nuevoEstado === 'completado' ? 'btn-verde' : 'btn-rojo'}`} 
                onClick={confirmarActualizacion}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO (Estilo Barbería) */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content success-modal-content">
            <i className="fas fa-check-circle success-icon"></i>
            <h3 className="success-title">¡Éxito!</h3>
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