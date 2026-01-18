// backend-supabase/scripts/seed-data.js
/**
 * Script para insertar datos de ejemplo en la base de datos
 * Ejecutar: node scripts/seed-data.js
 *
 * Este script crea peliculas de ejemplo para la demo del video
 */

import { supabase } from "../services/supabaseClient.js";

// ============================================
// DATOS DE EJEMPLO
// ============================================

const SAMPLE_MOVIES = [
  {
    title: "Inception",
    genre: "Sci-Fi",
    year: 2010,
    director: "Christopher Nolan",
    poster_url: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
    rating: 8.8,
    tmdb_id: 27205,
  },
  {
    title: "The Dark Knight",
    genre: "Action",
    year: 2008,
    director: "Christopher Nolan",
    poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 9.0,
    tmdb_id: 155,
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    year: 2014,
    director: "Christopher Nolan",
    poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 8.6,
    tmdb_id: 157336,
  },
  {
    title: "Pulp Fiction",
    genre: "Crime",
    year: 1994,
    director: "Quentin Tarantino",
    poster_url: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    rating: 8.9,
    tmdb_id: 680,
  },
  {
    title: "The Matrix",
    genre: "Sci-Fi",
    year: 1999,
    director: "Lana Wachowski, Lilly Wachowski",
    poster_url: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 8.7,
    tmdb_id: 603,
  },
  {
    title: "Forrest Gump",
    genre: "Drama",
    year: 1994,
    director: "Robert Zemeckis",
    poster_url: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    rating: 8.8,
    tmdb_id: 13,
  },
  {
    title: "The Shawshank Redemption",
    genre: "Drama",
    year: 1994,
    director: "Frank Darabont",
    poster_url: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 9.3,
    tmdb_id: 278,
  },
  {
    title: "Fight Club",
    genre: "Drama",
    year: 1999,
    director: "David Fincher",
    poster_url: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    rating: 8.4,
    tmdb_id: 550,
  },
  {
    title: "Gladiator",
    genre: "Action",
    year: 2000,
    director: "Ridley Scott",
    poster_url: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    rating: 8.5,
    tmdb_id: 98,
  },
  {
    title: "The Godfather",
    genre: "Crime",
    year: 1972,
    director: "Francis Ford Coppola",
    poster_url: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    rating: 9.2,
    tmdb_id: 238,
  },
];

// Estados para user_movies
const STATUSES = ["watched", "pending", "favorite"];

// ============================================
// FUNCIONES
// ============================================

async function loginOrCreateUser() {
  console.log("🔐 Iniciando sesion...");

  // Intentar login con usuario demo
  const email = "demo@cinematicverse.com";
  const password = "DemoPassword123!";

  // Intentar login
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si falla el login, crear usuario
    console.log("📝 Usuario no existe, creando cuenta demo...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: { username: "DemoUser" },
        },
      },
    );

    if (signUpError) throw signUpError;

    // Login despues de crear
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) throw loginError;
    data = loginData;
  }

  console.log("✅ Sesion iniciada:", data.user.email);
  return data.user;
}

async function clearExistingData(userId) {
  console.log("🧹 Limpiando datos existentes...");

  // Eliminar user_movies del usuario
  await supabase.from("user_movies").delete().eq("user_id", userId);

  // Eliminar peliculas del usuario
  await supabase.from("movies").delete().eq("user_id", userId);

  console.log("✅ Datos anteriores eliminados");
}

async function insertMovies(userId) {
  console.log("🎬 Insertando peliculas de ejemplo...");

  const moviesWithUser = SAMPLE_MOVIES.map((movie) => ({
    ...movie,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("movies")
    .insert(moviesWithUser)
    .select();

  if (error) throw error;

  console.log(`✅ ${data.length} peliculas insertadas`);
  return data;
}

async function insertUserMovies(userId, movies) {
  console.log("📋 Creando relaciones usuario-pelicula...");

  const userMovies = movies.map((movie, index) => ({
    user_id: userId,
    movie_id: movie.id,
    status: STATUSES[index % 3], // Alternar entre watched, pending, favorite
    user_rating: (Math.random() * 3 + 7).toFixed(1), // Rating entre 7.0 y 10.0
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("user_movies")
    .insert(userMovies)
    .select();

  if (error) throw error;

  console.log(`✅ ${data.length} relaciones creadas`);
  return data;
}

async function showStats(userId) {
  console.log("\n📊 ESTADISTICAS:");
  console.log("─".repeat(40));

  // Contar peliculas
  const { count: moviesCount } = await supabase
    .from("movies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Contar por status
  const { count: watched } = await supabase
    .from("user_movies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "watched");

  const { count: pending } = await supabase
    .from("user_movies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  const { count: favorite } = await supabase
    .from("user_movies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "favorite");

  console.log(`  📽️  Total peliculas:     ${moviesCount}`);
  console.log(`  ✅ Vistas (watched):     ${watched}`);
  console.log(`  ⏳ Pendientes (pending): ${pending}`);
  console.log(`  ⭐ Favoritas (favorite): ${favorite}`);
  console.log("─".repeat(40));
}

// ============================================
// EJECUTAR SEED
// ============================================

async function seedDatabase() {
  console.log("═".repeat(50));
  console.log("🌱 SEED DATABASE - CinematicVerse");
  console.log("═".repeat(50));

  try {
    // 1. Login o crear usuario demo
    const user = await loginOrCreateUser();

    // 2. Limpiar datos anteriores
    await clearExistingData(user.id);

    // 3. Insertar peliculas
    const movies = await insertMovies(user.id);

    // 4. Crear relaciones user_movies
    await insertUserMovies(user.id, movies);

    // 5. Mostrar estadisticas
    await showStats(user.id);

    // 6. Logout
    await supabase.auth.signOut();

    console.log("\n🎉 ¡SEED COMPLETADO EXITOSAMENTE!");
    console.log("\n📌 Usuario demo:");
    console.log("   Email: demo@cinematicverse.com");
    console.log("   Password: DemoPassword123!");
    console.log("\n💡 Ahora puedes ver los datos en Supabase Dashboard");
  } catch (error) {
    console.error("\n❌ Error durante el seed:", error.message);
    process.exit(1);
  }

  console.log("═".repeat(50));
}

// Ejecutar
seedDatabase();
