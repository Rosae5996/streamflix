# StreamFlix - Plataforma de Streaming Premium

Una plataforma de streaming tipo Netflix construida con Next.js 16, Supabase, Cloudflare R2 y PayPal.

## 🚀 Características Principales

### Para Usuarios
- Autenticación segura con Supabase
- Exploración de películas y series
- Suscripciones premium con PayPal
- Perfil personal y favoritos
- Historial de visualización

### Para Administradores
- Dashboard completo de administración
- CRUD para contenido (películas/series)
- Subida de archivos a Cloudflare R2
- Gestión de secciones dinámicas
- Modo mantenimiento
- Gestión de usuarios

## 📋 Requisitos Previos

- Node.js 18+
- Supabase (base de datos y autenticación)
- Cloudflare R2 (almacenamiento de videos)
- PayPal (procesamiento de pagos)

## 🔧 Configuración Inicial

### 1. Clonar y Instalar Dependencias

```bash
git clone <tu-repo>
cd streamflix
pnpm install
```

### 2. Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completa las variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=your-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret
CLOUDFLARE_R2_ENDPOINT=your-endpoint
CLOUDFLARE_R2_BUCKET_NAME=your-bucket
CLOUDFLARE_R2_PUBLIC_URL=your-public-url

# PayPal
PAYPAL_CLIENT_ID=your-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_PRODUCT_ID=your-product
PAYPAL_PLAN_MONTHLY_ID=your-plan
PAYPAL_PLAN_ANNUAL_ID=your-plan
PAYPAL_WEBHOOK_ID=your-webhook
NEXT_PUBLIC_PAYPAL_MODE=sandbox
```

### 3. Crear Usuario Admin

```bash
npm run setup:admin
```

Sigue el asistente interactivo para crear tus credenciales de admin.

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📚 Documentación

- `SETUP_ADMIN.md` - Configurar usuario administrador
- `SECURITY.md` - Información de seguridad
- `SECURITY_IMPROVEMENTS.md` - Mejoras de seguridad implementadas
- `SECURITY_CHECKLIST.md` - Checklist de seguridad

## 🗂️ Estructura del Proyecto

```
streamflix/
├── app/
│   ├── auth/              # Login y registro
│   ├── admin/             # Panel de administración
│   ├── dashboard/         # Dashboard de usuario
│   ├── browse/            # Exploración de contenido
│   ├── pricing/           # Planes de suscripción
│   ├── api/
│   │   ├── upload/        # Upload a R2
│   │   ├── paypal/        # Webhooks de PayPal
│   │   └── maintenance/   # Estado de mantenimiento
│   └── landing/           # Landing page
├── components/
│   ├── auth/              # Formularios de autenticación
│   ├── admin/             # Componentes del admin
│   ├── content/           # Componentes de contenido
│   ├── layout/            # Layout y header
│   └── pricing/           # Componentes de pricing
├── lib/
│   ├── supabase/          # Clients de Supabase
│   ├── schemas/           # Validación con Zod
│   ├── security/          # Seguridad (sanitizer, rate limiter, audit)
│   ├── hooks/             # Custom hooks
│   └── context/           # Context providers
└── scripts/
    ├── setup-admin.js     # Setup inicial de admin
    ├── security-check.js  # Verificación de seguridad
    └── 01_init_database.sql # Migración de BD
```

## 🔐 Seguridad

StreamFlix implementa múltiples capas de seguridad:

- ✅ Content Security Policy (CSP)
- ✅ HSTS y X-Frame-Options
- ✅ Validación con Zod
- ✅ Sanitización de input
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Row Level Security en Supabase
- ✅ Webhooks firmados

Ver `SECURITY.md` para detalles completos.

## 📱 Rutas Principales

### Públicas
- `/` - Inicio
- `/landing` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registro
- `/pricing` - Planes de suscripción
- `/content/[id]` - Detalle de contenido

### Autenticadas
- `/dashboard` - Dashboard personal
- `/browse` - Exploración de catálogo
- `/account/profile` - Perfil de usuario
- `/payment/success` - Confirmación de pago

### Solo Admin
- `/admin` - Dashboard admin
- `/admin/content` - Gestión de contenido
- `/admin/content/new` - Crear contenido
- `/admin/content/[id]/edit` - Editar contenido
- `/admin/users` - Gestión de usuarios
- `/admin/settings` - Configuración

## 🔄 Workflow de Admin

### Agregar Película/Serie

1. Ve a `/admin/content`
2. Haz clic en "Nuevo Contenido"
3. Completa los detalles:
   - Título, descripción, tipo
   - Géneros, calificación, año
   - Director, elenco
4. Sube archivos:
   - Carátula (imagen)
   - Video principal (MP4)
   - Trailer (MP4)
5. Publica el contenido

### Activar Modo Mantenimiento

1. Ve a `/admin/settings`
2. Activa "Modo Mantenimiento"
3. Los usuarios verán una página de mantenimiento
4. El admin puede seguir accediendo

## 🚀 Deployment

### Vercel

1. Sube a GitHub
2. Conecta en [vercel.com](https://vercel.com)
3. Agrega variables de entorno
4. Deploy automático

### Self-hosted

```bash
npm run build
npm run start
```

## 📊 Base de Datos

### Tablas Principales

- `users` - Usuarios con roles (admin/user)
- `content` - Películas y series
- `sections` - Secciones (Trending, Estrenos, etc.)
- `paypal_subscriptions` - Historial de suscripciones
- `viewing_history` - Historial de reproducción
- `favorites` - Películas/series favoritas

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start

# Verificación de seguridad
npm run security:check

# Crear usuario admin
npm run setup:admin

# Linter
npm run lint
```

## 🐛 Troubleshooting

### "401 Unauthorized" en admin
- Verifica que eres admin en Supabase: `SELECT role FROM users WHERE id = 'tu-id'`
- Si no, ejecuta: `npm run setup:admin`

### Upload falla
- Verifica variables de Cloudflare R2
- Comprueba límites de tamaño (100MB videos, 10MB imágenes)
- Revisa los logs de rate limiting

### PayPal no funciona
- Usa `sandbox` mode para testing
- Verifica credenciales en PayPal Dashboard
- Comprueba webhook en Supabase

## 📧 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

**Creado con ❤️ usando Next.js 16, Supabase, Cloudflare R2 y PayPal**
