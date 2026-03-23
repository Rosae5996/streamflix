# Instrucciones de Compilación - StreamFlix Mobile

## Compilación para Android (APK)

### Opción 1: Usando EAS (Recomendado - En la nube)

**Ventajas:**
- No necesita Android SDK instalado localmente
- Compilación en servidores de Expo
- Más rápido y confiable

**Pasos:**

1. Instala EAS CLI:
```bash
npm install -g eas-cli
```

2. Inicia sesión en Expo:
```bash
eas login
```

3. Configura el proyecto (primera vez):
```bash
eas build --platform android --type apk --first-build
```

4. Compila el APK:
```bash
eas build --platform android --type apk
```

5. El APK se descargará automáticamente. Puedes instalarlo en tu dispositivo:
```bash
adb install streamflix-mobile-*.apk
```

### Opción 2: Compilación Local

**Requisitos:**
- Android SDK (API 33+)
- Java Development Kit (JDK 11+)
- Android NDK

**Pasos:**

1. Instala Expo CLI localmente:
```bash
npm install -g expo-cli
```

2. Compila el APK:
```bash
expo build:android -t apk
```

3. Espera a que se complete la compilación (puede tomar 10-15 minutos)

4. Descarga el APK del enlace proporcionado

## Compilación para iOS

### Opción 1: Usando EAS (Recomendado)

**Pasos:**

1. Compila el IPA:
```bash
eas build --platform ios
```

2. Selecciona "Release" cuando se te pida

3. El IPA se compilará en los servidores de Expo

4. Descarga el IPA y distribúyelo a través de:
   - TestFlight (para testing)
   - App Store (para producción)

### Opción 2: Compilación Local (Solo en Mac)

**Requisitos:**
- macOS
- Xcode 14+
- CocoaPods

**Pasos:**

1. Instala dependencias:
```bash
npm install
```

2. Compila para iOS:
```bash
expo build:ios
```

## Distribución

### Google Play Store

1. Crea una cuenta en [Google Play Console](https://play.google.com/console)

2. Crea una nueva aplicación

3. Completa los datos de la aplicación:
   - Nombre
   - Descripción
   - Capturas de pantalla
   - Icono

4. Carga el APK en "Versiones de Producción"

5. Completa el formulario de consentimiento

6. Envía para revisión

### Apple App Store

1. Crea una cuenta en [App Store Connect](https://appstoreconnect.apple.com)

2. Crea una nueva aplicación

3. Completa los datos de la aplicación

4. Carga el IPA usando Transporter

5. Completa el formulario de consentimiento

6. Envía para revisión

## Variables de Entorno para Compilación

Crea un archivo `.env` en la raíz del proyecto:

```
EXPO_PUBLIC_SUPABASE_URL=https://weiiimfjzauwetanmmcg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## Troubleshooting

### Error: "eas login required"
```bash
eas login
```

### Error: "Android SDK not found"
Instala Android Studio y configura las variables de entorno:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Error: "Xcode not found"
En macOS, instala Xcode desde la App Store

### El APK no instala en el dispositivo
Asegúrate de que:
- El dispositivo tiene Android 10+ (API 29+)
- Tienes suficiente espacio de almacenamiento
- Permites instalación de fuentes desconocidas

## Monitoreo de Compilación

Puedes ver el estado de tus compilaciones:

```bash
eas build:list
```

O en el dashboard de EAS: https://expo.dev/builds

## Notas Importantes

- La compilación inicial puede tomar 15-20 minutos
- Las compilaciones posteriores son más rápidas (caché)
- Asegúrate de tener una conexión a internet estable
- El APK/IPA se descargará automáticamente al completarse
- Puedes compilar múltiples versiones simultáneamente

## Soporte

Para más información, consulta:
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev)
