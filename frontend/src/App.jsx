import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import RutaPrivada from './components/RutaPrivada.jsx';
import RutaPorRol from './components/RutaPorRol.jsx';
import Layout from './components/Layout.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import NuestraCarta from './pages/NuestraCarta.jsx';
import Perfil from './pages/Perfil.jsx';
import Registro from './pages/Registro.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<NuestraCarta />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
