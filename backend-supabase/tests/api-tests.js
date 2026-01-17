// backend-supabase/tests/api-tests.js
/**
 * Suite de tests completa para el backend de CinematicVerse
 * Ejecutar: node tests/api-tests.js
 *
 * Tests incluidos:
 * 1. Autenticacion (login, logout)
 * 2. CRUD de peliculas
 * 3. Busqueda y filtros
 * 4. Perfil de usuario y estadisticas
 */

import { login, register, logout, getCurrentUser } from "../services/auth.js";
import {
  createMovie,
  searchMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  listAllMovies,
  listUserMovies,
} from "../services/movies.js";
import {
  getCurrentUserProfile,
  updateUserProfile,
  getCurrentUserStats,
} from "../services/users.js";

// ============================================
// CONFIGURACION DE TESTS
// ============================================

// Usuario de prueba (se genera uno nuevo cada vez)
const TEST_USER = {
  email: `test_${Date.now()}@cinematicverse.com`,
  password: "TestPassword123!",
  username: "TestUser",
};

// Pelicula de prueba
const TEST_MOVIE = {
  title: `Test Movie ${Date.now()}`,
  genre: "Action",
  year: 2024,
  director: "Test Director",
  poster_url: "https://example.com/poster.jpg",
  rating: 8.5,
};

// Variable para almacenar IDs durante los tests
let testMovieId = null;
let testUserId = null;

// Contadores de resultados
let passed = 0;
let failed = 0;

// ============================================
// UTILIDADES DE TEST
// ============================================

function logTest(name, success, details = "") {
  if (success) {
    console.log(`  ✅ ${name}${details ? ": " + details : ""}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${details ? ": " + details : ""}`);
    failed++;
  }
}

async function runTest(name, testFn) {
  try {
    const result = await testFn();
    logTest(name, true, result);
    return true;
  } catch (error) {
    logTest(name, false, error.message);
    return false;
  }
}

// ============================================
// TEST 1: AUTENTICACION
// ============================================

async function testAuth() {
  console.log("\n📋 TEST 1: AUTENTICACION");
  console.log("─".repeat(40));

  let success = true;

  // 1.1 Registro de usuario
  success =
    (await runTest("Registro de usuario", async () => {
      const result = await register(
        TEST_USER.email,
        TEST_USER.password,
        TEST_USER.username,
      );
      testUserId = result.user?.id;
      return `Usuario: ${result.user?.email}`;
    })) && success;

  // 1.2 Login
  success =
    (await runTest("Login con credenciales", async () => {
      const result = await login(TEST_USER.email, TEST_USER.password);
      return `Sesion activa: ${result.user?.email}`;
    })) && success;

  // 1.3 Obtener usuario actual
  success =
    (await runTest("Obtener usuario actual", async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error("No se obtuvo usuario");
      return `ID: ${user.id}`;
    })) && success;

  return success;
}

// ============================================
// TEST 2: CRUD DE PELICULAS
// ============================================

async function testMovieCRUD() {
  console.log("\n📋 TEST 2: CRUD DE PELICULAS");
  console.log("─".repeat(40));

  let success = true;

  // 2.1 Crear pelicula
  success =
    (await runTest("Crear pelicula", async () => {
      const movie = await createMovie(TEST_MOVIE);
      testMovieId = movie.id;
      return `ID: ${movie.id}, Titulo: ${movie.title}`;
    })) && success;

  // 2.2 Obtener pelicula por ID
  success =
    (await runTest("Obtener pelicula por ID", async () => {
      if (!testMovieId) throw new Error("No hay ID de pelicula");
      const movie = await getMovieById(testMovieId);
      return `Titulo: ${movie.title}`;
    })) && success;

  // 2.3 Actualizar pelicula
  success =
    (await runTest("Actualizar pelicula", async () => {
      if (!testMovieId) throw new Error("No hay ID de pelicula");
      const updated = await updateMovie(testMovieId, {
        rating: 9.0,
        genre: "Sci-Fi",
      });
      return `Nuevo rating: ${updated.rating}, Nuevo genero: ${updated.genre}`;
    })) && success;

  // 2.4 Listar todas las peliculas
  success =
    (await runTest("Listar todas las peliculas", async () => {
      const movies = await listAllMovies();
      return `Total: ${movies.length} peliculas`;
    })) && success;

  // 2.5 Listar peliculas del usuario
  success =
    (await runTest("Listar peliculas del usuario", async () => {
      const movies = await listUserMovies();
      return `Peliculas del usuario: ${movies.length}`;
    })) && success;

  return success;
}

// ============================================
// TEST 3: BUSQUEDA Y FILTROS
// ============================================

async function testSearchAndFilters() {
  console.log("\n📋 TEST 3: BUSQUEDA Y FILTROS");
  console.log("─".repeat(40));

  let success = true;

  // 3.1 Buscar por titulo
  success =
    (await runTest("Buscar por titulo", async () => {
      const result = await searchMovies({ title: "Test" });
      return `Encontradas: ${result.totalItems}, Pagina: ${result.page}`;
    })) && success;

  // 3.2 Buscar con paginacion
  success =
    (await runTest("Buscar con paginacion", async () => {
      const result = await searchMovies({ page: 1, perPage: 5 });
      return `Items: ${result.items.length}, Total: ${result.totalItems}`;
    })) && success;

  // 3.3 Buscar por genero
  success =
    (await runTest("Buscar por genero", async () => {
      const result = await searchMovies({ genre: "Sci-Fi" });
      return `Peliculas Sci-Fi: ${result.totalItems}`;
    })) && success;

  return success;
}

// ============================================
// TEST 4: PERFIL DE USUARIO
// ============================================

async function testUserProfile() {
  console.log("\n📋 TEST 4: PERFIL DE USUARIO");
  console.log("─".repeat(40));

  let success = true;

  // 4.1 Obtener perfil actual
  success =
    (await runTest("Obtener perfil actual", async () => {
      const profile = await getCurrentUserProfile();
      return `Email: ${profile.email}, Username: ${profile.username}`;
    })) && success;

  // 4.2 Actualizar perfil
  success =
    (await runTest("Actualizar perfil", async () => {
      if (!testUserId) throw new Error("No hay usuario de prueba");
      const updated = await updateUserProfile(testUserId, {
        username: "UpdatedTestUser",
      });
      return `Nuevo username: ${updated.username}`;
    })) && success;

  // 4.3 Obtener estadisticas
  success =
    (await runTest("Obtener estadisticas", async () => {
      const stats = await getCurrentUserStats();
      return `Peliculas: ${stats.totalMovies}, Vistas: ${stats.watchedMovies}`;
    })) && success;

  return success;
}

// ============================================
// TEST 5: LIMPIEZA (Eliminar datos de prueba)
// ============================================

async function testCleanup() {
  console.log("\n📋 TEST 5: LIMPIEZA");
  console.log("─".repeat(40));

  let success = true;

  // 5.1 Eliminar pelicula de prueba
  success =
    (await runTest("Eliminar pelicula de prueba", async () => {
      if (!testMovieId) throw new Error("No hay pelicula para eliminar");
      await deleteMovie(testMovieId);
      return "Pelicula eliminada";
    })) && success;

  // 5.2 Logout
  success =
    (await runTest("Logout", async () => {
      await logout();
      return "Sesion cerrada";
    })) && success;

  return success;
}

// ============================================
// EJECUTAR TODOS LOS TESTS
// ============================================

async function runAllTests() {
  console.log("═".repeat(50));
  console.log("🚀 CINEMATICVERSE - SUITE DE TESTS SUPABASE");
  console.log("═".repeat(50));
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`📧 Usuario de prueba: ${TEST_USER.email}`);

  const results = {
    auth: false,
    crud: false,
    search: false,
    profile: false,
    cleanup: false,
  };

  try {
    // Ejecutar tests en orden
    results.auth = await testAuth();
    results.crud = await testMovieCRUD();
    results.search = await testSearchAndFilters();
    results.profile = await testUserProfile();
    results.cleanup = await testCleanup();
  } catch (error) {
    console.error("\n💥 Error fatal durante los tests:", error.message);
  }

  // Resumen final
  console.log("\n" + "═".repeat(50));
  console.log("📊 RESUMEN DE RESULTADOS");
  console.log("═".repeat(50));

  console.log(`\n  Autenticacion:  ${results.auth ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  CRUD Peliculas: ${results.crud ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  Busqueda:       ${results.search ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  Perfil Usuario: ${results.profile ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  Limpieza:       ${results.cleanup ? "✅ PASS" : "❌ FAIL"}`);

  console.log("\n" + "─".repeat(50));
  console.log(`  ✅ Tests pasados: ${passed}`);
  console.log(`  ❌ Tests fallidos: ${failed}`);
  console.log(`  📈 Total: ${passed + failed}`);
  console.log("─".repeat(50));

  if (failed === 0) {
    console.log("\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!");
  } else {
    console.log(
      `\n⚠️  ${failed} test(s) fallaron. Revisa los errores arriba.`,
    );
  }

  console.log("\n" + "═".repeat(50));

  // Retornar codigo de salida
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runAllTests();
