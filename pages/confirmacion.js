import { useRouter } from "next/router";
import Link from "next/link";
import React from "react";

export default function Confirmacion() {
  const router = useRouter();
  const { query } = router;
  if (!router.isReady) {
    return <p className="loading-container">Cargando confirmación...</p>;
  }
  if (!query.fecha || !query.servicio) {
     return (
       <section className="confirmacion-page-wrapper">
         <div className="confirmacion-card">
           <div className="confirmacion-header">
             <h2>Error</h2>
             <p>No se encontraron datos de la reserva.</p>
           </div>
           <div className="confirmacion-acciones">
             <Link href="/" legacyBehavior>
               <a className="btn-back-home">
                 <i className="fas fa-home"></i> Volver al Inicio
               </a>
             </Link>
           </div>
         </div>
       </section>
     );
  }

  return (
    <section className="confirmacion-page-wrapper">
      <div className="confirmacion-card">
        <div className="confirmacion-header">
          <i className="fas fa-check-circle"></i>
          <h2>¡Reserva Enviada!</h2>
          <p>Tu solicitud de cita ha sido registrada correctamente.</p>
        </div>
        <div className="confirmacion-detalles">
          <h3>Detalles de tu reserva</h3>
          <div className="confirmacion-detalles-grid">
            
            {query.reservaId && (
              <div className="detalle-item">
                <strong>Número de reserva:</strong>
                <span>#{query.reservaId}</span>
              </div>
            )}
            <div className="detalle-item">
              <strong>Servicio:</strong>
              <span>{query.servicio || "-"}</span>
            </div>
            <div className="detalle-item">
              <strong>Barbero:</strong>
              <span>{query.peluqueroNombre || "-"}</span>
            </div>
            <div className="detalle-item">
              <strong>Fecha:</strong>
              <span>{query.fecha || "-"}</span>
            </div>
            <div className="detalle-item">
              <strong>Hora:</strong>
              <span>{query.hora || "-"}</span>
            </div>
            <div className="detalle-item">
              <strong>Cliente:</strong>
              <span>
                {query.clienteNombre} {query.clienteApellido || ''}
              </span>
            </div>
            <div className="detalle-item">
              <strong>Email:</strong>
              <span>{query.clienteEmail}</span>
            </div>
            <div className="detalle-item">
              <strong>Teléfono:</strong>
              <span>{query.clienteTelefono}</span>
            </div>
            {query.clienteRut && (
              <div className="detalle-item">
                <strong>RUT:</strong>
                <span>{query.clienteRut}</span>
              </div>
            )}
          </div>
        </div>

        <div className="confirmacion-info">
          <p>
            <i className="fas fa-info-circle"></i> Tu reserva será confirmada por
            nuestro administrador. Recibirás un correo cuando sea aprobada.
          </p>
          <p>
            <i className="fas fa-clock"></i> Por favor llega 5 minutos antes de tu
            hora agendada.
          </p>
        </div>

        <div className="confirmacion-acciones">
          <Link href="/" legacyBehavior>
            <a className="btn-back-home">
              <i className="fas fa-home"></i> Volver al Inicio
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}