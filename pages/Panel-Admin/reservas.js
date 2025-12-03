import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ReservasAdmin() {
  const [reservas, setReservas] = useState([]);
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

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

  const actualizarEstado = async (id, nuevoEstado) => {
    if (nuevoEstado !== "listo") {
      if (!confirm(`¿Estás seguro de cambiar el estado a: ${nuevoEstado}?`)) return;
    }

    try {
      const res = await fetch(`${backendUrl}/reservas/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        cargarReservas();
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
                          onClick={() => actualizarEstado(reserva._id, "completado")}
                          title="Marcar como Completado"
                        >
                          <i className="fas fa-check"></i> Listo
                        </button>

                        {/* Botón CANCELADO */}
                        <button
                          className="btn-no-asistio"
                          onClick={() => actualizarEstado(reserva._id, "cancelado")}
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
    </DashboardLayoutAdmin>
  );
}