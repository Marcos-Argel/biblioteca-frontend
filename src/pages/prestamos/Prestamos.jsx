import { useState, useEffect } from 'react';
import { getPrestamos, crearPrestamo, getLibros, getUsuarios } from '../../api/services';
import Modal from '../../components/ui/Modal';

const empty = { idUsuario: '', idEjemplar: '', fechaDevolucionPrevista: '' };

export default function Prestamos() {
  const [prestamos, setPrestamos]   = useState([]);
  const [libros, setLibros]         = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(empty);
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState('');

  // Ejemplares del libro seleccionado
  const [ejemplares, setEjemplares] = useState([]);

  const cargar = async () => {
    try {
      const [p, l, u] = await Promise.all([getPrestamos(), getLibros(), getUsuarios()]);
      setPrestamos(p.data);
      setLibros(l.data);
      setUsuarios(u.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  // Cuando cambia el libro, carga sus ejemplares disponibles
  const handleLibroChange = async (libroId) => {
    setForm(f => ({ ...f, idLibro: libroId, idEjemplar: '' }));
    if (!libroId) { setEjemplares([]); return; }
    try {
      const { getEjemplares } = await import('../../api/services');
      const res = await getEjemplares(libroId);
      // Filtra solo disponibles
      setEjemplares((res.data || []).filter(e => e.estado === 'DISPONIBLE' || e.disponible));
    } catch {
      // Si no hay endpoint de ejemplares, usa el libro directo
      setEjemplares([]);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const payload = {
        idUsuario: parseInt(form.idUsuario),
        idEjemplar: parseInt(form.idEjemplar),
        fechaDevolucionPrevista: form.fechaDevolucionPrevista,
      };
      await crearPrestamo(payload);
      await cargar();
      setModal(false);
      setForm(empty);
      setEjemplares([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el préstamo');
    }
    setGuardando(false);
  };

  const filtrados = prestamos.filter(p => {
    const q = busqueda.toLowerCase();
    const matchBusqueda =
      p.usuario?.nombre?.toLowerCase().includes(q) ||
      p.usuario?.documento?.toString().includes(q) ||
      p.ejemplar?.libro?.titulo?.toLowerCase().includes(q);
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const estadoColor = (estado) => {
    if (estado === 'EN_PRESTAMO') return 'badge-orange';
    if (estado === 'DEVUELTO')    return 'badge-green';
    if (estado === 'ATRASADO')    return 'badge-red';
    return '';
  };

  const estadoLabel = (estado) => {
    if (estado === 'EN_PRESTAMO') return 'En préstamo';
    if (estado === 'DEVUELTO')    return 'Devuelto';
    if (estado === 'ATRASADO')    return 'Atrasado';
    return estado;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>🔄 Préstamos</h2>
          <p className="page-subtitle">{prestamos.length} préstamos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModal(true); setError(''); }}>+ Nuevo préstamo</button>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Buscar por usuario, documento o libro..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="EN_PRESTAMO">En préstamo</option>
          <option value="ATRASADO">Atrasados</option>
          <option value="DEVUELTO">Devueltos</option>
        </select>
      </div>

      {loading ? <div className="loading">Cargando préstamos...</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Libro / Ejemplar</th>
                <th>Fecha préstamo</th>
                <th>Fecha límite</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.idPrestamo}>
                  <td>
                    <strong>{p.usuario?.nombre} {p.usuario?.apellidoP}</strong>
                    <div className="text-muted" style={{ fontSize: 12 }}>Doc: {p.usuario?.documento}</div>
                  </td>
                  <td>
                    <div>{p.ejemplar?.libro?.titulo}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>Ej. #{p.ejemplar?.idEjemplar}</div>
                  </td>
                  <td className="text-muted">{p.fechaPrestamo}</td>
                  <td className="text-muted">{p.fechaDevolucionPrevista}</td>
                  <td><span className={`badge ${estadoColor(p.estado)}`}>{estadoLabel(p.estado)}</span></td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted">No se encontraron préstamos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nuevo préstamo" onClose={() => { setModal(false); setForm(empty); setEjemplares([]); }}>
          <form onSubmit={guardar} className="form-grid">
            {error && <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>{error}</div>}
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Usuario *</label>
              <select value={form.idUsuario} onChange={e => setForm({ ...form, idUsuario: e.target.value })} required>
                <option value="">Seleccionar usuario...</option>
                {usuarios.map(u => (
                  <option key={u.idUsuario} value={u.idUsuario}>
                    {u.nombre} {u.apellidoP} — Doc: {u.documento}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Libro *</label>
              <select value={form.idLibro || ''} onChange={e => handleLibroChange(e.target.value)} required>
                <option value="">Seleccionar libro...</option>
                {libros.map(l => (
                  <option key={l.idLibro} value={l.idLibro}>{l.titulo}</option>
                ))}
              </select>
            </div>
            {ejemplares.length > 0 && (
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Ejemplar *</label>
                <select value={form.idEjemplar} onChange={e => setForm({ ...form, idEjemplar: e.target.value })} required>
                  <option value="">Seleccionar ejemplar...</option>
                  {ejemplares.map(ej => (
                    <option key={ej.idEjemplar} value={ej.idEjemplar}>
                      Ejemplar #{ej.idEjemplar} — {ej.estado}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {form.idLibro && ejemplares.length === 0 && (
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>ID Ejemplar *</label>
                <input type="number" value={form.idEjemplar}
                  onChange={e => setForm({ ...form, idEjemplar: e.target.value })}
                  placeholder="Ingresá el número de ejemplar" required />
              </div>
            )}
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Fecha de devolución prevista *</label>
              <input type="date" value={form.fechaDevolucionPrevista}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setForm({ ...form, fechaDevolucionPrevista: e.target.value })} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost"
                onClick={() => { setModal(false); setForm(empty); setEjemplares([]); }}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Registrando...' : 'Registrar préstamo'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
