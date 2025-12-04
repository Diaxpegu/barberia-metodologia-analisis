import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Reserva() {
  const router = useRouter();
  const { slug } = router.query;

  const [peluquero, setPeluquero] = useState(null);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    servicio: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rut: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Nuevo estado de carga explícito
  const [selectedDate, setSelectedDate] = useState('');
  const [availableHours, setAvailableHours] = useState({});

  // ✅ URL ACTUALIZADA (La misma que usas en Reportes y Login)
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://back-production-57ce.up.railway.app';

  // --- Carga de datos ---
  useEffect(() => {
    if (!slug) return;
    const cargarBarbero = async () => {
      setLoading(true);
      try {
        // 1. Obtener todos los barberos
        const res = await fetch(`${backendUrl}/barberos/`);
        if (!res.ok) throw new Error("Error al conectar con el servidor");
        
        const todos = await res.json();
        
        // Normalización del slug para encontrar al barbero correcto
        const crearSlug = (n) => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const encontrado = todos.find(b => crearSlug(b.nombre) === slug.toLowerCase());
        
        if (!encontrado) { 
            setError('Barbero no encontrado. Verifica la dirección URL.'); 
            setLoading(false);
            return; 
        }

        // 2. Obtener disponibilidades del barbero encontrado
        const resHorarios = await fetch(`${backendUrl}/barberos/${encontrado._id}/disponibilidades`);
        const dataHorarios = await resHorarios.json();
        
        const formateado = {};
        if(Array.isArray(dataHorarios)) {
            dataHorarios.forEach((s) => {
            if (!formateado[s.fecha]) formateado[s.fecha] = {};
            formateado[s.fecha][s.hora] = s.estado;
            });
        }

        setPeluquero({
          ...encontrado,
          horarios: formateado,
          servicios: ['Corte básico', 'Corte premium', 'Tintura', 'Lavado', 'Peinado'],
          precios: { 'Corte básico': 15000, 'Corte premium': 20000, 'Tintura': 25000, 'Lavado': 5000, 'Peinado': 10000 },
        });
      } catch (err) { 
          console.error(err);
          setError('Error al cargar datos del barbero. Intenta recargar la página.'); 
      } finally {
          setLoading(false);
      }
    };
    cargarBarbero();
  }, [slug, backendUrl]);

  useEffect(() => {
    if (selectedDate && peluquero && peluquero.horarios[selectedDate]) {
      setAvailableHours(peluquero.horarios[selectedDate]);
    } else {
      setAvailableHours({});
    }
    setFormData(p => ({ ...p, hora: '' }));
  }, [selectedDate, peluquero]);

  //  Handlers 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setFormData(prev => ({ ...prev, fecha: e.target.value }));
    setError('');
  };

  const handleHourChange = (e) => {
    setFormData(prev => ({ ...prev, hora: e.target.value }));
    setError('');
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.fecha) return setError('Selecciona una fecha.');
      if (!formData.hora) return setError('Selecciona un horario.');
      if (!formData.servicio) return setError('Selecciona un servicio.');
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      setError('Completa los campos obligatorios (*).');
      return;
    }

    const datosReserva = {
      id_barbero: peluquero._id,
      fecha: formData.fecha,
      hora: formData.hora,
      nombre_cliente: formData.nombre,
      apellido_cliente: formData.apellido,
      email_cliente: formData.email,
      telefono_cliente: formData.telefono,
      rut_cliente: formData.rut,
      servicio_nombre: formData.servicio,
    };

    try {
      const res = await fetch(`${backendUrl}/reservas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosReserva),
      });
      const resultado = await res.json();
      if (!res.ok) throw new Error(resultado.detail || 'Error');

      router.push({
        pathname: '/confirmacion',
        query: {
          peluqueroNombre: peluquero.nombre,
          servicio: formData.servicio,
          fecha: formData.fecha,
          hora: formData.hora,
          clienteNombre: formData.nombre,
          clienteApellido: formData.apellido,
          clienteEmail: formData.email,
          clienteTelefono: formData.telefono,
          clienteRut: formData.rut,
          reservaId: resultado.id_reserva ? resultado.id_reserva.slice(-6).toUpperCase() : 'N/A',
        },
      });
    } catch (err) {
      setError('Error al agendar reserva. Inténtalo de nuevo.');
    }
  };

  // Renderizado Condicional Mejorado
  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando información del barbero...</div>;
  
  if (error && !peluquero) return (
      <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
          <h3>Ocurrió un problema</h3>
          <p>{error}</p>
          <button onClick={() => router.push('/')} style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>Volver al Inicio</button>
      </div>
  );

  return (
    <>
      <Head><title>Agendar Cita | Radiant</title></Head>

      <div className="page-wrapper">

        <div className="main-header">
          <h2>AGENDAR CITA</h2>
          <p>Reserva tu experiencia con <strong style={{ color: 'var(--color-secondary)' }}>{peluquero.nombre}</strong></p>
        </div>

        <div className="reserva-layout">
          <section className="form-container">

            {/* Stepper */}
            <div className="stepper">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
                <div className="step-title">Selección</div>
              </div>
              <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-title">Tus Datos</div>
              </div>
            </div>

            {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle"></i> {error}</div>}

            <form onSubmit={handleSubmit}>

              {/* PASO 1 */}
              {currentStep === 1 && (
                <div className="step-content animate-fade">

                  {/* Fecha Compacta */}
                  <div className="input-group">
                    <label className="label-title"><i className="far fa-calendar-alt"></i> ¿Qué día prefieres?</label>
                    <div className="date-picker-wrapper">
                      <input
                        type="date"
                        className="modern-input"
                        onChange={handleDateChange}
                        value={formData.fecha}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width: 'auto', minWidth: '200px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Horarios Grid */}
                  <div className="input-group">
                    <label className="label-title"><i className="far fa-clock"></i> Horarios Disponibles</label>
                    {!selectedDate ? (
                      <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>Selecciona una fecha primero.</p>
                    ) : (
                      <div className="hours-grid">
                        {Object.keys(availableHours).length > 0 ? (
                          Object.keys(availableHours).map(h => (
                            <label key={h} className="hour-btn">
                              <input
                                type="radio"
                                name="hora"
                                value={h}
                                onChange={handleHourChange}
                                checked={formData.hora === h}
                                disabled={availableHours[h] !== 'disponible'}
                              />
                              <span className="hour-label">{h}</span>
                            </label>
                          ))
                        ) : <p style={{ fontSize: '0.9rem' }}>No hay horas disponibles.</p>}
                      </div>
                    )}
                  </div>

                  {/* Servicio */}
                  <div className="input-group">
                    <label className="label-title"><i className="fas fa-cut"></i> Selecciona el Servicio</label>
                    <select className="modern-select" name="servicio" value={formData.servicio} onChange={handleChange}>
                      <option value="">-- Seleccionar --</option>
                      {peluquero.servicios.map(s => (
                        <option key={s} value={s}>{s} — ${peluquero.precios[s]?.toLocaleString('es-CL')}</option>
                      ))}
                    </select>
                  </div>

                  <div className="actions" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-primary" onClick={handleNextStep}>
                      Siguiente Paso <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {currentStep === 2 && (
                <div className="step-content animate-fade">
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontFamily: 'Bebas Neue' }}>INFORMACIÓN DE CONTACTO</h3>

                  <div className="form-grid-2">
                    <div className="input-group">
                      <label className="label-title">Nombre *</label>
                      <input className="modern-input" name="nombre" placeholder="Ej: Juan" onChange={handleChange} value={formData.nombre} />
                    </div>
                    <div className="input-group">
                      <label className="label-title">Apellido *</label>
                      <input className="modern-input" name="apellido" placeholder="Ej: Pérez" onChange={handleChange} value={formData.apellido} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="label-title">Correo Electrónico *</label>
                    <input className="modern-input" type="email" name="email" placeholder="nombre@correo.com" onChange={handleChange} value={formData.email} />
                  </div>

                  <div className="form-grid-2">
                    <div className="input-group">
                      <label className="label-title">Teléfono *</label>
                      <input className="modern-input" name="telefono" placeholder="+56 9..." onChange={handleChange} value={formData.telefono} />
                    </div>
                    <div className="input-group">
                      <label className="label-title">RUT (Opcional)</label>
                      <input className="modern-input" name="rut" placeholder="12.345.678-9" onChange={handleChange} value={formData.rut} />
                    </div>
                  </div>

                  <div className="actions">
                    <button type="button" className="btn-outline" onClick={handlePrevStep}>
                      <i className="fas fa-arrow-left"></i> Volver
                    </button>
                    <button type="submit" className="btn-primary">
                      Confirmar Cita <i className="fas fa-check-circle"></i>
                    </button>
                  </div>
                </div>
              )}

            </form>
          </section>

          {/* COLUMNA DERECHA: RESUMEN */}
          <aside className="summary-container">
            <div className="ticket">
              <div className="ticket-header">
                <h4><i className="fas fa-receipt"></i> TU RESUMEN</h4>
              </div>

              <div className="ticket-content">
                <div className="ticket-row">
                  <span>Barbero:</span>
                  <strong>{peluquero.nombre}</strong>
                </div>
                <div className="ticket-row">
                  <span>Fecha:</span>
                  <strong>{formData.fecha || '--/--/--'}</strong>
                </div>
                <div className="ticket-row">
                  <span>Hora:</span>
                  <strong>{formData.hora || '--:--'}</strong>
                </div>

                <div style={{ margin: '1rem 0', borderBottom: '1px solid #eee' }}></div>

                <div className="ticket-row">
                  <span>Servicio:</span>
                  <span style={{ textAlign: 'right', maxWidth: '120px' }}>{formData.servicio || '---'}</span>
                </div>

                <div className="ticket-total">
                  <span>TOTAL</span>
                  <span>${peluquero.precios[formData.servicio] ? peluquero.precios[formData.servicio].toLocaleString('es-CL') : '0'}</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}