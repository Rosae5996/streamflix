# 🎬 StreamFlix - Plataforma de Streaming Completa

StreamFlix es una plataforma de streaming de video full-stack con panel de administración, sistema de suscripciones, reproductor avanzado y aplicación móvil nativa.

## 🚀 Características

### 🌐 Aplicación Web
- ✅ **Autenticación**: Supabase Auth (Email, Google, Apple OAuth)
- ✅ **Panel de Administración**: Configuración del sitio, planes, contenido, usuarios, anuncios
- ✅ **Catálogo de Contenido**: Películas, series, temporadas, episodios, trailers
- ✅ **Reproductor Avanzado**: Calidad múltiple, subtítulos, idiomas de audio, anuncios por timestamp
- ✅ **Suscripciones**: Integración PayPal o modelo gratis con redes sociales
- ✅ **Watchlist y Historial**: Seguimiento personal de visualización
- ✅ **Tema Oscuro**: Diseño cinematográfico tipo Netflix con acento rojo
- ✅ **Responsivo**: Optimizado para móvil, tablet y desktop

### 📱 Aplicación Móvil
- ✅ **React Native + Expo**: Funciona en Android e iOS
- ✅ **Autenticación Supabase**: Sincronización con cuenta web
- ✅ **Navegación con Tabs**: Home, Explorar, Mi Lista, Perfil
- ✅ **Reproductor de Video**: Controles completos, calidad adaptable
- ✅ **Búsqueda y Filtrado**: Descubrimiento de contenido
- ✅ **Watchlist**: Gestión de películas favoritas

## 📋 Requisitos Previos

### Para la aplicación web:
- Node.js 18+
- npm o pnpm
- Supabase (cuenta gratuita)
- PayPal Developer (opcional)

### Para la aplicación móvil:
- Node.js 18+
- npm
- Expo CLI
- Cuenta de Expo (gratuita)
- EAS CLI (para compilación)

## 🛠️ Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/Rosae5996/streamflix.git
cd streamflix
\`\`\`

### 2. Configurar la aplicación web

\`\`\`bash
cd client
npm install
\`\`\`

Crear archivo \`.env.local\`:
\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_TITLE=StreamFlix
\`\`\`

### 3. Configurar la aplicación móvil

\`\`\`bash
# En otra terminal
cd streamflix-mobile
npm install
\`\`\`

## 🚀 Desarrollo

### Ejecutar la aplicación web

\`\`\`bash
cd client
npm run dev
\`\`\`

Abre http://localhost:5173

### Ejecutar la aplicación móvil en Expo Go

\`\`\`bash
cd streamflix-mobile
npm start
\`\`\`

Escanea el código QR con la app Expo Go en tu celular.

## 📦 Compilación

### Compilar APK para Android desde Termux

\`\`\`bash
# En Termux
pkg update -y && pkg upgrade -y
pkg install -y nodejs npm
git clone https://github.com/Rosae5996/streamflix.git
cd streamflix/streamflix-mobile
npm install
npm install -g eas-cli
export EXPO_TOKEN="your-expo-token"
eas build --platform android --wait
\`\`\`

El APK se descargará en \`~/storage/downloads/\`

## 📱 Credenciales de Administrador

**Email:** \`admin@streamflix.local\`
**Contraseña:** \`Admin123!@#\`

⚠️ **Cambia estas credenciales en tu primer login por seguridad**

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth
- ✅ JWT para sesiones
- ✅ Procedimientos protegidos en tRPC
- ✅ Control de roles (admin/user)
- ✅ Variables de entorno para credenciales

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor

**Carlos** - [@Rosae5996](https://github.com/Rosae5996)

---

**¡Disfruta usando StreamFlix!** 🎬🍿
