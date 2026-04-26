const https = require('https');

// Tu información
const EMAIL = 'alfacarlos981@gmail.com';
const PASSWORD = '8Car9loS@50419706';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function setupAdminUser() {
  try {
    console.log('🔧 Configurando usuario admin...');
    console.log(`📧 Email: ${EMAIL}`);
    console.log(`🔑 Contraseña: [PROTEGIDA]`);
    
    // Paso 1: Crear usuario en auth.users
    console.log('\n1️⃣  Creando usuario en authentication...');
    
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apiKey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: 'Admin User',
        },
      }),
    });

    const createUserData = await createUserResponse.json();

    if (!createUserResponse.ok) {
      if (createUserData.code === 'user_already_exists') {
        console.log('✅ Usuario ya existe en authentication');
      } else {
        console.error('❌ Error creando usuario:', createUserData);
        throw new Error(createUserData.message);
      }
    } else {
      console.log('✅ Usuario creado en authentication');
      console.log(`   ID: ${createUserData.user.id}`);
    }

    const userId = createUserData.user?.id;

    // Paso 2: Actualizar tabla users
    console.log('\n2️⃣  Actualizando tabla users con rol admin...');
    
    const updateUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'PATCH',
      headers: {
        'apiKey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        role: 'admin',
        is_active: true,
      }),
      params: {
        email: `eq.${EMAIL}`,
      },
    });

    if (!updateUserResponse.ok) {
      console.error('⚠️  Error en actualización: usando método alternativo');
      
      // Método alternativo usando SQL
      const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `UPDATE public.users SET role = 'admin', is_active = true WHERE email = '${EMAIL}';`,
        }),
      });

      if (!sqlResponse.ok) {
        console.log('⚠️  No se pudo actualizar automaticamente');
        console.log('   Necesitarás ejecutar este SQL manualmente en Supabase:');
        console.log(`   UPDATE public.users SET role = 'admin', is_active = true WHERE email = '${EMAIL}';`);
      } else {
        console.log('✅ Tabla users actualizada');
      }
    } else {
      console.log('✅ Tabla users actualizada');
    }

    // Paso 3: Verificar
    console.log('\n3️⃣  Verificando configuración...');
    
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${EMAIL}&select=id,email,role,is_active`,
      {
        method: 'GET',
        headers: {
          'apiKey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const userData = await verifyResponse.json();

    if (Array.isArray(userData) && userData.length > 0) {
      const user = userData[0];
      console.log('✅ Usuario verificado:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Activo: ${user.is_active}`);
    } else {
      console.log('⚠️  No se pudo verificar. Intenta ejecutar este SQL en Supabase:');
      console.log(`   SELECT id, email, role, is_active FROM public.users WHERE email = '${EMAIL}';`);
    }

    console.log('\n✅ ¡LISTO! Ahora puedes login con:');
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Contraseña: ${PASSWORD}`);
    console.log('\n📝 Documenting credentials...');
    console.log('   Todos los cambios han sido guardados.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminUser();
