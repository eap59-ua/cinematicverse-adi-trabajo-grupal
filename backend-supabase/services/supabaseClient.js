// backend-supabase/services/supabaseClient.js
/**
 * Cliente singleton de Supabase
 * Este archivo crea una única instancia del cliente Supabase
 * que se comparte en toda la aplicación
 */

import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../config/supabase.config.js";

// Crear el cliente Supabase con la configuración
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true, // Refrescar token automáticamente
      persistSession: true, // Mantener sesión en localStorage
      detectSessionInUrl: true, // Detectar sesión en URL (OAuth)
    },
  },
);

// Log de verificación (opcional, para debugging)
console.log("✅ Cliente Supabase inicializado correctamente");
