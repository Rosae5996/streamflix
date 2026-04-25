const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) =>
  new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

async function setupAdmin() {
  console.log('\n🔐 StreamFlix Admin Setup\n');
  console.log('This script will create an admin user in your Supabase project.\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
    console.error('Please set these environment variables and try again.\n');
    rl.close();
    process.exit(1);
  }

  const adminEmail = await question('📧 Admin email: ');
  const adminPassword = await question('🔑 Admin password: ');
  const confirmPassword = await question('🔑 Confirm password: ');

  if (adminPassword !== confirmPassword) {
    console.error('\n❌ Passwords do not match!\n');
    rl.close();
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('\n❌ Password must be at least 8 characters long!\n');
    rl.close();
    process.exit(1);
  }

  const adminFullName = await question('👤 Full name (optional): ');

  try {
    console.log('\n⏳ Creating admin user...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Auth creation failed:', authError.message);
      rl.close();
      process.exit(1);
    }

    const userId = authData.user.id;
    console.log('✅ Auth user created');

    // Create user profile with admin role
    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      email: adminEmail,
      full_name: adminFullName || null,
      role: 'admin',
      subscription_status: 'premium',
      subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      rl.close();
      process.exit(1);
    }

    console.log('✅ Admin profile created');
    console.log('\n✅ Admin user successfully created!\n');
    console.log('📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 You can now login at: /auth/login');
    console.log('📱 Access admin panel at: /admin\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

setupAdmin();
