import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ReportesAdmin() {
  const [kpi, setKpi] = useState({ totales: 0, completadas: 0, barberos: 0 });
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resAll, resBarberos] = await Promise.all([
          fetch(`${backendUrl}/reservas/detalle/`).then((r) => r.json()),
          fetch(`${backendUrl}/barberos/`).then((r) => r.json()),
        ]);

        const totalReservas = Array.isArray(resAll) ? resAll.length : 0;

        const reservasCompletadas = (Array.isArray(resAll) ? resAll : []).filter(
          (x) => {
            const estado = x.estado ? x.estado.toLowerCase() : "";
            return estado === "completado" || estado === "asistio" || estado === "finalizado";
          }
        ).length;

        setKpi({
          totales: totalReservas,
          completadas: reservasCompletadas,
          barberos: Array.isArray(resBarberos) ? resBarberos.length : 0
        });

      } catch (e) {
        console.error("Error cargando reportes:", e);
      }
    };
    cargar();
  }, [backendUrl]);

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <h2>Reportes Generales</h2>
      <div className="cards-grid">
        <div className="card-reporte">
          <h4>Reservas Totales</h4>
          <b>{kpi.totales}</b>
        </div>
        <div className="card-reporte">
          <h4>Asistencias / Completadas</h4>
          <b>{kpi.completadas}</b>
        </div>
        <div className="card-reporte">
          <h4>Barberos Activos</h4>
          <b>{kpi.barberos}</b>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
}