// backend-supabase/services/movies.js
/**
 * Servicios CRUD para gestionar peliculas con Supabase
 * Tabla: movies
 *
 * Funciones disponibles:
 * - createMovie(movieData) - Crear pelicula del usuario autenticado
 * - searchMovies(filters) - Buscar con filtros y paginacion
 * - getMovieById(id) - Obtener por ID
 * - updateMovie(id, movieData) - Actualizar pelicula
 * - deleteMovie(id) - Eliminar pelicula
 * - listAllMovies() - Listar todas las peliculas
 * - listUserMovies() - Listar peliculas del usuario actual
 */

import { supabase } from "./supabaseClient.js";

/**
 * CREATE MOVIE - Crear una nueva pelicula del usuario autenticado
 *
 * @param {Object} movieData - Datos de la pelicula
 * @param {string} movieData.title - Titulo de la pelicula (requerido)
 * @param {string} movieData.genre - Genero de la pelicula
 * @param {number} movieData.year - Año de lanzamiento
 * @param {string} movieData.director - Director de la pelicula
 * @param {string} movieData.poster_url - URL del poster
 * @param {number} movieData.rating - Calificacion (0-10)
 * @param {number} movieData.tmdb_id - ID de TMDB (opcional)
 * @returns {Promise<Object>} Pelicula creada
 */
export async function createMovie(movieData) {
  try {
    console.log("🔄 Creando pelicula...");

    // Validacion basica
    if (!movieData.title) {
      throw new Error("El titulo de la pelicula es requerido");
    }

    // Obtener el user_id del usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Debes estar autenticado para crear una pelicula");
    }

    // Agregar user_id y timestamps a los datos
    const movieWithUser = {
      ...movieData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("movies")
      .insert([movieWithUser])
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Pelicula creada:", data.title);
    return data;
  } catch (error) {
    console.error("❌ Error creando pelicula:", error.message);
    throw error;
  }
}

/**
 * SEARCH MOVIES - Buscar peliculas con filtros y paginacion
 *
 * @param {Object} filters - Filtros de busqueda
 * @param {string} filters.title - Filtro por titulo (busqueda parcial)
 * @param {string} filters.genre - Filtro por genero exacto
 * @param {number} filters.year - Filtro por año
 * @param {number} filters.page - Numero de pagina (default: 1)
 * @param {number} filters.perPage - Resultados por pagina (default: 10)
 * @returns {Promise<Object>} { items, totalItems, page, perPage }
 */
export async function searchMovies(filters = {}) {
  try {
    console.log("🔄 Buscando peliculas...");

    const { title, genre, year, page = 1, perPage = 10 } = filters;

    // Calcular offset para paginacion
    const offset = (page - 1) * perPage;

    // Construir query base
    let query = supabase.from("movies").select("*", { count: "exact" });

    // Aplicar filtros si existen
    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    if (genre) {
      query = query.eq("genre", genre);
    }

    if (year) {
      query = query.eq("year", year);
    }

    // Aplicar ordenamiento y paginacion
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const result = {
      items: data,
      totalItems: count || 0,
      page: page,
      perPage: perPage,
    };

    console.log(
      `✅ Se encontraron ${result.totalItems} peliculas (mostrando ${data.length})`,
    );
    return result;
  } catch (error) {
    console.error("❌ Error buscando peliculas:", error.message);
    throw error;
  }
}

/**
 * GET MOVIE BY ID - Obtener una pelicula por su ID
 *
 * @param {string} id - ID de la pelicula (UUID)
 * @returns {Promise<Object>} Datos de la pelicula
 */
export async function getMovieById(id) {
  try {
    console.log("🔄 Obteniendo pelicula por ID...");

    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    console.log("✅ Pelicula encontrada:", data.title);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo pelicula:", error.message);
    throw error;
  }
}

/**
 * UPDATE MOVIE - Actualizar una pelicula existente
 * Solo el usuario que creo la pelicula puede actualizarla (verificado por RLS)
 *
 * @param {string} id - ID de la pelicula a actualizar
 * @param {Object} movieData - Campos a actualizar
 * @returns {Promise<Object>} Pelicula actualizada
 */
export async function updateMovie(id, movieData) {
  try {
    console.log("🔄 Actualizando pelicula...");

    // Agregar timestamp de actualizacion
    const updates = {
      ...movieData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("movies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Pelicula actualizada:", data.title);
    return data;
  } catch (error) {
    console.error("❌ Error actualizando pelicula:", error.message);
    throw error;
  }
}

/**
 * DELETE MOVIE - Eliminar una pelicula
 * Solo el usuario que creo la pelicula puede eliminarla (verificado por RLS)
 *
 * @param {string} id - ID de la pelicula a eliminar
 * @returns {Promise<void>}
 */
export async function deleteMovie(id) {
  try {
    console.log("🔄 Eliminando pelicula...");

    const { error } = await supabase.from("movies").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Pelicula eliminada correctamente");
  } catch (error) {
    console.error("❌ Error eliminando pelicula:", error.message);
    throw error;
  }
}

/**
 * LIST ALL MOVIES - Listar todas las peliculas
 * Ordenadas por fecha de creacion (mas recientes primero)
 *
 * @returns {Promise<Array>} Lista de todas las peliculas
 */
export async function listAllMovies() {
  try {
    console.log("🔄 Listando todas las peliculas...");

    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Se obtuvieron ${data.length} peliculas`);
    return data;
  } catch (error) {
    console.error("❌ Error listando peliculas:", error.message);
    throw error;
  }
}

/**
 * LIST USER MOVIES - Listar peliculas del usuario actual
 * Solo muestra las peliculas creadas por el usuario autenticado
 *
 * @returns {Promise<Array>} Lista de peliculas del usuario
 */
export async function listUserMovies() {
  try {
    console.log("🔄 Listando peliculas del usuario...");

    // Obtener el user_id del usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Debes estar autenticado para ver tus peliculas");
    }

    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Se obtuvieron ${data.length} peliculas del usuario`);
    return data;
  } catch (error) {
    console.error("❌ Error listando peliculas del usuario:", error.message);
    throw error;
  }
}

// ============================================
// FUNCIONES ADICIONALES UTILES
// ============================================

/**
 * GET MOVIES BY GENRE - Filtrar peliculas por genero
 *
 * @param {string} genre - Genero a filtrar
 * @returns {Promise<Array>} Lista de peliculas del genero
 */
export async function getMoviesByGenre(genre) {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .ilike("genre", `%${genre}%`)
      .order("rating", { ascending: false });

    if (error) throw error;

    console.log(
      `✅ Se encontraron ${data.length} peliculas de genero "${genre}"`,
    );
    return data;
  } catch (error) {
    console.error("❌ Error filtrando por genero:", error.message);
    throw error;
  }
}

/**
 * GET MOVIES BY YEAR - Filtrar peliculas por año
 *
 * @param {number} year - Año a filtrar
 * @returns {Promise<Array>} Lista de peliculas del año
 */
export async function getMoviesByYear(year) {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("year", year)
      .order("rating", { ascending: false });

    if (error) throw error;

    console.log(`✅ Se encontraron ${data.length} peliculas del año ${year}`);
    return data;
  } catch (error) {
    console.error("❌ Error filtrando por año:", error.message);
    throw error;
  }
}

/**
 * GET TOP RATED MOVIES - Obtener peliculas mejor valoradas
 *
 * @param {number} limit - Cantidad de peliculas (default: 10)
 * @returns {Promise<Array>} Lista de peliculas ordenadas por rating
 */
export async function getTopRatedMovies(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ Top ${data.length} peliculas obtenidas`);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo top peliculas:", error.message);
    throw error;
  }
}
