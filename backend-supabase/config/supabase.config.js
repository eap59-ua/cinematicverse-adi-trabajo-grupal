// backend-supabase/config/supabase.config.js
import "dotenv/config";

/**
 * Configuracion de Supabase usando variables de entorno
 * Las credenciales se cargan desde el archivo .env
 */
export const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
};

// Validacion de que las variables estan configuradas
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  console.error("❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY");
  console.error("   Crea un archivo .env basandote en .env.example");
}
