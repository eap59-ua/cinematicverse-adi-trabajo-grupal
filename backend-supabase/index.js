// backend-supabase/index.js
/**
 * Punto de entrada principal del backend CinematicVerse
 * Exporta todos los servicios disponibles
 */

// Cliente Supabase
export { supabase } from "./services/supabaseClient.js";

// Servicios de Autenticacion
export {
  login,
  register,
  logout,
  getCurrentUser,
  checkSession,
  updateUser,
} from "./services/auth.js";

// Servicios de Peliculas
export {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getMoviesByGenre,
  getMoviesByYear,
  getTopRatedMovies,
} from "./services/movies.js";

// Servicios de Resenas
export {
  getReviewsByMovie,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
  getAverageRating,
  getLatestReviews,
} from "./services/reviews.js";

console.log("🎬 CinematicVerse Backend inicializado");
