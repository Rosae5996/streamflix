const EMAIL = 'alfacarlos981@gmail.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

async function updateUserRole() {
  try {
    console.log('🔧 Actualizando rol de usuario a admin...');
    console.log(`📧 Email: ${EMAIL}\n`);

    // Actualizar el rol usando PATCH
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(EMAIL)}`,
      {
        method: 'PATCH',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          role: 'admin',
          is_active: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error en respuesta:', response.status);
      console.error('Detalles:', error);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Usuario actualizado correctamente!\n');

    if (Array.isArray(data) && data.length > 0) {
      const user = data[0];
      console.log('📋 Configuración actual:');
      console.log(`   Email:    ${user.email}`);
      console.log(`   Rol:      ${user.role}`);
      console.log(`   Activo:   ${user.is_active}`);
      console.log(`   ID:       ${user.id}`);
    }

    console.log('\n✅ ¡LISTO PARA LOGIN!');
    console.log('───────────────────────────────');
    console.log(`Email:       ${EMAIL}`);
    console.log(`Contraseña:  8Car9loS@50419706`);
    console.log('───────────────────────────────');
    console.log('\n👉 Abre tu app y prueba acceso con estas credenciales');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUserRole();
