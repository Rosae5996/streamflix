# Security Guidelines for StreamFlix

## Overview
Este documento describe las medidas de seguridad implementadas en la plataforma StreamFlix.

## Implementaciones de Seguridad

### 1. Headers de Seguridad
Configurados en el middleware (`middleware.ts`):
- **X-Content-Type-Options**: Previene MIME type sniffing
- **X-Frame-Options**: Previene clickjacking (DENY)
- **X-XSS-Protection**: Protección contra XSS
- **Content-Security-Policy**: Whitelist de recursos permitidos
- **Strict-Transport-Security**: Fuerza HTTPS (1 año)
- **Referrer-Policy**: Controla información de referencia
- **Permissions-Policy**: Deshabilita características de navegador innecesarias

### 2. Validación de Entrada (Zod)
Todos los formularios y APIs usan esquemas Zod:
- Login/Register: validación de email, contraseña, nombre
- Contenido: validación de tipo, tamaño, formato
- Uploads: validación de tipo de archivo y tamaño

**Archivos de esquemas:**
- `lib/schemas/auth.ts` - Autenticación
- `lib/schemas/content.ts` - Contenido y uploads

### 3. Sanitización de Datos
Funciones de seguridad en `lib/security/sanitizer.ts`:
- `sanitizeHTML()` - Elimina código malicioso de HTML
- `sanitizeInput()` - Limpia entrada de usuario
- `sanitizeEmail()` - Normaliza y valida emails
- `removeSensitiveData()` - Oculta datos sensibles en logs

### 4. Rate Limiting
Implementado en `lib/security/rate-limiter.ts`:
- Protege endpoints de login/registro
- Limita uploads a 20 por 15 minutos
- Configurable por ruta

**Uso:**
```typescript
const { allowed } = checkRateLimit('ip:action', 10, 60000)
if (!allowed) return 429
```

### 5. Audit Logging
Sistema completo en `lib/security/audit-logger.ts`:
- LOGIN/LOGOUT
- CONTENT_CREATED/UPDATED/DELETED
- FILE_UPLOADED
- FAILED_AUTH
- UNAUTHORIZED_ACCESS
- SUBSCRIPTION_CREATED

**Uso:**
```typescript
await logAuditEvent(AuditEventType.LOGIN, {
  userId: user.id,
  ipAddress: request.ip,
  status: 'success'
})
```

### 6. Autenticación
- Supabase Auth con Row Level Security (RLS)
- Roles (admin/user) en tabla users
- Middleware protege rutas /admin y /account
- JWT tokens con expiración

### 7. Autorización
- Middleware verifica rol admin para /admin/*
- RLS policies en tablas
- Validación de usuario en APIs
- Logging de intentos no autorizados

### 8. CORS y Seguridad de API
- APIs validan usuario autenticado
- Rate limiting en uploads
- Validación de Content-Type
- Límites de tamaño de archivo

### 9. Manejo de Archivos
- Validación de tipo MIME
- Límites de tamaño (100MB videos, 10MB imágenes)
- Almacenamiento en Cloudflare R2 (externo)
- Generación de nombres únicos
- Escaneo de malware recomendado

### 10. Secretos y Variables de Entorno
- Nunca comitear credenciales
- Usar .env.local para desarrollo
- Agregar variables en Vercel Settings
- Secretos necesarios:
  - CLOUDFLARE_R2_* (Storage)
  - PAYPAL_* (Payments)
  - SUPABASE_* (Database)

## Mejoras Futuras

### Recomendadas para Producción:
1. **Upstash Redis** para rate limiting distribuido
2. **Email verification** para nuevas cuentas
3. **2FA (Two-Factor Authentication)** para admins
4. **Password reset** con token seguro
5. **IP whitelisting** para admin panel
6. **DDoS protection** (Cloudflare)
7. **WAF (Web Application Firewall)**
8. **Logging centralizado** (Sentry, etc)
9. **Backup automático** de BD
10. **Encryption at rest** para datos sensibles

## Testing de Seguridad

### Manual:
- Intentar acceso sin autenticación
- Inyección de código en formularios
- Bypass de validación del lado del cliente
- Rate limiting exhaustivo
- Cambio de headers manualmente

### Herramientas:
```bash
# OWASP ZAP
# Burp Suite
# npm audit
npm audit

# Verificar dependencias
pnpm audit
```

## Incident Response

Si encuentras una vulnerabilidad:
1. NO la publiques públicamente
2. Contacta a admin@streamflix.com (confidencial)
3. Proporciona detalles del exploit
4. Espera confirmación (48h típicamente)
5. Coordina disclosure

## Checklist de Deployment

- [ ] Todas las variables de entorno configuradas
- [ ] npm audit pasa sin vulnerabilidades críticas
- [ ] CSP headers validados
- [ ] HTTPS habilitado
- [ ] Database backups configurados
- [ ] Monitoring y alertas activas
- [ ] Plan de disaster recovery listo
- [ ] Audit logging funcionando
- [ ] Rate limiting en producción
- [ ] Cloudflare DDoS protection activo
