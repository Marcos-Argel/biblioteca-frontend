import { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, getRoles } from '../../api/services';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

const empty = {
  documento: '', nombre: '', apellidoP: '', apellidoM: '',
  correo: '', tel: '', fechaN: '', username: '', contrasenia: '', idRol: ''
};

export default function Usuarios() {
  const { hasRole } = useAuth();
  const [usuarios, setUsuarios]   = useState([]);
  const [roles, setRoles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [modal, setModal]         = useState(false);
  const [editando, setEditando]   = useState(null);
  const [form, setForm]           = useState(empty);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');

  const cargar = async () => {
    try {
      const [u, r] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(u.data);
      setRoles(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (usuario = null) => {
    setEditando(usuario);
    setError('');
    setForm(usuario ? {
      documento: usuario.documento,
      nombre: usuario.nombre,
      apellidoP: usuario.apellidoP,
      apellidoM: usuario.apellidoM || '',
      correo: usuario.correo,
      tel: usuario.tel || '',
      fechaN: usuario.fechaN || '',
      username: usuario.username,
      contrasenia: '',
      idRol: usuario.rol?.idRol || ''
    } : empty);
    setModal(true);
  };

  const cerrarModal = () => { setModal(false); setEditando(null); setForm(empty); setError(''); };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      // Construye el payload con la estructura que espera el backend
      const payload = {
        documento: parseInt(form.documento),
        nombre: form.nombre,
        apellidoP: form.apellidoP,
        apellidoM: form.apellidoM,
        correo: form.correo,
        tel: form.tel,
        fechaN: form.fechaN,
        username: form.username,
        rol: { idRol: parseInt(form.idRol) },
      };
      if (form.contrasenia) payload.contrasenia = form.contrasenia;

      if (editando) await actualizarUsuario(editando.idUsuario, payload);
      else await crearUsuario(payload);
      await cargar();
      cerrarModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el usuario');
    }
    setGuardando(false);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try { await eliminarUsuario(id); await cargar(); } catch { alert('No se pudo desactivar'); }
  };

  const filtrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellidoP?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.documento?.toString().includes(q)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>👥 Usuarios</h2>
          <p className="page-subtitle">{usuarios.length} usuarios registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo usuario</button>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Buscar por nombre, documento, email o usuario..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {loading ? <div className="loading">Cargando usuarios...</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Correo</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.idUsuario}>
                  <td><strong>{u.nombre} {u.apellidoP}</strong></td>
                  <td className="text-muted">{u.documento}</td>
                  <td className="text-muted">{u.correo}</td>
                  <td>{u.username}</td>
                  <td>
                    <span className={`badge badge-role badge-role--${u.rol?.nombre?.toLowerCase()}`}>
                      {u.rol?.nombre}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => abrirModal(u)}>✏️</button>
                    {hasRole('admin') && (
                      <button className="btn-icon btn-icon--danger" onClick={() => eliminar(u.idUsuario)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editando ? 'Editar usuario' : 'Nuevo usuario'} onClose={cerrarModal}>
          <form onSubmit={guardar} className="form-grid">
            {error && <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>{error}</div>}
            <div className="field">
              <label>Documento *</label>
              <input type="number" value={form.documento}
                onChange={e => setForm({ ...form, documento: e.target.value })} required />
            </div>
            <div className="field">
              <label>Nombre *</label>
              <input value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="field">
              <label>Apellido paterno *</label>
              <input value={form.apellidoP}
                onChange={e => setForm({ ...form, apellidoP: e.target.value })} required />
            </div>
            <div className="field">
              <label>Apellido materno</label>
              <input value={form.apellidoM}
                onChange={e => setForm({ ...form, apellidoM: e.target.value })} />
            </div>
            <div className="field">
              <label>Correo *</label>
              <input type="email" value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })} required />
            </div>
            <div className="field">
              <label>Teléfono *</label>
              <input value={form.tel}
                onChange={e => setForm({ ...form, tel: e.target.value })} required />
            </div>
            <div className="field">
              <label>Fecha de nacimiento *</label>
              <input type="date" value={form.fechaN}
                onChange={e => setForm({ ...form, fechaN: e.target.value })} required />
            </div>
            <div className="field">
              <label>Usuario (login) *</label>
              <input value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>{editando ? 'Nueva contraseña (vacío = sin cambios)' : 'Contraseña *'}</label>
              <input type="password" value={form.contrasenia}
                onChange={e => setForm({ ...form, contrasenia: e.target.value })}
                required={!editando} />
            </div>
            <div className="field">
              <label>Rol *</label>
              <select value={form.idRol}
                onChange={e => setForm({ ...form, idRol: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {roles.map(r => <option key={r.idRol} value={r.idRol}>{r.nombre}</option>)}
              </select>
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
