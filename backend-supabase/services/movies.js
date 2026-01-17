// backend-supabase/services/movies.js
/**
 * Servicios CRUD para gestionar peliculas con Supabase
 * Tabla: movies
 */

import { supabase } from "./supabaseClient.js";

/**
 * GET ALL MOVIES - Obtener todas las peliculas
 *
 * @param {Object} options - Opciones de filtrado y paginacion
 * @param {number} options.limit - Limite de resultados (default: 50)
 * @param {number} options.offset - Offset para paginacion (default: 0)
 * @param {string} options.orderBy - Campo para ordenar (default: 'created_at')
 * @param {boolean} options.ascending - Orden ascendente (default: false)
 * @returns {Promise<Array>} Lista de peliculas
 */
export async function getMovies(options = {}) {
  const {
    limit = 50,
    offset = 0,
    orderBy = "created_at",
    ascending = false,
  } = options;

  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    console.log(`✅ Se obtuvieron ${data.length} peliculas`);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo peliculas:", error.message);
    throw error;
  }
}

/**
 * GET MOVIE BY ID - Obtener una pelicula por su ID
 *
 * @param {string} id - ID de la pelicula
 * @returns {Promise<Object>} Datos de la pelicula
 */
export async function getMovieById(id) {
  try {
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
 * CREATE MOVIE - Crear una nueva pelicula
 *
 * @param {Object} movieData - Datos de la pelicula
 * @param {string} movieData.title - Titulo de la pelicula (requerido)
 * @param {string} movieData.description - Descripcion/sinopsis
 * @param {number} movieData.year - Año de lanzamiento
 * @param {string} movieData.genre - Genero de la pelicula
 * @param {string} movieData.poster_url - URL del poster
 * @param {number} movieData.rating - Calificacion (0-10)
 * @param {string} movieData.director - Director de la pelicula
 * @param {number} movieData.duration - Duracion en minutos
 * @returns {Promise<Object>} Pelicula creada
 */
export async function createMovie(movieData) {
  try {
    // Validacion basica
    if (!movieData.title) {
      throw new Error("El titulo de la pelicula es requerido");
    }

    const { data, error } = await supabase
      .from("movies")
      .insert([movieData])
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
 * UPDATE MOVIE - Actualizar una pelicula existente
 *
 * @param {string} id - ID de la pelicula a actualizar
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Pelicula actualizada
 */
export async function updateMovie(id, updates) {
  try {
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
 *
 * @param {string} id - ID de la pelicula a eliminar
 * @returns {Promise<void>}
 */
export async function deleteMovie(id) {
  try {
    const { error } = await supabase.from("movies").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Pelicula eliminada correctamente");
  } catch (error) {
    console.error("❌ Error eliminando pelicula:", error.message);
    throw error;
  }
}

/**
 * SEARCH MOVIES - Buscar peliculas por titulo
 *
 * @param {string} query - Texto a buscar en el titulo
 * @returns {Promise<Array>} Lista de peliculas que coinciden
 */
export async function searchMovies(query) {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .ilike("title", `%${query}%`)
      .order("title", { ascending: true });

    if (error) throw error;

    console.log(`✅ Se encontraron ${data.length} peliculas para "${query}"`);
    return data;
  } catch (error) {
    console.error("❌ Error buscando peliculas:", error.message);
    throw error;
  }
}

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

    console.log(`✅ Se encontraron ${data.length} peliculas de genero "${genre}"`);
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
 * @param {number} limit - Cantidad de peliculas a obtener (default: 10)
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
