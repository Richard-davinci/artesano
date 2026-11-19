import { useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Enlaces compartidos por el header y el footer.
const enlaces = [
  ['/', 'Inicio'],
  ['/carta', 'Nuestra carta'],
  ['/nosotros', 'Nosotros'],
  ['/contacto', 'Contacto']
];

function Navegacion() {
  return enlaces.map(([ruta, texto]) => <NavLink key={ruta} to={ruta} end={ruta === '/'}>{texto}</NavLink>);
}

// Estructura compartida de las pantallas.
export default function Layout() {
  const { autenticado, user } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonMenu = useRef(null);

  function cerrarConEscape(event) {
    if (event.key === 'Escape' && menuAbierto) {
      setMenuAbierto(false);
      botonMenu.current.focus();
    }
  }

  return (
    <>
      <header className="header">
        <div className="container header-bar" onKeyDown={cerrarConEscape}>
          <Link className="logo logo-header" to="/" aria-label="Arte-Sano Bodegón, inicio"
            onClick={() => setMenuAbierto(false)}>
            <img src="/diseno/logo-arte-sano-bodegon-final.png" alt="Arte-Sano Bodegón" width="2170" height="725" />
          </Link>
          <button className="menu-toggle" type="button" ref={botonMenu}
            aria-expanded={menuAbierto} aria-controls="nav-header"
            onClick={() => setMenuAbierto(!menuAbierto)}>
            <span aria-hidden="true">{menuAbierto ? '×' : '☰'}</span> Menú
          </button>
          <div id="nav-header" className={menuAbierto ? 'nav-header is-open' : 'nav-header'}
            onClick={(event) => { if (event.target.closest('a')) setMenuAbierto(false); }}>
            <nav className="nav" aria-label="Navegación principal"><Navegacion /></nav>
            <nav className="cuenta-nav" aria-label="Cuenta">
              {autenticado ? (
                <NavLink to="/perfil">Mi perfil</NavLink>
              ) : (
                <>
                  <NavLink to="/login">Iniciar sesión</NavLink>
                  <NavLink className="button-accent" to="/registro">Registrarme</NavLink>
                </>
              )}
              {autenticado && user.role === 'admin' && <NavLink to="/admin">Administración</NavLink>}
            </nav>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="footer">
        <div className="container">
          <div className="footer-principal">
            <div>
              <Link className="logo logo-footer" to="/" aria-label="Arte-Sano Bodegón, inicio">
                <img src="/diseno/logo-arte-sano-bodegon-final.png" alt="Arte-Sano Bodegón" width="2170" height="725" />
              </Link>
            </div>
            <nav className="nav" aria-label="Navegación del pie"><Navegacion /></nav>
          </div>
          <div className="footer-legal">
            <span>Arte-Sano · Bodegón y restaurante</span>
            <dl className="footer-creditos">
              <div><dt>Alumno</dt><dd>Ricardo Rodolfo García</dd></div>
              <div><dt>Profesor</dt><dd>Jonathan Emanuel Cruz</dd></div>
              <div><dt>Materia</dt><dd>Aplicaciones Híbridas</dd></div>
              <div><dt>Año lectivo</dt><dd>2026</dd></div>
            </dl>
          </div>
        </div>
      </footer>
    </>
  );
}
