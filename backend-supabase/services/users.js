// backend-supabase/services/users.js
/**
 * Servicios para gestionar perfiles de usuario con Supabase
 *
 * Funciones disponibles:
 * - getUserProfile(userId) - Obtener perfil de usuario
 * - updateUserProfile(userId, profileData) - Actualizar perfil
 * - getUserStats(userId) - Obtener estadisticas del usuario
 * - getCurrentUserProfile() - Obtener perfil del usuario autenticado
 */

import { supabase } from "./supabaseClient.js";

/**
 * GET USER PROFILE - Obtener perfil de un usuario por su ID
 *
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<Object>} Datos del perfil del usuario
 */
export async function getUserProfile(userId) {
  try {
    console.log("🔄 Obteniendo perfil de usuario...");

    // Obtener datos del usuario desde auth.users
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(userId);

    // Si no tenemos acceso admin, intentamos obtener del usuario actual
    if (error) {
      // Intentar obtener datos basicos si es el usuario actual
      const { data: currentUser } = await supabase.auth.getUser();

      if (currentUser?.user?.id === userId) {
        console.log("✅ Perfil obtenido (usuario actual)");
        return {
          id: currentUser.user.id,
          email: currentUser.user.email,
          username: currentUser.user.user_metadata?.username || null,
          created_at: currentUser.user.created_at,
        };
      }

      throw new Error("No se puede acceder al perfil de este usuario");
    }

    console.log("✅ Perfil obtenido:", user.email);
    return {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || null,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error("❌ Error obteniendo perfil:", error.message);
    throw error;
  }
}

/**
 * GET CURRENT USER PROFILE - Obtener perfil del usuario autenticado
 *
 * @returns {Promise<Object>} Datos del perfil del usuario actual
 */
export async function getCurrentUserProfile() {
  try {
    console.log("🔄 Obteniendo perfil del usuario actual...");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("No hay usuario autenticado");
    }

    const profile = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email.split("@")[0],
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
    };

    console.log("✅ Perfil del usuario actual obtenido:", profile.email);
    return profile;
  } catch (error) {
    console.error("❌ Error obteniendo perfil actual:", error.message);
    throw error;
  }
}

/**
 * UPDATE USER PROFILE - Actualizar perfil del usuario
 * Solo puede actualizar su propio perfil
 *
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} profileData - Datos a actualizar
 * @param {string} profileData.username - Nuevo nombre de usuario
 * @param {string} profileData.email - Nuevo email (requiere verificacion)
 * @returns {Promise<Object>} Perfil actualizado
 */
export async function updateUserProfile(userId, profileData) {
  try {
    console.log("🔄 Actualizando perfil de usuario...");

    // Verificar que el usuario esta autenticado y es el mismo
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Debes estar autenticado para actualizar tu perfil");
    }

    if (user.id !== userId) {
      throw new Error("Solo puedes actualizar tu propio perfil");
    }

    // Preparar datos para actualizar
    const updates = {};

    // Actualizar username en metadata
    if (profileData.username) {
      updates.data = {
        ...user.user_metadata,
        username: profileData.username,
      };
    }

    // Actualizar email (esto enviara un email de confirmacion si esta habilitado)
    if (profileData.email && profileData.email !== user.email) {
      updates.email = profileData.email;
    }

    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) throw error;

    console.log("✅ Perfil actualizado correctamente");
    return {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || null,
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error actualizando perfil:", error.message);
    throw error;
  }
}

/**
 * GET USER STATS - Obtener estadisticas del usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estadisticas del usuario
 * - totalMovies: peliculas creadas por el usuario
 * - watchedMovies: peliculas marcadas como vistas
 * - favoriteMovies: peliculas marcadas como favoritas
 * - pendingMovies: peliculas pendientes de ver
 */
export async function getUserStats(userId) {
  try {
    console.log("🔄 Obteniendo estadisticas del usuario...");

    // Contar peliculas creadas por el usuario
    const { count: totalMovies, error: moviesError } = await supabase
      .from("movies")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (moviesError) throw moviesError;

    // Contar peliculas vistas (de user_movies)
    const { count: watchedMovies, error: watchedError } = await supabase
      .from("user_movies")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "watched");

    if (watchedError) throw watchedError;

    // Contar peliculas favoritas
    const { count: favoriteMovies, error: favError } = await supabase
      .from("user_movies")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "favorite");

    if (favError) throw favError;

    // Contar peliculas pendientes
    const { count: pendingMovies, error: pendingError } = await supabase
      .from("user_movies")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (pendingError) throw pendingError;

    const stats = {
      totalMovies: totalMovies || 0,
      watchedMovies: watchedMovies || 0,
      favoriteMovies: favoriteMovies || 0,
      pendingMovies: pendingMovies || 0,
    };

    console.log("✅ Estadisticas obtenidas:", stats);
    return stats;
  } catch (error) {
    console.error("❌ Error obteniendo estadisticas:", error.message);
    throw error;
  }
}

/**
 * GET CURRENT USER STATS - Obtener estadisticas del usuario autenticado
 *
 * @returns {Promise<Object>} Estadisticas del usuario actual
 */
export async function getCurrentUserStats() {
  try {
    console.log("🔄 Obteniendo estadisticas del usuario actual...");

    // Obtener usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Debes estar autenticado para ver tus estadisticas");
    }

    // Llamar a getUserStats con el ID del usuario actual
    return await getUserStats(user.id);
  } catch (error) {
    console.error("❌ Error obteniendo estadisticas actuales:", error.message);
    throw error;
  }
}
