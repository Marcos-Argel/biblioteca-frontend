import { useState, useEffect } from 'react';
import { getPrestamos, devolverPrestamo } from '../../api/services';

export default function Devoluciones() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [procesando, setProcesando] = useState(null);
  const [mensaje, setMensaje]     = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getPrestamos('EN_PRESTAMO');
      setPrestamos(res.data || []);
    } catch { setPrestamos([]); }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const handleDevolver = async (id) => {
    if (!window.confirm('¿Confirmar la devolución de este préstamo?')) return;
    setProcesando(id);
    try {
      const res = await devolverPrestamo(id);
      const sancion = res.data?.sancion;
      if (sancion) {
        setMensaje({ tipo: 'warning', texto: `Devolución registrada. Se generó una sanción de $${sancion.monto} por retraso.` });
      } else {
        setMensaje({ tipo: 'success', texto: 'Devolución registrada correctamente.' });
      }
      cargar();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.response?.data?.error || 'Error al procesar la devolución.' });
    }
    setProcesando(null);
    setTimeout(() => setMensaje(null), 4000);
  };

  const filtrados = prestamos.filter(p => {
    const q = busqueda.toLowerCase();
    return (
      p.usuario?.nombre?.toLowerCase().includes(q) ||
      p.usuario?.documento?.toString().includes(q) ||
      p.ejemplar?.libro?.titulo?.toLowerCase().includes(q)
    );
  });

  const diasRetraso = (fechaPrevista) => {
    const hoy = new Date();
    const prev = new Date(fechaPrevista);
    const diff = Math.floor((hoy - prev) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Devoluciones</h2>
          <p className="page-subtitle">Préstamos activos pendientes de devolución</p>
        </div>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`} style={{ marginBottom: 16 }}>
          {mensaje.texto}
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por usuario, documento o libro..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <button className="btn btn-ghost" onClick={cargar}>
          <i className="ti ti-refresh" aria-hidden="true" /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando préstamos activos...</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Libro</th>
                <th>Fecha préstamo</th>
                <th>Fecha límite</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 32 }}>No hay préstamos activos</td></tr>
              ) : filtrados.map(p => {
                const retraso = diasRetraso(p.fechaDevolucionPrevista);
                return (
                  <tr key={p.idPrestamo}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.usuario?.nombre} {p.usuario?.apellidoP}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>Doc: {p.usuario?.documento}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.ejemplar?.libro?.titulo}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>Ejemplar #{p.ejemplar?.idEjemplar}</div>
                    </td>
                    <td>{p.fechaPrestamo}</td>
                    <td>{p.fechaDevolucionPrevista}</td>
                    <td>
                      {retraso > 0
                        ? <span className="badge badge-red"><i className="ti ti-clock" /> {retraso} día{retraso !== 1 ? 's' : ''} de retraso</span>
                        : <span className="badge badge-green"><i className="ti ti-check" /> A tiempo</span>
                      }
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDevolver(p.idPrestamo)}
                        disabled={procesando === p.idPrestamo}
                      >
                        <i className="ti ti-arrow-back-up" aria-hidden="true" />
                        {procesando === p.idPrestamo ? 'Procesando...' : 'Registrar devolución'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
