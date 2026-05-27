import { useState } from 'react';
import { getPrestamos, getLibros, getUsuarios } from '../../api/services';

// ── Descarga CSV ─────────────────────────────────────────────────────────────
function descargarCSV(titulo, cabeceras, filas) {
  const escapar = (val) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lineas = [
    cabeceras.map(escapar).join(','),
    ...filas.map(fila => fila.map(escapar).join(',')),
  ];
  // BOM para que Excel lo abra con tildes correctamente
  const bom = '\uFEFF';
  const blob = new Blob([bom + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Reportes() {
  const [generando, setGenerando] = useState(null);

  const reportes = [
    {
      id: 'prestamos',
      titulo: 'Reporte de Préstamos',
      descripcion: 'Lista completa de todos los préstamos registrados con estado y fechas.',
      icon: 'ti-arrows-exchange',
      color: '#2D5A27',
      generar: async () => {
        const res = await getPrestamos();
        const filas = (res.data || []).map(p => [
          p.usuario?.documento ?? '',
          `${p.usuario?.nombre ?? ''} ${p.usuario?.apellidoP ?? ''}`.trim(),
          p.ejemplar?.libro?.titulo ?? '',
          p.fechaPrestamo ?? '',
          p.fechaDevolucionPrevista ?? '',
          p.fechaDevolucionReal ?? 'Pendiente',
          p.estado ?? '',
        ]);
        return {
          cabeceras: ['Documento', 'Usuario', 'Libro', 'F. Préstamo', 'F. Prevista', 'F. Devolución', 'Estado'],
          filas,
        };
      },
    },
    {
      id: 'top-libros',
      titulo: 'Top 10 Libros Más Solicitados',
      descripcion: 'Ranking de los libros con mayor cantidad de préstamos registrados.',
      icon: 'ti-books',
      color: '#8B4513',
      generar: async () => {
        const res = await getPrestamos();
        const conteo = {};
        (res.data || []).forEach(p => {
          const id = p.ejemplar?.libro?.idLibro;
          const titulo = p.ejemplar?.libro?.titulo ?? 'Desconocido';
          if (id) conteo[id] = { titulo, count: (conteo[id]?.count || 0) + 1 };
        });
        const ordenado = Object.values(conteo).sort((a, b) => b.count - a.count).slice(0, 10);
        return {
          cabeceras: ['Posición', 'Título', 'Total Préstamos'],
          filas: ordenado.map((l, i) => [i + 1, l.titulo, l.count]),
        };
      },
    },
    {
      id: 'top-usuarios',
      titulo: 'Top 10 Usuarios Más Activos',
      descripcion: 'Ranking de usuarios con mayor cantidad de préstamos realizados.',
      icon: 'ti-users',
      color: '#3B6D11',
      generar: async () => {
        const res = await getPrestamos();
        const conteo = {};
        (res.data || []).forEach(p => {
          const id = p.usuario?.idUsuario;
          const nombre = `${p.usuario?.nombre ?? ''} ${p.usuario?.apellidoP ?? ''}`.trim();
          const doc = p.usuario?.documento ?? '';
          if (id) conteo[id] = { nombre, doc, count: (conteo[id]?.count || 0) + 1 };
        });
        const ordenado = Object.values(conteo).sort((a, b) => b.count - a.count).slice(0, 10);
        return {
          cabeceras: ['Posición', 'Nombre', 'Documento', 'Total Préstamos'],
          filas: ordenado.map((u, i) => [i + 1, u.nombre, u.doc, u.count]),
        };
      },
    },
    {
      id: 'usuarios',
      titulo: 'Reporte de Usuarios',
      descripcion: 'Listado completo de todos los usuarios registrados con su rol y datos de contacto.',
      icon: 'ti-id-badge',
      color: '#1a6b8a',
      generar: async () => {
        const res = await getUsuarios();
        const filas = (res.data || []).map(u => [
          u.documento ?? '',
          `${u.nombre ?? ''} ${u.apellidoP ?? ''} ${u.apellidoM ?? ''}`.trim(),
          u.correo ?? '',
          u.tel ?? '',
          u.rol?.nombre ?? '',
          u.activo ? 'Activo' : 'Inactivo',
          u.fechaCreacion?.slice(0, 10) ?? '',
        ]);
        return {
          cabeceras: ['Documento', 'Nombre completo', 'Correo', 'Teléfono', 'Rol', 'Estado', 'F. Registro'],
          filas,
        };
      },
    },
    {
      id: 'inventario',
      titulo: 'Inventario de Libros',
      descripcion: 'Catálogo completo de libros con categoría, editorial, lenguaje y páginas.',
      icon: 'ti-book-2',
      color: '#7B3F00',
      generar: async () => {
        const res = await getLibros();
        const filas = (res.data || []).map(l => [
          l.isbn ?? '',
          l.titulo ?? '',
          l.autores?.map(a => `${a.nombre} ${a.apellido}`).join(' / ') ?? '',
          l.categoria?.nombre ?? '',
          l.editorial?.nombre ?? '',
          l.lenguaje?.nombre ?? '',
          l.pagina ?? '',
          l.fechaP ?? '',
        ]);
        return {
          cabeceras: ['ISBN', 'Título', 'Autores', 'Categoría', 'Editorial', 'Idioma', 'Páginas', 'F. Publicación'],
          filas,
        };
      },
    },
    {
      id: 'historial-usuario',
      titulo: 'Historial por Usuario',
      descripcion: 'Préstamos agrupados por usuario mostrando historial completo de actividad.',
      icon: 'ti-history',
      color: '#5C3D99',
      generar: async () => {
        const res = await getPrestamos();
        const porUsuario = {};
        (res.data || []).forEach(p => {
          const id = p.usuario?.idUsuario;
          if (!id) return;
          if (!porUsuario[id]) {
            porUsuario[id] = {
              nombre: `${p.usuario?.nombre ?? ''} ${p.usuario?.apellidoP ?? ''}`.trim(),
              doc: p.usuario?.documento ?? '',
              prestamos: [],
            };
          }
          porUsuario[id].prestamos.push(p);
        });
        const filas = [];
        Object.values(porUsuario).forEach(u => {
          u.prestamos.forEach((p, i) => {
            filas.push([
              i === 0 ? `${u.nombre} (Doc: ${u.doc})` : '',
              p.ejemplar?.libro?.titulo ?? '',
              p.fechaPrestamo ?? '',
              p.fechaDevolucionPrevista ?? '',
              p.fechaDevolucionReal ?? 'Pendiente',
              p.estado ?? '',
            ]);
          });
          filas.push(['', '', '', '', '', '']);
        });
        return {
          cabeceras: ['Usuario', 'Libro', 'F. Préstamo', 'F. Prevista', 'F. Devolución', 'Estado'],
          filas,
        };
      },
    },
  ];

  const handleGenerar = async (reporte) => {
    setGenerando(reporte.id);
    try {
      const { cabeceras, filas } = await reporte.generar();
      descargarCSV(reporte.titulo, cabeceras, filas);
    } catch (e) {
      alert('Error al generar el reporte: ' + (e.message || 'Error desconocido'));
    }
    setGenerando(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Reportes</h2>
          <p className="page-subtitle">Generá y descargá reportes en formato CSV (compatible con Excel)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {reportes.map(r => (
          <div key={r.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 24,
            borderTop: `4px solid ${r.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <i className={`ti ${r.icon}`} style={{ fontSize: 28, color: r.color }} aria-hidden="true" />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                {r.titulo}
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>
              {r.descripcion}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => handleGenerar(r)}
              disabled={generando === r.id}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <i className="ti ti-file-spreadsheet" aria-hidden="true" />
              {generando === r.id ? 'Generando...' : 'Descargar CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
