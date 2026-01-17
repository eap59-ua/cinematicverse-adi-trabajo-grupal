// backend-supabase/services/auth.js
/**
 * Servicios de autenticación con Supabase
 * Equivalente a las funciones de PocketBase para auth
 */

import { supabase } from "./supabaseClient.js";

/**
 * LOGIN - Iniciar sesión con email y password
 * Equivalente a: pb.collection('users').authWithPassword(email, password)
 *
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Datos del usuario autenticado
 */
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log("✅ Login exitoso:", data.user.email);
    return data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw error;
  }
}

/**
 * REGISTRO - Crear una nueva cuenta de usuario
 * Equivalente a: pb.collection('users').create({email, password, passwordConfirm})
 *
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {string} username - Nombre de usuario (opcional)
 * @returns {Promise<Object>} Datos del usuario registrado
 */
export async function register(email, password, username = "") {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0], // Usar email como username si no se proporciona
        },
      },
    });

    if (error) throw error;

    console.log("✅ Registro exitoso:", data.user?.email);
    return data;
  } catch (error) {
    console.error("❌ Error en registro:", error.message);
    throw error;
  }
}

/**
 * LOGOUT - Cerrar sesión del usuario actual
 * Equivalente a: pb.authStore.clear()
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    console.log("✅ Logout exitoso");
  } catch (error) {
    console.error("❌ Error en logout:", error.message);
    throw error;
  }
}

/**
 * GET CURRENT USER - Obtener usuario actualmente autenticado
 * Equivalente a: pb.authStore.model
 *
 * @returns {Promise<Object|null>} Usuario actual o null si no hay sesión
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("❌ Error obteniendo usuario actual:", error.message);
    return null;
  }
}

/**
 * CHECK SESSION - Verificar si existe una sesión activa
 *
 * @returns {Promise<Object|null>} Sesión actual o null
 */
export async function checkSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  } catch (error) {
    console.error("❌ Error verificando sesión:", error.message);
    return null;
  }
}

/**
 * UPDATE USER - Actualizar datos del usuario actual
 *
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function updateUser(updates) {
  try {
    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) throw error;

    console.log("✅ Usuario actualizado correctamente");
    return data;
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error.message);
    throw error;
  }
}
