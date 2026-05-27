import { useState, useEffect } from 'react';
import {
  getCategorias, getAutores, getEditoriales, getLenguajes,
  crearCategoria, crearAutor, crearEditorial
} from '../../api/services';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';

const tabs = ['Categorías', 'Autores', 'Editoriales', 'Lenguajes'];
const tabLabels = ['Categoría', 'Autor', 'Editorial', 'Lenguaje'];
const iconos = ['ti-category', 'ti-pencil', 'ti-building', 'ti-world'];

function FormCategoria({ form, setForm }) {
  return (
    <>
      <div className="field" style={{ gridColumn: '1/-1' }}>
        <label>Nombre *</label>
        <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Ciencia Ficción" required autoFocus />
      </div>
      <div className="field" style={{ gridColumn: '1/-1' }}>
        <label>Descripción *</label>
        <input value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Breve descripción de la categoría" required />
      </div>
    </>
  );
}

function FormAutor({ form, setForm }) {
  return (
    <>
      <div className="field">
        <label>Nombre *</label>
        <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Gabriel" required autoFocus />
      </div>
      <div className="field">
        <label>Apellido *</label>
        <input value={form.apellido || ''} onChange={e => setForm({ ...form, apellido: e.target.value })}
          placeholder="Ej: García Márquez" required />
      </div>
      <div className="field" style={{ gridColumn: '1/-1' }}>
        <label>Nacionalidad</label>
        <input value={form.nacionalidad || ''} onChange={e => setForm({ ...form, nacionalidad: e.target.value })}
          placeholder="Ej: Colombiano" />
      </div>
    </>
  );
}

function FormEditorial({ form, setForm }) {
  return (
    <>
      <div className="field">
        <label>Nombre *</label>
        <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Penguin Random House" required autoFocus />
      </div>
      <div className="field">
        <label>Ubicación</label>
        <input value={form.ubicacion || ''} onChange={e => setForm({ ...form, ubicacion: e.target.value })}
          placeholder="Ej: Buenos Aires, Argentina" />
      </div>
    </>
  );
}

function FormLenguaje({ form, setForm }) {
  return (
    <>
      <div className="field">
        <label>Nombre *</label>
        <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Español" required autoFocus />
      </div>
      <div className="field">
        <label>Código ISO *</label>
        <input value={form.codigoIso || ''} onChange={e => setForm({ ...form, codigoIso: e.target.value })}
          placeholder="Ej: es, en, fr, pt" required maxLength={10} />
      </div>
    </>
  );
}

export default function Catalogo() {
  const [tab, setTab]         = useState(0);
  const [data, setData]       = useState({ categorias: [], autores: [], editoriales: [], lenguajes: [] });
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError]     = useState('');

  const cargar = async () => {
    try {
      const [c, a, e, l] = await Promise.all([getCategorias(), getAutores(), getEditoriales(), getLenguajes()]);
      setData({ categorias: c.data, autores: a.data, editoriales: e.data, lenguajes: l.data });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const items = [data.categorias, data.autores, data.editoriales, data.lenguajes][tab];

  const abrirModal = () => { setForm({}); setError(''); setModal(true); };
  const cerrarModal = () => { setModal(false); setForm({}); setError(''); };

  const getNombreItem = (item) => {
    if (tab === 1) return `${item.nombre} ${item.apellido}`;
    return item.nombre;
  };

  const getSubtitulo = (item) => {
    if (tab === 0) return item.descripcion || '';
    if (tab === 1) return item.nacionalidad || '';
    if (tab === 2) return item.ubicacion || '';
    if (tab === 3) return item.codigoIso ? `ISO: ${item.codigoIso}` : '';
    return '';
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (tab === 0) await crearCategoria(form);
      else if (tab === 1) await crearAutor(form);
      else if (tab === 2) await crearEditorial(form);
      else if (tab === 3) await api.post('/api/lenguajes', form);
      await cargar();
      cerrarModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar. Verificá los campos.');
    }
    setGuardando(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>🗂️ Catálogo</h2>
          <p className="page-subtitle">Gestión de categorías, autores, editoriales e idiomas</p>
        </div>
        <button className="btn btn-primary" onClick={abrirModal}>
          + Nueva {tabLabels[tab]}
        </button>
      </div>

      <div className="tabs">
        {tabs.map((t, i) => (
          <button key={t} className={`tab ${tab === i ? 'tab-active' : ''}`} onClick={() => setTab(i)}>
            <i className={`ti ${iconos[i]}`} style={{ marginRight: 6 }} aria-hidden="true" />
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Cargando...</div> : (
        <div className="catalog-grid">
          {items.map((item, idx) => (
            <div key={item.idCategoria || item.idAutor || item.idEditorial || item.idLenguaje || idx} className="catalog-card">
              <i className={`ti ${iconos[tab]} catalog-icon`} aria-hidden="true" />
              <div>
                <div className="catalog-name">{getNombreItem(item)}</div>
                {getSubtitulo(item) && (
                  <div className="text-muted" style={{ fontSize: 12 }}>{getSubtitulo(item)}</div>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-muted" style={{ padding: '20px 0' }}>
              No hay {tabs[tab].toLowerCase()} registradas aún
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal title={`Nueva ${tabLabels[tab]}`} onClose={cerrarModal}>
          <form onSubmit={guardar} className="form-grid">
            {error && <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>{error}</div>}
            {tab === 0 && <FormCategoria form={form} setForm={setForm} />}
            {tab === 1 && <FormAutor     form={form} setForm={setForm} />}
            {tab === 2 && <FormEditorial form={form} setForm={setForm} />}
            {tab === 3 && <FormLenguaje  form={form} setForm={setForm} />}
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
