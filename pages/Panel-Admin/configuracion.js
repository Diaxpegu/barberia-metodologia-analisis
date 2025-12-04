import DashboardLayoutAdmin from "../../components/DashboardLayoutAdmin";

export default function ConfiguracionAdmin() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  const regenerar = async () => {
    alert("Esta acción requiere un endpoint de mantenimiento (no crítico).");
  };

  return (
    <DashboardLayoutAdmin usuario="Administrador">
      <h2>Configuración</h2>
      <p>Opciones generales del sistema.</p>

      <div className="box">
        <h4>Mantenimiento</h4>
        <button onClick={regenerar}>Regenerar disponibilidades (demo)</button>
      </div>

      <style jsx>{`
        .box {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.05);
        }
        button {
          background: #6366f1;
          border: 0;
          color: #fff;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>
    </DashboardLayoutAdmin>
  );
}
