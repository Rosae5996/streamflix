#!/bin/bash

echo "🚀 StreamFlix Mobile - Compilación Directa"
echo "=========================================="
echo ""
echo "📋 Compilando APK para Android..."
echo "⏳ Esto puede tomar 15-20 minutos. Por favor espera..."
echo ""

# Compilar APK directamente
eas build --platform android --wait 2>&1 | tee /tmp/build-full.log

# Extraer URL de descarga
APK_URL=$(grep -o "https://[^[:space:]]*\.apk" /tmp/build-full.log | head -1)

echo ""
echo "Resultado de compilación:"
echo "========================"

if [ -n "$APK_URL" ]; then
    echo "✅ URL de descarga encontrada: $APK_URL"
    echo ""
    echo "📥 Descargando APK..."
    
    if wget -q -O /tmp/streamflix-mobile.apk "$APK_URL"; then
        FILE_SIZE=$(du -h /tmp/streamflix-mobile.apk | cut -f1)
        echo "✅ APK descargado exitosamente"
        echo "📊 Tamaño: $FILE_SIZE"
        echo ""
        
        echo "📤 Cargando a Google Drive..."
        
        # Subir a Google Drive
        UPLOAD_RESULT=$(gws drive files create --json '{"name":"streamflix-mobile.apk","parents":["1Akf7hZsC1v97rJiNurubRsCnT8c3LO61"]}' --upload /tmp/streamflix-mobile.apk --format json 2>&1)
        
        if echo "$UPLOAD_RESULT" | grep -q "id"; then
            echo "✅ Archivo cargado a Google Drive exitosamente"
            echo ""
            echo "🎉 ¡COMPILACIÓN COMPLETADA!"
            echo ""
            echo "📍 Ubicación en Google Drive:"
            echo "   Carpeta: aplicación"
            echo "   Archivo: streamflix-mobile.apk"
            echo "   Tamaño: $FILE_SIZE"
            echo ""
            echo "📱 Próximos pasos para instalar:"
            echo "   1. Abre Google Drive en tu celular"
            echo "   2. Ve a la carpeta 'aplicación'"
            echo "   3. Descarga 'streamflix-mobile.apk'"
            echo "   4. Abre el archivo descargado"
            echo "   5. Toca 'Instalar'"
        else
            echo "❌ Error al cargar a Google Drive:"
            echo "$UPLOAD_RESULT"
        fi
    else
        echo "❌ Error al descargar el APK"
    fi
else
    echo "❌ Error: No se encontró URL de descarga"
    echo ""
    echo "Log de compilación (últimas 50 líneas):"
    echo "========================================"
    tail -50 /tmp/build-full.log
fi
