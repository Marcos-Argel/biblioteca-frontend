import { useState, useEffect } from 'react';
import { getSanciones, resolverSancion } from '../../api/services';
import Modal from '../../components/ui/Modal';

export default function Sanciones() {
  const [sanciones, setSanciones]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalResolver, setModalResolver] = useState(null);
  const [formResolver, setFormResolver]   = useState({ metodoPago: '', notas: '' });
  const [guardando, setGuardando]   = useState(false);

  const cargar = async () => {
    try {
      const res = await getSanciones();
      setSanciones(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const resolver = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await resolverSancion(modalResolver.idSancion, formResolver);
      await cargar();
      setModalResolver(null);
      setFormResolver({ metodoPago: '', notas: '' });
    } catch { alert('Error al resolver la sanción'); }
    setGuardando(false);
  };

  const filtradas = sanciones.filter(s => {
    const nombre = `${s.prestamo?.usuario?.nombre ?? ''} ${s.prestamo?.usuario?.apellidoP ?? ''}`;
    const matchBusqueda =
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.prestamo?.usuario?.documento?.toString().includes(busqueda);
    const matchEstado = filtroEstado === 'todos' || s.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const estadoColor = (estado) => {
    if (estado === 'ACTIVA')   return 'badge-red';
    if (estado === 'RESUELTA') return 'badge-green';
    return '';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>⚠️ Sanciones</h2>
          <p className="page-subtitle">{sanciones.length} sanciones registradas</p>
        </div>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Buscar por usuario, documento o descripción..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todas</option>
          <option value="ACTIVA">Activas</option>
          <option value="RESUELTA">Resueltas</option>
        </select>
      </div>

      {loading ? <div className="loading">Cargando sanciones...</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Libro</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(s => (
                <tr key={s.idSancion}>
                  <td>
                    <strong>{s.prestamo?.usuario?.nombre} {s.prestamo?.usuario?.apellidoP}</strong>
                    <div className="text-muted" style={{ fontSize: 12 }}>Doc: {s.prestamo?.usuario?.documento}</div>
                  </td>
                  <td className="text-muted">{s.prestamo?.ejemplar?.libro?.titulo}</td>
                  <td>{s.descripcion}</td>
                  <td><strong>${s.monto}</strong></td>
                  <td className="text-muted">{s.fechaSancion}</td>
                  <td><span className={`badge ${estadoColor(s.estado)}`}>{s.estado}</span></td>
                  <td className="actions">
                    {s.estado === 'ACTIVA' && (
                      <button className="btn btn-sm btn-success"
                        onClick={() => { setModalResolver(s); setFormResolver({ metodoPago: '', notas: '' }); }}>
                        Resolver
                      </button>
                    )}
                    {s.estado === 'RESUELTA' && (
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {s.fechaResuelta}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">No se encontraron sanciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalResolver && (
        <Modal title="Resolver sanción" onClose={() => setModalResolver(null)}>
          <div style={{ marginBottom: 16, padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
            <div><strong>Usuario:</strong> {modalResolver.prestamo?.usuario?.nombre} {modalResolver.prestamo?.usuario?.apellidoP}</div>
            <div><strong>Monto:</strong> ${modalResolver.monto}</div>
            <div><strong>Descripción:</strong> {modalResolver.descripcion}</div>
          </div>
          <form onSubmit={resolver} className="form-grid">
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Método de pago</label>
              <select value={formResolver.metodoPago}
                onChange={e => setFormResolver({ ...formResolver, metodoPago: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="EXONERADO">Exonerado</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Notas</label>
              <input value={formResolver.notas}
                onChange={e => setFormResolver({ ...formResolver, notas: e.target.value })}
                placeholder="Observaciones opcionales" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalResolver(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Confirmar resolución'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
