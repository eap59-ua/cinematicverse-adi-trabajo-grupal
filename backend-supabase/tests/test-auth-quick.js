// backend-supabase/tests/test-auth-quick.js
import { register, login, logout, getCurrentUser } from "../services/auth.js";

async function testAuth() {
  console.log("🧪 Iniciando test de autenticación...\n");

  try {
    // 1. REGISTRO
    console.log("1️⃣ Probando REGISTRO...");
    const testEmail = `test_${Date.now()}@cinematicverse.com`;
    const testPassword = "TestPassword123!";

    await register(testEmail, testPassword, "Test User");
    console.log("   ✅ Registro completado\n");

    // 2. LOGIN
    console.log("2️⃣ Probando LOGIN...");
    await login(testEmail, testPassword);
    console.log("   ✅ Login completado\n");

    // 3. USUARIO ACTUAL
    console.log("3️⃣ Obteniendo usuario actual...");
    const user = await getCurrentUser();
    console.log("   ✅ Usuario:", user?.email);
    console.log("   ✅ ID:", user?.id, "\n");

    // 4. LOGOUT
    console.log("4️⃣ Probando LOGOUT...");
    await logout();
    console.log("   ✅ Logout completado\n");

    console.log("🎉 ¡TODOS LOS TESTS PASARON! ✅");
  } catch (error) {
    console.error("❌ ERROR EN TESTS:", error.message);
    process.exit(1);
  }
}

// Ejecutar el test
testAuth();
