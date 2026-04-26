const EMAIL = 'alfacarlos981@gmail.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkAuth() {
  try {
    console.log('🔍 Verificando estado de autenticación...\n');
    
    // Obtener usuario de auth.users
    const authResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        method: 'GET',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );

    const users = await authResponse.json();
    const user = users.users?.find(u => u.email === EMAIL);

    if (user) {
      console.log('✅ Usuario encontrado en auth.users');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Email Confirmed: ${user.email_confirmed}`);
      console.log(`   Status: ${user.user_metadata?.status || 'N/A'}`);
    } else {
      console.log('❌ Usuario NO encontrado en auth.users');
      console.log('   Necesita ser creado');
    }

    // Obtener usuario de public.users
    console.log('\n🔍 Verificando tabla public.users...\n');
    
    const dbResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(EMAIL)}`,
      {
        method: 'GET',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const dbUsers = await dbResponse.json();
    
    if (Array.isArray(dbUsers) && dbUsers.length > 0) {
      const dbUser = dbUsers[0];
      console.log('✅ Usuario encontrado en public.users');
      console.log(`   ID: ${dbUser.id}`);
      console.log(`   Email: ${dbUser.email}`);
      console.log(`   Rol: ${dbUser.role}`);
    } else {
      console.log('❌ Usuario NO encontrado en public.users');
      console.log('   Necesita ser creado');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAuth();
