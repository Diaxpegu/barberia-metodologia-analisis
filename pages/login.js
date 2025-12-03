import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [colorMensaje, setColorMensaje] = useState('');
  const router = useRouter();

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://back-production-57ce.up.railway.app';

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');
    setColorMensaje('');

    try {
      const res = await fetch(`${backendUrl}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        setColorMensaje('red');
        setMensaje(data.detail || 'Usuario o contraseña incorrectos');
        localStorage.clear();
        return;
      }
      localStorage.clear(); 
      localStorage.setItem('usuario', data.usuario);
      localStorage.setItem('rol', data.rol);
      if (data.rol === 'barbero') {
        localStorage.setItem('barberUser', data.usuario); 
        localStorage.setItem('barberId', data._id); 
      }
      setColorMensaje('green');
      setMensaje('Inicio de sesión exitoso');

      setTimeout(() => {
        if (data.rol === 'jefe') {
          router.push('/Panel-Admin');
        } else if (data.rol === 'barbero') {
          router.push('/Panel-Barbero');
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setColorMensaje('red');
      setMensaje('Error al conectar con el servidor');
    }
  };

  return (
    <section className="login-container">
      <div className="login-box">
        <h2>Acceso de Jefe o Barbero</h2>

        {mensaje && (
          <div
            style={{
              color: colorMensaje,
              backgroundColor: colorMensaje === 'green' ? '#d4edda' : '#f8d7da',
              padding: '8px',
              borderRadius: '6px',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="usuario">Usuario:</label>
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              type="password"
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-footer">
          <Link href="/" legacyBehavior>
            <a className="btn-back-home">Volver al Inicio</a>
          </Link>
        </div>
      </div>
    </section>
  );
}