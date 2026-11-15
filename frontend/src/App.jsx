import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import RutaPrivada from './components/RutaPrivada.jsx';
import RutaPorRol from './components/RutaPorRol.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Menu from './pages/Menu.jsx';
import Perfil from './pages/Perfil.jsx';
import Registro from './pages/Registro.jsx';

export default function App() {
  const { autenticado, user } = useAuth();

  return (
    <BrowserRouter>
      <nav aria-label="Navegación principal">
        <Link to="/">Menú</Link>{' · '}
        {autenticado ? <Link to="/perfil">Mi perfil</Link> : <Link to="/login">Iniciar sesión</Link>}
        {!autenticado && <>{' · '}<Link to="/registro">Registrarme</Link></>}
        {autenticado && user.role === 'admin' && <>{' · '}<Link to="/admin">Administración</Link></>}
      </nav>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route element={<RutaPrivada />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route element={<RutaPorRol rolesPermitidos={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="/acceso-denegado" element={
            <main className="menu">
              <h1>Acceso denegado</h1>
              <Link to="/">Volver al menú</Link>
            </main>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
