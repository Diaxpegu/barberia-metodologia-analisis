import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ReportesAdmin() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  // Estados de datos crudos
  const [todasReservas, setTodasReservas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);

  // Estados de Filtros
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7));
  const [filtroBarbero, setFiltroBarbero] = useState("");

  // Estado de KPIs
  const [kpi, setKpi] = useState({
    totalReservas: 0,
    ingresosTotales: 0,
    servicioMasSolicitado: "N/A"
  });

  // 1. Cargar Datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resReservas, resBarberos, resServicios] = await Promise.all([
          fetch(`${backendUrl}/reservas/detalle/`).then((r) => r.json()),
          fetch(`${backendUrl}/barberos/`).then((r) => r.json()),
          fetch(`${backendUrl}/servicios/`).then((r) => r.json()),
        ]);

        setTodasReservas(Array.isArray(resReservas) ? resReservas : []);
        setBarberos(Array.isArray(resBarberos) ? resBarberos : []);
        setServicios(Array.isArray(resServicios) ? resServicios : []);
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    };
    cargarDatos();
  }, [backendUrl]);

  // 2. Filtrar y Calcular
  useEffect(() => {
    if (todasReservas.length === 0) return;

    const reservasFiltradas = todasReservas.filter((reserva) => {
      const mesReserva = reserva.fecha ? reserva.fecha.slice(0, 7) : "";
      const coincideMes = mesReserva === filtroMes;
      const coincideBarbero = filtroBarbero ? reserva.id_barbero === filtroBarbero : true;
      const estadoValido = reserva.estado !== "cancelado" && reserva.estado !== "no_asistio";
      
      return coincideMes && coincideBarbero && estadoValido;
    });

    // Cálculos
    const total = reservasFiltradas.length;
    let ingresos = 0;
    const conteoServicios = {};

    reservasFiltradas.forEach((reserva) => {
      let nombreServicio = reserva.servicio_nombre;
      if (reserva.servicio && reserva.servicio[0]) {
        nombreServicio = reserva.servicio[0].nombre_servicio;
      }

      const servicioInfo = servicios.find(s => s.nombre_servicio === nombreServicio);
      if (servicioInfo && servicioInfo.precio) {
        ingresos += servicioInfo.precio;
      }

      if (nombreServicio) {
        conteoServicios[nombreServicio] = (conteoServicios[nombreServicio] || 0) + 1;
      }
    });

    let topServicio = "N/A";
    let maxCount = 0;
    Object.entries(conteoServicios).forEach(([nombre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topServicio = nombre;
      }
    });

    setKpi({
      totalReservas: total,
      ingresosTotales: ingresos,
      servicioMasSolicitado: topServicio
    });

  }, [filtroMes, filtroBarbero, todasReservas, servicios]);

  const formatoDinero = (monto) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <div className="reportes-header">
        <h2>Reportes Mensuales</h2>
        <p>Análisis de flujo de clientes y rendimiento.</p>
      </div>

      <div className="filtros-container">
        <div className="filtro-item">
          <label>Seleccionar Mes:</label>
          <input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="input-filtro"
          />
        </div>

        <div className="filtro-item">
          <label>Filtrar por Barbero:</label>
          <select
            value={filtroBarbero}
            onChange={(e) => setFiltroBarbero(e.target.value)}
            className="input-filtro"
          >
            <option value="">-- Todos los Barberos --</option>
            {barberos.map((b) => (
              <option key={b._id} value={b._id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card-reporte">
          <h4>Total de Reservas</h4>
          <b>{kpi.totalReservas}</b>
          <span className="subtext">Citas agendadas</span>
        </div>

        <div className="card-reporte ingreso">
          <h4>Ingresos Estimados</h4>
          <b>{formatoDinero(kpi.ingresosTotales)}</b>
          <span className="subtext">En base a servicios</span>
        </div>

        <div className="card-reporte servicio">
          <h4>Servicio Top</h4>
          <b>{kpi.servicioMasSolicitado}</b>
          <span className="subtext">Más popular del mes</span>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
}