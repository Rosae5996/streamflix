#!/bin/bash

echo "🚀 StreamFlix Mobile - Compilación Automática"
echo "=============================================="
echo ""
echo "📋 Paso 1: Compilando APK para Android..."
echo "⏳ Esto puede tomar 15-20 minutos. Espera por favor..."
echo ""

# Compilar APK
eas build --platform android --type apk 2>&1 | tee build.log

# Extraer URL de descarga
APK_URL=$(grep -o "https://[^[:space:]]*\.apk" build.log | head -1)

if [ -n "$APK_URL" ]; then
    echo ""
    echo "✅ Compilación completada"
    echo "📥 Descargando APK..."
    
    wget -q -O /tmp/streamflix-mobile.apk "$APK_URL"
    
    if [ -f /tmp/streamflix-mobile.apk ]; then
        FILE_SIZE=$(du -h /tmp/streamflix-mobile.apk | cut -f1)
        echo "✅ APK descargado: $FILE_SIZE"
        echo ""
        
        echo "📤 Cargando a Google Drive en carpeta 'aplicación'..."
        
        # Subir a Google Drive
        gws drive files create --json '{"name":"streamflix-mobile.apk","parents":["1Akf7hZsC1v97rJiNurubRsCnT8c3LO61"]}' --upload /tmp/streamflix-mobile.apk --format json > /tmp/upload.json 2>&1
        
        if grep -q "id" /tmp/upload.json; then
            echo "✅ Archivo cargado exitosamente a Google Drive"
            echo ""
            echo "📍 Ubicación: aplicación/streamflix-mobile.apk"
            echo "📊 Tamaño: $FILE_SIZE"
            echo ""
            echo "🎉 ¡Compilación y carga completadas!"
            echo ""
            echo "📱 Próximos pasos:"
            echo "   1. Abre Google Drive"
            echo "   2. Ve a la carpeta 'aplicación'"
            echo "   3. Descarga streamflix-mobile.apk"
            echo "   4. Abre el archivo en tu dispositivo Android"
            echo "   5. Toca 'Instalar'"
        else
            echo "❌ Error al cargar a Google Drive"
            cat /tmp/upload.json
        fi
    else
        echo "❌ Error: No se pudo descargar el APK"
    fi
else
    echo "❌ Error en la compilación. Revisa el log:"
    tail -50 build.log
fi
