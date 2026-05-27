import { useState, useEffect } from 'react';
import {
  getLibros, crearLibro, actualizarLibro, eliminarLibro,
  getCategorias, getAutores, getEditoriales, getLenguajes
} from '../../api/services';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

const empty = {
  titulo: '', isbn: '', fechaP: '', descripcion: '', pagina: '',
  categoriaId: '', editorialId: '', lenguajeId: '', autorIds: []
};

export default function Libros() {
  const { hasRole } = useAuth();
  const [libros, setLibros]         = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [autores, setAutores]       = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [lenguajes, setLenguajes]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [modal, setModal]           = useState(false);
  const [editando, setEditando]     = useState(null);
  const [form, setForm]             = useState(empty);
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState('');
  const [stock, setStock]           = useState({});

  const cargar = async () => {
    try {
      const [l, c, a, e, ln] = await Promise.all([
        getLibros(), getCategorias(), getAutores(), getEditoriales(), getLenguajes()
      ]);
      setLibros(l.data);
      setCategorias(c.data);
      setAutores(a.data);
      setEditoriales(e.data);
      setLenguajes(ln.data);
      const stockData = {};
      await Promise.all((l.data || []).map(async (libro) => {
        try {
          const res = await api.get(`/api/libros/${libro.idLibro}/ejemplares`);
          const ejs = res.data || [];
          stockData[libro.idLibro] = {
            total: ejs.length,
            disponibles: ejs.filter(ej => ej.disponible).length,
          };
        } catch {
          stockData[libro.idLibro] = { total: 0, disponibles: 0 };
        }
      }));
      setStock(stockData);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (libro = null) => {
    setEditando(libro);
    setError('');
    setForm(libro ? {
      titulo:      libro.titulo,
      isbn:        libro.isbn,
      fechaP:      libro.fechaP || '',
      descripcion: libro.descripcion || '',
      pagina:      libro.pagina || '',
      categoriaId: libro.categoria?.idCategoria || '',
      editorialId: libro.editorial?.idEditorial || '',
      lenguajeId:  libro.lenguaje?.idLenguaje || '',
      autorIds:    libro.autores?.map(a => a.idAutor) || [],
    } : empty);
    setModal(true);
  };

  const cerrarModal = () => { setModal(false); setEditando(null); setForm(empty); setError(''); };

  const toggleAutor = (id) => {
    const ids = form.autorIds.includes(id)
      ? form.autorIds.filter(x => x !== id)
      : [...form.autorIds, id];
    setForm({ ...form, autorIds: ids });
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (form.autorIds.length === 0) { setError('Seleccioná al menos un autor'); return; }
    setGuardando(true);
    setError('');
    try {
      const payload = {
        titulo:      form.titulo,
        isbn:        form.isbn,
        fechaP:      form.fechaP,
        descripcion: form.descripcion,
        pagina:      parseInt(form.pagina),
        categoria:   { idCategoria: parseInt(form.categoriaId) },
        editorial:   { idEditorial: parseInt(form.editorialId) },
        lenguaje:    { idLenguaje:  parseInt(form.lenguajeId)  },
        autores:     form.autorIds.map(id => ({ idAutor: id })),
      };
      if (editando) await actualizarLibro(editando.idLibro, payload);
      else          await crearLibro(payload);
      await cargar();
      cerrarModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el libro');
    }
    setGuardando(false);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este libro?')) return;
    try { await eliminarLibro(id); await cargar(); } catch { alert('No se pudo eliminar'); }
  };

  const filtrados = libros.filter(l =>
    l.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.isbn?.includes(busqueda) ||
    l.autores?.some(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const canEdit = hasRole('admin', 'jefe', 'empleado');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>📖 Libros</h2>
          <p className="page-subtitle">{libros.length} libros registrados</p>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo libro</button>}
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Buscar por título, ISBN o autor..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {loading ? <div className="loading">Cargando libros...</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>ISBN</th>
                <th>Autores</th>
                <th>Categoría</th>
                <th>Lenguaje</th>
                <th>Páginas</th>
                <th>Disponibles</th>
                <th>Total</th>
                {canEdit && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(libro => {
                const s = stock[libro.idLibro] || { total: 0, disponibles: 0 };
                return (
                <tr key={libro.idLibro}>
                  <td><strong>{libro.titulo}</strong></td>
                  <td className="text-muted">{libro.isbn}</td>
                  <td>{libro.autores?.map(a => `${a.nombre} ${a.apellido}`).join(', ')}</td>
                  <td><span className="badge">{libro.categoria?.nombre}</span></td>
                  <td className="text-muted">{libro.lenguaje?.nombre}</td>
                  <td>{libro.pagina}</td>
                  <td>
                    <span className={`badge ${s.disponibles > 0 ? 'badge-green' : 'badge-red'}`}>
                      {s.disponibles > 0 ? `${s.disponibles} disp.` : 'Sin stock'}
                    </span>
                  </td>
                  <td className="text-muted">{s.total}</td>
                  {canEdit && (
                    <td className="actions">
                      <button className="btn-icon" onClick={() => abrirModal(libro)}>✏️</button>
                      {hasRole('admin', 'jefe') && (
                        <button className="btn-icon btn-icon--danger" onClick={() => eliminar(libro.idLibro)}>🗑️</button>
                      )}
                    </td>
                  )}
                </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan="9" className="text-center text-muted">No se encontraron libros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editando ? 'Editar libro' : 'Nuevo libro'} onClose={cerrarModal}>
          <form onSubmit={guardar} className="form-grid">
            {error && <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>{error}</div>}

            <div className="field">
              <label>Título *</label>
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="field">
              <label>ISBN *</label>
              <input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} required />
            </div>
            <div className="field">
              <label>Fecha de publicación *</label>
              <input type="date" value={form.fechaP} onChange={e => setForm({ ...form, fechaP: e.target.value })} required />
            </div>
            <div className="field">
              <label>Páginas *</label>
              <input type="number" min="1" value={form.pagina} onChange={e => setForm({ ...form, pagina: e.target.value })} required />
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Descripción *</label>
              <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
            <div className="field">
              <label>Categoría *</label>
              <select value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Editorial *</label>
              <select value={form.editorialId} onChange={e => setForm({ ...form, editorialId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {editoriales.map(e => <option key={e.idEditorial} value={e.idEditorial}>{e.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Lenguaje *</label>
              <select value={form.lenguajeId} onChange={e => setForm({ ...form, lenguajeId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {lenguajes.map(l => <option key={l.idLenguaje} value={l.idLenguaje}>{l.nombre}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Autores * (seleccioná uno o más)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {autores.map(a => (
                  <label key={a.idAutor} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                    background: form.autorIds.includes(a.idAutor) ? 'rgba(79,142,247,0.2)' : 'var(--bg3)',
                    border: `1px solid ${form.autorIds.includes(a.idAutor) ? 'var(--primary)' : 'var(--border)'}`,
                    fontSize: 13,
                  }}>
                    <input type="checkbox" style={{ display: 'none' }}
                      checked={form.autorIds.includes(a.idAutor)}
                      onChange={() => toggleAutor(a.idAutor)} />
                    {a.nombre} {a.apellido}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={cerrarModal}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
