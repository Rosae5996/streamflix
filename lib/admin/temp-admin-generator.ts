import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface TempAdminCredentials {
  id: string
  email: string
  temporaryPassword: string
  fullName?: string
  expiresAt: Date
  createdAt: Date
}

export async function generateTempAdminCredentials(
  email: string,
  fullName?: string
): Promise<TempAdminCredentials> {
  const supabase = await createServerSupabaseClient()

  // Generate temporary password (16 chars, mix of uppercase, lowercase, numbers, symbols)
  const tempPassword = generateSecurePassword()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: Only authenticated users can generate admin credentials')
  }

  // Insert temporary credentials
  const { data, error } = await supabase
    .from('temp_admin_credentials')
    .insert({
      email,
      temporary_password: tempPassword,
      full_name: fullName,
      created_by: user.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to generate credentials: ${error.message}`)
  }

  return {
    id: data.id,
    email: data.email,
    temporaryPassword: tempPassword,
    fullName: data.full_name,
    expiresAt: new Date(data.expires_at),
    createdAt: new Date(data.created_at),
  }
}

export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill rest randomly
  for (let i = password.length; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

export async function markTempCredentialsAsUsed(
  email: string,
  userId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('temp_admin_credentials')
    .update({
      used: true,
      used_at: new Date(),
    })
    .eq('email', email)

  if (error) {
    throw new Error(`Failed to mark credentials as used: ${error.message}`)
  }
}

export async function getTempCredentialsForEmail(email: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('temp_admin_credentials')
    .select('*')
    .eq('email', email)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    throw new Error(`Failed to fetch credentials: ${error.message}`)
  }

  return data
}
