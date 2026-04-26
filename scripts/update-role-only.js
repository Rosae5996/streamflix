const EMAIL = 'alfacarlos981@gmail.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function updateRole() {
  try {
    console.log('🔧 Actualizando rol a admin...\n');

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
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.message || data);
      throw new Error('No se pudo actualizar');
    }

    console.log('✅ ¡Rol actualizado a ADMIN!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:       alfacarlos981@gmail.com');
    console.log('🔑 Contraseña:  8Car9loS@50419706');
    console.log('👤 Rol:         ADMIN');
    console.log('✅ Estado:      LISTO');
    console.log('═══════════════════════════════════════');
    console.log('\n👉 Abre tu app y haz login ahora');
    console.log('   https://tu-proyecto.vercel.app/auth/login');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateRole();
