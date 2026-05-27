import { useState, useEffect } from 'react';
import { getLibros, getUsuarios, getPrestamos, getSanciones } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ libros: 0, usuarios: 0, prestamos: 0, sanciones: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [l, u, p, s] = await Promise.allSettled([
          getLibros(), getUsuarios(), getPrestamos(), getSanciones()
        ]);
        setStats({
          libros:    l.value?.data?.length || 0,
          usuarios:  u.value?.data?.length || 0,
          prestamos: (p.value?.data || []).filter(x => x.estado === 'EN_PRESTAMO').length,
          sanciones: (s.value?.data || []).filter(x => x.estado === 'ACTIVA').length,
        });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Libros registrados',    value: stats.libros,    icon: 'ti-books',          color: 'blue'   },
    { label: 'Usuarios activos',      value: stats.usuarios,  icon: 'ti-users',           color: 'green'  },
    { label: 'Préstamos activos',     value: stats.prestamos, icon: 'ti-arrows-exchange', color: 'orange' },
    { label: 'Sanciones pendientes',  value: stats.sanciones, icon: 'ti-alert-triangle',  color: 'red'    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Bienvenido, {usuario?.nombre?.split(' ')[0]} 👋</h2>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando estadísticas...</div>
      ) : (
        <div className="stats-grid">
          {cards.map(card => (
            <div key={card.label} className={`stat-card stat-card--${card.color}`}>
              <i className={`ti ${card.icon} stat-icon`} aria-hidden="true" />
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
