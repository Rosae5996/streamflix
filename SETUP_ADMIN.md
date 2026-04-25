# 🔐 Configurar Usuario Admin

## Opción 1: Script Automático (Recomendado)

Este script interactivo te permitirá crear un usuario admin de forma rápida y segura.

### Requisitos
- Node.js instalado
- Variables de entorno configuradas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Ejecutar el Script

```bash
npm run setup:admin
```

### Proceso
1. Te pedirá tu email de admin
2. Te pedirá una contraseña (mínimo 8 caracteres)
3. Te pedirá confirmar la contraseña
4. Te pedirá tu nombre completo (opcional)
5. Creará el usuario y mostrará las credenciales

### Ejemplo
```
🔐 StreamFlix Admin Setup

📧 Admin email: admin@example.com
🔑 Admin password: ••••••••
🔑 Confirm password: ••••••••
👤 Full name (optional): Juan Admin

⏳ Creating admin user...

✅ Auth user created
✅ Admin profile created

✅ Admin user successfully created!

📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@example.com
🔑 Password: MySecurePassword123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 You can now login at: /auth/login
📱 Access admin panel at: /admin
```

## Opción 2: Modificar Usuario Existente

Si ya tienes una cuenta de usuario regular y quieres hacerla admin:

1. Abre la consola de Supabase
2. Ve a SQL Editor
3. Ejecuta:

```sql
UPDATE users 
SET role = 'admin', subscription_status = 'premium'
WHERE email = 'tu-email@example.com';
```

## Opción 3: Supabase Dashboard

1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto
3. Abre Authentication → Users
4. Busca el usuario que quieres hacer admin
5. Ve a SQL Editor y ejecuta:

```sql
UPDATE users 
SET role = 'admin'
WHERE auth.users.email = 'email@example.com';
```

## ¿Qué Puede Hacer un Admin?

- ✅ Acceder al panel de administración (`/admin`)
- ✅ Subir películas y series
- ✅ Editar y eliminar contenido
- ✅ Gestionar secciones (Trending, Estrenos, etc.)
- ✅ Activar/desactivar modo mantenimiento
- ✅ Ver estadísticas de usuarios
- ✅ Gestionar permisos de otros usuarios

## Acceso al Panel Admin

Una vez logueado como admin:

1. URL: `http://localhost:3000/admin` (desarrollo) o tu dominio en producción
2. Verás:
   - Dashboard con estadísticas
   - Gestión de contenido
   - Gestión de usuarios
   - Configuración del sitio

## Seguridad

- Usa una contraseña fuerte (mínimo 8 caracteres)
- No compartas tus credenciales admin
- Cambia la contraseña regularmente
- El script valida automáticamente
- Las contraseñas se hashean en la BD

## Troubleshooting

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"
- Verifica que tu archivo `.env.local` existe
- Asegúrate de tener las credenciales correctas
- Ejecuta desde la raíz del proyecto

### Error: "Email already exists"
- El email ya está registrado en Supabase
- Usa otro email o elimina el usuario anterior

### Error: "Profile creation failed"
- Verifica que tu SUPABASE_SERVICE_ROLE_KEY es válido
- Asegúrate de tener permisos en la tabla users

## Notas Importantes

- El script auto-confirma el email (no se requiere verificación)
- El usuario admin se crea con suscripción premium de 1 año
- Los cambios son inmediatos en la BD
- Puedes crear múltiples admins ejecutando el script varias veces
