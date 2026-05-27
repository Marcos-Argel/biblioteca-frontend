import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard',      icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/libros',         icon: 'ti-books',             label: 'Libros' },
  { to: '/catalogo',       icon: 'ti-category',          label: 'Catálogo',     roles: ['admin','jefe','empleado'] },
  { to: '/usuarios',       icon: 'ti-users',             label: 'Usuarios',     roles: ['admin','jefe'] },
  { to: '/prestamos',      icon: 'ti-arrows-exchange',   label: 'Préstamos',    roles: ['admin','jefe','empleado'] },
  { to: '/devoluciones',   icon: 'ti-arrow-back-up',     label: 'Devoluciones', roles: ['admin','jefe','empleado'] },
  { to: '/sanciones',      icon: 'ti-alert-triangle',    label: 'Sanciones',    roles: ['admin','jefe','empleado'] },
  { to: '/reportes',       icon: 'ti-file-text',         label: 'Reportes',     roles: ['admin','jefe'] },
  { to: '/configuracion',  icon: 'ti-settings',          label: 'Configuración',roles: ['admin'] },
];

export default function Layout() {
  const { usuario, logoutUser, hasRole } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const visibleItems = navItems.filter(item =>
    !item.roles || hasRole(...item.roles)
  );

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">📚</span>
          {sidebarOpen && <span className="sidebar-title">BibliotecaSys</span>}
        </div>
        <nav className="sidebar-nav">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`ti ${item.icon} nav-icon`} aria-hidden="true" />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">{usuario?.nombre?.[0]?.toUpperCase()}</div>
              <div>
                <div className="user-name">{usuario?.nombre}</div>
                <div className="user-role">{usuario?.rol?.nombre}</div>
              </div>
            </div>
          )}
          <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
            <i className="ti ti-logout" aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="ti ti-menu-2" aria-hidden="true" />
          </button>
          <div className="topbar-right">
            <span className="topbar-user">Hola, {usuario?.nombre?.split(' ')[0]}</span>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <i className={`ti ${dark ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" />
              {dark ? 'Claro' : 'Oscuro'}
            </button>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
