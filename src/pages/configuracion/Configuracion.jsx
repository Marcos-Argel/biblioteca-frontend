import { useState, useEffect } from 'react';
import { getConfiguracion, actualizarConfig, getLibros } from '../../api/services';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';

const ICONOS = { PRESTAMOS: '🔄', SANCIONES: '⚠️', GENERAL: '⚙️' };
const LABELS = {
  'dias.prestamo.defecto':      'Dias de prestamo por defecto',
  'multa.por.dia':              'Multa por dia de atraso ($)',
  'max.prestamos.simultaneos':  'Maximo de prestamos simultaneos',
  'dias.suspension.automatica': 'Dias de suspension automatica',
  'atraso.grave.dias':          'Dias para considerar atraso grave',
};

export default function Configuracion() {
  const { usuario } = useAuth();
  const [tab, setTab]             = useState(0);
  const [configs, setConfigs]     = useState([]);
  const [valores, setValores]     = useState({});
  const [libros, setLibros]       = useState([]);
  const [ejemplares, setEjemplares] = useState([]);
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [loadingEj, setLoadingEj]   = useState(false);
  const [guardando, setGuardando]   = useState(null);
  const [exito, setExito]           = useState(null);
  const [error, setError]           = useState(null);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [formEj, setFormEj]         = useState({ idLibro: '', ubicacion: '', cantidad: 1 });
  const [guardandoEj, setGuardandoEj] = useState(false);
  const [errorEj, setErrorEj]       = useState('');
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  const cargarConfigs = async () => {
    try {
      const res = await getConfiguracion();
      const data = res.data || [];
      setConfigs(data);
      const vals = {};
      data.forEach(c => { vals[c.idConfig] = c.valor; });
      setValores(vals);
    } catch {}
    setLoadingCfg(false);
  };

  const cargarLibros = async () => {
    try {
      const res = await getLibros();
      setLibros(res.data || []);
    } catch {}
  };

  const cargarEjemplares = async (idLibro) => {
    setLoadingEj(true);
    try {
      const res = await api.get(`/api/libros/${idLibro}/ejemplares`);
      setEjemplares(res.data || []);
    } catch {}
    setLoadingEj(false);
  };

  useEffect(() => { cargarConfigs(); cargarLibros(); }, []);

  const handleLibroChange = async (idLibro) => {
    setLibroSeleccionado(idLibro);
    if (idLibro) await cargarEjemplares(idLibro);
    else setEjemplares([]);
  };

  const guardarConfig = async (config) => {
    setGuardando(config.idConfig);
    setExito(null); setError(null);
    try {
      await actualizarConfig(config.idConfig, {
        ...config,
        valor: String(valores[config.idConfig]),
        modificadoPor: usuario?.idUsuario,
      });
      setExito(config.idConfig);
      setTimeout(() => setExito(null), 2000);
      await cargarConfigs();
    } catch { setError('Error al guardar'); }
    setGuardando(null);
  };

  const agregarEjemplar = async (e) => {
    e.preventDefault();
    setGuardandoEj(true); setErrorEj('');
    try {
      const cantidad = parseInt(formEj.cantidad) || 1;
      const idLibro = parseInt(formEj.idLibro);
      for (let i = 0; i < cantidad; i++) {
        await api.post('/api/libros/ejemplares', {
          libro: { idLibro },
          ubicacion: formEj.ubicacion,
          disponible: true,
        });
      }
      await cargarLibros();
      if (libroSeleccionado) await cargarEjemplares(libroSeleccionado);
      setModalAgregar(false);
      setFormEj({ idLibro: '', ubicacion: '', cantidad: 1 });
    } catch (err) {
      setErrorEj(err.response?.data?.error || 'Error al agregar ejemplar');
    }
    setGuardandoEj(false);
  };

  const eliminarEjemplar = async (idEjemplar) => {
    if (!confirm('Eliminar este ejemplar?')) return;
    try {
      await api.delete(`/api/ejemplares/${idEjemplar}`);
      await cargarEjemplares(libroSeleccionado);
      await cargarLibros();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const grupos = configs.reduce((acc, c) => {
    const cat = c.categoria || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  const tabs = ['Parametros', 'Inventario / Stock'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>⚙️ Configuracion</h2>
          <p className="page-subtitle">Parametros del sistema y gestion de inventario</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {tabs.map((t, i) => (
          <button key={t} className={`tab ${tab === i ? 'tab-active' : ''}`} onClick={() => setTab(i)}>
            {i === 0 ? '⚙️' : '📦'} {t}
          </button>
        ))}
      </div>

      {/* ── TAB PARAMETROS ── */}
      {tab === 0 && (
        loadingCfg ? <div className="loading">Cargando...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(grupos).map(([cat, items]) => (
              <div key={cat} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)',
                }}>
                  <span style={{ fontSize: 18 }}>{ICONOS[cat] || '⚙️'}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {items.map(c => (
                    <div key={c.idConfig} style={{
                      display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16,
                      borderBottom: '1px solid rgba(46,58,78,0.3)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{LABELS[c.clave] || c.clave}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{c.descripcion}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="number"
                          value={valores[c.idConfig] ?? ''}
                          step={c.tipoDato === 'DOUBLE' ? '0.01' : '1'}
                          min="0"
                          onChange={e => setValores({ ...valores, [c.idConfig]: e.target.value })}
                          style={{
                            width: 100, padding: '8px 12px',
                            background: 'var(--bg3)',
                            border: `1px solid ${exito === c.idConfig ? 'var(--success)' : 'var(--border)'}`,
                            borderRadius: 8, color: 'var(--text)', fontSize: 15,
                            fontWeight: 600, textAlign: 'center', outline: 'none',
                          }}
                        />
                        <span style={{ color: 'var(--text2)', fontSize: 13 }}>
                          {c.tipoDato === 'DOUBLE' ? '$' : 'dias'}
                        </span>
                        <button className="btn btn-primary btn-sm" onClick={() => guardarConfig(c)}
                          disabled={guardando === c.idConfig} style={{ minWidth: 90 }}>
                          {guardando === c.idConfig ? '...' : exito === c.idConfig ? '✓ Listo' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {error && <div className="alert alert-error">{error}</div>}
          </div>
        )
      )}

      {/* ── TAB INVENTARIO ── */}
      {tab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              style={{ flex: 1, minWidth: 200 }}
              value={libroSeleccionado || ''}
              onChange={e => handleLibroChange(e.target.value || null)}
            >
              <option value="">Seleccionar libro para ver ejemplares...</option>
              {libros.map(l => (
                <option key={l.idLibro} value={l.idLibro}>
                  {l.titulo} — {l.isbn}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => { setModalAgregar(true); setErrorEj(''); }}>
              + Agregar ejemplares
            </button>
          </div>

          {libroSeleccionado && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>
                  📦 Ejemplares — {libros.find(l => l.idLibro == libroSeleccionado)?.titulo}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                  {ejemplares.filter(e => e.disponible).length} disponibles / {ejemplares.length} total
                </span>
              </div>
              {loadingEj ? <div className="loading">Cargando...</div> : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ubicacion</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ejemplares.map(ej => (
                      <tr key={ej.idEjemplar}>
                        <td className="text-muted">#{ej.idEjemplar}</td>
                        <td>{ej.ubicacion}</td>
                        <td>
                          <span className={`badge ${ej.disponible ? 'badge-green' : 'badge-red'}`}>
                            {ej.disponible ? 'Disponible' : 'Prestado'}
                          </span>
                        </td>
                        <td className="actions">
                          {ej.disponible && (
                            <button className="btn-icon btn-icon--danger" onClick={() => eliminarEjemplar(ej.idEjemplar)}>🗑️</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {ejemplares.length === 0 && (
                      <tr><td colSpan="4" className="text-center text-muted">No hay ejemplares para este libro</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!libroSeleccionado && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
              Selecciona un libro para ver y gestionar sus ejemplares
            </div>
          )}
        </div>
      )}

      {/* ── MODAL AGREGAR EJEMPLAR ── */}
      {modalAgregar && (
        <Modal title="Agregar ejemplares" onClose={() => { setModalAgregar(false); setFormEj({ idLibro: '', ubicacion: '', cantidad: 1 }); }}>
          <form onSubmit={agregarEjemplar} className="form-grid">
            {errorEj && <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>{errorEj}</div>}
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Libro *</label>
              <select value={formEj.idLibro} onChange={e => setFormEj({ ...formEj, idLibro: e.target.value })} required>
                <option value="">Seleccionar libro...</option>
                {libros.map(l => <option key={l.idLibro} value={l.idLibro}>{l.titulo}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ubicacion *</label>
              <input value={formEj.ubicacion} onChange={e => setFormEj({ ...formEj, ubicacion: e.target.value })}
                placeholder="Ej: Estante A-12" required />
            </div>
            <div className="field">
              <label>Cantidad *</label>
              <input type="number" min="1" max="50" value={formEj.cantidad}
                onChange={e => setFormEj({ ...formEj, cantidad: e.target.value })} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost"
                onClick={() => { setModalAgregar(false); setFormEj({ idLibro: '', ubicacion: '', cantidad: 1 }); }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={guardandoEj}>
                {guardandoEj ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
