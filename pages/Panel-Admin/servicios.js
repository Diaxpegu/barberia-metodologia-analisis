import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";
import DataTable from "../../components/DataTable";

export default function Servicios() {
  const [data, setData] = useState([]);
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  useEffect(() => {
    fetch(`${backendUrl}/servicios/`)
      .then((r) => r.json())
      .then((data) => setData(data))
      .catch((e) => console.error(e));
  }, [backendUrl]);

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <h2>Servicios y Precios</h2>
      <DataTable
        columnas={["nombre_servicio", "precio", "duracion"]}
        data={data.map((s) => ({
          nombre_servicio: s.nombre_servicio || "-",
          precio: `$${s.precio || 0}`,
          duracion: s.duracion || "N/A",
        }))}
      />
    </DashboardLayoutAdmin>
  );
}
