# 📚 BibliotecaSys — Frontend

Interfaz web construida con **React + Vite** para el sistema de gestión bibliotecaria.

## 🛠️ Tecnologías

- React 18
- Vite
- React Router DOM
- Axios
- Tabler Icons

## ⚙️ Requisitos para correr en local

- Node.js 18 o superior
- npm
- El backend corriendo en `http://localhost:8081`

## 🚀 Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Marcos-Argel/biblioteca-frontend.git
cd biblioteca-frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
echo "VITE_API_URL=http://localhost:8081" > .env.local

# 4. Correr en modo desarrollo
npm run dev
```

La app queda disponible en: `http://localhost:5173`

## 🔑 Credenciales por defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | ADMIN |

## 🌐 Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Para desarrollo local
VITE_API_URL=http://localhost:8081

# Para producción (no subir a Git)
# VITE_API_URL=https://tu-backend.onrender.com
```

> ⚠️ Los archivos `.env` y `.env.local` están en `.gitignore` y no se suben a GitHub.

## ☁️ Deploy en Render

1. Crear cuenta en [render.com](https://render.com)
2. **New +** → **Static Site**
3. Conectar repo `biblioteca-frontend`
4. Configurar:
   - **Build Command:** `npm install; npm run build`
   - **Publish Directory:** `dist`
5. Agregar variable de entorno:

| Variable | Valor |
|----------|-------|
| VITE_API_URL | https://tu-backend.onrender.com |

6. Click en **Deploy Static Site**

## 👥 Roles del sistema

| Rol | Acceso |
|-----|--------|
| ADMIN | Todo el sistema + Configuración |
| JEFE | Todo excepto Configuración |
| EMPLEADO | Libros, Catálogo, Préstamos, Devoluciones, Sanciones |
| LECTOR | Solo visualización de Libros |

## 📁 Estructura del proyecto

```
src/
├── api/          # Configuración axios y servicios
├── components/   # Componentes reutilizables (Layout, Modal)
├── context/      # AuthContext, ThemeContext
└── pages/        # Páginas por módulo
    ├── auth/         # Login
    ├── dashboard/    # Dashboard con estadísticas
    ├── libros/       # CRUD libros + stock
    ├── usuarios/     # CRUD usuarios
    ├── prestamos/    # Gestión de préstamos
    ├── devoluciones/ # Registro de devoluciones
    ├── sanciones/    # Gestión de sanciones
    ├── catalogo/     # Categorías, autores, editoriales, lenguajes
    ├── reportes/     # Exportación CSV
    └── configuracion/ # Parámetros del sistema + inventario
```

## ⚠️ Notas importantes

- El free tier de Render puede tardar ~50 segundos en responder tras inactividad
- El modo oscuro/claro se guarda en `localStorage`
