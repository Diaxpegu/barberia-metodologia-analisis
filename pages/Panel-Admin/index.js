import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function PanelAdmin() {
  const [resumen, setResumen] = useState({
    clientes: 0,
    barberos: 0,
    reservas: 0,
    servicios: 0,
  });

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const [clientes, barberos, reservas, servicios] = await Promise.all([
          fetch(`${backendUrl}/clientes/`).then((r) => r.json()),
          fetch(`${backendUrl}/barberos/`).then((r) => r.json()),
          fetch(`${backendUrl}/reservas/detalle/`).then((r) => r.json()),
          fetch(`${backendUrl}/servicios/`).then((r) => r.json()),
        ]);

        setResumen({
          clientes: clientes.length,
          barberos: barberos.length,
          reservas: reservas.length,
          servicios: servicios.length,
        });
      } catch (err) {
        console.error("Error:", err);
      }
    };
    cargarResumen();
  }, [backendUrl]);

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <h2>Panel General</h2>
      <p>Resumen general del sistema.</p>
      <div className="resumen-grid">
        {Object.entries(resumen).map(([key, val]) => (
          <div key={key} className={`card ${key}`}>
            <h4>{key.toUpperCase()}</h4>
            <span>{val}</span>
          </div>
        ))}
      </div>
    </DashboardLayoutAdmin>
  );
}
