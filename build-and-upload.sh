#!/bin/bash

echo "🚀 Iniciando compilación de StreamFlix Mobile..."
echo ""

# Crear directorio temporal
mkdir -p /tmp/streamflix-build
cd /tmp/streamflix-build

# Copiar proyecto
cp -r /home/ubuntu/streamflix-mobile . 
cd streamflix-mobile

echo "📦 Instalando dependencias..."
npm install --production 2>&1 | tail -5

echo ""
echo "🔨 Compilando para Android APK..."
echo "Por favor, inicia sesión en Expo cuando se te pida..."
echo ""

# Crear APK
eas build --platform android --type apk --non-interactive 2>&1 | tee build.log

# Extraer URL de descarga
APK_URL=$(grep -o "https://.*\.apk" build.log | head -1)

if [ -n "$APK_URL" ]; then
    echo ""
    echo "✅ APK compilado exitosamente!"
    echo "📥 Descargando APK..."
    
    wget -O streamflix-mobile.apk "$APK_URL" 2>&1 | tail -3
    
    echo ""
    echo "📤 Subiendo a Google Drive..."
    
    # Crear carpeta en Google Drive si no existe
    gws mkdir -p "aplicación" 2>/dev/null || true
    
    # Subir archivo
    gws upload streamflix-mobile.apk "aplicación/streamflix-mobile.apk"
    
    echo "✅ Archivo guardado en Google Drive: aplicación/streamflix-mobile.apk"
else
    echo "❌ Error en la compilación. Revisa el log arriba."
fi

echo ""
echo "🎉 Proceso completado!"
