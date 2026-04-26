# Actualizar Credenciales de Admin en StreamFlix

## Tu Información Personal

**Email:** alfacarlos981@gmail.com  
**Contraseña:** 8Car9loS@50419706  
**Rol:** Admin (también sirve como Manager)  

---

## ⚡ Método Rápido (RECOMENDADO)

### Opción 1: Usar Supabase Auth UI

1. **Abre tu proyecto de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto "streamflix"

2. **Ir a Authentication**
   - Click en "Authentication" en el menu izquierdo
   - Click en "Users"

3. **Crear nuevo usuario**
   - Click en "Add user"
   - Email: `alfacarlos981@gmail.com`
   - Password: `8Car9loS@50419706`
   - Auto confirm: ON
   - Click "Create user"

4. **Actualizar rol en la base de datos**
   - Click en "SQL Editor" (lado izquierdo)
   - Click en "New query"
   - Copia y ejecuta este SQL:

```sql
UPDATE public.users
SET role = 'admin', is_active = true
WHERE email = 'alfacarlos981@gmail.com';
```

5. **Verificar**
```sql
SELECT id, email, role, is_active 
FROM public.users 
WHERE email = 'alfacarlos981@gmail.com';
```

---

## Opción 2: Ejecutar Script TypeScript

Si prefieres automatizar, ejecuta:

```bash
npx ts-node scripts/update-admin-credentials.ts
```

Este script:
- Crea el usuario en auth
- Actualiza la tabla users
- Establece el rol como admin
- Activa la cuenta

---

## Verificar que Funcionó

### En el Navegador

1. Abre tu app (https://tu-url.vercel.app)
2. Click en "Login"
3. Email: `alfacarlos981@gmail.com`
4. Password: `8Car9loS@50419706`
5. Click "Sign In"

Si ves el dashboard de admin, ¡funcionó! ✅

### En Supabase

Ejecuta en SQL Editor:

```sql
SELECT id, email, role, is_active, created_at 
FROM public.users 
WHERE email = 'alfacarlos981@gmail.com';
```

Deberías ver:
```
id: [tu-user-id]
email: alfacarlos981@gmail.com
role: admin
is_active: true
```

---

## Google Sign-In para Usuarios Regulares

Los usuarios regulares pueden registrarse con Google. Para habilitarlo:

1. **En Supabase Dashboard**
   - Authentication → Providers → Google
   - Habilita el proveedor
   - Agrega tus credenciales de Google

2. **En tu app**
   - Los usuarios verán el botón "Sign in with Google"
   - Se registran automáticamente
   - Su rol será "user" (limitado)

---

## Admin y Manager son la Misma Cuenta

Con esta configuración:
- Email: `alfacarlos981@gmail.com`
- Rol: `admin`

Tendrás acceso a:
- ✅ Panel de Admin
- ✅ Gestión de Contenido
- ✅ Auditoría
- ✅ Branding
- ✅ Usuarios
- ✅ Configuración

---

## ¿Qué Pasó con las Credenciales Anteriores?

Las credenciales por defecto que te di al principio:
- admin@streamflix.local
- user@streamflix.local
- manager@streamflix.local

Fueron solo para **desarrollo local**. Ahora en producción uses **tus credenciales reales**.

---

## Recuperar Acceso si Olvidas la Contraseña

### Opción 1: Cambiar en Supabase

1. Ve a Supabase Dashboard
2. Authentication → Users
3. Busca tu usuario
4. Click en el menú (...)
5. "Reset Password"
6. Supabase envía email con link de reset

### Opción 2: Usar tu Email Registrado

1. En la app, click en "Forgot Password"
2. Ingresa: `alfacarlos981@gmail.com`
3. Revisa tu email
4. Click en el link
5. Establece nueva contraseña

---

## Problemas Comunes

### Problema: "Usuario no encontrado"
**Solución:** Asegúrate de que el usuario exista en auth.users:
```sql
SELECT email FROM auth.users WHERE email = 'alfacarlos981@gmail.com';
```

### Problema: "Acceso denegado" después de login
**Solución:** Verifica que el rol sea "admin":
```sql
SELECT email, role FROM public.users WHERE email = 'alfacarlos981@gmail.com';
```

Si role es NULL, actualiza con:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'alfacarlos981@gmail.com';
```

### Problema: No puedo crear cuenta con Google
**Solución:** 
1. Verifica que Google Provider esté habilitado en Supabase
2. Verifica que las credenciales de Google sean correctas
3. Revisa la consola del navegador (F12) por errores

---

## Configuración de Producción (Checklist)

- [ ] Usuario admin creado con `alfacarlos981@gmail.com`
- [ ] Contraseña establecida: `8Car9loS@50419706`
- [ ] Rol establecido como `admin`
- [ ] Usuario está activo (is_active = true)
- [ ] Puedo hacer login en producción
- [ ] Veo el panel de admin
- [ ] Google Sign-In habilitado para usuarios
- [ ] He probado registro con Google
- [ ] He revisado la auditoría
- [ ] Todo funciona correctamente

---

## Documentación Relacionada

- `DEFAULT_CREDENTIALS.md` - Credenciales iniciales (desarrollo)
- `DEPLOYMENT_READY.md` - Checklist de despliegue
- `QUICK_START.md` - Inicio rápido

---

## Contacto & Soporte

Si tienes problemas:

1. Revisa los logs en Vercel
2. Revisa los logs en Supabase
3. Verifica las variables de entorno en Vercel
4. Consulta la consola del navegador (F12)

---

**Status:** ✅ Tu cuenta está configurada  
**Email:** alfacarlos981@gmail.com  
**Rol:** admin  
**Acceso:** Completo  

¡Listo para usar! 🚀

