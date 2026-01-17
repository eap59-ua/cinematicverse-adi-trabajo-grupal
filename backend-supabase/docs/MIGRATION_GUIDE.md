# Guia de Migracion: PocketBase a Supabase
## CinematicVerse Backend - Trabajo Grupal ADI 2025-26

---

## 1. Introduccion

Este documento describe el proceso de migracion del backend de CinematicVerse desde PocketBase hacia Supabase, realizado como parte del trabajo grupal de la asignatura Aplicaciones Distribuidas en Internet (ADI) en la Universidad de Alicante.

### Objetivo de la migracion
- Comparar dos soluciones BaaS (Backend as a Service)
- Evaluar ventajas y desventajas de cada plataforma
- Documentar el proceso para futuros proyectos academicos

### Contexto del proyecto
CinematicVerse es una plataforma de gestion de peliculas que permite a los usuarios registrarse, crear y gestionar su coleccion de peliculas, y consultar el catalogo general.

---

## 2. Diferencias Arquitecturales

| Aspecto | PocketBase | Supabase |
|---------|------------|----------|
| **Base de datos** | SQLite (embebida) | PostgreSQL (cloud) |
| **Despliegue** | Self-hosted (binario unico) | Cloud o Self-hosted |
| **Autenticacion** | JWT integrado | Auth + Row Level Security |
| **API** | SDK con metodos directos | Query builder con chaining |
| **Tiempo real** | WebSockets integrados | Realtime subscriptions |
| **Escalabilidad** | Limitada (SQLite) | Alta (PostgreSQL) |
| **Curva aprendizaje** | Baja | Media |
| **Documentacion** | Buena | Excelente |

### Ventajas de Supabase
- PostgreSQL completo con todas sus features (JSON, arrays, full-text search)
- Row Level Security (RLS) para control de acceso granular
- Dashboard web potente para administracion
- Escalabilidad horizontal nativa
- Integraciones con edge functions

### Ventajas de PocketBase
- Despliegue mas simple (un solo binario)
- Sin dependencias externas
- Ideal para prototipos rapidos
- Menor coste operativo

---

## 3. Migracion del Schema

### Antes: PocketBase (Colecciones)

En PocketBase, las colecciones se definen desde el dashboard o via API:

```javascript
// Estructura implicita en PocketBase
// Coleccion: movies
{
  id: "string (15 chars)",
  title: "string",
  genre: "string",
  year: "number",
  director: "string",
  poster_url: "url",
  rating: "number",
  user: "relation -> users",
  created: "datetime",
  updated: "datetime"
}
```

### Despues: Supabase (SQL)

En Supabase, definimos tablas SQL explicitamente:

```sql
-- Tabla movies en Supabase
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

-- Tabla user_movies (relacion muchos-a-muchos)
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

### Diferencias clave
- **IDs**: PocketBase usa strings de 15 caracteres, Supabase usa UUIDs
- **Relaciones**: PocketBase tiene tipo `relation`, Supabase usa `REFERENCES` (FK)
- **Timestamps**: PocketBase usa `created/updated`, Supabase usa `created_at/updated_at`

---

## 4. Migracion de Autenticacion

### Login

**PocketBase:**
```javascript
// Login en PocketBase
const authData = await pb.collection('users').authWithPassword(
  email,
  password
);
console.log(pb.authStore.token);
console.log(pb.authStore.model);
```

**Supabase:**
```javascript
// Login en Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
console.log(data.session.access_token);
console.log(data.user);
```

### Registro

**PocketBase:**
```javascript
// Registro en PocketBase
const user = await pb.collection('users').create({
  email: email,
  password: password,
  passwordConfirm: password,
  username: username
});
```

**Supabase:**
```javascript
// Registro en Supabase
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username: username }
  }
});
```

### Logout

**PocketBase:**
```javascript
pb.authStore.clear();
```

**Supabase:**
```javascript
await supabase.auth.signOut();
```

### Obtener usuario actual

**PocketBase:**
```javascript
const user = pb.authStore.model;
const isValid = pb.authStore.isValid;
```

**Supabase:**
```javascript
const { data: { user } } = await supabase.auth.getUser();
const { data: { session } } = await supabase.auth.getSession();
```

---

## 5. Migracion de CRUD

### CREATE - Crear pelicula

**PocketBase:**
```javascript
const movie = await pb.collection('movies').create({
  title: 'Inception',
  genre: 'Sci-Fi',
  year: 2010,
  user: pb.authStore.model.id
});
```

**Supabase:**
```javascript
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await supabase
  .from('movies')
  .insert([{
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
    user_id: user.id
  }])
  .select()
  .single();
```

### READ - Obtener pelicula por ID

**PocketBase:**
```javascript
const movie = await pb.collection('movies').getOne(recordId);
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('movies')
  .select('*')
  .eq('id', recordId)
  .single();
```

### UPDATE - Actualizar pelicula

**PocketBase:**
```javascript
const updated = await pb.collection('movies').update(recordId, {
  rating: 9.0
});
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('movies')
  .update({ rating: 9.0 })
  .eq('id', recordId)
  .select()
  .single();
```

### DELETE - Eliminar pelicula

**PocketBase:**
```javascript
await pb.collection('movies').delete(recordId);
```

**Supabase:**
```javascript
const { error } = await supabase
  .from('movies')
  .delete()
  .eq('id', recordId);
```

### SEARCH - Buscar con filtros y paginacion

**PocketBase:**
```javascript
const result = await pb.collection('movies').getList(1, 10, {
  filter: 'title ~ "inception" && genre = "Sci-Fi"',
  sort: '-created'
});
// result.items, result.totalItems, result.page, result.perPage
```

**Supabase:**
```javascript
const { data, error, count } = await supabase
  .from('movies')
  .select('*', { count: 'exact' })
  .ilike('title', '%inception%')
  .eq('genre', 'Sci-Fi')
  .order('created_at', { ascending: false })
  .range(0, 9);

const result = {
  items: data,
  totalItems: count,
  page: 1,
  perPage: 10
};
```

---

## 6. Row Level Security (RLS)

Una de las mayores diferencias es el sistema de seguridad. Supabase utiliza RLS de PostgreSQL:

```sql
-- Habilitar RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer todas las peliculas
CREATE POLICY "movies_select_all" ON movies
  FOR SELECT USING (true);

-- Solo el propietario puede insertar
CREATE POLICY "movies_insert_own" ON movies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo el propietario puede actualizar
CREATE POLICY "movies_update_own" ON movies
  FOR UPDATE USING (auth.uid() = user_id);

-- Solo el propietario puede eliminar
CREATE POLICY "movies_delete_own" ON movies
  FOR DELETE USING (auth.uid() = user_id);
```

### Ventajas de RLS sobre PocketBase
- Seguridad a nivel de base de datos (no solo en API)
- Reglas declarativas faciles de auditar
- Imposible de bypassear desde el cliente
- Soporte para reglas complejas con subconsultas

---

## 7. Testing

### Enfoque de testing

Ambas plataformas permiten testing similar, pero Supabase facilita tests mas robustos gracias a PostgreSQL.

### Resultados de nuestra suite de tests

```
Tests ejecutados: 16/16 PASARON

✅ Autenticacion:  PASS (3 tests)
   - Registro de usuario
   - Login con credenciales
   - Obtener usuario actual

✅ CRUD Peliculas: PASS (5 tests)
   - Crear pelicula
   - Obtener por ID
   - Actualizar pelicula
   - Listar todas
   - Listar del usuario

✅ Busqueda: PASS (3 tests)
   - Buscar por titulo
   - Buscar con paginacion
   - Filtrar por genero

✅ Perfil Usuario: PASS (3 tests)
   - Obtener perfil actual
   - Actualizar perfil
   - Obtener estadisticas

✅ Limpieza: PASS (2 tests)
   - Eliminar pelicula de prueba
   - Logout
```

---

## 8. Desafios Encontrados

### 8.1 UUIDs vs IDs de texto
- **Problema**: PocketBase usa IDs de 15 caracteres, Supabase usa UUIDs de 36 caracteres
- **Solucion**: Actualizar validaciones y tipos en el frontend

### 8.2 Paginacion diferente
- **Problema**: PocketBase usa `getList(page, perPage)`, Supabase usa `range(from, to)`
- **Solucion**: Crear funcion wrapper que calcula el offset automaticamente

### 8.3 Confirmacion de email
- **Problema**: Supabase requiere confirmacion de email por defecto
- **Solucion**: Desactivar en Authentication > Providers > Email para desarrollo

### 8.4 Manejo de errores
- **Problema**: Formato de errores diferente entre plataformas
- **Solucion**: Normalizar errores en capa de servicios con try-catch

### 8.5 Relaciones y JOINs
- **Problema**: PocketBase expande relaciones automaticamente, Supabase no
- **Solucion**: Usar select con sintaxis de relaciones: `select('*, user:user_id(*)')`

---

## 9. Conclusiones

### Metricas de migracion
- **Tiempo total**: ~6 horas de desarrollo
- **Lineas de codigo**: ~800 LOC (servicios + tests)
- **Dificultad**: Media
- **Tests pasados**: 16/16 (100%)

### Recomendaciones

| Escenario | Recomendacion |
|-----------|---------------|
| Prototipo rapido | PocketBase |
| Proyecto academico | Cualquiera |
| Startup/MVP | Supabase |
| Aplicacion empresarial | Supabase |
| Self-hosted obligatorio | PocketBase |
| Necesidad de escalar | Supabase |

### Lecciones aprendidas
1. Las APIs son conceptualmente similares, la migracion es factible
2. RLS de Supabase ofrece seguridad superior
3. PostgreSQL abre posibilidades avanzadas (full-text search, JSON)
4. La documentacion de Supabase es excelente para resolver dudas
5. El dashboard de Supabase facilita debugging y administracion

---

## 10. Referencias

- [Documentacion oficial de Supabase](https://supabase.com/docs)
- [Documentacion de PocketBase](https://pocketbase.io/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Repositorio del proyecto](https://github.com/eap59-ua/cinematicverse-adi-trabajo-grupal)

---

**Autores**: Erardo Aldana, David Mas, Dario Suarez
**Asignatura**: Aplicaciones Distribuidas en Internet (ADI)
**Universidad**: Universidad de Alicante
**Fecha**: Enero 2026
