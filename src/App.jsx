import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Libros from './pages/libros/Libros';
import Usuarios from './pages/usuarios/Usuarios';
import Prestamos from './pages/prestamos/Prestamos';
import Devoluciones from './pages/devoluciones/Devoluciones';
import Sanciones from './pages/sanciones/Sanciones';
import Catalogo from './pages/catalogo/Catalogo';
import Reportes from './pages/reportes/Reportes';
import Configuracion from './pages/configuracion/Configuracion';

function ProtectedRoute({ children, roles }) {
  const { usuario, loading, hasRole } = useAuth();
  if (loading) return <div className="loading-full">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" />;
  if (roles && !hasRole(...roles)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="libros"        element={<Libros />} />
        <Route path="catalogo"      element={<ProtectedRoute roles={['admin','jefe','empleado']}><Catalogo /></ProtectedRoute>} />
        <Route path="prestamos"     element={<ProtectedRoute roles={['admin','jefe','empleado']}><Prestamos /></ProtectedRoute>} />
        <Route path="devoluciones"  element={<ProtectedRoute roles={['admin','jefe','empleado']}><Devoluciones /></ProtectedRoute>} />
        <Route path="sanciones"     element={<ProtectedRoute roles={['admin','jefe','empleado']}><Sanciones /></ProtectedRoute>} />
        <Route path="usuarios"      element={<ProtectedRoute roles={['admin','jefe']}><Usuarios /></ProtectedRoute>} />
        <Route path="reportes"      element={<ProtectedRoute roles={['admin','jefe']}><Reportes /></ProtectedRoute>} />
        <Route path="configuracion" element={<ProtectedRoute roles={['admin']}><Configuracion /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
