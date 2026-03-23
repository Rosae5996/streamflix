# StreamFlix Mobile App

Aplicación móvil nativa para iOS y Android construida con React Native + Expo.

## Características

- ✅ Autenticación con Supabase (Email, Google, Apple)
- ✅ Catálogo de películas y series
- ✅ Búsqueda y filtrado de contenido
- ✅ Reproductor de video integrado
- ✅ Watchlist personal
- ✅ Historial de visualización
- ✅ Perfil de usuario
- ✅ Tema oscuro cinematográfico
- ✅ Interfaz completamente responsive

## Requisitos

- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

## Instalación

```bash
cd streamflix-mobile
npm install
```

## Desarrollo

### Ejecutar en desarrollo

```bash
npm start
```

Luego:
- Presiona `i` para abrir en iOS Simulator
- Presiona `a` para abrir en Android Emulator
- Escanea el código QR con la app Expo Go en tu dispositivo

## Compilación para Producción

### Android APK

```bash
eas build --platform android --type apk
```

El APK se descargará automáticamente y podrá ser instalado en cualquier dispositivo Android.

### iOS

```bash
eas build --platform ios
```

Esto creará un archivo .ipa que puede ser distribuido a través de TestFlight o la App Store.

## Estructura del Proyecto

```
streamflix-mobile/
├── app/
│   ├── (tabs)/           # Pantallas con navegación de tabs
│   │   ├── index.tsx     # Home
│   │   ├── browse.tsx    # Explorar
│   │   ├── watchlist.tsx # Mi Lista
│   │   └── profile.tsx   # Perfil
│   ├── auth/             # Pantallas de autenticación
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── watch.tsx         # Reproductor de video
│   └── _layout.tsx       # Layout raíz
├── lib/
│   └── supabase.ts       # Configuración de Supabase
├── hooks/
│   └── useAuth.ts        # Hook de autenticación
├── app.json              # Configuración de Expo
├── eas.json              # Configuración de compilación
└── package.json
```

## Variables de Entorno

Crea un archivo `.env.local` con:

```
EXPO_PUBLIC_SUPABASE_URL=https://weiiimfjzauwetanmmcg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Configuración de OAuth

### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto
3. Habilita Google Sign-In API
4. Crea credenciales OAuth 2.0
5. En Supabase, ve a Authentication → Providers → Google
6. Agrega el Client ID y Client Secret

### Apple OAuth

1. Ve a [Apple Developer](https://developer.apple.com)
2. Crea un App ID
3. Configura Sign in with Apple
4. En Supabase, ve a Authentication → Providers → Apple
5. Agrega el Service ID y otros datos requeridos

## Testing

```bash
npm test
```

## Troubleshooting

### Error: "Cannot find module 'expo-router'"

```bash
npm install expo-router
```

### Error: "Expo CLI not found"

```bash
npm install -g expo-cli
```

### El emulador no inicia

Asegúrate de que Android Studio o Xcode estén instalados y configurados correctamente.

## Distribución

### Google Play Store

1. Crea una cuenta en Google Play Console
2. Crea una aplicación
3. Genera un APK de producción: `eas build --platform android`
4. Carga el APK a Google Play Console

### Apple App Store

1. Crea una cuenta en Apple Developer
2. Crea un App ID
3. Genera un IPA de producción: `eas build --platform ios`
4. Carga el IPA a App Store Connect

## Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

## Licencia

MIT
