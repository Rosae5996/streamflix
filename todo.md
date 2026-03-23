# StreamFlix - TODO

## Fase 1: Base de datos y esquema
- [x] Esquema completo: users, profiles, site_settings, subscription_plans
- [x] Esquema: categories, content, seasons, episodes
- [x] Esquema: videos (calidades), subtitles, ads, watch_history, watchlist
- [x] Migración SQL aplicada a la base de datos

## Fase 2: Tema y layouts
- [x] Tema cinematográfico oscuro con acento rojo en index.css
- [x] Layout principal con navbar Netflix-style
- [x] Layout del panel de administración con sidebar
- [x] Configuración de rutas en App.tsx

## Fase 3: Autenticación y perfiles
- [x] Autenticación con Manus OAuth
- [x] Gestión de sesiones con JWT
- [x] Perfil de usuario (cambiar nombre, email)
- [x] Middleware de protección de rutas admin (adminProcedure)

## Fase 4: Panel Admin - Configuración
- [x] Página de configuración del sitio (nombre, logo, color, layout)
- [x] Gestión de planes de suscripción (precios USD/MXN, características)
- [x] Toggle de modo mantenimiento
- [x] Página de modo mantenimiento para usuarios

## Fase 5: Panel Admin - Contenido
- [x] Gestión de categorías y subcategorías
- [x] Gestión de películas (CRUD completo)
- [x] Gestión de series con temporadas y episodios
- [x] Subida de videos con múltiples calidades
- [x] Gestión de subtítulos y audio

## Fase 6: Panel Admin - Usuarios y Anuncios
- [x] Lista de usuarios con roles y estado
- [x] Cambiar rol, banear/desbanear usuarios
- [x] Ver historial de visualización por usuario
- [x] Gestión de anuncios con timestamps
- [x] Asignación de anuncios por plan de suscripción

## Fase 7: Dashboard de Usuario
- [x] Página principal con hero banner
- [x] Catálogo filtrable por películas/series/categorías
- [x] Tarjetas de contenido con trailer inline al hover
- [x] Página de detalle de película/serie
- [x] Página de detalle de serie con temporadas/episodios

## Fase 8: Reproductor de Video
- [x] Reproductor HTML5 personalizado
- [x] Selector de calidad de video
- [x] Selector de subtítulos
- [x] Selector de idioma de audio
- [x] Sistema de anuncios por timestamp
- [x] Registro de progreso de visualización

## Fase 9: Watchlist, Historial y Suscripciones
- [x] Página de watchlist personal
- [x] Página de historial de visualización
- [x] Página de planes de suscripción
- [x] Integración de checkout PayPal (redirect a PayPal con plan ID)
- [x] Gestión de suscripción activa del usuario

## Fase 10: Entrega
- [x] 24 pruebas unitarias con vitest (todas pasan)
- [x] Checkpoint guardado
- [x] Entrega al usuario

## Pendiente / Mejoras futuras
- [ ] Configurar PayPal Client ID para checkout nativo embebido
- [ ] Webhook de PayPal para activar suscripciones automáticamente
- [ ] Notificaciones push para nuevos contenidos
- [ ] Búsqueda avanzada con filtros adicionales
- [ ] Recomendaciones personalizadas basadas en historial


## Fase 11: Supabase Auth con Google y Apple OAuth
- [x] Integrar Supabase Auth en el proyecto
- [x] Configurar OAuth de Google
- [x] Configurar OAuth de Apple
- [x] Página de login con opciones Google/Apple/Email
- [x] Página de registro con opciones Google/Apple/Email
- [x] Gestión de sesiones con Supabase
- [x] Hook useSupabaseAuth para manejar autenticación
- [x] Página de callback para OAuth
- [x] Crear cuenta admin predeterminada (admin@streamflix.local)

## Fase 12: Modelo Gratis con Social Media
- [x] Agregar campos en site_settings para URLs de Instagram/TikTok
- [x] Admin puede activar/desactivar modo gratis vs PayPal
- [x] Modal de seguir redes sociales antes de ver contenido
- [x] Botones con links a Instagram/TikTok
- [x] Lógica para mostrar modal según configuración
- [x] AdminSettings mejorado con campos de redes sociales
- [x] Integración del modal en el reproductor de video

## Fase 13: Sistema de Roles Mejorado
- [x] Solo propietario puede crear cuentas admin
- [x] Admin creado con email + contraseña predeterminada
- [x] Admin no puede crear otros admins
- [x] Admin no puede cambiar su propio rol
- [x] Script de setup para crear admin automáticamente

## Fase 14: Animaciones y Estilo Visual
- [x] Transiciones suaves entre páginas
- [x] Hover effects mejorados en tarjetas
- [x] Scroll animations
- [x] Loading skeletons animados
- [x] Mejores gradientes y efectos visuales
- [x] Mejor tipografía y espaciado
- [x] Mejor responsive design en móvil
- [x] Archivo animations.css con 15+ animaciones
- [x] Mejora de ContentCard con glow effect y botones mejorados
