import { useEffect, useState } from "react";
import DashboardLayoutBarbero from "../../components/DashboardLayoutBarbero";

export default function PanelBarbero() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back-production-57ce.up.railway.app";

  const [agenda, setAgenda] = useState([]);
  const [barbero, setBarbero] = useState(null);

  const [fechaBloqueo, setFechaBloqueo] = useState(new Date().toISOString().split('T')[0]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  useEffect(() => {
    const usuario = localStorage.getItem("barberUser");
    const id = localStorage.getItem("barberId") || localStorage.getItem("_id");
    if (!usuario || !id) {
      window.location.href = "/login";
      return;
    }
    setBarbero({ usuario, id });

    cargarAgenda(id);
    cargarDisponibilidad(id, fechaBloqueo);
  }, [backendUrl]);

  useEffect(() => {
    if (barbero?.id) {
      cargarDisponibilidad(barbero.id, fechaBloqueo);
    }
  }, [fechaBloqueo]);

  const cargarAgenda = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/barbero/agenda/${id}`);
      if (!res.ok) throw new Error("Error al cargar agenda");
      const data = await res.json();
      setAgenda(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error agenda:", err);
    }
  };

  const cargarDisponibilidad = async (id, fecha) => {
    try {
      const res = await fetch(`${backendUrl}/barberos/${id}/disponibilidades`);
      const data = await res.json();
      const delDia = data.filter(d => d.fecha === fecha);
      setHorasDisponibles(delDia);
    } catch (err) {
      console.error("Error disponibilidad:", err);
    }
  };

  const bloquearHora = async (hora, estadoActual) => {
    if (estadoActual !== 'disponible') return alert("Esta hora ya está ocupada o bloqueada.");
    if (!confirm(`¿Deseas bloquear el horario de las ${hora}?`)) return;

    try {
      const res = await fetch(`${backendUrl}/disponibilidad/bloquear/${barbero.id}/${fechaBloqueo}/${hora}`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert("Horario bloqueado correctamente.");
        cargarDisponibilidad(barbero.id, fechaBloqueo);
      } else {
        alert("Error al bloquear.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayoutBarbero usuario={barbero?.usuario}>

      {/* AGENDA */}
      <h2>Agenda de Citas</h2>
      <p>Tus próximas citas pendientes.</p>

      <div className="card-panel">
        {agenda.length === 0 ? (
          <p className="no-data">No tienes citas pendientes por ahora.</p>
        ) : (
          <table className="tabla-estilizada">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {agenda.map((item) => (
                <tr key={item._id}>
                  <td>{item.fecha}</td>
                  <td>{item.hora}</td>
                  <td>{item.cliente?.[0]?.nombre || "N/A"}</td>
                  <td>{item.servicio?.[0]?.nombre_servicio || "N/A"}</td>
                  <td><span className="badge-pendiente">{item.estado || "pendiente"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* BLOQUEAR HORARIOS */}
      <h2 style={{ marginTop: '3rem' }}>Gestionar Disponibilidad</h2>
      <p>Selecciona una fecha y haz clic en una hora disponible para bloquearla (descanso, almuerzo, etc).</p>

      <div className="card-panel">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Fecha:</label>
          <input
            type="date"
            value={fechaBloqueo}
            onChange={(e) => setFechaBloqueo(e.target.value)}
            className="input-fecha"
          />
        </div>

        <div className="grid-horas">
          {horasDisponibles.length === 0 ? (
            <p>No hay horarios generados para esta fecha.</p>
          ) : (
            horasDisponibles.map((slot, idx) => (
              <button
                key={idx}
                className={`btn-hora ${slot.estado}`}
                onClick={() => bloquearHora(slot.hora, slot.estado)}
                disabled={slot.estado !== 'disponible'}
                title={slot.estado === 'disponible' ? 'Clic para bloquear' : 'No disponible'}
              >
                {slot.hora} <br />
                <small style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{slot.estado}</small>
              </button>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .card-panel {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .tabla-estilizada {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border-bottom: 1px solid #eee;
          padding: 12px;
          text-align: left;
        }
        th {
          background: #333;
          color: white;
        }
        .no-data {
            color: #777;
            font-style: italic;
        }
        .badge-pendiente {
            background: #fff3cd;
            color: #856404;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: bold;
        }
        
        /* Estilos Bloqueo */
        .input-fecha {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .grid-horas {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
        }
        .btn-hora {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: bold;
        }
        .btn-hora.disponible {
            background-color: #d4edda;
            color: #155724;
            border-color: #c3e6cb;
        }
        .btn-hora.disponible:hover {
            background-color: #c3e6cb;
            transform: scale(1.05);
        }
        .btn-hora.ocupado, .btn-hora.pendiente {
            background-color: #f8d7da;
            color: #721c24;
            border-color: #f5c6cb;
            cursor: not-allowed;
            opacity: 0.7;
        }
      `}</style>
    </DashboardLayoutBarbero>
  );
}