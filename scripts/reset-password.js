const EMAIL = 'alfacarlos981@gmail.com';
const PASSWORD = '8Car9loS@50419706';
const USER_ID = '17671d66-20a1-4848-901b-12adf7cef4ae';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function resetPassword() {
  try {
    console.log('🔐 Reseteando contraseña del usuario...\n');

    // Usar admin API para actualizar la contraseña
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`,
      {
        method: 'PUT',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          password: PASSWORD,
          email_confirm: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      throw new Error(data.message);
    }

    console.log('✅ Contraseña reseteada exitosamente\n');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ AHORA SÍ ESTÁ TODO LISTO');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📧 Email:       ' + EMAIL);
    console.log('🔑 Contraseña:  ' + PASSWORD);
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('👉 ABRE TU APP Y HAZ LOGIN AHORA');
    console.log('');
    console.log('Si aún da error:');
    console.log('1. Borra cookies (Ctrl+Shift+Del)');
    console.log('2. Intenta en navegador privado');
    console.log('3. Recarga la página (Ctrl+F5)');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetPassword();
