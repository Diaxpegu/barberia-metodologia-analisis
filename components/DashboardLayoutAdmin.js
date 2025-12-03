import Link from "next/link";
import { useRouter } from "next/router";

export default function DashboardLayoutAdmin({ usuario = "Admin", children }) {
  const router = useRouter();

  const logout = () => {
    try {
      localStorage.removeItem("usuario");
      localStorage.removeItem("rol");
      localStorage.removeItem("barberUser");
      localStorage.removeItem("barberId");
    } catch (_) { }
    router.push("/login");
  };

  return (
    <div className="dash-wrap">
      <aside className="sidebar">
        <div className="brand">
          <Link href="/Panel-Admin">RADIANT • Admin</Link>
          <small>{usuario}</small>
        </div>

        <nav className="menu">
          <Link href="/Panel-Admin">Inicio</Link>
          <Link href="/Panel-Admin/barberos">Barberos</Link>
          <Link href="/Panel-Admin/clientes">Clientes</Link>
          <Link href="/Panel-Admin/servicios">Servicios</Link>
          <Link href="/Panel-Admin/reservas">Reservas</Link>
          <Link href="/Panel-Admin/reportes">Reportes</Link>
          <Link href="/Panel-Admin/configuracion">Configuración</Link>
        </nav>

        <button className="btn-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}