-- Script para actualizar credenciales de Admin en Supabase
-- Ejecuta esto en el SQL Editor de Supabase

-- Primero, obtener el user_id desde auth.users
-- Reemplaza 'alfacarlos981@gmail.com' con tu correo

-- 1. Crear o actualizar usuario en auth.users (hacer esto en Auth UI de Supabase)
-- Email: alfacarlos981@gmail.com
-- Password: 8Car9loS@50419706

-- 2. Una vez creado, ejecutar este SQL:

-- Actualizar usuario existente en tabla users
UPDATE public.users
SET 
  email = 'alfacarlos981@gmail.com',
  full_name = 'Administrador',
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'alfacarlos981@gmail.com';

-- Si el usuario no existe, insertar
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT
  id,
  'alfacarlos981@gmail.com',
  'Administrador',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'alfacarlos981@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- Verificar que se actualizó correctamente
SELECT id, email, role, is_active FROM public.users WHERE email = 'alfacarlos981@gmail.com';
