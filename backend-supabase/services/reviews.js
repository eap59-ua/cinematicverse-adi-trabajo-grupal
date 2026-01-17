// backend-supabase/services/reviews.js
/**
 * Servicios CRUD para gestionar resenas de peliculas con Supabase
 * Tabla: reviews
 */

import { supabase } from "./supabaseClient.js";

/**
 * GET ALL REVIEWS - Obtener todas las resenas de una pelicula
 *
 * @param {string} movieId - ID de la pelicula
 * @returns {Promise<Array>} Lista de resenas
 */
export async function getReviewsByMovie(movieId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Se obtuvieron ${data.length} resenas`);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo resenas:", error.message);
    throw error;
  }
}

/**
 * GET REVIEWS BY USER - Obtener todas las resenas de un usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de resenas del usuario
 */
export async function getReviewsByUser(userId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Se obtuvieron ${data.length} resenas del usuario`);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo resenas del usuario:", error.message);
    throw error;
  }
}

/**
 * CREATE REVIEW - Crear una nueva resena
 *
 * @param {Object} reviewData - Datos de la resena
 * @param {string} reviewData.movie_id - ID de la pelicula (requerido)
 * @param {string} reviewData.user_id - ID del usuario (requerido)
 * @param {number} reviewData.rating - Calificacion del 1 al 10
 * @param {string} reviewData.comment - Comentario/texto de la resena
 * @returns {Promise<Object>} Resena creada
 */
export async function createReview(reviewData) {
  try {
    // Validacion basica
    if (!reviewData.movie_id || !reviewData.user_id) {
      throw new Error("movie_id y user_id son requeridos");
    }

    // Verificar que el usuario no haya hecho ya una resena de esta pelicula
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("movie_id", reviewData.movie_id)
      .eq("user_id", reviewData.user_id)
      .single();

    if (existing) {
      throw new Error("Ya has escrito una resena para esta pelicula");
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([reviewData])
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Resena creada exitosamente");
    return data;
  } catch (error) {
    console.error("❌ Error creando resena:", error.message);
    throw error;
  }
}

/**
 * UPDATE REVIEW - Actualizar una resena existente
 *
 * @param {string} reviewId - ID de la resena a actualizar
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Resena actualizada
 */
export async function updateReview(reviewId, updates) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Resena actualizada correctamente");
    return data;
  } catch (error) {
    console.error("❌ Error actualizando resena:", error.message);
    throw error;
  }
}

/**
 * DELETE REVIEW - Eliminar una resena
 *
 * @param {string} reviewId - ID de la resena a eliminar
 * @returns {Promise<void>}
 */
export async function deleteReview(reviewId) {
  try {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) throw error;

    console.log("✅ Resena eliminada correctamente");
  } catch (error) {
    console.error("❌ Error eliminando resena:", error.message);
    throw error;
  }
}

/**
 * GET REVIEW BY ID - Obtener una resena especifica
 *
 * @param {string} reviewId - ID de la resena
 * @returns {Promise<Object>} Datos de la resena
 */
export async function getReviewById(reviewId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("❌ Error obteniendo resena:", error.message);
    throw error;
  }
}

/**
 * GET AVERAGE RATING - Obtener calificacion promedio de una pelicula
 *
 * @param {string} movieId - ID de la pelicula
 * @returns {Promise<number>} Promedio de calificacion
 */
export async function getAverageRating(movieId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("movie_id", movieId);

    if (error) throw error;

    if (data.length === 0) {
      return 0;
    }

    const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
    console.log(`✅ Rating promedio: ${average.toFixed(1)}`);
    return parseFloat(average.toFixed(1));
  } catch (error) {
    console.error("❌ Error calculando rating promedio:", error.message);
    throw error;
  }
}

/**
 * GET LATEST REVIEWS - Obtener las resenas mas recientes
 *
 * @param {number} limit - Cantidad de resenas (default: 10)
 * @returns {Promise<Array>} Lista de resenas recientes
 */
export async function getLatestReviews(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ Se obtuvieron ${data.length} resenas recientes`);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo resenas recientes:", error.message);
    throw error;
  }
}
