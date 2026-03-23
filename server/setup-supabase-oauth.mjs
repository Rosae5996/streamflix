import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Faltan credenciales de Supabase");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupOAuth() {
  try {
    console.log("🔧 Configurando Supabase...");

    // Crear usuario admin predeterminado
    console.log("👤 Creando cuenta admin predeterminada...");
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@streamflix.local",
      password: "Admin123!@#",
      email_confirm: true,
      user_metadata: {
        role: "admin",
        name: "Administrador",
      },
    });

    if (adminError) {
      if (adminError.message.includes("already exists")) {
        console.log("✅ Cuenta admin ya existe");
      } else {
        console.error("❌ Error creando admin:", adminError.message);
      }
    } else {
      console.log("✅ Cuenta admin creada:");
      console.log(`   Email: admin@streamflix.local`);
      console.log(`   Contraseña: Admin123!@#`);
      console.log(`   ⚠️  IMPORTANTE: Cambia la contraseña en el primer login`);
    }

    // Crear tabla de perfiles si no existe
    console.log("📊 Verificando tabla de perfiles...");
    const { error: profileError } = await supabase.from("profiles").select("id").limit(1);

    if (profileError && profileError.code === "PGRST116") {
      console.log("📝 Creando tabla profiles...");
      const { error: createError } = await supabase.rpc("create_profiles_table", {});
      if (createError) {
        console.log("⚠️  Tabla profiles podría necesitar creación manual en Supabase");
      }
    } else if (!profileError) {
      console.log("✅ Tabla profiles existe");
    }

    console.log("\n✅ Configuración de Supabase completada");
    console.log("\n📋 Próximos pasos:");
    console.log("1. Ve a Supabase Dashboard → Authentication → Providers");
    console.log("2. Activa Google OAuth");
    console.log("3. Activa Apple OAuth");
    console.log("4. Configura los Redirect URLs a: https://tudominio.com/auth/callback");
    console.log("\n🔐 Credenciales de admin:");
    console.log("   Email: admin@streamflix.local");
    console.log("   Contraseña: Admin123!@#");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupOAuth();
