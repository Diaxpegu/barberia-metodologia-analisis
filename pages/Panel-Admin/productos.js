import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";
import DataTable from "../../components/DataTable";

export default function ProductosAdmin() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch(`${backendUrl}/productos/`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const limpio = data.map((p) => ({
            nombre: p.nombre || p.nombre_producto || "Producto",
            marca: p.marca || "Sin marca",
            precio: p.precio ? `$${p.precio}` : "N/A",
          }));
          setProductos(limpio);
        }
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };
    cargarProductos();
  }, [backendUrl]);

  const columnas = ["nombre", "marca", "precio"];

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <h2>Productos de Barbería</h2>
      <p>Lista de productos disponibles.</p>
      <DataTable data={productos} columnas={columnas} />
    </DashboardLayoutAdmin>
  );
}
