import { createContext, useContext, useState, useEffect } from 'react';

// Roles del sistema:
// admin     → acceso total
// jefe      → gestión + reportes, sin configuración
// empleado  → préstamos, devoluciones, sanciones, libros
// lector    → solo consulta (libros, catálogo)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    const token  = localStorage.getItem('token');
    if (stored && token) {
      try { setUsuario(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUsuario(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Verifica si el usuario tiene alguno de los roles indicados
  const hasRole = (...roles) => {
    if (!usuario) return false;
    return roles.some(r => usuario.rol?.nombre?.toLowerCase() === r.toLowerCase());
  };

  // Permisos por funcionalidad
  const puedeGestionar  = () => hasRole('admin', 'jefe', 'empleado');
  const puedeAdministrar = () => hasRole('admin', 'jefe');
  const esLector        = () => hasRole('lector');

  return (
    <AuthContext.Provider value={{
      usuario,
      loading,
      loginUser,
      logoutUser,
      hasRole,
      puedeGestionar,
      puedeAdministrar,
      esLector,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
