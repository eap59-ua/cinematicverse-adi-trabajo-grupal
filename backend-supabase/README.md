# Backend Supabase - CinematicVerse

## Trabajo Grupal ADI 2025-26 | Universidad de Alicante

---

## Descripcion

Backend de ejemplo implementado con **Supabase** para la plataforma CinematicVerse, desarrollado como parte del trabajo grupal de comparativa tecnica **PocketBase vs Supabase** en la asignatura Aplicaciones Distribuidas en Internet (ADI).

### Funcionalidades implementadas

- Autenticacion completa (registro, login, logout)
- CRUD de peliculas con filtros y paginacion
- Gestion de perfiles de usuario
- Estadisticas de usuario
- Row Level Security (RLS) para control de acceso
- Suite de tests completa (16 tests)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      Cliente                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Servicios (JS)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ auth.js  │  │movies.js │  │ users.js │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │             │                     │
│       └─────────────┼─────────────┘                     │
│                     ▼                                   │
│           ┌─────────────────┐                           │
│           │supabaseClient.js│                           │
│           └────────┬────────┘                           │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Supabase Cloud                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │  PostgreSQL  │  │   Storage    │  │
│  │   (JWT+RLS)  │  │   (movies,   │  │   (posters)  │  │
│  │              │  │  user_movies)│  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Instalacion

### Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- Cuenta en [Supabase](https://supabase.com)

### Pasos de instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/eap59-ua/cinematicverse-adi-trabajo-grupal.git

# 2. Entrar a la carpeta del backend
cd cinematicverse-adi-trabajo-grupal/backend-supabase

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
cp .env.example .env

# 5. Editar .env con tus credenciales de Supabase
# SUPABASE_URL=tu-proyecto-url
# SUPABASE_ANON_KEY=tu-anon-key
```

---

## Configuracion

### Variables de entorno

Crea un archivo `.env` en la raiz de `backend-supabase/` con:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y accede a tu proyecto
2. Settings > API
3. Copia `Project URL` y `anon public` key

---

## Estructura del Proyecto

```
backend-supabase/
├── config/
│   └── supabase.config.js    # Configuracion cliente Supabase
├── services/
│   ├── supabaseClient.js     # Cliente singleton de Supabase
│   ├── auth.js               # Servicios de autenticacion
│   ├── movies.js             # CRUD de peliculas
│   └── users.js              # Gestion de usuarios
├── tests/
│   ├── test-auth-quick.js    # Tests de autenticacion
│   ├── test-movies.js        # Tests de peliculas
│   └── api-tests.js          # Suite completa de tests
├── docs/
│   └── MIGRATION_GUIDE.md    # Guia de migracion PocketBase->Supabase
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Archivos ignorados por git
├── package.json              # Dependencias del proyecto
├── index.js                  # Punto de entrada (exportaciones)
└── README.md                 # Este archivo
```

---

## API Reference

### Autenticacion (`auth.js`)

| Funcion | Descripcion | Parametros |
|---------|-------------|------------|
| `login(email, password)` | Inicia sesion | email: string, password: string |
| `register(email, password, username)` | Crea cuenta nueva | email, password, username (opcional) |
| `logout()` | Cierra sesion actual | - |
| `getCurrentUser()` | Obtiene usuario autenticado | - |
| `checkSession()` | Verifica sesion activa | - |
| `updateUser(updates)` | Actualiza datos del usuario | updates: object |

**Ejemplo de uso:**

```javascript
import { login, register, logout, getCurrentUser } from './services/auth.js';

// Registro
const { user } = await register('user@example.com', 'password123', 'miUsuario');

// Login
const { user, session } = await login('user@example.com', 'password123');

// Obtener usuario actual
const currentUser = await getCurrentUser();

// Logout
await logout();
```

---

### Peliculas (`movies.js`)

| Funcion | Descripcion | Retorno |
|---------|-------------|---------|
| `createMovie(movieData)` | Crea pelicula del usuario autenticado | Movie object |
| `searchMovies(filters)` | Busca con filtros y paginacion | `{items, totalItems, page, perPage}` |
| `getMovieById(id)` | Obtiene pelicula por UUID | Movie object |
| `updateMovie(id, data)` | Actualiza pelicula | Movie object |
| `deleteMovie(id)` | Elimina pelicula | void |
| `listAllMovies()` | Lista todas las peliculas | Array de movies |
| `listUserMovies()` | Lista peliculas del usuario actual | Array de movies |
| `getMoviesByGenre(genre)` | Filtra por genero | Array de movies |
| `getMoviesByYear(year)` | Filtra por ano | Array de movies |
| `getTopRatedMovies(limit)` | Top peliculas por rating | Array de movies |

**Ejemplo de uso:**

```javascript
import { createMovie, searchMovies, listUserMovies } from './services/movies.js';

// Crear pelicula (requiere autenticacion)
const movie = await createMovie({
  title: 'Inception',
  genre: 'Sci-Fi',
  year: 2010,
  director: 'Christopher Nolan',
  rating: 8.8
});

// Buscar con filtros
const results = await searchMovies({
  title: 'inception',
  genre: 'Sci-Fi',
  page: 1,
  perPage: 10
});
// results = { items: [...], totalItems: 5, page: 1, perPage: 10 }

// Mis peliculas
const myMovies = await listUserMovies();
```

---

### Usuarios (`users.js`)

| Funcion | Descripcion | Parametros |
|---------|-------------|------------|
| `getUserProfile(userId)` | Obtiene perfil por ID | userId: UUID |
| `getCurrentUserProfile()` | Perfil del usuario actual | - |
| `updateUserProfile(userId, data)` | Actualiza perfil | userId, data: object |
| `getUserStats(userId)` | Estadisticas del usuario | userId: UUID |
| `getCurrentUserStats()` | Estadisticas del usuario actual | - |

**Ejemplo de uso:**

```javascript
import { getCurrentUserProfile, getCurrentUserStats } from './services/users.js';

// Mi perfil
const profile = await getCurrentUserProfile();
// { id, email, username, created_at, last_sign_in }

// Mis estadisticas
const stats = await getCurrentUserStats();
// { totalMovies: 5, watchedMovies: 3, favoriteMovies: 2, pendingMovies: 1 }
```

---

## Testing

### Ejecutar todos los tests

```bash
node tests/api-tests.js
```

### Tests individuales

```bash
# Solo autenticacion
node tests/test-auth-quick.js

# Solo peliculas
node tests/test-movies.js
```

### Resultados esperados

```
══════════════════════════════════════════════════
🚀 CINEMATICVERSE - SUITE DE TESTS SUPABASE
══════════════════════════════════════════════════

✅ Autenticacion:  PASS
✅ CRUD Peliculas: PASS
✅ Busqueda:       PASS
✅ Perfil Usuario: PASS
✅ Limpieza:       PASS

──────────────────────────────────────────────────
  ✅ Tests pasados: 16
  ❌ Tests fallidos: 0
  📈 Total: 16
──────────────────────────────────────────────────

🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!
```

---

## Schema de Base de Datos

### Tabla `movies`

```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  genre TEXT,
  year INTEGER,
  director TEXT,
  poster_url TEXT,
  rating NUMERIC(3,1),
  tmdb_id INTEGER,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `user_movies`

```sql
CREATE TABLE user_movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  movie_id UUID REFERENCES movies(id) NOT NULL,
  status TEXT CHECK (status IN ('watched', 'pending', 'favorite')),
  user_rating NUMERIC(3,1),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);
```

---

## Seguridad

### Row Level Security (RLS)

Las tablas tienen RLS habilitado con las siguientes politicas:

| Tabla | Operacion | Politica |
|-------|-----------|----------|
| movies | SELECT | Todos pueden leer |
| movies | INSERT | Solo usuarios autenticados (propio user_id) |
| movies | UPDATE | Solo el propietario |
| movies | DELETE | Solo el propietario |
| user_movies | ALL | Solo el propietario |

### Buenas practicas implementadas

- Credenciales en variables de entorno (no en codigo)
- `.env` excluido de git via `.gitignore`
- Validacion de usuario autenticado antes de operaciones CRUD
- Manejo de errores con try-catch en todos los servicios

---

## Equipo

| Nombre | Rol | Responsabilidad |
|--------|-----|-----------------|
| **Erardo Aldana Pessoa** | Backend Developer | Implementacion Supabase, tests, documentacion tecnica |
| **David Mas Almendros** | Analista | Analisis comparativo PocketBase vs Supabase |
| **Dario Suarez Domenech** | Multimedia | Video presentacion del proyecto |

---

## Referencias

- [Documentacion de Supabase](https://supabase.com/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Guia de Migracion PocketBase->Supabase](./docs/MIGRATION_GUIDE.md)

---

## Licencia

Proyecto academico desarrollado para la asignatura **Aplicaciones Distribuidas en Internet (ADI)** de la Universidad de Alicante.

**Curso**: 2025-26
**Fecha de entrega**: 18 de enero de 2026

---

*Generado con ayuda de Claude Code*
