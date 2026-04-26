const EMAIL = 'alfacarlos981@gmail.com';
const USER_ID = '17671d66-20a1-4848-901b-12adf7cef4ae';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createUserInDB() {
  try {
    console.log('📝 Creando usuario en public.users...\n');

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users`,
      {
        method: 'POST',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: USER_ID,
          email: EMAIL,
          role: 'admin',
          full_name: 'Admin User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      
      // Si el error es que ya existe, actualizar
      if (data.message?.includes('duplicate') || data.code === '23505') {
        console.log('\n📝 Usuario ya existe, actualizando rol...');
        
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/users?id=eq.${USER_ID}`,
          {
            method: 'PATCH',
            headers: {
              'apiKey': SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              role: 'admin',
            }),
          }
        );

        if (updateResponse.ok) {
          console.log('✅ Usuario actualizado a admin');
        }
      }
    } else {
      console.log('✅ Usuario creado en public.users');
      console.log(`   ID: ${data[0]?.id}`);
      console.log(`   Email: ${data[0]?.email}`);
      console.log(`   Rol: ${data[0]?.role}`);
    }

    // Verificar
    console.log('\n🔍 Verificando configuración final...\n');
    
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(EMAIL)}`,
      {
        method: 'GET',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const verified = await verifyResponse.json();
    if (Array.isArray(verified) && verified.length > 0) {
      const user = verified[0];
      console.log('✅ CONFIGURACIÓN FINAL:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log('\n✅ ¡LISTO PARA LOGIN!');
      console.log('───────────────────────────────');
      console.log(`Email:       ${EMAIL}`);
      console.log(`Contraseña:  8Car9loS@50419706`);
      console.log('───────────────────────────────');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUserInDB();
