import Link from "next/link";
import { useRouter } from "next/router";

export default function DashboardLayoutBarbero({ usuario = "Barbero", children }) {
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
          <Link href="/Panel-Barbero">RADIANT • Barbero</Link>
          <small>@{usuario}</small>
        </div>

        <nav className="menu">
          <Link href="/Panel-Barbero">Agenda</Link>
          <Link href="/Panel-Barbero/historial">Historial</Link>
        </nav>

        <button className="btn-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}