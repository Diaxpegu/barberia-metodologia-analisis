import { useEffect, useState } from "react";
import DashboardLayoutBarbero from "../../components/DashboardLayoutBarbero";
import DataTable from "../../components/DataTable";

export default function HistorialBarbero() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  const [historial, setHistorial] = useState([]);
  const [barbero, setBarbero] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem("barberUser");
    const id = localStorage.getItem("barberId");
    if (!usuario || !id) {
      window.location.href = "/login";
      return;
    }
    setBarbero({ usuario, id });

    const cargarHistorial = async () => {
      try {
        const res = await fetch(`${backendUrl}/barbero/historial/${id}`);
        const data = await res.json();

        const historialProcesado = (Array.isArray(data) ? data : []).map((item) => {
          let nombreCliente = "Anónimo";
          if (item.cliente && item.cliente[0] && item.cliente[0].nombre) {
            nombreCliente = item.cliente[0].nombre;
          } else if (item.datos_cliente_snapshot && item.datos_cliente_snapshot.nombre) {
            nombreCliente = item.datos_cliente_snapshot.nombre;
          }

          let nombreServicio = "Servicio";
          if (item.servicio && item.servicio[0] && item.servicio[0].nombre_servicio) {
            nombreServicio = item.servicio[0].nombre_servicio;
          } else if (item.servicio_nombre) {
            nombreServicio = item.servicio_nombre;
          }

          return {
            _id: item._id,
            fecha: item.fecha,
            hora: item.hora,
            cliente: nombreCliente,
            servicio: nombreServicio,
            estado: item.estado
          };
        });

        setHistorial(historialProcesado);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    };
    cargarHistorial();
  }, [backendUrl]);

  const columnas = ["fecha", "hora", "cliente", "servicio", "estado"];

  return (
    <DashboardLayoutBarbero usuario={barbero?.usuario}>
      <h2>Historial de Citas Completadas</h2>
      <p>Visualiza tus citas atendidas anteriormente.</p>
      <DataTable data={historial} columnas={columnas} />
    </DashboardLayoutBarbero>
  );
}