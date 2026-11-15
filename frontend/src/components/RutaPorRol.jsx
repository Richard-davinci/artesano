import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Permite el acceso a los roles indicados.
export default function RutaPorRol({ rolesPermitidos }) {
  const { user } = useAuth();

  if (!rolesPermitidos.includes(user.role)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return <Outlet />;
}
