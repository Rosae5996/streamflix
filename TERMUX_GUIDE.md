# 📱 Guía de Compilación en Termux - StreamFlix Mobile

## Requisitos
- ✅ Termux instalado en tu celular (desde Google Play o F-Droid)
- ✅ Conexión a internet estable
- ✅ ~500 MB de espacio libre
- ✅ Tu cuenta de Expo (carlos2008)

## Paso 1: Preparar Termux

Abre Termux y ejecuta:

```bash
pkg update -y && pkg upgrade -y
```

## Paso 2: Instalar Node.js

```bash
pkg install -y nodejs npm
```

Verifica que funciona:
```bash
node --version
npm --version
```

## Paso 3: Instalar Git (opcional pero recomendado)

```bash
pkg install -y git
```

## Paso 4: Descargar StreamFlix Mobile

**Opción A: Desde GitHub (si tienes acceso)**
```bash
git clone https://github.com/tu-usuario/streamflix-mobile.git
cd streamflix-mobile
```

**Opción B: Desde Google Drive**
1. Descarga el archivo `streamflix-mobile.zip` desde Google Drive
2. En Termux:
```bash
cd ~/storage/downloads
unzip streamflix-mobile.zip
cd streamflix-mobile
```

## Paso 5: Instalar Dependencias

```bash
npm install
```

Esto puede tomar 5-10 minutos.

## Paso 6: Instalar EAS CLI Globalmente

```bash
npm install -g eas-cli
```

## Paso 7: Configurar Token de Expo

```bash
export EXPO_TOKEN="KyfdFDzhD3vsZY3dSM4Jh9mUh63r7c5nENbzU58N"
```

## Paso 8: Compilar el APK

```bash
eas build --platform android --wait
```

**⏳ Esto puede tomar 15-20 minutos. NO cierres Termux durante este tiempo.**

## Paso 9: Descargar el APK

Cuando termine, verás un mensaje con la URL del APK. El archivo se descargará automáticamente en:
```
~/storage/downloads/
```

## Paso 10: Instalar la App

1. Abre el Gestor de Archivos de tu celular
2. Ve a **Descargas**
3. Busca `streamflix-mobile.apk`
4. Toca el archivo
5. Toca **Instalar**
6. ¡Listo! Abre la app desde tu menú de aplicaciones

---

## 🆘 Solución de Problemas

### "command not found: npm"
```bash
pkg install -y nodejs npm
```

### "No space left on device"
Libera espacio en tu celular (necesitas ~500 MB)

### "EXPO_TOKEN no reconocido"
Ejecuta el comando exactamente como está:
```bash
export EXPO_TOKEN="KyfdFDzhD3vsZY3dSM4Jh9mUh63r7c5nENbzU58N"
```

### "Error de compilación"
Intenta nuevamente:
```bash
npm install
eas build --platform android --wait
```

### "¿Dónde está el APK?"
Busca en: `~/storage/downloads/`

---

## 📝 Notas Importantes

- **No cierres Termux** durante la compilación
- **Mantén internet conectado** durante todo el proceso
- La compilación es **lenta en celular**, espera pacientemente
- Si falla, intenta de nuevo (a veces es por conexión)

---

## ✅ Verificar Instalación

Una vez instalada, abre la app y verifica:
- ✅ Pantalla de login
- ✅ Opción de Google/Apple
- ✅ Catálogo de películas
- ✅ Reproductor de video

¡Listo! 🎉

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.
