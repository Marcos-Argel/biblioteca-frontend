import api from './axios';

// AUTH
export const login = (data) => api.post('/api/auth/login', data);

// LIBROS
export const getLibros       = ()       => api.get('/api/libros');
export const getLibro        = (id)     => api.get(`/api/libros/${id}`);
export const crearLibro      = (data)   => api.post('/api/libros', data);
export const actualizarLibro = (id, d)  => api.put(`/api/libros/${id}`, d);
export const eliminarLibro   = (id)     => api.delete(`/api/libros/${id}`);
export const getEjemplares   = (id)     => api.get(`/api/libros/${id}/ejemplares`);
export const crearEjemplar   = (data)   => api.post('/api/libros/ejemplares', data);

// USUARIOS
export const getUsuarios       = ()      => api.get('/api/usuarios');
export const getUsuario        = (id)    => api.get(`/api/usuarios/${id}`);
export const crearUsuario      = (data)  => api.post('/api/usuarios', data);
export const actualizarUsuario = (id, d) => api.put(`/api/usuarios/${id}`, d);
export const eliminarUsuario   = (id)    => api.delete(`/api/usuarios/${id}`);

// PRÉSTAMOS
export const getPrestamos     = (estado) => api.get('/api/prestamos', { params: estado ? { estado } : {} });
export const getPrestamo      = (id)     => api.get(`/api/prestamos/${id}`);
export const crearPrestamo    = (data)   => api.post('/api/prestamos', data);
export const devolverPrestamo = (id)     => api.put(`/api/prestamos/${id}/devolver`);

// SANCIONES
export const getSanciones    = (estado) => api.get('/api/sanciones', { params: estado ? { estado } : {} });
export const getSancion      = (id)     => api.get(`/api/sanciones/${id}`);
export const resolverSancion = (id, d)  => api.put(`/api/sanciones/${id}/resolver`, d);

// CATÁLOGO
export const getCategorias  = () => api.get('/api/categorias');
export const getAutores     = () => api.get('/api/autores');
export const getEditoriales = () => api.get('/api/editoriales');
export const getLenguajes   = () => api.get('/api/lenguajes');
export const getRoles       = () => api.get('/api/roles');
export const crearCategoria  = (d) => api.post('/api/categorias', d);
export const crearAutor      = (d) => api.post('/api/autores', d);
export const crearEditorial  = (d) => api.post('/api/editoriales', d);

// CONFIGURACIÓN
export const getConfiguracion = ()      => api.get('/api/configuracion');
export const actualizarConfig = (id, d) => api.put(`/api/configuracion/${id}`, d);

// REPORTES
export const getEstadisticas = () => api.get('/api/reportes/estadisticas');
