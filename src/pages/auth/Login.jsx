import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/services';

export default function Login() {
  const [form, setForm]       = useState({ username: '', contrasenia: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      loginUser(res.data, 'sin-token');
      navigate('/dashboard');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <i className="ti ti-books login-left-icon" aria-hidden="true" />
        <div className="login-left-title">Sistema de Gestión Bibliotecaria</div>
        <p className="login-left-sub">Administrá préstamos, usuarios, inventario y sanciones desde un solo lugar.</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-brand">
            <h1>Bienvenido</h1>
            <p>Ingresá con tus credenciales para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="field">
              <label>Usuario</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Tu nombre de usuario"
                required
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={verPass ? 'text' : 'password'}
                  value={form.contrasenia}
                  onChange={e => setForm({ ...form, contrasenia: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 44, width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setVerPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text2)', fontSize: 18, padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  <i className={`ti ${verPass ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true" />
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
