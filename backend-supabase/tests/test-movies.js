// backend-supabase/tests/test-movies.js
/**
 * Tests para el servicio de peliculas
 * Ejecutar: node tests/test-movies.js
 */

import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getMoviesByGenre,
  getTopRatedMovies,
} from "../services/movies.js";

// Variable para almacenar el ID de la pelicula creada en tests
let testMovieId = null;

/**
 * Test 1: Crear una pelicula
 */
async function testCreateMovie() {
  console.log("\n📝 TEST 1: Crear pelicula...");

  const movieData = {
    title: "Inception Test " + Date.now(),
    description: "Un ladron que roba secretos corporativos a traves del uso de tecnologia de suenos.",
    year: 2010,
    genre: "Ciencia Ficcion",
    rating: 8.8,
    director: "Christopher Nolan",
    duration: 148,
    poster_url: "https://example.com/inception.jpg",
  };

  try {
    const result = await createMovie(movieData);
    testMovieId = result.id;
    console.log("✅ Pelicula creada con ID:", testMovieId);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 2: Obtener todas las peliculas
 */
async function testGetMovies() {
  console.log("\n📝 TEST 2: Obtener peliculas...");

  try {
    const movies = await getMovies({ limit: 10 });
    console.log(`✅ Se obtuvieron ${movies.length} peliculas`);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 3: Obtener pelicula por ID
 */
async function testGetMovieById() {
  console.log("\n📝 TEST 3: Obtener pelicula por ID...");

  if (!testMovieId) {
    console.log("⚠️ No hay pelicula de prueba, saltando test...");
    return true;
  }

  try {
    const movie = await getMovieById(testMovieId);
    console.log("✅ Pelicula encontrada:", movie.title);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 4: Actualizar pelicula
 */
async function testUpdateMovie() {
  console.log("\n📝 TEST 4: Actualizar pelicula...");

  if (!testMovieId) {
    console.log("⚠️ No hay pelicula de prueba, saltando test...");
    return true;
  }

  try {
    const updated = await updateMovie(testMovieId, {
      rating: 9.0,
      description: "Descripcion actualizada - pelicula increible!",
    });
    console.log("✅ Pelicula actualizada, nuevo rating:", updated.rating);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 5: Buscar peliculas
 */
async function testSearchMovies() {
  console.log("\n📝 TEST 5: Buscar peliculas...");

  try {
    const results = await searchMovies("Inception");
    console.log(`✅ Busqueda completada: ${results.length} resultados`);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 6: Filtrar por genero
 */
async function testGetMoviesByGenre() {
  console.log("\n📝 TEST 6: Filtrar por genero...");

  try {
    const results = await getMoviesByGenre("Ciencia Ficcion");
    console.log(`✅ Filtro completado: ${results.length} peliculas`);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 7: Top rated
 */
async function testGetTopRated() {
  console.log("\n📝 TEST 7: Top rated...");

  try {
    const results = await getTopRatedMovies(5);
    console.log(`✅ Top 5 obtenido: ${results.length} peliculas`);
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Test 8: Eliminar pelicula (limpieza)
 */
async function testDeleteMovie() {
  console.log("\n📝 TEST 8: Eliminar pelicula...");

  if (!testMovieId) {
    console.log("⚠️ No hay pelicula de prueba, saltando test...");
    return true;
  }

  try {
    await deleteMovie(testMovieId);
    console.log("✅ Pelicula eliminada correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  console.log("🎬 ==========================================");
  console.log("   TESTS DE SERVICIO DE PELICULAS");
  console.log("==========================================");

  const results = [];

  results.push(await testCreateMovie());
  results.push(await testGetMovies());
  results.push(await testGetMovieById());
  results.push(await testUpdateMovie());
  results.push(await testSearchMovies());
  results.push(await testGetMoviesByGenre());
  results.push(await testGetTopRated());
  results.push(await testDeleteMovie());

  console.log("\n==========================================");
  console.log("   RESUMEN DE TESTS");
  console.log("==========================================");

  const passed = results.filter((r) => r).length;
  const failed = results.filter((r) => !r).length;

  console.log(`✅ Pasaron: ${passed}`);
  console.log(`❌ Fallaron: ${failed}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed === 0) {
    console.log("\n🎉 Todos los tests pasaron!");
  } else {
    console.log("\n⚠️ Algunos tests fallaron. Revisa los errores arriba.");
  }
}

// Ejecutar
runAllTests();
